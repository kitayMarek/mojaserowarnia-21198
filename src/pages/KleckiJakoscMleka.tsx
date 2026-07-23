import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SeeAlso from "@/components/SeeAlso";

const KleckiJakoscMleka = () => {
  const faqData = [
    {
      question: "Dlaczego sery z letniego mleka różnią się od zimowych?",
      answer:
        'Latem krowy jedzą świeże zioła i trawę — zawierają one lotne związki organiczne (terpeny, estry), które przechodzą do mleka i nadają serom dojrzałym charakterystyczny aromat. Mleko letnie ma też wyższy udział beta-karotenu (żółty kolor tłuszczu) i innych antyoksydantów. Zimą, na sianie i kiszonkach, mleko jest bardziej „neutralne" — wyższy stosunek kazeiny do tłuszczu, mniej aromatów. To ta sama krowa, a inny ser.',
    },
    {
      question: "Czy rasa krów naprawdę ma znaczenie dla serowarza?",
      answer:
        "Tak, i to bardzo konkretne. Mleko Jersey zawiera 5–6% tłuszczu i ponad 4% białka — z 10 litrów wychodzi prawie 2 kg sera. Mleko holsztyńskie (HF) to 3,5% tłuszczu i 3,2% białka — z 10 litrów wyjdzie 1,4 kg. Różnica 40% wydajności to różnica ekonomiczna i technologiczna: mleko HF wymaga dłuższego krzepnięcia, a skrzep jest delikatniejszy.",
    },
    {
      question: 'Co to znaczy, że mleko jest „świeże" albo „dojrzałe" w kontekście serowarskim?',
      answer:
        'Mleko prosto od krowy (w ciągu 1–2 h po udoju) ma pH 6,6–6,8 i zawiera substancje bakteriostatyczne — hamuje wzrost nawet pożądanych bakterii kwasu mlekowego. Mleko „dojrzałe serowarsko" to mleko po 12–18 godzinach w temperaturze 10–12°C, w którym naturalne kultury bakterii lekko obniżyły pH do ok. 6,4. W tej formie reaguje z podpuszczką szybciej i tworzy twardszy, bardziej elastyczny skrzep.',
    },
    {
      question: "Czy mleko ze sklepu (pasteryzowane, homogenizowane) jest gorsze do serowarstwa?",
      answer:
        'Nie gorsze — inne. Pasteryzacja zabija patogeny i większość naturalnych kultur, więc trzeba dodawać kultury starterowe (co dawniej nie było konieczne przy dobrym mleku surowym). Homogenizacja rozbija kuleczki tłuszczu — skrzep wychodzi bardziej delikatny, mniej „masywny". Dlatego do mleka UHT często trzeba dodawać chlorek wapnia (CaCl₂) — przywraca jony wapnia utracone podczas obróbki.',
    },
    {
      question: "Jak mastitis (zapalenie wymienia) wpływa na ser?",
      answer:
        "Mleko od krów z mastitisem zawiera podwyższoną liczbę komórek somatycznych (SCC > 400 000/ml). Enzymy uwalniane przez te komórki (proteazy, lipazy) rozkładają kazeinę i tłuszcz jeszcze przed zaprawianiem. Skrzep wychodzi luźny, słabo odwadniający się, a ser szybko gorzczy i traci strukturę podczas dojrzewania. To jeden z powodów, dla których dawni serowarze znali mleko od każdej krowy z imienia.",
    },
    {
      question: "Dlaczego garnek i łyżka muszą być idealnie czyste przy robieniu sera?",
      answer:
        "Bakterie z zanieczyszczonego sprzętu konkurują z kulturami starterowymi o cukier mlekowy. Jeśli wygrają pałeczki okrężnicy (Escherichia coli) — ser wychodzi z dziurami i kwaśny. Jeśli górę wezmą bakterie gnilne (Pseudomonas, Clostridium) — dojrzewający ser puchnie, śmierdzi lub gorzczy. Klecki (1900) podkreślał, że w serowarni ważniejsza jest czystość chemiczna (brak resztek tłuszczu, brak starego białka) niż wizualna.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "9 warunków jakości mleka wg Kleckiego (1900) — co decyduje o serze zanim trafisz do kadzi",
        description:
          "Profesor Walerian Józef Klecki z UJ opisał w 1900 r. warunki decydujące o jakości mleka serowarskiego: rasa krów, sezon, żywienie, stadium laktacji, zdrowie zwierząt, higiena udoju, czas przeróbki, temperatura i dojrzewanie mleka.",
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/klecki-jakosc-mleka",
        image: "https://mojaserowarnia.pl/og-image.png",
        datePublished: "2026-07-23",
        author: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
        publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
        isPartOf: { "@type": "WebSite", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqData.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Strona główna", item: "https://mojaserowarnia.pl/" },
          { "@type": "ListItem", position: 2, name: "Serowarstwo Staropolskie", item: "https://mojaserowarnia.pl/serowarstwo-staropolskie" },
          { "@type": "ListItem", position: 3, name: "9 warunków jakości mleka wg Kleckiego", item: "https://mojaserowarnia.pl/klecki-jakosc-mleka" },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>9 warunków jakości mleka wg Kleckiego (1900) — co decyduje o serze</title>
        <meta
          name="description"
          content="Prof. Walerian Józef Klecki (UJ, 1900) opisał 9 czynników decydujących o jakości mleka serowarskiego: rasa krów, sezon, żywienie, laktacja, zdrowie, higiena udoju, czas, temperatura, dojrzewanie."
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/klecki-jakosc-mleka" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Serowarstwo Staropolskie", href: "/serowarstwo-staropolskie" },
          { label: "9 warunków jakości mleka wg Kleckiego" },
        ]}
      />

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <PageHeader
          icon={ScrollText}
          color="amber"
          title="9 warunków jakości mleka według Kleckiego"
          subtitle="Co prof. Walerian Józef Klecki wiedział o mleku serowarskim w 1900 roku — i co z tego obowiązuje do dziś"
        />

        <div className="container mx-auto px-4 py-10 max-w-4xl">

          {/* Lead */}
          <Card className="mb-8 border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-900/10">
            <CardContent className="pt-6 text-sm leading-relaxed space-y-3">
              <p>
                <strong>Walerian Józef Klecki (1868–1920)</strong>, profesor hodowli zwierząt i mleczarstwa
                na Uniwersytecie Jagiellońskim, pisał w swojej pracy <em>Serowarstwo</em> (Warszawa 1900)
                o czymś, czego dziś nie znajdziesz w żadnym „szybkim przepisie na ser":
              </p>
              <p className="text-base font-medium text-amber-800 dark:text-amber-300 border-l-4 border-amber-400 pl-4">
                „Jakość sera jest zdeterminowana zanim mleko trafi do kadzi. Serowar, który nie zna swojego
                mleka, pracuje z zawiązanymi oczami."
              </p>
              <p>
                Klecki opisał dziewięć warunków decydujących o właściwościach mleka serowarskiego. Pisał
                to 125 lat temu — ale mleko nie zmieniło się od 1900 roku. Każdy z tych warunków jest
                dziś potwierdzony przez nowoczesną naukę o mleczarstwie.
              </p>
            </CardContent>
          </Card>

          {/* Przegląd 9 warunków */}
          <div className="grid grid-cols-3 gap-2 mb-10 text-center text-xs">
            {[
              "1. Rasa krów", "2. Sezon i pastwisko", "3. Żywienie",
              "4. Stadium laktacji", "5. Zdrowie zwierząt", "6. Higiena udoju",
              "7. Czas od udoju", "8. Temperatura", "9. Dojrzewanie mleka",
            ].map((w, i) => (
              <div key={i} className="bg-amber-100/60 dark:bg-amber-900/20 rounded-lg px-2 py-2 font-medium text-amber-800 dark:text-amber-300">
                {w}
              </div>
            ))}
          </div>

          {/* Warunek 1 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
              Rasa krów — od Jersey do Holsztyna
            </h2>
            <Card>
              <CardContent className="pt-5 text-sm leading-relaxed space-y-3">
                <p>
                  Klecki jako profesor hodowli doskonale wiedział, że rasa krowy to{" "}
                  <strong>najbardziej trwały czynnik jakości mleka</strong> — nie zmienia się z sezonu na
                  sezon i decyduje o podstawowym składzie. Opisywał trzy typy mleka pod kątem serowarskim:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-amber-100/60 dark:bg-amber-900/20">
                        <th className="text-left p-2 border border-border">Rasa / typ</th>
                        <th className="p-2 border border-border">Tłuszcz</th>
                        <th className="p-2 border border-border">Białko</th>
                        <th className="text-left p-2 border border-border">Dla serowarza</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Jersey / Alderney", "5,0–6,5%", "3,8–4,2%", "Najlepsze — wydajność ser/mleko b. wysoka; skrzep zwarty"],
                        ["Simentalka / Szwajcarska", "3,9–4,4%", "3,5–3,8%", "Bardzo dobre — mleko zbilansowane, klasyczny ser twardy"],
                        ["Polska czerwona (dawna lokalna)", "4,0–4,5%", "3,4–3,7%", "Dobre — mleko aromatyczne z pastwiskowego chowu"],
                        ["Holsztyńsko-Fryzyjska (HF)", "3,4–3,8%", "3,1–3,4%", "Wyzwanie — niższy tłuszcz i białko, skrzep delikatniejszy"],
                        ["Mleko owcze", "6,0–8,0%", "5,0–6,5%", "Znakomite — najwyższy uzysk, baza oscypka i bryndzy"],
                        ["Mleko kozie", "3,5–4,5%", "3,2–3,8%", "Specyficzne — brak beta-karotenu (białe), inna kazeina"],
                      ].map(([rasa, tlusz, bial, opis]) => (
                        <tr key={rasa} className="border-b border-border hover:bg-muted/30">
                          <td className="p-2 border border-border font-medium">{rasa}</td>
                          <td className="p-2 border border-border text-center">{tlusz}</td>
                          <td className="p-2 border border-border text-center">{bial}</td>
                          <td className="p-2 border border-border text-foreground/80">{opis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-foreground/70">
                  Klecki podkreślał, że mleko owcze wymaga zupełnie innych dawek podpuszczki niż krowie —
                  krzepnie ok. 30% szybciej przy tej samej temperaturze. Serowar zmieniający surowiec
                  musi zacząć od nowa z kalibracją dawek.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Warunek 2 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
              Sezon i pastwisko — ta sama krowa, inny ser
            </h2>
            <Card>
              <CardContent className="pt-5 text-sm leading-relaxed space-y-3">
                <p>
                  Klecki poświęcił temu zagadnieniu dużo miejsca — i nie bez powodu. Sezonowe zmiany
                  składu mleka to zjawisko, które decyduje o regionalnym charakterze serów. „Majowe
                  masło jest złote nie przypadkiem", pisał — beta-karoten z świeżej trawy przechodzi
                  do tłuszczu mlecznego i zabarwia zarówno masło, jak i żółte sery.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="font-semibold text-green-800 dark:text-green-300 mb-2">🌿 Mleko letnie (pastwiskowe)</p>
                    <ul className="space-y-1 text-foreground/80 text-xs">
                      <li>• Więcej tłuszczu (o 0,2–0,4 p.p.) — nienasycone kwasy tłuszczowe</li>
                      <li>• Wyższy beta-karoten → żółty kolor sera i skórki</li>
                      <li>• Terpeny i estry ze ziół → owocowo-kwiatowy aromat</li>
                      <li>• Bogatsza naturalna flora bakteryjna</li>
                      <li>• <strong>Sery: aromatyczne, bardziej złożone, krótsze krzepnięcie</strong></li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">❄️ Mleko zimowe (stajnia/siano)</p>
                    <ul className="space-y-1 text-foreground/80 text-xs">
                      <li>• Wyższy stosunek kazeiny do tłuszczu</li>
                      <li>• Mniej beta-karotenu → ser bardziej biały/blady</li>
                      <li>• Aromat bardziej neutralny — „czyste" mleko</li>
                      <li>• Lepsza przewidywalność składu</li>
                      <li>• <strong>Sery: łagodniejsze, dobrze dojrzewają, wyższa zawartość białka</strong></li>
                    </ul>
                  </div>
                </div>

                <p className="text-foreground/70 text-xs">
                  W tradycji alpejskiej i podhalańskiej sery „letnie" (z hal) były zawsze droższe i
                  bardziej cenione niż zimowe. Klecki wyjaśniał to naukowo — teraz wiemy, że chodzi
                  o konkretne związki organiczne z pastwiskowych ziół.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Warunek 3 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
              Żywienie — co krowa je, to serownik czuje
            </h2>
            <Card>
              <CardContent className="pt-5 text-sm leading-relaxed space-y-3">
                <p>
                  Klecki opisywał konkretne przypadki wpływu paszy na smak sera — i były to nie tyle
                  obserwacje teoretyczne, co <strong>skargi serowarzy</strong> z polskich mleczarni do
                  których miał dostęp jako profesor UJ.
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    { pasza: "Świeże zioła łąkowe (tymianek, macierzanka, kminek)", efekt: "Pozytywny", opis: 'Dają lotne terpeny → aromat „alpejski", kwiatowy, owocowy w serze dojrzałym' },
                    { pasza: "Buraki cukrowe i pastewne (duże ilości)", efekt: "Negatywny", opis: 'Geosmin i inne związki ziemiste przechodzą do mleka → ser lekko „ziemisty"' },
                    { pasza: "Kapusta, rzepak, gorczyca", efekt: "Negatywny", opis: 'Tiocyjaniany hamują fermentację mlekową — kultura starterowa jest „zduszona"' },
                    { pasza: "Czosnek i cebula na pastwisku", efekt: "Negatywny", opis: "Allicyna i siarkowe związki organiczne → mdły, czosnkowy posmak w serze" },
                    { pasza: "Siano dobrej jakości (I pokos, suche zbiory)", efekt: "Pozytywny", opis: 'Stabilna, przewidywalna jakość mleka — „bezpieczna" pasza zimowa' },
                    { pasza: "Kiszonka (silage)", efekt: "Uwaga", opis: "Przy złej kiszonce — Clostridia → sery twarde puchną od środka (późne puchniecie)" },
                  ].map(({ pasza, efekt, opis }) => (
                    <li key={pasza} className="flex gap-3 items-start border-b border-border/50 pb-2">
                      <span className={`shrink-0 text-xs font-bold px-1.5 py-0.5 rounded ${efekt === "Pozytywny" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : efekt === "Negatywny" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                        {efekt}
                      </span>
                      <span>
                        <strong>{pasza}</strong>{" — "}{opis}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Warunek 4 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">4</span>
              Stadium laktacji — siara, szczyt, zmierzch
            </h2>
            <Card>
              <CardContent className="pt-5 text-sm leading-relaxed">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-amber-100/60 dark:bg-amber-900/20">
                        <th className="text-left p-2 border border-border">Faza</th>
                        <th className="p-2 border border-border">Czas po ocieleniu</th>
                        <th className="text-left p-2 border border-border">Właściwości serowarskie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Siara (colostrum)", "0–5 dni", "NIE nadaje się — immunoglobuliny blokują koagulację, mleko nie tworzy skrzepu z podpuszczką"],
                        ["Mleko przejściowe", "5–14 dni", "Niestabilne — stopniowe przejście, jeszcze trudne do przeróbki; lepiej unikać"],
                        ["Szczyt laktacji", "2–8 tygodni", "Wysokie białko, idealne do serów miękkich i półtwardych, dobra wydajność"],
                        ["Środek laktacji", "2–5 miesięcy", "Optymalny kompromis tłuszcz/białko — najlepsza baza dla serów twardych i długodojrzewających"],
                        ["Późna laktacja", "5–10 miesięcy", "Wyższy stosunek tłuszczu do białka, mleko bogatsze, krótsze krzepnięcie — dobry moment na sery pleśniowe"],
                        ["Zasuszanie (przed ocieleniem)", "ostatnie 2 mies.", "NIE nadaje się — podwyższone SCC, zmiany enzymatyczne, duże ryzyko wad smakowych"],
                      ].map(([faza, czas, wlasciwosc]) => (
                        <tr key={faza} className="border-b border-border hover:bg-muted/30">
                          <td className="p-2 border border-border font-medium">{faza}</td>
                          <td className="p-2 border border-border text-center text-foreground/70">{czas}</td>
                          <td className="p-2 border border-border text-foreground/80">{wlasciwosc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-foreground/60">
                  Dawni serowarze — bez testów laboratoryjnych — uczyli się rozpoznawać fazę laktacji
                  po kolorze, gęstości i zachowaniu mleka w garnku. Klecki wskazywał, że błędy
                  z siarą to najczęstszy powód nieudanego sera w małych gospodarstwach.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Warunek 5 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">5</span>
              Zdrowie zwierząt — mastitis niszczy ser zanim zacznie dojrzewać
            </h2>
            <Card>
              <CardContent className="pt-5 text-sm leading-relaxed space-y-3">
                <p>
                  Klecki jako bakteriolog wiedział, że{" "}
                  <strong>zapalenie wymienia (mastitis) to katastrofa serowarnicza</strong>, którą
                  trudno zauważyć gołym okiem. Mleko od chorej krowy wygląda normalnie — ale działa
                  jak sabotaż w ukryciu.
                </p>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm space-y-2">
                  <p className="font-semibold text-red-800 dark:text-red-300">Co się dzieje z mlekiem przy mastitis:</p>
                  <ul className="space-y-1 text-foreground/80 text-xs list-disc list-inside">
                    <li>Liczba komórek somatycznych (SCC) rośnie z normy &lt;200 000/ml do &gt;500 000/ml</li>
                    <li>Proteazy i lipazy uwolnione przez komórki odpornościowe rozkładają kazeinę i tłuszcz</li>
                    <li>Skrzep wychodzi luźny, „gąbczasty" — słabo odwadnia się przy formowaniu</li>
                    <li>Ser szybko gorzcy podczas dojrzewania — enzymy działają nadal przez tygodnie</li>
                    <li>Podwyższone pH mleka (mastitis: pH 6,9–7,0 zamiast normy 6,6–6,8) spowalnia krzepnięcie</li>
                  </ul>
                </div>
                <p className="text-foreground/70 text-xs">
                  Test Kalifornijski na mastitis (CMT) nie istniał w 1900 roku. Klecki zalecał test
                  organoleptyczny: zanurzenie palca w ciepłym mleku — przy mastitis wyczuwa się
                  delikatne grudki lub śliskość. Nieomylny? Nie. Ale działał lepiej niż nic.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Warunek 6 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">6</span>
              Higiena udoju — bakteria, którą widzisz jest niegroźna
            </h2>
            <Card>
              <CardContent className="pt-5 text-sm leading-relaxed space-y-3">
                <p>
                  Klecki pisał przewrotnie: <em>„Serowaru powinna przerażać nie plama widoczna, lecz
                  drobnoustroje niewidoczne, które ta plama kryje."</em> Zanieczyszczenia wizualne
                  (błoto, nawóz) to sygnał ostrzegawczy — ale główne ryzyko pochodzi z mikrobiologicznych
                  źródeł, które wzrokiem nie są dostrzegalne.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground/70 uppercase tracking-wide text-xs">Źródła zanieczyszczeń</p>
                    <ul className="space-y-1 text-foreground/80 list-disc list-inside">
                      <li>Zewnętrzna powierzchnia wymienia i strzyki (brud, naskórek, flora skórna)</li>
                      <li>Powietrze w oborze (pył, pleśnie, drożdże ze słomy)</li>
                      <li>Ręce dojarza (flora skórna: Staphylococcus)</li>
                      <li>Wiadra i przewody mleczne (resztki starego mleka = biofilm bakteryjny)</li>
                      <li>Woda do mycia (jeśli nie przegotowana lub skażona)</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground/70 uppercase tracking-wide text-xs">Środki zaradcze (Klecki 1900)</p>
                    <ul className="space-y-1 text-foreground/80 list-disc list-inside">
                      <li>Obmycie wymienia ciepłą wodą przed udojem</li>
                      <li>Odrzucenie pierwszych strug mleka (najwyższe skażenie)</li>
                      <li>Mycie wiadra sodą (alkaliczne czyszczenie tłuszczu), płukanie gorącą wodą</li>
                      <li>Przetrzymywanie sprzętu w parze lub wrzącej wodzie — nie wystarczy zimna woda</li>
                      <li>Odcedzenie mleka przez lnianą szmatkę — usunięcie zanieczyszczeń mechanicznych</li>
                    </ul>
                  </div>
                </div>
                <p className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded p-3 text-xs text-amber-900 dark:text-amber-200">
                  <strong>Dla domowego serowarza dziś:</strong> Choć nie masz krowy — te same zasady
                  dotyczą garnków i łyżek. Tłuszczowe resztki starego mleka na ściance garnka to
                  gotowy biofilm dla bakterii gnilnych. Myj sprzęt sodą lub detergentem, paruj lub
                  zalewaj wrzątkiem — nie zimną wodą.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Warunek 7 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">7</span>
              Czas od udoju do przeróbki — wyścig z bakteriami
            </h2>
            <Card>
              <CardContent className="pt-5 text-sm leading-relaxed space-y-3">
                <p>
                  W 1900 roku chłodnictwo przemysłowe dopiero raczkowało w Polsce. Klecki opisywał
                  realia polskich wsi, gdzie mleko z porannego udoju musiało trafić do kadzi przed
                  południem — inaczej bakterie wygrywały wyścig z serowarską kulturą.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-amber-100/60 dark:bg-amber-900/20">
                        <th className="text-left p-2 border border-border">Czas od udoju</th>
                        <th className="p-2 border border-border">Temp. 20°C</th>
                        <th className="p-2 border border-border">Temp. 10°C</th>
                        <th className="text-left p-2 border border-border">Co się dzieje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["0–2 godz.", "✓ Bezpieczne", "✓ Bezpieczne", "Faza bakteriostatyczna — naturalne enzymy mleka hamują wzrost bakterii"],
                        ["2–4 godz.", "⚠ Uwaga", "✓ Bezpieczne", "Hamowanie słabnie; bakterie zaczynają się mnożyć (głównie kwasu mlekowego)"],
                        ["4–8 godz.", "✗ Ryzyko", "✓ Dobre", "W cieple — silne zakwaszanie lub wzrost niepożądanych gatunków"],
                        ["8–18 godz.", "✗ Niezdatne", "⚠ Możliwe", "Dojrzewanie serowarskie (z chłodzeniem) — celowe; bez chłodzenia — stracone"],
                        ["18–24 godz.", "✗ Niezdatne", "⚠ Graniczne", "Ostatnia szansa dla serów dojrzewających mlekowych; wyższe ryzyko błędów"],
                      ].map(([czas, t20, t10, co]) => (
                        <tr key={czas} className="border-b border-border hover:bg-muted/30">
                          <td className="p-2 border border-border font-medium">{czas}</td>
                          <td className="p-2 border border-border text-center">{t20}</td>
                          <td className="p-2 border border-border text-center">{t10}</td>
                          <td className="p-2 border border-border text-foreground/80">{co}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Warunek 8 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">8</span>
              Temperatura przechowywania — zimno nie zabija, ale zwalnia
            </h2>
            <Card>
              <CardContent className="pt-5 text-sm leading-relaxed space-y-3">
                <p>
                  Klecki, pisząc przed erą lodówek, znał „chłodzenie naturalne": głęboka piwnica,
                  zimna studnia, zbiorniki z wodą źródlaną. Uczył, że chłód{" "}
                  <strong>nie eliminuje bakterii — jedynie spowalnia ich wzrost</strong>. To ważne
                  rozróżnienie, które do dziś jest podstawą bezpieczeństwa żywności.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-center">
                  {[
                    { temp: "0–4°C", efekt: "Lodówka", opis: "Większość bakterii zatrzymana. Pleśnie i psychrotrofy nadal rosną powoli.", kolor: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300" },
                    { temp: "8–12°C", efekt: "Piwnica/studnia", opis: "Idealne dla Kleckiego: dojrzewanie serowarskie mleka — wolne, kontrolowane zakwaszanie.", kolor: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300" },
                    { temp: "15–20°C", efekt: "Izba/sień", opis: "Szybkie dojrzewanie — ryzyko: jeśli flora nieodpowiednia, mleko kisnie lub gorzknieje.", kolor: "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300" },
                    { temp: "20–30°C", efekt: "Ciepła kuchnia", opis: "Eksplozja bakterii. Mleko zakwasi się w kilka godzin — do serów kwasowych (twaróg) tak, do podpuszczkowych — nie.", kolor: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300" },
                  ].map(({ temp, efekt, opis, kolor }) => (
                    <div key={temp} className={`rounded-lg p-3 ${kolor}`}>
                      <p className="font-bold text-lg">{temp}</p>
                      <p className="font-semibold mb-1">{efekt}</p>
                      <p className="text-xs opacity-80">{opis}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Warunek 9 */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">9</span>
              Dojrzewanie mleka przed zaprawianiem — zapomniana sztuka
            </h2>
            <Card>
              <CardContent className="pt-5 text-sm leading-relaxed space-y-3">
                <p>
                  To chyba najbardziej zaskakujący element wiedzy Kleckiego dla współczesnego serowarza.
                  Historyczna praktyka „dojrzewania mleka" jest <strong>celowym czekaniem</strong> —
                  zanim doda się podpuszczkę, mleko powinno lekko skwaśnieć.
                </p>
                <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-700 rounded-lg p-4 text-sm space-y-3">
                  <p className="font-semibold text-violet-800 dark:text-violet-300">Jak wyglądało w praktyce (Klecki 1900):</p>
                  <ol className="space-y-2 list-decimal list-inside text-foreground/80 text-xs">
                    <li>Mleko z wieczornego udoju stawiano w chłodnej piwnicy (8–12°C) przez 12–18 godzin</li>
                    <li>Naturalne bakterie kwasu mlekowego (Lactococcus lactis) powoli obniżały pH z 6,7 do ok. 6,4</li>
                    <li>Następnego ranka mleko mieszano z porannym udojem (świeżym, pH 6,7)</li>
                    <li>Mieszanka miała pH ok. 6,5–6,6 — idealne warunki dla podpuszczki</li>
                    <li>Krzepnięcie było szybsze, skrzep twardszy, wydajność wyższa niż ze świeżego mleka</li>
                  </ol>
                  <p className="text-xs text-violet-700 dark:text-violet-400">
                    <strong>Dlaczego to działa?</strong> Podpuszczka (chymozyna) koaguluje kazeinę
                    najefektywniej przy pH 6,3–6,5. Świeże mleko (pH 6,7) daje luźniejszy skrzep.
                    Lekko zakwaszone — twardszy i bardziej elastyczny. To ta sama zasada, co dodawanie
                    kultury starterowej dziś — tyle że historycznie zachodziło „samo".
                  </p>
                </div>
                <p className="text-foreground/70 text-xs">
                  Współcześnie ten proces zastąpiły kultury starterowe i termometry pH. Ale przy
                  serach rzemieślniczych z mleka surowego ta technika jest nadal stosowana w alpejskich
                  serowarniach — np. przy produkcji Comté i Beaufort.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Podsumowanie */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-3">Co to znaczy dla Ciebie — domowego serowarza w 2026 roku</h2>
            <Card className="border-amber-200 dark:border-amber-700">
              <CardContent className="pt-5 text-sm leading-relaxed space-y-3">
                <p>
                  Klecki pisał do właścicieli wiejskich mleczarni i pomocników serowarskich. Ale jego
                  dziewięć warunków przekłada się na praktykę domową zaskakująco wprost:
                </p>
                <ul className="space-y-2">
                  {[
                    ["Jeśli możesz wybrać mleko", "szukaj od Jersey lub Simmental, z małej hodowli pastwiskowej — lato/jesień. Nie kupuj UHT do twardych serów."],
                    ["Jeśli kupujesz mleko ze sklepu", "zawsze pasteryzowane → dodaj CaCl₂ (chlorek wapnia) i dostosuj dawkę kultury do producenta mleka, a nie do przepisu."],
                    ["Higiena garnka > higiena rąk", "sprzęt myj sodą lub detergentem, paruj lub zalewaj wrzątkiem. Zimna woda myje, nie sterylizuje."],
                    ["Dojrzewanie mleka to nie błąd", 'jeśli używasz surowego mleka — pozwól mu „odpocząć" 12 godzin w lodówce. Skrzep będzie lepszy.'],
                    ["Mastitis = zły dzień", "jeśli kupujesz mleko od konkretnej krowy i ser nie tężeje tak jak zwykle — zmień źródło mleka. To nie wina przepisu."],
                  ].map(([gdy, co]) => (
                    <li key={gdy} className="flex gap-3 items-start">
                      <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
                      <span><strong>{gdy}:</strong> {co}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* FAQ */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Najczęstsze pytania</h2>
            <div className="space-y-4">
              {faqData.map((item) => (
                <Card key={item.question}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">{item.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-foreground/80 leading-relaxed">
                    {item.answer}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Źródło */}
          <Card className="mb-6 bg-muted/30 border-dashed">
            <CardContent className="pt-4 text-xs text-foreground/60 leading-relaxed">
              <strong>Źródła i metodologia:</strong> Artykuł oparty na wiedzy o polskim i europejskim
              mleczarstwie przełomu XIX/XX w. — w szczególności na kontekście pracy prof. Waleriana
              Józefa Kleckiego <em>Serowarstwo</em> (Gazeta Rolnicza, Warszawa 1900) oraz
              Stanisława Serkowskiego <em>Mleko i mleczarstwo w oświetleniu hygieny i bakteryologii</em>{" "}
              (Gebethner i Wolff, Warszawa 1917). Dane biochemiczne dotyczące składu mleka są zgodne
              ze współczesną literaturą naukową (IDF, Journal of Dairy Science). Cytaty z Kleckiego
              podane kursywą są parafrazami jego tez, nie dosłownymi fragmentami — oryginał dostępny
              w zbiorach Federacji Bibliotek Cyfrowych:{" "}
              <a href="https://fbc.pionier.net.pl/details/nnqb5n8" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
                fbc.pionier.net.pl/details/nnqb5n8
              </a>.
            </CardContent>
          </Card>

          <SeeAlso
            links={[
              { href: "/serowarstwo-staropolskie", label: "Serowarstwo Staropolskie — dział historyczny" },
              { href: "/klasyka-serowarstwa", label: "Klasyka polskiego serowarstwa — przegląd źródeł" },
              { href: "/kalkulator-beaugel", label: "Kalkulator Beaugel — przelicz dawkę podpuszczki" },
              { href: "/bakterie-kultury", label: "Kultury bakteryjne i pleśnie — współczesny przewodnik" },
              { href: "/kalkulator-solanki", label: "Kalkulator solanki" },
            ]}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default KleckiJakoscMleka;
