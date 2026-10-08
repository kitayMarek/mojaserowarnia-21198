import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import ReactionButton from "@/components/ReactionButton";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import SekcjaFAQ from "@/components/SekcjaFAQ";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Scale } from "lucide-react";

/**
 * Serwatka słodka a kwaśna: skąd różnica i co od niej zależy.
 *
 * Plan: ProjektyLLm/PLAN-serwatka.md (strona C), źródła: ZRODLA-serwatka.md
 * (pliki poza repozytorium). Treść 1:1 z mirrorem public/serwatka-slodka-i-kwasna.html,
 * FAQ w faqPoradnikow ("serwatka-slodka-i-kwasna").
 *
 * Symulator sera (src/lib/symulatorSera.ts, stanSerwatki) mówi o serwatce to
 * samo: po skrzepie kwasowym jest kwaśna, białka serwatkowe w niej zostają,
 * ricotta z niej słabo wychodzi. Przy zmianie jednego poprawić drugie.
 */

const ZRODLA = [
  {
    tekst: "Pires i in. 2021, Dairy By-Products: A Review on the Valorization of Whey and Second Cheese Whey, Foods 10(5):1067",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8151190/",
  },
  {
    tekst: "Cheesemaking Technology, University of Guelph, rozdz. 8.5: sery z wytrącania kwasem i temperaturą",
    url: "https://books.lib.uoguelph.ca/cheesemakingtechnologyebook/chapter/8-5-heat-acid-precipitated-cheese",
  },
  {
    tekst: "Robbins i Lehrsch 1992, serwatka kwaśna a gleba sodowa, USDA ARS",
    url: "https://www.ars.usda.gov/research/publications/publication/?seqNo115=59564",
  },
];

const SKLAD = [
  ["Po jakich serach", "podpuszczkowych: gouda, edam, cheddar, ementaler", "twaróg, jogurt grecki, sery kwasowe i kwasowo-termiczne"],
  ["Co ścina mleko", "podpuszczka", "kwas"],
  ["pH", "6–7", "4,5–5,8"],
  ["Laktoza", "46–52 g/l", "44–46 g/l"],
  ["Białko", "6–10 g/l", "6–8 g/l"],
  ["Składniki mineralne", "2,5–4 g/l", "4,3–7,2 g/l"],
];

const ZASTOSOWANIA: { co: React.ReactNode; slodka: string; kwasna: string }[] = [
  {
    co: <Link to="/przepisy/ricotta" className="text-primary underline">Ricotta</Link>,
    slodka: "tak, to jej surowiec",
    kwasna: "zwykle nie; przepisy dodają mleko",
  },
  {
    co: <Link to="/serwatka-dla-zwierzat" className="text-primary underline">Pasza</Link>,
    slodka: "lepsza",
    kwasna: "rozcieńczona, wprowadzana stopniowo",
  },
  {
    co: <Link to="/fermentacja-serwatki" className="text-primary underline">Fermentacja, napój</Link>,
    slodka: "tak",
    kwasna: "tak, laktozy jest prawie tyle samo",
  },
  { co: "Suszenie na proszek", slodka: "tak, to typowy surowiec mleczarni", kwasna: "trudno i drogo" },
  { co: "Biogazownia", slodka: "tak", kwasna: "tak" },
  {
    co: <Link to="/serwatka" className="text-primary underline">Ogród</Link>,
    slodka: "rozcieńczona, w małych ilościach",
    kwasna: "rozcieńczona, w małych ilościach; nie zastąpi siarki",
  },
];

const SerwatkaSlodkaKwasna = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Serwatka słodka i kwaśna: czym się różnią i do czego służą",
    description:
      "Skąd bierze się serwatka słodka i kwaśna, czym różnią się składem i co z tego wynika dla ricotty, paszy, fermentacji i przetwórstwa.",
    inLanguage: "pl",
    url: "https://mojaserowarnia.pl/serwatka-slodka-i-kwasna",
    image: "https://mojaserowarnia.pl/og-image.jpg",
    datePublished: "2026-10-08",
    dateModified: "2026-10-08",
    publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
  };

  const seeAlsoLinks = [
    { title: "Serwatka: pożytek czy problem", href: "/serwatka", description: "Dla kogo pasza i surowiec, dla kogo kłopot, i co z nią zrobić." },
    { title: "Fermentacja serwatki", href: "/fermentacja-serwatki", description: "Dlaczego ukwaszenie zużywa tylko część laktozy." },
    { title: "Przepis na ricottę", href: "/przepisy/ricotta", description: "Co zrobić z serwatką słodką, zanim trafi dalej." },
    { title: "Symulator sera", href: "/symulator-sera", description: "Zobacz, jaka serwatka zostaje po serze, który ustawisz." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Poradniki", href: "/poradniki" },
          { label: "Serwatka", href: "/serwatka" },
          { label: "Słodka i kwaśna" },
        ]}
      />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Scale}
              color="amber"
              title="Serwatka słodka i kwaśna"
              subtitle="Od tego, po jakim serze została serwatka, zależy prawie wszystko, co da się z nią zrobić."
            />

            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="serwatka-slodka-i-kwasna" variant="default" />
            </div>

            <TLDRSection>
              <p>
                <strong>Słodka</strong> zostaje po serach podpuszczkowych i ma pH 6–7. <strong>Kwaśna</strong>{" "}
                zostaje po twarogu, jogurcie greckim i serach kwasowych i ma pH 4,5–5,8. Kwaśna ma mniej laktozy i
                więcej składników mineralnych. Ze słodkiej zrobisz ricottę, z kwaśnej zwykle nie.
              </p>
            </TLDRSection>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skąd bierze się różnica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Mleko można ściąć na dwa sposoby. <strong>Podpuszczka</strong> tnie białko kazeinę, a ta zbija się w
                    skrzep, zanim mleko mocno skwaśnieje. Serwatka zostaje prawie obojętna, dlatego mówi się na nią
                    słodka.
                  </p>
                  <p>
                    <strong>Kwas</strong> ścina kazeinę, gdy pH spadnie mniej więcej do 4,6, jak przy twarogu albo
                    jogurcie. Po drodze rozpuszcza fosforan wapnia, który w mleku trzyma się kazeiny. Wapń przechodzi do
                    serwatki, a ser kwasowy ma go mniej niż podpuszczkowy. Stąd w serwatce kwaśnej więcej składników
                    mineralnych.
                  </p>
                  <p>
                    Granica nie jest ostra. Ser podpuszczkowy, który długo się zakwasza, zostawia serwatkę pośrednią.
                    Rozstrzyga pH.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Porównanie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold"></th>
                          <th className="text-left p-2 font-semibold">Serwatka słodka</th>
                          <th className="text-left p-2 font-semibold">Serwatka kwaśna</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SKLAD.map(([cecha, slodka, kwasna]) => (
                          <tr key={cecha} className="border-b last:border-0">
                            <td className="p-2 font-medium">{cecha}</td>
                            <td className="p-2">{slodka}</td>
                            <td className="p-2">{kwasna}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Do czego się nadaje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Zastosowanie</th>
                          <th className="text-left p-2 font-semibold">Słodka</th>
                          <th className="text-left p-2 font-semibold">Kwaśna</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ZASTOSOWANIA.map(({ co, slodka, kwasna }, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="p-2 font-medium">{co}</td>
                            <td className="p-2">{slodka}</td>
                            <td className="p-2">{kwasna}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p>
                    <strong>Ricotta.</strong> Białka serwatkowe zaczynają się ścinać około 70°C, a szybciej przy 90°C.
                    W serwatce kwaśnej nadal ich jest 6–8 g w litrze, ale z samej kwaśnej serwatki ścinają się słabo i
                    daje to bardzo mało twarogu. Przepisy na ricottę z serwatki po twarogu czy jogurcie dodają mleko, a
                    wtedy większość sera pochodzi z mleka.
                  </p>
                  <p>
                    <strong>Suszenie.</strong> Serwatki kwaśnej nie da się opłacalnie wysuszyć, więc zostaje płynem,
                    który trzeba szybko zużyć. Mleczarnie suszą głównie serwatkę słodką.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
                <CardHeader>
                  <CardTitle>Jak sprawdzić, jaką masz serwatkę</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Najprościej po tym, jaki ser robiłeś. Kwaśna jest też wyraźnie kwaśna w smaku. Dokładnie powie to
                    pasek do pH albo pH-metr: słodka ma pH 6–7, kwaśna 4,5–5,8 albo jeszcze niżej.
                  </p>
                  <p>
                    Jaka serwatka zostanie po serze, który dopiero planujesz, pokazuje{" "}
                    <Link to="/symulator-sera" className="text-primary underline">symulator sera</Link>.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10">
              <SekcjaFAQ slug="serwatka-slodka-i-kwasna" />

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

export default SerwatkaSlodkaKwasna;
