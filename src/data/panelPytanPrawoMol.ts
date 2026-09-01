// PLIK GENEROWANY przez scripts/gen-panel-pytan.py - NIE EDYTUJ RECZNIE.
// Zrodlo: data/pytania/prawo-mol.json (tam sie edytuje). Ten sam plik zasila
// mirror, wiec obie warstwy nie moga sie rozjechac.
import type { DanePanelu } from "./panelPytanTypy";

export const panelPytanPrawoMol: DanePanelu = {
  "slug": "prawo-mol",
  "trasaReact": "/prawo/mol",
  "wstep": "Najczęstsze pytania o MOL. Rozwiń to, z którym przyszedłeś — pełne omówienie znajdziesz niżej na stronie.",
  "punkty": [
    {
      "id": "co-to-mol",
      "pytanie": "Co oznacza skrót MOL i czym jest ta działalność?",
      "odpowiedz": "MOL to uproszczona forma produkcji i sprzedaży produktów pochodzenia zwierzęcego, przeznaczona dla małych producentów i rolników. Obejmuje między innymi produkcję serów i innych produktów mlecznych, rozbiór świeżego mięsa, przetwory jajeczne i gotowe posiłki. Działalność opiera się na dwóch rodzajach ograniczeń: tygodniowych limitach wagowych oraz ograniczeniu obszaru sprzedaży do województwa produkcji lub powiatów sąsiednich. Podstawa prawna to rozporządzenie Ministra Rolnictwa i Rozwoju Wsi (Dz. U. 2016 poz. 451).",
      "kotwica": "mol-czym-jest",
      "kotwicaEtykieta": "zobacz szczegóły i podstawę prawną",
      "narzedzia": [
        {
          "etykieta": "porównaj z RHD",
          "url": "/prawo/rhd",
          "zewnetrzna": false
        }
      ]
    },
    {
      "id": "mol-vs-rhd",
      "pytanie": "Czym MOL różni się od RHD — co wybrać?",
      "odpowiedz": "MOL dotyczy wyłącznie produktów pochodzenia zwierzęcego i opiera się na tygodniowych limitach wagowych — dla produktów mlecznych 0,5 tony tygodniowo. RHD jest szersze: obejmuje także produkty roślinne, wymaga własnego surowca z gospodarstwa i opiera się na limicie przychodu 100 000 zł rocznie ze zwolnieniem z PIT. W MOL surowiec nie musi pochodzić z własnego gospodarstwa, w RHD musi — co najmniej jeden składnik, a do zwolnienia podatkowego co najmniej 50% składu. Obie formy wymagają rejestracji u powiatowego lekarza weterynarii z wyprzedzeniem 30 dni, gdy chodzi o produkty zwierzęce.",
      "kotwica": "mol-limity-korzysci",
      "kotwicaEtykieta": "zobacz szczegóły i podstawę prawną",
      "narzedzia": [
        {
          "etykieta": "sprawdź zasady RHD",
          "url": "/prawo/rhd",
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
      "id": "rejestracja",
      "pytanie": "Jak zarejestrować działalność MOL?",
      "odpowiedz": "Należy złożyć wniosek do właściwego powiatowego lekarza weterynarii co najmniej 30 dni przed planowanym rozpoczęciem działalności. Po rozpatrzeniu wniosku otrzymuje się decyzję o wpisie do rejestru zakładów oraz weterynaryjny numer identyfikacyjny (WNI). Dopiero po uzyskaniu decyzji można rozpocząć produkcję. W MOL nie ma odpowiednika zgłoszenia do Sanepidu — nadzór sprawuje wyłącznie Inspekcja Weterynaryjna, ponieważ MOL dotyczy produktów pochodzenia zwierzęcego.",
      "kotwica": "mol-rejestracja",
      "kotwicaEtykieta": "zobacz szczegóły i podstawę prawną",
      "narzedzia": [
        {
          "etykieta": "sprawdź listę wymaganych dokumentów",
          "url": "/prawo/mol/dokumenty",
          "zewnetrzna": false
        }
      ]
    },
    {
      "id": "co-mozna-produkowac",
      "pytanie": "Co można produkować i sprzedawać w ramach MOL?",
      "odpowiedz": "Sery i inne produkty na bazie mleka lub siary, rozbiór świeżego mięsa (wołowego, wieprzowego, baraniego, koziego, końskiego, drobiowego i zajęczaków), surowe wyroby mięsne i mięso mielone, przetworzone produkty jajeczne, a także gotowe posiłki z udziałem produktów pochodzenia zwierzęcego — pod warunkiem że co najmniej jeden składnik pochodzi z zakładu. Dla serowara istotne jest to, że MOL obejmuje wyłącznie produkty pochodzenia zwierzęcego.",
      "kotwica": "mol-co-produkowac",
      "kotwicaEtykieta": "zobacz szczegóły i podstawę prawną",
      "narzedzia": [
        {
          "etykieta": "zobacz, co wolno w RHD",
          "url": "/prawo/rhd",
          "zewnetrzna": false
        }
      ]
    },
    {
      "id": "limit-sera",
      "pytanie": "Jaki jest limit produkcji sera w MOL?",
      "odpowiedz": "Ser należy do produktów mlecznych, więc obowiązuje limit 0,5 tony tygodniowo, czyli 500 kg tygodniowo. To limit dostaw do zakładów handlu detalicznego. Dla porównania: w RHD nie ma limitu ilościowego przy sprzedaży bezpośrednio konsumentowi końcowemu, jest natomiast limit przychodu 100 000 zł rocznie ze zwolnieniem z podatku dochodowego.",
      "kotwica": "mol-limity-korzysci",
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
      "id": "gdzie-sprzedawac",
      "pytanie": "Gdzie wolno sprzedawać produkty z MOL?",
      "odpowiedz": "Obszar sprzedaży jest ograniczony do województwa, w którym prowadzona jest produkcja, albo do powiatów sąsiadujących z tym województwem. Wyjątki dotyczą sprzedaży na targach, festynach i kiermaszach. Sprzedaż może być prowadzona konsumentowi końcowemu, a także do zakładów handlu detalicznego — sklepów i restauracji — z przeznaczeniem dla konsumenta końcowego.",
      "kotwica": "mol-co-produkowac",
      "kotwicaEtykieta": "zobacz szczegóły i podstawę prawną",
      "narzedzia": [
        {
          "etykieta": "sprawdź zasady RHD",
          "url": "/prawo/rhd",
          "zewnetrzna": false
        }
      ]
    }
  ]
};
