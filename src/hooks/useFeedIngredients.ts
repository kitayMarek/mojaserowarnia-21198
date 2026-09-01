/**
 * useFeedIngredients — źródło składników dla kalkulatora pasz.
 *
 * Model (Opcja A): baza wzorcowa + zgłoszenia społeczności żyją w Supabase (feed_ingredients,
 * status='approved'). Plik src/data/feedIngredients.ts to natychmiastowy fallback (pierwsze
 * malowanie, offline, oraz zanim baza zostanie zaseedowana).
 *
 * Anty-duplikat: jeśli w bazie jest już seed wzorcowy (source='baza') — bierzemy WYŁĄCZNIE z bazy.
 * Jeśli jeszcze nie ma (przed seedem) — łączymy plik (baza) + zatwierdzone zgłoszenia z DB.
 */
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { feedIngredients, feedCategories, type FeedIngredient } from "@/data/feedIngredients";

const num = (v: unknown): number => (v == null || v === "" ? 0 : Number(v) || 0);

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

export function useFeedIngredients() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    let cancelled = false;
    (supabase as any)
      .from("feed_ingredients")
      .select("*")
      .eq("status", "approved")
      .order("nazwa", { ascending: true })
      .then(({ data }: { data: Record<string, unknown>[] | null }) => {
        if (!cancelled && data) setRows(data);
      });
    return () => { cancelled = true; };
  }, []);

  const ingredients = useMemo<FeedIngredient[]>(() => {
    const hasBaza = rows.some((r) => r.source === "baza");
    const mapped = rows.map(mapRow);
    return hasBaza ? mapped : [...feedIngredients, ...mapped];
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

  return { ingredients, categories };
}
