/**
 * dane.mojaserowarnia.pl: serwer MCP bazy kultur ("magazyn"), wersja testowa.
 *
 * ROWNOLEGLY DO SERWISU. Osobny Worker, osobna subdomena, osobne wdrozenie.
 * worker/index.js obsluguje tylko mojaserowarnia.pl i www, wiec tutaj nie
 * trafia nic z ruchu strony, a wywolania MCP nie pojawiaja sie w bot_visits.
 * Projekt i decyzje: side-session-notes/.../mcp-baza-kultur-plan.md
 * (Marek zatwierdzil 21.10.2026: bez klucza, cztery narzedzia, pomiar w Supabase).
 *
 * DOSTEP NA CZAS TESTU: bez klucza i bez OAuth (wariant A2). Te same dane leza
 * otwarte w mirrorach /kultury/, wiec klucz niczego by nie chronil, a w tescie
 * "czy ktos w ogole to podlaczy" tylko by odstraszal. Przed naduzyciem chronia
 * dwa limity nizej.
 *
 * SEO: subdomena nie moze stac sie w Google duplikatem bazy kultur, wiec
 * robots.txt zabrania wszystkiego, a kazda odpowiedz ma x-robots-tag: noindex.
 * Klienci MCP robots.txt nie czytaja, wiec zakaz ich nie dotyczy.
 */

import { createMcpHandler } from '@modelcontextprotocol/server';
import { zbudujSerwer } from './serwer.js';
import { opisWywolania, zliczWywolanie } from './pomiar.js';
import { oBazie } from './kultury.js';

const SCIEZKA_MCP = '/mcp';

// Fabryka, nie gotowy serwer: w trybie bezstanowym kazde zadanie dostaje
// swieza instancje. responseMode 'json' = bez strumieni SSE tam, gdzie klient
// pozwala wybrac; narzedzia nie wysylaja niczego przed wynikiem, wiec nic nie ginie.
const mcp = createMcpHandler(() => zbudujSerwer(), {
  responseMode: 'json',
  maxRequestBodySize: 64 * 1024,
});

const NAGLOWKI_WSPOLNE = {
  'x-robots-tag': 'noindex, nofollow',
};

// Dane sa publiczne i bez ciasteczek, wiec CORS moze byc otwarty. Potrzebny
// tylko klientom z przegladarki (np. MCP Inspector w trybie bezposrednim);
// Claude.ai i ChatGPT lacza sie z serwera.
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, GET, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, authorization, mcp-protocol-version, mcp-session-id, last-event-id',
  'access-control-expose-headers': 'mcp-session-id, mcp-protocol-version',
  'access-control-max-age': '86400',
};

function tekst(tresc, status = 200, dodatkowe = {}) {
  return new Response(tresc, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8', ...NAGLOWKI_WSPOLNE, ...dodatkowe },
  });
}

/**
 * Klucz limitu z adresu IP: skrot, ktory zyje tylko w liczniku Rate Limiting
 * i nigdzie nie jest zapisywany. Bez klucza API nie ma lepszej tozsamosci;
 * dokumentacja odradza IP, bo wiele osob moze dzielic jeden adres, ale przy
 * 30 wywolaniach na minute to nie jest realny problem.
 */
async function kluczAdresu(request) {
  const ip = request.headers.get('cf-connecting-ip') || 'lokalnie';
  const skrot = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return [...new Uint8Array(skrot).slice(0, 12)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** true = wolno. Brak wiazania (np. inny tryb uruchomienia) nie blokuje serwera. */
async function wLimicie(env, request) {
  if (env.LIMIT_CALOSC) {
    const { success } = await env.LIMIT_CALOSC.limit({ key: 'calosc' });
    if (!success) return false;
  }
  if (env.LIMIT_ADRES) {
    const { success } = await env.LIMIT_ADRES.limit({ key: await kluczAdresu(request) });
    if (!success) return false;
  }
  return true;
}

/**
 * Strona dla czlowieka, ktory wpisal adres w przegladarce. Pokazywana pod "/"
 * i pod /mcp, gdy przegladarka prosi o HTML. Bez tego Marek 21.10.2026 dostal
 * pod /mcp surowe 405 i wzial to za blad serwera. Klienci MCP wysylaja Accept
 * z application/json albo text/event-stream, wiec tej strony nie zobacza.
 */
function stronaOpisu(origin) {
  const baza = oBazie();
  const adres = `${origin}${SCIEZKA_MCP}`;
  // Ten sam link co przycisk na mojaserowarnia.pl/asystenci-ai. Otwiera laczniki
  // w Claude.ai; okno z wpisana nazwa i adresem pojawia sie tylko czasem (z aplikacji
  // Claude parametry gina, 21.10.2026), wiec instrukcja zaklada wklejenie adresu.
  // Adres na sztywno, nie z origin: wrangler dev podaje http://, a Claude
  // przyjmuje tylko https i i tak nie siegnie do lokalnego serwera.
  const dodajDoClaude = 'https://claude.ai/customize/connectors?modal=add-custom-connector'
    + '&amp;connectorName=Moja%20Serowarnia&amp;connectorUrl='
    + encodeURIComponent(`https://dane.mojaserowarnia.pl${SCIEZKA_MCP}`);
  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Serwer MCP Moja Serowarnia</title>
<style>
  :root { --tlo: #fbf8f3; --tekst: #2b2620; --slabszy: #6b6257; --akcent: #b45309; --ramka: #e7dfd3; --kod: #f3ede4; }
  @media (prefers-color-scheme: dark) {
    :root { --tlo: #1c1915; --tekst: #ece6dc; --slabszy: #a89e90; --akcent: #f0a35c; --ramka: #3a342c; --kod: #2a251f; }
  }
  body { margin: 0; background: var(--tlo); color: var(--tekst); font: 17px/1.6 Georgia, "Times New Roman", serif; }
  main { max-width: 40rem; margin: 0 auto; padding: 2.5rem 1rem 3rem; }
  h1 { font-size: 1.6rem; line-height: 1.25; margin: 0 0 .5rem; }
  h2 { font-size: 1.1rem; margin: 2rem 0 .5rem; }
  .podpis { color: var(--slabszy); margin-top: 0; }
  code { background: var(--kod); border: 1px solid var(--ramka); border-radius: 4px; padding: .1rem .35rem; font-size: .95em; }
  .adres { display: block; padding: .7rem .8rem; font-size: 1rem; overflow-wrap: anywhere; }
  a { color: var(--akcent); }
  .przycisk { display: inline-block; background: var(--akcent); color: var(--tlo); font: 600 1rem/1 system-ui, sans-serif; text-decoration: none; padding: .75rem 1.2rem; border-radius: 6px; }
  small { color: var(--slabszy); }
</style>
</head>
<body>
<main>
  <h1>Serwer MCP: baza kultur i kalkulator pasz</h1>
  <p class="podpis">Moja Serowarnia, wersja testowa</p>
  <p>To nie jest strona do czytania, tylko adres dla asystentów AI, takich jak Claude czy ChatGPT. Asystent po podłączeniu sam przeszukuje bazę ${baza.pozycji} kultur z ${baza.sklepow} polskich sklepów i liczy mieszanki paszowe dla drobiu według tych samych norm co kalkulator pasz na stronie.</p>

  <h2>Adres do wklejenia</h2>
  <code class="adres">${adres}</code>

  <h2>Jak podłączyć w Claude.ai</h2>
  <p><a class="przycisk" href="${dodajDoClaude}" rel="nofollow noopener">Otwórz łączniki w Claude</a></p>
  <ol>
    <li>Na stronie łączników kliknij + Add, potem Add custom connector (w menu: Customize, zakładka Connectors).</li>
    <li>W polu Name wpisz „Moja Serowarnia”, w polu MCP server URL wklej adres z ramki wyżej i kliknij Continue, a potem Add. Logowanie ani klucz nie są potrzebne.</li>
    <li>Zapytaj na przykład: „jaka kultura do camemberta i czym ją zastąpić” albo „zrób paszę dla kur niosek z pszenicy, kukurydzy, śruty sojowej i kredy”.</li>
  </ol>
  <p>Krok po kroku: <a href="https://mojaserowarnia.pl/asystenci-ai?utm_source=magazyn">mojaserowarnia.pl/asystenci-ai</a>.</p>
  <p>W Claude Code (Claude w terminalu) jedno polecenie:</p>
  <code class="adres">claude mcp add --transport http serowarnia https://dane.mojaserowarnia.pl${SCIEZKA_MCP}</code>
  <p>W ChatGPT własne łączniki działają w trybie dewelopera na planach płatnych. Inne programy obsługujące MCP (Claude Desktop, Cursor) przyjmują ten sam adres.</p>

  <h2>Co potrafi</h2>
  <ul>
    <li><code>szukaj_kultur</code>: kultury do danego sera albo zastosowania, z filtrem typu, temperatury i sklepu, także od najtańszej za litr mleka.</li>
    <li><code>kultura</code>: pełna karta jednej kultury po nazwie z opakowania.</li>
    <li><code>zamienniki</code>: kultury o tym samym składzie gatunkowym.</li>
    <li><code>o_bazie</code>: co jest w bazie i jak cytować.</li>
    <li><code>skladniki_paszy</code>: 124 surowce paszowe z energią, białkiem, minerałami i aminokwasami.</li>
    <li><code>normy_drobiu</code>: normy dla kur niosek, brojlerów, kaczek, gęsi i indyków.</li>
    <li><code>policz_mieszanke</code>: skład podanej mieszanki wobec normy, czego za mało i za dużo.</li>
    <li><code>dobierz_proporcje</code>: proporcje z podanych surowców pod normę albo najtańsza mieszanka.</li>
  </ul>

  <p><small>Tylko odczyt, bez klucza, do 30 zapytań na minutę. Ceny kultur ze stron sklepów, sprawdzone od ${baza.ceny_sprawdzone_od}. Wyniki paszowe to obliczenie na danych wzorcowych, nie porada lekarza weterynarii. Dane: <a href="https://mojaserowarnia.pl/baza-kultur?utm_source=magazyn">baza kultur</a> i <a href="https://mojaserowarnia.pl/kalkulator-pasz?utm_source=magazyn">kalkulator pasz</a> Moja Serowarnia, licencja CC BY 4.0.</small></p>
</main>
</body>
</html>
`;
}

function html(tresc) {
  return new Response(tresc, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache', ...NAGLOWKI_WSPOLNE },
  });
}

/** Przegladarka prosi o HTML; klient MCP o JSON albo strumien zdarzen. */
function toPrzegladarka(request) {
  const accept = request.headers.get('accept') || '';
  return (request.method === 'GET' || request.method === 'HEAD')
    && accept.includes('text/html') && !accept.includes('text/event-stream');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/robots.txt') {
      return tekst('User-agent: *\nDisallow: /\n');
    }

    if (url.pathname === '/' && (request.method === 'GET' || request.method === 'HEAD')) {
      return html(stronaOpisu(url.origin));
    }

    if (url.pathname !== SCIEZKA_MCP) {
      return tekst('Nie ma takiego adresu. Serwer MCP jest pod /mcp.\n', 404);
    }

    if (toPrzegladarka(request)) {
      return html(stronaOpisu(url.origin));
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...CORS, ...NAGLOWKI_WSPOLNE } });
    }

    const opis = await opisWywolania(request, env);

    if (!(await wLimicie(env, request))) {
      ctx.waitUntil(zliczWywolanie(env, opis, 429));
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32000, message: 'Za dużo zapytań. Spróbuj ponownie za minutę.' },
        }),
        {
          status: 429,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'retry-after': '60',
            ...CORS,
            ...NAGLOWKI_WSPOLNE,
          },
        },
      );
    }

    const odpowiedz = await mcp.fetch(request);
    ctx.waitUntil(zliczWywolanie(env, opis, odpowiedz.status));

    const naglowki = new Headers(odpowiedz.headers);
    for (const [k, v] of Object.entries({ ...CORS, ...NAGLOWKI_WSPOLNE })) naglowki.set(k, v);
    naglowki.set('cache-control', 'no-store');
    return new Response(odpowiedz.body, { status: odpowiedz.status, headers: naglowki });
  },
};
