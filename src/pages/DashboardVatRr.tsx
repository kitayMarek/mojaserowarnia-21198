import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Printer, Info, ArrowLeft } from "lucide-react";
import {
  policz, formatGr, kwotaSlownie, walidujNip,
  OSWIADCZENIE_ROLNIKA, STAWKA_ZRYCZALTOWANA_PROC,
  type PozycjaVatRr,
} from "@/lib/vatRr";

const pustaPozycja = (): PozycjaVatRr => ({
  nazwa: "", jednostka: "kg", ilosc: "", cenaNetto: "", klasa: "",
});

export default function DashboardVatRr() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Rolnik (sprzedawca) — uzupełniany z profilu
  const [rolnikNazwa, setRolnikNazwa] = useState("");
  const [rolnikAdres, setRolnikAdres] = useState("");
  const [rolnikNip, setRolnikNip] = useState("");

  // Nabywca — formalny wystawca dokumentu
  const [nabywcaNazwa, setNabywcaNazwa] = useState("");
  const [nabywcaAdres, setNabywcaAdres] = useState("");
  const [nabywcaNip, setNabywcaNip] = useState("");

  const [numer, setNumer] = useState("");
  const [dataWystawienia, setDataWystawienia] = useState(new Date().toISOString().split("T")[0]);
  const [uwagi, setUwagi] = useState("");
  const [pozycje, setPozycje] = useState<PozycjaVatRr[]>([pustaPozycja()]);
  const [zapiszDoEwidencji, setZapiszDoEwidencji] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("firma_nazwa, adres, nip")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setRolnikNazwa((data as any).firma_nazwa ?? "");
        setRolnikAdres((data as any).adres ?? "");
        setRolnikNip((data as any).nip ?? "");
      }
      setLoading(false);
    })();
  }, [user]);

  const suma = policz(pozycje);

  const zmienPozycje = (i: number, pole: keyof PozycjaVatRr, wartosc: string) => {
    setPozycje((prev) => prev.map((p, idx) => (idx === i ? { ...p, [pole]: wartosc } : p)));
  };

  const zapisz = async (drukuj: boolean) => {
    if (!nabywcaNazwa.trim() || !nabywcaAdres.trim()) {
      toast({ title: "Uzupełnij dane nabywcy", description: "Nazwa i adres są wymagane.", variant: "destructive" });
      return;
    }
    if (nabywcaNip.trim() && !walidujNip(nabywcaNip)) {
      toast({ title: "Nieprawidłowy NIP nabywcy", description: "Sprawdź cyfry — suma kontrolna się nie zgadza.", variant: "destructive" });
      return;
    }
    const wypelnione = pozycje.filter((p) => p.nazwa.trim() && Number(p.ilosc) > 0 && Number(String(p.cenaNetto).replace(",", ".")) > 0);
    if (wypelnione.length === 0) {
      toast({ title: "Brak pozycji", description: "Dodaj co najmniej jedną pozycję z ilością i ceną.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (zapiszDoEwidencji) {
        const s = policz(wypelnione);
        for (let i = 0; i < wypelnione.length; i++) {
          const p = wypelnione[i];
          const { error } = await (supabase as any).from("sales_records").insert([{
            user_id: user!.id,
            data_sprzedazy: dataWystawienia,
            rodzaj_zywnosci: p.nazwa,
            ilosc: Number(String(p.ilosc).replace(",", ".")),
            jednostka: p.jednostka,
            // Do ewidencji trafia kwota faktycznie otrzymana, czyli netto + 7%.
            // Zwrot rozdzielamy proporcjonalnie do wartości pozycji.
            kwota_przychodu: Number(
              ((s.netto[i] + Math.round((s.zwrot * s.netto[i]) / (s.sumaNetto || 1))) / 100).toFixed(2)
            ),
            odbiorca_typ: "zakład detaliczny",
            odbiorca_nazwa: nabywcaNazwa,
            numer_rachunku: numer.trim() || null,
          }]);
          if (error) throw error;
        }
        toast({ title: "Zapisano do ewidencji", description: `Dodano ${wypelnione.length} poz. wraz z 7% zwrotu.` });
      }

      if (drukuj) {
        window.print();
      } else if (zapiszDoEwidencji) {
        navigate("/dashboard/ewidencja");
      }
    } catch (e: any) {
      console.error("Zapis VAT RR nieudany:", e);
      toast({ title: "Nie udało się zapisać", description: e?.message ?? "Spróbuj ponownie.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #vatrr-wydruk, #vatrr-wydruk * { visibility: visible; }
          #vatrr-wydruk { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-3xl font-bold">Faktura VAT RR</h2>
          <p className="text-muted-foreground">Przygotuj gotowy dokument dla nabywcy</p>
        </div>
        <Button variant="ghost" onClick={() => navigate("/dashboard/rachunki")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Wróć
        </Button>
      </div>

      {/* Wyjaśnienie roli — to jest sedno: zdejmujemy barierę sprzedaży */}
      <Card className="border-sky-300 bg-sky-50 dark:bg-sky-950/30 dark:border-sky-800 no-print">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Kto właściwie wystawia fakturę VAT RR?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            Formalnie <strong>nabywca</strong> — czynny podatnik VAT (art. 116 ust. 1 ustawy o VAT).
            To on ma obowiązek wystawić dokument i doliczyć Ci{" "}
            <strong>{STAWKA_ZRYCZALTOWANA_PROC}% zryczałtowanego zwrotu</strong>.
          </p>
          <p>
            W praktyce bywa to <strong>bariera w sprzedaży</strong>: kupujący często o tym obowiązku
            nie wie albo jego program do faktur w ogóle nie ma takiego dokumentu. Wtedy transakcja
            się nie odbywa — albo odbywa się bez należnych Ci 7%.
          </p>
          <p className="font-medium">
            Rozwiązanie: wypełniasz projekt tutaj, drukujesz w dwóch egzemplarzach i wręczasz
            nabywcy. Jemu zostaje tylko <strong>nadać własny numer i podpisać</strong>. Numer
            zostaw pusty, jeśli poda go dopiero na miejscu.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 no-print">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rolnik (Ty)</CardTitle>
            <CardDescription>Uzupełnione z Twojego profilu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Nazwa / imię i nazwisko</Label>
              <Input value={rolnikNazwa} onChange={(e) => setRolnikNazwa(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Adres</Label>
              <Input value={rolnikAdres} onChange={(e) => setRolnikAdres(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>NIP / PESEL</Label>
              <Input value={rolnikNip} onChange={(e) => setRolnikNip(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Nabywca</CardTitle>
            <CardDescription>Sklep, restauracja lub hurtownia — czynny podatnik VAT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Nazwa *</Label>
              <Input value={nabywcaNazwa} onChange={(e) => setNabywcaNazwa(e.target.value)} placeholder="np. Delikatesy Pod Lipą sp. z o.o." />
            </div>
            <div className="space-y-1">
              <Label>Adres *</Label>
              <Input value={nabywcaAdres} onChange={(e) => setNabywcaAdres(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>NIP</Label>
              <Input value={nabywcaNip} onChange={(e) => setNabywcaNip(e.target.value)} placeholder="10 cyfr" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="no-print">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dokument</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Numer faktury</Label>
            <Input value={numer} onChange={(e) => setNumer(e.target.value)} placeholder="zostaw puste — nada nabywca" />
            <p className="text-xs text-muted-foreground">Numerację prowadzi nabywca, bo to jego dokument.</p>
          </div>
          <div className="space-y-1">
            <Label>Data</Label>
            <Input type="date" value={dataWystawienia} onChange={(e) => setDataWystawienia(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="no-print">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Pozycje</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setPozycje([...pozycje, pustaPozycja()])}>
            <Plus className="h-4 w-4 mr-1" /> Dodaj
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {pozycje.map((p, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-12 gap-2 items-end border-b pb-3 last:border-0">
              <div className="col-span-2 md:col-span-4 space-y-1">
                <Label className="text-xs">Nazwa produktu</Label>
                <Input value={p.nazwa} onChange={(e) => zmienPozycje(i, "nazwa", e.target.value)} placeholder="np. Ser Koryciński" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-xs">Klasa / jakość</Label>
                <Input value={p.klasa} onChange={(e) => zmienPozycje(i, "klasa", e.target.value)} placeholder="np. I" />
              </div>
              <div className="md:col-span-1 space-y-1">
                <Label className="text-xs">J.m.</Label>
                <Input value={p.jednostka} onChange={(e) => zmienPozycje(i, "jednostka", e.target.value)} />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-xs">Ilość</Label>
                <Input value={p.ilosc} onChange={(e) => zmienPozycje(i, "ilosc", e.target.value)} inputMode="decimal" placeholder="0" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-xs">Cena netto</Label>
                <Input value={p.cenaNetto} onChange={(e) => zmienPozycje(i, "cenaNetto", e.target.value)} inputMode="decimal" placeholder="0,00" />
              </div>
              <div className="md:col-span-1 flex justify-end">
                {pozycje.length > 1 && (
                  <Button size="icon" variant="ghost" onClick={() => setPozycje(pozycje.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="bg-secondary/50 rounded-lg p-4 space-y-1 text-sm">
            <div className="flex justify-between"><span>Wartość netto</span><span className="tabular-nums font-medium">{formatGr(suma.sumaNetto)} zł</span></div>
            <div className="flex justify-between text-primary"><span>Zryczałtowany zwrot {STAWKA_ZRYCZALTOWANA_PROC}%</span><span className="tabular-nums font-medium">+ {formatGr(suma.zwrot)} zł</span></div>
            <div className="flex justify-between border-t pt-1 mt-1 font-bold"><span>Do zapłaty</span><span className="tabular-nums">{formatGr(suma.ogolem)} zł</span></div>
            <p className="text-xs text-muted-foreground pt-1">Słownie: {kwotaSlownie(suma.ogolem)}</p>
          </div>

          <div className="space-y-1">
            <Label>Uwagi (opcjonalnie)</Label>
            <Textarea value={uwagi} onChange={(e) => setUwagi(e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card className="no-print">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="do-ewidencji"
              checked={zapiszDoEwidencji}
              onCheckedChange={(v) => setZapiszDoEwidencji(v === true)}
            />
            <div className="space-y-1">
              <Label htmlFor="do-ewidencji" className="font-medium cursor-pointer">
                Zapisz tę sprzedaż do ewidencji RHD
              </Label>
              <p className="text-sm text-muted-foreground">
                Do ewidencji trafi kwota faktycznie otrzymana, czyli{" "}
                <strong>netto powiększone o {STAWKA_ZRYCZALTOWANA_PROC}%</strong>, z odbiorcą
                oznaczonym jako „zakład detaliczny". Odznacz, jeśli chcesz tylko wydrukować
                dokument bez zapisu.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => zapisz(true)} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Printer className="h-4 w-4 mr-2" />}
              Drukuj (Oryginał + Kopia)
            </Button>
            <Button variant="outline" onClick={() => zapisz(false)} disabled={saving || !zapiszDoEwidencji}>
              Zapisz do ewidencji bez drukowania
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* WYDRUK — dwa egzemplarze */}
      <div id="vatrr-wydruk" className="hidden print:block text-black text-[11pt]">
        {["Oryginał (dla rolnika)", "Kopia (dla nabywcy)"].map((etykieta, idx) => (
          <div key={etykieta} style={{ pageBreakAfter: idx === 0 ? "always" : "auto", padding: "12mm" }}>
            <div style={{ textAlign: "right", fontSize: "9pt" }}>{etykieta}</div>
            <h1 style={{ fontSize: "16pt", margin: "0 0 2mm" }}>FAKTURA VAT RR</h1>
            <p style={{ margin: "0 0 4mm", fontSize: "9pt" }}>
              Nr: {numer.trim() || "………………………………"} &nbsp;·&nbsp; Data: {dataWystawienia}
            </p>

            <table style={{ width: "100%", marginBottom: "4mm", fontSize: "10pt" }}>
              <tbody>
                <tr>
                  <td style={{ width: "50%", verticalAlign: "top" }}>
                    <strong>Rolnik ryczałtowy (dostawca)</strong><br />
                    {rolnikNazwa}<br />{rolnikAdres}<br />NIP/PESEL: {rolnikNip}
                  </td>
                  <td style={{ width: "50%", verticalAlign: "top" }}>
                    <strong>Nabywca (wystawca faktury)</strong><br />
                    {nabywcaNazwa}<br />{nabywcaAdres}<br />NIP: {nabywcaNip}
                  </td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9.5pt" }}>
              <thead>
                <tr>
                  {["Lp.", "Nazwa produktu", "Klasa", "J.m.", "Ilość", "Cena netto", "Wartość netto"].map((h) => (
                    <th key={h} style={{ border: "1px solid #000", padding: "1.5mm", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pozycje.map((p, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #000", padding: "1.5mm" }}>{i + 1}</td>
                    <td style={{ border: "1px solid #000", padding: "1.5mm" }}>{p.nazwa}</td>
                    <td style={{ border: "1px solid #000", padding: "1.5mm" }}>{p.klasa}</td>
                    <td style={{ border: "1px solid #000", padding: "1.5mm" }}>{p.jednostka}</td>
                    <td style={{ border: "1px solid #000", padding: "1.5mm" }}>{p.ilosc}</td>
                    <td style={{ border: "1px solid #000", padding: "1.5mm" }}>{p.cenaNetto}</td>
                    <td style={{ border: "1px solid #000", padding: "1.5mm", textAlign: "right" }}>{formatGr(suma.netto[i] ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table style={{ width: "60%", marginLeft: "auto", marginTop: "3mm", fontSize: "10pt" }}>
              <tbody>
                <tr><td>Wartość netto</td><td style={{ textAlign: "right" }}>{formatGr(suma.sumaNetto)} zł</td></tr>
                <tr><td>Zryczałtowany zwrot podatku {STAWKA_ZRYCZALTOWANA_PROC}%</td><td style={{ textAlign: "right" }}>{formatGr(suma.zwrot)} zł</td></tr>
                <tr style={{ fontWeight: "bold" }}><td>Należność ogółem</td><td style={{ textAlign: "right" }}>{formatGr(suma.ogolem)} zł</td></tr>
              </tbody>
            </table>
            <p style={{ fontSize: "9.5pt", marginTop: "2mm" }}>Słownie: {kwotaSlownie(suma.ogolem)}</p>

            {uwagi.trim() && <p style={{ fontSize: "9.5pt", marginTop: "3mm" }}><strong>Uwagi:</strong> {uwagi}</p>}

            <p style={{ fontSize: "9pt", marginTop: "5mm", fontStyle: "italic", border: "1px solid #000", padding: "2mm" }}>
              {OSWIADCZENIE_ROLNIKA}
            </p>

            <table style={{ width: "100%", marginTop: "12mm", fontSize: "9pt" }}>
              <tbody>
                <tr>
                  <td style={{ width: "50%", textAlign: "center" }}>
                    ……………………………………<br />podpis rolnika ryczałtowego
                  </td>
                  <td style={{ width: "50%", textAlign: "center" }}>
                    ……………………………………<br />podpis nabywcy
                  </td>
                </tr>
              </tbody>
            </table>

            <p style={{ fontSize: "8pt", marginTop: "6mm", color: "#444" }}>
              Zapłata przelewem na rachunek rolnika; w tytule numer i data faktury (art. 116 ust. 6
              i 7 ustawy o VAT). Dokument przechowywać co najmniej 5 lat.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
