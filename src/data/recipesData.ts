import asiagoImage from "@/assets/asiago.jpg";
import dunlopImage from "@/assets/dunlop.jpg";
import fetaBulgarskaImage from "@/assets/feta-bulgarska.jpg";
import yorkshireImage from "@/assets/yorkshire.jpg";

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
    }
  },
  {
    id: "feta_bulgarische",
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
    }
  },
  {
    id: "yorkshire",
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
    }
  }
];
