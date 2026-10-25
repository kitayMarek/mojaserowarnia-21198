#!/usr/bin/env node
/**
 * Wdrozenie serwera MCP bazy kultur (worker-magazyn/): `npm run deploy:magazyn`.
 *
 * Osobne od `npm run deploy`, bo to osobny Worker na osobnej subdomenie
 * (dane.mojaserowarnia.pl). Wdrozenie jednego nie rusza drugiego.
 *
 * Pulapki z .env (scripts/wdroz.mjs) tu nie ma: magazyn nie przechodzi przez
 * Vite, a jedyny sekret siedzi w Cloudflare. Zostaje regula z CLAUDE.md:
 * tylko z glownego katalogu i jeden watek naraz. Zaleznosci MCP leza
 * w worker-magazyn/node_modules, wiec na swiezym klonie najpierw npm ci.
 *
 * Token NIGDY nie jest wypisywany, trafia wylacznie do zmiennych procesu potomnego.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const KATALOG = process.cwd();
const MAGAZYN = resolve(KATALOG, "worker-magazyn");

function stop(tekst) {
  console.error(`\nWDROZENIE MAGAZYNU PRZERWANE: ${tekst}\n`);
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

// W worktree `.git` jest plikiem, w glownym repo katalogiem.
const git = resolve(KATALOG, ".git");
if (!existsSync(git) || !statSync(git).isDirectory()) {
  stop("to nie jest glowny katalog repozytorium. Uruchom z C:\\Moje\\Serowarnia\\mojaserowarnia-21198.");
}
if (!existsSync(resolve(MAGAZYN, "wrangler.jsonc"))) stop("brak worker-magazyn/wrangler.jsonc.");

const token = process.env.CLOUDFLARE_API_TOKEN || wczytaj(".env.deploy").CLOUDFLARE_API_TOKEN;
if (!token) stop("nie znalazlem CLOUDFLARE_API_TOKEN ani w srodowisku, ani w .env.deploy.");

if (!existsSync(resolve(MAGAZYN, "node_modules", "@modelcontextprotocol", "server"))) {
  console.log("\nInstaluje zaleznosci magazynu (npm ci w worker-magazyn/)...\n");
  const inst = spawnSync("npm", ["ci", "--no-audit", "--no-fund"], { cwd: MAGAZYN, stdio: "inherit", shell: true });
  if (inst.status !== 0) stop("npm ci w worker-magazyn/ sie nie udalo.");
}

// Przepisy z src/data/recipesData.ts (od 0.3.0): swiezy eksport przed kazdym
// wdrozeniem, zeby serwer mial te same przepisy co strona.
const eksport = spawnSync(process.execPath, ["scripts/eksport-przepisow-magazyn.mjs"], { stdio: "inherit" });
if (eksport.status !== 0) stop("eksport przepisow (scripts/eksport-przepisow-magazyn.mjs) sie nie udal.");

// `npm run deploy:magazyn -- --pasze`: lacznik mojapasza.com/mcp (Worker mojapasza-mcp,
// ten sam kod w wariancie paszowym, worker-magazyn/wrangler-pasze.jsonc). Od 26.10.2026.
const PASZE = process.argv.includes("--pasze");
const KONFIGURACJA = PASZE ? "worker-magazyn/wrangler-pasze.jsonc" : "worker-magazyn/wrangler.jsonc";

console.log(PASZE
  ? "\nWdrazam mojapasza-mcp (mojapasza.com/mcp przez Worker mojapasza)...\n"
  : "\nWdrazam worker-magazyn (dane.mojaserowarnia.pl)...\n");
const wynik = spawnSync("npx", ["wrangler", "deploy", "-c", KONFIGURACJA], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, CLOUDFLARE_API_TOKEN: token },
});
process.exit(wynik.status ?? 1);
