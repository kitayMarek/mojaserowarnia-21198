// PLIK GENEROWANY przez scripts/gen-panel-pytan.py - NIE EDYTUJ RECZNIE.
// Zrodlo: data/pytania/prawo-rhd.json (tam sie edytuje). Ten sam plik zasila
// mirror, wiec obie warstwy nie moga sie rozjechac.
import type { DanePanelu } from "./panelPytanTypy";

export const panelPytanPrawoRhd: DanePanelu = {
  "slug": "prawo-rhd",
  "trasaReact": "/prawo/rhd",
  "punkty": [
    {
      "id": "limit-przychodu",
      "pytanie": "Jaki jest limit przychodu w RHD?",
      "odpowiedz": "Limit wynosi 100 000 zł przychodu rocznie — do tej kwoty przychód z rolniczego handlu detalicznego jest zwolniony z podatku dochodowego (PIT). Przed 2022 rokiem limit wynosił około 40 000 zł. Limit dotyczy podatnika (osoby fizycznej), a nie gospodarstwa: jeśli sprzedaż prowadzą małżonkowie osobno zarejestrowani w RHD, każde ma własny limit 100 000 zł, ale wymaga to odrębnych rejestracji weterynaryjnych i odrębnych ewidencji.",
      "kotwica": "rhd-limity-podatki",
      "kotwicaEtykieta": "zobacz szczegóły i podstawę prawną",
      "narzedzia": [
        {
          "etykieta": "policz koszt produkcji swojego sera",
          "url": "/kalkulator-kosztu-sera",
          "zewnetrzna": false
        },
        {
          "etykieta": "prowadź ewidencję sprzedaży w Fermly",
          "url": "https://fermly.pl/mleko/rhd",
          "zewnetrzna": true
        }
      ]
    },
    {
      "id": "ryczalt-po-przekroczeniu",
      "pytanie": "Jak opodatkowany jest RHD po przekroczeniu 100 000 zł?",
      "odpowiedz": "Nadwyżkę ponad 100 000 zł można opodatkować ryczałtem 2% od przychodu — to opcja, nie obowiązek, zwykle znacznie korzystniejsza niż skala podatkowa 12% lub 32% od dochodu. Wybór ryczałtu zgłasza się pisemnym oświadczeniem do naczelnika urzędu skarbowego do 20. dnia miesiąca następującego po miesiącu pierwszego przychodu (lub do końca roku, jeśli pierwszy przychód był w grudniu). Oświadczenia nie trzeba ponawiać w kolejnych latach. Rozliczenie roczne składa się na formularzu PIT-28 między 15 lutego a 30 kwietnia następnego roku.",
      "kotwica": "rhd-limity-podatki",
      "kotwicaEtykieta": "zobacz szczegóły i podstawę prawną",
      "narzedzia": [
        {
          "etykieta": "policz koszt produkcji swojego sera",
          "url": "/kalkulator-kosztu-sera",
          "zewnetrzna": false
        }
      ]
    },
    {
      "id": "gdzie-rejestracja",
      "pytanie": "Gdzie i kiedy zarejestrować działalność RHD?",
      "odpowiedz": "To zależy od rodzaju żywności. Dla produktów wyłącznie roślinnych (dżemy, soki, pieczywo) — zgłoszenie do powiatowej stacji sanitarno-epidemiologicznej (Sanepid) co najmniej 14 dni przed rozpoczęciem działalności. Dla żywności pochodzenia zwierzęcego lub złożonej, w tym serów — wniosek do powiatowego lekarza weterynarii co najmniej 30 dni przed rozpoczęciem. Ser jest produktem pochodzenia zwierzęcego, więc serowar zgłasza się do powiatowego lekarza weterynarii.",
      "kotwica": "rhd-rejestracja",
      "kotwicaEtykieta": "zobacz szczegóły i podstawę prawną",
      "narzedzia": [
        {
          "etykieta": "sprawdź listę wymaganych dokumentów",
          "url": "/prawo/rhd/dokumenty",
          "zewnetrzna": false
        }
      ]
    },
    {
      "id": "wlasny-surowiec",
      "pytanie": "Ile własnego surowca musi być w produkcie RHD?",
      "odpowiedz": "Obowiązują dwa różne progi i to najczęstsza pułapka. Do celów sanitarnych wystarczy, że co najmniej jeden składnik pochodzi z własnego gospodarstwa (a przy produkcie jednoskładnikowym, jak mleko czy jaja — ten składnik w całości). Natomiast do zwolnienia z podatku dochodowego własny surowiec musi stanowić co najmniej 50% składu produktu, nie licząc wody. Produkt z jednym symbolicznym własnym dodatkiem mieści się w RHD sanitarnie, ale wypada ze zwolnienia z PIT.",
      "kotwica": "rhd-kto-moze",
      "kotwicaEtykieta": "zobacz szczegóły i podstawę prawną",
      "narzedzia": [
        {
          "etykieta": "sprawdź, czy MOL pasuje do Ciebie lepiej",
          "url": "/prawo/mol",
          "zewnetrzna": false
        }
      ]
    },
    {
      "id": "rhd-vs-sprzedaz-bezposrednia",
      "pytanie": "Czym różni się RHD od sprzedaży bezpośredniej?",
      "odpowiedz": "Granicą jest przetworzenie produktu. Sprzedaż bezpośrednia obejmuje wyłącznie produkty nieprzetworzone z własnego gospodarstwa: surowe mleko, jaja, miód, warzywa, owoce — i podlega limitom ilościowym, na przykład do 1000 litrów surowego mleka tygodniowo. RHD pozwala sprzedawać także produkty przetworzone, w tym sery i wędliny. Ser sprzedasz więc wyłącznie w ramach RHD, a surowe mleko lub jaja — w obu formach. Obie formy można prowadzić jednocześnie, ale każda wymaga osobnej rejestracji.",
      "kotwica": "rhd-a-sprzedaz-bezposrednia",
      "kotwicaEtykieta": "zobacz szczegóły i podstawę prawną",
      "narzedzia": [
        {
          "etykieta": "porównaj RHD z MOL",
          "url": "/prawo/mol",
          "zewnetrzna": false
        }
      ]
    },
    {
      "id": "kasa-fiskalna",
      "pytanie": "Czy w RHD potrzebna jest kasa fiskalna?",
      "odpowiedz": "Nie. Rolnik ryczałtowy prowadzący RHD jest zwolniony z obowiązku posiadania kasy fiskalnej niezależnie od kwoty obrotu. To zwolnienie przedmiotowe, szersze niż ogólny limit 20 000 zł. Podstawa: rozporządzenie Ministra Finansów z 17 grudnia 2024 r. (Dz.U. 2024 poz. 1902), pozycja 49 załącznika; obowiązuje do 31 grudnia 2027 r. Kasa staje się obowiązkowa dopiero wtedy, gdy rolnik zrezygnuje ze statusu rolnika ryczałtowego i zarejestruje się jako czynny podatnik VAT.",
      "kotwica": "rhd-faktura-paragon-kasa",
      "kotwicaEtykieta": "zobacz szczegóły i podstawę prawną",
      "narzedzia": [
        {
          "etykieta": "wystaw fakturę VAT RR",
          "url": "/faktura-vat-rr",
          "zewnetrzna": false
        }
      ]
    },
    {
      "id": "ewidencja-sprzedazy",
      "pytanie": "Co musi zawierać ewidencja sprzedaży w RHD?",
      "odpowiedz": "Ewidencja sprzedaży to jedyny obowiązkowy dokument wewnętrzny w RHD. Każdy wpis musi zawierać: numer kolejnego wpisu, datę uzyskania przychodu, kwotę przychodu z transakcji lub dnia, przychód narastająco od początku roku (licznik limitu 100 000 zł) oraz rodzaj i ilość przetworzonych produktów. Dzienne przychody ewidencjonuje się w dniu sprzedaży, nie z pamięci po tygodniu. Ewidencję prowadzi się odrębnie za każdy rok podatkowy i przechowuje przez 2 lata — może ją sprawdzić kontrola skarbowa lub IJHARS.",
      "kotwica": "rhd-faktura-paragon-kasa",
      "kotwicaEtykieta": "zobacz szczegóły i podstawę prawną",
      "narzedzia": [
        {
          "etykieta": "prowadź ewidencję sprzedaży w Fermly",
          "url": "https://fermly.pl/mleko/rhd",
          "zewnetrzna": true
        },
        {
          "etykieta": "wygeneruj etykietę dla swojego sera",
          "url": "/etykieta-rhd",
          "zewnetrzna": false
        }
      ]
    },
    {
      "id": "faktura-vat-rr",
      "pytanie": "Czy przy sprzedaży sera do sklepu dostanę fakturę VAT RR z 7% zwrotem?",
      "odpowiedz": "Tak. Gdy sprzedajesz produkty czynnemu podatnikowi VAT (sklepowi, restauracji, hurtowni), to nabywca wystawia fakturę VAT RR na podstawie art. 116 ust. 1 ustawy o VAT i dolicza 7% zryczałtowanego zwrotu podatku do ceny netto. Przy sprzedaży za 1000 zł netto otrzymujesz 1070 zł. Przetworzone produkty RHD, w tym ser, są produktami rolnymi w rozumieniu art. 2 pkt 20 ustawy o VAT, który odsyła do art. 20 ust. 1c ustawy o PIT dotyczącego RHD. Warunki: zapłata przelewem na rachunek bankowy (gotówka wyklucza odliczenie u nabywcy), numer i data faktury w tytule przelewu, Twoje oświadczenie o statusie rolnika ryczałtowego, podpisy obu stron i archiwizacja przez minimum 5 lat.",
      "kotwica": "rhd-faktura-vat-rr",
      "kotwicaEtykieta": "zobacz szczegóły i podstawę prawną",
      "narzedzia": [
        {
          "etykieta": "wystaw fakturę VAT RR",
          "url": "/faktura-vat-rr",
          "zewnetrzna": false
        }
      ]
    }
  ]
};
