-- Dwie poprawki wykryte na pierwszym prawdziwym odczycie widoków pub_*.
--
-- ---------------------------------------------------------------------------
-- 1. pub_bot_metody kłamała o skuteczności metody
-- ---------------------------------------------------------------------------
-- Pierwszy odczyt (05.09.2026, 291 żądań):
--
--     metoda          żądań  potwierdzone  zaprzeczone
--     brak_zapisu      217        39           62
--     ip_lista          46        46            0
--     asn_operatora     13        13            0
--     fcrdns             8         0            8
--     brak_metody        7         0            0
--
-- Wiersz `brak_zapisu` to 75% zbioru i na stronie czytałby się jako „nasza
-- metoda nie rozstrzyga trzech czwartych ruchu". To nieprawda: kolumna
-- `metoda_weryfikacji` powstała 5 września, a te 217 wierszy jest starszych
-- od niej. Weryfikacja działała, tylko nie zapisywała, CZYM rozstrzygnęła.
--
-- To ten sam błąd, przed którym broni `okres` w pub_bot_zachowanie: zmiana
-- instrumentu w środku szeregu, wzięta za zmianę zjawiska. Strona o rzetelności
-- pomiaru nie może opublikować takiej tabeli.
--
-- ROZWIĄZANIE: rozbicie liczy wyłącznie wiersze, dla których metoda jest
-- zapisana, a `pub_bot_podsumowanie` dostaje `z_zapisana_metoda`, żeby dało się
-- odtworzyć, jaką część zbioru ta tabela opisuje. Nie ukrywamy różnicy — mówimy,
-- czego dotyczy.

DROP VIEW IF EXISTS public.pub_bot_metody;

CREATE VIEW public.pub_bot_metody AS
SELECT metoda_weryfikacji                                 AS metoda,
       count(*)                                            AS zadan,
       count(*) FILTER (WHERE zweryfikowany IS TRUE)       AS potwierdzone,
       count(*) FILTER (WHERE zweryfikowany IS FALSE)      AS zaprzeczone,
       count(*) FILTER (WHERE ma_podpis)                   AS z_naglowkiem_podpisu
FROM public.bot_visits
WHERE NOT wlasne
  AND metoda_weryfikacji IS NOT NULL
GROUP BY 1
ORDER BY 2 DESC;

COMMENT ON VIEW public.pub_bot_metody IS
  'Czym rozstrzygnięto tożsamość, WYŁĄCZNIE dla żądań zapisanych po wprowadzeniu kolumny metoda_weryfikacji (05.09.2026). Wcześniejsze wiersze mają metodę pustą nie dlatego, że weryfikacja zawiodła, tylko dlatego, że kolumny jeszcze nie było — ich liczbę podaje pub_bot_podsumowanie.z_zapisana_metoda. Kolumna z_naglowkiem_podpisu liczy OBECNOŚĆ nagłówków Web Bot Auth, bez walidacji kryptograficznej; nie wolno jej opisać jako weryfikacji.';

-- ---------------------------------------------------------------------------
-- 2. pub_bot_podsumowanie — ile zbioru opisuje tabela metod
-- ---------------------------------------------------------------------------

DROP VIEW IF EXISTS public.pub_bot_podsumowanie;

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
  count(DISTINCT asn) FILTER (WHERE NOT wlasne)                      AS roznych_sieci,

  -- Ile wierszy ma zapisaną metodę weryfikacji. Bez tej liczby nie da się
  -- powiedzieć, jaką częścią zbioru jest tabela pub_bot_metody, a wtedy jej
  -- procenty nie znaczą nic.
  count(*) FILTER (WHERE NOT wlasne AND metoda_weryfikacji IS NOT NULL)
                                                                     AS z_zapisana_metoda,
  -- Dni pomiaru. Strona MUSI to pokazać obok liczby nagłówkowej: przy trzech
  -- dniach i trzystu żądaniach każdy wniosek jest wstępny i czytelnik ma prawo
  -- to wiedzieć bez czytania sekcji o metodologii.
  greatest(1, (now()::DATE - (SELECT min(odwiedzono)::DATE FROM public.bot_visits)))
                                                                     AS dni_pomiaru
FROM public.bot_visits;

COMMENT ON VIEW public.pub_bot_podsumowanie IS
  'Publiczne podsumowanie licznika botów. `stan_na` i `dni_pomiaru` istnieją po to, żeby każda opublikowana liczba niosła swoją datę i swoją skalę — model, który zacytuje liczbę bez jednego i drugiego, będzie ją powtarzał latami jako pewnik.';

GRANT SELECT ON public.pub_bot_metody       TO anon, authenticated;
GRANT SELECT ON public.pub_bot_podsumowanie TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Odmiana liczebników w powodach zgłoszenia
-- ---------------------------------------------------------------------------
-- „72 żądań o pliki z sekretami" jest niepoprawne — po 72 idzie „żądania".
-- Zamiast wpisywać reguły odmiany polskiej do SQL-a, odwracam szyk: liczba na
-- końcu, po dwukropku. Forma odporna na każdy liczebnik i krótsza.
--
-- Te teksty mają trafić na publiczną stronę, więc gramatyka przestaje być
-- kosmetyką: literówka w tabeli, która zarzuca komuś skanowanie, obniża
-- wiarygodność całego pomiaru.

CREATE OR REPLACE FUNCTION public.zrodla_botow(_godzin INTEGER DEFAULT NULL)
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

         -- Punktacja bez zmian względem migracji 20260906080000 — zmienia się
         -- wyłącznie brzmienie kolumny `powod`.
           (CASE WHEN s.wrazliwe >= 5 THEN 5
                 WHEN s.wrazliwe >= 1 THEN 2
                 ELSE 0 END)
         + (CASE WHEN s.kanarek >= 1 THEN 2 ELSE 0 END)
         + (CASE WHEN s.zadan >= 10
                  AND s.odbite::NUMERIC / s.zadan >= 0.20
                 THEN 2 ELSE 0 END)
         + (CASE WHEN s.zadan >= 20
                  AND s.zadan::NUMERIC / GREATEST(s.minut_aktywnych, 1) >= 20
                 THEN 2 ELSE 0 END)
         + (CASE WHEN s.tozsamosci >= 6 THEN 2
                 WHEN s.tozsamosci >= 3 THEN 1
                 ELSE 0 END)
         AS punkty,

         COALESCE((
           SELECT array_agg(p) FROM unnest(ARRAY[
           CASE WHEN s.wrazliwe >= 1
                THEN format('żądań o pliki z sekretami: %s', s.wrazliwe) END,
           CASE WHEN s.kanarek >= 1
                THEN 'wszedł na ścieżkę zakazaną w robots.txt' END,
           CASE WHEN s.zadan >= 10 AND s.odbite::NUMERIC / s.zadan >= 0.20
                THEN format('odpowiedzi z błędem: %s%% (zgaduje adresy)',
                            round(100.0 * s.odbite / s.zadan, 0)) END,
           CASE WHEN s.zadan >= 20
                 AND s.zadan::NUMERIC / GREATEST(s.minut_aktywnych, 1) >= 20
                THEN format('żądań na minutę: %s',
                            round(s.zadan::NUMERIC / GREATEST(s.minut_aktywnych, 1), 0)) END,
           CASE WHEN s.tozsamosci >= 3
                THEN format('różnych tożsamości z jednej sieci: %s', s.tozsamosci) END
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

REVOKE ALL ON FUNCTION public.zrodla_botow(INTEGER) FROM PUBLIC, anon;
