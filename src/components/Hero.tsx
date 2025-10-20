import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-cheese.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Artisan cheese making"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 text-center py-20 md:py-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 drop-shadow-lg text-balance">
            Moja Serowarnia
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-4 font-light drop-shadow">
            Twoje centrum wiedzy o serze
          </p>
          <p className="text-base md:text-lg text-white/90 mb-10 max-w-2xl mx-auto drop-shadow">
            Profesjonalny portal dla serowarów – bazy kultur bakteryjnych, przepisy, poradniki, 
            przepisy prawne RHD/MOL i społeczność pasjonatów serowarstwa
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2 bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Szukaj kultur, przepisów, poradników..."
                  className="pl-12 h-12 border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-warm px-8"
              >
                Szukaj
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-accent hover:bg-white/90 shadow-xl group min-w-[200px]"
            >
              Przeglądaj Bazy
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white/80 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm min-w-[200px]"
            >
              Zobacz Przepisy
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
