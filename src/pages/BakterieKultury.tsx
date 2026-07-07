import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import kulturyHeaderImage from "@/assets/kultury-header.webp";
import ReactionButton from "@/components/ReactionButton";
import FAQSchema from "@/components/FAQSchema";

const BakterieKultury = () => {
  const faqData = [
    {
      question: "Czym różni się kultura mezofilna od termofilnej?",
      answer:
        "Kultury mezofilne działają w niższych temperaturach (ok. 25–35 °C) i są bazą serów świeżych oraz półtwardych — twarogu, goudy, edamu, cheddara. Kultury termofilne pracują w wyższych temperaturach (ok. 40–55 °C) i wytrzymują mocne dogrzewanie skrzepu, dlatego stosuje się je w serach włoskich i twardych — mozzarelli, parmezanie, gruyère. O wyborze decyduje przede wszystkim temperatura dogrzewania Twojego sera.",
    },
    {
      question: "Jaką kulturę wybrać do goudy?",
      answer:
        "Gouda to ser półtwardy dogrzewany łagodnie, więc bazą jest kultura mezofilna (typu LD/LL z Lactococcus lactis). Często dodaje się szczepy aromatyczne/gazotwórcze (Leuconostoc, diacetylactis) dla delikatnych oczek i maślanego aromatu. Konkretne produkty z dawkami i cenami znajdziesz w bazie kultur.",
    },
    {
      question: "Ile kultury dodać do mleka?",
      answer:
        "Dawki kultur DVI (liofilizowanych, dodawanych wprost do mleka) są bardzo małe i zależą od producenta — orientacyjnie ułamek jednostki U na kilkadziesiąt litrów mleka. Zawsze kieruj się kartą produktu: w przewodniku podajemy zakresy startowe, a dokładne wartości są przy każdej kulturze w bazie.",
    },
    {
      question: "Czy można zrobić ser bez kultury, na jogurcie?",
      answer:
        "Do prostych serów termofilnych (np. domowa mozzarella) można użyć żywego jogurtu naturalnego jako źródła bakterii, ale efekty są mniej powtarzalne niż z kultur serowarskich. Do serów mezofilnych i dojrzewających lepiej użyć dedykowanej kultury — masz kontrolę nad składem szczepów i przebiegiem kwaszenia.",
    },
    {
      question: "Skąd biorą się oczka w serze i jak je uzyskać?",
      answer:
        "Za drobne oczka i maślany aromat odpowiadają szczepy gazotwórcze (Leuconostoc, Lactococcus lactis biovar diacetylactis). Duże oczka serów szwajcarskich (np. Emmental) tworzą bakterie propionowe. Jeśli używasz kultury podstawowej bez tych szczepów, oczek będzie mało lub wcale — dobierz kulturę typu LD/DL albo dodaj osobno szczepy aromatyczne.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Kultury bakteryjne do sera — jak dobrać (mezofilne, termofilne, pleśnie) | Moja Serowarnia</title>
        <meta name="description" content="Jak dobrać kulturę bakteryjną do sera: mezofilna vs termofilna, dawki startowe, temperatury, pH, gotowe mieszanki (gouda, mozzarella, camembert) oraz typowe błędy. Praktyczny przewodnik krok po kroku." />
        <link rel="canonical" href="https://mojaserowarnia.pl/bakterie-kultury" />
      </Helmet>
      <FAQSchema faqs={faqData} />
      <Navigation />
      <PageBreadcrumbs items={[
        { label: "Poradniki", href: "/poradniki" },
        { label: "Bakterie i Kultury" }
      ]} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <header className="relative border-b border-border py-16 md:py-20 overflow-hidden">
          <img
            src={kulturyHeaderImage}
            alt="Kultury bakteryjne w serowarstwie"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/90" />
          <div className="container mx-auto px-4 relative z-10 text-primary-foreground">
            <div className="flex items-start justify-between gap-4 max-w-5xl">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  Kultury bakteryjne i pleśnie w serowarstwie
                </h1>
                <p className="text-lg text-primary-foreground/90 max-w-3xl">
                  Przewodnik praktyczny: charakterystyka kultur, dawki, temperatury i typowe błędy
                </p>
              </div>
              <ReactionButton
                contentType="guide"
                contentId="bakterie-kultury"
                variant="compact"
              />
            </div>
          </div>
        </header>

        {/* Quick Navigation */}
        <nav className="border-b border-border bg-card sticky top-20 z-40">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 py-3 overflow-x-auto">
              <a href="#sec-mezo" className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-full whitespace-nowrap transition-colors">Mezofilne LAB</a>
              <a href="#sec-termo" className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-full whitespace-nowrap transition-colors">Termofilne LAB</a>
              <a href="#sec-nslab" className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-full whitespace-nowrap transition-colors">NSLAB</a>
              <a href="#sec-white" className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-full whitespace-nowrap transition-colors">Pleśnie białe</a>
              <a href="#sec-blue" className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-full whitespace-nowrap transition-colors">Pleśnie niebieskie</a>
              <a href="#sec-smear" className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-full whitespace-nowrap transition-colors">Sery mazowe</a>
              <a href="#sec-blends" className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-full whitespace-nowrap transition-colors">Mieszanki</a>
              <a href="#sec-cheatsheet" className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-full whitespace-nowrap transition-colors">Ściąga</a>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Callout: baza kultur (rola: wyszukanie) + rozdzielenie ról */}
          <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-1">Szukasz konkretnej kultury — z ceną i sklepem?</p>
              <p className="text-sm text-muted-foreground">
                Ten przewodnik pomaga <strong>zrozumieć i dobrać</strong> kultury. Gotowe produkty z dawkami, cenami i dostępnością w polskich sklepach znajdziesz w <strong>bazie kultur</strong>.
              </p>
            </div>
            <a href="/baza-kultur" className="shrink-0 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Otwórz bazę kultur →
            </a>
          </div>

          {/* Jak dobrać — sekcja pod frazy decyzyjne */}
          <section className="max-w-7xl mx-auto mb-10">
            <Card className="p-6">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Jak dobrać kulturę do sera?</h2>
              <p className="text-muted-foreground mb-4">
                Wybór kultury zaczyna się od <strong>temperatury dogrzewania</strong> Twojego sera oraz tego, jaką <strong>teksturę i aromat</strong> chcesz uzyskać:
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li>• <strong>Sery łagodnie dogrzewane</strong> (twaróg, gouda, edam, cheddar, camembert) → baza <strong>mezofilna</strong> (25–35 °C).</li>
                <li>• <strong>Sery mocno dogrzewane</strong> (mozzarella, parmezan, gruyère, emmental) → <strong>termofilna</strong> (40–55 °C).</li>
                <li>• <strong>Oczka i maślany aromat</strong> → dodaj szczepy <strong>aromatyczne/gazotwórcze</strong> (Leuconostoc, diacetylactis).</li>
                <li>• <strong>Skórka i charakter</strong> → pleśnie (P. candidum, P. roqueforti) lub bakterie maziowe (B. linens).</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Poniżej znajdziesz szczegółową charakterystykę każdej grupy, dawki i temperatury. Gotowe produkty z cenami są w{" "}
                <a href="/baza-kultur" className="text-primary hover:underline">bazie kultur</a>, a najczęstsze pytania — w sekcji FAQ na dole.
              </p>
            </Card>
          </section>

          <div className="grid lg:grid-cols-[280px_1fr] gap-8 max-w-7xl mx-auto">
            {/* Sidebar TOC */}
            <aside className="hidden lg:block">
              <Card className="sticky top-32 p-4">
                <h3 className="font-bold text-primary mb-3">Spis treści</h3>
                <nav className="space-y-1 text-sm">
                  <a href="#sec-mezo" className="block px-2 py-1.5 rounded hover:bg-secondary transition-colors">1. Mezofilne LAB</a>
                  <a href="#lcl-lactis" className="block px-2 py-1.5 pl-4 rounded hover:bg-secondary transition-colors text-muted-foreground">— Lc. lactis ssp. lactis</a>
                  <a href="#lcl-cremoris" className="block px-2 py-1.5 pl-4 rounded hover:bg-secondary transition-colors text-muted-foreground">— Lc. lactis ssp. cremoris</a>
                  <a href="#sec-termo" className="block px-2 py-1.5 rounded hover:bg-secondary transition-colors">2. Termofilne LAB</a>
                  <a href="#st-thermo" className="block px-2 py-1.5 pl-4 rounded hover:bg-secondary transition-colors text-muted-foreground">— Streptococcus thermophilus</a>
                  <a href="#lh-helv" className="block px-2 py-1.5 pl-4 rounded hover:bg-secondary transition-colors text-muted-foreground">— Lactobacillus helveticus</a>
                  <a href="#ldb-bulg" className="block px-2 py-1.5 pl-4 rounded hover:bg-secondary transition-colors text-muted-foreground">— Lb. delbrueckii ssp. bulgaricus</a>
                  <a href="#sec-nslab" className="block px-2 py-1.5 rounded hover:bg-secondary transition-colors">3. NSLAB / wtórne</a>
                  <hr className="my-2 border-border" />
                  <a href="#sec-white" className="block px-2 py-1.5 rounded hover:bg-secondary transition-colors">4. Pleśnie białe</a>
                  <a href="#sec-blue" className="block px-2 py-1.5 rounded hover:bg-secondary transition-colors">5. Pleśnie niebieskie</a>
                  <a href="#sec-smear" className="block px-2 py-1.5 rounded hover:bg-secondary transition-colors">6. Sery mazowe & drożdże</a>
                  <hr className="my-2 border-border" />
                  <a href="#sec-blends" className="block px-2 py-1.5 rounded hover:bg-secondary transition-colors">7. Mieszanki</a>
                  <a href="#sec-cheatsheet" className="block px-2 py-1.5 rounded hover:bg-secondary transition-colors">8. Ściąga</a>
                </nav>
              </Card>
            </aside>

            {/* Content */}
            <div className="space-y-6">
              {/* MEZO */}
              <section id="sec-mezo">
                <Card className="p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Mezofilne LAB (20–32 °C)</h2>
                  <p className="text-muted-foreground mb-6">
                    Startery mezofilne są fundamentem serów świeżych i półtwardych. Ich zadaniem jest szybkie, stabilne obniżenie pH oraz nadanie łagodnego, śmietankowego profilu aromatycznego.
                  </p>

                  <h3 id="lcl-lactis" className="text-xl font-bold mb-3 mt-6">Lactococcus lactis subsp. <em>lactis</em></h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">homofermentatywny</Badge>
                    <Badge variant="secondary">~30 °C</Badge>
                    <Badge variant="secondary">bardzo szybkie pH↓</Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Rola & efekty</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Szybka acidyfikacja (cel pH: 6,4 → 6,2 w 30–45 min po dodaniu; 6,0–5,9 po 60–90 min)</li>
                        <li>• Poprawa bezpieczeństwa (konkurencja z flora dziką, bakteriocyny)</li>
                        <li>• Tekstura: sprężysta, jednolita</li>
                      </ul>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Dawki & użycie</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <strong>Na 10 L mleka:</strong> 1/8–1/4 łyżeczki liofilizatu (DVI)</li>
                        <li>• Wsiew bezpośrednio (DVI) albo rozruch 15 min w 32–34 °C</li>
                        <li>• Ser: Twaróg, Fromage blanc, Gouda, Edam, Cheddar, Colby</li>
                      </ul>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Typowe błędy</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Zbyt chłodne mleko → wolny start; <em>podnieś do 30–31 °C</em></li>
                        <li>• Przedawkowanie → nadmierne obniżenie pH i krucha tekstura</li>
                      </ul>
                    </Card>
                  </div>

                  <h3 id="lcl-cremoris" className="text-xl font-bold mb-3 mt-6">Lactococcus lactis subsp. <em>cremoris</em></h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">aromat (diacetyl)</Badge>
                    <Badge variant="secondary">~30 °C</Badge>
                    <Badge variant="secondary">wrażliwszy na sól/pH</Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Rola</h4>
                      <p className="text-sm text-muted-foreground">Buduje nuty masłowe/śmietankowe, łagodzi profil. Zwykle łączony z <em>lc. lactis</em>; z <em>Leuconostoc</em> daje lekki gaz i słodszy aromat.</p>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Dawka & gdzie</h4>
                      <p className="text-sm text-muted-foreground"><strong>Na 10 L:</strong> 1/16–1/8 łyżeczki (DVI). Edam, Havarti, Tilsit, miękkie.</p>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Błędy</h4>
                      <p className="text-sm text-muted-foreground">Samotnie bywa zbyt wolny; dodaj <em>lc. lactis</em> dla tempa.</p>
                    </Card>
                  </div>
                </Card>
              </section>

              {/* TERMO */}
              <section id="sec-termo">
                <Card className="p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Termofilne LAB (39–45 °C)</h2>

                  <h3 id="st-thermo" className="text-xl font-bold mb-3">Streptococcus thermophilus</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">szybki zakwas</Badge>
                    <Badge variant="secondary">40–45 °C</Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Rola & pH</h4>
                      <p className="text-sm text-muted-foreground">Dynamiczne pH↓ w serach podgrzewanych. Cel: <em>pH 6,4→6,1</em> w 30–60 min; <em>5,8–5,6</em> do formowania.</p>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Dawka & zastos.</h4>
                      <p className="text-sm text-muted-foreground"><strong>Na 10 L:</strong> 1/8–1/4 łyżeczki. Mozzarella, Provolone, Caciocavallo, Gruyère (z innymi).</p>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">W duecie</h4>
                      <p className="text-sm text-muted-foreground">Silna synergia z <em>L. bulgaricus</em> (wzajemna wymiana metabolitów).</p>
                    </Card>
                  </div>

                  <h3 id="lh-helv" className="text-xl font-bold mb-3 mt-6">Lactobacillus helveticus</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">silna proteoliza</Badge>
                    <Badge variant="secondary">42–45 °C</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Rola</h4>
                      <p className="text-sm text-muted-foreground">Wnosi umami, szybsze dojrzewanie, gładką teksturę; klasyk serów szwajcarskich i długo dojrzewających.</p>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Dawka</h4>
                      <p className="text-sm text-muted-foreground"><strong>Na 10 L:</strong> 1/16–1/8 łyżeczki. Zwykle razem z <em>S. thermophilus</em>.</p>
                    </Card>
                  </div>

                  <h3 id="ldb-bulg" className="text-xl font-bold mb-3 mt-6">Lactobacillus delbrueckii ssp. <em>bulgaricus</em></h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">kwaśność + aromat</Badge>
                    <Badge variant="secondary">40–45 °C</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Rola</h4>
                      <p className="text-sm text-muted-foreground">Mocny zakwas i aromaty jogurtowe (aldehydy/ketony). W duecie z <em>Streptococcus thermophilus</em>.</p>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Dawka</h4>
                      <p className="text-sm text-muted-foreground"><strong>Na 10 L:</strong> 1/16–1/8 łyżeczki (DVI). Mozzarella, Caciotta, serki topione bazowo.</p>
                    </Card>
                  </div>
                </Card>
              </section>

              {/* NSLAB */}
              <section id="sec-nslab">
                <Card className="p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">NSLAB i mikroflora wtórna</h2>

                  <h3 className="text-xl font-bold mb-2">Lactobacillus <em>lactis</em> (NSLAB)</h3>
                  <p className="text-muted-foreground mb-6">Pracuje głównie podczas dojrzewania: pogłębia smak przez proteolizę/lipolizę. Cheddar, Grana, Parmesan.</p>

                  <h3 className="text-xl font-bold mb-2">Lactobacillus <em>casei</em></h3>
                  <p className="text-muted-foreground mb-6">Odporny na sól i niskie pH, buduje „pełnię" w serach twardych/półtwardych. Często z <em>L. helveticus</em>.</p>

                  <h3 className="text-xl font-bold mb-3">Propionibacterium <small className="text-sm font-normal">(<em>P. freudenreichii</em> ssp. <em>shermanii</em>, <em>P. acidipropionici</em>)</small></h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">CO₂ → oczka</Badge>
                    <Badge variant="secondary">orzechowy aromat</Badge>
                    <Badge variant="secondary">~30 °C</Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Rola</h4>
                      <p className="text-sm text-muted-foreground">Zużywa kwas mlekowy → wytwarza kwas propionowy, octowy i CO₂ (oczka). Nadaje słodko-orzechowy profil (Emmental, Maasdam, Appenzeller).</p>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Dawka & moment</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <strong>Na 10 L:</strong> szczypta 1/32–1/16 łyżeczki (koncentraty są bardzo „mocne")</li>
                        <li>• Aktywuje się w cieplejszym etapie dojrzewania (po LAB)</li>
                      </ul>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Błędy</h4>
                      <p className="text-sm text-muted-foreground">Zbyt niskie pH i wysoka sól hamują gazowanie; brak ciepłego dojrzewania → brak oczek.</p>
                    </Card>
                  </div>
                </Card>
              </section>

              {/* PLEŚNIE BIAŁE */}
              <section id="sec-white">
                <Card className="p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Pleśnie białe (skórka biała) i mikroflora wspierająca</h2>

                  <h3 id="pc-cand" className="text-xl font-bold mb-3">Penicillium camemberti (syn. <em>Penicillium candidum</em>)</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">skórka biała</Badge>
                    <Badge variant="secondary">proteoliza/lipoliza od powierzchni</Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Rola</h4>
                      <p className="text-sm text-muted-foreground">Dojrzewanie „z zewnątrz do środka"; zmiękcza pastę, nuty pieczarkowo-śmietankowe. Hamuje pleśnie obce konkurencją.</p>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Dawki & aplikacja</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <strong>Do 10 L mleka (DVI):</strong> 1/32–1/16 łyżeczki</li>
                        <li>• <strong>Natrysk skórki:</strong> 1/8 łyżeczki na 250 ml przegot. wody + 1–2 g soli; spryskać po soleniu</li>
                        <li>• Dojrz.: 10–12 °C, RH 92–98%</li>
                      </ul>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Typowe błędy</h4>
                      <p className="text-sm text-muted-foreground">Zbyt wilgotno bez przewietrzania → nadmierny filc i amoniak; za chłodno → wolne zarastanie.</p>
                    </Card>
                  </div>

                  <h3 id="geo" className="text-xl font-bold mb-3 mt-6">Geotrichum candidum</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">„kwiatek"/fałd skórki</Badge>
                    <Badge variant="secondary">odkwaszenie powierzchni</Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Rola</h4>
                      <p className="text-sm text-muted-foreground">„Pionier" skórki białej: konsumuje kwasy, podnosi pH powierzchni i toruje drogę <em>P. camemberti</em>. Redukuje goryczki, daje lekko mleczno-serowy aromat.</p>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Dawki</h4>
                      <p className="text-sm text-muted-foreground"><strong>10 L:</strong> 1/64–1/32 łyżeczki; w roztworze natryskowym razem z <em>P. camemberti</em> w małej dawce.</p>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Gdzie?</h4>
                      <p className="text-sm text-muted-foreground">Camembert, Brie, Coulommiers, Reblochon (z drożdżami i/lub mazem).</p>
                    </Card>
                  </div>
                </Card>
              </section>

              {/* PLEŚNIE NIEBIESKIE */}
              <section id="sec-blue">
                <Card className="p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Pleśnie niebieskie (żyłkowane)</h2>

                  <h3 id="pr-roq" className="text-xl font-bold mb-3">Penicillium roqueforti (oraz <em>P. glaucum</em>)</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">metyloketony (pikantny aromat)</Badge>
                    <Badge variant="secondary">wzrost w kanałach tlenu</Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Rola</h4>
                      <p className="text-sm text-muted-foreground">Tworzy niebieskie żyłkowanie; odpowiada za ostry, pieprzny profil (2-heptanon itd.). Tlen dostarczany przez nakłuwanie bloków po zasoleniu.</p>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Dawki & technika</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <strong>10 L:</strong> 1/64–1/32 łyżeczki (DVI)</li>
                        <li>• Alternatywnie: zaszczep miód-mleko (czysta kultura → starter płynny) i dodaj 1–2% do kadzi</li>
                        <li>• Dojrz.: 8–12 °C, RH wysoka; sól 2,5–3,5% w masie</li>
                      </ul>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Błędy</h4>
                      <p className="text-sm text-muted-foreground">Za mało nakłuć → brak sinienia; zbyt niskie pH + wysoka sól → spowolnienie; zbyt mokro → rozmyty rysunek żył.</p>
                    </Card>
                  </div>
                </Card>
              </section>

              {/* MAZ/SMEAR & DROŻDŻE */}
              <section id="sec-smear">
                <Card className="p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Sery mazowe (washed-rind) i drożdże powierzchniowe</h2>

                  <h3 id="bl-linens" className="text-xl font-bold mb-3">Brevibacterium linens</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">pomarańczowy maz</Badge>
                    <Badge variant="secondary">silny aromat</Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Rola</h4>
                      <p className="text-sm text-muted-foreground">Barwi skórkę na pomarańczowo-czerwono; tworzy intensywny, „piwniczny" aromat. Wymaga wcześniej podniesionego pH skórki (drożdże).</p>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Dawki & aplikacja</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <strong>Roztwór do mycia:</strong> 1/16 łyżeczki na 250 ml przegot. wody + 2–3 % soli; smaruj co 1–3 dni</li>
                        <li>• Temperatura dojrz.: 10–13 °C, RH wysoka; przewietrzanie</li>
                      </ul>
                    </Card>
                    <Card className="p-4 border-2 border-dashed">
                      <h4 className="font-bold mb-2">Przykłady</h4>
                      <p className="text-sm text-muted-foreground">Limburger, Munster, Taleggio, Reblochon (wariant), Epoisses.</p>
                    </Card>
                  </div>

                  <h3 id="deb" className="text-xl font-bold mb-3">Debaryomyces hansenii</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">halotolerancja</Badge>
                    <Badge variant="secondary">pH↑ na skórce</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">Drożdżowy „otwieracz drzwi" dla <em>B. linens</em>; konsumuje kwasy, toleruje sól, stabilizuje ekosystem skórki.</p>

                  <h3 id="klu" className="text-xl font-bold mb-3">Kluyveromyces (np. <em>marxianus</em>, <em>lactis</em>)</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">metabolizm laktozy</Badge>
                    <Badge variant="secondary">estry (nuty owocowe)</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">Wspiera konsumowanie resztkowej laktozy i tworzy lekkie nuty owocowe; pomocny przy skórkach mieszanych.</p>

                  <Card className="bg-primary/5 border-primary/20 p-4">
                    <p className="text-sm"><strong>Prosty plan dla sera mazowego (np. Limburger):</strong> MM/MA → formowanie/solenie → 24–48 h osuszania → mycie roztworem z <em>Debaryomyces</em> → po 2–3 myciach dołącz <em>B. linens</em> → kontynuuj mycia co 2–3 dni.</p>
                  </Card>
                </Card>
              </section>

              {/* ZESTAWIENIA */}
              <section id="sec-blends">
                <Card className="p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Najczęściej stosowane mieszanki kultur</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-secondary">
                          <th className="border border-border p-3 text-left font-bold">Pakiet</th>
                          <th className="border border-border p-3 text-left font-bold">Skład</th>
                          <th className="border border-border p-3 text-left font-bold">Parametry startowe</th>
                          <th className="border border-border p-3 text-left font-bold">pH cele</th>
                          <th className="border border-border p-3 text-left font-bold">Przykładowe sery</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr>
                          <td className="border border-border p-3">Mezofilny podstawowy</td>
                          <td className="border border-border p-3"><em>Lc. lactis ssp. lactis</em> + <em>ssp. cremoris</em> (+ <em>Leuconostoc</em>)</td>
                          <td className="border border-border p-3">30–31 °C; dawka razem 1/4 łyżeczki/10 L</td>
                          <td className="border border-border p-3">6,4→6,0 (90 min); 5,3–5,4 do prasowania</td>
                          <td className="border border-border p-3">Gouda, Edam, Havarti, Tilsit</td>
                        </tr>
                        <tr className="bg-secondary/50">
                          <td className="border border-border p-3">Termofilny włoski</td>
                          <td className="border border-border p-3"><em>S. thermophilus</em> + <em>Lb. bulgaricus</em></td>
                          <td className="border border-border p-3">42–44 °C; 1/4 łyżeczki/10 L (razem)</td>
                          <td className="border border-border p-3">6,5→6,1 (60 min); 5,4–5,5 do formowania</td>
                          <td className="border border-border p-3">Mozzarella, Provolone, Caciotta</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">Szwajcarski (z oczkami)</td>
                          <td className="border border-border p-3"><em>S. thermophilus</em> + <em>Lb. helveticus</em> + <em>Propionibacterium</em></td>
                          <td className="border border-border p-3">42–45 °C; Propio mikro-dawka (1/32–1/16)</td>
                          <td className="border border-border p-3">po prasowaniu 5,3–5,4; ciepłe dojrzewanie 18–22 °C</td>
                          <td className="border border-border p-3">Emmental, Maasdam, Appenzeller</td>
                        </tr>
                        <tr className="bg-secondary/50">
                          <td className="border border-border p-3">Biała skórka</td>
                          <td className="border border-border p-3">MM/MA + <em>Geotrichum</em> + <em>P. camemberti</em></td>
                          <td className="border border-border p-3">30 °C; Gc + Pc wg dawek jak wyżej</td>
                          <td className="border border-border p-3">Po 24 h rdzeń ~4,7–4,9; powierzchnia rośnie do ~6,0 wraz z zarostem</td>
                          <td className="border border-border p-3">Camembert, Brie, Coulommiers</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3">Niebieskie</td>
                          <td className="border border-border p-3">MM/MA + <em>P. roqueforti</em></td>
                          <td className="border border-border p-3">30 °C; PR 1/64–1/32/10 L; nakłuwanie po zasoleniu</td>
                          <td className="border border-border p-3">4,9–5,1 do formowania; podczas zarastania kanałów pH lekko rośnie</td>
                          <td className="border border-border p-3">Roquefort, Gorgonzola, Stilton</td>
                        </tr>
                        <tr className="bg-secondary/50">
                          <td className="border border-border p-3">Mazowe</td>
                          <td className="border border-border p-3">MM/MA → <em>Debaryomyces/Geotrichum</em> → <em>B. linens</em></td>
                          <td className="border border-border p-3">Mycia co 1–3 dni solanką z kulturami</td>
                          <td className="border border-border p-3">Skórka pH 6,5–7,0; rdzeń ~5,2–5,4</td>
                          <td className="border border-border p-3">Limburger, Munster, Taleggio</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <Card className="mt-6 bg-accent/5 border-accent/20 p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Wersja dla początkujących:</strong> trzymaj się dawek minimalnych; zwiększaj o 10–20% tylko gdy pH nie spada w przewidzianym czasie.
                    </p>
                  </Card>
                </Card>
              </section>

              {/* ŚCIĄGA */}
              <section id="sec-cheatsheet">
                <Card className="p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Szybka ściąga (temperatury, dawki orientacyjne, rola)</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-secondary">
                          <th className="border border-border p-3 text-left font-bold">Kultura</th>
                          <th className="border border-border p-3 text-left font-bold">Optimum/warunki</th>
                          <th className="border border-border p-3 text-left font-bold">Dawka (10 L)</th>
                          <th className="border border-border p-3 text-left font-bold">Główna rola</th>
                          <th className="border border-border p-3 text-left font-bold">Przykłady serów</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr><td className="border border-border p-3"><em>Lc. lactis ssp. lactis</em></td><td className="border border-border p-3">~30 °C</td><td className="border border-border p-3">1/8–1/4 łyżeczki</td><td className="border border-border p-3">Szybkie zakwaszanie</td><td className="border border-border p-3">Gouda, Edam, Cheddar</td></tr>
                        <tr className="bg-secondary/50"><td className="border border-border p-3"><em>Lc. lactis ssp. cremoris</em></td><td className="border border-border p-3">~30 °C</td><td className="border border-border p-3">1/16–1/8</td><td className="border border-border p-3">Aromat masłowy</td><td className="border border-border p-3">Edam, Havarti</td></tr>
                        <tr><td className="border border-border p-3"><em>S. thermophilus</em></td><td className="border border-border p-3">40–45 °C</td><td className="border border-border p-3">1/8–1/4</td><td className="border border-border p-3">Zakwas, elastyczność</td><td className="border border-border p-3">Mozzarella, Gruyère*</td></tr>
                        <tr className="bg-secondary/50"><td className="border border-border p-3"><em>Lb. helveticus</em></td><td className="border border-border p-3">42–45 °C</td><td className="border border-border p-3">1/16–1/8</td><td className="border border-border p-3">Proteoliza, umami</td><td className="border border-border p-3">Emmental, Parmesan*</td></tr>
                        <tr><td className="border border-border p-3"><em>Lb. bulgaricus</em></td><td className="border border-border p-3">40–45 °C</td><td className="border border-border p-3">1/16–1/8</td><td className="border border-border p-3">Kwasowość + aromat</td><td className="border border-border p-3">Jogurt, Mozzarella</td></tr>
                        <tr className="bg-secondary/50"><td className="border border-border p-3"><em>Lactobacillus lactis</em> (NSLAB)</td><td className="border border-border p-3">30–37 °C</td><td className="border border-border p-3">—</td><td className="border border-border p-3">Dojrzewanie wtórne</td><td className="border border-border p-3">Cheddar, Grana</td></tr>
                        <tr><td className="border border-border p-3"><em>L. casei</em></td><td className="border border-border p-3">30–37 °C</td><td className="border border-border p-3">—</td><td className="border border-border p-3">Aromat, trwałość</td><td className="border border-border p-3">Cheddar, Gruyère</td></tr>
                        <tr className="bg-secondary/50"><td className="border border-border p-3"><em>Propionibacterium</em></td><td className="border border-border p-3">~30 °C</td><td className="border border-border p-3">1/32–1/16</td><td className="border border-border p-3">CO₂ (oczka), aromat</td><td className="border border-border p-3">Emmental, Maasdam</td></tr>
                        <tr><td className="border border-border p-3"><em>P. camemberti</em></td><td className="border border-border p-3">10–12 °C (dojrz.)</td><td className="border border-border p-3">1/32–1/16</td><td className="border border-border p-3">Skórka biała</td><td className="border border-border p-3">Camembert, Brie</td></tr>
                        <tr className="bg-secondary/50"><td className="border border-border p-3"><em>G. candidum</em></td><td className="border border-border p-3">10–15 °C</td><td className="border border-border p-3">1/64–1/32</td><td className="border border-border p-3">Odkwaszenie skórki</td><td className="border border-border p-3">Brie, Reblochon</td></tr>
                        <tr><td className="border border-border p-3"><em>P. roqueforti/glaucum</em></td><td className="border border-border p-3">8–12 °C</td><td className="border border-border p-3">1/64–1/32</td><td className="border border-border p-3">Żyłkowanie, ostrość</td><td className="border border-border p-3">Roquefort, Gorgonzola</td></tr>
                        <tr className="bg-secondary/50"><td className="border border-border p-3"><em>B. linens</em></td><td className="border border-border p-3">10–13 °C</td><td className="border border-border p-3">— (roztwór myjący)</td><td className="border border-border p-3">Maz, skórka</td><td className="border border-border p-3">Limburger, Taleggio</td></tr>
                        <tr><td className="border border-border p-3"><em>D. hansenii</em></td><td className="border border-border p-3">10–15 °C</td><td className="border border-border p-3">— (roztwór myjący)</td><td className="border border-border p-3">pH↑ skórki</td><td className="border border-border p-3">Mazowe, białe</td></tr>
                        <tr className="bg-secondary/50"><td className="border border-border p-3"><em>Kluyveromyces</em> spp.</td><td className="border border-border p-3">15–30 °C</td><td className="border border-border p-3">—</td><td className="border border-border p-3">Metabolizm laktozy</td><td className="border border-border p-3">Skórki mieszane</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-sm text-muted-foreground mt-4">
                    *zwykle w mieszance, patrz tabela „Mieszanki". Dawki są orientacyjne dla kultur DVI; zawsze weryfikuj z kartą produktu producenta.
                  </p>
                </Card>
              </section>

              {/* ŹRÓDŁA */}
              <section>
                <Card className="p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">Źródła i wskazówki praktyczne</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Przeglądy praktyczne producentów kultur i serowarskich blogów (dobre dla zakresów dawek i warunków)</li>
                    <li>• Dla kontroli: notuj temperatury i pH w czasie (30/60/120 min); łatwiej skalibrować dawki na Twoje mleko i warunki</li>
                    <li>• Higiena: sterylne łyżeczki, woda przegotowana/chłodna do roztworów; przechowywanie liofilizatów w zamrażarce (suche)</li>
                  </ul>
                </Card>
              </section>

              {/* Footer Note */}
              <Card className="p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground text-center">
                  Opracowanie: wersja 31 paź 2025 • Dla mojaserowarnia.pl
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* FAQ — pod frazy „jak/którą" (spójne z FAQSchema) */}
        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">Najczęściej zadawane pytania o kultury</h2>
            <div className="space-y-5">
              {faqData.map((f, i) => (
                <div key={i}>
                  <h3 className="text-lg font-semibold mb-2">{f.question}</h3>
                  <p className="text-muted-foreground">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BakterieKultury;
