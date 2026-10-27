-- Nowe nazwy w liczniku botów i osobna kategoria „ai_inne” (27.10.2026).
--
-- ---------------------------------------------------------------------------
-- PO CO
-- ---------------------------------------------------------------------------
-- Kubełek „(nierozpoznany podpis)” urósł do 14,6 tys. żądań w 30 dni, więcej
-- niż Googlebot. Większość to skanery przebrane za przeglądarkę i tych nazwać
-- się nie da. Ale około 3,4 tys. przedstawia się nazwą, której nie mieliśmy na
-- liście (worker/wizyty-botow.js, tablica BOTY, wpis z 27.10.2026):
--
--  • ok. 1,8 tys. pod nazwami botów AI, głównie chińskich i otwartych modeli
--    (KimiBot, Qwenbot, Hunyuan, PanguBot, YiBot, ChatGLM-Spider, GrokBot...).
--    Żaden operator nie publikuje listy adresów, więc to zawsze „niesprawdzone”.
--    Zapytanie Marka z 27.10.2026: 1545 z nich przyszło z AS396982, jednej
--    sieci chmurowej, tej samej co podrobione GPTBoty i ClaudeBoty.
--    Decyzja Marka: liczyć, ale osobno. Stąd kategoria ai_inne i raport
--    pub_raport_inne_ai z numerami sieci, żeby każdy mógł ocenić sam.
--  • ok. 1,6 tys. pod nazwami prawdziwych narzędzi: crawler Mety, DuckDuckBot,
--    narzędzia SEO, skanery firm bezpieczeństwa, podglądy linków z WhatsAppa.
--
-- Migracja: (1) kategorie, (2) przepisanie historii po tych samych wzorcach
-- co w workerze, (3) nowy raport.

-- ---------------------------------------------------------------------------
-- 1. KATEGORIE
-- ---------------------------------------------------------------------------
-- Kolumna ma listę dozwolonych wartości (od 5.09.2026). Bez dopisania ai_inne
-- przepisanie historii wywraca się na pierwszym wierszu, a razem z nim cała
-- migracja (pierwsze uruchomienie 27.10.2026).
ALTER TABLE public.bot_visits DROP CONSTRAINT IF EXISTS bot_visits_kategoria_chk;
ALTER TABLE public.bot_visits ADD CONSTRAINT bot_visits_kategoria_chk
  CHECK (kategoria IS NULL OR kategoria IN
    ('wyszukiwarka', 'ai_crawler', 'ai_uzytkownik', 'narzedzie_seo', 'ai_inne', 'inne'));

CREATE OR REPLACE FUNCTION public.kategoria_bota(_bot TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN _bot IN ('ChatGPT-User', 'Claude-User', 'Perplexity-User', 'DuckAssistBot',
                  'Meta-ExternalFetcher')
      THEN 'ai_uzytkownik'
    WHEN _bot IN ('Googlebot', 'Googlebot-Image', 'Bingbot', 'Applebot',
                  'Seznam-Bot', 'YandexBot', 'Yandex', 'Baiduspider', 'Naverbot',
                  'DuckDuckBot')
      THEN 'wyszukiwarka'
    WHEN _bot IN ('GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'Claude-SearchBot',
                  'anthropic-ai', 'PerplexityBot', 'CCBot', 'Bytespider',
                  'Meta-ExternalAgent', 'Amazonbot', 'Google-Extended',
                  'cohere-ai', 'MistralAI-User', 'YouBot', 'Diffbot',
                  'Meta-WebIndexer')
      THEN 'ai_crawler'
    -- Boty AI bez żadnej metody weryfikacji. Osobno, żeby nie zawyżały
    -- ai_crawler nazwami, których nikt nie potwierdzi.
    WHEN _bot IN ('Kimi-SearchBot', 'KimiBot', 'MoonshotBot', 'xAI-SearchBot',
                  'xAI-Grok', 'GrokBot', 'Qwenbot', 'ChatGLM-Spider', 'Hunyuan',
                  'PanguBot', 'YiBot', 'Bravebot', 'OAI-AdsBot', 'ExaSearchBot',
                  'KeenableBot', 'boundless-deep-research', 'DeepSeekBot')
      THEN 'ai_inne'
    WHEN _bot IN ('AhrefsBot', 'SemrushBot', 'DotBot', 'MJ12bot',
                  'SERankingBacklinksBot', 'AwarioBot')
      THEN 'narzedzie_seo'
    ELSE 'inne'
  END;
$$;

-- ---------------------------------------------------------------------------
-- 2. HISTORIA: nazwy wstecz, te same wzorce i ta sama kolejność co w workerze
-- ---------------------------------------------------------------------------
-- Pierwszy pasujący wzorzec wygrywa (DISTINCT ON + ORDER BY k), jak w JS.
WITH wzorce(k, wz, operator, bot) AS (VALUES
  ( 1, 'Kimi-SearchBot',          'Moonshot AI', 'Kimi-SearchBot'),
  ( 2, 'KimiBot',                 'Moonshot AI', 'KimiBot'),
  ( 3, 'MoonshotBot',             'Moonshot AI', 'MoonshotBot'),
  ( 4, 'xAI-SearchBot',           'xAI',         'xAI-SearchBot'),
  ( 5, 'xAI-Grok',                'xAI',         'xAI-Grok'),
  ( 6, 'GrokBot',                 'xAI',         'GrokBot'),
  ( 7, 'Qwenbot',                 'Alibaba',     'Qwenbot'),
  ( 8, 'ChatGLM-Spider',          'Zhipu AI',    'ChatGLM-Spider'),
  ( 9, 'Hunyuan/',                'Tencent',     'Hunyuan'),
  (10, 'PanguBot',                'Huawei',      'PanguBot'),
  (11, 'YiBot',                   '01.AI',       'YiBot'),
  (12, 'Bravebot',                'Brave',       'Bravebot'),
  (13, 'OAI-AdsBot',              'inny',        'OAI-AdsBot'),
  (14, 'ExaSearchBot',            'Exa',         'ExaSearchBot'),
  (15, 'KeenableBot',             'Keenable',    'KeenableBot'),
  (16, 'boundless-deep-research', 'inny',        'boundless-deep-research'),
  (17, 'meta-webindexer',         'Meta',        'Meta-WebIndexer'),
  (18, 'Meta-ExternalFetcher',    'Meta',        'Meta-ExternalFetcher'),
  (19, 'Google-CloudVertexBot',   'Google',      'Google-CloudVertexBot'),
  (20, 'DuckDuckBot',             'inny',        'DuckDuckBot'),
  (21, 'SERankingBacklinksBot',   'inny',        'SERankingBacklinksBot'),
  (22, 'AwarioBot',               'inny',        'AwarioBot'),
  (23, 'paloaltonetworks',        'inny',        'Palo Alto Cortex Xpanse'),
  (24, 'CensysInspect',           'inny',        'CensysInspect'),
  (25, 'l9scan|leakix',           'inny',        'LeakIX'),
  (26, 'InternetMeasurement',     'inny',        'InternetMeasurement'),
  (27, 'iisec\.ac\.jp|Yokohama Institute of Information Security', 'inny', 'IISEC'),
  (28, 'metabase-cve',            'inny',        'metabase-cve-detect'),
  (29, 'visionheight',            'inny',        'visionheight'),
  (30, 'CMS-Checker',             'inny',        'CMS-Checker'),
  (31, 'Cloudflare-AgentReadiness', 'inny',      'Cloudflare-AgentReadiness'),
  (32, 'FortLineAgentShield',     'inny',        'FortLine'),
  (33, 'huSpace',                 'inny',        'huSpace'),
  (34, 'LohiSoftBot',             'inny',        'LohiSoftBot'),
  (35, 'ApcosysBot',              'inny',        'ApcosysBot'),
  (36, 'TheWebReport',            'inny',        'TheWebReport'),
  (37, 'Overture-Maps',           'inny',        'Overture-Maps'),
  (38, 'wpbot/',                  'inny',        'wpbot'),
  (39, 'jscrawler',               'inny',        'jscrawler'),
  (40, '\(Gort\)',                'inny',        'Gort'),
  (41, 'WhatsApp/',               'inny',        'WhatsApp (podgląd linku)'),
  (42, 'Google-Lens',             'inny',        'Google-Lens'),
  (43, '^DuckDuckGo/',            'inny',        'DuckDuckGo (aplikacja)'),
  (44, '^curl/',                  'inny',        'curl')
),
dopasowane AS (
  SELECT DISTINCT ON (v.id) v.id, w.operator, w.bot
  FROM public.bot_visits v
  JOIN wzorce w ON v.ua ~* w.wz
  WHERE v.bot = '(nierozpoznany podpis)'
  ORDER BY v.id, w.k
)
UPDATE public.bot_visits b
SET operator  = d.operator,
    bot       = d.bot,
    kategoria = public.kategoria_bota(d.bot)
FROM dopasowane d
WHERE b.id = d.id;

-- Meta weryfikujemy po sieci także wstecz: numer sieci był zapisywany zawsze.
UPDATE public.bot_visits
SET zweryfikowany      = (asn = 32934),
    metoda_weryfikacji = 'asn_operatora'
WHERE bot IN ('Meta-WebIndexer', 'Meta-ExternalFetcher')
  AND asn IS NOT NULL
  AND zweryfikowany IS NULL;

-- Kategorie wszystkich wierszy według nowej funkcji. Obejmuje DeepSeekBota
-- (na liście od 9.09.2026, dotąd w „inne”) i wiersze, które nowy worker
-- zdążył zapisać pod nowymi nazwami, zanim ta migracja weszła.
UPDATE public.bot_visits
SET kategoria = public.kategoria_bota(bot)
WHERE kategoria IS DISTINCT FROM public.kategoria_bota(bot);

-- ---------------------------------------------------------------------------
-- 3. RAPORT „Inne boty AI”
-- ---------------------------------------------------------------------------
-- Kolumna sieci to sedno: pokazuje, skąd przyszła dana nazwa. Prawdziwy bot
-- Tencentu czy Alibaby przyszedłby raczej z chmury własnej firmy. Numer sieci
-- publikujemy już w raporcie Incydenty; adresów IP nie zapisujemy wcale.
CREATE OR REPLACE FUNCTION public.pub_raport_inne_ai(okres TEXT DEFAULT '30d')
RETURNS TABLE (
  bot             TEXT,
  operator        TEXT,
  zadan           BIGINT,
  sieci           TEXT[],
  kraje           TEXT[],
  proc_bledow     NUMERIC,
  prob_wrazliwych BIGINT,
  stron_z_trescia BIGINT,
  ostatnio        TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT v.bot,
         min(v.operator),
         count(*),
         array_agg(DISTINCT 'AS' || v.asn ORDER BY 'AS' || v.asn) FILTER (WHERE v.asn IS NOT NULL),
         array_agg(DISTINCT v.kraj ORDER BY v.kraj) FILTER (WHERE v.kraj IS NOT NULL),
         round(100.0 * count(*) FILTER (WHERE v.status >= 400) / count(*), 1),
         count(*) FILTER (WHERE v.sciezka_typ IN ('sekret', 'kod', 'kanarek')),
         count(DISTINCT v.sciezka) FILTER (WHERE v.status = 200 AND v.sciezka_typ = 'tresc'),
         max(v.odwiedzono)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.kategoria = 'ai_inne'
    AND v.odwiedzono >= public.okres_od(okres)
  GROUP BY v.bot
  ORDER BY count(*) DESC;
$$;

COMMENT ON FUNCTION public.pub_raport_inne_ai(TEXT) IS
  'Boty AI bez metody weryfikacji (kategoria ai_inne): ile żądań, z jakich sieci i krajów, jaki odsetek błędów, ile pytań o pliki wrażliwe i ile różnych stron z treścią pobrały. Sieci pozwalają ocenić, czy nazwa jest prawdziwa.';

REVOKE ALL ON FUNCTION public.pub_raport_inne_ai(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_inne_ai(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU (same odczyty)
-- ---------------------------------------------------------------------------
--   select * from public.pub_raport_inne_ai('30d');
--   select bot, count(*) from public.bot_visits
--   where odwiedzono > now() - interval '30 days' and bot = '(nierozpoznany podpis)'
--   group by bot;   -- było 14 629, ma spaść o ok. 3,4 tys.
