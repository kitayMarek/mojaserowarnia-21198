export interface CultureSubstitute {
  name: string;
  type: string;
  shop: string;
  dosage: string;
  notes: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  difficulty: "Łatwy" | "Średni" | "Trudny";
  yield: string;
  ageTime: string;
  category: string;
  image: string;
  milkType: string;
  cultures: string[];
  cultureSubstitutes: CultureSubstitute[];
  steps: RecipeStep[];
}

export interface RecipeStep {
  title: string;
  content: string;
  tip?: string;
  warning?: string;
  substeps?: string[];
}

export const recipesData: Recipe[] = [
  {
    id: "asiago",
    name: "Asiago",
    description: "Asiago to tradycyjny ser alpejski z regionu Veneto we Włoszech. Młody Asiago dolce (świeży) ma delikatny, słodkawy smak z aromatem przypominającym jogurt i masło. Tekstura jest miękka i elastyczna, a jasna barwa odzwierciedla krótki okres dojrzewania. Smak jest słodki, z jasną, młodzieńczą jakością.",
    difficulty: "Średni",
    yield: "≈ 2,7 kg z 22,7 L mleka",
    ageTime: "30–40 dni (młode Asiago dolce)",
    category: "Klasyczny ser alpejski z Włoch",
    image: "https://mojaserowarnia.pl/images/asiago.jpg",
    milkType: "Mleko krowie pełne (nie UHT)",
    cultures: ["kultura termofilna (TA-61 lub C201)", "kultura Helveticus (LH-100)"],
    cultureSubstitutes: [
      {
        name: "TA / TA-61",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "~0,125 tsp (~0,6 g) na 22,7 L",
        notes: "Odpowiednik C201 - główna kultura termofilna do Asiago."
      },
      {
        name: "MST / MST-910 / MSO / MSO-11",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "~0,125 tsp (~0,6 g) na 22,7 L",
        notes: "Alternatywa dla TA - klasyczne kultury termofilne."
      },
      {
        name: "ST / ST-20",
        type: "termofilna",
        shop: "Artiser.pl",
        dosage: "~0,125 tsp (~0,6 g) na 22,7 L",
        notes: "Kultury termofilne do serów gotowanych."
      },
      {
        name: "ALPHA 20 / ALPHA 22",
        type: "termofilna",
        shop: "Lactic.pl",
        dosage: "~0,125 tsp (~0,6 g) na 22,7 L",
        notes: "Starter termofilny o łagodnej dynamice."
      },
      {
        name: "BETA 30 / BETA 32",
        type: "termofilna",
        shop: "Lactic.pl",
        dosage: "~0,125 tsp (~0,6 g) na 22,7 L",
        notes: "Starter termofilny o intensywnej dynamice."
      },
      {
        name: "TH LYO / TH 02 LYO",
        type: "termofilna",
        shop: "GAP Poland",
        dosage: "~0,125 tsp (~0,6 g) na 22,7 L",
        notes: "Do serów twardych/półtwardych gotowanych."
      },
      {
        name: "LH / LH-100",
        type: "Helveticus",
        shop: "GAP Poland",
        dosage: "~0,03 tsp (~0,15 g) na 22,7 L",
        notes: "Kultura Helveticus - zostawia słodką nutę, KLUCZOWA dla Asiago!"
      },
      {
        name: "Choozit LH 100",
        type: "Helveticus",
        shop: "Wańczykówka",
        dosage: "~0,03 tsp (~0,15 g) na 22,7 L",
        notes: "Odpowiednik LH-100 - dla słodkiej nuty w serach alpejskich."
      }
    ],
    steps: [
      {
        title: "1) Podgrzanie i zakwaszanie 35–36 °C ~30 min",
        content: "Podgrzej mleko do 35–36 °C. Dodaj kulturę termofilną TA-61 (~1/8 tsp) i kulturę Helveticus LH-100 (~1/16 tsp). Pozostaw na 30 min do dojrzewania.",
        tip: "Kluczowe kultury: TA-61 (termofilna) + LH-100 (Helveticus). Helveticus zostawia część laktozy niezmienioną, dając słodką nutę!"
      },
      {
        title: "2) Krzepnięcie podpuszczka ~25 min",
        content: "Dodaj 5 ml (1 tsp) płynnej podpuszczki single-strength. Mieszaj ruchem góra-dół do równomiernego rozprowadzenia. Skrzep powinien powstać w ~25 min.",
        tip: "Test skrzepu: Skrzep musi się czysto rozdzielać - poczekaj na pełną koagulację przed cięciem."
      },
      {
        title: "3) Cięcie i wstępne mieszanie ~1 cm",
        content: "Potnij skrzep na ziarna ~1 cm (3/8-1/2 cala). Powoli mieszaj przez 15–20 min, aż ziarna się wzmocnią. Utrzymuj temperaturę 35–36 °C.",
        warning: "Ziarna muszą być jednolite i jędrne przed rozpoczęciem gotowania!"
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
        content: "Prasuj według schematu:",
        substeps: [
          "30 min przy ~5,5 kg",
          "2 h przy ~11 kg (po obrocie)",
          "2 h przy ~11 kg (po ponownym obrocie)",
          "10 h przy ~11 kg przez noc"
        ],
        tip: "Przy każdym etapie wyjmij ser, odwiń, odwróć, ponownie zawiń i wróć do prasy."
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
    ]
  },
  {
    id: "mozzarella",
    name: "Mozzarella",
    description: "Świeża mozzarella to jeden z najłatwiejszych serów do przygotowania w domu. Ten tradycyjny włoski ser o delikatnym smaku i charakterystycznej konsystencji idealnie nadaje się na pizzę, sałatki Caprese czy po prostu do jedzenia na świeżo z pomidorami i bazylią.",
    difficulty: "Łatwy",
    yield: "500g sera z 4L mleka",
    ageTime: "Świeży (brak dojrzewania)",
    category: "Włoski ser świeży",
    image: "https://mojaserowarnia.pl/images/mozzarella.jpg",
    milkType: "Mleko krowie 3,2% (najlepiej świeże lub pasteryzowane)",
    cultures: ["kultura starterowa termofilna (MP 62 LYO lub M/MV)"],
    cultureSubstitutes: [
      {
        name: "MP 62 LYO",
        type: "termofilna",
        shop: "GAP Poland",
        dosage: "1/4 łyżeczki na 4L",
        notes: "Zawiera Streptococcus thermophilus, który nadaje charakterystyczny smak."
      },
      {
        name: "M / MV",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "1/4 łyżeczki na 4L",
        notes: "Klasyczna kultura do mozzarelli."
      },
      {
        name: "ST / ST-20",
        type: "termofilna",
        shop: "Artiser.pl",
        dosage: "1/4 łyżeczki na 4L",
        notes: "Alternatywa termofilna."
      },
      {
        name: "TA / TA-61",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "1/4 łyżeczki na 4L",
        notes: "Uniwersalna kultura termofilna."
      }
    ],
    steps: [
      {
        title: "Przygotowanie mleka i kultury",
        content: "Wlej mleko do garnka i podgrzej do temperatury 32°C. Zdejmij z ognia. Dodaj kulturę starterową bezpośrednio do mleka i dokładnie wymieszaj łyżką przez 30 sekund. Przykryj garnek i pozostaw w ciepłym miejscu na 45 minut - mleko powinno lekko skwaśnieć."
      },
      {
        title: "Przygotowanie i dodanie podpuszczki",
        content: "W małej miseczce rozpuść podpuszczką w 2 łyżkach chłodnej wody niegazowanej. Wymieszaj dokładnie i pozostaw na 5 minut. Następnie dodaj roztwór podpuszczki do mleka i mieszaj energicznie przez 30 sekund. Przykryj i pozostaw na 45-60 minut, aż mleko zetnie się w jednolitą masę."
      },
      {
        title: "Sprawdzenie żelu i cięcie",
        content: "Sprawdź czy żel jest gotowy - powinien być jędrny i przy nacięciu nożem krawędzie powinny być czyste, bez wypływającej serwatki. Pokrój żel na kostki o boku około 2 cm - najpierw w jedną stronę, potem w drugą, tworząc siatkę."
      },
      {
        title: "Podgrzewanie i oddzielanie serwatki",
        content: "Delikatnie podgrzej garnek z pokrojoną masą serową do temperatury 42-45°C, mieszając bardzo ostrożenie co kilka minut. Proces powinien trwać około 15-20 minut. Ziarna sera powinny zmniejszyć się i stwardnieć, a serwatka stać się przejrzysta."
      },
      {
        title: "Odcedzanie serwatki",
        content: "Przełóż masę serową do durszlaka wyłożonego gazą lub czystą ściereczką. Pozostaw na 15-20 minut, żeby serwatka spłynęła. Można delikatnie uciskać gazę, żeby przyspieszyć proces. Zachowaj część serwatki - będzie potrzebna do formowania."
      },
      {
        title: "Formowanie mozzarelli",
        content: "Podgrzej pozostałą serwatkę do temperatury 85-90°C. Załóż rękawice. Zanurz masę serową w gorącej serwatce na 30 sekund, następnie wyciągnij i rozciągaj jak ciasto - jeśli się rozciąga bez pękania, jest gotowa. Formuj kulki mozzarelli, zanurzając w serwatce dla elastyczności."
      },
      {
        title: "Solenie i przechowywanie",
        content: "Przygotuj solankę - rozpuść 1 łyżkę soli w 1 litrze chłodnej wody. Włóż gotowe kulki mozzarelli do solanki na 30 minut. Po tym czasie ser jest gotowy do spożycia. Przechowuj w lodówce w solance do 5 dni."
      }
    ]
  },
  {
    id: "feta-bulgarska",
    name: "Feta Bułgarska (Sirene)",
    description: "Bułgarska Feta (Sirene) to tradycyjny biały ser solankowy o gładkiej, kremowej i elastycznej teksturze. W przeciwieństwie do greckiej Fety, która się kruszy, bułgarska wersja zachowuje więcej wilgoci dzięki łagodniejszemu odsączaniu i niższej kwasowości. Można ją kroić w kostki lub plastry, a po kilku tygodniach dojrzewania staje się smarowna jak młody Camembert.",
    difficulty: "Średni",
    yield: "≈ 0,9 kg z 3,8 L mleka",
    ageTime: "1 miesiąc w solance (można do roku)",
    category: "Biały ser solankowy z Bułgarii",
    image: "https://mojaserowarnia.pl/images/feta_bulgarische.jpg",
    milkType: "Mleko krowie pełne (nie UHT)",
    cultures: ["kultura mezofilna", "jogurt bułgarski"],
    cultureSubstitutes: [
      {
        name: "Choozit MA 4001",
        type: "mezofilna",
        shop: "Wańczykówka",
        dosage: "~0,125 tsp (~0,6 g) na 3,8 L",
        notes: "Odpowiednik C21 - główna kultura do Fety."
      },
      {
        name: "MSE / MSE-910 / MSO / MSO-11",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,125 tsp (~0,6 g) na 3,8 L",
        notes: "Klasyczne kultury Lactococcus do serów świeżych."
      },
      {
        name: "ML / ML-O",
        type: "mezofilna",
        shop: "Artiser.pl",
        dosage: "~0,125 tsp (~0,6 g) na 3,8 L",
        notes: "Podstawowe kultury mezofilne."
      },
      {
        name: "ALPHA 10 / ALPHA 12",
        type: "mezofilna",
        shop: "Lactic.pl",
        dosage: "~0,125 tsp (~0,6 g) na 3,8 L",
        notes: "Starter o łagodnej dynamice."
      },
      {
        name: "SH LYO / SM 02 LYO",
        type: "mezofilna",
        shop: "GAP Poland",
        dosage: "~0,125 tsp (~0,6 g) na 3,8 L",
        notes: "Do serów półtwardych/świeżych."
      },
      {
        name: "MFC",
        type: "mezofilno-termofilna",
        shop: "Serowar.pl",
        dosage: "~0,06 tsp (~0,3 g) na 3,8 L",
        notes: "Mieszanka kultur - alternatywa dla jogurtu bułgarskiego."
      }
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
        warning: "Test kwasowości: Serwatka ma być \"nieco ostra\" - wyższa niż w greckiej Fecie dla kremowej tekstury."
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
        tip: "Dojrzewanie: Młodsza Feta = kremowa i łagodna. Starsza = bardziej wytrawna i intensywna. Solanka musi całkowicie pokrywać ser!"
      }
    ]
  },
  {
    id: "caciotta",
    name: "Caciotta",
    description: "Caciotta to kremowy, półmiękki ser z środkowych Włoch, tradycyjnie wytwarzany z mleka owczego, krowiego, koziego lub bawolego. Charakteryzuje się niezwykłym procesem \"stufatura\" (gotowanie parą), który nadaje serowi unikalną teksturę. Ten ser dla początkujących znajdzie się na każdym włoskim stole - od regionu Pienza/Siena w południowej Toskanii po całe Włochy.",
    difficulty: "Średni",
    yield: "≈ 0,9 kg z 7,6 L mleka",
    ageTime: "2 miesiące (można jeść młodszą)",
    category: "Klasyczny ser półmiękki z środkowych Włoch",
    image: "https://www.cheese.com/media/img/cheese/22-Caciotta-shutterstock_632211605.webp",
    milkType: "Mleko krowie pełne (nie UHT)",
    cultures: ["kultura termofilna C201"],
    cultureSubstitutes: [
      {
        name: "TA / TA-61",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "~0,17 tsp (~0,8 g) na 7,6 L",
        notes: "Odpowiednik C201 - główna kultura do Caciotta."
      },
      {
        name: "MST / MST-910",
        type: "termofilna",
        shop: "Serowar.pl",
        dosage: "~0,17 tsp (~0,8 g) na 7,6 L",
        notes: "Klasyczna kultura Streptococcus thermophilus."
      },
      {
        name: "ST / ST-20",
        type: "termofilna",
        shop: "Artiser.pl",
        dosage: "~0,17 tsp (~0,8 g) na 7,6 L",
        notes: "Podstawowa kultura termofilna."
      },
      {
        name: "ALPHA 20 / ALPHA 22",
        type: "termofilna",
        shop: "Lactic.pl",
        dosage: "~0,17 tsp (~0,8 g) na 7,6 L",
        notes: "Starter termofilny o łagodnej dynamice."
      },
      {
        name: "BETA 30 / BETA 32",
        type: "termofilna",
        shop: "Lactic.pl",
        dosage: "~0,17 tsp (~0,8 g) na 7,6 L",
        notes: "Kultura z intensywnym profilem."
      },
      {
        name: "TH LYO / TH 02 LYO",
        type: "termofilna",
        shop: "GAP Poland",
        dosage: "~0,17 tsp (~0,8 g) na 7,6 L",
        notes: "Do serów twardych/półtwardych."
      }
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
        tip: "Posypywanie solą: Ser pływa nad solanka - posyp górną powierzchnię solą. Obróć i posól ponownie po godzinie."
      },
      {
        title: "9) Dojrzewanie 13-15°C, 85-90% RH",
        content: "Osusz powierzchnię i przenieś do przestrzeni dojrzewania 13-15°C i 85-90% wilgotności. Codziennie obracaj i wycieraj szmatkę zwilżoną 6-8% solanką.",
        warning: "Codzienne wycieranie: Wysoka wilgotność sprzyja pleśni - wycieranie solanką usuwa pleśń, a krótkie suszenie przed powrotem!"
      },
      {
        title: "10) Gotowość 1-8 tygodni",
        content: "Po tygodniu ser zmięknie przez enzymy. Po 2 tygodniach do 2 miesięcy gotowy do spożycia. Młodszy = łagodniejszy smak.",
        tip: "Elastyczność czasowa: Można jeść już po tygodniu (świeży) lub dojrzewać do 2 miesięcy (intensywniejszy smak)."
      }
    ]
  },
  {
    id: "dunlop",
    name: "Dunlop",
    description: "Dunlop wytwarza się z niepasteryzowanego mleka krowiego. Ten ser jest zaliczany do serów dojrzewających, podpuszczkowych oraz twardych. Określany jest jako ser stołowy. Jego nazwa pochodzi od miejscowości Dunlop znajdującej się w Ayrshire. Ser charakteryzuje się jędrną i sprężystą konsystencją. Ma łagodny, nieco maślany smak — słodki, ale z delikatną, kwaskowatą nutą.",
    difficulty: "Średni",
    yield: "≈ 1,8 kg z 15 L mleka",
    ageTime: "3–9 miesięcy (często 5–7 mies.)",
    category: "Półtwardy szkocki ser stołowy",
    image: "https://mojaserowarnia.pl/images/dunlop.jpg",
    milkType: "15 L mleka (nie UHT; przy pasteryzowanym dodaj CaCl₂)",
    cultures: ["kultura mezofilna (odpowiednik C101/MA011)"],
    cultureSubstitutes: [
      {
        name: "Choozit MA 4001",
        type: "mezofilna",
        shop: "Wańczykówka",
        dosage: "~0,25 tsp na 15 L",
        notes: "Odpowiednik C101/MA011 do serów półtwardych."
      },
      {
        name: "MSE / MSE‑910 / MSO / MSO‑11",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,25 tsp na 15 L",
        notes: "Klasyczne kultury Lactococcus do serów półtwardych."
      },
      {
        name: "ALPHA 10 / ALPHA 12",
        type: "mezofilna",
        shop: "Lactic.pl",
        dosage: "~0,25 tsp na 15 L",
        notes: "Starter o łagodnej dynamice."
      },
      {
        name: "SH LYO / SM 02 LYO",
        type: "mezofilna",
        shop: "GAP Poland",
        dosage: "~0,25 tsp na 15 L",
        notes: "Do serów półtwardych/świeżych."
      },
      {
        name: "ML / ML‑O",
        type: "mezofilna",
        shop: "Artiser.pl",
        dosage: "~0,25 tsp na 15 L",
        notes: "Podstawowe kultury mezofilne."
      }
    ],
    steps: [
      {
        title: "1) Zakwaszanie 30 °C ~60 min",
        content: "Podgrzej mleko do 30 °C. Zaszczep kulturą mezofilną (niskie dawki, patrz tabela doboru kultur) i pozostaw na ~60 min w stałej temperaturze.",
        tip: "Utrzymuj stabilne 30 °C — zbyt wysokie temperatury przyspieszają zakwaszanie i mogą nadmiernie osuszyć ziarno."
      },
      {
        title: "2) Krzepnięcie podpuszczka ~45 min",
        content: "Dodaj płynną podpuszczkę (single‑strength), mieszając ok. 1 min. Pozostaw na ~45 min, aż uzyskasz czyste pęknięcie.",
        warning: "Test skrzepu: Unieś skrzep płaską stroną noża. Rozdział powinien być czysty wzdłuż krawędzi, bez drobnych odrywających się kawałków. Jeśli zbyt miękki — poczekaj 5–10 min i sprawdź ponownie."
      },
      {
        title: "3) Cięcie i wstępne mieszanie ~19 mm",
        content: "Po sprawdzeniu skrzepu upewnij się, że jest dobrze ścięty – powinien rozdzielać się czysto przy podniesieniu płaską stroną noża, bez drobnych oderwanych kawałków. Jeśli skrzep jest zbyt miękki, odczekaj jeszcze 5–10 minut i sprawdź ponownie.",
        substeps: [
          "Wykonaj pionowe cięcia w dwóch prostopadłych kierunkach co ok. ¾ cala (ok. 19 mm), aby uzyskać wzór \"szachownicy\".",
          "Pozostaw ziarno na 5 minut, aby goiły się cięcia.",
          "Następnie wykonaj poziome cięcia w podobnych odstępach, używając płaskiej łyżki lub noża ustawionego pod kątem.",
          "Gdy ziarno zostanie w pełni pocięte, delikatnie wymieszaj przez kilkadziesiąt sekund, aby zapobiec sklejaniu kawałków, a potem ponownie odstaw na ok. 5 minut do zagojenia drugich cięć.",
          "Po tym czasie mieszaj bardzo delikatnie przez ok. 10 minut, żeby lekko utwardzić ziarno przed etapem podgrzewania. Jeśli temperatura spadła poniżej 30 °C, delikatnie przywróć ją do 30 °C."
        ],
        tip: "Cel: uzyskać większy rozmiar ziarna (~19 mm) dla bardziej wilgotnego sera."
      },
      {
        title: "4) Podgrzewanie i podsuszanie ziaren do 36 °C ~20–30 min",
        content: "Rozpocznij powolne podgrzewanie skrzepu, aby stopniowo osuszyć ziarna. Podnieś temperaturę do 36 °C (97 °F) w ciągu ok. 20 minut, zwiększając ją o 1 °C co 5 minut na początku procesu. Ważne, aby tempo podgrzewania było łagodne – zbyt szybkie spowoduje zbyt duży ubytek wilgoci w zewnętrznej warstwie ziaren.",
        substeps: [
          "Całkowity czas \"gotowania\" wynosi 20 minut, ale jeśli ziarna są wciąż miękkie, możesz wydłużyć proces o dodatkowe 10 minut.",
          "Ziarna po zakończeniu powinny być jednolicie ugotowane i sprężyste, z niewielkim oporem przy ściśnięciu między palcami.",
          "Po osiągnięciu właściwej konsystencji pozostaw ziarna pod serwatką, aby mogły spokojnie osiągnąć odpowiednią kwasowość w ciągu kolejnych 30–60 min, mieszając co 5 min."
        ],
        tip: "Tempo: zwiększaj o ~1 °C co 5 min do 36 °C. Zbyt szybkie grzanie = zbyt suche ziarno."
      },
      {
        title: "5) Osiąganie właściwej kwasowości",
        content: "Po zakończeniu gotowania pozostaw ziarna w serwatce, aby kontynuowały rozwój kwasowości. Sprawdzaj pH co 15–30 min — docelowe pH wynosi około 6,2. Możesz użyć papierka lakmusowego lub po prostu obserwować ziarno: powinno stać się twardsze i bardziej matowe, a serwatka powinna nabrać lekko kwaśnego aromatu.",
        warning: "Nie śpiesz się z tym etapem! Zbyt wczesne odsączenie ziaren sprawi, że ser będzie gorzki lub zbyt kwaśny później."
      },
      {
        title: "6) Odsączanie i prasowanie wstępne",
        content: "Gdy ziarna osiągną odpowiednią kwasowość (pH ~6,2), odsącz serwatkę, przełóż ziarna do form wyłożonych tkaniną serowniczą i delikatnie upakuj. Prasuj z niewielkim ciężarem (~2–5 kg) przez ok. 15 minut, następnie obróć ser i kontynuuj prasowanie przez kolejne 15 minut.",
        tip: "To wstępne prasowanie pozwala ziarnom się spojrzeć i przygotowuje ser do dłuższego prasowania nocnego."
      },
      {
        title: "7) Prasowanie właściwe",
        content: "Po wstępnym prasowaniu zwiększ ciężar do ~10–15 kg i prasuj przez 12–18 godzin (najlepiej przez noc). Obracaj ser po 6 godzinach. Po tym czasie ser powinien być zwięzły, gładki i dobrze uformowany.",
        warning: "Zbyt małe obciążenie sprawi, że ser będzie miał pęknięcia i otwory. Zbyt duże może go za bardzo osuszyć."
      },
      {
        title: "8) Solenie na sucho lub w solance",
        content: "Po prasowaniu sol ser jedną z dwóch metod:",
        substeps: [
          "Solenie na sucho: Posyp powierzchnię sera solą morską (ok. 2% masy sera) i pozostaw w chłodnym miejscu przez 3–4 dni, obracając codziennie i dosypując sól.",
          "Solenie w solance: Zanurz ser w 18–20% solance na 8–12 godzin (w zależności od wielkości sera). Po tym czasie wyjmij i osusz."
        ],
        tip: "Solenie na sucho nadaje serowi bardziej złożony smak, ale wymaga więcej czasu i uwagi."
      },
      {
        title: "9) Dojrzewanie 11–13 °C, 80–85% RH",
        content: "Przenieś ser do przestrzeni dojrzewania o temperaturze 11–13 °C i wilgotności 80–85%. Dojrzewaj przez 3–9 miesięcy (często 5–7 miesięcy), obracając co 5–7 dni. Kontroluj pleśń powierzchniową — możesz ją usuwać wilgotną szmatką zwilżoną w lekko osolonej wodzie lub occie.",
        tip: "Młodszy ser (3 mies.) jest bardziej łagodny i kremowy. Dłuższe dojrzewanie (9 mies.) daje bardziej intensywny, orzechowy smak z lekką ostrością."
      }
    ]
  },
  {
    id: "yorkshire",
    name: "Yorkshire (Wensleydale)",
    description: "Wensleydale to historyczny ser z północnej Anglii, kojarzony m.in. z Wallace'em i Gromitem. Wywodzi się ze średniowiecznych tradycji klasztornych Yorkshire Dales. Wersja domowa daje delikatny, lekko maślany smak z subtelną kwaśną nutą, teksturę kruchą do sprężystej i kremowy odczucie w ustach.",
    difficulty: "Trudny",
    yield: "≈ 0,9–1,0 kg z 7,6 L mleka",
    ageTime: "2–4 miesiące (typowo 3 mies.)",
    category: "Historyczny ser z północnej Anglii",
    image: "https://mojaserowarnia.pl/images/yorkshire.jpg",
    milkType: "Mleko krowie (nie UHT); przy pasteryzowanym dodaj CaCl₂",
    cultures: ["kultura mezofilna - wolne zakwaszanie (połowa standardowej dawki)"],
    cultureSubstitutes: [
      {
        name: "Choozit MA 4001",
        type: "mezofilna",
        shop: "Wańczykówka",
        dosage: "~0,03 tsp (~0,15 g) na 7,6 L",
        notes: "Odpowiednik C101/MA011 do serów półtwardych."
      },
      {
        name: "MSE / MSE-910 / MSO / MSO-11",
        type: "mezofilna",
        shop: "Serowar.pl",
        dosage: "~0,03 tsp (~0,15 g) na 7,6 L",
        notes: "Klasyczne kultury Lactococcus do serów półtwardych."
      },
      {
        name: "ML / ML-O",
        type: "mezofilna",
        shop: "Artiser.pl",
        dosage: "~0,03 tsp (~0,15 g) na 7,6 L",
        notes: "Podstawowe kultury mezofilne."
      },
      {
        name: "ALPHA 10 / ALPHA 12",
        type: "mezofilna",
        shop: "Lactic.pl",
        dosage: "~0,03 tsp (~0,15 g) na 7,6 L",
        notes: "Starter o łagodnej dynamice."
      },
      {
        name: "SH LYO / SM 02 LYO",
        type: "mezofilna",
        shop: "GAP Poland",
        dosage: "~0,03 tsp (~0,15 g) na 7,6 L",
        notes: "Do serów półtwardych/świeżych."
      }
    ],
    steps: [
      {
        title: "1) Zakwaszanie 30 °C ~60 min",
        content: "Podgrzej mleko do 30 °C. Zaszczep połową standardowej dawki kultury mezofilnej (~0,125 tsp / ~0,6 g) i pozostaw na ~60 min w stałej temperaturze.",
        tip: "Posyp kulturę na powierzchni mleka, odczekaj 2 min na nawilżenie, potem delikatnie wymieszaj. Yorkshire potrzebuje wolnego, długiego rozwoju kwasowości."
      },
      {
        title: "2) Krzepnięcie podpuszczka ~45 min",
        content: "Dodaj 1,25 ml (¼ tsp) płynnej podpuszczki (single-strength), mieszając ok. 30 s góra-dół. Pozostaw na ~45 min, aż uzyskasz mocny skrzep.",
        tip: "Test skrzepu: Skrzep powinien się czysto rozdzielać przy podniesieniu płaską stroną noża, bez drobnych odrywających się kawałków."
      },
      {
        title: "3) Cięcie i wstępne mieszanie ~1,2 cm",
        content: "Potnij skrzep na kostki ~1,2 cm. Odczekaj 5 min, następnie bardzo delikatnie przewracaj ziarna co 3–5 min ruchem z dołu do góry.",
        warning: "Nie pozwól ziarnom się zlepić w masę! Mieszanie ma być bardzo delikatne, tylko żeby utrzymać je w ruchu."
      },
      {
        title: "4) Suszenie ziaren (BEZ gotowania!) ~30 °C przez 90 min",
        content: "Utrzymuj 30 °C (nie podgrzewaj wyżej!). Mieszaj powoli przez 90 min ruchem z dołu do góry, aby równomiernie oddały serwatkę.",
        tip: "Test gotowości: Ziarno po złamaniu ma być jędrne i sprężyste przez całą grubość, z umiarkowanym oporem przy ściśnięciu między palcami."
      },
      {
        title: "5) Odsączanie i wstępne formowanie bloku",
        content: "Przełóż ziarna do cedzaka wyłożonego gazą serowarską (butter muslin). Zwiąż w węzeł i odwróć na supeł. Utrzymuj ciepło przez ~30 min.",
        tip: "Można dociążyć deską i naczyniem z ciepłą wodą (~2 kg), aby masa się dobrze związała w blok."
      },
      {
        title: "6) \"Przełamywanie\" masy (cheddaring w stylu Wensleydale)",
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
        content: "Wyłóż formę gazą, ciasno upakuj ziarna, wyrównaj fałdy tkaniny, zawiń nad wierzchem i załóż tłok. Prasuj stopniowo:",
        substeps: [
          "12 h przy ~2,3 kg — noc",
          "5 h przy ~9 kg — rano",
          "12 h przy ~20 kg",
          "12 h przy ~20 kg po obrocie"
        ],
        tip: "Przy każdym etapie: Wyjmij ser, odwiń, odwróć, ponownie zawiń i wróć do prasy. Wyciekanie serwatki ma być \"łzawe\" — pojedyncze krople, nie strumień."
      },
      {
        title: "9) Woskowanie i dojrzewanie",
        content: "Osusz bochenek i zabezpiecz woskiem serowarskim lub opatrunkiem płóciennym. Dojrzewaj w 11–13 °C i 80–85% RH przez 2–4 miesiące (typowo 3 mies.).",
        tip: "Dojrzewanie: Obracaj co 5–7 dni. Gotowy Yorkshire ma delikatnie słodkawy smak z subtelną kwaśną nutą, kruchą do sprężystej teksturę i kremowy odczucie w ustach."
      }
    ]
  }
];

export const getRecipeById = (id: string): Recipe | undefined => {
  return recipesData.find(recipe => recipe.id === id);
};

export const getRecipesByDifficulty = (difficulty: Recipe["difficulty"]): Recipe[] => {
  return recipesData.filter(recipe => recipe.difficulty === difficulty);
};