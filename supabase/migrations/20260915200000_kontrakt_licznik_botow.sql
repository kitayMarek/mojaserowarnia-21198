-- Prywatny odczyt licznika dla aplikacji analitycznej: kontrakt licznik-botow/1.
--
-- ---------------------------------------------------------------------------
-- PO CO
-- ---------------------------------------------------------------------------
-- Aplikacja analityczna (osobne repozytorium, analiza.mojaserowarnia.pl) potrzebuje
-- ruchu botów i przyjść w pełnym rozbiciu: dzień, strona, bot. Publiczne
-- /api/raport wydaje gotowe zestawienia, a nie sumy, więc nie wystarcza.
-- Kontrakt: ProjektyLLm/ZLECENIE-aplikacja-analityczna.md, część 5.5 (plik poza repo).
--
-- Funkcję woła wyłącznie worker (worker/kontrakt-botow.js) kluczem serwisowym,
-- po sprawdzeniu klucza aplikacji. anon i authenticated nie mają do niej dostępu.
--
-- CZEGO NIE WYDAJE: adresów IP, User-Agentów, ASN, krajów ani godzin. Najdrobniejsza
-- jednostka to suma żądań jednego bota na jednej stronie jednego dnia UTC.
-- Ruch własny (znacznik test-marek i pokrewne, kolumna wlasne) jest pominięty.

CREATE OR REPLACE FUNCTION public.kontrakt_licznik_botow(_od DATE, _do DATE)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH wizyty AS (
    SELECT (v.odwiedzono AT TIME ZONE 'UTC')::date AS dzien,
           v.sciezka,
           v.bot,
           v.operator,
           COALESCE(v.kategoria, 'inne') AS kategoria,
           CASE v.zweryfikowany
             WHEN true  THEN 'potwierdzona'
             WHEN false THEN 'zaprzeczona'
             ELSE 'niesprawdzona'
           END AS weryfikacja,
           v.mirror AS wersja_dla_botow,
           v.status
    FROM public.bot_visits v
    WHERE NOT v.wlasne
      AND v.odwiedzono >= (_od::timestamp AT TIME ZONE 'UTC')
      AND v.odwiedzono <  ((_do + 1)::timestamp AT TIME ZONE 'UTC')
  ),
  sumy AS (
    SELECT dzien, sciezka, bot, operator, kategoria, weryfikacja, wersja_dla_botow,
           count(*)                                          AS zadan,
           count(*) FILTER (WHERE status BETWEEN 200 AND 299) AS s2xx,
           count(*) FILTER (WHERE status BETWEEN 300 AND 399) AS s3xx,
           count(*) FILTER (WHERE status BETWEEN 400 AND 499) AS s4xx,
           count(*) FILTER (WHERE status BETWEEN 500 AND 599) AS s5xx
    FROM wizyty
    GROUP BY dzien, sciezka, bot, operator, kategoria, weryfikacja, wersja_dla_botow
  )
  SELECT jsonb_build_object(
    'wizyty', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
               'dzien', s.dzien,
               'sciezka', s.sciezka,
               'bot', s.bot,
               'operator', s.operator,
               'kategoria', s.kategoria,
               'weryfikacja', s.weryfikacja,
               'zadan', s.zadan,
               'statusy', jsonb_build_object('2xx', s.s2xx, '3xx', s.s3xx, '4xx', s.s4xx, '5xx', s.s5xx),
               'wersja_dla_botow', s.wersja_dla_botow)
             ORDER BY s.dzien, s.sciezka, s.bot, s.weryfikacja, s.wersja_dla_botow)
      FROM sumy s
    ), '[]'::jsonb),
    -- Przyjścia nie mają kolumny ruchu własnego: zawierają też wejścia Marka.
    -- "ai" to modele językowe; Bing jest wyszukiwarką (od 15.09.2026 osobno od Copilota).
    'przyjscia', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
               'dzien', p.dzien,
               'sciezka', p.sciezka,
               'zrodlo', p.zrodlo,
               'ai', p.zrodlo IN ('ChatGPT', 'Perplexity', 'Copilot', 'Gemini', 'Claude'),
               'przyjsc', p.liczba)
             ORDER BY p.dzien, p.zrodlo, p.sciezka)
      FROM public.przyjscia_z_odpowiedzi p
      WHERE p.dzien BETWEEN _od AND _do
    ), '[]'::jsonb)
  );
$$;

COMMENT ON FUNCTION public.kontrakt_licznik_botow(DATE, DATE) IS
  'Kontrakt licznik-botow/1 dla aplikacji analitycznej: dzienne sumy wizyt botów (bez ruchu własnego) i przyjść w okresie od-do (dni UTC, włącznie). Bez IP, User-Agentów, ASN i godzin. Woła tylko worker kluczem serwisowym, po sprawdzeniu klucza aplikacji.';

REVOKE ALL ON FUNCTION public.kontrakt_licznik_botow(DATE, DATE) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.kontrakt_licznik_botow(DATE, DATE) TO service_role;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   select jsonb_array_length(k->'wizyty')    as wierszy_wizyt,
--          jsonb_array_length(k->'przyjscia') as wierszy_przyjsc
--   from (select public.kontrakt_licznik_botow(current_date - 7, current_date - 1) k) t;
