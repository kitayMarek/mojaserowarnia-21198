-- Wiadomosc, ktora niczego nie sprzedaje.
--
-- ---------------------------------------------------------------------------
-- SKAD TA ZMIANA
-- ---------------------------------------------------------------------------
-- news_banners.link_url bylo NOT NULL, bo kazda dotychczasowa wiadomosc byla
-- zapowiedzia czegos: przepisu, kalkulatora, strony prawnej. Naglowek mial
-- zachecic do klikniecia, a tresc lezala gdzie indziej.
--
-- Decyzja Marka, 8 wrzesnia 2026: informacja o zmianach w bazie kultur ma
-- pojsc "bez zadnych linkow". To nie jest kaprys typograficzny, tylko wniosek
-- z calego dzisiejszego pomiaru: skoro 82% sesji modeli to jedno pobranie
-- i skoro cytowanie zastepuje wizyte, to tresc, ktora jest tylko haczykiem,
-- nie dociera nigdzie. Wiadomosc ma byc kompletna tam, gdzie ja widac.
--
-- Stad kolumna staje sie opcjonalna. Wiadomosc bez linku to wiadomosc, ktora
-- ma cala tresc u siebie.

ALTER TABLE public.news_banners ALTER COLUMN link_url DROP NOT NULL;

COMMENT ON COLUMN public.news_banners.link_url IS
  'Adres, do ktorego prowadzi wiadomosc. NULL = wiadomosc jest kompletna sama w sobie i nigdzie nie prowadzi; komponenty renderuja ja wtedy bez odsylacza, a kanal RSS pomija element <link>.';
