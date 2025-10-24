import { Calendar, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FeaturedSection = () => {
  const news = [
    {
      date: "15 Sty 2025",
      title: "Kalkulator podpuszczki",
      description: "Nowy kalkulator dawkowania podpuszczki wraz z tabelami IMCU",
      badge: "Narzędzie",
      href: "/kalkulator-beaugel",
    },
    {
      date: "12 Sty 2025",
      title: "Gdzie kupić podpuszczkę?",
      description: "Kompletne zestawienie podpuszczek dostępnych w Polsce z analizą mocy",
      badge: "Poradnik",
      href: "/gdzie-kupic-podpuszczke",
    },
    {
      date: "10 Sty 2025",
      title: "Informacje o RHD dla serowarów",
      description: "Wszystko o Rolniczym Handlu Detalicznym - przepisy i dokumenty",
      badge: "Prawo",
      href: "/prawo/rhd",
    },
  ];

  const highlights = [
    {
      icon: TrendingUp,
      label: "Najpopularniejsze",
      title: "Caciotta",
      subtitle: "Przepis krok po kroku",
      href: "/przepisy/caciotta",
    },
    {
      icon: Award,
      label: "Polecane",
      title: "Startery mezofilne",
      subtitle: "Kompletny przewodnik",
      href: "/baza-kultur?type=mezofilne",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary/30" aria-labelledby="featured-heading">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* News Section */}
          <article className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 id="featured-heading" className="text-3xl font-display font-bold text-foreground">Aktualności</h2>
            </div>

            <div className="space-y-4">
              {news.map((item, index) => (
                <a key={index} href={item.href} className="block">
                  <Card className="border-border hover:border-primary transition-all hover:shadow-card cursor-pointer group bg-card">
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
                          <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </article>

          {/* Highlights Section */}
          <aside aria-labelledby="highlights-heading">
            <h3 id="highlights-heading" className="text-2xl font-display font-bold text-foreground mb-6">Wyróżnione</h3>

            <div className="space-y-4">
              {highlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <a key={index} href={item.href}>
                    <Card className="border-border hover:border-primary transition-all hover:shadow-card cursor-pointer group bg-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-primary mb-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wide">{item.label}</span>
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
                  <h4 className="font-display font-bold text-lg mb-2">Dołącz do społeczności</h4>
                  <p className="text-sm text-white/90 mb-4">Ponad 2000 serowarów już korzysta z naszego portalu</p>
                  <button className="w-full bg-white text-accent hover:bg-white/90 py-2 px-4 rounded-lg font-medium transition-colors">
                    Załóż konto
                  </button>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
