# Przeniesienie projektu z Lovable Cloud do własnego Supabase

Ten dokument opisuje krok po kroku, jak przenieść projekt `mojaserowarnia.pl` (kod + bazę danych + storage + użytkowników) z Lovable Cloud do własnego projektu Supabase.

## Co zostało już zrobione w tym repo

W ramach przygotowania do migracji utworzyliśmy trzy edge functiony eksportujące dane:

- `export-data` — wszystkie tabele w schemacie `public`
- `export-users` — użytkownicy Auth, profile i role
- `export-storage` — pliki z bucketów Storage

Wyniki eksportu znajdują się w katalogu `export/` (przygotowany do pobrania).

## Ograniczenia, o których musisz wiedzieć

**Haseł użytkowników nie da się przenieść.** Supabase Auth nie udostępnia haseł w plaintext ani w formacie, który można zaimportować do innego projektu. Skrypt migracyjny tworzy konta użytkowników z losowymi hasłami i (opcjonalnie) wysyła linki resetujące hasło. Użytkownicy będą musieli ustawić nowe hasło.

## Wymagania

1. Nowy projekt Supabase (załóż na [supabase.com](https://supabase.com) lub self-hosted).
2. Lokalna kopia tego repozytorium.
3. Node.js 18+.
4. Zainstalowane zależności: `npm install` (potrzebny pakiet `@supabase/supabase-js`, który już jest w `package.json`).

## Krok 1: Przygotowanie nowego projektu Supabase

1. Utwórz nowy projekt w Supabase.
2. Zanotuj:
   - **Project URL** (np. `https://abc123.supabase.co`)
   - **service_role key** (Settings → API → service_role — trzymaj go w bezpiecznym miejscu)
3. Skonfiguruj dostawcę email/SMTP (Settings → Auth → Email), jeśli chcesz, żeby użytkownicy mogli sami resetować hasła.
4. Włącz Google OAuth (lub innych dostawców), jeśli byli używani w Lovable Cloud — skopiuj Client ID i Secret do nowego projektu.

## Krok 2: Odtworzenie schematu bazy danych

W nowym Supabase musisz odtworzyć schemat: tabele, enumy, funkcje, triggery, polityki RLS i granty.

### Opcja A: przez Supabase CLI (zalecana)

Jeśli masz zainstalowane CLI:

```bash
supabase login
supabase link --project-ref <nowy-project-ref>
supabase db reset              # opcjonalnie: wyczyść i odtwórz schemat z migracji
supabase migration up            # uruchom wszystkie migracje z supabase/migrations/
```

### Opcja B: ręcznie w SQL Editor

1. Otwórz SQL Editor w nowym Supabase.
2. Po kolei wklejaj i uruchamiaj pliki z `supabase/migrations/` w kolejności alfabetycznej (od najstarszego do najnowszego).
3. Upewnij się, że każda tabela ma włączone RLS i odpowiednie polityki oraz `GRANT`y.

> **Uwaga:** migracje w tym repo mogą zawierać dane seed (np. kultury). Jeśli chcesz, aby finalna baza zawierała dokładnie dane wyeksportowane z Lovable Cloud, nie martw się o to — skrypt importujący nadpisze je w kolejnym kroku.

## Krok 3: Pobranie plików eksportu

Pliki eksportu znajdują się w katalogu `export/` w tym repozytorium:

- `export-data.json`
- `export-users.json`
- `export-storage.json`

Jeśli nie masz ich lokalnie, pobierz je z Lovable Cloud (lub poproś o przekazanie).

## Krok 4: Uruchomienie skryptu importującego

Ustaw zmienne środowiskowe i uruchom skrypt:

```bash
export NEW_SUPABASE_URL="https://<twój-nowy-project>.supabase.co"
export NEW_SUPABASE_SERVICE_ROLE_KEY="<twój-service-role-key>"

# Opcjonalnie: wysyła linki resetujące hasło do wszystkich zaimportowanych użytkowników
export SEND_PASSWORD_RESET="true"

node scripts/import-to-supabase.mjs
```

Skrypt wykona:

1. Utworzy użytkowników w nowym Supabase Auth (z losowymi hasłami).
2. Zaimportuje profile i role.
3. Zaimportuje wszystkie tabele publiczne w kolejności zgodnej z kluczami obcymi.
4. Utworzy buckety storage i wgra pliki.
5. (Opcjonalnie) wyśle linki resetujące hasło.

## Krok 5: Weryfikacja

Po zakończeniu importu sprawdź w nowym Supabase:

- **Authentication → Users** — czy są wszyscy użytkownicy?
- **Table Editor** — czy dane w tabelach są kompletne?
- **Storage** — czy pliki są w bucketach?
- **Database → Functions / Triggers / Policies** — czy wszystkie funkcje, triggery i polityki RLS są obecne?

## Krok 6: Aktualizacja frontendu

W pliku `.env` w katalogu głównym projektu zamień wartości Supabase na nowe:

```env
VITE_SUPABASE_URL=https://<twój-nowy-project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<twój-anon-key>
VITE_SUPABASE_PROJECT_ID=<twój-project-ref>
```

> `VITE_SUPABASE_PUBLISHABLE_KEY` to tzw. anon/public key z nowego projektu (Settings → API → Project API keys → anon public).

Następnie:

```bash
npm install
npm run build
```

## Krok 7: Wdrożenie frontendu

Możesz wdrożyć frontend w dowolnym miejscu:

- **Vercel / Netlify / Cloudflare Pages** — podłącz repo i ustaw zmienne środowiskowe.
- **Własny serwer** — wgraj zawartość katalogu `dist/`.

Pamiętaj, aby w nowym hostingu ustawić te same zmienne środowiskowe co w `.env`.

## Krok 8: Przekierowanie domeny / DNS

Jeśli używasz własnej domeny:

1. W nowym Supabase dodaj domenę custom (Settings → Custom domains).
2. Zaktualizuj rekordy DNS u swojego rejestratora, aby wskazywały nowy projekt.
3. Zaktualizuj `redirect_uri` w konfiguracji OAuth (Google itp.), jeśli się zmieniło.
4. Zaktualizuj linki w aplikacji zewnętrznych (np. RSS, social media), jeśli URL się zmienił.

## Krok 9: Komunikacja z użytkownikami

Ponieważ hasła nie są przenoszone, wyślij do użytkowników informację:

> „Przenieśliśmy serwis na nową infrastrukturę. Aby się zalogować, użyj opcji „Nie pamiętam hasła” / „Zresetuj hasło” i ustaw nowe hasło. Twoje dane (ewidencja, faktury, listy kultur) zostały zachowane.”

## Rozwiązywanie problemów

### Błąd: `permission denied for table ...`

Upewnij się, że używasz **service_role key**, a nie anon key, i że tabela ma odpowiednie `GRANT`y oraz RLS wyłączone lub politykę dla `service_role`.

### Błąd: `duplicate key value violates unique constraint`

Tabela zawiera już dane (np. z migracji seed). Skrypt używa `upsert`, więc powinien nadpisać, ale jeśli występują konflikty FK, upewnij się, że importujesz w odpowiedniej kolejności.

### Brakuje niektórych tabel

Sprawdź, czy wszystkie migracje zostały uruchomione w nowym Supabase. Funkcje i triggery również muszą istnieć, bo część logiki biznesowej jest po stronie bazy.

### Pliki storage nie wyświetlają się

Sprawdź, czy bucket jest publiczny oraz czy pliki mają poprawne `content_type`. W razie potrzeby ustaw bucket jako publiczny:

```sql
update storage.buckets set public = true where id = 'wizytowki';
```

## Lista plików eksportu

| Plik | Zawartość |
|------|-----------|
| `export/export-data.json` | Wszystkie tabele w schemacie `public` |
| `export/export-users.json` | Użytkownicy Auth, profile, role |
| `export/export-storage.json` | Pliki z bucketów Storage (zakodowane base64) |

## Kontakt

Jeśli napotkasz problemy z migracją, sprawdź logi skryptu i komunikaty błędów z nowego Supabase. Większość problemów wynika z braku schematu, nieprawidłowych uprawnień lub braku skonfigurowanej wysyłki email.
