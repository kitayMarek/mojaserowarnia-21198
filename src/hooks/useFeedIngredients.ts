/**
 * useFeedIngredients — łączy bazę wzorcową 124 składników (plik, źródło: XLS Marka)
 * z zatwierdzonymi zgłoszeniami użytkowników z Supabase (tabela feed_ingredients, status='approved').
 * Baza z pliku działa od razu/offline; zatwierdzone dodatki dochodzą async.
 */
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { feedIngredients, feedCategories, type FeedIngredient } from "@/data/feedIngredients";

const num = (v: unknown): number => (v == null || v === "" ? 0 : Number(v) || 0);

function mapRow(r: Record<string, unknown>): FeedIngredient {
  const kat = (r.kategoria as string) || "Dodane przez społeczność";
  return {
    nazwa: r.nazwa as string,
    kategoria: kat,
    em: num(r.em), bialko: num(r.bialko), ca: num(r.ca), p: num(r.p), wlokno: num(r.wlokno),
    na: num(r.na), k: num(r.k), mg: num(r.mg), mn: num(r.mn), zn: num(r.zn),
    se: num(r.se), fe: num(r.fe), i: num(r.i),
  };
}

export function useFeedIngredients() {
  const [approved, setApproved] = useState<FeedIngredient[]>([]);

  useEffect(() => {
    let cancelled = false;
    (supabase as any)
      .from("feed_ingredients")
      .select("*")
      .eq("status", "approved")
      .order("nazwa", { ascending: true })
      .then(({ data }: { data: Record<string, unknown>[] | null }) => {
        if (!cancelled && data) setApproved(data.map(mapRow));
      });
    return () => { cancelled = true; };
  }, []);

  const ingredients = useMemo(() => [...feedIngredients, ...approved], [approved]);

  // Kategorie: te z pliku + ew. nowe wniesione przez zatwierdzone zgłoszenia (zachowana kolejność).
  const categories = useMemo(() => {
    const seen = new Set(feedCategories);
    const extra = approved.map((a) => a.kategoria).filter((c) => c && !seen.has(c));
    return [...feedCategories, ...Array.from(new Set(extra))];
  }, [approved]);

  return { ingredients, categories };
}
