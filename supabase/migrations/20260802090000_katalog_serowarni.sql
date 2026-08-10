-- =====================================================================
-- KATALOG SEROWARNI ZAGRODOWYCH
--
-- Darmowa wizytówka dla producenta + unikalna treść dla serwisu.
--
-- ⚠️ RODO: publikacja danych producenta (nazwa, miejscowość, telefon,
-- e-mail) to przetwarzanie danych osobowych. Wymaga OSOBNEJ, wyraźnej
-- zgody — innej niż marketingowa w profiles. Zgoda jest odznaczalna,
-- zapisywana z datą i odwracalna: jej wycofanie zdejmuje wizytówkę.
--
-- ⚠️ MODERACJA: wpis publikuje się dopiero po akceptacji admina.
-- Domyślny status to 'szkic'; użytkownik zgłasza do 'oczekuje'.
--
-- URUCHOMIĆ w Supabase SQL editor.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.serowarnie (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Adres wizytówki. KONTRAKT: raz opublikowany slug jest zamrożony
  -- (zmiana zaindeksowanego URL = utrata pozycji w wyszukiwarkach).
  slug            TEXT NOT NULL UNIQUE,

  nazwa           TEXT NOT NULL,
  opis            TEXT,

  -- Lokalizacja — bez dokładnego adresu; miejscowość wystarcza,
  -- a mniej danych osobowych to mniejsze ryzyko.
  wojewodztwo     TEXT CHECK (wojewodztwo IN (
                    'dolnośląskie','kujawsko-pomorskie','lubelskie','lubuskie',
                    'łódzkie','małopolskie','mazowieckie','opolskie',
                    'podkarpackie','podlaskie','pomorskie','śląskie',
                    'świętokrzyskie','warmińsko-mazurskie','wielkopolskie',
                    'zachodniopomorskie')),
  miejscowosc     TEXT,

  -- Kontakt — wyłącznie to, co producent sam poda
  telefon         TEXT,
  email_kontakt   TEXT,
  www             TEXT,
  facebook        TEXT,

  -- Oferta
  produkty        TEXT[] NOT NULL DEFAULT '{}',
  rodzaj_mleka    TEXT[] NOT NULL DEFAULT '{}',
  forma_sprzedazy TEXT[] NOT NULL DEFAULT '{}',

  -- Moderacja
  status          TEXT NOT NULL DEFAULT 'szkic'
                    CHECK (status IN ('szkic','oczekuje','opublikowany','odrzucony')),
  powod_odrzucenia TEXT,

  -- Zgoda RODO na publikację (odrębna od marketingowej!)
  zgoda_publikacja BOOLEAN NOT NULL DEFAULT false,
  zgoda_data       TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_serowarnie_status ON public.serowarnie(status);
CREATE INDEX IF NOT EXISTS idx_serowarnie_woj    ON public.serowarnie(wojewodztwo);

-- Znacznik czasu aktualizacji
DROP TRIGGER IF EXISTS set_serowarnie_updated_at ON public.serowarnie;
CREATE TRIGGER set_serowarnie_updated_at
  BEFORE UPDATE ON public.serowarnie
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Zgoda zawsze z datą; jej wycofanie zdejmuje wizytówkę z publikacji.
CREATE OR REPLACE FUNCTION public.serowarnie_pilnuj_zgody()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.zgoda_publikacja AND (OLD IS NULL OR NOT OLD.zgoda_publikacja) THEN
    NEW.zgoda_data := now();
  END IF;

  IF NOT NEW.zgoda_publikacja THEN
    NEW.zgoda_data := NULL;
    IF NEW.status = 'opublikowany' THEN
      NEW.status := 'szkic';   -- brak zgody = natychmiast znika z katalogu
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS serowarnie_zgoda ON public.serowarnie;
CREATE TRIGGER serowarnie_zgoda
  BEFORE INSERT OR UPDATE ON public.serowarnie
  FOR EACH ROW EXECUTE FUNCTION public.serowarnie_pilnuj_zgody();


-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
ALTER TABLE public.serowarnie ENABLE ROW LEVEL SECURITY;

-- Publicznie widoczne WYŁĄCZNIE wpisy zatwierdzone i za zgodą
CREATE POLICY "Katalog publiczny — tylko opublikowane za zgoda"
ON public.serowarnie FOR SELECT
TO anon, authenticated
USING (status = 'opublikowany' AND zgoda_publikacja = true);

-- Właściciel widzi i edytuje swój wpis niezależnie od statusu
CREATE POLICY "Wlasciciel widzi swoj wpis"
ON public.serowarnie FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Wlasciciel tworzy swoj wpis"
ON public.serowarnie FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Wlasciciel edytuje swoj wpis"
ON public.serowarnie FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Wlasciciel usuwa swoj wpis"
ON public.serowarnie FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admin — pełny dostęp (moderacja)
CREATE POLICY "Admin zarzadza katalogiem"
ON public.serowarnie FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ---------------------------------------------------------------------
-- ⚠️ ESKALACJA UPRAWNIEŃ — blokada samodzielnej publikacji
-- ---------------------------------------------------------------------
-- Bez tego użytkownik ustawiłby sobie status='opublikowany' zwykłym
-- UPDATE i ominął moderację. Polityka RLS tego nie złapie, bo dotyczy
-- wiersza jako całości, nie pojedynczej kolumny.
CREATE OR REPLACE FUNCTION public.serowarnie_blokuj_samopublikacje()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;   -- admin moderuje bez ograniczeń
  END IF;

  -- Użytkownik może co najwyżej zgłosić wpis do sprawdzenia
  IF NEW.status NOT IN ('szkic','oczekuje') THEN
    RAISE EXCEPTION 'Publikacja wymaga akceptacji moderatora.';
  END IF;

  -- Nie wolno cofnąć decyzji moderatora ani podmienić powodu odrzucenia
  IF TG_OP = 'UPDATE' AND OLD.status = 'odrzucony' AND NEW.status = 'oczekuje' THEN
    NEW.powod_odrzucenia := OLD.powod_odrzucenia;  -- zostaje historia
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS serowarnie_bez_samopublikacji ON public.serowarnie;
CREATE TRIGGER serowarnie_bez_samopublikacji
  BEFORE INSERT OR UPDATE ON public.serowarnie
  FOR EACH ROW EXECUTE FUNCTION public.serowarnie_blokuj_samopublikacje();


-- ---------------------------------------------------------------------
-- Generowanie unikalnego sluga (kontrakt URL)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.serowarnie_slug(nazwa_in TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bazowy TEXT;
  kandydat TEXT;
  n INT := 1;
BEGIN
  bazowy := lower(nazwa_in);
  bazowy := translate(bazowy,
              'ąćęłńóśźżĄĆĘŁŃÓŚŹŻ',
              'acelnoszzacelnoszz');
  bazowy := regexp_replace(bazowy, '[^a-z0-9]+', '-', 'g');
  bazowy := trim(both '-' from bazowy);
  bazowy := left(nullif(bazowy, ''), 60);

  IF bazowy IS NULL THEN
    bazowy := 'serowarnia';
  END IF;

  kandydat := bazowy;
  WHILE EXISTS (SELECT 1 FROM public.serowarnie WHERE slug = kandydat) LOOP
    n := n + 1;
    kandydat := bazowy || '-' || n;
  END LOOP;

  RETURN kandydat;
END;
$$;

GRANT EXECUTE ON FUNCTION public.serowarnie_slug(TEXT) TO authenticated;

COMMENT ON TABLE public.serowarnie IS
  'Katalog serowarni zagrodowych. Publikacja tylko po akceptacji moderatora i za wyrazna zgoda RODO producenta.';
