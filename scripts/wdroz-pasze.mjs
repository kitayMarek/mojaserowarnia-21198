#!/usr/bin/env node
/**
 * Wdrożenie serwisu mojapasza.com (pasze/): `npm run deploy:pasze`.
 *
 * Osobne od `npm run deploy`, bo to osobny Worker na osobnej domenie.
 * Pułapka ta sama co w Serowarni (scripts/wdroz.mjs): aplikacja przechodzi
 * przez Vite, więc bez `.env` w głównym katalogu zbuduje się bez błędu i padnie
 * w przeglądarce. Dlatego tylko z głównego katalogu repozytorium i jeden wątek
 * naraz (CLAUDE.md). pasze/vite.config.ts sprawdza zmienne drugi raz.
 *
 * Token NIGDY nie jest wypisywany, trafia wyłącznie do zmiennych procesu potomnego.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const KATALOG = process.cwd();
const WYMAGANE_VITE = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];

function stop(tekst) {
  console.error(`\nWDROZENIE MOJAPASZA PRZERWANE: ${tekst}\n`);
  process.exit(1);
}

function wczytaj(nazwa) {
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

// W worktree `.git` jest plikiem, w głównym repo katalogiem.
const git = resolve(KATALOG, ".git");
if (!existsSync(git) || !statSync(git).isDirectory()) {
  stop("to nie jest glowny katalog repozytorium. Uruchom z C:\\Moje\\Serowarnia\\mojaserowarnia-21198.");
}
if (!existsSync(resolve(KATALOG, "pasze", "wrangler.jsonc"))) stop("brak pasze/wrangler.jsonc.");

const env = { ...wczytaj(".env"), ...process.env };
const brakuje = WYMAGANE_VITE.filter((k) => !env[k]?.trim());
if (brakuje.length) stop(`brakuje w .env: ${brakuje.join(", ")}. Bez nich strona padnie w przegladarce.`);

const token = process.env.CLOUDFLARE_API_TOKEN || wczytaj(".env.deploy").CLOUDFLARE_API_TOKEN;
if (!token) stop("nie znalazlem CLOUDFLARE_API_TOKEN ani w srodowisku, ani w .env.deploy.");

console.log("\nBuduje mojapasza.com (pasze/dist)...\n");
const build = spawnSync("npm", ["run", "build:pasze"], { stdio: "inherit", shell: true });
if (build.status !== 0) stop("build sie nie udal.");

console.log("\nWdrazam Worker mojapasza (mojapasza.com)...\n");
const wynik = spawnSync("npx", ["wrangler", "deploy", "-c", "pasze/wrangler.jsonc"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, CLOUDFLARE_API_TOKEN: token },
});
process.exit(wynik.status ?? 1);
