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

function opisSerwera(origin) {
  return `Moja Serowarnia: serwer MCP bazy kultur bakteryjnych do sera (wersja testowa)

Adres dla klienta MCP: ${origin}${SCIEZKA_MCP}
Narzędzia: szukaj_kultur, kultura, zamienniki, o_bazie. Tylko odczyt, bez klucza, z limitem zapytań.
Dane: te same co na https://mojaserowarnia.pl/baza-kultur, licencja CC BY 4.0 (cytując, podaj źródło z linkiem).
`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/robots.txt') {
      return tekst('User-agent: *\nDisallow: /\n');
    }

    if (url.pathname === '/' && (request.method === 'GET' || request.method === 'HEAD')) {
      return tekst(opisSerwera(url.origin));
    }

    if (url.pathname !== SCIEZKA_MCP) {
      return tekst('Nie ma takiego adresu. Serwer MCP jest pod /mcp.\n', 404);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...CORS, ...NAGLOWKI_WSPOLNE } });
    }

    const opis = await opisWywolania(request);

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
