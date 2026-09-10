/**
 * Symulator warzenia sera: z parametrów procesu wylicza, co z tego wyjdzie.
 *
 * DLACZEGO NIE SAMA ODLEGŁOŚĆ EUKLIDESOWA
 * Pierwotny projekt liczył trzy osie (wilgotność, twardość, intensywność)
 * i wybierał najbliższy archetyp. To nie działa, bo twardość jest w tych
 * wzorach lustrem wilgotności, więc „trzy osie" są w istocie dwiema, a sery
 * zlewają się w jeden punkt. Gouda młoda (45/55/35), Tomme (40/60/55)
 * i Ementaler (40/65/50) leżą w granicach szumu, a różni je coś zupełnie
 * innego: wosk kontra skórka naturalna kontra kultura propionowa.
 *
 * Dlatego najpierw BRAMKI (kategoria kultury, podpuszczka, środowisko
 * dojrzewania), a odległość dopiero jako rozstrzygnięcie WEWNĄTRZ rodziny.
 *
 * RICOTTA NIE JEST OSIĄGALNA Z FORMULARZA i to nie jest przeoczenie.
 * Ricotta powstaje z serwatki po serze podpuszczkowym, czyli jest produktem
 * drugiego obiegu. Co więcej: tylko podpuszczka zostawia w serwatce albuminy,
 * bo tnie kazeinę i nie rusza białek serwatkowych. Kwas z wysoką temperaturą
 * strąca jedno i drugie naraz, więc po twarogu czy paneerze serwatka jest
 * wyczerpana i ricotty z niej nie będzie. To jest najlepszy „błąd produkcji",
 * jaki ten symulator ma do zaoferowania, bo prawdziwy i nieoczywisty.
 */

import type { KategoriaKultury } from "./kategorieKultur";

export type Mleko = "krowie" | "kozie" | "owcze";
export type Podpuszczka = "brak" | "malo" | "standard" | "duzo";
export type Krojenie = "grube" | "drobne";
export type Dogrzewanie = "brak" | "niskie" | "wysokie";
export type Prasowanie = "brak" | "lekkie" | "mocne";
export type Solenie = "brak" | "sucho" | "solanka";
export type Srodowisko = "proznia" | "piwnica" | "wosk" | "mycie";

export interface Parametry {
  mleko: Mleko;
  kultura: KategoriaKultury;
  temperatura: number;      // °C koagulacji
  podpuszczka: Podpuszczka;
  krojenie: Krojenie;
  dogrzewanie: Dogrzewanie;
  prasowanie: Prasowanie;
  solenie: Solenie;
  dojrzewanieDni: number;
  srodowisko: Srodowisko;
}

export interface Archetyp {
  id: string;
  nazwa: string;
  opis: string;
  /** Kategorie kultur, przy których ten ser w ogóle może powstać. */
  kultury: KategoriaKultury[];
  /** Czy wymaga podpuszczki. */
  podpuszczka: "wymagana" | "zakazana" | "obojetna";
  /** Dopuszczalne środowiska dojrzewania. Brak pola = dowolne. */
  srodowiska?: Srodowisko[];
  /** Dopuszczalne prasowanie. Brak pola = dowolne. */
  prasowania?: Prasowanie[];
  /** Dopuszczalne dogrzewanie skrzepu. Brak pola = dowolne. */
  dogrzewania?: Dogrzewanie[];
  /** Zakres dojrzewania w dniach. */
  dni: [number, number];
  /** Cele osi, wyłącznie do rozstrzygania wewnątrz rodziny. */
  cele: { wilgotnosc: number; twardosc: number; intensywnosc: number };
}

export const ARCHETYPY: Archetyp[] = [
  { id: "twarog", nazwa: "Twaróg / ser świeży", kultury: ["kwaszaca", "mezofilna"],
    podpuszczka: "zakazana", dni: [0, 3], cele: { wilgotnosc: 85, twardosc: 5, intensywnosc: 10 },
    opis: "Skrzep kwasowy, bez podpuszczki. Krótkie odciekanie, brak dojrzewania." },
  { id: "chevre", nazwa: "Chèvre (kozi miękki)", kultury: ["kwaszaca", "mezofilna"],
    podpuszczka: "obojetna", dni: [0, 21], cele: { wilgotnosc: 75, twardosc: 15, intensywnosc: 30 },
    opis: "Kozie mleko, długa koagulacja w niskiej temperaturze, minimum podpuszczki." },
  { id: "mozzarella", nazwa: "Mozzarella (pasta filata)", kultury: ["termofilna", "kwaszaca"],
    podpuszczka: "wymagana", dni: [0, 2], cele: { wilgotnosc: 60, twardosc: 30, intensywnosc: 15 },
    opis: "Skrzep parzony i rozciągany. Zjada się świeżą, dojrzewania nie ma." },
  { id: "feta", nazwa: "Feta", kultury: ["mezofilna", "mieszana", "termofilna"],
    podpuszczka: "wymagana", srodowiska: ["proznia"], dni: [14, 60],
    cele: { wilgotnosc: 55, twardosc: 40, intensywnosc: 45 },
    opis: "Dojrzewa w solance, stąd słony i kruchy." },
  { id: "camembert", nazwa: "Camembert / Brie", kultury: ["plesniowa-biala"],
    podpuszczka: "wymagana", dni: [14, 60], cele: { wilgotnosc: 55, twardosc: 25, intensywnosc: 55 },
    opis: "Biała pleśń rozkłada ser od zewnątrz do środka." },
  { id: "niebieski", nazwa: "Ser pleśniowy niebieski", kultury: ["plesniowa-niebieska"],
    podpuszczka: "wymagana", dni: [45, 200], cele: { wilgotnosc: 50, twardosc: 35, intensywnosc: 85 },
    opis: "Pleśń rośnie w środku, w kanałach po przekłuciu." },
  { id: "gouda-mloda", nazwa: "Gouda młoda", kultury: ["mezofilna", "mieszana", "termofilna"],
    podpuszczka: "wymagana", srodowiska: ["wosk"], dni: [21, 90],
    cele: { wilgotnosc: 45, twardosc: 55, intensywnosc: 35 },
    opis: "Prasowana, pod woskiem, łagodna." },
  { id: "gouda-dojrzala", nazwa: "Gouda dojrzała", kultury: ["mezofilna", "mieszana", "termofilna"],
    podpuszczka: "wymagana", srodowiska: ["wosk"], dni: [180, 400],
    cele: { wilgotnosc: 30, twardosc: 70, intensywnosc: 65 },
    opis: "Ta sama droga co młoda, tylko dłużej. Kryształki tyrozyny." },
  { id: "cheddar", nazwa: "Cheddar", kultury: ["mezofilna", "mieszana"],
    podpuszczka: "wymagana", srodowiska: ["proznia"], prasowania: ["mocne"], dni: [90, 300],
    cele: { wilgotnosc: 35, twardosc: 75, intensywnosc: 60 },
    opis: "Mocno prasowany, zwarty, bez wyraźnej skórki." },
  { id: "ementaler", nazwa: "Ementaler (z oczkami)", kultury: ["propionowa"],
    podpuszczka: "wymagana", dni: [60, 200], cele: { wilgotnosc: 40, twardosc: 65, intensywnosc: 50 },
    opis: "Bakterie propionowe wytwarzają dwutlenek węgla, stąd oczka." },
  { id: "tomme", nazwa: "Ser typu Tomme", kultury: ["mezofilna", "mieszana"],
    podpuszczka: "wymagana", srodowiska: ["piwnica"], prasowania: ["lekkie", "mocne"], dni: [60, 150],
    cele: { wilgotnosc: 40, twardosc: 60, intensywnosc: 55 },
    opis: "Skórka naturalna, porastająca w piwnicy." },
  { id: "munster", nazwa: "Ser myty (Munster)", kultury: ["mycia-skorki"],
    podpuszczka: "wymagana", srodowiska: ["mycie"], dni: [21, 90],
    cele: { wilgotnosc: 55, twardosc: 45, intensywnosc: 90 },
    opis: "Skórka myta solanką, pomarańczowa i lepka. Zapach mocniejszy niż smak." },
  { id: "parmezan", nazwa: "Ser typu parmezan", kultury: ["termofilna", "mieszana"],
    podpuszczka: "wymagana", srodowiska: ["piwnica", "proznia"],
    prasowania: ["mocne"], dogrzewania: ["wysokie"], dni: [300, 800],
    cele: { wilgotnosc: 15, twardosc: 95, intensywnosc: 80 },
    opis: "Wysokie dogrzewanie, mocne prasowanie, bardzo długie dojrzewanie." },
];

/** Ricotta: osobno, bo powstaje z serwatki, a nie z mleka. */
export const RICOTTA = {
  id: "ricotta",
  nazwa: "Ricotta",
  opis: "Z serwatki, przez ponowne zagotowanie. Nie z mleka i nie z formularza.",
};

// ── OSIE ────────────────────────────────────────────────────────────────────
// Wagi wykalibrowane tak, zeby znane sery trafialy w swoje cele: mloda gouda
// okolo 45, twarog okolo 83, parmezan ponizej 30. Pierwsze wartosci byly za
// mocne i prasowany ser wychodzil suchszy od parmezanu.
const WAGI = {
  dogrzewanie: { brak: 0, niskie: 7, wysokie: 15 },
  prasowanie: { brak: 0, lekkie: 9, mocne: 18 },
  krojenie: { grube: 0, drobne: 5 },
  podpuszczka: { brak: 0, malo: 2, standard: 5, duzo: 8 },
  mleko: { krowie: 0, kozie: 8, owcze: 14 },
  kultura: {
    kwaszaca: 5, mezofilna: 10, termofilna: 12, mieszana: 11,
    "plesniowa-biala": 30, "plesniowa-niebieska": 55, propionowa: 25,
    "mycia-skorki": 60, dodatek: 0,
  } as Record<KategoriaKultury, number>,
};

export interface Osie { wilgotnosc: number; twardosc: number; intensywnosc: number }

/**
 * Wilgotność, z jaką ser WCHODZI do dojrzewania, czyli zaraz po prasowaniu.
 * Osobno od wilgotności końcowej, bo o zepsuciu decyduje stan wyjściowy:
 * mokry bochenek spleśnieje, zanim zdąży wyschnąć. Liczenie tego po
 * dojrzewaniu było błędem — im dłużej ser leżał, tym „suchszy" wychodził
 * z rachunku, więc reguła o zepsuciu nie mogła zadziałać ani razu.
 */
export function wilgotnoscStartowa(p: Parametry): number {
  return Math.max(5, Math.min(95,
    88 - WAGI.dogrzewanie[p.dogrzewanie] - WAGI.prasowanie[p.prasowanie]
       - WAGI.krojenie[p.krojenie] - WAGI.podpuszczka[p.podpuszczka]));
}

export function policzOsie(p: Parametry): Osie {
  const dojrzewanie = Math.min(40, Math.sqrt(p.dojrzewanieDni) * 2.2);
  const wilgotnosc = Math.max(5, Math.min(95, wilgotnoscStartowa(p) - dojrzewanie * 0.5));
  const twardosc = Math.max(0, Math.min(100, 100 - wilgotnosc + dojrzewanie * 0.4));
  const intensywnosc = Math.max(0, Math.min(100,
    dojrzewanie * 1.4 + WAGI.kultura[p.kultura] + WAGI.mleko[p.mleko]
      + (p.srodowisko === "mycie" ? 15 : 0)));
  return { wilgotnosc, twardosc, intensywnosc };
}

// ── BŁĘDY PRODUKCJI ─────────────────────────────────────────────────────────
export interface Blad { tytul: string; dlaczego: string }

export function sprawdzBledy(p: Parametry): Blad | null {
  if (p.podpuszczka === "brak" && p.kultura === "dodatek") {
    return { tytul: "Nic się nie zetnie",
      dlaczego: "Bez podpuszczki skrzep może powstać tylko z zakwaszenia, a kultura ochronna ani zestaw aromatyzujący mleka nie zakwaszą. Zostaje ciepłe mleko." };
  }
  if (p.podpuszczka === "brak" && p.temperatura > 40 && p.kultura !== "kwaszaca") {
    return { tytul: "Za gorąco dla samego zakwaszenia",
      dlaczego: "Powyżej 40°C bakterie mezofilne przestają pracować, a podpuszczki nie ma. Do skrzepu kwasowego w tej temperaturze potrzeba kultury termofilnej albo dodanego kwasu." };
  }
  if (p.kultura === "plesniowa-niebieska" && p.dojrzewanieDni < 30) {
    return { tytul: "Pleśń nie zdąży",
      dlaczego: "Niebieska pleśń potrzebuje kilku tygodni, żeby przerosnąć bochenek. Po dwóch dostajesz zwykły ser z zielonym nalotem na skórce." };
  }
  if (p.srodowisko === "mycie" && p.kultura !== "mycia-skorki") {
    return { tytul: "Mycie skórki bez kultury do mycia",
      dlaczego: "Sama solanka nic nie wyhoduje. Pomarańczową, lepką skórkę robi Brevibacterium linens i bez niego myjesz ser na darmo." };
  }
  if (p.kultura === "plesniowa-biala" && p.prasowanie === "mocne") {
    return { tytul: "Sprzeczne prowadzenie",
      dlaczego: "Biała pleśń rozkłada ser od zewnątrz i potrzebuje wilgotnego, luźnego ciasta. Mocno sprasowany bochenek jej na to nie pozwoli." };
  }
  const start = wilgotnoscStartowa(p);
  if (start > 70 && p.dojrzewanieDni > 90 && p.srodowisko !== "proznia") {
    return { tytul: "Zepsuje się, zanim dojrzeje",
      dlaczego: `Do piwnicy wchodzi ser o wilgotności rzędu ${Math.round(start)} i ma tam leżeć ${Math.round(p.dojrzewanieDni / 30)} miesięcy. Wygra pleśń, której nie zapraszałeś. Odciśnij mocniej, potnij drobniej albo skróć dojrzewanie.` };
  }
  return null;
}

// ── SERWATKA I RICOTTA ──────────────────────────────────────────────────────
export type StanSerwatki = "slodka" | "wyczerpana";

export function stanSerwatki(p: Parametry): StanSerwatki {
  // Podpuszczka tnie kazeinę i zostawia albuminy w serwatce. Kwas z wysoką
  // temperaturą strąca jedno i drugie naraz, więc nie zostaje nic do ricotty.
  return p.podpuszczka === "brak" ? "wyczerpana" : "slodka";
}

export const OPIS_SERWATKI: Record<StanSerwatki, string> = {
  slodka: "Serwatka słodka. Podpuszczka strąciła samą kazeinę, a białka serwatkowe zostały w płynie. Da się z niej ugotować ricottę.",
  wyczerpana: "Serwatka wyczerpana. Kwas i temperatura strąciły kazeinę razem z albuminami, więc wszystko, co się dało ściąć, jest już w serze. Ricotty z tego nie będzie.",
};

// ── DOPASOWANIE ─────────────────────────────────────────────────────────────
export interface Wynik {
  blad: Blad | null;
  archetyp: Archetyp | null;
  /** Inne sery z tej samej rodziny, po odległości. */
  bliskie: Archetyp[];
  osie: Osie;
  serwatka: StanSerwatki;
}

function przechodziBramki(a: Archetyp, p: Parametry): boolean {
  if (!a.kultury.includes(p.kultura)) return false;
  if (a.podpuszczka === "wymagana" && p.podpuszczka === "brak") return false;
  if (a.podpuszczka === "zakazana" && p.podpuszczka !== "brak") return false;
  if (a.srodowiska && !a.srodowiska.includes(p.srodowisko)) return false;
  if (a.prasowania && !a.prasowania.includes(p.prasowanie)) return false;
  if (a.dogrzewania && !a.dogrzewania.includes(p.dogrzewanie)) return false;
  // Dojrzewanie z zapasem: granice archetypów są umowne, nie ostre.
  const [od, doo] = a.dni;
  return p.dojrzewanieDni >= od * 0.6 && p.dojrzewanieDni <= doo * 1.6;
}

export function zasymuluj(p: Parametry): Wynik {
  const osie = policzOsie(p);
  const serwatka = stanSerwatki(p);
  const blad = sprawdzBledy(p);
  if (blad) return { blad, archetyp: null, bliskie: [], osie, serwatka };

  const rodzina = ARCHETYPY.filter((a) => przechodziBramki(a, p));
  if (rodzina.length === 0) {
    return {
      blad: { tytul: "Coś, czego nie mamy w tabeli",
        dlaczego: "Ta kombinacja nie pasuje do żadnego z czternastu archetypów. Ser pewnie wyjdzie, tylko my nie umiemy go nazwać. Zmień jeden parametr, żeby zobaczyć, gdzie wylądujesz." },
      archetyp: null, bliskie: [], osie, serwatka,
    };
  }

  const odleglosc = (a: Archetyp) =>
    Math.hypot(a.cele.wilgotnosc - osie.wilgotnosc,
               a.cele.twardosc - osie.twardosc,
               a.cele.intensywnosc - osie.intensywnosc);

  const wg = [...rodzina].sort((x, y) => odleglosc(x) - odleglosc(y));
  return { blad: null, archetyp: wg[0], bliskie: wg.slice(1, 3), osie, serwatka };
}
