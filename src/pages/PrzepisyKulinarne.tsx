import { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { culinaryRecipesData } from "@/data/culinaryRecipesData";
import CulinaryRecipeCard from "@/components/CulinaryRecipeCard";
import { Badge } from "@/components/ui/badge";
import { ChefHat, UtensilsCrossed, Clock, Users } from "lucide-react";

const PrzepisyKulinarne = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    culinaryRecipesData.forEach(recipe => {
      recipe.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, []);

  const filteredRecipes = useMemo(() => {
    return culinaryRecipesData.filter(recipe => {
      const matchesDifficulty = !selectedDifficulty || recipe.difficulty === selectedDifficulty;
      const matchesTag = !selectedTag || recipe.tags.includes(selectedTag);
      return matchesDifficulty && matchesTag;
    });
  }, [selectedDifficulty, selectedTag]);

  const difficulties = ['łatwy', 'średni', 'zaawansowany'];

  return (
    <>
      <Helmet>
        <title>Przepisy Kulinarne z Serem | Moja Serowarnia</title>
        <meta 
          name="description" 
          content="Odkryj wyjątkowe przepisy kulinarne, w których ser jest głównym bohaterem. Eleganckie dania z serem Gouda, Brie, Camembert i innymi serami." 
        />
      </Helmet>

      <Navigation />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
          <div className="container mx-auto px-4 relative z-10">
            <PageBreadcrumbs 
              items={[
                { label: "Przepisy kulinarne" }
              ]} 
            />
            
            <div className="max-w-4xl mx-auto text-center mt-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <ChefHat className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Przepisy Kulinarne z Serem
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Odkryj wyjątkowe dania, w których ser jest głównym bohaterem. 
                Od eleganckich roladek po rustykalne zapiekanki - każdy przepis to kulinarna podróż.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-border/50">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">{culinaryRecipesData.length} przepisów</span>
              </div>
              <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-border/50">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">Szczegółowe instrukcje</span>
              </div>
              <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-border/50">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">Dla każdego poziomu</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-6">
              {/* Difficulty Filter */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Poziom trudności:</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedDifficulty === null ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/90 transition-colors"
                    onClick={() => setSelectedDifficulty(null)}
                  >
                    Wszystkie
                  </Badge>
                  {difficulties.map(diff => (
                    <Badge
                      key={diff}
                      variant={selectedDifficulty === diff ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/90 transition-colors capitalize"
                      onClick={() => setSelectedDifficulty(diff)}
                    >
                      {diff}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Tagi:</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedTag === null ? "secondary" : "outline"}
                    className="cursor-pointer hover:bg-secondary/90 transition-colors"
                    onClick={() => setSelectedTag(null)}
                  >
                    Wszystkie
                  </Badge>
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? "secondary" : "outline"}
                      className="cursor-pointer hover:bg-secondary/90 transition-colors"
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recipes Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Nie znaleziono przepisów spełniających kryteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map(recipe => (
                  <CulinaryRecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default PrzepisyKulinarne;
