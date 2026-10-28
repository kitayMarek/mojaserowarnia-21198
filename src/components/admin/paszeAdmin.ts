/**
 * Stałe paneli admina pasz (AdminFeedIngredients, ZgloszeniaProduktow).
 *
 * Od 28.10.2026 kalkulator, dane i serwer MCP pasz żyją w repozytorium Mojej Paszy
 * (C:\Moje\MojaPasza). W Serowarni zostały tylko panele admina, bo Marek przegląda w nich
 * surowce i zgłoszenia produktów (te same tabele w tej samej bazie Supabase). Panele
 * przejdą do Mojej Paszy, gdy będzie miała własny odpowiednik; wtedy ten plik znika.
 *
 * Wartości przepisane z src/data/feedIngredients.ts, src/data/dodatkiPaszowe.ts
 * i src/components/kalkulator/ZglosProduktDialog.tsx sprzed wydzielenia. Muszą się
 * zgadzać z tym, co zapisuje Moja Pasza.
 */

export const feedCategories: string[] = ["Ziarna, nasiona i strączkowe", "Produkty uboczne, śruty i oleje", "Pasze pochodzenia zwierzęcego", "Susze z roślin zielonych", "Zielonki (pasze świeże)", "Kiszonki", "Okopowe i bulwiaste", "Dodatki mineralne", "Gotowe mieszanki (pełnoporcjowe)", "Aminokwasy i dodatki paszowe", "Premiksy", "Koncentraty"];

export type ZrodloSkladu = "etykieta" | "producent" | "norma";

export const OPIS_ZRODLA_SKLADU: Record<ZrodloSkladu, string> = {
  etykieta: "z etykiety",
  producent: "z karty produktu u producenta",
  norma: "z tabel wartości pokarmowej (skład typowy)",
};

export type Odbior = "sklep" | "odbior" | "wysylka";

export const OPIS_ODBIORU: Record<Odbior, string> = {
  sklep: "sklep stacjonarny",
  odbior: "odbiór osobisty zamówienia",
  wysylka: "tylko wysyłka",
};

/** Kubełek Supabase Storage ze zdjęciami kart produktów ze zgłoszeń. */
export const KUBELEK_ZGLOSZEN = "zgloszenia-paszowe";

export type KtoZglasza = "hodowca" | "sklep" | "producent" | "inny";
export type StatusZgloszenia = "nowe" | "dodane" | "duplikat" | "odrzucone";
