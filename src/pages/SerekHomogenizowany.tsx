import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import HowToSchema from "@/components/HowToSchema";
import { Link } from "react-router-dom";
import { Milk } from "lucide-react";

const faqData = [
  {
    question: "Czym serek homogenizowany różni się od twarogu?",
    answer:
      "Punktem wyjścia jest ten sam twaróg kwasowy. Różnica polega na dwóch rzeczach: dodaniu śmietanki i na homogenizacji, czyli przeciśnięciu masy pod wysokim ciśnieniem przez wąskie szczeliny. Rozbija to ziarno twarogu i krople tłuszczu, przez co produkt staje się gładki i przestaje się rozwarstwiać. Serek homogenizowany zalicza się do serów twarogowo-kwasowych niedojrzewających.",
  },
  {
    question: "Dlaczego domowy serek smakuje inaczej niż sklepowy?",
    answer:
      "Bo ma zupełnie inny skład. Serek waniliowy typu Danio deklaruje na 100 g: 5,5 g białka, 3,4 g tłuszczu i 10,9 g cukrów. Domowy z 500 g twarogu, 100 g śmietanki i 50 g cukru wychodzi na około 12 g białka przy podobnej ilości cukru — czyli ma go ponad dwa razy więcej. Stąd wrażenie, że domowy jest gęstszy i bardziej serowy, a sklepowy lżejszy i słodszy.",
  },
  {
    question: "Ile wody jest w przemysłowym serku homogenizowanym?",
    answer:
      "Woda jest trzecim składnikiem na etykiecie, zaraz po twarogu odtłuszczonym i śmietance. Z bilansu deklarowanych wartości odżywczych wychodzi, że aby uzyskać 5,5 g białka i 3,4 g tłuszczu na 100 g, potrzeba około 29 g twarogu chudego i 11 g śmietanki 30%. Razem z dodanym cukrem daje to mniej więcej połowę masy produktu — reszta to woda. To nasze wyliczenie, a nie receptura producenta, ale kolejność składników na etykiecie je potwierdza.",
  },
  {
    question: "Czy do domowego serka potrzebny jest homogenizator?",
    answer:
      "Nie. Blender kielichowy albo ręczny plus przetarcie przez drobne sito dają konsystencję bardzo bliską sklepowej. Różnica ujawnia się dopiero po dobie: domowy serek może puścić odrobinę serwatki, bo nie przeszedł homogenizacji pod ciśnieniem i nie ma skrobi, która w produkcie przemysłowym trzyma wodę.",
  },
  {
    question: "Dlaczego domowy serek się rozwarstwia i jak temu zapobiec?",
    answer:
      "Serwatka wychodzi z trzech powodów: słabo odsączony twaróg, za krótkie blendowanie i brak stabilizatora. Dwa pierwsze załatwia technika. Trzeci można naśladować tak, jak robi to przemysł: zagotuj łyżeczkę skrobi kukurydzianej ze 100 ml mleka, ostudź całkowicie i dodaj do masy. Bez skrobi serek jest jak najbardziej dobry, tylko trzeba go zjeść w ciągu dwóch, trzech dni.",
  },
  {
    question: "Jak długo można przechowywać domowy serek homogenizowany?",
    answer:
      "Trzy do czterech dni w lodówce, w zamkniętym pojemniku. To świeży produkt bez konserwantów, a dodatek cukru i owoców raczej skraca ten czas, niż go wydłuża. Nie mrozi się go — po rozmrożeniu masa traci gładkość, czyli dokładnie to, po co się ją robiło.",
  },
];

const kroki = [
  {
    name: "Odsącz twaróg porządnie",
    text: "Użyj twarogu z kultury mezofilnej, dobrze odsączonego. Im mniej serwatki zostanie w skrzepie, tym mniejsze ryzyko, że gotowy serek ją potem puści.",
  },
  {
    name: "Zblenduj ze śmietanką",
    text: "Połącz twaróg ze śmietanką i blenduj 2–3 minuty, robiąc przerwy, żeby masa się nie zagrzała. To zastępuje przemysłową homogenizację.",
  },
  {
    name: "Dosłodź i doprowadź konsystencję",
    text: "Dodaj cukier lub miód, potem mleko po łyżce, aż masa będzie gęsta i gładka. Cukier dopiero po zblendowaniu — wcześniej rozrzedza masę i trudno ocenić gęstość.",
  },
  {
    name: "Przetrzyj przez sito",
    text: "Jeśli wyczuwasz ziarno, przetrzyj masę przez drobne sito. Domowy blender nie osiąga ciśnienia homogenizatora, więc sito robi ostatni krok.",
  },
  {
    name: "Schłodź minimum 2 godziny",
    text: "Serek gęstnieje dopiero przy chłodzeniu. Ocenianie konsystencji zaraz po blendowaniu wprowadza w błąd.",
  },
];

const SerekHomogenizowany = () => (
  <KulturaGuideLayout
    icon={Milk}
    title="Serek homogenizowany — domowy przepis i skład tego ze sklepu"
    subtitle="Ten sam twaróg, który robisz na co dzień, plus śmietanka i blender. Poniżej proporcje, sposób na gładkość bez homogenizatora oraz wyliczenie, co naprawdę siedzi w serku przemysłowym — bo to tłumaczy, dlaczego domowy smakuje inaczej."
    metaTitle="Serek homogenizowany — domowy przepis i skład przemysłowego | Moja Serowarnia"
    metaDescription="Domowy serek homogenizowany z własnego twarogu: proporcje, blendowanie zamiast homogenizatora i wyliczony skład serka typu Danio — z etykiety wychodzi około połowy wody."
    breadcrumb={[{ label: "Przepisy", href: "/przepisy" }, { label: "Serek homogenizowany" }]}
    related={[
      { label: "Twaróg — baza tego przepisu", href: "/przepisy/twarog" },
      { label: "Ser i twaróg z jogurtu", href: "/przepisy/ser-z-jogurtu" },
      { label: "Baza kultur — kultury mezofilne", href: "/baza-kultur?type=mezofilne" },
      { label: "Wszystkie przepisy", href: "/przepisy" },
      { label: "RHD — sprzedaż i dokumentacja", href: "/prawo/rhd" },
    ]}
  >
    <FAQSchema faqs={faqData} />
    <HowToSchema
      name="Domowy serek homogenizowany"
      description="Serek homogenizowany z własnego twarogu i śmietanki: odsączenie skrzepu, blendowanie do gładkości, dosłodzenie i schłodzenie."
      totalTime="PT30M"
      datePublished="2026-08-23"
      dateModified="2026-08-23"
      supply={[
        "Twaróg chudy lub półtłusty — 500 g",
        "Śmietanka 30% — 100 g",
        "Cukier lub miód — 40–55 g",
        "Mleko — 80–120 ml do konsystencji",
      ]}
      tool={["Blender kielichowy albo ręczny", "Sito o drobnych oczkach"]}
      steps={kroki}
    />

    <h2>Czym właściwie jest serek homogenizowany</h2>
    <p>
      To <strong>ser twarogowo-kwasowy niedojrzewający</strong>: twaróg z mleka odtłuszczonego, uszlachetniony
      śmietanką i przepuszczony przez homogenizator — urządzenie, które przeciska masę pod wysokim ciśnieniem przez
      wąskie szczeliny. Rozbija to ziarno twarogu i krople tłuszczu, dzięki czemu produkt jest gładki i nie
      rozwarstwia się.
    </p>
    <p>
      W domu takiego ciśnienia nie masz, ale nie jest konieczne: <strong>blender plus drobne sito</strong> dają
      konsystencję bardzo blisko sklepowej. Różnica ujawnia się dopiero po dobie — o tym niżej.
    </p>

    <h2>Skład serka ze sklepu — policzony z etykiety</h2>
    <p>
      Popularny serek waniliowy typu Danio deklaruje na 100 g: <strong>5,5 g białka, 3,4 g tłuszczu, 10,9 g
      cukrów</strong> i 101 kcal. Skład: twaróg odtłuszczony, śmietanka, <strong>woda</strong>, cukier, skrobia
      kukurydziana, wapń, sok z cytryny, aromaty, witamina D.
    </p>
    <p>
      Z tych liczb da się odtworzyć proporcje. Żeby uzyskać 5,5 g białka i 3,4 g tłuszczu na 100 g produktu, potrzeba
      mniej więcej <strong>29 g twarogu chudego i 11 g śmietanki 30%</strong>. Doliczając około 10 g cukru, składniki
      mleczne z cukrem dają razem połowę masy.
    </p>

    <div className="not-prose my-6 border-l-4 border-primary bg-secondary p-4 text-foreground">
      <p className="mt-0 mb-2">
        <strong>Druga połowa to woda.</strong> To nie zarzut — tak się ten produkt projektuje, żeby był lekki, tani
        i łatwy do jedzenia łyżeczką. Ale wyjaśnia, dlaczego domowy serek z samego twarogu smakuje „mocniej": ma{" "}
        <strong>ponad dwa razy więcej białka</strong>.
      </p>
      <p className="mb-0 text-sm text-muted-foreground">
        Zastrzeżenie: to nasze wyliczenie z deklarowanych wartości odżywczych, a nie receptura producenta.
        Potwierdza je jednak kolejność składników na etykiecie, gdzie woda stoi na trzecim miejscu.
      </p>
    </div>

    <h2>Składniki na około 750 g</h2>
    <table>
      <thead>
        <tr><th>Składnik</th><th>Ilość</th><th>Po co</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><Link to="/przepisy/twarog">Twaróg</Link> chudy lub półtłusty</td>
          <td>500 g</td>
          <td>baza i całe białko; z około 3,5 L mleka</td>
        </tr>
        <tr><td>Śmietanka 30%</td><td>100 g</td><td>tłuszcz i kremowość; bez niej masa jest sucha</td></tr>
        <tr><td>Cukier lub miód</td><td>40–55 g</td><td>przemysłowy ma ~11 g na 100 g; tu wychodzi 6–7 g</td></tr>
        <tr><td>Mleko</td><td>80–120 ml</td><td>do konsystencji, dodawane na końcu</td></tr>
        <tr><td>Wanilia albo mus owocowy</td><td>do smaku</td><td>wariant smakowy</td></tr>
      </tbody>
    </table>
    <p>
      Twaróg najlepiej zrobić samemu z <Link to="/baza-kultur?type=mezofilne">kultury mezofilnej</Link>. Kupny też
      się nada, ale wtedy nie masz wpływu na kwasowość — a to ona decyduje o smaku gotowego serka.
    </p>

    <h2>Jak zrobić</h2>
    <ol>
      <li><strong>Odsącz twaróg porządnie.</strong> Im mniej serwatki w skrzepie, tym mniejsze ryzyko, że serek ją potem puści.</li>
      <li><strong>Zblenduj twaróg ze śmietanką</strong> — 2–3 minuty, z przerwami, żeby masa się nie zagrzała. To zastępuje homogenizację.</li>
      <li><strong>Dosłódź i doprowadź konsystencję.</strong> Cukier dopiero teraz, potem mleko po łyżce.</li>
      <li><strong>Przetrzyj przez drobne sito</strong>, jeśli wyczuwasz ziarno.</li>
      <li><strong>Schłodź minimum 2 godziny.</strong> Serek gęstnieje przy chłodzeniu.</li>
    </ol>

    <h2>Warianty</h2>
    <ul>
      <li><strong>Waniliowy</strong> — ziarna z połowy laski wanilii, dodane przed blendowaniem.</li>
      <li><strong>Owocowy</strong> — 60–80 g musu na porcję 750 g, wmieszanego po zblendowaniu (blendowanie z owocami rozrzedza masę).</li>
      <li><strong>Z kajmakiem</strong> — 2–3 łyżki masy kajmakowej zamiast cukru; wersja znana jako „serek z krówką".</li>
    </ul>

    <h2>Gdy serek się rozwarstwia</h2>
    <p>
      Serwatka wychodzi z trzech powodów: <strong>słabo odsączony twaróg, za krótkie blendowanie, brak
      stabilizatora</strong>. Dwa pierwsze załatwia technika. Trzeci możesz naśladować dokładnie tak, jak robi to
      przemysł — na etykiecie stoi skrobia kukurydziana:
    </p>
    <div className="not-prose my-6 border-l-4 border-primary bg-secondary p-4 text-foreground">
      Zagotuj <strong>łyżeczkę skrobi kukurydzianej ze 100 ml mleka</strong>, ostudź <strong>całkowicie</strong> i
      dopiero wtedy wmieszaj do masy. Ciepła skrobia zetnie białko i zrobi kluski. Bez skrobi serek jest jak
      najbardziej dobry — po prostu trzeba go zjeść w dwa, trzy dni.
    </div>

    <h2>Przechowywanie</h2>
    <p>
      <strong>3–4 dni w lodówce</strong>, w zamkniętym pojemniku. To świeży produkt bez konserwantów, a dodatek
      owoców raczej skraca ten czas, niż go wydłuża. Mrożenie odpada — po rozmrożeniu masa traci gładkość, czyli to
      jedno, po co się ją robiło.
    </p>
    <div className="not-prose my-6 border-l-4 border-destructive bg-destructive/10 p-4 text-foreground">
      <strong>Przy sprzedaży</strong> w <Link to="/prawo/rhd">RHD</Link> serek z cukrem i owocami jest produktem
      złożonym: każdy składnik trzeba mieć udokumentowany, a krótki termin przydatności wpisać na etykietę. Na
      własny użytek to bez znaczenia.
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

export default SerekHomogenizowany;
