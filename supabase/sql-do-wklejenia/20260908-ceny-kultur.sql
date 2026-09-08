-- Odswiezenie cen kultur, 8 wrzesnia 2026. Sprawdzono 188 pozycji.
-- Do wklejenia w Supabase -> SQL Editor. Claude nie pisze do bazy.
--
-- Poprzednie sprawdzenie: 22 sierpnia 2026. Przez 17 dni zmienilo sie piec
-- cen (wszystkie w jednym sklepie) i zniknal jeden produkt.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. PIEC ZMIAN CENY — Lactic.pl wyrownal czesc oferty do 19 zl
-- ---------------------------------------------------------------------------
-- price_previous zostaje wypelnione, zeby strona mogla pokazac "19,00 zl
-- (bylo 17,00)". To jest jedyna tresc w serwisie, ktora naprawde sie zmienia,
-- wiec pokazanie zmiany jest tu warte wiecej niz sama liczba.

UPDATE public.cultures SET
  price_previous = price_numeric,
  price_numeric  = 19.00,
  price_label    = '19,00 zł',
  last_changed   = DATE '2026-09-08',
  last_checked   = DATE '2026-09-08'
WHERE shop = 'Lactic.pl'
  AND name IN ('DELTA 2', 'IOTA 4', 'IOTA KEFIR 2', 'IOTA KEFIR 3', 'IOTA PROBI 1');

-- ---------------------------------------------------------------------------
-- 2. GAMMA 3 — produkt zniknal, link dziala
-- ---------------------------------------------------------------------------
-- Strona lactic.pl/pl/p/GAMMA-3/1346 oddaje kod 200, ale jest pusta: tytul to
-- samo "Lactic.pl", bez naglowka, nazwy produktu i ceny. Kazde sprawdzenie
-- patrzace tylko na kod odpowiedzi uznaloby ja za zywa.
--
-- Zostawiamy pozycje w bazie (decyzja Marka) — kultura istnieje i ktos moze jej
-- szukac — ale ZAMIAST CENY stoi jawne "Niedostepna". Cicha cena z 22 sierpnia
-- wygladalaby na aktualna, a to jest gorsze od widocznej luki.
--
-- price_numeric = NULL, nie 0: zero znaczyloby "za darmo" i w sortowaniu
-- po cenie wyskakiwaloby na pierwsze miejsce jako najtansze.

UPDATE public.cultures SET
  price_previous = NULL,
  price_numeric  = NULL,
  price_label    = 'Niedostępna',
  last_checked   = DATE '2026-09-08'
WHERE shop = 'Lactic.pl' AND name = 'GAMMA 3';

-- ---------------------------------------------------------------------------
-- 3. RESZTA — sprawdzone i bez zmian
-- ---------------------------------------------------------------------------
-- Data sprawdzenia jest tu wazniejsza niz brak zmiany: mowi czytelnikowi
-- (i modelowi), ze cena jest z dzisiaj, a nie sprzed trzech tygodni.

UPDATE public.cultures SET last_checked = DATE '2026-09-08'
WHERE shop IN ('Artiser.pl', 'Lactic.pl', 'Serowar.pl', 'GAP Poland', 'Wańczykówka')
  AND name NOT IN ('DELTA 2', 'IOTA 4', 'IOTA KEFIR 2', 'IOTA KEFIR 3',
                   'IOTA PROBI 1', 'GAMMA 3');

COMMIT;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   select name, shop, price_label, price_numeric, price_previous, last_checked
--   from public.cultures
--   where name in ('DELTA 2','IOTA 4','IOTA KEFIR 2','IOTA KEFIR 3',
--                  'IOTA PROBI 1','GAMMA 3')
--   order by name;
--
--   -- ile pozycji ma date dzisiejsza (powinno byc 188):
--   select count(*) from public.cultures where last_checked = date '2026-09-08';
