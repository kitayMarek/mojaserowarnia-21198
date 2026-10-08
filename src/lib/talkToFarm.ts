/**
 * Przekazanie mieszanki z kalkulatora pasz do aplikacji TalkToFarm (aplikacja Marka).
 *
 * Mieszanka jedzie w części adresu po znaku #, zakodowana base64url. Ta część
 * nie jest wysyłana do żadnego serwera, czyta ją dopiero aplikacja w przeglądarce.
 * Żadnych danych użytkownika: sam skład, ceny i parametry.
 *
 * Kontrakt ustaliła instancja budująca TalkToFarm (8.10.2026). Liczby jako
 * liczby z kropką. Brak ceny to null, a nie 0: „brak danych to nie zero”.
 */

export interface SkladnikTalkToFarm {
  nazwa: string;
  udzial: number;
  cena: number | null;
}

export interface MieszankaTalkToFarm {
  nazwa: string;
  rodzaj: string;
  okres?: string;
  sklad: SkladnikTalkToFarm[];
  parametry: Record<string, number | null>;
}

const ADRES = "https://app.talktofarm.com/#mieszanka?d=";

/** Zaokrąglenie do 2 miejsc, wynik jako liczba. */
export const dwaMiejsca = (x: number): number => Math.round(x * 100) / 100;

export function zakodujMieszanke(mieszanka: MieszankaTalkToFarm): string {
  const bajty = new TextEncoder().encode(JSON.stringify(mieszanka));
  return btoa(String.fromCharCode(...bajty))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function otworzWTalkToFarm(mieszanka: MieszankaTalkToFarm): void {
  window.open(ADRES + zakodujMieszanke(mieszanka), "_blank", "noopener");
}

export const OPIS_TALKTOFARM =
  "Otworzy TalkToFarm z tą mieszanką: zapiszesz ją w karcie zwierząt i będzie się rozliczać z zakupami.";
