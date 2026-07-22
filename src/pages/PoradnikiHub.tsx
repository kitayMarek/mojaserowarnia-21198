import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Beaker, ShoppingCart, Scale, Factory, Flame } from "lucide-react";
import poradnikiHeaderImage from "@/assets/poradniki-header.webp";
import ReactionButton from "@/components/ReactionButton";

const PoradnikiHub = () => {

  const guides = [
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: "Poradnik dla serowarów",
      description: "Kompleksowy przewodnik po całym procesie produkcji sera - od przygotowania mleka, przez wybór kultur, proces technologiczny, po dojrzewanie i pielęgnację. Zawiera praktyczne kalkulatory, zakresy temperatur dla różnych typów serów oraz rozwiązania typowych problemów.",
      href: "/poradnik",
      color: "from-primary to-accent",
    },
    {
      icon: <Factory className="w-12 h-12" />,
      title: "Organizacja małej serowarni",
      description: "Jak zaplanować rzemieślniczą (przyzagrodową) serowarnię: układ pomieszczeń i strefy czyste/brudne, dobór sprzętu, obieg pracy od odbioru mleka po ekspedycję sera oraz wymogi lokalowe pod sprzedaż w RHD i MOL. Z polecanym filmem instruktażowym.",
      href: "/organizacja-serowarni",
      color: "from-accent to-primary",
    },
    {
      icon: <Flame className="w-12 h-12" />,
      title: "Wędzenie sera",
      description: "Kompletny przewodnik: które sery się nadają, przygotowanie i osuszanie, wybór drewna (olcha, buk, owocowe), wędzenie na zimno (20–30 °C), leżakowanie po wędzeniu i najczęstsze błędy. Wędzenie wydaje się prostą modyfikacją — ale nią nie jest.",
      href: "/wedzenie-sera",
      color: "from-primary to-accent",
    },
    {
      icon: <Beaker className="w-12 h-12" />,
      title: "Kultury bakteryjne i pleśnie",
      description: "Rozszerzony przewodnik o kulturach bakteryjnych i pleśniach: charakterystyka starterów mezofilnych i termofilnych, dawki, temperatury, pH, typowe błędy oraz gotowe mieszanki kultur do popularnych serów. Z praktyczną ściągą i tabelami referencyjnymi.",
      href: "/bakterie-kultury",
      color: "from-accent to-primary",
    },
    {
      icon: <Scale className="w-12 h-12" />,
      title: "Siła podpuszczki i flokulacja",
      description: "Szczegółowe wyjaśnienie jednostek IMCU, obliczanie odpowiedniej ilości podpuszczki oraz zaawansowana metoda flokulacji pozwalająca precyzyjnie określić najlepszy moment cięcia skrzepu dla różnych typów serów.",
      href: "/sila-podpuszczki",
      color: "from-primary to-accent",
    },
    {
      icon: <ShoppingCart className="w-12 h-12" />,
      title: "Gdzie kupić podpuszczkę",
      description: "Kompleksowe zestawienie i porównanie dostępnych na rynku podpuszczek: analiza mocy (IMCU, 1:X), praktyczne dawkowanie oraz ocena przejrzystości informacji od producentów. Pomaga wybrać najlepszą podpuszczkę dla Twoich potrzeb.",
      href: "/gdzie-kupic-podpuszczke",
      color: "from-accent to-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Poradniki serowara | Start</title>
        <meta name="description" content="Kompletne poradniki dla serowarów: kompleksowy przewodnik po produkcji sera oraz szczegółowe informacje o sile podpuszczki i metodzie flokulacji." />
        <link rel="canonical" href="https://mojaserowarnia.pl/poradniki" />
      </Helmet>
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Poradniki" }]} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <header className="relative border-b border-border py-16 md:py-24 overflow-hidden">
          <img
            src={poradnikiHeaderImage}
            alt="Poradniki dla serowarów"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/90" />
          <div className="container mx-auto px-4 relative z-10 text-primary-foreground">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Poradniki dla serowarów</h1>
            <p className="text-lg text-primary-foreground/90 max-w-3xl">
              Praktyczna wiedza serowarska zebrana w jednym miejscu. Od podstaw produkcji sera po zaawansowane techniki i obliczenia.
            </p>
          </div>
        </header>

        {/* Guides Grid */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {guides.map((guide, idx) => {
              const guideIdMap: Record<string, string> = {
                "/poradnik": "poradnik",
                "/organizacja-serowarni": "organizacja-serowarni",
                "/wedzenie-sera": "wedzenie-sera",
                "/bakterie-kultury": "bakterie-kultury",
                "/sila-podpuszczki": "sila-podpuszczki",
                "/gdzie-kupic-podpuszczke": "gdzie-kupic-podpuszczke"
              };
              const guideId = guideIdMap[guide.href] || guide.href;
              
              return (
                <a
                  key={idx}
                  href={guide.href}
                  className="group block h-full"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${guide.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            {guide.icon}
                          </div>
                          <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                            {guide.title}
                          </CardTitle>
                        </div>
                        <ReactionButton
                          contentType="guide"
                          contentId={guideId}
                          variant="compact"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {guide.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
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
