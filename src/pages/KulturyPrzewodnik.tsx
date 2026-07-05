import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import { Link } from "react-router-dom";
import { Thermometer, Flame, Milk, Leaf } from "lucide-react";

const faqData = [
  { question: "Jakie kultury do sera?", answer: "Zależnie od typu sera — mezofilne do świeżych i półtwardych, termofilne do włoskich i twardych. Patrz tabela „Jak dobrać kulturę do sera”." },
  { question: "Mezofilne czy termofilne?", answer: "Mezofilne (25–35°C) do serów świeżych i półtwardych, termofilne (37–50°C) do serów włoskich i twardych." },
  { question: "Ile kultury dodać do mleka?", answer: "Orientacyjnie ułamek grama kultury liofilizowanej (LYO) na kilka–kilkanaście litrów mleka, zawsze według wskazań producenta." },
  { question: "Gdzie kupić kultury bakteryjne do sera w Polsce?", answer: "Serowar.pl, Artiser.pl, Lactic.pl, GAP Poland oraz Wańczykówka. Ceny, skład i dostępność porównasz w bazie 145+ kultur na mojaserowarnia.pl." },
];

const Glo = ({ term, children }: { term: string; children: string }) => (
  <a href={`/slownik.html#${term}`} target="_blank" rel="noopener noreferrer" className="decoration-dotted underline-offset-2">
    {children}
  </a>
);

const typeCards = [
  { to: "/kultury/mezofilne", icon: Thermometer, title: "Kultury mezofilne", desc: "25–35°C — sery świeże i półtwarde (gouda, twaróg)" },
  { to: "/kultury/termofilne", icon: Flame, title: "Kultury termofilne", desc: "37–55°C — sery włoskie i twarde (caciotta, mozzarella)" },
  { to: "/kultury/jogurtowe", icon: Milk, title: "Kultury jogurtowe", desc: "domowy jogurt, fermentacja 42–45°C" },
  { to: "/sery-wege", icon: Leaf, title: "Sery i nabiał wege", desc: "podpuszczka mikrobiologiczna, kultury wegańskie" },
];

const KulturyPrzewodnik = () => (
  <KulturaGuideLayout
    title="Kultury bakteryjne do serów — przewodnik"
    subtitle="Kultury bakteryjne to serce każdego sera — decydują o smaku, teksturze i bezpieczeństwie produkcji. Ten przewodnik wyjaśnia rodzaje kultur, jak dobrać je do konkretnego sera, ile dodawać i gdzie kupić je w Polsce."
    metaTitle="Kultury bakteryjne do serów — przewodnik | Moja Serowarnia"
    metaDescription="Przewodnik po kulturach bakteryjnych do sera: rodzaje (mezofilne, termofilne, pleśniowe, propionowe), dobór do sera, dawkowanie i gdzie kupić w Polsce."
    breadcrumb={[{ label: "Kultury serowarskie" }]}
    related={[
      { label: "Baza kultur (145+ pozycji, filtry i ceny)", href: "/baza-kultur" },
      { label: "Porównywarka kultur", href: "/porownywarka-kultur" },
      { label: "Bakterie i kultury — poradnik", href: "/bakterie-kultury" },
      { label: "Gdzie kupić podpuszczkę", href: "/gdzie-kupic-podpuszczke" },
    ]}
  >
    <FAQSchema faqs={faqData} />

    <h2>Co to są kultury bakteryjne i po co?</h2>
    <p>
      Kultury bakteryjne (ang. <em>starter cultures</em>) to wyselekcjonowane szczepy bakterii mlekowych (LAB —{" "}
      <em>lactic acid bacteria</em>), które przekształcają laktozę w kwas mlekowy. To zakwaszenie nadaje serowi
      smak, kontroluje teksturę, wspomaga działanie <Glo term="podpuszczka">podpuszczki</Glo> i zabezpiecza ser
      przed niepożądanymi mikroorganizmami. Bez odpowiedniej kultury ser bywa mdły, kruchy lub po prostu się nie
      udaje.
    </p>

    <h2>Rodzaje kultur bakteryjnych</h2>
    <table>
      <thead>
        <tr><th>Typ kultury</th><th>Temperatura pracy</th><th>Do jakich serów</th></tr>
      </thead>
      <tbody>
        <tr><td><strong><Glo term="kultury-mezofilne">Mezofilne</Glo></strong></td><td>25–35°C</td><td>Twaróg, sery świeże, gouda, edam, cheddar, feta</td></tr>
        <tr><td><strong><Glo term="kultury-termofilne">Termofilne</Glo></strong></td><td>37–50°C</td><td>Caciotta, mozzarella, parmezan, sery włoskie i twarde</td></tr>
        <tr><td><strong>Mezofilno-termofilne</strong></td><td>25–40°C</td><td>Sery półtwarde i uniwersalne zastosowania</td></tr>
        <tr><td><strong><Glo term="plesn-szlachetna">Pleśniowe białe</Glo></strong> (Penicillium candidum, Geotrichum)</td><td>25–38°C</td><td>Camembert, brie, sery z białą pleśnią</td></tr>
        <tr><td><strong>Pleśniowe niebieskie</strong> (Penicillium roqueforti)</td><td>20–30°C</td><td>Roquefort, gorgonzola, sery z niebieską pleśnią</td></tr>
        <tr><td><strong><Glo term="bakterie-propionowe">Propionowe</Glo></strong> (Propionibacterium)</td><td>20–24°C</td><td>Ementaler i sery z dużymi oczkami (dziurami)</td></tr>
        <tr><td><strong>Pomocnicze</strong> (ochronne, aromatyzujące, maziowe)</td><td>różne</td><td>Ochrona przed pleśnią, profil smaku, sery z mytą skórką</td></tr>
      </tbody>
    </table>

    <h2>Jak dobrać kulturę do sera?</h2>
    <p>Najprościej iść od <strong>typu sera</strong> do <strong>typu kultury</strong>:</p>
    <table>
      <thead>
        <tr><th>Chcesz zrobić…</th><th>Sięgnij po…</th></tr>
      </thead>
      <tbody>
        <tr><td>Twaróg, serek wiejski, ser świeży</td><td>kultury mezofilne (np. TW 31, ALPHA 10/12, Flora Danica)</td></tr>
        <tr><td>Caciotta, mozzarella, sery włoskie</td><td>kultury termofilne (np. TA / TA-61, MST, ST)</td></tr>
        <tr><td>Gouda, edam, cheddar (półtwarde)</td><td>kultury mezofilne lub mezofilno-termofilne</td></tr>
        <tr><td>Camembert, brie</td><td>baza mezofilna + Penicillium candidum</td></tr>
        <tr><td>Roquefort, gorgonzola</td><td>baza mezofilna + Penicillium roqueforti</td></tr>
        <tr><td>Ser z dziurami (ementaler)</td><td>kultura termofilna + propionowa</td></tr>
      </tbody>
    </table>

    <h2>Dawkowanie i jak dodawać kulturę</h2>
    <p>
      Dawkę zawsze dobieraj według wskazań producenta danej kultury. Orientacyjnie kultury liofilizowane (LYO)
      stosuje się w ilości rzędu ułamka grama na kilka–kilkanaście litrów mleka. Sposób dodania:
    </p>
    <ul>
      <li>Podgrzej mleko do temperatury pracy kultury (np. 30°C dla mezofilnej, 37°C dla termofilnej).</li>
      <li>Rozsyp kulturę na powierzchni mleka i odczekaj 2–3 minuty na rehydrację.</li>
      <li>Delikatnie wmieszaj ruchem góra-dół (bez napowietrzania).</li>
      <li>Pozostaw do zakwaszenia (od kilkudziesięciu minut do kilkunastu godzin — zależnie od sera), zanim dodasz podpuszczkę.</li>
    </ul>

    <h2>Gdzie kupić kultury bakteryjne w Polsce?</h2>
    <p>
      Kultury do serów oferują polskie sklepy serowarskie, m.in. <strong>Serowar.pl</strong>,{" "}
      <strong>Artiser.pl</strong>, <strong>Lactic.pl</strong>, <strong>GAP Poland</strong> oraz{" "}
      <strong>Wańczykówka</strong>. Aktualne ceny, skład bakteryjny i dostępność wszystkich pozycji porównasz w{" "}
      <Link to="/baza-kultur">bazie 145+ kultur</Link>.
    </p>

    <h2>Kultury według typu</h2>
    <div className="not-prose grid sm:grid-cols-2 gap-3 my-4">
      {typeCards.map((c) => {
        const Icon = c.icon;
        return (
          <Link
            key={c.to}
            to={c.to}
            className="flex items-start gap-3 rounded-xl border border-border bg-card hover:border-amber-300 hover:shadow-card transition-all p-4"
          >
            <span className="w-10 h-10 shrink-0 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center">
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold text-foreground">{c.title}</span>
              <span className="block text-sm text-muted-foreground mt-0.5">{c.desc}</span>
            </span>
          </Link>
        );
      })}
    </div>

    <h2>Najczęstsze pytania (FAQ)</h2>
    <h3>Jakie kultury do sera?</h3>
    <p>Zależnie od typu sera — patrz tabela „Jak dobrać kulturę” powyżej.</p>
    <h3>Mezofilne czy termofilne?</h3>
    <p>Mezofilne (25–35°C) do świeżych i półtwardych, termofilne (37–50°C) do włoskich i twardych.</p>
    <h3>Ile dodać?</h3>
    <p>Ułamek grama LYO na kilka–kilkanaście litrów mleka, wg producenta.</p>
    <h3>Gdzie kupić?</h3>
    <p>Serowar.pl, Artiser.pl, Lactic.pl, GAP Poland, Wańczykówka — porównanie w bazie kultur.</p>
  </KulturaGuideLayout>
);

export default KulturyPrzewodnik;
