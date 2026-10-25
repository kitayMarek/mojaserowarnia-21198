-- ==========================================================================
-- Koniec starej drogi zgloszen: insert do feed_ingredients (25.10.2026)
--
-- Od 25.10.2026 zgloszenia ida do public.feed_submissions (migracja
-- 20261025140000), a produkt do bazy wpisujemy sami w src/data/dodatkiPaszowe.ts.
-- Stara polityka pozwalala kazdemu zalogowanemu wstawic do feed_ingredients
-- wiersz 'pending' z wlasnymi liczbami. Po zamknieciu wstawia tam tylko admin
-- (polityka feed_admin_full_access) i seed.
--
-- ⚠️ URUCHOMIC DOPIERO PO WDROZENIU strony z nowym formularzem. Wczesniej
-- stary formularz na zywej stronie konczylby sie bledem.
--
-- Zostaje: odczyt zatwierdzonych przez wszystkich i odczyt wlasnych zgloszen
-- przez autora (stare 'pending', jesli jakies zostaly, admin rozpatrzy w panelu).
-- ==========================================================================

DROP POLICY IF EXISTS feed_insert_by_authenticated ON public.feed_ingredients;

-- Sprawdzenie: na liscie nie powinno byc feed_insert_by_authenticated.
--   select policyname, cmd from pg_policies where tablename = 'feed_ingredients';
