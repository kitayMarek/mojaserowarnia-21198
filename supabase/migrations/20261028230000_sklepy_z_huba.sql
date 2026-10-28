-- =====================================================================
-- Kopia sklepów z huba danerolne.com (28.10.2026)
-- =====================================================================
-- Plan „Sklepy i oferty” (dokument huba), krok 5. Hub wie, kto sprzedaje
-- i gdzie: dane sklepu (nazwa ze strony sklepu, strona, miejscowość,
-- punkty odbioru z godzinami, dostawa) mają jedno źródło w bazie huba.
-- Ta tabela to ich kopia do odczytu dla stron i serwerów MCP Mojej
-- Serowarni i Mojej Paszy (ta sama baza). Pisze do niej tylko Worker huba
-- (service_role), co godzinę: dopisuje i poprawia sklepy, usuwa te, których
-- w hubie już nie ma. Ceny i oferty zostają w cultures i feed_offers,
-- połączone przez sklep_id.
--
-- potwierdzony = false: sklep z danych publicznych, oznaczenie „firma nie
-- potwierdziła wpisu” (decyzja Marka z 28.10.2026), pokazywać je przy sklepie.
--
-- Uwagi wątku paszowego z 28.10.2026: odbior (sklep, odbior, wysylka, null
-- = strona nie mówi), opis sklepu z huba i stały słownik typu punktu.
--
-- URUCHOMIĆ w Supabase SQL editor (projekt Serowarni). Idempotentne: działa
-- także po wklejeniu pierwszej wersji tego pliku (dopisuje brakujące kolumny).
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.sklepy_z_huba (
  sklep_id       TEXT PRIMARY KEY CHECK (sklep_id ~ '^[a-z0-9.-]+\.[a-z]{2,}$'),
  nazwa          TEXT NOT NULL,
  strona         TEXT NOT NULL,
  miejscowosc    TEXT,
  wojewodztwo    TEXT,           -- klucz bez ogonków, jak WOJEWODZTWA w Mojej Paszy
  kraj           TEXT NOT NULL DEFAULT 'PL',
  rodzaj_firmy   TEXT[] NOT NULL DEFAULT '{}',
  opis           TEXT,           -- opis sklepu z huba (podmiot.opis), także uwagi typu „zapytaj sklep”
  odbior         TEXT,           -- sklep | odbior | wysylka; null = strona sklepu tego nie mówi
  -- Punkty z huba: [{nazwa, typ, rodzaj, adres, wojewodztwo, gmina, godziny, kiedy, link}].
  -- typ to stały słownik: sklep_internetowy, sklep_stacjonarny, odbior_osobisty, inne
  -- (nowa wartość = wiadomość od huba). rodzaj to te same słowa co w hubie. Adres jest
  -- tylko przy publicznym punkcie (sklep, odbiór), nigdy adres domu.
  punkty         JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Dostawa z huba: {zasieg, opis, darmowa_od_zl, tylko_wysylka, sprawdzono}; null = sklep nie podaje.
  -- Cennik wysyłki do obliczeń zostaje w serwisach (np. progiWagi w Mojej Paszy), tu tylko opis.
  dostawa        JSONB,
  potwierdzony   BOOLEAN NOT NULL DEFAULT false,
  zrodla_danych  JSONB NOT NULL DEFAULT '[]'::jsonb,
  aktualne_do    DATE,
  potwierdzono   DATE,           -- ostatnia zmiana albo potwierdzenie danych w hubie
  skopiowano     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Po pierwszej wersji tego pliku (bez opisu i odbioru).
ALTER TABLE public.sklepy_z_huba ADD COLUMN IF NOT EXISTS opis TEXT;
ALTER TABLE public.sklepy_z_huba ADD COLUMN IF NOT EXISTS odbior TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sklepy_z_huba_odbior_check') THEN
    ALTER TABLE public.sklepy_z_huba ADD CONSTRAINT sklepy_z_huba_odbior_check
      CHECK (odbior IN ('sklep', 'odbior', 'wysylka'));
  END IF;
  -- Te same klucze co feed_offers.wojewodztwo (migracja 20261025100000) i WOJEWODZTWA w hubie.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sklepy_z_huba_wojewodztwo_check') THEN
    ALTER TABLE public.sklepy_z_huba ADD CONSTRAINT sklepy_z_huba_wojewodztwo_check
      CHECK (wojewodztwo IN ('dolnoslaskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie', 'lodzkie', 'malopolskie',
        'mazowieckie', 'opolskie', 'podkarpackie', 'podlaskie', 'pomorskie', 'slaskie', 'swietokrzyskie',
        'warminsko-mazurskie', 'wielkopolskie', 'zachodniopomorskie'));
  END IF;
END $$;

COMMENT ON TABLE public.sklepy_z_huba IS
  'Kopia sklepów z huba danerolne.com (źródło: baza huba). Pisze tylko Worker huba co godzinę; strony i MCP Serowarni i Mojej Paszy tylko czytają.';

ALTER TABLE public.sklepy_z_huba ENABLE ROW LEVEL SECURITY;

-- Dane sklepów są publiczne (i tak stoją na stronach kultur i pasz), więc odczyt dla wszystkich.
DROP POLICY IF EXISTS "sklepy_z_huba odczyt" ON public.sklepy_z_huba;
CREATE POLICY "sklepy_z_huba odczyt" ON public.sklepy_z_huba FOR SELECT TO anon, authenticated USING (true);

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.sklepy_z_huba FROM anon, authenticated;
GRANT SELECT ON public.sklepy_z_huba TO anon, authenticated;
GRANT ALL ON public.sklepy_z_huba TO service_role;
