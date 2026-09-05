/**
 * Sprawdza, że nowa reguła 1d workera nie zjada żadnej prawdziwej trasy.
 *
 * Regexy NIE są tu przepisane — skrypt wyciąga je z worker/index.js i wykonuje
 * dokładnie te literały, które pojedą na produkcję. Kopia rozjechałaby się przy
 * pierwszej zmianie i test zaczął by potwierdzać sam siebie.
 *
 *   node scripts/test-sciezki-skanera.mjs
 */
import { readFileSync } from 'node:fs';

const zrodlo = readFileSync(new URL('../worker/index.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

function wyjmijRegex(nazwa) {
  const m = zrodlo.match(new RegExp(`const ${nazwa}\\s*=\\s*(/.+?/i);`, 's'));
  if (!m) throw new Error(`nie znaleziono ${nazwa} w worker/index.js`);
  return eval(m[1]);
}

const SCIEZKA_SKANERA = wyjmijRegex('SCIEZKA_SKANERA');
const ROZSZERZENIE_OBCE = wyjmijRegex('ROZSZERZENIE_OBCE');

const blokowana = (p) => SCIEZKA_SKANERA.test(p) || ROZSZERZENIE_OBCE.test(p);

let bledy = 0;
const zle = (msg) => { console.error('  ✗ ' + msg); bledy++; };

// --- 1. ŻADNA prawdziwa trasa nie może zostać zablokowana --------------------
const trasy = [...app.matchAll(/path="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((p) => p !== '*');

console.log(`Tras w App.tsx: ${trasy.length}`);
for (const t of trasy) {
  const probka = t.replace(/:(\w+)/g, 'przykladowy-slug');
  const p = probka.startsWith('/') ? probka : '/' + probka;
  if (blokowana(p)) zle(`trasa React zablokowana: ${p}`);
}

// --- 2. Realne slugi, które mogłyby przypadkiem pasować ----------------------
for (const p of [
  '/serowarnie/mleczarnia-example.pl',      // slug bywa nazwą domeny
  '/serowarnie/folwark-pod-lasem',
  '/przepisy/ser-typu-gouda',
  '/przepisy-kulinarne/zapiekanka-z-serem',
  '/admin', '/admin/news', '/admin/statystyki-llm',
  '/kultury/mezofilne', '/prawo/mol/dokumenty', '/pasze', '/narzedzia',
  '/sery-wege', '/baza-kultur', '/slownik', '/kalkulator-pasz-bydlo',
]) {
  if (blokowana(p)) zle(`prawdziwy adres zablokowany: ${p}`);
}

// --- 3. Pliki, które serwis faktycznie serwuje -------------------------------
for (const p of [
  '/robots.txt', '/sitemap.xml', '/llms.txt', '/favicon.ico',
  '/assets/index-abc123.js', '/assets/index-abc123.css',
  '/przepisy/mozzarella.html', '/index-mirror.html', '/manifest.json',
  '/.well-known/security.txt',
]) {
  if (blokowana(p)) zle(`zasób serwisu zablokowany: ${p}`);
}

// --- 4. To MA być blokowane --------------------------------------------------
const skany = [
  '/wp-login.php', '/wp-admin/', '/wp-admin/setup-config.php',
  '/wp-content/plugins/x.php', '/wp-includes/wlwmanifest.xml', '/wp-json/wp/v2/users',
  '/xmlrpc.php', '/graphql', '/graphiql', '/actuator/health', '/actuator/env',
  '/laravel/.env', '/vendor/phpunit/phpunit/phpunit.xml', '/phpmyadmin/index.php',
  '/adminer.php', '/administrator/index.php', '/cgi-bin/test.cgi',
  '/telescope/requests', '/_ignition/execute-solution', '/_profiler/phpinfo',
  '/server-status', '/backup.sql', '/dump.sql', '/database.sqlite',
  '/config.yml', '/settings.ini', '/app.log', '/site.tar.gz', '/backup.zip.bak',
  '/index.php', '/main.jsp', '/default.aspx', '/shell.py',
];
for (const p of skany) {
  if (!blokowana(p)) zle(`skan NIE zablokowany: ${p}`);
}

// --- 5. Czego reguła 1d NIE łapie, a i tak kończy się 404 --------------------
// SCIEZKA_SKANERA wymaga po nazwie katalogu ukośnika albo końca ścieżki, więc
// /backup.zip do niej nie pasuje. To nie jest dziura: .zip jest w
// ROZSZERZENIE_PLIKU, czyli łapie je krok 4 i też oddaje prawdziwe 404.
// Asercja pilnuje, żeby przy skracaniu którejkolwiek listy nie wypadło z obu.
const ROZSZERZENIE_PLIKU = wyjmijRegex('ROZSZERZENIE_PLIKU');
for (const p of ['/backup.zip', '/dump.json', '/config.json', '/.env']) {
  const kropkowa = /\/\.[^/]/.test(p);
  if (!blokowana(p) && !ROZSZERZENIE_PLIKU.test(p) && !kropkowa) {
    zle(`${p} nie trafia w żadną regułę 404 — spadnie do skorupy React z 200`);
  }
}

console.log(bledy === 0
  ? `\n✓ ${trasy.length} tras + ${skany.length} wzorców skanu — bez kolizji`
  : `\n✗ ${bledy} problemów`);
process.exit(bledy === 0 ? 0 : 1);
