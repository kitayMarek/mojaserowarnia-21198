-- ============================================================
-- cultures — poprawka jednego błędnego producenta
-- Uruchom w Supabase (Lovable → SQL Editor). Idempotentne.
--
-- microMilk TB/B (Caciotta) miał w bazie producenta "DANISCO (IFF)".
-- Strona produktu w sklepie Wańczykówka deklaruje markę microMilk
-- (sprawdzone 2026-08-22). To jedyna taka niezgodność w całej bazie —
-- kontrola „nazwa produktu vs pole producenta" na 188 pozycjach
-- wykryła ten jeden przypadek.
-- ============================================================

UPDATE cultures
SET manufacturer = 'microMilk'
WHERE name = 'microMilk TB/B (Caciotta)'
  AND manufacturer = 'DANISCO (IFF)';

-- Kontrola po wykonaniu — powinno wyjść: microMilk 25, DANISCO (IFF) 29
SELECT manufacturer, COUNT(*) AS pozycji
FROM cultures
WHERE manufacturer IN ('microMilk', 'DANISCO (IFF)')
GROUP BY manufacturer
ORDER BY pozycji DESC;
