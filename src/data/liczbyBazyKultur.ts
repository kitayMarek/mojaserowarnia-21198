/**
 * Liczby o bazie kultur do zdań w treściach, wyliczane z migawki
 * culturesDataComplete.ts zamiast wpisywane na sztywno.
 *
 * DLACZEGO TO ISTNIEJE: do 27.10.2026 w kilkunastu miejscach stało „188 kultur”
 * i „pięciu sklepów” z listą bez Browina. Dodanie szóstego sklepu zrobiło
 * z każdego takiego zdania nieprawdę. Mirror bazy (gen-baza.py) liczy z tych
 * samych danych i w tej samej kolejności sklepów, więc obie warstwy mówią to samo.
 *
 * Mirrory pisane ręcznie (index-mirror.html, llms.txt i inne w public/) liczb
 * stąd nie dostają: po zmianie bazy trzeba je poprawić osobno.
 *
 * Teksty redakcyjne z datą (np. przegląd z 22.08.2026 w KtoProdukujeKultury)
 * opisują stan z dnia przeglądu i NIE biorą liczb stąd.
 */
import { culturesData } from "./culturesDataComplete";

/** Odmiana po liczebniku w mianowniku: 1 kultura, 193 kultury, 188 kultur. */
export function odmiana(n: number, jedna: string, kilka: string, wiele: string): string {
  if (n === 1) return jedna;
  const j = n % 10;
  const d = n % 100;
  return j >= 2 && j <= 4 && (d < 12 || d > 14) ? kilka : wiele;
}

// Dopełniacz i miejscownik („z sześciu sklepów”, „w sześciu sklepach”).
const LICZEBNIK: Record<number, string> = {
  4: "czterech", 5: "pięciu", 6: "sześciu", 7: "siedmiu", 8: "ośmiu",
};

const ileWSklepie = new Map<string, number>();
for (const c of culturesData) ileWSklepie.set(c.shop, (ileWSklepie.get(c.shop) ?? 0) + 1);
// Od największej oferty, jak w gen-baza.py.
const sklepy = [...ileWSklepie.keys()].sort((a, b) => ileWSklepie.get(b)! - ileWSklepie.get(a)!);

const ceny = culturesData
  .map((c) => c.price_numeric)
  .filter((p): p is number => typeof p === "number" && p > 0);

export const liczbaKultur = culturesData.length;
/** „193 kultury”: do zdań, w których liczba stoi w mianowniku lub bierniku. */
export const kulturyMianownik = `${liczbaKultur} ${odmiana(liczbaKultur, "kultura", "kultury", "kultur")}`;
/** „193 pozycje”, jak wyżej. */
export const pozycjeMianownik = `${liczbaKultur} ${odmiana(liczbaKultur, "pozycja", "pozycje", "pozycji")}`;

export const liczbaSklepow = sklepy.length;
/** „sześciu”: do „z sześciu sklepów” i „w sześciu sklepach”. */
export const sklepowSlownie = LICZEBNIK[liczbaSklepow] ?? String(liczbaSklepow);
/** „Lactic.pl, Wańczykówka, Serowar.pl, Artiser.pl, GAP Poland i Browin”. */
export const listaSklepow = `${sklepy.slice(0, -1).join(", ")} i ${sklepy[sklepy.length - 1]}`;

/** Ile pozycji ma producenta w danych strukturalnych strony produktu (wykres „producenci”). */
export const liczbaZProducentem = culturesData.filter((c) => c.manufacturer).length;

/** Ile pozycji ma cenę liczbową (kultura wycofana ze sklepu zostaje bez ceny). */
export const liczbaZCena = ceny.length;
const zl = (n: number) => n.toLocaleString("pl-PL", { maximumFractionDigits: 2 });
/** „od 6 do 99 zł” */
export const zakresCen = `od ${zl(Math.min(...ceny))} do ${zl(Math.max(...ceny))} zł`;
