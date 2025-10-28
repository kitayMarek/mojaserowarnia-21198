import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { recipesData } from "@/data/recipesData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, ChefHat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactionButton from "@/components/ReactionButton";

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipe = recipesData.find(r => r.id === id);

  useEffect(() => {
    if (recipe) {
      document.title = `${recipe.name} - Przepis | Moja Serowarnia`;
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
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
            <section className="bg-card rounded-xl shadow-card border border-border p-8">
              <h2 className="text-2xl font-display font-bold text-primary mb-6">🎯 Profil smakowy</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong className="text-primary">Smak:</strong> {recipe.flavor.taste}</div>
                <div><strong className="text-primary">Tekstura:</strong> {recipe.flavor.texture}</div>
                <div><strong className="text-primary">Barwa:</strong> {recipe.flavor.color}</div>
                <div><strong className="text-primary">Zapach:</strong> {recipe.flavor.aroma}</div>
              </div>
            </section>
          )}
        </article>
      </main>
      
      <Footer />
    </div>
  );
};

export default RecipeDetails;
