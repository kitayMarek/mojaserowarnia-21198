import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import { Link } from "react-router-dom";

const faqData = [
  { question: "Co to są kultury mezofilne?", answer: "Bakterie mlekowe pracujące w 25–35°C, do serów świeżych i półtwardych (gouda, edam, cheddar, twaróg, feta)." },
  { question: "Jakie bakterie mezofilne do sera wybrać?", answer: "Flora Danica, Choozit MA 4001, MM / MM-100, ALPHA 10/12 oraz MSE / MSO. Wybór zależy od sera." },
  { question: "Ile kultury mezofilnej dodać?", answer: "Ułamek grama kultury liofilizowanej (LYO) na kilka–kilkanaście litrów mleka, według wskazań producenta." },
];

// Link słownikowy — świadomie do statycznego /slownik.html (kotwice) w nowej karcie (decyzja Marka).
const Glo = ({ term, children }: { term: string; children: string }) => (
  <a href={`/slownik.html#${term}`} target="_blank" rel="noopener noreferrer" className="decoration-dotted underline-offset-2">
    {children}
  </a>
);

const KulturyMezofilne = () => (
  <KulturaGuideLayout
    title="Kultury mezofilne do sera — które wybrać i do czego"
    subtitle="Kultury (bakterie) mezofilne to podstawa większości serów świeżych i półtwardych. Pracują w niższych temperaturach (25–35°C) i nadają serom łagodny, maślany profil."
    metaTitle="Kultury mezofilne do sera — które wybrać | Moja Serowarnia"
    metaDescription="Kultury mezofilne do sera: temperatura 25–35°C, do jakich serów (gouda, cheddar, twaróg, feta), polecane szczepy (Flora Danica, MA 4001) i dawkowanie."
    breadcrumb={[{ label: "Kultury serowarskie", href: "/kultury/przewodnik" }, { label: "Mezofilne" }]}
    bazaType="mezofilne"
    bazaCtaLabel="Przeglądaj kultury mezofilne w bazie"
    related={[
      { label: "Kultury bakteryjne do serów — przewodnik", href: "/kultury/przewodnik" },
      { label: "Kultury termofilne do sera", href: "/kultury/termofilne" },
      { label: "Bakterie i kultury — poradnik", href: "/bakterie-kultury" },
      { label: "Pełna baza kultur", href: "/baza-kultur" },
    ]}
  >
    <FAQSchema faqs={faqData} />

    <h2>Co to są kultury mezofilne?</h2>
    <p>
      To wyselekcjonowane szczepy bakterii mlekowych (LAB), które najlepiej działają w temperaturze{" "}
      <strong>25–35°C</strong>. Przekształcają laktozę w kwas mlekowy w niższych temperaturach niż kultury{" "}
      <Glo term="kultury-termofilne">termofilne</Glo>, dzięki czemu nadają się do serów, które nie są mocno
      dogrzewane.
    </p>

    <h2>Do jakich serów kultury mezofilne?</h2>
    <ul>
      <li>Sery świeże i twaróg</li>
      <li>Gouda, edam, tylżycki (holenderskie i półtwarde)</li>
      <li>Cheddar</li>
      <li>Feta i sery <Glo term="solanka">solankowe</Glo></li>
      <li>Sery z białą i niebieską pleśnią (jako baza, z dodatkiem pleśni)</li>
    </ul>

    <h2>Polecane kultury mezofilne</h2>
    <table>
      <thead>
        <tr><th>Kultura</th><th>Typ / zastosowanie</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Flora Danica</strong></td><td>mezofilna LD (z CO₂) — gouda, sery z drobnymi oczkami</td></tr>
        <tr><td><strong>Choozit MA 4001</strong></td><td>uniwersalna mezofilna — sery świeże i półtwarde</td></tr>
        <tr><td><strong>MM / MM-100</strong></td><td>mezofilna — sery holenderskie</td></tr>
        <tr><td><strong>ALPHA 10 / ALPHA 12</strong></td><td>mezofilna — twaróg, zsiadłe mleko, sery miękkie (25–32°C)</td></tr>
        <tr><td><strong>MSE / MSO</strong></td><td>mezofilna — sery świeże, pleśniowe, półtwarde</td></tr>
      </tbody>
    </table>
    <p>
      Pełne porównanie ze składem i cenami znajdziesz w{" "}
      <Link to="/baza-kultur?type=mezofilne">bazie kultur mezofilnych</Link>.
    </p>

    <h2>Mezofilne vs termofilne</h2>
    <p>
      Mezofilne (25–35°C) idą do serów świeżych i półtwardych, a{" "}
      <Link to="/kultury/termofilne">termofilne (37–55°C)</Link> do serów włoskich i twardych (caciotta,
      mozzarella, parmezan). Istnieją też kultury mezofilno-termofilne o szerszym zakresie pracy.
    </p>

    <h2>Dawkowanie kultur mezofilnych</h2>
    <p>
      Dawkę dobieraj według producenta — orientacyjnie ułamek grama kultury{" "}
      <Glo term="liofilizat">liofilizowanej</Glo> (LYO) na kilka–kilkanaście litrów mleka. Rozsyp kulturę na
      powierzchni mleka o temperaturze 25–32°C, odczekaj 2–3 minuty na rehydrację i delikatnie wmieszaj.
    </p>

    <h2>Najczęstsze pytania (FAQ)</h2>
    <h3>Co to kultury mezofilne?</h3>
    <p>Bakterie mlekowe pracujące w 25–35°C, do serów świeżych i półtwardych.</p>
    <h3>Jakie bakterie mezofilne do sera?</h3>
    <p>Flora Danica, MA 4001, MM-100, ALPHA 10/12, MSE/MSO.</p>
    <h3>Ile dodać?</h3>
    <p>Ułamek grama LYO na kilka–kilkanaście litrów mleka, wg producenta.</p>
  </KulturaGuideLayout>
);

export default KulturyMezofilne;
