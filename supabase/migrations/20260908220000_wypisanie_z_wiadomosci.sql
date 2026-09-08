-- Wypisanie sie z wiadomosci — bez logowania, jednym klknieciem.
--
-- ---------------------------------------------------------------------------
-- SKAD TA MIGRACJA
-- ---------------------------------------------------------------------------
-- Zgoda, ktora ludzie zaznaczali przy rejestracji, brzmi: "Wyrazam zgode na
-- otrzymywanie informacji marketingowych (...). Zgoda jest dobrowolna i mozna
-- ja wycofac w kazdej chwili."
--
-- Zgoda jest wazna: kwadracik jest domyslnie pusty, data zapisana, tresc jasna.
-- Brakuje jednej rzeczy — SPOSOBU WYCOFANIA. Obiecalismy "w kazdej chwili",
-- a w serwisie nie ma sciezki, ktora by to robila. Dopoki jej nie ma, nie
-- wolno wyslac ani jednej wiadomosci.
--
-- ⚠ WYPISANIE NIE MOZE WYMAGAC LOGOWANIA. Czlowiek, ktory chce przestac
-- dostawac maile, nie bedzie szukal hasla sprzed roku — a jesli nie znajdzie
-- przycisku, uzna wiadomosc za spam i zglosi ja. Jedno zgloszenie potrafi
-- zepsuc dostarczalnosc calej domeny.

-- ---------------------------------------------------------------------------
-- 1. TOKEN — adres wypisania, ktorego nie da sie zgadnac
-- ---------------------------------------------------------------------------
-- Losowy UUID per konto, staly. Nie jest to klucz do niczego innego: najgorsze,
-- co moze zrobic ktos, kto go pozna, to wypisac kogos z listy. Za to pozwala
-- wypisac sie BEZ logowania, czyli tak, jak to musi dzialac.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wypis_token UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS marketing_consent_withdrawn_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS marketing_consent_tresc TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_wypis_token_idx ON public.profiles (wypis_token);

COMMENT ON COLUMN public.profiles.wypis_token IS
  'Losowy identyfikator w odnosniku do wypisania sie. Pozwala wycofac zgode bez logowania. Nie daje dostepu do niczego poza wylaczeniem wysylki.';

COMMENT ON COLUMN public.profiles.marketing_consent_withdrawn_at IS
  'Kiedy zgoda zostala wycofana. Zapisujemy to tak samo jak date jej udzielenia — bez tego nie da sie wykazac, ze prosbe wykonano.';

COMMENT ON COLUMN public.profiles.marketing_consent_tresc IS
  'BRZMIENIE zgody, ktore czlowiek widzial, gdy ja zaznaczal. NULL u kont sprzed 8 wrzesnia 2026: wtedy tego nie zapisywalismy i nie bedziemy zgadywac wstecz. Od teraz zapisujemy, bo gdy tekst zgody kiedys sie zmieni, samo "tak" niczego nie dowodzi.';

-- ---------------------------------------------------------------------------
-- 2. WYPISANIE
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER, bo woła to anonim — czlowiek z odnosnika w mailu, ktory
-- nie jest zalogowany. Funkcja nie zwraca NICZEGO o koncie: ani czy token
-- istnieje, ani czyj jest. Odpowiedz jest zawsze taka sama, zeby adres
-- wypisania nie stal sie sposobem na sprawdzanie, kto jest na liscie.

CREATE OR REPLACE FUNCTION public.wypisz_z_wiadomosci(_token UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.profiles
  SET marketing_consent = false,
      marketing_consent_withdrawn_at = COALESCE(marketing_consent_withdrawn_at, now())
  WHERE wypis_token = _token
    AND marketing_consent;
  -- Celowo bez informacji zwrotnej: patrz komentarz wyzej.
END;
$$;

COMMENT ON FUNCTION public.wypisz_z_wiadomosci(UUID) IS
  'Wycofuje zgode na wiadomosci na podstawie tokenu z odnosnika. Dziala BEZ logowania i nie zdradza, czy token istnieje — inaczej strona wypisania stalaby sie narzedziem do sprawdzania, kto jest na liscie.';

REVOKE ALL ON FUNCTION public.wypisz_z_wiadomosci(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wypisz_z_wiadomosci(UUID) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. KOMU WOLNO WYSLAC — jedno miejsce prawdy
-- ---------------------------------------------------------------------------
-- Zeby nigdy nie zdarzylo sie, ze ktos sklada liste zapytaniem pisanym z reki
-- i zapomni o warunku. Funkcja jest SECURITY DEFINER i dostepna WYLACZNIE dla
-- roli serwisowej — anonim nie ma prawa zobaczyc adresow.

CREATE OR REPLACE FUNCTION public.lista_do_wysylki()
RETURNS TABLE (email TEXT, wypis_token UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT u.email::TEXT, p.wypis_token
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.marketing_consent
    AND p.marketing_consent_withdrawn_at IS NULL
    AND u.email IS NOT NULL
    AND u.email_confirmed_at IS NOT NULL;   -- adres potwierdzony przy rejestracji
$$;

COMMENT ON FUNCTION public.lista_do_wysylki() IS
  'Jedyne dopuszczalne zrodlo adresow do wysylki: zgoda aktywna, niewycofana, adres potwierdzony. Nie nadawac uprawnien anon ani authenticated.';

REVOKE ALL ON FUNCTION public.lista_do_wysylki() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   -- ile osob ma aktywna zgode:
--   select count(*) from public.lista_do_wysylki();
--
--   -- czy kazdy ma token:
--   select count(*) from public.profiles where wypis_token is null;   -- ma byc 0
