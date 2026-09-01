import { useEffect } from "react";

/**
 * Ustawia tytuł, opis i (opcjonalnie) robots dla bieżącej strony.
 *
 * DLACZEGO NIE HELMET: react-helmet 6.1.0 pod Reactem 18 nie emituje w tym
 * projekcie NICZEGO — w gotowym dokumencie nie ma ani jednego elementu
 * z atrybutem data-react-helmet. Potwierdzone w przeglądarce 2026-09-01 na
 * /slownik, /wedzenie-sera i /mleko-do-sera: h1 się renderuje, canonical jest
 * (bo ustawia go osobno Kanoniczny.tsx), a document.title to tytuł strony
 * głównej. Treść tytułów była napisana i nigdy nie docierała do dokumentu.
 *
 * Ten hook robi to samo, co od dawna działa w RecipeDetails i RHD: pisze wprost
 * do DOM w useEffect. Bez biblioteki, bez zależności.
 *
 * ROBOTS jest sprzątany przy odmontowaniu. Bez tego `noindex` ustawiony na
 * jednej podstronie zostałby w dokumencie i wyłączył z indeksu każdą kolejną
 * stronę odwiedzoną w tej samej sesji — aplikacja jest jednostronicowa, więc
 * dokument się nie przeładowuje.
 */
export function useMetaStrony(
  title?: string,
  description?: string,
  opcje?: { robots?: string },
) {
  const robots = opcje?.robots;

  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      let el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", "description");
        document.head.appendChild(el);
      }
      el.setAttribute("content", description);
    }
  }, [title, description]);

  useEffect(() => {
    if (!robots) return;
    // index.html ma juz statyczny <meta name="robots" content="index, follow">.
    // Dopisanie drugiego tagu dawaloby dokument z dwoma sprzecznymi dyrektywami,
    // wiec podmieniamy istniejacy i przywracamy go przy wyjsciu ze strony.
    const el = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (el) {
      const poprzednia = el.getAttribute("content");
      el.setAttribute("content", robots);
      return () => {
        if (poprzednia === null) el.removeAttribute("content");
        else el.setAttribute("content", poprzednia);
      };
    }
    const nowy = document.createElement("meta");
    nowy.setAttribute("name", "robots");
    nowy.setAttribute("content", robots);
    document.head.appendChild(nowy);
    return () => {
      nowy.remove();
    };
  }, [robots]);
}
