// PLIK GENEROWANY przez scripts/gen-panel-pytan.py - NIE EDYTUJ RECZNIE.
// Zrodlo: data/pytania/prawo-rhd.json (tam sie edytuje). Ten sam plik zasila
// mirror, wiec obie warstwy nie moga sie rozjechac.
import type { DanePanelu } from "./panelPytanTypy";

export const panelPytanPrawoRhd: DanePanelu = {
  "slug": "prawo-rhd",
  "trasaReact": "/prawo/rhd",
  "punkty": [
    {
      "id": "rejestracja",
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
      "id": "kto-moze",
      "pytanie": "Kto może prowadzić RHD — czy trzeba być rolnikiem?",
      "odpowiedz": "RHD może prowadzić rolnik posiadający gospodarstwo rodzinne lub inny rolniczy podmiot, który posiada własny surowiec z hodowli, chowu lub uprawy. Wymagane jest, aby co najmniej jeden składnik produktu pochodził z własnego gospodarstwa.",
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
      "id": "zgloszenie-us",
      "pytanie": "Czy RHD trzeba zgłaszać do urzędu skarbowego?",
      "odpowiedz": "Zasadniczo nie. Startując RHD zgłaszasz się tylko do powiatowego lekarza weterynarii (produkty zwierzęce i złożone) lub do Sanepidu (produkty roślinne). Dopóki przychód nie przekroczy 100 000 zł rocznie, jest zwolniony z podatku dochodowego — nie zgłaszasz nic do urzędu skarbowego ani nie składasz deklaracji. Dopiero po przekroczeniu 100 000 zł kontaktujesz się z US i możesz wybrać opodatkowanie nadwyżki ryczałtem 2%.",
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
      "id": "ewidencja",
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
          "etykieta": "zobacz wzór ewidencji",
          "url": "/system-ewidencji",
          "zewnetrzna": false
        }
      ]
    },
    {
      "id": "vs-sprzedaz-bezposrednia",
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
      "id": "kasa-faktura",
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
      "id": "co-mozna-sprzedawac",
      "pytanie": "Czy mogę sprzedawać sery własnej produkcji w ramach RHD?",
      "odpowiedz": "W RHD można sprzedawać produkty pochodzenia roślinnego (warzywa, owoce, przetwory), produkty mleczne (sery, jogurty, masło), produkty mięsne, jaja, miód oraz produkty złożone, pod warunkiem że zawierają składnik z własnego gospodarstwa.",
      "kotwica": "rhd-zakres-sprzedazy",
      "kotwicaEtykieta": "zobacz szczegóły i podstawę prawną",
      "narzedzia": [
        {
          "etykieta": "wygeneruj etykietę dla swojego sera",
          "url": "/etykieta-rhd",
          "zewnetrzna": false
        }
      ]
    }
  ]
};
