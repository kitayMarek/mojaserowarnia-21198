import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, AlertTriangle, Info } from "lucide-react";
import ReactionButton from "@/components/ReactionButton";

const KalkulatorBeaugel = () => {
  useEffect(() => {
    document.title = "Kalkulator dawki podpuszczki Beaugel | Narzędzia";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Przelicznik dawki dla Beaugel 5, Beaugel 50 i Beaugel 500 na podstawie mocy 1:3000, 1:1000 i 1:10000. Kalkulator IMCU dla wszystkich podpuszczek.");
    }
  }, []);

  // Beaugel calculator states
  const [milkLitersBeaugel, setMilkLitersBeaugel] = useState(50);
  const [variant, setVariant] = useState("3000");
  const [dilution, setDilution] = useState("1");
  const [dosePure, setDosePure] = useState(0);
  const [doseDiluted, setDoseDiluted] = useState(0);
  const [doseDrops, setDoseDrops] = useState("");

  // IMCU calculator states
  const [imcu, setImcu] = useState(280);
  const [milkLitersIMCU, setMilkLitersIMCU] = useState(10);
  const [cheeseType, setCheeseType] = useState("none");
  const [rennetResult, setRennetResult] = useState("3.57 ml");

  const fmt = (n: number) => Math.round(n * 100) / 100;

  const calculateBeaugel = () => {
    const L = Math.max(0, milkLitersBeaugel);
    const ratio = parseFloat(variant); // X in 1:X
    const dilutionFactor = parseFloat(dilution);

    // Pure rennet dose: 1/X liter per 1L milk → (1000/X) ml per 1L milk
    const mlPerL = 1000 / ratio;
    const pure = L * mlPerL;

    // After dilution: volume of solution = pure * dilution
    const diluted = pure * dilutionFactor;

    // Kitchen units approximation
    const drops = diluted * 20; // 20 drops ≈ 1 ml
    const tsp = diluted / 5; // 1 tsp = 5 ml

    setDosePure(pure);
    setDoseDiluted(diluted);
    setDoseDrops(`${Math.round(drops)} kropli ≈ ${fmt(tsp)} łyżeczki`);
  };

  const calculateIMCU = () => {
    if (!imcu || !milkLitersIMCU) {
      setRennetResult("Uzupełnij wszystkie dane.");
      return;
    }
    const M = Math.max(0, milkLitersIMCU);
    const S = Math.max(1, imcu);
    let base = M / (S * 0.01);
    
    // Optional correction based on cheese type
    if (cheeseType !== "none") {
      const mult = parseFloat(cheeseType);
      if (!isNaN(mult)) {
        const factor = 1 - Math.min(0.2, (mult - 2) / 20);
        base = base * factor;
      }
    }
    
    setRennetResult(`${Math.round(base * 100) / 100} ml`);
  };

  useEffect(() => {
    calculateBeaugel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milkLitersBeaugel, variant, dilution]);

  useEffect(() => {
    calculateIMCU();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imcu, milkLitersIMCU, cheeseType]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-6 shadow-warm">
                <Calculator className="h-10 w-10 text-white" />
              </div>
              <div className="mb-4">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                  Kalkulator dawki podpuszczki
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Precyzyjne obliczenia dla podpuszczek Beaugel oraz uniwersalny kalkulator IMCU
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-start">
            <ReactionButton contentType="tool" contentId="kalkulator-beaugel" variant="default" />
          </div>
        </div>

        {/* Beaugel Calculator */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-8">
              
              <Card className="border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Kalkulator Beaugel (Coquard)</CardTitle>
                  <CardDescription>
                    Przelicza dawkę dla wariantów: Beaugel 5, Beaugel 50, Beaugel 500, na podstawie deklarowanej „mocy" (stosunku) i minimalnej zawartości chymozyny.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/30">
                    <Info className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-sm">
                      <strong>Zweryfikowane dane producenta:</strong> Beaugel 5 → 1:3000, chymozyna ≥ 180 mg/L; Beaugel 50 → 1:1000, chymozyna ≥ 50 mg/L, ~14 IMCU; Beaugel 500 → 1:10000, chymozyna ≥ 520 mg/L.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="milk-beaugel">Ilość mleka (L)</Label>
                      <Input
                        id="milk-beaugel"
                        type="number"
                        min="1"
                        step="0.1"
                        value={milkLitersBeaugel}
                        onChange={(e) => setMilkLitersBeaugel(parseFloat(e.target.value) || 0)}
                        className="border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="variant">Wariant</Label>
                      <Select value={variant} onValueChange={setVariant}>
                        <SelectTrigger id="variant" className="border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3000">Beaugel 5 — 1:3000 (≥180 mg/L chymozyny)</SelectItem>
                          <SelectItem value="1000">Beaugel 50 — 1:1000 (≥50 mg/L; ok. 14 IMCU)</SelectItem>
                          <SelectItem value="10000">Beaugel 500 — 1:10000 (≥520 mg/L; IMCU ≥ 140)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dilution">Rozcieńczenie robocze</Label>
                      <Select value={dilution} onValueChange={setDilution}>
                        <SelectTrigger id="dilution" className="border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Brak (stosuj czysty roztwór)</SelectItem>
                          <SelectItem value="10">1:10 (1 część + 9 części wody)</SelectItem>
                          <SelectItem value="20">1:20</SelectItem>
                          <SelectItem value="40">1:40</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Dawka (ml czystej podpuszczki)</Label>
                      <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-muted/30">
                        <p className="text-2xl font-bold text-foreground">{fmt(dosePure)} ml</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Dawka przy rozcieńczeniu (ml)</Label>
                      <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-muted/30">
                        <p className="text-2xl font-bold text-foreground">{fmt(doseDiluted)} ml</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Orientacyjnie</Label>
                      <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-muted/30">
                        <p className="text-lg font-bold text-foreground">{doseDrops}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Założenia: 20 kropel ≈ 1 ml; 1 łyżeczka ≈ 5 ml.
                  </p>
                </CardContent>
              </Card>

              {/* Technical Info */}
              <Card className="border-border shadow-card">
                <CardHeader>
                  <CardTitle>Parametry wariantów</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-semibold">Produkt</th>
                          <th className="text-left p-3 font-semibold">Moc (stosunek)</th>
                          <th className="text-left p-3 font-semibold">Chymozyna (min.)</th>
                          <th className="text-left p-3 font-semibold">IMCU</th>
                          <th className="text-left p-3 font-semibold">Przelicznik na 1 l</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="p-3">Beaugel 5</td>
                          <td className="p-3">1:3000</td>
                          <td className="p-3">≥180 mg/L</td>
                          <td className="p-3">—</td>
                          <td className="p-3">~0.333 ml</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="p-3">Beaugel 50</td>
                          <td className="p-3">1:1000</td>
                          <td className="p-3">≥50 mg/L</td>
                          <td className="p-3">~14 IMCU/ml</td>
                          <td className="p-3">~1.000 ml</td>
                        </tr>
                        <tr className="hover:bg-muted/50">
                          <td className="p-3">Beaugel 500</td>
                          <td className="p-3">1:10000</td>
                          <td className="p-3">≥520 mg/L</td>
                          <td className="p-3">≥140 IMCU/ml</td>
                          <td className="p-3">~0.100 ml</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <Alert className="mt-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm">
                      <strong>Uwaga na IMCU:</strong> Katalogowo dla Beaugel 50 widnieje ok. 14 IMCU/ml, a dla Beaugel 500 ≥ 140 IMCU/ml. IMCU to aktywność w warunkach testu ISO i może różnić się od prostego „stosunku 1:X". W kalkulatorze bazujemy na relacji 1:X do wyliczeń dawki.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-border shadow-card">
                <CardHeader>
                  <CardTitle>Wskazówki technologiczne</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">•</span>
                      <span>Zawsze rozcieńczaj w <strong>niechlorowanej</strong> wodzie (np. przegotowanej i ostudzonej) tuż przed użyciem.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">•</span>
                      <span>Reguluj dawkę obserwując <strong>czas flokulacji</strong> (docelowo 10–20 min w 30–32 °C, zależnie od stylu sera).</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">•</span>
                      <span>Wpływ mają: pH, CaCl₂, temperatura, świeżość podpuszczki i styl sera. Prowadź notatki z warzeń.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Universal IMCU Calculator */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <Card className="border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Uniwersalny kalkulator IMCU</CardTitle>
                  <CardDescription>
                    Dla wszystkich typów podpuszczek - oblicz dawkę na podstawie mocy IMCU/ml
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
                    <p className="font-mono text-sm mb-2">IMCU × 0.01 = litry mleka na 1 ml podpuszczki</p>
                    <p className="text-xs text-muted-foreground">Następnie: Litry mleka ÷ Wynik = ml potrzebnej podpuszczki</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="imcu">Moc podpuszczki (IMCU/ml)</Label>
                      <Input
                        id="imcu"
                        type="number"
                        min="1"
                        step="1"
                        value={imcu}
                        onChange={(e) => setImcu(parseFloat(e.target.value) || 0)}
                        placeholder="np. 280"
                        className="border-border"
                      />
                      <p className="text-xs text-muted-foreground">Pojedyncza: ~200, Podwójna: ~240-280</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="milk-imcu">Ilość mleka (L)</Label>
                      <Input
                        id="milk-imcu"
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={milkLitersIMCU}
                        onChange={(e) => setMilkLitersIMCU(parseFloat(e.target.value) || 0)}
                        placeholder="np. 10"
                        className="border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cheese-type">Typ sera (mnożnik flokulacji)</Label>
                      <Select value={cheeseType} onValueChange={setCheeseType}>
                        <SelectTrigger id="cheese-type" className="border-border">
                          <SelectValue placeholder="Opcjonalne" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Bez korekty</SelectItem>
                          <SelectItem value="2.0">Parmezan, Pecorino (2.0-2.5)</SelectItem>
                          <SelectItem value="2.5">Cheddar (2.5-3.0)</SelectItem>
                          <SelectItem value="3.5">Monterey Jack (3.5)</SelectItem>
                          <SelectItem value="4.0">Feta, sery pleśniowe (4.0)</SelectItem>
                          <SelectItem value="5.0">Camembert, Brie (5.0-6.0)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Wymagana dawka podpuszczki</Label>
                    <div className="p-6 rounded-lg border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                      <p className="text-3xl font-bold text-foreground text-center">{rennetResult}</p>
                    </div>
                  </div>

                  <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/30">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm">
                      <strong>Wskazówka:</strong> Typ sera wpływa na niewielką korektę dawki (do -20%). Jeśli nie jesteś pewien, zostaw bez korekty i obserwuj czas flokulacji podczas produkcji.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Sources */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <Card className="border-border shadow-card">
                <CardHeader>
                  <CardTitle>Źródła</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Coquard — karta produktu <em>Beaugel 5</em>: moc 1:3000, chymozyna ≥ 180 mg/L.</li>
                    <li>Coquard — katalog (2025): <em>Beaugel 50</em> 1:1000, chymozyna ≥ 50 mg/L, ~14 IMCU.</li>
                    <li>Coquard — karta produktu <em>Beaugel 500</em>: 1:10000, chymozyna ≥ 520 mg/L.</li>
                    <li>Coquard — katalog (2022/2023): wzm. informacja o IMCU ≥ 140 dla wybranych wariantów.</li>
                    <li>ISO 11815 (2007) — Międzynarodowa jednostka krzepnięcia mleka (IMCU).</li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-4">
                    * IMCU z katalogów Coquard (roczniki 2022–2025); mogą różnić się między seriami. Do porównań między producentami używaj raczej IMCU niż mg/L, a do dawkowania — stosunku 1:X jeśli jest podany.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default KalkulatorBeaugel;
