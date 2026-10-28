-- =====================================================================
-- Widok wizytówek serowarni dla huba Dane Rolne (28.10.2026)
-- =====================================================================
-- Hub (Worker huba, cron raz na dobę, klucz service_role) czyta tylko ten
-- widok: wizytówki opublikowane, ze zgodą na katalog Serowarni i na hub
-- (migracja 20261028200000). Wiersz, który zniknie z widoku (wycofana zgoda,
-- zdjęta wizytówka), hub usuwa przy najbliższym przebiegu, czyli w ciągu
-- 24 godzin, jak obiecuje tekst zgody.
--
-- Tylko pola, które i tak widać na publicznej stronie /serowarnie/<slug>.
-- Bez user_id, numeru weterynaryjnego, oświadczenia i danych moderacji.
--
-- URUCHOMIĆ w Supabase SQL editor (projekt Serowarni). Idempotentne.
-- =====================================================================

CREATE OR REPLACE VIEW public.serowarnie_dla_huba
WITH (security_invoker = true)
AS
SELECT
  s.slug,
  'https://mojaserowarnia.pl/serowarnie/' || s.slug AS url,
  s.nazwa,
  s.opis,
  s.wojewodztwo,
  s.miejscowosc,
  s.telefon,
  s.email_kontakt,
  s.www,
  s.facebook,
  s.produkty,
  s.rodzaj_mleka,
  s.forma_sprzedazy,
  s.typ_dzialalnosci,
  s.zdjecie_glowne,
  s.zgoda_hub_data,
  s.updated_at
FROM public.serowarnie s
WHERE s.status = 'opublikowany'
  AND s.zgoda_publikacja
  AND s.zgoda_hub;

COMMENT ON VIEW public.serowarnie_dla_huba IS
  'Wizytówki serowarni do kopii w hubie danerolne.com: tylko opublikowane z obiema zgodami, tylko pola publiczne. Czyta Worker huba (service_role).';

REVOKE ALL ON public.serowarnie_dla_huba FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.serowarnie_dla_huba TO service_role;
