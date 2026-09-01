import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SeeAlso from "@/components/SeeAlso";

const EncyklopediaSerowarstwo = () => {
  const faqData = [
    {
      question: "Czym jest Encyklopedya rolnicza i gdzie ją przeczytać?",
      answer:
        'Encyklopedya rolnicza to wielotomowe polskie kompendium wiedzy rolniczej wydawane od lat 1890-ych w Warszawie. Tom IX (hasła od "Plenipotencja" do "Serowarstwo") zawiera obszerny artykuł encyklopedyczny o produkcji sera. Skan jest dostepny bezplatnie na Polona.pl — Biblioteka Narodowa.',
    },
    {
      question: "Czy wiedza sprzed 125 lat jest wiarygodna?",
      answer:
        'Fizyka i chemia mleka nie zmieniły się od tamtego czasu. Kazeina krzepnie pod wpływem podpuszczki w ten sam sposób co w 1900 roku. Encyklopedia opisuje te procesy z precyzją potwierdzoną przez współczesną naukę. Zmieniło się natomiast otoczenie: kultury starterowe, pasteryzacja, regulacje sanitarne — dlatego na stronie Moja Serowarnia każdy temat jest konfrontowany z dzisiejszą wiedzą.',
    },
    {
      question: "Dlaczego encyklopedia nie podaje autora hasła Serowarstwo?",
      answer:
        "W encyklopediach z przełomu XIX i XX wieku artykuły pisali specjaliści zaproszeni przez redakcję, ale hasła często nie były sygnowane nazwiskiem. To był standard wydawniczy tamtej epoki — treść miała reprezentować stan wiedzy, nie indywidualnego autora.",
    },
    {
      question: "Czy mogę stosować dawki i temperatury z encyklopedii wprost?",
      answer:
        'Temperatury — tak, bo skala Celsjusza i fizyka się nie zmieniły. Dawki podpuszczki — z ostrożnością, bo dawna podpuszczka cielęca miała inną siłę niż dzisiejsze preparaty mikrobiologiczne. Do przeliczenia użyj kalkulatora Beaugel na mojaserowarnia.pl. Czasy krzepnięcia i dojrzewania — kierunkowo tak, ale zawsze obserwuj skrzep, nie zegarek.',
    },
    {
      question: "Jaka jest różnica między wiedzą z encyklopedii a współczesnymi blogami o serach?",
      answer:
        "Encyklopedia opisuje zasady — dlaczego coś działa. Blogi opisują przepisy — co zrobić krok po kroku. Jedno nie zastępuje drugiego. Serowar, który rozumie zasady z encyklopedii, potrafi zmodyfikować przepis, gdy mleko zachowuje się inaczej niż zwykle. Serowar, który zna tylko przepis, jest bezradny, gdy coś pójdzie nie tak.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: 'Encyklopedya rolnicza — ponadczasowa wiedza o serowarstwie (ok. 1900)',
        description:
          'Analiza hasła "Serowarstwo" z tomu IX Encyklopedyi rolniczej (~1900). Co z tej wiedzy obowiązuje do dziś, a co się zmieniło. Chemia mleka, koagulacja, klasyfikacja serów, dojrzewanie.',
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/encyklopedia-serowarstwo",
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
          { "@type": "ListItem", position: 3, name: "Encyklopedya rolnicza — Serowarstwo", item: "https://mojaserowarnia.pl/encyklopedia-serowarstwo" },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Serowarstwo Staropolskie", href: "/serowarstwo-staropolskie" },
          { label: "Encyklopedya rolnicza — Serowarstwo" },
        ]}
      />

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <PageHeader
          icon={ScrollText}
          color="amber"
          title="Encyklopedya rolnicza — Serowarstwo"
          subtitle='Ponadczasowa wiedza z hasła "Serowarstwo" (tom IX, ok. 1900) — co obowiązuje do dziś'
        />

        <div className="container mx-auto px-4 py-10 max-w-4xl">

          {/* Wprowadzenie */}
          <Card className="mb-10 border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-900/10">
            <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
              <p>
                <em>Encyklopedya rolnicza</em> to monumentalne polskie kompendium wiedzy rolniczej
                z przełomu XIX i XX wieku. <strong>Tom IX</strong> — obejmujący hasła od
                {' '}<em>Plenipotencja</em> do <em>Serowarstwo</em> — kończy się obszernym
                artykułem encyklopedycznym poświęconym w całości produkcji sera.
              </p>
              <p>
                Hasło nie jest podpisane nazwiskiem autora (standard encyklopedyczny tamtej epoki),
                ale obejmuje <strong>kilkadziesiąt stron gęstego druku</strong>: od chemii mleka,
                przez klasyfikację serów, po wyposażenie serowarni i warunki dojrzewalni.
                To nie przepis na jeden ser — to <strong>kompletny podręcznik zasad</strong>,
                z których większość obowiązuje do dziś.
              </p>
              <p>
                Na tej stronie analizujemy, co z tej wiedzy jest ponadczasowe — i uczciwie
                zaznaczamy, co się zmieniło.
              </p>
              <a
                href="https://polona.pl/item/encyklopedya-rolnicza-t-9-plenipotencya-serowarstwo,MTMxMDAyMDU0/152/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Czytaj oryginał na Polonie — Encyklopedya rolnicza T.9
              </a>
            </CardContent>
          </Card>

          {/* 1. Mleko jako surowiec */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">1</span>
              Mleko jako surowiec — skład i znaczenie
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Encyklopedia otwiera hasło od <strong>składu mleka</strong> — i słusznie,
                  bo skład mleka determinuje wszystko: wydajność, strukturę skrzepu, smak
                  dojrzałego sera. Opisuje cztery kluczowe składniki: tłuszcz, kazeinę (białko
                  serowarskie), cukier mlekowy (laktozę) i sole mineralne (głównie wapń i fosfor).
                </p>
                <p>
                  To samo rozumienie obowiązuje do dziś. Współczesna analiza mleka (Milkoscan,
                  refraktometr) mierzy dokładnie te parametry, które encyklopedia uznała za
                  decydujące 125 lat temu.
                </p>
              </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="pt-5">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                    ✓ Ponadczasowe
                  </p>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                    <li>Tłuszcz + kazeina = wydajność sera (im więcej, tym więcej sera z litra)</li>
                    <li>Laktoza to pożywka dla bakterii kwasu mlekowego</li>
                    <li>Wapń decyduje o twardości skrzepu</li>
                    <li>Mleko od różnych krów daje różny ser</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="pt-5">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                    ⚠ Co się zmieniło
                  </p>
                  <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                    <li>Pasteryzacja zmienia strukturę białek i wymaga dodawania CaCl₂</li>
                    <li>Homogenizacja rozbija kuleczki tłuszczu — inny skrzep</li>
                    <li>Dziś mierzymy skład instrumentalnie, nie organoleptycznie</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 2. Koagulacja */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">2</span>
              Koagulacja — jak mleko staje się serem
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Encyklopedia opisuje dwie drogi krzepnięcia mleka: <strong>koagulację
                  podpuszczkową</strong> (enzymatyczną) i <strong>koagulację kwasową</strong>{' '}
                  (przez zakwaszenie). Wyjaśnia, że podpuszczka — enzym z żołądka cielęcego —
                  działa na kazeinę, powodując jej nieodwracalne wytrącenie w obecności jonów
                  wapnia.
                </p>
                <p>
                  To opis, który mógłby pojawić się w dzisiejszym podręczniku technologii mleka.
                  Mechanizm enzymatyczny koagulacji (chymozyna rozcina wiązanie Phe₁₀₅-Met₁₀₆
                  w κ-kazeinie) został odkryty dopiero w latach 1960-ych — ale empiryczny opis
                  z encyklopedii jest dokładnie spójny z późniejszym wyjaśnieniem molekularnym.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-4 border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/10">
              <CardContent className="pt-5">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
                  Kluczowa obserwacja encyklopedii
                </p>
                <blockquote className="text-base italic leading-relaxed text-foreground border-l-2 border-amber-400 pl-4">
                  Im wyższa temperatura mleka (do pewnej granicy), tem szybciej działa podpuszczka
                  i tem twardszy powstaje skrzep — lecz powyżej pewnej temperatury enzym traci
                  swoją moc.
                </blockquote>
                <p className="text-xs text-muted-foreground mt-2">
                  Parafraza opisu z hasła <em>Serowarstwo</em>. Dziś wiemy: optimum chymozyny
                  to 40–42°C, denaturacja powyżej 65°C.
                </p>
              </CardContent>
            </Card>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 border border-border font-semibold">Parametr</th>
                    <th className="text-left px-3 py-2 border border-border font-semibold">Encyklopedia (~1900)</th>
                    <th className="text-left px-3 py-2 border border-border font-semibold">Dzisiejsza wiedza</th>
                    <th className="text-left px-3 py-2 border border-border font-semibold">Zgodność</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 border border-border font-medium">Temperatura zaprawiania</td>
                    <td className="px-3 py-2 border border-border">30–35°C (optymalna)</td>
                    <td className="px-3 py-2 border border-border">30–35°C (standard serowarstwa)</td>
                    <td className="px-3 py-2 border border-border text-green-600 dark:text-green-400 font-bold">100%</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="px-3 py-2 border border-border font-medium">Czas krzepnięcia</td>
                    <td className="px-3 py-2 border border-border">20–40 minut</td>
                    <td className="px-3 py-2 border border-border">25–45 min (zależnie od sera)</td>
                    <td className="px-3 py-2 border border-border text-green-600 dark:text-green-400 font-bold">~90%</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-border font-medium">Dawka podpuszczki</td>
                    <td className="px-3 py-2 border border-border">Opisowo, wg doświadczenia</td>
                    <td className="px-3 py-2 border border-border">Precyzyjnie wg siły IMCU</td>
                    <td className="px-3 py-2 border border-border text-amber-600 dark:text-amber-400 font-bold">Kierunek OK</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="px-3 py-2 border border-border font-medium">Rola wapnia</td>
                    <td className="px-3 py-2 border border-border">Konieczny do powstania skrzepu</td>
                    <td className="px-3 py-2 border border-border">Ca²⁺ wiąże para-kazeinę w sieć</td>
                    <td className="px-3 py-2 border border-border text-green-600 dark:text-green-400 font-bold">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. Obróbka skrzepu */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">3</span>
              Obróbka skrzepu — cięcie, mieszanie, podgrzewanie
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Encyklopedia szczegółowo opisuje trzy operacje, które decydują o typie sera:
                  <strong> cięcie skrzepu</strong> (im drobniejszy, tym twardszy ser),{' '}
                  <strong>mieszanie</strong> (wypłukuje serwatkę z ziarna) i{' '}
                  <strong>podgrzewanie masy serowej</strong> (dotrzymywanie — przy wyższych
                  temperaturach ziarno kurczy się i oddaje więcej wilgoci).
                </p>
                <p>
                  Te trzy operacje to absolutny fundament serowarstwa — i nie zmieniły się
                  od 125 lat. Współczesna serowarnia rzemieślnicza wykonuje je identycznie
                  jak opisano w encyklopedii. Zmieniło się narzędzie (harfa serowa zamiast
                  drewnianego noża), ale zasada jest ta sama.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🔪</span>
                  </div>
                  <p className="font-semibold text-sm mb-1">Cięcie</p>
                  <p className="text-xs text-muted-foreground">
                    Drobne ziarno → ser twardy (gouda, ementaler).
                    Duże kawałki → ser miękki (camembert, brie).
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🌀</span>
                  </div>
                  <p className="font-semibold text-sm mb-1">Mieszanie</p>
                  <p className="text-xs text-muted-foreground">
                    Delikatne mieszanie wypłukuje serwatkę z ziarna
                    i zapobiega zlepianiu się kawałków.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🌡️</span>
                  </div>
                  <p className="font-semibold text-sm mb-1">Podgrzewanie</p>
                  <p className="text-xs text-muted-foreground">
                    38–55°C zależnie od sera. Im wyższa temperatura,
                    tym bardziej suche i elastyczne ziarno.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 4. Klasyfikacja serów */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">4</span>
              Klasyfikacja serów — systematyka, która przetrwała
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Encyklopedia dzieli sery według <strong>twardości</strong> (miękkie, półtwarde,
                  twarde) i <strong>metody koagulacji</strong> (podpuszczkowe vs kwasowe).
                  To ta sama systematyka, którą stosuje się do dziś — Codex Alimentarius
                  i polskie normy PN-A-86300 używają klasyfikacji opartej na zawartości wody,
                  co przekłada się bezpośrednio na podział encyklopedyczny.
                </p>
              </CardContent>
            </Card>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 border border-border font-semibold">Kategoria encyklopedii</th>
                    <th className="text-left px-3 py-2 border border-border font-semibold">Przykłady wymieniane</th>
                    <th className="text-left px-3 py-2 border border-border font-semibold">Dzisiejszy odpowiednik</th>
                    <th className="text-left px-3 py-2 border border-border font-semibold">Wilgotność</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 border border-border font-medium">Sery miękkie</td>
                    <td className="px-3 py-2 border border-border">Limburski, brie, neufchâtel</td>
                    <td className="px-3 py-2 border border-border">Soft cheese (MFFB &gt; 67%)</td>
                    <td className="px-3 py-2 border border-border">Wysoka</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="px-3 py-2 border border-border font-medium">Sery półtwarde</td>
                    <td className="px-3 py-2 border border-border">Holenderski (gouda/edam), tilsit</td>
                    <td className="px-3 py-2 border border-border">Semi-hard (MFFB 54–69%)</td>
                    <td className="px-3 py-2 border border-border">Średnia</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-border font-medium">Sery twarde</td>
                    <td className="px-3 py-2 border border-border">Ementalski, gruyère, parmezan</td>
                    <td className="px-3 py-2 border border-border">Hard (MFFB 49–56%)</td>
                    <td className="px-3 py-2 border border-border">Niska</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="px-3 py-2 border border-border font-medium">Sery kwasowe (twarogowe)</td>
                    <td className="px-3 py-2 border border-border">Twaróg, ser biały</td>
                    <td className="px-3 py-2 border border-border">Acid-curd / fresh cheese</td>
                    <td className="px-3 py-2 border border-border">Bardzo wysoka</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. Solenie */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">5</span>
              Solenie — nie tylko smak, ale technologia
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Encyklopedia poświęca soleniu osobny rozdział i wyraźnie rozróżnia trzy metody:
                  <strong> solenie suche</strong> (nacieranie solą powierzchni),{' '}
                  <strong>solankę</strong> (kąpiel w roztworze soli) i{' '}
                  <strong>solenie w masie</strong> (dodawanie soli do pokrojonego skrzepu przed
                  formowaniem).
                </p>
                <p>
                  Co ważniejsze, encyklopedia tłumaczy <em>dlaczego</em> solenie jest konieczne
                  — nie tylko dla smaku. Sól hamuje rozwój niepożądanych bakterii, reguluje
                  aktywność wody (a<sub>w</sub>), wpływa na teksturę sera (ściąga białko,
                  tworzy skórkę) i kontroluje tempo dojrzewania.
                </p>
                <p>
                  Wszystkie te funkcje soli opisane w encyklopedii są potwierdzone przez
                  współczesną naukę o żywności. Jedyna zmiana: dziś precyzyjnie kontrolujemy
                  stężenie solanki (18–22° Baumé), czego encyklopedia nie mierzyła instrumentalnie.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  method: "Solenie suche",
                  enc: "Nacieranie sobie każdej strony sera solą — 2–3 razy dziennie przez kilka dni",
                  today: "Nadal stosowane w camembert, stilton, parmigiano. Daje grubszą skórkę.",
                },
                {
                  method: "Solanka",
                  enc: "Kąpiel sera w mocnym roztworze soli — od kilku godzin do kilku dni",
                  today: 'Standard dla gouda, edam, większości serów półtwardych. Stężenie 18–22° Baumé.',
                },
                {
                  method: "Solenie w masie",
                  enc: "Dodawanie soli do pokrojonego skrzepu przed prasowaniem",
                  today: "Typowe dla cheddara. Daje równomierny rozkład soli w całym serze.",
                },
              ].map((s) => (
                <Card key={s.method}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{s.method}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <p><span className="font-semibold text-amber-700 dark:text-amber-400">Encyklopedia:</span> {s.enc}</p>
                    <p><span className="font-semibold text-green-700 dark:text-green-400">Dziś:</span> {s.today}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 6. Dojrzewanie */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">6</span>
              Dojrzewanie — cierpliwość nagrodzona smakiem
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Encyklopedia wymienia <strong>trzy warunki dojrzewania</strong>: temperaturę
                  (10–15°C), wilgotność (85–95%) i cyrkulację powietrza. Opisuje, że dojrzewanie
                  to nie bierne leżakowanie, lecz <strong>aktywny proces biochemiczny</strong> —
                  bakterie i enzymy rozkładają białko i tłuszcz, tworząc smak i aromat sera.
                </p>
                <p>
                  To rozumienie było zadziwiająco nowoczesne jak na rok ~1900. Encyklopedia
                  nie znała jeszcze szczegółów (proteoliza, lipoliza, glikoliza jako trzy
                  szlaki dojrzewania), ale empirycznie opisała ich efekty z precyzją godną
                  podziwu.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-4 border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/10">
              <CardContent className="pt-5">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
                  Obserwacja encyklopedii
                </p>
                <blockquote className="text-base italic leading-relaxed text-foreground border-l-2 border-amber-400 pl-4">
                  Piwnica serowarni powinna być sucha lecz nie za sucha, chłodna lecz nie zimna,
                  i&nbsp;wietrzona lecz bez przeciągu — gdyż każda z tych skrajności psuje ser inaczej.
                </blockquote>
                <p className="text-xs text-muted-foreground mt-2">
                  Parafraza z hasła <em>Serowarstwo</em>. Współcześnie: T = 10–14°C, RH = 85–95%,
                  wymiana powietrza 2–4×/dobę — ale zasada jest identyczna.
                </p>
              </CardContent>
            </Card>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 border border-border font-semibold">Problem</th>
                    <th className="text-left px-3 py-2 border border-border font-semibold">Encyklopedia (~1900)</th>
                    <th className="text-left px-3 py-2 border border-border font-semibold">Współczesne wyjaśnienie</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 border border-border font-medium">Za sucha piwnica</td>
                    <td className="px-3 py-2 border border-border">Skórka pęka, ser wysycha i twardnieje za szybko</td>
                    <td className="px-3 py-2 border border-border">RH &lt; 80% = nadmierna utrata wilgoci, gradient wilgotności pęka skórkę</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="px-3 py-2 border border-border font-medium">Za wilgotna piwnica</td>
                    <td className="px-3 py-2 border border-border">Na serze rośnie pleśń, skórka się rozpuszcza</td>
                    <td className="px-3 py-2 border border-border">RH &gt; 98% = idealne warunki dla Mucor i Penicillium; proteoliza skórki</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-border font-medium">Za ciepło</td>
                    <td className="px-3 py-2 border border-border">Ser dojrzewa zbyt szybko, gorzki smak</td>
                    <td className="px-3 py-2 border border-border">T &gt; 18°C = nadmierna proteoliza, goryczka z peptydów hydrofobowych</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="px-3 py-2 border border-border font-medium">Za zimno</td>
                    <td className="px-3 py-2 border border-border">Ser nie dojrzewa, smak mdły i kwaśny</td>
                    <td className="px-3 py-2 border border-border">T &lt; 6°C = enzymy praktycznie nieaktywne, brak rozwoju smaku</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 7. Higiena */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">7</span>
              Higiena i czystość — fundament, który nie starzeje się nigdy
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Encyklopedia poświęca higienie serowarni zaskakująco dużo miejsca — opisuje
                  mycie naczyń gorącą wodą, parzenie kadzi i form, suszenie na słońcu.
                  Podkreśla, że <strong>brud i resztki starego mleka</strong> to główna przyczyna
                  wadliwych serów.
                </p>
                <p>
                  To absolutnie ponadczasowe. Współczesne serowarstwo (zarówno przemysłowe,
                  jak i domowe) opiera się na dokładnie tej samej zasadzie: <strong>czystość
                  chemiczna</strong> (brak resztek organicznych) ważniejsza niż wizualna.
                  Zmienił się środek (dawniej: gorąca woda + słońce; dziś: detergenty
                  zasadowe + kwasowe, sterylizacja parą) — ale zasada jest ta sama.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* 8. Ekonomika */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-bold items-center justify-center shrink-0">8</span>
              Ekonomika — ile sera z litra mleka?
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  Encyklopedia podaje wydajność: z <strong>10 litrów mleka</strong> około{' '}
                  <strong>1–1,5 kg sera twardego</strong> lub <strong>1,5–2 kg sera miękkiego</strong>.
                  To wartości zaskakująco zbliżone do współczesnych — różnica wynika głównie
                  z tego, że mleko od ówczesnych ras (polska czerwona, krajowa) miało nieco
                  inny skład niż dzisiejsze mleko od holsztynów.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="pt-5">
                  <p className="font-semibold text-sm mb-3 text-amber-700 dark:text-amber-400">
                    Wydajność wg encyklopedii (~1900)
                  </p>
                  <ul className="text-sm space-y-1.5 text-foreground/80">
                    <li>Ser twardy (ementalski): <strong>10 L → ~1 kg</strong></li>
                    <li>Ser półtwardy (holenderski): <strong>10 L → ~1,3 kg</strong></li>
                    <li>Ser miękki (limburski): <strong>10 L → ~1,8 kg</strong></li>
                    <li>Twaróg: <strong>10 L → ~2 kg</strong></li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="pt-5">
                  <p className="font-semibold text-sm mb-3 text-green-700 dark:text-green-400">
                    Wydajność dzisiejsza (mleko 3,5% T / 3,3% B)
                  </p>
                  <ul className="text-sm space-y-1.5 text-foreground/80">
                    <li>Ser twardy (ementaler): <strong>10 L → ~0,9–1,1 kg</strong></li>
                    <li>Ser półtwardy (gouda): <strong>10 L → ~1,2–1,4 kg</strong></li>
                    <li>Ser miękki (camembert): <strong>10 L → ~1,5–2,0 kg</strong></li>
                    <li>Twaróg: <strong>10 L → ~1,8–2,2 kg</strong></li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Podsumowanie — co jest naprawdę ponadczasowe */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Podsumowanie: 8 zasad, które nie starzeją się nigdy
            </h2>
            <Card className="bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-900/10 dark:to-amber-800/10 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  {[
                    { n: "1", rule: "Jakość sera zaczyna się od jakości mleka" },
                    { n: "2", rule: "Koagulacja podpuszczkowa wymaga wapnia i odpowiedniej temperatury" },
                    { n: "3", rule: "Wielkość ziarna decyduje o twardości sera" },
                    { n: "4", rule: "Klasyfikacja serów opiera się na wilgotności, nie na nazwie" },
                    { n: "5", rule: "Sól to element technologiczny, nie tylko smakowy" },
                    { n: "6", rule: "Dojrzewanie wymaga stabilnej temperatury, wilgotności i czasu" },
                    { n: "7", rule: "Czystość chemiczna sprzętu ważniejsza niż wizualna" },
                    { n: "8", rule: "Wydajność zależy od składu mleka — nie od przepisu" },
                  ].map((r) => (
                    <div key={r.n} className="flex items-start gap-3">
                      <span className="inline-flex w-7 h-7 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold items-center justify-center shrink-0 mt-0.5">
                        {r.n}
                      </span>
                      <p className="text-foreground/90 leading-snug">{r.rule}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-foreground/70 mt-6 border-t border-amber-200 dark:border-amber-700 pt-4">
                  Wszystkie te zasady można znaleźć w haśle <em>Serowarstwo</em> z Encyklopedyi
                  rolniczej — spisanym ponad 125 lat temu. Żadna z nich nie straciła na aktualności.
                  Zmieniły się narzędzia, ale nie fizyka i chemia mleka.
                </p>
              </CardContent>
            </Card>
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
              { href: "/klecki-jakosc-mleka", title: "9 warunków jakości mleka wg Kleckiego (1900)" },
              { href: "/klasyka-serowarstwa", title: "Klasyka polskiego serowarstwa — źródła w domenie publicznej" },
              { href: "/serowarstwo-staropolskie", title: "Serowarstwo Staropolskie — dział historyczny" },
              { href: "/kalkulator-beaugel", title: "Kalkulator Beaugel — dawka podpuszczki" },
            ]}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EncyklopediaSerowarstwo;
