-- =====================================================================
-- Licznik botów dla danerolne.com, hub Dane Rolne (27.10.2026)
-- =====================================================================
-- Marek 27.10.2026, przy starcie huba: licznik botów AI od pierwszej minuty
-- domeny, żeby porównywać hub z Serowarnią i Mojapaszą.
--
-- Trzeci bliźniak bot_visits, na tych samych zasadach co bot_visits_pasze
-- (20261027200000_boty_mojapasza.sql): osobna tabela, a nie kolumna serwis,
-- bo widoki i funkcje na bot_visits liczą ruch Serowarni. Zapisuje Worker
-- hub-mcp (repo C:\Moje\Hub, worker/src/boty.js) tym samym
-- worker/wizyty-botow.js. Wywołań MCP na danerolne.com/mcp tu nie ma: te są
-- w tabeli wywolania w bazie huba.
--
-- ⚠ Nowa kolumna w bot_visits musi trafić też tutaj i do bot_visits_pasze.
--
-- URUCHOMIĆ w Supabase SQL editor (projekt Serowarni). Idempotentne.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.bot_visits_hub (LIKE public.bot_visits INCLUDING ALL);

COMMENT ON TABLE public.bot_visits_hub IS
  'Wizyty botów na danerolne.com, hubie Dane Rolne (od 27.10.2026). Bliźniak bot_visits (Serowarnia) i bot_visits_pasze: te same kolumny, weryfikacja i oznaczanie, osobno, żeby nie mieszać ruchu serwisów.';

-- RLS i uprawnienia jak w bot_visits: zapisuje tylko worker (service_role),
-- czyta tylko admin, rola anon nie ma dostępu wcale.
ALTER TABLE public.bot_visits_hub ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view bot visits" ON public.bot_visits_hub;
CREATE POLICY "Only admins can view bot visits"
ON public.bot_visits_hub
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.bot_visits_hub FROM anon;

-- Kategoria, typ ścieżki i ruch własny (test-marek): ta sama funkcja co w bot_visits.
DROP TRIGGER IF EXISTS oznacz_wizyte_bota_trg ON public.bot_visits_hub;
CREATE TRIGGER oznacz_wizyte_bota_trg
  BEFORE INSERT ON public.bot_visits_hub
  FOR EACH ROW EXECUTE FUNCTION public.oznacz_wizyte_bota();

-- Retencja 12 miesięcy, sprzątanie okazjonalne przy zapisie (wzór z bot_visits).
CREATE OR REPLACE FUNCTION public.cleanup_bot_visits_hub()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.bot_visits_hub
  WHERE odwiedzono < now() - INTERVAL '12 months';
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_cleanup_bot_visits_hub()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF random() < 0.005 THEN
    PERFORM public.cleanup_bot_visits_hub();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cleanup_bot_visits_hub_on_insert ON public.bot_visits_hub;
CREATE TRIGGER cleanup_bot_visits_hub_on_insert
  AFTER INSERT ON public.bot_visits_hub
  FOR EACH ROW EXECUTE FUNCTION public.trigger_cleanup_bot_visits_hub();

REVOKE ALL ON FUNCTION public.cleanup_bot_visits_hub()         FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trigger_cleanup_bot_visits_hub() FROM PUBLIC, anon, authenticated;
