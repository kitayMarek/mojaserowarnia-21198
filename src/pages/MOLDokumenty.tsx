import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";
import { Link } from "react-router-dom";

const MOLDokumenty = () => {
  useEffect(() => {
    document.title = "Dokumentacja w działalności MOL - Serowarstwo.pl";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Kompletny przegląd wymaganej dokumentacji w działalności marginalnej, lokalnej i ograniczonej (MOL) - ewidencje, rejestry i wymagania prawne"
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link to="/prawo/mol" className="inline-flex items-center text-primary hover:underline mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót do informacji o MOL
            </Link>
            <h1 className="text-4xl font-bold mb-4 text-primary">
              Dokumentacja w działalności MOL
            </h1>
            <p className="text-lg text-muted-foreground">
              Wymagane dokumenty i ewidencje w działalności marginalnej, lokalnej i ograniczonej
            </p>
          </div>

          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Działalność MOL (Marginalna, Lokalna i Ograniczona) ma większy nacisk na bezpieczeństwo żywności 
              pochodzenia zwierzęcego i kontrolę weterynaryjną niż RHD. Poniżej znajdziesz kompletne kompendium 
              dokumentacji obowiązkowej i zalecanej.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* Sekcja 1: Dokumentacja obowiązkowa */}
            <Card>
              <CardHeader>
                <CardTitle>1. Dokumentacja obowiązkowa w działalności MOL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-semibold">Podstawą są przepisy:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <a 
                      href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20160000451" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Rozporządzenie Ministra Rolnictwa i Rozwoju Wsi z 21 marca 2016 r.
                    </a>
                    {" "}w sprawie szczegółowych warunków uznania działalności marginalnej, lokalnej i ograniczonej (Dz.U. 2016 poz. 451)
                  </li>
                  <li>
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0852" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Rozporządzenie (WE) nr 852/2004
                    </a>
                    {" "}w sprawie higieny środków spożywczych
                  </li>
                  <li>
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0853" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Rozporządzenie (WE) nr 853/2004
                    </a>
                    {" "}– dla produktów pochodzenia zwierzęcego
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 1.1 Ewidencja produkcji i sprzedaży */}
            <Card>
              <CardHeader>
                <CardTitle>1.1. Ewidencja produkcji i sprzedaży (ilościowa)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Prowadzona dla każdego rodzaju produktu (np. sery, masło, jaja, mięso itp.).
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-3 text-left">Pole</th>
                        <th className="border border-border p-3 text-left">Opis</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-3 font-semibold">Data produkcji / sprzedaży</td>
                        <td className="border border-border p-3">Dzień wytworzenia lub zbycia</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-semibold">Nazwa produktu</td>
                        <td className="border border-border p-3">np. "Ser dojrzewający z mleka krowiego"</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-semibold">Ilość [kg/l/szt]</td>
                        <td className="border border-border p-3">Wyprodukowana i sprzedana ilość</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-semibold">Odbiorca</td>
                        <td className="border border-border p-3">Konsument końcowy / detal (np. restauracja, sklep)</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-semibold">Miejsce sprzedaży</td>
                        <td className="border border-border p-3">Gospodarstwo, targ, sklep</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-semibold">Numer partii lub data produkcji</td>
                        <td className="border border-border p-3">Identyfikacja traceability</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-semibold">Uwagi</td>
                        <td className="border border-border p-3">np. warunki przechowywania, reklamacje</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Ewidencja potwierdza zachowanie limitów ilościowych określonych w rozporządzeniu MRiRW 
                    (np. 0,5 t tygodniowo dla nabiału).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* 1.2 Śledzenie partii */}
            <Card>
              <CardHeader>
                <CardTitle>1.2. Dokumentacja śledzenia partii (traceability)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Zgodnie z art. 18–19{" "}
                  <a 
                    href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32002R0178" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    rozporządzenia (WE) 178/2002
                  </a>
                  : rolnik-producent musi móc wskazać źródło każdego surowca i odbiorcę każdej partii.
                </p>

                <div>
                  <p className="font-semibold mb-2">Dokument powinien zawierać:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>numer partii, datę produkcji, ilość</li>
                    <li>źródło surowca (własne / zakupione, dane dostawcy)</li>
                    <li>dane odbiorcy (nazwa sklepu, osoba prywatna itp.)</li>
                    <li>sposób i datę sprzedaży</li>
                  </ul>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <span className="font-semibold">Cel:</span> szybkie wycofanie produktu w razie zagrożenia zdrowia publicznego.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* 1.3 Księga GHP/GMP */}
            <Card>
              <CardHeader>
                <CardTitle>1.3. Księga GHP/GMP (dobre praktyki higieniczne i produkcyjne)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Wymagana przez rozporządzenie (WE) 852/2004 – nawet w uproszczonej formie.
                </p>

                <div>
                  <p className="font-semibold mb-2">Powinna obejmować:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold">• Opis zakładu</p>
                      <p className="ml-4 text-muted-foreground">Pomieszczenia, sprzęt, schemat przepływu surowca i personelu</p>
                    </div>

                    <div>
                      <p className="font-semibold">• Procedury GHP:</p>
                      <ul className="list-disc list-inside ml-8 space-y-1">
                        <li>mycie i dezynfekcja</li>
                        <li>zaopatrzenie w wodę</li>
                        <li>postępowanie z odpadami</li>
                        <li>kontrola szkodników</li>
                        <li>higiena personelu</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold">• Procedury GMP:</p>
                      <ul className="list-disc list-inside ml-8 space-y-1">
                        <li>przyjęcie surowców</li>
                        <li>obróbka, pasteryzacja, dojrzewanie, pakowanie</li>
                        <li>kontrola temperatur</li>
                        <li>magazynowanie i transport</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Każdy punkt powinien mieć rejestr działań (np. tabele do wypełniania).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* 1.4 Rejestry operacyjne */}
            <Card>
              <CardHeader>
                <CardTitle>1.4. Rejestry operacyjne (codzienne lub okresowe)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-3 text-left">Rejestr</th>
                        <th className="border border-border p-3 text-left">Co zawiera</th>
                        <th className="border border-border p-3 text-left">Częstotliwość</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-3 font-semibold">Rejestr temperatur</td>
                        <td className="border border-border p-3">Odczyty z lodówek, pasteryzatora, dojrzewalni</td>
                        <td className="border border-border p-3">Codziennie</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-semibold">Rejestr mycia i dezynfekcji</td>
                        <td className="border border-border p-3">Co, czym, kiedy, kto czyścił</td>
                        <td className="border border-border p-3">Po każdej zmianie / raz dziennie</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-semibold">Rejestr DDD</td>
                        <td className="border border-border p-3">Deratyzacja, dezynsekcja, dezynfekcja - terminy, wyniki, podpisy</td>
                        <td className="border border-border p-3">Okresowo (np. co kwartał)</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-semibold">Rejestr badań wody</td>
                        <td className="border border-border p-3">Data, laboratorium, wyniki</td>
                        <td className="border border-border p-3">Co 12 miesięcy (ujęcie własne)</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3 font-semibold">Rejestr szkoleń personelu</td>
                        <td className="border border-border p-3">Szkolenia, badania sanitarne</td>
                        <td className="border border-border p-3">Wg ważności zaświadczeń</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* 1.5 HACCP */}
            <Card>
              <CardHeader>
                <CardTitle>1.5. Dokumentacja systemu kontroli wewnętrznej / HACCP (uproszczony)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  W MOL wystarczy uproszczony HACCP – analiza ryzyk i krytycznych punktów (CCP).
                </p>

                <div>
                  <p className="font-semibold mb-2">Zawiera:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>opis procesu (np. przyjęcie mleka → pasteryzacja → chłodzenie → dojrzewanie → pakowanie)</li>
                    <li>identyfikację zagrożeń (biologiczne, chemiczne, fizyczne)</li>
                    <li>środki kontroli i częstotliwość monitoringu</li>
                    <li>plan działań korygujących</li>
                    <li>rejestr potwierdzający sprawdzenia</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 1.6 Dokumentacja rejestracyjna */}
            <Card>
              <CardHeader>
                <CardTitle>1.6. Dokumentacja rejestracyjna i decyzje urzędowe</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">Rolnik prowadzący MOL musi posiadać i przechowywać:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>wniosek i decyzję Powiatowego Lekarza Weterynarii o zatwierdzeniu zakładu (nadanie numeru weterynaryjnego)</li>
                  <li>protokoły kontroli i zatwierdzenia (sanitarne/weterynaryjne)</li>
                  <li>wpis do rejestru zakładów MOL</li>
                </ul>
              </CardContent>
            </Card>

            {/* Sekcja 2: Dokumentacja zalecana */}
            <Card>
              <CardHeader>
                <CardTitle>2. Dokumentacja zalecana (ułatwia kontrole i certyfikacje)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Choć nie jest literalnie wymagana, dobrze ją mieć:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Specyfikacje surowców i materiałów pomocniczych (np. podpuszczka, kultury bakterii) z numerami partii</li>
                  <li>Karty charakterystyki detergentów i środków czystości</li>
                  <li>Umowy na wywóz odpadów i ścieków</li>
                  <li>Rejestr reklamacji i zwrotów (nawet jeśli pusty)</li>
                  <li>
                    Zdjęcie tabliczki z oznakowaniem miejsca sprzedaży i wzory etykiet (zgodne z{" "}
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32011R1169" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      rozporządzeniem 1169/2011
                    </a>
                    )
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Sekcja 3: Podstawa prawna */}
            <Card>
              <CardHeader>
                <CardTitle>3. Podstawa prawna</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <a 
                      href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20160000451" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Rozporządzenie MRiRW z 21 marca 2016 r.
                    </a>
                    {" "}w sprawie szczegółowych warunków uznania działalności MOL (Dz.U. 2016 poz. 451)
                  </li>
                  <li>
                    <a 
                      href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20230000161" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Ustawa z 16 grudnia 2005 r.
                    </a>
                    {" "}o produktach pochodzenia zwierzęcego (Dz.U. 2023 poz. 161)
                  </li>
                  <li>
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0852" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Rozporządzenie (WE) nr 852/2004
                    </a>
                    {" "}i{" "}
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0853" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      nr 853/2004
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32002R0178" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Rozporządzenie (WE) nr 178/2002
                    </a>
                    {" "}– ogólne prawo żywnościowe
                  </li>
                  <li>Wytyczne Głównego Inspektoratu Weterynarii (GIW) i Centrum Doradztwa Rolniczego (CDR)</li>
                </ul>
              </CardContent>
            </Card>

            {/* Sekcja 4: Lista kontrolna */}
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  4. Podsumowanie – lista kontrolna MOL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {[
                    "Ewidencja produkcji i sprzedaży",
                    "Traceability – śledzenie partii",
                    "Księga GHP/GMP + rejestry higieny",
                    "Rejestry temperatur, mycia, DDD, wody",
                    "Uproszczony HACCP",
                    "Decyzje i wpisy weterynaryjne",
                    "Wzory etykiet, tabliczki, umowy na odpady",
                    "(zalecane) Specyfikacje, reklamacje, szkolenia"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
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

export default MOLDokumenty;