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

const MIESIACE = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];

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
function liczba(n) {
  if (n === null || n === undefined || n === '') return '—';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Polski separator dziesiętny. Wartości z Postgresa przychodzą jako "58.3". */
function ulamek(n) {
  if (n === null || n === undefined || n === '') return '—';
  return String(n).replace('.', ',');
}

function dataDlugo(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getUTCDate()} ${MIESIACE[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function dataZGodzina(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const gg = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dataDlugo(iso)}, godz. ${gg}:${mm} UTC`;
}

// SQL trzyma okresy bez ogonków (wartości sterujące, nie tekst dla ludzi).
// Tłumaczenie na wyjściu, żeby baza nie musiała znać polskiej ortografii.
const OKRESY = {
  'przed zmiana metody': 'przed zmianą metody',
  'po zmianie metody': 'po zmianie metody',
};

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

const PUSTA = (kolumn) =>
  `    <tr><td colspan="${kolumn}">Dane chwilowo niedostępne.</td></tr>`;

function tabelaWgBota(w = []) {
  if (!w.length) return PUSTA(6);
  return w.map((r) => `    <tr><td>${bezHtml(r.bot)}</td><td>${bezHtml(r.operator)}</td>`
    + `<td>${bezHtml(r.kategoria)}</td><td>${liczba(r.oryginalne)}</td>`
    + `<td>${liczba(r.falszowane)}</td><td>${liczba(r.niesprawdzone)}</td></tr>`).join('\n');
}

function tabelaKategorie(w = []) {
  if (!w.length) return PUSTA(6);
  return w.map((r) => `    <tr><td>${bezHtml(r.kategoria)}</td><td>${liczba(r.zadan)}</td>`
    + `<td>${liczba(r.oryginalne)}</td><td>${liczba(r.falszowane)}</td>`
    + `<td>${liczba(r.roznych_tozsamosci)}</td><td>${liczba(r.obsluzonych_mirrorem)}</td></tr>`).join('\n');
}

function tabelaZachowanie(w = []) {
  if (!w.length) return PUSTA(7);
  return w.map((r) => `    <tr><td>${bezHtml(r.grupa)}</td>`
    + `<td>${bezHtml(OKRESY[r.okres] ?? r.okres)}</td><td>${liczba(r.zadan)}</td>`
    + `<td>${liczba(r.odbite)}</td><td>${ulamek(r.proc_bledow)}%</td>`
    + `<td>${liczba(r.sredni_rozmiar)} B</td><td>${liczba(r.roznych_sciezek)}</td></tr>`).join('\n');
}

function tabelaCele(w = []) {
  if (!w.length) return PUSTA(4);
  return w.map((r) => `    <tr><td>${bezHtml(r.grupa)}</td><td>${bezHtml(r.sciezka_typ)}</td>`
    + `<td>${liczba(r.zadan)}</td><td>${ulamek(r.proc_grupy)}%</td></tr>`).join('\n');
}

function tabelaMetody(w = []) {
  if (!w.length) return PUSTA(4);
  return w.map((r) => `    <tr><td>${bezHtml(r.metoda)}</td><td>${liczba(r.zadan)}</td>`
    + `<td>${liczba(r.potwierdzone)}</td><td>${liczba(r.zaprzeczone)}</td></tr>`).join('\n');
}

function tabelaPodKogo(w = []) {
  if (!w.length) return PUSTA(4);
  return w.map((r) => `    <tr><td>${bezHtml(r.bot)}</td><td>${bezHtml(r.operator)}</td>`
    + `<td>${liczba(r.falszowane)}</td><td>${liczba(r.z_ilu_sieci)}</td></tr>`).join('\n');
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

function zbudujZetony(dane) {
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
    pomiar_od: dataDlugo(p.pomiar_od),
    stan_na: dataZGodzina(p.stan_na),
    stan_na_iso: String(p.stan_na ?? '').slice(0, 10),
    dni_pomiaru: liczba(p.dni_pomiaru),
    zadan_ogolem: liczba(p.zadan_ogolem),
    oryginalne: liczba(p.oryginalne),
    falszowane: liczba(p.falszowane),
    niesprawdzone: liczba(p.niesprawdzone),
    rozstrzygniete: liczba(p.rozstrzygniete),
    testy_wlasciciela: liczba(p.testy_wlasciciela),
    proc_wsrod_rozstrzygnietych: ulamek(p.proc_wsrod_rozstrzygnietych),
    proc_calosci: ulamek(p.proc_calosci),
    roznych_tozsamosci: liczba(p.roznych_tozsamosci),
    roznych_sieci: liczba(p.roznych_sieci),
    z_zapisana_metoda: liczba(p.z_zapisana_metoda),

    proc_falszowanych: p.proc_wsrod_rozstrzygnietych === null ? '—'
      : ulamek(Math.round(10 * (100 - Number(p.proc_wsrod_rozstrzygnietych))) / 10),
    proc_testow: procTestow === null ? '—' : ulamek(procTestow),
    falszowane_wyszukiwarek: liczba(kategoria('wyszukiwarka').falszowane ?? 0),
    uzytkownik_zadan: liczba(kategoria('ai_uzytkownik').zadan ?? 0),
    uzytkownik_falszowane: liczba(kategoria('ai_uzytkownik').falszowane ?? 0),
    oryginalne_wrazliwe: liczba(wrazliwe('oryginalne')),
    falszowane_wrazliwe: liczba(wrazliwe('falszowane')),
    falszowane_tresc: liczba(suma(cele.filter((r) => r.grupa === 'falszowane' && r.sciezka_typ === 'tresc'), (r) => r.zadan)),
    falszowane_cele: liczba(suma(cele.filter((r) => r.grupa === 'falszowane'), (r) => r.zadan)),
    rozmiar_oryginalne: liczba(oryg.sredni_rozmiar),
    rozmiar_falszowane: liczba(falsz.sredni_rozmiar),
    bledy_oryginalne: ulamek(oryg.proc_bledow),
    bledy_falszowane: ulamek(falsz.proc_bledow),

    tabela_wg_bota: tabelaWgBota(dane.pub_bot_wg_bota),
    tabela_kategorie: tabelaKategorie(kat),
    tabela_zachowanie: tabelaZachowanie(zach),
    tabela_cele: tabelaCele(cele),
    tabela_metody: tabelaMetody(dane.pub_bot_metody),
    tabela_pod_kogo: tabelaPodKogo(dane.pub_bot_pod_kogo),
  };
}

/** Żetony na wypadek awarii Supabase. Strona ma się wyświetlić z treścią —
 *  cała warstwa merytoryczna jest statyczna i nie zależy od liczb. */
function zetonyAwaryjne() {
  return {
    stan_na_iso: new Date().toISOString().slice(0, 10),
    tabela_wg_bota: PUSTA(6),
    tabela_kategorie: PUSTA(6),
    tabela_zachowanie: PUSTA(7),
    tabela_cele: PUSTA(4),
    tabela_metody: PUSTA(4),
    tabela_pod_kogo: PUSTA(4),
  };
}

const NOTKA_AWARYJNA =
  '<p><strong>Uwaga:</strong> chwilowo nie udało się pobrać aktualnych liczb '
  + 'z licznika, więc w miejscach liczbowych są kreski. Treść merytoryczna jest '
  + 'kompletna. Spróbuj odświeżyć za kilka minut.</p>';

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

export async function mirrorHtml(request, env, ctx, szablon) {
  const cache = caches.default;
  const klucz = new Request(new URL(request.url).toString(), { method: 'GET' });
  const zCache = await cache.match(klucz);
  if (zCache) return zCache;

  const dane = await pobierzDane(env);
  let tresc = await szablon.text();

  if (dane) {
    tresc = podstaw(tresc, zbudujZetony(dane));
  } else {
    tresc = podstaw(tresc, zetonyAwaryjne()).replace('<h2>Liczba, o którą chodzi</h2>',
      `${NOTKA_AWARYJNA}\n<h2>Liczba, o którą chodzi</h2>`);
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
};

const OKRESY_DOZWOLONE = new Set(['24h', '7d', '30d', 'all']);

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
  const kluczUrl = `${url.origin}/api/raport?raport=${raport}&okres=${okres}`;
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
