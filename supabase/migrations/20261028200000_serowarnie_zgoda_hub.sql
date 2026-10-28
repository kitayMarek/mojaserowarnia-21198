-- =====================================================================
-- Zgoda na pokazanie wizytówki serowarni w katalogu Dane Rolne (28.10.2026)
-- =====================================================================
-- Marek 28.10.2026 zaakceptował tekst zgody. Wizytówki /serowarnie zakładają
-- sami serowarze na kontach Serowarni, więc źródłem wpisu zostaje ta tabela,
-- a hub danerolne.com czyta kopię tylko tych wpisów, które mają zgodę na hub
-- (plan „Katalog firm w hubie” w dokumencie huba).
--
-- Zgoda jest odrębna od zgody na katalog Serowarni (zgoda_publikacja) i ma
-- datę, jak tamta. Hub pokazuje wpis tylko przy obu zgodach i statusie
-- 'opublikowany'.
--
-- URUCHOMIĆ w Supabase SQL editor (projekt Serowarni). Idempotentne.
-- =====================================================================

ALTER TABLE public.serowarnie
  ADD COLUMN IF NOT EXISTS zgoda_hub      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS zgoda_hub_data TIMESTAMPTZ;

COMMENT ON COLUMN public.serowarnie.zgoda_hub IS
  'Zgoda serowara na pokazanie wizytówki w katalogu Dane Rolne (danerolne.com). Odrębna od zgoda_publikacja.';

-- Zgoda zawsze z datą; wycofanie czyści datę (wzór: serowarnie_pilnuj_zgody).
CREATE OR REPLACE FUNCTION public.serowarnie_pilnuj_zgody_hub()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.zgoda_hub AND (OLD IS NULL OR NOT OLD.zgoda_hub) THEN
    NEW.zgoda_hub_data := now();
  END IF;

  IF NOT NEW.zgoda_hub THEN
    NEW.zgoda_hub_data := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS serowarnie_zgoda_hub ON public.serowarnie;
CREATE TRIGGER serowarnie_zgoda_hub
  BEFORE INSERT OR UPDATE ON public.serowarnie
  FOR EACH ROW EXECUTE FUNCTION public.serowarnie_pilnuj_zgody_hub();
