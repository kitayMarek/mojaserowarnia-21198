#!/usr/bin/env node
/**
 * Indeks wyszukiwania dla strony /szukaj w Workerze: src/data/searchIndex.ts -> worker/indeks-szukaj.json.
 *
 * Strona wyników /szukaj (od 24.11.2026, etap 1 wyszukiwarki we wszystkich modułach Dane Rolne)
 * szuka w tym samym indeksie co okno Ctrl+K. Worker nie może zaimportować searchIndex.ts wprost,
 * bo recipesData.ts importuje zdjęcia ("@/assets/mozzarella.jpg"), a esbuild w wranglerze nie ma
 * dla nich loadera. Ten sam sposób co scripts/eksport-przepisow-magazyn.mjs: esbuild podmienia
 * import zdjęcia na samą nazwę pliku, a do JSON-a idą tylko pola, które czyta wyszukiwarka.
 * Funkcja dopasowania jest jedna dla obu stron: src/data/wyszukiwanie.ts.
 *
 * Uruchamiany przez `npm run deploy` przed budową, więc Worker zawsze ma indeks z tych samych
 * plików co aplikacja. Wynik jest też w repo, żeby `wrangler dev` działał bez tego kroku.
 *
 * Użycie: node scripts/gen-indeks-szukaj.mjs
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const KATALOG = process.cwd();
const WYJSCIE = resolve(KATALOG, "worker/indeks-szukaj.json");

const { outputFiles } = await build({
  stdin: {
    contents: 'export { searchIndex } from "./src/data/searchIndex.ts";',
    resolveDir: KATALOG,
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  platform: "neutral",
  write: false,
  logLevel: "silent",
  // Ścieżki „@/…” jak w tsconfig.json aplikacji.
  alias: { "@": resolve(KATALOG, "src") },
  plugins: [
    {
      name: "zdjecia-jako-nazwy",
      setup(b) {
        b.onResolve({ filter: /\.(jpe?g|png|webp|avif|svg)$/ }, (a) => ({ path: a.path, namespace: "zdjecie" }));
        b.onLoad({ filter: /.*/, namespace: "zdjecie" }, (a) => ({
          contents: `export default ${JSON.stringify(a.path)};`,
          loader: "js",
        }));
      },
    },
  ],
});

const kod = outputFiles[0].text;
const { searchIndex } = await import(`data:text/javascript;base64,${Buffer.from(kod).toString("base64")}`);

// Tylko pola, które czyta dopasowanie i strona wyników. Bez cen: strona wyników ich nie pokazuje,
// a cena bez daty sprawdzenia wprowadzałaby w błąd.
const pozycje = searchIndex.map((p) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  category: p.category,
  href: p.href,
  keywords: p.keywords.filter((k) => typeof k === "string" && k.trim()),
  ...(p.shop ? { shop: p.shop } : {}),
  ...(p.type ? { type: p.type } : {}),
  ...(p.featured ? { featured: true } : {}),
}));

// Jedna pozycja w wierszu: zmiana jednego przepisu to jeden wiersz w diffie.
const tresc = `[\n${pozycje.map((p) => JSON.stringify(p)).join(",\n")}\n]\n`;
const bylo = existsSync(WYJSCIE) ? readFileSync(WYJSCIE, "utf8") : "";
if (bylo === tresc) {
  console.log(`Indeks /szukaj bez zmian: ${pozycje.length} pozycji (worker/indeks-szukaj.json).`);
} else {
  writeFileSync(WYJSCIE, tresc);
  console.log(`Indeks /szukaj zapisany: ${pozycje.length} pozycji, ${(Buffer.byteLength(tresc) / 1024).toFixed(0)} kB (worker/indeks-szukaj.json).`);
}
