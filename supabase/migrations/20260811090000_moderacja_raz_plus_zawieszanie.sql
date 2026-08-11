-- =====================================================================
-- MODERACJA RAZ, POTEM ZAWIESZANIE
--
-- Uwagi Marka:
--   1. Kazda zmiana w wizytowce wracala do moderacji - nie do utrzymania.
--      Producent poprawiajacy literowke czekal na akceptacje.
--   2. Panel moderacji nie pokazywal zdjec, wiec nie bylo wiadomo,
--      co sie wlasciwie akceptuje.
--
-- Nowy model:
--   - PIERWSZA publikacja przechodzi przez moderacje (jak dotad)
--   - po akceptacji wlasciciel edytuje swobodnie, zmiany ida od razu
--   - admin moze ZAWIESIC wizytowke z podaniem powodu; wlasciciel widzi
--     powod i po poprawieniu zglasza ponownie
--
-- URUCHOMIC w Supabase SQL editor.
-- =====================================================================

-- Nowy status
ALTER TABLE public.serowarnie DROP CONSTRAINT IF EXISTS serowarnie_status_check;
ALTER TABLE public.serowarnie
  ADD CONSTRAINT serowarnie_status_check
  CHECK (status IN ('szkic','oczekuje','opublikowany','odrzucony','zawieszony'));

COMMENT ON COLUMN public.serowarnie.powod_odrzucenia IS
  'Powod odrzucenia LUB zawieszenia. Widoczny dla wlasciciela w jego panelu.';


-- ---------------------------------------------------------------------
-- Blokada samopublikacji — wersja z pamiecia o wczesniejszej akceptacji
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.serowarnie_blokuj_samopublikacje()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;   -- admin moderuje bez ograniczen
  END IF;

  -- INSERT: nowa wizytowka zawsze zaczyna od szkicu albo kolejki
  IF TG_OP = 'INSERT' THEN
    IF NEW.status NOT IN ('szkic','oczekuje') THEN
      RAISE EXCEPTION 'Publikacja wymaga akceptacji moderatora.';
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE: wizytowka RAZ zaakceptowana pozostaje opublikowana,
  -- a wlasciciel edytuje ja swobodnie. To jest sedno zmiany.
  IF OLD.status = 'opublikowany' AND NEW.status = 'opublikowany' THEN
    RETURN NEW;
  END IF;

  -- Zawieszona: wlasciciel moze poprawic i zglosic ponownie, ale nie
  -- moze sam sie odwiesic.
  IF OLD.status IN ('zawieszony','odrzucony') AND NEW.status = 'opublikowany' THEN
    RAISE EXCEPTION 'Wizytowka wymaga ponownej akceptacji moderatora.';
  END IF;

  IF NEW.status NOT IN ('szkic','oczekuje') THEN
    RAISE EXCEPTION 'Publikacja wymaga akceptacji moderatora.';
  END IF;

  -- Powod zawieszenia/odrzucenia zostaje - wlasciciel go nie kasuje
  IF OLD.powod_odrzucenia IS NOT NULL AND NEW.status = 'oczekuje' THEN
    NEW.powod_odrzucenia := OLD.powod_odrzucenia;
  END IF;

  RETURN NEW;
END;
$$;


-- ---------------------------------------------------------------------
-- Kolejka moderacji — teraz ze zdjeciami
-- ---------------------------------------------------------------------
-- ⚠️ DROP przed CREATE: dokladamy kolumny do RETURNS TABLE, a CREATE OR
-- REPLACE nie potrafi zmienic typu zwracanego. DROP kasuje uprawnienia,
-- wiec GRANT nizej nadaje je ponownie.
DROP FUNCTION IF EXISTS public.serowarnie_do_moderacji();

CREATE FUNCTION public.serowarnie_do_moderacji()
RETURNS TABLE (
  id UUID, slug TEXT, nazwa TEXT, opis TEXT,
  wojewodztwo TEXT, miejscowosc TEXT,
  produkty TEXT[], rodzaj_mleka TEXT[], forma_sprzedazy TEXT[],
  telefon TEXT, email_kontakt TEXT, www TEXT, facebook TEXT,
  nr_weterynaryjny TEXT, status TEXT,
  typ_dzialalnosci TEXT,
  zdjecie_glowne TEXT,
  galeria JSONB,
  powod_odrzucenia TEXT,
  email_konta TEXT,
  ma_ewidencje BOOLEAN,
  zarejestrowany TIMESTAMPTZ,
  zgloszony TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT
    s.id, s.slug, s.nazwa, s.opis,
    s.wojewodztwo, s.miejscowosc,
    s.produkty, s.rodzaj_mleka, s.forma_sprzedazy,
    s.telefon, s.email_kontakt, s.www, s.facebook,
    s.nr_weterynaryjny, s.status,
    s.typ_dzialalnosci,
    s.zdjecie_glowne,
    s.galeria,
    s.powod_odrzucenia,
    p.email,
    EXISTS (SELECT 1 FROM public.sales_records sr WHERE sr.user_id = s.user_id),
    p.created_at,
    s.updated_at
  FROM public.serowarnie s
  LEFT JOIN public.profiles p ON p.id = s.user_id
  ORDER BY
    CASE s.status
      WHEN 'oczekuje' THEN 0
      WHEN 'zawieszony' THEN 1
      WHEN 'opublikowany' THEN 2
      ELSE 3
    END,
    s.updated_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.serowarnie_do_moderacji() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.serowarnie_do_moderacji() TO authenticated;
