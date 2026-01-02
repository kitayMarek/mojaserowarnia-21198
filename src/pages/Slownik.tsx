import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import DatasetSchema from "@/components/DatasetSchema";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen } from "lucide-react";
import { useState, useMemo } from "react";

interface GlossaryTerm {
  pl: string;
  en: string;
  definition: string;
  category: string;
}

const glossaryTerms: GlossaryTerm[] = [
  // Podstawowe pojęcia
  { pl: "Ser", en: "Cheese", definition: "Produkt mleczny otrzymywany przez koagulację białek mleka, głównie kazeiny.", category: "Podstawy" },
  { pl: "Serowarstwo", en: "Cheesemaking", definition: "Proces i rzemiosło produkcji sera z mleka.", category: "Podstawy" },
  { pl: "Serowarnia", en: "Cheese dairy / Fromagerie", definition: "Zakład lub pomieszczenie do produkcji serów.", category: "Podstawy" },
  { pl: "Mleko surowe", en: "Raw milk", definition: "Mleko niepasteryzowane, zachowujące naturalną mikroflorę.", category: "Podstawy" },
  { pl: "Pasteryzacja", en: "Pasteurization", definition: "Proces obróbki termicznej mleka w celu eliminacji patogenów.", category: "Podstawy" },
  
  // Kultury i enzymy
  { pl: "Kultury starterowe", en: "Starter cultures", definition: "Wyselekcjonowane szczepy bakterii kwasu mlekowego inicjujące fermentację.", category: "Kultury" },
  { pl: "Podpuszczka", en: "Rennet", definition: "Enzym powodujący koagulację kazeiny w mleku.", category: "Kultury" },
  { pl: "Chymozyna", en: "Chymosin", definition: "Główny enzym w podpuszczce odpowiedzialny za krzepnięcie mleka.", category: "Kultury" },
  { pl: "Kultury mezofilne", en: "Mesophilic cultures", definition: "Bakterie aktywne w temperaturze 20-40°C.", category: "Kultury" },
  { pl: "Kultury termofilne", en: "Thermophilic cultures", definition: "Bakterie aktywne w temperaturze 40-55°C.", category: "Kultury" },
  { pl: "Kultury aromatyczne", en: "Aromatic cultures", definition: "Bakterie wytwarzające związki aromatyczne i CO₂.", category: "Kultury" },
  { pl: "Pleśń szlachetna", en: "Noble mold", definition: "Grzyby Penicillium nadające serom charakterystyczny smak i wygląd.", category: "Kultury" },
  { pl: "Bakterie propionowe", en: "Propionic bacteria", definition: "Bakterie tworzące oczka w serach typu szwajcarskiego.", category: "Kultury" },
  { pl: "Brevibacterium linens", en: "Brevibacterium linens", definition: "Bakteria nadająca pomarańczowy kolor i intensywny aromat serom.", category: "Kultury" },
  
  // Proces produkcji
  { pl: "Koagulacja", en: "Coagulation", definition: "Proces krzepnięcia mleka pod wpływem podpuszczki lub kwasu.", category: "Proces" },
  { pl: "Skrzep", en: "Curd", definition: "Skoagulowane białka mleka przed oddzieleniem serwatki.", category: "Proces" },
  { pl: "Serwatka", en: "Whey", definition: "Płynna frakcja pozostała po oddzieleniu skrzepu.", category: "Proces" },
  { pl: "Formowanie", en: "Molding", definition: "Nadawanie kształtu serowi w formach.", category: "Proces" },
  { pl: "Prasowanie", en: "Pressing", definition: "Usuwanie nadmiaru serwatki poprzez nacisk.", category: "Proces" },
  { pl: "Solenie", en: "Salting", definition: "Dodawanie soli w celu konserwacji i kształtowania smaku.", category: "Proces" },
  { pl: "Solanka", en: "Brine", definition: "Roztwór soli do zanurzeniowego solenia serów.", category: "Proces" },
  { pl: "Dojrzewanie", en: "Aging / Ripening / Affinage", definition: "Proces leżakowania sera w kontrolowanych warunkach.", category: "Proces" },
  { pl: "Pielęgnacja skórki", en: "Rind care", definition: "Zabiegi wykonywane na powierzchni sera podczas dojrzewania.", category: "Proces" },
  { pl: "Krojenie skrzepu", en: "Cutting the curd", definition: "Dzielenie skrzepu na mniejsze kawałki harfą serowarską.", category: "Proces" },
  { pl: "Dogrzewanie", en: "Scalding", definition: "Podgrzewanie skrzepu w celu zwiększenia odwadniania.", category: "Proces" },
  { pl: "Cheddaring", en: "Cheddaring", definition: "Technika układania i obracania bloków skrzepu.", category: "Proces" },
  { pl: "Ciągnięcie ciasta", en: "Stretching / Pasta filata", definition: "Rozciąganie gorącego skrzepu w produkcji mozzarelli.", category: "Proces" },
  
  // Typy serów
  { pl: "Ser twardy", en: "Hard cheese", definition: "Ser o niskiej zawartości wody, długo dojrzewający.", category: "Typy" },
  { pl: "Ser półtwardy", en: "Semi-hard cheese", definition: "Ser o średniej twardości i wilgotności.", category: "Typy" },
  { pl: "Ser miękki", en: "Soft cheese", definition: "Ser o wysokiej zawartości wody i kremowej konsystencji.", category: "Typy" },
  { pl: "Ser świeży", en: "Fresh cheese", definition: "Ser niefermentowany lub krótko dojrzewający.", category: "Typy" },
  { pl: "Ser pleśniowy", en: "Blue cheese / Mold cheese", definition: "Ser z pleśnią wewnątrz lub na powierzchni.", category: "Typy" },
  { pl: "Ser z białą pleśnią", en: "White mold cheese", definition: "Ser pokryty białą pleśnią Penicillium candidum.", category: "Typy" },
  { pl: "Ser z niebieską pleśnią", en: "Blue-veined cheese", definition: "Ser z przerostami Penicillium roqueforti.", category: "Typy" },
  { pl: "Ser z myciem skórki", en: "Washed-rind cheese", definition: "Ser pielęgnowany przez mycie solanką lub alkoholem.", category: "Typy" },
  { pl: "Ser podpuszczkowy", en: "Rennet cheese", definition: "Ser wytwarzany z użyciem podpuszczki.", category: "Typy" },
  { pl: "Ser kwasowy", en: "Acid-set cheese", definition: "Ser wytwarzany przez zakwaszenie mleka.", category: "Typy" },
  
  // Sprzęt
  { pl: "Kocioł serowy", en: "Cheese vat", definition: "Naczynie do podgrzewania mleka i formowania skrzepu.", category: "Sprzęt" },
  { pl: "Harfa serowarska", en: "Cheese harp / Curd cutter", definition: "Narzędzie z drucikami do krojenia skrzepu.", category: "Sprzęt" },
  { pl: "Forma serowarska", en: "Cheese mold", definition: "Pojemnik nadający kształt serowi.", category: "Sprzęt" },
  { pl: "Prasa serowarska", en: "Cheese press", definition: "Urządzenie do prasowania sera.", category: "Sprzęt" },
  { pl: "Dojrzewalnia", en: "Aging room / Cave", definition: "Pomieszczenie o kontrolowanej temperaturze i wilgotności.", category: "Sprzęt" },
  { pl: "Termometr", en: "Thermometer", definition: "Przyrząd do pomiaru temperatury mleka i skrzepu.", category: "Sprzęt" },
  { pl: "pH-metr", en: "pH meter", definition: "Urządzenie do pomiaru kwasowości.", category: "Sprzęt" },
  { pl: "Mata drenarsko-prasownicza", en: "Cheese mat / Draining mat", definition: "Mata ułatwiająca odpływ serwatki.", category: "Sprzęt" },
  
  // Parametry i właściwości
  { pl: "Kwasowość", en: "Acidity", definition: "Poziom pH wpływający na teksturę i smak sera.", category: "Parametry" },
  { pl: "Wilgotność", en: "Moisture content", definition: "Procentowa zawartość wody w serze.", category: "Parametry" },
  { pl: "Zawartość tłuszczu", en: "Fat content", definition: "Procent tłuszczu w suchej masie sera.", category: "Parametry" },
  { pl: "Sucha masa", en: "Dry matter", definition: "Składniki sera po odjęciu wody.", category: "Parametry" },
  { pl: "Oczka", en: "Eyes / Holes", definition: "Otwory w serze utworzone przez CO₂.", category: "Parametry" },
  { pl: "Skórka", en: "Rind", definition: "Zewnętrzna warstwa sera.", category: "Parametry" },
  { pl: "Ciasto", en: "Paste / Body", definition: "Wewnętrzna część sera.", category: "Parametry" },
  { pl: "Konsystencja", en: "Texture", definition: "Właściwości dotykowe i strukturalne sera.", category: "Parametry" },
  { pl: "Aromat", en: "Aroma / Bouquet", definition: "Zapach sera.", category: "Parametry" },
  
  // Prawne i handlowe
  { pl: "RHD (Rolniczy Handel Detaliczny)", en: "Farm Retail Trade", definition: "Forma sprzedaży produktów rolnych bezpośrednio konsumentom.", category: "Prawo" },
  { pl: "MOL (Działalność Marginalna, Lokalna i Ograniczona)", en: "Marginal, Local and Limited Activity", definition: "Uproszczona forma działalności przetwórczej.", category: "Prawo" },
  { pl: "Numer weterynaryjny", en: "Veterinary number", definition: "Identyfikator zakładu zatwierdzony przez Inspekcję Weterynaryjną.", category: "Prawo" },
  { pl: "Chroniona Nazwa Pochodzenia", en: "Protected Designation of Origin (PDO)", definition: "Oznaczenie produktów wytwarzanych tradycyjnie w określonym regionie.", category: "Prawo" },
  { pl: "Chronione Oznaczenie Geograficzne", en: "Protected Geographical Indication (PGI)", definition: "Oznaczenie produktów związanych z określonym regionem.", category: "Prawo" },
  { pl: "Gwarantowana Tradycyjna Specjalność", en: "Traditional Speciality Guaranteed (TSG)", definition: "Oznaczenie produktów wytwarzanych tradycyjną metodą.", category: "Prawo" },
];

const categories = [...new Set(glossaryTerms.map(term => term.category))];

const Slownik = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter(term => {
      const matchesSearch = searchQuery === "" ||
        term.pl.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === null || term.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const groupedTerms = useMemo(() => {
    return categories.reduce((acc, category) => {
      const termsInCategory = filteredTerms.filter(term => term.category === category);
      if (termsInCategory.length > 0) {
        acc[category] = termsInCategory;
      }
      return acc;
    }, {} as Record<string, GlossaryTerm[]>);
  }, [filteredTerms]);

  const datasetVariables = [
    "polish_term",
    "english_term",
    "definition",
    "category",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Helmet>
        <title>Słownik Serowarski Polsko-Angielski | Moja Serowarnia</title>
        <meta 
          name="description" 
          content="Kompleksowy słownik terminów serowarskich polsko-angielski. Ponad 60 terminów z definicjami: kultury starterowe, podpuszczka, koagulacja, dojrzewanie i więcej."
        />
        <meta name="keywords" content="słownik serowarski, terminologia serowarska, cheese glossary, cheesemaking terms, kultury bakteryjne, podpuszczka, rennet" />
        <link rel="canonical" href="https://mojaserowarnia.pl/slownik" />
      </Helmet>

      <DatasetSchema
        name="Słownik Terminów Serowarskich Polsko-Angielski"
        description="Dwujęzyczny słownik terminologii serowarskiej zawierający ponad 60 terminów z definicjami, pogrupowanych w kategorie tematyczne."
        url="https://mojaserowarnia.pl/slownik"
        keywords={["słownik serowarski", "terminologia serowarska", "cheese glossary", "cheesemaking terminology"]}
        creator={{ name: "Moja Serowarnia" }}
        variableMeasured={datasetVariables}
        distribution={[
          { encodingFormat: "text/html", contentUrl: "https://mojaserowarnia.pl/slownik" }
        ]}
      />

      <Navigation />

      <main className="container mx-auto px-4 py-8 mt-20">
        <PageBreadcrumbs
          items={[
            { label: "Słownik terminów" }
          ]}
        />

        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Słownik Serowarski
            </h1>
            <p className="text-lg text-muted-foreground">
              Polsko-angielski słownik terminów serowarskich z definicjami
            </p>
          </header>

          <TLDRSection>
            <p>
              <strong>Słownik terminów serowarskich (Cheese Glossary)</strong> zawiera {glossaryTerms.length}+ pojęć 
              z dziedziny serowarstwa w języku polskim i angielskim. Obejmuje: kultury starterowe (starter cultures), 
              podpuszczkę (rennet), procesy produkcji (cheesemaking processes), typy serów (cheese types), 
              sprzęt (equipment) oraz terminy prawne (RHD, MOL, PDO/PGI/TSG).
            </p>
          </TLDRSection>

          {/* Search and Filter */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Szukaj terminu (PL/EN)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedCategory === null ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Wszystkie
                  </Badge>
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Znaleziono: {filteredTerms.length} terminów
              </p>
            </CardContent>
          </Card>

          {/* Glossary Terms */}
          <div className="space-y-8">
            {Object.entries(groupedTerms).map(([category, terms]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-primary">#</span>
                    {category}
                    <Badge variant="secondary" className="ml-2">{terms.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {terms.map((term, index) => (
                      <div key={index} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">
                              {term.pl}
                            </h3>
                            <p className="text-sm text-primary font-medium">
                              {term.en}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground md:text-right md:max-w-[60%]">
                            {term.definition}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTerms.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nie znaleziono terminów pasujących do wyszukiwania.
                </p>
              </CardContent>
            </Card>
          )}

          <SeeAlso
            links={[
              { href: "/baza-kultur", title: "Baza kultur bakteryjnych" },
              { href: "/przepisy", title: "Przepisy na sery" },
              { href: "/poradniki", title: "Poradniki serowarskie" },
              { href: "/bakterie-kultury", title: "Przewodnik po kulturach" },
              { href: "/prawo", title: "Prawo żywnościowe" },
            ]}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Slownik;
