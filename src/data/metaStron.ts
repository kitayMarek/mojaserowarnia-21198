/**
 * Tytuły i opisy stron treściowych — jedno źródło dla trasy React i mirrora.
 *
 * DLACZEGO TO ISTNIEJE: do tej pory każda strona miała tytuł i opis wpisany na
 * sztywno w swoim komponencie, a mirror miał własny, napisany osobno. Dwie kopie
 * tego samego tekstu w dwóch plikach rozjeżdżają się w tym projekcie regularnie —
 * przy FAQ na /prawo/rhd doszło do 11 pytań w Reakcie i 12 w mirrorze.
 *
 * Przepisy mają swój odpowiednik w `seoTitle`/`seoDescription` w recipesData;
 * ten plik obsługuje strony, które przepisami nie są.
 *
 * Do mirrorów wartości dosyła `python scripts/sync-seo-mirrory.py --zapisz`.
 *
 * Limity: tytuł do ~60 znaków, opis do ~155 — dłuższe Google przycina.
 */

export interface MetaStrony {
  title: string;
  description?: string;
  /** Ścieżka mirrora względem public/ — dla skryptu synchronizującego. */
  mirror?: string;
}

export const metaStron: Record<string, MetaStrony> = {
  "/boty-ai": {
    // Strona o ZJAWISKU, nie o statystykach serwisu — stad tytul bez nazwy
    // portalu. Tekst 1:1 z mirrorem public/boty-ai.html, ktory jest szablonem
    // skladanym przez workera; przy zmianie poprawic OBA miejsca.
    title: "Ile ruchu botów AI jest naprawdę botami AI",
    description:
      "User-Agent to deklaracja, nie tożsamość. Pomiar z realnej strony: ile żądań podających się za boty AI przeszło weryfikację i po czym poznać podszywacza.",
    mirror: "boty-ai.html",
  },
  "/prawo/rhd": {
    // Profil odbiorcy (od Marka): małe gospodarstwo szukające dodatkowego dochodu
    // BEZ zakładania działalności. Nie widzi, co zyskuje — widzi papiery. Dlatego
    // opis zaczyna się od korzyści, a nie od obowiązków.
    // Dane: 2650 wyświetleń, CTR 0,34%. Uwaga — 1211 z nich to samo „rhd”
    // (pozycja 9,2), fraza dwuznaczna; realne intencje to „rhd limity” (poz. 16),
    // „rhd wymagania” (poz. 28), „kasa fiskalna” (poz. 10).
    title: "Rolniczy handel detaliczny (RHD) — sprzedaż bez działalności",
    description:
      "Sprzedawaj własne sery i przetwory bez zakładania firmy. Limit 100 000 zł bez PIT, rejestracja w 14 lub 30 dni, ewidencja i kasa fiskalna.",
    mirror: "prawo/rhd.html",
  },
  "/prawo/rhd/dotacja": {
    // Nabor I.10.6.1 trwa 1.10-2.11.2026. Po 2.11 zmienic tytul i opis na
    // "nabor zakonczony" i dopisac, co wiadomo o kolejnym.
    title: "Dotacja na RHD 2026: 30, 60 lub 120 tys. zł z ARiMR",
    description:
      "Dotacja ARiMR na przetwórstwo w RHD: 30, 60 lub 120 tys. zł, do 65% kosztów. Kto może, na co i jak złożyć wniosek w PUE do 2 listopada 2026.",
    mirror: "prawo/rhd/dotacja.html",
  },
  "/prawo/mol": {
    // Ten sam odbiorca co przy RHD, ale na większą skalę. Kluczowa różnica, której
    // nie widać nigdzie indziej: w MOL surowiec NIE musi pochodzić z własnego
    // gospodarstwa — i to jest najczęstszy powód, dla którego ktoś wybiera MOL.
    // Dane: 179 wyświetleń, 1 kliknięcie. Za mało, by cokolwiek zmierzyć.
    title: "MOL — działalność marginalna, lokalna i ograniczona: limity",
    description:
      "MOL to sprzedaż produktów zwierzęcych na większą skalę niż RHD: 0,5 tony sera tygodniowo, obszar województwa, a surowiec nie musi być własny.",
    mirror: "prawo/mol.html",
  },
  "/automatyzacja-social-media": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: Helmet (tytul), Helmet (opis).
    title: "Automatyzacja Social Media - RSS Feed do Facebook | Moja Serowarnia",
    description:
      "Automatycznie publikuj nowe przepisy na Facebooku używając RSS Feed i Zapier/IFTTT. Instrukcje krok po kroku i panel testowy.",
  },
  "/bakterie-kultury": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Kultury bakteryjne i pleśnie w serowarstwie — przewodnik",
    description:
      "Przewodnik po kulturach i pleśniach serowarskich: mezofilne, termofilne, NSLAB, propionowe, pleśnie i maz — dawki na 10 L, temperatury, pH i błędy.",
    mirror: "bakterie-kultury.html",
  },
  "/dojrzewalnia-z-lodowki": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Dojrzewalnia do sera z lodówki lub piwniczki — jak zrobić",
    description:
      "Jak zrobić dojrze walnię do sera z piwniczki do wina lub starej lodówki: temperatura 10–14°C, wilgotność 80–95%, kontroler Inkbird. Koszty i alternatywy.",
    mirror: "dojrzewalnia-z-lodowki.html",
  },
  "/encyklopedia-serowarstwo": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), Helmet (opis).
    title: "Encyklopedya rolnicza — ponadczasowa wiedza o serowarstwie (ok. 1900)",
    description:
      "Hasło \"Serowarstwo\" z Encyklopedyi rolniczej (ok. 1900) — chemia mleka, koagulacja, klasyfikacja serów, dojrzewanie. Co z tej wiedzy obowiązuje do dziś.",
    mirror: "encyklopedia-serowarstwo.html",
  },
  "/faktura-vat-rr": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: Helmet (tytul), Helmet (opis).
    title: "Faktura VAT RR — generator projektu i zasady | Moja Serowarnia",
    description:
      "Kto wystawia fakturę VAT RR, kiedy przysługuje 7% zryczałtowanego zwrotu i jakie pola są obowiązkowe (art. 116 VAT). Darmowy generator faktury do druku.",
  },
  "/kalkulator-solanki": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    // 19.10.2026: bez "CaCl2 na litr mleka" w tytule i opisie. Ta strona odbierala
    // fraze "ile chlorku wapnia na litr mleka" stronie /chlorek-wapnia-do-mleka,
    // ktora od 31.08 wypadla z indeksu jako zbedna.
    title: "Kalkulator solanki do sera – ile soli na litr wody",
    description:
      "Ile soli na solankę do sera (18–22%): przeliczenie na dowolną ilość wody, temperatura solanki, chlorek wapnia do solanki i ponowne użycie solanki.",
    mirror: "kalkulator-solanki.html",
  },
  "/klasyka-serowarstwa": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Klasyka polskiego serowarstwa — podręczniki (domena publiczna)",
    description:
      "Klecki (1900), Licznerski (1922), Encyklopedya rolnicza — polskie klasyki serowarstwa w domenie publicznej. Darmowe skany i cytaty historyczne.",
    mirror: "klasyka-serowarstwa.html",
  },
  "/klecki-jakosc-mleka": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "9 warunków jakości mleka wg Kleckiego (1900) — co decyduje o serze",
    description:
      "Prof. Klecki (UJ, 1900) opisał 9 czynników jakości mleka serowarskiego: rasa, sezon, żywienie, laktacja, higiena udoju, czas, temperatura, dojrzewanie mleka.",
    mirror: "klecki-jakosc-mleka.html",
  },
  "/licznerski": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), Helmet (opis).
    title: "Jan Licznerski — człowiek, który napisał polską biblię serowarstwa",
    description:
      "Biografia Jana Licznerskiego, autora \"Praktycznego serowarstwa\" (1922). Oś czasu, osiągnięcia i cytaty z polskiej biblii serowarstwa.",
    mirror: "licznerski.html",
  },
  "/licznerski-mleko": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), Helmet (opis).
    title: "Mleko wg Licznerskiego — Część I Praktycznego serowarstwa (1922)",
    description:
      "Skład chemiczny mleka, mikrobiologia, pasteryzacja i dojrzewanie mleka wg Jana Licznerskiego (1922). Analiza Części I \"Praktycznego serowarstwa\" — co z tej wiedzy obowiązuje po 100 latach.",
    mirror: "licznerski-mleko.html",
  },
  "/licznerski-sery": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), Helmet (opis).
    title: "Rodzaje serów wg Licznerskiego — Część II Praktycznego serowarstwa",
    description:
      "8 typów serów wg Licznerskiego (1922): miękkie, limburski, quartirolo, ementalski, holenderski, twarde, topione. Co z tej wiedzy przetrwało 100 lat?",
    mirror: "licznerski-sery.html",
  },
  "/mleko-do-sera": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Mleko do sera — ile sera z litra, skład i wpływ żywienia krów",
    description:
      "Ile sera z 10 L mleka (tabela dla 8 serów), co decyduje o wydajności (kazeina i tłuszcz), wzór Van Slyke'a, Jersey vs holsztyn, kappa-kazeina i wpływ żywienia krów.",
    mirror: "mleko-do-sera.html",
  },
  "/nieudany-ser": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Nieudany ser — ratować czy wyrzucić? Diagnostyka i odzysk",
    description:
      "Nieudany ser: tabela 9 objawów z przyczyną i ścieżką odzysku. Pleśń na twardym (odkrój 2–3 cm) vs miękkim (wyrzuć), gorycz, brak skrzepu, bezpieczne skarmianie zwierzętami.",
    mirror: "nieudany-ser.html",
  },
  "/organizacja-serowarni": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Organizacja małej serowarni — układ pomieszczeń, sprzęt i obieg pracy",
    description:
      "Jak zorganizować małą serowarnię: układ pomieszczeń, strefy czyste i brudne, dobór sprzętu, obieg pracy od mleka do sera. Wymogi lokalowe RHD i MOL.",
    mirror: "organizacja-serowarni.html",
  },
  "/pasze": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Pasze i zwierzęta — normy, bilansowanie i produkty uboczne",
    description:
      "Żywienie zwierząt w gospodarstwie: normy drobiu (nioski 16–18% białka, 3,8–4,2% wapnia), po co olej, muszle ostryg, metionina i grit, oraz co zrobić z serwatką i nieudanym serem.",
    mirror: "pasze.html",
  },
  "/pasze/udzial-surowcow": {
    // Od 24.10.2026. Dane i źródła: src/data/udzialySurowcow.ts (wspólne z kalkulatorem i MCP).
    title: "Ile jakiego surowca w paszy dla drobiu",
    description:
      "Najwyższe zalecane udziały zbóż, grochu, bobiku, łubinu i rzepaku dla piskląt, brojlerów, niosek, kaczek i gęsi, z powodem i źródłem.",
    mirror: "pasze/udzial-surowcow.html",
  },
  "/pasze/kury-nie-niosa": {
    // Od 24.10.2026. Pytanie z grup o kurach; treść: src/data/kuryNieNiosa.ts.
    title: "Kury nie niosą jajek? Najczęstsze przyczyny",
    description:
      "Dajesz kurom dobre jedzenie, a nie niosą? Krótki dzień i pierzenie, za mało białka i wapnia, sama pszenica i resztki z kuchni. Co zrobić.",
    mirror: "pasze/kury-nie-niosa.html",
  },
  "/pasze/resztki-z-kuchni": {
    // Od 24.10.2026, dla małych hodowców; treść: src/data/resztkiZKuchni.ts.
    title: "Resztki z kuchni dla kur: co wolno, ile i czego unikać",
    description:
      "Chleb, makaron, obierki, talerz po obiedzie. Ile resztek mogą dostać kury, co im szkodzi (sól, pleśń, awokado, surowa fasola) i co mówią przepisy.",
    mirror: "pasze/resztki-z-kuchni.html",
  },
  "/poradniki": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: Helmet (tytul), Helmet (opis).
    title: "Poradniki serowara | Start",
    description:
      "Kompletne poradniki dla serowarów: kompleksowy przewodnik po produkcji sera oraz szczegółowe informacje o sile podpuszczki i metodzie flokulacji.",
  },
  "/porownanie-wartosci-odzywczych": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: Helmet (tytul), Helmet (opis).
    title: "Kalkulator porównania wartości odżywczych serów | Moja Serowarnia",
    description:
      "Porównaj wartości odżywcze serów — kalorie, białko, tłuszcze, wapń i sód. Do 3 serów naraz, na 100 g lub dowolną porcję. Przydatne do diety i etykiet.",
  },
  "/przepisy-kulinarne": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: Helmet (tytul), Helmet (opis).
    title: "Przepisy Kulinarne z Serem | Moja Serowarnia",
    description:
      "Odkryj wyjątkowe przepisy kulinarne, w których ser jest głównym bohaterem. Eleganckie dania z serem Gouda, Brie, Camembert i innymi serami.",
  },
  "/serowarnie": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Serowarnie zagrodowe w Polsce — katalog producentów",
    description:
      "Katalog małych serowarni zagrodowych w Polsce. Znajdź producenta w swoim województwie i kup ser prosto od gospodarza.",
    mirror: "serowarnie.html",
  },
  "/serowarstwo-staropolskie": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Serowarstwo Staropolskie — polskie piśmiennictwo (XIX–XX w.)",
    description:
      "Polskie serowarstwo akademickie: Klecki (UJ 1900), Licznerski (1922) i inne źródła w domenie publicznej. Wiedza sprzed ponad 100 lat, aktualna do dziś.",
    mirror: "serowarstwo-staropolskie.html",
  },
  "/serwatka-dla-zwierzat": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Serwatka dla zwierząt — dawki dla świń, drobiu i cieląt",
    description:
      "Co zrobić z serwatką po serze: dawki dla świń (10–20 L), drobiu (ukwaszona, 10–20% pojenia) i cieląt. Serwatka słodka vs kwasowa, ostrzeżenie o solonej, przechowywanie i nawóz.",
    mirror: "serwatka-dla-zwierzat.html",
  },
  "/slownik": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Słownik serowarski — 66 terminów PL/EN z definicjami",
    description:
      "Słownik serowarski: 66 terminów po polsku i angielsku z definicjami — podstawy, proces produkcji, typy serów, kultury, parametry, sprzęt i prawo.",
    mirror: "slownik.html",
  },
  "/solenie-sera": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Solenie sera — suche vs solanka: czasy, stężenie i technika",
    description:
      "Solenie sera krok po kroku: solanka 18–22% (ile czasu na kg), solenie suche (2–3% masy), chlorek wapnia, ponowne użycie solanki i wybór metody.",
    mirror: "solenie-sera.html",
  },
  "/wady-mleka-a-wady-sera": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Wady mleka a wady sera — kiszonka, antybiotyki, komórki somatyczne",
    description:
      "Kiszonka i Clostridium a wzdęcia późne (progi przetrwalników), antybiotyki a martwe kultury starterowe, komórki somatyczne a słaby skrzep, późna laktacja. Objaw w serze → przyczyna w oborze.",
    mirror: "wady-mleka-a-wady-sera.html",
  },
  "/wedzenie-sera": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Wędzenie sera — kompletny przewodnik: drewno, temperatura, czas",
    description:
      "Jak uwędzić ser: które sery się nadają, dobór drewna (olcha, buk, owocowe), wędzenie na zimno 20–30°C, czas wędzenia, leżakowanie i typowe błędy.",
    mirror: "wedzenie-sera.html",
  },
  "/woskowanie-sera": {
    // Tytul i opis przeniesione z martwego <Helmet>; zrodlo tekstu: mirror (tytul), mirror (opis).
    title: "Woskowanie sera — jak i czym woskować, temperatura i technika",
    description:
      "Jak woskować ser domowy: temperatura wosku (82–93°C), przygotowanie sera, liczba warstw, które sery woskować, a których nie. Praktyczny przewodnik.",
    mirror: "woskowanie-sera.html",
  },
  "/baza-kultur": {
    // Slownictwo wprost z Search Console (3 miesiace, 51 zapytan). Poprzedni tytul
    // niosl z tej listy JEDNO slowo — "kultury". Ludzie pisza inaczej: "bakterie"
    // (627 wyswietlen), "kultury starterowe" (97), "bioprotekcja" (104),
    // "do twarogu" (98), "mezofilne" (96), "szczepionki" (92), "termofilne" (89).
    //
    // ZSIADLE MLEKO to zaklad Marka, nie wniosek z danych: w tych 51 zapytaniach
    // nie ma go wcale. Uzasadnienie jest inne — gospodyni domowa wie, ze ze
    // sklepowego mleka zsiadle nie wyjdzie (zgnije, zanim sie zsiadzie), i nie wie,
    // ze wlasnie te bakterie to zalatwiaja. Baza ma cztery kultury ALPHA opisane
    // wprost jako "Zsiadle mleko", wiec obietnica jest pokryta trescia.
    //
    // CZASOWNIK "dobierzesz" zostaje z poprzedniej wersji i jest tu celowo.
    // AI Overview przepisuje predykat, ktory strona daje sama o sobie: przy opisie
    // inwentarzowym trafialismy do worka "Zestawienia i bazy" zamiast do glownej
    // listy. Opis ma mowic, co uzytkownik ZROBI.
    //
    // Stan przed zmiana (2026-09-01): 2859 wyswietlen, 61 klikniec, pozycja 11,2.
    // 85% wyswietlen przychodzi z pozycji 11+, wiec to zmiana na TRAFNOSC, nie na CTR.
    title: "Bakterie do sera, twarogu i zsiadłego mleka — 188 kultur",
    description:
      "Dobierzesz bakterie do sera, twarogu i zsiadłego mleka: 188 kultur starterowych — mezofilne, termofilne, pleśnie, bioprotekcja. Ceny w 5 sklepach.",
    mirror: "kultury/baza.html",
  },
  "/sery/emmental": {
    // Druga strona O SERZE po camembercie (ten uklad wszedl w Bingu na 3. miejsce
    // za Wikipedia). Slowa z GSC 18.08-18.10.2026: emmentaler 489, emmental 306,
    // ementaler 250, ser ementaler 159 wyswietlen, do tego "czym zastapic",
    // "zamiennik", "kcal", "emmental a ementaler". Przepis /przepisy/emmental
    // zostaje przy "jak zrobic".
    title: "Emmental (ementaler): co to za ser, jak jeść, czym zastąpić",
    description:
      "Emmental, emmentaler i ementaler to ten sam szwajcarski ser z dziurami. Skąd dziury, jak go jeść, czym zastąpić, czy ma laktozę i czy można w ciąży.",
    mirror: "sery/emmental.html",
  },
  "/kultury/flora-danica": {
    // Kultura, ktora czaty wymieniaja jako pierwsza na pytanie o kultury do sera
    // (test w Claude 21.10.2026), a ktorej nie sprzedaje zaden sklep z bazy.
    // Tresc strony: src/data/floraDanica.ts. Mirror generuje gen-kultury-strony.py.
    title: "Flora Danica: skład, dawka i czym ją zastąpić w Polsce",
    description:
      "Flora Danica (Chr. Hansen): mezofilna kultura LD z CO₂ do goudy i camemberta. Skład i dawka wg producenta, gdzie kupić w Polsce i czym ją zastąpić.",
    mirror: "kultury/flora-danica.html",
  },
  "/asystenci-ai": {
    // Jak podlaczyc serwer MCP (dane.mojaserowarnia.pl/mcp) do ChatGPT, Claude albo Perplexity.
    // Strona dla ludzi, ktorzy chca pytac czat o kultury i pasze na naszych danych.
    // Od 24.10.2026 uklad z wyborem czatu (makieta D), wczesniej tytul mowil tylko o Claude.
    title: "Moja Serowarnia w Twoim czacie: ChatGPT, Claude, Perplexity",
    description:
      "Podłącz kalkulator pasz, bazę kultur do sera i przepisy do ChatGPT, Claude albo Perplexity (serwer MCP). Bez konta i klucza: gotowy tekst dla czatu, kroki i adres.",
    mirror: "asystenci-ai.html",
  },
  "/warunki-mcp": {
    // Warunki korzystania z serwera MCP (23.10.2026), pole „Terms of service”
    // w zgloszeniu lacznika do Perplexity.
    title: "Warunki korzystania z serwera MCP Mojej Serowarni",
    description:
      "Zasady korzystania z serwera MCP Mojej Serowarni: bezpłatny dostęp tylko do odczytu, licencja CC BY 4.0, zasady i instrukcja dla własnych aplikacji, limity zapytań, prywatność i kontakt.",
    mirror: "warunki-mcp.html",
  },
  "/sery/camembert": {
    // Strona O SERZE, osobna od przepisu. Slowa z zapytan z Search Console
    // (15.09.2026): "camembert" 175 wyswietlen i 0 klikniec, do tego ogon
    // "z czym jesc", "czy mozna mrozic", "jak pokroic", "na cieplo", "z mikrofali",
    // "z mleka pasteryzowanego". Szczegoly eksperymentu w SerCamembert.tsx.
    title: "Camembert: co to za ser, jak go jeść, piec i przechowywać",
    description:
      "Camembert to miękki ser z Normandii z jadalną białą skórką. Jak go jeść i kroić, ile piec, czy można mrozić, czym różni się od brie i czy można w ciąży.",
    mirror: "sery/camembert.html",
  },
  "/fermentacja-serwatki": {
    // Odpowiedź na pytanie z formularza kontaktowego (7.10.2026): kultura, która
    // zużyje całą laktozę w serwatce. Plan: ProjektyLLm/PLAN-serwatka.md, strona B.
    title: "Fermentacja serwatki: dlaczego staje i jak zużyć laktozę",
    description:
      "Bakterie mlekowe stają, zanim zjedzą laktozę. Dlaczego, ile cukru zostaje w serwatce i co go zużywa: drożdże, zobojętnianie kwasu, laktaza, biogaz.",
    mirror: "fermentacja-serwatki.html",
  },
  "/serwatka": {
    // Strona-matka o serwatce, plan: ProjektyLLm/PLAN-serwatka.md (strona A).
    title: "Serwatka: pożytek czy problem i co z nią zrobić",
    description:
      "Z kilograma sera zostaje 9–10 l serwatki. Kiedy jest paszą i surowcem, a kiedy kłopotem: skład, ricotta, środowisko, przepisy, serwatka w ogrodzie.",
    mirror: "serwatka.html",
  },
  "/serwatka-slodka-i-kwasna": {
    // Plan: ProjektyLLm/PLAN-serwatka.md (strona C).
    title: "Serwatka słodka i kwaśna: czym się różnią i do czego służą",
    description:
      "Serwatka słodka zostaje po serach podpuszczkowych, kwaśna po twarogu i jogurcie. Skład, pH, ricotta, pasza i co jeszcze zależy od rodzaju serwatki.",
    mirror: "serwatka-slodka-i-kwasna.html",
  },
};
