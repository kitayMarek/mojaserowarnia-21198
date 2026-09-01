import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import { BannerSection } from "@/components/news/BannerSection";
import QuickAccess from "@/components/QuickAccess";
import PopularRecipesSidebar from "@/components/PopularRecipesSidebar";
import FeaturedSection from "@/components/FeaturedSection";
import Footer from "@/components/Footer";

const Index = () => {

  return (
    <div className="min-h-screen">
      <Navigation />
      <main data-hero className="pt-16 lg:pt-0" role="main">
        <Hero />

        {/* Baner aktualnosci przeniesiony tu z /wiadomosci. Tam zabieral cala
            strone, ktora ma byc pelnoprawnym dzialem z lista i archiwum, a nie
            samym rotatorem. Na stronie glownej trafia do wszystkich, nie tylko
            do tych, ktorzy weszli w zakladke. */}
        <section className="py-10 bg-background" aria-label="Aktualności">
          <div className="container mx-auto px-4">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-accent">Aktualności</h2>
              <Link
                to="/wiadomosci"
                className="text-sm font-medium text-accent underline underline-offset-2 hover:no-underline"
              >
                Wszystkie wiadomości
              </Link>
            </div>
            <BannerSection />
          </div>
        </section>
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
