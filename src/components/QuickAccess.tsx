import { Database, BookOpen, GraduationCap, Scale, Users, Calculator, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const QuickAccess = () => {
  const { user } = useAuth();

  const sections = [
    {
      icon: FileText,
      title: "System Ewidencji",
      description: "Ewidencja sprzedaży i rachunki RHD",
      color: "from-green-500 to-emerald-600",
      href: user ? "/dashboard" : "/auth",
      requiresAuth: true,
    },
    {
      icon: Database,
      title: "Bazy Kultur",
      description: "Kultury bakteryjne, enzymy, sprzęt",
      color: "from-amber-500 to-orange-500",
      href: "/baza-kultur",
    },
    {
      icon: BookOpen,
      title: "Przepisy",
      description: "Sprawdzone receptury na sery",
      color: "from-orange-500 to-red-500",
      href: "/przepisy",
    },
    {
      icon: GraduationCap,
      title: "Poradniki",
      description: "Kompletne przewodniki po produkcji sera",
      color: "from-amber-600 to-yellow-600",
      href: "/poradniki",
    },
    {
      icon: Scale,
      title: "Prawo",
      description: "RHD, MOL i regulacje",
      color: "from-yellow-600 to-amber-600",
      href: "/prawo",
    },
    {
      icon: Calculator,
      title: "Narzędzia",
      description: "Kalkulatory i generatory",
      color: "from-amber-500 to-orange-600",
      href: "/narzedzia",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background" aria-labelledby="quick-access-heading">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="quick-access-heading" className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Szybki dostęp
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Znajdź wszystko, czego potrzebujesz do produkcji doskonałych serów
          </p>
        </div>

        <nav aria-label="Główne sekcje portalu">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <a
                key={section.href}
                href={section.href}
                className="group"
              >
                <Card className="h-full border-border hover:border-primary transition-all duration-300 hover:shadow-card group-hover:scale-[1.02] bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-warm group-hover:shadow-lg transition-shadow`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>
        </nav>
      </div>
    </section>
  );
};

export default QuickAccess;
