import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import ReactionButton from "@/components/ReactionButton";

interface CheeseNutrition {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  saturatedFat: number;
  carbs: number;
  calcium: number;
  sodium: number;
}

const cheeseDatabase: Record<string, CheeseNutrition> = {
  cheddar: {
    name: 'Cheddar',
    calories: 403,
    protein: 25,
    fat: 33,
    saturatedFat: 21,
    carbs: 1.3,
    calcium: 721,
    sodium: 621
  },
  mozzarella: {
    name: 'Mozzarella',
    calories: 280,
    protein: 22,
    fat: 17,
    saturatedFat: 11,
    carbs: 3.1,
    calcium: 505,
    sodium: 373
  },
  parmezan: {
    name: 'Parmezan',
    calories: 431,
    protein: 35,
    fat: 29,
    saturatedFat: 19,
    carbs: 4.1,
    calcium: 1184,
    sodium: 1529
  },
  gouda: {
    name: 'Gouda',
    calories: 356,
    protein: 25,
    fat: 27,
    saturatedFat: 17,
    carbs: 2.2,
    calcium: 700,
    sodium: 819
  },
  brie: {
    name: 'Brie',
    calories: 334,
    protein: 21,
    fat: 28,
    saturatedFat: 18,
    carbs: 0.5,
    calcium: 184,
    sodium: 629
  },
  feta: {
    name: 'Feta',
    calories: 264,
    protein: 14,
    fat: 21,
    saturatedFat: 15,
    carbs: 4.1,
    calcium: 493,
    sodium: 1116
  },
  twarog: {
    name: 'Twaróg półtłusty',
    calories: 155,
    protein: 18,
    fat: 9,
    saturatedFat: 5,
    carbs: 2.7,
    calcium: 87,
    sodium: 380
  },
  oscypek: {
    name: 'Oscypek',
    calories: 374,
    protein: 23,
    fat: 30,
    saturatedFat: 19,
    carbs: 1.8,
    calcium: 650,
    sodium: 890
  },
  emmental: {
    name: 'Emmental',
    calories: 380,
    protein: 29,
    fat: 27,
    saturatedFat: 16,
    carbs: 3.4,
    calcium: 1029,
    sodium: 450
  },
  camembert: {
    name: 'Camembert',
    calories: 300,
    protein: 20,
    fat: 24,
    saturatedFat: 15,
    carbs: 0.5,
    calcium: 388,
    sodium: 842
  }
};

interface SelectedCheese {
  cheese: CheeseNutrition;
  amount: number;
}

const PorownanieWartosciOdzywczych = () => {
  const [cheese1, setCheese1] = useState<string>("");
  const [cheese2, setCheese2] = useState<string>("");
  const [cheese3, setCheese3] = useState<string>("");
  const [amount1, setAmount1] = useState<number>(100);
  const [amount2, setAmount2] = useState<number>(100);
  const [amount3, setAmount3] = useState<number>(100);
  const [comparedCheeses, setComparedCheeses] = useState<SelectedCheese[]>([]);

  useEffect(() => {
    document.title = "Kalkulator Porównania Wartości Odżywczych Serów | Serowar.pl";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Porównaj wartości odżywcze różnych rodzajów serów. Kalkulator umożliwia porównanie do 3 serów jednocześnie z dokładną analizą składników odżywczych."
      );
    }
  }, []);

  const handleCompare = () => {
    const selections: SelectedCheese[] = [];
    
    if (cheese1 && cheeseDatabase[cheese1]) {
      selections.push({ cheese: cheeseDatabase[cheese1], amount: amount1 });
    }
    if (cheese2 && cheeseDatabase[cheese2]) {
      selections.push({ cheese: cheeseDatabase[cheese2], amount: amount2 });
    }
    if (cheese3 && cheeseDatabase[cheese3]) {
      selections.push({ cheese: cheeseDatabase[cheese3], amount: amount3 });
    }

    if (selections.length === 0) {
      alert('Wybierz co najmniej jeden ser do porównania!');
      return;
    }

    setComparedCheeses(selections);
  };

  const CheeseCard = ({ cheese, amount }: { cheese: CheeseNutrition; amount: number }) => {
    const ratio = amount / 100;
    
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {cheese.name}
          </CardTitle>
          <CardDescription className="text-base">
            Porcja: {amount}g
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center p-3 rounded-md bg-secondary/50">
            <span className="font-semibold text-foreground">Kalorie:</span>
            <span className="font-bold text-primary">{(cheese.calories * ratio).toFixed(0)} kcal</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-md bg-muted">
            <span className="font-semibold text-foreground">Białko:</span>
            <span className="font-bold text-primary">{(cheese.protein * ratio).toFixed(1)} g</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-md bg-secondary/50">
            <span className="font-semibold text-foreground">Tłuszcze:</span>
            <span className="font-bold text-primary">{(cheese.fat * ratio).toFixed(1)} g</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-md bg-muted">
            <span className="font-semibold text-foreground">Tł. nasycone:</span>
            <span className="font-bold text-primary">{(cheese.saturatedFat * ratio).toFixed(1)} g</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-md bg-secondary/50">
            <span className="font-semibold text-foreground">Węglowodany:</span>
            <span className="font-bold text-primary">{(cheese.carbs * ratio).toFixed(1)} g</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-md bg-muted">
            <span className="font-semibold text-foreground">Wapń:</span>
            <span className="font-bold text-primary">{(cheese.calcium * ratio).toFixed(0)} mg</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-md bg-secondary/50">
            <span className="font-semibold text-foreground">Sód:</span>
            <span className="font-bold text-primary">{(cheese.sodium * ratio).toFixed(0)} mg</span>
          </div>
          
          <div className="mt-4 p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
            <p className="text-sm font-semibold mb-1">% dziennego zapotrzebowania (na 2000 kcal):</p>
            <p className="text-sm">
              Wapń: <span className="font-bold">{((cheese.calcium * ratio / 1000) * 100).toFixed(0)}%</span> | 
              Białko: <span className="font-bold">{((cheese.protein * ratio / 50) * 100).toFixed(0)}%</span>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const cheeseOptions = Object.keys(cheeseDatabase);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <Link to="/poradniki" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót do Poradników
        </Link>

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="mb-6">
              <ReactionButton contentType="guide" contentId="porownawie-wartosci-odzywczych" variant="default" />
            </div>
            <div className="mb-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                🧀 Kalkulator Porównania Wartości Odżywczych Serów
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Porównaj wartości odżywcze różnych rodzajów serów i wybierz najlepszy dla swojej diety
              </p>
            </div>
          </div>

          {/* Intro Section */}
          <Card className="mb-8 border-l-4 border-primary">
            <CardHeader>
              <CardTitle>Jak korzystać z kalkulatora?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                Nasz kalkulator umożliwia szczegółowe porównanie wartości odżywczych różnych serów. Dzięki niemu możesz:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Porównać do 3 rodzajów serów jednocześnie</li>
                <li>Określić dokładną ilość sera w gramach</li>
                <li>Sprawdzić wartości kaloryczne, białko, tłuszcze i węglowodany</li>
                <li>Poznać zawartość wapnia i sodu</li>
                <li>Podjąć świadomą decyzję żywieniową</li>
              </ul>
            </CardContent>
          </Card>

          {/* Calculator Section */}
          <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Porównaj Sery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* Cheese Selector 1 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Ser #1</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cheese1">Wybierz ser:</Label>
                      <Select value={cheese1} onValueChange={setCheese1}>
                        <SelectTrigger id="cheese1" className="mt-2">
                          <SelectValue placeholder="-- Wybierz ser --" />
                        </SelectTrigger>
                        <SelectContent>
                          {cheeseOptions.map(key => (
                            <SelectItem key={key} value={key}>
                              {cheeseDatabase[key].name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount1">Ilość (g):</Label>
                      <Input
                        id="amount1"
                        type="number"
                        min="1"
                        max="1000"
                        value={amount1}
                        onChange={(e) => setAmount1(Number(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Cheese Selector 2 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Ser #2</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cheese2">Wybierz ser:</Label>
                      <Select value={cheese2} onValueChange={setCheese2}>
                        <SelectTrigger id="cheese2" className="mt-2">
                          <SelectValue placeholder="-- Wybierz ser --" />
                        </SelectTrigger>
                        <SelectContent>
                          {cheeseOptions.map(key => (
                            <SelectItem key={key} value={key}>
                              {cheeseDatabase[key].name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount2">Ilość (g):</Label>
                      <Input
                        id="amount2"
                        type="number"
                        min="1"
                        max="1000"
                        value={amount2}
                        onChange={(e) => setAmount2(Number(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Cheese Selector 3 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Ser #3</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cheese3">Wybierz ser:</Label>
                      <Select value={cheese3} onValueChange={setCheese3}>
                        <SelectTrigger id="cheese3" className="mt-2">
                          <SelectValue placeholder="-- Wybierz ser --" />
                        </SelectTrigger>
                        <SelectContent>
                          {cheeseOptions.map(key => (
                            <SelectItem key={key} value={key}>
                              {cheeseDatabase[key].name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount3">Ilość (g):</Label>
                      <Input
                        id="amount3"
                        type="number"
                        min="1"
                        max="1000"
                        value={amount3}
                        onChange={(e) => setAmount3(Number(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button 
                onClick={handleCompare} 
                className="w-full text-lg py-6"
                size="lg"
              >
                Porównaj Wartości Odżywcze
              </Button>

              {/* Results */}
              {comparedCheeses.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold mb-6 text-center">Wyniki Porównania</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {comparedCheeses.map((item, index) => (
                      <CheeseCard key={index} cheese={item.cheese} amount={item.amount} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Sections */}
          <div className="space-y-8">
            <Card className="border-l-4 border-primary">
              <CardHeader>
                <CardTitle className="text-2xl">📊 Wartości Odżywcze Serów - Kompletny Przewodnik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Ser to produkt mleczny o bogatym składzie odżywczym, który stanowi doskonałe źródło białka, wapnia i witamin z grupy B. Jednak różne rodzaje serów znacząco różnią się zawartością kalorii, tłuszczów i składników mineralnych.
                </p>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Kluczowe składniki odżywcze w serze:</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Kalorie:</strong> Zawartość energetyczna różni się w zależności od rodzaju sera - od około 98 kcal/100g w twarogu do ponad 400 kcal/100g w parmezanie</li>
                    <li><strong className="text-foreground">Białko:</strong> Sery są doskonałym źródłem pełnowartościowego białka (15-35g/100g), zawierającego wszystkie niezbędne aminokwasy</li>
                    <li><strong className="text-foreground">Tłuszcze:</strong> Zawartość tłuszczu waha się od 4g/100g w twarogu chudym do 35g/100g w serach typu cheddar</li>
                    <li><strong className="text-foreground">Wapń:</strong> Ser to jedno z najlepszych źródeł wapnia - od 200mg do ponad 1000mg/100g</li>
                    <li><strong className="text-foreground">Sód:</strong> Ważny element do kontroli, szczególnie w serach solankowych jak feta (do 1500mg/100g)</li>
                  </ul>
                </div>

                <div className="bg-primary/10 border-l-4 border-primary p-4 rounded">
                  <p className="text-sm">
                    <strong>Wskazówka żywieniowa:</strong> Sery dojrzewające (parmezan, cheddar) zawierają mniej laktozy niż sery świeże, co czyni je lepszym wyborem dla osób z nietolerancją laktozy.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-primary">
              <CardHeader>
                <CardTitle className="text-2xl">🥇 Ranking Serów Pod Względem Wartości Odżywczych</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Najlepsze źródła wapnia (mg/100g):</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-primary text-primary-foreground">
                          <th className="p-3 text-left">Rodzaj sera</th>
                          <th className="p-3 text-left">Zawartość wapnia</th>
                          <th className="p-3 text-left">% dziennego zapotrzebowania</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-secondary/30 transition-colors">
                          <td className="p-3">Parmezan</td>
                          <td className="p-3 font-semibold">1184 mg</td>
                          <td className="p-3 font-semibold text-primary">118%</td>
                        </tr>
                        <tr className="border-b hover:bg-secondary/30 transition-colors">
                          <td className="p-3">Emmental</td>
                          <td className="p-3 font-semibold">1029 mg</td>
                          <td className="p-3 font-semibold text-primary">103%</td>
                        </tr>
                        <tr className="border-b hover:bg-secondary/30 transition-colors">
                          <td className="p-3">Cheddar</td>
                          <td className="p-3 font-semibold">721 mg</td>
                          <td className="p-3 font-semibold text-primary">72%</td>
                        </tr>
                        <tr className="border-b hover:bg-secondary/30 transition-colors">
                          <td className="p-3">Gouda</td>
                          <td className="p-3 font-semibold">700 mg</td>
                          <td className="p-3 font-semibold text-primary">70%</td>
                        </tr>
                        <tr className="border-b hover:bg-secondary/30 transition-colors">
                          <td className="p-3">Oscypek</td>
                          <td className="p-3 font-semibold">650 mg</td>
                          <td className="p-3 font-semibold text-primary">65%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Sery o najniższej zawartości kalorii (kcal/100g):</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-primary text-primary-foreground">
                          <th className="p-3 text-left">Rodzaj sera</th>
                          <th className="p-3 text-left">Kalorie</th>
                          <th className="p-3 text-left">Tłuszcz</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-secondary/30 transition-colors">
                          <td className="p-3">Twaróg chudy</td>
                          <td className="p-3 font-semibold">72 kcal</td>
                          <td className="p-3">0.3 g</td>
                        </tr>
                        <tr className="border-b hover:bg-secondary/30 transition-colors">
                          <td className="p-3">Twaróg półtłusty</td>
                          <td className="p-3 font-semibold">155 kcal</td>
                          <td className="p-3">9 g</td>
                        </tr>
                        <tr className="border-b hover:bg-secondary/30 transition-colors">
                          <td className="p-3">Mozzarella light</td>
                          <td className="p-3 font-semibold">254 kcal</td>
                          <td className="p-3">16 g</td>
                        </tr>
                        <tr className="border-b hover:bg-secondary/30 transition-colors">
                          <td className="p-3">Feta</td>
                          <td className="p-3 font-semibold">264 kcal</td>
                          <td className="p-3">21 g</td>
                        </tr>
                        <tr className="border-b hover:bg-secondary/30 transition-colors">
                          <td className="p-3">Camembert</td>
                          <td className="p-3 font-semibold">300 kcal</td>
                          <td className="p-3">24 g</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-primary">
              <CardHeader>
                <CardTitle className="text-2xl">💪 Sery w Diecie - Wskazówki Praktyczne</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Dla osób na diecie redukcyjnej:</h3>
                  <p className="text-muted-foreground mb-2">Najlepszym wyborem będą sery o niskiej zawartości tłuszczu:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Twaróg chudy lub półtłusty</strong> - wysokie białko, niskie kalorie</li>
                    <li><strong className="text-foreground">Mozzarella light</strong> - uniwersalny ser do potraw</li>
                    <li><strong className="text-foreground">Feta</strong> - intensywny smak, więc potrzeba mniejszej ilości</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Dla sportowców i osób aktywnych:</h3>
                  <p className="text-muted-foreground mb-2">Sery bogate w białko wspierają regenerację mięśni:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Parmezan</strong> - 35g białka/100g</li>
                    <li><strong className="text-foreground">Emmental</strong> - 29g białka/100g</li>
                    <li><strong className="text-foreground">Cheddar</strong> - 25g białka/100g</li>
                    <li><strong className="text-foreground">Gouda</strong> - 25g białka/100g</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Dla zdrowia kości:</h3>
                  <p className="text-muted-foreground mb-2">Sery twarde i dojrzewające dostarczają najwięcej wapnia:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Parmezan</strong> - absolutny mistrz w zawartości wapnia</li>
                    <li><strong className="text-foreground">Emmental</strong> - tradycyjny szwajcarski ser bogaty w wapń</li>
                    <li><strong className="text-foreground">Oscypek</strong> - polski ser regionalny z wysoką zawartością wapnia</li>
                  </ul>
                </div>

                <div className="bg-primary/10 border-l-4 border-primary p-4 rounded">
                  <p className="text-sm">
                    <strong>Uwaga dla osób z nadciśnieniem:</strong> Unikaj serów o wysokiej zawartości sodu jak feta (1500mg/100g), ser pleśniowy czy sery topione. Wybieraj sery świeże i naturalne.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-primary">
              <CardHeader>
                <CardTitle className="text-2xl">❓ Najczęściej Zadawane Pytania</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Który ser jest najzdrowszy?</h3>
                  <p className="text-muted-foreground">
                    Nie ma jednoznacznej odpowiedzi - wybór zależy od indywidualnych potrzeb żywieniowych. Dla osób na diecie najlepszy będzie twaróg chudy, dla sportowców - parmezan, a dla dzieci - gouda lub emmental (wysoka zawartość wapnia).
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Ile sera można jeść dziennie?</h3>
                  <p className="text-muted-foreground">
                    Zalecana porcja sera to 30-50g dziennie. Osoby aktywne fizycznie mogą spożywać więcej, natomiast osoby z nadwagą powinny ograniczyć spożycie do 30g dziennie.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Czy ser podnosi cholesterol?</h3>
                  <p className="text-muted-foreground">
                    Sery zawierają tłuszcze nasycone, które w nadmiarze mogą podnosić poziom cholesterolu. Kluczem jest umiar - spożywanie sera w rozsądnych ilościach (30-50g/dzień) nie powinno negatywnie wpływać na profil lipidowy.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Które sery są najlepsze dla dzieci?</h3>
                  <p className="text-muted-foreground">
                    Dla dzieci polecane są sery bogate w wapń i białko: gouda, emmental, mozzarella oraz twaróg. Należy unikać serów pleśniowych i bardzo dojrzałych ze względu na intensywny smak i wyższą zawartość histaminy.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Czy osoby z nietolerancją laktozy mogą jeść ser?</h3>
                  <p className="text-muted-foreground">
                    Tak! Sery dojrzewające i twarde (parmezan, cheddar, gouda) zawierają bardzo mało laktozy, ponieważ podczas dojrzewania laktoza jest rozkładana przez bakterie. Im dłużej dojrzewający ser, tym mniej laktozy.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-primary">
              <CardHeader>
                <CardTitle className="text-2xl">🍽️ Jak Używać Serów w Kuchni</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Sery do gotowania i pieczenia:</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Mozzarella</strong> - pizza, zapiekanki, lasagne (dobrze się topi)</li>
                    <li><strong className="text-foreground">Cheddar</strong> - burgery, macaroni & cheese, sosy serowe</li>
                    <li><strong className="text-foreground">Parmezan</strong> - pasta, risotto, posypka do potraw</li>
                    <li><strong className="text-foreground">Gouda</strong> - tarty, fondue, zapiekanki</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Sery na desku serów:</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Brie</strong> - ser miękki, śmietankowy</li>
                    <li><strong className="text-foreground">Camembert</strong> - ser o intensywnym smaku</li>
                    <li><strong className="text-foreground">Cheddar</strong> - ser twardy, wyrazisty</li>
                    <li><strong className="text-foreground">Gouda</strong> - ser półtwardy, łagodny</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Sery do kanapek i sałatek:</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Feta</strong> - sałatka grecka, zapiekanki</li>
                    <li><strong className="text-foreground">Mozzarella</strong> - sałatka caprese, kanapki</li>
                    <li><strong className="text-foreground">Oscypek</strong> - na grilla, do pierogów</li>
                    <li><strong className="text-foreground">Twaróg</strong> - do past kanapkowych, naleśników</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PorownanieWartosciOdzywczych;
