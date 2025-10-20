import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import QuickAccess from "@/components/QuickAccess";
import FeaturedSection from "@/components/FeaturedSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        <Hero />
        <QuickAccess />
        <FeaturedSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
