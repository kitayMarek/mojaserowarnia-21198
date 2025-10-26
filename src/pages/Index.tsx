import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import QuickAccess from "@/components/QuickAccess";
import FeaturedSection from "@/components/FeaturedSection";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    document.title = "Moja Serowarnia - 145+ Kultur Bakteryjnych, Przepisy, RHD/MOL dla Serowarów";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Największa polska baza 145+ kultur bakteryjnych do produkcji sera, sprawdzone przepisy, kalkulatory i kompletne poradniki RHD/MOL. Portal stworzony przez serowarów dla serowarów.');
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
