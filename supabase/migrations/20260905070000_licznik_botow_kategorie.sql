-- Rozbudowa licznika botów: własny ruch, kategoryzacja, metoda weryfikacji,
-- podpis Web Bot Auth oraz widok wykrywający skany podatności.
--
-- Części 1–4 zlecenia ProjektyLLm/zlecenie-licznik-botow.md.
--
-- DLACZEGO WSZYSTKO W JEDNEJ MIGRACJI: migracje stosuje Marek ręcznie, więc
-- każda osobna to dodatkowa runda. Kolumny są tanie i niezależne od siebie —
-- `metoda_weryfikacji` zostaje na razie pusta i wypełni ją dopiero Część 1.

-- ---------------------------------------------------------------------------
-- 1. NOWE KOLUMNY
-- ---------------------------------------------------------------------------

ALTER TABLE public.bot_visits
  ADD COLUMN IF NOT EXISTS wlasne             BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS kategoria          TEXT,
  ADD COLUMN IF NOT EXISTS metoda_weryfikacji TEXT,
  ADD COLUMN IF NOT EXISTS ma_podpis          BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.bot_visits.wlasne IS
  'Ruch własny (testy Marka i Claude), nie zewnętrzny bot. Wierszy NIE kasujemy — są dowodem, że wykrywanie podszyć działa. Widoki analityczne je odsiewają.';
COMMENT ON COLUMN public.bot_visits.kategoria IS
  'wyszukiwarka | ai_crawler | ai_uzytkownik | narzedzie_seo | inne. Kategoryzujemy zamiast filtrować: granica wyszukiwarka/AI już nie istnieje (Googlebot karmi AI Overviews, Bingbot Copilota), a filtr kasowałby dane bezpowrotnie.';
COMMENT ON COLUMN public.bot_visits.metoda_weryfikacji IS
  'Czym rozstrzygnięto tożsamość. Boolean `zweryfikowany` nie odróżnia "sprawdzono i fałsz" od "nie umiem sprawdzić" — ta kolumna to naprawia.';
COMMENT ON COLUMN public.bot_visits.ma_podpis IS
  'Czy żądanie niosło nagłówki Web Bot Auth (Signature-Agent / Signature-Input / Signature). Na razie tylko logujemy obecność, bez walidacji — gdy adopcja wzrośnie, będą dane historyczne.';

-- Dozwolone wartości jako kontrakt między workerem a bazą. Literówka po stronie
-- workera ma być odrzucona głośno, a nie zapisana po cichu jako nowa kategoria.
ALTER TABLE public.bot_visits DROP CONSTRAINT IF EXISTS bot_visits_metoda_chk;
ALTER TABLE public.bot_visits ADD CONSTRAINT bot_visits_metoda_chk
  CHECK (metoda_weryfikacji IS NULL OR metoda_weryfikacji IN
    ('ip_lista', 'asn_operatora', 'fcrdns', 'web_bot_auth', 'brak_metody', 'blad_sprawdzenia'));

ALTER TABLE public.bot_visits DROP CONSTRAINT IF EXISTS bot_visits_kategoria_chk;
ALTER TABLE public.bot_visits ADD CONSTRAINT bot_visits_kategoria_chk
  CHECK (kategoria IS NULL OR kategoria IN
    ('wyszukiwarka', 'ai_crawler', 'ai_uzytkownik', 'narzedzie_seo', 'inne'));

-- ---------------------------------------------------------------------------
-- 2. KATEGORIA I RUCH WŁASNY — liczone w bazie, nie w workerze
-- ---------------------------------------------------------------------------
--
-- DLACZEGO TU, A NIE W JAVASCRIPCIE: te same reguły muszą objąć wiersze już
-- zapisane (backfill) i wszystkie przyszłe. Dwie implementacje — jedna w SQL do
-- backfillu, druga w workerze — rozjechałyby się przy pierwszej zmianie listy.
-- `ma_podpis` i `metoda_weryfikacji` zostają po stronie workera, bo wynikają
-- z nagłówków żądania, których baza nie widzi.

CREATE OR REPLACE FUNCTION public.kategoria_bota(_bot TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    -- Żądanie wywołane przez CZŁOWIEKA w czacie. Inna intencja niż crawl
    -- i znacznie cenniejszy sygnał — dziś ginął w jednej sumie z crawlerami.
    WHEN _bot IN ('ChatGPT-User', 'Claude-User', 'Perplexity-User', 'DuckAssistBot')
      THEN 'ai_uzytkownik'
    WHEN _bot IN ('Googlebot', 'Googlebot-Image', 'Bingbot', 'Applebot',
                  'Seznam-Bot', 'YandexBot', 'Yandex', 'Baiduspider', 'Naverbot')
      THEN 'wyszukiwarka'
    WHEN _bot IN ('GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'Claude-SearchBot',
                  'anthropic-ai', 'PerplexityBot', 'CCBot', 'Bytespider',
                  'Meta-ExternalAgent', 'Amazonbot', 'Google-Extended',
                  'cohere-ai', 'MistralAI-User', 'YouBot', 'Diffbot')
      THEN 'ai_crawler'
    WHEN _bot IN ('AhrefsBot', 'SemrushBot', 'DotBot', 'MJ12bot')
      THEN 'narzedzie_seo'
    ELSE 'inne'
  END;
$$;

COMMENT ON FUNCTION public.kategoria_bota(TEXT) IS
  'Mapuje nazwę bota na kategorię. Rozróżnienie ai_crawler / ai_uzytkownik jest istotne: pierwszy zbiera treść do indeksu, drugi znaczy, że konkretny człowiek zadał pytanie i model poszedł po naszą stronę.';

CREATE OR REPLACE FUNCTION public.oznacz_wizyte_bota()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.kategoria := public.kategoria_bota(NEW.bot);

  -- Ruch własny rozpoznajemy po DWÓCH sygnałach, bo żaden sam nie wystarcza:
  --  • znacznik w User-Agencie działa też z sieci komórkowej, gdzie ASN jest inny,
  --  • ASN łapie testy sprzed wprowadzenia znacznika (24 z 33 „fałszywych
  --    ClaudeBotów" w pierwszym pomiarze to były nasze własne sprawdzenia).
  -- COALESCE jest tu konieczne, nie kosmetyczne: `asn` bywa puste, a
  -- (NULL = 5617) daje NULL, po czym NULL OR false = NULL — czyli proba
  -- zapisania NULL do kolumny NOT NULL i wywrocenie calego insertu.
  NEW.wlasne := COALESCE(NEW.asn = 5617, false)
             OR COALESCE(NEW.ua ILIKE '%test-marek%', false)
             OR COALESCE(NEW.ua ILIKE '%Agrojelonki-Test%', false);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS oznacz_wizyte_bota_trg ON public.bot_visits;
CREATE TRIGGER oznacz_wizyte_bota_trg
  BEFORE INSERT ON public.bot_visits
  FOR EACH ROW EXECUTE FUNCTION public.oznacz_wizyte_bota();

-- Backfill istniejących wierszy tymi samymi regułami.
UPDATE public.bot_visits
SET kategoria = public.kategoria_bota(bot),
    wlasne    = COALESCE(asn = 5617, false)
             OR COALESCE(ua ILIKE '%test-marek%', false)
             OR COALESCE(ua ILIKE '%Agrojelonki-Test%', false)
WHERE kategoria IS NULL OR wlasne IS NOT TRUE;

CREATE INDEX IF NOT EXISTS bot_visits_kategoria_idx
  ON public.bot_visits (kategoria) WHERE NOT wlasne;

-- ---------------------------------------------------------------------------
-- 3. WIDOKI: odsiew ruchu własnego
-- ---------------------------------------------------------------------------
-- Bez tego statystyka Anthropic była zawyżona ośmiokrotnie względem rzeczywistości.

CREATE OR REPLACE VIEW public.bot_nie_znalazl
WITH (security_invoker = true) AS
SELECT sciezka,
       count(*)                 AS prob,
       count(DISTINCT operator) AS operatorow,
       max(odwiedzono)          AS ostatnio,
       array_agg(DISTINCT bot)  AS boty
FROM public.bot_visits
WHERE zweryfikowany IS TRUE
  AND NOT wlasne
  AND status IN (404, 410)
GROUP BY sciezka
ORDER BY prob DESC;

CREATE OR REPLACE VIEW public.bot_czytane_strony
WITH (security_invoker = true) AS
SELECT sciezka,
       count(*)                 AS wizyt,
       count(DISTINCT operator) AS operatorow,
       bool_or(mirror)          AS dostaje_mirror,
       round(avg(rozmiar))      AS sredni_rozmiar,
       max(odwiedzono)          AS ostatnio
FROM public.bot_visits
WHERE zweryfikowany IS TRUE
  AND NOT wlasne
  AND status = 200
GROUP BY sciezka
ORDER BY wizyt DESC;

-- ⚠ `kategoria` MUSI stac na koncu listy. CREATE OR REPLACE VIEW pozwala
-- wylacznie DOPISAC kolumny za istniejacymi — proba wstawienia nowej w srodek
-- jest odczytywana jako zmiana nazwy kolumny, ktora tam dotad stala, i konczy
-- sie bledem 42P16 ("cannot change name of view column"). Kolejnosc jest wiec
-- wymuszona przez Postgresa, a nie przez czytelnosc.
CREATE OR REPLACE VIEW public.bot_podszywacze
WITH (security_invoker = true) AS
SELECT operator,
       bot,
       asn,
       kraj,
       count(*)        AS zadan,
       min(odwiedzono) AS pierwsze,
       max(odwiedzono) AS ostatnie,
       kategoria
FROM public.bot_visits
WHERE zweryfikowany IS FALSE
  AND NOT wlasne
GROUP BY operator, bot, asn, kraj, kategoria
ORDER BY zadan DESC;

-- ---------------------------------------------------------------------------
-- 4. WYKRYWANIE SKANÓW PODATNOŚCI
-- ---------------------------------------------------------------------------
-- Skan z AS1004 (62 żądania, 5 podszytych tożsamości, 19 sekund) wykryliśmy
-- ręcznie i po fakcie. Ten widok zgłasza takie przypadki sam.
--
-- JEDEN SYGNAŁ NIE WYSTARCZA: wiele żądań z jednego ASN to może być zwykły
-- crawl, a jedna dziwna ścieżka to przypadek. Dopiero WIELE TOŻSAMOŚCI z tego
-- samego ASN albo pytanie o pliki konfiguracyjne świadczy o skanowaniu.

CREATE OR REPLACE VIEW public.bot_skany
WITH (security_invoker = true) AS
SELECT asn,
       kraj,
       count(*)                                                        AS zadan,
       count(DISTINCT bot)                                             AS tozsamosci,
       array_agg(DISTINCT bot)                                         AS boty,
       count(*) FILTER (WHERE status IN (404, 410))                    AS odbite,
       count(*) FILTER (WHERE sciezka ~* '(\.env|\.git/|\.js\.map$|token\.json|firebase-adminsdk|/actuator/|/laravel/|local_settings\.py|appsettings\.json|\.npmrc|wp-login\.php|/graphql|config\.(json|yml|yaml|php))')
                                                                       AS wrazliwe,
       min(odwiedzono)                                                 AS start,
       max(odwiedzono)                                                 AS koniec,
       max(odwiedzono) - min(odwiedzono)                               AS czas_trwania
FROM public.bot_visits
WHERE NOT wlasne
GROUP BY asn, kraj
HAVING count(DISTINCT bot) >= 3
    OR count(*) > 40
    OR count(*) FILTER (WHERE sciezka ~* '(\.env|\.git/|\.js\.map$|token\.json|firebase-adminsdk|/actuator/|/laravel/|local_settings\.py|appsettings\.json|\.npmrc|wp-login\.php|/graphql)') > 0
ORDER BY zadan DESC;

COMMENT ON VIEW public.bot_skany IS
  'Kandydaci na skanowanie podatności: >=3 różne tożsamości botów z jednego ASN, ponad 40 żądań albo pytanie o ścieżkę wrażliwą. NIE blokujemy automatycznie — podpis User-Agent jest z definicji niewiarygodny, a blokada po ASN uderzyłaby też w legalny ruch. Obroną jest brak wrażliwych plików: skan z AS1004 nic nie zdobył, bo pliki nie istnieją.';

-- ---------------------------------------------------------------------------
-- 5. PRZEGLĄD KATEGORII — wygodny widok do cotygodniowego rzutu oka
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.bot_kategorie
WITH (security_invoker = true) AS
SELECT kategoria,
       operator,
       zweryfikowany,
       count(*)                                     AS zadan,
       count(DISTINCT sciezka)                      AS sciezek,
       count(*) FILTER (WHERE mirror)               AS z_mirrora,
       round(avg(rozmiar))                          AS sredni_rozmiar,
       max(odwiedzono)                              AS ostatnio
FROM public.bot_visits
WHERE NOT wlasne
GROUP BY kategoria, operator, zweryfikowany
ORDER BY zadan DESC;

COMMENT ON VIEW public.bot_kategorie IS
  'Rozkład ruchu botów wg kategorii i statusu weryfikacji, bez ruchu własnego. ai_uzytkownik to żądania wywołane pytaniem człowieka w czacie — najcenniejszy sygnał w całym zbiorze.';
