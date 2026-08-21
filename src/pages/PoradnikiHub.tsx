import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Beaker, ShoppingCart, Scale, Factory, Flame, LibraryBig, Layers, Thermometer, Droplets, FlaskConical } from "lucide-react";
import poradnikiHeaderImage from "@/assets/poradniki-header.webp";
import ReactionButton from "@/components/ReactionButton";
import WprowadzenieDzialu from "@/components/WprowadzenieDzialu";

const PoradnikiHub = () => {

  const guides = [
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: "Poradnik dla serowarów",
      description: "Kompleksowy przewodnik po całym procesie produkcji sera - od przygotowania mleka, przez wybór kultur, proces technologiczny, po dojrzewanie i pielęgnację. Zawiera praktyczne kalkulatory, zakresy temperatur dla różnych typów serów oraz rozwiązania typowych problemów.",
      href: "/poradnik",
      color: "from-primary to-accent",
    },
    {
      icon: <Factory className="w-12 h-12" />,
      title: "Organizacja małej serowarni",
      description: "Jak zaplanować rzemieślniczą (przyzagrodową) serowarnię: układ pomieszczeń i strefy czyste/brudne, dobór sprzętu, obieg pracy od odbioru mleka po ekspedycję sera oraz wymogi lokalowe pod sprzedaż w RHD i MOL. Z polecanym filmem instruktażowym.",
      href: "/organizacja-serowarni",
      color: "from-accent to-primary",
    },
    {
      icon: <LibraryBig className="w-12 h-12" />,
      title: "Klasyka polskiego serowarstwa",
      description: "Przegląd historycznych podręczników serowarskich w domenie publicznej: Walerian Józef Klecki (1900), Jan Licznerski (1922) i Encyklopedya rolnicza. Linki do darmowych skanów, cytaty i wiedza ponadczasowa.",
      href: "/klasyka-serowarstwa",
      color: "from-violet-500 to-purple-600",
    },
    {
      icon: <Flame className="w-12 h-12" />,
      title: "Wędzenie sera",
      description: "Kompletny przewodnik: które sery się nadają, przygotowanie i osuszanie, wybór drewna (olcha, buk, owocowe), wędzenie na zimno (20–30 °C), leżakowanie po wędzeniu i najczęstsze błędy. Wędzenie wydaje się prostą modyfikacją — ale nią nie jest.",
      href: "/wedzenie-sera",
      color: "from-primary to-accent",
    },
    {
      icon: <Beaker className="w-12 h-12" />,
      title: "Kultury bakteryjne i pleśnie",
      description: "Rozszerzony przewodnik o kulturach bakteryjnych i pleśniach: charakterystyka starterów mezofilnych i termofilnych, dawki, temperatury, pH, typowe błędy oraz gotowe mieszanki kultur do popularnych serów. Z praktyczną ściągą i tabelami referencyjnymi.",
      href: "/bakterie-kultury",
      color: "from-accent to-primary",
    },
    {
      icon: <Scale className="w-12 h-12" />,
      title: "Siła podpuszczki i flokulacja",
      description: "Szczegółowe wyjaśnienie jednostek IMCU, obliczanie odpowiedniej ilości podpuszczki oraz zaawansowana metoda flokulacji pozwalająca precyzyjnie określić najlepszy moment cięcia skrzepu dla różnych typów serów.",
      href: "/sila-podpuszczki",
      color: "from-primary to-accent",
    },
    {
      icon: <FlaskConical className="w-12 h-12" />,
      title: "Chlorek wapnia do mleka",
      description: "Ile chlorku wapnia na litr mleka w trzech postaciach (bezwodny, dwuwodny, roztwór 33%), w którym momencie go dodać względem kultury i podpuszczki, po co w ogóle jest potrzebny przy mleku pasteryzowanym i co się dzieje przy przedawkowaniu.",
      href: "/chlorek-wapnia-do-mleka",
      color: "from-accent to-primary",
    },
    {
      icon: <ShoppingCart className="w-12 h-12" />,
      title: "Gdzie kupić podpuszczkę",
      description: "Kompleksowe zestawienie i porównanie dostępnych na rynku podpuszczek: analiza mocy (IMCU, 1:X), praktyczne dawkowanie oraz ocena przejrzystości informacji od producentów. Pomaga wybrać najlepszą podpuszczkę dla Twoich potrzeb.",
      href: "/gdzie-kupic-podpuszczke",
      color: "from-accent to-primary",
    },
    {
      icon: <Layers className="w-12 h-12" />,
      title: "Woskowanie sera",
      description: "Jak i czym woskować ser: wosk serowarski vs parafina, temperatura aplikacji 82–93°C w kąpieli wodnej, przygotowanie (2–7 dni osuszania), technika zanurzeniowa, 2–3 warstwy. Które sery woskować, a których absolutnie nie.",
      href: "/woskowanie-sera",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: <Thermometer className="w-12 h-12" />,
      title: "Dojrzewalnia do sera",
      description: "Dlaczego zwykła lodówka nie działa (2–4°C i 20% RH zamiast 10–14°C i 80–95%) oraz jak zrobić tanią dojrze walnię: stara lodówka + Inkbird ITC-308 za 100–200 zł lub używana piwniczka do wina. Wilgotność, obracanie i wentylacja.",
      href: "/dojrzewalnia-z-lodowki",
      color: "from-sky-500 to-blue-600",
    },
    {
      icon: <Droplets className="w-12 h-12" />,
      title: "Solenie sera",
      description: "Solanka (18–22%, Gouda 1 kg = 10–12 h) vs solenie suche (2–3% masy). Czasy dla 9 serów, stężenia, rola CaCl₂ w zapobieganiu mięknięciu skórki, sól niejodowana i zasady ponownego użycia solanki.",
      href: "/solenie-sera",
      color: "from-teal-500 to-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Poradniki serowara | Start</title>
        <meta name="description" content="Kompletne poradniki dla serowarów: kompleksowy przewodnik po produkcji sera oraz szczegółowe informacje o sile podpuszczki i metodzie flokulacji." />
        <link rel="canonical" href="https://mojaserowarnia.pl/poradniki" />
      </Helmet>
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Poradniki" }]} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <header className="relative border-b border-border py-16 md:py-24 overflow-hidden">
          <img
            src={poradnikiHeaderImage}
            alt="Poradniki dla serowarów"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/90" />
          <div className="container mx-auto px-4 relative z-10 text-primary-foreground">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Poradniki dla serowarów</h1>
            <p className="text-lg text-primary-foreground/90 max-w-3xl">
              Praktyczna wiedza serowarska zebrana w jednym miejscu. Od podstaw produkcji sera po zaawansowane techniki i obliczenia.
            </p>
          </div>
        </header>

        <section className="container mx-auto px-4 pt-12">
          <div className="max-w-5xl mx-auto">
            <WprowadzenieDzialu
              lead="Przepis powie ci, co zrobić. Poradnik tłumaczy, dlaczego to działa — i co zrobić, kiedy przestanie."
              bloki={[
                {
                  tytul: "Zanim uwarzysz",
                  tekst:
                    "Jakie mleko się nadaje i dlaczego UHT nigdy nie zetnie się w ser. Czym różnią się kultury mezofilne od termofilnych. Jak przeliczyć siłę podpuszczki podaną w IMCU na krople. Gdzie to wszystko kupić.",
                },
                {
                  tytul: "Gdy ser już jest",
                  tekst:
                    "Solenie w solance albo na sucho, woskowanie, wędzenie i dojrzewalnia zrobiona ze zwykłej lodówki. To etapy, na których najczęściej psuje się ser, który do tej pory wychodził dobrze.",
                },
                {
                  tytul: "Gdy coś poszło nie tak",
                  tekst:
                    "Ser gorzki, gumowaty, spuchnięty albo pokryty pleśnią, której się nie spodziewałeś. Osobny poradnik prowadzi od objawu do przyczyny, a drugi pokazuje, jak wady mleka zamieniają się w wady sera.",
                },
              ]}
              podsumowanie="Poradniki są napisane pod domową skalę: kilkanaście litrów mleka, kuchnia zamiast hali i lodówka zamiast dojrzewalni. Tam, gdzie coś zależy od liczby — temperatury, pH, stężenia solanki — ta liczba jest podana, a nie zastąpiona słowem „odpowiednio”."
              tropy={[
                {
                  sytuacja: "Ser się nie udał",
                  propozycja: "— od objawu do przyczyny, z ratunkiem tam, gdzie jeszcze jest możliwy:",
                  href: "/nieudany-ser",
                  etykieta: "nieudany ser",
                },
                {
                  sytuacja: "Kupujesz mleko albo krowę",
                  propozycja: "— co decyduje o wydajności i czy z tego mleka w ogóle wyjdzie ser:",
                  href: "/mleko-do-sera",
                  etykieta: "mleko do sera",
                },
                {
                  sytuacja: "Nie masz gdzie dojrzewać",
                  propozycja: "— zwykła lodówka wystarczy, trzeba ją tylko przestawić:",
                  href: "/dojrzewalnia-z-lodowki",
                  etykieta: "dojrzewalnia z lodówki",
                },
                {
                  sytuacja: "Pierwszy raz solisz",
                  propozycja: "— stężenie, czas i różnica między solanką a soleniem na sucho:",
                  href: "/solenie-sera",
                  etykieta: "solenie sera",
                },
                {
                  sytuacja: "Szukasz podstaw",
                  propozycja: "— cała droga od mleka do gotowego sera:",
                  href: "/poradnik",
                  etykieta: "poradnik dla serowarów",
                },
              ]}
            />
          </div>
        </section>

        {/* Guides Grid */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {guides.map((guide, idx) => {
              const guideIdMap: Record<string, string> = {
                "/poradnik": "poradnik",
                "/organizacja-serowarni": "organizacja-serowarni",
                "/klasyka-serowarstwa": "klasyka-serowarstwa",
                "/wedzenie-sera": "wedzenie-sera",
                "/bakterie-kultury": "bakterie-kultury",
                "/sila-podpuszczki": "sila-podpuszczki",
                "/chlorek-wapnia-do-mleka": "chlorek-wapnia-do-mleka",
                "/gdzie-kupic-podpuszczke": "gdzie-kupic-podpuszczke",
                "/woskowanie-sera": "woskowanie-sera",
                "/dojrzewalnia-z-lodowki": "dojrzewalnia-z-lodowki",
                "/solenie-sera": "solenie-sera"
              };
              const guideId = guideIdMap[guide.href] || guide.href;
              
              return (
                <a
                  key={idx}
                  href={guide.href}
                  className="group block h-full"
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${guide.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            {guide.icon}
                          </div>
                          <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                            {guide.title}
                          </CardTitle>
                        </div>
                        <ReactionButton
                          contentType="guide"
                          contentId={guideId}
                          variant="compact"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {guide.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl">💡 Jak korzystać z poradników</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  <strong>Dla początkujących:</strong> Zacznij od głównego poradnika dla serowarów, który przeprowadzi Cię przez cały proces krok po kroku.
                </p>
                <p>
                  <strong>Dla zaawansowanych:</strong> Zgłębiaj szczegółowe tematy jak siła podpuszczki i metoda flokulacji, aby udoskonalić swoje techniki i uzyskać lepszą kontrolę nad procesem.
                </p>
                <p>
                  <strong>Praktyczne narzędzia:</strong> Każdy poradnik zawiera kalkulatory i tabele referencyjne, które możesz używać podczas produkcji.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PoradnikiHub;
