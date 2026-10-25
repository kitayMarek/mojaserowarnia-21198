#!/usr/bin/env node
/**
 * Mirrory dla botów na mojapasza.com (pasze/public/mirror/), przepisane z mirrorów
 * pasz Serowarni. Treść bez zmian (plan przenosin: „nie zmieniamy treści w czasie
 * przenosin”), zmieniają się tylko adresy, nazwa serwisu, obrazek i okruszki.
 *
 *   node scripts/mirrory-mojapasza.mjs
 *
 * Uruchomić po każdej zmianie mirrorów pasz w public/ (gen-mirror-porady-pasz.mts
 * robi to sam na końcu). Do dnia przełączenia źródłem są pliki Serowarni; w dniu
 * przełączenia znikają z public/ i źródłem stają się pliki w pasze/public/mirror/.
 *
 * Mapa adresów jak 301 w workerze Serowarni: /kalkulator-pasz -> /, /pasze -> /poradnik.
 * Linki do treści serowarskich (narzędzia, słownik, serwatka, prawo) zostają na
 * mojaserowarnia.pl.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const KORZEN = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STARA = "https://mojaserowarnia.pl";
const NOWA = "https://mojapasza.com";

/** Mirror Serowarni -> mirror mojapasza (ścieżki względem public/ i pasze/public/). */
export const MIRRORY = [
  ["kalkulator-pasz.html", "mirror/index.html"],
  ["kalkulator-pasz-bydlo.html", "mirror/bydlo.html"],
  ["pasze.html", "mirror/poradnik.html"],
  ["pasze/udzial-surowcow.html", "mirror/poradnik/udzial-surowcow.html"],
  ["pasze/kury-nie-niosa.html", "mirror/poradnik/kury-nie-niosa.html"],
  ["pasze/resztki-z-kuchni.html", "mirror/poradnik/resztki-z-kuchni.html"],
];

const ADRESY = {
  "kalkulator-pasz-bydlo": "/bydlo",
  "kalkulator-pasz": "/",
  "kalkulator-pasza": "/",
  "pasze/udzial-surowcow": "/poradnik/udzial-surowcow",
  "pasze/kury-nie-niosa": "/poradnik/kury-nie-niosa",
  "pasze/resztki-z-kuchni": "/poradnik/resztki-z-kuchni",
  pasze: "/poradnik",
};

const ESC = (t) => t.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

export function naMojapasza(html, { stronaGlowna = false } = {}) {
  let s = html;

  // 1. Strony pasz: dłuższe ścieżki przed krótszymi, adres kończy się cudzysłowem, #, ?, <
  //    albo znakiem przestankowym (adres na końcu zdania w odpowiedzi FAQ).
  for (const [stara, nowa] of Object.entries(ADRESY).sort((a, b) => b[0].length - a[0].length)) {
    const wzor = new RegExp(`${ESC(STARA)}/${ESC(stara)}(?:\\.html)?(?=["'#?<\\s.,;)])`, "g");
    s = s.replace(wzor, `${NOWA}${nowa}`);
    // Adres bez https:// w zwykłym tekście (odpowiedzi FAQ).
    const goly = new RegExp(`(?<![/\\w])mojaserowarnia\\.pl/${ESC(stara)}(?=["'#?<\\s.,;)])`, "g");
    s = s.replace(goly, `mojapasza.com${nowa === "/" ? "" : nowa}`);
  }
  s = s.replace(/>mojaserowarnia\.pl\/kalkulator-pasz</g, ">mojapasza.com<");

  // 2. Obrazek podglądu: plansza mojapasza (scripts/gen-grafiki.py mojapasza).
  s = s.replace(new RegExp(`${ESC(STARA)}/(?:og/pasze\\.png|og-image\\.jpg)`, "g"), `${NOWA}/og/pasze.png`);

  // 3. Strona z instrukcją podłączenia czatów.
  s = s.replace(new RegExp(`${ESC(STARA)}/asystenci-ai`, "g"), `${NOWA}/asystenci-ai`);

  // 4. Nazwa serwisu: wydawca, pierwszy okruszek, og:site_name, link do strony głównej.
  s = s.replace(
    new RegExp(`("name":\\s*)"Moja Serowarnia"(,\\s*"(?:url|item)":\\s*)"${ESC(STARA)}/?"`, "g"),
    `$1"Moja Pasza"$2"${NOWA}/"`,
  );
  s = s.replace(/(<meta property="og:site_name" content=")Moja Serowarnia"/g, '$1Moja Pasza"');
  s = s.replace(new RegExp(`<a href="${ESC(STARA)}/">Moja Serowarnia</a>`, "g"), `<a href="${NOWA}/">Moja Pasza</a>`);
  s = s.replace(new RegExp(`(<a href="${ESC(NOWA)}[^"]*">)Moja Serowarnia</a>`, "g"), "$1Moja Pasza</a>");

  // 5. Okruszki: na mojapasza nie ma „Narzędzi”, a przegląd działu to „Poradnik”.
  s = s.replace(
    new RegExp(`\\s*\\{\\s*"@type": "ListItem",\\s*"position": 2,\\s*"name": "Narzędzia",\\s*"item": "${ESC(STARA)}/narzedzia"\\s*\\},`),
    "",
  );
  s = s.replace(/("position": )3(,\s*"name": "Kalkulator pasz dla drobiu")/, "$12$2");
  s = s.replace(new RegExp(`\\n\\s*<a href="${ESC(STARA)}/narzedzia">Narzędzia</a> →`), "");
  s = s.replace(new RegExp(`(<a href="${ESC(NOWA)}/poradnik">)Pasze i zwierzęta(</a> →)`, "g"), "$1Poradnik$2");
  s = s.replace(/("name": )"Pasze i zwierzęta"(,\s*"item": "https:\/\/mojapasza\.com\/poradnik")/g, '$1"Poradnik"$2');

  // Kalkulator to strona główna mojapasza: okruszki „Moja Pasza → Kalkulator” wskazywałyby
  // dwa razy ten sam adres, więc znikają (dane strukturalne i widoczne).
  if (stronaGlowna) {
    s = s.replace(/\s*<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "BreadcrumbList"[\s\S]*?<\/script>/, "");
    s = s.replace(/\s*<nav class="crumbs">[\s\S]*?<\/nav>/, "");
  }

  return s;
}

export function przepiszMirroryPasz() {
  for (const [zrodlo, cel] of MIRRORY) {
    const html = readFileSync(resolve(KORZEN, "public", zrodlo), "utf8");
    const wynik = naMojapasza(html, { stronaGlowna: cel === "mirror/index.html" });
    const sciezka = resolve(KORZEN, "pasze", "public", cel);
    mkdirSync(dirname(sciezka), { recursive: true });
    writeFileSync(sciezka, wynik);
    const zostalo = (wynik.match(/mojaserowarnia\.pl\/(?:kalkulator-pasz|pasze)/g) || []).length;
    console.log(`  ${cel.padEnd(42)} ${wynik.length} B${zostalo ? `, UWAGA: ${zostalo} starych adresów pasz` : ""}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log("Mirrory mojapasza.com (pasze/public/mirror/):");
  przepiszMirroryPasz();
}
