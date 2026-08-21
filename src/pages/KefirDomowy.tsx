import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import HowToSchema from "@/components/HowToSchema";
import { Link } from "react-router-dom";
import { Milk } from "lucide-react";

const faqData = [
  {
    question: "Czym kefir różni się od jogurtu?",
    answer:
      "Trzema rzeczami. Jogurt robi para bakterii w 42–45°C przez kilka godzin. Kefir powstaje z ziaren kefirowych, które są symbiozą kilkudziesięciu gatunków bakterii i drożdży, fermentuje w temperaturze pokojowej 20–25°C przez 12–24 godziny, a mleka się nie podgrzewa. Udział drożdży sprawia, że kefir jest lekko gazowany i zawiera ślady alkoholu, zwykle 0,2–0,8%.",
  },
  {
    question: "Jak zrobić kefir z kefiru sklepowego, bez grzybków?",
    answer:
      "Wymieszaj 100 ml świeżego kefiru z 500 ml mleka i zostaw na 12–24 godziny w temperaturze pokojowej. Metoda działa, ale ma granicę: kefir sklepowy powstaje zwykle z wyselekcjonowanych kultur, a nie z pełnych ziaren, więc zakwas słabnie po 2–3 partiach i trzeba go odnawiać. Prawdziwe ziarna rosną i służą latami.",
  },
  {
    question: "W jakiej temperaturze fermentuje kefir?",
    answer:
      "20–25°C przez 12–24 godziny. Powyżej 28°C przewagę biorą drożdże i kefir robi się drożdżowy oraz rozwarstwiony. Poniżej 18°C fermentacja mocno zwalnia. Latem trwa krócej, zimą dłużej — czas trzeba dobierać na oko, po wyglądzie.",
  },
  {
    question: "Jak pielęgnować grzybki kefirowe?",
    answer:
      "Odcedzaj je co dobę i przekładaj do świeżego mleka — to cała pielęgnacja. Nie płucz wodą z kranu i nie używaj metalowego sitka na dłużej. Na przerwę do tygodnia zalej ziarna mlekiem i wstaw do lodówki; na dłużej zamroź w mleku. Ziarna rosną, więc nadmiar można oddać albo wysuszyć.",
  },
  {
    question: "Dlaczego kefir się rozwarstwia?",
    answer:
      "Bo fermentował za długo albo w za wysokiej temperaturze — serwatka oddziela się od skrzepu. To nie jest zepsucie, wystarczy wymieszać. Żeby tego uniknąć, skróć czas albo zmniejsz proporcję ziaren do mleka.",
  },
  {
    question: "Czy kefir zawiera alkohol?",
    answer:
      "Tak, w śladowych ilościach — zwykle 0,2–0,8%, bo drożdże przerabiają część laktozy na alkohol i CO₂. Dłuższa fermentacja i szczelne zamknięcie słoika podnoszą tę wartość. Kefir sklepowy ma zwykle mniej niż domowy.",
  },
];

const kroki = [
  {
    name: "Zalej ziarna mlekiem",
    text: "Wsyp 1–2 łyżki ziaren kefirowych do słoika i zalej 500 ml mleka w temperaturze pokojowej. Mleka nie podgrzewaj — to podstawowa różnica wobec jogurtu.",
  },
  {
    name: "Przykryj, nie zakręcaj",
    text: "Przykryj gazą albo ściereczką i zawiąż gumką. Fermentacja wytwarza CO₂, więc szczelnie zakręcony słoik może zbudować spore ciśnienie.",
  },
  {
    name: "Fermentuj 12–24 godziny",
    text: "Zostaw w temperaturze 20–25°C, z dala od słońca. Kefir jest gotowy, gdy mleko zgęstnieje i pojawią się drobne bąbelki. Latem trwa to krócej, zimą dłużej.",
  },
  {
    name: "Odcedź ziarna",
    text: "Przelej przez plastikowe sitko, mieszając łyżką. Ziarna zostaną na sitku — przełóż je do nowej porcji mleka. Gotowy kefir schłodź.",
  },
];

const Glo = ({ term, children }: { term: string; children: string }) => (
  <a href={`/slownik.html#${term}`} target="_blank" rel="noopener noreferrer" className="decoration-dotted underline-offset-2">
    {children}
  </a>
);

const KefirDomowy = () => (
  <KulturaGuideLayout
    icon={Milk}
    title="Jak zrobić domowy kefir — grzybki tybetańskie i metoda z kefiru sklepowego"
    subtitle="Kefir robi się inaczej niż jogurt: bez podgrzewania mleka, w temperaturze pokojowej i przy udziale drożdży. Poniżej obie metody — z ziarnami kefirowymi i bez nich — oraz pielęgnacja grzybków."
    metaTitle="Jak zrobić domowy kefir — grzybki tybetańskie i bez nich | Moja Serowarnia"
    metaDescription="Domowy kefir: fermentacja 20–25°C przez 12–24 h, bez podgrzewania mleka. Grzybki tybetańskie, pielęgnacja, metoda bez grzybków i czym kefir różni się od jogurtu."
    breadcrumb={[{ label: "Przepisy", href: "/przepisy" }, { label: "Domowy kefir" }]}
    related={[
      { label: "Domowy jogurt — inna fermentacja, inna temperatura", href: "/przepisy/jogurt-domowy" },
      { label: "Ser i twaróg z jogurtu lub kefiru", href: "/przepisy/ser-z-jogurtu" },
      { label: "Kultury jogurtowe — dla porównania z ziarnami kefirowymi", href: "/kultury/jogurtowe" },
      { label: "Twaróg — koagulacja kwasowa krok dalej", href: "/przepisy/twarog" },
      { label: "Mleko do sera — jakość surowca", href: "/mleko-do-sera" },
    ]}
  >
    <FAQSchema faqs={faqData} />
    <HowToSchema
      name="Jak zrobić domowy kefir z grzybków tybetańskich"
      description="Kefir z ziaren kefirowych: zalanie mlekiem, fermentacja 12–24 godziny w temperaturze pokojowej, odcedzenie ziaren."
      totalTime="PT24H"
      datePublished="2026-08-21"
      dateModified="2026-08-21"
      supply={["Ziarna kefirowe (grzybki tybetańskie) — 1–2 łyżki", "Mleko — 500 ml"]}
      tool={["Słoik szklany", "Sitko plastikowe", "Gaza lub ściereczka do przykrycia"]}
      steps={kroki}
    />

    <h2>Czym kefir różni się od jogurtu?</h2>
    <p>To nie jest wariant tego samego procesu, tylko inna fermentacja. Różnice są trzy i każda ma praktyczne konsekwencje.</p>
    <table>
      <thead>
        <tr><th>&nbsp;</th><th>Jogurt</th><th>Kefir</th></tr>
      </thead>
      <tbody>
        <tr><th>Co fermentuje</th><td>para bakterii: <em>S. thermophilus</em> + <em>L. bulgaricus</em></td><td>ziarna kefirowe: kilkadziesiąt gatunków bakterii <strong>i drożdży</strong></td></tr>
        <tr><th>Temperatura</th><td>42–45°C</td><td>20–25°C, czyli pokojowa</td></tr>
        <tr><th>Czas</th><td>4–8 godzin</td><td>12–24 godziny</td></tr>
        <tr><th>Mleko przed</th><td>podgrzewane do 85°C</td><td><strong>nie podgrzewane</strong></td></tr>
        <tr><th>Efekt</th><td>gęsty, kwaskowy, gładki</td><td>rzadszy, lekko gazowany, ze śladem alkoholu</td></tr>
      </tbody>
    </table>
    <p>
      Najważniejsza jest obecność <strong>drożdży</strong>. To one odpowiadają za bąbelki, lekko drożdżowy aromat i
      śladowy alkohol — zwykle <strong>0,2–0,8%</strong>, bo część laktozy zamieniają na etanol i dwutlenek węgla.
      Jogurt takiej fermentacji nie prowadzi.
    </p>
    <div className="not-prose my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-foreground">
      Praktyczna konsekwencja: kefiru <strong>nie robi się w jogurtownicy</strong>. Temperatura 42°C, którą ona
      utrzymuje, zabija część mikroflory ziaren i przesuwa równowagę na niekorzyść drożdży.
    </div>

    <h2>Kefir z grzybków tybetańskich — jak zacząć?</h2>
    <p>
      Ziarna kefirowe (nazywane grzybkami tybetańskimi) wyglądają jak małe kalafiorki. To żywa symbioza bakterii i
      drożdży osadzona w otoczce z polisacharydu. Nie da się ich wyprodukować z niczego — trzeba je dostać od kogoś
      albo kupić.
    </p>
    <ol>
      {kroki.map((k) => (
        <li key={k.name}>
          <strong>{k.name}</strong> — {k.text}
        </li>
      ))}
    </ol>
    <div className="not-prose my-6 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-foreground">
      <strong>Nie używaj metalu na dłużej.</strong> Krótki kontakt z sitkiem jest nieszkodliwy, ale przechowywanie
      ziaren w metalowym naczyniu z czasem je osłabia. Plastik, szkło i drewno są bezpieczne.
    </div>
    <table>
      <thead>
        <tr><th>Temperatura</th><th>Efekt</th></tr>
      </thead>
      <tbody>
        <tr><td>poniżej 18°C</td><td>fermentacja mocno zwalnia</td></tr>
        <tr><td>20–25°C</td><td>zakres roboczy</td></tr>
        <tr><td>powyżej 28°C</td><td>przewagę biorą drożdże — kefir drożdżowy i rozwarstwiony</td></tr>
      </tbody>
    </table>

    <h2>Jak zrobić kefir z kefiru sklepowego?</h2>
    <p>
      Jeśli nie masz ziaren, możesz użyć gotowego kefiru jako zakwasu:{" "}
      <strong>100 ml świeżego kefiru na 500 ml mleka</strong>, fermentacja 12–24 godziny w temperaturze pokojowej.
    </p>
    <p>
      Metoda działa, ale warto znać jej granicę. Kefir sklepowy powstaje zwykle z{" "}
      <strong>wyselekcjonowanych kultur</strong>, a nie z pełnych ziaren — producenci używają uproszczonego zestawu
      szczepów, bo jest powtarzalny. Taki zakwas <strong>słabnie po 2–3 partiach</strong> i trzeba go odnawiać nowym
      kefirem. Prawdziwe ziarna, odpowiednio prowadzone, rosną i służą latami.
    </p>
    <p>
      To ta sama zależność co przy <Link to="/przepisy/jogurt-domowy">jogurcie z zakwasu</Link>, tylko wyraźniejsza —
      bo w kefirze różnorodność mikroflory jest większa i szybciej się zubaża.
    </p>

    <h2>Jak pielęgnować grzybki kefirowe?</h2>
    <p>
      Cała pielęgnacja to <strong>odcedzanie co dobę i przekładanie do świeżego mleka</strong>. Ziarna żyją z laktozy —
      bez świeżego mleka głodują.
    </p>
    <ul>
      <li><strong>Nie płucz wodą z kranu.</strong> Chlor szkodzi mikroflorze. Jeśli musisz opłukać, użyj mleka albo wody przegotowanej.</li>
      <li><strong>Przerwa do tygodnia:</strong> zalej ziarna mlekiem i wstaw do lodówki. Fermentacja niemal stanie.</li>
      <li><strong>Przerwa dłuższa:</strong> zamroź ziarna w mleku. Po rozmrożeniu potrzebują 2–3 partii, żeby wrócić do formy.</li>
      <li><strong>Nadmiar:</strong> ziarna rosną. Nadwyżkę można oddać, wysuszyć albo po prostu zjeść — są jadalne.</li>
    </ul>
    <div className="not-prose my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-foreground">
      Jeśli kefir przez kilka partii wychodzi coraz słabszy, zwykle znaczy to, że proporcja ziaren do mleka jest za
      mała albo mleko było zbyt zimne. Zmniejsz porcję mleka i wróć do temperatury pokojowej.
    </div>

    <h2>Kefir z mleka prosto od krowy</h2>
    <p>
      Mleko surowe nadaje się do kefiru bardzo dobrze — ziarna radzą sobie z jego naturalną mikroflorą, bo same są
      konkurencyjne. Kefir wychodzi wtedy bogatszy w smaku.
    </p>
    <p>
      Zastrzeżenie dotyczy bezpieczeństwa, nie technologii: mleko surowe może zawierać patogeny, a fermentacja ich nie
      usuwa. Przy mleku z niepewnego źródła bezpieczniej je wcześniej spasteryzować — 63°C przez 30 minut — i schłodzić
      do temperatury pokojowej. Więcej o jakości surowca w poradniku <Link to="/mleko-do-sera">mleko do sera</Link>.
    </p>

    <h2>Dlaczego kefir się rozwarstwia lub jest gorzki?</h2>
    <table>
      <thead>
        <tr><th>Objaw</th><th>Przyczyna</th><th>Co zrobić</th></tr>
      </thead>
      <tbody>
        <tr><td>Rozwarstwienie na <Glo term="serwatka">serwatkę</Glo> i <Glo term="skrzep">skrzep</Glo></td><td>za długa fermentacja albo za ciepło</td><td>Wymieszać — nadaje się do picia. Następnym razem skrócić czas lub dać mniej ziaren</td></tr>
        <tr><td>Wyraźnie drożdżowy zapach</td><td>przewaga drożdży, zwykle powyżej 28°C</td><td>Fermentować w chłodniejszym miejscu</td></tr>
        <tr><td>Gorzki smak</td><td>ziarna głodzone zbyt długo albo przetrzymane w lodówce</td><td>Przełożyć do świeżego mleka i odrzucić 2–3 pierwsze partie</td></tr>
        <tr><td>Śluzowaty, ciągnący</td><td>bywa cechą przejściową po zmianie mleka lub temperatury</td><td>Kilka partii w stałych warunkach zwykle to wyrównuje</td></tr>
        <tr><td>Ziarna przestały rosnąć</td><td>za mało mleka, za zimno albo kontakt z metalem</td><td>Zwiększyć porcję mleka, wrócić do 20–25°C, używać plastiku i szkła</td></tr>
      </tbody>
    </table>

    <div className="not-prose my-8 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 p-5">
      <h2 className="mt-0 mb-3 text-lg font-display font-bold text-foreground">Co dalej z kefirem</h2>
      <ul className="space-y-2 text-sm">
        <li><Link to="/przepisy/ser-z-jogurtu" className="text-primary hover:underline font-semibold">Zrób z niego twaróg</Link> — ten sam ser kwasowy co z jogurtu</li>
        <li><Link to="/przepisy/jogurt-domowy" className="text-primary hover:underline font-semibold">Porównaj z jogurtem</Link> — domowy jogurt krok po kroku</li>
        <li><Link to="/przepisy/twarog" className="text-primary hover:underline font-semibold">Wejdź w sery</Link> — twaróg z kulturą, a potem sery podpuszczkowe</li>
      </ul>
    </div>

    <h2>Najczęstsze pytania o domowy kefir</h2>
    {faqData.map((f) => (
      <div key={f.question}>
        <h3>{f.question}</h3>
        <p>{f.answer}</p>
      </div>
    ))}
  </KulturaGuideLayout>
);

export default KefirDomowy;
