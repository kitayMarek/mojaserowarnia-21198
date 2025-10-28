import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Calculator, Timer } from "lucide-react";
import ReactionButton from "@/components/ReactionButton";

const SilaPodpuszczki = () => {
  useEffect(() => {
    document.title = "Siła podpuszczki i metoda flokulacji | Start";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Kompleksowy przewodnik po jednostkach IMCU, obliczaniu ilości podpuszczki oraz metodzie flokulacji do precyzyjnego określania momentu cięcia skrzepu.");
    }
  }, []);

  // Calculator states
  const [imcu, setImcu] = useState(280);
  const [milkLiters, setMilkLiters] = useState(10);
  const [cheeseTypeRennet, setCheeseTypeRennet] = useState("");
  const [rennetResult, setRennetResult] = useState("3.57 ml");
  
  const [flocTime, setFlocTime] = useState(15);
  const [cheeseType, setCheeseType] = useState("2.5");
  const [cutTimeResult, setCutTimeResult] = useState("");

  const calculateRennet = () => {
    if (!imcu || !milkLiters) {
      setRennetResult("Uzupełnij wszystkie dane.");
      return;
    }
    const M = Math.max(0, milkLiters);
    const S = Math.max(1, imcu);
    let base = M / (S * 0.01); // ml
    
    // Optional light correction based on cheese type multiplier
    const mult = parseFloat(cheeseTypeRennet);
    if (!isNaN(mult)) {
      const factor = 1 - Math.min(0.2, (mult - 2) / 20); // gentle correction up to -20%
      base = base * factor;
    }
    
    setRennetResult(`${Math.round(base * 100) / 100} ml`);
  };

  const calculateCutTime = () => {
    if (!flocTime || !cheeseType) {
      setCutTimeResult("Uzupełnij wszystkie dane.");
      return;
    }
    const factor = parseFloat(cheeseType);
    const totalMinutes = flocTime * factor;
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.round((totalMinutes - minutes) * 60);
    setCutTimeResult(`Czas całkowity do cięcia: ${minutes} min ${seconds} sek (od momentu dodania podpuszczki)`);
  };

  // Auto-calculate rennet on mount and when values change
  useEffect(() => {
    calculateRennet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imcu, milkLiters, cheeseTypeRennet]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 flex">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 border-r border-border bg-card/50 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold">📖 Spis treści</h3>
            </div>
            
            <div className="space-y-2">
              <a href="#imcu" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Jednostka IMCU</a>
              <a href="#obliczenia" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Obliczanie dawki</a>
              <a href="#czynniki" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Czynniki wpływające</a>
              <a href="#flokulacja" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Metoda flokulacji</a>
              <a href="#mnozniki" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Mnożniki dla serów</a>
              <a href="#kalkulatory" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Kalkulatory</a>
            </div>

            <div className="pt-4 border-t">
              <a href="/poradniki" className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors text-primary">
                <ArrowLeft className="w-4 h-4" />
                Powrót do poradników
              </a>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          {/* Hero Section */}
          <header className="bg-gradient-to-br from-accent/90 to-primary/90 text-primary-foreground border-b border-border">
            <div className="container mx-auto px-4 py-12 md:py-16">
              <div className="mb-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Siła podpuszczki i metoda flokulacji</h1>
                <p className="text-sm text-primary-foreground/90 max-w-3xl">
                  Zrozumienie jednostek IMCU oraz zaawansowanych technik określania momentu cięcia skrzepu dla różnych typów serów.
                </p>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-6">
            <ReactionButton contentType="guide" contentId="sila-podpuszczki" variant="default" />
          </div>

          <div className="container mx-auto px-4 py-8">
            {/* IMCU Section */}
            <section id="imcu" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Międzynarodowa Jednostka Krzepnięcia Mleka (IMCU)</h2>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Co to jest IMCU?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    <strong>IMCU</strong> (International Milk Clotting Unit) to międzynarodowa jednostka określona w normie ISO 11815 (2007). 
                    Jest to znormalizowany sposób mierzenia mocy krzepnięcia enzymu podpuszczki.
                  </p>
                  <Alert>
                    <AlertDescription>
                      <strong>Definicja:</strong> Jedna jednostka krzepnięcia mleka (U) to ilość enzymu podpuszczki, która krzepnie 10 ml odtłuszczonego mleka w proszku w temperaturze 30°C w ciągu 100 sekund.
                    </AlertDescription>
                  </Alert>
                  <p>
                    Podpuszczka komercyjna dostępna jest w różnych mocach: pojedyncza (single), podwójna (double), a czasem potrójna (triple). 
                    <strong> Im wyższa wartość IMCU/ml, tym mocniejsza jest podpuszczka</strong> i tym mniej jej potrzeba do skrzepnięcia tej samej ilości mleka.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Standardy mocy podpuszczki</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <strong>Pojedyncza moc (Single strength):</strong> około 200 IMCU/ml
                      <p className="text-sm text-muted-foreground mt-1">Tradycyjnie 200 ml wystarcza na 1000 kg mleka</p>
                    </div>
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <strong>Podwójna moc (Double strength):</strong> około 240-280 IMCU/ml
                      <p className="text-sm text-muted-foreground mt-1">Potrzeba mniej preparatu na tę samą ilość mleka</p>
                    </div>
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <strong>Potrójna moc (Triple strength):</strong> około 320+ IMCU/ml
                      <p className="text-sm text-muted-foreground mt-1">Najsilniejsza dostępna komercyjnie forma</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-12" />

            {/* Calculations Section */}
            <section id="obliczenia" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Obliczanie potrzebnej ilości podpuszczki</h2>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Wzór obliczeniowy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
                    <p className="font-mono text-lg mb-2">IMCU × 0.01 = litry mleka na 1 ml podpuszczki</p>
                    <p className="text-sm text-muted-foreground">Następnie: Litry mleka ÷ Wynik = ml potrzebnej podpuszczki</p>
                  </div>
                  
                  <div className="space-y-3">
                    <p><strong>Przykład 1:</strong> Podpuszczka 200 IMCU/ml, 10 litrów mleka</p>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>200 × 0.01 = 2 (1 ml krzepnie 2 litry mleka)</li>
                      <li>10 ÷ 2 = 5 ml podpuszczki</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <p><strong>Przykład 2:</strong> Podpuszczka 280 IMCU/ml, 10 litrów mleka</p>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                      <li>280 × 0.01 = 2.8 (1 ml krzepnie 2.8 litra mleka)</li>
                      <li>10 ÷ 2.8 = 3.6 ml podpuszczki</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertDescription>
                  <strong>Ważne:</strong> Czas krzepnięcia wynosi zazwyczaj 30-40 minut dla pełnego "czystego przełamu" (clean break) w temperaturze 30-32°C. 
                  Koagulacja rozpoczyna się już po około 15-20 minutach, ale to nie jest jeszcze optymalny moment do cięcia.
                </AlertDescription>
              </Alert>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-12" />

            {/* Factors Section */}
            <section id="czynniki" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Czynniki wpływające na krzepnięcie</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>pH mleka</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Niższe pH (bardziej kwaśne mleko) przyspiesza krzepnięcie. Dlatego sery wymagające silnego zakwaszenia mogą potrzebować mniej podpuszczki.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Chlorek wapnia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Dodanie CaCl₂ zwiększa ilość rozpuszczalnego wapnia w mleku, co przyspiesza i wzmacnia koagulację. Szczególnie ważne w mleku pasteryzowanym.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Stopień pasteryzacji</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Mleko surowe krzepnie szybciej niż pasteryzowane. Mleko UHT jest praktycznie niemożliwe do użycia w produkcji sera z powodu denaturacji białek.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Typ sera</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Różne sery wymagają różnych czasów krzepnięcia i mocy skrzepu. Twarde sery potrzebują szybszego i mocniejszego skrzepu, miękkie - wolniejszego.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-12" />

            {/* Flocculation Method */}
            <section id="flokulacja" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Metoda flokulacji</h2>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Czym jest metoda flokulacji?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Metoda flokulacji to technika pozwalająca precyzyjnie określić <strong>punkt koagulacji</strong> mleka po dodaniu podpuszczki, 
                    a następnie obliczyć <strong>optymalny czas cięcia skrzepu</strong> dla konkretnego typu sera.
                  </p>
                  <Alert>
                    <AlertDescription>
                      Metoda ta eliminuje zgadywanie i pozwala na powtarzalność procesu, co jest kluczowe dla jakości sera.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    Procedura krok po kroku
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {[
                      { step: "Po zakwaszeniu mleka dodaj podpuszczką zgodnie z przepisem. Uruchom stoper." },
                      { step: "Odczekaj 5 minut, następnie umieść małą, sterylną plastikową miseczkę na powierzchni mleka. Powinna unosić się." },
                      { step: "Delikatnie obróć miseczkę. Jeśli obraca się swobodnie - to jeszcze nie czas. Testuj co 1-2 minuty." },
                      { step: "Około 8-10 minuty zaczniesz odczuwać lekki opór przy obracaniu. Testuj co 30 sekund." },
                      { step: "Między 10 a 15 minutą (czasem dłużej) miseczka \"przyklei się\" - to punkt flokulacji. Zapisz czas." },
                      { step: "Delikatnie zdejmij miseczkę. Nie testuj dalej, aby nie uszkodzić skrzepu." }
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 pt-1 text-sm">
                          {item.step}
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </section>

            {/* Multipliers Table */}
            <section id="mnozniki" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Mnożniki dla różnych typów serów</h2>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Tabela mnożników</CardTitle>
                  <CardDescription>
                    Pomnóż czas flokulacji przez odpowiedni mnożnik, aby uzyskać całkowity czas do cięcia skrzepu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-semibold">Typ sera</th>
                          <th className="text-center p-3 font-semibold">Mnożnik</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { type: "Sery szwajcarskie i alpejskie, Parmezan, Pecorino", factor: "2.0 – 2.5" },
                          { type: "Cheddar z mleka krowiego", factor: "2.5 – 3.0" },
                          { type: "Monterey Jack, Caerphilly", factor: "3.5" },
                          { type: "Feta i sery pleśniowe (niebieskie)", factor: "4.0" },
                          { type: "Camembert i Brie", factor: "5.0 – 6.0" }
                        ].map((row, idx) => (
                          <tr key={idx} className="border-b hover:bg-muted/50">
                            <td className="p-3">{row.type}</td>
                            <td className="p-3 text-center font-semibold">{row.factor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                    <p className="text-sm">
                      <strong>Przykład:</strong> Jeśli flokulacja nastąpiła po 15 minutach i robisz Parmezan (mnożnik 2.5), 
                      to optymalny czas cięcia to 15 × 2.5 = 37.5 minuty od momentu dodania podpuszczki.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertDescription>
                  <strong>Dlaczego różne mnożniki?</strong> Miękkie sery potrzebują delikatniejszego, "starszego" skrzepu (więcej wilgoci), 
                  podczas gdy twarde sery wymagają młodego, mocnego skrzepu, który łatwo oddaje serwatkę.
                </AlertDescription>
              </Alert>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-12" />

            {/* Calculators */}
            <section id="kalkulatory" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Kalkulatory praktyczne</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Rennet Calculator */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Kalkulator dawki podpuszczki
                    </CardTitle>
                    <CardDescription>
                      Oblicz dokładną ilość podpuszczki z opcjonalną korektą dla typu sera
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="milk">Ilość mleka (L)</Label>
                      <Input
                        id="milk"
                        type="number"
                        min="1"
                        step="0.1"
                        value={milkLiters}
                        onChange={(e) => setMilkLiters(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imcu">Moc podpuszczki (IMCU/ml)</Label>
                      <Input
                        id="imcu"
                        type="number"
                        min="50"
                        step="10"
                        value={imcu}
                        onChange={(e) => setImcu(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cheesetyperennet">Docelowy czas cięcia (mnożnik flokulacji)</Label>
                      <select
                        id="cheesetyperennet"
                        className="w-full p-2 border rounded-md bg-background"
                        value={cheeseTypeRennet}
                        onChange={(e) => setCheeseTypeRennet(e.target.value)}
                      >
                        <option value="">Domyślnie (bez korekty)</option>
                        <option value="2.5">Twarde: Szwajcarskie/Parmezan (×2–2,5)</option>
                        <option value="3">Cheddar krowi (×2,5–3)</option>
                        <option value="3.5">Jack / Caerphilly (×3,5)</option>
                        <option value="4">Feta / Blue (×4)</option>
                        <option value="5.5">Camembert / Brie (×5–6)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Wynik (ml)</Label>
                      <div className="p-3 border-2 border-dashed rounded-md bg-muted/50 font-semibold text-lg text-center">
                        {rennetResult}
                      </div>
                    </div>
                    <Alert>
                      <AlertDescription className="text-xs">
                        Kalkulator wykorzystuje zależność <code>1 ml → IMCU×0,01 L</code>. 
                        Pole „mnożnik flokulacji" jest opcjonalne – sygnalizuje, że przy dążeniu do dłuższego czasu 
                        możesz delikatnie skorygować dawkę (ostrożnie, w krokach 5–10%).
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Flocculation Calculator */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Timer className="w-5 h-5" />
                      Kalkulator czasu cięcia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="floctime">Czas flokulacji (minuty):</Label>
                      <Input
                        id="floctime"
                        type="number"
                        min="0"
                        step="0.5"
                        value={flocTime}
                        onChange={(e) => setFlocTime(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cheesetype">Mnożnik dla typu sera:</Label>
                      <select
                        id="cheesetype"
                        className="w-full p-2 border rounded-md bg-background"
                        value={cheeseType}
                        onChange={(e) => setCheeseType(e.target.value)}
                      >
                        <option value="2">2.0 (Parmezan, sery szwajcarskie)</option>
                        <option value="2.5">2.5 (Sery alpejskie)</option>
                        <option value="3">3.0 (Cheddar)</option>
                        <option value="3.5">3.5 (Monterey Jack)</option>
                        <option value="4">4.0 (Feta, pleśniowe)</option>
                        <option value="5">5.0 (Camembert)</option>
                        <option value="6">6.0 (Brie)</option>
                      </select>
                    </div>
                    <Button onClick={calculateCutTime} className="w-full">
                      Oblicz
                    </Button>
                    {cutTimeResult && (
                      <Alert>
                        <AlertDescription>{cutTimeResult}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Summary */}
            <section className="py-12">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle>📋 Podsumowanie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    <strong>Siła podpuszczki</strong> mierzona jest w jednostkach IMCU - im wyższa wartość, tym mocniejsza podpuszczka 
                    i tym mniej jej potrzeba.
                  </p>
                  <p>
                    <strong>Obliczanie dawki:</strong> IMCU × 0.01 daje liczbę litrów mleka, które skrzepnie 1 ml podpuszczki. 
                    Podziel swoją ilość mleka przez ten wynik.
                  </p>
                  <p>
                    <strong>Metoda flokulacji</strong> eliminuje zgadywanie i pozwala precyzyjnie określić moment koagulacji, 
                    a następnie obliczyć optymalny czas cięcia dla danego typu sera.
                  </p>
                  <p>
                    <strong>Czynniki modyfikujące:</strong> pH mleka, zawartość wapnia, stopień pasteryzacji i typ sera wpływają 
                    na czas i jakość krzepnięcia.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Back button */}
            <div className="py-8 text-center">
              <a
                href="/poradniki"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Powrót do poradników
              </a>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default SilaPodpuszczki;
