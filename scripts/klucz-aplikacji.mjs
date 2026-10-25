#!/usr/bin/env node
/**
 * Klucze aplikacji serwera MCP (dane.mojaserowarnia.pl), od 25.10.2026.
 *
 * Darmowy klucz na prosbe daje aplikacji 300 zapytan na minute zamiast 30 z jednego
 * adresu (/warunki-mcp#aplikacje). Klucz to etykieta do limitu i pomiaru, nie dostep:
 * serwer odpowiada tak samo z kluczem i bez.
 *
 * UZYCIE (z glownego katalogu repo):
 *   node scripts/klucz-aplikacji.mjs dodaj asystent-jana   -> nowy klucz, wypisany raz
 *   node scripts/klucz-aplikacji.mjs usun asystent-jana    -> klucze tej aplikacji przestaja dzialac
 *   node scripts/klucz-aplikacji.mjs lista                 -> nazwy aplikacji (bez kluczy)
 *
 * Lista kluczy lezy w ProjektyLLm/klucze-aplikacji.json (katalog w .gitignore, bo repo
 * jest publiczne), a serwer dostaje ja jako sekret KLUCZE_APLIKACJI: dodaj i usun wgrywaja
 * go od razu przez `wrangler secret put` (to zmiana na produkcji, bez wdrazania kodu).
 * Token Cloudflare jak w scripts/wdroz-magazyn.mjs, nigdy nie jest wypisywany.
 */
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const KATALOG = process.cwd();
const PLIK = resolve(KATALOG, "ProjektyLLm", "klucze-aplikacji.json");

function stop(tekst) {
  console.error(`\nKLUCZE APLIKACJI: ${tekst}\n`);
  process.exit(1);
}

function wczytajEnv(nazwa) {
  const p = resolve(KATALOG, nazwa);
  if (!existsSync(p)) return {};
  const out = {};
  for (const linia of readFileSync(p, "utf8").split(/\r?\n/)) {
    if (!linia.trim() || linia.trimStart().startsWith("#")) continue;
    const i = linia.indexOf("=");
    if (i !== -1) out[linia.slice(0, i).trim()] = linia.slice(i + 1).trim();
  }
  return out;
}

const klucze = existsSync(PLIK) ? JSON.parse(readFileSync(PLIK, "utf8")) : {};

function wgraj() {
  const token = process.env.CLOUDFLARE_API_TOKEN || wczytajEnv(".env.deploy").CLOUDFLARE_API_TOKEN;
  if (!token) stop("nie znalazlem CLOUDFLARE_API_TOKEN ani w srodowisku, ani w .env.deploy.");
  writeFileSync(PLIK, JSON.stringify(klucze, null, 2) + "\n");
  const wynik = spawnSync("npx", ["wrangler", "secret", "put", "KLUCZE_APLIKACJI", "-c", "worker-magazyn/wrangler.jsonc"], {
    input: JSON.stringify(klucze),
    stdio: ["pipe", "inherit", "inherit"],
    shell: true,
    env: { ...process.env, CLOUDFLARE_API_TOKEN: token },
  });
  if (wynik.status !== 0) stop("wrangler secret put sie nie udal; lista w pliku jest juz zapisana, uruchom ponownie.");
}

const [polecenie, surowaNazwa] = process.argv.slice(2);
// Ta sama postac co znacznik ?z= (worker-magazyn/src/pomiar.js), bo nazwa trafia do pomiaru.
const nazwa = (surowaNazwa || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);

if (polecenie === "lista") {
  const nazwy = Object.values(klucze);
  console.log(nazwy.length ? nazwy.sort().join("\n") : "(brak kluczy)");
} else if (polecenie === "dodaj") {
  if (!nazwa) stop("podaj nazwe aplikacji, np. asystent-jana.");
  const klucz = `ms_${randomBytes(16).toString("hex")}`;
  klucze[klucz] = nazwa;
  wgraj();
  console.log(`\nKlucz dla „${nazwa}” (wyslij autorowi, drugi raz go nie wypisze):\n\n  ${klucz}\n`);
  console.log("Uzycie: naglowek Authorization: Bearer <klucz> albo ?klucz=<klucz> w adresie serwera.\n");
} else if (polecenie === "usun") {
  if (!nazwa) stop("podaj nazwe aplikacji.");
  const przed = Object.keys(klucze).length;
  for (const [k, n] of Object.entries(klucze)) if (n === nazwa) delete klucze[k];
  if (Object.keys(klucze).length === przed) stop(`nie ma kluczy dla „${nazwa}”.`);
  wgraj();
  console.log(`\nKlucze „${nazwa}” usuniete.\n`);
} else {
  stop("polecenie: dodaj <nazwa> | usun <nazwa> | lista");
}
