-- =====================================================================
-- KATALOG SEROWARNI — sito na producentów
--
-- Powód: logują się także osoby korzystające wyłącznie z kalkulatora pasz
-- (drobiarze, hodowcy bydła). Katalog ma być wyłącznie dla producentów sera.
--
-- Sito jest dwustopniowe:
--   1. Wymagania treściowe po stronie bazy (CHECK) — niekompletny wpis
--      w ogóle nie może trafić do kolejki moderacji.
--   2. Moderacja przez admina — ostateczna decyzja.
--
-- URUCHOMIĆ w Supabase SQL editor PO migracji 20260802090000.
-- =====================================================================

-- Numer weterynaryjny (WNI) — najmocniejszy sygnał, że ktoś realnie
-- produkuje i sprzedaje ser. Opcjonalny, bo nie każdy zdążył się
-- zarejestrować, ale dla moderatora to kluczowa informacja.
ALTER TABLE public.serowarnie
  ADD COLUMN IF NOT EXISTS nr_weterynaryjny TEXT;

-- Deklaracja producenta — świadome oświadczenie, nie domysł systemu
ALTER TABLE public.serowarnie
  ADD COLUMN IF NOT EXISTS oswiadczenie_producent BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.serowarnie.nr_weterynaryjny IS
  'WNI nadany przez powiatowego lekarza weterynarii. Sygnal wiarygodnosci dla moderatora.';
COMMENT ON COLUMN public.serowarnie.oswiadczenie_producent IS
  'Uzytkownik oswiadczyl, ze produkuje ser. Warunek zgloszenia do katalogu.';


-- ---------------------------------------------------------------------
-- Wymagania treściowe przy zgłaszaniu do moderacji
-- ---------------------------------------------------------------------
-- Egzekwowane w bazie, nie tylko w formularzu — front da się obejść.
CREATE OR REPLACE FUNCTION public.serowarnie_waliduj_zgloszenie()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Sprawdzamy tylko przy zgłoszeniu lub publikacji; szkic może być pusty
  IF NEW.status IN ('oczekuje', 'opublikowany') THEN

    IF NOT NEW.oswiadczenie_producent THEN
      RAISE EXCEPTION 'Katalog jest dla producentow sera — wymagane oswiadczenie.';
    END IF;

    IF NEW.opis IS NULL OR length(trim(NEW.opis)) < 120 THEN
      RAISE EXCEPTION 'Opis musi miec co najmniej 120 znakow (jest %).',
        COALESCE(length(trim(NEW.opis)), 0);
    END IF;

    IF NEW.wojewodztwo IS NULL OR NEW.miejscowosc IS NULL
       OR length(trim(NEW.miejscowosc)) = 0 THEN
      RAISE EXCEPTION 'Podaj wojewodztwo i miejscowosc — bez tego wizytowka nie ma sensu.';
    END IF;

    IF array_length(NEW.produkty, 1) IS NULL THEN
      RAISE EXCEPTION 'Podaj co najmniej jeden wytwarzany ser.';
    END IF;

    IF array_length(NEW.rodzaj_mleka, 1) IS NULL THEN
      RAISE EXCEPTION 'Zaznacz rodzaj mleka.';
    END IF;

    IF array_length(NEW.forma_sprzedazy, 1) IS NULL THEN
      RAISE EXCEPTION 'Zaznacz, jak mozna kupic Twoj ser.';
    END IF;

    -- Musi być jakikolwiek sposób kontaktu, inaczej wizytówka jest bezużyteczna
    IF COALESCE(NEW.telefon, '') = '' AND COALESCE(NEW.email_kontakt, '') = ''
       AND COALESCE(NEW.www, '') = '' AND COALESCE(NEW.facebook, '') = '' THEN
      RAISE EXCEPTION 'Podaj przynajmniej jeden kontakt (telefon, e-mail, WWW lub Facebook).';
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS serowarnie_walidacja ON public.serowarnie;
CREATE TRIGGER serowarnie_walidacja
  BEFORE INSERT OR UPDATE ON public.serowarnie
  FOR EACH ROW EXECUTE FUNCTION public.serowarnie_waliduj_zgloszenie();


-- ---------------------------------------------------------------------
-- Widok dla moderatora — kolejka z sygnałami wiarygodności
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.serowarnie_do_moderacji()
RETURNS TABLE (
  id UUID, slug TEXT, nazwa TEXT, opis TEXT,
  wojewodztwo TEXT, miejscowosc TEXT,
  produkty TEXT[], rodzaj_mleka TEXT[], forma_sprzedazy TEXT[],
  telefon TEXT, email_kontakt TEXT, www TEXT, facebook TEXT,
  nr_weterynaryjny TEXT, status TEXT,
  email_konta TEXT,
  ma_ewidencje BOOLEAN,
  zarejestrowany TIMESTAMPTZ,
  zgloszony TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT
    s.id, s.slug, s.nazwa, s.opis,
    s.wojewodztwo, s.miejscowosc,
    s.produkty, s.rodzaj_mleka, s.forma_sprzedazy,
    s.telefon, s.email_kontakt, s.www, s.facebook,
    s.nr_weterynaryjny, s.status,
    p.email,
    -- Czy user faktycznie prowadzi u nas ewidencje sprzedazy?
    -- Mocny sygnal, ze to producent, a nie ktos od kalkulatora pasz.
    EXISTS (SELECT 1 FROM public.sales_records sr WHERE sr.user_id = s.user_id),
    p.created_at,
    s.updated_at
  FROM public.serowarnie s
  LEFT JOIN public.profiles p ON p.id = s.user_id
  ORDER BY
    CASE s.status WHEN 'oczekuje' THEN 0 WHEN 'opublikowany' THEN 1 ELSE 2 END,
    s.updated_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.serowarnie_do_moderacji() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.serowarnie_do_moderacji() TO authenticated;
