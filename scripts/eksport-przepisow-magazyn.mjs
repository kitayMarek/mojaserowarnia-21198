#!/usr/bin/env node
/**
 * Przepisy dla serwera MCP (worker-magazyn): src/data/recipesData.ts -> worker-magazyn/src/przepisy-dane.json.
 *
 * DLACZEGO EKSPORT, A NIE IMPORT. Kultury magazyn importuje wprost z .ts
 * (worker-magazyn/src/kultury.js), ale recipesData.ts importuje zdjęcia
 * ("@/assets/mozzarella.jpg"), a esbuild w wranglerze nie ma dla nich loadera.
 * Wkompilowanie zdjęć rozdęłoby Workera o kilka MB. Tu esbuild podmienia każdy
 * import zdjęcia na samą nazwę pliku, a do JSON-a idą tylko pola tekstowe.
 *
 * Uruchamiany przez `npm run deploy:magazyn` przed każdym wdrożeniem, więc
 * serwer zawsze ma przepisy z tego samego pliku co strona. Wynik jest też
 * w repo, żeby testy i `wrangler dev` działały bez tego kroku.
 *
 * Użycie: node scripts/eksport-przepisow-magazyn.mjs
 */
import { build } from "esbuild";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const KATALOG = process.cwd();
const WYJSCIE = resolve(KATALOG, "worker-magazyn/src/przepisy-dane.json");

const { outputFiles } = await build({
  // Przepisy i tekst ramki „Nazwa chroniona w UE” z tego samego pliku co strona.
  stdin: {
    contents: [
      'export { recipesData } from "./src/data/recipesData.ts";',
      'export { ramkaNazwyChronionej, WYKAZ_PRODUCENTOW_IJHARS } from "./src/lib/nazwaChroniona.ts";',
    ].join("\n"),
    resolveDir: KATALOG,
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  platform: "neutral",
  write: false,
  logLevel: "silent",
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
const { recipesData, ramkaNazwyChronionej, WYKAZ_PRODUCENTOW_IJHARS } = await import(`data:text/javascript;base64,${Buffer.from(kod).toString("base64")}`);

// Tylko treść przepisu. Bez zdjęć, filmów i wartości odżywczych: model ich nie
// potrzebuje, a każde pole to kontekst, za który płaci przy każdym wywołaniu.
const przepisy = recipesData.map((r) => ({
  id: r.id,
  nazwa: r.name,
  trudnosc: r.difficulty,
  opis: r.description,
  wydajnosc: r.yield,
  dojrzewanie: r.ageTime,
  mleko: r.milkBase,
  kultura_startowa: r.starter,
  koagulant: r.coagulant,
  solenie: r.salting,
  dojrzewanie_opis: r.aging,
  kultury: (r.cultureSubstitutes || []).map((k) => ({
    nazwa: k.name,
    typ: k.type,
    sklep: k.shop,
    dawka: k.dosage,
    uwagi: k.notes,
  })),
  dawkowanie_zrodlo: r.dosageReference,
  dawkowanie: r.dosageTable || [],
  kroki: (r.steps || []).map((s, i) => ({
    nr: i + 1,
    tytul: s.title,
    tresc: s.content,
    ...(s.tip ? { wskazowka: s.tip } : {}),
    ...(s.warning ? { ostrzezenie: s.warning } : {}),
  })),
  ...(r.notes ? { uwagi: { wskazowki: r.notes.tips, ostrzezenia: r.notes.warnings, warianty: r.notes.variants } } : {}),
  ...(r.wyjasnienie ? { wyjasnienie: r.wyjasnienie } : {}),
  ...(r.dziennikWarzen?.length ? { dziennik_warzen: r.dziennikWarzen } : {}),
  ...(r.flavor ? { profil: { smak: r.flavor.taste, tekstura: r.flavor.texture, kolor: r.flavor.color, aromat: r.flavor.aroma } } : {}),
  ...(r.zastosowanie ? { zastosowanie: r.zastosowanie } : {}),
  ...(r.nazwaChroniona
    ? {
        nazwa_chroniona: {
          rodzaj: r.nazwaChroniona.rodzaj,
          nazwa_zarejestrowana: r.nazwaChroniona.nazwa,
          od: r.nazwaChroniona.zarejestrowana,
          uwaga: ramkaNazwyChronionej(r.nazwaChroniona),
          wykaz_producentow_z_certyfikatem: WYKAZ_PRODUCENTOW_IJHARS,
          wyjasnienie: "https://mojaserowarnia.pl/prawo/nazwy-chronione?utm_source=magazyn",
        },
      }
    : {}),
}));

writeFileSync(WYJSCIE, JSON.stringify(przepisy, null, 1) + "\n");
console.log(`Przepisy dla magazynu: ${przepisy.length} -> ${WYJSCIE}`);
