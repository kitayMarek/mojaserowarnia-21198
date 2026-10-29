/**
 * Mapa kultur dla przepisów: które kultury z bazy kupić do danego sera.
 * Czyta ją lista zakupów na stronie przepisu (ListaZakupowSera).
 *
 * PO CO RĘCZNA MAPA, A NIE DOPASOWANIE PO NAZWIE: część przepisów pochodzi
 * z cheesemaking.com (galony, łyżeczki) i podaje kultury amerykańskie
 * (MM 100, Flora Danica, Propionic Shermanii), których nie sprzedaje żaden
 * z naszych sklepów. Dopasowanie po nazwie myliło się też w drugą stronę:
 * „ST / ST-20” trafiało na IOTA ST NECTAIRE 1. Decyzja Marka z 29.10.2026:
 * zamiast kultury z USA wskazujemy zamiennik z polskich sklepów i piszemy,
 * co było w oryginale (pole wOryginale).
 *
 * POWÓD WYBORU każdej kultury jest jawny i strona go pokazuje:
 *   przepis  kultura wymieniona w przepisie;
 *   sklep    sklep sam pisze, że nadaje się do tego sera (pole application);
 *   sklad    zamiennik po składzie gatunkowym, z zastrzeżeniem z grupyKultur.ts.
 *
 * Nazwy kultur muszą być nazwami z bazy (culturesDataComplete.ts); szukamy
 * po adresKultury, więc jedna nazwa obejmuje tę samą kulturę w kilku sklepach.
 * Sól: zasada z przepisu przeliczona na gramy na kg sera, bez dopisywania.
 */

export type PowodWyboru = "przepis" | "sklep" | "sklad";

export interface RolaKultury {
  rola: string;
  wymagana: boolean;
  kultury: { nazwa: string; powod: PowodWyboru }[];
  /** Kultura z przepisu, której nie ma w polskich sklepach z naszej bazy. */
  wOryginale?: string;
  uwaga?: string;
}

export type ZasadaSoli =
  | { rodzaj: "na_sucho"; gNaKgSera: [number, number] }
  | { rodzaj: "solanka" }
  | { rodzaj: "do_smaku" };

export interface MapaPrzepisu {
  role: RolaKultury[];
  sol: ZasadaSoli;
  /** Przepis każe dodać CaCl2 do mleka pasteryzowanego. */
  chlorekWapnia: boolean;
  /** Ilość podpuszczki z przepisu zamiast z dawkowania sklepu (np. kilka kropli do twarogu). */
  podpuszczkaZPrzepisu?: { od: number; do: number; jednostka: "krople"; naLitrow: number };
  /** Rzeczy spoza naszych baz, o których lista powinna przypomnieć. */
  inneZakupy?: string[];
}

const k = (powod: PowodWyboru, ...nazwy: string[]) => nazwy.map((nazwa) => ({ nazwa, powod }));

const PLESN_BIALA: RolaKultury = {
  rola: "Pleśń biała (Penicillium candidum)",
  wymagana: true,
  kultury: [...k("przepis", "Penicillium candidum"), ...k("sklep", "PC", "Penicillium Candidum PC 22", "SIGMA 75")],
};

const PLESN_NIEBIESKA: RolaKultury = {
  rola: "Pleśń niebieska (Penicillium roqueforti)",
  wymagana: true,
  kultury: [...k("przepis", "Penicillium roqueforti"), ...k("sklep", "RQ", "Penicillium roqueforti PV", "SIGMA 15")],
};

const HELVETICUS: RolaKultury = {
  rola: "Lactobacillus helveticus",
  wymagana: true,
  kultury: k("przepis", "Choozit LH 100"),
};

const MEZOFILNA_Z_PRZEPISU: RolaKultury = {
  rola: "Kultura mezofilna",
  wymagana: true,
  kultury: k("przepis", "Choozit MA 4001", "MSE", "ML", "ALPHA 10"),
};

export const kulturyPrzepisow: Record<string, MapaPrzepisu> = {
  korycinski: {
    role: [{
      rola: "Kultura mezofilna", wymagana: true,
      kultury: [...k("przepis", "Choozit MA 4001"), ...k("sklep", "MSE", "MSO-11", "MYE")],
    }],
    sol: { rodzaj: "solanka" }, chlorekWapnia: true,
  },
  asiago: {
    role: [{ rola: "Kultura termofilna", wymagana: true, kultury: k("przepis", "Choozit TA 61") }, HELVETICUS],
    sol: { rodzaj: "solanka" }, chlorekWapnia: true,
  },
  caciotta: {
    role: [{
      rola: "Kultura termofilna", wymagana: true,
      kultury: [...k("przepis", "Choozit TA 61"), ...k("sklep", "microMilk TB/B (Caciotta)", "M", "SLBH", "microMilk T (Mozzarella)")],
    }],
    sol: { rodzaj: "solanka" }, chlorekWapnia: true,
  },
  dunlop: {
    role: [MEZOFILNA_Z_PRZEPISU],
    sol: { rodzaj: "na_sucho", gNaKgSera: [20, 20] }, chlorekWapnia: true,
  },
  feta_bulgarische: {
    role: [{ ...MEZOFILNA_Z_PRZEPISU, kultury: k("przepis", "Choozit MA 4001", "MSE", "ML", "ALPHA 10", "MFC") }],
    sol: { rodzaj: "na_sucho", gNaKgSera: [50, 50] }, chlorekWapnia: true,
    inneZakupy: ["Jogurt bułgarski, ok. 100 g na 3,8 l mleka: kupisz w sklepie spożywczym."],
  },
  yorkshire: {
    role: [MEZOFILNA_Z_PRZEPISU],
    sol: { rodzaj: "na_sucho", gNaKgSera: [15, 15] }, chlorekWapnia: true,
  },
  gouda: {
    role: [{
      rola: "Kultura mezofilna LD (z oczkami)", wymagana: true, wOryginale: "Flora Danica albo MM 100",
      kultury: k("sklep", "MSE-910", "ME", "Kultury bakterii do sera gouda", "Probat 222"),
    }],
    sol: { rodzaj: "solanka" }, chlorekWapnia: true,
  },
  cheddar: {
    role: [{
      rola: "Kultura mezofilna", wymagana: true, wOryginale: "MA 011 albo R-704",
      kultury: k("sklep", "Choozit MA 14", "MSE", "ML-O", "MLL"),
    }],
    sol: { rodzaj: "na_sucho", gNaKgSera: [20, 20] }, chlorekWapnia: true,
  },
  mozzarella: {
    role: [{
      rola: "Kultura termofilna", wymagana: false,
      uwaga: "Przepis daje dwie drogi: kwas cytrynowy albo kultura termofilna.",
      kultury: [...k("przepis", "Choozit TA 61"), ...k("sklep", "microMilk T (Mozzarella)", "DELTA 1", "CLC", "M")],
    }],
    sol: { rodzaj: "do_smaku" }, chlorekWapnia: true,
    inneZakupy: ["Kwas cytrynowy, ok. 7 g na 4 l mleka: kupisz w sklepie spożywczym."],
  },
  camembert: {
    role: [
      {
        rola: "Kultura mezofilna", wymagana: true, wOryginale: "MM 100",
        kultury: k("sklep", "IOTA Ca/1", "IOTA Ca/2", "Camembert Mix", "MST"),
      },
      PLESN_BIALA,
    ],
    sol: { rodzaj: "na_sucho", gNaKgSera: [14, 14] }, chlorekWapnia: false,
  },
  halloumi: {
    role: [],
    sol: { rodzaj: "solanka" }, chlorekWapnia: false,
    inneZakupy: ["Mięta suszona i lipaza (opcjonalnie): nie ma ich w naszej bazie."],
  },
  brie: {
    role: [
      {
        rola: "Kultura mezofilna", wymagana: true, wOryginale: "MM 100 albo Flora Danica",
        kultury: k("sklep", "Camembert Mix", "MST", "MLE"),
      },
      PLESN_BIALA,
      {
        rola: "Geotrichum candidum", wymagana: false,
        kultury: [...k("przepis", "GEO", "Geotrichum Candidum"), ...k("sklep", "Choozit GEO 17")],
      },
    ],
    sol: { rodzaj: "na_sucho", gNaKgSera: [30, 30] }, chlorekWapnia: true,
  },
  parmezan: {
    role: [
      {
        rola: "Kultura termofilna", wymagana: true,
        kultury: [...k("przepis", "Choozit TA 61"), ...k("sklep", "PG", "BTH", "microMilk LHTB")],
      },
      HELVETICUS,
    ],
    sol: { rodzaj: "solanka" }, chlorekWapnia: false,
  },
  "feta-grecka": {
    role: [{
      rola: "Kultura mezofilna", wymagana: true, wOryginale: "MM 100 albo Flora Danica",
      kultury: k("sklep", "IOTA FETA", "microMilk MO (Feta)", "MFC", "Kultury bakterii do sera greckiego"),
    }],
    sol: { rodzaj: "solanka" }, chlorekWapnia: false,
    inneZakupy: ["Lipaza (opcjonalnie): nie ma jej w naszej bazie."],
  },
  gorgonzola: {
    role: [
      {
        rola: "Kultura mezofilna", wymagana: true, wOryginale: "MM 100",
        kultury: k("sklep", "ALPHA BLEU", "microMilk TME", "Camembert Mix", "MST"),
      },
      PLESN_NIEBIESKA,
    ],
    sol: { rodzaj: "na_sucho", gNaKgSera: [20, 30] }, chlorekWapnia: true,
  },
  roquefort: {
    role: [
      {
        rola: "Kultura mezofilna", wymagana: true, wOryginale: "MM 100",
        kultury: k("sklep", "ALPHA BLEU", "microMilk TME", "Camembert Mix", "MST"),
      },
      PLESN_NIEBIESKA,
    ],
    sol: { rodzaj: "na_sucho", gNaKgSera: [30, 30] }, chlorekWapnia: false,
  },
  stilton: {
    role: [
      {
        rola: "Kultura mezofilna", wymagana: true, wOryginale: "MM 100",
        kultury: k("sklep", "ALPHA BLEU", "microMilk TME", "Camembert Mix"),
      },
      PLESN_NIEBIESKA,
    ],
    sol: { rodzaj: "na_sucho", gNaKgSera: [20, 25] }, chlorekWapnia: true,
  },
  gruyere: {
    role: [
      {
        rola: "Kultura termofilna", wymagana: true,
        kultury: [...k("przepis", "Choozit TA 61"), ...k("sklep", "KAPPA 1", "EM", "microMilk LHTBM")],
      },
      HELVETICUS,
      {
        rola: "Bakterie propionowe (oczka)", wymagana: false, wOryginale: "Propionic Shermanii",
        kultury: [...k("sklep", "PP", "IOTA 2"), ...k("sklad", "Propionibacterium", "Propionibakterium PX")],
      },
    ],
    sol: { rodzaj: "solanka" }, chlorekWapnia: true,
  },
  emmental: {
    role: [
      {
        rola: "Kultura termofilna", wymagana: true,
        kultury: [...k("przepis", "Choozit TA 61"), ...k("sklep", "EM", "BTMH", "microMilk LHTBM")],
      },
      HELVETICUS,
      {
        rola: "Bakterie propionowe (oczka)", wymagana: true, wOryginale: "Propionic Shermanii",
        kultury: k("sklep", "PP", "Propionibakterium PX", "Propionibacterium", "IOTA 1"),
      },
    ],
    sol: { rodzaj: "solanka" }, chlorekWapnia: true,
  },
  quartirolo: {
    role: [{
      rola: "Kultura startowa", wymagana: true,
      uwaga: "Przepis dopuszcza kulturę termofilną albo mezofilną.",
      kultury: [...k("przepis", "Choozit TA 61"), ...k("sklep", "MO"), ...k("przepis", "ALPHA 10")],
    }],
    sol: { rodzaj: "na_sucho", gNaKgSera: [15, 15] }, chlorekWapnia: true,
  },
  limburski: {
    role: [
      { rola: "Kultura mezofilna", wymagana: true, kultury: k("przepis", "Choozit MA 4001") },
      {
        rola: "Bakterie mazi (Brevibacterium linens)", wymagana: true,
        kultury: [...k("przepis", "Brevibacterium linens", "Choozit SR3"), ...k("sklep", "Choozit ARN", "Choozit FR 13")],
      },
      {
        rola: "Geotrichum candidum", wymagana: false,
        kultury: k("przepis", "GEO", "Geotrichum Candidum"),
      },
    ],
    sol: { rodzaj: "na_sucho", gNaKgSera: [20, 20] }, chlorekWapnia: true,
  },
  twarog: {
    role: [{
      rola: "Kultura mezofilna LD", wymagana: true, wOryginale: "Flora Danica, CHN-19 albo MM 100",
      uwaga: "Przepis dopuszcza też domowy zakwas: maślankę albo kefir.",
      kultury: k("sklep", "Kultury bakterii do twarogu", "MSO", "MYE", "ALPHA 3", "microMilk ME"),
    }],
    sol: { rodzaj: "na_sucho", gNaKgSera: [5, 8] }, chlorekWapnia: true,
    podpuszczkaZPrzepisu: { od: 2, do: 3, jednostka: "krople", naLitrow: 8 },
  },
};
