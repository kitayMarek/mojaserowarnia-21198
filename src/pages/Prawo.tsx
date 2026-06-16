import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import prawoHeaderImage from "@/assets/prawo-header.webp";
import ReactionButton from "@/components/ReactionButton";
const Prawo = () => {
  useEffect(() => {
    document.title = "Prawo - Moja Serowarnia";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Informacje prawne dotyczące produkcji serów farmerskich i rzemieślniczych w Polsce i UE"
      );
    }
  }, []);

  const legalTopics = [
    {
      id: "akty-prawne-ue",
      title: "Najważniejsze akty prawne UE dotyczące produkcji serów farmerskich",
      description: "Kompletny przegląd dokumentów prawnych Unii Europejskiej regulujących produkcję serów, ze szczególnym uwzględnieniem produkcji farmerskiej i rzemieślniczej",
      icon: Scale,
      href: "/prawo/akty-prawne-ue"
    },
    {
      id: "rhd",
      title: "Rolniczy Handel Detaliczny (RHD)",
      description: "Kompletny przewodnik po formie działalności RHD - produkcja i sprzedaż serów oraz innych produktów rolnych bezpośrednio konsumentom",
      icon: FileText,
      href: "/prawo/rhd"
    },
    {
      id: "mol",
      title: "Działalność marginalna, lokalna i ograniczona (MOL)",
      description: "Szczegółowe informacje o działalności MOL - uproszczona forma produkcji i sprzedaży produktów pochodzenia zwierzęcego dla małych producentów",
      icon: FileText,
      href: "/prawo/mol"
    },
    {
      id: "rzeznia-rolnicza",
      title: "Rzeźnia Rolnicza",
      description: "Przewodnik po uruchomieniu małej ubojni drobiu przy gospodarstwie - limity, wymagania, wyposażenie i pełna procedura krok po kroku",
      icon: FileText,
      href: "/prawo/rzeznia-rolnicza"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Prawo" }]} />
      
      <main className="flex-1 pt-20">
        <header className="relative border-b border-border py-12 md:py-16 overflow-hidden">
          <img
            src={prawoHeaderImage}
            alt="Prawo dotyczące produkcji serów"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/90" />
          <div className="container mx-auto px-4 relative z-10 text-primary-foreground">
            <h1 className="text-4xl font-bold mb-4">Prawo</h1>
            <p className="text-lg text-primary-foreground/90 max-w-3xl">
              Informacje prawne i regulacje dotyczące produkcji serów
            </p>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* TL;DR Section */}
            <TLDRSection>
              <ul className="space-y-1">
                <li>• <strong>RHD</strong> (Rolniczy Handel Detaliczny) – sprzedaż bezpośrednia do 100 tys. zł/rok bez rejestracji działalności</li>
                <li>• <strong>MOL</strong> (Marginal, Local, Limited) – sprzedaż do sklepów i restauracji w promieniu 100 km</li>
                <li>• <strong>Akty prawne UE</strong> – rozporządzenia 852, 853, 854/2004 o higienie produkcji żywności</li>
                <li>• <strong>Rzeźnia rolnicza</strong> – ubój drobiu przy gospodarstwie (do 200 szt./dzień)</li>
              </ul>
            </TLDRSection>

            <div className="space-y-4">
            {legalTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Link key={topic.id} to={topic.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{topic.title}</CardTitle>
                          <CardDescription className="text-base">
                            {topic.description}
                          </CardDescription>
                        </div>
                        <ReactionButton
                          contentType="legal_page"
                          contentId={topic.id}
                          variant="compact"
                        />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
            </div>

            {/* See Also Section */}
            <SeeAlso links={[
              { href: "/przepisy", title: "Przepisy na domowe sery", description: "Jak legalnie produkować ser" },
              { href: "/poradnik", title: "Poradnik serowarstwa", description: "Podstawy produkcji sera" },
              { href: "/narzedzia", title: "Narzędzia dla serowara", description: "Kalkulatory i przeliczniki" },
              { href: "/baza-kultur", title: "Baza kultur bakteryjnych", description: "Kultury mezofilne i termofilne" }
            ]} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Prawo;
