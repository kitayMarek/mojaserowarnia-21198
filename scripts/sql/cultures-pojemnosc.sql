-- ============================================================
-- cultures — pojemność opakowania (pack_liters) i dawkowanie (dose_label)
-- Uruchom w Supabase (Lovable → SQL Editor). Idempotentne.
--
-- PO CO: baza podawała cenę bez formatu opakowania. Cena 15 zł nic nie znaczy,
-- dopóki nie wiadomo, czy opakowanie starcza na 100 czy na 1000 litrów mleka.
--
-- ŹRÓDŁO: publiczne strony produktów sklepów (scripts/pobierz-pojemnosc.py,
-- odczyt pojemnosc.txt). Przy kilku wariantach opakowania brany jest NAJMNIEJSZY —
-- spójnie z zapisaną ceną, która też dotyczy wariantu domowego.
--
-- CZEGO TU NIE MA: pozycje, dla których sklep nie deklaruje pojemności,
-- zostają puste. Zgadywanie byłoby gorsze niż luka.
-- ============================================================

-- 1) Kolumny (bezpieczne przy powtórnym uruchomieniu)
alter table public.cultures add column if not exists pack_liters integer;
alter table public.cultures add column if not exists dose_label text;

comment on column public.cultures.pack_liters is
  'Na ile litrów mleka starcza opakowanie (wariant domowy = najmniejszy). NULL = sklep nie deklaruje.';
comment on column public.cultures.dose_label is
  'Dawkowanie podane przez sklep, np. "2 g / 100 L". NULL = brak deklaracji.';

-- 2) Wartości — dopasowanie po (name, shop), bo sama nazwa nie jest unikalna
update public.cultures set pack_liters = 5
  where name = 'ARTiVEG ME-30' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 5
  where name = 'ARTiVEG TH-33' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 5
  where name = 'ARTiVEG YO PRO-12' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 5
  where name = 'ARTiVEG YO-9' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '2 g / 100 L'
  where name = 'BTH' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '2 g / 100 L'
  where name = 'BTMH' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '2 g / 100 L'
  where name = 'Brevibacterium Linens' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '2 g / 100 L'
  where name = 'CLC' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '2 g / 100 L'
  where name = 'CLCH' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '2 g / 100 L'
  where name = 'F-YO' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '3 g / 100 L'
  where name = 'Geotrichum Candidum' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '2 g / 100 L'
  where name = 'KFF' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '2 g / 100 L'
  where name = 'ML' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '2 g / 100 L'
  where name = 'ML-O' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '2 g / 100 L'
  where name = 'MLE' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '2 g / 100 L'
  where name = 'MLL' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '2 g / 100 L'
  where name = 'P-YO' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '3 g / 100 L'
  where name = 'Penicillium Candidum' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '3 g / 100 L'
  where name = 'Penicillium Roqueforti' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100, dose_label = '2 g / 100 L'
  where name = 'Propionibacterium' and shop = 'Artiser.pl';
update public.cultures set pack_liters = 100
  where name = 'Brevibacterium linens' and shop = 'GAP Poland';
update public.cultures set pack_liters = 100
  where name = 'EF LYO' and shop = 'GAP Poland';
update public.cultures set pack_liters = 100
  where name = 'Kefir 41 LYO' and shop = 'GAP Poland';
update public.cultures set pack_liters = 100
  where name = 'PBat 91 LYO' and shop = 'GAP Poland';
update public.cultures set pack_liters = 100
  where name = 'Penicillium candidum' and shop = 'GAP Poland';
update public.cultures set pack_liters = 100
  where name = 'Penicillium roqueforti' and shop = 'GAP Poland';
update public.cultures set pack_liters = 100
  where name = 'Protective LYO' and shop = 'GAP Poland';
update public.cultures set pack_liters = 100
  where name = 'TW 31 LYO' and shop = 'GAP Poland';
update public.cultures set pack_liters = 100
  where name = 'VEGE C LYO' and shop = 'GAP Poland';
update public.cultures set pack_liters = 100
  where name = 'Y 92 LYO' and shop = 'GAP Poland';
update public.cultures set pack_liters = 100
  where name = 'YO 56 LYO' and shop = 'GAP Poland';
update public.cultures set pack_liters = 100
  where name = 'ALPHA 10' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'ALPHA 12' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'ALPHA 3' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'ALPHA 6' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'ALPHA BLEU' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'BETA 1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'BETA 8' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 25
  where name = 'Beaugel 10 25l' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 25
  where name = 'Beaugel 11 25l' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 5
  where name = 'Beaugel 12' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 5
  where name = 'Beaugel Acid 1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 5
  where name = 'Beaugel Bifi 1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 5
  where name = 'Beaugel Elben' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 5
  where name = 'Beaugel Kefir 2' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 5
  where name = 'Beaugel Kefir 3' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 5
  where name = 'Beaugel Raieb 1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 5
  where name = 'Beaugel Soja 1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 5
  where name = 'Beaugel Yog 1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 5
  where name = 'Beaugel Yog 2' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 5
  where name = 'Beaugel Yog 3' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 5
  where name = 'Beaugel Yog 4' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'DELTA 1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'DELTA 2' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 500
  where name = 'IOTA 1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'IOTA CL1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'IOTA CL2' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'IOTA Ca/1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'IOTA Ca/2' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'IOTA FETA' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'IOTA FF1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'IOTA FF2' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 150
  where name = 'IOTA KEFIR 2' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 150
  where name = 'IOTA KEFIR 3' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'IOTA M' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'IOTA PETIT BLEU' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 150
  where name = 'IOTA PROBI 1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'IOTA RACLETTE' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'IOTA ST NECTAIRE 1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 50
  where name = 'KAPPA 1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 50
  where name = 'KAPPA 2' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 50
  where name = 'KAPPA 3' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 20
  where name = 'LAMBDA 10' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 20
  where name = 'LAMBDA 12' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 20
  where name = 'LAMBDA 3' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 20
  where name = 'LAMBDA 6' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 20
  where name = 'LAMBDA 7' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 20
  where name = 'LAMBDA 8' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 20
  where name = 'LAMBDA 9' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'OMEGA 1' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'OMEGA 2' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'OMEGA 3' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'OMEGA 4' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 500
  where name = 'SIGMA 41' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 500
  where name = 'SIGMA 43' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 500
  where name = 'SIGMA 96 SP' and shop = 'Lactic.pl';
update public.cultures set pack_liters = 100
  where name = 'ABY' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'AT' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'Brevibacterium Linens' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'CL' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'EM' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'GEO' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'KFA1' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'KFB1/2' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'Kefir 31' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'Kefir 51' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'LCR' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'LHT' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'LHTB' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'LHTBME' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'LP' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'M' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'MA' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'ME' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'MFC' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'MO' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'MSE' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'MSE-910' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'MSO' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'MSO-11' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'MST' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'MSY' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'MYE' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'PC' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'PG' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'PP' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'RQ' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'SLBH' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'TB' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'TME' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'YO 122' and shop = 'Serowar.pl';
update public.cultures set pack_liters = 100
  where name = 'Camembert Mix' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 5000
  where name = 'Choozit ARN' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 500
  where name = 'Choozit Alp' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 2000
  where name = 'Choozit DH 2D' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 1000
  where name = 'Choozit FR 13' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'Choozit FT 001' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 1000
  where name = 'Choozit GEO 13' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 1000
  where name = 'Choozit GEO 17' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 300
  where name = 'Choozit KAZU' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 1000
  where name = 'Choozit LM 57' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'Choozit MA 4001' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 1000
  where name = 'Choozit SR3' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 500
  where name = 'Choozit TA 61' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 500
  where name = 'Flav 54' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 1000
  where name = 'HOLDBAC LC' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'Kefir DA' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'LHT' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 250
  where name = 'Penicillium Candidum PC 22' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 500
  where name = 'Penicillium Candidum PC Neige' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 500
  where name = 'Penicillium roqueforti PA' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 500
  where name = 'Penicillium roqueforti PV' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'Probat 222' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 500
  where name = 'Propionibakterium PX' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'Yo-Mix 215' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'Yo-Mix 401' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'Yo-Mix 495' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'Yo-Mix 601' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'Yo-Mix 883' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 500
  where name = 'microMilk Kefir KFB1' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'microMilk LHTB' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'microMilk LHTBM' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 500
  where name = 'microMilk ME' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'microMilk MO (Feta)' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'microMilk T (Mozzarella)' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'microMilk TB (Taleggio)' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'microMilk TB/B (Caciotta)' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'microMilk TME' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'microMilk Y' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'microMilk Y-Probiotyczny' and shop = 'Wańczykówka';
update public.cultures set pack_liters = 100
  where name = 'microMilk YG (Jogurt Grecki)' and shop = 'Wańczykówka';

-- 3) Kontrola po wykonaniu — ile pozycji ma teraz pojemność
-- select shop,
--        count(*) as wszystkie,
--        count(pack_liters) as z_pojemnoscia,
--        min(pack_liters) as najmniejsze,
--        max(pack_liters) as najwieksze
--   from public.cultures where is_active = true group by shop order by shop;
