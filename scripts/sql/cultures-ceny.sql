-- ============================================================
-- cultures — odświeżenie cen + historia zmiany
-- Uruchom w Supabase (Lovable → SQL Editor). Idempotentne.
--
-- Sprawdzone 2026-08-22: 188 pozycji, 0 błędów pobrania.
--   • 167 bez zmiany ceny
--   • 19 korekta netto → brutto (jeden sklep miał w bazie ceny netto)
--   • 1 realna zmiana ceny
--   • 1 bez ceny na stronie (produkt niedostępny)
--
-- Rynek okazał się bardzo stabilny: przez siedem tygodni zmieniła się
-- dokładnie JEDNA cena. Reszta różnic to była kwestia netto vs brutto.
-- ============================================================

-- 1) Kolumna na poprzednią cenę
alter table public.cultures add column if not exists price_previous numeric;

comment on column public.cultures.price_previous is
  'Poprzednia cena brutto — do pokazania "teraz X (było Y)". NULL = brak zmiany.';

-- 2) Wszystkie sprawdzone dostają datę weryfikacji
update public.cultures set last_checked = '2026-08-22'
  where is_active = true;

-- 3) Korekta netto -> brutto. NIE ustawiamy price_previous: cena sie nie
--    zmienila, zmienil sie sposob jej podania. Pokazanie "bylo taniej"
--    byloby wprowadzeniem uzytkownika w blad.
update public.cultures set price_numeric = 15.00, price_label = '15,00 zł'
  where name = 'ARTiVEG ME-30' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 15.00, price_label = '15,00 zł'
  where name = 'ARTiVEG TH-33' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 15.00, price_label = '15,00 zł'
  where name = 'ARTiVEG YO PRO-12' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 15.00, price_label = '15,00 zł'
  where name = 'ARTiVEG YO-9' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'BTH' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'BTMH' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'Brevibacterium Linens' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'CLCH' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'F-YO' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'Geotrichum Candidum' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'KFF' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'ML' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'ML-O' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'MLE' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'MLL' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'P-YO' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'Penicillium Candidum' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'Penicillium Roqueforti' and shop = 'Artiser.pl';
update public.cultures set price_numeric = 18.50, price_label = '18,50 zł'
  where name = 'Propionibacterium' and shop = 'Artiser.pl';

-- 4) Realne zmiany ceny — z zapisem poprzedniej wartości
update public.cultures set price_numeric = 19.00, price_label = '19,00 zł',
       price_previous = 18.00, last_changed = '2026-08-22'
  where name = 'IOTA CL1' and shop = 'Lactic.pl';

-- 5) Bez ceny na stronie — sklep oznacza produkt jako niedostępny.
--    NIE dezaktywujemy automatycznie: produkt może wrócić do sprzedaży.
--    Odkomentuj, jeśli chcesz go ukryć w bazie.
-- update public.cultures set is_active = false
--   where name = 'GAMMA 3' and shop = 'Lactic.pl';  -- ostatnia znana cena: 39.0 zł

-- 6) Kontrola po wykonaniu
-- select shop, count(*) as pozycji, count(price_previous) as ze_zmiana,
--        min(price_numeric) as najtansza, max(price_numeric) as najdrozsza
--   from public.cultures where is_active = true group by shop order by shop;
