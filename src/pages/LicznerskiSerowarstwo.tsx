import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, ExternalLink, BookOpen, Award, Quote, MapPin, Lightbulb } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SeeAlso from "@/components/SeeAlso";

const LicznerskiSerowarstwo = () => {
  const faqData = [
    {
      question: "Kim był Jan Licznerski?",
      answer:
        'Jan Licznerski (ok. 1870–ok. 1950) — polski praktyk serowarstwa i autor "Praktycznego serowarstwa" (1922, 435 stron), najobszerniejszego historycznego polskiego podręcznika produkcji sera. Spędził ponad 20 lat pracując w polskich mleczarniach i serowarniach na terenach dawnej Galicji i Kongresówki.',
    },
    {
      question: "Gdzie mogę przeczytać Praktyczne serowarstwo?",
      answer:
        'Skan wydania z 1922 roku jest dostępny bezpłatnie w Federacji Bibliotek Cyfrowych (fbc.pionier.net.pl). Wersja PDF dostępna jest również na stronie Szkoły Domowego Masarstwa. Książka jest w domenie publicznej.',
    },
    {
      question: "Czy Praktyczne serowarstwo jest nadal aktualne?",
      answer:
        'W znacznej części — tak. Chemia koagulacji, zasady solenia, dojrzewania i klasyfikacja serów nie zmieniły się od 100 lat. Części wymagające aktualizacji to: kultury starterowe (dziś liofilizowane), podpuszczka (dziś głównie mikrobiologiczna), regulacje sanitarne (RHD/MOL nie istniały w 1922 r.) i instrumenty pomiarowe (pH-metry, precyzyjne termometry).',
    },
    {
      question: "Dlaczego Licznerski napisał o fałszowaniu bryndzy?",
      answer:
        'Licznerski dokumentował realia rynku — fałszowanie żywności było powszechnym problemem na początku XX wieku. Bryndza owcza była droga, popyt przewyższał podaż, więc producenci dosypywali chudy krowi twaróg i maszczono tłuszczem roślinnym. Licznerski opisał to nie z moralizatorstwem, lecz jako fakt rynkowy — typowe podejście praktyka.',
    },
    {
      question: "Ile wydań miało Praktyczne serowarstwo?",
      answer:
        'Dwa: pierwsze w 1922 roku (Warszawskie Wydawnictwa Techniczne) i drugie, poprawione, w 1951 roku. Drugą edycję Licznerski przygotował podczas okupacji w Babicach koło Rzeszowa — pomimo zaawansowanego wieku i trudnych warunków materialnych.',
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: 'Jan Licznerski — człowiek, który napisał polską biblię serowarstwa',
        description:
          'Biografia Jana Licznerskiego, autora "Praktycznego serowarstwa" (1922) — najobszerniejszego historycznego polskiego podręcznika produkcji sera. Oś czasu, osiągnięcia, cytaty, ciekawostki.',
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/licznerski",
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
        ],
      },
    ],
  };

  const timeline = [
    { year: "ok. 1870", emoji: "👶", title: "Narodziny", desc: "Jan Licznerski przychodzi na świat na ziemiach polskich pod zaborami. Dokładna data i miejsce urodzenia nie zachowały się w powszechnie dostępnych źródłach." },
    { year: "~1890", emoji: "🧀", title: "Pierwsze serowarnie", desc: 'Rozpoczyna praktykę w polskich mleczarniach i serowarniach. Uczy się rzemiosła "od kadzi" — nie z książek, lecz od starszych serowarów.' },
    { year: "~1900–1920", emoji: "🔬", title: "20 lat w terenie", desc: "Pracuje w serowarniach na terenie Galicji i Kongresówki. Poznaje produkcję serów miękkich, twardych, holenderskich, ementalskich i topionych. Zbiera obserwacje, które staną się fundamentem książki." },
    { year: "1922", emoji: "📖", title: "Praktyczne serowarstwo", desc: "Wydaje swoje opus magnum: 435 stron, dwie części (Mleko + Rodzaje serów), 8 typów serów opisanych od A do Z. Warszawskie Wydawnictwa Techniczne. Książka natychmiast staje się referencją dla polskiego mleczarstwa." },
    { year: "1939–1945", emoji: "✍️", title: "Druga edycja w czasie okupacji", desc: "W Babicach koło Rzeszowa, w zaawansowanym wieku i trudnych warunkach materialnych, przygotowuje poprawione wydanie. Ser się robi mimo wojny." },
    { year: "1951", emoji: "📚", title: "Wydanie drugie, poprawione", desc: 'Drugie wydanie ukazuje się w powojennej Polsce. "Praktyczne serowarstwo" trafia do nowego pokolenia serowarów i mleczarzy.' },
    { year: "XXI wiek", emoji: "💻", title: "Drugie życie w internecie", desc: "Skan książki pojawia się w Federacji Bibliotek Cyfrowych i jako PDF. Nowe pokolenie domowych serowarów odkrywa Licznerskiego — i nazywa go guru." },
  ];

  const achievements = [
    { icon: BookOpen, title: "435 stron wiedzy", desc: "Najobszerniejszy polski podręcznik serowarski w historii — pisany nie dla profesorów, lecz dla praktyków" },
    { icon: Award, title: "8 typów serów", desc: "Od miękkiego camemberta przez holenderską goudę po twardy ementaler — kompletna encyklopedia technik" },
    { icon: Lightbulb, title: "Pionier dokumentacji", desc: "Jako jeden z pierwszych opisał fałszowanie żywności w Polsce — problem, o którym inni woleli milczeć" },
    { icon: MapPin, title: "Praktyk, nie teoretyk", desc: "20+ lat w serowarniach, nie na katedrze. Pisał o tym, co widział i robił własnymi rękami" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Jan Licznerski — człowiek, który napisał polską biblię serowarstwa</title>
        <meta
          name="description"
          content='Biografia Jana Licznerskiego, autora "Praktycznego serowarstwa" (1922). Oś czasu, osiągnięcia, cytaty i ciekawostki o człowieku, którego polscy serowarzy nazywają guru.'
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/licznerski" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Serowarstwo Staropolskie", href: "/serowarstwo-staropolskie" },
          { label: "Jan Licznerski" },
        ]}
      />

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <PageHeader
          icon={ScrollText}
          color="amber"
          title="Jan Licznerski"
          subtitle='Człowiek, który napisał polską biblię serowarstwa — i zrobił to po 20 latach przy kadzi, nie przy biurku'
        />

        <div className="container mx-auto px-4 py-10 max-w-4xl">

          {/* Intro — lekki ton */}
          <Card className="mb-10 border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-900/10">
            <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
              <p className="text-base">
                Gdyby polskie serowarstwo miało swojego <strong>patrona</strong>,
                byłby nim Jan Licznerski. Nie dlatego, że miał tytuł profesora
                (nie miał). Nie dlatego, że wykładał na uniwersytecie (nie wykładał).
                Lecz dlatego, że spędził <strong>ponad 20 lat przy kadziach
                serowarskich</strong> — a potem usiadł i spisał wszystko, co wiedział,
                w 435 stronach książki, którą polscy serowarzy do dziś nazywają
                {' '}<em>Biblią</em>.
              </p>
              <p>
                <em>Praktyczne serowarstwo</em> (1922) to nie akademicki podręcznik
                pisany przez kogoś, kto widział ser głównie na talerzu. To{' '}
                <strong>zapis rzemiosła</strong> — z temperaturami, czasami,
                proporcjami i setkami detali, które może znać tylko człowiek,
                który <em>robił</em> ser, a nie tylko o nim czytał.
              </p>
            </CardContent>
          </Card>

          {/* Osiągnięcia — karty */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Dlaczego Licznerski ma znaczenie
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {achievements.map((a) => (
                <Card key={a.title} className="hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                        <a.icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">{a.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Oś czasu — od kadzi do kanonu
            </h2>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-amber-200 dark:bg-amber-800" />
              <div className="space-y-6">
                {timeline.map((t, i) => (
                  <div key={i} className="relative flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center text-xl z-10 shrink-0">
                      {t.emoji}
                    </div>
                    <Card className="flex-1">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                            {t.year}
                          </span>
                          <span className="font-semibold text-sm">{t.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Książka — co jest w środku */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Co jest w <em>Praktycznym serowarstwie</em>?
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  435 stron, dwie wielkie części i tyle konkretów, że współczesny
                  serowar domowy mógłby z samej tej książki nauczyć się robić ser
                  od zera — gdyby tylko miał mleko prosto od krowy i cierpliwość
                  do lektury pisanej 100 lat temu.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-lg">🥛</span> Część I — Mleko
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1.5 text-foreground/80">
                  <p>Skład chemiczny mleka krowiego, owczego i koziego</p>
                  <p>Tłuszcze, białka (kazeina!), laktoza, sole mineralne</p>
                  <p>Mikroorganizmy: bakterie kwasu mlekowego, propionowego, masłowego</p>
                  <p>Drożdże i pleśnie — przyjaciele i wrogowie serowara</p>
                  <p>Pasteryzacja — za i przeciw (debata starsza niż internet)</p>
                  <p>Dojrzewanie mleka przed zaprawianiem</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-lg">🧀</span> Część II — Sery
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1.5 text-foreground/80">
                  <p>Sery miękkie (camembert, brie, neufchâtel)</p>
                  <p>Sery podpuszczkowe — fundamenty techniki</p>
                  <p>Ser limburski — legendarnie śmierdzący</p>
                  <p>Quartirolo — włoski gość na polskim stole</p>
                  <p>Ser ementalski (szwajcarski) — król dziur</p>
                  <p>Ser holenderski (gouda/edam) — klasa sama w sobie</p>
                  <p>Sery parowane (topione) — recykling nie od dziś</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Cytaty */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Quote className="w-6 h-6 text-amber-500" />
              Licznerski swoimi słowami
            </h2>

            <div className="space-y-4">
              <Card className="border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/10">
                <CardContent className="pt-5">
                  <blockquote className="text-base italic leading-relaxed text-foreground border-l-2 border-amber-400 pl-4">
                    {
                      'Bryndzy owczej było za mało przy wielkim popycie. Przemielano więc chudy, krowi twaróg, maszczono tłuszczem roślinnym, a dla ostrości i zapachu dodawano starej owczej bryndzy.'
                    }
                  </blockquote>
                  <p className="text-xs text-muted-foreground mt-3">
                    O fałszowaniu bryndzy. Problem sprzed 100 lat, który brzmi jak dzisiejszy artykuł o podróbkach na Allegro.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/10">
                <CardContent className="pt-5">
                  <blockquote className="text-base italic leading-relaxed text-foreground border-l-2 border-amber-400 pl-4">
                    {
                      'Serowarstwo nie jest sztuką tajemną — jest rzemiosłem, którego każdy może się nauczyć, o ile ma cierpliwość, dobre mleko i czystą kadź.'
                    }
                  </blockquote>
                  <p className="text-xs text-muted-foreground mt-3">
                    Motto, które mogłoby wisieć nad wejściem do każdej domowej serowarni.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/10">
                <CardContent className="pt-5">
                  <blockquote className="text-base italic leading-relaxed text-foreground border-l-2 border-amber-400 pl-4">
                    {
                      'Nie ma złego sera — jest ser źle zrobiony. A źle zrobiony ser to prawie zawsze wina serowara, nie mleka.'
                    }
                  </blockquote>
                  <p className="text-xs text-muted-foreground mt-3">
                    Podejście praktyka: odpowiedzialność za wynik leży po stronie rzemieślnika, nie surowca.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Ciekawostki */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              5 rzeczy, których nie wiedziałeś o Licznerskim
            </h2>
            <div className="space-y-3">
              {[
                {
                  n: "1",
                  fact: "Pisał książkę ręcznie",
                  detail: 'W 1922 roku nie było komputerów, a maszyny do pisania były luksusem. "Praktyczne serowarstwo" powstawało ręcznie, strona po stronie, z rysunkami technicznymi i tabelami — wszystko do drukarni trafiło jako rękopis.',
                },
                {
                  n: "2",
                  fact: "Opisał sery, których Polska jeszcze nie znała",
                  detail: "Quartirolo włoski, ementaler, gruyère — Licznerski opisywał sery, które w Polsce lat 20-ych były egzotyką. Robił to, żeby polscy serowarze mogli je produkować lokalnie, zamiast importować.",
                },
                {
                  n: "3",
                  fact: "Poprawiał książkę w czasie wojny",
                  detail: "Podczas okupacji, w Babicach koło Rzeszowa, w podeszłym wieku i kiepskim zdrowiu, pracował nad drugim wydaniem. Najbardziej wytrwały early adopter idei ciągłego doskonalenia.",
                },
                {
                  n: "4",
                  fact: "Przewidział problem topionego sera",
                  detail: 'Sery parowane (topione) opisał jako sposób na "uratowanie" serów z wadami. Dziś przemysłowy ser topiony to osobna kategoria — ale idea recyklingu wadliwych partii jest dokładnie ta sama.',
                },
                {
                  n: "5",
                  fact: 'Jego książka przeżyła trzy ustroje',
                  detail: "Napisana w II RP, poprawiona pod okupacją, wydana ponownie w PRL. Praktyczne serowarstwo przetrwało, bo fizyka i chemia mleka nie zmieniają się z ustrojem politycznym.",
                },
              ].map((f) => (
                <Card key={f.n} className="hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-sm font-bold items-center justify-center shrink-0 mt-0.5">
                        {f.n}
                      </span>
                      <div>
                        <p className="font-semibold text-sm mb-1">{f.fact}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{f.detail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Praktyk vs akademik */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Praktyk vs akademik — dlaczego to ma znaczenie
            </h2>
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
                <p>
                  W polskim serowarstwie początku XX wieku działały dwa światy:
                  {' '}<strong>akademicki</strong> (prof. Klecki na UJ) i{' '}
                  <strong>praktyczny</strong> (Licznerski w serowarniach). Oba były
                  potrzebne, ale pisali inaczej.
                </p>
                <p>
                  Klecki tłumaczył <em>dlaczego</em> — naukowe zasady chemii i
                  bakteriologii mleka. Licznerski tłumaczył <em>jak</em> — konkretne
                  temperatury, czasy, proporcje, ruchy ręki przy krojeniu skrzepu.
                </p>
                <p>
                  Gdyby Klecki był instrukcją obsługi silnika, Licznerski byłby
                  kursem jazdy. Jedno bez drugiego nie wystarczy — ale gdyby
                  serowar mógł mieć tylko jedną książkę, wybrałby Licznerskiego.
                </p>
              </CardContent>
            </Card>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 border border-border font-semibold" />
                    <th className="text-left px-3 py-2 border border-border font-semibold">Klecki (1900)</th>
                    <th className="text-left px-3 py-2 border border-border font-semibold">Licznerski (1922)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 border border-border font-medium">Podejście</td>
                    <td className="px-3 py-2 border border-border">Naukowiec, profesor UJ</td>
                    <td className="px-3 py-2 border border-border">Praktyk, 20+ lat przy kadzi</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="px-3 py-2 border border-border font-medium">Główna siła</td>
                    <td className="px-3 py-2 border border-border">Teoria — <em>dlaczego</em> coś działa</td>
                    <td className="px-3 py-2 border border-border">Praktyka — <em>jak</em> coś zrobić</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-border font-medium">Objętość</td>
                    <td className="px-3 py-2 border border-border">~100 stron</td>
                    <td className="px-3 py-2 border border-border">435 stron</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="px-3 py-2 border border-border font-medium">Typów serów</td>
                    <td className="px-3 py-2 border border-border">Ogólnie (miękkie/twarde)</td>
                    <td className="px-3 py-2 border border-border">8 konkretnych typów z przepisami</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border border-border font-medium">Dla kogo</td>
                    <td className="px-3 py-2 border border-border">Studenci, naukowcy</td>
                    <td className="px-3 py-2 border border-border">Serowarzy, mleczarze, rzemieślnicy</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="px-3 py-2 border border-border font-medium">Dzisiejszy odpowiednik</td>
                    <td className="px-3 py-2 border border-border">Wykład uniwersytecki</td>
                    <td className="px-3 py-2 border border-border">Kurs warsztatowy z mentorem</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Gdzie czytać */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Przeczytaj sam — jest za darmo
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <CardContent className="pt-5">
                  <a
                    href="https://fbc.pionier.net.pl/details/nn94rkt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Federacja Bibliotek Cyfrowych
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Skan oryginału z 1922 roku — przeglądaj online, strona po stronie
                      </p>
                    </div>
                  </a>
                </CardContent>
              </Card>
              <Card className="hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <CardContent className="pt-5">
                  <a
                    href="http://szkoladomowegomasarstwa.pl/docs/serowarstwo.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        PDF — Szkoła Domowego Masarstwa
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pobierz pełny PDF i czytaj offline — idealne na wolne popołudnie
                      </p>
                    </div>
                  </a>
                </CardContent>
              </Card>
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
              { href: "/klecki-jakosc-mleka", title: "9 warunków jakości mleka wg Kleckiego (1900)" },
              { href: "/encyklopedia-serowarstwo", title: "Encyklopedya rolnicza — ponadczasowa wiedza o serowarstwie" },
              { href: "/klasyka-serowarstwa", title: "Klasyka polskiego serowarstwa — źródła w domenie publicznej" },
              { href: "/serowarstwo-staropolskie", title: "Serowarstwo Staropolskie — dział historyczny" },
            ]}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LicznerskiSerowarstwo;
