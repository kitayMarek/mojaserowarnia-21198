-- ==========================================================================
-- Baza dodatkow paszowych: produkty z etykieta i oferty sklepow (24.10.2026)
--
-- PO CO: kalkulator pasz mowi dzis, czego w mieszance brakuje. Marek chce,
-- zeby mowil tez, czym to uzupelnic, ile to kosztuje i gdzie kupic, tak jak
-- baza kultur serowarskich (tabela cultures: ceny z data sprawdzenia).
--
-- DLACZEGO W feed_ingredients, A NIE W NOWEJ TABELI: produkt (koncentrat,
-- premiks, kreda z konkretnego worka) ma ten sam sklad co surowiec: EM,
-- bialko, Ca, P, aminokwasy, witaminy. Druga tabela skladu rozjechalaby sie
-- z pierwsza przy pierwszej poprawce kolumn. Produkty dostaja source='dodatek'
-- (seed: scripts/sql/dodatki-seed.sql), a 124 surowce wzorcowe zostaja 'baza'.
--
-- Oferty sklepow osobno (feed_offers), bo jeden produkt bywa w kilku sklepach
-- i w kilku opakowaniach, a ceny zmieniaja sie czesciej niz sklad.
--
-- NEUTRALNOSC (decyzja Marka): placi sie za obecnosc i sprawdzone dane, nigdy
-- za pozycje. Kolumna partner jest jawna, ale kalkulator i serwer MCP nie
-- uzywaja jej do ukladania kolejnosci propozycji.
--
-- Wymaga 20260831120000_feed_ingredients_i_feed_recipes.sql (tabela)
-- i 20251121074144_* (public.has_role).
-- ==========================================================================

-- --- Kolumny produktu w feed_ingredients -----------------------------------
ALTER TABLE public.feed_ingredients
  ADD COLUMN IF NOT EXISTS producent        text,
  ADD COLUMN IF NOT EXISTS gatunki          text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS dawka_proc_od    numeric,
  ADD COLUMN IF NOT EXISTS dawka_proc_do    numeric,
  ADD COLUMN IF NOT EXISTS dawka_g_dziennie numeric,
  ADD COLUMN IF NOT EXISTS dawkowanie       text,
  ADD COLUMN IF NOT EXISTS stosowanie       text,
  ADD COLUMN IF NOT EXISTS sklad_surowcowy  text,
  ADD COLUMN IF NOT EXISTS gmo              text NOT NULL DEFAULT 'nieznane',
  ADD COLUMN IF NOT EXISTS dopuszczalne_eko boolean,
  ADD COLUMN IF NOT EXISTS zrodlo_skladu    text,
  ADD COLUMN IF NOT EXISTS zweryfikowano    date,
  ADD COLUMN IF NOT EXISTS partner          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS url_producenta   text,
  ADD COLUMN IF NOT EXISTS odpowiednik      text;

-- Ograniczenia zakladane od nowa, zeby migracja dala sie puscic drugi raz.
ALTER TABLE public.feed_ingredients DROP CONSTRAINT IF EXISTS feed_ingredients_gmo_check;
ALTER TABLE public.feed_ingredients
  ADD CONSTRAINT feed_ingredients_gmo_check CHECK (gmo IN ('tak', 'nie', 'nieznane'));

ALTER TABLE public.feed_ingredients DROP CONSTRAINT IF EXISTS feed_ingredients_zrodlo_skladu_check;
ALTER TABLE public.feed_ingredients
  ADD CONSTRAINT feed_ingredients_zrodlo_skladu_check
  CHECK (zrodlo_skladu IS NULL OR zrodlo_skladu IN ('etykieta', 'producent', 'norma'));

-- Te same wartosci co typ Gatunek w src/data/dodatkiPaszowe.ts.
ALTER TABLE public.feed_ingredients DROP CONSTRAINT IF EXISTS feed_ingredients_gatunki_check;
ALTER TABLE public.feed_ingredients
  ADD CONSTRAINT feed_ingredients_gatunki_check
  CHECK (gatunki <@ ARRAY['nioski', 'odchow', 'brojlery', 'kaczki', 'gesi', 'indyki']::text[]);

-- Dawka z etykiety: albo % mieszanki od-do, albo g na sztuke dziennie (np. grit do woli).
ALTER TABLE public.feed_ingredients DROP CONSTRAINT IF EXISTS feed_ingredients_dawka_check;
ALTER TABLE public.feed_ingredients
  ADD CONSTRAINT feed_ingredients_dawka_check
  CHECK (
    (dawka_proc_od IS NULL OR (dawka_proc_od >= 0 AND dawka_proc_od <= 100))
    AND (dawka_proc_do IS NULL OR (dawka_proc_do > 0 AND dawka_proc_do <= 100))
    AND (dawka_proc_od IS NULL OR dawka_proc_do IS NULL OR dawka_proc_od <= dawka_proc_do)
    AND (dawka_g_dziennie IS NULL OR dawka_g_dziennie > 0)
  );

COMMENT ON COLUMN public.feed_ingredients.producent IS 'Producent z etykiety; przy produktach pakowanych przez dystrybutora: dystrybutor z dopiskiem.';
COMMENT ON COLUMN public.feed_ingredients.gatunki IS 'Dla kogo wedlug etykiety: nioski, odchow, brojlery, kaczki, gesi, indyki. Pusta tablica = etykieta nie zaweza.';
COMMENT ON COLUMN public.feed_ingredients.dawka_proc_od IS 'Dawka z etykiety, % mieszanki (dolna granica). Dobor zostawia premiks w tej dawce.';
COMMENT ON COLUMN public.feed_ingredients.dawka_proc_do IS 'Dawka z etykiety, % mieszanki (gorna granica).';
COMMENT ON COLUMN public.feed_ingredients.dawka_g_dziennie IS 'Dawka z etykiety w g na sztuke dziennie, gdy etykieta nie podaje % mieszanki.';
COMMENT ON COLUMN public.feed_ingredients.dawkowanie IS 'Dawkowanie slowami, doslownie z etykiety (liczby dawki w kolumnach dawka_*).';
COMMENT ON COLUMN public.feed_ingredients.stosowanie IS 'Przepis z etykiety koncentratu, np. „30% koncentratu + 70% śruty zbożowe”. Kalkulator liczy z niego „koncentrat + Twoje zboże”.';
COMMENT ON COLUMN public.feed_ingredients.sklad_surowcowy IS 'Sklad surowcowy z etykiety, doslownie.';
COMMENT ON COLUMN public.feed_ingredients.gmo IS 'tak / nie / nieznane. „tak” tylko, gdy etykieta mowi o GMO albo surowiec w Polsce jest w praktyce z roslin GM (sruta sojowa).';
COMMENT ON COLUMN public.feed_ingredients.dopuszczalne_eko IS 'Czy dopuszczalne w chowie ekologicznym (rozp. UE 2018/848 i 2021/1165). NULL = nie oceniano. Pod przyszly filtr „eko”.';
COMMENT ON COLUMN public.feed_ingredients.zrodlo_skladu IS 'Skad sklad: etykieta, producent (karta produktu) albo norma (tabele wartosci pokarmowej).';
COMMENT ON COLUMN public.feed_ingredients.zweryfikowano IS 'Kiedy sklad sprawdzono ze zrodlem.';
COMMENT ON COLUMN public.feed_ingredients.partner IS 'Producent placi za obecnosc i sprawdzanie danych. Jawnie oznaczane, NIE wplywa na kolejnosc propozycji.';
COMMENT ON COLUMN public.feed_ingredients.url_producenta IS 'Strona produktu u producenta (zrodlo etykiety).';
COMMENT ON COLUMN public.feed_ingredients.odpowiednik IS 'Surowiec wzorcowy (source=baza) tego samego rodzaju, np. kreda z worka -> „Kreda pastewna”. Z niego produkt bierze zalecany limit udzialu, a propozycje „czym uzupełnić” nie pokazuja dwoch produktow tego samego rodzaju.';

-- --- Oferty sklepow --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feed_offers (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_ingredient_id uuid NOT NULL REFERENCES public.feed_ingredients(id) ON DELETE CASCADE,
  sklep              text NOT NULL,
  url                text NOT NULL,
  cena_zl            numeric(10,2) NOT NULL,
  opakowanie_kg      numeric NOT NULL,
  -- Cena za kg liczona przez baze, zeby strona, MCP i panel nie liczyly jej kazde po swojemu.
  cena_za_kg         numeric GENERATED ALWAYS AS (round(cena_zl / opakowanie_kg, 4)) STORED,
  sprawdzono         date NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT feed_offers_cena_check CHECK (cena_zl > 0),
  CONSTRAINT feed_offers_opakowanie_check CHECK (opakowanie_kg > 0),
  -- Znacznik, po ktorym sklep i licznik wejsc rozpoznaja ruch z kalkulatora.
  CONSTRAINT feed_offers_url_check CHECK (url ~ '^https://' AND url ~ '[?&]utm_source=mojaserowarnia(&|$)'),
  CONSTRAINT feed_offers_unikalne UNIQUE (feed_ingredient_id, url, opakowanie_kg)
);

CREATE INDEX IF NOT EXISTS feed_offers_feed_ingredient_id_idx ON public.feed_offers (feed_ingredient_id);

COMMENT ON TABLE public.feed_offers IS 'Oferty sklepow dla produktow z feed_ingredients: cena brutto z data sprawdzenia. Ceny nie sa aktualne z definicji, strona i MCP podaja date.';
COMMENT ON COLUMN public.feed_offers.url IS 'Strona produktu w sklepie, z utm_source=mojaserowarnia.';
COMMENT ON COLUMN public.feed_offers.sprawdzono IS 'Dzien, w ktorym cena byla taka na stronie sklepu.';

ALTER TABLE public.feed_offers ENABLE ROW LEVEL SECURITY;

-- Odczyt publiczny, jak zatwierdzone skladniki: oferte widac, gdy jej produkt jest zatwierdzony.
-- (Podzapytanie i tak przechodzi przez RLS feed_ingredients.)
DROP POLICY IF EXISTS feed_offers_readable_by_everyone ON public.feed_offers;
CREATE POLICY feed_offers_readable_by_everyone
  ON public.feed_offers FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.feed_ingredients f
    WHERE f.id = feed_offers.feed_ingredient_id AND f.status = 'approved'::text
  ));

-- Zapis tylko admin, tak samo jak feed_admin_full_access na feed_ingredients.
DROP POLICY IF EXISTS feed_offers_admin_full_access ON public.feed_offers;
CREATE POLICY feed_offers_admin_full_access
  ON public.feed_offers FOR ALL TO authenticated
  USING (public.has_role(_user_id => auth.uid(), _role => 'admin'::public.app_role))
  WITH CHECK (public.has_role(_user_id => auth.uid(), _role => 'admin'::public.app_role));
