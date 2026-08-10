/**
 * AdminSerowarnie — moderacja katalogu (/admin/serowarnie)
 *
 * Dane z RPC serowarnie_do_moderacji() (SECURITY DEFINER + kontrola roli).
 * Pokazuje sygnały wiarygodności, bo z konta korzystają też osoby używające
 * wyłącznie kalkulatora pasz — katalog ma być tylko dla producentów sera.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Check, X, ExternalLink, ShieldCheck, ClipboardList } from "lucide-react";

interface Wpis {
  id: string; slug: string; nazwa: string; opis: string | null;
  wojewodztwo: string | null; miejscowosc: string | null;
  produkty: string[]; rodzaj_mleka: string[]; forma_sprzedazy: string[];
  telefon: string | null; email_kontakt: string | null;
  www: string | null; facebook: string | null;
  nr_weterynaryjny: string | null; status: string;
  email_konta: string | null; ma_ewidencje: boolean;
  zarejestrowany: string | null; zgloszony: string | null;
}

export default function AdminSerowarnie() {
  const [powod, setPowod] = useState<Record<string, string>>({});
  const [pracuje, setPracuje] = useState<string | null>(null);

  const { data: wpisy, isLoading, refetch } = useQuery({
    queryKey: ["adminSerowarnie"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("serowarnie_do_moderacji");
      if (error) throw error;
      return data as Wpis[];
    },
  });

  const zmienStatus = async (w: Wpis, nowy: "opublikowany" | "odrzucony") => {
    if (nowy === "odrzucony" && !(powod[w.id] ?? "").trim()) {
      toast({ title: "Podaj powód odrzucenia", description: "Producent zobaczy go w swoim panelu.", variant: "destructive" });
      return;
    }
    setPracuje(w.id);
    try {
      const { error } = await (supabase as any)
        .from("serowarnie")
        .update({
          status: nowy,
          powod_odrzucenia: nowy === "odrzucony" ? powod[w.id].trim() : null,
        })
        .eq("id", w.id);
      if (error) throw error;

      toast({ title: nowy === "opublikowany" ? "Opublikowano" : "Odrzucono", description: w.nazwa });
      await refetch();
    } catch (e: any) {
      toast({ title: "Nie udało się", description: e?.message, variant: "destructive" });
    } finally {
      setPracuje(null);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const oczekujace = (wpisy ?? []).filter((w) => w.status === "oczekuje");
  const reszta = (wpisy ?? []).filter((w) => w.status !== "oczekuje");

  const karta = (w: Wpis) => {
    const dlugoscOpisu = (w.opis ?? "").trim().length;
    return (
      <Card key={w.id} className={w.status === "oczekuje" ? "border-primary/50" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-lg">{w.nazwa}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {[w.miejscowosc, w.wojewodztwo].filter(Boolean).join(", ") || "— brak lokalizacji —"}
              </p>
            </div>
            <Badge variant={w.status === "opublikowany" ? "default" : w.status === "odrzucony" ? "destructive" : "secondary"}>
              {w.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          {/* Sygnały wiarygodności — czy to na pewno producent sera */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={w.nr_weterynaryjny ? "default" : "outline"} className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              {w.nr_weterynaryjny ? `WNI: ${w.nr_weterynaryjny}` : "brak WNI"}
            </Badge>
            <Badge variant={w.ma_ewidencje ? "default" : "outline"} className="gap-1">
              <ClipboardList className="h-3 w-3" />
              {w.ma_ewidencje ? "prowadzi ewidencję RHD" : "brak wpisów w ewidencji"}
            </Badge>
            <Badge variant={dlugoscOpisu >= 250 ? "default" : "outline"}>
              opis: {dlugoscOpisu} zn.
            </Badge>
            {w.email_konta && <Badge variant="outline">{w.email_konta}</Badge>}
          </div>

          {w.opis && <p className="whitespace-pre-line bg-secondary/40 p-3 rounded">{w.opis}</p>}

          <div className="grid sm:grid-cols-2 gap-3 text-muted-foreground">
            <div>
              <strong className="text-foreground">Sery:</strong> {w.produkty.join(", ") || "—"}<br />
              <strong className="text-foreground">Mleko:</strong> {w.rodzaj_mleka.join(", ") || "—"}<br />
              <strong className="text-foreground">Sprzedaż:</strong> {w.forma_sprzedazy.join(", ") || "—"}
            </div>
            <div>
              {w.telefon && <>tel. {w.telefon}<br /></>}
              {w.email_kontakt && <>{w.email_kontakt}<br /></>}
              {w.www && <>{w.www}<br /></>}
              {w.facebook && <>{w.facebook}</>}
            </div>
          </div>

          {w.status === "opublikowany" && (
            <a href={`/serowarnie/${w.slug}`} target="_blank" rel="noopener noreferrer"
               className="text-primary hover:underline inline-flex items-center gap-1">
              Zobacz wizytówkę <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <div className="border-t pt-3 space-y-2">
            <Textarea
              rows={2}
              placeholder="Powód odrzucenia — producent zobaczy go w swoim panelu (wymagany przy odrzuceniu)"
              value={powod[w.id] ?? ""}
              onChange={(e) => setPowod({ ...powod, [w.id]: e.target.value })}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => zmienStatus(w, "opublikowany")} disabled={pracuje === w.id}>
                {pracuje === w.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                Opublikuj
              </Button>
              <Button size="sm" variant="destructive" onClick={() => zmienStatus(w, "odrzucony")} disabled={pracuje === w.id}>
                <X className="h-4 w-4 mr-1" /> Odrzuć
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Moderacja katalogu serowarni</h1>
        <p className="text-muted-foreground">
          Katalog jest wyłącznie dla producentów sera — z konta korzystają też osoby używające
          samego kalkulatora pasz.
        </p>
      </div>

      <Card className="bg-secondary/30">
        <CardContent className="pt-6 text-sm space-y-1">
          <p className="font-medium">Na co patrzeć przy weryfikacji:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
            <li><strong>WNI</strong> — najmocniejszy sygnał; ma go każdy, kto zarejestrował sprzedaż sera</li>
            <li><strong>Ewidencja RHD</strong> — jeśli prowadzi ją u nas, prawie na pewno jest producentem</li>
            <li><strong>Opis</strong> — konkretny i o serze, nie ogólnik o gospodarstwie</li>
            <li><strong>Sery</strong> — realne nazwy, nie „różne produkty"</li>
          </ul>
        </CardContent>
      </Card>

      {oczekujace.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Czekają na decyzję ({oczekujace.length})</h2>
          {oczekujace.map(karta)}
        </div>
      )}

      {oczekujace.length === 0 && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">
          Brak zgłoszeń oczekujących na decyzję.
        </CardContent></Card>
      )}

      {reszta.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pozostałe ({reszta.length})</h2>
          {reszta.map(karta)}
        </div>
      )}
    </div>
  );
}
