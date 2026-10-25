#!/usr/bin/env node
/**
 * Cotygodniowa kopia bazy Supabase (od 25.10.2026).
 *
 * Plan darmowy Supabase nie robi żadnych kopii, więc bez tego skryptu utrata
 * tabeli = utrata kont, zgłoszeń sklepów, katalogu serowarni i liczników.
 *
 * UZYCIE (z głównego katalogu repo):
 *   npm run kopia-bazy
 * Uruchamia go też zadanie Windows „Serowarnia - kopia bazy” (raz w tygodniu).
 *
 * CO POWSTAJE w ../kopie-bazy/RRRR-MM-DD/ (poza repo, bo są tam dane osobowe
 * i hasła użytkowników w postaci skrótów; repo jest publiczne):
 *   public.dump         schemat i dane schematu public (tabele, funkcje, polityki RLS)
 *   auth-storage.dump   same dane: konta (auth.users, auth.identities) i opis plików
 *                       w Storage (storage.buckets, storage.objects); same pliki
 *                       zdjęć leżą w Storage i NIE wchodzą do kopii
 * Każdy plik jest sprawdzany przez pg_restore --list. Wynik trafia do
 * ../kopie-bazy/dziennik.txt. Zostaje 12 ostatnich kopii, starsze są usuwane.
 *
 * POŁĄCZENIE: SUPABASE_DB_URL w .env.deploy (albo w środowisku), adres
 * „Session pooler” z panelu Supabase (Connect), z hasłem bazy. Adres „Direct”
 * działa tylko przez IPv6, a „Transaction pooler” (port 6543) nie obsługuje pg_dump.
 * Hasło idzie do pg_dump przez zmienną PGPASSWORD i nigdy nie jest wypisywane.
 *
 * ODTWORZENIE: ../kopie-bazy/JAK-ODTWORZYC.txt (skrypt zapisuje go przy każdej kopii).
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const KATALOG = process.cwd();
const CEL = process.env.KOPIE_BAZY_KATALOG || resolve(KATALOG, "..", "kopie-bazy");
const ZOSTAW = 12;

function wczytajEnv(nazwa) {
  const p = resolve(KATALOG, nazwa);
  if (!existsSync(p)) return {};
  const out = {};
  for (const linia of readFileSync(p, "utf8").split(/\r?\n/)) {
    if (!linia.trim() || linia.trimStart().startsWith("#")) continue;
    const i = linia.indexOf("=");
    if (i !== -1) out[linia.slice(0, i).trim()] = linia.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function dziennik(tekst) {
  mkdirSync(CEL, { recursive: true });
  appendFileSync(join(CEL, "dziennik.txt"), `${new Date().toISOString()}  ${tekst}\n`);
}

function stop(tekst) {
  console.error(`\nKOPIA BAZY: ${tekst}\n`);
  dziennik(`BLAD: ${tekst}`);
  process.exit(1);
}

// pg_dump z PATH, z rozpakowanego archiwum w C:\Moje\narzedzia\pgsql (bez instalacji)
// albo z instalacji PostgreSQL w Program Files (najnowsza wersja).
function program(nazwa) {
  const wPath = spawnSync(process.platform === "win32" ? "where" : "which", [nazwa], { encoding: "utf8" });
  if (wPath.status === 0) return wPath.stdout.split(/\r?\n/)[0].trim();
  const archiwum = resolve(KATALOG, "..", "..", "narzedzia", "pgsql", "bin", `${nazwa}.exe`);
  if (existsSync(archiwum)) return archiwum;
  const baza = "C:\\Program Files\\PostgreSQL";
  if (existsSync(baza)) {
    const wersje = readdirSync(baza).filter((w) => /^\d+$/.test(w)).sort((a, b) => b - a);
    for (const w of wersje) {
      const p = join(baza, w, "bin", `${nazwa}.exe`);
      if (existsSync(p)) return p;
    }
  }
  stop(`nie znalazłem programu ${nazwa}. Rozpakuj archiwum PostgreSQL 17 (enterprisedb.com/download-postgresql-binaries) do C:\\Moje\\narzedzia, tak żeby był folder pgsql\\bin.`);
}

const surowy = process.env.SUPABASE_DB_URL || wczytajEnv(".env.deploy").SUPABASE_DB_URL;
if (!surowy) stop("brak SUPABASE_DB_URL w .env.deploy. Wklej tam adres „Session pooler” z panelu Supabase (Connect), z hasłem bazy.");
if (surowy.includes("[YOUR-PASSWORD]")) stop("w SUPABASE_DB_URL (.env.deploy) zamiast [YOUR-PASSWORD] wpisz hasło bazy, bez nawiasów.");

// Adres rozbierany ręcznie, nie przez new URL(): hasło wpisane z ręki bywa
// nie zakodowane (zawiera @) albo zostaje w nawiasach z szablonu [YOUR-PASSWORD]
// (test 25.10.2026). Hasło od serwera oddziela OSTATNIA @.
const dopasowanie = surowy.match(/^postgres(?:ql)?:\/\/(.+)@([^@/:]+)(?::(\d+))?\/([^?]*)/);
if (!dopasowanie) stop("SUPABASE_DB_URL nie wygląda na adres postgresql://użytkownik:hasło@serwer:5432/postgres.");
const [, dane, host, port = "5432", baza] = dopasowanie;
const dwukropek = dane.indexOf(":");
if (dwukropek === -1) stop("w SUPABASE_DB_URL brakuje hasła po nazwie użytkownika i dwukropku.");
let haslo = dane.slice(dwukropek + 1);
if (haslo.startsWith("[") && haslo.endsWith("]")) haslo = haslo.slice(1, -1);
if (/%[0-9A-Fa-f]{2}/.test(haslo)) haslo = decodeURIComponent(haslo);
if (port === "6543") stop("to adres Transaction pooler (port 6543); pg_dump potrzebuje Session pooler (port 5432).");

const srodowisko = {
  ...process.env,
  PGHOST: host,
  PGPORT: port,
  PGUSER: decodeURIComponent(dane.slice(0, dwukropek)),
  PGPASSWORD: haslo,
  PGDATABASE: baza || "postgres",
  PGSSLMODE: "require",
  PGCONNECT_TIMEOUT: "30",
};

const pgDump = program("pg_dump");
const pgRestore = program("pg_restore");

const dzien = new Date().toISOString().slice(0, 10);
const folder = join(CEL, dzien);
mkdirSync(folder, { recursive: true });

const PLIKI = [
  { plik: "public.dump", argumenty: ["--schema=public"] },
  {
    plik: "auth-storage.dump",
    argumenty: ["--data-only", "-t", "auth.users", "-t", "auth.identities", "-t", "storage.buckets", "-t", "storage.objects"],
  },
];

const podsumowanie = [];
for (const { plik, argumenty } of PLIKI) {
  const sciezka = join(folder, plik);
  const zrzut = spawnSync(pgDump, ["-Fc", "--no-owner", "--no-privileges", ...argumenty, "-f", sciezka], {
    env: srodowisko,
    encoding: "utf8",
  });
  if (zrzut.status !== 0) stop(`pg_dump (${plik}) się nie udał: ${(zrzut.stderr || "").trim().split(/\r?\n/).slice(-3).join(" | ")}`);

  // Sprawdzenie, że plik da się odczytać, i ile tabel ma dane.
  const spis = spawnSync(pgRestore, ["--list", sciezka], { encoding: "utf8" });
  if (spis.status !== 0) stop(`pg_restore --list nie odczytał ${plik}.`);
  const tabele = spis.stdout.split(/\r?\n/).filter((l) => / TABLE DATA /.test(l)).length;
  const mb = (statSync(sciezka).size / 1048576).toFixed(1);
  podsumowanie.push(`${plik} ${mb} MB, ${tabele} tabel z danymi`);
}

writeFileSync(
  join(CEL, "JAK-ODTWORZYC.txt"),
  [
    "Odtworzenie kopii bazy Moja Serowarnia (Supabase)",
    "",
    "Kopie robi scripts/kopia-bazy.mjs w repo mojaserowarnia. W każdym folderze RRRR-MM-DD:",
    "  public.dump        schemat i dane schematu public",
    "  auth-storage.dump  dane kont (auth.users, auth.identities) i opis plików Storage",
    "",
    "Do NOWEGO, pustego projektu Supabase (adres Session pooler w zmiennej DB):",
    '  pg_restore --no-owner --no-privileges -d "%DB%" public.dump',
    '  pg_restore --data-only --no-owner --disable-triggers -d "%DB%" auth-storage.dump',
    "",
    "Pojedyncza tabela do istniejącej bazy (np. po przypadkowym DELETE):",
    '  pg_restore --data-only --no-owner -t nazwa_tabeli -d "%DB%" public.dump',
    "",
    "Pliki zdjęć ze Storage nie są w kopii (tylko ich opis).",
    "Pliki zawierają dane osobowe i skróty haseł: nie wysyłać i nie wrzucać do repo.",
    "",
  ].join("\r\n"),
);

// Rotacja: tylko foldery z datą w nazwie, najstarsze idą pierwsze.
const kopie = readdirSync(CEL).filter((n) => /^\d{4}-\d{2}-\d{2}$/.test(n)).sort();
for (const stara of kopie.slice(0, Math.max(0, kopie.length - ZOSTAW))) {
  rmSync(join(CEL, stara), { recursive: true, force: true });
}

dziennik(`OK ${dzien}: ${podsumowanie.join("; ")}`);
console.log(`\nKopia bazy gotowa: ${folder}\n  ${podsumowanie.join("\n  ")}\n`);
