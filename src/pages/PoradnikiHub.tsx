import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Beaker, ShoppingCart, Scale } from "lucide-react";

const PoradnikiHub = () => {
  useEffect(() => {
    document.title = "Poradniki serowara | Start";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Kompletne poradniki dla serowarów: kompleksowy przewodnik po produkcji sera oraz szczegółowe informacje o sile podpuszczki i metodzie flokulacji.");
    }
  }, []);

  const guides = [
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: "Poradnik dla serowarów",
      description: "Kompleksowy przewodnik po całym procesie produkcji sera - od przygotowania mleka, przez wybór kultur, proces technologiczny, po dojrzewanie i pielęgnację. Zawiera praktyczne kalkulatory, zakresy temperatur dla różnych typów serów oraz rozwiązania typowych problemów.",
      href: "/poradnik",
      color: "from-primary to-accent",
    },
    {
      icon: <Beaker className="w-12 h-12" />,
      title: "Siła podpuszczki i metoda flokulacji",
      description: "Szczegółowe wyjaśnienie jednostek IMCU, obliczanie odpowiedniej ilości podpuszczki oraz zaawansowana metoda flokulacji pozwalająca precyzyjnie określić najlepszy moment cięcia skrzepu dla różnych typów serów.",
      href: "/sila-podpuszczki",
      color: "from-accent to-primary",
    },
    {
      icon: <ShoppingCart className="w-12 h-12" />,
      title: "Gdzie kupić podpuszczkę",
      description: "Kompleksowe zestawienie i porównanie dostępnych na rynku podpuszczek: analiza mocy (IMCU, 1:X), praktyczne dawkowanie oraz ocena przejrzystości informacji od producentów. Pomaga wybrać najlepszą podpuszczkę dla Twoich potrzeb.",
      href: "/gdzie-kupic-podpuszczke",
      color: "from-primary to-accent",
    },
    {
      icon: <Scale className="w-12 h-12" />,
      title: "Porównanie wartości odżywczych serów",
      description: "Interaktywny kalkulator pozwalający porównać wartości odżywcze różnych rodzajów serów: kalorie, białko, tłuszcz, wapń, sód i inne składniki. Idealne narzędzie do świadomego wyboru sera odpowiedniego dla Twoich potrzeb żywieniowych.",
      href: "/porownawie-wartosci-odzywczych",
      color: "from-accent to-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <header className="bg-gradient-to-br from-primary/90 to-accent/90 text-primary-foreground border-b border-border">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Poradniki dla serowarów</h1>
            <p className="text-lg text-primary-foreground/90 max-w-3xl">
              Praktyczna wiedza serowarska zebrana w jednym miejscu. Od podstaw produkcji sera po zaawansowane techniki i obliczenia.
            </p>
          </div>
        </header>

        {/* Guides Grid */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {guides.map((guide, idx) => (
              <a
                key={idx}
                href={guide.href}
                className="group block h-full"
              >
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary">
                  <CardHeader>
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${guide.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {guide.icon}
                    </div>
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                      {guide.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {guide.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl">💡 Jak korzystać z poradników</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  <strong>Dla początkujących:</strong> Zacznij od głównego poradnika dla serowarów, który przeprowadzi Cię przez cały proces krok po kroku.
                </p>
                <p>
                  <strong>Dla zaawansowanych:</strong> Zgłębiaj szczegółowe tematy jak siła podpuszczki i metoda flokulacji, aby udoskonalić swoje techniki i uzyskać lepszą kontrolę nad procesem.
                </p>
                <p>
                  <strong>Praktyczne narzędzia:</strong> Każdy poradnik zawiera kalkulatory i tabele referencyjne, które możesz używać podczas produkcji.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PoradnikiHub;
