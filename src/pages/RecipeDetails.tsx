import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { recipesData } from "@/data/recipesData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock, ChefHat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactionButton from "@/components/ReactionButton";
import RecipeSchema from "@/components/RecipeSchema";
import HowToSchema from "@/components/HowToSchema";
import SeeAlso from "@/components/SeeAlso";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipe = recipesData.find(r => r.id === id);

  useEffect(() => {
    if (recipe) {
      document.title = `${recipe.name} — przepis na ser krok po kroku | Moja Serowarnia`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", recipe.description.slice(0, 160));
      }
    }
  }, [recipe]);

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Przepis nie został znaleziony</h1>
            <Button onClick={() => navigate("/przepisy")}>
              Wróć do przepisów
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Prepare HowTo steps from recipe steps
  const howToSteps = recipe.steps.map((step) => ({
    name: step.title,
    text: step.content + (step.tip ? ` Wskazówka: ${step.tip}` : '') + (step.warning ? ` Uwaga: ${step.warning}` : ''),
  }));

  // Prepare supplies from recipe
  const supplies = [
    recipe.milkBase,
    recipe.starter,
    recipe.coagulant,
  ].filter(Boolean);

  // Prepare SeeAlso links - filter out current recipe
  const seeAlsoLinks = recipesData
    .filter(r => r.id !== recipe.id)
    .slice(0, 5)
    .map(r => ({
      title: r.name,
      href: `/przepisy/${r.id}`,
      description: `${r.difficulty} • ${r.ageTime}`,
    }));

  // Add related pages
  const relatedLinks = [
    { title: "Baza kultur bakteryjnych", href: "/baza-kultur", description: "Znajdź odpowiednie kultury do swojego sera" },
    { title: "Porównywarka kultur", href: "/porownywarka-kultur", description: "Porównaj kultury różnych producentów" },
    { title: "Kalkulator kosztu sera", href: "/kalkulator-kosztu-sera", description: "Oblicz koszt produkcji sera" },
    { title: "Poradnik serowarski", href: "/poradnik", description: "Praktyczne wskazówki dla serowarów" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <RecipeSchema recipe={recipe} />
      <HowToSchema
        name={`Jak zrobić ${recipe.name} - przepis krok po kroku`}
        description={recipe.description}
        image={typeof recipe.image === 'string' ? recipe.image : undefined}
        totalTime={recipe.ageTime.includes('dni') ? `P${recipe.ageTime.match(/\d+/)?.[0] || '30'}D` : undefined}
        supply={supplies}
        tool={["Kocioł serowarski", "Termometr", "Formy serowarskie", "Prasa"]}
        steps={howToSteps}
      />
      <Navigation />
      <PageBreadcrumbs items={[
        { label: "Przepisy", href: "/przepisy" },
        { label: recipe.name }
      ]} />
      
      <main className="flex-1 pt-20">
        <article className="container mx-auto px-4 py-12 max-w-5xl">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate("/przepisy")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć do przepisów
          </Button>

          {/* Header with image */}
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden mb-8">
            <div className="aspect-video overflow-hidden">
              <img 
                src={recipe.image} 
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="text-base px-4 py-1">{recipe.difficulty}</Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>{recipe.ageTime}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ChefHat className="h-5 w-5" />
                  <span>{recipe.yield}</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                {recipe.name}
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {recipe.description}
              </p>
              
              <div className="flex justify-center sm:justify-start">
                <ReactionButton contentType="recipe" contentId={recipe.id} />
              </div>
            </div>
          </div>

          {/* CTA: Uwarz w Fermly — wyróżniony przycisk, deep-link per ser (BRIEF #8) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl shadow-card p-5 mb-8">
            <div className="text-4xl shrink-0">🧀</div>
            <div className="flex-1">
              <h2 className="text-lg font-display font-bold text-foreground mb-1">
                Uwarz ten ser krok po kroku w Fermly
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Poprowadź produkcję z timerami i alarmami na każdym etapie, a gotowy ser trafi do wirtualnej dojrzewalni (liczy ubytek wagi, przypomina o pielęgnacji).
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-warm"
            >
              <a
                href={`https://fermly.pl/mleko/warzenie?ser=${recipe.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Uwarz w Fermly <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </div>

          {/* Przepis bazowy */}
          <section className="bg-card rounded-xl shadow-card border border-border p-8 mb-8">
            <h2 className="text-2xl font-display font-bold text-primary mb-6">📋 Przepis</h2>
            
            <div className="space-y-4">
              <div><strong className="text-primary">Wsad bazowy:</strong> {recipe.milkBase}</div>
              <div><strong className="text-primary">Starter:</strong> {recipe.starter}</div>
              <div><strong className="text-primary">Koagulant:</strong> {recipe.coagulant}</div>
              <div><strong className="text-primary">Solenie:</strong> {recipe.salting}</div>
              <div><strong className="text-primary">Dojrzewanie:</strong> {recipe.aging}</div>
            </div>
          </section>

          {/* Kultury i zamienniki */}
          <section className="bg-card rounded-xl shadow-card border border-border p-8 mb-8">
            <h2 className="text-2xl font-display font-bold text-primary mb-6">🧪 Kultury i zamienniki</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="p-3 text-left">Nazwa</th>
                    <th className="p-3 text-left">Typ</th>
                    <th className="p-3 text-left">Sklep</th>
                    <th className="p-3 text-left">Dawkowanie</th>
                    <th className="p-3 text-left">Uwagi</th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.cultureSubstitutes.map((culture, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-secondary/10">
                      <td className="p-3">
                        <Link 
                          to={`/baza-kultur?q=${encodeURIComponent(culture.searchQuery)}`}
                          className="font-semibold text-primary hover:text-accent hover:underline"
                        >
                          {culture.name}
                        </Link>
                      </td>
                      <td className="p-3">{culture.type}</td>
                      <td className="p-3">{culture.shop}</td>
                      <td className="p-3 font-medium">{culture.dosage}</td>
                      <td className="p-3 text-sm">{culture.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Kroki */}
          <section className="bg-card rounded-xl shadow-card border border-border p-8 mb-8">
            <h2 className="text-2xl font-display font-bold text-primary mb-6">📖 Kroki przygotowania</h2>
            
            <div className="space-y-6">
              {recipe.steps.map((step, idx) => (
                <div key={idx} className="bg-secondary/5 rounded-lg p-6 border-l-4 border-accent">
                  <h3 className="text-lg font-bold text-primary mb-3">{step.title}</h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-line mb-3">{step.content}</p>
                  
                  {step.tip && (
                    <div className="bg-green-50 border-l-3 border-green-500 p-4 rounded mt-3">
                      <p className="text-sm"><strong className="text-green-700">💡 Wskazówka:</strong> {step.tip}</p>
                    </div>
                  )}
                  
                  {step.warning && (
                    <div className="bg-yellow-50 border-l-3 border-yellow-500 p-4 rounded mt-3">
                      <p className="text-sm"><strong className="text-yellow-700">⚠️ Uwaga:</strong> {step.warning}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Profil smakowy */}
          {recipe.flavor && (
            <section className="bg-card rounded-xl shadow-card border border-border p-8 mb-8">
              <h2 className="text-2xl font-display font-bold text-primary mb-6">🎯 Profil smakowy</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong className="text-primary">Smak:</strong> {recipe.flavor.taste}</div>
                <div><strong className="text-primary">Tekstura:</strong> {recipe.flavor.texture}</div>
                <div><strong className="text-primary">Barwa:</strong> {recipe.flavor.color}</div>
                <div><strong className="text-primary">Zapach:</strong> {recipe.flavor.aroma}</div>
              </div>
            </section>
          )}

          {/* Wartości odżywcze */}
          {recipe.nutrition && (
            <section className="bg-card rounded-xl shadow-card border border-border p-8">
              <h2 className="text-2xl font-display font-bold text-primary mb-6">🥗 Wartości odżywcze (na {recipe.nutrition.servingSize})</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-3 font-medium">Energia</td>
                      <td className="py-3 text-right">{recipe.nutrition.calories} kcal</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 font-medium">Tłuszcz</td>
                      <td className="py-3 text-right">{recipe.nutrition.fatContent} g</td>
                    </tr>
                    <tr className="border-b border-border bg-secondary/5">
                      <td className="py-3 text-muted-foreground pl-4">w tym tłuszcze nasycone</td>
                      <td className="py-3 text-right text-muted-foreground">{recipe.nutrition.saturatedFatContent} g</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 font-medium">Węglowodany</td>
                      <td className="py-3 text-right">{recipe.nutrition.carbohydrateContent} g</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 font-medium">Białko</td>
                      <td className="py-3 text-right">{recipe.nutrition.proteinContent} g</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 font-medium">Sód</td>
                      <td className="py-3 text-right">{recipe.nutrition.sodiumContent} mg</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium">Wapń</td>
                      <td className="py-3 text-right font-semibold text-green-600">{recipe.nutrition.calciumContent} mg</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                * Wartości orientacyjne dla sera domowego. Faktyczne wartości mogą się różnić w zależności od użytego mleka i procesu produkcji.
              </p>
            </section>
          )}

          {/* See Also Section */}
          <SeeAlso 
            links={[...seeAlsoLinks, ...relatedLinks]} 
            title="Zobacz również" 
          />
        </article>
      </main>
      
      <Footer />
    </div>
  );
};

export default RecipeDetails;
