-- =====================================================================
-- WIZYTY BOTÓW MODELI JĘZYKOWYCH — własny, weryfikowany licznik
--
-- PO CO TO JEST: 2026-09-03 ustaliliśmy doświadczalnie, że Cloudflare
-- AI Crawl Control przypisuje żądanie do operatora na podstawie samego
-- nagłówka User-Agent. Dwa `curl` z polskiego IP i nagłówkiem PerplexityBot
-- podbiły licznik "AI Answer retrievals" z 16 na 18, a Perplexity z 5 na 7.
-- Panel nie odróżnia prawdziwego bota od podszywacza, więc nie nadaje się
-- pod decyzje. Ta tabela ma dawać to, czego on nie daje: rozstrzygnięcie,
-- czy żądanie naprawdę przyszło z sieci operatora.
--
-- CZEGO TU NIE BĘDZIE: treści zapytania użytkownika. Żaden bot jej nie
-- przekazuje i nie przekaże — to cudze dane. Najbliższym przybliżeniem
-- "czego szukał" jest kolumna status: 404/410 znaczy "szukał i nie znalazł".
--
-- PRYWATNOŚĆ: nie zapisujemy adresu IP ani niczego, co wskazuje osobę.
-- Do rozpoznania podszywacza wystarczy numer sieci (ASN) i kraj — jedno
-- i drugie opisuje serwerownię, nie człowieka.
--
-- URUCHOMIĆ w Supabase SQL editor. Idempotentne.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.bot_visits (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  odwiedzono    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Kto twierdzi, że przyszedł
  operator      TEXT NOT NULL,        -- 'OpenAI' | 'Anthropic' | 'Perplexity' | 'inny'
  bot           TEXT NOT NULL,        -- 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', ...

  -- Czy to prawda. NULL nie znaczy "nie" — patrz komentarz kolumny.
  zweryfikowany BOOLEAN,

  -- Gdzie był i co dostał
  sciezka       TEXT NOT NULL,
  status        SMALLINT NOT NULL,
  rozmiar       INTEGER,              -- bajty treści, gdy serwer podał content-length
  mirror        BOOLEAN NOT NULL DEFAULT false,  -- czy dostał statyczny mirror, czy skorupę React

  -- Skąd, na tyle ogólnie, żeby nie były to dane osobowe
  asn           INTEGER,
  kraj          TEXT,
  ua            TEXT
);

COMMENT ON TABLE public.bot_visits IS
  'Wizyty crawlerów modeli językowych, z weryfikacją po oficjalnych zakresach IP operatorów. Mierzy DOSTĘP do treści, nie cytowanie — cytowania nadal tylko w Bing Webmaster AI Performance.';

COMMENT ON COLUMN public.bot_visits.zweryfikowany IS
  'true = IP mieści się w liście opublikowanej przez operatora. false = PODSZYWACZ (mamy listę, IP w niej nie ma). NULL = operator nie publikuje listy w obsługiwanym formacie, więc nie da się rozstrzygnąć. Do analizy liczyć wyłącznie true; false jest sygnałem nadużycia, nie ruchem.';

COMMENT ON COLUMN public.bot_visits.status IS
  'Kod odpowiedzi. 200 = znalazł. 404/410 = szukał i nie znalazł (odpowiednik "Demand signals" Cloudflare, ale bez limitu 24 godzin). 301 = przekierowany.';

COMMENT ON COLUMN public.bot_visits.mirror IS
  'true = bot dostał statyczny mirror .html (pełna treść). false = trafił na trasę React, czyli bez JS zobaczył skorupę. Kolumna do wyłapywania luk w warstwie mirrorów.';

-- Indeksy pod trzy pytania, które będziemy zadawać najczęściej:
-- "co się działo ostatnio", "czego boty nie znalazły", "kto podszywa".
CREATE INDEX IF NOT EXISTS bot_visits_czas_idx    ON public.bot_visits (odwiedzono DESC);
CREATE INDEX IF NOT EXISTS bot_visits_sciezka_idx ON public.bot_visits (sciezka);
CREATE INDEX IF NOT EXISTS bot_visits_status_idx  ON public.bot_visits (status) WHERE status >= 300;
CREATE INDEX IF NOT EXISTS bot_visits_falszywe_idx ON public.bot_visits (operator) WHERE zweryfikowany IS FALSE;


-- ---------------------------------------------------------------------
-- RLS — zapisuje wyłącznie worker (service_role), czyta wyłącznie admin
-- ---------------------------------------------------------------------
-- Świadomie NIE dajemy prawa INSERT roli anon. Klucz anon jest publiczny
-- (siedzi w buildzie SPA), więc polityka "anon może wstawiać" pozwoliłaby
-- każdemu dopisywać zmyślone wizyty — czyli odtworzyłaby dokładnie tę wadę
-- panelu Cloudflare, dla której ta tabela powstaje. Worker łączy się kluczem
-- service_role, który omija RLS i nigdy nie opuszcza sekretów Cloudflare.
ALTER TABLE public.bot_visits ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bot_visits'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.bot_visits', pol.policyname);
  END LOOP;
END;
$$;

CREATE POLICY "Only admins can view bot visits"
ON public.bot_visits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));


-- ---------------------------------------------------------------------
-- RETENCJA — 12 miesięcy, sprzątanie okazjonalne przy zapisie
-- ---------------------------------------------------------------------
-- Wzorzec 1:1 z cleanup_analytics_retention (migracja RODO 2026-08-01):
-- ~1 na 200 insertów, żeby nie obciążać każdego zapisu.
CREATE OR REPLACE FUNCTION public.cleanup_bot_visits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.bot_visits
  WHERE odwiedzono < now() - INTERVAL '12 months';
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_cleanup_bot_visits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF random() < 0.005 THEN
    PERFORM public.cleanup_bot_visits();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cleanup_bot_visits_on_insert ON public.bot_visits;
CREATE TRIGGER cleanup_bot_visits_on_insert
  AFTER INSERT ON public.bot_visits
  FOR EACH ROW EXECUTE FUNCTION public.trigger_cleanup_bot_visits();


-- ---------------------------------------------------------------------
-- WIDOKI — trzy pytania, dla których ta tabela powstała
-- ---------------------------------------------------------------------
-- Widoki dziedziczą RLS tabeli źródłowej (security_invoker), więc też są
-- widoczne wyłącznie dla admina.

-- 1. Czego boty szukały i NIE znalazły. Najcenniejsza rzecz w całym zbiorze:
--    to samo, co Cloudflare pokazuje jako "Demand signals", ale z historią.
CREATE OR REPLACE VIEW public.bot_nie_znalazl
WITH (security_invoker = true) AS
SELECT sciezka,
       count(*)                        AS prob,
       count(DISTINCT operator)        AS operatorow,
       max(odwiedzono)                 AS ostatnio,
       array_agg(DISTINCT bot)         AS boty
FROM public.bot_visits
WHERE zweryfikowany IS TRUE
  AND status IN (404, 410)
GROUP BY sciezka
ORDER BY prob DESC;

-- 2. Które strony boty faktycznie czytają — i czy dostają mirror, czy skorupę.
--    Wiersz z mirror=false i dużym ruchem to luka w warstwie statycznej.
CREATE OR REPLACE VIEW public.bot_czytane_strony
WITH (security_invoker = true) AS
SELECT sciezka,
       count(*)                                    AS wizyt,
       count(DISTINCT operator)                    AS operatorow,
       bool_or(mirror)                             AS dostaje_mirror,
       round(avg(rozmiar))                         AS sredni_rozmiar,
       max(odwiedzono)                             AS ostatnio
FROM public.bot_visits
WHERE zweryfikowany IS TRUE
  AND status = 200
GROUP BY sciezka
ORDER BY wizyt DESC;

-- 3. Podszywacze — ruch, który Cloudflare policzyłby jako prawdziwy.
--    Jeśli ta liczba jest niezerowa, panel CF kłamie o dokładnie tyle.
CREATE OR REPLACE VIEW public.bot_podszywacze
WITH (security_invoker = true) AS
SELECT operator,
       bot,
       asn,
       kraj,
       count(*)        AS zadan,
       min(odwiedzono) AS pierwsze,
       max(odwiedzono) AS ostatnie
FROM public.bot_visits
WHERE zweryfikowany IS FALSE
GROUP BY operator, bot, asn, kraj
ORDER BY zadan DESC;

COMMENT ON VIEW public.bot_nie_znalazl IS
  'Adresy, o które pytały zweryfikowane boty i dostały 404/410. Kandydaci na nowe strony albo na przekierowanie.';
COMMENT ON VIEW public.bot_czytane_strony IS
  'Co boty realnie czytają. dostaje_mirror=false przy wysokim ruchu = strona istnieje tylko jako trasa React, bot widzi skorupę.';
COMMENT ON VIEW public.bot_podszywacze IS
  'Ruch podszywający się pod operatorów AI. Miara zafałszowania liczników opartych o User-Agent (np. Cloudflare AI Crawl Control).';
