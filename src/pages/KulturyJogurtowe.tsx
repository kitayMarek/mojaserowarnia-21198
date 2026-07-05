import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import { Link } from "react-router-dom";

const faqData = [
  { question: "Jakie kultury do jogurtu?", answer: "Yo-Mix, LAMBDA, Beaugel Yog, Natural Yogurt — lub łyżka dobrego jogurtu naturalnego jako starter." },
  { question: "W jakiej temperaturze robić jogurt?", answer: "Około 42–45°C przez 4–8 godzin, aż mleko zgęstnieje." },
  { question: "Czy zrobię jogurt z mleka koziego?", answer: "Tak — najlepiej kulturą zalecaną do mleka koziego (np. LAMBDA 10)." },
];

const Glo = ({ term, children }: { term: string; children: string }) => (
  <a href={`/slownik.html#${term}`} target="_blank" rel="noopener noreferrer" className="decoration-dotted underline-offset-2">
    {children}
  </a>
);

const KulturyJogurtowe = () => (
  <KulturaGuideLayout
    title="Kultury jogurtowe — jak zrobić domowy jogurt"
    subtitle="Kultury jogurtowe to termofilne bakterie, które zamieniają mleko w gęsty, kwaskowy jogurt. Poniżej: jakie szczepy wybrać, w jakiej temperaturze fermentować i jak zrobić jogurt z różnych rodzajów mleka."
    metaTitle="Kultury jogurtowe — jak zrobić domowy jogurt | Moja Serowarnia"
    metaDescription="Kultury jogurtowe: szczepy (Yo-Mix, LAMBDA, Beaugel Yog), temperatura fermentacji 42–45°C, jogurt krok po kroku oraz z mleka krowiego, owczego i koziego."
    breadcrumb={[{ label: "Kultury serowarskie", href: "/kultury/przewodnik" }, { label: "Jogurtowe" }]}
    bazaType="jogurtowe"
    bazaCtaLabel="Przeglądaj kultury jogurtowe w bazie"
    related={[
      { label: "Kultury bakteryjne do serów — przewodnik", href: "/kultury/przewodnik" },
      { label: "Kultury mezofilne do sera", href: "/kultury/mezofilne" },
      { label: "Sery i nabiał wege — jak to możliwe", href: "/sery-wege" },
      { label: "Pełna baza kultur", href: "/baza-kultur" },
    ]}
  >
    <FAQSchema faqs={faqData} />

    <h2>Co to są kultury jogurtowe?</h2>
    <p>
      To zestaw bakterii — przede wszystkim <em>Streptococcus thermophilus</em> i{" "}
      <em>Lactobacillus delbrueckii</em> subsp. <em>bulgaricus</em> — które fermentują mleko w temperaturze ok.
      42–45°C, nadając mu charakterystyczny kwaskowy smak i gęstą teksturę. Część kultur zawiera też szczepy
      probiotyczne.
    </p>

    <h2>Polecane kultury jogurtowe</h2>
    <table>
      <thead>
        <tr><th>Kultura</th><th>Zastosowanie</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Yo-Mix 215 / 401 / 601</strong></td><td>jogurt tradycyjny</td></tr>
        <tr><td><strong>LAMBDA 3 / 6</strong></td><td>jogurt tradycyjny, miękkie sery z mleka owczego</td></tr>
        <tr><td><strong>LAMBDA 10 / 12</strong></td><td>jogurt zbiornikowy/termostatowy, zalecany do mleka koziego</td></tr>
        <tr><td><strong>Beaugel Yog 1–4</strong></td><td>jogurt kwaśny, kremowy, słodki lub do owoców (gotowe zestawy)</td></tr>
        <tr><td><strong>Natural Yogurt / YO 56 LYO</strong></td><td>jogurt naturalny, łagodny smak</td></tr>
      </tbody>
    </table>
    <p>
      Pełne porównanie ze składem i cenami znajdziesz w{" "}
      <Link to="/baza-kultur?type=jogurtowe">bazie kultur jogurtowych</Link>.
    </p>

    <h2>Jak zrobić jogurt — krok po kroku</h2>
    <ol>
      <li>
        <strong>Podgrzej mleko</strong> do ok. 85°C i schłodź do 42–45°C (<Glo term="pasteryzacja">pasteryzacja</Glo>{" "}
        domowa daje gęstszy jogurt).
      </li>
      <li><strong>Dodaj kulturę</strong> jogurtową (lub łyżkę jogurtu naturalnego) i wymieszaj.</li>
      <li><strong>Utrzymaj 42–45°C</strong> przez 4–8 godzin (jogurtownica, piekarnik z lampką, termos), aż mleko zgęstnieje.</li>
      <li><strong>Schłódź</strong> w lodówce — jogurt jeszcze stężeje. Gotowy do 1–2 tygodni.</li>
    </ol>

    <h2>Jogurt z mleka krowiego, owczego i koziego</h2>
    <p>
      Z mleka krowiego wychodzi klasyczny jogurt; z owczego — gęstszy i bogatszy; z koziego — delikatniejszy
      (warto wtedy wybrać kulturę zalecaną do koziego, np. LAMBDA 10). Po odcedzeniu na gazie uzyskasz jogurt typu
      greckiego.
    </p>

    <h2>Najczęstsze pytania (FAQ)</h2>
    <h3>Jakie kultury do jogurtu?</h3>
    <p>Yo-Mix, LAMBDA, Beaugel Yog, Natural Yogurt — lub łyżka dobrego jogurtu naturalnego.</p>
    <h3>W jakiej temperaturze?</h3>
    <p>Ok. 42–45°C przez 4–8 godzin.</p>
    <h3>Z mleka koziego?</h3>
    <p>Tak — najlepiej kulturą zalecaną do koziego (np. LAMBDA 10).</p>
  </KulturaGuideLayout>
);

export default KulturyJogurtowe;
