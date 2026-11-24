// Dopasowanie frazy do indeksu wyszukiwania: jedna funkcja dla okna Ctrl+K (src/data/searchIndex.ts)
// i dla strony wyników /szukaj składanej w Workerze (worker/szukaj.js, od 24.11.2026).
// Bez importów: Worker bierze ten plik wprost, a indeks z worker/indeks-szukaj.json
// (scripts/gen-indeks-szukaj.mjs), bo dane przepisów importują zdjęcia.

export interface PozycjaSzukania {
  title: string;
  description: string;
  category: string;
  keywords: string[];
  shop?: string;
  type?: string;
  featured?: boolean;
}

// Małe litery bez polskich znaków: na telefonie ludzie często piszą „twarog”, „kultury do sera zoltego”.
// „ł” nie rozkłada się w NFD, stąd osobna zamiana.
function bezOgonkow(tekst: string): string {
  return tekst.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");
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

// Słowa pomijane w pytaniu, gdy są w nim inne: ta sama lista co POMIJANE w hubie
// (C:\Moje\Hub\src\dobor-modulu.js) i w Mojej Paszy (pasze/worker/szukaj.js).
const POMIJANE = new Set([
  "ale", "albo", "aby", "bez", "byc", "czy", "czym", "czego", "dla", "gdy", "gdzie", "ich", "ile", "jak", "jaka", "jaki",
  "jakie", "jakiej", "jakich", "jakim", "jakis", "jakies", "jej", "jest", "jesli", "juz", "kto", "kiedy", "ktory", "ktora",
  "ktore", "lub", "mam", "mamy", "mnie", "moge", "mozna", "moj", "moja", "moje", "mojej", "nie", "oraz", "pod", "przy",
  "sie", "tak", "ten", "tego", "tej", "tez", "takze", "tylko", "zeby", "inny", "inna", "inne", "innych", "prosze", "chce",
  "chcialbym", "szukam", "potrzebuje", "pokaz", "trzeba", "warto", "bardzo", "sobie", "tam", "tutaj", "ktos", "cos",
]);

// Search function with fuzzy matching
export function szukajWIndeksie<T extends PozycjaSzukania>(indeks: T[], query: string, limit = 50): T[] {
  if (!query.trim()) return [];

  const lowerQuery = bezOgonkow(query.trim());
  // Od 24.11.2026 krótkie słowa („do”, „na”, „od”) i słowa pomijane liczą się tylko wtedy, gdy w pytaniu
  // nie ma innych. Wcześniej „do” pasowało do każdego tekstu z „podpuszczką” albo „dodatkiem”, więc
  // „ser na pizzę” i „pasza dla kur” zaczynały się od „Podłącz serwis do swojego czatu”, a strona
  // /szukaj podawała hubowi 87 własnych wyników przy „jajka od rolnika”.
  const wszystkie = lowerQuery.split(/[^a-z0-9]+/).filter(Boolean);
  const tresciowe = wszystkie.filter((slowo) => slowo.length >= 3 && !POMIJANE.has(slowo));
  const words = tresciowe.length ? tresciowe : wszystkie.length ? wszystkie : [lowerQuery];

  const results = indeks
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
