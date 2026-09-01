import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LifeBuoy, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ReactionButton from "@/components/ReactionButton";
import TLDRSection from "@/components/TLDRSection";
import WprowadzenieDzialu from "@/components/WprowadzenieDzialu";
import SeeAlso from "@/components/SeeAlso";
import SekcjaFAQ from "@/components/SekcjaFAQ";
import OstrzezenieSol from "@/components/OstrzezenieSol";
import { Link } from "react-router-dom";

const NieudanySer = () => {
  const faqData = [
    {
      question: "Czy można jeść ser z pleśnią na powierzchni?",
      answer:
        "To zależy od twardości sera. Przy serach twardych i półtwardych (gouda, cheddar, parmezan) pleśń powierzchniowa nie wnika głęboko — odkrój co najmniej 2–3 cm zapasu wokół i pod plamą, nie dotykając nożem czystej części, a resztę można zjeść. Przy serach miękkich, świeżych, twarogu i ricotcie obowiązuje zasada odwrotna: strzępki grzybni przerastają całą masę, więc taki ser wyrzuca się w całości. Nie dotyczy to oczywiście pleśni celowo wprowadzonych, jak Penicillium camemberti czy roqueforti.",
    },
    {
      question: "Co zrobić z serem, który jest za twardy i kruszy się?",
      answer:
        "Najczęstsza przyczyna to zbyt drobne pocięcie skrzepu, zbyt agresywne dogrzewanie albo za długie osuszanie ziarna. Ser jest w pełni jadalny — po prostu ma inną teksturę niż zakładałeś. Najlepsze wyjścia: zetrzeć na tarce i używać do zapiekanek i past, albo przerobić na ser topiony z solami emulgującymi, który zamienia kruchą masę w gładką i smarowną. To najskuteczniejszy sposób uratowania nieudanej partii.",
    },
    {
      question: "Ser wyszedł gorzki — da się to uratować?",
      answer:
        "Gorycz pochodzi zwykle z nadmiaru podpuszczki, niekontrolowanej proteolizy lub zbyt wysokiej temperatury dojrzewania. Czasem sama mija: przy serach dojrzewających warto dać im jeszcze 4–8 tygodni w niższej temperaturze, około 10°C, bo gorzkie peptydy bywają dalej rozkładane. Jeśli po tym czasie gorycz zostaje, ser nadaje się na topiony albo do potraw, gdzie ginie wśród innych smaków. Na przyszłość: zmniejsz dawkę podpuszczki i obniż temperaturę dojrzewania.",
    },
    {
      question: "Kiedy nieudany ser trzeba wyrzucić, a nie ratować?",
      answer:
        "Wyrzuć bez wahania, gdy: ser ma zgniły, siarkowy lub amoniakalny zapach; jest wzdęty i rozdyma się od gazu (to zwykle bakterie z grupy coli lub Clostridium); pojawiło się różowe lub czerwone przebarwienie w miąższu; wypływa z niego śluz o nieprzyjemnym zapachu; pleśń pojawiła się w serze miękkim lub świeżym. Zasada nadrzędna: jeśli masz wątpliwości co do bezpieczeństwa, nie kombinuj — ani dla siebie, ani dla zwierząt.",
    },
    {
      question: "Czy nieudany ser można dać kurom?",
      answer:
        "W małych ilościach tak — ser to skoncentrowane białko i tłuszcz, a drób chętnie go zjada. Problemem jest jednak sól: ser zawiera zwykle 1,5–2% NaCl, a drób jest na sól bardzo wrażliwy. Traktuj ser jako przysmak, nie jako składnik dawki — orientacyjnie do kilkunastu gramów na kurę dziennie, pokruszony i podany osobno. Nigdy nie podawaj sera spleśniałego, zjełczałego ani mocno solonego. Znacznie lepszym odbiorcą większych ilości są świnie.",
    },
    {
      question: "Czy psu można dać nieudany ser?",
      answer:
        "Niewielkie ilości sera podpuszczkowego zwykle nie szkodzą, ale część psów źle toleruje laktozę, a ser jest tłusty i słony. Bezwzględnie nie podawaj psu serów pleśniowych typu roquefort czy gorgonzola — zawierają roquefortynę C, która u psów wywołuje drżenia mięśniowe i drgawki. Ser spleśniały przypadkowo jest jeszcze gorszym pomysłem ze względu na mykotoksyny.",
    },
    {
      question: "Ser nie chce się ściąć — co poszło nie tak?",
      answer:
        "Trzy najczęstsze przyczyny. Pierwsza: mleko UHT, którego białka są zbyt uszkodzone, by utworzyć skrzep — tego nie da się naprawić. Druga: brak chlorku wapnia przy mleku pasteryzowanym, dawkę 0,2–0,3 g na litr trzeba było dodać przed podpuszczką. Trzecia: przeterminowana lub źle przechowywana podpuszczka, która straciła moc. Jeśli mleko jest tylko lekko ścięte, spróbuj podnieść temperaturę o 2°C i dać jeszcze 30 minut; jeśli nie zadziała, przerób mleko na ser kwasowy lub twaróg.",
    },
    {
      question: "Jak zapobiegać nieudanym partiom sera?",
      answer:
        "Prowadź notatki z każdej partii: temperatury, czasy, pH, dawki i wynik. Większość nieudanych serów powtarza ten sam błąd, który widać dopiero w zestawieniu kilku warzeń. Zainwestuj w pH-metr — to najczęściej brakujące ogniwo między przepadkiem a powtarzalnością. Kontroluj też stabilność dojrzewalni: wahania temperatury i wilgotności psują więcej partii niż błędy w samym warzeniu.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Nieudany ser — kiedy ratować, jak przerobić, kiedy wyrzucić",
        description:
          "Diagnostyka nieudanego sera: pleśń na twardym vs miękkim, gorycz, kruszenie, brak skrzepu. Ścieżki odzysku (ser topiony, tarcie), bezpieczne skarmianie zwierzętami i sygnały, przy których ser trzeba wyrzucić.",
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/nieudany-ser",
        image: "https://mojaserowarnia.pl/og-image.png",
        publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqData.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  const seeAlsoLinks = [
    { title: "Przepis na ser topiony", href: "/przepisy/ser-topiony", description: "Główna ścieżka ratunku — sole emulgujące zamieniają kruchą masę w gładką." },
    { title: "Serwatka dla zwierząt", href: "/serwatka-dla-zwierzat", description: "Drugi produkt uboczny: dawki dla świń, drobiu i cieląt." },
    { title: "Poradnik dla serowarów", href: "/poradnik", description: "Typowe błędy procesu i jak ich uniknąć w kolejnej partii." },
    { title: "Dojrzewalnia z lodówki", href: "/dojrzewalnia-z-lodowki", description: "Niestabilny klimat psuje więcej partii niż błędy w warzeniu." },
  ];

  const diagnoza = [
    { objaw: "Kruchy, rozsypuje się", przyczyna: "za drobne ziarno, agresywne dogrzewanie", ratunek: "ser topiony, tarcie do zapiekanek", jadalny: true },
    { objaw: "Gumowaty, zbyt twardy", przyczyna: "za mocne prasowanie, zbyt niska wilgotność", ratunek: "tarcie, dłuższe dojrzewanie", jadalny: true },
    { objaw: "Miękki, rozpływa się", przyczyna: "słaby skrzep, za wczesne krojenie", ratunek: "jeść na świeżo, dosolić, odsączyć", jadalny: true },
    { objaw: "Gorzki", przyczyna: "nadmiar podpuszczki, proteoliza", ratunek: "4–8 tyg. w 10°C, potem topiony", jadalny: true },
    { objaw: "Pleśń na serze twardym", przyczyna: "wilgoć w dojrzewalni, brak obracania", ratunek: "odkroić 2–3 cm zapasu", jadalny: true },
    { objaw: "Pleśń na serze miękkim", przyczyna: "grzybnia przerasta całą masę", ratunek: "brak — wyrzucić w całości", jadalny: false },
    { objaw: "Wzdęty w pierwszych dniach", przyczyna: "bakterie coli — zła higiena udoju", ratunek: "brak — wyrzucić", jadalny: false },
    { objaw: "Wzdęty po tygodniach, zapach masła", przyczyna: "Clostridium z kiszonki (wzdęcia późne)", ratunek: "brak — wyrzucić; usuń przyczynę w oborze", jadalny: false },
    { objaw: "Różowe lub czerwone plamy", przyczyna: "zanieczyszczenie bakteryjne", ratunek: "brak — wyrzucić", jadalny: false },
    { objaw: "Zapach zgniły, siarkowy, amoniakalny", przyczyna: "rozkład gnilny", ratunek: "brak — wyrzucić", jadalny: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Poradniki", href: "/poradniki" },
          { label: "Nieudany ser" },
        ]}
      />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={LifeBuoy}
              color="amber"
              title="Nieudany ser — ratować czy wyrzucić?"
              subtitle="Większość nieudanych serów jest w pełni bezpieczna — po prostu mają inną teksturę niż zakładałeś. Ale kilka objawów oznacza, że ser trzeba wyrzucić bez kombinowania."
            />

            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="nieudany-ser" variant="default" />
            </div>

            <WprowadzenieDzialu

              lead={"Ser się nie udał. Pierwsze pytanie nie brzmi jednak „jak go uratować”, tylko „czy to jeszcze wolno zjeść”."}

              podsumowanie={"Nie każdy nieudany ser nadaje się do odzysku, ale też nie każdy trzeba wyrzucać. Ten poradnik prowadzi od objawu — wzdęcia, goryczy, gumowatej struktury, pleśni, której się nie spodziewałeś — do przyczyny, i mówi wprost, kiedy przestać kombinować."}

              tropy={[

                {

                  sytuacja: "Zanim wyrzucisz",

                  propozycja: "— część nieudanych serów da się przetopić:",

                  href: "/przepisy/ser-topiony",

                  etykieta: "ser topiony",

                },

                {

                  sytuacja: "Chcesz wiedzieć, skąd to się wzięło",

                  propozycja: "— większość wad powstaje przed garnkiem:",

                  href: "/wady-mleka-a-wady-sera",

                  etykieta: "wady mleka a wady sera",

                },

                {

                  sytuacja: "Ser wysechł albo spękał w dojrzewaniu",

                  propozycja: "— zwykle to wina warunków, nie przepisu:",

                  href: "/dojrzewalnia-z-lodowki",

                  etykieta: "dojrzewalnia z lodówki",

                },

                {

                  sytuacja: "Serwatki też nie wylewaj",

                  propozycja: "— ma laktozę, białka i potas:",

                  href: "/serwatka-dla-zwierzat",

                  etykieta: "serwatka dla zwierząt",

                },

              ]}

            />

            <TLDRSection>
              <p>
                Najpierw sprawdź <strong>bezpieczeństwo</strong>, dopiero potem myśl o odzysku.
                Ser <strong>wzdęty, różowiejący albo o zgniłym zapachu</strong> — do wyrzucenia.
                Pleśń na serze <strong>twardym</strong> — odkrój 2–3 cm zapasu i jedz; na{" "}
                <strong>miękkim</strong> — wyrzuć w całości. Ser bezpieczny, ale nieudany w
                teksturze, najlepiej przerobić na{" "}
                <strong>ser topiony</strong> lub zetrzeć. Skarmianie zwierzętami dopiero na
                końcu i <strong>nigdy serem spleśniałym</strong>.
              </p>
            </TLDRSection>

            <div className="space-y-6">
              <Card className="border-destructive/40 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Krok 0: czy ser jest bezpieczny?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>Wyrzuć bez wahania, jeśli występuje którykolwiek z tych objawów:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>zapach <strong>zgniły, siarkowy lub amoniakalny</strong>,</li>
                    <li>ser jest <strong>wzdęty</strong>, rozdyma się od gazu (bakterie coli lub Clostridium),</li>
                    <li><strong>różowe lub czerwone</strong> przebarwienia w miąższu,</li>
                    <li>wypływający <strong>śluz</strong> o nieprzyjemnym zapachu,</li>
                    <li><strong>pleśń w serze miękkim, świeżym lub twarogu</strong> — grzybnia przerasta całą masę.</li>
                  </ul>
                  <p className="pt-1">
                    Zasada nadrzędna: <strong>jeśli masz wątpliwości, nie kombinuj</strong> — ani dla
                    siebie, ani dla zwierząt. Ser wart jest mniej niż leczenie stada.
                  </p>
                  <p className="pt-1">
                    <strong>Ser wzdęty po tygodniach dojrzewania, cuchnący zjełczałym masłem</strong>{" "}
                    to osobny przypadek — <em>wzdęcia późne</em> od przetrwalników{" "}
                    <em>Clostridium</em> pochodzących z kiszonki. Przyczyna leży w oborze, nie w
                    kotle, a pasteryzacja przed tym nie chroni. Cały łańcuch i sposoby zapobiegania:{" "}
                    <Link to="/wady-mleka-a-wady-sera" className="text-primary hover:underline font-medium">
                      wady mleka a wady sera
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Diagnostyka — objaw, przyczyna, ścieżka odzysku</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Objaw</th>
                          <th className="text-left p-2 font-semibold">Prawdopodobna przyczyna</th>
                          <th className="text-left p-2 font-semibold">Co z tym zrobić</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diagnoza.map((r) => (
                          <tr key={r.objaw} className={`border-b ${!r.jadalny ? "bg-destructive/5" : ""}`}>
                            <td className="p-2 font-medium">
                              {r.jadalny ? "✅" : "❌"} {r.objaw}
                            </td>
                            <td className="p-2 text-muted-foreground">{r.przyczyna}</td>
                            <td className="p-2">{r.ratunek}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ser topiony — najskuteczniejsza ścieżka ratunku</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    Jeśli ser jest bezpieczny, ale ma złą teksturę — kruszy się, jest gumowaty albo
                    lekko gorzki — <strong>przerobienie na ser topiony ratuje praktycznie każdą partię</strong>.
                    Sole emulgujące rozbijają strukturę kazeiny i zamieniają nierówną masę w gładką,
                    smarowną całość. Przy okazji można połączyć kilka nieudanych partii w jeden produkt.
                  </p>
                  <p>
                    Pełną procedurę, dobór soli emulgujących i warianty smakowe opisujemy w{" "}
                    <Link to="/przepisy/ser-topiony" className="text-primary hover:underline font-medium">
                      przepisie na ser topiony
                    </Link>
                    .
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <strong>Inne ścieżki dla bezpiecznego, ale nieudanego sera:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Zetrzeć na tarce</strong> — do zapiekanek, past, sosów; tekstura przestaje mieć znaczenie.</li>
                      <li><strong>Dłuższe dojrzewanie</strong> — gorycz bywa rozkładana przez kolejne 4–8 tygodni w 10°C.</li>
                      <li><strong>Wędzenie</strong> — dym maskuje niedoskonałości smaku i poprawia trwałość.</li>
                      <li><strong>Ser smażony lub grillowany</strong> — twarde, gumowate sery znoszą wysoką temperaturę.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skarmianie zwierzętami — ostatnia deska ratunku</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    Ser to skoncentrowane białko i tłuszcz, więc kusi, żeby nieudaną partię oddać
                    zwierzętom. Jest jednak haczyk, o którym łatwo zapomnieć:{" "}
                    <strong>ser jest solony</strong> — zwykle 1,5–2% NaCl, czyli{" "}
                    <strong>pięć do siedmiu razy więcej</strong>, niż wynosi prawidłowa zawartość
                    soli w paszy dla drobiu.
                  </p>

                  <OstrzezenieSol kontekst="ser" />
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Zwierzę</th>
                          <th className="text-left p-2 font-semibold">Dawka</th>
                          <th className="text-left p-2 font-semibold">Uwagi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Świnie ✅</td>
                          <td className="p-2">najlepszy odbiorca większych ilości</td>
                          <td className="p-2 text-muted-foreground">rozdrobnić, mieszać z paszą</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Kury ⚠️</td>
                          <td className="p-2">kilkanaście gramów na kurę dziennie</td>
                          <td className="p-2 text-muted-foreground">przysmak, nie składnik dawki; drób bardzo wrażliwy na sól</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Psy ⚠️</td>
                          <td className="p-2">niewielkie kawałki okazjonalnie</td>
                          <td className="p-2 text-muted-foreground">część psów nie toleruje laktozy</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Koty ⚠️</td>
                          <td className="p-2">śladowe ilości</td>
                          <td className="p-2 text-muted-foreground">powszechna nietolerancja laktozy</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-destructive/10 border-l-4 border-destructive p-3 rounded">
                    <strong>Nigdy nie podawaj zwierzętom:</strong> sera <strong>spleśniałego</strong>{" "}
                    (mykotoksyny), <strong>zjełczałego</strong>, ani <strong>mocno solonego</strong>.
                    Psom dodatkowo nie wolno podawać serów <strong>pleśniowych</strong> typu roquefort
                    czy gorgonzola — zawarta w nich roquefortyna C wywołuje drżenia mięśniowe i drgawki.
                  </div>
                  <p className="text-muted-foreground">
                    Przy większych ilościach produktów ubocznych warto pomyśleć systemowo — patrz{" "}
                    <Link to="/serwatka-dla-zwierzat" className="text-primary hover:underline">
                      serwatka w żywieniu zwierząt
                    </Link>{" "}
                    oraz{" "}
                    <Link to="/kalkulator-pasz" className="text-primary hover:underline">
                      kalkulator pasz
                    </Link>
                    , który pokaże, ile białka realnie wnosisz do dawki.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Żeby następna partia się udała</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>Prowadź notatki z każdej partii</strong> — temperatury, czasy, pH, dawki,
                    wynik. Większość nieudanych serów powtarza ten sam błąd, który widać dopiero
                    w zestawieniu kilku warzeń, nie w pojedynczym.
                  </p>
                  <p>
                    <strong>Kup pH-metr.</strong> To najczęściej brakujące ogniwo między przypadkiem
                    a powtarzalnością — bez pomiaru kwasowości pracujesz na wyczucie.
                  </p>
                  <p>
                    <strong>Ustabilizuj dojrzewalnię.</strong> Wahania temperatury i wilgotności psują
                    więcej partii niż błędy w samym warzeniu.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <SekcjaFAQ slug="nieudany-ser" />


      <SeeAlso links={seeAlsoLinks} />
      <Footer />
    </div>
  );
};

export default NieudanySer;
