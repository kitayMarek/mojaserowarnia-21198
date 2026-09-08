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

import { zapiszWizyteBota, zapiszPrzyjscie } from './wizyty-botow.js';
import { feedJson, mirrorHtml, raportJson, JEZYKI } from './boty-ai.js';

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
  // Strona glowna: bot dostaje wlasna, statyczna mape tresci, a nie skorupe
  // React. Pod "/" lezy index.html aplikacji, wiec bez tego wpisu crawler
  // modelu widzial tam 13,8 kB tego samego, co czlowiek przed renderem.
  '/': '/index-mirror.html',
  '/baza-kultur': '/kultury/baza.html',
  '/sery-wege': '/wege/index.html',
  '/prawo': '/prawo/przewodnik.html',
  '/przepisy': '/przepisy/przewodnik.html',
};

// Odwrotnosc powyzszej mapy. Uzywana przy scalaniu adresow (regula 1a): dla
// zwyklego mirrora czysty adres to sciezka bez ".html", ale dla tych pieciu
// nazwa pliku i trasa nie maja ze soba nic wspolnego.
//
// ⚠ Trzymac zgodne z mapa wyzej. Rozjazd nie da bledu — da przekierowanie
// w zle miejsce, czyli najgorszy rodzaj usterki: taki, ktory dziala.
const TRASA_MIRRORA = Object.fromEntries(
  Object.entries(MIRROR_POD_INNA_NAZWA).map(([trasa, plik]) => [plik, trasa])
);

// Rozszerzenia, dla których brak pliku ma znaczyć PRAWDZIWE 404, a nie
// index.html z kodem 200. Dla Google taki „soft 404" (np. /assets/stary-chunk.js
// zwracające HTML) to sygnał niskiej jakości serwisu.
const ROZSZERZENIE_PLIKU =
  /\.(html|css|js|mjs|json|txt|xml|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|pdf|zip)$/i;

// Rozszerzenia, których ten serwis nie serwuje i nigdy nie będzie: nie ma tu
// żadnego języka po stronie serwera ani bazy do zrzucenia. Żądanie o taki plik
// jest z definicji skanem.
//
// ⚠ CELOWO BEZ `pl`: trasa /serowarnie/:slug przyjmuje dowolny slug, a ten
// bywa nazwą domeny („mleczarnia-example.pl"). Zysk z łapania skryptów Perla
// jest żaden, a koszt — prawdziwa strona pod prawdziwym adresem oddana jako 404.
const ROZSZERZENIE_OBCE =
  /\.(php\d?|phtml|asp|aspx|jsp|cgi|sh|bash|py|rb|exe|dll|bak|old|orig|save|swp|sql|db|sqlite|ini|conf|cfg|env|yml|yaml|toml|log|war|jar|tgz|tar|gz|rar|7z)$/i;

// Katalogi, o które pytają wyłącznie skanery podatności. Lista sprawdzona wobec
// wszystkich tras z src/App.tsx — żadna się z nią nie przecina. Uwaga przy
// dopisywaniu: „/admin" JEST prawdziwą trasą, więc tu stoi tylko „administrator".
//
// DRUGA RUNDA, 7.09.2026. Skan z AS23470 (264 żądania, 200 o pliki wrażliwe,
// 21 sekund) miał tylko 47% odbitych — reszta dostawała od nas skorupę React
// z kodem 200. Powód: pierwsza lista łapała katalogi znane z PHP i WordPressa,
// a nie łapała wzorców nowoczesnych: /api/*, /v1/*, /debug, /console, /status,
// /metrics, /config. Trafił się nawet /v1/chat/completions — ktoś szuka
// wystawionego na świat endpointu API modelu językowego.
//
// Wszystkie dopisane słowa to angielskie nazwy infrastrukturalne. Ten serwis ma
// slugi po polsku i treściowe, więc kolizja jest wykluczona — a i tak sprawdza
// to scripts/test-sciezki-skanera.mjs wobec kompletu tras.
//
// ⚠ „api" jest tu bezpieczne WYŁĄCZNIE dlatego, że nasze własne /api/raport
// obsługuje reguła 1b2, czyli PRZED tą. Przeniesienie tamtej niżej wyłączyłoby
// raporty na stronie.
const SCIEZKA_SKANERA =
  /^\/(wp-admin|wp-content|wp-includes|wp-json|wordpress|xmlrpc|graphql|graphiql|actuator|laravel|vendor|phpmyadmin|pma|myadmin|adminer|administrator|cgi-bin|solr|jenkins|struts|owa|autodiscover|telescope|_ignition|_profiler|server-status|server-info|phpinfo|backup|backups|dump|dumps|api|v1|v2|v3|debug|console|status|metrics|health|healthz|config|app|static|_next)(\/|$)/i;

// Pliki, ktore chcemy MIERZYC, wiec przechodza przez workera zamiast przez
// warstwe assetow (patrz run_worker_first w wrangler.jsonc).
//
// ⚠ MUSZA MIEC WLASNA OBSLUGE. Bez niej spadalyby do reguly 4, ktora na
// rozszerzenie z ROZSZERZENIE_PLIKU oddaje 404 — bo zaklada, ze istniejace
// pliki obsluzyla juz warstwa assetow. Dopisanie sciezki do run_worker_first
// bez dopisania jej tutaj WYLACZA plik.
const PLIKI_MIERZONE = new Set([
  '/sitemap.xml', '/llms.txt',
  // PROBA FORMATOW, 7.09.2026. Cztery pliki o tej samej tresci i roznych
  // rozszerzeniach: sprawdzamy, ktorych formatow narzedzia przegladania modeli
  // nie potrafia odczytac. Musza byc MIERZONE, bo caly wynik testu zalezy od
  // tego, czy model w ogole przyszedl — bez tego znowu czytalibysmy zero jako
  // odpowiedz, a to juz nas w tym tygodniu kosztowalo dwa falszywe wnioski.
  // DO USUNIECIA po zakonczeniu proby (razem z katalogiem public/proba/).
  '/proba/dane.xml', '/proba/dane.txt', '/proba/dane.json', '/proba/mapa.xml',

  // PROBA 8.09.2026: dwa najczesciej pobierane pliki statyczne.
  //
  // Panel Cloudflare pokazuje dla OpenAI 422 zadania na dobe, nasz licznik 49 —
  // osmiokrotna roznica, podczas gdy przy Google, Microsoft, Perplexity, Meta
  // i Amazon miescimy sie w granicach 0,5-1,5x. Gdyby przyczyna byly pliki
  // statyczne omijajace workera, roznica dotyczylaby WSZYSTKICH rowno.
  //
  // Te dwa pliki maja w panelu 785 i 650 zadan tygodniowo i dotad byly dla nas
  // niewidzialne. Jesli okaze sie, ze pobiera je glownie jeden operator —
  // zagadka rozwiazana. Jesli rozkladaja sie rowno — trzeba szukac dalej.
  //
  // DO USUNIECIA po rozstrzygnieciu: to sa zadania o ikone i obrazek, ktore
  // zasmiecaja raporty tresci.
  // og-image.jpg zastapil 8.09.2026 wersje .png (1,02 MB -> 87 kB, ok. 60%
  // calego transferu tygodniowego). Stara sciezka zostaje mierzona, bo pod
  // nia chodza podglady linkow udostepnionych wczesniej i zapamietane przez
  // crawlery - a to wlasnie ten ruch probujemy policzyc.
  '/favicon.ico', '/og-image.png', '/og-image.jpg',
]);

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

/**
 * Czy to bot, ktory NIE PRZEDSTAWIL SIE zadna znana nazwa.
 *
 * DLACZEGO TO ISTNIEJE: 7 wrzesnia 2026 Gemini poproszony o tresc /boty-ai
 * odpowiedzial, ze dostal "spis tresci portalu przypominajacy sitemape".
 * Dostal skorupe Reacta z awaryjnym <noscript> — bo jego User-Agent nie pasuje
 * do zadnego wzorca w BOTY_MODELI. Model tej klasy chodzi wiec po serwisie
 * i widzi mape zamiast artykulu, po ktory przyszedl.
 *
 * Lista nazw zawsze bedzie spozniona wobec rzeczywistosci — nowy bot pojawia
 * sie wczesniej, niz ktokolwiek dopisze go do regexa. Dlatego obok listy stoi
 * regula ogolna: zadanie BEZ naglowkow, ktore wysyla przegladarka, nie jest
 * zadaniem od czlowieka.
 *
 * ⚠ TEN SAM WARUNEK co w worker/wizyty-botow.js (funkcja zapiszWizyteBota).
 * Tam decyduje o LOGOWANIU, tu o SERWOWANIU.
 *
 * Od 8 wrzesnia 2026 strona logowania ma JEDEN wyjatek wiecej: zadanie
 * z naglowkami przegladarki, ale z opublikowanej sieci operatora, jest
 * zapisywane (agent chodzacy przegladarka). Tutaj tego wyjatku CELOWO NIE MA
 * — taki klient wykonuje JavaScript, wiec aplikacja React wyrenderuje mu sie
 * poprawnie i mirror nie jest mu do niczego potrzebny. Rozjazd jest swiadomy
 * i tylko w te strone: logujemy wiecej, niz serwujemy inaczej.
 *
 * Ryzyko pomylki jest asymetryczne i dlatego akceptowalne: czlowiek uznany za
 * bota dostanie mirror, czyli poprawna strone HTML z ta sama trescia — gorszy
 * uklad, ale nie brak tresci. Bot uznany za czlowieka dostaje pusta skorupe,
 * czyli nie dostaje nic.
 */
function botBezPodpisu(request) {
  return !(request.headers.get('sec-fetch-mode') || request.headers.get('accept-language'));
}

const router = {
  /**
   * Cały router siedzi w metodzie `trasuj` niżej — ta funkcja tylko go woła,
   * zdejmuje nagłówek techniczny i zleca zapis wizyty w tle. Zapis idzie przez
   * ctx.waitUntil(), czyli PO odesłaniu odpowiedzi: bot nie czeka na bazę ani
   * chwili, a awaria Supabase nie może przewrócić serwowania stron.
   */
  async fetch(request, env, ctx) {
    const surowa = await router.trasuj(request, env, ctx);

    const mirror = surowa.headers.get(MIRROR) === '1';
    let odpowiedz = surowa;
    if (mirror) {
      const naglowki = new Headers(surowa.headers);
      naglowki.delete(MIRROR);
      odpowiedz = new Response(surowa.body, { status: surowa.status, headers: naglowki });
    }

    // Rozmiar treści liczymy z klona, a nie z content-length: warstwa assetów
    // Cloudflare streamuje odpowiedź i tego nagłówka po prostu nie ustawia
    // (sprawdzone na produkcji — kolumna wychodziła w całości NULL). Objętość
    // jest tu istotna, bo u nas odróżnia pełny mirror od skorupy React:
    // bot na /prawo/rhd dostaje 40 kB, człowiek 13,8 kB.
    // Klon czytamy w tle, więc bot i tak nie czeka.
    const klon = odpowiedz.clone();
    ctx.waitUntil((async () => {
      let rozmiar = null;
      try {
        rozmiar = (await klon.arrayBuffer()).byteLength;
      } catch {
        // trudno — wizyta zapisze się bez rozmiaru
      }
      await zapiszWizyteBota(request, { status: odpowiedz.status, rozmiar, mirror }, env);
      await zapiszPrzyjscie(request, env);
    })());

    return odpowiedz;
  },

  async trasuj(request, env, ctx) {
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

    // 1a) SCALENIE ADRESOW: /x.html -> /x.
    //
    //     Kazdy mirror odpowiadal pod dwoma adresami naraz — czystym i z
    //     rozszerzeniem — oddajac identyczne bajty. Bing zaindeksowal WERSJE
    //     .html i cytowal ja czesciej niz kanoniczna: /przepisy/ser-topiony.html
    //     mial 84 cytowania, a /wedzenie-sera.html 31 przy 2 na adresie czystym.
    //     Ta sama strona, dwa wiersze w raporcie, podzielone sygnaly.
    //
    //     ⚠ DLACZEGO TUTAJ, A NIE W public/_redirects. Bo tam juz to raz bylo
    //     i wygasilo tresc na pietnastu stronach (docs/pulapki.md nr 5):
    //     warstwa przekierowan dziala PRZED workerem, wiec reguly serwujace
    //     botom mirror dostawaly 301 zamiast pliku i po cichu rezygnowaly.
    //     Worker siega po pliki przez env.ASSETS, ktore tego routera nie
    //     przechodzi — wiec stad przekierowanie jest niewidoczne dla wlasnych
    //     odczytow i dotyczy wylacznie zadan z zewnatrz.
    //
    //     Przekierowujemy TYLKO gdy plik faktycznie istnieje. Inaczej
    //     /wymyslona.html trafiloby na trase Reacta z kodem 200, czyli soft 404
    //     — dokladnie to, czego pozbywamy sie w regule 4.
    //
    //     Sprawdzone przed wdrozeniem: dla 101 mirrorow czysty adres oddaje
    //     botowi te sama tresc co .html (dwa wyjatki to /boty-ai i /en/ai-bots,
    //     rozne o 4 bajty, bo licza zywe liczby w chwili zadania).
    if (request.method === 'GET' && url.pathname.endsWith('.html')) {
      const trasa = TRASA_MIRRORA[url.pathname] ?? url.pathname.slice(0, -'.html'.length);
      const plik = await zasob(env, url.origin, url.pathname);
      if (plik.status === 200) {
        url.pathname = trasa;
        return Response.redirect(url.toString(), 301);
      }
    }

    // 1b2) Strona /boty-ai — mirror i feed składane na żywo z widoków pub_*.
    //
    //      ⚠ MUSI STAĆ PRZED REGUŁĄ 2. `public/boty-ai.html` nie jest gotowym
    //      dokumentem, tylko SZABLONEM z żetonami {{...}}. Reguła 2 oddaje botom
    //      „ścieżka + .html" prosto z warstwy assetów, więc bez tego wyjątku
    //      crawler modelu dostałby stronę z widocznym {{proc_calosci}} — i to
    //      właśnie ta wersja poszłaby do korpusów, bo ludzie chodzą po trasie
    //      React i nikt by tego nie zobaczył.
    //
    //      Żeby worker w ogóle zobaczył /boty-ai.html, obie ścieżki są wpisane
    //      w `run_worker_first` w wrangler.jsonc. Warstwa assetów odpowiada
    //      wcześniej niż worker i bez tego oddałaby surowy szablon.
    if (url.pathname === '/bot-stats.json') {
      return feedJson(request, env, ctx);
    }

    // Raporty interaktywne. Bez wpisu w run_worker_first — pliku o tej nazwie
    // nie ma w assetach, więc żądanie i tak spada do workera. Musi jednak stać
    // PRZED regułą 5, bo /api/raport nie ma rozszerzenia i catch-all SPA oddałby
    // na nie skorupę React z kodem 200 zamiast danych.
    if (url.pathname === '/api/raport') {
      return raportJson(request, env, ctx);
    }

    if (bezUkosnika === '/boty-ai' || url.pathname === '/boty-ai.html') {
      const uaBota = request.headers.get('user-agent') || '';
      const chceMirror = url.pathname === '/boty-ai.html'
        || BOTY_PODGLADU.test(uaBota) || BOTY_MODELI.test(uaBota)
        || botBezPodpisu(request);

      if (chceMirror) {
        const szablon = await zasob(env, url.origin, '/boty-ai.html');
        if (szablon.status === 200) {
          const gotowe = await mirrorHtml(request, env, ctx, szablon);
          // Jako mirror liczy się tylko podmiana na trasie React — bezpośrednie
          // wejście na .html jest zwykłym żądaniem pliku, tak jak w regule 2.
          return url.pathname === '/boty-ai.html' ? gotowe : oznaczMirror(gotowe);
        }
      }
      // Człowiek na /boty-ai leci dalej i dostaje trasę React (reguła 5).
    }

    // 1b2b) Angielska wersja tej samej strony. Skladana z TYCH SAMYCH widokow
    //       pub_*, tylko przez slownik JEZYKI.en — liczby dostaja angielskie
    //       separatory, a etykiety z bazy angielskie nazwy.
    //
    //       Roznica wobec wersji polskiej: NIE MA tu trasy React, wiec mirror
    //       dostaje kazdy — czlowiek i bot. To jest swiadomy wybor, nie brak:
    //       cala wartosc tej strony to tekst i tabele, a interaktywne raporty
    //       zostaja po polskiej stronie, do ktorej stad prowadzi odsylacz.
    //       Dzieki temu nie ma dwoch kompletów tresci do utrzymania.
    if (bezUkosnika === '/en/ai-bots' || url.pathname === '/en/ai-bots.html') {
      const szablon = await zasob(env, url.origin, '/en/ai-bots.html');
      if (szablon.status === 200) {
        const gotowe = await mirrorHtml(request, env, ctx, szablon, JEZYKI.en);
        return url.pathname === '/en/ai-bots.html' ? gotowe : oznaczMirror(gotowe);
      }
      // Gdyby pliku zabraklo — lecimy dalej i konczy sie zwyklym 404.
    }

    // 1b3) Pliki mierzone — oddajemy zawartosc, a licznik zapisze wizyte
    //      w zwykly sposob (przez router.fetch, ktory wola zapiszWizyteBota).
    if (PLIKI_MIERZONE.has(url.pathname)) {
      const plik = await zasob(env, url.origin, url.pathname);
      if (plik.status === 200) return plik;
      // Gdyby pliku zabraklo — lecimy dalej i konczy sie normalnym 404.
    }

    // 1c) Pliki i katalogi kropkowe → 404. Żadna trasa React tak nie wygląda,
    //     a bez tego /.env, /.git/config czy /.htaccess dostawały aplikację
    //     z kodem 200 — czyli soft 404, dokładnie to, czego pozbywamy się
    //     w kroku 4. Wyjątkiem jest /.well-known/, które bywa potrzebne
    //     (security.txt, weryfikacje usług).
    if (/\/\.[^/]/.test(url.pathname) && !url.pathname.startsWith('/.well-known/')) {
      return odpowiedzZ(await zasob(env, url.origin, '/404.html'), 404, adresTestowy);
    }

    // 1d) Ścieżki, które może chcieć wyłącznie skaner → 404. Krok 1c łapał tylko
    //     adresy kropkowe, a krok 4 tylko rozszerzenia, które faktycznie u nas
    //     występują. Wszystko poza tym spadało do kroku 5, czyli dostawało
    //     skorupę React z kodem 200.
    //
    //     ZMIERZONE 05.09.2026 na produkcji: /wp-login.php, /graphql, /wp-admin/
    //     i /actuator/health zwracały 200 i 14 252 B. Skutki były trzy:
    //       • soft 404 — dla Google sygnał niskiej jakości serwisu,
    //       • skaner dostaje 200 i wnioskuje, że WordPress tu stoi, więc wraca,
    //       • nasz własny wskaźnik błędów przestaje działać: skan z AS1004 miał
    //         w liczniku 27% odbitych zamiast ~100%, bo 52 z 72 żądań o pliki
    //         z sekretami odesłaliśmy z kodem 200.
    //
    //     Trzeci punkt jest tu najważniejszy, bo `odbite` to jeden z sygnałów
    //     punktacji w zrodla_botow(). Serwer psuł pomiar, który sam zasila.
    //
    //     ⚠ Ta sama wiedza żyje w dwóch miejscach: tu i w SQL-owej typ_sciezki().
    //     Nie da się tego scalić — worker nie sięga do bazy w ścieżce żądania.
    //     Przy zmianie listy zajrzeć w obie.
    if (SCIEZKA_SKANERA.test(url.pathname) || ROZSZERZENIE_OBCE.test(url.pathname)) {
      return odpowiedzZ(await zasob(env, url.origin, '/404.html'), 404, adresTestowy);
    }

    // 2) Bot podglądu linków albo crawler modelu → mirror. Jeden i drugi nie
    //    uruchamia JavaScriptu, więc na trasie React zobaczyłby pustą skorupę.
    //    Człowiek tego nie zobaczy: warunek dotyczy wyłącznie User-Agenta.
    const ua = request.headers.get('user-agent') || '';
    if (BOTY_PODGLADU.test(ua) || BOTY_MODELI.test(ua) || botBezPodpisu(request)) {
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
      // Jako mirror liczą się katalogi treści (/kultury/, /wege/) — tam index.html
      // to prawdziwy dokument dla botów. Strona główna NIE: pod "/" leży index.html
      // aplikacji React, czyli skorupa. Bot pod "/" i tak tu nie dojdzie — łapie go
      // wcześniej reguła 2, która oddaje mu /index-mirror.html. Oznaczenie jej jako mirrora zafałszowałoby
      // widok bot_czytane_strony. Wyszło na produkcji: prawdziwy ChatGPT-User dostał
      // pod "/" 13 810 B — tyle samo, co człowiek na trasie React.
      if (odpowiedz.status === 200) {
        return bezUkosnika === '/' ? odpowiedz : oznaczMirror(odpowiedz);
      }
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
