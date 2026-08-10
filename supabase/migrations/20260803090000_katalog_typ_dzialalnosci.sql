-- =====================================================================
-- KATALOG SEROWARNI — typ działalności zamiast sita regulacyjnego
--
-- Powód (uwagi Marka):
--   1. Ewidencję sprzedaży prowadzi u nas niewiele osób — to zbyt rzadki
--      sygnał, żeby na nim opierać weryfikację.
--   2. Nie każdy, kto robi ser, ma zgłoszone RHD. Gospodarstwa
--      agroturystyczne robią ser wyłącznie dla swoich gości i nadal są
--      prawdziwymi serowarniami.
--
-- BŁĄD DO NAPRAWY: dotychczasowa walidacja wymagała wskazania formy
-- SPRZEDAŻY. Gospodarstwo nieprowadzące sprzedaży nie miało czego
-- zaznaczyć i zostałoby zablokowane — czyli sito odcinało dokładnie tych,
-- których chcemy mieć w katalogu.
--
-- URUCHOMIĆ w Supabase SQL editor PO migracji 20260802140000.
-- =====================================================================

ALTER TABLE public.serowarnie
  ADD COLUMN IF NOT EXISTS typ_dzialalnosci TEXT
    CHECK (typ_dzialalnosci IN (
      'serowarnia',        -- produkuje i sprzedaje ser (RHD/MOL)
      'agroturystyka',     -- ser dla gości gospodarstwa, bez sprzedaży
      'sezonowa',          -- produkcja i sprzedaż okazjonalna/sezonowa
      'w-organizacji'      -- dopiero uruchamia produkcję
    ));

COMMENT ON COLUMN public.serowarnie.typ_dzialalnosci IS
  'Charakter dzialalnosci. Nie kazdy producent sera sprzedaje - agroturystyka robi ser dla gosci.';

-- Domyślny typ dla wpisów sprzed tej zmiany
UPDATE public.serowarnie
SET typ_dzialalnosci = 'serowarnia'
WHERE typ_dzialalnosci IS NULL;


-- ---------------------------------------------------------------------
-- Walidacja zgłoszenia — poprawiona
-- ---------------------------------------------------------------------
-- Kluczowa zmiana: nie wymagamy "formy sprzedaży", tylko wskazania
-- CO NAJMNIEJ JEDNEGO sposobu, w jaki można zetknąć się z serem —
-- kupić GO, spróbować na miejscu, zjeść w ramach pobytu, albo przyjechać
-- na warsztaty. Kolumna forma_sprzedazy przechowuje jedno i drugie.
CREATE OR REPLACE FUNCTION public.serowarnie_waliduj_zgloszenie()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('oczekuje', 'opublikowany') THEN

    IF NOT NEW.oswiadczenie_producent THEN
      RAISE EXCEPTION 'Katalog jest dla wytwarzajacych ser — wymagane oswiadczenie.';
    END IF;

    IF NEW.typ_dzialalnosci IS NULL THEN
      RAISE EXCEPTION 'Wskaz charakter dzialalnosci.';
    END IF;

    IF NEW.opis IS NULL OR length(trim(NEW.opis)) < 120 THEN
      RAISE EXCEPTION 'Opis musi miec co najmniej 120 znakow (jest %).',
        COALESCE(length(trim(NEW.opis)), 0);
    END IF;

    IF NEW.wojewodztwo IS NULL OR NEW.miejscowosc IS NULL
       OR length(trim(NEW.miejscowosc)) = 0 THEN
      RAISE EXCEPTION 'Podaj wojewodztwo i miejscowosc.';
    END IF;

    IF array_length(NEW.produkty, 1) IS NULL THEN
      RAISE EXCEPTION 'Podaj co najmniej jeden wytwarzany ser.';
    END IF;

    IF array_length(NEW.rodzaj_mleka, 1) IS NULL THEN
      RAISE EXCEPTION 'Zaznacz rodzaj mleka.';
    END IF;

    -- Nie "jak KUPIC", tylko "jak sie z tym serem zetknac".
    -- Agroturystyka zaznaczy degustacje albo posilki dla gosci.
    IF array_length(NEW.forma_sprzedazy, 1) IS NULL THEN
      RAISE EXCEPTION 'Zaznacz, w jaki sposob mozna spróbowac lub kupic Twoj ser.';
    END IF;

    IF COALESCE(NEW.telefon, '') = '' AND COALESCE(NEW.email_kontakt, '') = ''
       AND COALESCE(NEW.www, '') = '' AND COALESCE(NEW.facebook, '') = '' THEN
      RAISE EXCEPTION 'Podaj przynajmniej jeden kontakt.';
    END IF;

  END IF;

  RETURN NEW;
END;
$$;


-- ---------------------------------------------------------------------
-- Kolejka moderacji — sygnały jako KONTEKST, nie wyrok
-- ---------------------------------------------------------------------
-- WNI i ewidencja zostają, ale jako informacja pomocnicza. Ich brak nie
-- oznacza, że zgłaszający nie robi sera — agroturystyka nie ma obowiazku
-- rejestracji RHD, a ewidencje prowadzi u nas mala czesc uzytkownikow.
--
-- ⚠️ DROP przed CREATE jest KONIECZNY: dokładamy kolumnę typ_dzialalnosci
-- do RETURNS TABLE, a CREATE OR REPLACE nie potrafi zmienić typu zwracanego
-- ("cannot change return type of existing function"). DROP kasuje też
-- uprawnienia, dlatego GRANT niżej nadajemy ponownie.
DROP FUNCTION IF EXISTS public.serowarnie_do_moderacji();

CREATE FUNCTION public.serowarnie_do_moderacji()
RETURNS TABLE (
  id UUID, slug TEXT, nazwa TEXT, opis TEXT,
  wojewodztwo TEXT, miejscowosc TEXT,
  produkty TEXT[], rodzaj_mleka TEXT[], forma_sprzedazy TEXT[],
  telefon TEXT, email_kontakt TEXT, www TEXT, facebook TEXT,
  nr_weterynaryjny TEXT, status TEXT,
  typ_dzialalnosci TEXT,
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
    s.typ_dzialalnosci,
    p.email,
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
