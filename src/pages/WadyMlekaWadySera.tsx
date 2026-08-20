import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ReactionButton from "@/components/ReactionButton";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import SekcjaFAQ from "@/components/SekcjaFAQ";
import { Link } from "react-router-dom";

const WadyMlekaWadySera = () => {
  const faqData = [
    {
      question: "Skąd biorą się wzdęcia późne w serze?",
      answer:
        "Z przetrwalników Clostridium tyrobutyricum, które trafiają do mleka z kiszonki. Źle zakiszona lub zanieczyszczona ziemią kiszonka zawiera przetrwalniki, które przechodzą przez przewód pokarmowy krowy nienaruszone, trafiają do odchodów, a stamtąd na strzyki i do mleka. W dojrzewającym serze fermentują kwas mlekowy do kwasu masłowego, wytwarzając dwutlenek węgla i wodór — ser pęka, rozdyma się i cuchnie zjełczałym masłem. Wada ujawnia się dopiero po kilku tygodniach lub miesiącach dojrzewania, stąd nazwa. Kluczowe: przetrwalniki przeżywają pasteryzację, więc pasteryzacja przed tym nie chroni.",
    },
    {
      question: "Ile przetrwalników Clostridium w mleku jest bezpieczne?",
      answer:
        "Dla serów twardych i półtwardych dojrzewających długo za bezpieczny uznaje się poziom poniżej 100 przetrwalników na litr mleka. Powyżej 1000 przetrwalników na litr ryzyko wzdęć późnych staje się wysokie. Dla porównania: mleko od krów żywionych dobrą kiszonką przy zachowaniu higieny udoju mieści się zwykle poniżej 100, natomiast przy złej kiszonce i zabrudzonych strzykach potrafi przekroczyć 10 000. Sery świeże i krótko dojrzewające, jak twaróg czy mozzarella, nie są tą wadą zagrożone, bo nie dojrzewają wystarczająco długo.",
    },
    {
      question: "Czy krowom produkującym mleko na ser można podawać kiszonkę?",
      answer:
        "Przy serach świeżych i krótko dojrzewających tak, bez większych obaw. Przy serach twardych, długo dojrzewających, jest to na tyle ryzykowne, że specyfikacje najbardziej znanych serów chronionych — Emmentaler, Comté, Grana Padano, Parmigiano Reggiano — wprost zakazują skarmiania kiszonek krów, których mleko trafia do produkcji. To najmocniejszy dowód, jak realne jest to zagrożenie. W gospodarstwie domowym rozwiązania są trzy: zrezygnować z kiszonki na rzecz siana, zapewnić bardzo dobrą jakość kiszonki i higienę udoju, albo robić wyłącznie sery krótko dojrzewające.",
    },
    {
      question: "Co się dzieje z serem, gdy mleko zawiera antybiotyki?",
      answer:
        "Ser się nie zakwasi. Antybiotyki działają jako inhibitory i zabijają kultury starterowe, więc bakterie mlekowe nie produkują kwasu, pH nie spada, skrzep jest słaby lub w ogóle nie powstaje, a masa nie odwadnia się prawidłowo. Partia jest stracona. Co gorsza, brak zakwaszenia otwiera drogę bakteriom niepożądanym, które normalnie są hamowane przez spadek pH. Kultury serowarskie bywają wrażliwsze niż progi wykrywalności rutynowych testów, więc mleko formalnie 'czyste' może i tak zepsuć partię.",
    },
    {
      question: "Jak długo po leczeniu krowy antybiotykiem nie używać mleka?",
      answer:
        "Przez pełny okres karencji podany przez producenta leku, liczony od ostatniego podania — a dla serowarstwa warto dodać margines bezpieczeństwa jednego lub dwóch dojów. Okres karencji dla preparatów domięśniowych i dowymieniowych wynosi zwykle od 3 do 7 dni, ale bywa dłuższy; zawsze sprawdzaj ulotkę konkretnego preparatu, bo różnice są duże. Praktyka minimalna: oznacz leczoną krowę widocznie (opaska na nodze), doj ją na końcu i zlewaj mleko osobno. Sprzedaż mleka z pozostałościami antybiotyków jest niezgodna z prawem.",
    },
    {
      question: "Jak komórki somatyczne wpływają na ser?",
      answer:
        "Wysoka liczba komórek somatycznych oznacza stan zapalny wymienia, a wraz z nim wzrost aktywności plazminy — enzymu rozkładającego kazeinę. Skutki dla sera: dłuższy czas krzepnięcia, słabszy i bardziej miękki skrzep, gorsze odwadnianie, niższa wydajność oraz gorycz i nieprawidłowe dojrzewanie. Zdrowa ćwiartka to poniżej 100 tysięcy komórek na mililitr; zakres 200–400 tysięcy wskazuje na mastitis podkliniczne; unijny limit dla mleka surowego wynosi 400 tysięcy na mililitr jako średnia geometryczna z trzech miesięcy. Do serowarstwa warto celować znacznie niżej niż limit prawny.",
    },
    {
      question: "Czy pasteryzacja rozwiązuje problem złego mleka?",
      answer:
        "Nie, i to jest najczęstsze nieporozumienie. Pasteryzacja zabija bakterie wegetatywne, ale nie usuwa trzech kluczowych problemów: przetrwalniki Clostridium przeżywają ją bez szwanku, antybiotyki nie ulegają rozkładowi, a zmiany w kazeinie spowodowane wysokim LKS i późną laktacją są nieodwracalne. Pasteryzacja poprawia bezpieczeństwo mikrobiologiczne, ale nie naprawia mleka, które jako surowiec serowarski jest już zepsute. Jakość sera rozstrzyga się w oborze, nie w kotle.",
    },
    {
      question: "Ser wyszedł gorzki — czy to wina mleka?",
      answer:
        "Może być, choć gorycz ma kilka źródeł. Ze strony mleka najczęstsze przyczyny to wysoka liczba komórek somatycznych oraz mleko z późnej laktacji — w obu przypadkach aktywna plazmina rozkłada kazeinę do gorzkich peptydów jeszcze przed zaprawieniem. Ze strony procesu gorycz powoduje nadmiar podpuszczki, zbyt wysoka temperatura dojrzewania lub niewłaściwy szczep kultury. Jeśli gorzknieją kolejne partie mimo poprawnego procesu, sprawdź wyniki LKS i stadium laktacji krów dostarczających mleko.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Wady mleka a wady sera — łańcuchy przyczynowe od obory do dojrzewalni",
        description:
          "Cztery łańcuchy przyczynowe: kiszonka i Clostridium tyrobutyricum a wzdęcia późne, antybiotyki a martwe kultury starterowe, komórki somatyczne i mastitis a słaby skrzep, mleko późnej laktacji. Progi, objawy i zapobieganie.",
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/wady-mleka-a-wady-sera",
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
    { title: "Nieudany ser — co z nim zrobić", href: "/nieudany-ser", description: "Diagnostyka od strony gotowego sera: ratować, przerobić czy wyrzucić." },
    { title: "Mleko do sera", href: "/mleko-do-sera", description: "Skład mleka, wydajność serowarska i wpływ żywienia na tłuszcz i białko." },
    { title: "Kalkulator pasz dla bydła", href: "/kalkulator-pasz-bydlo", description: "Dawka dla krów — struktura dawki decyduje o składzie mleka." },
    { title: "Poradnik dla serowarów", href: "/poradnik", description: "Proces od mleka do dojrzewania i typowe błędy technologiczne." },
  ];

  const diagnoza = [
    { ser: "Wzdęcia późne — ser pęka po tygodniach, cuchnie zjełczałym masłem", obora: "Przetrwalniki Clostridium z kiszonki", prog: "> 1000 przetrwalników / L" },
    { ser: "Ser się nie zakwasza, skrzep nie powstaje", obora: "Antybiotyki (inhibitory) w mleku", prog: "okres karencji nie minął" },
    { ser: "Długie krzepnięcie, słaby skrzep, niska wydajność", obora: "Wysokie LKS / mastitis", prog: "> 400 tys. / ml" },
    { ser: "Gorycz w dojrzewającym serze", obora: "Wysokie LKS lub mleko późnej laktacji", prog: "aktywna plazmina" },
    { ser: "Wzdęcia wczesne — puchnie w pierwszych dniach", obora: "Bakterie z grupy coli, zła higiena udoju", prog: "zanieczyszczenie fekalne" },
    { ser: "Niski uzysk mimo poprawnego procesu", obora: "Niska kazeina i tłuszcz — błąd w dawce", prog: "tłuszcz < 3,0%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Wady mleka a wady sera — łańcuchy od obory do dojrzewalni | Moja Serowarnia</title>
        <meta
          name="description"
          content="Kiszonka i Clostridium a wzdęcia późne (progi przetrwalników), antybiotyki a martwe kultury, komórki somatyczne a słaby skrzep, późna laktacja. Tabela: objaw w serze → przyczyna w oborze."
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/wady-mleka-a-wady-sera" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Pasze i zwierzęta", href: "/pasze" },
          { label: "Wady mleka a wady sera" },
        ]}
      />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={GitBranch}
              color="rose"
              title="Wady mleka a wady sera"
              subtitle="Część wad sera nie powstaje w kotle, tylko w oborze — i ujawnia się dopiero po miesiącach dojrzewania. Cztery łańcuchy przyczynowe, które warto znać, zanim stracisz partię."
            />

            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="wady-mleka-a-wady-sera" variant="default" />
            </div>

            <TLDRSection>
              <p>
                <strong>Kiszonka → <em>Clostridium</em> → wzdęcia późne</strong> — przetrwalniki
                przeżywają pasteryzację; bezpieczny poziom to poniżej 100 na litr. Dlatego
                specyfikacje Emmentalera, Comté i Grana Padano <strong>zakazują kiszonek</strong>.{" "}
                <strong>Antybiotyki → martwe kultury</strong> — ser się nie zakwasi, partia stracona.{" "}
                <strong>LKS powyżej 400 tys./ml → plazmina</strong> rozkłada kazeinę: słaby skrzep,
                niska wydajność, gorycz. <strong>Pasteryzacja żadnego z tych problemów nie naprawia.</strong>
              </p>
            </TLDRSection>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Szybka diagnostyka — objaw w serze, przyczyna w oborze</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Co widzisz w serze</th>
                          <th className="text-left p-2 font-semibold">Przyczyna w oborze</th>
                          <th className="text-left p-2 font-semibold">Próg / wskaźnik</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diagnoza.map((r) => (
                          <tr key={r.ser} className="border-b">
                            <td className="p-2 font-medium">{r.ser}</td>
                            <td className="p-2">{r.obora}</td>
                            <td className="p-2 text-muted-foreground tabular-nums">{r.prog}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Diagnostykę od strony gotowego sera — czy ratować, przerobić czy wyrzucić —
                    znajdziesz w{" "}
                    <Link to="/nieudany-ser" className="text-primary hover:underline">
                      nieudanym serze
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>

              {/* ŁAŃCUCH 1 */}
              <Card className="border-destructive/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Łańcuch 1: kiszonka → <em>Clostridium</em> → wzdęcia późne
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="bg-secondary/50 p-4 rounded-lg font-medium">
                    Zła kiszonka → przetrwalniki <em>C. tyrobutyricum</em> → przewód pokarmowy krowy
                    (przeżywają) → odchody → strzyki → mleko → <strong>przeżywają pasteryzację</strong> →
                    ser dojrzewający → fermentacja kwasu mlekowego do masłowego → CO₂ i H₂ →{" "}
                    <strong>ser pęka i cuchnie zjełczałym masłem</strong>
                  </div>
                  <p>
                    To najbardziej podstępna wada w serowarstwie, bo{" "}
                    <strong>ujawnia się dopiero po tygodniach lub miesiącach</strong> dojrzewania —
                    gdy partia jest już zainwestowana. Stąd nazwa „wzdęcia późne", w odróżnieniu od
                    wczesnych, powodowanych przez bakterie z grupy coli w pierwszych dniach.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Poziom przetrwalników</th>
                          <th className="text-left p-2 font-semibold">Ryzyko</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b"><td className="p-2 tabular-nums">&lt; 100 / L</td><td className="p-2">bezpieczny nawet dla serów długo dojrzewających</td></tr>
                        <tr className="border-b"><td className="p-2 tabular-nums">100–1000 / L</td><td className="p-2">podwyższone; ryzykowne przy serach twardych</td></tr>
                        <tr><td className="p-2 tabular-nums">&gt; 1000 / L</td><td className="p-2">wysokie — wzdęcia bardzo prawdopodobne</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <strong>Najmocniejszy dowód, jak realne jest to zagrożenie:</strong> specyfikacje
                    serów chronionych — <strong>Emmentaler, Comté, Grana Padano, Parmigiano
                    Reggiano</strong> — <strong>wprost zakazują skarmiania kiszonek</strong> krowom,
                    których mleko trafia do produkcji. Nie z tradycji, tylko właśnie z powodu
                    przetrwalników.
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Jak zapobiegać</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Jakość kiszonki</strong> — szybkie zakiszenie, dobre ubicie i przykrycie, niskie pH. Źle sfermentowana kiszonka to wylęgarnia przetrwalników.</li>
                      <li><strong>Zero ziemi</strong> — koszenie nie za nisko; ziemia to główne źródło <em>Clostridium</em>.</li>
                      <li><strong>Higiena udoju</strong> — czyste, suche strzyki; przetrwalniki trafiają do mleka z odchodów.</li>
                      <li><strong>Siano zamiast kiszonki</strong> dla krów, których mleko idzie na sery twarde — rozwiązanie radykalne, ale skuteczne.</li>
                      <li><strong>Tylko sery krótko dojrzewające</strong>, jeśli rezygnacja z kiszonki nie wchodzi w grę.</li>
                    </ul>
                  </div>
                  <p className="text-muted-foreground">
                    W przemyśle stosuje się dodatkowo baktofugację, mikrofiltrację, lizozym (E1105)
                    lub azotany — w warunkach domowych to zwykle poza zasięgiem, więc grają wyłącznie
                    profilaktyka i wybór typu sera.
                  </p>
                </CardContent>
              </Card>

              {/* ŁAŃCUCH 2 */}
              <Card className="border-destructive/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Łańcuch 2: antybiotyki → martwe kultury starterowe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="bg-secondary/50 p-4 rounded-lg font-medium">
                    Leczenie krowy → inhibitory w mleku → <strong>zabijają kultury starterowe</strong> →
                    brak zakwaszenia, pH nie spada → słaby lub żaden skrzep →{" "}
                    <strong>partia stracona</strong> + otwarta droga dla bakterii niepożądanych
                  </div>
                  <p>
                    Kultury starterowe to żywe bakterie — antybiotyk nie odróżnia ich od patogenów w
                    wymieniu. Bez zakwaszenia nie zadziała nic dalej: pH nie spadnie, skrzep nie
                    nabierze zwięzłości, masa się nie odwodni. Dodatkowo{" "}
                    <strong>brak spadku pH usuwa naturalną barierę</strong>, która normalnie hamuje
                    bakterie niepożądane.
                  </p>
                  <div className="bg-destructive/10 border-l-4 border-destructive p-3 rounded">
                    <strong>Uwaga na fałszywe poczucie bezpieczeństwa:</strong> kultury serowarskie
                    bywają <strong>wrażliwsze niż progi wykrywalności</strong> rutynowych testów.
                    Mleko formalnie „czyste" może i tak zepsuć partię. Dlatego przy serowarstwie
                    stosuj margines: <strong>pełny okres karencji plus jeden–dwa doje zapasu</strong>.
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Praktyka minimalna w gospodarstwie</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Oznacz leczoną krowę</strong> widocznie — opaska na nodze, nie tylko wpis w zeszycie.</li>
                      <li><strong>Doj ją na końcu</strong> i zlewaj mleko osobno.</li>
                      <li><strong>Sprawdź ulotkę</strong> konkretnego preparatu — okresy karencji różnią się mocno, zwykle 3–7 dni, ale bywa dłużej.</li>
                      <li><strong>Prowadź rejestr leczeń</strong> z datą ostatniego podania i datą powrotu mleka do produkcji.</li>
                    </ul>
                  </div>
                  <p className="text-muted-foreground">
                    Sprzedaż mleka z pozostałościami antybiotyków jest <strong>niezgodna z prawem</strong>.
                    Przy sprzedaży sera w{" "}
                    <Link to="/prawo/rhd" className="text-primary hover:underline">RHD</Link> lub{" "}
                    <Link to="/prawo/mol" className="text-primary hover:underline">MOL</Link>{" "}
                    rejestr leczeń bywa przedmiotem kontroli.
                  </p>
                </CardContent>
              </Card>

              {/* ŁAŃCUCH 3 */}
              <Card className="border-destructive/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Łańcuch 3: mastitis i komórki somatyczne → plazmina → słaby skrzep
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="bg-secondary/50 p-4 rounded-lg font-medium">
                    Stan zapalny wymienia → wzrost LKS → <strong>aktywna plazmina</strong> rozkłada
                    kazeinę → dłuższe krzepnięcie, słabszy skrzep → gorsze odwadnianie →{" "}
                    <strong>niższa wydajność + gorycz w dojrzewaniu</strong>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">LKS (komórki / ml)</th>
                          <th className="text-left p-2 font-semibold">Interpretacja</th>
                          <th className="text-left p-2 font-semibold">Przydatność do sera</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b"><td className="p-2 tabular-nums">&lt; 100 tys.</td><td className="p-2">zdrowa ćwiartka</td><td className="p-2">optymalna</td></tr>
                        <tr className="border-b"><td className="p-2 tabular-nums">100–200 tys.</td><td className="p-2">dobra</td><td className="p-2">bardzo dobra</td></tr>
                        <tr className="border-b"><td className="p-2 tabular-nums">200–400 tys.</td><td className="p-2">podejrzenie mastitis podklinicznego</td><td className="p-2">pogorszona</td></tr>
                        <tr><td className="p-2 tabular-nums font-semibold">&gt; 400 tys.</td><td className="p-2 font-semibold">powyżej limitu UE dla mleka surowego</td><td className="p-2 font-semibold">zła — wyraźne straty</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p>
                    Limit unijny <strong>400 tys./ml</strong> to średnia geometryczna z trzech
                    miesięcy i jest to próg <em>prawny</em>, nie technologiczny.{" "}
                    <strong>Do serowarstwa warto celować znacznie niżej</strong> — różnicę w
                    wydajności i jakości skrzepu widać już powyżej 200 tysięcy.
                  </p>
                </CardContent>
              </Card>

              {/* ŁAŃCUCH 4 */}
              <Card>
                <CardHeader>
                  <CardTitle>Łańcuch 4: późna laktacja i siara</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    W ostatnich tygodniach przed zasuszeniem rośnie pH mleka i LKS, zmienia się
                    profil kazeiny, a plazmina jest bardziej aktywna. Skutki są takie same jak przy
                    mastitis: dłuższe krzepnięcie, słabszy skrzep, niższa wydajność i ryzyko goryczy.
                  </p>
                  <p>
                    <strong>Siara i mleko z pierwszych dni po wycieleniu</strong> nie nadają się do
                    serowarstwa w ogóle — mają zupełnie inny skład białkowy.
                  </p>
                  <p className="text-muted-foreground">
                    Praktyka: przy serach dojrzewających pomijaj mleko krów w ostatnich tygodniach
                    laktacji. Przy stadzie sezonowym warto zaplanować wycielenia tak, by szczyt
                    produkcji sera przypadał na środek laktacji stada.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle>Najczęstsze nieporozumienie: „przecież pasteryzuję"</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    Pasteryzacja zabija bakterie wegetatywne i poprawia bezpieczeństwo
                    mikrobiologiczne. <strong>Nie naprawia jednak żadnego z powyższych problemów:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Przetrwalniki <em>Clostridium</em></strong> przeżywają ją bez szwanku.</li>
                    <li><strong>Antybiotyki</strong> nie ulegają rozkładowi w tej temperaturze.</li>
                    <li><strong>Zmiany w kazeinie</strong> po wysokim LKS i późnej laktacji są nieodwracalne.</li>
                  </ul>
                  <p className="font-medium pt-1">
                    Jakość sera rozstrzyga się w oborze, nie w kotle. Kocioł może ją tylko utrzymać
                    albo zepsuć — nie potrafi jej dodać.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <SekcjaFAQ slug="wady-mleka-a-wady-sera" />


      <SeeAlso links={seeAlsoLinks} />
      <Footer />
    </div>
  );
};

export default WadyMlekaWadySera;
