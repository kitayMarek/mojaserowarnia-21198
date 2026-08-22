import { Link } from "react-router-dom";
import { Factory } from "lucide-react";
import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";

const faqData = [
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
    title="Kto produkuje kultury do sera — marki własne, małe opakowania i mieszanki"
    subtitle="Kultury robi na świecie kilka firm, a sklepy je rozprowadzają i porcjują. Poniżej: jak rozpoznać producenta, co przepakowanie robi z kulturą, kiedy opłaca się małe opakowanie i czym grozi mieszanie preparatów na własną rękę."
    metaTitle="Kto produkuje kultury do sera — marki własne i małe opakowania | Moja Serowarnia"
    metaDescription="Kto naprawdę wytwarza kultury serowarskie, czym jest marka własna sklepu, czy brać małe opakowania i jakie ryzyko niosą mieszanki własne. Plus pytania do sprzedawcy."
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

    <h2>Marka własna to nie producent</h2>
    <p>
      Kultura sprzedawana pod oznaczeniem sklepu nie została przez ten sklep wytworzona. Marka własna mówi, kto ją{" "}
      <em>sprzedaje</em>, a nie kto ją <em>zrobił</em>. Nazwy typu Choozit czy microMilk wskazują producenta; oznaczenia
      literowe i greckie — ALPHA, DELTA, SIGMA, LAMBDA, ML, MSO — same z siebie nie mówią nic.
    </p>

    <div className="not-prose my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 text-foreground">
      <strong>Sprawdziliśmy to na całej bazie:</strong> na 188 pozycji z pięciu polskich sklepów{" "}
      <strong>96 (51%) nie ma w nazwie ani w składzie żadnego śladu producenta</strong>. Nie znaczy to, że sklep coś
      ukrywa — informacja bywa na opakowaniu albo w karcie produktu. Znaczy, że{" "}
      <strong>na etapie wyboru w sklepie kupujący jej nie widzi</strong>.
    </div>

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
