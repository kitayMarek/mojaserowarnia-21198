-- ============================================================
-- cultures — producent i proporcje szczepów
-- Uruchom w Supabase (Lovable → SQL Editor). Idempotentne.
--
-- ŹRÓDŁO: dane strukturalne (meta itemprop="brand" / JSON-LD) na stronach
-- produktów. NIE szukamy nazw marek w treści strony — Lactic.pl ma w bocznym
-- pasku każdej podstrony box „Katalog Coquard", więc taki odczyt przypisałby
-- Coquardowi produkty, które wcale nie muszą być jego.
--
-- POKRYCIE: 185 z 185 pozycji ma producenta, 5 ma proporcje szczepów.
--
-- CO DEKLARUJĄ SKLEPY:
--   Coquard                           68
--   DANISCO (IFF)                     30
--   microMilk                         24
--   Biochem s.r.l.                    22
--   Artiser (marka własna)            20
--   GAP Poland (marka własna)         18
--   Wańczykówka (marka własna)         2
--   Serowar.pl (marka własna)          1
--
-- UWAGA INTERPRETACYJNA: „producent" to deklaracja sklepu, nie nasza weryfikacja.
-- Cztery pozycje z pięciu deklarują same siebie (marka własna) — to zgodne
-- z tym, co opisujemy: sklep sprzedaje pod swoim oznaczeniem preparat, którego
-- nie wytworzył.
-- ============================================================

alter table public.cultures add column if not exists manufacturer text;
alter table public.cultures add column if not exists strain_ratio text;

comment on column public.cultures.manufacturer is
  'Producent deklarowany w danych strukturalnych strony produktu. NULL = sklep nie podaje.';
comment on column public.cultures.strain_ratio is
  'Proporcja szczepów podana przez sklep, np. „80:20". Podaje ją 1 sklep z 5.';

update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'ARTiVEG ME-30' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'ARTiVEG TH-33' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'ARTiVEG YO PRO-12' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'ARTiVEG YO-9' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'BTH' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'BTMH' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'Brevibacterium Linens' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'CLC' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'CLCH' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'F-YO' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'Geotrichum Candidum' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'KFF' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'ML' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'ML-O' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'MLE' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'MLL' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'P-YO' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'Penicillium Candidum' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'Penicillium Roqueforti' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'Artiser (marka własna)'
  where name = 'Propionibacterium' and shop = 'Artiser.pl';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'Brevibacterium linens' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'EF LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'HL 06 LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'Kefir 41 LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'MP 62 LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'PB LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'PBat 91 LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'Penicillium candidum' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'Penicillium roqueforti' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'Protective LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'SH LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'SM 02 LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'SR 62 LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'TW 31 LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'Y 92 LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'YO 56 LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'YO-B1 LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'GAP Poland (marka własna)'
  where name = 'YPB LYO' and shop = 'GAP Poland';
update public.cultures set manufacturer = 'Coquard'
  where name = 'ALPHA 12' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'ALPHA 3' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'ALPHA 6' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'ALPHA BLEU' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'BETA 1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'BETA 8' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'Beaugel 10 25l' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'Beaugel 11 25l' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'Beaugel 12' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'Beaugel Acid 1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'Beaugel Bifi 1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'Beaugel Elben' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'Beaugel Kefir 2' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'Beaugel Kefir 3' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'Beaugel Raieb 1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'Beaugel Soja 1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'Beaugel Yog 1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'Beaugel Yog 2' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'Beaugel Yog 3' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'Beaugel Yog 4' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'DELTA 1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'DELTA 2' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'GAMMA 1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA 1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA 2' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA 4' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA CL1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA CL2' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA Ca/1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA Ca/2' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA FETA' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA FF1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA FF2' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA KEFIR 2' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA KEFIR 3' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA M' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA PETIT BLEU' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA PROBI 1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA RACLETTE' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA ST NECTAIRE 1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'IOTA V' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'KAPPA 1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'KAPPA 2' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'KAPPA 3' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'KAPPA 4' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'LAMBDA 10' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'LAMBDA 12' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard', strain_ratio = '50:50'
  where name = 'LAMBDA 3' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard', strain_ratio = '80:20'
  where name = 'LAMBDA 6' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard', strain_ratio = '80:20'
  where name = 'LAMBDA 7' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard', strain_ratio = '80:20'
  where name = 'LAMBDA 8' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard', strain_ratio = '80:20'
  where name = 'LAMBDA 9' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'OMEGA 1' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'OMEGA 2' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'OMEGA 3' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'OMEGA 4' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'SIGMA 15' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'SIGMA 17' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'SIGMA 22 (Debaryomyces Hansenii)' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'SIGMA 30' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'SIGMA 41' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'SIGMA 43' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'SIGMA 54' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'SIGMA 55' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'SIGMA 63' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'SIGMA 75' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'SIGMA 96 SP' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Coquard'
  where name = 'SIGMA 97' and shop = 'Lactic.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'ABY' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'AT' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'microMilk'
  where name = 'Brevibacterium Linens' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'microMilk'
  where name = 'CL' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'EM' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'microMilk'
  where name = 'GEO' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Serowar.pl (marka własna)'
  where name = 'Grzybek kefirowy tybetański' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'microMilk'
  where name = 'KFA1' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'microMilk'
  where name = 'KFB1/2' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'Kefir 31' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'Kefir 51' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'LCR' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'microMilk'
  where name = 'LHT' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'microMilk'
  where name = 'LHTB' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'microMilk'
  where name = 'LHTBME' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'LP' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'M' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'microMilk'
  where name = 'MA' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'microMilk'
  where name = 'ME' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'MFC' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'microMilk'
  where name = 'MO' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'MSE' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'MSE-910' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'MSO' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'MSO-11' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'MST' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'MSY' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'MYE' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'PC' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'PG' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'PP' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'RQ' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'SLBH' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'microMilk'
  where name = 'TB' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'microMilk'
  where name = 'TME' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'Biochem s.r.l.'
  where name = 'YO 122' and shop = 'Serowar.pl';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Camembert Mix' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit ARN' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit Alp' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit DH 2D' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit FR 13' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit FT 001' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit GEO 13' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit GEO 17' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit KAZU' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit KL 71' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit LH 100' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit LM 57' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit MA 14' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit MA 4001' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit SR3' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Choozit TA 61' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'Wańczykówka (marka własna)'
  where name = 'Flav 54' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'HOLDBAC LC' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Kefir DA' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'Wańczykówka (marka własna)'
  where name = 'LHT' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Penicillium Candidum PC 22' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Penicillium Candidum PC Neige' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Penicillium roqueforti PA' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Penicillium roqueforti PV' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Probat 222' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Propionibakterium PX' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Yo-Mix 215' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Yo-Mix 401' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Yo-Mix 495' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Yo-Mix 601' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'Yo-Mix 883' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'microMilk'
  where name = 'microMilk Kefir KFB1' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'microMilk'
  where name = 'microMilk LHTB' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'microMilk'
  where name = 'microMilk LHTBM' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'microMilk'
  where name = 'microMilk ME' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'microMilk'
  where name = 'microMilk MO (Feta)' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'microMilk'
  where name = 'microMilk T (Mozzarella)' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'microMilk'
  where name = 'microMilk TB (Taleggio)' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'DANISCO (IFF)'
  where name = 'microMilk TB/B (Caciotta)' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'microMilk'
  where name = 'microMilk TME' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'microMilk'
  where name = 'microMilk Y' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'microMilk'
  where name = 'microMilk Y-Probiotyczny' and shop = 'Wańczykówka';
update public.cultures set manufacturer = 'microMilk'
  where name = 'microMilk YG (Jogurt Grecki)' and shop = 'Wańczykówka';

-- Kontrola po wykonaniu
-- select manufacturer, count(*) from public.cultures
--   where is_active = true group by manufacturer order by count(*) desc;
-- select name, shop, strain_ratio from public.cultures
--   where strain_ratio is not null order by name;
