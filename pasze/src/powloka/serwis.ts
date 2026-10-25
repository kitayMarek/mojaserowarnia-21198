import type { UstawieniaLacznika, UstawieniaSerwisu } from "../../../src/lib/serwis";

/**
 * Ustawienia mojapasza.com. Zastępuje src/lib/serwis.ts przez alias w
 * pasze/vite.config.ts; eksportuje to samo co tamten plik.
 */

export const SERWIS: UstawieniaSerwisu = {
  nazwa: "Moja Pasza",
  adres: "https://mojapasza.com",
  obrazek: "https://mojapasza.com/og/pasze.png",
  instrukcjaCzatow: "/asystenci-ai",
};

export const LACZNIK: UstawieniaLacznika = {
  adres: "https://mojapasza.com/mcp",
  nazwa: "Moja Pasza",
  // Własnej umiejętności Perplexity jeszcze nie ma (etap 3 planu): do tego czasu
  // umiejętność Serowarni, która ma te same narzędzia paszowe.
  umiejetnoscPerplexity: {
    nazwa: "moja-serowarnia",
    adres: "https://www.perplexity.ai/computer/skills/7v8vkYCPTiSxnjTByyQ0GA",
  },
};

export const STRONY_PASZ = {
  kalkulator: "/",
  bydlo: "/bydlo",
  poradnik: "/poradnik",
  udzialSurowcow: "/poradnik/udzial-surowcow",
  kuryNieNiosa: "/poradnik/kury-nie-niosa",
  resztkiZKuchni: "/poradnik/resztki-z-kuchni",
} as const;

export type StronaPasz = keyof typeof STRONY_PASZ;

export const WYDAWCA = { "@type": "Organization", name: SERWIS.nazwa, url: `${SERWIS.adres}/` } as const;
