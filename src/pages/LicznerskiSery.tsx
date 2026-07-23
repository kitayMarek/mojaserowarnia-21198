import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, ExternalLink, ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SeeAlso from "@/components/SeeAlso";

const cheeseTypes = [
  {
    num: 1,
    name: "Sery miękkie",
    emoji: "🧈",
    examples: "camembert, brie, neufchâtel",
    description: 'Licznerski opisuje sery miękkie jako te, w których skrzep "prawie sam oddaje serwatkę" — bez prasowania, bez gotowania ziarna. Formuje się je delikatnie, soli z wierzchu i dojrzewa krótko (2–4 tygodnie) w wilgotnych piwnicach. Biała pleśń (Penicillium) robi resztę.',
    then_label: "Licznerski (1922)",
    then: [
      "Camembert opisany jako ser zagraniczny, który Polska powinna produkować sama",
      'Pleśń biała — "narasta samoistnie" (dziś wiemy: Penicillium camemberti)',
      "Dojrzewanie 2–4 tygodnie w piwnicach o temp. 10–12°C",
      "Nie wymaga prasy — skrzep krojony w duże kostki, odsączany grawitacyjnie",
    ],
    now: [
      "Camembert i brie — jedne z najpopularniejszych serów domowych na świecie",
      "Penicillium camemberti — hodowane przemysłowo, sprzedawane jako liofilizat",
      "Parametry dojrzewania identyczne: 10–13°C, RH 90–95%",
      "Technika grawitacyjnego odsączania bez zmian (chocherka, formy bez dna)",
    ],
    verdict: "Technika prawie identyczna. Zmieniło się źródło pleśni (kupowana vs dzika) i skala.",
    recipe_hint: "Licznerski podaje szczegółowy opis produkcji camemberta i neufchâtela — od temperatury zaprawiania po sposób solenia.",
  },
  {
    num: 2,
    name: "Sery podpuszczkowe",
    emoji: "🧪",
    examples: "fundamenty techniki serowarskiej",
    description: 'To nie konkretny ser, lecz cały rozdział o technice krzepnięcia podpuszczkowego. Licznerski tłumaczy mechanizm działania podpuszczki, optymalną temperaturę zaprawiania (30–35°C), czas krzepnięcia, próbę cięcia skrzepu i — co najważniejsze — jak rozpoznać moment "gotowości" skrzepu bez instrumentów.',
    then_label: "Licznerski (1922)",
    then: [
      "Podpuszczka cielęca — jedyne dostępne źródło enzymu (chymozyna)",
      "Siła mierzona próbą flokulacji: ile ml na 10 L mleka",
      "Optymalna temp. zaprawiania: 30–35°C",
      'Test gotowości: palec wsunięty w skrzep, "łamie się czysto"',
    ],
    now: [
      "Podpuszczka mikrobiologiczna (Rhizomucor miehei) — dominuje rynek; cielęca nadal premium",
      "Siła standaryzowana: IMCU/ml; kalkulator Beaugel",
      "30–35°C — dokładnie ten sam zakres",
      "Test palca/noża nadal stosowany równolegle z pH-metrem",
    ],
    verdict: "Zasady identyczne. Zmienił się surowiec (podpuszczka mikrobiologiczna) i precyzja pomiaru.",
    recipe_hint: null,
  },
  {
    num: 3,
    name: "Ser limburski",
    emoji: "👃",
    examples: "limburger, herve, maroilles",
    description: 'Ser, który "pachnie tak, że nie każdy wytrzyma" — Licznerski nie ukrywa, że limburski to ser dla odważnych. Opisuje technikę mycia skórki roztwór solankowym, która sprzyja rozwojowi Brevibacterium linens (pomarańczowa, śmierdzącą bakteria). To jeden z najdokładniejszych opisów tego typu sera w polskim piśmiennictwie.',
    then_label: "Licznerski (1922)",
    then: [
      "Mycie skórki solankĄ co 2–3 dni — kluczowa technika",
      '"Pomarańczowa maź" na skórce — opisana bez nazwy bakterii',
      "Dojrzewanie 4–8 tygodni w wilgotnej piwnicy",
      "Ser popularny w Belgii i Niemczech, w Polsce nieznany",
    ],
    now: [
      "Mycie skórki — identyczna technika, dziś stosowana też w taleggio, époisses, reblochon",
      "Brevibacterium linens — zidentyfikowane, hodowane przemysłowo",
      "Parametry dojrzewania bez zmian",
      "Sery z mytą skórką — jedna z najciekawszych kategorii rzemieślniczych",
    ],
    verdict: "Technika mycia skórki opisana przez Licznerskiego jest fundamentem całej kategorii serów washed-rind.",
    recipe_hint: "Opis produkcji limburskiego krok po kroku — od formowania po schemat mycia skórki.",
  },
  {
    num: 4,
    name: "Quartirolo",
    emoji: "🇮🇹",
    examples: "quartirolo lombardo, stracchino",
    description: 'Włoski gość na polskim stole — Licznerski opisuje quartirolo jako ser, którego "Polska powinna się nauczyć". Ser z mleka krów schodzących z letnich pastwisk (quarta erba — czwarta trawa), miękki, kremowy, o krótkim dojrzewaniu. Fakt, że polski autor z 1922 roku szczegółowo opisuje ser lombardzki, świadczy o rozległości jego wiedzy.',
    then_label: "Licznerski (1922)",
    then: [
      "Opisany jako ser włoski, nieznany w Polsce",
      "Krótkie dojrzewanie (5–20 dni), delikatny smak",
      'Technika "stufatura" — skrzep podgrzewany w serwatce',
      "Mleko jesienne (po zejściu z hal) — tłustsze i bogatsze",
    ],
    now: [
      "Quartirolo Lombardo — ser ChNP (od 1996), produkowany przemysłowo",
      "Popularna caciotta to bliski krewny quartirolo",
      "Stufatura — nadal kluczowa technika (opis na mojaserowarnia.pl)",
      "Dostępny w polskich delikatesach i robiony przez domowych serowarów",
    ],
    verdict: "Ser, który Licznerski przedstawiał jako egzotyk, dziś robi się w polskich kuchniach (jako caciotta).",
    recipe_hint: "Opis włoskiej metody produkcji quartirolo z uwagami o adaptacji do polskich warunków.",
  },
  {
    num: 5,
    name: "Ser ementalski",
    emoji: "🕳️",
    examples: "emmentaler, gruyère, beaufort",
    description: 'Król dziur — Licznerski poświęca ementalerowi jeden z najdłuższych rozdziałów. Opisuje nie tylko technikę (gotowanie ziarna do 52–55°C, ciężkie prasowanie, solenie w solance), ale próbuje wyjaśnić, skąd biorą się dziury. W 1922 roku mechanizm nie był jeszcze w pełni udowodniony laboratoryjnie — ale Licznerski trafnie wskazuje na "gazy wytwarzane przez szczególne bakterie" (propionowe).',
    then_label: "Licznerski (1922)",
    then: [
      "Gotowanie ziarna do 52–55°C — najwyższa temp. ze wszystkich serów",
      '"Gazy" tworzące dziury — trafna intuicja, niepełne wyjaśnienie',
      "Ciężkie prasowanie (do 100 kg nacisku na 1 kg sera)",
      "Dojrzewanie etapowe: zimna piwnica → ciepła → zimna",
    ],
    now: [
      "Gotowanie ziarna — identyczne 52–55°C",
      "CO₂ z Propionibacterium freudenreichii — mechanizm udowodniony w latach 30.",
      "Prasowanie ciężkie — bez zmian (prasy hydrauliczne zastąpiły kamienie)",
      "Dojrzewanie trójfazowe: 10°C → 20–22°C (faza ciepła = dziury) → 10°C",
    ],
    verdict: "Opis Licznerskiego jest technicznie poprawny. Jedyne, czego nie znał, to nazwa bakterii odpowiedzialnej za dziury.",
    recipe_hint: "Pełna procedura produkcji sera ementalskiego — od zaprawiania po schemat trójfazowego dojrzewania.",
  },
  {
    num: 6,
    name: "Ser holenderski",
    emoji: "🧀",
    examples: "gouda, edam, leidsekaas",
    description: 'Licznerski opisuje sery holenderskie jako "klasę samą w sobie" — technika płukania skrzepu gorącą wodą (która daje słodki, łagodny smak) odróżnia je od wszystkich innych. To jeden z najdokładniejszych jego opisów: podaje temperatury płukania, proporcje wody, czas mieszania i sposób prasowania w formach.',
    then_label: "Licznerski (1922)",
    then: [
      "Płukanie skrzepu gorącą wodą (40–45°C) — kluczowa technika",
      "Prasowanie w okrągłych formach (gouda) lub płaskich (edam)",
      "Solenie w solance 18–20% przez 12–48h (zależnie od wielkości)",
      "Dojrzewanie 2–12 miesięcy; skórka woskowana lub olejowana",
    ],
    now: [
      "Płukanie skrzepu — identyczna technika, nadal fundament goudy",
      "Formy — takie same kształty, materiał: tworzywo zamiast drewna",
      "Solanka 18–22% — zgodne; dodano CaCl₂ do solanki",
      "Woskowanie — nadal stosowane; alternatywa: powłoki lateksowe",
    ],
    verdict: "Opis goudy/edama u Licznerskiego to gotowa instrukcja, którą można stosować dziś z minimalnymi modyfikacjami.",
    recipe_hint: "Szczegółowy opis produkcji sera holenderskiego (gouda) — z temperaturami płukania i czasami prasowania.",
  },
  {
    num: 7,
    name: "Sery twarde (typu alpejskiego)",
    emoji: "⛰️",
    examples: "gruyère, parmezan, pecorino",
    description: 'Licznerski opisuje sery twarde jako wymagające największego doświadczenia i cierpliwości. Duże koła (10–40 kg), długie dojrzewanie (6–24 miesiące), wysokie temperatury gotowania ziarna (48–55°C). Podkreśla, że sery twarde to "próba mistrzostwa" — każdy bład w procesie objawia się dopiero po miesiącach dojrzewania.',
    then_label: "Licznerski (1922)",
    then: [
      "Gotowanie ziarna do 48–55°C (najwyższe temperatury w serowarstwie)",
      "Duże formy — koła 10–40 kg wymagające ciężkich pras",
      "Dojrzewanie 6–24 mies.; piwnice z kontrolowaną wilgotnością",
      "Wady ujawniają się po miesiącach — wysoki koszt błędu",
    ],
    now: [
      "Temperatury gotowania identyczne; Parmigiano Reggiano: 55°C",
      "Koła rzemieślnicze: 20–40 kg; przemysłowe bloki do 100 kg",
      "Dojrzewanie w kontrolowanych komorach (precyzja T/RH/wentylacja)",
      "Analityka (pH, aw, profil mikrobiologiczny) skróciła czas diagnozy wad",
    ],
    verdict: "Zasady nie zmieniły się. Zmieniła się precyzja kontroli i diagnostyki.",
    recipe_hint: "Opis ogólnych zasad produkcji serów twardych — parametry gotowania, prasowania i dojrzewania.",
  },
  {
    num: 8,
    name: "Sery parowane (topione)",
    emoji: "♻️",
    examples: "ser topiony, schmelzkäse",
    description: 'Ostatni rozdział Części II to sery parowane — czyli topione. Licznerski opisuje je z typową dla siebie szczerością: to sposób na "uratowanie" serów z wadami. Sery zbyt kwaśne, zbyt twarde, z dziurami w niewłaściwych miejscach — zamiast je wyrzucać, topiono je z masłem i solami emulgującymi, uzyskując produkt jednolity, trwały i łatwy do krojenia.',
    then_label: "Licznerski (1922)",
    then: [
      "Topienie serów z wadami — recykling, nie produkt docelowy",
      "Sole emulgujące (cytryniany, fosforany) — opisane jako \"sole topiące\"",
      "Temperatura topienia: 80–90°C",
      "Produkt trwały, łatwy do transportu i przechowywania",
    ],
    now: [
      "Ser topiony — osobna kategoria przemysłowa (nie tylko recykling)",
      "Sole emulgujące identyczne (E331, E339, E452)",
      "Temperatura bez zmian; proces zautomatyzowany",
      "Licznerski przewidział: dziś ser topiony to globalna kategoria warta miliardy",
    ],
    verdict: "Z recyklingu wad do globalnego produktu — Licznerski opisał narodziny kategorii, która zdominowała supermarkety.",
    recipe_hint: "Zasady topienia serów z wadami — proporcje, sole emulgujące, technika mieszania.",
  },
];

const LicznerskiSery = () => {
  const faqData = [
    {
      question: "Ile typów serów opisał Licznerski?",
      answer:
        'Osiem: sery miękkie (camembert, brie), sery podpuszczkowe (technika ogólna), ser limburski (mytą skórką), quartirolo (włoski), ser ementalski (z dziurami), ser holenderski (gouda/edam), sery twarde (alpejskie) i sery parowane (topione). Każdy typ opisany jest od A do Z: surowiec, temperatury, czasy, solenie, dojrzewanie.',
    },
    {
      question: "Czy przepisy Licznerskiego można stosować dziś?",
      answer:
        'W znacznej części tak — temperatury, czasy i proporcje są zgodne ze współczesnymi standardami. Konieczne adaptacje: podpuszczka (mikrobiologiczna zamiast cielęcej, inna siła — użyj kalkulatora Beaugel), kultury (liofilizowane zamiast naturalnego dojrzewania mleka), CaCl₂ do mleka pasteryzowanego. Reszta procesu — cięcie, gotowanie ziarna, prasowanie, solenie, dojrzewanie — jest zaskakująco aktualna.',
    },
    {
      question: "Które sery Licznerskiego są najciekawsze dla domowego serowara?",
      answer:
        'Gouda (ser holenderski) — najdokładniej opisana technika płukania skrzepu. Camembert — kompletny opis produkcji sera miękkiego. Quartirolo — egzotyk z 1922 roku, który dziś robimy jako caciottę. Ementaler — fascynujący, choć wymagający sprzętu (duże formy, ciężkie prasy).',
    },
    {
      question: "Czym Licznerski różni się od dzisiejszych opisów serów?",
      answer:
        'Licznerski opisuje sery z perspektywy praktyka: "jak to wygląda w serowarni", nie "jaka reakcja chemiczna zachodzi". Nie zna nazw bakterii, ale zna ich efekty. Nie mierzy pH, ale wie, kiedy mleko jest "dojrzałe". Nie ma MilkoScanu, ale umie ocenić tłustość palcami. To wiedza empiryczna, potwierdzona później laboratoryjnie.',
    },
    {
      question: "Czy Licznerski opisywał sery polskie?",
      answer:
        'Nie wprost — w 1922 roku Polska nie miała jeszcze rozpoznawalnych serów regionalnych (oprócz bryndzy podhalańskiej). Licznerski opisuje techniki zagraniczne z myślą o polskich serowarniach — chciał, żeby Polska produkowała własne goudy, camemberty i ementalery, zamiast je importować. W pewnym sensie — był pionierem polskiego serowarstwa rzemieślniczego.',
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: 'Rodzaje serów wg Licznerskiego — Część II Praktycznego serowarstwa (1922)',
        description:
          '8 typów serów opisanych przez Licznerskiego w 1922 roku: miękkie, podpuszczkowe, limburski, quartirolo, ementalski, holenderski, twarde, parowane. Porównanie z współczesną technologią.',
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/licznerski-sery",
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
          { "@type": "ListItem", position: 4, name: "Rodzaje serów wg Licznerskiego", item: "https://mojaserowarnia.pl/licznerski-sery" },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Rodzaje serów wg Licznerskiego — Część II Praktycznego serowarstwa (1922)</title>
        <meta
          name="description"
          content='8 typów serów opisanych przez Jana Licznerskiego: miękkie, podpuszczkowe, limburski, quartirolo, ementalski, holenderski, twarde, topione. Porównanie z współczesnością — co przetrwało 100 lat.'
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/licznerski-sery" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Serowarstwo Staropolskie", href: "/serowarstwo-staropolskie" },
          { label: "Jan Licznerski", href: "/licznerski" },
          { label: "Rodzaje serów wg Licznerskiego" },
        ]}
      />

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <PageHeader
          icon={ScrollText}
          color="amber"
          title="Rodzaje serów wg Licznerskiego"
          subtitle='Część II Praktycznego serowarstwa (1922) — 8 typów serów, które Licznerski opisał od A do Z'
        />

        <div className="container mx-auto px-4 py-10 max-w-4xl">

          {/* Wprowadzenie */}
          <Card className="mb-10 border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-900/10">
            <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
              <p className="text-base">
                Część II <em>Praktycznego serowarstwa</em> to serce książki — i powód,
                dla którego serowarzy nazywają ją <strong>biblią</strong>. Na ponad
                {' '}<strong>250 stronach</strong> Licznerski opisuje osiem typów serów:
                od miękkiego camemberta po ser topiony. Każdy — od surowca po dojrzały
                produkt, z temperaturami, czasami i proporcjami.
              </p>
              <p>
                W 1922 roku Polska nie produkowała większości tych serów. Licznerski
                pisał z <strong>misją</strong>: chciał, żeby polskie serowarnie dorównały
                szwajcarskim, holenderskim i francuskim. Opisywał sery, które{' '}
                <em>sam robił</em> przez 20 lat — nie takie, o których przeczytał
                w zagranicznym podręczniku.
              </p>
              <p>
                Na tej stronie porównujemy każdy z 8 typów z dzisiejszą technologią.
                Spoiler: <strong>Licznerski miał rację znacznie częściej, niż można by
                oczekiwać od książki sprzed 100 lat</strong>.
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

          {/* Tabela zbiorcza */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              8 typów sera — przegląd
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-amber-50 dark:bg-amber-900/20">
                    <th className="border border-border px-3 py-2 text-left font-semibold w-8">#</th>
                    <th className="border border-border px-3 py-2 text-left font-semibold">Typ sera</th>
                    <th className="border border-border px-3 py-2 text-left font-semibold">Przykłady</th>
                    <th className="border border-border px-3 py-2 text-left font-semibold">Kluczowa technika</th>
                    <th className="border border-border px-3 py-2 text-center font-semibold">Aktualność</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { n: 1, type: "Miękkie", ex: "camembert, brie", tech: "Grawitacyjne odsączanie, pleśń biała", ok: "✓✓✓" },
                    { n: 2, type: "Podpuszczkowe", ex: "(technika ogólna)", tech: "Krzepnięcie, cięcie, próba palca", ok: "✓✓✓" },
                    { n: 3, type: "Limburski", ex: "limburger, herve", tech: "Mycie skórki solankĄ", ok: "✓✓✓" },
                    { n: 4, type: "Quartirolo", ex: "quartirolo, stracchino", tech: "Stufatura, krótkie dojrzewanie", ok: "✓✓✓" },
                    { n: 5, type: "Ementalski", ex: "emmentaler, gruyère", tech: "Gotowanie 52–55°C, dziury (CO₂)", ok: "✓✓" },
                    { n: 6, type: "Holenderski", ex: "gouda, edam", tech: "Płukanie skrzepu gorącą wodą", ok: "✓✓✓" },
                    { n: 7, type: "Twarde", ex: "parmezan, pecorino", tech: "Gotowanie 48–55°C, ciężkie prasowanie", ok: "✓✓" },
                    { n: 8, type: "Parowane", ex: "ser topiony", tech: 'Topienie z solami emulgującymi', ok: "✓✓✓" },
                  ].map((r) => (
                    <tr key={r.n} className="hover:bg-muted/30">
                      <td className="border border-border px-3 py-2 text-center font-bold text-amber-600 dark:text-amber-400">{r.n}</td>
                      <td className="border border-border px-3 py-2 font-medium">{r.type}</td>
                      <td className="border border-border px-3 py-2 text-foreground/70 italic">{r.ex}</td>
                      <td className="border border-border px-3 py-2">{r.tech}</td>
                      <td className="border border-border px-3 py-2 text-center text-green-600 dark:text-green-400">{r.ok}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ✓✓✓ = technika praktycznie bez zmian &nbsp;|&nbsp; ✓✓ = zasady te same, szczegóły wymagają aktualizacji
            </p>
          </section>

          {/* Szczegółowe opisy każdego typu */}
          {cheeseTypes.map((cheese) => (
            <section key={cheese.num} className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="inline-flex w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-lg items-center justify-center shrink-0">
                  {cheese.emoji}
                </span>
                {cheese.num}. {cheese.name}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  ({cheese.examples})
                </span>
              </h2>
              <Card className="mb-4">
                <CardContent className="pt-6 text-sm leading-relaxed">
                  <p>{cheese.description}</p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardContent className="pt-5">
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                      📖 {cheese.then_label}
                    </p>
                    <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                      {cheese.then.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-green-200 dark:border-green-800">
                  <CardContent className="pt-5">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                      🔬 Współcześnie
                    </p>
                    <ul className="text-sm space-y-1.5 text-foreground/80 list-disc list-inside">
                      {cheese.now.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-secondary/30">
                <CardContent className="pt-4 pb-4">
                  <p className="text-sm">
                    <strong>Werdykt po 100 latach:</strong>{" "}
                    <span className="text-foreground/80">{cheese.verdict}</span>
                  </p>
                </CardContent>
              </Card>

              {cheese.recipe_hint && (
                <div className="mt-3 flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
                  <span className="shrink-0 mt-0.5">📝</span>
                  <span>
                    <strong>Przepis Licznerskiego:</strong>{" "}
                    {cheese.recipe_hint}
                    <span className="text-muted-foreground"> (wkrótce w dziale Sery Licznerskiego)</span>
                  </span>
                </div>
              )}
            </section>
          ))}

          {/* Zasługi Licznerskiego */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Zasługi Licznerskiego — co wniósł do polskiego serowarstwa
            </h2>

            <div className="space-y-4">
              <Card className="hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <CardContent className="pt-5">
                  <h3 className="text-base font-bold mb-2">🗺️ Przetłumaczył świat serów na polski</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    W 1922 roku polscy serowarzy nie mieli dostępu do literatury
                    francuskiej, szwajcarskiej czy holenderskiej. Licznerski — który
                    sam te sery robił — przetłumaczył <strong>całą europejską
                    tradycję serowarską</strong> na język polski, z polskimi realiami:
                    polskie mleko, polskie piwnice, polskie temperatury. To nie był
                    przekład — to była adaptacja.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <CardContent className="pt-5">
                  <h3 className="text-base font-bold mb-2">📐 Usystematyzował wiedzę praktyczną</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Przed Licznerskim serowarstwo w Polsce było rzemiosłem przekazywanym
                    ustnie — od mistrza do ucznia. On jako pierwszy{' '}
                    <strong>zapisał temperatury, czasy, proporcje i procedury</strong>
                    {' '}w sposób, który mógł powielić każdy, kto umie czytać.
                    To różnica między rzemiosłem a wiedzą — i Licznerski tę granicę
                    przekroczył.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <CardContent className="pt-5">
                  <h3 className="text-base font-bold mb-2">🔍 Opisał to, co niewygodne</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Fałszowanie bryndzy, psucie się serów, wady skrzepu, mleko
                    od chorych krów — Licznerski nie pomijał tematów niewygodnych.
                    Inni autorzy epoki pisali o serowarstwie <em>idealnym</em>.
                    On pisał o <strong>serowarstwie rzeczywistym</strong> —
                    z błędami, problemami i sposobami ich rozwiązywania. To czyni
                    jego książkę bardziej użyteczną niż niejedna współczesna.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <CardContent className="pt-5">
                  <h3 className="text-base font-bold mb-2">🌍 Wprowadził sery egzotyczne do polskiej świadomości</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Quartirolo, ementaler, limburger, gruyère — w 1922 roku
                    większość Polaków nie słyszała o tych serach. Licznerski nie
                    tylko je opisał, ale <strong>podał instrukcje ich produkcji
                    w polskich warunkach</strong>. Dzisiejsi polscy serowarzy domowi,
                    którzy robią goudę czy caciottę, realizują misję, którą
                    Licznerski wyznaczył 100 lat temu.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <CardContent className="pt-5">
                  <h3 className="text-base font-bold mb-2">⚖️ Dał perspektywę praktyka, nie naukowca</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Klecki (profesor UJ) tłumaczył <em>dlaczego</em> mleko się
                    kwasi. Licznerski tłumaczył <em>co zrobić, gdy się za szybko
                    skwasi</em>. Obie perspektywy są wartościowe, ale to Licznerski
                    pisał dla człowieka stojącego przy kadzi z termometrem w ręku.
                    Jego język to język <strong>instrukcji, nie wykładu</strong> —
                    i dlatego jego książka przetrwała.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Zapowiedź działu przepisów */}
          <section className="mb-10">
            <Card className="border-2 border-amber-400 dark:border-amber-600 bg-amber-50/30 dark:bg-amber-900/10">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl shrink-0">📝</span>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Sery Licznerskiego — przepisy (wkrótce)
                    </h2>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                      Licznerski nie pisał ogólników — podawał{' '}
                      <strong>konkretne instrukcje produkcji</strong> każdego z 8 typów
                      serów: temperatury zaprawiania, czas krzepnięcia, sposób
                      cięcia skrzepu, temperatury gotowania ziarna, ciśnienie prasowania,
                      stężenie solanki, warunki dojrzewania.
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                      Przygotowujemy dział <strong>Sery Licznerskiego</strong>,
                      w którym te historyczne przepisy zostaną przetłumaczone
                      na współczesny język: z przeliczeniem dawek podpuszczki
                      (kalkulator Beaugel), zamianą kultur (liofilizaty zamiast
                      naturalnego dojrzewania) i uzupełnieniem o CaCl₂ dla mleka
                      pasteryzowanego.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Planowane przepisy: ser holenderski (gouda), camembert,
                      ementaler, limburski, quartirolo, ser topiony.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              { title: "Mleko wg Licznerskiego (Część I)", href: "/licznerski-mleko", description: "Skład mleka, mikrobiologia, pasteryzacja" },
              { title: "9 warunków jakości mleka wg Kleckiego", href: "/klecki-jakosc-mleka", description: "Akademickie spojrzenie na jakość mleka (UJ 1900)" },
              { title: "Przepisy na sery", href: "/przepisy", description: "Współczesne przepisy na sery domowe" },
              { title: "Encyklopedya rolnicza — Serowarstwo", href: "/encyklopedia-serowarstwo", description: "Ponadczasowa wiedza z ~1900 roku" },
              { title: "Klasyka polskiego serowarstwa", href: "/klasyka-serowarstwa", description: "Przegląd źródeł w domenie publicznej" },
            ]}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LicznerskiSery;
