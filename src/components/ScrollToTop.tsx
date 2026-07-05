import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// Przewija okno na górę przy każdej zmianie trasy. React Router domyślnie zachowuje
// pozycję scrolla z poprzedniej strony — bez tego wejście w przepis z listy otwierało
// go "gdzieś na środku". Pomija przypadek z kotwicą (#hash), żeby nie psuć skoków do sekcji.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
