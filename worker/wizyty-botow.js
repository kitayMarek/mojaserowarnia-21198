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
  // Wyszukiwarki. Google i Bing publikuja swoje zakresy w dokladnie tym samym
  // formacie co operatorzy AI, wiec weryfikacja dziala bez zmian w kodzie.
  // To wazne przy KALIBRACJI: Google i Bing raportuja wlasna aktywnosc
  // w GSC i Bing Webmaster Tools, a tego nie da sie podrobic — wiec ich ruch
  // jest jedynym punktem, w ktorym mozna sprawdzic, czy licznik nie gubi zadan.
  Google: [
    'https://developers.google.com/static/search/apis/ipranges/googlebot.json',
    'https://developers.google.com/static/search/apis/ipranges/special-crawlers.json',
    'https://developers.google.com/static/search/apis/ipranges/user-triggered-fetchers-google.json',
  ],
  Microsoft: ['https://www.bing.com/toolbox/bingbot.json'],
  OpenAI: [
    'https://openai.com/gptbot.json',
    'https://openai.com/searchbot.json',
    'https://openai.com/chatgpt-user.json',
  ],
  // Jedna lista dla wszystkich trzech botów Anthropic (ClaudeBot, Claude-User,
  // Claude-SearchBot) — operator wystawia je pod wspólnym adresem.
  Anthropic: ['https://claude.com/crawling/bots.json'],
  // Perplexity oddaje te dwa adresy przez 302 (stan na 2026-09-04). fetch()
  // w Workers domyślnie podąża za przekierowaniem, więc działa — ale gdyby
  // kiedyś przestało, listy przyjdą puste i operator zacznie wychodzić NULL.
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
  // WYSZUKIWARKI. Zlecenie rozstrzyga: kategoryzujemy je, NIE filtrujemy.
  // Granica "wyszukiwarka kontra crawler AI" juz nie istnieje — Googlebot karmi
  // AI Overviews, Bingbot Copilota, a ChatGPT historycznie korzystal z indeksu
  // Bing. Czesci pracy "dla GPT" fizycznie nie da sie oddzielic po stronie
  // serwera. Filtrowanie kasowaloby dane bezpowrotnie; kategoria pozwala je
  // ciac dowolnie i zmienic zdanie pozniej.
  //
  // ⚠ To NIE zmienia serwowania: BOTY_MODELI w worker/index.js nadal nie
  // zawiera wyszukiwarek, wiec Googlebot dostaje trase React, a nie mirror.
  [/Googlebot-Image/i,   'Google',     'Googlebot-Image'],
  [/Googlebot/i,         'Google',     'Googlebot'],
  [/Google-Extended/i,   'Google',     'Google-Extended'],
  [/Bingbot/i,           'Microsoft',  'Bingbot'],
  [/Applebot/i,          'inny',       'Applebot'],
  [/Seznam-?Bot/i,       'inny',       'Seznam-Bot'],
  [/YandexBot|Yandex/i,  'inny',       'YandexBot'],
  [/Baiduspider/i,       'inny',       'Baiduspider'],
  [/Naverbot/i,          'inny',       'Naverbot'],
  // NARZEDZIA SEO — nie karmia zadnego modelu, ale zuzywaja budzet i warto
  // wiedziec, ile ich jest.
  [/AhrefsBot/i,         'inny',       'AhrefsBot'],
  [/SemrushBot/i,        'inny',       'SemrushBot'],
  [/DotBot/i,            'inny',       'DotBot'],
  [/MJ12bot/i,           'inny',       'MJ12bot'],
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

// --- FCrDNS: weryfikacja operatorow, ktorzy nie publikuja list zakresow ------
//
// FCrDNS (forward-confirmed reverse DNS) to metoda, ktora Google rekomenduje do
// weryfikacji Googlebota. Trzy kroki i ZADNEGO nie wolno pominac:
//   1. odwrotne DNS na adresie zrodlowym  -> nazwa hosta
//   2. nazwa musi konczyc sie domena operatora — dopasowanie SUFIKSU, nie
//      "contains". Roznica jest krytyczna: `evil-crawl.amazon.com.attacker.net`
//      zawiera "amazon.com", ale nalezy do atakujacego.
//   3. forward DNS na tej nazwie -> musi wrocic ten sam adres zrodlowy
// Bez kroku 3 wystarczyloby spreparowac wlasny rekord PTR.
const FCRDNS_SUFIKSY = {
  Amazonbot: ['.crawl.amazon.com'],
  CCBot: ['.commoncrawl.org'],
  // Bytespider jest najczesciej podszywanym botem z calej listy, wiec sufiksy
  // sa waskie i nie obejmuja calej domeny bytedance.com.
  Bytespider: ['.crawl.bytedance.com', '.bytedance.com'],
};

// Meta nie publikuje list w formacie prefixes ani nie wystawia PTR-ow —
// dokumentacja odsyla do numeru systemu autonomicznego. Cloudflare podaje go
// w request.cf.asn, wiec sprawdzenie jest darmowe i nie wymaga zapytania DNS.
const ASN_OPERATORA = {
  'Meta-ExternalAgent': [32934],
};

/**
 * Zapytanie DNS przez DNS-over-HTTPS. Workers nie maja API do zwyklego DNS,
 * a to i tak jest lepsze: odpowiedz leci przez fetch, wiec zalapie sie na cache
 * brzegowy Cloudflare. Stad rezygnacja z tabeli `bot_ip_cache` ze zlecenia —
 * cel byl taki, zeby nie pytac DNS przy kazdej wizycie, i cacheTtl to zalatwia
 * bez dokladania dwoch zapytan do bazy na kazde zadanie bota.
 */
async function dns(nazwa, typ) {
  const adres = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(nazwa)}&type=${typ}`;
  const o = await fetch(adres, {
    headers: { accept: 'application/dns-json' },
    cf: { cacheTtl: 86400, cacheEverything: true },
  });
  if (!o.ok) return null;
  const dane = await o.json();
  return (dane.Answer ?? []).filter((a) => a.type === (typ === 'PTR' ? 12 : typ === 'A' ? 1 : 28));
}

/** Adres w postaci wymaganej przez PTR: odwrocone oktety + .in-addr.arpa. */
function nazwaPtr(ip) {
  if (!ip.includes(':')) {
    const o = ip.split('.');
    if (o.length !== 4) return null;
    return o.slice().reverse().join('.') + '.in-addr.arpa';
  }
  const liczba = ipv6NaLiczbe(ip);
  if (liczba === null) return null;
  const hex = liczba.toString(16).padStart(32, '0');
  return hex.split('').reverse().join('.') + '.ip6.arpa';
}

export async function sprawdzFcrdns(ip, sufiksy) {
  try {
    const nazwa = nazwaPtr(ip);
    if (!nazwa) return { wynik: null, metoda: 'blad_sprawdzenia' };

    const ptr = await dns(nazwa, 'PTR');
    if (ptr === null) return { wynik: null, metoda: 'blad_sprawdzenia' };
    if (!ptr.length) return { wynik: false, metoda: 'fcrdns' };  // brak PTR = nie jest tym botem

    // Krok 2 — dopasowanie sufiksu. Kropka na koncu jest w odpowiedzi DNS
    // zawsze, wiec zdejmujemy ja przed porownaniem.
    const host = ptr[0].data.replace(/\.$/, '').toLowerCase();
    if (!sufiksy.some((s) => host.endsWith(s))) return { wynik: false, metoda: 'fcrdns' };

    // Krok 3 — potwierdzenie w druga strone.
    const typ = ip.includes(':') ? 'AAAA' : 'A';
    const wprzod = await dns(host, typ);
    if (wprzod === null) return { wynik: null, metoda: 'blad_sprawdzenia' };
    return { wynik: wprzod.some((a) => a.data === ip), metoda: 'fcrdns' };
  } catch {
    return { wynik: null, metoda: 'blad_sprawdzenia' };
  }
}

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
 * Zwraca { wynik, metoda }. `wynik` to true / false / null, gdzie null znaczy
 * „nie da się rozstrzygnąć"
 * (operator nie publikuje listy albo lista jest chwilowo nieosiągalna).
 * Rozróżnienie jest istotne: false to zarzut podszywania się i musi być pewny.
 */
export async function czyZOperatora(ip, operator) {
  if (!ip || !ZRODLA_ZAKRESOW[operator]) return { wynik: null, metoda: 'brak_metody' };

  const zakresy = (await wszystkieZakresy())[operator];
  if (!zakresy) return { wynik: null, metoda: 'blad_sprawdzenia' };

  // Kazdy skonfigurowany operator publikuje co najmniej jeden prefiks IPv4.
  // Obie listy puste znacza wiec, ze pobranie sie nie udalo — a to co innego
  // niz "operator nie publikuje IPv6". Rozroznienie idzie do kolumny metoda.
  if (!zakresy.v4.length && !zakresy.v6.length) return { wynik: null, metoda: 'blad_sprawdzenia' };

  const szescnastkowy = ip.includes(':');
  const lista = szescnastkowy ? zakresy.v6 : zakresy.v4;

  // ⚠ Brak prefiksów DLA TEJ WERSJI ADRESU musi dać null, nie false. Stan na
  // 2026-09-04: ŻADEN z sześciu plików operatorów nie zawiera ani jednego
  // ipv6Prefix (OpenAI 21/35/207, Anthropic 26, Perplexity 8/4 — wszystkie
  // wyłącznie IPv4). Poprzednia wersja sprawdzała, czy obie listy są puste
  // naraz, więc bot przychodzący po IPv6 trafiał na `[].some(...)` === false
  // i lądował w bot_podszywacze jako rzekomy oszust. Fałszywe oskarżenie jest
  // tu gorsze od braku rozstrzygnięcia: to na `false` opiera się cały zarzut.
  if (!lista.length) return { wynik: null, metoda: 'brak_metody' };

  const adres = szescnastkowy ? ipv6NaLiczbe(ip) : ipv4NaLiczbe(ip);
  if (adres === null) return { wynik: null, metoda: 'blad_sprawdzenia' };
  return {
    wynik: lista.some(([siec, dlugosc]) => wZakresie(adres, siec, dlugosc, szescnastkowy ? 128 : 32)),
    metoda: 'ip_lista',
  };
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
    const asn = request.cf?.asn ?? null;

    // TRZY DROGI WERYFIKACJI, w kolejnosci od najpewniejszej:
    //  1. lista zakresow publikowana przez operatora (OpenAI, Anthropic,
    //     Perplexity, Google, Microsoft),
    //  2. numer systemu autonomicznego — tam, gdzie operator odsyla do ASN
    //     zamiast publikowac prefiksy (Meta),
    //  3. FCrDNS — dla operatorow bez listy i bez ASN (Amazon, CommonCrawl,
    //     ByteDance).
    // Kazda konczy sie tym samym ksztaltem { wynik, metoda }, wiec reszta kodu
    // nie musi wiedziec, ktora zadzialala.
    let { wynik: zweryfikowany, metoda } = await czyZOperatora(ip, kto.operator);

    if (metoda === 'brak_metody' && ASN_OPERATORA[kto.bot]) {
      zweryfikowany = asn === null ? null : ASN_OPERATORA[kto.bot].includes(asn);
      metoda = asn === null ? 'blad_sprawdzenia' : 'asn_operatora';
    } else if (metoda === 'brak_metody' && FCRDNS_SUFIKSY[kto.bot] && ip) {
      ({ wynik: zweryfikowany, metoda } = await sprawdzFcrdns(ip, FCRDNS_SUFIKSY[kto.bot]));
    }

    // WEB BOT AUTH — standard IETF, w ktorym bot podpisuje zadanie kluczem
    // Ed25519. Docelowo zastapi listy IP. Na razie tylko LOGUJEMY obecnosc
    // naglowkow, bez walidacji: gdy adopcja wzrosnie, beda dane historyczne
    // i gotowe miejsce na implementacje.
    const maPodpis = Boolean(
      request.headers.get('signature-agent') ||
      (request.headers.get('signature-input') && request.headers.get('signature'))
    );


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
        metoda_weryfikacji: metoda,
        ma_podpis: maPodpis,
        sciezka: url.pathname,
        status: wynik.status,
        rozmiar: wynik.rozmiar,
        mirror: wynik.mirror,
        asn,
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
export const __wewnetrzne = { ipv4NaLiczbe, ipv6NaLiczbe, wZakresie, nazwaPtr };
