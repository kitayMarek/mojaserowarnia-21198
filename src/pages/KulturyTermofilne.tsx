import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import { Link } from "react-router-dom";

const faqData = [
  { question: "Co to są kultury termofilne?", answer: "Bakterie mlekowe pracujące w 37–55°C, do serów włoskich i twardych (caciotta, mozzarella, parmezan, gruyère)." },
  { question: "Jakie bakterie termofilne do sera wybrać?", answer: "TA / TA-61, MST, ST, ALPHA 20/22 oraz LH / LH-100 (Lactobacillus helveticus)." },
  { question: "Kultury termofilne do caciotty i mozzarelli?", answer: "Tak — to klasyczne zastosowania kultur termofilnych, zwłaszcza TA-61 (Streptococcus thermophilus)." },
];

const Glo = ({ term, children }: { term: string; children: string }) => (
  <a href={`/slownik.html#${term}`} target="_blank" rel="noopener noreferrer" className="decoration-dotted underline-offset-2">
    {children}
  </a>
);

const KulturyTermofilne = () => (
  <KulturaGuideLayout
    title="Kultury termofilne do sera — które wybrać i do czego"
    subtitle="Kultury (bakterie) termofilne pracują w wyższych temperaturach (37–55°C) i są niezbędne do serów włoskich oraz twardych, mocno dogrzewanych."
    metaTitle="Kultury termofilne do sera — które wybrać | Moja Serowarnia"
    metaDescription="Kultury termofilne do sera: temperatura 37–55°C, do jakich serów (caciotta, mozzarella, parmezan, gruyère), polecane szczepy (TA-61, LH-100) i dawkowanie."
    breadcrumb={[{ label: "Kultury serowarskie", href: "/kultury/przewodnik" }, { label: "Termofilne" }]}
    bazaType="termofilne"
    bazaCtaLabel="Przeglądaj kultury termofilne w bazie"
    related={[
      { label: "Kultury bakteryjne do serów — przewodnik", href: "/kultury/przewodnik" },
      { label: "Kultury mezofilne do sera", href: "/kultury/mezofilne" },
      { label: "Bakterie i kultury — poradnik", href: "/bakterie-kultury" },
      { label: "Pełna baza kultur", href: "/baza-kultur" },
    ]}
  >
    <FAQSchema faqs={faqData} />

    <h2>Co to są kultury termofilne?</h2>
    <p>
      To szczepy bakterii mlekowych (głównie <em>Streptococcus thermophilus</em> i <em>Lactobacillus</em>), które
      najlepiej działają w temperaturze <strong>37–55°C</strong>. Wytrzymują wysokie temperatury dogrzewania{" "}
      <Glo term="skrzep">skrzepu</Glo>, dzięki czemu nadają się do serów twardych i włoskich.
    </p>

    <h2>Do jakich serów kultury termofilne?</h2>
    <ul>
      <li>Caciotta i sery włoskie</li>
      <li>Mozzarella i sery typu <Glo term="ciagniecie-ciasta">pasta filata</Glo></li>
      <li>Parmezan i sery twarde wysokodogrzewane</li>
      <li>Gruyère, emmental i sery alpejskie</li>
    </ul>

    <h2>Polecane kultury termofilne</h2>
    <table>
      <thead>
        <tr><th>Kultura</th><th>Typ / zastosowanie</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>TA / TA-61</strong></td><td><em>Streptococcus thermophilus</em> — kultura podstawowa (caciotta, mozzarella)</td></tr>
        <tr><td><strong>MST / MST-910</strong></td><td>klasyczna kultura termofilna</td></tr>
        <tr><td><strong>ST / ST-20</strong></td><td>podstawowa, uniwersalna termofilna</td></tr>
        <tr><td><strong>ALPHA 20 / ALPHA 22</strong></td><td>starter termofilny o łagodnej dynamice</td></tr>
        <tr><td><strong>LH / LH-100</strong></td><td><em>Lactobacillus helveticus</em> — słodka nuta w serach alpejskich</td></tr>
      </tbody>
    </table>
    <p>
      Pełne porównanie ze składem i cenami znajdziesz w{" "}
      <Link to="/baza-kultur?type=termofilne">bazie kultur termofilnych</Link>.
    </p>

    <h2>Termofilne vs mezofilne</h2>
    <p>
      Termofilne (37–55°C) idą do serów włoskich i twardych, a{" "}
      <Link to="/kultury/mezofilne">mezofilne (25–35°C)</Link> do serów świeżych i półtwardych (gouda, twaróg).
      Istnieją też kultury mezofilno-termofilne o szerszym zakresie pracy.
    </p>

    <h2>Dawkowanie kultur termofilnych</h2>
    <p>
      Dawkę dobieraj według producenta — orientacyjnie ułamek grama kultury{" "}
      <Glo term="liofilizat">liofilizowanej</Glo> (LYO) na kilka–kilkanaście litrów mleka. Rozsyp na powierzchni
      mleka podgrzanego do ok. 37°C, odczekaj na rehydrację i wmieszaj.
    </p>

    <h2>Najczęstsze pytania (FAQ)</h2>
    <h3>Co to kultury termofilne?</h3>
    <p>Bakterie mlekowe pracujące w 37–55°C, do serów włoskich i twardych.</p>
    <h3>Jakie bakterie termofilne do sera?</h3>
    <p>TA/TA-61, MST, ST, ALPHA 20/22, LH/LH-100.</p>
    <h3>Do caciotty i mozzarelli?</h3>
    <p>Tak — to klasyczne zastosowania kultur termofilnych (zwłaszcza TA-61).</p>
  </KulturaGuideLayout>
);

export default KulturyTermofilne;
