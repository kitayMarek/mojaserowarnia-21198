/**
 * Zarządzanie składnikami paszowymi (/admin/skladniki):
 *  1) Moderacja zgłoszeń (pending) — edytuj + zatwierdź/odrzuć.
 *  2) Edycja całej bazy (approved: wzorcowa 'baza' + społeczność 'user') — popraw/usuń.
 * Wchodzi przez AdminRoute; RLS pozwala pisać tylko adminowi.
 */
import { useEffect, useState, useCallback } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { feedCategories } from "@/data/feedIngredients";
import { Check, X, Loader2, Save, Trash2, Search } from "lucide-react";

type Row = Record<string, any>;

const NUTRIENTS: { k: string; h: string; step: string }[] = [
  { k: "em", h: "EM (MJ/kg)", step: "0.1" }, { k: "bialko", h: "Białko (%)", step: "0.1" },
  { k: "ca", h: "Ca (%)", step: "0.01" }, { k: "p", h: "P (%)", step: "0.01" },
  { k: "wlokno", h: "Włókno (%)", step: "0.1" }, { k: "na", h: "Na (%)", step: "0.01" },
  { k: "k", h: "K (%)", step: "0.01" }, { k: "mg", h: "Mg (%)", step: "0.001" },
  { k: "mn", h: "Mn (mg/kg)", step: "1" }, { k: "zn", h: "Zn (mg/kg)", step: "1" },
  { k: "se", h: "Se (mg/kg)", step: "0.01" }, { k: "fe", h: "Fe (mg/kg)", step: "1" },
  { k: "i", h: "I (mg/kg)", step: "0.01" },
];

const toNum = (v: unknown): number | null => {
  if (v === "" || v == null) return null;
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
};
const inputCls = "mt-1 w-full p-2 border border-input bg-background text-foreground rounded text-sm";

function Fields({ row, onField }: { row: Row; onField: (k: string, v: string) => void }) {
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <label className="text-sm font-medium">
          Nazwa
          <input value={row.nazwa ?? ""} onChange={(e) => onField("nazwa", e.target.value)} className={inputCls} />
        </label>
        <label className="text-sm font-medium">
          Kategoria
          <select value={row.kategoria ?? feedCategories[0]} onChange={(e) => onField("kategoria", e.target.value)} className={inputCls}>
            {feedCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium sm:col-span-2">
          Źródło składu (notatka)
          <input value={row.zrodlo ?? ""} onChange={(e) => onField("zrodlo", e.target.value)} className={inputCls} />
        </label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {NUTRIENTS.map((n) => (
          <label key={n.k} className="text-xs text-muted-foreground">
            {n.h}
            <input type="number" step={n.step} value={row[n.k] ?? ""} onChange={(e) => onField(n.k, e.target.value)}
              className="mt-1 w-full p-1.5 border border-input bg-background text-foreground rounded text-sm" />
          </label>
        ))}
      </div>
    </>
  );
}

export default function AdminFeedIngredients() {
  const [pending, setPending] = useState<Row[]>([]);
  const [approved, setApproved] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("feed_ingredients").select("*").in("status", ["pending", "approved"]).order("nazwa", { ascending: true });
    if (error) toast({ title: "Błąd wczytywania", description: error.message, variant: "destructive" });
    const rows = (data as Row[]) ?? [];
    setPending(rows.filter((r) => r.status === "pending").sort((a, b) => (a.created_at > b.created_at ? 1 : -1)));
    setApproved(rows.filter((r) => r.status === "approved"));
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const editField = (setter: React.Dispatch<React.SetStateAction<Row[]>>) =>
    (id: string, key: string, val: string) => setter((r) => r.map((x) => (x.id === id ? { ...x, [key]: val } : x)));

  const payload = (row: Row, extra: Row): Row => {
    const p: Row = { nazwa: String(row.nazwa || "").trim(), kategoria: row.kategoria || null,
      zrodlo: row.zrodlo ? String(row.zrodlo).trim() : null, ...extra };
    NUTRIENTS.forEach((n) => { p[n.k] = toNum(row[n.k]); });
    return p;
  };

  const approve = async (row: Row) => {
    if (!String(row.nazwa || "").trim()) { toast({ title: "Nazwa nie może być pusta", variant: "destructive" }); return; }
    setBusy(row.id);
    const { error } = await (supabase as any).from("feed_ingredients").update(payload(row, { status: "approved" })).eq("id", row.id);
    setBusy(null);
    if (error) { toast({ title: "Błąd", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Zatwierdzono ✅", description: `${row.nazwa} trafił do kalkulatora.` });
    load();
  };
  const reject = async (id: string) => {
    setBusy(id);
    const { error } = await (supabase as any).from("feed_ingredients").update({ status: "rejected" }).eq("id", id);
    setBusy(null);
    if (error) { toast({ title: "Błąd", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Odrzucono" }); setPending((r) => r.filter((x) => x.id !== id));
  };
  const saveApproved = async (row: Row) => {
    if (!String(row.nazwa || "").trim()) { toast({ title: "Nazwa nie może być pusta", variant: "destructive" }); return; }
    setBusy(row.id);
    const { error } = await (supabase as any).from("feed_ingredients").update(payload(row, {})).eq("id", row.id);
    setBusy(null);
    if (error) { toast({ title: "Błąd", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Zapisano ✅", description: `${row.nazwa} zaktualizowany.` });
  };
  const del = async (id: string, nazwa: string) => {
    if (!window.confirm(`Usunąć „${nazwa}" z bazy? Zniknie z kalkulatora dla wszystkich.`)) return;
    setBusy(id);
    const { error } = await (supabase as any).from("feed_ingredients").delete().eq("id", id);
    setBusy(null);
    if (error) { toast({ title: "Błąd", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Usunięto" }); setApproved((r) => r.filter((x) => x.id !== id));
  };

  const q = search.trim().toLowerCase();
  const approvedMatches = q ? approved.filter((r) => String(r.nazwa || "").toLowerCase().includes(q)) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Składniki paszowe" }]} />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8 space-y-10">
          {/* --- Moderacja zgłoszeń --- */}
          <section>
            <h1 className="text-2xl font-bold text-foreground mb-1">Składniki paszowe</h1>
            <h2 className="text-lg font-semibold text-foreground mt-4 mb-1">Zgłoszenia do moderacji</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Możesz poprawić/uzupełnić dowolne pole przed zatwierdzeniem — zapisane wartości trafiają do kalkulatora.
            </p>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Wczytywanie…</div>
            ) : pending.length === 0 ? (
              <p className="text-muted-foreground">Brak zgłoszeń do moderacji. 🎉</p>
            ) : (
              <div className="space-y-4">
                {pending.map((row) => (
                  <div key={row.id} className="rounded-lg border border-border bg-card p-4">
                    <Fields row={row} onField={(k, v) => editField(setPending)(row.id, k, v)} />
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => approve(row)} disabled={busy === row.id} className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"><Check className="h-4 w-4" /> Zapisz i zatwierdź</button>
                      <button onClick={() => reject(row.id)} disabled={busy === row.id} className="inline-flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"><X className="h-4 w-4" /> Odrzuć</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* --- Edycja bazy --- */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-1">Edycja bazy ({approved.length} składników)</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Popraw błąd lub zaktualizuj wartości (np. po nowych badaniach). <strong>Zmiany działają dla wszystkich.</strong>
              Wpisz nazwę, aby znaleźć składnik.
            </p>
            <div className="relative max-w-md mb-4">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="np. Kukurydza, Dolmix…"
                className="w-full pl-9 pr-3 py-2 border border-input bg-background text-foreground rounded-lg" />
            </div>
            {!q ? (
              <p className="text-sm text-muted-foreground">Wpisz nazwę powyżej, aby edytować składnik z bazy.</p>
            ) : approvedMatches.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak składnika „{search}".</p>
            ) : (
              <div className="space-y-4">
                {approvedMatches.map((row) => (
                  <div key={row.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {row.source === "baza" ? "baza wzorcowa" : "społeczność"}
                      </span>
                    </div>
                    <Fields row={row} onField={(k, v) => editField(setApproved)(row.id, k, v)} />
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => saveApproved(row)} disabled={busy === row.id} className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"><Save className="h-4 w-4" /> Zapisz zmiany</button>
                      <button onClick={() => del(row.id, row.nazwa)} disabled={busy === row.id} className="inline-flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /> Usuń</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
