// Straznik przed commitem: patrzy na TRESC i na MIEJSCE, nie na nazwe pliku.
//
// PO CO TO POWSTALO (10 wrzesnia 2026)
// Marek wrzucil do katalogu projektu plik "Api supabase.txt", zeby sprawdzic,
// co sie stanie. Stalo sie to, czego sie obawial: `git status` pokazal go jako
// zwykly nowy plik do dodania. Repo jest publiczne, wiec jedno `git add .`
// wystarczyloby, zeby zawartosc wyladowala na GitHubie.
//
// Chwile wczesniej zamienilem w .gitignore wyliczanke szesciu nazw na wzorzec
// .env* i uznalem sprawe za zamknieta. Ten plik pokazal, ze sie mylilem.
//
// DRUGI TEST, POL GODZINY POZNIEJ, rozbroil pierwsza wersje tego straznika.
// Marek zalozyl katalog Moje/ i wlozyl do niego cztery pliki z adresem e-mail
// i numerem telefonu. Straznik przepuscil wszystkie cztery, bo:
//   - regula tresci znala tylko ksztalty KLUCZY API, a to byly DANE OSOBOWE;
//   - regula miejsca patrzyla tylko na KORZEN repo, a katalog jest o poziom nizej.
// Ta druga pomylka jest pouczajaca: napisalem liste dozwolonych nazw w korzeniu,
// czyli dokladnie te wyliczanke, ktora godzine wczesniej sam zdiagnozowalem jako
// wade .gitignore. Wyliczanka broni tylko tego, co ktos wczesniej pomyslal.
//
// STAD DZISIEJSZY KSZTALT
//  1. TRESC - KLUCZE. Znane ksztalty sekretow blokuja commit. Nazwa pliku nie
//     ma znaczenia: boty przeczesujace GitHuba tez jej nie czytaja.
//  2. TRESC - DANE OSOBOWE. Numery sprawdzane SUMA KONTROLNA (PESEL, karta,
//     konto), nie samym ksztaltem - inaczej kazdy plik z liczbami krzyczalby
//     falszywie i straznik szybko trafilby do ignorowanych. Przy adresach
//     e-mail blokujemy LISTE (trzy rozne adresy w jednym pliku), nie pojedynczy
//     adres: wizytowka serowarni ma prawo miec adres kontaktowy, a katastrofa
//     to lista subskrybentow, nie jeden kontakt do firmy.
//  3. MIEJSCE. Nowy plik w korzeniu ALBO nowy katalog najwyzszego poziomu spoza
//     obszarow projektu blokuje commit. Domyslnie odmawiamy, zamiast zgadywac
//     nazwy. To jedyna regula, ktora lapie losowy ciag bez rozpoznawalnego
//     ksztaltu - a wlasnie takie pliki powstaja "na chwile, zeby ich nie szukac".
//
// CZEGO TEN STRAZNIK NIE UMIE
// Nie rozpozna sekretu o nieznanym ksztalcie dopisanego do pliku, ktory juz jest
// w projekcie. Tego sie nie da bez zgadywania i dlatego regula 3 istnieje obok
// dwoch pierwszych, a nie zamiast nich. Sekrety maja mieszkac poza repozytorium
// albo w pliku objetym .gitignore - straznik to ostatnia siatka, nie pierwsza.

import { execFileSync } from 'node:child_process';

const git = (...a) =>
  execFileSync('git', a, { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });

// ── Regula 1: ksztalty kluczy ────────────────────────────────────────────────
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

// ── Regula 2: dane osobowe ───────────────────────────────────────────────────
// Domeny nieliczone do "listy adresow": nasze wlasne oraz te, ktorych uzywaja
// przyklady w formularzach i w dokumentacji.
const DOMENY_NIELICZONE =
  /@(mojaserowarnia\.pl|example\.(com|pl|org)|email\.pl|resend\.dev|twojadomena\.pl)$/i;
const PROG_LISTY_ADRESOW = 3;

/** PESEL: jedenascie cyfr i zgodna suma kontrolna. */
const czyPesel = (d) => {
  if (!/^[0-9]{11}$/.test(d)) return false;
  const w = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let s = 0;
  for (let i = 0; i < 10; i++) s += w[i] * Number(d[i]);
  return (10 - (s % 10)) % 10 === Number(d[10]);
};

/** Numer karty platniczej: algorytm Luhna. */
const czyKarta = (d) => {
  if (!/^[0-9]{13,19}$/.test(d)) return false;
  // Sam Luhn to za malo: znacznik czasu migracji 20260802140000 tez go
  // przechodzi. Prawdziwe numery zaczynaja sie od numeru wydawcy - Visa 4,
  // Mastercard 51-55 albo 2221-2720, Amex 34 i 37, Discover 6.
  const czworka = Number(d.slice(0, 4));
  const wydawca = /^4/.test(d) || /^5[1-5]/.test(d) || /^3[47]/.test(d) ||
    /^6/.test(d) || (czworka >= 2221 && czworka <= 2720);
  if (!wydawca) return false;
  let s = 0;
  let podwoj = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let c = Number(d[i]);
    if (podwoj) { c *= 2; if (c > 9) c -= 9; }
    s += c;
    podwoj = !podwoj;
  }
  return s % 10 === 0;
};

/** Polski numer konta: 26 cyfr, sprawdzane jak IBAN (reszta z dzielenia 97).
 *  "PL00" przeniesione na koniec to cyfry 2521 i dwa zera kontrolne. */
const czyKonto = (d) => {
  if (!/^[0-9]{26}$/.test(d)) return false;
  let r = 0;
  for (const c of d + '252100') r = (r * 10 + Number(c)) % 97;
  return r === 1;
};

// Numer musi stac SAMODZIELNIE. Dwa powody, oba zmierzone na tym repo:
//  - ciag przy kropce to czesc liczby dziesietnej - w 2055.4493307839384
//    trzynascie cyfr po przecinku przechodzi sume Luhna;
//  - ciag doklejony do liter to identyfikator - WDU20160000434 z odnosnika
//    do ustawy ma jedenascie cyfr zgodnych z suma kontrolna PESEL.
const luzem = (ile) =>
  new RegExp(`(?<![\\dA-Za-z.])[0-9]{${ile}}(?![\\dA-Za-z.])`, 'g');

const OSOBOWE = [
  [luzem('11'), czyPesel, 'numer o ksztalcie i sumie kontrolnej PESEL'],
  [luzem('13,19'), czyKarta, 'numer karty platniczej (suma Luhna sie zgadza)'],
  [luzem('26'), czyKonto, 'numer konta bankowego (suma kontrolna sie zgadza)'],
];

// ── Swiadome wyjatki ─────────────────────────────────────────────────────────
// Niektore klucze sa jawne z zalozenia - klucz IndexNow lezy pod
// https://mojaserowarnia.pl/<klucz>.txt, bo TAK dziala potwierdzenie wlasnosci
// domeny. Zamiast oslabiac wzorzec (co wylaczyloby ochrone we wszystkich innych
// plikach), dopuszczamy wyjatek w miejscu wystapienia: znacznik ponizej wraz
// z powodem, w linii trafienia albo w jednej z trzech poprzedzajacych.
const ZNACZNIK_JAWNY = /straznik:\s*jawny/i;

// ── Regula 3: miejsce ────────────────────────────────────────────────────────
// Obszary projektu. Wszystko poza nimi jest nowe i nieznane, wiec domyslnie
// odmawiamy - to jedyny uklad, ktory nie wymaga zgadywania nazw z gory.
const OBSZARY_PROJEKTU = new Set([
  '.claude', '.githooks', '.lovable', 'data', 'design', 'docs',
  'public', 'scripts', 'src', 'supabase', 'worker',
]);
const KORZEN_WOLNO = new Set([
  '.env.deploy.przyklad', '.gitattributes', '.gitignore', '.npmrc', '.nvmrc',
  '.prettierrc', '.editorconfig', 'CLAUDE.md', 'README.md', 'LICENSE',
  'bun.lock', 'components.json', 'eslint.config.js', 'index.html',
  'package-lock.json', 'package.json', 'postcss.config.js',
  'tailwind.config.ts', 'tsconfig.app.json', 'tsconfig.json',
  'tsconfig.node.json', 'vite.config.ts', 'wrangler.jsonc',
]);

const SAM_SIEBIE = '.githooks/straznik-sekretow.mjs';

const nazwy = (filtr) =>
  git('diff', '--cached', '--name-only', `--diff-filter=${filtr}`, '-z')
    .toString('utf8').split('\0').filter(Boolean);

const zarzuty = [];
const nrLinii = (t, i) => t.slice(0, i).split('\n').length;   // 1-indeksowany

for (const plik of nazwy('ACM')) {
  if (plik === SAM_SIEBIE) continue;           // straznik zawiera te wzorce
  let tresc;
  try { tresc = git('show', `:${plik}`); } catch { continue; }
  if (tresc.includes(0)) continue;             // plik binarny
  const tekst = tresc.toString('utf8');
  const wiersze = tekst.split('\n');
  // Znacznika szukamy w linii trafienia i w trzech poprzedzajacych: powod
  // wyjatku bywa dluzszy niz jedna linia i stoi wtedy na poczatku komentarza.
  const jawny = (nr) =>
    ZNACZNIK_JAWNY.test(wiersze.slice(Math.max(0, nr - 4), nr).join('\n'));

  let zarzut = null;

  // KAZDE wystapienie, nie tylko pierwsze: gdyby pierwsze bylo oznaczone jako
  // jawne, a drugie nie, sprawdzanie samego match() przepuscilo by to drugie.
  for (const [wz, opis] of KSZTALTY) {
    if (zarzut) break;
    for (const m of tekst.matchAll(new RegExp(wz.source, wz.flags + 'g'))) {
      const nr = nrLinii(tekst, m.index);
      if (jawny(nr)) continue;
      zarzut = `  ${plik}:${nr} - ${opis}`;
      break;
    }
  }

  for (const [wz, sprawdz, opis] of OSOBOWE) {
    if (zarzut) break;
    for (const m of tekst.matchAll(wz)) {
      if (!sprawdz(m[0])) continue;
      const nr = nrLinii(tekst, m.index);
      if (jawny(nr)) continue;
      zarzut = `  ${plik}:${nr} - ${opis}`;
      break;
    }
  }

  if (!zarzut) {
    const adresy = new Set(
      (tekst.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [])
        .map((a) => a.toLowerCase())
        .filter((a) => !DOMENY_NIELICZONE.test(a)),
    );
    if (adresy.size >= PROG_LISTY_ADRESOW) {
      zarzut = `  ${plik} - ${adresy.size} roznych adresow e-mail, to wyglada na LISTE`;
    }
  }

  if (zarzut) zarzuty.push(zarzut);
}

// Nowe pliki i katalogi poza obszarami projektu. Katalog zglaszamy raz, nie
// osobno dla kazdego pliku w srodku - inaczej wysyp czterech plikow daje
// cztery identyczne zarzuty i tresc komunikatu ginie.
const noweKatalogi = new Set();
for (const plik of nazwy('A')) {
  const glowa = plik.split('/')[0];
  if (plik.includes('/')) {
    if (!OBSZARY_PROJEKTU.has(glowa)) noweKatalogi.add(glowa);
  } else if (!KORZEN_WOLNO.has(glowa)) {
    zarzuty.push(`  ${glowa} - nowy plik w korzeniu repo, spoza plikow projektu`);
  }
}
for (const k of noweKatalogi) {
  zarzuty.push(`  ${k}/ - nowy katalog najwyzszego poziomu, spoza obszarow projektu`);
}

if (zarzuty.length === 0) process.exit(0);

process.stderr.write(
  '\n' +
  'COMMIT ZATRZYMANY. To repozytorium jest PUBLICZNE.\n' +
  '\n' +
  zarzuty.join('\n') + '\n' +
  '\n' +
  'Co zrobic:\n' +
  '  - sekret albo dane osobowe   -> wynies plik poza repo albo dopisz go do\n' +
  '                                  .gitignore, a wartosc trzymaj w zmiennej\n' +
  '                                  srodowiskowej;\n' +
  '  - klucz jawny z zalozenia    -> dopisz obok niego komentarz ze znacznikiem\n' +
  '    (jak klucz IndexNow)          "straznik: jawny" i powodem;\n' +
  '  - normalna czesc projektu    -> dopisz nazwe do KORZEN_WOLNO albo\n' +
  '                                  OBSZARY_PROJEKTU w tym pliku.\n' +
  '\n' +
  'Pominiecie strazy: git commit --no-verify\n' +
  'Rob to swiadomie. Raz wypchnietego sekretu nie da sie cofnac - historia\n' +
  'zostaje u kazdego, kto sklonowal repo, i w cache GitHuba.\n\n'
);
process.exit(1);
