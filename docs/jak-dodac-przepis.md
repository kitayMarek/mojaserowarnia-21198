# Jak dodać przepis do mojaserowarni — SPEC v2

> Następca „SZABLONU v16" (`instrukcja_llm_mojasero`). Tamten celował w samodzielne pliki
> HTML z linkami `desktop.html?search=` (martwe). Dziś przepis to **dane**, z których
> generatory robią trzy wyjścia. Zachowujemy mądrość v16 (szczegółowe, ustrukturyzowane
> kroki + dobór kultur wg mikroflory), porzucamy nieaktualną mechanikę.

## Architektura: jedno źródło → trzy wyjścia
**Źródło prawdy:** `src/data/recipesData.ts` (pole `id` = stały slug, NIE zmieniać — to klucz URL/DB/kontraktu).

Z niego generujemy:
1. **Statyczna strona** `public/przepisy/<slug>.html` — `scripts/gen-przepisy.py` (Recipe+FAQPage JSON-LD, dla botów/GEO). 6 serów napisano ręcznie, 14 generowanych.
2. **SPA** — komponent przepisu czyta `recipesData.ts`.
3. **`index.json`** — `scripts/gen-przepisy-json.py` (kontrakt v2 dla fermly.pl, READ produkcji) + **`przepisy.summary.txt`** — `gen-przepisy-summary.py` (lekki indeks slug→ser).

**Po każdej regeneracji statyk** odpal post-procesory: `link-slownik.py` (linki do słownika) + `add-dates.py` (datePublished/dateModified).

## 1. Kroki — SEDNO (mądrość v16, zachowana)
Każdy krok = `{ title, content, tip }`. W treści ZAWSZE podaj:
- **temperaturę docelową, czas, cel/konsystencję** etapu,
- **sensorykę** („czyste pęknięcie skrzepu", „ziarno sprężyste, piszczy w zębach"),
- **co się stanie, gdy etap przeciągniesz/skrócisz**, oraz zależności (mycie ziarna → niższa kwasowość; wyższa temp → szybsza synereza).

Minimalny zestaw etapów (dostosuj nazwy): zakwaszenie → koagulacja (czas „czystego pęknięcia") → cięcie (wielkość ziarna mm) → obróbka ziarna (grzanie/mycie: ile serwatki odlać, temp wody, tempo) → konsolidacja/odciek → formowanie/prasowanie (cykle kg + min/h) → solenie (czas/masa, stężenie) → dojrzewanie (temp, RH, pielęgnacja). Sery specjalne: dodaj etap (propionowe „oczkowanie" 20–24 °C 1–2 tyg.; pleśń biała/niebieska — natrysk/nakłuwanie).

> **🎯 Rekomendowany upgrade (rozwiązuje fazę 3b u korzenia):** rozszerzyć typ kroku o
> opcjonalne pola liczbowe `temperaturaC / czasMin / pH / warunekKonca`. Wtedy
> `gen-przepisy-json.py` **czyta liczby wprost** (zamiast kruchego parsowania z tekstu —
> które myli np. caciotta „aging" 52-55 °C). Stare przepisy: fallback do parsowania.
> To czyni timery Fermly dokładnymi natywnie. Zrobić, gdy ruszymy robotę na przepisach
> (skoordynować z fazą prac Fermly).

## 2. Kultury i zamienniki (domena v16 — zachować)
- **Dobieraj zamienniki wg MIKROFLORY** (profil bakterii: *Lc. lactis lactis/cremoris, biovar diacetylactis, Leuconostoc, Propionibacterium*…), nie wg nazwy handlowej.
- **Oznacz brak składnika** (np. brak *Leuconostoc*) → „⚠️ wymaga dodatku" + podpowiedź (np. SH LYO 10–20% dawki).
- **Dywersyfikuj sklepy** — min. 1 produkt z każdego z bazy, o ile sensowne: Serowar.pl, Artiser.pl, Lactic.pl, GAP Poland, Wańczykówka.
- **Linkuj do AKTUALNYCH zasobów** (NIE `desktop.html?search=` — martwe):
  - `/kultury/baza.html` (pełna statyczna baza 147), `/baza-kultur` (SPA z filtrami), słownik `/slownik.html#<termin>`.
  - Źródło prawdy nazw/dawek kultur: `public/kultury.summary.txt` + `culturesDataComplete.ts`.
- Ceny orientacyjne + stopka „Ceny mogą się zmieniać".

## 3. Problemy + FAQ
- **Tabela problemów** (3–5): Problem | Przyczyna | Co zrobić.
- **FAQ** praktyczne („woskować?", „tłustość mleka?", „różnice stylu A/B") — 1–3 zdania. Trafia do **FAQPage JSON-LD** (rich results + GEO).

## 4. GEO (obowiązkowe dziś — nie było w v16)
- **Recipe + FAQPage JSON-LD** (statyk).
- **`<title>` ≤ ~60 zn.**, **`meta description` 150–160 zn.** (uwaga: escape encji HTML zawyża długość — licz po escape).
- **`datePublished` + `dateModified`** (robi `add-dates.py`).
- **Self-canonical**, slug stabilny.

## 5. Metadane fasetowe — kategoria / mleko / trudność (BRIEF #9, filtr serów w Fermly)
Wystawiane w `index.json` przez `gen-przepisy-json.py`; **mapy domenowe trzymamy W GENERATORZE**
(`DIFF_MAP`, `MILK_TYPES`, `CATEGORY`), nie w `recipesData.ts`. **Dodając nowy ser — dopisz go do `MILK_TYPES` i `CATEGORY`.**

- **`trudnosc`** — z `recipe.difficulty` (nasza skala 3-poziomowa): `Łatwy→latwy`, `Średni→sredni`, `Zaawansowany→zaawansowany`. Nic nie dopisujesz, byle `difficulty` było ustawione.
- **`mleko.typy`** (tablica) — WSZYSTKIE wykonalne mleka, żeby ser pojawił się pod każdą facetą. **NIE „mieszane"** — feta kozia i feta owcza to ta sama receptura w dwóch pozycjach (`["owcze","kozie"]`). Dopuszcza alternatywę („można użyć krowiego")? → dodaj `krowie`. `[0]` = wiodące/tradycyjne (→ `mleko.typ`).
- **`kategoria`** (faseta RODZAJ) — `miekki | twardy | plesniowy | swiezy | inne` (zasady Marka, 2026-06-20):
  - **miekki** = feta / twaróg (miękkie, solankowe-cured) — **NIE** caciotta;
  - **twardy** = prasowane/dojrzewające — **w tym PÓŁTWARDE na razie** (gouda, caciotta, asiago…);
  - **swiezy** = świeże nieukwaszone (mozzarella, ricotta, mascarpone);
  - **plesniowy** = biała/niebieska pleśń (camembert, brie, gorgonzola, roquefort, stilton);
  - **inne** = nietypowe (halloumi — półtwardy solankowy do grillowania).
  - 🔭 **Planowane:** osobny kubełek **`poltwardy`** (gouda/caciotta/asiago/halloumi tam trafią). Na razie „nie mieszamy" — siedzą w `twardy`/`inne`. Przy wprowadzaniu: uzgodnić enum z Fermly + przemapować.

## 6. Pipeline po dodaniu
1. Dane → `recipesData.ts`.
2. `python scripts/gen-przepisy.py` (jeśli generowany) — lub ręczna statyk wg wzoru istniejących.
3. `python scripts/link-slownik.py --apply` (linki do słownika).
4. `python scripts/add-dates.py --apply` (daty).
5. Dopisz nowy ser do map `MILK_TYPES` i `CATEGORY` w `gen-przepisy-json.py` (§5), potem `python scripts/gen-przepisy-summary.py` + `python scripts/gen-przepisy-json.py` (kontrakty dla Fermly).
6. Dopisz slug do `sitemap.xml`, `llms.txt`, mapy `<noscript>` w `index.html`.
7. FTP upload zmienionych plików (statyki bez przebudowy; `index.html` → build + `dist/index.html`).

## Checklista przed oddaniem
- [ ] `id`/slug stabilny; w sitemap + llms + noscript.
- [ ] Każdy krok ma: temperaturę, czas, cel, sensorykę, „co jak za długo/krótko".
- [ ] Zamienniki wg mikroflory + dywersyfikacja sklepów + **linki aktualne** (nie desktop.html).
- [ ] Recipe+FAQPage JSON-LD; `meta description` ≤160; daty; `title` ≤60.
- [ ] `index.json` i `summary.txt` regenerują się bez błędu (kontrakt Fermly v2).
- [ ] Nowy ser dopisany do `MILK_TYPES` + `CATEGORY` (§5) — `trudnosc`/`mleko.typy`/`kategoria` nie są `null`.
- [ ] `link-slownik.py` + `add-dates.py` odpalone; deploy zweryfikowany (200) na żywo.

---
*Wiedza domenowa: SZABLON v16 (`instrukcja_llm_mojasero`, Marek). Zmodernizowano pod architekturę danych + integrację z fermly.pl. Wersja 2 — 2026-06-19.*
