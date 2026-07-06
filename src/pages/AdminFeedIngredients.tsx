/**
 * Moderacja składników paszowych zgłoszonych przez użytkowników (/admin/skladniki).
 * Karty edytowalne — przed zatwierdzeniem można poprawić/uzupełnić dowolne pole.
 * Wchodzi przez AdminRoute; RLS i tak pozwala moderować tylko adminowi.
 */
import { useEffect, useState, useCallback } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { feedCategories } from "@/data/feedIngredients";
import { Check, X, Loader2 } from "lucide-react";

type Row = Record<string, any>;

const NUTRIENTS: { k: string; h: string; step: string }[] = [
  { k: "em", h: "EM (MJ/kg)", step: "0.1" },
  { k: "bialko", h: "Białko (%)", step: "0.1" },
  { k: "ca", h: "Ca (%)", step: "0.01" },
  { k: "p", h: "P (%)", step: "0.01" },
  { k: "wlokno", h: "Włókno (%)", step: "0.1" },
  { k: "na", h: "Na (%)", step: "0.01" },
  { k: "k", h: "K (%)", step: "0.01" },
  { k: "mg", h: "Mg (%)", step: "0.001" },
  { k: "mn", h: "Mn (mg/kg)", step: "1" },
  { k: "zn", h: "Zn (mg/kg)", step: "1" },
  { k: "se", h: "Se (mg/kg)", step: "0.01" },
  { k: "fe", h: "Fe (mg/kg)", step: "1" },
  { k: "i", h: "I (mg/kg)", step: "0.01" },
];

const toNum = (v: unknown): number | null => {
  if (v === "" || v == null) return null;
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
};

export default function AdminFeedIngredients() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("feed_ingredients")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (error) toast({ title: "Błąd wczytywania", description: error.message, variant: "destructive" });
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setField = (id: string, key: string, val: string) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [key]: val } : x)));

  const approve = async (row: Row) => {
    if (!String(row.nazwa || "").trim()) {
      toast({ title: "Nazwa nie może być pusta", variant: "destructive" });
      return;
    }
    setBusy(row.id);
    const payload: Row = {
      nazwa: String(row.nazwa).trim(),
      kategoria: row.kategoria || null,
      zrodlo: row.zrodlo ? String(row.zrodlo).trim() : null,
      status: "approved",
    };
    NUTRIENTS.forEach((n) => { payload[n.k] = toNum(row[n.k]); });
    const { error } = await (supabase as any).from("feed_ingredients").update(payload).eq("id", row.id);
    setBusy(null);
    if (error) { toast({ title: "Nie udało się zapisać", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Zatwierdzono ✅", description: `${payload.nazwa} trafił do kalkulatora.` });
    setRows((r) => r.filter((x) => x.id !== row.id));
  };

  const reject = async (id: string) => {
    setBusy(id);
    const { error } = await (supabase as any).from("feed_ingredients").update({ status: "rejected" }).eq("id", id);
    setBusy(null);
    if (error) { toast({ title: "Nie udało się zapisać", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Odrzucono" });
    setRows((r) => r.filter((x) => x.id !== id));
  };

  const inputCls = "mt-1 w-full p-2 border border-input bg-background text-foreground rounded text-sm";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Składniki — moderacja" }]} />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Moderacja składników paszowych</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Zgłoszenia użytkowników. <strong>Możesz poprawić lub uzupełnić dowolne pole przed zatwierdzeniem</strong> —
            zapisane wartości (po edycji) trafiają do kalkulatora dla wszystkich.
          </p>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Wczytywanie…</div>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground">Brak zgłoszeń do moderacji. 🎉</p>
          ) : (
            <div className="space-y-5">
              {rows.map((row) => (
                <div key={row.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <label className="text-sm font-medium">
                      Nazwa
                      <input value={row.nazwa ?? ""} onChange={(e) => setField(row.id, "nazwa", e.target.value)} className={inputCls} />
                    </label>
                    <label className="text-sm font-medium">
                      Kategoria
                      <select value={row.kategoria ?? feedCategories[0]} onChange={(e) => setField(row.id, "kategoria", e.target.value)} className={inputCls}>
                        {feedCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-medium sm:col-span-2">
                      Źródło składu
                      <input value={row.zrodlo ?? ""} onChange={(e) => setField(row.id, "zrodlo", e.target.value)} className={inputCls} />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {NUTRIENTS.map((n) => (
                      <label key={n.k} className="text-xs text-muted-foreground">
                        {n.h}
                        <input
                          type="number"
                          step={n.step}
                          value={row[n.k] ?? ""}
                          onChange={(e) => setField(row.id, n.k, e.target.value)}
                          className="mt-1 w-full p-1.5 border border-input bg-background text-foreground rounded text-sm"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => approve(row)}
                      disabled={busy === row.id}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" /> Zapisz i zatwierdź
                    </button>
                    <button
                      onClick={() => reject(row.id)}
                      disabled={busy === row.id}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" /> Odrzuć
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
