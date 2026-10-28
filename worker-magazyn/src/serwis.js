/**
 * Który serwer MCP budujemy z tego kodu (od 26.10.2026):
 *
 *  - dane.mojaserowarnia.pl/mcp (wrangler.jsonc): kultury, przepisy i pasze,
 *  - mojapasza.com/mcp (wrangler-pasze.jsonc, Worker „mojapasza-mcp”, podpięty
 *    pod Worker mojapasza.com przez wiązanie usług): tylko pasze i dodatki paszowe.
 *
 * Wybór przy budowaniu: wrangler-pasze.jsonc ma "define": { "__SERWIS__": "\"mojapasza\"" },
 * esbuild wstawia tę wartość w miejsce nazwy. Bez define (Serowarnia) typeof daje
 * "undefined". Jeden kod, dwa serwery, bez sprawdzania adresu w każdym zapytaniu.
 *
 * Od 0.9.1 (28.10.2026) serwer Serowarni nie wystawia narzędzi paszowych: Marek zrezygnował
 * z okresu przejściowego do 28.02.2027. Konfiguracja SEROWARNIA niżej zostaje, dopóki kod pasz
 * nie przeniesie się do repozytorium mojapasza.
 */
/* global __SERWIS__ */
export const NA_PASZY = typeof __SERWIS__ !== 'undefined' && __SERWIS__ === 'mojapasza';

// Od 28.10.2026 pasze należą do mojapasza.com także w serwerze Serowarni (okres przejściowy
// do 28.02.2027): źródło i linki w wynikach narzędzi paszowych wskazują mojapasza.com.
const SEROWARNIA = {
  // Nazwa w polu zrodlo odpowiedzi narzędzi paszowych.
  nazwa: 'Moja Pasza',
  // Nazwa w magazyn_wywolania.serwer (migracja 20261025210000_serwis_w_pomiarze.sql).
  serwer: 'mojaserowarnia',
  adresMcp: 'https://dane.mojaserowarnia.pl/mcp',
  instrukcja: 'https://mojaserowarnia.pl/asystenci-ai',
  kalkulator: 'https://mojapasza.com/',
  udzialySurowcow: 'https://mojapasza.com/poradnik/udzial-surowcow',
  prywatnosc: 'https://mojaserowarnia.pl/nota-prawna#serwer-mcp',
  warunki: 'https://mojaserowarnia.pl/warunki-mcp',
};

const MOJAPASZA = {
  nazwa: 'Moja Pasza',
  serwer: 'mojapasza',
  adresMcp: 'https://mojapasza.com/mcp',
  instrukcja: 'https://mojapasza.com/asystenci-ai',
  kalkulator: 'https://mojapasza.com/',
  udzialySurowcow: 'https://mojapasza.com/poradnik/udzial-surowcow',
  prywatnosc: 'https://mojapasza.com/prywatnosc#serwer-mcp',
  warunki: 'https://mojapasza.com/warunki',
};

export const SERWIS = NA_PASZY ? MOJAPASZA : SEROWARNIA;
