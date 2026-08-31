# Plan wyprowadzki projektu z Lovable Cloud do własnego Supabase

## Cel
Przeniesienie całej aplikacji mojaserowarnia.pl (frontend + baza danych + storage + użytkownicy) z Lovable Cloud do samodzielnie zarządzanego projektu Supabase bez utraty danych.

## Kluczowe ograniczenie
Lovable Cloud nie udostępnia użytkownikowi hasła do bazy ani `SUPABASE_SERVICE_ROLE_KEY`. Bezpośredni `pg_dump` przez port 5432 nie jest możliwy. Eksport musi odbyć się przez dostępne API: REST Data API, Auth Admin API oraz Storage API — najlepiej za pośrednictwem tymczasowej Edge Function uruchomionej w Lovable Cloud.

## Faza 0 — Audyt i przygotowanie
1. Weryfikacja obecnych migracji w `supabase/migrations/` (9 plików SQL).
2. Sporządzenie listy wszystkich tabel publicznych, funkcji, triggerów, polityk RLS i bucketów storage.
3. Oszacowanie rozmiaru danych: liczba rekordów w każdej tabeli, liczba plików w bucketach, liczba użytkowników.
4. Przygotowanie nowego projektu Supabase (nowy URL, anon key, service role key).
5. Upewnienie się, że w nowym Supabase są włączone rozszerzenia używane w obecnej bazie (np. `pgcrypto`, `uuid-ossp`).

## Faza 1 — Odtworzenie schematu w nowym Supabase
1. Uruchomienie wszystkich migracji z `supabase/migrations/` w kolejności alfabetycznej w nowym projekcie.
2. Weryfikacja, że wszystkie tabele, funkcje, triggery, polityki RLS i granty zostały odtworzone.
3. Uruchomienie `supabase--linter` na nowej bazie, aby upewnić się, że RLS i polityki są poprawne.

## Faza 2 — Eksport danych aplikacji z Lovable Cloud
1. Utworzenie tymczasowej Edge Function `export-data` w obecnym projekcie Lovable Cloud.
2. Funkcja powinna:
   - Używać service role clienta do odczytu wszystkich tabel w schemacie `public`.
   - Pominąć tabelę `profiles` na etapie eksportu danych aplikacji (będzie odtworzona razem z użytkownikami).
   - Zapisać dane jako pliki JSON w bezpiecznym, tymczasowym miejscu lub zwrócić je w odpowiedzi (dla małych zbiorów).
3. Wywołanie funkcji i pobranie dumpów JSON dla każdej tabeli.
4. Weryfikacja kompletności: porównanie `COUNT(*)` w źródle i dumpie.

## Faza 3 — Eksport użytkowników i profili
1. Utworzenie Edge Function `export-users` używającej Auth Admin API (`supabase.auth.admin.listUsers()`).
2. Eksport wszystkich użytkowników z `auth.users` wraz z metadanymi (id, email, confirmed_at, created_at, raw_app_meta_data itp.).
3. Eksport tabeli `public.profiles` oraz `public.user_roles` (service role).
4. Uwaga: hasła użytkowników nie są eksportowalne. W nowym Supabase trzeba będzie:
   - Zaimportować użytkowników przez Auth Admin API z flagą `email_confirm: true` (jeśli byli zweryfikowani).
   - Wymusić reset hasła dla każdego użytkownika lub poprosić ich o ponowne ustawienie hasła.

## Faza 4 — Import danych do nowego Supabase
1. Import użytkowników przez Auth Admin API do nowego projektu.
2. Odtworzenie profili i ról w `public.profiles` oraz `public.user_roles` (z zachowaniem starych `id`).
3. Import danych aplikacji z JSON-ów do odpowiednich tabel w schemacie `public`.
4. Weryfikacja integralności: klucze obce, sekwencje, polityki RLS.

## Faza 5 — Eksport i import Storage
1. Wylistowanie wszystkich plików w bucketach (obecnie `wizytowki`).
2. Pobranie plików przez Storage API z Lovable Cloud.
3. Utworzenie odpowiednich bucketów w nowym Supabase (takie same nazwy i ustawienia public/private).
4. Wgranie plików pod identyczne ścieżki do nowego Storage.
5. Weryfikacja dostępności publicznych URL-i.

## Faza 6 — Aktualizacja aplikacji i testy
1. Zmiana zmiennych środowiskowych w `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
2. Zaktualizowanie `supabase/config.toml` (nowy `project_id`).
3. Uruchomienie buildu (`bun run build`) i weryfikacja braku błędów TypeScript.
4. Przetestowanie kluczowych ścieżek:
   - logowanie istniejącego użytkownika (z resetem hasła),
   - odczyt bazy kultur,
   - dodanie nowej listy kultur,
   - wyświetlenie plików z Storage.

## Faza 7 — Przełączenie DNS / publikacji
1. Wdrożenie aplikacji na nowy hosting (Vercel, Netlify, Cloudflare Pages lub inny).
2. Jeśli używasz domeny niestandardowej: aktualizacja rekordów DNS.
3. Wyłączenie lub usunięcie projektu w Lovable Cloud dopiero po potwierdzeniu, że nowa wersja działa poprawnie przez co najmniej 48h.

## Ryzyka i decyzje do podjęcia
- **Hasła użytkowników**: Supabase nie pozwala wyeksportować hashy haseł. Użytkownicy muszą zresetować hasła. Alternatywnie: można pozostawić logowanie przez Lovable Cloud do czasu, aż wszyscy zresetują hasła.
- **Edge Function do eksportu**: musi być chroniona przed nieautoryzowanym dostępem (np. tymczasowy secret w nagłówku), bo service role daje pełen dostęp do danych.
- **Rozmiar danych**: jeśli baza lub storage są duże, jednorazowy JSON w odpowiedzi Edge Function może przekroczyć limit. Wtedy eksport dzielimy na partie po tabelach lub zapisujemy pliki do storage.
- **RLS i polityki**: po imporcie danych upewniamy się, że polityki RLS są identyczne i działają — inaczej aplikacja może zwracać błędy uprawnień.

## Co będzie potrzebne od Ciebie
- Nowy projekt Supabase (założony na supabase.com).
- Nowy `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` oraz `SUPABASE_SERVICE_ROLE_KEY` z nowego projektu.
- Hosting frontendu (np. Vercel) i nowy publiczny URL.
- Decyzja, jak obsłużyć reset haseł dla istniejących użytkowników.
