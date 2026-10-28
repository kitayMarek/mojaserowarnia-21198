/**
 * mojapasza.com: Worker przed plikami aplikacji z pasze/dist.
 *
 *  1. www.mojapasza.com -> mojapasza.com (301), jeden adres serwisu.
 *  2. /mcp i /mcp/* -> łącznik MCP z narzędziami paszowymi: osobny Worker
 *     „mojapasza-mcp” (worker-magazyn/wrangler-pasze.jsonc) przez wiązanie usług.
 *  3. Mirrory dla botów (pasze/public/mirror/) pod adresami stron, tym samym botom
 *     co w Serowarni: boty podglądu linków, crawlery modeli i zapytania bez nagłówków
 *     przeglądarki, czyli także Googlebot i Bingbot (od 7.09.2026 tak samo
 *     w Serowarni; tam mirror zbudował pozycję kalkulatora w Google). Rozpoznanie
 *     importowane z worker/index.js, żeby oba serwisy nie rozjechały się.
 *     Sam katalog /mirror/ nie jest adresem dla nikogo: 301 na stronę.
 *  4. Licznik wejść ludzi (worker/wejscia-ludzi.js) z serwisem mojapasza.com
 *     i licznik botów (worker/wizyty-botow.js) do tabeli bot_visits_pasze.
 *  5. Do dnia przełączenia nagłówek X-Robots-Tag: noindex na każdej odpowiedzi
 *     (stała NOINDEX niżej), także na JS i obrazkach, których meta w index.html
 *     nie obejmuje.
 * Resztę (adresy aplikacji, powrót do index.html, strony statyczne pod adresem
 * bez .html) robi warstwa plików (pasze/wrangler.jsonc).
 *
 * Plan: dokument „Pasze: wydzielenie na osobną domenę” w Claude Docs, zakładka
 * „Przełączenie jak najszybciej (25.10)”.
 */
import { BOTY_MODELI, BOTY_PODGLADU, botBezPodpisu } from '../../worker/index.js';
import { zapiszWejscieCzlowieka } from '../../worker/wejscia-ludzi.js';
import { zapiszWizyteBota } from '../../worker/wizyty-botow.js';

const DOMENA = 'mojapasza.com';

// Przełączenie 28.10.2026: serwis otwarty dla wyszukiwarek (robots.txt z pasze/public,
// bez X-Robots-Tag). true = z powrotem zakaz indeksowania, jak w czasie budowy.
const NOINDEX = false;

// Strony aplikacji z mirrorem w pasze/public/mirror/. Do 28.10.2026 kopie mirrorów Serowarni,
// od przełączenia źródło: poradniki z scripts/gen-mirror-porady-pasz.mts, tabela surowców
// z scripts/gen-pasz-mirror.py, reszta edytowana wprost w plikach.
const Z_MIRROREM = new Set([
  '/',
  '/bydlo',
  '/poradnik',
  '/poradnik/udzial-surowcow',
  '/poradnik/kury-nie-niosa',
  '/poradnik/resztki-z-kuchni',
  // Pisany ręcznie, nie ze skryptu (strona tylko na mojapasza).
  '/asystenci-ai',
]);

const plikMirrora = (sciezka) => (sciezka === '/' ? '/mirror/index.html' : `/mirror${sciezka}.html`);

// Odpowiedzi z mirrorem: licznik botów zapisuje, czy bot dostał pełną treść, czy skorupę aplikacji.
const ODDANE_MIRRORY = new WeakSet();

// Strony tylko statyczne (bez trasy w aplikacji), dla ludzi i botów: plik <ścieżka>.html.
const STATYCZNE = new Set(['/prywatnosc', '/warunki']);

// Ścieżki stron pasz z Serowarni (linki w treści, stare zakładki) -> adresy mojapasza.
// Ta sama mapa co 301 w workerze Serowarni i trasy <Na> w pasze/src/App.tsx.
const STARE_SCIEZKI = {
  '/kalkulator-pasz': '/',
  '/kalkulator-pasza': '/',
  '/kalkulator-pasz-bydlo': '/bydlo',
  '/pasze': '/poradnik',
  '/pasze/udzial-surowcow': '/poradnik/udzial-surowcow',
  '/pasze/kury-nie-niosa': '/poradnik/kury-nie-niosa',
  '/pasze/resztki-z-kuchni': '/poradnik/resztki-z-kuchni',
};

function zNaglowkami(odpowiedz, dodatkowe = {}) {
  const naglowki = new Headers(odpowiedz.headers);
  for (const [k, v] of Object.entries(dodatkowe)) naglowki.set(k, v);
  if (NOINDEX) naglowki.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(odpowiedz.body, { status: odpowiedz.status, statusText: odpowiedz.statusText, headers: naglowki });
}

async function trasuj(request, env, url) {
  const sciezka = url.pathname;

  // pasze/public/robots.txt to wersja po przełączeniu; do tego czasu zakaz dla wszystkich.
  if (sciezka === '/robots.txt' && NOINDEX) {
    return zNaglowkami(new Response('User-agent: *\nDisallow: /\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } }));
  }

  // Łącznik MCP ma własne nagłówki (noindex, CORS) i własny pomiar.
  if (sciezka === '/mcp' || sciezka.startsWith('/mcp/')) {
    if (!env.MCP) return { mcp: new Response('Łącznik MCP nie jest podpięty.\n', { status: 503 }) };
    return { mcp: await env.MCP.fetch(request) };
  }

  // Pliki mirrorów nie mają być osobnymi adresami (duplikaty stron w wyszukiwarce).
  if (sciezka.startsWith('/mirror/')) {
    const cel = sciezka.replace(/^\/mirror/, '').replace(/\.html$/, '').replace(/^\/index$/, '/') || '/';
    return Response.redirect(`${url.origin}${cel}${url.search}`, 301);
  }

  // Jeden adres strony: bez końcowego ukośnika i bez .html.
  if (sciezka.length > 1 && sciezka.endsWith('/')) {
    return Response.redirect(`${url.origin}${sciezka.replace(/\/+$/, '')}${url.search}`, 301);
  }
  const bezHtml = sciezka.replace(/\.html$/, '');
  if (STARE_SCIEZKI[bezHtml]) {
    return Response.redirect(`${url.origin}${STARE_SCIEZKI[bezHtml]}${url.search}`, 301);
  }
  if (bezHtml !== sciezka && STATYCZNE.has(bezHtml)) {
    return Response.redirect(`${url.origin}${bezHtml}${url.search}`, 301);
  }
  if (STATYCZNE.has(sciezka)) {
    const plik = await env.ASSETS.fetch(new URL(`${sciezka}.html`, url.origin));
    return zNaglowkami(plik, { 'content-type': 'text/html; charset=utf-8' });
  }

  const ua = request.headers.get('user-agent') || '';
  const bot = BOTY_PODGLADU.test(ua) || BOTY_MODELI.test(ua) || botBezPodpisu(request);
  if (bot && Z_MIRROREM.has(sciezka) && (request.method === 'GET' || request.method === 'HEAD')) {
    const mirror = await env.ASSETS.fetch(new URL(plikMirrora(sciezka), url.origin));
    if (mirror.status === 200) {
      // Pod tym adresem człowiek dostaje aplikację, więc bez cache po drodze.
      const odpowiedz = zNaglowkami(mirror, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-cache, no-store, must-revalidate',
      });
      ODDANE_MIRRORY.add(odpowiedz);
      return odpowiedz;
    }
  }

  return zNaglowkami(await env.ASSETS.fetch(request));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.hostname === `www.${DOMENA}`) {
      url.hostname = DOMENA;
      return Response.redirect(url.toString(), 301);
    }

    const wynik = await trasuj(request, env, url);
    if (wynik.mcp) return wynik.mcp;

    const ua = request.headers.get('user-agent') || '';
    ctx.waitUntil(zapiszWejscieCzlowieka(request, {
      status: wynik.status,
      botPodgladu: BOTY_PODGLADU.test(ua) || BOTY_MODELI.test(ua),
      serwis: DOMENA,
    }, env));

    // Rozmiar z klona, jak w Serowarni: warstwa plików nie ustawia content-length.
    // Ludzi funkcja pomija sama (nagłówki przeglądarki, adres spoza list operatorów).
    const klon = wynik.clone();
    ctx.waitUntil((async () => {
      let rozmiar = null;
      try {
        rozmiar = (await klon.arrayBuffer()).byteLength;
      } catch {
        // wizyta zapisze się bez rozmiaru
      }
      await zapiszWizyteBota(request, { status: wynik.status, rozmiar, mirror: ODDANE_MIRRORY.has(wynik) }, env, 'bot_visits_pasze');
    })());
    return wynik;
  },
};
