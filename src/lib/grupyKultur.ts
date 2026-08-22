/**
 * Grupowanie kultur po SKŁADZIE SZCZEPOWYM, nie po nazwie handlowej.
 *
 * PO CO: w bazie 188 kultur ponad połowa to ten sam skład sprzedawany pod różnymi
 * nazwami — np. Lactobacillus bulgaricus + Streptococcus thermophilus figuruje jako
 * Beaugel Yog 1-4, LAMBDA 3-12 i microMilk TB. Kupujący nie ma szans tego zauważyć,
 * bo każdy sklep pokazuje wyłącznie własny katalog.
 *
 * ⚠️ OSTROŻNIE Z WNIOSKIEM. Ten sam skład NIE znaczy „ten sam produkt". Producenci
 * dobierają konkretne szczepy w obrębie gatunku i ich proporcje, czego żadna tabela
 * nie pokazuje. Widać to po przeznaczeniu: ML, MO, MSO i MLL mają identyczny skład,
 * a służą do zupełnie innych rzeczy (masło vs twaróg vs feta). Dlatego strona mówi
 * „zwykle zadziała jako zamiennik, ale sprawdź przeznaczenie", a nie „to to samo".
 *
 * Ta sama reguła jest zaimplementowana w scripts/gen-zamienniki.py (mirror dla botów).
 * Przy zmianie normalizacji trzeba poprawić OBA miejsca.
 */

export interface KulturaWejscie {
  name: string;
  type: string;
  composition: string;
  application: string;
  shop: string;
  price?: string | null;
  price_numeric?: number | null;
  temperature?: string | null;
  // UWAGA: hook useCultures zwraca te dwa pola w camelCase (mapowanie z Supabase),
  // reszte w snake_case. Latwo sie pomylic — sprawdzone w src/hooks/useCultures.ts.
  productUrl?: string | null;
  shopUrl?: string | null;
  /** Poprzednia cena — do pokazania „teraz X (było Y)". */
  pricePrevious?: number | null;
  /** Na ile litrów starcza opakowanie. */
  packLiters?: number | null;
  /** Dawkowanie podane przez sklep. */
  doseLabel?: string | null;
  /** Producent deklarowany przez sklep. */
  manufacturer?: string | null;
  /** Proporcja szczepów — gdy jest, rozstrzyga o zamienności w obrębie grupy. */
  strainRatio?: string | null;
}

export interface GrupaSkladu {
  /** Stabilny identyfikator do kotwic i kluczy Reacta. */
  id: string;
  /** Posortowana lista gatunków — podpis grupy. */
  szczepy: string[];
  /** Kultury o tym składzie. */
  kultury: KulturaWejscie[];
  /** Ile różnych sklepów ma coś z tej grupy. */
  sklepy: string[];
  /** Zakres cen w grupie, gdy znany. */
  cenaMin: number | null;
  cenaMax: number | null;
  /** true, gdy przeznaczenia w grupie się różnią — wtedy zamiana wymaga uwagi. */
  rozneZastosowania: boolean;
  /**
   * true, gdy pozycje w grupie mają RÓŻNE proporcje szczepów.
   * To najmocniejszy sygnał, że mimo identycznego składu gatunkowego nie są
   * zamiennikami: LAMBDA 3 ma 50:50, a LAMBDA 6/7/8/9 mają 80:20.
   */
  rozneProporcje: boolean;
  /** Producenci obecni w grupie — gdy jest ich kilku, warto to pokazać. */
  producenci: string[];
}

/**
 * Część składu opisana po polsku ("wyselekcjonowane kultury bakterii mezofilne")
 * nie identyfikuje produktu — to marketing, nie nazwa gatunku. Grupowanie po takim
 * tekście łączyłoby pozycje, które wcale nie muszą być tym samym.
 */
const POLSKIE =
  /[ąćęłńóśżź]|(bakterie|drozdze|kultur\w*|mieszank\w*|szczep\w*|wyselekcjonowan\w*|ochronn\w*|nieukwaszaj\w*|kwaszac\w*|mezofiln\w*|termofiln\w*|dodatek|aromat\w*)/i;

export function czyLacinska(czesc: string): boolean {
  return !POLSKIE.test(czesc);
}

/** Rozbija opis składu na znormalizowaną listę gatunków. */
export function rozbijSklad(sklad: string): string[] {
  if (!sklad) return [];
  let s = sklad.toLowerCase();
  // "subsp." / "ssp." / "var." to warianty zapisu tego samego — ujednolicamy na kropkę
  s = s.replace(/\b(subsp|ssp|var)\.?\b/g, ".");
  // skróty rodzajowe: "L. lactis" i "Lactococcus lactis" mają trafić w to samo
  s = s.replace(/\blactococcus\b/g, "l.");
  s = s.replace(/\blactobacillus\b/g, "lb.");
  s = s.replace(/\bstreptococcus\b/g, "s.");
  s = s.replace(/\bleuconostoc\b/g, "ln.");
  s = s.replace(/\bpropionibacterium\b/g, "p.");
  s = s.replace(/\bpenicillium\b/g, "pen.");
  s = s.replace(/\bgeotrichum\b/g, "g.");
  s = s.replace(/\bbrevibacterium\b/g, "b.");

  const czesci = s.split(/[,;+/]| oraz | i (?=[a-ząćęłńóśżź.])/);
  const out = new Set<string>();
  for (let c of czesci) {
    c = c.replace(/[^a-ząćęłńóśżź. ]/g, " ");
    c = c.split(/\s+/).filter(Boolean).join(" ").trim();
    // Odsiewamy śmieci i pojedyncze litery po rozbiciu skrótów
    if (c.length >= 5 && /[a-ząćęłńóśżź]{3}/.test(c)) out.add(c);
  }
  return Array.from(out).sort();
}

function idZeSzczepow(szczepy: string[]): string {
  return szczepy
    .join("-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Zwraca wyłącznie grupy, w których ten sam skład występuje pod WIĘCEJ NIŻ JEDNĄ
 * nazwą handlową — tylko takie niosą informację o zamiennikach.
 * Sortowanie: najpierw najliczniejsze.
 */
export function grupujPoSkladzie(kultury: KulturaWejscie[]): GrupaSkladu[] {
  const mapa = new Map<string, KulturaWejscie[]>();

  for (const k of kultury) {
    const szczepy = rozbijSklad(k.composition);
    // Grupujemy WYŁĄCZNIE po nazwach gatunków — patrz komentarz przy POLSKIE.
    if (szczepy.length === 0 || !szczepy.every(czyLacinska)) continue;
    const klucz = szczepy.join("|");
    const lista = mapa.get(klucz);
    if (lista) lista.push(k);
    else mapa.set(klucz, [k]);
  }

  const grupy: GrupaSkladu[] = [];
  for (const [klucz, lista] of mapa) {
    const nazwy = new Set(lista.map((k) => k.name.trim().toLowerCase()));
    if (nazwy.size < 2) continue; // jedna nazwa = nie ma o czym pisać

    const ceny = lista
      .map((k) => k.price_numeric ?? null)
      .filter((c): c is number => typeof c === "number" && c > 0);
    const zastosowania = new Set(
      lista.map((k) => (k.application || "").trim().toLowerCase()).filter(Boolean)
    );
    const szczepy = klucz.split("|");

    grupy.push({
      id: idZeSzczepow(szczepy),
      szczepy,
      kultury: [...lista].sort((a, b) => a.name.localeCompare(b.name, "pl")),
      sklepy: Array.from(new Set(lista.map((k) => k.shop))).sort(),
      cenaMin: ceny.length ? Math.min(...ceny) : null,
      cenaMax: ceny.length ? Math.max(...ceny) : null,
      rozneZastosowania: zastosowania.size > 1,
      rozneProporcje:
        new Set(lista.map((k) => k.strainRatio).filter(Boolean)).size > 1,
      producenci: Array.from(
        new Set(lista.map((k) => k.manufacturer).filter((m): m is string => Boolean(m)))
      ).sort(),
    });
  }

  return grupy.sort((a, b) => b.kultury.length - a.kultury.length);
}

/** Ładna nazwa gatunku do wyświetlenia — odwraca skróty z normalizacji. */
export function ladnyGatunek(s: string): string {
  const mapa: Record<string, string> = {
    "l.": "Lactococcus",
    "lb.": "Lactobacillus",
    "s.": "Streptococcus",
    "ln.": "Leuconostoc",
    "p.": "Propionibacterium",
    "pen.": "Penicillium",
    "g.": "Geotrichum",
    "b.": "Brevibacterium",
  };
  const slowa = s.split(" ");
  const pelne = mapa[slowa[0]];
  let out = pelne ? [pelne, ...slowa.slice(1)].join(" ") : s.charAt(0).toUpperCase() + s.slice(1);
  // "delbrueckii . bulgaricus" → "delbrueckii subsp. bulgaricus"
  out = out.replace(/\s+\.+\s+/g, " subsp. ");
  return out.split(/\s+/).filter(Boolean).join(" ");
}
