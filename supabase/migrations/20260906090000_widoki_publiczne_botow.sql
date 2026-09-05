-- Publiczne widoki pod stronę /boty-ai. Część 1 zlecenia
-- ProjektyLLm/zlecenie-strona-boty-ai.md (wersja poprawiona — patrz -v2).
--
-- ⚠ TE WIDOKI SĄ CZYTANE PRZEZ CAŁY INTERNET. Nie dopisuj tu kolumny, zanim
-- nie odpowiesz sobie, co z niej wynika dla kogoś, kto zna tylko ją. Wykluczone
-- na stałe: adresy IP (w UE bywają danymi osobowymi, a wynajęty VPS może należeć
-- do osoby fizycznej), pełne ścieżki, adres kanarka, nazwy właścicieli ASN.
--
-- ---------------------------------------------------------------------------
-- DLACZEGO BEZ security_invoker — i dlaczego to NIE jest przeoczenie
-- ---------------------------------------------------------------------------
-- Wszystkie dotychczasowe widoki licznika mają `WITH (security_invoker = true)`,
-- więc dziedziczą RLS `bot_visits` i widzi je wyłącznie admin. Tutaj jest
-- ODWROTNIE, celowo: widok bez tej opcji działa z prawami właściciela, czyli
-- omija RLS — i dopiero dzięki temu anon w ogóle coś zobaczy. Z security_invoker
-- te widoki zwracałyby anonowi ZERO WIERSZY, cicho, bez błędu, i strona byłaby
-- pusta bez śladu w logach.
--
-- Bezpieczne jest to wyłącznie dlatego, że każdy widok niżej ma GROUP BY albo
-- agregat bez GROUP BY, więc nie potrafi wypuścić pojedynczego wiersza źródłowego.
-- Supabase oznaczy je w linterze jako „Security Definer View" — tu jest to
-- świadomy wybór, nie ostrzeżenie do naprawienia.
--
-- Dodaj kolumnę bez agregatu, a ten akapit przestaje być prawdziwy.

-- ---------------------------------------------------------------------------
-- 0. PRÓG PORÓWNYWALNOŚCI POMIARU
-- ---------------------------------------------------------------------------
-- 5 września 2026 o 15:29:52 UTC worker przestał oddawać skorupę React z kodem
-- 200 na ścieżkach skanerów (/wp-admin/, /graphql, *.php i podobne) i zaczął
-- oddawać prawdziwe 404. To zmienia DWIE wielkości, na których stoi cały moduł
-- o sygnaturze zachowania:
--
--   • odsetek błędów ruchu podszytego skacze z ~27% ku ~100%,
--   • średni rozmiar odpowiedzi spada z 14 252 B (skorupa) do 2 724 B (404).
--
-- Wykres przechodzący przez ten moment pokazywałby załamanie, które zrobiliśmy
-- MY, nie boty. Zamiast je chować, rozbijamy sygnaturę na dwa okresy i pokazujemy
-- oba. Strona o rzetelności pomiaru nie może mieć niejawnej zmiany metody
-- w środku szeregu.
--
-- Jedno miejsce do zmiany, gdyby doszła kolejna zmiana serwera zmieniająca kody
-- odpowiedzi. Wtedy: nowy próg i trzeci okres, nigdy nadpisanie starego.

CREATE OR REPLACE FUNCTION public.prog_porownywalnosci()
RETURNS TIMESTAMPTZ
LANGUAGE sql
IMMUTABLE
AS $$ SELECT TIMESTAMPTZ '2026-09-05 15:30:00+00' $$;

COMMENT ON FUNCTION public.prog_porownywalnosci() IS
  'Moment wdrożenia reguły 1d workera (prawdziwe 404 na ścieżkach skanerów). Przed nim odsetek błędów i średni rozmiar odpowiedzi znaczą co innego niż po nim, więc widoki publiczne rozbijają sygnaturę zachowania na te dwa okresy.';

-- ---------------------------------------------------------------------------
-- 0b. KASOWANIE POPRZEDNICH WERSJI
-- ---------------------------------------------------------------------------
-- DROP + CREATE zamiast CREATE OR REPLACE, bo te widoki bedziemy jeszcze
-- zmieniac przy skladaniu strony, a REPLACE potrafi wylacznie DOPISAC kolumne
-- na koncu listy. Proba wstawienia nowej w srodek konczy sie bledem 42P16
-- ("cannot change name of view column") — kosztowalo to juz jedna runde
-- w migracji kategorii botow. Uprawnienia i tak nadajemy na koncu na nowo.

DROP VIEW IF EXISTS public.pub_bot_podsumowanie;
DROP VIEW IF EXISTS public.pub_bot_wg_bota;
DROP VIEW IF EXISTS public.pub_bot_zachowanie;
DROP VIEW IF EXISTS public.pub_bot_cele;
DROP VIEW IF EXISTS public.pub_bot_miesiecznie;
DROP VIEW IF EXISTS public.pub_bot_metody;
DROP VIEW IF EXISTS public.pub_bot_kategorie;

-- ---------------------------------------------------------------------------
-- 1. PODSUMOWANIE — jeden wiersz, oba mianowniki
-- ---------------------------------------------------------------------------
-- Liczba nagłówkowa strony wychodzi stąd. Widok podaje OBA mianowniki, bo
-- „15% ruchu botów AI jest prawdziwe" bez powiedzenia, procent czego, jest
-- dokładnie tym rodzajem liczby, który ta strona krytykuje.
--
--   proc_wsrod_rozstrzygnietych — spośród żądań, które dało się rozstrzygnąć
--   proc_calosci                — licząc też te, których rozstrzygnąć się nie da
--
-- Pierwszy jest metodologicznie uczciwszy (nie zgadujemy o operatorach, którzy
-- nie publikują list IP), drugi ostrożniejszy. Publikujemy oba w jednym zdaniu.

CREATE VIEW public.pub_bot_podsumowanie AS
SELECT
  (SELECT min(odwiedzono)::DATE FROM public.bot_visits)              AS pomiar_od,
  now()                                                              AS stan_na,
  public.prog_porownywalnosci()                                      AS zmiana_metody,

  count(*) FILTER (WHERE NOT wlasne)                                 AS zadan_ogolem,
  count(*) FILTER (WHERE NOT wlasne AND zweryfikowany IS TRUE)       AS oryginalne,
  count(*) FILTER (WHERE NOT wlasne AND zweryfikowany IS FALSE)      AS falszowane,
  count(*) FILTER (WHERE NOT wlasne AND zweryfikowany IS NULL)       AS niesprawdzone,
  count(*) FILTER (WHERE NOT wlasne AND zweryfikowany IS NOT NULL)   AS rozstrzygniete,
  count(*) FILTER (WHERE wlasne)                                     AS testy_wlasciciela,

  round(100.0 * count(*) FILTER (WHERE NOT wlasne AND zweryfikowany IS TRUE)
        / NULLIF(count(*) FILTER (WHERE NOT wlasne AND zweryfikowany IS NOT NULL), 0), 1)
                                                                     AS proc_wsrod_rozstrzygnietych,
  round(100.0 * count(*) FILTER (WHERE NOT wlasne AND zweryfikowany IS TRUE)
        / NULLIF(count(*) FILTER (WHERE NOT wlasne), 0), 1)          AS proc_calosci,

  count(*) FILTER (WHERE NOT wlasne
                     AND odwiedzono > now() - INTERVAL '30 days')    AS ostatnie_30d,
  count(DISTINCT bot) FILTER (WHERE NOT wlasne)                      AS roznych_tozsamosci,
  count(DISTINCT asn) FILTER (WHERE NOT wlasne)                      AS roznych_sieci
FROM public.bot_visits;

COMMENT ON VIEW public.pub_bot_podsumowanie IS
  'Publiczne podsumowanie licznika botów. Zawiera stan_na, żeby każda opublikowana liczba niosła swoją datę — model, który zacytuje liczbę bez daty, będzie ją powtarzał latami.';

-- ---------------------------------------------------------------------------
-- 2. PER BOT — z kategorią
-- ---------------------------------------------------------------------------
-- Próg 3 żądań: przy jednym trafieniu nazwa bota w tabeli to szum, a nie dana.
-- `kategoria` dochodzi względem zlecenia, bo rozróżnienie „crawler zbierający
-- treść" / „model poszedł po stronę, bo ktoś zadał pytanie" jest tu
-- najciekawszą informacją i nie ma jej w polskim internecie nigdzie.

CREATE VIEW public.pub_bot_wg_bota AS
SELECT operator,
       bot,
       kategoria,
       count(*)                                      AS zadan,
       count(*) FILTER (WHERE zweryfikowany IS TRUE)  AS oryginalne,
       count(*) FILTER (WHERE zweryfikowany IS FALSE) AS falszowane,
       count(*) FILTER (WHERE zweryfikowany IS NULL)  AS niesprawdzone
FROM public.bot_visits
WHERE NOT wlasne
GROUP BY operator, bot, kategoria
HAVING count(*) >= 3
ORDER BY count(*) FILTER (WHERE zweryfikowany IS TRUE) DESC, count(*) DESC;

COMMENT ON VIEW public.pub_bot_wg_bota IS
  'Ruch w rozbiciu na tożsamości. Wysoka liczba w kolumnie `falszowane` mówi o rozpoznawalności marki, nie o nieuczciwości operatora — ktoś kradnie tę nazwę, bo strony ją przepuszczają. To zdanie MUSI stać nad tabelą na stronie, nie w przypisie.';

-- ---------------------------------------------------------------------------
-- 3. SYGNATURA ZACHOWANIA — rozbita na okresy pomiaru
-- ---------------------------------------------------------------------------
-- Najmocniejszy merytorycznie moduł strony: prawdziwe boty idą po sitemapie,
-- więc WIEDZĄ, co istnieje, i mają zerowy odsetek błędów. Podszywacze zgadują
-- adresy z gotowej listy. Rozpoznanie działa bez list IP i bez DNS, więc obejmuje
-- też operatorów, którzy jeszcze nie powstali.
--
-- ⚠ `okres` nie jest ozdobą — patrz komentarz przy prog_porownywalnosci().

CREATE VIEW public.pub_bot_zachowanie AS
SELECT CASE WHEN zweryfikowany THEN 'oryginalne' ELSE 'falszowane' END       AS grupa,
       CASE WHEN odwiedzono < public.prog_porownywalnosci()
            THEN 'przed zmiana metody' ELSE 'po zmianie metody' END          AS okres,
       count(*)                                                              AS zadan,
       count(*) FILTER (WHERE status >= 400)                                 AS odbite,
       round(100.0 * count(*) FILTER (WHERE status >= 400) / count(*), 1)    AS proc_bledow,
       round(avg(rozmiar))                                                   AS sredni_rozmiar,
       count(DISTINCT sciezka)                                               AS roznych_sciezek
FROM public.bot_visits
WHERE NOT wlasne AND zweryfikowany IS NOT NULL
GROUP BY 1, 2
ORDER BY 2 DESC, 1;

COMMENT ON VIEW public.pub_bot_zachowanie IS
  'Sygnatura zachowania obu grup, rozbita na okresy sprzed i po zmianie odpowiedzi serwera 05.09.2026. Bez tego rozbicia szereg pokazywałby skok, który zrobił serwer, nie boty.';

-- ---------------------------------------------------------------------------
-- 4. CZEGO SZUKAJĄ — wyłącznie typy ścieżek
-- ---------------------------------------------------------------------------
-- Nigdy konkretne adresy: opublikowana lista ścieżek wrażliwych to gotowa mapa
-- dla następnego skanera. Kanarek wypada w całości — jego adres nie może pojawić
-- się nigdzie publicznie, a jest jedyną wartością `sciezka_typ`, po której dałoby
-- się wnioskować o istnieniu pułapki.
--
-- IS DISTINCT FROM zamiast <>: przy NULL-u `<>` daje NULL i wiersz wypada z widoku
-- po cichu. Po backfillu NULL-i nie ma, ale nowa wartość w typ_sciezki() nie może
-- kiedyś cicho wyciąć danych.

-- Udział liczony w CTE, a nie oknem nad GROUP BY: PARTITION BY musiałby powtarzać
-- całe wyrażenie CASE (aliasu z SELECT-a w PARTITION BY użyć nie wolno), a to już
-- jest zapytanie, które trzeba by sprawdzać na produkcji. Tu nie ma czego sprawdzać.
CREATE VIEW public.pub_bot_cele AS
WITH zliczone AS (
  SELECT CASE WHEN zweryfikowany THEN 'oryginalne' ELSE 'falszowane' END AS grupa,
         sciezka_typ,
         count(*) AS zadan
  FROM public.bot_visits
  WHERE NOT wlasne
    AND zweryfikowany IS NOT NULL
    AND sciezka_typ IS DISTINCT FROM 'kanarek'
  GROUP BY 1, 2
)
SELECT grupa,
       sciezka_typ,
       zadan,
       round(100.0 * zadan / sum(zadan) OVER (PARTITION BY grupa), 1) AS proc_grupy
FROM zliczone
ORDER BY zadan DESC;

COMMENT ON VIEW public.pub_bot_cele IS
  'Typy żądanych ścieżek, nigdy same ścieżki. Wniosek do wyeksponowania: zbiory celów obu grup prawie się nie przecinają — prawdziwe boty czytają treść, podszywacze nie tknęli ani jednego przepisu.';

-- ---------------------------------------------------------------------------
-- 5. MIESIĘCZNIE — do wykresu, sensowne od trzech pełnych miesięcy
-- ---------------------------------------------------------------------------

CREATE VIEW public.pub_bot_miesiecznie AS
SELECT date_trunc('month', odwiedzono)::DATE            AS miesiac,
       count(*)                                          AS zadan,
       count(*) FILTER (WHERE zweryfikowany IS TRUE)     AS oryginalne,
       count(*) FILTER (WHERE zweryfikowany IS FALSE)    AS falszowane,
       count(*) FILTER (WHERE zweryfikowany IS NULL)     AS niesprawdzone
FROM public.bot_visits
WHERE NOT wlasne
GROUP BY 1
ORDER BY 1;

COMMENT ON VIEW public.pub_bot_miesiecznie IS
  'Szereg miesięczny. Nie publikować wykresu, dopóki nie ma trzech pełnych miesięcy — dwa punkty to nie trend, a wykres sugeruje, że jest.';

-- ---------------------------------------------------------------------------
-- 6. METODY WERYFIKACJI — dowód, że metodologia działa
-- ---------------------------------------------------------------------------
-- Tego w zleceniu nie było, a jest tam moduł „Metodologia". Bez tego widoku ten
-- moduł jest opisem metody; z nim jest dowodem, ile ta metoda faktycznie
-- rozstrzygnęła i ile z premedytacją zostawiła jako „nie wiadomo".
--
-- Uczciwość „niesprawdzonych" jest tu ważniejsza niż wielkość liczb: dashboardy,
-- z którymi ta strona polemizuje, nie mają kategorii „nie wiem".

CREATE VIEW public.pub_bot_metody AS
SELECT coalesce(metoda_weryfikacji, 'brak_zapisu')       AS metoda,
       count(*)                                           AS zadan,
       count(*) FILTER (WHERE zweryfikowany IS TRUE)      AS potwierdzone,
       count(*) FILTER (WHERE zweryfikowany IS FALSE)     AS zaprzeczone,
       count(*) FILTER (WHERE ma_podpis)                  AS z_podpisem_web_bot_auth
FROM public.bot_visits
WHERE NOT wlasne
GROUP BY 1
ORDER BY 2 DESC;

COMMENT ON VIEW public.pub_bot_metody IS
  'Czym rozstrzygnięto tożsamość: lista IP operatora, ASN, FCrDNS, podpis Web Bot Auth — albo nic. Kolumna z_podpisem_web_bot_auth liczy obecność nagłówków podpisu, BEZ walidacji kryptograficznej; nie wolno jej opisać na stronie jako weryfikacji.';

-- ---------------------------------------------------------------------------
-- 7. KATEGORIE — crawler kontra pytanie człowieka
-- ---------------------------------------------------------------------------
-- `ai_uzytkownik` znaczy, że konkretny człowiek zadał pytanie w czacie i model
-- poszedł po tę stronę. To jakościowo inne zdarzenie niż crawl budujący indeks
-- i najcenniejszy sygnał w całym zbiorze — w zleceniu w ogóle go nie było.

CREATE VIEW public.pub_bot_kategorie AS
SELECT kategoria,
       count(*)                                       AS zadan,
       count(*) FILTER (WHERE zweryfikowany IS TRUE)  AS oryginalne,
       count(*) FILTER (WHERE zweryfikowany IS FALSE) AS falszowane,
       count(DISTINCT bot)                            AS roznych_tozsamosci,
       count(*) FILTER (WHERE mirror)                 AS obsluzonych_mirrorem
FROM public.bot_visits
WHERE NOT wlasne
GROUP BY 1
ORDER BY 2 DESC;

COMMENT ON VIEW public.pub_bot_kategorie IS
  'Rozkład wg kategorii bota. ai_uzytkownik = żądanie wywołane pytaniem człowieka w czacie, ai_crawler = zbieranie treści do indeksu. Granica wyszukiwarka/AI już nie istnieje (Googlebot karmi AI Overviews), dlatego kategoryzujemy zamiast filtrować.';

-- ---------------------------------------------------------------------------
-- 8. UPRAWNIENIA
-- ---------------------------------------------------------------------------
-- Odbieramy anonowi dostęp do surowej tabeli JAWNIE, mimo że RLS i tak nie
-- przepuściłby wierszy. Powód: RLS przy braku pasującej polityki nie zgłasza
-- błędu, tylko zwraca pustkę, więc pomyłka w polityce byłaby niewidoczna.
-- Brak uprawnienia jest głośny — a to jest miejsce, w którym cicha pomyłka
-- publikuje adresy IP.

REVOKE ALL ON public.bot_visits FROM anon;

GRANT SELECT ON public.pub_bot_podsumowanie TO anon, authenticated;
GRANT SELECT ON public.pub_bot_wg_bota      TO anon, authenticated;
GRANT SELECT ON public.pub_bot_zachowanie   TO anon, authenticated;
GRANT SELECT ON public.pub_bot_cele         TO anon, authenticated;
GRANT SELECT ON public.pub_bot_miesiecznie  TO anon, authenticated;
GRANT SELECT ON public.pub_bot_metody       TO anon, authenticated;
GRANT SELECT ON public.pub_bot_kategorie    TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 9. SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
-- ⚠ Zlecenie proponowało `set role anon; select count(*) from bot_visits;`
-- z komentarzem „musi odmówić". RLS NIE ODMAWIA — filtruje. Bez REVOKE z punktu 8
-- to zapytanie zwróciłoby `0`, co łatwo odczytać jako sukces testu, choć niczego
-- nie dowodzi. Po REVOKE ma polecieć BŁĄD uprawnień i dopiero to jest dowód.
--
--   set role anon;
--   select count(*) from public.bot_visits;        -- ma dać: permission denied
--   select * from public.pub_bot_podsumowanie;     -- ma dać jeden wiersz
--   select * from public.pub_bot_cele;             -- nie może zawierać 'kanarek'
--   reset role;
--
-- I pytanie kontrolne do każdej przyszłej kolumny w pub_*: czy da się z niej
-- odtworzyć pojedyncze żądanie, adres IP albo ścieżkę? Jeśli tak — nie publikuj.
