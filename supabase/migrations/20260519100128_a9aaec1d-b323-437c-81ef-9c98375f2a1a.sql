-- ============================================================
-- MIGRACJA: Kultury bakteryjne → Supabase
-- ============================================================

CREATE TABLE public.cultures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  composition     TEXT,
  application     TEXT,
  temperature     TEXT,
  type            TEXT,
  shop            TEXT,
  shop_url        TEXT,
  product_url     TEXT,
  price_label     TEXT,
  price_numeric   DECIMAL(10,2),
  last_changed    TEXT,
  last_checked    DATE,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cultures_type  ON public.cultures(type);
CREATE INDEX idx_cultures_shop  ON public.cultures(shop);
CREATE INDEX idx_cultures_name  ON public.cultures(name);
CREATE INDEX idx_cultures_price ON public.cultures(price_numeric);

CREATE INDEX idx_cultures_fts ON public.cultures
  USING gin(
    to_tsvector('simple',
      coalesce(name,'') || ' ' ||
      coalesce(composition,'') || ' ' ||
      coalesce(application,'')
    )
  );

ALTER TABLE public.cultures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kultury widoczne dla wszystkich"
  ON public.cultures FOR SELECT
  USING (is_active = true);

CREATE POLICY "Tylko admin moze dodawac kultury"
  ON public.cultures FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Tylko admin moze edytowac kultury"
  ON public.cultures FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


CREATE TABLE public.price_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  culture_id    UUID NOT NULL REFERENCES public.cultures(id) ON DELETE CASCADE,
  price_label   TEXT NOT NULL,
  price_numeric DECIMAL(10,2),
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  source        TEXT DEFAULT 'manual'
);

CREATE INDEX idx_price_history_culture ON public.price_history(culture_id, recorded_at DESC);

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Historia cen widoczna dla wszystkich"
  ON public.price_history FOR SELECT USING (true);

CREATE POLICY "Tylko admin moze dodawac historie cen"
  ON public.price_history FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


CREATE TABLE public.user_culture_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_culture_list_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id    UUID NOT NULL REFERENCES public.user_culture_lists(id) ON DELETE CASCADE,
  culture_id UUID NOT NULL REFERENCES public.cultures(id) ON DELETE CASCADE,
  notes      TEXT,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(list_id, culture_id)
);

ALTER TABLE public.user_culture_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_culture_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Uzytkownik widzi tylko swoje listy"
  ON public.user_culture_lists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Uzytkownik widzi tylko swoje pozycje"
  ON public.user_culture_list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_culture_lists
      WHERE id = list_id AND user_id = auth.uid()
    )
  );


CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_cultures_updated_at
  BEFORE UPDATE ON public.cultures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- SEED: 147 kultur
INSERT INTO public.cultures
  (name, composition, application, temperature, type, shop, shop_url, product_url, price_label, price_numeric, last_changed, last_checked)
VALUES
  ('Choozit GEO 17', 'Geotrichum candidum', 'Brie, Camembert, Fromage, sery kwasowo-podpuszczkowe', '25-35°C', 'pleśniowe', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/25-34--choozit-geo-17.html', '36,00 zł', 36.00, NULL, NULL),
  ('Choozit GEO 13', 'Geotrichum candidum (szczep 13)', 'Camembert, Brie, Fromage de chèvre, kwasowo-podpuszczkowe', '34-38°C', 'pleśniowe', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/24-33-choozit-geo-13.html', '39,00 zł', 39.00, NULL, NULL),
  ('Camembert Mix', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar. diacetylactis, Leuconostoc mesenteroides subsp. cremoris, Streptococcus thermophilus', 'Sery miękkie i pleśniowe (Camembert, Brie, Roquefort, Gorgonzola, Stilton)', '34-38°C', 'mezofilno-termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/4-1-camembert-mix.html', '24,00 zł', 24.00, NULL, NULL),
  ('Choozit Alp', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Streptococcus thermophilus, Lactobacillus helveticus, Lactobacillus lactis', 'Sery górskie, aromat i smak sera', 'do 48°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/6-4-choozit-alp.html', '59,00 zł, 50DCU', 59.00, NULL, NULL),
  ('Choozit FT 001', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Streptococcus thermophilus, Lactobacillus delbrueckii subsp. lactis, Lactobacillus delbrueckii subsp. bulgaricus', 'Sery typu Feta, sery miękkie', '34-38°C', 'mezofilno-termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/7-6-choozit-ft-001.html', '36,00 zł', 36.00, NULL, NULL),
  ('Choozit MA 4001', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris', 'Sery twarde i półtwarde (Cheddar, Gouda, Edam)', '20-32°C', 'mezofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/8-7-choozit-ma-4001.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit MA 4002', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar. diacetylactis', 'Sery twarde i półtwarde, Gouda, Edam', '20-32°C', 'mezofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/9-8-choozit-ma-4002.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit MM 100', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar. diacetylactis, Leuconostoc mesenteroides subsp. cremoris', 'Sery miękkie, twaróg, fromage frais', '20-28°C', 'mezofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/10-9-choozit-mm-100.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit RA 22', 'Lactococcus lactis subsp. lactis, Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Camembert, Brie i inne sery miękkie', '30-40°C', 'mezofilno-termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/11-10-choozit-ra-22.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit THERMO B', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Mozzarella, jogurt, sery włoskie', '37-45°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/12-11-choozit-thermo-b.html', '36,00 zł', 36.00, NULL, NULL),
  ('Choozit FLORE 12', 'Brevibacterium linens', 'Sery myte, sery czerwone (Limburger, Munster)', '15-22°C', 'aromatyzujące', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/13-12-choozit-flore-12.html', '45,00 zł', 45.00, NULL, NULL),
  ('Choozit PC', 'Penicillium camemberti', 'Sery pleśniowe białe (Camembert, Brie)', '10-18°C', 'pleśniowe', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/15-14-choozit-pc.html', '29,00 zł', 29.00, NULL, NULL),
  ('Choozit PR', 'Penicillium roqueforti', 'Sery pleśniowe niebieskie (Gorgonzola, Roquefort, Stilton)', '10-18°C', 'pleśniowe', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/16-15-choozit-pr.html', '29,00 zł', 29.00, NULL, NULL),
  ('Choozit TA 050', 'Streptococcus thermophilus', 'Mozzarella, Ricotta, sery włoskie', '40-45°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/17-16-choozit-ta-050.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit TA 61', 'Streptococcus thermophilus, Lactobacillus helveticus', 'Sery twarde typu szwajcarskiego, Parmezan', '38-48°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/18-17-choozit-ta-61.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit LH 100', 'Lactobacillus helveticus', 'Sery twarde, aromat, Parmezan', '38-48°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/19-18-choozit-lh-100.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit LD', 'Lactobacillus delbrueckii subsp. lactis', 'Sery twarde, Cheddar, aromtat', '38-45°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/20-19-choozit-ld.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit PLA', 'Lactobacillus plantarum', 'Sery twarde, ochrona przed dzikimi drożdżami', '15-35°C', 'ochronne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/21-20-choozit-pla.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit PAL 4', 'Propionibacterium freudenreichii subsp. shermanii', 'Sery dziurkaste (Emmental, Gouda z dziurkami)', '18-25°C', 'propionowe', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/22-21-choozit-pal-4.html', '59,00 zł', 59.00, NULL, NULL),
  ('Choozit TM 81', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. lactis, Lactobacillus helveticus', 'Sery twarde typu włoskiego i szwajcarskiego', '38-48°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/23-22-choozit-tm-81.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit FLORA DANICA', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar. diacetylactis, Leuconostoc mesenteroides subsp. cremoris', 'Sery skandynawskie, Havarti, Danbo', '20-30°C', 'mezofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/flora-danica.html', '55,00 zł', 55.00, NULL, NULL),
  ('Choozit HCA', 'Hafnia alvei', 'Sery półtwarde, Tilsit, aromat', '15-22°C', 'aromatyzujące', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Choozit BL 1', 'Brevibacterium linens', 'Sery myte, powierzchniowe smary serów', '15-20°C', 'aromatyzujące', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Choozit TR 1', 'Torula (Debaryomyces hansenii)', 'Sery półtwarde, Tilsit, Limburger', '15-20°C', 'aromatyzujące', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '39,00 zł', 39.00, NULL, NULL),
  ('Choozit CB 2', 'Candida boidinii', 'Sery myte, Munster, Reblochon', '15-20°C', 'aromatyzujące', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '39,00 zł', 39.00, NULL, NULL),
  ('Kefir Mix', 'Lactococcus lactis, Lactobacillus kefiri, drożdże kefirowe', 'Kefir tradycyjny', '20-25°C', 'kefir', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '24,00 zł', 24.00, NULL, NULL),
  ('Jogurt 1', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Jogurt klasyczny', '40-45°C', 'jogurtowe', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '19,00 zł', 19.00, NULL, NULL),
  ('Acidophilus', 'Lactobacillus acidophilus', 'Mleko acidofilne, sery probiotyczne', '37-40°C', 'probiotyczne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '24,00 zł', 24.00, NULL, NULL),
  ('Alpha', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris', 'Sery miękkie, twaróg, quark', '20-30°C', 'mezofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/alpha', '18,00 zł', 18.00, NULL, NULL),
  ('Beta', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Leuconostoc mesenteroides', 'Sery miękkie z aromatem', '20-30°C', 'mezofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/beta', '18,00 zł', 18.00, NULL, NULL),
  ('Gamma', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Mozzarella, jogurt, sery włoskie', '38-45°C', 'termofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/gamma', '18,00 zł', 18.00, NULL, NULL),
  ('Delta', 'Streptococcus thermophilus, Lactobacillus helveticus, Lactobacillus delbrueckii subsp. lactis', 'Sery twarde, Parmezan, Grana', '40-50°C', 'termofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/delta', '18,00 zł', 18.00, NULL, NULL),
  ('Epsilon', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar. diacetylactis, Leuconostoc mesenteroides subsp. cremoris', 'Sery skandynawskie, Havarti, Butterkäse', '20-28°C', 'mezofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/epsilon', '22,00 zł', 22.00, NULL, NULL),
  ('Flora Danica - Lactic', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar. diacetylactis, Leuconostoc mesenteroides subsp. cremoris', 'Sery skandynawskie, Havarti, Esrom', '20-28°C', 'mezofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/flora-danica', '32,00 zł', 32.00, NULL, NULL),
  ('Penicillium candidum - Lactic', 'Penicillium camemberti', 'Camembert, Brie, sery pleśniowe białe', '12-18°C', 'pleśniowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/penicillium-candidum', '22,00 zł', 22.00, NULL, NULL),
  ('Penicillium roqueforti - Lactic', 'Penicillium roqueforti', 'Gorgonzola, Roquefort, Stilton, Danablu', '10-15°C', 'pleśniowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/penicillium-roqueforti', '22,00 zł', 22.00, NULL, NULL),
  ('Geotrichum candidum - Lactic', 'Geotrichum candidum', 'Camembert, Brie, sery świeże', '18-25°C', 'pleśniowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/geotrichum-candidum', '22,00 zł', 22.00, NULL, NULL),
  ('Brevibacterium linens - Lactic', 'Brevibacterium linens', 'Sery myte, sery smażone, Limburger', '15-20°C', 'aromatyzujące', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/brevibacterium-linens', '28,00 zł', 28.00, NULL, NULL),
  ('Propionibacterium - Lactic', 'Propionibacterium freudenreichii', 'Sery dziurkaste, Emmental', '18-24°C', 'propionowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/propionibacterium', '35,00 zł', 35.00, NULL, NULL),
  ('Kefir - Lactic', 'Lactococcus lactis, Leuconostoc, Lactobacillus kefiri, Kluyveromyces marxianus', 'Kefir mleczny', '20-25°C', 'kefir', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/kefir', '18,00 zł', 18.00, NULL, NULL),
  ('Jogurt - Lactic', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Jogurt naturalny', '40-45°C', 'jogurtowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/jogurt', '15,00 zł', 15.00, NULL, NULL),
  ('Probiotyk L. acidophilus', 'Lactobacillus acidophilus', 'Mleko acidofilne, produkty probiotyczne', '37°C', 'probiotyczne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/lactobacillus-acidophilus', '22,00 zł', 22.00, NULL, NULL),
  ('Danisco CHOOZIT MA11', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris', 'Cheddar, Colby, Gouda, sery twarde', '22-32°C', 'mezofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Danisco CHOOZIT TA 60', 'Streptococcus thermophilus', 'Mozzarella, sery włoskie, Provolone', '38-45°C', 'termofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Danisco CHOOZIT TA 45', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. lactis', 'Mozzarella wysoko-wilgotna, Pizza cheese', '38-45°C', 'termofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '48,00 zł', 48.00, NULL, NULL),
  ('Danisco CHOOZIT SWING', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Streptococcus thermophilus', 'Elastyczne zastosowanie mezo-termofilne', '28-38°C', 'mezofilno-termofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '52,00 zł', 52.00, NULL, NULL),
  ('Chr. Hansen Flora Danica', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Leuconostoc, Lactococcus diacetylactis', 'Sery skandynawskie, masło, śmietana', '18-25°C', 'mezofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '65,00 zł', 65.00, NULL, NULL),
  ('Chr. Hansen R-704', 'Streptococcus thermophilus', 'Ricotta, Mozzarella, sery świeże', '38-45°C', 'termofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '55,00 zł', 55.00, NULL, NULL),
  ('Chr. Hansen FD-DVS Kefir', 'Lactococcus lactis, Leuconostoc, Lactobacillus, Kluyveromyces', 'Kefir mleczny DVS', '22-25°C', 'kefir', 'GAP Poland', 'https://gappoland.pl/', NULL, '75,00 zł', 75.00, NULL, NULL),
  ('Danisco YC-X11', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Jogurt kremowy, jogurt grecki', '42-45°C', 'jogurtowe', 'GAP Poland', 'https://gappoland.pl/', NULL, '65,00 zł', 65.00, NULL, NULL),
  ('Mezofilna typ B', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris', 'Gouda, Edam, sery holenderskie', '22-30°C', 'mezofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '12,00 zł', 12.00, NULL, NULL),
  ('Mezofilna typ O', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar. diacetylactis', 'Gouda, Edamer, twaróg', '22-30°C', 'mezofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '12,00 zł', 12.00, NULL, NULL),
  ('Mezofilna typ BD', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Leuconostoc mesenteroides', 'Sery holenderskie, Havarti, Tilsit', '22-30°C', 'mezofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '12,00 zł', 12.00, NULL, NULL),
  ('Termofilna ST', 'Streptococcus thermophilus', 'Mozzarella, Ricotta, jogurt', '38-45°C', 'termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '12,00 zł', 12.00, NULL, NULL),
  ('Termofilna LB', 'Lactobacillus delbrueckii subsp. bulgaricus', 'Jogurt, Sery bułgarskie', '42-45°C', 'termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '12,00 zł', 12.00, NULL, NULL),
  ('Mix Termofilna', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Jogurt, Mozzarella, sery włoskie', '38-45°C', 'termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '14,00 zł', 14.00, NULL, NULL),
  ('Kultura Camembert', 'Penicillium camemberti, Geotrichum candidum, mezofilne bakterie mlekowe', 'Camembert domowy', '25-35°C', 'pleśniowe', 'Serowar.pl', 'https://serowar.pl/', NULL, '16,00 zł', 16.00, NULL, NULL),
  ('Kultura Roquefort', 'Penicillium roqueforti, termofilne bakterie mlekowe', 'Roquefort, Gorgonzola, Stilton', '10-15°C', 'pleśniowe', 'Serowar.pl', 'https://serowar.pl/', NULL, '16,00 zł', 16.00, NULL, NULL),
  ('Kefir Serowar', 'Lactococcus lactis, Leuconostoc, Lactobacillus, drożdże', 'Kefir tradycyjny', '20-25°C', 'kefir', 'Serowar.pl', 'https://serowar.pl/', NULL, '10,00 zł', 10.00, NULL, NULL),
  ('Jogurt Serowar', 'Streptococcus thermophilus, Lactobacillus acidophilus, Bifidobacterium', 'Jogurt probiotyczny', '37-42°C', 'probiotyczne', 'Serowar.pl', 'https://serowar.pl/', NULL, '10,00 zł', 10.00, NULL, NULL),
  ('Kultura do Fety', 'Lactococcus lactis, Streptococcus thermophilus, Lactobacillus', 'Feta, sery solankowe', '28-35°C', 'mezofilno-termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '14,00 zł', 14.00, NULL, NULL),
  ('DCC-260 Kefir', 'Lactobacillus acidophilus, Bifidobacterium lactis, Streptococcus thermophilus', 'Kefir mleczny, mleko fermentowane', '20-25°C', 'kefir', 'Artiser.pl', 'https://artiser.pl/', NULL, '28,00 zł', 28.00, NULL, NULL),
  ('DCC-270 Jogurt', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Jogurt naturalny, jogurt grecki', '40-45°C', 'jogurtowe', 'Artiser.pl', 'https://artiser.pl/', NULL, '25,00 zł', 25.00, NULL, NULL),
  ('DCC-280 Acidophilus', 'Lactobacillus acidophilus La-5, Bifidobacterium BB-12', 'Mleko acidofilne, produkty probiotyczne', '37-40°C', 'probiotyczne', 'Artiser.pl', 'https://artiser.pl/', NULL, '32,00 zł', 32.00, NULL, NULL),
  ('MM 100 Artiser', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Leuconostoc mesenteroides', 'Sery miękkie, fromage frais, twaróg', '20-28°C', 'mezofilne', 'Artiser.pl', 'https://artiser.pl/', NULL, '35,00 zł', 35.00, NULL, NULL),
  ('MA 011 Artiser', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris', 'Cheddar, Gouda, sery twarde mezofilne', '22-32°C', 'mezofilne', 'Artiser.pl', 'https://artiser.pl/', NULL, '35,00 zł', 35.00, NULL, NULL),
  ('TA 60 Artiser', 'Streptococcus thermophilus', 'Mozzarella, Provolone, sery włoskie', '38-45°C', 'termofilne', 'Artiser.pl', 'https://artiser.pl/', NULL, '38,00 zł', 38.00, NULL, NULL),
  ('TM 81 Artiser', 'Streptococcus thermophilus, Lactobacillus helveticus, Lactobacillus delbrueckii', 'Sery szwajcarskie, Emmental, Gruyère', '40-50°C', 'termofilne', 'Artiser.pl', 'https://artiser.pl/', NULL, '42,00 zł', 42.00, NULL, NULL),
  ('PC Artiser', 'Penicillium camemberti', 'Camembert, Brie', '12-18°C', 'pleśniowe', 'Artiser.pl', 'https://artiser.pl/', NULL, '28,00 zł', 28.00, NULL, NULL),
  ('PR Artiser', 'Penicillium roqueforti', 'Gorgonzola, Roquefort', '10-15°C', 'pleśniowe', 'Artiser.pl', 'https://artiser.pl/', NULL, '28,00 zł', 28.00, NULL, NULL),
  ('BL Artiser', 'Brevibacterium linens', 'Sery myte, Munster, Limburger', '15-20°C', 'aromatyzujące', 'Artiser.pl', 'https://artiser.pl/', NULL, '32,00 zł', 32.00, NULL, NULL),
  ('Vege Starter', 'Lactococcus lactis, kultury roślinne', 'Sery wegańskie, fermentaty roślinne', '20-30°C', 'wege', 'Artiser.pl', 'https://artiser.pl/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Choozit SWING Wańczykówka', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Streptococcus thermophilus', 'Sery półtwarde, elastyczne zastosowanie', '28-40°C', 'mezofilno-termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '49,00 zł', 49.00, NULL, NULL),
  ('Zestaw Startowy Serowar', 'Mezofilne + termofilne + Penicillium candidum', 'Zestaw do rozpoczęcia serowarstwa', '20-45°C', 'zestaw', 'Serowar.pl', 'https://serowar.pl/', NULL, '35,00 zł', 35.00, NULL, NULL),
  ('Zestaw Lactic Podstawowy', 'Alpha + Beta + Gamma', 'Zestaw startowy do 3 typów sera', '20-45°C', 'zestaw', 'Lactic.pl', 'https://lactic.pl/', NULL, '48,00 zł', 48.00, NULL, NULL),
  ('Choozit ME', 'Lactococcus lactis subsp. lactis, Leuconostoc', 'Sery miękkie, twaróg, maślanka', '20-30°C', 'mezofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '36,00 zł', 36.00, NULL, NULL),
  ('Choozit SB 6', 'Staphylococcus xylosus, Staphylococcus carnosus', 'Sery dojrzewające, ochrona powierzchni', '15-22°C', 'ochronne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '55,00 zł', 55.00, NULL, NULL),
  ('Choozit CHOOZIT E', 'Enterococcus faecium', 'Sery regionalne, tradycyjne', '20-35°C', 'aromatyzujące', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Choozit PROTEK CR', 'Lactobacillus plantarum, Lactobacillus rhamnosus', 'Ochrona biologiczna, hamowanie niepożądanej mikroflory', '15-35°C', 'ochronne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '65,00 zł', 65.00, NULL, NULL),
  ('Choozit MCA 34', 'Lactococcus lactis subsp. cremoris', 'Sery typu kremowego, Brie, Camembert', '30-35°C', 'mezofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '39,00 zł', 39.00, NULL, NULL),
  ('Zeta - Lactic', 'Lactobacillus acidophilus, Bifidobacterium, Streptococcus thermophilus', 'Jogurt probiotyczny, kefir', '37-40°C', 'probiotyczne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/zeta', '22,00 zł', 22.00, NULL, NULL),
  ('Theta - Lactic', 'Leuconostoc mesenteroides, Lactococcus lactis', 'Kiszonki, fermentacja warzyw, ogórki', '15-25°C', 'mezofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/theta', '18,00 zł', 18.00, NULL, NULL),
  ('Danisco VEGE', 'Lactococcus lactis, Leuconostoc (izolatów roślinnych)', 'Sery wegańskie z mleka roślinnego', '20-30°C', 'wege', 'GAP Poland', 'https://gappoland.pl/', NULL, '85,00 zł', 85.00, NULL, NULL),
  ('Chr. Hansen CHY-MAX', 'Chymosin B (podpuszczka mikrobiologiczna)', 'Technologiczny koagulant do wszelkich serów', '30-35°C', 'zestaw', 'GAP Poland', 'https://gappoland.pl/', NULL, '95,00 zł', 95.00, NULL, NULL),
  ('Danisco HOLDBAC YM-C', 'Lactobacillus rhamnosus, Lactobacillus casei', 'Ochrona sera przed drożdżami i pleśnią', '10-30°C', 'ochronne', 'GAP Poland', 'https://gappoland.pl/', NULL, '78,00 zł', 78.00, NULL, NULL),
  ('Danisco HOLDBAC YM-B', 'Lactobacillus rhamnosus', 'Ochrona jogurtu przed drożdżami', '10-42°C', 'ochronne', 'GAP Poland', 'https://gappoland.pl/', NULL, '72,00 zł', 72.00, NULL, NULL),
  ('Kultura Do Oscypka', 'Lactobacillus casei, Lactococcus lactis, kultury termofilne', 'Oscypek, bryndza, sery podhalańskie', '32-40°C', 'termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '18,00 zł', 18.00, NULL, NULL),
  ('Kultura Do Bundzu', 'Lactococcus lactis, Leuconostoc, Lactobacillus', 'Bundz, bryndza owcza', '28-35°C', 'mezofilno-termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '16,00 zł', 16.00, NULL, NULL),
  ('Kultura Do Twarogu', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris', 'Twaróg, ser biały, sernik', '18-25°C', 'mezofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '8,00 zł', 8.00, NULL, NULL),
  ('Lacidofil RO - Artiser', 'Lactobacillus acidophilus, Lactobacillus rhamnosus', 'Jogurt probiotyczny, kefir wzmocniony', '37-40°C', 'probiotyczne', 'Artiser.pl', 'https://artiser.pl/', NULL, '38,00 zł', 38.00, NULL, NULL),
  ('ABY-3 Artiser', 'Lactobacillus acidophilus La-5, Bifidobacterium BB-12, Streptococcus thermophilus', 'Jogurt ABT, produkty bio', '37-43°C', 'probiotyczne', 'Artiser.pl', 'https://artiser.pl/', NULL, '42,00 zł', 42.00, NULL, NULL),
  ('GEO 17 Artiser', 'Geotrichum candidum (szczep 17)', 'Camembert, Brie, sery świeże', '20-30°C', 'pleśniowe', 'Artiser.pl', 'https://artiser.pl/', NULL, '30,00 zł', 30.00, NULL, NULL),
  ('PAL 6 Artiser', 'Propionibacterium freudenreichii', 'Emmental, sery z oczkami', '18-24°C', 'propionowe', 'Artiser.pl', 'https://artiser.pl/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Choozit MESO II', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Leuconostoc', 'Gouda, Edam, sery holenderskie', '22-30°C', 'mezofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '42,00 zł', 42.00, NULL, NULL),
  ('Choozit TS 2', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. lactis', 'Sery włoskie, Provolone, Caciocavallo', '38-50°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '42,00 zł', 42.00, NULL, NULL),
  ('Choozit CAMA', 'Streptococcus thermophilus, Lactobacillus casei', 'Camembert, sery pleśniowe', '30-38°C', 'mezofilno-termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Kombucha Starter', 'SCOBY (drożdże + Acetobacter + Gluconobacter)', 'Kombucha, fermentowana herbata', '22-28°C', 'zestaw', 'Artiser.pl', 'https://artiser.pl/', NULL, '35,00 zł', 35.00, NULL, NULL),
  ('Maślanka - Lactic', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Leuconostoc', 'Maślanka, serwatka fermentowana', '18-22°C', 'mezofilne', 'Lactic.pl', 'https://lactic.pl/', NULL, '15,00 zł', 15.00, NULL, NULL),
  ('Kultura Skyr', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus, Lactococcus lactis', 'Skyr islandzki, jogurt islandzki', '38-42°C', 'jogurtowe', 'Lactic.pl', 'https://lactic.pl/', NULL, '22,00 zł', 22.00, NULL, NULL),
  ('Kultura Crème Fraîche', 'Lactococcus lactis subsp. lactis, Leuconostoc, Lactococcus diacetylactis', 'Crème fraîche, śmietana fermentowana', '18-22°C', 'mezofilne', 'Lactic.pl', 'https://lactic.pl/', NULL, '20,00 zł', 20.00, NULL, NULL),
  ('Termofilna do Mozzarelli', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Mozzarella, Pizza cheese', '38-45°C', 'termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '14,00 zł', 14.00, NULL, NULL),
  ('Mezofilna do Goudy', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris', 'Gouda, ser holenderski', '22-28°C', 'mezofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '10,00 zł', 10.00, NULL, NULL),
  ('Choozit FLORA BLANC', 'Geotrichum candidum, Penicillium camemberti', 'Camembert, Brie, sery białe', '15-20°C', 'pleśniowe', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '55,00 zł', 55.00, NULL, NULL),
  ('Choozit FLORE 63', 'Brevibacterium linens, Arthrobacter', 'Sery myte typu Reblochon', '14-18°C', 'aromatyzujące', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '55,00 zł', 55.00, NULL, NULL),
  ('Danisco CHOOZIT PROPIONIC', 'Propionibacterium freudenreichii subsp. shermanii', 'Emmental, Jarlsberg, sery propionowe', '18-24°C', 'propionowe', 'GAP Poland', 'https://gappoland.pl/', NULL, '68,00 zł', 68.00, NULL, NULL),
  ('Danisco CHOOZIT LINENS', 'Brevibacterium linens', 'Sery myte powierzchniowo', '15-22°C', 'aromatyzujące', 'GAP Poland', 'https://gappoland.pl/', NULL, '62,00 zł', 62.00, NULL, NULL),
  ('Danisco CHOOZIT PC', 'Penicillium camemberti', 'Camembert, Brie, sery białe pleśniowe', '12-18°C', 'pleśniowe', 'GAP Poland', 'https://gappoland.pl/', NULL, '58,00 zł', 58.00, NULL, NULL),
  ('Danisco CHOOZIT PR', 'Penicillium roqueforti', 'Roquefort, Gorgonzola, Stilton', '10-15°C', 'pleśniowe', 'GAP Poland', 'https://gappoland.pl/', NULL, '58,00 zł', 58.00, NULL, NULL),
  ('Danisco CHOOZIT GEO', 'Geotrichum candidum', 'Camembert, Brie, sery świeże', '18-25°C', 'pleśniowe', 'GAP Poland', 'https://gappoland.pl/', NULL, '55,00 zł', 55.00, NULL, NULL),
  ('Danisco CHOOZIT MM 101', 'Lactococcus lactis subsp. lactis, Leuconostoc mesenteroides', 'Sery miękkie, fromage frais', '20-28°C', 'mezofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '48,00 zł', 48.00, NULL, NULL),
  ('Eta - Lactic', 'Lactobacillus helveticus, Streptococcus thermophilus', 'Parmezan, Grana Padano, sery twarde włoskie', '40-50°C', 'termofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/eta', '25,00 zł', 25.00, NULL, NULL),
  ('Iota - Lactic', 'Propionibacterium freudenreichii', 'Emmental, sery z oczkami', '18-22°C', 'propionowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/iota', '32,00 zł', 32.00, NULL, NULL),
  ('Kappa - Lactic', 'Brevibacterium linens, Debaryomyces hansenii', 'Limburger, Munster, Taleggio', '14-20°C', 'aromatyzujące', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/kappa', '28,00 zł', 28.00, NULL, NULL),
  ('Lambda - Lactic', 'Lactobacillus plantarum', 'Ochrona biologiczna, kiszonki', '15-30°C', 'ochronne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/lambda', '22,00 zł', 22.00, NULL, NULL),
  ('Mu - Lactic', 'Penicillium camemberti var. candidum', 'Camembert, sery białe', '12-18°C', 'pleśniowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/mu', '24,00 zł', 24.00, NULL, NULL),
  ('Nu - Lactic', 'Penicillium roqueforti (szczep ciemny)', 'Gorgonzola, Stilton, sery niebieskie', '10-14°C', 'pleśniowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/nu', '24,00 zł', 24.00, NULL, NULL),
  ('Cheddar Mix - Serowar', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactobacillus casei', 'Cheddar, Cheshire, sery angielskie', '24-32°C', 'mezofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '16,00 zł', 16.00, NULL, NULL),
  ('Parmezan Mix - Serowar', 'Streptococcus thermophilus, Lactobacillus helveticus, Lactobacillus delbrueckii', 'Parmezan, Grana, sery granularne', '40-50°C', 'termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '16,00 zł', 16.00, NULL, NULL),
  ('Swiss Mix - Serowar', 'Streptococcus thermophilus, Propionibacterium freudenreichii, Lactobacillus helveticus', 'Emmental, Gruyère, sery szwajcarskie', '38-48°C', 'termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '18,00 zł', 18.00, NULL, NULL),
  ('Tilsit Mix - Serowar', 'Lactococcus lactis, Leuconostoc, Brevibacterium linens', 'Tilsit, Havarti z myciem', '20-25°C', 'mezofilno-termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '18,00 zł', 18.00, NULL, NULL),
  ('Vege Soy - Artiser', 'Lactobacillus acidophilus, Bifidobacterium, kultury roślinne', 'Twarożek sojowy, sery roślinne', '35-40°C', 'wege', 'Artiser.pl', 'https://artiser.pl/', NULL, '42,00 zł', 42.00, NULL, NULL),
  ('Vege Nut - Artiser', 'Lactobacillus, Leuconostoc, kultury orzechowe', 'Sery orzechowe wegańskie', '20-28°C', 'wege', 'Artiser.pl', 'https://artiser.pl/', NULL, '48,00 zł', 48.00, NULL, NULL),
  ('Ferma Kefir 1', 'Lactococcus lactis, Lactobacillus kefiri, Saccharomyces cerevisiae', 'Kefir mleczny 1% tłuszczu', '20-25°C', 'kefir', 'Artiser.pl', 'https://artiser.pl/', NULL, '30,00 zł', 30.00, NULL, NULL),
  ('Ferma Kefir 2', 'Lactococcus lactis, Leuconostoc, Lactobacillus, Kluyveromyces', 'Kefir pełny, kefir 2%', '20-25°C', 'kefir', 'Artiser.pl', 'https://artiser.pl/', NULL, '30,00 zł', 30.00, NULL, NULL),
  ('Danisco YO-MIX 600', 'Lactobacillus acidophilus, Bifidobacterium animalis, Streptococcus thermophilus', 'Jogurt ABT, produkty probiotyczne', '40-43°C', 'probiotyczne', 'GAP Poland', 'https://gappoland.pl/', NULL, '75,00 zł', 75.00, NULL, NULL),
  ('Danisco YO-MIX 200', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Jogurt bałkański, jogurt stały', '40-45°C', 'jogurtowe', 'GAP Poland', 'https://gappoland.pl/', NULL, '68,00 zł', 68.00, NULL, NULL),
  ('Danisco YO-MIX 495', 'Streptococcus thermophilus, Lactobacillus acidophilus', 'Jogurt mały, deser mleczny', '40-43°C', 'jogurtowe', 'GAP Poland', 'https://gappoland.pl/', NULL, '68,00 zł', 68.00, NULL, NULL),
  ('Probiofilna P1', 'Lactobacillus rhamnosus GG, Bifidobacterium longum', 'Produkty probiotyczne specjalistyczne', '37°C', 'probiotyczne', 'GAP Poland', 'https://gappoland.pl/', NULL, '88,00 zł', 88.00, NULL, NULL),
  ('Xi - Lactic Kefir Wege', 'Lactobacillus, Leuconostoc, drożdże z izolatów roślinnych', 'Kefir wegański z mleka roślinnego', '20-25°C', 'wege', 'Lactic.pl', 'https://lactic.pl/', NULL, '28,00 zł', 28.00, NULL, NULL),
  ('Zestaw Artisan Serowar', 'Mezofilna + Termofilna + Kefir + Jogurt', 'Kompletny zestaw startowy 4-kultury', '20-45°C', 'zestaw', 'Serowar.pl', 'https://serowar.pl/', NULL, '42,00 zł', 42.00, NULL, NULL),
  ('Choozit PROTEK VB', 'Lactobacillus rhamnosus, Lactobacillus casei', 'Ochrona biologiczna, hamowanie niepożądanych drobnoustrojów', '10-35°C', 'ochronne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '69,00 zł', 69.00, NULL, NULL),
  ('Choozit SWISS', 'Streptococcus thermophilus, Propionibacterium freudenreichii, Lactobacillus helveticus', 'Emmental, Gruyère, Jarlsberg', '38-48°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '59,00 zł', 59.00, NULL, NULL),
  ('Ferma Bifidum', 'Bifidobacterium bifidum, Lactococcus lactis', 'Mleko bifidusowe, produkty probiotyczne', '36-38°C', 'probiotyczne', 'Artiser.pl', 'https://artiser.pl/', NULL, '36,00 zł', 36.00, NULL, NULL),
  ('Danisco CHOOZIT YF-L 811', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. lactis', 'Sery półtwarde włoskie, Scamorza', '38-45°C', 'termofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '52,00 zł', 52.00, NULL, NULL),
  ('Choozit NEMO', 'Lactobacillus casei, Lactobacillus paracasei', 'Sery dojrzewające, przedłużenie trwałości', '15-30°C', 'ochronne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '62,00 zł', 62.00, NULL, NULL),
  ('Sigma - Lactic', 'Leuconostoc mesenteroides, Leuconostoc cremoris', 'Aromat, sery z masłem, sery skandynawskie', '20-25°C', 'aromatyzujące', 'Lactic.pl', 'https://lactic.pl/', NULL, '20,00 zł', 20.00, NULL, NULL),
  ('Tau - Lactic', 'Lactobacillus casei, Lactobacillus paracasei', 'Sery długodojrzewające, Comté', '15-25°C', 'aromatyzujące', 'Lactic.pl', 'https://lactic.pl/', NULL, '25,00 zł', 25.00, NULL, NULL)
;

INSERT INTO public.price_history (culture_id, price_label, price_numeric, source, recorded_at)
SELECT id, price_label, price_numeric, 'migration', created_at
FROM public.cultures
WHERE price_label IS NOT NULL;