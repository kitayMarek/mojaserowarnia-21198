/**
 * Dialog „Zaproponuj składnik do bazy" — widoczny dla wszystkich, ale zapis wymaga logowania.
 * Zgłoszenie trafia do feed_ingredients ze statusem 'pending' → moderacja w /admin/skladniki.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { feedCategories } from "@/data/feedIngredients";
import { X } from "lucide-react";

const FIELDS: { k: string; label: string; step: string }[] = [
  { k: "em", label: "Energia EM (MJ/kg)", step: "0.1" },
  { k: "bialko", label: "Białko (%)", step: "0.1" },
  { k: "ca", label: "Wapń Ca (%)", step: "0.01" },
  { k: "p", label: "Fosfor P (%)", step: "0.01" },
  { k: "wlokno", label: "Włókno (%)", step: "0.1" },
  { k: "na", label: "Sód Na (%)", step: "0.01" },
  { k: "k", label: "Potas K (%)", step: "0.01" },
  { k: "mg", label: "Magnez Mg (%)", step: "0.001" },
  { k: "mn", label: "Mangan Mn (mg/kg)", step: "1" },
  { k: "zn", label: "Cynk Zn (mg/kg)", step: "1" },
  { k: "se", label: "Selen Se (mg/kg)", step: "0.01" },
  { k: "fe", label: "Żelazo Fe (mg/kg)", step: "1" },
  { k: "i", label: "Jod I (mg/kg)", step: "0.01" },
];

export default function ZaproponujSkladnikDialog({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [nazwa, setNazwa] = useState("");
  const [kategoria, setKategoria] = useState(feedCategories[0]);
  const [zrodlo, setZrodlo] = useState("");
  const [vals, setVals] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!nazwa.trim()) {
      toast({ title: "Podaj nazwę składnika", variant: "destructive" });
      return;
    }
    setSaving(true);
    const row: Record<string, unknown> = {
      nazwa: nazwa.trim(),
      kategoria,
      zrodlo: zrodlo.trim() || null,
      status: "pending",
      submitted_by: user!.id,
    };
    FIELDS.forEach((f) => {
      const n = parseFloat(vals[f.k]);
      if (!isNaN(n)) row[f.k] = n;
    });
    const { error } = await (supabase as any).from("feed_ingredients").insert(row);
    setSaving(false);
    if (error) {
      toast({ title: "Nie udało się zapisać", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Zgłoszono ✅", description: "Składnik trafił do moderacji — pojawi się po zatwierdzeniu." });
    onClose();
  };

  const inputCls = "mt-1 w-full p-2 border border-input bg-background text-foreground rounded";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-foreground rounded-lg p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-xl font-bold">➕ Zaproponuj składnik do bazy</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Zamknij">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!user ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Dodawanie składników wymaga zalogowania — dzięki temu każde zgłoszenie przechodzi moderację,
              zanim trafi do wspólnej bazy.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/auth" className="flex-1 text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90">
                Zaloguj się / Załóż konto
              </Link>
              <button onClick={onClose} className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80">
                Anuluj
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-2">
              Przepisz skład z opakowania (np. dodatku mineralnego). Po zatwierdzeniu przez moderatora
              składnik będzie dostępny dla wszystkich. Wypełnij tyle pól, ile znasz.
            </p>
            <p className="text-xs text-muted-foreground mb-4 rounded-md bg-muted/50 p-2">
              <strong>Jednostki:</strong> makro (białko, Ca, P, włókno, Na, K, Mg) w <strong>%</strong>;
              mikro (Mn, Zn, Se, Fe, I) w <strong>mg/kg</strong>. Zawartości minerałów z etykiety „Składniki
              analityczne / Dodatki w 1 kg". <strong>Jeśli pierwiastek jest podany z kilku związków (np. cynk
              jako tlenek + chelat + siarczan) — zsumuj jego zawartości.</strong>
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm font-medium">
                Nazwa *
                <input value={nazwa} onChange={(e) => setNazwa(e.target.value)} className={inputCls} placeholder="np. Dolmix Capri" />
              </label>
              <label className="text-sm font-medium">
                Kategoria
                <select value={kategoria} onChange={(e) => setKategoria(e.target.value)} className={inputCls}>
                  {feedCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium sm:col-span-2">
                Źródło składu (opcjonalnie)
                <input value={zrodlo} onChange={(e) => setZrodlo(e.target.value)} className={inputCls} placeholder="np. etykieta opakowania / link do sklepu" />
              </label>
              {FIELDS.map((f) => (
                <label key={f.k} className="text-sm font-medium">
                  {f.label}
                  <input
                    type="number"
                    step={f.step}
                    value={vals[f.k] ?? ""}
                    onChange={(e) => setVals((v) => ({ ...v, [f.k]: e.target.value }))}
                    className={inputCls}
                  />
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={submit} disabled={saving} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50">
                {saving ? "Zapisywanie…" : "Zgłoś do bazy"}
              </button>
              <button onClick={onClose} className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80">
                Anuluj
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
