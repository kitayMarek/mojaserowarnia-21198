-- Strona, ktora ODPOWIEDZIALA — nowa jednostka zamiast liczby zadan.
--
-- ---------------------------------------------------------------------------
-- SKAD TO PYTANIE
-- ---------------------------------------------------------------------------
-- Raport pub_raport_mnoznik pokazal, ze jedno wejscie to od 1,2 do 14,3 zadan,
-- zaleznie od bota. Pomiar 7 dni:
--
--   GPTBot          6 wejsc  ->  86 zadan  (14,3 na wejscie)
--   ChatGPT-User   43 wejscia -> 104 zadania (2,4 na wejscie)
--
-- Prawie tyle samo zadan, a zdarzen szesc razy mniej. Kto czyta liczbe zadan
-- jako "zainteresowanie", porownuje 43 zadane pytania z szescioma przemiałami
-- serwisu i widzi remis.
--
-- Wniosek: LICZBA ZADAN NIE JEST MIARA ZAINTERESOWANIA. Zadania mierza
-- strategie agenta, nie ciekawosc czlowieka, ktory go uruchomil.
--
-- ---------------------------------------------------------------------------
-- CO PROBUJEMY ZMIERZYC ZAMIAST TEGO
-- ---------------------------------------------------------------------------
-- Sesja, ktora zaczela sie na jakiejs stronie I NA NIEJ SIE SKONCZYLA, to
-- najczystszy slad, jaki mamy: model przyszedl po cos konkretnego, dostal to
-- i nie musial szukac dalej. Odwrotnie — sesja, ktora zaczyna sie na stronie
-- i rozlazi na kilkanascie innych, moze znaczyc, ze pierwsza nie wystarczyla.
--
-- ⚠ MOZE, nie ZNACZY. Tego nie da sie dzis rozstrzygnac: nie wiemy, o co ktos
-- zapytal, nie widzimy podsumowania i nie widzimy cytowania (docs/pulapki.md
-- nr 10). Ten raport podaje LICZBY, nie interpretacje — a interpretacja niech
-- stoi obok, wyrazona jako przypuszczenie, dopoki nie bedzie czym jej sprawdzic.
--
-- Kolumna kategoria jest tu istotna: 'ai_uzytkownik' znaczy, ze zadanie
-- wywolal czlowiek pytaniem w czacie. To jedyna kategoria, w ktorej slowo
-- "zainteresowanie" w ogole ma sens. Crawler nie jest niczym zainteresowany —
-- on wykonuje plan.

CREATE OR REPLACE FUNCTION public.pub_raport_co_odpowiedzialo(okres TEXT DEFAULT '7d')
RETURNS TABLE (
  sciezka          TEXT,
  kategoria        TEXT,
  sesji_zaczeto    BIGINT,
  sesji_skonczono  BIGINT,
  sesji_jednym     BIGINT,
  zadan_lacznie    BIGINT,
  roznych_botow    BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $fn$
  WITH s AS (SELECT * FROM public.bot_sesje_okna(okres)),
  granice AS (
    SELECT s.bot, s.asn, s.kraj, s.sesja,
           count(*)                                                        AS zadan,
           (array_agg(s.sciezka ORDER BY s.odwiedzono))[1]                 AS pierwsza,
           (array_agg(s.sciezka ORDER BY s.odwiedzono DESC))[1]            AS ostatnia
    FROM s
    GROUP BY s.bot, s.asn, s.kraj, s.sesja
  ),
  -- Kazda sesja wnosi swoja pierwsza i swoja ostatnia strone. Gdy sesja miala
  -- jedno zadanie, obie sa ta sama strona i dodatkowo licza sie jako "jednym".
  wklad AS (
    SELECT g.pierwsza AS sciezka, g.bot, public.kategoria_bota(g.bot) AS kategoria,
           1 AS zaczeto, 0 AS skonczono,
           CASE WHEN g.zadan = 1 THEN 1 ELSE 0 END AS jednym, g.zadan
    FROM granice g
    UNION ALL
    SELECT g.ostatnia, g.bot, public.kategoria_bota(g.bot), 0, 1, 0, 0
    FROM granice g
    WHERE g.zadan > 1
  )
  -- Grupujemy po (sciezka, kategoria), a NIE po samej sciezce: ta sama strona
  -- odwiedzana przez crawlera i przez bota wywolanego pytaniem czlowieka to
  -- dwa rozne zdarzenia i zsumowanie ich zatarloby jedyna rzecz, dla ktorej
  -- ten raport powstal.
  SELECT w.sciezka, w.kategoria,
         sum(w.zaczeto), sum(w.skonczono), sum(w.jednym),
         sum(w.zadan), count(DISTINCT w.bot)
  FROM wklad w
  GROUP BY w.sciezka, w.kategoria
  HAVING sum(w.zaczeto) + sum(w.skonczono) >= 2
  ORDER BY sum(w.jednym) DESC, sum(w.zaczeto) DESC
  LIMIT 200;
$fn$;

COMMENT ON FUNCTION public.pub_raport_co_odpowiedzialo(TEXT) IS
  'Strony, na ktorych sesja bota zaczela sie i skonczyla. Kolumna sesji_jednym — jedno wejscie, jedno zadanie, koniec — to najczystszy dostepny slad, ze model dostal to, po co przyszedl. NIE JEST to dowod: nie znamy pytania, nie widzimy podsumowania ani cytowania. Liczba zadan jest tu kolumna pomocnicza, nie miara zainteresowania.';

REVOKE ALL ON FUNCTION public.pub_raport_co_odpowiedzialo(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pub_raport_co_odpowiedzialo(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   select * from public.pub_raport_co_odpowiedzialo('7d')
--   where kategoria = 'ai_uzytkownik' limit 30;
