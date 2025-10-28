import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import ReactionButton from "@/components/ReactionButton";

const RzezniRolnicza = () => {
  useEffect(() => {
    document.title = "Rzeźnia Rolnicza - Serowarstwo.pl";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Przewodnik po uruchomieniu małej ubojni drobiu przy gospodarstwie - limity, wymagania, wyposażenie i pełna procedura krok po kroku"
      );
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      
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
            <div className="mb-4">
              <h1 className="text-4xl font-bold mb-4 text-primary">Rzeźnia Rolnicza</h1>
              <p className="text-lg text-muted-foreground">
                Kompleksowy przewodnik po uruchomieniu małej ubojni drobiu przy gospodarstwie
              </p>
            </div>
          </div>

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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RzezniRolnicza;
