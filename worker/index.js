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

// Boty podglądu linków. Googlebota tu NIE MA celowo — indeksuje wersję
// kanoniczną (trasę React), a nie mirror. Lista 1:1 z dawnego .htaccess.
const BOTY_PODGLADU =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|TelegramBot|Discordbot|Pinterest|redditbot|Applebot|SkypeUriPreview|vkShare|Embedly/i;

// Trasy, których mirror leży pod INNĄ nazwą niż sama trasa. Reguła ogólna
// (ścieżka + ".html") ich nie złapie, więc bez tej mapy /baza-kultur dostawało
// generyczną grafikę zamiast własnego og:image.
const MIRROR_POD_INNA_NAZWA = {
  '/baza-kultur': '/kultury/baza.html',
  '/sery-wege': '/wege/index.html',
  '/kultury/przewodnik': '/kultury/index.html',
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

export default {
  async fetch(request, env) {
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

    // 2) Bot podglądu linków → mirror z własnym og:title/description/image.
    //    Człowiek tego nie zobaczy: warunek dotyczy wyłącznie User-Agenta.
    if (BOTY_PODGLADU.test(request.headers.get('user-agent') || '')) {
      const mirror = MIRROR_POD_INNA_NAZWA[bezUkosnika]
        || (bezUkosnika === '/' || ROZSZERZENIE_PLIKU.test(bezUkosnika) ? null : bezUkosnika + '.html');
      if (mirror) {
        const odpowiedz = await zasob(env, url.origin, mirror);
        if (odpowiedz.status === 200) return odpowiedz;
      }
    }

    // 3) Katalog z index.html — odpowiednik DirectoryIndex Apache'a.
    //    Dotyczy /kultury/ i /wege/ (jedyne katalogi z index.html) oraz "/".
    //    UWAGA: dodanie public/<trasa>/index.html przesłoniłoby trasę React
    //    o tej nazwie. Stąd wyjątek ZAWSZE_APLIKACJA.
    if (!ROZSZERZENIE_PLIKU.test(url.pathname) && !ZAWSZE_APLIKACJA.has(bezUkosnika)) {
      const odpowiedz = await zasob(env, url.origin, (bezUkosnika === '/' ? '' : bezUkosnika) + '/index.html');
      if (odpowiedz.status === 200) return odpowiedz;
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
