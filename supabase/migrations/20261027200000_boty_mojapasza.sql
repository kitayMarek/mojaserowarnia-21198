-- =====================================================================
-- Licznik botów dla mojapasza.com (27.10.2026)
-- =====================================================================
-- Do dziś Worker mojapasza.com rozpoznawał boty tylko po to, żeby dać im
-- mirror, a nie zapisywał ich nigdzie. Marek: „boty powinny być od początku
-- działania domeny”, żeby było widać, jak ruch się zmieniał po przełączeniu
-- 28.10.2026 i po kolejnych zmianach.
--
-- OSOBNA TABELA, a nie kolumna serwis w bot_visits (jak w wejscia_ludzi).
-- Na bot_visits stoi kilkanaście widoków i ok. 25 funkcji: publiczna strona
-- /boty-ai, raporty, kontrakt dla aplikacji analitycznej. Wszystkie liczą
-- ruch Serowarni. Kolumna wymagałaby filtra w każdym z nich, a jeden
-- przeoczony wpuściłby boty paszowe do publikowanych liczb Serowarni.
-- Bliźniak ma te same kolumny, ograniczenia, indeksy i oznaczanie przy
-- zapisie, więc każde zapytanie z bot_visits działa po podmianie nazwy tabeli.
--
-- ⚠ Nowa kolumna w bot_visits musi trafić też tutaj: worker/wizyty-botow.js
-- (zapiszWizyteBota) wysyła do obu tabel ten sam wiersz, a PostgREST odrzuci
-- zapis z kolumną, której tabela nie zna.
--
-- sciezka_typ liczy ta sama public.typ_sciezki co dla Serowarni: „/” i
-- /poradnik* wychodzą jako 'tresc', /bydlo i /asystenci-ai jako 'inne'.
--
-- URUCHOMIĆ w Supabase SQL editor. Idempotentne.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.bot_visits_pasze (LIKE public.bot_visits INCLUDING ALL);

COMMENT ON TABLE public.bot_visits_pasze IS
  'Wizyty botów na mojapasza.com (od 27.10.2026). Bliźniak bot_visits (Serowarnia): te same kolumny, weryfikacja i oznaczanie, osobno, żeby nie mieszać ruchu dwóch serwisów.';

-- RLS i uprawnienia jak w bot_visits: zapisuje tylko worker (service_role),
-- czyta tylko admin, rola anon nie ma dostępu wcale.
ALTER TABLE public.bot_visits_pasze ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view bot visits" ON public.bot_visits_pasze;
CREATE POLICY "Only admins can view bot visits"
ON public.bot_visits_pasze
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.bot_visits_pasze FROM anon;

-- Kategoria, typ ścieżki i ruch własny (test-marek): ta sama funkcja co w bot_visits.
DROP TRIGGER IF EXISTS oznacz_wizyte_bota_trg ON public.bot_visits_pasze;
CREATE TRIGGER oznacz_wizyte_bota_trg
  BEFORE INSERT ON public.bot_visits_pasze
  FOR EACH ROW EXECUTE FUNCTION public.oznacz_wizyte_bota();

-- Retencja 12 miesięcy, sprzątanie okazjonalne przy zapisie (wzór z bot_visits).
CREATE OR REPLACE FUNCTION public.cleanup_bot_visits_pasze()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.bot_visits_pasze
  WHERE odwiedzono < now() - INTERVAL '12 months';
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_cleanup_bot_visits_pasze()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF random() < 0.005 THEN
    PERFORM public.cleanup_bot_visits_pasze();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cleanup_bot_visits_pasze_on_insert ON public.bot_visits_pasze;
CREATE TRIGGER cleanup_bot_visits_pasze_on_insert
  AFTER INSERT ON public.bot_visits_pasze
  FOR EACH ROW EXECUTE FUNCTION public.trigger_cleanup_bot_visits_pasze();

REVOKE ALL ON FUNCTION public.cleanup_bot_visits_pasze()         FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trigger_cleanup_bot_visits_pasze() FROM PUBLIC, anon, authenticated;
