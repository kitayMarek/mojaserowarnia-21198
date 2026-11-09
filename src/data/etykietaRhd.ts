/**
 * Zasady oznakowania nabiału w rolniczym handlu detalicznym (RHD). Jedno źródło dla strony
 * /etykieta-rhd, strony /etykieta-do-sprzedazy-rhd i pliku /dane/etykieta-rhd.json
 * (scripts/gen-dane-etykieta.mjs), z którego korzysta ekran stoiska w Targu Rolnym.
 *
 * Przepisy sprawdzone w tekstach aktów 9.11.2026 (wersje i adresy w ZRODLA). Zmiana tutaj
 * i ponowne uruchomienie skryptu zmienia wszystkie trzy miejsca naraz.
 *
 * Czego tu nie ma: nazwy, adresu i numeru weterynaryjnego rolnika. To dane podstawowe
 * podmiotu i należą do huba Dane Rolne (C:\Moje\Hub\ARCHITEKTURA.md).
 */

export const STAN_PRAWNY_NA = "2026-11-09";

export type IdZrodla = "r1169" | "ubzz" | "ujh" | "d2011_91" | "rp2004" | "r853" | "rzn" | "zk2017";

export const ZRODLA: Record<IdZrodla, { akt: string; url: string }> = {
  r1169: {
    akt: "Rozporządzenie (UE) nr 1169/2011 w sprawie przekazywania konsumentom informacji na temat żywności (wersja z 1.04.2025)",
    url: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:02011R1169-20250401",
  },
  ubzz: {
    akt: "Ustawa o bezpieczeństwie żywności i żywienia (tekst jednolity Dz.U. 2026 poz. 1399)",
    url: "https://eli.gov.pl/eli/DU/2026/1399/ogl",
  },
  ujh: {
    akt: "Ustawa o jakości handlowej artykułów rolno-spożywczych (tekst jednolity Dz.U. 2023 poz. 1980)",
    url: "https://eli.gov.pl/eli/DU/2023/1980/ogl",
  },
  d2011_91: {
    akt: "Dyrektywa 2011/91/UE w sprawie oznaczeń lub oznakowań identyfikujących partię",
    url: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32011L0091",
  },
  rp2004: {
    akt: "Rozporządzenie Ministra Rolnictwa i Rozwoju Wsi z 13 kwietnia 2004 r. (Dz.U. 2004 nr 83 poz. 772)",
    url: "https://eli.gov.pl/eli/DU/2004/772/ogl",
  },
  r853: {
    akt: "Rozporządzenie (WE) nr 853/2004 o szczególnych przepisach dotyczących higieny żywności pochodzenia zwierzęcego (wersja z 7.05.2026)",
    url: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:02004R0853-20260507",
  },
  rzn: {
    akt: "Rozporządzenie Ministra Rolnictwa i Rozwoju Wsi z 23 grudnia 2014 r. w sprawie znakowania poszczególnych rodzajów środków spożywczych (Dz.U. 2015 poz. 29 ze zm.)",
    url: "https://eli.gov.pl/eli/DU/2015/29/ogl",
  },
  zk2017: {
    akt: "Zawiadomienie Komisji 2017/C 428/01 o informacjach o alergenach (wytyczne, niewiążące)",
    url: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:52017XC1213(01)",
  },
};

export type Wymog = {
  id: string;
  /** Krótka nazwa pola, jak na liście na stronie. */
  pole: string;
  /** Co dokładnie trzeba podać, jednym lub dwoma zdaniami. */
  opis: string;
  /** Przepisy: źródło z ZRODLA i jednostka redakcyjna. */
  podstawa: { zrodlo: IdZrodla; przepis: string }[];
  /** Wyjątek albo zastrzeżenie, jeśli jest. */
  uwaga?: string;
  /** "do_potwierdzenia": tekst aktu nie przesądza, czy wymóg obejmuje RHD. */
  pewnosc?: "potwierdzone" | "do_potwierdzenia";
};

/** Produkt w opakowaniu: dane na etykiecie. */
export const NA_ETYKIECIE: Wymog[] = [
  {
    id: "nazwa",
    pole: "Nazwa produktu",
    opis: "Nazwa, która nie wprowadza w błąd, np. „ser dojrzewający typu gouda”.",
    podstawa: [{ zrodlo: "r1169", przepis: "art. 9 ust. 1 lit. a, art. 17" }],
  },
  {
    id: "skladniki",
    pole: "Wykaz składników",
    opis: "Składniki w kolejności od największego udziału masy.",
    podstawa: [{ zrodlo: "r1169", przepis: "art. 9 ust. 1 lit. b, art. 18" }],
    uwaga:
      "Ser, masło, mleko fermentowane i śmietana bez innych składników niż produkty mleczne, enzymy i kultury (a w serze innym niż świeży i topiony także sól) mogą nie mieć wykazu składników (art. 19 ust. 1 lit. d). Wtedy alergen podaje się słowem „zawiera”.",
  },
  {
    id: "alergeny",
    pole: "Alergeny wyróżnione w składzie",
    opis: "Alergen z listy 14 grup wyróżniony w wykazie składników, np. pogrubieniem lub wersalikami. W nabiale to zawsze mleko.",
    podstawa: [
      { zrodlo: "r1169", przepis: "art. 9 ust. 1 lit. c, art. 21 ust. 1, zał. II" },
      { zrodlo: "zk2017", przepis: "pkt 23" },
    ],
    uwaga:
      "Oznaczenia nie trzeba, gdy nazwa produktu wyraźnie odnosi się do alergenu (art. 21 ust. 1 akapit czwarty). Według wytycznych Komisji słowo „ser” w nazwie wystarcza za informację o mleku; przy nazwie bez tego słowa trzeba mleko podać.",
  },
  {
    id: "ilosc_netto",
    pole: "Ilość netto",
    opis: "Masa w gramach lub kilogramach.",
    podstawa: [{ zrodlo: "r1169", przepis: "art. 9 ust. 1 lit. e" }],
  },
  {
    id: "data",
    pole: "Data: „należy spożyć do” albo „najlepiej spożyć przed”",
    opis: "„Należy spożyć do” dla żywności szybko psującej się pod względem mikrobiologicznym, w innych przypadkach „najlepiej spożyć przed”. Rodzaj daty zależy od produktu, nie od wyboru.",
    podstawa: [{ zrodlo: "r1169", przepis: "art. 9 ust. 1 lit. f, art. 24 ust. 1, zał. X" }],
  },
  {
    id: "przechowywanie",
    pole: "Warunki przechowywania",
    opis: "Specjalne warunki przechowywania, np. temperatura. Przy dacie „należy spożyć do” są obowiązkowe.",
    podstawa: [{ zrodlo: "r1169", przepis: "art. 9 ust. 1 lit. g, art. 25 ust. 1, zał. X pkt 2 lit. b" }],
  },
  {
    id: "producent",
    pole: "Producent: nazwa i adres",
    opis: "Imię i nazwisko albo nazwa oraz adres podmiotu, który wprowadza produkt do obrotu.",
    podstawa: [{ zrodlo: "r1169", przepis: "art. 9 ust. 1 lit. h, art. 8 ust. 1" }],
  },
  {
    id: "partia",
    pole: "Numer partii",
    opis: "Oznaczenie partii produkcyjnej.",
    podstawa: [
      { zrodlo: "ujh", przepis: "art. 7a ust. 1" },
      { zrodlo: "d2011_91", przepis: "art. 2 ust. 1, art. 4" },
    ],
    uwaga:
      "Nie trzeba go, gdy na etykiecie jest data z dniem i miesiącem, a ta data wystarcza do rozpoznania partii (dyrektywa art. 5, rozporządzenie z 2004 r. § 2 pkt 4).",
  },
  {
    id: "mleko_surowe",
    pole: "Napis „z surowego mleka”",
    opis: "Przy produktach z mleka, które nie przeszło obróbki cieplnej ani innej obróbki fizycznej lub chemicznej, wyrazy „z surowego mleka”.",
    podstawa: [{ zrodlo: "r853", przepis: "zał. III sekcja IX rozdz. IV pkt 1 lit. b" }],
    uwaga:
      "Rozporządzenie 853/2004 co do zasady nie obejmuje handlu detalicznego (art. 1 ust. 5 lit. a), więc to, czy napis jest obowiązkowy przy sprzedaży w RHD, trzeba potwierdzić u powiatowego lekarza weterynarii. Podanie go jest zawsze dopuszczalne.",
    pewnosc: "do_potwierdzenia",
  },
  {
    id: "jezyk",
    pole: "Język polski",
    opis: "Wszystkie dane obowiązkowe po polsku.",
    podstawa: [
      { zrodlo: "ubzz", przepis: "art. 48 ust. 2" },
      { zrodlo: "ujh", przepis: "art. 6 ust. 1" },
    ],
  },
  {
    id: "czytelnosc",
    pole: "Wielkość liter",
    opis: "Wysokość małej litery x co najmniej 1,2 mm, a 0,9 mm, gdy największa powierzchnia opakowania ma mniej niż 80 cm².",
    podstawa: [{ zrodlo: "r1169", przepis: "art. 13 ust. 2 i 3" }],
  },
];

/** Czego na etykiecie RHD nie trzeba. */
export const NIE_WYMAGANE: Wymog[] = [
  {
    id: "wartosc_odzywcza",
    pole: "Tabela wartości odżywczej",
    opis: "Zwolnienie dla żywności dostarczanej przez wytwórcę bezpośrednio konsumentowi w małych ilościach albo miejscowym sklepom. Przestaje działać, gdy na etykiecie jest oświadczenie żywieniowe lub zdrowotne.",
    podstawa: [{ zrodlo: "r1169", przepis: "art. 16 ust. 3, zał. V pkt 19" }],
    uwaga: "Akt nie określa, ile to „małe ilości”.",
  },
  {
    id: "nr_wet_na_etykiecie",
    pole: "Numer weterynaryjny i napis „rolniczy handel detaliczny” na etykiecie",
    opis: "Te dane prawo każe umieścić przy stoisku, nie na etykiecie. Na etykiecie można je podać dobrowolnie.",
    podstawa: [{ zrodlo: "ubzz", przepis: "art. 44a ust. 3" }],
  },
];

/** Oznakowanie miejsca sprzedaży (stoiska) w RHD. */
export const PRZY_STOISKU: Wymog[] = [
  {
    id: "napis_rhd",
    pole: "Napis „rolniczy handel detaliczny”",
    opis: "Czytelnie i widocznie dla kupującego, w miejscu sprzedaży.",
    podstawa: [{ zrodlo: "ubzz", przepis: "art. 44a ust. 3 pkt 1" }],
  },
  {
    id: "rolnik",
    pole: "Rolnik",
    opis: "Imię i nazwisko albo nazwa i siedziba rolnika.",
    podstawa: [{ zrodlo: "ubzz", przepis: "art. 44a ust. 3 pkt 2 lit. a" }],
  },
  {
    id: "adres_produkcji",
    pole: "Adres miejsca produkcji",
    opis: "Adres, pod którym żywność została wyprodukowana.",
    podstawa: [{ zrodlo: "ubzz", przepis: "art. 44a ust. 3 pkt 2 lit. b" }],
  },
  {
    id: "nr_wet",
    pole: "Weterynaryjny numer identyfikacyjny",
    opis: "Numer nadany przez powiatowego lekarza weterynarii, o ile został nadany (dotyczy żywności pochodzenia zwierzęcego).",
    podstawa: [{ zrodlo: "ubzz", przepis: "art. 44a ust. 3 pkt 2 lit. c" }],
  },
];

/** Produkt nieopakowany, sprzedawany luzem z lady. */
export const LUZEM: Wymog[] = [
  {
    id: "luzem_nazwa",
    pole: "Nazwa produktu",
    opis: "Na wywieszce przy produkcie albo w inny sposób, w miejscu dostępnym dla kupującego.",
    podstawa: [{ zrodlo: "rzn", przepis: "§ 19 ust. 1 pkt 1 i ust. 2" }],
  },
  {
    id: "luzem_producent",
    pole: "Producent",
    opis: "Nazwa albo imię i nazwisko producenta.",
    podstawa: [{ zrodlo: "rzn", przepis: "§ 19 ust. 1 pkt 2" }],
  },
  {
    id: "luzem_skladniki",
    pole: "Składniki i alergeny",
    opis: "Wykaz składników z wyróżnionymi alergenami, na tych samych zasadach co na etykiecie (z tym samym wyjątkiem dla prostego sera).",
    podstawa: [
      { zrodlo: "rzn", przepis: "§ 19 ust. 1 pkt 3" },
      { zrodlo: "r1169", przepis: "art. 44 ust. 1 lit. a" },
    ],
  },
  {
    id: "luzem_klasa",
    pole: "Klasa jakości handlowej",
    opis: "Tylko jeśli dla produktu ją ustalono.",
    podstawa: [{ zrodlo: "rzn", przepis: "§ 19 ust. 1 pkt 4" }],
  },
];

/** Przy sprzedaży luzem nie są wymagane: data, numer partii, ilość netto i adres producenta. */
export const LUZEM_NIE_WYMAGANE = ["data", "numer partii", "ilość netto", "adres producenta"];

/** 14 grup alergenów, rozporządzenie 1169/2011 zał. II pkt 1 do 14 (nazwy skrócone). */
export const ALERGENY_ZAL_II: { pkt: number; nazwa: string }[] = [
  { pkt: 1, nazwa: "zboża zawierające gluten" },
  { pkt: 2, nazwa: "skorupiaki" },
  { pkt: 3, nazwa: "jaja" },
  { pkt: 4, nazwa: "ryby" },
  { pkt: 5, nazwa: "orzeszki ziemne (arachidowe)" },
  { pkt: 6, nazwa: "soja" },
  { pkt: 7, nazwa: "mleko (łącznie z laktozą)" },
  { pkt: 8, nazwa: "orzechy" },
  { pkt: 9, nazwa: "seler" },
  { pkt: 10, nazwa: "gorczyca" },
  { pkt: 11, nazwa: "nasiona sezamu" },
  { pkt: 12, nazwa: "dwutlenek siarki i siarczyny (powyżej 10 mg/kg lub 10 mg/l w przeliczeniu na SO₂)" },
  { pkt: 13, nazwa: "łubin" },
  { pkt: 14, nazwa: "mięczaki" },
];

/**
 * Podpowiedzi dla generatora etykiety, NIE wymogi prawa. Temperatury to typowe zakresy
 * dla rodzaju produktu; rolnik wpisuje własne. Rodzaj daty: świeże i twaróg zwykle
 * „należy spożyć do”, dojrzewające „najlepiej spożyć przed”.
 */
export type TypDaty = "przydatnosc" | "trwalosc"; // „Należy spożyć do” | „Najlepiej spożyć przed”

export type Podpowiedz = {
  id: string;
  nazwa: string;
  przechowywanie: string;
  alergeny: string;
  typ_daty: TypDaty;
  skladniki: string;
};

export const PODPOWIEDZI: Podpowiedz[] = [
  { id: "ser-swiezy", nazwa: "Ser świeży", przechowywanie: "Przechowywać w temp. 2–8°C", alergeny: "mleko", typ_daty: "przydatnosc", skladniki: "MLEKO, sól, kultury bakteryjne, podpuszczka" },
  { id: "ser-dojrzewajacy", nazwa: "Ser dojrzewający", przechowywanie: "Przechowywać w temp. 4–10°C", alergeny: "mleko", typ_daty: "trwalosc", skladniki: "MLEKO, sól, kultury bakteryjne, podpuszczka" },
  { id: "ser-plesniowy", nazwa: "Ser pleśniowy", przechowywanie: "Przechowywać w temp. 4–8°C", alergeny: "mleko", typ_daty: "trwalosc", skladniki: "MLEKO, sól, kultury bakteryjne, podpuszczka, pleśń szlachetna" },
  { id: "twarog", nazwa: "Twaróg", przechowywanie: "Przechowywać w temp. 2–8°C", alergeny: "mleko", typ_daty: "przydatnosc", skladniki: "MLEKO, kultury bakteryjne" },
  { id: "maslo", nazwa: "Masło", przechowywanie: "Przechowywać w temp. do 8°C", alergeny: "mleko", typ_daty: "trwalosc", skladniki: "śmietanka (MLEKO)" },
  { id: "inne", nazwa: "Inne", przechowywanie: "", alergeny: "", typ_daty: "trwalosc", skladniki: "" },
];

/** Przepisy jednego wymogu jako tekst, np. „rozp. 1169/2011 art. 9 ust. 1 lit. a”. */
export const SKROT_ZRODLA: Record<IdZrodla, string> = {
  r1169: "rozp. (UE) 1169/2011",
  ubzz: "ustawa o bezpieczeństwie żywności",
  ujh: "ustawa o jakości handlowej",
  d2011_91: "dyrektywa 2011/91/UE",
  rp2004: "rozp. MRiRW z 2004 r.",
  r853: "rozp. (WE) 853/2004",
  rzn: "rozp. MRiRW o znakowaniu (Dz.U. 2015 poz. 29)",
  zk2017: "wytyczne Komisji 2017/C 428/01",
};

export const podstawaTekst = (w: Wymog) =>
  w.podstawa.map((p) => `${SKROT_ZRODLA[p.zrodlo]}, ${p.przepis}`).join("; ");
