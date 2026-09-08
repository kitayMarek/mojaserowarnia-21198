-- Dwa braki, które zabolały przy porównaniu naszego licznika z panelem Cloudflare.
--
-- ---------------------------------------------------------------------------
-- SKĄD TE PYTANIA
-- ---------------------------------------------------------------------------
-- 8 września 2026 zestawiliśmy nasz licznik z panelem AI Crawl Control
-- Cloudflare, na tej samej domenie i w tym samym oknie 24 godzin:
--
--   operator      my    Cloudflare   stosunek
--   Google       123      181          1,5x
--   Microsoft     43       48          1,1x
--   Perplexity    39       60          1,5x
--   Meta          23       28          1,2x
--   Amazon        10       12          1,2x
--   Anthropic     18        9          0,5x
--   OpenAI        49      422          8,6x   <-- ???
--
-- Wszyscy mieszczą się w granicach 0,5–1,5x. OpenAI odstaje ośmiokrotnie.
-- To jest ważne, bo GDYBY TO BYŁA DZIURA W NASZYM LICZNIKU, dotyczyłaby
-- wszystkich równo — pliki statyczne omijają workera niezależnie od tego, kto
-- o nie pyta. Skoro dotyczy jednego operatora, przyczyna jest gdzie indziej.
--
-- Hipoteza, której nie umiemy dziś sprawdzić: część ruchu, który u nas trafia
-- do „(bez podpisu)", Cloudflare rozpoznaje po adresie IP i przypisuje OpenAI.
-- Nasz licznik patrzy najpierw na nazwę; gdy jej nie ma, nie pyta dalej.
--
-- Żeby to rozstrzygnąć, trzeba zobaczyć, Z JAKICH SIECI przychodzi ruch bez
-- podpisu. Jeśli wśród nich są sieci OpenAI — hipoteza potwierdzona i mamy
-- realną lukę metodyczną do opisania. Jeśli nie ma — różnica leży po stronie
-- panelu i to też jest wynik wart opublikowania.

-- ---------------------------------------------------------------------------
-- 1. SKĄD PRZYCHODZI RUCH BEZ PODPISU
-- ---------------------------------------------------------------------------
-- Numer sieci i kraj, bez adresów IP — tak jak wszędzie indziej w tym liczniku.
-- ASN opisuje serwerownię, nie człowieka.

CREATE OR REPLACE FUNCTION public.pub_raport_bez_podpisu_sieci(okres TEXT DEFAULT '24h')
RETURNS TABLE (
  asn             INTEGER,
  kraj            TEXT,
  zadan           BIGINT,
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
AS $$
  SELECT v.asn, v.kraj,
         count(*),
         count(DISTINCT v.sciezka),
         round(100.0 * count(*) FILTER (WHERE v.status >= 400) / count(*), 1),
         count(*) FILTER (WHERE v.sciezka_typ IN ('sekret', 'kod', 'kanarek')),
         min(v.odwiedzono),
         max(v.odwiedzono)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.bot = '(bez podpisu)'
    AND v.odwiedzono >= public.okres_od(okres)
  GROUP BY v.asn, v.kraj
  ORDER BY count(*) DESC
  LIMIT 100;
$$;

COMMENT ON FUNCTION public.pub_raport_bez_podpisu_sieci(TEXT) IS
  'Z jakich sieci przychodzi ruch, który nie przedstawia się żadną nazwą. Bez adresów IP — sam numer sieci i kraj, bo opisują serwerownię, nie osobę. Kolumna prob_wrazliwych odróżnia skaner od czytelnika: skaner ma jej dużo i wysoki odsetek błędów.';

REVOKE ALL ON FUNCTION public.pub_raport_bez_podpisu_sieci(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_bez_podpisu_sieci(TEXT) TO anon, authenticated;


-- ---------------------------------------------------------------------------
-- 2. PLIKI TECHNICZNE — TERAZ Z WERDYKTEM WERYFIKACJI
-- ---------------------------------------------------------------------------
-- Wczorajszy raport pokazywał, KTO pobiera llms.txt, ale nie mówił, czy to
-- prawdziwy bot, czy podszywacz. Przy sporze o sens tego pliku różnica jest
-- zasadnicza: jedyne niezależne pobranie mieliśmy od Amazonbota, którego
-- 110 żądań dzieli się na 26 zweryfikowanych i 84 nierozstrzygnięte — więc
-- „prawdziwy Amazonbot pobrał llms.txt" było zdaniem, którego nie mogliśmy
-- postawić ani obalić.

DROP FUNCTION IF EXISTS public.pub_raport_pliki_techniczne(TEXT);

CREATE OR REPLACE FUNCTION public.pub_raport_pliki_techniczne(okres TEXT DEFAULT '7d')
RETURNS TABLE (
  sciezka       TEXT,
  bot           TEXT,
  operator      TEXT,
  kategoria     TEXT,
  zweryfikowany BOOLEAN,
  metoda        TEXT,
  zadan         BIGINT,
  pierwszy      TIMESTAMPTZ,
  ostatni       TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT v.sciezka, v.bot, v.operator, v.kategoria,
         v.zweryfikowany, v.metoda_weryfikacji,
         count(*), min(v.odwiedzono), max(v.odwiedzono)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.odwiedzono >= public.okres_od(okres)
    AND v.sciezka IN ('/llms.txt', '/sitemap.xml', '/robots.txt')
  GROUP BY v.sciezka, v.bot, v.operator, v.kategoria,
           v.zweryfikowany, v.metoda_weryfikacji
  ORDER BY v.sciezka, count(*) DESC;
$$;

COMMENT ON FUNCTION public.pub_raport_pliki_techniczne(TEXT) IS
  'Kto pobiera llms.txt, sitemap.xml i robots.txt, z werdyktem weryfikacji tożsamości. Pokazuje POBRANIA, nie ich skutek — nie odpowiada, czy plik cokolwiek daje, bo do tego trzeba by grupy kontrolnej.';

REVOKE ALL ON FUNCTION public.pub_raport_pliki_techniczne(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_pliki_techniczne(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   -- czy ruch bez podpisu przychodzi z sieci OpenAI?
--   select * from public.pub_raport_bez_podpisu_sieci('24h');
--
--   -- czy llms.txt pobral prawdziwy bot, czy podszywacz?
--   select * from public.pub_raport_pliki_techniczne('7d') where sciezka = '/llms.txt';
