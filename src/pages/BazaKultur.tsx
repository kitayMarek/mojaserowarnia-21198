import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import DatasetSchema from "@/components/DatasetSchema";
import FAQSchema from "@/components/FAQSchema";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useCultures } from "@/hooks/useCultures";
import kulturyHeaderImage from "@/assets/kultury-header.webp";
import ReactionButton from "@/components/ReactionButton";
import AddToListButton from "@/components/AddToListButton";
import BuyButton from "@/components/BuyButton";
import { AskLLMSelect } from "@/components/AskLLMSelect";

type SortField = 'name' | 'type' | 'shop' | 'price' | 'temperature';

// FAQ data for SEO
const faqData = [
  {
    question: "Jakie kultury bakteryjne wybrać do produkcji sera?",
    answer: "Wybór kultury zależy od typu sera: kultury mezofilne (ang. mesophilic starter cultures) pracujące w 25-35°C do serów typu Gouda, Cheddar; kultury termofilne (ang. thermophilic starter cultures) w 40-50°C do Parmezanu, Mozzarelli; kultury pleśniowe do Camemberta i Roqueforta."
  },
  {
    question: "Jaka jest różnica między kulturami mezofilnymi a termofilnymi?",
    answer: "Kultury mezofilne (ang. mesophilic) działają optymalnie w temperaturze 25-35°C i są stosowane do większości serów półtwardych. Kultury termofilne (ang. thermophilic) pracują w wyższych temperaturach 40-50°C i są niezbędne do produkcji serów twardych typu włoskiego czy szwajcarskiego."
  },
  {
    question: "Gdzie kupić kultury bakteryjne do sera w Polsce?",
    answer: "W Polsce kultury bakteryjne można kupić w specjalistycznych sklepach serowarskich takich jak Agrojelonki.pl, e-creamery.pl, BeaugelPolska.pl oraz SerBezTajemnic.pl. Ceny wahają się od 4,80 zł do 95,00 zł w zależności od rodzaju i ilości."
  },
  {
    question: "Jak przechowywać kultury bakteryjne?",
    answer: "Kultury bakteryjne należy przechowywać w zamrażarce (-18°C) do daty ważności lub w lodówce (2-8°C) przez krótszy okres. Po otwarciu używaj sterylnych narzędzi i minimalizuj kontakt z powietrzem."
  }
];

// See Also links
const seeAlsoLinks = [
  { title: "Porównywarka kultur bakteryjnych", href: "/porownywarka-kultur", description: "Porównaj składy i ceny różnych kultur" },
  { title: "Przepisy na domowe sery", href: "/przepisy", description: "Praktyczne przepisy krok po kroku" },
  { title: "Poradnik dla serowarów", href: "/poradnik", description: "Kompleksowa wiedza o serowarstwie" },
  { title: "Kalkulator siły podpuszczki", href: "/sila-podpuszczki", description: "Oblicz dawkowanie podpuszczki" },
  { title: "Gdzie kupić podpuszczkę?", href: "/gdzie-kupic-podpuszczke", description: "Lista sprawdzonych dostawców" }
];
type SortDirection = 'asc' | 'desc' | null;
const BazaKultur = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [shopFilter, setShopFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const { cultures: culturesData, loading } = useCultures();

  // Odczytaj parametry z URL i ustaw SEO
  useEffect(() => {
    const queryParam = searchParams.get('q');
    const typeParam = searchParams.get('type');
    
    if (queryParam) {
      setSearchQuery(queryParam);
    }
    
    if (typeParam) {
      setTypeFilter(typeParam);
    }

    // SEO optimization
    document.title = "Baza Kultur Bakteryjnych do Sera - 145+ Kultur Mezofilnych i Termofilnych";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Kompletna baza 145+ kultur bakteryjnych do produkcji sera z polskich sklepów. Kultury mezofilne, termofilne, pleśniowe. Porównanie cen, skład, zastosowanie i temperatura pracy.');
    }
  }, [searchParams]);
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  const filteredData = useMemo(() => {
    let filtered = culturesData.filter(culture => {
      const matchesSearch = searchQuery === "" || culture.name.toLowerCase().includes(searchQuery.toLowerCase()) || culture.composition.toLowerCase().includes(searchQuery.toLowerCase()) || culture.application.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || culture.type === typeFilter;
      const matchesShop = shopFilter === "all" || culture.shop === shopFilter;
      return matchesSearch && matchesType && matchesShop;
    });
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number = (a as unknown as Record<string, string>)[sortField] ?? "";
        let bValue: string | number = (b as unknown as Record<string, string>)[sortField] ?? "";
        if (sortField === 'price') {
          aValue = a.price_numeric ?? (parseFloat((a.price || "").replace(' zł', '').replace(',', '.')) || 0);
          bValue = b.price_numeric ?? (parseFloat((b.price || "").replace(' zł', '').replace(',', '.')) || 0);
        }
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [culturesData, searchQuery, typeFilter, shopFilter, sortField, sortDirection]);
  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setShopFilter("all");
    setSortField(null);
    setSortDirection(null);
  };
  const shops = Array.from(new Set(culturesData.map(c => c.shop)));
  const types = Array.from(new Set(culturesData.map(c => c.type)));
  return <div className="min-h-screen flex flex-col">
      <Helmet>
        {/* Canonical bez parametrów zapytania — zwija warianty /baza-kultur?q=... do jednego URL-a */}
        <link rel="canonical" href="https://mojaserowarnia.pl/baza-kultur" />
      </Helmet>
      <DatasetSchema
        name="Baza Kultur Bakteryjnych do Produkcji Sera"
        description={`Kompletna baza ${culturesData.length} kultur bakteryjnych do produkcji domowych serów z polskich sklepów specjalistycznych. Zawiera informacje o składzie bakteryjnym, zastosowaniu w serowarstwie, temperaturze pracy, typie kultury i aktualnych cenach.`}
        url="https://mojaserowarnia.pl/baza-kultur"
        keywords={[
          "kultury bakteryjne",
          "serowarstwo",
          "bakterie mlekowe",
          "kultury starterowe",
          "kultury mezofilne",
          "kultury termofilne",
          "produkcja sera",
          "domowy ser"
        ]}
        creator={{ name: "Moja Serowarnia", type: "Organization" }}
        variableMeasured={[
          "nazwa kultury",
          "skład bakteryjny",
          "temperatura pracy",
          "zastosowanie",
          "typ kultury",
          "cena"
        ]}
        dateModified={new Date().toISOString().split('T')[0]}
        distribution={[
          {
            encodingFormat: "text/html",
            contentUrl: "https://mojaserowarnia.pl/baza-kultur"
          }
        ]}
      />
      <FAQSchema faqs={faqData} />
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Baza Kultur" }]} />
      <main className="flex-1 pt-20" role="main">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          <img
            src={kulturyHeaderImage}
            alt="Kultury bakteryjne do produkcji sera"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-4">
                <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 drop-shadow-lg">Baza Kultur Bakteryjnych do Produkcji Sera</h1>
                <p className="text-lg md:text-xl text-white/95 mb-2">
                  Kompletna baza {culturesData.length} kultur bakteryjnych
                </p>
                <p className="text-base text-white/90">
                  Profesjonalne kultury starterowe z polskich sklepów specjalistycznych
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TL;DR Section */}
        <section className="py-8 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <TLDRSection>
              <p>
                <strong>Baza {culturesData.length} kultur bakteryjnych</strong> (ang. starter cultures) do produkcji domowych serów. 
                Kultury mezofilne (ang. mesophilic, 25-35°C) dla Goudy i Cheddara, termofilne (ang. thermophilic, 40-50°C) 
                dla Parmezanu i Mozzarelli. Ceny od 4,80 do 95,00 zł z polskich sklepów specjalistycznych.
              </p>
            </TLDRSection>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex justify-center mb-6">
              <ReactionButton contentType="guide" contentId="baza-kultur" variant="default" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-card p-6 rounded-xl shadow-card border border-border">
                <h3 className="text-xl font-display font-bold text-primary mb-3">
                  🦠 Czym są kultury bakteryjne do sera?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Wyselekcjonowane szczepy bakterii mlekowych (ang. lactic acid bacteria, LAB) niezbędne do produkcji serów. 
                  Przekształcają laktozę w kwas mlekowy, nadając charakterystyczny smak i teksturę.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-card border border-border">
                <h3 className="text-xl font-display font-bold text-primary mb-3">
                  🌡️ Jakie są typy kultur bakteryjnych?
                </h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li><strong>Mezofilne (ang. mesophilic, 25-35°C)</strong> - Gouda, Cheddar</li>
                  <li><strong>Termofilne (ang. thermophilic, 40-50°C)</strong> - Parmezan, Mozzarella</li>
                  <li><strong>Pleśniowe (ang. mold cultures)</strong> - Camembert, Roquefort</li>
                  <li><strong>Propionibacterium</strong> - Sery szwajcarskie</li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-card border border-border">
                <h3 className="text-xl font-display font-bold text-primary mb-3">
                  💰 Ile kosztują kultury bakteryjne?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ceny kultur wahają się od <strong>4,80 zł do 95,00 zł</strong>. 
                  Wszystkie ceny zawierają VAT 23% i są aktualizowane na podstawie oficjalnych cenników.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="py-8 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  asChild
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg"
                >
                  <Link to="/porownywarka-kultur">
                    Porównaj Kultury
                  </Link>
                </Button>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input type="text" placeholder="Szukaj nazwy, składu lub zastosowania..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Wszystkie typy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie typy</SelectItem>
                    {types.map(type => <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={shopFilter} onValueChange={setShopFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Wszystkie sklepy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie sklepy</SelectItem>
                    {shops.map(shop => <SelectItem key={shop} value={shop}>
                        {shop}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={resetFilters} variant="outline">
                  Resetuj
                </Button>
              </div>

              {/* Widget "Zapytaj AI" — kontekstowe pytania do Claude / Perplexity / ChatGPT */}
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-1">
                  Nie wiesz jaką kulturę wybrać? Zapytaj AI z gotowym kontekstem bazy:
                </p>
                <AskLLMSelect source="baza-kultur" />
              </div>
            </div>
          </div>
        </section>

        {/* Results - Mobile Card View */}
        <section className="py-8 md:hidden">
          <div className="container mx-auto px-4">
            <div className="space-y-3">
              {filteredData.length === 0 ? (
                <div className="bg-card p-8 rounded-lg text-center text-muted-foreground">
                  Nie znaleziono kultur pasujących do kryteriów wyszukiwania.
                </div>
              ) : (
                filteredData.map((culture, index) => (
                  <div key={`${culture.name}-${culture.shop}-${index}`} className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
                    <div className="bg-primary px-3 py-2">
                      <h3 className="font-bold text-primary-foreground text-sm">
                        <a 
                          href={culture.productUrl || culture.shopUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline"
                        >
                          {culture.name}
                        </a>
                      </h3>
                      {culture.lastChanged && (
                        <div className="text-xs text-primary-foreground/80 mt-1 italic">
                          📝 {culture.lastChanged}
                        </div>
                      )}
                      {culture.lastChecked && !culture.lastChanged && (
                        <div className="text-xs text-primary-foreground/80 mt-1">
                          ✓ Sprawdzono: {culture.lastChecked}
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2 text-xs">
                      <div className="flex gap-2">
                        <span className="font-bold text-primary min-w-[70px]">Skład:</span>
                        <span className="text-muted-foreground italic flex-1">{culture.composition}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-bold text-primary min-w-[70px]">Zastosowanie:</span>
                        <span className="text-muted-foreground flex-1">{culture.application}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-bold text-primary min-w-[70px]">Temperatura:</span>
                        <span className="text-foreground font-medium">{culture.temperature}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-bold text-primary min-w-[70px]">Typ:</span>
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-foreground border border-primary/20">
                          {culture.type}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-bold text-primary min-w-[70px]">Sklep:</span>
                        <a href={culture.shopUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">
                          {culture.shop}
                        </a>
                      </div>
                      <div className="flex gap-2 items-center pt-1">
                        <span className="font-bold text-primary min-w-[70px]">Cena:</span>
                        <span className="font-bold text-lg text-foreground">{culture.price}</span>
                      </div>
                      <div className="pt-1">
                        <BuyButton
                          productUrl={culture.productUrl}
                          shopUrl={culture.shopUrl}
                          shopName={culture.shop}
                          cultureName={culture.name}
                        />
                      </div>
                      <a 
                        href={culture.productUrl || culture.shopUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block mt-2 bg-primary text-white text-center py-2 rounded font-bold hover:bg-primary-hover transition-colors"
                      >
                        {culture.productUrl ? 'Kup w sklepie' : 'Odwiedź sklep'}
                      </a>
                      <div className="pt-2">
                        <AddToListButton cultureId={culture.id} cultureName={culture.name} variant="text" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 text-center bg-card p-4 rounded-lg shadow-card border border-border">
              <p className="text-muted-foreground text-sm">
                Wyświetlane: <span className="font-bold text-primary">{filteredData.length}</span> z{" "}
                <span className="font-bold text-primary">{culturesData.length}</span> kultur
              </p>
            </div>
          </div>
        </section>

        {/* Results - Desktop Table View */}
        <section className="py-8 hidden md:block">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary hover:bg-primary">
                        <TableHead className="text-white cursor-pointer hover:bg-primary-hover" onClick={() => handleSort('name')}>
                          <div className="flex items-center gap-2">
                            Nazwa Handlowa
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-white">Skład (Gatunki Bakterii)</TableHead>
                        <TableHead className="text-white">Przeznaczenie</TableHead>
                        <TableHead className="text-white cursor-pointer hover:bg-primary-hover" onClick={() => handleSort('temperature')}>
                          <div className="flex items-center gap-2">
                            Temperatura
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-white cursor-pointer hover:bg-primary-hover" onClick={() => handleSort('type')}>
                          <div className="flex items-center gap-2">
                            Typ
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-white cursor-pointer hover:bg-primary-hover" onClick={() => handleSort('shop')}>
                          <div className="flex items-center gap-2">
                            Cena
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="text-white w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length === 0 ? <TableRow>
                          <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                            Nie znaleziono kultur pasujących do kryteriów wyszukiwania.
                          </TableCell>
                        </TableRow> : filteredData.map((culture, index) => <TableRow key={`${culture.name}-${culture.shop}-${index}`}>
                            <TableCell className="font-semibold text-primary">
                              <div>
                                {culture.productUrl ? <a href={culture.productUrl} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-accent transition-colors">
                                    {culture.name}
                                  </a> : culture.name}
                                {culture.lastChanged && (
                                  <div className="text-xs text-muted-foreground font-normal mt-1 italic">
                                    📝 {culture.lastChanged}
                                  </div>
                                )}
                                {culture.lastChecked && !culture.lastChanged && (
                                  <div className="text-xs text-muted-foreground font-normal mt-1">
                                    ✓ Sprawdzono: {culture.lastChecked}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm italic max-w-xs">
                              {culture.composition}
                            </TableCell>
                            <TableCell className="text-sm max-w-sm">
                              {culture.application}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap font-medium text-foreground">
                              {culture.temperature}
                            </TableCell>
                            <TableCell>
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-foreground border border-primary/20">
                                {culture.type}
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span>{culture.price}</span>
                                <BuyButton
                                  productUrl={culture.productUrl}
                                  shopUrl={culture.shopUrl}
                                  shopName={culture.shop}
                                  cultureName={culture.name}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="w-12">
                              <AddToListButton cultureId={culture.id} cultureName={culture.name} />
                            </TableCell>
                          </TableRow>)}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="mt-6 text-center bg-card p-4 rounded-lg shadow-card border border-border">
                <p className="text-muted-foreground">
                  Wyświetlane: <span className="font-bold text-primary">{filteredData.length}</span> z{" "}
                  <span className="font-bold text-primary">{culturesData.length}</span> kultur bakteryjnych
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* See Also Section */}
        <section className="py-8 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <SeeAlso links={seeAlsoLinks} />
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default BazaKultur;