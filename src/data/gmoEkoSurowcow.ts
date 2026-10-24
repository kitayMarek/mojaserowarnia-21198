/**
 * Znaczniki GMO i chowu ekologicznego dla 124 surowców wzorcowych (od 24.10.2026),
 * pod przyszły profil hodowcy z filtrami „bez GMO” i „eko”. Mapa po nazwie, bo
 * src/data/feedIngredients.ts jest generowany z arkusza i nie wolno go ruszać ręcznie.
 * Ten sam podział trafia do bazy (kolumny gmo i dopuszczalne_eko) przez
 * scripts/sql/dodatki-seed.sql. Produkty z bazy dodatków mają znaczniki u siebie
 * (src/data/dodatkiPaszowe.ts), z etykiety.
 *
 * ZASADA GMO, żeby nie zgadywać:
 * - „tak” tylko tam, gdzie w Polsce surowiec jest w praktyce z roślin GM: zwykła
 *   śruta sojowa (import z obu Ameryk). Etykiety koncentratów na takiej śrucie
 *   piszą „zawiera GMO”, np. Rolpol KONCENTRAT 30% NIOSKA.
 * - „nie” tylko dla gatunków, których odmian GM w UE nie dopuszczono wcale (rejestr
 *   GMO Komisji Europejskiej obejmuje kukurydzę, soję, rzepak, bawełnę i burak
 *   cukrowy), dla dodatków mineralnych, metioniny z syntezy chemicznej i produktów
 *   zwierzęcych (pasza GM zwierzęcia nie czyni mleka czy mączki GMO, rozp. 1829/2003).
 * - „nieznane” dla reszty: kukurydza, rzepak i soja pełnotłusta bywają z importu,
 *   a mieszanki, premiksy, enzymy i lizyna z fermentacji zależą od producenta.
 *
 * EKO: false tylko tam, gdzie przepis wprost wyklucza surowiec: syntetyczne aminokwasy
 * (rozp. 2018/848, załącznik II, część II, pkt 1.4.1) i GMO (art. 11). Reszta null,
 * czyli „nie oceniano”: dopuszczalność zboża czy śruty w eko zależy od certyfikatu
 * partii, a nie od rodzaju surowca.
 */

import type { Gmo } from "./dodatkiPaszowe.ts";

export interface ZnacznikiSurowca {
  gmo: Gmo;
  /** true = dopuszczalny w chowie ekologicznym, false = wykluczony, null = nie oceniano. */
  dopuszczalneEko: boolean | null;
  /** Skąd ta ocena, krótko. */
  uzasadnienie: string;
}

export const ZRODLA_ZNACZNIKOW = {
  rejestrGmo: { opis: "Komisja Europejska, rejestr dopuszczonych GMO (żywność i pasze)", url: "https://webgate.ec.europa.eu/dyna2/gm-register/" },
  eko: { opis: "Rozporządzenie (UE) 2018/848 o produkcji ekologicznej, art. 11 i załącznik II, część II, pkt 1.4.1", url: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32018R0848" },
  znakowanieGmo: { opis: "Rozporządzenie (WE) 1829/2003 w sprawie genetycznie zmodyfikowanej żywności i paszy", url: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32003R1829" },
};

const BEZ_ODMIAN_GM = "W UE nie dopuszczono odmian GM tego gatunku.";
const MINERALNY = "Dodatek mineralny, nie pochodzi z roślin.";
const ZWIERZECY = "Produkt zwierzęcy: pasza GM zwierzęcia nie czyni go GMO.";
const IMPORT = "Bywa z importu z roślin GM; bez etykiety partii nie wiadomo.";
const PRODUCENT = "Mieszanka albo dodatek: zależy od surowców producenta.";

const grupa = (nazwy: string[], z: ZnacznikiSurowca) => nazwy.map((n) => [n, z] as const);

export const ZNACZNIKI_SUROWCOW: Record<string, ZnacznikiSurowca> = Object.fromEntries([
  ...grupa(["Śruta sojowa"], {
    gmo: "tak", dopuszczalneEko: false,
    uzasadnienie: "Zwykła śruta sojowa w Polsce pochodzi w praktyce z soi GM z obu Ameryk; GMO w chowie ekologicznym jest zakazane (art. 11 rozp. 2018/848). Bez GMO kupuje się ją osobno, z deklaracją na etykiecie.",
  }),
  ...grupa(["Lizyna"], {
    gmo: "nieznane", dopuszczalneEko: false,
    uzasadnienie: "Syntetyczny aminokwas: w chowie ekologicznym niedopuszczalny. Lizynę produkuje się fermentacją, czasem szczepami GM, a etykieta nie musi tego podawać.",
  }),
  ...grupa(["Metionina"], {
    gmo: "nie", dopuszczalneEko: false,
    uzasadnienie: "Syntetyczny aminokwas (DL-metionina z syntezy chemicznej): w chowie ekologicznym niedopuszczalny.",
  }),
  ...grupa([
    "Bobik", "Groch", "Gryka", "Jęczmień", "Jęczmień+enzym", "Łubin niebieski wąskolistny", "Łubin żółty", "Owies",
    "Peluszka", "Pszenica", "Pszenica+enzym", "Pszenżyto", "Pszenżyto+enzym", "Słonecznik", "Żyto",
    "Kiełki pszenne", "Kiełki słodowe", "Mąka jęczmienna pastewna", "mąka pszenna pastewna", "Otręby pszenne",
    "Płatki owsiane", "Płatki ziemniaczane", "Śruta poekstrakcyjna arachidowa", "Śruta poekstrakcyjna słonecznikowa odłuszczona",
    "Koniczyna czerwona powyżej-20% b.og. w SM", "Susz z lucerny", "Susz z traw", "Koniczyna perska", "Lucerna przed kwitnieniem",
    "Owies młody", "Pokrzywa młoda", "Seradela - początek do połowy kwitnienia", "Trawy - kłoszenie", "Żyto - strzelanie w źdźbło",
    "Trawa łąkowa", "Brukiew", "Bulwa (topinambur)", "Buraki pastewne", "Buraki Poly - Past", "Marchew pastewna",
    "Rzepa ścierniskowa", "Ziemniaki parowane",
  ], { gmo: "nie", dopuszczalneEko: null, uzasadnienie: BEZ_ODMIAN_GM }),
  ...grupa([
    // Kiszonka z całych roślin i liście buraków to pasza z własnego pola, a uprawa GM
    // jest w Polsce wyłączona (decyzja wykonawcza Komisji (UE) 2016/321).
    "Kukurydza cała roślina dojrzałość mleczna ziarna", "Liście buraków cukrowych - czyste", "Buraki cukrowe",
  ], { gmo: "nie", dopuszczalneEko: null, uzasadnienie: "Pasza z polskiego pola, a uprawa roślin GM jest w Polsce wyłączona." }),
  ...grupa([
    "Fosforan jednowapniowy", "Fosforan dwuwapniowy", "Fosforan trójwapniowy", "Kreda pastewna", "Muszle mielone",
    "Skorupy jaj", "Sól kuchenna",
  ], { gmo: "nie", dopuszczalneEko: null, uzasadnienie: MINERALNY }),
  ...grupa([
    "Kazeina", "Mączka z krwi", "Mączka kostna surowa", "Mączka kostna odklejona", "Mączka mięsna",
    "Mączka mięsna o wyższej zawartości tłuszczu", "Mączka mięsno-kostna", "Mączka KAMBAS-55", "Mączka z piór",
    "Mączka z dorszy", "Mączka rybna do 10% tłuszczu w SM", "Mączka rybna powyżej 10% tłuszczu w SM", "Mączka śledziowa",
    "Mleko krowie odtłuszczone w proszku", "Tłuszcz drobiowy", "Łój", "Smalec", "Serwatka  w proszku", "Treść jaja",
    "Twaróg świeży,chudy",
  ], { gmo: "nie", dopuszczalneEko: null, uzasadnienie: ZWIERZECY }),
  ...grupa([
    "Kukurydza", "Mąka kukurydziana pastewna", "Kiełki kukurydziane", "Rzepak 00", "Soja",
    "Śruta poekstrakcyjna rzepakowa 00", "Wytłoki rzepakowe", "Wytłoki rzepakowe-Szestno", "Olej rzepakowy", "Melasa",
  ], { gmo: "nieznane", dopuszczalneEko: null, uzasadnienie: IMPORT }),
  ...grupa([
    "Drożdże pastewne", "Drożdże piwne", "Odpady piekarnicze", "Formland",
    "DKA - starter - DOBROL", "DKA - grower - DOBROL", "DKA - finiszer - DOBROL", "KB-1 - DOBROL", "KB-2 - DOBROL",
    "KB-1 - SOJA", "DKA - grower - SOJA", "DKA-S - Golub", "Superkoncentrat-Finiszer", "Formosan", "enzym", "Avizyme",
    "Cytromix", "Premiks IF-M.", "Premiks IF-W", "Premiks IS-M.", "Premiks IS-W", "Premiks IB-1 forte", "Premiks IB-2 forte",
    "Premiks IB-3 forte", "Premiks DKA-G bis", "Premiks DKA-G forte bis", "Premiks DKA-F forte bis", "Optamix extra-G",
    "Optamix extra-IB-f", "Premiks KB forte bis", "Premiks 2,5 \"PT\"", "MMD vit", "Superkoncentrat DKA-Starter",
    "Koncentrat KW-1", "Polfamix DG-2", "Superkoncentrat 10%GN-1", "Premiks 2,5% KW-1", "Premix 2.5% GN-1", "Ascolac",
  ], { gmo: "nieznane", dopuszczalneEko: null, uzasadnienie: PRODUCENT }),
]);

const NIEZNANE: ZnacznikiSurowca = { gmo: "nieznane", dopuszczalneEko: null, uzasadnienie: "Brak oceny dla tego surowca." };

/** Znaczniki surowca wzorcowego; dla nazw spoza mapy (zgłoszenia, produkty z kuchni) „nieznane”. */
export const znacznikiSurowca = (nazwa: string): ZnacznikiSurowca => ZNACZNIKI_SUROWCOW[nazwa] ?? NIEZNANE;

/** Słowami, do karty i MCP. */
export const OPIS_GMO: Record<Gmo, string> = {
  tak: "zawiera GMO",
  nie: "bez GMO",
  nieznane: "GMO: brak danych",
};

export const opisEko = (eko: boolean | null) =>
  eko === true ? "dopuszczalny w chowie ekologicznym" : eko === false ? "niedopuszczalny w chowie ekologicznym" : "eko: nie oceniano";
