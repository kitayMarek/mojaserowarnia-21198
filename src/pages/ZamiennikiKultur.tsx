import { useMemo } from "react";
import { Link } from "react-router-dom";
import { GitBranch } from "lucide-react";
import KulturaGuideLayout from "@/components/KulturaGuideLayout";
import FAQSchema from "@/components/FAQSchema";
import BuyButton from "@/components/BuyButton";
import CenaKultury from "@/components/CenaKultury";
import { useCultures } from "@/hooks/useCultures";
import { grupujPoSkladzie, ladnyGatunek, type KulturaWejscie } from "@/lib/grupyKultur";

const ZamiennikiKultur = () => {
  const { cultures, loading } = useCultures();

  const grupy = useMemo(
    () => grupujPoSkladzie((cultures as unknown as KulturaWejscie[]) ?? []),
    [cultures]
  );

  const wszystkie = cultures?.length ?? 0;
  const wGrupach = grupy.reduce((s, g) => s + g.kultury.length, 0);
  const procent = wszystkie ? Math.round((100 * wGrupach) / wszystkie) : 0;

  const faqData = [
    {
      question: "Czy kultury o tym samym składzie to ten sam produkt?",
      answer:
        "Nie. Ten sam skład gatunkowy oznacza te same gatunki bakterii, ale producenci dobierają konkretne szczepy w obrębie gatunku i ich proporcje — a tego żadna tabela nie pokazuje. Widać to po przeznaczeniu: ML, MO, MSO i MLL mają identyczny skład, a służą do serów do smarowania, masła, twarogu i fety. Jako zamiennik zwykle zadziała, ale profil smaku i tempo zakwaszania mogą się różnić.",
    },
    {
      question: "Czym zastąpić kulturę, której nie ma w sklepie?",
      answer:
        "Poszukaj innej kultury o tym samym składzie szczepowym — ponad połowa pozycji w bazie ma skład wspólny z co najmniej jedną inną, często z innego sklepu. Przed zamianą sprawdź przeznaczenie i zakres temperatur, bo to one decydują, czy zamiennik pasuje do twojego sera.",
    },
    {
      question: "Co znaczy kultura starterowa?",
      answer:
        "Że startuje zakwaszanie mleka — a nie że jest dla początkujących. Kultura starterowa to szczepy bakterii kwasu mlekowego, które przetwarzają laktozę w kwas mlekowy, uruchamiając działanie podpuszczki i kształtując smak. Praktycznie każda kultura serowarska jest starterowa, więc sam ten przymiotnik niczego nie zawęża przy wyborze.",
    },
    {
      question: "Dlaczego ta sama kultura ma różne nazwy w różnych sklepach?",
      answer:
        "Bo nazwa jest handlowa, nie naukowa. Producenci — Danisco (Choozit), Sacco, Beaugel, ARTiVEG i inni — nadają własne oznaczenia, a każdy sklep sprzedaje to, co ma w umowie dystrybucyjnej. Ten sam Penicillium candidum figuruje jako PC, SIGMA 75, Penicillium Candidum PC 22 i PC Neige.",
    },
  ];

  return (
    <KulturaGuideLayout
      icon={GitBranch}
      title="Zamienniki kultur bakteryjnych — te same szczepy pod różnymi nazwami"
      subtitle="Ponad połowa kultur w polskich sklepach ma skład szczepowy wspólny z inną pozycją, tylko pod inną nazwą handlową. Poniżej pełne zestawienie: co jest w środku, jak się to nazywa, gdzie i za ile."
      metaTitle="Zamienniki kultur bakteryjnych — te same szczepy, inne nazwy | Moja Serowarnia"
      metaDescription="Czym zastąpić kulturę, której nie ma w sklepie: ponad połowa kultur ma skład wspólny z inną pozycją. Grupy składowe z nazwami handlowymi, sklepami i cenami."
      breadcrumb={[{ label: "Baza kultur", href: "/baza-kultur" }, { label: "Zamienniki" }]}
      related={[
        { label: "Kto produkuje kultury — marki własne i małe opakowania", href: "/kto-produkuje-kultury" },
        { label: "Baza kultur — wszystkie pozycje z cenami", href: "/baza-kultur" },
        { label: "Porównywarka kultur — zestaw dwie obok siebie", href: "/porownywarka-kultur" },
        { label: "Kultury mezofilne", href: "/kultury/mezofilne" },
        { label: "Kultury termofilne", href: "/kultury/termofilne" },
        { label: "Przepisy na sery — która kultura do którego sera", href: "/przepisy" },
      ]}
    >
      <FAQSchema faqs={faqData} />

      <div className="not-prose my-6 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30 p-4 text-foreground">
        <strong>Zanim podmienisz:</strong> ten sam skład gatunkowy <strong>nie znaczy „ten sam produkt"</strong>.
        Producenci dobierają konkretne szczepy w obrębie gatunku i ich proporcje — tego nie widać w żadnej tabeli.
        Najlepiej pokazuje to grupa <em>Lactococcus lactis + cremoris</em>: ML, MO, MSO i MLL mają identyczny skład,
        a służą kolejno do serów do smarowania, masła, twarogu i fety. Zamiennik zwykle zadziała, ale{" "}
        <strong>sprawdź przeznaczenie i zakres temperatur</strong>.
      </div>

      <div className="not-prose my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 text-foreground">
        <strong>Twardy dowód, że to nie ostrożność na wyrost:</strong> jeden ze sklepów podaje przy linii LAMBDA
        proporcje szczepów. <strong>LAMBDA 3 ma 50:50, a LAMBDA 6, 7, 8 i 9 mają 80:20</strong> — przy identycznym
        składzie gatunkowym w naszej bazie. W tabeli poniżej trafiają do jednej grupy, ale zachowają się inaczej.
        Więcej o tym w tekście o <Link to="/kto-produkuje-kultury">producentach kultur</Link>.
      </div>

      <h2>Co znaczy „kultura starterowa"?</h2>
      <p>
        Że <strong>startuje zakwaszanie mleka</strong> — a nie że jest dla początkujących. To najczęstsze
        nieporozumienie przy pierwszych zakupach, bo po polsku „starter" brzmi jak „na start".
      </p>
      <p>
        Kultura starterowa to szczepy bakterii kwasu mlekowego, które przerabiają laktozę na kwas mlekowy: obniżają pH,
        uruchamiają działanie{" "}
        <a href="/slownik.html#podpuszczka" target="_blank" rel="noopener noreferrer">
          podpuszczki
        </a>{" "}
        i kształtują smak. <strong>Praktycznie każda kultura serowarska jest starterowa</strong>, więc sam ten
        przymiotnik niczego nie zawęża przy wyborze — trzeba patrzeć na skład, temperaturę i przeznaczenie.
      </p>

      <h2>Dlaczego jedna kultura ma tyle nazw?</h2>
      <p>
        Bo nazwa jest handlowa, nie naukowa. Producenci — Danisco (Choozit), Sacco, Beaugel, ARTiVEG i inni — nadają
        własne oznaczenia, a każdy sklep sprzedaje to, co ma w umowie dystrybucyjnej. Ten sam{" "}
        <em>Penicillium candidum</em> figuruje jako PC, SIGMA 75, Penicillium Candidum PC 22 i PC Neige.
      </p>
      <p>
        Żaden sklep nie może tego pokazać, bo widzi wyłącznie własny katalog. To zestawienie powstaje z porównania
        pięciu naraz — <Link to="/baza-kultur">Lactic.pl, Wańczykówki, Serowar.pl, Artiser.pl i GAP Poland</Link>.
      </p>

      {loading ? (
        <p className="text-muted-foreground">Wczytywanie zestawienia…</p>
      ) : (
        <>
          <h2>
            Grupy składowe — {grupy.length}{" "}
            {grupy.length === 1 ? "zestaw" : grupy.length < 5 ? "zestawy" : "zestawów"}
          </h2>
          <p>
            Na {wszystkie} kultur <strong>{wGrupach} pozycji ({procent}%)</strong> dzieli skład z inną. Grupy
            uporządkowane od najliczniejszej.
          </p>

          {grupy.map((g) => (
            <div key={g.id} className="not-prose my-8">
              <h3 id={g.id} className="text-base font-display font-bold text-foreground mb-1">
                {g.szczepy.map(ladnyGatunek).join(" + ")}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {new Set(g.kultury.map((k) => k.name)).size} nazw handlowych · {g.sklepy.length}{" "}
                {g.sklepy.length === 1 ? "sklep" : "sklepy"}
                {g.cenaMin !== null && (
                  <>
                    {" · "}
                    {g.cenaMax !== null && Math.abs(g.cenaMax - g.cenaMin) < 0.01
                      ? `${g.cenaMin.toFixed(2)} zł`
                      : `od ${g.cenaMin.toFixed(2)} do ${g.cenaMax?.toFixed(2)} zł`}
                  </>
                )}
              </p>
              {g.rozneProporcje && (
                <p className="text-sm mb-2 font-semibold text-red-700 dark:text-red-400">
                  To NIE są zamienniki: pozycje w tej grupie mają różne proporcje szczepów mimo
                  identycznego składu gatunkowego.
                </p>
              )}
              {g.rozneZastosowania && (
                <p className="text-sm mb-2">
                  <span className="font-semibold text-red-700 dark:text-red-400">Uwaga:</span> pozycje w tej grupie
                  mają <strong>różne przeznaczenie</strong> mimo identycznego składu — porównaj kolumnę „Do czego"
                  przed zamianą.
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-amber-50 dark:bg-amber-950/30">
                      <th className="border border-border p-2 text-left">Nazwa handlowa</th>
                      <th className="border border-border p-2 text-left">Sklep</th>
                      <th className="border border-border p-2 text-left">Cena</th>
                      <th className="border border-border p-2 text-left">Proporcje</th>
                      <th className="border border-border p-2 text-left">Temperatura</th>
                      <th className="border border-border p-2 text-left">Do czego</th>
                      <th className="border border-border p-2 text-left">&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.kultury.map((k, i) => (
                      <tr key={`${g.id}-${k.name}-${i}`}>
                        <td className="border border-border p-2">
                          <span className="font-semibold">{k.name}</span>
                          {k.manufacturer && (
                            <span className="block text-xs text-muted-foreground">{k.manufacturer}</span>
                          )}
                        </td>
                        <td className="border border-border p-2">{k.shop}</td>
                        <td className="border border-border p-2">
                          <CenaKultury
                            cena={k.price}
                            cenaLiczbowo={k.price_numeric}
                            cenaPoprzednia={k.pricePrevious}
                            litry={k.packLiters}
                            waski
                          />
                        </td>
                        <td className="border border-border p-2 whitespace-nowrap font-semibold">
                          {k.strainRatio || (
                            <span
                              className="font-normal text-muted-foreground"
                              title="Sklep nie podaje proporcji szczepów"
                            >
                              ?
                            </span>
                          )}
                        </td>
                        <td className="border border-border p-2 whitespace-nowrap">{k.temperature || "—"}</td>
                        <td className="border border-border p-2">{k.application || "—"}</td>
                        <td className="border border-border p-2">
                          <BuyButton
                            productUrl={k.productUrl}
                            shopUrl={k.shopUrl}
                            shopName={k.shop}
                            cultureName={k.name}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}

      <h2>Najczęstsze pytania</h2>
      {faqData.map((f) => (
        <div key={f.question}>
          <h3>{f.question}</h3>
          <p>{f.answer}</p>
        </div>
      ))}
    </KulturaGuideLayout>
  );
};

export default ZamiennikiKultur;
