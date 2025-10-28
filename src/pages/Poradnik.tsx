import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import poradnikMainHeaderImage from "@/assets/poradnik-main-header.webp";
import ReactionButton from "@/components/ReactionButton";

const Poradnik = () => {
  useEffect(() => {
    document.title = "Poradnik dla serowarów | Start";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Praktyczny poradnik serowarski dla serowarów rzemieślników i rolników: higiena, mleko, kultury, proces, dojrzewanie, błędy i kalkulatory.");
    }
  }, []);

  // Calculator states
  const [waterAmount, setWaterAmount] = useState(10);
  const [saltConcentration, setSaltConcentration] = useState(20);
  const [brineResult, setBrineResult] = useState("");
  const [milkLiters, setMilkLiters] = useState(50);
  const [caclResult, setCaclResult] = useState("");

  const calculateBrine = () => {
    if (!waterAmount || !saltConcentration) {
      setBrineResult("Uzupełnij dane.");
      return;
    }
    const salt = waterAmount * (saltConcentration / 100);
    setBrineResult(`Sól: ${salt.toFixed(2)} kg (≈ ${(salt * 1000).toFixed(0)} g) na ${waterAmount} kg wody`);
  };

  const calculateCaCl = () => {
    if (!milkLiters) {
      setCaclResult("Uzupełnij litry.");
      return;
    }
    const min = milkLiters * 0.2;
    const max = milkLiters * 0.3;
    setCaclResult(`Zakres: ${min.toFixed(0)}–${max.toFixed(0)} g czystego CaCl₂ (lub odpowiednia ilość roztworu 30–33%).`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Sidebar Navigation */}
      <div className="pt-20 flex">
        <aside className="hidden lg:block w-64 border-r border-border bg-card/50 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold">🧀 Poradnik Serowarski</h3>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Nawigacja</p>
              <a href="#sekcja-start" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Start</a>
              <a href="#sekcja-proces" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Proces</a>
              <a href="#sekcja-temperatury" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Zakresy temperatur</a>
              <a href="#sekcja-higiena" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Higiena</a>
              <a href="#sekcja-dojrzewanie" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Dojrzewanie</a>
              <a href="#sekcja-narzedzia" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Sprzęt</a>
              <a href="#sekcja-kalkulatory" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Kalkulatory</a>
              <a href="#sekcja-bledy" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Błędy</a>
              <a href="#sekcja-mleko" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Mleko</a>
              <a href="#sekcja-materialy" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">Materiały</a>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Podstrony</p>
              <a href="/baza-kultur" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">🧫 Kultury bakteryjne</a>
              <a href="/przepisy" className="block py-2 px-3 rounded-md hover:bg-primary/10 text-sm font-medium transition-colors">🍶 Przepisy</a>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          {/* Hero Section */}
          <header className="relative border-b border-border py-12 md:py-16 overflow-hidden">
            <img
              src={poradnikMainHeaderImage}
              alt="Poradnik dla serowarów"
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/90" />
            <div className="container mx-auto px-4 relative z-10 text-primary-foreground">
              <div className="mb-4">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Poradnik dla serowarów i rolników rozpoczynających wytwarzanie sera</h1>
                <p className="text-sm text-primary-foreground/90 max-w-3xl">Praktyka + nauka: higiena, mleko, kultury, obróbka ziarna, solenie, dojrzewanie, kontrola jakości. Opracowane na bazie klasycznej literatury i doświadczeń rzemieślniczych.</p>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-6">
            <ReactionButton contentType="guide" contentId="poradnik" variant="default" />
          </div>

          <div className="container mx-auto px-4 py-8">
            {/* Od czego zacząć */}
            <section id="sekcja-start" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Od czego zacząć (dla rolników)</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>1) Mleko i stado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Zdrowe krowy/owce/kozy, czysta obora, przewietrzanie, słońce.</li>
                      <li>• Szybkie chłodzenie po udoju, czyste naczynia, dostawa bez zwłoki.</li>
                      <li>• Cel: <strong>niskie obciążenie bakteryjne</strong> i stabilna zawartość białka/tłuszczu.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>2) Wybór 1–2 typów sera na start</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Specjalizacja podnosi jakość i powtarzalność. Zacznij od jednego miękkiego (np. camembert) i jednego półtwardego (np. gouda/tylżycki).</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>3) Higiena i organizacja</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Wydziel strefy: odbiór i podgrzew mleka, obróbka skrzepu, ociekalnia, solarnia, dojrzewalnia. Posadzki zmywalne, ściany bielone, woda w obfitości.</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>4) Sprzęt i rejestry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Termometry, pH/kwasomierz, harfy do cięcia, formy, prasa, basen solankowy, regały dojrzewalnicze. Prowadź zapisy partii: mleko, kultury, czasy, temperatury.</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 p-4 bg-primary/10 border-l-4 border-primary rounded-md">
                <p className="text-sm">💡 <strong>Zasada nadrzędna:</strong> dojrzewanie sera steruje <em>czysta fermentacja mlekowa</em>. Twoje zadanie to przygotować dla niej idealne warunki (kwasowość, temperatura, wilgotność).</p>
              </div>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-12" />

            {/* Proces technologiczny */}
            <section id="sekcja-proces" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Pełny proces technologiczny – od mleka do sera</h2>
              <ol className="space-y-6">
                {[
                  { step: "Ocena i przygotowanie mleka", desc: "→ filtracja, ewentualna pasteryzacja łagodna, schłodzenie do temperatury zaszczepienia." },
                  { step: "Zaszczepienie kulturami", desc: "i krótkie dojrzewanie mleka." },
                  { step: "Dodanie podpuszczki", desc: "i tworzenie skrzepu." },
                  { step: "Cięcie skrzepu", desc: "do pożądanej wielkości ziarna, delikatne mieszanie." },
                  { step: "Dogrzewanie", desc: "(w zależności od typu sera) i osuszanie ziarna." },
                  { step: "Formowanie i prasowanie", desc: "(odwracanie, ociekanie)." },
                  { step: "Solenie", desc: "– w solance 18–22% lub solenie w masie." },
                  { step: "Dojrzewanie", desc: "– kontrola temperatury, wilgotności, mikroflory i pielęgnacji." }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <strong>{item.step}</strong> {item.desc}
                    </div>
                  </li>
                ))}
              </ol>
              <p className="text-sm text-muted-foreground mt-6">Wskazówka: w twardych serach szwajcarskich dogrzewanie bywa wysokie (ok. 50–57°C), w serach miękkich jest minimalne (ok. 32–36°C). Sery parzone/zwarowe wykorzystują bardzo wysokie temperatury przy obróbce masy lub serwatki.</p>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-12" />

            {/* Zakresy temperatur */}
            <section id="sekcja-temperatury" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Zakresy temperatur podgrzewania ziarna</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { emoji: "🧊", label: "Sery kwaśne", types: "Twaróg, Gomółki", temp: "30–40°C", color: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800" },
                  { emoji: "🥛", label: "Sery miękkie", types: "Camembert, Brie", temp: "32–36°C", color: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" },
                  { emoji: "🧀", label: "Sery półtwarde", types: "Tylżycki, Gouda", temp: "38–45°C", color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800" },
                  { emoji: "⚙️", label: "Sery twarde", types: "Ementalski, Grana/Parmezan", temp: "50–57°C", color: "bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800" },
                  { emoji: "🔥", label: "Sery parzone i zwarowe", types: "Oscypek, Ricotta", temp: "70–90°C", color: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800" }
                ].map((badge, idx) => (
                  <div key={idx} className={`${badge.color} border rounded-lg p-4 flex items-start gap-3`}>
                    <div className="text-2xl flex-shrink-0">{badge.emoji}</div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">{badge.label}</div>
                      <div className="text-xs opacity-80">{badge.types}</div>
                      <div className="text-sm font-semibold mt-1">{badge.temp}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-6">Temperatura reguluje: zawartość wody (teksturę), tempo fermentacji, rozwój właściwej mikroflory oraz bezpieczeństwo produktu.</p>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-12" />

            {/* Higiena */}
            <section id="sekcja-higiena" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Higiena i organizacja serowni</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Strefy pracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Odbiór i przygotowanie mleka (18–20°C w pomieszczeniu).</li>
                      <li>• Przeróbka i formowanie – czystość, bieżąca woda, zmywalne powierzchnie.</li>
                      <li>• Ociekalnia i solarnia – kontrola temperatury i ruchu powietrza.</li>
                      <li>• Dojrzewalnia/piwnica – zwykle 10–15°C, wysoka wilgotność 80–90%.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Codzienne praktyki</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Mycie i dezynfekcja sprzętu, praca w czystych fartuchach i czepkach.</li>
                      <li>• Woda w obfitości, oddzielne zlewy do mleka i do ogólnych prac.</li>
                      <li>• Rejestry temperatur, pH/kwasowości, partii mleka i kultur.</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-12" />

            {/* Dojrzewanie */}
            <section id="sekcja-dojrzewanie" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Dojrzewanie – sedno jakości</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Zasady</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Regularne obracanie, mycie/nacieranie wg typu sera.</li>
                      <li>• Wilgotność: 80–90%; Temperatura: zwykle 10–15°C (miękkie często chłodniej na start).</li>
                      <li>• Kontroluj zapach: czysta nuta mleczna → orzech/masło → złożony bukiet.</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Przykłady</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Cheddar:</strong> solenie w masie, parafinowanie możliwe, 4–6 mies.</li>
                      <li>• <strong>Ementalski:</strong> wysoka obróbka cieplna, oczka propionowe, długie dojrzewanie.</li>
                      <li>• <strong>Camembert/Brie:</strong> dojrzewanie od powierzchni do środka, wysoka wilgotność.</li>
                      <li>• <strong>Roquefort/Gorgonzola:</strong> mikroklimat i Penicillium, przewiew.</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-12" />

            {/* Sprzęt */}
            <section id="sekcja-narzedzia" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Sprzęt podstawowy</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {[
                  { title: "Kontrola", desc: "Termometry, pH/kwasomierz, refraktometr, waga precyzyjna." },
                  { title: "Obróbka", desc: "Kocioł/gar, mieszadła, harp/lyra, noże do ziarna, czerpaki, formy i maty." },
                  { title: "Prasowanie", desc: "Prasa ręczna/hydrauliczna, gazety/maty serowarskie, odwracaki." },
                  { title: "Solanka", desc: "Wanna z pokrywą, aeracja/filtr, termometr i areometr do NaCl." },
                  { title: "Dojrzewalnia", desc: "Regały, higrometry, nawilżacze/odwilżacze, myjki do skórki." }
                ].map((tool, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-base">{tool.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{tool.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-12" />

            {/* Kalkulatory */}
            <section id="sekcja-kalkulatory" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Kalkulatory</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Solanka 18–22%</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="water">Masa wody (kg lub L):</Label>
                      <Input
                        id="water"
                        type="number"
                        min="0"
                        step="0.1"
                        value={waterAmount}
                        onChange={(e) => setWaterAmount(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="concentration">Stężenie soli (%):</Label>
                      <Input
                        id="concentration"
                        type="number"
                        min="10"
                        max="26"
                        step="0.5"
                        value={saltConcentration}
                        onChange={(e) => setSaltConcentration(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <Button onClick={calculateBrine} className="w-full">
                      Oblicz
                    </Button>
                    {brineResult && (
                      <p className="text-sm text-muted-foreground mt-2">{brineResult}</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Chlorek wapnia (CaCl₂)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="milk">Mleko (L):</Label>
                      <Input
                        id="milk"
                        type="number"
                        min="1"
                        step="1"
                        value={milkLiters}
                        onChange={(e) => setMilkLiters(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Zalecenie: 0,2–0,3 g CaCl₂ na 1 L mleka (roztwór 30–33%).
                    </p>
                    <Button onClick={calculateCaCl} className="w-full">
                      Oblicz
                    </Button>
                    {caclResult && (
                      <p className="text-sm text-muted-foreground mt-2">{caclResult}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-12" />

            {/* Błędy */}
            <section id="sekcja-bledy" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Typowe błędy i szybkie naprawy</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { 
                    title: "Wzdęcia/gazy", 
                    desc: "Za wysoka temp. lub zanieczyszczenia masłowe. Rozwiązanie: czystość, właściwe startery, korekta temperatur i szybsze odprowadzanie serwatki; w ostateczności korekta solą/temperaturą." 
                  },
                  { 
                    title: "Gumowatość / zbyt suchy miąższ", 
                    desc: "Za małe ziarno + agresywne dogrzewanie. Rozwiązanie: większe ziarno, łagodniejsze mieszanie, niższa temperatura." 
                  },
                  { 
                    title: "Miękka, rozpływająca struktura", 
                    desc: "Zbyt wczesne krojenie, słaby skrzep, nadmierna wilgotć. Rozwiązanie: wydłuż koagulację, dołóż CaCl₂, dłuższe osuszanie, mocniejsze prasowanie." 
                  },
                  { 
                    title: "Gorzkawy posmak", 
                    desc: "Proteoliza niekontrolowana lub nadmiar podpuszczki. Rozwiązanie: korekta dawek, właściwa temperatura i czas dojrzewania, higiena." 
                  }
                ].map((error, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-base">{error.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{error.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-12" />

            {/* Mleko */}
            <section id="sekcja-mleko" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Mleko – wymagania surowcowe</h2>
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-2 text-sm">
                    <li>• Świeże, czyste mikrobiologicznie; szybkie chłodzenie po udoju.</li>
                    <li>• Stały poziom białka i tłuszczu ułatwia powtarzalność wyrobu.</li>
                    <li>• Dostawa do serowni bez zbędnego magazynowania „na ciepło".</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-12" />

            {/* Materiały */}
            <section id="sekcja-materialy" className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Materiały do nauki i praktyki</h2>
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-2 text-sm">
                    <li>• Notatnik partii: daty, mleko (L), kultury, pH/kwasowość, temperatury, czasy, uwagi.</li>
                    <li>• Karty technologiczne dla każdego sera – gotowe do eksportu do PDF.</li>
                    <li>• Zdjęcia etapów produkcji – własne przykłady pomagają diagnozować.</li>
                  </ul>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Poradnik;
