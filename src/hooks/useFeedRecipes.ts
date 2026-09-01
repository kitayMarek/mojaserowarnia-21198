/**
 * useFeedRecipes — zapisane receptury paszowe zalogowanego użytkownika.
 *
 * Tabela `feed_recipes` (user_id, nazwa, norma, skladniki jsonb) istniała w bazie
 * od dawna, z kompletem polityk dostępu, ale nic jej nie używało — kalkulator nie
 * miał zapisywania. To jest to brakujące podpięcie.
 *
 * Wzorzec taki sam jak w useUserLists: użytkownik z kontekstu `useAuth` (zero
 * dodatkowych zapytań o sesję), dane przez react-query pod wspólnym kluczem.
 *
 * Dostęp pilnuje RLS po stronie bazy (`auth.uid() = user_id`), nie ten kod —
 * hook tylko nie zawraca głowy zapytaniem, gdy nikt nie jest zalogowany.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Skladnik, ZapisanaMieszanka } from "@/types/kalkulatorPasz";

export interface ZapisanaReceptura {
  id: string;
  nazwa: string;
  norma: string;
  skladniki: ZapisanaMieszanka;
  created_at: string;
  updated_at: string;
}

const KLUCZ = ["feed-recipes"] as const;

export function useFeedRecipes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: receptury = [], isLoading } = useQuery({
    queryKey: [...KLUCZ, user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ZapisanaReceptura[]> => {
      const { data, error } = await supabase
        .from("feed_recipes")
        .select("id, nazwa, norma, skladniki, created_at, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ZapisanaReceptura[];
    },
  });

  const odswiez = () => qc.invalidateQueries({ queryKey: [...KLUCZ, user?.id] });

  /** Zapis nowej receptury albo nadpisanie istniejącej o tej samej nazwie. */
  async function zapisz(
    nazwa: string,
    norma: string,
    mieszanka: ZapisanaMieszanka,
  ): Promise<boolean> {
    if (!user) return false;
    const czysta = nazwa.trim();
    if (!czysta) {
      toast({ title: "Podaj nazwę receptury", variant: "destructive" });
      return false;
    }

    // Nadpisujemy po nazwie, bo tak to rozumie użytkownik: „zapisuję znowu tę samą
    // mieszankę". Bez tego kolejne zapisy tej samej nazwy mnożyłyby duplikaty.
    const istniejaca = receptury.find(
      (r) => r.nazwa.toLowerCase() === czysta.toLowerCase(),
    );

    const ladunek = {
      user_id: user.id,
      nazwa: czysta,
      norma,
      skladniki: mieszanka as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    };

    const { error } = istniejaca
      ? await supabase.from("feed_recipes").update(ladunek).eq("id", istniejaca.id)
      : await supabase.from("feed_recipes").insert(ladunek);

    if (error) {
      toast({ title: "Nie udało się zapisać", description: error.message, variant: "destructive" });
      return false;
    }
    toast({
      title: istniejaca ? "Receptura nadpisana" : "Receptura zapisana",
      description: czysta,
    });
    odswiez();
    return true;
  }

  async function usun(id: string, nazwa: string): Promise<void> {
    const { error } = await supabase.from("feed_recipes").delete().eq("id", id);
    if (error) {
      toast({ title: "Nie udało się usunąć", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Receptura usunięta", description: nazwa });
    odswiez();
  }

  return { receptury, isLoading, zalogowany: !!user, zapisz, usun };
}

export type { Skladnik, ZapisanaMieszanka };
