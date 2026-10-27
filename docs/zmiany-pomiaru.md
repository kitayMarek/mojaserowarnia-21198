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
| 8.10.2026 | Przycisk „Zapisz w TalkToFarm” w kalkulatorach pasz (drób i bydło) wysyła zdarzenie `mieszanka_eksport` z `format=talktofarm` | Nowa wartość parametru `format`, liczy od zera i tylko od osób ze zgodą. Liczba eksportów rośnie o te kliknięcia |

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
| 15.09.2026, 06:36 UTC | Licznik przyjść (raport „Skąd przychodzą”): `www.bing.com` zapisywany jako `Bing`, a nie `Copilot`. Nie liczy już przekierowań 3xx, wstępnych pobrań, zasobów w tle ani wejść z sygnałem GPC | Liczby z Google i Binga mogą spaść, bo znika podwójne liczenie wejść na adresy `.html`. Starsze wiersze `Copilot` mieszają Copilota z wyszukiwarką Bing i nie da się ich rozdzielić |
| 15.09.2026, 06:36 UTC | Start licznika wejść ludzi: tabela `wejscia_ludzi`, sumy liczone przez serwer niezależnie od zgody na ciasteczka (`worker/wejscia-ludzi.js`). Alarm ciszy obu liczników codziennie o 6:45 UTC | Nowe źródło, liczy od zera. Wejście to załadowanie strony przez przeglądarkę, a nie odsłona ani osoba. Pierwszy pełny dzień: 16.09.2026 |
| 16.10.2026 | Meta-ExternalAgent zablokowany: `Disallow: /` w robots.txt i kod 403 od workera na wszystko poza /robots.txt. facebookexternalhit bez zmian | Wizyty Meta-ExternalAgent mają od tej daty status 403 zamiast 200 i znikają z raportów treści („Co czytali”, „Po co przychodzą”). Spadek jego pobrań to skutek blokady, nie mniejszego zainteresowania |
| 21.10.2026 | Przyjścia i wejścia ludzi: znacznik `utm_source=magazyn` (linki z odpowiedzi serwera MCP bazy kultur, dane.mojaserowarnia.pl) zapisywany jako źródło `Magazyn` | Nowe źródło. Takie wejście wcześniej liczyło się pod odsyłaczem (np. chatgpt.com) albo wcale. Wywołania samego serwera MCP liczy osobna tabela `magazyn_wywolania` |
| 25.10.2026 | Przyjścia i wejścia ludzi: serwer MCP dokleja do swoich linków `utm_campaign` ze znacznikiem z adresu łącznika (`?z=asystent-jana`), a licznik zapisuje źródło `Magazyn: asystent-jana`. Powód: wyzwanie dla twórców aplikacji na grupie FB (pokazać autorom wywołania i kliknięcia) | Część wejść, które wcześniej szły jako `Magazyn`, ma od tej daty źródło `Magazyn: nazwa`. Przy porównaniu okresów sumować oba. Linki do sklepów bez zmian |
| 25.10.2026, ok. 15:30 UTC | Drugi serwis w tych samych tabelach (migracja `20261025210000_serwis_w_pomiarze.sql`): `wejscia_ludzi.serwis` (`mojaserowarnia.pl` albo `mojapasza.com`) i `magazyn_wywolania.serwer` (`mojaserowarnia` albo `mojapasza`, łącznik mojapasza.com/mcp). Stare wiersze dostały Serowarnię. Serwer MCP liczy kanał ze ścieżki (`/mcp/claude`, `/mcp/chatgpt`…) jako źródło, gdy adres nie ma `?z=`. `bot_visits` i przyjścia bez zmian: mojapasza do nich nie pisze | **Od tej daty każde zapytanie o ruch Serowarni filtrować `WHERE serwis = 'mojaserowarnia.pl'`** (i `serwer = 'mojaserowarnia'` dla MCP), bo strona główna obu serwisów to `/`. Wejścia na mojapasza.com do przełączenia (28.10.2026) to testy |
| 27.10.2026 | Licznik botów rozpoznaje 44 nowe podpisy (`worker/wizyty-botow.js`, migracja `20261027100000_nowe_nazwy_botow.sql`, która przepisuje też historię). Nowa kategoria `ai_inne`: boty AI bez metody weryfikacji (KimiBot, Qwenbot, Hunyuan, GrokBot i inne, plus DeepSeekBot z „inne”). Meta-WebIndexer w `ai_crawler`, Meta-ExternalFetcher w `ai_uzytkownik`, obie weryfikowane po AS32934. DuckDuckBot w `wyszukiwarka`, SERanking i Awario w `narzedzie_seo` | „(nierozpoznany podpis)” maleje o ok. 3,4 tys. na 30 dni, także wstecz. Kategoria „inne” maleje o boty przeniesione. Raport „Pytania z czatów” może mieć w kolumnie „Inne” potwierdzone pobrania Meta-ExternalFetcher |
