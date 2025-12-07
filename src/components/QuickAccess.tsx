import { Database, BookOpen, GraduationCap, Scale, Calculator, FileText, Newspaper, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useRef } from "react";
import { culturesData } from "@/data/culturesDataComplete";
import { recipesData } from "@/data/recipesData";
import { supabase } from "@/integrations/supabase/client";

interface Section {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  href: string;
  count?: string;
  isNew?: boolean;
}

const QuickAccess = () => {
  const [hasNewNews, setHasNewNews] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Check for new news (last 7 days)
  useEffect(() => {
    const checkNewNews = async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data } = await supabase
        .from('news_banners')
        .select('date')
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .eq('is_published', true)
        .limit(1);
      
      setHasNewNews(!!data && data.length > 0);
    };
    checkNewNews();
  }, []);

  // Intersection Observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const sections: Section[] = [
    {
      icon: FileText,
      title: "System Ewidencji",
      description: "Ewidencja sprzedaży i rachunki RHD",
      color: "from-green-500 to-emerald-600",
      href: "/system-ewidencji",
    },
    {
      icon: Database,
      title: "Bazy Kultur",
      description: "Kultury bakteryjne, enzymy, sprzęt",
      color: "from-amber-500 to-orange-500",
      href: "/baza-kultur",
      count: `${culturesData.length} kultur`,
    },
    {
      icon: BookOpen,
      title: "Przepisy",
      description: "Sprawdzone receptury na sery",
      color: "from-orange-500 to-red-500",
      href: "/przepisy",
      count: `${recipesData.length} przepisów`,
    },
    {
      icon: GraduationCap,
      title: "Poradniki",
      description: "Kompletne przewodniki po produkcji sera",
      color: "from-amber-600 to-yellow-600",
      href: "/poradniki",
    },
    {
      icon: Newspaper,
      title: "Wiadomości",
      description: "Aktualności ze świata serowarstwa",
      color: "from-indigo-500 to-blue-500",
      href: "/wiadomosci",
      isNew: hasNewNews,
    },
    {
      icon: Scale,
      title: "Prawo",
      description: "RHD, MOL i regulacje",
      color: "from-yellow-600 to-amber-600",
      href: "/prawo",
      count: "3 kategorie",
    },
    {
      icon: Calculator,
      title: "Narzędzia",
      description: "Kalkulatory i generatory",
      color: "from-amber-500 to-orange-600",
      href: "/narzedzia",
      count: "6 narzędzi",
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-24 bg-background" 
      aria-labelledby="quick-access-heading"
    >
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 id="quick-access-heading" className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Szybki dostęp
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Znajdź wszystko, czego potrzebujesz do produkcji doskonałych serów
          </p>
        </div>

        <nav aria-label="Główne sekcje portalu">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <a
                  key={section.href}
                  href={section.href}
                  className={`group transition-all duration-500 ${
                    isVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
                >
                  <Card className="h-full border-border hover:border-primary transition-all duration-300 hover:shadow-card group-hover:scale-[1.02] bg-card">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-warm group-hover:shadow-lg transition-all duration-300`}>
                          <Icon className="h-7 w-7 text-white transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                              {section.title}
                            </h3>
                            {section.isNew && (
                              <Badge variant="destructive" className="text-xs animate-pulse">
                                NOWE
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                            {section.description}
                          </p>
                          {section.count && (
                            <Badge variant="secondary" className="text-xs">
                              {section.count}
                            </Badge>
                          )}
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
