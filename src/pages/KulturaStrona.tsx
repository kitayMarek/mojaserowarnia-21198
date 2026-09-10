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
import CenaKultury from "@/components/CenaKultury";
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <PageBreadcrumbs
          items={[
            { label: "Baza kultur", href: "/baza-kultur" },
            { label: kultura.name },
          ]}
        />

        <h1 className="text-3xl md:text-4xl font-display font-bold mt-4 mb-2">{kultura.name}</h1>
        <p className="text-muted-foreground mb-8">
          {[kultura.type, kultura.temperature, kultura.manufacturer].filter(Boolean).join(" · ")}
        </p>

        {/* ── ILE NAPRAWDĘ KOSZTUJE ─────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-xl font-display font-bold mb-3">Ile naprawdę kosztuje</h2>
          <div className="rounded-lg border border-border p-4">
            <CenaKultury
              cena={kultura.price}
              cenaLiczbowo={kultura.price_numeric}
              cenaPoprzednia={kultura.pricePrevious}
              litry={kultura.packLiters}
            />
            <div className="mt-3 flex flex-wrap gap-3 items-center">
              <BuyButton
                productUrl={kultura.productUrl}
                shopUrl={kultura.shopUrl}
                shopName={kultura.shop}
                cultureName={kultura.name}
              />
              {kultura.doseLabel && (
                <span className="text-sm text-muted-foreground">
                  Dawkowanie wg sklepu: {kultura.doseLabel}
                </span>
              )}
            </div>
          </div>

          {priceHistory.length > 1 && (
            <p className="text-sm text-muted-foreground mt-3">
              Cenę sprawdzaliśmy {priceHistory.length} razy. Najstarszy zapis:{" "}
              {new Date(priceHistory[priceHistory.length - 1].recorded_at).toLocaleDateString("pl-PL")}
              {priceHistory[priceHistory.length - 1].price_numeric != null &&
                ` — wtedy ${zl(priceHistory[priceHistory.length - 1].price_numeric!)} zł`}
              .
            </p>
          )}

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
        </section>

        {/* ── CZYM ZASTĄPIĆ ─────────────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-xl font-display font-bold mb-3">Czym ją zastąpić</h2>

          {zamienniki.length === 0 ? (
            <p className="text-muted-foreground">
              W naszej bazie żadna inna kultura nie ma tego samego składu szczepowego.
              To nie znaczy, że zamiennika nie ma — znaczy, że my go nie mamy.
            </p>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                {/* Bez wlasnego kosztu litra NIE WOLNO napisac "zadna nie jest tansza" —
                    to zdanie brzmi jak wynik porownania, a porownania nie bylo.
                    Dotyczy 27 z 188 pozycji, ktorym sklep nie podaje pojemnosci. */}
                {mojKoszt == null ? (
                  <>
                    Sklep nie podaje, na ile litrów mleka starcza to opakowanie, więc kosztu
                    litra <strong>nie da się policzyć</strong> — a bez niego porównanie cen nie
                    ma sensu. Poniżej pozycje o tym samym składzie razem z ich kosztem litra;
                    porównaj je z ceną na opakowaniu, które masz w ręku.
                  </>
                ) : tansze.length > 0 ? (
                  <>
                    <strong>{tansze.length}</strong>{" "}
                    {tansze.length === 1 ? "pozycja jest tańsza" : "pozycje są tańsze"} za litr
                    mleka przy tym samym składzie.
                  </>
                ) : (
                  <>
                    Ten sam skład ma {zamienniki.length}{" "}
                    {zamienniki.length === 1 ? "inna pozycja" : "innych pozycji"} — żadna nie
                    wychodzi taniej za litr.
                  </>
                )}
              </p>

              <ul className="space-y-2">
                {zamienniki.map(({ k, koszt }) => {
                  const roznica = mojKoszt != null && koszt != null ? koszt - mojKoszt : null;
                  // Wspolna precyzja dla obu liczb w wierszu.
                  const m = miejsca(Math.min(mojKoszt ?? Infinity, koszt ?? Infinity));
                  // Roznica ponizej polowy ostatniego miejsca to ta sama cena.
                  // Bez tego identyczne oferty pokazywaly sie jako "+0,000 zl/L".
                  const tyleSamo = roznica != null && Math.abs(roznica) < 0.5 * 10 ** -m;
                  return (
                    <li
                      key={`${k.name}-${k.shop}`}
                      className="rounded-lg border border-border p-3 flex flex-wrap gap-x-4 gap-y-1 items-baseline"
                    >
                      <Link to={`/kultury/${adresKultury(k.name)}`} className="font-medium underline">
                        {k.name}
                      </Link>
                      <span className="text-sm text-muted-foreground">{k.shop}</span>
                      <span className="text-sm tabular-nums">
                        {koszt != null ? `${zl(koszt, m)} zł/L` : "cena za litr nieznana"}
                      </span>
                      {roznica != null && (
                        <span
                          className={`text-sm tabular-nums ${
                            !tyleSamo && roznica < 0 ? "text-emerald-700" : "text-muted-foreground"
                          }`}
                        >
                          {tyleSamo
                            ? "tyle samo"
                            : `${roznica < 0 ? "−" : "+"}${zl(Math.abs(roznica), m)} zł/L`}
                        </span>
                      )}
                      {k.application && (
                        <span className="text-sm text-muted-foreground basis-full">
                          {k.application}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              <p className="text-sm text-muted-foreground mt-4">
                <strong>Ten sam skład to nie to samo, co ten sam produkt.</strong> Producenci
                dobierają konkretne szczepy w obrębie gatunku i ich proporcje, a tego żadna tabela
                nie pokazuje. Widać to po przeznaczeniu — dlatego przed zamianą porównaj kolumnę
                „zastosowanie", a nie tylko skład.
              </p>
            </>
          )}
        </section>

        {/* ── CO TO WŁAŚCIWIE JEST ──────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-xl font-display font-bold mb-3">Co jest w środku</h2>
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
            <p className="mb-2">
              Proporcja szczepów: <strong>{kultura.strainRatio}</strong> — to rzadka informacja
              i to ona rozstrzyga o zamienności w obrębie tego samego składu.
            </p>
          )}
          {kultura.application && (
            <p className="mb-2">
              <strong>Do czego:</strong> {kultura.application}
            </p>
          )}
          {kultura.temperature && (
            <p>
              <strong>Temperatura pracy:</strong> {kultura.temperature}
            </p>
          )}
        </section>

        <nav className="flex flex-wrap gap-4 text-sm border-t border-border pt-6">
          <Link to="/baza-kultur" className="underline">Cała baza kultur</Link>
          <Link to="/porownywarka-kultur" className="underline">Porównaj kilka naraz</Link>
          <Link to="/zamienniki-kultur" className="underline">Wszystkie grupy zamienników</Link>
        </nav>
      </div>
      <Footer />
    </div>
  );
};

export default KulturaStrona;
