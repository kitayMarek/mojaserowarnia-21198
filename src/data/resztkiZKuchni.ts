/**
 * Treść podstrony „Resztki z kuchni dla kur” (od 24.10.2026). Jedno źródło dla
 * strony React (src/pages/ResztkiZKuchni.tsx) i mirrora (scripts/gen-mirror-porady-pasz.mts).
 *
 * Kierunek od Marka: nie zakazywać, tylko budować świadomość. „Kto zabroni mi postawić
 * talerz po obiedzie dla moich kur do wylizania. Tylko musi być świadomość, jak ten mój
 * obiad może zadziałać na kury.” Mały hodowca pyta o wszystko, także o to, co widać w kupie.
 * Liczby o sodzie, białku i wapniu z src/data/skladnikiZKuchni.ts, czyli te same co w kalkulatorze.
 */

import { SKLADNIKI_Z_KUCHNI } from "./skladnikiZKuchni.ts";
import { NORMY_DROBIU } from "./normyDrobiu.ts";

export interface ZrodloResztek {
  opis: string;
  url: string;
}

export const ZRODLA_RESZTEK: Record<string, ZrodloResztek> = {
  ue1069: {
    opis: "Rozporządzenie (WE) nr 1069/2009, art. 3 pkt 6 i art. 11 ust. 1 lit. b",
    url: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32009R1069",
  },
  ue142: {
    opis: "Rozporządzenie (UE) nr 142/2011, załącznik I pkt 22 (definicja odpadów gastronomicznych)",
    url: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32011R0142",
  },
  pnw477: {
    opis: "How to feed your laying hens, PNW 477, Oregon State University Extension",
    url: "https://extension.oregonstate.edu/catalog/pnw-477-how-feed-your-laying-hens",
  },
  uf2026: {
    opis: "K. Waters, 10 Foods You Should Never Feed Chickens, UF/IFAS Extension Holmes County (2026)",
    url: "https://blogs.ifas.ufl.edu/holmesco/?p=28475",
  },
  merck: {
    opis: "C. Hayes, Avocado (Persea spp) Toxicosis in Animals, Merck Veterinary Manual",
    url: "https://www.merckvetmanual.com/toxicology/food-hazards/avocado-toxicosis-in-animals",
  },
  hendrix: {
    opis: "E. Leentfaar, Mitigating wet sticky droppings in alternative housing, Hendrix Genetics (2026)",
    url: "https://layinghens.hendrix-genetics.com/en/articles/mitigating-wet-sticky-droppings-in-alternative-housing/",
  },
  usda: {
    opis: "USDA FoodData Central, SR Legacy (skład makaronu, pieczywa, ryżu, ziemniaków)",
    url: "https://fdc.nal.usda.gov/",
  },
};

const zl = (n: number, miejsc = 1) => n.toLocaleString("pl-PL", { maximumFractionDigits: miejsc });
const produkt = (nazwa: string) => SKLADNIKI_Z_KUCHNI.find((s) => s.nazwa === nazwa)!;
const NIOSKA = NORMY_DROBIU["kury-nioski-lekkie"].find((n) => n.okres === "Niesienie (powyżej 45%)")!;

const CHLEB_P = produkt("Chleb pszenny");
const CHLEB_Z = produkt("Chleb żytni");
const MAKARON = produkt("Makaron gotowany (bez soli)");
const MAKARON_SOL = produkt("Makaron gotowany w osolonej wodzie");
const RYZ = produkt("Ryż gotowany (bez soli)");
const ZIEMNIAKI = produkt("Ziemniaki gotowane (bez soli)");

/** Liczby do tekstu i do tabeli „pasza a resztki”. */
export const RESZTKI_WOBEC_NORMY = {
  normaBialko: NIOSKA.bialko,
  normaCa: NIOSKA.ca,
  normaNa: NIOSKA.na ?? 0.16,
  produkty: [MAKARON, MAKARON_SOL, CHLEB_P, CHLEB_Z, RYZ, ZIEMNIAKI].map((p) => ({
    nazwa: p.nazwa, bialko: p.bialko, ca: p.ca, na: p.na, fdc: p.fdc,
  })),
};

export interface SekcjaResztek {
  id: string;
  tytul: string;
  akapity: string[];
  punkty?: string[];
  zrodla: string[];
}

export const SEKCJE_RESZTEK: SekcjaResztek[] = [
  {
    id: "przepisy",
    tytul: "Najpierw przepisy",
    akapity: [
      "Kura trzymana dla jajek to w prawie UE zwierzę gospodarskie. Takim zwierzętom nie wolno skarmiać odpadów gastronomicznych, a definicja tych odpadów obejmuje też kuchnię domową. Chodzi o choroby zwierząt, które mogą przenosić się z resztkami mięsa i nabiału (np. pryszczyca czy pomór świń).",
      "Nie ma jasnej odpowiedzi, czy zakaz obejmuje także same obierki i resztki roślinne. Jeśli chcesz mieć pewność, zapytaj powiatowego lekarza weterynarii. Niezależnie od przepisów warto wiedzieć, co z kuchni kurom szkodzi, i o tym jest reszta strony.",
    ],
    zrodla: ["ue1069", "ue142"],
  },
  {
    id: "ile",
    tytul: "Ile resztek",
    akapity: [
      "Resztki są dodatkiem, nie jedzeniem. Zasada z poradników uniwersyteckich: tyle, ile kury zjedzą w 15–20 minut, czyli około 10–15% tego, co jedzą w ciągu dnia. Podstawą zawsze jest pasza dla niosek. Kura, która naje się resztek, nie zje już paszy, a z nią białka i wapnia na jajka.",
    ],
    zrodla: ["pnw477"],
  },
  {
    id: "darmowe",
    tytul: "Darmowe nie znaczy dobre",
    akapity: [
      `Makaron ze zwrotów, chleb, ryż i ziemniaki to głównie skrobia i woda. Ugotowany makaron ma ${zl(MAKARON.bialko)}% białka, ryż ${zl(RYZ.bialko)}%, ziemniaki ${zl(ZIEMNIAKI.bialko)}%, a nioska potrzebuje ${zl(NIOSKA.bialko)}%. Wapnia jest w nich prawie wcale, setne części procenta, gdy nioska potrzebuje ${zl(NIOSKA.ca)}%. Kura się naje, ale jajka nie zrobi.`,
      "Dlatego to, że coś jest za darmo, nie znaczy, że kury mogą jeść tylko to. Suchy makaron czy czerstwy chleb można dawać jako dodatek, a nie zamiast paszy.",
    ],
    zrodla: ["usda"],
  },
  {
    id: "sol",
    tytul: "Sól: co dla nas smaczne, dla kury jest za słone",
    akapity: [
      `Chleb jest słony. Pszenny ma około ${zl(CHLEB_P.na, 2)}% sodu, żytni ${zl(CHLEB_Z.na, 2)}%, a w paszy dla niosek powinno być około ${zl(NIOSKA.na ?? 0.16, 2)}%. Makaron gotowany w osolonej wodzie ma ${zl(MAKARON_SOL.na, 2)}% sodu, bez soli prawie wcale. Zupy, wędliny, sery, chipsy i resztki fast foodów są jeszcze bardziej słone.`,
      "Kura nie odróżni słonego od zdrowego. Nadmiar soli to większe pragnienie i mokre odchody, a przy braku wody zatrucie. Jeśli lubisz słono, resztki z Twojego talerza są dla kur jeszcze słabszym pomysłem.",
    ],
    zrodla: ["usda", "uf2026"],
  },
  {
    id: "kupa",
    tytul: "Co widać w odchodach",
    akapity: [
      "Mokre, wodniste odchody najczęściej znaczą, że kury dużo piją. Pić każe im sól (sód) i potas, którego dużo jest w soi, a także dużo białka w paszy. Lepkie odchody dają pszenica i jęczmień w dużej ilości, bo ich włókno zwiększa lepkość treści jelit (pomaga enzym paszowy). Dużo warzyw i owoców to po prostu dużo wody.",
      "Jeśli odchody zmieniły się nagle, kura jest osowiała albo widzisz krew, to już nie sprawa paszy: idź do lekarza weterynarii.",
    ],
    zrodla: ["hendrix"],
  },
];

export type Werdykt = "tak" | "z umiarem" | "nie";

export interface CzyMozna {
  co: string;
  werdykt: Werdykt;
  dlaczego: string;
  zrodla: string[];
}

export const CZY_MOZNA: CzyMozna[] = [
  { co: "Chleb, bułki, czerstwe pieczywo", werdykt: "z umiarem", dlaczego: "Słone i prawie bez białka i wapnia. Nigdy spleśniałe.", zrodla: ["usda", "uf2026"] },
  { co: "Makaron, ryż, kasza (gotowane)", werdykt: "z umiarem", dlaczego: "Głównie skrobia. Lepiej gotowane bez soli.", zrodla: ["usda"] },
  { co: "Ziemniaki", werdykt: "z umiarem", dlaczego: "Gotowane tak. Zielone albo kiełkujące obierki nie: mają solaninę.", zrodla: ["uf2026"] },
  { co: "Warzywa i owoce", werdykt: "tak", dlaczego: "Jako dodatek. Bez pestek owoców pestkowych i ogryzków z nasionami: przy rozgryzieniu uwalniają cyjanki.", zrodla: ["uf2026"] },
  { co: "Fasola i groch z kuchni", werdykt: "z umiarem", dlaczego: "Tylko ugotowane. Surowa i sucha fasola ma fitohemaglutyninę, która truje.", zrodla: ["uf2026"] },
  { co: "Resztki mięsa, wędliny, nabiał z talerza", werdykt: "nie", dlaczego: "To przez nie powstał zakaz w przepisach (choroby). Do tego zwykle są słone.", zrodla: ["ue1069", "uf2026"] },
  { co: "Coś spleśniałego albo zepsutego", werdykt: "nie", dlaczego: "Pleśnie wytwarzają toksyny: kłopoty z oddychaniem, trawieniem, zatrucie.", zrodla: ["uf2026"] },
  { co: "Awokado", werdykt: "nie", dlaczego: "Persyna, najwięcej w skórce, pestce i liściach. Kury znoszą ją lepiej niż ptaki ozdobne, ale lepiej nie ryzykować.", zrodla: ["merck", "uf2026"] },
  { co: "Czekolada, słodycze, kawa, herbata", werdykt: "nie", dlaczego: "Teobromina i kofeina działają na serce i układ nerwowy.", zrodla: ["uf2026"] },
  { co: "Cebula i czosnek w dużej ilości", werdykt: "nie", dlaczego: "Mogą niszczyć czerwone krwinki i zmieniać smak jajek.", zrodla: ["uf2026"] },
  { co: "Alkohol, mocno sfermentowane resztki", werdykt: "nie", dlaczego: "Odwodnienie i zatrucie.", zrodla: ["uf2026"] },
];

export const PYTANIA_RESZTEK: { question: string; answer: string }[] = [
  {
    question: "Czy kury mogą jeść chleb?",
    answer: `Mogą, ale tylko jako dodatek i nigdy spleśniały. Chleb jest słony: ma około ${zl(CHLEB_P.na, 2)}–${zl(CHLEB_Z.na, 2)}% sodu, mniej więcej trzy razy więcej, niż powinno być w paszy (około ${zl(NIOSKA.na ?? 0.16, 2)}%), i prawie nie ma wapnia potrzebnego na skorupki.`,
  },
  {
    question: "Czy można dawać kurom makaron ze zwrotów?",
    answer: `Jako dodatek tak, jako główne jedzenie nie. Ugotowany makaron ma ${zl(MAKARON.bialko)}% białka przy potrzebnych ${zl(NIOSKA.bialko)}% i prawie wcale wapnia. Kury, które jedzą głównie makaron, przestają nieść.`,
  },
  {
    question: "Czy wolno dawać kurom resztki z obiadu?",
    answer: "Przepisy UE traktują kury od jajek jak zwierzęta gospodarskie i zakazują karmienia ich odpadami z kuchni, głównie z powodu chorób przenoszonych z mięsem i nabiałem. Czy dotyczy to samych obierek, warto zapytać powiatowego lekarza weterynarii. Jeśli już, to bez mięsa, bez soli i tyle, ile kury zjedzą w kwadrans.",
  },
  {
    question: "Dlaczego kury mają wodniste odchody?",
    answer: "Najczęściej dlatego, że dużo piją. Pragnienie wywołuje sól, potas (np. z soi) i dużo białka. Lepkie odchody dają duże ilości pszenicy i jęczmienia. Nagła zmiana z osowiałością to sprawa dla lekarza weterynarii.",
  },
];
