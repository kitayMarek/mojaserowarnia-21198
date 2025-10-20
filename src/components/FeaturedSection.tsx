import { Calendar, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FeaturedSection = () => {
  const news = [
    {
      date: "15 Sty 2025",
      title: "Nowe kultury bakteryjne w bazie",
      description: "Dodaliśmy 15 nowych pozycji z katalogu polskich dostawców",
      badge: "Nowość",
    },
    {
      date: "10 Sty 2025",
      title: "Warsztaty serowarskie - Warmia",
      description: "Zapisz się na lutowe warsztaty produkcji serów dojrzewających",
      badge: "Wydarzenie",
    },
    {
      date: "5 Sty 2025",
      title: "Przewodnik po MOL i RHD 2025",
      description: "Zaktualizowany poradnik prawny dla małych producentów",
      badge: "Poradnik",
    },
  ];

  const highlights = [
    {
      icon: TrendingUp,
      label: "Najpopularniejsze",
      title: "Mozzarella domowa",
      subtitle: "Przepis krok po kroku",
      href: "/przepisy/mozzarella",
    },
    {
      icon: Award,
      label: "Polecane",
      title: "Startery mezofilne",
      subtitle: "Kompletny przewodnik",
      href: "/baza-kultur",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* News Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-display font-bold text-foreground">
                Aktualności
              </h2>
            </div>

            <div className="space-y-4">
              {news.map((item, index) => (
                <Card 
                  key={index} 
                  className="border-border hover:border-primary transition-all hover:shadow-card cursor-pointer group bg-card"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                            {item.badge}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{item.date}</span>
                        </div>
                        <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Highlights Section */}
          <div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-6">
              Wyróżnione
            </h3>
            
            <div className="space-y-4">
              {highlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <a key={index} href={item.href}>
                    <Card 
                      className="border-border hover:border-primary transition-all hover:shadow-card cursor-pointer group bg-card"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-primary mb-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            {item.label}
                          </span>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}

              <Card className="bg-gradient-warm border-0 text-white shadow-warm">
                <CardContent className="p-6">
                  <h4 className="font-display font-bold text-lg mb-2">
                    Dołącz do społeczności
                  </h4>
                  <p className="text-sm text-white/90 mb-4">
                    Ponad 2000 serowarów już korzysta z naszego portalu
                  </p>
                  <button className="w-full bg-white text-accent hover:bg-white/90 py-2 px-4 rounded-lg font-medium transition-colors">
                    Załóż konto
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
