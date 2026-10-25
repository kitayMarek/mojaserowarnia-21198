/**
 * Baza dodatków paszowych (od 24.10.2026): konkretne produkty z polskich sklepów
 * (koncentraty, premiksy, kreda, grys, fosforany, sól, drożdże, aminokwasy) ze
 * składem z etykiety, dawką z etykiety i ofertami sklepów z datą sprawdzenia ceny.
 * Na wzór bazy kultur serowarskich: kalkulator ma odpowiadać nie tylko „czego
 * brakuje”, ale „czym to uzupełnić, ile to kosztuje i gdzie kupić”.
 *
 * TEN PLIK TO MIGAWKA DLA SERWERA MCP (worker-magazyn/src/pasze.js) i zapas dla
 * strony, zanim baza dostanie seed. Strona czyta produkty z Supabase
 * (feed_ingredients z source='dodatek' i feed_offers, hook useFeedIngredients), gdy
 * tam są. Seed robi z tego pliku scripts/gen-dodatki-seed-sql.mts. Osobny plik,
 * bo src/data/feedIngredients.ts jest generowany z arkusza i nie wolno go ruszać.
 *
 * JEDNOSTKI jak w feedIngredients.ts: EM w MJ/kg; białko, Ca, P, Na, aminokwasy
 * w %; Mn, Zn, Fe, Cu, I, Se w mg/kg; witaminy A i D3 w tys. j.m./kg; E, B1, B2,
 * B6, niacyna, kwas pantotenowy, foliowy, biotyna w mg/kg; B12 w µg/kg; cholina w g/kg.
 * Czego etykieta nie podaje, jest 0 (jak puste komórki w arkuszu Marka), a nie zgadywane.
 *
 * NEUTRALNOŚĆ (decyzja Marka): płaci się za obecność i sprawdzone dane, nigdy za
 * pozycję. Pole `partner` jest jawnie oznaczane na karcie, ale propozycje
 * „czym uzupełnić” i wyszukiwanie w MCP układa się wyłącznie po wartościach
 * odżywczych i cenie. Najwyżej 2 propozycje na brak. Lokalizacja sklepu (od 25.10.2026,
 * SKLEPY_DODATKOW) też nie zmienia kolejności: MCP tylko dopisuje „w Twoim województwie”.
 */

import { feedIngredients, type FeedIngredient } from "./feedIngredients.ts";

/**
 * Mieszanki do osobnego karmidła (wiaderka mineralne, grit z minerałami i witaminami):
 * nie wchodzą do mieszanki, więc „czym uzupełnić” ich nie podpowiada, a proponuje je
 * ramka „Pasza z jednego składnika” (bilansPaszy.ts, prośba Marka 24.10.2026). Produkt
 * w tej kategorii dodany do bazy pokaże się tam sam. Na 24.10.2026 nie ma jeszcze żadnego.
 */
export const KATEGORIA_OSOBNE_KARMIDLO = "Mieszanki do osobnego karmidła";

/** Dla kogo według etykiety. Te same wartości co CHECK w migracji 20261024150000. */
export type Gatunek = "nioski" | "odchow" | "brojlery" | "kaczki" | "gesi" | "indyki";

export const GATUNKI_DODATKOW: Record<Gatunek, string> = {
  nioski: "kury nioski",
  odchow: "odchów kurek",
  brojlery: "brojlery",
  kaczki: "kaczki",
  gesi: "gęsi",
  indyki: "indyki",
};

export type Gmo = "tak" | "nie" | "nieznane";
export type ZrodloSkladu = "etykieta" | "producent" | "norma";

export const OPIS_ZRODLA_SKLADU: Record<ZrodloSkladu, string> = {
  etykieta: "z etykiety",
  producent: "z karty produktu u producenta",
  norma: "z tabel wartości pokarmowej (skład typowy)",
};

export interface OfertaDodatku {
  sklep: string;
  /** Strona produktu w sklepie, bez znacznika; znacznik dokleja adresOferty(). */
  url: string;
  /** Cena brutto opakowania w zł. */
  cenaZl: number;
  opakowanieKg: number;
  /** Dzień, w którym cena była taka na stronie sklepu (RRRR-MM-DD). */
  sprawdzono: string;
  /** Gdzie jest sklep i czy można przyjechać; z SKLEPY_DODATKOW, null = sklepu tam nie ma. */
  lokalizacja?: LokalizacjaSklepu | null;
  /**
   * Wysyłka jednego opakowania do domu, gdy podaje ją strona produktu (najtańszy kurier albo
   * poczta). Ma pierwszeństwo przed cennikiem sklepu w LokalizacjaSklepu.dostawa.
   */
  dostawaZl?: number;
  /** true = strona podaje „od X zł”: to najniższa stawka, w koszyku może wyjść więcej. */
  dostawaOd?: boolean;
}

/**
 * Cennik wysyłki sklepu (od 25.10.2026, decyzja Marka: obok odbioru w województwie zawsze
 * „najtaniej z dostawą”, bo cena bez przesyłki myli). progiWagi: [do kg, zł] za całe
 * zamówienie. zaWartosc: [od zł wartości zamówienia, zł za paczkę], paczki do maxKgPaczki.
 * darmowaOdZl: od tej wartości towaru dostawa gratis. Czego sklep nie publikuje, nie ma.
 */
export interface DostawaSklepu {
  progiWagi?: Array<[number, number]>;
  zaWartosc?: Array<[number, number]>;
  maxKgPaczki?: number;
  darmowaOdZl?: number;
  sprawdzono: string;
  zrodlo: string;
  uwagi?: string;
}

// ── Sklepy: gdzie są i czy można przyjechać (od 25.10.2026) ─────────────────

/**
 * Województwa: klucz ASCII (parametr wojewodztwo w MCP i kolumna feed_offers.wojewodztwo),
 * wartość z ogonkami dla ludzi. Te same klucze co CHECK w migracji 20261025100000.
 */
export const WOJEWODZTWA = {
  dolnoslaskie: "dolnośląskie",
  "kujawsko-pomorskie": "kujawsko-pomorskie",
  lubelskie: "lubelskie",
  lubuskie: "lubuskie",
  lodzkie: "łódzkie",
  malopolskie: "małopolskie",
  mazowieckie: "mazowieckie",
  opolskie: "opolskie",
  podkarpackie: "podkarpackie",
  podlaskie: "podlaskie",
  pomorskie: "pomorskie",
  slaskie: "śląskie",
  swietokrzyskie: "świętokrzyskie",
  "warminsko-mazurskie": "warmińsko-mazurskie",
  wielkopolskie: "wielkopolskie",
  zachodniopomorskie: "zachodniopomorskie",
} as const;
export type Wojewodztwo = keyof typeof WOJEWODZTWA;

/**
 * Jak dostać towar: sklep = sklep stacjonarny (można przyjechać i kupić), odbior = odbiór
 * osobisty zamówienia ze sklepu internetowego, wysylka = tylko wysyłka (regulamin albo strona
 * dostawy wymienia same przesyłki).
 */
export type Odbior = "sklep" | "odbior" | "wysylka";

export const OPIS_ODBIORU: Record<Odbior, string> = {
  sklep: "sklep stacjonarny",
  odbior: "odbiór osobisty zamówienia",
  wysylka: "tylko wysyłka",
};

/** Miejsce, do którego klient może przyjechać. Adres z ulicą tylko dla takich miejsc. */
export interface PunktSklepu {
  rodzaj: "sklep" | "odbior";
  adres: string;
  wojewodztwo: Wojewodztwo;
  godziny?: string;
}

export interface LokalizacjaSklepu {
  /** Miejscowość siedziby albo magazynu, z którego sklep wysyła. */
  miejscowosc: string | null;
  /** null = sklep za granicą albo nie ustalono. */
  wojewodztwo: Wojewodztwo | null;
  /** null = strona sklepu tego nie mówi. */
  odbior: Odbior | null;
  punkty: PunktSklepu[];
  /** Kiedy sprawdzono na stronie sklepu (RRRR-MM-DD). */
  sprawdzono: string;
  /** Strona, z której to wzięte (Kontakt, Regulamin, Dostawa). */
  zrodlo: string;
  uwagi?: string;
  /** Cennik wysyłki, gdy sklep go publikuje; brak = koszt widać dopiero w koszyku. */
  dostawa?: DostawaSklepu;
}

const L = "2026-10-25";

/**
 * Sklepy z ofert, odczytane 25.10.2026 ze stron Kontakt, Regulamin i Dostawa każdego sklepu.
 * Czego strona nie mówi, zostaje null. Przy sklepach tylko z wysyłką sama miejscowość: adres
 * jednoosobowej firmy bywa adresem domowym, a klient i tak tam nie przyjeżdża.
 * Lokalizacja nie wchodzi do kolejności ofert (decyzja Marka): tylko skład i cena.
 */
export const SKLEPY_DODATKOW: Record<string, LokalizacjaSklepu> = {
  AgroRatajczak: {
    miejscowosc: "Krajewice k. Gostynia", wojewodztwo: "wielkopolskie", odbior: "odbior",
    punkty: [{ rodzaj: "odbior", adres: "Krajewice 33, 63-800 Gostyń", wojewodztwo: "wielkopolskie", godziny: "pn–pt 7:00–16:00" }],
    sprawdzono: L, zrodlo: "https://sklep.agroratajczak.pl/regulamin-pm-11.html",
    uwagi: "Regulamin: odbiór osobisty bezpłatny. Sklep dowozi też towar swoim autem do klientów raz w tygodniu (strona główna), trasy nie podaje.",
  },
  Agrofortel: {
    miejscowosc: "Cieszyn", wojewodztwo: "slaskie", odbior: "wysylka", punkty: [],
    sprawdzono: L, zrodlo: "https://agrofortel.pl/metody-platnosci-i-koszty-dostawy",
    uwagi: "Firma czeska (siedziba w Pradze), magazyn w Cieszynie. Strona dostawy wymienia tylko kuriera GLS i Rabena.",
    dostawa: {
      progiWagi: [[2, 25], [5, 27], [10, 29], [20, 31], [30, 33], [60, 49], [90, 69], [130, 79]], darmowaOdZl: 690,
      sprawdzono: L, zrodlo: "https://agrofortel.pl/metody-platnosci-i-koszty-dostawy",
      uwagi: "Kurier GLS według wagi zamówienia; powyżej 100 kg paleta Raben 175 zł (79 zł przy zamówieniu powyżej 690 zł). Pobranie +7,90 zł.",
    },
  },
  "Farm Pet Garden": {
    miejscowosc: "Osięciny", wojewodztwo: "kujawsko-pomorskie", odbior: "sklep",
    punkty: [{ rodzaj: "sklep", adres: "Osięciny Wieś 4, 88-220 Osięciny", wojewodztwo: "kujawsko-pomorskie", godziny: "pn–pt 7:30–17:00, sob. 7:30–14:00" }],
    sprawdzono: L, zrodlo: "https://farmpetgarden.pl/kontakt",
  },
  Galvet: {
    miejscowosc: "Sowin k. Łambinowic", wojewodztwo: "opolskie", odbior: null, punkty: [],
    sprawdzono: L, zrodlo: "https://sklep-galvet.pl/kontakt-inf-4.html",
    uwagi: "Regulamin wymienia płatność gotówką przy odbiorze osobistym, ale nie podaje miejsca ani godzin odbioru: zapytaj sklep.",
  },
  Ketris: {
    miejscowosc: "Brno (Czechy)", wojewodztwo: null, odbior: "wysylka", punkty: [],
    sprawdzono: L, zrodlo: "https://www.ketris.pl/kontakt/",
    uwagi: "Firma czeska, sklepy stacjonarne tylko w Czechach (Brno, Tachov). Do Polski wysyłka GLS, Packetą albo paletą; zwroty przez Hażlach (śląskie).",
  },
  Kopalko: {
    miejscowosc: "Osielsko", wojewodztwo: "kujawsko-pomorskie", odbior: "odbior",
    punkty: [{ rodzaj: "odbior", adres: "ul. Kolonijna 5A, 86-031 Osielsko (magazyn)", wojewodztwo: "kujawsko-pomorskie", godziny: "dni robocze 8:00–16:00" }],
    sprawdzono: L, zrodlo: "https://kopalko.pl/dostawa-i-platnosci/",
    dostawa: {
      sprawdzono: L, zrodlo: "https://kopalko.pl/dostawa-i-platnosci/",
      uwagi: "Orientacyjnie: kurier od ok. 16 zł, produkty wysyłane pojedynczo od ok. 25 zł, paleta od ok. 200 zł; dokładny koszt w koszyku.",
    },
  },
  Lagrico: {
    miejscowosc: "Zaręby Kościelne", wojewodztwo: "mazowieckie", odbior: "odbior",
    punkty: [
      { rodzaj: "odbior", adres: "ul. Czyżewska 20, 07-323 Zaręby Kościelne", wojewodztwo: "mazowieckie" },
      { rodzaj: "odbior", adres: "ul. Batalionów Chłopskich 2, 28-100 Busko-Zdrój", wojewodztwo: "swietokrzyskie" },
    ],
    sprawdzono: L, zrodlo: "https://lagrico.pl/regulamin-sklepu,p2.html",
    uwagi: "Regulamin podaje dwa miejsca odbioru osobistego, bez godzin.",
  },
  "Market-Rolniczy": {
    miejscowosc: "Glinki k. Koźmina Wielkopolskiego", wojewodztwo: "wielkopolskie", odbior: "wysylka", punkty: [],
    sprawdzono: L, zrodlo: "https://market-rolniczy.pl/content/1-dostawa",
    uwagi: "Strona dostawy: wszystkie przesyłki kurierem InPost.",
  },
  "MojaFerma.pl": {
    miejscowosc: "Wrocław", wojewodztwo: "dolnoslaskie", odbior: "wysylka", punkty: [],
    sprawdzono: L, zrodlo: "https://mojaferma.pl/pl/i/Koszty-dostawy/4",
    uwagi: "Strona kosztów dostawy wymienia tylko paczki i palety. Sprzedawca: Galwet Sp. z o.o. (to inna firma niż sklep Galvet).",
    dostawa: {
      progiWagi: [[10, 18.5], [200, 29]], darmowaOdZl: 500,
      sprawdzono: L, zrodlo: "https://mojaferma.pl/pl/i/Koszty-dostawy/4",
      uwagi: "Jeden koszt za zamówienie według wagi, niezależnie od liczby paczek. Dolmix 20 i 25 kg: 15 zł. Paleta powyżej 200 kg 80 zł, powyżej 350 kg gratis.",
    },
  },
  "Pan Hodowca": {
    miejscowosc: "Czerteż k. Sanoka", wojewodztwo: "podkarpackie", odbior: "wysylka", punkty: [],
    sprawdzono: L, zrodlo: "https://www.panhodowca.pl/cms/regulamin",
    uwagi: "Regulamin: sprzedaż tylko przez internet, wysyłka paczkomatem albo kurierem.",
    dostawa: {
      zaWartosc: [[0, 15.99], [65, 2.99]], maxKgPaczki: 30,
      sprawdzono: L, zrodlo: "https://www.panhodowca.pl/cms/warunki-dostawy-oraz-czas-realizacji-zamowienia",
      uwagi: "Kurier za paczkę do 30 kg: 15,99 zł, od 65 zł zamówienia 2,99 zł. Paczkomat InPost (do 25 kg): 9,99 zł, od 65 zł 1,49 zł.",
    },
  },
  PanPasza: {
    miejscowosc: "Syberia k. Lubowidza", wojewodztwo: "mazowieckie", odbior: null, punkty: [],
    sprawdzono: L, zrodlo: "https://www.panpasza.pl/pl/contact",
    uwagi: "Strona nie opisuje dostawy ani odbioru osobistego: zapytaj sklep.",
  },
  "Paszowo.pl": {
    miejscowosc: "Damasławek", wojewodztwo: "wielkopolskie", odbior: null, punkty: [],
    sprawdzono: L, zrodlo: "https://paszowo.pl/strony/regulamin-sklepu",
    uwagi: "Regulamin sklepu internetowego wymienia kuriera i paletę, bez odbioru osobistego, ale sprzedawca (Zakład Handlowy Jóźwiakowski, ul. Żnińska 11) pisze też o sprzedaży stacjonarnej: zapytaj sklep.",
  },
  Rolmat: {
    miejscowosc: "Szpetal Górny k. Włocławka", wojewodztwo: "kujawsko-pomorskie", odbior: "odbior",
    punkty: [{ rodzaj: "odbior", adres: "ul. Lipowa 5, Szpetal Górny, 87-811 Fabianki", wojewodztwo: "kujawsko-pomorskie", godziny: "pn–pt 8:00–16:00, sob. 8:00–13:00" }],
    sprawdzono: L, zrodlo: "https://sklep.rolmat.pl/pl/i/Formy-dostaw/4",
    uwagi: "Formy dostawy: „Odbiór własny w siedzibie firmy”. Strona wspomina też o stacjonarnym centrum ogrodniczym, bez adresu.",
  },
  Rolnet: {
    miejscowosc: "Jeżów", wojewodztwo: "lodzkie", odbior: "odbior",
    punkty: [{ rodzaj: "odbior", adres: "ul. Brzezińska 60, 95-047 Jeżów", wojewodztwo: "lodzkie" }],
    sprawdzono: L, zrodlo: "https://rolnet.pl/news/n/54/Warunki-dostawy",
    uwagi: "Warunki dostawy: odbiór osobisty za 0 zł; adres ze strony „Mapa dojazdu”, godzin strona nie podaje.",
  },
  "Spec-Drob": {
    miejscowosc: "Olsztyn", wojewodztwo: "warminsko-mazurskie", odbior: "sklep",
    punkty: [{ rodzaj: "sklep", adres: "ul. Lubelska 32B, 10-409 Olsztyn", wojewodztwo: "warminsko-mazurskie", godziny: "pn–pt 8:00–16:00" }],
    sprawdzono: L, zrodlo: "https://specdrob.pl/pl/i/Kontakt/3",
    uwagi: "Strona podaje odbiór osobisty pn–pt 8:00–16:00 pod tym adresem i nazywa firmę hurtownią i sklepem dla hodowców; sklep stacjonarny potwierdził autor serwisu.",
  },
  Wisagro: {
    miejscowosc: "Mieleszyn k. Bolesławca (łódzkie)", wojewodztwo: "lodzkie", odbior: null, punkty: [],
    sprawdzono: L, zrodlo: "https://wisagro.pl/regulamin",
    uwagi: "Regulamin nie wymienia sposobów dostawy ani odbioru osobistego: zapytaj sklep.",
  },
  "Zbożowy sklep": {
    miejscowosc: "Kwiatonowice k. Gorlic", wojewodztwo: "malopolskie", odbior: null, punkty: [],
    sprawdzono: L, zrodlo: "https://www.zbozowysklep.pl/kontakt/",
    uwagi: "Regulamin mówi o „kilku opcjach dostawy” bez ich wymienienia, strona o wysyłce do paczkomatu; odbioru osobistego nie opisuje: zapytaj sklep.",
    dostawa: {
      darmowaOdZl: 100,
      sprawdzono: L, zrodlo: "https://www.zbozowysklep.pl/produkt/wtaminy-dla-kur-unipasz-univit-kurka-nioska-2-kg/",
      uwagi: "Od 100 zł przesyłka do Paczkomatu gratis; poniżej tej kwoty koszt w koszyku.",
    },
  },
  "e-pasze.pl": {
    miejscowosc: "Czarnocin", wojewodztwo: "lodzkie", odbior: "odbior",
    punkty: [{ rodzaj: "odbior", adres: "ul. Główna 160, 97-318 Czarnocin (wytwórnia pasz)", wojewodztwo: "lodzkie", godziny: "pn–pt 7:30–15:30, sob. 7:30–12:30" }],
    sprawdzono: L, zrodlo: "https://e-pasze.pl/regulamin",
    uwagi: "Regulamin wymienia odbiór osobisty bez osobnego adresu; adres i godziny to wytwórnia Agro-Kocięba ze stopki strony.",
  },
  "eZoo.pl": {
    miejscowosc: "Oborniki Śląskie", wojewodztwo: "dolnoslaskie", odbior: null, punkty: [],
    sprawdzono: L, zrodlo: "https://ezoo.pl/pl/i/O-nas/7",
    uwagi: "Strona opisuje odbiór osobisty tylko dla leków, w gabinecie weterynaryjnym po umówieniu wizyty; o paszach i dodatkach nie mówi: zapytaj sklep.",
  },
};

/** Lokalizacja sklepu po nazwie z oferty; null, gdy sklepu nie ma w SKLEPY_DODATKOW. */
export const lokalizacjaSklepu = (sklep: string): LokalizacjaSklepu | null => SKLEPY_DODATKOW[sklep] ?? null;

/** Miejsca w danym województwie, do których można przyjechać (sklep albo odbiór). */
export const punktyWWojewodztwie = (l: LokalizacjaSklepu | null | undefined, w: Wojewodztwo): PunktSklepu[] =>
  (l?.punkty ?? []).filter((p) => p.wojewodztwo === w);

/** Sklep ma siedzibę albo punkt odbioru w tym województwie. Nie mówi nic o odległości. */
export const wWojewodztwie = (l: LokalizacjaSklepu | null | undefined, w: Wojewodztwo): boolean =>
  l?.wojewodztwo === w || punktyWWojewodztwie(l, w).length > 0;

/** „Olsztyn, sklep stacjonarny” do pokazania przy ofercie na stronie. */
export function opisLokalizacji(l: LokalizacjaSklepu | null | undefined): string {
  if (!l?.miejscowosc) return "";
  return l.odbior ? `${l.miejscowosc}, ${OPIS_ODBIORU[l.odbior]}` : l.miejscowosc;
}

export interface DodatekPaszowy extends FeedIngredient {
  producent: string;
  gatunki: Gatunek[];
  /** Dawka z etykiety: % mieszanki od–do (oba równe = jedna dawka). */
  dawkaProcOd: number | null;
  dawkaProcDo: number | null;
  /** Dawka z etykiety w g na sztukę dziennie, gdy etykieta nie podaje % mieszanki. */
  dawkaGDziennie: number | null;
  /** Dawkowanie słowami, jak na etykiecie. */
  dawkowanie: string;
  /** Przepis z etykiety koncentratu, np. „30% koncentratu + 70% śruty zbożowe”. */
  stosowanie: string | null;
  skladSurowcowy: string | null;
  gmo: Gmo;
  /** true = dopuszczalny w chowie ekologicznym, false = wykluczony, null = nie oceniano. */
  dopuszczalneEko: boolean | null;
  zrodloSkladu: ZrodloSkladu;
  /**
   * Strona, z której przepisany jest skład (etykieta albo karta producenta; bywa nią strona
   * sklepu, gdy sklep pokazuje etykietę). null przy składzie typowym (norma): tabele nie mają
   * adresu, a strona sklepu bez składu nie jest jego źródłem. Gdzie kupić mówią oferty.
   */
  zrodlo: string | null;
  /** Kiedy skład sprawdzono ze źródłem (RRRR-MM-DD). */
  zweryfikowano: string;
  partner: boolean;
  urlProducenta: string | null;
  /**
   * Surowiec wzorcowy z bazy 124 tego samego rodzaju (kreda z worka -> „Kreda pastewna”).
   * Z niego produkt bierze zalecany limit udziału (src/data/udzialySurowcow.ts),
   * a propozycje „czym uzupełnić” nie pokazują dwóch rzeczy tego samego rodzaju.
   */
  odpowiednik?: string;
  /** Tylko limit udziału, bez grupowania: premiks dla niosek nie jest „Premiksem IF-W”, ale ma jego limit. */
  limityJak?: string;
  /** Co niepewne w danych albo co sprawdzić przy następnej weryfikacji. */
  uwagi?: string;
  oferty: OfertaDodatku[];
}

/** Źródło przy każdej odpowiedzi o dodatkach (strona i MCP). */
export const ZRODLO_DODATKOW = "Moja Serowarnia, baza dodatków paszowych (skład z etykiet i stron producentów, ceny ze sklepów z datą sprawdzenia)";

/** Data stanu migawki; zmieniać przy każdej zmianie danych. */
export const STAN_DODATKOW = "2026-10-25";

/** Znacznik w linkach do sklepów, po którym sklep rozpozna ruch z kalkulatora. */
export const ZNACZNIK_SKLEPU = "utm_source=mojaserowarnia";

/** Adres oferty ze znacznikiem (ten sam zapisuje seed w feed_offers.url). */
export function adresOferty(url: string): string {
  if (/[?&]utm_source=mojaserowarnia(&|$)/.test(url)) return url;
  const [bezKotwicy, kotwica] = url.split("#");
  return `${bezKotwicy}${bezKotwicy.includes("?") ? "&" : "?"}${ZNACZNIK_SKLEPU}${kotwica ? `#${kotwica}` : ""}`;
}

export const cenaZaKg = (o: Pick<OfertaDodatku, "cenaZl" | "opakowanieKg">): number => o.cenaZl / o.opakowanieKg;

/** Najtańsza za kg oferta produktu; przy równej cenie nowsza. null, gdy ofert nie ma. */
export function najtanszaOferta(oferty: OfertaDodatku[] | undefined): OfertaDodatku | null {
  if (!oferty?.length) return null;
  return [...oferty].sort((a, b) => cenaZaKg(a) - cenaZaKg(b) || b.sprawdzono.localeCompare(a.sprawdzono))[0];
}

// ── Gdzie kupić: koszt z dostawą i odbiór w województwie (od 25.10.2026) ──────

export interface KosztDostawy {
  /** zł za wysyłkę tych opakowań do domu; null = nie znamy (sklep pokazuje koszt w koszyku). */
  zl: number | null;
  /** true = strona podaje „od X zł”, w koszyku może wyjść więcej. */
  od: boolean;
  opis: string;
}

const zaokr2 = (x: number) => Math.round(x * 100) / 100;

/** Koszt wysyłki `opakowan` opakowań oferty do domu: próg darmowej dostawy, koszt z karty produktu, cennik sklepu. */
export function kosztDostawy(o: OfertaDodatku, opakowan = 1): KosztDostawy {
  const d = lokalizacjaSklepu(o.sklep)?.dostawa;
  const towar = o.cenaZl * opakowan;
  const kg = o.opakowanieKg * opakowan;
  if (d?.darmowaOdZl != null && towar >= d.darmowaOdZl) return { zl: 0, od: false, opis: `dostawa gratis od ${d.darmowaOdZl} zł` };
  if (o.dostawaZl != null) {
    // Strona produktu podaje wysyłkę jednego opakowania; kilka opakowań liczymy jako paczki do 30 kg.
    const paczek = Math.max(1, Math.ceil(kg / 30 - 1e-9));
    const szacunek = !!o.dostawaOd || opakowan > 1;
    return { zl: zaokr2(o.dostawaZl * paczek), od: szacunek, opis: szacunek ? "szacunek ze strony produktu (koszt jednej paczki)" : "koszt ze strony produktu" };
  }
  if (d?.progiWagi) {
    const prog = d.progiWagi.find(([doKg]) => kg <= doKg);
    return prog ? { zl: prog[1], od: false, opis: `cennik sklepu do ${prog[0]} kg` } : { zl: null, od: false, opis: "przesyłka paletowa: koszt w sklepie" };
  }
  if (d?.zaWartosc) {
    const paczek = Math.ceil(kg / (d.maxKgPaczki ?? 30));
    const stawka = [...d.zaWartosc].reverse().find(([odZl]) => towar >= odZl)?.[1];
    if (stawka != null) return { zl: zaokr2(stawka * paczek), od: false, opis: `cennik sklepu, ${paczek} ${paczek === 1 ? "paczka" : "paczki"}` };
  }
  return { zl: null, od: false, opis: "koszt w koszyku sklepu" };
}

export interface PropozycjaZakupu {
  oferta: OfertaDodatku;
  opakowan: number;
  towarZl: number;
  dostawa: KosztDostawy;
  /** Towar + dostawa; null, gdy kosztu dostawy nie znamy. */
  razemZl: number | null;
}

export interface PropozycjeZakupu {
  /** Najniższa cena z dostawą do domu wśród ofert ze znanym kosztem wysyłki. */
  zDostawa: PropozycjaZakupu | null;
  /** Najtańszy towar bez znanego kosztu wysyłki, gdy wychodzi taniej niż zDostawa albo zDostawa brak. */
  bezZnanejDostawy: PropozycjaZakupu | null;
  /** Najtańsza oferta sklepu, do którego można przyjechać w tym województwie (odbiór, bez wysyłki). */
  doOdebrania: PropozycjaZakupu | null;
}

/**
 * Dwie propozycje zamiast jednej „najtańszej” (decyzja Marka 25.10.2026): najtaniej z dostawą
 * do domu i do odebrania w województwie. Ilość: `kg` (np. zapas stada na 30 dni), bez niej
 * jedno opakowanie. Kolejność tylko po cenie; pole partner nic tu nie zmienia.
 */
export function propozycjeZakupu(oferty: OfertaDodatku[], kg: number | null, wojewodztwo?: Wojewodztwo | null): PropozycjeZakupu {
  const ile = kg && kg > 0 ? kg : typoweOpakowanieKg(oferty);
  const wszystkie: PropozycjaZakupu[] = oferty.map((o) => {
    const opakowan = Math.max(1, Math.ceil(ile / o.opakowanieKg - 1e-9));
    const towarZl = zaokr2(o.cenaZl * opakowan);
    const dostawa = kosztDostawy(o, opakowan);
    return { oferta: o, opakowan, towarZl, dostawa, razemZl: dostawa.zl == null ? null : zaokr2(towarZl + dostawa.zl) };
  });
  const najmniej = (lista: PropozycjaZakupu[], ile: (p: PropozycjaZakupu) => number) =>
    lista.length ? lista.reduce((a, b) => (ile(b) < ile(a) ? b : a)) : null;
  const zDostawa = najmniej(wszystkie.filter((p) => p.razemZl != null), (p) => p.razemZl!);
  const bez = najmniej(wszystkie.filter((p) => p.razemZl == null), (p) => p.towarZl);
  const doOdebrania = wojewodztwo
    ? najmniej(wszystkie.filter((p) => punktyWWojewodztwie(p.oferta.lokalizacja ?? lokalizacjaSklepu(p.oferta.sklep), wojewodztwo).length > 0), (p) => p.towarZl)
    : null;
  return {
    zDostawa,
    bezZnanejDostawy: bez && (!zDostawa || bez.towarZl < zDostawa.razemZl!) ? bez : null,
    doOdebrania,
  };
}

/**
 * Ilość do porównania, gdy nikt jej nie podał: najczęstsze opakowanie wśród ofert (przy remisie
 * większe). Bez tego wiaderko 2,5 kg wygrywałoby z workiem 25 kg tylko dlatego, że jest mniejsze.
 */
export function typoweOpakowanieKg(oferty: OfertaDodatku[]): number {
  const ile = new Map<number, number>();
  for (const o of oferty) ile.set(o.opakowanieKg, (ile.get(o.opakowanieKg) ?? 0) + 1);
  return [...ile.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? 1;
}

/** Oferta z migawki po adresie (bez znacznika utm): strona dokleja z niej koszt wysyłki do ofert z bazy. */
export function ofertaZMigawki(url: string): OfertaDodatku | undefined {
  const czysty = url.replace(/[?&]utm_source=mojaserowarnia(?=&|#|$)/, "");
  return DODATKI_PASZOWE.flatMap((d) => d.oferty).find((o) => o.url === czysty);
}

/**
 * Jedna dawka z etykiety w % mieszanki, do premiksów i dodatków w stałej dawce:
 * dawka, gdy etykieta podaje jedną liczbę, środek przedziału, gdy „od–do”. 0 = etykieta
 * nie podaje dawki w % (np. tylko g na sztukę).
 */
export function dawkaEtykiety(d: Pick<DodatekPaszowy, "dawkaProcOd" | "dawkaProcDo">): number {
  const { dawkaProcOd: od, dawkaProcDo: doo } = d;
  if (od != null && doo != null) return (od + doo) / 2;
  return doo ?? od ?? 0;
}

/** Dawka z etykiety słowami: „2–3% mieszanki”, „15 g na sztukę dziennie”. */
export function opisDawki(d: Pick<DodatekPaszowy, "dawkaProcOd" | "dawkaProcDo" | "dawkaGDziennie">): string {
  const pl = (x: number) => String(x).replace(".", ",");
  const czesci: string[] = [];
  if (d.dawkaProcOd != null && d.dawkaProcDo != null && d.dawkaProcOd !== d.dawkaProcDo) czesci.push(`${pl(d.dawkaProcOd)}–${pl(d.dawkaProcDo)}% mieszanki`);
  else if (d.dawkaProcDo != null || d.dawkaProcOd != null) czesci.push(`${d.dawkaProcOd == null ? "do " : ""}${pl((d.dawkaProcOd ?? d.dawkaProcDo)!)}% mieszanki`);
  if (d.dawkaGDziennie != null) czesci.push(`${pl(d.dawkaGDziennie)} g na sztukę dziennie`);
  return czesci.join(" albo ");
}

// ── Przepis koncentratu: „koncentrat + Twoje zboże” ─────────────────────────

/** Przepis z pola `stosowanie` w liczbach. Nazwy w `inne` to surowce z bazy 124, gdy dały się rozpoznać. */
export interface PrzepisKoncentratu {
  koncentrat: number;
  zboza: [number, number];
  inne: { nazwa: string; tekst: string; od: number; do: number }[];
}

// Dodatki, które etykiety koncentratów każą dosypać obok zboża, rozpoznawane po słowie.
const DOSYPKI: Array<[RegExp, string]> = [
  [/sojow/i, "Śruta sojowa"],
  [/kred|wapien|węglan wapnia/i, "Kreda pastewna"],
  [/fosforan/i, "Fosforan dwuwapniowy"],
  [/s[oó]l/i, "Sól kuchenna"],
  [/olej/i, "Olej rzepakowy"],
];

const liczbaZTekstu = (t: string) => parseFloat(t.replace(",", "."));

/**
 * „15% koncentratu + 6-8% śruta sojowa + 8% kreda + 71-73% śruty zbożowe” ->
 * { koncentrat: 15, zboza: [71, 73], inne: [soja 6–8, kreda 8–8] }. null, gdy tekst
 * nie ma udziału koncentratu i zbóż (wtedy kalkulator niczego nie zgaduje).
 */
export function przepisZeStosowania(stosowanie: string | null | undefined): PrzepisKoncentratu | null {
  if (!stosowanie) return null;
  let koncentrat: number | null = null;
  let zboza: [number, number] | null = null;
  const inne: PrzepisKoncentratu["inne"] = [];
  for (const kawalek of stosowanie.split("+")) {
    const m = kawalek.match(/(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*%\s*(.+)/);
    if (!m) continue;
    const od = liczbaZTekstu(m[1]);
    const doo = m[2] ? liczbaZTekstu(m[2]) : od;
    const co = m[3].trim();
    if (/koncentrat/i.test(co)) koncentrat = od;
    else if (/zbo[żz]/i.test(co)) zboza = [od, doo];
    else inne.push({ nazwa: DOSYPKI.find(([re]) => re.test(co))?.[1] ?? "", tekst: co, od, do: doo });
  }
  return koncentrat != null && zboza ? { koncentrat, zboza, inne } : null;
}

// ── Dane ────────────────────────────────────────────────────────────────────

const ZERA: Omit<FeedIngredient, "nazwa" | "kategoria"> = {
  em: 0, bialko: 0, ca: 0, p: 0, wlokno: 0, na: 0, k: 0, mg: 0, mn: 0, zn: 0, se: 0, fe: 0, i: 0,
  suchaMasa: 0, tluszcz: 0, popiol: 0, skrobia: 0, cukier: 0, pPrzyswajalny: 0, cl: 0, s: 0, cu: 0, co: 0,
  lys: 0, met: 0, metCys: 0, trp: 0, thr: 0, ile: 0, leu: 0, val: 0, his: 0, arg: 0, phe: 0, tyr: 0,
  witA: 0, witD3: 0, witE: 0, witB1: 0, witB2: 0, witB6: 0, kwasPantotenowy: 0, kwasFoliowy: 0,
  biotyna: 0, niacyna: 0, witB12: 0, cholina: 0, kwasLinolowy: 0,
};

type Wpis = Partial<FeedIngredient> & Pick<FeedIngredient, "nazwa" | "kategoria">
  & Omit<DodatekPaszowy, keyof FeedIngredient | "dawkaProcOd" | "dawkaProcDo" | "dawkaGDziennie" | "stosowanie" | "skladSurowcowy" | "urlProducenta" | "partner">
  & Partial<Pick<DodatekPaszowy, "dawkaProcOd" | "dawkaProcDo" | "dawkaGDziennie" | "stosowanie" | "skladSurowcowy" | "urlProducenta" | "partner">>
  & {
    /**
     * Surowiec wzorcowy, z którego biorą się wartości, których etykieta surowca nie
     * podaje (drożdże bez energii, śruta bez aminokwasów). Tylko dla surowców: premiks
     * czy minerał bez danej wartości naprawdę jej nie ma, więc zostaje 0.
     */
    uzupelnijZ?: string;
  };

// Wszystkie odczytane 24.10.2026. Strony sklepów i producentów były czytane przez
// wyszukiwarkę (kontener sesji nie otwierał ich wprost): adresy są przy każdej
// pozycji, do kliknięcia przed seedem. Oferty tylko te, których cena i opakowanie
// wyszły tak samo w dwóch odczytach albo stały wprost na stronie produktu.
const D = "2026-10-24";
// Stare zgłoszenia z kalkulatora sprawdzone ze źródłem 25.10.2026 (strony pobrane wprost).
const ZGL = "2026-10-25";
// Oferty dopisane do produktów już opisanych, cena i 25 kg wprost ze strony produktu 25.10.2026.
const D25 = "2026-10-25";
const ROLPOL = "https://www.schaumannrolpol.pl/produkty/drob/kury-nioski/koncentraty-kury-nioski";

const WPISY: Wpis[] = [
  // ── Koncentraty ──────────────────────────────────────────────────────────
  {
    nazwa: "Koncentrat 15% Nioska (Rolpol)", kategoria: "Koncentraty",
    producent: "Rolpol Żywienie Zwierząt, Uścikowo (na premiksach Schaumann)", gatunki: ["nioski"],
    em: 8.58, bialko: 41.5, tluszcz: 1.34, wlokno: 2.85, popiol: 11.86, ca: 1.33, p: 1.39, na: 0.79,
    lys: 2.8, met: 1.42, metCys: 2.1, thr: 1.78, trp: 0.57,
    witA: 99, witD3: 13.2, witE: 132, witB1: 13.2, witB2: 33, witB6: 19.8, witB12: 132, kwasPantotenowy: 66, biotyna: 0.396,
    fe: 264, cu: 66, mn: 660, zn: 396, i: 3.3, se: 3.3,
    dawkaProcOd: 15, dawkaProcDo: 15,
    dawkowanie: "15% koncentratu w mieszance, razem ze śrutą sojową, kredą i zbożem (przepis z etykiety niżej)",
    stosowanie: "15% koncentratu + 6–8% śruta sojowa + 8% kreda pastewna (węglan wapnia) + 71–73% śruty zbożowe",
    skladSurowcowy: "Śruta poekstrakcyjna sojowa LINIA (40-3-2), fosforan jednowapniowy, chlorek sodu. Konserwanty: kwasy organiczne E280, E236, E270 6 g/kg. Barwnik: E161g kantaksantyna 13,32 mg/kg.",
    gmo: "tak", dopuszczalneEko: false,
    zrodloSkladu: "producent", zrodlo: ROLPOL, urlProducenta: ROLPOL, zweryfikowano: D,
    uwagi: "Etykieta podaje też witaminę K3 19,8 mg/kg. „Ten produkt zawiera organizmy genetycznie zmodyfikowane.” Cen na stronie producenta nie ma: zamówienia e-mailem, worki 25 kg.",
    oferty: [],
  },
  {
    nazwa: "Koncentrat 30% Nioska (Rolpol)", kategoria: "Koncentraty",
    producent: "Rolpol Żywienie Zwierząt, Uścikowo (na premiksach Schaumann)", gatunki: ["nioski"],
    em: 6.42, bialko: 30.91, tluszcz: 1.0, wlokno: 2.13, popiol: 34.55, ca: 11.32, p: 0.83, na: 0.4,
    lys: 2.09, met: 0.87, metCys: 1.37, thr: 1.33, trp: 0.43,
    witA: 51, witD3: 6.8, witE: 68, witB1: 6.8, witB2: 17, witB6: 10.2, witB12: 68, kwasPantotenowy: 34, biotyna: 0.204,
    fe: 136, cu: 34, mn: 340, zn: 204, i: 1.7, se: 1.7,
    dawkaProcOd: 30, dawkaProcDo: 30,
    dawkowanie: "30% koncentratu w mieszance, reszta to zboże",
    stosowanie: "30% koncentratu + 70% śruty zbożowe",
    skladSurowcowy: "Śruta poekstrakcyjna sojowa LINIA (40-3-2), węglan wapnia, fosforan jednowapniowy, chlorek sodu. Konserwanty: kwasy organiczne E280, E236, E270 6 g/kg. Barwnik: E161g kantaksantyna 6,66 mg/kg.",
    gmo: "tak", dopuszczalneEko: false,
    zrodloSkladu: "producent", zrodlo: ROLPOL, urlProducenta: ROLPOL, zweryfikowano: D,
    uwagi: "Etykieta podaje też witaminę K3 10,2 mg/kg. Śruta sojowa LINIA 40-3-2 to soja GM. Cen na stronie producenta nie ma: zamówienia e-mailem, worki 25 kg.",
    oferty: [],
  },

  // ── Premiksy i mieszanki mineralno-witaminowe dla niosek ─────────────────
  {
    nazwa: "Drobmix Nioska 4% (Agro-Kocięba)", kategoria: "Premiksy",
    producent: "Wytwórnia Pasz i Koncentratów Agro-Kocięba, Czarnocin", gatunki: ["nioski", "odchow"],
    ca: 32.5, p: 1.19, na: 1.9, lys: 0.85, met: 0.81,
    witA: 150, witD3: 45, witE: 450, witB1: 22.5, witB2: 90, witB6: 60, witB12: 225, niacyna: 600,
    kwasPantotenowy: 135, kwasFoliowy: 15, biotyna: 2.4, cholina: 3.5,
    fe: 750, cu: 180, mn: 1200, zn: 1050, i: 15, se: 3,
    dawkaProcOd: 4, dawkaProcDo: 4,
    dawkowanie: "40 kg na 1000 kg mieszanki pełnoporcjowej (4%), dokładnie wymieszać",
    skladSurowcowy: "Nośnik: węglan wapnia, fosforan jednowapniowy, chlorek sodu, wodorowęglan sodu, tlenek magnezu.",
    gmo: "nieznane", dopuszczalneEko: null,
    zrodloSkladu: "producent",
    zrodlo: "https://e-pasze.pl/produkt/mieszanka-witaminowo-mineralna-dla-drobiu-4kg-drobmix-nioska-4/",
    urlProducenta: "https://e-pasze.pl/produkt/mieszanka-witaminowo-mineralna-dla-drobiu-4kg-drobmix-nioska-4/",
    zweryfikowano: D,
    uwagi: "Etykieta podaje wartości w g/kg (Ca 325 g, P 11,9 g, Na 19 g), tu przeliczone na %. Wiaderko 4 kg.",
    oferty: [
      { sklep: "Rolnet", url: "https://rolnet.pl/Witaminy-dla-kur-Drobmix-NIOSKA-4-4-kg-premiks-dla-kur-niosek-i-kurczat-p4151", cenaZl: 30.0, opakowanieKg: 4, sprawdzono: D, dostawaZl: 13 },
      { sklep: "e-pasze.pl", url: "https://e-pasze.pl/produkt/mieszanka-witaminowo-mineralna-dla-drobiu-4kg-drobmix-nioska-4/", cenaZl: 32.0, opakowanieKg: 4, sprawdzono: D },
    ],
  },
  {
    nazwa: "Dolmix DN (Dolfos)", kategoria: "Premiksy",
    producent: "Dolfos", gatunki: ["nioski"],
    ca: 26.6, p: 1.0, na: 5.2, lys: 1.5, met: 4.0,
    witA: 400, witD3: 80, witE: 880, witB1: 45, witB2: 160, witB6: 100, witB12: 1000, niacyna: 850,
    kwasPantotenowy: 450, kwasFoliowy: 35, biotyna: 2.0, cholina: 6.66,
    fe: 700, cu: 500, mn: 2400, zn: 2000, i: 40, se: 8,
    dawkaProcOd: 2.5, dawkaProcDo: 2.5, dawkaGDziennie: 2.5,
    dawkowanie: "Na 10 niosek 25 g dziennie do paszy; w żywieniu grupowym 2,5 kg na 100 kg paszy (2,5%)",
    skladSurowcowy: "Węglan wapnia (w tym z muszli ostryg), chlorek sodu, węglan wapniowo-magnezowy, fosforan monowapniowy, drożdże suszone, glicerol.",
    gmo: "nieznane", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://farmpetgarden.pl/produkt/witaminy-dla-kur-niosek-dolmix-dn-dolfos-10kg",
    urlProducenta: "https://www.dolfos.pl/en/p/dolmix-dn-en/",
    zweryfikowano: D,
    uwagi: "Producent nie publikuje składu, tu z etykiety przepisanej przez trzy sklepy. Jeden sklep (worek 25 kg) podaje inne liczby: P 6,7%, lizyna 1,9%, metionina 4,97%; do sprawdzenia na worku. Etykieta podaje też witaminę K3 80 mg/kg i betainę 3100 mg/kg. Nie mylić z wersją ekologiczną Dolmix DN RE.",
    oferty: [
      { sklep: "Pan Hodowca", url: "https://www.panhodowca.pl/dolmix-dn-10-kg-witamina-dla-niosek-dolfos-id-126", cenaZl: 67.0, opakowanieKg: 10, sprawdzono: D },
      { sklep: "Farm Pet Garden", url: "https://farmpetgarden.pl/produkt/witaminy-dla-kur-dolmix-dn-dolfos-10kg/", cenaZl: 68.0, opakowanieKg: 10, sprawdzono: D },
    ],
  },
  {
    nazwa: "Polfamix Nioska Extra (Trouw Nutrition)", kategoria: "Premiksy",
    producent: "Trouw Nutrition Polska", gatunki: ["nioski", "indyki", "kaczki", "gesi"],
    ca: 29.88, p: 2.5, na: 4.0, lys: 0.8, met: 1.7, thr: 0.3,
    witA: 250, witD3: 50, witE: 500, witB1: 30, witB2: 100, witB6: 65, witB12: 500, niacyna: 550,
    kwasPantotenowy: 280, kwasFoliowy: 25, cholina: 0.68,
    fe: 1957, cu: 250, mn: 1750, zn: 1500, i: 25, se: 5,
    dawkaProcOd: 4, dawkaProcDo: 4, dawkaGDziennie: 4,
    dawkowanie: "40 g na 10 sztuk dziennie albo 1 kg na 25 kg paszy, przez cały okres nieśności",
    skladSurowcowy: "Fosforan jednowapniowy, węglan wapnia, chlorek sodu.",
    gmo: "nieznane", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://weterynaryjny.pl/produkt/trouw-polfamix-nioska-extra-1-kg/",
    urlProducenta: "https://www.trouwnutrition.pl/pl-pl/programme-lister/polfamix-nioska-extra-467743/",
    zweryfikowano: D,
    uwagi: "Producent publikuje tylko przeznaczenie i dawkę, skład z etykiety przepisanej przez sklepy, w g/kg (Ca 298,8 g, P 25 g, Na 40 g), tu w %. Worek 10 kg ma w jednym sklepie inne liczby (Ca 27,83%, P 3,75%). Żelazo 1957 albo 1975 mg/kg zależnie od sklepu. Etykieta podaje też witaminę K3 50 mg/kg.",
    oferty: [
      { sklep: "MojaFerma.pl", url: "https://mojaferma.pl/pl/p/Polfamix-NIOSKA-Extra-1kg/350", cenaZl: 16.0, opakowanieKg: 1, sprawdzono: D },
      { sklep: "eZoo.pl", url: "https://ezoo.pl/pl/p/POLFAMIX-NIOSKA-EXTRA-1-kg-witaminy-mineraly-drob-kury-11209125/13093", cenaZl: 20.0, opakowanieKg: 1, sprawdzono: D, dostawaZl: 10, dostawaOd: true },
    ],
  },

  // ── Dodatki mineralne ────────────────────────────────────────────────────
  {
    nazwa: "Kreda pastewna Viva Max (Polcalc)", kategoria: "Dodatki mineralne", odpowiednik: "Kreda pastewna",
    producent: "Polcalc (grupa Holcim)", gatunki: [],
    ca: 37.6,
    dawkowanie: "Etykieta nie podaje dawki. Producent pisze o 3–4% mieszanki dla drobiu; nioska w nieśności potrzebuje więcej wapnia, więc ilość liczy się z normy.",
    skladSurowcowy: "Węglan wapnia z wapieni i margli jurajskich (Barcin, Piechcin, Pakość). CaCO3 średnio 94%, co najmniej 92,5%. Frakcja 0,4–1,2 mm.",
    gmo: "nie", dopuszczalneEko: true,
    zrodloSkladu: "producent",
    zrodlo: "https://polcalc.pl/en/produkty/kreda-pastewna-viva-max-25-kg/",
    urlProducenta: "https://polcalc.pl/en/produkty/kreda-pastewna-viva-max-25-kg/",
    zweryfikowano: D,
    uwagi: "Ca 37,6% to średnia, producent gwarantuje co najmniej 37%. Węglan wapnia jest na liście pasz mineralnych dopuszczonych w produkcji ekologicznej (rozp. wykonawcze (UE) 2021/1165, załącznik III). Spec-Drob (Olsztyn) sprzedaje drobniejszą frakcję 0,1–0,4 mm o tym samym składzie; 24.10.2026 była tam chwilowo niedostępna.",
    oferty: [
      { sklep: "AgroRatajczak", url: "https://sklep.agroratajczak.pl/kreda-pastewna-vivamax-0-4-1-2mm-25kg-p-164.html", cenaZl: 15.0, opakowanieKg: 25, sprawdzono: D, dostawaZl: 25, dostawaOd: true },
      { sklep: "Rolmat", url: "https://sklep.rolmat.pl/Kreda-Pastewna-VivaMax-0,4-1,2-25kg", cenaZl: 23.0, opakowanieKg: 25, sprawdzono: D },
      { sklep: "Spec-Drob", url: "https://specdrob.pl/pl/p/Kreda-Pastewna-25-kg-Viva-Max-0%2C1-0%2C4/1385", cenaZl: 23.0, opakowanieKg: 25, sprawdzono: D },
    ],
  },
  {
    nazwa: "Grys wapienny Mikros (Mikrop)", kategoria: "Dodatki mineralne", odpowiednik: "Kreda pastewna",
    producent: "Mikrop Čebín (Czechy)", gatunki: ["nioski", "kaczki", "gesi", "indyki"],
    ca: 35,
    dawkowanie: "Do woli (ad libitum), dodawany do ziarna i paszy",
    skladSurowcowy: "Węglan wapnia (wapień kruszony), frakcja ok. 1–2 mm.",
    gmo: "nie", dopuszczalneEko: true,
    zrodloSkladu: "etykieta",
    zrodlo: "https://agrofortel.pl/micros-wapno-grys-3kg",
    urlProducenta: "https://www.mikrop.cz/produkt/vapenny-grit~p528",
    zweryfikowano: D,
    uwagi: "Sklep podaje „zawartość węglanu wapnia ok. 35%”; w wapieniu węglanu jest ponad 90%, więc chodzi o wapń (Ca) i tak to przyjęto. Strona producenta procentu nie podaje. Na opakowaniu oznaczenie ekologiczne CZ-BIO-002.",
    oferty: [
      { sklep: "Agrofortel", url: "https://agrofortel.pl/micros-wapno-grys-3kg", cenaZl: 12.04, opakowanieKg: 3, sprawdzono: D },
    ],
  },
  {
    nazwa: "Muszle ostryg OYTA 2 (Algavita)", kategoria: "Dodatki mineralne", odpowiednik: "Muszle mielone",
    producent: "Algavita, Konstancin-Jeziorna (importer)", gatunki: ["nioski"],
    ca: 37,
    dawkaProcOd: 3, dawkaProcDo: 4,
    dawkowanie: "Dla intensywnie niosących kur 3–4% w mieszance pełnoporcjowej, zamiast części kredy (do 2/3); brojlery i indyki 1–2%",
    skladSurowcowy: "Kruszone muszle ostryg (węglan wapnia), suszone i sterylizowane. OYTA 2 to frakcja dla kur niosek.",
    gmo: "nie", dopuszczalneEko: true,
    zrodloSkladu: "producent",
    zrodlo: "https://algavita.pl/muszle-ostryg-2/muszle-oyta-2/",
    urlProducenta: "https://algavita.pl/muszle-ostryg-2/muszle-oyta-2/",
    zweryfikowano: D,
    uwagi: "Ca 37–39% według dystrybutora, tu dolna granica. Producenta dystrybutor nie podaje. Muszle morskie są na liście pasz mineralnych dopuszczonych w produkcji ekologicznej. Ceny z podaną wagą opakowania nie znaleźliśmy.",
    oferty: [],
  },
  {
    nazwa: "Fosforan jednowapniowy paszowy (Lagrico)", kategoria: "Dodatki mineralne", odpowiednik: "Fosforan jednowapniowy",
    producent: "nie podano (sprzedawca: Lagrico)", gatunki: [],
    ca: 16, p: 22.7,
    dawkowanie: "Etykieta nie podaje dawki; ilość dobiera się do normy fosforu (zwykle 1–2% mieszanki)",
    skladSurowcowy: "Fosforan jednowapniowy Ca(H2PO4)2·H2O, granulat. Fluor najwyżej 2000 mg/kg, wilgotność najwyżej 3%.",
    gmo: "nie", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://lagrico.pl/fosforan-jednowapniowy-paszowy-worek-25kg,id760.html",
    zweryfikowano: D,
    uwagi: "P co najmniej 22,7%, Ca co najmniej 16% (strona sklepu). Producenta sklep nie podaje. Dla chowu ekologicznego potrzebny fosforan odfluorowany: sprawdź u sprzedawcy.",
    oferty: [
      { sklep: "Lagrico", url: "https://lagrico.pl/fosforan-jednowapniowy-paszowy-worek-25kg,id760.html", cenaZl: 139.0, opakowanieKg: 25, sprawdzono: D, dostawaZl: 17 },
    ],
  },
  {
    nazwa: "Fosforan dwuwapniowy paszowy (Galvet)", kategoria: "Dodatki mineralne", odpowiednik: "Fosforan dwuwapniowy", uzupelnijZ: "Fosforan dwuwapniowy",
    producent: "nie podano (sprzedawca: Galvet, Sowin)", gatunki: [],
    dawkowanie: "Sklep nie podaje dawki; ilość dobiera się do normy fosforu (zwykle 1–2% mieszanki)",
    skladSurowcowy: "Fosforan dwuwapniowy paszowy CaHPO4, worek 25 kg.",
    gmo: "nie", dopuszczalneEko: null,
    zrodloSkladu: "norma",
    zrodlo: null,
    zweryfikowano: D,
    uwagi: "Sklep nie podaje składu ani producenta, więc wartości są typowe dla fosforanu dwuwapniowego paszowego (P ok. 18%, Ca ok. 24%): przed zakupem sprawdź etykietę na worku. Dla chowu ekologicznego potrzebny fosforan odfluorowany: sprawdź u sprzedawcy.",
    oferty: [
      { sklep: "Galvet", url: "https://sklep-galvet.pl/fosforan-dwuwapniowy-25kg-paszowy-worek-p-20723.html", cenaZl: 230.63, opakowanieKg: 25, sprawdzono: D },
    ],
  },
  {
    nazwa: "Sól paszowa kłodawska (KS Kłodawa)", kategoria: "Dodatki mineralne", odpowiednik: "Sól kuchenna",
    producent: "Kopalnia Soli „Kłodawa”", gatunki: [],
    na: 38.16, cl: 58.84,
    dawkowanie: "Producent nie podaje dawki; drób potrzebuje ok. 0,3% soli w paszy",
    skladSurowcowy: "Sól kamienna paszowa (PN-C-84081-2:1998), NaCl co najmniej 97%, bez antyzbrylacza.",
    gmo: "nie", dopuszczalneEko: true,
    zrodloSkladu: "producent",
    zrodlo: "https://sol-klodawa.com.pl/wp-content/uploads/2020/10/s%C3%B3l-paszowa-nowe-2020.pdf",
    urlProducenta: "https://sol-klodawa.com.pl/sol-paszowa/",
    zweryfikowano: D,
    uwagi: "Producent podaje NaCl co najmniej 97%; sód i chlor wyliczone z tej zawartości (czysty NaCl to 39,34% Na i 60,66% Cl). Chlorek sodu jest na liście pasz mineralnych dopuszczonych w produkcji ekologicznej.",
    oferty: [
      { sklep: "Paszowo.pl", url: "https://paszowo.pl/dodatki-paszowe-dla-bydla/sol-kamienna-klodawska-naturalna-paszowa-25kg.html", cenaZl: 29.0, opakowanieKg: 25, sprawdzono: D },
    ],
  },

  // ── Drożdże i śruta (surowce: czego etykieta nie podaje, z tabel) ────────
  {
    nazwa: "Drożdże piwne sypkie (Mikrop)", kategoria: "Produkty uboczne, śruty i oleje", odpowiednik: "Drożdże piwne", uzupelnijZ: "Drożdże piwne",
    producent: "Mikrop Čebín (Czechy)", gatunki: ["nioski", "kaczki", "indyki"],
    bialko: 44, popiol: 7,
    dawkaGDziennie: 0.6,
    dawkowanie: "Na 10 sztuk dziennie: kury i kaczki 3–6 g, indyki 10–12 g, drób do 4. tygodnia 1–2 g, od 5. do 12. tygodnia 3 g",
    skladSurowcowy: "Drożdże suszone (Saccharomyces cerevisiae), sypkie.",
    gmo: "nieznane", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://www.ketris.pl/drozdze-piwowarskie-25kg_z10013/",
    urlProducenta: "https://www.mikrop.cz/vyziva-zvirat/drobnochovy-zajmove-chovy/drubez",
    zweryfikowano: D,
    uwagi: "Etykieta podaje białko 44% i popiół 7%; pozostałe wartości przyjęte jak dla „Drożdże piwne” z tabel. Dawka w kalkulatorze to górna dawka dla kur (6 g na 10 sztuk dziennie). Nie mylić z granulowaną wersją Mikrop (drożdże ze śrutą, ok. 25% białka).",
    oferty: [
      { sklep: "Ketris", url: "https://www.ketris.pl/drozdze-piwowarskie-25kg_z10013/", cenaZl: 281.77, opakowanieKg: 25, sprawdzono: D },
    ],
  },
  {
    nazwa: "Drożdże piwne Brewers Yeast S (Leiber)", kategoria: "Produkty uboczne, śruty i oleje", odpowiednik: "Drożdże piwne", uzupelnijZ: "Drożdże piwne",
    producent: "Leiber (Niemcy)", gatunki: [],
    bialko: 43, tluszcz: 1, wlokno: 1, popiol: 7, ca: 0.2, p: 1.0, lys: 3.0, met: 0.5, metCys: 1.2, thr: 2.2, trp: 0.4,
    dawkaProcOd: 3, dawkaProcDo: 5,
    dawkowanie: "3–5% w paszy pełnoporcjowej dla drobiu, zależnie od gatunku i okresu",
    skladSurowcowy: "100% Saccharomyces cerevisiae (drożdże piwne), suszone rozpyłowo.",
    gmo: "nie", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://kopalko.pl/sklep/produkty-dla-bydla/drozdze-dla-bydla/leiber-brewers-yeast/",
    urlProducenta: "https://leibergmbh.de/en/markets-solutions/livestock/poultry/",
    zweryfikowano: D,
    uwagi: "Skład z karty dystrybutora (Kopalko). Energii i sodu karta nie podaje: przyjęte jak dla „Drożdże piwne” z tabel. Ta sama strona dla koni podaje 40% białka zamiast 43%.",
    oferty: [
      { sklep: "Kopalko", url: "https://kopalko.pl/sklep/produkty-dla-bydla/drozdze-dla-bydla/leiber-brewers-yeast/", cenaZl: 324.0, opakowanieKg: 25, sprawdzono: D, dostawaZl: 25, dostawaOd: true },
    ],
  },
  {
    nazwa: "Śruta sojowa bez GMO (Market-Rolniczy)", kategoria: "Produkty uboczne, śruty i oleje", odpowiednik: "Śruta sojowa", uzupelnijZ: "Śruta sojowa",
    producent: "nie podano (sprzedawca: Market-Rolniczy, Glinki k. Koźmina Wielkopolskiego)", gatunki: [],
    bialko: 46, tluszcz: 1.6, wlokno: 3.5,
    // Bez dawkaProcDo: sprzedawca podaje 10–20% dla wszystkich gatunków naraz, a od 24.10.2026
    // górna dawka z etykiety jest granicą doboru (udzialySurowcow.ts). Brojler w starterze
    // potrzebuje więcej soi, więc taka granica psułaby mu mieszankę. Zwykła śruta sojowa też jej nie ma.
    dawkowanie: "10–20% mieszanki (bez podziału na gatunki)",
    skladSurowcowy: "Śruta sojowa poekstrakcyjna bez GMO, worek 20 kg.",
    gmo: "nie", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://market-rolniczy.pl/768-sruta-sojowa-bez-gmo-.html",
    zweryfikowano: D,
    uwagi: "Etykieta podaje białko 46%, tłuszcz 1,6% i włókno najwyżej 3,5%; resztę przyjęto jak dla zwykłej śruty sojowej z tabel. „Bez GMO” według nazwy i opisu sprzedawcy, bez certyfikatu na stronie. Na tej samej stronie widać też cenę 110 zł.",
    oferty: [
      { sklep: "Market-Rolniczy", url: "https://market-rolniczy.pl/768-sruta-sojowa-bez-gmo-.html", cenaZl: 140.0, opakowanieKg: 20, sprawdzono: D },
    ],
  },

  // ── Aminokwasy ───────────────────────────────────────────────────────────
  {
    nazwa: "DL-metionina 99% paszowa (bez marki)", kategoria: "Aminokwasy i dodatki paszowe", odpowiednik: "Metionina",
    producent: "nie podano (sprzedawcy: Wisagro, PanPasza)", gatunki: ["nioski", "brojlery", "indyki"],
    met: 99, metCys: 99,
    dawkowanie: "Etykieta nie podaje dawki dla drobiu: wpisz dawkę z receptury (zwykle dziesiąte części procenta)",
    skladSurowcowy: "DL-metionina z syntezy chemicznej, co najmniej 99%.",
    gmo: "nie", dopuszczalneEko: false,
    zrodloSkladu: "etykieta",
    zrodlo: "https://wisagro.pl/produkt/dl-metionina-99-aminokwas-paszowy-dla-drobiu-worek-25-kg/",
    zweryfikowano: D,
    uwagi: "Producenta sklepy nie podają. Syntetyczne aminokwasy są w chowie ekologicznym niedopuszczalne.",
    oferty: [
      { sklep: "PanPasza", url: "https://panpasza.pl/pl/p/Metionina-99-25kg/256", cenaZl: 600.0, opakowanieKg: 25, sprawdzono: D },
      { sklep: "Wisagro", url: "https://wisagro.pl/produkt/dl-metionina-99-aminokwas-paszowy-dla-drobiu-worek-25-kg/", cenaZl: 640.0, opakowanieKg: 25, sprawdzono: D },
    ],
  },
  {
    nazwa: "Rhodimet NP99 (Adisseo)", kategoria: "Aminokwasy i dodatki paszowe", odpowiednik: "Metionina",
    producent: "Adisseo (Francja), w Polsce Adifeed", gatunki: [],
    met: 99, metCys: 99,
    dawkowanie: "Producent nie podaje dawki dla drobiu: wpisz dawkę z receptury",
    skladSurowcowy: "DL-metionina, co najmniej 99%, sypki proszek. Worki 25 kg i big bagi.",
    gmo: "nie", dopuszczalneEko: false,
    zrodloSkladu: "producent",
    zrodlo: "https://www.adisseo.com/en/products/rhodimet/rhodimet-np99/",
    urlProducenta: "https://www.adisseo.com/en/products/rhodimet/rhodimet-np99/",
    zweryfikowano: D,
    uwagi: "Sprzedaż hurtowa przez Adifeed, dla wytwórni pasz; sklepu z ceną nie znaleźliśmy.",
    oferty: [],
  },

  // ── Spec-Drob, Olsztyn (karty produktów odczytane 24.10.2026 wprost ze sklepu) ──
  // Sklep stacjonarny i internetowy blisko Marka. Skład z karty sklepu, czyli z etykiety
  // przepisanej przez sprzedawcę; ceny brutto ze strony produktu.
  {
    nazwa: "Koncentrat 25% Nioska Pełna Awans (De Heus)", kategoria: "Koncentraty", uzupelnijZ: "Śruta sojowa",
    producent: "De Heus", gatunki: ["nioski"],
    bialko: 39.5, tluszcz: 3.4, wlokno: 3.8, popiol: 7.9, lys: 2.26, met: 1.0, ca: 0.6, p: 0.57, na: 0.6,
    dawkaProcOd: 25, dawkaProcDo: 25,
    dawkowanie: "25% koncentratu w mieszance dla kur niosek od 18. tygodnia, reszta to własne zboże",
    skladSurowcowy: "Śruta poekstrakcyjna sojowa, wywar gorzelniany zbożowy, kukurydza, pszenica, chlorek sodu, węglan wapnia, tłuszcz zwierzęcy, tłuszcze i oleje roślinne, otręby, dwuwęglan sodu, czerwone algi wapienne, fosforan jednowapniowy, gliceryna, glikol propylenowy. Z wyciągiem z oregano, cynamonu i papryczki chili.",
    gmo: "tak", dopuszczalneEko: false,
    zrodloSkladu: "etykieta",
    zrodlo: "https://specdrob.pl/pl/p/Koncentrat-25-dla-kur-niosek-25kg-AWANS-De-Heus/1400",
    zweryfikowano: D,
    uwagi: "Karta sklepu nie podaje energii ani aminokwasów poza lizyną i metioniną: przyjęte jak dla śruty sojowej, głównego składnika. Wapnia ma tylko 0,6%, więc do mieszanki z nim trzeba dodać kredę. Śruta sojowa bez oznaczenia „bez GMO” to w praktyce soja GM. Przykładowe receptury producent pokazuje na obrazku, którego tu nie przepisaliśmy. Karta w Paszowo.pl (25.10.2026) podaje białko 39,5%, lizynę 2,27% i metioninę 1,02% jak tutaj, ale włókno 6,8% i tłuszcz 6,7% (Spec-Drob: 3,8% i 3,4%): rozstrzyga etykieta na worku.",
    oferty: [
      { sklep: "Spec-Drob", url: "https://specdrob.pl/pl/p/Koncentrat-25-dla-kur-niosek-25kg-AWANS-De-Heus/1400", cenaZl: 107.0, opakowanieKg: 25, sprawdzono: D },
      { sklep: "Paszowo.pl", url: "https://paszowo.pl/koncentrat-dla-kur/25-nioska-awans-koncentrat-dla-kur-niosek-de-heus.html", cenaZl: 94.0, opakowanieKg: 25, sprawdzono: D25 },
    ],
  },
  {
    nazwa: "Koncentrat 5% Turbo dla niosek z barwnikiem (LNB)", kategoria: "Premiksy",
    producent: "LNB", gatunki: ["nioski"],
    popiol: 55.6, lys: 1.6, met: 2.45, thr: 0.6, ca: 17, p: 2.4, na: 3,
    witA: 200, witD3: 4, witE: 320, witB1: 20, witB2: 80, niacyna: 400, kwasPantotenowy: 174, kwasFoliowy: 30, witB12: 340, biotyna: 1,
    fe: 900, cu: 160, mn: 80, zn: 1200, i: 20, se: 5,
    dawkaProcOd: 5, dawkaProcDo: 5,
    dawkowanie: "5% koncentratu w mieszance dla niosek towarowych",
    stosowanie: "5% koncentratu + kukurydza 20% + pszenica 45–50% + śruta sojowa 18% (albo wysłodki kukurydziane) + olej roślinny 2% + kreda pastewna 8%",
    skladSurowcowy: "Węglan wapnia, śruta poekstrakcyjna sojowa, śruta poekstrakcyjna rzepakowa, fosforan jednowapniowy, otręby pszenne, chlorek sodu, wodorowęglan sodu. Z enzymami NSP, przeciwutleniaczami i barwnikiem.",
    gmo: "nieznane", dopuszczalneEko: false,
    zrodloSkladu: "etykieta",
    zrodlo: "https://specdrob.pl/pl/p/Koncentrat-5-Z-barwnikiem-dla-niosek-towarowych-LNB-/879",
    zweryfikowano: D,
    uwagi: "Producent nazywa go koncentratem, ale w dawce 5% i z takim składem działa jak premiks mineralno-witaminowy, więc stoi w premiksach. Witaminy i mikroelementy przepisane z karty sklepu, jednostki do sprawdzenia na worku (B12 i biotyna podane w mg, najpewniej to µg). Etykieta podaje też witaminę K 30 mg, pantotenian wapnia (tu jako kwas pantotenowy) i 4000 mg chlorku choliny.",
    oferty: [
      { sklep: "Spec-Drob", url: "https://specdrob.pl/pl/p/Koncentrat-5-Z-barwnikiem-dla-niosek-towarowych-LNB-/879", cenaZl: 186.0, opakowanieKg: 25, sprawdzono: D },
      { sklep: "Paszowo.pl", url: "https://paszowo.pl/koncentrat-dla-kur/turbo-5-koncentrat-dla-niosek-towarowych-lnb.html", cenaZl: 145.0, opakowanieKg: 25, sprawdzono: D25 },
    ],
  },
  {
    nazwa: "Kreda pastewna gruboziarnista 1–4 mm (bez marki)", kategoria: "Dodatki mineralne", odpowiednik: "Kreda pastewna",
    producent: "nie podano (sprzedawca: Spec-Drob, Olsztyn)", gatunki: [],
    ca: 36.9,
    dawkowanie: "Sprzedawca pisze: 10 g kredy na 120 g paszy. Grube ziarno nadaje się też do osobnego karmidła dla niosek.",
    skladSurowcowy: "Węglan wapnia co najmniej 91% z wapieni i margli jurajskich (Barcin, Piechcin, Pakość). Frakcja 1–4 mm.",
    gmo: "nie", dopuszczalneEko: true,
    zrodloSkladu: "etykieta",
    zrodlo: "https://specdrob.pl/pl/p/Kreda-Pastewna-30-kg-Gruboziarnista-1-4-mm-wapno-dla-kur/1431",
    zweryfikowano: D,
    uwagi: "Wapń co najmniej 36,9%. Grube ziarno dłużej zostaje w żołądku i oddaje wapń w nocy, gdy tworzy się skorupka. 24.10.2026 w sklepie „na wyczerpaniu”.",
    oferty: [
      { sklep: "Spec-Drob", url: "https://specdrob.pl/pl/p/Kreda-Pastewna-30-kg-Gruboziarnista-1-4-mm-wapno-dla-kur/1431", cenaZl: 30.0, opakowanieKg: 30, sprawdzono: D },
    ],
  },
  {
    nazwa: "Drożdże paszowe piwne (Trouw Nutrition)", kategoria: "Produkty uboczne, śruty i oleje", odpowiednik: "Drożdże piwne", uzupelnijZ: "Drożdże piwne",
    producent: "Trouw Nutrition", gatunki: [],
    bialko: 42, ca: 0.37, p: 0.75, na: 0.22, k: 1.05, mg: 0.45, s: 0.16,
    dawkaProcOd: 1, dawkaProcDo: 1,
    dawkowanie: "Drób: 10 g drożdży na 1 kg paszy (1%)",
    skladSurowcowy: "Drożdże spirytusowe, drożdże piwne inaktywowane. Witaminy z grupy B, cholina 3500 mg/kg.",
    gmo: "nie", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://specdrob.pl/pl/p/Drozdze-paszowe-piwne-dla-drobiu-i-zwierzat-5-kg-/1430",
    zweryfikowano: D,
    uwagi: "Energii i aminokwasów karta nie podaje: przyjęte jak dla „Drożdże piwne” z tabel. Dodaje się je zwykle profilaktycznie albo przy osłabieniu stada, nie jako stały składnik paszy.",
    oferty: [
      { sklep: "Spec-Drob", url: "https://specdrob.pl/pl/p/Drozdze-paszowe-piwne-dla-drobiu-i-zwierzat-5-kg-/1430", cenaZl: 73.89, opakowanieKg: 5, sprawdzono: D },
    ],
  },
  {
    nazwa: "Kamień do dziobania Peckit (Dolfos)", kategoria: KATEGORIA_OSOBNE_KARMIDLO,
    producent: "Dolfos", gatunki: ["nioski", "odchow"],
    bialko: 3, tluszcz: 0.3, popiol: 65, wlokno: 0.4, ca: 23, p: 1.1, na: 1.6, mg: 1.45,
    dawkowanie: "Do woli: wiaderko 4 kg postaw w kurniku albo na wybiegu, kury dziobią kamień same",
    skladSurowcowy: "Muszle ostryg, węglan wapnia, chlorek sodu, fosforan dwuwapniowy, tlenek magnezu, pszenica, melasa.",
    gmo: "nieznane", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://specdrob.pl/pl/p/Mineraly-przeciw-dziobaniu-DZIOBAK-Peckit-w-kamieniu-4kg/1356",
    urlProducenta: "https://www.dolfos.pl/",
    zweryfikowano: D,
    uwagi: "Mieszanka mineralna w formie kamienia do osobnego karmidła: daje wapń, fosfor i sól, a dziobanie zajmuje kury i ogranicza wydziobywanie piór. Nie zastępuje paszy i nie daje białka.",
    oferty: [
      { sklep: "Spec-Drob", url: "https://specdrob.pl/pl/p/Mineraly-przeciw-dziobaniu-DZIOBAK-Peckit-w-kamieniu-4kg/1356", cenaZl: 55.0, opakowanieKg: 4, sprawdzono: D },
    ],
  },

  // ── Ze zgłoszeń w kalkulatorze (stary formularz z liczbami, sprawdzone 25.10.2026) ──
  // Liczby zgłaszającego porównane z etykietą; tu tylko to, co stoi na etykiecie.
  {
    nazwa: "Dolmix DN RE (Dolfos)", kategoria: "Premiksy",
    producent: "Dolfos", gatunki: ["nioski"],
    ca: 26.5, p: 1.0, na: 5.2, mg: 1.0,
    witA: 400, witD3: 80, witE: 800, witB1: 45, witB2: 160, witB6: 100, witB12: 800, niacyna: 850,
    kwasPantotenowy: 450, kwasFoliowy: 35, biotyna: 2.0, cholina: 8.95,
    fe: 700, cu: 500, mn: 2400, zn: 1000, i: 40, se: 8,
    dawkaProcOd: 2.5, dawkaProcDo: 2.5, dawkaGDziennie: 2.5,
    dawkowanie: "Na 10 niosek 25 g dziennie do paszy; w żywieniu grupowym 2,5 kg na 100 kg paszy (2,5%). Nie podawać razem z wodą do pojenia z dodatkiem chlorku choliny.",
    skladSurowcowy: "Węglan wapnia (w tym z muszli ostryg), chlorek sodu, węglan wapniowo-magnezowy, drożdże suszone, fosforan monowapniowy.",
    gmo: "nie", dopuszczalneEko: true,
    zrodloSkladu: "etykieta",
    zrodlo: "https://hodowlany.pl/witaminy-dla-kur-bez-barwnika-dolmix-dn-re-25-kg.html",
    urlProducenta: "https://www.dolfos.pl/p/dolmix-dn-re/",
    zweryfikowano: ZGL,
    uwagi: "Ekologiczna wersja Dolmix DN, bez barwnika żółtek; producent ma ją w dziale „Mieszanki do eko-produkcji”, ale składu na stronie nie publikuje. Skład z etykiety przepisanej przez sklepy (te same liczby w trzech). Mangan 2400 mg/kg odczytany ze zdjęcia worka u producenta; sklepy piszą 400 mg, co wygląda na zgubioną cyfrę. Etykieta ma fosfor 1% w składnikach analitycznych i osobno „fosfor przyswajalny 90 g/kg” przy fitazie: to fosfor, który fitaza ma uwolnić ze zboża, a nie zawartość w worku, więc tu jest 1% (zgłoszenie miało 9%). Etykieta podaje też witaminę K3 80 mg/kg i chlorek choliny 12 000 mg/kg, tu przeliczony na cholinę (74,6%). Aminokwasy z informacji dodatkowych różnią się między wersjami etykiety, więc ich tu nie ma. Spec-Drob 25.10.2026: „na wyczerpaniu”.",
    oferty: [
      { sklep: "Pan Hodowca", url: "https://www.panhodowca.pl/witaminy-dla-kur-dolmix-dn-re-25-kg-bez-barwnikow-id-129", cenaZl: 138.9, opakowanieKg: 25, sprawdzono: ZGL },
      { sklep: "Farm Pet Garden", url: "https://farmpetgarden.pl/produkt/dolmix-dn-re-eko-dolfos-25/", cenaZl: 145.0, opakowanieKg: 25, sprawdzono: ZGL },
      { sklep: "Spec-Drob", url: "https://specdrob.pl/pl/p/Witaminy-dla-niosek-Dolmix-DN-RE-2%2C5-25-kg-dla-ekologii/811", cenaZl: 162.96, opakowanieKg: 25, sprawdzono: ZGL },
      { sklep: "Lagrico", url: "https://lagrico.pl/dolfos-dolmix-dn-re-2-5kg,id223.html", cenaZl: 15.0, opakowanieKg: 2.5, sprawdzono: ZGL, dostawaZl: 9.5 },
    ],
  },
  {
    nazwa: "Dolmix DB grower 2% (Dolfos)", kategoria: "Premiksy",
    producent: "Dolfos", gatunki: ["brojlery"],
    ca: 14.6, p: 10, mg: 2.5, na: 7.5,
    lys: 11.4, met: 11.5, metCys: 11.5, thr: 1.6, trp: 0.9, val: 1.2,
    witA: 500, witD3: 200, witE: 2750, witB1: 150, witB2: 400, witB6: 250, witB12: 1250, biotyna: 12.5,
    kwasFoliowy: 100, cholina: 10,
    fe: 4250, cu: 850, mn: 4000, zn: 5000, i: 60, se: 15,
    dawkaProcOd: 2, dawkaProcDo: 2,
    dawkowanie: "2 kg na 100 kg paszy (2%), do pasz pełnoporcjowych dla brojlerów kurzych w II okresie tuczu, do 35–42 dnia życia",
    skladSurowcowy: "Sklep nie przepisuje listy surowców. Część wapnia (4,8% z 14,6%) z muszli ostryg.",
    gmo: "nieznane", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://mojaferma.pl/pl/p/Dolmix-DB-grower-2-20kg/125",
    urlProducenta: "https://www.dolfos.pl/p/dolmix-db-grower-2/",
    zweryfikowano: ZGL,
    uwagi: "Producent potwierdza przeznaczenie, dawkę 2% i worek 20 kg, ale składu nie publikuje; skład z karty sklepu, zgodny z liczbami zgłaszającego. Karta podaje „DL-metionina+cysteina 10,5%” i „L-lizyna 9%”, mniej niż metionina 11,5% i lizyna 11,4%: to najpewniej ilości dodanych aminokwasów, więc metionina z cysteiną jest tu równa metioninie (dolna granica). B12 i biotyna podane w „µm”, przyjęte jako µg. Etykieta podaje też witaminę K3 150 mg/kg. W opisie sklepu stoi „konfekcja 25 kg”, w nazwie i u producenta 20 kg.",
    oferty: [
      { sklep: "MojaFerma.pl", url: "https://mojaferma.pl/pl/p/Dolmix-DB-grower-2-20kg/125", cenaZl: 244.5, opakowanieKg: 20, sprawdzono: ZGL, dostawaZl: 15 },
    ],
  },
  {
    nazwa: "Univit Kurka Nioska (Unipasz)", kategoria: "Premiksy",
    producent: "Unipasz, Siemiatycze", gatunki: ["nioski"],
    ca: 31, p: 1.0, na: 4.5,
    witA: 100, witE: 250,
    fe: 400, cu: 60, mn: 700, zn: 600, se: 1.5,
    dawkaProcOd: 2, dawkaProcDo: 4,
    dawkowanie: "2–4 kg na 100 kg mieszanki pełnoporcjowej dla niosek podwórkowych (2–4%)",
    skladSurowcowy: "Węglan wapnia, fosforan jednowapniowy, chlorek sodu. Z enzymami: 6-fitaza, ksylanaza, beta-glukanazy, alfa-amylaza, bacylolizyna.",
    gmo: "nieznane", dopuszczalneEko: null,
    zrodloSkladu: "etykieta",
    zrodlo: "https://www.zbozowysklep.pl/produkt/wtaminy-dla-kur-unipasz-univit-kurka-nioska-2-kg/",
    urlProducenta: "https://www.unipasz.pl/produkty/dodatki-paszowe/univity/",
    zweryfikowano: ZGL,
    uwagi: "Skład ze zdjęcia etykiety na stronie sklepu (partia z 14.03.2023), zgodny z liczbami zgłaszającego. Etykieta nie podaje witaminy D3, której nioska potrzebuje do skorupki: sprawdź, czy ma ją reszta paszy. Witamina E podana w j.m. (250 j.m.), tu jako mg (1 j.m. to ok. 1 mg octanu tokoferolu). Miedź 60 mg/kg z etykiety; sklepy w opisie piszą 80 mg. Producent ma też osobny produkt Univit Nioska, bez składu na stronie; zgłoszenie pod tą nazwą miało liczby Univit Kurka Nioska.",
    oferty: [
      { sklep: "Zbożowy sklep", url: "https://www.zbozowysklep.pl/produkt/wtaminy-dla-kur-unipasz-univit-kurka-nioska-2-kg/", cenaZl: 8.5, opakowanieKg: 2, sprawdzono: ZGL },
      { sklep: "Pan Hodowca", url: "https://www.panhodowca.pl/witaminy-dla-kur-niosek-univit-2-kg-unipasz-id-295", cenaZl: 9.85, opakowanieKg: 2, sprawdzono: ZGL },
    ],
  },
];

export const DODATKI_PASZOWE: DodatekPaszowy[] = WPISY.map(({ uzupelnijZ, ...w }) => {
  const wzor = uzupelnijZ ? feedIngredients.find((f) => f.nazwa === uzupelnijZ) : undefined;
  if (uzupelnijZ && !wzor) throw new Error(`dodatkiPaszowe: brak surowca wzorcowego „${uzupelnijZ}”`);
  const { nazwa: _n, kategoria: _k, ...skladWzoru } = wzor ?? { nazwa: "", kategoria: "", ...ZERA };
  return {
    ...ZERA,
    ...skladWzoru,
    dawkaProcOd: null, dawkaProcDo: null, dawkaGDziennie: null, stosowanie: null, skladSurowcowy: null,
    urlProducenta: null, partner: false,
    ...w,
    oferty: w.oferty.map((o) => ({ ...o, lokalizacja: lokalizacjaSklepu(o.sklep) })),
  };
});
const PO_NAZWIE = new Map(DODATKI_PASZOWE.map((d) => [d.nazwa, d]));

/** Produkt z migawki po dokładnej nazwie. */
export const dodatekPoNazwie = (nazwa: string): DodatekPaszowy | undefined => PO_NAZWIE.get(nazwa);
