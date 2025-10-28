import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, FileText, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ReactionButton from "@/components/ReactionButton";

const AktyPrawneUE = () => {
  useEffect(() => {
    document.title = "Najważniejsze akty prawne UE - Serowarstwo.pl";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Kompletny przegląd najważniejszych dokumentów prawnych Unii Europejskiej dotyczących produkcji serów farmerskich i rzemieślniczych"
      );
    }
  }, []);

  const documents = [
    {
      title: "Europejski Poradnik Dobrych Praktyk Higienicznych (2017)",
      code: "COM(2017) 7623 final",
      description: "Kluczowy dokument zawierający szczegółowe wytyczne dla produkcji rzemieślniczych serów, w tym serów produkowanych na farmach."
    },
    {
      title: "Opinia EKES o przetwórstwie rzemieślniczym (2006/C 65/25)",
      code: "52005IE1509",
      description: "Fundamentalna opinia Europejskiego Komitetu Ekonomiczno-Społecznego w sprawie \"Zasady higieny a przetwórstwo rzemieślnicze\"",
      details: [
        "Wpływ nowych przepisów higieny na małe serownie",
        "Specjalne wymogi dla serowni w gospodarstwach rolnych",
        "Rzemieślnicze serownie i ich potrzeby",
        "Małe przedsiębiorstwa sektora mlecznego"
      ]
    },
    {
      title: "Rozporządzenie 853/2004 - przepisy higieniczne",
      code: "32004R853",
      description: "Ustanawiające szczególne przepisy dotyczące higieny żywności pochodzenia zwierzęcego",
      details: [
        "Produkcji mleka surowego",
        "Małych zakładów przetwórczych",
        "Elastyczności dla tradycyjnych metod produkcji",
        "Wymogów dla małych przedsiębiorstw sektora spożywczego"
      ]
    },
    {
      title: "Rozporządzenie 1308/2013 - wspólna organizacja rynków",
      code: "32013R1308",
      description: "Reguluje rynki produktów rolnych, w tym sektor mleka i przetworów mlecznych",
      details: [
        "Sektor mleka i przetworów mlecznych",
        "Organizacje producentów mleka",
        "Umowy na dostawy mleka surowego",
        "Negocjacje umowne w sektorze mlecznym"
      ]
    },
    {
      title: "Rozporządzenie 2024/1143 - oznaczenia geograficzne",
      code: "32024R1143",
      description: "Najnowsze (z kwietnia 2024) kompleksowe rozporządzenie w sprawie oznaczeń geograficznych, zastępujące poprzednie Rozporządzenie 1151/2012",
      details: [
        "Rola grup producentów i uznanych grup producentów",
        "Małe i średnie przedsiębiorstwa producentów serów",
        "Produkcja tradycyjna i rzemieślnicza",
        "Gwarantowane tradycyjne specjalności",
        "Ochrona oznaczeń geograficznych dla lokalnych produktów"
      ]
    },
    {
      title: "Przykład polskiego sera farmerskiego",
      code: "Rozporządzenie wykonawcze 2024/326",
      description: "Zatwierdza zmiany w specyfikacji \"Sera korzcińskiego swojskiego\" - przykład polskiego sera farmerskiego objętego ochroną ChOG (Chronione Oznaczenie Geograficzne)."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Link to="/prawo" className="inline-flex items-center text-primary hover:underline mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót do sekcji Prawo
            </Link>
            <div className="mb-6">
              <ReactionButton contentType="legal_page" contentId="akty-prawne-ue" variant="default" />
            </div>
            <div className="mb-4">
              <h1 className="text-4xl font-bold mb-4 text-primary">
                Najważniejsze akty prawne UE dotyczące produkcji serów farmerskich
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Wszystkie najważniejsze dokumenty prawne Unii Europejskiej dotyczące produkcji serów ze szczególnym uwzględnieniem produkcji na poziomie farmerskim.
              </p>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm">
                      Wymienione dokumenty w pełnym brzmieniu można znaleźć na oficjalnej stronie:
                    </p>
                    <a 
                      href="https://eur-lex.europa.eu/homepage.html?lang=pl" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline mt-2"
                    >
                      EUR-Lex - Portal prawa UE
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 mb-12">
            {documents.map((doc, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{doc.title}</CardTitle>
                      <div className="inline-block bg-secondary px-3 py-1 rounded text-sm font-mono mb-3">
                        {doc.code}
                      </div>
                      <CardDescription className="text-base">
                        {doc.description}
                      </CardDescription>
                      {doc.details && (
                        <div className="mt-4">
                          <p className="font-semibold text-sm mb-2">Szczególne uwzględnienie:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {doc.details.map((detail, idx) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Kluczowe ustalenia dla produkcji serów farmerskich</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Główne wyzwania i rozwiązania:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Elastyczność przepisów</strong> - UE przewiduje możliwość dostosowania wymogów higienicznych dla małych producentów</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Tradycyjne metody produkcji</strong> - szczególna ochrona dla metod rzemieślniczych</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Organizacje producentów</strong> - możliwość tworzenia grup dla wzmocnienia pozycji na rynku</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span><strong>Oznaczenia geograficzne</strong> - narzędzie promocji i ochrony lokalnych serów</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Najważniejsze przepisy wspierające produkcję farmerską:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Odstępstwa od niektórych wymogów konstrukcyjnych dla małych zakładów</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Uproszczone procedury HACCP dla rzemieślników</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Możliwość stosowania tradycyjnych metod kontroli jakości</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Wsparcie dla lokalnych organizacji producentów mleka</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg mt-6">
                  <p className="text-sm leading-relaxed">
                    Zebrane dokumenty stanowią kompletną bazę prawną regulującą produkcję serów farmerskich w UE, 
                    pokazując ewolucję podejścia od restrykcyjnych przepisów do bardziej elastycznych rozwiązań 
                    wspierających małych producentów i tradycyjne metody produkcji.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AktyPrawneUE;
