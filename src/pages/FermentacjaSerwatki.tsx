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
import { FlaskConical } from "lucide-react";

/**
 * Dlaczego fermentacja serwatki staje i co zużywa resztę laktozy.
 *
 * Skąd: pytanie z formularza kontaktowego (7.10.2026) o kulturę, która
 * przefermentuje całą laktozę w serwatce. Plan i źródła wszystkich liczb:
 * ProjektyLLm/PLAN-serwatka.md i ZRODLA-serwatka.md (pliki poza repozytorium).
 *
 * Treść 1:1 z mirrorem public/fermentacja-serwatki.html, FAQ w faqPoradnikow
 * ("fermentacja-serwatki"). Liczby wyłącznie ze źródeł z listy na dole strony;
 * stosunek BZT i bilans ChZT laktozy to wyliczenia z tych liczb.
 */

const ZRODLA = [
  {
    tekst: "Pires i in. 2021, Dairy By-Products: A Review on the Valorization of Whey and Second Cheese Whey, Foods 10(5):1067",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8151190/",
  },
  {
    tekst: "pH wewnątrzkomórkowe Lactococcus lactis i Lactobacillus plantarum, Appl. Environ. Microbiol. (granice pH wzrostu)",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC124068/",
  },
  {
    tekst: "Kluyveromyces marxianus: białko jednokomórkowe i etanol z serwatki, Microorganisms",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11203209/",
  },
  {
    tekst: "Bioetanol z serwatki przy użyciu Kluyveromyces marxianus, J. Ind. Microbiol. Biotechnol.",
    url: "https://doi.org/10.1007/s10295-010-0771-0",
  },
  {
    tekst: "Buchanan i in. 2023, Recent advances in whey processing and valorisation, Int. J. Dairy Technol.",
    url: "https://onlinelibrary.wiley.com/doi/10.1111/1471-0307.12935",
  },
  {
    tekst: "Rozporządzenie MRiRW z 12.10.2023 w sprawie listy substratów do biogazowni rolniczej, Dz.U. 2023 poz. 2230",
    url: "https://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU20230002230/O/D20232230.pdf",
  },
  {
    tekst: "Główny Inspektorat Sanitarny: znakowanie środków spożywczych komunikatem „bez laktozy”",
    url: "https://www.gov.pl/web/gis/znakowanie-srodkow-spozywczych-komunikatem-bez-laktozy",
  },
];

const SKLAD = [
  ["pH", "6–7", "4,5–5,8"],
  ["Laktoza", "46–52 g/l", "44–46 g/l"],
  ["Białko", "6–10 g/l", "6–8 g/l"],
  ["Tłuszcz", "5–6 g/l", "5–6 g/l"],
  ["Składniki mineralne", "2,5–4 g/l", "4,3–7,2 g/l"],
];

const CELE: { cel: string; sposob: React.ReactNode }[] = [
  {
    cel: "Napój",
    sposob: (
      <>
        kultura kefirowa albo ziarna kefirowe:{" "}
        <Link to="/kultury/kfb1-2" className="text-primary underline">KFB1/2</Link>,{" "}
        <Link to="/kultury/micromilk-kefir-kfb1" className="text-primary underline">microMilk Kefir KFB1</Link>,{" "}
        <Link to="/kultury/grzybek-kefirowy-tybetanski" className="text-primary underline">grzybek kefirowy</Link>
      </>
    ),
  },
  { cel: "Alkohol", sposob: "drożdże Kluyveromyces marxianus; destylacja w domu jest w Polsce nielegalna" },
  { cel: "Kwas mlekowy, mleczan", sposob: "bakterie mlekowe i zobojętnianie kwasu w trakcie fermentacji" },
  {
    cel: "Pasza",
    sposob: (
      <>
        wystarczy częściowe ukwaszenie, patrz{" "}
        <Link to="/serwatka-dla-zwierzat" className="text-primary underline">serwatka dla zwierząt</Link>
      </>
    ),
  },
  {
    cel: "Ricotta",
    sposob: (
      <>
        to nie fermentacja, tylko temperatura i kwas, i tylko z serwatki słodkiej:{" "}
        <Link to="/przepisy/ricotta" className="text-primary underline">przepis na ricottę</Link>
      </>
    ),
  },
  { cel: "Produkt bez laktozy", sposob: "enzym laktaza, nie fermentacja" },
  { cel: "Pozbycie się serwatki", sposob: "biogazownia albo odbiorca, który ją zużyje" },
];

const FermentacjaSerwatki = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Fermentacja serwatki: dlaczego staje i jak zużyć laktozę",
    description:
      "Dlaczego bakterie mlekowe przestają fermentować serwatkę, zanim zużyją laktozę, i co zużywa resztę: drożdże Kluyveromyces, zobojętnianie kwasu, laktaza, biogaz.",
    inLanguage: "pl",
    url: "https://mojaserowarnia.pl/fermentacja-serwatki",
    image: "https://mojaserowarnia.pl/og-image.jpg",
    datePublished: "2026-10-08",
    dateModified: "2026-10-08",
    publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
  };

  const seeAlsoLinks = [
    { title: "Serwatka dla zwierząt", href: "/serwatka-dla-zwierzat", description: "Świnie, drób, psy: ile serwatki i w jakiej postaci." },
    { title: "Przepis na ricottę", href: "/przepisy/ricotta", description: "Białka, które zostały w serwatce po serze podpuszczkowym." },
    { title: "Kefir domowy", href: "/przepisy/kefir-domowy", description: "Kultury kefirowe i ziarna: bakterie razem z drożdżami." },
    { title: "Baza kultur", href: "/baza-kultur", description: "Kultury kefirowe z drożdżami Kluyveromyces i ceny w sklepach." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Navigation />
      <PageBreadcrumbs items={[{ label: "Poradniki", href: "/poradniki" }, { label: "Fermentacja serwatki" }]} />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={FlaskConical}
              color="amber"
              title="Fermentacja serwatki"
              subtitle="Dlaczego bakterie mlekowe stają, zanim zjedzą laktozę, i co może zużyć resztę cukru."
            />

            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="fermentacja-serwatki" variant="default" />
            </div>

            <TLDRSection>
              <p>
                Bakterie mlekowe hamuje kwas, który same wytwarzają, więc stają, zanim zjedzą laktozę. Nawet kwaśna
                serwatka z twarogu ma jeszcze <strong>44–46 g laktozy w litrze</strong>, a słodka 46–52 g. Żeby
                zniknęła cała, trzeba w trakcie <strong>usuwać kwas</strong> albo dodać <strong>drożdże
                Kluyveromyces</strong>, którym kwas nie przeszkadza. Uwaga: fermentacja mlekowa{" "}
                <strong>nie zmniejsza szkodliwości serwatki dla środowiska</strong>.
              </p>
            </TLDRSection>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dlaczego fermentacja serwatki staje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Bakterie mlekowe zamieniają laktozę w kwas mlekowy. Kwas obniża pH, a im niższe pH, tym wolniej
                    bakterie pracują. <em>Lactococcus lactis</em>, główna bakteria kultur mezofilnych, rośnie
                    najlepiej przy pH około 6,5, poniżej pH 5 wyraźnie zwalnia, a przy pH około 4,0 przestaje rosnąć.
                    Pałeczki z kultur termofilnych znoszą bardziej kwaśne środowisko, ale też w końcu stają.
                  </p>
                  <p>
                    To nie jest wada kultury. Każda bakteria mlekowa sama się w ten sposób zatrzymuje, więc żadna
                    „lepsza” kultura mlekowa nie przefermentuje serwatki do zera, dopóki kwas zostaje w płynie.
                  </p>
                  <p>Ile cukru zostaje, widać po porównaniu serwatki słodkiej z kwaśną:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Składnik</th>
                          <th className="text-left p-2 font-semibold">Serwatka słodka (sery podpuszczkowe)</th>
                          <th className="text-left p-2 font-semibold">Serwatka kwaśna (twaróg, sery kwasowe)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SKLAD.map(([skladnik, slodka, kwasna]) => (
                          <tr key={skladnik} className="border-b last:border-0">
                            <td className="p-2 font-medium">{skladnik}</td>
                            <td className="p-2">{slodka}</td>
                            <td className="p-2">{kwasna}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p>
                    Serwatka kwaśna przeszła już fermentację mlekową, a laktozy ma prawie tyle samo co słodka.
                    Bakterie zużywają więc tylko niewielką część cukru, zanim kwas je zatrzyma.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cztery sposoby na resztę laktozy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 text-sm leading-relaxed">
                  <div>
                    <p className="font-semibold mb-1">1. Drożdże Kluyveromyces</p>
                    <p>
                      Zwykłe drożdże piekarskie i winiarskie (<em>Saccharomyces cerevisiae</em>) laktozy nie ruszają,
                      bo nie mają enzymu, który ją rozcina. Drożdże <em>Kluyveromyces marxianus</em> go mają.
                      Zamieniają laktozę w alkohol i dwutlenek węgla, w badaniach około 0,5 g alkoholu z 1 g laktozy,
                      także w kwaśnej serwatce i bez regulowania pH. Najlepiej pracują w 30–35°C.
                    </p>
                    <p className="mt-2">
                      Czystej kultury tych drożdży do serwatki w polskich sklepach serowarskich nie znaleźliśmy. Są
                      za to w kulturach kefirowych: <em>K. marxianus</em> mają{" "}
                      <Link to="/kultury/kfb1-2" className="text-primary underline">KFB1/2</Link> i{" "}
                      <Link to="/kultury/micromilk-kefir-kfb1" className="text-primary underline">microMilk Kefir KFB1</Link>.
                      Drożdże zawierają też{" "}
                      <Link to="/kultury/grzybek-kefirowy-tybetanski" className="text-primary underline">ziarna kefirowe</Link>.
                      Ile laktozy taka kultura zużyje w serwatce, zależy od czasu i temperatury, i trzeba to sprawdzić
                      w próbie.
                    </p>
                    <p className="mt-2">
                      Napoje fermentowane zrobione w domu na własny użytek są zwolnione z akcyzy. Domowa destylacja
                      alkoholu jest w Polsce nielegalna, także na własny użytek (uchwała Sądu Najwyższego z 30.11.2004,
                      I KZP 23/04).
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">2. Zobojętnianie kwasu w trakcie fermentacji</p>
                    <p>
                      Jeśli w trakcie fermentacji dodawać zasadę, na przykład węglan wapnia, pH nie spada i bakterie
                      mlekowe pracują dalej, aż skończy się cukier. Tak przemysł robi kwas mlekowy z serwatki.
                      Produktem jest jednak mleczan wapnia, a nie kwaśna serwatka, a w domu trudno to kontrolować.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">3. Laktaza</p>
                    <p>
                      Enzym laktaza rozkłada laktozę na glukozę i galaktozę. Cukier nie znika, serwatka robi się
                      słodsza, ale nie ma w niej laktozy. Tak powstają produkty mleczne „bez laktozy”. Główny
                      Inspektorat Sanitarny zaleca, żeby tak oznaczać tylko produkty, które mają najwyżej 10 mg
                      laktozy na 100 g.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">4. Biogazownia</p>
                    <p>
                      W biogazowni bakterie rozkładają laktozę do metanu i dwutlenku węgla. Serwatka jest wprost na
                      urzędowej liście substratów biogazowni rolniczej.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
                <CardHeader>
                  <CardTitle>Fermentacja mlekowa nie oczyszcza serwatki</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Serwatka szkodzi wodom, bo bakterie rozkładające jej cukier zużywają tlen. Ma BZT (biologiczne
                    zapotrzebowanie na tlen) 27–60 g/l, a ścieki miejskie około 0,2 g/l, czyli serwatka obciąża wodę
                    135–300 razy mocniej. Ponad 90% tego ładunku pochodzi z laktozy.
                  </p>
                  <p>
                    Fermentacja mlekowa tego nie zmienia. Z 1 g laktozy powstaje 1,05 g kwasu mlekowego, a do jego
                    rozłożenia potrzeba tyle samo tlenu co do rozłożenia laktozy. Cukier zamienia się w kwas, a
                    ładunek zostaje.
                  </p>
                  <p>
                    Obciążenie maleje dopiero wtedy, gdy węgiel opuszcza płyn jako gaz, czyli w biogazowni, albo gdy
                    serwatkę się zużywa: jako paszę, na ricottę albo w przetwórni.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Co chcesz osiągnąć i czym</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Cel</th>
                          <th className="text-left p-2 font-semibold">Sposób</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CELE.map(({ cel, sposob }) => (
                          <tr key={cel} className="border-b last:border-0">
                            <td className="p-2 font-medium">{cel}</td>
                            <td className="p-2">{sposob}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10">
              <SekcjaFAQ slug="fermentacja-serwatki" />

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
                <p className="mt-2">
                  Stosunek BZT i bilans tlenu dla laktozy i kwasu mlekowego to nasze wyliczenia z liczb podanych w
                  źródłach.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FermentacjaSerwatki;
