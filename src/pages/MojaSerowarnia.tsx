/**
 * MojaSerowarnia — wizytówka producenta w katalogu (/dashboard/moja-serowarnia)
 *
 * ⚠️ RODO: publikacja to przetwarzanie danych osobowych. Zgoda jest ODRĘBNA
 * od marketingowej, odznaczalna, z datą i odwracalna — jej wycofanie
 * natychmiast zdejmuje wizytówkę (pilnuje tego trigger w bazie).
 * ⚠️ Moderacja: użytkownik może zgłosić wpis, publikuje admin.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Store, Send, ExternalLink } from "lucide-react";

const WOJEWODZTWA = [
  "dolnośląskie","kujawsko-pomorskie","lubelskie","lubuskie","łódzkie","małopolskie",
  "mazowieckie","opolskie","podkarpackie","podlaskie","pomorskie","śląskie",
  "świętokrzyskie","warmińsko-mazurskie","wielkopolskie","zachodniopomorskie",
];
const MLEKO = ["krowie", "kozie", "owcze", "bawole", "mieszane"];
const SPRZEDAZ = [
  "sprzedaż w gospodarstwie", "targ / bazar", "sklep stacjonarny",
  "wysyłka kurierem", "odbiór osobisty", "do restauracji i sklepów",
];

const STATUSY: Record<string, { label: string; opis: string; wariant: any }> = {
  szkic:        { label: "Szkic",        opis: "Widoczny tylko dla Ciebie. Zgłoś do sprawdzenia, gdy będzie gotowy.", wariant: "secondary" },
  oczekuje:     { label: "Czeka na sprawdzenie", opis: "Wpis trafił do moderacji. Damy znać po weryfikacji.", wariant: "default" },
  opublikowany: { label: "Opublikowany", opis: "Wizytówka jest widoczna publicznie w katalogu.", wariant: "default" },
  odrzucony:    { label: "Odrzucony",    opis: "Popraw wpis według uwag i zgłoś ponownie.", wariant: "destructive" },
};

export default function MojaSerowarnia() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [id, setId] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("szkic");
  const [powodOdrzucenia, setPowodOdrzucenia] = useState<string | null>(null);

  const [nazwa, setNazwa] = useState("");
  const [opis, setOpis] = useState("");
  const [wojewodztwo, setWojewodztwo] = useState("");
  const [miejscowosc, setMiejscowosc] = useState("");
  const [telefon, setTelefon] = useState("");
  const [emailKontakt, setEmailKontakt] = useState("");
  const [www, setWww] = useState("");
  const [facebook, setFacebook] = useState("");
  const [produkty, setProdukty] = useState("");
  const [rodzajMleka, setRodzajMleka] = useState<string[]>([]);
  const [formaSprzedazy, setFormaSprzedazy] = useState<string[]>([]);
  const [zgoda, setZgoda] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("serowarnie").select("*").eq("user_id", user.id).maybeSingle();

      if (data) {
        setId(data.id); setSlug(data.slug); setStatus(data.status);
        setPowodOdrzucenia(data.powod_odrzucenia);
        setNazwa(data.nazwa ?? ""); setOpis(data.opis ?? "");
        setWojewodztwo(data.wojewodztwo ?? ""); setMiejscowosc(data.miejscowosc ?? "");
        setTelefon(data.telefon ?? ""); setEmailKontakt(data.email_kontakt ?? "");
        setWww(data.www ?? ""); setFacebook(data.facebook ?? "");
        setProdukty((data.produkty ?? []).join(", "));
        setRodzajMleka(data.rodzaj_mleka ?? []);
        setFormaSprzedazy(data.forma_sprzedazy ?? []);
        setZgoda(data.zgoda_publikacja ?? false);
      } else {
        // podpowiedz nazwę z profilu
        const { data: p } = await supabase
          .from("profiles").select("firma_nazwa").eq("id", user.id).maybeSingle();
        if (p) setNazwa((p as any).firma_nazwa ?? "");
      }
      setLoading(false);
    })();
  }, [user]);

  const przelacz = (lista: string[], set: (v: string[]) => void, wartosc: string) =>
    set(lista.includes(wartosc) ? lista.filter((x) => x !== wartosc) : [...lista, wartosc]);

  const zapisz = async (zglosDoSprawdzenia: boolean) => {
    if (!nazwa.trim()) {
      toast({ title: "Podaj nazwę serowarni", variant: "destructive" });
      return;
    }
    if (zglosDoSprawdzenia && !zgoda) {
      toast({
        title: "Potrzebna zgoda na publikację",
        description: "Bez niej nie możemy pokazać wizytówki w katalogu.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const nowyStatus = zglosDoSprawdzenia ? "oczekuje" : (status === "opublikowany" ? "opublikowany" : "szkic");

      const dane: any = {
        user_id: user!.id,
        nazwa: nazwa.trim(),
        opis: opis.trim() || null,
        wojewodztwo: wojewodztwo || null,
        miejscowosc: miejscowosc.trim() || null,
        telefon: telefon.trim() || null,
        email_kontakt: emailKontakt.trim() || null,
        www: www.trim() || null,
        facebook: facebook.trim() || null,
        produkty: produkty.split(",").map((s) => s.trim()).filter(Boolean),
        rodzaj_mleka: rodzajMleka,
        forma_sprzedazy: formaSprzedazy,
        zgoda_publikacja: zgoda,
        status: nowyStatus,
      };

      if (id) {
        const { error } = await (supabase as any).from("serowarnie").update(dane).eq("id", id);
        if (error) throw error;
      } else {
        const { data: nowySlug, error: eSlug } = await (supabase as any)
          .rpc("serowarnie_slug", { nazwa_in: nazwa.trim() });
        if (eSlug) throw eSlug;

        const { data, error } = await (supabase as any)
          .from("serowarnie").insert({ ...dane, slug: nowySlug }).select().single();
        if (error) throw error;
        setId(data.id); setSlug(data.slug);
      }

      setStatus(nowyStatus);
      toast({
        title: zglosDoSprawdzenia ? "Zgłoszono do sprawdzenia" : "Zapisano",
        description: zglosDoSprawdzenia
          ? "Damy znać, gdy wizytówka zostanie zatwierdzona."
          : "Zmiany zapisane. Wizytówka nie jest jeszcze zgłoszona.",
      });
    } catch (e: any) {
      console.error("Zapis wizytówki nieudany:", e);
      toast({ title: "Nie udało się zapisać", description: e?.message ?? "Spróbuj ponownie.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const st = STATUSY[status] ?? STATUSY.szkic;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Store className="h-7 w-7" /> Moja serowarnia
        </h2>
        <p className="text-muted-foreground">
          Darmowa wizytówka w katalogu producentów — żeby klienci mogli Cię znaleźć
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-wrap items-center gap-3">
          <Badge variant={st.wariant}>{st.label}</Badge>
          <span className="text-sm text-muted-foreground">{st.opis}</span>
          {status === "opublikowany" && slug && (
            <a href={`/serowarnie/${slug}`} target="_blank" rel="noopener noreferrer"
               className="text-sm text-primary hover:underline inline-flex items-center gap-1 ml-auto">
              Zobacz wizytówkę <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </CardContent>
      </Card>

      {status === "odrzucony" && powodOdrzucenia && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2"><CardTitle className="text-base text-destructive">Uwagi moderatora</CardTitle></CardHeader>
          <CardContent className="text-sm">{powodOdrzucenia}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Podstawowe informacje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Nazwa serowarni *</Label>
            <Input value={nazwa} onChange={(e) => setNazwa(e.target.value)} placeholder="np. Śródborska Manufaktura Serów" />
          </div>
          <div className="space-y-1">
            <Label>O nas</Label>
            <Textarea value={opis} onChange={(e) => setOpis(e.target.value)} rows={5}
              placeholder="Czym się zajmujecie, od kiedy, co Was wyróżnia, jakie mleko, jaka tradycja…" />
            <p className="text-xs text-muted-foreground">
              To najważniejsze pole — im konkretniej, tym większa szansa, że klient trafi tu z wyszukiwarki.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Województwo</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                value={wojewodztwo} onChange={(e) => setWojewodztwo(e.target.value)}>
                <option value="">— wybierz —</option>
                {WOJEWODZTWA.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Miejscowość</Label>
              <Input value={miejscowosc} onChange={(e) => setMiejscowosc(e.target.value)} />
              <p className="text-xs text-muted-foreground">Bez dokładnego adresu — sama miejscowość wystarczy.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Oferta</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Jakie sery robicie</Label>
            <Input value={produkty} onChange={(e) => setProdukty(e.target.value)}
              placeholder="ser koryciński, bundz, twaróg, ser wędzony" />
            <p className="text-xs text-muted-foreground">Oddziel przecinkami.</p>
          </div>
          <div className="space-y-2">
            <Label>Rodzaj mleka</Label>
            <div className="flex flex-wrap gap-3">
              {MLEKO.map((m) => (
                <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={rodzajMleka.includes(m)} onCheckedChange={() => przelacz(rodzajMleka, setRodzajMleka, m)} />
                  {m}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Jak można kupić</Label>
            <div className="flex flex-wrap gap-3">
              {SPRZEDAZ.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={formaSprzedazy.includes(s)} onCheckedChange={() => przelacz(formaSprzedazy, setFormaSprzedazy, s)} />
                  {s}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kontakt</CardTitle>
          <CardDescription>Podaj tylko to, co chcesz upublicznić. Każde pole jest opcjonalne.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Telefon</Label><Input value={telefon} onChange={(e) => setTelefon(e.target.value)} /></div>
          <div className="space-y-1"><Label>E-mail</Label><Input value={emailKontakt} onChange={(e) => setEmailKontakt(e.target.value)} placeholder="inny niż do logowania, jeśli chcesz" /></div>
          <div className="space-y-1"><Label>Strona WWW</Label><Input value={www} onChange={(e) => setWww(e.target.value)} placeholder="https://…" /></div>
          <div className="space-y-1"><Label>Facebook</Label><Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/…" /></div>
        </CardContent>
      </Card>

      {/* ZGODA — odrębna od marketingowej, odwracalna */}
      <Card className="border-primary/40">
        <CardHeader className="pb-3"><CardTitle className="text-base">Zgoda na publikację</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox id="zgoda-pub" checked={zgoda} onCheckedChange={(v) => setZgoda(v === true)} />
            <Label htmlFor="zgoda-pub" className="text-sm font-normal cursor-pointer leading-relaxed">
              Zgadzam się na <strong>publiczne udostępnienie</strong> powyższych danych w katalogu
              serowarni na mojaserowarnia.pl. Wiem, że będą widoczne dla wszystkich odwiedzających
              i mogą trafić do wyników wyszukiwarek.
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            To zgoda <strong>odrębna</strong> od zgody marketingowej. Możesz ją wycofać w każdej
            chwili — odznaczenie tego pola i zapis <strong>natychmiast zdejmuje wizytówkę</strong> z
            katalogu. Publikacja następuje dopiero po sprawdzeniu wpisu przez moderatora.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => zapisz(true)} disabled={saving || !zgoda}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          {status === "opublikowany" ? "Zapisz i zgłoś zmiany" : "Zgłoś do publikacji"}
        </Button>
        <Button variant="outline" onClick={() => zapisz(false)} disabled={saving}>
          Zapisz szkic
        </Button>
      </div>
    </div>
  );
}
