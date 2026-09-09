-- Poprawka do pub_raport_nierozpoznane: podpis skracany na 160, nie 80 znakach.
--
-- Pierwsza wersja obcinala na 80 i w pierwszym odczycie ukryla dokladnie to,
-- po co ten raport powstal. Drugi co do wielkosci wiersz wygladal tak:
--
--   Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compati   66 zadan
--
-- ...a nazwa bota stoi w takim podpisie PO slowie "compatible", czyli tuz za
-- miejscem ciecia. 66 zadan na 66 sciezek bez ani jednego bledu to zachowanie
-- porzadnego crawlera, tylko nie wiadomo czyjego.
--
-- 160 znakow miesci nazwe i adres kontaktowy operatora, a nadal nie jest
-- calym podpisem — te dlugie i tak sluza glownie do udawania przegladarki.

CREATE OR REPLACE FUNCTION public.pub_raport_nierozpoznane(okres TEXT DEFAULT '7d')
RETURNS TABLE (
  podpis          TEXT,
  zadan           BIGINT,
  roznych_sieci   BIGINT,
  kraje           TEXT[],
  roznych_sciezek BIGINT,
  proc_bledow     NUMERIC,
  prob_wrazliwych BIGINT,
  pierwszy        TIMESTAMPTZ,
  ostatni         TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $fn$
  SELECT left(v.ua, 160),
         count(*),
         count(DISTINCT v.asn),
         array_agg(DISTINCT v.kraj) FILTER (WHERE v.kraj IS NOT NULL),
         count(DISTINCT v.sciezka),
         round(100.0 * count(*) FILTER (WHERE v.status >= 400) / count(*), 1),
         count(*) FILTER (WHERE v.sciezka_typ IN ('sekret', 'kod', 'kanarek')),
         min(v.odwiedzono),
         max(v.odwiedzono)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.bot = '(nierozpoznany podpis)'
    AND v.odwiedzono >= public.okres_od(okres)
  GROUP BY left(v.ua, 160)
  ORDER BY count(*) DESC
  LIMIT 100;
$fn$;

REVOKE ALL ON FUNCTION public.pub_raport_nierozpoznane(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_nierozpoznane(TEXT) TO anon, authenticated;
