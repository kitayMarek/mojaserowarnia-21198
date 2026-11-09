#!/usr/bin/env node
/**
 * Zasady oznakowania nabiału w RHD z src/data/etykietaRhd.ts do dwóch miejsc:
 *   1. public/dane/etykieta-rhd.json: plik danych dla Targu Rolnego (ekran przy stoisku)
 *      i asystentów AI, tak jak public/dane/prawo-rhd.json;
 *   2. public/etykieta-do-sprzedazy-rhd.html: listy wymogów między znacznikami
 *      <!-- etykieta-rhd:start --> i <!-- etykieta-rhd:end --> (strona statyczna).
 *
 * Strona React /etykieta-rhd importuje ten sam plik .ts, więc po zmianie w nim
 * i uruchomieniu skryptu wszystkie trzy miejsca mówią to samo.
 *
 * Wynik nie zależy od daty uruchomienia (data to STAN_PRAWNY_NA z pliku .ts),
 * więc ponowne uruchomienie bez zmian w danych niczego nie zmienia.
 *
 * Użycie: node scripts/gen-dane-etykieta.mjs
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const KATALOG = process.cwd();
const JSON_WYJSCIE = resolve(KATALOG, "public/dane/etykieta-rhd.json");
const STRONA_HTML = resolve(KATALOG, "public/etykieta-do-sprzedazy-rhd.html");

const { outputFiles } = await build({
  entryPoints: [resolve(KATALOG, "src/data/etykietaRhd.ts")],
  bundle: true,
  format: "esm",
  platform: "neutral",
  write: false,
  logLevel: "silent",
});
const d = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`);

// --- 1. JSON -----------------------------------------------------------------

const zPodstawa = (w) => ({
  id: w.id,
  pole: w.pole,
  opis: w.opis,
  ...(w.uwaga ? { uwaga: w.uwaga } : {}),
  pewnosc: w.pewnosc ?? "potwierdzone",
  podstawa: w.podstawa.map((p) => ({ akt: d.ZRODLA[p.zrodlo].akt, przepis: p.przepis, url: d.ZRODLA[p.zrodlo].url })),
});

const dane = {
  nazwa: "Oznakowanie nabiału w rolniczym handlu detalicznym (RHD): etykieta, stoisko, sprzedaż luzem",
  opis:
    "Co musi być na etykiecie sera, twarogu i masła w opakowaniu, co przy stoisku i co przy sprzedaży luzem, każdy wymóg z podstawą prawną. Ta sama treść co na stronie, w uporządkowanej formie. Dane rolnika (nazwa, adres, numer weterynaryjny) nie są częścią tego pliku.",
  strona: "https://mojaserowarnia.pl/etykieta-rhd",
  wersja: "1.0",
  stan_prawny_na: d.STAN_PRAWNY_NA,
  zmieniono: d.STAN_PRAWNY_NA,
  uwaga:
    "Informacja, nie porada prawna. Przepisy sprawdzone w tekstach aktów w dniu stan_prawny_na. Zakres znakowania warto potwierdzić u powiatowego lekarza weterynarii. Ekran przy stoisku nie zastępuje etykiety na produkcie w opakowaniu.",
  licencja: "CC BY 4.0",
  licencja_url: "https://creativecommons.org/licenses/by/4.0/deed.pl",
  cytuj_jako: "Moja Serowarnia, „Etykieta RHD na ser”, https://mojaserowarnia.pl/etykieta-rhd",
  na_etykiecie: d.NA_ETYKIECIE.map(zPodstawa),
  nie_wymagane_na_etykiecie: d.NIE_WYMAGANE.map(zPodstawa),
  przy_stoisku: d.PRZY_STOISKU.map(zPodstawa),
  luzem: d.LUZEM.map(zPodstawa),
  luzem_nie_wymagane: d.LUZEM_NIE_WYMAGANE,
  alergeny_zal_II: d.ALERGENY_ZAL_II,
  podpowiedzi: {
    uwaga:
      "Podpowiedzi do generatora etykiety, nie wymogi prawa. Temperatury to typowe zakresy dla rodzaju produktu; producent wpisuje własne. typ_daty: przydatnosc = „Należy spożyć do”, trwalosc = „Najlepiej spożyć przed”.",
    rodzaje: d.PODPOWIEDZI,
  },
  zrodla: Object.entries(d.ZRODLA).map(([id, z]) => ({ id, ...z })),
};

writeFileSync(JSON_WYJSCIE, JSON.stringify(dane, null, 2) + "\n");
console.log(`Plik danych: ${JSON_WYJSCIE}`);

// --- 2. Listy na stronie statycznej -----------------------------------------

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const li = (w) =>
  `    <li><strong>${esc(w.pole)}</strong>: ${esc(w.opis)}` +
  (w.uwaga ? ` ${esc(w.uwaga)}` : "") +
  (w.pewnosc === "do_potwierdzenia" ? ` <em>Do potwierdzenia u powiatowego lekarza weterynarii.</em>` : "") +
  `<br /><small>Podstawa: ${esc(d.podstawaTekst(w))}</small></li>`;

const blok = [
  "<!-- etykieta-rhd:start (generuje scripts/gen-dane-etykieta.mjs z src/data/etykietaRhd.ts; nie edytować ręcznie) -->",
  "  <h2>Co musi być na etykiecie produktu w opakowaniu</h2>",
  "  <ol>",
  ...d.NA_ETYKIECIE.map(li),
  "  </ol>",
  "",
  "  <h2>Czego na etykiecie nie trzeba</h2>",
  "  <ul>",
  ...d.NIE_WYMAGANE.map(li),
  "  </ul>",
  "",
  "  <h2>Co musi być przy stoisku (miejsce sprzedaży)</h2>",
  "  <p>W miejscu sprzedaży w RHD umieszcza się, czytelnie i widocznie dla kupującego:</p>",
  "  <ul>",
  ...d.PRZY_STOISKU.map(li),
  "  </ul>",
  "",
  "  <h2>Sprzedaż luzem, bez opakowania</h2>",
  "  <p>Ser krojony z lady i niepakowany wcześniej nie potrzebuje etykiety. Przy produkcie podaje się na wywieszce albo w inny sposób:</p>",
  "  <ul>",
  ...d.LUZEM.map(li),
  "  </ul>",
  `  <p>Przy sprzedaży luzem nie są wymagane: ${esc(d.LUZEM_NIE_WYMAGANE.join(", "))}.</p>`,
  "",
  "  <h2>Podstawa prawna</h2>",
  "  <ul>",
  ...Object.values(d.ZRODLA).map((z) => `    <li><a href="${esc(z.url)}" rel="noopener noreferrer">${esc(z.akt)}</a></li>`),
  "  </ul>",
  "  <!-- etykieta-rhd:end -->",
].join("\n");

const html = readFileSync(STRONA_HTML, "utf8");
const wzor = /<!-- etykieta-rhd:start[\s\S]*?<!-- etykieta-rhd:end -->/;
if (!wzor.test(html)) throw new Error(`Brak znaczników etykieta-rhd:start/end w ${STRONA_HTML}`);
const nowy = html.replace(wzor, () => blok);
if (nowy !== html) writeFileSync(STRONA_HTML, nowy);
console.log(`Strona statyczna: ${nowy === html ? "bez zmian" : "zaktualizowana"} (${STRONA_HTML})`);
