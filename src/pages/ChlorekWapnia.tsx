import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import { Link } from "react-router-dom";
import { FlaskConical } from "lucide-react";

const faqData = [
  {
    question: "Ile chlorku wapnia na 1 litr mleka?",
    answer:
      "0,1–0,2 g czystego (bezwodnego) CaCl₂ na litr mleka pasteryzowanego. W praktyce: 0,3–0,6 ml roztworu 33% albo 0,15–0,25 g proszku dwuwodnego na litr. Granica technologiczna to 0,02% masy mleka, czyli 0,2 g czystego CaCl₂ na litr — powyżej niej ser zaczyna gorzknieć.",
  },
  {
    question: "Chlorek wapnia dodaje się do sera czy do mleka?",
    answer:
      "Do mleka, zawsze przed podpuszczką. Do gotowego sera nie dodaje się go nigdy — nie miałby jak zadziałać, bo jego rolą jest przygotowanie mleka do krzepnięcia. Zapytanie o dozowanie chlorku wapnia do sera dotyczy w rzeczywistości dozowania do mleka, z którego ten ser powstanie.",
  },
  {
    question: "W którym momencie dodać chlorek wapnia do mleka?",
    answer:
      "Po pasteryzacji i schłodzeniu mleka do temperatury krzepnięcia, razem z kulturą bakteryjną lub tuż po niej — a przed podpuszczką. Zostaw co najmniej 20 minut między chlorkiem a podpuszczką, żeby wapń zdążył się rozprowadzić. Nigdy nie dodawaj obu naraz.",
  },
  {
    question: "Co daje chlorek wapnia dodany do mleka pasteryzowanego?",
    answer:
      "Przywraca jony wapnia, które pasteryzacja przeniosła do nierozpuszczalnego fosforanu wapnia. Bez nich podpuszczka pracuje wolniej, skrzep jest miękki i rozpada się przy krojeniu, a część białka ucieka z serwatką. Z chlorkiem skrzep jest zwięzły, flokulacja szybsza, a wydajność zwykle o 1–2% wyższa.",
  },
  {
    question: "Czy chlorek wapnia jest potrzebny do mleka surowego?",
    answer:
      "Zwykle nie. Mleko prosto od krowy ma jony wapnia nienaruszone i krzepnie dobrze samo. Warto go rozważyć dopiero przy mleku z późnej laktacji, mocno schłodzonym albo długo przechowywanym — tam wapń też bywa mniej dostępny.",
  },
  {
    question: "Czy chlorek wapnia uratuje mleko UHT?",
    answer:
      "Nie. Przy UHT problemem nie jest sam wapń, tylko zdenaturowana beta-laktoglobulina, która łączy się z kappa-kazeiną i blokuje działanie podpuszczki. Chlorek wapnia poprawi sytuację odrobinę, ale skrzepu nadającego się na ser i tak nie będzie.",
  },
  {
    question: "Co się stanie, jeśli dodam za dużo chlorku wapnia?",
    answer:
      "Ser robi się gorzki, z metalicznym posmakiem, a skrzep bywa twardy i kruchy — źle się skleja i trudno go sformować. Nadmiaru nie da się odwrócić, dlatego przy wątpliwościach lepiej dać mniej.",
  },
  {
    question: "Czy chlorek wapnia jest szkodliwy dla zdrowia?",
    answer:
      "Nie w dawce używanej do sera. To dodatek do żywności E509 dopuszczony w UE, a EFSA w ponownej ocenie z 2019 roku uznała, że w ilościach stosowanych w żywności nie budzi obaw. Uważać trzeba na stężony chlorek przed rozcieńczeniem, bo drażni oczy i skórę. Do sera używaj tylko chlorku spożywczego, nigdy z pochłaniacza wilgoci ani soli do odladzania.",
  },
  {
    question: "Czy chlorek wapnia zwiększa ilość wapnia w serze?",
    answer:
      "Niewiele. 0,1–0,2 g CaCl₂ na litr to 36–72 mg wapnia przy 1100–1200 mg, które mleko ma samo. Nawet gdyby cały został w serze, 100 g goudy miałoby najwyżej około 70 mg wapnia więcej przy około 700 mg. Dużo więcej zmienia rodzaj sera: twaróg ma około 90 mg wapnia w 100 g, gouda około 700 mg, parmezan około 1180 mg.",
  },
];

const Glo = ({ term, children }: { term: string; children: string }) => (
  <a href={`/slownik.html#${term}`} target="_blank" rel="noopener noreferrer" className="decoration-dotted underline-offset-2">
    {children}
  </a>
);

const ChlorekWapnia = () => (
  <KulturaGuideLayout
    icon={FlaskConical}
    title="Chlorek wapnia do sera — ile dodać do mleka i w którym momencie"
    subtitle="Chlorek wapnia (CaCl₂, E509) przywraca mleku pasteryzowanemu zdolność do tworzenia zwięzłego skrzepu. Poniżej dawki w trzech postaciach, moment dodania, wpływ na zdrowie i najczęstsze nieporozumienie: to dodatek do mleka, nie do sera."
    metaTitle="Chlorek wapnia do sera — ile na litr mleka i kiedy dodać | Moja Serowarnia"
    metaDescription="Ile chlorku wapnia na litr mleka: 0,1–0,2 g czystego CaCl₂, 0,3–0,6 ml roztworu 33% lub 0,15–0,25 g proszku. Kiedy dodać, kiedy pominąć i czy szkodzi zdrowiu."
    breadcrumb={[{ label: "Poradniki", href: "/poradniki" }, { label: "Chlorek wapnia" }]}
    related={[
      { label: "Siła podpuszczki i flokulacja", href: "/sila-podpuszczki" },
      { label: "Mleko do sera — skład i wydajność", href: "/mleko-do-sera" },
      { label: "Solenie sera — solanka i solenie suche", href: "/solenie-sera" },
      { label: "Nieudany ser — ratować czy wyrzucić", href: "/nieudany-ser" },
      { label: "Kalkulator solanki", href: "/kalkulator-solanki" },
    ]}
  >
    <FAQSchema faqs={faqData} />

    <div className="not-prose my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 text-foreground">
      <strong>Najkrócej:</strong> <strong>0,1–0,2 g czystego CaCl₂ na litr mleka</strong> (albo 0,3–0,6 ml roztworu 33%),
      dodane <strong>do mleka</strong> po pasteryzacji, razem z kulturą i co najmniej 20 minut przed podpuszczką.
      Do mleka surowego zwykle niepotrzebny. Mleka UHT nie uratuje. Zdrowiu w tej dawce nie szkodzi, a wapnia w serze
      dokłada niewiele (więcej <a href="#zdrowie">niżej</a>).
    </div>

    <h2>Chlorek wapnia dodaje się do mleka, nie do sera</h2>
    <p>
      To najczęstsze nieporozumienie i warto je rozstrzygnąć od razu, bo zmienia cały sposób myślenia o tym dodatku.
      Chlorek wapnia <strong>nie jest składnikiem sera</strong> ani niczym, co się do sera dosypuje. Jest{" "}
      <strong>przygotowaniem mleka</strong> — trafia do kadzi, zanim w ogóle powstanie skrzep, i po zakończeniu
      produkcji jego rola jest już skończona.
    </p>
    <p>
      Wynika to z tego, co robi. Chlorek wapnia odbudowuje pulę jonów wapnia, których podpuszczka potrzebuje do
      zbudowania sieci białkowej. Jeśli skrzep już powstał, nie ma czego naprawiać — a dosypanie chlorku do gotowej
      masy dałoby wyłącznie gorzki, metaliczny posmak.
    </p>
    <p className="text-muted-foreground">
      Jedyny wyjątek, w którym chlorek wapnia styka się z gotowym serem, to <strong>solanka</strong> — ale tam pełni
      zupełnie inną funkcję. Wracamy do tego <a href="#solanka">niżej</a>.
    </p>

    <h2>Ile chlorku wapnia na litr mleka?</h2>
    <p>
      Dawka zależy od tego, <strong>w jakiej postaci</strong> masz chlorek — i to jest źródło większości rozbieżności
      między przepisami. Te same 0,2 g znaczą co innego dla proszku bezwodnego, proszku dwuwodnego i roztworu.
    </p>
    <table>
      <thead>
        <tr><th>Postać</th><th>Na 1 L mleka</th><th>Na 10 L</th><th>Na 50 L</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>CaCl₂ bezwodny</strong> (czysty)</td>
          <td>0,1–0,2 g</td><td>1–2 g</td><td>5–10 g</td>
        </tr>
        <tr>
          <td><strong>Proszek dwuwodny</strong> (CaCl₂·2H₂O — najczęstszy w sklepach)</td>
          <td>0,15–0,25 g</td><td>1,5–2,5 g</td><td>7–13 g</td>
        </tr>
        <tr>
          <td><strong>Roztwór 33%</strong></td>
          <td>0,3–0,6 ml</td><td>3–6 ml</td><td>15–30 ml</td>
        </tr>
      </tbody>
    </table>
    <p>
      Proszek dwuwodny to ta sama sól związana z wodą krystalizacyjną — zawiera około{" "}
      <strong>75% czystego CaCl₂</strong>, więc trzeba go odważyć mniej więcej o jedną trzecią więcej, żeby wyszło na to
      samo. Jeśli na opakowaniu nie ma informacji o postaci, przyjmij dwuwodny: w sprzedaży detalicznej jest zdecydowanie
      częstszy.
    </p>
    <div className="not-prose my-6 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-foreground">
      <strong>Górna granica: 0,02% masy mleka</strong>, czyli 0,2 g czystego CaCl₂ na litr. To nie jest granica
      z ostrożności — powyżej niej ser zaczyna gorzknieć, a skrzep robi się kruchy. Więcej chlorku nie daje
      zwięźlejszego sera, tylko gorszy.
    </div>
    <p>
      <strong>Zawsze rozcieńcz przed dodaniem</strong> — w mniej więcej dziesięciokrotnej ilości chłodnej,
      przegotowanej wody. Chlorek wapnia wlany bezpośrednio ścina białko w miejscu kontaktu i zostawia w mleku drobne
      kłaczki, które potem trafiają do <Glo term="serwatka">serwatki</Glo>.
    </p>

    <h2>W którym momencie dodać chlorek wapnia?</h2>
    <p>Kolejność ma znaczenie i sprowadza się do jednej zasady: chlorek przed podpuszczką, z odstępem.</p>
    <ol>
      <li><strong>Pasteryzacja</strong> i schłodzenie mleka do temperatury krzepnięcia.</li>
      <li><strong>Kultura bakteryjna</strong> — rozsypana, zrehydratowana, wmieszana.</li>
      <li><strong>Chlorek wapnia</strong> — rozcieńczony, wmieszany dokładnie. Razem z kulturą albo tuż po niej.</li>
      <li><strong>Odczekaj co najmniej 20 minut</strong>, żeby wapń rozprowadził się w całej objętości.</li>
      <li><strong>Podpuszczka</strong> — również rozcieńczona, wmieszana krótko, potem mleko zostawiasz w spokoju.</li>
    </ol>
    <div className="not-prose my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-foreground">
      <strong>Nigdy nie dodawaj chlorku i podpuszczki jednocześnie</strong> ani nie mieszaj ich w jednym naczyniu do
      rozcieńczania. Stężony roztwór chlorku obniża skuteczność enzymu, a efekt zobaczysz dopiero po czasie — jako
      skrzep, który nie chce dojść.
    </div>

    <h2>Po co w ogóle chlorek wapnia? Co pasteryzacja robi z wapniem</h2>
    <p>
      W mleku surowym wapń występuje w dwóch pulach: rozpuszczonej (jony Ca²⁺) i związanej w micelach kazeinowych jako
      koloidalny fosforan wapnia. <Glo term="podpuszczka">Podpuszczka</Glo> potrzebuje tej pierwszej — jony wapnia
      sklejają odsłonięte fragmenty kazeiny w sieć, która zatrzymuje tłuszcz i wodę.
    </p>
    <p>
      Podgrzanie mleka przesuwa równowagę: część wapnia rozpuszczonego przechodzi w formę koloidalną i przestaje być
      dostępna. Przy pasteryzacji 72°C/15 s zmiana jest częściowo odwracalna, ale nie natychmiast — mleko potrzebowałoby
      wielu godzin, żeby wrócić do stanu wyjściowego. Dlatego wapń uzupełnia się z zewnątrz.
    </p>
    <p>Praktycznie widać to jako:</p>
    <table>
      <thead>
        <tr><th>Bez chlorku (mleko pasteryzowane)</th><th>Z chlorkiem</th></tr>
      </thead>
      <tbody>
        <tr><td>flokulacja wolniejsza, czasem wcale</td><td>czas flokulacji wraca do normy</td></tr>
        <tr><td><Glo term="skrzep">skrzep</Glo> miękki, rozpada się przy krojeniu</td><td>skrzep zwięzły, czysto się kroi</td></tr>
        <tr><td>dużo drobin białka w serwatce (serwatka mętna)</td><td>serwatka klarowniejsza</td></tr>
        <tr><td>niższa wydajność</td><td>zwykle o 1–2% wyższa wydajność</td></tr>
      </tbody>
    </table>
    <p>
      Ile podpuszczki dobrać do tak przygotowanego mleka — w osobnym poradniku o{" "}
      <Link to="/sila-podpuszczki">sile podpuszczki i flokulacji</Link>.
    </p>

    <h2>Kiedy chlorku wapnia nie dodawać</h2>
    <p>
      <strong>Mleko surowe</strong> — zwykle nie potrzebuje. Jony wapnia są nienaruszone i skrzep powstaje prawidłowo
      sam. Warto rozważyć dodatek dopiero przy mleku z późnej laktacji, długo przechowywanym albo mocno schłodzonym,
      bo tam dostępność wapnia też spada.
    </p>
    <p>
      <strong>Mleko UHT</strong> — chlorek go nie uratuje i to warto wiedzieć, zanim zmarnujesz surowiec. Problemem
      nie jest sam wapń, tylko zdenaturowana beta-laktoglobulina, która łączy się z kappa-kazeiną i fizycznie blokuje
      miejsce, w które powinna trafić podpuszczka. Dodatek wapnia poprawi sytuację odrobinę, ale zwięzłego skrzepu i
      tak nie będzie.
    </p>
    <p className="text-muted-foreground">
      Ciekawostka na marginesie: przy <Link to="/przepisy/jogurt-domowy">jogurcie</Link> ta sama zdenaturowana
      beta-laktoglobulina <strong>pomaga</strong> — bo tam koagulacja jest kwasowa i białko wiąże wodę zamiast blokować
      enzym. Dlatego z mleka UHT wyjdzie dobry jogurt, choć nie wyjdzie ser podpuszczkowy.
    </p>
    <p>
      <strong>Sery kwasowe</strong> — twaróg, ricotta, labneh. Tam nie ma podpuszczki, więc nie ma czego wspomagać.
      Więcej w przepisie na <Link to="/przepisy/ser-z-jogurtu">ser i twaróg z jogurtu lub kefiru</Link>.
    </p>

    <h2>Co się stanie przy przedawkowaniu?</h2>
    <table>
      <thead>
        <tr><th>Objaw</th><th>Dlaczego</th></tr>
      </thead>
      <tbody>
        <tr><td>Gorzki, metaliczny posmak</td><td>nadmiar jonów wapnia i chlorkowych zostaje w masie serowej</td></tr>
        <tr><td>Skrzep twardy i kruchy</td><td>zbyt gęste usieciowanie białka — ziarno się nie skleja</td></tr>
        <tr><td>Ser się nie formuje, rozpada</td><td>ziarno straciło plastyczność potrzebną do zrastania</td></tr>
        <tr><td>Mętne kłaczki w mleku po dodaniu</td><td>chlorek dodany bez rozcieńczenia, punktowo ściął białko</td></tr>
      </tbody>
    </table>
    <p>
      Żadnego z tych efektów nie da się cofnąć — wapnia nie wyjmiesz z mleka. Przy niepewności dawkuj po dolnej granicy
      i obserwuj czas flokulacji: jeśli mieści się w normie, chlorku jest dość.
    </p>

    <h2 id="zdrowie">Chlorek wapnia a zdrowie: szkodzi czy pomaga?</h2>
    <p>
      Krótko: w dawce do sera <strong>nie szkodzi i niewiele dodaje</strong>. To substancja pomocnicza, dzięki której
      mleko pasteryzowane dobrze się ścina, a nie suplement wapnia. Chlorek wapnia jest dodatkiem do żywności E509
      dopuszczonym w Unii Europejskiej. Europejski Urząd ds. Bezpieczeństwa Żywności (EFSA) ocenił go ponownie
      w 2019 roku razem z innymi chlorkami i uznał, że w ilościach stosowanych w żywności nie budzi obaw
      o bezpieczeństwo.
    </p>

    <h3>Ile wapnia chlorek dodaje do sera</h3>
    <p>
      W 0,1–0,2 g czystego CaCl₂ jest <strong>36–72 mg wapnia</strong>. Litr mleka ma go sam z siebie około
      1100–1200 mg, więc chlorek powiększa zapas wapnia w garnku o 3–6%. Do sera trafia z tego tylko część, reszta
      odpływa z <Glo term="serwatka">serwatką</Glo>.
    </p>
    <p>
      Rachunek dla goudy: z 10 litrów mleka wychodzi około 1 kg sera, więc 100 g sera powstaje z mniej więcej litra
      mleka. Nawet gdyby cały dodany wapń został w serze, 100 g goudy miałoby najwyżej około 70 mg wapnia więcej, przy
      około 700 mg, które ma i bez chlorku. Na plaster 30 g wypada najwyżej około 20 mg, czyli 2% dziennej normy
      dorosłego (1000 mg). Sam plaster daje około 210 mg, z chlorkiem czy bez.
    </p>

    <h3>Więcej wapnia daje wybór sera niż chlorek</h3>
    <p>
      Ile wapnia jest w serze, decyduje przede wszystkim sposób krzepnięcia. Przy podpuszczce wapń zostaje związany
      w sieci białka i trafia do sera. Przy krzepnięciu kwasowym kwas rozpuszcza fosforan wapnia z białka i większość
      wapnia odpływa z serwatką. Ogólna zasada: im bardziej zakwaszony skrzep w chwili odciekania serwatki i im więcej
      wody w serze, tym mniej w nim wapnia.
    </p>
    <table>
      <thead>
        <tr><th>Ser</th><th>Jak krzepnie</th><th>Wapń w 100 g</th></tr>
      </thead>
      <tbody>
        <tr><td>Twaróg</td><td>kwasowo</td><td>ok. 90 mg</td></tr>
        <tr><td>Camembert</td><td>podpuszczka i długie zakwaszanie, dużo wody</td><td>ok. 390 mg</td></tr>
        <tr><td>Mozzarella</td><td>podpuszczka, skrzep zakwaszony przed parzeniem</td><td>ok. 500 mg</td></tr>
        <tr><td>Gouda</td><td>podpuszczka</td><td>ok. 700 mg</td></tr>
        <tr><td>Emmental</td><td>podpuszczka, ziarno mocno dogrzewane, mało wody</td><td>ok. 1000 mg</td></tr>
        <tr><td>Parmezan</td><td>podpuszczka, ziarno mocno dogrzewane, bardzo mało wody</td><td>ok. 1180 mg</td></tr>
      </tbody>
    </table>
    <p>
      Wartości jak w naszej <Link to="/porownanie-wartosci-odzywczych">porównywarce wartości odżywczych serów</Link>.
      Komu zależy na wapniu, ten sięga po ser twardy podpuszczkowy. Chlorek wapnia tej różnicy nie robi, a do twarogu
      w ogóle się go nie dodaje.
    </p>

    <h3>Plusy</h3>
    <ul>
      <li>
        <strong>Pozwala zrobić dobry ser z mleka pasteryzowanego.</strong> Pasteryzacja zabija bakterie chorobotwórcze
        z surowego mleka, takie jak listeria czy groźne szczepy E. coli. To ważne zwłaszcza dla kobiet w ciąży, małych
        dzieci i osób starszych. To największy, choć pośredni, zysk dla zdrowia.
      </li>
      <li>
        <strong>Dodaje trochę wapnia, a nie dodaje sodu.</strong> Jonów chlorkowych wnosi wielokrotnie mniej niż sól,
        którą ten sam ser jest solony.
      </li>
      <li>
        <strong>Nie da się nim przekroczyć bezpiecznej ilości wapnia.</strong> Górny bezpieczny poziom dla dorosłych EFSA
        ustaliła na 2500 mg wapnia dziennie, a chlorek dokłada najwyżej kilkadziesiąt miligramów na 100 g sera.
      </li>
    </ul>

    <h3>Minusy i na co uważać</h3>
    <ul>
      <li>
        <strong>Stężony chlorek drażni oczy i skórę.</strong> Dotyczy proszku i roztworu przed rozcieńczeniem: na
        opakowaniu jest zwykle ostrzeżenie H319 (działa drażniąco na oczy). Proszek grzeje się przy rozpuszczaniu, więc
        wsypuj go do zimnej wody, a nie zalewaj wodą. Trzymaj opakowanie z dala od dzieci. W mleku, rozcieńczony do
        0,02%, nie ma już tych właściwości.
      </li>
      <li>
        <strong>Tylko chlorek spożywczy (E509).</strong> Chlorek z pochłaniaczy wilgoci, do odladzania chodników czy do
        betonu to ten sam związek chemiczny, ale bez gwarancji czystości. Dla wersji spożywczej przepisy UE ustalają
        limity ołowiu, arsenu i rtęci, dla technicznej nie.
      </li>
      <li>
        <strong>Przedawkowanie psuje smak dużo wcześniej, niż mogłoby zaszkodzić.</strong> Ser z nadmiarem chlorku jest
        gorzki i niesmaczny, ale przy zwykłym jedzeniu nie jest groźny.
      </li>
      <li>
        <strong>Przy diecie z ograniczeniem wapnia liczy się cały ser.</strong> Jeśli lekarz zalecił mniej wapnia,
        chlorek dokłada najwyżej kilkadziesiąt miligramów na 100 g sera. W takiej diecie ser z chlorkiem i bez to
        praktycznie to samo; liczy się, ile i jakiego sera jesz.
      </li>
    </ul>
    <p className="text-sm text-muted-foreground">
      Źródła:{" "}
      <a href="https://doi.org/10.2903/j.efsa.2019.5751" target="_blank" rel="noopener noreferrer">
        EFSA, ponowna ocena chlorków E507, E508, E509 i E511 (2019)
      </a>
      ;{" "}
      <a
        href="https://ncez.pzh.gov.pl/wp-content/uploads/2021/03/normy_zywienia_2020web.pdf"
        target="_blank"
        rel="noopener noreferrer"
      >
        Normy żywienia dla populacji Polski (NIZP PZH, 2020)
      </a>
      ; specyfikacja E509 w rozporządzeniu Komisji (UE) nr 231/2012.
    </p>

    <h2 id="solanka">Chlorek wapnia do solanki to zupełnie co innego</h2>
    <p>
      Chlorek wapnia pojawia się w serowarstwie w drugim, całkiem niezwiązanym miejscu — w{" "}
      <Glo term="solanka">solance</Glo>. Dawka jest tam wyższa (<strong>1–2 g na litr solanki</strong>), a cel odwrotny:
      świeża solanka jest uboga w wapń, więc wyciąga go ze skórki sera i powierzchnia rozmięka oraz robi się śliska.
      Chlorek wyrównuje to stężenie.
    </p>
    <p>
      To jedyny przypadek, w którym chlorek wapnia rzeczywiście styka się z gotowym serem — i nawet wtedy nie jest
      dodawany „do sera", tylko do kąpieli, w której ser leży. Szczegóły i przeliczenia w{" "}
      <Link to="/kalkulator-solanki">kalkulatorze solanki</Link> oraz w poradniku o{" "}
      <Link to="/solenie-sera">soleniu sera</Link>.
    </p>

    <h2>Najczęstsze pytania o chlorek wapnia</h2>
    {faqData.map((f) => (
      <div key={f.question}>
        <h3>{f.question}</h3>
        <p>{f.answer}</p>
      </div>
    ))}
  </KulturaGuideLayout>
);

export default ChlorekWapnia;
