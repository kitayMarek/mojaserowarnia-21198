import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import RecipeCard from "@/components/RecipeCard";
import { recipesData } from "@/data/recipesData";
import { Button } from "@/components/ui/button";
import przepisyHeaderImage from "@/assets/przepisy-header.webp";

const Przepisy = () => {
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    document.title = "Przepisy Serów | Moja Serowarnia";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Sprawdzone przepisy na domowe sery - od łatwych do zaawansowanych. Asiago, Caciotta, Dunlop, Feta Bułgarska, Yorkshire i więcej!");
    }
  }, []);

  const filteredRecipes = filter === "all" 
    ? recipesData 
    : recipesData.filter(r => r.difficulty === filter);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-20">
        <section className="relative py-12 md:py-16 overflow-hidden">
          <img
            src={przepisyHeaderImage}
            alt="Przepisy na domowe sery"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 drop-shadow-lg">
                🧀 Przepisy na Domowe Sery
              </h1>
              <p className="text-lg md:text-xl text-white drop-shadow-md">
                Sprawdzone przepisy z pełnymi instrukcjami krok po kroku
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap gap-3 mb-8 justify-center">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  className={filter === "all" ? "bg-primary hover:bg-primary-hover" : ""}
                >
                  Wszystkie ({recipesData.length})
                </Button>
                <Button
                  variant={filter === "Łatwy" ? "default" : "outline"}
                  onClick={() => setFilter("Łatwy")}
                  className={filter === "Łatwy" ? "bg-primary hover:bg-primary-hover" : ""}
                >
                  Łatwe ({recipesData.filter(r => r.difficulty === "Łatwy").length})
                </Button>
                <Button
                  variant={filter === "Średni" ? "default" : "outline"}
                  onClick={() => setFilter("Średni")}
                  className={filter === "Średni" ? "bg-primary hover:bg-primary-hover" : ""}
                >
                  Średnie ({recipesData.filter(r => r.difficulty === "Średni").length})
                </Button>
                <Button
                  variant={filter === "Zaawansowany" ? "default" : "outline"}
                  onClick={() => setFilter("Zaawansowany")}
                  className={filter === "Zaawansowany" ? "bg-primary hover:bg-primary-hover" : ""}
                >
                  Zaawansowane ({recipesData.filter(r => r.difficulty === "Zaawansowany").length})
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Przepisy;
