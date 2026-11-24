/**
 * mojaserowarnia.pl/szukaj (od 24.11.2026): strona wyników składana w Workerze, działa bez JavaScriptu.
 *
 * Etap 1 wyszukiwarki we wszystkich modułach Dane Rolne (plan Marka z 24.11.2026,
 * https://claude.ai/artifact/1VafYZnZ2Qb4DD5ZNnsYJy). Najpierw własne wyniki, pod nimi
 * „W innych serwisach Dane Rolne” z danerolne.com/api/szukaj?modul=serowarnia. Gdy Serowarnia
 * nic nie znalazła, część z huba idzie na górę.
 *
 * Własne wyniki: ten sam indeks i ta sama funkcja dopasowania co okno Ctrl+K. Indeks to
 * worker/indeks-szukaj.json (scripts/gen-indeks-szukaj.mjs, świeży przy każdym `npm run deploy`),
 * dopasowanie to src/data/wyszukiwanie.ts.
 *
 * Hub: czekamy najwyżej 1,5 s, a gdy nie odpowie albo odpowie błędem, strona pokazuje same
 * nasze wyniki. Kolejność z huba bez przestawiania. licz=1 raz na wyszukiwanie i tylko, gdy ta
 * strona rozpoznała człowieka (te same sprawdzenia co licznik wejść ludzi); ruch=wlasny przy
 * znaczniku test-marek i przy podglądzie lokalnym.
 *
 * Treści zapytania nie zapisujemy nigdzie: liczniki wejść i botów biorą samą ścieżkę, hub
 * zapisuje same sumy, a nagłówek Referrer-Policy: origin nie puszcza adresu z pytaniem dalej
 * (ani do Google Analytics na stronie, w którą ktoś kliknie, ani do obcych serwisów).
 *
 * Strona z pytaniem ma noindex: wyjątek od zasady bez noindex (README.md, „Noindex”), tak jak
 * /szukaj?q= w hubie i w Mojej Paszy. Bez pytania jest zwykłą stroną.
 */

import indeks from './indeks-szukaj.json';
import { szukajWIndeksie } from '../src/data/wyszukiwanie.ts';
import { PASEK_HTML } from '../src/components/pasekRodzinyHtml.ts';
import STYL_PASKA from '../src/styles/pasek-rodziny.css';
import { rozpoznajBota, ktoZListy } from './wizyty-botow.js';
import { NARZEDZIE, WLASNE } from './wejscia-ludzi.js';

const BAZA = 'https://mojaserowarnia.pl';
const HUB = 'https://danerolne.com/api/szukaj';
const CZEKAJ_NA_HUB_MS = 1500;
const MAKS_PYTANIE = 120;
const MAKS_WYNIKOW = 20;
const MAKS_Z_HUBA = 8;

// Teksty strony w jednym miejscu (lista dla Marka przed wdrożeniem).
export const TEKSTY = {
  tytul: 'Szukaj w Mojej Serowarni',
  podpowiedz: 'np. mozzarella, twaróg, RHD',
  przycisk: 'Szukaj',
  bezDanych: 'Nie wpisuj danych osobowych.',
  wstep: 'Szukaj w przepisach na sery, bazie kultur bakteryjnych, poradnikach i przepisach prawa. Pod wynikami Mojej Serowarni są wyniki z innych serwisów Dane Rolne.',
  naszeNaglowek: 'W Mojej Serowarni',
  hubNaglowek: 'W innych serwisach Dane Rolne',
  nicNasze: (q) => `W Mojej Serowarni nic nie pasuje do „${q}”. Spróbuj innego słowa albo krótszego pytania.`,
  dzialy: 'Możesz też zajrzeć do działów:',
  pokazano: (n, z) => `Pokazano ${n} z ${z}. Dopisz słowo, żeby zawęzić wyniki.`,
  wiecejWHubie: 'Więcej wyników w wyszukiwarce Dane Rolne',
  kolejnosc: 'Kolejność zależy tylko od dopasowania do pytania. Nikt nie płaci za miejsce na liście.',
  zastosowanie: (t) => `Zastosowanie: ${t}`,
  sklep: (s) => `sklep ${s}`,
  opisStrony: 'Wyszukiwarka Mojej Serowarni: przepisy na sery, kultury bakteryjne ze sklepów, poradniki i prawo, a pod nimi wyniki z innych serwisów Dane Rolne.',
  stopka: 'Moja Serowarnia, część rodziny serwisów Dane Rolne.',
};

// Te same nazwy co w polu na stronie głównej (src/components/HeroSearch.tsx), dla kultur dłuższa.
const RODZAJE = {
  kultury: 'Kultura bakteryjna',
  przepisy: 'Przepis',
  poradniki: 'Poradnik',
  prawo: 'Prawo',
  narzedzia: 'Narzędzie',
  kontakt: 'Kontakt',
};

const DZIALY = [
  ['/przepisy', 'Przepisy na sery'],
  ['/baza-kultur', 'Baza kultur'],
  ['/poradniki', 'Poradniki'],
  ['/prawo', 'Prawo'],
];

const h = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Jedno zdanie opisu, najwyżej ok. 180 znaków. Opisy przepisów w indeksie są ucięte na 150 znakach i kończą się „...”. */
export function jednoZdanie(tekst) {
  const s = String(tekst ?? '').replace(/\s+/g, ' ').trim();
  const uciety = /(\.\.\.|…)$/.test(s);
  const bez = s.replace(/(\.\.\.|…)$/, '').trim();
  const zdanie = bez.match(/^.{20,}?[.!?](?=\s|$)/)?.[0];
  if (zdanie && zdanie.length <= 200) return zdanie;
  const krotszy = bez.length > 180 ? bez.slice(0, 177).replace(/\s+\S*$/, '') : bez;
  return uciety || bez.length > 180 ? `${krotszy.replace(/[\s,;:–-]+$/, '')}…` : krotszy;
}

/** Kilometry po polsku: „12 km”, „3,5 km”. */
const km = (x) => (x !== null && x !== '' && Number.isFinite(Number(x)) ? `${String(Math.round(Number(x) * 10) / 10).replace('.', ',')} km` : '');

// ── Hub ─────────────────────────────────────────────────────────────────────────

/** Wyniki huba albo null (brak odpowiedzi w czasie, błąd, zła odpowiedź). Błąd huba nigdy nie psuje strony. */
export async function wynikiHuba(pytanie, ileNaszych, { liczyc, wlasny, fetchFn = fetch, czas = CZEKAJ_NA_HUB_MS, adres = HUB }) {
  const p = new URLSearchParams({ q: pytanie, modul: 'serowarnia', wynikow_modulu: String(ileNaszych) });
  if (liczyc) p.set('licz', '1');
  if (wlasny) p.set('ruch', 'wlasny');
  try {
    const odp = await fetchFn(`${adres}?${p}`, {
      headers: { accept: 'application/json', 'user-agent': 'MojaSerowarnia-szukaj/1.0 (+https://mojaserowarnia.pl/szukaj)' },
      signal: AbortSignal.timeout(czas),
    });
    if (!odp.ok) return null;
    const dane = await odp.json();
    if (!Array.isArray(dane?.wyniki)) return null;
    const wyniki = dane.wyniki
      .filter((w) => w?.tytul && /^https:\/\//.test(String(w.url ?? '')))
      .slice(0, MAKS_Z_HUBA);
    const wiecej = /^https:\/\/danerolne\.com\//.test(String(dane.wiecej ?? '')) ? dane.wiecej : null;
    return { wyniki, wiecej };
  } catch (e) {
    // Sama przyczyna, bez treści pytania (adres z ?q= wycinamy, gdyby trafił do komunikatu błędu).
    const powod = e?.name === 'TimeoutError' ? 'czas' : String(e?.message ?? e).replace(/https?:\/\/\S+/g, '(adres)').slice(0, 80);
    console.log(JSON.stringify({ szukaj_hub_blad: powod }));
    return null;
  }
}

// ── Kto pyta ────────────────────────────────────────────────────────────────────

/**
 * Czy wyszukiwanie zrobił człowiek. Te same sprawdzenia co licznik wejść ludzi
 * (worker/wejscia-ludzi.js): otwarcie strony przez przeglądarkę, bez wstępnego pobrania,
 * podpis nie jest botem ani narzędziem, adres nie z sieci operatora crawlerów.
 * `bot` przychodzi z routera (boty podglądu, crawlery modeli, bot bez podpisu).
 */
async function czyCzlowiek(request, bot) {
  if (bot || request.method !== 'GET') return false;
  const cel = request.headers.get('sec-fetch-dest');
  if (cel && cel !== 'document') return false;
  if (/prefetch|prerender/i.test(request.headers.get('sec-purpose') || request.headers.get('purpose') || '')) return false;
  const ua = request.headers.get('user-agent') || '';
  if (rozpoznajBota(ua) || NARZEDZIE.test(ua)) return false;
  // Listy adresów operatorów są zwykle w pamięci Workera (odświeżane co godzinę). Gdy pobieranie
  // trwa dłużej, nie trzymamy strony: przeglądarkowe nagłówki już są, więc liczymy jak człowieka.
  const operator = await Promise.race([
    ktoZListy(request.headers.get('cf-connecting-ip')).catch(() => null),
    new Promise((r) => setTimeout(() => r(null), 400)),
  ]);
  return !operator;
}

// ── Strona ──────────────────────────────────────────────────────────────────────

function wierszNaszy(p) {
  let opis = jednoZdanie(p.description);
  const zrodlo = [RODZAJE[p.category] ?? 'Strona'];
  if (p.category === 'kultury') {
    // Opis kultury w indeksie to „zastosowanie | rodzaj | sklep”.
    opis = jednoZdanie(TEKSTY.zastosowanie(String(p.description).split(' | ')[0]));
    if (p.type) zrodlo.push(p.type);
    if (p.shop) zrodlo.push(TEKSTY.sklep(p.shop));
  } else {
    zrodlo.push('Moja Serowarnia');
  }
  return `      <li class="wynik">
        <a class="wynik-tytul" href="${h(p.href)}">${h(p.title)}</a>
        <p>${h(opis)}</p>
        <p class="zrodlo">${h(zrodlo.join(' · '))}</p>
      </li>`;
}

function wierszHuba(w) {
  const podpis = [w.serwis, w.dzial && w.dzial !== w.serwis ? w.dzial : '', w.miejsce, km(w.km)].filter(Boolean).join(' · ');
  return `      <li class="wynik">
        <a class="wynik-tytul" href="${h(w.url)}" rel="noopener">${h(w.tytul)}</a>
${w.opis ? `        <p>${h(jednoZdanie(w.opis))}</p>\n` : ''}${podpis ? `        <p class="zrodlo">${h(podpis)}</p>\n` : ''}${w.uwaga ? `        <p class="zrodlo">${h(w.uwaga)}</p>\n` : ''}      </li>`;
}

const ZNAK = '<svg viewBox="0 0 46 26" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 20 L23 6 L42 20 Z" stroke-linejoin="round"/><circle cx="17" cy="16" r="2"/><circle cx="27" cy="14" r="2.6"/><circle cx="33" cy="18" r="1.6"/><path d="M4 20 h38"/></svg>';

// Kolory z src/index.css (jasny i ciemny motyw aplikacji); motyw jak w aplikacji idzie za systemem.
const STYL = `
    :root { --tlo:#f4eee0; --karta:#fcf9f1; --tekst:#251a12; --slabszy:#5c4a34; --marka:#8a5a16; --marka-ciemna:#5f3d0f; --na-marce:#ffffff; --linia:#c9b893; --linia-mocna:#6f5f48; color-scheme: light; }
    @media (prefers-color-scheme: dark) {
      :root { --tlo:#1f1913; --karta:#2b231b; --tekst:#f2ece0; --slabszy:#bcae94; --marka:#e2b65c; --marka-ciemna:#f0c873; --na-marce:#1f1913; --linia:#54452f; --linia-mocna:#9a876a; color-scheme: dark; }
    }
    * { box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; }
    body { margin: 0; background: var(--tlo); color: var(--tekst); font: 17px/1.6 Lato, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
    h1, h2 { font-family: Georgia, 'Times New Roman', serif; font-weight: 600; line-height: 1.25; }
    a { color: var(--marka); }
    .gora { max-width: 760px; margin: 0 auto; padding: 8px 16px; display: flex; flex-wrap: wrap; align-items: center; gap: 0 20px; border-bottom: 1px solid var(--linia); }
    .gora .znak { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; margin-right: auto; color: var(--tekst); font-family: Georgia, 'Times New Roman', serif; font-size: 1.2rem; font-weight: 600; text-decoration: none; }
    .gora .znak svg { width: 36px; height: 21px; color: var(--marka); }
    .gora nav { display: flex; flex-wrap: wrap; gap: 0 16px; }
    .gora nav a { display: inline-flex; align-items: center; min-height: 44px; color: var(--slabszy); font-size: .95rem; font-weight: 700; text-decoration: none; }
    .gora nav a:hover, .wynik-tytul:hover { text-decoration: underline; }
    main { max-width: 760px; margin: 0 auto; padding: 24px 16px 40px; }
    h1 { margin: 0 0 .4rem; font-size: 1.9rem; color: var(--marka-ciemna); }
    h2 { margin: 2rem 0 .3rem; font-size: 1.3rem; }
    .wstep { margin: 0 0 .5rem; color: var(--slabszy); }
    .szukaj-forma { display: flex; gap: 8px; margin: 1rem 0 .35rem; }
    .szukaj-forma input { flex: 1; min-width: 0; min-height: 48px; padding: 0 14px; font: inherit; font-size: 1.05rem; color: var(--tekst); background: var(--karta); border: 1.5px solid var(--linia-mocna); border-radius: 10px; }
    .szukaj-forma input:focus { outline: 2px solid var(--marka); outline-offset: 1px; border-color: var(--marka); }
    .szukaj-forma button { min-height: 48px; min-width: 48px; padding: 0 20px; font: inherit; font-weight: 700; color: var(--na-marce); background: var(--marka); border: 0; border-radius: 10px; cursor: pointer; }
    .szukaj-forma button:focus-visible { outline: 2px solid var(--tekst); outline-offset: 2px; }
    .bez-danych { margin: 0 0 1.25rem; font-size: .85rem; color: var(--slabszy); }
    .wyniki { list-style: none; margin: 0; padding: 0; }
    .wynik { padding: 12px 0; border-top: 1px solid var(--linia); }
    .wynik:first-child { border-top: 0; }
    .wynik p { margin: 4px 0 0; }
    .wynik-tytul { font-size: 1.1rem; font-weight: 700; text-decoration: none; }
    .zrodlo, .male { font-size: .875rem; color: var(--slabszy); }
    .inne-serwisy { margin: 2rem 0 0; padding: 4px 16px 12px; background: var(--karta); border: 1px solid var(--linia); border-radius: 12px; }
    .inne-serwisy h2 { margin-top: 12px; }
    .dzialy { display: flex; flex-wrap: wrap; gap: 8px; margin: .5rem 0 0; padding: 0; list-style: none; }
    .dzialy a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 14px; border: 1px solid var(--linia-mocna); border-radius: 999px; font-weight: 700; text-decoration: none; }
    .male { margin-top: 2rem; }
    footer { max-width: 760px; margin: 0 auto; padding: 16px 16px 32px; border-top: 1px solid var(--linia); font-size: .875rem; color: var(--slabszy); }
    .ukryte { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }`;

export function stronaHtml({ pytanie, nasze, hub, znacznik }) {
  const zPytaniem = Boolean(pytanie);
  const tytul = zPytaniem ? `„${pytanie}”: wyniki w Mojej Serowarni` : `${TEKSTY.tytul} | Moja Serowarnia`;

  const naszeHtml = !zPytaniem ? '' : nasze.length
    ? `    <section aria-labelledby="nasze-t">
    <h2 id="nasze-t">${TEKSTY.naszeNaglowek} (${nasze.length})</h2>
    <ul class="wyniki">
${nasze.slice(0, MAKS_WYNIKOW).map(wierszNaszy).join('\n')}
    </ul>
${nasze.length > MAKS_WYNIKOW ? `    <p class="zrodlo">${h(TEKSTY.pokazano(MAKS_WYNIKOW, nasze.length))}</p>\n` : ''}    </section>
`
    : `    <section aria-labelledby="nasze-t">
    <h2 id="nasze-t">${TEKSTY.naszeNaglowek}</h2>
    <p>${h(TEKSTY.nicNasze(pytanie))}</p>
    <p>${TEKSTY.dzialy}</p>
    <ul class="dzialy">${DZIALY.map(([adres, nazwa]) => `<li><a href="${adres}">${nazwa}</a></li>`).join('')}</ul>
    </section>
`;

  const hubHtml = hub?.wyniki?.length
    ? `    <section class="inne-serwisy" aria-labelledby="inne-t">
    <h2 id="inne-t">${TEKSTY.hubNaglowek}</h2>
    <ul class="wyniki">
${hub.wyniki.map(wierszHuba).join('\n')}
    </ul>
${hub.wiecej ? `    <p><a href="${h(hub.wiecej)}" rel="noopener">${TEKSTY.wiecejWHubie}</a></p>\n` : ''}    </section>
`
    : '';

  // Brief: gdy Serowarnia nic nie znalazła, część z huba idzie na górę.
  const tresc = nasze.length ? naszeHtml + hubHtml : hubHtml + naszeHtml;

  return `<!doctype html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${h(tytul)}</title>
  <meta name="description" content="${h(TEKSTY.opisStrony)}" />
  <link rel="canonical" href="${BAZA}/szukaj" />
  <meta name="robots" content="${zPytaniem ? 'noindex, follow' : 'index, follow'}" />
  <meta name="referrer" content="origin" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="stylesheet" href="/fonts/fonty.css" />
  <style>${STYL}
${STYL_PASKA}
  </style>
</head>
<body>
  ${PASEK_HTML}
  <header class="gora">
    <a class="znak" href="/" aria-label="Strona główna Moja Serowarnia">${ZNAK}Moja Serowarnia</a>
    <nav aria-label="Główne działy">${DZIALY.map(([adres, nazwa]) => `<a href="${adres}">${adres === '/przepisy' ? 'Przepisy' : nazwa}</a>`).join('')}</nav>
  </header>
  <main>
    <h1>${TEKSTY.tytul}</h1>
${zPytaniem ? '' : `    <p class="wstep">${TEKSTY.wstep}</p>\n`}    <form class="szukaj-forma" action="/szukaj" method="get" role="search">
      <label class="ukryte" for="q">${TEKSTY.tytul}</label>
      <input id="q" type="search" name="q" value="${h(pytanie)}" placeholder="${h(TEKSTY.podpowiedz)}" maxlength="${MAKS_PYTANIE}" enterkeyhint="search" aria-describedby="bez-danych"${zPytaniem ? '' : ' autofocus'} />
${znacznik ? `      <input type="hidden" name="z" value="${h(znacznik)}" />\n` : ''}      <button type="submit">${TEKSTY.przycisk}</button>
    </form>
    <p class="bez-danych" id="bez-danych">${TEKSTY.bezDanych}</p>
${tresc}${zPytaniem ? `    <p class="male">${TEKSTY.kolejnosc}</p>\n` : ''}  </main>
  <footer>
    <p>${TEKSTY.stopka} <a href="/">Strona główna</a></p>
  </footer>
</body>
</html>
`;
}

/**
 * Odpowiedź dla GET i HEAD /szukaj. Router podaje `bot` (bot podglądu, crawler modelu, bot bez
 * podpisu) i `adresTestowy` (*.workers.dev). Treść pytania idzie tylko do huba.
 */
export async function stronaSzukaj(request, env, url, { bot = false, adresTestowy = false } = {}) {
  const pytanie = (url.searchParams.get('q') ?? '').replace(/\s+/g, ' ').trim().slice(0, MAKS_PYTANIE);
  const ua = request.headers.get('user-agent') || '';
  // Znacznik testu Marka w adresie (?z=test-marek) zostaje w formularzu, żeby kolejne pytania też były ruchem własnym.
  const znacznik = /test-marek/i.test(url.searchParams.get('z') || '') ? 'test-marek' : '';
  // Podgląd lokalny (wrangler dev) i kopia na *.workers.dev to zawsze nasz ruch: bez licz=1, z ruch=wlasny.
  // ⚠ wrangler dev podmienia adres żądania na mojaserowarnia.pl (trasa z wrangler.jsonc), więc sama nazwa
  // hosta lokalnie nie wystarcza: 24.11.2026 pierwsze próby w przeglądarce poszły przez to do huba z licz=1.
  // Pewny znak to nagłówek CF-Connecting-IP: na produkcji Cloudflare wpisuje go do każdego żądania
  // (prawdziwy adres, nie do podrobienia przez klienta), a lokalnie go nie ma (sprawdzone w wrangler 4.80).
  // Gdyby kiedyś zabrakło go na produkcji, skutek jest bezpieczny: wyszukiwanie się nie liczy.
  const ip = request.headers.get('cf-connecting-ip') || '';
  const lokalnie = adresTestowy || !ip || /^(127\.|::1$|::ffff:127\.)/.test(ip) || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname);

  const nasze = pytanie ? szukajWIndeksie(indeks, pytanie, indeks.length) : [];
  let hub = null;
  if (pytanie && request.method === 'GET') {
    const liczyc = !lokalnie && (await czyCzlowiek(request, bot));
    // SZUKAJ_HUB_TEST: inny adres huba tylko w podglądzie lokalnym (sprawdzenie strony przy hubie
    // niedostępnym: `wrangler dev --var SZUKAJ_HUB_TEST:http://127.0.0.1:9/api/szukaj`). Na produkcji nie działa.
    const adres = lokalnie && !adresTestowy && env?.SZUKAJ_HUB_TEST ? env.SZUKAJ_HUB_TEST : HUB;
    hub = await wynikiHuba(pytanie, nasze.length, { liczyc, wlasny: lokalnie || Boolean(znacznik) || WLASNE.test(ua), adres });
  }

  const naglowki = {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': pytanie ? 'no-store' : 'no-cache',
    // Te same co w public/_headers (odpowiedź z Workera ich nie dostaje), tylko Referrer-Policy
    // ostrzejsze: adres z pytaniem nie idzie dalej w nagłówku Referer.
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'SAMEORIGIN',
    'referrer-policy': 'origin',
    'strict-transport-security': 'max-age=31536000',
  };
  // Noindex: wyjątek od zasady bez noindex (README.md, „Noindex”): strona z pytaniem i kopia na *.workers.dev.
  if (adresTestowy) naglowki['x-robots-tag'] = 'noindex, nofollow';
  else if (pytanie) naglowki['x-robots-tag'] = 'noindex, follow';

  const html = request.method === 'HEAD' ? null : stronaHtml({ pytanie, nasze, hub, znacznik });
  return new Response(html, { status: 200, headers: naglowki });
}
