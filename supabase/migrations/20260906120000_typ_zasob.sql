-- Nowy typ ścieżki `zasob` + naprawa raportu „czego szukali, a nie znaleźli".
--
-- ---------------------------------------------------------------------------
-- CO BYŁO ŹLE
-- ---------------------------------------------------------------------------
-- Raport `czego_nie_bylo` miał odpowiadać na pytanie „jakiej TREŚCI szukały
-- prawdziwe boty, a u nas jej nie ma" — czyli wskazywać luki merytoryczne.
-- Zamiast tego zapełnił się listą nieistniejących paczek JavaScriptu:
--
--     /assets/KefirDomowy-ByvIxTO3.js   3   Bingbot
--     /assets/card-B5WeWg5i.js          1   Googlebot
--     …i kilkadziesiąt podobnych
--
-- Dwie przyczyny, obie w bazie:
--
--   1. `typ_sciezki()` nie miała gdzie ich odłożyć. Gałąź 'kod' wymaga `.map$`,
--      więc zwykły `/assets/coś.js` przelatywał przez wszystkie warunki
--      i lądował w koszu 'inne' — a filtr raportu wyklucza tylko 'sekret',
--      'kod' i 'kanarek'.
--
--   2. Raport zliczał `status IN (404, 410)` jak jedno. To nie jest jedno:
--      worker oddaje na brakujące `/assets/*` kod **410 Gone**, i to jest
--      odpowiedź ŚWIADOMA — „tego pliku już nie ma i nie wracaj". Pokazywanie
--      jej pod nagłówkiem „czego szukali, a nie znaleźli" sugeruje lukę
--      w treści albo próbę włamania, a to ani jedno, ani drugie: to crawler
--      wracający po paczkę z poprzedniego wdrożenia. Vite nadaje przy każdym
--      buildzie nowe skróty w nazwach, więc każde wdrożenie unieważnia komplet
--      adresów assetów.
--
-- ---------------------------------------------------------------------------
-- CZEGO CELOWO NIE ROBIMY
-- ---------------------------------------------------------------------------
-- ⚠ Nasuwa się, żeby po prostu zaklasyfikować `/assets/*` jako 'kod'. NIE.
-- `zrodla_botow()` liczy `wrazliwe` jako `sciezka_typ IN ('sekret','kod')`,
-- a pięć takich trafień daje 5 punktów przy progu zgłoszenia 4. Googlebot
-- i Bingbot, które w jednej dobie pobierają kilkadziesiąt nieaktualnych paczek,
-- trafiłyby do widoku `bot_skany` i do codziennego alertu JAKO SKANERY.
-- To ta sama klasa fałszywych alarmów, którą usunęliśmy z Amazona, Meta
-- i Microsoftu migracją 20260906080000 — tyle że wprowadzona z powrotem.
--
-- Drugi skutek byłby merytoryczny: publiczna strona straciłaby swoje najmocniejsze
-- zdanie, bo „boty potwierdzone ani razu nie zapytały o kod ani o sekrety"
-- przestałoby być prawdą.
--
-- Hashowany bundel nie jest wyciekiem kodu — pobiera go przeglądarka każdego
-- odwiedzającego. Mapa źródeł (`.map`) owszem, i ta ZOSTAJE w kategorii 'kod'.

-- ---------------------------------------------------------------------------
-- 1. NOWA WARTOŚĆ `zasob`
-- ---------------------------------------------------------------------------

ALTER TABLE public.bot_visits DROP CONSTRAINT IF EXISTS bot_visits_sciezka_typ_chk;
ALTER TABLE public.bot_visits ADD CONSTRAINT bot_visits_sciezka_typ_chk
  CHECK (sciezka_typ IS NULL OR sciezka_typ IN
    ('sekret', 'kod', 'kanarek', 'tresc', 'techniczna', 'zasob', 'inne'));

COMMENT ON COLUMN public.bot_visits.sciezka_typ IS
  'sekret | kod | kanarek | tresc | techniczna | zasob | inne — czego bot szukał. `zasob` to statyczne pliki budowania i grafiki: publiczne z założenia, więc NIE liczą się jako wrażliwe. `kod` zostaje zarezerwowane dla map źródeł, które ujawniają źródło.';

CREATE OR REPLACE FUNCTION public.typ_sciezki(_sciezka TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
  SELECT CASE
    -- KANAREK pierwszy, bo leży pod /wewnetrzne/ i nie może wpaść do „inne".
    WHEN _sciezka LIKE '/wewnetrzne/%' THEN 'kanarek'

    WHEN _sciezka ~* '(\.env|\.git/|/config\.(json|ya?ml|php)|token\.json|-adminsdk\.json|local_settings\.py|appsettings\.json|\.npmrc|netlify\.toml|/actuator/|/laravel/|wp-login\.php|/graphql|/wp-includes/|/wp-admin/)'
      THEN 'sekret'

    -- MAPY ŹRÓDEŁ przed zasobami: `.map` ujawnia oryginalne źródło, więc jest
    -- wrażliwe, a zwykły bundel obok niego już nie. Kolejność tych dwóch
    -- warunków jest CAŁĄ różnicą między jednym a drugim.
    WHEN _sciezka ~* '(\.(js|ts|css)\.map$|^/assets/.*\.map$)' THEN 'kod'

    WHEN _sciezka ~* '^/(robots\.txt|llms\.txt|sitemap.*\.xml|favicon|humans\.txt|\.well-known/|[a-f0-9]{32}\.txt$)'
      THEN 'techniczna'

    -- ZASOBY: paczki budowania i grafiki. Publiczne z założenia — pobiera je
    -- przeglądarka każdego odwiedzającego. Po zmianie hashy przy wdrożeniu
    -- crawlery wracają po stare adresy i dostają 410; to normalne zużycie
    -- budżetu indeksowania, a nie sygnał o czymkolwiek.
    WHEN _sciezka ~* '^/assets/'
      OR _sciezka ~* '\.(js|mjs|css|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|pdf)$'
      THEN 'zasob'

    WHEN _sciezka = '/'
      OR _sciezka ~* '^/(przepisy|kultury|prawo|poradnik|poradniki|pasze|serowarnie|przepisy-kulinarne)'
      OR _sciezka ~* '\.html$'
      OR _sciezka ~* '^/(baza-kultur|slownik|mleko-do-sera|nieudany-ser|solenie-sera|wedzenie-sera|woskowanie-sera|dojrzewalnia-z-lodowki|bakterie-kultury|zamienniki-kultur|kto-produkuje-kultury|porownywarka-kultur|sery-wege|klasyka-serowarstwa|klecki-jakosc-mleka|licznerski|encyklopedia-serowarstwo|serowarstwo-staropolskie|serwatka-dla-zwierzat|wady-mleka-a-wady-sera|organizacja-serowarni|chlorek-wapnia-do-mleka|sila-podpuszczki|gdzie-kupic-podpuszczke|etykieta-rhd|faktura-vat-rr|kalkulator|boty-ai)'
      THEN 'tresc'

    ELSE 'inne'
  END;
$$;

COMMENT ON FUNCTION public.typ_sciezki(TEXT) IS
  'Klasyfikuje żądaną ścieżkę. KOLEJNOŚĆ WARUNKÓW MA ZNACZENIE: kanarek przed resztą, sekrety przed kodem, mapy źródeł przed zasobami, treść na końcu. Zamiana miejscami „kod" i „zasob" sprawiłaby, że każdy crawler pobierający nieaktualne paczki JS zostałby policzony jako pytający o pliki wrażliwe — czyli zgłoszony jako skaner.';

-- Przeliczenie całej historii jedną regułą. WHERE porównuje ze świeżym wynikiem,
-- więc migracja jest idempotentna i przy powtórce nie rusza ani jednego wiersza.
UPDATE public.bot_visits
SET sciezka_typ = public.typ_sciezki(sciezka)
WHERE sciezka_typ IS DISTINCT FROM public.typ_sciezki(sciezka);

-- ---------------------------------------------------------------------------
-- 2. RAPORT `czego_nie_bylo` — z powrotem o treści
-- ---------------------------------------------------------------------------
-- Dwie zmiany:
--   • wyłącznie `sciezka_typ = 'tresc'` (whitelista zamiast czarnej listy —
--     nowy typ ścieżki nie ma prawa wpaść tu sam z siebie),
--   • wyłącznie `status = 404`. Kod 410 to nasza świadoma odpowiedź „już tego
--     nie ma", a nie luka w treści; mieszanie ich w jednej kolumnie było
--     drugą połową tego samego błędu.
--
-- Raport ma znowu prawo być pusty — i pustka jest tu DOBRĄ wiadomością:
-- znaczy, że zweryfikowane boty znajdują wszystko, po co przychodzą.

CREATE OR REPLACE FUNCTION public.pub_raport_czego_nie_bylo(okres TEXT DEFAULT '30d')
RETURNS TABLE (
  sciezka  TEXT,
  prob     BIGINT,
  boty     TEXT[],
  ostatnio TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT v.sciezka,
         count(*),
         array_agg(DISTINCT v.bot),
         max(v.odwiedzono)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.zweryfikowany IS TRUE
    AND v.status = 404
    AND v.sciezka_typ = 'tresc'
    AND v.odwiedzono >= public.okres_od(okres)
  GROUP BY v.sciezka
  ORDER BY count(*) DESC
  LIMIT 200;
$$;

COMMENT ON FUNCTION public.pub_raport_czego_nie_bylo(TEXT) IS
  'Adresy TREŚCI, o które pytały zweryfikowane boty i dostały 404. Kandydaci na nową stronę albo na przekierowanie. Świadomie pomija 410 (nasze „już tego nie ma", głównie nieaktualne paczki budowania) oraz wszystkie typy ścieżek poza „tresc" — bo raport ma wskazywać luki merytoryczne, a nie zużycie budżetu indeksowania.';

-- ---------------------------------------------------------------------------
-- 3. SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   -- rozkład typów: `zasob` ma być niepusty, `inne` ma zmaleć
--   select sciezka_typ, count(*) from public.bot_visits group by 1 order by 2 desc;
--
--   -- raport ma być pusty albo zawierać wyłącznie adresy treści
--   select * from public.pub_raport_czego_nie_bylo('30d');
--
--   -- KONTROLA REGRESJI: żadna wyszukiwarka nie może wskoczyć do skanów
--   select asn, kraj, zadan, wrazliwe, punkty, powod from public.bot_skany;
