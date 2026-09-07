#!/usr/bin/env node
/**
 * Jedna bezpieczna ścieżka wdrożenia: `npm run deploy`.
 *
 * DLACZEGO TO ISTNIEJE. 3 września 2026 serwis stanął na kilka godzin. Drugi
 * wątek pracował w git worktree (`.claude/worktrees/…`), zbudował tam aplikację
 * i wdrożył ją na produkcję. Worktree to kopia zrobiona z gita, a git nie zna
 * plików z `.gitignore` — więc nie było tam `.env`. Vite wstawia zmienne do kodu
 * W CZASIE BUDOWANIA, a brak nie objawia się niczym: build kończy się sukcesem,
 * wdrożenie przechodzi, serwer oddaje 200. Dopiero przeglądarka wywala się na
 * „supabaseUrl is required" i React nie montuje się w ogóle. Żaden `curl` ani
 * kod odpowiedzi tego nie wyłapie.
 *
 * CO SPRAWDZA, ZANIM COKOLWIEK ZBUDUJE:
 *   1. czy to główny katalog repozytorium, a nie worktree ani kopia,
 *   2. czy są zmienne, bez których aplikacja jest martwa,
 *   3. czy jest token do Cloudflare.
 * Dopiero potem buduje i wdraża.
 *
 * Kontrolę (2) dubluje `vite.config.ts` — celowo. Tam jest ostatnią linią obrony
 * dla każdego, kto uruchomi sam `vite build`; tutaj daje szybszy i czytelniejszy
 * błąd, zanim ruszy dwudziestosekundowy build.
 *
 * Token NIGDY nie jest wypisywany — trafia wyłącznie do zmiennych procesu
 * potomnego.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const KATALOG = process.cwd();
const WYMAGANE_VITE = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];

function stop(tytul, linie) {
  console.error(`\nWDROZENIE PRZERWANE — ${tytul}\n`);
  for (const l of linie) console.error(`  ${l}`);
  console.error("");
  process.exit(1);
}

/** Wczytuje plik .env bez zewnętrznej biblioteki. Zwraca puste, gdy pliku nie ma. */
function wczytaj(nazwa) {
  const p = resolve(KATALOG, nazwa);
  if (!existsSync(p)) return {};
  const out = {};
  for (const linia of readFileSync(p, "utf8").split(/\r?\n/)) {
    if (!linia.trim() || linia.trimStart().startsWith("#")) continue;
    const i = linia.indexOf("=");
    if (i === -1) continue;
    out[linia.slice(0, i).trim()] = linia.slice(i + 1).trim();
  }
  return out;
}

// 1) GŁÓWNY KATALOG CZY KOPIA. W worktree `.git` jest PLIKIEM ze wskazaniem na
//    prawdziwy katalog gita; w głównym repo jest katalogiem. To rozróżnienie
//    jest tanie i pewne — i dokładnie ono odróżnia miejsce, z którego wolno
//    wdrażać, od tego, z którego nie wolno.
const sciezkaGit = resolve(KATALOG, ".git");
if (!existsSync(sciezkaGit)) {
  stop("to nie jest repozytorium git", [
    `Katalog: ${KATALOG}`,
    "Wdrażaj z głównego katalogu repozytorium.",
  ]);
}
if (statSync(sciezkaGit).isFile()) {
  stop("budujesz w kopii repozytorium (git worktree)", [
    `Katalog: ${KATALOG}`,
    "",
    "Worktree nie dostaje plików z .gitignore, więc nie ma tu .env ani",
    ".env.deploy. Zbudowana stąd aplikacja byłaby martwa w przeglądarce.",
    "",
    "Przejdź do głównego katalogu repozytorium i wdróż stamtąd.",
  ]);
}

// 2) ZMIENNE APLIKACJI. `process.env` ma pierwszeństwo — tak działa CI.
const env = wczytaj(".env");
const brakVite = WYMAGANE_VITE.filter((k) => !(process.env[k] || env[k] || "").trim());
if (brakVite.length) {
  stop("brakuje zmiennych środowiskowych aplikacji", [
    ...brakVite.map((k) => `• ${k}`),
    "",
    `Szukałem w: ${resolve(KATALOG, ".env")}`,
    "Bez nich aplikacja zbuduje się bez błędu, ale padnie w przeglądarce",
    "na „supabaseUrl is required” i nie wyrenderuje niczego.",
  ]);
}

// 3) TOKEN DO CLOUDFLARE.
const envDeploy = wczytaj(".env.deploy");
const token = process.env.CLOUDFLARE_API_TOKEN || envDeploy.CLOUDFLARE_API_TOKEN;
if (!token) {
  stop("brakuje tokenu Cloudflare", [
    "Nie znalazłem CLOUDFLARE_API_TOKEN ani w środowisku, ani w .env.deploy.",
    "Wzór pliku: .env.deploy.przyklad",
  ]);
}

// Stan repo to informacja, nie blokada: wdrożenie testowej zmiany przed
// commitem bywa uzasadnione. Ale ma być widoczne, że tak się dzieje.
const stan = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" });
const brudne = (stan.stdout || "").split("\n").filter((l) => l.trim() && !l.startsWith("??"));
if (brudne.length) {
  console.warn(`\nUWAGA: wdrażasz z ${brudne.length} niezacommitowanymi zmianami.\n`);
}

function uruchom(polecenie, argumenty, dodatkoweEnv = {}) {
  const w = spawnSync(polecenie, argumenty, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...dodatkoweEnv },
  });
  if (w.status !== 0) process.exit(w.status ?? 1);
}

console.log(`\nKatalog: ${KATALOG}`);
// ---------------------------------------------------------------------------
// llms.txt deklaruje wlasna date aktualizacji. Jesli plik zmieniono pozniej,
// ta data klamie — a jest to jedna z niewielu rzeczy, ktore modele z tego pliku
// faktycznie odczytuja. Wykryl to model podczas testu 7.09.2026: plik mowil
// "2026-09-05", choc tego samego dnia dopisano do niego wersje angielska.
//
// NIE poprawiamy daty automatycznie. Ustawienie "dzis" przy kazdym wdrozeniu
// klamaloby w druga strone — mowiloby o zmianie tresci, ktorej nie bylo.
// Ostrzegamy, a decyzje zostawiamy czlowiekowi.
{
  const llms = resolve(KATALOG, "public", "llms.txt");
  if (existsSync(llms)) {
    const zadeklarowana = (readFileSync(llms, "utf8")
      .match(/Ostatnia aktualizacja:\s*(\d{4}-\d{2}-\d{2})/) || [])[1];
    const zGita = spawnSync("git",
      ["log", "-1", "--format=%ad", "--date=short", "--", "public/llms.txt"],
      { encoding: "utf8" }).stdout.trim();
    if (zadeklarowana && zGita && zadeklarowana < zGita) {
      console.log(`\n⚠ llms.txt deklaruje date ${zadeklarowana}, a plik zmieniono ${zGita}.`);
      console.log("  Popraw date przed wdrozeniem — modele ja czytaja.\n");
    }
  }
}

console.log("Kontrole przeszły. Buduję…\n");
uruchom("npm", ["run", "build"]);

console.log("\nWdrażam na Cloudflare…\n");
uruchom("npx", ["wrangler", "deploy"], { CLOUDFLARE_API_TOKEN: token });
