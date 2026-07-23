import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LibraryBig, ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SeeAlso from "@/components/SeeAlso";
import { Link } from "react-router-dom";

const KlasykaPolskiegoSerowarstwa = () => {
  const faqData = [
    {
      question: "Czy stare polskie książki o serowarstwie są dostępne za darmo?",
      answer:
        "Tak — publikacje sprzed 1956 roku są co do zasady w domenie publicznej (polska ustawa: 70 lat od śmierci autora). Dzieła Waleriana Józefa Kleckiego (zm. 1920) i inne XIX-wieczne podręczniki dostępne są bezpłatnie w Polona.pl, Federacji Bibliotek Cyfrowych (fbc.pionier.net.pl) i Jagiellońskiej Bibliotece Cyfrowej.",
    },
    {
      question: "Dlaczego historyczne podręczniki serowarskie są wciąż wartościowe?",
      answer:
        "Chemia mleka i mechanizm koagulacji podpuszczką nie zmieniły się od stu lat. Stare podręczniki zawierają obserwacje empiryczne zebrane przez pokolenia praktyków — zanim pojawiły się gotowe kultury starterowe, serowarzy musieli rozumieć mleko dogłębnie. Wiele zasad opisanych przez Kleckiego (1900) i Licznerskiego (1922) jest dziś potwierdzonych naukowo.",
    },
    {
      question: "Czym różni się dawne serowarstwo od współczesnego?",
      answer:
        "Główna różnica to standaryzacja. Dawniej serowar kupował mleko od konkretnych krów, znał ich rasę i paszę. Klecki podkreślał, że skład mleka latem i zimą różni się na tyle, że dawka podpuszczki musi być dostosowywana co sezon. Dziś przemysłowe mleko UHT ma zbliżony skład przez cały rok. Serowarstwo rzemieślnicze (małoseryjne, sezonowe) jest bliższe dawnemu modelowi niż przemysłowemu.",
    },
    {
      question: "Kim był Walerian Józef Klecki?",
      answer:
        'Walerian Józef Klecki (1868–1920) — polski uczony, profesor hodowli zwierząt i mleczarstwa na Uniwersytecie Jagiellońskim w Krakowie (pełnił też funkcję dziekana wydziału). Autor pierwszego polskiego podręcznika akademickiego poświęconego wyłącznie serowarstwie (1900). Wcześniej wydał „Mleko i mleczarstwo w oświetleniu hygieny i bakteryologii”. Zmarł w 1920 roku — jego prace są w domenie publicznej.',
    },
    {
      question: "Skąd pochodzi polskie serowarstwo — czy mamy własną tradycję?",
      answer:
        "Polska tradycja serowarska jest wielowiekowa i zróżnicowana regionalnie. Na południu (Tatry, Podhale) dominowało serowarstwo owcze: oscypek, bundz, bryndza. Na nizinach — serowarstwo krowie, wzorowane na szwajcarskich i holenderskich recepturach adaptowanych do lokalnych warunków. Klecki (1900) i Licznerski (1922) systematyzowali tę wiedzę i opisywali zarówno sery rodzime, jak i technologie zagraniczne.",
    },
    {
      question: "Czy mogę cytować fragmenty tych historycznych książek?",
      answer:
        "Tak, o ile autor zmarł ponad 70 lat temu (prawo polskie i unijne). Dla Kleckiego (zm. 1920) — tak, od 1990 roku. Dla Licznerskiego — najprawdopodobniej tak (data śmierci nie jest powszechnie udokumentowana w sieci, ale liczne biblioteki cyfrowe udostępniają jego prace jako domenę publiczną). Przy cytowaniu podawaj zawsze: imię, nazwisko autora, tytuł dzieła, rok pierwszego wydania.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Klasyka polskiego serowarstwa — historyczne podręczniki w domenie publicznej",
        description:
          "Przegląd polskich klasycznych dzieł serowarskich z lat 1900–1922: Walerian Józef Klecki, Jan Licznerski, Encyklopedya rolnicza. Linki do darmowych skanów, cytaty, kontekst historyczny.",
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/klasyka-serowarstwa",
        image: "https://mojaserowarnia.pl/og-image.png",
        author: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
        publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
        datePublished: "2026-07-22",
      },
      {
        "@type": "FAQPage",
        mainEntity: faqData.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://mojaserowarnia.pl/" },
          { "@type": "ListItem", position: 2, name: "Poradniki", item: "https://mojaserowarnia.pl/poradniki" },
          { "@type": "ListItem", position: 3, name: "Klasyka polskiego serowarstwa", item: "https://mojaserowarnia.pl/klasyka-serowarstwa" },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Klasyka polskiego serowarstwa — historyczne podręczniki (domena publiczna)</title>
        <meta
          name="description"
          content="Przegląd polskich klasycznych podręczników serowarskich: Klecki (1900), Licznerski (1922), Encyklopedya rolnicza. Linki do darmowych skanów cyfrowych i cytaty z historycznych źródeł."
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/klasyka-serowarstwa" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs
        items={[{ label: "Poradniki", href: "/poradniki" }, { label: "Klasyka polskiego serowarstwa" }]}
      />

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <PageHeader
          icon={LibraryBig}
          color="violet"
          title="Klasyka polskiego serowarstwa"
          subtitle="Historyczne podręczniki w domenie publicznej — od kiedy Polacy pisali o serze naukowo"
        />

        <div className="container mx-auto px-4 py-10 max-w-4xl">

          {/* Intro */}
          <Card className="mb-8 border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10">
            <CardContent className="pt-6">
              <p className="text-base leading-relaxed mb-3">
                Polskie serowarstwo ma{" "}
                <strong>udokumentowaną tradycję akademicką sięgającą początków XX wieku</strong>. Długo przed
                powstaniem blogów o serowarstwie domowym i first zanim ktokolwiek napisał „przepis na ser gouda po
                polsku" — krakowscy i warszawscy uczeni tworzyli podręczniki opisujące chemię mleka, mikrobiologię
                i technologię serów z precyzją godną dzisiejszych standardów.
              </p>
              <p className="text-base leading-relaxed">
                Poniżej znajdziesz przegląd trzech kluczowych historycznych źródeł — wszystkie dostępne bezpłatnie
                online jako domina publiczna — wraz z linkami do skanów cyfrowych, krótką charakterystyką
                autorów i wyjaśnieniem, dlaczego ich wiedza jest wciąż aktualna.
              </p>
            </CardContent>
          </Card>

          {/* Klecki 1900 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="inline-block w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-200 text-sm font-bold flex items-center justify-center">1</span>
              Walerian Józef Klecki — <em>Serowarstwo</em> (1900)
            </h2>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">O autorze</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed">
                <p>
                  <strong>Walerian Józef Klecki (1868–1920)</strong> był profesorem hodowli zwierząt i mleczarstwa
                  na <strong>Uniwersytecie Jagiellońskim w Krakowie</strong>, gdzie pełnił także funkcję dziekana
                  wydziału. To jeden z pierwszych polskich uczonych, który potraktował serowarstwo jako dyscyplinę
                  naukową, a nie tylko rzemiosło.
                </p>
                <p>
                  Zanim wydał <em>Serowarstwo</em>, opublikował pracę{" "}
                  <em>Mleko i mleczarstwo w oświetleniu hygieny i bakteryologii</em> — dowód, że głęboko rozumiał
                  związek między mikrobiologią mleka a jakością sera. Klecki pisał w czasach, gdy pasteryzacja
                  mleka serowarskiego była jeszcze nowością, a kultury starterowe — luksusem niedostępnym w
                  małych gospodarstwach.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">O książce</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed">
                <p>
                  Wydana w Warszawie przez <em>Gazetę Rolniczą</em> w <strong>1900 roku</strong>,{" "}
                  <em>Serowarstwo</em> była pierwszym polskim podręcznikiem poświęconym wyłącznie produkcji sera.
                  Klecki opisał w niej nie tylko technologię, ale też{" "}
                  <strong>warunki, od których zależy jakość mleka</strong>: rasę krów, porę roku, skład paszy,
                  higienę udoju. Wiedział, że dobry ser zaczyna się na pastwisku, nie w kadzi.
                </p>
                <p>
                  Książka jest dziś dostępna jako skan cyfrowy w domenie publicznej w Jagiellońskiej Bibliotece
                  Cyfrowej (w zasobach Federacji Bibliotek Cyfrowych).
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href="https://fbc.pionier.net.pl/details/nnqb5n8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Czytaj w FBC — Serowarstwo (1900)
                  </a>
                  <a
                    href="https://polona.pl/preview/dae0b6b0-bcf0-4f13-91e2-a2d763875dc4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Mleko i mleczarstwo — Polona
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-violet-400">
              <CardContent className="pt-6">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Co Klecki podkreślał — i co jest nadal aktualne
                </p>
                <ul className="text-sm space-y-1.5 list-disc list-inside text-foreground/80">
                  <li>Skład mleka zmienia się sezonowo — dawka podpuszczki powinna być do tego dostosowywana</li>
                  <li>Temperatura mleka w chwili dodawania kultury jest krytyczna — precyzja temperaturowa to podstawa</li>
                  <li>Higiena przy udoju wpływa na mikroflorę mleka i w konsekwencji na smak sera</li>
                  <li>Mleko owcze i kozie wymaga innych parametrów technologicznych niż krowie</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Licznerski 1922 */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="inline-block w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-200 text-sm font-bold flex items-center justify-center">2</span>
              Jan Licznerski — <em>Praktyczne serowarstwo</em> (1922)
            </h2>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">„Biblia serowara" — 435 stron wiedzy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed">
                <p>
                  Wydana w Warszawie przez Warszawskie Wydawnictwa Techniczne w{" "}
                  <strong>1922 roku</strong>, <em>Praktyczne serowarstwo</em> Jana Licznerskiego to{" "}
                  <strong>najbardziej kompletny historyczny polski podręcznik serowarski</strong> — 435 stron
                  łączących chemię, mikrobiologię i praktykę produkcji. Polskie środowisko serowarskie nazywa ją
                  nieoficjalnie <em>„Biblią serowara"</em>.
                </p>
                <p>
                  Licznerski pisał z perspektywy praktyka: ponad 20 lat doświadczeń w polskich mleczarniach i
                  serowarniach. Drugą, poprawioną edycję przygotował podczas okupacji, w trudnych warunkach
                  materialnych, w Babicach koło Rzeszowa — pomimo zaawansowanego wieku i słabego zdrowia.
                  Wznowienie ukazało się w{" "}
                  <strong>1951 roku</strong>.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Struktura książki</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold mb-2">Część I — Mleko</p>
                    <ul className="space-y-1 list-disc list-inside text-foreground/80">
                      <li>Skład i właściwości mleka krowiego</li>
                      <li>Tłuszcze, białka, cukier mlekowy, sole mineralne</li>
                      <li>Mleko owcze i kozie</li>
                      <li>Mikroorganizmy w mleku i ich rola</li>
                      <li>Bakterie kwasu mlekowego, propionowego, masłowego</li>
                      <li>Drożdże i pleśnie</li>
                      <li>Pasteryzacja mleka serowarskiego</li>
                      <li>Badanie i dojrzewanie mleka</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Część II — Rodzaje serów</p>
                    <ul className="space-y-1 list-disc list-inside text-foreground/80">
                      <li>Sery miękkie</li>
                      <li>Sery podpuszczkowe</li>
                      <li>Sery twarde</li>
                      <li>Ser limburski</li>
                      <li>Quartirolo (włoski)</li>
                      <li>Ser ementalski (szwajcarski)</li>
                      <li>Ser holenderski (gouda / edam)</li>
                      <li>Sery parowane (topione)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4 border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/10">
              <CardContent className="pt-5">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
                  Cytat — Jan Licznerski, <em>Praktyczne serowarstwo</em> (1922)
                </p>
                <blockquote className="text-base italic leading-relaxed text-foreground border-l-2 border-amber-400 pl-4">
                  „Bryndzy owczej było za mało przy wielkim popycie. Przemielano więc chudy, krowi twaróg,
                  maszczono tłuszczem roślinnym, a dla ostrości i zapachu dodawano starej owczej bryndzy."
                </blockquote>
                <p className="text-xs text-muted-foreground mt-2">
                  Fragment o fałszowaniu bryndzy — problem w Polsce już 100 lat temu
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://fbc.pionier.net.pl/details/nn94rkt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Czytaj w FBC — Praktyczne serowarstwo (1922)
              </a>
              <a
                href="http://szkoladomowegomasarstwa.pl/docs/serowarstwo.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                PDF — Szkoła Domowego Masarstwa
              </a>
            </div>
          </section>

          {/* Encyklopedya rolnicza */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="inline-block w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-200 text-sm font-bold flex items-center justify-center">3</span>
              Encyklopedya rolnicza — tom IX, hasło <em>Serowarstwo</em> (ok. 1900)
            </h2>

            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  <em>Encyklopedya rolnicza</em> to monumentalne polskie kompendium wiedzy agrarnej z przełomu
                  XIX i XX wieku. <strong>Tom IX obejmuje hasła od „Plenipotencja" do „Serowarstwo"</strong> —
                  kończy się obszernym artykułem encyklopedycznym poświęconym produkcji sera.
                </p>
                <p>
                  Encyklopedyczne ujęcie tematu (bez nazwiska autora hasła) pozwala zobaczyć, jak szeroko
                  rozumiano serowarstwo 120 lat temu: nie tylko jako zestaw przepisów, ale jako dziedzinę
                  łączącą hodowlę bydła, przetwórstwo mleka i ekonomikę wiejskiego gospodarstwa.
                </p>
                <p>
                  Skan dostępny bezpłatnie w zbiorach Polony (Biblioteki Narodowej).
                </p>
                <a
                  href="https://polona.pl/item/encyklopedya-rolnicza-t-9-plenipotencya-serowarstwo,MTMxMDAyMDU0/152/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Czytaj na Polonie — Encyklopedya rolnicza T.9
                </a>
              </CardContent>
            </Card>
          </section>

          {/* Co jest ponadczasowe */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Co z tej wiedzy jest ponadczasowe?
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400 mb-2">✓ Aktualne do dziś</p>
                    <ul className="space-y-2 list-disc list-inside text-foreground/80">
                      <li>Mechanizm koagulacji podpuszczką (enzymatyczny rozpad kazeiny)</li>
                      <li>Rola temperatury i pH w skrzepie — te same zakresy co dziś</li>
                      <li>Bakterie kwasu mlekowego jako serce każdego sera dojrzewającego</li>
                      <li>Osuszanie skrzepu przez cięcie i mieszanie</li>
                      <li>Solenie jako element technologii, nie tylko smak</li>
                      <li>Warunki dojrzewania: temperatura, wilgotność, cyrkulacja powietrza</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-700 dark:text-amber-400 mb-2">⚠ Co się zmieniło</p>
                    <ul className="space-y-2 list-disc list-inside text-foreground/80">
                      <li>Kultury starterowe: dziś liofilizowane i wystandaryzowane; dawniej — „dzika fermentacja" lub transfer między partiami</li>
                      <li>Podpuszczka: dziś głównie mikrobiologiczna i rekombinowana; dawniej — wyłącznie cielęca</li>
                      <li>Mleko: pasteryzowane i homogenizowane zamiast surowego prosto od krowy</li>
                      <li>Termometry, pH-metry, precyzyjne wagi — Klecki i Licznerski robili to dotykiem i doświadczeniem</li>
                      <li>Regulacje sanitarne i wymogi RHD / MOL (nieistniejące w 1900 r.)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Gdzie szukać starych polskich źródeł */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Gdzie szukać historycznych polskich źródeł serowarskich?
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  name: "Polona.pl",
                  desc: 'Biblioteka Narodowa — największa baza cyfrowa. Szukaj: „serowarstwo", „mleczarstwo", „wyrób sera".',
                  url: "https://polona.pl/search?query=serowarstwo",
                },
                {
                  name: "FBC Pionier",
                  desc: "Federacja Bibliotek Cyfrowych — agregat wielu bibliotek. Dużo materiałów rolniczych.",
                  url: "https://fbc.pionier.net.pl/search#q=serowarstwo",
                },
                {
                  name: "JBC — Jagiellońska Biblioteka Cyfrowa",
                  desc: "Zasoby UJ: Klecki i inne prace z katedry hodowli i mleczarstwa.",
                  url: "https://jbc.bj.uj.edu.pl/",
                },
              ].map((src) => (
                <Card key={src.name} className="hover:border-violet-400 transition-colors">
                  <CardContent className="pt-5">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-violet-700 dark:text-violet-300 hover:underline inline-flex items-center gap-1 mb-1"
                    >
                      {src.name} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <p className="text-sm text-muted-foreground">{src.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">Najczęstsze pytania</h2>
            <div className="space-y-4">
              {faqData.map((item) => (
                <Card key={item.question}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">{item.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-foreground/80 leading-relaxed">
                    {item.answer}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <SeeAlso
            links={[
              { href: "/poradnik", title: "Poradnik dla serowarów — kompletny przewodnik" },
              { href: "/bakterie-kultury", title: "Kultury bakteryjne i pleśnie — szczegółowy przewodnik" },
              { href: "/kalkulator-beaugel", title: "Kalkulator Beaugel — dawka podpuszczki" },
              { href: "/prawo/rhd", title: "RHD — sprzedaż sera z własnej produkcji" },
            ]}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default KlasykaPolskiegoSerowarstwa;
