import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import HowToSchema from "@/components/HowToSchema";
import { Link } from "react-router-dom";
import { Milk } from "lucide-react";

/**
 * Zsiadłe mleko — ten sam proces co twaróg, zatrzymany przed podgrzaniem.
 *
 * DLACZEGO OSOBNA STRONA, A NIE AKAPIT W PRZEPISIE NA TWARÓG: to inne pytanie
 * i inny odbiorca. Po twaróg sięga ktoś, kto chce zrobić ser. Po zsiadłe mleko —
 * ktoś, kto pamięta smak z dzieciństwa i próbował bezskutecznie ze sklepowego
 * mleka. Ta osoba nie wpisze w wyszukiwarkę „twaróg", więc akapit w tamtym
 * przepisie nigdy by do niej nie dotarł.
 *
 * OSTROŻNIE Z UHT: Marek prosił wprost, żeby napisać „ryzykowne", a nie
 * „niemożliwe" — nie ma tego jeszcze sprawdzonego i tekst ma to uczciwie
 * pokazywać. Mechanizm przemawia za tym, że powinno wyjść (koagulacja jest
 * kwasowa, jak przy jogurcie, gdzie UHT działa dobrze), ale przepis na twaróg
 * ostrzega przed rzadkim skrzepem. Do zweryfikowania i wtedy poprawimy.
 */

const faqData = [
  {
    question: "Dlaczego mleko ze sklepu gnije, zamiast się zsiadać?",
    answer:
      "Bo pasteryzacja zabiła jego bakterie fermentacji mlekowej — te, które zakwaszają mleko i chronią je przed resztą. To, co zasiedla je potem w lodówce, to głównie bakterie psychrotrofowe i proteolityczne: rozkładają białko i tłuszcz zamiast produkować kwas. Stąd gorzki smak, nieprzyjemny zapach i śluzowatość zamiast zwartego, kwaśnego skrzepu. Mleko prosto od krowy miało własną mikroflorę mlekową i zsiadało się samo — sklepowe jej nie ma i trzeba mu ją oddać.",
  },
  {
    question: "Czy da się zrobić zsiadłe mleko z mleka UHT?",
    answer:
      "To jest ryzykowne i nie mamy tego jeszcze sprawdzonego na tyle, żeby obiecywać wynik. Teoria przemawia za tym, że powinno wyjść: koagulacja przy zsiadłym mleku jest kwasowa, a nie podpuszczkowa, a przy takiej UHT sprawdza się dobrze — dlatego jogurt z UHT wychodzi. Ale przepis na twaróg ostrzega, że z UHT skrzep bywa rzadki i kluchowaty zamiast zwartego. Do picia taka konsystencja może wystarczyć, do odcedzenia raczej nie. Zacznij od mleka pasteryzowanego, świeżego z lodówki — tam wynik jest przewidywalny.",
  },
  {
    question: "W jakiej temperaturze i ile czasu zsiada się mleko?",
    answer:
      "20–24°C przez 12–24 godziny. To zakres pracy kultur mezofilnych — dosłownie „lubiących średnie ciepło”. Latem skrzep bywa gotowy po 12–14 godzinach, zimą w chłodnej kuchni trzeba czekać do doby. Nie przyspieszaj tego grzaniem: powyżej 30°C mezofile pracują gorzej, a nie lepiej.",
  },
  {
    question: "Czym zaszczepić mleko, jeśli nie mam kultury bakterii?",
    answer:
      "Najprościej świeżą maślanką albo kefirem naturalnym — 200 ml na 8 litrów mleka, czyli mniej więcej 2 łyżki na litr. Musi mieć żywe kultury i krótką datę; produkt pod koniec przydatności bywa już bez życia. Wynik jest mniej powtarzalny niż z kultury liofilizowanej, ale to najtańszy start i działa.",
  },
  {
    question: "Czym zsiadłe mleko różni się od kefiru i jogurtu?",
    answer:
      "Temperaturą i składem mikroflory. Zsiadłe mleko robią bakterie mezofilne w temperaturze pokojowej (20–24°C). Jogurt to bakterie termofilne w 42–45°C — stąd inny, bardziej „mleczny” smak i gęstsza konsystencja. Kefir to grzybki kefirowe, czyli symbioza bakterii i drożdży, przez co bywa lekko gazowany i alkoholowy. Trzy różne produkty z jednego surowca.",
  },
  {
    question: "Jak z zsiadłego mleka zrobić twaróg?",
    answer:
      "Podgrzać. Zsiadłe mleko i twaróg to ten sam proces — twaróg to zsiadłe mleko doprowadzone o etap dalej. Wstaw garnek do kąpieli wodnej i grzej bardzo powoli do 38–40°C, potem odstaw na pół godziny i odcedź w chuście. Nie przekraczaj 40°C, bo kazeina kurczy się gwałtownie i twaróg wychodzi suchy i piaszczysty.",
  },
  {
    question: "Czy zsiadłe mleko jest bezpieczne?",
    answer:
      "Prawidłowo ukwaszone — tak. Bezpieczeństwo bierze się właśnie z kwasu: pH spada do około 4,6, a w takim środowisku bakterie chorobotwórcze nie rosną. Dlatego liczy się, żeby fermentacja ruszyła szybko i pewnie, czyli żeby był zakwas. Mleko zostawione samo sobie bez kultury nie zakwasza się — ono się psuje, a to nie to samo. Wyrzuć wszystko, co pachnie gorzko, zgniło lub pleśniowo, ma różowe czy zielone przebarwienia albo ciągnie się jak śluz.",
  },
  {
    question: "Ile zsiadłe mleko trzyma się w lodówce?",
    answer:
      "3–5 dni. Z każdym dniem jest kwaśniejsze, bo bakterie pracują dalej, tylko wolniej. Po tym czasie nadaje się jeszcze na twaróg, naleśniki albo chleb na zakwasie — kwas nie jest wadą, jeśli wiesz, do czego go użyć.",
  },
];

const kroki = [
  {
    name: "Podgrzej mleko do 22–24°C",
    text: "Wystarczy wyjąć je z lodówki na godzinę albo delikatnie ogrzać w garnku. Nie gotuj — mleko pasteryzowane ze sklepu ma obróbkę cieplną już za sobą.",
  },
  {
    name: "Zaszczep kulturą mezofilną",
    text: "1/8 łyżeczki kultury mezofilnej na 8 litrów mleka, albo 200 ml świeżej maślanki lub kefiru. Wymieszaj dokładnie, ale spokojnie.",
  },
  {
    name: "Zostaw w spokoju na 12–24 godziny",
    text: "Przykryj i odstaw w temperaturze 20–24°C. Nie mieszaj i nie przestawiaj — skrzep tworzy się w bezruchu, a poruszanie go rozbija.",
  },
  {
    name: "Sprawdź skrzep",
    text: "Gotowe zsiadłe mleko jest zwarte, odchodzi od ścianek naczynia, a nad nim zbiera się warstwa klarownej serwatki. Pachnie kwaśno i czysto, nigdy gorzko.",
  },
  {
    name: "Schłodź i podawaj",
    text: "Wstaw do lodówki na minimum 2 godziny. Chłodzenie zatrzymuje zakwaszanie i stabilizuje konsystencję.",
  },
];

const Glo = ({ term, children }: { term: string; children: string }) => (
  <a href={`/slownik.html#${term}`} target="_blank" rel="noopener noreferrer" className="decoration-dotted underline-offset-2">
    {children}
  </a>
);

const ZsiadleMleko = () => (
  <KulturaGuideLayout
    icon={Milk}
    title="Zsiadłe mleko z mleka sklepowego — przepis krok po kroku"
    subtitle="„Ze sklepowego mleka zsiadłego się nie zrobi” — to prawie prawda. Prawie, bo brakuje mu jednej rzeczy, którą można oddać: bakterii. Poniżej metoda, warianty i to, co najczęściej idzie nie tak."
    metaTitle="Zsiadłe mleko z mleka sklepowego — przepis krok po kroku | Moja Serowarnia"
    metaDescription="Sklepowe mleko gnije, zamiast się zsiadać, bo pasteryzacja zabiła jego bakterie mlekowe. Kultura mezofilna to naprawia: 20–24°C, 12–24 h. Przepis i najczęstsze błędy."
    breadcrumb={[{ label: "Przepisy", href: "/przepisy" }, { label: "Zsiadłe mleko" }]}
    related={[
      { label: "Twaróg — to samo zsiadłe mleko, podgrzane o etap dalej", href: "/przepisy/twarog" },
      { label: "Kultury mezofilne — które wybrać i do czego", href: "/kultury/mezofilne" },
      { label: "Baza kultur — 188 kultur i ceny w 5 sklepach", href: "/baza-kultur" },
      { label: "Domowy jogurt — te same bakterie, wyższa temperatura", href: "/przepisy/jogurt-domowy" },
      { label: "Domowy kefir — grzybki tybetańskie i metoda bez nich", href: "/przepisy/kefir-domowy" },
    ]}
  >
    <FAQSchema faqs={faqData} />
    <HowToSchema
      name="Jak zrobić zsiadłe mleko z mleka sklepowego"
      description="Zsiadłe mleko z pasteryzowanego mleka sklepowego: zaszczepienie kulturą mezofilną, 12–24 godziny w temperaturze 20–24°C, schłodzenie."
      totalTime="PT26H"
      datePublished="2026-09-01"
      dateModified="2026-09-01"
      supply={["Mleko pasteryzowane — 1 L", "Kultura mezofilna (szczypta) albo 2 łyżki świeżej maślanki lub kefiru"]}
      tool={["Garnek lub słój", "Termometr", "Ściereczka do przykrycia"]}
      steps={kroki}
    />

    <h2>Dlaczego sklepowe mleko gnije, zamiast się zsiadać</h2>
    <p>
      To nie jest kuchenna legenda. Kto próbował zostawić karton mleka na blacie, ten wie: zamiast kwaśnego,
      zwartego skrzepu wychodzi coś gorzkiego i śluzowatego, co nadaje się wyłącznie do wylania. Obserwacja jest
      trafna — myli się tylko wniosek, że „takiego mleka się nie da”.
    </p>
    <p>
      Mleko prosto od krowy ma własną mikroflorę mlekową. Te bakterie zjadają{" "}
      <Glo term="laktoza">laktozę</Glo> i wytwarzają kwas mlekowy, który obniża pH — a przy okazji{" "}
      <strong>blokuje rozwój wszystkiego innego</strong>. Mleko zsiadało się samo, bo miało kto to zrobić.
    </p>
    <p>
      <Glo term="pasteryzacja">Pasteryzacja</Glo> zabija te bakterie. To dobrze, bo zabija też chorobotwórcze —
      ale zostawia mleko bez obrony i bez kierowcy. To, co zasiedla je potem w lodówce, to bakterie
      psychrotrofowe i proteolityczne, które <strong>rozkładają białko i tłuszcz zamiast produkować kwas</strong>.
      Stąd gorycz, nieprzyjemny zapach i śluz.
    </p>
    <p className="font-medium">
      Sklepowe mleko nie jest więc „gorsze”. Jest puste. A skoro brakuje mu tylko bakterii, to wystarczy mu je
      oddać — i wtedy zsiada się równie dobrze jak każde inne.
    </p>

    <h2>Czego potrzebujesz</h2>
    <table>
      <thead>
        <tr><th>Składnik</th><th>Ilość na 1 L</th><th>Uwagi</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Mleko pasteryzowane</td>
          <td>1 L</td>
          <td>Świeże, z lodówki sklepowej. Pełne daje zwięźlejszy skrzep niż odtłuszczone.</td>
        </tr>
        <tr>
          <td><Link to="/kultury/mezofilne">Kultura mezofilna</Link></td>
          <td>szczypta</td>
          <td>Ok. 1/8 łyżeczki na 8 L. Dawkowanie zawsze wg opakowania.</td>
        </tr>
        <tr>
          <td>albo maślanka / kefir naturalny</td>
          <td>2 łyżki</td>
          <td>Musi mieć żywe kultury i krótką datę. Tańszy start, mniej powtarzalny wynik.</td>
        </tr>
      </tbody>
    </table>
    <p>
      Kultury mezofilne to ta sama grupa, która robi twaróg, maślankę i większość serów dojrzewających. W{" "}
      <Link to="/baza-kultur">bazie kultur</Link> znajdziesz je z opisem zastosowania i cenami w pięciu sklepach —
      część ma zsiadłe mleko wpisane wprost w przeznaczenie.
    </p>

    <h2>Krok po kroku</h2>
    <ol>
      {kroki.map((k) => (
        <li key={k.name}>
          <strong>{k.name}.</strong> {k.text}
        </li>
      ))}
    </ol>
    <p>
      <strong>Najczęstszy błąd to niecierpliwość.</strong> Skrzep tworzy się w bezruchu — każde zamieszanie
      i przestawienie naczynia rozbija go i zwiększa ilość serwatki. Postaw i zapomnij do rana.
    </p>

    <h3>Mleko UHT — ryzykowne, ale nie skreślone</h3>
    <p>
      Tu trzeba uczciwie: <strong>nie mamy tego jeszcze sprawdzonego</strong> i dlatego nie obiecujemy wyniku.
      Teoria przemawia za tym, że powinno wyjść. Przy zsiadłym mleku <Glo term="koagulacja">koagulacja</Glo> jest{" "}
      <strong>kwasowa</strong>, a nie podpuszczkowa — a przy kwasowej mleko UHT sprawdza się dobrze. Dlatego{" "}
      <Link to="/przepisy/jogurt-domowy">jogurt z UHT wychodzi</Link>, choć na ser podpuszczkowy to samo mleko
      się nie nadaje.
    </p>
    <p>
      Z drugiej strony nasz <Link to="/przepisy/twarog">przepis na twaróg</Link> ostrzega, że z UHT skrzep bywa
      rzadki i kluchowaty zamiast zwartego. Do picia taka konsystencja może wystarczyć; do odcedzenia na twaróg
      raczej nie. <strong>Zacznij od mleka pasteryzowanego</strong>, gdzie wynik jest przewidywalny, a UHT
      potraktuj jako eksperyment. Kiedy to sprawdzimy w praktyce, ten akapit zostanie zastąpiony konkretem.
    </p>

    <h2>Podgrzej — i masz twaróg</h2>
    <p>
      To jest ta sama droga, tylko o etap dłuższa. <strong>Twaróg to odgrzane zsiadłe mleko.</strong> Kiedy skrzep
      jest już gotowy, wystarczy wstawić garnek do kąpieli wodnej i grzać <em>bardzo</em> powoli — mniej więcej
      1°C na 2–3 minuty — do 38–40°C. Ziarno zacznie się kurczyć i oddzielać od serwatki, a po odcedzeniu
      w chuście zostaje twaróg.
    </p>
    <p>
      Granicy 40°C nie przekraczaj. Powyżej niej <Glo term="kazeina">kazeina</Glo> kurczy się gwałtownie, wyciska
      wodę i twaróg wychodzi suchy, gumowaty i piaszczysty — tego się już nie odwróci. Pełną wersję z proporcjami,
      czasami odciekania i formowaniem znajdziesz w <Link to="/przepisy/twarog">przepisie na twaróg</Link>.
    </p>

    <h2>Dla kogo to ma sens</h2>
    <p>
      <strong>W domu</strong> to najtańszy sposób na smak, którego nie da się kupić — zsiadłe mleko ze sklepu jest
      albo dosładzane, albo zagęszczane, albo jedno i drugie. Litr mleka i szczypta kultury kosztują ułamek ceny
      gotowego produktu.
    </p>
    <p>
      <strong>W barze mlecznym</strong> liczy się co innego: powtarzalność i koszt porcji. Kultura liofilizowana
      daje ten sam wynik każdego dnia, czego zakwas z poprzedniej partii nie zapewni — po kilku przełożeniach
      mikroflora się przesuwa i produkt zaczyna smakować inaczej.
    </p>
    <p>
      <strong>W restauracji</strong> zsiadłe mleko wraca jako składnik, a nie napój: baza chłodników, zimnych zup,
      dressingów i kwaśnej nuty do dań z ziemniaka. Robione na miejscu daje kontrolę nad kwasowością — a to
      w kuchni jest parametr, nie przypadek.
    </p>

    <h2>Najczęstsze problemy</h2>
    <table>
      <thead>
        <tr><th>Objaw</th><th>Przyczyna</th><th>Co zrobić</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Gorzki smak, nieprzyjemny zapach</td>
          <td>Bakterie gnilne wygrały z mlekowymi — najczęściej brak zakwasu albo za mała dawka</td>
          <td>Wyrzucić. Następnym razem zaszczepić i pilnować czystości naczyń</td>
        </tr>
        <tr>
          <td>Mleko po dobie nadal płynne</td>
          <td>Za zimno w kuchni albo martwy zakwas</td>
          <td>Przenieść w cieplejsze miejsce (22–24°C), sprawdzić datę maślanki</td>
        </tr>
        <tr>
          <td>Skrzep rzadki, kluchowaty</td>
          <td>Bardzo prawdopodobnie mleko UHT lub mikrofiltrowane</td>
          <td>Zmienić na zwykłe pasteryzowane</td>
        </tr>
        <tr>
          <td>Dużo serwatki, mało skrzepu</td>
          <td>Naczyniem poruszano w trakcie ukwaszania</td>
          <td>Nie ruszać do czasu pełnego ścięcia</td>
        </tr>
        <tr>
          <td>Śluzowata, ciągnąca konsystencja</td>
          <td>Zakażenie bakteriami śluzotwórczymi</td>
          <td>Wyrzucić, wyparzyć naczynia</td>
        </tr>
      </tbody>
    </table>
  </KulturaGuideLayout>
);

export default ZsiadleMleko;
