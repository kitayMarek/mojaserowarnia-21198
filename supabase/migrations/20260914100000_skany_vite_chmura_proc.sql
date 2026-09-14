-- Typ ścieżki: luka serwera deweloperskiego Vite, klucze do chmury, zmienne procesu.
--
-- ---------------------------------------------------------------------------
-- SKĄD TA ZMIANA
-- ---------------------------------------------------------------------------
-- 14 września 2026 Krzysztof Balicki (Web Systems) przysłał wynik z logów swoich
-- serwerów: połowa żądań z adresów Google Cloud, które udają naraz cztery boty,
-- to /@fs/...?raw?? (odczyt plików przez serwer deweloperski Vite),
-- .aws/credentials, pliki gcloud i /proc/self/environ. Nasz wzorzec łapał z tego
-- tylko .env i config.json.
--
-- Reszta lądowała w 'inne', więc nie liczyła się jako pytanie o pliki wrażliwe:
-- ani w punktacji skanów (bot_skany), ani w raportach ruchu bez podpisu, ani
-- w raporcie „Czego szukały skanery".
--
-- ---------------------------------------------------------------------------
-- CO ZMIENIAMY
-- ---------------------------------------------------------------------------
--   1. typ_sciezki(): cztery wzorce więcej w gałęzi 'sekret'. Funkcja przepisana
--      z 20260906120000_typ_zasob.sql, czyli z ostatniej wersji; poza gałęzią
--      'sekret' nic się nie zmienia. 10 września migracja zbudowana na starszej
--      definicji zgubiła na trzy dni typ ścieżki, stąd ta uwaga.
--   2. pub_raport_czego_szukaja(): trzy nowe kategorie. /@fs/ stoi PRZED .env,
--      bo /@fs/home/app/.env to ta sama luka Vite, a nie zwykłe pytanie o .env.
--   3. Przeliczenie historii, idempotentne jak w 20260906120000.
--
-- ⚠ Licznik zapisuje samą ścieżkę (url.pathname), bez parametrów, więc ?raw??
--   do bazy nie trafia. Rozpoznajemy po początku /@fs/: tego prefiksu nie ma
--   żadna treść, to wewnętrzny adres serwera deweloperskiego Vite.
--
-- Worker dostał te same wzorce w SCIEZKA_SKANERA: /@fs/ i /proc/ dostawały
-- dotąd aplikację React z kodem 200 zamiast 404. .aws/ i .config/gcloud/ łapała
-- już reguła katalogów kropkowych.

-- ---------------------------------------------------------------------------
-- 1. TYP ŚCIEŻKI
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.typ_sciezki(_sciezka TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
  SELECT CASE
    -- KANAREK pierwszy, bo leży pod /wewnetrzne/ i nie może wpaść do „inne".
    WHEN _sciezka LIKE '/wewnetrzne/%' THEN 'kanarek'

    -- 14.09.2026 dopisane na końcu: ^/@fs/ (Vite), \.aws/, gcloud, /proc/self/.
    WHEN _sciezka ~* '(\.env|\.git/|/config\.(json|ya?ml|php)|token\.json|-adminsdk\.json|local_settings\.py|appsettings\.json|\.npmrc|netlify\.toml|/actuator/|/laravel/|wp-login\.php|/graphql|/wp-includes/|/wp-admin/|^/@fs/|\.aws/|gcloud|/proc/self/)'
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

-- ---------------------------------------------------------------------------
-- 2. RAPORT „CZEGO SZUKAŁY SKANERY"
-- ---------------------------------------------------------------------------
-- Oba warunki bezpieczeństwa z 20260909200000 bez zmian: tylko ścieżki, które
-- dostały błąd, i nigdy kanarek.

CREATE OR REPLACE FUNCTION public.pub_raport_czego_szukaja(okres TEXT DEFAULT '30d')
RETURNS TABLE (
  sciezka        TEXT,
  czego_szuka    TEXT,
  zadan          BIGINT,
  roznych_sieci  BIGINT,
  ostatnio       TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $fn$
  SELECT v.sciezka,
         CASE
           WHEN v.sciezka ~* '^/@fs/'         THEN 'dowolny plik przez luke w serwerze Vite'
           WHEN v.sciezka ~* '\.aws/|gcloud'  THEN 'klucze do chmury (AWS, Google Cloud)'
           WHEN v.sciezka ~* '/proc/self/'    THEN 'zmienne srodowiskowe procesu'
           WHEN v.sciezka ~* '\.env'          THEN 'hasla i klucze do bazy'
           WHEN v.sciezka ~* '\.git'          THEN 'kod zrodlowy i historia zmian'
           WHEN v.sciezka ~* 'wp-login|wp-admin|wp-includes'
                                              THEN 'panel WordPressa'
           WHEN v.sciezka ~* 'config\.(json|ya?ml|php)|appsettings|local_settings'
                                              THEN 'plik konfiguracyjny'
           WHEN v.sciezka ~* 'adminsdk|token\.json|\.npmrc'
                                              THEN 'klucze do uslug zewnetrznych'
           WHEN v.sciezka ~* '/actuator/'     THEN 'panel diagnostyczny aplikacji Java'
           WHEN v.sciezka ~* 'graphql'        THEN 'punkt dostepu do danych'
           WHEN v.sciezka ~* '\.map$'         THEN 'mapy kodu zrodlowego'
           ELSE 'inne'
         END,
         count(*),
         count(DISTINCT v.asn),
         max(v.odwiedzono)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.odwiedzono >= public.okres_od(okres)
    -- ⚠ Kanarek ('kanarek') celowo poza zakresem.
    AND v.sciezka_typ IN ('sekret', 'kod')
    -- ⚠ TYLKO to, czego u nas nie ma. Bez tego warunku raport bylby mapa.
    AND v.status >= 400
  GROUP BY v.sciezka
  ORDER BY count(*) DESC
  LIMIT 60;
$fn$;

REVOKE ALL ON FUNCTION public.pub_raport_czego_szukaja(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_czego_szukaja(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. PRZELICZENIE HISTORII
-- ---------------------------------------------------------------------------
-- WHERE porównuje ze świeżym wynikiem, więc powtórka nie rusza ani jednego wiersza.
-- Trigger wizyt działa tylko przy INSERT, więc UPDATE go nie wywoła.
UPDATE public.bot_visits
SET sciezka_typ = public.typ_sciezki(sciezka)
WHERE sciezka_typ IS DISTINCT FROM public.typ_sciezki(sciezka);

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   -- nowe wzorce mają być wyłącznie 'sekret'
--   select sciezka_typ, count(*) from public.bot_visits
--   where sciezka ~* '(^/@fs/|\.aws/|gcloud|/proc/self/)' group by 1;
--
--   -- nowe kategorie w raporcie, jeśli takie adresy u nas były
--   select czego_szuka, count(*) from public.pub_raport_czego_szukaja('all') group by 1;
--
--   -- KONTROLA REGRESJI: żadna wyszukiwarka nie może wskoczyć do skanów
--   select * from public.bot_skany;
