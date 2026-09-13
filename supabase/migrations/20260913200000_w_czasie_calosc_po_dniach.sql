-- "Calosc" w raporcie Ruch w czasie: po dniach, dopoki pomiar jest krotki.
--
-- CO BYLO ZLE
-- Funkcja z 6 wrzesnia liczyla okres "calosc" zawsze po tygodniach. Przy
-- dziesieciu dniach pomiaru dawalo to dwa wiersze, "31 sierpnia" i "7 wrzesnia".
-- Sumy byly poprawne (610 + 6746 = 7356, tyle samo co jedenascie dni z okresu
-- 30 dni), ale wygladalo to tak, jakby calosc pokazywala MNIEJ niz miesiac.
-- Do tego tydzien podpisany swoim poniedzialkiem, 31 sierpnia, sugerowal dane
-- sprzed startu pomiaru 3 wrzesnia. Zauwazyl to Marek 13.09.2026.
--
-- CO ROBIMY
-- 1. Calosc liczymy po dniach, dopoki najstarsza wizyta ma mniej niz 60 dni.
--    Dopiero dluzsza historia przechodzi na tygodnie. 60 dni to jeszcze
--    czytelna tabela, a wizyty trzymamy 12 miesiecy, wiec tygodni wyjdzie
--    najwyzej 53.
-- 2. Pierwszy tydzien jest podpisany dniem startu pomiaru, a nie poniedzialkiem
--    sprzed niego. Przy godzinach i dniach GREATEST niczego nie zmienia, bo
--    zadna wizyta nie jest starsza niz najstarsza.
--
-- Sygnatura i kolumny bez zmian, wiec wystarcza CREATE OR REPLACE i uprawnienia
-- zostaja. Worker podbija WERSJA_RAPORTOW, zeby brzeg nie trzymal przez godzine
-- odpowiedzi w starym ukladzie.

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
  WITH poczatek AS (
    SELECT min(s.odwiedzono) AS najstarsza
    FROM public.bot_visits s
    WHERE NOT s.wlasne
  ),
  ziarno AS (
    SELECT CASE
             WHEN okres = '24h' THEN 'hour'
             WHEN okres = 'all' AND p.najstarsza < now() - INTERVAL '60 days' THEN 'week'
             ELSE 'day'
           END                                AS jednostka,
           date_trunc('day', p.najstarsza)    AS dzien_startu
    FROM poczatek p
  )
  SELECT GREATEST(date_trunc(z.jednostka, v.odwiedzono), z.dzien_startu),
         count(*) FILTER (WHERE v.zweryfikowany IS TRUE),
         count(*) FILTER (WHERE v.zweryfikowany IS FALSE),
         count(*) FILTER (WHERE v.zweryfikowany IS NULL),
         count(*)
  FROM public.bot_visits v
  CROSS JOIN ziarno z
  WHERE NOT v.wlasne
    AND v.odwiedzono >= public.okres_od(okres)
  GROUP BY 1
  ORDER BY 1
  LIMIT 200;
$$;

-- Kontrola po zastosowaniu (odczyt): dni od 3 wrzesnia, sumy jak w 30 dniach.
--   select * from public.pub_raport_w_czasie('all');
