import { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { culinaryRecipesData } from "@/data/culinaryRecipesData";
import CulinaryRecipeCard from "@/components/CulinaryRecipeCard";
import { Badge } from "@/components/ui/badge";
import { ChefHat, UtensilsCrossed, Clock, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import WprowadzenieDzialu from "@/components/WprowadzenieDzialu";

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
            
            <div className="mt-6">
              <PageHeader
                icon={ChefHat}
                color="rose"
                title="Przepisy kulinarne z serem"
                subtitle="Odkryj wyjątkowe dania, w których ser jest głównym bohaterem — od eleganckich roladek po rustykalne zapiekanki."
              />
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

        <section className="py-8 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <WprowadzenieDzialu
              lead="Ser, który zrobiłeś sam, zasługuje na coś więcej niż kanapkę."
              bloki={[
                {
                  tytul: "Danie zbudowane wokół sera",
                  tekst:
                    "Ser nie jest tu dodatkiem posypanym na wierzch, tylko powodem, dla którego danie w ogóle istnieje. Involtini z płynnym sercem goudy, tarta z camembertem, risotto na gorgonzoli, sernik na własnym twarogu.",
                },
                {
                  tytul: "Z drogą powrotną do sera",
                  tekst:
                    "Przy każdym daniu jest odnośnik do przepisu na ser, na którym ono stoi. Jeśli akurat nie masz go pod ręką, możesz go zrobić — a jeśli masz nadmiar po warzeniu, wiesz już, co z nim zrobić.",
                },
                {
                  tytul: "Z wyjaśnieniem, dlaczego działa",
                  tekst:
                    "Czemu twaróg na sernik ma być tłusty, czemu bakalie trzeba namoczyć dzień wcześniej, czemu gruyère topi się gładko, a inny ser rozpada się na tłuszcz i nitki. Przepis, który mówi tylko „wymieszaj”, nie ratuje, gdy coś pójdzie nie tak.",
                },
              ]}
              podsumowanie="Dział jest młody i rośnie powoli — wolimy kilka dopracowanych przepisów niż setkę przepisanych z internetu. Każdy z nich ktoś tu zrobił, zanim trafił na stronę."
              tropy={[
                {
                  sytuacja: "Masz twaróg",
                  propozycja: "— ciężki od bakalii, na miodzie i własnym serze:",
                  href: "/przepisy-kulinarne/warminski-sernik-bakaliowy",
                  etykieta: "warmiński sernik",
                },
                {
                  sytuacja: "Chcesz zrobić wrażenie",
                  propozycja: "— roladki z ciągnącym się serem w środku:",
                  href: "/przepisy-kulinarne/aksamitne-involtini-gouda",
                  etykieta: "involtini z goudy",
                },
                {
                  sytuacja: "Masz ser pleśniowy",
                  propozycja: "— kremowe, gotowe w pół godziny:",
                  href: "/przepisy-kulinarne/kremowe-risotto-gorgonzola",
                  etykieta: "risotto z gorgonzolą",
                },
                {
                  sytuacja: "Nie masz jeszcze sera",
                  propozycja: "— zacznij od źródła:",
                  href: "/przepisy",
                  etykieta: "przepisy na sery",
                },
              ]}
            />
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
