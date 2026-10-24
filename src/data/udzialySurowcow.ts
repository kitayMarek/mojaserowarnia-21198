/**
 * Zalecane udziały surowców w paszy dla drobiu (od 24.10.2026): ile najwyżej
 * danego surowca może być w mieszance i dlaczego. Jedno źródło dla podstrony
 * /pasze/udzial-surowcow, kalkulatora (src/lib/bilansPaszy.ts) i serwera MCP.
 *
 * SKĄD LICZBY: wyłącznie z otwartych źródeł z listy ZRODLA_UDZIALOW, każda
 * pozycja ma swoje. Tam, gdzie źródła się rozjeżdżają albo liczba pochodzi
 * z drugiej ręki, pole `doPotwierdzenia` mówi, co sprawdzić. Docelowo wszystko
 * do potwierdzenia w normach IFiŻZ PAN „Zalecenia żywieniowe i wartość
 * pokarmowa pasz dla drobiu”, wyd. 6 (2025), których jeszcze nie mamy.
 *
 * DECYZJA MARKA 24.10.2026: przekroczyć maksimum wolno (własny limit w wierszu
 * kalkulatora), ale wtedy pokazujemy `ostrzezenie`, bo chodzi o zdrowie ptaków.
 * Dobór proporcji sam trzyma się maksimów.
 *
 * Zastąpiło MAKS_UDZIAL z arkusza „Maxi” (jedno maksimum dla wszystkich ptaków,
 * groch i bobik 25% także dla piskląt).
 */

/** Grupy, dla których źródła podają osobne limity. */
export type GrupaPtakow = "mlode" | "rosnace" | "nioski" | "wodne";

export const GRUPY_PTAKOW: Record<GrupaPtakow, string> = {
  mlode: "Młode ptaki (do 4–6 tygodni)",
  rosnace: "Rosnące i rzeźne (brojlery, odchów kurek, indyki)",
  nioski: "Nioski i stado zarodowe",
  wodne: "Kaczki i gęsi (starsze)",
};

/**
 * Grupa dla gatunku i okresu z normyDrobiu.ts. Bez gatunku (stare wywołania)
 * zgadujemy z samego okresu, a kaczki i gęsi wpadają wtedy do rosnących.
 */
export function grupaPtakow(drob: string | undefined, okres: string): GrupaPtakow | null {
  if (!okres) return null;
  const o = okres.toLowerCase();
  const mlode = /\b1-[346]\b/.test(o) || o.includes("starter");
  const wodne = drob === "kaczki" || drob === "gesi";
  if (mlode) return "mlode";
  if (o.includes("zarodowe")) return wodne ? "wodne" : "nioski";
  if (o.includes("niesienie")) return "nioski";
  return wodne ? "wodne" : "rosnace";
}

export interface ZrodloUdzialu {
  opis: string;
  url?: string;
}

export const ZRODLA_UDZIALOW: Record<string, ZrodloUdzialu> = {
  nzd2005: {
    opis: "Normy żywienia drobiu (IFiŻZ PAN, 2005): dopuszczalny udział nasion strączkowych; za: E. Stajnder, Wykorzystanie roślin wysokobiałkowych w żywieniu drobiu, MODR Karniowice 2019, tab. 3",
    url: "https://modr.pl/sites/default/files/brochures/wykorzystanie_roslin_wysokobialkowych_w_zywieniu_drobiu.pdf",
  },
  modr2019: {
    opis: "E. Stajnder, Wykorzystanie roślin wysokobiałkowych w żywieniu drobiu, MODR Karniowice 2019, tab. 1, 2 i 4",
    url: "https://modr.pl/sites/default/files/brochures/wykorzystanie_roslin_wysokobialkowych_w_zywieniu_drobiu.pdf",
  },
  ph2013: {
    opis: "A. Lipiec, R. K. Pisarski, Żywienie drobiu: rzepak czy soja?, Przegląd Hodowlany 3/2013, tab. 6 (za: Smulikowska i Rutkowski; Jeroch)",
    url: "http://ph.ptz.icm.edu.pl/wp-content/uploads/2016/12/11-Lipiec.pdf",
  },
  izpib2009: {
    opis: "Koreleski i Świątkiewicz (Instytut Zootechniki PIB, 2009): dopuszczalne udziały pasz rzepakowych; za: MODR Karniowice 2019",
    url: "https://modr.pl/sites/default/files/brochures/wykorzystanie_roslin_wysokobialkowych_w_zywieniu_drobiu.pdf",
  },
  nzd2018: {
    opis: "S. Smulikowska, A. Rutkowski (red.), Zalecenia żywieniowe i wartość pokarmowa pasz dla drobiu (2018); za: M. Różewicz, Wiadomości Zootechniczne 2019/4",
    url: "https://wz.iz.edu.pl/files/WZ_2019_4_art13.pdf",
  },
  "feedipedia-pszenica": {
    opis: "Feedipedia (INRAE, CIRAD, AFZ, FAO), Wheat grain, część o drobiu (Ewing 1997; Blair 2008)",
    url: "https://www.feedipedia.org/node/223",
  },
  "feedipedia-jeczmien": {
    opis: "Feedipedia (INRAE, CIRAD, AFZ, FAO), Barley grain, część o drobiu (Brake i in. 1997)",
    url: "https://www.feedipedia.org/node/227",
  },
  "feedipedia-zyto": {
    opis: "Feedipedia (INRAE, CIRAD, AFZ, FAO), Rye grain, część o drobiu (Ewing 1997; DAFS 2012)",
    url: "https://www.feedipedia.org/node/225",
  },
  "feedipedia-rzepak": {
    opis: "Feedipedia (INRAE, CIRAD, AFZ, FAO), Rapeseed meal: rybi zapach jaj od ok. 12% (Hy-Line 2010)",
    url: "https://www.feedipedia.org/node/52",
  },
  iung2007: {
    opis: "IUNG-PIB, Studia i Raporty, zeszyt 9 (2007): żyto zastąpi najwyżej 20–40% kukurydzy lub pszenicy",
    url: "https://iung.pl/sir/zeszyt09_10.pdf",
  },
  "hyline-dna": {
    opis: "Hy-Line International, Technical Update „Gout”: rosnącym kurkom najwyżej 1% wapnia w paszy, przed nieśnością 2,5–2,75%",
    url: "https://www.hyline.com/Upload/Resources/TU%20GOUT%20ENG.pdf",
  },
  "hyline-brown": {
    opis: "Hy-Line Brown, Alternative Systems Management Guide: sód 0,18% paszy w nieśności",
    url: "https://www.hyline.com/filesimages/Hy-Line-Products/Hy-Line-Product-PDFs/Brown/Brown%20Alt/BRN%20ALT%20STD%20ENG.pdf",
  },
  "merck-sol": {
    opis: "Merck Veterinary Manual, Salt toxicosis in animals: zatrucie solą głównie przy ograniczonym dostępie do wody",
    url: "https://www.merckvetmanual.com/toxicology/salt-toxicosis/salt-toxicosis-in-animals",
  },
  wyliczone: {
    opis: "Limit techniczny kalkulatora: dodatki mineralne wyliczone z norm wapnia, fosforu i sodu; premiksy i dodatki w dawce z etykiety producenta",
  },
  szkolna: {
    opis: "Tabela „Ograniczenie udziału niektórych pasz w mieszankach dla drobiu”, materiał dydaktyczny (2017, bez autora); źródło wtórne, prawdopodobnie za normami",
    url: "https://cloud-d.edupage.org/cloud/06-09_Drob.pdf",
  },
  robocze: {
    opis: "Zestawienie robocze udziałów optymalnych i maksymalnych (arkusz autora serwisu); bez podziału na gatunki, do potwierdzenia",
  },
};

export interface Zalecenie {
  /** Najwyższy zalecany udział w %. 0 = nie stosować. */
  maks: number;
  /** Najwyższy udział, gdy pasza ma enzym (ksylanazę, beta-glukanazę). */
  maksZEnzymem?: number;
  /** Zakres typowy, gdy źródło go podaje. */
  zalecane?: [number, number];
}

export interface UdzialSurowca {
  /** Nazwa na stronie. */
  surowiec: string;
  /** Nazwy z bazy surowców kalkulatora (src/data/feedIngredients.ts), których dotyczy. */
  nazwy: string[];
  /** Brak grupy = źródła nic nie podają, limitu nie ma. Kaczki i gęsi bez własnych liczb biorą wartości rosnących. */
  grupy: Partial<Record<GrupaPtakow, Zalecenie>>;
  /** Dlaczego się ogranicza. */
  powod: string;
  /** Co pokazać po przekroczeniu maksimum: o zdrowiu, krótko. */
  ostrzezenie: string;
  /** Klucze z ZRODLA_UDZIALOW. */
  zrodla: string[];
  /** Co niepewne i co sprawdzić w normach 2025. */
  doPotwierdzenia?: string;
  /**
   * Dodatek w stałej dawce: dobór proporcji nie zmienia wpisanej ilości (sól,
   * premiksy, aminokwasy, enzymy). Liczba = dawka, gdy nic nie wpisano; true =
   * dawkę trzeba podać (z etykiety). Bez tego dobór dopychał mieszankę do 100%
   * właśnie nimi, bo nie wpływają na energię, białko, wapń ani fosfor, które
   * wyrównuje: sól wychodziła 3,7% (test 24.10.2026, brojlery w starterze).
   */
  stalaDawka?: number | true;
}

export const UDZIALY_SUROWCOW: UdzialSurowca[] = [
  {
    surowiec: "Kukurydza",
    nazwy: ["Kukurydza", "Mąka kukurydziana pastewna"],
    grupy: { mlode: { maks: 60 }, rosnace: { maks: 60 }, nioski: { maks: 60 } },
    powod: "Nie ma w niej czynnika szkodliwego: to najbardziej energetyczne zboże i barwi żółtko. Limit chroni przed mieszanką prawie z samej kukurydzy, która ma za mało białka.",
    ostrzezenie: "Bardzo dużo kukurydzy: sprawdź białko i wapń, sama kukurydza ich nie da.",
    zrodla: ["robocze"],
    doPotwierdzenia: "Maksimum z zestawienia roboczego; otwarte źródła nie podają limitu zdrowotnego.",
  },
  {
    surowiec: "Pszenica",
    nazwy: ["Pszenica", "Pszenica+enzym", "mąka pszenna pastewna"],
    grupy: { mlode: { maks: 50 }, rosnace: { maks: 60 }, nioski: { maks: 60 } },
    powod: "Pentozany zwiększają lepkość treści jelit i wilgotność odchodów. Bez kukurydzy żółtka i skóra bledną.",
    ostrzezenie: "Dużo pszenicy: możliwe mokre odchody i blade żółtka. Pomaga enzym (ksylanaza) i część kukurydzy.",
    zrodla: ["feedipedia-pszenica"],
  },
  {
    surowiec: "Jęczmień",
    nazwy: ["Jęczmień", "Jęczmień+enzym", "Mąka jęczmienna pastewna"],
    grupy: {
      mlode: { maks: 10, maksZEnzymem: 30 },
      rosnace: { maks: 20, maksZEnzymem: 30 },
      nioski: { maks: 40 },
    },
    powod: "Beta-glukany dają lepkie odchody, mokrą ściółkę i brudne jaja oraz gorzej się wchłaniają. Najbardziej wrażliwe są młode ptaki.",
    ostrzezenie: "Za dużo jęczmienia dla tego wieku: lepkie odchody i gorsze trawienie. Zmniejsz albo użyj jęczmienia z enzymem.",
    zrodla: ["szkolna", "feedipedia-jeczmien"],
    doPotwierdzenia: "Dla rosnących tabela szkolna podaje 10% (30% z enzymem), Feedipedia 20–30% dla starszych brojlerów i gorszą ściółkę powyżej 20%.",
  },
  {
    surowiec: "Pszenżyto",
    nazwy: ["Pszenżyto", "Pszenżyto+enzym"],
    grupy: {
      mlode: { maks: 10, maksZEnzymem: 20 },
      rosnace: { maks: 20, maksZEnzymem: 30 },
      nioski: { maks: 40 },
    },
    powod: "Ma pentozany, mniej niż żyto. Z enzymem to dobre zboże dla drobiu.",
    ostrzezenie: "Za dużo pszenżyta dla tego wieku: gorsze trawienie i wilgotne odchody, chyba że pasza ma enzym.",
    zrodla: ["nzd2018"],
    doPotwierdzenia: "Dla młodych ptaków liczba z zaleceń dla indyków do 4 tygodni.",
  },
  {
    surowiec: "Żyto",
    nazwy: ["Żyto"],
    grupy: { mlode: { maks: 0 }, rosnace: { maks: 10 }, nioski: { maks: 40 } },
    powod: "Pentozany i alkilorezorcynole: lepka treść jelit, mokre odchody, u piskląt krzywica. Ziarno bywa porażone sporyszem.",
    ostrzezenie: "Żyto nie jest zalecane dla młodych ptaków, a u starszych w dużej ilości daje lepkie odchody i słabsze wyniki.",
    zrodla: ["szkolna", "feedipedia-zyto", "iung2007"],
    doPotwierdzenia: "Dla dorosłych źródła podają od kilku do 40%. Feedipedia radzi dawać żyto nioskom dopiero po szczycie nieśności (ok. 40 tygodnia).",
  },
  {
    surowiec: "Owies",
    nazwy: ["Owies", "Płatki owsiane"],
    grupy: { mlode: { maks: 35 }, rosnace: { maks: 35 }, nioski: { maks: 35 } },
    powod: "Dużo włókna w łusce i mniej energii. Młode ptaki trawią go gorzej.",
    ostrzezenie: "Dużo owsa: mniej energii i więcej włókna, sprawdź włókno w wyniku.",
    zrodla: ["robocze"],
    doPotwierdzenia: "Brak normy w otwartych źródłach. Owies ogranicza głównie włókno, które kalkulator sprawdza osobno.",
  },
  {
    surowiec: "Groch (także peluszka)",
    nazwy: ["Groch", "Peluszka"],
    grupy: { mlode: { maks: 5 }, rosnace: { maks: 15 }, nioski: { maks: 15 }, wodne: { maks: 15 } },
    powod: "Taniny, inhibitory trypsyny i alfa-galaktozydy obniżają strawność. Najbardziej wrażliwe są młode ptaki.",
    ostrzezenie: "Za dużo grochu dla tego wieku: gorsze trawienie białka, wolniejszy wzrost, mniej jaj.",
    zrodla: ["nzd2005", "modr2019"],
  },
  {
    surowiec: "Bobik",
    nazwy: ["Bobik"],
    grupy: { mlode: { maks: 5 }, rosnace: { maks: 15 }, nioski: { maks: 10 }, wodne: { maks: 10 } },
    powod: "Taniny, inhibitory trypsyny i hemaglutyniny obniżają strawność i nieśność.",
    ostrzezenie: "Za dużo bobiku dla tego wieku: taniny i inhibitory trawienia obniżą przyrosty i nieśność.",
    zrodla: ["nzd2005", "modr2019"],
  },
  {
    surowiec: "Łubin",
    nazwy: ["Łubin żółty", "Łubin niebieski wąskolistny"],
    grupy: { mlode: { maks: 5 }, rosnace: { maks: 15 }, nioski: { maks: 15 } },
    powod: "Gorzkie alkaloidy zmniejszają pobranie paszy. Tylko odmiany słodkie.",
    ostrzezenie: "Za dużo łubinu: ptaki mogą jeść mniej przez gorzkie alkaloidy.",
    zrodla: ["nzd2005"],
  },
  {
    surowiec: "Soja (nasiona prażone)",
    nazwy: ["Soja"],
    grupy: { mlode: { maks: 15 }, rosnace: { maks: 20 }, nioski: { maks: 20 } },
    powod: "Surowa soja ma inhibitor trypsyny, dlatego nasiona muszą być ogrzewane.",
    ostrzezenie: "Dużo nasion soi: tylko soja prażona, surowa hamuje trawienie białka.",
    zrodla: ["nzd2005"],
  },
  {
    surowiec: "Śruta rzepakowa",
    nazwy: ["Śruta poekstrakcyjna rzepakowa 00"],
    grupy: { mlode: { maks: 5 }, rosnace: { maks: 10 }, nioski: { maks: 5 }, wodne: { maks: 7.5 } },
    powod: "Glukozynolany szkodzą tarczycy i psują smak paszy. Synapina sprawia, że kury z brązowymi jajami znoszą jaja o rybim zapachu.",
    ostrzezenie: "Za dużo śruty rzepakowej: u kur z brązowymi jajami jaja mogą pachnieć rybą. Białe nioski tolerują 8–10%.",
    zrodla: ["izpib2009", "ph2013", "feedipedia-rzepak"],
    doPotwierdzenia: "Dla niosek przyjęto górną granicę dla kur z brązowymi jajami (3–5%); normy podają 10% dla niosek białych.",
  },
  {
    surowiec: "Makuch rzepakowy (wytłoki)",
    nazwy: ["Wytłoki rzepakowe", "Wytłoki rzepakowe-Szestno"],
    grupy: { mlode: { maks: 5 }, rosnace: { maks: 10 }, nioski: { maks: 5 }, wodne: { maks: 5 } },
    powod: "Jak śruta rzepakowa, a do tego więcej tłuszczu, który szybciej jełczeje.",
    ostrzezenie: "Za dużo makuchu rzepakowego: u kur z brązowymi jajami rybi zapach jaj, u młodych ptaków gorsze wyniki.",
    zrodla: ["ph2013", "izpib2009"],
    doPotwierdzenia: "Dla niosek przyjęto granicę dla kur z brązowymi jajami; normy podają 7,5% dla niosek białych.",
  },
  {
    surowiec: "Rzepak (nasiona)",
    nazwy: ["Rzepak 00"],
    grupy: { mlode: { maks: 5 }, rosnace: { maks: 5 }, nioski: { maks: 5 }, wodne: { maks: 5 } },
    powod: "Glukozynolany i synapina jak w śrucie, a przy tym dużo tłuszczu.",
    ostrzezenie: "Za dużo nasion rzepaku: ryzyko dla tarczycy, u kur z brązowymi jajami rybi zapach jaj.",
    zrodla: ["ph2013", "izpib2009"],
    doPotwierdzenia: "Dla niosek przyjęto granicę dla kur z brązowymi jajami; normy podają 7,5% dla niosek białych.",
  },
  {
    surowiec: "Olej roślinny",
    nazwy: ["Olej rzepakowy"],
    grupy: { rosnace: { maks: 8, zalecane: [3, 5] }, wodne: { maks: 2, zalecane: [1, 2] } },
    powod: "Za dużo tłuszczu to biegunki i jełczenie paszy.",
    ostrzezenie: "Dużo oleju: ryzyko biegunek i jełczenia paszy.",
    zrodla: ["modr2019"],
    doPotwierdzenia: "Liczby dla drobiu rzeźnego; dla niosek źródła nie podają maksimum (typowo 1,5–2%).",
  },
  {
    surowiec: "Śruta arachidowa",
    nazwy: ["Śruta poekstrakcyjna arachidowa"],
    grupy: { mlode: { maks: 0 }, rosnace: { maks: 0 }, nioski: { maks: 10 } },
    powod: "Ryzyko aflatoksyn, na które drób jest bardzo wrażliwy.",
    ostrzezenie: "Śruta arachidowa nie jest zalecana dla młodych i rosnących ptaków (aflatoksyny).",
    zrodla: ["szkolna"],
  },
  {
    surowiec: "Melasa",
    nazwy: ["Melasa"],
    grupy: { rosnace: { maks: 5 }, nioski: { maks: 5 } },
    powod: "Dużo potasu: ptaki więcej piją i mają mokre odchody.",
    ostrzezenie: "Za dużo melasy: mokre odchody od nadmiaru potasu.",
    zrodla: ["szkolna"],
  },
  {
    surowiec: "Mleko w proszku",
    nazwy: ["Mleko krowie odtłuszczone w proszku"],
    grupy: { rosnace: { maks: 5 }, nioski: { maks: 5 } },
    powod: "Laktoza: drób jej nie trawi, nadmiar daje biegunki.",
    ostrzezenie: "Za dużo mleka w proszku: laktoza wywoła biegunki.",
    zrodla: ["szkolna"],
  },
  {
    surowiec: "Sól kuchenna",
    nazwy: ["Sól kuchenna"],
    grupy: { mlode: { maks: 0.5 }, rosnace: { maks: 0.5 }, nioski: { maks: 0.5 }, wodne: { maks: 0.5 } },
    powod: "Drób potrzebuje około 0,3% soli (sód ok. 0,16–0,18% paszy), a jednocześnie bardzo źle znosi przesolenie. Najbardziej wrażliwe są pisklęta.",
    ostrzezenie: "Za dużo soli: ptaki dużo piją, mają mokre odchody, a bez stałego dostępu do wody grozi zatrucie.",
    zrodla: ["hyline-brown", "merck-sol", "wyliczone"],
    doPotwierdzenia: "Maksimum wyliczone z zalecanego sodu z zapasem; normy podają sód, a nie udział soli.",
    stalaDawka: 0.3,
  },
  {
    surowiec: "Kreda, muszle, skorupy jaj",
    nazwy: ["Kreda pastewna", "Muszle mielone", "Skorupy jaj"],
    grupy: { mlode: { maks: 3 }, rosnace: { maks: 3 }, nioski: { maks: 12 }, wodne: { maks: 3 } },
    powod: "Źródło wapnia. Nioska potrzebuje 3,5–4% wapnia w paszy, ptaki, które nie niosą, około 1%. Nadmiar u młodych ptaków niszczy nerki.",
    ostrzezenie: "Za dużo kredy dla tych ptaków: nadmiar wapnia u ptaków, które nie niosą, niszczy nerki (dna moczanowa).",
    zrodla: ["hyline-dna", "wyliczone"],
    doPotwierdzenia: "Maksimum wyliczone z normy wapnia (kreda ma ok. 36–38% wapnia, nioska przy normie 3,8% potrzebuje jej ok. 10,5%).",
  },
  {
    surowiec: "Fosforany paszowe",
    nazwy: ["Fosforan jednowapniowy", "Fosforan dwuwapniowy", "Fosforan trójwapniowy"],
    grupy: { mlode: { maks: 3 }, rosnace: { maks: 3 }, nioski: { maks: 3 }, wodne: { maks: 3 } },
    powod: "Źródło fosforu i wapnia; zwykle wystarcza 1–2% mieszanki.",
    ostrzezenie: "Za dużo fosforanu: nadmiar fosforu i wapnia obciąża nerki.",
    zrodla: ["wyliczone"],
    doPotwierdzenia: "Maksimum wyliczone z norm fosforu.",
  },
  {
    surowiec: "Premiksy i mieszanki mineralne",
    nazwy: [
      "Premiks IF-M.", "Premiks IF-W", "Premiks IS-M.", "Premiks IS-W", "Premiks IB-1 forte", "Premiks IB-2 forte",
      "Premiks IB-3 forte", "Premiks DKA-G bis", "Premiks DKA-G forte bis", "Premiks DKA-F forte bis", "Optamix extra-G",
      "Optamix extra-IB-f", "Premiks KB forte bis", "Premiks 2,5 \"PT\"", "MMD vit", "Premiks 2,5% KW-1", "Premix 2.5% GN-1",
      "Polfamix DG-2", "Formland", "Formosan",
    ],
    grupy: { mlode: { maks: 3 }, rosnace: { maks: 3 }, nioski: { maks: 3 }, wodne: { maks: 3 } },
    powod: "Witaminy i mikroelementy w dawce z etykiety producenta. Za mało to niedobory, za dużo przedawkowanie.",
    ostrzezenie: "Premiks ponad zwykłą dawkę: ryzyko przedawkowania witamin i mikroelementów. Trzymaj się etykiety.",
    zrodla: ["wyliczone"],
    stalaDawka: true,
  },
  {
    surowiec: "Aminokwasy (lizyna, metionina)",
    nazwy: ["Lizyna", "Metionina"],
    grupy: { mlode: { maks: 0.5 }, rosnace: { maks: 0.5 }, nioski: { maks: 0.5 }, wodne: { maks: 0.5 } },
    powod: "Czysty aminokwas uzupełnia niedobór; dawka to zwykle dziesiąte części procenta.",
    ostrzezenie: "Dużo czystego aminokwasu: sprawdź dawkę, zwykle to dziesiąte części procenta.",
    zrodla: ["wyliczone"],
    stalaDawka: true,
  },
  {
    surowiec: "Enzymy i zakwaszacze",
    nazwy: ["enzym", "Avizyme", "Cytromix"],
    grupy: { mlode: { maks: 0.5 }, rosnace: { maks: 0.5 }, nioski: { maks: 0.5 }, wodne: { maks: 0.5 } },
    powod: "Dawka według etykiety producenta, zwykle ułamek procenta.",
    ostrzezenie: "Dodatek ponad zwykłą dawkę: sprawdź etykietę producenta.",
    zrodla: ["wyliczone"],
    stalaDawka: true,
  },
];

const PO_NAZWIE = new Map(UDZIALY_SUROWCOW.flatMap((u) => u.nazwy.map((n) => [n, u] as const)));

/** Wpis dla surowca z bazy kalkulatora albo undefined, gdy surowiec nie ma ograniczeń. */
export const udzialSurowca = (nazwa: string): UdzialSurowca | undefined => PO_NAZWIE.get(nazwa);

/** Zalecenie wpisu dla grupy. Kaczki i gęsi bez własnych liczb biorą wartości rosnących (zastepcze). */
export function zalecenieGrupy(wpis: UdzialSurowca, grupa: GrupaPtakow): { z: Zalecenie; zastepcze: boolean } | null {
  const wlasne = wpis.grupy[grupa];
  if (wlasne) return { z: wlasne, zastepcze: false };
  if (grupa === "wodne" && wpis.grupy.rosnace) return { z: wpis.grupy.rosnace, zastepcze: true };
  return null;
}

/** Zalecenie dla surowca z bazy w grupie ptaków. Odmiana „+enzym” dostaje maksimum z enzymem. */
export function zalecenieUdzialu(nazwa: string, grupa: GrupaPtakow | null): (Zalecenie & { wpis: UdzialSurowca }) | null {
  const wpis = udzialSurowca(nazwa);
  if (!wpis || !grupa) return null;
  const z = zalecenieGrupy(wpis, grupa)?.z;
  if (!z) return null;
  const maks = nazwa.includes("+enzym") && z.maksZEnzymem != null ? z.maksZEnzymem : z.maks;
  return { ...z, maks, wpis };
}

/**
 * Dawka dodatku w stałej dawce, gdy w wierszu nic nie wpisano: z pliku (sól)
 * albo z nazwy premiksu („Premiks 2,5% KW-1” -> 2,5). 0 = trzeba ją podać.
 */
export function dawkaDomyslna(nazwa: string): number {
  const wpis = udzialSurowca(nazwa);
  if (!wpis?.stalaDawka) return 0;
  if (typeof wpis.stalaDawka === "number") return wpis.stalaDawka;
  const z = nazwa.match(/^Premi(?:ks|x) (\d+(?:[.,]\d+)?)/);
  return z ? parseFloat(z[1].replace(",", ".")) : 0;
}

const proc = (n: number) => `${String(n).replace(".", ",")}%`;

/** Zalecenie słowami, jak na stronie: „do 15%”, „nie stosować”, „do 10%, z enzymem do 30%”. */
export function opisZalecenia(z: Zalecenie | undefined | null): string {
  if (!z) return "brak limitu w źródłach";
  if (z.maks === 0) return "nie stosować";
  let t = `do ${proc(z.maks)}`;
  if (z.maksZEnzymem != null) t += `, z enzymem do ${proc(z.maksZEnzymem)}`;
  if (z.zalecane) t += ` (zwykle ${String(z.zalecane[0]).replace(".", ",")}–${proc(z.zalecane[1])})`;
  return t;
}

/** Data stanu danych; zmieniać przy każdej zmianie liczb (pokazuje ją podstrona i mirror). */
export const STAN_UDZIALOW = "2026-10-24";

/**
 * Pytania i odpowiedzi do podstrony (React i mirror, także jako FAQPage).
 * Liczby brane z tabeli wyżej, żeby po uzupełnieniu norm zmieniły się same.
 */
export function pytaniaUdzialow(): { question: string; answer: string }[] {
  const g = (nazwa: string, grupa: GrupaPtakow) => opisZalecenia(zalecenieUdzialu(nazwa, grupa));
  return [
    {
      question: "Ile grochu i bobiku można dać kurczętom i kurom?",
      answer: `Młodym ptakom groch ${g("Groch", "mlode")} i bobik ${g("Bobik", "mlode")}. Rosnącym i rzeźnym: groch ${g("Groch", "rosnace")}, bobik ${g("Bobik", "rosnace")}. Nioskom: groch ${g("Groch", "nioski")}, bobik ${g("Bobik", "nioski")}. Powodem są taniny i inhibitory trawienia, na które najbardziej wrażliwe są pisklęta. Źródło: Normy żywienia drobiu (2005), za MODR Karniowice.`,
    },
    {
      question: "Ile śruty rzepakowej mogą jeść kury nioski?",
      answer: "Kury znoszące brązowe jaja najwyżej 3–5% pasz rzepakowych. Mają wrodzony defekt rozkładu synapiny z rzepaku i przy większej ilości ich jaja pachną rybą. Kury z białymi jajami tolerują 8–10%, brojlery w starterze 5–6%, starsze 10–12%. Źródło: Instytut Zootechniki PIB (Koreleski i Świątkiewicz 2009).",
    },
    {
      question: "Czy można dawać kurom żyto?",
      answer: `Pisklętom i kurczętom nie. Rosnącym ptakom ${g("Żyto", "rosnace")}, nioskom najlepiej dopiero po szczycie nieśności, około 40 tygodnia życia. Żyto ma pentozany, które sklejają treść jelit i dają mokre, lepkie odchody, a ziarno bywa porażone sporyszem. Źródła podają dla dorosłych ptaków od kilku do 40%, więc tę liczbę jeszcze potwierdzamy.`,
    },
    {
      question: "Ile jęczmienia może być w paszy dla kur?",
      answer: `Młodym ptakom ${g("Jęczmień", "mlode")}, rosnącym ${g("Jęczmień", "rosnace")}, nioskom ${g("Jęczmień", "nioski")}. Beta-glukany z jęczmienia dają lepkie odchody, mokrą ściółkę i brudne jaja. Enzym paszowy (beta-glukanaza) pozwala dać go więcej.`,
    },
    {
      question: "Dlaczego nie dawać paszy dla niosek kurczętom i młodym kurkom?",
      answer: "Pasza dla niosek ma 3,5–4% wapnia, a rosnące kurki potrzebują najwyżej około 1%. Długo podawany nadmiar wapnia uszkadza nerki (dna moczanowa), a ptaki długo wyglądają zdrowo. Źródło: Hy-Line, Technical Update „Gout”.",
    },
  ];
}
