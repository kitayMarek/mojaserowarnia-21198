/**
 * mojaserowarnia.pl — licznik wizyt botów modeli językowych, z weryfikacją
 *
 * DLACZEGO NIE WYSTARCZY PANEL CLOUDFLARE: 2026-09-03 sprawdzone
 * doświadczalnie — AI Crawl Control przypisuje żądanie do operatora po samym
 * nagłówku User-Agent. Dwa `curl` z polskiego łącza, podpisane jako
 * PerplexityBot, podniosły tam "AI Answer retrievals" z 16 na 18. Nagłówek
 * ustawia klient, więc licznik oparty wyłącznie na nim mierzy deklaracje,
 * nie ruch. Ten moduł porównuje adres źródłowy z listami CIDR, które
 * operatorzy publikują właśnie po to, żeby dało się ich odróżnić od podszywek.
 *
 * CZEGO SIĘ STĄD NIE DOWIEMY: po co bot przyszedł. Zapytanie użytkownika nie
 * jest przekazywane w żadnym nagłówku i nie będzie — to cudze dane. Najbliżej
 * odpowiedzi "czego szukał" jest kod 404/410, czyli "pytał i nie dostał".
 *
 * PRYWATNOŚĆ: adres IP służy wyłącznie do porównania z listą i nigdzie nie
 * trafia. Zapisujemy numer sieci (ASN) i kraj — opisują serwerownię, nie osobę.
 */

// Listy zakresów publikowane przez operatorów. Wszystkie mają ten sam kształt:
// { creationTime, prefixes: [ { ipv4Prefix } | { ipv6Prefix } ] }.
// Sprawdzone 2026-09-03 — cztery adresy, każdy oddaje 200.
const ZRODLA_ZAKRESOW = {
  OpenAI: [
    'https://openai.com/gptbot.json',
    'https://openai.com/searchbot.json',
    'https://openai.com/chatgpt-user.json',
  ],
  // Jedna lista dla wszystkich trzech botów Anthropic (ClaudeBot, Claude-User,
  // Claude-SearchBot) — operator wystawia je pod wspólnym adresem.
  Anthropic: ['https://claude.com/crawling/bots.json'],
  Perplexity: [
    'https://www.perplexity.com/perplexitybot.json',
    'https://www.perplexity.com/perplexity-user.json',
  ],
};

// Rozpoznanie bota z User-Agenta. KOLEJNOŚĆ MA ZNACZENIE — wzorce bardziej
// szczegółowe muszą stać przed ogólnymi.
//
// ⚠ Lista musi pozostać zgodna z BOTY_MODELI w worker/index.js. Tam regex
// decyduje o SERWOWANIU mirrora (logika krytyczna dla GEO), tutaj tylko
// o etykiecie w bazie — dlatego są to dwa osobne byty, a nie jeden.
const BOTY = [
  [/OAI-SearchBot/i,     'OpenAI',     'OAI-SearchBot'],
  [/ChatGPT-User/i,      'OpenAI',     'ChatGPT-User'],
  [/GPTBot/i,            'OpenAI',     'GPTBot'],
  [/Claude-SearchBot/i,  'Anthropic',  'Claude-SearchBot'],
  [/Claude-User/i,       'Anthropic',  'Claude-User'],
  [/ClaudeBot/i,         'Anthropic',  'ClaudeBot'],
  [/anthropic-ai/i,      'Anthropic',  'anthropic-ai'],
  [/Perplexity-User/i,   'Perplexity', 'Perplexity-User'],
  [/PerplexityBot/i,     'Perplexity', 'PerplexityBot'],
  // Poniżej operatorzy bez publicznej listy zakresów w tym formacie.
  // Trafiają do bazy ze zweryfikowany = NULL, czyli "nie da się rozstrzygnąć".
  [/CCBot/i,             'inny',       'CCBot'],
  [/cohere-ai/i,         'inny',       'cohere-ai'],
  [/MistralAI-User/i,    'inny',       'MistralAI-User'],
  [/DuckAssistBot/i,     'inny',       'DuckAssistBot'],
  [/meta-externalagent/i,'inny',       'Meta-ExternalAgent'],
  [/Amazonbot/i,         'inny',       'Amazonbot'],
  [/Bytespider/i,        'inny',       'Bytespider'],
  [/YouBot/i,            'inny',       'YouBot'],
  [/Diffbot/i,           'inny',       'Diffbot'],
];

export function rozpoznajBota(ua) {
  for (const [wzorzec, operator, nazwa] of BOTY) {
    if (wzorzec.test(ua)) return { operator, bot: nazwa };
  }
  return null;
}

// --- Zamiana adresów na liczby, żeby dało się porównać maską ------------

function ipv4NaLiczbe(ip) {
  const czesci = ip.split('.');
  if (czesci.length !== 4) return null;
  let n = 0n;
  for (const czesc of czesci) {
    if (!/^\d{1,3}$/.test(czesc)) return null;
    const bajt = Number(czesc);
    if (bajt > 255) return null;
    n = (n << 8n) | BigInt(bajt);
  }
  return n;
}

function grupyNaLiczbe(grupy) {
  let n = 0n;
  for (const grupa of grupy) {
    if (!/^[0-9a-f]{1,4}$/i.test(grupa)) return null;
    n = (n << 16n) | BigInt(parseInt(grupa, 16));
  }
  return n;
}

function ipv6NaLiczbe(ip) {
  let adres = ip;

  // Postać mieszana ::ffff:1.2.3.4 — ogon zapisany po staremu, zamieniamy
  // go na dwie grupy szesnastkowe, żeby dalej liczyć jednolicie.
  const ostatniDwukropek = adres.lastIndexOf(':');
  const ogon = adres.slice(ostatniDwukropek + 1);
  if (ogon.includes('.')) {
    const czworka = ipv4NaLiczbe(ogon);
    if (czworka === null) return null;
    adres = adres.slice(0, ostatniDwukropek + 1)
      + (czworka >> 16n).toString(16) + ':' + (czworka & 0xffffn).toString(16);
  }

  const polowki = adres.split('::');
  if (polowki.length > 2) return null;

  if (polowki.length === 1) {
    const grupy = adres.split(':');
    return grupy.length === 8 ? grupyNaLiczbe(grupy) : null;
  }

  const lewe  = polowki[0] ? polowki[0].split(':') : [];
  const prawe = polowki[1] ? polowki[1].split(':') : [];
  const brakujace = 8 - lewe.length - prawe.length;
  if (brakujace < 0) return null;
  return grupyNaLiczbe([...lewe, ...Array(brakujace).fill('0'), ...prawe]);
}

function wZakresie(adres, siec, dlugosc, szerokosc) {
  if (adres === null || siec === null) return false;
  if (dlugosc < 0 || dlugosc > szerokosc) return false;
  if (dlugosc === 0) return true;
  const maska = ((1n << BigInt(dlugosc)) - 1n) << BigInt(szerokosc - dlugosc);
  return (adres & maska) === (siec & maska);
}

// --- Listy zakresów: pobranie i przechowanie ----------------------------

// Dwa poziomy pamięci, żeby nie pytać operatorów przy każdej wizyty bota:
//  • `cacheTtl` na fetchu — Cloudflare trzyma odpowiedź na brzegu przez dobę,
//  • `pamiec` w isolate — pomaga przy seriach żądań z tego samego bota.
// Isolate żyje krótko i to jest w porządku: po jego wygaśnięciu i tak
// odpowie cache brzegowy, a nie serwer operatora.
let pamiec = null;
const PAMIEC_MS = 60 * 60 * 1000;

async function pobierzZakresy(operator) {
  const zakresy = { v4: [], v6: [] };
  const odpowiedzi = await Promise.all(
    ZRODLA_ZAKRESOW[operator].map((adres) =>
      fetch(adres, { cf: { cacheTtl: 86400, cacheEverything: true } })
        .then((o) => (o.ok ? o.json() : null))
        .catch(() => null)
    )
  );

  for (const dane of odpowiedzi) {
    for (const wpis of dane?.prefixes ?? []) {
      if (wpis.ipv4Prefix) {
        const [siec, dlugosc] = wpis.ipv4Prefix.split('/');
        zakresy.v4.push([ipv4NaLiczbe(siec), Number(dlugosc)]);
      } else if (wpis.ipv6Prefix) {
        const [siec, dlugosc] = wpis.ipv6Prefix.split('/');
        zakresy.v6.push([ipv6NaLiczbe(siec), Number(dlugosc)]);
      }
    }
  }
  return zakresy;
}

async function wszystkieZakresy() {
  if (pamiec && Date.now() - pamiec.czas < PAMIEC_MS) return pamiec.dane;

  const operatorzy = Object.keys(ZRODLA_ZAKRESOW);
  const pobrane = await Promise.all(operatorzy.map(pobierzZakresy));
  const dane = Object.fromEntries(operatorzy.map((o, i) => [o, pobrane[i]]));

  // Pusty wynik zapisalibyśmy na godzinę i przez tę godzinę każdy prawdziwy
  // bot wyglądałby na podszywacza — gorzej niż brak danych. Więc nie zapisujemy.
  const cokolwiekJest = Object.values(dane).some((z) => z.v4.length || z.v6.length);
  if (cokolwiekJest) pamiec = { czas: Date.now(), dane };
  return dane;
}

/**
 * Czy adres należy do sieci operatora.
 * Zwraca true / false / null, gdzie null znaczy „nie da się rozstrzygnąć"
 * (operator nie publikuje listy albo lista jest chwilowo nieosiągalna).
 * Rozróżnienie jest istotne: false to zarzut podszywania się i musi być pewny.
 */
export async function czyZOperatora(ip, operator) {
  if (!ip || !ZRODLA_ZAKRESOW[operator]) return null;

  const zakresy = (await wszystkieZakresy())[operator];
  if (!zakresy || (!zakresy.v4.length && !zakresy.v6.length)) return null;

  if (ip.includes(':')) {
    const adres = ipv6NaLiczbe(ip);
    if (adres === null) return null;
    return zakresy.v6.some(([siec, dlugosc]) => wZakresie(adres, siec, dlugosc, 128));
  }

  const adres = ipv4NaLiczbe(ip);
  if (adres === null) return null;
  return zakresy.v4.some(([siec, dlugosc]) => wZakresie(adres, siec, dlugosc, 32));
}

// --- Zapis ---------------------------------------------------------------

/**
 * Zapisuje jedną wizytę bota. Wołać przez ctx.waitUntil() — działa PO
 * odesłaniu odpowiedzi, więc nie opóźnia bota nawet o milisekundę.
 *
 * `wynik` to { status, rozmiar, mirror } — router podaje je wprost, bo tylko
 * on wie, czy bot dostał mirror, czy skorupę React.
 *
 * Każdy błąd jest połykany celowo: logowanie jest dodatkiem i nigdy nie może
 * przewrócić serwowania stron. Brak sekretów = moduł po prostu nic nie robi,
 * co pozwala wdrożyć kod przed ustawieniem klucza.
 */
export async function zapiszWizyteBota(request, wynik, env) {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return;

    const ua = request.headers.get('user-agent') || '';
    const kto = rozpoznajBota(ua);
    if (!kto) return;

    const url = new URL(request.url);

    // Adresy testowe *.workers.dev to kopia serwisu — ruch na nią nie mówi
    // nic o zainteresowaniu treścią i tylko zaszumiłby statystyki.
    if (url.hostname.endsWith('.workers.dev')) return;

    const ip = request.headers.get('cf-connecting-ip');
    const zweryfikowany = await czyZOperatora(ip, kto.operator);


    const zapis = await fetch(`${env.SUPABASE_URL}/rest/v1/bot_visits`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'content-type': 'application/json',
        prefer: 'return=minimal',
      },
      body: JSON.stringify({
        operator: kto.operator,
        bot: kto.bot,
        zweryfikowany,
        sciezka: url.pathname,
        status: wynik.status,
        rozmiar: wynik.rozmiar,
        mirror: wynik.mirror,
        asn: request.cf?.asn ?? null,
        kraj: request.cf?.country ?? null,
        ua: ua.slice(0, 500),
      }),
    });

    // Odrzucony zapis (brak tabeli, zły klucz, zmieniona kolumna) NIE może
    // przewrócić serwisu, ale musi zostawić ślad — inaczej licznik po cichu
    // nie działa i nikt się o tym nie dowie. Trafia do logów Workers, bo
    // observability jest włączona w wrangler.jsonc.
    if (!zapis.ok) {
      console.error('bot_visits: zapis odrzucony', zapis.status, (await zapis.text()).slice(0, 300));
    }
  } catch (blad) {
    console.error('bot_visits: wyjątek przy zapisie', blad?.message);
  }
}

// Udostępnione wyłącznie dla testów w scripts/test-wizyty-botow.mjs.
// Błąd w masce sprawiłby, że każdy prawdziwy bot zostałby uznany za
// podszywacza — dlatego ta część ma testy, mimo że reszta ich nie ma.
export const __wewnetrzne = { ipv4NaLiczbe, ipv6NaLiczbe, wZakresie };
