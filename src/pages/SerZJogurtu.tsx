import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import HowToSchema from "@/components/HowToSchema";
import { Link } from "react-router-dom";
import { Milk } from "lucide-react";

const faqData = [
  {
    question: "Czy z jogurtu da się zrobić prawdziwy ser?",
    answer:
      "Tak, ale to ser kwasowy, a nie podpuszczkowy. Białko wytrąca się przez kwas, a nie przez enzym, więc sieć białkowa jest słabsza i taki ser nie nadaje się do dojrzewania — je się go świeżego.",
  },
  {
    question: "Ile labneh wychodzi z kilograma jogurtu?",
    answer: "Około 400–500 g po dobie odcedzania. Reszta to serwatka, której nie trzeba wylewać.",
  },
  {
    question: "Czym różni się twaróg z kefiru od twarogu ze zsiadłego mleka?",
    answer:
      "Metoda jest ta sama, różni się smak. Kefir prowadzi fermentację drożdżowo-mlekową, więc twaróg wychodzi bardziej złożony, z lekką nutą drożdżową.",
  },
  {
    question: "Czy da się zrobić masło z jogurtu greckiego?",
    answer:
      "Tylko z jogurtu naprawdę tłustego. Typowy grecki ma 2–10% tłuszczu i masła z niego praktycznie nie będzie — do ubijania potrzeba co najmniej 30%, czyli śmietany.",
  },
  {
    question: "Dlaczego ser z jogurtu nie dojrzewa?",
    answer:
      "Bo przy koagulacji kwasowej wapń odchodzi z serwatką, a sieć kazeinowa jest luźna i zawiera dużo wody. Dojrzewanie wymaga zwięzłej struktury utworzonej przez podpuszczkę.",
  },
  {
    question: "Co zrobić, żeby labneh był gęstszy?",
    answer:
      "Odcedzać dłużej i posolić przed odcedzaniem. Można też lekko obciążyć masę — ale ostrożnie, bo zbyt mocny nacisk wyciska tłuszcz razem z wodą.",
  },
];

const krokiLabneh = [
  {
    name: "Posól jogurt",
    text: "Wmieszaj 10 g soli w 1 kg jogurtu naturalnego albo greckiego. Sól wyciąga wodę na zasadzie osmozy — bez niej odcedzanie trwa dużo dłużej, a serek wychodzi mdły.",
  },
  {
    name: "Przełóż do gazy",
    text: "Wyłóż sitko podwójną gazą serowarską albo pieluszką tetrową, przelej jogurt, zwiąż rogi i powieś nad naczyniem. Serwatka zacznie kapać w ciągu kilkunastu minut.",
  },
  {
    name: "Odcedzaj w lodówce",
    text: "12 godzin daje gęstą śmietanę, 24 godziny masę do smarowania, 48 godzin masę zwięzłą i formowalną. Czas to jedyna zmienna, którą sterujesz.",
  },
  {
    name: "Uformuj i przechowuj",
    text: "Po dwóch dobach masę da się formować w kulki. Zalane oliwą z tymiankiem, czosnkiem albo płatkami chili trzymają się w lodówce kilka tygodni — oliwa odcina dostęp powietrza.",
  },
];

const Glo = ({ term, children }: { term: string; children: string }) => (
  <a href={`/slownik.html#${term}`} target="_blank" rel="noopener noreferrer" className="decoration-dotted underline-offset-2">
    {children}
  </a>
);

const SerZJogurtu = () => (
  <KulturaGuideLayout
    icon={Milk}
    title="Ser i twaróg z jogurtu lub kefiru — jak zrobić w domu"
    subtitle="Trzy przepisy bez podpuszczki: labneh z jogurtu greckiego, twaróg z mleka i kefiru oraz masło z fermentowanej śmietany. Plus wyjaśnienie, dlaczego takiego sera nie da się dojrzewać."
    metaTitle="Ser i twaróg z jogurtu lub kefiru — jak zrobić w domu | Moja Serowarnia"
    metaDescription="Labneh z jogurtu przez odcedzanie, twaróg z mleka i kefiru, masło z fermentowanej śmietany. Czym ser kwasowy różni się od podpuszczkowego i dlaczego nie dojrzewa."
    breadcrumb={[{ label: "Przepisy", href: "/przepisy" }, { label: "Ser z jogurtu i kefiru" }]}
    related={[
      { label: "Twaróg (ser biały) — pełny przepis z mleka", href: "/przepisy/twarog" },
      { label: "Ricotta — ser z serwatki, ta sama rodzina", href: "/przepisy/ricotta" },
      { label: "Domowy jogurt — zrób najpierw jogurt, potem ser z niego", href: "/przepisy/jogurt-domowy" },
      { label: "Domowy kefir — grzybki tybetańskie albo kefir sklepowy", href: "/przepisy/kefir-domowy" },
      { label: "Serwatka dla zwierząt — co zrobić z tym, co zostaje", href: "/serwatka-dla-zwierzat" },
    ]}
  >
    <FAQSchema faqs={faqData} />
    <HowToSchema
      name="Labneh — serek z jogurtu przez odcedzanie"
      description="Ser kwasowy z jogurtu: posolenie, odcedzanie przez gazę w lodówce, formowanie w kulki."
      totalTime="PT24H"
      datePublished="2026-08-21"
      dateModified="2026-08-21"
      supply={["Jogurt naturalny lub grecki — 1 kg", "Sól — 10 g"]}
      tool={["Sitko", "Gaza serowarska albo pieluszka tetrowa"]}
      steps={krokiLabneh}
    />

    <h2>Czy z jogurtu da się zrobić prawdziwy ser?</h2>
    <p>
      Tak — ale warto od razu powiedzieć, jaki. To będzie <strong>ser kwasowy</strong>, nie podpuszczkowy, a różnica
      jest zasadnicza i decyduje o wszystkim, co można z takim serem potem zrobić.
    </p>
    <p>
      W serze podpuszczkowym enzym tnie kappa-kazeinę i buduje zwięzłą sieć białkową, która zatrzymuje tłuszcz i wodę.
      Taka sieć wytrzymuje miesiące <Glo term="dojrzewanie">dojrzewania</Glo> i pozwala enzymom powoli rozkładać białko
      na związki smakowe. W serze kwasowym białko wytrąca się przy pH około 4,6 — w punkcie izoelektrycznym kazeiny,
      gdzie traci ładunek i przestaje wiązać wodę. Sieć jest luźniejsza, zawiera więcej wody, a wapń w dużej części
      odszedł już z <Glo term="serwatka">serwatką</Glo>.
    </p>
    <p>
      Dlatego sery kwasowe je się świeże: <Link to="/przepisy/twarog">twaróg</Link>,{" "}
      <Link to="/przepisy/ricotta">ricotta</Link>, <Link to="/przepisy/mascarpone">mascarpone</Link> i labneh należą do
      jednej rodziny. To nie gorszy ser — po prostu inny, robiony w godziny zamiast w miesiące.
    </p>

    <h2>Labneh — serek z jogurtu greckiego przez odcedzanie</h2>
    <p>
      Jogurt kupisz albo <Link to="/przepisy/jogurt-domowy">zrobisz sam z litra mleka</Link> — domowy wychodzi gęstszy,
      więc labneh z niego jest wydajniejszy.
    </p>
    <p>Najprostszy ser, jaki można zrobić: potrzebujesz jogurtu, soli i gazy. Bez kultur, bez podpuszczki, bez termometru.</p>
    <ol>
      {krokiLabneh.map((k) => (
        <li key={k.name}>
          <strong>{k.name}</strong> — {k.text}
        </li>
      ))}
    </ol>
    <table>
      <thead>
        <tr><th>Czas odcedzania</th><th>Efekt</th><th>Do czego</th></tr>
      </thead>
      <tbody>
        <tr><td>12 godzin</td><td>gęsta śmietana</td><td>do sosów, jako baza dipów</td></tr>
        <tr><td>24 godziny</td><td>masa do smarowania</td><td>na pieczywo, z oliwą i zaatarem</td></tr>
        <tr><td>48 godzin</td><td>zwięzła, formowalna</td><td>kulki w oliwie</td></tr>
      </tbody>
    </table>
    <p>
      Z kilograma jogurtu wychodzi około <strong>400–500 g labneh</strong>. Reszta to serwatka — nie wylewaj jej, bo ma
      laktozę, białka serwatkowe i potas. Zobacz,{" "}
      <Link to="/serwatka-dla-zwierzat">co można z nią zrobić</Link>.
    </p>
    <div className="not-prose my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-foreground">
      Nie obciążaj masy zbyt mocno, żeby przyspieszyć odcedzanie. Silny nacisk wyciska razem z wodą także tłuszcz i
      serek robi się suchy oraz ziarnisty. Lepiej dać mu czas.
    </div>

    <h2>Twaróg z mleka i kefiru — przepis</h2>
    <p>
      Kefir zastępuje tu kulturę bakteryjną: wystarczy jako zaczyn do ukwaszenia mleka. Jeśli chcesz zrobić kefir sam,
      masz <Link to="/przepisy/kefir-domowy">osobny przepis</Link>.
    </p>
    <ul>
      <li><strong>2 L mleka</strong> świeżego lub pasteryzowanego — nie UHT</li>
      <li><strong>200 ml kefiru</strong> naturalnego z żywymi kulturami</li>
    </ul>
    <p>
      Podgrzej mleko do 22–24°C, wmieszaj kefir, przykryj i zostaw na <strong>12–24 godziny</strong> w temperaturze
      pokojowej. Gdy powstanie zwarty <Glo term="skrzep">skrzep</Glo>, podgrzewaj bardzo powoli w kąpieli wodnej do{" "}
      <strong>38–40°C</strong>, aż ziarno oddzieli się od serwatki. Odstaw na pół godziny, przelej do gazy i odcedzaj
      2–6 godzin.
    </p>
    <div className="not-prose my-6 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-foreground">
      <strong>Nie przekraczaj 40°C.</strong> Powyżej tej temperatury kazeina kurczy się gwałtownie i twaróg wychodzi
      suchy oraz gumowaty — tego już nie da się odwrócić.
    </div>
    <p>
      Metoda jest identyczna jak przy <Link to="/przepisy/twarog">twarogu ze zsiadłego mleka</Link>, różni się smak.
      Kefir prowadzi fermentację drożdżowo-mlekową, więc twaróg wychodzi bardziej złożony, z lekką nutą drożdżową.
    </p>

    <h2>Masło z jogurtu greckiego</h2>
    <p>Tu potrzebne jest uczciwe zastrzeżenie, bo w sieci krąży ten przepis w wersji, która nie zadziała.</p>
    <p>
      <strong>Z typowego jogurtu greckiego masła nie zrobisz.</strong> Ma on 2–10% tłuszczu, a do ubicia masła potrzeba
      co najmniej 30% — czyli śmietany. Ubijanie jogurtu o niskiej zawartości tłuszczu da rozwodnioną masę i nic więcej.
    </p>
    <p>
      Co działa naprawdę: <strong>fermentowana śmietana</strong>. Wymieszaj 500 ml śmietany 30–36% z 2 łyżkami jogurtu
      naturalnego, zostaw na 12–18 godzin w temperaturze pokojowej, potem schłodź i ubijaj mikserem, aż tłuszcz oddzieli
      się od maślanki — zwykle 5–10 minut. Odsącz, przepłucz zimną wodą i wygnieć resztę maślanki.
    </p>
    <p>
      To jest masło kwaśne (<em>cultured butter</em>) — wyraźniejsze w smaku od słodkiego, bo bakterie wytworzyły
      diacetyl, ten sam związek, który odpowiada za maślany aromat w serach z kulturami typu LD. Maślanki po ubijaniu
      nie wylewaj: świetnie sprawdza się w naleśnikach i chlebie.
    </p>

    <h2>Czym różni się ser kwasowy od podpuszczkowego?</h2>
    <table>
      <thead>
        <tr><th>&nbsp;</th><th>Ser kwasowy</th><th>Ser podpuszczkowy</th></tr>
      </thead>
      <tbody>
        <tr><th>Co ścina mleko</th><td>kwas mlekowy z bakterii</td><td>enzym — <Glo term="podpuszczka">podpuszczka</Glo></td></tr>
        <tr><th>pH przy <Glo term="koagulacja">koagulacji</Glo></th><td>ok. 4,6</td><td>ok. 6,2–6,5</td></tr>
        <tr><th>Wapń</th><td>odchodzi z serwatką</td><td>zostaje w skrzepie</td></tr>
        <tr><th>Struktura</th><td>luźna, dużo wody</td><td>zwięzła, elastyczna</td></tr>
        <tr><th>Dojrzewanie</th><td>nie dojrzewa</td><td>od tygodni do lat</td></tr>
        <tr><th>Przykłady</th><td>twaróg, labneh, ricotta, mascarpone</td><td>gouda, cheddar, camembert, parmezan</td></tr>
      </tbody>
    </table>
    <p>
      Ta różnica ma praktyczne konsekwencje poza kuchnią. Twaróg ma około <strong>90–100 mg wapnia</strong> na 100 g, a
      gouda ponad <strong>700 mg</strong> — właśnie dlatego, że kwas rozpuszcza koloidalny fosforan wapnia i wapń ucieka
      z serwatką. To też powód, dla którego do domowego{" "}
      <Link to="/przepisy/ser-topiony">sera topionego z twarogu</Link> wystarczy soda oczyszczona, a przy serze
      dojrzewającym potrzeba soli emulgujących.
    </p>

    <div className="not-prose my-8 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 p-5">
      <h2 className="mt-0 mb-3 text-lg font-display font-bold text-foreground">Co dalej? Sery podpuszczkowe krok dalej</h2>
      <p className="text-sm mb-3">
        Jeśli labneh i twaróg wyszły, kolejnym krokiem jest ser podpuszczkowy — i wbrew pozorom nie jest to duży skok.
        Potrzebujesz dwóch rzeczy, których tu nie było: kultury bakteryjnej dobranej do typu sera i podpuszczki.
      </p>
      <ul className="space-y-2 text-sm">
        <li><strong>Najprostszy ser podpuszczkowy</strong> — <Link to="/przepisy/mozzarella" className="text-primary hover:underline">mozzarella</Link>, gotowa tego samego wieczora, bez dojrzewalni.</li>
        <li><strong>Ser z serwatki</strong> — <Link to="/przepisy/ricotta" className="text-primary hover:underline">ricotta</Link> powstaje z tego, co zostaje po innych serach.</li>
        <li><strong>Jaką kulturę wybrać</strong> — <Link to="/baza-kultur" className="text-primary hover:underline">baza kultur</Link> z dawkowaniem i temperaturami pracy.</li>
        <li><strong>Ile podpuszczki dodać</strong> — <Link to="/sila-podpuszczki" className="text-primary hover:underline">siła podpuszczki i flokulacja</Link>, bo dawkę liczy się od IMCU, nie od objętości.</li>
        <li><strong>Wszystkie przepisy</strong> — <Link to="/przepisy" className="text-primary hover:underline">sery krok po kroku</Link>, od świeżych po dojrzewające latami.</li>
      </ul>
    </div>

    <h2>Najczęstsze pytania</h2>
    {faqData.map((f) => (
      <div key={f.question}>
        <h3>{f.question}</h3>
        <p>{f.answer}</p>
      </div>
    ))}
  </KulturaGuideLayout>
);

export default SerZJogurtu;
