import { FileText, BarChart3, Receipt, Settings, ArrowRight, Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ewidencjaHeader from "@/assets/ewidencja-header.png";

const SystemEwidencji = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: "Pulpit Główny",
      description: "Monitoring przychodów z bieżącego roku, wizualizacja postępów względem limitu 100 000 zł oraz automatyczne ostrzeżenia przy zbliżaniu się do limitu RHD.",
      color: "from-blue-500 to-cyan-600",
      benefits: ["Podgląd przychodów w czasie rzeczywistym", "Wizualizacja limitu RHD", "Automatyczne ostrzeżenia"]
    },
    {
      icon: FileText,
      title: "Ewidencja Sprzedaży",
      description: "Szczegółowa rejestracja każdej transakcji sprzedaży - rodzaj żywności, ilość, cena, nabywca. Możliwość przeglądania, edycji oraz eksportu danych do plików CSV i PDF.",
      color: "from-emerald-500 to-green-600",
      benefits: ["Dodawanie i edycja rekordów", "Historia wszystkich transakcji", "Eksport do CSV i PDF"]
    },
    {
      icon: Receipt,
      title: "Rachunki RHD",
      description: "Wystawianie profesjonalnych rachunków RHD z automatyczną numeracją, wszystkimi wymaganymi danymi sprzedającego i nabywcy oraz opcją drukowania i archiwizacji dokumentów.",
      color: "from-amber-500 to-orange-600",
      benefits: ["Automatyczna numeracja", "Zgodność z przepisami", "Drukowanie i archiwizacja"]
    },
    {
      icon: Settings,
      title: "Ustawienia",
      description: "Personalizacja profilu i zarządzanie danymi firmy - nazwa, adres, NIP, numer weterynaryjny oraz preferencje powiadomień i zgody marketingowe.",
      color: "from-purple-500 to-violet-600",
      benefits: ["Zarządzanie danymi firmy", "Personalizacja profilu", "Kontrola powiadomień"]
    }
  ];

  const compliancePoints = [
    "Zgodność z przepisami o Rolniczym Handlu Detalicznym (RHD)",
    "Automatyczne śledzenie limitu 100 000 zł przychodu rocznego",
    "Archiwizacja dokumentów sprzedaży zgodnie z wymogami prawnymi",
    "Profesjonalne rachunki z wszystkimi wymaganymi danymi",
    "Eksport danych dla celów księgowych i kontrolnych"
  ];

  const handleCTAClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <PageBreadcrumbs items={[{ label: "System Ewidencji" }]} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={ewidencjaHeader} 
              alt="Serowarnia z ewidencją i rachunkami RHD" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                Zgodność z przepisami RHD
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
                System Ewidencji Sprzedaży
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Kompleksowe narzędzie do zarządzania sprzedażą w ramach Rolniczego Handlu Detalicznego. 
                Rejestruj transakcje, monitoruj przychody i wystawiaj rachunki - wszystko w jednym miejscu.
              </p>
              <Button 
                onClick={handleCTAClick}
                size="lg" 
                className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-warm text-lg px-8 py-6 h-auto"
              >
                {user ? "Przejdź do Ewidencji" : "Zacznij korzystać"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Cztery główne funkcje systemu
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Wszystko, czego potrzebujesz do profesjonalnego prowadzenia ewidencji sprzedaży
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="border-border hover:border-primary transition-all duration-300 hover:shadow-card">
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-warm mb-4`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-display">{feature.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit) => (
                          <li key={benefit} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Compliance Section */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                  Zgodność z przepisami
                </h2>
                <p className="text-lg text-muted-foreground">
                  System zaprojektowany z myślą o pełnej zgodności z regulacjami dotyczącymi RHD
                </p>
              </div>

              <Card className="border-border">
                <CardContent className="p-8">
                  <ul className="space-y-4">
                    {compliancePoints.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Ważne:</strong> System pomoże Ci śledzić przychody, 
                      ale pamiętaj, że zgodność z przepisami to również Twoja odpowiedzialność. 
                      Zalecamy konsultację z księgowym lub prawnikiem w sprawie obowiązków podatkowych i ewidencyjnych.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                Gotowy na prostszą ewidencję?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {user 
                  ? "Przejdź do swojej ewidencji i zacznij rejestrować sprzedaż już dziś."
                  : "Załóż darmowe konto i zacznij korzystać z systemu ewidencji już dziś."
                }
              </p>
              <Button 
                onClick={handleCTAClick}
                size="lg" 
                className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-warm text-lg px-8 py-6 h-auto"
              >
                {user ? "Otwórz Panel Ewidencji" : "Załóż konto"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SystemEwidencji;
