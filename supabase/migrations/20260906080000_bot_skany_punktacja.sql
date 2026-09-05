-- Wykrywanie skanów: z „albo-albo" na punktację. Poprawka do Części 4.
--
-- POWÓD — pierwszy prawdziwy odczyt `select * from bot_skany` (05.09.2026):
--
--     ASN     kto            żądań  tożsamości  odbite  wrażliwe
--     14618   Amazon AWS       85       2          0        0
--     1004    skaner           75       6         20       71
--     32934   Meta             45       1          0        0
--     8075    Microsoft        15       3          0        0
--
-- Trzy z czterech wierszy to fałszywe alarmy. Widok miał w HAVING trzy warunki
-- połączone przez OR, więc wystarczał jeden:
--   • `count(*) > 40`            złapało Amazon (85) i Meta (45),
--   • `count(DISTINCT bot) >= 3` złapało Microsoft (3 tożsamości).
-- Ani jedno, ani drugie nie jest oznaką skanowania: duże chmury hostują wielu
-- operatorów botów naraz, a wolumen to miara popularności, nie zamiaru.
-- Komentarz do tego widoku ostrzegał „pojedynczy warunek daje fałszywe alarmy",
-- po czym kod robił dokładnie to, przed czym ostrzegał.
--
-- Kolumna `wrazliwe` rozdzielała te grupy bezbłędnie już przy pierwszym
-- odczycie: 71 przy skanerze, 0 przy wszystkich pozostałych. Tylko nic z tego
-- nie wynikało, bo była jednym z równorzędnych warunków OR, a nie warunkiem
-- rozstrzygającym.
--
-- CO SIĘ ZMIENIA: zamiast OR — punkty. Żaden sygnał poza celowanym pytaniem
-- o pliki z sekretami nie wystarcza sam. Progi dobrane tak, żeby na powyższych
-- czterech wierszach zostawić AS1004 i wypuścić resztę.
--
-- DLACZEGO TO WAŻNE POZA WYGODĄ: te dane mają trafić na publiczną stronę
-- o zafałszowywaniu statystyk ruchu. Tabela, która wypisuje Microsoft w kolumnie
-- „skanery", jest gorsza niż brak tabeli — kompromituje też te wiersze, które są
-- prawdziwe. Fałszywy alarm w prywatnym mailu kosztuje minutę uwagi; ten sam
-- fałszywy alarm opublikowany kosztuje wiarygodność całego pomiaru.

-- ---------------------------------------------------------------------------
-- 1. JEDNA IMPLEMENTACJA PUNKTACJI
-- ---------------------------------------------------------------------------
-- Widok `bot_skany` patrzy na całą historię, a alert na ostatnie N godzin.
-- Poprzednio były to dwa osobne zapytania z ręcznie przepisanym HAVING — i już
-- się rozjechały: widok miał w liście ścieżek wrażliwych `config\.(json|yml|
-- yaml|php)`, a alert nie. Ten sam powód, dla którego `kategoria_bota()` żyje
-- w bazie: dwie kopie reguły rozjeżdżają się przy pierwszej zmianie.
--
-- Funkcja jest SECURITY INVOKER (domyślnie), więc dziedziczy RLS `bot_visits` —
-- czyta ją wyłącznie admin. Alert widzi całość, bo `zglos_skany_botow` jest
-- SECURITY DEFINER.
--
-- ⚠ Wszystkie odwołania do kolumn są kwalifikowane aliasem (v., s., o.).
-- Nazwy z RETURNS TABLE są w ciele funkcji widoczne jako zmienne, więc gołe
-- `asn` czy `zadan` skończyłoby się błędem „column reference is ambiguous".

-- ⚠ Widoki idą PRZED funkcją. Przy powtórnym uruchomieniu migracji `bot_skany`
-- i `bot_na_granicy` już od niej zależą, a DROP FUNCTION na czymś, z czego
-- korzysta widok, kończy się błędem zależności. Kolejność jest wymuszona.
DROP VIEW IF EXISTS public.bot_skany;
DROP VIEW IF EXISTS public.bot_na_granicy;
DROP FUNCTION IF EXISTS public.zrodla_botow(INTEGER);

CREATE FUNCTION public.zrodla_botow(_godzin INTEGER DEFAULT NULL)
RETURNS TABLE (
  asn             INTEGER,
  kraj            TEXT,
  zadan           BIGINT,
  tozsamosci      BIGINT,
  boty            TEXT[],
  odbite          BIGINT,
  proc_bledow     NUMERIC,
  wrazliwe        BIGINT,
  kanarek         BIGINT,
  boty_wrazliwe   TEXT[],
  minut_aktywnych BIGINT,
  na_minute       NUMERIC,
  punkty          INTEGER,
  powod           TEXT[],
  pierwsze        TIMESTAMPTZ,
  ostatnie        TIMESTAMPTZ,
  czas_trwania    INTERVAL
)
LANGUAGE sql
STABLE
SET search_path = public
AS $funkcja$
WITH surowe AS (
  SELECT v.asn                                                       AS asn,
         v.kraj                                                      AS kraj,
         count(*)                                                    AS zadan,
         count(DISTINCT v.bot)                                       AS tozsamosci,
         array_agg(DISTINCT v.bot)                                   AS boty,
         count(*) FILTER (WHERE v.status >= 400)                     AS odbite,
         count(*) FILTER (WHERE v.sciezka_typ IN ('sekret', 'kod'))  AS wrazliwe,
         count(*) FILTER (WHERE v.sciezka_typ = 'kanarek')           AS kanarek,
         COALESCE(
           array_agg(DISTINCT v.bot)
             FILTER (WHERE v.sciezka_typ IN ('sekret', 'kod', 'kanarek')),
           '{}'::TEXT[])                                             AS boty_wrazliwe,
         count(DISTINCT date_trunc('minute', v.odwiedzono))          AS minut_aktywnych,
         min(v.odwiedzono)                                           AS pierwsze,
         max(v.odwiedzono)                                           AS ostatnie
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND (_godzin IS NULL OR v.odwiedzono >= now() - make_interval(hours => _godzin))
  GROUP BY v.asn, v.kraj
),
ocena AS (
  SELECT s.*,
         round(100.0 * s.odbite / s.zadan, 1)                        AS proc_bledow,
         round(s.zadan::NUMERIC / GREATEST(s.minut_aktywnych, 1), 1) AS na_minute,

         -- PYTANIE O PLIKI Z SEKRETAMI — jedyny sygnał mocny sam z siebie,
         -- i tylko powyżej piątego trafienia. Jedno żądanie o /.env to szum
         -- tła internetu; siedemdziesiąt jeden to praca z listy.
           (CASE WHEN s.wrazliwe >= 5 THEN 5
                 WHEN s.wrazliwe >= 1 THEN 2
                 ELSE 0 END)

         -- KANAREK — potwierdzone zignorowanie robots.txt. Fakt twardy, ale
         -- nie dowód skanowania: bywa też zwykłym niechlujstwem crawlera.
         + (CASE WHEN s.kanarek >= 1 THEN 2 ELSE 0 END)

         -- ODSETEK BŁĘDÓW. Pomiar z doby 04–05.09: prawdziwe boty 0%,
         -- podszywacze 52% — pierwsze idą po sitemapie, drugie zgadują.
         -- Próg 10 żądań, bo przy trzech jeden 404 to już 33%.
         + (CASE WHEN s.zadan >= 10
                  AND s.odbite::NUMERIC / s.zadan >= 0.20
                 THEN 2 ELSE 0 END)

         -- TEMPO. Skan z AS1004: 62 żądania w 19 sekund. Liczone na minutę
         -- AKTYWNĄ, nie na rozpiętość od pierwszego do ostatniego żądania —
         -- inaczej powrót po tygodniu rozmywa serię do zera.
         + (CASE WHEN s.zadan >= 20
                  AND s.zadan::NUMERIC / GREATEST(s.minut_aktywnych, 1) >= 20
                 THEN 2 ELSE 0 END)

         -- WIELE TOŻSAMOŚCI Z JEDNEGO ASN. Najsłabszy sygnał ze wszystkich
         -- i to jest cała poprawka: AWS i Azure hostują wielu operatorów, więc
         -- sam ten warunek NIE MOŻE nikogo zgłosić (1–2 pkt przy progu 4).
         + (CASE WHEN s.tozsamosci >= 6 THEN 2
                 WHEN s.tozsamosci >= 3 THEN 1
                 ELSE 0 END)
         AS punkty,

         -- Odsiew pustych powodów przez unnest, a nie array_remove(..., NULL):
         -- array_remove z NULL-em jako szukaną wartością to zachowanie, którego
         -- nie chcę sprawdzać na produkcji. Migracje stosuje Marek ręcznie, więc
         -- każdy błąd składni to osobna runda — poniższa forma jest jednoznaczna.
         COALESCE((
           SELECT array_agg(p) FROM unnest(ARRAY[
           CASE WHEN s.wrazliwe >= 5
                THEN format('%s żądań o pliki z sekretami', s.wrazliwe)
                WHEN s.wrazliwe >= 1
                THEN format('%s żądanie o plik z sekretami', s.wrazliwe) END,
           CASE WHEN s.kanarek >= 1
                THEN 'wszedł na ścieżkę zakazaną w robots.txt' END,
           CASE WHEN s.zadan >= 10 AND s.odbite::NUMERIC / s.zadan >= 0.20
                THEN format('%s%% odpowiedzi to błędy (zgaduje adresy)',
                            round(100.0 * s.odbite / s.zadan, 0)) END,
           CASE WHEN s.zadan >= 20
                 AND s.zadan::NUMERIC / GREATEST(s.minut_aktywnych, 1) >= 20
                THEN format('%s żądań na minutę',
                            round(s.zadan::NUMERIC / GREATEST(s.minut_aktywnych, 1), 0)) END,
           CASE WHEN s.tozsamosci >= 3
                THEN format('%s różnych tożsamości z jednej sieci', s.tozsamosci) END
           ]) AS p
           WHERE p IS NOT NULL
         ), '{}'::TEXT[]) AS powod
  FROM surowe s
)
SELECT o.asn,
       o.kraj,
       o.zadan,
       o.tozsamosci,
       o.boty,
       o.odbite,
       o.proc_bledow,
       o.wrazliwe,
       o.kanarek,
       o.boty_wrazliwe,
       o.minut_aktywnych,
       o.na_minute,
       o.punkty,
       o.powod,
       o.pierwsze,
       o.ostatnie,
       o.ostatnie - o.pierwsze AS czas_trwania
FROM ocena o
ORDER BY o.punkty DESC, o.zadan DESC;
$funkcja$;

COMMENT ON FUNCTION public.zrodla_botow(INTEGER) IS
  'Wszystkie sieci (ASN) widziane w liczniku, z punktacją podejrzeń. Bez argumentu — cała historia; z argumentem — ostatnie N godzin. Punkty: sekrety 2 (od 5 trafień: 5), kanarek 2, od 20% błędów 2, od 20 żądań na minutę aktywną 2, od 3 tożsamości 1 (od 6: 2). Próg zgłoszenia to 4, więc konieczne jest albo mocne pytanie o sekrety, albo dwa niezależne sygnały słabsze. Sama liczba tożsamości z jednego ASN nikogo nie zgłasza — to poprawka po tym, jak stara wersja wypisała Microsoft, Amazon i Meta jako skanery.';

REVOKE ALL ON FUNCTION public.zrodla_botow(INTEGER) FROM PUBLIC, anon;

-- ---------------------------------------------------------------------------
-- 2. WIDOK bot_skany NA NOWO
-- ---------------------------------------------------------------------------
-- DROP, a nie CREATE OR REPLACE: dochodzą kolumny w środku listy (proc_bledow,
-- kanarek, boty_wrazliwe, punkty, powod), a REPLACE potrafi wyłącznie dopisać
-- na końcu — próba wstawienia w środek kończy się błędem 42P16.

DROP VIEW IF EXISTS public.bot_skany;

CREATE VIEW public.bot_skany
WITH (security_invoker = true) AS
SELECT * FROM public.zrodla_botow() WHERE punkty >= 4;

COMMENT ON VIEW public.bot_skany IS
  'Sieci, które zachowują się jak skanery podatności — próg 4 punktów wg zrodla_botow(). Kolumna `powod` mówi, za co. NIE blokujemy automatycznie: podpis User-Agent jest z definicji niewiarygodny, a blokada po ASN uderzyłaby też w legalny ruch tego samego operatora. Obroną jest brak wrażliwych plików — skan z AS1004 nie zdobył nic, bo szukane pliki nie istnieją.';

-- Podgląd przypadków tuż pod progiem. Bez tego jedyną informacją o pominiętych
-- byłby ich brak, a progu dobranego na czterech wierszach nie da się uznać
-- za sprawdzony.
DROP VIEW IF EXISTS public.bot_na_granicy;

CREATE VIEW public.bot_na_granicy
WITH (security_invoker = true) AS
SELECT * FROM public.zrodla_botow() WHERE punkty BETWEEN 1 AND 3;

COMMENT ON VIEW public.bot_na_granicy IS
  'Sieci z jakimkolwiek sygnałem, ale poniżej progu zgłoszenia. Do kalibracji: jeśli zaczną tu lądować oczywiste skany, próg jest za wysoki.';

-- ---------------------------------------------------------------------------
-- 3. ALERT — ta sama punktacja, okno czasowe
-- ---------------------------------------------------------------------------
-- Zmiany względem poprzedniej wersji:
--   • HAVING zastąpione wywołaniem zrodla_botow(_godzin) — koniec z dwiema
--     rozjeżdżającymi się listami wzorców,
--   • w treści listu jest POWÓD zgłoszenia, nie same liczby: „45 żądań, 1
--     tożsamość" nie mówiło, czy to alarm, czy szum,
--   • klucz z Vault jest przycinany — spacja albo znak nowej linii, który wszedł
--     przy ręcznym wklejaniu do vault.create_secret, dawał 403 nie do odróżnienia
--     od złego klucza,
--   • ścieżka kanarka NIE trafia do treści — sama liczba trafień tak. Adres
--     w mailu wcześniej czy później zostanie gdzieś wklejony, a pułapka przestaje
--     działać w chwili, w której adres jest publiczny.

CREATE OR REPLACE FUNCTION public.zglos_skany_botow(_godzin INTEGER DEFAULT 24)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $funkcja$
DECLARE
  _tresc  TEXT := '';
  _ile    INTEGER := 0;
  _klucz  TEXT;
  _wiersz RECORD;
BEGIN
  FOR _wiersz IN
    SELECT * FROM public.zrodla_botow(_godzin) WHERE punkty >= 4 ORDER BY punkty DESC
  LOOP
    _ile := _ile + 1;
    _tresc := _tresc
      || format('AS%s (%s) — %s pkt', coalesce(_wiersz.asn::TEXT, '?'),
                coalesce(_wiersz.kraj, '?'), _wiersz.punkty) || chr(10)
      || format('  Powod: %s', array_to_string(_wiersz.powod, '; ')) || chr(10)
      || format('  %s zadan, %s odbitych (%s%%), %s roznych tozsamosci',
                _wiersz.zadan, _wiersz.odbite, _wiersz.proc_bledow,
                _wiersz.tozsamosci) || chr(10)
      || format('  Podszywali sie pod: %s', array_to_string(_wiersz.boty, ', ')) || chr(10);

    IF coalesce(array_length(_wiersz.boty_wrazliwe, 1), 0) > 0 THEN
      _tresc := _tresc
        || format('  O wrazliwe pliki pytaly: %s',
                  array_to_string(_wiersz.boty_wrazliwe, ', ')) || chr(10);
    END IF;

    _tresc := _tresc
      || format('  Start: %s, trwalo: %s', _wiersz.pierwsze, _wiersz.czas_trwania)
      || chr(10) || chr(10);
  END LOOP;

  IF _ile = 0 THEN
    RETURN 'brak zgloszen';
  END IF;

  -- Odczyt z Vault w bloku z wyjątkiem: gdyby rozszerzenia nie było albo
  -- zmieniła się nazwa widoku, funkcja ma zwrócić treść alertu, a NIE wywrócić
  -- zadania cron. Alert jest dodatkiem — nie może psuć niczego innego.
  BEGIN
    SELECT decrypted_secret INTO _klucz
    FROM vault.decrypted_secrets WHERE name = 'klucz_alertu_botow';
  EXCEPTION WHEN OTHERS THEN
    _klucz := NULL;
  END;

  _klucz := btrim(coalesce(_klucz, ''), E' \t\r\n');

  IF _klucz = '' THEN
    RETURN 'BRAK KLUCZA w vault (klucz_alertu_botow) — alert NIE zostal wyslany.'
           || chr(10) || 'Tresc, ktora poszlaby mailem:' || chr(10) || chr(10) || _tresc;
  END IF;

  PERFORM net.http_post(
    url := 'https://hsgxmbhunclhgzumafrk.supabase.co/functions/v1/send-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || _klucz
    ),
    body := jsonb_build_object(
      'recipients', jsonb_build_array('marek@fermly.pl'),
      'subject', format('mojaserowarnia.pl — %s podejrzanych zrodel w ostatnich %s h',
                        _ile, _godzin),
      'message', _tresc
        || 'Nie blokujemy automatycznie — podpis User-Agent jest z definicji niewiarygodny,' || chr(10)
        || 'a blokada po ASN uderzylaby tez w legalny ruch tego samego operatora. Sprawdz,'  || chr(10)
        || 'czy wszystkie zadania odbily sie bledem: jesli cokolwiek zwrocilo 200,'          || chr(10)
        || 'to jest do zbadania.' || chr(10) || chr(10)
        || 'Szczegoly:   select * from bot_skany;' || chr(10)
        || 'Tuz ponizej: select * from bot_na_granicy;'
    )
  );

  RETURN format('wyslano alert o %s zrodlach', _ile);
END;
$funkcja$;

COMMENT ON FUNCTION public.zglos_skany_botow(INTEGER) IS
  'Sprawdza ostatnie N godzin tą samą punktacją co widok bot_skany i wysyła e-mail przez Edge Function send-notification. Bez klucza w Vault zwraca treść alertu zamiast go wysyłać, więc da się ją obejrzeć przed konfiguracją: select public.zglos_skany_botow(72);';

REVOKE ALL ON FUNCTION public.zglos_skany_botow(INTEGER) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. NA POTEM — publiczna strona ze statystykami
-- ---------------------------------------------------------------------------
-- Warstwa danych jest do tego gotowa, ale publicznego widoku tu NIE MA i nie
-- należy go dodawać odruchowo. Trzy rzeczy muszą zostać rozstrzygnięte wcześniej,
-- bo publikacji nie da się cofnąć:
--
--   1. `bot_visits` jest pod RLS wyłącznie dla admina, a `zrodla_botow` jest
--      SECURITY INVOKER — publiczna strona potrzebuje osobnej funkcji
--      SECURITY DEFINER, zwracającej gotowe agregaty. Nie wolno dać anonowi
--      dostępu do tych widoków: zawierają pełne listy tożsamości i ścieżek.
--   2. Kolumny `kanarek` i `boty_wrazliwe` opisują pułapkę. Liczba trafień może
--      być publiczna, ale nic, z czego dałoby się odtworzyć adres.
--   3. Nazwy operatorów sieci (Amazon, Microsoft, Meta) nie mogą stać przy słowie
--      „skaner" — sieć hostuje sprawcę, nie jest sprawcą. Publikować numer ASN
--      i zachowanie, nie właściciela i oskarżenie.
