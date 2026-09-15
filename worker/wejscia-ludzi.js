/**
 * mojaserowarnia.pl — sumy wejść ludzi, liczone po stronie serwera.
 *
 * PO CO. Od 13.09.2026 Google Analytics widzi tylko osoby, które się zgodziły.
 * Serwer widzi każde wejście, więc liczymy je w postaci sum. Decyzja Marka
 * z 14.09.2026, projekt i decyzje z 15.09.2026: ProjektyLLm/ZLECENIE-wejscia-ludzi.md
 * (plik poza repozytorium).
 *
 * JEDNOSTKA: wejście, czyli załadowanie strony przez przeglądarkę. Przejścia
 * wewnątrz aplikacji React nie docierają do serwera, więc to nie są ani odsłony,
 * ani osoby.
 *
 * CZEGO NIE ZAPISUJEMY: adresu IP, User-Agenta, godziny, parametrów adresu ani
 * ścieżki odsyłacza. Z wiersza nie da się odtworzyć osoby ani pojedynczej wizyty.
 * Adres IP i podpis zostają w workerze i służą wyłącznie do rozstrzygnięcia,
 * czy to człowiek.
 *
 * CZEGO SERWER NIE ROZSTRZYGNIE: bot udający przeglądarkę, z kompletem nagłówków
 * i spoza sieci operatorów, policzy się jako człowiek; przeładowanie strony to
 * kolejne wejście; adres nieistniejący w aplikacji React ma u serwera kod 200,
 * bo stronę błędu pokazuje dopiero przeglądarka.
 */

import { rozpoznajBota, ktoZListy, zrodloOdpowiedzi } from './wizyty-botow.js';

// Słowa typowe dla narzędzi i pobieraczy podglądu, których nie ma na liście nazw
// licznika botów. "bot" łapie Twitterbota, LinkedInBota, Slackbota, TelegramBota
// i resztę. Celowo BEZ samych nazw aplikacji (LinkedIn, Twitter, Pinterest):
// ich wbudowane przeglądarki niosą ludzi, a nie pobieracze podglądu.
const NARZEDZIE =
  /bot\b|crawl|spider|slurp|headless|lighthouse|python|curl|wget|facebookexternalhit|whatsapp|skypeuripreview|vkshare|embedly|ptst|gtmetrix|axios|node-fetch|go-http-client/i;

// Te same znaczniki co w bazodanowej funkcji ruch_wlasny(). Przy zmianie listy
// zajrzeć w obie.
const WLASNE = /test-marek|test-agrojelonki|Agrojelonki-Test/i;

// Jedna nazwa zamiast kilku domen tego samego serwisu. Licznik przyjść zapisywał
// Facebooka pod czterema nazwami (facebook.com, l., lm., m.).
const ZNANE_ZRODLA = [
  [/(^|\.)google\.[a-z.]+$/i, 'Google'],
  [/(^|\.)bing\.com$/i, 'Bing'],
  [/(^|\.)facebook\.com$|^fb\.me$/i, 'Facebook'],
  [/(^|\.)instagram\.com$/i, 'Instagram'],
  [/(^|\.)youtube\.com$/i, 'YouTube'],
  [/(^|\.)duckduckgo\.com$/i, 'DuckDuckGo'],
  [/(^|\.)yahoo\.com$/i, 'Yahoo'],
];

function zrodloWejscia(request, url) {
  // Znaczniki utm i odsyłacze rozpoznaje ta sama funkcja co licznik przyjść,
  // żeby oba liczniki nazywały modele identycznie.
  const nazwa = zrodloOdpowiedzi(request, url);
  if (nazwa) {
    for (const [wzorzec, znana] of ZNANE_ZRODLA) if (wzorzec.test(nazwa)) return znana;
    return nazwa;
  }

  const odsylacz = request.headers.get('referer');
  if (odsylacz) {
    try {
      const host = new URL(odsylacz).hostname.toLowerCase().replace(/^www\./, '');
      if (host === url.hostname.toLowerCase().replace(/^www\./, '')) return '(ten serwis)';
    } catch {
      // pokręcony odsyłacz, nie zgadujemy
    }
    return '(nieznane)';
  }

  // Bez odsyłacza rozstrzyga Sec-Fetch-Site: przejście z innej strony, która
  // nie podała adresu, to co innego niż adres wpisany ręcznie albo zakładka.
  const strona = request.headers.get('sec-fetch-site');
  if (strona === 'cross-site') return '(odsylacz ukryty)';
  if (strona === 'same-origin' || strona === 'same-site') return '(ten serwis)';
  return '(bez odsylacza)';
}

function rodzajUrzadzenia(request, ua) {
  // Tablet przed telefonem: Android bez słowa "Mobile" to tablet. iPad z Safari
  // przedstawia się jako Mac i trafi do komputerów, tego serwer nie rozstrzygnie.
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)) return 'tablet';
  if (request.headers.get('sec-ch-ua-mobile') === '?1'
    || /Mobi|iPhone|iPod|Windows Phone/i.test(ua)) return 'telefon';
  if (/Windows NT|Macintosh|X11|CrOS|Linux/i.test(ua)) return 'komputer';
  return 'nieznane';
}

function rodzajPrzegladarki(ua) {
  // Przeglądarka Facebooka pierwsza: ma w podpisie także Safari albo Chrome.
  // To ją najbardziej chcemy widzieć, bo GA gubi w niej pamięć o użytkowniku.
  if (/FBAN|FBAV|FB_IAB|FB4A/i.test(ua)) return 'Facebook (aplikacja)';
  if (/Edg(e|A|iOS)?\//i.test(ua)) return 'Edge';
  if (/OPR\/|Opera|SamsungBrowser|YaBrowser|Vivaldi/i.test(ua)) return 'inna';
  if (/Firefox\/|FxiOS\//i.test(ua)) return 'Firefox';
  if (/Chrome\/|CriOS\//i.test(ua)) return 'Chrome';
  if (/Safari\//i.test(ua)) return 'Safari';
  return 'inna';
}

/**
 * Zlicza wejście człowieka. Wołać przez ctx.waitUntil(), po odesłaniu odpowiedzi.
 *
 * `wynik` to { status, botPodgladu }. Router podaje botPodgladu, bo listy botów
 * podglądu i crawlerów modeli żyją w worker/index.js.
 *
 * Każdy błąd jest połykany: licznik jest dodatkiem i nigdy nie może przewrócić
 * serwowania stron. Odrzucony zapis zostawia ślad w logach Workers.
 */
export async function zapiszWejscieCzlowieka(request, wynik, env) {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return;
    const url = new URL(request.url);

    // 1. Przeglądarka otwiera stronę: GET z Sec-Fetch-Dest: document. Obrazki,
    //    skrypty i zapytania aplikacji o dane się nie liczą.
    if (request.method !== 'GET') return;
    if (request.headers.get('sec-fetch-dest') !== 'document') return;

    // 2. Nagłówki przeglądarki, których skrypt nie wysyła. Ten sam warunek od
    //    7.09.2026 oddziela ludzi od botów w liczniku botów.
    if (!(request.headers.get('sec-fetch-mode') || request.headers.get('accept-language'))) return;

    // 3. Podpis nie jest botem ani narzędziem.
    const ua = request.headers.get('user-agent') || '';
    if (wynik.botPodgladu || rozpoznajBota(ua) || NARZEDZIE.test(ua)) return;

    // 5. Nasza domena, bez kopii *.workers.dev i bez panelu (jak w GA od 10.09.2026).
    if (url.hostname.endsWith('.workers.dev')) return;
    if (/^\/admin(\/|$)/.test(url.pathname)) return;

    // 6. Tylko odpowiedzi, które kończą wejście. Po 301 liczy się adres docelowy.
    if (![200, 404, 410].includes(wynik.status)) return;

    // 4. Adres z opublikowanej listy crawlerów operatora to agent modelu
    //    w przeglądarce, nie człowiek. Najdroższe sprawdzenie, więc na końcu.
    if (await ktoZListy(request.headers.get('cf-connecting-ip'))) return;

    // Global Privacy Control: tylko do sumy dnia, bez żadnych cech wejścia.
    const gpc = request.headers.get('sec-gpc') === '1';
    const cechy = gpc
      ? { _sciezka: '(ukryte)', _zrodlo: '(ukryte)', _kraj: '(ukryte)', _urzadzenie: '(ukryte)', _przegladarka: '(ukryte)' }
      : {
          _sciezka: url.pathname,
          _zrodlo: zrodloWejscia(request, url),
          _kraj: request.cf?.country || '??',
          _urzadzenie: rodzajUrzadzenia(request, ua),
          _przegladarka: rodzajPrzegladarki(ua),
        };
    const zamiar = request.headers.get('sec-purpose') || request.headers.get('purpose') || '';

    const zapis = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/zlicz_wejscie`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...cechy,
        _rodzaj: /prefetch|prerender/i.test(zamiar) ? 'wstepne_pobranie' : 'wejscie',
        _status: wynik.status,
        _wlasne: WLASNE.test(ua),
        _gpc: gpc,
      }),
    });
    if (!zapis.ok) {
      console.error('wejscia_ludzi: zapis odrzucony', zapis.status, (await zapis.text()).slice(0, 300));
    }
  } catch (blad) {
    console.error('wejscia_ludzi: wyjątek przy zapisie', blad?.message);
  }
}

// Udostępnione wyłącznie do sprawdzeń lokalnych.
export const __wewnetrzne = { zrodloWejscia, rodzajUrzadzenia, rodzajPrzegladarki, NARZEDZIE };
