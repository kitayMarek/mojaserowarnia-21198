import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import FAQSchema from "@/components/FAQSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "Jakie dokumenty są obowiązkowe w RHD?",
    answer: "Obowiązkowe dokumenty w RHD to: ewidencja sprzedaży żywności, dokumentacja ilości zbywanej żywności, dowody zbycia przy sprzedaży do sklepów/gastronomii, zgłoszenie/rejestracja zakładu oraz dokumenty dotyczące oznakowania produktów."
  },
  {
    question: "Jak długo przechowywać ewidencję sprzedaży w RHD?",
    answer: "Ewidencję sprzedaży w RHD należy przechowywać przez 2 lata od końca roku, którego dotyczą. Wpisy uzupełnia się niezwłocznie po każdej sprzedaży, najlepiej w dniu transakcji."
  },
  {
    question: "Gdzie zarejestrować działalność RHD?",
    answer: "Produkty pochodzenia zwierzęcego lub żywność złożoną rejestruje się u Powiatowego Lekarza Weterynarii (30 dni przed startem). Produkty roślinne rejestruje się u Państwowego Inspektora Sanitarnego (14 dni przed startem)."
  },
  {
    question: "Co musi zawierać ewidencja sprzedaży RHD?",
    answer: "Ewidencja musi zawierać: numer kolejnego wpisu, datę zbycia/uzyskania przychodu, kwotę przychodu (i przychód narastająco) oraz rodzaj i ilość zbytej/przetworzonej żywności."
  },
  {
    question: "Jakie rejestry GHP/GMP są zalecane w RHD?",
    answer: "Zalecane rejestry to: plan mycia i dezynfekcji, monitoring temperatur, kontrola szkodników (umowa DDD), jakość wody, postępowanie z odpadami oraz szkolenia i higiena personelu."
  },
  {
    question: "Czym jest procedura wycofania produktu?",
    answer: "Procedura wycofania produktu (food recall) to dokument opisujący sposób identyfikacji partii, listę odbiorców i procedurę powiadamiania w przypadku konieczności wycofania produktu z rynku."
  }
];

const RHDDokumenty = () => {
  useEffect(() => {
    document.title = "Wymagane dokumenty w RHD - Moja Serowarnia";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Kompletny wykaz dokumentów obowiązkowych i zalecanych w prowadzeniu działalności RHD - ewidencje, rejestry i procedury"
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <FAQSchema faqs={faqs} />
      <Navigation />
      <PageBreadcrumbs items={[
        { label: "Prawo", href: "/prawo" },
        { label: "RHD", href: "/prawo/rhd" },
        { label: "Dokumenty" }
      ]} />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto">
          <Link 
            to="/prawo/rhd" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót do RHD
          </Link>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-primary">Wymagane dokumenty w działalności RHD</h1>
            <p className="text-lg text-muted-foreground">
              W RHD część dokumentów jest obowiązkowa, a część mocno zalecana (często sprawdzana przy kontroli). Poniżej praktyczny zestaw.
            </p>
          </div>

          {/* TL;DR Section */}
          <TLDRSection>
            <ul className="space-y-1">
              <li>• <strong>Obowiązkowe:</strong> ewidencja sprzedaży, dokumentacja ilości, dowody zbycia, rejestracja i oznakowanie</li>
              <li>• <strong>Zalecane:</strong> rejestry GHP/GMP (mycie, temperatury, DDD), traceability, specyfikacje surowców</li>
              <li>• Wpisy uzupełniaj <strong>w dniu sprzedaży</strong>, przechowuj <strong>2 lata</strong></li>
              <li>• Przygotuj <strong>procedurę wycofania produktu</strong> (food recall procedure)</li>
            </ul>
          </TLDRSection>

          <div className="space-y-6">
            {/* Sekcja: Dokumenty obowiązkowe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Co rolnik musi prowadzić w RHD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 1. Ewidencja sprzedaży */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">1. Ewidencja sprzedaży żywności (odrębnie na każdy rok)</h3>
                  <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                    <p className="font-medium">Minimalny zakres pól:</p>
                    <ul className="space-y-1 list-disc list-inside text-sm">
                      <li>numer kolejnego wpisu</li>
                      <li>data zbycia/uzyskania przychodu</li>
                      <li>kwota przychodu (i przychód narastająco)</li>
                      <li>rodzaj i ilość zbytej/przetworzonej żywności</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Ważne:</strong> Wpisy uzupełnia się niezwłocznie po każdej sprzedaży (w dniu sprzedaży).
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Przechowywanie:</strong> przez 2 lata od końca roku, którego dotyczą.{" "}
                    <a 
                      href="https://www.gov.pl/web/weterynaria/rolniczy-handel-detaliczny" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover underline"
                    >
                      Źródło
                    </a>
                  </p>
                </div>

                {/* 2. Dokumentacja ilości */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">2. Dokumentacja ilości zbywanej żywności</h3>
                  <p className="text-sm text-muted-foreground">
                    Ma umożliwić organom weryfikację, że nie przekraczasz limitów RHD oraz że sprzedaż trafia do uprawnionych odbiorców (konsumenci końcowi / detal z przeznaczeniem dla konsumenta).
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Zakres i sposób dokumentowania określa{" "}
                    <a 
                      href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20220001971" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover underline"
                    >
                      rozporządzenie MRiRW z 12.09.2022
                    </a>
                    .
                  </p>
                </div>

                {/* 3. Dowody zbycia */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">3. Dowody zbycia/dostawy (sprzedaż do sklepów/gastronomii)</h3>
                  <p className="text-sm text-muted-foreground">
                    Gdy sprzedajesz do zakładów prowadzących handel detaliczny z przeznaczeniem dla konsumenta — np. sklep, restauracja.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm">
                      Np. paragony/rachunki, WZ/faktury, z których jasno wynika kto, co, ile i kiedy otrzymał.
                      Ma to spiąć się z ewidencją ilości i sprzedaży.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <a 
                      href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20220001971" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover underline"
                    >
                      Podstawa prawna
                    </a>
                  </p>
                </div>

                {/* 4. Rejestracja */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">4. Zgłoszenie/rejestracja zakładu i dokument potwierdzający wpis</h3>
                  <div className="space-y-2">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Produkty pochodzenia zwierzęcego lub żywność złożona:</p>
                      <p className="text-sm">
                        → rejestr u Powiatowego Lekarza Weterynarii (30 dni przed startem)
                      </p>
                    </div>
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Tylko produkty roślinne:</p>
                      <p className="text-sm">
                        → rejestr u Państwowego Inspektora Sanitarnego (min. 14 dni przed startem)
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Przechowuj decyzję/potwierdzenie wpisu i numer weterynaryjny (jeśli nadany).{" "}
                    <a 
                      href="https://www.gov.pl/web/weterynaria/rolniczy-handel-detaliczny" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover underline"
                    >
                      Więcej informacji
                    </a>
                  </p>
                </div>

                {/* 5. Oznakowanie */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">5. Dokumenty dotyczące oznakowania</h3>
                  <p className="text-sm text-muted-foreground">
                    Etykiety zgodne z przepisami (m.in.{" "}
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32011R1169" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover underline"
                    >
                      rozporządzenie UE nr 1169/2011
                    </a>
                    ) oraz oznaczenie miejsca sprzedaży.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                    <p className="font-medium text-sm">Oznaczenie miejsca sprzedaży musi zawierać:</p>
                    <ul className="space-y-1 list-disc list-inside text-sm">
                      <li>napis „rolniczy handel detaliczny"</li>
                      <li>dane producenta</li>
                      <li>adres miejsca produkcji</li>
                      <li>numer weterynaryjny (jeśli został nadany)</li>
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Trzymaj wzory/projekty etykiet i zdjęcie tablicy z miejsca sprzedaży.{" "}
                    <a 
                      href="https://www.gov.pl/web/weterynaria/rolniczy-handel-detaliczny" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover underline"
                    >
                      Wytyczne GIW
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja: Dokumenty zalecane */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Co jest mocno zalecane (często sprawdzane przy kontroli)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm">
                    To nie zawsze „nakaz z przepisu RHD", ale wynika z ogólnych wymogów higieny żywności{" "}
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0852" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover underline"
                    >
                      (rozporządzenie WE 852/2004)
                    </a>
                    {" "}i praktyki kontroli. Warto prowadzić:
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Rejestry GHP/GMP */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Rejestry GHP/GMP (dobra praktyka higieniczna/produkcyjna)</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-secondary/50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Plan i rejestr mycia i dezynfekcji</p>
                        <p className="text-xs text-muted-foreground">Harmonogram czyszczenia pomieszczeń i urządzeń</p>
                      </div>
                      <div className="bg-secondary/50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Monitoring temperatur</p>
                        <p className="text-xs text-muted-foreground">Chłodnie, pasteryzacja, przechowywanie</p>
                      </div>
                      <div className="bg-secondary/50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Kontrola szkodników</p>
                        <p className="text-xs text-muted-foreground">Umowa DDD, protokoły</p>
                      </div>
                      <div className="bg-secondary/50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Jakość wody</p>
                        <p className="text-xs text-muted-foreground">Wyniki badań (gdy woda z ujęcia własnego)</p>
                      </div>
                      <div className="bg-secondary/50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Postępowanie z odpadami</p>
                        <p className="text-xs text-muted-foreground">Umowy, karty przekazania</p>
                      </div>
                      <div className="bg-secondary/50 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Szkolenia/higiena personelu</p>
                        <p className="text-xs text-muted-foreground">Oświadczenia o braku przeciwwskazań, instruktaże</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <a 
                        href="https://www.gov.pl/web/weterynaria/dobre-praktyki-higieniczne-w-produkcji-zywnosci" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        Więcej o GHP
                      </a>
                    </p>
                  </div>

                  {/* Śledzenie partii */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Śledzenie partii (traceability) i procedura wycofania produktu</h3>
                    <p className="text-sm text-muted-foreground">
                      Prosty formularz „kto-co-ile-kiedy". To wymóg ogólnego prawa żywnościowego i bardzo ułatwia kontrolę.
                    </p>
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <p className="text-sm">
                        Gotowy wzór procedury wycofania produktu powinien zawierać: sposób identyfikacji partii, lista odbiorców, procedura powiadamiania.
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <a 
                        href="https://ostrowmaz.piw.gov.pl/cms/upload/ostrwmaz/files/Wycofywanie-produktow.pdf" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        Przykładowa procedura (PIW)
                      </a>
                    </p>
                  </div>

                  {/* Specyfikacje surowców */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Specyfikacje surowców i dodatków</h3>
                    <p className="text-sm text-muted-foreground">
                      Dowody pochodzenia składników – zwłaszcza do wykazania udziału surowca „z własnego gospodarstwa".
                    </p>
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <p className="text-sm">
                        Mogą to być: faktury zakupu, karty produkcji, certyfikaty surowców, oświadczenia o pochodzeniu mleka/innych produktów z własnego gospodarstwa.
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <a 
                        href="https://www.wetgiw.gov.pl/nadzor-weterynaryjny/rhd" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        Wytyczne GIW
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Podstawa prawna */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Podstawa prawna (najważniejsze akty)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2">
                  <li className="pl-4 border-l-2 border-primary/30">
                    <a 
                      href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20220001971" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover underline"
                    >
                      Rozporządzenie MRiRW z 12.09.2022 r.
                    </a>
                    {" "}w sprawie maksymalnej ilości żywności zbywanej w RHD do zakładów detalicznych oraz zakresu i sposobu jej dokumentowania (Dz.U. 2022 poz. 1971)
                  </li>
                  <li className="pl-4 border-l-2 border-primary/30">
                    <a 
                      href="https://www.gov.pl/web/weterynaria/rolniczy-handel-detaliczny" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover underline"
                    >
                      Materiały informacyjne MRiRW/GIW
                    </a>
                    {" "}o RHD z wyszczególnieniem ewidencji sprzedaży i zasad przechowywania (2 lata)
                  </li>
                  <li className="pl-4 border-l-2 border-primary/30">
                    <a 
                      href="https://www.wetgiw.gov.pl/nadzor-weterynaryjny/rhd" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover underline"
                    >
                      Strona GIW o RHD
                    </a>
                    {" "}(warunki, rejestracja, wymagania)
                  </li>
                  <li className="pl-4 border-l-2 border-primary/30">
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0852" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover underline"
                    >
                      Rozporządzenie (WE) nr 852/2004
                    </a>
                    {" "}– ogólne przepisy higieniczne jako podstawa do prowadzenia rejestrów GHP/GMP
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Podsumowanie */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Podsumowanie</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    ✓ Prowadź ewidencję sprzedaży – to podstawa dokumentacji w RHD
                  </p>
                  <p>
                    ✓ Zbieraj dowody dostaw do zakładów detalicznych (faktury, WZ)
                  </p>
                  <p>
                    ✓ Przechowuj decyzję o rejestracji zakładu i numer weterynaryjny
                  </p>
                  <p>
                    ✓ Zadbaj o zgodne oznakowanie produktów i miejsca sprzedaży
                  </p>
                  <p>
                    ✓ Warto mieć rejestry GHP (mycie, temperatury, szkodniki) – często sprawdzane przy kontroli
                  </p>
                  <p>
                    ✓ Dokumentuj pochodzenie surowców i przygotuj procedurę wycofania produktu
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* See Also Section */}
            <SeeAlso links={[
              { href: "/prawo/rhd", title: "Rolniczy Handel Detaliczny", description: "Kompletny przewodnik po RHD" },
              { href: "/prawo/mol", title: "Działalność MOL", description: "Marginalna, lokalna i ograniczona" },
              { href: "/system-ewidencji", title: "System Ewidencji Sprzedaży", description: "Elektroniczna ewidencja RHD" },
              { href: "/przepisy", title: "Przepisy na domowe sery", description: "Co produkować w ramach RHD" }
            ]} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RHDDokumenty;
