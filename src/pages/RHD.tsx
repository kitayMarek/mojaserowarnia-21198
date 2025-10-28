import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Scale, Users, ShoppingBag, ClipboardCheck, Euro, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import rhdHeaderImage from "@/assets/rhd-header.webp";
import ReactionButton from "@/components/ReactionButton";

const RHD = () => {
  useEffect(() => {
    document.title = "Rolniczy Handel Detaliczny (RHD) - Serowarstwo.pl";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Kompletny przewodnik po formie działalności RHD - produkcja i sprzedaż serów oraz innych produktów rolnych bezpośrednio konsumentom"
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-5xl mx-auto">
          <Link 
            to="/prawo" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót do sekcji Prawo
          </Link>

          <div className="mb-8">
            <img 
              src={rhdHeaderImage} 
              alt="Rolniczy Handel Detaliczny - Tradycja i Wiedza" 
              className="w-full max-w-xl mx-auto rounded-lg shadow-lg mb-6"
              loading="eager"
              fetchPriority="high"
            />
            <div className="mb-6">
              <ReactionButton contentType="legal_page" contentId="rhd" variant="default" />
            </div>
            <div className="mb-4">
              <h1 className="text-4xl font-bold mb-4 text-primary">Rolniczy Handel Detaliczny (RHD)</h1>
              <p className="text-lg text-muted-foreground">
                Kompletny przewodnik po formie działalności umożliwiającej produkcję i sprzedaż serów oraz innych produktów rolnych bezpośrednio konsumentom
              </p>
            </div>
          </div>

          {/* Menu szybkiego dostępu */}
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Powiązane tematy</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <Link 
                  to="/prawo/rhd/dokumenty"
                  className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Wymagane dokumenty w RHD</p>
                    <p className="text-xs text-muted-foreground">Ewidencje, rejestry i procedury</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Sekcja 1: Czym jest RHD */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Czym jest RHD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  „Rolniczy Handel Detaliczny (RHD)" to wyodrębniona w polskim prawie forma handlu detalicznego, która umożliwia rolnikom (gospodarstwom rolnym) produkcję żywności w całości lub w części z własnej uprawy/hodowli/chowu oraz jej zbywanie konsumentom końcowym lub wybranym zakładom w uproszczonym trybie.
                </p>
                <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">Najważniejsze cechy:</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Żywność wytworzona w gospodarstwie (albo z surowca własnego) lub w ramach gospodarstwa + przetwórstwo, sprzedaż</li>
                    <li>Zbywanie konsumentowi końcowemu (finalnemu) lub zakładom handlu detalicznego z przeznaczeniem dla konsumenta końcowego</li>
                    <li>Uproszczone wymagania (w porównaniu do dużych zakładów produkcji żywności) – na małą skalę, krótkie łańcuchy dostaw</li>
                  </ul>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="font-medium">
                    Dla serowarów i rolników oznacza to: jeśli prowadzisz gospodarstwo, samodzielnie uzyskujesz mleko lub surowiec (lub część surowca), możesz przetworzyć (np. zrobić sery, jogurty, inne wyroby) i sprzedawać je w ramach RHD — pod pewnymi warunkami.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 2: Podstawy prawne */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Podstawy prawne RHD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Ustawy</h4>
                  <ul className="space-y-2">
                    <li className="pl-4 border-l-2 border-primary/30">
                      <a 
                        href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20061711126" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        Ustawa z dnia 25 sierpnia 2006 r. o bezpieczeństwie żywności i żywienia
                      </a> – w tej ustawie wprowadzono rozdział dotyczący RHD („rozdział 10a")
                    </li>
                    <li className="pl-4 border-l-2 border-primary/30">
                      <a 
                        href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20160001961" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        Ustawa z dnia 16 listopada 2016 r. o zmianie niektórych ustaw w celu ułatwienia sprzedaży żywności przez rolników
                      </a> (Dz. U. poz. 1961) – wprowadziła definicję RHD i warunki
                    </li>
                    <li className="pl-4 border-l-2 border-primary/30">
                      <a 
                        href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20180002242" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        Ustawa z dnia 9 listopada 2018 r. o zmianie niektórych ustaw w celu ułatwienia sprzedaży żywności przez rolników do sklepów i restauracji
                      </a> (Dz. U. poz. 2242) – wprowadziła kolejne ułatwienia dla RHD
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Rozporządzenia</h4>
                  <ul className="space-y-2">
                    <li className="pl-4 border-l-2 border-primary/30">
                      <a 
                        href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20160002159" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        Rozporządzenie Ministra Rolnictwa i Rozwoju Wsi z dnia 16 grudnia 2016 r. w sprawie maksymalnej ilości żywności zbywanej w ramach rolniczego handlu detalicznego oraz zakresu i sposobu jej dokumentowania
                      </a> – określa limity i dokumentację
                    </li>
                    <li className="pl-4 border-l-2 border-primary/30">
                      <a 
                        href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20220002039" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover underline"
                      >
                        Rozporządzenie Ministra Rolnictwa i Rozwoju Wsi z dnia 12 września 2022 r. w sprawie maksymalnej ilości żywności zbywanej w ramach rolniczego handlu detalicznego do zakładów prowadzących handel detaliczny
                      </a> z przeznaczeniem dla konsumenta finalnego oraz zakresu i sposobu jej dokumentowania – nowsze regulacje
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 3: Kto może prowadzić RHD */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Kto może prowadzić RHD i jakie warunki muszą być spełnione
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Kto?</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Rolnik prowadzący gospodarstwo rodzinne lub inny rolniczy podmiot</li>
                    <li>Wymagane: posiadanie surowca (hodowla, chów, uprawa) – albo częściowo własnego</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Warunki podstawowe</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Produkcja lub przetworzenie żywności, która pochodzi w całości lub w części z własnej uprawy/hodowli/chowu</li>
                    <li>Jeśli produkt zawiera tylko jeden składnik (np. jaja, mleko, warzywa) — ten składnik musi pochodzić w całości z własnego gospodarstwa</li>
                    <li>Jeśli produkt zawiera więcej niż jeden składnik (np. dżem, ser z dodatkami) — wystarczy, że co najmniej jeden składnik pochodzi z własnego gospodarstwa</li>
                    <li>Zbywanie konsumentowi końcowemu lub do określonych zakładów handlu detalicznego z przeznaczeniem dla konsumenta końcowego</li>
                    <li>Wymogi sanitarnie-higieniczne zgodnie z prawem żywnościowym: np. rejestracja zakładu, przestrzeganie przepisów higieny, oznakowanie</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Odbiorcy i obszar sprzedaży</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Odbiorcą podstawowym jest konsument końcowy — osoba fizyczna kupująca produkt dla siebie, nie w ramach działalności przedsiębiorstwa spożywczego</li>
                    <li>Sprzedaż może być także do zakładów prowadzących handel detaliczny (np. sklep, restauracja) – ale z pewnymi ograniczeniami obszarowymi w przypadku produktów pochodzenia zwierzęcego lub żywności złożonej</li>
                    <li>W przypadku żywności pochodzenia zwierzęcego lub złożonej – sprzedaż wyłącznie na obszarze województwa, w którym produkcja albo w powiatach sąsiednich</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 4: Proces rejestracji */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Proces rejestracji i prowadzenia RHD – krok po kroku
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold mb-1">Określenie asortymentu</h4>
                      <p className="text-sm text-muted-foreground">Np. sery, mleko, przetwory owocowe, chleby, miód. Sprawdź, czy Twój surowiec pochodzi z własnego gospodarstwa albo co najmniej jeden składnik z własnej produkcji.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold mb-1">Wybór miejsca produkcji/zakładu oraz miejsca sprzedaży</h4>
                      <p className="text-sm text-muted-foreground">Np. gospodarstwo + stoisko na targu, kiermasz, sprzedaż w miejscu produkcji.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold mb-1">Złożenie wniosku o wpis zakładu/zgłoszenia działalności</h4>
                      <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside mt-2">
                        <li>Jeżeli żywność zawiera tylko składniki roślinne → zgłoszenie do właściwej stacji sanitarno-epidemiologicznej (Państwowej Inspekcji Sanitarnej) co najmniej 14 dni przed rozpoczęciem działalności</li>
                        <li>Jeżeli żywność zawiera pochodzenie zwierzęce lub jest „żywnością złożoną" (roślinne + zwierzęce składniki) → wniosek do właściwego powiatowego lekarza weterynarii co najmniej 30 dni przed rozpoczęciem</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-semibold mb-1">Oznakowanie miejsca sprzedaży</h4>
                      <p className="text-sm text-muted-foreground">W miejscu zbywania żywności w ramach RHD należy w sposób czytelny umieścić m.in.: napis „rolniczy handel detaliczny", imię nazwisko/nazwa podmiotu, adres miejsca produkcji. W przypadku żywności z udziałem zwierzęcego – również numer weterynaryjny (jeśli został nadany).</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">5</div>
                    <div>
                      <h4 className="font-semibold mb-1">Spełnianie wymagań higienicznych-sanitarnych</h4>
                      <p className="text-sm text-muted-foreground">Zgodnie z rozporządzeniami UE i krajowymi (np. <a href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0852" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover underline">rozporządzenie (WE) nr 852/2004</a> w sprawie higieny środków spożywczych).</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">6</div>
                    <div>
                      <h4 className="font-semibold mb-1">Dokumentowanie sprzedaży i ewidencjonowanie</h4>
                      <p className="text-sm text-muted-foreground">W zależności od zakresu działania, warto prowadzić dokumentację surowców (zwłaszcza udział własnego surowca), sprzedaży, limitów.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">7</div>
                    <div>
                      <h4 className="font-semibold mb-1">Monitorowanie limitów oraz preferencji podatkowych</h4>
                      <p className="text-sm text-muted-foreground">Opisane w dalszej części przewodnika.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 5: Zakres produkcji */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Zakres produkcji i sprzedaży – co można sprzedawać w ramach RHD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Przykładowe produkty, które mogą być wprowadzone w ramach RHD:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Produkty pochodzenia roślinnego</h4>
                    <p className="text-sm text-muted-foreground">Warzywa, owoce, soki, dżemy, oleje, przetwory owocowo-warzywne</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Produkty pochodzenia zwierzęcego</h4>
                    <p className="text-sm text-muted-foreground">Mleko, sery, jaja, masło, wędliny w niewielkiej skali – o ile spełnione są warunki rejestracji i udziału własnego surowca</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Produkty złożone</h4>
                    <p className="text-sm text-muted-foreground">Potrawy, pieczywo, wyroby garmażeryjne – o ile przynajmniej jeden składnik pochodzi z własnego gospodarstwa</p>
                  </div>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="font-medium">
                    Dla serowarów to oznacza: możesz produkować sery (jeśli masz mleko z własnej hodowli) lub przetwarzać mleko i sprzedawać bezpośrednio w ramach RHD – pod warunkiem, że spełniasz wymogi sanitarne i rejestracyjne.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 6: Preferencje podatkowe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-primary" />
                  Preferencje podatkowe, limity sprzedaży i inne korzyści
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Limity przychodów</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Do pewnego poziomu przychodu rolnik prowadzący RHD może być zwolniony z podatku dochodowego</li>
                    <li>Obecnie limit wynosi <strong>100 000 zł rocznie</strong> przychodu (stan na moment publikacji) dla przychodów z RHD</li>
                    <li>Przed 2022 rokiem limit wynosił znacznie mniej (np. 40 000 zł)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Zwolnienia i uproszczenia</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>W ramach RHD często nie ma obowiązku zakładania działalności gospodarczej w sposób pełny (choć zależnie od sytuacji)</li>
                    <li>Mniej skomplikowana kontrola (w porównaniu do dużych zakładów)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ułatwienia obszarowe i dotyczące sprzedaży</h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>W przypadku produktów pochodzenia roślinnego – sprzedaż może odbywać się na terenie całego kraju w niektórych warunkach</li>
                    <li>W przypadku produktów pochodzenia zwierzęcego lub żywności mieszanej („złożonej") – ograniczenia obszarowe (województwo lub sąsiednie powiaty) nadal mogą być stosowane</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 7: Wymogi bezpieczeństwa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Wymogi związane z bezpieczeństwem żywności, higieną i jakością
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Produkcja i sprzedaż w ramach RHD podlegają nadzorowi i kontroli organów kontroli żywności: dla produktów roślinnych - inspekcja sanitarna (Państwowa Inspekcja Sanitarna)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Dla produktów pochodzenia zwierzęcego lub żywności złożonej - nadzór przez powiatowego lekarza weterynarii</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Przestrzeganie wymagań higieniczno-sanitarnych zgodnie z <a href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0852" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover underline">rozporządzeniem (WE) nr 852/2004</a> oraz przepisami krajowymi</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Oznakowanie produkcji i miejsca sprzedaży: sprawiedliwa informacja dla konsumenta, m.in. dane producenta, adres, informacja „rolniczy handel detaliczny"</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Produkty opakowane muszą spełniać wymagania zawarte w <a href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32011R1169" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover underline">rozporządzeniu UE nr 1169/2011</a> w sprawie przekazywania konsumentom informacji o żywności</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Sekcja 8: Praktyczne wskazówki */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Praktyczne wskazówki dla serowarów i rolników
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Ustal w gospodarstwie, jakie surowce masz i w jakim procencie pochodzą z własnej uprawy/hodowli – to ważne dla spełnienia warunku „co najmniej jeden składnik"</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Rozważ lokalizację sprzedaży: gospodarstwo, targ, kiermasz – miejsce, gdzie konsument końcowy może dokonać zakupu</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Zadbaj o rejestrację zgodnie z rodzajem produkcji: jeśli sera zawierają mleko własne i dodatek, albo wędliny – konieczna rejestracja u lekarza weterynarii</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Zaplanuj oznakowanie miejsca sprzedaży (tablica „rolniczy handel detaliczny", dane producenta, adres)</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Zadbaj o oznakowanie produktów – etykiety zgodne z wymogami żywnościowymi (składniki, alergeny, producent)</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Prowadź prostą ewidencję sprzedaży (ilości, odbiorcy, miejsca sprzedaży) – przydatne z punktu widzenia nadzoru i dokumentacji</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Sprawdź, czy osiągasz limity przychodu – jeżeli przekroczysz 100 000 zł (stan na dziś) mogą ulec zmianie zasady podatkowe</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Pamiętaj o ograniczeniach obszarowych: jeśli produkujesz żywność pochodzenia zwierzęcego lub złożonej, sprawdź, gdzie możesz ją sprzedawać</span>
                    </div>
                    <div className="flex gap-2">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Warto rozważyć dofinansowania: np. w ramach Agencja Restrukturyzacji i Modernizacji Rolnictwa gdy prowadzi się przetwórstwo i sprzedaż w ramach RHD</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 9: Podsumowanie */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Podsumowanie kluczowych punktów</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>RHD to dobre rozwiązanie dla rolników, w tym serowarów, którzy chcą sprzedawać bezpośrednio produkty własnej produkcji</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Wymaga spełnienia warunków dotyczących udziału własnego surowca, rejestracji, higieny i oznakowania</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Zyskujesz uproszczoną formę sprzedaży detalicznej – może to być ważne przy budowaniu marki lokalnej</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Musisz jednak pilnować przepisów, limitów przychodów i zakresu działalności</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Dobrze zaplanowana działalność RHD może stać się źródłem dodatkowych dochodów dla gospodarstwa</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Link do EUR-Lex */}
            <div className="bg-secondary/50 p-6 rounded-lg text-center">
              <p className="mb-4">
                Wymienione dokumenty prawne w pełnym brzmieniu można znaleźć na oficjalnej stronie EUR-Lex oraz Internetowego Systemu Aktów Prawnych:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://eur-lex.europa.eu/homepage.html?lang=pl" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  <FileText className="h-5 w-5" />
                  EUR-Lex (przepisy UE)
                </a>
                <a 
                  href="https://isap.sejm.gov.pl/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  <Scale className="h-5 w-5" />
                  ISAP (przepisy polskie)
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RHD;
