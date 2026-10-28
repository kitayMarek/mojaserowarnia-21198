/**
 * Serwis, w którym działa kod: nazwa, adres i łącznik MCP Mojej Serowarni.
 * Moja Pasza ma od 28.10.2026 własne repozytorium (C:\Moje\MojaPasza) z własną wersją tego pliku.
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

/** Wydawca w danych strukturalnych (schema.org Organization). */
export const WYDAWCA = { "@type": "Organization", name: SERWIS.nazwa, url: `${SERWIS.adres}/` } as const;
