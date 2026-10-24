/**
 * „Nowe w serwisie” na stronie głównej (od 24.10.2026, przebudowa według makiety A).
 *
 * DOPISUJ NA GÓRZE przy każdej nowej stronie albo dużej zmianie. Strona główna
 * pokazuje 4 najnowsze. Do 24.10 była tu lista z lipca w FeaturedSection, której
 * nikt nie zmieniał, a stare daty mówiły, że serwis stoi.
 */
export interface NowoscWSerwisie {
  /** RRRR-MM-DD */
  data: string;
  tytul: string;
  href: string;
}

export const NOWE_W_SERWISIE: NowoscWSerwisie[] = [
  { data: "2026-10-24", tytul: "Podłącz serwis do swojego czatu: gotowe teksty dla ChatGPT, Claude i Perplexity", href: "/asystenci-ai" },
  { data: "2026-10-24", tytul: "Resztki z kuchni dla kur: co, ile i czego unikać", href: "/pasze/resztki-z-kuchni" },
  { data: "2026-10-24", tytul: "Daję kurom dobre jedzenie, a one nie niosą. Dlaczego?", href: "/pasze/kury-nie-niosa" },
  { data: "2026-10-24", tytul: "Ile jakiego surowca w paszy dla drobiu", href: "/pasze/udzial-surowcow" },
  { data: "2026-10-20", tytul: "Dotacja dla rolniczego handlu detalicznego", href: "/prawo/rhd/dotacja" },
  { data: "2026-10-19", tytul: "Emmental: ser i jak go zrobić w domu", href: "/sery/emmental" },
];

/** „24.10.2026” z „2026-10-24”. */
export const dataPL = (iso: string) => iso.split("-").reverse().join(".");
