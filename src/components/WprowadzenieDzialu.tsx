import { Link } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";

interface Blok {
  /** Krótki tytuł — to on ma być czytelny przy przewijaniu */
  tytul: string;
  tekst: string;
}

interface Trop {
  /** Sytuacja czytelnika, np. „Pierwszy raz robisz ser" */
  sytuacja: string;
  /** Co mu proponujemy — krótko, konkretnie */
  propozycja: string;
  href: string;
  etykieta: string;
}

interface Props {
  /** Zdanie otwierające — duże, ustawia ramę dla reszty */
  lead: string;
  /** Główna struktura tekstu jako karty. Bez nich sekcja to sam lead. */
  bloki?: Blok[];
  /** Akapit domykający, mniejszy od leadu */
  podsumowanie?: string;
  tropy?: Trop[];
  tytulTropow?: string;
}

/**
 * Wprowadzenie do działu: mówi czytelnikowi o NIM, a nie o zawartości strony.
 *
 * Powstało, bo „W skrócie (TL;DR)" opisywało wyłącznie stronę („25 sprawdzonych
 * przepisów od łatwych po zaawansowane") — informowało, ale nie orientowało.
 *
 * Druga wersja miała już dobrą treść, ale pięć akapitów o identycznym kroju,
 * kolorze i szerokości wyglądało jak ściana tekstu. Uwaga Marka: „wizualnie
 * wcale nie zachęca do czytania, ludzie to raczej wzrokowcy". Dlatego struktura
 * jest teraz WIDOCZNA: lead większym stopniem, główne wątki jako numerowane
 * karty (czytelnik widzi „trzy powody" bez czytania), miara ograniczona do
 * ok. 70 znaków w wierszu.
 */
const WprowadzenieDzialu = ({
  lead,
  bloki,
  podsumowanie,
  tropy,
  tytulTropow = "Od czego zacząć",
}: Props) => {
  return (
    <section className="mb-10" aria-label="Wprowadzenie do działu">
      {/* Lead: większy stopień i pełny kontrast — to on zatrzymuje wzrok. */}
      <p className="max-w-[58ch] text-lg leading-relaxed text-foreground md:text-xl">
        {lead}
      </p>

      {bloki && bloki.length > 0 && (
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {bloki.map((b, i) => (
            <div
              key={i}
              className="relative rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
            >
              {/* Numer robi ze ściany tekstu policzalną strukturę. */}
              <span
                aria-hidden="true"
                className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent"
              >
                {i + 1}
              </span>
              <h3 className="mb-2 font-display text-base font-bold text-accent">
                {b.tytul}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{b.tekst}</p>
            </div>
          ))}
        </div>
      )}

      {podsumowanie && (
        <p className="mt-6 max-w-[68ch] text-base leading-relaxed text-muted-foreground">
          {podsumowanie}
        </p>
      )}

      {tropy && tropy.length > 0 && (
        <div className="mt-7 overflow-hidden rounded-xl border border-primary/20 bg-primary/5">
          <h2 className="flex items-center gap-2 border-b border-primary/25 px-5 py-3.5 text-base font-semibold text-accent">
            <Compass className="h-4 w-4" aria-hidden="true" />
            {tytulTropow}
          </h2>
          <ul className="divide-y divide-primary/10">
            {tropy.map((t, i) => (
              <li key={i} className="px-5 py-3">
                <Link
                  to={t.href}
                  className="group flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-sm"
                >
                  <span className="font-semibold text-foreground">{t.sytuacja}</span>
                  <span className="text-muted-foreground">{t.propozycja}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-accent underline underline-offset-2 group-hover:no-underline">
                    {t.etykieta}
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default WprowadzenieDzialu;
