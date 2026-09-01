import involtiniGoudaImage from "@/assets/involtini-gouda.jpg";
import zapiekankaBrieImage from "@/assets/zapiekanka-brie.jpg";
import risottoGorgonzolaImage from "@/assets/risotto-gorgonzola.jpg";
import tartaCamembertImage from "@/assets/tarta-camembert.jpg";
// TYMCZASOWO: brak zdjecia sernika, uzywamy zdjecia twarogu (glowny skladnik).
// Do podmiany, gdy bedzie zdjecie gotowego ciasta.
import twarogImage from "@/assets/twarog.webp";

export interface CulinaryIngredient {
  name: string;
  amount: string;
  category: 'base' | 'filling' | 'sauce' | 'garnish';
}

export interface CulinaryStep {
  title: string;
  content: string;
  tip?: string;
  warning?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export interface CulinaryRecipe {
  id: string;
  name: string;
  subtitle: string;
  difficulty: 'łatwy' | 'średni' | 'zaawansowany';
  prepTime: string;
  cookTime: string;
  servings: number;
  description: string;
  strategy: string;
  image: string;
  mainCheese: string;
  ingredients: CulinaryIngredient[];
  steps: CulinaryStep[];
  presentation: string[];
  wineRecommendation?: string;
  tags: string[];
  nutrition: NutritionInfo;
}

export const culinaryRecipesData: CulinaryRecipe[] = [
  {
    id: "warminski-sernik-bakaliowy",
    name: "Warmiński Sernik Bakaliowy",
    subtitle: "Ciężki od bakalii, na własnym twarogu i miodzie",
    difficulty: "średni",
    prepTime: "40 min",
    cookTime: "75 min",
    servings: 12,
    description: "Sernik w duchu warmińskiego wypieku świątecznego — ciężki, wilgotny i gęsto naładowany bakaliami. Rodzynki, morele, suszone śliwki, orzechy laskowe i kandyzowana skórka pomarańczowa, wszystko namoczone dzień wcześniej, plus łyżka miodu, który zamiast części cukru daje głębię i zatrzymuje wilgoć. To nasza kompozycja w tej tradycji, a nie odtworzenie konkretnego historycznego przepisu — ale każdy element ma tu swoje uzasadnienie: na Warmii ciasto świąteczne mierzyło się ilością bakalii, a te docierały na północ przez bałtyckie porty na długo przed tym, zanim stały się codziennością.",
    strategy: "Sernik jest bezlitosny dla złego twarogu — nie ma się w czym schować. Cała reszta przepisu to tylko oprawa dla jednego kilograma sera, więc od niego zależy wszystko: czy masa będzie kremowa czy ziarnista, czy sernik opadnie, czy pęknie. Dlatego zaczynamy nie od piekarnika, tylko od twarogu. Najlepszy jest [[twaróg zrobiony samodzielnie]], odciśnięty dłużej niż do jedzenia na świeżo — z 8 litrów mleka wychodzi około kilograma, czyli dokładnie tyle, ile potrzeba na tę blachę. Miód zastępuje część cukru: jest higroskopijny, więc sernik dłużej zostaje wilgotny, a bakalie namoczone dzień wcześniej nie wyciągają wody z masy podczas pieczenia. To ostatnie jest najczęstszą przyczyną suchego sernika z bakaliami.",
    image: twarogImage,
    mainCheese: "Twaróg",

    ingredients: [
      { name: "Mąka pszenna", amount: "250 g", category: "base" },
      { name: "Masło zimne", amount: "125 g", category: "base" },
      { name: "Cukier puder", amount: "80 g", category: "base" },
      { name: "Żółtka", amount: "2 szt.", category: "base" },
      { name: "Śmietana 18%", amount: "1 łyżka", category: "base" },
      { name: "Proszek do pieczenia", amount: "1/2 łyżeczki", category: "base" },
      { name: "Sól", amount: "szczypta", category: "base" },

      { name: "Twaróg tłusty, dobrze odciśnięty", amount: "1 kg", category: "filling" },
      { name: "Masło (miękkie)", amount: "150 g", category: "filling" },
      { name: "Cukier", amount: "180 g", category: "filling" },
      { name: "Miód (najlepiej lipowy lub gryczany)", amount: "2 łyżki", category: "filling" },
      { name: "Jajka", amount: "5 szt.", category: "filling" },
      { name: "Budyń waniliowy w proszku", amount: "40 g (1 opak.)", category: "filling" },
      { name: "Śmietana 30%", amount: "100 ml", category: "filling" },
      { name: "Skórka otarta z cytryny", amount: "1 szt.", category: "filling" },
      { name: "Cukier waniliowy", amount: "1 opak.", category: "filling" },

      { name: "Rodzynki", amount: "100 g", category: "garnish" },
      { name: "Morele suszone", amount: "80 g", category: "garnish" },
      { name: "Śliwki suszone (bez pestek)", amount: "80 g", category: "garnish" },
      { name: "Orzechy laskowe", amount: "80 g", category: "garnish" },
      { name: "Skórka pomarańczowa kandyzowana", amount: "50 g", category: "garnish" },
      { name: "Płatki migdałowe", amount: "30 g", category: "garnish" },
      { name: "Mocna herbata lub rum do namoczenia", amount: "150 ml", category: "garnish" },
      { name: "Cukier puder do posypania", amount: "do smaku", category: "garnish" }
    ],

    steps: [
      {
        title: "1) Bakalie — dzień wcześniej",
        content: "Morele i śliwki pokrój w kostkę wielkości rodzynki. Wsyp wszystkie suszone owoce i skórkę pomarańczową do słoika, zalej gorącą mocną herbatą (albo rumem, albo pół na pół) i zostaw na noc. Rano odcedź i osusz na ręczniku papierowym. Orzechy laskowe upraż na suchej patelni, przetrzyj w ściereczce ze skórek i posiekaj grubo.",
        tip: "Herbata daje głębszy, mniej słodki efekt niż sam wrzątek i dobrze współgra z miodem. Rum robi z tego ciasto wyraźnie świąteczne.",
        warning: "Nie pomijaj namaczania. Suche bakalie wsypane wprost do masy zachowują się jak gąbki — wyciągają wodę z sera podczas pieczenia i to jest najczęstsza przyczyna suchego, kruszącego się sernika."
      },
      {
        title: "2) Twaróg — na tym stoi cały sernik",
        content: "Potrzebujesz kilograma twarogu TŁUSTEGO lub co najmniej półtłustego, dobrze odciśniętego i możliwie świeżego. Zmiel go dwukrotnie przez maszynkę o drobnych oczkach — dwa razy, nie raz. Jeśli robisz [[twaróg w domu]], odciskaj go dłużej niż do jedzenia na świeżo: 4–6 godzin zamiast dwóch, aż masa przestanie kapać, ale zanim zrobi się krucha i sypka.",
        tip: "Czego szukać w kupnym: twaróg klinkowy albo krajanka, skład wyłącznie mleko i kultury bakterii, zwięzła konsystencja. Twaróg wiaderkowy bywa za wodnisty i częściej zawiera dodatki — na sernik nadaje się gorzej.",
        warning: "Twaróg chudy da sernik suchy i skłonny do pękania — tłuszcz jest tu potrzebny nie dla smaku, tylko dla struktury. Twaróg przekwaszony (kilkudniowy, ostry w smaku) może zwarzyć masę po dodaniu jajek. Nie miksuj blenderem: wysokie obroty rozbijają białko i masa robi się kleista zamiast puszystej."
      },
      {
        title: "3) Kruchy spód",
        content: "Zimne masło posiekaj z mąką, cukrem pudrem, proszkiem i solą na drobną kruszonkę. Dodaj żółtka i łyżkę śmietany, szybko zagnieć — im krócej, tym lepiej. Zawiń w folię i schłodź 30 minut. Rozwałkuj i wyłóż dno blachy 24×34 cm, nakłuj widelcem i podpiecz 15 minut w 180°C, aż lekko się zarumieni.",
        tip: "Podpieczenie spodu to różnica między chrupiącym dnem a rozmiękłym plackiem pod mokrą masą serową."
      },
      {
        title: "4) Masa serowa",
        content: "Miękkie masło utrzyj z cukrem, cukrem waniliowym i miodem na jasną, puszystą masę. Dodawaj po jednym żółtku, cały czas ucierając. Wmieszaj zmielony twaróg, budyń w proszku, śmietanę i skórkę cytrynową — mieszaj już wolno, tylko do połączenia. Na końcu wmieszaj delikatnie ubitą na sztywno pianę z 5 białek, w dwóch albo trzech partiach.",
        tip: "Miód wmieszaj razem z cukrem do masła, a nie na końcu — rozprowadzi się równomiernie i nie osiądzie na dnie.",
        warning: "Pianę wmieszaj łyżką albo szpatułką, ruchem od dołu do góry. Zmiksowanie jej z masą wybija powietrze i sernik wyjdzie zbity."
      },
      {
        title: "5) Bakalie i pieczenie",
        content: "Osuszone bakalie i orzechy obtocz w łyżce mąki i wmieszaj do masy — mąka zapobiega opadaniu na dno. Wyłóż masę na podpieczony spód, wyrównaj, posyp płatkami migdałowymi. Piecz 75 minut w 160°C (grzanie góra-dół, bez termoobiegu). Sernik jest gotowy, gdy brzegi są ścięte, a środek przy potrząśnięciu blachą lekko faluje.",
        tip: "Postaw na dnie piekarnika naczynie z wodą. Wilgotne powietrze znacznie zmniejsza ryzyko pęknięcia wierzchu.",
        warning: "Nie otwieraj piekarnika przez pierwsze 50 minut. Gwałtowna zmiana temperatury to druga, po zbyt wysokim grzaniu, przyczyna zapadniętego środka."
      },
      {
        title: "6) Studzenie i dojrzewanie",
        content: "Wyłącz piekarnik, uchyl drzwiczki i zostaw sernik w środku na godzinę. Potem wyjmij i studź do temperatury pokojowej, a następnie wstaw na noc do lodówki. Podawaj oprószony cukrem pudrem.",
        tip: "Sernik bakaliowy smakuje najlepiej drugiego dnia — bakalie oddają aromat masie, a struktura się ustala. Świeżo upieczony jest jeszcze luźny i mniej wyrazisty."
      }
    ],

    presentation: [
      "Podawaj w grubych kawałkach, w temperaturze pokojowej — z lodówki bakalie są twarde, a tłuszcz zbity.",
      "Oprósz cukrem pudrem tuż przed podaniem, nie wcześniej — na wilgotnym wierzchu rozpuści się w kilka minut.",
      "Do świątecznego stołu: kleks bitej śmietany i kilka orzechów laskowych obok kawałka.",
      "Kawałek podgrzany 15 sekund w mikrofali odzyskuje aromat miodu i bakalii."
    ],

    wineRecommendation: "Herbata z cytryną albo kawa po turecku — tak się go na Warmii jadało. Z alkoholi: nalewka z aronii lub kieliszek słodkiego wina deserowego, na przykład tokaju.",

    tags: ["sernik", "twaróg", "warmia", "bakalie", "ciasto", "święta", "miód", "wypieki"],

    nutrition: {
      calories: 512,
      protein: 16,
      carbs: 49,
      fat: 28,
      fiber: 3,
      sodium: 180
    }
  },
  {
    id: "aksamitne-involtini-gouda",
    name: "Aksamitne Involtini z Płynnym Sercem Goudy",
    subtitle: "Cielęce roladki z karmelizowanymi warzywami",
    difficulty: "zaawansowany",
    prepTime: "30 min",
    cookTime: "35 min",
    servings: 2,
    description: "Eleganckie cielęce involtini z płynnym sercem z sera Gouda, podawane na gnieździe karmelizowanych warzyw korzeniowych z aksamitnym sosem maślanym. Danie łączące techniczną finezję z głębią smaku - idealne na romantyczną kolację.",
    strategy: "Łata cielęca to mięso pełne smaku, ale dość trudne technicznie – jest płaskie, włókniste i wymaga odpowiedniego traktowania. Rozbijamy ją bardzo cienko, dzięki czemu włókna zmiękną, a krótki czas duszenia wystarczy, by mięso było kruche. Słony, ciągnący się ser Gouda w środku kontrastuje z chrupkimi, pieczonymi warzywami na zewnątrz. Roladki pokrojone pod skosem wyglądają jak danie z restauracji.",
    image: involtiniGoudaImage,
    mainCheese: "Gouda",
    ingredients: [
      // Baza
      { name: "Łata cielęca (oczyszczona z błon)", amount: "500-600g", category: "base" },
      { name: "Ser Gouda (starty lub w słupkach)", amount: "100-150g", category: "base" },
      
      // Farsz i przyprawy
      { name: "Musztarda Dijon lub sarepska", amount: "2 łyżki", category: "filling" },
      { name: "Świeży tymianek", amount: "kilka gałązek", category: "filling" },
      { name: "Rozmaryn", amount: "2 gałązki", category: "filling" },
      { name: "Czosnek", amount: "2 ząbki", category: "filling" },
      { name: "Sól morska", amount: "do smaku", category: "filling" },
      { name: "Świeżo mielony pieprz", amount: "do smaku", category: "filling" },
      
      // Sos i warzywa
      { name: "Marchew", amount: "2 sztuki", category: "sauce" },
      { name: "Pietruszka (korzeń)", amount: "1 sztuka", category: "sauce" },
      { name: "Seler (korzeń)", amount: "1/2 sztuki", category: "sauce" },
      { name: "Papryka czerwona", amount: "1 sztuka", category: "sauce" },
      { name: "Białe wino wytrawne", amount: "1/2 szklanki", category: "sauce" },
      { name: "Masło (zimne)", amount: "2 łyżki", category: "sauce" },
      { name: "Bulion wołowy lub drobiowy", amount: "1/2 szklanki", category: "sauce" },
      { name: "Olej do smażenia", amount: "2 łyżki", category: "sauce" },
      
      // Dekoracja
      { name: "Świeży tymianek do dekoracji", amount: "kilka gałązek", category: "garnish" },
    ],
    steps: [
      {
        title: "Przygotowanie mięsa (Fundament)",
        content: "Łata cielęca jest nierówna. Połóż ją na desce, przykryj folią spożywczą i rozbij tłuczkiem bardzo cienko (na grubość ok. 0,5 cm). Jeśli płat jest duży, podziel go na mniejsze prostokąty wielkości dłoni. Oprósz mięso solą i pieprzem z obu stron.",
        tip: "Rozbijanie mięsa pod folią zapobiega rozbryzgom i pozwala uzyskać równomierną grubość."
      },
      {
        title: "Budowanie smaku (Farsz)",
        content: "Każdy płat mięsa posmaruj cienką warstwą musztardy. Na środku ułóż porcję sera Gouda. Jeśli masz paprykę lub cukinię, pokrój je w cieniutkie słupki (julienne) i połóż 2-3 słupki obok sera. Posyp ziołami.",
        tip: "Trik szefa kuchni: Słupki warzyw dodadzą chrupkości w środku roladki."
      },
      {
        title: "Formowanie (Involtini)",
        content: "Zwiń mięso ciasno w roladki, zamykając ser w środku. Zepnij wykałaczkami lub obwiąż nicią kuchenną, aby ser nie uciekł podczas smażenia.",
        warning: "Pamiętaj o usunięciu wykałaczek/nici przed podaniem!"
      },
      {
        title: "Smażenie (Reakcja Maillarda)",
        content: "Na patelni rozgrzej olej na średnio-wysokim ogniu. Obsmaż roladki na złoty kolor z każdej strony (około 2-3 minuty na stronę). To właśnie tutaj powstaje głębia smaku dzięki reakcji Maillarda. Gdy mięso jest brązowe, zdejmij je na chwilę na talerz.",
        tip: "Nie ruszaj roladek zbyt często - pozwól im się zrumienić."
      },
      {
        title: "Duszenie z warzywami",
        content: "Na tę samą patelnię wrzuć pokrojone w grubszą kostkę warzywa korzeniowe (marchew, pietruszkę, seler). Smaż 2-3 minuty, mieszając. Wlej wino, zeskrobując drewnianą łopatką smak ze dna patelni (to tzw. deglazowanie). Dodaj bulion. Włóż roladki z powrotem między warzywa. Przykryj i duś na małym ogniu przez 25-30 minut.",
        tip: "Deglazowanie uwalnia wszystkie karmelizowane soki, które nadają sosowi głębię."
      },
      {
        title: "Wykończenie sosu (Aksamit)",
        content: "Wyjmij mięso i warzywa na talerz. Do sosu, który został na patelni, dodaj łyżkę zimnego masła i energicznie wymieszaj trzepaczką lub widelcem. Sos stanie się błyszczący, gęsty i aksamitny. Dopraw do smaku solą i pieprzem.",
        tip: "Zimne masło emulguje sos, nadając mu restauracyjny połysk."
      }
    ],
    presentation: [
      "Usuń wykałaczki lub nić kuchenną z roladek.",
      "Przekrój każdą roladkę na pół pod kątem 45 stopni, aby było widać płynny, ciągnący się ser w środku.",
      "Na talerzu ułóż 'gniazdo' z duszonych warzyw korzeniowych.",
      "Na warzywach ułóż roladki przekrojoną stroną do góry.",
      "Całość polej aksamitnym sosem maślanym z patelni.",
      "Udekoruj świeżymi gałązkami tymianku."
    ],
    wineRecommendation: "Do cielęciny z goudą świetnie pasuje Chardonnay z dębową nutą (jeśli preferujesz białe) lub lekki, owocowy Pinot Noir (czerwone). Oba wina podkreślą kremowość sera i delikatność cielęciny.",
    tags: ["cielęcina", "gouda", "romantyczna kolacja", "eleganckie", "roladki", "ser", "duszone"],
    nutrition: {
      calories: 485,
      protein: 38,
      carbs: 12,
      fat: 32,
      fiber: 3,
      sodium: 580
    }
  },
  {
    id: "zapiekane-brie-miodem-orzechami",
    name: "Zapiekane Brie z Miodem i Orzechami Włoskimi",
    subtitle: "Karmelizowany camembert w cieście francuskim",
    difficulty: "łatwy",
    prepTime: "15 min",
    cookTime: "20 min",
    servings: 4,
    description: "Elegancka przystawka lub deser - całe koło sera Brie zapiekane w złocistym cieście francuskim z miodem i chrupiącymi orzechami. Perfekcyjne na wieczór z winem lub jako efektowny początek uroczystej kolacji.",
    strategy: "Brie to ser o intensywnym, grzybowym aromacie i kremowej konsystencji po podgrzaniu. Ciasto francuskie tworzy chrupiącą skorupkę, która kontrastuje z płynnym wnętrzem sera. Miód i orzechy dodają słodyczy i tekstury, równoważąc słoność sera.",
    image: zapiekankaBrieImage,
    mainCheese: "Brie",
    ingredients: [
      { name: "Ser Brie (całe koło)", amount: "250g", category: "base" },
      { name: "Ciasto francuskie (gotowe)", amount: "1 arkusz", category: "base" },
      { name: "Jajko (do posmarowania)", amount: "1 sztuka", category: "base" },
      { name: "Miód naturalny", amount: "3 łyżki", category: "filling" },
      { name: "Orzechy włoskie", amount: "50g", category: "filling" },
      { name: "Świeży rozmaryn", amount: "2 gałązki", category: "filling" },
      { name: "Czosnek", amount: "1 ząbek", category: "filling" },
      { name: "Sól morska", amount: "szczypta", category: "filling" },
      { name: "Świeżo mielony pieprz", amount: "do smaku", category: "filling" },
      { name: "Bagietka (do podania)", amount: "1 sztuka", category: "garnish" },
      { name: "Świeże owoce (winogrona, figi)", amount: "do podania", category: "garnish" }
    ],
    steps: [
      {
        title: "Przygotowanie piekarnika",
        content: "Rozgrzej piekarnik do 200°C (góra-dół). Wyłóż blachę papierem do pieczenia.",
        tip: "Ciepły piekarnik jest kluczowy - ciasto musi szybko urosnąć i zrumienić się."
      },
      {
        title: "Przygotowanie sera",
        content: "Wyjmij ser Brie z lodówki 30 minut przed pieczeniem. Na wierzchu sera zrób delikatne nacięcia w kratkę (nie przecinając skórki na wylot). Wciśnij w nacięcia drobno posiekany czosnek i listki rozmarynu.",
        tip: "Nacięcia pozwolą aromatom wniknąć w ser i ułatwią późniejsze porcjowanie."
      },
      {
        title: "Zawijanie w ciasto",
        content: "Rozłóż ciasto francuskie. Na środku połóż ser Brie. Posyp go połową orzechów włoskich. Polej 1 łyżką miodu. Zawiń ciasto wokół sera, zamykając go szczelnie. Możesz zostawić górę otwartą lub całkowicie zamknąć - obie wersje są pyszne.",
        warning: "Jeśli zamykasz całkowicie, zrób małe nacięcie na górze, aby para mogła uciekać."
      },
      {
        title: "Wykończenie przed pieczeniem",
        content: "Roztrzep jajko i posmaruj nim ciasto. Możesz posypać resztą orzechów włoskich na wierzchu.",
        tip: "Jajko nada ciastu piękny, złocisty kolor."
      },
      {
        title: "Pieczenie",
        content: "Piecz przez 18-22 minuty, aż ciasto będzie złociste i chrupiące. Ser w środku powinien być całkowicie rozpuszczony.",
        tip: "Sprawdź po 15 minutach - każdy piekarnik jest inny."
      },
      {
        title: "Podanie",
        content: "Wyjmij z piekarnika i natychmiast polej pozostałym miodem. Posyp świeżym rozmarynem i szczyptą soli morskiej. Podawaj gorące z pokrojoną bagietką i świeżymi owocami.",
        tip: "Jedz natychmiast - ser najlepiej smakuje, gdy jest płynny i gorący."
      }
    ],
    presentation: [
      "Ułóż zapiekane Brie na drewnianej desce do serwowania.",
      "Wokół rozłóż plastry bagietki, winogrona i figi.",
      "Polej dodatkowym miodem tuż przed podaniem.",
      "Posyp świeżym rozmarynem i gruboziarnistą solą.",
      "Podawaj z małymi nożykami do sera."
    ],
    wineRecommendation: "Półsłodki Riesling lub Gewürztraminer doskonale zrównoważą słoność sera i słodycz miodu. Dla miłośników czerwonych win - lekkie Beaujolais.",
    tags: ["brie", "przystawka", "deser", "eleganckie", "szybkie", "wino", "orzechy", "miód"],
    nutrition: {
      calories: 420,
      protein: 14,
      carbs: 28,
      fat: 29,
      fiber: 2,
      sodium: 490
    }
  },
  {
    id: "kremowe-risotto-gorgonzola",
    name: "Kremowe Risotto z Gorgonzolą i Gruszką",
    subtitle: "Włoska klasyka z nutą słodyczy",
    difficulty: "średni",
    prepTime: "10 min",
    cookTime: "30 min",
    servings: 2,
    description: "Aksamitne risotto z intensywnym smakiem sera pleśniowego Gorgonzola, zbalansowane słodyczą karmelizowanej gruszki i chrupkością prażonych orzechów. Klasyczne połączenie kuchni północnych Włoch.",
    strategy: "Gorgonzola to ser o intensywnym, pikantnym smaku, który wymaga równowagi. Gruszka dodaje naturalnej słodyczy, która łagodzi ostrość sera. Technika risotto wymaga cierpliwości - stopniowe dodawanie bulionu i ciągłe mieszanie uwalnia skrobię z ryżu, tworząc kremową konsystencję bez użycia śmietany.",
    image: risottoGorgonzolaImage,
    mainCheese: "Gorgonzola",
    ingredients: [
      { name: "Ryż arborio lub carnaroli", amount: "200g", category: "base" },
      { name: "Ser Gorgonzola", amount: "120g", category: "base" },
      { name: "Bulion warzywny lub drobiowy (ciepły)", amount: "800ml", category: "base" },
      { name: "Białe wino wytrawne", amount: "100ml", category: "base" },
      { name: "Gruszka dojrzała", amount: "1 sztuka", category: "filling" },
      { name: "Cebula szalotka", amount: "1 sztuka", category: "filling" },
      { name: "Masło", amount: "50g", category: "filling" },
      { name: "Orzechy włoskie", amount: "30g", category: "filling" },
      { name: "Parmezan (starty)", amount: "30g", category: "filling" },
      { name: "Oliwa z oliwek", amount: "2 łyżki", category: "filling" },
      { name: "Sól i pieprz", amount: "do smaku", category: "filling" },
      { name: "Świeży tymianek", amount: "kilka gałązek", category: "garnish" },
      { name: "Miód (opcjonalnie)", amount: "1 łyżeczka", category: "garnish" }
    ],
    steps: [
      {
        title: "Przygotowanie składników",
        content: "Rozgrzej bulion i utrzymuj go ciepły przez cały czas gotowania. Drobno posiekaj szalotkę. Gorgonzolę pokrój w kostkę. Gruszkę pokrój w cienkie plastry lub kostkę.",
        tip: "Ciepły bulion jest kluczowy - zimny zatrzymałby proces gotowania."
      },
      {
        title: "Karmelizacja gruszki",
        content: "Na małej patelni rozgrzej łyżkę masła. Podsmaż plastry gruszki na złoty kolor z każdej strony (2-3 minuty). Opcjonalnie skrop łyżeczką miodu. Odłóż na bok.",
        tip: "Gruszka powinna być al dente - lekko miękka, ale wciąż z charakterem."
      },
      {
        title: "Podstawa risotto",
        content: "W szerokim garnku lub patelni rozgrzej oliwę z łyżką masła. Zeszklij szalotkę (2-3 minuty). Dodaj ryż i smaż przez minutę, mieszając, aż ziarna staną się lekko przezroczyste na brzegach.",
        tip: "To 'tostowanie' ryżu zamyka skrobię wewnątrz i zapobiega rozgotowaniu."
      },
      {
        title: "Deglazing",
        content: "Wlej wino i mieszaj, aż całkowicie wyparuje. To moment, w którym risotto zyskuje głębię smaku.",
        warning: "Nie pomijaj tego kroku - wino jest kluczowe dla smaku!"
      },
      {
        title: "Gotowanie risotto",
        content: "Dodawaj bulion po jednej chochli, mieszając i czekając, aż płyn się wchłonie przed dodaniem kolejnej porcji. Powtarzaj przez 18-20 minut. Ryż powinien być al dente - miękki, ale z lekkim oporem w środku.",
        tip: "Nie spiesz się - to medytacyjny proces. Ciągłe mieszanie uwalnia skrobię."
      },
      {
        title: "Mantecatura (kremowanie)",
        content: "Zdejmij garnek z ognia. Dodaj pokrojoną Gorgonzolę, pozostałe masło i połowę parmezanu. Energicznie mieszaj przez minutę, aż risotto będzie kremowe i błyszczące. Dopraw solą i pieprzem.",
        tip: "Mantecatura to sekret włoskich kucharzy - mieszanie poza ogniem tworzy idealną konsystencję."
      }
    ],
    presentation: [
      "Rozłóż risotto na ciepłych, płaskich talerzach, formując lekką 'falę'.",
      "Na wierzchu ułóż karmelizowane plastry gruszki.",
      "Posyp prażonymi orzechami włoskimi.",
      "Dodaj płatki pozostałej Gorgonzoli i parmezanu.",
      "Udekoruj świeżym tymiankiem.",
      "Podawaj natychmiast - risotto nie lubi czekać."
    ],
    wineRecommendation: "Klasyczne połączenie to Barolo lub Barbaresco z Piemontu. Dla lżejszej opcji - Pinot Grigio z Alto Adige, które orzeźwi podniebienie po intensywnym serze.",
    tags: ["risotto", "gorgonzola", "gruszka", "włoskie", "eleganckie", "romantyczna kolacja", "wegetariańskie"],
    nutrition: {
      calories: 520,
      protein: 18,
      carbs: 58,
      fat: 24,
      fiber: 3,
      sodium: 720
    }
  },
  {
    id: "rustykalna-tarta-camembert",
    name: "Rustykalna Tarta z Camembertem i Karmelizowaną Cebulą",
    subtitle: "Francuska elegancja w rustykalnej formie",
    difficulty: "średni",
    prepTime: "25 min",
    cookTime: "40 min",
    servings: 6,
    description: "Krucha tarta z maslanego ciasta wypełniona aksamitnym kremem jajecznym, plastrem dojrzałego Camemberta i słodką karmelizowaną cebulą. Połączenie normandzkiej tradycji z nowoczesną estetyką.",
    strategy: "Camembert to ser o delikatniejszym smaku niż Brie, z wyraźną grzybową nutą. Karmelizowana cebula dodaje głębi i słodyczy, która równoważy umami sera. Ciasto kruche zapewnia chrupiący kontrast do kremowego nadzienia. Kluczem jest odpowiednia temperatura pieczenia - ser ma się stopić, ale nie rozlać.",
    image: tartaCamembertImage,
    mainCheese: "Camembert",
    ingredients: [
      { name: "Ciasto kruche (gotowe lub domowe)", amount: "1 arkusz (250g)", category: "base" },
      { name: "Ser Camembert", amount: "250g", category: "base" },
      { name: "Jajka", amount: "3 sztuki", category: "base" },
      { name: "Śmietanka 30%", amount: "200ml", category: "base" },
      { name: "Cebula (duża)", amount: "3 sztuki", category: "filling" },
      { name: "Masło", amount: "40g", category: "filling" },
      { name: "Cukier (do karmelizacji)", amount: "1 łyżka", category: "filling" },
      { name: "Świeży tymianek", amount: "4-5 gałązek", category: "filling" },
      { name: "Gałka muszkatołowa", amount: "szczypta", category: "filling" },
      { name: "Sól i pieprz", amount: "do smaku", category: "filling" },
      { name: "Ocet balsamiczny", amount: "1 łyżka", category: "filling" },
      { name: "Sałata (do podania)", amount: "garść", category: "garnish" },
      { name: "Orzechy włoskie", amount: "30g", category: "garnish" }
    ],
    steps: [
      {
        title: "Karmelizacja cebuli (można dzień wcześniej)",
        content: "Pokrój cebulę w cienkie półksiężyce. Na patelni rozgrzej masło, dodaj cebulę i szczyptę soli. Smaż na małym ogniu przez 30-40 minut, mieszając co kilka minut. Gdy cebula zmięknie, dodaj cukier i ocet balsamiczny. Smaż jeszcze 10 minut, aż będzie złocisto-brązowa i słodka.",
        tip: "Cierpliwość jest kluczem - prawdziwa karmelizacja trwa. Nie zwiększaj ognia!"
      },
      {
        title: "Przygotowanie formy",
        content: "Rozłóż ciasto kruche w formie do tarty (24-26 cm) z wyjmowanym dnem. Przyciśnij do brzegów i odetnij nadmiar. Nakłuj dno widelcem. Schłódź w lodówce przez 15 minut.",
        tip: "Schłodzone ciasto mniej się kurczy podczas pieczenia."
      },
      {
        title: "Ślepe pieczenie",
        content: "Rozgrzej piekarnik do 180°C. Wyłóż ciasto papierem do pieczenia i zasypane fasolą lub kulkami do pieczenia. Piecz 15 minut. Usuń fasolę i piecz jeszcze 5 minut, aż dno będzie suche.",
        warning: "Ten krok jest kluczowy - zapobiega rozmoczeniu ciasta przez nadzienie."
      },
      {
        title: "Przygotowanie nadzienia",
        content: "W misce ubij jajka ze śmietanką. Dodaj listki tymianku (zostaw trochę do dekoracji), gałkę muszkatołową, sól i pieprz. Wymieszaj.",
        tip: "Nadzienie powinno być dobrze przyprawione - ser doda głównie umami, nie soli."
      },
      {
        title: "Składanie tarty",
        content: "Na podpieczonym cieście rozłóż równomiernie karmelizowaną cebulę. Camembert pokrój w plastry (ze skórką - ona jest jadalna i dodaje smaku). Ułóż plastry sera na cebuli. Delikatnie wlej nadzienie jajeczne.",
        tip: "Nie wypełniaj do samej góry - nadzienie lekko urośnie podczas pieczenia."
      },
      {
        title: "Pieczenie",
        content: "Piecz w 180°C przez 25-30 minut, aż nadzienie będzie ścięte, ale lekko drżące w środku. Ser powinien się lekko zrumienić.",
        tip: "Tarta będzie się dalej ścianać po wyjęciu z piekarnika."
      }
    ],
    presentation: [
      "Pozwól tarcie odpocząć 10 minut przed krojeniem.",
      "Pokrój na trójkątne kawałki.",
      "Podawaj na talerzach z garścią świeżej sałaty.",
      "Posyp prażonymi orzechami włoskimi.",
      "Udekoruj świeżym tymiankiem.",
      "Tarta jest pyszna ciepła, letnia i zimna - uniwersalna!"
    ],
    wineRecommendation: "Normandzki Cidre (cydr jabłkowy) to klasyczne, regionalne połączenie. Alternatywnie - lekkie, owocowe Beaujolais lub białe Burgundy (Chablis).",
    tags: ["tarta", "camembert", "cebula", "francuskie", "eleganckie", "brunch", "wegetariańskie", "przekąska"],
    nutrition: {
      calories: 380,
      protein: 12,
      carbs: 24,
      fat: 26,
      fiber: 2,
      sodium: 420
    }
  }
];
