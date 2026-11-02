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

/**
 * Od 2.11.2026 ludzie podłączają jeden łącznik: Dane Rolne (sery, pasze, katalog), decyzja Marka.
 * Hub woła serwer Serowarni z ?z=hub, a znacznik ze strony liczy u siebie (tabela wywolania w bazie huba).
 */
export const LACZNIK: UstawieniaLacznika = {
  adres: "https://danerolne.com/mcp",
  nazwa: "Dane Rolne",
  // Treść umiejętności: ProjektyLLm/wtyczki/perplexity-dane-rolne/SKILL.md (poza repo). Łączy się z danerolne.com/mcp?z=perplexity.
  umiejetnoscPerplexity: {
    nazwa: "dane-rolne",
    adres: "https://www.perplexity.ai/computer/skills/rmzaCg5pTzassdkfDZr5fQ",
  },
};

/** Serwer MCP Serowarni: zostaje dla huba, aplikacji i starszych podłączeń, jego dotyczą warunki z /warunki-mcp. */
export const SERWER_SEROWARNI = "https://dane.mojaserowarnia.pl/mcp";

/** Wydawca w danych strukturalnych (schema.org Organization). */
export const WYDAWCA = { "@type": "Organization", name: SERWIS.nazwa, url: `${SERWIS.adres}/` } as const;
