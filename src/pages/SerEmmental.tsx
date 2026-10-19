import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import SekcjaFAQ from "@/components/SekcjaFAQ";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";

/**
 * Strona O SERZE, osobna od przepisu /przepisy/emmental. Drugi ser w ukladzie
 * /sery/<nazwa> po camembercie.
 *
 * Skad: camembert (osobna strona od 15.09.2026) wszedl w Bingu na 3. miejsce
 * na "camembert", tuz za dwiema Wikipediami. Emmental i gruyere mialy w tym
 * samym czasie odpowiedzi o serze NA stronie przepisu i staly w Bingu na ~7.
 * W GSC (18.08-18.10.2026) zapytania o sama nazwe (emmentaler, emmental,
 * ementaler, ser ementaler) to ok. 1,3 tys. wyswietlen przy pozycji 9-13
 * i 3 kliknieciach, wszystkie na stronie przepisu.
 *
 * Lekcja z /chlorek-wapnia-do-mleka: dwie strony z odpowiedzia na to samo
 * pytanie i Google wybiera starsza. Dlatego pytania "co to za ser, ile kalorii,
 * czy ma laktoze" zostaly zdjete z przepisu, a przepis zostal przy "jak zrobic"
 * i "skad dziury".
 *
 * Tresc 1:1 z mirrorem public/sery/emmental.html, FAQ w faqPoradnikow
 * ("sery-emmental"). Fakty tylko ze zrodel wymienionych na dole strony.
 */

const ZRODLA = [
  {
    tekst: "Emmentaler Switzerland: portret organizacji i sera Emmentaler AOP (2023)",
    url: "https://www.emmentaler.ch/wp-content/uploads/2023/01/2301_Portrait_Emmentaler-Switzerland_D.pdf",
  },
  { tekst: "Emmentaler Switzerland: Emmentaler AOP dojrzewający w jaskini", url: "https://emmentaler.ch/en/product-range/emmentaler-aop-cave-aged" },
  { tekst: "MySwitzerland: Emmentaler AOP", url: "https://www.myswitzerland.com/en/experiences/food-wine/emmentaler-aop/" },
  { tekst: "Lebensmittel Praxis: Warenkunde Emmentaler", url: "https://lebensmittelpraxis.de/warenkunden/486-emmentaler.html?showall=1" },
  { tekst: "NHS: Foods to avoid in pregnancy", url: "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/" },
  { tekst: "USDA FoodData Central: Cheese, swiss (FDC 171251)", url: "https://fdc.nal.usda.gov/food-details/171251/nutrients" },
];

const SerEmmental = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Emmental (ementaler): co to za ser, jak jeść, czym zastąpić",
    description:
      "Czym jest emmental, skąd pochodzi, czym różni się Emmentaler AOP od zwykłego, jak go jeść i topić, czym go zastąpić, jak przechowywać i czy ma laktozę.",
    inLanguage: "pl",
    url: "https://mojaserowarnia.pl/sery/emmental",
    image: "https://mojaserowarnia.pl/og-image.jpg",
    datePublished: "2026-10-19",
    dateModified: "2026-10-19",
    publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
  };

  const seeAlsoLinks = [
    { title: "Przepis na emmental", href: "/przepisy/emmental", description: "Domowy emmental krok po kroku: kultury, dogrzewanie, ciepła piwnica." },
    { title: "Przepis na gruyère", href: "/przepisy/gruyere", description: "Drugi szwajcarski ser twardy i porównanie z emmentalem." },
    { title: "Camembert: co to za ser", href: "/sery/camembert", description: "Miękki ser z białą pleśnią: jak go jeść, piec i przechowywać." },
    { title: "Propionibacterium", href: "/kultury/propionibacterium", description: "Bakterie propionowe, które robią oczka: szczepy i sklepy." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Navigation />
      <PageBreadcrumbs items={[{ label: "Emmental" }]} />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Info}
              color="amber"
              title="Emmental (ementaler)"
              subtitle="Szwajcarski ser z dziurami. Co to za ser, skąd pochodzi, jak go jeść i topić, czym zastąpić i jak przechowywać."
            />

            <TLDRSection>
              <p>
                Emmental, emmentaler i ementaler to <strong>ten sam twardy ser</strong> z doliny Emme w Szwajcarii, z
                oczkami od wielkości wiśni do orzecha włoskiego. Jest łagodny i orzechowy, świetnie się topi (fondue,
                zapiekanki, tosty) i <strong>praktycznie nie ma laktozy</strong>. Oryginał to{" "}
                <strong>Emmentaler AOP</strong> z surowego mleka, dojrzewający co najmniej 4 miesiące.
              </p>
            </TLDRSection>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Co to za ser</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Emmental to twardy ser podpuszczkowy z mleka krowiego. Ma jasnożółty, elastyczny miąższ, łagodny,
                    lekko słodki smak z nutą orzecha laskowego i duże, okrągłe oczka. Należy do serów alpejskich, tak
                    jak gruyère.
                  </p>
                  <p>
                    Oczka robią bakterie propionowe. W ciepłej piwnicy zjadają kwas mlekowy i wydzielają dwutlenek
                    węgla, który nie może uciec z bochna i rozpycha miąższ od środka. Te same bakterie dają
                    słodko-orzechowy smak, więc emmental bez oczek smakowałby inaczej. Jak prowadzić ten etap w domu,
                    opisujemy w{" "}
                    <Link to="/przepisy/emmental" className="text-primary underline">
                      przepisie na emmental
                    </Link>
                    , a kulturę kupisz jako{" "}
                    <Link to="/kultury/propionibacterium" className="text-primary underline">
                      Propionibacterium w bazie kultur
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emmental, emmentaler, ementaler: jedna nazwa, kilka pisowni</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    To ten sam ser. „Emmentaler” to nazwa niemiecka i szwajcarska, „emmental” francuska, a „ementaler”
                    i „ser ementalski” to formy spolszczone. Wszystkie pochodzą od doliny Emme, po niemiecku Emmental,
                    w kantonie Berno.
                  </p>
                  <p>
                    W sklepie spotkasz każdą z tych nazw. Różnica między serami nie wynika z pisowni, tylko z tego, czy
                    to szwajcarski Emmentaler AOP, czy ser tego typu z innego kraju.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skąd pochodzi emmental</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Ser powstaje w dolinie rzeki Emme w kantonie Berno od XIII wieku. Dziś Emmentaler AOP robi ponad
                    100 wiejskich serowarni w Szwajcarii, a na skórce każdego bochna jest numer serowarni, po którym
                    można sprawdzić, skąd pochodzi dany kawałek.
                  </p>
                  <p>
                    To jeden z największych serów świata: bochen ma 80–100 cm średnicy i waży 75–100 kg, a na kilogram
                    sera idzie około 12 litrów mleka. Sama nazwa „emmental” nie jest chroniona, dlatego sery tego typu
                    robi się też we Francji, w Niemczech i w Polsce. Chroniona jest nazwa Emmentaler AOP.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emmentaler AOP a zwykły emmental</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Cecha</th>
                          <th className="text-left p-2 font-semibold">Emmentaler AOP</th>
                          <th className="text-left p-2 font-semibold">Inny emmental</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Mleko", "wyłącznie surowe", "może być pasteryzowane"],
                          ["Pasza krów", "trawa i siano, bez kiszonki", "bez wymogów"],
                          ["Dodatki", "zabronione", "bez wymogów"],
                          ["Dojrzewanie", "co najmniej 4 miesiące", "bez wymogów"],
                          ["Miejsce", "Szwajcaria", "dowolny kraj"],
                          ["Bochen", "80–100 cm średnicy, 75–100 kg", "dowolny, często bloki"],
                          ["Oznaczenie", "numer serowarni na skórce", "brak"],
                        ].map(([cecha, aop, inny]) => (
                          <tr key={cecha} className="border-b last:border-0">
                            <td className="p-2 font-medium">{cecha}</td>
                            <td className="p-2">{aop}</td>
                            <td className="p-2">{inny}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p>
                    Z jakiego mleka jest ser kupiony w sklepie, sprawdzisz na etykiecie. Emmentaler AOP jest z mleka
                    surowego, ale jako ser twardy jest uznawany za bezpieczny w ciąży, o czym niżej w pytaniach.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jak smakuje emmental w zależności od wieku</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    <strong>Co najmniej 4 miesiące</strong> (Emmentaler AOP Classic): łagodny, z nutą orzecha laskowego.
                  </p>
                  <p>
                    <strong>Co najmniej 8 miesięcy</strong> (Réserve): wyraźniejszy i bardziej pikantny.
                  </p>
                  <p>
                    <strong>Co najmniej 12 miesięcy</strong>, część w skalnej piwnicy (dojrzewający w jaskini): mocny,
                    pełny smak i ciemna skórka.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jak jeść emmental i z czym</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Na zimno: do kanapek i na deskę serów, z winogronami, jabłkiem i orzechami. Wyjmij go z lodówki
                    około <strong>30 minut przed podaniem</strong>, wtedy lepiej czuć smak.
                  </p>
                  <p>
                    Na ciepło emmental jest jednym z najlepszych serów do topienia: rozpływa się gładko i nie dominuje
                    innych składników. Pasuje do zapiekanek, tostów, pizzy, sosu serowego i francuskiej zupy cebulowej.
                    Klasyczne fondue z Neuchâtel robi się z gruyère'u i emmentalu po połowie.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Czym zastąpić emmental</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Zamiennik</th>
                          <th className="text-left p-2 font-semibold">Kiedy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Gruyère", "fondue i zapiekanki: też szwajcarski i świetnie się topi, ale ma wyraźniejszy smak i mało oczek"],
                          ["Jarlsberg, maasdam, leerdammer", "kanapki i tosty: sery z oczkami, łagodniejsze i bardziej miękkie"],
                          ["Polski ementaler", "każdy przepis: najłatwiej dostępny ser tego typu"],
                          ["Gouda", "zapiekanki, gdy nie ma nic innego: topi się dobrze, ale smak jest bardziej maślany"],
                        ].map(([ser, kiedy]) => (
                          <tr key={ser} className="border-b last:border-0">
                            <td className="p-2 font-medium">{ser}</td>
                            <td className="p-2">{kiedy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p>
                    Jak różnią się emmental i gruyère od strony produkcji, pokazuje tabela w{" "}
                    <Link to="/przepisy/gruyere" className="text-primary underline">
                      przepisie na gruyère
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jak przechowywać emmental</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Trzymaj emmental w lodówce, zawinięty w papier do sera albo papier woskowany, a potem luźno w
                    pojemniku. Kawałek w całości wysycha wolniej niż plastry, więc plastrów kupuj tyle, ile zjesz w kilka
                    dni.
                  </p>
                  <p>
                    Mrozić można, ale po rozmrożeniu ser się kruszy. Szczegóły są niżej w pytaniach.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wartości odżywcze emmentalu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">W 100 g</th>
                          <th className="text-left p-2 font-semibold">Ilość</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Energia", "392 kcal"],
                          ["Białko", "27 g"],
                          ["Tłuszcz", "31 g"],
                          ["w tym nasycone", "18,2 g"],
                          ["Węglowodany", "1,4 g"],
                          ["Laktoza", "0 g"],
                          ["Wapń", "890 mg"],
                          ["Sód", "187 mg (około 0,5 g soli)"],
                        ].map(([skladnik, ilosc]) => (
                          <tr key={skladnik} className="border-b last:border-0">
                            <td className="p-2 font-medium">{skladnik}</td>
                            <td className="p-2">{ilosc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p>
                    Dane USDA dla sera typu szwajcarskiego. Plaster o wadze 20 g ma około 80 kcal. Według tej samej
                    bazy emmental ma mniej sodu niż gouda czy cheddar i jest bardzo dobrym źródłem wapnia. Organizacja
                    producentów Emmentaler AOP podaje, że ser jest z natury bez laktozy. Wartości dla konkretnego sera
                    podaje etykieta.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
                <CardHeader>
                  <CardTitle>Jak zrobić emmental w domu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Domowy emmental to ser dla zaawansowanych: 40 litrów mleka, kultury termofilne i propionowe,
                    dogrzewanie ziarna do 52–55°C i trzy etapy dojrzewania, w tym kilka tygodni w 22°C, kiedy powstają
                    oczka.
                  </p>
                  <p className="flex flex-wrap gap-x-4 gap-y-1">
                    <Link to="/przepisy/emmental" className="font-semibold text-primary underline">
                      Przepis na emmental krok po kroku
                    </Link>
                    <Link to="/dojrzewalnia-z-lodowki" className="font-semibold text-primary underline">
                      Dojrzewalnia z lodówki
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10">
              <SekcjaFAQ slug="sery-emmental" />

              <SeeAlso links={seeAlsoLinks} />

              <section className="mt-8 text-sm text-muted-foreground" aria-label="Źródła">
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

export default SerEmmental;
