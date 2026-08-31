-- ============================================================================
-- cultures — sześć kolumn dodawanych wcześniej ręcznie, poza migracjami
--
-- DLACZEGO: te kolumny powstawały stopniowo przy pracy nad bazą kultur i były
-- dodawane skryptami z scripts/sql/ wklejanymi w SQL Editor. Nigdy nie trafiły
-- do migracji, więc czysty projekt ich nie ma — a import 325 kultur odbił się
-- od pierwszej z brzegu ("Could not find the 'dose_label' column"). Wraz z nim
-- posypały się price_history i user_culture_list_items, bo mają klucze obce do
-- cultures.
--
-- Typy przepisane 1:1 ze skryptów źródłowych:
--   price_previous  scripts/sql/cultures-ceny.sql
--   image_url       scripts/sql/cultures-images.sql
--   pack_liters     scripts/sql/cultures-pojemnosc.sql
--   dose_label      scripts/sql/cultures-pojemnosc.sql
--   manufacturer    scripts/sql/cultures-producent.sql
--   strain_ratio    scripts/sql/cultures-producent.sql
-- ============================================================================

ALTER TABLE public.cultures ADD COLUMN IF NOT EXISTS price_previous numeric;
ALTER TABLE public.cultures ADD COLUMN IF NOT EXISTS image_url      text;
ALTER TABLE public.cultures ADD COLUMN IF NOT EXISTS pack_liters    integer;
ALTER TABLE public.cultures ADD COLUMN IF NOT EXISTS dose_label     text;
ALTER TABLE public.cultures ADD COLUMN IF NOT EXISTS manufacturer   text;
ALTER TABLE public.cultures ADD COLUMN IF NOT EXISTS strain_ratio   text;

COMMENT ON COLUMN public.cultures.price_previous IS 'Poprzednia cena — pozwala pokazać, w którą stronę się zmieniła.';
COMMENT ON COLUMN public.cultures.pack_liters    IS 'Na ile litrów mleka starcza opakowanie; podstawa ceny za litr.';
COMMENT ON COLUMN public.cultures.dose_label     IS 'Dawkowanie tak, jak podaje je sklep (tekstem, bo formaty są różne).';
COMMENT ON COLUMN public.cultures.manufacturer   IS 'Producent deklarowany w danych strukturalnych strony produktu.';
COMMENT ON COLUMN public.cultures.strain_ratio   IS 'Proporcje szczepów, jeśli sklep je podaje (rzadkie, ale rozstrzygające).';
