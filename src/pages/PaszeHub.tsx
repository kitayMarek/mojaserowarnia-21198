import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wheat, Calculator, Recycle, LifeBuoy, Droplet, Shell, Sparkles, Mountain, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ReactionButton from "@/components/ReactionButton";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import OstrzezenieSol from "@/components/OstrzezenieSol";
import { Link } from "react-router-dom";

const PaszeHub = () => {
  const faqData = [
    {
      question: "Dlaczego do paszy dla kur dodaje się olej?",
      answer:
        "Z czterech powodów. Po pierwsze, witaminy A, D3, E i K rozpuszczają się wyłącznie w tłuszczach — bez tłuszczu w paszy kura wydali je niewchłonięte, a brak witaminy D3 oznacza słabe skorupki nawet przy dużej podaży wapnia. Po drugie, olej wiąże pył ze śrutowanych zbóż, który drażni drogi oddechowe. Po trzecie, tłuszcz dostarcza ponad dwa razy więcej energii niż zboża, co ratuje bilans latem, gdy kury jedzą mniej z powodu upałów, i zimą, gdy zużywają energię na ogrzanie ciała. Po czwarte, kwas linolowy z olejów roślinnych zwiększa masę znoszonych jaj. Typowy dodatek to 1,5–2% mieszanki.",
    },
    {
      question: "Dlaczego muszle ostryg są lepsze niż drobno zmielona kreda?",
      answer:
        "Bo liczy się tempo uwalniania wapnia, nie tylko jego ilość. Skorupa jaja powstaje głównie w nocy. Drobno zmielona kreda lub skorupki z kuchni wchłaniają się szybko i zostają wydalone jeszcze przed nocą, więc kura buduje skorupę z wapnia pobranego z własnych kości. Grube frakcje, takie jak muszle ostryg, zalegają w żołądku mięśniowym i uwalniają wapń powoli przez całą noc — dokładnie wtedy, gdy jest potrzebny. Najlepszym rozwiązaniem jest podanie obu frakcji jednocześnie.",
    },
    {
      question: "Dlaczego kury wydziobują sobie pióra i zjadają jaja?",
      answer:
        "Najczęstszą przyczyną jest niedobór metioniny — aminokwasu, którego zboża i zielonka zawierają bardzo mało. Gdy go brakuje, ptak zaczyna szukać białka tam, gdzie jest go dużo: w piórach współtowarzyszek i we własnych jajach. Źródła metioniny to śruta sojowa, makuch słonecznikowy i mączka rybna. W chowie ekologicznym, gdzie nie wolno stosować syntetycznej metioniny, trzeba łączyć makuch słonecznikowy, drożdże paszowe i zarodki pszenne.",
    },
    {
      question: "Po co kurom grit, skoro dostają paszę?",
      answer:
        "Kury nie mają zębów — rozcieranie pokarmu odbywa się w żołądku mięśniowym, który działa jak młyn. Żeby ten młyn działał, potrzebuje twardych, nierozpuszczalnych kamyczków, czyli gritu. Bez niego ziarno przechodzi przez przewód pokarmowy częściowo niestrawione i zostaje wydalone. W praktyce oznacza to, że hodowca płaci za paszę, której ptak nie przyswaja. Grit to nie to samo co kreda czy muszle: kreda jest rozpuszczalna i pełni funkcję mineralną, grit jest nierozpuszczalny i pełni funkcję mechaniczną.",
    },
    {
      question: "Ile białka potrzebują kury na poszczególnych etapach?",
      answer:
        "Pisklęta od 0 do 8 tygodnia potrzebują 18–20% białka ogólnego przy około 1,0% wapnia. Młodzież od 9 do 17 tygodnia — 14–15% białka i 1,0–1,2% wapnia; celowo mniej, żeby ptaki się nie otłuściły przed rozpoczęciem nośności. Kury nioski w szczycie nośności — 16–18% białka, ale przede wszystkim aż 3,8–4,2% wapnia, czyli około czterokrotnie więcej niż młodzież, ze względu na produkcję skorup.",
    },
    {
      question: "Ile soli potrzebuje drób i od jakiej dawki sól jest groźna?",
      answer:
        "Sód jest niezbędny — odpowiada za przewodnictwo nerwowe, gospodarkę wodną i apetyt, a jego niedobór powoduje gorsze przyrosty, spadek nieśności oraz kanibalizm i wydziobywanie piór. Prawidłowy poziom to około 0,3% NaCl w mieszance, czyli 3 g na kilogram paszy. Jednocześnie drób należy do najwrażliwszych na sól zwierząt gospodarskich: orientacyjnie 3–4 g NaCl na kilogram masy ciała bywa dawką śmiertelną, a pisklęta są wielokrotnie wrażliwsze od ptaków dorosłych. W gospodarstwie z serowarnią ryzyko jest realne, bo solanka o stężeniu 20% zawiera 200 g soli w litrze — tyle, co około 66 kg prawidłowej paszy. Dla kury o masie 2 kg śmiertelne bywa już 30–40 ml solanki. Objawy narastają w kolejności: wzmożone pragnienie, wodniste odchody, niezborność ruchów, drgawki, śmierć. Stały dostęp do czystej wody drastycznie zmniejsza ryzyko.",
    },
    {
      question: "Czy serwatkę po serze można wykorzystać jako paszę?",
      answer:
        "Tak, i jest to najstarszy sposób jej zagospodarowania. Najlepszym odbiorcą są świnie — tuczniki przyjmują orientacyjnie 10–20 litrów dziennie, zastępując część wody. Drobiowi serwatkę podaje się ostrożnie i wyłącznie ukwaszoną, bo ptaki nie trawią laktozy i dostają mokrej ściółki. Serwatki solonej nie wolno skarmiać nigdy — grozi zatruciem solą. Pełne dawki i zasady opisujemy na osobnej stronie o serwatce w żywieniu zwierząt.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Pasze i zwierzęta w gospodarstwie — bilansowanie i produkty uboczne",
        description:
          "Dział o żywieniu zwierząt gospodarskich: kalkulatory pasz dla drobiu i bydła, normy żywieniowe, po co olej, muszle ostryg, metionina i grit, oraz zagospodarowanie serwatki i nieudanego sera.",
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/pasze",
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
    { title: "Poradnik dla serowarów", href: "/poradnik", description: "Druga strona gospodarstwa — od mleka do gotowego sera." },
    { title: "RHD — sprzedaż domowego sera", href: "/prawo/rhd", description: "Limit 100 000 zł, rejestracja i ewidencja sprzedaży." },
    { title: "Organizacja małej serowarni", href: "/organizacja-serowarni", description: "Układ pomieszczeń, sprzęt i koszty startu." },
  ];

  const narzedzia = [
    {
      icon: <Calculator className="w-10 h-10" />,
      title: "Kalkulator pasz dla drobiu",
      description: "Ułóż i zbilansuj mieszankę dla piskląt, młodzieży i niosek. Liczy białko, wapń i energię, ostrzega przy niedoborach.",
      href: "/kalkulator-pasz",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: <Calculator className="w-10 h-10" />,
      title: "Kalkulator pasz dla bydła",
      description: "Dawka dla krów mlecznych i opasów — bilans energetyczno-białkowy z uwzględnieniem pasz objętościowych.",
      href: "/kalkulator-pasz-bydlo",
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const obieg = [
    {
      icon: <Recycle className="w-10 h-10" />,
      title: "Serwatka w żywieniu zwierząt",
      description: "Z 10 L mleka zostaje 8–9 L serwatki. Dawki dla świń, drobiu i cieląt, serwatka słodka vs kwasowa, ostrzeżenie o solonej i wykorzystanie jako nawóz.",
      href: "/serwatka-dla-zwierzat",
      color: "from-teal-500 to-cyan-600",
    },
    {
      icon: <LifeBuoy className="w-10 h-10" />,
      title: "Nieudany ser — co z nim zrobić",
      description: "Tabela 9 objawów z przyczyną i ścieżką odzysku. Kiedy ratować, kiedy przerobić na topiony, kiedy wyrzucić i czy można oddać zwierzętom.",
      href: "/nieudany-ser",
      color: "from-amber-500 to-yellow-600",
    },
  ];

  const dodatki = [
    {
      icon: <Droplet className="w-6 h-6" />,
      title: "Olej roślinny (1,5–2%)",
      why: "Witaminy A, D3, E i K rozpuszczają się tylko w tłuszczach — bez oleju kura je wydali niewchłonięte. Brak D3 to słabe skorupki mimo dużej podaży wapnia. Olej wiąże też pył paszowy i podnosi energię dawki.",
    },
    {
      icon: <Shell className="w-6 h-6" />,
      title: "Muszle ostryg (gruba frakcja)",
      why: "Skorupa jaja powstaje w nocy. Drobna kreda wchłania się za szybko i zostaje wydalona przed nocą. Grube muszle zalegają w żołądku i uwalniają wapń powoli — dokładnie wtedy, gdy kura go potrzebuje.",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Źródła metioniny",
      why: "Niedobór metioniny to główna przyczyna wydziobywania piór i zjadania jaj — ptak szuka białka tam, gdzie jest go dużo. Źródła: makuch słonecznikowy, śruta sojowa, mączka rybna. W eko dodatkowo drożdże paszowe i zarodki pszenne.",
    },
    {
      icon: <Mountain className="w-6 h-6" />,
      title: "Grit (nierozpuszczalny żwirek)",
      why: "Kury nie mają zębów — pokarm rozciera żołądek mięśniowy, ale potrzebuje do tego twardych kamyczków. Bez gritu ziarno wychodzi w połowie niestrawione, czyli pasza dosłownie się marnuje. Grit to nie to samo co kreda.",
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Sól — 0,3%, ani więcej, ani mniej",
      why: "Sód jest niezbędny (przewodnictwo nerwowe, gospodarka wodna, apetyt), a jego niedobór — podobnie jak brak metioniny — wywołuje kanibalizm. Ale drób jest wyjątkowo wrażliwy na przesolenie: już 3–4 g NaCl na kg masy ciała bywa dawką śmiertelną. W gospodarstwie z serowarnią to realne ryzyko — patrz ramka wyżej.",
    },
  ];

  const normy = [
    { etap: "Pisklęta (0–8 tyg.)", bialko: "18–20%", wapn: "~1,0%", energia: "~2800 kcal/kg", uwaga: "szybki wzrost, wysokie zapotrzebowanie na witaminy" },
    { etap: "Młodzież (9–17 tyg.)", bialko: "14–15%", wapn: "1,0–1,2%", energia: "~2700 kcal/kg", uwaga: "celowo mniej białka, by ptaki się nie otłuściły" },
    { etap: "Nioski (szczyt nośności)", bialko: "16–18%", wapn: "3,8–4,2%", energia: "2700–2750 kcal/kg", uwaga: "czterokrotnie więcej wapnia niż u młodzieży" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pasze i zwierzęta — bilansowanie mieszanek i produkty uboczne | Moja Serowarnia</title>
        <meta
          name="description"
          content="Dział o żywieniu zwierząt: kalkulatory pasz dla drobiu i bydła, normy (nioski 16–18% białka, 3,8–4,2% wapnia), po co olej, muszle ostryg, metionina i grit, oraz co zrobić z serwatką i nieudanym serem."
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/pasze" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs items={[{ label: "Pasze i zwierzęta" }]} />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Wheat}
              color="amber"
              title="Pasze i zwierzęta w gospodarstwie"
              subtitle="Gospodarstwo to jeden obieg: mleko idzie na ser, serwatka i nieudane partie wracają do zwierząt, a zwierzęta dają mleko. Ten dział zajmuje się drugą połową tego cyklu."
            />

            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="pasze-hub" variant="default" />
            </div>

            <TLDRSection>
              <p>
                Najczęstszy błąd w chowie przydomowym to karmienie kur <strong>samym zbożem</strong> —
                skutkuje niedoborem białka, metioniny i wapnia. Nioska w szczycie nośności potrzebuje{" "}
                <strong>16–18% białka</strong> i aż <strong>3,8–4,2% wapnia</strong>. Do tego cztery
                dodatki, które amatorzy pomijają: <strong>olej</strong> (bez niego witaminy A, D3, E, K
                przechodzą niewchłonięte), <strong>grube muszle ostryg</strong>, źródła{" "}
                <strong>metioniny</strong> i <strong>grit</strong>.
              </p>
            </TLDRSection>

            <OstrzezenieSol kontekst="ogolny" />

            {/* NARZĘDZIA */}
            <h2 className="text-2xl font-bold mt-10 mb-4">Kalkulatory</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {narzedzia.map((n) => (
                <Link key={n.href} to={n.href} className="group block h-full">
                  <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary">
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${n.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300`}>
                        {n.icon}
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{n.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">{n.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* NORMY */}
            <h2 className="text-2xl font-bold mt-12 mb-4">Normy żywieniowe drobiu</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-secondary/50">
                        <th className="text-left p-2 font-semibold">Etap</th>
                        <th className="text-left p-2 font-semibold">Białko ogólne</th>
                        <th className="text-left p-2 font-semibold">Wapń</th>
                        <th className="text-left p-2 font-semibold">Energia</th>
                        <th className="text-left p-2 font-semibold">Na co uważać</th>
                      </tr>
                    </thead>
                    <tbody>
                      {normy.map((r) => (
                        <tr key={r.etap} className="border-b">
                          <td className="p-2 font-medium">{r.etap}</td>
                          <td className="p-2 tabular-nums">{r.bialko}</td>
                          <td className="p-2 tabular-nums font-semibold">{r.wapn}</td>
                          <td className="p-2 tabular-nums">{r.energia}</td>
                          <td className="p-2 text-muted-foreground">{r.uwaga}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Gotową mieszankę ułożysz w{" "}
                  <Link to="/kalkulator-pasz" className="text-primary hover:underline">
                    kalkulatorze pasz
                  </Link>{" "}
                  — liczy średnią ważoną białka i ostrzega przy niedoborach.
                </p>
              </CardContent>
            </Card>

            {/* DLACZEGO */}
            <h2 className="text-2xl font-bold mt-12 mb-2">Cztery dodatki, które amatorzy pomijają</h2>
            <p className="text-muted-foreground mb-4">
              Kalkulator powie <em>ile</em>. Tu wyjaśniamy <em>dlaczego</em> — bo bez tego łatwo uznać
              te składniki za zbędny wydatek.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {dodatki.map((d) => (
                <Card key={d.title}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="text-primary">{d.icon}</span>
                      {d.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{d.why}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* OBIEG */}
            <h2 className="text-2xl font-bold mt-12 mb-2">Z serowarni do obory — zamknięty obieg</h2>
            <p className="text-muted-foreground mb-4">
              Produkcja sera zostawia dwa produkty uboczne, które w gospodarstwie nie muszą być
              odpadem.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {obieg.map((o) => (
                <Link key={o.href} to={o.href} className="group block h-full">
                  <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary">
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${o.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300`}>
                        {o.icon}
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{o.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">{o.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* FAQ */}
            <h2 className="text-2xl font-bold mt-12 mb-4">Najczęstsze pytania</h2>
            <div className="space-y-4">
              {faqData.map((f) => (
                <Card key={f.question}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{f.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <SeeAlso links={seeAlsoLinks} />
      <Footer />
    </div>
  );
};

export default PaszeHub;
