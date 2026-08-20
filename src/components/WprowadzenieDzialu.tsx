import { Link } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";

interface Trop {
  /** Sytuacja czytelnika, np. „Pierwszy raz robisz ser" */
  sytuacja: string;
  /** Co mu proponujemy — krótko, konkretnie */
  propozycja: string;
  href: string;
  etykieta: string;
}

interface Props {
  children: React.ReactNode;
  tropy?: Trop[];
  tytulTropow?: string;
}

/**
 * Wprowadzenie do działu: kilka akapitów mówiących CZYTELNIKOWI O NIM SAMYM,
 * plus konkretne tropy z odnośnikami.
 *
 * Powstało, bo dotychczasowe „W skrócie (TL;DR)" opisywało wyłącznie zawartość
 * strony („25 sprawdzonych przepisów od łatwych po zaawansowane"). To informuje,
 * ale nie orientuje: ktoś, kto pierwszy raz chce zrobić ser, i ktoś, kto szuka
 * konkretnego sera niedostępnego w sklepie, potrzebują różnych wskazówek, a
 * dostawali to samo zdanie. Dla modeli językowych taki opis też jest jałowy —
 * nie ma w nim nic, co warto zacytować.
 *
 * TL;DR zostaje osobno jako streszczenie; to jest wprowadzenie i drogowskaz.
 */
const WprowadzenieDzialu = ({ children, tropy, tytulTropow = "Od czego zacząć" }: Props) => {
  return (
    <section className="mb-8" aria-label="Wprowadzenie do działu">
      <div className="prose-none space-y-4 text-base leading-relaxed text-muted-foreground">
        {children}
      </div>

      {tropy && tropy.length > 0 && (
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
            <Compass className="h-5 w-5" aria-hidden="true" />
            {tytulTropow}
          </h2>
          <ul className="space-y-3">
            {tropy.map((t, i) => (
              <li key={i} className="text-sm">
                <span className="font-semibold text-foreground">{t.sytuacja}</span>
                <span className="text-muted-foreground"> — {t.propozycja} </span>
                <Link
                  to={t.href}
                  className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-2 hover:no-underline"
                >
                  {t.etykieta}
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
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
