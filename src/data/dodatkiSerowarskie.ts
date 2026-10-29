/**
 * Podpuszczki, chlorek wapnia i sól z polskich sklepów serowarskich: do listy
 * zakupów na stronie przepisu (ListaZakupowSera).
 *
 * PO CO OSOBNY PLIK, A NIE TABELA cultures: tamta trzyma kultury i liczy cenę
 * za litr z packLiters. Podpuszczkę i CaCl2 dawkuje się w ml albo g na litr
 * mleka, a moc preparatów różni się kilkukrotnie (strona /gdzie-kupic-podpuszczke),
 * więc ilość na partię liczymy z dawkowania sklepu, nie z ml w przepisie.
 * Docelowo tabela w Supabase na wzór feed_offers; na start migawka w kodzie,
 * jak culturesDataComplete.ts.
 *
 * SKĄD LICZBY: ceny, opakowania i dawki odczytane 29.10.2026 ze stron produktów
 * (link w każdej pozycji). Dawki Beaugel z zestawienia na /gdzie-kupic-podpuszczke
 * (dane producenta Coquard), bo strona Lactic.pl ich nie podaje. Nic nie jest
 * szacowane: brak pojemności albo dawki = null i lista mówi to wprost.
 *
 * Ceny to ceny z dnia `sprawdzono`, nie bieżące. Odświeżanie: razem z cenami
 * kultur (scripts/pobierz-ceny.py czyta te same silniki sklepów).
 */

export type RodzajDodatku = "podpuszczka" | "chlorek_wapnia" | "sol";
export type JednostkaDawki = "ml" | "g" | "krople";

export interface OfertaDodatku {
  /** Stały identyfikator oferty (sklep + produkt + opakowanie). */
  id: string;
  rodzaj: RodzajDodatku;
  /** Nazwa produktu jak na stronie sklepu. */
  produkt: string;
  /** Rodzaj preparatu: naturalna cielęca, mikrobiologiczna, proszek 99% itd. */
  odmiana: string | null;
  sklep: string;
  /** Identyfikator sklepu w hubie danerolne.com (domena), jak w cultures.sklep_id. */
  sklepId: string;
  url: string;
  /** Cena brutto ze strony sklepu. */
  cenaZl: number;
  /** Zawartość opakowania; null, gdy sklep jej nie podaje. */
  opakowanie: { ilosc: number; jednostka: "ml" | "g" } | null;
  /** Dawka podana przez sklep, przeliczona na 10 l mleka; null, gdy jej nie podaje. */
  dawkaNa10L: { od: number; do: number; jednostka: JednostkaDawki } | null;
  /** Dawkowanie dosłownie ze strony sklepu. */
  dawkaTekst: string | null;
  /** Na ile litrów mleka starcza opakowanie, gdy sklep podaje to sam. */
  litrowNaOpakowanie?: { od: number; do: number };
  sprawdzono: string;
  uwaga?: string;
}

const DZIEN = "2026-10-29";

const LACTIC = { sklep: "Lactic.pl", sklepId: "lactic.pl" };
const SEROWAR = { sklep: "Serowar.pl", sklepId: "serowar.pl" };
const GAP = { sklep: "GAP Poland", sklepId: "gappoland.com" };
const ARTISER = { sklep: "Artiser.pl", sklepId: "artiser.pl" };
const WANCZYKOWKA = { sklep: "Wańczykówka", sklepId: "wanczykowka.com" };
const BROWIN = { sklep: "Browin", sklepId: "browin.pl" };

const BEAUGEL_ZRODLO = "zestawienie /gdzie-kupic-podpuszczke, dane producenta Coquard";

export const dodatkiSerowarskie: OfertaDodatku[] = [
  // ─── Podpuszczki ───────────────────────────────────────────────────────────
  {
    id: "lactic-beaugel-5-1l", rodzaj: "podpuszczka", ...LACTIC,
    produkt: "Podpuszczka naturalna Beaugel 5 1l", odmiana: "naturalna",
    url: "https://lactic.pl/pl/p/Podpuszczka-naturalna-Beaugel-5-1l/638",
    cenaZl: 79, opakowanie: { ilosc: 1000, jednostka: "ml" },
    dawkaNa10L: { od: 3, do: 3.5, jednostka: "ml" },
    dawkaTekst: `30-35 ml na 100 l (${BEAUGEL_ZRODLO})`, sprawdzono: DZIEN,
  },
  {
    id: "lactic-beaugel-50-1l", rodzaj: "podpuszczka", ...LACTIC,
    produkt: "Podpuszczka naturalna Beaugel 50 1l", odmiana: "naturalna",
    url: "https://lactic.pl/pl/p/Podpuszczka-naturalna-Beaugel-50-1l/648",
    cenaZl: 39, opakowanie: { ilosc: 1000, jednostka: "ml" },
    dawkaNa10L: { od: 1.5, do: 2.5, jednostka: "ml" },
    dawkaTekst: `15-25 ml na 100 l (${BEAUGEL_ZRODLO})`, sprawdzono: DZIEN,
  },
  {
    id: "lactic-beaugel-500-1l", rodzaj: "podpuszczka", ...LACTIC,
    produkt: "Podpuszczka naturalna Beaugel 500 1l", odmiana: "naturalna",
    url: "https://lactic.pl/pl/p/Podpuszczka-naturalna-Beaugel-500-1l/1283",
    cenaZl: 129, opakowanie: { ilosc: 1000, jednostka: "ml" },
    dawkaNa10L: { od: 0.8, do: 1, jednostka: "ml" },
    dawkaTekst: `8-10 ml na 100 l (${BEAUGEL_ZRODLO})`, sprawdzono: DZIEN,
  },
  ...([[50, 19], [100, 29], [250, 49], [1000, 99]] as const).map(([ml, cena]): OfertaDodatku => ({
    id: `serowar-naturapure-${ml}ml`, rodzaj: "podpuszczka", ...SEROWAR,
    produkt: "NaturaPure - naturalna podpuszczka cielęca w płynie", odmiana: "naturalna cielęca",
    url: "https://serowar.pl/pl/p/NaturaPure-naturalna-podpuszczka-cieleca-w-plynie/136",
    cenaZl: cena, opakowanie: { ilosc: ml, jednostka: "ml" },
    dawkaNa10L: { od: 1, do: 2, jednostka: "ml" },
    dawkaTekst: "1–2 ml na 10 litrów mleka (około 20–30 kropli)", sprawdzono: DZIEN,
  })),
  ...([[500, 54], [1000, 97]] as const).map(([ml, cena]): OfertaDodatku => ({
    id: `gap-natural-rennet-${ml}ml`, rodzaj: "podpuszczka", ...GAP,
    produkt: "Podpuszczka naturalna Natural Rennet", odmiana: "naturalna",
    url: "https://sklep.gappoland.com/pl/p/Podpuszczka-naturalna-Natural-Rennet/22901961",
    cenaZl: cena, opakowanie: { ilosc: ml, jednostka: "ml" },
    dawkaNa10L: { od: 1.5, do: 2.5, jednostka: "ml" },
    dawkaTekst: "15 - 25 ml na 100 litrów mleka", sprawdzono: DZIEN,
  })),
  {
    id: "gap-natural-rennet-male", rodzaj: "podpuszczka", ...GAP,
    produkt: "Podpuszczka naturalna Natural Rennet", odmiana: "naturalna",
    url: "https://sklep.gappoland.com/pl/p/Podpuszczka-naturalna-Natural-Rennet/22902004",
    cenaZl: 15.5, opakowanie: null,
    dawkaNa10L: { od: 1.5, do: 2.5, jednostka: "ml" },
    dawkaTekst: "15 - 25 ml na 100 litrów mleka", sprawdzono: DZIEN,
    uwaga: "Strona nie podaje pojemności.",
  },
  ...([[50, 18.5], [100, 27.5], [250, 47], [1000, 109]] as const).map(([g, cena]): OfertaDodatku => ({
    id: `artiser-podpuszczka-cieleca-${g}g`, rodzaj: "podpuszczka", ...ARTISER,
    produkt: "Podpuszczka naturalna cielęca", odmiana: "naturalna cielęca",
    url: "https://artiser.pl/pl/p/Podpuszczka-naturalna-cieleca/95",
    cenaZl: cena, opakowanie: { ilosc: g, jednostka: "g" },
    dawkaNa10L: { od: 1.5, do: 2, jednostka: "ml" },
    dawkaTekst: "1,5-2 ml na 10l mleka", sprawdzono: DZIEN,
    uwaga: "Sklep podaje opakowanie w gramach, a dawkę w ml.",
  })),
  ...([[50, 22], [100, 33]] as const).map(([ml, cena]): OfertaDodatku => ({
    id: `wanczykowka-carlina-1000-${ml}ml`, rodzaj: "podpuszczka", ...WANCZYKOWKA,
    produkt: "Podpuszczka naturalna cielęca Carlina 1000", odmiana: "naturalna cielęca",
    url: "https://sklep.wanczykowka.com/podpuszczka/58-99-podpuszczka-naturalna-cieleca-carlina-1000.html",
    cenaZl: cena, opakowanie: { ilosc: ml, jednostka: "ml" },
    dawkaNa10L: { od: 1.6, do: 1.8, jednostka: "ml" },
    dawkaTekst: "Sery świeże: 2-4 ml na 100 l mleka. Sery podpuszczkowe: 16-18 ml na 100 l mleka", sprawdzono: DZIEN,
    uwaga: "Sklep ma też opakowania 250 g, 500 g i 1000 g.",
  })),
  {
    id: "browin-naturalna-50ml", rodzaj: "podpuszczka", ...BROWIN,
    produkt: "Podpuszczka do sera naturalna w płynie 50 ml", odmiana: "naturalna",
    url: "https://browin.pl/sklep/produkt/411207/podpuszczka-do-sera-naturalna-w-plynie-50-ml",
    cenaZl: 19.99, opakowanie: { ilosc: 50, jednostka: "ml" },
    dawkaNa10L: { od: 100, do: 100, jednostka: "krople" },
    dawkaTekst: "10 kropli na 1 L mleka; 50 ml wystarczy na ok 105 L mleka",
    litrowNaOpakowanie: { od: 105, do: 105 }, sprawdzono: DZIEN,
  },
  {
    id: "browin-mikrobiologiczna-50ml", rodzaj: "podpuszczka", ...BROWIN,
    produkt: "Podpuszczka do sera mikrobiologiczna w płynie 50 ml", odmiana: "mikrobiologiczna",
    url: "https://browin.pl/sklep/produkt/411201/podpuszczka-do-sera-mikrobiologiczna-w-plynie-50-ml",
    cenaZl: 12.39, opakowanie: { ilosc: 50, jednostka: "ml" },
    dawkaNa10L: { od: 80, do: 100, jednostka: "krople" },
    dawkaTekst: "8-10 kropel na 1 litr mleka", sprawdzono: DZIEN,
  },
  {
    id: "browin-mikrobiologiczna-strong-30ml", rodzaj: "podpuszczka", ...BROWIN,
    produkt: "Podpuszczka do sera mikrobiologiczna strong, 30 ml", odmiana: "mikrobiologiczna",
    url: "https://browin.pl/sklep/produkt/411209/podpuszczka-do-sera-mikrobiologiczna-strong-30-ml",
    cenaZl: 28.19, opakowanie: { ilosc: 30, jednostka: "ml" },
    dawkaNa10L: { od: 10, do: 10, jednostka: "krople" },
    dawkaTekst: "10 kropli na 10 litrów mleka; całe opakowanie na 500 L mleka",
    litrowNaOpakowanie: { od: 500, do: 500 }, sprawdzono: DZIEN,
  },
  {
    id: "browin-proszek-5x1g", rodzaj: "podpuszczka", ...BROWIN,
    produkt: "Podpuszczka do serów 5x1 g", odmiana: "w proszku",
    url: "https://browin.pl/sklep/produkt/411200/podpuszczka-do-serow-5x1-g",
    cenaZl: 11.29, opakowanie: { ilosc: 5, jednostka: "g" },
    dawkaNa10L: { od: 0.5, do: 0.5, jednostka: "g" },
    dawkaTekst: "1 g podpuszczki wystarcza na 20 litrów mleka (5 saszetek na 100 L)",
    litrowNaOpakowanie: { od: 100, do: 100 }, sprawdzono: DZIEN,
  },

  // ─── Chlorek wapnia ────────────────────────────────────────────────────────
  {
    id: "lactic-durci-gel", rodzaj: "chlorek_wapnia", ...LACTIC,
    produkt: "CHLOREK WAPNIA DURCI-GEL", odmiana: null,
    url: "https://lactic.pl/pl/p/CHLOREK-WAPNIA-DURCI-GEL/1251",
    cenaZl: 26, opakowanie: null, dawkaNa10L: null,
    dawkaTekst: "Dawkowanie zgodnie z instrukcją dołączoną do partii produktu", sprawdzono: DZIEN,
    uwaga: "Strona nie podaje pojemności ani dawki.",
  },
  ...([[10, 4], [100, 25], [1000, 55]] as const).map(([g, cena]): OfertaDodatku => ({
    id: `serowar-chlorek-${g}g`, rodzaj: "chlorek_wapnia", ...SEROWAR,
    produkt: "Chlorek wapnia serowarski - spożywczy", odmiana: "proszek, stężenie 99%",
    url: "https://serowar.pl/pl/p/Chlorek-wapnia-serowarski-spozywczy/119",
    cenaZl: cena, opakowanie: { ilosc: g, jednostka: "g" },
    dawkaNa10L: { od: 1, do: 2, jednostka: "g" },
    dawkaTekst: "1–2 g na 10 l mleka", sprawdzono: DZIEN,
  })),
  {
    id: "gap-chlorek-40g", rodzaj: "chlorek_wapnia", ...GAP,
    produkt: "Chlorek wapnia spożywczy 40g", odmiana: "proszek, CaCl2 78,37%",
    url: "https://sklep.gappoland.com/pl/p/Chlorek-wapnia-spozywczy-40g/22902198",
    cenaZl: 2.5, opakowanie: { ilosc: 40, jednostka: "g" },
    dawkaNa10L: { od: 2, do: 2, jednostka: "g" },
    dawkaTekst: "2 g chlorku wapnia na 10 litrów mleka", sprawdzono: DZIEN,
  },
  {
    id: "gap-chlorek-plyn-50ml", rodzaj: "chlorek_wapnia", ...GAP,
    produkt: "Chlorek wapnia do sera - w płynie 50 ml", odmiana: "płyn 33%",
    url: "https://sklep.gappoland.com/pl/p/Chlorek-wapnia-do-sera-w-plynie-50-ml/22902296",
    cenaZl: 9.5, opakowanie: { ilosc: 50, jednostka: "ml" },
    dawkaNa10L: { od: 2, do: 2, jednostka: "ml" },
    dawkaTekst: "2 ml na 10 l mleka", sprawdzono: DZIEN,
  },
  {
    id: "gap-chlorek-plyn-1l", rodzaj: "chlorek_wapnia", ...GAP,
    produkt: "Chlorek wapnia w płynie 1 litr", odmiana: "płyn 33%",
    url: "https://sklep.gappoland.com/pl/p/Chlorek-wapnia-w-plynie/22902116",
    cenaZl: 12.75, opakowanie: { ilosc: 1000, jednostka: "ml" },
    dawkaNa10L: { od: 2, do: 2, jednostka: "ml" },
    dawkaTekst: "2 ml na 10 l mleka", sprawdzono: DZIEN,
  },
  ...([[100, 11], [500, 16], [1000, 22]] as const).map(([g, cena]): OfertaDodatku => ({
    id: `artiser-chlorek-${g}g`, rodzaj: "chlorek_wapnia", ...ARTISER,
    produkt: "Chlorek wapnia w płynie", odmiana: "płyn",
    url: "https://artiser.pl/pl/p/Chlorek-wapnia-w-plynie/99",
    cenaZl: cena, opakowanie: { ilosc: g, jednostka: "g" },
    dawkaNa10L: { od: 2, do: 3, jednostka: "ml" },
    dawkaTekst: "2-3 ml na 10l mleka", sprawdzono: DZIEN,
    uwaga: "Sklep podaje opakowanie w gramach, a dawkę w ml.",
  })),
  ...([[500, 16], [1000, 24]] as const).map(([g, cena]): OfertaDodatku => ({
    id: `wanczykowka-chlorek-${g}g`, rodzaj: "chlorek_wapnia", ...WANCZYKOWKA,
    produkt: "Chlorek wapnia / sól serowarska", odmiana: null,
    url: "https://sklep.wanczykowka.com/chlorek-wapnia/51-437-chlorek-wapnia.html",
    cenaZl: cena, opakowanie: { ilosc: g, jednostka: "g" },
    dawkaNa10L: { od: 1.6, do: 4, jednostka: "ml" },
    dawkaTekst: "Do mleka: 16-40 ml na 100 litrów mleka", sprawdzono: DZIEN,
    uwaga: "Sklep podaje opakowanie w gramach, a dawkę w ml.",
  })),
  {
    id: "browin-chlorek-10g", rodzaj: "chlorek_wapnia", ...BROWIN,
    produkt: "Chlorek wapnia do sera, 10 g", odmiana: "proszek, stężenie 94-96%",
    url: "https://browin.pl/sklep/produkt/411216/chlorek-wapnia-do-sera-10-g",
    cenaZl: 2.39, opakowanie: { ilosc: 10, jednostka: "g" },
    dawkaNa10L: { od: 0.7, do: 1, jednostka: "g" },
    dawkaTekst: "0,7-1 g (szczypta) na 10 L mleka; opakowanie wystarcza na 100-142 L mleka",
    litrowNaOpakowanie: { od: 100, do: 142 }, sprawdzono: DZIEN,
  },
  {
    id: "browin-chlorek-100g", rodzaj: "chlorek_wapnia", ...BROWIN,
    produkt: "Chlorek wapnia do sera - 100 g", odmiana: "proszek",
    url: "https://browin.pl/sklep/produkt/411215/chlorek-wapnia-do-sera-100-g",
    cenaZl: 7.88, opakowanie: { ilosc: 100, jednostka: "g" },
    dawkaNa10L: { od: 0.7, do: 1, jednostka: "g" },
    dawkaTekst: "0,7-1 g (szczyptę) na 10 L mleka; opakowanie wystarcza na 1000-1420 L mleka",
    litrowNaOpakowanie: { od: 1000, do: 1420 }, sprawdzono: DZIEN,
  },
  {
    id: "browin-chlorek-plyn-50ml", rodzaj: "chlorek_wapnia", ...BROWIN,
    produkt: "Chlorek wapnia w płynie, 50 ml", odmiana: "płyn",
    url: "https://browin.pl/sklep/produkt/411213/chlorek-wapnia-w-plynie-50-ml",
    cenaZl: 13.99, opakowanie: { ilosc: 50, jednostka: "ml" },
    dawkaNa10L: { od: 2, do: 4, jednostka: "ml" },
    dawkaTekst: "40 kropli (2 ml) na 10 L mleka świeżego, 80 kropli (4 ml) na 10 L mleka niskopasteryzowanego; opakowanie wystarcza na 125-250 L mleka",
    litrowNaOpakowanie: { od: 125, do: 250 }, sprawdzono: DZIEN,
  },

  // ─── Sól ───────────────────────────────────────────────────────────────────
  // Sklepy serowarskie prawie nie sprzedają soli. Na 29.10.2026 jedna oferta
  // soli niejodowanej w sklepach z naszej bazy; cenę można zmienić na liście.
  ...([[1100, 3.3], [11000, 30]] as const).map(([g, cena]): OfertaDodatku => ({
    id: `wanczykowka-sol-klodawska-${g}g`, rodzaj: "sol", ...WANCZYKOWKA,
    produkt: "Sól kamienna niejodowana kłodawska", odmiana: "niejodowana",
    url: "https://sklep.wanczykowka.com/sol/327-647-sol-klodawska.html",
    cenaZl: cena, opakowanie: { ilosc: g, jednostka: "g" },
    dawkaNa10L: null, dawkaTekst: null, sprawdzono: DZIEN,
  })),
];
