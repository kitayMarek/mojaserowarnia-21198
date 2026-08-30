import { ArrowRight, Users, BookOpen, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { culturesData } from "@/data/culturesDataComplete";
import { recipesData } from "@/data/recipesData";
import HeroSearch from "./HeroSearch";

/**
 * Winieta — nagłówek strony głównej w kierunku „almanach".
 *
 * DLACZEGO BEZ ZDJĘCIA: poprzedni hero był fotografią z białym tekstem na
 * przyciemnieniu. Almanach buduje charakter typografią i linijkami, a nie
 * obrazem — zdjęcie pod tekstem walczyłoby z cienkimi liniami i kapitalikami.
 * Fotografie wracają niżej, przy przepisach, gdzie niosą informację.
 *
 * Liczby są liczone z danych (nie wpisane), więc nie rozjadą się z bazą.
 */
const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Fallback value for SSG prerendering - will be updated dynamically after hydration
  const [usersCount, setUsersCount] = useState<number>(150);

  useEffect(() => {
    const fetchUsersCount = async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (count && count > 0) {
        setUsersCount(count);
      }
    };
    fetchUsersCount();
  }, []);

  const stats = [
    { icon: Database, value: culturesData.length, label: "kultur bakteryjnych" },
    { icon: BookOpen, value: recipesData.length, label: "przepisów na ser" },
    { icon: Users, value: usersCount, label: "serowarów" },
  ];

  return (
    <section className="bg-background" aria-label="Strona główna">
      <div className="container mx-auto px-4 sm:px-6 pt-8 pb-10 md:pt-12 md:pb-14 max-w-5xl text-center">
        {/* Podwójna linijka — znak rozpoznawczy almanachu */}
        <hr className="border-0 border-t-[3px] border-double border-[hsl(var(--rule-strong))]" />

        <h1 className="font-display text-[clamp(2.4rem,7vw,4.75rem)] leading-[1.05] text-foreground mt-5 mb-4">
          Moja Serowarnia
        </h1>

        {/* Ornament: linijka — winieta — linijka */}
        <div className="flex items-center justify-center gap-4 mb-5" aria-hidden="true">
          <hr className="flex-grow border-0 border-t border-[hsl(var(--rule))]" />
          <svg width="46" height="26" viewBox="0 0 46 26" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.3" className="shrink-0">
            <path d="M4 20 L23 6 L42 20 Z" strokeLinejoin="round" />
            <circle cx="17" cy="16" r="2" />
            <circle cx="27" cy="14" r="2.6" />
            <circle cx="33" cy="18" r="1.6" />
            <path d="M4 20 h38" />
          </svg>
          <hr className="flex-grow border-0 border-t border-[hsl(var(--rule))]" />
        </div>

        <p className="font-display text-xl md:text-[1.7rem] leading-snug text-foreground max-w-3xl mx-auto mb-3">
          Największa polska baza wiedzy o produkcji sera
        </p>
        <p className="text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto mb-7">
          {culturesData.length} kultur bakteryjnych z pięciu sklepów, {recipesData.length} przepisów krok po kroku,
          poradniki RHD i MOL oraz przepisy prawne — w jednym miejscu.
        </p>

        <div className="mb-8">
          <HeroSearch />
        </div>

        {/* Liczby w ramce z linijek */}
        <div className="grid grid-cols-3 border-y border-[hsl(var(--rule))] mb-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`py-4 px-2 ${i < stats.length - 1 ? "border-r border-[hsl(var(--rule))]" : ""}`}
            >
              <div className="font-display text-2xl md:text-4xl leading-none text-foreground">{stat.value}</div>
              <div className="mt-1.5 text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--kicker))]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button size="lg" onClick={() => navigate("/baza-kultur")} className="min-w-[200px] group">
            Przeglądaj bazę kultur
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/porownywarka-kultur")}
            className="min-w-[200px] border-[hsl(var(--rule-strong))]"
          >
            Porównaj kultury
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => navigate(user ? "/dashboard" : "/auth")}
            className="min-w-[200px] text-muted-foreground"
          >
            {user ? "Moja ewidencja RHD" : "Zaloguj się"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
