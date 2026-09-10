// Spis projektu - co jest w katalogu i co sie zmieniło od ostatniego sprawdzenia.
//
// PO CO TO POWSTALO (10 wrzesnia 2026, pomysl Marka)
// Tego dnia trzy razy z rzedu okazalo sie, ze zabezpieczenie oparte na
// WYMIENIANIU groznych rzeczy broni tylko tego, co ktos wczesniej pomyslal:
// wyliczanka nazw w .gitignore przepuscila .envStary, wzorzec .env* przepuscil
// plik "Api supabase.txt", a straznik przed commitem przepuscil caly katalog
// Moje/, bo patrzyl wylacznie na korzen repo.
//
// Marek odwrocil pytanie: skoro projekt buduje maszyna, to KAZDA zmiana, ktorej
// maszyna nie zrobila, jest z definicji podejrzana - i nie trzeba wiedziec, co
// to za plik, zeby to zauwazyc. Wystarczy znac stan poprzedni i porownac.
//
// To jest biala lista zamiast czarnej i dlatego jest kompletna: nowy plik
// zostanie zauwazony niezaleznie od nazwy, miejsca, rozmiaru i zawartosci.
//
// DLACZEGO SKROT, A NIE SAM ROZMIAR
// Marek proponowal liczyc pliki, katalogi i rozmiary. Liczby maja dwie dziury:
// usuniecie jednego pliku i dodanie drugiego daje te sama liczbe, a podmiana
// tresci w miejscu daje ten sam rozmiar. Skrot kosztuje tyle samo i zamyka obie.
//
// DLACZEGO NIE POWTARZAMY TEGO, CO ROBI GIT
// Dla plikow SLEDZONYCH i NIESLEDZONYCH git juz liczy skroty i pokazuje roznice
// w `git status`. Martwym punktem sa pliki IGNOROWANE - i wlasnie tam mieszkaja
// rzeczy prywatne: Moje/, .env, export/, ProjektyLLm/. Spis obejmuje wiec cale
// drzewo, a raport dzieli znaleziska wedlug tego, co git widzi sam.
//
// CZEGO SPIS NIE UMIE
// Nie powie, KTO zmienil - tylko ZE sie zmienilo. Dlatego dziala w parze
// z rozmowa: przy starcie sesji Claude uruchamia spis, a jesli cokolwiek doszlo,
// pyta Marka, co to jest, zanim ruszy dalej. Nie jest tez zabezpieczeniem przed
// kims, kto ma dostep do tego dysku - plik spisu lezy obok projektu i da sie go
// podmienic. To wykrywacz pomylek, nie zamek.
//
// UZYCIE
//   npm run spis              - porownaj z ostatnim spisem
//   npm run spis -- --zapisz  - przyjmij obecny stan jako poprawny

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const KORZEN = process.cwd();
const PLIK_SPISU = join(KORZEN, '.spis-projektu.json');

// Katalogi WYTWARZANE, nie pisane recznie. Ich zawartosc zmienia sie przy
// kazdym build i install, wiec w spisie bylyby czystym szumem. To jedyna
// wyliczanka w tym pliku i jest bezpieczna, bo wymienia NASZE wytwory,
// a nie cudze zagrozenia - pomylka moze co najwyzej dodac szumu.
const WYTWARZANE = new Set([
  '.git', 'node_modules', 'dist', '.wrangler', '__pycache__', '.vite',
]);

const skrot = (bufor) => createHash('sha256').update(bufor).digest('hex').slice(0, 16);

const ludzko = (b) =>
  b < 1024 ? `${b} B`
    : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} kB`
      : `${(b / 1024 / 1024).toFixed(1)} MB`;

/** Przechodzi drzewo i zwraca mape sciezka -> { rozmiar, skrot }. */
function zbierz(katalog, wynik = new Map(), katalogi = new Set()) {
  for (const wpis of readdirSync(katalog, { withFileTypes: true })) {
    if (wpis.isDirectory() && WYTWARZANE.has(wpis.name)) continue;
    const pelna = join(katalog, wpis.name);
    if (wpis.isDirectory()) {
      katalogi.add(relative(KORZEN, pelna).replaceAll('\\', '/'));
      zbierz(pelna, wynik, katalogi);
    } else if (wpis.isFile()) {
      if (pelna === PLIK_SPISU) continue;      // spis nie liczy sam siebie
      let bufor;
      try { bufor = readFileSync(pelna); } catch { continue; }   // np. plik zajety
      wynik.set(relative(KORZEN, pelna).replaceAll('\\', '/'),
        { rozmiar: bufor.length, skrot: skrot(bufor) });
    }
  }
  return { pliki: wynik, katalogi };
}

/** Zbior sciezek, ktore git widzi sam - zeby nie dublowac jego pracy. */
function widzianePrzezGita() {
  const wolaj = (...a) => {
    try {
      return execFileSync('git', a, { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 })
        .toString('utf8').split('\0').filter(Boolean);
    } catch { return []; }
  };
  return new Set([
    ...wolaj('ls-files', '-z'),
    ...wolaj('status', '--porcelain', '-z', '--untracked-files=all')
      .map((w) => w.slice(3)),        // pierwsze trzy znaki to kod stanu
  ]);
}

const zapisz = process.argv.includes('--zapisz');
const { pliki, katalogi } = zbierz(KORZEN);
const suma = [...pliki.values()].reduce((s, p) => s + p.rozmiar, 0);

const teraz = {
  // Czas LOKALNY, nie UTC: ten napis czyta czlowiek i porownuje go z tym, co
  // pamieta, ze robil. Przesuniecie o dwie godziny myli bardziej, niz pomaga.
  data: new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }),
  katalogow: katalogi.size,
  plikow: pliki.size,
  bajtow: suma,
  wpisy: Object.fromEntries([...pliki].sort((a, b) => a[0].localeCompare(b[0]))),
};

if (zapisz || !existsSync(PLIK_SPISU)) {
  writeFileSync(PLIK_SPISU, JSON.stringify(teraz, null, 0) + '\n');
  const pierwszy = !zapisz;
  console.log(pierwszy
    ? '\nSPIS ZALOZONY (nie bylo poprzedniego - nie ma z czym porownac)\n'
    : '\nSPIS ZAPISANY - obecny stan przyjety jako poprawny\n');
  console.log(`  katalogow: ${teraz.katalogow}`);
  console.log(`  plikow:    ${teraz.plikow}`);
  console.log(`  lacznie:   ${ludzko(teraz.bajtow)}\n`);
  process.exit(0);
}

const stary = JSON.parse(readFileSync(PLIK_SPISU, 'utf8'));
const byly = new Map(Object.entries(stary.wpisy));

const nowe = [], zniknely = [], zmienione = [];
for (const [sciezka, dane] of pliki) {
  const b = byly.get(sciezka);
  if (!b) nowe.push([sciezka, dane]);
  else if (b.skrot !== dane.skrot) zmienione.push([sciezka, b, dane]);
}
for (const [sciezka, dane] of byly) if (!pliki.has(sciezka)) zniknely.push([sciezka, dane]);

const roznica = (a, b) => (a === b ? 'bez zmian' : (a > b ? `+${a - b}` : `${a - b}`));

console.log(`\nSPIS PROJEKTU   (poprzedni: ${stary.data})\n`);
console.log(`  katalogow: ${String(teraz.katalogow).padStart(5)}   ${roznica(teraz.katalogow, stary.katalogow)}`);
const zmianaBajtow = teraz.bajtow - stary.bajtow;
const opisBajtow = zmianaBajtow === 0 ? 'bez zmian'
  : (zmianaBajtow > 0 ? '+' : '-') + ludzko(Math.abs(zmianaBajtow));
console.log(`  plikow:    ${String(teraz.plikow).padStart(5)}   ${roznica(teraz.plikow, stary.plikow)}`);
console.log(`  lacznie:   ${ludzko(teraz.bajtow).padStart(9)}   ${opisBajtow}`);

if (!nowe.length && !zniknely.length && !zmienione.length) {
  console.log('\n  Nic sie nie zmienilo.\n');
  process.exit(0);
}

// Podzial wedlug tego, czy git widzi plik sam. Rzeczy NIEWIDOCZNE dla gita sa
// wazniejsze: to one wchodza do projektu po cichu, bez sladu w `git status`.
const widziane = widzianePrzezGita();
const wypisz = (tytul, lista, formatuj) => {
  if (!lista.length) return;
  const ukryte = lista.filter(([s]) => !widziane.has(s));
  const jawne = lista.filter(([s]) => widziane.has(s));
  console.log(`\n${tytul} (${lista.length})`);
  for (const w of ukryte) console.log('  ! ' + formatuj(w) + '   <- git tego nie pokazuje');
  for (const w of jawne) console.log('    ' + formatuj(w));
};

wypisz('NOWE', nowe, ([s, d]) => `${s}   ${ludzko(d.rozmiar)}`);
wypisz('ZNIKNELY', zniknely, ([s, d]) => `${s}   bylo ${ludzko(d.rozmiar)}`);
wypisz('ZMIENIONE', zmienione,
  ([s, b, d]) => `${s}   ${ludzko(b.rozmiar)} -> ${ludzko(d.rozmiar)}`);

console.log('\nJesli czegos z tego nie zrobil Claude - zapytaj, zanim to zostanie.');
console.log('Gdy stan jest poprawny: npm run spis -- --zapisz\n');
process.exit(1);
