import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import QuickAccess from "@/components/QuickAccess";
import PopularRecipesSidebar from "@/components/PopularRecipesSidebar";
import FeaturedSection from "@/components/FeaturedSection";
import Footer from "@/components/Footer";

const Index = () => {

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Moja Serowarnia — baza kultur, przepisy na ser, RHD/MOL</title>
        {/* meta description: jedyne źródło to statyczny tag w index.html (uniknięcie duplikatu „more than one meta description" w Bing) */}
        <link rel="canonical" href="https://mojaserowarnia.pl/" />
      </Helmet>
      <Navigation />
      <main data-hero className="pt-16 lg:pt-0" role="main">
        <Hero />
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <QuickAccess />
              </div>
              <div className="lg:col-span-1">
                <PopularRecipesSidebar />
              </div>
            </div>
          </div>
        </section>
        <FeaturedSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
