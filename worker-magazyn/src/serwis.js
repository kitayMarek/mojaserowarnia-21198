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
 * Narzędzia paszowe zostają też w serwerze Serowarni do 28.02.2027 (okres przejściowy
 * z planu przenosin), żeby nikt, kto dodał łącznik Serowarni z posta o paszach,
 * nie stracił ich z dnia na dzień.
 */
/* global __SERWIS__ */
export const NA_PASZY = typeof __SERWIS__ !== 'undefined' && __SERWIS__ === 'mojapasza';

const SEROWARNIA = {
  // Nazwa w polu zrodlo odpowiedzi narzędzi.
  nazwa: 'Moja Serowarnia',
  // Nazwa w magazyn_wywolania.serwer (migracja 20261025210000_serwis_w_pomiarze.sql).
  serwer: 'mojaserowarnia',
  adresMcp: 'https://dane.mojaserowarnia.pl/mcp',
  instrukcja: 'https://mojaserowarnia.pl/asystenci-ai',
  kalkulator: 'https://mojaserowarnia.pl/kalkulator-pasz',
  udzialySurowcow: 'https://mojaserowarnia.pl/pasze/udzial-surowcow',
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
