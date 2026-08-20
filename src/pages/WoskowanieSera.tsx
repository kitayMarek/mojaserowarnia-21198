import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ReactionButton from "@/components/ReactionButton";
import TLDRSection from "@/components/TLDRSection";
import WprowadzenieDzialu from "@/components/WprowadzenieDzialu";
import SeeAlso from "@/components/SeeAlso";
import SekcjaFAQ from "@/components/SekcjaFAQ";

const WoskowanieSera = () => {
  const faqData = [
    {
      question: "W jakiej temperaturze woskować ser?",
      answer:
        "Wosk serowy nakłada się w temperaturze 82–93°C (180–200°F). Poniżej 80°C wosk jest zbyt gęsty i nie przylega równomiernie. Powyżej 100°C ryzyko przypalenia i pożaru. Podgrzewaj wyłącznie w kąpieli wodnej (bain-marie) — nigdy bezpośrednio nad ogniem.",
    },
    {
      question: "Jak przygotować ser do woskowania?",
      answer:
        "Ser musi być suchy i mieć temperaturę pokojową. Przed woskowaniem pozostaw go na 2–7 dni w 10–15°C, obracając codziennie, aż powierzchnia jest sucha w dotyku i lekko skórkowana. Mokry ser pod woskiem to siedlisko pleśni — wilgoć musi odparować przed zamknięciem.",
    },
    {
      question: "Ile warstw wosku nałożyć na ser?",
      answer:
        "Minimum 2–3 warstwy. Każdą nakładaj po ostygnięciu poprzedniej (30–60 sekund). Dla serów dojrzewających powyżej 6 miesięcy zaleca się 3–4 warstwy. Łączna grubość powłoki powinna wynosić około 1–2 mm.",
    },
    {
      question: "Jakiego wosku użyć do sera?",
      answer:
        "Najlepszy jest specjalny wosk serowarski (cheese wax) — mieszanina parafiny twardej i wosku mikrokrystalicznego. Czysta parafina sklepowa jest zbyt krucha i pęka. Wosk pszczeli działa, ale jest drogi. Nie używaj wosków do świec — mogą zawierać zapachy lub składniki nieprzeznaczone do kontaktu z żywnością.",
    },
    {
      question: "Czy można woskować każdy rodzaj sera?",
      answer:
        "Nie. Do woskowania nadają się sery półtwarde i twarde (Gouda, Edam, Colby, Cheddar, Monterey Jack) po wstępnym osuszeniu. NIE woskuj serów miękkich (zbyt dużo wilgoci), serów z rozwijającą się skórką (Parmezan, Gruyère) ani serów z pleśnią (Camembert, Blue) — woskowanie tworzy środowisko beztlenowe, a pleśnie muszą oddychać.",
    },
    {
      question: "Co zrobić gdy powłoka woskowa pęka lub odpada?",
      answer:
        "Małe pęknięcia: roztop trochę wosku i uzupełnij szczeliny pędzlem. Większe odspojenia: zdejmij starą powłokę, usuń ewentualną pleśń z powierzchni sera, osusz 1–2 dni i nałóż nowe warstwy od zera. Pęknięcia to najczęstszy znak użycia zbyt kruchej czystej parafiny zamiast wosku serowarskiego.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Woskowanie sera — jak i czym woskować, temperatura i technika",
        description:
          "Praktyczny przewodnik po woskowaniu sera domowego: rodzaje wosku, temperatura aplikacji (82–93°C), przygotowanie powierzchni, liczba warstw i które sery woskować.",
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/woskowanie-sera",
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
    { title: "Dojrzewalnia z lodówki", href: "/dojrzewalnia-z-lodowki", description: "Temperatura, wilgotność i sprzęt do domowej dojrzewalni." },
    { title: "Solenie sera", href: "/solenie-sera", description: "Solanka vs solenie suche — czasy, stężenia i technika." },
    { title: "Wędzenie sera", href: "/wedzenie-sera", description: "Drewno, temperatura 20–30°C i czas wędzenia na zimno." },
    { title: "Przepisy na sery", href: "/przepisy", description: "Gouda, Edam, Cheddar — sery, które najlepiej się woskuje." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Woskowanie sera — jak i czym woskować | Moja Serowarnia</title>
        <meta
          name="description"
          content="Jak woskować ser domowy: temperatura wosku 82–93°C, przygotowanie (2–7 dni osuszania), technika zanurzeniowa, 2–3 warstwy, które sery woskować a których nie."
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/woskowanie-sera" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Poradniki", href: "/poradniki" },
          { label: "Woskowanie sera" },
        ]}
      />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Layers}
              color="amber"
              title="Woskowanie sera"
              subtitle="Najprostszy sposób na dojrzewanie sera bez pielęgnacji skórki — wosk zatrzymuje wilgoć i chroni przez wiele miesięcy. Kluczowe są: właściwy wosk, suchy ser i temperatura 82–93°C."
            />

            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="woskowanie-sera" variant="default" />
            </div>

            <WprowadzenieDzialu

              lead={"Wosk nie jest ozdobą. Zastępuje skórkę, której domowy ser często nie zdąży wykształcić."}

              podsumowanie={"Ser bez skórki i bez wosku traci wodę szybciej, niż dojrzewa — wysycha, pęka i przestaje pracować w środku. Ten poradnik mówi, jakiego wosku użyć (nie parafiny), w jakiej temperaturze go nakładać i dlaczego ser musi być wcześniej całkowicie suchy."}

              tropy={[

                {

                  sytuacja: "Nie masz gdzie dojrzewać",

                  propozycja: "— warunki są ważniejsze niż sam wosk:",

                  href: "/dojrzewalnia-z-lodowki",

                  etykieta: "dojrzewalnia z lodówki",

                },

                {

                  sytuacja: "Chcesz najpierw uwędzić",

                  propozycja: "— kolejność ma znaczenie:",

                  href: "/wedzenie-sera",

                  etykieta: "wędzenie sera",

                },

                {

                  sytuacja: "Pod woskiem pojawiła się pleśń",

                  propozycja: "— zwykle ser nie był suchy:",

                  href: "/nieudany-ser",

                  etykieta: "nieudany ser",

                },

                {

                  sytuacja: "Szukasz sera na długie dojrzewanie",

                  propozycja: "— dwanaście miesięcy i więcej:",

                  href: "/przepisy/parmezan",

                  etykieta: "parmezan",

                },

              ]}

            />

            <TLDRSection>
              <p>
                Używaj <strong>wosku serowarskiego</strong> (nie czystej parafiny — pęka). Temperatura aplikacji{" "}
                <strong>82–93°C w kąpieli wodnej</strong>. Ser musi być <strong>suchy przed woskowaniem</strong> (2–7 dni
                osuszania) — mokry ser pleśnieje pod woskiem. Nałóż{" "}
                <strong>2–3 warstwy</strong>, każdą po ostygnięciu poprzedniej. Nie woskuj serów miękkich, Parmezanu ani
                Blue.
              </p>
            </TLDRSection>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Jakiego wosku użyć?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Rodzaj wosku</th>
                          <th className="text-left p-2 font-semibold">Ocena</th>
                          <th className="text-left p-2 font-semibold">Uwagi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Wosk serowarski (cheese wax)</td>
                          <td className="p-2 text-green-600 font-semibold">Najlepszy</td>
                          <td className="p-2">Parafina + wosk mikrokrystaliczny; elastyczny, nie pęka; dostępny w kolorach</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Wosk pszczeli</td>
                          <td className="p-2 text-amber-600 font-semibold">Może być</td>
                          <td className="p-2">Naturalny, drogi; miesza się z parafiną 1:3</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Czysta parafina sklepowa</td>
                          <td className="p-2 text-red-600 font-semibold">Słaby</td>
                          <td className="p-2">Za krucha, pęka przy nacisku; nie nadaje się samodzielnie</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Wosk do świec</td>
                          <td className="p-2 text-red-600 font-semibold">Nie</td>
                          <td className="p-2">Może zawierać zapachy lub składniki niekontaktowe</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Temperatura i bezpieczeństwo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-4 rounded text-sm">
                    <p className="font-semibold">Optymalna temperatura wosku: 82–93°C (180–200°F)</p>
                    <p className="mt-1">Poniżej 80°C — wosk zbyt gęsty, nie przylega. Powyżej 100°C — ryzyko przypalenia.</p>
                  </div>
                  <p className="text-sm">
                    Podgrzewaj wosk wyłącznie w <strong>kąpieli wodnej (bain-marie)</strong> — metalowe naczynie z woskiem
                    zanurzone w garnku z wodą. Nigdy bezpośrednio nad ogniem — temperatura zapłonu parafiny wygląda na
                    bezpieczną, ale rozgrzany wosk może się gwałtownie rozlać. Trzymaj pod ręką pokrywkę.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Przygotowanie sera — krok po kroku</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-4 rounded text-sm mb-4">
                    <strong>Kluczowa zasada:</strong> Ser pod woskiem musi być SUCHY. Wilgoć zamknięta pod woskiem
                    tworzy idealne warunki dla pleśni.
                  </div>
                  <ol className="space-y-3 text-sm">
                    {[
                      "Po soleniu osusz powierzchnię sera ściereczką.",
                      "Pozostaw na kratce w 10–15°C na 2–7 dni, obracając raz dziennie, aż powierzchnia jest sucha w dotyku.",
                      "Przed woskowaniem ser powinien mieć temperaturę pokojową (15–20°C) — zimny ser przyspiesza zastyganie wosku, przez co pierwsza warstwa jest nierówna.",
                      "Sprawdź, czy nie ma pęknięć ani uszkodzeń — woskowanie nie naprawi problemów strukturalnych.",
                    ].map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technika nakładania</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold mb-2">Metoda zanurzeniowa (najlepsza)</p>
                    <ol className="space-y-1 list-decimal list-inside">
                      <li>Przytrzymaj ser za jeden bok i zanurz dolną połowę w woskowni na 2–3 sekundy.</li>
                      <li>Wyjmij i trzymaj zanurzony bok w górze przez 30–60 sekund — wosk zastyga.</li>
                      <li>Odwróć i zanurz drugą połowę, z kilkucentymetrowym zakładaniem na styku.</li>
                      <li>Powtórz cały cykl 2–3 razy do uzyskania grubości 1–2 mm.</li>
                    </ol>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded text-sm">
                    <strong>Metoda pędzlem</strong> — maluj gorącym woskiem w szybkich ruchach, kolejne warstwy
                    prostopadle do poprzednich. Więcej pustek niż przy zanurzaniu, ale wystarczy do małych serów.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Które sery woskować — a których nie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                      <p className="font-semibold text-green-800 dark:text-green-300 mb-2">Nadają się</p>
                      <ul className="space-y-1">
                        {["Gouda", "Edam", "Colby", "Cheddar (zamiast bandażowania)", "Monterey Jack", "Ser koryciński (leżakowany)"].map((s) => (
                          <li key={s} className="flex gap-2"><span className="text-green-600">✓</span>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                      <p className="font-semibold text-red-800 dark:text-red-300 mb-2">Nie woskuj</p>
                      <ul className="space-y-1">
                        {["Sery miękkie (za dużo wilgoci)", "Camembert, Brie (potrzebują wymiany gazowej)", "Parmezan, Gruyère (skórka = smak)", "Sery Blue (pleśń musi oddychać)", "Ricotta, mozzarella (jedzony świeży)"].map((s) => (
                          <li key={s} className="flex gap-2"><span className="text-red-600">✕</span>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Najczęstsze problemy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {[
                    {
                      title: "Powłoka pęka lub odpada",
                      text: "Przyczyna: użycie czystej parafiny (zbyt krucha) lub woskowanie zbyt zimnego sera. Rozwiązanie: roztop wosk serowarski i uzupełnij pęknięcia pędzlem. Przy większych uszkodzeniach — ściągnij całą powłokę, osusz 1–2 dni i woskuj od nowa.",
                    },
                    {
                      title: "Pleśń pod woskiem",
                      text: "Przyczyna: woskowanie mokrego sera lub zbyt wczesne woskowanie. Mała pleśń po zdjęciu wosku jest normalna — zetrzyj solą lub roztworem soli. Jeśli obejmuje ponad 2 cm² — ser był za mokry.",
                    },
                    {
                      title: "Bąble i nierówności w powłoce",
                      text: "Przyczyna: wosk nałożony zbyt szybko (powietrze uwięzione) lub ser był zbyt zimny. Małe bąble przebij igłą i zakryj roztopionym woskiem.",
                    },
                  ].map(({ title, text }) => (
                    <div key={title} className="flex gap-3 p-3 rounded-lg border border-border">
                      <span className="flex-shrink-0 text-destructive font-bold">✕</span>
                      <div><strong>{title}</strong> — {text}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="mt-10">
              <SekcjaFAQ slug="woskowanie-sera" />

              <SeeAlso links={seeAlsoLinks} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WoskowanieSera;
