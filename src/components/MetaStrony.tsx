import { useLocation } from "react-router-dom";
import { metaStron } from "@/data/metaStron";
import { useMetaStrony } from "@/hooks/useMetaStrony";

/**
 * Podpina tytuł i opis z src/data/metaStron.ts do bieżącej trasy.
 *
 * Montowany raz w App, obok Kanoniczny — z tego samego powodu: naprawianie
 * trzydziestu plików po kolei jest gorsze niż jedno miejsce, przez które
 * przechodzą wszystkie trasy. Nowa podstrona wystarczy, że dopisze wpis
 * do metaStron.ts.
 *
 * ROZDZIAŁ ODPOWIEDZIALNOŚCI: w tabeli są WYŁĄCZNIE trasy, które nie ustawiają
 * tytułu same. Strony z własnym document.title (przepisy, poradniki kultur,
 * RHD, MOL) i strony dynamiczne robią to u siebie, bo tytuł zależy u nich od
 * wczytanych danych. Gdyby trafiły tu oba mechanizmy naraz, o wyniku
 * decydowałaby kolejność efektów — czyli przypadek.
 */
const MetaStrony = () => {
  const { pathname } = useLocation();
  const bez = pathname.replace(/\/+$/, "") || "/";
  const meta = metaStron[bez];

  useMetaStrony(meta?.title, meta?.description);

  return null;
};

export default MetaStrony;
