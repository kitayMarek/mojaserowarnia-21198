/**
 * Pomiar wywolan serwera MCP: sumy dzienne w tabeli magazyn_wywolania.
 *
 * CO ZAPISUJEMY: dzien (UTC), narzedzie, kubelek klienta, kod odpowiedzi,
 * czy to ruch wlasny i znacznik strony z adresu lacznika (?z=). Nic wiecej.
 * CZEGO NIE ZAPISUJEMY: adresu IP, User-Agenta, godziny ani tresci zapytania.
 * Tresc zapytania bywa danymi osobowymi, a kubelek klienta wystarcza, zeby
 * odpowiedziec na jedyne pytanie testu: czy ktos to podlacza i czym.
 *
 * Wzor jak w worker/wejscia-ludzi.js: zapis przez ctx.waitUntil, po odeslaniu
 * odpowiedzi, wiec awaria bazy nie moze przewrocic serwera.
 */


// Ten sam klucz co CLIENT_INFO_META_KEY w @modelcontextprotocol/server. W nowszej
// wersji protokolu nazwa klienta idzie z kazdym zadaniem, w starszej tylko przy
// initialize.
const KLUCZ_KLIENTA = 'io.modelcontextprotocol/clientInfo';

// Te same znaczniki ruchu wlasnego co w worker/wejscia-ludzi.js.
const WLASNE = /test-marek|test-agrojelonki|Agrojelonki-Test/i;

// Ruch wlasny z czatow. Lacznik w Claude.ai nie pozwala dopisac naglowka ani
// zmienic User-Agenta, wiec znacznik test-marek nie ma jak dojsc. Marek dodaje
// wiec lacznik pod adresem z parametrem: /mcp?wlasne=<sekret WLASNY_ZNACZNIK>.
// Sekret, a nie stala w kodzie, bo repo jest publiczne: kazdy moglby inaczej
// ukryc swoje wywolania w statystyce. To nie jest klucz dostepu, tylko etykieta
// do pomiaru: serwer odpowiada tak samo z parametrem i bez niego.
const PARAMETR_WLASNY = 'wlasne';

// Porownanie w stalym czasie, jak kluczPasuje() w worker/kontrakt-botow.js.
async function znacznikPasuje(podany, wlasciwy) {
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

// Znacznik strony z adresu lacznika (?z=/baza-kultur), dopisywany przez
// przyciski „Dodaj do Claude” w serwisie (src/lib/lacznikClaude.ts). Mowi,
// ktora strona dala podlaczenie. Te same reguly czyszczenia co w serwisie.
// Od 25.10.2026 takze znacznik cudzej aplikacji (?z=asystent-jana, /warunki-mcp#aplikacje).
export function zrodloZAdresu(request) {
  const z = new URL(request.url).searchParams.get('z') || '';
  return z.toLowerCase().replace(/[^a-z0-9/_-]/g, '').slice(0, 60);
}

async function ruchWlasny(request, env) {
  if (WLASNE.test(request.headers.get('user-agent') || '')) return true;
  const podany = new URL(request.url).searchParams.get(PARAMETR_WLASNY);
  if (!podany || !env?.WLASNY_ZNACZNIK) return false;
  return znacznikPasuje(podany, env.WLASNY_ZNACZNIK);
}

// Kubelki klientow. Kolejnosc ma znaczenie: Inspector bywa uruchamiany
// z przegladarki, wiec musi stac przed ogolnymi wzorcami.
const KLIENCI = [
  [/inspector/i, 'Inspector'],
  [/claude|anthropic/i, 'Claude'],
  [/openai|chatgpt/i, 'ChatGPT'],
  [/cursor/i, 'Cursor'],
  [/perplexity/i, 'Perplexity'],
  [/gemini|google/i, 'Gemini'],
  [/copilot|vscode|visual studio/i, 'Copilot'],
  [/mcp-remote/i, 'mcp-remote'],
];

function kubelekKlienta(...teksty) {
  const razem = teksty.filter(Boolean).join(' ');
  for (const [wzorzec, nazwa] of KLIENCI) if (wzorzec.test(razem)) return nazwa;
  return 'inne';
}

/**
 * Czego dotyczy zadanie: jedno spojrzenie w tresc JSON-RPC, na kopii, zanim
 * oryginal pojdzie do serwera MCP. null = nie liczymy (powiadomienia, ping).
 */
export async function opisWywolania(request, env) {
  if (request.method !== 'POST') return null;
  let wiadomosc;
  try {
    wiadomosc = await request.clone().json();
  } catch {
    return {
      narzedzie: '(zla tresc)',
      klient: kubelekKlienta(request.headers.get('user-agent')),
      wlasne: await ruchWlasny(request, env),
      zrodlo: zrodloZAdresu(request),
    };
  }
  if (Array.isArray(wiadomosc)) wiadomosc = wiadomosc[0];
  const metoda = wiadomosc?.method;
  const parametry = wiadomosc?.params ?? {};

  const narzedzie = {
    'initialize': '(polaczenie)',
    'tools/list': '(lista)',
    'tools/call': typeof parametry.name === 'string' ? parametry.name.slice(0, 40) : '(bez nazwy)',
  }[metoda];
  if (!narzedzie) return null;

  const ua = request.headers.get('user-agent') || '';
  const nazwaKlienta = parametry.clientInfo?.name || parametry._meta?.[KLUCZ_KLIENTA]?.name;
  return {
    narzedzie,
    klient: kubelekKlienta(nazwaKlienta, ua),
    wlasne: await ruchWlasny(request, env),
    zrodlo: zrodloZAdresu(request),
  };
}

/** Pobranie karty serwera albo katalogu AI: zwykly GET, wiec bez tresci JSON-RPC. */
export async function opisPobrania(request, env, nazwa) {
  return {
    narzedzie: nazwa,
    klient: kubelekKlienta(request.headers.get('user-agent')),
    wlasne: await ruchWlasny(request, env),
    zrodlo: zrodloZAdresu(request),
  };
}

export async function zliczWywolanie(env, opis, status) {
  if (!opis) return;
  const wpis = {
    _narzedzie: opis.narzedzie,
    _klient: opis.klient,
    _status: status,
    _wlasne: Boolean(opis.wlasne),
    // Wymaga migracji 20261021210000_lacznik_claude_pomiar.sql (piaty argument funkcji).
    _zrodlo: opis.zrodlo || '',
    // Pola _serwer serwer Serowarni nie wysyła: baza wpisuje wtedy mojaserowarnia (migracja
    // 20261025210000_serwis_w_pomiarze.sql). Wysyła je serwer mojapasza.com/mcp z własnego repozytorium.
  };

  // Lokalnie (wrangler dev) i przed nadaniem sekretu: tylko wpis w logu, zeby
  // dalo sie sprawdzic, co by sie zapisalo, bez dotykania produkcyjnej bazy.
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    console.log(JSON.stringify({ pomiar: wpis }));
    return;
  }

  try {
    const odp = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/zlicz_wywolanie`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(wpis),
    });
    if (!odp.ok) console.log(JSON.stringify({ pomiar_blad: odp.status }));
  } catch {
    console.log(JSON.stringify({ pomiar_blad: 'brak polaczenia' }));
  }
}
