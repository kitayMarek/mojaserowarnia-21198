/**
 * Pomiar wywolan serwera MCP: sumy dzienne w tabeli magazyn_wywolania.
 *
 * CO ZAPISUJEMY: dzien (UTC), narzedzie, kubelek klienta, kod odpowiedzi,
 * czy to ruch wlasny. Nic wiecej.
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
export async function opisWywolania(request) {
  if (request.method !== 'POST') return null;
  let wiadomosc;
  try {
    wiadomosc = await request.clone().json();
  } catch {
    return { narzedzie: '(zla tresc)', klient: kubelekKlienta(request.headers.get('user-agent')) };
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
    wlasne: WLASNE.test(ua),
  };
}

export async function zliczWywolanie(env, opis, status) {
  if (!opis) return;
  const wpis = {
    _narzedzie: opis.narzedzie,
    _klient: opis.klient,
    _status: status,
    _wlasne: Boolean(opis.wlasne),
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
