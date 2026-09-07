/**
 * Strona /boty-ai — mirror i feed JSON składane na żywo z widoków pub_*.
 *
 * DLACZEGO NIE GENERATOR I HARMONOGRAM: zlecenie proponowało tygodniowy
 * GitHub Action generujący HTML i wysyłający go FTP-em. FTP nie istnieje od
 * przeprowadzki na Cloudflare, a harmonogram, który raz padnie, zostawia stronę
 * z liczbami sprzed miesiąca — bez żadnego sygnału, że coś nie działa. Worker
 * i tak rozmawia z Supabase (wizyty-botow.js), więc składanie na miejscu jest
 * krótsze, zawsze aktualne i nie ma czego pilnować.
 *
 * KLUCZ: czytamy kluczem ANON, nie serwisowym. To nie jest ostrożność —
 * to test. Widoki pub_* mają być czytelne dla całego internetu; gdyby anon nie
 * wystarczał, znaczyłoby to, że uprawnienia są ustawione źle, a użycie klucza
 * serwisowego zamaskowałoby ten błąd aż do dnia, w którym strona pokaże pustkę.
 *
 * Klucz publikowalny nie jest sekretem — ten sam ciąg siedzi jawnie w buildzie
 * aplikacji React i widzi go każdy odwiedzający. Może więc stać w `vars`
 * w wrangler.jsonc albo być podany przez `wrangler secret put SUPABASE_ANON_KEY`;
 * kod czyta to samo miejsce w obu wariantach. Bez klucza strona nadal się
 * serwuje — z kreskami zamiast liczb i widoczną notką.
 */

const WIDOKI = [
  'pub_bot_podsumowanie',
  'pub_bot_wg_bota',
  'pub_bot_zachowanie',
  'pub_bot_cele',
  'pub_bot_metody',
  'pub_bot_kategorie',
  'pub_bot_pod_kogo',
];

// Godzina. Liczby narastające i okno 30 dni zmieniają się powoli, a strona
// nie ma być licznikiem na żywo — zlecenie wprost odrzuca efekciarstwo.
const CACHE_SEKUND = 3600;

// ---------------------------------------------------------------------------
// JEZYKI
// ---------------------------------------------------------------------------
// Ta sama tresc idzie w dwoch wersjach jezykowych z tych samych widokow pub_*.
// Slownik obejmuje NIE TYLKO slowa, ale i formatowanie liczb — i to jest tu
// najwazniejsze. Polskie „56,1" znaczy po angielsku 561, a „1 234" bez
// wlasciwego separatora czyta sie jak dwie liczby. Opublikowanie liczby, ktora
// w drugim jezyku znaczy co innego, byloby dokladnie tym rodzajem bledu, ktory
// ta strona opisuje.
export const JEZYKI = {
  pl: {
    kod: 'pl',
    tysiace: '\u00a0',   // spacja nierozdzielajaca: 15 321 nie moze sie zlamac
    dziesietny: ',',
    miesiace: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
      'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'],
    oGodzinie: 'godz.',
    brakDanych: 'Dane chwilowo niedostępne.',
    kotwicaAwaryjna: '<h2>Liczba, o którą chodzi</h2>',
    notkaAwaryjna:
      '<p><strong>Uwaga:</strong> chwilowo nie udało się pobrać aktualnych liczb '
      + 'z licznika, więc w miejscach liczbowych są kreski. Treść merytoryczna jest '
      + 'kompletna. Spróbuj odświeżyć za kilka minut.</p>',
    // Baza trzyma okresy bez ogonkow — to wartosci sterujace, nie tekst dla ludzi.
    slowa: {
      'przed zmiana metody': 'przed zmianą metody',
      'po zmianie metody': 'po zmianie metody',
    },
  },
  en: {
    kod: 'en',
    tysiace: ',',
    dziesietny: '.',
    miesiace: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'],
    oGodzinie: 'at',
    brakDanych: 'Data temporarily unavailable.',
    kotwicaAwaryjna: '<h2>The number this is about</h2>',
    notkaAwaryjna:
      '<p><strong>Note:</strong> current figures could not be fetched from the counter, '
      + 'so numeric slots show dashes. The substance of the page is complete. '
      + 'Try refreshing in a few minutes.</p>',
    slowa: {
      'przed zmiana metody': 'before the method change',
      'po zmianie metody': 'after the method change',
      // grupy
      oryginalne: 'genuine',
      falszowane: 'forged',
      niesprawdzone: 'unverifiable',
      // kategorie botow
      ai_crawler: 'ai_crawler',
      ai_uzytkownik: 'ai_user',
      wyszukiwarka: 'search_engine',
      narzedzie_seo: 'seo_tool',
      inne: 'other',
      // typy sciezek
      tresc: 'content',
      techniczna: 'technical',
      zasob: 'asset',
      sekret: 'secret',
      kod: 'code',
      kanarek: 'canary',
      // metody weryfikacji
      ip_lista: 'ip_list',
      asn_operatora: 'operator_asn',
      fcrdns: 'fcrdns',
      brak_metody: 'no_method',
      blad_sprawdzenia: 'check_failed',
      // etykieta ruchu bez deklaracji — pochodzi z bazy, nie z naglowka
      '(bez podpisu)': '(unsigned)',
    },
  },
};

// ---------------------------------------------------------------------------
// Formatowanie
// ---------------------------------------------------------------------------

/** Ucieczka znaków HTML. Nazwy botów pochodzą z nagłówka User-Agent, czyli
 *  z pola, które wypełnia obcy — nawet jeśli worker dopasowuje je do własnej
 *  listy, wyjście uciekamy zawsze. Jedna funkcja taniej niż jedno przeoczenie. */
function bezHtml(w) {
  return String(w ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Spacja nierozdzielająca co trzy cyfry — 15 321 nie może się złamać na końcu wiersza. */
function liczba(n, L = JEZYKI.pl) {
  if (n === null || n === undefined || n === '') return '—';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, L.tysiace);
}

/** Polski separator dziesiętny. Wartości z Postgresa przychodzą jako "58.3". */
function ulamek(n, L = JEZYKI.pl) {
  if (n === null || n === undefined || n === '') return '—';
  return String(n).replace('.', L.dziesietny);
}

function dataDlugo(iso, L = JEZYKI.pl) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getUTCDate()} ${L.miesiace[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function dataZGodzina(iso, L = JEZYKI.pl) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const gg = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dataDlugo(iso, L)}, ${L.oGodzinie} ${gg}:${mm} UTC`;
}

/** Etykiety, ktore baza trzyma jako wartosci sterujace (bez ogonkow, po
 *  polsku). Brak wpisu = zostawiamy jak jest. To celowe: nowa kategoria
 *  w bazie ma sie pokazac po swojemu, a nie zniknac albo wyjsc jako kreska. */
function etykieta(w, L = JEZYKI.pl) {
  return L.slowa[w] ?? w;
}

// ---------------------------------------------------------------------------
// Pobranie danych
// ---------------------------------------------------------------------------

async function pobierzDane(env) {
  const klucz = env.SUPABASE_ANON_KEY;
  if (!env.SUPABASE_URL || !klucz) return null;

  // allSettled, NIE all. Jeden brakujacy albo przemianowany widok nie ma prawa
  // wygasic calej strony — a wlasnie tak by bylo przy Promise.all, ktore odrzuca
  // calosc po pierwszym bledzie. Praktyczny skutek: mozna wdrozyc kod przed
  // zastosowaniem migracji, bo brakujacy widok da tylko jedna pusta tabele
  // z notka zamiast strony w kreskach.
  const wyniki = await Promise.allSettled(WIDOKI.map(async (widok) => {
    const odp = await fetch(`${env.SUPABASE_URL}/rest/v1/${widok}?select=*`, {
      headers: { apikey: klucz, authorization: `Bearer ${klucz}`, accept: 'application/json' },
    });
    if (!odp.ok) throw new Error(`${widok}: HTTP ${odp.status}`);
    return [widok, await odp.json()];
  }));

  const dane = {};
  for (const w of wyniki) {
    if (w.status === 'fulfilled') {
      dane[w.value[0]] = w.value[1];
    } else {
      console.warn('boty-ai: widok niedostepny —', w.reason?.message ?? w.reason);
    }
  }

  // Podsumowanie jest jedynym widokiem OBOWIAZKOWYM: bez niego nie ma liczby
  // naglowkowej ani daty stanu, wiec nie ma czego skladac.
  if (!dane.pub_bot_podsumowanie?.[0]) return null;
  return dane;
}

// ---------------------------------------------------------------------------
// Tabele
// ---------------------------------------------------------------------------

const PUSTA = (kolumn, L = JEZYKI.pl) =>
  `    <tr><td colspan="${kolumn}">${L.brakDanych}</td></tr>`;

function tabelaWgBota(w = [], L = JEZYKI.pl) {
  if (!w.length) return PUSTA(6, L);
  return w.map((r) => `    <tr><td>${bezHtml(etykieta(r.bot, L))}</td><td>${bezHtml(r.operator)}</td>`
    + `<td>${bezHtml(etykieta(r.kategoria, L))}</td><td>${liczba(r.oryginalne, L)}</td>`
    + `<td>${liczba(r.falszowane, L)}</td><td>${liczba(r.niesprawdzone, L)}</td></tr>`).join('\n');
}

function tabelaKategorie(w = [], L = JEZYKI.pl) {
  if (!w.length) return PUSTA(6, L);
  return w.map((r) => `    <tr><td>${bezHtml(etykieta(r.kategoria, L))}</td><td>${liczba(r.zadan, L)}</td>`
    + `<td>${liczba(r.oryginalne, L)}</td><td>${liczba(r.falszowane, L)}</td>`
    + `<td>${liczba(r.roznych_tozsamosci, L)}</td><td>${liczba(r.obsluzonych_mirrorem, L)}</td></tr>`).join('\n');
}

function tabelaZachowanie(w = [], L = JEZYKI.pl) {
  if (!w.length) return PUSTA(7, L);
  return w.map((r) => `    <tr><td>${bezHtml(etykieta(r.grupa, L))}</td>`
    + `<td>${bezHtml(etykieta(r.okres, L))}</td><td>${liczba(r.zadan, L)}</td>`
    + `<td>${liczba(r.odbite, L)}</td><td>${ulamek(r.proc_bledow, L)}%</td>`
    + `<td>${liczba(r.sredni_rozmiar, L)} B</td><td>${liczba(r.roznych_sciezek, L)}</td></tr>`).join('\n');
}

function tabelaCele(w = [], L = JEZYKI.pl) {
  if (!w.length) return PUSTA(4, L);
  return w.map((r) => `    <tr><td>${bezHtml(etykieta(r.grupa, L))}</td><td>${bezHtml(etykieta(r.sciezka_typ, L))}</td>`
    + `<td>${liczba(r.zadan, L)}</td><td>${ulamek(r.proc_grupy, L)}%</td></tr>`).join('\n');
}

function tabelaMetody(w = [], L = JEZYKI.pl) {
  if (!w.length) return PUSTA(4, L);
  return w.map((r) => `    <tr><td>${bezHtml(etykieta(r.metoda, L))}</td><td>${liczba(r.zadan, L)}</td>`
    + `<td>${liczba(r.potwierdzone, L)}</td><td>${liczba(r.zaprzeczone, L)}</td></tr>`).join('\n');
}

function tabelaPodKogo(w = [], L = JEZYKI.pl) {
  if (!w.length) return PUSTA(4, L);
  return w.map((r) => `    <tr><td>${bezHtml(etykieta(r.bot, L))}</td><td>${bezHtml(r.operator)}</td>`
    + `<td>${liczba(r.falszowane, L)}</td><td>${liczba(r.z_ilu_sieci, L)}</td></tr>`).join('\n');
}

// ---------------------------------------------------------------------------
// Żetony
// ---------------------------------------------------------------------------

const suma = (w, f) => w.reduce((a, r) => a + (Number(f(r)) || 0), 0);

/** Szereg `pub_bot_zachowanie` jest rozbity na okresy, więc „średni rozmiar
 *  u prawdziwych botów" nie jest jedną liczbą. Bierzemy wiersz o największej
 *  liczbie żądań w danej grupie — czyli ten, który opisuje główną masę pomiaru. */
function glownyWiersz(w = [], grupa) {
  return w.filter((r) => r.grupa === grupa)
          .sort((a, b) => (b.zadan || 0) - (a.zadan || 0))[0] ?? {};
}

function zbudujZetony(dane, L = JEZYKI.pl) {
  const p = dane.pub_bot_podsumowanie[0];
  const cele = dane.pub_bot_cele ?? [];
  const kat = dane.pub_bot_kategorie ?? [];
  const zach = dane.pub_bot_zachowanie ?? [];

  const wrazliwe = (grupa) => suma(
    cele.filter((r) => r.grupa === grupa && (r.sciezka_typ === 'sekret' || r.sciezka_typ === 'kod')),
    (r) => r.zadan);

  const kategoria = (n) => kat.find((r) => r.kategoria === n) ?? {};
  const oryg = glownyWiersz(zach, 'oryginalne');
  const falsz = glownyWiersz(zach, 'falszowane');

  const wszystkie = (Number(p.zadan_ogolem) || 0) + (Number(p.testy_wlasciciela) || 0);
  const procTestow = wszystkie
    ? Math.round(1000 * Number(p.testy_wlasciciela) / wszystkie) / 10
    : null;

  return {
    pomiar_od: dataDlugo(p.pomiar_od, L),
    stan_na: dataZGodzina(p.stan_na, L),
    stan_na_iso: String(p.stan_na ?? '').slice(0, 10),
    dni_pomiaru: liczba(p.dni_pomiaru, L),
    zadan_ogolem: liczba(p.zadan_ogolem, L),
    oryginalne: liczba(p.oryginalne, L),
    falszowane: liczba(p.falszowane, L),
    niesprawdzone: liczba(p.niesprawdzone, L),
    rozstrzygniete: liczba(p.rozstrzygniete, L),
    testy_wlasciciela: liczba(p.testy_wlasciciela, L),
    proc_wsrod_rozstrzygnietych: ulamek(p.proc_wsrod_rozstrzygnietych, L),
    proc_calosci: ulamek(p.proc_calosci, L),
    roznych_tozsamosci: liczba(p.roznych_tozsamosci, L),
    roznych_sieci: liczba(p.roznych_sieci, L),
    z_zapisana_metoda: liczba(p.z_zapisana_metoda, L),

    // Ruch bez deklaracji stoi POZA zadan_ogolem i poza oboma procentami —
    // widok pub_bot_podsumowanie liczy go osobnym podzapytaniem. Gdyby wpadl
    // do mianownika, liczba naglowkowa zmienilaby znaczenie bez ostrzezenia.
    bez_podpisu: liczba(p.bez_podpisu, L),

    proc_falszowanych: p.proc_wsrod_rozstrzygnietych === null ? '—'
      : ulamek(Math.round(10 * (100 - Number(p.proc_wsrod_rozstrzygnietych))) / 10, L),
    proc_testow: procTestow === null ? '—' : ulamek(procTestow, L),
    falszowane_wyszukiwarek: liczba(kategoria('wyszukiwarka').falszowane ?? 0, L),
    uzytkownik_zadan: liczba(kategoria('ai_uzytkownik').zadan ?? 0, L),
    uzytkownik_falszowane: liczba(kategoria('ai_uzytkownik').falszowane ?? 0, L),
    oryginalne_wrazliwe: liczba(wrazliwe('oryginalne'), L),
    falszowane_wrazliwe: liczba(wrazliwe('falszowane'), L),
    falszowane_tresc: liczba(suma(cele.filter((r) => r.grupa === 'falszowane' && r.sciezka_typ === 'tresc'), (r) => r.zadan), L),
    falszowane_cele: liczba(suma(cele.filter((r) => r.grupa === 'falszowane'), (r) => r.zadan), L),
    rozmiar_oryginalne: liczba(oryg.sredni_rozmiar, L),
    rozmiar_falszowane: liczba(falsz.sredni_rozmiar, L),
    bledy_oryginalne: ulamek(oryg.proc_bledow, L),
    bledy_falszowane: ulamek(falsz.proc_bledow, L),

    tabela_wg_bota: tabelaWgBota(dane.pub_bot_wg_bota, L),
    tabela_kategorie: tabelaKategorie(kat, L),
    tabela_zachowanie: tabelaZachowanie(zach, L),
    tabela_cele: tabelaCele(cele, L),
    tabela_metody: tabelaMetody(dane.pub_bot_metody, L),
    tabela_pod_kogo: tabelaPodKogo(dane.pub_bot_pod_kogo, L),
  };
}

/** Żetony na wypadek awarii Supabase. Strona ma się wyświetlić z treścią —
 *  cała warstwa merytoryczna jest statyczna i nie zależy od liczb. */
function zetonyAwaryjne(L = JEZYKI.pl) {
  return {
    stan_na_iso: new Date().toISOString().slice(0, 10),
    tabela_wg_bota: PUSTA(6, L),
    tabela_kategorie: PUSTA(6, L),
    tabela_zachowanie: PUSTA(7, L),
    tabela_cele: PUSTA(4, L),
    tabela_metody: PUSTA(4, L),
    tabela_pod_kogo: PUSTA(4, L),
  };
}

/**
 * Podstawienie z siatką bezpieczeństwa: cokolwiek zostanie w postaci {{...}},
 * zamieniamy na kreskę. Mirror wysłany w świat z widocznym {{proc_calosci}}
 * byłby najgłupszym możliwym błędem tej strony, a jest to dokładnie ten rodzaj
 * pomyłki, który przechodzi przez testy i wychodzi dopiero u czytelnika.
 */
function podstaw(szablon, zetony) {
  // Komentarz <!--DEV ... --> to kontrakt zetonow dla programisty. Nie ma czego
  // szukac w dokumencie, ktory czytaja modele jezykowe — a przy okazji zawiera
  // doslowne {{...}}, ktore psulyby sprawdzenie "zero klamer na produkcji".
  let out = szablon.replace(/<!--DEV[\s\S]*?-->\s*/g, '');
  for (const [k, v] of Object.entries(zetony)) {
    out = out.split(`{{${k}}}`).join(v);
  }
  return out.replace(/\{\{[a-z0-9_]+\}\}/gi, '—');
}

// ---------------------------------------------------------------------------
// Obsługa żądań
// ---------------------------------------------------------------------------

function zJsonem(obiekt, sekund) {
  return new Response(JSON.stringify(obiekt, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'cache-control': `public, max-age=${sekund}`,
    },
  });
}

export async function feedJson(request, env, ctx) {
  const cache = caches.default;
  const klucz = new Request(new URL(request.url).toString(), { method: 'GET' });
  const zCache = await cache.match(klucz);
  if (zCache) return zCache;

  const dane = await pobierzDane(env);
  if (!dane) {
    // Krótkie okno cache przy awarii: nie chcemy zabetonować błędu na godzinę.
    return zJsonem({ blad: 'dane chwilowo niedostepne' }, 60);
  }

  const p = dane.pub_bot_podsumowanie[0];
  const odp = zJsonem({
    zrodlo: 'https://mojaserowarnia.pl/boty-ai',
    licencja: 'CC BY 4.0',
    licencja_url: 'https://creativecommons.org/licenses/by/4.0/',
    atrybucja: 'Moja Serowarnia — mojaserowarnia.pl',
    opis: 'Agregaty zweryfikowanego ruchu botów. Bez adresow IP i bez pelnych sciezek.',
    stan_na: p.stan_na,
    pomiar_od: p.pomiar_od,
    dni_pomiaru: p.dni_pomiaru,
    zmiana_metody: p.zmiana_metody,
    podsumowanie: p,
    wg_bota: dane.pub_bot_wg_bota,
    kategorie: dane.pub_bot_kategorie,
    zachowanie: dane.pub_bot_zachowanie,
    cele: dane.pub_bot_cele,
    metody: dane.pub_bot_metody,
    pod_kogo: dane.pub_bot_pod_kogo,
  }, CACHE_SEKUND);

  ctx.waitUntil(cache.put(klucz, odp.clone()));
  return odp;
}

export async function mirrorHtml(request, env, ctx, szablon, L = JEZYKI.pl) {
  const cache = caches.default;
  const klucz = new Request(new URL(request.url).toString(), { method: 'GET' });
  const zCache = await cache.match(klucz);
  if (zCache) return zCache;

  const dane = await pobierzDane(env);
  let tresc = await szablon.text();

  if (dane) {
    tresc = podstaw(tresc, zbudujZetony(dane, L));
  } else {
    // Kotwica jest w jezyku szablonu — notka ma stanac nad liczba naglowkowa,
    // a nie w losowym miejscu albo (gdy naglowek sie nie zgadza) nigdzie.
    tresc = podstaw(tresc, zetonyAwaryjne(L))
      .replace(L.kotwicaAwaryjna, `${L.notkaAwaryjna}\n${L.kotwicaAwaryjna}`);
  }

  const odp = new Response(tresc, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': `public, max-age=${dane ? CACHE_SEKUND : 60}`,
    },
  });

  if (dane) ctx.waitUntil(cache.put(klucz, odp.clone()));
  return odp;
}

// ---------------------------------------------------------------------------
// RAPORTY — proxy do funkcji pub_raport_* z cache na brzegu
// ---------------------------------------------------------------------------
/**
 * DLACZEGO PRZEZ WORKERA, A NIE PROSTO Z PRZEGLĄDARKI DO SUPABASE:
 *
 *  • CACHE. Osiem raportów razy cztery okresy to 32 STAŁE odpowiedzi. Z cache
 *    na brzegu baza dostaje 32 zapytania na godzinę niezależnie od tego, czy
 *    stronę czyta jedna osoba, czy tysiąc. Bez tego każde kliknięcie każdego
 *    odwiedzającego to osobne zapytanie.
 *  • OGRANICZENIE TEMPA. Zlecenie proponowało regułę Cloudflare „na ścieżkę RPC
 *    Supabase" — to niewykonalne, bo przeglądarka woła *.supabase.co
 *    z pominięciem naszej strefy i Cloudflare tego ruchu nigdy nie widzi.
 *    Przez workera ruch idzie przez naszą domenę, więc reguła staje się możliwa.
 *  • DRUGIE SPRAWDZENIE PARAMETRÓW. Baza broni się sama (CASE na zamkniętym
 *    zbiorze), ale nazwa funkcji nie ma prawa pochodzić z adresu URL. Tutaj
 *    parametr jest KLUCZEM w mapie, nie fragmentem sklejanego napisu — żeby
 *    zbudować obce wywołanie, trzeba by dopisać wiersz do tego pliku.
 */

const RAPORTY = {
  kto_byl: 'pub_raport_kto_byl',
  co_odwiedzali: 'pub_raport_co_odwiedzali',
  sygnatura: 'pub_raport_sygnatura',
  pod_kogo: 'pub_raport_pod_kogo',
  incydenty: 'pub_raport_incydenty',
  w_czasie: 'pub_raport_w_czasie',
  czego_nie_bylo: 'pub_raport_czego_nie_bylo',
  porownanie: 'pub_raport_porownanie',
  po_co_przychodza: 'pub_raport_po_co_przychodza',
  bez_podpisu: 'pub_raport_bez_podpisu',
};

const OKRESY_DOZWOLONE = new Set(['24h', '7d', '30d', 'all']);

/**
 * Wersja ksztaltu raportow, wchodzaca do klucza cache.
 *
 * PO CO: klucz cache jest znormalizowany (?raport=X&okres=Y), zeby dwa zapisy
 * tych samych parametrow w innej kolejnosci nie robily dwoch wpisow. Skutek
 * uboczny: nie da sie wymusic odswiezenia doklejeniem czegokolwiek do adresu.
 * Przy zwyklej zmianie DANYCH to nie problem — godzina i tak minie. Przy
 * zmianie KSZTALTU raportu owszem: 6 wrzesnia poprawka funkcji
 * pub_raport_czego_nie_bylo zeszla z 41 wierszy smiecia do 1, a brzeg przez
 * godzine podawal stara wersje i wygladalo to na niezastosowana migracje.
 *
 * Podbic przy kazdej zmianie kolumn albo filtrow po stronie bazy.
 */
const WERSJA_RAPORTOW = 4;

export async function raportJson(request, env, ctx) {
  const url = new URL(request.url);
  const raport = url.searchParams.get('raport') ?? '';
  const okres = url.searchParams.get('okres') ?? '7d';

  // Nazwa funkcji bierze się z MAPY, nigdy z adresu. Wartość spoza listy
  // kończy się tutaj i nie dociera do bazy.
  const funkcja = Object.prototype.hasOwnProperty.call(RAPORTY, raport) ? RAPORTY[raport] : null;
  if (!funkcja || !OKRESY_DOZWOLONE.has(okres)) {
    return zJsonem({
      blad: 'nieznany raport lub okres',
      dostepne_raporty: Object.keys(RAPORTY),
      dostepne_okresy: [...OKRESY_DOZWOLONE],
    }, 0);
  }

  // Klucz cache w postaci znormalizowanej: ?okres=7d&raport=X i ?raport=X&okres=7d
  // to ma być JEDEN wpis, a nie dwa.
  const kluczUrl = `${url.origin}/api/raport?raport=${raport}&okres=${okres}&w=${WERSJA_RAPORTOW}`;
  const cache = caches.default;
  const zCache = await cache.match(new Request(kluczUrl));
  if (zCache) return zCache;

  const klucz = env.SUPABASE_ANON_KEY;
  if (!env.SUPABASE_URL || !klucz) {
    return zJsonem({ blad: 'raporty chwilowo niedostepne' }, 60);
  }

  try {
    const odp = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${funkcja}`, {
      method: 'POST',
      headers: {
        apikey: klucz,
        authorization: `Bearer ${klucz}`,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({ okres }),
    });
    if (!odp.ok) throw new Error(`HTTP ${odp.status}`);
    const wiersze = await odp.json();

    const gotowe = zJsonem({
      raport,
      okres,
      stan_na: new Date().toISOString(),
      zrodlo: 'https://mojaserowarnia.pl/boty-ai',
      licencja: 'CC BY 4.0',
      wierszy: Array.isArray(wiersze) ? wiersze.length : 0,
      dane: wiersze,
    }, CACHE_SEKUND);

    ctx.waitUntil(cache.put(new Request(kluczUrl), gotowe.clone()));
    return gotowe;
  } catch (e) {
    // Treść błędu z bazy NIE wychodzi na zewnątrz — do logu, nie do odpowiedzi.
    console.warn(`boty-ai: raport ${raport}/${okres} nie powiodl sie —`, e.message);
    return zJsonem({ blad: 'nie udalo sie pobrac danych' }, 60);
  }
}
