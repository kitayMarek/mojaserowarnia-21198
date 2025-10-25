import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";

interface CheeseNutrition {
  name: string;
  calories: number;
  protein: number;
  totalFat: number;
  saturatedFat: number;
  carbs: number;
  calcium: number;
  sodium: number;
  cholesterol: number;
}

const cheeseDatabase: CheeseNutrition[] = [
  {
    name: "Parmezan",
    calories: 431,
    protein: 38.5,
    totalFat: 28.6,
    saturatedFat: 18.1,
    carbs: 3.2,
    calcium: 1184,
    sodium: 1602,
    cholesterol: 88
  },
  {
    name: "Cheddar",
    calories: 403,
    protein: 24.9,
    totalFat: 33.1,
    saturatedFat: 21.1,
    carbs: 1.3,
    calcium: 721,
    sodium: 621,
    cholesterol: 105
  },
  {
    name: "Mozzarella (pełnotłusta)",
    calories: 300,
    protein: 22.2,
    totalFat: 22.4,
    saturatedFat: 13.2,
    carbs: 2.2,
    calcium: 505,
    sodium: 627,
    cholesterol: 79
  },
  {
    name: "Mozzarella (częściowo odtłuszczona)",
    calories: 254,
    protein: 24.3,
    totalFat: 15.9,
    saturatedFat: 9.8,
    carbs: 3.1,
    calcium: 782,
    sodium: 619,
    cholesterol: 54
  },
  {
    name: "Brie",
    calories: 334,
    protein: 20.8,
    totalFat: 27.7,
    saturatedFat: 17.4,
    carbs: 0.5,
    calcium: 184,
    sodium: 629,
    cholesterol: 100
  },
  {
    name: "Camembert",
    calories: 300,
    protein: 19.8,
    totalFat: 24.3,
    saturatedFat: 15.3,
    carbs: 0.5,
    calcium: 388,
    sodium: 842,
    cholesterol: 72
  },
  {
    name: "Feta",
    calories: 264,
    protein: 14.2,
    totalFat: 21.3,
    saturatedFat: 14.9,
    carbs: 4.1,
    calcium: 493,
    sodium: 1116,
    cholesterol: 89
  },
  {
    name: "Ser szwajcarski",
    calories: 380,
    protein: 26.9,
    totalFat: 27.8,
    saturatedFat: 17.8,
    carbs: 5.4,
    calcium: 791,
    sodium: 192,
    cholesterol: 92
  },
  {
    name: "Ser kozi",
    calories: 364,
    protein: 21.6,
    totalFat: 29.8,
    saturatedFat: 20.6,
    carbs: 2.5,
    calcium: 298,
    sodium: 515,
    cholesterol: 79
  },
  {
    name: "Ser pleśniowy (Blue cheese)",
    calories: 353,
    protein: 21.4,
    totalFat: 28.7,
    saturatedFat: 18.7,
    carbs: 2.3,
    calcium: 528,
    sodium: 1395,
    cholesterol: 75
  },
  {
    name: "Twarożek (tłusty)",
    calories: 98,
    protein: 11.1,
    totalFat: 4.3,
    saturatedFat: 2.8,
    carbs: 3.4,
    calcium: 83,
    sodium: 364,
    cholesterol: 17
  },
  {
    name: "Twarożek (chudy)",
    calories: 72,
    protein: 12.4,
    totalFat: 1.0,
    saturatedFat: 0.7,
    carbs: 2.7,
    calcium: 86,
    sodium: 406,
    cholesterol: 4
  },
  {
    name: "Ser kremowy (Philadelphia)",
    calories: 342,
    protein: 5.9,
    totalFat: 34.2,
    saturatedFat: 19.3,
    carbs: 5.5,
    calcium: 98,
    sodium: 321,
    cholesterol: 110
  },
  {
    name: "Gouda",
    calories: 356,
    protein: 24.9,
    totalFat: 27.4,
    saturatedFat: 17.6,
    carbs: 2.2,
    calcium: 700,
    sodium: 819,
    cholesterol: 114
  },
  {
    name: "Ricotta",
    calories: 174,
    protein: 11.3,
    totalFat: 13.0,
    saturatedFat: 8.3,
    carbs: 3.0,
    calcium: 207,
    sodium: 84,
    cholesterol: 51
  }
];

const PorownanieWartosciOdzywczych = () => {
  const [selectedCheeses, setSelectedCheeses] = useState<string[]>([]);
  const [comparedCheeses, setComparedCheeses] = useState<CheeseNutrition[]>([]);

  useEffect(() => {
    document.title = "Porównanie Wartości Odżywczych Serów | Serowar.pl";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Porównaj wartości odżywcze różnych rodzajów serów. Sprawdź kalorie, białko, tłuszcz, wapń i sód w popularnych serach."
      );
    }
  }, []);

  const handleAddCheese = (cheeseName: string) => {
    if (!selectedCheeses.includes(cheeseName) && selectedCheeses.length < 5) {
      setSelectedCheeses([...selectedCheeses, cheeseName]);
    }
  };

  const handleRemoveCheese = (cheeseName: string) => {
    setSelectedCheeses(selectedCheeses.filter(name => name !== cheeseName));
  };

  const handleCompare = () => {
    const cheeses = selectedCheeses.map(name => 
      cheeseDatabase.find(cheese => cheese.name === name)!
    );
    setComparedCheeses(cheeses);
  };

  const handleReset = () => {
    setSelectedCheeses([]);
    setComparedCheeses([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <Link to="/poradniki" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót do Poradników
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Porównanie Wartości Odżywczych Serów
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Porównaj wartości odżywcze różnych rodzajów serów. Wszystkie wartości podane są na 100g produktu.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Kalkulator Porównania
              </CardTitle>
              <CardDescription>
                Wybierz do 5 serów, aby porównać ich wartości odżywcze
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Wybierz ser do porównania</Label>
                  <Select onValueChange={handleAddCheese}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Wybierz ser..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cheeseDatabase
                        .filter(cheese => !selectedCheeses.includes(cheese.name))
                        .map(cheese => (
                          <SelectItem key={cheese.name} value={cheese.name}>
                            {cheese.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCheeses.length > 0 && (
                  <div>
                    <Label>Wybrane sery ({selectedCheeses.length}/5)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCheeses.map(cheese => (
                        <div
                          key={cheese}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2"
                        >
                          <span className="text-sm font-medium">{cheese}</span>
                          <button
                            onClick={() => handleRemoveCheese(cheese)}
                            className="hover:bg-primary/20 rounded-full p-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleCompare}
                    disabled={selectedCheeses.length < 2}
                    className="flex-1"
                  >
                    Porównaj sery
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    disabled={selectedCheeses.length === 0}
                  >
                    Resetuj
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {comparedCheeses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Wyniki Porównania</CardTitle>
                <CardDescription>
                  Wartości odżywcze na 100g produktu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold">Składnik</TableHead>
                        {comparedCheeses.map(cheese => (
                          <TableHead key={cheese.name} className="text-center font-bold">
                            {cheese.name}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">Kalorie (kcal)</TableCell>
                        {comparedCheeses.map(cheese => (
                          <TableCell key={cheese.name} className="text-center">
                            {cheese.calories}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Białko (g)</TableCell>
                        {comparedCheeses.map(cheese => (
                          <TableCell key={cheese.name} className="text-center">
                            {cheese.protein.toFixed(1)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Tłuszcz całkowity (g)</TableCell>
                        {comparedCheeses.map(cheese => (
                          <TableCell key={cheese.name} className="text-center">
                            {cheese.totalFat.toFixed(1)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Tłuszcz nasycony (g)</TableCell>
                        {comparedCheeses.map(cheese => (
                          <TableCell key={cheese.name} className="text-center">
                            {cheese.saturatedFat.toFixed(1)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Węglowodany (g)</TableCell>
                        {comparedCheeses.map(cheese => (
                          <TableCell key={cheese.name} className="text-center">
                            {cheese.carbs.toFixed(1)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Wapń (mg)</TableCell>
                        {comparedCheeses.map(cheese => (
                          <TableCell key={cheese.name} className="text-center font-semibold text-primary">
                            {cheese.calcium}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Sód (mg)</TableCell>
                        {comparedCheeses.map(cheese => (
                          <TableCell key={cheese.name} className="text-center">
                            {cheese.sodium}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Cholesterol (mg)</TableCell>
                        {comparedCheeses.map(cheese => (
                          <TableCell key={cheese.name} className="text-center">
                            {cheese.cholesterol}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Najwyższa zawartość wapnia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cheeseDatabase
                    .sort((a, b) => b.calcium - a.calcium)
                    .slice(0, 5)
                    .map((cheese, index) => (
                      <div key={cheese.name} className="flex justify-between items-center p-2 rounded hover:bg-accent">
                        <span className="font-medium">{index + 1}. {cheese.name}</span>
                        <span className="text-primary font-semibold">{cheese.calcium} mg</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Najniższa zawartość tłuszczu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cheeseDatabase
                    .sort((a, b) => a.totalFat - b.totalFat)
                    .slice(0, 5)
                    .map((cheese, index) => (
                      <div key={cheese.name} className="flex justify-between items-center p-2 rounded hover:bg-accent">
                        <span className="font-medium">{index + 1}. {cheese.name}</span>
                        <span className="text-primary font-semibold">{cheese.totalFat.toFixed(1)} g</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Najwyższa zawartość białka</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cheeseDatabase
                    .sort((a, b) => b.protein - a.protein)
                    .slice(0, 5)
                    .map((cheese, index) => (
                      <div key={cheese.name} className="flex justify-between items-center p-2 rounded hover:bg-accent">
                        <span className="font-medium">{index + 1}. {cheese.name}</span>
                        <span className="text-primary font-semibold">{cheese.protein.toFixed(1)} g</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Najniższa zawartość sodu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cheeseDatabase
                    .sort((a, b) => a.sodium - b.sodium)
                    .slice(0, 5)
                    .map((cheese, index) => (
                      <div key={cheese.name} className="flex justify-between items-center p-2 rounded hover:bg-accent">
                        <span className="font-medium">{index + 1}. {cheese.name}</span>
                        <span className="text-primary font-semibold">{cheese.sodium} mg</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Informacje o wartościach odżywczych serów</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Wapń w serach</h3>
                <p className="text-muted-foreground">
                  Sery to doskonałe źródło wapnia, który jest niezbędny dla zdrowia kości i zębów. 
                  Twarde sery jak parmezan i cheddar zawierają najwięcej wapnia - nawet ponad 1000 mg na 100g.
                  Zalecane dzienne spożycie wapnia dla dorosłych to około 1000 mg.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Białko w serach</h3>
                <p className="text-muted-foreground">
                  Sery są bogatym źródłem pełnowartościowego białka zawierającego wszystkie niezbędne aminokwasy.
                  Parmezan i ser szwajcarski zawierają najwięcej białka - około 26-38g na 100g produktu.
                  Białko serowe jest łatwo przyswajalne i wspiera budowę mięśni.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Tłuszcz i sód</h3>
                <p className="text-muted-foreground">
                  Wiele serów zawiera znaczące ilości tłuszczu nasyconego i sodu. Osoby z chorobami serca 
                  lub nadciśnieniem powinny wybierać sery o niższej zawartości tłuszczu (np. twarożek, mozzarella częściowo odtłuszczona)
                  i sodu (np. ricotta, ser szwajcarski). Zawsze należy zwracać uwagę na wielkość porcji.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Sery w diecie</h3>
                <p className="text-muted-foreground">
                  Mimo wysokiej zawartości kalorii i tłuszczu, sery mogą być częścią zdrowej diety, gdy są spożywane z umiarem.
                  Dostarczają wielu cennych składników odżywczych, w tym wapnia, białka, witamin A, B12 i K2.
                  Kluczowa jest kontrola porcji - zwykle zaleca się spożywanie 30-50g sera dziennie.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PorownanieWartosciOdzywczych;
