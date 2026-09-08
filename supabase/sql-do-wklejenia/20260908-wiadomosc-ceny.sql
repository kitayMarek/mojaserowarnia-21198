-- Wiadomosc o odswiezeniu bazy kultur, 8 wrzesnia 2026.
-- Do wklejenia PO migracji 20260908210000_wiadomosc_bez_linku.sql
-- (bez niej link_url jest wymagany i wstawienie sie nie uda).
--
-- link_url = NULL celowo: wiadomosc ma cala tresc u siebie i nigdzie nie
-- prowadzi. To pierwsza taka na tej stronie.

INSERT INTO public.news_banners (title, subtitle, link_url, date, type, is_published, display_order)
VALUES (
  'Ceny kultur sprawdzone: piec zmian i jeden produkt, ktorego juz nie ma',
  'Sprawdzilismy 8 wrzesnia wszystkie 188 pozycji w bazie kultur, w pieciu sklepach. W Lactic.pl podrozalo piec kultur: DELTA 2 i IOTA 4 z 18,00 na 19,00 zl, a IOTA KEFIR 2, IOTA KEFIR 3 i IOTA PROBI 1 z 17,00 na 19,00 zl. Wyglada to na wyrownanie czesci oferty do jednej stawki, nie na podwyzke rynkowa - w pozostalych czterech sklepach nie zmienilo sie nic od 22 sierpnia. Osobna sprawa to GAMMA 3, kultura ochronna z Lactic.pl: strona produktu nadal sie otwiera i odpowiada normalnie, ale jest pusta - bez nazwy, bez opisu i bez ceny. Produkt zniknal, a link dziala, wiec zaden automat sprawdzajacy sam kod odpowiedzi by tego nie zauwazyl. Zamiast starej ceny 39,00 zl wpisalismy przy niej "Niedostepna", bo cena sprzed znikniecia wygladalaby na aktualna. Wszystkie 188 pozycji ma teraz date sprawdzenia 8 wrzesnia 2026.',
  NULL,
  DATE '2026-09-08',
  'featured',
  true,
  1
);

-- ---------------------------------------------------------------------------
-- PRZY OKAZJI: usuniecie wiersza testowego licznika przyjsc
-- ---------------------------------------------------------------------------
DELETE FROM public.przyjscia_z_odpowiedzi WHERE sciezka = '/proba/test-przyjscia';

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE
-- ---------------------------------------------------------------------------
--   select title, link_url, date, is_published from public.news_banners
--   order by date desc limit 3;
