/**
 * Serwis, w którym działa kod: nazwa, adres, łącznik MCP i adresy stron pasz.
 *
 * Strony pasz są wspólne dla Mojej Serowarni i mojapasza.com (pasze/). Tu stoją
 * wartości Serowarni; build mojapasza podmienia ten plik na pasze/src/powloka/serwis.ts
 * (alias w pasze/vite.config.ts), tak jak nagłówek i stopkę. Oba pliki eksportują
 * to samo, typy pilnują zgodności.
 */

export interface UstawieniaSerwisu {
  nazwa: string;
  /** Bez ukośnika na końcu. */
  adres: string;
  /** Obrazek do podglądów linków i danych strukturalnych, pełny adres. */
  obrazek: string;
  /** Strona z instrukcją podłączenia czatów, ścieżka w tym serwisie. */
  instrukcjaCzatow: string;
}

export interface UstawieniaLacznika {
  adres: string;
  /** Nazwa, którą użytkownik wpisuje w ChatGPT i Claude. */
  nazwa: string;
  umiejetnoscPerplexity: { nazwa: string; adres: string };
}

export const SERWIS: UstawieniaSerwisu = {
  nazwa: "Moja Serowarnia",
  adres: "https://mojaserowarnia.pl",
  obrazek: "https://mojaserowarnia.pl/og-image.jpg",
  instrukcjaCzatow: "/asystenci-ai",
};

export const LACZNIK: UstawieniaLacznika = {
  adres: "https://dane.mojaserowarnia.pl/mcp",
  nazwa: "Moja Serowarnia",
  // Treść umiejętności: ProjektyLLm/wtyczki/perplexity/SKILL.md (poza repo).
  umiejetnoscPerplexity: {
    nazwa: "moja-serowarnia",
    adres: "https://www.perplexity.ai/computer/skills/7v8vkYCPTiSxnjTByyQ0GA",
  },
};

/**
 * Ścieżki stron pasz w tym serwisie. W Serowarni od 28.10.2026 nieużywane (strony pasz są
 * tylko na mojapasza.com, stare adresy przekierowuje worker/index.js); zostają dla typów.
 */
export const STRONY_PASZ = {
  kalkulator: "/kalkulator-pasz",
  bydlo: "/kalkulator-pasz-bydlo",
  poradnik: "/pasze",
  udzialSurowcow: "/pasze/udzial-surowcow",
  kuryNieNiosa: "/pasze/kury-nie-niosa",
  resztkiZKuchni: "/pasze/resztki-z-kuchni",
} as const;

export type StronaPasz = keyof typeof STRONY_PASZ;

/** Wydawca w danych strukturalnych (schema.org Organization). */
export const WYDAWCA = { "@type": "Organization", name: SERWIS.nazwa, url: `${SERWIS.adres}/` } as const;
