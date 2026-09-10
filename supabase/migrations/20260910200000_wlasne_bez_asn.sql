-- Ruch wlasny rozpoznawany po ZNACZNIKU, nie po sieci.
--
-- CO BYLO ZLE
-- Regula z 5 wrzesnia oznaczala jako ruch wlasny wszystko z ASN 5617.
-- To jest Orange Polska, czyli kilkanascie milionow abonentow, a nie my.
-- Skutek zmierzony 10 wrzesnia:
--
--   nasz znacznik w UA                19 zadan   (5-8 wrzesnia)
--   zlapane wylacznie po ASN Orange   1859 zadan (3-10 wrzesnia)
--
-- W tym drugim kubelku siedzi miedzy innymi 1688 zadan podpisanych GPTBot,
-- na 219 roznych stronach, z zerowym udzialem bledow. To jest zachowanie
-- crawlera przechodzacego caly serwis, a nie testu — test wraca kilka razy
-- na te sama strone. Prawdziwy GPTBot nie chodzi z lacza Orange, wiec albo
-- ktos w Polsce chodzi po nas z jego podpisem, albo cos na naszej sieci.
-- Tak czy inaczej: przez tydzien ukrywalismy to jako "wlasne".
--
-- Marek oszacowal wlasne wejscia na najwyzej 200. Roznica jest za duza,
-- zeby ja tlumaczyc nieprecyzyjnym liczeniem.
--
-- CO ROBIMY
-- ASN wypada z reguly. Zostaje znacznik w User-Agencie, ktory moze wstawic
-- tylko ktos, kto go zna. Kazde nasze zadanie testowe ma go od teraz nosic.
--
-- HISTORII NIE RUSZAMY. W tamtych wierszach nie ma nic, co odroznialoby nas
-- od reszty Orange, wiec przepisanie ich w dowolna strone byloby zgadywaniem.
-- Zostaja jak sa, a strona ma o tym powiedziec wprost.

CREATE OR REPLACE FUNCTION public.oznacz_wizyte_bota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.kategoria := public.kategoria_bota(NEW.bot);

  -- Wylacznie znacznik. Bez ASN — patrz naglowek tej migracji.
  NEW.wlasne := COALESCE(NEW.ua ILIKE '%test-marek%', false)
             OR COALESCE(NEW.ua ILIKE '%Agrojelonki-Test%', false);

  RETURN NEW;
END;
$$;

COMMENT ON COLUMN public.bot_visits.wlasne IS
  'Ruch wlasny, rozpoznany po znaczniku test-marek lub Agrojelonki-Test w User-Agencie. Do 10.09.2026 lapal tez caly ASN 5617 (Orange Polska), przez co 1859 zadan spoza naszych testow bylo ukrywanych jako wlasne. Wierszy sprzed tej daty nie da sie rozdzielic wstecz.';
