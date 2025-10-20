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
  steps: RecipeStep[];
}

export interface RecipeStep {
  title: string;
  content: string;
  tips?: string[];
  warnings?: string[];
}

export const recipesData: Recipe[] = [
  {
    id: "asiago",
    name: "Asiago",
    description: "Asiago to tradycyjny ser alpejski z regionu Veneto we Włoszech. Młody Asiago dolce (świeży) ma delikatny, słodkawy smak z aromatem przypominającym jogurt i masło. Tekstura jest miękka i elastyczna, a jasna barwa odzwierciedla krótki okres dojrzewania.",
    difficulty: "Średni",
    yield: "≈ 2,7 kg z 22,7 L mleka",
    ageTime: "2 miesiące (30-40 dni)",
    category: "Klasyczny ser alpejski z Włoch",
    image: "https://mojaserowarnia.pl/images/asiago.jpg",
    milkType: "Mleko krowie pełne (nie UHT)",
    cultures: ["kultura termofilna (TA-61 lub C201)", "kultura Helveticus (LH-100)"],
    steps: [
      {
        title: "Przygotowanie mleka",
        content: "Podgrzej ≈ 22,7 L mleka pełnego do 32°C. Jeśli mleko jest pasteryzowane, dodaj CaCl₂ według zaleceń producenta.",
        tips: ["Opcjonalnie dodaj śmietankę dla bogatszego smaku"]
      },
      {
        title: "Dodanie kultur",
        content: "Posyp kulturę termofilną (TA-61 lub C201) i kulturę Helveticus (LH-100) na powierzchnię mleka. Odczekaj 2 minuty, następnie delikatnie wymieszaj.",
        tips: ["Dawkowanie: ~0,125 tsp (~0,6 g) na 22,7 L mleka"]
      },
      {
        title: "Koagulacja",
        content: "Po 30-45 minutach dodaj płynną podpuszczkę (ok. 5 ml na 22,7 L mleka). Wymieszaj dokładnie przez 1 minutę. Pozostaw na 30-45 minut do powstania zwartego skrzepu.",
      },
      {
        title: "Krojenie skrzepu",
        content: "Pokrój skrzep na kostki około 1 cm. Delikatnie mieszaj przez 10 minut.",
      },
      {
        title: "Gotowanie",
        content: "Powoli podgrzewaj skrzep do 42°C przez 30-40 minut, cały czas delikatnie mieszając.",
      },
      {
        title: "Formowanie",
        content: "Przelej skrzep do formy wyłożonej tkaniną serowniczą. Przyciskaj i formuj.",
      },
      {
        title: "Prasowanie",
        content: "Prasuj przez 6-12 godzin, zwiększając stopniowo ciężar. Przewracaj co 2 godziny.",
      },
      {
        title: "Solenie",
        content: "Umieść ser w nasyconym roztworze soli (solanka) na 3 godziny na każdy kilogram sera.",
      },
      {
        title: "Dojrzewanie",
        content: "Dojrzewaj w 13-14°C przy wilgotności 85-87% przez 30-40 dni. Powierzchniowe pleśnie ścieraj solanką.",
        tips: ["Przewracaj ser co kilka dni", "Utrzymuj stałą temperaturę i wilgotność"]
      }
    ]
  },
  {
    id: "caciotta",
    name: "Caciotta",
    description: "Caciotta to włoski ser półmiękki o łagodnym, kremowym smaku. Ma delikatną teksturę i jest idealny do codziennego spożycia. Tradycyjnie wytwarzany w różnych regionach Włoch.",
    difficulty: "Łatwy",
    yield: "≈ 2 kg z 20 L mleka",
    ageTime: "2-4 tygodnie",
    category: "Włoski ser półmiękki",
    image: "https://mojaserowarnia.pl/images/caciotta.jpg",
    milkType: "Mleko krowie lub owcze",
    cultures: ["kultura mezofilna (MM100)", "kultura termofilna (opcjonalnie)"],
    steps: [
      {
        title: "Przygotowanie",
        content: "Podgrzej mleko do 36°C. Dodaj kultury i pozostaw na 30 minut.",
      },
      {
        title: "Koagulacja",
        content: "Dodaj podpuszczkę i pozostaw na 30-40 minut do utworzenia skrzepu.",
      },
      {
        title: "Krojenie i formowanie",
        content: "Pokrój skrzep na kostki 2 cm. Przelej do formy i prasuj lekko.",
      },
      {
        title: "Solenie",
        content: "Sol w solance przez 4-6 godzin lub posyp solą suchą.",
      },
      {
        title: "Dojrzewanie",
        content: "Dojrzewaj w 10-12°C przy wilgotności 80-85% przez 2-4 tygodnie.",
      }
    ]
  },
  {
    id: "dunlop",
    name: "Dunlop",
    description: "Dunlop to szkocki ser twardy, zaliczany do serów dojrzewających i podpuszczkowych. Charakteryzuje się łagodnym, lekko słodkawym smakiem i zwartą teksturą. Nazwa pochodzi od miejscowości Dunlop w Szkocji.",
    difficulty: "Średni",
    yield: "≈ 2,5 kg z 22 L mleka",
    ageTime: "3-6 miesięcy",
    category: "Szkocki ser twardy",
    image: "https://mojaserowarnia.pl/images/dunlop.jpg",
    milkType: "Mleko krowie niepasteryzowane lub pasteryzowane",
    cultures: ["kultura mezofilna (MA4001)", "kultura termofilna (opcjonalnie)"],
    steps: [
      {
        title: "Przygotowanie mleka",
        content: "Podgrzej mleko do 31°C. Dodaj kultury mezofilne i pozostaw na 45 minut.",
      },
      {
        title: "Koagulacja",
        content: "Dodaj podpuszczkę i pozostaw na 45-60 minut do powstania zwartego skrzepu.",
      },
      {
        title: "Krojenie",
        content: "Pokrój skrzep na małe kostki około 1 cm. Mieszaj delikatnie przez 15 minut.",
      },
      {
        title: "Gotowanie",
        content: "Powoli podgrzewaj do 38°C przez 30 minut, cały czas mieszając.",
      },
      {
        title: "Formowanie i prasowanie",
        content: "Przelej do formy i prasuj przez 12-24 godziny z rosnącym ciężarem.",
      },
      {
        title: "Solenie",
        content: "Sol w solance przez 8-12 godzin lub przez 3-4 dni suchą solą.",
      },
      {
        title: "Dojrzewanie",
        content: "Dojrzewaj w 10-13°C przy wilgotności 85% przez 3-6 miesięcy.",
        tips: ["Przewracaj co tydzień", "Ścieraj pleśnie solanką"]
      }
    ]
  },
  {
    id: "feta-bulgarska",
    name: "Feta Bułgarska (Sirene)",
    description: "Bułgarska Feta (Sirene) to tradycyjny biały ser solankowy o gładkiej, kremowej i elastycznej teksturze. W przeciwieństwie do greckiej Fety, która się kruszy, bułgarska wersja zachowuje więcej wilgoci dzięki łagodniejszemu odsączaniu i niższej kwasowości.",
    difficulty: "Średni",
    yield: "≈ 1,8 kg z 18 L mleka",
    ageTime: "2-4 tygodnie w solance",
    category: "Tradycyjny ser solankowy",
    image: "https://mojaserowarnia.pl/images/feta_bulgarische.jpg",
    milkType: "Mleko owcze lub mieszanka owczego i koziego",
    cultures: ["kultura mezofilna (MM100)", "kultura jogurtowa (opcjonalnie)"],
    steps: [
      {
        title: "Przygotowanie",
        content: "Podgrzej mleko do 32°C. Dodaj kultury i pozostaw na 60 minut.",
      },
      {
        title: "Koagulacja",
        content: "Dodaj podpuszczkę i pozostaw na 45-60 minut do utworzenia gęstego skrzepu.",
      },
      {
        title: "Krojenie",
        content: "Delikatnie pokrój skrzep na większe kostki (około 2 cm). Mieszaj bardzo ostrożnie.",
      },
      {
        title: "Odsączanie",
        content: "Przelej do worków z tkaniny i pozostaw do odsączenia na 6-8 godzin.",
      },
      {
        title: "Krojenie na kostki",
        content: "Pokrój odsączony ser na kostki lub prostokąty o grubości około 4-5 cm.",
      },
      {
        title: "Solenie suche",
        content: "Posyp kostki solą i pozostaw na 24 godziny.",
      },
      {
        title: "Przechowywanie w solance",
        content: "Umieść ser w 8-10% solance i przechowuj w lodówce przez 2-4 tygodnie.",
        tips: ["Solanka musi całkowicie pokrywać ser", "Im dłużej w solance, tym intensywniejszy smak"]
      }
    ]
  },
  {
    id: "mozzarella",
    name: "Mozzarella",
    description: "Świeża mozzarella to jeden z najłatwiejszych serów do przygotowania w domu. Ten tradycyjny włoski ser o delikatnym smaku i charakterystycznej konsystencji idealnie nadaje się na pizzę, sałatki Caprese czy po prostu do jedzenia na świeżo z pomidorami i bazylią.",
    difficulty: "Łatwy",
    yield: "≈ 1 kg z 10 L mleka",
    ageTime: "Świeża (spożycie od razu)",
    category: "Włoski ser świeży",
    image: "https://mojaserowarnia.pl/images/mozzarella.jpg",
    milkType: "Mleko krowie pełne (niekoniecznie UHT)",
    cultures: ["kultura termofilna (opcjonalnie)", "kwas cytrynowy (metoda szybka)"],
    steps: [
      {
        title: "Przygotowanie mleka",
        content: "Podgrzej 10 L mleka do 32°C. Jeśli używasz metody z kwasem cytrynowym, rozpuść 1,5 łyżeczki kwasu w 60 ml wody.",
      },
      {
        title: "Zakwaszenie",
        content: "Dodaj roztwór kwasu cytrynowego do mleka i wymieszaj. Podgrzej do 38°C.",
      },
      {
        title: "Koagulacja",
        content: "Dodaj podpuszczkę (4 ml na 10 L) i wymieszaj przez 30 sekund. Pozostaw na 5-10 minut.",
      },
      {
        title: "Krojenie i podgrzewanie",
        content: "Pokrój skrzep na większe kawałki. Powoli podgrzewaj do 40°C, delikatnie mieszając.",
      },
      {
        title: "Formowanie",
        content: "Odsącz serwatkę. Podgrzej wodę do 75-80°C. Zanurz skrzep w gorącej wodzie i rozciągaj jak ciasto.",
        tips: ["Ser powinien stać się gładki i elastyczny", "Jeśli się nie rozciąga, podgrzej wodę bardziej"]
      },
      {
        title: "Kształtowanie",
        content: "Formuj w kulki, warkocze lub inne kształty. Zanurz w zimnej wodzie na 30 minut.",
      },
      {
        title: "Przechowywanie",
        content: "Przechowuj w lekko osolonej wodzie w lodówce. Spożyj w ciągu 5-7 dni.",
        tips: ["Świeża mozzarella smakuje najlepiej w dniu produkcji"]
      }
    ]
  },
  {
    id: "yorkshire",
    name: "Yorkshire (Wensleydale)",
    description: "Wensleydale to historyczny ser z północnej Anglii, kojarzony m.in. z Wallace'em i Gromitem. Wywodzi się ze średniowiecznych tradycji klasztornych Yorkshire Dales. Wersja domowa daje delikatny, lekko maślany smak z subtelną kwaśną nutą, teksturę kruchą do sprężystej i kremowy odczucie w ustach.",
    difficulty: "Średni",
    yield: "≈ 2,2 kg z 20 L mleka",
    ageTime: "3-8 tygodni",
    category: "Angielski ser półtwardy",
    image: "https://mojaserowarnia.pl/images/yorkshire.jpg",
    milkType: "Mleko krowie pełne",
    cultures: ["kultura mezofilna (MM100)", "kultura termofilna (opcjonalnie)"],
    steps: [
      {
        title: "Przygotowanie",
        content: "Podgrzej mleko do 30°C. Dodaj kultury mezofilne i pozostaw na 60 minut.",
      },
      {
        title: "Koagulacja",
        content: "Dodaj podpuszczkę i pozostaw na 45-60 minut do utworzenia skrzepu.",
      },
      {
        title: "Krojenie",
        content: "Pokrój skrzep na kostki 1-1,5 cm. Mieszaj delikatnie przez 10 minut.",
      },
      {
        title: "Gotowanie",
        content: "Powoli podgrzewaj do 38°C przez 30-40 minut, mieszając.",
      },
      {
        title: "Odsączanie",
        content: "Pozostaw skrzep do odsączenia na 10 minut. Pokrój odsączoną masę na plastry.",
      },
      {
        title: "Solenie i formowanie",
        content: "Posyp plastry solą i ułóż w formie. Prasuj lekko.",
      },
      {
        title: "Prasowanie",
        content: "Prasuj przez 12-24 godziny, przewracając co kilka godzin.",
      },
      {
        title: "Dojrzewanie",
        content: "Dojrzewaj w 10-12°C przy wilgotności 85% przez 3-8 tygodni.",
        tips: ["Młody Wensleydale (3 tygodnie) jest łagodny i kremowy", "Dłuższe dojrzewanie daje bardziej złożony smak"]
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
