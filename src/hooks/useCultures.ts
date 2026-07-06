/**
 * useCultures — hook zastępujący import z culturesDataComplete.ts
 *
 * PRZED (stary kod):
 *   import { culturesData } from "@/data/culturesDataComplete";
 *
 * PO (nowy kod):
 *   import { useCultures } from "@/hooks/useCultures";
 *   const { cultures, loading, error } = useCultures();
 */

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

// Typ zgodny ze starym interfejsem Culture z culturesDataComplete.ts
// + dodatkowe pola z bazy danych
export interface Culture {
  id: string;
  name: string;
  composition: string;
  application: string;
  temperature: string;
  type: string;
  shop: string;
  shopUrl: string;
  productUrl?: string;
  price: string;           // price_label z bazy — kompatybilność wsteczna
  price_numeric?: number;
  image_url?: string;      // miniatura produktu ze sklepu (hotlink)
  lastChanged?: string;
  lastChecked?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Mapowanie z formatu bazy danych na format zgodny z poprzednim interfejsem
function mapDbRow(row: Record<string, unknown>): Culture {
  return {
    id:           row.id as string,
    name:         row.name as string,
    composition:  row.composition as string ?? "",
    application:  row.application as string ?? "",
    temperature:  row.temperature as string ?? "",
    type:         row.type as string ?? "",
    shop:         row.shop as string ?? "",
    shopUrl:      row.shop_url as string ?? "",
    productUrl:   row.product_url as string ?? undefined,
    price:        row.price_label as string ?? "",      // kompatybilność wsteczna
    price_numeric: row.price_numeric as number ?? undefined,
    image_url:    row.image_url as string ?? undefined,
    lastChanged:  row.last_changed as string ?? undefined,
    lastChecked:  row.last_checked as string ?? undefined,
    is_active:    row.is_active as boolean ?? true,
    created_at:   row.created_at as string,
    updated_at:   row.updated_at as string,
  };
}

// ─── Główny hook ─────────────────────────────────────────────────────────────

interface UseCulturesOptions {
  type?: string;        // filtr po typie (np. "mezofilne")
  shop?: string;        // filtr po sklepie
  search?: string;      // wyszukiwanie tekstowe
  onlyActive?: boolean; // domyślnie true
}

interface UseCulturesReturn {
  cultures: Culture[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  // Unikalne wartości do budowania filtrów
  uniqueTypes: string[];
  uniqueShops: string[];
}

export function useCultures(options: UseCulturesOptions = {}): UseCulturesReturn {
  const { type, shop, search, onlyActive = true } = options;

  const [allCultures, setAllCultures] = useState<Culture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchCultures() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("cultures")
          .select("*")
          .order("name", { ascending: true });

        if (onlyActive) {
          query = query.eq("is_active", true);
        }

        const { data, error: sbError } = await query;

        if (sbError) throw sbError;
        if (!cancelled) {
          setAllCultures((data ?? []).map(mapDbRow));
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Błąd pobierania kultur";
          setError(msg);
          console.error("[useCultures]", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCultures();
    return () => { cancelled = true; };
  }, [onlyActive, refreshTick]);

  // Filtrowanie po stronie klienta (szybkie dla 147-500 rekordów)
  const cultures = useMemo(() => {
    let result = allCultures;

    if (type && type !== "all") {
      result = result.filter(c => c.type === type);
    }

    if (shop && shop !== "all") {
      result = result.filter(c => c.shop === shop);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.composition.toLowerCase().includes(q) ||
        c.application.toLowerCase().includes(q) ||
        c.shop.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allCultures, type, shop, search]);

  const uniqueTypes = useMemo(
    () => [...new Set(allCultures.map(c => c.type).filter(Boolean))].sort(),
    [allCultures]
  );

  const uniqueShops = useMemo(
    () => [...new Set(allCultures.map(c => c.shop).filter(Boolean))].sort(),
    [allCultures]
  );

  return {
    cultures,
    loading,
    error,
    refresh: () => setRefreshTick(t => t + 1),
    uniqueTypes,
    uniqueShops,
  };
}

// ─── Hook dla szczegółów pojedynczej kultury ──────────────────────────────────

interface UseCultureDetailReturn {
  culture: Culture | null;
  priceHistory: PriceHistoryEntry[];
  loading: boolean;
  error: string | null;
}

export interface PriceHistoryEntry {
  id: string;
  price_label: string;
  price_numeric: number | null;
  recorded_at: string;
  source: string;
}

export function useCultureDetail(id: string | null): UseCultureDetailReturn {
  const [culture, setCulture] = useState<Culture | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchDetail() {
      try {
        const [cultureRes, historyRes] = await Promise.all([
          supabase.from("cultures").select("*").eq("id", id).single(),
          supabase
            .from("price_history")
            .select("*")
            .eq("culture_id", id)
            .order("recorded_at", { ascending: false })
            .limit(20),
        ]);

        if (cultureRes.error) throw cultureRes.error;

        if (!cancelled) {
          setCulture(mapDbRow(cultureRes.data as Record<string, unknown>));
          setPriceHistory((historyRes.data ?? []) as PriceHistoryEntry[]);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Błąd pobierania kultury";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDetail();
    return () => { cancelled = true; };
  }, [id]);

  return { culture, priceHistory, loading, error };
}
