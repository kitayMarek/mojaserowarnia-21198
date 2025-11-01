import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import narzedziaHeaderImage from "@/assets/narzedzia-header.webp";
import ReactionButton from "@/components/ReactionButton";

const Narzedzia = () => {
  useEffect(() => {
    document.title = "Narzędzia dla Serowara - Kalkulatory i Konwertery | Serowarstwo.pl";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Praktyczne narzędzia dla serowarów: kalkulator miar, podpuszczki Beaugel i kosztu sera. Kalkulatory IMCU, konwertery jednostek i obliczenia produkcji.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <img
            src={narzedziaHeaderImage}
            alt="Narzędzia dla serowara"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            loading="eager"
            fetchPriority="high"
          />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                Narzędzia dla Serowara
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Praktyczne kalkulatory i konwertery ułatwiające codzienną pracę w serowarni
              </p>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              {/* Kalkulator Miar */}
              <Card className="group border-border hover:border-primary transition-all duration-300 hover:shadow-card bg-card">
                <CardContent className="p-8">
                  <div className="flex justify-end mb-2">
                    <ReactionButton
                      contentType="tool"
                      contentId="kalkulator-miar"
                      variant="compact"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-warm group-hover:shadow-lg transition-shadow">
                      <Calculator className="h-10 w-10 text-white" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                        Kalkulator Miar
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Dwukierunkowy przelicznik jednostek miar: długość, masa, objętość, temperatura, prędkość, ciśnienie i powierzchnia. Obsługuje format imperial i metryczny.
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="text-sm text-muted-foreground space-y-2 w-full text-left">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Konwersja stóp i cali (np. 5'7")</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Miary kuchenne (tsp, tbsp, cup)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Regulowana precyzja wyników</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Szybkie pary konwersji</span>
                      </li>
                    </ul>

                    {/* Button */}
                    <Button 
                      asChild
                      className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-warm"
                    >
                      <a 
                        href="/kalkulator-miar"
                        className="flex items-center justify-center gap-2"
                      >
                        Otwórz Kalkulator
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Kalkulator Beaugel */}
              <Card className="group border-border hover:border-primary transition-all duration-300 hover:shadow-card bg-card">
                <CardContent className="p-8">
                  <div className="flex justify-end mb-2">
                    <ReactionButton
                      contentType="tool"
                      contentId="kalkulator-beaugel"
                      variant="compact"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-warm group-hover:shadow-lg transition-shadow">
                      <Calculator className="h-10 w-10 text-white" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                        Kalkulator Podpuszczki
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Precyzyjne obliczenia dawki dla podpuszczek Beaugel (5/50/500) oraz uniwersalny kalkulator IMCU dla wszystkich rodzajów podpuszczek.
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="text-sm text-muted-foreground space-y-2 w-full text-left">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Beaugel 5, 50, 500 (Coquard)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Uniwersalny kalkulator IMCU</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Obliczenia rozcieńczeń roboczych</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Przeliczniki na krople i łyżeczki</span>
                      </li>
                    </ul>

                    {/* Button */}
                    <Button 
                      asChild
                      className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-warm"
                    >
                      <a 
                        href="/kalkulator-beaugel"
                        className="flex items-center justify-center gap-2"
                      >
                        Otwórz Kalkulator
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Kalkulator Kosztu Sera */}
              <Card className="group border-border hover:border-primary transition-all duration-300 hover:shadow-card bg-card">
                <CardContent className="p-8">
                  <div className="flex justify-end mb-2">
                    <ReactionButton
                      contentType="tool"
                      contentId="kalkulator-kosztu-sera"
                      variant="compact"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-warm group-hover:shadow-lg transition-shadow">
                      <Calculator className="h-10 w-10 text-white" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                        Kalkulator Kosztu Sera
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Kompleksowy kalkulator obliczający koszty produkcji sera: wydajność z mleka, składniki, koszty stałe, marża i cena sprzedaży.
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="text-sm text-muted-foreground space-y-2 w-full text-left">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Automatyczne wyliczenie wagi z mleka</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Lista składników z cenami i VAT</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Uwzględnienie strat procesu</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Obliczenia marży i ceny sprzedaży</span>
                      </li>
                    </ul>

                    {/* Button */}
                    <Button 
                      asChild
                      className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-warm"
                    >
                      <a 
                        href="/kalkulator-kosztu-sera"
                        className="flex items-center justify-center gap-2"
                      >
                        Otwórz Kalkulator
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Kalkulator Pasz */}
              <Card className="group border-border hover:border-primary transition-all duration-300 hover:shadow-card bg-card">
                <CardContent className="p-8">
                  <div className="flex justify-end mb-2">
                    <ReactionButton
                      contentType="tool"
                      contentId="kalkulator-pasz"
                      variant="compact"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-warm group-hover:shadow-lg transition-shadow">
                      <Calculator className="h-10 w-10 text-white" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                        Kalkulator Pasz
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Zbilansuj paszę dla drobiu zgodnie z normami żywieniowymi. Kalkulator dla kur, brojlerów, kaczek, gęsi i indyków z automatycznym przeliczaniem składników.
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="text-sm text-muted-foreground space-y-2 w-full text-left">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Normy dla 6 typów drobiu</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Automatyczne wyliczenia EM, Ca, P</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Baza 11 popularnych składników</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Analiza kosztów mieszanki</span>
                      </li>
                    </ul>

                    {/* Button */}
                    <Button 
                      asChild
                      className="w-full mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-warm"
                    >
                      <a 
                        href="/kalkulator-pasz"
                        className="flex items-center justify-center gap-2"
                      >
                        Otwórz Kalkulator
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Placeholder for future tools */}
              <Card className="border-border border-dashed bg-card/50">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center">
                    <span className="text-4xl text-muted-foreground/50">?</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-muted-foreground mb-2">
                      Wkrótce
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Kolejne narzędzia są w przygotowaniu
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border border-dashed bg-card/50">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center">
                    <span className="text-4xl text-muted-foreground/50">?</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-muted-foreground mb-2">
                      Wkrótce
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Kolejne narzędzia są w przygotowaniu
                    </p>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                Potrzebujesz innego narzędzia?
              </h2>
              <p className="text-muted-foreground">
                Pracujemy nad kolejnymi kalkulatorami i konwerterami. Jeśli masz pomysł na przydatne narzędzie, daj nam znać!
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Narzedzia;
