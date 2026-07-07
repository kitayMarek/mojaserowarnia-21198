import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Factory, ArrowRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ReactionButton from "@/components/ReactionButton";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";

const OrganizacjaSerowarni = () => {
  const zones = [
    {
      n: 1,
      title: "Odbiór i schładzanie mleka",
      desc: "Pierwszy przystanek surowca. Miejsce na odbiór, filtrację i szybkie schłodzenie mleka (schładzalnik / tank). To strefa „brudna\" — mleko przychodzi tu prosto z udoju, więc trzymaj ją z dala od dojrzewalni i gotowego sera.",
    },
    {
      n: 2,
      title: "Serownia właściwa (produkcja)",
      desc: "Serce zakładu: kocioł/wanna serowarska, podgrzewanie, zaszczepienie kulturami, dodanie podpuszczki, cięcie i dogrzewanie skrzepu, formowanie. Potrzebuje dużo ciepłej i zimnej wody, odpływu w podłodze i dobrej wentylacji (para).",
    },
    {
      n: 3,
      title: "Ociekalnia i prasowalnia",
      desc: "Sery odciekają z serwatki i (jeśli trzeba) są prasowane. Stoły ociekowe ze spadkiem, odprowadzenie serwatki, łatwo zmywalne powierzchnie.",
    },
    {
      n: 4,
      title: "Solarnia",
      desc: "Basen solankowy 18–22% w temperaturze zbliżonej do sera (ok. 10–15°C). Chłodne, dobrze wentylowane pomieszczenie; solanka wymaga pielęgnacji (filtracja, korekta stężenia i pH).",
    },
    {
      n: 5,
      title: "Dojrzewalnia",
      desc: "Najważniejsza strefa „czysta\". Stabilna temperatura i wilgotność, regały (drewno/stal nierdzewna), kontrola mikroflory i pielęgnacja (odwracanie, przecieranie, smarowanie). Oddzielne komory dla różnych typów serów bywają błogosławieństwem.",
    },
    {
      n: 6,
      title: "Magazyn gotowego wyrobu i ekspedycja",
      desc: "Pakowanie, etykietowanie i wydawanie sera. Koniec drogi produktu — powinien być jak najdalej od strefy odbioru mleka, żeby drogi się nie krzyżowały.",
    },
    {
      n: 7,
      title: "Zaplecze sanitarne",
      desc: "Mycie i dezynfekcja sprzętu, śluza higieniczna (przebranie, mycie rąk), szatnia, magazyn opakowań i środków myjących. To one decydują o realnym bezpieczeństwie produkcji.",
    },
  ];

  const equipment = [
    { zone: "Odbiór mleka", items: "Filtry/sitka, schładzalnik lub tank, termometr, kanki/pojemniki ze stali nierdzewnej." },
    { zone: "Serownia", items: "Kocioł/wanna z podgrzewaniem, harfy i noże do cięcia skrzepu, mieszadło, czerpaki, formy, prasa, pH-metr/kwasomierz, termometry, waga." },
    { zone: "Ociekalnia", items: "Stoły ociekowe ze spadkiem, maty i chusty serowarskie, pojemniki na serwatkę." },
    { zone: "Solarnia", items: "Basen/pojemniki na solankę, areometr (Baumé) lub refraktometr do stężenia soli, chłodzenie." },
    { zone: "Dojrzewalnia", items: "Regały, higrometr i termometr (lub sterownik), nawilżacz/osuszacz, wentylacja, szczotki do pielęgnacji." },
    { zone: "Mycie i higiena", items: "Zlewy dwukomorowe, myjka ciśnieniowa, środki myjące i dezynfekujące dopuszczone do kontaktu z żywnością, umywalki do rąk." },
  ];

  const mistakes = [
    "Krzyżowanie dróg — mleko surowe mija się z gotowym serem albo brudny sprzęt z czystym. Zawsze planuj ruch „w jedną stronę\".",
    "Dojrzewalnia bez stabilnego klimatu — wahania temperatury i wilgotności rujnują partie. To pierwsze miejsce, w które warto zainwestować.",
    "Za mało punktów wody i odpływów — serowarnia to praca „na mokro\"; brak odpływu w podłodze mści się codziennie.",
    "Materiały niezmywalne — drewniane blaty robocze, chropowate ściany, sufit zbierający skropliny. Powierzchnie mają być gładkie i zmywalne.",
    "Brak śluzy higienicznej — wejście prosto z podwórka do strefy czystej to prosta droga do zanieczyszczeń.",
    "Planowanie bez zapasu — serowarnia prawie zawsze „rośnie\". Zostaw miejsce na kolejny regał, komorę czy tank.",
  ];

  const faqData = [
    {
      question: "Ile miejsca potrzeba na małą serowarnię?",
      answer:
        "Nie ma jednej liczby — liczy się układ, nie metraż. Nawet na kilkunastu–kilkudziesięciu m² da się poukładać produkcję, jeśli rozdzielisz strefy (odbiór mleka, produkcja, ociekanie, solenie, dojrzewanie, ekspedycja) i zapewnisz jednokierunkowy obieg. W bardzo małej skali część stref łączy się, a rozdziela w czasie.",
    },
    {
      question: "Czy można urządzić serowarnię w domu, garażu lub oborze?",
      answer:
        "Tak, wiele przyzagrodowych serowarni powstaje w adaptowanych pomieszczeniach. Kluczowe jest oddzielenie części produkcyjnej od mieszkalnej i od zwierząt, zmywalne powierzchnie, bieżąca ciepła i zimna woda oraz wentylacja. Przy sprzedaży w RHD/MOL zakres wymagań potwierdź u powiatowego lekarza weterynarii.",
    },
    {
      question: "Jak rozdzielić strefę brudną od czystej przy małej powierzchni?",
      answer:
        "Jeśli nie masz osobnych pomieszczeń, rozdziel strefy w czasie: najpierw operacje „brudne\" (odbiór i obróbka mleka), potem gruntowne mycie i dezynfekcja, a dopiero później operacje „czyste\" (pielęgnacja dojrzewającego sera, pakowanie). Rozdział czasowy to uznana metoda w małej produkcji.",
    },
    {
      question: "Jakie pomieszczenia i warunki są potrzebne pod sprzedaż w RHD?",
      answer:
        "W praktyce liczą się: zmywalne posadzki i ściany, bieżąca woda ciepła i zimna, umywalki do mycia rąk, wentylacja, oświetlenie, oddzielenie od części mieszkalnej i zwierząt oraz zaplecze do mycia sprzętu. Dokładny zakres zależy od skali i interpretacji — zawsze potwierdź go z powiatowym lekarzem weterynarii. Szczegóły prawne opisujemy w działach RHD i MOL.",
    },
    {
      question: "Od czego zacząć planowanie serowarni?",
      answer:
        "Od narysowania obiegu: gdzie wchodzi mleko, którędy idzie przez kolejne strefy i gdzie wychodzi gotowy ser. Dopiero do tego dopasuj pomieszczenia i sprzęt. Zacznij od stabilnej dojrzewalni i porządnego zaplecza do mycia — reszta się dołoży.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Organizacja małej serowarni — układ pomieszczeń, sprzęt i obieg pracy",
        description:
          "Jak zaplanować małą, rzemieślniczą serowarnię: rozkład pomieszczeń, strefy czyste i brudne, dobór sprzętu, obieg pracy od mleka do sera oraz wymogi lokalowe pod RHD i MOL.",
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/organizacja-serowarni",
        image: "https://mojaserowarnia.pl/film-organizacja-malej-serowarni.jpg",
        publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
      },
      {
        "@type": "VideoObject",
        name: "Jak zorganizować serowarnię?",
        description:
          "Film instruktażowy o organizacji małej, rzemieślniczej serowarni: układ pomieszczeń, dobór sprzętu i obieg pracy.",
        thumbnailUrl: ["https://mojaserowarnia.pl/film-organizacja-malej-serowarni.jpg"],
        uploadDate: "2015-01-02T00:34:08-08:00",
        duration: "PT15M2S",
        contentUrl: "https://www.youtube.com/watch?v=J7gCa66a-kI",
        embedUrl: "https://www.youtube-nocookie.com/embed/J7gCa66a-kI",
        author: {
          "@type": "Organization",
          name: "Baza produktów lokalnych z Podlaskiego",
          url: "https://www.youtube.com/@bazaproduktowlokalnychzpod8841",
        },
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
    { title: "Poradnik dla serowarów", href: "/poradnik", description: "Kompletny przewodnik: proces, temperatury, higiena, dojrzewanie." },
    { title: "Sprzedaż bezpośrednia (RHD)", href: "/prawo/rhd", description: "Zasady rolniczego handlu detalicznego krok po kroku." },
    { title: "MOL — mała produkcja", href: "/prawo/mol", description: "Marginalna, lokalna i ograniczona działalność." },
    { title: "Etykieta RHD na ser", href: "/etykieta-rhd", description: "Wymagania i darmowy generator etykiety." },
    { title: "Narzędzia serowarskie", href: "/narzedzia", description: "Kalkulatory: solanka, podpuszczka, koszt sera." },
    { title: "Baza kultur bakteryjnych", href: "/baza-kultur", description: "Dobór kultur z cenami i dawkowaniem." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Organizacja małej serowarni — układ, sprzęt i obieg pracy | Moja Serowarnia</title>
        <meta
          name="description"
          content="Jak zorganizować małą, rzemieślniczą serowarnię: układ pomieszczeń, strefy czyste i brudne, dobór sprzętu, obieg pracy od mleka do sera oraz wymogi lokalowe pod RHD i MOL."
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/organizacja-serowarni" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Poradniki", href: "/poradniki" },
          { label: "Organizacja serowarni" },
        ]}
      />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Factory}
              color="cyan"
              title="Organizacja małej serowarni — układ pomieszczeń, sprzęt i obieg pracy"
              subtitle="Jak zaplanować rzemieślniczą (przyzagrodową) serowarnię: strefy czyste i brudne, dobór sprzętu, obieg pracy od odbioru mleka po ekspedycję sera oraz wymogi lokalowe pod sprzedaż w RHD i MOL."
            />

            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="organizacja-serowarni" variant="default" />
            </div>

            <TLDRSection>
              <p>
                Dobrze zorganizowana serowarnia działa w <strong>jednym kierunku</strong> — od mleka (strefa
                „brudna") do dojrzałego sera (strefa „czysta"), bez krzyżowania dróg surowca, produktu, ludzi
                i odpadów. Kluczowe strefy: odbiór i schładzanie mleka → serownia (kocioł, obróbka skrzepu,
                formowanie) → ociekalnia/prasowalnia → solarnia → dojrzewalnia → magazyn i ekspedycja, plus
                zaplecze sanitarne. Nawet w garażu czy adaptowanej oborze da się to poukładać, jeśli rozdzielisz
                strefy w przestrzeni albo w czasie.
              </p>
            </TLDRSection>

            {/* Film */}
            <section id="film" className="py-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Film: jak zorganizować małą serowarnię</h2>
              <p className="text-muted-foreground mb-6 max-w-3xl">
                Naszym zdaniem najlepszy dostępny materiał wideo o organizacji małej, rzemieślniczej serowarni —
                od układu pomieszczeń i doboru sprzętu po obieg pracy (kanał: Baza produktów lokalnych z Podlaskiego).
              </p>
              <div
                className="relative w-full max-w-3xl rounded-2xl overflow-hidden border border-border shadow-card"
                style={{ aspectRatio: "16 / 9" }}
              >
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/J7gCa66a-kI"
                  title="Organizacja małej serowarni — film instruktażowy"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-10" />

            {/* Strefy */}
            <section id="strefy" className="py-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Strefy i układ pomieszczeń</h2>
              <p className="text-muted-foreground mb-6 max-w-3xl">
                Serowarnię projektuje się wzdłuż drogi surowca. Poniżej strefy w kolejności, w jakiej „wędruje" mleko,
                aż stanie się gotowym serem.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {zones.map((z) => (
                  <Card key={z.n}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          {z.n}
                        </span>
                        {z.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{z.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-10" />

            {/* Przepływ */}
            <section id="przeplyw" className="py-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Zasada przepływu — „w jedną stronę"</h2>
              <p className="text-muted-foreground mb-4 max-w-3xl">
                Najważniejsza reguła projektowania zakładu spożywczego: surowiec, produkt, ludzie, sprzęt i odpady
                poruszają się w jednym kierunku, a drogi „brudne" nie krzyżują się z „czystymi".
              </p>
              <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
                <p className="font-mono text-sm md:text-base text-foreground leading-relaxed">
                  Mleko surowe → odbiór → produkcja → ociekanie → solenie → <strong>dojrzewanie</strong> → pakowanie → ekspedycja
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4 max-w-3xl">
                Przy małej powierzchni, gdy nie masz osobnych pomieszczeń na każdą strefę, zastosuj{" "}
                <strong>rozdział w czasie</strong>: najpierw operacje brudne, potem gruntowne mycie i dezynfekcja,
                a dopiero później operacje czyste. To uznana metoda w produkcji rzemieślniczej.
              </p>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-10" />

            {/* Sprzęt */}
            <section id="sprzet" className="py-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Dobór sprzętu — podstawowe wyposażenie</h2>
              <div className="space-y-3">
                {equipment.map((e) => (
                  <div key={e.zone} className="grid sm:grid-cols-[180px_1fr] gap-2 sm:gap-4 p-4 rounded-lg border border-border bg-card">
                    <div className="font-semibold text-foreground">{e.zone}</div>
                    <div className="text-sm text-muted-foreground">{e.items}</div>
                  </div>
                ))}
              </div>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-10" />

            {/* Wymogi RHD */}
            <section id="wymogi" className="py-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Wymogi lokalowe pod sprzedaż (RHD / MOL)</h2>
              <p className="text-muted-foreground mb-4 max-w-3xl">
                Jeśli chcesz legalnie sprzedawać ser, pomieszczenia muszą spełniać wymagania higieniczne. W praktyce
                najczęściej chodzi o:
              </p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm mb-6">
                {[
                  "Zmywalne, gładkie posadzki i ściany (łatwe do dezynfekcji)",
                  "Bieżąca woda ciepła i zimna, odpływy w podłodze",
                  "Umywalki do mycia rąk w strefie produkcji",
                  "Sprawna wentylacja i odpowiednie oświetlenie",
                  "Oddzielenie od części mieszkalnej i od zwierząt",
                  "Zaplecze do mycia i dezynfekcji sprzętu",
                ].map((item) => (
                  <li key={item} className="flex gap-2 p-3 rounded-md bg-secondary/40">
                    <span className="text-primary">✓</span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded">
                <p className="text-sm text-foreground">
                  <strong>Ważne:</strong> dokładny zakres wymagań zależy od skali i interpretacji lokalnej. Zanim
                  ruszysz, <strong>potwierdź warunki u powiatowego lekarza weterynarii</strong>. Aspekty prawne
                  omawiamy szczegółowo w działach{" "}
                  <a href="/prawo/rhd" className="text-primary hover:underline">RHD</a> i{" "}
                  <a href="/prawo/mol" className="text-primary hover:underline">MOL</a>, a{" "}
                  <a href="/etykieta-rhd" className="text-primary hover:underline">generator etykiety RHD</a>{" "}
                  pomoże z oznakowaniem sera.
                </p>
              </div>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-10" />

            {/* Błędy */}
            <section id="bledy" className="py-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Najczęstsze błędy w organizacji serowarni</h2>
              <ul className="space-y-3">
                {mistakes.map((m, i) => (
                  <li key={i} className="flex gap-3 p-4 rounded-lg border border-border bg-card">
                    <span className="flex-shrink-0 text-destructive font-bold">✕</span>
                    <span className="text-sm text-muted-foreground">{m}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="h-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full my-10" />

            {/* FAQ */}
            <section id="faq" className="py-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Najczęściej zadawane pytania</h2>
              <div className="space-y-5">
                {faqData.map((f, i) => (
                  <div key={i}>
                    <h3 className="text-lg font-semibold mb-2">{f.question}</h3>
                    <p className="text-muted-foreground">{f.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <SeeAlso links={seeAlsoLinks} title="Zobacz również" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrganizacjaSerowarni;
