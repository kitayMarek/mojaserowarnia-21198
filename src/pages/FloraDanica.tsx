/**
 * Flora Danica: kultura z przepisów, której nie ma w żadnym sklepie z bazy.
 *
 * Układ jak na stronie pojedynczej kultury (src/pages/KulturaStrona.tsx), z jedną
 * różnicą: fakty idą z karty producenta (src/data/floraDanica.ts), a nie z oferty
 * sklepu, bo oferty nie ma. Dlatego nie ma tu ceny ani przycisku „Kup".
 *
 * ZAMIENNIKI LICZYMY NA ŻYWO z bazy, po typie składu LD (czyTypLD w src/lib/grupyKultur.ts),
 * najtańsze za litr mleka na górze. Przy zmianie cen strona zmienia się sama.
 *
 * Mirror dla botów: public/kultury/flora-danica.html ze scripts/gen-kultury-strony.py.
 * Obie warstwy biorą tekst z floraDanica.ts, tytuł i opis z metaStron.ts.
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { useCultures } from "@/hooks/useCultures";
import { adresKultury, zaLitr } from "@/lib/adresKultury";
import { czyTypLD } from "@/lib/grupyKultur";
import { floraDanica as fd, ADRES_FLORA_DANICA } from "@/data/floraDanica";
import { recipesData } from "@/data/recipesData";

// Te same zasady zaokrąglania co na stronie kultury: przy dużych opakowaniach
// cena litra idzie w grosze i trzecie miejsce po przecinku ma znaczenie.
const miejsca = (v: number) => (v < 0.1 ? 3 : 2);
const zl = (v: number, m = miejsca(v)) => v.toFixed(m).replace(".", ",");

/** „1 pozycja ma", „3 pozycje mają", „13 pozycji ma". Bliźniak: pozycje_ma() w generatorze. */
const pozycjeMa = (n: number) => {
  if (n === 1) return "1 pozycja ma";
  const d = n % 10;
  const s = n % 100;
  if (d >= 2 && d <= 4 && (s < 12 || s > 14)) return `${n} pozycje mają`;
  return `${n} pozycji ma`;
};

const FloraDanica = () => {
  const { cultures, loading } = useCultures();

  const zamienniki = useMemo(
    () =>
      cultures
        .filter((k) => czyTypLD(k.composition))
        .map((k) => ({ k, koszt: zaLitr(k.price_numeric, k.packLiters) }))
        // Bez ceny za litr na koniec: nie da się porównać, ale nie wolno ich ukryć.
        // Remis rozstrzyga nazwa, tak samo jak w mirrorze.
        .sort(
          (a, b) =>
            (a.koszt ?? Infinity) - (b.koszt ?? Infinity) ||
            a.k.name.localeCompare(b.k.name, "pl"),
        ),
    [cultures],
  );
  const najtanszy = zamienniki.find((z) => z.koszt != null);

  const przepisy = useMemo(
    () =>
      recipesData.filter((r) =>
        r.cultureSubstitutes.some((c) => c.strona === ADRES_FLORA_DANICA),
      ),
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <PageBreadcrumbs
          items={[
            { label: "Baza kultur", href: "/baza-kultur" },
            { label: fd.nazwa },
          ]}
        />

        <h1 className="text-3xl md:text-4xl font-display font-bold mt-4 mb-2">{fd.nazwa}</h1>
        <p className="text-muted-foreground mb-4">{[fd.typ, fd.producent].join(" · ")}</p>
        <p className="mb-8">{fd.wstep}</p>

        {/* ── GDZIE KUPIĆ ───────────────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-xl font-display font-bold mb-3">Gdzie kupić w Polsce</h2>
          <div className="rounded-lg border border-border p-4">
            <p>
              W żadnym z pięciu sklepów, które śledzimy ({fd.sprawdzoneSklepy.join(", ")}),
              Flora Danica nie jest w ofercie. Sprawdzone {fd.sprawdzono}.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Dlatego nie podajemy ceny ani kosztu litra: nie ma ich z czego policzyć.{" "}
              {fd.opakowanie}
            </p>
          </div>
        </section>

        {/* ── CZYM ZASTĄPIĆ ─────────────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-xl font-display font-bold mb-3">Czym ją zastąpić</h2>

          {loading ? (
            <p className="text-muted-foreground">Wczytuję…</p>
          ) : zamienniki.length === 0 ? (
            <p className="text-muted-foreground">
              W naszej bazie żadna kultura nie ma tego samego typu składu. To nie znaczy, że
              zamiennika nie ma, znaczy, że my go nie mamy.
            </p>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                W bazie {pozycjeMa(zamienniki.length)} ten sam typ składu LD: trzy podgatunki
                Lactococcus lactis i Leuconostoc, bez innych bakterii.
                {najtanszy && najtanszy.koszt != null && (
                  <>
                    {" "}
                    Najtańsza wychodzi <strong>{zl(najtanszy.koszt)} zł za litr</strong> mleka.
                  </>
                )}
              </p>

              <ul className="space-y-2">
                {zamienniki.map(({ k, koszt }) => (
                  <li
                    key={`${k.name}-${k.shop}`}
                    className="rounded-lg border border-border p-3 flex flex-wrap gap-x-4 gap-y-1 items-baseline"
                  >
                    <Link to={`/kultury/${adresKultury(k.name)}`} className="font-medium underline">
                      {k.name}
                    </Link>
                    <span className="text-sm text-muted-foreground">{k.shop}</span>
                    <span className="text-sm tabular-nums">
                      {koszt != null ? `${zl(koszt)} zł/L` : "cena za litr nieznana"}
                    </span>
                    {k.application && (
                      <span className="text-sm text-muted-foreground basis-full">{k.application}</span>
                    )}
                  </li>
                ))}
              </ul>

              <p className="text-sm text-muted-foreground mt-4">
                <strong>Ten sam typ składu to nie to samo, co ten sam produkt.</strong> Producenci
                dobierają konkretne szczepy i ich proporcje, a tego żadna tabela nie pokazuje. Przy
                Flora Danica dochodzi jeszcze jedno: producent nie podaje gatunku Leuconostoc, więc
                porównujemy po rodzaju. Przed zamianą porównaj zastosowanie, nie tylko skład.
              </p>
            </>
          )}
        </section>

        {/* ── CO JEST W ŚRODKU ──────────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-xl font-display font-bold mb-3">Co jest w środku</h2>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            {fd.sklad.map((s) => (
              <li key={s}>
                <em>{s}</em>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground mb-4">{fd.skladUwaga}</p>
          <p className="mb-2">
            <strong>Do czego (wg producenta):</strong> {fd.zastosowanie}
          </p>
          <p className="mb-2">
            <strong>Temperatura pracy:</strong> {fd.temperatura}
          </p>
          <p className="mb-2">
            <strong>Dawkowanie wg producenta:</strong> {fd.dawka}
          </p>
          <p>
            <strong>Przechowywanie:</strong> {fd.przechowywanie}
          </p>
        </section>

        {przepisy.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-display font-bold mb-3">Przepisy, w których występuje</h2>
            <ul className="list-disc pl-5 space-y-1">
              {przepisy.map((r) => (
                <li key={r.id}>
                  <Link to={`/przepisy/${r.id}`} className="underline">
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-10">
          <h2 className="text-xl font-display font-bold mb-3">Źródła</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {fd.zrodla.map((z) => (
              <li key={z.url}>
                <a href={z.url} target="_blank" rel="noopener noreferrer" className="underline">
                  {z.tytul}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <nav className="flex flex-wrap gap-4 text-sm border-t border-border pt-6">
          <Link to="/kultury/mezofilne" className="underline">Kultury mezofilne</Link>
          <Link to="/baza-kultur" className="underline">Cała baza kultur</Link>
          <Link to="/porownywarka-kultur" className="underline">Porównaj kilka naraz</Link>
          <Link to="/zamienniki-kultur" className="underline">Wszystkie grupy zamienników</Link>
        </nav>
      </div>
      <Footer />
    </div>
  );
};

export default FloraDanica;
