import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import ReactionButton from "@/components/ReactionButton";

type UnitDef = {
  id: string;
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
};

type CategoryDef = {
  label: string;
  base: string;
  units: UnitDef[];
  quick: string[][];
};

const KalkulatorMiar = () => {
  useEffect(() => {
    document.title = "Kalkulator Miar - Serowarstwo.pl";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Dwukierunkowy przelicznik jednostek: długość, masa, objętość, temperatura, prędkość, ciśnienie i powierzchnia. Obsługuje format imperial i metryczny.");
    }
  }, []);

  const categories: Record<string, CategoryDef> = {
    dlugosc: {
      label: 'Długość', base: 'm',
      units: [
        {id:'in', label:'cal (in)', toBase:v=>v*0.0254, fromBase:v=>v/0.0254},
        {id:'ft', label:'stopa (ft)', toBase:v=>v*0.3048, fromBase:v=>v/0.3048},
        {id:'yd', label:'jard (yd)', toBase:v=>v*0.9144, fromBase:v=>v/0.9144},
        {id:'mi', label:'mila (mi)', toBase:v=>v*1609.344, fromBase:v=>v/1609.344},
        {id:'mm', label:'milimetr (mm)', toBase:v=>v/1000, fromBase:v=>v*1000},
        {id:'cm', label:'centymetr (cm)', toBase:v=>v/100, fromBase:v=>v*100},
        {id:'m',  label:'metr (m)', toBase:v=>v, fromBase:v=>v},
        {id:'km', label:'kilometr (km)', toBase:v=>v*1000, fromBase:v=>v/1000},
      ],
      quick:[['in','cm'],['ft','m'],['yd','m'],['mi','km']]
    },
    masa: {
      label: 'Masa', base: 'kg',
      units: [
        {id:'oz', label:'uncja (oz)', toBase:v=>v*0.028349523125, fromBase:v=>v/0.028349523125},
        {id:'lb', label:'funt (lb)', toBase:v=>v*0.45359237, fromBase:v=>v/0.45359237},
        {id:'g', label:'gram (g)', toBase:v=>v/1000, fromBase:v=>v*1000},
        {id:'kg', label:'kilogram (kg)', toBase:v=>v, fromBase:v=>v},
        {id:'t', label:'tona (t)', toBase:v=>v*1000, fromBase:v=>v/1000},
      ],
      quick:[['oz','g'],['lb','kg']]
    },
    objetosc: {
      label: 'Objętość (płyny)', base: 'L',
      units: [
        {id:'tsp', label:'łyżeczka (tsp, US)', toBase:v=>v*0.00492892159375, fromBase:v=>v/0.00492892159375},
        {id:'tbsp', label:'łyżka (tbsp, US)', toBase:v=>v*0.01478676478125, fromBase:v=>v/0.01478676478125},
        {id:'cup', label:'kielich/kubek (cup, US)', toBase:v=>v*0.2365882365, fromBase:v=>v/0.2365882365},
        {id:'fl_oz', label:'uncja płynu (fl oz, US)', toBase:v=>v*0.0295735295625, fromBase:v=>v/0.0295735295625},
        {id:'pt', label:'pint (pt, US)', toBase:v=>v*0.473176473, fromBase:v=>v/0.473176473},
        {id:'qt', label:'kwarta (qt, US)', toBase:v=>v*0.946352946, fromBase:v=>v/0.946352946},
        {id:'gal', label:'galon (gal, US)', toBase:v=>v*3.785411784, fromBase:v=>v/3.785411784},
        {id:'ml', label:'mililitr (ml)', toBase:v=>v/1000, fromBase:v=>v*1000},
        {id:'L', label:'litr (L)', toBase:v=>v, fromBase:v=>v},
      ],
      quick:[['cup','ml'],['gal','L'],['fl_oz','ml']]
    },
    powierzchnia: {
      label: 'Powierzchnia', base: 'm²',
      units: [
        {id:'in2', label:'cal² (in²)', toBase:v=>v*0.00064516, fromBase:v=>v/0.00064516},
        {id:'ft2', label:'stopa² (ft²)', toBase:v=>v*0.09290304, fromBase:v=>v/0.09290304},
        {id:'yd2', label:'jard² (yd²)', toBase:v=>v*0.83612736, fromBase:v=>v/0.83612736},
        {id:'acre', label:'akr', toBase:v=>v*4046.8564224, fromBase:v=>v/4046.8564224},
        {id:'m2', label:'metr² (m²)', toBase:v=>v, fromBase:v=>v},
        {id:'ha', label:'hektar (ha)', toBase:v=>v*10000, fromBase:v=>v/10000},
      ],
      quick:[['ft2','m2'],['acre','ha']]
    },
    predkosc: {
      label: 'Prędkość', base: 'm/s',
      units: [
        {id:'mph', label:'mil/h (mph)', toBase:v=>v*0.44704, fromBase:v=>v/0.44704},
        {id:'kmh', label:'km/h', toBase:v=>v*(1000/3600), fromBase:v=>v/(1000/3600)},
        {id:'ms', label:'m/s', toBase:v=>v, fromBase:v=>v},
        {id:'kts', label:'węzeł (kt)', toBase:v=>v*0.514444, fromBase:v=>v/0.514444},
      ],
      quick:[['mph','kmh'],['kts','kmh']]
    },
    cisnienie: {
      label: 'Ciśnienie', base: 'Pa',
      units: [
        {id:'psi', label:'psi', toBase:v=>v*6894.757293168, fromBase:v=>v/6894.757293168},
        {id:'bar', label:'bar', toBase:v=>v*100000, fromBase:v=>v/100000},
        {id:'kPa', label:'kPa', toBase:v=>v*1000, fromBase:v=>v/1000},
        {id:'Pa', label:'Pa', toBase:v=>v, fromBase:v=>v},
        {id:'atm', label:'atm', toBase:v=>v*101325, fromBase:v=>v/101325},
      ],
      quick:[['psi','bar'],['psi','kPa']]
    },
    temperatura: {
      label: 'Temperatura', base: 'K',
      units: [
        {id:'C', label:'Celsjusz (°C)', toBase:v=>v+273.15, fromBase:v=>v-273.15},
        {id:'F', label:'Fahrenheit (°F)', toBase:v=> (v-32)*(5/9)+273.15, fromBase:v=> (v-273.15)*(9/5)+32},
        {id:'K', label:'Kelwin (K)', toBase:v=>v, fromBase:v=>v},
      ],
      quick:[['C','F'],['F','C']]
    }
  };

  const [category, setCategory] = useState('dlugosc');
  const [unitA, setUnitA] = useState('ft');
  const [unitB, setUnitB] = useState('m');
  const [valueA, setValueA] = useState('');
  const [valueB, setValueB] = useState('');
  const [precision, setPrecision] = useState(2);
  const [useComma, setUseComma] = useState(false);

  const parseNum = (s: string): number => {
    if (typeof s !== 'string') return NaN;
    const t = s.trim().toLowerCase();
    if (!t) return NaN;
    
    // Obsługa formatu ft+in
    const ftIn1 = t.match(/^(-?\d+(?:[.,]\d+)?)\s*(?:ft|')\s*(\d+(?:[.,]\d+)?)?\s*(?:in|")?$/);
    if (ftIn1) {
      const ft = parseFloat(ftIn1[1].replace(',', '.'));
      const inch = ftIn1[2] ? parseFloat(ftIn1[2].replace(',', '.')) : 0;
      return ft * 12 + inch;
    }
    
    const ftIn2 = t.match(/^(-?\d+(?:[.,]\d+)?)\s*ft\s*(\d+(?:[.,]\d+)?)?$/);
    if (ftIn2) {
      const ft = parseFloat(ftIn2[1].replace(',', '.'));
      const inch = ftIn2[2] ? parseFloat(ftIn2[2].replace(',', '.')) : 0;
      return ft * 12 + inch;
    }
    
    const n = parseFloat(t.replace(',', '.'));
    return isNaN(n) ? NaN : n;
  };

  const formatNum = (v: number, p: number, comma: boolean): string => {
    if (!isFinite(v)) return '';
    const s = Number(v).toFixed(p);
    return comma ? s.replace('.', ',') : s;
  };

  const convert = (val: number, fromId: string, toId: string): number => {
    if (!isFinite(val)) return NaN;
    const cat = categories[category];
    const fromUnit = cat.units.find(u => u.id === fromId);
    const toUnit = cat.units.find(u => u.id === toId);
    if (!fromUnit || !toUnit) return NaN;
    
    const base = fromUnit.toBase(val);
    return toUnit.fromBase(base);
  };

  const convertFromA = (newValue?: string) => {
    const val = newValue !== undefined ? newValue : valueA;
    const n = parseNum(val);
    const res = convert(n, unitA, unitB);
    setValueB(formatNum(res, precision, useComma));
  };

  const convertFromB = (newValue?: string) => {
    const val = newValue !== undefined ? newValue : valueB;
    const n = parseNum(val);
    const res = convert(n, unitB, unitA);
    setValueA(formatNum(res, precision, useComma));
  };

  useEffect(() => {
    convertFromA();
  }, [unitA, unitB, precision, useComma]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const q = categories[cat].quick?.[0];
    if (q) {
      setUnitA(q[0]);
      setUnitB(q[1]);
    }
  };

  const handleSwap = () => {
    const tempUnit = unitA;
    setUnitA(unitB);
    setUnitB(tempUnit);
    const tempVal = valueA;
    setValueA(valueB);
    setValueB(tempVal);
  };

  const handleQuickPair = (a: string, b: string) => {
    setUnitA(a);
    setUnitB(b);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Skopiowano do schowka!");
  };

  const currentCategory = categories[category];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero */}
        <header className="bg-gradient-to-br from-primary/90 to-accent/90 text-primary-foreground border-b border-border">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Calculator className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold">Kalkulator Miar</h1>
              </div>
            </div>
            <p className="text-primary-foreground/90 max-w-3xl">
              Dwukierunkowy przelicznik jednostek: długość, masa, objętość, temperatura, prędkość, ciśnienie i powierzchnia. Wspiera format imperial i metryczny (również stopy+cale).
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-start">
            <ReactionButton contentType="tool" contentId="kalkulator-miar" variant="default" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Kategorie */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Wybierz kategorię</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categories).map(([key, cat]) => (
                  <Button
                    key={key}
                    variant={category === key ? "default" : "outline"}
                    onClick={() => handleCategoryChange(key)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 items-center">
                <div className="flex items-center gap-2">
                  <Label htmlFor="precision" className="text-sm">Precyzja:</Label>
                  <input
                    id="precision"
                    type="range"
                    min="0"
                    max="8"
                    value={precision}
                    onChange={(e) => setPrecision(Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm font-medium">{precision} msc</span>
                </div>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useComma}
                    onChange={(e) => setUseComma(e.target.checked)}
                    className="rounded"
                  />
                  Używaj przecinka
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Główny przelicznik */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Przeliczanie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valueA">Wartość</Label>
                  <Input
                    id="valueA"
                    type="text"
                    placeholder="np. 5'7&quot; lub 2.54"
                    value={valueA}
                    onChange={(e) => {
                      setValueA(e.target.value);
                      convertFromA(e.target.value);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {category === 'dlugosc' && "Akceptuje format: 6'2\" lub 6 ft 2 in"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valueB">Wynik</Label>
                  <Input
                    id="valueB"
                    type="text"
                    placeholder="Wynik"
                    value={valueB}
                    onChange={(e) => {
                      setValueB(e.target.value);
                      convertFromB(e.target.value);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">Edycja przeliczy w drugą stronę</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitA">Jednostka wejściowa</Label>
                  <select
                    id="unitA"
                    value={unitA}
                    onChange={(e) => setUnitA(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    {currentCategory.units.map(u => (
                      <option key={u.id} value={u.id}>{u.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitB">Jednostka wyjściowa</Label>
                  <select
                    id="unitB"
                    value={unitB}
                    onChange={(e) => setUnitB(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    {currentCategory.units.map(u => (
                      <option key={u.id} value={u.id}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSwap} variant="outline">
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Zamień
                </Button>
                <Button onClick={() => copyToClipboard(valueA)} variant="outline" size="sm">
                  Kopiuj wartość
                </Button>
                <Button onClick={() => copyToClipboard(valueB)} variant="outline" size="sm">
                  Kopiuj wynik
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Szybkie pary */}
          <Card>
            <CardHeader>
              <CardTitle>Szybkie pary w kategorii: {currentCategory.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentCategory.quick.map(([a, b], idx) => {
                  const labelA = currentCategory.units.find(u => u.id === a)?.label || a;
                  const labelB = currentCategory.units.find(u => u.id === b)?.label || b;
                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      onClick={() => handleQuickPair(a, b)}
                    >
                      {labelA} ⟷ {labelB}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {category === 'dlugosc' && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>💡 Pomoc: stopy i cale</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Możesz wprowadzić <code className="bg-muted px-1 rounded">5'7"</code>, <code className="bg-muted px-1 rounded">5 ft 7 in</code>, <code className="bg-muted px-1 rounded">5ft7</code> lub <code className="bg-muted px-1 rounded">67 in</code>. Kalkulator sam rozpozna format.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default KalkulatorMiar;