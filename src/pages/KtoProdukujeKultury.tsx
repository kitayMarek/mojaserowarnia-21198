import { Link } from "react-router-dom";
import { Factory } from "lucide-react";
import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import WykresSvg from "@/components/WykresSvg";
import { producenci } from "@/generated/wykresySvg";

const faqData = [
  {
    question: "Czyje kultury kupuje się w polskich sklepach serowarskich?",
    answer:
      "Po odczytaniu producenta ze stron wszystkich 188 pozycji wychodzą cztery firmy: Coquard z Villefranche-sur-Saône we Francji (68 pozycji), Danisco należące dziś do koncernu IFF (29), włoski microMilk z Cremosano koło Cremony (25) i włoski Biochem s.r.l. z Montelibretti pod Rzymem (22). Pozostałe 41 pozycji to marki własne sklepów, przy których jako producent figuruje sam sprzedawca. Charakterystyczne jest to, że każdy producent występuje praktycznie w jednym sklepie — zmiana sklepu jest więc jednocześnie zmianą producenta.",
  },
  {
    question: "Czy w Polsce produkuje się kultury bakteryjne do sera?",
    answer:
      "Wśród producentów zadeklarowanych na stronach 188 kultur nie ma ani jednej polskiej fermentowni. Kiedyś było inaczej: zakład Biolacta w Olsztynie, opisywany jako pierwszy na świecie producent liofilizowanych kultur kefirowych z ziaren kefirowych, działał tam od 1950 roku. Po kolejnych przejęciach (Rhodia 2000, Danisco 2004, DuPont 2011) nowy właściciel zamknął produkcję 30 marca 2013. Kultury pleśniowe przeniesiono wtedy do Francji, grzybki kefirowe do Niemiec, a laboratorium bakteriofagowe do Kijowa.",
  },
  {
    question: "Czy można zamienić kulturę jednego producenta na kulturę innego?",
    answer:
      "Zwykle tak, ale nie jest to zamiana jeden do jednego. Przenosi się skład gatunkowy, klasa temperaturowa i zwykle przeznaczenie. Nie przenosi się dawka w gramach (część kultur pakowana jest na aktywność w jednostkach DCU, a nie na wagę), proporcje szczepów, przynależność do zestawu rotacyjnego chroniącego przed bakteriofagami ani identyfikowalność partii. W bazie 188 kultur aż 89 pozycji (47%) należy do grup o identycznym składzie gatunkowym obejmujących produkty co najmniej dwóch różnych producentów, więc taka zamiana jest w praktyce bardzo częsta. Najbezpieczniej wymieniają się kultury pleśniowe.",
  },
  {
    question: "Co znaczy DCU na opakowaniu kultury?",
    answer:
      "DCU to Danisco Culture Unit, czyli jednostka aktywności zakwaszającej — nie masa i nie objętość. Saszetka jest pakowana tak, aby zawierała określoną zdolność ukwaszenia mleka, niezależnie od tego, ile waży. Typowe dawki to 5-20 DCU na 100 litrów mleka przy serach półtwardych i około 20 DCU na 100 litrów przy mlekach fermentowanych. Praktyczny wniosek: dawki nie da się przenieść gram za gram między produktami różnych firm.",
  },
  {
    question: "Kto produkuje kultury bakteryjne do sera?",
    answer:
      "Na świecie robi to garstka firm biotechnologicznych: Novonesis (dawne Chr. Hansen po fuzji z Novozymes), IFF (dawne Danisco, marka Choozit), Sacco System, Lallemand, dsm-firmenich i Bioprox. Fermentacja i liofilizacja szczepów to instalacja przemysłowa, więc polskie sklepy serowarskie są dystrybutorami albo przepakowującymi, nie wytwórcami.",
  },
  {
    question: "Czy marka własna sklepu to producent?",
    answer:
      "Nie. Marka własna oznacza tylko, że sklep sprzedaje kulturę pod swoim oznaczeniem — szczepy pochodzą od jednego z producentów przemysłowych. To praktyka legalna i powszechna w całej branży spożywczej, ale kupujący nie wie wtedy, czyj szczep dostaje ani czy pochodzi zawsze z tego samego źródła.",
  },
  {
    question: "Czy warto kupować kultury w małych opakowaniach?",
    answer:
      "Dla domowego serowara zwykle tak, bo oryginalne opakowania producenta są liczone na setki i tysiące litrów mleka. Problem nie leży w samym przepakowaniu, tylko w tym, że nie wiadomo, w jakich warunkach je wykonano i z której partii pochodzi zawartość. Liofilizat jest higroskopijny i wrażliwy na tlen, a utrata żywotności jest niewidoczna — poznasz ją dopiero po tym, że mleko nie zakwasza.",
  },
  {
    question: "Czy można mieszać kultury różnych producentów?",
    answer:
      "Technicznie tak, ale są trzy realne pułapki. Niektóre szczepy Lactococcus lactis wytwarzają bakteriocyny (na przykład nizynę), które hamują inne bakterie mlekowe — własna mieszanka może więc zabić własny starter. Producenci projektują też zestawy rotacyjne odporne na bakteriofagi, a łączenie preparatów z różnych źródeł tę ochronę psuje. Trzecia sprawa to proporcje: gotowa mieszanka ma dobrany stosunek szczepów, a mieszając dwie z nich, tracisz nad nim kontrolę.",
  },
  {
    question: "Ile litrów mleka starcza opakowanie kultury?",
    answer:
      "Zależnie od produktu od 5 do 5000 litrów. Z przeglądu 188 kultur z pięciu polskich sklepów: 107 pozycji to opakowania na 100 L (faktyczny standard rynku), 16 na 5 L, 13 na 500 L, 8 na 1000 L i więcej. 27 pozycji nie deklaruje pojemności nigdzie na stronie produktu. Po przeliczeniu na cenę za litr rozpiętość sięga 217-krotności (0,014 do 3,00 zł/L), ale mediany wszystkich pięciu sklepów mieszczą się w wąskim pasie 0,179–0,210 zł/L — różnica bierze się z formatu opakowania, nie z marży sklepu.",
  },
  {
    question: "Dlaczego ta sama kultura raz działa, a raz nie?",
    answer:
      "Powodów jest kilka: inna partia produkcyjna, przechowywanie w za wysokiej temperaturze, wilgoć w opakowaniu po przepakowaniu, bakteriofagi w kadzi albo antybiotyki w mleku. Przy kulturze bez podanego producenta i numeru partii nie da się tego rozstrzygnąć — i to jest główny praktyczny argument za tym, żeby oba te dane były na etykiecie.",
  },
  {
    question: "Czy przy RHD potrzebny jest numer partii kultury?",
    answer:
      "Sprzedaż sera w RHD wiąże się z prowadzeniem dokumentacji, a identyfikowalność składników jest jej częścią. Kultura bez podanego producenta i numeru partii jest luką w tej dokumentacji — przy reklamacji albo kontroli nie ma czym wykazać, skąd pochodził składnik. Przy produkcji wyłącznie na własne potrzeby to bez znaczenia.",
  },
];

const KtoProdukujeKultury = () => (
  <KulturaGuideLayout
    icon={Factory}
    title="Kto produkuje kultury do sera — firmy, fabryki i zamiana między producentami"
    subtitle="Cztery firmy odpowiadają za większość tego, co stoi na polskiej półce. Poniżej: skąd są, gdzie mają fabryki, jak trafiają do Polski, jak mierzy się jakość kultury — i najważniejsze: co się dzieje, gdy trzeba zamienić kulturę jednego producenta na drugiego albo je wymieszać."
    metaTitle="Producenci kultur do sera — kto, skąd, i czy da się je zamieniać | Moja Serowarnia"
    metaDescription="Coquard, Danisco (IFF), microMilk, Biochem — kto naprawdę produkuje kultury sprzedawane w Polsce, gdzie stoją fabryki, jak ocenia się jakość (DCU, CFU) i co przenosi się przy zamianie kultury na inny produkt."
    breadcrumb={[{ label: "Baza kultur", href: "/baza-kultur" }, { label: "Kto produkuje kultury" }]}
    related={[
      { label: "Zamienniki kultur — te same szczepy, inne nazwy", href: "/zamienniki-kultur" },
      { label: "Baza kultur — 188 pozycji z cenami", href: "/baza-kultur" },
      { label: "Kultury mezofilne", href: "/kultury/mezofilne" },
      { label: "RHD — sprzedaż sera i dokumentacja", href: "/prawo/rhd" },
      { label: "Nieudany ser — objawy i przyczyny", href: "/nieudany-ser" },
    ]}
  >
    <FAQSchema faqs={faqData} />

    <h2>Kto naprawdę produkuje kultury</h2>
    <p>
      Kultur serowarskich nie robi się w magazynie. Wyhodowanie czystego szczepu, zagęszczenie go i liofilizacja
      przy zachowaniu żywotności to instalacja przemysłowa z kontrolą mikrobiologiczną — dlatego na całym świecie
      zajmuje się tym <strong>kilka firm</strong>:
    </p>
    <table>
      <thead>
        <tr><th>Producent</th><th>Uwagi</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Novonesis</strong></td><td>dawne Chr. Hansen, po fuzji z Novozymes — największy gracz na rynku kultur mleczarskich</td></tr>
        <tr><td><strong>IFF</strong></td><td>dawne Danisco; marka <strong>Choozit</strong> to właśnie ich linia serowarska</td></tr>
        <tr><td><strong>Sacco System</strong></td><td>włoska grupa Clerici-Sacco, silna w kulturach do serów włoskich</td></tr>
        <tr><td><strong>Lallemand</strong></td><td>kanadyjska, szeroko w fermentacji spożywczej</td></tr>
        <tr><td><strong>dsm-firmenich</strong></td><td>po połączeniu DSM i Firmenich</td></tr>
        <tr><td><strong>Bioprox</strong></td><td>francuska, kultury mleczarskie i ochronne</td></tr>
      </tbody>
    </table>
    <p>
      Polskie sklepy serowarskie <strong>rozprowadzają i porcjują</strong> te preparaty. To normalny, legalny model
      dystrybucji — taki sam jak w każdej innej branży spożywczej. Problem zaczyna się dopiero tam, gdzie z oferty
      nie da się odczytać, czyj właściwie szczep kupujesz.
    </p>

    <h2>Cztery firmy, które stoją za polską półką</h2>
    <p>
      Powyższa lista jest prawdziwa, ale dla kupującego w Polsce mało użyteczna — w sklepach dla domowych serowarów
      prawie jej nie widać. Kiedy odczytaliśmy producenta ze stron wszystkich 188 pozycji, wyszła lista krótsza
      i zupełnie inna. <strong>Z „wielkiej szóstki" trafia tu tylko jedna firma.</strong>
    </p>

    <WykresSvg
      svg={producenci}
      podpis="Producent zadeklarowany na stronie produktu — 185 pozycji ze 188. Cztery firmy plus marki własne sklepów."
    />

    {/* Sześć kolumn nie mieści się na telefonie — bez tego opakowania przewijałaby się cała strona. */}
    <div className="overflow-x-auto">
    <table>
      <thead>
        <tr><th>Producent</th><th>Skąd</th><th>Pozycji</th><th>Gdzie w Polsce</th><th>Opakowania</th><th>Mediana zł/L</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Coquard</strong></td>
          <td>Villefranche-sur-Saône, Francja</td>
          <td>68</td>
          <td>Lactic.pl</td>
          <td>5–500 L</td>
          <td>0,22</td>
        </tr>
        <tr>
          <td><strong>DANISCO (IFF)</strong></td>
          <td>korzenie duńskie, dziś koncern IFF</td>
          <td>29</td>
          <td>Wańczykówka</td>
          <td>100–5000 L</td>
          <td>0,11</td>
        </tr>
        <tr>
          <td><strong>microMilk</strong></td>
          <td>Cremosano k. Cremony, Włochy</td>
          <td>25</td>
          <td>Serowar.pl, Wańczykówka</td>
          <td>100–500 L</td>
          <td>0,32</td>
        </tr>
        <tr>
          <td><strong>Biochem s.r.l.</strong></td>
          <td>Montelibretti k. Rzymu, Włochy</td>
          <td>22</td>
          <td>Serowar.pl</td>
          <td>100 L</td>
          <td>0,20</td>
        </tr>
        <tr>
          <td><strong>Marki własne sklepów</strong></td>
          <td>producent nieujawniony</td>
          <td>41</td>
          <td>Artiser, GAP Poland i inne</td>
          <td>5–500 L</td>
          <td>0,18</td>
        </tr>
      </tbody>
    </table>
    </div>

    <div className="not-prose my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 text-foreground">
      <strong>Najważniejsza konsekwencja tej tabeli: jeden producent to praktycznie jeden sklep.</strong> Kultury
      Coquard są w naszej bazie wyłącznie w jednym sklepie, Danisco w jednym, Biochem w jednym; tylko microMilk
      występuje w dwóch. To znaczy, że <strong>zmiana sklepu jest jednocześnie zmianą producenta</strong> — i odwrotnie.
      Kiedy więc szukasz „tego samego, tylko gdzie indziej", w praktyce zawsze przekraczasz granicę producenta.
      Co się przy tym przenosi, a co nie — <a href="#zamiana">niżej, w osobnej sekcji</a>.
    </div>

    <h3>Coquard — Francja</h3>
    <p>
      Établissements Coquard z Villefranche-sur-Saône w Beaujolais to firma znana przede wszystkim ze{" "}
      <strong>sprzętu serowarskiego</strong> — pras, wanien, wirówek, form. Ferments sprzedaje pod własną marką i to
      stąd biorą się oznaczenia greckie, które w polskich sklepach potrafią zmylić: <strong>ALPHA, BETA, DELTA,
      LAMBDA, SIGMA, IOTA</strong> oraz linia <strong>Beaugel</strong>. W katalogu producenta figurują jako produkty
      Coquard i <strong>nie ma tam informacji, w czyjej fermentowni powstają</strong> — nazwa na etykiecie mówi więc,
      czyja to marka handlowa, a nie gdzie hodowano szczep.
    </p>

    <h3>Danisco / IFF — Dania, dziś koncern globalny</h3>
    <p>
      Duńskie Danisco to jedyny przedstawiciel światowej czołówki, którego kultury kupisz w polskim sklepie dla
      domowych serowarów. Linie, które spotkasz: <strong>Choozit</strong> (sery), <strong>Yo-Mix</strong> (jogurty),{" "}
      <strong>Holdbac</strong> (kultury ochronne). Firma przeszła dwie zmiany właściciela: w 2011 kupił ją DuPont,
      a od 2021 dział należy do <strong>IFF</strong>. Kultury Danisco powstają w kilku zakładach — <strong>Niebüll
      w Niemczech, Sassenage, Dangé-Saint-Romain i Épernon we Francji oraz Madison w USA</strong>. Z etykiety
      w sklepie nie wynika, z którego z nich pochodzi konkretna saszetka.
    </p>

    <h3>microMilk — Włochy</h3>
    <p>
      Siedziba w Cremosano w prowincji Cremona, w środku lombardzkiego zagłębia mleczarskiego. Firma opisuje swoją
      pracę jako <strong>izolowanie i charakteryzowanie nowych szczepów</strong> pod kątem aromatu, konsystencji
      i dojrzewania — czyli prowadzi własną selekcję, a nie tylko konfekcjonowanie. Widać to po nazwach, które
      odsyłają wprost do serów: T (Mozzarella), TB (Taleggio), MO (feta).
    </p>

    <h3>Biochem s.r.l. — Włochy</h3>
    <p>
      Montelibretti pod Rzymem, firma działa <strong>od 1978</strong> i określa się jako producent żywych kultur
      mlekowych; linia serowarska nazywa się <strong>Lactoferm</strong>. Deklaruje certyfikaty <strong>BRC, IFS,
      halal i koszer</strong> — co warto umieć czytać, bo mówią one o systemie bezpieczeństwa u producenta,
      a nie o skuteczności samej kultury. Więcej o tym w sekcji o{" "}
      <a href="#jakosc">ocenie jakości</a>.
    </p>

    <h2>Skąd te kultury przyjeżdżają do Polski</h2>
    <p>
      Mapa jest krótka: <strong>Francja, Włochy, Niemcy</strong>. Wśród producentów zadeklarowanych na stronach
      produktów <strong>nie ma ani jednej polskiej fermentowni</strong> — polsko brzmiące nazwy w tej kolumnie to
      marki własne sklepów, czyli sprzedawca wpisany w miejsce wytwórcy.
    </p>
    <p>
      Czego z tej trasy nie da się odczytać: <strong>z której fabryki i z której partii</strong> pochodzi saszetka
      leżąca na półce. Przy Danisco to nie jest pytanie teoretyczne — zakładów jest pięć na dwóch kontynentach.
      Dlatego pytanie o numer partii wraca w tym tekście kilka razy; to jedyna informacja, która wiąże konkretną
      torebkę z konkretnym miejscem i dniem produkcji.
    </p>
    <p>
      Sam transport jest przy tym mniej groźny, niż się wydaje. Liofilizat <strong>znosi krótki okres
      w temperaturze otoczenia</strong> — to standard w wysyłce. Jego wrogami są wilgoć i długie ciepło, więc
      newralgiczne są nie kilka dni w aucie, tylko miesiące przechowywania: u dystrybutora, w sklepie i u ciebie
      w domu.
    </p>

    <div className="not-prose my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 text-foreground">
      <p className="mt-0">
        <strong>Polska miała własną produkcję kultur — i to nie byle jaką.</strong> Zakład w Olsztynie, znany jako{" "}
        <strong>Biolacta</strong>, według opracowania Stowarzyszenia Absolwentów Uniwersytetu Warmińsko-Mazurskiego
        wywodził się z firmy założonej w 1936 roku, a w Olsztynie działał od 1950. Był tam opisywany jako{" "}
        <strong>pierwszy i jedyny na świecie producent liofilizowanych kultur kefirowych otrzymywanych z ziaren
        kefirowych</strong>.
      </p>
      <p>
        Dalej wygląda to jak skrócona historia całej branży: 1993 — spółka Biolacta Texel, 2000 — przejęcie przez
        francuską Rhodię, 2004 — <strong>Danisco</strong>, 2011 — DuPont. W 2012 nowy właściciel zdecydował
        o zamknięciu zakładu; <strong>produkcja skończyła się 30 marca 2013</strong>, a likwidacja spółki 30 września
        2013.
      </p>
      <p className="mb-0">
        Produkcję pleśni przeniesiono do Francji, <strong>grzybki kefirowe do Niemiec</strong>, a laboratorium
        bakteriofagowe do Kijowa. Jeśli więc kupujesz dziś kulturę kefirową „z Niemiec", możliwe, że jest to linia,
        która przez pół wieku była olsztyńska.
      </p>
    </div>

    <h2>Marka własna to nie producent</h2>
    <p>
      Kultura sprzedawana pod oznaczeniem sklepu nie została przez ten sklep wytworzona. Marka własna mówi, kto ją{" "}
      <em>sprzedaje</em>, a nie kto ją <em>zrobił</em>. Nazwy typu Choozit czy microMilk wskazują producenta; oznaczenia
      literowe i greckie — ALPHA, DELTA, SIGMA, LAMBDA, ML, MSO — same z siebie nie mówią nic.
    </p>

    <div className="not-prose my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 text-foreground">
      <strong>Sprawdziliśmy to na całej bazie — dwa razy, bo pierwszy wynik był mylący.</strong> Patrząc na samą
      nazwę i skład, <strong>96 pozycji ze 188 (51%) nie zdradza producenta</strong>. Ale po zajrzeniu do danych
      strukturalnych na stronach produktów okazało się, że{" "}
      <strong>185 z 188 (98%) producenta jednak deklaruje</strong> — tyle że w miejscu, którego kupujący nie czyta.
    </div>

    <h3>Kto stoi za kulturami w polskich sklepach</h3>
    <table>
      <thead>
        <tr><th>Deklarowany producent</th><th>Pozycji</th><th>Uwagi</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Coquard</strong></td><td>68</td><td>francuski producent, linie ALPHA, LAMBDA, IOTA, SIGMA, Beaugel</td></tr>
        <tr><td><strong>DANISCO (IFF)</strong></td><td>29</td><td>linia Choozit</td></tr>
        <tr><td><strong>microMilk</strong></td><td>25</td><td>włoski; zapisywany przez sklepy dwojako</td></tr>
        <tr><td><strong>Biochem s.r.l.</strong></td><td>22</td><td>włoski</td></tr>
        <tr><td><strong>Marki własne sklepów</strong></td><td><strong>41</strong></td><td>jako producent figuruje sam sprzedawca</td></tr>
      </tbody>
    </table>
    <p>
      Cztery firmy odpowiadają więc za 144 pozycje ze 188. Przy pozostałych <strong>41 jako producent figuruje sam
      sklep</strong> — co jest dokładnie tym, o czym mowa wyżej: sprzedawca podaje siebie, bo sprzedaje pod swoim
      oznaczeniem preparat, którego nie wytworzył.
    </p>
    <p className="text-muted-foreground text-sm">
      Zastrzeżenie: to są <strong>deklaracje sklepów</strong> odczytane z danych strukturalnych ich stron, a nie nasza
      weryfikacja u producenta.
    </p>

    <h3>Proporcje szczepów — rzadka, ale rozstrzygająca informacja</h3>
    <p>
      Pisaliśmy wyżej, że skład gatunkowy nie odróżnia produktów, bo producent dobiera jeszcze proporcje szczepów,
      a tego tabela nie pokazuje. Okazuje się, że <strong>czasem pokazuje — na 188 pozycji podaje je pięć</strong>,
      wszystkie w jednym sklepie. I od razu widać, po co:
    </p>
    <table>
      <thead>
        <tr><th>Kultura</th><th>Skład w naszej bazie</th><th>Proporcja</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>LAMBDA 3</strong></td><td><em>S. thermophilus + L. bulgaricus</em></td><td><strong>50 : 50</strong></td></tr>
        <tr><td><strong>LAMBDA 6, 7, 8, 9</strong></td><td>identyczny</td><td><strong>80 : 20</strong></td></tr>
      </tbody>
    </table>
    <p>
      <strong>Ten sam skład gatunkowy, dwukrotnie inna proporcja.</strong> W zestawieniu opartym na samym składzie
      LAMBDA 3 i LAMBDA 6 wyglądają jak zamienniki — a zachowają się inaczej, bo o tempie zakwaszania i teksturze
      decyduje właśnie stosunek szczepów. To najlepszy dowód, dlaczego przy{" "}
      <Link to="/zamienniki-kultur">zamiennikach</Link> piszemy „zwykle zadziała", a nie „to to samo".
    </p>

    <h3>Czy marka własna to zawsze ten sam producent?</h3>
    <p>
      <strong>Tego nie wiemy i uczciwie mówimy, że nie wiemy.</strong> Jest jednak hipoteza warta sprawdzenia u
      sprzedawcy: przepakowujący może kupować dany profil szczepowy od tego, kto akurat oferuje lepsze warunki, a
      nazwa handlowa zostaje ta sama. Wtedy dwie saszetki o identycznym oznaczeniu, kupione w odstępie roku, mogą
      pochodzić z różnych źródeł.
    </p>
    <p>
      Gdyby tak było, tłumaczyłoby to zjawisko, które serowarzy opisują często: <em>„ta sama kultura, a zachowała się
      inaczej"</em>. Dlatego pytanie o producenta i numer partii nie jest czepianiem się — to jedyny sposób, żeby w
      razie problemu w ogóle dało się cokolwiek ustalić.
    </p>

    <h2 id="jakosc">Jak w ogóle ocenia się jakość kultury</h2>
    <p>
      W sklepie kultura to torebka proszku i cena. U producenta to produkt opisany kilkoma liczbami, z których
      w Polsce do kupującego nie dociera prawie żadna. Warto wiedzieć, co one znaczą, bo dwie z nich tłumaczą
      większość nieporozumień przy zamianie kultur.
    </p>
    <table>
      <thead>
        <tr><th>Parametr</th><th>Co mówi</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Aktywność zakwaszania</strong></td>
          <td>ile czasu potrzeba na obniżenie pH mleka w zadanej temperaturze — to jest właściwa miara „siły" kultury</td>
        </tr>
        <tr>
          <td><strong>Liczba żywych komórek (CFU)</strong></td>
          <td>ile jednostek tworzących kolonie jest w gramie lub saszetce; przykładowa specyfikacja saszetki 50 DCU to co najmniej 5 × 10<sup>12</sup> CFU</td>
        </tr>
        <tr>
          <td><strong>Czystość mikrobiologiczna</strong></td>
          <td>limity dla tego, czego być nie powinno — w przykładowej specyfikacji m.in. Enterobacteriaceae poniżej 10 CFU/g, drożdże i pleśnie poniżej 10 CFU/g, gronkowce koagulazo-dodatnie poniżej 10 CFU/g</td>
        </tr>
        <tr>
          <td><strong>Profil fagowy</strong></td>
          <td>na które bakteriofagi szczepy są wrażliwe — podstawa zestawów rotacyjnych</td>
        </tr>
        <tr>
          <td><strong>Stabilność w czasie</strong></td>
          <td>jak szybko spada żywotność w danej temperaturze przechowywania</td>
        </tr>
      </tbody>
    </table>

    <h3>DCU — jednostka, która stoi na polskich etykietach i nikt jej nie tłumaczy</h3>
    <p>
      W naszej bazie są trzy pozycje, które mają ją wprost w nazwie: <strong>Choozit LH 100 LYO 10 DCU</strong>,{" "}
      <strong>Choozit LM 57 LYO 20 DCU</strong> i <strong>Holdbac LC LYO 100 DCU</strong>. DCU to{" "}
      <em>Danisco Culture Unit</em> — i tu jest cała rzecz:
    </p>
    <div className="not-prose my-6 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30 p-4 text-foreground">
      <strong>DCU to nie masa i nie objętość, tylko aktywność.</strong> Saszetka jest pakowana tak, żeby zawierała
      określoną zdolność zakwaszania mleka — niezależnie od tego, ile waży. Dlatego przeliczanie dawki „gram za
      gram" między produktami różnych firm nie ma podstaw: ten sam gram może mieć zupełnie inną siłę, bo różni się
      i koncentracja komórek, i nośnik, w którym są zawieszone.
    </div>
    <p>
      Typowe dawki podawane w tej jednostce to <strong>5–20 DCU na 100 litrów mleka</strong> przy serach półtwardych
      i około <strong>20 DCU na 100 litrów</strong> przy mlekach fermentowanych. Widać po nich, dlaczego opakowanie
      „na 1000 litrów" nie jest pomyłką sklepu, tylko normalnym formatem przemysłowym.
    </p>

    <h3>Certyfikaty — co mówią, a czego nie</h3>
    <p>
      Przy producentach spotkasz oznaczenia <strong>BRC, IFS, halal, koszer</strong>. BRC i IFS to standardy
      bezpieczeństwa żywności: mówią, że zakład ma wdrożony i audytowany system produkcji. <strong>Nie mówią nic
      o tym, czy dana kultura zakwasi twoje mleko szybciej niż inna</strong> — to zupełnie inna kategoria informacji
      niż aktywność. Halal i koszer dotyczą wymagań religijnych, w praktyce m.in. pochodzenia pożywki, na której
      hodowano szczepy.
    </p>

    <h3>Jak sprawdzić kulturę u siebie w kuchni</h3>
    <p>
      Domowego pomiaru CFU nie zrobisz, ale <strong>aktywność zmierzysz</strong> — i to jest dokładnie ten parametr,
      który spada przy złym przechowywaniu:
    </p>
    <ol>
      <li>Weź <strong>1 litr mleka</strong> i dawkę przeliczoną z opakowania.</li>
      <li>Trzymaj stałą temperaturę roboczą kultury.</li>
      <li>Zanotuj <strong>czas do wyraźnego zsiadnięcia</strong> (albo pH 4,6, jeśli masz pH-metr).</li>
      <li>Porównaj z poprzednim razem. <strong>Wyraźnie dłuższy czas przy tych samych warunkach oznacza spadek żywotności</strong> — nie „gorszy przepis".</li>
    </ol>
    <p className="text-muted-foreground">
      Ten sam test rozstrzyga spór, który wraca na każdej grupie serowarskiej: czy zawiodła kultura, czy mleko.
      Jeśli świeża saszetka z tej samej partii zachowa się tak samo źle — problem jest po stronie mleka albo
      procesu. Objawy i przyczyny zbieramy w tekście o <Link to="/nieudany-ser">nieudanym serze</Link>.
    </p>

    <h2>Małe opakowania — kto je przygotowuje i co to zmienia</h2>
    <p>
      Oryginalne opakowania producenta są liczone na <strong>setki i tysiące litrów mleka</strong>. Domowy serowar
      warzący 10–20 litrów nie ma jak ich zużyć przed utratą aktywności, więc małe porcje są dla niego jedyną
      praktyczną opcją. Ktoś musi je jednak odsypać.
    </p>
    <p>Liofilizat jest przy tym wymagający:</p>
    <ul>
      <li><strong>Higroskopijny</strong> — chłonie wilgoć z powietrza, a wilgoć w proszku uruchamia procesy, które obniżają żywotność</li>
      <li><strong>Wrażliwy na tlen</strong> — oryginalne saszetki są zwykle pakowane w atmosferze ochronnej i w folii barierowej</li>
      <li><strong>Wrażliwy na temperaturę</strong> — przechowywanie w −18°C przedłuża aktywność o lata, w szufladzie kuchennej skraca do miesięcy</li>
    </ul>
    <div className="not-prose my-6 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30 p-4 text-foreground">
      <strong>Najważniejsze:</strong> utrata żywotności jest <strong>niewidoczna</strong>. Proszek wygląda tak samo,
      pachnie tak samo i nic nie sygnalizuje problemu. Dowiadujesz się dopiero wtedy, gdy mleko nie zakwasza — czyli
      po stracie całego wsadu.
    </div>
    <p>
      Nie znaczy to, że przepakowanie jest złe. Porcje pochodzące z <strong>jednej oryginalnej partii</strong> są
      nawet bardziej powtarzalne niż kupowanie co miesiąc innej partii. Ryzyko leży gdzie indziej: w{" "}
      <strong>nieznanym procesie i braku deklaracji, z czego porcja pochodzi</strong>.
    </p>

    <h2>Ile litrów naprawdę kupujesz — dane z całego rynku</h2>
    <p>
      Sprawdziliśmy strony produktów wszystkich <strong>188 kultur z pięciu polskich sklepów</strong>. Pojemność
      opakowania udało się odczytać dla <strong>161 pozycji</strong>; pozostałe 27 nie deklaruje jej nigdzie na
      stronie. Rozrzut okazał się większy, niż zakładaliśmy:
    </p>
    <table>
      <thead>
        <tr><th>Opakowanie starcza na</th><th>Ile takich pozycji</th></tr>
      </thead>
      <tbody>
        <tr><td>5 L</td><td>16</td></tr>
        <tr><td>20–50 L</td><td>12</td></tr>
        <tr><td><strong>100 L</strong></td><td><strong>107</strong> — faktyczny standard rynku</td></tr>
        <tr><td>150–300 L</td><td>5</td></tr>
        <tr><td>500 L</td><td>13</td></tr>
        <tr><td>1000 L i więcej</td><td>8 (w tym jedno na <strong>5000 litrów</strong>)</td></tr>
      </tbody>
    </table>
    <p>
      Czyli w jednej ofercie, obok siebie i bez żadnego wyróżnienia, stoją opakowania różniące się{" "}
      <strong>tysiąckrotnie</strong>. Saszetka na 5000 litrów jest przeznaczona dla mleczarni, a leży w sklepie dla
      domowych serowarów.
    </p>

    <h3>Cena za litr — pierwsza liczba, którą da się porównać</h3>
    <p>
      Dopiero pojemność pozwala przeliczyć cenę na coś sensownego. Po przeliczeniu rozpiętość wynosi{" "}
      <strong>od 0,014 do 3,00 zł za litr mleka — czyli 217-krotną</strong>.
    </p>
    <div className="not-prose my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 text-foreground">
      <strong>Ale to nie znaczy, że któryś sklep jest drogi.</strong> Mediany wszystkich pięciu mieszczą się w wąskim
      pasie <strong>0,18–0,21 zł za litr</strong>. Różnica bierze się z <strong>formatu opakowania</strong>, a nie
      z marży — duże opakowania są tanie w przeliczeniu, małe drogie, i tak jest wszędzie.
    </div>
    <p className="text-muted-foreground text-sm">
      Uwaga metodyczna: ceny zostały przed przeliczeniem ujednolicone do <strong>brutto</strong>. Jeden z pięciu
      sklepów podawał w naszej bazie kwoty netto, przez co jego oferta wyglądała na 23% tańszą, niż jest w
      rzeczywistości. Po korekcie różnice między sklepami są jeszcze mniejsze.
    </p>

    <p>
      I tu jest pułapka, przez którą sama cena za litr wprowadza w błąd:{" "}
      <strong>najtańsze przeliczeniowo są opakowania, których w domu nie zużyjesz</strong>. Kultura po 0,014 zł/L
      wygląda na okazję, dopóki nie policzysz, że przy 20 litrach na wsad wykorzystasz mniej niż pół procenta
      saszetki, a reszta straci aktywność w zamrażarce.
    </p>
    <p>
      Liczy się <strong>koszt litra, który faktycznie przerobisz</strong>. Przy tej mierze małe opakowanie zwykle
      wygrywa mimo wyższej ceny jednostkowej — chyba że zrobisz z dużej saszetki kulturę matczyną.
    </p>
    <p className="text-muted-foreground">
      Osobna obserwacja z tego samego przeglądu: <strong>dawkowanie podaje na stronie produktu tylko jeden sklep
      z pięciu</strong> (16 pozycji). Cztery pozostałe nie podają go ani razu — trzeba szukać na opakowaniu po zakupie.
    </p>

    <h2>Mały czy duży — gdzie leży próg</h2>
    <table>
      <thead>
        <tr><th>Skala</th><th>Co ryzykujesz przy nieudanym wsadzie</th><th>Rozsądny wybór</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>10–20 L</strong> (dom)</td>
          <td>kilkanaście złotych mleka i wieczór</td>
          <td>małe opakowanie — ryzyko jest tanie, a oryginał i tak się zmarnuje</td>
        </tr>
        <tr>
          <td><strong>50–100 L</strong></td>
          <td>koszt mleka porównywalny z ceną kilku kultur</td>
          <td>małe opakowanie, ale <strong>zawsze z zapytaniem o partię</strong> i notowaniem, co poszło do którego wsadu</td>
        </tr>
        <tr>
          <td><strong>powyżej 100 L</strong> / sprzedaż</td>
          <td>partia towaru, terminy, powtarzalność wobec klienta</td>
          <td>oryginalne opakowanie producenta z numerem partii — <strong>albo kultura matczyna</strong> z jednej saszetki</td>
        </tr>
      </tbody>
    </table>
    <p>
      Warto przy tym pamiętać, że przemysłowe formaty bywają liczone na tysiące litrów. Nawet „duży" domowy serowar
      przy 200–300 litrach na wsad nie zużyje takiej saszetki przed utratą aktywności. Wyjście jest jedno i opisane
      niżej.
    </p>

    <h3>Kultura matczyna — sposób na oryginał, którego nie da się zużyć</h3>
    <p>
      Zamiast kupować przepakowane porcje, można kupić <strong>jedną oryginalną saszetkę</strong> i zrobić z niej
      własny zapas: zaszczepić nią mleko, doprowadzić do zakwaszenia, a potem rozlać do małych porcji i zamrozić.
      Kolejne wsady szczepi się porcją z tej samej, znanej partii.
    </p>
    <p>
      Zyskujesz powtarzalność i identyfikowalność. Tracisz na tym, że kultura matczyna ma ograniczoną liczbę
      pasaży — z każdym przekładaniem proporcja szczepów się przesuwa, dokładnie tak jak przy{" "}
      <Link to="/przepisy/jogurt-domowy">zakwasie jogurtowym</Link>.
    </p>

    <h2 id="zamiana">Zamiana kultury na produkt innego producenta</h2>
    <p>
      To jest pytanie, które w praktyce pada najczęściej: <em>„mój sklep nie ma, czy mogę wziąć tamtą?"</em>.
      A ponieważ — jak wyżej — jeden producent oznacza u nas praktycznie jeden sklep, odpowiedź prawie zawsze
      dotyczy przekroczenia granicy producenta.
    </p>
    <p>
      Zaczęliśmy od policzenia, jak często to w ogóle wchodzi w grę. Grupując wszystkie 188 pozycji po składzie
      gatunkowym, wyszło <strong>28 grup, w których co najmniej dwa produkty mają identyczny skład</strong>. Z tego{" "}
      <strong>20 grup przekracza granicę producenta</strong>, a należy do nich <strong>89 pozycji, czyli 47% bazy</strong>.
      Innymi słowy: dla blisko połowy kultur w polskich sklepach istnieje produkt innej firmy o tym samym składzie
      gatunkowym.
    </p>

    <h3>Co się przenosi, a co zostaje u producenta</h3>
    <table>
      <thead>
        <tr><th>Parametr</th><th>Przenosi się?</th><th>Dlaczego</th></tr>
      </thead>
      <tbody>
        <tr><td>Skład gatunkowy</td><td><strong>Tak</strong></td><td>to ta sama biologia niezależnie od firmy</td></tr>
        <tr><td>Klasa temperaturowa</td><td><strong>Tak</strong></td><td>mezofilna zostaje mezofilną</td></tr>
        <tr><td>Przeznaczenie (typ sera)</td><td>Zwykle</td><td>o ile porównujesz produkty opisane do tego samego sera</td></tr>
        <tr><td><strong>Dawka w gramach</strong></td><td><strong>Nie</strong></td><td>inna koncentracja i inny nośnik; część kultur pakowana jest na aktywność (DCU), nie na wagę</td></tr>
        <tr><td><strong>Proporcje szczepów</strong></td><td><strong>Nie</strong></td><td>to know-how producenta i nie ma go na etykiecie</td></tr>
        <tr><td><strong>Zestaw rotacyjny / odporność fagowa</strong></td><td><strong>Nie</strong></td><td>rotacje są projektowane wewnątrz jednej firmy</td></tr>
        <tr><td>Profil aromatu i czas dojrzewania</td><td>Częściowo</td><td>zależy od doboru szczepów w obrębie gatunku</td></tr>
        <tr><td>Identyfikowalność (partia)</td><td><strong>Nie</strong></td><td>zaczynasz nową historię dokumentacji — istotne przy <Link to="/prawo/rhd">RHD</Link></td></tr>
      </tbody>
    </table>

    <h3>Dwa przykłady z bazy</h3>
    <p>
      <strong>Sery z masy parzonej.</strong> Kultura złożona z samego <em>Streptococcus thermophilus</em> występuje
      u pięciu różnych producentów naraz:
    </p>
    <table>
      <thead>
        <tr><th>Kultura</th><th>Producent</th><th>Opisana do</th></tr>
      </thead>
      <tbody>
        <tr><td>Choozit TA 61</td><td>DANISCO (IFF)</td><td>Emmentaler, Asiago, sery twarde</td></tr>
        <tr><td>DELTA 1, DELTA 2</td><td>Coquard</td><td>sery wysokodogrzewane, pasta filata</td></tr>
        <tr><td>microMilk T</td><td>microMilk</td><td>Mozzarella, Caciotta, Italico</td></tr>
        <tr><td>MP 62 LYO, SR 62 LYO</td><td>GAP Poland (marka własna)</td><td>Mozzarella, oscypek, kaszkawał</td></tr>
        <tr><td>CLC</td><td>Artiser (marka własna)</td><td>Mozzarella, Scamorza</td></tr>
      </tbody>
    </table>
    <p>
      Skład ten sam, opisy przeznaczenia rozjeżdżają się na trzy różne rodziny serów. To nie sprzeczność — to
      pokazuje, jak szeroko działa jeden gatunek i jak wiele zależy od doboru szczepu w jego obrębie.
    </p>
    <p>
      <strong>Pleśnie są najbardziej wymienne.</strong> <em>Penicillium candidum</em> do Camemberta i Brie sprzedaje
      pod własnym oznaczeniem <strong>pięciu producentów</strong> (m.in. PC od Biochemu i SIGMA 75 od Coquarda),
      a <em>Penicillium roqueforti</em> — również pięciu. Przy pleśniach różnice dotyczą głównie tempa porastania
      i barwy, więc zamiana jest tu najbezpieczniejsza z całej bazy.
    </p>

    <h3>Jak zamienić, żeby dało się z tego czegoś nauczyć</h3>
    <ol>
      <li><strong>Dobieraj po przeznaczeniu i temperaturze</strong>, nie po podobnej nazwie. Nazwy nic nie znaczą między firmami.</li>
      <li><strong>Przelicz dawkę od nowa</strong> z pojemności opakowania — nigdy gram za gram ze starego produktu.</li>
      <li><strong>Pierwszy wsad zrób mały</strong>, 1–5 litrów, i zmierz czas do zakwaszenia.</li>
      <li><strong>Zmieniaj jedną rzecz naraz.</strong> Nowa kultura i nowe mleko w tym samym wsadzie to wynik, z którego nic nie wynika.</li>
      <li><strong>Zapisz nazwę, producenta i partię.</strong> Bez tego nie odróżnisz „inna kultura" od „inna partia tej samej kultury".</li>
    </ol>

    <div className="not-prose my-6 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30 p-4 text-foreground">
      <strong>Kiedy nie zamieniać w ciemno:</strong> gdy prowadzisz produkcję ciągłą opartą na{" "}
      <strong>rotacji fagowej</strong> (nowy produkt wypada poza system rotacji), gdy dziurawość albo aromat zależą
      u ciebie od <strong>proporcji szczepów aromatyzujących</strong> — <em>diacetylactis</em> i{" "}
      <em>Leuconostoc</em> — oraz gdy sprzedajesz ser i musisz utrzymać powtarzalny profil wobec klienta.
      W tych trzech sytuacjach zamiana jest do zrobienia, ale jako <strong>zaplanowana próba</strong>, nie jako
      zakup zastępczy w środku sezonu.
    </div>

    <p className="text-muted-foreground">
      Pełną listę pozycji o identycznym składzie — z podziałem na sklepy i producentów — utrzymujemy osobno
      w zestawieniu <Link to="/zamienniki-kultur">zamienników kultur</Link>. Tam widać też, gdzie ta sama nazwa
      handlowa oznacza co innego.
    </p>

    <h2>Mieszanki własne — zalety i ryzyka</h2>
    <p>
      Składanie własnej mieszanki z dwóch czy trzech preparatów kusi: bywa tańsze niż gotowy zestaw, pozwala
      dobrać proporcję szczepów kwaszących do aromatyzujących pod własny styl i ratuje sytuację, gdy gotowej
      mieszanki nie ma na stanie. Przy okazji naprawdę uczy, co robi każdy składnik.
    </p>
    <p>Ale są trzy pułapki, o których sprzedawca nie napisze, bo to nie jego rola:</p>

    <h3>1. Bakteriocyny — własna mieszanka może zabić własny starter</h3>
    <p>
      Część szczepów <em>Lactococcus lactis</em> wytwarza <strong>bakteriocyny</strong> — białka hamujące inne
      bakterie Gram-dodatnie, w tym inne bakterie mlekowe. Najbardziej znana to <strong>nizyna</strong>. Jeśli do
      jednej kadzi trafi szczep produkujący nizynę i szczep na nią wrażliwy, drugi zostanie zahamowany, a
      zakwaszanie stanie w miejscu albo mocno zwolni.
    </p>
    <p>
      Producent, składając gotową mieszankę, dobiera szczepy tak, żeby się nie zwalczały. Łącząc dwa preparaty
      samodzielnie, <strong>nie masz jak tego sprawdzić</strong>, bo skład podany na opakowaniu wymienia gatunki, a
      nie szczepy.
    </p>

    <h3>2. Rotacje fagowe przestają działać</h3>
    <p>
      Bakteriofagi atakują konkretne szczepy, dlatego producenci sprzedają <strong>zestawy rotacyjne</strong> —
      kultury o tym samym działaniu, ale różnym profilu wrażliwości, do stosowania naprzemiennie. Ochrona polega na
      tym, że fag namnożony na jednym zestawie nie radzi sobie z następnym.
    </p>
    <p>
      Mieszając preparaty z różnych źródeł, <strong>nie wiesz już, które szczepy siedzą w twojej kadzi</strong> — a
      wtedy cała logika rotacji przestaje cokolwiek chronić.
    </p>

    <h3>3. Proporcje i diagnostyka</h3>
    <p>
      Gotowa mieszanka ma dobrany stosunek szczepów i to on decyduje o krzywej zakwaszania. Mieszając dwie
      mieszanki, dostajesz sumę o nieznanej proporcji — i tracisz powtarzalność między wsadami.
    </p>
    <p>
      Gorsze jest to, co się dzieje przy niepowodzeniu. <strong>Gdy własna mieszanka zawiedzie, nie da się ustalić
      dlaczego</strong> — nie wiadomo, czy winna jest jedna kultura, druga, ich interakcja, czy zupełnie coś innego.
      Reklamacja też odpada: sprzedawca odpowiada za produkt, który sprzedał, a nie za mieszankę zrobioną po zakupie.
    </p>
    <h3>4. Mieszanie preparatów różnych firm — co dochodzi dodatkowo</h3>
    <p>
      Wszystkie trzy pułapki wyżej dotyczą też mieszania w obrębie jednej firmy. Gdy łączysz preparaty{" "}
      <strong>różnych producentów</strong>, dochodzą dwie rzeczy specyficzne:
    </p>
    <ul>
      <li>
        <strong>Nie ma wspólnej miary dawki.</strong> Jeden produkt jest pakowany na masę, drugi na aktywność
        (DCU), a nośniki bywają różne. „Pół saszetki jednej i pół drugiej" nie daje więc połowy aktywności każdej —
        daje proporcję, której nie znasz.
      </li>
      <li>
        <strong>Rotacje fagowe nie zazębiają się między firmami.</strong> Każdy producent projektuje swój zestaw
        rotacyjny wewnętrznie; produkty dwóch firm nie tworzą razem żadnego systemu ochrony, nawet jeśli osobno
        każdy taki system ma.
      </li>
    </ul>
    <p>
      Jest jednak sytuacja, w której mieszanie ponad firmami bywa jedynym wyjściem: gdy potrzebnego zestawienia
      gatunków <strong>nie ma w żadnym pojedynczym katalogu</strong> — na przykład kultura kwasząca z jednej oferty
      plus wyraźnie aromatyzująca z drugiej. Wtedy warto trzymać się zasady: <strong>mieszaj w obrębie jednego
      producenta, jeśli możesz; ponad firmami tylko wtedy, gdy naprawdę musisz</strong> — i zawsze na małym wsadzie.
    </p>

    <div className="not-prose my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 text-foreground">
      <strong>Praktyczny wniosek:</strong> mieszanki własne mają sens przy małej skali, gdzie nieudany wsad kosztuje
      niewiele, a nauka jest warta ryzyka. Przy produkcji na sprzedaż lepiej trzymać się gotowych zestawów — nie
      dlatego, że są lepsze, tylko dlatego, że są <strong>przewidywalne i reklamowalne</strong>. I zapisuj, co
      mieszasz; bez notatki nie odtworzysz nawet udanej partii.
    </div>

    <h2>RHD i MOL — dlaczego numer partii przestaje być drobiazgiem</h2>
    <p>
      Przy produkcji na własne potrzeby brak numeru partii nie ma znaczenia. Przy{" "}
      <Link to="/prawo/rhd">sprzedaży sera w RHD</Link> albo <Link to="/prawo/mol">MOL</Link> sytuacja się zmienia,
      bo prowadzi się dokumentację, a identyfikowalność składników jest jej częścią.
    </p>
    <p>
      Kultura bez podanego producenta i numeru partii jest w tej dokumentacji luką: przy reklamacji klienta albo
      pytaniu kontroli <strong>nie ma czym wykazać, skąd pochodził składnik</strong>. Nie chodzi o teoretyczny wymóg,
      tylko o praktyczną możliwość odtworzenia, co poszło do której partii sera.
    </p>
    <p className="text-muted-foreground">
      Szczegółowe wymagania dokumentacyjne dla obu form sprzedaży opisujemy w dziale{" "}
      <Link to="/prawo">Prawo</Link> — tu sygnalizujemy tylko konsekwencję dla wyboru kultury.
    </p>

    <h2>O co zapytać przed zakupem</h2>
    <p>Pięć pytań, które rozstrzygają wszystko powyżej. Sprzedawca, który odpowie, sam siebie poleca:</p>
    <ol>
      <li><strong>Kto jest producentem</strong> tej kultury?</li>
      <li><strong>Jaki jest numer partii i data ważności</strong> porcji, którą dostanę?</li>
      <li><strong>Czy to opakowanie oryginalne, czy porcjowane</strong> — a jeśli porcjowane, to w jakich warunkach?</li>
      <li><strong>Na ile litrów mleka</strong> wystarcza to opakowanie?</li>
      <li><strong>Czy ta kultura należy do zestawu rotacyjnego</strong> i którego?</li>
    </ol>
    <p>
      Ostatnie pytanie ma znaczenie tylko przy regularnej produkcji, ale pierwsze cztery warto zadać zawsze.
      Odpowiedź na czwarte pozwala w ogóle porównać ceny — bez niej kwota na etykiecie niewiele znaczy.
    </p>

    <h2>Najczęstsze pytania</h2>
    {faqData.map((f) => (
      <div key={f.question}>
        <h3>{f.question}</h3>
        <p>{f.answer}</p>
      </div>
    ))}
  </KulturaGuideLayout>
);

export default KtoProdukujeKultury;
