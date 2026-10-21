/**
 * Krotkie linki do lacznika Claude (serwer MCP dane.mojaserowarnia.pl).
 *
 *   /claude?z=fb-grupa        -> strona z instrukcja /asystenci-ai (regula 1a1b)
 *   /claude/dodaj?z=fb-grupa  -> od razu formularz „Dodaj lacznik” w Claude.ai
 *
 * PO CO DRUGI LINK (21.10.2026, prosba Marka): w poscie na grupie czlowiek ma
 * byc jak najblizej celu. Ten link pomija strone z instrukcja i otwiera
 * formularz z wpisana nazwa i adresem lacznika. Niezalogowany trafia najpierw
 * na logowanie, a Claude wraca potem do formularza (returnTo z pelnym adresem,
 * sprawdzone 21.10.2026).
 *
 * POMIAR: klikniecie czlowieka to wiersz w llm_queries, jak przyciski
 * w serwisie (src/lib/lacznikClaude.ts): model "lacznik-claude", query "link",
 * source = znacznik. Podlaczenie liczy serwer MCP po tym samym znaczniku
 * w adresie lacznika (magazyn_wywolania.zrodlo).
 *
 * PODGLAD NA FACEBOOKU pokaze ogolna karte Claude, bo robot Facebooka idzie za
 * przekierowaniem. Celowo nie dajemy mu innej strony niz ludziom: Facebook
 * uznaje to za maskowanie (cloaking). Kto chce nasz obrazek w poscie, wkleja
 * najpierw /claude?z=..., a ten link pod nim.
 */

import { rozpoznajBota, ktoZListy } from './wizyty-botow.js';
import { NARZEDZIE, WLASNE } from './wejscia-ludzi.js';

// Te same wartosci co ADRES_MCP i linkClaude() w src/lib/lacznikClaude.ts.
const ADRES_MCP = 'https://dane.mojaserowarnia.pl/mcp';
const FORMULARZ_CLAUDE =
  'https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Moja%20Serowarnia&connectorUrl=';

// Siec Meta (Facebook). Po publikacji posta Meta otwiera link swoimi skanerami:
// bezglowy Chrome z kompletem naglowkow przegladarki i z fbclid, kilkanascie
// razy w kilka sekund. Logi Workers z 21.10.2026: 28 z 28 klikniec fb-pasza
// i fb-serowar przyszlo z ASN 32934 (USA). Naglowki ich nie odroznia, siec tak:
// czlowiek klika z sieci swojego operatora, takze w aplikacji Facebooka.
// Decyzja Marka 21.10.2026: nie odrzucac, tylko zapisywac w osobnym wierszu,
// zeby bylo widac, czy trafi sie tam kiedys ktos prawdziwy.
const SIEC_META = [32934, 63293];

/** Znacznik posta z ?z=. Te same reguly czyszczenia co zrodloZeSciezki() w serwisie. */
export function znacznikLinku(url) {
  return (url.searchParams.get('z') || '').toLowerCase().replace(/[^a-z0-9/_-]/g, '').slice(0, 60) || 'link';
}

export function formularzClaude(z) {
  return FORMULARZ_CLAUDE + encodeURIComponent(`${ADRES_MCP}?z=${z}`);
}

/**
 * Zapis klikniecia /claude/dodaj. Wolac przez ctx.waitUntil(), po odeslaniu
 * przekierowania: baza nie moze opoznic ani zablokowac przejscia do Claude.
 *
 * Liczy tylko czlowieka, tymi samymi sprawdzeniami co licznik wejsc ludzi
 * (worker/wejscia-ludzi.js). Odpadaja tez wstepne pobrania: przegladarka
 * Facebooka potrafi pobrac link z posta, zanim ktokolwiek go kliknie.
 */
export async function zapiszKlikniecieLinku(request, z, env, botPodgladu) {
  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return;
    if (request.method !== 'GET') return;
    const cel = request.headers.get('sec-fetch-dest');
    if (cel && cel !== 'document') return;
    if (!(request.headers.get('sec-fetch-mode') || request.headers.get('accept-language'))) return;
    const zamiar = [request.headers.get('sec-purpose'), request.headers.get('purpose'), request.headers.get('x-purpose')].join(' ');
    if (/prefetch|prerender|preview/i.test(zamiar)) return;

    const ua = request.headers.get('user-agent') || '';
    if (botPodgladu || rozpoznajBota(ua) || NARZEDZIE.test(ua) || WLASNE.test(ua)) return;
    if (new URL(request.url).hostname.endsWith('.workers.dev')) return;
    if (await ktoZListy(request.headers.get('cf-connecting-ip'))) return;
    const zrodlo = SIEC_META.includes(request.cf?.asn) ? `${z} (skaner Meta)` : z;

    const zapis = await fetch(`${env.SUPABASE_URL}/rest/v1/llm_queries`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_KEY,
        authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'content-type': 'application/json',
        prefer: 'return=minimal',
      },
      body: JSON.stringify({ query: 'link', model: 'lacznik-claude', source: zrodlo, is_custom: false }),
    });
    if (!zapis.ok) {
      console.error('lacznik-claude: zapis odrzucony', zapis.status, (await zapis.text()).slice(0, 300));
    }
  } catch (blad) {
    console.error('lacznik-claude: wyjatek przy zapisie', blad?.message);
  }
}
