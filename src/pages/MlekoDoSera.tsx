import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Milk } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ReactionButton from "@/components/ReactionButton";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import SekcjaFAQ from "@/components/SekcjaFAQ";
import { Link } from "react-router-dom";

const MlekoDoSera = () => {
  const faqData = [
    {
      question: "Ile sera wychodzi z litra mleka?",
      answer:
        "Zależy od typu sera i składu mleka. Orientacyjnie z 10 litrów mleka krowiego otrzymasz: twaróg 1,5–1,8 kg, mozzarellę 1,2–1,3 kg, camembert ok. 1,2 kg, goudę i cheddar ok. 1,0 kg, ementaler 0,8–0,9 kg, a parmezan tylko 0,6–0,7 kg. Im twardszy i dłużej dojrzewający ser, tym więcej mleka potrzeba, bo ser traci wodę. Do tego z serwatki można jeszcze wyciągnąć 200–400 g ricotty z każdych 10 litrów.",
    },
    {
      question: "Co w mleku decyduje o wydajności sera?",
      answer:
        "Przede wszystkim kazeina i tłuszcz, a nie samo białko ogólne. Kazeina stanowi około 78–80% białka mleka i to ona tworzy skrzep — białka serwatkowe uciekają z serwatką. Dlatego mleko o białku 3,5% i wysokim udziale kazeiny da więcej sera niż mleko o tym samym białku, ale gorszym profilu. Klasyczny wzór Van Slyke'a szacuje wydajność jako funkcję zawartości tłuszczu i kazeiny — w praktyce podniesienie tłuszczu o 0,1 punktu procentowego daje mniej więcej 1,5–2% więcej sera.",
    },
    {
      question: "Mleko od jakiej rasy krów jest najlepsze na ser?",
      answer:
        "Pod względem wydajności serowarskiej najlepsze jest mleko Jersey: ma około 4,8–5,5% tłuszczu i 3,7–4,0% białka, więc daje nawet 20–25% więcej sera z litra niż mleko holsztyńsko-fryzyjskie (ok. 4,0% tłuszczu i 3,2–3,4% białka). Holsztyny dają jednak znacznie więcej mleka, więc w przeliczeniu na krowę różnica się zaciera. Znaczenie ma też wariant genetyczny kappa-kazeiny: wariant B daje zwięźlejszy skrzep, krótszy czas krzepnięcia i wyższą wydajność niż wariant A.",
    },
    {
      question: "Jak żywienie krów wpływa na skład mleka?",
      answer:
        "Najsilniej na zawartość tłuszczu wpływa struktura dawki: pasze objętościowe i włókno strukturalne podnoszą tłuszcz, a nadmiar pasz treściwych i zbyt drobne rozdrobnienie prowadzą do kwasicy żwacza i spadku tłuszczu, czasem poniżej 3%. Na białko mleka silniej działa podaż energii niż samego białka w dawce — niedobór energii obniża białko mleka. Nadmiar białka w dawce nie podnosi białka mleka, za to podnosi mocznik w mleku i obciąża wątrobę.",
    },
    {
      question: "Czy mleko z późnej laktacji nadaje się na ser?",
      answer:
        "Nadaje się gorzej i przy serach dojrzewających lepiej je pominąć. W ostatnich tygodniach przed zasuszeniem rośnie liczba komórek somatycznych i pH mleka, zmienia się profil kazeiny, a aktywna plazmina zaczyna rozkładać białko. Efekt: dłuższy czas krzepnięcia, słabszy i bardziej miękki skrzep, niższa wydajność oraz ryzyko goryczy w dojrzewającym serze. Mleko z siary i pierwszych dni po wycieleniu nie nadaje się do serowarstwa w ogóle.",
    },
    {
      question: "Jaki jest typowy skład mleka krowiego?",
      answer:
        "Woda około 87,5%, tłuszcz 3,5–4,5%, białko ogólne 3,2–3,5% (z czego kazeina 2,5–2,8%), laktoza 4,6–4,9% i składniki mineralne około 0,7%. Sucha masa to zatem około 12,5%, a sucha masa beztłuszczowa 8,5–9,0%. Dla serowara najważniejsze są dwie liczby: tłuszcz i kazeina, bo to one przechodzą do sera. Laktoza w większości ucieka z serwatką i staje się pożywką dla kultur starterowych.",
    },
    {
      question: "Dlaczego mleko UHT nie nadaje się na ser?",
      answer:
        "Obróbka w ultrawysokiej temperaturze denaturuje białka serwatkowe, które wiążą się wtedy z kazeiną i blokują jej zdolność do tworzenia siatki skrzepu. Podpuszczka nadal tnie kazeinę, ale skrzep się nie formuje albo jest galaretowaty i nie daje się pokroić. Mleko pasteryzowane metodą HTST (72°C przez 15 sekund) nadaje się, wymaga jednak dodatku chlorku wapnia w dawce 0,2–0,3 g na litr, aby przywrócić równowagę wapniową.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "Mleko do sera — skład, wydajność serowarska i wpływ żywienia krów",
        description:
          "Co w mleku decyduje o serze: skład (tłuszcz, kazeina), wydajność serowarska wg typu sera, wzór Van Slyke'a, różnice ras (Jersey vs HF), kappa-kazeina oraz wpływ żywienia krów na tłuszcz i białko mleka.",
        inLanguage: "pl",
        url: "https://mojaserowarnia.pl/mleko-do-sera",
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
    { title: "Wady mleka a wady sera", href: "/wady-mleka-a-wady-sera", description: "Kiszonka i Clostridium, antybiotyki, komórki somatyczne — łańcuchy przyczynowe." },
    { title: "Kalkulator pasz dla bydła", href: "/kalkulator-pasz-bydlo", description: "Zbilansuj dawkę — struktura dawki decyduje o tłuszczu w mleku." },
    { title: "Jakość mleka wg Kleckiego", href: "/klecki-jakosc-mleka", description: "Rasa, sezon, pastwisko i laktacja — ujęcie klasyczne z 1900 r." },
    { title: "Kalkulator kosztu sera", href: "/kalkulator-kosztu-sera", description: "Wydajność z litra przekłada się wprost na koszt kilograma sera." },
  ];

  const skladTable = [
    { s: "Woda", v: "ok. 87,5%", u: "" },
    { s: "Tłuszcz", v: "3,5–4,5%", u: "przechodzi do sera — kluczowy dla wydajności" },
    { s: "Białko ogólne", v: "3,2–3,5%", u: "" },
    { s: "— w tym kazeina", v: "2,5–2,8%", u: "78–80% białka; TO ONA tworzy skrzep" },
    { s: "— w tym białka serwatkowe", v: "0,6–0,7%", u: "uciekają z serwatką (stąd ricotta)" },
    { s: "Laktoza", v: "4,6–4,9%", u: "pożywka dla kultur; ucieka z serwatką" },
    { s: "Składniki mineralne", v: "ok. 0,7%", u: "wapń kluczowy dla krzepnięcia" },
  ];

  const wydajnoscTable = [
    { ser: "Twaróg", z10: "1,5–1,8 kg", proc: "15–18%", uwaga: "krótki proces, dużo wody w produkcie" },
    { ser: "Mozzarella", z10: "1,2–1,3 kg", proc: "12–13%", uwaga: "" },
    { ser: "Camembert / Brie", z10: "ok. 1,2 kg", proc: "ok. 12%", uwaga: "" },
    { ser: "Gouda / Edam", z10: "ok. 1,0 kg", proc: "ok. 10%", uwaga: "" },
    { ser: "Cheddar", z10: "0,95–1,05 kg", proc: "9,5–10,5%", uwaga: "" },
    { ser: "Ementaler", z10: "0,8–0,9 kg", proc: "8–9%", uwaga: "drobne ziarno, wysokie dogrzewanie" },
    { ser: "Parmezan / Grana", z10: "0,6–0,7 kg", proc: "6–7%", uwaga: "najdłuższe dojrzewanie, największy ubytek wody" },
    { ser: "Ricotta (z serwatki)", z10: "0,2–0,4 kg", proc: "2–4% serwatki", uwaga: "bonus po serze głównym" },
  ];

  const rasyTable = [
    { rasa: "Jersey", tluszcz: "4,8–5,5%", bialko: "3,7–4,0%", ser: "najwyższa — ok. 20–25% więcej niż HF" },
    { rasa: "Brown Swiss", tluszcz: "4,0–4,3%", bialko: "3,5–3,7%", ser: "wysoka; częsty wariant kappa-kazeiny B" },
    { rasa: "Simentaler", tluszcz: "4,0–4,2%", bialko: "3,4–3,6%", ser: "wysoka" },
    { rasa: "Holsztyńsko-fryzyjska", tluszcz: "ok. 4,0%", bialko: "3,2–3,4%", ser: "niższa z litra, ale najwięcej mleka z krowy" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mleko do sera — skład, wydajność i wpływ żywienia krów | Moja Serowarnia</title>
        <meta
          name="description"
          content="Ile sera z litra mleka (tabela dla 8 serów), co decyduje o wydajności (kazeina i tłuszcz), wzór Van Slyke'a, porównanie ras Jersey vs HF, kappa-kazeina i wpływ żywienia krów."
        />
        <link rel="canonical" href="https://mojaserowarnia.pl/mleko-do-sera" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Pasze i zwierzęta", href: "/pasze" },
          { label: "Mleko do sera" },
        ]}
      />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Milk}
              color="sky"
              title="Mleko do sera — od krowy do wydajności"
              subtitle="Ser powstaje z dwóch składników mleka: kazeiny i tłuszczu. Wszystko, co dzieje się w oborze, kończy się liczbą kilogramów sera z każdych 100 litrów."
            />

            <div className="mt-4 mb-8">
              <ReactionButton contentType="guide" contentId="mleko-do-sera" variant="default" />
            </div>

            <TLDRSection>
              <p>
                O wydajności decydują <strong>kazeina (2,5–2,8%)</strong> i{" "}
                <strong>tłuszcz (3,5–4,5%)</strong>, a nie białko ogólne — białka serwatkowe uciekają
                z serwatką. Z 10 litrów wychodzi orientacyjnie <strong>1 kg goudy</strong>, ale tylko{" "}
                <strong>0,6–0,7 kg parmezanu</strong>. Mleko Jersey daje{" "}
                <strong>20–25% więcej sera</strong> z litra niż holsztyńskie. Na tłuszcz w mleku
                najsilniej wpływa <strong>struktura dawki</strong> (włókno), na białko —{" "}
                <strong>podaż energii</strong>.
              </p>
            </TLDRSection>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skład mleka krowiego — co trafia do sera</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Składnik</th>
                          <th className="text-left p-2 font-semibold">Zawartość</th>
                          <th className="text-left p-2 font-semibold">Znaczenie dla serowara</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skladTable.map((r) => (
                          <tr key={r.s} className="border-b">
                            <td className="p-2 font-medium">{r.s}</td>
                            <td className="p-2 tabular-nums">{r.v}</td>
                            <td className="p-2 text-muted-foreground">{r.u}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg mt-4 text-sm">
                    <strong>Najczęstsze nieporozumienie:</strong> serowara nie interesuje białko
                    ogólne, tylko <strong>kazeina</strong>. Dwie próbki o identycznym białku 3,4%
                    mogą dać różną ilość sera, jeśli różnią się udziałem kazeiny. Dlatego w
                    mleczarstwie liczy się stosunek <strong>kazeina : tłuszcz</strong>, a nie samo
                    białko.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ile sera wychodzi z 10 litrów mleka</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Ser</th>
                          <th className="text-left p-2 font-semibold">Z 10 L mleka</th>
                          <th className="text-left p-2 font-semibold">Wydajność</th>
                          <th className="text-left p-2 font-semibold">Uwagi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wydajnoscTable.map((r) => (
                          <tr key={r.ser} className="border-b">
                            <td className="p-2 font-medium">{r.ser}</td>
                            <td className="p-2 tabular-nums font-semibold">{r.z10}</td>
                            <td className="p-2 tabular-nums">{r.proc}</td>
                            <td className="p-2 text-muted-foreground">{r.uwaga}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Zasada: <strong>im twardszy i dłużej dojrzewający ser, tym więcej mleka</strong> —
                    bo ser traci wodę przez cały okres dojrzewania. Parmezan potrzebuje ponad
                    półtora raza więcej mleka niż gouda. Wartości orientacyjne dla mleka o typowym
                    składzie; przy mleku tłustszym rosną. Koszt kilograma policzysz w{" "}
                    <Link to="/kalkulator-kosztu-sera" className="text-primary hover:underline">
                      kalkulatorze kosztu sera
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wzór Van Slyke'a — skąd bierze się wydajność</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    Klasyczny wzór szacujący wydajność sera z mleka opiera się na dwóch składnikach,
                    które faktycznie zostają w serze — tłuszczu i kazeinie:
                  </p>
                  <div className="bg-secondary/50 p-4 rounded-lg font-mono text-center">
                    Y = [ (0,93 × T) + (K − 0,1) ] × 1,09 / (1 − W)
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Y</strong> — wydajność sera w % masy mleka,</li>
                    <li><strong>T</strong> — zawartość tłuszczu w mleku (%),</li>
                    <li><strong>K</strong> — zawartość kazeiny (%),</li>
                    <li><strong>W</strong> — docelowa wilgotność sera (ułamek, np. 0,37 dla goudy),</li>
                    <li><strong>0,93</strong> — odzysk tłuszczu (ok. 7% ucieka z serwatką),</li>
                    <li><strong>0,1</strong> — kazeina tracona w serwatce,</li>
                    <li><strong>1,09</strong> — poprawka na sól i inne składniki zatrzymane w serze.</li>
                  </ul>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <strong>Praktyczny wniosek:</strong> podniesienie tłuszczu w mleku o{" "}
                    <strong>0,1 punktu procentowego</strong> daje mniej więcej{" "}
                    <strong>1,5–2% więcej sera</strong>. Przy 1000 litrów mleka tygodniowo to
                    kilkanaście kilogramów sera rocznie różnicy — z tego samego stada, tylko przy
                    lepiej ułożonej dawce.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rasa a wydajność serowarska</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-secondary/50">
                          <th className="text-left p-2 font-semibold">Rasa</th>
                          <th className="text-left p-2 font-semibold">Tłuszcz</th>
                          <th className="text-left p-2 font-semibold">Białko</th>
                          <th className="text-left p-2 font-semibold">Wydajność sera</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rasyTable.map((r) => (
                          <tr key={r.rasa} className="border-b">
                            <td className="p-2 font-medium">{r.rasa}</td>
                            <td className="p-2 tabular-nums">{r.tluszcz}</td>
                            <td className="p-2 tabular-nums">{r.bialko}</td>
                            <td className="p-2 text-muted-foreground">{r.ser}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg mt-4 text-sm">
                    <strong>Kappa-kazeina — cecha, o której mało kto mówi.</strong> Wariant
                    genetyczny <strong>B</strong> daje zwięźlejszy skrzep, krótszy czas krzepnięcia i
                    wyższą wydajność niż wariant <strong>A</strong>. Różnica bywa rzędu kilku procent
                    wydajności przy identycznym składzie mleka. Wariant B częściej występuje u Brown
                    Swiss i Jersey, rzadziej u holsztynów. Przy zakupie buhaja do stada
                    produkującego mleko na ser warto o ten genotyp zapytać.
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Szerzej o wpływie rasy, sezonu i pastwiska pisze klasyk polskiego mleczarstwa —
                    zobacz{" "}
                    <Link to="/klecki-jakosc-mleka" className="text-primary hover:underline">
                      Klecki o jakości mleka
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Żywienie krów a skład mleka</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1">Tłuszcz — decyduje struktura dawki</h4>
                    <p>
                      Tłuszcz mleka powstaje głównie z kwasu octowego produkowanego w żwaczu przy
                      trawieniu <strong>włókna strukturalnego</strong>. Dlatego pasze objętościowe i
                      odpowiednia długość sieczki podnoszą tłuszcz, a nadmiar pasz treściwych i zbyt
                      drobne rozdrobnienie prowadzą do <strong>kwasicy żwacza</strong> i spadku
                      tłuszczu — czasem poniżej 3%. Dla serowara to bezpośrednia strata wydajności.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Białko — decyduje energia, nie białko w dawce</h4>
                    <p>
                      To nieoczywiste: na białko mleka silniej wpływa <strong>podaż energii</strong>{" "}
                      niż zawartość białka w dawce. Niedobór energii obniża białko mleka nawet przy
                      wysokim białku paszy. Nadmiar białka w dawce nie podniesie białka mleka — za to
                      podniesie <strong>mocznik w mleku</strong> i obciąży wątrobę.
                    </p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <strong>Sygnały ostrzegawcze w wynikach mleka:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Tłuszcz poniżej 3,0%</strong> lub odwrócony stosunek tłuszcz/białko (T &lt; B) → podejrzenie kwasicy żwacza.</li>
                      <li><strong>Białko poniżej 3,0%</strong> → najczęściej niedobór energii w dawce.</li>
                      <li><strong>Mocznik powyżej 250 mg/L</strong> → nadmiar białka względem energii.</li>
                    </ul>
                  </div>
                  <p className="text-muted-foreground">
                    Dawkę ułożysz w{" "}
                    <Link to="/kalkulator-pasz-bydlo" className="text-primary hover:underline">
                      kalkulatorze pasz dla bydła
                    </Link>
                    . O tym, jak pasza może wprost <em>zepsuć</em> ser, piszemy w{" "}
                    <Link to="/wady-mleka-a-wady-sera" className="text-primary hover:underline font-medium">
                      wadach mleka a wadach sera
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mleko, które nie nadaje się na ser</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>Siara i mleko z pierwszych dni po wycieleniu</strong> — inny skład
                    białkowy, nie tworzy prawidłowego skrzepu.
                  </p>
                  <p>
                    <strong>Mleko z ostatnich tygodni laktacji</strong> — wyższe pH i LKS, aktywna
                    plazmina rozkłada kazeinę: dłuższe krzepnięcie, słabszy skrzep, ryzyko goryczy.
                  </p>
                  <p>
                    <strong>Mleko UHT</strong> — zdenaturowane białka serwatkowe blokują tworzenie
                    siatki kazeinowej. Skrzep nie powstaje albo jest galaretowaty.
                  </p>
                  <p>
                    <strong>Mleko od krów leczonych antybiotykami</strong> — inhibitory zabijają
                    kultury starterowe; ser się nie zakwasi. Szczegóły w{" "}
                    <Link to="/wady-mleka-a-wady-sera" className="text-primary hover:underline">
                      wadach mleka
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <SekcjaFAQ slug="mleko-do-sera" />


      <SeeAlso links={seeAlsoLinks} />
      <Footer />
    </div>
  );
};

export default MlekoDoSera;
