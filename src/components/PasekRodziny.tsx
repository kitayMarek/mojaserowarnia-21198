import "@/styles/pasek-rodziny.css";

// HTML paska (kopia z huba) w src/components/pasekRodzinyHtml.ts, styl w src/styles/pasek-rodziny.css.
import { PASEK_HTML } from "@/components/pasekRodzinyHtml";

const PasekRodziny = () => <div className="sero-rodzina" dangerouslySetInnerHTML={{ __html: PASEK_HTML }} />;

export default PasekRodziny;
