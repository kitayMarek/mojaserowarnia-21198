#!/usr/bin/env node
/**
 * Test zgodnosci serwera MCP z naszej strony: to, co widza katalogi (VerifyMCP,
 * rokmcp, Golemreach) i recenzenci katalogow lacznikow Anthropic i OpenAI.
 *
 * TYLKO ODCZYT. Kazde zapytanie ma w User-Agencie test-marek, wiec pomiar
 * (worker-magazyn/src/pomiar.js) liczy je jako ruch wlasny, i znacznik ?z=test-marek.
 * TEMPO: jedno zapytanie co 2,2 s, bo limit to 30 na minute z jednego adresu.
 * Bez zewnetrznych narzedzi: zwykly fetch i ajv, ktory jest juz w node_modules.
 *
 * UZYCIE:
 *   node scripts/test-zgodnosci-mcp.mjs                       # oba serwery
 *   node scripts/test-zgodnosci-mcp.mjs https://mojapasza.com/mcp
 *   node scripts/test-zgodnosci-mcp.mjs --zapisz ProjektyLLm/test-mcp/2026-10-26.json
 *
 * Porownanie przed i po zmianach: zapisz wynik do pliku przy obu przebiegach.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const DOMYSLNE = ['https://dane.mojaserowarnia.pl/mcp', 'https://mojapasza.com/mcp'];
const UA = 'test-zgodnosci-mcp/1.0 (test-marek)';
const PROTOKOL = '2026-07-28';
const ODSTEP_MS = 2200;
// VerifyMCP: „around 100 tokens per item for a lean pass”. Polski tekst tnie sie
// na tokeny gesciej niz angielski, wiec liczymy ostroznie: 3,2 znaku na token.
const ZNAKOW_NA_TOKEN = 3.2;
const BUDZET_NARZEDZIA = 300;
const DUZA_ODPOWIEDZ = 4000;

const argumenty = process.argv.slice(2);
const iZapisz = argumenty.indexOf('--zapisz');
const plikWyniku = iZapisz >= 0 ? argumenty[iZapisz + 1] : null;
const adresy = argumenty.filter((a, i) => a.startsWith('http') && (iZapisz < 0 || i !== iZapisz + 1));

const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);

let ostatnie = 0;
async function zapytaj(url, { method = 'POST', headers = {}, body } = {}) {
  const czekaj = ostatnie + ODSTEP_MS - Date.now();
  if (czekaj > 0) await new Promise((r) => setTimeout(r, czekaj));
  ostatnie = Date.now();
  const start = Date.now();
  const odp = await fetch(url, { method, headers: { 'user-agent': UA, ...headers }, body, redirect: 'manual' });
  const tekst = await odp.text();
  let json = null;
  const dane = tekst.split(/\r?\n/).filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim());
  try { json = JSON.parse(dane.length ? dane[dane.length - 1] : tekst); } catch { /* nie JSON */ }
  return { status: odp.status, naglowki: odp.headers, tekst, json, ms: Date.now() - start };
}

const tokeny = (t) => Math.round((typeof t === 'string' ? t : JSON.stringify(t)).length / ZNAKOW_NA_TOKEN);

/** Pierwsza wartosc pola `nazwa` w dowolnie zagniezdzonym wyniku narzedzia. */
function pierwszaNazwa(wynik) {
  if (!wynik || typeof wynik !== 'object') return null;
  if (typeof wynik.nazwa === 'string') return wynik.nazwa;
  for (const v of Object.values(wynik)) {
    const n = pierwszaNazwa(v);
    if (n) return n;
  }
  return null;
}

// Przykladowe wywolania. Funkcja dostaje wyniki wczesniejszych narzedzi, zeby
// karta kultury, przepisu i dodatku pytala o cos, co naprawde jest w bazie.
const PRZYKLADY = [
  ['o_bazie', () => ({})],
  ['szukaj_kultur', () => ({ zapytanie: 'mezofilna', limit: 3 })],
  ['kultura', (w) => ({ nazwa: pierwszaNazwa(w.szukaj_kultur) || 'Flora Danica' })],
  ['zamienniki', (w) => ({ nazwa: pierwszaNazwa(w.szukaj_kultur) || 'Flora Danica' })],
  ['szukaj_przepisow', () => ({ zapytanie: 'mozzarella', limit: 3 })],
  ['przepis', (w) => ({ nazwa: pierwszaNazwa(w.szukaj_przepisow) || 'mozzarella' })],
  ['skladniki_paszy', () => ({ zapytanie: 'pszenica', limit: 3 })],
  ['normy_drobiu', () => ({ drob: 'kury-nioski-lekkie', okres: 'powyżej 45' })],
  ['policz_mieszanke', () => ({
    drob: 'kury-nioski-lekkie', okres: 'powyżej 45',
    skladniki: [
      { nazwa: 'Pszenica', procent: 55 }, { nazwa: 'Kukurydza', procent: 15 },
      { nazwa: 'Śruta sojowa', procent: 20 }, { nazwa: 'Kreda pastewna', procent: 10 },
    ],
  })],
  ['dobierz_proporcje', () => ({
    drob: 'kury-nioski-lekkie', okres: 'powyżej 45',
    skladniki: [{ nazwa: 'Pszenica' }, { nazwa: 'Kukurydza' }, { nazwa: 'Śruta sojowa' }, { nazwa: 'Kreda pastewna' }],
  })],
  ['szukaj_dodatkow', () => ({ brakuje: 'fosfor', limit: 3 })],
  ['dodatek', (w) => ({ nazwa: pierwszaNazwa(w.szukaj_dodatkow) || 'Fosforan dwuwapniowy' })],
  ['zamienniki_dodatku', (w) => ({ nazwa: pierwszaNazwa(w.szukaj_dodatkow) || 'Fosforan dwuwapniowy' })],
];

async function testuj(adresBazowy) {
  const adres = `${adresBazowy}?z=test-marek`;
  const wyniki = [];
  const zapisz = (grupa, nazwa, ocena, uwaga, dane) => {
    wyniki.push({ grupa, nazwa, ocena, uwaga, ...(dane ? { dane } : {}) });
  };
  let id = 1;
  let wersja = PROTOKOL;
  const naglowkiMcp = () => ({
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream',
    'mcp-protocol-version': wersja,
  });
  const rpc = (method, params, dodatkowe = {}) => zapytaj(adres, {
    headers: { ...naglowkiMcp(), ...dodatkowe },
    body: JSON.stringify({ jsonrpc: '2.0', id: id++, method, ...(params !== undefined ? { params } : {}) }),
  });

  // ── Transport ────────────────────────────────────────────────────────────
  const init = await zapytaj(adres, {
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: id++, method: 'initialize',
      params: { protocolVersion: PROTOKOL, capabilities: {}, clientInfo: { name: 'test-zgodnosci-mcp', version: '1.0' } },
    }),
  });
  const r = init.json?.result;
  if (init.status !== 200 || !r) {
    zapisz('transport', 'initialize', 'BLAD', `status ${init.status}, bez wyniku`);
    return wyniki;
  }
  wersja = r.protocolVersion;
  zapisz('transport', 'initialize', 'OK', `${init.ms} ms, protokol ${r.protocolVersion}${r.protocolVersion === PROTOKOL ? ' (najnowszy)' : ` (prosilismy o ${PROTOKOL})`}`);
  zapisz('transport', 'serverInfo', r.serverInfo?.name && r.serverInfo?.version ? 'OK' : 'BLAD',
    `${r.serverInfo?.name} ${r.serverInfo?.version}${r.serverInfo?.title ? `, tytul: ${r.serverInfo.title}` : ', bez tytulu'}${r.serverInfo?.websiteUrl ? '' : ', bez websiteUrl'}`);
  zapisz('transport', 'capabilities', 'INFO', JSON.stringify(r.capabilities));
  const tokInstr = tokeny(r.instructions || '');
  zapisz('opisy', 'instructions', tokInstr > 1500 ? 'UWAGA' : 'OK', `ok. ${tokInstr} tokenow (${(r.instructions || '').length} znakow)`);

  const hsts = init.naglowki.get('strict-transport-security');
  zapisz('transport', 'HSTS', hsts ? 'OK' : 'BLAD', hsts || 'brak naglowka Strict-Transport-Security');
  const limit = init.naglowki.get('x-limit-na-minute');
  zapisz('transport', 'limit w naglowku', limit ? 'OK' : 'UWAGA', limit ? `x-limit-na-minute: ${limit}` : 'brak');
  zapisz('transport', 'sesja', init.naglowki.get('mcp-session-id') ? 'INFO' : 'OK',
    init.naglowki.get('mcp-session-id') ? 'serwer nadaje mcp-session-id' : 'bez sesji (serwer bezstanowy)');

  const powiad = await zapytaj(adres, {
    headers: naglowkiMcp(), body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
  });
  zapisz('transport', 'powiadomienie', powiad.status === 202 ? 'OK' : 'UWAGA', `notifications/initialized -> ${powiad.status} (oczekiwane 202)`);

  const ping = await rpc('ping');
  zapisz('transport', 'ping', ping.json?.result && Object.keys(ping.json.result).length === 0 ? 'OK' : 'BLAD', `-> ${ping.status} ${JSON.stringify(ping.json?.result)}`);

  const bezAccept = await zapytaj(adres, {
    headers: { 'content-type': 'application/json', 'mcp-protocol-version': wersja },
    body: JSON.stringify({ jsonrpc: '2.0', id: id++, method: 'ping' }),
  });
  zapisz('transport', 'brak Accept', bezAccept.status === 406 ? 'OK' : 'UWAGA', `-> ${bezAccept.status} (oczekiwane 406)`);

  const zlyTyp = await zapytaj(adres, {
    headers: { 'content-type': 'text/plain', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: id++, method: 'ping' }),
  });
  zapisz('transport', 'zly Content-Type', zlyTyp.status === 415 ? 'OK' : 'UWAGA', `-> ${zlyTyp.status} (oczekiwane 415)`);

  const get = await zapytaj(adres, { method: 'GET', headers: { accept: 'text/event-stream', 'mcp-protocol-version': wersja } });
  zapisz('transport', 'GET /mcp', get.status === 405 || get.naglowki.get('content-type')?.includes('event-stream') ? 'OK' : 'UWAGA',
    `-> ${get.status} (405 albo strumien SSE)`);

  const del = await zapytaj(adres, { method: 'DELETE', headers: { 'mcp-protocol-version': wersja } });
  zapisz('transport', 'DELETE /mcp', [200, 204, 405].includes(del.status) ? 'OK' : 'UWAGA', `-> ${del.status}`);

  const cors = await zapytaj(adres, {
    method: 'OPTIONS',
    headers: {
      origin: 'https://inspector.example', 'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type, mcp-protocol-version, authorization',
    },
  });
  const acao = cors.naglowki.get('access-control-allow-origin');
  const acah = (cors.naglowki.get('access-control-allow-headers') || '').toLowerCase();
  zapisz('transport', 'CORS', acao && acah.includes('mcp-protocol-version') && acah.includes('authorization') ? 'OK' : 'UWAGA',
    `-> ${cors.status}, allow-origin ${acao}, allow-headers ${acah || 'brak'}`);

  const zlyJson = await zapytaj(adres, { headers: naglowkiMcp(), body: '{"jsonrpc":"2.0","id":1,' });
  zapisz('bledy', 'zly JSON', zlyJson.json?.error?.code === -32700 ? 'OK' : 'UWAGA', `-> ${zlyJson.status}, kod ${zlyJson.json?.error?.code} (oczekiwane -32700)`);

  const nieznana = await rpc('nie/istnieje');
  zapisz('bledy', 'nieznana metoda', nieznana.json?.error?.code === -32601 ? 'OK' : 'UWAGA', `-> kod ${nieznana.json?.error?.code} (oczekiwane -32601)`);

  const zlaWersja = await rpc('ping', undefined, { 'mcp-protocol-version': '1999-01-01' });
  zapisz('transport', 'nieznana wersja protokolu', zlaWersja.status === 400 ? 'OK' : 'UWAGA', `naglowek 1999-01-01 -> ${zlaWersja.status} (zalecane 400)`);

  for (const metoda of ['resources/list', 'prompts/list']) {
    const odp = await rpc(metoda);
    const zadeklarowane = Boolean(r.capabilities?.[metoda.split('/')[0]]);
    const ok = zadeklarowane ? Boolean(odp.json?.result) : odp.json?.error?.code === -32601;
    zapisz('transport', metoda, ok ? 'OK' : 'UWAGA',
      `${zadeklarowane ? 'zadeklarowane' : 'niezadeklarowane'} -> ${odp.json?.error ? `blad ${odp.json.error.code}` : 'wynik'}`);
  }

  // ── Odkrywanie ───────────────────────────────────────────────────────────
  const korzen = new URL(adresBazowy).origin;
  for (const sciezka of ['/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource/mcp', '/.well-known/oauth-authorization-server']) {
    const odp = await zapytaj(korzen + sciezka, { method: 'GET', headers: { accept: 'application/json' } });
    const html = (odp.naglowki.get('content-type') || '').includes('html');
    zapisz('odkrywanie', sciezka, odp.status === 404 && !html ? 'OK' : 'UWAGA',
      `-> ${odp.status} ${odp.naglowki.get('content-type') || ''} (bez logowania oczekiwane 404, nie strona HTML)`);
  }
  for (const sciezka of [`${new URL(adresBazowy).pathname}/server-card`, '/.well-known/mcp/server-card.json', '/.well-known/ai-catalog.json']) {
    const odp = await zapytaj(korzen + sciezka, { method: 'GET', headers: { accept: 'application/json' } });
    const karta = odp.json;
    const pola = karta ? ['name', 'version', 'description', 'remotes'].filter((p) => !(p in karta)) : null;
    // 200 ze strona HTML to gorsze niz 404: klient dostaje „jest”, a potem nie umie tego odczytac.
    const html = (odp.naglowki.get('content-type') || '').includes('html');
    const ocena = odp.status === 200 && karta && (!sciezka.includes('card') || pola.length === 0) ? 'OK'
      : odp.status === 200 && html ? 'UWAGA' : 'INFO';
    zapisz('odkrywanie', sciezka, ocena,
      `-> ${odp.status}${html ? ' strona HTML zamiast JSON' : ''}${karta && sciezka.includes('card') ? (pola.length ? `, brak pol: ${pola.join(', ')}` : `, ${karta.name} ${karta.version}`) : ''}`);
  }

  // ── Narzedzia: lista, schematy, opisy ───────────────────────────────────
  const lista = await rpc('tools/list');
  const narzedzia = lista.json?.result?.tools || [];
  zapisz('narzedzia', 'tools/list', narzedzia.length ? 'OK' : 'BLAD', `${narzedzia.length} narzedzi, ${lista.ms} ms, nextCursor: ${lista.json?.result?.nextCursor ?? 'brak'}`);
  let suma = 0;
  const walidatory = {};
  for (const t of narzedzia) {
    const braki = [];
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(t.name)) braki.push('nazwa poza [a-zA-Z0-9_-]{1,64}');
    if (!t.title && !t.annotations?.title) braki.push('bez tytulu');
    if (!t.description || t.description.length < 40) braki.push('opis krotszy niz 40 znakow');
    const a = t.annotations || {};
    for (const h of ['readOnlyHint', 'destructiveHint', 'idempotentHint', 'openWorldHint']) if (!(h in a)) braki.push(`bez ${h}`);
    const s = t.inputSchema || {};
    if (s.type !== 'object') braki.push('inputSchema nie jest typu object');
    const props = s.properties || {};
    const bezOpisu = Object.entries(props).filter(([, v]) => !v.description).map(([k]) => k);
    if (bezOpisu.length) braki.push(`parametry bez opisu: ${bezOpisu.join(', ')}`);
    for (const wym of s.required || []) if (!(wym in props)) braki.push(`wymagany ${wym} nie istnieje`);
    try { walidatory[t.name] = ajv.compile(s); } catch (e) { braki.push(`schemat sie nie kompiluje: ${e.message}`); }
    if (t.outputSchema) {
      try { walidatory[`${t.name}:wynik`] = ajv.compile(t.outputSchema); } catch (e) { braki.push(`outputSchema sie nie kompiluje: ${e.message}`); }
    }
    const przyklad = /Przyk[lł]ad|Example|np\. \{|"arguments"/.test(t.description || '');
    const tok = tokeny(t);
    suma += tok;
    const uwagi = [
      `ok. ${tok} tok.`,
      t.outputSchema ? 'outputSchema jest' : 'bez outputSchema',
      przyklad ? 'przyklad w opisie' : 'bez przykladu',
      ...braki,
    ];
    zapisz('narzedzia', t.name, braki.length ? 'BLAD' : (tok > BUDZET_NARZEDZIA || !przyklad ? 'UWAGA' : 'OK'), uwagi.join('; '));
  }
  zapisz('opisy', 'definicje narzedzi razem', suma > narzedzia.length * BUDZET_NARZEDZIA ? 'UWAGA' : 'OK',
    `ok. ${suma} tokenow na ${narzedzia.length} narzedzi (srednio ${Math.round(suma / Math.max(1, narzedzia.length))})`);

  // ── Wywolania ───────────────────────────────────────────────────────────
  const dostepne = new Set(narzedzia.map((t) => t.name));
  const wynikiNarzedzi = {};
  for (const [nazwa, budujArgumenty] of PRZYKLADY) {
    if (!dostepne.has(nazwa)) continue;
    const args = budujArgumenty(wynikiNarzedzi);
    if (walidatory[nazwa] && !walidatory[nazwa](args)) {
      zapisz('wywolania', nazwa, 'INFO', `przyklad testu nie pasuje do schematu: ${ajv.errorsText(walidatory[nazwa].errors)}`);
      continue;
    }
    const odp = await rpc('tools/call', { name: nazwa, arguments: args });
    const wynik = odp.json?.result;
    const problemy = [];
    if (odp.json?.error) problemy.push(`blad JSON-RPC ${odp.json.error.code}: ${odp.json.error.message}`);
    if (wynik?.isError) problemy.push(`isError: ${wynik.content?.[0]?.text?.slice(0, 120)}`);
    const tekst = wynik?.content?.find((c) => c.type === 'text')?.text;
    let dane = null;
    try { dane = JSON.parse(tekst); } catch { if (wynik && !wynik.isError) problemy.push('tresc nie jest JSON-em'); }
    if (wynik && !wynik.structuredContent) problemy.push('bez structuredContent');
    if (walidatory[`${nazwa}:wynik`] && wynik?.structuredContent && !walidatory[`${nazwa}:wynik`](wynik.structuredContent)) {
      problemy.push(`structuredContent niezgodny z outputSchema: ${ajv.errorsText(walidatory[`${nazwa}:wynik`].errors).slice(0, 150)}`);
    }
    wynikiNarzedzi[nazwa] = dane;
    const tok = tekst ? tokeny(tekst) : 0;
    zapisz('wywolania', nazwa, problemy.length ? 'BLAD' : (tok > DUZA_ODPOWIEDZ || odp.ms > 3000 ? 'UWAGA' : 'OK'),
      [`${odp.ms} ms`, `odpowiedz ok. ${tok} tok.`, ...problemy].join('; '), { argumenty: args });
  }

  // ── Obsluga bledow narzedzi ─────────────────────────────────────────────
  // Spec MCP (SEP-1303): blad danych wejsciowych ma wracac jako wynik z isError,
  // a nie blad protokolu, zeby model mogl poprawic wywolanie sam.
  const przypadki = [
    ['nieznane narzedzie', 'nie_istnieje', {}],
    ['brak wymaganego parametru', 'kultura', {}],
    ['zly typ parametru', 'szukaj_kultur', { limit: 'duzo' }],
    ['wartosc spoza listy', 'normy_drobiu', { drob: 'strusie' }],
    ['nieistniejacy wpis', 'kultura', { nazwa: 'xyz-nie-istnieje-123' }],
  ];
  for (const [opis, nazwa, args] of przypadki) {
    if (nazwa !== 'nie_istnieje' && !dostepne.has(nazwa)) continue;
    const odp = await rpc('tools/call', { name: nazwa, arguments: args });
    const e = odp.json?.error;
    const w = odp.json?.result;
    const tresc = e ? `blad JSON-RPC ${e.code}: ${String(e.message).slice(0, 140)}`
      : w?.isError ? `isError: ${String(w.content?.[0]?.text).slice(0, 140)}`
        : `wynik bez isError: ${String(w?.content?.[0]?.text).slice(0, 140)}`;
    let ocena = 'INFO';
    if (opis === 'nieznane narzedzie') ocena = e?.code === -32602 || w?.isError ? 'OK' : 'UWAGA';
    else if (opis === 'nieistniejacy wpis') ocena = odp.status === 200 ? 'OK' : 'BLAD';
    else ocena = w?.isError ? 'OK' : 'UWAGA';
    zapisz('bledy', opis, ocena, `${nazwa} ${JSON.stringify(args)} -> ${tresc}`);
  }
  return wyniki;
}

const raport = {};
for (const adres of adresy.length ? adresy : DOMYSLNE) {
  console.log(`\n=== ${adres} ===`);
  const wyniki = await testuj(adres);
  raport[adres] = wyniki;
  let grupa = '';
  for (const w of wyniki) {
    if (w.grupa !== grupa) { grupa = w.grupa; console.log(`\n[${grupa}]`); }
    console.log(`  ${w.ocena.padEnd(5)} ${w.nazwa}: ${w.uwaga}`);
  }
  const licz = (o) => wyniki.filter((w) => w.ocena === o).length;
  console.log(`\n  razem: OK ${licz('OK')}, UWAGA ${licz('UWAGA')}, BLAD ${licz('BLAD')}, INFO ${licz('INFO')}`);
}
if (plikWyniku) {
  mkdirSync(dirname(plikWyniku), { recursive: true });
  writeFileSync(plikWyniku, JSON.stringify({ data: new Date().toISOString(), raport }, null, 2));
  console.log(`\nZapisane: ${plikWyniku}`);
}
