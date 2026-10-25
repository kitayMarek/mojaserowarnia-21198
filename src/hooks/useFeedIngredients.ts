/**
 * useFeedIngredients — źródło składników dla kalkulatora pasz.
 *
 * Model (Opcja A): baza wzorcowa + zgłoszenia społeczności żyją w Supabase (feed_ingredients,
 * status='approved'). Plik src/data/feedIngredients.ts to natychmiastowy fallback (pierwsze
 * malowanie, offline, oraz zanim baza zostanie zaseedowana).
 *
 * Anty-duplikat: jeśli w bazie jest już seed wzorcowy (source='baza') — bierzemy WYŁĄCZNIE z bazy.
 * Jeśli jeszcze nie ma (przed seedem) — łączymy plik (baza) + zatwierdzone zgłoszenia z DB.
 *
 * Baza dodatków (od 24.10.2026): produkty z etykietą (source='dodatek') i ich oferty
 * (feed_offers). Ta sama zasada: gdy w bazie są produkty, tylko z bazy (ceny poprawione
 * w panelu widać od razu), a do migracji 20261024150000 i seedu z migawki
 * src/data/dodatkiPaszowe.ts. Brak tabeli feed_offers przed migracją to zwykły błąd
 * zapytania, po którym zostaje migawka.
 *
 * Lokalizacja sklepu przy ofercie (od 25.10.2026, migracja 20261025100000): z kolumn
 * feed_offers, gdy są wypełnione, a do migracji i nowego seedu z mapy SKLEPY_DODATKOW.
 */
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { feedIngredients, feedCategories, type FeedIngredient } from "@/data/feedIngredients";
import { SKLADNIKI_Z_KUCHNI } from "@/data/skladnikiZKuchni";
import {
  DODATKI_PASZOWE, KATEGORIA_OSOBNE_KARMIDLO, dodatekPoNazwie, lokalizacjaSklepu, opisDawki,
  type DodatekPaszowy, type Gatunek, type Gmo, type LokalizacjaSklepu, type Odbior, type OfertaDodatku,
  type PunktSklepu, type Wojewodztwo, type ZrodloSkladu,
} from "@/data/dodatkiPaszowe";

const num = (v: unknown): number => (v == null || v === "" ? 0 : Number(v) || 0);
const numLubNull = (v: unknown): number | null => (v == null || v === "" ? null : Number(v));
const tekstLubNull = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);

function mapRow(r: Record<string, unknown>): FeedIngredient {
  return {
    nazwa: r.nazwa as string,
    kategoria: (r.kategoria as string) || "Dodane przez społeczność",
    em: num(r.em), bialko: num(r.bialko), ca: num(r.ca), p: num(r.p), wlokno: num(r.wlokno),
    na: num(r.na), k: num(r.k), mg: num(r.mg), mn: num(r.mn), zn: num(r.zn),
    se: num(r.se), fe: num(r.fe), i: num(r.i),
    // Skład rozszerzony — kolumny dołożone 2026-09-01 z arkusza norm żywieniowych.
    // Zgłoszenia użytkowników ich nie mają i mieć nie będą, więc `num` zamienia
    // brak na zero: pusta wartość nie może wywrócić sumowania mieszanki.
    suchaMasa: num(r.sucha_masa), tluszcz: num(r.tluszcz), popiol: num(r.popiol),
    skrobia: num(r.skrobia), cukier: num(r.cukier),
    pPrzyswajalny: num(r.p_przyswajalny), cl: num(r.cl), s: num(r.s), cu: num(r.cu), co: num(r.co),
    lys: num(r.lys), met: num(r.met), metCys: num(r.met_cys), trp: num(r.trp), thr: num(r.thr),
    ile: num(r.ile), leu: num(r.leu), val: num(r.val), his: num(r.his), arg: num(r.arg),
    phe: num(r.phe), tyr: num(r.tyr),
    witA: num(r.wit_a), witD3: num(r.wit_d3), witE: num(r.wit_e), witB1: num(r.wit_b1),
    witB2: num(r.wit_b2), witB6: num(r.wit_b6), kwasPantotenowy: num(r.kwas_pantotenowy),
    kwasFoliowy: num(r.kwas_foliowy), biotyna: num(r.biotyna), niacyna: num(r.niacyna),
    witB12: num(r.wit_b12), cholina: num(r.cholina), kwasLinolowy: num(r.kwas_linolowy),
  };
}

/** Produkt z bazy: kolumny z migracji 20261024150000; czego tam nie ma (limityJak, uwagi), bierzemy z migawki. */
function mapDodatek(r: Record<string, unknown>, oferty: OfertaDodatku[]): DodatekPaszowy {
  const zMigawki = dodatekPoNazwie(r.nazwa as string);
  const dawki = {
    dawkaProcOd: numLubNull(r.dawka_proc_od),
    dawkaProcDo: numLubNull(r.dawka_proc_do),
    dawkaGDziennie: numLubNull(r.dawka_g_dziennie),
  };
  return {
    ...mapRow(r),
    ...dawki,
    producent: (r.producent as string) || zMigawki?.producent || "",
    gatunki: (Array.isArray(r.gatunki) ? r.gatunki : []) as Gatunek[],
    dawkowanie: tekstLubNull(r.dawkowanie) ?? opisDawki(dawki),
    stosowanie: tekstLubNull(r.stosowanie),
    skladSurowcowy: tekstLubNull(r.sklad_surowcowy),
    gmo: ((r.gmo as Gmo) || "nieznane"),
    dopuszczalneEko: typeof r.dopuszczalne_eko === "boolean" ? r.dopuszczalne_eko : null,
    zrodloSkladu: ((r.zrodlo_skladu as ZrodloSkladu) || "etykieta"),
    zrodlo: (r.zrodlo as string) || zMigawki?.zrodlo || null,
    zweryfikowano: (r.zweryfikowano as string) || "",
    partner: r.partner === true,
    urlProducenta: tekstLubNull(r.url_producenta),
    odpowiednik: tekstLubNull(r.odpowiednik) ?? zMigawki?.odpowiednik,
    limityJak: zMigawki?.limityJak,
    uwagi: zMigawki?.uwagi,
    oferty,
  };
}

// Tabel kalkulatora (feed_ingredients z kolumnami z migracji, feed_offers) nie ma w wygenerowanych
// typach Supabase, więc zamiast `any` wąski typ dokładnie tego, czego tu używamy.
type Wiersze = { data: Record<string, unknown>[] | null };
type Zapytanie = PromiseLike<Wiersze> & {
  eq: (kolumna: string, wartosc: string) => Zapytanie;
  order: (kolumna: string, opcje: { ascending: boolean }) => Zapytanie;
};
const tabela = (nazwa: string) =>
  (supabase as unknown as { from: (t: string) => { select: (k: string) => Zapytanie } }).from(nazwa).select("*");

/** Lokalizacja z kolumn oferty; bez daty sprawdzenia (przed migracją albo seedem) z migawki. Źródło i uwagi zawsze z migawki. */
function mapLokalizacja(o: Record<string, unknown>): LokalizacjaSklepu | null {
  const zMigawki = lokalizacjaSklepu(o.sklep as string);
  if (!o.lokalizacja_sprawdzona) return zMigawki;
  return {
    miejscowosc: tekstLubNull(o.miejscowosc),
    wojewodztwo: tekstLubNull(o.wojewodztwo) as Wojewodztwo | null,
    odbior: tekstLubNull(o.odbior) as Odbior | null,
    punkty: (Array.isArray(o.punkty_odbioru) ? o.punkty_odbioru : []) as PunktSklepu[],
    sprawdzono: o.lokalizacja_sprawdzona as string,
    zrodlo: zMigawki?.zrodlo ?? "",
    uwagi: zMigawki?.uwagi,
  };
}

const mapOferta = (o: Record<string, unknown>): OfertaDodatku => ({
  sklep: o.sklep as string,
  url: o.url as string,
  cenaZl: num(o.cena_zl),
  opakowanieKg: num(o.opakowanie_kg),
  sprawdzono: o.sprawdzono as string,
  lokalizacja: mapLokalizacja(o),
});

export function useFeedIngredients() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [oferty, setOferty] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    let cancelled = false;
    tabela("feed_ingredients")
      .eq("status", "approved")
      .order("nazwa", { ascending: true })
      .then(({ data }) => {
        if (!cancelled && data) setRows(data);
      });
    tabela("feed_offers")
      .then(({ data }) => {
        if (!cancelled && data) setOferty(data);
      });
    return () => { cancelled = true; };
  }, []);

  // Produkty z bazy dodatków: z Supabase, gdy jest seed, a do tego czasu z migawki.
  const dodatki = useMemo<DodatekPaszowy[]>(() => {
    const zBazy = rows.filter((r) => r.source === "dodatek");
    if (!zBazy.length) return DODATKI_PASZOWE;
    const ofertyProduktu = new Map<string, OfertaDodatku[]>();
    for (const o of oferty) {
      const id = o.feed_ingredient_id as string;
      ofertyProduktu.set(id, [...(ofertyProduktu.get(id) ?? []), mapOferta(o)]);
    }
    return zBazy.map((r) => mapDodatek(r, ofertyProduktu.get(r.id as string) ?? []));
  }, [rows, oferty]);

  const ingredients = useMemo<FeedIngredient[]>(() => {
    const hasBaza = rows.some((r) => r.source === "baza");
    const hasDodatki = rows.some((r) => r.source === "dodatek");
    const mapped = rows.map(mapRow);
    // Produkty z kuchni (od 24.10.2026) zawsze na końcu listy: nie ma ich w bazie Supabase,
    // bo to nie pasza, tylko punkt odniesienia dla małych hodowców (src/data/skladnikiZKuchni.ts).
    // Mieszanki do osobnego karmidła (kamień do dziobania) nie wchodzą do paszy, więc nie ma
    // ich na liście składników; są w bazie dodatków i w ramce „Pasza z jednego składnika”.
    return [
      ...(hasBaza ? mapped : [...feedIngredients, ...mapped]),
      ...(hasDodatki ? [] : DODATKI_PASZOWE),
      ...SKLADNIKI_Z_KUCHNI,
    ].filter((s) => s.kategoria !== KATEGORIA_OSOBNE_KARMIDLO);
  }, [rows]);

  // Kategorie w kolejności z pliku, plus ewentualne nowe z bazy — tylko te, które mają składniki.
  const categories = useMemo<string[]>(() => {
    const present = new Set(ingredients.map((i) => i.kategoria));
    const order: string[] = [];
    const seen = new Set<string>();
    for (const c of feedCategories) if (!seen.has(c)) { seen.add(c); order.push(c); }
    for (const it of ingredients) if (it.kategoria && !seen.has(it.kategoria)) { seen.add(it.kategoria); order.push(it.kategoria); }
    return order.filter((c) => present.has(c));
  }, [ingredients]);

  return { ingredients, categories, dodatki };
}
