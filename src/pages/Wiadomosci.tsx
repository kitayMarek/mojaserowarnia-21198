import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import { BannerSection } from "@/components/news/BannerSection";
import { Newspaper } from "lucide-react";
import { Helmet } from "react-helmet";

const Wiadomosci = () => {
  useEffect(() => {
    document.title = "Bieżące Wiadomości - Moja Serowarnia";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Aktualności ze świata serowarstwa - nowe przepisy, kursy, wydarzenia i ważne informacje dla producentów sera w Polsce.');
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Helmet>
        <link rel="canonical" href="https://mojaserowarnia.pl/wiadomosci" />
      </Helmet>
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Wiadomości" }]} />
      <main className="pt-20" role="main">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Newspaper className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Bieżące Wiadomości
              </h1>
              <p className="text-lg text-muted-foreground">
                Najnowsze aktualności, wydarzenia i informacje ze świata serowarstwa
              </p>
            </div>
          </div>
        </section>

        {/* Banner Rotator Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <BannerSection />
          </div>
        </section>

        {/* TL;DR Section */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <TLDRSection>
              <ul className="space-y-1">
                <li>• Najnowsze <strong>wydarzenia branżowe</strong> i szkolenia serowarskie</li>
                <li>• Informacje o <strong>zmianach prawnych</strong> dotyczących RHD i MOL</li>
                <li>• <strong>Kursy i warsztaty</strong> serowarstwa w Polsce</li>
                <li>• Nowości produktowe – kultury, podpuszczki, sprzęt</li>
              </ul>
            </TLDRSection>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Bądź na bieżąco</h2>
              <p className="text-muted-foreground">
                W tej sekcji znajdziesz najważniejsze informacje dotyczące produkcji sera,
                nowych przepisów prawnych, kursów i szkoleń oraz wydarzeń branżowych.
                Sprawdzaj regularnie, aby nie przegapić ważnych aktualności!
              </p>
            </div>
          </div>
        </section>

        {/* See Also Section */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <SeeAlso links={[
              { href: "/przepisy", title: "Przepisy na domowe sery", description: "Krok po kroku jak zrobić ser" },
              { href: "/prawo", title: "Prawo dla serowarów", description: "RHD, MOL i akty prawne UE" },
              { href: "/poradnik", title: "Poradnik serowarstwa", description: "Teoria i praktyka produkcji sera" },
              { href: "/baza-kultur", title: "Baza kultur bakteryjnych", description: "Kultury mezofilne i termofilne" }
            ]} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Wiadomosci;
