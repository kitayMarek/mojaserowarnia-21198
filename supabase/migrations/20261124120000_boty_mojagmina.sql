-- =====================================================================
-- Licznik botów dla mojagmina.org, Moja Gmina (24.11.2026)
-- =====================================================================
-- Marek 24.11.2026: boty na mojagmina.org widać dotąd tylko w Cloudflare,
-- więc nie da się ich zestawić z resztą serwisów.
--
-- Czwarty bliźniak bot_visits, na tych samych zasadach co bot_visits_hub
-- (20261027220000_boty_danerolne.sql). Zapisuje Worker hub-gmina
-- (repo C:\Moje\MojaGmina, src/worker.js) tym samym worker/wizyty-botow.js.
-- Druga część dopisuje mojagmina.org do porownanie_botow (danerolne.com/boty).
--
-- ⚠ Nowa kolumna w bot_visits musi trafić też tutaj, do bot_visits_pasze
-- i bot_visits_hub.
--
-- URUCHOMIĆ w Supabase SQL editor (projekt Serowarni). Idempotentne.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.bot_visits_gmina (LIKE public.bot_visits INCLUDING ALL);

COMMENT ON TABLE public.bot_visits_gmina IS
  'Wizyty botów na mojagmina.org (od 24.11.2026). Bliźniak bot_visits (Serowarnia), bot_visits_pasze i bot_visits_hub: te same kolumny, weryfikacja i oznaczanie, osobno, żeby nie mieszać ruchu serwisów.';

-- RLS i uprawnienia jak w bot_visits: zapisuje tylko worker (service_role),
-- czyta tylko admin, rola anon nie ma dostępu wcale.
ALTER TABLE public.bot_visits_gmina ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view bot visits" ON public.bot_visits_gmina;
CREATE POLICY "Only admins can view bot visits"
ON public.bot_visits_gmina
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.bot_visits_gmina FROM anon;

-- Kategoria, typ ścieżki i ruch własny (test-marek): ta sama funkcja co w bot_visits.
DROP TRIGGER IF EXISTS oznacz_wizyte_bota_trg ON public.bot_visits_gmina;
CREATE TRIGGER oznacz_wizyte_bota_trg
  BEFORE INSERT ON public.bot_visits_gmina
  FOR EACH ROW EXECUTE FUNCTION public.oznacz_wizyte_bota();

-- Retencja 12 miesięcy, sprzątanie okazjonalne przy zapisie (wzór z bot_visits).
CREATE OR REPLACE FUNCTION public.cleanup_bot_visits_gmina()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.bot_visits_gmina
  WHERE odwiedzono < now() - INTERVAL '12 months';
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_cleanup_bot_visits_gmina()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF random() < 0.005 THEN
    PERFORM public.cleanup_bot_visits_gmina();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cleanup_bot_visits_gmina_on_insert ON public.bot_visits_gmina;
CREATE TRIGGER cleanup_bot_visits_gmina_on_insert
  AFTER INSERT ON public.bot_visits_gmina
  FOR EACH ROW EXECUTE FUNCTION public.trigger_cleanup_bot_visits_gmina();

REVOKE ALL ON FUNCTION public.cleanup_bot_visits_gmina()         FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trigger_cleanup_bot_visits_gmina() FROM PUBLIC, anon, authenticated;

-- Porównanie serwisów dla danerolne.com/boty: dochodzi mojagmina.org.
CREATE OR REPLACE FUNCTION public.porownanie_botow(_od DATE, _do DATE)
RETURNS TABLE (
  serwis        TEXT,
  dzien         DATE,
  kategoria     TEXT,
  operator      TEXT,
  bot           TEXT,
  zweryfikowany BOOLEAN,
  sciezka_typ   TEXT,
  kody          TEXT,
  wlasne        BOOLEAN,
  wizyt         BIGINT
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH wszystkie AS (
    SELECT 'mojaserowarnia.pl'::TEXT AS serwis, v.odwiedzono, v.kategoria, v.operator, v.bot, v.zweryfikowany, v.sciezka_typ, v.status, v.wlasne
    FROM public.bot_visits v
    UNION ALL
    SELECT 'mojapasza.com', v.odwiedzono, v.kategoria, v.operator, v.bot, v.zweryfikowany, v.sciezka_typ, v.status, v.wlasne
    FROM public.bot_visits_pasze v
    UNION ALL
    SELECT 'danerolne.com', v.odwiedzono, v.kategoria, v.operator, v.bot, v.zweryfikowany, v.sciezka_typ, v.status, v.wlasne
    FROM public.bot_visits_hub v
    UNION ALL
    SELECT 'mojagmina.org', v.odwiedzono, v.kategoria, v.operator, v.bot, v.zweryfikowany, v.sciezka_typ, v.status, v.wlasne
    FROM public.bot_visits_gmina v
  )
  SELECT
    w.serwis,
    (w.odwiedzono AT TIME ZONE 'UTC')::DATE,
    w.kategoria,
    w.operator,
    w.bot,
    w.zweryfikowany,
    w.sciezka_typ,
    CASE WHEN w.status < 300 THEN '2xx' WHEN w.status < 400 THEN '3xx' WHEN w.status < 500 THEN '4xx' ELSE '5xx' END,
    w.wlasne,
    count(*)
  FROM wszystkie w
  WHERE w.odwiedzono >= (_od::TIMESTAMP AT TIME ZONE 'UTC')
    AND w.odwiedzono <  ((_do + 1)::TIMESTAMP AT TIME ZONE 'UTC')
  GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9
$$;

COMMENT ON FUNCTION public.porownanie_botow(DATE, DATE) IS
  'Sumy wizyt botów czterech serwisów (bot_visits, bot_visits_pasze, bot_visits_hub, bot_visits_gmina) po dniach UTC, dla strony danerolne.com/boty. Tylko agregaty, bez IP, podpisów, ASN, krajów i ścieżek.';

REVOKE ALL ON FUNCTION public.porownanie_botow(DATE, DATE) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.porownanie_botow(DATE, DATE) TO service_role;
