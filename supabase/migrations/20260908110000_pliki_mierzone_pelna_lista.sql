-- Raport plikow technicznych obejmuje trzy sciezki wpisane na sztywno:
-- llms.txt, sitemap.xml, robots.txt. Od 8 wrzesnia 2026 worker mierzy takze
-- favicon.ico, og-image i cztery pliki proby formatow — i wlasnie te nowe
-- sciezki sa dzis najciekawsze, bo maja rozstrzygnac osmiokrotna roznice
-- miedzy naszym licznikiem a panelem Cloudflare dla OpenAI.
--
-- Bez tej zmiany dane sa w bazie, ale zaden raport ich nie pokazuje — czyli
-- dokladnie pulapka 3 z docs/pulapki.md: raport odsiewa to, czego w nim
-- szukamy. Poprzednim razem kosztowalo to pol dnia.
--
-- Lista musi odpowiadac PLIKI_MIERZONE w worker/index.js. Gdy tam cos
-- dochodzi lub znika, tu tez.

DROP FUNCTION IF EXISTS public.pub_raport_pliki_techniczne(TEXT);

CREATE OR REPLACE FUNCTION public.pub_raport_pliki_techniczne(okres TEXT DEFAULT '7d')
RETURNS TABLE (
  sciezka       TEXT,
  bot           TEXT,
  operator      TEXT,
  kategoria     TEXT,
  zweryfikowany BOOLEAN,
  metoda        TEXT,
  zadan         BIGINT,
  pierwszy      TIMESTAMPTZ,
  ostatni       TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT v.sciezka, v.bot, v.operator, v.kategoria,
         v.zweryfikowany, v.metoda_weryfikacji,
         count(*), min(v.odwiedzono), max(v.odwiedzono)
  FROM public.bot_visits v
  WHERE NOT v.wlasne
    AND v.odwiedzono >= public.okres_od(okres)
    AND v.sciezka IN (
      -- pliki, po ktore bot siega z wlasnej woli
      '/llms.txt', '/sitemap.xml', '/robots.txt',
      -- zasoby doczytywane przy renderowaniu strony; crawler czytajacy sam
      -- HTML nie siega po nie wcale, przegladarka agenta siega po kazda
      '/favicon.ico', '/og-image.png', '/og-image.jpg',
      -- proba formatow, do usuniecia razem z katalogiem public/proba/
      '/proba/dane.xml', '/proba/dane.txt', '/proba/dane.json', '/proba/mapa.xml'
    )
  GROUP BY v.sciezka, v.bot, v.operator, v.kategoria,
           v.zweryfikowany, v.metoda_weryfikacji
  ORDER BY v.sciezka, count(*) DESC;
$$;

COMMENT ON FUNCTION public.pub_raport_pliki_techniczne(TEXT) IS
  'Kto pobiera pliki, ktore worker mierzy osobno, z werdyktem weryfikacji tozsamosci. Pokazuje POBRANIA, nie ich skutek. Lista sciezek musi odpowiadac PLIKI_MIERZONE w worker/index.js.';

REVOKE ALL ON FUNCTION public.pub_raport_pliki_techniczne(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_pliki_techniczne(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   -- czy ikone i obrazek pobiera glownie jeden operator?
--   select * from public.pub_raport_pliki_techniczne('24h')
--   where sciezka in ('/favicon.ico', '/og-image.png', '/og-image.jpg');
