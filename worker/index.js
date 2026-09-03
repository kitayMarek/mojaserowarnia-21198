/**
 * mojaserowarnia.pl — router brzegowy (odpowiednik dawnego .htaccess)
 *
 * Serwis ma DWIE warstwy treści pod tymi samymi adresami:
 *   • aplikację React (trasy typu /przepisy/mozzarella) — dla ludzi,
 *   • statyczne mirrory (public/przepisy/mozzarella.html) — dla botów, bo one
 *     nie renderują JavaScriptu.
 * Na Apache rozdzielał je .htaccess. Tutaj robi to ten plik. Kolejność reguł
 * jest przepisana z docs/htaccess-home-pl.txt i ma znaczenie — nie zmieniać jej bez powodu.
 *
 * Czego tu NIE ma, bo załatwia to warstwa assetów Cloudflare:
 *   • istniejące pliki (assety, mirrory pod własnym adresem) — serwowane
 *     zanim ten worker w ogóle się uruchomi,
 *   • nagłówki → public/_headers,
 *   • stare przekierowania 301 → public/_redirects,
 *   • http → https → przełącznik „Always Use HTTPS" w panelu Cloudflare.
 */

import { zapiszWizyteBota } from './wizyty-botow.js';

// Boty podglądu linków. Googlebota tu NIE MA celowo — indeksuje wersję
// kanoniczną (trasę React), a nie mirror. Lista 1:1 z dawnego .htaccess.
const BOTY_PODGLADU =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|TelegramBot|Discordbot|Pinterest|redditbot|Applebot|SkypeUriPreview|vkShare|Embedly/i;

/**
 * Crawlery modeli językowych — dostają mirror z tego samego powodu co boty
 * podglądu: nie uruchamiają JavaScriptu.
 *
 * SKALA PROBLEMU (zmierzone 2026-09-01 na /prawo/rhd): bot bez renderowania
 * dostawał na trasie React 4 134 znaki tekstu — i to NIE była treść o RHD, tylko
 * ogólny opis serwisu z bloku zapasowego. Ten sam bot na mirrorze dostaje 16 244
 * znaki właściwego poradnika. Czyli gdy ktoś wkleja asystentowi link do trasy
 * i pyta o limity, model dostaje wizytówkę portalu zamiast odpowiedzi.
 *
 * To NIE jest podawanie botom innej treści niż ludziom: mirror zawiera tę samą
 * treść co trasa, jest publicznie dostępny i sam wskazuje trasę jako kanoniczną.
 * Dokładnie ten sam mechanizm działa tu od lat dla podglądów linków.
 *
 * Wyszukiwarek TU NIE MA — ani Googlebota, ani Bingbota, ani Google-Extended.
 * Wyszukiwarki renderują JavaScript i mają widzieć dokładnie to, co człowiek.
 */
const BOTY_MODELI =
  /GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai|PerplexityBot|Perplexity-User|CCBot|cohere-ai|MistralAI-User|DuckAssistBot|meta-externalagent|Amazonbot|Bytespider|YouBot|Diffbot/i;

// Trasy, których mirror leży pod INNĄ nazwą niż sama trasa. Reguła ogólna
// (ścieżka + ".html") ich nie złapie, więc bez tej mapy /baza-kultur dostawało
// generyczną grafikę zamiast własnego og:image.
const MIRROR_POD_INNA_NAZWA = {
  '/baza-kultur': '/kultury/baza.html',
  '/sery-wege': '/wege/index.html',
  '/prawo': '/prawo/przewodnik.html',
  '/przepisy': '/przepisy/przewodnik.html',
};

// Rozszerzenia, dla których brak pliku ma znaczyć PRAWDZIWE 404, a nie
// index.html z kodem 200. Dla Google taki „soft 404" (np. /assets/stary-chunk.js
// zwracające HTML) to sygnał niskiej jakości serwisu.
const ROZSZERZENIE_PLIKU =
  /\.(html|css|js|mjs|json|txt|xml|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|pdf|zip)$/i;

// Trasy React kolidujące z fizycznym katalogiem mirrorów — muszą dostać
// aplikację, nawet gdyby w katalogu kiedyś pojawił się index.html.
const ZAWSZE_APLIKACJA = new Set(['/przepisy', '/prawo', '/serowarnie', '/przepisy-kulinarne']);

const zasob = (env, origin, sciezka) => env.ASSETS.fetch(new URL(sciezka, origin));

// Odpowiedź zbudowana z pliku, ale pod innym adresem i z innym kodem. Nagłówki
// przepisujemy z oryginału, żeby zachować to, co ustawia public/_headers
// (nosniff, HSTS, ramki). Cache — nigdy: pod tym adresem jutro może stać co
// innego, a plik źródłowy jest tylko nośnikiem treści.
function odpowiedzZ(zrodlo, status, adresTestowy) {
  const naglowki = new Headers(zrodlo.headers);
  if (adresTestowy) naglowki.set('x-robots-tag', 'noindex, nofollow');
  naglowki.set('cache-control', 'no-cache, no-store, must-revalidate');
  naglowki.set('content-type', 'text/html; charset=utf-8');
  return new Response(zrodlo.body, { status, headers: naglowki });
}

// Nagłówek techniczny: mówi funkcji fetch, że treść poszła ze statycznego
// mirrora, a nie ze skorupy React. Do klienta NIE trafia — jest zdejmowany
// przed oddaniem odpowiedzi. Powód istnienia: tylko router wie, którą warstwę
// obsłużył, a licznik wizyt musi to odnotować.
const MIRROR = 'x-mirror';

function oznaczMirror(zrodlo) {
  const naglowki = new Headers(zrodlo.headers);
  naglowki.set(MIRROR, '1');
  return new Response(zrodlo.body, { status: zrodlo.status, headers: naglowki });
}

const router = {
  /**
   * Cały router siedzi w metodzie `trasuj` niżej — ta funkcja tylko go woła,
   * zdejmuje nagłówek techniczny i zleca zapis wizyty w tle. Zapis idzie przez
   * ctx.waitUntil(), czyli PO odesłaniu odpowiedzi: bot nie czeka na bazę ani
   * chwili, a awaria Supabase nie może przewrócić serwowania stron.
   */
  async fetch(request, env, ctx) {
    const surowa = await router.trasuj(request, env);

    const mirror = surowa.headers.get(MIRROR) === '1';
    let odpowiedz = surowa;
    if (mirror) {
      const naglowki = new Headers(surowa.headers);
      naglowki.delete(MIRROR);
      odpowiedz = new Response(surowa.body, { status: surowa.status, headers: naglowki });
    }

    const dlugosc = odpowiedz.headers.get('content-length');
    ctx.waitUntil(zapiszWizyteBota(request, {
      status: odpowiedz.status,
      rozmiar: dlugosc ? Number(dlugosc) : null,
      mirror,
    }, env));

    return odpowiedz;
  },

  async trasuj(request, env) {
    const url = new URL(request.url);

    // 1) www → bez www. Kanonikalizacja hosta; drugi egzemplarz serwisu pod
    //    www to duplikat treści w oczach Google.
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      url.protocol = 'https:'; // od razu docelowy protokol — jeden przeskok zamiast dwoch
      return Response.redirect(url.toString(), 301);
    }

    // 1b) Adres testowy *.workers.dev serwuje pelna kopie serwisu. Bez tego
    //     Google moglby ja zaindeksowac jako duplikat calej domeny, a kara za
    //     duplikat trafilaby w adres wlasciwy. Roboty pytaja o robots.txt przed
    //     czymkolwiek innym, wiec ta jedna odpowiedz zamyka temat takze dla
    //     mirrorow serwowanych z pominieciem tego workera.
    const adresTestowy = url.hostname.endsWith('.workers.dev');
    if (url.pathname === '/robots.txt') {
      if (!adresTestowy) return zasob(env, url.origin, '/robots.txt');
      return new Response(`User-agent: *
Disallow: /
`, {
        headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': 'noindex' },
      });
    }

    const bezUkosnika = url.pathname.replace(/\/+$/, '') || '/';

    // 1c) Pliki i katalogi kropkowe → 404. Żadna trasa React tak nie wygląda,
    //     a bez tego /.env, /.git/config czy /.htaccess dostawały aplikację
    //     z kodem 200 — czyli soft 404, dokładnie to, czego pozbywamy się
    //     w kroku 4. Wyjątkiem jest /.well-known/, które bywa potrzebne
    //     (security.txt, weryfikacje usług).
    if (/\/\.[^/]/.test(url.pathname) && !url.pathname.startsWith('/.well-known/')) {
      return odpowiedzZ(await zasob(env, url.origin, '/404.html'), 404, adresTestowy);
    }

    // 2) Bot podglądu linków albo crawler modelu → mirror. Jeden i drugi nie
    //    uruchamia JavaScriptu, więc na trasie React zobaczyłby pustą skorupę.
    //    Człowiek tego nie zobaczy: warunek dotyczy wyłącznie User-Agenta.
    const ua = request.headers.get('user-agent') || '';
    if (BOTY_PODGLADU.test(ua) || BOTY_MODELI.test(ua)) {
      const mirror = MIRROR_POD_INNA_NAZWA[bezUkosnika]
        || (bezUkosnika === '/' || ROZSZERZENIE_PLIKU.test(bezUkosnika) ? null : bezUkosnika + '.html');
      if (mirror) {
        const odpowiedz = await zasob(env, url.origin, mirror);
        if (odpowiedz.status === 200) return oznaczMirror(odpowiedz);
      }
    }

    // 3) Katalog z index.html — odpowiednik DirectoryIndex Apache'a.
    //    Dotyczy /kultury/ i /wege/ (jedyne katalogi z index.html) oraz "/".
    //    UWAGA: dodanie public/<trasa>/index.html przesłoniłoby trasę React
    //    o tej nazwie. Stąd wyjątek ZAWSZE_APLIKACJA.
    if (!ROZSZERZENIE_PLIKU.test(url.pathname) && !ZAWSZE_APLIKACJA.has(bezUkosnika)) {
      const odpowiedz = await zasob(env, url.origin, (bezUkosnika === '/' ? '' : bezUkosnika) + '/index.html');
      if (odpowiedz.status === 200) return oznaczMirror(odpowiedz);
    }

    // 3b) Brakujący plik w /assets/ → 410 Gone, nie 404.
    //     Vite daje przy każdym buildzie nowe hashe w nazwach, więc Bing wraca po
    //     pliki z poprzedniego wdrożenia — w ciągu doby 83 odpowiedzi 4xx wobec 36
    //     poprawnych. Strony działały, marnował się budżet indeksowania. 410 znaczy
    //     „usunięte na stałe" i crawlery przestają pytać szybciej niż po 404, które
    //     zachęca do ponawiania tygodniami.
    //     WYŁĄCZNIE /assets/: reszta serwisu ma dalej dostawać 404, bo tam brak pliku
    //     bywa literówką w adresie, a nie plikiem skasowanym na zawsze.
    if (url.pathname.startsWith('/assets/')) {
      return odpowiedzZ(await zasob(env, url.origin, '/404.html'), 410, adresTestowy);
    }

    // 4) Brakujący plik z rozszerzeniem → prawdziwe 404 (nie index.html z 200).
    if (ROZSZERZENIE_PLIKU.test(url.pathname)) {
      const strona = await zasob(env, url.origin, '/404.html');
      return odpowiedzZ(strona, 404, adresTestowy);
    }

    // 5) Wszystko inne to trasa React — aplikacja rozstrzyga sama, czy strona
    //    istnieje. Odpowiedź nigdy nie może być cache'owana: pod tym adresem
    //    jutro może stać zupełnie co innego.
    return odpowiedzZ(await zasob(env, url.origin, '/index.html'), 200, adresTestowy);
  },
};

export default router;
