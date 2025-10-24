import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import QuickAccess from "@/components/QuickAccess";
import FeaturedSection from "@/components/FeaturedSection";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    document.title = "Moja Serowarnia - Baza Kultur Bakteryjnych, Przepisy na Ser, RHD/MOL";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Kompletna baza 145+ kultur bakteryjnych do produkcji sera, sprawdzone przepisy, kalkulatory i poradniki RHD/MOL. Portal dla polskich serowarów i producentów serów rzemieślniczych.');
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20" role="main">
        <Hero />
        <QuickAccess />
        <FeaturedSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
