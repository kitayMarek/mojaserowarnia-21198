-- Dwa pytania, ktorych dotad nie umielismy zadac bazie.
--
-- ---------------------------------------------------------------------------
-- SKAD TE PYTANIA
-- ---------------------------------------------------------------------------
-- Nasze raporty licza ZADANIA. Tymczasem jedno wejscie modelu to nie jedno
-- zadanie: 8 wrzesnia 2026 zobaczylismy 101 zadan na 101 roznych adresow,
-- bez bledu, w 26 minut, z jednej sieci. To nie jest sto odwiedzin. To jedna,
-- ktora rozgalezila sie w srodku.
--
-- Z zewnatrz sesji nie widac — widac pukania do drzwi. Ale da sie ja odtworzyc
-- z przerw miedzy zadaniami, i wtedy padaja dwa pytania ciekawsze od samej
-- liczby zadan:
--
--   1. CZYM WCHODZA. Bot zaczynajacy od robots.txt albo sitemapy przeglada
--      serwis systematycznie. Bot ladujacy od razu na artykule w srodku
--      przyszedl z INDEKSU — ktos go tam skierowal. To sa dwa rozne zjawiska
--      i dotad wpadaly do jednej sumy.
--
--   2. ILE ZADAN ROBI JEDNO WEJSCIE. Mnoznik. Bez niego kazde porownanie
--      z cudzym licznikiem jest porownaniem dwoch roznych jednostek.
--
-- ---------------------------------------------------------------------------
-- CZEGO TE RAPORTY NIE MOGA
-- ---------------------------------------------------------------------------
-- Nie zapisujemy adresow IP ani identyfikatora sesji (i nie zamierzamy).
-- Sesje sklejamy wiec po czworce: nazwa bota, numer sieci, kraj, podpis —
-- plus przerwa dluzsza niz zadany prog. To jest PRZYBLIZENIE i myli w dwie
-- strony:
--   - dwa rozne agenty z tej samej serwerowni w tej samej chwili zleja sie
--     w jedna sesje (zawyzenie mnoznika),
--   - jedno wejscie z przerwa na namysl dluzsza niz prog rozpadnie sie na dwie
--     (zanizenie).
-- Czyli: to jest RZAD WIELKOSCI, nie pomiar. Kto poda te liczby jako pomiar,
-- powtorzy blad, ktory sami opisujemy w docs/pulapki.md.

-- ---------------------------------------------------------------------------
-- Wspolna czesc: odtworzenie sesji
-- ---------------------------------------------------------------------------
-- 15 minut wzielo sie stad, ze w naszej wlasnej, ZNANEJ sesji testowej
-- (7 wrzesnia, Claude-User) typowa przerwa byla ponizej minuty, a jedna
-- wyniosla 33 minuty. Progu nie da sie ustawic dobrze dla obu przypadkow
-- naraz — wybieramy zanizanie, bo myli w strone ostrozniejsza.

CREATE OR REPLACE FUNCTION public.bot_sesje_okna(okres TEXT, przerwa INTERVAL DEFAULT '15 minutes')
RETURNS TABLE (
  bot        TEXT,
  operator   TEXT,
  asn        INTEGER,
  kraj       TEXT,
  sesja      BIGINT,
  sciezka    TEXT,
  odwiedzono TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $fn$
  WITH pod_reka AS (
    SELECT v.bot, v.operator, v.asn, v.kraj, v.ua, v.sciezka, v.odwiedzono
    FROM public.bot_visits v
    WHERE NOT v.wlasne
      AND v.odwiedzono >= public.okres_od(okres)
  ),
  granice AS (
    SELECT p.*,
           CASE
             WHEN lag(p.odwiedzono) OVER w IS NULL THEN 1
             WHEN p.odwiedzono - lag(p.odwiedzono) OVER w > przerwa THEN 1
             ELSE 0
           END AS nowa
    FROM pod_reka p
    WINDOW w AS (PARTITION BY p.bot, p.asn, p.kraj, p.ua ORDER BY p.odwiedzono)
  )
  SELECT g.bot, g.operator, g.asn, g.kraj,
         sum(g.nowa) OVER (PARTITION BY g.bot, g.asn, g.kraj, g.ua ORDER BY g.odwiedzono)::BIGINT,
         g.sciezka, g.odwiedzono
  FROM granice g;
$fn$;

COMMENT ON FUNCTION public.bot_sesje_okna(TEXT, INTERVAL) IS
  'Surowe wizyty z doklejonym numerem sesji, sklejonym po (bot, ASN, kraj, podpis) i przerwie. Przyblizenie, nie pomiar — patrz naglowek migracji. Sluzy dwom raportom nizej.';

-- ---------------------------------------------------------------------------
-- 1. CZYM WCHODZA — pierwsze zadanie kazdej sesji
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.pub_raport_czym_wchodza(okres TEXT DEFAULT '7d')
RETURNS TABLE (
  bot           TEXT,
  operator      TEXT,
  wejscie       TEXT,
  wejscie_typ   TEXT,
  sesji         BIGINT,
  zadan_lacznie BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $fn$
  WITH s AS (SELECT * FROM public.bot_sesje_okna(okres)),
  pierwsze AS (
    SELECT DISTINCT ON (s.bot, s.asn, s.kraj, s.sesja)
           s.bot, s.operator, s.asn, s.kraj, s.sesja, s.sciezka AS wejscie
    FROM s
    ORDER BY s.bot, s.asn, s.kraj, s.sesja, s.odwiedzono
  ),
  wielkosc AS (
    SELECT s.bot, s.asn, s.kraj, s.sesja, count(*) AS zadan
    FROM s GROUP BY s.bot, s.asn, s.kraj, s.sesja
  )
  SELECT p.bot, p.operator, p.wejscie, public.typ_sciezki(p.wejscie),
         count(*), sum(w.zadan)
  FROM pierwsze p
  JOIN wielkosc w
    ON w.bot = p.bot AND w.asn IS NOT DISTINCT FROM p.asn
   AND w.kraj IS NOT DISTINCT FROM p.kraj AND w.sesja = p.sesja
  GROUP BY p.bot, p.operator, p.wejscie
  ORDER BY count(*) DESC, sum(w.zadan) DESC
  LIMIT 200;
$fn$;

COMMENT ON FUNCTION public.pub_raport_czym_wchodza(TEXT) IS
  'Od czego bot ZACZYNA wizyte. Wejscie przez robots.txt lub sitemape znaczy przegladanie systematyczne; wejscie od razu w artykul w srodku znaczy, ze bot przyszedl z indeksu — czyli ze ktos juz nasza strone gdzies mial. Dla GEO to rozroznienie jest wazniejsze niz sama liczba zadan.';

REVOKE ALL ON FUNCTION public.pub_raport_czym_wchodza(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_czym_wchodza(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. MNOZNIK — ile zadan robi jedno wejscie
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.pub_raport_mnoznik(okres TEXT DEFAULT '7d')
RETURNS TABLE (
  bot             TEXT,
  operator        TEXT,
  sesji           BIGINT,
  zadan           BIGINT,
  zadan_na_sesje  NUMERIC,
  najdluzsza      BIGINT,
  mediana_trwania INTERVAL
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $fn$
  WITH s AS (SELECT * FROM public.bot_sesje_okna(okres)),
  per_sesja AS (
    SELECT s.bot, s.operator, s.asn, s.kraj, s.sesja,
           count(*) AS zadan,
           max(s.odwiedzono) - min(s.odwiedzono) AS trwanie
    FROM s GROUP BY s.bot, s.operator, s.asn, s.kraj, s.sesja
  )
  SELECT p.bot, p.operator,
         count(*), sum(p.zadan),
         round(sum(p.zadan)::NUMERIC / count(*), 1),
         max(p.zadan),
         percentile_cont(0.5) WITHIN GROUP (ORDER BY p.trwanie)
  FROM per_sesja p
  GROUP BY p.bot, p.operator
  ORDER BY sum(p.zadan) DESC;
$fn$;

COMMENT ON FUNCTION public.pub_raport_mnoznik(TEXT) IS
  'Ile zadan przypada na jedno wejscie. Bez tej liczby porownanie naszego licznika z cudzym jest porownaniem dwoch roznych jednostek: my liczymy pukania do drzwi, ktos inny moze liczyc sesje. Przyblizenie — patrz naglowek migracji.';

REVOKE ALL ON FUNCTION public.pub_raport_mnoznik(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_mnoznik(TEXT) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.bot_sesje_okna(TEXT, INTERVAL) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bot_sesje_okna(TEXT, INTERVAL) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   select * from public.pub_raport_czym_wchodza('7d') limit 30;
--   select * from public.pub_raport_mnoznik('7d');
