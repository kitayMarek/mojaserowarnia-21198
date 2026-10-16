-- Raport „Pytania z czatów”: tydzień po tygodniu, ile razy model pobrał od nas
-- stronę, bo człowiek zadał mu pytanie w czacie.
--
-- ---------------------------------------------------------------------------
-- PO CO
-- ---------------------------------------------------------------------------
-- Marek, 16.10.2026, po przeglądzie licznika z innym modelem: „ai_uzytkownik
-- oryginalne” to jedyny ruch botów, za którym na pewno stoi człowiek z pytaniem.
-- Raport `po_co_przychodza` pokazuje strony, ale miesza okresy i kategorie;
-- tu widać trend w tygodniach i trzy najczęstsze strony każdego tygodnia.
--
-- Filtry jak w `po_co_przychodza`: tylko potwierdzone (zweryfikowany IS TRUE),
-- tylko pobrania (status 200), tylko treść (sciezka_typ = 'tresc'), bez ruchu
-- własnego. Tydzień od poniedziałku, w UTC.
--
-- Kolumny operatorów są stałe, bo w kategorii ai_uzytkownik są dziś trzej
-- (ChatGPT-User, Claude-User, Perplexity-User) i DuckAssistBot w „inne”.

CREATE OR REPLACE FUNCTION public.pub_raport_czaty(okres TEXT DEFAULT 'all')
RETURNS TABLE (
  tydzien       DATE,
  chatgpt       BIGINT,
  claude        BIGINT,
  perplexity    BIGINT,
  inne          BIGINT,
  razem         BIGINT,
  roznych_stron BIGINT,
  najczestsze   TEXT[]
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  WITH v AS (
    SELECT (date_trunc('week', b.odwiedzono AT TIME ZONE 'UTC'))::date AS tydzien,
           b.operator,
           b.sciezka
    FROM public.bot_visits b
    WHERE NOT b.wlasne
      AND b.zweryfikowany IS TRUE
      AND b.kategoria = 'ai_uzytkownik'
      AND b.status = 200
      AND b.sciezka_typ = 'tresc'
      AND b.odwiedzono >= public.okres_od(okres)
  ),
  strony AS (
    SELECT tydzien, sciezka, count(*) AS n,
           row_number() OVER (PARTITION BY tydzien ORDER BY count(*) DESC, sciezka) AS miejsce
    FROM v
    GROUP BY tydzien, sciezka
  )
  SELECT v.tydzien,
         count(*) FILTER (WHERE v.operator = 'OpenAI'),
         count(*) FILTER (WHERE v.operator = 'Anthropic'),
         count(*) FILTER (WHERE v.operator = 'Perplexity'),
         count(*) FILTER (WHERE v.operator NOT IN ('OpenAI', 'Anthropic', 'Perplexity')),
         count(*),
         count(DISTINCT v.sciezka),
         (SELECT array_agg(s.sciezka || ' (' || s.n || ')' ORDER BY s.miejsce)
            FROM strony s
           WHERE s.tydzien = v.tydzien AND s.miejsce <= 3)
  FROM v
  GROUP BY v.tydzien
  ORDER BY v.tydzien DESC;
$$;

COMMENT ON FUNCTION public.pub_raport_czaty(TEXT) IS
  'Tydzień po tygodniu: potwierdzone pobrania treści przez boty działające na prośbę człowieka w czacie (kategoria ai_uzytkownik), w podziale na operatora, z trzema najczęstszymi stronami tygodnia. Tydzień od poniedziałku, UTC.';

REVOKE ALL ON FUNCTION public.pub_raport_czaty(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_czaty(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   select * from public.pub_raport_czaty('all');
