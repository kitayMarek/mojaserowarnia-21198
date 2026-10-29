/**
 * Lista zakupów do sera: przepis + litry mleka → co kupić, ile zużyjesz na
 * partię, gdzie i za ile, koszt partii i kg sera.
 *
 * Wzór: lista zakupów aplikacji Policz i Kup (planer.mojapasza.com). Te same
 * zasady: kolejność ofert tylko po cenie, każda cena z datą i linkiem, nic nie
 * nazywamy ceną bieżącą, a czego dane nie mówią, tego nie liczymy (null).
 *
 * SKĄD ILOŚĆ:
 *   kultury     opakowanie na packLiters litrów, więc zużycie = litry / packLiters;
 *   podpuszczka i CaCl2  dawkowanie sklepu dla tego produktu (dodatkiSerowarskie.ts),
 *               bo moc preparatów różni się kilkukrotnie; ml z przepisu tylko obok;
 *   sól         zasada z przepisu (g na kg sera) razy wydajność przepisu.
 * Krople na ml: 20 kropli ≈ 1 ml, ta sama reguła co w KalkulatorBeaugel.tsx.
 *
 * Funkcje są czyste (bez Reacta), żeby ten sam rachunek mógł kiedyś wziąć
 * serwer MCP, jak dziś bierze zaLitr i adresKultury.
 */

import { culturesData, type Culture } from "@/data/culturesDataComplete";
import { dodatkiSerowarskie, type OfertaDodatku, type RodzajDodatku } from "@/data/dodatkiSerowarskie";
import { kulturyPrzepisow, type PowodWyboru } from "@/data/kulturyPrzepisow";
import { adresKultury } from "@/lib/adresKultury";

export const KROPLI_W_ML = 20;

export type Zakres = [number, number];

export interface Oferta {
  id: string;
  produkt: string;
  odmiana: string | null;
  sklep: string;
  sklepId?: string;
  url: string | null;
  cenaZl: number;
  /** Np. „50 ml” albo „na 100 l mleka”. */
  opakowanie: string | null;
  sprawdzono: string | null;
  dawkaTekst: string | null;
  /** Na ile litrów mleka starcza jedno opakowanie; null = nie wiadomo. */
  litrowNaOpakowanie: Zakres | null;
  /** Ile opakowań kupić na tę partię; null = nie wiadomo, czy jedno wystarczy. */
  opakowan: number | null;
  /** Wydatek przy kasie: opakowania razy cena (jedno, gdy nie wiadomo). */
  doKasyZl: number;
  /** Koszt zużycia na partię; null, gdy dane sklepu na to nie pozwalają. */
  naPartieZl: Zakres | null;
  /** Ilość na partię w jednostce dawki sklepu. */
  ilosc: { zakres: Zakres; jednostka: string } | null;
  /** Na ile takich partii starczy opakowanie (dolna granica). */
  starczyNaPartii: number | null;
  powod?: PowodWyboru;
  uwaga?: string;
}

export type RodzajWiersza = "kultura" | RodzajDodatku;

export interface Wiersz {
  klucz: string;
  rodzaj: RodzajWiersza;
  nazwa: string;
  wymagana: boolean;
  wOryginale?: string;
  uwaga?: string;
  oferty: Oferta[];
  /** Domyślny wybór: najmniej przy kasie wśród ofert, które na pewno starczą, potem najtaniej na partię. */
  domyslna: string | null;
}

export interface Lista {
  wiersze: Wiersz[];
  inneZakupy: string[];
}

const zl = (x: number) => Math.round(x * 100) / 100;

/** Litry mleka z opisu wsadu, np. „≈ 15 L mleka pełnego”. */
export function litryZPrzepisu(opis: string): number | null {
  const m = opis.match(/(\d+(?:,\d+)?)\s*L\b/);
  return m ? Number(m[1].replace(",", ".")) : null;
}

/** Wydajność z opisu „≈ 1,2–1,5 kg z 10 L mleka” jako kg sera na litr mleka. */
export function wydajnoscZPrzepisu(opis: string): Zakres | null {
  const m = opis.match(/(\d+(?:,\d+)?)(?:\s*[–-]\s*(\d+(?:,\d+)?))?\s*kg z (\d+(?:,\d+)?) L mleka/);
  if (!m) return null;
  const n = (s: string) => Number(s.replace(",", "."));
  const litry = n(m[3]);
  return [n(m[1]) / litry, n(m[2] ?? m[1]) / litry];
}

function opakowan(litry: number, naOpak: Zakres | null): number | null {
  if (!naOpak || naOpak[0] <= 0) return null;
  return Math.max(1, Math.ceil(litry / naOpak[0]));
}

function starczy(litry: number, naOpak: Zakres | null): number | null {
  if (!naOpak || litry <= 0) return null;
  return Math.floor(naOpak[0] / litry);
}

function ofertaKultury(k: Culture, litry: number, powod: PowodWyboru): Oferta | null {
  if (k.price_numeric == null) return null;
  const naOpak: Zakres | null = k.packLiters ? [k.packLiters, k.packLiters] : null;
  const ile = opakowan(litry, naOpak);
  return {
    id: `kultura:${k.shop}:${k.name}`,
    produkt: k.name,
    odmiana: k.type,
    sklep: k.shop,
    sklepId: k.sklepId,
    url: k.productUrl || k.shopUrl || null,
    cenaZl: k.price_numeric,
    opakowanie: k.packLiters ? `na ${k.packLiters} l mleka` : null,
    sprawdzono: k.lastChecked ?? null,
    dawkaTekst: k.doseLabel ?? null,
    litrowNaOpakowanie: naOpak,
    opakowan: ile,
    doKasyZl: zl((ile ?? 1) * k.price_numeric),
    naPartieZl: k.packLiters ? [zl((k.price_numeric * litry) / k.packLiters), zl((k.price_numeric * litry) / k.packLiters)] : null,
    ilosc: k.packLiters ? { zakres: [litry / k.packLiters, litry / k.packLiters], jednostka: "opakowania" } : null,
    starczyNaPartii: starczy(litry, naOpak),
    powod,
  };
}

/** Dawka w jednostce opakowania (krople → ml); null, gdy jednostki się nie spotykają. */
function dawkaWJednostceOpakowania(o: OfertaDodatku): Zakres | null {
  if (!o.dawkaNa10L || !o.opakowanie) return null;
  const { od, do: doo, jednostka } = o.dawkaNa10L;
  if (jednostka === o.opakowanie.jednostka) return [od, doo];
  if (jednostka === "krople" && o.opakowanie.jednostka === "ml") return [od / KROPLI_W_ML, doo / KROPLI_W_ML];
  return null;
}

function litrowZDawki(o: OfertaDodatku): Zakres | null {
  if (o.litrowNaOpakowanie) return [o.litrowNaOpakowanie.od, o.litrowNaOpakowanie.do];
  const d = dawkaWJednostceOpakowania(o);
  if (!d || !o.opakowanie) return null;
  // Większa dawka = mniej litrów z opakowania.
  return [(o.opakowanie.ilosc / d[1]) * 10, (o.opakowanie.ilosc / d[0]) * 10];
}

function opisOpakowania(o: OfertaDodatku): string | null {
  if (!o.opakowanie) return null;
  const { ilosc, jednostka } = o.opakowanie;
  if (ilosc < 1000) return `${ilosc} ${jednostka}`;
  return `${(ilosc / 1000).toLocaleString("pl-PL")} ${jednostka === "ml" ? "l" : "kg"}`;
}

function ofertaDodatku(
  o: OfertaDodatku,
  litry: number,
  zPrzepisu?: { od: number; do: number; jednostka: "krople"; naLitrow: number },
): Oferta {
  let naOpak = litrowZDawki(o);
  let ilosc: Oferta["ilosc"] = o.dawkaNa10L
    ? { zakres: [(o.dawkaNa10L.od * litry) / 10, (o.dawkaNa10L.do * litry) / 10], jednostka: o.dawkaNa10L.jednostka }
    : null;
  let naPartie: Zakres | null = naOpak ? [zl((o.cenaZl * litry) / naOpak[1]), zl((o.cenaZl * litry) / naOpak[0])] : null;

  if (zPrzepisu) {
    // Np. twaróg: kilka kropli na partię, niezależnie od dawki sklepu dla serów podpuszczkowych.
    const krople: Zakres = [(zPrzepisu.od * litry) / zPrzepisu.naLitrow, (zPrzepisu.do * litry) / zPrzepisu.naLitrow];
    ilosc = { zakres: krople, jednostka: "krople" };
    if (o.opakowanie?.jednostka === "ml") {
      const ml: Zakres = [krople[0] / KROPLI_W_ML, krople[1] / KROPLI_W_ML];
      naOpak = [(o.opakowanie.ilosc / ml[1]) * litry, (o.opakowanie.ilosc / ml[0]) * litry];
      naPartie = [zl((o.cenaZl * ml[0]) / o.opakowanie.ilosc), zl((o.cenaZl * ml[1]) / o.opakowanie.ilosc)];
    } else {
      naOpak = null;
      naPartie = null;
    }
  }

  const ile = opakowan(litry, naOpak);
  return {
    id: o.id,
    produkt: o.produkt,
    odmiana: o.odmiana,
    sklep: o.sklep,
    sklepId: o.sklepId,
    url: o.url,
    cenaZl: o.cenaZl,
    opakowanie: opisOpakowania(o),
    sprawdzono: o.sprawdzono,
    dawkaTekst: o.dawkaTekst,
    litrowNaOpakowanie: naOpak,
    opakowan: ile,
    doKasyZl: zl((ile ?? 1) * o.cenaZl),
    naPartieZl: naPartie,
    ilosc,
    starczyNaPartii: starczy(litry, naOpak),
    uwaga: o.uwaga,
  };
}

function ofertaSoli(o: OfertaDodatku, gramy: Zakres | null): Oferta {
  const g = o.opakowanie?.ilosc ?? null;
  const ile = gramy && g ? Math.max(1, Math.ceil(gramy[1] / g)) : 1;
  return {
    id: o.id,
    produkt: o.produkt,
    odmiana: o.odmiana,
    sklep: o.sklep,
    sklepId: o.sklepId,
    url: o.url,
    cenaZl: o.cenaZl,
    opakowanie: opisOpakowania(o),
    sprawdzono: o.sprawdzono,
    dawkaTekst: null,
    litrowNaOpakowanie: null,
    opakowan: ile,
    doKasyZl: zl(ile * o.cenaZl),
    naPartieZl: gramy && g ? [zl((o.cenaZl * gramy[0]) / g), zl((o.cenaZl * gramy[1]) / g)] : null,
    ilosc: gramy ? { zakres: gramy, jednostka: "g" } : null,
    starczyNaPartii: gramy && g ? Math.floor(g / gramy[1]) : null,
  };
}

/** Najmniej przy kasie wśród ofert, które na pewno starczą; remis rozstrzyga koszt partii. */
function domyslna(oferty: Oferta[]): string | null {
  const pewne = oferty.filter((o) => o.opakowan != null && o.naPartieZl != null);
  const pula = pewne.length ? pewne : oferty;
  const naj = [...pula].sort((a, b) => a.doKasyZl - b.doKasyZl || (a.naPartieZl?.[1] ?? Infinity) - (b.naPartieZl?.[1] ?? Infinity))[0];
  return naj?.id ?? null;
}

/** Oferty od najtańszej na partię; bez kosztu partii na końcu, po cenie. */
function poCenie(a: Oferta, b: Oferta): number {
  const x = a.naPartieZl?.[0];
  const y = b.naPartieZl?.[0];
  if (x == null && y == null) return a.cenaZl - b.cenaZl;
  if (x == null) return 1;
  if (y == null) return -1;
  return x - y || a.doKasyZl - b.doKasyZl;
}

export const maListe = (przepisId: string) => przepisId in kulturyPrzepisow;

export function listaZakupow(
  przepisId: string,
  opcje: { litry: number; pasteryzowane: boolean; wydajnosc: Zakres | null },
): Lista | null {
  const mapa = kulturyPrzepisow[przepisId];
  if (!mapa) return null;
  const { litry, pasteryzowane, wydajnosc } = opcje;
  const wiersze: Wiersz[] = [];

  mapa.role.forEach((r, i) => {
    const widziane = new Set<string>();
    const oferty: Oferta[] = [];
    for (const { nazwa, powod } of r.kultury) {
      const adres = adresKultury(nazwa);
      for (const k of culturesData.filter((x) => adresKultury(x.name) === adres)) {
        const klucz = `${k.shop}:${k.name}`;
        if (widziane.has(klucz)) continue;
        widziane.add(klucz);
        const o = ofertaKultury(k, litry, powod);
        if (o) oferty.push(o);
      }
    }
    oferty.sort(poCenie);
    wiersze.push({
      klucz: `kultura-${i}`, rodzaj: "kultura", nazwa: r.rola, wymagana: r.wymagana,
      wOryginale: r.wOryginale, uwaga: r.uwaga, oferty, domyslna: domyslna(oferty),
    });
  });

  const dodatki = (rodzaj: RodzajDodatku) => dodatkiSerowarskie.filter((o) => o.rodzaj === rodzaj);

  const podpuszczki = dodatki("podpuszczka").map((o) => ofertaDodatku(o, litry, mapa.podpuszczkaZPrzepisu)).sort(poCenie);
  wiersze.push({
    klucz: "podpuszczka", rodzaj: "podpuszczka", nazwa: "Podpuszczka", wymagana: true,
    uwaga: mapa.podpuszczkaZPrzepisu
      ? "Ilość z przepisu: do twarogu wystarczy kilka kropli, dawki sklepów są dla serów podpuszczkowych."
      : "Ilość z dawkowania sklepu dla tego produktu, bo moc podpuszczek różni się kilkukrotnie. Zacznij od dolnej dawki.",
    oferty: podpuszczki, domyslna: domyslna(podpuszczki),
  });

  if (mapa.chlorekWapnia && pasteryzowane) {
    const cacl = dodatki("chlorek_wapnia").map((o) => ofertaDodatku(o, litry)).sort(poCenie);
    wiersze.push({
      klucz: "chlorek", rodzaj: "chlorek_wapnia", nazwa: "Chlorek wapnia (CaCl₂)", wymagana: true,
      uwaga: "Do mleka pasteryzowanego. Ilość z dawkowania sklepu dla tego produktu.",
      oferty: cacl, domyslna: domyslna(cacl),
    });
  }

  const gramySoli: Zakres | null =
    mapa.sol.rodzaj === "na_sucho" && wydajnosc
      ? [mapa.sol.gNaKgSera[0] * wydajnosc[0] * litry, mapa.sol.gNaKgSera[1] * wydajnosc[1] * litry]
      : null;
  const sole = dodatki("sol").map((o) => ofertaSoli(o, gramySoli)).sort(poCenie);
  wiersze.push({
    klucz: "sol", rodzaj: "sol", nazwa: "Sól niejodowana", wymagana: mapa.sol.rodzaj === "na_sucho",
    uwaga:
      mapa.sol.rodzaj === "solanka"
        ? "Ser soli się w solance, a ta służy wiele razy, więc soli nie wliczamy w koszt partii. Ile soli na solankę: kalkulator solanki."
        : mapa.sol.rodzaj === "do_smaku"
          ? "Przepis każe solić do smaku, więc soli nie wliczamy."
          : "Ilość z przepisu przeliczona na wydajność sera.",
    oferty: sole, domyslna: domyslna(sole),
  });

  return { wiersze, inneZakupy: mapa.inneZakupy ?? [] };
}

export interface Podsumowanie {
  /** Koszt zużycia dodatków na partię (bez mleka). */
  dodatkiZl: Zakres;
  mlekoZl: number | null;
  partiaZl: Zakres;
  /** Wydatek przy kasie: całe opakowania wybranych ofert. */
  doKasyZl: number;
  kgSera: Zakres | null;
  zaKgZl: Zakres | null;
  /** Wiersze wliczone w koszt, ale bez kosztu partii (brak danych sklepu). */
  bezKosztu: string[];
  sklepy: { sklep: string; sklepId?: string; pozycje: string[]; doKasyZl: number }[];
}

/** Sumy dla wybranych ofert. Liczą się wiersze wymagane; opcjonalne tylko pokazujemy. */
export function podsumuj(
  lista: Lista,
  wybrane: Record<string, string>,
  opcje: { litry: number; cenaMlekaZl: number | null; wydajnosc: Zakres | null; cenaSoliZaKg: number | null },
): Podsumowanie {
  const dodatki: Zakres = [0, 0];
  let doKasy = 0;
  const bezKosztu: string[] = [];
  const sklepy = new Map<string, Podsumowanie["sklepy"][number]>();

  for (const w of lista.wiersze) {
    if (!w.wymagana) continue;
    const id = wybrane[w.klucz] ?? w.domyslna;
    const o = w.oferty.find((x) => x.id === id);
    if (!o) continue;
    let koszt = o.naPartieZl;
    if (w.rodzaj === "sol" && opcje.cenaSoliZaKg != null && o.ilosc) {
      koszt = [zl((o.ilosc.zakres[0] / 1000) * opcje.cenaSoliZaKg), zl((o.ilosc.zakres[1] / 1000) * opcje.cenaSoliZaKg)];
    }
    if (koszt) {
      dodatki[0] += koszt[0];
      dodatki[1] += koszt[1];
    } else bezKosztu.push(w.nazwa);
    if (w.rodzaj === "sol" && opcje.cenaSoliZaKg != null) continue; // własna cena soli: nie kupujesz w sklepie z listy
    doKasy += o.doKasyZl;
    const s = sklepy.get(o.sklep) ?? { sklep: o.sklep, sklepId: o.sklepId, pozycje: [], doKasyZl: 0 };
    s.pozycje.push(o.produkt);
    s.doKasyZl = zl(s.doKasyZl + o.doKasyZl);
    sklepy.set(o.sklep, s);
  }

  const mleko = opcje.cenaMlekaZl != null ? zl(opcje.cenaMlekaZl * opcje.litry) : null;
  const partia: Zakres = [zl(dodatki[0] + (mleko ?? 0)), zl(dodatki[1] + (mleko ?? 0))];
  const kg: Zakres | null = opcje.wydajnosc ? [opcje.wydajnosc[0] * opcje.litry, opcje.wydajnosc[1] * opcje.litry] : null;
  return {
    dodatkiZl: [zl(dodatki[0]), zl(dodatki[1])],
    mlekoZl: mleko,
    partiaZl: partia,
    doKasyZl: zl(doKasy),
    kgSera: kg,
    zaKgZl: kg && kg[0] > 0 ? [zl(partia[0] / kg[1]), zl(partia[1] / kg[0])] : null,
    bezKosztu,
    sklepy: [...sklepy.values()].sort((a, b) => b.doKasyZl - a.doKasyZl),
  };
}

/** Najstarsza i najnowsza data ceny w liście (do zdania „ceny ze stron sklepów z dnia ...”). */
export function datyCen(lista: Lista): string[] {
  const d = new Set<string>();
  for (const w of lista.wiersze) for (const o of w.oferty) if (o.sprawdzono) d.add(o.sprawdzono);
  return [...d].sort();
}
