/**
 * Łącznik Claude (serwer MCP dane.mojaserowarnia.pl): wspólne adresy i pomiar
 * dla przycisków „Dodaj do Claude” (menu boczne, baza kultur, /asystenci-ai).
 *
 * POMIAR W DWÓCH MIEJSCACH (decyzja Marka 21.10.2026):
 *  1. Kliknięcie: wiersz w llm_queries (model "lacznik-claude", query = rodzaj
 *     przycisku, source = strona albo znacznik z krótkiego linku /claude?z=...).
 *     Ta sama tabela co dawne „Zapytaj AI”, więc /admin/statystyki-llm
 *     pokazuje to od razu. Rodzaj "link" zapisuje worker, nie ta strona:
 *     krótki link /claude/dodaj?z=... prosto do formularza (worker/lacznik-claude.js
 *     ma kopię ADRES_MCP i adresu formularza; przy zmianie poprawić oba).
 *  2. Podłączenie: adres łącznika niesie znacznik strony (?z=/baza-kultur).
 *     Serwer MCP zapisuje go przy każdym wywołaniu w magazyn_wywolania.zrodlo,
 *     więc widać, które strony dały prawdziwe podłączenia, a nie tylko kliknięcia.
 *     Serwer odpowiada tak samo z parametrem i bez niego.
 */
import { supabase } from "@/integrations/supabase/client";

export const ADRES_MCP = "https://dane.mojaserowarnia.pl/mcp";

/** Ścieżka strony w postaci bezpiecznej dla adresu i dla bazy: /kultury/me, /baza-kultur. */
export function zrodloZeSciezki(sciezka: string): string {
  const czysta = sciezka.toLowerCase().replace(/\/+$/, "").replace(/[^a-z0-9/_-]/g, "").slice(0, 60);
  return czysta || "/";
}

/** Znacznik idzie wprost (bez %2F): po zrodloZeSciezki ma tylko a-z, 0-9, / _ -, a ten adres widać w polu do skopiowania. */
export function adresLacznika(zrodlo?: string): string {
  const z = zrodlo ? zrodloZeSciezki(zrodlo) : "";
  return z ? `${ADRES_MCP}?z=${z}` : ADRES_MCP;
}

/** Otwiera w Claude.ai formularz dodawania łącznika z wpisaną nazwą i adresem. */
export function linkClaude(zrodlo?: string): string {
  return (
    "https://claude.ai/customize/connectors?modal=add-custom-connector" +
    "&connectorName=Moja%20Serowarnia&connectorUrl=" +
    encodeURIComponent(adresLacznika(zrodlo))
  );
}

/**
 * Strona wtyczek w ChatGPT. Od 23.10.2026 przycisk „Dodaj do ChatGPT”: ChatGPT
 * nie ma linku, który otwiera formularz z wpisanym adresem (jak Claude), więc
 * przycisk kopiuje adres i otwiera tę stronę, a kroki są na /asystenci-ai#chatgpt.
 * Ręcznie dodany serwer MCP zachowuje ?z= w adresie (sprawdzone na łączniku
 * Marka z ?wlasne=), więc pomiar podłączeń działa jak w Claude.
 */
export const WTYCZKI_CHATGPT = "https://chatgpt.com/plugins";

/**
 * Umiejętność „moja-serowarnia” udostępniona w Perplexity („każdy, kto ma link”).
 * Zalogowany użytkownik importuje ją z tej strony: „…”, Importuj kopię, Zapisz
 * (sprawdzone 23.10.2026 na darmowym koncie). Działa w trybie Computer: model
 * sam łączy się z serwerem pod adresem z umiejętności (?z=perplexity), więc
 * wywołania widać w magazyn_wywolania ze źródłem "perplexity".
 * Treść umiejętności: ProjektyLLm/wtyczki/perplexity/SKILL.md (poza repo).
 */
export const UMIEJETNOSC_PERPLEXITY = "https://www.perplexity.ai/computer/skills/7v8vkYCPTiSxnjTByyQ0GA";

export type RodzajKlikniecia = "menu" | "przycisk" | "kopiuj";
export type Asystent = "claude" | "chatgpt" | "perplexity";

/**
 * Zapis kliknięcia bez czekania: błąd bazy nie może zablokować przejścia do asystenta.
 * Model "lacznik-claude", "lacznik-chatgpt" albo "lacznik-perplexity", żeby panel admina rozdzielił przyciski.
 */
export function zapiszKlikniecieLacznika(strona: string, rodzaj: RodzajKlikniecia, asystent: Asystent = "claude"): void {
  try {
    // @ts-ignore - llm_queries moze nie byc w wygenerowanych typach
    supabase
      .from("llm_queries")
      .insert({ query: rodzaj, model: `lacznik-${asystent}`, source: strona, is_custom: false })
      .then(() => {}, () => {});
  } catch {
    /* cicho */
  }
}

/** Kopiuje do schowka; gdy schowek jest zablokowany, zwraca false bez błędu. */
export async function kopiujDoSchowka(tekst: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(tekst);
    return true;
  } catch {
    return false;
  }
}
