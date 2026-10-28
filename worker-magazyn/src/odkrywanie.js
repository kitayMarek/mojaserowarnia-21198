/**
 * Odkrywanie serwera bez recznego wpisywania adresu (21.10.2026).
 *
 * KARTA SERWERA (MCP Server Card, SEP-2127, status Final): statyczny opis
 * serwera pod <adres-mcp>/server-card, czyli /mcp/server-card. Klient, ktory
 * zna tylko domene, czyta katalog AI (/.well-known/ai-catalog.json), stamtad
 * idzie do karty, a z karty bierze adres i transport. Karta celowo NIE zawiera
 * listy narzedzi: tak stanowi specyfikacja, narzedzia klient pobiera na zywo.
 *
 * Ten sam katalog lezy tez na mojaserowarnia.pl (public/.well-known/), bo tam
 * trafiaja agenci szukajacy po domenie serwisu, a nie po subdomenie.
 *
 * Nazwa pl.mojaserowarnia/baza-kultur to ta sama nazwa, pod ktora serwer jest
 * w oficjalnym rejestrze MCP (worker-magazyn/server.json). Wersja idzie
 * z serwer.js, wiec karta i serwer nie moga sie rozjechac.
 *
 * Format i naglowki: modelcontextprotocol/experimental-ext-server-card,
 * docs/discovery.md (CORS otwarty, cache na godzine, ETag z 304).
 */
import { WERSJA, TYTUL_SERWERA } from './serwer.js';
import { SERWIS } from './serwis.js';

export const SCIEZKA_KARTY = '/mcp/server-card';
export const SCIEZKA_KATALOGU = '/.well-known/ai-catalog.json';
export const NAZWA_W_REJESTRZE = 'pl.mojaserowarnia/baza-kultur';

// Do 100 znakow: tyle przyjmuje rejestr MCP, a opis ma byc ten sam wszedzie.
export const OPIS = 'Przepisy na sery i baza kultur z polskich sklepów (ceny, zamienniki).';

const ADRES_SERWERA = SERWIS.adresMcp;

const NAGLOWKI_ODKRYWANIA = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET',
  'access-control-allow-headers': 'Content-Type, If-None-Match',
  'access-control-expose-headers': 'ETag',
  'cache-control': 'public, max-age=3600',
  'x-robots-tag': 'noindex, nofollow',
};

export function kartaSerwera() {
  return {
    $schema: 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
    name: NAZWA_W_REJESTRZE,
    version: WERSJA,
    title: TYTUL_SERWERA,
    description: OPIS,
    websiteUrl: SERWIS.instrukcja,
    remotes: [{ type: 'streamable-http', url: ADRES_SERWERA }],
  };
}

export function katalogAi() {
  return {
    specVersion: '1.0',
    entries: [
      {
        identifier: 'urn:air:mojaserowarnia.pl:mcp:baza-kultur',
        type: 'application/mcp-server-card+json',
        url: `${new URL(ADRES_SERWERA).origin}${SCIEZKA_KARTY}`,
      },
    ],
  };
}

async function etag(tresc) {
  const skrot = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tresc));
  return '"' + [...new Uint8Array(skrot).slice(0, 16)].map((b) => b.toString(16).padStart(2, '0')).join('') + '"';
}

/** Odpowiedz z dokumentem odkrywania: ETag, 304 przy If-None-Match, OPTIONS dla CORS. */
export async function odpowiedzOdkrywania(request, dokument, typ) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: NAGLOWKI_ODKRYWANIA });
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Tylko GET.\n', { status: 405, headers: { allow: 'GET, HEAD, OPTIONS', ...NAGLOWKI_ODKRYWANIA } });
  }
  const tresc = JSON.stringify(dokument, null, 2) + '\n';
  const znacznik = await etag(tresc);
  const naglowki = { ...NAGLOWKI_ODKRYWANIA, etag: znacznik, 'content-type': `${typ}; charset=utf-8` };
  if (request.headers.get('if-none-match') === znacznik) {
    return new Response(null, { status: 304, headers: naglowki });
  }
  return new Response(request.method === 'HEAD' ? null : tresc, { headers: naglowki });
}
