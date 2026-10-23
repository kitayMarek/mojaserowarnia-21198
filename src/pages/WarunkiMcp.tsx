import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { ADRES_MCP } from "@/lib/lacznikClaude";

/**
 * Warunki korzystania z serwera MCP (dane.mojaserowarnia.pl/mcp), 23.10.2026.
 * Powstały na potrzeby zgłoszenia łącznika do katalogu Perplexity (pole
 * „Terms of service”), ale dotyczą każdego programu, który łączy się z serwerem.
 * Część angielska jest dla zespołów, które oceniają łącznik.
 *
 * Liczby (limity) i opis pomiaru muszą się zgadzać z worker-magazyn/src/index.js
 * i worker-magazyn/src/pomiar.js. Prywatność: sekcja #serwer-mcp na /nota-prawna.
 *
 * Treść 1:1 z mirrorem public/warunki-mcp.html, tytuł i opis w metaStron.ts.
 */
const WarunkiMcp = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <PageBreadcrumbs items={[{ label: "Asystenci AI", href: "/asystenci-ai" }, { label: "Warunki serwera MCP" }]} />

    <main className="pt-20">
      <div className="container mx-auto px-4 pt-2 md:pt-4">
        <div className="max-w-3xl mx-auto">
          <PageHeader
            icon={FileText}
            color="violet"
            title="Warunki korzystania z serwera MCP"
            subtitle="Zasady dla programów i asystentów AI, które łączą się z danymi Mojej Serowarni."
          />

          <div className="space-y-6 mt-6 mb-12 text-sm leading-relaxed">
            <Card>
              <CardHeader>
                <CardTitle>Czym jest serwer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>
                  Serwer MCP pod adresem <code className="font-mono">{ADRES_MCP}</code> udostępnia asystentom AI
                  (Claude, ChatGPT, Perplexity i innym) kalkulator pasz dla drobiu, przepisy na sery i bazę kultur
                  bakteryjnych z polskich sklepów. Prowadzi go serwis Moja Serowarnia (mojaserowarnia.pl).
                </p>
                <p>
                  Korzystanie jest bezpłatne i nie wymaga konta ani klucza. Wszystkie narzędzia tylko odczytują
                  dane: nic nie zapisują i niczego nie zmieniają po Twojej stronie ani u nas. Jak podłączyć serwer,
                  opisujemy na stronie <Link to="/asystenci-ai" className="underline">Asystenci AI</Link>.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dane i licencja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>
                  Dane z serwera są na licencji{" "}
                  <a href="https://creativecommons.org/licenses/by/4.0/deed.pl" className="underline" rel="noopener">
                    CC BY 4.0
                  </a>
                  . Możesz je cytować i wykorzystywać, także komercyjnie, pod warunkiem podania źródła z linkiem.
                  Serwer podaje gotowe źródło w każdej odpowiedzi (pola <code className="font-mono">zrodlo</code>{" "}
                  albo <code className="font-mono">cytuj_jako</code>).
                </p>
                <p>
                  Nazwy produktów i znaki towarowe należą do ich właścicieli. Pokazujemy je tylko po to, żeby dało
                  się znaleźć i porównać produkty.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Charakter danych</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Wyniki kalkulatora pasz to obliczenie na wzorcowych wartościach pokarmowych surowców, a nie
                    analiza Twojej partii paszy. Nie są poradą lekarza weterynarii.
                  </li>
                  <li>
                    Ceny kultur pochodzą ze stron sklepów z dnia podanego w odpowiedzi. Przed zakupem sprawdź
                    aktualną cenę i opis w sklepie.
                  </li>
                  <li>
                    Ten sam skład gatunkowy kultury nie oznacza tego samego produktu. Zamienniki traktuj jako
                    punkt wyjścia, nie gwarancję tego samego wyniku.
                  </li>
                  <li>
                    Odpowiedź asystenta AI układa model, a nie my. Za dobór dawek, surowców i parametrów produkcji
                    odpowiadasz sam, tak jak opisuje{" "}
                    <Link to="/nota-prawna" className="underline">nota prawna</Link>.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limity i zasady</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Do 30 zapytań na minutę z jednego adresu i do 600 na minutę łącznie. Po przekroczeniu serwer
                    odpowiada kodem 429 i nagłówkiem <code className="font-mono">Retry-After: 60</code>.
                  </li>
                  <li>
                    Nie wolno obchodzić limitów, przeciążać serwera ani podszywać się pod Moją Serowarnię.
                  </li>
                  <li>
                    Zautomatyzowane pobieranie całej bazy zamiast pytań asystenta uzgodnij z nami przez{" "}
                    <Link to="/kontakt" className="underline">kontakt</Link>.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dostępność i zmiany</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>
                  Serwer działa bez przerw planowanych, ale bez gwarancji ciągłej dostępności. To bezpłatna usługa
                  niewielkiego serwisu.
                </p>
                <p>
                  Nazwy narzędzi zachowujemy. Nowe narzędzia dochodzą bez usuwania starych. O usunięciu narzędzia
                  albo zmianie adresu uprzedzamy co najmniej 30 dni wcześniej na stronie{" "}
                  <Link to="/asystenci-ai" className="underline">Asystenci AI</Link>. Warunki możemy zmienić; datę
                  ostatniej zmiany podajemy na dole tej strony.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prywatność</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Serwer nie zapisuje treści pytań, adresu IP ani godziny zapytania. Liczy tylko sumy dzienne użycia
                  narzędzi. Szczegóły są w{" "}
                  <Link to="/nota-prawna#serwer-mcp" className="underline">nocie prawnej</Link>.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kontakt</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Pytania, błędy w danych i sprawy dotyczące serwera: <Link to="/kontakt" className="underline">formularz
                  kontaktowy</Link> albo <a href="mailto:admin@mojaserowarnia.pl" className="underline">admin@mojaserowarnia.pl</a>.
                </p>
              </CardContent>
            </Card>

            <Card lang="en">
              <CardHeader>
                <CardTitle>Summary in English</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>
                  The MCP server at <code className="font-mono">{ADRES_MCP}</code> is run by Moja Serowarnia
                  (mojaserowarnia.pl). It is free, read-only and needs no account or key. Data is licensed CC BY 4.0;
                  please cite the source with a link, as given in each response.
                </p>
                <p>
                  Feed results are calculations on reference values, not veterinary advice; culture prices are dated
                  snapshots. Limits: 30 requests per minute per IP and 600 per minute in total (HTTP 429 with
                  Retry-After: 60). Do not circumvent limits or overload the server. No uptime guarantee; tool
                  removals or address changes are announced at least 30 days in advance on /asystenci-ai.
                </p>
                <p>
                  Privacy: no request content, IP addresses or timestamps are stored, only daily usage counts (see
                  /nota-prawna#serwer-mcp). Contact: admin@mojaserowarnia.pl.
                </p>
              </CardContent>
            </Card>

            <p className="text-center text-muted-foreground">Obowiązuje od 23 października 2026.</p>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default WarunkiMcp;
