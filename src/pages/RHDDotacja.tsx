import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import SekcjaFAQ from "@/components/SekcjaFAQ";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Coins } from "lucide-react";

/**
 * Dotacja na RHD z ARiMR: interwencja I.10.6.1 "Rozwoj wspolpracy w ramach
 * lancucha wartosci (dotacja) - w gospodarstwie", nabor 1.10-2.11.2026.
 *
 * Skad: Marek zauwazyl, ze RHD zyskalo na popularnosci przed 1 pazdziernika
 * wlasnie przez te dotacje. W GSC (20.07-19.10.2026) serwis nie mial ani jednego
 * wyswietlenia na zapytania z "dotac", a /prawo/rhd zbiera ogolne pytania o RHD.
 *
 * Fakty WYLACZNIE z dwoch dokumentow wymienionych na dole strony: regulaminu
 * naboru (zarzadzenie Prezesa ARiMR nr 85/2026) i wytycznych MRiRW (kryteria
 * punktowe). Minimalne koszty w tabeli to wynik limitu 65%, nie osobny warunek.
 *
 * Tresc 1:1 z mirrorem public/prawo/rhd/dotacja.html, FAQ w faqPoradnikow
 * ("prawo-rhd-dotacja"). PO 2.11.2026 strona wymaga aktualizacji: nabor sie
 * konczy, tytul i ramka z terminem musza to powiedziec.
 */

const ZRODLA = [
  {
    tekst: "ARiMR: Regulamin naboru wniosków o przyznanie pomocy dla interwencji I.10.6.1 (załącznik do zarządzenia Prezesa ARiMR nr 85/2026)",
    url: "https://www.gov.pl/attachment/2676b5a5-19be-422f-adba-2d78b2ee19f1",
  },
  {
    tekst: "Minister Rolnictwa i Rozwoju Wsi: Wytyczne szczegółowe dla interwencji I.10.6.1 (wersja z 5 grudnia 2024 r., kryteria wyboru operacji)",
    url: "https://www.gov.pl/attachment/5d8791c0-cbef-4b9c-b39d-08d60d1b8903",
  },
];

const KWOTY = [
  ["30 000 zł", "24 000 zł", "6 000 zł", "ok. 46 154 zł"],
  ["60 000 zł", "48 000 zł", "12 000 zł", "ok. 92 308 zł"],
  ["120 000 zł", "96 000 zł", "24 000 zł", "ok. 184 616 zł"],
];

const PUNKTY = [
  ["Inwestycja służy celom strategii „Od pola do stołu” (wykaz w załączniku do regulaminu)", "5"],
  ["Co najmniej 20% kosztów to inwestycje w ochronę środowiska", "4"],
  ["Co najmniej 50% kosztów to inwestycje innowacyjne (nowy produkt lub proces w skali gospodarstwa)", "3"],
  ["Gmina w powiecie o wysokim bezrobociu (najwyższe w kraju: 3 pkt, niższe: proporcjonalnie mniej)", "do 3"],
  ["Dodatkowo dla rolnika zaczynającego przetwórstwo: ubezpieczenie w KRUS w pełnym zakresie", "2"],
  ["Dodatkowo: wiek do 40 lat w dniu złożenia wniosku", "1"],
  ["Dodatkowo: kobieta", "1"],
  ["Dodatkowo: co najmniej 50% gruntów na obszarze ONW typu górskiego lub specyficznego strefy II", "1"],
];

const RHDDotacja = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Dotacja na RHD 2026: 30, 60 lub 120 tys. zł z ARiMR",
    description:
      "Kto może dostać dotację ARiMR na przetwórstwo w rolniczym handlu detalicznym, ile wynosi, na co można ją wydać, za co są punkty i jak złożyć wniosek w naborze 1 października – 2 listopada 2026.",
    inLanguage: "pl",
    url: "https://mojaserowarnia.pl/prawo/rhd/dotacja",
    image: "https://mojaserowarnia.pl/og-image.jpg",
    datePublished: "2026-10-20",
    dateModified: "2026-10-20",
    publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
  };

  const seeAlsoLinks = [
    { title: "RHD: limity, rejestracja i podatki", href: "/prawo/rhd", description: "Jak zarejestrować RHD, limit 100 000 zł, ewidencja i kasa." },
    { title: "Dokumenty RHD", href: "/prawo/rhd/dokumenty", description: "Ewidencja sprzedaży, rejestry i procedury na kontrolę." },
    { title: "Działalność MOL", href: "/prawo/mol", description: "Druga ścieżka w tym samym naborze: działalność gospodarcza lub MOL." },
    { title: "Etykieta do sprzedaży w RHD", href: "/etykieta-rhd", description: "Generator etykiety z polami obowiązkowymi." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Navigation />
      <PageBreadcrumbs items={[{ label: "Prawo", href: "/prawo" }, { label: "RHD", href: "/prawo/rhd" }, { label: "Dotacja" }]} />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Coins}
              color="amber"
              title="Dotacja na RHD: 30, 60 lub 120 tys. zł"
              subtitle="Pomoc z ARiMR (interwencja I.10.6.1) na przetwórstwo w gospodarstwie w ramach rolniczego handlu detalicznego. Kto może dostać, na co, za co są punkty i jak złożyć wniosek."
            />

            <div className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-foreground">
              <strong>Nabór trwa od 1 października do 2 listopada 2026 r.</strong> Wniosek składa się wyłącznie przez
              Platformę Usług Elektronicznych ARiMR (PUE). Po 2 listopada system nie przyjmie wniosku. Stan na
              20 października 2026 r.
            </div>

            <TLDRSection>
              <p>
                Rolnik prowadzący albo zakładający RHD może dostać z ARiMR <strong>ryczałt 30 000, 60 000 albo
                120 000 zł</strong>, ale nie więcej niż <strong>65% kosztów</strong> inwestycji w przetwarzanie i
                sprzedaż swoich produktów. Pieniądze przychodzą w dwóch ratach (80% i 20%), a kupować wolno dopiero{" "}
                <strong>po złożeniu wniosku</strong>. Trzeba zebrać co najmniej 2 punkty, a działalność prowadzić jeszcze
                5 lat po ostatniej wypłacie.
              </p>
            </TLDRSection>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kto może dostać dotację na RHD</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>Rolnik albo małżonek rolnika, który:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      jest ubezpieczony w KRUS w pełnym zakresie jako rolnik albo dostał płatności bezpośrednie co
                      najmniej w roku poprzedzającym złożenie wniosku,
                    </li>
                    <li>ma numer identyfikacyjny w ewidencji producentów ARiMR (numer EP),</li>
                    <li>ma ukończone 18 lat,</li>
                    <li>zobowiązuje się przetwarzać produkty rolne i zbywać przetworzone produkty w ramach RHD,</li>
                    <li>nie prowadzi działalności gospodarczej w zakresie, którego dotyczy inwestycja.</li>
                  </ul>
                  <p>
                    Kto <strong>dopiero zakłada RHD</strong>, musi mieć gospodarstwo o wielkości ekonomicznej co najmniej{" "}
                    <strong>25 tys. euro</strong> w roku składania wniosku (liczy się ją w biznesplanie), chyba że
                    inwestycja jest w gospodarstwie, które dostało premię dla młodych rolników (interwencja I.11). Kto{" "}
                    <strong>już prowadzi RHD</strong>, tego progu nie musi spełniać.
                  </p>
                  <p>Pomoc można dostać tylko raz na jedno gospodarstwo w całym okresie PS WPR, także przy współwłasności.</p>
                  <p className="text-muted-foreground">
                    W tym samym naborze są jeszcze dwie ścieżki: rolnik, małżonek lub domownik zakładający działalność
                    gospodarczą albo <Link to="/prawo/mol" className="text-primary underline">MOL</Link> (ten sam ryczałt
                    30, 60 lub 120 tys. zł) oraz mikroprzedsiębiorca, który przetwarza co najmniej w połowie produkty z
                    własnego gospodarstwa (refundacja 50% kosztów, od 10 tys. do 500 tys. zł). Ta strona opisuje ścieżkę
                    RHD.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ile pieniędzy i jak są wypłacane</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Ryczałt</th>
                          <th className="text-left p-2 font-semibold">I rata (80%)</th>
                          <th className="text-left p-2 font-semibold">II rata (20%)</th>
                          <th className="text-left p-2 font-semibold">Koszty netto potrzebne do pełnej kwoty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {KWOTY.map(([ryczalt, r1, r2, koszty]) => (
                          <tr key={ryczalt} className="border-b last:border-0">
                            <td className="p-2 font-medium">{ryczalt}</td>
                            <td className="p-2">{r1}</td>
                            <td className="p-2">{r2}</td>
                            <td className="p-2">{koszty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="leading-relaxed">
                    Ryczałt nie może przekroczyć 65% kosztów kwalifikowalnych, czyli kosztów netto, bez VAT. Ostatnia
                    kolumna to wynik tego limitu, a nie osobny warunek z regulaminu. Wysokość ryczałtu wybiera się według
                    wielkości inwestycji opisanej w zestawieniu rzeczowo-finansowym wniosku.
                  </p>
                  <p className="leading-relaxed">
                    Za wydatki trzeba płacić przelewem albo kartą: regulamin uznaje tylko koszty rozliczone
                    bezgotówkowo. Cały nabór ma budżet 86,156 mln zł na kraj, czyli przy najwyższym ryczałcie około
                    700 dotacji.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Na co można wydać dotację</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>Na inwestycje w przetwarzanie i sprzedaż produktów rolnych z gospodarstwa. Regulamin wymienia:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      nowe maszyny, urządzenia i wyposażenie do przygotowania produktów do przetwarzania, przetwarzania,
                      magazynowania i przygotowania do sprzedaży,
                    </li>
                    <li>
                      budowę, rozbudowę, przebudowę albo remont połączony z modernizacją budynków do przetwarzania,
                      magazynowania i sprzedaży, pomieszczeń higieniczno-sanitarnych i infrastruktury technicznej, jeśli
                      są potrzebne do wdrożenia kupowanych maszyn i urządzeń,
                    </li>
                    <li>nową aparaturę pomiarową i kontrolną oraz sprzęt do sterowania produkcją i magazynowaniem,</li>
                    <li>
                      oprogramowanie do zarządzania działalnością, terminale płatnicze oraz sprzęt i oprogramowanie do
                      sprzedaży na odległość,
                    </li>
                    <li>
                      fotowoltaikę, pompy ciepła, magazyny energii, odzysk ciepła i oczyszczalnie ścieków, jeśli służą
                      przetwarzaniu, magazynowaniu lub sprzedaży,
                    </li>
                    <li>systemy zarządzania jakością, patenty, licencje i znaki towarowe,</li>
                    <li>transport i montaż maszyn oraz materiałów,</li>
                    <li>
                      koszty ogólne (projekty, kosztorysy, nadzór, biznesplan) do 10% pozostałych kosztów, w tym biznesplan
                      do 5 000 zł netto.
                    </li>
                  </ul>
                  <p>
                    W serowarni to na przykład kocioł serowarski, prasa, chłodnia albo komora dojrzewalnicza, pasteryzator,
                    wyposażenie przetwórni i pomieszczenia socjalnego, pH-metr i rejestratory temperatury, a do sprzedaży
                    terminal płatniczy i sklep internetowy. O tym, czy konkretny wydatek przejdzie, decyduje ARiMR przy
                    ocenie racjonalności kosztów.
                  </p>
                  <p>
                    Do każdego wydatku powyżej 20 000 zł netto, poza robotami budowlanymi, trzeba dołączyć co najmniej{" "}
                    <strong>2 oferty</strong> od różnych dostawców.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Czego dotacja nie pokryje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>kosztów poniesionych przed złożeniem wniosku (poza kosztami ogólnymi od 1 stycznia 2023 r.),</li>
                    <li>VAT, leasingu i ubezpieczeń,</li>
                    <li>używanych maszyn i urządzeń,</li>
                    <li>samochodów i innych środków transportu,</li>
                    <li>gruntów, nieruchomości i budynków mieszkalnych,</li>
                    <li>wynagrodzeń pracowników,</li>
                    <li>remontu bez modernizacji,</li>
                    <li>bieżących kosztów: mediów, najmu, księgowości, doradztwa prawnego, opłat,</li>
                    <li>inwestycji w samą produkcję rolną, na przykład chów zwierząt czy uprawy, i w sprzedaż nieprzetworzonych produktów,</li>
                    <li>kotłów na słomę.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Punkty: ile trzeba i za co</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="leading-relaxed">
                    Wniosek musi zdobyć <strong>co najmniej 2 punkty</strong>. Jeśli pieniędzy nie wystarczy dla
                    wszystkich, decyduje kolejność od największej liczby punktów, a przy remisie pierwszeństwo ma osoba
                    młodsza.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Kryterium</th>
                          <th className="text-left p-2 font-semibold">Punkty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PUNKTY.map(([kryterium, pkt]) => (
                          <tr key={kryterium} className="border-b last:border-0">
                            <td className="p-2">{kryterium}</td>
                            <td className="p-2 font-medium">{pkt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="leading-relaxed">
                    Rolnik zaczynający przetwórstwo, ubezpieczony w KRUS w pełnym zakresie, ma więc 2 punkty z samego
                    ubezpieczenia. Kryteria pochodzą z wytycznych Ministra Rolnictwa dla interwencji I.10.6.1. Wiążący
                    jest załącznik nr 2 do regulaminu naboru, sprawdź go przed złożeniem wniosku.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jak złożyć wniosek krok po kroku</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      Sprawdź, czy masz numer w ewidencji producentów (numer EP). Bez niego wniosku nie złożysz, a
                      nadanie numeru w ARiMR wymaga czasu.
                    </li>
                    <li>
                      Załóż konto w PUE ARiMR: logowanie przez węzeł krajowy, np. profil zaufany, albo loginem i kodem
                      dostępu z ARiMR. Podpis elektroniczny nie jest potrzebny.
                    </li>
                    <li>Zaplanuj inwestycję i zbierz oferty: po 2 od różnych dostawców dla każdego wydatku powyżej 20 000 zł netto.</li>
                    <li>Wypełnij w PUE wniosek i biznesplan (biznesplan to zakładka w formularzu) i wybierz kwotę ryczałtu.</li>
                    <li>
                      Wyślij do 2 listopada 2026 r. W jednym naborze można złożyć jeden wniosek. Żeby coś zmienić,
                      wycofujesz go i składasz ponownie, dopóki trwa nabór.
                    </li>
                    <li>ARiMR ocenia wnioski do 3 miesięcy po zakończeniu naboru. Na wezwanie do poprawek masz 14 dni.</li>
                    <li>Umowę zawierasz w PUE w ciągu 14 dni od odczytania pisma z ARiMR.</li>
                  </ol>
                  <p className="text-muted-foreground">
                    Z biznesplanem pomagają doradcy ośrodka doradztwa rolniczego w Twoim województwie.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Po przyznaniu: raty, terminy, obowiązki</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>Pierwsza rata (80%):</strong> wniosek o płatność w ciągu 6 miesięcy od zawarcia umowy.
                      Wcześniej trzeba zacząć realizację biznesplanu, np. kupić maszynę albo zacząć budowę, albo podjąć
                      RHD i mieć zaświadczenie o wpisie do rejestru zakładów u powiatowego lekarza weterynarii (produkty
                      zwierzęce, np. sery) lub w Sanepidzie.
                    </li>
                    <li>
                      <strong>Druga rata (20%):</strong> po zrealizowaniu wszystkich inwestycji z biznesplanu, nie później
                      niż 24 miesiące od zawarcia umowy i nie później niż 30 czerwca 2029 r. ARiMR sprawdza, czy inwestycje
                      zostały zrobione, a nie rozliczenie co do złotówki.
                    </li>
                    <li>Wypłacona kwota nie może przekroczyć kosztów kwalifikowalnych rzeczywiście poniesionych.</li>
                    <li>
                      Przez <strong>5 lat od ostatniej wypłaty</strong> trzeba prowadzić działalność objętą dotacją. ARiMR
                      może w tym czasie przyjechać na kontrolę.
                    </li>
                    <li>Tych samych kosztów nie wolno finansować z innych pieniędzy publicznych.</li>
                  </ul>
                  <p>
                    Jak zarejestrować RHD, jaki jest limit przychodu i jakie dokumenty prowadzić, opisujemy w przewodniku{" "}
                    <Link to="/prawo/rhd" className="text-primary underline">
                      RHD: limity, rejestracja i podatki
                    </Link>{" "}
                    i na stronie{" "}
                    <Link to="/prawo/rhd/dokumenty" className="text-primary underline">
                      dokumenty RHD
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10">
              <SekcjaFAQ slug="prawo-rhd-dotacja" />

              <SeeAlso links={seeAlsoLinks} />

              <p className="mt-8 text-sm text-muted-foreground">
                Strona ma charakter informacyjny i nie jest poradą. Przed złożeniem wniosku przeczytaj regulamin naboru;
                w razie wątpliwości zapytaj w biurze powiatowym ARiMR albo w ośrodku doradztwa rolniczego.
              </p>

              <section className="mt-6 text-sm text-muted-foreground" aria-label="Źródła">
                <h2 className="mb-2 font-semibold text-foreground">Źródła</h2>
                <ul className="list-disc space-y-1 pl-5">
                  {ZRODLA.map((z) => (
                    <li key={z.url}>
                      <a href={z.url} target="_blank" rel="noopener noreferrer" className="underline">
                        {z.tekst}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RHDDotacja;
