import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DOMENA = "https://mojaserowarnia.pl";

/**
 * Ustawia <link rel="canonical"> na każdej trasie aplikacji.
 *
 * DLACZEGO NIE HELMET: strony miały canonical zapisany w blokach <Helmet>
 * (31 plików), ale react-helmet 6.1.0 pod Reactem 18 nie robi NIC — w gotowym
 * dokumencie nie ma ani jednego elementu z atrybutem data-react-helmet.
 * Tytuły i opisy działały tylko dlatego, że strony ustawiają je osobno przez
 * document.title w useEffect. Canonical nie był emitowany nigdzie, na żadnej
 * trasie — potwierdzone w przegladarce 2026-08-20, po pelnym renderze.
 *
 * Skutek dla SEO: mirrory statyczne wskazywały canonical na trasy React, a te
 * milczaly. Google dostawal wskazanie w prozne i wahal sie miedzy adresem z
 * .html a trasa aplikacji dla tych samych fraz.
 *
 * Zamiast naprawiac 31 plikow montujemy to raz w App. Canonical wylicza sie ze
 * sciezki trasy, wiec nowe podstrony dostaja go automatycznie.
 *
 * NADPISANIE: przekaz `sciezka`, gdy strona ma sie konsolidowac pod innym
 * adresem niz wlasny (np. przy scalaniu dwoch stron o tym samym temacie).
 */

interface Props {
  sciezka?: string;
}

const Kanoniczny = ({ sciezka }: Props) => {
  const location = useLocation();

  useEffect(() => {
    // Bez parametrów i bez kotwicy — to ten sam dokument.
    // Końcowy ukośnik ucinamy, żeby /przepisy/ i /przepisy nie były dwoma URL-ami.
    const surowa = sciezka ?? location.pathname;
    const czysta = surowa.replace(/\/+$/, "") || "/";
    const url = DOMENA + (czysta === "/" ? "/" : czysta);

    let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", "canonical");
      document.head.appendChild(el);
    }
    el.setAttribute("href", url);
  }, [location.pathname, sciezka]);

  return null;
};

export default Kanoniczny;
