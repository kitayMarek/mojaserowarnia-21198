/**
 * useUserLists — zarządzanie prywatnymi listami kultur użytkownika
 *
 * Tabele w Supabase:
 *   user_culture_lists        — listy użytkownika
 *   user_culture_list_items   — kultury w liście (z notatkami)
 *
 * ⚠️ WYDAJNOŚĆ — powód przepisania (2026-08-01):
 * AddToListButton renderuje się w KAŻDYM wierszu tabeli kultur (188 pozycji).
 * Poprzednia wersja przy każdym montowaniu wołała supabase.auth.getUser()
 * (osobny request sieciowy!) oraz osobne zapytanie o listy — czyli ~380
 * requestów przy jednym wejściu na /baza-kultur. Przeglądarka zestawia ~6
 * połączeń na host, reszta czekała w kolejce, a klikniecie "dodaj" lądowało
 * na jej końcu (objaw: mieli i nic się nie dzieje).
 *
 * Teraz: użytkownik z kontekstu useAuth (zero sieci), a dane przez react-query
 * ze wspólnym kluczem — wszystkie instancje współdzielą JEDNO zapytanie.
 */

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// ─── Typy ────────────────────────────────────────────────────────────────────

export interface UserList {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  items_count?: number;
}

export interface UserListItem {
  id: string;
  list_id: string;
  culture_id: string;
  notes: string | null;
  added_at: string;
  culture?: {
    id: string;
    name: string;
    type: string;
    shop: string;
    price_label: string;
    application: string;
    temperature: string;
    product_url: string | null;
  };
}

// ─── Hook główny ──────────────────────────────────────────────────────────────

export function useUserLists() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const userId = user?.id ?? null;

  // Wspólne dla wszystkich instancji — react-query deduplikuje po kluczu
  const listsQuery = useQuery({
    queryKey: ["userLists", userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async (): Promise<UserList[]> => {
      const { data, error } = await (supabase as any)
        .from("user_culture_lists")
        .select("id, name, description, created_at, user_culture_list_items(count)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((l: any) => ({
        id: l.id,
        name: l.name,
        description: l.description,
        created_at: l.created_at,
        items_count: l.user_culture_list_items?.[0]?.count ?? 0,
      }));
    },
  });

  // Jedno zapytanie o CAŁE członkostwo kultur w listach użytkownika.
  // Dzięki temu 188 przycisków nie odpytuje serwera osobno przy otwarciu.
  const membershipQuery = useQuery({
    queryKey: ["userListMembership", userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async (): Promise<Record<string, string[]>> => {
      const { data, error } = await (supabase as any)
        .from("user_culture_list_items")
        .select("list_id, culture_id, user_culture_lists!inner(user_id)")
        .eq("user_culture_lists.user_id", userId);

      if (error) throw error;

      const mapa: Record<string, string[]> = {};
      for (const row of data ?? []) {
        (mapa[row.culture_id] ??= []).push(row.list_id);
      }
      return mapa;
    },
  });

  const odswiez = useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["userLists", userId] }),
      qc.invalidateQueries({ queryKey: ["userListMembership", userId] }),
    ]);
  }, [qc, userId]);

  const createList = useCallback(
    async (name: string, description?: string) => {
      if (!userId) {
        toast({ title: "Musisz być zalogowany", variant: "destructive" });
        return null;
      }

      const { data, error } = await (supabase as any)
        .from("user_culture_lists")
        .insert({ user_id: userId, name: name.trim(), description: description ?? null })
        .select()
        .single();

      if (error) {
        toast({ title: "Błąd", description: error.message, variant: "destructive" });
        return null;
      }

      toast({ title: `Lista "${name}" utworzona` });
      await odswiez();
      return data;
    },
    [userId, odswiez, toast]
  );

  const deleteList = useCallback(
    async (listId: string, listName: string) => {
      const { error } = await (supabase as any)
        .from("user_culture_lists")
        .delete()
        .eq("id", listId);

      if (error) {
        toast({ title: "Błąd usuwania", description: error.message, variant: "destructive" });
        return false;
      }

      toast({ title: `Lista "${listName}" usunięta` });
      await odswiez();
      return true;
    },
    [odswiez, toast]
  );

  const renameList = useCallback(
    async (listId: string, newName: string) => {
      const { error } = await (supabase as any)
        .from("user_culture_lists")
        .update({ name: newName.trim() })
        .eq("id", listId);

      if (error) {
        toast({ title: "Błąd", description: error.message, variant: "destructive" });
        return false;
      }

      toast({ title: "Nazwa zmieniona" });
      await odswiez();
      return true;
    },
    [odswiez, toast]
  );

  const addToList = useCallback(
    async (listId: string, cultureId: string, notes?: string) => {
      const { error } = await (supabase as any)
        .from("user_culture_list_items")
        .upsert(
          { list_id: listId, culture_id: cultureId, notes: notes ?? null },
          { onConflict: "list_id,culture_id" }
        );

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Kultura już jest na tej liście" });
        } else {
          toast({ title: "Błąd", description: error.message, variant: "destructive" });
        }
        return false;
      }

      toast({ title: "Dodano do listy ✓" });
      await odswiez();
      return true;
    },
    [odswiez, toast]
  );

  const removeFromList = useCallback(
    async (itemId: string) => {
      const { error } = await (supabase as any)
        .from("user_culture_list_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        toast({ title: "Błąd", description: error.message, variant: "destructive" });
        return false;
      }
      await odswiez();
      return true;
    },
    [odswiez, toast]
  );

  /**
   * Zwraca id list, w których jest dana kultura.
   * Czyta ze WSPÓLNEGO cache — bez odpytywania serwera per przycisk.
   */
  const getListsForCulture = useCallback(
    async (cultureId: string): Promise<string[]> => {
      return membershipQuery.data?.[cultureId] ?? [];
    },
    [membershipQuery.data]
  );

  return {
    lists: listsQuery.data ?? [],
    loading: listsQuery.isLoading,
    error: listsQuery.error ? (listsQuery.error as Error).message : null,
    refresh: odswiez,
    createList,
    deleteList,
    renameList,
    addToList,
    removeFromList,
    getListsForCulture,
    /** Mapa culture_id → [list_id]; przydatna, gdy chcesz uniknąć async. */
    membership: membershipQuery.data ?? {},
  };
}

// ─── Hook dla szczegółów listy (kultury wewnątrz) ─────────────────────────────

export function useListItems(listId: string | null) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ["userListItems", listId],
    enabled: !!listId,
    staleTime: 30_000,
    queryFn: async (): Promise<UserListItem[]> => {
      const { data, error } = await (supabase as any)
        .from("user_culture_list_items")
        .select(
          "id, list_id, culture_id, notes, added_at, cultures(id, name, type, shop, price_label, application, temperature, product_url)"
        )
        .eq("list_id", listId)
        .order("added_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((item: any) => ({
        id: item.id,
        list_id: item.list_id,
        culture_id: item.culture_id,
        notes: item.notes,
        added_at: item.added_at,
        culture: item.cultures ?? undefined,
      }));
    },
  });

  const refresh = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ["userListItems", listId] });
  }, [qc, listId]);

  const updateNote = useCallback(
    async (itemId: string, notes: string) => {
      const { error } = await (supabase as any)
        .from("user_culture_list_items")
        .update({ notes: notes.trim() || null })
        .eq("id", itemId);

      if (!error) await refresh();
      return !error;
    },
    [refresh]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const { error } = await (supabase as any)
        .from("user_culture_list_items")
        .delete()
        .eq("id", itemId);

      if (!error) {
        await refresh();
        toast({ title: "Usunięto z listy" });
      }
      return !error;
    },
    [refresh, toast]
  );

  return {
    items: itemsQuery.data ?? [],
    loading: itemsQuery.isLoading,
    error: itemsQuery.error ? (itemsQuery.error as Error).message : null,
    refresh,
    updateNote,
    removeItem,
  };
}
