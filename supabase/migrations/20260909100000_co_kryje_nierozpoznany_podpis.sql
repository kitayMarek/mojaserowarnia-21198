-- Co naprawde kryje sie pod "(nierozpoznany podpis)".
--
-- ---------------------------------------------------------------------------
-- SKAD TO PYTANIE
-- ---------------------------------------------------------------------------
-- 9 wrzesnia 2026 kubelek "(nierozpoznany podpis)" ma 386 zadan na dobe
-- i jest najwiekszym wierszem w calym raporcie — wiekszym niz Googlebot.
--
-- Ale sam kubelek nic nie mowi. Trzysta osiemdziesiat szesc zadan to moze byc
-- TRZY narzedzia, ktorych nie mamy na liscie, albo TRZYSTA roznych skanerow.
-- To sa dwie zupelnie rozne sytuacje i prowadza do dwoch roznych decyzji:
-- w pierwszej dopisujemy trzy nazwy, w drugiej nie ma czego dopisywac.
--
-- Bez tego raportu jedyna dostepna odpowiedz brzmi "duzo", a to nie jest
-- odpowiedz.

-- ---------------------------------------------------------------------------
-- CO POKAZUJEMY, A CZEGO NIE
-- ---------------------------------------------------------------------------
-- Podpis SKRACAMY do 80 znakow i grupujemy. Pelny User-Agent bywa dlugi
-- i czasem zawiera adres URL wlasciciela bota — do rozpoznania nazwy wystarczy
-- poczatek, a krotszy ciag trudniej pomylic z danymi osobowymi.
--
-- Nadal NIE pokazujemy adresow IP. Numer sieci i kraj tak, bo opisuja
-- serwerownie, nie osobe — ta sama zasada co wszedzie indziej w tym liczniku.

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
  SELECT left(v.ua, 80),
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
  GROUP BY left(v.ua, 80)
  ORDER BY count(*) DESC
  LIMIT 100;
$fn$;

COMMENT ON FUNCTION public.pub_raport_nierozpoznane(TEXT) IS
  'Co kryje sie pod "(nierozpoznany podpis)" — podpisy skrocone do 80 znakow, pogrupowane. Odpowiada na pytanie, czy to kilka narzedzi spoza naszej listy, czy setki roznych skanerow. Kolumny prob_wrazliwych i proc_bledow odrozniaja jedno od drugiego: narzedzie czyta tresc, skaner szuka plikow konfiguracyjnych i zbiera bledy.';

REVOKE ALL ON FUNCTION public.pub_raport_nierozpoznane(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_nierozpoznane(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   select * from public.pub_raport_nierozpoznane('24h');
