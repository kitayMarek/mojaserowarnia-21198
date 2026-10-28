-- =====================================================================
-- Identyfikator sklepu z huba w kulturach i kliknięciach (28.10.2026)
-- =====================================================================
-- Plan „Sklepy i oferty” (dokument huba), krok 4 i 7, po akceptacji listy
-- sklepów przez Marka 28.10.2026. Sklep ma jeden wpis w hubie danerolne.com,
-- a serwisy odwołują się do niego przez sklep_id (domena albo nazwa ze strony
-- sklepu). Kolumny shop i shop_url zostają do kroku 6: wtedy strony kultur
-- i MCP zaczną brać nazwę i adres sklepu z kopii sklepy_z_huba.
--
-- Mapowanie nazw z listy huba (commit 6027810 w C:\Moje\Hub). Skrypty cen
-- (gen-ceny-sql.py, gen-cultures-sql.py) wstawiają wiersze z samym shop,
-- dlatego sklep_id uzupełnia trigger. Nowy sklep = dopisać go tutaj.
--
-- URUCHOMIĆ w Supabase SQL editor (projekt Serowarni). Idempotentne.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.sklep_id_z_nazwy(_nazwa TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE _nazwa
    WHEN 'Lactic.pl'   THEN 'lactic.pl'
    WHEN 'Wańczykówka' THEN 'wanczykowka.com'
    WHEN 'Serowar.pl'  THEN 'serowar.pl'
    WHEN 'Artiser.pl'  THEN 'artiser.pl'
    WHEN 'GAP Poland'  THEN 'gappoland.com'
    WHEN 'Browin'      THEN 'browin.pl'
  END
$$;

-- ── cultures (krok 4) ───────────────────────────────────────────────────
ALTER TABLE public.cultures ADD COLUMN IF NOT EXISTS sklep_id TEXT;
UPDATE public.cultures SET sklep_id = public.sklep_id_z_nazwy(shop) WHERE sklep_id IS NULL;

CREATE OR REPLACE FUNCTION public.cultures_ustaw_sklep_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.sklep_id IS NULL OR (TG_OP = 'UPDATE' AND NEW.shop IS DISTINCT FROM OLD.shop) THEN
    NEW.sklep_id := COALESCE(public.sklep_id_z_nazwy(NEW.shop), NEW.sklep_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cultures_sklep_id ON public.cultures;
CREATE TRIGGER cultures_sklep_id
  BEFORE INSERT OR UPDATE ON public.cultures
  FOR EACH ROW EXECUTE FUNCTION public.cultures_ustaw_sklep_id();

-- ── culture_clicks (krok 7): serwis i sklep_id dla wspólnego zestawienia w hubie ──
ALTER TABLE public.culture_clicks
  ADD COLUMN IF NOT EXISTS serwis   TEXT NOT NULL DEFAULT 'mojaserowarnia.pl',
  ADD COLUMN IF NOT EXISTS sklep_id TEXT;
UPDATE public.culture_clicks SET sklep_id = public.sklep_id_z_nazwy(shop_name) WHERE sklep_id IS NULL;

CREATE OR REPLACE FUNCTION public.culture_clicks_ustaw_sklep_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.sklep_id IS NULL THEN
    NEW.sklep_id := public.sklep_id_z_nazwy(NEW.shop_name);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS culture_clicks_sklep_id ON public.culture_clicks;
CREATE TRIGGER culture_clicks_sklep_id
  BEFORE INSERT ON public.culture_clicks
  FOR EACH ROW EXECUTE FUNCTION public.culture_clicks_ustaw_sklep_id();

-- Kontrola po uruchomieniu (powinno być 0 w obu wierszach):
SELECT 'cultures bez sklep_id' AS co, count(*) FROM public.cultures WHERE sklep_id IS NULL
UNION ALL
SELECT 'culture_clicks bez sklep_id', count(*) FROM public.culture_clicks WHERE sklep_id IS NULL;
