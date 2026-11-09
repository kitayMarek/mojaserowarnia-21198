-- cultures: SM 02 LYO (GAP Poland) starcza na 5 litrow mleka (9.11.2026)
--
-- Sklep sprzedaje ja w dwoch wariantach: "5l" za 6,00 zl i "1000 l" za 55,56 zl
-- (sprawdzone na stronie produktu 9.11.2026). Cena w bazie, 6,00 zl, to wariant
-- 5 l, czyli jedna doza ("1 doza na 5 litrow mleka"). Bez pack_liters kultura
-- nie miala ceny za litr i lacznik nie umial jej porownac z Choozit MA 4001.
--
-- Warunek pack_liters is null sprawia, ze drugie uruchomienie nic nie zmieni.

update public.cultures
set pack_liters = 5,
    updated_at = now()
where product_url = 'https://sklep.gappoland.com/pl/p/SM-02-LYO/22902158'
  and name = 'SM 02 LYO'
  and price_numeric = 6
  and pack_liters is null;

-- Oczekiwany wynik: UPDATE 1
