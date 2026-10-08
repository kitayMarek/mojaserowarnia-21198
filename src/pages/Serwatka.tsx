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
import { Milk } from "lucide-react";

/**
 * Strona-matka o serwatce: kiedy pożytek, kiedy problem, co z nią zrobić.
 *
 * Plan: ProjektyLLm/PLAN-serwatka.md (strona A), źródła liczb:
 * ProjektyLLm/ZRODLA-serwatka.md (pliki poza repozytorium). Tabela „kto”
 * stoi na górze z decyzji Marka (8.10.2026).
 *
 * Treść 1:1 z mirrorem public/serwatka.html, FAQ w faqPoradnikow ("serwatka").
 */

const ZRODLA = [
  {
    tekst: "Pires i in. 2021, Dairy By-Products: A Review on the Valorization of Whey and Second Cheese Whey, Foods 10(5):1067",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8151190/",
  },
  {
    tekst: "Buchanan i in. 2023, Recent advances in whey processing and valorisation, Int. J. Dairy Technol.",
    url: "https://onlinelibrary.wiley.com/doi/10.1111/1471-0307.12935",
  },
  {
    tekst: "Rozporządzenie (WE) nr 1069/2009 o produktach ubocznych pochodzenia zwierzęcego, art. 14",
    url: "https://www.legislation.gov.uk/eur/2009/1069/article/14",
  },
  {
    tekst: "Rozporządzenie MRiRW z 12.10.2023 w sprawie listy substratów do biogazowni rolniczej, Dz.U. 2023 poz. 2230",
    url: "https://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU20230002230/O/D20232230.pdf",
  },
  {
    tekst: "Robbins i Lehrsch 1992, serwatka kwaśna a gleba sodowa, USDA ARS",
    url: "https://www.ars.usda.gov/research/publications/publication/?seqNo115=59564",
  },
  {
    tekst: "Lehrsch, Robbins, Brown 2008, serwatka w bruzdach nawadnianych, Bioresource Technology 99(17)",
    url: "https://pubmed.ncbi.nlm.nih.gov/18439823",
  },
];

const KTO: { kto: string; czym: string; co: React.ReactNode }[] = [
  {
    kto: "Serowar domowy",
    czym: "pożytek",
    co: (
      <>
        kilka litrów:{" "}
        <Link to="/przepisy/ricotta" className="text-primary underline">ricotta</Link>, pieczenie chleba, napój
      </>
    ),
  },
  {
    kto: "Gospodarstwo ze świniami",
    czym: "pożytek",
    co: (
      <>
        tania pasza, patrz{" "}
        <Link to="/serwatka-dla-zwierzat" className="text-primary underline">serwatka dla zwierząt</Link>
      </>
    ),
  },
  {
    kto: "Mała serowarnia bez zwierząt",
    czym: "problem",
    co: "setki litrów dziennie, krótki termin, trzeba znaleźć odbiorcę: rolnika ze świniami albo biogazownię",
  },
  {
    kto: "Duża mleczarnia",
    czym: "pożytek",
    co: "surowiec: proszek serwatkowy, koncentraty białka, laktoza",
  },
];

const Serwatka = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Serwatka: pożytek czy problem i co z nią zrobić",
    description:
      "Kiedy serwatka jest paszą i surowcem, a kiedy kłopotem: ile jej powstaje, skład, ricotta, obciążenie środowiska, przepisy i serwatka w ogrodzie.",
    inLanguage: "pl",
    url: "https://mojaserowarnia.pl/serwatka",
    image: "https://mojaserowarnia.pl/og-image.jpg",
    datePublished: "2026-10-08",
    dateModified: "2026-10-08",
    publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
  };

  const seeAlsoLinks = [
    { title: "Fermentacja serwatki", href: "/fermentacja-serwatki", description: "Dlaczego ukwaszenie zużywa tylko część laktozy i co zużywa resztę." },
    { title: "Serwatka dla zwierząt", href: "/serwatka-dla-zwierzat", description: "Świnie, drób, psy: ile serwatki i w jakiej postaci." },
    { title: "Przepis na ricottę", href: "/przepisy/ricotta", description: "Białka, które zostały w serwatce po serze podpuszczkowym." },
    { title: "Symulator sera", href: "/symulator-sera", description: "Sprawdź, po jakim serze serwatka nada się jeszcze na ricottę." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Navigation />
      <PageBreadcrumbs items={[{ label: "Poradniki", href: "/poradniki" }, { label: "Serwatka" }]} />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Milk}
              color="amber"
              title="Serwatka: pożytek czy problem"
              subtitle="Z kilograma sera zostaje 9–10 litrów serwatki. Czym jest, kiedy się przydaje, kiedy szkodzi i co z nią zrobić."
            />

            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="serwatka" variant="default" />
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Dla kogo pożytek, dla kogo problem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-secondary/50">
                        <th className="text-left p-2 font-semibold">Kto</th>
                        <th className="text-left p-2 font-semibold">Serwatka to zwykle</th>
                        <th className="text-left p-2 font-semibold">Co z nią robi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {KTO.map(({ kto, czym, co }) => (
                        <tr key={kto} className="border-b last:border-0">
                          <td className="p-2 font-medium">{kto}</td>
                          <td className={`p-2 font-semibold ${czym === "problem" ? "text-red-600" : "text-green-700"}`}>{czym}</td>
                          <td className="p-2">{co}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <TLDRSection>
              <p>
                Serwatka to w ponad 90% woda, ale reszta jest cenna: laktoza i białka serwatkowe. Dla kogoś, kto ma
                świnie albo przetwórnię, to pasza i surowiec. Dla kogoś bez odbiorcy to kłopot, bo szybko się psuje,
                a wylana do wody czy rowu obciąża ją <strong>135–300 razy mocniej</strong> niż ścieki z domu. Do
                zakwaszania gleby pod borówki się nie nadaje.
              </p>
            </TLDRSection>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ile jej jest i co w niej jest</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Z kilograma sera zostaje <strong>9–10 litrów serwatki</strong>. Na świecie powstaje jej około 160
                    milionów ton rocznie.
                  </p>
                  <p>
                    W litrze serwatki jest 44–52 g laktozy, 6–10 g białka, 5–6 g tłuszczu i kilka gramów składników
                    mineralnych. Serwatka słodka zostaje po serach podpuszczkowych, kwaśna po twarogu i serach
                    kwasowych. Kwaśna ma mniej laktozy, więcej składników mineralnych i niższe pH. Porównanie obu:{" "}
                    <Link to="/fermentacja-serwatki" className="text-primary underline">fermentacja serwatki</Link>.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dlaczego pożytek</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <ul className="list-disc space-y-2 pl-5">
                    <li>
                      <strong>Ricotta.</strong> Białka serwatkowe zostają w serwatce po serze podpuszczkowym i ścina je
                      dopiero wysoka temperatura z kwasem.{" "}
                      <Link to="/przepisy/ricotta" className="text-primary underline">Przepis na ricottę</Link>. Po
                      twarogu serwatka jest wyczerpana i ricotty z niej nie będzie.
                    </li>
                    <li>
                      <strong>Pasza.</strong> Najlepiej dla świń, drobiowi tylko w małych ilościach i ukwaszona:{" "}
                      <Link to="/serwatka-dla-zwierzat" className="text-primary underline">serwatka dla zwierząt</Link>.
                    </li>
                    <li>
                      <strong>Kuchnia.</strong> Zamiast wody do chleba i placków, do zup, jako napój.
                    </li>
                    <li>
                      <strong>Przetwórstwo.</strong> Mleczarnie suszą serwatkę na proszek, wydzielają z niej białko
                      (podstawa odżywek białkowych) i laktozę. Dla nich serwatka jest towarem, nie odpadem.
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dlaczego problem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    <strong>Obciąża wodę.</strong> Bakterie, które rozkładają cukier z serwatki, zużywają tlen.
                    Serwatka ma BZT (biologiczne zapotrzebowanie na tlen) 27–60 g/l, a ścieki miejskie około 0,2 g/l.
                    Ponad 90% tego ładunku pochodzi z laktozy. Wylana do rowu czy rzeki zabiera tlen rybom.
                    Ukwaszenie tego nie zmienia: cukier zamienia się w kwas, a ładunek zostaje.
                  </p>
                  <p>
                    <strong>Szybko się psuje.</strong> Trzeba ją zużyć albo oddać w ciągu kilku dni, a w cieple
                    szybciej.
                  </p>
                  <p>
                    <strong>Jest ciężka i tania.</strong> To głównie woda, więc wożenie jej daleko się nie opłaca, a
                    suszarnię ma tylko duża mleczarnia.
                  </p>
                  <p>
                    <strong>Kwaśna jest trudniejsza.</strong> Serwatka po twarogu nie da ricotty, ma więcej
                    składników mineralnych i jest gorszą paszą niż słodka.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Co mówią przepisy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Serwatka to produkt uboczny pochodzenia zwierzęcego w rozumieniu unijnego rozporządzenia
                    1069/2009, a polska lista substratów biogazowni zalicza ją do materiału kategorii 3. Nadzoruje to
                    Inspekcja Weterynaryjna.
                  </p>
                  <ul className="list-disc space-y-2 pl-5">
                    <li>
                      <strong>Własne zwierzęta</strong> we własnym gospodarstwie: bez wątpliwości.
                    </li>
                    <li>
                      <strong>Na pole bez przetworzenia:</strong> rozporządzenie pozwala tak użyć produktów z mleka
                      surowego, jeśli właściwy organ nie widzi ryzyka chorób. Czy dotyczy to serwatki z mleka
                      pasteryzowanego, rozstrzyga organ, więc zapytaj powiatowego lekarza weterynarii.
                    </li>
                    <li>
                      <strong>Biogazownia:</strong> serwatka jest wprost na urzędowej liście substratów biogazowni
                      rolniczej.
                    </li>
                    <li>
                      <strong>Kanalizacja:</strong> tylko za zgodą operatora i na jego warunkach, nigdy do
                      kanalizacji deszczowej. Zapytaj swoje wodociągi.
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Serwatka w ogrodzie i pod borówkę</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Mała ilość rozcieńczonej serwatki ogrodowi nie zaszkodzi. Jako sposób na zakwaszenie gleby, na
                    przykład pod borówkę, się nie sprawdzi.
                  </p>
                  <p>
                    Badań serwatki pod borówką nie znaleźliśmy. Amerykańska służba rolna USDA badała serwatkę na
                    glebach zasadowych: obniżała ich pH i poprawiała strukturę gleby. Badacze ostrzegają jednak, że duże
                    dawki zasalają glebę przy korzeniach, a nadmiar materii organicznej chwilowo pogarsza wsiąkanie
                    wody.
                  </p>
                  <p>
                    Do tego nasze rozumowanie, nie wynik badania: kwas mlekowy bakterie glebowe rozkładają w kilka dni,
                    więc zakwaszenie jest krótkie, a wapń, potas i sód z serwatki zostają. Borówka ma płytkie korzenie i
                    źle znosi zasolenie. Trwale zakwasza glebę siarka.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
                <CardHeader>
                  <CardTitle>Co zrobić z serwatką</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed">
                  <ol className="list-decimal space-y-2 pl-5">
                    <li>
                      Po serze podpuszczkowym najpierw{" "}
                      <Link to="/przepisy/ricotta" className="text-primary underline">ricotta</Link>.
                    </li>
                    <li>
                      Potem{" "}
                      <Link to="/serwatka-dla-zwierzat" className="text-primary underline">zwierzęta</Link>: świnie
                      przede wszystkim.
                    </li>
                    <li>Nadwyżka: kuchnia albo rozcieńczona do ogrodu, w małych ilościach.</li>
                    <li>Duże ilości bez odbiorcy: umowa z rolnikiem albo z biogazownią.</li>
                    <li>
                      Chcesz zużyć laktozę albo zrobić z serwatki napój:{" "}
                      <Link to="/fermentacja-serwatki" className="text-primary underline">fermentacja serwatki</Link>.
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10">
              <SekcjaFAQ slug="serwatka" />

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
                  Stosunek BZT serwatki i ścieków to nasze wyliczenie z liczb podanych w źródłach.
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

export default Serwatka;
