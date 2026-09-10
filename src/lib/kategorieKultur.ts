/**
 * Kategoria technologiczna kultury: do czego ona w ogóle służy.
 *
 * PO CO: symulator warzenia musi wiedzieć, czy dana kultura zakwasza, czy robi
 * pleśń, czy myje skórkę. Pole `type` z bazy tego nie rozstrzyga, bo pod
 * „pleśniowe" siedzą i biała, i niebieska, a kultury do mycia skórki są
 * schowane pod „aromatyzujące".
 *
 * SKŁAD ROZSTRZYGA PRZED TYPEM. Kultura opisana jako „aromatyzująca",
 * zawierająca Brevibacterium linens, jest funkcjonalnie kulturą do mycia
 * skórki i tak ma być traktowana. Sprawdzone na 188 pozycjach: roqueforti 7,
 * candidum 12, linens 7, propionibacterium 6.
 *
 * ŚWIADOMIE BEZ KOLUMNY W BAZIE. Reguła siedzi tu, a nie w migracji, bo
 * wyliczamy ją z danych, które już są. Kolumna byłaby drugim źródłem prawdy
 * i rozjechałaby się przy pierwszej zmianie składu.
 */

export type KategoriaKultury =
  | "mezofilna"
  | "termofilna"
  | "mieszana"
  | "kwaszaca"
  | "plesniowa-biala"
  | "plesniowa-niebieska"
  | "propionowa"
  | "mycia-skorki"
  | "dodatek";

export const NAZWY_KATEGORII: Record<KategoriaKultury, string> = {
  mezofilna: "mezofilna",
  termofilna: "termofilna",
  mieszana: "mezofilno-termofilna",
  kwaszaca: "kwasząca (jogurt, kefir)",
  "plesniowa-biala": "pleśń biała (P. candidum)",
  "plesniowa-niebieska": "pleśń niebieska (P. roqueforti)",
  propionowa: "propionowa (oczka)",
  "mycia-skorki": "do mycia skórki (B. linens)",
  dodatek: "dodatek (ochronna, aromatyzująca, zestaw)",
};

interface MaTypISklad {
  type?: string | null;
  composition?: string | null;
}

export function kategoriaKultury(k: MaTypISklad): KategoriaKultury {
  const s = (k.composition ?? "").toLowerCase();
  const t = (k.type ?? "").toLowerCase();

  // 1. Skład — rozstrzyga, bo mówi o funkcji, a nie o półce sklepowej.
  if (s.includes("roqueforti")) return "plesniowa-niebieska";
  if (s.includes("candidum")) return "plesniowa-biala";
  if (s.includes("linens")) return "mycia-skorki";
  if (s.includes("propioni")) return "propionowa";

  // 2. Typ ze sklepu — dla reszty wystarcza.
  if (t.includes("kefir")) return "kwaszaca";
  if (t.includes("jogurt") || t.includes("probiot")) return "kwaszaca";
  if (t.includes("mezofilno")) return "mieszana";
  if (t.includes("mezofil")) return "mezofilna";
  if (t.includes("termofil")) return "termofilna";

  // 3. Wege idzie za składem, bo „wege" mówi o pochodzeniu, nie o roli.
  if (t.includes("wege")) {
    if (s.includes("bulgaricus") || s.includes("thermophilus")) return "kwaszaca";
    if (s.includes("cremoris") || s.includes("lactis")) return "mezofilna";
  }

  // 4. Reszta: ochronne, zestawy, aromatyzujące bez rozpoznawalnego szczepu.
  //    Nie nadają się na kulturę wiodącą w symulatorze i tak są oznaczone.
  return "dodatek";
}

/** Czy tą kulturą da się poprowadzić produkcję samodzielnie. */
export const czyWiodaca = (kat: KategoriaKultury) => kat !== "dodatek";
