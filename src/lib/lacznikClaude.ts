/**
 * Łącznik Dane Rolne (od 2.11.2026, wcześniej dane.mojaserowarnia.pl): wspólne adresy
 * i pomiar dla przycisków „Dodaj do Claude” (menu boczne, baza kultur, /asystenci-ai).
 *
 * POMIAR W DWÓCH MIEJSCACH (decyzja Marka 21.10.2026):
 *  1. Kliknięcie: wiersz w llm_queries (model "lacznik-claude", query = rodzaj
 *     przycisku, source = strona albo znacznik z krótkiego linku /claude?z=...).
 *     Ta sama tabela co dawne „Zapytaj AI”, więc /admin/statystyki-llm
 *     pokazuje to od razu. Rodzaj "link" zapisuje worker, nie ta strona:
 *     krótki link /claude/dodaj?z=... prosto do formularza (worker/lacznik-claude.js
 *     ma kopię ADRES_MCP i adresu formularza; przy zmianie poprawić oba).
 *  2. Podłączenie: adres łącznika niesie znacznik strony (?z=/baza-kultur).
 *     Hub zapisuje go przy każdym wywołaniu w swojej tabeli wywolania.zrodlo (do 2.11.2026
 *     serwer Serowarni w magazyn_wywolania.zrodlo), więc widać, które strony dały prawdziwe
 *     podłączenia, a nie tylko kliknięcia. Serwer odpowiada tak samo z parametrem i bez niego.
 */
import { supabase } from "@/integrations/supabase/client";
import { LACZNIK } from "@/lib/serwis";

export const ADRES_MCP = LACZNIK.adres;

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
    `&connectorName=${encodeURIComponent(LACZNIK.nazwa)}&connectorUrl=` +
    encodeURIComponent(adresLacznika(zrodlo))
  );
}

/**
 * Wpis Dane Rolne w katalogu łączników Claude (opublikowany 9.11.2026, znaczek „Community”).
 * Strona jest publiczna; zalogowany dodaje łącznik jednym kliknięciem, bez wpisywania adresu,
 * a bez zalogowania przycisk nazywa się „Sign in to add”. Łącznik z katalogu to
 * danerolne.com/mcp?z=katalog, więc podłączenie stąd ma znacznik "katalog", nie znacznik strony.
 * Od 9.11.2026 pierwsza droga przy każdym przycisku Claude (prośba Marka przez sesję huba);
 * formularz z linkClaude() zostaje jako druga.
 */
export const KATALOG_CLAUDE = "https://claude.ai/directory/dane-rolne";

/**
 * Strona wtyczek w ChatGPT. Od 23.10.2026 przycisk „Dodaj do ChatGPT”: ChatGPT
 * nie ma linku, który otwiera formularz z wpisanym adresem (jak Claude), więc
 * przycisk kopiuje adres i otwiera tę stronę, a kroki są na /asystenci-ai#chatgpt.
 * Ręcznie dodany serwer MCP zachowuje ?z= w adresie (sprawdzone na łączniku
 * Marka z ?wlasne=), więc pomiar podłączeń działa jak w Claude.
 */
export const WTYCZKI_CHATGPT = "https://chatgpt.com/plugins";

/**
 * Umiejętność „dane-rolne” udostępniona w Perplexity („każdy, kto ma link”), od 2.11.2026
 * zamiast „moja-serowarnia”, decyzja Marka.
 * Zalogowany użytkownik importuje ją z tej strony: „…”, Importuj kopię, Zapisz
 * (sprawdzone 23.10.2026 na darmowym koncie, ale Computer jest w płatnych planach:
 * test Marka 2.11.2026, pomoc Perplexity, artykuł 13837784). Działa w trybie Computer: model
 * sam łączy się z serwerem pod adresem z umiejętności (danerolne.com/mcp?z=perplexity),
 * więc wywołania widać w tabeli wywolania w bazie huba ze źródłem "perplexity".
 * Treść umiejętności: ProjektyLLm/wtyczki/perplexity-dane-rolne/SKILL.md (poza repo).
 */
export const UMIEJETNOSC_PERPLEXITY = LACZNIK.umiejetnoscPerplexity.adres;

/** "prompt-otworz" i "prompt-kopiuj": ramka „Podłącz w swoim czacie” (src/lib/promptyCzatow.ts). "katalog": wpis w katalogu Claude. */
export type RodzajKlikniecia = "menu" | "przycisk" | "kopiuj" | "prompt-otworz" | "prompt-kopiuj" | "katalog";
export type Asystent = "claude" | "chatgpt" | "perplexity";
/** Czaty pokazywane ludziom. Perplexity wraca po skończonej konfiguracji huba (Marek 3.11.2026): dopisać tu i w tekstach. */
export const CZATY_NA_STRONIE: Asystent[] = ["chatgpt", "claude"];

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
