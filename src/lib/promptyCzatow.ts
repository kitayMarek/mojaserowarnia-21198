/**
 * Ramka „Podłącz w swoim czacie” (od 24.10.2026): gotowy tekst do wklejenia
 * w ChatGPT, Claude albo Perplexity. Czat użytkownika sam prowadzi go przez
 * podłączenie serwera MCP, a na końcu liczy próbną paszę, żeby od razu było
 * widać, po co to.
 *
 * DLACZEGO PROMPT, A NIE TYLKO INSTRUKCJA (decyzja Marka 24.10.2026): jak
 * najszybciej przenieść użytkownika do jego własnego czatu. Tam rozmowy idą
 * na jego koncie, a nasz serwer tylko odpowiada na zapytania.
 *
 * KROKI W TREŚCI: model nie zna aktualnych nazw przycisków i zmyśla. Dlatego
 * prompt podaje kroki z /asystenci-ai (polskie etykiety ChatGPT, angielskie
 * Claude, polskie Perplexity, stan 23.10.2026). Zmiana kroków tam = zmiana tu.
 *
 * WNIOSKI Z TESTU MARKA (24.10.2026):
 *  - ChatGPT po kliknięciu linku do wtyczek gubił rozmowę z adresem, a na
 *    stronie Wtyczki nie było wiadomo, gdzie jest Dodaj. Stąd: adres w bloku
 *    kodu, linki w nowej karcie, opis położenia przycisku, a nasz przycisk
 *    „Otwórz” kopiuje adres serwera, żeby był pod ręką w formularzu.
 *  - Kto ma już łącznik, nie powinien przechodzić kroków (Claude sam to
 *    zauważył i zaproponował zdanie „pomiń podłączanie”).
 *  - Test kończy się gotową mieszanką, nie samą listą braków.
 *
 * LINKI Z WPISANYM TEKSTEM (?q=) działają w ChatGPT (od razu wysyła), Claude
 * i Perplexity (test Marka 24.10.2026), ale nikt ich oficjalnie nie opisuje.
 * Gdyby pole zostało puste, tekst jest pod przyciskiem „Kopiuj tekst”.
 *
 * POMIAR: adres serwera w prompcie ma znacznik strony z dopiskiem
 * /prompt-chatgpt albo /prompt-claude (serwer MCP zapisuje go przy każdym
 * wywołaniu). Perplexity bierze adres z umiejętności (?z=perplexity), więc tam
 * podłączenia z promptu nie odróżnimy od innych.
 */
import { UMIEJETNOSC_PERPLEXITY, adresLacznika, zrodloZeSciezki, type Asystent } from "@/lib/lacznikClaude";

/** Czego dotyczy strona: od tego zależy opis serwera i próbne pytanie. */
export type TematPromptu = "pasze" | "sery" | "ogolny";

const OPIS: Record<TematPromptu, string> = {
  pasze: "kalkulator pasz dla drobiu z serwisu Moja Serowarnia",
  sery: "bazę kultur do sera i przepisy z serwisu Moja Serowarnia",
  ogolny: "bazę kultur do sera, przepisy i kalkulator pasz dla drobiu z serwisu Moja Serowarnia",
};

const PROBA: Record<TematPromptu, string> = {
  pasze:
    "Na koniec sprawdź, czy działa: ułóż paszę dla 10 kur niosek z pszenicy, kukurydzy i śruty sojowej. Dodaj to, czego brakuje, przelicz jeszcze raz i powiedz, ile paszy kupić na miesiąc.",
  sery:
    "Na koniec sprawdź, czy działa: jaka kultura do camemberta jest w polskich sklepach i która wychodzi najtaniej na litr mleka?",
  ogolny:
    "Na koniec sprawdź, czy działa: ułóż paszę dla 10 kur niosek z pszenicy, kukurydzy i śruty sojowej, dodaj to, czego brakuje, i przelicz jeszcze raz.",
};

const POMIN = "Jeśli masz już dostęp do narzędzi Moja Serowarnia, pomiń podłączanie i od razu zrób test z ostatniego akapitu.";
const PROWADZ = "Prowadź mnie po jednym kroku i czekaj, aż napiszę „zrobione”.";

/**
 * Znacznik strony dla adresu serwera. Na mojapasza.com z przedrostkiem
 * /mojapasza, bo obie domeny mają te same strony pasz pod innymi ścieżkami.
 */
export function zrodloRamki(sciezka: string): string {
  const naPaszy = typeof window !== "undefined" && window.location.hostname.endsWith("mojapasza.com");
  return zrodloZeSciezki(naPaszy ? `/mojapasza${sciezka}` : sciezka);
}

/** Adres serwera w prompcie. Strona główna to "/", więc bez niego, żeby nie było „//prompt-…”. */
export function adresZPromptu(asystent: Asystent, zrodlo: string): string {
  return adresLacznika(`${zrodlo === "/" ? "" : zrodlo}/prompt-${asystent}`);
}

export function promptPodlaczenia(asystent: Asystent, temat: TematPromptu, zrodlo: string): string {
  const adres = adresZPromptu(asystent, zrodlo);
  if (asystent === "chatgpt") {
    return [
      `Pomóż mi podłączyć do ChatGPT ${OPIS[temat]}. To serwer MCP, działa bez logowania i bez klucza. Adres:`,
      adres,
      "",
      POMIN,
      "",
      `${PROWADZ} Adres serwera pokaż mi w osobnym bloku kodu, żebym mógł go skopiować przyciskiem. Linki każ mi otwierać w nowej karcie (Ctrl+klik), żeby ta rozmowa została otwarta. Kroki (pełna instrukcja: https://mojaserowarnia.pl/asystenci-ai#chatgpt):`,
      "1. Otwórz chatgpt.com/plugins w nowej karcie.",
      "2. Na stronie Wtyczki kliknij Dodaj w prawym górnym rogu (obok koła zębatego) i wybierz Dodaj niestandardowy serwer MCP.",
      "3. Nazwa: Moja Serowarnia. W pole adresu wklej adres serwera.",
      "4. Uwierzytelnianie: brak. Potwierdź ostrzeżenie i utwórz wtyczkę.",
      "5. Na liście Osobiste kliknij + przy Moja Serowarnia i wróć do tej rozmowy.",
      "Jeśli nie widzę opcji niestandardowego serwera MCP, powiedz mi, że mój plan ChatGPT jej nie ma.",
      "",
      PROBA[temat],
    ].join("\n");
  }
  if (asystent === "claude") {
    return [
      `Pomóż mi dodać do Claude łącznik: ${OPIS[temat]}. To serwer MCP, działa bez logowania i bez klucza. Adres:`,
      adres,
      "",
      POMIN,
      "",
      `${PROWADZ} Adres serwera pokaż mi w osobnym bloku kodu, żebym mógł go skopiować. Kroki (pełna instrukcja: https://mojaserowarnia.pl/asystenci-ai):`,
      "1. Otwórz claude.ai/customize/connectors w nowej karcie, kliknij + Add, potem Add custom connector.",
      "2. Name: Moja Serowarnia. MCP server URL: wklej adres serwera.",
      "3. Kliknij Continue, potem Add.",
      "4. W rozmowie kliknij + pod polem wiadomości, wybierz Connectors i włącz Moja Serowarnia.",
      "",
      PROBA[temat],
    ].join("\n");
  }
  return [
    `Pomóż mi dodać w Perplexity umiejętność „moja-serowarnia”: ${OPIS[temat]}. Umiejętność łączy się z serwerem MCP bez logowania i bez klucza.`,
    "",
    "Jeśli masz już umiejętność moja-serowarnia albo dostęp do narzędzi Moja Serowarnia, pomiń podłączanie i od razu zrób test z ostatniego akapitu.",
    "",
    `${PROWADZ} Kroki (pełna instrukcja: https://mojaserowarnia.pl/asystenci-ai#perplexity):`,
    `1. Otwórz ${UMIEJETNOSC_PERPLEXITY} i zaloguj się, jeśli strona o to poprosi.`,
    "2. Kliknij … w prawym górnym rogu i wybierz Importuj kopię.",
    "3. Sprawdź treść i kliknij Zapisz.",
    "4. Pytaj w trybie Computer: w zwykłym wyszukiwaniu umiejętność nie działa.",
    "",
    PROBA[temat],
  ].join("\n");
}

/** Czat z wpisanym tekstem (?q=, nieopisane oficjalnie, patrz wyżej). */
export function linkZPromptem(asystent: Asystent, prompt: string): string {
  const q = encodeURIComponent(prompt);
  if (asystent === "chatgpt") return `https://chatgpt.com/?q=${q}`;
  if (asystent === "claude") return `https://claude.ai/new?q=${q}`;
  return `https://www.perplexity.ai/search?q=${q}`;
}
