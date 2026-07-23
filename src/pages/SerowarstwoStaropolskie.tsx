import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollText } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const guides = [
  {
    href: "/klasyka-serowarstwa",
    title: "Klasyka polskiego serowarstwa",
    desc: "Przegląd trzech kluczowych dzieł w domenie publicznej: Klecki (1900), Licznerski (1922), Encyklopedya rolnicza (~1900). Linki do bezpłatnych skanów cyfrowych.",
    tag: "Źródła",
  },
  {
    href: "/klecki-jakosc-mleka",
    title: "9 warunków jakości mleka wg Kleckiego (1900)",
    desc: "Profesor Walerian Józef Klecki z Uniwersytetu Jagiellońskiego opisał zasady, od których zależy ser — zanim ktokolwiek w Polsce napisał bloga o serowarstwie. Rasa krów, sezon, żywienie, higiena udoju i siedem innych zmiennych, których żaden kalkulator nie zastąpi.",
    tag: "Klecki 1900",
    featured: true,
  },
  {
    href: "/encyklopedia-serowarstwo",
    title: "Encyklopedya rolnicza — ponadczasowa wiedza o serowarstwie",
    desc: "Hasło Serowarstwo z tomu IX Encyklopedyi rolniczej (ok. 1900) — 8 zasad produkcji sera, które nie straciły aktualności przez 125 lat. Chemia mleka, koagulacja, klasyfikacja serów, solenie, dojrzewanie.",
    tag: "Encyklopedia ~1900",
  },
  {
    href: "/licznerski",
    title: "Jan Licznerski — polska biblia serowarstwa",
    desc: 'Biografia autora "Praktycznego serowarstwa" (1922, 435 stron). Oś czasu, cytaty, ciekawostki — o człowieku, który spędził 20 lat przy kadzi, a potem spisał wszystko co wiedział.',
    tag: "Licznerski 1922",
    featured: true,
  },
];

const SerowarstwoStaropolskie = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        headline: "Serowarstwo Staropolskie — historyczne polskie piśmiennictwo serowarskie",
        description:
          "Dział poświęcony polskiej tradycji serowarskiej utrwalonej w akademickich i popularnonaukowych pracach z przełomu XIX i XX wieku. Klecki, Licznerski i inne źródła w domenie publicznej.",
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/serowarstwo-staropolskie",
        publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://mojaserowarnia.pl/" },
          { "@type": "ListItem", position: 2, name: "Serowarstwo Staropolskie", item: "https://mojaserowarnia.pl/serowarstwo-staropolskie" },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Serowarstwo Staropolskie — historyczne polskie piśmiennictwo serowarskie</title>
        <meta
          name="description"
          content="Polskie serowarstwo akademickie sprzed 125 lat: Klecki (UJ 1900), Licznerski (1922) i inne źródła w domenie publicznej. Wiedza, która wyprzedziła blogi o serowarstwie domowym o całe dekady."
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/serowarstwo-staropolskie" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs items={[{ label: "Serowarstwo Staropolskie" }]} />

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <PageHeader
          icon={ScrollText}
          color="amber"
          title="Serowarstwo Staropolskie"
          subtitle="Polskie piśmiennictwo serowarskie sprzed 125 lat — wiedza, która przetrwała próbę czasu"
        />

        <div className="container mx-auto px-4 py-10 max-w-4xl">

          <Card className="mb-8 border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-900/10">
            <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
              <p>
                Zanim w Polsce powstały pierwsze blogi o serowarstwie domowym, zanim ktokolwiek napisał
                „przepis na ser gouda po polsku" — krakowscy i warszawscy uczeni tworzyli{" "}
                <strong>akademickie podręczniki opisujące chemię mleka, mikrobiologię i technologię serów</strong>{" "}
                z precyzją godną dzisiejszych standardów.
              </p>
              <p>
                Dział <em>Serowarstwo Staropolskie</em> gromadzi artykuły oparte na polskich pracach
                naukowych z przełomu XIX i XX wieku — wszystkich dostępnych bezpłatnie jako domena publiczna.
                Czytamy je nie z ciekawości historycznej, ale dlatego, że{" "}
                <strong>mleko nie zmieniło się od 1900 roku</strong> — i wiele z tego, co pisał
                prof. Klecki, obowiązuje w każdej serowarni do dziś.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {guides.map((g) => (
              <a key={g.href} href={g.href} className="group block h-full">
                <Card className={`h-full transition-all hover:shadow-lg hover:-translate-y-0.5 ${g.featured ? "border-2 border-amber-400 dark:border-amber-600" : "hover:border-amber-300"}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                        {g.tag}
                      </span>
                      {g.featured && (
                        <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                          Polecany
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-snug">
                      {g.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{g.desc}</CardDescription>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>

          {/* O dziale */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">O dziale</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed space-y-2 text-foreground/80">
              <p>
                Artykuły w tym dziale opierają się na polskich pracach naukowych z lat 1890–1930,
                dostępnych bezpłatnie w bibliotekach cyfrowych:{" "}
                <a href="https://polona.pl" target="_blank" rel="noopener noreferrer" className="text-amber-700 dark:text-amber-400 hover:underline">Polona.pl</a>
                ,{" "}
                <a href="https://fbc.pionier.net.pl" target="_blank" rel="noopener noreferrer" className="text-amber-700 dark:text-amber-400 hover:underline">Federacja Bibliotek Cyfrowych</a>
                {" "}i{" "}
                <a href="https://jbc.bj.uj.edu.pl" target="_blank" rel="noopener noreferrer" className="text-amber-700 dark:text-amber-400 hover:underline">Jagiellońska Biblioteka Cyfrowa</a>.
              </p>
              <p>
                Każdy artykuł wyraźnie rozróżnia, co pochodzi ze źródeł historycznych, a co to
                współczesna perspektywa i weryfikacja naukowa. Nie przepisujemy dawnych błędów —
                konfrontujemy dawną wiedzę z dzisiejszą nauką i zostawiamy to, co przetrwało.
              </p>
            </CardContent>
          </Card>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SerowarstwoStaropolskie;
