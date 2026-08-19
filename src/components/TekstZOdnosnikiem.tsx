import { Link } from "react-router-dom";

/**
 * Pozwala wstawić odnośnik WEWNĄTRZ zwykłego tekstu przepisu.
 *
 * Teksty w danych (strategy, step.content) są zwykłymi napisami, więc nie da się
 * w nich umieścić JSX. Zamiast tego używamy znacznika [[tekst kotwicy]], który
 * ten komponent zamienia na odnośnik. Dzięki temu link stoi tam, gdzie czytelnik
 * właśnie podejmuje decyzję, a nie dopiero w ramce na końcu strony.
 *
 * Ten sam znacznik rozumie generator mirrorów (scripts/gen-kulinarne.py), więc
 * obie warstwy pokazują to samo.
 *
 * Bez `href` znacznik znika, a zostaje sam tekst — nic się nie psuje, gdy
 * powiązanie nie istnieje.
 */

const ZNACZNIK = /\[\[(.+?)\]\]/g;

/** Usuwa znaczniki, zostawiając sam tekst — do JSON-LD i innych miejsc bez HTML. */
export function bezZnacznikow(tekst: string): string {
  return (tekst || "").replace(ZNACZNIK, "$1");
}

interface Props {
  tekst: string;
  href?: string;
}

const TekstZOdnosnikiem = ({ tekst, href }: Props) => {
  if (!tekst) return null;
  if (!href) return <>{bezZnacznikow(tekst)}</>;

  // split z grupą przechwytującą zwraca na przemian: tekst, kotwica, tekst, ...
  const czesci = tekst.split(/\[\[(.+?)\]\]/g);

  return (
    <>
      {czesci.map((cz, i) =>
        i % 2 === 1 ? (
          <Link
            key={i}
            to={href}
            className="text-primary underline underline-offset-2 hover:no-underline font-medium"
          >
            {cz}
          </Link>
        ) : (
          <span key={i}>{cz}</span>
        )
      )}
    </>
  );
};

export default TekstZOdnosnikiem;
