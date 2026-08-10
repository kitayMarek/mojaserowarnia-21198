-- =====================================================================
-- WIZYTÓWKI: zdjęcia + aktualności
--
-- ⚠️ NAZEWNICTWO: zlecenie mówi o tabeli "wizytowki", ale w kodzie tabela
-- nazywa się "serowarnie" (trasa /serowarnie/:slug). Trzymamy nazwy z kodu.
-- Tabela wpisów: serowarnia_wpisy (nie wizytowka_wpisy).
--
-- ⚠️ EXIF/GPS: zdjęcia z telefonu niosą współrzędne GPS gospodarstwa, które
-- często jest też miejscem zamieszkania. Czyszczenie odbywa się PO STRONIE
-- KLIENTA (src/lib/image.ts, przerysowanie na canvas). Baza tego nie zrobi —
-- dlatego upload MUSI iść przez tę funkcję.
--
-- URUCHOMIĆ w Supabase SQL editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Storage
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('wizytowki', 'wizytowki', true, 3145728,
        ARRAY['image/jpeg','image/webp','image/png'])
ON CONFLICT (id) DO NOTHING;

-- Ścieżka pliku: {user_id}/{typ}-{timestamp}.jpg
DROP POLICY IF EXISTS "Publiczny odczyt zdjec wizytowek" ON storage.objects;
CREATE POLICY "Publiczny odczyt zdjec wizytowek"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wizytowki');

DROP POLICY IF EXISTS "Upload tylko do wlasnego katalogu" ON storage.objects;
CREATE POLICY "Upload tylko do wlasnego katalogu"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'wizytowki'
              AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Usuwanie tylko wlasnych plikow" ON storage.objects;
CREATE POLICY "Usuwanie tylko wlasnych plikow"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'wizytowki'
         AND (storage.foldername(name))[1] = auth.uid()::text);

-- Podmiana istniejącego pliku o tej samej nazwie (upsert)
DROP POLICY IF EXISTS "Nadpisywanie tylko wlasnych plikow" ON storage.objects;
CREATE POLICY "Nadpisywanie tylko wlasnych plikow"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'wizytowki'
         AND (storage.foldername(name))[1] = auth.uid()::text);


-- ---------------------------------------------------------------------
-- 2. Zdjęcia wizytówki
-- ---------------------------------------------------------------------
ALTER TABLE public.serowarnie
  ADD COLUMN IF NOT EXISTS zdjecie_glowne TEXT,
  ADD COLUMN IF NOT EXISTS galeria JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Galeria: [{url, opis}] — max 6. Kolejność w tablicy = kolejność wyświetlania.
ALTER TABLE public.serowarnie
  DROP CONSTRAINT IF EXISTS serowarnie_galeria_max6;
ALTER TABLE public.serowarnie
  ADD CONSTRAINT serowarnie_galeria_max6
  CHECK (jsonb_array_length(galeria) <= 6);

COMMENT ON COLUMN public.serowarnie.galeria IS
  'Tablica [{url, opis}], max 6. Opis trafia do atrybutu alt.';


-- ---------------------------------------------------------------------
-- 3. Aktualności
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.serowarnia_wpisy (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serowarnia_id UUID NOT NULL REFERENCES public.serowarnie(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tresc         TEXT NOT NULL CHECK (char_length(tresc) BETWEEN 1 AND 600),
  zdjecie_url   TEXT,
  utworzono     TIMESTAMPTZ NOT NULL DEFAULT now(),
  wygasa        DATE,
  opublikowany  BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS serowarnia_wpisy_feed_idx
  ON public.serowarnia_wpisy (serowarnia_id, utworzono DESC);

ALTER TABLE public.serowarnia_wpisy ENABLE ROW LEVEL SECURITY;

-- ⚠️ Wpis jest widoczny publicznie TYLKO wtedy, gdy sama wizytówka jest
-- opublikowana i za zgodą. Bez tego warunku wpisy z wizytówki w moderacji
-- albo po wycofaniu zgody byłyby dostępne — obejście całej ochrony katalogu.
DROP POLICY IF EXISTS "Wpisy widoczne przy opublikowanej wizytowce" ON public.serowarnia_wpisy;
CREATE POLICY "Wpisy widoczne przy opublikowanej wizytowce"
  ON public.serowarnia_wpisy FOR SELECT
  TO anon, authenticated
  USING (
    opublikowany = true
    AND EXISTS (
      SELECT 1 FROM public.serowarnie s
      WHERE s.id = serowarnia_id
        AND s.status = 'opublikowany'
        AND s.zgoda_publikacja = true
    )
  );

DROP POLICY IF EXISTS "Wlasciciel zarzadza swoimi wpisami" ON public.serowarnia_wpisy;
CREATE POLICY "Wlasciciel zarzadza swoimi wpisami"
  ON public.serowarnia_wpisy FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin zarzadza wpisami" ON public.serowarnia_wpisy;
CREATE POLICY "Admin zarzadza wpisami"
  ON public.serowarnia_wpisy FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ---------------------------------------------------------------------
-- 4. Limit wpisów: 10 dziennie na wizytówkę
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.serowarnia_wpisy_limit_dzienny()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  ile INT;
BEGIN
  SELECT count(*) INTO ile
  FROM public.serowarnia_wpisy
  WHERE serowarnia_id = NEW.serowarnia_id
    AND utworzono >= date_trunc('day', now());

  IF ile >= 10 THEN
    RAISE EXCEPTION 'Limit 10 wpisow dziennie zostal wyczerpany. Sprobuj jutro.';
  END IF;

  -- Wpis zawsze przypisany do wlasciciela wizytowki
  IF NOT EXISTS (
    SELECT 1 FROM public.serowarnie s
    WHERE s.id = NEW.serowarnia_id AND s.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Mozna dodawac wpisy tylko do wlasnej wizytowki.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS serowarnia_wpisy_limit ON public.serowarnia_wpisy;
CREATE TRIGGER serowarnia_wpisy_limit
  BEFORE INSERT ON public.serowarnia_wpisy
  FOR EACH ROW EXECUTE FUNCTION public.serowarnia_wpisy_limit_dzienny();
