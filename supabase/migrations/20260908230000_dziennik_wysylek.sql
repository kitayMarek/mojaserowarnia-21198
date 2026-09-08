-- Dziennik wysylek: co, do kogo i kiedy poszlo.
--
-- ---------------------------------------------------------------------------
-- PO CO
-- ---------------------------------------------------------------------------
-- Trzy powody, kazdy wystarczajacy sam:
--
--  1. ZEBY NIKT NIE DOSTAL TEGO SAMEGO DWA RAZY. Wysylka moze sie przerwac
--     w polowie — padnie polaczenie, skonczy sie limit dostawcy, zamknie sie
--     konsola. Bez dziennika ponowienie znaczy "wyslij wszystko od nowa",
--     a druga kopia tej samej wiadomosci to najprostsza droga do zgloszenia
--     jako spam.
--
--  2. ZEBY DalO SIE ODPOWIEDZIEC NA PYTANIE "czy ja to dostalem". Ktos zapyta,
--     i albo mamy wiersz z data, albo mamy domysly.
--
--  3. ZEBY WIDAC BYLO, CO SIE NIE UDALO. Adres odbity przez serwer odbiorcy
--     ma zostawic slad, a nie zniknac w konsoli.
--
-- NIE zapisujemy tresci wiadomosci — ona stoi w news_banners i tam jest jej
-- miejsce. Tu jest tylko odnosnik do niej.

CREATE TABLE IF NOT EXISTS public.wysylki (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  wiadomosc_id UUID        NOT NULL REFERENCES public.news_banners(id) ON DELETE CASCADE,
  profil_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  wyslano      TIMESTAMPTZ NOT NULL DEFAULT now(),
  status       TEXT        NOT NULL DEFAULT 'wyslane',   -- 'wyslane' | 'blad'
  szczegoly    TEXT,                                     -- komunikat, gdy blad
  UNIQUE (wiadomosc_id, profil_id)
);

COMMENT ON TABLE public.wysylki IS
  'Kto dostal ktora wiadomosc i kiedy. Klucz (wiadomosc_id, profil_id) jest UNIKALNY — to on, a nie ostroznosc w kodzie, gwarantuje, ze ponowienie przerwanej wysylki nie wysle niczego drugi raz.';

ALTER TABLE public.wysylki ENABLE ROW LEVEL SECURITY;
-- Bez polityk: dostep wylacznie przez role serwisowa. To jest dziennik, kto
-- dostal poczte — nie ma powodu, zeby ktokolwiek inny go czytal.

-- ---------------------------------------------------------------------------
-- KOMU JESZCZE NIE WYSLANO
-- ---------------------------------------------------------------------------
-- Rozszerzenie lista_do_wysylki() o odsiew tych, ktorzy juz dostali. Zwraca
-- takze identyfikator profilu, bo bez niego nie da sie zapisac w dzienniku.

CREATE OR REPLACE FUNCTION public.lista_do_wysylki_dla(_wiadomosc UUID)
RETURNS TABLE (profil_id UUID, email TEXT, wypis_token UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT p.id, u.email::TEXT, p.wypis_token
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.marketing_consent
    AND p.marketing_consent_withdrawn_at IS NULL
    AND u.email IS NOT NULL
    AND u.email_confirmed_at IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.wysylki w
      WHERE w.wiadomosc_id = _wiadomosc
        AND w.profil_id = p.id
        AND w.status = 'wyslane'
    );
$$;

COMMENT ON FUNCTION public.lista_do_wysylki_dla(UUID) IS
  'Adresy, na ktore tej konkretnej wiadomosci jeszcze NIE wyslano. Zgoda aktywna, niewycofana, adres potwierdzony. Nie nadawac uprawnien anon ani authenticated.';

REVOKE ALL ON FUNCTION public.lista_do_wysylki_dla(UUID) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE PO ZASTOSOWANIU
-- ---------------------------------------------------------------------------
--   select count(*) from public.lista_do_wysylki_dla(
--     (select id from public.news_banners where date = date '2026-09-08' limit 1));
