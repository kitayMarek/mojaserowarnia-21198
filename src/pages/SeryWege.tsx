import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

const faqData = [
  { question: "Czy ser jest wegetariański?", answer: "Tylko jeśli użyto podpuszczki niezwierzęcej (mikrobiologicznej/roślinnej) lub gdy to ser kwasowy bez podpuszczki (ricotta, twaróg, paneer)." },
  { question: "Co to podpuszczka mikrobiologiczna?", answer: "Podpuszczka z grzybów/pleśni, bez udziału zwierząt — wegetariańska." },
  { question: "Wegetariański czy wegański?", answer: "Wegetariański = mleko zwierzęce + podpuszczka niezwierzęca. Wegański = bez nabiału, z mleka roślinnego." },
  { question: "Czy parmezan jest wegetariański?", answer: "Nie — Parmigiano Reggiano i Grana Padano (PDO) robi się z podpuszczki cielęcej. Wegetariańska alternatywa to twardy ser na podpuszczce mikrobiologicznej lub wegański „parmezan” z nerkowców." },
  { question: "Jakie mleko roślinne najlepsze do sera wegańskiego?", answer: "Nerkowce (kremowa, neutralna baza) i soja (dużo białka). Owies, migdały i kokos zwykle wymagają dodatku skrobi lub agaru." },
];

const Glo = ({ term, children }: { term: string; children: string }) => (
  <a href={`/slownik.html#${term}`} target="_blank" rel="noopener noreferrer" className="decoration-dotted underline-offset-2">
    {children}
  </a>
);

const SeryWege = () => (
  <KulturaGuideLayout
    title="Ser wegetariański i wegański — jak to możliwe?"
    subtitle="Wielu osób zaskakuje, że klasyczny ser bywa niewegetariański — a jednocześnie ser może być w pełni wege. Cały sekret tkwi w podpuszczce. Poniżej wyjaśniamy, jak to działa i jak zrobić ser wegetariański oraz wegański w domu."
    metaTitle="Ser wegetariański i wegański — jak to możliwe? | Moja Serowarnia"
    metaDescription="Ser wegetariański i wegański: dlaczego klasyczny ser bywa niewege, rodzaje podpuszczki (mikrobiologiczna, roślinna), które sery są wege, ser wegański z nerkowców krok po kroku."
    breadcrumb={[{ label: "Kultury serowarskie", href: "/kultury/przewodnik" }, { label: "Sery wege" }]}
    icon={Leaf}
    bazaType="wege"
    bazaCtaLabel="Przeglądaj kultury wegańskie w bazie"
    related={[
      { label: "Ricotta — ser wegetariański bez podpuszczki", href: "/przepisy/ricotta" },
      { label: "Gdzie kupić podpuszczkę (w tym mikrobiologiczną)", href: "/gdzie-kupic-podpuszczke" },
      { label: "Kultury bakteryjne do serów — przewodnik", href: "/kultury/przewodnik" },
      { label: "Baza kultur (w tym wegańskie)", href: "/baza-kultur" },
    ]}
  >
    <FAQSchema faqs={faqData} />

    <h2>Dlaczego klasyczny ser bywa niewegetariański?</h2>
    <p>
      Żeby mleko ścięło się w ser, potrzebny jest enzym — <strong><Glo term="podpuszczka">podpuszczka</Glo></strong>{" "}
      (<Glo term="chymozyna">chymozyna</Glo>). Tradycyjnie pozyskuje się ją z <strong>żołądków cieląt</strong>. Z
      tego powodu ser podpuszczkowy zrobiony z klasycznej podpuszczki zwierzęcej <strong>nie jest wegetariański</strong>,
      mimo że poza tym składa się tylko z mleka i soli.
    </p>

    <h2>Jak zrobić ser wegetariański — rodzaje podpuszczki</h2>
    <p>Ser jest wegetariański, jeśli zamiast podpuszczki zwierzęcej użyjesz niezwierzęcej. Masz trzy opcje:</p>
    <table>
      <thead>
        <tr><th>Rodzaj podpuszczki</th><th>Pochodzenie</th><th>Wege?</th></tr>
      </thead>
      <tbody>
        <tr><td>Zwierzęca</td><td>żołądek cielęcia</td><td>nie</td></tr>
        <tr><td>Mikrobiologiczna</td><td>grzyby / pleśnie (np. <em>Rhizomucor miehei</em>), fermentacja</td><td>tak</td></tr>
        <tr><td>Roślinna</td><td>oset / karczoch (<em>Cynara</em>), figowiec</td><td>tak</td></tr>
        <tr><td>FPC (chymozyna fermentacyjna)</td><td>chymozyna z mikroorganizmów</td><td>tak</td></tr>
      </tbody>
    </table>
    <p>
      Najprościej kupić <strong>podpuszczkę mikrobiologiczną</strong> — działa podobnie do zwierzęcej i jest
      powszechnie dostępna. Podpuszczka roślinna (z ostu) daje charakterystyczny, lekko gorzkawy profil i bywa
      używana w tradycyjnych serach (np. portugalskich). Gdzie kupić podpuszczkę — sprawdź{" "}
      <Link to="/gdzie-kupic-podpuszczke">nasze porównanie</Link>.
    </p>

    <h2>Sery z natury wegetariańskie (bez podpuszczki)</h2>
    <p>
      Niektóre sery w ogóle nie potrzebują podpuszczki — ścina je <strong>kwas</strong> (sok z cytryny, ocet) i
      wysoka temperatura. Są wegetariańskie z definicji:
    </p>
    <div className="not-prose grid sm:grid-cols-2 gap-3 my-4">
      <Link to="/przepisy/ricotta" className="rounded-xl border border-border bg-card hover:border-amber-300 hover:shadow-card transition-all p-4">
        <span className="block font-semibold text-foreground">Ricotta</span>
        <span className="block text-sm text-muted-foreground mt-0.5">ser serwatkowy ścinany kwasem — bez podpuszczki</span>
      </Link>
      <Link to="/przepisy" className="rounded-xl border border-border bg-card hover:border-amber-300 hover:shadow-card transition-all p-4">
        <span className="block font-semibold text-foreground">Mascarpone i twaróg</span>
        <span className="block text-sm text-muted-foreground mt-0.5">sery kwasowe — naturalnie wegetariańskie</span>
      </Link>
    </div>

    <h2>Czy popularne sery są wegetariańskie?</h2>
    <p>
      To zależy od użytej podpuszczki. Sery z <strong>chronioną nazwą pochodzenia (PDO)</strong> mają zwykle w
      specyfikacji podpuszczkę zwierzęcą, więc <strong>nie są wegetariańskie</strong>. Sery „supermarketowe” bywają
      robione na podpuszczce mikrobiologicznej — ale pewność daje tylko etykieta.
    </p>
    <table>
      <thead>
        <tr><th>Ser</th><th>Zwykle wegetariański?</th><th>Uwaga</th></tr>
      </thead>
      <tbody>
        <tr><td>Parmezan (Parmigiano Reggiano)</td><td>Nie</td><td>PDO — wymaga podpuszczki cielęcej</td></tr>
        <tr><td>Grana Padano</td><td>Nie</td><td>podpuszczka zwierzęca (PDO)</td></tr>
        <tr><td>Pecorino Romano</td><td>Nie</td><td>podpuszczka jagnięca</td></tr>
        <tr><td>Oscypek</td><td>Nie</td><td>tradycyjnie podpuszczka zwierzęca (mleko owcze)</td></tr>
        <tr><td>Gouda / Edam</td><td>Zależy</td><td>wiele wersji na podpuszczce mikrobiologicznej — sprawdź etykietę</td></tr>
        <tr><td>Cheddar</td><td>Zależy</td><td>często mikrobiologiczna, zwłaszcza z dopiskiem „dla wegetarian”</td></tr>
        <tr><td>Mozzarella</td><td>Zależy</td><td>zależy od producenta</td></tr>
        <tr><td>Feta</td><td>Zależy</td><td>PDO bywa zwierzęca; wiele wersji mikrobiologiczna</td></tr>
        <tr><td>Ricotta, mascarpone, twaróg</td><td>Tak</td><td>sery kwasowe — bez podpuszczki</td></tr>
        <tr><td>Paneer</td><td>Tak</td><td>ścinany kwasem (sok z cytryny)</td></tr>
      </tbody>
    </table>

    <h2>Po czym poznać ser wegetariański w sklepie?</h2>
    <p>Czytaj skład na etykiecie:</p>
    <ul>
      <li>✅ <strong>„podpuszczka mikrobiologiczna”</strong>, „enzym mikrobiologiczny”, „nie zawiera podpuszczki zwierzęcej” lub oznaczenie <strong>„odpowiedni dla wegetarian”</strong> → ser wegetariański.</li>
      <li>❓ samo <strong>„podpuszczka”</strong> lub <strong>„enzymy”</strong> bez doprecyzowania → często zwierzęca; dopytaj producenta.</li>
      <li>✅ ser <strong>kwasowy</strong> (ricotta, twaróg, mascarpone, paneer) → wegetariański z definicji.</li>
    </ul>
    <p>
      Robisz ser na sprzedaż? Zobacz, co musi znaleźć się na{" "}
      <Link to="/etykieta-rhd">etykiecie produktu w RHD</Link> (m.in. rodzaj podpuszczki w wykazie składników).
    </p>

    <h2>Ser wegański — bez nabiału</h2>
    <p>
      Ser <strong>wegański</strong> to zupełnie inna kategoria: nie zawiera żadnych produktów odzwierzęcych. Robi
      się go z <strong>mleka roślinnego</strong> (sojowego, z nerkowców, owsianego) fermentowanego specjalnymi
      kulturami. W bazie znajdziesz kultury wegańskie m.in.:
    </p>
    <ul>
      <li><strong>ARTiVEG ME-30</strong> — roślinne odpowiedniki nabiału, sery wegańskie</li>
      <li><strong>ARTiVEG TH-33</strong> — wegańskie alternatywy parmezanu i serów twardych</li>
      <li><strong>ARTiVEG YO-9 / YO PRO-12</strong> — jogurty roślinne, napoje fermentowane</li>
      <li><strong>Beaugel Soja 1</strong> — fermentacja mleka sojowego (jogurt sojowy)</li>
    </ul>
    <p>
      Przeglądaj wszystkie kultury (w tym wegańskie) w <Link to="/baza-kultur?type=wege">bazie kultur wege</Link>.
    </p>

    <h2>Jakie mleko roślinne do sera wegańskiego?</h2>
    <p>Baza decyduje o smaku i konsystencji:</p>
    <ul>
      <li><strong>Nerkowce</strong> — najlepszy wybór na start: kremowa, neutralna masa, która po fermentacji daje najbardziej „serową” konsystencję (twarożek, cream cheese, a po podsuszeniu — wegański camembert).</li>
      <li><strong>Soja</strong> — dużo białka, dobrze się ścina i fermentuje (sery topione, „mozzarella” roślinna).</li>
      <li><strong>Owies / migdały / kokos</strong> — możliwe, ale uboższe w białko; zwykle wymagają dodatku skrobi, agaru lub tapioki dla zwartej struktury.</li>
    </ul>

    <h2>Ser wegański z nerkowców — krok po kroku</h2>
    <ol>
      <li><strong>Namocz</strong> nerkowce 4–8 h (lub zalej wrzątkiem na 15 min), odlej.</li>
      <li><strong>Zblenduj</strong> z odrobiną wody, solą i kulturą wegańską (np. ARTiVEG) lub naturalnym zakwasem (probiotyk, sok z kiszonej kapusty) na gładką masę.</li>
      <li><strong>Fermentuj</strong> 24–48 h w cieple (ok. 22–26°C) — kultura zakwasza masę i buduje serowy smak.</li>
      <li><strong>Dopraw</strong> (płatki drożdżowe dla nuty „serowej”, zioła, czosnek), przełóż do formy i schłodź do stężenia.</li>
      <li><strong>Opcjonalnie</strong> podsusz i zaszczep pleśnią (kultury wegańskie) na ser dojrzewający typu camembert.</li>
    </ol>

    <h2>Od czego zacząć — przepisy</h2>
    <ul>
      <li><strong>Najprościej:</strong> <Link to="/przepisy/ricotta">ricotta</Link> — wegetariańska z definicji (kwas zamiast podpuszczki).</li>
      <li><strong>Dowolny ser podpuszczkowy „na wege”:</strong> weź ulubiony <Link to="/przepisy">przepis</Link> i użyj podpuszczki mikrobiologicznej zamiast zwierzęcej.</li>
      <li><strong>Wegański:</strong> jogurt lub ser z mleka roślinnego + kultura ARTiVEG / Beaugel Soja.</li>
    </ul>

    <h2>Najczęstsze pytania (FAQ)</h2>
    <h3>Czy ser jest wegetariański?</h3>
    <p>Tylko jeśli użyto podpuszczki niezwierzęcej (mikrobiologicznej/roślinnej) lub gdy to ser kwasowy bez podpuszczki.</p>
    <h3>Co to podpuszczka mikrobiologiczna?</h3>
    <p>Podpuszczka z grzybów/pleśni, bez udziału zwierząt — wegetariańska.</p>
    <h3>Wegetariański czy wegański?</h3>
    <p>Wegetariański = mleko zwierzęce + podpuszczka niezwierzęca. Wegański = bez nabiału, z mleka roślinnego.</p>
  </KulturaGuideLayout>
);

export default SeryWege;
