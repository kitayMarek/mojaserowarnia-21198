import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import { Link } from "react-router-dom";

const faqData = [
  { question: "Jakie kultury do jogurtu?", answer: "Yo-Mix, LAMBDA, Beaugel Yog, Natural Yogurt — lub łyżka dobrego jogurtu naturalnego jako starter." },
  { question: "W jakiej temperaturze pracują kultury jogurtowe?", answer: "42–45°C. Poniżej 40°C fermentacja praktycznie staje, powyżej 46°C bakterie zaczynają ginąć." },
  { question: "Czy kultura jogurtowa nadaje się do sera?", answer: "Do serów podpuszczkowych zwykle nie. Kultura jogurtowa zakwasza szybko i mocno w wysokiej temperaturze, a ser potrzebuje wolniejszego zakwaszania i innego profilu smaku. Do serów włoskich używa się kultur termofilnych serowarskich (TA-61, MST, LH-100)." },
  { question: "Czy zrobię jogurt z mleka koziego?", answer: "Tak — najlepiej kulturą zalecaną do mleka koziego (np. LAMBDA 10). Jogurt kozi wychodzi rzadszy, bo kazeina koziego mleka tworzy słabszy żel." },
  { question: "Ile razy można przekładać własny jogurt jako zakwas?", answer: "Zwykle 4–5 razy. Z każdym pasażem proporcja obu szczepów się przesuwa i jogurt robi się coraz kwaśniejszy oraz rzadszy." },
];

const Glo = ({ term, children }: { term: string; children: string }) => (
  <a href={`/slownik.html#${term}`} target="_blank" rel="noopener noreferrer" className="decoration-dotted underline-offset-2">
    {children}
  </a>
);

const KulturyJogurtowe = () => (
  <KulturaGuideLayout
    title="Kultury jogurtowe — które wybrać i ile dodać"
    subtitle="Kultury jogurtowe to termofilne bakterie pracujące w 42–45°C. Poniżej: jakie szczepy wybrać, do jakich produktów się nadają, czym różnią się od kultur serowarskich i ile dodać na litr mleka."
    metaTitle="Kultury jogurtowe — które wybrać i ile dodać | Moja Serowarnia"
    metaDescription="Kultury jogurtowe: szczepy (Yo-Mix, LAMBDA, Beaugel Yog), temperatura pracy 42–45°C, dawkowanie na 1–25 L, porównanie z kulturami mezofilnymi i termofilnymi serowarskimi."
    breadcrumb={[{ label: "Kultury serowarskie", href: "/kultury/przewodnik" }, { label: "Jogurtowe" }]}
    bazaType="jogurtowe"
    bazaCtaLabel="Przeglądaj kultury jogurtowe w bazie"
    related={[
      { label: "Kultury bakteryjne do serów — przewodnik", href: "/kultury/przewodnik" },
      { label: "Kultury mezofilne do sera", href: "/kultury/mezofilne" },
      { label: "Kultury termofilne do sera", href: "/kultury/termofilne" },
      { label: "Sery i nabiał wege — jak to możliwe", href: "/sery-wege" },
      { label: "Domowy jogurt — przepis krok po kroku", href: "/przepisy/jogurt-domowy" },
      { label: "Domowy kefir — przepis krok po kroku", href: "/przepisy/kefir-domowy" },
      { label: "Pełna baza kultur", href: "/baza-kultur" },
    ]}
  >
    <FAQSchema faqs={faqData} />

    <h2>Co to są kultury jogurtowe?</h2>
    <p>
      To zestaw bakterii — przede wszystkim <em>Streptococcus thermophilus</em> i{" "}
      <em>Lactobacillus delbrueckii</em> subsp. <em>bulgaricus</em> — które fermentują mleko w temperaturze
      42–45°C, nadając mu kwaskowy smak i gęstą teksturę. Oba szczepy pracują w symbiozie: paciorkowiec startuje
      szybciej i zużywa tlen, pałeczka rozkłada białko na aminokwasy, których potrzebuje paciorkowiec. Razem
      zakwaszają mleko szybciej niż każdy z osobna. Część kultur zawiera też szczepy probiotyczne.
    </p>

    <h2>Do jakich produktów kultury jogurtowe?</h2>
    <ul>
      <li>Jogurt naturalny i owocowy</li>
      <li>Jogurt grecki (ten sam jogurt, tylko odcedzony z <Glo term="serwatka">serwatki</Glo>)</li>
      <li>Labneh — serek do smarowania z długo odcedzanego jogurtu</li>
      <li>Maślanka i napoje fermentowane</li>
      <li>Mleko owcze i kozie — jogurty regionalne</li>
    </ul>
    <p>
      Do serów podpuszczkowych kultury jogurtowe zwykle się nie nadają — zakwaszają za szybko i za mocno.
      Wyjątkiem bywa dodatek startowy przy mozzarelli, ale i tam pewniejsze są{" "}
      <Link to="/kultury/termofilne">kultury termofilne serowarskie</Link>.
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

    <h2>Kultury jogurtowe a mezofilne i termofilne serowarskie</h2>
    <p>
      Kultury jogurtowe są technicznie termofilne, ale to nie to samo co{" "}
      <Link to="/kultury/termofilne">termofilne kultury serowarskie</Link>. Różni je tempo zakwaszania i profil
      smaku, a nie sama temperatura pracy.
    </p>
    <table>
      <thead>
        <tr><th>Typ</th><th>Temperatura</th><th>Do czego</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Jogurtowe</strong></td><td>42–45°C</td><td>jogurt, jogurt grecki, labneh — szybkie i mocne zakwaszanie</td></tr>
        <tr><td><Link to="/kultury/termofilne">Termofilne serowarskie</Link></td><td>37–55°C</td><td>caciotta, mozzarella, parmezan — zakwaszanie wolniejsze, inny profil smaku</td></tr>
        <tr><td><Link to="/kultury/mezofilne">Mezofilne</Link></td><td>25–35°C</td><td>gouda, twaróg, cheddar, sery świeże i półtwarde</td></tr>
      </tbody>
    </table>

    <h2>Dawkowanie kultur jogurtowych — ile na ile litrów</h2>
    <p>
      Dawkę zawsze dobieraj według opakowania — producenci różnią się aktywnością{" "}
      <Glo term="liofilizat">liofilizatu</Glo>. Orientacyjnie:
    </p>
    <table>
      <thead>
        <tr><th>Ilość mleka</th><th>Kultura LYO (orientacyjnie)</th></tr>
      </thead>
      <tbody>
        <tr><td>1–2 L</td><td>szczypta, ok. 1/16–1/8 łyżeczki</td></tr>
        <tr><td>5 L</td><td>ok. 1/4 łyżeczki</td></tr>
        <tr><td>10 L</td><td>ok. 1/2 łyżeczki</td></tr>
        <tr><td>25 L</td><td>ok. 1 łyżeczka</td></tr>
      </tbody>
    </table>
    <p>
      Zamiast kultury można użyć <strong>2–3 łyżek świeżego jogurtu naturalnego na litr mleka</strong>. Taki zakwas
      działa zwykle przez 4–5 pasaży — potem proporcja obu szczepów się rozjeżdża i jogurt robi się coraz kwaśniejszy
      oraz rzadszy.
    </p>
    <p>
      Rozsyp kulturę na powierzchni mleka o temperaturze 42–45°C, odczekaj minutę na rehydrację i delikatnie wmieszaj.
    </p>

    <div className="my-8 rounded-xl border border-accent/30 bg-accent/5 p-5">
      <h2 className="mt-0 text-accent">Chcesz przepis, a nie kultury?</h2>
      <p className="mb-3">
        Ta strona dotyczy samych kultur. Pełny przepis — z temperaturami, czasem, metodą bez jogurtownicy i
        rozwiązaniem typowych problemów — jest osobno:
      </p>
      <ul className="mb-0">
        <li>
          <Link to="/przepisy/jogurt-domowy" className="font-semibold">
            Jak zrobić domowy jogurt — krok po kroku
          </Link>{" "}
          (42–45°C, 4–8 h, jogurt grecki, zakwas na kolejne partie)
        </li>
        <li>
          <Link to="/przepisy/kefir-domowy" className="font-semibold">
            Jak zrobić domowy kefir
          </Link>{" "}
          (grzybki tybetańskie, 20–25°C, także bez ziaren)
        </li>
        <li>
          <Link to="/przepisy/ser-z-jogurtu" className="font-semibold">
            Ser i twaróg z jogurtu lub kefiru
          </Link>{" "}
          (labneh, twaróg, masło)
        </li>
      </ul>
    </div>

    <h2>Najczęstsze pytania (FAQ)</h2>
    <h3>Jakie kultury do jogurtu?</h3>
    <p>Yo-Mix, LAMBDA, Beaugel Yog, Natural Yogurt — lub łyżka dobrego jogurtu naturalnego.</p>
    <h3>W jakiej temperaturze pracują kultury jogurtowe?</h3>
    <p>42–45°C. Poniżej 40°C fermentacja praktycznie staje, powyżej 46°C bakterie zaczynają ginąć.</p>
    <h3>Czy kultura jogurtowa nadaje się do sera?</h3>
    <p>
      Do serów podpuszczkowych zwykle nie — zakwasza za szybko i za mocno. Do serów włoskich używa się kultur
      termofilnych serowarskich (TA-61, MST, LH-100).
    </p>
    <h3>Z mleka koziego?</h3>
    <p>Tak — najlepiej kulturą zalecaną do koziego (np. LAMBDA 10). Jogurt wychodzi rzadszy niż z krowiego.</p>
    <h3>Ile razy można przekładać własny jogurt jako zakwas?</h3>
    <p>Zwykle 4–5 razy, potem trzeba wrócić do świeżej kultury.</p>
  </KulturaGuideLayout>
);

export default KulturyJogurtowe;
