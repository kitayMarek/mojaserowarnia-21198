import asiagoImage from "@/assets/asiago.jpg";
import dunlopImage from "@/assets/dunlop.jpg";
import fetaBulgarskaImage from "@/assets/feta-bulgarska.jpg";
import yorkshireImage from "@/assets/yorkshire.webp";
import caciottaImage from "@/assets/caciotta-miniatura.webp";
import caciottaMiniaturaImage from "@/assets/caciotta-miniatura.webp";
import goudaImage from "@/assets/gouda-miniatura.webp";
import goudaMiniaturaImage from "@/assets/gouda-miniatura.webp";
import cheddarImage from "@/assets/cheddar.jpg";
import mozzarellaImage from "@/assets/mozzarella.jpg";
import camembertImage from "@/assets/camembert-miniatura.webp";
import camembertMiniaturaImage from "@/assets/camembert-miniatura.webp";
import halloumiImage from "@/assets/halloumi.webp";
import brieImage from "@/assets/brie.jpg";
import parmezanImage from "@/assets/parmezan.jpg";
import ricottaImage from "@/assets/ricotta.webp";
import mascarponeImage from "@/assets/mascarpone.jpg";
import fetaGreckaImage from "@/assets/feta-grecka.jpg";
import gorgonzolaImage from "@/assets/gorgonzola.webp";
import roquefortImage from "@/assets/roquefort.jpg";
import stiltonImage from "@/assets/stilton.jpg";
import gruyereImage from "@/assets/gruyere.jpg";
import emmentalImage from "@/assets/emmental.jpg";
import emmentalerMiniaturaImage from "@/assets/emmentaler-miniatura.webp";
import korycinskiImage from "@/assets/korycinski.webp";
import korycinMiniaturaImage from "@/assets/korycin-miniatura.webp";
import quartiroloImage from "@/assets/quartirolo.jpg";
import limburskiImage from "@/assets/limburski.jpg";
import topionyImage from "@/assets/topiony.jpg";
import twarogImage from "@/assets/twarog.webp";

export interface CultureSubstitute {
  name: string;
  type: string;
  shop: string;
  dosage: string;
  notes: string;
  searchQuery: string; // Query to use for /baza-kultur?q=
}

export interface RecipeStep {
  title: string;
  content: string;
  tip?: string;
  warning?: string;
}

export interface NutritionInfo {
  servingSize: string;
  calories: number;
  fatContent: number;
  saturatedFatContent: number;
  proteinContent: number;
  carbohydrateContent: number;
  sodiumContent: number;
  calciumContent: number;
}

export interface Recipe {
  id: string;
  name: string;
  difficulty: "Łatwy" | "Średni" | "Zaawansowany";
  description: string;
  yield: string;
  ageTime: string;
  image: string;
  
  // Przepis
  milkBase: string;
  starter: string;
  coagulant: string;
  salting: string;
  aging: string;
  
  // Kultury i zamienniki
  cultureSubstitutes: CultureSubstitute[];
  
  // Dawkowanie
  dosageReference: string;
  dosageTable: {
    ingredient: string;
    amount: string;
    notes: string;
  }[];
  
  // Kroki
  steps: RecipeStep[];
  
  // Uwagi
  notes?: {
    tips: string[];
    warnings: string[];
    variants: string[];
  };
  
  // Profil smakowy
  flavor?: {
    taste: string;
    texture: string;
    color: string;
    aroma: string;
  };
  
  // Wartości odżywcze
  nutrition?: NutritionInfo;

  // Do czego uzywac tego sera w kuchni.
  // Powod: Google klasyfikuje "[jedzenie] przepis" jako intencje KULINARNA, bo
  // tak wyglada wiekszosc zapytan w sieci. Dla "ser ricotta przepis" pokazuje
  // dania Z ricotta, a nie sposob jej zrobienia — stad pozycja 17 mimo dobrej
  // tresci. Zamiast walczyc z ta klasyfikacja, odpowiadamy na obie intencje na
  // jednej stronie: jak zrobic ORAZ co z tym zrobic.
  zastosowanie?: string;

  // Sekcja encyklopedyczna: pary pytanie-odpowiedz pokazywane NAD przepisem.
  // Powod: ludzie wpisujacy "ser gruyere" szukaja informacji O SERZE, a strona
  // odpowiadala wylacznie "jak go zrobic" — stad wysokie wyswietlenia przy
  // pozycjach 16-20. Te same pary zasilaja schema FAQPage.
  encyklopedia?: {
    pytanie: string;
    odpowiedz: string;
  }[];

  // Film instruktażowy (opcjonalny). Filmy cudze — stąd channel, żeby autor był
  // zawsze widoczny. NIE dodajemy do nich VideoObject w JSON-LD: ta schema
  // deklaruje, że film jest treścią naszej strony, a on nie jest nasz.
  video?: {
    youtubeId: string;
    title: string;
    channel: string;
    /** Wlasna miniatura pod przycisk odtwarzania. Bez niej tlem jest zdjecie sera. */
    poster?: string;
  };
}

export const recipesData: Recipe[] = [
  {
    id: "korycinski",
    zastosowanie: "Ser stołowy — na kanapki i na deskę, najlepiej z pieczywem na zakwasie i miodem. Wersja z czarnuszką lub ziołami dobrze wypada zapiekana na grzankach. Leżakowany kilka tygodni nabiera wyrazistości i można go trzeć na pierogi lub zapiekanki.",
    video: { youtubeId: "xxT1Okh3sp0", title: "Ser koryciński w domu/ homemade cheese", channel: "Domowy ser", poster: korycinMiniaturaImage },
    name: "Ser Koryciński Swojski",
    difficulty: "Łatwy",
    description: "Ser Koryciński Swojski to polski ser podpuszczkowy z Podlasia (gminy Korycin, Suchowola, Janów) z Chronionym Oznaczeniem Geograficznym (ChOG od 2012 r., tradycja od 2005 r.). Formowany w koszykach krąg o karbowanej powierzchni i drobnych oczkach, z mleka krowiego, często z czarnuszką lub ziołami. Smak łagodny i śmietankowy, z czasem bardziej wyrazisty i lekko pikantny; barwa kremowożółta, konsystencja elastyczna i gąbczasta. Jedzony świeży lub leżakowany.",
    yield: "≈ 1,2–1,5 kg z 10 L mleka (tradycyjny krąg: 2,5–5 kg)",
    ageTime: "Świeży: 1–2 dni · leżakowany: 2–6 tygodni",
    image: korycinskiImage,

    milkBase: "≈ 10 L mleka pełnego krowiego (tradycyjnie surowego od zaufanego źródła; przy pasteryzowanym dodaj CaCl₂). Z mleka surowego dojrzewaj min. 60 dni.",
    starter: "Kultura mezofilna (np. MA 4001 / Flora Danica) — wg producenta. Tradycyjnie ser ścinano samą podpuszczką; kultura daje łagodny profil i drobne oczka.",
    coagulant: "Płynna podpuszczka single-strength; ~2,5 ml (~1/2 tsp) na 10 L mleka. Czas krzepnięcia 35–45 min.",
    salting: "Solanka 18–20%, ~2–3 h na każdy kilogram sera (lub solenie w masie).",
    aging: "Świeży od ręki; leżakowany 2–6 tyg. w 12–14 °C i 80–85% RH, obracać co 1–2 dni. Z mleka surowego min. 60 dni.",

    cultureSubstitutes: [
      {
        name: "MA 4001 / MA 4002 (Choozit MA)",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "wg producenta (~1/8 tsp na 10 L)",
        notes: "Klasyczna mezofilna — łagodny, lekko maślany profil.",
        searchQuery: "MA 4001"
      },
      {
        name: "Flora Danica",
        type: "mezofilna (z Leuconostoc)",
        shop: "Artiser.pl",
        dosage: "wg producenta",
        notes: "Mezofilna z bakteriami gazotwórczymi (Leuconostoc) — wspiera drobne oczka.",
        searchQuery: "Flora Danica"
      },
      {
        name: "MM 100 / MM 101",
        type: "mezofilna",
        shop: "Lactic.pl",
        dosage: "wg producenta",
        notes: "Mezofilny starter do serów podpuszczkowych półtwardych.",
        searchQuery: "MM 100"
      },
      {
        name: "MESO / kultura mezofilna",
        type: "mezofilna",
        shop: "GAP Poland",
        dosage: "wg producenta",
        notes: "Uniwersalny starter mezofilny do serów zagrodowych.",
        searchQuery: "mezofilna"
      }
    ],

    dosageReference: "Odniesienie: kultura mezofilna wg producenta + ~2,5 ml podpuszczki na 10 L mleka; czarnuszka 1–2 łyżki na krąg.",
    dosageTable: [
      { ingredient: "Mleko krowie pełne", amount: "≈ 10 L", notes: "Surowe lub pasteryzowane (+ CaCl₂)" },
      { ingredient: "Kultura mezofilna", amount: "wg producenta", notes: "np. MA 4001 / Flora Danica" },
      { ingredient: "Podpuszczka płynna", amount: "~2,5 ml (~1/2 tsp)", notes: "Single strength; krzepnięcie 35–45 min" },
      { ingredient: "Chlorek wapnia (CaCl₂)", amount: "wg producenta", notes: "Tylko dla mleka pasteryzowanego" },
      { ingredient: "Czarnuszka / zioła", amount: "1–2 łyżki na krąg", notes: "Wmieszać do ziarna (opcjonalnie)" },
      { ingredient: "Sól (solanka)", amount: "~2–3 h na kg sera", notes: "Solanka 18–20%" }
    ],

    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie 32 °C ~45 min",
        content: "Podgrzej mleko krowie do 32 °C. Zaszczep kulturą mezofilną (wg producenta), wymieszaj i odstaw na 45 min, by mleko lekko się zakwasiło.",
        tip: "Tradycyjnie Koryciński ścinano samą podpuszczką; kultura mezofilna daje łagodny, lekko kwaskowy profil i charakterystyczne drobne oczka."
      },
      {
        title: "2) Dodanie podpuszczki ~35–45 min do czystego rozłamu",
        content: "Rozpuść podpuszczkę w odrobinie chłodnej przegotowanej wody i wmieszaj ruchem góra-dół przez ~1 min. Odstaw bez ruszania, aż powstanie zwarty skrzep dający czysty rozłam (35–45 min).",
        tip: "Test: wsuń nóż pod skrzep i unieś — pęka czysto, a serwatka jest klarowna. Wtedy można kroić."
      },
      {
        title: "3) Krojenie skrzepu ~1,5 cm",
        content: "Potnij skrzep w kratę na ziarno ~1,5 cm. Odczekaj 5 min, potem delikatnie mieszaj 10–15 min, aż ziarno obeschnie i się wzmocni.",
        warning: "Tnij i mieszaj delikatnie — zbyt ostre traktowanie wyciśnie tłuszcz i da twardy, suchy ser."
      },
      {
        title: "4) Lekkie dogrzanie 36–38 °C ~20 min",
        content: "Powoli (ok. 1 °C co 2–3 min) dogrzej ziarno do 36–38 °C, delikatnie mieszając. Trzymaj ~10 min, aż ziarno będzie sprężyste i piszczy w zębach.",
        tip: "Wyższa temperatura = jędrniejsze, elastyczne ziarno i wyraźniejsze oczka. Na świeży, miękki Koryciński możesz pominąć dogrzewanie."
      },
      {
        title: "5) Dodatki — czarnuszka i zioła",
        content: "Odlej część serwatki do poziomu ziarna. Wmieszaj ulubione dodatki: czarnuszkę, suszone zioła, czosnek lub paprykę (1–2 łyżki na krąg).",
        tip: "Czarnuszka to klasyka Korycińskiego — daje charakterystyczny wygląd i lekko orzechowo-pieprzny akcent."
      },
      {
        title: "6) Formowanie w koszyku — karbowany wzór",
        content: "Przełóż ziarno do koszyka lub cedzaka (stąd charakterystyczny karbowany wzór kręgu). Odciekaj 2–3 h w temperaturze pokojowej, obracając ser co 30–45 min dla równej formy.",
        tip: "Tradycyjny krąg waży 2,5–5 kg i ma do 30 cm średnicy — w domu rób mniejszy, z 10 L mleka wyjdzie ok. 1,2–1,5 kg."
      },
      {
        title: "7) Solenie w solance",
        content: "Sól w solance 18–20% przez ~2–3 h na każdy kilogram sera (albo natrzyj solą w masie). Po soleniu osusz powierzchnię.",
        tip: "Solanka: ~200 g soli na 1 L wody; łyżka octu i odrobina CaCl₂ pomagają wyrobić zdrową skórkę."
      },
      {
        title: "8) Świeży albo leżakowany",
        content: "Świeży Koryciński jest gotowy do jedzenia po odcieknięciu i posoleniu (1–2 dni w lodówce). Na ser leżakowany/dojrzały trzymaj go 2–6 tygodni w 12–14 °C i 80–85% wilgotności, obracając co 1–2 dni.",
        warning: "Z mleka surowego dojrzewaj minimum 60 dni lub użyj mleka pasteryzowanego — ze względów bezpieczeństwa."
      }
    ],

    notes: {
      tips: [
        "Czarnuszka, czosnek niedźwiedzi, papryka, suszone pomidory lub zioła prowansalskie — wmieszaj do ziarna przed formowaniem.",
        "Koszyk/cedzak nadaje charakterystyczny karbowany wzór — to znak rozpoznawczy kręgu."
      ],
      warnings: [
        "Surowe mleko: dojrzewaj min. 60 dni albo pasteryzuj — kwestia bezpieczeństwa żywności.",
        "Nazwa 'Ser Koryciński Swojski' jest chroniona (ChOG) — w sprzedaży używaj jej tylko zgodnie z przepisami; w domu rób ser typu koryciński."
      ],
      variants: [
        "Świeży (1–2 dni) — łagodny, śmietankowy.",
        "Leżakowany / dojrzały (2–6 tyg.) — wyrazisty, lekko pikantny, ciemniejsza barwa.",
        "Tradycyjnie dojrzewany w chłodnej piwnicy na słomie żytniej."
      ]
    },

    flavor: {
      taste: "Łagodny, śmietankowy; z dojrzewaniem bardziej wyrazisty i lekko pikantny",
      texture: "Elastyczna, gąbczasta, z drobnymi oczkami",
      color: "Kremowożółta, ciemniejąca z czasem",
      aroma: "Świeży, mleczny, z nutą czarnuszki lub ziół"
    },

    nutrition: {
      servingSize: "100 g",
      calories: 330,
      fatContent: 26,
      saturatedFatContent: 17,
      proteinContent: 22,
      carbohydrateContent: 1,
      sodiumContent: 600,
      calciumContent: 700
    }
  },
  {
    id: "asiago",
    zastosowanie: "Młode Asiago dolce jest łagodne i topi się gładko — do kanapek, zapiekanek i na pizzę. Dojrzałe Asiago d'allevo trze się jak parmezan na makaron, risotto i zupy. W północnych Włoszech dodaje się je do polenty i do farszu z ziemniakami.",
    name: "Asiago",
    difficulty: "Średni",
    description: "Asiago to tradycyjny ser alpejski z regionu Veneto we Włoszech. Młody Asiago dolce (świeży) ma delikatny, słodkawy smak z aromatem przypominającym jogurt i masło. Tekstura jest miękka i elastyczna, a jasna barwa odzwierciedla krótki okres dojrzewania. Smak jest słodki, z jasną, młodzieńczą jakością.",
    yield: "≈ 2,7 kg z 22,7 L mleka",
    ageTime: "30–40 dni (młode Asiago dolce)",
    image: asiagoImage,
    
    milkBase: "≈ 22,7 L mleka pełnego (nie UHT; przy pasteryzowanym dodaj CaCl₂ wg producenta). Opcjonalnie dodaj śmietankę dla bogatszego smaku.",
    starter: "Typ: kultura termofilna (TA-61 lub C201) + kultura Helveticus (LH-100) dla słodkiej nuty (zamienniki z tabeli poniżej).",
    coagulant: "Płynna podpuszczka single-strength; ok. 5 ml (~1 tsp) na 22,7 L mleka.",
    salting: "Solanka nasycona - 3 godziny na każdy kilogram sera.",
    aging: "13–14 °C, 85–87% RH przez 30–40 dni. Powierzchniowe pleśnie ścieraj solanką.",
    
    cultureSubstitutes: [
      {
        name: "TA / TA-61",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Odpowiednik C201 - główna kultura termofilna do Asiago.",
        searchQuery: "TA"
      },
      {
        name: "MST / MST-910 / MSO / MSO-11",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Alternatywa dla TA - klasyczne kultury termofilne.",
        searchQuery: "MST"
      },
      {
        name: "ST / ST-20",
        type: "termofilna",
        shop: "Artiser.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Kultury termofilne do serów gotowanych.",
        searchQuery: "ST"
      },
      {
        name: "ALPHA 20 / ALPHA 22",
        type: "termofilna",
        shop: "Lactic.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Starter termofilny o łagodnej dynamice.",
        searchQuery: "ALPHA"
      },
      {
        name: "BETA 30 / BETA 32",
        type: "termofilna",
        shop: "Lactic.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Starter termofilny o intensywnej dynamice.",
        searchQuery: "BETA"
      },
      {
        name: "TH LYO / TH 02 LYO",
        type: "termofilna",
        shop: "GAP Poland",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Do serów twardych/półtwardych gotowanych.",
        searchQuery: "TH"
      },
      {
        name: "LH / LH-100",
        type: "Helveticus",
        shop: "GAP Poland",
        dosage: "~0,03 tsp (~0,15 g)",
        notes: "Kultura Helveticus - zostawia słodką nutę, KLUCZOWA dla Asiago!",
        searchQuery: "LH"
      },
      {
        name: "Choozit LH 100",
        type: "Helveticus",
        shop: "Wańczykówka",
        dosage: "~0,03 tsp (~0,15 g)",
        notes: "Odpowiednik LH-100 - dla słodkiej nuty w serach alpejskich.",
        searchQuery: "Choozit LH"
      }
    ],
    
    dosageReference: "Odniesienie: 1/8 tsp kultury TA-61 (~0,6 g) + 1/16 tsp LH-100 (~0,15 g) i 1 tsp podpuszczki (~5 ml) na 22,7 L.",
    dosageTable: [
      { ingredient: "Kultura termofilna główna", amount: "~0,125 tsp (~0,6 g)", notes: "TA-61/C201 lub odpowiednik TA/MST" },
      { ingredient: "Kultura Helveticus", amount: "~0,03 tsp (~0,15 g)", notes: "LH100 - dla słodkiej nuty" },
      { ingredient: "Podpuszczka płynna", amount: "5 ml (1 tsp)", notes: "Single strength" },
      { ingredient: "Sól (solanka)", amount: "3 h na kg sera", notes: "Solanka nasycona" }
    ],
    
    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie 35–36 °C ~30 min",
        content: "Podgrzej mleko do 35–36 °C. Dodaj kulturę termofilną TA-61 (~1/8 tsp) i kulturę Helveticus LH-100 (~1/16 tsp). Pozostaw na 30 min do dojrzewania.",
        tip: "Kluczowe kultury: TA-61 (termofilna) + LH-100 (Helveticus). Helveticus zostawia część laktozy nienaruszoną, dając słodką nutę!"
      },
      {
        title: "2) Krzepnięcie podpuszczka ~25 min",
        content: "Dodaj 5 ml (1 tsp) płynnej podpuszczki single-strength. Mieszaj ruchem góra-dół do równomiernego rozprowadzenia. Skrzep powinien powstać w ~25 min.",
        tip: "Test skrzepu: Skrzep musi się czysto rozdzielać - poczekaj na pełną koagulację przed cięciem."
      },
      {
        title: "3) Cięcie i wstępne mieszanie ~1 cm",
        content: "Potnij skrzep na ziarna ~1 cm (3/8-1/2 cala). Powoli mieszaj przez 15–20 min, aż ziarna się wzmocnią. Utrzymuj temperaturę 35–36 °C.",
        warning: "Uwaga: Ziarna muszą być jednolite i jędrne przed rozpoczęciem gotowania!"
      },
      {
        title: "4) Gotowanie ziaren etap I: do 41 °C przez 20 min",
        content: "Podgrzewaj do 41 °C w ciągu 20 min. Utrzymaj temperaturę przez 15 min, powoli mieszając.",
        tip: "Tempo: ~0,3 °C na minutę - powolne i równomierne podgrzewanie."
      },
      {
        title: "5) Gotowanie ziaren etap II: do 48 °C przez 10 min",
        content: "W następnych 10 min podgrzej do 48 °C (w chłodną pogodę lub przy wysokotłuszczowym mleku może do 51 °C). Pozwól ziarnom osiąść na 20 min, mieszając co 3–5 min.",
        warning: "Test gotowości: Ziarna powinny być suche, sprężyste i nie sklejać się przy ściśnięciu."
      },
      {
        title: "6) Odsączanie z zachowaniem oddzielnych ziaren",
        content: "Usuń serwatkę do poziomu ziaren. Przełóż ziarna do płótna odsączającego, zachowując ich oddzielność - to da charakterystyczną otwartą teksturę Asiago.",
        tip: "Kluczowe: Nie zgniataj ziaren - mają pozostać oddzielne dla właściwej tekstury sera!"
      },
      {
        title: "7) Formowanie w formę 19 cm",
        content: "Przełóż ziarna do formy wyłożonej płótnem (średnica ~19 cm). Zawiń płótno i załóż follower."
      },
      {
        title: "8) Prasowanie etapowe",
        content: "Prasuj według schematu:\\n• 30 min przy ~5,5 kg\\n• 2 h przy ~11 kg (po obrocie)\\n• 2 h przy ~11 kg (po ponownym obrocie)\\n• Noc (8-10 h) przy ~11 kg (po kolejnym obrocie)",
        tip: "Nocowanie: Po prasowaniu zostaw ser w formie w temperaturze 24–29 °C przez noc - bakterie kontynuują pracę!"
      },
      {
        title: "9) Drugi dzień - dojrzewanie w formie",
        content: "Zostaw ser w formie przez kolejną noc w 24–29 °C BEZ SOLI. To kluczowy etap rozwoju kwasowości i smaku.",
        warning: "Ważne: Nie solić w drugim dniu! Pozwól bakteriom dokończyć pracę w kontrolowanych warunkach."
      },
      {
        title: "10) Solenie w solance - dzień trzeci",
        content: "Trzeciego dnia zanurz ser w nasyconej solance na 3 godziny na każdy kilogram sera (zwykle ~8-9 godzin dla całego sera).",
        tip: "Solanka nasycona: ~350 g soli na 1 L wody, temperatura pokojowa."
      },
      {
        title: "11) Dojrzewanie końcowe",
        content: "Dojrzewaj w 13–14 °C i 85–87% RH przez 30–40 dni. Powierzchniowe pleśnie ścieraj solanką co 3-5 dni.",
        tip: "Pielęgnacja: Regularnie obracaj ser i kontroluj wilgotność. Młode Asiago ma jasną barwę i delikatny smak."
      }
    ],
    
    notes: {
      tips: [
        "Kluczowy timing: Asiago ma unikalny 3-dniowy cykl - prasowanie, nocowanie w formie, ponowne nocowanie, dopiero potem solenie!",
        "Kultura Helveticus pozostawia część laktozy nienaruszoną, dając charakterystyczną słodką nutę w finale."
      ],
      warnings: [],
      variants: [
        "Asiago dolce (świeże): 30-40 dni, miękkie i słodkie",
        "Asiago stagionato: 3-6 miesięcy, twardsze i bardziej pikantne",
        "Asiago stravecchio: 12+ miesięcy, bardzo twarde, do tarcia"
      ]
    },
    
    flavor: {
      taste: "Słodkawy, delikatny z nutami jogurtu i masła",
      texture: "Miękka, elastyczna, otwarta struktura",
      color: "Jasna, bladożółta do kremowej",
      aroma: "Świeży, mleczny z delikatnymi nutami masłanymi"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 350,
      fatContent: 27,
      saturatedFatContent: 17,
      proteinContent: 24,
      carbohydrateContent: 2,
      sodiumContent: 890,
      calciumContent: 700
    }
  },
  {
    id: "caciotta",
    zastosowanie: "Miękki ser stołowy do kanapek i na deskę serów, z oliwą i pieczywem. Młoda caciotta dobrze się topi, więc nadaje się do zapiekanek i na pizzę. Włosi jedzą ją też z miodem i orzechami jako prosty deser.",
    video: { youtubeId: "9pzOUi32QeY", title: "Jak zrobić kozią Caciottę w domu. Domowy ser Caciotta capretto", channel: "Domowy ser", poster: caciottaMiniaturaImage },
    name: "Caciotta",
    difficulty: "Średni",
    description: "Caciotta to kremowy, półmiękki ser z środkowych Włoch, tradycyjnie wytwarzany z mleka owczego, krowiego, koziego lub bawolego. Charakteryzuje się niezwykłym procesem \"stufatura\" (gotowanie parą), który nadaje serowi unikalną teksturę. Ten ser dla początkujących znajdzie się na każdym włoskim stole - od regionu Pienza/Siena w południowej Toskanii po całe Włochy.",
    yield: "≈ 0,9 kg z 7,6 L mleka",
    ageTime: "2 miesiące (można jeść młodszą)",
    image: caciottaImage,
    
    milkBase: "≈ 7,6 L mleka pełnego (nie UHT; przy pasteryzowanym dodaj CaCl₂ wg producenta).",
    starter: "Typ: kultura termofilna C201 (odpowiedniki z tabeli poniżej).",
    coagulant: "Płynna podpuszczka single-strength; ok. 2,5 ml (½ tsp) na 7,6 L mleka.",
    salting: "Solanka nasycona przez 2 godziny, następnie suszenie.",
    aging: "52-55°C i 85-90% wilgotności przez 2 miesiące z codziennym obracaniem i wycieraniem.",
    
    cultureSubstitutes: [
      {
        name: "TA / TA-61",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "~0,17 tsp (~0,8 g)",
        notes: "Odpowiednik C201 - główna kultura do Caciotta.",
        searchQuery: "TA"
      },
      {
        name: "MST / MST-910",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "~0,17 tsp (~0,8 g)",
        notes: "Klasyczna kultura Streptococcus thermophilus.",
        searchQuery: "MST"
      },
      {
        name: "ST / ST-20",
        type: "termofilna",
        shop: "Artiser.pl",
        dosage: "~0,17 tsp (~0,8 g)",
        notes: "Podstawowa kultura termofilna.",
        searchQuery: "ST"
      },
      {
        name: "ALPHA 20 / ALPHA 22",
        type: "termofilna",
        shop: "Lactic.pl",
        dosage: "~0,17 tsp (~0,8 g)",
        notes: "Starter termofilny o łagodnej dynamice.",
        searchQuery: "ALPHA"
      },
      {
        name: "BETA 30 / BETA 32",
        type: "termofilna",
        shop: "Lactic.pl",
        dosage: "~0,17 tsp (~0,8 g)",
        notes: "Kultura z intensywnym profilem.",
        searchQuery: "BETA"
      },
      {
        name: "TH LYO / TH 02 LYO",
        type: "termofilna",
        shop: "GAP Poland",
        dosage: "~0,17 tsp (~0,8 g)",
        notes: "Do serów twardych/półtwardych.",
        searchQuery: "TH LYO"
      }
    ],
    
    dosageReference: "Odniesienie: ⅔ saszetki C201 (~0,8 g) + ½ tsp podpuszczki (~2,5 ml) na 7,6 L.",
    dosageTable: [
      { ingredient: "Kultura termofilna", amount: "~0,17 tsp (~0,8 g)", notes: "C201 lub odpowiednik TA/MST" },
      { ingredient: "Podpuszczka płynna", amount: "2,5 ml (½ tsp)", notes: "Single strength" },
      { ingredient: "Solanka nasycona", amount: "~2,3 L wody + 520 g soli", notes: "Nasycona solanka + CaCl₂ + ocet" }
    ],
    
    steps: [
      {
        title: "1) Zakwaszanie i podgrzewanie 37°C ~45-60 min",
        content: "Podgrzej mleko do 37°C. Dodaj kulturę termofilną (~0,17 tsp na 7,6 L). Pozostaw na 45-60 min do dojrzewania w tej temperaturze.",
        tip: "Wyższa temperatura: 37°C (vs 32°C w serach mezofilnych) sprzyja bakteriom termofilnym i tworzy charakterystyczny profil smakowy Caciotta!"
      },
      {
        title: "2) Krzepnięcie podpuszczka ~20 min",
        content: "Dodaj 2,5 ml (½ tsp) płynnej podpuszczki single-strength. Pozostaw na 20 min do utworzenia mocnego skrzepu.",
        warning: "Test skrzepu: Skrzep musi dawać czyste złamanie - jeśli krzepnie wcześniej, użyj mniej podpuszczki następnym razem."
      },
      {
        title: "3) Cięcie na orzech ~10 min + czekanie",
        content: "Potnij skrzep na kawałki wielkości orzecha włoskiego. Najpierw cięcia pionowe, czekaj 5 min, potem poziome. Mieszaj bardzo delikatnie przez 10 min.",
        warning: "Delikatność: Większe ziarna = więcej wilgoci w serze. Nie łam ziaren - tylko delikatne mieszanie!"
      },
      {
        title: "4) Opcjonalne podgrzewanie do 40°C ~15 min",
        content: "Jeśli ziarna są za wilgotne, podgrzej do 40°C przez 15 min mieszania. Jeśli nie - pozostań przy 37°C przez cały czas.",
        tip: "Test wilgotności: Łączny czas mieszania to 25 min. Decyzja o podgrzewaniu zależy od jakości mleka i procesu."
      },
      {
        title: "5) Odsączanie wstępne i formowanie",
        content: "Usuń 40% serwatki do poziomu ziaren. Delikatnie przełóż ziarna do form wyłożonych gazą. Lekko upakowuj, dodając kolejne porcje.",
        warning: "Duże ziarna: Ziarna nadal pokazują dużo wilgoci w środku - to normalne dla Caciotta na tym etapie!"
      },
      {
        title: "6) \"Stufatura\" - gotowanie parą 37-43°C ~1-1,5 h",
        content: "Przygotuj \"stufaturę\": duży garnek z kratką odciągającą kilka cm nad wodą 49°C. Umieść formy na kratce, przykryj garnek. Obracaj ser co 15-30 min.",
        tip: "Kluczowy etap: Ten proces utrzymuje bakterie w pracy i kończy konwersję laktozy - bez tego ser będzie kwaśny i kruchy!"
      },
      {
        title: "7) Studzenie i konsolidacja",
        content: "Po 1 h usuń gazę, po 1,5 h przenieś do temp. pokojowej. Wieczorem do 13-15°C na przygotowanie do solanki. Ser będzie zwięzły z odciskiem koszyków.",
        warning: "Bez prasowania: Dzięki wysokiej wilgotności i \"stufaturze\" nie potrzeba ciężarów ani prasowania!"
      },
      {
        title: "8) Solenie w solance ~2 h",
        content: "Przygotuj solankę nasycona: 3,8 L wody + 0,86 kg soli + 1 łyżka CaCl₂ + 1 łyżka octu białego. Temperatura 10-13°C. Sol ser przez 2 h, obracając w połowie.",
        tip: "Posypywanie solą: Ser pływa nad solanką - posyp górną powierzchnię solą. Obróć i posól ponownie po godzinie."
      },
      {
        title: "9) Dojrzewanie 13-15°C, 85-90% RH",
        content: "Osusz powierzchnię i przenieś do przestrzeni dojrzewania 13-15°C i 85-90% wilgotności. Codziennie obracaj i wycieraj szmatką zwilżoną 6-8% solanką.",
        warning: "Codzienne wycieranie: Wysoka wilgotność sprzyja pleśni - wycieranie solanką usuwa pleśń, a krótkie suszenie przed powrotem!"
      },
      {
        title: "10) Gotowość 1-8 tygodni",
        content: "Po tygodniu ser zmięknie przez enzymy. Po 2 tygodniach do 2 miesięcy gotowy do spożycia. Młodszy = łagodniejszy smak.",
        tip: "Elastyczność czasowa: Można jeść już po tygodniu (świeży) lub dojrzewać do 2 miesięcy (intensywniejszy smak)."
      }
    ],
    
    notes: {
      tips: [
        "Stufatura - klucz sukcesu: To gotowanie parą w 37-43°C jest unikalnym procesem dla Caciotta - utrzymuje bakterie aktywne i kończy fermentację!"
      ],
      warnings: [
        "Pleśń powierzchniowa: Wysoka wilgotność sprzyja pleśni - codzienne wycieranie solanką 6-8% jest konieczne!"
      ],
      variants: [
        "Mleko owcze: Wyższa wydajność, potrzeba więcej form",
        "Mleko kozie: Bardziej charakterystyczny smak",
        "Mieszanka: Krowie + owcze dla balansu smaku i wydajności"
      ]
    },
    
    flavor: {
      taste: "Łagodny, kremowy, lekko kwasły, orzechowe nuty",
      texture: "Półmiękka, gładka, rozpływa się w ustach",
      color: "Biała do jasno-żółtej, jednorodna",
      aroma: "Świeży, mleczny z nutami maslanymi"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 320,
      fatContent: 25,
      saturatedFatContent: 16,
      proteinContent: 22,
      carbohydrateContent: 2,
      sodiumContent: 650,
      calciumContent: 600
    }
  },
  {
    id: "dunlop",
    zastosowanie: "Szkocki ser stołowy, łagodniejszy i wilgotniejszy od cheddara. Na kanapki, do zapiekanek, do tostów i do sosu serowego. Dobrze wypada z owsianym pieczywem i marmoladą, tradycyjnie podawany też do zup warzywnych.",
    name: "Dunlop",
    difficulty: "Średni",
    description: "Dunlop to tradycyjny ser półtwardy z Szkocji. Charakteryzuje się jędrną i sprężystą konsystencją. Ma łagodny, nieco maślany smak — słodki, ale z delikatną, kwaskowatą nutą. Czas dojrzewania wynosi około 6 miesięcy. Ser Dunlop zdobył nagrodę dla najlepszego Modern British Cheese.",
    yield: "≈ 1,4 kg z 15 L mleka",
    ageTime: "3–9 miesięcy (typowo 6 mies.)",
    image: dunlopImage,
    
    milkBase: "≈ 15 L mleka (nie UHT; przy pasteryzowanym dodaj CaCl₂ wg producenta).",
    starter: "Typ: kultura mezofilna (odpowiedniki z tabeli poniżej).",
    coagulant: "Płynna podpuszczka; dawka wg mocy IMCU i tabeli skalowania.",
    salting: "Na sucho do 2% masy odsączonych ziaren.",
    aging: "11–13 °C, 80–85% RH przez 3–9 miesięcy, obrót co 5–7 dni.",
    
    cultureSubstitutes: [
      {
        name: "Choozit MA 4001",
        type: "mezofilna",
        shop: "Wańczykówka",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Odpowiednik C101/MA011 do serów półtwardych.",
        searchQuery: "Choozit MA 4001"
      },
      {
        name: "MSE / MSE-910 / MSO / MSO-11",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Klasyczne kultury Lactococcus do serów półtwardych.",
        searchQuery: "MSE"
      },
      {
        name: "ML / ML-O",
        type: "mezofilna",
        shop: "Artiser.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Podstawowe kultury mezofilne.",
        searchQuery: "ML"
      },
      {
        name: "ALPHA 10 / ALPHA 12",
        type: "mezofilna",
        shop: "Lactic.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Starter o łagodnej dynamice.",
        searchQuery: "ALPHA"
      },
      {
        name: "SH LYO / SM 02 LYO",
        type: "mezofilna",
        shop: "GAP Poland",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Do serów półtwardych/świeżych.",
        searchQuery: "SH LYO"
      }
    ],
    
    dosageReference: "Odniesienie: 0,25 łyżeczki kultury i 0,5 łyżeczki podpuszczki na 15,14 L.",
    dosageTable: [
      { ingredient: "Kultura mezofilna", amount: "~0,125 tsp (~0,6 g)", notes: "C101/MA011 lub odpowiednik" },
      { ingredient: "Podpuszczka płynna", amount: "2,5 ml (½ tsp)", notes: "Single strength" },
      { ingredient: "Sól (na sucho)", amount: "2% masy ziaren", notes: "Do ~28 g na 1,4 kg ziaren" }
    ],
    
    steps: [
      {
        title: "1) Zakwaszanie 30 °C ~60 min",
        content: "Podgrzej mleko do 30 °C. Zaszczep kulturą mezofilną (niskie dawki, patrz tabela doboru kultur) i pozostaw na ~60 min w stałej temperaturze.",
        tip: "Utrzymuj stabilne 30 °C — zbyt wysokie temperatury przyspieszają zakwaszanie i mogą nadmiernie osuszyć ziarno."
      },
      {
        title: "2) Krzepnięcie podpuszczka ~45 min",
        content: "Dodaj płynną podpuszczkę (single-strength), mieszając ok. 1 min. Pozostaw na ~45 min, aż uzyskasz czyste pęknięcie.",
        tip: "Test skrzepu: Unieś skrzep płaską stroną noża. Rozdział powinien być czysty wzdłuż krawędzi, bez drobnych odrywających się kawałków. Jeśli zbyt miękki — poczekaj 5–10 min i sprawdź ponownie."
      },
      {
        title: "3) Cięcie i wstępne mieszanie ~19 mm",
        content: "Potnij skrzep na kawałki wielkości ~19 mm. Wykonaj pionowe cięcia w dwóch prostopadłych kierunkach. Pozostaw na 5 min. Następnie wykonaj poziome cięcia. Gdy ziarno zostanie w pełni pocięte, delikatnie wymieszaj przez kilkadziesiąt sekund. Odstaw na ok. 5 min do zagojenia. Mieszaj bardzo delikatnie przez ok. 10 minut.",
        warning: "Większy rozmiar ziarna (~19 mm) = bardziej wilgotny ser. Nie łam ziaren - tylko delikatne mieszanie!"
      },
      {
        title: "4) Podgrzewanie i podsuszanie ziaren do 36 °C przez 20–30 min",
        content: "Rozpocznij powolne podgrzewanie skrzepu. Podnieś temperaturę do 36 °C w ciągu ok. 20 minut, zwiększając ją o 1 °C co 5 minut na początku procesu. Całkowity czas 'gotowania' wynosi 20 minut, ale jeśli ziarna są wciąż miękkie, możesz wydłużyć proces o dodatkowe 10 minut.",
        tip: "Tempo: zwiększaj o ~1 °C co 5 min do 36 °C. Zbyt szybkie grzanie = zbyt suche ziarno. Ziarna po zakończeniu powinny być jednolicie ugotowane i sprężyste."
      },
      {
        title: "5) Rozwijanie kwasowości (kluczowy etap) ~6,5-7 h całkowicie",
        content: "Usuń serwatkę do poziomu ziaren i zostaw je pokryte cienką warstwą serwatki. Ziarna muszą pozostać w cieple (~30 °C), aby rozwijała się kwasowość przez kolejne 5–6 godzin. Mieszaj co 30 min bardzo delikatnie.",
        warning: "KLUCZOWY ETAP: Przez ~5–6 godzin ziarna mają się powoli zakwasić. Całkowity czas od zaszczepienia do końca tego etapu wynosi około 6,5-7 godzin!"
      },
      {
        title: "6) Test kwasowości i odsączanie",
        content: "Sprawdź pH serwatki (docelowo 5,6-5,9) lub smak (wyraźnie kwaśny). Jeśli gotowe, usuń całą serwatkę i przełóż ziarna do cedzaka wyłożonego gazą serowarską.",
        tip: "Test kwasowości: Serwatka powinna mieć wyraźnie kwaśny smak. Jeśli masz pH-metr, sprawdź — pH 5,6-5,9 jest optymalne."
      },
      {
        title: "7) Formowanie wstępne i 'cheddaring'",
        content: "Zwiąż gazę i umieść blok w naczyniu w temp. pokojowej. Przykryj ściereczką. Co 20 minut rozwijaj blok, obracaj, ponownie zawijaj. Powtarzaj przez 1–1,5 h, aż masa się zwarto zlepi i będzie lekko gumowa.",
        tip: "Etap 'cheddaring': Masa ma się zlać w elastyczną, gumowatą bryłę. Ten proces trwa ~1–1,5 h."
      },
      {
        title: "8) Krojenie na małe kawałki (mill)",
        content: "Po zakończeniu 'cheddaringu', pokrój masę na kawałki wielkości palca (~1,2 cm). Uzyskasz luźne ziarna o charakterystycznej strukturze Dunlopa.",
        tip: "Mill: Ten proces daje charakterystyczną teksturę - luźne ziarna zamiast jednolitego bloku."
      },
      {
        title: "9) Solenie na sucho",
        content: "Zważ ziarna (ok. 1,4 kg z 15 L). Wsyp 2% masy soli (~28 g na 1,4 kg). Wymieszaj równomiernie i odstaw na 10 minut, aby sól się wchłonęła.",
        tip: "Dawkowanie soli: 2% masy ziaren (~28 g na 1,4 kg) to optymalna ilość dla Dunlopa."
      },
      {
        title: "10) Formowanie i prasowanie",
        content: "Wyłóż formę średnicy ~17–18 cm gazą serowarską. Ciasno upakuj posypane solą ziarna, wyrównaj fałdy tkaniny nad wierzchem i załóż tłok.\n\nPrasowanie stopniowe:\n• 15 min przy ~2,3 kg\n• 30 min przy ~4,5 kg po obrocie\n• 2 h przy ~9 kg po obrocie\n• 6 h przy ~13,5 kg po obrocie\n• 12 h przy ~18 kg (noc) po obrocie",
        warning: "Przy każdym etapie: Wyjmij ser, odwiń, odwróć, ponownie zawiń świeżą suchą gazą i wróć do prasy. Wyciekanie serwatki ma być 'łzawe' — pojedyncze krople, nie strumień."
      },
      {
        title: "11) Osuszanie powierzchni",
        content: "Wyjmij ser z formy i pozostaw na deseczce lub macie w temperaturze pokojowej (~18–21 °C) przez 2–3 dni. Obracaj codziennie, aż powierzchnia będzie sucha w dotyku.",
        tip: "Suszenie: Powierzchnia musi być sucha przed woskowaniem lub dojrzewaniem, aby zapobiec pleśni."
      },
      {
        title: "12) Woskowanie i dojrzewanie",
        content: "Zabezpiecz bochenek woskiem serowarskim lub opatrunkiem płóciennym. Dojrzewaj w 11–13 °C i 80–85% RH przez 3–9 miesięcy (typowo 5–7 mies.). Obracaj co 5–7 dni.",
        tip: "Dojrzewanie: Im dłużej, tym bardziej pikantny smak. Młody Dunlop (3 mies.) ma łagodny, maślany smak. Starszy (6–9 mies.) jest bardziej charakterystyczny."
      }
    ],
    
    notes: {
      tips: [
        "Kluczowy etap: Rozwijanie kwasowości przez 6,5-7 godzin całkowicie — to sprawia, że Dunlop ma charakterystyczny smak!",
        "Większe ziarna (~19 mm) zapewniają bardziej wilgotny ser o kremowej teksturze."
      ],
      warnings: [
        "Zbyt szybkie podgrzewanie = zbyt suche ziarno. Utrzymuj tempo ~1 °C co 5 min."
      ],
      variants: [
        "Młody Dunlop (3 mies.): łagodny, maślany smak",
        "Dojrzały Dunlop (6–9 mies.): bardziej pikantny, charakterystyczny"
      ]
    },
    
    flavor: {
      taste: "Łagodny, lekko maślany z delikatną kwaskowatą nutą",
      texture: "Jędrna, sprężysta",
      color: "Jasno-żółty",
      aroma: "Mleczny, z nutami maslanymi"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 380,
      fatContent: 30,
      saturatedFatContent: 19,
      proteinContent: 25,
      carbohydrateContent: 1,
      sodiumContent: 800,
      calciumContent: 720
    }
  },
  {
    id: "feta_bulgarische",
    zastosowanie: "Łagodniejsza i bardziej kremowa od greckiej, dobrze wypada w sałatkach szopskich, na kanapkach z pomidorem i w farszach do papryki. Kruszy się mniej, więc łatwiej ją kroić w kostkę. Sprawdza się też jako baza past do smarowania, zmiksowana z jogurtem i czosnkiem.",
    name: "Feta Bułgarska (Sirene)",
    difficulty: "Średni",
    description: "Bułgarska Feta (Sirene) to tradycyjny biały ser solankowy o gładkiej, kremowej i elastycznej teksturze. W przeciwieństwie do greckiej Fety, która się kruszy, bułgarska wersja zachowuje więcej wilgoci dzięki łagodniejszemu odsączaniu i niższej kwasowości. Można ją kroić w kostki lub plastry, a po kilku tygodniach dojrzewania staje się smarowna jak młody Camembert.",
    yield: "≈ 0,9 kg z 3,8 L mleka",
    ageTime: "1 miesiąc w solance (można do roku)",
    image: fetaBulgarskaImage,
    
    milkBase: "≈ 3,8 L mleka pełnego (nie UHT; przy pasteryzowanym dodaj CaCl₂ wg producenta).",
    starter: "Typ: kultura mezofilna + jogurt bułgarski (mieszane kultury z tabeli poniżej).",
    coagulant: "Płynna podpuszczka single-strength; ok. 1,25 ml (¼ tsp) na 3,8 L mleka.",
    salting: "Solenie na sucho przez 2-3 dni (5% masy sera), następnie solanka 6-8% na przechowywanie.",
    aging: "11-13 °C w solance 6-8% przez 1 miesiąc do roku. Młodszy ser = łagodniejszy smak.",
    
    cultureSubstitutes: [
      {
        name: "Choozit MA 4001",
        type: "mezofilna",
        shop: "Wańczykówka",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Odpowiednik C21 - główna kultura do Fety.",
        searchQuery: "Choozit MA 4001"
      },
      {
        name: "MSE / MSE-910 / MSO / MSO-11",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Klasyczne kultury Lactococcus do serów świeżych.",
        searchQuery: "MSE"
      },
      {
        name: "ML / ML-O",
        type: "mezofilna",
        shop: "Artiser.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Podstawowe kultury mezofilne.",
        searchQuery: "ML"
      },
      {
        name: "ALPHA 10 / ALPHA 12",
        type: "mezofilna",
        shop: "Lactic.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Starter o łagodnej dynamice.",
        searchQuery: "ALPHA"
      },
      {
        name: "SH LYO / SM 02 LYO",
        type: "mezofilna",
        shop: "GAP Poland",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Do serów półtwardych/świeżych.",
        searchQuery: "SH LYO"
      },
      {
        name: "MFC",
        type: "mezofilno-termofilna",
        shop: "Serowar.pl",
        dosage: "~0,06 tsp (~0,3 g)",
        notes: "Mieszanka kultur - alternatywa dla jogurtu bułgarskiego.",
        searchQuery: "MFC"
      }
    ],
    
    dosageReference: "Odniesienie: 1 saszetka C21 (~0,6 g) + 100g jogurtu + ¼ tsp podpuszczki (~1,25 ml) na 3,8 L.",
    dosageTable: [
      { ingredient: "Kultura mezofilna", amount: "~0,125 tsp (~0,6 g)", notes: "C21 lub odpowiednik Choozit MA 4001" },
      { ingredient: "Jogurt bułgarski", amount: "~100 g (~3,5 oz)", notes: "Alternatywa: MFC (mieszanka kultur)" },
      { ingredient: "Podpuszczka płynna", amount: "1,25 ml (¼ tsp)", notes: "Single strength" },
      { ingredient: "Sól (na sucho)", amount: "~45 g na 0,9 kg sera", notes: "5% masy sera przez 2-3 dni" }
    ],
    
    steps: [
      {
        title: "1) Zakwaszanie 30-31 °C ~30-40 min",
        content: "Podgrzej mleko do 30-31 °C. Dodaj kulturę mezofilną i jogurt bułgarski. Przykryj i pozostaw na 30-40 min do dojrzewania.",
        tip: "Krótszy czas: Feta bułgarska potrzebuje MNIEJ kwasowości niż grecka - dlatego krótszy czas dojrzewania (30-40 min vs 60 min)!"
      },
      {
        title: "2) Krzepnięcie podpuszczka ~60 min",
        content: "Dodaj 1,25 ml (¼ tsp) płynnej podpuszczki single-strength. Pozostaw na 60 min do utworzenia mocnego skrzepu.",
        tip: "Dłuższy czas krzepnięcia: 60 min (vs 45 min w greckiej) = więcej wilgoci i kremowa tekstura!"
      },
      {
        title: "3) Cięcie minimalne ~5 cm",
        content: "Potnij skrzep na duże kawałki ~5 cm (2-3 cale) w szachownicę. Pozwól usiąść 10-15 min bez mieszania.",
        warning: "Brak mieszania: NIE mieszaj ani nie gotuj ziaren - to zachowa wilgoć dla kremowej tekstury!"
      },
      {
        title: "4) Odsączanie wstępne",
        content: "Przełóż duże kawałki skrzepu (~1,5-2 cm końcowe) do cedzaka z gazą. Zawiń i dociąż ~2 kg na 1-1,5 h.",
        tip: "Większe kawałki = więcej wilgoci: Im większe kawałki, tym bardziej wilgotny ser. Możesz dostosować do swoich preferencji!"
      },
      {
        title: "5) Przełamywanie i ponowne odsączanie",
        content: "Rozwiń, pokrój na kawałki 5-7 cm, zawiń ponownie i zwiąż. Dociąż ~2 kg na kolejne 1-1,5 h. Powtórz jeszcze raz.",
        warning: "Łącznie 3 przełamania: Ten proces trwa ~4-5,5 h i kształtuje właściwą konsystencję bułgarskiej Fety."
      },
      {
        title: "6) Formowanie końcowe",
        content: "Przełóż do koszyków odsączających. Lekko dociśnij ręką i zostaw pod ciężarem ~1 kg w 24-29 °C przez 8-10 h.",
        tip: "Ciepło dla bakterii: Utrzymuj 24-29 °C aby bakterie dokończyły pracę i wyprodukowane zostały ostatnie kwasy."
      },
      {
        title: "7) Nocowanie i kontrola kwasowości",
        content: "Usuń ciężar i pozwól chłodzić się powoli przez noc. Rano serwatka powinna być kwaśna (pH 4,8-4,9 vs 4,6-4,8 w greckiej Fecie).",
        warning: "Test kwasowości: Serwatka ma być 'nieco ostra' - wyższa niż w greckiej Fecie dla kremowej tekstury."
      },
      {
        title: "8) Cięcie i solenie na sucho",
        content: "Pokrój ser na bloki. Wysol 5% masy sera (900g sera = 45g soli) przez 2-3 dni w 11-13 °C, 70-75% RH.",
        tip: "Przykład dawkowania: 0,9 kg sera → 45g soli (~3 łyżki stołowe) rozłożone na 2-3 dni, obracając ser codziennie."
      },
      {
        title: "9) Odpoczynek po soleniu",
        content: "Po soleniu zostaw ser na kolejne 4 dni w tych samych warunkach (11-13 °C) bez soli - ser dojrzewa i twardnieje.",
        warning: "Ważny etap: Te 4 dni przygotowują ser do solanki - bez tego ser będzie się rozpadać w solance!"
      },
      {
        title: "10) Solanka do przechowywania",
        content: "Przygotuj solankę 6-8% (60-80g soli na 1L wody). Zanurz ser w słoiku i dojrzewaj w 11-13 °C przez 1 miesiąc do roku.",
        tip: "Elastyczność czasowa: Młodsza Feta (1 miesiąc) ma łagodny, kremowy smak. Starsza (3-12 mies.) jest bardziej intensywna i słona. Można przechowywać w solance do roku!"
      }
    ],
    
    notes: {
      tips: [
        "Bułgarska specjalność: Oryginalny przepis używa kultury C21 + jogurt bułgarski (Y1). Jogurt dodaje charakterystyczną kremową teksturę i łagodną kwasowość!",
        "Kluczowa różnica: Bułgarska Feta ma MNIEJ kwasowości (pH 4,8-4,9 vs 4,6-4,8 w greckiej), co daje kremową, elastyczną teksturę zamiast kruchej."
      ],
      warnings: [
        "Nie pomijaj 4-dniowego odpoczynku po soleniu - bez tego ser będzie się rozpadać w solance!"
      ],
      variants: [
        "Młoda Feta (1 miesiąc): łagodna, kremowa, smarowna",
        "Dojrzała Feta (3-12 mies.): bardziej intensywna i słona, twardsza tekstura"
      ]
    },
    
    flavor: {
      taste: "Łagodny, kremowy, lekko słony z delikatną kwaskowatą nutą",
      texture: "Gładka, kremowa, elastyczna - można kroić w plastry",
      color: "Biała do jasnokremowej",
      aroma: "Świeży, mleczny z nutami jogurtowymi"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 264,
      fatContent: 21,
      saturatedFatContent: 14,
      proteinContent: 14,
      carbohydrateContent: 4,
      sodiumContent: 1116,
      calciumContent: 493
    }
  },
  {
    id: "yorkshire",
    zastosowanie: "Wensleydale to brytyjska klasyka podawana z ciastem z jabłkami — kwaskowaty, kruchy ser świetnie równoważy słodycz. Poza tym na kanapki, do sałatek i pokruszony na pieczone warzywa. Wersje z żurawiną są słodsze i idą raczej na deskę serów niż do gotowania.",
    name: "Yorkshire (Wensleydale)",
    difficulty: "Zaawansowany",
    description: "Wensleydale to historyczny ser z północnej Anglii, kojarzony m.in. z Wallace'em i Gromitem. Wywodzi się ze średniowiecznych tradycji klasztornych Yorkshire Dales. Wersja domowa daje delikatny, lekko maślany smak z subtelną kwaśną nutą, teksturę kruchą do sprężystej i kremowy odczucie w ustach.",
    yield: "≈ 0,9–1,0 kg z 7,6 L mleka",
    ageTime: "2–4 miesiące (typowo 3 mies.)",
    image: yorkshireImage,
    
    milkBase: "≈ 7,6 L mleka (nie UHT; przy pasteryzowanym dodaj CaCl₂ wg producenta).",
    starter: "Typ: kultura mezofilna - wolne zakwaszanie (użyj połowę standardowej dawki).",
    coagulant: "Płynna podpuszczka; ok. 1,25 ml (¼ łyżeczki) na 7,6 L mleka.",
    salting: "Na sucho 1,5% masy odsączonych ziaren.",
    aging: "11–13 °C, 80–85% RH przez 2–4 miesiące (typowo 3 mies.), obrót co 5–7 dni.",
    
    cultureSubstitutes: [
      {
        name: "Choozit MA 4001",
        type: "mezofilna",
        shop: "Wańczykówka",
        dosage: "~0,03 tsp (~0,15 g)",
        notes: "Odpowiednik C101/MA011 do serów półtwardych. POŁOWA standardowej dawki!",
        searchQuery: "Choozit MA 4001"
      },
      {
        name: "MSE / MSE-910 / MSO / MSO-11",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,03 tsp (~0,15 g)",
        notes: "Klasyczne kultury Lactococcus. POŁOWA standardowej dawki!",
        searchQuery: "MSE"
      },
      {
        name: "ML / ML-O",
        type: "mezofilna",
        shop: "Artiser.pl",
        dosage: "~0,03 tsp (~0,15 g)",
        notes: "Podstawowe kultury mezofilne. POŁOWA standardowej dawki!",
        searchQuery: "ML"
      },
      {
        name: "ALPHA 10 / ALPHA 12",
        type: "mezofilna",
        shop: "Lactic.pl",
        dosage: "~0,03 tsp (~0,15 g)",
        notes: "Starter o łagodnej dynamice. POŁOWA standardowej dawki!",
        searchQuery: "ALPHA"
      },
      {
        name: "SH LYO / SM 02 LYO",
        type: "mezofilna",
        shop: "GAP Poland",
        dosage: "~0,03 tsp (~0,15 g)",
        notes: "Do serów półtwardych/świeżych. POŁOWA standardowej dawki!",
        searchQuery: "SH LYO"
      }
    ],
    
    dosageReference: "Odniesienie: 0,125 tsp kultury (~0,6 g) i 0,25 tsp podpuszczki (~1,25 ml) na 7,6 L. UWAGA: Użyj POŁOWĘ standardowej dawki kultury!",
    dosageTable: [
      { ingredient: "Kultura mezofilna", amount: "~0,03 tsp (~0,15 g)", notes: "POŁOWA standardowej dawki - dla wolnego zakwaszania!" },
      { ingredient: "Podpuszczka płynna", amount: "1,25 ml (¼ tsp)", notes: "Single strength" },
      { ingredient: "Sól (na sucho)", amount: "~15 g na 1 kg ziaren", notes: "1,5% masy odsączonych ziaren" }
    ],
    
    steps: [
      {
        title: "1) Zakwaszanie 30 °C ~60 min",
        content: "Podgrzej mleko do 30 °C. Zaszczep POŁOWĄ standardowej dawki kultury mezofilnej (~0,03 tsp / ~0,15 g) i pozostaw na ~60 min w stałej temperaturze.",
        tip: "Wskazówka: Posyp kulturę na powierzchni mleka, odczekaj 2 min na nawilżenie, potem delikatnie wymieszaj. Yorkshire potrzebuje wolnego, długiego rozwoju kwasowości."
      },
      {
        title: "2) Krzepnięcie podpuszczka ~45 min",
        content: "Dodaj 1,25 ml (¼ tsp) płynnej podpuszczki (single-strength), mieszając ok. 30 s góra-dół. Pozostaw na ~45 min, aż uzyskasz mocny skrzep.",
        tip: "Test skrzepu: Skrzep powinien się czysto rozdzielać przy podniesieniu płaską stroną noża, bez drobnych odrywających się kawałków."
      },
      {
        title: "3) Cięcie i wstępne mieszanie ~1,2 cm",
        content: "Potnij skrzep na kostki ~1,2 cm. Odczekaj 5 min, następnie bardzo delikatnie przewracaj ziarna co 3–5 min ruchem z dołu do góry.",
        warning: "Uwaga: Nie pozwól ziarnom się zlepić w masę! Mieszanie ma być bardzo delikatne, tylko żeby utrzymać je w ruchu."
      },
      {
        title: "4) Suszenie ziaren (BEZ gotowania!) ~30 °C przez 90 min",
        content: "Utrzymuj 30 °C (nie podgrzewaj wyżej!). Mieszaj powoli przez 90 min ruchem z dołu do góry, aby równomiernie oddały serwatkę.",
        tip: "Test gotowości: Ziarno po złamaniu ma być jędrne i sprężyste przez całą grubość, z umiarkowanym oporem przy ściśnięciu między palcami."
      },
      {
        title: "5) Odsączanie i wstępne formowanie bloku",
        content: "Przełóż ziarna do cedzaka wyłożonego gazą serowarską (butter muslin). Zwiąż w węzeł i odwróć na supeł. Utrzymuj ciepło przez ~30 min.",
        tip: "Wskazówka: Można dociążyć deską i naczyniem z ciepłą wodą (~2 kg), aby masa się dobrze związała w blok."
      },
      {
        title: "6) 'Przełamywanie' masy (cheddaring w stylu Wensleydale)",
        content: "Pokrój masę na bloki ~5 cm. Zwiąż ponownie i utrzymuj ciepło. Co 30 min przez 2 h otwieraj, każdy kawałek dziel na pół i zwiąż ponownie.",
        warning: "Łącznie 4 przełamania: Docelowo uzyskaj ziarna ~1,2 cm, łatwo rozdzielne. Ten etap kształtuje charakterystyczną teksturę Yorkshire."
      },
      {
        title: "7) Solenie na sucho",
        content: "Zważ ziarna (ok. 0,9–1,0 kg z 7,6 L). Wymieszaj 1,5% soli (~15 g na 1 kg ziaren) — połowę dawki wsyp, rozprowadź, po 2–3 min dodaj resztę i ponownie wymieszaj.",
        tip: "Przykład: Przy masie 1 kg ziaren → 15 g soli (~1 łyżka stołowa średnioziarnistej soli serowarskiej)."
      },
      {
        title: "8) Formowanie i prasowanie",
        content: "Wyłóż formę gazą, ciasno upakuj ziarna, wyrównaj fałdy tkaniny, zawiń nad wierzchem i załóż tłok.\n\nPrasowanie stopniowe:\n• 12 h przy ~2,3 kg — noc\n• 5 h przy ~9 kg — rano\n• 12 h przy ~20 kg\n• 12 h przy ~20 kg po obrocie",
        tip: "Przy każdym etapie: Wyjmij ser, odwiń, odwróć, ponownie zawiń i wróć do prasy. Wyciekanie serwatki ma być 'łzawe' — pojedyncze krople, nie strumień."
      },
      {
        title: "9) Woskowanie i dojrzewanie",
        content: "Osusz bochenek i zabezpiecz woskiem serowarskim lub opatrunkiem płóciennym. Dojrzewaj w 11–13 °C i 80–85% RH przez 2–4 miesiące (typowo 3 mies.). Obracaj co 5–7 dni.",
        tip: "Dojrzewanie: Gotowy Yorkshire ma delikatnie słodkawy smak z subtelną kwaśną nutą, kruchą do sprężystej teksturę i kremowy odczucie w ustach."
      }
    ],
    
    notes: {
      tips: [
        "Kluczowa różnica: Yorkshire wymaga WOLNEGO rozwoju kwasowości przez ~6,5-7 godzin całkowicie. Użyj POŁOWĘ standardowej dawki kultury!",
        "Rozpocznij rano: Cały proces trwa cały dzień - od zaszczepienia do formowania."
      ],
      warnings: [
        "Nie gotuj ziaren! Yorkshire suszy ziarna TYLKO przez długie mieszanie w 30 °C, bez podgrzewania."
      ],
      variants: [
        "Młody Yorkshire (2 mies.): delikatny, kremowy",
        "Klasyczny Yorkshire (3 mies.): zbalansowany smak",
        "Dojrzały Yorkshire (4+ mies.): bardziej pikantny"
      ]
    },
    
    flavor: {
      taste: "Delikatny, lekko maślany z subtelną kwaśną nutą",
      texture: "Krucha do sprężystej, kremowe odczucie w ustach",
      color: "Jasno-biały do bladożółtego",
      aroma: "Świeży, mleczny z nutami maslanymi"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 340,
      fatContent: 26,
      saturatedFatContent: 17,
      proteinContent: 23,
      carbohydrateContent: 2,
      sodiumContent: 750,
      calciumContent: 650
    }
  },
  {
    id: "gouda",
    zastosowanie: "Klasyk kanapkowy, ale w kuchni najlepiej wypada tam, gdzie ma się stopić: zapiekanki, tosty, roladki mięsne, sos serowy. Młoda gouda ciągnie się i jest łagodna, stara (12 miesięcy i więcej) kruszy się i lepiej nadaje się do tarcia na makaron albo na deskę serów z gruszką i orzechami.",
    video: { youtubeId: "TpNEK8d7yAM", title: "Jak zrobić ser gouda w domu/ gouda cheese", channel: "Domowy ser", poster: goudaMiniaturaImage },
    name: "Gouda",
    difficulty: "Średni",
    description: "Gouda to holenderski ser o łagodnym, kremowym smaku i charakterystycznej słodkiej nucie. Jest jednym z najpopularniejszych serów na świecie, ceniony za swoją wszechstronność - od młodych, miękkich wersji po dojrzałe, krystaliczne odmiany.",
    yield: "≈ 1,8 kg z 15 L mleka",
    ageTime: "2-12 miesięcy",
    image: goudaImage,
    
    milkBase: "≈ 15 L mleka pełnego (nie UHT; przy pasteryzowanym dodaj CaCl₂).",
    starter: "Typ: kultura mezofilna typu LD (z produkcją CO₂ dla oczek).",
    coagulant: "Płynna podpuszczka single-strength; ok. 3,5 ml na 15 L mleka.",
    salting: "Solanka nasycona - 3 godziny na każdy kilogram sera.",
    aging: "10-13°C, 85% RH przez 2-12 miesięcy.",
    
    cultureSubstitutes: [
      {
        name: "Flora Danica",
        type: "mezofilna LD",
        shop: "Serowar.pl",
        dosage: "~0,5 g na 15 L",
        notes: "Klasyczna kultura do Goudy z produkcją CO₂.",
        searchQuery: "Flora Danica"
      },
      {
        name: "MM / MM-100",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,5 g na 15 L",
        notes: "Alternatywa mezofilna z oczkami.",
        searchQuery: "MM"
      }
    ],
    
    dosageReference: "Odniesienie: ~0,5 g kultury mezofilnej + 3,5 ml podpuszczki na 15 L.",
    dosageTable: [
      { ingredient: "Kultura mezofilna LD", amount: "~0,5 g", notes: "Flora Danica lub odpowiednik" },
      { ingredient: "Podpuszczka płynna", amount: "3,5 ml", notes: "Single strength" },
      { ingredient: "Solanka nasycona", amount: "3 h na kg", notes: "~350 g soli na 1 L wody" }
    ],
    
    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie 32°C ~45 min",
        content: "Podgrzej mleko do 32°C. Dodaj kulturę mezofilną i pozostaw na 45 min.",
        tip: "Kultura LD produkuje CO₂, tworząc charakterystyczne małe oczka w serze."
      },
      {
        title: "2) Krzepnięcie ~45 min",
        content: "Dodaj podpuszczkę i pozostaw do utworzenia mocnego skrzepu.",
        tip: "Test skrzepu: czyste złamanie przy podniesieniu nożem."
      },
      {
        title: "3) Cięcie i płukanie wodą",
        content: "Potnij skrzep na kostki 1 cm. Usuń 1/3 serwatki i zastąp ciepłą wodą 38°C. To 'płukanie' usuwa laktozę i daje słodszy smak.",
        tip: "Kluczowy etap dla Goudy - płukanie wodą to sekret słodkiego smaku! Ciekawostka: Licznerski (1922) zalecał cieplejszą wodę — 40-45°C zamiast 38°C — by usunąć jeszcze więcej laktozy i uzyskać słodszy ser."
      },
      {
        title: "4) Gotowanie do 38°C ~30 min",
        content: "Podgrzewaj powoli do 38°C, mieszając delikatnie przez 30 min.",
        warning: "Nie przekraczaj 40°C — wyższa temperatura zabije współczesne kultury mezofilne. Uwaga hist.: Licznerski (1922) dopuszczał 40-45°C, bo ówczesne kultury naturalne były odporniejsze na ciepło."
      },
      {
        title: "5) Formowanie i prasowanie",
        content: "Przełóż do formy i prasuj:\n• 30 min przy 4 kg\n• 2 h przy 8 kg\n• 12 h przy 12 kg",
        tip: "Obracaj ser przy każdej zmianie ciężaru."
      },
      {
        title: "6) Solenie w solance ~3 h/kg",
        content: "Zanurz w nasyconej solance na 3 godziny na każdy kilogram sera.",
        tip: "Temperatura solanki 10-15°C. Ciekawostka: Licznerski (1922) stosował słabszą solankę (18-20%) przez dłuższy czas (12-48 h zamiast 3 h/kg w nasyconej). Metoda daje łagodniejsze, bardziej równomierne solenie."
      },
      {
        title: "7) Dojrzewanie i woskowanie",
        content: "Osusz przez 2-3 dni, pokryj woskiem. Dojrzewaj 10-13°C, 85% RH przez 2-12 miesięcy.",
        tip: "Młoda Gouda (2 mies.) - kremowa, Stara Gouda (12+ mies.) - krystaliczna."
      }
    ],
    
    notes: {
      tips: [
        "Płukanie wodą to kluczowy etap - usuwa laktozę i daje charakterystyczny słodki smak Goudy.",
        "Woskowanie chroni ser i pozwala na długie dojrzewanie.",
        "Ciekawostka hist.: Jan Licznerski w 'Praktycznym serowarstwie' (1922) opisał goudę z cieplejszym płukaniem (40-45°C) i słabszą solanką (18-20%, 12-48 h) — podejście typowe dla XIX-wiecznej technologii."
      ],
      warnings: [],
      variants: [
        "Młoda Gouda (2-3 mies.): kremowa, łagodna",
        "Dojrzała Gouda (6-12 mies.): intensywniejsza, lekko słona",
        "Stara Gouda (12+ mies.): krystaliczna tekstura, mocny smak"
      ]
    },
    
    flavor: {
      taste: "Słodkawy, kremowy, orzechowy",
      texture: "Gładka, elastyczna (młoda) do krystalicznej (stara)",
      color: "Jasno do ciemnożółtej",
      aroma: "Maślany, lekko słodki"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 356,
      fatContent: 27,
      saturatedFatContent: 18,
      proteinContent: 25,
      carbohydrateContent: 2,
      sodiumContent: 819,
      calciumContent: 700
    }
  },
  {
    id: "cheddar",
    zastosowanie: "Do burgerów, zapiekanek, mac and cheese i nachos — topi się intensywnie i ma wyrazisty, kwaskowaty smak, który nie ginie pod innymi składnikami. Starszy cheddar dobrze wypada na desce serów z chutneyem i jabłkiem. Do sosu serowego dodawaj go stopniowo, bo przy zbyt wysokiej temperaturze lubi się rozdzielić.",
    name: "Cheddar",
    difficulty: "Zaawansowany",
    description: "Cheddar to kultowy brytyjski ser o ostrym, wyrazistym smaku. Charakteryzuje się unikalnym procesem 'cheddaringu' - układania i obracania bloków twarogu, który nadaje serowi charakterystyczną teksturę i smak.",
    yield: "≈ 2 kg z 20 L mleka",
    ageTime: "3-24 miesiące",
    image: cheddarImage,
    
    milkBase: "≈ 20 L mleka pełnego (nie UHT; przy pasteryzowanym dodaj CaCl₂).",
    starter: "Typ: kultura mezofilna MA (bez produkcji gazu).",
    coagulant: "Płynna podpuszczka single-strength; ok. 4 ml na 20 L mleka.",
    salting: "Solenie na sucho - 2% masy sera.",
    aging: "10-13°C, 85% RH przez 3-24 miesiące.",
    
    cultureSubstitutes: [
      {
        name: "MA / MA-011",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,6 g na 20 L",
        notes: "Klasyczna kultura do Cheddara bez gazu.",
        searchQuery: "MA"
      },
      {
        name: "R-704",
        type: "mezofilna",
        shop: "Artiser.pl",
        dosage: "~0,6 g na 20 L",
        notes: "Alternatywa do twardych serów.",
        searchQuery: "R-704"
      }
    ],
    
    dosageReference: "Odniesienie: ~0,6 g kultury mezofilnej + 4 ml podpuszczki na 20 L.",
    dosageTable: [
      { ingredient: "Kultura mezofilna MA", amount: "~0,6 g", notes: "MA-011 lub odpowiednik" },
      { ingredient: "Podpuszczka płynna", amount: "4 ml", notes: "Single strength" },
      { ingredient: "Sól", amount: "2% masy sera", notes: "~40 g na 2 kg sera" }
    ],
    
    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie 32°C ~45 min",
        content: "Podgrzej mleko do 32°C. Dodaj kulturę mezofilną i pozostaw na 45 min.",
        tip: "Cheddar wymaga kultury MA bez produkcji gazu."
      },
      {
        title: "2) Krzepnięcie ~45 min",
        content: "Dodaj podpuszczkę i pozostaw do utworzenia mocnego skrzepu.",
        tip: "Skrzep powinien być bardzo mocny przed cięciem."
      },
      {
        title: "3) Cięcie i gotowanie do 39°C",
        content: "Potnij na kostki 1 cm. Podgrzewaj powoli do 39°C przez 40 min, mieszając delikatnie.",
        warning: "Powolne podgrzewanie - max 1°C na 5 min."
      },
      {
        title: "4) Cheddaring - kluczowy etap",
        content: "Odsącz serwatkę. Pokrój masę na bloki 10x15 cm. Układaj jeden na drugim, obracaj co 15 min przez 2 h. Bloki staną się gładkie i błyszczące.",
        tip: "To etap, który nadaje Cheddarowi charakterystyczną teksturę! pH powinno spaść do 5.3-5.4."
      },
      {
        title: "5) Mielenie i solenie",
        content: "Potnij bloki na paski 1 cm. Wymieszaj z 2% soli (40 g na 2 kg).",
        tip: "Sól hamuje dalszą fermentację i nadaje smak."
      },
      {
        title: "6) Formowanie i prasowanie",
        content: "Upakuj w formie i prasuj:\n• 1 h przy 10 kg\n• 12 h przy 20 kg\n• 24 h przy 25 kg",
        tip: "Prasowanie musi być bardzo mocne dla zwartej tekstury."
      },
      {
        title: "7) Bandażowanie i dojrzewanie",
        content: "Osusz, owin bandażem i nasmaruj smalcem. Dojrzewaj 10-13°C, 85% RH przez 3-24 miesięcy.",
        tip: "Mild Cheddar: 3-6 mies., Sharp: 12+ mies., Extra Sharp: 24+ mies."
      }
    ],
    
    notes: {
      tips: [
        "Cheddaring to kluczowy proces - układanie i obracanie bloków przez 2 h buduje charakterystyczną teksturę.",
        "Bandażowanie smalcem pozwala na bardzo długie dojrzewanie."
      ],
      warnings: [
        "Proces cheddaring wymaga utrzymania temperatury 32-35°C przez cały czas."
      ],
      variants: [
        "Mild Cheddar (3-6 mies.): łagodny, kremowy",
        "Sharp Cheddar (12 mies.): wyrazisty, ostry",
        "Extra Sharp (24+ mies.): bardzo intensywny, krystaliczny"
      ]
    },
    
    flavor: {
      taste: "Ostry, wyrazisty, lekko kwaskowy",
      texture: "Zwarta, krucha (dojrzały) do kremowej (młody)",
      color: "Jasno do pomarańczowożółtej",
      aroma: "Intensywny, ziemisty, lekko pikantny"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 403,
      fatContent: 33,
      saturatedFatContent: 21,
      proteinContent: 25,
      carbohydrateContent: 1,
      sodiumContent: 621,
      calciumContent: 721
    }
  },
  {
    id: "mozzarella",
    zastosowanie: "Świeża mozzarella to caprese z pomidorem i bazylią, sałatki i przekąski na zimno. Mozzarella bardziej odciśnięta idzie na pizzę i do zapiekanek — ta świeża, mocno wodnista, zalałaby ciasto. Sprawdza się też grillowana w plastrach oraz jako nadzienie do arancini i roladek.",
    name: "Mozzarella",
    difficulty: "Łatwy",
    description: "Mozzarella to włoski ser typu pasta filata, znany z elastycznej, ciągnącej się tekstury. Świeża mozzarella jest idealna do pizzy, sałatek caprese i zapiekanek. To jeden z najszybszych serów do przygotowania w domu.",
    yield: "≈ 0,5 kg z 4 L mleka",
    ageTime: "Świeży (1-7 dni)",
    image: mozzarellaImage,
    
    milkBase: "≈ 4 L mleka pełnego (najlepiej niepasteryzowane lub pasteryzowane z CaCl₂).",
    starter: "Typ: kultura termofilna lub kwas cytrynowy.",
    coagulant: "Płynna podpuszczka single-strength; ok. 1 ml na 4 L mleka.",
    salting: "Solanka lub sól w wodzie do przechowywania.",
    aging: "Świeży - do spożycia w ciągu 7 dni.",
    
    cultureSubstitutes: [
      {
        name: "Kwas cytrynowy",
        type: "zakwaszacz",
        shop: "Sklep spożywczy",
        dosage: "1,5 tsp na 4 L",
        notes: "Najprostsza metoda - szybka mozzarella.",
        searchQuery: "kwas cytrynowy"
      },
      {
        name: "TA / TA-61",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "~0,2 g na 4 L",
        notes: "Tradycyjna metoda z kulturą.",
        searchQuery: "TA"
      }
    ],
    
    dosageReference: "Odniesienie: 1,5 tsp kwasu cytrynowego + 1 ml podpuszczki na 4 L.",
    dosageTable: [
      { ingredient: "Kwas cytrynowy", amount: "1,5 tsp (~7 g)", notes: "Rozpuść w 60 ml zimnej wody" },
      { ingredient: "Podpuszczka płynna", amount: "1 ml (¼ tsp)", notes: "Rozpuść w 60 ml zimnej wody" },
      { ingredient: "Sól", amount: "Do smaku", notes: "W wodzie do przechowywania" }
    ],
    
    steps: [
      {
        title: "1) Zakwaszanie 13°C",
        content: "Rozpuść kwas cytrynowy w 60 ml zimnej wody. Wlej do zimnego mleka (13°C) i wymieszaj.",
        tip: "Kwas cytrynowy działa natychmiast - można też użyć kultury termofilnej (dłuższy proces)."
      },
      {
        title: "2) Podgrzanie do 32°C i dodanie podpuszczki",
        content: "Podgrzej mleko do 32°C. Dodaj rozpuszczoną podpuszczkę, mieszaj 30 s i zostaw na 5-10 min.",
        tip: "Skrzep powinien być gładki i odbijać się od ścian."
      },
      {
        title: "3) Cięcie i gotowanie do 40°C",
        content: "Potnij skrzep na kostki 2-3 cm. Podgrzej do 40°C, delikatnie mieszając.",
        warning: "Nie mieszaj zbyt intensywnie - ziarna są delikatne."
      },
      {
        title: "4) Odsączanie",
        content: "Przelej przez sito lub gazę. Zachowaj serwatkę do rozciągania!",
        tip: "Serwatka jest potrzebna do następnego kroku."
      },
      {
        title: "5) Rozciąganie (pasta filata)",
        content: "Podgrzej serwatkę do 77-82°C. Zanurz twaróg na 1-2 min, aż zmięknie. Rozciągaj i składaj jak ciasto, aż będzie gładki i błyszczący.",
        tip: "To kluczowy moment! Ser musi być wystarczająco gorący do rozciągania. Używaj rękawic!"
      },
      {
        title: "6) Formowanie i schładzanie",
        content: "Uformuj kulki i wrzuć do lodowatej wody na 15 min. Przechowuj w lekko osolonej wodzie w lodówce.",
        tip: "Świeża mozzarella jest najlepsza w ciągu 1-3 dni."
      }
    ],
    
    notes: {
      tips: [
        "Temperatura rozciągania jest kluczowa - ser musi być w 77-82°C, żeby się rozciągał.",
        "Używaj rękawic - gorący ser może poparzyć!"
      ],
      warnings: [
        "Mleko UHT nie zadziała - białka są zbyt uszkodzone.",
        "Jeśli ser się kruszy zamiast rozciągać - pH jest złe lub temperatura za niska."
      ],
      variants: [
        "Mozzarella di Bufala: z mleka bawolego",
        "Fior di Latte: z mleka krowiego",
        "Burrata: mozzarella nadziewana śmietanką"
      ]
    },
    
    flavor: {
      taste: "Delikatny, mleczny, lekko słodki",
      texture: "Elastyczna, ciągnąca się, miękka",
      color: "Biała, porcelanowa",
      aroma: "Świeży, mleczny"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 280,
      fatContent: 17,
      saturatedFatContent: 11,
      proteinContent: 28,
      carbohydrateContent: 3,
      sodiumContent: 627,
      calciumContent: 505
    }
  },
  {
    id: "camembert",
    zastosowanie: "Zapiekany w całości z miodem, żurawiną i orzechami to gotowa przystawka. Panierowany i smażony podaje się z konfiturą. Na zimno — na desce serów z winogronami i bagietką, koniecznie wyjęty z lodówki pół godziny wcześniej, bo zimny nie oddaje aromatu. Świetnie wypada też w tarcie z karmelizowaną cebulą.",
    video: { youtubeId: "wt0bf199RTw", title: "Jak zrobić ser camembert/ camembert cheese", channel: "Domowy ser", poster: camembertMiniaturaImage },
    name: "Camembert",
    difficulty: "Zaawansowany",
    description: "Camembert to francuski ser pleśniowy o kremowej, rozpływającej się konsystencji i intensywnym aromacie. Charakterystyczna biała pleśń Penicillium candidum tworzy jadalną skórkę, pod którą kryje się aksamitne wnętrze.",
    yield: "≈ 0,5 kg z 4 L mleka",
    ageTime: "3-5 tygodni",
    image: camembertImage,
    
    milkBase: "≈ 4 L mleka pełnego (najlepiej niepasteryzowane).",
    starter: "Typ: kultura mezofilna + Penicillium candidum.",
    coagulant: "Płynna podpuszczka single-strength; ok. 1 ml na 4 L mleka.",
    salting: "Solenie na sucho - 1,5% masy sera.",
    aging: "11-13°C, 90-95% RH przez 3-5 tygodni.",
    
    cultureSubstitutes: [
      {
        name: "MM / MM-100",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,3 g na 4 L",
        notes: "Podstawowa kultura do Camemberta.",
        searchQuery: "MM"
      },
      {
        name: "Penicillium candidum",
        type: "pleśń biała",
        shop: "Serowar.pl",
        dosage: "~szczypta na 4 L",
        notes: "Tworzy charakterystyczną białą skórkę.",
        searchQuery: "Penicillium candidum"
      }
    ],
    
    dosageReference: "Odniesienie: ~0,3 g kultury mezofilnej + szczypta P. candidum + 1 ml podpuszczki na 4 L.",
    dosageTable: [
      { ingredient: "Kultura mezofilna", amount: "~0,3 g", notes: "MM-100 lub odpowiednik" },
      { ingredient: "Penicillium candidum", amount: "~1/16 tsp", notes: "Rozpuść w mleku" },
      { ingredient: "Podpuszczka płynna", amount: "1 ml", notes: "Single strength" },
      { ingredient: "Sól", amount: "~7 g na 0,5 kg", notes: "1,5% masy sera" }
    ],
    
    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie 32°C ~90 min",
        content: "Podgrzej mleko do 32°C. Dodaj kulturę mezofilną i Penicillium candidum. Pozostaw na 90 min.",
        tip: "Dodaj P. candidum na początku - potrzebuje czasu na rozprowadzenie."
      },
      {
        title: "2) Krzepnięcie ~60 min",
        content: "Dodaj podpuszczkę i pozostaw na 60 min do utworzenia delikatnego skrzepu.",
        tip: "Skrzep Camemberta jest delikatniejszy niż w twardych serach."
      },
      {
        title: "3) Cięcie i przełożenie do form",
        content: "Potnij skrzep na kostki 2 cm. Delikatnie przełóż łyżką cedzakową do form Camembert (10-11 cm średnicy).",
        warning: "Nie prasuj! Camembert sam odsącza przez grawitację."
      },
      {
        title: "4) Odsączanie 12-24 h",
        content: "Pozostaw formy w temp. pokojowej. Obracaj co 2-3 h przez pierwszy dzień. Ser znacznie się skurczy.",
        tip: "Po 24 h ser będzie miał ~3 cm wysokości."
      },
      {
        title: "5) Solenie na sucho",
        content: "Wyjmij z formy i posól ze wszystkich stron (~1,5% masy). Pozostaw na 24 h w chłodnym miejscu.",
        tip: "Sól można posypać lub potrzeć delikatnie."
      },
      {
        title: "6) Dojrzewanie z pleśnią",
        content: "Przenieś do 11-13°C i 90-95% RH. Obracaj codziennie. Po 7-10 dniach pojawi się biała pleśń.",
        tip: "Wysoka wilgotność jest kluczowa dla rozwoju pleśni! Ciekawostka: Licznerski (1922) opisywał, że biała pleśń 'narasta samoistnie' z otoczenia — zanim dostępny był komercyjny Penicillium candidum, serowarze polegali na dzikich szczepach z piwnicy."
      },
      {
        title: "7) Zawijanie i finalne dojrzewanie",
        content: "Gdy pleśń pokryje cały ser (~14 dni), zawiń w papier do sera. Dojrzewaj jeszcze 1-2 tygodnie.",
        tip: "Gotowy Camembert jest miękki pod skórką i lekko sprężysty w środku."
      }
    ],
    
    notes: {
      tips: [
        "Wysoka wilgotność (90-95%) jest absolutnie kluczowa dla rozwoju białej pleśni.",
        "Codzienne obracanie zapewnia równomierny rozwój pleśni ze wszystkich stron.",
        "Ciekawostka hist.: Licznerski (1922) opisywał camembert z samoistnym narastaniem pleśni — bez komercyjnych kultur P. candidum, które upowszechniły się dopiero w XX w."
      ],
      warnings: [
        "Zbyt niska wilgotność = sucha, popękana skórka.",
        "Zbyt wysoka temperatura = ser rozmięknie zbyt szybko."
      ],
      variants: [
        "Camembert de Normandie: tradycyjny z mleka niepasteryzowanego",
        "Brie: większa forma, łagodniejszy smak",
        "Camembert truflowy: z dodatkiem trufli"
      ]
    },
    
    flavor: {
      taste: "Kremowy, grzybowy, lekko ziemisty",
      texture: "Kremowa, rozpływająca się pod skórką",
      color: "Biała skórka, jasno-kremowe wnętrze",
      aroma: "Intensywny, grzybowy, ziemisty"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 299,
      fatContent: 24,
      saturatedFatContent: 15,
      proteinContent: 20,
      carbohydrateContent: 0,
      sodiumContent: 842,
      calciumContent: 388
    }
  },
  {
    id: "halloumi",
    zastosowanie: "Jedyny ser, który grilluje się i smaży bez panierki, bo nie topi się przy wysokiej temperaturze. Do sałatek z arbuzem i miętą, na grilla w plastrach, do burgerów wegetariańskich i do szaszłyków. Jest słony — przed smażeniem można go moczyć kwadrans w wodzie.",
    name: "Halloumi",
    difficulty: "Łatwy",
    description: "Halloumi to cypryjski ser o unikalnej właściwości - nie topi się podczas smażenia czy grillowania. Dzięki temu jest idealny na grilla, patelnię czy do sałatek. Charakteryzuje się słono-mlecznym smakiem i sprężystą teksturą.",
    yield: "≈ 0,6 kg z 4 L mleka",
    ageTime: "Świeży (do 2 tygodni w solance)",
    image: halloumiImage,
    
    milkBase: "≈ 4 L mleka pełnego (tradycyjnie mieszanka owczego i koziego).",
    starter: "Brak lub minimalna kultura - Halloumi opiera się głównie na podpuszczce.",
    coagulant: "Płynna podpuszczka single-strength; ok. 1 ml na 4 L mleka.",
    salting: "Gotowanie w serwatce + przechowywanie w solance.",
    aging: "Świeży - do 2 tygodni w solance w lodówce.",
    
    cultureSubstitutes: [
      {
        name: "Bez kultury",
        type: "brak",
        shop: "-",
        dosage: "-",
        notes: "Halloumi tradycyjnie robi się bez kultury starterowej.",
        searchQuery: ""
      },
      {
        name: "Lipaza",
        type: "enzym",
        shop: "Serowar.pl",
        dosage: "~1/8 tsp na 4 L",
        notes: "Opcjonalnie - dodaje pikantny smak.",
        searchQuery: "lipaza"
      }
    ],
    
    dosageReference: "Odniesienie: 1 ml podpuszczki na 4 L mleka, bez kultury.",
    dosageTable: [
      { ingredient: "Podpuszczka płynna", amount: "1 ml", notes: "Single strength" },
      { ingredient: "Mięta suszona", amount: "1-2 łyżki", notes: "Tradycyjny dodatek" },
      { ingredient: "Sól do solanki", amount: "~100 g na 1 L", notes: "Do przechowywania" }
    ],
    
    steps: [
      {
        title: "1) Podgrzanie do 32°C",
        content: "Podgrzej mleko do 32°C. Halloumi nie wymaga kultury starterowej.",
        tip: "Tradycyjnie używa się mieszanki mleka owczego i koziego, ale krowie też działa."
      },
      {
        title: "2) Krzepnięcie ~45 min",
        content: "Dodaj podpuszczkę i pozostaw na 45 min do utworzenia mocnego skrzepu.",
        tip: "Skrzep powinien być bardzo mocny."
      },
      {
        title: "3) Cięcie i gotowanie do 40°C",
        content: "Potnij skrzep na kostki 1-2 cm. Podgrzej do 40°C przez 20 min, mieszając delikatnie.",
        warning: "Delikatne mieszanie - ziarna są kruche."
      },
      {
        title: "4) Odsączanie i formowanie",
        content: "Przełóż do formy wyłożonej gazą. Prasuj lekko przez 1 h. Pokrój na bloki ~10x7x3 cm.",
        tip: "Zachowaj serwatkę - będzie potrzebna!"
      },
      {
        title: "5) Gotowanie w serwatce - kluczowy etap",
        content: "Podgrzej serwatkę do 90-95°C. Wrzuć bloki sera i gotuj 30-60 min, aż wypłyną na powierzchnię.",
        tip: "To etap, który sprawia, że Halloumi się nie topi! Ser 'pływa' gdy jest gotowy."
      },
      {
        title: "6) Dodanie mięty i składanie",
        content: "Wyjmij bloki, posyp suszoną miętą i złóż na pół. Lekko dociśnij.",
        tip: "Mięta to tradycyjny dodatek cypryjski - nadaje charakterystyczny aromat."
      },
      {
        title: "7) Przechowywanie w solance",
        content: "Przechowuj w solance (100 g soli na 1 L wody) w lodówce do 2 tygodni.",
        tip: "Przed smażeniem opłucz z nadmiaru soli."
      }
    ],
    
    notes: {
      tips: [
        "Gotowanie w gorącej serwatce to sekret Halloumi - denaturuje białka i ser nie topi się na patelni.",
        "Mięta to tradycyjny cypryjski dodatek, ale można pominąć."
      ],
      warnings: [
        "Temperatura gotowania musi być wysoka (90-95°C) - inaczej ser będzie się topić.",
        "Zbyt słone? Namocz w wodzie przez 30 min przed smażeniem."
      ],
      variants: [
        "Halloumi klasyczny: z miętą",
        "Halloumi bez mięty: neutralny smak",
        "Halloumi grillowany: najlepszy sposób podania"
      ]
    },
    
    flavor: {
      taste: "Słono-mleczny, lekko pikantny",
      texture: "Sprężysta, 'skrzypiąca', nie topi się",
      color: "Biała do jasno-kremowej",
      aroma: "Mleczny z nutą mięty (tradycyjny)"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 321,
      fatContent: 25,
      saturatedFatContent: 16,
      proteinContent: 22,
      carbohydrateContent: 3,
      sodiumContent: 1390,
      calciumContent: 680
    }
  },
  {
    id: "brie",
    zastosowanie: "Zapiekany w cieście francuskim z miodem i orzechami, w tartach, na kanapkach z gruszką i rukolą. Topi się gładko, więc nadaje się do sosów i do zapiekania w całości. Skórkę można jeść — jest częścią sera i to ona odpowiada za grzybowy aromat.",
    name: "Brie",
    difficulty: "Zaawansowany",
    description: "Brie to królowa serów miękkich z Francji, pokryta białą pleśnią Penicillium candidum. Ser o kremowej, rozpływającej się konsystencji i intensywnym, grzybowym aromacie. Pochodzi z regionu Brie w północnej Francji i jest jednym z najstarszych serów na świecie.",
    yield: "≈ 0,5 kg z 7,6 L mleka",
    ageTime: "4-6 tygodni",
    image: brieImage,
    
    milkBase: "≈ 7,6 L mleka pełnego (nie UHT; przy pasteryzowanym dodaj CaCl₂).",
    starter: "Typ: kultura mezofilna MM100/Flora Danica + Penicillium candidum do białej skórki.",
    coagulant: "Płynna podpuszczka single-strength; ok. 2,5 ml na 7,6 L mleka.",
    salting: "Suche solenie - posypywanie solą podczas dojrzewania.",
    aging: "10-13°C, 90-95% RH przez 4-6 tygodni z regularnym obracaniem.",
    
    cultureSubstitutes: [
      {
        name: "MM / MM-100",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Główna kultura mezofilna do Brie.",
        searchQuery: "MM"
      },
      {
        name: "Flora Danica",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Klasyczna kultura duńska, alternatywa dla MM.",
        searchQuery: "Flora Danica"
      },
      {
        name: "Penicillium candidum",
        type: "pleśń biała",
        shop: "Serowar.pl",
        dosage: "~1/16 tsp",
        notes: "KLUCZOWA dla białej skórki Brie!",
        searchQuery: "candidum"
      },
      {
        name: "Geotrichum candidum",
        type: "drożdże",
        shop: "Serowar.pl",
        dosage: "~1/32 tsp",
        notes: "Opcjonalnie - poprawia teksturę skórki.",
        searchQuery: "Geotrichum"
      }
    ],
    
    dosageReference: "Odniesienie: 1/8 tsp MM-100 + 1/16 tsp P. candidum + 2,5 ml podpuszczki na 7,6 L.",
    dosageTable: [
      { ingredient: "Kultura mezofilna", amount: "~0,125 tsp (~0,6 g)", notes: "MM-100 lub Flora Danica" },
      { ingredient: "Penicillium candidum", amount: "~1/16 tsp", notes: "Do białej skórki" },
      { ingredient: "Podpuszczka płynna", amount: "2,5 ml (½ tsp)", notes: "Single strength" },
      { ingredient: "Sól", amount: "~15 g na ser", notes: "Suche solenie" }
    ],
    
    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie 32°C ~60 min",
        content: "Podgrzej mleko do 32°C. Dodaj kulturę mezofilną i P. candidum. Pozostaw na 60 min do dojrzewania.",
        tip: "Niska temperatura i długie dojrzewanie = więcej wilgoci w serze."
      },
      {
        title: "2) Krzepnięcie podpuszczka ~60-90 min",
        content: "Dodaj 2,5 ml podpuszczki. Bardzo długie krzepnięcie (60-90 min) dla delikatnego skrzepu.",
        warning: "Nie śpiesz się - Brie wymaga bardzo delikatnego skrzepu!"
      },
      {
        title: "3) Cięcie na duże kostki 2-3 cm",
        content: "Potnij skrzep na duże kostki 2-3 cm. Pozostaw na 10 min bez mieszania.",
        tip: "Duże ziarna = więcej wilgoci = kremowa konsystencja."
      },
      {
        title: "4) Delikatne mieszanie ~20 min",
        content: "Bardzo delikatnie mieszaj przez 20 min. Unikaj łamania ziaren.",
        warning: "Zbyt intensywne mieszanie zniszczy teksturę Brie!"
      },
      {
        title: "5) Formowanie warstwowe",
        content: "Przełóż skrzep do form (bez płótna!) warstwami. Formy okrągłe ~15 cm średnicy. Pozostaw do samoociekania przez 24h w 20-22°C, obracając co 2-3h.",
        tip: "Brie formuje się bez prasowania - tylko grawitacja."
      },
      {
        title: "6) Solenie suche",
        content: "Po 24h wyjmij z formy i posyp solą ze wszystkich stron (ok. 15g na ser). Pozostaw na 24h.",
        tip: "Równomierne pokrycie solą jest kluczowe dla rozwoju pleśni."
      },
      {
        title: "7) Dojrzewanie wstępne 10-13°C ~7 dni",
        content: "Przenieś do dojrzewalni 10-13°C, 90-95% wilgotności. Obracaj codziennie. Po 5-7 dniach pojawi się biała pleśń.",
        warning: "Zbyt niska wilgotność = sucha skórka i słaby rozwój pleśni."
      },
      {
        title: "8) Dojrzewanie końcowe 3-5 tygodni",
        content: "Kontynuuj dojrzewanie, obracając co 2-3 dni. Pleśń pokryje cały ser. Ser jest gotowy gdy środek jest miękki i kremowy.",
        tip: "Test gotowości: delikatnie naciśnij środek - powinien być sprężysty ale miękki."
      }
    ],
    
    notes: {
      tips: [
        "Temperatura dojrzewania jest kluczowa - zbyt ciepło = zbyt szybkie dojrzewanie i gorzki smak.",
        "Biała pleśń powinna być gęsta i jednorodna - plamy oznaczają problemy z wilgotnością."
      ],
      warnings: [
        "Unikaj zielonej/niebieskiej pleśni - to zanieczyszczenie!",
        "Amoniakalny zapach = ser przejrzały."
      ],
      variants: [
        "Brie de Meaux: większy, dłuższe dojrzewanie",
        "Brie z ziołami: dodaj zioła do środka",
        "Brie z truflami: luksusowa wersja"
      ]
    },
    
    flavor: {
      taste: "Kremowy, grzybowy, lekko orzechowy, delikatnie pikantny",
      texture: "Miękka, rozpływająca się, kremowy środek",
      color: "Biała skórka, kremowo-żółty środek",
      aroma: "Intensywny, grzybowy, ziemisty"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 334,
      fatContent: 28,
      saturatedFatContent: 17,
      proteinContent: 21,
      carbohydrateContent: 0.5,
      sodiumContent: 629,
      calciumContent: 184
    }
  },
  {
    id: "parmezan",
    zastosowanie: "Tarty na makaron, risotto i sałatkę cezar; płatkami na carpaccio i rukolę. Skórki nie wyrzucaj — wrzucona do zupy lub sosu oddaje smak umami i jest tradycyjnym dodatkiem do minestrone. Kupuj w kawałku i trzyj na bieżąco, bo tarty gotowiec szybko traci aromat.",
    name: "Parmezan (Parmigiano-Reggiano)",
    difficulty: "Zaawansowany",
    description: "Parmigiano-Reggiano to król serów włoskich, dojrzewający minimum 12 miesięcy. Charakteryzuje się krystaliczną strukturą, intensywnym smakiem umami i orzechowymi nutami. Ten ser wymaga cierpliwości, ale efekt jest niezrównany.",
    yield: "≈ 2 kg z 22,7 L mleka",
    ageTime: "12-24 miesiące",
    image: parmezanImage,
    
    milkBase: "≈ 22,7 L mleka pełnego (nie UHT; częściowo odtłuszczone przez nocne odstanie).",
    starter: "Typ: naturalna serwatka startowa lub kultura termofilna + Lactobacillus helveticus.",
    coagulant: "Podpuszczka cielęca; ok. 5 ml na 22,7 L mleka.",
    salting: "Solanka nasycona przez 20-25 dni.",
    aging: "13-15°C, 80-85% RH przez 12-24 miesiące z regularnym obracaniem.",
    
    cultureSubstitutes: [
      {
        name: "TA / TA-61",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Główna kultura termofilna.",
        searchQuery: "TA"
      },
      {
        name: "LH / LH-100",
        type: "Helveticus",
        shop: "GAP Poland",
        dosage: "~0,03 tsp (~0,15 g)",
        notes: "KLUCZOWA dla charakterystycznego smaku Parmezanu!",
        searchQuery: "LH"
      },
      {
        name: "TH LYO",
        type: "termofilna",
        shop: "GAP Poland",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Do twardych serów gotowanych.",
        searchQuery: "TH"
      }
    ],
    
    dosageReference: "Odniesienie: 1/8 tsp TA-61 + 1/16 tsp LH-100 + 5 ml podpuszczki na 22,7 L.",
    dosageTable: [
      { ingredient: "Kultura termofilna", amount: "~0,125 tsp (~0,6 g)", notes: "TA-61 lub TH LYO" },
      { ingredient: "Kultura Helveticus", amount: "~0,03 tsp (~0,15 g)", notes: "LH-100 - dla umami" },
      { ingredient: "Podpuszczka cielęca", amount: "5 ml (1 tsp)", notes: "Tradycyjna cielęca" },
      { ingredient: "Sól (solanka)", amount: "20-25 dni", notes: "Solanka nasycona" }
    ],
    
    steps: [
      {
        title: "1) Przygotowanie mleka - nocne odstanie",
        content: "Wieczorem: wlej mleko do szerokiego naczynia i odstaw w lodówce na noc. Rano: zbierz śmietankę z powierzchni (mleko będzie częściowo odtłuszczone).",
        tip: "Tradycyjny Parmezan używa mleka częściowo odtłuszczonego - to daje charakterystyczną teksturę."
      },
      {
        title: "2) Podgrzanie i zakwaszanie 33-35°C ~30 min",
        content: "Podgrzej mleko do 33-35°C. Dodaj kulturę termofilną i Helveticus. Pozostaw na 30 min.",
        tip: "Kultura Helveticus jest kluczowa dla smaku umami!"
      },
      {
        title: "3) Krzepnięcie podpuszczka ~15 min",
        content: "Dodaj 5 ml podpuszczki cielęcej. Krzepnięcie powinno nastąpić w 15 min.",
        warning: "Używaj podpuszczki cielęcej dla autentycznego smaku."
      },
      {
        title: "4) Cięcie na drobne ziarna ~3 mm",
        content: "Potnij skrzep na bardzo drobne ziarna wielkości ziarna ryżu (3 mm). Użyj trzepaczki lub harfy serowej.",
        tip: "Im drobniejsze ziarna, tym twardszy i bardziej suchy ser."
      },
      {
        title: "5) Gotowanie ziaren do 55°C ~45 min",
        content: "Powoli podgrzewaj do 55°C przez 45 min, ciągle mieszając. Tempo: około 0,5°C na minutę.",
        warning: "Zbyt szybkie podgrzewanie = nierównomierna tekstura!"
      },
      {
        title: "6) Odsączanie i formowanie",
        content: "Pozostaw ziarna na dnie na 30 min. Usuń serwatkę. Przełóż masę do formy wyłożonej płótnem.",
        tip: "Ziarna powinny być suche i sprężyste - nie sklejać się."
      },
      {
        title: "7) Prasowanie ~24h",
        content: "Prasuj przy rosnącym ciśnieniu: 4h przy 10 kg, 8h przy 20 kg, 12h przy 30 kg. Obracaj co 2-3h.",
        warning: "Długie prasowanie jest kluczowe dla gęstej tekstury."
      },
      {
        title: "8) Solenie w solance 20-25 dni",
        content: "Zanurz ser w nasyconej solance na 20-25 dni (1 dzień na każdy kg + 5 dni). Temperatura 15-18°C. Obracaj codziennie.",
        tip: "Długie solenie to charakterystyka Parmezanu - sól przenika głęboko."
      },
      {
        title: "9) Dojrzewanie 12-24 miesiące",
        content: "Dojrzewaj w 13-15°C, 80-85% wilgotności. Obracaj co tydzień. Szczotkuj powierzchnię oliwą co miesiąc.",
        tip: "12 miesięcy = młody, 24+ miesięcy = intensywny, krystaliczny."
      }
    ],
    
    notes: {
      tips: [
        "Cierpliwość jest kluczowa - prawdziwy Parmezan wymaga minimum 12 miesięcy.",
        "Kryształy aminokwasów (tyrozyna) to znak dobrze dojrzałego sera."
      ],
      warnings: [
        "Zbyt wysoka wilgotność = pleśń i pęknięcia.",
        "Zbyt niska = wysychanie i pękanie skórki."
      ],
      variants: [
        "Parmigiano-Reggiano 12 miesięcy: młody, łagodny",
        "Parmigiano-Reggiano 24 miesięcy: klasyczny, intensywny",
        "Parmigiano-Reggiano 36+ miesięcy: stravecchio, bardzo intensywny"
      ]
    },
    
    flavor: {
      taste: "Intensywny umami, orzechowy, lekko słony, kryształki",
      texture: "Twarda, krucha, z kryształkami aminokwasów",
      color: "Słomkowo-żółta, ciemniejsza przy dłuższym dojrzewaniu",
      aroma: "Intensywny, orzechowy, lekko owocowy"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 431,
      fatContent: 29,
      saturatedFatContent: 18,
      proteinContent: 38,
      carbohydrateContent: 3.2,
      sodiumContent: 1529,
      calciumContent: 1184
    }
  },
  {
    id: "ricotta",
    zastosowanie: "W kuchni włoskiej ricotta jest przede wszystkim nadzieniem: do ravioli, cannelloni, muszli makaronowych i lasagne, zwykle wymieszana ze szpinakiem i gałką muszkatołową. Na słodko robi się z niej sernik, placki ricottowe i nadzienie do cannoli. Dodana do sosu pomidorowego zmienia go w kremowy bez użycia śmietany. Do wypieków odciśnij ją wcześniej przez sitko, bo bywa wodnista.",
    name: "Ricotta",
    difficulty: "Łatwy",
    description: "Ricotta to tradycyjny włoski ser serwatkowy, wytwarzany z serwatki pozostałej po produkcji innych serów. Nazwa pochodzi od włoskiego 'ricotta' - 'ponownie gotowana'. Ser ma delikatny, słodkawy smak i kremową teksturę, idealny do deserów i dań makaronowych.",
    yield: "≈ 0,5 kg z 4 L serwatki + 2 L mleka",
    ageTime: "Świeża (do 7 dni)",
    image: ricottaImage,
    
    milkBase: "4 L świeżej serwatki + 2 L mleka pełnego (dla większej wydajności).",
    starter: "Brak kultury - ser kwasowy.",
    coagulant: "Kwas cytrynowy lub ocet - 60 ml na 6 L płynu.",
    salting: "Opcjonalna szczypta soli do smaku.",
    aging: "Brak dojrzewania - ser świeży.",
    
    cultureSubstitutes: [],
    
    dosageReference: "Odniesienie: 60 ml kwasu cytrynowego (lub octu) na 6 L płynu.",
    dosageTable: [
      { ingredient: "Serwatka świeża", amount: "4 L", notes: "Z produkcji innego sera" },
      { ingredient: "Mleko pełne", amount: "2 L", notes: "Zwiększa wydajność" },
      { ingredient: "Kwas cytrynowy", amount: "60 ml (4 łyżki)", notes: "Lub ocet biały" },
      { ingredient: "Sól", amount: "szczypta", notes: "Opcjonalnie" }
    ],
    
    steps: [
      {
        title: "1) Przygotowanie płynu",
        content: "Połącz 4 L świeżej serwatki z 2 L mleka pełnego w dużym garnku.",
        tip: "Użyj serwatki z tego samego dnia - stara serwatka da gorzki smak."
      },
      {
        title: "2) Podgrzewanie do 85-90°C",
        content: "Powoli podgrzewaj mieszankę do 85-90°C, mieszając delikatnie. Nie dopuść do zagotowania!",
        warning: "Gotowanie zniszczy delikatną strukturę Ricotty!"
      },
      {
        title: "3) Dodanie kwasu",
        content: "Gdy płyn osiągnie 85°C, dodaj 60 ml kwasu cytrynowego (4 łyżki). Delikatnie zamieszaj. Białka natychmiast zaczną się ścinać.",
        tip: "Jeśli nie widać kłaczków, dodaj więcej kwasu po łyżce."
      },
      {
        title: "4) Odpoczynek ~10 min",
        content: "Zdejmij z ognia i pozostaw na 10 min bez mieszania. Białka uniosą się na powierzchnię.",
        warning: "Nie mieszaj! Delikatne kłaczki mogą się rozpaść."
      },
      {
        title: "5) Odsączanie",
        content: "Delikatnie przelewaj przez gazę lub sitko wyłożone gazą. Pozostaw do ociekania 30-60 min.",
        tip: "Im dłużej odciekasz, tym gęstsza Ricotta."
      },
      {
        title: "6) Doprawianie (opcjonalnie)",
        content: "Dodaj szczyptę soli do smaku. Możesz też dodać zioła, miód lub cytrynę.",
        tip: "Ricotta jest bazą - dostosuj smak do planowanego zastosowania."
      },
      {
        title: "7) Przechowywanie",
        content: "Przełóż do szczelnego pojemnika. Przechowuj w lodówce do 7 dni.",
        warning: "Ricotta szybko się psuje - jedz świeżą!"
      }
    ],
    
    notes: {
      tips: [
        "Najlepsza Ricotta pochodzi ze świeżej serwatki - zrób ją tego samego dnia co główny ser.",
        "Dodaj mleko dla większej wydajności i kremowszej tekstury."
      ],
      warnings: [
        "Stara serwatka = gorzki smak.",
        "Nie przechowuj dłużej niż tydzień."
      ],
      variants: [
        "Ricotta salata: osolona i suszona, do tarcia",
        "Ricotta al forno: pieczona, do deserów",
        "Ricotta z ziołami: z bazylią, oregano"
      ]
    },
    
    flavor: {
      taste: "Delikatny, słodkawy, mleczny, świeży",
      texture: "Kremowa, delikatna, lekko ziarnista",
      color: "Biała, kremowa",
      aroma: "Świeży, mleczny, neutralny"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 174,
      fatContent: 13,
      saturatedFatContent: 8,
      proteinContent: 11,
      carbohydrateContent: 3,
      sodiumContent: 84,
      calciumContent: 207
    }
  },
  {
    id: "mascarpone",
    zastosowanie: "Baza tiramisu i serników na zimno, ale sprawdza się też wytrawnie: łyżka mascarpone w risotto zamiast masła daje kremowość bez ciężkości, a wmieszana w sos do makaronu łagodzi kwasowość pomidorów. Dobrze komponuje się z wędzonym łososiem i z owocami leśnymi.",
    name: "Mascarpone",
    difficulty: "Łatwy",
    description: "Mascarpone to luksusowy włoski ser kremowy z regionu Lombardii. Charakteryzuje się aksamitną teksturą i delikatnym, słodkawym smakiem. Jest niezbędnym składnikiem tiramisu i wielu włoskich deserów. Produkcja jest bardzo prosta - to idealny ser dla początkujących.",
    yield: "≈ 0,4 kg z 1 L śmietanki",
    ageTime: "Świeży (do 5 dni)",
    image: mascarponeImage,
    
    milkBase: "1 L śmietanki kremowej (30-36% tłuszczu).",
    starter: "Brak kultury - ser kwasowy.",
    coagulant: "Kwas cytrynowy lub winny - 30 ml na 1 L śmietanki.",
    salting: "Brak solenia.",
    aging: "Brak dojrzewania - ser świeży.",
    
    cultureSubstitutes: [],
    
    dosageReference: "Odniesienie: 30 ml soku z cytryny (lub 15 ml kwasu winnego) na 1 L śmietanki.",
    dosageTable: [
      { ingredient: "Śmietanka kremowa", amount: "1 L", notes: "30-36% tłuszczu" },
      { ingredient: "Sok z cytryny", amount: "30 ml (2 łyżki)", notes: "Lub 15 ml kwasu winnego" }
    ],
    
    steps: [
      {
        title: "1) Przygotowanie kąpieli wodnej",
        content: "Napełnij duży garnek wodą do 1/3 wysokości. Wstaw mniejszy garnek ze śmietanką. Stwórz kąpiel wodną (bain-marie).",
        tip: "Kąpiel wodna zapewnia równomierne podgrzewanie bez przypalania."
      },
      {
        title: "2) Podgrzewanie śmietanki do 85°C",
        content: "Powoli podgrzewaj śmietankę do 85°C, mieszając delikatnie. Używaj termometru.",
        warning: "Nie dopuść do zagotowania - pogorszy teksturę!"
      },
      {
        title: "3) Dodanie kwasu",
        content: "Gdy śmietanka osiągnie 85°C, dodaj 30 ml soku z cytryny. Mieszaj delikatnie przez 5 min na niskim ogniu.",
        tip: "Śmietanka lekko zgęstnieje - to normalne."
      },
      {
        title: "4) Schładzanie ~1h",
        content: "Zdejmij z ognia i pozostaw do ostygnięcia na 1h w temperaturze pokojowej.",
        tip: "Nie przyspieszaj schładzania - pozwól na naturalne ostygnięcie."
      },
      {
        title: "5) Chłodzenie w lodówce 8-12h",
        content: "Przenieś garnek do lodówki na 8-12h (najlepiej na noc). Mascarpone zgęstnieje.",
        warning: "Ten krok jest kluczowy - nie skracaj czasu chłodzenia!"
      },
      {
        title: "6) Odsączanie (opcjonalnie)",
        content: "Jeśli chcesz gęstszą konsystencję, przełóż przez gazę i pozostaw do ociekania 2-4h.",
        tip: "Dla tiramisu lepsza jest gęstsza wersja."
      },
      {
        title: "7) Przechowywanie",
        content: "Przełóż do szczelnego pojemnika. Przechowuj w lodówce do 5 dni.",
        warning: "Mascarpone jest bardzo wrażliwe - jedz świeże!"
      }
    ],
    
    notes: {
      tips: [
        "Użyj najwyższej jakości śmietanki - to jedyny składnik!",
        "Kwas winny daje delikatniejszy smak niż cytrynowy."
      ],
      warnings: [
        "Nie używaj śmietanki UHT - słabszy wynik.",
        "Przechowuj maksymalnie 5 dni."
      ],
      variants: [
        "Mascarpone słodkie: z cukrem pudrem",
        "Mascarpone waniliowe: z ekstraktem wanilii",
        "Mascarpone z owocami: do deserów"
      ]
    },
    
    flavor: {
      taste: "Delikatny, słodkawy, kremowy, maślany",
      texture: "Aksamitna, gładka, kremowa",
      color: "Biało-kremowa",
      aroma: "Delikatny, mleczny, maślany"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 429,
      fatContent: 44,
      saturatedFatContent: 28,
      proteinContent: 5,
      carbohydrateContent: 3.5,
      sodiumContent: 41,
      calciumContent: 98
    }
  },
  {
    id: "feta-grecka",
    zastosowanie: "Sałatka grecka, spanakopita, zapiekana w folii z pomidorami i oliwą, kruszona na pieczone warzywa. Modny wariant: zapiec ją w całości z pomidorkami koktajlowymi i wymieszać widelcem z makaronem. Solankę z opakowania warto zachować — przechowywana w niej feta nie wysycha.",
    name: "Feta Grecka",
    difficulty: "Średni",
    description: "Feta to tradycyjny grecki ser solankowy z mleka owczego lub mieszanki owczo-koziej. Charakteryzuje się białą barwą, kruchą teksturą i słono-kwaśnym smakiem. To jeden z najstarszych serów świata, wspomniany już w Odysei Homera.",
    yield: "≈ 1 kg z 7,6 L mleka",
    ageTime: "2-3 miesiące w solance",
    image: fetaGreckaImage,
    
    milkBase: "≈ 7,6 L mleka owczego (lub mieszanka 70% owcze + 30% kozie). Można użyć krowiego.",
    starter: "Typ: kultura mezofilna MM100 lub Flora Danica + Lipaza dla charakterystycznego smaku.",
    coagulant: "Płynna podpuszczka; ok. 2,5 ml na 7,6 L mleka.",
    salting: "Solanka 7-10% przez 2-3 miesiące.",
    aging: "W solance w lodówce przez 2-3 miesiące.",
    
    cultureSubstitutes: [
      {
        name: "MM / MM-100",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Główna kultura mezofilna.",
        searchQuery: "MM"
      },
      {
        name: "Flora Danica",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Alternatywa dla MM.",
        searchQuery: "Flora Danica"
      },
      {
        name: "Lipaza",
        type: "enzym",
        shop: "Serowar.pl",
        dosage: "~1/8 tsp",
        notes: "Dla intensywnego, ostrego smaku greckiej Fety.",
        searchQuery: "lipaza"
      }
    ],
    
    dosageReference: "Odniesienie: 1/8 tsp MM-100 + 1/8 tsp lipazy + 2,5 ml podpuszczki na 7,6 L.",
    dosageTable: [
      { ingredient: "Kultura mezofilna", amount: "~0,125 tsp (~0,6 g)", notes: "MM-100 lub Flora Danica" },
      { ingredient: "Lipaza (opcjonalnie)", amount: "~1/8 tsp", notes: "Dla ostrzejszego smaku" },
      { ingredient: "Podpuszczka płynna", amount: "2,5 ml (½ tsp)", notes: "Single strength" },
      { ingredient: "Sól (solanka)", amount: "7-10%", notes: "Do przechowywania" }
    ],
    
    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie 32°C ~60 min",
        content: "Podgrzej mleko do 32°C. Dodaj kulturę mezofilną i opcjonalnie lipazę. Pozostaw na 60 min.",
        tip: "Lipaza dodaje charakterystycznego pikantnego smaku greckiej Fety."
      },
      {
        title: "2) Krzepnięcie podpuszczka ~45-60 min",
        content: "Dodaj 2,5 ml podpuszczki. Długie krzepnięcie (45-60 min) dla delikatnego skrzepu.",
        warning: "Test skrzepu: czysty, sprężysty skrzep bez resztek płynnych."
      },
      {
        title: "3) Cięcie na kostki 1,5-2 cm",
        content: "Potnij skrzep na kostki 1,5-2 cm. Pozostaw na 10 min bez mieszania.",
        tip: "Większe kostki = więcej wilgoci w serze."
      },
      {
        title: "4) Delikatne mieszanie ~20 min",
        content: "Bardzo delikatnie mieszaj przez 20 min. Ziarna powinny się wzmocnić ale pozostać wilgotne.",
        warning: "Nie podgrzewaj! Feta wymaga niskiej temperatury."
      },
      {
        title: "5) Odsączanie i formowanie",
        content: "Przełóż skrzep do formy wyłożonej płótnem. Pozostaw do samoociekania 4-6h w temperaturze pokojowej. Obracaj co godzinę.",
        tip: "Feta nie wymaga prasowania - tylko grawitacja i czas."
      },
      {
        title: "6) Solenie suche - dzień 1-3",
        content: "Po sformowaniu posyp ser solą ze wszystkich stron. Pozostaw w temperaturze pokojowej na 1-3 dni, codziennie obracając i dosolając.",
        tip: "Sól wyciąga wilgoć i chroni przed zepsuciem."
      },
      {
        title: "7) Przygotowanie solanki",
        content: "Przygotuj solankę 7-10%: 70-100 g soli na 1 L wody. Dodaj 1 łyżkę octu i 1 łyżkę CaCl₂. Schłodź do temperatury lodówki.",
        tip: "Solanka o niższym stężeniu = łagodniejsza Feta."
      },
      {
        title: "8) Dojrzewanie w solance 2-3 miesiące",
        content: "Zanurz ser w solance i przechowuj w lodówce. Ser powinien być całkowicie zanurzony. Dojrzewaj minimum 2 miesiące.",
        tip: "Im dłużej w solance, tym intensywniejszy smak."
      }
    ],
    
    notes: {
      tips: [
        "Mleko owcze daje najbardziej autentyczny smak, ale krowie też działa.",
        "Lipaza jest opcjonalna, ale dodaje charakterystycznego greckiego 'kopa'."
      ],
      warnings: [
        "Zbyt mocna solanka = bardzo słony ser. Można namaczać przed jedzeniem.",
        "Ser musi być zanurzony - wystawione części pleśnieją."
      ],
      variants: [
        "Feta klasyczna: 70% owcze + 30% kozie",
        "Feta z krowiego: łagodniejsza wersja",
        "Feta z ziołami: oregano, tymianek w solance"
      ]
    },
    
    flavor: {
      taste: "Słono-kwaśny, pikantny, intensywny",
      texture: "Krucha, kremowa, rozpada się",
      color: "Biała do kremowej",
      aroma: "Ostry, mleczny, lekko kozłowy (przy mleku owczym/kozim)"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 264,
      fatContent: 21,
      saturatedFatContent: 15,
      proteinContent: 14,
      carbohydrateContent: 4,
      sodiumContent: 917,
      calciumContent: 493
    }
  },
  {
    id: "gorgonzola",
    zastosowanie: "Do sosów — kremowe risotto, sos do makaronu, polewa do gnocchi. Wystarczy jej niewiele, bo smak jest intensywny. Gorgonzola dolce jest łagodniejsza i lepiej się rozpuszcza, piccante mocniejsza i bardziej krucha. Klasyczne połączenia: gruszka, orzech włoski, miód, karmelizowana cebula.",
    name: "Gorgonzola",
    difficulty: "Zaawansowany",
    description: "Gorgonzola to włoski ser z niebieską pleśnią z regionu Lombardii i Piemontu. Znany od IX wieku, jest jednym z najstarszych serów pleśniowych świata. Dostępny w dwóch odmianach: Dolce (kremowy, łagodny) i Piccante (twardy, ostry).",
    yield: "≈ 1,5 kg z 11 L mleka",
    ageTime: "2-4 miesiące",
    image: gorgonzolaImage,
    
    milkBase: "≈ 11 L mleka pełnego krowiego (nie UHT; przy pasteryzowanym dodaj CaCl₂).",
    starter: "Typ: kultura mezofilna + Penicillium roqueforti dla niebieskiej pleśni.",
    coagulant: "Płynna podpuszczka; ok. 3 ml na 11 L mleka.",
    salting: "Solenie suche przez 3-4 dni.",
    aging: "10-13°C, 90-95% RH przez 2-4 miesiące z nakłuwaniem.",
    
    cultureSubstitutes: [
      {
        name: "MM / MM-100",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,15 tsp (~0,7 g)",
        notes: "Główna kultura mezofilna.",
        searchQuery: "MM"
      },
      {
        name: "Penicillium roqueforti",
        type: "pleśń niebieska",
        shop: "Serowar.pl",
        dosage: "~1/16 tsp",
        notes: "Pleśń niebieska - kluczowa dla Gorgonzoli.",
        searchQuery: "roqueforti"
      }
    ],
    
    dosageReference: "Odniesienie: 0,15 tsp MM-100 + 1/16 tsp P. roqueforti + 3 ml podpuszczki na 11 L.",
    dosageTable: [
      { ingredient: "Kultura mezofilna", amount: "~0,15 tsp (~0,7 g)", notes: "MM-100 lub Flora Danica" },
      { ingredient: "Penicillium roqueforti", amount: "~1/16 tsp", notes: "Pleśń niebieska" },
      { ingredient: "Podpuszczka płynna", amount: "3 ml", notes: "Single strength" },
      { ingredient: "Sól", amount: "2-3% wagi sera", notes: "Suche solenie" }
    ],
    
    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie 32°C ~60 min",
        content: "Podgrzej mleko do 32°C. Dodaj kulturę mezofilną i Penicillium roqueforti. Pozostaw na 60 min.",
        tip: "Pleśń roqueforti dodawana na początku rozprowadza się w całym serze."
      },
      {
        title: "2) Krzepnięcie podpuszczka ~45 min",
        content: "Dodaj 3 ml podpuszczki. Pozostaw na 45 min do utworzenia delikatnego skrzepu.",
        warning: "Skrzep musi być delikatny - zbyt mocny da twardy ser."
      },
      {
        title: "3) Cięcie na duże kostki 2-3 cm",
        content: "Potnij skrzep na duże kostki 2-3 cm. Pozostaw na 10 min.",
        tip: "Duże kostki tworzą kieszonki powietrza gdzie rozwinie się pleśń."
      },
      {
        title: "4) Delikatne mieszanie i odsączanie",
        content: "Bardzo delikatnie mieszaj przez 15 min. Przełóż do formy warstwami.",
        warning: "Nie zgniataj ziaren - zachowaj otwartą strukturę!"
      },
      {
        title: "5) Samoociekanie 24h",
        content: "Pozostaw w formie bez prasowania przez 24h w temperaturze pokojowej. Obracaj co 2-3 godziny.",
        tip: "Grawitacja wystarczy - nie prasuj."
      },
      {
        title: "6) Solenie suche 3-4 dni",
        content: "Posyp ser solą ze wszystkich stron. Przez 3-4 dni codziennie dosolaj i obracaj.",
        tip: "Sól powoli wnika do środka."
      },
      {
        title: "7) Nakłuwanie - po 2 tygodniach",
        content: "Po 2 tygodniach nakłuj ser długą igłą (30-40 nakłuć) aby wpuścić powietrze dla pleśni.",
        warning: "Bez nakłuwania pleśń nie rozwinie się w środku!"
      },
      {
        title: "8) Dojrzewanie 2-4 miesiące",
        content: "Dojrzewaj w 10-13°C i 90-95% RH. Nakłuwaj co 2 tygodnie. Obracaj codziennie.",
        tip: "Dolce: 2 miesiące, Piccante: 3-4 miesiące."
      }
    ],
    
    notes: {
      tips: [
        "Nakłuwanie jest kluczowe - pleśń potrzebuje tlenu aby się rozwijać.",
        "Wysoka wilgotność (90-95%) jest niezbędna."
      ],
      warnings: [
        "Zbyt niska wilgotność = suchy ser bez pleśni.",
        "Zbyt ciasne formowanie = brak miejsca na pleśń."
      ],
      variants: [
        "Gorgonzola Dolce: kremowa, łagodna, 2 miesiące",
        "Gorgonzola Piccante: twarda, ostra, 3-4 miesiące"
      ]
    },
    
    flavor: {
      taste: "Kremowy, ostry, pikantny z nutami orzechowymi",
      texture: "Kremowa (Dolce) lub krucha (Piccante)",
      color: "Biało-kremowa z niebiesko-zielonymi żyłkami",
      aroma: "Intensywny, charakterystyczny dla serów pleśniowych"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 353,
      fatContent: 29,
      saturatedFatContent: 19,
      proteinContent: 21,
      carbohydrateContent: 2,
      sodiumContent: 1376,
      calciumContent: 528
    }
  },
  {
    id: "roquefort",
    zastosowanie: "Do sosów do steków i sałatek (klasyk: roquefort, orzech włoski, sałata, gruszka). W kuchni francuskiej dodaje się go do zapiekanek ziemniaczanych i masła ziołowego. Bardzo słony i intensywny, więc dozuj ostrożnie i nie sól potrawy, zanim go nie dodasz.",
    name: "Roquefort",
    difficulty: "Zaawansowany",
    description: "Roquefort to król francuskich serów pleśniowych, wytwarzany wyłącznie z mleka owiec rasy Lacaune w regionie Roquefort-sur-Soulzon. Dojrzewa w naturalnych jaskiniach przez minimum 3 miesiące. Ma status AOC od 1925 roku.",
    yield: "≈ 1,2 kg z 10 L mleka",
    ageTime: "3-5 miesięcy",
    image: roquefortImage,
    
    milkBase: "≈ 10 L mleka owczego (lub krowiego jako alternatywa).",
    starter: "Typ: kultura mezofilna + Penicillium roqueforti.",
    coagulant: "Płynna podpuszczka; ok. 2,5 ml na 10 L mleka.",
    salting: "Solenie suche przez 5 dni.",
    aging: "8-10°C, 95% RH przez 3-5 miesięcy w jaskini lub piwnicy.",
    
    cultureSubstitutes: [
      {
        name: "MM / MM-100",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,125 tsp (~0,6 g)",
        notes: "Główna kultura mezofilna.",
        searchQuery: "MM"
      },
      {
        name: "Penicillium roqueforti",
        type: "pleśń niebieska",
        shop: "Serowar.pl",
        dosage: "~1/16 tsp",
        notes: "Pleśń niebieska z Roquefort.",
        searchQuery: "roqueforti"
      }
    ],
    
    dosageReference: "Odniesienie: 1/8 tsp MM-100 + 1/16 tsp P. roqueforti + 2,5 ml podpuszczki na 10 L.",
    dosageTable: [
      { ingredient: "Kultura mezofilna", amount: "~0,125 tsp (~0,6 g)", notes: "MM-100" },
      { ingredient: "Penicillium roqueforti", amount: "~1/16 tsp", notes: "Pleśń niebieska" },
      { ingredient: "Podpuszczka płynna", amount: "2,5 ml", notes: "Single strength" },
      { ingredient: "Sól", amount: "3% wagi sera", notes: "Suche solenie" }
    ],
    
    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie 30-32°C ~90 min",
        content: "Podgrzej mleko owcze do 30-32°C. Dodaj kulturę mezofilną i Penicillium roqueforti. Pozostaw na 90 min.",
        tip: "Mleko owcze daje najbardziej autentyczny smak."
      },
      {
        title: "2) Krzepnięcie podpuszczka ~60 min",
        content: "Dodaj 2,5 ml podpuszczki. Długie krzepnięcie (60 min) dla delikatnego skrzepu.",
        warning: "Delikatny skrzep = otwarta tekstura dla pleśni."
      },
      {
        title: "3) Cięcie na kostki 2 cm",
        content: "Potnij skrzep na kostki 2 cm. Pozostaw na 15 min bez mieszania.",
        tip: "Duże kostki tworzą kieszonki dla pleśni."
      },
      {
        title: "4) Delikatne przekładanie do formy",
        content: "Bez mieszania! Delikatnie przekładaj ziarna do formy warstwami.",
        warning: "Zachowaj otwartą strukturę - nie zgniataj!"
      },
      {
        title: "5) Samoociekanie 24-48h",
        content: "Pozostaw w formie w temperaturze pokojowej na 24-48h. Obracaj co 3-4 godziny.",
        tip: "Cierpliwość - niech serwatka sama odpłynie."
      },
      {
        title: "6) Solenie suche 5 dni",
        content: "Posyp ser gruboziarnistą solą. Przez 5 dni codziennie dosolaj i obracaj.",
        tip: "Sól penetruje powoli - cierpliwość."
      },
      {
        title: "7) Nakłuwanie igłą",
        content: "Po 2-3 tygodniach nakłuj ser długą igłą (40-50 nakłuć) od góry i boków.",
        warning: "Nakłuwanie wpuszcza tlen dla Penicillium!"
      },
      {
        title: "8) Dojrzewanie w jaskini 3-5 miesięcy",
        content: "Dojrzewaj w 8-10°C i 95% RH. Nakłuwaj co 3 tygodnie. Minimum 3 miesiące.",
        tip: "Naturalna jaskinia lub piwnica z wysoką wilgotnością."
      }
    ],
    
    notes: {
      tips: [
        "Mleko owcze jest kluczowe dla autentycznego Roquefort.",
        "Naturalne jaskinie mają idealne warunki - wysoka wilgotność i stała temperatura."
      ],
      warnings: [
        "Bez nakłuwania pleśń nie rozwinie się.",
        "Zbyt niska wilgotność = suchy, pokruszony ser."
      ],
      variants: [
        "Roquefort klasyczny: minimum 3 miesiące",
        "Roquefort dojrzały: 5+ miesięcy, intensywniejszy"
      ]
    },
    
    flavor: {
      taste: "Intensywny, słony, pikantny, kremowy",
      texture: "Kremowa, krucha, rozpływająca się",
      color: "Biała z niebiesko-zielonymi żyłkami",
      aroma: "Intensywny, owczy, z nutami jaskini"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 369,
      fatContent: 31,
      saturatedFatContent: 19,
      proteinContent: 22,
      carbohydrateContent: 2,
      sodiumContent: 1809,
      calciumContent: 662
    }
  },
  {
    id: "stilton",
    zastosowanie: "Brytyjska klasyka to zupa krem z selera z serem stilton oraz stilton z portem na deskę serów. Dobrze wypada w sosie do steków, w tartach z gruszką i jako dodatek do burgerów. Kruszy się łatwiej niż gorgonzola, więc lepiej go rozdrabniać widelcem niż kroić.",
    name: "Stilton",
    difficulty: "Zaawansowany",
    description: "Stilton to angielski ser z niebieską pleśnią, często nazywany 'Królem Serów'. Może być produkowany tylko w trzech hrabstwach: Derbyshire, Leicestershire i Nottinghamshire. Znany od XVIII wieku, ma status PDO.",
    yield: "≈ 2 kg z 15 L mleka",
    ageTime: "9-12 tygodni",
    image: stiltonImage,
    
    milkBase: "≈ 15 L mleka pełnego krowiego (nie UHT; przy pasteryzowanym dodaj CaCl₂).",
    starter: "Typ: kultura mezofilna + Penicillium roqueforti.",
    coagulant: "Płynna podpuszczka; ok. 4 ml na 15 L mleka.",
    salting: "Solenie suche warstwowe podczas formowania.",
    aging: "10-12°C, 90% RH przez 9-12 tygodni.",
    
    cultureSubstitutes: [
      {
        name: "MM / MM-100",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,2 tsp (~0,9 g)",
        notes: "Główna kultura mezofilna.",
        searchQuery: "MM"
      },
      {
        name: "Penicillium roqueforti",
        type: "pleśń niebieska",
        shop: "Serowar.pl",
        dosage: "~1/8 tsp",
        notes: "Pleśń niebieska dla Stilton.",
        searchQuery: "roqueforti"
      }
    ],
    
    dosageReference: "Odniesienie: 0,2 tsp MM-100 + 1/8 tsp P. roqueforti + 4 ml podpuszczki na 15 L.",
    dosageTable: [
      { ingredient: "Kultura mezofilna", amount: "~0,2 tsp (~0,9 g)", notes: "MM-100" },
      { ingredient: "Penicillium roqueforti", amount: "~1/8 tsp", notes: "Pleśń niebieska" },
      { ingredient: "Podpuszczka płynna", amount: "4 ml", notes: "Single strength" },
      { ingredient: "Sól", amount: "2-2,5% wagi sera", notes: "Warstwowe solenie" }
    ],
    
    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie 30°C ~90 min",
        content: "Podgrzej mleko do 30°C. Dodaj kulturę mezofilną i Penicillium roqueforti. Pozostaw na 90 min.",
        tip: "Niższa temperatura = wolniejszy rozwój, lepszy smak."
      },
      {
        title: "2) Krzepnięcie podpuszczka ~90 min",
        content: "Dodaj 4 ml podpuszczki. Bardzo długie krzepnięcie (90 min) dla delikatnego skrzepu.",
        warning: "Stilton wymaga bardzo delikatnego skrzepu."
      },
      {
        title: "3) Cięcie na kostki 1,5 cm",
        content: "Potnij skrzep na kostki 1,5 cm. Bardzo delikatnie mieszaj przez 10 min.",
        tip: "Średnie kostki = balans wilgoci."
      },
      {
        title: "4) Odsączanie nocne",
        content: "Przełóż skrzep do worka płóciennego i powieś na noc do odsączenia.",
        warning: "Nie prasuj - grawitacja wystarczy."
      },
      {
        title: "5) Mielenie i solenie warstwowe",
        content: "Następnego dnia pokrusz skrzep na kawałki wielkości orzecha. Układaj w formie warstwami, soląc każdą warstwę.",
        tip: "2% soli równomiernie rozłożone."
      },
      {
        title: "6) Formowanie i obracanie 5-7 dni",
        content: "Pozostaw w formie w temperaturze pokojowej. Obracaj codziennie przez 5-7 dni.",
        tip: "Ser się konsoliduje sam."
      },
      {
        title: "7) Skórka i nakłuwanie",
        content: "Po utworzeniu skórki (2-3 tygodnie) nakłuj ser igłą (25-30 nakłuć).",
        warning: "Nakłuwanie dopiero po utworzeniu skórki!"
      },
      {
        title: "8) Dojrzewanie 9-12 tygodni",
        content: "Dojrzewaj w 10-12°C i 90% RH. Nie obracaj - Stilton dojrzewa stojąc.",
        tip: "Stilton nigdy się nie obraca podczas dojrzewania!"
      }
    ],
    
    notes: {
      tips: [
        "Stilton nigdy się nie obraca podczas dojrzewania - to unikalna cecha.",
        "Skórka naturalna tworzy się sama."
      ],
      warnings: [
        "Nie obracaj podczas dojrzewania!",
        "Nakłuwanie przed utworzeniem skórki = zbyt dużo pleśni na zewnątrz."
      ],
      variants: [
        "Blue Stilton: klasyczny z pleśnią",
        "White Stilton: bez pleśni, łagodniejszy"
      ]
    },
    
    flavor: {
      taste: "Intensywny, słodko-pikantny, orzechowy, kremowy",
      texture: "Kremowa w środku, bardziej zwarta na zewnątrz",
      color: "Kremowa z niebieskimi żyłkami, naturalna skórka",
      aroma: "Intensywny, aromatyczny, z nutami masła"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 410,
      fatContent: 35,
      saturatedFatContent: 22,
      proteinContent: 24,
      carbohydrateContent: 1,
      sodiumContent: 1150,
      calciumContent: 520
    }
  },
  {
    id: "gruyere",
    zastosowanie: "Fondue moitié-moitié, francuska zupa cebulowa zapiekana pod serem, croque-monsieur, quiche lorraine, sos Mornay i gratin dauphinois. Topi się gładko i nie rozdziela, dlatego jest pierwszym wyborem tam, gdzie ser ma tworzyć aksamitną warstwę, a nie ciągnące się nitki.",
    encyklopedia: [
      {
        pytanie: "Co to jest ser gruyère?",
        odpowiedz: "Gruyère to szwajcarski ser twardy z surowego mleka krowiego, produkowany głównie w kantonie Fryburg. Ma zwartą, praktycznie bezoczkową strukturę — w przeciwieństwie do ementalera nie ma dużych dziur, najwyżej pojedyncze drobne oczka. Smak jest orzechowo-słodkawy i staje się wyraźnie pikantniejszy z wiekiem. Zawiera około 49% tłuszczu w suchej masie. Oryginał nosi nazwę Le Gruyère AOP i może powstawać wyłącznie w Szwajcarii; sery „typu gruyère\" z innych krajów to osobna kategoria."
      },
      {
        pytanie: "Skąd pochodzi gruyère i co oznacza AOP?",
        odpowiedz: "Ser wywodzi się z regionu La Gruyère w kantonie Fryburg i bierze nazwę od miasteczka Gruyères. Skrót AOP to Appellation d'Origine Protégée — szwajcarski odpowiednik unijnej Chronionej Nazwy Pochodzenia; Le Gruyère nosi to oznaczenie od 2001 roku. Oznacza ono trzy twarde warunki: mleko musi być surowe i pochodzić z wyznaczonego obszaru, krowy nie mogą być karmione kiszonkami, a produkcja i dojrzewanie muszą odbywać się w regionie. Zakaz kiszonek nie jest folklorem — chroni przed przetrwalnikami Clostridium, które w długo dojrzewającym serze powodują późne wzdęcie."
      },
      {
        pytanie: "Jak smakuje gruyère i jak zmienia się z wiekiem?",
        odpowiedz: "Gruyère sprzedaje się w kilku stopniach dojrzałości i różnice są duże. Doux (około 5 miesięcy) jest łagodny, mleczno-orzechowy i gładko się topi. Mi-salé (7–8 miesięcy) i salé (9–10 miesięcy) stopniowo nabierają ostrości. Réserve dojrzewa 12 miesięcy i dłużej: smak robi się korzenny i pikantny, a w miąższu pojawiają się chrupiące kryształki tyrozyny — aminokwasu uwalnianego przy rozkładzie białka, oznaka długiego dojrzewania, a nie wada. Im starszy ser, tym bardziej kruszy się zamiast giąć."
      },
      {
        pytanie: "Do czego używać gruyère'a?",
        odpowiedz: "To ser stworzony do topienia — dojrzała kazeina i odpowiednie pH sprawiają, że rozpływa się gładko, zamiast rozdzielać na tłuszcz i nitki białka. Klasyka to fondue moitié-moitié (pół gruyère, pół vacherin fribourgeois), francuska zupa cebulowa zapiekana pod serem, croque-monsieur, quiche lorraine, sos Mornay i gratin dauphinois. Na desce serów najlepiej wypada wersja réserve, podana w temperaturze pokojowej."
      },
      {
        pytanie: "Jaki jest polski odpowiednik gruyère'a?",
        odpowiedz: "Najbliżej stoi Cezar z mleczarni w Rykach — długo dojrzewający ser twardy o lekko pikantnym smaku. Rzemieślniczą alternatywą jest Ser Marszowicki, robiony w typie gruyère. Jako zamienniki kulinarne najlepiej sprawdzają się francuskie sery alpejskie z tej samej rodziny: Comté i Beaufort mają najbardziej zbliżony profil. Ementaler zastąpi gruyère'a w daniach zapiekanych, choć jest wyraźnie łagodniejszy, a tam gdzie potrzeba mocnego aromatu — grana padano. Żaden z nich nie jest jednak gruyère'em w sensie prawnym."
      },
      {
        pytanie: "Ile kalorii ma gruyère i czy zawiera laktozę?",
        odpowiedz: "W 100 gramach jest około 413 kcal, 30 g pełnowartościowego białka i 32 g tłuszczu. To jeden z najbogatszych w wapń serów — blisko 1000 mg na 100 g, czyli tyle, ile w szklance mleka razy trzy. Laktozy praktycznie nie zawiera: przy dojrzewaniu trwającym pół roku i dłużej bakterie zużywają ją niemal w całości, więc bywa dobrze tolerowany przez osoby z nietolerancją laktozy. Ta sama zasada dotyczy wszystkich długo dojrzewających serów twardych."
      }
    ],
    name: "Gruyère",
    difficulty: "Zaawansowany",
    description: "Gruyère to szwajcarski ser alpejski z kantonu Fribourg, znany od XII wieku. Charakteryzuje się kremową teksturą z małymi oczkami i kompleksowym, orzechowym smakiem. Ma status AOC i jest podstawą fondue oraz quiche.",
    yield: "≈ 3 kg z 30 L mleka",
    ageTime: "5-12 miesięcy",
    image: gruyereImage,
    
    milkBase: "≈ 30 L mleka pełnego krowiego (surowe lub pasteryzowane z CaCl₂).",
    starter: "Typ: kultura termofilna + Propionibacterium dla oczek.",
    coagulant: "Płynna podpuszczka; ok. 7,5 ml na 30 L mleka.",
    salting: "Solanka nasycona przez 24h.",
    aging: "13-14°C, 92% RH przez 5-12 miesięcy z myciem skórki.",
    
    cultureSubstitutes: [
      {
        name: "TA / TA-61",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "~0,25 tsp (~1,2 g)",
        notes: "Główna kultura termofilna.",
        searchQuery: "TA"
      },
      {
        name: "LH / LH-100",
        type: "Helveticus",
        shop: "GAP Poland",
        dosage: "~0,06 tsp (~0,3 g)",
        notes: "Dla słodkiej nuty i charakterystycznego smaku.",
        searchQuery: "LH"
      },
      {
        name: "Propionic Shermanii",
        type: "propionic",
        shop: "Serowar.pl",
        dosage: "~1/16 tsp",
        notes: "Dla tworzenia oczek (opcjonalnie).",
        searchQuery: "propionic"
      }
    ],
    
    dosageReference: "Odniesienie: 1/4 tsp TA-61 + 1/16 tsp LH-100 + 7,5 ml podpuszczki na 30 L.",
    dosageTable: [
      { ingredient: "Kultura termofilna", amount: "~0,25 tsp (~1,2 g)", notes: "TA-61" },
      { ingredient: "Kultura Helveticus", amount: "~0,06 tsp (~0,3 g)", notes: "LH-100" },
      { ingredient: "Propionic (opcjonalnie)", amount: "~1/16 tsp", notes: "Dla oczek" },
      { ingredient: "Podpuszczka płynna", amount: "7,5 ml", notes: "Single strength" },
      { ingredient: "Sól (solanka)", amount: "24h", notes: "Solanka nasycona" }
    ],
    
    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie 32°C ~45 min",
        content: "Podgrzej mleko do 32°C. Dodaj kultury termofilne i Helveticus. Opcjonalnie Propionic. Pozostaw na 45 min.",
        tip: "Propionic tworzy charakterystyczne oczka."
      },
      {
        title: "2) Krzepnięcie podpuszczka ~30 min",
        content: "Dodaj 7,5 ml podpuszczki. Pozostaw na 30 min do utworzenia mocnego skrzepu.",
        warning: "Mocny skrzep = twardy ser."
      },
      {
        title: "3) Cięcie na drobne ziarna 3-5 mm",
        content: "Potnij skrzep na bardzo drobne ziarna (3-5 mm) używając harfy serowej.",
        tip: "Im drobniejsze ziarna, tym twardszy ser."
      },
      {
        title: "4) Gotowanie do 55°C przez 45 min",
        content: "Powoli podgrzewaj do 55°C przez 45 min, ciągle mieszając. Tempo ~0,5°C/min.",
        warning: "Zbyt szybkie podgrzewanie = nierówna tekstura."
      },
      {
        title: "5) Odsączanie i formowanie pod serwatką",
        content: "Przełóż ziarna do formy pod lustrem serwatki. Formuj pod ciśnieniem hydraulicznym.",
        tip: "Formowanie pod serwatką = brak dziur powietrznych."
      },
      {
        title: "6) Prasowanie ciężkie 24h",
        content: "Prasuj ciężarem ~10x wagi sera (30 kg na 3 kg sera) przez 24h. Obracaj co 6h.",
        warning: "Ciężkie prasowanie jest kluczowe!"
      },
      {
        title: "7) Solenie w solance 24h",
        content: "Zanurz ser w nasyconej solance na 24h. Temperatura solanki 12-15°C.",
        tip: "Sól wnika powoli do twardego sera."
      },
      {
        title: "8) Dojrzewanie 5-12 miesięcy",
        content: "Dojrzewaj w 13-14°C i 92% RH. Myj skórkę solanką 2x w tygodniu. Obracaj codziennie.",
        tip: "Mycie skórki: solanka + bakterie nadają kolor i smak."
      }
    ],
    
    notes: {
      tips: [
        "Mycie skórki solanką tworzy charakterystyczny brązowy kolor.",
        "Dłuższe dojrzewanie = intensywniejszy smak."
      ],
      warnings: [
        "Zbyt niska temperatura gotowania = ser z dużymi oczkami (nie Gruyère).",
        "Bez mycia skórki ser wyschnie."
      ],
      variants: [
        "Gruyère młody: 5-6 miesięcy, łagodniejszy",
        "Gruyère dojrzały: 10-12 miesięcy, intensywny",
        "Gruyère Reserve: 15+ miesięcy, bardzo intensywny"
      ]
    },
    
    flavor: {
      taste: "Orzechowy, słodki, lekko słony, kompleksowy",
      texture: "Twarda, gładka, kremowa w ustach",
      color: "Bladożółta do ciemnożółtej, brązowa skórka",
      aroma: "Orzechowy, ziemisty, z nutami masła"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 413,
      fatContent: 32,
      saturatedFatContent: 19,
      proteinContent: 30,
      carbohydrateContent: 0,
      sodiumContent: 819,
      calciumContent: 1011
    }
  },
  {
    id: "emmental",
    zastosowanie: "Fondue (klasycznie razem z gruyère'em), zapiekanki, tosty, pizza, sos czterech serów, sałatki i kanapki. Jeden z najbardziej uniwersalnych serów do topienia — łagodny, więc nie zdominuje innych składników. Na desce serów podawaj go z winogronami i orzechami.",
    encyklopedia: [
      {
        pytanie: "Co to jest ementaler?",
        odpowiedz: "Ementaler to szwajcarski ser podpuszczkowy z doliny rzeki Emme w kantonie Berno, wytwarzany tam od XIII wieku. Jest twardy, ma jasnożółtą barwę, elastyczny miąższ i charakterystyczne duże, owalne oczka. Smak ma łagodny, lekko słodki i orzechowy — to jeden z najłatwiejszych w odbiorze serów dojrzewających. Zawiera około 45% tłuszczu w suchej masie. Oryginał to Emmentaler AOP ze Szwajcarii, ale sama nazwa „ementaler\" nie jest zastrzeżona, więc ser tego typu produkują też Francja i Polska."
      },
      {
        pytanie: "Skąd się biorą dziury w ementalerze?",
        odpowiedz: "Z fermentacji propionowej — trzeciej fermentacji, która zachodzi już po ukwaszeniu i po prasowaniu. Bakterie Propionibacterium freudenreichii zjadają kwas mlekowy wytworzony wcześniej przez kultury startowe i przerabiają go na kwas propionowy, kwas octowy i dwutlenek węgla. CO₂ nie ma jak uciec z zamkniętego, szczelnego bochna, więc zbiera się w pęcherzykach i rozpycha elastyczną masę od środka. Dzieje się to w tak zwanej piwnicy ciepłej, w temperaturze około 20–24°C, przez 3 do 8 tygodni. Najciekawsze jest to, że dziury i smak mają jedno źródło: kwas propionowy odpowiada również za słodko-orzechowy profil sera. Nie da się mieć jednego bez drugiego."
      },
      {
        pytanie: "Czy dziury w serze zawsze są pożądane?",
        odpowiedz: "Nie — i to ta sama mechanika, tylko z innym sprawcą. W ementalerze gaz produkują bakterie propionowe w kontrolowanych warunkach i efektem są gładkie, regularne, okrągłe oczka. Gdy gaz wytwarzają przetrwalniki Clostridium tyrobutyricum, pochodzące najczęściej z kiszonek w paszy, mówimy o późnym wzdęciu: ser pęka nieregularnymi szczelinami, rozdyma się i nabiera masłowo-zjełczałego posmaku. Odróżnisz je po kształcie i po zapachu — oczka propionowe są równe i lśniące, wzdęcie daje poszarpane pustki. Dlatego serowarnie robiące sery długo dojrzewające tak pilnują, żeby mleko nie pochodziło od krów karmionych kiszonką."
      },
      {
        pytanie: "Jak smakuje ementaler i do czego się nadaje?",
        odpowiedz: "Młody jest łagodny, lekko słodkawy, z wyraźną nutą orzecha. Wersje dojrzewające ponad 12 miesięcy stają się intensywniejsze, pikantne i bardziej kruche. Dzięki doskonałej topliwości ementaler jest jednym z najbardziej uniwersalnych serów w kuchni: sprawdza się w fondue (klasycznie razem z gruyère'em), zapiekankach, tostach, na pizzy, w sosie czterech serów i w sałatkach. Na zimno dobrze wypada w kanapkach oraz na desce serów z winogronami i orzechami."
      },
      {
        pytanie: "Czy w Polsce produkuje się ementaler?",
        odpowiedz: "Tak. Sery typu szwajcarskiego z oczkami mają w ofercie między innymi Mlekovita, Mlekpol i OSM Ryki — najczęściej w blokach i plastrach. Różnice wobec szwajcarskiego oryginału są dwie: polskie wersje powstają zwykle z mleka pasteryzowanego, a nie surowego, i dojrzewają krócej, przez co smak jest łagodniejszy i mniej złożony. Ponieważ nazwa „ementaler\" nie jest chroniona — w przeciwieństwie do Emmentaler AOP — używanie jej jest w pełni legalne."
      },
      {
        pytanie: "Ile kalorii ma ementaler i czy zawiera laktozę?",
        odpowiedz: "W 100 gramach jest około 383 kcal, 28,2 g białka i 29,7 g tłuszczu. To ser bardzo bogaty w wapń — blisko 1000 mg na 100 g — oraz w fosfor i witaminę B12. Laktozy praktycznie nie zawiera: podczas kilkumiesięcznego dojrzewania bakterie zużywają ją całkowicie, najpierw kultury startowe na kwas mlekowy, a potem bakterie propionowe na kwas propionowy i CO₂. Dlatego bywa dobrze tolerowany przez osoby z nietolerancją laktozy."
      }
    ],
    video: { youtubeId: "tMqZZHbp0-A", title: "Domowy ser w stylu Emmentaler", channel: "Domowy ser", poster: emmentalerMiniaturaImage },
    name: "Emmental",
    difficulty: "Zaawansowany",
    description: "Emmental (Emmentaler) to słynny szwajcarski ser z doliny Emme w kantonie Berno. Znany z charakterystycznych dużych oczek tworzonych przez bakterie propionowe. Jest jednym z największych serów świata - koła mogą ważyć do 130 kg.",
    yield: "≈ 4 kg z 40 L mleka",
    ageTime: "4-12 miesięcy",
    image: emmentalImage,
    
    milkBase: "≈ 40 L mleka pełnego krowiego (najlepiej surowe; przy pasteryzowanym dodaj CaCl₂).",
    starter: "Typ: kultura termofilna + Propionibacterium shermanii dla oczek.",
    coagulant: "Płynna podpuszczka; ok. 10 ml na 40 L mleka.",
    salting: "Solanka nasycona przez 48h.",
    aging: "Etapowe: 10°C → 22°C → 10°C przez 4-12 miesięcy.",
    
    cultureSubstitutes: [
      {
        name: "TA / TA-61",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "~0,3 tsp (~1,5 g)",
        notes: "Główna kultura termofilna.",
        searchQuery: "TA"
      },
      {
        name: "LH / LH-100",
        type: "Helveticus",
        shop: "GAP Poland",
        dosage: "~0,08 tsp (~0,4 g)",
        notes: "Dla słodkiej nuty.",
        searchQuery: "LH"
      },
      {
        name: "Propionic Shermanii",
        type: "propionic",
        shop: "Serowar.pl",
        dosage: "~1/8 tsp",
        notes: "KLUCZOWY dla tworzenia oczek!",
        searchQuery: "propionic"
      }
    ],
    
    dosageReference: "Odniesienie: 0,3 tsp TA-61 + 0,08 tsp LH-100 + 1/8 tsp Propionic + 10 ml podpuszczki na 40 L.",
    dosageTable: [
      { ingredient: "Kultura termofilna", amount: "~0,3 tsp (~1,5 g)", notes: "TA-61" },
      { ingredient: "Kultura Helveticus", amount: "~0,08 tsp (~0,4 g)", notes: "LH-100" },
      { ingredient: "Propionic Shermanii", amount: "~1/8 tsp", notes: "KLUCZOWY dla oczek!" },
      { ingredient: "Podpuszczka płynna", amount: "10 ml", notes: "Single strength" },
      { ingredient: "Sól (solanka)", amount: "48h", notes: "Solanka nasycona" }
    ],
    
    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie 32°C ~30 min",
        content: "Podgrzej mleko do 32°C. Dodaj wszystkie kultury: termofilna, Helveticus i Propionic. Pozostaw na 30 min.",
        tip: "Propionic jest absolutnie kluczowy dla oczek!"
      },
      {
        title: "2) Krzepnięcie podpuszczka ~30 min",
        content: "Dodaj 10 ml podpuszczki. Pozostaw na 30 min do utworzenia mocnego skrzepu.",
        warning: "Mocny skrzep potrzebny dla dużego sera."
      },
      {
        title: "3) Cięcie na drobne ziarna 3-5 mm",
        content: "Potnij skrzep na bardzo drobne ziarna (3-5 mm, wielkość pszenicy) używając harfy.",
        tip: "Drobne ziarna = mało wilgoci = duży, twardy ser."
      },
      {
        title: "4) Gotowanie do 52-55°C przez 45 min",
        content: "Powoli podgrzewaj do 52-55°C przez 45 min, ciągle mieszając.",
        warning: "Emmental wymaga wysokiej temperatury gotowania."
      },
      {
        title: "5) Formowanie pod serwatką i prasowanie",
        content: "Zbierz ziarna w płótno pod lustrem serwatki. Prasuj bardzo ciężko (50-60 kg) przez 24h.",
        tip: "Duży ser wymaga ciężkiego prasowania. Ciekawostka: Licznerski (1922) zalecał jeszcze cięższą prasę — do 100 kg na każdy 1 kg sera (nawet 400 kg dla 4-kilogramowego koła!), co dawało maksymalnie zwarty blok."
      },
      {
        title: "6) Solenie w solance 48h",
        content: "Zanurz ser w nasyconej solance na 48h (1 dzień na każdy kg + 1 dzień).",
        warning: "Duży ser potrzebuje dłuższego solenia."
      },
      {
        title: "7) Wstępne dojrzewanie 10°C - 2 tygodnie",
        content: "Dojrzewaj w chłodnym magazynie (10°C, 85% RH) przez 2 tygodnie.",
        tip: "Wstępne dojrzewanie przed etapem ciepłym."
      },
      {
        title: "8) Ciepłe dojrzewanie 22°C - 4-6 tygodni",
        content: "Przenieś do ciepłego magazynu (22°C, 85% RH). Tu tworzą się oczka! Obserwuj puchnięcie sera.",
        warning: "To etap tworzenia oczek - ser puchnie od CO₂!"
      },
      {
        title: "9) Końcowe dojrzewanie 10°C - 3-10 miesięcy",
        content: "Wróć do chłodni (10°C, 85% RH). Dojrzewaj 3-10 miesięcy. Obracaj co tydzień.",
        tip: "Im dłużej, tym intensywniejszy smak."
      }
    ],
    
    notes: {
      tips: [
        "Etap ciepły (22°C) jest kluczowy - to wtedy Propionic tworzy oczka.",
        "Ser powinien widocznie 'puchnąć' podczas ciepłego dojrzewania.",
        "Ciekawostka hist.: Licznerski (1922) zalecał prasowanie ementala obciążeniem do 100 kg na kg sera — znacznie więcej niż współczesne 50-60 kg, co dawało maksymalnie zwarty blok."
      ],
      warnings: [
        "Bez Propionic = brak oczek!",
        "Zbyt krótki etap ciepły = małe oczka.",
        "Zbyt długi etap ciepły = pęknięcia w serze."
      ],
      variants: [
        "Emmental młody: 4 miesiące, łagodny",
        "Emmental dojrzały: 8-12 miesięcy, intensywny",
        "Emmental Reserve: 14+ miesięcy, bardzo intensywny"
      ]
    },
    
    flavor: {
      taste: "Słodki, orzechowy, maślany, lekko owocowy",
      texture: "Twarda ale elastyczna, duże oczka",
      color: "Bladożółta, kremowa, z dużymi okrągłymi oczkami",
      aroma: "Orzechowy, słodki, lekko fermentowany"
    },
    
    nutrition: {
      servingSize: "100 g",
      calories: 380,
      fatContent: 28,
      saturatedFatContent: 18,
      proteinContent: 28,
      carbohydrateContent: 0,
      sodiumContent: 610,
      calciumContent: 970
    }
  },
  {
    id: "quartirolo",
    zastosowanie: "Młody quartirolo jest kwaskowaty i kremowy — do kanapek, na deskę serów, z oliwą i pieprzem. Dojrzalszy, bardziej maślany, dobrze wypada zapieczony na grzance albo pokruszony na sałatkę z gruszką. W Lombardii podaje się go z polentą.",
    name: "Quartirolo Lombardo",
    difficulty: "Średni",
    description: 'Quartirolo Lombardo to miękki ser z Lombardii o delikatnej, kremowej konsystencji i subtelnym, lekko kwaskowatym smaku. Nazwa pochodzi od "quartirola" — czwartego pokosu trawy, którym karmiono krowy wracające z alpejskich pastwisk jesienią. Ser należy do rodziny stracchino (od "stracca" — zmęczona krowa po zejściu z gór). Jan Licznerski opisał go w "Praktycznym serowarstwie" (1922) jako ser włoski o unikalnym procesie stufatury — gotowania parą, który nadaje mu kremową teksturę bez potrzeby prasowania. Quartirolo ma PDO od 1996 roku.',
    yield: "≈ 0,8–1,0 kg z 8 L mleka",
    ageTime: "Młody: 5–10 dni · dojrzały: 30–60 dni",
    image: quartiroloImage,

    milkBase: "≈ 8 L mleka pełnego krowiego (tradycyjnie surowego; przy pasteryzowanym dodaj CaCl₂ — ok. 1/4 tsp na 8 L rozcieńczonego w 50 ml wody).",
    starter: "Kultura termofilna (np. TA-61, MST, ST-20) — wg producenta, typowo ~1/8 tsp na 8 L. Można zastąpić mezofilną (Flora Danica, MA 4001) dla łagodniejszego profilu.",
    coagulant: "Płynna podpuszczka single-strength; ~2 ml na 8 L mleka. Czas krzepnięcia 25–35 min.",
    salting: "Solenie suche: ~15 g soli na każdy kg sera, posypywane na powierzchnię — góra, obrót po 6 h, spód. Można też solanka 18–20% przez 1,5–2 h.",
    aging: "Młody (fresco): 5–10 dni w 4–8°C. Dojrzały (maturo): 30–60 dni w 10–13°C, 85–90% RH, obracanie co 2 dni.",

    cultureSubstitutes: [
      {
        name: "TA / TA-61 (Choozit)",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "~1/8 tsp (~0,6 g) na 8 L",
        notes: "Klasyczna termofilna — delikatna kwasowość, kremowa konsystencja.",
        searchQuery: "TA"
      },
      {
        name: "MST / MST-910",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "~1/8 tsp (~0,6 g) na 8 L",
        notes: "Streptococcus thermophilus — łagodny profil, dobra do serów miękkich.",
        searchQuery: "MST"
      },
      {
        name: "ST / ST-20",
        type: "termofilna",
        shop: "Artiser.pl",
        dosage: "~1/8 tsp (~0,6 g) na 8 L",
        notes: "Podstawowa termofilna, uniwersalna.",
        searchQuery: "ST"
      },
      {
        name: "Flora Danica (alternatywa mezofilna)",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "wg producenta",
        notes: "Daje łagodniejszy, bardziej maślany profil — wariant domowy.",
        searchQuery: "Flora Danica"
      },
      {
        name: "ALPHA 10 / ALPHA 12 (alternatywa mezofilna)",
        type: "mezofilna",
        shop: "Lactic.pl",
        dosage: "wg producenta",
        notes: "Mezofilna o delikatnej dynamice kwaszenia.",
        searchQuery: "ALPHA"
      }
    ],

    dosageReference: "Odniesienie: ~0,6 g kultury termofilnej + ~2 ml podpuszczki na 8 L mleka krowiego.",
    dosageTable: [
      { ingredient: "Mleko krowie pełne", amount: "≈ 8 L", notes: "Surowe lub pasteryzowane (+ CaCl₂)" },
      { ingredient: "Kultura termofilna", amount: "~1/8 tsp (~0,6 g)", notes: "TA-61, MST lub ST-20" },
      { ingredient: "Podpuszczka płynna", amount: "~2 ml", notes: "Single strength; krzepnięcie 25–35 min" },
      { ingredient: "Chlorek wapnia (CaCl₂)", amount: "~1/4 tsp", notes: "Tylko dla mleka pasteryzowanego, w 50 ml wody" },
      { ingredient: "Sól", amount: "~15 g/kg sera", notes: "Solenie suche lub solanka 18–20%" }
    ],

    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie — 37°C, 45 min",
        content: "Podgrzej 8 L mleka do 37°C. Posyp kulturę termofilną (~1/8 tsp) równomiernie po powierzchni, odczekaj 2 min aż nawilży, następnie wmieszaj ruchami góra-dół przez 1 min. Pozostaw na 45 min pod przykryciem.",
        tip: "Licznerski podkreślał: mleko powinno być świeże, najlepiej wieczorne — daje więcej tłuszczu niż poranne."
      },
      {
        title: "2) Krzepnięcie — podpuszczka, 25–35 min",
        content: "Rozcieńcz ~2 ml podpuszczki w 30 ml chłodnej wody. Wlej do mleka, mieszaj delikatnie góra-dół przez 30 sekund. Przykryj i pozostaw w spokoju na 25–35 min.",
        warning: "Test skrzepu: wsadź nóż pod kątem 45° — skrzep powinien łamać się czysto, a serwatka w szczelinie być zielonkawa, nie mleczna."
      },
      {
        title: "3) Krojenie skrzepu — duże kostki 3–4 cm",
        content: "Pokrój skrzep w kostki 3–4 cm — dużo większe niż przy twardych serach! Najpierw cięcia pionowe w kratkę, potem jedno cięcie poziome. Pozostaw 10 min — niech serwatka wystąpi naturalnie.",
        tip: "To klucz do quartirolo: duże ziarna = dużo wilgoci = kremowa, miękka konsystencja. Nie mąć więcej niż trzeba!"
      },
      {
        title: "4) Delikatne mieszanie — 10–15 min w 37°C",
        content: "Mieszaj ziarna bardzo delikatnie przez 10–15 min, utrzymując temperaturę 37°C. Ziarna powinny lekko się obkurczyć na powierzchni, ale środek ma pozostać miękki i wilgotny.",
        warning: "Nie podgrzewaj powyżej 38°C! Quartirolo to ser miękki — za dużo ciepła wysusza ziarna i traci się kremową teksturę."
      },
      {
        title: "5) Stufatura — gotowanie parą 37–42°C, 1–1,5 h",
        content: "Odcedź większość serwatki. Przygotuj stufaturę: duży garnek z kratką kilka cm nad wodą o temp. 49–50°C. Przełóż ziarna do form wyłożonych gazą, ustaw na kratce, przykryj garnek. Obracaj ser w formie co 20–30 min.",
        tip: "Stufatura to sekret quartirolo i caciotta — para utrzymuje bakterie aktywne, kończy fermentację laktozy i nadaje serowi jedwavistą teksturę. Licznerski opisał ten proces szczegółowo jako unikalny dla serów włoskich."
      },
      {
        title: "6) Chłodzenie i odsączanie — noc w temp. pokojowej",
        content: "Zdejmij formy z garnka. Usuń gazę po 1 h. Zostaw ser w formach w temperaturze pokojowej (18–22°C) na noc — ser dalej oddaje serwatkę i konsoliduje się. Obróć 2–3 razy.",
        warning: "Bez prasowania! Quartirolo formuje się wyłącznie pod własnym ciężarem. Dociśkanie zniszczy kremową strukturę."
      },
      {
        title: "7) Solenie suche — ~15 g/kg, 12–24 h",
        content: "Wyjący ser z formy powinien być biały, zwięzły, ale miękki w dotyku. Posyp górną powierzchnię solą (~7–8 g). Po 6–12 h obróć i posól drugą stronę. Łączny czas solenia: 12–24 h.",
        tip: "Solenie suche daje quartirolo bardziej wyrazistą skórkę niż solanka. Możesz też użyć solanki 18–20% przez 1,5–2 h na kg — wtedy skórka będzie bardziej gładka."
      },
      {
        title: "8) Dojrzewanie — fresco (5–10 dni) lub maturo (30–60 dni)",
        content: "Młody (fresco): przenieś do lodówki (4–8°C) na 5–10 dni. Dojrzały (maturo): trzymaj w 10–13°C i 85–90% wilgotności przez 30–60 dni, obracając co 2 dni i wycierając ewentualną pleśń.",
        tip: "Młody quartirolo — śnieżnobiały, delikatny, lekko kwaskowy, idealny na sałatki. Dojrzały — skórka różowieje, środek staje się płynny, smak intensywny i złożony."
      }
    ],

    notes: {
      tips: [
        "Stufatura to kluczowy etap — bez niej ser będzie suchy i kruchy zamiast kremowego.",
        "Młody quartirolo (fresco) jest gotowy już po 5 dniach — idealny dla niecierpliwych!",
        "Użyj mleka wieczornego — Licznerski podkreślał, że jest tłustsze od porannego i daje lepszy ser miękki."
      ],
      warnings: [
        "Nigdy nie prasuj quartirolo — formuje się wyłącznie pod własnym ciężarem.",
        "Dojrzały quartirolo (maturo) wymaga kontroli wilgotności — za sucho = twardy, za mokro = nadmiar pleśni.",
        "Surowe mleko: dojrzewaj min. 60 dni (wymogi RHD) lub pasteryzuj i dodaj CaCl₂."
      ],
      variants: [
        "Fresco (5–10 dni): biały, delikatny, lekko kwaskowy — do sałatek i kanapek.",
        "Maturo (30–60 dni): żółtawy, intensywny, płynny środek — jak dojrzały brie.",
        "Z mlekiem kozim: ostrzejszy smak, bięlśsza barwa, szybsze dojrzewanie.",
        "Z ziołami: tymianek lub rozmaryn wmieszany do ziarna przed formowaniem."
      ]
    },

    flavor: {
      taste: "Łagodny, śmietankowy, lekko kwaskowy; z dojrzewaniem: intensywny, złożony, grzybowy",
      texture: "Miękka, kremowa, rozpływająca się — młody zwarty, dojrzały płynny w środku",
      color: "Śnieżnobiała (fresco); jasnożółta z różową skórką (maturo)",
      aroma: "Delikatny, mleczny (fresco); intensywny, ziemisty, grzybowy (maturo)"
    },

    nutrition: {
      servingSize: "100 g",
      calories: 295,
      fatContent: 23,
      saturatedFatContent: 15,
      proteinContent: 19,
      carbohydrateContent: 1,
      sodiumContent: 520,
      calciumContent: 480
    }
  },
  {
    id: "limburski",
    zastosowanie: "Ser o bardzo intensywnym zapachu, w Niemczech i Belgii jadany klasycznie na ciemnym chlebie z cebulą i musztardą, popijany piwem. W kuchni używa się go oszczędnie — kawałek dodany do sosu lub zapiekanki daje głęboki, mięsny aromat. Trzymaj go w szczelnym pojemniku.",
    name: "Ser Limburski",
    difficulty: "Zaawansowany",
    description: 'Ser limburski (limburger) to miękki ser z mytą skórką, znany z intensywnego, przenikliwego zapachu i kremowej, rozlewnej konsystencji. Pochodzi z regionu Limburgii (pogranicze Belgii, Holandii i Niemiec). Charakterystyczną pomarańczowo-różową skórkę tworzą bakterie Brevibacterium linens, rozwijające się dzięki regularnemu myciu powierzchni roztworem solankowym. Jan Licznerski opisał go w "Praktycznym serowarstwie" (1922) jako ser "który pachnie tak, że nie każdy wytrzyma" — ale podał jeden z najdokładniejszych opisów jego produkcji w polskim piśmiennictwie.',
    yield: "≈ 0,8–1,0 kg z 8 L mleka",
    ageTime: "4–8 tygodni (mycie skórki co 2–3 dni)",
    image: limburskiImage,

    milkBase: "≈ 8 L mleka pełnego krowiego (tradycyjnie surowego; przy pasteryzowanym dodaj CaCl₂ — ok. 1/4 tsp na 8 L w 50 ml wody).",
    starter: 'Kultura mezofilna (np. MA 4001, Flora Danica) — wg producenta + kultura do mytej skórki: Brevibacterium linens (np. BLC, SR3, Munster Red) do solanki do mycia.',
    coagulant: "Płynna podpuszczka single-strength; ~2 ml na 8 L mleka. Czas krzepnięcia 30–40 min.",
    salting: "Solenie suche: ~20 g soli na każdy kg sera (góra + dół), potem mycie solanką 3–5% co 2–3 dni przez cały okres dojrzewania.",
    aging: "Dojrzewanie: 4–8 tygodni w 12–15°C, 90–95% RH. Mycie skórki solanką z B. linens co 2–3 dni — kluczowy etap.",

    cultureSubstitutes: [
      {
        name: "MA 4001 / MA 4002 (Choozit MA)",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "wg producenta (~1/8 tsp na 8 L)",
        notes: "Podstawowa mezofilna do sera limburskiego — łagodna kwasowość.",
        searchQuery: "MA 4001"
      },
      {
        name: "Flora Danica",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "wg producenta",
        notes: "Klasyczna mezofilna — delikatny, maślany profil pod mytą skórkę.",
        searchQuery: "Flora Danica"
      },
      {
        name: "BLC / Brevibacterium linens",
        type: "powierzchniowa (do mytej skórki)",
        shop: "Serowar.pl / Artiser.pl",
        dosage: "wg producenta (do solanki do mycia)",
        notes: "Kluczowa kultura! Tworzy pomarańczową skórkę i zapach. Dodawana do solanki myciowej.",
        searchQuery: "Brevibacterium"
      },
      {
        name: "SR3 / Munster Red",
        type: "powierzchniowa (do mytej skórki)",
        shop: "Artiser.pl",
        dosage: "wg producenta",
        notes: "Alternatywa BLC — daje łagodniejszą skórkę, mniej intensywny zapach.",
        searchQuery: "SR3"
      },
      {
        name: "Geotrichum candidum (GEO)",
        type: "powierzchniowa (pomocnicza)",
        shop: "Serowar.pl / Artiser.pl",
        dosage: "wg producenta (do solanki lub oprysku)",
        notes: "Opcjonalnie: obniża pH skórki przed B. linens — ułatwia rozwój bakterii.",
        searchQuery: "Geotrichum"
      }
    ],

    dosageReference: "Odniesienie: kultura mezofilna wg producenta + ~2 ml podpuszczki na 8 L mleka + B. linens do solanki myciowej.",
    dosageTable: [
      { ingredient: "Mleko krowie pełne", amount: "≈ 8 L", notes: "Surowe lub pasteryzowane (+ CaCl₂)" },
      { ingredient: "Kultura mezofilna", amount: "wg producenta", notes: "MA 4001 lub Flora Danica" },
      { ingredient: "Podpuszczka płynna", amount: "~2 ml", notes: "Single strength; krzepnięcie 30–40 min" },
      { ingredient: "Chlorek wapnia (CaCl₂)", amount: "~1/4 tsp", notes: "Tylko dla mleka pasteryzowanego" },
      { ingredient: "Brevibacterium linens", amount: "wg producenta", notes: "BLC lub SR3 — do solanki myciowej" },
      { ingredient: "Sól (solenie + mycie)", amount: "~20 g/kg + solanka 3–5%", notes: "Solenie suche + solanka do mycia skórki" }
    ],

    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie — 32°C, 30–45 min",
        content: "Podgrzej 8 L mleka do 32°C. Posyp kulturę mezofilną równomiernie po powierzchni, odczekaj 2 min, wmieszaj ruchami góra-dół. Pozostaw pod przykryciem na 30–45 min.",
        tip: "Limburski to ser mezofilny — niższa temperatura (32°C) niż quartirolo (37°C). Daje łagodniejszy, bardziej maślany profil startowy."
      },
      {
        title: "2) Krzepnięcie — podpuszczka, 30–40 min",
        content: "Rozcieńcz ~2 ml podpuszczki w 30 ml chłodnej wody. Wlej do mleka, mieszaj delikatnie 30 sekund. Przykryj i pozostaw w spokoju na 30–40 min.",
        warning: "Test skrzepu: nóż pod kątem 45° — skrzep łamie się czysto, serwatka zielonkawa. Limburski wymaga delikatnego skrzepu — nie przedłużaj krzepnięcia."
      },
      {
        title: "3) Krojenie skrzepu — kostki 2–3 cm",
        content: "Pokrój skrzep w kostki 2–3 cm. Cięcia pionowe w kratkę, jedno cięcie poziome. Odczekaj 5 min, potem delikatnie mieszaj przez 10 min.",
        tip: "Większe kostki niż przy twardych serach, ale mniejsze niż przy quartirolo. Limburski jest miękki, ale nie aż tak rozlewny."
      },
      {
        title: "4) Delikatne mieszanie — 15 min w 32°C, bez podgrzewania",
        content: "Mieszaj ziarna bardzo delikatnie przez 15 min, utrzymując 32°C. Ziarna powinny obkurczyć się lekko na powierzchni. NIE podgrzewaj — limburski dojrzewa dzięki bakteriom na skórce, nie ciepłu.",
        warning: "Podgrzewanie powyżej 33°C suszy ziarna i zmniejsza wilgotność sera — limburski musi być wilgotny, żeby B. linens mogły pracować."
      },
      {
        title: "5) Odsączanie i formowanie — bez prasowania",
        content: "Odcedź serwatkę do poziomu ziarna. Delikatnie przełóż ziarna do form kwadratowych lub prostokątnych (tradycyjny kształt limburskiego) wyłożonych gazą. Ser formuje się pod własnym ciężarem — nie dociskaj!",
        tip: "Licznerski opisywał małe formy prostokątne (~250–500 g) — idealny format domowy. Ser w mniejszych formach dojrzewa szybciej i równomierniej."
      },
      {
        title: "6) Odwracanie — co 30 min przez 4–6 h",
        content: "Przez pierwsze 4–6 h obracaj ser w formie co 30 min (6–12 obróceń). Ser oddaje serwatkę i konsoliduje się. Po tym czasie zostaw na noc w temp. pokojowej (18–22°C).",
        warning: "Częste obracanie jest kluczowe — zapewnia równomierne odsączanie i gładką powierzchnię pod przyszłą skórkę."
      },
      {
        title: "7) Solenie suche — ~20 g/kg, 24 h",
        content: "Wyjmij ser z formy. Posyp górną powierzchnię solą (~10 g). Po 12 h obróć i posól drugą stronę (~10 g). Łączny czas solenia: 24 h. Ser powinien być sprężysty, biały, z wyraźnym zapachem mleka.",
        tip: "Limburski solony mocniej niż quartirolo — sól hamuje niepożądane bakterie i przygotowuje skórkę pod B. linens."
      },
      {
        title: "8) Mycie skórki — solanką z B. linens, co 2–3 dni, 4–8 tyg.",
        content: "Przygotuj solankę myciową: 1 L letniej wody przegotowanej + 30–50 g soli + szczepionka B. linens (BLC/SR3 wg producenta). Przenieś ser do dojrzewalni (12–15°C, 90–95% RH). Co 2–3 dni myj CAŁĄ powierzchnię sera gazikiem nasączonym solanką. Obracaj za każdym razem.",
        tip: "Pierwszych 7–10 dni skórka jest biała. Potem pojawia się żółtawy nalot → pomarańczowy → intensywny zapach. Nie panikuj — to B. linens w akcji! Licznerski opisywał tę pomarańczową maź — wtedy nie znano jej nazwy, ale technika mycia była identyczna."
      },
      {
        title: "9) Dojrzewanie i gotowość — 4–8 tygodni",
        content: "Po 4 tygodniach ser jest jadalny — miękki, aromatyczny, z kremowym środkiem. Po 6–8 tygodniach osiąga pełnię: skórka pomarańczowo-brązowa, intensywny zapach, środek płynny i rozlewny. Przechowuj w lodówce, zjedz w ciągu 1–2 tygodni od osiągnięcia pełnej dojrzałości.",
        warning: "Zapach jest NORMALNY i INTENSYWNY. Przechowuj w szczelnym pojemniku w lodówce — inaczej wszystko w lodówce będzie pachnieć limburskim."
      }
    ],

    notes: {
      tips: [
        "Mycie skórki to klucz — bez regularnego mycia solanką z B. linens ser nie rozwinie charakterystycznego smaku i zapachu.",
        "Mniejsze formy (250–500 g) dojrzewają szybciej i łatwiej je opanować — idealny format na początek.",
        "Geotrichum candidum (GEO) dodany do solanki w pierwszych 2 myciach obniża pH skórki i ułatwia start B. linens.",
        "Licznerski podkreślał, że ser limburski wymaga cierpliwości — smak ujawnia się dopiero po 4–6 tygodniach."
      ],
      warnings: [
        "Nigdy nie prasuj limburskiego — formuje się wyłącznie pod własnym ciężarem.",
        "Wilgotność 90–95% jest absolutnie krytyczna — za sucho = sucha skórka, brak B. linens, brak zapachu.",
        "Surowe mleko: dojrzewaj min. 60 dni (wymogi RHD) lub pasteryzuj i dodaj CaCl₂.",
        "Zapach jest BARDZO intensywny — przechowuj w szczelnym pojemniku!"
      ],
      variants: [
        "Klasyczny limburski (4–6 tyg.) — mocny zapach, kremowy środek, nie dla każdego.",
        "Łagodniejszy wariant (3–4 tyg.) — mniej mycia, mniej zapachu, bardziej przystępny.",
        "Styl herve/maroilles — większe formy, dłuższe dojrzewanie, jeszcze intensywniej.",
        "Z mlekiem kozim — ostrzejszy, pikantniejszy, dojrzewa szybciej."
      ]
    },

    flavor: {
      taste: "Kremowy, intensywny, pikantny, lekko słony; z dojrzewaniem: mocny, mięsisty, ziemisty",
      texture: "Miękka, kremowa, rozlewna w dojrzałym serze — od sprężystej (młody) po płynną (dojrzały)",
      color: "Kremowobiała masa; pomarańczowo-brązowa skórka od B. linens",
      aroma: "Intensywny, przenikliwy, ziemisty — zapach jest cechą, nie wadą!"
    },

    nutrition: {
      servingSize: "100 g",
      calories: 327,
      fatContent: 27,
      saturatedFatContent: 17,
      proteinContent: 20,
      carbohydrateContent: 0.5,
      sodiumContent: 800,
      calciumContent: 497
    }
  },
  {
    id: "twarog",
    zastosowanie: "Najbardziej uniwersalny ser w polskiej kuchni. Na słodko: sernik, leniwe, naleśniki z serem, knedle. Na wytrawnie: pierogi ruskie, paszteciki, farsz do krokietów, twarożek ze szczypiorkiem i rzodkiewką. Do sernika bierz twaróg tłusty i krócej odciskany, do pierogów — chudszy i zwięźlejszy. Kilkudniowy, już wyraźnie kwaśny, nadaje się jeszcze na domowy ser topiony z sodą.",
    name: "Twaróg (ser biały)",
    difficulty: "Łatwy",
    description: "Twaróg to najczęściej wytwarzany ser w Polsce i jednocześnie najprostszy — powstaje bez podpuszczki, wyłącznie przez ukwaszenie mleka. Bakterie fermentacji mlekowej obniżają pH do około 4,6, czyli do punktu izoelektrycznego kazeiny, w którym białko traci ładunek, przestaje wiązać wodę i wytrąca się ze skrzepem. Delikatne podgrzanie oddziela go od serwatki. Zależnie od zawartości tłuszczu mówimy o twarogu chudym, półtłustym lub tłustym, a zależnie od formy — o klinku, krajance albo twarogu wiaderkowym. To baza sernika, pierogów ruskich, leniwych, naleśników i domowego sera topionego.",
    yield: "≈ 1–1,2 kg z 8 L mleka pełnego (chudy z odtłuszczonego: ok. 0,9 kg)",
    ageTime: "Gotowy po 1–2 dni od zaszczepienia (12–24 h ukwaszania + 2–6 h odciekania). Bez dojrzewania; najlepszy w pierwszych dniach",
    image: twarogImage,

    milkBase: "≈ 8 L mleka pełnego lub odtłuszczonego (świeże albo pasteryzowane — NIE UHT: wysoka temperatura trwale wiąże białka serwatkowe z kazeiną i skrzep się nie wytworzy).",
    starter: "Kultura mezofilna (typ LD lub LL) albo naturalny zakwas: 200 ml świeżej maślanki lub kefiru na 8 L mleka. Przy mleku surowym wystarczy własna mikroflora, ale wynik jest mniej powtarzalny.",
    coagulant: "Kwas mlekowy wytwarzany przez bakterie — koagulacja kwasowa, bez podpuszczki. Opcjonalnie 2–3 krople podpuszczki na 8 L dla mocniejszego, lepiej trzymającego się skrzepu (twaróg kwasowo-podpuszczkowy).",
    salting: "Klasyczny twaróg jest niesolony. Jeśli chcesz — 5–8 g soli na 1 kg gotowego twarogu, wmieszane po odcieknięciu.",
    aging: "Nie dojrzewa. Gotowy do jedzenia od razu po odcieknięciu. W lodówce 3–5 dni; im dłużej, tym bardziej kwaśny.",

    cultureSubstitutes: [
      {
        name: "Flora Danica",
        type: "Mezofilna LD (z produkcją CO₂ i aromatu)",
        shop: "Serowarnia, sklepy serowarskie",
        dosage: "1/8 łyżeczki na 8 L mleka",
        notes: "Daje twaróg o pełniejszym, lekko maślanym aromacie. Najpopularniejszy wybór do twarogu.",
        searchQuery: "Flora Danica"
      },
      {
        name: "CHN-19",
        type: "Mezofilna LD",
        shop: "Sklepy serowarskie",
        dosage: "1/8 łyżeczki na 8 L mleka",
        notes: "Zamiennik Flory Danica o zbliżonym profilu.",
        searchQuery: "CHN-19"
      },
      {
        name: "MM 100 / MM 101",
        type: "Mezofilna LL (bez gazu)",
        shop: "Sklepy serowarskie",
        dosage: "1/8 łyżeczki na 8 L mleka",
        notes: "Czysty, mleczny smak bez nut maślanych. Dobra do twarogu na sernik.",
        searchQuery: "MM 100"
      },
      {
        name: "Maślanka lub kefir naturalny",
        type: "Zakwas domowy",
        shop: "Każdy sklep spożywczy",
        dosage: "200 ml na 8 L mleka",
        notes: "Najtańszy start. Musi być świeża i z żywymi kulturami — sprawdź datę i skład. Wynik mniej powtarzalny niż z kultury liofilizowanej.",
        searchQuery: "maślanka kultura"
      }
    ],

    dosageReference: "Dawki podane na 8 L mleka — przelicz proporcjonalnie do swojej ilości.",
    dosageTable: [
      { ingredient: "Mleko (pełne lub odtłuszczone)", amount: "≈ 8 L", notes: "Nie UHT. Przy pasteryzowanym dodaj chlorek wapnia." },
      { ingredient: "Kultura mezofilna", amount: "1/8 łyżeczki", notes: "Albo 200 ml maślanki/kefiru jako zakwas." },
      { ingredient: "Chlorek wapnia (CaCl₂)", amount: "0,8 ml/L", notes: "Tylko przy mleku pasteryzowanym — odbudowuje zdolność krzepnięcia." },
      { ingredient: "Podpuszczka", amount: "2–3 krople", notes: "Opcjonalnie. Daje zwięźlejszy skrzep i mniejsze straty w serwatce." },
      { ingredient: "Sól", amount: "5–8 g/kg", notes: "Opcjonalnie, po odcieknięciu." }
    ],

    steps: [
      {
        title: "1) Ukwaszanie — 12–24 h w 20–24°C",
        content: "Podgrzej mleko do 22–24°C. Wmieszaj kulturę mezofilną (albo maślankę) i przy mleku pasteryzowanym chlorek wapnia. Przykryj i zostaw w temperaturze pokojowej. Skrzep powstaje zwykle po 12–18 h latem i do 24 h zimą.",
        tip: "Nie mieszaj po zaszczepieniu. Skrzep tworzy się w spoczynku — poruszanie go rozbija i zwiększa straty w serwatce.",
        warning: "Mleko UHT nie zetnie się w twaróg, choćbyś czekał dobę. Jeśli zsiada się na rzadką, kluchowatą masę zamiast zwartego skrzepu — to prawie na pewno UHT albo mleko mikrofiltrowane."
      },
      {
        title: "2) Sprawdzenie skrzepu",
        content: "Gotowy skrzep jest zwarty jak galaretka, odchodzi od ścianek garnka, a nad nim zbiera się warstwa klarownej, zielonkawożółtej serwatki. Nacięty nożem zostawia czystą, ostrą krawędź.",
        tip: "Jeśli krawędź jest rozmyta i mleczna — daj jeszcze 2–4 godziny. Zbyt wczesne podgrzewanie to najczęstsza przyczyna małej wydajności."
      },
      {
        title: "3) Powolne podgrzewanie do 38–40°C — etap kluczowy",
        content: "Wstaw garnek do kąpieli wodnej i podgrzewaj BARDZO powoli, około 1°C na 2–3 minuty, do 38–40°C. Skrzep zacznie się kurczyć i oddzielać od serwatki. Mieszaj minimalnie — tylko tyle, żeby nie przypalić dna.",
        tip: "To jest ten moment, który decyduje o teksturze. Wolne grzanie daje twaróg wilgotny i delikatny.",
        warning: "Nie przekraczaj 40°C. Powyżej tej temperatury kazeina kurczy się gwałtownie, wyciska wodę i twaróg wychodzi suchy, gumowaty i piaszczysty. Tego się już nie odwróci."
      },
      {
        title: "4) Odstanie — 20–30 min",
        content: "Zdejmij z ognia i zostaw pod przykryciem. Ziarno opadnie na dno, a serwatka wyklaruje się nad nim. Twaróg dojdzie do właściwej zwięzłości bez dalszego grzania.",
        tip: "Serwatki nie wylewaj. Nadaje się do chleba, naleśników i do pojenia zwierząt — ma laktozę, białka serwatkowe i sporo potasu."
      },
      {
        title: "5) Odciekanie w chuście — 2–6 h",
        content: "Przelej zawartość garnka do durszlaka wyłożonego gęstą chustą serowarską lub pieluchą tetrową. Zawiąż rogi i powieś nad naczyniem. Po 2 godzinach twaróg jest wilgotny i kremowy, po 6 — zwięzły i krajalny.",
        tip: "Do sernika odciskaj krócej (2–3 h) i przepuść przez maszynkę. Do pierogów i klinka — dłużej, aż masa przestanie kapać."
      },
      {
        title: "6) Formowanie i chłodzenie",
        content: "Przełóż do formy albo uformuj klinek, owiń chustą i wstaw do lodówki na 2–4 h. Możesz obciążyć niewielkim ciężarkiem (0,5–1 kg), jeśli chcesz twaróg zwięzły i dobrze krojący się.",
        tip: "Twaróg smakuje najlepiej pierwszego i drugiego dnia. Z każdą dobą staje się kwaśniejszy — po 4–5 dniach lepiej przeznaczyć go na ser topiony albo na sernik."
      }
    ],

    notes: {
      tips: [
        "Twaróg ma zaskakująco MAŁO wapnia jak na ser — około 90–100 mg/100 g, podczas gdy gouda ma ponad 700 mg. Powód: kwas rozpuszcza koloidalny fosforan wapnia, który w serach podpuszczkowych spina kazeinę, i wapń odchodzi razem z serwatką.",
        "To ta sama przyczyna, dla której do domowego sera topionego z twarogu wystarczy soda oczyszczona, a nie sole emulgujące — w twarogu nie ma już wapnia, który trzeba by związać.",
        "Im chudsze mleko, tym twardszy i bardziej ziarnisty twaróg. Tłuste mleko daje masę kremową, ale mniej zwięzłą.",
        "Dodatek 2–3 kropli podpuszczki na 8 L to najprostszy sposób na zwiększenie wydajności — skrzep jest mocniejszy i mniej białka ucieka do serwatki.",
        "Z 8 L mleka zostaje około 6,5–7 L serwatki. Zobacz, co można z nią zrobić, zamiast wylewać."
      ],
      warnings: [
        "Mleko UHT nie nadaje się — nie chodzi o świeżość, tylko o trwałą zmianę białek w wysokiej temperaturze. Mikrofiltrowane bywa równie problematyczne.",
        "Przekroczenie 40°C przy podgrzewaniu daje twaróg suchy i gumowaty. To błąd nieodwracalny.",
        "Gorzki smak zwykle oznacza przekwaszenie albo zbyt długie ukwaszanie w za wysokiej temperaturze. Skróć czas albo obniż temperaturę ukwaszania do 20–21°C.",
        "Twaróg z mleka surowego przeznaczony do sprzedaży podlega osobnym wymogom sanitarnym — sprawdź zasady RHD i MOL przed wprowadzeniem do obrotu."
      ],
      variants: [
        "Twaróg chudy — z mleka odtłuszczonego. Zwięzły, ziarnisty, do pierogów i naleśników.",
        "Twaróg tłusty (wiejski) — z mleka pełnego, czasem z dodatkiem 0,5 L śmietanki. Kremowy, do smarowania.",
        "Kwasowo-podpuszczkowy — z 2–3 kroplami podpuszczki. Wyższa wydajność, zwięźlejsza konsystencja, łagodniejszy smak.",
        "Klinek — odciśnięty pod obciążeniem i uformowany w trójkąt. Klasyczna forma targowa.",
        "Twaróg na sernik — krócej odciskany, dwukrotnie przepuszczony przez maszynkę, bez soli.",
        "Serek ziarnisty (typu cottage) — ziarno płukane zimną wodą po odcieknięciu i zalane śmietanką."
      ]
    },

    flavor: {
      taste: "Łagodnie kwaśny, mleczny, bez goryczy. Kwasowość rośnie z każdym dniem przechowywania.",
      texture: "Od kremowej i wilgotnej po zwięzłą i ziarnistą — zależnie od czasu odciekania i tłustości mleka.",
      color: "Biała, matowa; przy mleku od krów pastwiskowych lekko kremowa.",
      aroma: "Świeży, mleczno-kwaśny, z nutą maślanki przy kulturach typu LD."
    },

    nutrition: {
      servingSize: "100 g",
      calories: 133,
      fatContent: 4.7,
      saturatedFatContent: 3.0,
      proteinContent: 18.7,
      carbohydrateContent: 3.5,
      sodiumContent: 40,
      calciumContent: 96
    }
  },
  {
    id: "ser-topiony",
    zastosowanie: "Do smarowania pieczywa, na tosty i zapiekanki, jako baza sosu serowego do makaronu lub warzyw. Rozrzedzony mlekiem staje się polewą do kalafiora i brokułów. Sprawdza się też jako nadzienie do naleśników i roladek mięsnych, bo topi się gładko i nie wycieka tak łatwo jak ser żółty.",
    name: "Ser Topiony (Parowany)",
    difficulty: "Łatwy",
    description: 'Ser topiony (schmelzkäse) to produkt powstający z przetopienia dojrzałego sera z dodatkiem soli emulgujących i wody. Licznerski opisał go w "Praktycznym serowarstwie" (1922) jako sposób na "uratowanie" serów z wadami — zbyt kwaśnych, za twardych, z dziurami w niewłaściwych miejscach. Zamiast je wyrzucać, topiono je z masłem i solami emulgującymi, uzyskując produkt jednolity, trwały i łatwy do krojenia. Z recyklingu wad wyrósł globalny rynek wart miliardy — Licznerski opisał narodziny kategorii.',
    yield: "≈ 500–600 g sera topionego z 500 g sera bazowego",
    ageTime: "Gotowy natychmiast (opcjonalnie: 1–3 dni w lodówce dla lepszej tekstury)",
    image: topionyImage,

    milkBase: "≈ 500 g dojrzałego sera twardego lub półtwardego (gouda, cheddar, ementaler, ser z wadami — mieszanka daje najlepszy smak). Ser powinien mieć min. 4–6 tygodni dojrzewania.",
    starter: "Sole emulgujące — kluczowy składnik: cytrynian sodu (E331) lub fosforan sodu (E339/E452). Bez nich ser nie stopnieje równomiernie, lecz rozdzieli się na tłuszcz i białko.",
    coagulant: "Brak — ser topiony nie używa podpuszczki. Koagulacja (emulsja) zachodzi dzięki solom emulgującym, które wiążą wapń z kazeiny i tworzą stabilną emulsję.",
    salting: "Sól do smaku (ok. 1–2 g na 500 g sera) — jeśli ser bazowy jest już słony, można pominąć.",
    aging: "Bez dojrzewania — ser topiony jest gotowy od razu po ostudzeniu. Przechowywanie w lodówce do 3–4 tygodni. Tekstura poprawia się po 1–2 dniach w lodówce.",

    cultureSubstitutes: [
      {
        name: "Cytrynian sodu (E331)",
        type: "sól emulgująca",
        shop: "apteka / sklep chemiczny / online",
        dosage: "15–20 g na 500 g sera (3–4%)",
        notes: "Najczęściej używana sól emulgująca. Łagodny smak, dobre topienie. Dostępna jako cytrynian trójsodowy.",
        searchQuery: "cytrynian sodu"
      },
      {
        name: "Fosforan sodu (E339)",
        type: "sól emulgująca",
        shop: "sklep chemiczny / online",
        dosage: "10–15 g na 500 g sera (2–3%)",
        notes: "Silniejsze działanie emulgujące niż cytrynian. Nadaje gładszą, bardziej plastyczną teksturę.",
        searchQuery: "fosforan sodu"
      },
      {
        name: "Polifosforan sodu (E452)",
        type: "sól emulgująca",
        shop: "sklep chemiczny / online",
        dosage: "10–15 g na 500 g sera (2–3%)",
        notes: "Stosowany przemysłowo. Daje najgładszą teksturę, ale trudniejszy do kupienia w małych ilościach.",
        searchQuery: "polifosforan sodu"
      },
      {
        name: "Kwas cytrynowy + soda oczyszczona",
        type: "zamiennik domowy",
        shop: "sklep spożywczy",
        dosage: "10 g kwasu cytrynowego + 8 g sody na 500 g sera",
        notes: "Tworzy cytrynian sodu in situ. Najprostsza opcja domowa — składniki dostępne w każdym sklepie.",
        searchQuery: "kwas cytrynowy"
      }
    ],

    dosageReference: "Odniesienie: 500 g sera + 15–20 g cytrynianu sodu + 80–120 ml wody/mleka + 30–50 g masła.",
    dosageTable: [
      { ingredient: "Ser bazowy (dojrzały)", amount: "≈ 500 g", notes: "Gouda, cheddar, ementaler lub mieszanka; starszy = mocniejszy smak" },
      { ingredient: "Cytrynian sodu (E331)", amount: "15–20 g", notes: "Lub fosforan sodu 10–15 g; lub kwas cytrynowy 10 g + soda 8 g" },
      { ingredient: "Woda lub mleko", amount: "80–120 ml", notes: "Mleko daje kremowszy efekt; woda — bardziej neutralny" },
      { ingredient: "Masło", amount: "30–50 g", notes: "Opcjonalnie — dodaje kremowość i połysk" },
      { ingredient: "Sól", amount: "do smaku (1–2 g)", notes: "Jeśli ser bazowy jest mało słony" },
      { ingredient: "Dodatki smakowe", amount: "wg uznania", notes: "Szczypiorek, papryka, czosnek, kminek, szynka, grzyby — po zdjęciu z ognia" }
    ],

    steps: [
      {
        title: "1) Przygotowanie sera bazowego — tarcie lub krojenie",
        content: "Zetrzyj 500 g sera na tarce o grubych oczkach lub pokrój w drobną kostkę (~1 cm). Im drobniejszy, tym szybciej i równomierniej się stopi. Można mieszać różne sery: np. 300 g goudy + 200 g cheddara.",
        tip: "Licznerski opisywał topienie serów z wadami — to idealny przepis na zagospodarowanie serów, które nie wyszły idealnie: zbyt kwaśnych, za twardych, popękanych, z nieregularnymi dziurami."
      },
      {
        title: "2) Rozpuszczenie soli emulgujących — w wodzie/mleku",
        content: "W garnku (najlepiej z grubym dnem, nieprzywierającym) wymieszaj 80–120 ml wody lub mleka z 15–20 g cytrynianu sodu. Podgrzej do ok. 40°C, mieszając aż sól się rozpuści.",
        warning: "Sole emulgujące to klucz do sera topionego — bez nich ser po prostu się rozdzieli na tłuszcz i grudki białka. Nie pomijaj tego kroku!"
      },
      {
        title: "3) Topienie sera — 80–90°C, ciągłe mieszanie, 10–15 min",
        content: "Dodaj starty ser do garnka z roztworem soli. Podgrzewaj na średnim ogniu, CIĄGLE mieszając drewnianą łyżką lub silikonową szpatułką. Temperatura docelowa: 80–90°C. Mieszaj przez 10–15 min, aż masa będzie całkowicie jednolita, gładka i błyszcząca.",
        tip: "Licznerski podawał 80–90°C — dokładnie ten sam zakres, który stosuje się dziś. Ciągłe mieszanie zapobiega przypaleniu i zapewnia równomierne topienie."
      },
      {
        title: "4) Dodanie masła i doprawienie",
        content: "Gdy masa jest gładka i jednolita, dodaj 30–50 g masła. Mieszaj do wchłonięcia — masa powinna być lśniąca i kremowa. Dopraw do smaku: sól, pieprz, a po zdjęciu z ognia — dowolne dodatki smakowe (szczypiorek, papryka, czosnek, kminek, szynka, grzyby).",
        warning: "Dodatki smakowe dodawaj PO zdjęciu z ognia (ok. 70°C) — w pełnej temperaturze topienia mogą stracić aromat lub zmienić kolor."
      },
      {
        title: "5) Formowanie — formy, folię, słoiki",
        content: "Natychmiast przelej gorącą masę do form wyłożonych folią spożywczą, do ceramicznych foremek lub do wysterylizowanych słoików (na ciepło). Wyrównaj powierzchnię, zakryj folią (dotykającą sera — bez pęcherzy powietrza) i pozostaw do ostygnięcia w temp. pokojowej.",
        tip: "Małe foremki (100–150 g) to klasyczny format sera topionego. Folia spożywcza dotykająca powierzchni zapobiega powstawaniu skórki."
      },
      {
        title: "6) Studzenie i gotowość",
        content: "Po ostudzeniu do temp. pokojowej przenieś do lodówki na min. 4–6 h (najlepiej na noc). Ser topiony tężeje w lodówce i nabiera ostatecznej konsystencji — od miękkiej (kremowej) po krojalną, zależnie od ilości wody i sera bazowego.",
        tip: "Ser topiony jest gotowy od razu, ale smak i tekstura poprawiają się po 1–2 dniach w lodówce. Przechowuj do 3–4 tygodni."
      }
    ],

    notes: {
      tips: [
        "Mieszanka serów daje najlepszy smak — np. 60% gouda + 30% cheddar + 10% ementaler.",
        "Im starszy (dojrzalszy) ser bazowy, tym intensywniejszy smak sera topionego.",
        "Licznerski podkreślał: ser topiony to doskonały sposób na zagospodarowanie serów z wadami — nie wyrzucaj niedoskonałych serów!",
        "Cytrynian sodu można łatwo zrobić w domu: kwas cytrynowy + soda oczyszczona (reagują i tworzą cytrynian sodu + CO₂ + woda)."
      ],
      warnings: [
        "Bez soli emulgujących ser DOJRZAŁY się nie stopi równomiernie — rozdzieli się na tłuszcz i białko. Twaróg to osobny przypadek: tam wystarczy soda oczyszczona.",
        "Ciągłe mieszanie jest kluczowe — ser topiony łatwo się przypala na dnie garnka.",
        "Nie dodawaj zbyt dużo wody — ser topiony powinien być gęsty, nie płynny. Zacznij od 80 ml i dodawaj w razie potrzeby.",
        "Do metody z solami emulgującymi potrzebujesz sera min. 4–6 tygodni dojrzewania — w młodym serze nie ma dość wapnia związanego z kazeiną, żeby sole miały co wiązać. Nie dotyczy to twarogu, który topi się inną drogą (patrz warianty)."
      ],
      variants: [
        "Z TWAROGU I SODY — najpopularniejsza metoda domowa w Polsce, zupełnie inna technologia. 500 g twarogu rozdrobnić, wymieszać z 5 g sody oczyszczonej (płaska łyżeczka) i ODSTAWIĆ NA 30–60 MIN. Potem podgrzewać, mieszając, aż masa się zciągnie (5–10 min), dodać 50–80 g masła i sól. Dlaczego działa bez soli emulgujących: twaróg jest kwaśny (pH ok. 4,6 — punkt izoelektryczny kazeiny), soda podnosi pH do 5,6–6,0 i białko znów staje się rozpuszczalne. Wapnia nie ma już co wiązać, bo odszedł z serwatką. Pominięcie odstania = masa zostaje ziarnista.",
        "Kremowy (spreadable) — więcej wody (120 ml) i masła (50 g), miększy ser bazowy.",
        "Krojalny (blokowy) — mniej wody (60–80 ml), twardszy ser bazowy, dłuższe chłodzenie.",
        "Ze szczypiorkiem — klasyka polska; dodaj 2–3 łyżki posiekanego szczypiorku po zdjęciu z ognia.",
        "Z papryką — 1 łyżka słodkiej papryki w proszku + szczypca ostrej.",
        "Z grzybami — 50 g smażonych pieczarek lub suszonych borowików (namoczonych).",
        "Fondue-style — ser topiony rozrzedzony winem (50 ml białego wytrawnego zamiast części wody) + czosnek."
      ]
    },

    flavor: {
      taste: "Łagodny, kremowy, maślany; smak zależy od sera bazowego — gouda daje słodycz, cheddar ostrość, ementaler orzechowość",
      texture: "Gładka, jednorodna, kremowa do krojalnej — zależy od proporcji wody i sera",
      color: "Jasnożółta do intensywnie żółtej — zależy od sera bazowego i dodatków (papryka daje pomarańcz)",
      aroma: "Delikatny, maślany, łagodny — znacznie mniej intensywny niż ser bazowy"
    },

    nutrition: {
      servingSize: "100 g",
      calories: 280,
      fatContent: 21,
      saturatedFatContent: 13,
      proteinContent: 16,
      carbohydrateContent: 3,
      sodiumContent: 1200,
      calciumContent: 550
    }
  }
];
