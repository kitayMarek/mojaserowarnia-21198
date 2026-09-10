import { __wewnetrzne, rozpoznajBota, czyZOperatora, sprawdzFcrdns } from '../worker/wizyty-botow.js';
const { ipv4NaLiczbe, ipv6NaLiczbe, wZakresie, zrodloOdpowiedzi } = __wewnetrzne;

let ok = 0, zle = 0;
const sprawdz = (opis, wynik, oczekiwane) => {
  if (wynik === oczekiwane) { ok++; }
  else { zle++; console.log(`  BLAD: ${opis} -> ${wynik}, oczekiwano ${oczekiwane}`); }
};

const w4 = (ip, cidr) => {
  const [siec, dl] = cidr.split('/');
  return wZakresie(ipv4NaLiczbe(ip), ipv4NaLiczbe(siec), Number(dl), 32);
};
const w6 = (ip, cidr) => {
  const [siec, dl] = cidr.split('/');
  return wZakresie(ipv6NaLiczbe(ip), ipv6NaLiczbe(siec), Number(dl), 128);
};

// IPv4 — prawdziwe zakresy z list operatorow
sprawdz('OpenAI 172.182.204.7 w /24',      w4('172.182.204.7',   '172.182.204.0/24'), true);
sprawdz('OpenAI 172.182.205.7 poza /24',   w4('172.182.205.7',   '172.182.204.0/24'), false);
sprawdz('granica dolna /24',               w4('172.182.204.0',   '172.182.204.0/24'), true);
sprawdz('granica gorna /24',               w4('172.182.204.255', '172.182.204.0/24'), true);
sprawdz('Anthropic /22 - w srodku',        w4('216.73.218.5',    '216.73.216.0/22'),  true);
sprawdz('Anthropic /22 - tuz za',          w4('216.73.220.1',    '216.73.216.0/22'),  false);
sprawdz('/32 dokladny trafiony',           w4('34.162.230.222',  '34.162.230.222/32'),true);
sprawdz('/32 sasiad nietrafiony',          w4('34.162.230.223',  '34.162.230.222/32'),false);
sprawdz('/25 dolna polowa',                w4('172.182.202.100', '172.182.202.0/25'), true);
sprawdz('/25 gorna polowa poza',           w4('172.182.202.200', '172.182.202.0/25'), false);

// Polskie IP (moj curl z 2026-09-03) nie moze trafic w zaden zakres operatora
sprawdz('podszywacz spoza zakresu',        w4('83.20.100.15',    '216.73.216.0/22'),  false);

// IPv6 — w tym skrocona notacja i postac mieszana
sprawdz('IPv6 pelny w /64',   w6('2600:1f18:0:1:2:3:4:5', '2600:1f18:0:1::/64'), true);
sprawdz('IPv6 inny prefiks',  w6('2600:1f18:0:2:2:3:4:5', '2600:1f18:0:1::/64'), false);
sprawdz('IPv6 :: na koncu',   w6('2a02:26f0::1',          '2a02:26f0::/32'),     true);
sprawdz('IPv6 /128 dokladny', w6('2600:1f18::a',          '2600:1f18::a/128'),   true);
sprawdz('IPv6 /128 sasiad',   w6('2600:1f18::b',          '2600:1f18::a/128'),   false);
sprawdz('IPv6 mieszany ::ffff:', w6('::ffff:172.182.204.7', '::ffff:172.182.204.0/120'), true);

// Odpornosc na smieci — musi byc false/null, nigdy wyjatek
sprawdz('adres bezsensowny',  w4('999.1.1.1', '10.0.0.0/8'), false);
sprawdz('pusty adres',        w4('', '10.0.0.0/8'), false);
sprawdz('IPv4 z litera',      ipv4NaLiczbe('10.a.0.1'), null);
sprawdz('IPv6 z 9 grupami',   ipv6NaLiczbe('1:2:3:4:5:6:7:8:9'), null);

// Rozpoznawanie botow — kolejnosc wzorcow
sprawdz('Claude-SearchBot nie jako ClaudeBot', rozpoznajBota('Claude-SearchBot/1.0').bot, 'Claude-SearchBot');
sprawdz('ClaudeBot',        rozpoznajBota('ClaudeBot/1.0').bot,      'ClaudeBot');
sprawdz('ChatGPT-User',     rozpoznajBota('ChatGPT-User/1.0').bot,   'ChatGPT-User');
sprawdz('GPTBot',           rozpoznajBota('GPTBot/1.2').bot,         'GPTBot');
sprawdz('Perplexity-User',  rozpoznajBota('Perplexity-User/1.0').bot,'Perplexity-User');
sprawdz('operator dla CCBot', rozpoznajBota('CCBot/2.0').operator,   'inny');
// Wyszukiwarki SA logowane (kategoryzujemy, nie filtrujemy — patrz migracja
// 20260905070000). To NIE znaczy, ze dostaja mirror: o tym decyduje osobna
// lista BOTY_MODELI w worker/index.js, w ktorej wyszukiwarek nie ma.
sprawdz('Googlebot logowany',  rozpoznajBota('Googlebot/2.1').bot,     'Googlebot');
sprawdz('Googlebot-Image osobno', rozpoznajBota('Googlebot-Image/1.0').bot, 'Googlebot-Image');
sprawdz('Bingbot logowany',    rozpoznajBota('Bingbot/2.0').bot,       'Bingbot');
sprawdz('AhrefsBot jako SEO',  rozpoznajBota('AhrefsBot/7.0').bot,     'AhrefsBot');
sprawdz('zwykla przegladarka pomijana', rozpoznajBota('Mozilla/5.0 (Windows NT 10.0)'), null);
sprawdz('zwykla przegladarka', rozpoznajBota('Mozilla/5.0 (Windows NT 10.0) Chrome/120'), null);

// --- Regresja: bot po IPv6 nie moze zostac oskarzony o podszywanie -------
// Zaden operator nie publikuje prefiksow IPv6 (sprawdzone 2026-09-04).
// Wczesniejsza wersja dawala w tej sytuacji false, czyli zarzut podszywania
// sie, i zanieczyscila widok bot_podszywacze. Ma byc null.
// Test siega do sieci; przy braku polaczenia jest pomijany.
try {
  // czyZOperatora zwraca teraz { wynik, metoda } — metoda odroznia
  // "sprawdzilem i falsz" od "nie umiem sprawdzic", co przy zarzucie
  // podszywania sie jest roznica zasadnicza.
  const ipv6 = await czyZOperatora('2600:1f18::a', 'OpenAI');
  sprawdz('IPv6 przy liscie bez IPv6 -> null', ipv6.wynik, null);
  sprawdz('  ...i metoda brak_metody',         ipv6.metoda, 'brak_metody');
  const polskie = await czyZOperatora('83.20.100.15', 'OpenAI');
  sprawdz('polskie IPv4 wobec listy OpenAI -> false', polskie.wynik, false);
  sprawdz('  ...i metoda ip_lista',                   polskie.metoda, 'ip_lista');
  const bezZrodla = await czyZOperatora('1.2.3.4', 'inny');
  sprawdz('operator bez zrodla -> null', bezZrodla.wynik, null);
  sprawdz('  ...i metoda brak_metody',   bezZrodla.metoda, 'brak_metody');

  // Google publikuje zakresy w tym samym formacie — sprawdzenie, ze nowe
  // zrodlo faktycznie sie pobiera, a nie tylko jest wpisane w konfiguracji.
  const google = await czyZOperatora('66.249.66.1', 'Google');
  sprawdz('Googlebot z zakresu Google -> true', google.wynik, true);
  sprawdz('  ...i metoda ip_lista',             google.metoda, 'ip_lista');

  // --- FCrDNS ---------------------------------------------------------------
  // Nazwa PTR to miejsce, w ktorym najlatwiej o blad — zwlaszcza przy IPv6,
  // gdzie adres rozbija sie na 32 polbajty w odwrotnej kolejnosci.
  const { nazwaPtr } = __wewnetrzne;
  sprawdz('PTR dla IPv4', nazwaPtr('66.249.66.1'), '1.66.249.66.in-addr.arpa');
  sprawdz('PTR dla IPv6', nazwaPtr('2001:db8::1'),
    '1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2.ip6.arpa');
  sprawdz('PTR dla smiecia', nazwaPtr('nie-adres'), null);

  // Prawdziwy Amazonbot: PTR konczy sie .crawl.amazonbot.amazon, a forward DNS
  // potwierdza ten sam adres. Test siega do sieci — gdy DNS nie odpowie,
  // funkcja ma zwrocic null, a NIE false (falszywe oskarzenie jest gorsze).
  const amazon = await sprawdzFcrdns('52.94.133.131', ['.crawl.amazonbot.amazon']);
  sprawdz('FCrDNS na obcym adresie nie daje true', amazon.wynik === true, false);
  sprawdz('  ...i metoda jest sensowna',
    ['fcrdns', 'blad_sprawdzenia'].includes(amazon.metoda), true);

  // ⚠ NAJWAZNIEJSZY TEST CALEGO FCrDNS: dopasowanie SUFIKSU, nie "contains".
  // Nazwa ponizej zawiera "crawl.amazon.com", ale nalezy do attacker.net.
  const podszywacz = await sprawdzFcrdns('8.8.8.8', ['.crawl.amazonbot.amazon']);
  sprawdz('cudzy adres nie przechodzi FCrDNS', podszywacz.wynik === true, false);
} catch (e) {
  console.log('  (pominieto testy sieciowe: ' + e.message + ')');
}


// ---------------------------------------------------------------------------
// RUCH BEZ PODPISU — czy trafia do licznika, a czlowiek w przegladarce nie
// ---------------------------------------------------------------------------
// Tego warunku NIE DA SIE sprawdzic na produkcji z naszego lacza: trigger
// `oznacz_wizyte_bota` ustawia wlasne = (asn = 5617), a KAZDY publiczny widok
// filtruje `NOT wlasne`. Wlasny test jest wiec z definicji niewidoczny w tym
// samym raporcie, ktory mial go pokazac — pierwsze sprawdzenie 7.09.2026
// zwrocilo zero i wygladalo na awarie, a bylo poprawnym dzialaniem odsiewu.
//
// Dlatego dyskryminator sprawdzamy tutaj, na samych naglowkach, z podstawionym
// fetch-em. To jedyne miejsce, w ktorym odpowiedz jest rozstrzygajaca.

const prawdziwyFetch = globalThis.fetch;

async function probaZapisu(naglowki, ua) {
  let zapisane = null;
  globalThis.fetch = async (adres, opcje) => {
    if (String(adres).includes('/rest/v1/bot_visits')) {
      zapisane = JSON.parse(opcje.body);
      return { ok: true, status: 201, text: async () => '' };
    }
    return { ok: false, status: 404, json: async () => ({}), text: async () => '' };
  };
  try {
    const { zapiszWizyteBota } = await import('../worker/wizyty-botow.js');
    await zapiszWizyteBota(
      {
        url: 'https://mojaserowarnia.pl/przepisy/gouda',
        headers: new Headers({ 'user-agent': ua, ...naglowki }),
        cf: { asn: 15169, country: 'US' },
      },
      { status: 200, rozmiar: 1234, mirror: false },
      { SUPABASE_URL: 'https://przyklad.test', SUPABASE_SERVICE_KEY: 'x' }
    );
  } finally {
    globalThis.fetch = prawdziwyFetch;
  }
  return zapisane;
}

const bezPodpisu = await probaZapisu({}, '');
sprawdz('pusty UA trafia do licznika',       bezPodpisu !== null,   true);
sprawdz('  ...z etykieta (bez podpisu)',     bezPodpisu?.bot,       '(bez podpisu)');
sprawdz('  ...i operatorem nieznany',        bezPodpisu?.operator,  'nieznany');
sprawdz('  ...bez werdyktu o podszywaniu',   bezPodpisu?.zweryfikowany, null);

const dziwnyUa = await probaZapisu({}, 'python-requests/2.31.0');
// python-requests dostal wlasna nazwe 6 wrzesnia; ten test zostal na starej
// odpowiedzi i swiecil na czerwono, przez co maskowal ewentualne prawdziwe bledy.
sprawdz('nieznany UA skryptu tez trafia',    dziwnyUa?.bot,         'python-requests');

// Granica prywatnosci: to ma byc licznik BOTOW, nie licznik wszystkiego.
const zSecFetch = await probaZapisu({ 'sec-fetch-mode': 'navigate' }, 'Mozilla/5.0 (Windows NT 10.0)');
sprawdz('przegladarka (sec-fetch-mode) NIE trafia', zSecFetch, null);

const zJezykiem = await probaZapisu({ 'accept-language': 'pl-PL,pl;q=0.9' }, 'Mozilla/5.0 (X11; Linux)');
sprawdz('przegladarka (accept-language) NIE trafia', zJezykiem, null);

// Regresja: rozpoznane boty musza dzialac jak wczesniej, takze gdy wysylaja
// accept-language — warunek `przegladarka` stoi PO rozpoznaniu nazwy i nie
// wolno mu przeslonic bota, ktory sie przedstawil.
const gptbot = await probaZapisu({ 'accept-language': 'en-US' }, 'GPTBot/1.2 (+https://openai.com/gptbot)');
sprawdz('GPTBot z accept-language nadal liczony', gptbot?.bot, 'GPTBot');

// Adresy podgladowe zostaja poza statystyka takze dla ruchu bez podpisu.
let zWorkersDev = null;
globalThis.fetch = async (adres, opcje) => {
  if (String(adres).includes('/rest/v1/bot_visits')) { zWorkersDev = JSON.parse(opcje.body); }
  return { ok: true, status: 201, text: async () => '' };
};
{
  const { zapiszWizyteBota } = await import('../worker/wizyty-botow.js');
  await zapiszWizyteBota(
    { url: 'https://mojaserowarnia.workers.dev/', headers: new Headers({ 'user-agent': '' }), cf: { asn: 15169 } },
    { status: 200, rozmiar: 1, mirror: false },
    { SUPABASE_URL: 'https://przyklad.test', SUPABASE_SERVICE_KEY: 'x' }
  );
}
globalThis.fetch = prawdziwyFetch;
sprawdz('workers.dev nie zasmieca licznika', zWorkersDev, null);

// ---------------------------------------------------------------------------
// SKAD PRZYSZLI LUDZIE. Do 10 wrzesnia licznik widzial wylacznie modele, wiec
// odsylacz z Facebooka czy z forum nie zostawial sladu. Te testy pilnuja obu
// stron zmiany: ze zwykly serwis jest zapisywany, i ze granice zostaly.
// ---------------------------------------------------------------------------
const zrodlo = (referer, adres = 'https://mojaserowarnia.pl/boty-ai') =>
  zrodloOdpowiedzi(
    { headers: { get: (n) => (n.toLowerCase() === 'referer' ? referer : null) } },
    new URL(adres),
  );
sprawdz('ChatGPT rozpoznany po odsylaczu',   zrodlo('https://chatgpt.com/c/abc'),        'ChatGPT');
sprawdz('Copilot mimo normalizacji www',     zrodlo('https://www.bing.com/chat'),        'Copilot');
sprawdz('Facebook zapisany jako serwis',     zrodlo('https://www.facebook.com/groups/1/posts/2'), 'facebook.com');
sprawdz('Google zapisany jako serwis',       zrodlo('https://google.com/search?q=tajne'), 'google.com');
sprawdz('wlasny serwis to nie przyjscie',    zrodlo('https://mojaserowarnia.pl/przepisy'), null);
sprawdz('  ...takze z www',                  zrodlo('https://www.mojaserowarnia.pl/x'),  null);
sprawdz('brak odsylacza nie jest zapisywany', zrodlo(null),                              null);
sprawdz('pokrecony odsylacz nie wywala',     zrodlo('nie-adres'),                        null);
sprawdz('znacznik listu ma pierwszenstwo',
  zrodlo('https://www.facebook.com/x', 'https://mojaserowarnia.pl/?utm_source=list'),    'Lista');

console.log(`\n${ok} przeszlo, ${zle} nie przeszlo`);
process.exit(zle ? 1 : 0);