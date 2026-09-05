-- Interaktywne raporty na /boty-ai. Zlecenie ProjektyLLm/zlecenie-raporty-interaktywne.md
--
-- ---------------------------------------------------------------------------
-- GRANICA, KTÓREJ NIE PRZEKRACZAMY
-- ---------------------------------------------------------------------------
-- ŻADNEGO pola do wpisania SQL-a — ani publicznie, ani za logowaniem, ani
-- „tylko dla admina". Jedno takie pole to gotowy kanał do odczytu całej bazy:
-- adresów IP, danych producentów z wizytówek, tabeli kont.
--
-- Model: zamknięta lista funkcji → parametr z zamkniętego zbioru → wynik.
-- Użytkownik NIGDY nie podaje tekstu, który trafia do zapytania. `okres_od()`
-- rozpoznaje cztery wartości przez CASE; cokolwiek innego daje '-infinity',
-- czyli najgorszy możliwy skutek złego parametru to pokazanie całego okresu.
-- Nie ma tu miejsca, w którym tekst od użytkownika staje się kodem.

-- ---------------------------------------------------------------------------
-- JEDNA IMPLEMENTACJA, NIE DWIE
-- ---------------------------------------------------------------------------
-- ⚠ Zlecenie mówiło „widoki pub_* zostają — funkcje je uzupełniają". To by
-- znaczyło DWIE implementacje tych samych liczb, różniące się tylko oknem
-- czasowym. Ten projekt przerabiał to już dwa razy w jeden dzień: `typ_sciezki`
-- rozjechało się między workerem a SQL-em, a `bot_skany` i alert miały dwie
-- ręcznie przepisane listy wzorców, które zdążyły się różnić.
--
-- Dlatego odwrotnie: FUNKCJE SĄ JEDYNĄ IMPLEMENTACJĄ, a widoki `pub_*` stają
-- się nakładką `select ... from pub_raport_x('all')`. Nazwy i kolumny widoków
-- zostają bez zmian, więc mirror, feed i trasa React działają dalej.

-- ---------------------------------------------------------------------------
-- 0. POMOCNIKI OKRESU
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.okres_od(_okres TEXT)
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT CASE _okres
    WHEN '24h' THEN now() - INTERVAL '24 hours'
    WHEN '7d'  THEN now() - INTERVAL '7 days'
    WHEN '30d' THEN now() - INTERVAL '30 days'
    ELSE '-infinity'::TIMESTAMPTZ
  END;
$$;

COMMENT ON FUNCTION public.okres_od(TEXT) IS
  'Początek okna czasowego raportu. CASE na zamkniętym zbiorze: wartość spoza listy daje -infinity, więc najgorszy skutek złego parametru to pokazanie całej historii. Żadnej interpolacji tekstu do zapytania.';

CREATE OR REPLACE FUNCTION public.okres_dlugosc(_okres TEXT)
RETURNS INTERVAL
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
  SELECT CASE _okres
    WHEN '24h' THEN INTERVAL '24 hours'
    WHEN '7d'  THEN INTERVAL '7 days'
    WHEN '30d' THEN INTERVAL '30 days'
    ELSE NULL
  END;
$$;

COMMENT ON FUNCTION public.okres_dlugosc(TEXT) IS
  'Długość okna — do raportu porównawczego. NULL dla „całości", bo przed początkiem pomiaru nie ma poprzedniego okresu i trzeba to pokazać jako brak danych, a nie jako zero.';

-- ---------------------------------------------------------------------------
-- 1. kto_byl — kto odwiedzał w wybranym okresie
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.pub_raport_kto_byl(okres TEXT DEFAULT '7d')
RETURNS TABLE (
  operator        TEXT,
  bot             TEXT,
  kategoria       TEXT,
  zadan           BIGINT,
  oryginalne      BIGINT,
  falszowane      BIGINT,
  niesprawdzone   BIGINT,
  ostatnia_wizyta TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT v.operator,
         v.bot,
         v.kategoria,
         count(*),
         count(*) FILTER (WHERE v.zweryfikowany IS TRUE),
         count(*) FILTER (WHERE v.zweryfikowany IS FALSE),
         count(*) FILTER (WHERE v.zweryfikowany IS NULL),
         max(v.odwiedzono)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.odwiedzono >= public.okres_od(okres)
  GROUP BY v.operator, v.bot, v.kategoria
  ORDER BY count(*) DESC
  LIMIT 200;
$$;

-- ---------------------------------------------------------------------------
-- 2. co_odwiedzali — najczęściej czytane strony
-- ---------------------------------------------------------------------------
-- WYŁĄCZNIE typy `tresc` i `techniczna`. Ścieżki `sekret`, `kod` i `kanarek`
-- nigdy nie trafiają do publicznego wyniku — pokazuje je zbiorczo raport 5.
--
-- ⚠ Dodatkowo odsiewamy pliki o nazwie z samego skrótu (32 znaki heks).
-- `typ_sciezki` klasyfikuje je jako `techniczna`, ale to są tokeny weryfikacyjne
-- usług zewnętrznych — nazwa takiego pliku nie ma powodu stać w publicznej tabeli.

CREATE OR REPLACE FUNCTION public.pub_raport_co_odwiedzali(okres TEXT DEFAULT '7d')
RETURNS TABLE (
  sciezka       TEXT,
  zadan         BIGINT,
  roznych_botow BIGINT,
  czy_mirror    BOOLEAN,
  ostatnio      TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT v.sciezka,
         count(*),
         count(DISTINCT v.bot),
         bool_or(v.mirror),
         max(v.odwiedzono)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.odwiedzono >= public.okres_od(okres)
    AND v.sciezka_typ IN ('tresc', 'techniczna')
    AND v.sciezka !~* '^/[a-f0-9]{32}\.txt$'
    AND v.status = 200
  GROUP BY v.sciezka
  ORDER BY count(*) DESC
  LIMIT 200;
$$;

-- ---------------------------------------------------------------------------
-- 3. sygnatura — jak odróżnić prawdziwego bota od podszywacza
-- ---------------------------------------------------------------------------
-- ⚠ KOLUMNA `okres_pomiaru` NIE JEST OZDOBĄ. Zlecenie jej nie miało, a bez niej
-- ten raport przy „całości" zmieszałby dane sprzed i po 5 września 2026, kiedy
-- worker przestał oddawać skorupę React z kodem 200 na ścieżkach skanerów.
-- Odsetek błędów i średni rozmiar znaczą po obu stronach tej daty CO INNEGO —
-- średnia z dwóch nieporównywalnych połówek to liczba bez sensu. `pub_bot_zachowanie`
-- rozbija to celowo od kilku godzin; raport bez tego podziału cofałby tę poprawkę.

CREATE OR REPLACE FUNCTION public.pub_raport_sygnatura(okres TEXT DEFAULT 'all')
RETURNS TABLE (
  grupa           TEXT,
  okres_pomiaru   TEXT,
  zadan           BIGINT,
  odbite          BIGINT,
  proc_bledow     NUMERIC,
  sredni_rozmiar  NUMERIC,
  mirrorow        BIGINT,
  roznych_sciezek BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT CASE WHEN v.zweryfikowany THEN 'oryginalne' ELSE 'falszowane' END,
         CASE WHEN v.odwiedzono < public.prog_porownywalnosci()
              THEN 'przed zmiana metody' ELSE 'po zmianie metody' END,
         count(*),
         count(*) FILTER (WHERE v.status >= 400),
         round(100.0 * count(*) FILTER (WHERE v.status >= 400) / count(*), 1),
         round(avg(v.rozmiar)),
         count(*) FILTER (WHERE v.mirror),
         count(DISTINCT v.sciezka)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.zweryfikowany IS NOT NULL
    AND v.odwiedzono >= public.okres_od(okres)
  GROUP BY 1, 2
  ORDER BY 2 DESC, 1
  LIMIT 200;
$$;

-- ---------------------------------------------------------------------------
-- 4. pod_kogo — pod kogo się podszywano
-- ---------------------------------------------------------------------------
-- Nazewnictwo obowiązuje z poprzedniego zlecenia: „fałszowane", nigdy
-- „podejrzane". Imiesłów bierny wskazuje, że sprawcą jest ktoś inny niż bot,
-- którego nazwa stoi w wierszu.

CREATE OR REPLACE FUNCTION public.pub_raport_pod_kogo(okres TEXT DEFAULT 'all')
RETURNS TABLE (
  bot         TEXT,
  operator    TEXT,
  falszowane  BIGINT,
  z_ilu_sieci BIGINT,
  kraje       TEXT[],
  ostatnio    TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT v.bot,
         v.operator,
         count(*),
         count(DISTINCT v.asn),
         COALESCE(array_agg(DISTINCT v.kraj) FILTER (WHERE v.kraj IS NOT NULL), '{}'::TEXT[]),
         max(v.odwiedzono)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.zweryfikowany IS FALSE
    AND v.odwiedzono >= public.okres_od(okres)
  GROUP BY v.bot, v.operator
  ORDER BY count(*) DESC
  LIMIT 200;
$$;

-- ---------------------------------------------------------------------------
-- 5. incydenty — skany, wyłącznie agregaty
-- ---------------------------------------------------------------------------
-- Korzysta z `zrodla_botow()`, czyli z TEJ SAMEJ punktacji, co widok bot_skany
-- i codzienny alert. Trzecia kopia progów byłaby trzecim miejscem do rozjazdu.
--
-- WHITELISTA KOLUMN, nie `select *`. Świadomie NIE publikujemy:
--   • `kanarek`  — sama obecność tej kolumny zdradzałaby istnienie pułapki,
--   • `boty_wrazliwe` — lista tożsamości przy ścieżkach wrażliwych,
--   • `punkty` i `powod` — nasza wewnętrzna ocena; publikujemy obserwacje,
--     a nie werdykt o cudzej sieci.
--
-- `prob_wrazliwych` idzie jako LICZBA, nigdy jako wykaz ścieżek: opublikowana
-- lista tego, o co pytał skaner, to gotowa mapa dla następnego.

CREATE OR REPLACE FUNCTION public.pub_raport_incydenty(okres TEXT DEFAULT '30d')
RETURNS TABLE (
  asn             INTEGER,
  kraj            TEXT,
  zadan           BIGINT,
  tozsamosci      BIGINT,
  proc_bledow     NUMERIC,
  prob_wrazliwych BIGINT,
  start           TIMESTAMPTZ,
  trwalo          INTERVAL
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT z.asn, z.kraj, z.zadan, z.tozsamosci, z.proc_bledow,
         z.wrazliwe, z.pierwsze, z.czas_trwania
  FROM public.zrodla_botow(
    CASE okres WHEN '24h' THEN 24 WHEN '7d' THEN 168 WHEN '30d' THEN 720 ELSE NULL END
  ) z
  WHERE z.punkty >= 4
  ORDER BY z.zadan DESC
  LIMIT 200;
$$;

-- ---------------------------------------------------------------------------
-- 6. w_czasie — rozkład do wykresu
-- ---------------------------------------------------------------------------
-- Granulacja zależy od okresu: 24h → godziny, 7d i 30d → dni, całość → tygodnie.

CREATE OR REPLACE FUNCTION public.pub_raport_w_czasie(okres TEXT DEFAULT '7d')
RETURNS TABLE (
  okno          TIMESTAMPTZ,
  oryginalne    BIGINT,
  falszowane    BIGINT,
  niesprawdzone BIGINT,
  razem         BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT date_trunc(
           CASE okres WHEN '24h' THEN 'hour' WHEN 'all' THEN 'week' ELSE 'day' END,
           v.odwiedzono),
         count(*) FILTER (WHERE v.zweryfikowany IS TRUE),
         count(*) FILTER (WHERE v.zweryfikowany IS FALSE),
         count(*) FILTER (WHERE v.zweryfikowany IS NULL),
         count(*)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.odwiedzono >= public.okres_od(okres)
  GROUP BY 1
  ORDER BY 1
  LIMIT 200;
$$;

-- ---------------------------------------------------------------------------
-- 7. czego_nie_bylo — czego szukały ZWERYFIKOWANE boty i nie znalazły
-- ---------------------------------------------------------------------------
-- Tylko `zweryfikowany IS TRUE`: to ma być lista braków w naszej treści, a nie
-- lista zgadywanek skanera. Typy `sekret`, `kod` i `kanarek` wykluczone —
-- prawdziwy bot i tak o nie nie pyta, a filtr jest tu jako zabezpieczenie,
-- gdyby kiedyś zapytał.

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
    AND v.status IN (404, 410)
    -- COALESCE, bo `NULL NOT IN (...)` daje NULL i wiersz wypada po cichu.
    -- Po backfillu NULL-i nie ma, ale filtr bezpieczeństwa nie może przestać
    -- działać przez to, że kiedyś dojdzie nowy typ ścieżki.
    AND COALESCE(v.sciezka_typ, 'inne') NOT IN ('sekret', 'kod', 'kanarek')
    AND v.odwiedzono >= public.okres_od(okres)
  GROUP BY v.sciezka
  ORDER BY count(*) DESC
  LIMIT 200;
$$;

-- ---------------------------------------------------------------------------
-- 8. porownanie — bieżący okres wobec poprzedniego
-- ---------------------------------------------------------------------------
-- Dla „całości" poprzedniego okresu NIE MA — funkcja zwraca wtedy NULL-e,
-- a nie zera. Zero znaczyłoby „nic się nie działo", NULL znaczy „nie ma czego
-- porównać". Na stronie o rzetelności pomiaru to nie jest ta sama rzecz.

CREATE OR REPLACE FUNCTION public.pub_raport_porownanie(okres TEXT DEFAULT '7d')
RETURNS TABLE (
  metryka     TEXT,
  biezacy     BIGINT,
  poprzedni   BIGINT,
  zmiana_proc NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  WITH dl AS (SELECT public.okres_dlugosc(okres) AS len),
  biez AS (
    SELECT count(*)                                          AS zadan,
           count(*) FILTER (WHERE v.zweryfikowany IS TRUE)    AS oryginalne,
           count(*) FILTER (WHERE v.zweryfikowany IS FALSE)   AS falszowane,
           count(*) FILTER (WHERE v.zweryfikowany IS NULL)    AS niesprawdzone,
           count(DISTINCT v.bot)                              AS tozsamosci
    FROM public.bot_visits v
    WHERE NOT v.wlasne
      AND v.odwiedzono >= public.okres_od(okres)
  ),
  -- LEFT JOIN, a nie zwykły WHERE: przy okresie „całość" (len IS NULL) warunek
  -- złączenia nie zachodzi dla żadnego wiersza, więc count(v.id) daje 0, a my
  -- zamieniamy je niżej na NULL. Zwykły WHERE dałby pusty zbiór i brak wiersza.
  poprz AS (
    SELECT d.len,
           count(v.id)                                        AS zadan,
           count(*) FILTER (WHERE v.zweryfikowany IS TRUE)     AS oryginalne,
           count(*) FILTER (WHERE v.zweryfikowany IS FALSE)    AS falszowane,
           count(*) FILTER (WHERE v.zweryfikowany IS NULL AND v.id IS NOT NULL)
                                                              AS niesprawdzone,
           count(DISTINCT v.bot)                              AS tozsamosci
    FROM dl d
    LEFT JOIN public.bot_visits v
      ON d.len IS NOT NULL
     AND NOT v.wlasne
     AND v.odwiedzono >= now() - 2 * d.len
     AND v.odwiedzono <  now() - d.len
    GROUP BY d.len
  ),
  zestaw AS (
    SELECT * FROM (
      VALUES
        (1, 'żądania ogółem'),
        (2, 'oryginalne'),
        (3, 'fałszowane'),
        (4, 'niesprawdzone'),
        (5, 'różnych tożsamości')
    ) AS t(lp, metryka)
  )
  SELECT z.metryka,
         CASE z.lp WHEN 1 THEN b.zadan WHEN 2 THEN b.oryginalne WHEN 3 THEN b.falszowane
                   WHEN 4 THEN b.niesprawdzone ELSE b.tozsamosci END,
         CASE WHEN p.len IS NULL THEN NULL ELSE
           CASE z.lp WHEN 1 THEN p.zadan WHEN 2 THEN p.oryginalne WHEN 3 THEN p.falszowane
                     WHEN 4 THEN p.niesprawdzone ELSE p.tozsamosci END
         END,
         CASE WHEN p.len IS NULL THEN NULL ELSE
           round(100.0 * (
             (CASE z.lp WHEN 1 THEN b.zadan WHEN 2 THEN b.oryginalne WHEN 3 THEN b.falszowane
                        WHEN 4 THEN b.niesprawdzone ELSE b.tozsamosci END)
             - (CASE z.lp WHEN 1 THEN p.zadan WHEN 2 THEN p.oryginalne WHEN 3 THEN p.falszowane
                          WHEN 4 THEN p.niesprawdzone ELSE p.tozsamosci END)
           ) / NULLIF(
             (CASE z.lp WHEN 1 THEN p.zadan WHEN 2 THEN p.oryginalne WHEN 3 THEN p.falszowane
                        WHEN 4 THEN p.niesprawdzone ELSE p.tozsamosci END), 0), 1)
         END
  FROM zestaw z, biez b, poprz p
  ORDER BY z.lp;
$$;

-- ---------------------------------------------------------------------------
-- 9. UPRAWNIENIA
-- ---------------------------------------------------------------------------
-- W PostgreSQL EXECUTE domyślnie przysługuje PUBLIC, więc samo GRANT nic nie
-- zawęża — najpierw odbieramy, potem nadajemy imiennie.

DO $$
DECLARE f TEXT;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'pub_raport_kto_byl', 'pub_raport_co_odwiedzali', 'pub_raport_sygnatura',
    'pub_raport_pod_kogo', 'pub_raport_incydenty', 'pub_raport_w_czasie',
    'pub_raport_czego_nie_bylo', 'pub_raport_porownanie'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%I(TEXT) FROM PUBLIC', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(TEXT) TO anon, authenticated', f);
  END LOOP;
END $$;

REVOKE ALL ON FUNCTION public.okres_od(TEXT)      FROM PUBLIC;
REVOKE ALL ON FUNCTION public.okres_dlugosc(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.okres_od(TEXT)      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.okres_dlugosc(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 10. WIDOKI pub_* PRZEPIĘTE NA FUNKCJE
-- ---------------------------------------------------------------------------
-- Po tej zmianie liczby w mirrorze, feedzie i raportach wychodzą z JEDNEGO
-- miejsca. Kolumny i nazwy widoków bez zmian — worker i trasa React czytają
-- po nazwach, więc nic po tamtej stronie nie wymaga poprawki.

DROP VIEW IF EXISTS public.pub_bot_wg_bota;
CREATE VIEW public.pub_bot_wg_bota AS
SELECT r.operator, r.bot, r.kategoria, r.zadan, r.oryginalne, r.falszowane, r.niesprawdzone
FROM public.pub_raport_kto_byl('all') r
WHERE r.zadan >= 3
ORDER BY r.oryginalne DESC, r.zadan DESC;

COMMENT ON VIEW public.pub_bot_wg_bota IS
  'Nakładka na pub_raport_kto_byl(''all''), z progiem 3 żądań. Wysoka liczba w kolumnie `falszowane` mówi o rozpoznawalności marki, nie o nieuczciwości operatora — ktoś kradnie tę nazwę, bo strony ją przepuszczają.';

DROP VIEW IF EXISTS public.pub_bot_zachowanie;
CREATE VIEW public.pub_bot_zachowanie AS
SELECT r.grupa,
       r.okres_pomiaru AS okres,
       r.zadan, r.odbite, r.proc_bledow, r.sredni_rozmiar, r.roznych_sciezek
FROM public.pub_raport_sygnatura('all') r;

COMMENT ON VIEW public.pub_bot_zachowanie IS
  'Nakładka na pub_raport_sygnatura(''all''). Kolumna `okres` rozdziela dane sprzed i po zmianie odpowiedzi serwera 05.09.2026 — bez tego szereg pokazywałby skok, który zrobił serwer, nie boty.';

-- Raport „pod kogo się podszywano" dostaje własny widok, bo Część 3 zlecenia
-- wymaga go w mirrorze i w feedzie. Jako widok wchodzi do istniejącej listy
-- pobieranej przez workera i nie wymaga ani linijki nowego kodu po tamtej stronie.
DROP VIEW IF EXISTS public.pub_bot_pod_kogo;
CREATE VIEW public.pub_bot_pod_kogo AS
SELECT r.bot, r.operator, r.falszowane, r.z_ilu_sieci, r.kraje, r.ostatnio
FROM public.pub_raport_pod_kogo('all') r;

COMMENT ON VIEW public.pub_bot_pod_kogo IS
  'Nakładka na pub_raport_pod_kogo(''all''). Kolumna `falszowane` mierzy, ile razy KTOŚ OBCY użył tej nazwy — to miara rozpoznawalności bota, nie zarzut wobec jego operatora.';

GRANT SELECT ON public.pub_bot_wg_bota    TO anon, authenticated;
GRANT SELECT ON public.pub_bot_zachowanie TO anon, authenticated;
GRANT SELECT ON public.pub_bot_pod_kogo   TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 11. UTWARDZENIE: pg_temp w search_path WSZYSTKICH funkcji SECURITY DEFINER
-- ---------------------------------------------------------------------------
-- Zlecenie wymaga `set search_path = public, pg_temp` dla nowych funkcji.
-- Przy sprawdzaniu okazało się, że problem jest szerszy: w repo są 33 funkcje
-- z ustawionym search_path i ANI JEDNA nie wymienia pg_temp.
--
-- Dlaczego to ma znaczenie: gdy pg_temp nie jest wypisany, PostgreSQL
-- przeszukuje go PIERWSZY przy nazwach relacji. Funkcja SECURITY DEFINER
-- z nieskwalifikowaną nazwą tabeli daje się wtedy przechwycić tabelą tymczasową
-- założoną przez wywołującego — a taka funkcja działa z prawami właściciela.
-- U nas ryzyko jest niskie, bo prawie wszędzie piszemy `public.bot_visits`
-- jawnie, ale „prawie" nie jest argumentem przy zabezpieczeniu, które kosztuje
-- jedną pętlę.
--
-- Pętla zamiast listy nazw: sygnatury z argumentami trzeba by przepisać ręcznie,
-- a pomyłka w jednej z 33 przechodzi niezauważona. `oid::regprocedure` podaje
-- gotową, poprawną sygnaturę każdej z nich.

DO $$
DECLARE
  f        RECORD;
  _sciezka TEXT;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure::TEXT AS sygnatura, p.proconfig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
  LOOP
    SELECT split_part(c, '=', 2) INTO _sciezka
    FROM unnest(COALESCE(f.proconfig, '{}'::TEXT[])) AS c
    WHERE c LIKE 'search_path=%'
    LIMIT 1;

    IF _sciezka IS NULL OR btrim(_sciezka) = '' THEN
      _sciezka := 'public';
    END IF;

    IF position('pg_temp' IN _sciezka) = 0 THEN
      EXECUTE format('ALTER FUNCTION %s SET search_path = %s', f.sygnatura, _sciezka || ', pg_temp');
      RAISE NOTICE 'pg_temp dopisany: %', f.sygnatura;
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 12. SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   set role anon;
--   select count(*) from public.bot_visits;                  -- ma dać BŁĄD uprawnień
--   select * from public.pub_raport_kto_byl('7d') limit 5;   -- ma zadziałać
--   select * from public.pub_raport_co_odwiedzali('30d');    -- bez sekret/kod/kanarek
--   select count(*) from public.pub_raport_kto_byl('; drop table bot_visits; --');
--                                                            -- ma zwrócić liczbę, nie błąd
--   reset role;
--
--   -- czy któraś funkcja SECURITY DEFINER została bez pg_temp
--   select p.oid::regprocedure, p.proconfig
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public' and p.prosecdef
--     and not coalesce(array_to_string(p.proconfig, ','), '') like '%pg_temp%';
--                                                            -- ma być pusto
