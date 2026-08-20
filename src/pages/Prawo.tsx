import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import TLDRSection from "@/components/TLDRSection";
import WprowadzenieDzialu from "@/components/WprowadzenieDzialu";
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
            <WprowadzenieDzialu
              lead="Ser z własnego gospodarstwa można legalnie sprzedawać — pytanie brzmi tylko, w którym trybie."
              bloki={[
                {
                  tytul: "RHD — sprzedaż konsumentowi",
                  tekst:
                    "Do 100 000 zł rocznie bez zakładania działalności gospodarczej, z ryczałtem 2% powyżej limitu. Sprzedajesz osobie, która zjada — na targu, z gospodarstwa, na jarmarku. Zgłoszenie do powiatowego lekarza weterynarii przed startem.",
                },
                {
                  tytul: "MOL — sprzedaż do sklepów",
                  tekst:
                    "Gdy odbiorcą ma być sklep albo restauracja, RHD nie wystarczy. MOL dopuszcza sprzedaż do zakładów detalicznych w ograniczonym promieniu i przy tygodniowych limitach ilościowych.",
                },
                {
                  tytul: "Dokumenty i oznakowanie",
                  tekst:
                    "Ewidencja sprzedaży, wzory zgłoszeń, wymagane dane na etykiecie i faktura VAT RR, której nabywca często nie umie wystawić. Wszystko z odesłaniem do konkretnych przepisów, nie do ogólników.",
                },
              ]}
              podsumowanie="Przepisy zmieniają się częściej, niż by się chciało, dlatego przy każdej liczbie podajemy podstawę prawną — żeby dało się sprawdzić, czy nadal obowiązuje. To nie zastępuje rozmowy z powiatowym lekarzem weterynarii, ale pozwala pójść tam przygotowanym."
              tropy={[
                {
                  sytuacja: "Chcesz zacząć sprzedawać",
                  propozycja: "— limity, rejestracja, podatki:",
                  href: "/prawo/rhd",
                  etykieta: "rolniczy handel detaliczny",
                },
                {
                  sytuacja: "Chcesz sprzedawać do sklepów",
                  propozycja: "— inne zasady i inne limity:",
                  href: "/prawo/mol",
                  etykieta: "MOL",
                },
                {
                  sytuacja: "Potrzebujesz wzorów",
                  propozycja: "— zgłoszenia i ewidencja do pobrania:",
                  href: "/prawo/rhd/dokumenty",
                  etykieta: "dokumenty RHD",
                },
                {
                  sytuacja: "Nie wiesz, co na etykiecie",
                  propozycja: "— wygeneruj gotową:",
                  href: "/etykieta-rhd",
                  etykieta: "etykieta do sprzedaży",
                },
              ]}
            />

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
