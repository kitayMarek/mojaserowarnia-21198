import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Scale } from "lucide-react";
import { Link } from "react-router-dom";

const Prawo = () => {
  useEffect(() => {
    document.title = "Prawo - Serowarstwo.pl";
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
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-primary">Prawo</h1>
            <p className="text-lg text-muted-foreground">
              Informacje prawne i regulacje dotyczące produkcji serów
            </p>
          </div>

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
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Prawo;
