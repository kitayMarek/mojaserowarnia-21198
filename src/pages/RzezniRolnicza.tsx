import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import FAQSchema from "@/components/FAQSchema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Scale } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Link } from "react-router-dom";
import ReactionButton from "@/components/ReactionButton";

const faqs = [
  {
    question: "Co to jest rzeźnia rolnicza?",
    answer: "Rzeźnia rolnicza to zakład uboju zlokalizowany na terenie gospodarstwa, działający z uproszczonymi wymaganiami i limitami. Rozwiązanie funkcjonuje w Polsce od 18.02.2020 r. na podstawie rozporządzenia MRiRW."
  },
  {
    question: "Jakie są limity uboju w rzeźni rolniczej?",
    answer: "Limit dzienny wynosi do 50 sztuk drobiu, a limit roczny do 18 250 sztuk. W szczególnych sytuacjach PLW może dopuścić przekroczenie limitu dziennego, o ile nie zostanie przekroczony limit roczny."
  },
  {
    question: "Jak uruchomić małą ubojnię drobiu?",
    answer: "Kroki: 1) Konsultacja z PLW, 2) Projekt technologiczny zakładu, 3) Adaptacja pomieszczeń, 4) Przygotowanie dokumentacji GHP/HACCP, 5) Wniosek o zatwierdzenie i numer weterynaryjny, 6) Ustalenie zasad nadzoru weterynaryjnego."
  },
  {
    question: "Jaka temperatura przechowywania mięsa drobiowego?",
    answer: "Mięso drobiu po uboju musi być szybko schłodzone i utrzymywane w temperaturze ≤ 4°C zgodnie z rozporządzeniem 853/2004. Wymagane jest dokumentowanie kontroli temperatur w rejestrach."
  },
  {
    question: "Jaką dokumentację musi prowadzić rzeźnia rolnicza?",
    answer: "Wymagana dokumentacja obejmuje: GHP/GMP, uproszczony HACCP, rejestr temperatur, ewidencję uboju i sprzedaży, traceability (numery partii, źródło zwierząt), SOP dobrostanowe oraz dokumentację UPPZ."
  },
  {
    question: "Komu można sprzedawać mięso z rzeźni rolniczej?",
    answer: "Mięso można sprzedawać konsumentowi końcowemu oraz lokalnemu detalowi/gastronomii zgodnie z reżimem RHD/MOL i ograniczeniami obszarowymi oraz ilościowymi. Wbrew częstemu twierdzeniu mięso z rzeźni rolniczej może być też wywożone do innych państw członkowskich UE oraz państw trzecich (o ile ich władze nie stawiają wymagań niemożliwych do spełnienia)."
  },
  {
    question: "Co to jest rzeźnia (ubojnia)?",
    answer: "Ubojnia (rzeźnia) to każdy zakład pod państwową kontrolą sanitarną i weterynaryjną przeznaczony do uboju zwierząt — z wyodrębnionym pomieszczeniem do przetrzymywania zwierząt oraz do ogłuszania i wykrwawiania (art. 4 pkt 13 ustawy o ochronie zwierząt). Rzeźnia rolnicza to szczególny rodzaj: rzeźnia o małej zdolności produkcyjnej położona na terenie gospodarstwa, działająca na uproszczonych zasadach (17 odstępstw)."
  },
  {
    question: "Jakie zwierzęta można ubijać w rzeźni rolniczej?",
    answer: "Bydło, owce, kozy, konie, świnie, zwierzęta dzikie utrzymywane fermowo (jelenie, daniele), ptaki bezgrzebieniowe (strusie) oraz drób i zajęczaki. Rzeźnia rolnicza obejmuje ubój i rozbiór mięsa tych zwierząt."
  },
  {
    question: "Czy w rzeźni rolniczej można przetwarzać mięso (robić wędliny)?",
    answer: "Nie. Rozporządzenie reguluje wyłącznie ubój i rozbiór mięsa — nie jego przetwarzanie. Produkcja wędlin, kiełbas czy szynek musi odbywać się w ramach osobnej działalności (RHD, sprzedaż bezpośrednia lub MLO). Rzeźnia rolnicza i RHD to dwie odrębne rejestracje i dwa odrębne zakłady, choć mogą sąsiadować."
  },
  {
    question: "Co to jest ubój usługowy w rzeźni rolniczej?",
    answer: "To ubój zwierząt należących do innych podmiotów, utrzymywanych w tym samym powiecie lub powiatach sąsiednich. Ograniczenia terytorialne dotyczą wyłącznie zwierząt obcych — jeśli sam masz kilka siedzib stad, także poza powiatem, ograniczenia Cię nie dotyczą. Warunek: status epizootyczny stada pochodzenia nie może być niższy niż status gospodarstwa, na terenie którego jest rzeźnia."
  },
  {
    question: "Czy ubojnia musi mieć monitoring wideo?",
    answer: "W Polsce monitoring ubojni nie jest obowiązkowy (stan na 2026 r.) — kolejne projekty ustaw nie weszły w życie, a projekt z 2019 r. i tak wyłączał małe rzeźnie z uwagi na koszty. Dla porównania Niemcy wymagają monitoringu dopiero w dużych zakładach (od ok. 1000 sztuk bydła lub 150 000 sztuk drobiu rocznie). Rzeźnia rolnicza jest daleko poniżej takich progów."
  }
];

const RzezniRolnicza = () => {
  useEffect(() => {
    document.title = "Rzeźnia rolnicza — co to jest, limity uboju, wymagania i zatwierdzenie | Moja Serowarnia";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Rzeźnia rolnicza (mała ubojnia przy gospodarstwie): definicja, limity uboju wszystkich gatunków, wymagania techniczne, ubój usługowy, procedura zatwierdzenia (WNI) i monitoring ubojni. Kompletny przewodnik."
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <FAQSchema faqs={faqs} />
      <Navigation />
      <PageBreadcrumbs items={[
        { label: "Prawo", href: "/prawo" },
        { label: "Rzeźnia Rolnicza" }
      ]} />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/prawo" 
            className="inline-flex items-center text-primary hover:underline mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do Prawo
          </Link>

          <div className="mb-8">
            <Link to="/poradniki" className="inline-flex items-center text-primary hover:underline mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót do Poradników
            </Link>
            <div className="mb-6">
              <ReactionButton contentType="legal_page" contentId="rzeznia-rolnicza" variant="default" />
            </div>
            <PageHeader
              icon={Scale}
              color="emerald"
              title="Rzeźnia rolnicza"
              subtitle="Co to jest rzeźnia rolnicza, limity uboju wszystkich gatunków, wymagania techniczne, ubój usługowy, procedura zatwierdzenia i monitoring — kompletny przewodnik dla rolników"
            />
          </div>

          {/* TL;DR Section */}
          <TLDRSection>
            <ul className="space-y-1">
              <li>• <strong>Limit:</strong> do 50 szt. drobiu/dzień, do 18 250 szt./rok (small-scale poultry slaughterhouse)</li>
              <li>• <strong>Rejestracja:</strong> projekt technologiczny → zatwierdzenie przez PLW → numer weterynaryjny</li>
              <li>• <strong>Wymagania:</strong> rozdzielenie stref, chłodnia ≤4°C, dokumentacja GHP/HACCP</li>
              <li>• <strong>Sprzedaż:</strong> konsument końcowy lub lokalny detal (RHD/MOL)</li>
            </ul>
          </TLDRSection>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Co to jest „mała ubojnia" (rzeźnia rolnicza)</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  To zakład uboju zlokalizowany na terenie gospodarstwa, działający w reżimie uproszczonych 
                  wymagań konstrukcyjnych i organizacyjnych, z limitami dziennymi i rocznymi uboju. 
                  Rozwiązanie funkcjonuje w Polsce od 18.02.2020 r. na podstawie{" "}
                  <a 
                    href="https://www.inforlex.pl/akty-prawne/dzu-dziennik-ustaw/najnowsze/2019/2628" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    rozporządzenia MRiRW o niektórych wymaganiach weterynaryjnych dla rzeźni o małej zdolności produkcyjnej
                  </a>.
                </p>
              </CardContent>
            </Card>

            {/* Definicje */}
            <Card>
              <CardHeader>
                <CardTitle>Co to jest rzeźnia i rzeźnia rolnicza — definicje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p><strong>Ubojnia (rzeźnia)</strong> — zgodnie z art. 4 pkt 13 ustawy o ochronie zwierząt to każdy zakład pozostający pod państwową kontrolą sanitarną i weterynaryjną, przeznaczony do uboju zwierząt. Wyodrębnia się w niej pomieszczenie do przetrzymywania zwierząt oraz do ogłuszania i wykrwawiania.</p>
                <p><strong>Rzeźnia rolnicza</strong> — rzeźnia o małej zdolności produkcyjnej położona na terenie gospodarstwa, w której: a) ubija się zwierzęta gospodarskie kopytne, drób, zajęczaki lub zwierzęta dzikie utrzymywane fermowo, których posiadaczem jest prowadzący rzeźnię lub inny podmiot z tego samego powiatu albo powiatów sąsiednich, lub b) dokonuje się rozbioru mięsa z tych zwierząt.</p>
                <div className="bg-muted/50 p-4 rounded-lg text-sm">
                  <p className="font-semibold mb-1">Podstawa prawna</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Rozporządzenie MRiRW z 20 grudnia 2019 r. (Dz.U. 2020 poz. 56), obowiązuje od 18 lutego 2020 r.</li>
                    <li>Podstawa unijna: art. 13 ust. 3 rozp. (WE) 852/2004 oraz art. 10 ust. 3 rozp. (WE) 853/2004 — krajowe środki dostosowujące.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Pełne limity uboju */}
            <Card>
              <CardHeader>
                <CardTitle>Limity uboju — wszystkie gatunki (dzienne i roczne)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-secondary/50">
                        <th className="text-left p-2 font-semibold">Gatunek</th>
                        <th className="text-left p-2 font-semibold">Limit dzienny</th>
                        <th className="text-left p-2 font-semibold">Limit roczny</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b"><td className="p-2">Drób albo zajęczaki</td><td className="p-2">50 szt.</td><td className="p-2">18 250 szt.</td></tr>
                      <tr className="border-b"><td className="p-2">Ptaki bezgrzebieniowe (strusie)</td><td className="p-2">1 szt.</td><td className="p-2">365 szt.</td></tr>
                      <tr className="border-b"><td className="p-2">Świnie ≥ 15 kg</td><td className="p-2">6 szt.</td><td className="p-2">2190 szt.</td></tr>
                      <tr className="border-b"><td className="p-2">Świnie &lt; 15 kg</td><td className="p-2">10 szt.</td><td className="p-2">3650 szt.</td></tr>
                      <tr className="border-b"><td className="p-2">Owce albo kozy ≥ 15 kg</td><td className="p-2">6 szt.</td><td className="p-2">2190 szt.</td></tr>
                      <tr className="border-b"><td className="p-2">Owce albo kozy &lt; 15 kg</td><td className="p-2">10 szt.</td><td className="p-2">3650 szt.</td></tr>
                      <tr className="border-b"><td className="p-2">Bydło albo konie ≥ 3 m-cy</td><td className="p-2">1 szt.</td><td className="p-2">365 szt.</td></tr>
                      <tr className="border-b"><td className="p-2">Bydło albo konie &lt; 3 m-cy</td><td className="p-2">2 szt.</td><td className="p-2">730 szt.</td></tr>
                      <tr><td className="p-2">Zwierzęta dzikie fermowe</td><td className="p-2">3 szt.</td><td className="p-2">1095 szt.</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-3"><strong>Limit zbiorczy dzienny:</strong> 50 sztuk (drób albo zajęczaki) lub 15 sztuk (pozostałe zwierzęta łącznie). PLW może na wniosek wyrazić zgodę na przekroczenie limitu dziennego, jeśli wielkość i konstrukcja pomieszczeń oraz pojemność chłodni zapewniają higienę uboju i łańcuch chłodniczy, a limit roczny zostanie zachowany (tego dnia ubija się wtedy wyłącznie jeden gatunek).</p>
              </CardContent>
            </Card>

            {/* Czego NIE może + pętla RHD */}
            <Card className="border-amber-500/40">
              <CardHeader>
                <CardTitle>Czego rzeźnia rolnicza NIE może — ubój i rozbiór, nie przetwarzanie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>To najważniejsza pułapka koncepcyjna. Rozporządzenie reguluje <strong>wyłącznie ubój i rozbiór mięsa</strong> — <strong>nie jego przetwarzanie</strong>. Produkcja przetworów (szynek, kiełbas) musi odbywać się w ramach osobnej działalności: <strong>RHD, sprzedaży bezpośredniej lub MLO</strong>. Rzeźnia rolnicza i RHD to dwie odrębne rejestracje i dwa odrębne zakłady — choć mogą sąsiadować.</p>
                <div className="bg-primary/10 p-4 rounded-lg text-sm">
                  <p className="font-semibold mb-1">Dlaczego to ważne — pętla RHD</p>
                  <p>W RHD obowiązuje zakaz wykorzystywania do produkcji mięsa zwierząt kopytnych pozyskanego z uboju poza rzeźnią zatwierdzoną przez PLW (np. z uboju na własny użytek). Innymi słowy: bez dostępu do <strong>zatwierdzonej rzeźni</strong> nie zrobisz legalnie kiełbasy z własnej świni w ramach RHD. Rzeźnia rolnicza jest zakładem zatwierdzonym — więc „odblokowuje" cały segment przetworów mięsnych dla lokalnych rolników.</p>
                </div>
              </CardContent>
            </Card>

            {/* Ubój usługowy */}
            <Card>
              <CardHeader>
                <CardTitle>Ubój usługowy — dla zwierząt innych rolników</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>W rzeźni rolniczej można ubijać zwierzęta <strong>innych podmiotów</strong>, utrzymywane w tym samym powiecie lub powiatach sąsiednich (tzw. ubój usługowy).</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Ograniczenia terytorialne dotyczą <strong>wyłącznie zwierząt obcych</strong>. Jeśli masz kilka własnych siedzib stad, także poza powiatem — ograniczenia Cię nie dotyczą.</li>
                  <li>Warunek epizootyczny: status epizootyczny stada pochodzenia nie może być niższy niż status gospodarstwa, na terenie którego znajduje się rzeźnia.</li>
                  <li>Ubój usługowy podnosi wymagania: konieczna staje się <strong>zagroda dla zwierząt chorych</strong> i pełniejszy reżim transportu (przy uboju wyłącznie własnych zwierząt te wymogi odpadają).</li>
                </ul>
              </CardContent>
            </Card>

            {/* Limity uboju drobiu (istniejąca sekcja) */}
            <Card>
              <CardHeader>
                <CardTitle>Limity uboju drobiu (rzeźnia rolnicza)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Limit dzienny:</h3>
                  <p className="text-muted-foreground">Do 50 sztuk drobiu (łącznie)</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Limit roczny:</h3>
                  <p className="text-muted-foreground">Do 18 250 sztuk drobiu</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">
                    W szczególnych sytuacjach Powiatowy Lekarz Weterynarii (PLW) może dopuścić przekroczenie 
                    limitu dziennego, o ile nie zostanie przekroczony limit roczny.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Najważniejsze wymagania prawne</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <ul>
                  <li>
                    <a 
                      href="https://www.inforlex.pl/akty-prawne/dzu-dziennik-ustaw/najnowsze/2019/2628" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Rozporządzenie MRiRW (20.12.2019)
                    </a> – „niektóre wymagania weterynaryjne (…) w rzeźniach o małej zdolności produkcyjnej" 
                    (rzeźnie rolnicze): układ, konstrukcja, wyposażenie, organizacja pracy
                  </li>
                  <li>
                    <a 
                      href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20130000579" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Projekt technologiczny zakładu
                    </a> – do zatwierdzenia przez Powiatowego Lekarza Weterynarii (PLW)
                  </li>
                  <li>
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0852" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Rozporządzenie (WE) 852/2004
                    </a> i{" "}
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0853" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      853/2004
                    </a> – higiena środków spożywczych
                  </li>
                  <li>
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32009R1099" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Rozporządzenie (WE) 1099/2009
                    </a> – dobrostan i ogłuszanie: metody ogłuszania, kwalifikacje osób, SOP-y dobrostanowe
                  </li>
                  <li>
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32002R0178" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Rozporządzenie (WE) 178/2002
                    </a> – traceability i wycofania
                  </li>
                  <li>
                    <a 
                      href="https://www.wetgiw.gov.pl/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Poradniki/Wytyczne GIW
                    </a> dla rzeźni rolniczych – praktyczne interpretacje wymagań
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Układ pomieszczeń i podstawowe wyposażenie</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-3">Strefy funkcjonalne (przepływ „brudne → czyste")</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Przyjęcie żywego drobiu (wiata/zadaszenie, możliwość oddzielenia stad)</li>
                  <li>✓ Ogłuszanie i wykrwawianie (dobrostan + odprowadzanie krwi)</li>
                  <li>✓ Oparzanie i skubanie (kotły/parniki, skubarki bębnowe/tarczowe)</li>
                  <li>✓ Wypalanie/oskuby końcowe, patroszenie (stoły nierdzewne, bieżąca woda)</li>
                  <li>✓ Płukanie i mycie tuszek (punkty wodne, kratki ściekowe)</li>
                  <li>✓ Chłodzenie/tunele schładzania (osiągnięcie wymaganej temp.)</li>
                  <li>✓ Pakowanie, magazyn chłodni (oddzielnie od stref „brudnych")</li>
                  <li>✓ Magazyn opakowań czystych i chemii (oddzielnie)</li>
                  <li>✓ Pomieszczenie socjalno-higieniczne personelu (szatnie, WC, umywalki)</li>
                </ul>
                <div className="bg-muted/50 p-4 rounded-lg mt-4">
                  <p className="text-sm">
                    Wymaga się rozdzielenia stref brudnych i czystych, powierzchni zmywalnych, łatwych do 
                    dezynfekcji, wydajnego odwodnienia, myjek do rąk i narzędzi.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chłodzenie i temperatura</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mięso drobiu po uboju musi być szybko schłodzone i utrzymywane w temperaturach zgodnych z{" "}
                  <a 
                    href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0853" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    rozporządzeniem 853/2004
                  </a> (typowo ≤ 4 °C dla mięsa drobiowego), z możliwością dokumentowania kontroli 
                  temperatur (rejestry).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wyposażenie kluczowe (minimum)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Urządzenie do ogłuszania drobiu (np. koryto wodne z prądem z kontrolą parametrów; 
                    alternatywnie systemy gazowe – zgodne z 1099/2009)</li>
                  <li>• Stanowisko do wykrwawiania (z odprowadzeniem krwi)</li>
                  <li>• Parnik/oparzarka i skubarka</li>
                  <li>• Stoły, noże, haki, zmywaki noży i umywalki bezdotykowe</li>
                  <li>• Chłodnia o odpowiedniej pojemności, termometry/rejestratory</li>
                  <li>• Zlew do narzędzi, myjki do skrzynek</li>
                  <li>• Pojemniki/zbiorniki na uboczne produkty pochodzenia zwierzęcego (UPPZ) (kat. 3), 
                    umowa z odbiorcą UPPZ</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personel i kwalifikacje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Osoby wykonujące ogłuszanie i ubój muszą mieć kompetencje (szkolenie teoretyczne + praktyka; 
                  standardowo wymagane przez PLW przed nadaniem uprawnień na stanowisku ubojowym).
                </p>
                <p className="text-muted-foreground">
                  Wymagane procedury dobrostanowe (SOP) zgodne z{" "}
                  <a 
                    href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32009R1099" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    rozporządzeniem 1099/2009
                  </a> i wyznaczona osoba nadzorująca dobrostan.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nadzór urzędowy i weterynaryjny</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Zatwierdzenie zakładu i numer weterynaryjny wydaje PLW po kontroli zgodności z wymaganiami 
                  (decyzja administracyjna).
                </p>
                <p className="text-muted-foreground">
                  W małej rzeźni drobiu odbywa się badanie poubojowe (a w praktyce również nadzór nad przebiegiem 
                  uboju) przez urzędowego lekarza wet. Zasady organizacyjne ustala PLW (grafik, zakres obecności, 
                  sposób zgłaszania uboju).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dokumentacja, którą musisz prowadzić</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Księga GHP/GMP (higiena, mycie/dezynfekcja, szkodniki, woda, odpady)</li>
                  <li>✓ Uproszczony HACCP (analiza ryzyk, CCP/monitoring np. parametry ogłuszania, schładzanie)</li>
                  <li>✓ Rejestr temperatur (chłodnie, schładzanie)</li>
                  <li>✓ Rejestry mycia i dezynfekcji, DDD, wody (jeśli ujęcie własne – badanie okresowe)</li>
                  <li>✓ Ewidencja uboju i sprzedaży (ilości, odbiorcy; kontrola limitów dziennych/rocznych)</li>
                  <li>✓ Traceability: numery partii, źródło zwierząt (stado/gospodarstwo), odbiorcy mięsa, 
                    procedura wycofania</li>
                  <li>✓ Dobrostan: SOP ogłuszania/wykrwawiania, dziennik zdarzeń, potwierdzenie kwalifikacji</li>
                  <li>✓ UPPZ: umowa na odbiór, karty przekazania, ewidencja</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gdzie i komu można sprzedawać mięso</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Rzeźnia rolnicza jest projektowana pod krótki łańcuch dostaw: sprzedaż konsumentowi końcowemu 
                  oraz lokalnemu detalowi/gastronomii (zgodnie z reżimem RHD/MOL i ograniczeniami obszarowymi 
                  oraz ilościowymi). Upewnij się, który tryb (RHD vs. MOL) zastosujesz do zbytu i oznakowania.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>KROK-PO-KROKU: jak uruchomić małą ubojnię drobiu</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                  <li>
                    <strong>Konsultacja wstępna z PLW</strong> – opis planu: skala, gatunki, tryb sprzedaży, 
                    plan lokalizacji. Ustalisz interpretacje lokalne i listę wymaganych załączników.
                  </li>
                  <li>
                    <strong>Projekt technologiczny zakładu</strong> – układ pomieszczeń (strefy), przepływy, 
                    media, wykaz urządzeń, procedury. Przygotuj zgodnie z przepisami i złóż do zatwierdzenia 
                    przez PLW.
                  </li>
                  <li>
                    <strong>Adaptacja/wykonanie pomieszczeń</strong> i montaż wyposażenia zgodnie z zatwierdzonym 
                    projektem (powierzchnie zmywalne, odwodnienia, chłodnia, urządzenia ubojowe i sanitarne, 
                    magazyny czysty/brudny).
                  </li>
                  <li>
                    <strong>Systemy i dokumentacja</strong> – GHP/GMP, HACCP (uproszczony), SOP dobrostanowe 
                    (1099/2009), traceability, umowy na UPPZ, umowa na odbiór odpadów/ścieków, badania wody.
                  </li>
                  <li>
                    <strong>Wniosek o zatwierdzenie zakładu</strong> do PLW (inspekcja przed-zatwierdzeniowa → 
                    decyzja i numer weterynaryjny).
                  </li>
                  <li>
                    <strong>Ustalenie zasad obecności lekarza wet.</strong> i zgłaszania uboju (harmonogramy, 
                    badania poubojowe, dokumenty towarzyszące).
                  </li>
                  <li>
                    <strong>Rozruch próbny</strong> – test procedur higienicznych, dobrostanowych, rejestrów; 
                    kalibracja urządzeń (np. natężenie prądu w korycie ogłuszającym, monitoring temp.).
                  </li>
                  <li>
                    <strong>Start produkcji</strong> i bieżąca sprawozdawczość (ewidencje, traceability, 
                    bieżące kontrole własne, gotowość do wycofania partii).
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Częste wymagania techniczne i organizacyjne (checklista)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>☑ Rozdzielone strefy „brudna/czysta"; przepływy jednokierunkowe</li>
                  <li>☑ Myjki do rąk (bezdotykowe), dozowniki środka myjącego, ręczniki jednorazowe</li>
                  <li>☑ Myjki do narzędzi (70–82 °C) i stanowisko dezynfekcji</li>
                  <li>☑ Wydajne odwodnienie, kratki ściekowe, separacja tłuszczu (jeśli wymagana lokalnie)</li>
                  <li>☑ Chłodnia z rejestracją temperatur; pojemność adekwatna do planowanych dziennych ubojów</li>
                  <li>☑ Legalne metody ogłuszania drobiu; SOP i rejestry do 1099/2009 (parametry prądu, 
                    czas ekspozycji)</li>
                  <li>☑ Umowa na odbiór UPPZ (kat. 3) i pojemniki z oznaczeniem</li>
                  <li>☑ Bezpieczne zasilanie wodą (woda z wodociągu lub badania ujęcia własnego)</li>
                  <li>☑ Zgłaszanie uboju do PLW wg ustalonych zasad (terminy, formularze)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Różnice: rzeźnia rolnicza vs. ubój w gospodarstwie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Rzeźnia rolnicza:</h3>
                  <p className="text-muted-foreground">
                    Legalny ubój na rynek (sprzedaż), pod numerem weterynaryjnym, z limitem dziennym/rocznym, 
                    pełnym nadzorem i dokumentacją.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Ubój na użytek własny:</h3>
                  <p className="text-muted-foreground">
                    Tylko na własną konsumpcję gospodarstwa (bez sprzedaży). Inne zasady.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Monitoring ubojni */}
            <Card>
              <CardHeader>
                <CardTitle>Monitoring ubojni — czy jest obowiązkowy?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>W Polsce monitoring ubojni <strong>nie jest obowiązkowy</strong> (stan na 2026 r.). Kolejne projekty ustaw — po tzw. „aferze leżakowej" z 2019 r. oraz projekt z lutego 2024 r. przewidujący całodobowy monitoring cyfrowy we wszystkich ubojniach — <strong>nie weszły w życie</strong>. Co istotne, projekt z 2019 r. i tak wyłączał małe rzeźnie z uwagi na koszty.</p>
                <div className="bg-muted/50 p-4 rounded-lg text-sm">
                  <p className="font-semibold mb-1">Dla porównania — Niemcy</p>
                  <p>Niemcy wprowadziły obowiązkowy monitoring wideo tylko w <strong>dużych</strong> rzeźniach: od ok. 1000 jednostek hodowlanych rocznie (1000 sztuk bydła lub 5000 tuczników) albo 150 000 sztuk drobiu/królików. Mniejsze zakłady są zwolnione — także w modelu niemieckim rzeźnia rolnicza jest daleko poniżej progu.</p>
                </div>
              </CardContent>
            </Card>

            {/* Procedura zatwierdzenia + WNI */}
            <Card>
              <CardHeader>
                <CardTitle>Procedura zatwierdzenia zakładu i numer WNI (symbol 36)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Rzeźnia rolnicza podlega <strong>procedurze zatwierdzenia</strong> (a nie zwykłej rejestracji jak RHD) — analogicznie do rzeźni zatwierdzonych na rynek UE:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Wypełniasz obowiązki z art. 19 i 21 ustawy o produktach pochodzenia zwierzęcego.</li>
                  <li>Składasz do PLW wniosek o <strong>zatwierdzenie zakładu</strong>.</li>
                  <li>We wniosku wskazujesz, że chcesz prowadzić rzeźnię rolniczą oraz czy wnioskujesz tylko o ubój, czy również o rozbiór mięsa.</li>
                  <li>Deklarujesz zamiar skorzystania z krajowych środków dostosowujących.</li>
                  <li>PLW wydaje decyzję zatwierdzającą (lub warunkowo zatwierdzającą), wskazując, z jakich odstępstw zakład korzysta.</li>
                  <li>Otrzymujesz <strong>weterynaryjny numer identyfikacyjny (WNI)</strong> z symbolem <strong>36</strong> — „zakład zatwierdzony korzystający z krajowych środków dostosowujących".</li>
                </ol>
                <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-3 rounded text-sm">
                  <strong>Uwaga aktualizacyjna:</strong> rozporządzenie MRiRW z 10 marca 2026 r. (Dz.U. 2026 poz. 343) zmieniło wykaz symboli WNI w związku z nową ustawą o zdrowiu zwierząt — symbol 36 mógł zostać przenumerowany. Potwierdź aktualny symbol u swojego powiatowego lekarza weterynarii. Zapytaj też wprost, czy w Twoim przypadku wymagany jest projekt technologiczny.
                </div>
              </CardContent>
            </Card>

            {/* Kwalifikacje — rozbieżność */}
            <Card>
              <CardHeader>
                <CardTitle>Kwalifikacje osoby ubijającej — uwaga: rozbieżność w źródłach</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">Źródła nie są zgodne co do wymogu praktyki dla osób dokonujących uboju w rzeźni rolniczej:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Wytyczne GIW (styczeń 2020): pracownicy powinni mieć kwalifikacje do zawodowego uboju wg rozp. MRiRW z 9 września 2004 r. — bez wzmianki o zwolnieniu.</li>
                  <li>Część opracowań ODR: pracownicy rzeźni rolniczych są <strong>zwolnieni z 3-miesięcznej praktyki</strong> ubojowej.</li>
                  <li>Inne opracowania: wymagane bezpłatne szkolenie teoretyczne u PLW oraz zaliczenie 3-miesięcznej praktyki pod nadzorem osoby z 3-letnim stażem.</li>
                </ul>
                <p className="text-sm text-muted-foreground">Różnica to realnie kilka miesięcy i koszt — dlatego <strong>zapytaj pisemnie swojego PLW</strong>. Bezsporne jest natomiast, że ubój wykonuje się wyłącznie po uprzednim pozbawieniu zwierzęcia świadomości, metodami dopuszczonymi rozp. (WE) nr 1099/2009.</p>
              </CardContent>
            </Card>

            {/* Badania, odpady, znakowanie */}
            <Card>
              <CardHeader>
                <CardTitle>Badanie na włośnie, odpady (UPPZ) i znakowanie mięsa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p><strong>Włośnie:</strong> w rzeźni rolniczej obowiązkowe jest badanie mięsa na obecność włośni jako część badania poubojowego (metoda wytrawiania, rozp. 2015/1375). Badanie może być wykonane w laboratorium poza rzeźnią; laboratoria zajmujące się wyłącznie włośniami nie muszą mieć akredytacji ISO 17025, o ile są pod nadzorem PLW i uczestniczą w badaniach biegłości.</p>
                <p><strong>UPPZ</strong> (uboczne produkty pochodzenia zwierzęcego): co do zasady przekazywane bez zwłoki do utylizacji; przy uboju małych ilości zakład ustala w procedurach maksymalny czas przechowywania.</p>
                <p><strong>Znakowanie:</strong> znak jakości zdrowotnej (owalny, PL + WNI) dla tusz, półtusz i ćwierćtusz zwierząt kopytnych; znak identyfikacyjny dla mięsa drobiowego, zajęczaków, ptaków bezgrzebieniowych oraz mięsa z rozbioru.</p>
              </CardContent>
            </Card>

            {/* Finansowanie */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Finansowanie — nabór jesienią 2026</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Interwencja „Rozwój współpracy w ramach łańcucha wartości (w gospodarstwie)":</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Termin naboru:</strong> 1 października – 2 listopada 2026 r.</li>
                  <li><strong>Budżet:</strong> 51 mln euro; kwoty 30 000 / 60 000 / 120 000 zł zależnie od wielkości operacji.</li>
                  <li><strong>Dofinansowanie:</strong> do 65% kosztów (ryczałt); wypłata 80% na start, 20% po zakończeniu.</li>
                  <li><strong>Beneficjenci:</strong> rolnicy prowadzący lub rozpoczynający RHD; wsparcie obejmuje RHD, sprzedaż bezpośrednią i MOL.</li>
                  <li><strong>Kwalifikowane:</strong> modernizacja przetwórstwa w gospodarstwie, innowacje, infrastruktura środowiskowa, cyfrowe narzędzia sprzedaży i zarządzania.</li>
                </ul>
                <p className="text-muted-foreground">Zweryfikuj aktualne warunki i terminy w ARiMR przed złożeniem wniosku.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Podstawa prawna (kluczowe źródła)</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <ul>
                  <li>
                    <a 
                      href="https://www.inforlex.pl/akty-prawne/dzu-dziennik-ustaw/najnowsze/2019/2628" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Rozporządzenie MRiRW (20.12.2019)
                    </a> – rzeźnie o małej zdolności produkcyjnej na terenie gospodarstw
                  </li>
                  <li>
                    <a 
                      href="https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20130000579" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Projekt technologiczny
                    </a> – zatwierdzany przez PLW
                  </li>
                  <li>
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0852" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Rozporządzenie (WE) 852/2004
                    </a> i{" "}
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0853" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      853/2004
                    </a> – higiena, mięso drobiowe
                  </li>
                  <li>
                    <a 
                      href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32009R1099" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Rozporządzenie (WE) 1099/2009
                    </a> – ochrona zwierząt podczas uśmiercania
                  </li>
                  <li>
                    <a 
                      href="https://www.wetgiw.gov.pl/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Wytyczne GIW/GLW
                    </a> – praktyka, identyfikowalność i znakowanie
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* See Also Section */}
            <SeeAlso links={[
              { href: "/prawo/rhd", title: "Rolniczy Handel Detaliczny", description: "Sprzedaż mięsa w ramach RHD" },
              { href: "/prawo/rhd/dokumenty", title: "Dokumenty w RHD", description: "Wymagana dokumentacja" },
              { href: "/prawo/mol", title: "Działalność MOL", description: "Sprzedaż do sklepów i restauracji" },
              { href: "/prawo/akty-prawne-ue", title: "Akty prawne UE", description: "Rozporządzenia 852, 853, 854/2004" }
            ]} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RzezniRolnicza;
