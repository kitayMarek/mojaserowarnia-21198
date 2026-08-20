import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ReactionButton from "@/components/ReactionButton";
import TLDRSection from "@/components/TLDRSection";
import WprowadzenieDzialu from "@/components/WprowadzenieDzialu";
import SeeAlso from "@/components/SeeAlso";
import SekcjaFAQ from "@/components/SekcjaFAQ";

const DojrzewalniaZLodowki = () => {
  const faqData = [
    {
      question: "Jaka temperatura jest potrzebna do dojrzewania sera?",
      answer:
        "Zależy od typu sera: Camembert i Brie — 10–12°C; Gouda, Edam — 12–14°C; Cheddar — 10–13°C; Gruyère, Emmental — 12–15°C; Parmezan — 12–16°C; sery Blue — 8–12°C. Ogólna zasada: 10–14°C to bezpieczny zakres dla większości serów dojrzewających.",
    },
    {
      question: "Czy zwykła lodówka nadaje się do dojrzewania sera?",
      answer:
        "Nie — z dwóch powodów. Temperatura: lodówka utrzymuje 2–4°C, a sery dojrzewają optymalnie w 10–14°C. W 4°C enzymy i bakterie nie pracują — ser nie dojrzewa. Wilgotność: lodówka utrzymuje RH 20–30%, a ser potrzebuje 80–95%. Przy takiej suchości ser wysycha i pęka zamiast dojrzewać.",
    },
    {
      question: "Jak zrobić dojrze walnię z piwniczki do wina?",
      answer:
        "Piwniczka do wina ma zakres 8–18°C — idealny dla serów. Ustaw temperaturę na 10–14°C. Wilgotność podnieś stawiając odkryte naczynie z wodą lub wilgotną gąbkę wewnątrz — piwniczki mają RH 60–70%, a ser potrzebuje 80–90%. Kup higrometr cyfrowy (20–40 zł) i sprawdzaj regularnie. Półki wyłóż matami bambusowymi.",
    },
    {
      question: "Co to jest kontroler temperatury Inkbird i do czego służy?",
      answer:
        "Inkbird ITC-308 to dwustronny kontroler temperatury (ok. 100–150 zł) z sondą. Podłączasz do niego dowolną lodówkę — Inkbird utrzymuje zadaną temperaturę, włączając i wyłączając urządzenie gdy temperatura się odchyla. Dzięki temu stara lodówka (która chłodzi do 4°C) może utrzymywać 12°C potrzebne do dojrzewania.",
    },
    {
      question: "Jak utrzymać wilgotność 80–90% w dojrzewalni?",
      answer:
        "Metody: (1) naczynie z wodą — płytki talerz na dnie, uzupełniaj co 2–3 dni; (2) wilgotna gąbka lub ręcznik w rogu; (3) namoczony cegłowy kamień gliniany — oddaje wilgoć przez kilka dni; (4) perforowany pojemnik z wilgotną gazą — mikroklimat wewnątrz pudełka wyższy niż w całym urządzeniu. Mierz higrometrem cyfrowym.",
    },
    {
      question: "Ile kosztuje domowa dojrzewalnia do sera?",
      answer:
        "Opcje: piwnica naturalna z higrometrem — ok. 30–50 zł; stara lodówka + Inkbird ITC-308 — 100–200 zł; używana piwniczka do wina — 300–600 zł; nowa piwniczka — 600–1500 zł; dedykowany gabinet — 1500 zł+.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Dojrzewalnia do sera z lodówki lub piwniczki — jak zrobić",
        description:
          "Jak przekształcić piwniczkę do wina lub starą lodówkę w dojrze walnię do sera: wymagane temperatury, utrzymanie wilgotności, kontroler Inkbird, koszty.",
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/dojrzewalnia-z-lodowki",
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
    { title: "Woskowanie sera", href: "/woskowanie-sera", description: "Zatrzymaj wilgoć i chroń ser bez pielęgnacji skórki." },
    { title: "Solenie sera", href: "/solenie-sera", description: "Solanka vs solenie suche — czasy, stężenia i technika." },
    { title: "Kalkulator solanki", href: "/kalkulator-solanki", description: "Oblicz stężenie i ilość soli do solanki." },
    { title: "Wędzenie sera", href: "/wedzenie-sera", description: "Drewno, temperatura 20–30°C i leżakowanie po wędzeniu." },
  ];

  const cheeseCaveData = [
    { type: "Camembert, Brie", temp: "10–12°C", rh: "90–95%", time: "3–6 tygodni" },
    { type: "Gouda, Edam", temp: "12–14°C", rh: "80–85%", time: "2–12 miesięcy" },
    { type: "Cheddar", temp: "10–13°C", rh: "80–85%", time: "3 mies. – kilka lat" },
    { type: "Gruyère, Emmental", temp: "12–15°C", rh: "85–92%", time: "5–12 miesięcy" },
    { type: "Parmezan, Pecorino", temp: "12–16°C", rh: "70–80%", time: "12–36 miesięcy" },
    { type: "Sery Blue", temp: "8–12°C", rh: "90–95%", time: "2–6 miesięcy" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Dojrzewalnia do sera z lodówki lub piwniczki | Moja Serowarnia</title>
        <meta
          name="description"
          content="Jak zrobić dojrze walnię do sera: piwniczka do wina, stara lodówka + Inkbird ITC-308, temperatura 10–14°C, wilgotność 80–95%, koszty od 200 zł."
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/dojrzewalnia-z-lodowki" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Poradniki", href: "/poradniki" },
          { label: "Dojrzewalnia do sera" },
        ]}
      />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Thermometer}
              color="sky"
              title="Dojrzewalnia do sera z lodówki"
              subtitle="Ser dojrzewa w 10–14°C przy wilgotności 80–95% — żadna domowa lodówka tego nie zapewni. Najprostsze rozwiązanie: piwniczka do wina lub stara lodówka z kontrolerem Inkbird za 100–200 zł."
            />

            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="dojrzewalnia-z-lodowki" variant="default" />
            </div>

            <WprowadzenieDzialu

              lead={"Zwykła lodówka jest dla sera za zimna i za sucha — ale to jedyne dwie rzeczy, które trzeba w niej zmienić."}

              podsumowanie={"Ser potrzebuje 10–14°C i 80–95% wilgotności, a lodówka daje 2–4°C i jakieś 25%. Ten poradnik pokazuje, jak przestawić zwykłą lodówkę zamiast kupować dojrzewalnię, i czego pilnować, żeby ser nie wysechł ani nie zapleśniał tam, gdzie nie powinien."}

              tropy={[

                {

                  sytuacja: "Ser wysycha albo pęka",

                  propozycja: "— skórki można nie mieć wcale:",

                  href: "/woskowanie-sera",

                  etykieta: "woskowanie sera",

                },

                {

                  sytuacja: "Chcesz dodać aromat",

                  propozycja: "— tylko na zimno, inaczej tłuszcz się wytapia:",

                  href: "/wedzenie-sera",

                  etykieta: "wędzenie sera",

                },

                {

                  sytuacja: "Coś poszło nie tak w dojrzewaniu",

                  propozycja: "— od objawu do przyczyny:",

                  href: "/nieudany-ser",

                  etykieta: "nieudany ser",

                },

                {

                  sytuacja: "Szukasz sera na start",

                  propozycja: "— dojrzewa krótko i wybacza:",

                  href: "/przepisy/gouda",

                  etykieta: "gouda",

                },

              ]}

            />

            <TLDRSection>
              <p>
                Zwykła lodówka to <strong>za zimno (2–4°C)</strong> i <strong>za sucho (20–30% RH)</strong>. Ser
                potrzebuje <strong>10–14°C i 80–95% wilgotności</strong>. Najtańsze rozwiązanie: stara lodówka +{" "}
                <strong>kontroler Inkbird ITC-308 (~100–150 zł)</strong>. Wygodniejsze:{" "}
                <strong>używana piwniczka do wina (300–600 zł)</strong>. Obowiązkowo kup{" "}
                <strong>higrometr cyfrowy (~30 zł)</strong> — bez pomiaru wilgotności działasz na ślepo.
              </p>
            </TLDRSection>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wymagane warunki dla różnych serów</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Typ sera</th>
                          <th className="text-left p-2 font-semibold">Temperatura</th>
                          <th className="text-left p-2 font-semibold">Wilgotność RH</th>
                          <th className="text-left p-2 font-semibold">Czas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cheeseCaveData.map((row) => (
                          <tr key={row.type} className="border-b">
                            <td className="p-2 font-medium">{row.type}</td>
                            <td className="p-2">{row.temp}</td>
                            <td className="p-2">{row.rh}</td>
                            <td className="p-2">{row.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dlaczego zwykła lodówka nie działa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                      <p className="font-semibold text-red-800 dark:text-red-300">Temperatura — za niska</p>
                      <p className="mt-1">Lodówka: <strong>2–4°C</strong><br />Ser potrzebuje: <strong>10–14°C</strong><br />W 4°C enzymy i bakterie nie pracują — ser zamiera, nie dojrzewa.</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                      <p className="font-semibold text-red-800 dark:text-red-300">Wilgotność — za niska</p>
                      <p className="mt-1">Lodówka: <strong>20–30% RH</strong><br />Ser potrzebuje: <strong>80–95% RH</strong><br />Ser wysycha, pęka i twardnieje zamiast dojrzewać.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Opcje — od najtańszej do najdroższej</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {[
                    {
                      num: "1",
                      title: "Piwnica lub zaciemniony garaż — 0 zł",
                      text: "Jeśli masz piwnicę z naturalną temperaturą 10–14°C przez cały rok — masz idealną dojrze walnię. Dodaj higrometr (~30 zł) i naczynie z wodą dla wilgotności. Wada: temperatura zależy od sezonu.",
                      color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
                    },
                    {
                      num: "2",
                      title: "Stara lodówka + Inkbird ITC-308 — 100–200 zł",
                      text: "Kontroler mierzy temperaturę sondą i odcina prąd gdy jest za zimno. Ustaw na 12°C — lodówka chłodzi tylko gdy temperatura rośnie powyżej progu. Wilgotność podnieś naczyniem z wodą. Najtańsze rozwiązanie jeśli masz starą lodówkę.",
                      color: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
                    },
                    {
                      num: "3",
                      title: "Używana piwniczka do wina — 300–600 zł",
                      text: "Zakres 8–18°C, zaprojektowana do utrzymywania stałej temperatury. Ustaw na 12–14°C. Wilgotność 60–70% RH — za mała dla serów miękkich, wystarczająca dla twardych z woskiem. Dodaj naczynie z wodą.",
                      color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
                    },
                    {
                      num: "4",
                      title: "Nowa piwniczka do wina — 600–1500 zł",
                      text: "Dokładniejsza regulacja, cichsza, lepsza izolacja. 30–50 L pojemności = 8–15 serów. Szukaj modeli z zakresem regulacji do 8°C (potrzebne dla Blue).",
                      color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
                    },
                  ].map(({ num, title, text, color }) => (
                    <div key={num} className={`border p-4 rounded-lg ${color}`}>
                      <p className="font-semibold mb-1">{num}. {title}</p>
                      <p>{text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jak podnieść wilgotność</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                    <p className="font-semibold">Cel: 80–90% RH dla większości serów</p>
                  </div>
                  <ul className="space-y-2">
                    {[
                      { label: "Naczynie z wodą", desc: "Płytki talerz lub miska na dnie; uzupełniaj co 2–3 dni." },
                      { label: "Wilgotna gąbka lub ręcznik", desc: "Umieść w rogu urządzenia; zwilżaj co 2 dni." },
                      { label: "Namoczony kamień gliniany", desc: "Wchłania wodę i oddaje ją przez kilka dni — naturalna regulacja." },
                      { label: "Perforowany pojemnik z gazą", desc: "Ser w plastikowym pudełku z dziurkami — mikroklimat wewnątrz będzie wyższy niż w całej piwniczce." },
                    ].map(({ label, desc }) => (
                      <li key={label} className="flex gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span><strong>{label}</strong> — {desc}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-4 rounded text-sm">
                    <strong>Higrometr cyfrowy to obowiązek.</strong> Bez pomiaru wilgotności nie wiesz co robisz. Kup tani model z termometrem (Govee, Inkbird) za 20–50 zł. Sprawdzaj przez pierwsze tygodnie codziennie, aż ustawienie się ustabilizuje.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Podłoże, obracanie i wentylacja</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p><strong>Podłoże:</strong> maty bambusowe lub wiklinowe (cyrkulacja powietrza pod serem, myj co tydzień solą) albo deski drewniane (wchłaniają wilgoć — dezynfekuj solą i octem). Unikaj plastikowych tacek bez perforacji — zbiera się pod nimi kondensacja.</p>
                  <p><strong>Obracanie:</strong> codziennie przez pierwsze 2 tygodnie, potem co 2–3 dni. Równomierny dostęp powietrza = równomierna skórka.</p>
                  <p><strong>Wentylacja:</strong> otwieraj drzwi raz dziennie przy obracaniu. Przy szczelnych modelach wywierć 2–3 otwory ⌀ 5 mm w boku i zatkaj gazą. Opcja: mały wentylator USB 5V na timerze, kilka minut dziennie.</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10">
              <SekcjaFAQ slug="dojrzewalnia-z-lodowki" />

              <SeeAlso links={seeAlsoLinks} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DojrzewalniaZLodowki;
