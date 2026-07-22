import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ReactionButton from "@/components/ReactionButton";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import { Link } from "react-router-dom";

const WedzenieSera = () => {
  const faqData = [
    {
      question: "W jakiej temperaturze wędzić ser?",
      answer:
        "Ser wędzi się wyłącznie na zimno, w przedziale 20–30 °C (maksymalnie 30 °C). Powyżej tej granicy tłuszcz zaczyna się wytapiać, ser traci strukturę, zniekształca się, a w skrajnych przypadkach spływa przez ruszt. Aby utrzymać niską temperaturę, używa się dymogeneratora albo wędzi w chłodniejsze dni (jesień, zima) lub nocą.",
    },
    {
      question: "Jak długo wędzić ser?",
      answer:
        "W warunkach domowych zwykle 3–8 godzin przy rzadkim, niemal przezroczystym dymie — ser ma się „kąpać” w dymie, a nie w nim dusić. Dla głębszego smaku proces można rozłożyć na kilka dni, wędząc po kilka godzin dziennie. Pamiętaj, że o ostatecznym smaku decyduje też leżakowanie po wędzeniu.",
    },
    {
      question: "Jakie drewno do wędzenia sera jest najlepsze?",
      answer:
        "Wyłącznie liściaste i bez kory (kora daje gorycz). Olcha to klasyk — głęboki złoty kolor i łagodny, wyrazisty dym. Buk daje jaśniejszy kolor i klasyczny aromat, drzewa owocowe (jabłoń, wiśnia, grusza, śliwa) — delikatny, słodkawy profil idealny do serów łagodnych, a dąb — intensywny, cięższy smak do wyrazistych serów dojrzewających. Drewna iglastego nie używa się nigdy (żywica = smoła).",
    },
    {
      question: "Dlaczego ser po wędzeniu jest gorzki?",
      answer:
        "Najczęstsze przyczyny: ser był wilgotny przed wędzeniem (musi być całkowicie suchy w dotyku, inaczej pokrywa się czarną, smolistą warstwą), drewno miało korę, albo dym był zbyt gęsty i „kisł” w komorze przy złym przepływie powietrza. Do tego świeżo uwędzony ser zawsze smakuje ostro — potrzebuje minimum 3–7 dni leżakowania w lodówce, żeby dym złagodniał.",
    },
    {
      question: "Czy każdy ser można uwędzić?",
      answer:
        "Praktycznie tak. Najłatwiejsze dla początkujących są sery twarde i półtwarde (gouda, edam, cheddar) — dobrze znoszą wędzenie i nie topią się łatwo. Sery miękkie i twarogowe (feta, twarogi, sery typu włoskiego) wymagają siatek wędliniarskich, które zapobiegają rozpadnięciu się lub spłynięciu z rusztu, oraz szczególnej kontroli temperatury.",
    },
    {
      question: "Jak przechowywać ser wędzony?",
      answer:
        "Po wędzeniu przetrzyj ser papierowym ręcznikiem, zawiń w pergamin lub zapakuj próżniowo (najlepsze efekty) i włóż do lodówki na minimum 3–7 dni — dopiero wtedy smaki się przegryzają, a aromat dymu szlachetnieje. Uwaga: dym konserwuje głównie powierzchniowo i nie zastępuje chłodzenia — ser wędzony nadal przechowujemy w lodówce.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Wędzenie sera — kompletny przewodnik: od wyboru sera do degustacji",
        description:
          "Jak uwędzić ser w przydomowej wędzarni: które sery się nadają, przygotowanie i osuszanie, dobór drewna, wędzenie na zimno (20–30 °C), leżakowanie po wędzeniu i najczęstsze błędy.",
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/wedzenie-sera",
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
    { title: "Kalkulator solanki", href: "/kalkulator-solanki", description: "Policz solankę 8–10% do przygotowania sera przed wędzeniem." },
    { title: "Przepisy na sery", href: "/przepisy", description: "Gouda, cheddar, korycinski — sery, które świetnie znoszą wędzenie." },
    { title: "Poradnik dla serowarów", href: "/poradnik", description: "Proces produkcji sera od mleka do dojrzewania." },
    { title: "Organizacja małej serowarni", href: "/organizacja-serowarni", description: "Układ pomieszczeń, sprzęt i obieg pracy." },
    { title: "Sprzedaż w RHD", href: "/prawo/rhd", description: "Ser wędzony to produkt przetworzony — jak legalnie sprzedawać." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Wędzenie sera — kompletny przewodnik: drewno, temperatura, czas | Moja Serowarnia</title>
        <meta
          name="description"
          content="Jak uwędzić ser: które sery się nadają, przygotowanie i osuszanie, jakie drewno wybrać (olcha, buk, owocowe), wędzenie na zimno 20–30 °C, ile wędzić, leżakowanie i najczęstsze błędy."
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/wedzenie-sera" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Poradniki", href: "/poradniki" },
          { label: "Wędzenie sera" },
        ]}
      />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Flame}
              color="rose"
              title="Wędzenie sera — kompletny przewodnik"
              subtitle="Od wyboru sera do degustacji: przygotowanie i osuszanie, dobór drewna, wędzenie na zimno (20–30 °C), leżakowanie po wędzeniu i błędy, których łatwo uniknąć. Wędzenie wydaje się prostą modyfikacją — ale nią nie jest."
            />

            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="wedzenie-sera" variant="default" />
            </div>

            <TLDRSection>
              <p>
                Ser wędzi się <strong>wyłącznie na zimno (20–30 °C)</strong> — powyżej tłuszcz się wytapia. Używaj{" "}
                <strong>drewna liściastego bez kory</strong> (olcha to klasyk). Przed wędzeniem ser musi być{" "}
                <strong>całkowicie osuszony</strong> — wilgotny pokryje się gorzką, smolistą warstwą. Po wędzeniu{" "}
                <strong>leżakowanie 3–7 dni w lodówce</strong> — świeżo uwędzony ser smakuje jak popielniczka, dym musi
                złagodnieć. Dym powinien być rzadki, niemal przezroczysty.
              </p>
            </TLDRSection>

            <div className="space-y-6">
              {/* Sekcja 1: Jakie sery */}
              <Card>
                <CardHeader>
                  <CardTitle>Jakie sery najlepiej nadają się do wędzenia?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p>Praktycznie każdy ser można uwędzić, ale różne gatunki wymagają innego podejścia:</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>
                      <strong>Sery twarde i półtwarde</strong> (gouda, edam, cheddar, radamer) — najłatwiejsze dla
                      początkujących. Dobrze znoszą wędzenie, nie topią się łatwo i wspaniale chłoną aromat.
                    </li>
                    <li>
                      <strong>Sery miękkie i twarogowe</strong> (typu włoskiego, feta, oscypki, twarogi) — wymagają
                      ostrożności. Przed wędzeniem umieść je w <strong>siatkach wędliniarskich</strong>, które zapobiegną
                      rozpadnięciu się lub spłynięciu z rusztu.
                    </li>
                  </ul>
                  <div className="bg-secondary/50 p-4 rounded-lg text-sm">
                    <p className="font-semibold mb-1">🇵🇱 Polska tradycja</p>
                    <p>
                      Wędzenie serów to u nas nie nowość — <strong>oscypek</strong> (i jego mała siostra redykołka) to
                      wędzony ser z solanki z wielowiekową tradycją, a <strong>ser koryciński</strong> również bywa
                      wędzony. Wędząc własną goudę czy twaróg, kontynuujesz bardzo polską technikę.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Sekcja 2: Przygotowanie */}
              <Card>
                <CardHeader>
                  <CardTitle>Przygotowanie sera — klucz do sukcesu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p>Zanim ser trafi do wędzarni, musi zostać odpowiednio przygotowany. To etap, o którym początkujący zapominają najczęściej:</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>
                      <strong>Solanka (opcjonalnie, ale zalecane)</strong> — wiele serów (szczególnie twarogowe i typu
                      włoskiego) warto zamoczyć przed wędzeniem w solance ok. <strong>8–10%</strong>. Sól nadaje smak,
                      utwardza skórkę i działa konserwująco. Ilość soli policzysz w naszym{" "}
                      <Link to="/kalkulator-solanki" className="text-primary hover:underline">kalkulatorze solanki</Link>.
                    </li>
                    <li>
                      <strong>Dodatki</strong> — ser można natrzeć ziołami, czosnkiem, papryką czy pieprzem.
                    </li>
                  </ul>
                  <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-4 rounded">
                    <p className="text-sm">
                      <strong>OSUSZANIE — absolutnie konieczne!</strong> Ser przed wędzeniem musi być{" "}
                      <strong>całkowicie suchy w dotyku</strong>. Wilgotny ser nie przyjmie ładnie dymu — pokryje się
                      czarną, smolistą warstwą o bardzo gorzkim smaku. Osuszaj w chłodnym, przewiewnym miejscu (lub w
                      lodówce) przez kilka do kilkunastu godzin przed wędzeniem.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Sekcja 3: Drewno */}
              <Card>
                <CardHeader>
                  <CardTitle>Wybór drewna — malowanie smakiem i kolorem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p>
                    Rodzaj drewna drastycznie wpływa na ostateczny profil sera. Zawsze używaj{" "}
                    <strong>drewna liściastego, wolnego od kory</strong> (kora nadaje gorycz); drewno iglaste
                    odpada całkowicie (żywica = smoła).
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Drewno</th>
                          <th className="text-left p-2 font-semibold">Kolor</th>
                          <th className="text-left p-2 font-semibold">Smak / zastosowanie</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b"><td className="p-2 font-medium">Olcha</td><td className="p-2">głęboki, złoty</td><td className="p-2">najpopularniejsza i uniwersalna; łagodny, ale bardzo wyrazisty dymny posmak</td></tr>
                        <tr className="border-b"><td className="p-2 font-medium">Buk</td><td className="p-2">jaśniejszy</td><td className="p-2">klasyczny, przyjemny aromat; często mieszany z olchą</td></tr>
                        <tr className="border-b"><td className="p-2 font-medium">Owocowe (jabłoń, wiśnia, grusza, śliwa)</td><td className="p-2">jasny do mahoniowego</td><td className="p-2">słodkawy, lekko owocowy aromat — idealne do serów delikatnych</td></tr>
                        <tr><td className="p-2 font-medium">Dąb</td><td className="p-2">ciemniejszy</td><td className="p-2">intensywny, cięższy wędzony smak — do wyrazistych, twardych serów dojrzewających</td></tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Sekcja 4: Parametry */}
              <Card>
                <CardHeader>
                  <CardTitle>Parametry wędzenia: temperatura i czas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p>W przypadku serów stosuje się <strong>wędzenie na zimno</strong>:</p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>
                      <strong>Temperatura: 20–30 °C (maks. 30 °C).</strong> Powyżej tej granicy tłuszcz zaczyna się
                      wytapiać, ser traci strukturę, zniekształca się, a w skrajnych przypadkach spływa przez ruszt do
                      paleniska. Niską temperaturę utrzymasz <strong>dymogeneratorem</strong> albo wędząc w chłodniejsze
                      dni (jesień, zima) lub nocą.
                    </li>
                    <li>
                      <strong>Czas: zwykle 3–8 godzin.</strong> Zależy od preferencji i gęstości dymu. Głębszy smak —
                      rozłóż proces na kilka dni, po kilka godzin dziennie.
                    </li>
                    <li>
                      <strong>Dym: rzadki, niemal przezroczysty.</strong> Ser ma się „kąpać" w dymie, a nie w nim dusić.
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    Uwaga: „wędzenie na gorąco" nie jest techniką dla sera — w wyższych temperaturach ser po prostu się
                    topi (to już domena serów grillowanych, nie wędzonych).
                  </p>
                </CardContent>
              </Card>

              {/* Sekcja 5: Leżakowanie */}
              <Card>
                <CardHeader>
                  <CardTitle>Cierpliwość, czyli leżakowanie po wędzeniu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p>
                    Jeśli spróbujesz sera zaraz po wyjęciu z wędzarni, możesz się rozczarować — smak będzie przypominał
                    popielniczkę: ostry i gryzący. <strong>Dym musi mieć czas, aby wniknąć w głąb sera i złagodnieć.</strong>
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Po wędzeniu przetrzyj ser papierowym ręcznikiem.</li>
                    <li>Zawiń w papier śniadaniowy/pergamin lub <strong>zapakuj próżniowo</strong> (najlepsze efekty).</li>
                    <li>Do lodówki na <strong>minimum 3–7 dni</strong> — dopiero wtedy smaki się przegryzą, a aromat dymu stanie się szlachetny.</li>
                  </ul>
                  <div className="bg-secondary/50 p-4 rounded-lg text-sm">
                    <p>
                      <strong>Uczciwie o trwałości:</strong> wędzenie przedłuża trwałość, ale konserwuje głównie{" "}
                      <strong>powierzchniowo</strong> — nie zastępuje chłodzenia ani higieny produkcji. Ser wędzony nadal
                      przechowujemy w lodówce. Jeśli sprzedajesz ser wędzony (to produkt <strong>przetworzony</strong>),
                      robisz to w ramach <Link to="/prawo/rhd" className="text-primary hover:underline">RHD</Link>.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Sekcja 6: Błędy */}
              <Card>
                <CardHeader>
                  <CardTitle>Najczęstsze błędy — czego unikać</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex gap-3 p-3 rounded-lg border border-border bg-card">
                      <span className="flex-shrink-0 text-destructive font-bold">✕</span>
                      <span className="text-sm"><strong>Gorzki, smolisty smak</strong> — ser był mokry przed wędzeniem, drewno miało korę lub dym był zbyt gęsty i „kisł" w komorze (zły przepływ powietrza).</span>
                    </li>
                    <li className="flex gap-3 p-3 rounded-lg border border-border bg-card">
                      <span className="flex-shrink-0 text-destructive font-bold">✕</span>
                      <span className="text-sm"><strong>Topienie się sera</strong> — temperatura przekroczyła 30 °C.</span>
                    </li>
                    <li className="flex gap-3 p-3 rounded-lg border border-border bg-card">
                      <span className="flex-shrink-0 text-destructive font-bold">✕</span>
                      <span className="text-sm"><strong>Odbicia kratki na serze</strong> — jeśli wędzisz na ruszcie (a nie w siatce), podłóż matę teflonową, pergamin lub gazę serowarską, aby metal nie wtopił się w mięknący ser.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card>
                <CardHeader>
                  <CardTitle>Najczęściej zadawane pytania</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {faqData.map((f, i) => (
                    <div key={i}>
                      <h3 className="text-lg font-semibold mb-2">{f.question}</h3>
                      <p className="text-muted-foreground">{f.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <SeeAlso links={seeAlsoLinks} title="Zobacz również" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WedzenieSera;
