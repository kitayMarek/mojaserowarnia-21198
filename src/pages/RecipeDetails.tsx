import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getRecipeById } from "@/data/recipesData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, TrendingUp, Milk, Beaker } from "lucide-react";
import { useEffect } from "react";

const RecipeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const recipe = getRecipeById(id || "");

  useEffect(() => {
    if (recipe) {
      document.title = `${recipe.name} - Przepis | Moja Serowarnia`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", recipe.description.substring(0, 160));
      }
    }
  }, [recipe]);

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold mb-4">Przepis nie znaleziony</h1>
            <Link to="/przepisy">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wróć do przepisów
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const difficultyColors = {
    "Łatwy": "bg-secondary text-secondary-foreground",
    "Średni": "bg-primary text-primary-foreground",
    "Trudny": "bg-accent text-accent-foreground"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20">
        <section className="py-8 bg-gradient-hero">
          <div className="container mx-auto px-4">
            <Link to="/przepisy">
              <Button variant="ghost" className="mb-4 text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Wróć do przepisów
              </Button>
            </Link>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground">
                    {recipe.name}
                  </h1>
                  <Badge className={difficultyColors[recipe.difficulty]}>
                    {recipe.difficulty}
                  </Badge>
                </div>
                <p className="text-lg text-primary-foreground/90 mb-4">
                  {recipe.category}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <img 
                      src={recipe.image} 
                      alt={recipe.name}
                      className="w-full rounded-lg shadow-card mb-6"
                    />
                    <h2 className="text-2xl font-display font-semibold mb-4">🧀 Opis</h2>
                    <p className="text-foreground leading-relaxed">
                      {recipe.description}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-display">📋 Przepis krok po kroku</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {recipe.steps.map((step, index) => (
                      <div 
                        key={index}
                        className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary"
                      >
                        <h4 className="text-lg font-semibold text-foreground mb-2">
                          {index + 1}. {step.title}
                        </h4>
                        <p className="text-foreground/80 leading-relaxed mb-3">
                          {step.content}
                        </p>
                        {step.tips && step.tips.length > 0 && (
                          <div className="bg-secondary/30 p-3 rounded-md border-l-3 border-secondary">
                            <p className="text-sm font-semibold text-secondary-foreground mb-1">💡 Wskazówki:</p>
                            <ul className="text-sm text-secondary-foreground/90 space-y-1">
                              {step.tips.map((tip, tipIndex) => (
                                <li key={tipIndex}>• {tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {step.warnings && step.warnings.length > 0 && (
                          <div className="bg-destructive/10 p-3 rounded-md border-l-3 border-destructive mt-2">
                            <p className="text-sm font-semibold text-destructive mb-1">⚠️ Uwaga:</p>
                            <ul className="text-sm text-destructive/90 space-y-1">
                              {step.warnings.map((warning, warnIndex) => (
                                <li key={warnIndex}>• {warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Podstawowe dane</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-muted-foreground">Wydajność</p>
                        <p className="text-foreground">{recipe.yield}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-muted-foreground">Czas dojrzewania</p>
                        <p className="text-foreground">{recipe.ageTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Milk className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-muted-foreground">Rodzaj mleka</p>
                        <p className="text-foreground">{recipe.milkType}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2">
                      <Beaker className="h-5 w-5" />
                      Kultury bakteryjne
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {recipe.cultures.map((culture, index) => (
                        <li 
                          key={index}
                          className="text-sm text-foreground bg-muted/50 p-2 rounded"
                        >
                          • {culture}
                        </li>
                      ))}
                    </ul>
                    <Link to="/baza-kultur">
                      <Button variant="outline" className="w-full mt-4">
                        Znajdź kultury w bazie
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-warm text-primary-foreground">
                  <CardHeader>
                    <CardTitle className="font-display">Przydatne wskazówki</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p>• Zawsze używaj świeżego mleka najwyższej jakości</p>
                    <p>• Przestrzegaj dokładnie temperatury i czasów</p>
                    <p>• Dbaj o higienę sprzętu i środowiska pracy</p>
                    <p>• Prowadź notatki z każdej produkcji</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RecipeDetails;
