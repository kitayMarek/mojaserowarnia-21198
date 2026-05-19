
# Migracja kultur bakteryjnych do bazy danych

## Zakres

Przeniesienie 147 kultur z hardcoded `src/data/culturesDataComplete.ts` do bazy Lovable Cloud, wymiana statycznych importów na hook `useCultures()` w dwóch stronach.

## Kroki

### 1. Migracja bazy danych (SQL Editor)
Uruchomię całą zawartość `migration_cultures.sql` przez narzędzie migracji. Tworzy:
- tabelę `cultures` (z indeksami + FTS) + RLS (public SELECT, admin INSERT/UPDATE)
- tabelę `price_history` + RLS
- tabele `user_culture_lists` i `user_culture_list_items` + RLS per użytkownik
- funkcję+trigger `update_updated_at` (nazwa różna od istniejącego `update_updated_at_column`, brak konfliktu)
- INSERT seedujący 147 rekordów

Po migracji zweryfikuję `SELECT count(*) FROM public.cultures` — oczekiwane 147.

### 2. Hook
Skopiuję `user-uploads://useCultures.ts` → `src/hooks/useCultures.ts` bez zmian. Eksportuje `useCultures()`, `useCultureDetail()`, typ `Culture` (zgodny ze starym + nowe pola `id`, `is_active`, `created_at`, `updated_at`).

### 3. Podmiana importów

**`src/pages/PorownywarkaKultur.tsx`**
- Usuwam `import { culturesData, Culture } from "@/data/culturesDataComplete"`
- Dodaję `import { useCultures, type Culture } from "@/hooks/useCultures"`
- W komponencie: `const { cultures: culturesData, loading } = useCultures()`
- Dodaję prosty wskaźnik ładowania nad listą wyników
- Reszta logiki (filtry/porównanie) pozostaje — interfejs `Culture` ma te same pola (`name`, `shop`, `price`, `composition`, `type`, `temperature`, `application`, `productUrl`, `lastChanged`)

**`src/pages/BazaKultur.tsx`**
- Analogicznie: zamieniam import na `useCultures` i `culturesData` na dane z hooka
- Sortowanie po cenie zacznie wykorzystywać już dostępny string `price` (bez zmian logiki) — opcjonalnie mogę użyć `price_numeric` jeśli chcesz dokładniejszego sortu (do potwierdzenia)
- Dodaję stan loading

## Uwagi techniczne

- Nie zmieniam `culturesDataComplete.ts` — zostaje jako fallback/historia (można usunąć później, gdy potwierdzisz, że nikt go nie importuje)
- Po migracji `src/integrations/supabase/types.ts` zostanie auto-zregenerowane przez Lovable — hook będzie miał poprawne typy
- RLS dla SELECT jest publiczne (`is_active = true`), więc dane będą widoczne bez logowania — zgodnie z obecnym zachowaniem strony

## Czego NIE robię w tej iteracji

- Nie buduję UI do zarządzania kulturami (admin) ani UI list użytkownika — tabele `user_culture_lists*` są przygotowane na przyszłość
- Nie podpinam `useCultureDetail()` (brak strony szczegółów kultury w obecnym kodzie)
