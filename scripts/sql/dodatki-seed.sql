-- ==========================================================================
-- Seed bazy dodatkow paszowych (stan migawki: 2026-10-24)
--
-- PLIK GENEROWANY przez scripts/gen-dodatki-seed-sql.mts z src/data/dodatkiPaszowe.ts
-- i src/data/gmoEkoSurowcow.ts. Nie edytuj recznie: popraw migawke i przegeneruj.
--
-- Uruchamiac PO migracji 20261024150000_baza_dodatkow_paszowych.sql.
-- Idempotentne: czysci poprzedni seed source='dodatek' razem z jego ofertami.
-- Produkty: 15, oferty: 14.
-- ==========================================================================

BEGIN;

-- 1. Znaczniki GMO i eko dla 124 surowcow wzorcowych. Sklad z tabel
--    wartosci pokarmowej, wiec zrodlo_skladu = 'norma'. Zgloszen (source='user') nie ruszamy.
UPDATE public.feed_ingredients AS f SET
  gmo = v.gmo,
  dopuszczalne_eko = v.dopuszczalne_eko,
  zrodlo_skladu = COALESCE(f.zrodlo_skladu, 'norma')
FROM (VALUES
  ('Bobik', 'nie', NULL),
  ('Groch', 'nie', NULL),
  ('Gryka', 'nie', NULL),
  ('Jęczmień', 'nie', NULL),
  ('Jęczmień+enzym', 'nie', NULL),
  ('Kukurydza', 'nieznane', NULL),
  ('Łubin niebieski wąskolistny', 'nie', NULL),
  ('Łubin żółty', 'nie', NULL),
  ('Owies', 'nie', NULL),
  ('Peluszka', 'nie', NULL),
  ('Pszenica', 'nie', NULL),
  ('Pszenica+enzym', 'nie', NULL),
  ('Pszenżyto', 'nie', NULL),
  ('Pszenżyto+enzym', 'nie', NULL),
  ('Rzepak 00', 'nieznane', NULL),
  ('Słonecznik', 'nie', NULL),
  ('Soja', 'nieznane', NULL),
  ('Żyto', 'nie', NULL),
  ('Drożdże pastewne', 'nieznane', NULL),
  ('Drożdże piwne', 'nieznane', NULL),
  ('Kiełki kukurydziane', 'nieznane', NULL),
  ('Kiełki pszenne', 'nie', NULL),
  ('Kiełki słodowe', 'nie', NULL),
  ('Mąka jęczmienna pastewna', 'nie', NULL),
  ('Mąka kukurydziana pastewna', 'nieznane', NULL),
  ('mąka pszenna pastewna', 'nie', NULL),
  ('Melasa', 'nieznane', NULL),
  ('Odpady piekarnicze', 'nieznane', NULL),
  ('Olej rzepakowy', 'nieznane', NULL),
  ('Otręby pszenne', 'nie', NULL),
  ('Płatki owsiane', 'nie', NULL),
  ('Płatki ziemniaczane', 'nie', NULL),
  ('Śruta poekstrakcyjna arachidowa', 'nie', NULL),
  ('Śruta poekstrakcyjna rzepakowa 00', 'nieznane', NULL),
  ('Śruta poekstrakcyjna słonecznikowa odłuszczona', 'nie', NULL),
  ('Śruta sojowa', 'tak', false),
  ('Wytłoki rzepakowe', 'nieznane', NULL),
  ('Wytłoki rzepakowe-Szestno', 'nieznane', NULL),
  ('Kazeina', 'nie', NULL),
  ('Mączka z krwi', 'nie', NULL),
  ('Mączka kostna surowa', 'nie', NULL),
  ('Mączka kostna odklejona', 'nie', NULL),
  ('Mączka mięsna', 'nie', NULL),
  ('Mączka mięsna o wyższej zawartości tłuszczu', 'nie', NULL),
  ('Mączka mięsno-kostna', 'nie', NULL),
  ('Mączka KAMBAS-55', 'nie', NULL),
  ('Mączka z piór', 'nie', NULL),
  ('Mączka z dorszy', 'nie', NULL),
  ('Mączka rybna do 10% tłuszczu w SM', 'nie', NULL),
  ('Mączka rybna powyżej 10% tłuszczu w SM', 'nie', NULL),
  ('Mączka śledziowa', 'nie', NULL),
  ('Mleko krowie odtłuszczone w proszku', 'nie', NULL),
  ('Tłuszcz drobiowy', 'nie', NULL),
  ('Łój', 'nie', NULL),
  ('Smalec', 'nie', NULL),
  ('Serwatka  w proszku', 'nie', NULL),
  ('Treść jaja', 'nie', NULL),
  ('Twaróg świeży,chudy', 'nie', NULL),
  ('Koniczyna czerwona powyżej-20% b.og. w SM', 'nie', NULL),
  ('Susz z lucerny', 'nie', NULL),
  ('Susz z traw', 'nie', NULL),
  ('Koniczyna perska', 'nie', NULL),
  ('Lucerna przed kwitnieniem', 'nie', NULL),
  ('Owies młody', 'nie', NULL),
  ('Pokrzywa młoda', 'nie', NULL),
  ('Seradela - początek do połowy kwitnienia', 'nie', NULL),
  ('Trawy - kłoszenie', 'nie', NULL),
  ('Żyto - strzelanie w źdźbło', 'nie', NULL),
  ('Kukurydza cała roślina dojrzałość mleczna ziarna', 'nie', NULL),
  ('Liście buraków cukrowych - czyste', 'nie', NULL),
  ('Trawa łąkowa', 'nie', NULL),
  ('Brukiew', 'nie', NULL),
  ('Bulwa (topinambur)', 'nie', NULL),
  ('Buraki cukrowe', 'nie', NULL),
  ('Buraki pastewne', 'nie', NULL),
  ('Buraki Poly - Past', 'nie', NULL),
  ('Marchew pastewna', 'nie', NULL),
  ('Rzepa ścierniskowa', 'nie', NULL),
  ('Ziemniaki parowane', 'nie', NULL),
  ('Fosforan jednowapniowy', 'nie', NULL),
  ('Fosforan dwuwapniowy', 'nie', NULL),
  ('Fosforan trójwapniowy', 'nie', NULL),
  ('Kreda pastewna', 'nie', NULL),
  ('Muszle mielone', 'nie', NULL),
  ('Skorupy jaj', 'nie', NULL),
  ('Sól kuchenna', 'nie', NULL),
  ('Formland', 'nieznane', NULL),
  ('DKA - starter - DOBROL', 'nieznane', NULL),
  ('DKA - grower - DOBROL', 'nieznane', NULL),
  ('DKA - finiszer - DOBROL', 'nieznane', NULL),
  ('KB-1 - DOBROL', 'nieznane', NULL),
  ('KB-2 - DOBROL', 'nieznane', NULL),
  ('KB-1 - SOJA', 'nieznane', NULL),
  ('DKA - grower - SOJA', 'nieznane', NULL),
  ('DKA-S - Golub', 'nieznane', NULL),
  ('Lizyna', 'nieznane', false),
  ('Metionina', 'nie', false),
  ('Superkoncentrat-Finiszer', 'nieznane', NULL),
  ('Formosan', 'nieznane', NULL),
  ('enzym', 'nieznane', NULL),
  ('Avizyme', 'nieznane', NULL),
  ('Cytromix', 'nieznane', NULL),
  ('Premiks IF-M.', 'nieznane', NULL),
  ('Premiks IF-W', 'nieznane', NULL),
  ('Premiks IS-M.', 'nieznane', NULL),
  ('Premiks IS-W', 'nieznane', NULL),
  ('Premiks IB-1 forte', 'nieznane', NULL),
  ('Premiks IB-2 forte', 'nieznane', NULL),
  ('Premiks IB-3 forte', 'nieznane', NULL),
  ('Premiks DKA-G bis', 'nieznane', NULL),
  ('Premiks DKA-G forte bis', 'nieznane', NULL),
  ('Premiks DKA-F forte bis', 'nieznane', NULL),
  ('Optamix extra-G', 'nieznane', NULL),
  ('Optamix extra-IB-f', 'nieznane', NULL),
  ('Premiks KB forte bis', 'nieznane', NULL),
  ('Premiks 2,5 "PT"', 'nieznane', NULL),
  ('MMD vit', 'nieznane', NULL),
  ('Superkoncentrat DKA-Starter', 'nieznane', NULL),
  ('Koncentrat KW-1', 'nieznane', NULL),
  ('Polfamix DG-2', 'nieznane', NULL),
  ('Superkoncentrat 10%GN-1', 'nieznane', NULL),
  ('Premiks 2,5% KW-1', 'nieznane', NULL),
  ('Premix 2.5% GN-1', 'nieznane', NULL),
  ('Ascolac', 'nieznane', NULL)
) AS v(nazwa, gmo, dopuszczalne_eko)
WHERE f.nazwa = v.nazwa AND f.source = 'baza';

-- 2. Produkty (oferty znikaja razem z nimi: ON DELETE CASCADE).
DELETE FROM public.feed_ingredients WHERE source = 'dodatek';

INSERT INTO public.feed_ingredients
  (nazwa, kategoria, em, bialko, ca, p, wlokno, na, k, mg, mn, zn, se, fe, i, sucha_masa, tluszcz, popiol, skrobia, cukier, p_przyswajalny, cl, s, cu, co, lys, met, met_cys, trp, thr, ile, leu, val, his, arg, phe, tyr, wit_a, wit_d3, wit_e, wit_b1, wit_b2, wit_b6, kwas_pantotenowy, kwas_foliowy, biotyna, niacyna, wit_b12, cholina, kwas_linolowy, producent, gatunki, dawka_proc_od, dawka_proc_do, dawka_g_dziennie, dawkowanie, stosowanie, sklad_surowcowy, gmo, dopuszczalne_eko, zrodlo_skladu, zrodlo, zweryfikowano, partner, url_producenta, odpowiednik, status, source)
VALUES
  ('Koncentrat 15% Nioska (Rolpol)', 'Koncentraty', 8.58, 41.5, 1.33, 1.39, 2.85, 0.79, 0, 0, 660, 396, 3.3, 264, 3.3, 0, 1.34, 11.86, 0, 0, 0, 0, 0, 66, 0, 2.8, 1.42, 2.1, 0.57, 1.78, 0, 0, 0, 0, 0, 0, 0, 99, 13.2, 132, 13.2, 33, 19.8, 66, 0, 0.396, 0, 132, 0, 0, 'Rolpol Żywienie Zwierząt, Uścikowo (na premiksach Schaumann)', ARRAY['nioski']::text[], 15, 15, NULL, '15% koncentratu w mieszance, razem ze śrutą sojową, kredą i zbożem (przepis z etykiety niżej)', '15% koncentratu + 6–8% śruta sojowa + 8% kreda pastewna (węglan wapnia) + 71–73% śruty zbożowe', 'Śruta poekstrakcyjna sojowa LINIA (40-3-2), fosforan jednowapniowy, chlorek sodu. Konserwanty: kwasy organiczne E280, E236, E270 6 g/kg. Barwnik: E161g kantaksantyna 13,32 mg/kg.', 'tak', false, 'producent', 'https://www.schaumannrolpol.pl/produkty/drob/kury-nioski/koncentraty-kury-nioski', '2026-10-24'::date, false, 'https://www.schaumannrolpol.pl/produkty/drob/kury-nioski/koncentraty-kury-nioski', NULL, 'approved', 'dodatek'),
  ('Koncentrat 30% Nioska (Rolpol)', 'Koncentraty', 6.42, 30.91, 11.32, 0.83, 2.13, 0.4, 0, 0, 340, 204, 1.7, 136, 1.7, 0, 1, 34.55, 0, 0, 0, 0, 0, 34, 0, 2.09, 0.87, 1.37, 0.43, 1.33, 0, 0, 0, 0, 0, 0, 0, 51, 6.8, 68, 6.8, 17, 10.2, 34, 0, 0.204, 0, 68, 0, 0, 'Rolpol Żywienie Zwierząt, Uścikowo (na premiksach Schaumann)', ARRAY['nioski']::text[], 30, 30, NULL, '30% koncentratu w mieszance, reszta to zboże', '30% koncentratu + 70% śruty zbożowe', 'Śruta poekstrakcyjna sojowa LINIA (40-3-2), węglan wapnia, fosforan jednowapniowy, chlorek sodu. Konserwanty: kwasy organiczne E280, E236, E270 6 g/kg. Barwnik: E161g kantaksantyna 6,66 mg/kg.', 'tak', false, 'producent', 'https://www.schaumannrolpol.pl/produkty/drob/kury-nioski/koncentraty-kury-nioski', '2026-10-24'::date, false, 'https://www.schaumannrolpol.pl/produkty/drob/kury-nioski/koncentraty-kury-nioski', NULL, 'approved', 'dodatek'),
  ('Drobmix Nioska 4% (Agro-Kocięba)', 'Premiksy', 0, 0, 32.5, 1.19, 0, 1.9, 0, 0, 1200, 1050, 3, 750, 15, 0, 0, 0, 0, 0, 0, 0, 0, 180, 0, 0.85, 0.81, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 45, 450, 22.5, 90, 60, 135, 15, 2.4, 600, 225, 3.5, 0, 'Wytwórnia Pasz i Koncentratów Agro-Kocięba, Czarnocin', ARRAY['nioski', 'odchow']::text[], 4, 4, NULL, '40 kg na 1000 kg mieszanki pełnoporcjowej (4%), dokładnie wymieszać', NULL, 'Nośnik: węglan wapnia, fosforan jednowapniowy, chlorek sodu, wodorowęglan sodu, tlenek magnezu.', 'nieznane', NULL, 'producent', 'https://e-pasze.pl/produkt/mieszanka-witaminowo-mineralna-dla-drobiu-4kg-drobmix-nioska-4/', '2026-10-24'::date, false, 'https://e-pasze.pl/produkt/mieszanka-witaminowo-mineralna-dla-drobiu-4kg-drobmix-nioska-4/', NULL, 'approved', 'dodatek'),
  ('Dolmix DN (Dolfos)', 'Premiksy', 0, 0, 26.6, 1, 0, 5.2, 0, 0, 2400, 2000, 8, 700, 40, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 1.5, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 400, 80, 880, 45, 160, 100, 450, 35, 2, 850, 1000, 6.66, 0, 'Dolfos', ARRAY['nioski']::text[], 2.5, 2.5, 2.5, 'Na 10 niosek 25 g dziennie do paszy; w żywieniu grupowym 2,5 kg na 100 kg paszy (2,5%)', NULL, 'Węglan wapnia (w tym z muszli ostryg), chlorek sodu, węglan wapniowo-magnezowy, fosforan monowapniowy, drożdże suszone, glicerol.', 'nieznane', NULL, 'etykieta', 'https://farmpetgarden.pl/produkt/witaminy-dla-kur-niosek-dolmix-dn-dolfos-10kg', '2026-10-24'::date, false, 'https://www.dolfos.pl/en/p/dolmix-dn-en/', NULL, 'approved', 'dodatek'),
  ('Polfamix Nioska Extra (Trouw Nutrition)', 'Premiksy', 0, 0, 29.88, 2.5, 0, 4, 0, 0, 1750, 1500, 5, 1957, 25, 0, 0, 0, 0, 0, 0, 0, 0, 250, 0, 0.8, 1.7, 0, 0, 0.3, 0, 0, 0, 0, 0, 0, 0, 250, 50, 500, 30, 100, 65, 280, 25, 0, 550, 500, 0.68, 0, 'Trouw Nutrition Polska', ARRAY['nioski', 'indyki', 'kaczki', 'gesi']::text[], 4, 4, 4, '40 g na 10 sztuk dziennie albo 1 kg na 25 kg paszy, przez cały okres nieśności', NULL, 'Fosforan jednowapniowy, węglan wapnia, chlorek sodu.', 'nieznane', NULL, 'etykieta', 'https://weterynaryjny.pl/produkt/trouw-polfamix-nioska-extra-1-kg/', '2026-10-24'::date, false, 'https://www.trouwnutrition.pl/pl-pl/programme-lister/polfamix-nioska-extra-467743/', NULL, 'approved', 'dodatek'),
  ('Kreda pastewna Viva Max (Polcalc)', 'Dodatki mineralne', 0, 0, 37.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'Polcalc (grupa Holcim)', '{}'::text[], NULL, NULL, NULL, 'Etykieta nie podaje dawki. Producent pisze o 3–4% mieszanki dla drobiu; nioska w nieśności potrzebuje więcej wapnia, więc ilość liczy się z normy.', NULL, 'Węglan wapnia z wapieni i margli jurajskich (Barcin, Piechcin, Pakość). CaCO3 średnio 94%, co najmniej 92,5%. Frakcja 0,4–1,2 mm.', 'nie', true, 'producent', 'https://polcalc.pl/en/produkty/kreda-pastewna-viva-max-25-kg/', '2026-10-24'::date, false, 'https://polcalc.pl/en/produkty/kreda-pastewna-viva-max-25-kg/', 'Kreda pastewna', 'approved', 'dodatek'),
  ('Grys wapienny Mikros (Mikrop)', 'Dodatki mineralne', 0, 0, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'Mikrop Čebín (Czechy)', ARRAY['nioski', 'kaczki', 'gesi', 'indyki']::text[], NULL, NULL, NULL, 'Do woli (ad libitum), dodawany do ziarna i paszy', NULL, 'Węglan wapnia (wapień kruszony), frakcja ok. 1–2 mm.', 'nie', true, 'etykieta', 'https://agrofortel.pl/micros-wapno-grys-3kg', '2026-10-24'::date, false, 'https://www.mikrop.cz/produkt/vapenny-grit~p528', 'Kreda pastewna', 'approved', 'dodatek'),
  ('Muszle ostryg OYTA 2 (Algavita)', 'Dodatki mineralne', 0, 0, 37, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'Algavita, Konstancin-Jeziorna (importer)', ARRAY['nioski']::text[], 3, 4, NULL, 'Dla intensywnie niosących kur 3–4% w mieszance pełnoporcjowej, zamiast części kredy (do 2/3); brojlery i indyki 1–2%', NULL, 'Kruszone muszle ostryg (węglan wapnia), suszone i sterylizowane. OYTA 2 to frakcja dla kur niosek.', 'nie', true, 'producent', 'https://algavita.pl/muszle-ostryg-2/muszle-oyta-2/', '2026-10-24'::date, false, 'https://algavita.pl/muszle-ostryg-2/muszle-oyta-2/', 'Muszle mielone', 'approved', 'dodatek'),
  ('Fosforan jednowapniowy paszowy (Lagrico)', 'Dodatki mineralne', 0, 0, 16, 22.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'nie podano (sprzedawca: Lagrico)', '{}'::text[], NULL, NULL, NULL, 'Etykieta nie podaje dawki; ilość dobiera się do normy fosforu (zwykle 1–2% mieszanki)', NULL, 'Fosforan jednowapniowy Ca(H2PO4)2·H2O, granulat. Fluor najwyżej 2000 mg/kg, wilgotność najwyżej 3%.', 'nie', NULL, 'etykieta', 'https://lagrico.pl/fosforan-jednowapniowy-paszowy-worek-25kg,id760.html', '2026-10-24'::date, false, NULL, 'Fosforan jednowapniowy', 'approved', 'dodatek'),
  ('Sól paszowa kłodawska (KS Kłodawa)', 'Dodatki mineralne', 0, 0, 0, 0, 0, 38.16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58.84, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'Kopalnia Soli „Kłodawa”', '{}'::text[], NULL, NULL, NULL, 'Producent nie podaje dawki; drób potrzebuje ok. 0,3% soli w paszy', NULL, 'Sól kamienna paszowa (PN-C-84081-2:1998), NaCl co najmniej 97%, bez antyzbrylacza.', 'nie', true, 'producent', 'https://sol-klodawa.com.pl/wp-content/uploads/2020/10/s%C3%B3l-paszowa-nowe-2020.pdf', '2026-10-24'::date, false, 'https://sol-klodawa.com.pl/sol-paszowa/', 'Sól kuchenna', 'approved', 'dodatek'),
  ('Drożdże piwne sypkie (Mikrop)', 'Produkty uboczne, śruty i oleje', 11.72, 44, 0.17, 1.38, 0, 0.07, 1.7, 0.25, 4, 43, 0, 107, 0, 90, 1.2, 7, 5.4, 1.4, 1.38, 0.12, 0.38, 34.3, 211, 3.46, 0.68, 1.27, 0.59, 2.29, 2.24, 3.37, 2.49, 1.17, 2.44, 1.85, 1.61, 6400, 0, 2.1, 82.5, 36.2, 34.7, 105.9, 9.63, 1.02, 433, 1, 3.69, 0, 'Mikrop Čebín (Czechy)', ARRAY['nioski', 'kaczki', 'indyki']::text[], NULL, NULL, 0.6, 'Na 10 sztuk dziennie: kury i kaczki 3–6 g, indyki 10–12 g, drób do 4. tygodnia 1–2 g, od 5. do 12. tygodnia 3 g', NULL, 'Drożdże suszone (Saccharomyces cerevisiae), sypkie.', 'nieznane', NULL, 'etykieta', 'https://www.ketris.pl/drozdze-piwowarskie-25kg_z10013/', '2026-10-24'::date, false, 'https://www.mikrop.cz/vyziva-zvirat/drobnochovy-zajmove-chovy/drubez', 'Drożdże piwne', 'approved', 'dodatek'),
  ('Drożdże piwne Brewers Yeast S (Leiber)', 'Produkty uboczne, śruty i oleje', 11.72, 43, 0.2, 1, 1, 0.07, 1.7, 0.25, 4, 43, 0, 107, 0, 90, 1, 7, 5.4, 1.4, 1.38, 0.12, 0.38, 34.3, 211, 3, 0.5, 1.2, 0.4, 2.2, 2.24, 3.37, 2.49, 1.17, 2.44, 1.85, 1.61, 6400, 0, 2.1, 82.5, 36.2, 34.7, 105.9, 9.63, 1.02, 433, 1, 3.69, 0, 'Leiber (Niemcy)', '{}'::text[], 3, 5, NULL, '3–5% w paszy pełnoporcjowej dla drobiu, zależnie od gatunku i okresu', NULL, '100% Saccharomyces cerevisiae (drożdże piwne), suszone rozpyłowo.', 'nie', NULL, 'etykieta', 'https://kopalko.pl/sklep/produkty-dla-bydla/drozdze-dla-bydla/leiber-brewers-yeast/', '2026-10-24'::date, false, 'https://leibergmbh.de/en/markets-solutions/livestock/poultry/', 'Drożdże piwne', 'approved', 'dodatek'),
  ('Śruta sojowa bez GMO (Market-Rolniczy)', 'Produkty uboczne, śruty i oleje', 9.13, 46, 0.35, 0.54, 3.5, 0.04, 1.72, 0.24, 38, 50, 0, 186, 0, 88, 1.6, 6.2, 6.5, 9.4, 0.22, 0.08, 0.35, 15.8, 158, 2.77, 0.63, 1.31, 0.61, 1.77, 2.22, 3.48, 2.17, 1.19, 3.3, 2.25, 1.65, 0.4, 0, 2.7, 3.6, 2.9, 6.2, 14.1, 0.57, 0.31, 29, 0, 2.64, 0, 'nie podano (sprzedawca: Market-Rolniczy, Poznań)', '{}'::text[], NULL, 20, NULL, '10–20% mieszanki (bez podziału na gatunki)', NULL, 'Śruta sojowa poekstrakcyjna bez GMO, worek 20 kg.', 'nie', NULL, 'etykieta', 'https://market-rolniczy.pl/768-sruta-sojowa-bez-gmo-.html', '2026-10-24'::date, false, NULL, 'Śruta sojowa', 'approved', 'dodatek'),
  ('DL-metionina 99% paszowa (bez marki)', 'Aminokwasy i dodatki paszowe', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 99, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'nie podano (sprzedawcy: Wisagro, PanPasza)', ARRAY['nioski', 'brojlery', 'indyki']::text[], NULL, NULL, NULL, 'Etykieta nie podaje dawki dla drobiu: wpisz dawkę z receptury (zwykle dziesiąte części procenta)', NULL, 'DL-metionina z syntezy chemicznej, co najmniej 99%.', 'nie', false, 'etykieta', 'https://wisagro.pl/produkt/dl-metionina-99-aminokwas-paszowy-dla-drobiu-worek-25-kg/', '2026-10-24'::date, false, NULL, 'Metionina', 'approved', 'dodatek'),
  ('Rhodimet NP99 (Adisseo)', 'Aminokwasy i dodatki paszowe', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 99, 99, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'Adisseo (Francja), w Polsce Adifeed', '{}'::text[], NULL, NULL, NULL, 'Producent nie podaje dawki dla drobiu: wpisz dawkę z receptury', NULL, 'DL-metionina, co najmniej 99%, sypki proszek. Worki 25 kg i big bagi.', 'nie', false, 'producent', 'https://www.adisseo.com/en/products/rhodimet/rhodimet-np99/', '2026-10-24'::date, false, 'https://www.adisseo.com/en/products/rhodimet/rhodimet-np99/', 'Metionina', 'approved', 'dodatek');

-- 3. Oferty sklepow, przypiete do produktow po nazwie.
INSERT INTO public.feed_offers (feed_ingredient_id, sklep, url, cena_zl, opakowanie_kg, sprawdzono)
SELECT f.id, v.sklep, v.url, v.cena_zl, v.opakowanie_kg, v.sprawdzono
FROM (VALUES
  ('Dolmix DN (Dolfos)', 'Pan Hodowca', 'https://www.panhodowca.pl/dolmix-dn-10-kg-witamina-dla-niosek-dolfos-id-126?utm_source=mojaserowarnia', 67, 10, '2026-10-24'::date),
  ('Dolmix DN (Dolfos)', 'Farm Pet Garden', 'https://farmpetgarden.pl/produkt/witaminy-dla-kur-dolmix-dn-dolfos-10kg/?utm_source=mojaserowarnia', 68, 10, '2026-10-24'::date),
  ('Polfamix Nioska Extra (Trouw Nutrition)', 'MojaFerma.pl', 'https://mojaferma.pl/pl/p/Polfamix-NIOSKA-Extra-1kg/350?utm_source=mojaserowarnia', 16, 1, '2026-10-24'::date),
  ('Polfamix Nioska Extra (Trouw Nutrition)', 'eZoo.pl', 'https://ezoo.pl/pl/p/POLFAMIX-NIOSKA-EXTRA-1-kg-witaminy-mineraly-drob-kury-11209125/13093?utm_source=mojaserowarnia', 20, 1, '2026-10-24'::date),
  ('Kreda pastewna Viva Max (Polcalc)', 'AgroRatajczak', 'https://sklep.agroratajczak.pl/kreda-pastewna-vivamax-0-4-1-2mm-25kg-p-164.html?utm_source=mojaserowarnia', 15, 25, '2026-10-24'::date),
  ('Kreda pastewna Viva Max (Polcalc)', 'Rolmat', 'https://sklep.rolmat.pl/Kreda-Pastewna-VivaMax-0,4-1,2-25kg?utm_source=mojaserowarnia', 23, 25, '2026-10-24'::date),
  ('Grys wapienny Mikros (Mikrop)', 'Agrofortel', 'https://agrofortel.pl/micros-wapno-grys-3kg?utm_source=mojaserowarnia', 12.04, 3, '2026-10-24'::date),
  ('Fosforan jednowapniowy paszowy (Lagrico)', 'Lagrico', 'https://lagrico.pl/fosforan-jednowapniowy-paszowy-worek-25kg,id760.html?utm_source=mojaserowarnia', 139, 25, '2026-10-24'::date),
  ('Sól paszowa kłodawska (KS Kłodawa)', 'Paszowo.pl', 'https://paszowo.pl/dodatki-paszowe-dla-bydla/sol-kamienna-klodawska-naturalna-paszowa-25kg.html?utm_source=mojaserowarnia', 29, 25, '2026-10-24'::date),
  ('Drożdże piwne sypkie (Mikrop)', 'Ketris', 'https://www.ketris.pl/drozdze-piwowarskie-25kg_z10013/?utm_source=mojaserowarnia', 281.77, 25, '2026-10-24'::date),
  ('Drożdże piwne Brewers Yeast S (Leiber)', 'Kopalko', 'https://kopalko.pl/sklep/produkty-dla-bydla/drozdze-dla-bydla/leiber-brewers-yeast/?utm_source=mojaserowarnia', 324, 25, '2026-10-24'::date),
  ('Śruta sojowa bez GMO (Market-Rolniczy)', 'Market-Rolniczy', 'https://market-rolniczy.pl/768-sruta-sojowa-bez-gmo-.html?utm_source=mojaserowarnia', 140, 20, '2026-10-24'::date),
  ('DL-metionina 99% paszowa (bez marki)', 'PanPasza', 'https://panpasza.pl/pl/p/Metionina-99-25kg/256?utm_source=mojaserowarnia', 600, 25, '2026-10-24'::date),
  ('DL-metionina 99% paszowa (bez marki)', 'Wisagro', 'https://wisagro.pl/produkt/dl-metionina-99-aminokwas-paszowy-dla-drobiu-worek-25-kg/?utm_source=mojaserowarnia', 640, 25, '2026-10-24'::date)
) AS v(nazwa, sklep, url, cena_zl, opakowanie_kg, sprawdzono)
JOIN public.feed_ingredients f ON f.nazwa = v.nazwa AND f.source = 'dodatek';

COMMIT;
