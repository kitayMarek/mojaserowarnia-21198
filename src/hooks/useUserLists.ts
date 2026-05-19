/**
 * useUserLists — zarządzanie prywatnymi listami kultur użytkownika
 *
 * Tabele w Supabase (już istnieją po migracji):
 *   user_culture_lists        — listy użytkownika
 *   user_culture_list_items   — kultury w liście (z notatkami)
 */

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ─── Typy ────────────────────────────────────────────────────────────────────

export interface UserList {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  items_count?: number; // wypełniane przez hook
}

export interface UserListItem {
  id: string;
  list_id: string;
  culture_id: string;
  notes: string | null;
  added_at: string;
  // Joined culture data
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
  const [lists, setLists] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Pobierz wszystkie listy użytkownika z liczbą pozycji
  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    try {
      // @ts-ignore
      const { data, error: sbError } = await supabase
        .from("user_culture_lists")
        .select(`
          id,
          name,
          description,
          created_at,
          user_culture_list_items(count)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (sbError) throw sbError;

      const mapped: UserList[] = (data ?? []).map((l: any) => ({
        id: l.id,
        name: l.name,
        description: l.description,
        created_at: l.created_at,
        items_count: l.user_culture_list_items?.[0]?.count ?? 0,
      }));

      setLists(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  // Utwórz nową listę
  const createList = useCallback(async (name: string, description?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Musisz być zalogowany", variant: "destructive" });
      return null;
    }

    // @ts-ignore
    const { data, error: sbError } = await supabase
      .from("user_culture_lists")
      .insert({ user_id: user.id, name: name.trim(), description: description ?? null })
      .select()
      .single();

    if (sbError) {
      toast({ title: "Błąd", description: sbError.message, variant: "destructive" });
      return null;
    }

    toast({ title: `Lista "${name}" utworzona` });
    await fetchLists();
    return data;
  }, [fetchLists, toast]);

  // Usuń listę
  const deleteList = useCallback(async (listId: string, listName: string) => {
    // @ts-ignore
    const { error: sbError } = await supabase
      .from("user_culture_lists")
      .delete()
      .eq("id", listId);

    if (sbError) {
      toast({ title: "Błąd usuwania", description: sbError.message, variant: "destructive" });
      return false;
    }

    toast({ title: `Lista "${listName}" usunięta` });
    await fetchLists();
    return true;
  }, [fetchLists, toast]);

  // Zmień nazwę listy
  const renameList = useCallback(async (listId: string, newName: string) => {
    // @ts-ignore
    const { error: sbError } = await supabase
      .from("user_culture_lists")
      .update({ name: newName.trim() })
      .eq("id", listId);

    if (sbError) {
      toast({ title: "Błąd", description: sbError.message, variant: "destructive" });
      return false;
    }

    toast({ title: "Nazwa zmieniona" });
    await fetchLists();
    return true;
  }, [fetchLists, toast]);

  // Dodaj kulturę do listy
  const addToList = useCallback(async (listId: string, cultureId: string, notes?: string) => {
    // @ts-ignore
    const { error: sbError } = await supabase
      .from("user_culture_list_items")
      .upsert(
        { list_id: listId, culture_id: cultureId, notes: notes ?? null },
        { onConflict: "list_id,culture_id" }
      );

    if (sbError) {
      if (sbError.code === "23505") {
        toast({ title: "Kultura już jest na tej liście" });
      } else {
        toast({ title: "Błąd", description: sbError.message, variant: "destructive" });
      }
      return false;
    }

    toast({ title: "Dodano do listy ✓" });
    await fetchLists(); // odśwież licznik
    return true;
  }, [fetchLists, toast]);

  // Usuń kulturę z listy
  const removeFromList = useCallback(async (itemId: string) => {
    // @ts-ignore
    const { error: sbError } = await supabase
      .from("user_culture_list_items")
      .delete()
      .eq("id", itemId);

    if (sbError) {
      toast({ title: "Błąd", description: sbError.message, variant: "destructive" });
      return false;
    }

    return true;
  }, [toast]);

  // Sprawdź w których listach jest dana kultura (dla podświetlenia przycisku)
  const getListsForCulture = useCallback(async (cultureId: string): Promise<string[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // @ts-ignore
    const { data } = await supabase
      .from("user_culture_list_items")
      .select("list_id, user_culture_lists!inner(user_id)")
      .eq("culture_id", cultureId)
      .eq("user_culture_lists.user_id", user.id);

    return (data ?? []).map((item: any) => item.list_id);
  }, []);

  return {
    lists,
    loading,
    error,
    refresh: fetchLists,
    createList,
    deleteList,
    renameList,
    addToList,
    removeFromList,
    getListsForCulture,
  };
}

// ─── Hook dla szczegółów listy (kultury wewnątrz) ─────────────────────────────

export function useListItems(listId: string | null) {
  const [items, setItems] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    if (!listId) return;
    setLoading(true);

    try {
      // @ts-ignore
      const { data, error: sbError } = await supabase
        .from("user_culture_list_items")
        .select(`
          id,
          list_id,
          culture_id,
          notes,
          added_at,
          cultures(id, name, type, shop, price_label, application, temperature, product_url)
        `)
        .eq("list_id", listId)
        .order("added_at", { ascending: false });

      if (sbError) throw sbError;

      setItems((data ?? []).map((item: any) => ({
        id: item.id,
        list_id: item.list_id,
        culture_id: item.culture_id,
        notes: item.notes,
        added_at: item.added_at,
        culture: item.cultures ?? undefined,
      })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Aktualizuj notatkę
  const updateNote = useCallback(async (itemId: string, notes: string) => {
    // @ts-ignore
    const { error: sbError } = await supabase
      .from("user_culture_list_items")
      .update({ notes: notes.trim() || null })
      .eq("id", itemId);

    if (!sbError) await fetchItems();
    return !sbError;
  }, [fetchItems]);

  // Usuń pozycję
  const removeItem = useCallback(async (itemId: string) => {
    // @ts-ignore
    const { error: sbError } = await supabase
      .from("user_culture_list_items")
      .delete()
      .eq("id", itemId);

    if (!sbError) {
      setItems(prev => prev.filter(i => i.id !== itemId));
      toast({ title: "Usunięto z listy" });
    }
    return !sbError;
  }, [toast]);

  return { items, loading, error, refresh: fetchItems, updateNote, removeItem };
}
