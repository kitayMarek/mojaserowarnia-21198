-- Ile wazy pytanie, a ile odpowiedz.
--
-- ---------------------------------------------------------------------------
-- SKAD TO PYTANIE
-- ---------------------------------------------------------------------------
-- Rozmiar odpowiedzi zapisujemy od pierwszego dnia, ale zaden raport go nie
-- SUMUJE — wszystkie licza tylko srednia. Przez to nikt nie umial odpowiedziec
-- na pytanie "komu wlasciwie oddajemy ten transfer".
--
-- Kosztowalo to konkretnie: obrazek Open Graph wazyl 1,02 MB i przy okolo 650
-- pobraniach tygodniowo zjadal jakies 60% calego transferu serwisu. Zaden
-- licznik tego nie zglosil, bo zaden nie patrzyl na sume bajtow. Wyszlo
-- przypadkiem, przy zupelnie innej sprawie, 8 wrzesnia 2026.
--
-- Druga strona wymiany — waga ZADANIA — nie byla mierzona wcale. A dopiero
-- obie razem cos znacza: bot przysyla kilkaset bajtow naglowkow i zabiera
-- kilkadziesiat kilobajtow tresci. Ten stosunek jest prawdziwym opisem
-- transakcji i, o ile wiem, nikt go nie publikuje.
--
-- ---------------------------------------------------------------------------
-- CZEGO TA MIARA NIE ZNACZY
-- ---------------------------------------------------------------------------
--  - Waga zadania jest liczona tak, jakby szlo po HTTP/1.1. Realne polaczenie
--    kompresuje naglowki, wiec to GORNE OSZACOWANIE.
--  - Liczymy to, co doszlo do naszego kodu, a nie to, co wyslal bot: warstwa
--    brzegowa dokleja swoje naglowki. Do porownan miedzy gosciami to nie
--    szkodzi (kazdy dostaje ten sam dodatek), do zdania "bot wyslal N bajtow"
--    szkodzi.
--  - To NIE jest rachunek za transfer. Odpowiedz z cache brzegowego nie dociera
--    do workera i tu jej nie ma. Nasze liczby sa wiec NIE WIEKSZE niz to, co
--    pokazuje panel hostingu, i roznica sama w sobie jest ciekawa.

ALTER TABLE public.bot_visits
  ADD COLUMN IF NOT EXISTS rozmiar_zadania INTEGER;

COMMENT ON COLUMN public.bot_visits.rozmiar_zadania IS
  'Bajty ZADANIA (linia zadania + naglowki + ewentualne cialo), liczone jak dla HTTP/1.1 i po dolozeniu naglowkow warstwy brzegowej. Gorne oszacowanie, dobre do porownan, zle do zdan o tym, co bot naprawde wyslal. NULL dla wierszy sprzed 8 wrzesnia 2026.';

-- ---------------------------------------------------------------------------
-- RAPORT — komu oddajemy transfer
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.pub_raport_waga(okres TEXT DEFAULT '7d')
RETURNS TABLE (
  bot            TEXT,
  operator       TEXT,
  kategoria      TEXT,
  zadan          BIGINT,
  wzialo_kb      NUMERIC,
  przyslalo_kb   NUMERIC,
  stosunek       NUMERIC,
  srednia_strona NUMERIC,
  najciezsza     TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $fn$
  WITH pod_reka AS (
    SELECT v.bot, v.operator, v.kategoria, v.sciezka, v.rozmiar, v.rozmiar_zadania
    FROM public.bot_visits v
    WHERE NOT v.wlasne
      AND v.odwiedzono >= public.okres_od(okres)
      AND v.status = 200          -- bledy nie niosa tresci, wiec nie sa handlem
  ),
  ciezkie AS (
    SELECT DISTINCT ON (p.bot) p.bot, p.sciezka, sum(p.rozmiar) AS bajty
    FROM pod_reka p
    GROUP BY p.bot, p.sciezka
    ORDER BY p.bot, sum(p.rozmiar) DESC
  )
  SELECT p.bot, p.operator, p.kategoria,
         count(*),
         round(sum(p.rozmiar) / 1024.0, 1),
         round(sum(p.rozmiar_zadania) / 1024.0, 1),
         CASE WHEN sum(p.rozmiar_zadania) > 0
              THEN round(sum(p.rozmiar)::NUMERIC / sum(p.rozmiar_zadania), 1) END,
         round(avg(p.rozmiar) / 1024.0, 1),
         max(c.sciezka)
  FROM pod_reka p
  LEFT JOIN ciezkie c ON c.bot = p.bot
  GROUP BY p.bot, p.operator, p.kategoria
  ORDER BY sum(p.rozmiar) DESC NULLS LAST;
$fn$;

COMMENT ON FUNCTION public.pub_raport_waga(TEXT) IS
  'Komu oddajemy transfer i w jakiej proporcji do tego, co przysyla. Kolumna stosunek: ile bajtow tresci wychodzi na kazdy bajt pytania. Kolumna najciezsza: adres, ktory zjadl u tego bota najwiecej bajtow — tam szukac pomylki w rodzaju obrazka wazacego megabajt. To NIE jest rachunek za transfer: odpowiedzi z cache brzegowego nie docieraja do workera i tu ich nie ma.';

REVOKE ALL ON FUNCTION public.pub_raport_waga(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_waga(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   select * from public.pub_raport_waga('7d');
--   -- kolumna przyslalo_kb bedzie pusta do czasu, az naplynie ruch po wdrozeniu
