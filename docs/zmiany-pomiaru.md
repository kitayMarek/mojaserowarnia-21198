# Zmiany pomiaru

Daty, od których liczby w Google Analytics albo w liczniku botów znaczą co innego
niż wcześniej. **Zanim porównasz dwa okresy, sprawdź, czy nie leży między nimi
któraś z tych dat.** Jeśli leży, różnica może być zmianą pomiaru, a nie ruchu.

## Google Analytics

| Data | Zmiana | Skutek dla liczb |
|---|---|---|
| do 8.09.2026 | Adresy `.html` (mirrory dla botów) dostawał każdy odwiedzający, a mirrory nie mają i nigdy nie miały kodu GA | Wejścia z Google na te adresy nie trafiały do GA. W okresie 12.06–10.09.2026 było to 316 z 1426 kliknięć z Search Console (22%), w tym mozzarella 188, przewodnik prawny 38, caciotta 23, ricotta 12 |
| 8.09.2026, 09:35 | `/x.html` przekierowuje 301 na `/x` | Te wejścia trafiają do aplikacji z GA. Część wzrostu w GA po tej dacie to zmiana pomiaru |
| 8.09.2026, 09:35 – 15.09.2026 | Cztery artykuły istniejące tylko jako pliki statyczne (`/etykieta-do-sprzedazy-rhd`, `/jak-wystawic-fakture-vat-rr`, `/kultury/do-twarogu`, `/kultury/do-caciotta`) po przekierowaniu z `.html` pokazywały ludziom stronę 404 albo „Nie mamy takiej kultury” | Kliknięcia z Google na te adresy kończyły się pustą stroną. GA tych artykułów nie mierzy wcale (pliki statyczne nie mają kodu GA), więc w GA tej awarii nie widać i nie będzie widać ich ruchu także po naprawie |
| 8.09.2026 – 15.09.2026 | Stare przekierowania z `public/_redirects` z adresem `.html` po lewej stronie (`/etykieta-rhd.html`, `/przepisy/do-twarogu.html`, `/kultury/index.html`) przestały działać, bo od 8.09 każde żądanie `.html` trafia najpierw do workera | Te adresy dawały 404 zamiast 301. Od 15.09 przekierowuje je worker |
| 9.09.2026 | Końcowy ukośnik: `/x/` przekierowuje na `/x` | Odsłony jednego adresu przestają się dzielić na dwa wiersze |
| 10.09.2026 | GA wyłączone na localhost i przy wejściu na `/admin` | Znika praca nad serwisem. Panel dawał około 5% odsłon w okresie 12.06–10.09.2026 |
| 13.09.2026, 21:49 | GA wyłącznie za zgodą (tryb podstawowy Consent Mode) i wyłącznie na mojaserowarnia.pl. Wcześniej skrypt ładował się przed zgodą, a przycisk „Odrzuć” nie działał | **GA liczy tylko osoby, które się zgodziły.** Spadek użytkowników i odsłon po tej dacie to zmiana pomiaru. Serwerowy licznik przyjść (raport „Skąd przychodzą”) nie używa ciasteczek i nie zależy od zgody |
| 13.09.2026, 21:49 | Nowe zdarzenia `mieszanka_zapisana` (kalkulator drobiu, po udanym zapisie) i `mieszanka_eksport` (drób: CSV, TXT; bydło: CSV, PDF) | Liczą się od zera i tylko od osób ze zgodą. Zapisane mieszanki są też w bazie (`feed_recipes`), niezależnie od zgody |
| 13.09.2026, 21:49 | `/przepisy/gruyere`: tytuł i opis pod zapytania informacyjne zamiast przepisu | CTR oceniać po ponownym zaindeksowaniu, razem z pozycją i strukturą zapytań |
| 13.09.2026, 22:31 | Kalkulator pasz: widoczna informacja o zapisie mieszanki dla niezalogowanych. Logowanie z kalkulatora bez ewidencji RHD: rejestracja tylko e-mail i hasło, powrót do kalkulatora, ułożona mieszanka wraca sama. Konta z tej ścieżki mają `cel=kalkulator` w metadanych | **Punkt odniesienia** do oceny, czy informacja coś zmienia: liczba zapisanych mieszanek (tabela `feed_recipes`) i kont z `cel=kalkulator`, tygodnie przed i po tej dacie. Ograniczenia dla niezalogowanych odłożone do czasu tej oceny |

Weryfikacja po wdrożeniu 13.09.2026 około 21:50: jedno testowe wejście ze zgodą
na `/nota-prawna`.

**Do zrobienia w panelu GA:** adnotacja z datą 13.09.2026 oraz rejestracja parametrów
nowych zdarzeń jako wymiarów niestandardowych (`kalkulator`, `rodzaj`, `okres`,
`skladnikow`, `format`). Bez rejestracji GA zbiera zdarzenia, ale nie pokazuje
parametrów w raportach.

## Licznik botów

| Data | Zmiana | Skutek dla liczb |
|---|---|---|
| 10.09.2026, 18:52 UTC – 13.09.2026 | Migracja przepisała trigger wizyt i zgubiła typ ścieżki | Raporty treści i skanerów były w tym oknie puste. Typ odtworzony wstecz ze ścieżki 13.09, dane są kompletne |
| 13.09.2026 | „Całość” w raporcie „Ruch w czasie” liczona po dniach, dopóki pomiar trwa krócej niż 60 dni | Wcześniej po tygodniach; sumy bez zmian |
| 14.09.2026 | Typ ścieżki „sekret” obejmuje też `/@fs/` (luka serwera deweloperskiego Vite), `.aws/`, `gcloud` i `/proc/self/`, po uwadze Krzysztofa Balickiego z logów jego serwerów. Migracja przelicza całą historię. Worker odpowiada na `/@fs/` i `/proc/` 404 zamiast aplikacji z kodem 200 | Pytań o pliki wrażliwe i punktów skanów może przybyć także wstecz. Trzy nowe kategorie w raporcie „Czego szukały skanery” |
