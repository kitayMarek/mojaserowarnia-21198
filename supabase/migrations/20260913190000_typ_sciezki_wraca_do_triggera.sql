-- Typ sciezki wraca do triggera. Naprawa po migracji 20260910200000_wlasne_bez_asn.
--
-- CO SIE STALO
-- Migracja z 10 wrzesnia miala zmienic jedna regule: ruch wlasny po znaczniku
-- w User-Agencie zamiast po calym ASN Orange. Przepisala jednak cala funkcje
-- oznacz_wizyte_bota() i za wzor wziela jej wersje z 5 wrzesnia, a nie
-- ostatnia, z 6 wrzesnia. Wypadla przy tym linia:
--
--   NEW.sciezka_typ := public.typ_sciezki(NEW.sciezka);
--
-- Od zastosowania tamtej migracji (10.09.2026 miedzy 18:52 a 19:07 UTC) kazda
-- nowa wizyta ma sciezka_typ = NULL. Zapis przechodzil, bo kolumna dopuszcza
-- NULL, wiec nic nie zglosilo bledu. Przez trzy dni:
--
--   * "Co czytali", "Po co przychodza", "Czego szukali, a nie znalezli"
--     i "Czego szukaly skanery" konczyly sie na 10 wrzesnia, bo filtruja
--     po typie sciezki,
--   * "Ruch bez podpisu" sklejal wszystko w jeden wiersz bez typu,
--   * zrodla_botow() nie widziala pytan o pliki z sekretami ani wejsc na
--     kanarka, wiec codzienny alert o skanach stracil najmocniejszy sygnal,
--     a raport Incydenty pokazywal 0 prob wrazliwych.
--
-- Zbieranie danych dzialalo caly czas. Wiersze sa kompletne poza tym jednym
-- polem, a to pole liczy sie z zapisanej sciezki, wiec da sie je odtworzyc
-- wstecz bez zgadywania.
--
-- Przy okazji wypadl trzeci znacznik testowy, test-agrojelonki, dopisany
-- celowo 6 wrzesnia.
--
-- CO ROBIMY
-- 1. Regula ruchu wlasnego wraca do JEDNEJ funkcji, ruch_wlasny(). Migracja
--    z 10 wrzesnia wpisala ja wprost w trigger, a ruch_wlasny() zostawila ze
--    stara regula ASN. Dwie kopie tej samej reguly, z ktorych jedna zla,
--    to dokladnie to, przed czym ostrzegal komentarz z 6 wrzesnia. Argument
--    _asn zostaje, zeby nie zmieniac sygnatury, ale na wynik nie wplywa.
-- 2. Trigger znowu ustawia wszystkie trzy pola. Atrybuty (SECURITY DEFINER,
--    search_path) zostaja jak w wersji dzialajacej dzis na produkcji.
-- 3. Wiersze bez typu dostaja go z tej samej funkcji, ktora liczy nowe.
--    Trigger dziala tylko BEFORE INSERT, wiec ten UPDATE nie przelicza
--    niczego poza typem sciezki.
-- 4. Wiersze z okna awarii ze znacznikiem test-agrojelonki wracaja do ruchu
--    wlasnego. Historii sprzed 10 wrzesnia nie ruszamy.

CREATE OR REPLACE FUNCTION public.ruch_wlasny(_asn INTEGER, _ua TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT COALESCE(_ua ILIKE '%test-marek%', false)
      OR COALESCE(_ua ILIKE '%test-agrojelonki%', false)
      OR COALESCE(_ua ILIKE '%Agrojelonki-Test%', false);
$$;

COMMENT ON FUNCTION public.ruch_wlasny(INTEGER, TEXT) IS
  'Czy to nasz wlasny ruch testowy: wylacznie po znaczniku w User-Agencie (test-marek, test-agrojelonki, Agrojelonki-Test). Argument _asn jest ignorowany od 13.09.2026 i zostal tylko dla zgodnosci sygnatury; do 10.09.2026 regula lapala tez caly ASN 5617 (Orange Polska). Znacznik musi stac w czesci komentarzowej UA, po nazwie i wersji bota, bo worker trasuje po prefiksie nazwy.';

CREATE OR REPLACE FUNCTION public.oznacz_wizyte_bota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Trzy pola, kazde z jednej funkcji, z ktorej korzystaja tez backfille.
  NEW.kategoria   := public.kategoria_bota(NEW.bot);
  NEW.sciezka_typ := public.typ_sciezki(NEW.sciezka);
  NEW.wlasne      := public.ruch_wlasny(NEW.asn, NEW.ua);
  RETURN NEW;
END;
$$;

UPDATE public.bot_visits
SET sciezka_typ = public.typ_sciezki(sciezka)
WHERE sciezka_typ IS NULL;

UPDATE public.bot_visits
SET wlasne = true
WHERE NOT wlasne
  AND odwiedzono >= '2026-09-10 18:00:00+00'
  AND ua ILIKE '%test-agrojelonki%';

COMMENT ON COLUMN public.bot_visits.wlasne IS
  'Ruch wlasny, rozpoznany przez ruch_wlasny() po znaczniku w User-Agencie (test-marek, test-agrojelonki, Agrojelonki-Test). Do 10.09.2026 lapal tez caly ASN 5617 (Orange Polska), przez co 1859 zadan spoza naszych testow bylo ukrywanych jako wlasne. Wierszy sprzed tej daty nie da sie rozdzielic wstecz.';

-- Kontrola po zastosowaniu (same odczyty, niczego nie zmieniaja):
--
--   -- ma byc 0
--   select count(*) from public.bot_visits where sciezka_typ is null;
--
--   -- co alert o skanach przegapil przez te trzy dni (bez wysylania maila)
--   select asn, kraj, zadan, wrazliwe, kanarek, punkty, powod
--   from public.zrodla_botow(72) where punkty >= 4;
