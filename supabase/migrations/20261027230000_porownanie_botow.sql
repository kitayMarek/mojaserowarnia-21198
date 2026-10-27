-- =====================================================================
-- Porównanie botów trzech serwisów dla strony danerolne.com/boty (27.10.2026)
-- =====================================================================
-- Marek 27.10.2026: strona na hubie, która porównuje boty na danerolne.com,
-- mojaserowarnia.pl i mojapasza.com. Czyta ją Worker hub-mcp (repo C:\Moje\Hub)
-- kluczem service_role; anon i authenticated nie mają dostępu.
--
-- Zwraca WYŁĄCZNIE SUMY (GROUP BY): dzień UTC, serwis, kategoria, operator,
-- bot, wynik weryfikacji, typ ścieżki, klasa kodu odpowiedzi i ruch własny.
-- Bez adresów IP, User-Agentów, ASN, krajów, pełnych ścieżek i godzin, tak jak
-- widoki pub_bot_* pod /boty-ai. Dodanie kolumny bez agregatu łamie tę zasadę.
--
-- ⚠ Nowa tabela bliźniacza bot_visits_* musi dojść tu jako kolejny UNION ALL.
--
-- URUCHOMIĆ w Supabase SQL editor (projekt Serowarni). Idempotentne.
-- =====================================================================

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
  'Sumy wizyt botów trzech serwisów (bot_visits, bot_visits_pasze, bot_visits_hub) po dniach UTC, dla strony danerolne.com/boty. Tylko agregaty, bez IP, podpisów, ASN, krajów i ścieżek.';

REVOKE ALL ON FUNCTION public.porownanie_botow(DATE, DATE) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.porownanie_botow(DATE, DATE) TO service_role;
