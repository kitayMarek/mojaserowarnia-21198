import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import RecipeCard from "@/components/RecipeCard";
import { recipesData } from "@/data/recipesData";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const Przepisy = () => {
  const [filter, setFilter] = useState<"all" | "Łatwy" | "Średni" | "Trudny">("all");

  useEffect(() => {
    document.title = "Przepisy na domowe sery - Moja Serowarnia";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Sprawdzone przepisy na domowe sery - od łatwej mozzarelli po bardziej wymagające sery dojrzewające. Kompletne instrukcje krok po kroku.");
    }
  }, []);

  const filteredRecipes = filter === "all" 
    ? recipesData 
    : recipesData.filter(recipe => recipe.difficulty === filter);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-20">
        <section className="py-16 bg-gradient-hero">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
                Przepisy na domowe sery
              </h1>
              <p className="text-lg text-primary-foreground/90">
                Odkryj sprawdzone przepisy na różne rodzaje serów. Od łatwej mozzarelli po bardziej wymagające sery dojrzewające.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-xl font-display font-semibold mb-4">Filtruj według poziomu trudności:</h2>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  className="transition-all"
                >
                  Wszystkie
                </Button>
                <Button
                  variant={filter === "Łatwy" ? "default" : "outline"}
                  onClick={() => setFilter("Łatwy")}
                  className="transition-all"
                >
                  Łatwe
                </Button>
                <Button
                  variant={filter === "Średni" ? "default" : "outline"}
                  onClick={() => setFilter("Średni")}
                  className="transition-all"
                >
                  Średnie
                </Button>
                <Button
                  variant={filter === "Trudny" ? "default" : "outline"}
                  onClick={() => setFilter("Trudny")}
                  className="transition-all"
                >
                  Trudne
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nie znaleziono przepisów dla wybranego poziomu trudności.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Przepisy;
