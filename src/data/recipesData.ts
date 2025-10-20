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
}

export const recipesData: Recipe[] = [
  {
    id: "asiago",
    name: "Asiago",
    difficulty: "Średni",
    description: "Asiago to tradycyjny ser alpejski z regionu Veneto we Włoszech. Młody Asiago dolce (świeży) ma delikatny, słodkawy smak z aromatem przypominającym jogurt i masło. Tekstura jest miękka i elastyczna, a jasna barwa odzwierciedla krótki okres dojrzewania. Smak jest słodki, z jasną, młodzieńczą jakością.",
    yield: "≈ 2,7 kg z 22,7 L mleka",
    ageTime: "30–40 dni (młode Asiago dolce)",
    image: "https://mojaserowarnia.pl/images/asiago.jpg",
    
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
    }
  },
  {
    id: "caciotta",
    name: "Caciotta",
    difficulty: "Średni",
    description: "Caciotta to kremowy, półmiękki ser z środkowych Włoch, tradycyjnie wytwarzany z mleka owczego, krowiego, koziego lub bawolego. Charakteryzuje się niezwykłym procesem \"stufatura\" (gotowanie parą), który nadaje serowi unikalną teksturę. Ten ser dla początkujących znajdzie się na każdym włoskim stole - od regionu Pienza/Siena w południowej Toskanii po całe Włochy.",
    yield: "≈ 0,9 kg z 7,6 L mleka",
    ageTime: "2 miesiące (można jeść młodszą)",
    image: "https://www.cheese.com/media/img/cheese/22-Caciotta-shutterstock_632211605.webp",
    
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
    }
  },
  {
    id: "dunlop",
    name: "Dunlop",
    difficulty: "Średni",
    description: "Dunlop to tradycyjny ser z Irlandii, znany ze swojej twardej tekstury i wyrazistego smaku. Jest idealny do tarcia i podawania na deskach serów.",
    yield: "≈ 1,5 kg z 10 L mleka",
    ageTime: "3-6 miesięcy",
    image: "https://www.cheese.com/media/img/cheese/22-Dunlop-shutterstock_632211605.webp",
    
    milkBase: "≈ 10 L mleka krowiego.",
    starter: "Typ: kultura mezofilna.",
    coagulant: "Płynna podpuszczka single-strength; ok. 3 ml na 10 L mleka.",
    salting: "Solanka nasycona przez 24 godziny.",
    aging: "12-14 °C i 80-85% wilgotności przez 3-6 miesięcy.",
    
    cultureSubstitutes: [],
    
    dosageReference: "Odniesienie: 1/4 tsp kultury mezofilnej na 10 L.",
    dosageTable: [],
    
    steps: [],
    
    notes: {
      tips: [],
      warnings: [],
      variants: []
    },
    
    flavor: {
      taste: "Wyrazisty, lekko słony, z nutami orzechowymi",
      texture: "Twarda, krucha",
      color: "Jasnożółty",
      aroma: "Mleczny, z nutami orzechowymi"
    }
  },
  {
    id: "feta_bulgarische",
    name: "Feta (Bulgarische)",
    difficulty: "Łatwy",
    description: "Feta to tradycyjny ser z Grecji, znany ze swojego słonego smaku i kruchych kawałków. Idealny do sałatek i dań z grilla.",
    yield: "≈ 1 kg z 8 L mleka",
    ageTime: "2-3 miesiące",
    image: "https://www.cheese.com/media/img/cheese/22-Feta-shutterstock_632211605.webp",
    
    milkBase: "≈ 8 L mleka owczego lub krowiego.",
    starter: "Typ: kultura mezofilna.",
    coagulant: "Płynna podpuszczka single-strength; ok. 2 ml na 8 L mleka.",
    salting: "Solanka nasycona przez 12 godzin.",
    aging: "10-12 °C i 75-80% wilgotności przez 2-3 miesiące.",
    
    cultureSubstitutes: [],
    
    dosageReference: "Odniesienie: 1/4 tsp kultury mezofilnej na 8 L.",
    dosageTable: [],
    
    steps: [],
    
    notes: {
      tips: [],
      warnings: [],
      variants: []
    },
    
    flavor: {
      taste: "Słony, lekko kwasowy",
      texture: "Kruche, miękkie",
      color: "Biała",
      aroma: "Mleczny, z nutami ziołowymi"
    }
  },
  {
    id: "yorkshire",
    name: "Yorkshire",
    difficulty: "Średni",
    description: "Yorkshire to tradycyjny ser z Anglii, znany ze swojego wyrazistego smaku i twardej tekstury. Idealny do podawania na deskach serów.",
    yield: "≈ 1,2 kg z 8 L mleka",
    ageTime: "3-4 miesiące",
    image: "https://www.cheese.com/media/img/cheese/22-Yorkshire-shutterstock_632211605.webp",
    
    milkBase: "≈ 8 L mleka krowiego.",
    starter: "Typ: kultura mezofilna.",
    coagulant: "Płynna podpuszczka single-strength; ok. 2,5 ml na 8 L mleka.",
    salting: "Solanka nasycona przez 24 godziny.",
    aging: "10-12 °C i 80-85% wilgotności przez 3-4 miesiące.",
    
    cultureSubstitutes: [],
    
    dosageReference: "Odniesienie: 1/4 tsp kultury mezofilnej na 8 L.",
    dosageTable: [],
    
    steps: [],
    
    notes: {
      tips: [],
      warnings: [],
      variants: []
    },
    
    flavor: {
      taste: "Wyrazisty, lekko słony",
      texture: "Twarda, krucha",
      color: "Jasnożółty",
      aroma: "Mleczny, z nutami orzechowymi"
    }
  }
];
