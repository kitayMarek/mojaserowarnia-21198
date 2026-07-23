import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SeeAlso from "@/components/SeeAlso";

const LicznerskiMleko = () => {
  const faqData = [
    {
      question: "Co Licznerski pisze o składzie mleka?",
      answer:
        'Licznerski szczegółowo opisuje skład chemiczny mleka krowiego, owczego i koziego: tłuszcz (3,2-7,5% w zależności od gatunku), kazeinę i albuminę (białka serowarskie), laktozę (cukier mlekowy) i sole mineralne. Podaje tabele z porównaniem składu mleka różnych zwierząt. Podkreśla, że zawartość tłuszczu decyduje o wydajności sera, a kazeina o jego strukturze.',
    },
    {
      question: "Jakie bakterie opisał Licznerski w 1922 roku?",
      answer:
        'Licznerski opisał bakterie kwasu mlekowego (Bacterium lactis acidi — dziś Lactococcus lactis), bakterie propionowe (odpowiedzialne za dziury w ementalerze), bakterie kwasu masłowego (Clostridium — szkodnik powodujący wzdęcia sera) oraz drożdże i pleśnie. Jego klasyfikacja jest zaskakująco bliska współczesnej, choć nazwy naukowe uległy zmianie.',
    },
    {
      question: "Czy Licznerski był za czy przeciw pasteryzacji?",
      answer:
        'Licznerski prezentuje obie strony — opisuje pasteryzację jako skuteczny sposób na zabicie patogenów, ale ostrzega, że niszczy również pożyteczne bakterie kwasu mlekowego i utrudnia krzepnięcie (przez denaturację białek serwatkowych i wiązanie wapnia). Zaleca pasteryzację w warunkach sanitarnie wątpliwych, ale nie jako regułę.',
    },
    {
      question: "Co to jest dojrzewanie mleka i dlaczego Licznerski uważał je za ważne?",
      answer:
        'Dojrzewanie mleka to kontrolowane zakwaszanie mleka przed dodaniem podpuszczki — mleko stoi w 10-15°C przez 12-24h, pH spada z ~6,7 do ~6,3-6,4. Licznerski uważał je za kluczowe: dojrzałe mleko daje twardszy skrzep, lepiej oddziela serwatkę i daje ser o pełniejszym smaku. Dziś tę funkcję pełnią kultury starterowe, ale zasada jest identyczna.',
    },
    {
      question: "Czy wiedza Licznerskiego o mleku jest jeszcze aktualna?",
      answer:
        'W znacznej części tak. Chemia mleka nie zmieniła się od 100 lat: kazeina nadal krzepnie pod wpływem podpuszczki, tłuszcz nadal decyduje o wydajności, a Clostridium nadal powoduje wzdęcia sera. Zmieniło się natomiast: sposób pozyskiwania mleka (mechaniczny udój, chłodzenie), analityka (MilkoScan zamiast laktodensymetru) i regulacje sanitarne (obowiązkowa pasteryzacja w handlu).',
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: 'Mleko wg Licznerskiego — Część I Praktycznego serowarstwa (1922)',
        description:
          'Analiza Części I "Praktycznego serowarstwa" Jana Licznerskiego (1922): skład chemiczny mleka, mikrobiologia, pasteryzacja, dojrzewanie mleka. Co z tej wiedzy obowiązuje po 100 latach.',
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/licznerski-mleko",
        image: "https://mojaserowarnia.pl/og-image.png",
        datePublished: "2026-07-23",
        author: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
        publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
        isPartOf: { "@type": "WebSite", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
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
          { "@type": "ListItem", position: 2, name: "Serowarstwo Staropolskie", item: "https://mojaserowarnia.pl/serowarstwo-staropolskie" },
          { "@type": "ListItem", position: 3, name: "Jan Licznerski", item: "https://mojaserowarnia.pl/licznerski" },
          { "@type": "ListItem", position: 4, name: "Mleko wg Licznerskiego", item: "https://mojaserowarnia.pl/licznerski-mleko" },
        ],
      },
    ],
  };

  const milkComposition = [
    { component: "Tłuszcz", cow: "3,2–4,5%", sheep: "6,0–7,5%", goat: "3,5–4,5%", role: "Wydajność sera, kremowość, smak" },
    { component: "Kazeina", cow: "2,5–2,8%", sheep: "4,0–4,5%", goat: "2,4–2,6%", role: "Skrzep, struktura sera" },
    { component: "Albumina", cow: "0,4–0,5%", sheep: "0,8–1,0%", goat: "0,4–0,5%", role: "Przechodzi do serwatki (ricotta!)" },
    { component: "Laktoza", cow: "4,5–5,0%", sheep: "4,2–4,8%", goat: "4,3–4,8%", role: "Pożywka dla bakterii (kwasowość)" },
    { component: "Sole mineralne", cow: "0,7%", sheep: "0,9%", goat: "0,8%", role: "Ca²⁺ = twardość skrzepu" },
    { component: "Woda", cow: "~87%", sheep: "~82%", goat: "~87%", role: "Nośnik, rozpuszczalnik" },
  ];

  const bacteria = [
    {
      old: "Bacterium lactis acidi",
      modern: "Lactococcus lactis",
      role: "Główna bakteria serowarstwa — zakwasza mleko, tworzy aromat",
      verdict: "Nazwa zmieniona, rola identyczna",
    },
    {
      old: "Bakterie propionowe",
      modern: "Propionibacterium freudenreichii",
      role: "Produkuje CO₂ (dziury w ementalerze) + kwas propionowy (smak orzechowy)",
      verdict: "Bez zmian — nadal jedyna droga do dziur",
    },
    {
      old: "Laseczki kwasu masłowego",
      modern: "Clostridium tyrobutyricum",
      role: "Szkodnik — rozkłada mleczan do masłanu, wzdyma ser, cuchnący smak",
      verdict: "Nadal wróg nr 1 serowarów",
    },
    {
      old: "Drożdże mlekowe",
      modern: "Kluyveromyces, Debaryomyces",
      role: "Rozkładają laktozę, pomagają w dojrzewaniu skórki",
      verdict: "Geotrichum/Debaryomyces — dziś celowo stosowane",
    },
    {
      old: "Pleśnie",
      modern: "Penicillium camemberti / roqueforti",
      role: "Dojrzewanie serów miękkich (biała) i niebieskich (zielona)",
      verdict: "Klasyfikacja ta sama, hodowla przemysłowa",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mleko wg Licznerskiego — Część I Praktycznego serowarstwa (1922)</title>
        <meta
          name="description"
          content='Skład chemiczny mleka, mikrobiologia, pasteryzacja i dojrzewanie mleka wg Jana Licznerskiego (1922). Analiza Części I "Praktycznego serowarstwa" — co z tej wiedzy obowiązuje po 100 latach.'
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/licznerski-mleko" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Serowarstwo Staropolskie", href: "/serowarstwo-staropolskie" },
          { label: "Jan Licznerski", href: "/licznerski" },
          { label: "Mleko wg Licznerskiego" },
        ]}
      />

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <PageHeader
          icon={ScrollText}
          color="amber"
          title="Mleko wg Licznerskiego"
          subtitle='Część I Praktycznego serowarstwa (1922) — wszystko, co serowar musi wiedzieć o mleku, zanim dotknie podpuszczki'
        />

        <div className="container mx-auto px-4 py-10 max-w-4xl">

          {/* Wprowadzenie */}
          <Card className="mb-10 border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-900/10">
            <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
              <p className="text-base">
                Pierwsza połowa <em>Praktycznego serowarstwa</em> nie mówi o serze.
                Mówi o <strong>mleku</strong> — i Licznerski nie widzi w tym żadnej
                sprzeczności. Bo ser to mleko, któremu serowar nadał formę.
                Kto nie rozumie mleka, ten robi ser na ślepo.
              </p>
              <p>
                Część I to ponad <strong>150 stron</strong> poświęconych chemii, fizyce
                i mikrobiologii mleka. Licznerski opisuje skład mleka krowiego, owczego
                i koziego, tłumaczy rolę każdego składnika, charakteryzuje bakterie
                pożyteczne i szkodliwe, a na koniec zmierza się z wielkim pytaniem epoki:
                {' '}<strong>pasteryzować czy nie?</strong>
              </p>
              <p>
                Pisał to w 1922 roku. Większość z tego, co napisał, obowiązuje do dziś.
              </p>
              <a
                href="https://fbc.pionier.net.pl/details/nn94rkt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Czytaj oryginał — Praktyczne serowarstwo (FBC)
              </a>
            </CardContent>
          </Card>

          {/* 1. Skład chemiczny mleka */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">1</span>
              Skład chemiczny mleka — fundament serowarstwa
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Licznerski otwiera Część I od tabeli składu mleka krowiego, owczego
                  i koziego. Nie po to, żeby imponować chemią, ale dlatego że{' '}
                  <strong>każdy składnik mleka ma konkretną funkcję w serowarni</strong>:
                  tłuszcz daje wydajność i kremowość, kazeina tworzy skrzep, laktoza
                  karmi bakterie, a sole wapnia decydują, czy skrzep będzie twardy
                  czy miękki jak galaretka.
                </p>
                <p>
                  Owcze mleko Licznerski opisuje jako <em>najwydajniejsze serowarsko</em> —
                  prawie dwukrotnie więcej tłuszczu i kazeiny niż krowie. Kozie — jako
                  {' '}<em>najtrudniejsze</em>: biały kolor (brak beta-karotenu), drobniejsze
                  kuleczki tłuszczu, delikatniejszy skrzep.
                </p>
              </CardContent>
            </Card>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-amber-50 dark:bg-amber-900/20">
                    <th className="border border-border px-3 py-2 text-left font-semibold">Składnik</th>
                    <th className="border border-border px-3 py-2 text-center font-semibold">🐄 Krowie</th>
                    <th className="border border-border px-3 py-2 text-center font-semibold">🐑 Owcze</th>
                    <th className="border border-border px-3 py-2 text-center font-semibold">🐐 Kozie</th>
                    <th className="border border-border px-3 py-2 text-left font-semibold">Rola w serowarni</th>
                  </tr>
                </thead>
                <tbody>
                  {milkComposition.map((row) => (
                    <tr key={row.component} className="hover:bg-muted/30">
                      <td className="border border-border px-3 py-2 font-medium">{row.component}</td>
                      <td className="border border-border px-3 py-2 text-center">{row.cow}</td>
                      <td className="border border-border px-3 py-2 text-center">{row.sheep}</td>
                      <td className="border border-border px-3 py-2 text-center">{row.goat}</td>
                      <td className="border border-border px-3 py-2 text-foreground/70">{row.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="pt-5">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                    ✓ Ponadczasowe
                  </p>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                    <li>Proporcje składników — wartości Licznerskiego mieszczą się w dzisiejszych normach</li>
                    <li>Owcze mleko = najwyższa wydajność sera (potwierdzane do dziś)</li>
                    <li>Kozie mleko = biały ser, drobniejszy skrzep, delikatniejszy smak</li>
                    <li>Tłuszcz + kazeina = klucz do wydajności sera</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="pt-5">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                    ⚠ Co się zmieniło
                  </p>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                    <li>Dziś znamy dokładne frakcje kazeiny (alpha-s1, beta, kappa) — Licznerski mówił ogólnie</li>
                    <li>Homogenizacja (nieznana w 1922) zmienia strukturę tłuszczu w mleku</li>
                    <li>Skład mierzymy MilkoScanem, nie laktodensymetrem</li>
                    <li>Rola witamin i enzymów natywnych — opisana dopiero po II wojnie</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 2. Tłuszcz — gwiazda mleka */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">2</span>
              Tłuszcz — gwiazda mleka serowarskiego
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Licznerski poświęca tłuszczowi więcej miejsca niż jakiemukolwiek innemu
                  składnikowi. Nie bez powodu — w 1922 roku tłuszcz był <strong>miarą
                  wartości mleka</strong>. Mleczarnie płaciły za mleko proporcjonalnie
                  do zawartości tłuszczu, a wydajność sera (kg sera z 100 L mleka)
                  była wprost powiązana z procentem tłuszczu.
                </p>
                <p>
                  Opisuje tłuszcz jako <em>kuleczki zawieszone w emulsji</em> — otoczone
                  błoną fosfolipidową, która chroni je przed łączeniem się w większe krople.
                  Zwraca uwagę, że <strong>rozmiar kuleczek zależy od gatunku
                  zwierzęcia</strong>: krowie kuleczki są największe (łatwiej odseparować
                  śmietanę), kozie — najmniejsze (mleko kozie trudno odtłuścić, za to
                  jest naturalnie zhomogenizowane).
                </p>
                <blockquote className="border-l-4 border-amber-400 dark:border-amber-600 pl-4 py-2 my-4 bg-amber-50/40 dark:bg-amber-900/10 rounded-r-lg">
                  <p className="italic text-foreground/80">
                    {'\''}Tłustość mleka jest najpewniejszą miarą jego wartości serowarskiej.
                    Ser z mleka tłustego jest zawsze lepszy, wydajniejszy i trwalszy
                    niż ser z mleka chudego.{'\''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    — J. Licznerski, <em>Praktyczne serowarstwo</em>, 1922
                  </p>
                </blockquote>
                <p>
                  Osobny podrozdział poświęca <strong>fałszowaniu mleka</strong> — rozcieńczaniu
                  wodą i odtłuszczaniu. Opisuje laktodensymetr (areometr mleczny) jako
                  podstawowe narzędzie do wykrywania oszustw: mleko rozcieńczone ma niższą
                  gęstość, odtłuszczone — wyższą niż normalne.
                </p>
              </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="pt-5">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                    ✓ Ponadczasowe
                  </p>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                    <li>Tłuszcz w emulsji otoczony błoną — dokładnie tak działa (model MFGM)</li>
                    <li>Kozie kuleczki mniejsze od krowích — potwierdzone</li>
                    <li>Wydajność sera koreluje z % tłuszczu — nadal fundamentalna zasada</li>
                    <li>Laktodensymetr — nadal używany (obok MilkoScanu)</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="pt-5">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                    ⚠ Co się zmieniło
                  </p>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                    <li>Homogenizacja (nieuznawana wtedy) rozbija kuleczki i zmienia krzepnięcie</li>
                    <li>Dziś wiemy, że nie sam % tłuszczu, ale stosunek tłuszcz/kazeina decyduje o jakości sera</li>
                    <li>Profil kwasów tłuszczowych (krótko-/długołańcuchowe) — nieznany w 1922</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 3. Kazeina — białko, które tworzy ser */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">3</span>
              Kazeina — białko, które tworzy ser
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Licznerski rozróżnia dwa typy białek mleka: <strong>kazeinę</strong>
                  {' '}(białko serowarskie, tworzące skrzep pod wpływem podpuszczki)
                  i <strong>albuminę</strong> (białko serwatkowe, przechodzące do serwatki
                  i odzyskiwane dopiero przez ogrzewanie — ricotta).
                </p>
                <p>
                  To rozróżnienie jest <em>fundamentalne</em> i obowiązuje do dziś.
                  Licznerski opisuje, jak kazeina krzepnie pod wpływem podpuszczki
                  (enzym chymozyna tnie kappa-kazeinę — choć w 1922 jeszcze tak tego
                  nie nazywano) i jak obecność jonów wapnia (Ca²⁺) wpływa na twardość
                  skrzepu.
                </p>
                <blockquote className="border-l-4 border-amber-400 dark:border-amber-600 pl-4 py-2 my-4 bg-amber-50/40 dark:bg-amber-900/10 rounded-r-lg">
                  <p className="italic text-foreground/80">
                    {'\''}Mleko pozbawione wapna nie krzepnie pod wpływem podpuszczki,
                    albo krzepnie bardzo słabo. Sole wapniowe są tak samo potrzebne
                    do zrobienia dobrego sera, jak sama podpuszczka.{'\''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    — J. Licznerski, <em>Praktyczne serowarstwo</em>, 1922
                  </p>
                </blockquote>
                <p>
                  To obserwacja, która tłumaczy, dlaczego dzisiejsi serowarzy dodają
                  chlorek wapnia (CaCl₂) do mleka pasteryzowanego — pasteryzacja
                  wiąże część wolnego wapnia, więc trzeba go uzupełnić. Licznerski
                  jeszcze tego nie wiedział (pasteryzacja nie była wtedy powszechna),
                  ale zidentyfikował mechanizm z chirurgiczną precyzją.
                </p>
              </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="pt-5">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                    ✓ Ponadczasowe
                  </p>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                    <li>Podział kazeina vs albumina — identyczny jak dziś</li>
                    <li>Rola Ca²⁺ w krzepnięciu — fundament technologii sera</li>
                    <li>Albumina odzyskiwana ogrzewaniem (ricotta) — tak samo</li>
                    <li>Mleko bez wapnia = słaby skrzep — potwierdzone</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="pt-5">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                    ⚠ Co się zmieniło
                  </p>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                    <li>Frakcje kazeiny (alpha-s1, alpha-s2, beta, kappa) — odkryte po 1950</li>
                    <li>Mechanizm działania chymozyny na kappa-kazeinę — opisany w latach 60.</li>
                    <li>Micele kazeinowe — ich struktura (model submiceli) to wiedza z XX/XXI w.</li>
                    <li>Polimorfizm kazeiny (A1/A2 beta-kazeina) — debata XXI wieku</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 4. Laktoza i kwasowość */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">4</span>
              Laktoza i kwasowość — paliwo fermentacji
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Laktozę Licznerski opisuje jako <em>cukier mlekowy</em> — substancję,
                  która sama w sobie nie ma wartości serowarskiej, ale jest{' '}
                  <strong>pożywką dla bakterii kwasu mlekowego</strong>. Bakterie
                  rozkładają laktozę do kwasu mlekowego, obniżając pH mleka — i to
                  właśnie kwasowość determinuje, czy skrzep będzie dobry, a ser smaczny.
                </p>
                <p>
                  Opisuje pomiar kwasowości metodą <strong>stopni Soxhleta-Henkela</strong>
                  {' '}(°SH) — systemem używanym w Europie Środkowej do dziś.
                  Świeże mleko ma 6,5–7,5 °SH. Mleko do sera twardego powinno
                  mieć 7–8 °SH (lekko dojrzałe). Powyżej 10 °SH — mleko jest
                  {' '}<em>za kwaśne</em> na sery podpuszczkowe, ale nadaje się
                  na twaróg kwasowy.
                </p>
                <p>
                  Zwraca też uwagę, że laktoza przechodzi częściowo do serwatki — dlatego
                  serwatka jest słodkawa i nadaje się do produkcji napojów fermentowanych
                  lub jako pasza.
                </p>
              </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="pt-5">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                    ✓ Ponadczasowe
                  </p>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                    <li>Laktoza → kwas mlekowy = fundament fermentacji — niezmienne</li>
                    <li>Stopnie SH — nadal stosowane w mleczarstwie PL/DE/AT</li>
                    <li>Kwasowość determinuje typ skrzepu — identycznie</li>
                    <li>Serwatka zawiera laktozę — tak (serwatka słodka ~4,5% laktozy)</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="pt-5">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                    ⚠ Co się zmieniło
                  </p>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                    <li>pH-metr zastąpił miareczkowanie jako szybsza metoda pomiaru</li>
                    <li>Nietolerancja laktozy — nieznana klinicznie w 1922, dziś argument za serami dojrzałymi (laktoza zfermentowana)</li>
                    <li>Galaktoza (produkt rozpadu laktozy) — jej rola w brązowieniu sera to wiedza z XXI w.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 5. Mikrobiologia mleka */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">5</span>
              Mikrobiologia — przyjaciele i wrogowie serowara
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  To jedna z najciekawszych części książki. Licznerski, praktyk bez
                  formalnego wykształcenia mikrobiologicznego, opisuje świat drobnoustrojów
                  mleka z <strong>precyzją, która zaskakuje do dziś</strong>. Dzieli je na
                  pożyteczne (bakterie kwasu mlekowego, propionowe, pleśnie szlachetne)
                  i szkodliwe (Clostridium, bakterie gnilne, koliformy).
                </p>
                <p>
                  Opisuje <em>Bacterium lactis acidi</em> (dziś <em>Lactococcus lactis</em>)
                  jako fundament serowarstwa — bakterię, która zakwasza mleko, hamuje
                  patogeny i nadaje serowi aromat. Propionowe opisuje jako{' '}
                  <strong>twórców dziur w ementalerze</strong> — obserwacja, która w 1922
                  roku nie była oczywista (mechanizm udowodniono laboratoryjnie dopiero
                  w latach 30.).
                </p>
                <blockquote className="border-l-4 border-amber-400 dark:border-amber-600 pl-4 py-2 my-4 bg-amber-50/40 dark:bg-amber-900/10 rounded-r-lg">
                  <p className="italic text-foreground/80">
                    {'\''}Bakterie kwasu mlekowego są najlepszym przyjacielem serowara.
                    One same bronią mleka przed psuciem się, kwaszą je równomiernie
                    i nadają serowi smak. Bez nich serowarstwo byłoby niemożliwe.{'\''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    — J. Licznerski, <em>Praktyczne serowarstwo</em>, 1922
                  </p>
                </blockquote>
              </CardContent>
            </Card>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-amber-50 dark:bg-amber-900/20">
                    <th className="border border-border px-3 py-2 text-left font-semibold">Nazwa u Licznerskiego</th>
                    <th className="border border-border px-3 py-2 text-left font-semibold">Nazwa współczesna</th>
                    <th className="border border-border px-3 py-2 text-left font-semibold">Rola</th>
                    <th className="border border-border px-3 py-2 text-left font-semibold">Status po 100 latach</th>
                  </tr>
                </thead>
                <tbody>
                  {bacteria.map((row) => (
                    <tr key={row.old} className="hover:bg-muted/30">
                      <td className="border border-border px-3 py-2 italic">{row.old}</td>
                      <td className="border border-border px-3 py-2 font-medium">{row.modern}</td>
                      <td className="border border-border px-3 py-2 text-foreground/70">{row.role}</td>
                      <td className="border border-border px-3 py-2 text-foreground/70">{row.verdict}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Card className="border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10">
              <CardContent className="pt-5">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                  ⛔ Wróg nr 1: Clostridium (laseczki kwasu masłowego)
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Licznerski poświęca temu tematowi osobny podrozdział. Clostridium
                  tworzy przetrwalniki (spory), które przeżywają pasteryzację,
                  a potem rozmnażają się w serze — <strong>rozkładają kwas mlekowy
                  do kwasu masłowego</strong>, produkują gaz (wzdęcia późne)
                  i nadają serowi cuchnący smak. Jego rada: <em>mleko od krów
                  karmionych złą kiszonką to mleko skazane na wzdęcia</em>.
                  Dokładnie to samo mówi dziś każdy podręcznik mleczarstwa.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 6. Pasteryzacja — wielka debata */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">6</span>
              Pasteryzacja — wielka debata 1922 roku
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Pasteryzacja w 1922 roku nie była oczywistością. Wielu serowarów
                  uważało ją za <em>niepotrzebną ingerencję</em> — niszczy naturalną
                  mikroflorę mleka, utrudnia krzepnięcie i daje ser{' '}
                  <strong>mniej smaczny</strong>. Licznerski prezentuje obie strony
                  z uczciwością praktyka.
                </p>
                <p>
                  <strong>Za pasteryzacją:</strong> zabija patogeny (gruźlica, bruceloza,
                  tyfus — realne zagrożenia w 1922 r.), ujednolica mikroflorę mleka,
                  pozwala serowarowi kontrolować fermentację od zera (dodając własne
                  kultury).
                </p>
                <p>
                  <strong>Przeciw:</strong> niszczy naturalne bakterie kwasu mlekowego
                  (mleko surowe zakwasza się samo, pasteryzowane — nie), wiąże
                  wolny wapń (gorszy skrzep), denaturuje albuminę (zmienia strukturę
                  serwatki). Ser z mleka surowego ma <em>bardziej złożony smak</em>.
                </p>
                <blockquote className="border-l-4 border-amber-400 dark:border-amber-600 pl-4 py-2 my-4 bg-amber-50/40 dark:bg-amber-900/10 rounded-r-lg">
                  <p className="italic text-foreground/80">
                    {'\''}Pasteryzowanie mleka serowarskiego jest środkiem dobrym tam,
                    gdzie higiena produkcji mleka stoi na niskim poziomie.
                    Gdzie mleko jest czyste — lepiej go nie pasteryzować.{'\''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    — J. Licznerski, <em>Praktyczne serowarstwo</em>, 1922
                  </p>
                </blockquote>
              </CardContent>
            </Card>

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-amber-50 dark:bg-amber-900/20">
                    <th className="border border-border px-3 py-2 text-left font-semibold">Aspekt</th>
                    <th className="border border-border px-3 py-2 text-left font-semibold">Licznerski (1922)</th>
                    <th className="border border-border px-3 py-2 text-left font-semibold">Dziś</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-muted/30">
                    <td className="border border-border px-3 py-2 font-medium">Temperatura</td>
                    <td className="border border-border px-3 py-2">60–65°C / 15–30 min</td>
                    <td className="border border-border px-3 py-2">63°C/30 min (LTLT) lub 72°C/15s (HTST)</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="border border-border px-3 py-2 font-medium">Cel</td>
                    <td className="border border-border px-3 py-2">Zabić patogeny (gruźlica!)</td>
                    <td className="border border-border px-3 py-2">Zabić patogeny + bezpieczeństwo prawne (wymóg RHD)</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="border border-border px-3 py-2 font-medium">Efekt na skrzep</td>
                    <td className="border border-border px-3 py-2">Gorszy — słabszy, wolniej krzepnie</td>
                    <td className="border border-border px-3 py-2">Rozwiązanie: dodanie CaCl₂ (0,2–0,3 g/L)</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="border border-border px-3 py-2 font-medium">Efekt na smak</td>
                    <td className="border border-border px-3 py-2">Uboższy — brak naturalnej mikroflory</td>
                    <td className="border border-border px-3 py-2">Kompensowane kulturami starterowymi</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="border border-border px-3 py-2 font-medium">Rekomendacja</td>
                    <td className="border border-border px-3 py-2">Tylko przy złej higienie</td>
                    <td className="border border-border px-3 py-2">Obowiązkowa w RHD (sprzedaż), opcjonalna do użytku własnego</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 7. Dojrzewanie mleka */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">7</span>
              Dojrzewanie mleka przed zaprawianiem
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Dla Licznerskiego <strong>dojrzewanie mleka</strong> to kluczowy etap,
                  który dzisiejsi serowarzy domowi często pomijają. Polega na{' '}
                  <em>kontrolowanym przechowywaniu mleka w 10–15°C przez 12–24 godziny</em>,
                  aż pH spadnie z ~6,7 do ~6,3–6,4. W tym czasie naturalne bakterie
                  kwasu mlekowego mnożą się i delikatnie zakwaszają mleko.
                </p>
                <p>
                  Efekty, które opisuje Licznerski:
                </p>
                <ul className="list-disc list-inside space-y-1 text-foreground/80">
                  <li><strong>Twardszy skrzep</strong> — zakwaszone mleko krzepnie szybciej i mocniej</li>
                  <li><strong>Lepsza separacja serwatki</strong> — skrzep łatwiej oddaje wodę</li>
                  <li><strong>Pełniejszy smak</strong> sera dojrzałego</li>
                  <li><strong>Ochrona mikrobiologiczna</strong> — bakterie kwasowe wypierają patogeny</li>
                </ul>
                <p className="mt-3">
                  Dziś tę funkcję pełnią <strong>kultury starterowe</strong> — dodawane
                  do mleka 30–60 minut przed podpuszczką. Ale zasada jest identyczna:
                  mleko musi być lekko zakwaszone, zanim dotknie go podpuszczka.
                  Sery rzemieślnicze (Comté, Beaufort, Parmigiano) nadal stosują
                  dojrzewanie mleka w tradycyjny sposób.
                </p>
              </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="pt-5">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                    ✓ Ponadczasowe
                  </p>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                    <li>Zakwaszenie przed zaprawianiem = lepszy skrzep — złota reguła</li>
                    <li>pH 6,3–6,4 jako cel — zgodne z dzisiejszą praktyką</li>
                    <li>Comté, Beaufort, Parmigiano — nadal dojrzewają mleko tradycyjnie</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="pt-5">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                    ⚠ Co się zmieniło
                  </p>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                    <li>Kultury starterowe (liofilizowane, o znanym składzie) zastąpiły naturalne dojrzewanie</li>
                    <li>pH-metr zastąpił papierki lakmusowe i doświadczenie</li>
                    <li>Czas skrócony z 12–24h do 30–60 min dzięki skoncentrowanym kulturom</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 8. Higiena i czystość mleka */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">8</span>
              Higiena mleka — czystość chemiczna, nie tylko wizualna
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Licznerski poświęca dużo miejsca higienie — nie tyle z moralizatorstwa,
                  co z <strong>praktycznej potrzeby</strong>. Brudne mleko = zły ser.
                  Kropka. Opisuje:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-foreground/80">
                  <li><strong>Mycie wymion</strong> przed udojem — ciepłą wodą, potem osuszenie</li>
                  <li><strong>Pierwsza struga mleka</strong> — odrzucić (zawiera bakterie z kanału strzykowego)</li>
                  <li><strong>Czyszczenie sprzętu</strong> — gorącą wodą z sodą, potem parowanie</li>
                  <li><strong>Cedzenie mleka</strong> — przez gęste płótno lub watę, natychmiast po udoju</li>
                  <li><strong>Schłodzenie</strong> — jak najszybciej do 10–12°C (w tamtych czasach: lód, piwnica, bieżąca woda)</li>
                </ul>
                <p>
                  Podkreśla, że <em>mleko wyglądem czyste może być bakteriologicznie brudne</em>.
                  Wizualna czystość nie gwarantuje czystości mikrobiologicznej —
                  obserwacja identyczna z tą z Encyklopedyi rolniczej, ale Licznerski
                  podaje konkretne procedury, a nie tylko zasadę.
                </p>
                <blockquote className="border-l-4 border-amber-400 dark:border-amber-600 pl-4 py-2 my-4 bg-amber-50/40 dark:bg-amber-900/10 rounded-r-lg">
                  <p className="italic text-foreground/80">
                    {'\''}Mleko, które wygląda czysto, może być pełne bakterii.
                    A mleko, które przefiltrowano przez watę, może być czystsze
                    od tego, co wygląda jak kryształ. Czystość mleka mierzy się
                    nie okiem, lecz próbą reduktazy.{'\''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    — J. Licznerski, <em>Praktyczne serowarstwo</em>, 1922
                  </p>
                </blockquote>
              </CardContent>
            </Card>
          </section>

          {/* Podsumowanie — co przetrwało */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Podsumowanie — co z Części I przetrwało 100 lat
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <Card className="border-green-200 dark:border-green-800 bg-green-50/20 dark:bg-green-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-green-700 dark:text-green-400">
                    ✓ Obowiązuje bez zmian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                    <li>Skład mleka (tłuszcz, kazeina, laktoza, Ca²⁺) i ich rola</li>
                    <li>Owcze = najwydajniejsze, kozie = najtrudniejsze</li>
                    <li>LAB jako fundament serowarstwa</li>
                    <li>Clostridium = wróg (kiszonka = ryzyko)</li>
                    <li>Propionowe = dziury w ementalerze</li>
                    <li>Dojrzewanie mleka przed zaprawianiem</li>
                    <li>Higiena = czystość chemiczna &gt; wizualna</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-amber-700 dark:text-amber-400">
                    ⚠ Wymaga aktualizacji
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                    <li>Nazwy bakterii (zmiana taksonomii)</li>
                    <li>Pasteryzacja — dziś wymagana w RHD</li>
                    <li>Kultury starterowe (liofilizowane, o znanym składzie)</li>
                    <li>CaCl₂ do mleka pasteryzowanego</li>
                    <li>Instrumenty pomiarowe (pH-metr, MilkoScan)</li>
                    <li>Homogenizacja i jej wpływ na ser</li>
                    <li>Frakcje kazeiny, profil kwasów tłuszczowych</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Najczęstsze pytania
            </h2>
            <div className="space-y-4">
              {faqData.map((faq) => (
                <Card key={faq.question}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Źródła */}
          <section className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Przeczytaj sam — jest za darmo
            </h2>
            <div className="flex flex-col gap-3">
              <a
                href="https://fbc.pionier.net.pl/details/nn94rkt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Federacja Bibliotek Cyfrowych — skan oryginału z 1922 roku
              </a>
              <a
                href="http://szkoladomowegomasarstwa.pl/docs/serowarstwo.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                PDF — Szkoła Domowego Masarstwa
              </a>
            </div>
          </section>

          {/* SeeAlso */}
          <SeeAlso
            links={[
              { title: "Jan Licznerski — biografia", href: "/licznerski", description: "Kim był autor Praktycznego serowarstwa" },
              { title: "9 warunków jakości mleka wg Kleckiego", href: "/klecki-jakosc-mleka", description: "Akademickie spojrzenie na jakość mleka (UJ 1900)" },
              { title: "Encyklopedya rolnicza — Serowarstwo", href: "/encyklopedia-serowarstwo", description: "Ponadczasowa wiedza z ~1900 roku" },
              { title: "Bakterie i kultury — przewodnik", href: "/bakterie-kultury", description: "Współczesna wiedza o mikrobiologii sera" },
              { title: "Kalkulator solanki i CaCl₂", href: "/kalkulator-solanki", description: "Oblicz dawkę chlorku wapnia do mleka" },
              { title: "Klasyka polskiego serowarstwa", href: "/klasyka-serowarstwa", description: "Przegląd źródeł w domenie publicznej" },
            ]}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LicznerskiMleko;
