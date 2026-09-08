-- Poprawka tresci wiadomosci o cenach kultur.
--
-- Pierwsza wersja poszla na strone glowna i do kanalu RSS BEZ POLSKICH ZNAKOW
-- ("piec zmian", "ktorego juz nie ma"). Powod byl techniczny i zaden: pisalem
-- ten SQL w czystym ASCII, zeby ominac klopot z kodowaniem w powloce, i nie
-- pomyslalem, ze to jest tresc dla czytelnika, a nie komentarz w kodzie.
--
-- Do wklejenia w Supabase -> SQL Editor.

UPDATE public.news_banners
SET title = 'Ceny kultur sprawdzone: pięć zmian i jeden produkt, którego już nie ma',
    subtitle = 'Sprawdziliśmy 8 września wszystkie 188 pozycji w bazie kultur, w pięciu sklepach. W Lactic.pl podrożało pięć kultur: DELTA 2 i IOTA 4 z 18,00 na 19,00 zł, a IOTA KEFIR 2, IOTA KEFIR 3 i IOTA PROBI 1 z 17,00 na 19,00 zł. Wygląda to na wyrównanie części oferty do jednej stawki, a nie na podwyżkę rynkową — w pozostałych czterech sklepach nie zmieniło się nic od 22 sierpnia. Osobna sprawa to GAMMA 3, kultura ochronna z Lactic.pl: strona produktu nadal się otwiera i odpowiada normalnie, ale jest pusta — bez nazwy, bez opisu i bez ceny. Produkt zniknął, a odnośnik działa, więc żaden automat sprawdzający sam kod odpowiedzi by tego nie zauważył. Zamiast starej ceny 39,00 zł wpisaliśmy przy niej „Niedostępna”, bo cena sprzed zniknięcia wyglądałaby na aktualną. Wszystkie 188 pozycji ma teraz datę sprawdzenia 8 września 2026 — ceny w sklepach zmieniają się bez zapowiedzi, więc podajemy je zawsze z datą.'
WHERE date = DATE '2026-09-08'
  AND title LIKE 'Ceny kultur%';

-- ---------------------------------------------------------------------------
-- SPRAWDZENIE
-- ---------------------------------------------------------------------------
--   select title from public.news_banners where date = date '2026-09-08';
