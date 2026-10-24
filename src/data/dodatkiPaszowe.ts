/**
 * Baza dodatków paszowych (od 24.10.2026): konkretne produkty z polskich sklepów
 * (koncentraty, premiksy, kreda, grys, fosforany, sól, drożdże, aminokwasy) ze
 * składem z etykiety, dawką z etykiety i ofertami sklepów z datą sprawdzenia ceny.
 * Na wzór bazy kultur serowarskich: kalkulator ma odpowiadać nie tylko „czego
 * brakuje”, ale „czym to uzupełnić, ile to kosztuje i gdzie kupić”.
 *
 * TEN PLIK TO MIGAWKA DLA SERWERA MCP (worker-magazyn/src/pasze.js) i zapas dla
 * strony, zanim baza dostanie seed. Strona czyta produkty z Supabase
 * (feed_ingredients z source='dodatek' i feed_offers, hook useFeedIngredients), gdy
 * tam są. Seed robi z tego pliku scripts/gen-dodatki-seed-sql.mts. Osobny plik,
 * bo src/data/feedIngredients.ts jest generowany z arkusza i nie wolno go ruszać.
 *
 * JEDNOSTKI jak w feedIngredients.ts: EM w MJ/kg; białko, Ca, P, Na, aminokwasy
 * w %; Mn, Zn, Fe, Cu, I, Se w mg/kg; witaminy A i D3 w tys. j.m./kg; E, B1, B2,
 * B6, niacyna, kwas pantotenowy, foliowy, biotyna w mg/kg; B12 w µg/kg; cholina w g/kg.
 * Czego etykieta nie podaje, jest 0 (jak puste komórki w arkuszu Marka), a nie zgadywane.
 *
 * NEUTRALNOŚĆ (decyzja Marka): płaci się za obecność i sprawdzone dane, nigdy za
 * pozycję. Pole `partner` jest jawnie oznaczane na karcie, ale propozycje
 * „czym uzupełnić” i wyszukiwanie w MCP układa się wyłącznie po wartościach
 * odżywczych i cenie. Najwyżej 2 propozycje na brak.
 */

import { feedIngredients, type FeedIngredient } from "./feedIngredients.ts";

/** Dla kogo według etykiety. Te same wartości co CHECK w migracji 20261024150000. */
export type Gatunek = "nioski" | "odchow" | "brojlery" | "kaczki" | "gesi" | "indyki";

export const GATUNKI_DODATKOW: Record<Gatunek, string> = {
  nioski: "kury nioski",
  odchow: "odchów kurek",
  brojlery: "brojlery",
  kaczki: "kaczki",
  gesi: "gęsi",
  indyki: "indyki",
};

export type Gmo = "tak" | "nie" | "nieznane";
export type ZrodloSkladu = "etykieta" | "producent" | "norma";

export const OPIS_ZRODLA_SKLADU: Record<ZrodloSkladu, string> = {
  etykieta: "z etykiety",
  producent: "z karty produktu u producenta",
  norma: "z tabel wartości pokarmowej (skład typowy)",
};

export interface OfertaDodatku {
  sklep: string;
  /** Strona produktu w sklepie, bez znacznika; znacznik dokleja adresOferty(). */
  url: string;
  /** Cena brutto opakowania w zł. */
  cenaZl: number;
  opakowanieKg: number;
  /** Dzień, w którym cena była taka na stronie sklepu (RRRR-MM-DD). */
  sprawdzono: string;
}

export interface DodatekPaszowy extends FeedIngredient {
  producent: string;
  gatunki: Gatunek[];
  /** Dawka z etykiety: % mieszanki od–do (oba równe = jedna dawka). */
  dawkaProcOd: number | null;
  dawkaProcDo: number | null;
  /** Dawka z etykiety w g na sztukę dziennie, gdy etykieta nie podaje % mieszanki. */
  dawkaGDziennie: number | null;
  /** Dawkowanie słowami, jak na etykiecie. */
  dawkowanie: string;
  /** Przepis z etykiety koncentratu, np. „30% koncentratu + 70% śruty zbożowe”. */
  stosowanie: string | null;
  skladSurowcowy: string | null;
  gmo: Gmo;
  /** true = dopuszczalny w chowie ekologicznym, false = wykluczony, null = nie oceniano. */
  dopuszczalneEko: boolean | null;
  zrodloSkladu: ZrodloSkladu;
  /** Strona, z której przepisany jest skład. */
  zrodlo: string;
  /** Kiedy skład sprawdzono ze źródłem (RRRR-MM-DD). */
  zweryfikowano: string;
  partner: boolean;
  urlProducenta: string | null;
  /**
   * Surowiec wzorcowy z bazy 124 tego samego rodzaju (kreda z worka -> „Kreda pastewna”).
   * Z niego produkt bierze zalecany limit udziału (src/data/udzialySurowcow.ts),
   * a propozycje „czym uzupełnić” nie pokazują dwóch rzeczy tego samego rodzaju.
   */
  odpowiednik?: string;
  /** Tylko limit udziału, bez grupowania: premiks dla niosek nie jest „Premiksem IF-W”, ale ma jego limit. */
  limityJak?: string;
  /** Co niepewne w danych albo co sprawdzić przy następnej weryfikacji. */
  uwagi?: string;
  oferty: OfertaDodatku[];
}

/** Źródło przy każdej odpowiedzi o dodatkach (strona i MCP). */
export const ZRODLO_DODATKOW = "Moja Serowarnia, baza dodatków paszowych (skład z etykiet i stron producentów, ceny ze sklepów z datą sprawdzenia)";

/** Data stanu migawki; zmieniać przy każdej zmianie danych. */
export const STAN_DODATKOW = "2026-10-24";

/** Znacznik w linkach do sklepów, po którym sklep rozpozna ruch z kalkulatora. */
export const ZNACZNIK_SKLEPU = "utm_source=mojaserowarnia";

/** Adres oferty ze znacznikiem (ten sam zapisuje seed w feed_offers.url). */
export function adresOferty(url: string): string {
  if (/[?&]utm_source=mojaserowarnia(&|$)/.test(url)) return url;
  const [bezKotwicy, kotwica] = url.split("#");
  return `${bezKotwicy}${bezKotwicy.includes("?") ? "&" : "?"}${ZNACZNIK_SKLEPU}${kotwica ? `#${kotwica}` : ""}`;
}

export const cenaZaKg = (o: Pick<OfertaDodatku, "cenaZl" | "opakowanieKg">): number => o.cenaZl / o.opakowanieKg;

/** Najtańsza za kg oferta produktu; przy równej cenie nowsza. null, gdy ofert nie ma. */
export function najtanszaOferta(oferty: OfertaDodatku[] | undefined): OfertaDodatku | null {
  if (!oferty?.length) return null;
  return [...oferty].sort((a, b) => cenaZaKg(a) - cenaZaKg(b) || b.sprawdzono.localeCompare(a.sprawdzono))[0];
}

/**
 * Jedna dawka z etykiety w % mieszanki, do premiksów i dodatków w stałej dawce:
 * dawka, gdy etykieta podaje jedną liczbę, środek przedziału, gdy „od–do”. 0 = etykieta
 * nie podaje dawki w % (np. tylko g na sztukę).
 */
export function dawkaEtykiety(d: Pick<DodatekPaszowy, "dawkaProcOd" | "dawkaProcDo">): number {
  const { dawkaProcOd: od, dawkaProcDo: doo } = d;
  if (od != null && doo != null) return (od + doo) / 2;
  return doo ?? od ?? 0;
}

/** Dawka z etykiety słowami: „2–3% mieszanki”, „15 g na sztukę dziennie”. */
export function opisDawki(d: Pick<DodatekPaszowy, "dawkaProcOd" | "dawkaProcDo" | "dawkaGDziennie">): string {
  const pl = (x: number) => String(x).replace(".", ",");
  const czesci: string[] = [];
  if (d.dawkaProcOd != null && d.dawkaProcDo != null && d.dawkaProcOd !== d.dawkaProcDo) czesci.push(`${pl(d.dawkaProcOd)}–${pl(d.dawkaProcDo)}% mieszanki`);
  else if (d.dawkaProcDo != null || d.dawkaProcOd != null) czesci.push(`${d.dawkaProcOd == null ? "do " : ""}${pl((d.dawkaProcOd ?? d.dawkaProcDo)!)}% mieszanki`);
  if (d.dawkaGDziennie != null) czesci.push(`${pl(d.dawkaGDziennie)} g na sztukę dziennie`);
  return czesci.join(" albo ");
}

// ── Przepis koncentratu: „koncentrat + Twoje zboże” ─────────────────────────

/** Przepis z pola `stosowanie` w liczbach. Nazwy w `inne` to surowce z bazy 124, gdy dały się rozpoznać. */
export interface PrzepisKoncentratu {
  koncentrat: number;
  zboza: [number, number];
  inne: { nazwa: string; tekst: string; od: number; do: number }[];
}

// Dodatki, które etykiety koncentratów każą dosypać obok zboża, rozpoznawane po słowie.
const DOSYPKI: Array<[RegExp, string]> = [
  [/sojow/i, "Śruta sojowa"],
  [/kred|wapien|węglan wapnia/i, "Kreda pastewna"],
  [/fosforan/i, "Fosforan dwuwapniowy"],
  [/s[oó]l/i, "Sól kuchenna"],
  [/olej/i, "Olej rzepakowy"],
];

const liczbaZTekstu = (t: string) => parseFloat(t.replace(",", "."));

/**
 * „15% koncentratu + 6-8% śruta sojowa + 8% kreda + 71-73% śruty zbożowe” ->
 * { koncentrat: 15, zboza: [71, 73], inne: [soja 6–8, kreda 8–8] }. null, gdy tekst
 * nie ma udziału koncentratu i zbóż (wtedy kalkulator niczego nie zgaduje).
 */
export function przepisZeStosowania(stosowanie: string | null | undefined): PrzepisKoncentratu | null {
  if (!stosowanie) return null;
  let koncentrat: number | null = null;
  let zboza: [number, number] | null = null;
  const inne: PrzepisKoncentratu["inne"] = [];
  for (const kawalek of stosowanie.split("+")) {
    const m = kawalek.match(/(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*%\s*(.+)/);
    if (!m) continue;
    const od = liczbaZTekstu(m[1]);
    const doo = m[2] ? liczbaZTekstu(m[2]) : od;
    const co = m[3].trim();
    if (/koncentrat/i.test(co)) koncentrat = od;
    else if (/zbo[żz]/i.test(co)) zboza = [od, doo];
    else inne.push({ nazwa: DOSYPKI.find(([re]) => re.test(co))?.[1] ?? "", tekst: co, od, do: doo });
  }
  return koncentrat != null && zboza ? { koncentrat, zboza, inne } : null;
}

// ── Dane ────────────────────────────────────────────────────────────────────

const ZERA: Omit<FeedIngredient, "nazwa" | "kategoria"> = {
  em: 0, bialko: 0, ca: 0, p: 0, wlokno: 0, na: 0, k: 0, mg: 0, mn: 0, zn: 0, se: 0, fe: 0, i: 0,
  suchaMasa: 0, tluszcz: 0, popiol: 0, skrobia: 0, cukier: 0, pPrzyswajalny: 0, cl: 0, s: 0, cu: 0, co: 0,
  lys: 0, met: 0, metCys: 0, trp: 0, thr: 0, ile: 0, leu: 0, val: 0, his: 0, arg: 0, phe: 0, tyr: 0,
  witA: 0, witD3: 0, witE: 0, witB1: 0, witB2: 0, witB6: 0, kwasPantotenowy: 0, kwasFoliowy: 0,
  biotyna: 0, niacyna: 0, witB12: 0, cholina: 0, kwasLinolowy: 0,
};

type Wpis = Partial<FeedIngredient> & Pick<FeedIngredient, "nazwa" | "kategoria">
  & Omit<DodatekPaszowy, keyof FeedIngredient | "dawkaProcOd" | "dawkaProcDo" | "dawkaGDziennie" | "stosowanie" | "skladSurowcowy" | "urlProducenta" | "partner">
  & Partial<Pick<DodatekPaszowy, "dawkaProcOd" | "dawkaProcDo" | "dawkaGDziennie" | "stosowanie" | "skladSurowcowy" | "urlProducenta" | "partner">>
  & {
    /**
     * Surowiec wzorcowy, z którego biorą się wartości, których etykieta surowca nie
     * podaje (drożdże bez energii, śruta bez aminokwasów). Tylko dla surowców: premiks
     * czy minerał bez danej wartości naprawdę jej nie ma, więc zostaje 0.
     */
    uzupelnijZ?: string;
  };

// Wszystkie odczytane 24.10.2026. Strony sklepów i producentów były czytane przez
// wyszukiwarkę (kontener sesji nie otwierał ich wprost): adresy są przy każdej
// pozycji, do kliknięcia przed seedem. Oferty tylko te, których cena i opakowanie
// wyszły tak samo w dwóch odczytach albo stały wprost na stronie produktu.
const D = "2026-10-24";
const ROLPOL = "https://www.schaumannrolpol.pl/produkty/drob/kury-nioski/koncentraty-kury-nioski";

const WPISY: Wpis[] = [
  // ── Koncentraty ──────────────────────────────────────────────────────────
  {
    nazwa: "Koncentrat 15% Nioska (Rolpol)", kategoria: "Koncentraty",
    producent: "Rolpol Żywienie Zwierząt, Uścikowo (na premiksach Schaumann)", gatunki: ["nioski"],
    em: 8.58, bialko: 41.5, tluszcz: 1.34, wlokno: 2.85, popiol: 11.86, ca: 1.33, p: 1.39, na: 0.79,
    lys: 2.8, met: 1.42, metCys: 2.1, thr: 1.78, trp: 0.57,
    witA: 99, witD3: 13.2, witE: 132, witB1: 13.2, witB2: 33, witB6: 19.8, witB12: 132, kwasPantotenowy: 66, biotyna: 0.396,
    fe: 264, cu: 66, mn: 660, zn: 396, i: 3.3, se: 3.3,
    dawkaProcOd: 15, dawkaProcDo: 15,
    dawkowanie: "15% koncentratu w mieszance, razem ze śrutą sojową, kredą i zbożem (przepis z etykiety niżej)",
    stosowanie: "15% koncentratu + 6–8% śruta sojowa + 8% kreda pastewna (węglan wapnia) + 71–73% śruty zbożowe",
    skladSurowcowy: "Śruta poekstrakcyjna sojowa LINIA (40-3-2), fosforan jednowapniowy, chlorek sodu. Konserwanty: kwasy organiczne E280, E236, E270 6 g/kg. Barwnik: E161g kantaksantyna 13,32 mg/kg.",
    gmo: "tak", dopuszczalneEko: false,
    zrodloSkladu: "producent", zrodlo: ROLPOL, urlProducenta: ROLPOL, zweryfikowano: D,
    uwagi: "Etykieta podaje też witaminę K3 19,8 mg/kg. „Ten produkt zawiera organizmy genetycznie zmodyfikowane.” Cen na stronie producenta nie ma: zamówienia e-mailem, worki 25 kg.",
    oferty: [],
  },
  {
    nazwa: "Koncentrat 30% Nioska (Rolpol)", kategoria: "Koncentraty",
    producent: "Rolpol Żywienie Zwierząt, Uścikowo (na premiksach Schaumann)", gatunki: ["nioski"],
    em: 6.42, bialko: 30.91, tluszcz: 1.0, wlokno: 2.13, popiol: 34.55, ca: 11.32, p: 0.83, na: 0.4,
    lys: 2.09, met: 0.87, metCys: 1.37, thr: 1.33, trp: 0.43,
    witA: 51, witD3: 6.8, witE: 68, witB1: 6.8, witB2: 17, witB6: 10.2, witB12: 68, kwasPantotenowy: 34, biotyna: 0.204,
    fe: 136, cu: 34, mn: 340, zn: 204, i: 1.7, se: 1.7,
    dawkaProcOd: 30, dawkaProcDo: 30,
    dawkowanie: "30% koncentratu w mieszance, reszta to zboże",
    stosowanie: "30% koncentratu + 70% śruty zbożowe",
    skladSurowcowy: "Śruta poekstrakcyjna sojowa LINIA (40-3-2), węglan wapnia, fosforan jednowapniowy, chlorek sodu. Konserwanty: kwasy organiczne E280, E236, E270 6 g/kg. Barwnik: E161g kantaksantyna 6,66 mg/kg.",
    gmo: "tak", dopuszczalneEko: false,
    zrodloSkladu: "producent", zrodlo: ROLPOL, urlProducenta: ROLPOL, zweryfikowano: D,
    uwagi: "Etykieta podaje też witaminę K3 10,2 mg/kg. Śruta sojowa LINIA 40-3-2 to soja GM. Cen na stronie producenta nie ma: zamówienia e-mailem, worki 25 kg.",
    oferty: [],
  },

  // ── Premiksy i mieszanki mineralno-witaminowe dla niosek ─────────────────
  {
    nazwa: "Drobmix Nioska 4% (Agro-Kocięba)", kategoria: "Premiksy",
    producent: "Wytwórnia Pasz i Koncentratów Agro-Kocięba, Czarnocin", gatunki: ["nioski", "odchow"],
    ca: 32.5, p: 1.19, na: 1.9, lys: 0.85, met: 0.81,
    witA: 150, witD3: 45, witE: 450, witB1: 22.5, witB2: 90, witB6: 60, witB12: 225, niacyna: 600,
    kwasPantotenowy: 135, kwasFoliowy: 15, biotyna: 2.4, cholina: 3.5,
    fe: 750, cu: 180, mn: 1200, zn: 1050, i: 15, se: 3,
    dawkaProcOd: 4, dawkaProcDo: 4,
    dawkowanie: "40 kg na 1000 kg mieszanki pełnoporcjowej (4%), dokładnie wymieszać",
    skladSurowcowy: "Nośnik: węglan wapnia, fosforan jednowapniowy, chlorek sodu, wodorowęglan sodu, tlenek magnezu.",
    gmo: "nieznane", dopuszczalneEko: null,
    zrodloSkladu: "producent",
    zrodlo: "https://e-pasze.pl/produkt/mieszanka-witaminowo-mineralna-dla-drobiu-4kg-drobmix-nioska-4/",
    urlProducenta: "https://e-pasze.pl/produkt/mieszanka-witaminowo-mineralna-dla-drobiu-4kg-drobmix-nioska-4/",
    zweryfikowano: D,
    uwagi: "Etykieta podaje wartości w g/kg (Ca 325 g, P 11,9 g, Na 19 g), tu przeliczone na %. Wiaderko 4 kg. Ceny znaleźliśmy tylko na stronach z nieaktualnego odczytu wyszukiwarki, więc ich nie podajemy.",
    oferty: [],
  },
  {
    nazwa: "Dolmix DN (Dolfos)", kategoria: "Premiksy",
    producent: "Dolfos", gatunki: ["nioski"],
    ca: 26.6, p: 1.0, na: 5.2, lys: 1.5, met: 4.0,
    witA: 400, witD3: 80, witE: 880, witB1: 45, witB2: 160, witB6: 100, witB12: 1000, niacyna: 850,
    kwasPantotenowy: 450, kwasFoliowy: 35, biotyna: 2.0, cholina: 6.66,
    fe: 700, cu: 500, mn: 2400, zn: 2000, i: 40, se: 8,
    dawkaProcOd: 2.5, dawkaProcDo: 2.5, dawkaGDziennie: 2.5,
    dawkowanie: "Na 10 niosek 25 g dziennie do paszy; w żywieniu grupowym 2,5 kg na 100 kg paszy (2,5%)",
    skladSurowcowy: "Węglan wapnia (w tym z muszli ostryg), chlorek sodu, węglan wapniowo-magnezowy, fosforan monowapniowy, drożdże suszone, glicerol.",
    gmo: "nieznane", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://farmpetgarden.pl/produkt/witaminy-dla-kur-niosek-dolmix-dn-dolfos-10kg",
    urlProducenta: "https://www.dolfos.pl/en/p/dolmix-dn-en/",
    zweryfikowano: D,
    uwagi: "Producent nie publikuje składu, tu z etykiety przepisanej przez trzy sklepy. Jeden sklep (worek 25 kg) podaje inne liczby: P 6,7%, lizyna 1,9%, metionina 4,97%; do sprawdzenia na worku. Etykieta podaje też witaminę K3 80 mg/kg i betainę 3100 mg/kg. Nie mylić z wersją ekologiczną Dolmix DN RE.",
    oferty: [
      { sklep: "Pan Hodowca", url: "https://www.panhodowca.pl/dolmix-dn-10-kg-witamina-dla-niosek-dolfos-id-126", cenaZl: 67.0, opakowanieKg: 10, sprawdzono: D },
      { sklep: "Farm Pet Garden", url: "https://farmpetgarden.pl/produkt/witaminy-dla-kur-dolmix-dn-dolfos-10kg/", cenaZl: 68.0, opakowanieKg: 10, sprawdzono: D },
    ],
  },
  {
    nazwa: "Polfamix Nioska Extra (Trouw Nutrition)", kategoria: "Premiksy",
    producent: "Trouw Nutrition Polska", gatunki: ["nioski", "indyki", "kaczki", "gesi"],
    ca: 29.88, p: 2.5, na: 4.0, lys: 0.8, met: 1.7, thr: 0.3,
    witA: 250, witD3: 50, witE: 500, witB1: 30, witB2: 100, witB6: 65, witB12: 500, niacyna: 550,
    kwasPantotenowy: 280, kwasFoliowy: 25, cholina: 0.68,
    fe: 1957, cu: 250, mn: 1750, zn: 1500, i: 25, se: 5,
    dawkaProcOd: 4, dawkaProcDo: 4, dawkaGDziennie: 4,
    dawkowanie: "40 g na 10 sztuk dziennie albo 1 kg na 25 kg paszy, przez cały okres nieśności",
    skladSurowcowy: "Fosforan jednowapniowy, węglan wapnia, chlorek sodu.",
    gmo: "nieznane", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://weterynaryjny.pl/produkt/trouw-polfamix-nioska-extra-1-kg/",
    urlProducenta: "https://www.trouwnutrition.pl/pl-pl/programme-lister/polfamix-nioska-extra-467743/",
    zweryfikowano: D,
    uwagi: "Producent publikuje tylko przeznaczenie i dawkę, skład z etykiety przepisanej przez sklepy, w g/kg (Ca 298,8 g, P 25 g, Na 40 g), tu w %. Worek 10 kg ma w jednym sklepie inne liczby (Ca 27,83%, P 3,75%). Żelazo 1957 albo 1975 mg/kg zależnie od sklepu. Etykieta podaje też witaminę K3 50 mg/kg.",
    oferty: [
      { sklep: "MojaFerma.pl", url: "https://mojaferma.pl/pl/p/Polfamix-NIOSKA-Extra-1kg/350", cenaZl: 16.0, opakowanieKg: 1, sprawdzono: D },
      { sklep: "eZoo.pl", url: "https://ezoo.pl/pl/p/POLFAMIX-NIOSKA-EXTRA-1-kg-witaminy-mineraly-drob-kury-11209125/13093", cenaZl: 20.0, opakowanieKg: 1, sprawdzono: D },
    ],
  },

  // ── Dodatki mineralne ────────────────────────────────────────────────────
  {
    nazwa: "Kreda pastewna Viva Max (Polcalc)", kategoria: "Dodatki mineralne", odpowiednik: "Kreda pastewna",
    producent: "Polcalc (grupa Holcim)", gatunki: [],
    ca: 37.6,
    dawkowanie: "Etykieta nie podaje dawki. Producent pisze o 3–4% mieszanki dla drobiu; nioska w nieśności potrzebuje więcej wapnia, więc ilość liczy się z normy.",
    skladSurowcowy: "Węglan wapnia z wapieni i margli jurajskich (Barcin, Piechcin, Pakość). CaCO3 średnio 94%, co najmniej 92,5%. Frakcja 0,4–1,2 mm.",
    gmo: "nie", dopuszczalneEko: true,
    zrodloSkladu: "producent",
    zrodlo: "https://polcalc.pl/en/produkty/kreda-pastewna-viva-max-25-kg/",
    urlProducenta: "https://polcalc.pl/en/produkty/kreda-pastewna-viva-max-25-kg/",
    zweryfikowano: D,
    uwagi: "Ca 37,6% to średnia, producent gwarantuje co najmniej 37%. Węglan wapnia jest na liście pasz mineralnych dopuszczonych w produkcji ekologicznej (rozp. wykonawcze (UE) 2021/1165, załącznik III).",
    oferty: [
      { sklep: "AgroRatajczak", url: "https://sklep.agroratajczak.pl/kreda-pastewna-vivamax-0-4-1-2mm-25kg-p-164.html", cenaZl: 15.0, opakowanieKg: 25, sprawdzono: D },
      { sklep: "Rolmat", url: "https://sklep.rolmat.pl/Kreda-Pastewna-VivaMax-0,4-1,2-25kg", cenaZl: 23.0, opakowanieKg: 25, sprawdzono: D },
    ],
  },
  {
    nazwa: "Grys wapienny Mikros (Mikrop)", kategoria: "Dodatki mineralne", odpowiednik: "Kreda pastewna",
    producent: "Mikrop Čebín (Czechy)", gatunki: ["nioski", "kaczki", "gesi", "indyki"],
    ca: 35,
    dawkowanie: "Do woli (ad libitum), dodawany do ziarna i paszy",
    skladSurowcowy: "Węglan wapnia (wapień kruszony), frakcja ok. 1–2 mm.",
    gmo: "nie", dopuszczalneEko: true,
    zrodloSkladu: "etykieta",
    zrodlo: "https://agrofortel.pl/micros-wapno-grys-3kg",
    urlProducenta: "https://www.mikrop.cz/produkt/vapenny-grit~p528",
    zweryfikowano: D,
    uwagi: "Sklep podaje „zawartość węglanu wapnia ok. 35%”; w wapieniu węglanu jest ponad 90%, więc chodzi o wapń (Ca) i tak to przyjęto. Strona producenta procentu nie podaje. Na opakowaniu oznaczenie ekologiczne CZ-BIO-002.",
    oferty: [
      { sklep: "Agrofortel", url: "https://agrofortel.pl/micros-wapno-grys-3kg", cenaZl: 12.04, opakowanieKg: 3, sprawdzono: D },
    ],
  },
  {
    nazwa: "Muszle ostryg OYTA 2 (Algavita)", kategoria: "Dodatki mineralne", odpowiednik: "Muszle mielone",
    producent: "Algavita, Konstancin-Jeziorna (importer)", gatunki: ["nioski"],
    ca: 37,
    dawkaProcOd: 3, dawkaProcDo: 4,
    dawkowanie: "Dla intensywnie niosących kur 3–4% w mieszance pełnoporcjowej, zamiast części kredy (do 2/3); brojlery i indyki 1–2%",
    skladSurowcowy: "Kruszone muszle ostryg (węglan wapnia), suszone i sterylizowane. OYTA 2 to frakcja dla kur niosek.",
    gmo: "nie", dopuszczalneEko: true,
    zrodloSkladu: "producent",
    zrodlo: "https://algavita.pl/muszle-ostryg-2/muszle-oyta-2/",
    urlProducenta: "https://algavita.pl/muszle-ostryg-2/muszle-oyta-2/",
    zweryfikowano: D,
    uwagi: "Ca 37–39% według dystrybutora, tu dolna granica. Producenta dystrybutor nie podaje. Muszle morskie są na liście pasz mineralnych dopuszczonych w produkcji ekologicznej. Ceny z podaną wagą opakowania nie znaleźliśmy.",
    oferty: [],
  },
  {
    nazwa: "Fosforan jednowapniowy paszowy (Lagrico)", kategoria: "Dodatki mineralne", odpowiednik: "Fosforan jednowapniowy",
    producent: "nie podano (sprzedawca: Lagrico)", gatunki: [],
    ca: 16, p: 22.7,
    dawkowanie: "Etykieta nie podaje dawki; ilość dobiera się do normy fosforu (zwykle 1–2% mieszanki)",
    skladSurowcowy: "Fosforan jednowapniowy Ca(H2PO4)2·H2O, granulat. Fluor najwyżej 2000 mg/kg, wilgotność najwyżej 3%.",
    gmo: "nie", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://lagrico.pl/fosforan-jednowapniowy-paszowy-worek-25kg,id760.html",
    zweryfikowano: D,
    uwagi: "P co najmniej 22,7%, Ca co najmniej 16% (strona sklepu). Producenta sklep nie podaje. Dla chowu ekologicznego potrzebny fosforan odfluorowany: sprawdź u sprzedawcy.",
    oferty: [
      { sklep: "Lagrico", url: "https://lagrico.pl/fosforan-jednowapniowy-paszowy-worek-25kg,id760.html", cenaZl: 139.0, opakowanieKg: 25, sprawdzono: D },
    ],
  },
  {
    nazwa: "Sól paszowa kłodawska (KS Kłodawa)", kategoria: "Dodatki mineralne", odpowiednik: "Sól kuchenna",
    producent: "Kopalnia Soli „Kłodawa”", gatunki: [],
    na: 38.16, cl: 58.84,
    dawkowanie: "Producent nie podaje dawki; drób potrzebuje ok. 0,3% soli w paszy",
    skladSurowcowy: "Sól kamienna paszowa (PN-C-84081-2:1998), NaCl co najmniej 97%, bez antyzbrylacza.",
    gmo: "nie", dopuszczalneEko: true,
    zrodloSkladu: "producent",
    zrodlo: "https://sol-klodawa.com.pl/wp-content/uploads/2020/10/s%C3%B3l-paszowa-nowe-2020.pdf",
    urlProducenta: "https://sol-klodawa.com.pl/sol-paszowa/",
    zweryfikowano: D,
    uwagi: "Producent podaje NaCl co najmniej 97%; sód i chlor wyliczone z tej zawartości (czysty NaCl to 39,34% Na i 60,66% Cl). Chlorek sodu jest na liście pasz mineralnych dopuszczonych w produkcji ekologicznej.",
    oferty: [
      { sklep: "Paszowo.pl", url: "https://paszowo.pl/dodatki-paszowe-dla-bydla/sol-kamienna-klodawska-naturalna-paszowa-25kg.html", cenaZl: 29.0, opakowanieKg: 25, sprawdzono: D },
    ],
  },

  // ── Drożdże i śruta (surowce: czego etykieta nie podaje, z tabel) ────────
  {
    nazwa: "Drożdże piwne sypkie (Mikrop)", kategoria: "Produkty uboczne, śruty i oleje", odpowiednik: "Drożdże piwne", uzupelnijZ: "Drożdże piwne",
    producent: "Mikrop Čebín (Czechy)", gatunki: ["nioski", "kaczki", "indyki"],
    bialko: 44, popiol: 7,
    dawkaGDziennie: 0.6,
    dawkowanie: "Na 10 sztuk dziennie: kury i kaczki 3–6 g, indyki 10–12 g, drób do 4. tygodnia 1–2 g, od 5. do 12. tygodnia 3 g",
    skladSurowcowy: "Drożdże suszone (Saccharomyces cerevisiae), sypkie.",
    gmo: "nieznane", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://www.ketris.pl/drozdze-piwowarskie-25kg_z10013/",
    urlProducenta: "https://www.mikrop.cz/vyziva-zvirat/drobnochovy-zajmove-chovy/drubez",
    zweryfikowano: D,
    uwagi: "Etykieta podaje białko 44% i popiół 7%; pozostałe wartości przyjęte jak dla „Drożdże piwne” z tabel. Dawka w kalkulatorze to górna dawka dla kur (6 g na 10 sztuk dziennie). Nie mylić z granulowaną wersją Mikrop (drożdże ze śrutą, ok. 25% białka).",
    oferty: [
      { sklep: "Ketris", url: "https://www.ketris.pl/drozdze-piwowarskie-25kg_z10013/", cenaZl: 281.77, opakowanieKg: 25, sprawdzono: D },
    ],
  },
  {
    nazwa: "Drożdże piwne Brewers Yeast S (Leiber)", kategoria: "Produkty uboczne, śruty i oleje", odpowiednik: "Drożdże piwne", uzupelnijZ: "Drożdże piwne",
    producent: "Leiber (Niemcy)", gatunki: [],
    bialko: 43, tluszcz: 1, wlokno: 1, popiol: 7, ca: 0.2, p: 1.0, lys: 3.0, met: 0.5, metCys: 1.2, thr: 2.2, trp: 0.4,
    dawkaProcOd: 3, dawkaProcDo: 5,
    dawkowanie: "3–5% w paszy pełnoporcjowej dla drobiu, zależnie od gatunku i okresu",
    skladSurowcowy: "100% Saccharomyces cerevisiae (drożdże piwne), suszone rozpyłowo.",
    gmo: "nie", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://kopalko.pl/sklep/produkty-dla-bydla/drozdze-dla-bydla/leiber-brewers-yeast/",
    urlProducenta: "https://leibergmbh.de/en/markets-solutions/livestock/poultry/",
    zweryfikowano: D,
    uwagi: "Skład z karty dystrybutora (Kopalko). Energii i sodu karta nie podaje: przyjęte jak dla „Drożdże piwne” z tabel. Ta sama strona dla koni podaje 40% białka zamiast 43%.",
    oferty: [
      { sklep: "Kopalko", url: "https://kopalko.pl/sklep/produkty-dla-bydla/drozdze-dla-bydla/leiber-brewers-yeast/", cenaZl: 324.0, opakowanieKg: 25, sprawdzono: D },
    ],
  },
  {
    nazwa: "Śruta sojowa bez GMO (Market-Rolniczy)", kategoria: "Produkty uboczne, śruty i oleje", odpowiednik: "Śruta sojowa", uzupelnijZ: "Śruta sojowa",
    producent: "nie podano (sprzedawca: Market-Rolniczy, Poznań)", gatunki: [],
    bialko: 46, tluszcz: 1.6, wlokno: 3.5,
    dawkaProcDo: 20,
    dawkowanie: "10–20% mieszanki (bez podziału na gatunki)",
    skladSurowcowy: "Śruta sojowa poekstrakcyjna bez GMO, worek 20 kg.",
    gmo: "nie", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://market-rolniczy.pl/768-sruta-sojowa-bez-gmo-.html",
    zweryfikowano: D,
    uwagi: "Etykieta podaje białko 46%, tłuszcz 1,6% i włókno najwyżej 3,5%; resztę przyjęto jak dla zwykłej śruty sojowej z tabel. „Bez GMO” według nazwy i opisu sprzedawcy, bez certyfikatu na stronie. Na tej samej stronie widać też cenę 110 zł.",
    oferty: [
      { sklep: "Market-Rolniczy", url: "https://market-rolniczy.pl/768-sruta-sojowa-bez-gmo-.html", cenaZl: 140.0, opakowanieKg: 20, sprawdzono: D },
    ],
  },

  // ── Aminokwasy ───────────────────────────────────────────────────────────
  {
    nazwa: "DL-metionina 99% paszowa (bez marki)", kategoria: "Aminokwasy i dodatki paszowe", odpowiednik: "Metionina",
    producent: "nie podano (sprzedawcy: Wisagro, PanPasza)", gatunki: ["nioski", "brojlery", "indyki"],
    met: 99, metCys: 99,
    dawkowanie: "Etykieta nie podaje dawki dla drobiu: wpisz dawkę z receptury (zwykle dziesiąte części procenta)",
    skladSurowcowy: "DL-metionina z syntezy chemicznej, co najmniej 99%.",
    gmo: "nie", dopuszczalneEko: false,
    zrodloSkladu: "etykieta",
    zrodlo: "https://wisagro.pl/produkt/dl-metionina-99-aminokwas-paszowy-dla-drobiu-worek-25-kg/",
    zweryfikowano: D,
    uwagi: "Producenta sklepy nie podają. Syntetyczne aminokwasy są w chowie ekologicznym niedopuszczalne.",
    oferty: [
      { sklep: "PanPasza", url: "https://panpasza.pl/pl/p/Metionina-99-25kg/256", cenaZl: 600.0, opakowanieKg: 25, sprawdzono: D },
      { sklep: "Wisagro", url: "https://wisagro.pl/produkt/dl-metionina-99-aminokwas-paszowy-dla-drobiu-worek-25-kg/", cenaZl: 640.0, opakowanieKg: 25, sprawdzono: D },
    ],
  },
  {
    nazwa: "Rhodimet NP99 (Adisseo)", kategoria: "Aminokwasy i dodatki paszowe", odpowiednik: "Metionina",
    producent: "Adisseo (Francja), w Polsce Adifeed", gatunki: [],
    met: 99, metCys: 99,
    dawkowanie: "Producent nie podaje dawki dla drobiu: wpisz dawkę z receptury",
    skladSurowcowy: "DL-metionina, co najmniej 99%, sypki proszek. Worki 25 kg i big bagi.",
    gmo: "nie", dopuszczalneEko: false,
    zrodloSkladu: "producent",
    zrodlo: "https://www.adisseo.com/en/products/rhodimet/rhodimet-np99/",
    urlProducenta: "https://www.adisseo.com/en/products/rhodimet/rhodimet-np99/",
    zweryfikowano: D,
    uwagi: "Sprzedaż hurtowa przez Adifeed, dla wytwórni pasz; sklepu z ceną nie znaleźliśmy.",
    oferty: [],
  },
];

export const DODATKI_PASZOWE: DodatekPaszowy[] = WPISY.map(({ uzupelnijZ, ...w }) => {
  const wzor = uzupelnijZ ? feedIngredients.find((f) => f.nazwa === uzupelnijZ) : undefined;
  if (uzupelnijZ && !wzor) throw new Error(`dodatkiPaszowe: brak surowca wzorcowego „${uzupelnijZ}”`);
  const { nazwa: _n, kategoria: _k, ...skladWzoru } = wzor ?? { nazwa: "", kategoria: "", ...ZERA };
  return {
    ...ZERA,
    ...skladWzoru,
    dawkaProcOd: null, dawkaProcDo: null, dawkaGDziennie: null, stosowanie: null, skladSurowcowy: null,
    urlProducenta: null, partner: false,
    ...w,
  };
});
const PO_NAZWIE = new Map(DODATKI_PASZOWE.map((d) => [d.nazwa, d]));

/** Produkt z migawki po dokładnej nazwie. */
export const dodatekPoNazwie = (nazwa: string): DodatekPaszowy | undefined => PO_NAZWIE.get(nazwa);
