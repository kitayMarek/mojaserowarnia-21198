#!/usr/bin/env node
/**
 * Klucz do prywatnego odczytu licznika (kontrakt licznik-botow/1): `npm run klucz-licznika`.
 *
 * Tworzy losowy klucz, zapisuje go w sekrecie workera KLUCZ_LICZNIKA_BOTOW
 * i kopiuje do schowka Windows, żeby wkleić go jako sekret aplikacji analitycznej.
 *
 * Klucz NIGDY nie jest wypisywany ani zapisywany w pliku: trafia do wranglera przez
 * standardowe wejście i do schowka przez `clip`. Dlatego nie widzi go ani terminal,
 * ani Claude.
 *
 * Każde uruchomienie tworzy NOWY klucz. Stary przestaje działać od razu, więc
 * po ponownym uruchomieniu trzeba podmienić klucz także w aplikacji.
 */
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const NAZWA = "KLUCZ_LICZNIKA_BOTOW";

function wczytaj(nazwa) {
  const p = resolve(process.cwd(), nazwa);
  if (!existsSync(p)) return {};
  const out = {};
  for (const linia of readFileSync(p, "utf8").split(/\r?\n/)) {
    if (!linia.trim() || linia.trimStart().startsWith("#")) continue;
    const i = linia.indexOf("=");
    if (i !== -1) out[linia.slice(0, i).trim()] = linia.slice(i + 1).trim();
  }
  return out;
}

if (process.platform !== "win32") {
  console.error("\nTen skrypt kopiuje klucz przez schowek Windows (clip). Uruchom go na Windows.\n");
  process.exit(1);
}

const token = process.env.CLOUDFLARE_API_TOKEN || wczytaj(".env.deploy").CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error("\nNie znalazłem CLOUDFLARE_API_TOKEN ani w środowisku, ani w .env.deploy.\n");
  process.exit(1);
}

const klucz = randomBytes(32).toString("base64url");

console.log(`\nZapisuję nowy klucz w sekrecie workera ${NAZWA}…\n`);
const zapis = spawnSync("npx", ["wrangler", "secret", "put", NAZWA], {
  input: klucz,
  stdio: ["pipe", "inherit", "inherit"],
  shell: true,
  env: { ...process.env, CLOUDFLARE_API_TOKEN: token },
});
if (zapis.status !== 0) {
  console.error("\nNie udało się zapisać sekretu. Nic nie zostało zmienione w aplikacji.\n");
  process.exit(1);
}

const schowek = spawnSync("clip", [], { input: klucz, shell: true });
if (schowek.status !== 0) {
  console.error("\nSekret zapisany, ale kopiowanie do schowka się nie udało.");
  console.error("Uruchom skrypt jeszcze raz: utworzy nowy klucz i spróbuje ponownie.\n");
  process.exit(1);
}

console.log("\nGotowe. Klucz jest w sekrecie workera i w schowku.");
console.log("W repozytorium aplikacji analitycznej zapisz go jako jej sekret");
console.log("(npx wrangler secret put <nazwa>) i wklej Ctrl+V.");
console.log("Potem skopiuj cokolwiek innego, żeby klucz nie został w schowku.\n");
