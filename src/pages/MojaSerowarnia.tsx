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
import { Loader2, Store, Send, ExternalLink, ImagePlus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { useUploadZdjecia } from "@/hooks/useUploadZdjecia";
import AktualnosciEdytor from "@/components/serowarnia/AktualnosciEdytor";

interface ZdjecieGalerii { url: string; opis: string }

const WOJEWODZTWA = [
  "dolnośląskie","kujawsko-pomorskie","lubelskie","lubuskie","łódzkie","małopolskie",
  "mazowieckie","opolskie","podkarpackie","podlaskie","pomorskie","śląskie",
  "świętokrzyskie","warmińsko-mazurskie","wielkopolskie","zachodniopomorskie",
];
const MLEKO = ["krowie", "kozie", "owcze", "bawole", "mieszane"];

// Nie każdy, kto robi ser, go sprzedaje — agroturystyka wytwarza dla gości.
const TYPY: { wartosc: string; label: string; opis: string }[] = [
  { wartosc: "serowarnia",   label: "Serowarnia — sprzedaję ser",
    opis: "Produkcja z myślą o sprzedaży, zwykle w ramach RHD lub MOL." },
  { wartosc: "agroturystyka", label: "Agroturystyka — ser dla gości",
    opis: "Ser wytwarzany na potrzeby gospodarstwa i osób odwiedzających, bez sprzedaży." },
  { wartosc: "sezonowa",     label: "Produkcja sezonowa lub okazjonalna",
    opis: "Ser powstaje w sezonie albo nieregularnie, w niewielkich ilościach." },
  { wartosc: "w-organizacji", label: "Serowarnia w organizacji",
    opis: "Dopiero uruchamiasz produkcję — wizytówka pomoże Cię znaleźć od startu." },
];

// Sposoby zetknięcia się z serem — zależne od charakteru działalności
const DOSTEP_SPRZEDAZ = [
  "sprzedaż w gospodarstwie", "targ / bazar", "sklep stacjonarny",
  "wysyłka kurierem", "odbiór osobisty", "do restauracji i sklepów",
];
const DOSTEP_GOSCIE = [
  "degustacja dla gości", "posiłki w ramach pobytu", "warsztaty serowarskie",
  "sprzedaż na miejscu dla gości", "zwiedzanie serowarni",
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
  const [typDzialalnosci, setTypDzialalnosci] = useState("");
  const [nrWeterynaryjny, setNrWeterynaryjny] = useState("");
  const [oswiadczenieProducent, setOswiadczenieProducent] = useState(false);
  const [zgoda, setZgoda] = useState(false);
  const [zdjecieGlowne, setZdjecieGlowne] = useState<string | null>(null);
  const [galeria, setGaleria] = useState<ZdjecieGalerii[]>([]);
  const { wyslij, usun, wysylanie, postep, ostatniWynik } = useUploadZdjecia();

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
        setTypDzialalnosci(data.typ_dzialalnosci ?? "");
        setNrWeterynaryjny(data.nr_weterynaryjny ?? "");
        setOswiadczenieProducent(data.oswiadczenie_producent ?? false);
        setZgoda(data.zgoda_publikacja ?? false);
        setZdjecieGlowne(data.zdjecie_glowne ?? null);
        setGaleria(Array.isArray(data.galeria) ? data.galeria : []);
      } else {
        // podpowiedz nazwę i WNI z profilu
        const { data: p } = await supabase
          .from("profiles").select("firma_nazwa, nr_weterynaryjny").eq("id", user.id).maybeSingle();
        if (p) {
          setNazwa((p as any).firma_nazwa ?? "");
          setNrWeterynaryjny((p as any).nr_weterynaryjny ?? "");
        }
      }
      setLoading(false);
    })();
  }, [user]);

  // Upload nie może gubić wpisanego tekstu — dlatego tylko podmienia URL w stanie,
  // a zapis do bazy dzieje się dopiero przy „Zapisz".
  const wgrajGlowne = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const stary = zdjecieGlowne;
      const url = await wyslij(f, "glowne");
      setZdjecieGlowne(url);
      if (stary) await usun(stary);
      toast({ title: "Zdjęcie główne dodane", description: "Pamiętaj o zapisaniu wizytówki." });
    } catch (err: any) {
      toast({ title: "Nie udało się", description: err.message, variant: "destructive" });
    }
  };

  const wgrajDoGalerii = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (galeria.length >= 6) {
      toast({ title: "Galeria pełna", description: "Maksymalnie 6 zdjęć.", variant: "destructive" });
      return;
    }
    try {
      const url = await wyslij(f, "galeria");
      setGaleria([...galeria, { url, opis: "" }]);
      toast({ title: "Zdjęcie dodane", description: "Pamiętaj o zapisaniu wizytówki." });
    } catch (err: any) {
      toast({ title: "Nie udało się", description: err.message, variant: "destructive" });
    }
  };

  const usunZGalerii = async (i: number) => {
    const z = galeria[i];
    setGaleria(galeria.filter((_, idx) => idx !== i));
    if (z?.url) await usun(z.url);
  };

  const przesun = (i: number, kierunek: -1 | 1) => {
    const j = i + kierunek;
    if (j < 0 || j >= galeria.length) return;
    const kopia = [...galeria];
    [kopia[i], kopia[j]] = [kopia[j], kopia[i]];
    setGaleria(kopia);
  };

  const przelacz = (lista: string[], set: (v: string[]) => void, wartosc: string) =>
    set(lista.includes(wartosc) ? lista.filter((x) => x !== wartosc) : [...lista, wartosc]);

  const zapisz = async (zglosDoSprawdzenia: boolean) => {
    if (!nazwa.trim()) {
      toast({ title: "Podaj nazwę serowarni", variant: "destructive" });
      return;
    }
    if (zglosDoSprawdzenia && !typDzialalnosci) {
      toast({
        title: "Wskaż charakter działalności",
        description: "Bez tego nie wiemy, jak opisać Cię w katalogu.",
        variant: "destructive",
      });
      return;
    }
    if (zglosDoSprawdzenia && !oswiadczenieProducent) {
      toast({
        title: "Katalog jest dla producentów sera",
        description: "Zaznacz oświadczenie, jeśli wytwarzasz ser.",
        variant: "destructive",
      });
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
    if (zglosDoSprawdzenia && opis.trim().length < 120) {
      toast({
        title: "Opis jest za krótki",
        description: `Potrzeba co najmniej 120 znaków (masz ${opis.trim().length}).`,
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
        typ_dzialalnosci: typDzialalnosci || null,
        nr_weterynaryjny: nrWeterynaryjny.trim() || null,
        oswiadczenie_producent: oswiadczenieProducent,
        zgoda_publikacja: zgoda,
        zdjecie_glowne: zdjecieGlowne,
        galeria: galeria,
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
      // Pelna diagnostyka do konsoli — komunikat w tosciku bywa przyciety,
      // a kod bledu Postgresa mowi wiecej niz sam tekst.
      console.error("Zapis wizytówki nieudany:", {
        kod: e?.code, komunikat: e?.message, szczegoly: e?.details, wskazowka: e?.hint, calosc: e,
      });
      toast({
        title: "Nie udało się zapisać",
        description: `${e?.message ?? "Spróbuj ponownie."}${e?.code ? ` (kod ${e.code})` : ""}`,
        variant: "destructive",
      });
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

      {/* Kto jest adresatem — z konta korzystają też osoby od kalkulatora pasz */}
      <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="pt-6 text-sm space-y-2">
          <p className="font-medium">Ten katalog jest wyłącznie dla producentów sera.</p>
          <p className="text-muted-foreground">
            Jeśli korzystasz z konta tylko dla kalkulatora pasz, ewidencji drobiu albo z samej
            wiedzy — ta sekcja nie jest dla Ciebie i możesz ją pominąć. Nic nie tracisz.
          </p>
          <p className="text-muted-foreground">
            <strong>Nie musisz mieć zgłoszonego RHD ani niczego sprzedawać.</strong> Gospodarstwo
            agroturystyczne robiące ser dla swoich gości jest tu równie na miejscu jak serowarnia
            handlowa. Liczy się to, że sam wytwarzasz ser.
          </p>
          <p className="text-muted-foreground">
            Wizytówki przeglądamy przed publikacją — odrzucamy zgłoszenia bez opisu, bez
            lokalizacji lub od osób, które sera nie robią.
          </p>
        </CardContent>
      </Card>

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

      {/* Charakter działalności — nie każdy, kto robi ser, go sprzedaje */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Charakter działalności</CardTitle>
          <CardDescription>
            Nie musisz mieć zgłoszonego RHD, żeby być w katalogu. Ser robiony wyłącznie
            dla gości gospodarstwa też się liczy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {TYPY.map((t) => (
            <label
              key={t.wartosc}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                typDzialalnosci === t.wartosc ? "border-primary bg-primary/5" : "hover:bg-accent"
              }`}
            >
              <input
                type="radio"
                name="typ"
                className="mt-1"
                checked={typDzialalnosci === t.wartosc}
                onChange={() => setTypDzialalnosci(t.wartosc)}
              />
              <span className="text-sm">
                <span className="font-medium block">{t.label}</span>
                <span className="text-muted-foreground">{t.opis}</span>
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

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

      {/* ZDJĘCIA */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Zdjęcia</CardTitle>
          <CardDescription>
            Zdjęcia zmniejszamy przed wysłaniem i <strong>usuwamy z nich dane lokalizacji GPS</strong>,
            które telefon zapisuje w pliku. Twój adres nie trafi do internetu razem ze zdjęciem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Zdjęcie główne</Label>
            <p className="text-xs text-muted-foreground">
              Pokazuje się na liście serowarni i u góry wizytówki. Najlepiej kadr poziomy.
            </p>
            {zdjecieGlowne ? (
              <div className="relative inline-block">
                <img src={zdjecieGlowne} alt={`Zdjęcie główne — ${nazwa || "serowarnia"}`}
                  width={320} height={213} loading="lazy" decoding="async"
                  className="rounded-lg border object-cover" style={{ width: 320, height: 213 }} />
                <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-8 w-8"
                  onClick={async () => { const s = zdjecieGlowne; setZdjecieGlowne(null); if (s) await usun(s); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full max-w-sm h-40 rounded-lg border-2 border-dashed text-muted-foreground text-sm">
                Brak zdjęcia głównego
              </div>
            )}
            <div>
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer text-primary hover:underline">
                <ImagePlus className="h-4 w-4" />
                {zdjecieGlowne ? "Zmień zdjęcie główne" : "Dodaj zdjęcie główne"}
                <input type="file" accept="image/*" className="hidden" onChange={wgrajGlowne} disabled={wysylanie} />
              </label>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label>Galeria (do 6 zdjęć)</Label>
            {galeria.length === 0 && (
              <p className="text-sm text-muted-foreground">Brak zdjęć w galerii.</p>
            )}
            <div className="space-y-3">
              {galeria.map((z, i) => (
                <div key={z.url} className="flex gap-3 items-start border rounded-lg p-2">
                  <img src={z.url} alt={z.opis || `Zdjęcie ${i + 1}`} width={112} height={84}
                    loading="lazy" decoding="async"
                    className="rounded object-cover shrink-0" style={{ width: 112, height: 84 }} />
                  <div className="flex-1 space-y-2">
                    <Input value={z.opis} placeholder="Opis zdjęcia — co widać?"
                      onChange={(e) => setGaleria(galeria.map((g, idx) => idx === i ? { ...g, opis: e.target.value } : g))} />
                    <p className="text-xs text-muted-foreground">
                      Opis czytają wyszukiwarki i osoby korzystające z czytników ekranu.
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => przesun(i, -1)} disabled={i === 0}>
                      <ArrowLeft className="h-3.5 w-3.5 rotate-90" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => przesun(i, 1)} disabled={i === galeria.length - 1}>
                      <ArrowRight className="h-3.5 w-3.5 rotate-90" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => usunZGalerii(i)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {galeria.length < 6 && (
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer text-primary hover:underline">
                <ImagePlus className="h-4 w-4" /> Dodaj zdjęcie ({galeria.length}/6)
                <input type="file" accept="image/*" className="hidden" onChange={wgrajDoGalerii} disabled={wysylanie} />
              </label>
            )}
          </div>

          {postep && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> {postep}
            </p>
          )}
          {!postep && ostatniWynik && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400 border-t pt-3">
              ✓ {ostatniWynik}
            </p>
          )}
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
            <Label>
              {typDzialalnosci === "agroturystyka"
                ? "Jak goście mogą spróbować Twojego sera"
                : "Jak można spróbować lub kupić"}
            </Label>
            <div className="flex flex-wrap gap-3">
              {(typDzialalnosci === "agroturystyka"
                ? DOSTEP_GOSCIE
                : [...DOSTEP_SPRZEDAZ, ...DOSTEP_GOSCIE]
              ).map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={formaSprzedazy.includes(s)} onCheckedChange={() => przelacz(formaSprzedazy, setFormaSprzedazy, s)} />
                  {s}
                </label>
              ))}
            </div>
            {typDzialalnosci === "agroturystyka" && (
              <p className="text-xs text-muted-foreground">
                Nie musisz nic sprzedawać — degustacja albo posiłek w ramach pobytu w zupełności
                wystarczy.
              </p>
            )}
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

      {/* OŚWIADCZENIE PRODUCENTA — sito na wejściu do katalogu */}
      <Card className="border-primary/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Potwierdzenie, że produkujesz ser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox id="osw-prod" checked={oswiadczenieProducent}
              onCheckedChange={(v) => setOswiadczenieProducent(v === true)} />
            <Label htmlFor="osw-prod" className="text-sm font-normal cursor-pointer leading-relaxed">
              Oświadczam, że <strong>sam wytwarzam ser</strong> i wizytówka dotyczy mojej realnej
              działalności — niezależnie od tego, czy ten ser sprzedaję.
            </Label>
          </div>
          <div className="space-y-1">
            <Label>Weterynaryjny numer identyfikacyjny (WNI) — jeśli masz</Label>
            <Input value={nrWeterynaryjny} onChange={(e) => setNrWeterynaryjny(e.target.value)}
              placeholder="np. 28123456789" />
            <p className="text-xs text-muted-foreground">
              <strong>Całkowicie opcjonalny — jego brak nie jest przeszkodą.</strong> Mają go
              osoby, które zgłosiły sprzedaż w RHD lub MOL; przy produkcji wyłącznie na potrzeby
              gospodarstwa nie jest wymagany. Jeśli go podasz, przyspieszy weryfikację.
              Nie publikujemy go w katalogu.
            </p>
          </div>
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
        <Button onClick={() => zapisz(true)} disabled={saving || !zgoda || !oswiadczenieProducent}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          {status === "opublikowany" ? "Zapisz i zgłoś zmiany" : "Zgłoś do publikacji"}
        </Button>
        <Button variant="outline" onClick={() => zapisz(false)} disabled={saving}>
          Zapisz szkic
        </Button>
      </div>

      {/* Aktualności — dopiero gdy wizytówka istnieje, bo wpis musi mieć do czego się przypiąć */}
      {id ? (
        <AktualnosciEdytor serowarniaId={id} />
      ) : (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Aktualności</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Zapisz najpierw wizytówkę — wtedy będziesz mógł dodawać krótkie wpisy o tym,
            co u Ciebie słychać: nowa partia sera, obecność na targu, wolne terminy.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
