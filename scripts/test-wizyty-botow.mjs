import { __wewnetrzne, rozpoznajBota, czyZOperatora } from '../worker/wizyty-botow.js';
const { ipv4NaLiczbe, ipv6NaLiczbe, wZakresie } = __wewnetrzne;

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
} catch (e) {
  console.log('  (pominieto testy sieciowe: ' + e.message + ')');
}

console.log(`\n${ok} przeszlo, ${zle} nie przeszlo`);
process.exit(zle ? 1 : 0);
