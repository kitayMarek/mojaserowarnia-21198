import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { culinaryRecipesData } from "@/data/culinaryRecipesData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  ChefHat, 
  Lightbulb, 
  AlertTriangle,
  Wine,
  Utensils,
  CheckCircle2,
  Flame,
  Beef,
  Wheat,
  Droplets
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CulinaryRecipeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const recipe = culinaryRecipesData.find(r => r.id === id);

  useEffect(() => {
    if (recipe) {
      document.title = `${recipe.name} | Przepisy Kulinarne | Moja Serowarnia`;
    }
  }, [recipe]);

  if (!recipe) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Przepis nie został znaleziony</h1>
            <Link to="/przepisy-kulinarne">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Wróć do przepisów
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'łatwy':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'średni':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'zaawansowany':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const ingredientsByCategory = {
    base: recipe.ingredients.filter(i => i.category === 'base'),
    filling: recipe.ingredients.filter(i => i.category === 'filling'),
    sauce: recipe.ingredients.filter(i => i.category === 'sauce'),
    garnish: recipe.ingredients.filter(i => i.category === 'garnish'),
  };

  const categoryLabels: Record<string, string> = {
    base: 'Baza',
    filling: 'Farsz i przyprawy',
    sauce: 'Sos i warzywa',
    garnish: 'Dekoracja',
  };

  return (
    <>
      <Helmet>
        <title>{recipe.name} | Przepisy Kulinarne | Moja Serowarnia</title>
        <meta name="description" content={recipe.description} />
      </Helmet>

      <Navigation />

      <main className="min-h-screen bg-background">
        {/* Hero Image */}
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10">
          {/* Breadcrumbs & Back Button */}
          <div className="mb-6">
            <PageBreadcrumbs 
              items={[
                { label: "Przepisy kulinarne", href: "/przepisy-kulinarne" },
                { label: recipe.name }
              ]} 
            />
          </div>

          <Link to="/przepisy-kulinarne">
            <Button variant="outline" size="sm" className="mb-6 bg-background/80 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wróć do przepisów
            </Button>
          </Link>

          {/* Title Card */}
          <Card className="mb-8 border-border/50 bg-card/95 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-primary/90 text-primary-foreground">
                  {recipe.mainCheese}
                </Badge>
                <Badge variant="outline" className={getDifficultyColor(recipe.difficulty)}>
                  {recipe.difficulty}
                </Badge>
                {recipe.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                {recipe.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {recipe.subtitle}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-muted-foreground">Przygotowanie:</span>
                    <span className="ml-1 font-medium text-foreground">{recipe.prepTime}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-muted-foreground">Gotowanie:</span>
                    <span className="ml-1 font-medium text-foreground">{recipe.cookTime}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-muted-foreground">Porcje:</span>
                    <span className="ml-1 font-medium text-foreground">{recipe.servings}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-primary" />
                    O przepisie
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {recipe.description}
                  </p>
                </CardContent>
              </Card>

              {/* Strategy */}
              <Card className="border-border/50 bg-primary/5">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Strategia kulinarna
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {recipe.strategy}
                  </p>
                </CardContent>
              </Card>

              {/* Steps */}
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-primary" />
                    Instrukcja krok po kroku
                  </h2>
                  <div className="space-y-6">
                    {recipe.steps.map((step, index) => (
                      <div key={index} className="relative pl-12">
                        <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                          <p className="text-muted-foreground leading-relaxed mb-3">
                            {step.content}
                          </p>
                          {step.tip && (
                            <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                              <Lightbulb className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                              <p className="text-sm text-green-700 dark:text-green-300">{step.tip}</p>
                            </div>
                          )}
                          {step.warning && (
                            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 mt-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                              <p className="text-sm text-yellow-700 dark:text-yellow-300">{step.warning}</p>
                            </div>
                          )}
                        </div>
                        {index < recipe.steps.length - 1 && (
                          <div className="absolute left-4 top-10 bottom-0 w-px bg-border -translate-x-1/2" 
                               style={{ height: 'calc(100% - 2rem)' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Presentation */}
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Prezentacja na talerzu
                  </h2>
                  <ol className="space-y-3">
                    {recipe.presentation.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-medium text-primary">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Nutrition Table */}
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-primary" />
                    Wartości odżywcze
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">Na 1 porcję</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Składnik</TableHead>
                        <TableHead className="text-right">Wartość</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            Kalorie
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{recipe.nutrition.calories} kcal</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Beef className="w-4 h-4 text-red-500" />
                            Białko
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{recipe.nutrition.protein} g</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Wheat className="w-4 h-4 text-amber-500" />
                            Węglowodany
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{recipe.nutrition.carbs} g</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-yellow-500" />
                            Tłuszcze
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{recipe.nutrition.fat} g</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Wheat className="w-4 h-4 text-green-600" />
                            Błonnik
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{recipe.nutrition.fiber} g</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            Sód
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{recipe.nutrition.sodium} mg</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Wine Recommendation */}
              {recipe.wineRecommendation && (
                <Card className="border-border/50 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Wine className="w-5 h-5 text-purple-500" />
                      Rekomendacja wina
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {recipe.wineRecommendation}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Ingredients */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-primary" />
                      Składniki
                    </h2>
                    
                    <div className="space-y-6">
                      {Object.entries(ingredientsByCategory).map(([category, ingredients]) => (
                        ingredients.length > 0 && (
                          <div key={category}>
                            <h3 className="text-sm font-medium text-primary uppercase tracking-wide mb-3">
                              {categoryLabels[category]}
                            </h3>
                            <ul className="space-y-2">
                              {ingredients.map((ingredient, index) => (
                                <li key={index} className="flex justify-between items-start gap-2 text-sm">
                                  <span className="text-foreground">{ingredient.name}</span>
                                  <span className="text-muted-foreground shrink-0">{ingredient.amount}</span>
                                </li>
                              ))}
                            </ul>
                            {category !== 'garnish' && <Separator className="mt-4" />}
                          </div>
                        )
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-16" />
      </main>

      <Footer />
    </>
  );
};

export default CulinaryRecipeDetails;
