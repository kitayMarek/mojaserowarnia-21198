-- Druga strona pomiaru: czy po cytowaniu KTOKOLWIEK przychodzi.
--
-- ---------------------------------------------------------------------------
-- SKAD TO PYTANIE
-- ---------------------------------------------------------------------------
-- Nasz licznik mierzy boty. Google Analytics mierzy ludzi. Zaden z nich nie
-- odpowiada na pytanie, ktore okazalo sie najwazniejsze: czy czlowiek, ktory
-- dostal od modelu odpowiedz z naszej strony, przychodzi potem do zrodla.
--
-- Panel Binga: 84 cytowania samego przepisu na ser topiony.
-- Google Analytics za 28 dni: 5 sesji z Binga, 0 z ChatGPT, 2 z Gemini.
--
-- Roznica moze znaczyc dwie zupelnie rozne rzeczy i trzeba je rozdzielic:
--   (a) nikt nie klika — bo dostal odpowiedz i nie potrzebuje zrodla,
--   (b) klikaja, ale nie widzimy — bo wiekszosc klientow czatu obcina
--       odsylacz i wizyta lada w koszu "(bezposrednie)", ktory ma u nas
--       345 sesji, czyli 31% calego ruchu.
--
-- Roznica jest zasadnicza: w pierwszym przypadku cala praca nad widocznoscia
-- u modeli nie daje odwiedzin i nigdy nie da. W drugim daje, tylko mierzymy
-- slepym przyrzadem.

-- ---------------------------------------------------------------------------
-- CO ZAPISUJEMY — i dlaczego to nie sa dane osobowe
-- ---------------------------------------------------------------------------
-- Dzien, zrodlo (sama nazwa serwisu), sciezka i LICZNIK. Nic wiecej: bez
-- adresu IP, bez podpisu przegladarki, bez godziny. Z takiego wiersza nie da
-- sie odtworzyc osoby ani nawet pojedynczej wizyty — to jest slupek, nie log.
--
-- To swiadome odstepstwo od zasady "nie logujemy ludzi": nie logujemy ich
-- takze tutaj. Zliczamy zdarzenia, ktore juz zaszly, w postaci, z ktorej nikt
-- niczego o nikim sie nie dowie.

CREATE TABLE IF NOT EXISTS public.przyjscia_z_odpowiedzi (
  dzien   DATE   NOT NULL DEFAULT CURRENT_DATE,
  zrodlo  TEXT   NOT NULL,
  sciezka TEXT   NOT NULL,
  liczba  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (dzien, zrodlo, sciezka)
);

COMMENT ON TABLE public.przyjscia_z_odpowiedzi IS
  'Ile razy czlowiek przyszedl na strone Z ODPOWIEDZI modelu — rozpoznane po znaczniku utm_source albo po adresie odsylajacym. Slupek dzienny, bez adresow IP, podpisow i godzin: z tego wiersza nie da sie odtworzyc pojedynczej wizyty. Odpowiada na pytanie, ktorego nie umie zadac ani nasz licznik botow, ani Analytics.';

ALTER TABLE public.przyjscia_z_odpowiedzi ENABLE ROW LEVEL SECURITY;

-- Odczyt publiczny: to sa slupki, nie ma czego chronic, a raport ma dzialac
-- dla anonima tak samo jak reszta licznika.
DROP POLICY IF EXISTS "odczyt dla wszystkich" ON public.przyjscia_z_odpowiedzi;
CREATE POLICY "odczyt dla wszystkich" ON public.przyjscia_z_odpowiedzi
  FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- ZLICZANIE — woła worker, kluczem serwisowym
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.zlicz_przyjscie(_zrodlo TEXT, _sciezka TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  INSERT INTO public.przyjscia_z_odpowiedzi (dzien, zrodlo, sciezka, liczba)
  VALUES (CURRENT_DATE, left(_zrodlo, 60), left(_sciezka, 200), 1)
  ON CONFLICT (dzien, zrodlo, sciezka)
  DO UPDATE SET liczba = public.przyjscia_z_odpowiedzi.liczba + 1;
$$;

REVOKE ALL ON FUNCTION public.zlicz_przyjscie(TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- RAPORT
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.pub_raport_przyjscia(okres TEXT DEFAULT '30d')
RETURNS TABLE (
  zrodlo         TEXT,
  przyjsc        BIGINT,
  roznych_stron  BIGINT,
  najczestsza    TEXT,
  pierwszy_dzien DATE,
  ostatni_dzien  DATE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  WITH pod_reka AS (
    SELECT * FROM public.przyjscia_z_odpowiedzi
    WHERE dzien >= (public.okres_od(okres))::DATE
  ),
  czolowa AS (
    SELECT DISTINCT ON (zrodlo) zrodlo, sciezka
    FROM pod_reka GROUP BY zrodlo, sciezka ORDER BY zrodlo, sum(liczba) DESC
  )
  SELECT p.zrodlo, sum(p.liczba), count(DISTINCT p.sciezka),
         max(c.sciezka), min(p.dzien), max(p.dzien)
  FROM pod_reka p
  LEFT JOIN czolowa c ON c.zrodlo = p.zrodlo
  GROUP BY p.zrodlo
  ORDER BY sum(p.liczba) DESC;
$$;

COMMENT ON FUNCTION public.pub_raport_przyjscia(TEXT) IS
  'Z ktorych odpowiedzi modeli ludzie faktycznie przychodza i na ktore strony. Zero w danym zrodle znaczy jedno z dwojga: nikt nie klika albo ten klient obcina odsylacz i nie dokleja znacznika — czego z tej tabeli nie da sie rozstrzygnac.';

REVOKE ALL ON FUNCTION public.pub_raport_przyjscia(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_przyjscia(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   select * from public.pub_raport_przyjscia('30d');
