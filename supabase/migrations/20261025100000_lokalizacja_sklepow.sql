-- ==========================================================================
-- Lokalizacja sklepow przy ofertach dodatkow paszowych (25.10.2026)
--
-- PO CO: czaty z lacznikiem MCP pytaja „w jakiej miejscowosci szukasz sklepu?”
-- (ChatGPT, 24.10.2026), a baza znala tylko nazwe sklepu. Teraz przy ofercie jest
-- miejscowosc, wojewodztwo i czy mozna przyjechac (sklep stacjonarny, odbior
-- osobisty zamowienia albo tylko wysylka), z adresami miejsc odbioru.
--
-- DLACZEGO W feed_offers, A NIE W OSOBNEJ TABELI SKLEPOW: jeden sklep ma dzis po
-- kilka ofert, a panel admina edytuje oferte jako jeden wiersz. Seed
-- (scripts/sql/dodatki-seed.sql) wpisuje te same dane do kazdej oferty sklepu
-- z mapy SKLEPY_DODATKOW w src/data/dodatkiPaszowe.ts.
--
-- NEUTRALNOSC (decyzja Marka): lokalizacja nie wplywa na kolejnosc ofert. Strona
-- i serwer MCP ukladaja je dalej tylko po skladzie i cenie; MCP z parametrem
-- wojewodztwo jedynie dopisuje „w Twoim wojewodztwie”.
--
-- Wymaga 20261024150000_baza_dodatkow_paszowych.sql (tabela feed_offers).
-- ==========================================================================

ALTER TABLE public.feed_offers
  ADD COLUMN IF NOT EXISTS miejscowosc            text,
  ADD COLUMN IF NOT EXISTS wojewodztwo            text,
  ADD COLUMN IF NOT EXISTS odbior                 text,
  ADD COLUMN IF NOT EXISTS punkty_odbioru         jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS lokalizacja_sprawdzona date;

-- Ograniczenia zakladane od nowa, zeby migracja dala sie puscic drugi raz.
-- Te same klucze co WOJEWODZTWA w src/data/dodatkiPaszowe.ts.
ALTER TABLE public.feed_offers DROP CONSTRAINT IF EXISTS feed_offers_wojewodztwo_check;
ALTER TABLE public.feed_offers
  ADD CONSTRAINT feed_offers_wojewodztwo_check
  CHECK (wojewodztwo IS NULL OR wojewodztwo IN (
    'dolnoslaskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie', 'lodzkie', 'malopolskie',
    'mazowieckie', 'opolskie', 'podkarpackie', 'podlaskie', 'pomorskie', 'slaskie',
    'swietokrzyskie', 'warminsko-mazurskie', 'wielkopolskie', 'zachodniopomorskie'));

ALTER TABLE public.feed_offers DROP CONSTRAINT IF EXISTS feed_offers_odbior_check;
ALTER TABLE public.feed_offers
  ADD CONSTRAINT feed_offers_odbior_check
  CHECK (odbior IS NULL OR odbior IN ('sklep', 'odbior', 'wysylka'));

ALTER TABLE public.feed_offers DROP CONSTRAINT IF EXISTS feed_offers_punkty_odbioru_check;
ALTER TABLE public.feed_offers
  ADD CONSTRAINT feed_offers_punkty_odbioru_check
  CHECK (jsonb_typeof(punkty_odbioru) = 'array');

COMMENT ON COLUMN public.feed_offers.miejscowosc IS 'Miejscowosc siedziby albo magazynu sklepu, np. „Olsztyn”, „Krajewice k. Gostynia”. NULL = nie ustalono.';
COMMENT ON COLUMN public.feed_offers.wojewodztwo IS 'Klucz ASCII, np. warminsko-mazurskie. NULL = sklep za granica albo nie ustalono.';
COMMENT ON COLUMN public.feed_offers.odbior IS 'sklep (sklep stacjonarny), odbior (odbior osobisty zamowienia), wysylka (tylko wysylka). NULL = strona sklepu tego nie mowi.';
COMMENT ON COLUMN public.feed_offers.punkty_odbioru IS 'Miejsca, do ktorych klient moze przyjechac: [{rodzaj: sklep|odbior, adres, wojewodztwo, godziny?}]. Adres z ulica tylko tu, nie przy sklepach z sama wysylka.';
COMMENT ON COLUMN public.feed_offers.lokalizacja_sprawdzona IS 'Kiedy lokalizacje i odbior sprawdzono na stronie sklepu (Kontakt, Regulamin, Dostawa).';
