import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-cheese-clean.webp";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden" aria-label="Strona główna">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Serowar przy produkcji sera rzemieślniczego - Moja Serowarnia baza kultur bakteryjnych"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 text-center py-20 md:py-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 drop-shadow-lg text-balance">
            Moja Serowarnia
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-4 font-light drop-shadow">
            Największa polska baza wiedzy o produkcji sera
          </p>
          <p className="text-base md:text-lg text-white/90 mb-12 max-w-2xl mx-auto drop-shadow">
            145+ kultur bakteryjnych, sprawdzone przepisy, kompletne poradniki RHD/MOL 
            i regulacje prawne – wszystko czego potrzebuje polski serowar
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Button 
                size="lg" 
                onClick={() => navigate("/dashboard")}
                className="bg-white text-accent hover:bg-white/90 shadow-xl group min-w-[200px]"
              >
                📊 Moja Ewidencja RHD
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-white text-accent hover:bg-white/90 shadow-xl group min-w-[200px]"
              >
                Zaloguj się
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
            <Button 
              size="lg" 
              onClick={() => navigate("/baza-kultur")}
              variant="outline"
              className="border-2 border-white text-white bg-white/10 hover:bg-white/20 hover:border-white backdrop-blur-sm min-w-[200px] shadow-lg"
            >
              Przeglądaj Bazy
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate("/porownywarka-kultur")}
              variant="outline"
              className="border-2 border-white text-white bg-primary/25 hover:bg-primary/35 hover:border-white backdrop-blur-sm min-w-[200px] shadow-lg"
            >
              🧀 Porównaj Kultury
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
