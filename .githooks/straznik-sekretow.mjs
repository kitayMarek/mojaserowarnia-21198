// Straznik przed commitem: patrzy na TRESC, nie na nazwe pliku.
//
// PO CO TO POWSTALO (10 wrzesnia 2026)
// Marek wrzucil do katalogu projektu plik "Api supabase.txt", zeby sprawdzic,
// co sie stanie. Stalo sie to, czego sie obawial: `git status` pokazal go jako
// zwykly nowy plik do dodania. Repo jest publiczne, wiec jedno `git add .`
// wystarczyloby, zeby zawartosc wyladowala na GitHubie.
//
// Chwile wczesniej zamienilem w .gitignore wyliczanke szesciu nazw na wzorzec
// .env* i uznalem sprawe za zamknieta. Ten plik pokazal, ze sie mylilem:
// nazywal sie "Api supabase.txt" i przeszedl obok wzorca bez sladu.
//
// STAD ZASADA: nazwa pliku nie jest zabezpieczeniem. Boty przeczesujace
// GitHuba nie szukaja nazw, tylko ksztaltow kluczy w tresci - i tak samo
// dziala ten straznik.
//
// DWIE REGULY
//  1. TRESC. Znane ksztalty sekretow (JWT, sb_secret_, klucze prywatne,
//     tokeny GitHuba/AWS/Slacka/Resend) blokuja commit.
//  2. MIEJSCE. Nowy plik w KORZENIU repo, spoza listy plikow projektu, tez
//     blokuje commit. To lapie przypadek, ktorego regula 1 zlapac nie moze:
//     losowy ciag znakow bez rozpoznawalnego prefiksu. Takie pliki powstaja
//     wlasnie tam - w korzeniu, "zeby ich nie szukac".
//
// CZEGO TEN STRAZNIK NIE UMIE
// Nie rozpozna sekretu o nieznanym ksztalcie schowanego w glebi drzewa
// katalogow. Nie da sie tego zrobic bez zgadywania. Dlatego regula 2 istnieje
// obok reguly 1, a nie zamiast niej - i dlatego sekrety maja mieszkac poza
// repozytorium albo w pliku z .gitignore.

import { execFileSync } from 'node:child_process';

const git = (...a) =>
  execFileSync('git', a, { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });

const KSZTALTY = [
  [/eyJhbGciOi[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, 'token JWT (klucz Supabase albo podobny)'],
  [/sb_secret_[A-Za-z0-9_-]{10,}/, 'sekretny klucz Supabase (sb_secret_)'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'klucz prywatny'],
  [/\bre_[A-Za-z0-9]{24,}/, 'klucz Resend'],
  [/\b(ghp|gho|ghs|ghr)_[A-Za-z0-9]{30,}/, 'token GitHuba'],
  [/\bgithub_pat_[A-Za-z0-9_]{50,}/, 'token GitHuba (nowy format)'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'klucz AWS'],
  [/\bxox[baprs]-[A-Za-z0-9-]{15,}/, 'token Slacka'],
  [/(?:password|passwd|haslo|secret|sekret|api[_-]?key|klucz)\s*[:=]\s*["'][^"'\s]{20,}["']/i,
   'przypisanie dlugiej wartosci do pola typu haslo/klucz'],
];

// Pliki, ktore MOGA lezec w korzeniu. Wszystko inne nowe - do wyjasnienia.
const KORZEN_WOLNO = new Set([
  '.env.deploy.przyklad', '.gitattributes', '.gitignore', '.npmrc', '.nvmrc',
  '.prettierrc', '.editorconfig', 'CLAUDE.md', 'README.md', 'LICENSE',
  'bun.lock', 'components.json', 'eslint.config.js', 'index.html',
  'package-lock.json', 'package.json', 'postcss.config.js',
  'tailwind.config.ts', 'tsconfig.app.json', 'tsconfig.json',
  'tsconfig.node.json', 'vite.config.ts', 'wrangler.jsonc',
]);

const SAM_SIEBIE = '.githooks/straznik-sekretow.mjs';

// SWIADOMY WYJATEK. Niektore klucze sa jawne z zalozenia - klucz IndexNow
// lezy pod https://mojaserowarnia.pl/<klucz>.txt, bo TAK dziala potwierdzenie
// wlasnosci domeny. Zamiast oslabiac wzorzec (co wylaczyloby ochrone dla
// wszystkich innych plikow), dopuszczamy wyjatek w miejscu jego wystapienia:
// dopisz w tej samej albo poprzedniej linii znacznik ponizej wraz z powodem.
// Wyjatek trzeba wtedy uzasadnic tam, gdzie go widac przy czytaniu kodu.
const ZNACZNIK_JAWNY = /straznik:\s*jawny/i;

const nazwy = (filtr) =>
  git('diff', '--cached', '--name-only', `--diff-filter=${filtr}`, '-z')
    .toString('utf8').split('\0').filter(Boolean);

const zarzuty = [];

// ── Regula 1: tresc ──────────────────────────────────────────────────────────
for (const plik of nazwy('ACM')) {
  if (plik === SAM_SIEBIE) continue;           // straznik zawiera te wzorce
  let tresc;
  try { tresc = git('show', `:${plik}`); } catch { continue; }
  if (tresc.includes(0)) continue;             // plik binarny
  const tekst = tresc.toString('utf8');
  const wiersze = tekst.split('\n');
  // KAZDE wystapienie, nie tylko pierwsze. Gdyby pierwsze bylo oznaczone jako
  // jawne, a drugie nie, sprawdzanie samego match() przepuscilo by to drugie.
  szukaj:
  for (const [wz, opis] of KSZTALTY) {
    for (const m of tekst.matchAll(new RegExp(wz.source, wz.flags + 'g'))) {
      const nr = tekst.slice(0, m.index).split('\n').length;   // 1-indeksowany
      // Znacznika szukamy w linii trafienia i w trzech poprzedzajacych: powod
      // wyjatku bywa dluzszy niz jedna linia i wtedy "straznik: jawny" stoi
      // na poczatku kilkulinijkowego komentarza, nie tuz nad sama wartoscia.
      const kontekst = wiersze.slice(Math.max(0, nr - 4), nr).join('\n');
      if (ZNACZNIK_JAWNY.test(kontekst)) continue;  // wyjatek uzasadniony na miejscu
      zarzuty.push(`  ${plik}:${nr} - ${opis}`);
      break szukaj;                            // jeden zarzut na plik wystarczy
    }
  }
}

// ── Regula 2: nowy plik w korzeniu ───────────────────────────────────────────
for (const plik of nazwy('A')) {
  if (plik.includes('/') || KORZEN_WOLNO.has(plik)) continue;
  zarzuty.push(`  ${plik} - nowy plik w korzeniu repo, spoza listy plikow projektu`);
}

if (zarzuty.length === 0) process.exit(0);

process.stderr.write(
  '\n' +
  'COMMIT ZATRZYMANY. To repozytorium jest PUBLICZNE.\n' +
  '\n' +
  zarzuty.join('\n') + '\n' +
  '\n' +
  'Co zrobic:\n' +
  '  - sekret     -> wynies plik poza repo albo dopisz go do .gitignore,\n' +
  '                  a wartosc trzymaj w zmiennej srodowiskowej;\n' +
  '  - falszywy   -> dopisz nazwe do KORZEN_WOLNO w .githooks/straznik-sekretow.mjs\n' +
  '    alarm         (regula 2) albo przenies plik do podkatalogu.\n' +
  '\n' +
  'Pominiecie strazy: git commit --no-verify\n' +
  'Rob to swiadomie. Raz wypchnietego sekretu nie da sie cofnac - historia\n' +
  'zostaje u kazdego, kto sklonowal repo, i w cache GitHuba.\n\n'
);
process.exit(1);
