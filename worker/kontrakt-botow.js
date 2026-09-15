/**
 * mojaserowarnia.pl — prywatny odczyt licznika: kontrakt licznik-botow/1.
 *
 * PO CO. Aplikacja analityczna (osobne repozytorium, analiza.mojaserowarnia.pl)
 * czyta ruch botów i przyjścia z tego samego licznika, który zasila /boty-ai,
 * ale w pełnym rozbiciu na dzień, stronę i bota. Publiczne /api/raport wydaje
 * gotowe zestawienia, a nie sumy. Opis kontraktu: ProjektyLLm/ZLECENIE-aplikacja-
 * analityczna.md, część 5.5 (plik poza repozytorium). Sumy liczy baza, funkcja
 * kontrakt_licznik_botow (migracja 20260915200000).
 *
 * DOSTĘP: nagłówek `Authorization: Bearer <klucz>`. Klucz leży w sekrecie workera
 * KLUCZ_LICZNIKA_BOTOW i ustawia go `npm run klucz-licznika`. Nigdy w adresie,
 * bo adresy zapytań zostają w logach po drodze.
 *
 * CZEGO NIE WYDAJE: adresów IP, User-Agentów, ASN, krajów ani godzin.
 *
 * PARAMETRY: od i do w formacie RRRR-MM-DD, dni UTC włącznie, najwyżej 31 dni.
 * Bez parametrów: 28 pełnych dni zakończonych wczoraj.
 */

export const SCIEZKA_KONTRAKTU = '/api/licznik-botow';

// Nagłówek techniczny, jak x-mirror w index.js: odpowiedź na poprawny klucz to
// nasz własny ruch serwer-serwer i nie trafia do licznika botów. Zdejmowany,
// zanim odpowiedź wyjdzie.
export const WLASNY_ODCZYT = 'x-wlasny-odczyt';

// Tydzień to około 5 tysięcy wierszy wizyt (sprawdzone 15.09.2026), więc dłuższe
// okresy aplikacja pobiera w kawałkach zamiast jednym ciężkim zapytaniem.
const NAJDLUZSZY_OKRES_DNI = 31;
const DOBA = 86_400_000;

// Daty, od których liczby w kontrakcie znaczą co innego niż wcześniej. Źródło:
// docs/zmiany-pomiaru.md i komentarze w worker/wizyty-botow.js oraz wrangler.jsonc.
// Przy nowej zmianie pomiaru licznika dopisać OBA miejsca.
export const ZMIANY_METODY = [
  { data: '2026-09-07', opis: 'Zapisywany także ruch bez podpisu (pusty User-Agent). Od tego dnia mierzone są też /sitemap.xml i /llms.txt, wcześniej obsługiwane bez workera' },
  { data: '2026-09-08', opis: 'Nierozpoznany podpis zapisywany osobno od braku podpisu. Zapisywane żądania z nagłówkami przeglądarki z opublikowanej sieci operatora (agent w przeglądarce)' },
  { data: '2026-09-08', opis: 'Adresy /x.html przekierowują 301 na /x, więc po tej dacie więcej odpowiedzi 3xx na adresach .html' },
  { data: '2026-09-10', opis: 'Ruch własny rozpoznawany wyłącznie po znaczniku w User-Agencie. Wcześniej także cały ASN 5617 (Orange Polska), więc w starszych danych brakuje części cudzego ruchu' },
  { data: '2026-09-10', opis: 'Przyjścia: zapisywany każdy zewnętrzny odsyłacz, wcześniej tylko modele językowe' },
  { data: '2026-09-14', opis: 'Ścieżki /@fs/ i /proc/ dostają 404 zamiast strony aplikacji z kodem 200' },
  { data: '2026-09-15', opis: 'Przyjścia: www.bing.com jako Bing, a nie Copilot. Bez przekierowań 3xx, wstępnych pobrań, zasobów w tle i wejść z sygnałem GPC' },
];

function json(dane, status, dodatkowe = {}) {
  return new Response(JSON.stringify(dane), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
      ...dodatkowe,
    },
  });
}

/** Porównanie w stałym czasie. Skróty SHA-256 mają równą długość niezależnie od klucza. */
async function kluczPasuje(podany, wlasciwy) {
  const kod = new TextEncoder();
  const [a, b] = await Promise.all(
    [podany, wlasciwy].map((t) => crypto.subtle.digest('SHA-256', kod.encode(t))),
  );
  if (typeof crypto.subtle.timingSafeEqual === 'function') {
    return crypto.subtle.timingSafeEqual(a, b);
  }
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let roznica = 0;
  for (let i = 0; i < x.length; i++) roznica |= x[i] ^ y[i];
  return roznica === 0;
}

/** RRRR-MM-DD → północ UTC tego dnia albo null, gdy to nie jest prawdziwa data. */
function dzienUtc(tekst) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tekst)) return null;
  const d = new Date(`${tekst}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== tekst ? null : d;
}

const naDzien = (d) => d.toISOString().slice(0, 10);

export async function kontraktBotow(request, env) {
  if (request.method !== 'GET') {
    return json({ blad: 'Dozwolone tylko GET' }, 405, { allow: 'GET' });
  }

  if (!env.KLUCZ_LICZNIKA_BOTOW || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return json({ blad: 'Endpoint nie jest skonfigurowany' }, 503);
  }

  const naglowek = request.headers.get('authorization') || '';
  const podany = naglowek.startsWith('Bearer ') ? naglowek.slice(7).trim() : '';
  if (!podany || !(await kluczPasuje(podany, env.KLUCZ_LICZNIKA_BOTOW))) {
    return json({ blad: 'Brak albo zły klucz w nagłówku Authorization: Bearer' }, 401,
      { 'www-authenticate': 'Bearer' });
  }

  const wlasny = { [WLASNY_ODCZYT]: '1' };
  const url = new URL(request.url);
  const dzis = dzienUtc(new Date().toISOString().slice(0, 10));
  const parametrDo = url.searchParams.get('do');
  const parametrOd = url.searchParams.get('od');

  const koniec = parametrDo ? dzienUtc(parametrDo) : new Date(dzis.getTime() - DOBA);
  const poczatek = parametrOd ? dzienUtc(parametrOd) : koniec && new Date(koniec.getTime() - 27 * DOBA);

  if (!koniec || !poczatek) {
    return json({ blad: 'Parametry od i do podaj w formacie RRRR-MM-DD' }, 400, wlasny);
  }
  if (poczatek > koniec) {
    return json({ blad: 'Data od jest późniejsza niż do' }, 400, wlasny);
  }
  if (koniec > dzis) {
    return json({ blad: 'Data do nie może być późniejsza niż dzisiejszy dzień UTC' }, 400, wlasny);
  }
  if ((koniec - poczatek) / DOBA + 1 > NAJDLUZSZY_OKRES_DNI) {
    return json({ blad: `Okres może mieć najwyżej ${NAJDLUZSZY_OKRES_DNI} dni` }, 400, wlasny);
  }

  const okres = { od: naDzien(poczatek), do: naDzien(koniec) };

  let dane;
  try {
    const odp = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/kontrakt_licznik_botow`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ _od: okres.od, _do: okres.do }),
    });
    // Treści błędu z bazy nie przekazujemy dalej: może nieść szczegóły schematu.
    if (!odp.ok) {
      return json({ blad: 'Baza licznika nie odpowiedziała poprawnie', status_bazy: odp.status }, 502, wlasny);
    }
    dane = await odp.json();
  } catch {
    return json({ blad: 'Brak połączenia z bazą licznika' }, 502, wlasny);
  }

  return json({
    kontrakt: 'licznik-botow/1',
    witryna: 'https://mojaserowarnia.pl',
    okres,
    strefa_czasowa: 'UTC',
    ruch_wlasny_wykluczony: true,
    wizyty: dane?.wizyty ?? [],
    przyjscia: dane?.przyjscia ?? [],
    zmiany_metody: ZMIANY_METODY,
  }, 200, wlasny);
}
