import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import SekcjaFAQ from "@/components/SekcjaFAQ";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";

/**
 * Strona O SERZE, osobna od przepisu /przepisy/camembert.
 *
 * Skad: 15.09.2026 raport aplikacji analitycznej pokazal 175 wyswietlen zapytania
 * "camembert" przy zerze klikniec (oczekiwane 3,1, szansa na przypadek ok. 4,5%).
 * Ogon zapytan to pytania o jedzenie, pieczenie, mrozenie i krojenie, a strona
 * przepisu odpowiada tylko na "jak zrobic".
 *
 * Eksperyment: gruyere i emmental dostaly odpowiedzi o serze NA stronie przepisu
 * (pole `encyklopedia`, 20.08.2026). Camembert sprawdza drugi sposob, osobna
 * strone, zeby porownac oba. Jesli sie przyjmie, ten sam uklad dostana inne sery
 * pod /sery/<nazwa>.
 *
 * Tresc 1:1 z mirrorem public/sery/camembert.html, FAQ w faqPoradnikow
 * ("sery-camembert"). Fakty tylko ze zrodel wymienionych na dole strony.
 */

const ZRODLA = [
  {
    tekst: "INAO: Cahier des charges de l'appellation d'origine „Camembert de Normandie”",
    url: "https://extranet.inao.gouv.fr/fichier/cdccamembertdenormandie.pdf",
  },
  { tekst: "NHS: Foods to avoid in pregnancy", url: "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/" },
  { tekst: "USDA FoodData Central: Cheese, camembert", url: "https://fdc.nal.usda.gov/" },
  { tekst: "BBC Good Food: Baked camembert", url: "https://www.bbcgoodfoodme.com/recipes/baked-camembert/" },
];

const SerCamembert = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Camembert: co to za ser, jak go jeść, piec i przechowywać",
    description:
      "Czym jest camembert, skąd pochodzi, czym różni się Camembert de Normandie od zwykłego, jak go jeść, kroić, piec, przechowywać i mrozić.",
    inLanguage: "pl",
    url: "https://mojaserowarnia.pl/sery/camembert",
    image: "https://mojaserowarnia.pl/og-image.jpg",
    datePublished: "2026-09-15",
    dateModified: "2026-09-15",
    publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
  };

  const seeAlsoLinks = [
    { title: "Przepis na camembert", href: "/przepisy/camembert", description: "Domowy camembert krok po kroku: kultury, podpuszczka, dojrzewanie." },
    { title: "Przepis na brie", href: "/przepisy/brie", description: "Najbliższy krewny camemberta, większy krąg i dłuższe dojrzewanie." },
    { title: "Tarta z camembertem", href: "/przepisy-kulinarne/rustykalna-tarta-camembert", description: "Camembert z karmelizowaną cebulą w kruchym cieście." },
    { title: "Penicillium candidum", href: "/kultury/penicillium-candidum", description: "Biała pleśń do camemberta i brie: szczepy i sklepy." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Navigation />
      <PageBreadcrumbs items={[{ label: "Camembert" }]} />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Info}
              color="amber"
              title="Camembert"
              subtitle="Miękki ser z Normandii z jadalną białą skórką. Co to za ser, skąd pochodzi, jak go jeść, kroić, piec i przechowywać."
            />

            <TLDRSection>
              <p>
                Camembert to <strong>miękki ser z mleka krowiego</strong> pokryty jadalną białą pleśnią. Wyjmij go z
                lodówki <strong>30–60 minut przed podaniem</strong>, krój jak tort od środka, a na ciepło piecz{" "}
                <strong>około 20 minut w 200°C</strong>. Mrozić można, ale konsystencja się pogarsza. Oryginalny{" "}
                <strong>Camembert de Normandie</strong> robi się wyłącznie z mleka surowego.
              </p>
            </TLDRSection>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Co to za ser</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Camembert to miękki ser podpuszczkowy z mleka krowiego. Z zewnątrz pokrywa go puszysta biała pleśń{" "}
                    <em>Penicillium camemberti</em>, w nazwach kultur serowarskich występująca też jako{" "}
                    <em>Penicillium candidum</em>. Pleśń dodaje się celowo: tworzy skórkę i w czasie dojrzewania
                    zmiękcza ser od zewnątrz.
                  </p>
                  <p>
                    Dlatego młody camembert ma pod skórką kremową warstwę, a w środku jaśniejszy, zwarty rdzeń. Dojrzały
                    jest miękki aż do środka. Według francuskiej specyfikacji smak jest lekko słony, najpierw mleczny i
                    łagodny, a z czasem wyraźniejszy i owocowy. Rudawe plamki na skórce dojrzałego sera to naturalne
                    bakterie powierzchniowe.
                  </p>
                  <p>
                    Białą pleśń do domowego sera kupisz jako kulturę:{" "}
                    <Link to="/kultury/penicillium-candidum" className="text-primary underline">
                      Penicillium candidum w bazie kultur
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skąd pochodzi camembert</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Nazwa pochodzi od wsi Camembert w Normandii, około 30 km na południe od Lisieux. Sery z okolic
                    Camembert sprzedawano na targu w Vimoutiers już na początku XVIII wieku: wspomina o nich słownik
                    Thomasa Corneille'a wydany w 1708 roku.
                  </p>
                  <p>
                    Popularna opowieść mówi, że camembert w dzisiejszej postaci zrobiła w 1791 roku Marie Harel, która
                    ukrywała w swoim gospodarstwie księdza Bonvousta i miała poznać od niego sposób wyrobu sera.
                    Francuska specyfikacja nazywa tę historię wprost niepotwierdzoną. Pewne jest, że jej potomkowie z
                    rodziny Paynel rozwijali produkcję w XIX wieku.
                  </p>
                  <p>
                    Około 1890 roku wymyślono drewniane pudełko, dzięki któremu ser dało się wysyłać daleko. W 1926 roku
                    francuski sąd uznał nazwę „camembert” za ogólną, dlatego camembert może dziś powstawać w dowolnym
                    kraju. Chroniona jest tylko nazwa Camembert de Normandie, z apelacją pochodzenia od 1983 roku.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Camembert de Normandie a zwykły camembert</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Cecha</th>
                          <th className="text-left p-2 font-semibold">Camembert de Normandie</th>
                          <th className="text-left p-2 font-semibold">Inny camembert</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Mleko", "wyłącznie surowe", "może być pasteryzowane"],
                          ["Krowy", "co najmniej 50% rasy normandzkiej, wypas minimum 6 miesięcy w roku", "bez wymogów"],
                          ["Skrzep do form", "w co najmniej 5 porcjach, co najmniej co 40 minut", "bez wymogów"],
                          ["Odsączanie", "samoistne, co najmniej 18 godzin", "bez wymogów"],
                          ["Dojrzewanie", "co najmniej 12 dni w 10–18°C", "bez wymogów"],
                          ["Wielkość", "10,5–11 cm średnicy, co najmniej 250 g", "dowolna"],
                          ["Opakowanie", "drewniane pudełko", "dowolne"],
                        ].map(([cecha, aop, inny]) => (
                          <tr key={cecha} className="border-b last:border-0">
                            <td className="p-2 font-medium">{cecha}</td>
                            <td className="p-2">{aop}</td>
                            <td className="p-2">{inny}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p>
                    Z jakiego mleka jest camembert kupiony w sklepie, sprawdzisz na etykiecie. Ma to znaczenie dla kobiet
                    w ciąży, o czym niżej w pytaniach.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jak jeść camembert i z czym</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Wyjmij ser z lodówki <strong>30–60 minut przed podaniem</strong>. Zimny camembert jest twardy i słabo
                    pachnie, w temperaturze pokojowej odzyskuje kremowość i aromat.
                  </p>
                  <p>
                    <strong>Skórkę się je.</strong> Jest częścią smaku, lekko grzybowa. Kto jej nie lubi, może ją
                    odkroić, ale ser traci wtedy część aromatu.
                  </p>
                  <p>
                    Camembert pasuje do bagietki i świeżego pieczywa, winogron, gruszki, jabłka, orzechów włoskich, miodu
                    i konfitury z żurawiny.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jak kroić camembert</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Krój jak tort: od środka do brzegu, na trójkąty. Każdy kawałek ma wtedy i skórkę, i środek, i nikt nie
                    dostaje samej skórki. Miękki ser najmniej przywiera do noża z otworami w ostrzu. Zwykły nóż wystarczy
                    przed każdym cięciem opłukać gorącą wodą i wytrzeć.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Camembert na ciepło: piekarnik, mikrofala, patelnia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <p className="font-semibold mb-1">Z piekarnika</p>
                    <p>
                      Zdejmij folię i papier. Jeśli pudełko jest z samego drewna, włóż ser z powrotem do niego, jeśli
                      nie, do małego naczynia żaroodpornego. Natnij wierzch, możesz dodać tymianek, czosnek albo odrobinę
                      miodu. Piecz <strong>około 20 minut w 200°C</strong> (180°C z termoobiegiem), aż środek będzie
                      płynny. Podawaj od razu, z grzankami do maczania.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Z mikrofali</p>
                    <p>
                      Zdejmij opakowanie, połóż ser na talerzu i podgrzewaj na średniej mocy. Zwykle wystarczają{" "}
                      <strong>1–2 minuty</strong>, zależnie od wielkości krążka. Sprawdzaj co 30 sekund, bo przegrzana
                      skórka pęka i ser wypływa.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Panierowany z patelni</p>
                    <p>
                      Zimny ser prosto z lodówki obtocz w mące, jajku i bułce tartej, a potem krótko smaż na rozgrzanym
                      oleju, aż panierka się zrumieni. Zimny środek daje panierce czas, zanim ser zacznie wypływać.
                    </p>
                  </div>
                  <p>
                    Pomysły na dania:{" "}
                    <Link to="/przepisy-kulinarne/rustykalna-tarta-camembert" className="text-primary underline">
                      tarta z camembertem i karmelizowaną cebulą
                    </Link>{" "}
                    oraz{" "}
                    <Link to="/przepisy-kulinarne/zapiekane-brie-miodem-orzechami" className="text-primary underline">
                      zapiekane brie z miodem i orzechami
                    </Link>
                    , ten sam sposób działa z camembertem.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jak przechowywać camembert</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Trzymaj camembert w lodówce, w oryginalnym opakowaniu albo w papierze do sera. Nie zawijaj go
                    szczelnie w folię spożywczą: ser z białą pleśnią potrzebuje dostępu powietrza, a pod folią zbiera się
                    wilgoć.
                  </p>
                  <p>
                    W lodówce camembert dojrzewa dalej: z czasem mięknie i pachnie mocniej. Wyraźny zapach amoniaku
                    oznacza, że ser jest przejrzały. O mrożeniu piszemy niżej w pytaniach.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wartości odżywcze camemberta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">W 100 g</th>
                          <th className="text-left p-2 font-semibold">Ilość</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Energia", "299 kcal"],
                          ["Białko", "19,8 g"],
                          ["Tłuszcz", "24,3 g"],
                          ["w tym nasycone", "15,3 g"],
                          ["Węglowodany", "0,5 g"],
                          ["Wapń", "388 mg"],
                          ["Sód", "842 mg (około 2,1 g soli)"],
                        ].map(([skladnik, ilosc]) => (
                          <tr key={skladnik} className="border-b last:border-0">
                            <td className="p-2 font-medium">{skladnik}</td>
                            <td className="p-2">{ilosc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p>
                    Dane USDA. Porcja 30 g, mniej więcej jedna ósma krążka 250 g, ma około 90 kcal. Sery różnych
                    producentów różnią się zawartością tłuszczu, dokładne wartości podaje etykieta.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
                <CardHeader>
                  <CardTitle>Jak zrobić camembert w domu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>
                    Do domowego camemberta potrzebujesz mleka, kultury mezofilnej, białej pleśni i podpuszczki. Ser
                    dojrzewa 3–5 tygodni w 11–13°C i wilgotności 90–95%, więc przyda się dojrzewalnia.
                  </p>
                  <p className="flex flex-wrap gap-x-4 gap-y-1">
                    <Link to="/przepisy/camembert" className="font-semibold text-primary underline">
                      Przepis na camembert krok po kroku
                    </Link>
                    <Link to="/dojrzewalnia-z-lodowki" className="font-semibold text-primary underline">
                      Dojrzewalnia z lodówki
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10">
              <SekcjaFAQ slug="sery-camembert" />

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

export default SerCamembert;
