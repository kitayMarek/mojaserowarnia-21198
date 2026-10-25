/**
 * Strona dla człowieka pod mojapasza.com/mcp (serwis.js, od 26.10.2026): to samo,
 * co stronaOpisu() w index.js dla Serowarni, ale o paszach i z adresami mojapasza.
 * Klienci MCP jej nie widzą (proszą o JSON albo strumień zdarzeń).
 */
import { WERSJA, listaNarzedzi } from './serwer.js';
import { SERWIS } from './serwis.js';

export function stronaOpisuPasz() {
  const adres = SERWIS.adresMcp;
  const dodajDoClaude = 'https://claude.ai/customize/connectors?modal=add-custom-connector'
    + '&amp;connectorName=Moja%20Pasza&amp;connectorUrl='
    + encodeURIComponent(`${adres}?z=strona-mcp`);
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Łącznik MCP Moja Pasza</title>
<style>
  :root { --tlo: #fbf8f3; --tekst: #2b2620; --slabszy: #6b6257; --akcent: #4d7c0f; --ramka: #e7dfd3; --kod: #f3ede4; }
  @media (prefers-color-scheme: dark) {
    :root { --tlo: #1a1c15; --tekst: #e9ebe0; --slabszy: #a3a796; --akcent: #a3d65c; --ramka: #363a2c; --kod: #262a1f; }
  }
  body { margin: 0; background: var(--tlo); color: var(--tekst); font: 17px/1.6 Georgia, "Times New Roman", serif; }
  main { max-width: 40rem; margin: 0 auto; padding: 2.5rem 1rem 3rem; }
  h1 { font-size: 1.6rem; line-height: 1.25; margin: 0 0 .5rem; }
  h2 { font-size: 1.1rem; margin: 2rem 0 .5rem; }
  .podpis { color: var(--slabszy); margin-top: 0; }
  code { background: var(--kod); border: 1px solid var(--ramka); border-radius: 4px; padding: .1rem .35rem; font-size: .95em; }
  .adres { display: block; padding: .7rem .8rem; font-size: 1rem; overflow-wrap: anywhere; }
  a { color: var(--akcent); }
  .przycisk { display: inline-block; background: var(--akcent); color: var(--tlo); font: 600 1rem/1 system-ui, sans-serif; text-decoration: none; padding: .75rem 1.2rem; border-radius: 6px; }
  small { color: var(--slabszy); }
</style>
</head>
<body>
<main>
  <h1>Łącznik MCP: kalkulator paszy dla drobiu</h1>
  <p class="podpis">Moja Pasza, wersja ${WERSJA}</p>
  <p>To nie jest strona do czytania, tylko adres dla asystentów AI, takich jak Claude, ChatGPT czy Perplexity. Asystent po podłączeniu sam układa mieszankę paszy dla kur niosek, brojlerów, kaczek, gęsi i indyków z Twoich surowców, według tych samych norm co <a href="https://mojapasza.com/?utm_source=magazyn">kalkulator na mojapasza.com</a>, i podpowiada dodatki paszowe z cenami ze sklepów.</p>

  <h2>Adres do wklejenia</h2>
  <code class="adres">${adres}</code>

  <h2>Jak podłączyć w Claude.ai</h2>
  <p><a class="przycisk" href="${dodajDoClaude}" rel="nofollow noopener">Otwórz łączniki w Claude</a></p>
  <ol>
    <li>Na stronie łączników kliknij + Add, potem Add custom connector (w menu: Customize, zakładka Connectors).</li>
    <li>W polu Name wpisz „Moja Pasza”, w polu MCP server URL wklej adres z ramki wyżej i kliknij Continue, a potem Add. Logowanie ani klucz nie są potrzebne.</li>
    <li>Zapytaj na przykład: „ułóż paszę dla 10 kur niosek z pszenicy, kukurydzy i śruty sojowej”.</li>
  </ol>
  <h2>Jak podłączyć w ChatGPT</h2>
  <ol>
    <li>Otwórz <a href="https://chatgpt.com/plugins" rel="nofollow noopener">wtyczki w ChatGPT</a> i kliknij Dodaj w prawym górnym rogu (obok koła zębatego), potem Dodaj niestandardowy serwer MCP.</li>
    <li>Wpisz nazwę „Moja Pasza”, wklej adres z ramki wyżej, uwierzytelnianie: brak. Potwierdź ostrzeżenie i utwórz wtyczkę.</li>
    <li>Na liście Osobiste kliknij + przy Moja Pasza, potem pytaj w zwykłej rozmowie.</li>
  </ol>
  <p>Krok po kroku, także dla Perplexity: <a href="${SERWIS.instrukcja}?utm_source=magazyn">mojapasza.com/asystenci-ai</a>.</p>

  <h2>Co potrafi</h2>
  <ul>
${listaNarzedzi().map((n) => `    <li><code>${n.nazwa}</code>: ${n.tytul}</li>`).join('\n')}
  </ul>

  <p><small>Tylko odczyt, bez klucza, do 30 zapytań na minutę. Wyniki to obliczenie na danych wzorcowych, nie porada lekarza weterynarii. Ceny dodatków ze stron sklepów, z datą sprawdzenia. Dane: Moja Pasza i Moja Serowarnia, licencja CC BY 4.0. Serwer nie zapisuje adresu IP ani treści pytań: <a href="${SERWIS.prywatnosc}">prywatność</a>, <a href="${SERWIS.warunki}">warunki korzystania</a>.</small></p>
</main>
</body>
</html>
`;
}
