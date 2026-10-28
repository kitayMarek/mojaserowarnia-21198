import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
 * 25.10.2026: zasady i instrukcja dla twórców własnych aplikacji (#aplikacje,
 * #dla-tworcow); znacznik ?z=app-… trafia do magazyn_wywolania.zrodlo.
 *
 * Liczby (limity) i opis pomiaru muszą się zgadzać z worker-magazyn/src/index.js
 * i worker-magazyn/src/pomiar.js. Prywatność: sekcja #serwer-mcp na /nota-prawna.
 *
 * 28.10.2026: bez narzędzi paszowych (przeniesione na mojapasza.com/mcp) i licencja w dwóch
 * rodzajach: baza kultur i przepisy na CC BY, ceny i oferty sklepów poza CC BY (#licencja).
 *
 * Treść 1:1 z mirrorem public/warunki-mcp.html, tytuł i opis w metaStron.ts.
 */

// Sprawdzone na żywo 25.10.2026: tools/call działa bez wcześniejszego initialize.
const PRZYKLAD_CURL = `curl -s "${ADRES_MCP}?z=app-twoja-nazwa" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"szukaj_kultur","arguments":{"zapytanie":"camembert"}}}'`;

const WarunkiMcp = () => {
  // Linki do #aplikacje i #dla-tworcow (z /asystenci-ai): router sam nie przewija
  // do kotwicy, drugi skok po chwili, bo treść jeszcze się układa (jak w NotaPrawna).
  const location = useLocation();
  useEffect(() => {
    const cel = location.hash.slice(1);
    if (!cel) return;
    const skocz = () => document.getElementById(cel)?.scrollIntoView({ block: "start" });
    const t1 = setTimeout(skocz, 50);
    const t2 = setTimeout(skocz, 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [location.hash]);

  return (
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
                    (Claude, ChatGPT, Perplexity i innym) przepisy na sery i bazę kultur bakteryjnych z polskich
                    sklepów. Prowadzi go serwis Moja Serowarnia (mojaserowarnia.pl). Kalkulator paszy dla drobiu
                    i baza dodatków paszowych mają od 28 października 2026 własny serwer:{" "}
                    <a href="https://mojapasza.com/asystenci-ai" className="underline">mojapasza.com/mcp</a>.
                  </p>
                  <p>
                    Korzystanie jest bezpłatne i nie wymaga konta ani klucza. Wszystkie narzędzia tylko odczytują
                    dane: nic nie zapisują i niczego nie zmieniają po Twojej stronie ani u nas. Jak podłączyć serwer,
                    opisujemy na stronie <Link to="/asystenci-ai" className="underline">Asystenci AI</Link>.
                  </p>
                </CardContent>
              </Card>

              <Card id="licencja" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle>Dane i licencja</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p>
                    Baza kultur (skład, zastosowanie, temperatura pracy) i przepisy na sery są na licencji{" "}
                    <a href="https://creativecommons.org/licenses/by/4.0/deed.pl" className="underline" rel="noopener">
                      CC BY 4.0
                    </a>
                    . Możesz je cytować i wykorzystywać, także komercyjnie, pod warunkiem podania źródła z linkiem.
                    Serwer podaje gotowe źródło w każdej odpowiedzi (pole <code className="font-mono">cytuj_jako</code>).
                  </p>
                  <p>
                    Ceny i oferty sklepów są poza licencją CC BY. Możesz z nich korzystać na warunkach łącznika:
                    przechowuj je najwyżej 24 godziny i pokazuj zawsze z datą ceny (pole{" "}
                    <code className="font-mono">cena_z_dnia</code>) i linkiem do oferty. Ceny opublikowane przed 28
                    października 2026 na licencji CC BY wolno dalej używać na tej licencji.
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
                      Do 30 zapytań na minutę z jednego adresu, aplikacja z kluczem do 300, a wszyscy razem do 600 na
                      minutę. Po przekroczeniu serwer odpowiada kodem 429 i nagłówkiem{" "}
                      <code className="font-mono">Retry-After: 60</code>.
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

              <Card id="aplikacje" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle>Własne aplikacje na naszym serwerze</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p>
                    Możesz zbudować na serwerze własną aplikację, stronę albo asystenta, na przykład doradcę
                    serowara, wyszukiwarkę kultur na stronie sklepu albo listę zakupów. Nie potrzebujesz naszej zgody, także przy
                    użyciu komercyjnym. Wystarczy, że przestrzegasz tych zasad:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Przy wyniku pokaż źródło z linkiem, tak jak podaje je serwer (pole{" "}
                      <code className="font-mono">cytuj_jako</code>).
                    </li>
                    <li>
                      Nie usuwaj zastrzeżeń z odpowiedzi (pole <code className="font-mono">zastrzezenie</code>): zamiennik
                      kultury to nie ten sam produkt.
                    </li>
                    <li>
                      Przy cenie pokaż sklep i datę ceny (<code className="font-mono">cena_z_dnia</code>) i nie nazywaj jej
                      aktualną. Linki do sklepów zostaw takie, jakie przychodzą. Cen nie przechowuj dłużej niż 24
                      godziny (<a href="#licencja" className="underline">licencja</a>).
                    </li>
                    <li>
                      Jeśli pokazujesz produkty, nie ukrywaj oznaczenia <code className="font-mono">partner_serwisu</code>.
                      Kolejność ofert u nas zależy tylko od składu i ceny.
                    </li>
                    <li>
                      Dopisz do adresu serwera znacznik aplikacji, np. <code className="font-mono">?z=app-twoja-nazwa</code>{" "}
                      (małe litery, cyfry i myślnik). Dzięki niemu wiemy, kto korzysta z serwera, i możemy uprzedzić o
                      zmianach, jeśli zostawisz nam kontakt.
                    </li>
                    <li>
                      Nie przedstawiaj aplikacji jako produktu Mojej Serowarni. Możesz napisać, że korzysta z naszych
                      danych i obliczeń.
                    </li>
                    <li>
                      Aplikacja pyta ze swojego serwera, czyli z jednego adresu dla wszystkich użytkowników, więc 30
                      zapytań na minutę szybko się kończy. Dlatego dajemy za darmo klucz aplikacji z limitem 300 zapytań na
                      minutę: <Link to="/kontakt" className="underline">napisz do nas</Link> i podaj nazwę aplikacji.
                      Przy jeszcze większym ruchu ustalimy warunki indywidualnie.
                    </li>
                  </ul>
                  <p>
                    Bazę kultur i przepisy możesz też skopiować, bo są na licencji CC BY 4.0. Ceny i oferty sklepów
                    są poza nią: korzystasz z nich na zasadach z tej strony.
                  </p>
                </CardContent>
              </Card>

              <Card id="dla-tworcow" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle>Instrukcja dla twórców aplikacji</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p>
                    Serwer mówi protokołem MCP (Streamable HTTP, JSON-RPC 2.0), bez logowania i bez sesji. Możesz użyć
                    oficjalnego SDK MCP (np. TypeScript albo Python) albo zwykłych zapytań HTTP:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      zapytania <code className="font-mono">POST</code> na <code className="font-mono">{ADRES_MCP}?z=app-twoja-nazwa</code>;
                    </li>
                    <li>
                      nagłówki <code className="font-mono">Content-Type: application/json</code> oraz{" "}
                      <code className="font-mono">Accept: application/json, text/event-stream</code> (bez obu typów serwer
                      odpowie błędem 406);
                    </li>
                    <li>
                      <code className="font-mono">tools/list</code> zwraca narzędzia z opisami i schematami parametrów,{" "}
                      <code className="font-mono">tools/call</code> z polami <code className="font-mono">name</code> i{" "}
                      <code className="font-mono">arguments</code> wywołuje narzędzie;
                    </li>
                    <li>
                      z kluczem aplikacji: nagłówek <code className="font-mono">Authorization: Bearer &lt;klucz&gt;</code>{" "}
                      albo parametr <code className="font-mono">?klucz=</code> w adresie, gdy program nie pozwala dopisać
                      nagłówka; bieżący limit podaje nagłówek odpowiedzi <code className="font-mono">x-limit-na-minute</code>;
                    </li>
                    <li>
                      odpowiedź przychodzi jako wiersz <code className="font-mono">data: {"{...}"}</code>; wynik narzędzia jest
                      w <code className="font-mono">result.content[0].text</code> (JSON) i w{" "}
                      <code className="font-mono">result.structuredContent</code>.
                    </li>
                  </ul>
                  <p>Przykład: kultury do camemberta.</p>
                  <pre className="whitespace-pre-wrap break-all rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs">
                    <code>{PRZYKLAD_CURL}</code>
                  </pre>
                  <p>Narzędzia:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      sery: <code className="font-mono">szukaj_przepisow</code>, <code className="font-mono">przepis</code>;
                    </li>
                    <li>
                      kultury bakteryjne: <code className="font-mono">szukaj_kultur</code>, <code className="font-mono">kultura</code>,{" "}
                      <code className="font-mono">zamienniki</code>, <code className="font-mono">o_bazie</code>.
                    </li>
                  </ul>
                  <p>
                    Opis serwera dla programów: <code className="font-mono">{ADRES_MCP}/server-card</code>. Pytania techniczne:{" "}
                    <Link to="/kontakt" className="underline">kontakt</Link>.
                  </p>
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
                    <Link to="/asystenci-ai" className="underline">Asystenci AI</Link>. Wyjątek: 28 października 2026
                    narzędzia paszowe przeszły od razu na osobny serwer mojapasza.com/mcp, razem z całym działem
                    pasz. Warunki możemy zmienić; datę ostatniej zmiany podajemy na dole tej strony.
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
                    (mojaserowarnia.pl). It is free, read-only and needs no account or key. The culture database and
                    recipes are licensed CC BY 4.0; please cite the source with a link, as given in each response.
                    Shop prices and offers are not under CC BY: keep them for at most 24 hours and always show the
                    price date and the offer link. The poultry feed tools moved to mojapasza.com/mcp on 28 October 2026.
                  </p>
                  <p>
                    Culture prices are dated snapshots. Limits: 30 requests per minute per IP and 600 per minute in total (HTTP 429 with
                    Retry-After: 60). Do not circumvent limits or overload the server. No uptime guarantee; tool
                    removals or address changes are announced at least 30 days in advance on /asystenci-ai.
                  </p>
                  <p>
                    Building your own app on the server is allowed, also commercially: show the source link and the
                    disclaimers from each response, keep price dates and the partner label, add{" "}
                    <code className="font-mono">?z=app-your-name</code> to the server URL; apps get a free key with 300 requests per minute on request (send it as{" "}
                  <code className="font-mono">Authorization: Bearer</code>). Contact us if you need more
                    than 30 requests per minute. Technical notes are in the section “Instrukcja dla twórców aplikacji”
                    above.
                  </p>
                  <p>
                    Privacy: no request content, IP addresses or timestamps are stored, only daily usage counts (see
                    /nota-prawna#serwer-mcp). Contact: admin@mojaserowarnia.pl.
                  </p>
                </CardContent>
              </Card>

              <p className="text-center text-muted-foreground">
                Obowiązuje od 23 października 2026. Ostatnia zmiana: 28 października 2026 (narzędzia paszowe na mojapasza.com, licencja cen sklepów).
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WarunkiMcp;
