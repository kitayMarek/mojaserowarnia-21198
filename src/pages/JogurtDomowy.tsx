import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import HowToSchema from "@/components/HowToSchema";
import { Link } from "react-router-dom";
import { Milk } from "lucide-react";

const faqData = [
  {
    question: "W jakiej temperaturze robić jogurt?",
    answer:
      "42–45°C przez 4–8 godzin. To optimum dla pary Streptococcus thermophilus i Lactobacillus bulgaricus. Poniżej 40°C fermentacja praktycznie staje, powyżej 46°C bakterie zaczynają ginąć i jogurt nie zgęstnieje.",
  },
  {
    question: "Czy z mleka UHT da się zrobić jogurt?",
    answer:
      "Tak — i to jest ważna różnica wobec sera. Do sera podpuszczkowego UHT się nie nadaje, bo zdenaturowane białka serwatkowe blokują działanie podpuszczki. Przy jogurcie koagulacja jest kwasowa, a te same zdenaturowane białka wiążą wodę i dają gęstszy żel. Dlatego mleko do jogurtu podgrzewa się celowo do 85°C — UHT ma ten etap już za sobą.",
  },
  {
    question: "Jak zrobić jogurt bez jogurtownicy?",
    answer:
      "Najprościej w termosie: wlej zaszczepione mleko o temperaturze 45°C, zakręć i zostaw na 6–8 godzin. Działają też piekarnik z włączoną lampką, garnek owinięty kocem, multicooker z funkcją jogurtu i poduszka grzewcza. Jogurtownica jest wygodna, ale nie jest konieczna.",
  },
  {
    question: "Dlaczego jogurt wyszedł rzadki?",
    answer:
      "Najczęstsze przyczyny to za niska temperatura fermentacji, za krótki czas, mleko odtłuszczone albo stary zakwas. Pomaga podgrzanie mleka do 85°C przed schłodzeniem — zagęszcza jogurt bardziej niż jakikolwiek dodatek.",
  },
  {
    question: "Dlaczego jogurt jest za kwaśny?",
    answer:
      "Fermentował za długo albo w za wysokiej temperaturze. Kwasowość rośnie z każdą godziną, więc skróć czas do 4–5 godzin i przenieś do lodówki od razu po zgęstnieniu. Zakwas przekładany wiele razy też daje coraz kwaśniejszy jogurt.",
  },
  {
    question: "Jak zrobić jogurt grecki?",
    answer:
      "To zwykły jogurt odcedzony z serwatki. Przelej gotowy jogurt do sitka wyłożonego gazą i odstaw w lodówce na 2–4 godziny. Objętość zmniejszy się mniej więcej o połowę, a białko w przeliczeniu na 100 g wzrośnie. Dłuższe odcedzanie daje labneh, czyli serek do smarowania.",
  },
  {
    question: "Ile razy można używać własnego jogurtu jako zakwasu?",
    answer:
      "Zwykle 4–5 razy. Z każdym pasażem proporcja obu szczepów się przesuwa, bo mnożą się w różnym tempie, i jogurt robi się coraz kwaśniejszy oraz rzadszy. Potem trzeba wrócić do świeżej kultury.",
  },
];

const kroki = [
  {
    name: "Podgrzej mleko do 85°C",
    text: "Utrzymaj 10–20 minut, mieszając od czasu do czasu, żeby nie przypalić dna. Denaturacja białek serwatkowych daje gęstszy jogurt i mniej wyciekającej serwatki. Mleko UHT można pominąć na tym etapie — już przeszło obróbkę cieplną.",
  },
  {
    name: "Schłodź do 42–45°C",
    text: "Najszybciej w zlewie z zimną wodą. Sprawdź termometrem, nie na oko — różnica między 45 a 50°C decyduje o tym, czy kultura przeżyje.",
  },
  {
    name: "Zaszczep kulturą",
    text: "Rozsyp kulturę po powierzchni, odczekaj minutę, aż nasiąknie, i wymieszaj krótko. Przy zakwasie z jogurtu rozprowadź 2–3 łyżki w odrobinie mleka, potem wlej do reszty.",
  },
  {
    name: "Fermentuj 4–8 godzin",
    text: "Utrzymaj 42–45°C i nie poruszaj naczyniem. Po 4 godzinach jogurt jest łagodny, po 8 wyraźniej kwaśny. Gotowy, gdy przechylony trzyma się zwartą masą.",
  },
  {
    name: "Schłodź w lodówce",
    text: "Minimum 4 godziny, najlepiej przez noc. Chłodzenie zatrzymuje zakwaszanie i jogurt jeszcze stężeje. W lodówce trzyma się 1–2 tygodnie.",
  },
];

const Glo = ({ term, children }: { term: string; children: string }) => (
  <a href={`/slownik.html#${term}`} target="_blank" rel="noopener noreferrer" className="decoration-dotted underline-offset-2">
    {children}
  </a>
);

const JogurtDomowy = () => (
  <KulturaGuideLayout
    icon={Milk}
    title="Jak zrobić domowy jogurt naturalny — przepis krok po kroku"
    subtitle="Jeden litr mleka, szczypta kultury i osiem godzin w cieple. Poniżej pełna metoda, warianty bez jogurtownicy i w jogurtownicy, jogurt grecki oraz to, co najczęściej idzie nie tak."
    metaTitle="Jak zrobić domowy jogurt naturalny — przepis krok po kroku | Moja Serowarnia"
    metaDescription="Domowy jogurt: temperatura 42–45°C, czas 4–8 h, metoda z jogurtownicą i bez niej. Jogurt grecki, mleko kozie i owcze, zakwas na kolejne partie i najczęstsze błędy."
    breadcrumb={[{ label: "Przepisy", href: "/przepisy" }, { label: "Domowy jogurt" }]}
    related={[
      { label: "Domowy kefir — grzybki tybetańskie i metoda bez nich", href: "/przepisy/kefir-domowy" },
      { label: "Ser i twaróg z jogurtu lub kefiru", href: "/przepisy/ser-z-jogurtu" },
      { label: "Kultury jogurtowe — które wybrać i ile dodać", href: "/kultury/jogurtowe" },
      { label: "Twaróg — ta sama koagulacja kwasowa, inna droga", href: "/przepisy/twarog" },
      { label: "Mleko do sera — co decyduje o jakości surowca", href: "/mleko-do-sera" },
    ]}
  >
    <FAQSchema faqs={faqData} />
    <HowToSchema
      name="Jak zrobić domowy jogurt naturalny"
      description="Jogurt z mleka i kultury jogurtowej: podgrzanie, schłodzenie do 42–45°C, fermentacja 4–8 godzin, chłodzenie."
      totalTime="PT9H"
      datePublished="2026-08-21"
      dateModified="2026-08-21"
      supply={["Mleko — 1 L", "Kultura jogurtowa (szczypta) albo 2–3 łyżki jogurtu naturalnego"]}
      tool={["Termometr", "Jogurtownica, termos albo piekarnik z lampką"]}
      steps={kroki}
    />

    <h2>Czego potrzebujesz do domowego jogurtu?</h2>
    <table>
      <thead>
        <tr><th>Składnik</th><th>Ilość</th><th>Uwagi</th></tr>
      </thead>
      <tbody>
        <tr><td>Mleko</td><td>1 L</td><td>Krowie, kozie lub owcze. Pełne daje gęstszy jogurt niż odtłuszczone.</td></tr>
        <tr><td><Link to="/kultury/jogurtowe">Kultura jogurtowa</Link></td><td>szczypta</td><td>Ok. 1/16–1/8 łyżeczki na 1–2 L. Dawkowanie zawsze wg opakowania.</td></tr>
        <tr><td>albo jogurt naturalny</td><td>2–3 łyżki</td><td>Musi mieć żywe kultury i być świeży.</td></tr>
      </tbody>
    </table>

    <h3>Czy mleko UHT się nadaje? Tak — i to nie pomyłka</h3>
    <p>
      Przy serze powtarzamy, że <strong>mleko UHT się nie nadaje</strong>, i to prawda. Przy jogurcie jest{" "}
      <strong>dokładnie odwrotnie</strong>, a powód to ten sam mechanizm widziany z drugiej strony.
    </p>
    <p>
      Wysoka temperatura denaturuje białka serwatkowe. W serze podpuszczkowym to katastrofa: zdenaturowana
      beta-laktoglobulina łączy się z kappa-kazeiną i blokuje działanie <Glo term="podpuszczka">podpuszczki</Glo>,
      więc <Glo term="skrzep">skrzep</Glo> się nie wytworzy. W jogurcie <Glo term="koagulacja">koagulacja</Glo> jest
      kwasowa i podpuszczka nie bierze udziału — te same zdenaturowane białka wiążą wodę i dają{" "}
      <strong>gęstszy żel, z którego mniej wycieka serwatki</strong>.
    </p>
    <p>
      Dlatego mleko na jogurt podgrzewa się celowo do 85°C. Mleko UHT ma ten etap już za sobą — możesz je zaszczepić
      prosto po podgrzaniu do 45°C.
    </p>

    <h2>Jaka temperatura fermentacji jogurtu?</h2>
    <p>
      <strong>42–45°C przez 4–8 godzin.</strong> To optimum pracy pary <em>Streptococcus thermophilus</em> i{" "}
      <em>Lactobacillus bulgaricus</em>. Granice są ostre w obie strony:
    </p>
    <table>
      <thead>
        <tr><th>Temperatura</th><th>Co się dzieje</th></tr>
      </thead>
      <tbody>
        <tr><td>poniżej 40°C</td><td>fermentacja praktycznie staje; jogurt zostaje rzadki</td></tr>
        <tr><td>42–45°C</td><td>zakres roboczy — gęstnienie w 4–8 godzin</td></tr>
        <tr><td>powyżej 46°C</td><td>bakterie zaczynają ginąć; skrzep bywa ziarnisty</td></tr>
        <tr><td>powyżej 50°C</td><td>kultura ginie, mleko się nie zetnie</td></tr>
      </tbody>
    </table>
    <p>
      Czas w tym zakresie steruje smakiem: po 4 godzinach jogurt jest łagodny, po 8 wyraźnie kwaśny.{" "}
      <Glo term="kwasowosc">Kwasowość</Glo> rośnie z każdą godziną i po schłodzeniu już nie maleje.
    </p>

    <h2>Jak zrobić jogurt krok po kroku</h2>
    <ol>
      {kroki.map((k) => (
        <li key={k.name}>
          <strong>{k.name}</strong> — {k.text}
        </li>
      ))}
    </ol>

    <h2>Jak zrobić jogurt bez jogurtownicy?</h2>
    <p>Jogurtownica utrzymuje stałą temperaturę i to cała jej rola. Bez niej wystarczy cokolwiek, co utrzyma ciepło przez kilka godzin:</p>
    <table>
      <thead>
        <tr><th>Sposób</th><th>Jak</th><th>Uwagi</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Termos</strong></td><td>Wlej mleko o 45°C, zakręć, zostaw 6–8 h</td><td>Najprostszy i najskuteczniejszy. Termos wyparz wrzątkiem.</td></tr>
        <tr><td><strong>Piekarnik</strong></td><td>Włącz samą lampkę, wstaw naczynie</td><td>Sprawdź termometrem — niektóre piekarniki dają za dużo ciepła.</td></tr>
        <tr><td><strong>Garnek w kocu</strong></td><td>Owiń garnek kocem i wstaw w ciepłe miejsce</td><td>Duża masa mleka stygnie wolniej — łatwiej przy 2 L niż przy 0,5 L.</td></tr>
        <tr><td><strong>Multicooker</strong></td><td>Funkcja jogurtu, jeśli jest</td><td>Najwygodniejszy zamiennik jogurtownicy.</td></tr>
        <tr><td><strong>Poduszka grzewcza</strong></td><td>Ustaw na najniższy stopień, owiń naczynie</td><td>Wymaga kontroli termometrem.</td></tr>
      </tbody>
    </table>
    <div className="not-prose my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-foreground">
      Jogurtownica bywa wygodna, jeśli robisz jogurt regularnie i chcesz go od razu w słoiczkach. Ale{" "}
      <strong>nie jest do niczego niezbędna</strong> — termos daje ten sam efekt za darmo.
    </div>

    <h2>Jak zrobić jogurt grecki?</h2>
    <p>
      Jogurt grecki to <strong>zwykły jogurt odcedzony z <Glo term="serwatka">serwatki</Glo></strong>, a nie inna kultura
      ani inna metoda. Przelej gotowy, schłodzony jogurt do sitka wyłożonego gazą i odstaw w lodówce:
    </p>
    <ul>
      <li><strong>2 godziny</strong> — konsystencja jogurtu typu greckiego</li>
      <li><strong>4 godziny</strong> — gęsty, prawie jak serek</li>
      <li><strong>12 godzin i dłużej</strong> — labneh, serek do smarowania (<Link to="/przepisy/ser-z-jogurtu">osobny przepis</Link>)</li>
    </ul>
    <p>
      Objętość spada mniej więcej o połowę, więc białko w przeliczeniu na 100 g odpowiednio rośnie. Odcedzonej
      serwatki nie wylewaj — nadaje się do chleba, naleśników i <Link to="/serwatka-dla-zwierzat">do pojenia zwierząt</Link>.
    </p>

    <h2>Jogurt z mleka koziego i owczego</h2>
    <p>
      <strong>Kozie</strong> daje jogurt delikatniejszy, ale zwykle rzadszy — kazeina koziego mleka tworzy słabszy żel.
      Pomaga dłuższe podgrzewanie przed fermentacją i kultura zalecana do koziego, na przykład LAMBDA 10.
    </p>
    <p>
      <strong>Owcze</strong> ma najwięcej suchej masy i daje jogurt najgęstszy, wręcz kremowy, bez żadnych zabiegów.
      To najwdzięczniejsze mleko na jogurt, tylko trudniej dostępne.
    </p>

    <h2>Jak zrobić zakwas do kolejnej partii?</h2>
    <p>
      Odłóż 2–3 łyżki świeżego jogurtu, zanim zaczniesz go jeść, i użyj do następnej partii. Tak można powtarzać, ale{" "}
      <strong>zwykle tylko 4–5 razy</strong>.
    </p>
    <p>
      Powód: obie bakterie mnożą się w różnym tempie, więc z każdym pasażem proporcja szczepów się przesuwa. Jogurt robi
      się coraz kwaśniejszy i rzadszy, a w końcu przestaje tężeć. Wtedy trzeba wrócić do{" "}
      <Link to="/kultury/jogurtowe">świeżej kultury</Link>.
    </p>
    <div className="not-prose my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-foreground">
      Zakwas trzymaj w lodówce nie dłużej niż 5–7 dni. Im starszy, tym słabszy start i większe ryzyko, że mleko zdążą
      opanować obce bakterie.
    </div>

    <h2>Dlaczego jogurt wyszedł rzadki lub kwaśny?</h2>
    <table>
      <thead>
        <tr><th>Objaw</th><th>Przyczyna</th><th>Co zrobić</th></tr>
      </thead>
      <tbody>
        <tr><td>Rzadki, nie stężał</td><td>za niska temperatura, za krótki czas, mleko odtłuszczone albo stary zakwas</td><td>Podgrzej mleko do 85°C przed fermentacją, sprawdź termometrem temperaturę, wydłuż czas</td></tr>
        <tr><td>Za kwaśny</td><td>za długa fermentacja albo za wysoka temperatura</td><td>Skróć do 4–5 godzin i schłodź od razu po zgęstnieniu</td></tr>
        <tr><td>Ziarnisty, kaszkowaty</td><td>za wysoka temperatura zaszczepienia lub fermentacji</td><td>Pilnuj, żeby nie przekroczyć 46°C</td></tr>
        <tr><td>Serwatka na wierzchu</td><td>zjawisko naturalne (synereza), często po poruszeniu naczyniem</td><td>Zlej albo wmieszaj — jogurt jest dobry. Nie mieszaj w trakcie fermentacji</td></tr>
        <tr><td>Nie zetnie się wcale</td><td>kultura zginęła w za gorącym mleku albo mleko zawierało antybiotyki</td><td>Sprawdź termometr; przy mleku prosto od krowy upewnij się co do karencji</td></tr>
        <tr><td>Ciągnący, śluzowaty</td><td>niektóre szczepy dają teksturę ciągnącą; bywa też skutkiem zakażenia</td><td>Jeśli zapach jest normalny — to cecha kultury. Jeśli obcy — wyrzuć</td></tr>
      </tbody>
    </table>

    <div className="not-prose my-8 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 p-5">
      <h2 className="mt-0 mb-3 text-lg font-display font-bold text-foreground">Co dalej z jogurtem</h2>
      <ul className="space-y-2 text-sm">
        <li><Link to="/przepisy/ser-z-jogurtu" className="text-primary hover:underline font-semibold">Zrób z niego ser</Link> — labneh, twaróg z kefiru i masło</li>
        <li><Link to="/przepisy/kefir-domowy" className="text-primary hover:underline font-semibold">Spróbuj kefiru</Link> — inna fermentacja, bez podgrzewania mleka</li>
        <li><Link to="/kultury/jogurtowe" className="text-primary hover:underline font-semibold">Wybierz kulturę</Link> — kultury jogurtowe z dawkowaniem</li>
        <li><Link to="/przepisy" className="text-primary hover:underline font-semibold">Wejdź w sery podpuszczkowe</Link> — przepisy krok po kroku</li>
      </ul>
    </div>

    <h2>Najczęstsze pytania o domowy jogurt</h2>
    {faqData.map((f) => (
      <div key={f.question}>
        <h3>{f.question}</h3>
        <p>{f.answer}</p>
      </div>
    ))}
  </KulturaGuideLayout>
);

export default JogurtDomowy;
