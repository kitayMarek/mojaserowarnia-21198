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
  featured?: boolean;
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
  // Strony o paszach i asystenci AI (24.10.2026): z nowej strony głównej szuka się ich wprost.
  {
    id: "kury-nie-niosa",
    title: "Kury nie niosą jajek? Najczęstsze przyczyny",
    description: "Jesień i pierzenie, za mało białka i wapnia, sama pszenica, resztki z kuchni. Prosto, z liczbami i źródłami.",
    category: "poradniki",
    href: "/pasze/kury-nie-niosa",
    keywords: ["kury", "nie niosą", "nioski", "jajka", "jesień", "pierzenie", "wapń", "białko"],
  },
  {
    id: "resztki-z-kuchni",
    title: "Resztki z kuchni dla kur",
    description: "Chleb, makaron i obiad dla kur: co, ile i czego unikać, i co mówią przepisy.",
    category: "poradniki",
    href: "/pasze/resztki-z-kuchni",
    keywords: ["resztki", "kuchnia", "chleb", "makaron", "kury", "zlewki", "obierki"],
  },
  {
    id: "udzial-surowcow",
    title: "Ile jakiego surowca w paszy dla drobiu",
    description: "Górne granice zbóż, grochu, bobiku i rzepaku dla każdej grupy ptaków, ze źródłami.",
    category: "poradniki",
    href: "/pasze/udzial-surowcow",
    keywords: ["pasza", "groch", "bobik", "pszenica", "jęczmień", "rzepak", "udział", "limit", "drób"],
  },
  {
    id: "asystenci-ai",
    title: "Podłącz serwis do swojego czatu (ChatGPT, Claude, Perplexity)",
    description: "Gotowy tekst dla czatu: przeprowadzi przez podłączenie bazy kultur i kalkulatora pasz.",
    category: "narzedzia",
    href: "/asystenci-ai",
    keywords: ["chatgpt", "claude", "perplexity", "asystent", "ai", "czat", "łącznik", "mcp", "wtyczka"],
  },
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
    href: "/porownanie-wartosci-odzywczych",
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
    id: "kalkulator-pasz",
    title: "Kalkulator Pasz",
    description:
      "Zaawansowane narzędzie do bilansowania mieszanek paszowych dla drobiu - obliczenia składników, norm żywieniowych i kosztów produkcji paszy.",
    category: "narzedzia",
    href: "/kalkulator-pasz",
    keywords: [
      "kalkulator pasz",
      "pasza",
      "mieszanka paszowa",
      "bilansowanie",
      "drób",
      "kury",
      "brojlery",
      "kaczki",
      "gęsi",
      "indyki",
      "nioski",
      "kurczęta",
      "pisklęta",
      "zboża",
      "kukurydza",
      "pszenica",
      "jęczmień",
      "owies",
      "soja",
      "śruta sojowa",
      "białko",
      "tłuszcz",
      "energia",
      "EM",
      "energia metaboliczna",
      "normy żywieniowe",
      "wymagania pokarmowe",
      "składniki paszowe",
      "receptura",
      "feed calculator",
      "poultry",
      "chicken feed",
      "obliczenia paszowe",
      "koszt paszy",
      "wydajność",
      "hodowla",
      "żywienie",
      "pasze treściwe",
    ],
    featured: true,
  },
  {
    id: "kalkulator-miar",
    title: "Kalkulator Miar",
    description:
      "Dwukierunkowy przelicznik jednostek miar: długość, masa, objętość, temperatura, prędkość, ciśnienie i powierzchnia.",
    category: "narzedzia",
    href: "/kalkulator-miar",
    keywords: [
      "kalkulator",
      "miary",
      "przelicznik",
      "konwerter",
      "jednostki",
      "przeliczenia",
      "konwersja",
      "metryczny",
      "imperial",
      "temperatura",
      "objętość",
      "masa",
      "długość",
      "ciśnienie",
      "powierzchnia",
      "prędkość",
      "kg",
      "litry",
      "metry",
      "stopnie",
      "celsius",
      "fahrenheit",
    ],
  },
  {
    id: "kalkulator-beaugel",
    title: "Kalkulator Podpuszczki",
    description:
      "Precyzyjne obliczenia dawki dla podpuszczek Beaugel (5/50/500) oraz uniwersalny kalkulator IMCU dla wszystkich rodzajów podpuszczek.",
    category: "narzedzia",
    href: "/kalkulator-beaugel",
    keywords: [
      "kalkulator",
      "podpuszczka",
      "Beaugel",
      "IMCU",
      "dawkowanie",
      "rennet",
      "Coquard",
      "flokulacja",
      "krzepnięcie",
      "enzym",
      "siła podpuszczki",
      "obliczenia",
      "ilość",
      "mleko",
      "ser",
      "koagulacja",
    ],
  },
  {
    id: "kalkulator-kosztu-sera",
    title: "Kalkulator Kosztu Sera",
    description:
      "Kompleksowy kalkulator obliczający koszty produkcji sera: wydajność z mleka, składniki, koszty stałe, marża i cena sprzedaży.",
    category: "narzedzia",
    href: "/kalkulator-kosztu-sera",
    keywords: [
      "kalkulator",
      "koszt",
      "ser",
      "produkcja",
      "cena",
      "marża",
      "kalkulacja",
      "rentowność",
      "wydajność",
      "zysk",
      "opłacalność",
      "biznes plan",
      "finanse",
      "mleko",
      "składniki",
      "koszty stałe",
      "amortyzacja",
    ],
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

// Małe litery bez polskich znaków: na telefonie ludzie często piszą „twarog”, „kultury do sera zoltego”.
// „ł” nie rozkłada się w NFD, stąd osobna zamiana.
function bezOgonkow(tekst: string): string {
  return tekst.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l");
}

// Odległość edycyjna z limitem: przerywa, gdy w całym wierszu przekroczy `limit`.
function odlegloscEdycji(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let poprzedni = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const biezacy = [i];
    let minimum = i;
    for (let j = 1; j <= b.length; j++) {
      const koszt = a[i - 1] === b[j - 1] ? 0 : 1;
      biezacy[j] = Math.min(poprzedni[j] + 1, biezacy[j - 1] + 1, poprzedni[j - 1] + koszt);
      minimum = Math.min(minimum, biezacy[j]);
    }
    if (minimum > limit) return limit + 1;
    poprzedni = biezacy;
  }
  return poprzedni[b.length];
}

// Search function with fuzzy matching
export function searchItems(query: string, limit = 50): SearchItem[] {
  if (!query.trim()) return [];

  const lowerQuery = bezOgonkow(query.trim());
  const words = lowerQuery.split(/\s+/);

  const results = searchIndex
    .map((item) => {
      let score = 0;
      const title = bezOgonkow(item.title);
      const searchText = bezOgonkow(
        [item.title, item.description, item.category, ...item.keywords, item.shop || "", item.type || ""].join(" ")
      );

      // Exact title match - highest priority
      if (title === lowerQuery) {
        score += 1000;
      }

      // Title starts with query
      if (title.startsWith(lowerQuery)) {
        score += 500;
      }

      // Title contains query
      if (title.includes(lowerQuery)) {
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
        if (item.shop && bezOgonkow(item.shop).includes(word)) {
          score += 30;
        }
        if (item.type && bezOgonkow(item.type).includes(word)) {
          score += 30;
        }
        // Category match bonus
        if (item.category.toLowerCase().includes(word)) {
          score += 50;
        }
      });

      // Literówki („mozarela”): każde słowo od 4 liter musi być blisko jakiegoś słowa z tytułu
      // albo słów kluczowych. Tylko tytuł i słowa kluczowe, bez opisów: dawne dopasowanie
      // „litery po kolei w całym tekście” trafiało w długie opisy kultur przy każdej frazie.
      if (score === 0) {
        const slowaPozycji = bezOgonkow([item.title, ...item.keywords].join(" ")).split(/[^a-z0-9]+/);
        const dlugie = words.filter((word) => word.length >= 4);
        const blisko = (word: string) =>
          slowaPozycji.some((slowo) => odlegloscEdycji(word, slowo, word.length >= 7 ? 2 : 1) <= (word.length >= 7 ? 2 : 1));
        if (dlugie.length > 0 && dlugie.every(blisko)) {
          score += 40;
        }
      }

      // Premie tylko dla pozycji, które pasują do frazy. Wcześniej wyróżnione pozycje
      // i narzędzia dostawały punkty przy każdej frazie, więc nigdy nie było „brak wyników”.
      if (score > 0) {
        if (item.featured) {
          score += 300;
        }
        if (item.category === "narzedzia") {
          score += 150;
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
