import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recycle, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ReactionButton from "@/components/ReactionButton";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import OstrzezenieSol from "@/components/OstrzezenieSol";
import { Link } from "react-router-dom";

const SerwatkaDlaZwierzat = () => {
  const faqData = [
    {
      question: "Czy można podawać serwatkę kurom?",
      answer:
        "Tak, ale ostrożnie i najlepiej w postaci ukwaszonej. Drób ma znikomą aktywność laktazy, więc laktoza ze świeżej serwatki fermentuje w jelicie i powoduje wodniste odchody oraz mokrą ściółkę. Bezpieczna praktyka: serwatka ukwaszona (2–3 dni w cieple), podawana jako część pojenia — orientacyjnie do 10–20% dziennego spożycia wody, wprowadzana stopniowo przez 5–7 dni. Zawsze musi być dostępna także czysta woda. Serwatki solonej nie podawaj drobiowi w ogóle.",
    },
    {
      question: "Ile serwatki może zjeść świnia?",
      answer:
        "Świnie są najlepszym odbiorcą serwatki — mają zachowaną aktywność laktazy i tradycyjnie żywi się je serwatką od stuleci. Orientacyjnie: warchlaki 3–5 L dziennie, tuczniki 10–20 L dziennie, zastępując część wody do picia. Serwatka ma tylko około 6–7% suchej masy, więc jest to głównie płyn z laktozą — nie zastąpi paszy białkowej. Przy nadmiernym poleganiu na serwatce pojawia się niedobór białka i aminokwasów, a tucznik rośnie wolniej.",
    },
    {
      question: "Czy serwatka po soleniu sera nadaje się dla zwierząt?",
      answer:
        "Nie, i jest to najgroźniejszy błąd, jaki może popełnić serowar z kurnikiem. Solanka serowarska o stężeniu 20% zawiera 200 g soli w litrze, podczas gdy prawidłowo zbilansowana pasza ma 3 g soli na kilogram — jeden litr solanki niesie więc tyle soli, co około 66 kg paszy. Drób należy do najwrażliwszych na sól zwierząt gospodarskich: orientacyjnie 3–4 g NaCl na kilogram masy ciała może być dawką śmiertelną, czyli dla kury o masie 2 kg wystarczy około 30–40 ml solanki. Solankę i serwatkę z serów solonych w masie utylizuj osobno — nie mieszaj ich z serwatką paszową.",
    },
    {
      question: "Ile soli potrzebuje drób i od jakiej dawki sól jest groźna?",
      answer:
        "Sód jest niezbędny — odpowiada za przewodnictwo nerwowe, gospodarkę wodną i apetyt, a jego niedobór powoduje gorsze przyrosty, spadek nieśności oraz kanibalizm i wydziobywanie piór. Prawidłowy poziom to około 0,3% NaCl w mieszance, czyli 3 g na kilogram paszy. Jednocześnie drób jest wyjątkowo wrażliwy na przesolenie: orientacyjnie 3–4 g NaCl na kilogram masy ciała bywa dawką śmiertelną, a pisklęta są wielokrotnie wrażliwsze od ptaków dorosłych. Objawy narastają w kolejności: wzmożone pragnienie, wodniste odchody i mokra ściółka, niezborność ruchów, drgawki, śmierć. Stały dostęp do czystej wody drastycznie zmniejsza ryzyko — zatrucie solą jest najgroźniejsze przy ograniczonym pojeniu.",
    },
    {
      question: "Czym różni się serwatka słodka od kwasowej?",
      answer:
        "Serwatka słodka (podpuszczkowa) powstaje przy serach podpuszczkowych — gouda, cheddar, ementaler — i ma pH około 6,0–6,6. Serwatka kwasowa pochodzi z twarogu, ricotty i serów kwasowych, ma pH około 4,3–4,6 i więcej wapnia oraz kwasu mlekowego. Do skarmiania lepsza jest słodka, bo kwasowa mocniej obciąża gospodarkę kwasowo-zasadową. Kwasową warto wcześniej rozcieńczyć lub wykorzystać jako nawóz.",
    },
    {
      question: "Co zrobić z serwatką przed skarmieniem — ricotta czy od razu paszę?",
      answer:
        "Najpierw ricotta, potem pasza. W serwatce zostaje jeszcze około 0,6–0,9% białek serwatkowych (albuminy i globuliny), których nie wychwyciła podpuszczka. Podgrzanie serwatki do 85–92°C z dodatkiem kwasu wytrąca je jako ricottę — z 10 litrów serwatki uzyskasz orientacyjnie 200–400 g. Dopiero serwatka po ricotcie, uboższa w białko, idzie do zwierząt. Taka kolejność daje najwięcej wartości z tego samego surowca.",
    },
    {
      question: "Jak długo można przechowywać serwatkę?",
      answer:
        "Świeża serwatka psuje się bardzo szybko. Latem w temperaturze pokojowej nadaje się do skarmienia przez około 24 godziny, w lodówce 3–5 dni. Alternatywa to celowe ukwaszenie: zostaw ją w cieple na 2–3 dni, aż wyraźnie skwaśnieje — bakterie mlekowe rozłożą część laktozy, co poprawia tolerancję u drobiu i zabezpiecza przed gniciem. Serwatki zepsutej, o zgniłym lub siarkowym zapachu, nie podawaj — to już nie jest ukwaszenie, tylko rozkład.",
    },
    {
      question: "Czy serwatka nadaje się na nawóz?",
      answer:
        "Tak, ale rozcieńczona i z umiarem. Rozcieńczenie 1:5 do 1:10 z wodą, podlewanie pod korzeń. Serwatka zakwasza glebę, więc sprawdza się przy roślinach lubiących niższe pH (borówka, różaneczniki), a szkodzi tam, gdzie potrzebny jest odczyn zasadowy. Nie wylewaj nierozcieńczonej serwatki w jedno miejsce ani do rowów i zbiorników — ma bardzo wysokie BZT i powoduje zanik tlenu w wodzie oraz śnięcie ryb.",
    },
    {
      question: "Czy wolno oddać serwatkę sąsiadowi na paszę?",
      answer:
        "Skarmianie własnej serwatki własnymi zwierzętami w gospodarstwie nie budzi wątpliwości. Przekazywanie jej poza gospodarstwo to inna sytuacja: serwatka jest ubocznym produktem pochodzenia zwierzęcego kategorii 3, a obrót takim materiałem i jego wykorzystanie w paszach podlega nadzorowi Inspekcji Weterynaryjnej. Zanim zaczniesz regularnie przekazywać serwatkę innemu gospodarstwu, potwierdź zasady u powiatowego lekarza weterynarii — zakres obowiązków zależy od skali i przeznaczenia.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Serwatka w żywieniu zwierząt — dawki dla świń, drobiu i cieląt",
        description:
          "Co zrobić z serwatką po produkcji sera: skład, serwatka słodka vs kwasowa, dawki dla świń (10–20 L), drobiu (ukwaszona, 10–20% pojenia) i cieląt, ostrzeżenie o serwatce solonej, przechowywanie i wykorzystanie jako nawóz.",
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/serwatka-dla-zwierzat",
        image: "https://mojaserowarnia.pl/og-image.png",
        publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqData.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  const seeAlsoLinks = [
    { title: "Kalkulator pasz dla drobiu", href: "/kalkulator-pasz", description: "Zbilansuj mieszankę — serwatka to dodatek, nie podstawa dawki." },
    { title: "Nieudany ser — co z nim zrobić", href: "/nieudany-ser", description: "Druga droga odzysku: kiedy ser ratować, a kiedy przeznaczyć na paszę." },
    { title: "Przepis na ricottę", href: "/przepisy/ricotta", description: "Wyciągnij z serwatki resztę białka, zanim trafi do zwierząt." },
    { title: "Pasze i zwierzęta", href: "/pasze", description: "Cały dział: bilansowanie mieszanek i zagospodarowanie produktów ubocznych." },
  ];

  const skladTable = [
    { s: "Woda", v: "93–94%", u: "serwatka to głównie płyn" },
    { s: "Laktoza", v: "4,5–5,0%", u: "główny składnik suchej masy; problem dla drobiu" },
    { s: "Białko serwatkowe", v: "0,6–0,9%", u: "albuminy i globuliny; dobry profil aminokwasowy" },
    { s: "Tłuszcz", v: "0,2–0,5%", u: "zależy od dokładności odciągnięcia" },
    { s: "Składniki mineralne", v: "0,5–0,7%", u: "wapń, fosfor, potas" },
    { s: "Sucha masa łącznie", v: "6–7%", u: "dlatego serwatka nie zastąpi paszy treściwej" },
  ];

  const dawkiTable = [
    { z: "Tuczniki", d: "10–20 L / dzień", n: "najlepszy odbiorca; zastępuje część wody", ok: true },
    { z: "Warchlaki", d: "3–5 L / dzień", n: "wprowadzać stopniowo przez 7–10 dni", ok: true },
    { z: "Cielęta powyżej 3–4 tyg.", d: "2–4 L / dzień", n: "jako dodatek, nie zamiast pójła", ok: true },
    { z: "Kury nioski i brojlery", d: "10–20% dziennego pojenia", n: "TYLKO ukwaszona; ryzyko mokrej ściółki", ok: false },
    { z: "Psy", d: "50–200 ml okazjonalnie", n: "część psów źle toleruje laktozę", ok: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Pasze i zwierzęta", href: "/pasze" },
          { label: "Serwatka dla zwierząt" },
        ]}
      />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Recycle}
              color="teal"
              title="Serwatka w żywieniu zwierząt"
              subtitle="Z 10 litrów mleka zostaje ok. 8–9 litrów serwatki. To nie odpad — przy właściwej kolejności wykorzystania daje jeszcze ricottę, paszę i nawóz."
            />

            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="serwatka-dla-zwierzat" variant="default" />
            </div>

            <TLDRSection>
              <p>
                Kolejność wykorzystania: <strong>najpierw ricotta</strong> (z 10 L serwatki 200–400 g),
                potem <strong>pasza</strong>, na końcu <strong>nawóz</strong> rozcieńczony 1:5–1:10.
                Najlepszy odbiorca to <strong>świnie</strong> (tuczniki 10–20 L/dzień). Drobiowi podawaj{" "}
                <strong>wyłącznie serwatkę ukwaszoną</strong> i tylko jako 10–20% pojenia — ptaki nie
                trawią laktozy i dostają mokrej ściółki.{" "}
                <strong>Serwatki solonej nie skarmiaj nigdy</strong> — 1 litr solanki 20% niesie
                tyle soli, co 66 kg paszy, a dla kury 2 kg śmiertelne bywa już 30–40 ml.
              </p>
            </TLDRSection>

            <OstrzezenieSol kontekst="serwatka" />

            <div className="space-y-6">
              <Card className="border-destructive/40 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Dwie pozostałe rzeczy, które szkodzą
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>Serwatka zepsuta — nie myl z ukwaszoną.</strong> Ukwaszona jest kwaśna
                    i czysta w zapachu. Zgniły lub siarkowy zapach oznacza rozkład — do utylizacji.
                  </p>
                  <p>
                    <strong>Serwatka wylana do rowu lub stawu.</strong> Ma bardzo wysokie BZT —
                    zabiera wodzie tlen i powoduje śnięcie ryb. Zawsze rozcieńczaj i rozprowadzaj po polu.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Co jest w serwatce (na 1 litr)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Składnik</th>
                          <th className="text-left p-2 font-semibold">Zawartość</th>
                          <th className="text-left p-2 font-semibold">Znaczenie</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skladTable.map((r) => (
                          <tr key={r.s} className="border-b">
                            <td className="p-2 font-medium">{r.s}</td>
                            <td className="p-2 tabular-nums">{r.v}</td>
                            <td className="p-2 text-muted-foreground">{r.u}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Kluczowa liczba to <strong>6–7% suchej masy</strong>. Serwatka to przede wszystkim
                    woda z laktozą — świetne uzupełnienie i źródło energii, ale{" "}
                    <strong>nie zastąpi paszy białkowej</strong>. Bilans mieszanki policz w{" "}
                    <Link to="/kalkulator-pasz" className="text-primary hover:underline">
                      kalkulatorze pasz
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dawki dla poszczególnych zwierząt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Zwierzę</th>
                          <th className="text-left p-2 font-semibold">Dawka orientacyjna</th>
                          <th className="text-left p-2 font-semibold">Uwagi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dawkiTable.map((r) => (
                          <tr key={r.z} className="border-b">
                            <td className="p-2 font-medium">
                              {r.z} {r.ok ? "✅" : "⚠️"}
                            </td>
                            <td className="p-2">{r.d}</td>
                            <td className="p-2 text-muted-foreground">{r.n}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Każdą zmianę wprowadzaj <strong>stopniowo przez 5–10 dni</strong> i zawsze zostaw
                    dostęp do czystej wody. Dawki są orientacyjne — zależą od masy zwierzęcia, reszty
                    dawki pokarmowej i tego, czy serwatka jest świeża czy ukwaszona.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dlaczego drób to przypadek szczególny</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    Ptaki mają <strong>znikomą aktywność laktazy</strong> — enzymu rozkładającego
                    laktozę. Laktoza ze świeżej serwatki przechodzi więc do jelita grubego, gdzie
                    fermentuje i wiąże wodę. Efekt: <strong>wodniste odchody i mokra ściółka</strong>,
                    a stąd już blisko do kokcydiozy i problemów z łapami.
                  </p>
                  <p>
                    <strong>Rozwiązanie to ukwaszenie.</strong> Zostaw serwatkę w cieple na 2–3 dni —
                    bakterie mlekowe rozłożą część laktozy do kwasu mlekowego. Ukwaszona serwatka jest
                    znacznie lepiej tolerowana, a przy okazji zakwasza wole i działa niekorzystnie na
                    część bakterii chorobotwórczych.
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <strong>Ciekawy związek z bilansowaniem paszy:</strong> białko serwatkowe jest
                    stosunkowo bogate w <strong>cysteinę</strong>, a cysteina częściowo oszczędza
                    zapotrzebowanie na <strong>metioninę</strong> — aminokwas, którego niedobór jest
                    główną przyczyną wydziobywania piór i zjadania jaj. To istotne zwłaszcza w chowie
                    ekologicznym, gdzie nie wolno stosować syntetycznej metioniny. Serwatka nie
                    rozwiąże jednak problemu sama — przy 0,6–0,9% białka jest to dodatek, nie źródło.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Serwatka słodka a kwasowa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Cecha</th>
                          <th className="text-left p-2 font-semibold">Słodka (podpuszczkowa)</th>
                          <th className="text-left p-2 font-semibold">Kwasowa</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Skąd pochodzi</td>
                          <td className="p-2">gouda, cheddar, ementaler</td>
                          <td className="p-2">twaróg, ricotta, sery kwasowe</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">pH</td>
                          <td className="p-2 tabular-nums">6,0–6,6</td>
                          <td className="p-2 tabular-nums">4,3–4,6</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Wapń</td>
                          <td className="p-2">mniej (zostaje w serze)</td>
                          <td className="p-2">więcej (przechodzi do serwatki)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Do skarmiania</td>
                          <td className="p-2">✅ lepsza</td>
                          <td className="p-2">⚠️ rozcieńczyć; obciąża gospodarkę kwasowo-zasadową</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Na ricottę</td>
                          <td className="p-2">✅ tak, wydajniejsza</td>
                          <td className="p-2">białko już częściowo wytrącone</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kolejność wykorzystania — najwięcej z tego samego surowca</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <strong>Ricotta</strong> — podgrzej serwatkę do 85–92°C z dodatkiem kwasu.
                      Z 10 L uzyskasz 200–400 g. Odzyskujesz białka, których nie wychwyciła podpuszczka.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <strong>Pasza</strong> — serwatka po ricotcie, uboższa w białko, ale wciąż z
                      laktozą i minerałami. Świnie, cielęta, ukwaszona dla drobiu.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <strong>Nawóz</strong> — nadwyżka, rozcieńczona 1:5 do 1:10, pod korzeń.
                      Zakwasza glebę, więc dobra pod borówkę czy różaneczniki.
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Przy większej skali produkcji warto rozważyć stały odbiór przez sąsiada z trzodą —
                    ale zanim to ustalisz, przeczytaj akapit o przepisach niżej.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Przepisy — kiedy to już nie jest tylko Twoja sprawa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    <strong>Własna serwatka, własne zwierzęta, jedno gospodarstwo</strong> — sytuacja
                    najprostsza, mieści się w normalnej praktyce gospodarskiej.
                  </p>
                  <p>
                    <strong>Przekazywanie serwatki poza gospodarstwo</strong> — tu robi się poważniej.
                    Serwatka jest <strong>ubocznym produktem pochodzenia zwierzęcego kategorii 3</strong>,
                    a obrót takim materiałem i jego wykorzystanie w żywieniu zwierząt podlega nadzorowi
                    Inspekcji Weterynaryjnej. Zanim zaczniesz regularnie oddawać serwatkę innemu
                    gospodarstwu, <strong>potwierdź zasady u powiatowego lekarza weterynarii</strong> —
                    zakres obowiązków zależy od skali i przeznaczenia.
                  </p>
                  <p className="text-muted-foreground">
                    Jeśli produkujesz ser na sprzedaż, zagospodarowanie serwatki i tak pojawi się przy
                    rejestracji. Zasady sprzedaży opisujemy w działach{" "}
                    <Link to="/prawo/rhd" className="text-primary hover:underline">RHD</Link> i{" "}
                    <Link to="/prawo/mol" className="text-primary hover:underline">MOL</Link>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <SeeAlso links={seeAlsoLinks} />
      <Footer />
    </div>
  );
};

export default SerwatkaDlaZwierzat;
