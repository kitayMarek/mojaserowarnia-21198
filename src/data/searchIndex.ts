import { culturesData } from "./culturesDataComplete";
import { recipesData } from "./recipesData";

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: "kultury" | "przepisy" | "poradniki" | "prawo" | "narzedzia" | "kontakt";
  href: string;
  keywords: string[];
  shop?: string;
  type?: string;
  price?: string;
}

// Helper function to create culture search items
const createCultureSearchItems = (): SearchItem[] => {
  return culturesData.map((culture) => ({
    id: `culture-${culture.name.toLowerCase().replace(/\s+/g, "-")}`,
    title: culture.name,
    description: `${culture.application} | ${culture.type} | ${culture.shop}`,
    category: "kultury" as const,
    href: `/baza-kultur?q=${encodeURIComponent(culture.name)}`,
    keywords: [
      culture.name,
      culture.type,
      culture.shop,
      culture.application,
      culture.temperature,
      culture.composition,
      "kultury",
      "kultury bakteryjne",
      "kultura",
      "bakterie",
    ],
    shop: culture.shop,
    type: culture.type,
    price: culture.price,
  }));
};

// Helper function to create recipe search items
const createRecipeSearchItems = (): SearchItem[] => {
  return recipesData.map((recipe) => ({
    id: `recipe-${recipe.id}`,
    title: recipe.name,
    description: recipe.description.substring(0, 150) + "...",
    category: "przepisy" as const,
    href: `/przepisy/${recipe.id}`,
    keywords: [
      recipe.name,
      recipe.difficulty,
      recipe.description,
      recipe.milkBase,
      recipe.starter,
      ...recipe.cultureSubstitutes.map((c) => c.name),
      "przepis",
      "przepisy",
      "ser",
    ],
  }));
};

// Poradniki
const poradnikiItems: SearchItem[] = [
  {
    id: "poradnik-serowarzy",
    title: "Poradnik dla serowarów",
    description:
      "Kompleksowy przewodnik po całym procesie produkcji sera - od przygotowania mleka, przez wybór kultur, proces technologiczny, po dojrzewanie i pielęgnację.",
    category: "poradniki",
    href: "/poradnik",
    keywords: ["poradnik", "ser", "produkcja", "przewodnik", "krok po kroku", "kultury", "bakterie", "technologia"],
  },
  {
    id: "sila-podpuszczki",
    title: "Siła podpuszczki i metoda flokulacji",
    description:
      "Szczegółowe wyjaśnienie jednostek IMCU, obliczanie odpowiedniej ilości podpuszczki oraz zaawansowana metoda flokulacji.",
    category: "poradniki",
    href: "/sila-podpuszczki",
    keywords: ["podpuszczka", "IMCU", "flokulacja", "dawkowanie", "obliczenia", "metoda", "test", "podpuszczanie"],
  },
  {
    id: "gdzie-kupic-podpuszczke",
    title: "Gdzie kupić podpuszczkę",
    description:
      "Kompleksowe zestawienie i porównanie dostępnych na rynku podpuszczek: analiza mocy (IMCU, 1:X), praktyczne dawkowanie.",
    category: "poradniki",
    href: "/gdzie-kupic-podpuszczke",
    keywords: ["podpuszczka", "sklep", "zakup", "porównanie", "IMCU"],
  },
  {
    id: "porownawie-wartosci-odzywczych",
    title: "Porównanie wartości odżywczych serów",
    description:
      "Interaktywny kalkulator pozwalający porównać wartości odżywcze różnych rodzajów serów: kalorie, białko, tłuszcz, wapń.",
    category: "poradniki",
    href: "/porownawie-wartosci-odzywczych",
    keywords: ["wartości odżywcze", "kalorie", "białko", "kalkulator", "porównanie"],
  },
];

// Prawo
const prawoItems: SearchItem[] = [
  {
    id: "akty-prawne-ue",
    title: "Najważniejsze akty prawne UE dotyczące produkcji serów farmerskich",
    description:
      "Kompletny przegląd dokumentów prawnych Unii Europejskiej regulujących produkcję serów, ze szczególnym uwzględnieniem produkcji farmerskiej i rzemieślniczej",
    category: "prawo",
    href: "/prawo/akty-prawne-ue",
    keywords: ["prawo", "UE", "akty prawne", "regulacje", "farmerski", "rzemieślniczy"],
  },
  {
    id: "rhd",
    title: "Rolniczy Handel Detaliczny (RHD)",
    description:
      "Kompletny przewodnik po formie działalności RHD - produkcja i sprzedaż serów oraz innych produktów rolnych bezpośrednio konsumentom",
    category: "prawo",
    href: "/prawo/rhd",
    keywords: ["RHD", "rolniczy handel detaliczny", "sprzedaż", "produkcja", "przepisy"],
  },
  {
    id: "mol",
    title: "Działalność marginalna, lokalna i ograniczona (MOL)",
    description:
      "Szczegółowe informacje o działalności MOL - uproszczona forma produkcji i sprzedaży produktów pochodzenia zwierzęcego dla małych producentów",
    category: "prawo",
    href: "/prawo/mol",
    keywords: ["MOL", "marginalna", "lokalna", "ograniczona", "działalność", "przepisy"],
  },
  {
    id: "rzeznia-rolnicza",
    title: "Rzeźnia Rolnicza",
    description:
      "Przewodnik po uruchomieniu małej ubojni drobiu przy gospodarstwie - limity, wymagania, wyposażenie i pełna procedura krok po kroku",
    category: "prawo",
    href: "/prawo/rzeznia-rolnicza",
    keywords: ["rzeźnia", "rolnicza", "ubojnia", "drób", "wymagania"],
  },
];

// Narzędzia
const narzedziaItems: SearchItem[] = [
  {
    id: "kalkulator-miar",
    title: "Kalkulator Miar",
    description:
      "Dwukierunkowy przelicznik jednostek miar: długość, masa, objętość, temperatura, prędkość, ciśnienie i powierzchnia.",
    category: "narzedzia",
    href: "/kalkulator-miar.html",
    keywords: ["kalkulator", "miary", "przelicznik", "konwerter", "jednostki"],
  },
  {
    id: "kalkulator-beaugel",
    title: "Kalkulator Podpuszczki",
    description:
      "Precyzyjne obliczenia dawki dla podpuszczek Beaugel (5/50/500) oraz uniwersalny kalkulator IMCU dla wszystkich rodzajów podpuszczek.",
    category: "narzedzia",
    href: "/kalkulator-beaugel",
    keywords: ["kalkulator", "podpuszczka", "Beaugel", "IMCU", "dawkowanie"],
  },
  {
    id: "kalkulator-kosztu-sera",
    title: "Kalkulator Kosztu Sera",
    description:
      "Kompleksowy kalkulator obliczający koszty produkcji sera: wydajność z mleka, składniki, koszty stałe, marża i cena sprzedaży.",
    category: "narzedzia",
    href: "/kalkulator-kosztu-sera",
    keywords: ["kalkulator", "koszt", "ser", "produkcja", "cena", "marża"],
  },
];

// Kontakt
const kontaktItems: SearchItem[] = [
  {
    id: "kontakt",
    title: "Kontakt",
    description: "Skontaktuj się z nami - masz pytania, sugestie lub chcesz podzielić się swoją historią serowarską.",
    category: "kontakt",
    href: "/kontakt",
    keywords: ["kontakt", "email", "pomoc", "pytania", "wsparcie"],
  },
];

// Combine all search items
export const searchIndex: SearchItem[] = [
  ...createCultureSearchItems(),
  ...createRecipeSearchItems(),
  ...poradnikiItems,
  ...prawoItems,
  ...narzedziaItems,
  ...kontaktItems,
];

// Search function with fuzzy matching
export function searchItems(query: string, limit = 50): SearchItem[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase().trim();
  const words = lowerQuery.split(/\s+/);

  const results = searchIndex
    .map((item) => {
      let score = 0;
      const searchText = [
        item.title,
        item.description,
        item.category,
        ...item.keywords,
        item.shop || "",
        item.type || "",
      ]
        .join(" ")
        .toLowerCase();

      // Exact title match - highest priority
      if (item.title.toLowerCase() === lowerQuery) {
        score += 1000;
      }

      // Title starts with query
      if (item.title.toLowerCase().startsWith(lowerQuery)) {
        score += 500;
      }

      // Title contains query
      if (item.title.toLowerCase().includes(lowerQuery)) {
        score += 200;
      }

      // All words present
      const allWordsPresent = words.every((word) => searchText.includes(word));
      if (allWordsPresent) {
        score += 100;
      }

      // Individual word matches
      words.forEach((word) => {
        if (searchText.includes(word)) {
          score += 10;
        }
        // Shop/type match bonus
        if (item.shop?.toLowerCase().includes(word)) {
          score += 30;
        }
        if (item.type?.toLowerCase().includes(word)) {
          score += 30;
        }
        // Category match bonus
        if (item.category.toLowerCase().includes(word)) {
          score += 50;
        }
      });

      // Fuzzy match for typos
      if (score === 0) {
        const fuzzyScore = fuzzyMatch(searchText, lowerQuery);
        if (fuzzyScore > 0.5) {
          score += Math.floor(fuzzyScore * 50);
        }
      }

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);

  return results;
}

// Simple fuzzy matching algorithm
function fuzzyMatch(text: string, query: string): number {
  let queryIndex = 0;
  let matchCount = 0;

  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      matchCount++;
      queryIndex++;
    }
  }

  return matchCount / query.length;
}

// Get items by category for display
export function getItemsByCategory(items: SearchItem[]): Record<string, SearchItem[]> {
  const categorized: Record<string, SearchItem[]> = {
    kultury: [],
    przepisy: [],
    poradniki: [],
    prawo: [],
    narzedzia: [],
    kontakt: [],
  };

  items.forEach((item) => {
    categorized[item.category].push(item);
  });

  return categorized;
}
