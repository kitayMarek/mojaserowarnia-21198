import involtiniGoudaImage from "@/assets/involtini-gouda.jpg";

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
}

export const culinaryRecipesData: CulinaryRecipe[] = [
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
    tags: ["cielęcina", "gouda", "romantyczna kolacja", "eleganckie", "roladki", "ser", "duszone"]
  }
];
