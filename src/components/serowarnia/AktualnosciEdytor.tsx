/**
 * AktualnosciEdytor — dodawanie i usuwanie wpisów wizytówki.
 *
 * Świadomie minimalne: wpis = tekst + jedno zdjęcie + data.
 * Bez tytułu, kategorii i tagów — im mniej pól, tym większa szansa, że
 * producent faktycznie coś napisze w środę wieczorem.
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUploadZdjecia } from "@/hooks/useUploadZdjecia";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, ImagePlus, Trash2, Send } from "lucide-react";

const PODPOWIEDZI = [
  "Nowa partia sera — co powstało i kiedy będzie gotowe?",
  "Będziesz na targu? Napisz gdzie i kiedy.",
  "Wolne terminy na pobyt w gospodarstwie?",
];

const MAX = 600;

interface Wpis {
  id: string;
  tresc: string;
  zdjecie_url: string | null;
  utworzono: string;
  wygasa: string | null;
}

export default function AktualnosciEdytor({ serowarniaId }: { serowarniaId: string }) {
  const { user } = useAuth();
  const { wyslij, usun, wysylanie, postep } = useUploadZdjecia();

  const [wpisy, setWpisy] = useState<Wpis[]>([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [tresc, setTresc] = useState("");
  const [zdjecie, setZdjecie] = useState<string | null>(null);
  const [wygasa, setWygasa] = useState("");
  const [zapis, setZapis] = useState(false);
  const [podpowiedz] = useState(() => PODPOWIEDZI[Math.floor(Math.random() * PODPOWIEDZI.length)]);

  const pobierz = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("serowarnia_wpisy")
      .select("id, tresc, zdjecie_url, utworzono, wygasa")
      .eq("serowarnia_id", serowarniaId)
      .order("utworzono", { ascending: false });
    setWpisy(data ?? []);
    setLadowanie(false);
  }, [serowarniaId]);

  useEffect(() => { pobierz(); }, [pobierz]);

  const wgrajZdjecie = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const stare = zdjecie;
      const url = await wyslij(f, "wpis");
      setZdjecie(url);
      if (stare) await usun(stare);
    } catch (err: any) {
      // Tekst wpisu zostaje nietknięty — nieudany upload nie może go skasować
      toast({ title: "Nie udało się dodać zdjęcia", description: err.message, variant: "destructive" });
    }
  };

  const opublikuj = async () => {
    if (!tresc.trim()) {
      toast({ title: "Napisz coś", description: "Wpis nie może być pusty.", variant: "destructive" });
      return;
    }
    setZapis(true);
    try {
      const { error } = await (supabase as any).from("serowarnia_wpisy").insert({
        serowarnia_id: serowarniaId,
        user_id: user!.id,
        tresc: tresc.trim(),
        zdjecie_url: zdjecie,
        wygasa: wygasa || null,
      });
      if (error) throw error;

      setTresc(""); setZdjecie(null); setWygasa("");
      await pobierz();
      toast({ title: "Opublikowano", description: "Wpis jest widoczny na Twojej wizytówce." });
    } catch (e: any) {
      toast({ title: "Nie udało się opublikować", description: e?.message, variant: "destructive" });
    } finally {
      setZapis(false);
    }
  };

  const usunWpis = async (w: Wpis) => {
    const { error } = await (supabase as any).from("serowarnia_wpisy").delete().eq("id", w.id);
    if (error) {
      toast({ title: "Nie udało się usunąć", description: error.message, variant: "destructive" });
      return;
    }
    // Plik ze Storage kasujemy osobno — kaskada w bazie go nie obejmuje
    if (w.zdjecie_url) await usun(w.zdjecie_url);
    await pobierz();
    toast({ title: "Wpis usunięty" });
  };

  const dataPl = (iso: string) =>
    new Date(iso).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Aktualności</CardTitle>
        <CardDescription>
          Krótkie wpisy o tym, co u Ciebie teraz — nowa partia sera, obecność na targu,
          wolne terminy. Pokazują się na wizytówce od najnowszych.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Textarea
            rows={3}
            value={tresc}
            maxLength={MAX}
            placeholder={podpowiedz}
            onChange={(e) => setTresc(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-xs ${tresc.length > MAX - 60 ? "text-destructive" : "text-muted-foreground"}`}>
              {tresc.length}/{MAX}
            </span>
            <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer text-primary hover:underline">
              <ImagePlus className="h-4 w-4" /> {zdjecie ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
              <input type="file" accept="image/*" className="hidden" onChange={wgrajZdjecie} disabled={wysylanie} />
            </label>
            <div className="flex items-center gap-2 ml-auto">
              <Label htmlFor="wygasa" className="text-xs text-muted-foreground whitespace-nowrap">
                Aktualne do (opcjonalnie)
              </Label>
              <Input id="wygasa" type="date" value={wygasa} onChange={(e) => setWygasa(e.target.value)}
                className="h-8 w-auto text-sm" />
            </div>
          </div>

          {zdjecie && (
            <div className="relative inline-block">
              <img src={zdjecie} alt="Podgląd zdjęcia do wpisu" width={200} height={150}
                loading="lazy" decoding="async"
                className="rounded border object-cover" style={{ width: 200, height: 150 }} />
              <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-7 w-7"
                onClick={async () => { const s = zdjecie; setZdjecie(null); if (s) await usun(s); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {postep && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> {postep}
            </p>
          )}

          <Button onClick={opublikuj} disabled={zapis || wysylanie || !tresc.trim()}>
            {zapis ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Opublikuj wpis
          </Button>
        </div>

        {ladowanie ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : wpisy.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium">Twoje wpisy ({wpisy.length})</p>
            {wpisy.map((w) => (
              <div key={w.id} className="flex gap-3 items-start border rounded-lg p-3">
                {w.zdjecie_url && (
                  <img src={w.zdjecie_url} alt={w.tresc.slice(0, 100)} width={80} height={60}
                    loading="lazy" decoding="async"
                    className="rounded object-cover shrink-0" style={{ width: 80, height: 60 }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm whitespace-pre-line">{w.tresc}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dataPl(w.utworzono)}
                    {w.wygasa && ` · aktualne do ${dataPl(w.wygasa)}`}
                  </p>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => usunWpis(w)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
