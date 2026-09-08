-- Profil ma powstawac na serwerze, a nie w przegladarce.
--
-- ---------------------------------------------------------------------------
-- CO SIE STALO
-- ---------------------------------------------------------------------------
-- Profil tworzyl sie po stronie przegladarki, zaraz po rejestracji:
--
--   const { data } = await supabase.auth.signUp({ email, password });
--   if (data.user) await supabase.from("profiles").insert({ ... });
--
-- Przy WLACZONYM potwierdzaniu adresu signUp nie zwraca sesji — czlowiek ma
-- konto, ale nie jest zalogowany. Zapis szedl wiec jako anon, a regula dostepu
-- brzmi "TO authenticated", wiec go odrzucala. Blad trafial do console.error
-- w przegladarce uzytkownika, a on widzial "rejestracja udana".
--
-- SKUTEK, policzony 8 wrzesnia 2026: 28 kont w auth.users, 24 profile.
-- Trzy osoby zarejestrowaly sie po przenosinach (31 sierpnia 23:35, 1 wrzesnia
-- 13:11 i 13:15), potwierdzily adres, zalogowaly sie — i nie istnialy dla nas.
-- Nie bylo ich w adminie, nie bylo ich na liscie wysylkowej, a ich zgoda
-- marketingowa — jesli ja zaznaczyli — nie zostala nigdzie zapisana.
--
-- Czwarta rejestracja bylaby taka sama. To nie byl wypadek, tylko stan.

-- ---------------------------------------------------------------------------
-- 1. WYZWALACZ — profil powstaje razem z kontem
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _zgoda BOOLEAN := COALESCE((NEW.raw_user_meta_data ->> 'marketing_consent')::BOOLEAN, false);
BEGIN
  INSERT INTO public.profiles (
    id, email, firma_nazwa, nip, adres, telefon,
    marketing_consent, marketing_consent_date, marketing_consent_tresc
  )
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data ->> 'firma_nazwa', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'nip', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'adres', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'telefon', ''),
    _zgoda,
    CASE WHEN _zgoda THEN now() END,
    CASE WHEN _zgoda THEN NULLIF(NEW.raw_user_meta_data ->> 'marketing_consent_tresc', '') END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- ⚠ WYJATEK POLYKAMY CELOWO. Wyzwalacz na auth.users, ktory rzuci bledem,
  -- BLOKUJE REJESTRACJE — nikt nie zalozy konta, dopoki ktos tego nie zauwazy.
  -- Brak profilu jest zly; niemozliwosc zalozenia konta jest gorsza. Slad idzie
  -- do logow bazy, a zapytanie kontrolne na koncu tego pliku pokazuje rozjazd.
  RAISE WARNING 'handle_new_user_profile: % (%)', SQLERRM, NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

COMMENT ON FUNCTION public.handle_new_user_profile() IS
  'Tworzy profil razem z kontem, z danych przekazanych przy rejestracji (raw_user_meta_data). Dziala po stronie serwera, wiec nie zalezy od tego, czy uzytkownik ma juz sesje — a przy potwierdzaniu adresu nie ma jej jeszcze.';

-- ---------------------------------------------------------------------------
-- 2. NAPRAWA ISTNIEJACYCH — konta bez profilu
-- ---------------------------------------------------------------------------
-- ⚠ ZGODY NIE ZGADUJEMY. Nie wiemy, co ci ludzie zaznaczyli przy rejestracji,
-- bo zapis nigdy nie doszedl. marketing_consent zostaje false, a data i tresc
-- puste. Lepiej nie wyslac komus, kto sie zgodzil, niz wyslac komus, kto sie
-- nie zgodzil — pierwsze naprawi sam w ustawieniach, drugiego nie da sie cofnac.

INSERT INTO public.profiles (id, email, marketing_consent)
SELECT u.id, u.email, false
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   -- ma byc 0:
--   select count(*) from auth.users u
--   left join public.profiles p on p.id = u.id where p.id is null;
--
--   -- ile kont, ile profili (powinno sie zgadzac):
--   select (select count(*) from auth.users) as konta,
--          (select count(*) from public.profiles) as profile;
