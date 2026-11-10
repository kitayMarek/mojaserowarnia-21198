import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import HowToSchema from "@/components/HowToSchema";
import { Link } from "react-router-dom";
import { Milk } from "lucide-react";

/**
 * Masło domowe: słodkie i kwaśne, plus stara wiejska metoda ze zsiadłego mleka.
 *
 * SKĄD STRONA: Marek zauważył 10.11.2026, że nie odpowiadamy na pytania, które ludzie
 * naprawdę zadają: czy da się ze słodkiej śmietany, czym zakwaszać i jak długo, czy
 * można zebrać śmietanę ze zsiadłego mleka. Do tej pory był tylko akapit na stronie
 * o serze z jogurtu.
 *
 * KAŻDA LICZBA MA ŹRÓDŁO z listy ZRODLA na dole strony. Czego nie znaleźliśmy
 * (ile dni masło trzyma się w lodówce, czy kefir nadaje się na zakwas), tego nie
 * podajemy i mówimy o tym wprost. Mirror: public/przepisy/maslo.html, trzymać zgodnie.
 */

const ZRODLA = [
  {
    id: "fao",
    opis: "FAO, Small-Scale Dairy Farming Manual, tom 1, rozdział 10.2 „Small Scale Butter Making”, 1993",
    href: "https://www.fao.org/4/t1265e/t1265e13.htm",
  },
  {
    id: "goff",
    opis: "H. D. Goff, Dairy Science and Technology eBook, University of Guelph: rozdział o produkcji masła",
    href: "https://books.lib.uoguelph.ca/dairyscienceandtechnologyebook/chapter/butter-manufacture/",
  },
  {
    id: "goff-homo",
    opis: "H. D. Goff, Dairy Science and Technology eBook: rozdział o homogenizacji mleka",
    href: "https://books.lib.uoguelph.ca/dairyscienceandtechnologyebook/chapter/homogenization-of-milk-and-milk-products/",
  },
  {
    id: "caplan",
    opis: "Z. Caplan, C. Melilli, D. M. Barbano, Gravity separation of fat, somatic cells, and bacteria in raw and pasteurized milks, Journal of Dairy Science 2013",
    href: "https://doi.org/10.3168/jds.2012-6006",
  },
  {
    id: "sienkiewicz",
    opis: "dr inż. Mirosław Sienkiewicz, „Problemy i sposoby rozwiązań w pracy małej mleczarni rzemieślniczej”, 23.11.2020 (PAN Olsztyn)",
    href: "https://pan.olsztyn.pl/wp-content/uploads/2021/05/B3_Miros%C5%82aw-Sienkiewicz_2.pdf",
  },
  {
    id: "lpt",
    opis: "Lista Produktów Tradycyjnych Ministerstwa Rolnictwa: masło rzuchowskie, masło wiejskie z Wołuszewa, masło ostrowieckie, masło sławskie",
    href: "https://www.gov.pl/web/rolnictwo/maslo-rzuchowskie",
  },
  {
    id: "ue",
    opis: "Rozporządzenie (UE) nr 1308/2013, załącznik VII: definicja masła",
    href: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32013R1308",
  },
];

const faqData = [
  {
    question: "Czy da się zrobić masło ze słodkiej śmietany?",
    answer:
      "Tak. Masło ze słodkiej, nieukwaszonej śmietanki to tak zwane masło słodkie i według podręcznika mleczarstwa University of Guelph właśnie z takiej śmietanki robi się dziś większość masła. Wystarczy śmietanka 30% albo tłustsza: schłodzić ją, doprowadzić do 7–13°C i ubijać, aż tłuszcz zbierze się w ziarno i oddzieli od maślanki. Smak jest łagodny, śmietankowy, a maślanka zostaje słodka.",
  },
  {
    question: "Czym zakwasić śmietanę na masło i ile to trwa?",
    answer:
      "Kwaśną maślanką albo kulturą mezofilną. FAO podaje 50 ml maślanki albo zakwasu mezofilnego na litr śmietany i 24 godziny w 18°C, pod przykryciem. Dr inż. Mirosław Sienkiewicz radzi ukwasić śmietankę przed ubijaniem do pH 5,3–5,5, co da się sprawdzić papierkiem wskaźnikowym. Za aromat masła odpowiadają bakterie aromatyczne: Lactococcus lactis biovar diacetylactis i Leuconostoc.",
  },
  {
    question: "Czy ze zsiadłego mleka można zebrać śmietanę i zrobić masło?",
    answer:
      "Tak, tak robiło się masło na wsi. We wpisach z Listy Produktów Tradycyjnych mleko stało dwa, trzy dni w chłodnym miejscu, aż zebrała się śmietana, a na Kujawach stało, aż się zsiadło, i zlewano z niego kwaśną śmietanę. Warunek: mleko nie może być homogenizowane, bo wtedy tłuszcz nie wypływa. Ze zwykłego sklepowego mleka śmietany więc nie zbierzesz. Przy mleku surowym razem z tłuszczem do góry idą bakterie, dlatego bezpieczniej zebrać śmietanę z mleka odstawionego w lodówce, spasteryzować ją i dopiero wtedy ukwasić.",
  },
  {
    question: "Ile masła wychodzi z litra śmietany?",
    answer:
      "Według FAO z 1 litra śmietany wychodzi około 300–400 g masła. Reszta to maślanka. Im tłustsza śmietana, tym więcej masła z litra.",
  },
  {
    question: "W jakiej temperaturze ubijać śmietanę na masło?",
    answer:
      "W 7–10°C latem i 10–13°C zimą, tak podaje podręcznik University of Guelph. Za ciepła śmietana daje masło miękkie i maziste, za zimna kruche.",
  },
  {
    question: "Po co płukać masło w zimnej wodzie?",
    answer:
      "Żeby usunąć resztki maślanki. Według FAO im więcej maślanki usuniesz, tym lepsze masło i tym dłużej się trzyma. Tradycyjnie płukano je i ugniatano łyżką tak długo, aż przestała wypływać zabielona woda. Dr Sienkiewicz zwraca uwagę, że duże krople wody zostawione w maśle bardzo obniżają jego trwałość, więc wodę też trzeba wygnieść.",
  },
  {
    question: "Ile soli dodać do masła?",
    answer:
      "FAO podaje około 10 g soli na 1 kg masła, czyli 1%. W mleczarniach sól stanowi 1–3%. Masło można też zostawić niesolone.",
  },
  {
    question: "Ile tłuszczu ma masło?",
    answer:
      "Według prawa UE masło ma co najmniej 80% i mniej niż 90% tłuszczu mlecznego, najwyżej 16% wody i najwyżej 2% suchej masy beztłuszczowej mleka. Masła domowego nikt nie mierzy, ale te liczby pokazują, po co wygniata się wodę i maślankę.",
  },
  {
    question: "Ile dni domowe masło wytrzyma w lodówce?",
    answer:
      "Wiarygodnej liczby dni nie znaleźliśmy, więc jej nie podajemy. Trwałość zależy przede wszystkim od tego, ile maślanki i wody zostało w maśle: dobrze wypłukane i wygniecione trzyma się dłużej. FAO ostrzega, że masło trzymane za długo jełczeje.",
  },
];

const kroki = [
  {
    name: "Ukwaś śmietankę (tylko masło kwaśne)",
    text: "Do 1 litra śmietanki 30% dodaj 50 ml świeżej kwaśnej maślanki albo kulturę mezofilną, przykryj i zostaw na 24 godziny w 18°C. Przy maśle słodkim ten krok pomijasz.",
  },
  {
    name: "Schłodź śmietankę",
    text: "Wstaw ją do lodówki, najlepiej na noc. W mleczarni ten etap trwa 12–15 godzin: chodzi o to, żeby co najmniej połowa tłuszczu skrystalizowała, bo inaczej śmietanka nie zmaśli się dobrze.",
  },
  {
    name: "Sprawdź temperaturę",
    text: "Do ubijania śmietanka powinna mieć 7–10°C latem i 10–13°C zimą. Za ciepła da masło maziste, za zimna kruche.",
  },
  {
    name: "Ubijaj do ziarna",
    text: "Ubijaj mikserem albo w maselnicy. Najpierw powstanie bita śmietana, potem masa się zetnie, a tłuszcz zbierze w wyraźne ziarno maślane, które oddzieli się od maślanki. Wtedy przerwij.",
  },
  {
    name: "Odlej maślankę",
    text: "Przecedź przez sito. Maślanki nie wylewaj: ze śmietanki ukwaszonej jest kwaśna i nadaje się na zakwas do następnej partii.",
  },
  {
    name: "Wypłucz masło",
    text: "Zanurz masło w zimnej wodzie i ugniataj drewnianą łyżką. Zmieniaj wodę tak długo, aż przestanie wypływać zabielona.",
  },
  {
    name: "Wygnieć wodę i posól",
    text: "Ugniataj, aż nie będą wypływać krople wody. Jeśli solisz, dodaj około 10 g soli na 1 kg masła. Uformuj osełkę i schłodź.",
  },
];

const Glo = ({ term, children }: { term: string; children: string }) => (
  <a href={`/slownik.html#${term}`} target="_blank" rel="noopener noreferrer" className="decoration-dotted underline-offset-2">
    {children}
  </a>
);

const Wpis = ({ adres, children }: { adres: string; children: string }) => (
  <a href={`https://www.gov.pl/web/rolnictwo/${adres}`} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

const Zr = ({ id }: { id: string }) => {
  const nr = ZRODLA.findIndex((z) => z.id === id) + 1;
  return (
    <sup>
      <a href={`#zrodlo-${id}`} className="no-underline">[{nr}]</a>
    </sup>
  );
};

const MasloDomowe = () => (
  <KulturaGuideLayout
    icon={Milk}
    title="Masło domowe ze śmietany: słodkie i kwaśne, krok po kroku"
    subtitle="Masło da się zrobić ze świeżej śmietanki albo z ukwaszonej, a na wsi robiło się je ze śmietany zebranej ze zsiadłego mleka. Poniżej obie metody, temperatury i czasy ze źródeł oraz to, czego ze sklepowego mleka się nie zrobi."
    metaTitle="Masło domowe ze śmietany: słodkie i kwaśne, krok po kroku | Moja Serowarnia"
    metaDescription="Jak zrobić masło: ze słodkiej śmietanki albo ukwaszonej maślanką (50 ml na litr, 24 h, 18°C). Ubijanie w 7–13°C, płukanie, sól. Masło ze zsiadłego mleka i dlaczego nie ze sklepowego."
    breadcrumb={[{ label: "Przepisy", href: "/przepisy" }, { label: "Masło domowe" }]}
    related={[
      { label: "Zsiadłe mleko: te same bakterie mezofilne, bez ubijania", href: "/przepisy/zsiadle-mleko" },
      { label: "Kultury mezofilne: które wybrać i do czego", href: "/kultury/mezofilne" },
      { label: "Baza kultur: kultury do masła i ich ceny", href: "/baza-kultur?q=masło" },
      { label: "Ser i twaróg z jogurtu: labneh i twaróg z kefiru", href: "/przepisy/ser-z-jogurtu" },
      { label: "Sprzedaż z gospodarstwa: rolniczy handel detaliczny", href: "/prawo/rhd" },
    ]}
  >
    <FAQSchema faqs={faqData} />
    <HowToSchema
      name="Jak zrobić masło domowe ze śmietany"
      description="Masło ze śmietanki 30%: opcjonalne ukwaszenie maślanką (24 h, 18°C), schłodzenie, ubijanie w 7–13°C do ziarna maślanego, płukanie w zimnej wodzie, wygniecenie wody i solenie."
      totalTime="PT38H"
      datePublished="2026-11-10"
      dateModified="2026-11-10"
      supply={[
        "Śmietanka 30% lub tłustsza: 1 L",
        "Kwaśna maślanka: 50 ml albo kultura mezofilna (tylko masło kwaśne)",
        "Sól: około 10 g na 1 kg masła (opcjonalnie)",
        "Zimna woda do płukania",
      ]}
      tool={["Mikser albo maselnica", "Termometr", "Sito", "Drewniana łyżka"]}
      steps={kroki}
    />

    <h2>Masło to tłuszcz mleka oddzielony od maślanki</h2>
    <p>
      Śmietanka to tłuszcz zawieszony w wodzie mleka, w postaci drobnych kuleczek. Ubijanie rozbija ich otoczki,
      tłuszcz zlepia się w ziarno, a woda z resztą mleka odpływa jako <strong>maślanka</strong>. To, co zostaje
      po wypłukaniu i wygnieceniu, to masło. Według prawa UE ma ono co najmniej 80% i mniej niż 90% tłuszczu
      mlecznego, najwyżej 16% wody i najwyżej 2% suchej masy beztłuszczowej mleka.
      <Zr id="ue" />
    </p>
    <p>
      Śmietanka może być słodka albo ukwaszona i z obu wyjdzie masło. Według podręcznika mleczarstwa University
      of Guelph dziś większość masła robi się ze słodkiej śmietanki, a masło z ukwaszonej to osobny, bardziej
      aromatyczny rodzaj.
      <Zr id="goff" />
    </p>

    <h2>Słodkie czy kwaśne: czym się różnią</h2>
    <table>
      <thead>
        <tr><th>&nbsp;</th><th>Masło słodkie</th><th>Masło kwaśne</th></tr>
      </thead>
      <tbody>
        <tr><td>Śmietanka</td><td>świeża, nieukwaszona</td><td>ukwaszona maślanką albo kulturą</td></tr>
        <tr><td>Dodatkowy czas</td><td>nie</td><td>ukwaszanie: 24 h w 18°C<Zr id="fao" /></td></tr>
        <tr><td>Smak</td><td>łagodny, śmietankowy</td><td>wyraźny, maślany aromat</td></tr>
        <tr><td>Maślanka</td><td>słodka</td><td>kwaśna, nadaje się na zakwas</td></tr>
      </tbody>
    </table>
    <p>
      Maślany aromat masła kwaśnego robią <Glo term="kultury-aromatyczne">bakterie aromatyczne</Glo>:
      Lactococcus lactis biovar diacetylactis i Leuconostoc. Rozkładają cytrynian z mleka na diacetyl, ten sam
      związek, który pachnie w serach z kulturami aromatycznymi. W mleczarniach do masła kwaśnego używa się
      właśnie mieszanek tych bakterii z Lactococcus lactis.
      <Zr id="goff" />
    </p>

    <h2>Czego potrzebujesz</h2>
    <table>
      <thead>
        <tr><th>Składnik</th><th>Ilość na 1 L śmietanki</th><th>Uwagi</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Śmietanka</td>
          <td>1 L</td>
          <td>30% albo tłustsza. W mleczarni do masła ubijanego partiami używa się śmietanki 25–35%.<Zr id="goff" /></td>
        </tr>
        <tr>
          <td>Kwaśna maślanka</td>
          <td>50 ml</td>
          <td>Tylko do masła kwaśnego. Musi mieć żywe kultury.<Zr id="fao" /></td>
        </tr>
        <tr>
          <td>albo <Link to="/kultury/mezofilne">kultura mezofilna</Link></td>
          <td>wg opakowania</td>
          <td>Najlepiej z bakteriami aromatycznymi. Producenci podają dawkę na litry mleka, nie śmietanki.</td>
        </tr>
        <tr>
          <td>Sól</td>
          <td>około 10 g na 1 kg masła</td>
          <td>Opcjonalnie. W mleczarniach 1–3%.<Zr id="fao" /><Zr id="goff" /></td>
        </tr>
        <tr>
          <td>Zimna woda</td>
          <td>kilka zmian</td>
          <td>Do płukania masła z maślanki.</td>
        </tr>
      </tbody>
    </table>

    <h2>Krok po kroku</h2>
    <ol>
      {kroki.map((k) => (
        <li key={k.name}>
          <strong>{k.name}.</strong> {k.text}
        </li>
      ))}
    </ol>
    <p>
      Skąd te liczby: maślanka, czas i temperatura ukwaszania pochodzą z poradnika FAO dla małych gospodarstw
      mlecznych.<Zr id="fao" /> Dr inż. Mirosław Sienkiewicz radzi ukwasić śmietankę przed ubijaniem do pH
      5,3–5,5, co sprawdzisz papierkiem wskaźnikowym, i schłodzić ją tak, żeby co najmniej połowa tłuszczu
      skrystalizowała.<Zr id="sienkiewicz" /> Temperatury ubijania i 12–15 godzin chłodzenia podaje podręcznik
      University of Guelph.<Zr id="goff" />
    </p>
    <p>
      <strong>Kiedy przerwać ubijanie.</strong> Gdy pojawi się wyraźne ziarno maślane, które zbiera się
      w gąbczaste grudki. Za krótko i za długo to oba błędy: w obu przypadkach maślanka źle odpływa, a masło
      trudno wygnieść.<Zr id="sienkiewicz" /> Ręcznie, w drewnianej kierzynce, ubijało się to na Kujawach
      „gdzieś do pół godziny”.<Zr id="lpt" />
    </p>

    <h3>Ile masła wyjdzie</h3>
    <p>
      Według FAO z 1 litra śmietany wychodzi około <strong>300–400 g masła</strong>.<Zr id="fao" /> Resztę
      stanowi maślanka. Im tłustsza śmietanka, tym więcej masła z litra.
    </p>

    <h3>Płukanie i trwałość</h3>
    <p>
      Maślanka zostawiona w maśle psuje je najszybciej. FAO pisze wprost: im więcej maślanki usuniesz, tym lepsze
      masło, ale nie płucz go bez końca.<Zr id="fao" /> Tradycyjnie masło ugniatano drewnianą łyżką w zimnej
      wodzie tak długo, aż przestała wypływać zabielona woda.<Zr id="lpt" /> Potem trzeba jeszcze wygnieść
      wodę, bo duże krople zostawione w maśle bardzo obniżają jego trwałość.<Zr id="sienkiewicz" />
    </p>
    <p>
      Ile dni domowe masło wytrzyma w lodówce, nie wiemy na pewno: wiarygodnej liczby nie znaleźliśmy, więc jej
      nie podajemy. Zależy to głównie od tego, jak dokładnie wypłukano maślankę i wygnieciono wodę.
    </p>

    <h2>Masło ze zsiadłego mleka: tak robiło się na wsi</h2>
    <p>
      Śmietanę zbierało się z mleka, które postało. Opisy z Listy Produktów Tradycyjnych Ministerstwa
      Rolnictwa pokazują, że w różnych regionach robiono to podobnie:<Zr id="lpt" />
    </p>
    <ul>
      <li>
        <strong>Kujawy (<Wpis adres="maslo-wiejskie-z-woluszewa">masło wiejskie z Wołuszewa</Wpis>):</strong>{" "}
        przecedzone mleko stało w garnku, aż się zsiadło, potem zlewano z niego śmietanę, „kwaśną, kwaskową”,
        i ubijano w kierzynce.
      </li>
      <li>
        <strong>Małopolska (<Wpis adres="maslo-rzuchowskie">masło rzuchowskie</Wpis>):</strong> mleko odstawione
        i schłodzone stało 2–3 dni, aż zrobiła się śmietana. Masło płukano, aż przestała wypływać zabielona woda.
      </li>
      <li>
        <strong>Okolice Wałcza (<Wpis adres="maslo-ostrowieckie">masło ostrowieckie</Wpis>):</strong> mleko
        zostawiano w zimnym miejscu, a śmietanę oddzieloną po dwóch dniach przelewano do kierzynki.
      </li>
      <li>
        <strong>Sława w lubuskiem (<Wpis adres="maslo-slawskie">masło sławskie</Wpis>):</strong> śmietanę
        zbierano z odstałego, <em>słodkiego</em> mleka, a masło ugniatano łyżką w zimnej wodzie, żeby wycisnąć
        resztki maślanki.
      </li>
    </ul>
    <p>
      Odpowiedź na pytanie „czy ze zsiadłego mleka da się zrobić masło” brzmi więc: tak, to najstarszy sposób.
      Ale nie z każdego mleka.
    </p>

    <h3>Dlaczego ze sklepowego mleka śmietana nie wypłynie</h3>
    <p>
      Mleko w sklepie jest najczęściej <strong>homogenizowane</strong>, co widać na etykiecie. To znaczy, że
      przetłoczono je pod ciśnieniem przez wąską
      szczelinę, co rozbija kuleczki tłuszczu na dużo drobniejsze. Takie kuleczki prawie przestają wypływać
      i śmietanka się nie zbiera.<Zr id="goff-homo" /> Ze sklepowego mleka zsiadłe zrobisz, ale masła już nie.
    </p>
    <p>
      Śmietanka wypływa z mleka surowego i z mleka pasteryzowanego łagodnie. W badaniu z Cornell University
      tłuszcz wypływał po pasteryzacji w 72,6°C przez 25 sekund, a po pasteryzacji w 76,9°C lub wyżej już nie.
      Oddzielenie trwające 22 godziny w 4°C dało ten sam wynik co 7 godzin w 12°C.<Zr id="caplan" /> Jeśli więc
      kupujesz mleko „niehomogenizowane”, śmietanka może się zebrać albo nie, zależnie od temperatury
      pasteryzacji, której na etykiecie zwykle nie ma.
    </p>

    <h3>Bezpieczeństwo: razem z tłuszczem wypływają bakterie</h3>
    <p>
      To, co dawniej było zaletą tej metody, ma swoją cenę. W tym samym badaniu w górnych 8% surowego mleka
      zebrało się 50–80% tłuszczu <strong>i</strong> bakterii.<Zr id="caplan" /> Dr Sienkiewicz odradza
      zostawianie surowego mleka, aż zbierze się śmietanka: śmietanka i masło wychodzą wtedy niskiej jakości
      i szybko się psują. Zaleca jak najszybsze oddzielenie śmietanki i pasteryzację w co najmniej 90°C.
      <Zr id="sienkiewicz" /> Podręcznik z Guelph przypomina, że naturalne kwaśnienie jest bardzo wrażliwe i obce
      drobnoustroje często psuły wynik.<Zr id="goff" />
    </p>
    <p className="font-medium">
      Bezpieczniejsza wersja starej metody: odstaw mleko od krowy do lodówki, zbierz słodką śmietanę, podgrzej ją
      do co najmniej 90°C, schłodź i ukwaś maślanką albo kulturą. Smak będzie podobny, a o wyniku zdecydują
      bakterie, które sam dodałeś.
    </p>

    <h2>Jaką kulturę wybrać</h2>
    <p>
      Do masła kwaśnego najlepiej nadaje się kultura <Glo term="kultury-mezofilne">mezofilna</Glo> z bakteriami
      aromatycznymi. W naszej <Link to="/baza-kultur?q=masło">bazie kultur</Link> masło ma w opisie zastosowania
      pięć kultur:
    </p>
    <ul>
      <li>
        <Link to="/kultury/ma">MA</Link>: sklep opisuje ją wprost jako kulturę do dojrzewania śmietanki na masło.
        Ma w składzie bakterie aromatyczne diacetylactis.
      </li>
      <li>
        <Link to="/kultury/ml-o">ML-O</Link>, <Link to="/kultury/mse">MSE</Link> i{" "}
        <Link to="/kultury/pbat-91-lyo">PBat 91 LYO</Link>: mają w składzie oba rodzaje bakterii aromatycznych,
        diacetylactis i Leuconostoc.
      </li>
      <li>
        <Link to="/kultury/mo">MO</Link>: ma tylko dwa podgatunki Lactococcus lactis, bez bakterii
        aromatycznych.
      </li>
    </ul>
    <p>
      Opakowania tych kultur starczają na 100–1000 litrów mleka, więc przy litrze śmietanki prościej zacząć od
      kwaśnej maślanki. Kulturę warto kupić, gdy masło robisz regularnie albo chcesz powtarzalnego smaku. Ceny
      w sklepach są w <Link to="/baza-kultur?q=masło">bazie kultur</Link>.
    </p>

    <h2>Najczęstsze problemy</h2>
    <table>
      <thead>
        <tr><th>Objaw</th><th>Przyczyna</th><th>Co zrobić</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Masło miękkie, maziste</td>
          <td>Za ciepła śmietanka przy ubijaniu</td>
          <td>Schłodzić do 7–10°C latem, 10–13°C zimą</td>
        </tr>
        <tr>
          <td>Masło kruche, rozsypuje się</td>
          <td>Za zimna śmietanka</td>
          <td>Ogrzać śmietankę do podanego zakresu</td>
        </tr>
        <tr>
          <td>Maślanka nie odpływa, masło trudno wygnieść</td>
          <td>Ubijanie przerwane za wcześnie albo za późno</td>
          <td>Przerwać, gdy pojawi się wyraźne ziarno maślane</td>
        </tr>
        <tr>
          <td>Masło szybko kwaśnieje albo jełczeje</td>
          <td>Zostawiona maślanka i duże krople wody</td>
          <td>Płukać, aż woda będzie czysta, i dokładnie wygnieść wodę</td>
        </tr>
        <tr>
          <td>Śmietana nie zbiera się na mleku</td>
          <td>Mleko homogenizowane albo pasteryzowane w wyższej temperaturze</td>
          <td>Użyć mleka surowego albo kupić gotową śmietankę</td>
        </tr>
        <tr>
          <td>Śmietana ze zsiadłego mleka gorzka, nieprzyjemna</td>
          <td>Mleko zakwasiły obce drobnoustroje, a nie bakterie mlekowe</td>
          <td>Wyrzucić. Następnym razem pasteryzować śmietanę i dodać zakwas</td>
        </tr>
      </tbody>
    </table>
    <p>
      Przyczyny z pierwszych dwóch wierszy podaje podręcznik University of Guelph, z trzeciego i czwartego
      dr Sienkiewicz i FAO, z piątego badanie z Cornell.<Zr id="goff" /><Zr id="sienkiewicz" /><Zr id="fao" />
      <Zr id="caplan" />
    </p>

    <h2>Sprzedaż masła z gospodarstwa</h2>
    <p>
      Masło z mleka z własnego gospodarstwa można sprzedawać w ramach rolniczego handlu detalicznego, po
      rejestracji u powiatowego lekarza weterynarii. Warunki, limity i dokumenty są na stronie o{" "}
      <Link to="/prawo/rhd">rolniczym handlu detalicznym</Link>.
    </p>

    <h2 id="zrodla">Źródła</h2>
    <ol>
      {ZRODLA.map((z) => (
        <li key={z.id} id={`zrodlo-${z.id}`}>
          <a href={z.href} target="_blank" rel="noopener noreferrer">{z.opis}</a>
        </li>
      ))}
    </ol>
  </KulturaGuideLayout>
);

export default MasloDomowe;
