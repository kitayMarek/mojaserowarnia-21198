import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Plus, Trash2, Copy, FileJson, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactionButton from "@/components/ReactionButton";
import PageHeader from "@/components/PageHeader";
interface Ingredient {
  id: string;
  name: string;
  price: number;
  vat: number;
  grossIncl: boolean;
  packQty: number;
  packUnit: string;
  useQty: number;
  useUnit: string;
  loss: number;
}

const UNITS = ['kg', 'g', 'lb', 'oz', 'L', 'ml', 'pcs'];
const MASS = { kg: 1000, g: 1, lb: 453.59237, oz: 28.349523125 };
const VOL = { L: 1000, ml: 1 };
const PCS = { pcs: 1 };

const KalkulatorKosztuSera = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    document.title = "Kalkulator Kosztu Sera - Oblicz Rentowność Produkcji | Moja Serowarnia";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Kompleksowy kalkulator kosztów produkcji sera: wydajność z mleka, składniki, marża i cena sprzedaży. Uwzględnia VAT, straty i koszty stałe.");
    }
  }, []);
  
  // Settings
  const [currency, setCurrency] = useState("zł");
  const [yieldKgPer10L, setYieldKgPer10L] = useState(0.8);
  const [processLoss, setProcessLoss] = useState(0);
  const [marginPct, setMarginPct] = useState(30);
  const [sellVat, setSellVat] = useState(5);
  const [overheadVal, setOverheadVal] = useState(0);
  const [overheadVat, setOverheadVat] = useState(23);
  const [overheadGrossIncl, setOverheadGrossIncl] = useState(true);
  const [batchKgManual, setBatchKgManual] = useState(0);
  const [autoBatch, setAutoBatch] = useState(true);

  // Mleko — osobno, model „cena za litr" (nie opakowaniowy)
  const [milkPricePerL, setMilkPricePerL] = useState(2.5);
  const [milkVat, setMilkVat] = useState(5);
  const [milkGrossIncl, setMilkGrossIncl] = useState(true);
  const [milkLiters, setMilkLiters] = useState(0);

  // Dodatki (model opakowaniowy) — wstępnie wypełnione nazwami, bez ilości
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: 'Podpuszczka', price: 0, vat: 23, grossIncl: true, packQty: 0, packUnit: 'ml', useQty: 0, useUnit: 'ml', loss: 0 },
    { id: '2', name: 'Kultury', price: 0, vat: 23, grossIncl: true, packQty: 0, packUnit: 'g', useQty: 0, useUnit: 'g', loss: 0 },
    { id: '3', name: 'Chlorek wapnia (CaCl₂)', price: 0, vat: 23, grossIncl: true, packQty: 0, packUnit: 'ml', useQty: 0, useUnit: 'ml', loss: 0 },
    { id: '4', name: 'Sól', price: 0, vat: 23, grossIncl: true, packQty: 0, packUnit: 'kg', useQty: 0, useUnit: 'kg', loss: 0 },
    { id: '5', name: 'Przyprawy', price: 0, vat: 23, grossIncl: true, packQty: 0, packUnit: 'g', useQty: 0, useUnit: 'g', loss: 0 },
  ]);
  
  // Results
  const [autoBatchHint, setAutoBatchHint] = useState("—");
  const [effKg, setEffKg] = useState(0);
  const [sumNet, setSumNet] = useState(0);
  const [sumGross, setSumGross] = useState(0);
  const [perKgNet, setPerKgNet] = useState(0);
  const [perKgGross, setPerKgGross] = useState(0);
  const [perPortion, setPerPortion] = useState(0);
  const [sellNetPerKg, setSellNetPerKg] = useState(0);
  const [sellGrossPerKg, setSellGrossPerKg] = useState(0);
  const [sellGross250g, setSellGross250g] = useState(0);
  const [totalProdNet, setTotalProdNet] = useState(0);
  const [totalProdGross, setTotalProdGross] = useState(0);

  const fmt = (n: number, cur?: string) => {
    if (!isFinite(n)) return '—';
    const d = Math.abs(n) >= 100 ? 0 : 2;
    return (cur ? cur + " " : "") + n.toLocaleString('pl-PL', { minimumFractionDigits: d, maximumFractionDigits: d });
  };

  const isMass = (u: string) => u in MASS;
  const isVol = (u: string) => u in VOL;
  const isPcs = (u: string) => u in PCS;
  
  const toBaseQty = (q: number, u: string) => {
    if (isMass(u)) return q * MASS[u as keyof typeof MASS];
    if (isVol(u)) return q * VOL[u as keyof typeof VOL];
    if (isPcs(u)) return q;
    return NaN;
  };

  const sameKind = (u1: string, u2: string) => {
    return (isMass(u1) && isMass(u2)) || (isVol(u1) && isVol(u2)) || (isPcs(u1) && isPcs(u2));
  };

  const detectMilkLiters = (ings: Ingredient[]) => {
    let liters = 0;
    ings.forEach(r => {
      const name = (r.name || '').toLowerCase();
      if (name.includes('mlek') && isVol(r.useUnit)) {
        const mls = toBaseQty(r.useQty * (1 - r.loss / 100), r.useUnit);
        liters += mls / 1000;
      }
    });
    return liters;
  };

  const costForRow = (r: Ingredient, effKg: number) => {
    if (!sameKind(r.packUnit, r.useUnit)) 
      return { netPerKg: NaN, grossPerKg: NaN, warn: 'Jednostki niezgodne' };
    
    const packBase = toBaseQty(r.packQty, r.packUnit);
    const useBase = toBaseQty(r.useQty * (1 - r.loss / 100), r.useUnit);
    
    if (!(packBase > 0) || !(useBase >= 0) || !(effKg > 0)) 
      return { netPerKg: NaN, grossPerKg: NaN, warn: 'Brak danych' };
    
    const priceNet = r.grossIncl ? r.price / (1 + r.vat / 100) : r.price;
    const priceGross = r.grossIncl ? r.price : r.price * (1 + r.vat / 100);
    const share = useBase / packBase;
    const netBatch = priceNet * share;
    const grossBatch = priceGross * share;
    
    return { netPerKg: netBatch / effKg, grossPerKg: grossBatch / effKg };
  };

  const calculate = () => {
    // 1) Milk-based batch weight (mleko z osobnej sekcji)
    const milkL = milkLiters;
    const autoBatchKg = milkL * (yieldKgPer10L / 10);
    setAutoBatchHint(milkL > 0 ? `${fmt(autoBatchKg, '')} kg (z ${fmt(milkL, '')} L mleka @ ${fmt(yieldKgPer10L, '')} kg / 10 L)` : 'brak mleka w składnikach');
    
    // Auto update batch weight from milk
    const currentBatchKg = autoBatch ? (autoBatchKg || 0) : batchKgManual;
    
    // 2) Effective weight (after process losses)
    const effective = currentBatchKg * (1 - Math.min(Math.max(processLoss, 0), 99.9999) / 100);
    setEffKg(effective);

    // 3) Koszt mleka (cena za litr × litry) + koszt dodatków
    const mVat = Math.max(milkVat, 0) / 100;
    const milkNet = (milkGrossIncl ? milkPricePerL / (1 + mVat) : milkPricePerL) * milkLiters;
    const milkGross = (milkGrossIncl ? milkPricePerL : milkPricePerL * (1 + mVat)) * milkLiters;
    let netSum = milkNet, grossSum = milkGross;
    ingredients.forEach(r => {
      const c = costForRow(r, Math.max(effective, 0.000001));
      if (isFinite(c.netPerKg) && isFinite(c.grossPerKg)) {
        // c.netPerKg is cost per kg of cheese, multiply by effKg to get total batch cost
        netSum += c.netPerKg * effective;
        grossSum += c.grossPerKg * effective;
      }
    });
    setSumNet(netSum);
    setSumGross(grossSum);

    // 4) Overhead costs
    const ovVat = Math.max(overheadVat, 0) / 100;
    const ovNet = overheadGrossIncl ? overheadVal / (1 + ovVat) : overheadVal;
    const ovGross = overheadGrossIncl ? overheadVal : overheadVal * (1 + ovVat);

    // 5) Per kg costs (total batch cost / effective kg + overhead per kg)
    let netPK = 0, grossPK = 0;
    if (effective > 0) {
      netPK = (netSum / effective) + (ovNet / effective);
      grossPK = (grossSum / effective) + (ovGross / effective);
      setPerKgNet(netPK);
      setPerKgGross(grossPK);
      setPerPortion(grossPK * 0.25);

      // 6) Selling prices (cost + margin, then + VAT)
      const m = Math.max(marginPct, 0) / 100;
      const sv = Math.max(sellVat, 0) / 100;
      const priceNetPK = netPK * (1 + m);
      const priceGrossPK = priceNetPK * (1 + sv);
      setSellNetPerKg(priceNetPK);
      setSellGrossPerKg(priceGrossPK);
      setSellGross250g(priceGrossPK * 0.25);
      
      // Total production value
      setTotalProdNet(priceNetPK * effective);
      setTotalProdGross(priceGrossPK * effective);
    } else {
      setPerKgNet(0);
      setPerKgGross(0);
      setPerPortion(0);
      setSellNetPerKg(0);
      setSellGrossPerKg(0);
      setSellGross250g(0);
      setTotalProdNet(0);
      setTotalProdGross(0);
    }
    
    // Update manual batch kg if in auto mode
    if (autoBatch && currentBatchKg !== batchKgManual) {
      setBatchKgManual(currentBatchKg);
    }
  };

  useEffect(() => {
    calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredients, milkPricePerL, milkVat, milkGrossIncl, milkLiters, currency, yieldKgPer10L, processLoss, marginPct, sellVat, overheadVal, overheadVat, overheadGrossIncl, batchKgManual, autoBatch]);

  const addIngredient = () => {
    setIngredients([...ingredients, {
      id: Date.now().toString(),
      name: '',
      price: 0,
      vat: 5,
      grossIncl: true,
      packQty: 0,
      packUnit: 'kg',
      useQty: 0,
      useUnit: 'kg',
      loss: 0
    }]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: any) => {
    setIngredients(ingredients.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const loadDefaults = () => {
    setMilkPricePerL(2.5); setMilkVat(5); setMilkGrossIncl(true); setMilkLiters(100);
    setIngredients([
      { id: '1', name: 'Podpuszczka', price: 40, vat: 23, grossIncl: true, packQty: 50, packUnit: 'ml', useQty: 10, useUnit: 'ml', loss: 0 },
      { id: '2', name: 'Kultury', price: 90, vat: 23, grossIncl: true, packQty: 50, packUnit: 'g', useQty: 1, useUnit: 'g', loss: 0 },
      { id: '3', name: 'Chlorek wapnia (CaCl₂)', price: 30, vat: 23, grossIncl: true, packQty: 1000, packUnit: 'ml', useQty: 10, useUnit: 'ml', loss: 0 },
      { id: '4', name: 'Sól', price: 5, vat: 23, grossIncl: true, packQty: 1, packUnit: 'kg', useQty: 0.2, useUnit: 'kg', loss: 0 },
    ]);
    toast({ title: "Wczytano przykładowe wartości" });
  };

  const clearAll = () => {
    setIngredients([]);
    setMilkLiters(0); setMilkPricePerL(0);
    setBatchKgManual(0);
    toast({ title: "Wyczyszczono kalkulator" });
  };

  const exportData = () => {
    const data = {
      currency, yieldKgPer10L, processLoss, marginPct, sellVat,
      overheadVal, overheadVat, overheadGrossIncl, batchKgManual, autoBatch,
      milkPricePerL, milkVat, milkGrossIncl, milkLiters,
      ingredients
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kalkulator_kosztu_sera.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast({ title: "Wyeksportowano dane" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageBreadcrumbs items={[
        { label: "Narzędzia", href: "/narzedzia" },
        { label: "Kalkulator Kosztu Sera" }
      ]} />
      
      <main className="pt-20">
        {/* Nagłówek strony — spójny PageHeader (zamiast wyśrodkowanego hero) */}
        <div className="container mx-auto px-4 pt-6">
          <div className="max-w-6xl mx-auto space-y-4">
            <PageHeader
              icon={Calculator}
              color="emerald"
              title="Kalkulator kosztu sera"
              subtitle="Wydajność z mleka → waga sera • składniki + koszty stałe + marża → cena sprzedaży"
            />
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-start">
            <ReactionButton contentType="tool" contentId="kalkulator-kosztu-sera" variant="default" />
          </div>
        </div>

        {/* Settings */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-8">

              <div className="flex flex-wrap gap-3">
                <Button onClick={loadDefaults} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Wczytaj przykładowe wartości
                </Button>
                <Button onClick={clearAll} variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  Wyczyść wszystko
                </Button>
              </div>
              
              <Card className="border-border shadow-card">
                <CardHeader>
                  <CardTitle>1) Ustawienia partii</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label>Waluta</Label>
                      <Input value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={6} />
                    </div>
                    <div className="space-y-2">
                      <Label>Wydajność (kg z 10 L mleka)</Label>
                      <Input type="number" step="0.001" value={yieldKgPer10L} onChange={(e) => setYieldKgPer10L(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Straty procesu (%)</Label>
                      <Input type="number" step="0.1" value={processLoss} onChange={(e) => setProcessLoss(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Marża (%)</Label>
                      <Input type="number" step="0.1" value={marginPct} onChange={(e) => setMarginPct(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-2">
                      <Label>VAT sprzedaży (%)</Label>
                      <Input type="number" step="0.1" value={sellVat} onChange={(e) => setSellVat(parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Koszty stałe partii</Label>
                      <Input type="number" step="0.01" value={overheadVal} onChange={(e) => setOverheadVal(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-2">
                      <Label>VAT kosztów stałych (%)</Label>
                      <Input type="number" step="0.1" value={overheadVat} onChange={(e) => setOverheadVat(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-2 flex items-end">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="overhead-gross" 
                          checked={overheadGrossIncl} 
                          onChange={(e) => setOverheadGrossIncl(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="overhead-gross" className="cursor-pointer">Kwota zawiera VAT?</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mleko */}
              <Card className="border-border shadow-card">
                <CardHeader>
                  <CardTitle>2) Mleko</CardTitle>
                  <CardDescription>Cena za litr × ilość. Litry napędzają wydajność (wagę sera).</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Cena za litr ({currency}/L)</Label>
                      <Input type="number" step="0.01" value={milkPricePerL} onChange={(e) => setMilkPricePerL(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-2">
                      <Label>VAT %</Label>
                      <Input type="number" step="0.1" value={milkVat} onChange={(e) => setMilkVat(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="flex items-center gap-2 pb-2">
                      <input type="checkbox" id="milk-gross" checked={milkGrossIncl} onChange={(e) => setMilkGrossIncl(e.target.checked)} className="w-4 h-4" />
                      <Label htmlFor="milk-gross" className="cursor-pointer">cena zawiera VAT?</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Ilość mleka (L)</Label>
                      <Input type="number" step="0.1" value={milkLiters} onChange={(e) => setMilkLiters(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Koszt mleka (brutto)</Label>
                      <div className="h-10 flex items-center font-semibold">
                        {fmt((milkGrossIncl ? milkPricePerL : milkPricePerL * (1 + Math.max(milkVat, 0) / 100)) * milkLiters, currency)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dodatki */}
              <Card className="border-border shadow-card">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>3) Dodatki (podpuszczka, kultury, wapń…)</CardTitle>
                    <Button onClick={addIngredient} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj składnik
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-semibold min-w-[140px]">Składnik</th>
                          <th className="text-left p-2 font-semibold min-w-[100px]">Cena opak.</th>
                          <th className="text-left p-2 font-semibold min-w-[70px]">VAT %</th>
                          <th className="text-center p-2 font-semibold min-w-[70px]">Brutto?</th>
                          <th className="text-left p-2 font-semibold min-w-[100px]">Zawartość opak.</th>
                          <th className="text-left p-2 font-semibold min-w-[80px]">Jedn. opak.</th>
                          <th className="text-left p-2 font-semibold min-w-[100px]">Użycie</th>
                          <th className="text-left p-2 font-semibold min-w-[80px]">Jedn. użycia</th>
                          <th className="text-left p-2 font-semibold min-w-[70px]">Ubytek %</th>
                          <th className="text-left p-2 font-semibold min-w-[140px]">Koszt/kg</th>
                          <th className="p-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {ingredients.map((ing) => {
                          const cost = costForRow(ing, Math.max(effKg, 0.000001));
                          return (
                            <tr key={ing.id} className="border-b hover:bg-muted/30">
                              <td className="p-2">
                                <Input 
                                  value={ing.name} 
                                  onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                                  placeholder="np. przyprawy, bakalie"
                                  className="min-w-[130px]"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={ing.price}
                                  onChange={(e) => updateIngredient(ing.id, 'price', parseFloat(e.target.value) || 0)}
                                  className="min-w-[90px]"
                                />
                                {ing.packQty > 0 && (
                                  <div className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap">
                                    = {fmt((ing.grossIncl ? ing.price : ing.price * (1 + ing.vat / 100)) / ing.packQty, currency)}/{ing.packUnit}
                                  </div>
                                )}
                              </td>
                              <td className="p-2">
                                <Input 
                                  type="number" 
                                  step="0.1"
                                  value={ing.vat} 
                                  onChange={(e) => updateIngredient(ing.id, 'vat', parseFloat(e.target.value) || 0)}
                                  className="min-w-[60px]"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={ing.grossIncl} 
                                  onChange={(e) => updateIngredient(ing.id, 'grossIncl', e.target.checked)}
                                  className="w-4 h-4"
                                />
                              </td>
                              <td className="p-2">
                                <Input 
                                  type="number" 
                                  step="0.0001"
                                  value={ing.packQty} 
                                  onChange={(e) => updateIngredient(ing.id, 'packQty', parseFloat(e.target.value) || 0)}
                                  className="min-w-[90px]"
                                />
                              </td>
                              <td className="p-2">
                                <Select value={ing.packUnit} onValueChange={(v) => updateIngredient(ing.id, 'packUnit', v)}>
                                  <SelectTrigger className="min-w-[70px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-2">
                                <Input 
                                  type="number" 
                                  step="0.0001"
                                  value={ing.useQty} 
                                  onChange={(e) => updateIngredient(ing.id, 'useQty', parseFloat(e.target.value) || 0)}
                                  className="min-w-[90px]"
                                />
                              </td>
                              <td className="p-2">
                                <Select value={ing.useUnit} onValueChange={(v) => updateIngredient(ing.id, 'useUnit', v)}>
                                  <SelectTrigger className="min-w-[70px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-2">
                                <Input 
                                  type="number" 
                                  step="0.1"
                                  value={ing.loss} 
                                  onChange={(e) => updateIngredient(ing.id, 'loss', parseFloat(e.target.value) || 0)}
                                  className="min-w-[60px]"
                                />
                              </td>
                              <td className="p-2">
                                {isFinite(cost.netPerKg) && isFinite(cost.grossPerKg) ? (
                                  <div className="text-xs">
                                    <div>{fmt(cost.netPerKg, currency)} netto</div>
                                    <div>{fmt(cost.grossPerKg, currency)} brutto</div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-amber-600">⚠ {cost.warn}</div>
                                )}
                              </td>
                              <td className="p-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeIngredient(ing.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Jednostki masy: kg, g, lb, oz • objętości: L, ml • sztuki: pcs.
                    <strong> „Cena opak."</strong> = cena całego opakowania, <strong>„Zawartość opak."</strong> = ile jest w opakowaniu
                    (np. podpuszczka: 40 zł / 50 ml → 0,80 zł/ml). Pod ceną widać wyliczoną cenę jednostkową.
                  </p>
                </CardContent>
              </Card>

              {/* Results */}
              <Card className="border-border shadow-card">
                <CardHeader>
                  <CardTitle>4) Wyniki</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-lg border-2 border-primary/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Waga gotowego sera (kg)</Label>
                        <Input 
                          type="number" 
                          step="0.001"
                          value={batchKgManual} 
                          onChange={(e) => setBatchKgManual(parseFloat(e.target.value) || 0)}
                          disabled={autoBatch}
                        />
                      </div>
                      <div className="space-y-2 flex items-end">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id="auto-batch" 
                            checked={autoBatch} 
                            onChange={(e) => setAutoBatch(e.target.checked)}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="auto-batch" className="cursor-pointer">Auto z wydajności mleka</Label>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Podpowiedź: {autoBatchHint}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="text-sm text-muted-foreground mb-2">Suma kosztów NETTO (składniki)</div>
                      <div className="text-2xl font-bold">{fmt(sumNet, currency)}</div>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="text-sm text-muted-foreground mb-2">Suma kosztów BRUTTO (składniki)</div>
                      <div className="text-2xl font-bold">{fmt(sumGross, currency)}</div>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="text-sm text-muted-foreground mb-2">Efektywna waga po stratach</div>
                      <div className="text-2xl font-bold">{fmt(effKg, '')} kg</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="text-sm text-muted-foreground mb-2">Koszt NETTO / kg</div>
                      <div className="text-2xl font-bold">{fmt(perKgNet, currency)}</div>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="text-sm text-muted-foreground mb-2">Koszt BRUTTO / kg</div>
                      <div className="text-2xl font-bold">{fmt(perKgGross, currency)}</div>
                    </div>
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="text-sm text-muted-foreground mb-2">Koszt BRUTTO / 250 g</div>
                      <div className="text-2xl font-bold">{fmt(perPortion, currency)}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Cena sprzedaży (po marży)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5">
                        <div className="text-sm text-muted-foreground mb-2">NETTO / kg</div>
                        <div className="text-2xl font-bold text-primary">{fmt(sellNetPerKg, currency)}</div>
                      </div>
                      <div className="p-4 rounded-lg border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5">
                        <div className="text-sm text-muted-foreground mb-2">BRUTTO / kg</div>
                        <div className="text-2xl font-bold text-primary">{fmt(sellGrossPerKg, currency)}</div>
                      </div>
                      <div className="p-4 rounded-lg border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5">
                        <div className="text-sm text-muted-foreground mb-2">BRUTTO / 250 g</div>
                        <div className="text-2xl font-bold text-primary">{fmt(sellGross250g, currency)}</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-md font-semibold mb-4">Wartość całej produkcji</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border-2 border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                          <div className="text-sm text-muted-foreground mb-2">NETTO ({fmt(effKg, '')} kg × cena/kg)</div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{fmt(totalProdNet, currency)}</div>
                        </div>
                        <div className="p-4 rounded-lg border-2 border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                          <div className="text-sm text-muted-foreground mb-2">BRUTTO ({fmt(effKg, '')} kg × cena/kg)</div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{fmt(totalProdGross, currency)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end flex-wrap">
                    <Button onClick={exportData} variant="outline">
                      <FileJson className="h-4 w-4 mr-2" />
                      Eksport JSON
                    </Button>
                    <Button onClick={() => window.print()} variant="outline">
                      <Printer className="h-4 w-4 mr-2" />
                      Drukuj
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="text-xs text-muted-foreground text-center">
                Przeliczniki: 1 lb = 453.59237 g, 1 oz = 28.349523125 g • 1 L = 1000 ml
              </div>

              {/* TL;DR Section */}
              <TLDRSection>
                <ul className="space-y-1">
                  <li>• Wprowadź <strong>ilość mleka</strong> – kalkulator obliczy wagę sera z wydajności (cheese yield calculator)</li>
                  <li>• Dodaj <strong>składniki z cenami</strong> – podpuszczka, kultury, sól, CaCl₂</li>
                  <li>• Ustaw <strong>marżę i VAT</strong> – otrzymasz sugerowaną cenę sprzedaży</li>
                  <li>• Uwzględnij <strong>koszty stałe</strong> – energia, amortyzacja, pakowanie</li>
                </ul>
              </TLDRSection>

              {/* See Also Section */}
              <SeeAlso links={[
                { href: "/kalkulator-beaugel", title: "Kalkulator podpuszczki", description: "Dawkowanie Beaugel i IMCU" },
                { href: "/przepisy", title: "Przepisy na domowe sery", description: "Krok po kroku jak zrobić ser" },
                { href: "/baza-kultur", title: "Baza kultur bakteryjnych", description: "Wybór odpowiedniej kultury" },
                { href: "/prawo/rhd", title: "Rolniczy Handel Detaliczny", description: "Legalna sprzedaż serów" }
              ]} />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default KalkulatorKosztuSera;
