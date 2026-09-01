# Panel pytań — dane

Jeden plik JSON na stronę. **To jedyne miejsce, w którym edytuje się treść panelu.**
Z niego powstają obie warstwy:

```
data/pytania/<slug>.json
        │
        ├─► src/data/panelPytan<Slug>.ts   (GENEROWANY — dla komponentu React)
        └─► public/<...>.html              (blok wstrzyknięty między znacznikami + kotwice)
```

Generuje: `python scripts/gen-panel-pytan.py` (idempotentny — można uruchamiać wielokrotnie).
Zdejmuje panel ze statyki: `python scripts/gen-panel-pytan.py --usun`.
Wyłącza panel w aplikacji: `PANEL_PYTAN_WLACZONY = false` w `src/config/panelPytan.ts`.

Dlaczego tak, a nie dwa pliki: na `/prawo/rhd` FAQ w Reakcie miał 11 pytań, a FAQ
w mirrorze 12 — wspólnych było **6**. Te warstwy rozjeżdżają się zawsze, gdy tę samą
treść trzyma się w dwóch miejscach.

## Skąd biorą się pytania

Pytań **nie wymyślamy**. Kolejność pracy przy odświeżaniu listy:

1. **Google Search Console** → Wyniki wyszukiwania → filtr „Strona = <adres>" → eksport
   zapytań (kliknięcia, wyświetlenia, pozycja).
2. **Bing Webmaster Tools** → Search Performance dla tej strony **oraz** raport
   AI Performance (cytowania — pokazuje, o co pytają modele, a nie wyszukiwarka).
3. **Senuto** → frazy i klastry tematyczne dla adresu.

Eksporty kładziemy w `data/pytania/zrodla/` pod nazwami: `gsc-zapytania.csv`,
`gsc-strony.csv`, `bing-zapytania.csv`, `bing-strony.csv`, `senuto-widocznosc.xlsx`.
Potem `python scripts/gen-kandydaci-pytan.py` scala je w klastry intencji i zapisuje
raport `data/pytania/kandydaci-<slug>.md`.

**Katalog `zrodla/` i raport są w `.gitignore` — celowo.** Repo jest publiczne, a to
pełna mapa fraz i ruchu serwisu; w repo zostaje skrypt (żeby analiza była odtwarzalna)
oraz liczby przy wybranych pytaniach (żeby dobór dało się zakwestionować). Surowe
eksporty trzymaj lokalnie.

Dwie pułapki, na które trzeba uważać przy odświeżaniu:

- **Eksport zapytań z GSC dotyczy całej domeny**, nie jednej strony — GSC nie daje
  przekroju zapytanie × strona. Przypisanie do strony robi się po temacie, wzorcami
  w skrypcie. Przeglądaj klaster `inne`: to tam widać, czego wzorce nie złapały.
- **Ta sama fraza bywa z innej branży.** „rhd" to także *right-hand drive* — samo
  „rhd plus" ma 210 wyszukiwań miesięcznie i nie ma nic wspólnego z serem. Skrypt
  odsiewa je listą `OBCE`; przy nowej stronie sprawdź, czy nie trzeba jej rozszerzyć.

Trzy listy scalamy w jedną: warianty tej samej intencji grupujemy w jedno pytanie,
sortujemy po sumie wyświetleń, do panelu bierzemy **5–8** o najwyższym potencjale.
Resztę zostawiamy w pliku z `"wPanelu": false` — nic nie ginie, a promocja pytania
to zmiana jednej flagi.

Format pytania: **pełne pytanie użytkownika**, nie hasło kategorii.
Dobrze: „Ile sera mogę sprzedać w ramach RHD?" · Źle: „Limity".

## Pola

| Pole | Znaczenie |
|---|---|
| `id` | Stabilny identyfikator — **wymiar w GA4**. Nigdy nie zmieniaj po wdrożeniu i nigdy nie używaj numeru pozycji: dane przestaną być porównywalne w czasie. |
| `pytanie` | Treść pytania (nagłówek punktu). |
| `odpowiedz` | 2–5 zdań. **Okienko odpowiada, akapit uzasadnia** — odpowiedź daje wynik, treść strony pod spodem daje podstawę prawną i wyjątki. Jeśli oba mówią to samo innymi słowami, punkt jest źle napisany. |
| `kotwica` | `id` sekcji na tej samej stronie (link typu A). Musi istnieć w **obu** warstwach. |
| `kotwicaReact` | Opcjonalne. Używane tam, gdzie warstwy dzielą treść inaczej (mirror ma osobną sekcję o ewidencji, React trzyma ją wewnątrz sekcji o fakturze). |
| `narzedzia` | Linki typu B. Etykieta **zaczyna się od czasownika** („wystaw fakturę VAT RR"), nie od nazwy narzędzia. `zewnetrzna: true` dla Fermly — w GA4 liczy się osobno, bo u nas jest wyjściem, a u nich ruchem z poleceń. |
| `wPanelu`, `kolejnosc` | Co i w jakiej kolejności trafia do panelu. |
| `dane` | Pochodzenie: `zrodlo`, `wyswietlenia`, `pozycja`. Wypełniane z eksportów — po to, żeby dobór pytań dał się odtworzyć i zakwestionować. |

## Dodanie nowej strony

1. Nowy plik `data/pytania/<slug>.json` (pola `slug`, `trasaReact`, `mirror`, `pytania`).
2. Kotwice mirrora: dopisz nagłówki tej strony do `KOTWICE_MIRRORA` w `scripts/gen-panel-pytan.py`.
3. Kotwice React: nadaj `id` sekcjom w komponencie strony (te same identyfikatory).
4. `python scripts/gen-panel-pytan.py`, potem w komponencie strony osadź
   `<PanelPytan dane={panelPytan<Slug>} />`.

## Uwaga o pomiarze

Mirrory **nie mają GA4** i celowo go nie dostają — to warstwa dla botów, a doklejenie
tam analityki oznaczałoby zgodę na ciasteczka na stronie, która nie ma interfejsu do jej
zebrania. Wszystkie liczby o zachowaniu ludzi pochodzą więc z warstwy React.
