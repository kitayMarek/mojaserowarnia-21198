-- Kto naprawdę pobiera pliki techniczne — bot po bocie.
--
-- ---------------------------------------------------------------------------
-- SKĄD TO PYTANIE
-- ---------------------------------------------------------------------------
-- W dyskusji pod postem padło zdanie, że llms.txt jest zbędny. Nasze liczby
-- zdawały się to potwierdzać: 4 pobrania wobec 42 pobrań robots.txt.
--
-- Po uczciwym przeliczeniu na godzinę (llms.txt jest mierzalny dopiero od
-- 7.09 rano, robots.txt od 5.09) różnica wynosi 4,8x, a nie 10x. I co
-- ważniejsze: te 4 pobrania pochodzą od CZTERECH RÓŻNYCH BOTÓW. To nie jest
-- plik ignorowany — to plik szukany, tylko rzadziej.
--
-- Ale „ile razy" nie wystarcza do żadnego wniosku. Rozstrzyga PRZEZ KOGO:
--   • jeśli llms.txt pobierają crawlery dużych modeli — plik jest w obiegu
--     i zalecenie branżowe ma jakieś pokrycie,
--   • jeśli pobierają go wyłącznie narzędzia SEO i monitoring — jest atrapą,
--     którą czytają tylko ci, co go szukają zawodowo.
--
-- Dwie różne odpowiedzi, ta sama liczba pobrań. Bez tego widoku wybieralibyśmy
-- między nimi na wyczucie.
--
-- ---------------------------------------------------------------------------
-- CZEGO TEN WIDOK NIE ROZSTRZYGNIE — I TO TRZEBA POWIEDZIEĆ OD RAZU
-- ---------------------------------------------------------------------------
-- Nie odpowie na pytanie, czy llms.txt COKOLWIEK DAJE. Pokazuje pobrania, a nie
-- skutek pobrania. Żeby orzec, że plik działa albo nie działa, trzeba by dwóch
-- bliźniaczych serwisów — jednego z nim, drugiego bez — i porównania cytowań.
-- Takiego testu nie mamy i mieć nie będziemy.
--
-- Więc: ten widok pozwala powiedzieć „kto po niego przychodzi". NIE pozwala
-- powiedzieć „jest potrzebny" ani „jest zbędny". Kto tego nie rozróżni, popełni
-- dokładnie ten błąd, który cała ta strona wytyka innym — wniosek wykraczający
-- poza pomiar.

CREATE OR REPLACE FUNCTION public.pub_raport_pliki_techniczne(okres TEXT DEFAULT '7d')
RETURNS TABLE (
  sciezka   TEXT,
  bot       TEXT,
  operator  TEXT,
  kategoria TEXT,
  zadan     BIGINT,
  pierwszy  TIMESTAMPTZ,
  ostatni   TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT v.sciezka, v.bot, v.operator, v.kategoria,
         count(*), min(v.odwiedzono), max(v.odwiedzono)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.odwiedzono >= public.okres_od(okres)
    -- Zamknięta lista, nie wzorzec: te trzy pliki są przedmiotem sporu.
    -- Bez ograniczenia raport zalałyby żądania skanerów o pliki konfiguracyjne.
    AND v.sciezka IN ('/llms.txt', '/sitemap.xml', '/robots.txt')
  GROUP BY v.sciezka, v.bot, v.operator, v.kategoria
  ORDER BY v.sciezka, count(*) DESC;
$$;

COMMENT ON FUNCTION public.pub_raport_pliki_techniczne(TEXT) IS
  'Kto pobiera llms.txt, sitemap.xml i robots.txt — w rozbiciu na boty. Pokazuje POBRANIA, nie ich skutek: nie odpowiada na pytanie, czy plik cokolwiek daje, bo do tego trzeba by grupy kontrolnej. Rozróżnia natomiast dwie sytuacje, które przy samej liczbie pobrań wyglądają identycznie: plik czytany przez crawlery dużych modeli i plik czytany wyłącznie przez narzędzia SEO.';

REVOKE ALL ON FUNCTION public.pub_raport_pliki_techniczne(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_pliki_techniczne(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   select * from public.pub_raport_pliki_techniczne('24h');
--
--   Spodziewane: robots.txt od kilkunastu botów, llms.txt i sitemap.xml od
--   kilku. Kluczowe pytanie do odczytu: czy w wierszach llms.txt stoją
--   crawlery dużych modeli (kategoria ai_crawler), czy same narzędzia SEO.
