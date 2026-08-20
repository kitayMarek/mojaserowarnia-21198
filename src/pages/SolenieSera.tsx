import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ReactionButton from "@/components/ReactionButton";
import TLDRSection from "@/components/TLDRSection";
import WprowadzenieDzialu from "@/components/WprowadzenieDzialu";
import SeeAlso from "@/components/SeeAlso";
import SekcjaFAQ from "@/components/SekcjaFAQ";

const SolenieSera = () => {
  const faqData = [
    {
      question: "Ile czasu solić ser w solance?",
      answer:
        "Orientacyjna zasada: 1 godzina na każde 500 g sera lub 1 godzina na każdy centymetr grubości. Przykłady: Gouda 1 kg — 10–12 h w solance 20%; Cheddar 1,5 kg — 14–16 h; Gruyère 2–3 kg — 2–3 dni (obracany co 12 h); Parmezan 3–4 kg — 3–4 dni. Sery miękkie krócej: Camembert 250 g — 6–8 h w 16–18%.",
    },
    {
      question: "Jakie stężenie solanki do sera?",
      answer:
        "Sery twarde i półtwarde (Gouda, Cheddar, Gruyère) — 18–22% NaCl. Sery miękkie (Camembert, Halloumi wstępny) — 12–18%. Feta przechowywana w solance — 8–14%. Parmezan — 18–22%. Solanka 20%: 200 g soli niejodowanej na 1 litr wody.",
    },
    {
      question: "Dlaczego do solanki dodaje się chlorek wapnia?",
      answer:
        "Solanka wypłukuje wapń ze skórki sera, przez co powierzchnia rozmięka. Dodatek CaCl₂ (1–2 g na litr solanki) zapobiega temu i utrzymuje twardość skórki. Szczególnie ważne przy długim soleniu twardych serów i przy wielokrotnym użyciu solanki.",
    },
    {
      question: "Dlaczego ser soli się solą niejodowaną?",
      answer:
        "Jod hamuje kultury starterowe i bakterie dojrzewające, co zaburza fermentację i może dawać gorzki smak. Używaj wyłącznie soli kamiennej lub morskiej bez jodu i bez antyzbrylaczy (E535, E536) — te ostatnie mogą powodować szarawy kolor skórki.",
    },
    {
      question: "Ile soli użyć do solenia suchego?",
      answer:
        "Typowa dawka: 2–3% wagi sera w soli, rozłożona na 2–4 sesje w ciągu 1–3 dni. Przykład: ser 1 kg → 20–30 g soli łącznie. Pierwsza sesja: 40% całkowitej dawki; pozostałe: równe porcje co 8–12 godzin. Sery Blue: do 3,5% (sól hamuje niepożądane bakterie).",
    },
    {
      question: "Czy można ponownie używać solanki?",
      answer:
        "Tak — stara solanka jest lepsza niż świeża, bo absorbuje białka i wapń z sera. Co 2–4 tygodnie przegotuj, przecedź, sprawdź stężenie soli i uzupełnij. Docelowe pH solanki: 5,0–5,4 (dodaj łyżeczkę octu jeśli wyższe). Dodaj 1–2 g CaCl₂/L po gotowaniu. Wyrzuć jeśli jest różowa, mętna od pleśni lub ma obcy zapach.",
    },
    {
      question: "Kiedy stosuje się solenie suche, a kiedy solankę?",
      answer:
        "Solenie suche: Cheddar tradycyjny, Feta (wstępnie), sery Blue (przed nawiercaniem), Parmezan (końcowe tygodnie). Solanka: Gouda, Edam, Gruyère, Emmental, Halloumi, Parmezan (pierwsze 3–4 dni). Wiele serów łączy obie metody — np. Parmezan: najpierw solanka 3–4 dni, potem solenie suche przez kilka tygodni.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Solenie sera — suche vs solanka: czasy, stężenie i technika",
        description:
          "Porównanie metod solenia sera: solenie suche (2–3% masy) i solanka (18–22%, czasy dla 10 serów). Rola CaCl₂, sól niejodowana, ponowne użycie solanki.",
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/solenie-sera",
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
    { title: "Kalkulator solanki", href: "/kalkulator-solanki", description: "Oblicz ilość soli na solankę 18–22% i dawkę CaCl₂." },
    { title: "Woskowanie sera", href: "/woskowanie-sera", description: "Co zrobić po soleniu — woskowanie zatrzymuje wilgoć." },
    { title: "Dojrzewalnia z lodówki", href: "/dojrzewalnia-z-lodowki", description: "Temperatura i wilgotność do dojrzewania po soleniu." },
    { title: "Przepisy na sery", href: "/przepisy", description: "Gouda, Parmezan, Feta — czasy i metody solenia w przepisach." },
  ];

  const brineTable = [
    { cheese: "Gouda 500 g", time: "5–6 h", temp: "10–13°C" },
    { cheese: "Gouda 1 kg", time: "10–12 h", temp: "10–13°C" },
    { cheese: "Gouda 2 kg", time: "18–22 h", temp: "10–13°C" },
    { cheese: "Edam 750 g", time: "8–10 h", temp: "10–13°C" },
    { cheese: "Cheddar 1,5 kg", time: "14–16 h", temp: "10–13°C" },
    { cheese: "Gruyère 2–3 kg", time: "2–3 dni (obracać co 12 h)", temp: "10–13°C" },
    { cheese: "Parmezan 3–4 kg", time: "3–4 dni (obracać co 12 h)", temp: "10–13°C" },
    { cheese: "Halloumi 200–300 g", time: "1–2 h (wstępnie)", temp: "10–13°C" },
    { cheese: "Camembert 250 g", time: "6–8 h w solance 16–18%", temp: "10°C" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Solenie sera — suche vs solanka: czasy i stężenia | Moja Serowarnia</title>
        <meta
          name="description"
          content="Solanie sera: solanka 18–22% (Gouda 1 kg = 10–12 h), solenie suche 2–3% masy, rola CaCl₂, sól niejodowana, kiedy każda metoda i ponowne użycie solanki."
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/solenie-sera" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Poradniki", href: "/poradniki" },
          { label: "Solenie sera" },
        ]}
      />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Droplets}
              color="teal"
              title="Solenie sera — suche vs solanka"
              subtitle="Sól hamuje niepożądane bakterie, buduje skórkę, reguluje wilgotność i wpływa na smak. Wybór metody zależy od typu sera — część łączy obie."
            />

            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="solenie-sera" variant="default" />
            </div>

            <WprowadzenieDzialu

              lead={"Sól w serze nie jest przyprawą. Reguluje wodę, hamuje niechciane bakterie i decyduje o tym, czy skórka w ogóle powstanie."}

              podsumowanie={"Za mało soli i ser rozwija obce bakterie, za dużo i dojrzewanie staje w miejscu. Ten poradnik podaje stężenia i czasy dla konkretnych serów, tłumaczy różnicę między solanką a soleniem na sucho i pokazuje, jak przygotować solankę, która posłuży wiele razy."}

              tropy={[

                {

                  sytuacja: "Nie chcesz liczyć w pamięci",

                  propozycja: "— stężenie i dawka CaCl₂ z kalkulatora:",

                  href: "/kalkulator-solanki",

                  etykieta: "kalkulator solanki",

                },

                {

                  sytuacja: "Ser idzie potem do dojrzewalni",

                  propozycja: "— warunki decydują nie mniej niż solenie:",

                  href: "/dojrzewalnia-z-lodowki",

                  etykieta: "dojrzewalnia z lodówki",

                },

                {

                  sytuacja: "Trzymasz drób albo bydło",

                  propozycja: "— solanka po serze bywa dla nich śmiertelna:",

                  href: "/serwatka-dla-zwierzat",

                  etykieta: "sól a zwierzęta",

                },

                {

                  sytuacja: "Chcesz zobaczyć to w przepisie",

                  propozycja: "— solanka nasycona, trzy godziny na kilogram:",

                  href: "/przepisy/gouda",

                  etykieta: "gouda",

                },

              ]}

            />

            <TLDRSection>
              <p>
                <strong>Solanka 18–22%</strong> dla twardych (Gouda, Cheddar, Gruyère) — orientacyjnie{" "}
                <strong>1 h na 500 g</strong> sera. <strong>Solenie suche 2–3% masy</strong> dla Cheddara
                tradycyjnego, Fety, serów Blue i Parmezanu (końcowe tygodnie). Używaj wyłącznie{" "}
                <strong>soli niejodowanej</strong> bez antyzbrylaczy. Do solanki dodaj{" "}
                <strong>CaCl₂ 1–2 g/L</strong> — zapobiega mięknięciu skórki. Temperatura solanki:{" "}
                <strong>10–13°C</strong>.
              </p>
            </TLDRSection>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Porównanie metod</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Cecha</th>
                          <th className="text-left p-2 font-semibold">Solenie suche</th>
                          <th className="text-left p-2 font-semibold">Solanka</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Dawka", "2–3% masy sera (ważysz sól)", "Zależy od czasu i stężenia"],
                          ["Równomierność", "Wymaga kilku sesji", "Samoczynna dyfuzja"],
                          ["Skórka", "Grubsza, bardziej sucha", "Gładka, równa"],
                          ["Temperatura", "10–15°C", "10–13°C (jak temperatura sera)"],
                          ["Najlepsze do", "Blue, Cheddar, Parmezan (końc.), Feta (wstęp.)", "Gouda, Edam, Gruyère, Halloumi"],
                          ["Ryzyko", "Nierówne nasolenie przy pośpiechu", "Miękka skórka jeśli brak CaCl₂"],
                        ].map(([cecha, suche, solanka]) => (
                          <tr key={cecha as string} className="border-b">
                            <td className="p-2 font-medium">{cecha}</td>
                            <td className="p-2">{suche}</td>
                            <td className="p-2">{solanka}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Solanka — stężenie i czasy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-4 rounded text-sm">
                    <p><strong>Solanka 20%:</strong> 200 g soli niejodowanej na 1 litr wody</p>
                    <p className="mt-1"><strong>Reguła czasu:</strong> 1 h na każde 500 g sera lub 1 h na każdy cm grubości (do centrum). Obracaj ser w połowie czasu.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Ser</th>
                          <th className="text-left p-2 font-semibold">Czas w solance 20%</th>
                          <th className="text-left p-2 font-semibold">Temp. solanki</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brineTable.map((row) => (
                          <tr key={row.cheese} className="border-b">
                            <td className="p-2 font-medium">{row.cheese}</td>
                            <td className="p-2">{row.time}</td>
                            <td className="p-2">{row.temp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded text-sm">
                    <strong>Chlorek wapnia (CaCl₂):</strong> dodaj 1–2 g CaCl₂ na litr solanki. Zapobiega wypłukiwaniu wapnia ze skórki i jej mięknięciu. Szczególnie ważne przy długim soleniu twardych serów.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Solenie suche — technika</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-4 rounded">
                    <strong>Dawka soli: 2–3% masy sera</strong> — rozłożone na 2–4 sesje w ciągu 1–3 dni.<br />
                    Ser 1 kg → 20–30 g soli łącznie.
                  </div>
                  <ol className="space-y-2 list-decimal list-inside">
                    <li>Odważ łączną ilość soli. Podziel na 2–4 równe porcje.</li>
                    <li>Pierwszą porcję (40% dawki) natrzyj równomiernie całą powierzchnię sera.</li>
                    <li>Po 8–12 h obróć ser i natrzyj kolejną porcją.</li>
                    <li>Powtarzaj aż do zużycia całej soli. Trzymaj ser na siatce — sol wytworzy solankę pod spodem.</li>
                  </ol>
                  <p>Temperatura podczas solenia suchego: <strong>10–15°C</strong>.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Która metoda — który ser</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Ser</th>
                          <th className="text-left p-2 font-semibold">Metoda</th>
                          <th className="text-left p-2 font-semibold">Uwagi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Gouda, Edam", "Solanka", "20%, 10–22 h zależnie od masy; gładka skórka"],
                          ["Cheddar tradycyjny", "Suche", "2–3% masy, 2 sesje; potem woskowanie lub bandażowanie"],
                          ["Gruyère, Emmental", "Solanka + suche", "2–3 dni solanka, potem cotygodniowe pocieranie solą"],
                          ["Parmezan, Pecorino", "Solanka + suche", "3–4 dni solanka, potem kilka tygodni solenia suchego"],
                          ["Camembert, Brie", "Suche lub krótka solanka", "Delikatnie — skórka z Penicillium musi oddychać"],
                          ["Feta", "Suche + solanka", "Suche 2–3 dni, potem zalewa 8–14% jako konserwant"],
                          ["Sery Blue", "Suche", "3–3,5% — sól hamuje niepożądane bakterie przed nawiercaniem"],
                          ["Halloumi", "Gotowanie + solanka", "Po gotowaniu solanka 10–15%; przechowywanie 8–12%"],
                        ].map(([ser, metoda, uwagi]) => (
                          <tr key={ser as string} className="border-b">
                            <td className="p-2 font-medium">{ser}</td>
                            <td className="p-2">{metoda}</td>
                            <td className="p-2 text-muted-foreground">{uwagi}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jakiej soli używać i ponowne użycie solanki</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                      <p className="font-semibold text-green-800 dark:text-green-300 mb-2">Tak</p>
                      <ul className="space-y-1">
                        {["Sól kamienna niejodowana", "Sól morska bez antyzbrylaczy", "Sól warzona bez dodatków"].map((s) => (
                          <li key={s} className="flex gap-2"><span className="text-green-600">✓</span>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                      <p className="font-semibold text-red-800 dark:text-red-300 mb-2">Nie</p>
                      <ul className="space-y-1">
                        {["Sól z jodem (hamuje kultury)", "Sól z antyzbrylaczem E535/E536 (szara skórka)", "Sól z ziołami lub wędzona"].map((s) => (
                          <li key={s} className="flex gap-2"><span className="text-red-600">✕</span>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded text-sm">
                    <p className="font-semibold mb-2">Ponowne użycie solanki</p>
                    <p>Stara solanka serowarska jest <strong>lepsza niż świeża</strong> — absorbuje białka i wapń z poprzednich serów. Co 2–4 tygodnie: przegotuj, przecedź przez gazę, uzupełnij sól i CaCl₂, sprawdź pH (cel: 5,0–5,4; zbyt wysokie — dodaj łyżeczkę octu). Wyrzuć jeśli: różowy lub zielony kolor, wyraźna zmiana zapachu, mętna od pleśni.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10">
              <SekcjaFAQ slug="solenie-sera" />

              <SeeAlso links={seeAlsoLinks} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SolenieSera;
