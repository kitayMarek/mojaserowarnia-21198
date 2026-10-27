-- ============================================================
-- cultures: odswiezenie cen kultur, 2026-10-27
-- Do uruchomienia w Supabase -> SQL Editor. Wygenerowane przez
-- scripts/gen-ceny-sql.py z scripts/kultury-data/ceny.txt i pojemnosc.txt.
-- Kazde polecenie ustawia jawne wartosci, wiec drugie uruchomienie nic nie psuje.
--
--   177 sprawdzonych bez zmiany ceny
--     9 zmian ceny (z zapisem poprzedniej)
--     0 z cena bez poprzedniej (produkt wrocil albo nie mial ceny)
--     2 zniknelo ze sklepu (zostaja, cena 'Niedostępna')
--    23 nowych albo poprawionych pojemnosci opakowania
--     0 pominietych (zostaje stara data sprawdzenia)
--     5 nowych pozycji z nowego sklepu (tylko gdy jeszcze ich nie ma)
--
-- Zastepuje niewgrany plik 20260908-ceny-kultur.sql (usuniety z repo):
-- tamte zmiany sa tu ujete na nowo, sprawdzone na zywo.
-- ============================================================

BEGIN;

-- 1. Zmiany ceny
UPDATE public.cultures SET price_numeric = 19.00,
       price_label = '19,00 zł',
       last_checked = DATE '2026-10-27',
       price_previous = 18.00,
       last_changed = DATE '2026-09-08',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'DELTA 2';
UPDATE public.cultures SET price_numeric = 19.00,
       price_label = '19,00 zł',
       last_checked = DATE '2026-10-27',
       price_previous = 18.00,
       last_changed = DATE '2026-09-08',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'IOTA 4';
UPDATE public.cultures SET price_numeric = 19.00,
       price_label = '19,00 zł',
       last_checked = DATE '2026-10-27',
       price_previous = 17.00,
       last_changed = DATE '2026-09-08',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'IOTA KEFIR 2';
UPDATE public.cultures SET price_numeric = 19.00,
       price_label = '19,00 zł',
       last_checked = DATE '2026-10-27',
       price_previous = 17.00,
       last_changed = DATE '2026-09-08',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'IOTA KEFIR 3';
UPDATE public.cultures SET price_numeric = 19.00,
       price_label = '19,00 zł',
       last_checked = DATE '2026-10-27',
       price_previous = 17.00,
       last_changed = DATE '2026-09-08',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'IOTA PROBI 1';
UPDATE public.cultures SET price_numeric = 55.00,
       price_label = '55,00 zł',
       last_checked = DATE '2026-10-27',
       price_previous = 50.00,
       last_changed = DATE '2026-10-27',
       updated_at = now()
 WHERE shop = 'Serowar.pl' AND name = 'KFB1/2';
UPDATE public.cultures SET price_numeric = 25.00,
       price_label = '25,00 zł',
       last_checked = DATE '2026-10-27',
       price_previous = 24.00,
       last_changed = DATE '2026-10-27',
       updated_at = now()
 WHERE shop = 'Wańczykówka' AND name = 'Choozit MA 4001';
UPDATE public.cultures SET price_numeric = 72.00,
       price_label = '72,00 zł',
       last_checked = DATE '2026-10-27',
       price_previous = 78.00,
       last_changed = DATE '2026-10-27',
       updated_at = now()
 WHERE shop = 'Wańczykówka' AND name = 'HOLDBAC LC';
UPDATE public.cultures SET price_numeric = 39.00,
       price_label = '39,00 zł',
       last_checked = DATE '2026-10-27',
       price_previous = 38.00,
       last_changed = DATE '2026-10-27',
       updated_at = now()
 WHERE shop = 'Wańczykówka' AND name = 'Penicillium Candidum PC Neige';

-- 2. Zniknely ze sklepu: wiersz zostaje, zamiast ceny 'Niedostępna'
UPDATE public.cultures SET price_previous = NULL,
       price_numeric = NULL,
       price_label = 'Niedostępna',
       last_checked = DATE '2026-10-27',
       updated_at = now()
 WHERE shop = 'GAP Poland' AND name = 'SR 62 LYO';
UPDATE public.cultures SET price_previous = NULL,
       price_numeric = NULL,
       price_label = 'Niedostępna',
       last_checked = DATE '2026-10-27',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'GAMMA 3';

-- 3. Pojemnosc opakowania i dawkowanie wyczytane ze stron sklepow
UPDATE public.cultures SET pack_liters = 500,
       dose_label = '1 doza / 100 L',
       updated_at = now()
 WHERE shop = 'GAP Poland' AND name = 'PBat 91 LYO';
UPDATE public.cultures SET pack_liters = 1000,
       dose_label = '1 doza / 100 L',
       updated_at = now()
 WHERE shop = 'GAP Poland' AND name = 'Protective LYO';
UPDATE public.cultures SET dose_label = '1 doza / 5 L',
       updated_at = now()
 WHERE shop = 'GAP Poland' AND name = 'SM 02 LYO';
UPDATE public.cultures SET dose_label = '1 doza / 1-3 L',
       updated_at = now()
 WHERE shop = 'GAP Poland' AND name = 'YO-B1 LYO';
UPDATE public.cultures SET pack_liters = 350,
       dose_label = '1 fiolka DL 3.5 / 350 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'ALPHA 12';
UPDATE public.cultures SET pack_liters = 250,
       dose_label = 'DL 1: 250-500 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'IOTA 2';
UPDATE public.cultures SET pack_liters = 20,
       dose_label = 'DL 1: 20-25 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'IOTA KEFIR 2';
UPDATE public.cultures SET pack_liters = 20,
       dose_label = 'DL 1: 20-25 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'IOTA KEFIR 3';
UPDATE public.cultures SET pack_liters = 20,
       dose_label = 'DL 1: 20-25 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'IOTA PROBI 1';
UPDATE public.cultures SET pack_liters = 100,
       dose_label = 'DL 1: 100 L mleka surowego',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'IOTA V';
UPDATE public.cultures SET pack_liters = 250,
       dose_label = 'DL 1: 250-500 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'KAPPA 4';
UPDATE public.cultures SET pack_liters = 100,
       dose_label = '1 fiolka / 100-200 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'SIGMA 15';
UPDATE public.cultures SET pack_liters = 100,
       dose_label = '1 fiolka / 100-200 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'SIGMA 17';
UPDATE public.cultures SET pack_liters = 100,
       dose_label = '1 dawka / 100-200 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'SIGMA 22 (Debaryomyces Hansenii)';
UPDATE public.cultures SET pack_liters = 100,
       dose_label = '1 fiolka / 100-200 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'SIGMA 30';
UPDATE public.cultures SET pack_liters = 100,
       dose_label = '1 fiolka / 100-200 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'SIGMA 54';
UPDATE public.cultures SET pack_liters = 100,
       dose_label = '1 fiolka / 100-200 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'SIGMA 55';
UPDATE public.cultures SET pack_liters = 100,
       dose_label = '1 fiolka / 100-200 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'SIGMA 63';
UPDATE public.cultures SET pack_liters = 250,
       dose_label = '1 fiolka / 250 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'SIGMA 75';
UPDATE public.cultures SET pack_liters = 250,
       dose_label = '1 fiolka / 250 L',
       updated_at = now()
 WHERE shop = 'Lactic.pl' AND name = 'SIGMA 97';
UPDATE public.cultures SET pack_liters = 1000,
       dose_label = '2 D / 1000 L',
       updated_at = now()
 WHERE shop = 'Wańczykówka' AND name = 'Choozit KL 71';
UPDATE public.cultures SET pack_liters = 10000,
       updated_at = now()
 WHERE shop = 'Wańczykówka' AND name = 'Choozit LH 100';
UPDATE public.cultures SET pack_liters = 100,
       updated_at = now()
 WHERE shop = 'Wańczykówka' AND name = 'Choozit MA 14';

-- 4. Sprawdzone, cena bez zmian: tylko data sprawdzenia
UPDATE public.cultures SET last_checked = DATE '2026-10-27', updated_at = now()
 WHERE shop = 'Artiser.pl' AND name IN (
    'ARTiVEG ME-30',
    'ARTiVEG TH-33',
    'ARTiVEG YO PRO-12',
    'ARTiVEG YO-9',
    'BTH',
    'BTMH',
    'Brevibacterium Linens',
    'CLC',
    'CLCH',
    'F-YO',
    'Geotrichum Candidum',
    'KFF',
    'ML',
    'ML-O',
    'MLE',
    'MLL',
    'P-YO',
    'Penicillium Candidum',
    'Penicillium Roqueforti',
    'Propionibacterium');
UPDATE public.cultures SET last_checked = DATE '2026-10-27', updated_at = now()
 WHERE shop = 'GAP Poland' AND name IN (
    'Brevibacterium linens',
    'EF LYO',
    'HL 06 LYO',
    'Kefir 41 LYO',
    'MP 62 LYO',
    'PB LYO',
    'PBat 91 LYO',
    'Penicillium candidum',
    'Penicillium roqueforti',
    'Protective LYO',
    'SH LYO',
    'SM 02 LYO',
    'TW 31 LYO',
    'VEGE C LYO',
    'Y 92 LYO',
    'YO 56 LYO',
    'YO-B1 LYO',
    'YPB LYO');
UPDATE public.cultures SET last_checked = DATE '2026-10-27', updated_at = now()
 WHERE shop = 'Lactic.pl' AND name IN (
    'ALPHA 10',
    'ALPHA 12',
    'ALPHA 3',
    'ALPHA 6',
    'ALPHA BLEU',
    'BETA 1',
    'BETA 8',
    'Beaugel 10 25l',
    'Beaugel 11 25l',
    'Beaugel 12',
    'Beaugel Acid 1',
    'Beaugel Bifi 1',
    'Beaugel Elben',
    'Beaugel Kefir 2',
    'Beaugel Kefir 3',
    'Beaugel Raieb 1',
    'Beaugel Soja 1',
    'Beaugel Yog 1',
    'Beaugel Yog 2',
    'Beaugel Yog 3',
    'Beaugel Yog 4',
    'DELTA 1',
    'GAMMA 1',
    'IOTA 1',
    'IOTA 2',
    'IOTA CL1',
    'IOTA CL2',
    'IOTA Ca/1',
    'IOTA Ca/2',
    'IOTA FETA',
    'IOTA FF1',
    'IOTA FF2',
    'IOTA M',
    'IOTA PETIT BLEU',
    'IOTA RACLETTE',
    'IOTA ST NECTAIRE 1',
    'IOTA V',
    'KAPPA 1',
    'KAPPA 2',
    'KAPPA 3',
    'KAPPA 4',
    'LAMBDA 10',
    'LAMBDA 12',
    'LAMBDA 3',
    'LAMBDA 6',
    'LAMBDA 7',
    'LAMBDA 8',
    'LAMBDA 9',
    'OMEGA 1',
    'OMEGA 2',
    'OMEGA 3',
    'OMEGA 4',
    'SIGMA 15',
    'SIGMA 17',
    'SIGMA 22 (Debaryomyces Hansenii)',
    'SIGMA 30',
    'SIGMA 41',
    'SIGMA 43',
    'SIGMA 54',
    'SIGMA 55',
    'SIGMA 63',
    'SIGMA 75',
    'SIGMA 96 SP',
    'SIGMA 97');
UPDATE public.cultures SET last_checked = DATE '2026-10-27', updated_at = now()
 WHERE shop = 'Serowar.pl' AND name IN (
    'ABY',
    'AT',
    'Brevibacterium Linens',
    'CL',
    'EM',
    'GEO',
    'Grzybek kefirowy tybetański',
    'KFA1',
    'Kefir 31',
    'Kefir 51',
    'LCR',
    'LHT',
    'LHTB',
    'LHTBME',
    'LP',
    'M',
    'MA',
    'ME',
    'MFC',
    'MO',
    'MSE',
    'MSE-910',
    'MSO',
    'MSO-11',
    'MST',
    'MSY',
    'MYE',
    'PC',
    'PG',
    'PP',
    'RQ',
    'SLBH',
    'TB',
    'TME',
    'YO 122');
UPDATE public.cultures SET last_checked = DATE '2026-10-27', updated_at = now()
 WHERE shop = 'Wańczykówka' AND name IN (
    'Camembert Mix',
    'Choozit ARN',
    'Choozit Alp',
    'Choozit DH 2D',
    'Choozit FR 13',
    'Choozit FT 001',
    'Choozit GEO 13',
    'Choozit GEO 17',
    'Choozit KAZU',
    'Choozit KL 71',
    'Choozit LH 100',
    'Choozit LM 57',
    'Choozit MA 14',
    'Choozit SR3',
    'Choozit TA 61',
    'Flav 54',
    'Kefir DA',
    'LHT',
    'Penicillium Candidum PC 22',
    'Penicillium roqueforti PA',
    'Penicillium roqueforti PV',
    'Probat 222',
    'Propionibakterium PX',
    'Yo-Mix 215',
    'Yo-Mix 401',
    'Yo-Mix 495',
    'Yo-Mix 601',
    'Yo-Mix 883',
    'microMilk Kefir KFB1',
    'microMilk LHTB',
    'microMilk LHTBM',
    'microMilk ME',
    'microMilk MO (Feta)',
    'microMilk T (Mozzarella)',
    'microMilk TB (Taleggio)',
    'microMilk TB/B (Caciotta)',
    'microMilk TME',
    'microMilk Y',
    'microMilk Y-Probiotyczny',
    'microMilk YG (Jogurt Grecki)');

-- 5. Nowy sklep: Browin (https://browin.pl/), 5 pozycji. Dane: scripts/kultury-data/browin.txt
INSERT INTO public.cultures (name, composition, application, temperature, type, shop, shop_url, product_url, price_label, price_numeric, pack_liters, dose_label, manufacturer, image_url, is_active, last_checked)
SELECT 'Kultury bakterii do kefiru i kwaśnego mleka',
       'Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. lactis biovar diacetylactis, Leuconostoc spp., Streptococcus salivarius subsp. thermophilus, Lactobacillus delbrueckii subsp. bulgaricus',
       'Kefir i kwaśne (zsiadłe) mleko',
       '25-30°C',
       'kefir',
       'Browin',
       'https://browin.pl/',
       'https://browin.pl/sklep/produkt/411208/kultury-bakterii-do-kefiru-i-kwasnego-mleka-5g',
       '20,49 zł',
       20.49,
       25,
       '0,5-2 g / 10 L',
       'Browin (marka własna)',
       'https://erp.browin.pl/backend/zdjecia_produktow/411208_wym.jpg/resize/x1200',
       true,
       DATE '2026-10-27'
 WHERE NOT EXISTS (SELECT 1 FROM public.cultures WHERE shop = 'Browin' AND name = 'Kultury bakterii do kefiru i kwaśnego mleka');
INSERT INTO public.cultures (name, composition, application, temperature, type, shop, shop_url, product_url, price_label, price_numeric, pack_liters, dose_label, manufacturer, image_url, is_active, last_checked)
SELECT 'Kultury bakterii do jogurtu',
       'Streptococcus thermophilus',
       'Jogurt, zakwaszanie śmietany, serki jogurtowe i parzone serki podpuszczkowe',
       '43-45°C',
       'jogurtowe',
       'Browin',
       'https://browin.pl/',
       'https://browin.pl/sklep/produkt/411240/kultury-bakterii-do-jogurtu',
       '20,79 zł',
       20.79,
       30,
       '0,3 g / 3 L',
       'Browin (marka własna)',
       'https://erp.browin.pl/backend/zdjecia_produktow/411240_wym.jpg/resize/x1200',
       true,
       DATE '2026-10-27'
 WHERE NOT EXISTS (SELECT 1 FROM public.cultures WHERE shop = 'Browin' AND name = 'Kultury bakterii do jogurtu');
INSERT INTO public.cultures (name, composition, application, temperature, type, shop, shop_url, product_url, price_label, price_numeric, pack_liters, dose_label, manufacturer, image_url, is_active, last_checked)
SELECT 'Kultury bakterii do sera greckiego',
       'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus, Lactobacillus helveticus, Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris',
       'Ser grecki typu feta',
       '33-38°C',
       'mezofilno-termofilne',
       'Browin',
       'https://browin.pl/',
       'https://browin.pl/sklep/produkt/411241/kultury-bakterii-do-sera-greckiego',
       '20,79 zł',
       20.79,
       40,
       '0,4 g / 6 L',
       'Browin (marka własna)',
       'https://erp.browin.pl/backend/zdjecia_produktow/411241_.png/resize/x1200',
       true,
       DATE '2026-10-27'
 WHERE NOT EXISTS (SELECT 1 FROM public.cultures WHERE shop = 'Browin' AND name = 'Kultury bakterii do sera greckiego');
INSERT INTO public.cultures (name, composition, application, temperature, type, shop, shop_url, product_url, price_label, price_numeric, pack_liters, dose_label, manufacturer, image_url, is_active, last_checked)
SELECT 'Kultury bakterii do sera gouda',
       'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar diacetylactis, Leuconostoc mesenteroides subsp. cremoris, Streptococcus thermophilus',
       'Sery półtwarde i twarde, np. gouda',
       '33-38°C',
       'mezofilno-termofilne',
       'Browin',
       'https://browin.pl/',
       'https://browin.pl/sklep/produkt/411242/kultury-bakterii-do-sera-gouda',
       '20,79 zł',
       20.79,
       40,
       '0,5 g / 6 L',
       'Browin (marka własna)',
       'https://erp.browin.pl/backend/zdjecia_produktow/411242_a.jpg/resize/x1200',
       true,
       DATE '2026-10-27'
 WHERE NOT EXISTS (SELECT 1 FROM public.cultures WHERE shop = 'Browin' AND name = 'Kultury bakterii do sera gouda');
INSERT INTO public.cultures (name, composition, application, temperature, type, shop, shop_url, product_url, price_label, price_numeric, pack_liters, dose_label, manufacturer, image_url, is_active, last_checked)
SELECT 'Kultury bakterii do twarogu',
       'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus, Lactobacillus helveticus, Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris',
       'Twaróg i zsiadłe mleko',
       '',
       'mezofilno-termofilne',
       'Browin',
       'https://browin.pl/',
       'https://browin.pl/sklep/produkt/411243/kultury-bakterii-do-twarogu',
       '20,79 zł',
       20.79,
       50,
       '0,3 g / 5 L',
       'Browin (marka własna)',
       'https://erp.browin.pl/backend/zdjecia_produktow/ser1.png/resize/x1200',
       true,
       DATE '2026-10-27'
 WHERE NOT EXISTS (SELECT 1 FROM public.cultures WHERE shop = 'Browin' AND name = 'Kultury bakterii do twarogu');

COMMIT;

-- Kontrola po wykonaniu:
--   select last_checked, count(*) from public.cultures
--    where is_active = true group by 1 order by 1;
--   select count(*) filter (where pack_liters is null) as bez_pojemnosci
--     from public.cultures where is_active = true;
