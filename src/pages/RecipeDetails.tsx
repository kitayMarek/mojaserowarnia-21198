import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { recipesData } from "@/data/recipesData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock, ChefHat, Lightbulb, AlertTriangle, Shuffle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactionButton from "@/components/ReactionButton";
import RecipeSchema from "@/components/RecipeSchema";
import FAQSchema from "@/components/FAQSchema";
import HowToSchema from "@/components/HowToSchema";
import SeeAlso from "@/components/SeeAlso";
import VideoPrzepisu from "@/components/VideoPrzepisu";
import { daniaZSera } from "@/lib/powiazaniaPrzepisow";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipe = recipesData.find(r => r.id === id);
  const dania = recipe ? daniaZSera(recipe.id) : [];

  useEffect(() => {
    if (recipe) {
      // Tytuł i opis pisane pod konkretny przepis mają pierwszeństwo przed szablonem.
      // Szablon zostaje dla przepisów, którym nikt jeszcze tekstu nie napisał — a opis
      // brany z pierwszych 160 znaków `description` to definicja sera, nie powód do
      // kliknięcia, i przy emmentalu kosztował nas CTR 0,74% przy 6515 wyświetleniach.
      document.title = recipe.seoTitle
        ? `${recipe.seoTitle} | Moja Serowarnia`
        : `${recipe.name} — przepis na ser krok po kroku | Moja Serowarnia`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          recipe.seoDescription ?? recipe.description.slice(0, 160),
        );
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
    { title: "Przewodnik po kulturach", href: "/bakterie-kultury", description: "Zrozum kultury z tego przepisu — dobór, dawki, temperatury" },
    { title: "Porównywarka kultur", href: "/porownywarka-kultur", description: "Porównaj kultury różnych producentów" },
    { title: "Kalkulator kosztu sera", href: "/kalkulator-kosztu-sera", description: "Oblicz koszt produkcji sera" },
    { title: "Kalkulator solanki i CaCl₂", href: "/kalkulator-solanki", description: "Ile soli na solankę i chlorku wapnia do mleka" },
    { title: "Poradnik serowarski", href: "/poradnik", description: "Praktyczne wskazówki dla serowarów" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <RecipeSchema recipe={recipe} />
      {recipe.encyklopedia && recipe.encyklopedia.length > 0 && (
        <FAQSchema
          faqs={recipe.encyklopedia.map((e) => ({ question: e.pytanie, answer: e.odpowiedz }))}
        />
      )}
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
          <div className="bg-card rounded-xl border border-border overflow-hidden mb-8">
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-5 mb-8">
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
              className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
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

          {/* Sekcja encyklopedyczna — NAD przepisem.
              Fraza "ser gruyere" (8 100/mies) to intencja informacyjna: ludzie
              pytaja CO TO ZA SER, a strona odpowiadala wylacznie "jak go zrobic".
              Przepis zostaje nizej jako wyroznik — nikt inny w polskim internecie
              nie konczy artykulu o gruyere zdaniem "a teraz zrob go sam". */}
          {recipe.encyklopedia && recipe.encyklopedia.length > 0 && (
            <section className="bg-card rounded-xl border border-border p-8 mb-8">
              <div className="space-y-6">
                {recipe.encyklopedia.map((wpis, i) => (
                  <div key={i}>
                    <h2 className="text-xl font-display font-bold text-primary mb-2">
                      {wpis.pytanie}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">{wpis.odpowiedz}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Przepis bazowy */}
          <section className="bg-card rounded-xl border border-border p-8 mb-8">
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
          <section className="bg-card rounded-xl border border-border p-8 mb-8">
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
          <section className="bg-card rounded-xl border border-border p-8 mb-8">
            <h2 className="text-2xl font-display font-bold text-primary mb-6">📖 Kroki przygotowania</h2>
            
            <div className="space-y-6">
              {recipe.steps.map((step, idx) => (
                <div key={idx} id={`krok-${idx + 1}`} className="bg-secondary/5 rounded-lg p-6 border-l-4 border-accent scroll-mt-24">
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

          {/* Film instruktażowy — pokazuje się tylko, gdy przepis ma przypisany film */}
          {recipe.video && (
            <section className="bg-card rounded-xl border border-border p-8 mb-8">
              <h2 className="text-2xl font-display font-bold text-primary mb-6">🎬 Film instruktażowy</h2>
              <VideoPrzepisu
                youtubeId={recipe.video.youtubeId}
                title={recipe.video.title}
                channel={recipe.video.channel}
                poster={recipe.video.poster ?? recipe.image}
              />
            </section>
          )}

          {/* Porady, ostrzezenia i warianty — dane byly w recipesData od poczatku,
              ale zaden komponent ich nie renderowal. 24 przepisy, 173 pozycje
              widoczne wylacznie w mirrorach statycznych, nie dla czytelnikow. */}
          {recipe.notes && (
            <section className="bg-card rounded-xl border border-border p-8 mb-8">
              <h2 className="text-2xl font-display font-bold text-primary mb-6">📝 Porady i warianty</h2>

              {recipe.notes.tips?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" aria-hidden="true" /> Wskazówki
                  </h3>
                  <ul className="space-y-2">
                    {recipe.notes.tips.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-primary shrink-0" aria-hidden="true">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.notes.warnings?.length > 0 && (
                <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" aria-hidden="true" /> Na co uważać
                  </h3>
                  <ul className="space-y-2">
                    {recipe.notes.warnings.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-destructive shrink-0" aria-hidden="true">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recipe.notes.variants?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                    <Shuffle className="h-5 w-5" aria-hidden="true" /> Warianty
                  </h3>
                  <ul className="space-y-2">
                    {recipe.notes.variants.map((v, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-primary shrink-0" aria-hidden="true">•</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Wyjaśnienie mechanizmu — wywód ze źródłem, nie lista wskazówek */}
          {recipe.wyjasnienie && (
            <section className="bg-card rounded-xl border border-border p-8 mb-8">
              <h2 className="text-2xl font-display font-bold text-primary mb-6">
                {recipe.wyjasnienie.tytul}
              </h2>

              <div className="space-y-4">
                {recipe.wyjasnienie.akapity.map((a, i) => (
                  <p key={i} className="text-sm leading-relaxed">{a}</p>
                ))}
              </div>

              <p className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
                <strong>Źródło:</strong>{" "}
                {recipe.wyjasnienie.zrodlo.url ? (
                  <a
                    href={recipe.wyjasnienie.zrodlo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-primary"
                  >
                    {recipe.wyjasnienie.zrodlo.tekst}
                  </a>
                ) : (
                  recipe.wyjasnienie.zrodlo.tekst
                )}
              </p>
            </section>
          )}

          {/* Profil smakowy */}
          {recipe.flavor && (
            <section className="bg-card rounded-xl border border-border p-8 mb-8">
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
            <section className="bg-card rounded-xl border border-border p-8">
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

          {/* Most do dzialu kulinarnego. Dotad zaden z 24 przepisow na ser nie
              prowadzil do kuchni, wiec czytelnik konczyl na gotowym serze i nie
              dostawal zadnej podpowiedzi, co dalej. */}
          {(recipe.zastosowanie || dania.length > 0) && (
            <section className="bg-card rounded-xl border border-border p-8 mb-8">
              <h2 className="text-2xl font-display font-bold text-primary mb-4">🍽️ Do czego używać tego sera</h2>

              {recipe.zastosowanie && (
                <p className="text-muted-foreground leading-relaxed mb-6">{recipe.zastosowanie}</p>
              )}

              {dania.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dania.map((danie) => (
                  <Link
                    key={danie.id}
                    to={`/przepisy-kulinarne/${danie.id}`}
                    className="group flex gap-4 rounded-lg border border-border p-4 transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <img
                      src={danie.image}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="h-20 w-20 shrink-0 rounded-md object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold text-primary group-hover:underline">
                        {danie.name}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {danie.subtitle}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {danie.prepTime} + {danie.cookTime} · {danie.servings} porcje · {danie.difficulty}
                      </span>
                    </span>
                  </Link>
                ))}
                </div>
              )}

              {/* Odnosnik do dzialu kulinarnego jest ZAWSZE, takze gdy nie mamy
                  jeszcze dania z tym serem. Google klasyfikuje zapytania
                  "[ser] przepis" jako kulinarne, wiec strona musi jasno mowic,
                  ze dzial z daniami istnieje. */}
              <p className="mt-6 text-sm">
                <Link to="/przepisy-kulinarne" className="text-primary underline underline-offset-2 hover:no-underline font-medium">
                  Zobacz wszystkie przepisy kulinarne z serami
                </Link>
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
