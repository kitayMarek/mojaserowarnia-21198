/**
 * Strona pojedynczej kultury — odpowiedź na trzy sytuacje, w których ktoś
 * naprawdę szuka: kultura jest ZA DROGA, NIE MA JEJ, albo ZMIENIŁA NAZWĘ.
 *
 * DLACZEGO OSOBNA STRONA, A NIE KOLEJNA ZAKŁADKA W BAZIE
 * Baza odpowiada na pytanie „co istnieje", porównywarka na „które z tych dwóch",
 * a zamienniki na „co ma ten sam skład". Żadna nie odpowiada na pytanie, które
 * człowiek faktycznie ma w ręku: „mam opakowanie X, i co teraz". To jest pytanie
 * o JEDNĄ kulturę, więc dostaje jeden adres.
 *
 * ZŁOTÓWKI ZA LITR SĄ TU KLUCZEM SORTOWANIA, nie ozdobą. Opakowania w bazie idą
 * od 5 do 5000 litrów mleka, więc cena na metce nie mówi nic o tym, co jest tańsze.
 * Zamienniki układamy po koszcie litra i pokazujemy różnicę wprost.
 *
 * OSTROŻNIE Z ZAMIENNIKAMI: ten sam skład gatunkowy NIE znaczy ten sam produkt —
 * powód stoi w src/lib/grupyKultur.ts i jest powtórzony dla czytelnika niżej.
 */

import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import BuyButton from "@/components/BuyButton";
import { useCultures, useCultureDetail } from "@/hooks/useCultures";
import { useMetaStrony } from "@/hooks/useMetaStrony";
import { adresKultury, znajdzKulture, zaLitr } from "@/lib/adresKultury";
import { grupujPoSkladzie, ladnyGatunek, type KulturaWejscie } from "@/lib/grupyKultur";

// Ile miejsc po przecinku ma sens: przy opakowaniach na 5000 L cena litra idzie
// w grosze. Liczba miejsc MUSI byc wspolna dla ceny i dla roznicy — inaczej
// wychodzi "0,19 zl/L" obok "-0,010 zl/L", co wyglada jak inna jednostka.
const miejsca = (v: number) => (v < 0.1 ? 3 : 2);
const zl = (v: number, m = miejsca(v)) => v.toFixed(m).replace(".", ",");

const KulturaStrona = () => {
  const { slug = "" } = useParams();
  const { cultures, loading } = useCultures();

  const kultura = useMemo(() => znajdzKulture(cultures, slug), [cultures, slug]);
  const { priceHistory } = useCultureDetail(kultura?.id ?? null);

  // Grupę składu liczymy tym samym silnikiem co strona zamienników — gdyby
  // normalizacja kiedyś się zmieniła, obie strony zmienią się razem.
  const grupa = useMemo(() => {
    if (!kultura) return null;
    const grupy = grupujPoSkladzie(cultures as unknown as KulturaWejscie[]);
    return grupy.find((g) => g.kultury.some((k) => k.name === kultura.name)) ?? null;
  }, [cultures, kultura]);

  const mojKoszt = zaLitr(kultura?.price_numeric, kultura?.packLiters);

  /** Zamienniki: ten sam skład, bez nas samych, najtańsze za litr na górze. */
  const zamienniki = useMemo(() => {
    if (!grupa || !kultura) return [];
    return grupa.kultury
      .filter((k) => k.name !== kultura.name)
      .map((k) => ({ k, koszt: zaLitr(k.price_numeric, k.packLiters) }))
      // Pozycje bez ceny za litr lądują na końcu — nie da się ich porównać,
      // ale wyrzucenie ich zataiłoby istnienie zamiennika.
      .sort((a, b) => (a.koszt ?? Infinity) - (b.koszt ?? Infinity));
  }, [grupa, kultura]);

  const tansze = zamienniki.filter(
    (z) => mojKoszt != null && z.koszt != null && z.koszt < mojKoszt,
  );

  /** Ta sama nazwa w innym sklepie — przypadek „nie ma jej [w moim sklepie]". */
  const inneSklepy = useMemo(
    () => (kultura ? cultures.filter((k) => k.name === kultura.name && k.shop !== kultura.shop) : []),
    [cultures, kultura],
  );

  useMetaStrony(
    kultura ? `${kultura.name} — cena za litr, skład i zamienniki` : undefined,
    kultura
      ? `${kultura.name}: skład ${kultura.composition || "—"}, ${
          mojKoszt != null ? `${zl(mojKoszt)} zł za litr mleka, ` : ""
        }${zamienniki.length} zamiennik(ów) o tym samym składzie. Gdzie kupić i czym zastąpić.`
      : undefined,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-muted-foreground">Wczytuję…</div>
        <Footer />
      </div>
    );
  }

  if (!kultura) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <h1 className="text-2xl font-display font-bold mb-3">Nie mamy takiej kultury</h1>
          <p className="text-muted-foreground mb-6">
            Adres <code>{slug}</code> nie pasuje do żadnej pozycji w bazie. Nazwy bywają
            zapisywane różnie — najprościej poszukać w bazie.
          </p>
          <Link to="/baza-kultur" className="underline">
            Przejdź do bazy kultur →
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const szczepy = grupa?.szczepy ?? [];

  // Wiersze tabeli zamienników. Pierwszy to ta kultura jako punkt odniesienia
  // (pomysł z brewing.net: oryginał w pierwszym wierszu, zamienniki pod nim),
  // dzięki temu różnica przy każdym zamienniku ma się do czego odnieść wzrokiem.
  const wiersze = [{ k: kultura, koszt: mojKoszt, ta: true }, ...zamienniki.map((z) => ({ ...z, ta: false }))];
  const najwiekszyKoszt = Math.max(...wiersze.map((w) => w.koszt ?? 0));
  const najtanszy = tansze[0] ?? null;
  const zmianaCeny =
    typeof kultura.pricePrevious === "number" && typeof kultura.price_numeric === "number"
      ? kultura.price_numeric - kultura.pricePrevious
      : null;

  /** Różnica kosztu litra względem tej kultury, we wspólnej precyzji z ceną. */
  const opisRoznicy = (koszt: number | null) => {
    if (mojKoszt == null || koszt == null) return null;
    const roznica = koszt - mojKoszt;
    // Wspolna precyzja dla obu liczb w wierszu.
    const m = miejsca(Math.min(mojKoszt, koszt));
    // Roznica ponizej polowy ostatniego miejsca to ta sama cena.
    // Bez tego identyczne oferty pokazywaly sie jako "+0,000 zl/L".
    if (Math.abs(roznica) < 0.5 * 10 ** -m) return { tekst: "tyle samo", taniej: false };
    return { tekst: `${roznica < 0 ? "−" : "+"}${zl(Math.abs(roznica), m)} zł/L`, taniej: roznica < 0 };
  };

  // Szeroki układ z panelem bocznym i tekst 16 px zamiast wąskiej kolumny 768 px z tekstem 14 px
  // (porównanie kart z zamiennikami, 22.10.2026: brewing.net i Captain Brew mają 1140 px,
  // kluczowe dane w osobnym bloku, tekst 16-18 px). Na telefonie panel z ceną idzie pierwszy.
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Baza kultur", href: "/baza-kultur" },
          { label: kultura.name },
        ]}
      />

      <main className="pt-20">
        <div className="container mx-auto px-4 pb-12 max-w-6xl">
          <header className="mb-6">
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-2">{kultura.name}</h1>
            <p className="text-lg text-muted-foreground">
              {[kultura.type, kultura.temperature, kultura.manufacturer].filter(Boolean).join(" · ")}
            </p>
          </header>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] items-start lg:grid-rows-[auto_1fr]">
            {/* ── CENA ──────────────────────────────────────────────────────────── */}
            {/* Kolejność w kodzie = kolejność na telefonie: cena, zamienniki, dane. Na komputerze
                cena i dane stoją w prawej kolumnie, zamienniki zajmują lewą na całą wysokość. */}
            <section className="rounded-xl border border-border bg-card p-5 lg:col-start-2 lg:row-start-1">
              <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-2">Ile naprawdę kosztuje</h2>
              <div className="text-3xl font-semibold tabular-nums">{kultura.price || "?"}</div>
              {mojKoszt != null ? (
                <p className="mt-1 text-base">
                  opakowanie na {kultura.packLiters} L mleka,{" "}
                  <strong className="tabular-nums">{zl(mojKoszt)} zł za litr</strong>
                </p>
              ) : (
                <p className="mt-1 text-base text-muted-foreground">
                  Sklep nie podaje, na ile litrów mleka starcza opakowanie.
                </p>
              )}
              {zmianaCeny !== null && Math.abs(zmianaCeny) > 0.005 && (
                <p className={`mt-1 text-sm ${zmianaCeny > 0 ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"}`}>
                  {zmianaCeny > 0 ? "↑" : "↓"} wcześniej {zl(kultura.pricePrevious as number, 2)} zł
                </p>
              )}
              <div className="mt-4">
                <BuyButton
                  productUrl={kultura.productUrl}
                  shopUrl={kultura.shopUrl}
                  shopName={kultura.shop}
                  sklepId={kultura.sklepId}
                  cultureName={kultura.name}
                />
              </div>
              {inneSklepy.length > 0 && (
                <p className="text-sm mt-3">
                  Ta sama nazwa jest też w:{" "}
                  {inneSklepy.map((k, i) => (
                    <span key={k.id}>
                      {i > 0 && ", "}
                      {k.shop}
                      {k.price ? ` (${k.price})` : ""}
                    </span>
                  ))}
                  .
                </p>
              )}
              {priceHistory.length > 1 && (
                <p className="text-sm text-muted-foreground mt-3">
                  Cenę sprawdzaliśmy {priceHistory.length} razy. Najstarszy zapis:{" "}
                  {new Date(priceHistory[priceHistory.length - 1].recorded_at).toLocaleDateString("pl-PL")}
                  {priceHistory[priceHistory.length - 1].price_numeric != null &&
                    `, wtedy ${zl(priceHistory[priceHistory.length - 1].price_numeric!, 2)} zł`}
                  .
                </p>
              )}
            </section>

            <div className="min-w-0 lg:col-start-1 lg:row-start-1 lg:row-span-2 space-y-10 text-base">
              {/* ── CZYM ZASTĄPIĆ ─────────────────────────────────────────────── */}
              <section>
                <h2 className="text-2xl font-display font-bold mb-3">Czym ją zastąpić</h2>

                {zamienniki.length === 0 ? (
                  <p className="text-muted-foreground">
                    W naszej bazie żadna inna kultura nie ma tego samego składu szczepowego.
                    To nie znaczy, że zamiennika nie ma — znaczy, że my go nie mamy.
                  </p>
                ) : (
                  <>
                    {/* Odpowiedź w jednym zdaniu, zanim ktoś zacznie czytać tabelę
                        (brewing.net, Captain Brew). Bez wlasnego kosztu litra NIE WOLNO
                        napisac "zadna nie jest tansza": to zdanie brzmi jak wynik porownania,
                        a porownania nie bylo. Dotyczy 27 z 188 pozycji bez pojemnosci. */}
                    <p className="text-lg mb-4">
                      {mojKoszt == null ? (
                        <>
                          Sklep nie podaje, na ile litrów mleka starcza to opakowanie, więc kosztu
                          litra <strong>nie da się policzyć</strong>. Niżej {zamienniki.length}{" "}
                          {zamienniki.length === 1 ? "pozycja" : "pozycji"} o tym samym składzie z ich
                          kosztem litra: porównaj je z ceną na opakowaniu, które masz w ręku.
                        </>
                      ) : najtanszy ? (
                        <>
                          Najtańszy zamiennik o tym samym składzie to{" "}
                          <Link to={`/kultury/${adresKultury(najtanszy.k.name)}`} className="font-semibold underline">
                            {najtanszy.k.name}
                          </Link>{" "}
                          ({najtanszy.k.shop}): <strong>{zl(najtanszy.koszt as number)} zł za litr</strong>, o{" "}
                          {zl(mojKoszt - (najtanszy.koszt as number), miejsca(najtanszy.koszt as number))} zł mniej
                          niż {kultura.name}.
                          {tansze.length > 1 && ` Tańszych za litr jest ${tansze.length}.`}
                        </>
                      ) : (
                        <>
                          Ten sam skład ma {zamienniki.length}{" "}
                          {zamienniki.length === 1 ? "inna pozycja" : "innych pozycji"}, ale żadna nie
                          wychodzi taniej za litr niż {kultura.name}.
                        </>
                      )}
                    </p>

                    {/* Komputer: tabela z tą kulturą w pierwszym wierszu */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-base">
                        <thead className="bg-muted/50 text-sm text-muted-foreground">
                          <tr>
                            <th className="text-left font-medium px-4 py-3">Kultura</th>
                            <th className="text-left font-medium px-4 py-3">Sklep</th>
                            <th className="text-left font-medium px-4 py-3 w-56">Koszt litra mleka</th>
                            <th className="text-right font-medium px-4 py-3">Różnica</th>
                          </tr>
                        </thead>
                        <tbody>
                          {wiersze.map(({ k, koszt, ta }) => {
                            const r = ta ? null : opisRoznicy(koszt);
                            return (
                              <tr key={`${k.name}-${k.shop}`} className={`border-t border-border align-top ${ta ? "bg-primary/5" : ""}`}>
                                <td className="px-4 py-3">
                                  {ta ? (
                                    <span className="font-semibold">{k.name} <span className="text-sm font-normal text-muted-foreground">(ta kultura)</span></span>
                                  ) : (
                                    <Link to={`/kultury/${adresKultury(k.name)}`} className="font-semibold underline">{k.name}</Link>
                                  )}
                                  {k.application && <div className="text-sm text-muted-foreground mt-1">{k.application}</div>}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">{k.shop}</td>
                                <td className="px-4 py-3">
                                  {koszt != null ? (
                                    <>
                                      <div className="tabular-nums font-medium">{zl(koszt)} zł/L</div>
                                      <div className="mt-1 h-1.5 rounded bg-muted" aria-hidden="true">
                                        <div className={`h-1.5 rounded ${ta ? "bg-primary" : "bg-primary/50"}`} style={{ width: `${Math.max(4, (koszt / najwiekszyKoszt) * 100)}%` }} />
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground">nieznany</span>
                                  )}
                                </td>
                                <td className={`px-4 py-3 text-right tabular-nums whitespace-nowrap ${r?.taniej ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}`}>
                                  {ta ? "" : r ? r.tekst : "–"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Telefon: karty, koszt litra duży i po prawej */}
                    <ul className="md:hidden space-y-3">
                      {wiersze.map(({ k, koszt, ta }) => {
                        const r = ta ? null : opisRoznicy(koszt);
                        return (
                          <li key={`${k.name}-${k.shop}`} className={`rounded-xl border p-4 ${ta ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                {ta ? (
                                  <span className="font-semibold text-lg">{k.name}</span>
                                ) : (
                                  <Link to={`/kultury/${adresKultury(k.name)}`} className="font-semibold text-lg underline">{k.name}</Link>
                                )}
                                <div className="text-sm text-muted-foreground">{ta ? `ta kultura · ${k.shop}` : k.shop}</div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="tabular-nums font-semibold text-lg">{koszt != null ? `${zl(koszt)} zł/L` : "?"}</div>
                                {r && (
                                  <div className={`text-sm tabular-nums ${r.taniej ? "text-emerald-700 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}`}>{r.tekst}</div>
                                )}
                              </div>
                            </div>
                            {k.application && <p className="text-sm text-muted-foreground mt-2">{k.application}</p>}
                          </li>
                        );
                      })}
                    </ul>

                    <p className="text-sm text-muted-foreground mt-4">
                      <strong>Ten sam skład to nie to samo, co ten sam produkt.</strong> Producenci
                      dobierają konkretne szczepy w obrębie gatunku i ich proporcje, a tego żadna tabela
                      nie pokazuje. Widać to po przeznaczeniu, dlatego przed zamianą porównaj też, do
                      czego jest dana kultura, a nie tylko skład.
                    </p>
                  </>
                )}
              </section>

              {/* ── CO TO WŁAŚCIWIE JEST ──────────────────────────────────────── */}
              <section>
                <h2 className="text-2xl font-display font-bold mb-3">Co jest w środku</h2>
                {szczepy.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 mb-4">
                    {szczepy.map((s) => (
                      <li key={s}>
                        <em>{ladnyGatunek(s)}</em>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground mb-4">{kultura.composition || "Sklep nie podaje składu."}</p>
                )}
                {kultura.strainRatio && (
                  <p>
                    Proporcja szczepów: <strong>{kultura.strainRatio}</strong>. To rzadka informacja
                    i to ona rozstrzyga o zamienności w obrębie tego samego składu.
                  </p>
                )}
              </section>

            </div>

            {/* ── NAJWAŻNIEJSZE DANE ─────────────────────────────────────────── */}
            <section className="rounded-xl border border-border bg-card p-5 lg:col-start-2 lg:row-start-2">
              <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">Najważniejsze</h2>
              <dl className="space-y-3 text-base">
                {kultura.type && (
                  <div><dt className="text-sm text-muted-foreground">Typ</dt><dd className="font-medium">{kultura.type}</dd></div>
                )}
                {kultura.temperature && (
                  <div><dt className="text-sm text-muted-foreground">Temperatura pracy</dt><dd className="font-medium">{kultura.temperature}</dd></div>
                )}
                {kultura.doseLabel && (
                  <div><dt className="text-sm text-muted-foreground">Dawkowanie wg sklepu</dt><dd className="font-medium">{kultura.doseLabel}</dd></div>
                )}
                {kultura.manufacturer && (
                  <div><dt className="text-sm text-muted-foreground">Producent</dt><dd className="font-medium">{kultura.manufacturer}</dd></div>
                )}
                {kultura.application && (
                  <div><dt className="text-sm text-muted-foreground">Do czego</dt><dd>{kultura.application}</dd></div>
                )}
              </dl>
            </section>

            <nav className="flex flex-wrap gap-4 border-t border-border pt-6 lg:col-span-2">
              <Link to="/baza-kultur" className="underline">Cała baza kultur</Link>
              <Link to="/porownywarka-kultur" className="underline">Porównaj kilka naraz</Link>
              <Link to="/zamienniki-kultur" className="underline">Wszystkie grupy zamienników</Link>
            </nav>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default KulturaStrona;
