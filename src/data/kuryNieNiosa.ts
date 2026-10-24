/**
 * Treść podstrony „Kury nie niosą jajek” (od 24.10.2026): porady dla małych,
 * przydomowych i miejskich hodowców. Jedno źródło dla strony React
 * (src/pages/KuryNieNiosa.tsx) i mirrora dla botów (scripts/mirror-kury-nie-niosa.mts).
 *
 * Pytanie z grupy na Facebooku, które to otworzyło: „dlaczego daję kurom dobre
 * jedzenie (warzywa, zlewki z domu, makaron), a one nie niosą jajek”.
 * Liczby o pszenicy liczone z bazy kalkulatora, żeby strona i kalkulator mówiły to samo.
 *
 * Bez akapitu o przepisach o resztkach z kuchni: czeka na potwierdzenie w PIW/GIW
 * (rozp. 1069/2009 art. 11, definicja odpadów gastronomicznych obejmuje kuchnie domowe).
 */

import { feedIngredients } from "./feedIngredients.ts";
import { NORMY_DROBIU, dawkaTypowa } from "./normyDrobiu.ts";

export interface ZrodloPorady {
  opis: string;
  url: string;
}

export const ZRODLA_PORAD: Record<string, ZrodloPorady> = {
  pnw565: {
    opis: "J. Hermes, Why did my chickens stop laying?, PNW 565, Oregon State University Extension (2003, przegląd 2023)",
    url: "https://extension.oregonstate.edu/pub/pnw-565x",
  },
  pnw477: {
    opis: "How to feed your laying hens, PNW 477, Oregon State University Extension",
    url: "https://extension.oregonstate.edu/catalog/pnw-477-how-feed-your-laying-hens",
  },
  uga2005: {
    opis: "A. B. Webster, Several reasons why your hens may stop laying eggs, University of Georgia Cooperative Extension (2005)",
    url: "https://poultry.caes.uga.edu/content/dam/caes-subsite/poultry/documents/archived-poultry-tips/reasons-why-hens-may-stop-laying-sept-05.pdf",
  },
  unh: {
    opis: "Producing your own eggs, University of New Hampshire Extension",
    url: "https://extension.unh.edu/sites/default/files/migrated_unmanaged_files/Resource000472_Rep494.pdf",
  },
  hyline: {
    opis: "Hy-Line International, Technical Update „Gout” (wapń a nerki młodych kurek)",
    url: "https://www.hyline.com/Upload/Resources/TU%20GOUT%20ENG.pdf",
  },
};

const zl = (n: number, miejsc = 1) => n.toLocaleString("pl-PL", { maximumFractionDigits: miejsc });

// „Sama pszenica” wobec normy nioski w pełnej nieśności, z bazy kalkulatora.
const PSZENICA = feedIngredients.find((s) => s.nazwa === "Pszenica")!;
const NORMA_NIOSKI = NORMY_DROBIU["kury-nioski-lekkie"].find((n) => n.okres === "Niesienie (powyżej 45%)")!;
const DAWKA = dawkaTypowa("kury-nioski-lekkie", NORMA_NIOSKI.okres)!;
export const PSZENICA_WOBEC_NORMY = {
  bialko: PSZENICA.bialko,
  normaBialko: NORMA_NIOSKI.bialko,
  ca: PSZENICA.ca,
  normaCa: NORMA_NIOSKI.ca,
  procentWapnia: Math.round((PSZENICA.ca / NORMA_NIOSKI.ca) * 100),
  dawkaG: DAWKA.g,
  wapnZPszenicyG: (DAWKA.g * PSZENICA.ca) / 100,
  wapnPotrzebnyG: (DAWKA.g * NORMA_NIOSKI.ca) / 100,
};

export interface SekcjaPorady {
  id: string;
  tytul: string;
  akapity: string[];
  punkty?: string[];
  zrodla: string[];
}

const P = PSZENICA_WOBEC_NORMY;

export const SEKCJE_PORAD: SekcjaPorady[] = [
  {
    id: "jesien",
    tytul: "Jesień to pora przerwy",
    akapity: [
      "Kura niesie, gdy dzień ma ponad 12 godzin światła, a w pełni przy 14–16 godzinach. Od końca czerwca dni się skracają i jesienią większość kur przestaje nieść, a potem się pierzy: gubi stare pióra i odnawia jajowód. To normalne i trwa od kilku tygodni do kilku miesięcy. W Polsce pod koniec października dzień ma już tylko około 10 godzin.",
      "Jeśli kury przestały nieść we wrześniu albo październiku i gubią pióra, najpewniej nic złego się nie dzieje. Wrócą do nieśności, gdy dni się wydłużą.",
    ],
    zrodla: ["pnw565", "uga2005"],
  },
  {
    id: "bialko-wapn",
    tytul: "Jajko robi się z białka i wapnia",
    akapity: [
      "Kura nie potrzebuje „dobrego jedzenia” w ludzkim sensie. Potrzebuje paszy, która ma dość białka i wapnia, bo z nich powstaje jajko. Sama skorupka to około 2 g wapnia, a w całym szkielecie kury jest go około 20 g. Każde jajko to więc 10% jej zapasu. Gdy w paszy brakuje wapnia, zapas szybko się kończy i kura przestaje nieść.",
      "Pasza dla niosek ma 16–18% białka i 3–4% wapnia. Większość tego, co zostaje w kuchni, ma mniej białka i prawie wcale wapnia.",
    ],
    zrodla: ["uga2005", "unh", "pnw477"],
  },
  {
    id: "pszenica",
    tytul: "„Daję pszenicę, babcia też tak robiła”",
    akapity: [
      `Policzmy na danych naszego kalkulatora. Pszenica ma ${zl(P.bialko)}% białka, a nioska potrzebuje ${zl(P.normaBialko)}%. Wapnia pszenica ma ${zl(P.ca, 2)}%, a nioska potrzebuje ${zl(P.normaCa)}%. Kura na samej pszenicy dostaje więc około ${P.procentWapnia}% potrzebnego wapnia: z ${P.dawkaG} g pszenicy dziennie niecałe ${zl(P.wapnZPszenicyG, 2)} g wapnia zamiast około ${zl(P.wapnPotrzebnyG)} g.`,
      "Kury babci jadły dużo więcej niż pszenicę. Chodziły po podwórku z krowami i świniami, podjadały im paszę, a w pryzmie obornika całe lato wygrzebywały robaki i larwy, czyli właśnie białko. Do tego trawa, zielsko i rozsypane ziarno. Pół jadłospisu zdobywały same. W mieście ani na małej działce tego nie ma, więc wszystko, czego brakuje w pszenicy, musi dać pasza.",
    ],
    zrodla: [],
  },
  {
    id: "resztki",
    tytul: "Resztki, makaron, chleb i warzywa",
    akapity: [
      "Kury chętnie je zjadają, najadają się i potem nie mają już miejsca na paszę. Dostają kalorie, ale brakuje im białka i wapnia. Dodatki rozregulowują dawkę: im więcej resztek, tym mniej jajek.",
      "Zasada z poradników uniwersyteckich: dodatków tyle, ile kury zjedzą w 15–20 minut, czyli około 10–15% tego, co jedzą w ciągu dnia. Podstawą zawsze jest pasza dla niosek.",
    ],
    zrodla: ["pnw477", "pnw565"],
  },
  {
    id: "co-robic",
    tytul: "Co zrobić",
    akapity: [],
    punkty: [
      "Dawaj paszę pełnoporcjową dla niosek albo własną mieszankę policzoną w kalkulatorze pasz.",
      "Postaw osobno grys albo mielone muszle, kury biorą z nich wapń same, ile potrzebują.",
      "Pilnuj czystej wody codziennie: brak wody albo paszy to dla kury stres, po którym przestaje nieść.",
      "Resztki i ziarno tylko jako dodatek, na kilkanaście minut dziennie.",
      "Zimą możesz doświetlać kurnik do około 14 godzin, ale kury i tak powinny raz w roku się wypierzyć.",
      "Kurczętom i młodym kurkom nie dawaj paszy dla niosek: nadmiar wapnia niszczy im nerki.",
    ],
    zrodla: ["pnw565", "pnw477", "uga2005", "hyline"],
  },
  {
    id: "inne",
    tytul: "Inne przyczyny",
    akapity: [],
    punkty: [
      "Wiek: kury niosą dobrze do 2–3 lat, potem coraz mniej, a pierzenie trwa dłużej.",
      "Kwoczenie: kura siada na jajach i przestaje nieść. Zbieraj jaja codziennie.",
      "Stres: drapieżnik w nocy, przeprowadzka, nowe kury w stadzie, zbyt agresywny kogut.",
      "Choroby i pasożyty: jeśli kura jest osowiała, chudnie albo ma biegunkę, idź do lekarza weterynarii.",
    ],
    zrodla: ["uga2005", "pnw565"],
  },
];

export const PYTANIA_PORAD: { question: string; answer: string }[] = [
  {
    question: "Dlaczego kury nie niosą jesienią?",
    answer: "Bo dzień jest za krótki. Kura niesie przy ponad 12 godzinach światła, a w pełni przy 14–16. Jesienią większość kur robi przerwę i się pierzy, to normalne i mija, gdy dni się wydłużają. Źródło: Oregon State University Extension, PNW 565.",
  },
  {
    question: "Czy kurom wystarczy sama pszenica?",
    answer: `Nie. Pszenica ma ${zl(P.bialko)}% białka przy potrzebnych ${zl(P.normaBialko)}% i tylko ${zl(P.ca, 2)}% wapnia przy potrzebnych ${zl(P.normaCa)}%, czyli około ${P.procentWapnia}% wapnia, którego nioska potrzebuje na skorupki. Kury dawniej uzupełniały resztę same, grzebiąc przy oborze i w oborniku.`,
  },
  {
    question: "Ile resztek z kuchni mogą dostać kury?",
    answer: "Tyle, ile zjedzą w 15–20 minut, czyli około 10–15% dziennego jedzenia. Resztki, chleb i makaron najadają kurę, ale nie dają białka ani wapnia, więc przy większej ilości kury niosą mniej. Źródło: Oregon State University Extension, PNW 477 i PNW 565.",
  },
  {
    question: "Ile wapnia potrzebuje kura nioska?",
    answer: "Pasza dla niosek ma 3–4% wapnia. Skorupka jednego jajka to około 2 g wapnia, a cały szkielet kury ma go około 20 g, więc bez wapnia w paszy kura szybko przestaje nieść. Najlepiej dać paszę dla niosek i osobno grys albo muszle. Źródło: University of Georgia Extension.",
  },
];
