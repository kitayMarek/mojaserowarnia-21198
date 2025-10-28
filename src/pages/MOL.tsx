import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Info, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import ReactionButton from "@/components/ReactionButton";

const MOL = () => {
  useEffect(() => {
    document.title = "Działalność marginalna, lokalna i ograniczona (MOL) - Serowarstwo.pl";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Kompletny przewodnik po działalności marginalnej, lokalnej i ograniczonej (MOL) - uproszczona forma produkcji produktów pochodzenia zwierzęcego"
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link to="/prawo" className="inline-flex items-center text-primary hover:underline mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót do sekcji Prawo
            </Link>
            <div className="mb-6">
              <ReactionButton contentType="legal_page" contentId="mol" variant="default" />
            </div>
            <div className="mb-4">
              <h1 className="text-4xl font-bold mb-4 text-primary">
                Działalność marginalna, lokalna i ograniczona (MOL)
              </h1>
              <p className="text-lg text-muted-foreground">
                Kompletny przewodnik po formie działalności MOL dla serowarów i rolników
              </p>
            </div>
          </div>

          {/* Menu nawigacyjne */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Spis treści</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Link 
                  to="/prawo/mol/dokumenty"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">Wymagane dokumenty w MOL</p>
                    <p className="text-sm text-muted-foreground">
                      Kompletny przegląd dokumentacji obowiązkowej i zalecanej
                    </p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Sekcja 1: Czym jest MOL */}
            <Card>
              <CardHeader>
                <CardTitle>1. Czym jest MOL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Działalność marginalna, lokalna i ograniczona (MOL) to forma produkcji i sprzedaży produktów żywnościowych 
                  w polskim prawie rolnym i sanitarnym, skierowana do producentów-rolników, która pozwala na przetwarzanie 
                  i wprowadzanie na rynek żywności pochodzenia zwierzęcego (lub jej części) w uproszczonym trybie.
                </p>
                
                <div className="space-y-2">
                  <p className="font-semibold">Kluczowe cechy:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Dotyczy produktów pochodzenia zwierzęcego (mięso, produkty mleczne, jaja, potrawy) lub ich przetworów</li>
                    <li>Umożliwia sprzedaż konsumentom końcowym oraz dostawy do zakładów handlu detalicznego (w pewnych warunkach)</li>
                    <li>Funkcjonuje na określonych limitach ilościowych i obszarowych</li>
                    <li>Zakłada uproszczone wymagania w porównaniu z dużymi zakładami produkcji żywności, aby umożliwić małym producentom rolnym rozwój</li>
                  </ul>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Dla serowarów i rolników oznacza to: jeśli w swoim gospodarstwie produkujesz mleko lub inne surowce zwierzęce, 
                    albo przetwarzasz je (np. sery, jogurty, jaja), możesz rozważyć działalność w ramach MOL – jeśli spełnisz 
                    warunki (ilościowe, sanitarne, obszarowe).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Sekcja 2: Podstawy prawne */}
            <Card>
              <CardHeader>
                <CardTitle>2. Podstawy prawne MOL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Akty prawne</h3>
                  <ul className="space-y-3">
                    <li>
                      <a 
                        href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20160000451" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Rozporządzenie Ministra Rolnictwa i Rozwoju Wsi z dnia 21 marca 2016 r.
                      </a>
                      {" "}w sprawie szczegółowych warunków uznania działalności marginalnej, lokalnej i ograniczonej 
                      (Dz. U. 2016 poz. 451) – określa warunki, limity, obszary dla MOL
                    </li>
                    <li>
                      <a 
                        href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20160000434" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Rozporządzenie Ministra Rolnictwa i Rozwoju Wsi z dnia 8 marca 2013 r.
                      </a>
                      {" "}w sprawie wymagań, jakie powinien spełniać projekt technologiczny zakładu, w którym ma być prowadzona 
                      działalność w zakresie produkcji produktów pochodzenia zwierzęcego (Dz. U. 2016, poz. 434) – odnosi się 
                      do zakładów produkcyjnych, w tym przy MOL
                    </li>
                    <li>
                      Inne przepisy wspierające: m.in. unijne{" "}
                      <a 
                        href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0852" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Rozporządzenie (WE) nr 852/2004
                      </a>
                      {" "}Parlamentu Europejskiego i Rady w sprawie higieny środków spożywczych
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 3: Warunki */}
            <Card>
              <CardHeader>
                <CardTitle>3. Kto może prowadzić MOL i jakie warunki muszą być spełnione</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Kto?</h3>
                  <p>
                    Producent rolny lub rolnik prowadzący gospodarstwo, który chce podjąć niewielką skalę produkcji 
                    lub przetwórstwa produktów pochodzenia zwierzęcego w ramach tej działalności.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Warunki podstawowe</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Produkcja/przetwórstwo produktów pochodzenia zwierzęcego lub ich przetworów – np. mięso (rozbiór, 
                      surowe wyroby mięsne), produkty mleczne, jaja w przetworzonej postaci, gotowe posiłki z udziałem 
                      produktów zwierzęcych
                    </li>
                    <li>
                      Dopuszczalne limity wagowe dostaw – np. dla produkcji mlecznej lub produktów mlecznych w ramach MOL 
                      dostawy nie mogą przekroczyć wagowo 0,5 tony tygodniowo (dla pewnych grup) – przy produkcji mięsa, 
                      wyrobów mięsnych – inne limity
                    </li>
                    <li>
                      Obszar działania: Produkcja i sprzedaż w ramach MOL zwykle ograniczona jest do województwa, w którym 
                      prowadzona jest produkcja, albo powiatów sąsiadujących; wyjątki przy sprzedaży na targach, festynach
                    </li>
                    <li>
                      Rejestracja działalności: Przed rozpoczęciem działalności podmiot musi wnieść wniosek do właściwego 
                      powiatowego lekarza weterynarii i uzyskać decyzję o wpisie do rejestru zakładów
                    </li>
                    <li>
                      Higieniczne-sanitarne warunki produkcji: Pomieszczenia, instalacje, procedury higieniczne (system HACCP 
                      albo dobre praktyki higieniczne) muszą być dostosowane do skali działalności
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 4: Proces rejestracji */}
            <Card>
              <CardHeader>
                <CardTitle>4. Proces rejestracji i prowadzenia MOL – krok po kroku</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  <li>
                    <span className="font-semibold">Określ profil produkcji:</span> np. produkcja sera (z mleka własnego 
                    lub zakupionego), jaja przetworzone, produkty mięsne w małej skali
                  </li>
                  <li>
                    <span className="font-semibold">Sprawdź, czy produkt mieści się w zakresie MOL</span> – czy jest 
                    pochodzenia zwierzęcego lub przetworem zwierzęcym
                  </li>
                  <li>
                    <span className="font-semibold">Przygotuj pomieszczenia produkcyjne lub przetwórcze</span> – mogą to być 
                    pomieszczenia odrębne lub dostosowane w gospodarstwie (z zachowaniem wymagań higieny) - zgodnie z przepisami
                  </li>
                  <li>
                    <span className="font-semibold">Złóż wniosek co najmniej 30 dni przed planowanym rozpoczęciem</span> (lub 
                    inny termin zgodnie z lokalnym organem) do właściwego powiatowego lekarza weterynarii w sprawie wpisu do 
                    rejestru zakładów. Wnioskowi towarzyszą informacje o zakresie produkcji, rodzaju produktów itp.
                  </li>
                  <li>
                    <span className="font-semibold">Po uzyskaniu decyzji i numeru identyfikacyjnego weterynaryjnego</span> – 
                    możesz rozpocząć działalność w ramach MOL
                  </li>
                  <li>
                    <span className="font-semibold">Prowadź ewidencję produkcji i dostaw,</span> przestrzegaj limitów wagowych 
                    oraz obszarowych
                  </li>
                  <li>
                    <span className="font-semibold">Oznakuj miejsce sprzedaży</span> – choć w przypadku MOL dla producentów 
                    może obowiązywać opcja sprzedaży konsumentowi końcowemu w gospodarstwie lub na kiermaszach
                  </li>
                  <li>
                    <span className="font-semibold">Zapewnij ciągłe spełnianie wymagań sanitarno-higienicznych</span> (dobra 
                    praktyka produkcji, przepisy higieniczne) oraz ewentualne kontrole
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Sekcja 5: Zakres produkcji */}
            <Card>
              <CardHeader>
                <CardTitle>5. Zakres produkcji i sprzedaży w ramach MOL – co można sprzedawać</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">Przykładowe produkty, które mogą być wprowadzone w ramach MOL:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <span className="font-semibold">Rozbiór świeżego mięsa</span> (wołowe, wieprzowe, baranie, kozie, końskie, 
                    drobiowe, zajęczaki) lub produkcja surowych wyrobów mięsnych lub mięsa mielonego – limity dostaw wagowych
                  </li>
                  <li>
                    <span className="font-semibold">Produkcja produktów mlecznych</span> lub produktów na bazie siary 
                    wyprodukowanych z mleka lub siary, pozyskanych w gospodarstwie produkcji mleka – przeznaczonych do sprzedaży 
                    bezpośredniej. Limity np. 0,5 tony tygodniowo
                  </li>
                  <li>
                    <span className="font-semibold">Produkcja jajecznych przetworzonych produktów</span> (np. jaja na twardo 
                    w zalewie octowej) – limity wagowe (np. 0,15 tony tygodniowo)
                  </li>
                  <li>
                    <span className="font-semibold">Produkcja gotowych posiłków (potraw)</span> z udziałem produktów pochodzenia 
                    zwierzęcego pod warunkiem, że co najmniej jeden składnik pochodzi z zakładu. Limity wagowe np. 1,5 tony 
                    tygodniowo
                  </li>
                </ul>
                
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <span className="font-semibold">Dla serowarów:</span> produkcja sera z mleka własnego gospodarstwa może być 
                    zakwalifikowana pod MOL, jeśli spełnione limity, a sprzedaż prowadzona jest w ramach warunków.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Sekcja 6: Limity i korzyści */}
            <Card>
              <CardHeader>
                <CardTitle>6. Limity, korzyści i ograniczenia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Limity</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      W ramach MOL obowiązują określone tygodniowe limity wagowe dostaw produktów pochodzenia zwierzęcego/dostaw 
                      do zakładów handlu detalicznego. Przykładowo: dla produktów mlecznych 0,5 tony tygodniowo
                    </li>
                    <li>
                      Obszar działania jest także ograniczony — produkcja i sprzedaż w ramach województwa lub sąsiednich 
                      powiatach/województwach
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Korzyści</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      Uproszczona forma działalności przetwórczej i sprzedażowej dla producentów rolnych w małej skali – mniejsze 
                      bariery wejścia niż dla dużych zakładów
                    </li>
                    <li>
                      Możliwość sprzedaży produktów pochodzenia zwierzęcego lub ich przetworów, co może być atrakcyjne dla serowarów
                    </li>
                    <li>
                      Możliwość budowania lokalnej marki, krótkiego łańcucha dostaw (producent → konsument)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Ograniczenia</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Ograniczenia ilościowe (limity wagowe)</li>
                    <li>Ograniczenia obszaru sprzedaży – szczególnie przy dostawach do zakładów handlu detalicznego poza miejscem produkcji</li>
                    <li>
                      Produkcja w ramach MOL dotyczy głównie produktów pochodzenia zwierzęcego – nie obejmuje w takim samym zakresie 
                      produktów pochodzenia roślinnego czy przetworów stricte roślinnych (które mogą mieścić się lepiej w ramach 
                      innych form, np. RHD)
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja 7: Wymogi bezpieczeństwa */}
            <Card>
              <CardHeader>
                <CardTitle>7. Wymogi związane z bezpieczeństwem żywności, higieną i jakością</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    Produkcja i sprzedaż w ramach MOL podlegają nadzorowi organów weterynaryjnych (gdy produkt pochodzenia 
                    zwierzęcego). Musi być złożony wniosek o wpis zakładu-produkcji do rejestru, nadanie weterynaryjnego numeru 
                    identyfikacyjnego
                  </li>
                  <li>
                    Pomieszczenia produkcyjne muszą spełniać warunki higieniczne – mogą to być specjalne budynki albo pomieszczenia 
                    używane głównie jako mieszkalne, pod warunkiem spełnienia uproszczonych wymagań higienicznych
                  </li>
                  <li>
                    Stosowanie zasad dobrej praktyki higienicznej oraz systemów opartych na HACCP lub uproszczonych procedurach – 
                    w zakładzie powinna być procedura opisująca zagrożenia i działania kontrolne
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Sekcja 8: Praktyczne wskazówki */}
            <Card>
              <CardHeader>
                <CardTitle>8. Praktyczne wskazówki dla serowarów i rolników</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  <li>
                    Sprawdź w swoim gospodarstwie, jakie masz surowce zwierzęce (np. mleko, jaja) i w jakim stopniu je przetwarzasz 
                    — to istotne dla kwalifikacji do MOL
                  </li>
                  <li>
                    Zdecyduj, czy produkcja/wytwarzanie w ramach MOL odpowiada Twojemu profilowi działalności (czy jest to produkcja 
                    zwierzęca/przetworzona). Jeżeli produkcja roślinna lub przetwórstwo roślinne – może być lepiej rozważyć inne 
                    formy (np. RHD)
                  </li>
                  <li>
                    Zadbaj o pomieszczenia produkcyjne – czy spełniają warunki higieniczne, czy są odpowiednio zarejestrowane
                  </li>
                  <li>
                    Złóż wniosek do lekarza weterynarii, zapewnij rejestrację zakładu i nadanie numeru identyfikacyjnego
                  </li>
                  <li>
                    Prowadź ewidencję produkcji i sprzedaży – dokumentuj dostawy, limity, miejsca sprzedaży
                  </li>
                  <li>
                    Zadbaj o odpowiednie oznakowanie produktów i miejsca sprzedaży, jeśli jest to wymagane
                  </li>
                  <li>
                    Zorientuj się w limicie dostaw i obszarze sprzedaży – uważaj na przekroczenie limitów, bo może to oznaczać 
                    konieczność zmiany formy działalności lub dodatkowe wymagania
                  </li>
                  <li>
                    Rozważ połączenie tej formy (MOL) z działalnością w ramach innych form (np. sprzedaż bezpośrednia, RHD) jeśli 
                    Twój profil produktowy jest szerszy
                  </li>
                  <li>
                    Konsultuj się z lokalnym lekarzem weterynarii, stacją sanitarno-epidemiologiczną oraz ośrodkiem doradztwa 
                    rolniczego – warunki lokalne mogą się różnić
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Sekcja 9: Podsumowanie */}
            <Card>
              <CardHeader>
                <CardTitle>9. Podsumowanie kluczowych punktów</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    ✓ MOL to jedna z opcji dla rolników-przetwórców, w tym serowarów, którzy chcą sprzedawać produkty pochodzenia 
                    zwierzęcego lub ich przetwory
                  </li>
                  <li>
                    ✓ Wymaga spełnienia warunków dotyczących zakresu działalności, limitów, obszaru, rejestracji i higieny
                  </li>
                  <li>
                    ✓ Może być atrakcyjną formą działalności przy małej skali, służącą budowaniu lokalnej marki i sprzedaży 
                    bezpośredniej lub zbliżonej
                  </li>
                  <li>
                    ✓ Nie obejmuje wszystkich rodzajów żywności – np. produkty stricte roślinne mogą być nieoptymalnie 
                    zakwalifikowane do MOL
                  </li>
                  <li>
                    ✓ Warto sprawdzić, czy Twoja działalność serowarska najlepiej pasuje do MOL, czy może do innej formy 
                    (jak Rolniczy Handel Detaliczny (RHD)) – w zależności od surowca, zakresu produkcji i kanałów sprzedaży
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MOL;