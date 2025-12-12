import { useState, useEffect, useMemo } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import RecipeCard from "@/components/RecipeCard";
import { recipesData } from "@/data/recipesData";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Filter, X } from "lucide-react";
import przepisyHeaderImage from "@/assets/przepisy-header.webp";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";

// Helper function to parse aging time to days for filtering
const parseAgingTimeToDays = (ageTime: string): { min: number; max: number } => {
  const lower = ageTime.toLowerCase();
  
  // Handle "od razu" or "świeży"
  if (lower.includes("od razu") || lower.includes("świeży") || lower.includes("natychmiast")) {
    return { min: 0, max: 0 };
  }
  
  // Extract numbers and units
  const dayMatch = lower.match(/(\d+)[\s-]*(?:do|–|-)?[\s]*(\d+)?[\s]*(?:dni|dzień|day)/i);
  const weekMatch = lower.match(/(\d+)[\s-]*(?:do|–|-)?[\s]*(\d+)?[\s]*(?:tygodni|tydzień|tyg|week)/i);
  const monthMatch = lower.match(/(\d+)[\s-]*(?:do|–|-)?[\s]*(\d+)?[\s]*(?:miesiąc|miesięcy|mies|month)/i);
  const yearMatch = lower.match(/(\d+)[\s-]*(?:do|–|-)?[\s]*(\d+)?[\s]*(?:rok|lat|year)/i);
  
  let minDays = 0;
  let maxDays = 0;
  
  if (dayMatch) {
    minDays = parseInt(dayMatch[1]) || 0;
    maxDays = dayMatch[2] ? parseInt(dayMatch[2]) : minDays;
  }
  if (weekMatch) {
    const weekMin = (parseInt(weekMatch[1]) || 0) * 7;
    const weekMax = weekMatch[2] ? parseInt(weekMatch[2]) * 7 : weekMin;
    minDays = Math.max(minDays, weekMin);
    maxDays = Math.max(maxDays, weekMax);
  }
  if (monthMatch) {
    const monthMin = (parseInt(monthMatch[1]) || 0) * 30;
    const monthMax = monthMatch[2] ? parseInt(monthMatch[2]) * 30 : monthMin;
    minDays = Math.max(minDays, monthMin);
    maxDays = Math.max(maxDays, monthMax);
  }
  if (yearMatch) {
    const yearMin = (parseInt(yearMatch[1]) || 0) * 365;
    const yearMax = yearMatch[2] ? parseInt(yearMatch[2]) * 365 : yearMin;
    minDays = Math.max(minDays, yearMin);
    maxDays = Math.max(maxDays, yearMax);
  }
  
  return { min: minDays, max: maxDays || minDays };
};

// Aging time categories
const agingCategories = [
  { id: "fresh", label: "Świeże (0-7 dni)", min: 0, max: 7 },
  { id: "short", label: "Krótkie (1-4 tyg.)", min: 7, max: 30 },
  { id: "medium", label: "Średnie (1-3 mies.)", min: 30, max: 90 },
  { id: "long", label: "Długie (3-12 mies.)", min: 90, max: 365 },
  { id: "extra", label: "Bardzo długie (12+ mies.)", min: 365, max: Infinity },
];

const Przepisy = () => {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [agingFilter, setAgingFilter] = useState<string[]>([]);
  const [caloriesRange, setCaloriesRange] = useState<[number, number]>([0, 500]);
  const [proteinRange, setProteinRange] = useState<[number, number]>([0, 40]);
  const [fatRange, setFatRange] = useState<[number, number]>([0, 50]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Calculate min/max values from data
  const nutritionBounds = useMemo(() => {
    const recipesWithNutrition = recipesData.filter(r => r.nutrition);
    return {
      calories: {
        min: Math.min(...recipesWithNutrition.map(r => r.nutrition?.calories || 0)),
        max: Math.max(...recipesWithNutrition.map(r => r.nutrition?.calories || 500)),
      },
      protein: {
        min: Math.min(...recipesWithNutrition.map(r => r.nutrition?.proteinContent || 0)),
        max: Math.max(...recipesWithNutrition.map(r => r.nutrition?.proteinContent || 40)),
      },
      fat: {
        min: Math.min(...recipesWithNutrition.map(r => r.nutrition?.fatContent || 0)),
        max: Math.max(...recipesWithNutrition.map(r => r.nutrition?.fatContent || 50)),
      },
    };
  }, []);

  useEffect(() => {
    document.title = "Przepisy Serów | Moja Serowarnia";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Sprawdzone przepisy na domowe sery - od łatwych do zaawansowanych. Asiago, Caciotta, Dunlop, Feta Bułgarska, Yorkshire i więcej!");
    }
  }, []);

  const toggleAgingFilter = (id: string) => {
    setAgingFilter(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const clearAllFilters = () => {
    setDifficultyFilter("all");
    setAgingFilter([]);
    setCaloriesRange([nutritionBounds.calories.min, nutritionBounds.calories.max]);
    setProteinRange([nutritionBounds.protein.min, nutritionBounds.protein.max]);
    setFatRange([nutritionBounds.fat.min, nutritionBounds.fat.max]);
  };

  const hasActiveFilters = difficultyFilter !== "all" || 
    agingFilter.length > 0 || 
    caloriesRange[0] > nutritionBounds.calories.min || 
    caloriesRange[1] < nutritionBounds.calories.max ||
    proteinRange[0] > nutritionBounds.protein.min || 
    proteinRange[1] < nutritionBounds.protein.max ||
    fatRange[0] > nutritionBounds.fat.min || 
    fatRange[1] < nutritionBounds.fat.max;

  const filteredRecipes = useMemo(() => {
    return recipesData.filter(recipe => {
      // Difficulty filter
      if (difficultyFilter !== "all" && recipe.difficulty !== difficultyFilter) {
        return false;
      }
      
      // Aging time filter
      if (agingFilter.length > 0) {
        const agingDays = parseAgingTimeToDays(recipe.ageTime);
        const matchesAging = agingFilter.some(filterId => {
          const category = agingCategories.find(c => c.id === filterId);
          if (!category) return false;
          return agingDays.min <= category.max && agingDays.max >= category.min;
        });
        if (!matchesAging) return false;
      }
      
      // Nutrition filters
      if (recipe.nutrition) {
        const { calories, proteinContent, fatContent } = recipe.nutrition;
        if (calories < caloriesRange[0] || calories > caloriesRange[1]) return false;
        if (proteinContent < proteinRange[0] || proteinContent > proteinRange[1]) return false;
        if (fatContent < fatRange[0] || fatContent > fatRange[1]) return false;
      }
      
      return true;
    });
  }, [difficultyFilter, agingFilter, caloriesRange, proteinRange, fatRange]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Przepisy na domowe sery",
    "description": "Kompletna lista przepisów na tradycyjne sery domowe",
    "numberOfItems": recipesData.length,
    "itemListElement": recipesData.map((recipe, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://mojaserowarnia.pl/przepisy/${recipe.id}`,
      "name": recipe.name,
      "description": recipe.description.slice(0, 160)
    }))
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema, null, 2) }}
      />
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Przepisy" }]} />
      
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
              {/* Difficulty Quick Filters */}
              <div className="flex flex-wrap gap-3 mb-6 justify-center">
                <Button
                  variant={difficultyFilter === "all" ? "default" : "outline"}
                  onClick={() => setDifficultyFilter("all")}
                  className={difficultyFilter === "all" ? "bg-primary hover:bg-primary-hover" : ""}
                >
                  Wszystkie ({recipesData.length})
                </Button>
                <Button
                  variant={difficultyFilter === "Łatwy" ? "default" : "outline"}
                  onClick={() => setDifficultyFilter("Łatwy")}
                  className={difficultyFilter === "Łatwy" ? "bg-primary hover:bg-primary-hover" : ""}
                >
                  Łatwe ({recipesData.filter(r => r.difficulty === "Łatwy").length})
                </Button>
                <Button
                  variant={difficultyFilter === "Średni" ? "default" : "outline"}
                  onClick={() => setDifficultyFilter("Średni")}
                  className={difficultyFilter === "Średni" ? "bg-primary hover:bg-primary-hover" : ""}
                >
                  Średnie ({recipesData.filter(r => r.difficulty === "Średni").length})
                </Button>
                <Button
                  variant={difficultyFilter === "Zaawansowany" ? "default" : "outline"}
                  onClick={() => setDifficultyFilter("Zaawansowany")}
                  className={difficultyFilter === "Zaawansowany" ? "bg-primary hover:bg-primary-hover" : ""}
                >
                  Zaawansowane ({recipesData.filter(r => r.difficulty === "Zaawansowany").length})
                </Button>
              </div>

              {/* Advanced Filters Collapsible */}
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="mb-8">
                <div className="flex items-center justify-center gap-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Zaawansowane filtry
                      <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-1 text-muted-foreground">
                      <X className="h-4 w-4" />
                      Wyczyść filtry
                    </Button>
                  )}
                </div>

                <CollapsibleContent className="mt-6">
                  <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                    {/* Aging Time Filter */}
                    <div>
                      <h3 className="font-semibold mb-3 text-foreground">Czas dojrzewania</h3>
                      <div className="flex flex-wrap gap-2">
                        {agingCategories.map(category => (
                          <Badge
                            key={category.id}
                            variant={agingFilter.includes(category.id) ? "default" : "outline"}
                            className={`cursor-pointer transition-colors ${
                              agingFilter.includes(category.id) 
                                ? "bg-primary text-primary-foreground hover:bg-primary-hover" 
                                : "hover:bg-accent"
                            }`}
                            onClick={() => toggleAgingFilter(category.id)}
                          >
                            {category.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Nutrition Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Calories */}
                      <div>
                        <h3 className="font-semibold mb-3 text-foreground">
                          Kalorie: {caloriesRange[0]} - {caloriesRange[1]} kcal
                        </h3>
                        <Slider
                          value={caloriesRange}
                          onValueChange={(value) => setCaloriesRange(value as [number, number])}
                          min={nutritionBounds.calories.min}
                          max={nutritionBounds.calories.max}
                          step={10}
                          className="w-full"
                        />
                      </div>

                      {/* Protein */}
                      <div>
                        <h3 className="font-semibold mb-3 text-foreground">
                          Białko: {proteinRange[0]} - {proteinRange[1]} g
                        </h3>
                        <Slider
                          value={proteinRange}
                          onValueChange={(value) => setProteinRange(value as [number, number])}
                          min={nutritionBounds.protein.min}
                          max={nutritionBounds.protein.max}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Fat */}
                      <div>
                        <h3 className="font-semibold mb-3 text-foreground">
                          Tłuszcz: {fatRange[0]} - {fatRange[1]} g
                        </h3>
                        <Slider
                          value={fatRange}
                          onValueChange={(value) => setFatRange(value as [number, number])}
                          min={nutritionBounds.fat.min}
                          max={nutritionBounds.fat.max}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Results Count */}
              {hasActiveFilters && (
                <p className="text-center text-muted-foreground mb-6">
                  Znaleziono {filteredRecipes.length} z {recipesData.length} przepisów
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>

              {filteredRecipes.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg mb-4">
                    Nie znaleziono przepisów spełniających kryteria.
                  </p>
                  <Button variant="outline" onClick={clearAllFilters}>
                    Wyczyść filtry
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Przepisy;
