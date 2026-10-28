/**
 * dane.mojaserowarnia.pl: serwer MCP bazy kultur i przepisów ("magazyn"); ten sam kod buduje mojapasza.com/mcp.
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
 * kazda odpowiedz ma x-robots-tag: noindex. robots.txt zamyka tylko /mcp:
 * strona glowna z opisem i instrukcja podlaczenia ma byc czytelna dla
 * pobieraczy czatow, ktore otwieraja adres na prosbe uzytkownika. Do 27.10.2026
 * stalo tu „Disallow: /” i Perplexity, nie mogac otworzyc strony, ostrzegala
 * przed oszustwem. Noindex dalej trzyma strone poza wynikami wyszukiwania.
 * Klienci MCP robots.txt nie czytaja, wiec zakaz /mcp ich nie dotyczy.
 */

import { createMcpHandler } from '@modelcontextprotocol/server';
import { WERSJA, listaNarzedzi, zbudujSerwer } from './serwer.js';
import { opisWywolania, opisPobrania, zliczWywolanie, zrodloZAdresu } from './pomiar.js';
import { oBazie } from './kultury.js';
import { SCIEZKA_KARTY, SCIEZKA_KATALOGU, kartaSerwera, katalogAi, odpowiedzOdkrywania } from './odkrywanie.js';
import { SERWIS } from './serwis.js';

const SCIEZKA_MCP = '/mcp';

// Kanał w ścieżce (od 26.10.2026, plan przenosin pasz): /mcp/claude, /mcp/chatgpt-wtyczka...
// Katalogi i Plugin Creator w ChatGPT wycinają parametry z adresu, ścieżka zostaje.
// Serwer odpowiada tak samo jak pod /mcp, a kanał idzie do pomiaru jako źródło,
// gdy adres nie ma ?z=.
const KANALY = new Set(['claude', 'chatgpt', 'claude-wtyczka', 'chatgpt-wtyczka', 'perplexity']);

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
  'access-control-expose-headers': 'mcp-session-id, mcp-protocol-version, x-limit-na-minute',
  'access-control-max-age': '86400',
};

// Linki do mojaserowarnia.pl w odpowiedziach narzedzi maja utm_source=magazyn.
// Ze znacznikiem z adresu lacznika (?z=asystent-jana) dopisujemy utm_campaign,
// zeby licznik wejsc widzial, ktora aplikacja przyslala kogos na strone
// („Magazyn: asystent-jana”, worker/wizyty-botow.js). Od 25.10.2026, obietnica
// z wyzwania dla tworcow aplikacji. Znacznik jest juz oczyszczony w zrodloZAdresu
// (a-z, 0-9, / _ -), wiec nie psuje ani JSON-a, ani adresu. Linki do sklepow
// (utm_source=mojaserowarnia) zostaja bez zmian.
const ZNACZNIK_LINKOW = 'utm_source=magazyn';

async function zZnacznikiemAplikacji(odpowiedz, zrodlo) {
  if (!zrodlo || !odpowiedz.body) return odpowiedz.body;
  const tresc = await odpowiedz.text();
  return tresc.replaceAll(ZNACZNIK_LINKOW, `${ZNACZNIK_LINKOW}&utm_campaign=${encodeURIComponent(zrodlo)}`);
}

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

/**
 * Klucze aplikacji (od 25.10.2026, /warunki-mcp#aplikacje): darmowy klucz na prosbe
 * daje 300 zapytan na minute zamiast 30 z adresu, bo aplikacja pyta ze swojego
 * serwera, czyli z jednego adresu dla wszystkich uzytkownikow. Klucz to nie dostep:
 * bez niego serwer odpowiada tak samo, tylko z nizszym limitem. Zly klucz = jak
 * bez klucza, zeby przypadkowy naglowek nie wylaczyl komus serwera.
 * Sekret KLUCZE_APLIKACJI: JSON {"klucz": "nazwa-aplikacji"}, dodaje go
 * scripts/klucz-aplikacji.mjs. Naglowek Authorization: Bearer <klucz> albo
 * ?klucz= dla programow, ktore nie pozwalaja dopisac naglowka.
 */
const LIMIT_Z_ADRESU = 30;
const LIMIT_Z_KLUCZEM = 300;

function aplikacjaZKlucza(request, env) {
  if (!env.KLUCZE_APLIKACJI) return null;
  let klucze;
  try {
    klucze = JSON.parse(env.KLUCZE_APLIKACJI);
  } catch {
    return null;
  }
  const naglowek = request.headers.get('authorization') || '';
  const klucz = naglowek.match(/^Bearer\s+(\S+)$/i)?.[1] || new URL(request.url).searchParams.get('klucz') || '';
  return klucz && Object.hasOwn(klucze, klucz) ? klucze[klucz] : null;
}

/** true = wolno. Brak wiazania (np. inny tryb uruchomienia) nie blokuje serwera. */
async function wLimicie(env, request, aplikacja) {
  if (env.LIMIT_CALOSC) {
    const { success } = await env.LIMIT_CALOSC.limit({ key: 'calosc' });
    if (!success) return false;
  }
  if (aplikacja) {
    if (!env.LIMIT_KLUCZ) return true;
    const { success } = await env.LIMIT_KLUCZ.limit({ key: aplikacja });
    return success;
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
  <h1>Serwer MCP: kultury i przepisy na sery</h1>
  <p class="podpis">Moja Serowarnia, wersja ${WERSJA}</p>
  <p>To nie jest strona do czytania, tylko adres dla asystentów AI, takich jak Claude, ChatGPT czy Perplexity. Asystent po podłączeniu sam przeszukuje bazę ${baza.pozycji} kultur z ${baza.sklepow} polskich sklepów i przepisy na sery.</p>
  <p>Kalkulator pasz dla drobiu i baza dodatków paszowych mają własny serwis i łącznik: <a href="https://mojapasza.com/asystenci-ai?utm_source=magazyn">mojapasza.com/mcp</a>.</p>

  <h2>Adres do wklejenia</h2>
  <code class="adres">${adres}</code>

  <h2>Jak podłączyć w Claude.ai</h2>
  <p><a class="przycisk" href="${dodajDoClaude}" rel="nofollow noopener">Otwórz łączniki w Claude</a></p>
  <ol>
    <li>Na stronie łączników kliknij + Add, potem Add custom connector (w menu: Customize, zakładka Connectors).</li>
    <li>W polu Name wpisz „Moja Serowarnia”, w polu MCP server URL wklej adres z ramki wyżej i kliknij Continue, a potem Add. Logowanie ani klucz nie są potrzebne.</li>
    <li>Zapytaj na przykład: „jaka kultura do camemberta i czym ją zastąpić” albo „jak zrobić twaróg i jaką kulturę kupić”.</li>
  </ol>
  <p>Krok po kroku: <a href="https://mojaserowarnia.pl/asystenci-ai?utm_source=magazyn">mojaserowarnia.pl/asystenci-ai</a>.</p>
  <p>W Claude Code (Claude w terminalu) jedno polecenie:</p>
  <code class="adres">claude mcp add --transport http serowarnia https://dane.mojaserowarnia.pl${SCIEZKA_MCP}</code>
  <h2>Jak podłączyć w ChatGPT</h2>
  <ol>
    <li>Otwórz <a href="https://chatgpt.com/plugins" rel="nofollow noopener">wtyczki w ChatGPT</a> i kliknij Dodaj w prawym górnym rogu (obok koła zębatego), potem Dodaj niestandardowy serwer MCP.</li>
    <li>Wpisz nazwę „Moja Serowarnia”, wklej adres z ramki wyżej, uwierzytelnianie: brak. Potwierdź ostrzeżenie i utwórz wtyczkę.</li>
    <li>Na liście Osobiste kliknij + przy Moja Serowarnia, potem pytaj w zwykłej rozmowie.</li>
  </ol>
  <p>U nas zadziałało też na darmowym koncie. Jeśli nie widzisz opcji niestandardowego serwera MCP, Twój plan ChatGPT jej nie ma.</p>
  <p>W Perplexity dodaj umiejętność „moja-serowarnia” i pytaj w trybie Computer: <a href="https://mojaserowarnia.pl/asystenci-ai?utm_source=magazyn#perplexity">instrukcja</a>. Inne programy obsługujące MCP (Claude Desktop, Cursor) przyjmują ten sam adres.</p>

  <h2>Co potrafi</h2>
  <ul>
${listaNarzedzi().map((n) => `    <li><code>${n.nazwa}</code>: ${n.tytul}</li>`).join('\n')}
  </ul>

  <p><small>Tylko odczyt, bez klucza, do 30 zapytań na minutę (aplikacje z darmowym kluczem do 300: <a href="https://mojaserowarnia.pl/warunki-mcp?utm_source=magazyn#aplikacje">zasady</a>). Ceny kultur ze stron sklepów, sprawdzone od ${baza.ceny_sprawdzone_od}. Dane: <a href="https://mojaserowarnia.pl/baza-kultur?utm_source=magazyn">baza kultur</a> Moja Serowarnia, licencja CC BY 4.0. Serwer nie zapisuje adresu IP ani treści pytań: <a href="https://mojaserowarnia.pl/nota-prawna?utm_source=magazyn#serwer-mcp">prywatność</a>, <a href="https://mojaserowarnia.pl/warunki-mcp?utm_source=magazyn">warunki korzystania</a>.</small></p>
</main>
</body>
</html>
`;
}

const opisSerwera = (origin) => stronaOpisu(origin);

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
      return tekst('User-agent: *\nDisallow: /mcp\n');
    }

    if (url.pathname === '/' && (request.method === 'GET' || request.method === 'HEAD')) {
      return html(opisSerwera(url.origin));
    }

    // Karta serwera i katalog AI (odkrywanie.js). Liczone w pomiarze jako
    // "(karta)" i "(katalog)", zeby bylo widac, czy ktos w ogole po nie siega.
    if (url.pathname === SCIEZKA_KARTY || url.pathname === SCIEZKA_KATALOGU) {
      const karta = url.pathname === SCIEZKA_KARTY;
      if (!(await wLimicie(env, request))) {
        return tekst('Za dużo zapytań. Spróbuj ponownie za minutę.\n', 429, { 'retry-after': '60' });
      }
      const odpowiedz = await odpowiedzOdkrywania(
        request,
        karta ? kartaSerwera() : katalogAi(),
        karta ? 'application/mcp-server-card+json' : 'application/ai-catalog+json',
      );
      if (request.method === 'GET') {
        ctx.waitUntil(zliczWywolanie(env, await opisPobrania(request, env, karta ? '(karta)' : '(katalog)'), odpowiedz.status));
      }
      return odpowiedz;
    }

    const kanal = url.pathname.startsWith(`${SCIEZKA_MCP}/`) && KANALY.has(url.pathname.slice(SCIEZKA_MCP.length + 1))
      ? url.pathname.slice(SCIEZKA_MCP.length + 1)
      : '';
    if (url.pathname !== SCIEZKA_MCP && !kanal) {
      return tekst('Nie ma takiego adresu. Serwer MCP jest pod /mcp.\n', 404);
    }

    if (toPrzegladarka(request)) {
      return html(opisSerwera(url.origin));
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...CORS, ...NAGLOWKI_WSPOLNE } });
    }

    const opis = await opisWywolania(request, env);
    const aplikacja = aplikacjaZKlucza(request, env);
    // Aplikacja z kluczem, ale bez ?z=: jej wywolania i klikniecia licza sie pod nazwa z klucza.
    const zrodlo = zrodloZAdresu(request) || kanal || aplikacja || '';
    if (opis && !opis.zrodlo && (kanal || aplikacja)) opis.zrodlo = kanal || aplikacja;
    const limitNaMinute = String(aplikacja ? LIMIT_Z_KLUCZEM : LIMIT_Z_ADRESU);

    if (!(await wLimicie(env, request, aplikacja))) {
      ctx.waitUntil(zliczWywolanie(env, opis, 429));
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32000,
            message: aplikacja
              ? 'Za dużo zapytań. Spróbuj ponownie za minutę.'
              : `Za dużo zapytań. Spróbuj ponownie za minutę. Aplikacja potrzebuje więcej? Darmowy klucz: ${SERWIS.warunki}#aplikacje`,
          },
        }),
        {
          status: 429,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'retry-after': '60',
            'x-limit-na-minute': limitNaMinute,
            ...CORS,
            ...NAGLOWKI_WSPOLNE,
          },
        },
      );
    }

    // Pod ścieżką kanału to samo zapytanie co pod /mcp.
    const odpowiedz = await mcp.fetch(kanal ? new Request(new URL(`${SCIEZKA_MCP}${url.search}`, url.origin), request) : request);
    ctx.waitUntil(zliczWywolanie(env, opis, odpowiedz.status));

    const naglowki = new Headers(odpowiedz.headers);
    for (const [k, v] of Object.entries({ ...CORS, ...NAGLOWKI_WSPOLNE })) naglowki.set(k, v);
    naglowki.set('cache-control', 'no-store');
    naglowki.set('x-limit-na-minute', limitNaMinute);
    // Tresc moze zmienic dlugosc po dopisaniu znacznika.
    naglowki.delete('content-length');
    const tresc = await zZnacznikiemAplikacji(odpowiedz, zrodlo);
    return new Response(tresc, { status: odpowiedz.status, headers: naglowki });
  },
};
