/**
 * Bilansowanie mieszanki dla drobiu: zawartość składników, ocena wobec normy,
 * dobór proporcji i sugestie. Wspólne dla kalkulatora na stronie
 * (src/pages/KalkulatorPasz.tsx) i serwera MCP (worker-magazyn/src/pasze.js).
 *
 * Do 21.10.2026 cała ta logika siedziała w komponencie strony. Przeniesiona 1:1,
 * z jedną poprawką w sugestiach (niżej, przy SUROWCE), żeby Claude przez MCP
 * i człowiek na stronie dostawali ten sam wynik z tych samych liczb.
 *
 * ⚠ Importy względne, a importy wartości z rozszerzeniem .ts: plik czyta też
 * worker (esbuild) i Node bez aliasu "@/".
 */

import type { NormaDrobiu } from "../data/normyDrobiu";
import { dawkaDomyslna, grupaPtakow, udzialSurowca, zalecenieUdzialu } from "../data/udzialySurowcow.ts";
import { KATEGORIA_Z_KUCHNI } from "../data/skladnikiZKuchni.ts";
import {
  KATEGORIA_OSOBNE_KARMIDLO, cenaZaKg, dodatekPoNazwie, najtanszaOferta, przepisZeStosowania,
  type OfertaDodatku, type PrzepisKoncentratu,
} from "../data/dodatkiPaszowe.ts";

/**
 * Wiersz mieszanki. Pola bywają stringiem, bo na stronie pochodzą z formularza.
 * `min` i `max` to limity udziału w % wpisane przez użytkownika (od 24.10.2026);
 * puste znaczy „bez własnego limitu”, wtedy działa zalecane maksimum z src/data/udzialySurowcow.ts.
 */
export interface PozycjaMieszanki {
  nazwa: string;
  procent: string | number;
  min?: string | number;
  max?: string | number;
}

/** Parametry, dla których normy mają wartości. Tłuszczu nie liczy ani strona, ani MCP. */
export const POLA_NORM = ["em", "bialko", "ca", "p", "wlokno", "na", "k", "mg", "mn", "zn", "se", "fe", "i"] as const;
export type PoleNormy = (typeof POLA_NORM)[number];

/**
 * Tolerancja oceny „w normie": energia i białko ±5%, włókno ±15%, reszta ±10%.
 * Te same liczby, którymi strona koloruje wynik na zielono albo czerwono.
 * Ramki z ostrzeżeniem o minerałach strona pokazuje dopiero przy ±15%; te
 * liczby zostały w JSX strony, bo to próg wyświetlania, a nie ocena.
 */
export const TOLERANCJE: Record<PoleNormy, number> = {
  em: 0.05, bialko: 0.05, ca: 0.1, p: 0.1, wlokno: 0.15,
  na: 0.1, k: 0.1, mg: 0.1, mn: 0.1, zn: 0.1, se: 0.1, fe: 0.1, i: 0.1,
};

/** Jak na stronie: puste pole i tekst niebędący liczbą znaczą 0. */
const liczba = (v: unknown): number => parseFloat(v as string) || 0;
const pole = (s: PozycjaMieszanki, nazwa: string): unknown => (s as unknown as Record<string, unknown>)[nazwa];

/** Zawartość jednego parametru w mieszance: suma udział × wartość / 100. */
export function zawartosc(pozycje: PozycjaMieszanki[], nazwaPola: string): number {
  return pozycje.reduce((suma, s) => suma + (liczba(s.procent) * liczba(pole(s, nazwaPola))) / 100, 0);
}

export type OcenaNormy = "za-nisko" | "za-wysoko" | "ok";

export function sprawdzNorme(wartosc: number, norma: number, tolerancja = 0.1): OcenaNormy {
  const min = norma * (1 - tolerancja);
  const max = norma * (1 + tolerancja);
  if (wartosc < min) return "za-nisko";
  if (wartosc > max) return "za-wysoko";
  return "ok";
}

/** Suma kwadratów względnych odchyleń energii, białka, Ca i P. Tylko te cztery dobiera algorytm. */
export function bladNormy(pozycje: PozycjaMieszanki[], norma: NormaDrobiu | null | undefined): number {
  if (!norma) return Infinity;
  const kwadrat = (wartosc: number, cel: number) => Math.pow((wartosc - cel) / cel, 2);
  return (
    kwadrat(zawartosc(pozycje, "em"), norma.em) +
    kwadrat(zawartosc(pozycje, "bialko"), norma.bialko) +
    kwadrat(zawartosc(pozycje, "ca"), norma.ca) +
    kwadrat(zawartosc(pozycje, "p"), norma.p)
  );
}

export type KategoriaWiekowa = "zarodowe" | "młode" | "rosnące" | "dorosłe";

export function kategoriaWiekowa(okres: string): KategoriaWiekowa | null {
  if (!okres) return null;
  const o = okres.toLowerCase();
  if (o.includes("zarodowe")) return "zarodowe";
  if (o.includes("1-3") || o.includes("1-4") || o.includes("1-6") || o.includes("starter")) return "młode";
  if (o.includes("4-6") || o.includes("4-7") || o.includes("5-8") ||
      o.includes("7-14") || o.includes("9-12") || o.includes("13-16") ||
      o.includes("15-20") || o.includes("grower")) return "rosnące";
  if (o.includes("niesienie") || o.includes("powyżej") || o.includes("finisher")) return "dorosłe";
  return null;
}


/**
 * Dla jakich ptaków liczymy: sam okres (jak do 24.10.2026) albo gatunek z okresem.
 * Gatunek odróżnia kaczki i gęsi, dla których źródła mają osobne limity.
 */
export type Ptaki = string | { drob?: string; okres: string };

const rozloz = (ptaki: Ptaki) => (typeof ptaki === "string" ? { drob: undefined, okres: ptaki } : ptaki);

/**
 * Zalecane maksimum surowca dla tych ptaków w %, albo null, gdy surowiec nie ma
 * ograniczeń. Liczby, powody i źródła: src/data/udzialySurowcow.ts (zastąpiło
 * jedno maksimum dla wszystkich ptaków z arkusza „Maxi”).
 */
export function maksUdzialu(nazwa: string, ptaki: Ptaki): number | null {
  const { drob, okres } = rozloz(ptaki);
  return zalecenieUdzialu(nazwa, grupaPtakow(drob, okres))?.maks ?? null;
}

/** Dawka dodatku w stałej dawce (sól, premiks): wpisana w wierszu, a bez niej domyślna. 0 = brak. */
function stalaDawka(s: PozycjaMieszanki): number | null {
  if (!udzialSurowca(s.nazwa)?.stalaDawka) return null;
  return liczba(s.procent) > 0 ? liczba(s.procent) : dawkaDomyslna(s.nazwa);
}

/**
 * Granice udziału jednego wiersza: [min, max] w %. Max to własny limit z wiersza,
 * a bez niego zalecane maksimum dla tych ptaków. Dodatki w stałej dawce (sól,
 * premiksy, aminokwasy, enzymy) bez własnych limitów zostają w swojej dawce.
 */
export function graniceUdzialu(s: PozycjaMieszanki, ptaki: Ptaki): [number, number] {
  const wlasnyMin = liczba(s.min);
  const wlasnyMax = liczba(s.max);
  const dawka = stalaDawka(s);
  if (dawka && wlasnyMin <= 0 && wlasnyMax <= 0) return [dawka, dawka];
  const max = wlasnyMax > 0 ? wlasnyMax : maksUdzialu(s.nazwa, ptaki) ?? 100;
  return [Math.max(0, Math.min(wlasnyMin, 100)), Math.min(100, max)];
}

/**
 * Czy z tych limitów da się ułożyć 100%. Zwraca opis problemu albo null.
 * Wołać przed doborem: przy sprzecznych limitach algorytm dałby wynik,
 * który ich nie spełnia, a użytkownik by tego nie zauważył.
 */
export function bladLimitow(pozycje: PozycjaMieszanki[], ptaki: Ptaki): string | null {
  const bezDawki = pozycje.find((s) => stalaDawka(s) === 0 && liczba(s.min) <= 0 && liczba(s.max) <= 0);
  if (bezDawki) {
    return `${bezDawki.nazwa}: podaj dawkę z etykiety producenta (udział w %). Premiksy i dodatki dobór zostawia w ich dawce, nie dobiera ich ilości.`;
  }
  const granice = pozycje.map((s) => graniceUdzialu(s, ptaki));
  const i = granice.findIndex((g) => g[0] > g[1]);
  if (i >= 0) {
    const wlasne = String(pozycje[i].max ?? "").trim() !== "";
    return `${pozycje[i].nazwa}: minimum ${granice[i][0]}% jest większe niż ${wlasne ? "maksimum" : "zalecane maksimum"} ${granice[i][1]}%.${wlasne ? "" : " Jeśli chcesz więcej, wpisz własne maksimum."}`;
  }
  const sumaMin = granice.reduce((a, g) => a + g[0], 0);
  if (sumaMin > 100.05) return `Minimalne udziały sumują się do ${sumaMin.toFixed(1)}%, a mieszanka ma 100%. Obniż któreś minimum.`;
  const sumaMax = granice.reduce((a, g) => a + g[1], 0);
  if (sumaMax < 99.95) {
    const ograniczone = pozycje
      .map((s, i) => ({ nazwa: s.nazwa, max: granice[i][1] }))
      .filter((g) => g.max < 100)
      .slice(0, 3)
      .map((g) => `${g.nazwa} do ${g.max}%`)
      .join(", ");
    return `Z tymi limitami składniki dają najwyżej ${sumaMax.toFixed(1)}% mieszanki. Dodaj składnik albo podnieś któryś limit (${ograniczone}).`;
  }
  return null;
}

/** Składniki, które w wyniku doszły do swojego maksimum (z dokładnością do 0,1 pkt proc.). */
export function osiagnieteLimity(pozycje: PozycjaMieszanki[], ptaki: Ptaki): { nazwa: string; max: number }[] {
  return pozycje
    .filter((s) => stalaDawka(s) == null)
    .map((s) => ({ nazwa: s.nazwa, procent: liczba(s.procent), max: graniceUdzialu(s, ptaki)[1] }))
    .filter((s) => s.max < 100 && s.procent >= s.max - 0.1)
    .map(({ nazwa, max }) => ({ nazwa, max }));
}

/**
 * Sprowadza udziały do granic i do sumy 100%: przycina do [min, max], a różnicę
 * rozkłada proporcjonalnie na wiersze, które mają jeszcze luz. Kilka przejść,
 * bo rozłożenie może przepchnąć kolejny wiersz za jego granicę.
 */
function wGranicach(pozycje: { procent: number }[], granice: [number, number][]): void {
  for (let krok = 0; krok < 50; krok++) {
    pozycje.forEach((s, i) => { s.procent = Math.min(granice[i][1], Math.max(granice[i][0], s.procent)); });
    const roznica = 100 - pozycje.reduce((a, s) => a + s.procent, 0);
    if (Math.abs(roznica) < 1e-6) return;
    const wolne = pozycje
      .map((_, i) => i)
      .filter((i) => (roznica > 0 ? pozycje[i].procent < granice[i][1] - 1e-9 : pozycje[i].procent > granice[i][0] + 1e-9));
    if (wolne.length === 0) return;
    const suma = wolne.reduce((a, i) => a + pozycje[i].procent, 0);
    wolne.forEach((i) => { pozycje[i].procent += roznica * (suma > 0 ? pozycje[i].procent / suma : 1 / wolne.length); });
  }
}

/** Czy wiersz ma choć jedną wartość odżywczą; bez tego algorytm nie ma czym ruszać. */
export function maWartosci(s: PozycjaMieszanki): boolean {
  return ["em", "bialko", "ca", "p", "na", "k", "mg", "mn", "zn", "se", "fe", "i"].some((p) => liczba(pole(s, p)) > 0);
}

type ZProcentem<T> = T & { procent: number };

function startowe<T extends PozycjaMieszanki>(pozycje: T[], granice: [number, number][]): ZProcentem<T>[] {
  const out = pozycje.map((s) => ({ ...s, procent: 100 / pozycje.length }));
  wGranicach(out, granice);
  return out;
}

/**
 * „Przelicz optymalne proporcje": losowe przesuwanie udziałów między parami
 * składników, zostaje zmiana, która zmniejsza bladNormy. Każdy wiersz trzyma
 * się swoich granic (graniceUdzialu: własne min/max albo zalecane maksimum dla
 * tych ptaków). Przy sprzecznych limitach wynik ich nie spełni, dlatego najpierw
 * bladLimitow. `losuj` do podmiany: MCP podaje generator z ziarnem, żeby to
 * samo pytanie dawało tę samą odpowiedź.
 */
export function dobierzProporcje<T extends PozycjaMieszanki>(
  pozycje: T[],
  norma: NormaDrobiu,
  ptaki: Ptaki,
  losuj: () => number = Math.random,
  iteracje = 1000,
): ZProcentem<T>[] {
  const granice = pozycje.map((s) => graniceUdzialu(s, ptaki));
  let najlepsze = startowe(pozycje, granice);
  let najlepszyBlad = bladNormy(najlepsze, norma);

  for (let n = 0; n < iteracje; n++) {
    const test = najlepsze.map((s) => ({ ...s }));
    const i1 = Math.floor(losuj() * test.length);
    let i2 = Math.floor(losuj() * test.length);
    while (i2 === i1 && test.length > 1) i2 = Math.floor(losuj() * test.length);

    const zmiana = losuj() * 20 - 10;
    test[i1].procent = Math.max(0.1, Math.min(99, test[i1].procent + zmiana));
    test[i2].procent = Math.max(0.1, Math.min(99, test[i2].procent - zmiana));
    wGranicach(test, granice);

    const blad = bladNormy(test, norma);
    if (blad < najlepszyBlad) {
      najlepszyBlad = blad;
      najlepsze = test;
    }
  }
  return najlepsze;
}

/** Koszt 1 kg mieszanki w zł, gdy wiersze mają pole cena (zł/kg). */
export function kosztMieszanki(pozycje: PozycjaMieszanki[]): number {
  return pozycje.reduce((suma, s) => suma + (liczba(s.procent) * liczba(pole(s, "cena"))) / 100, 0);
}

/**
 * „Najtańsza mieszanka": ten sam ruch co wyżej, ale cel to koszt × 0,3 plus
 * bladNormy × 100, a częściej ruszane są trzy najtańsze składniki.
 */
export function najtanszaMieszanka<T extends PozycjaMieszanki>(
  pozycje: T[],
  norma: NormaDrobiu,
  ptaki: Ptaki,
  losuj: () => number = Math.random,
  iteracje = 2000,
): ZProcentem<T>[] {
  const granice = pozycje.map((s) => graniceUdzialu(s, ptaki));
  const cel = (test: PozycjaMieszanki[]) => kosztMieszanki(test) * 0.3 + bladNormy(test, norma) * 100;
  const cena = (s: PozycjaMieszanki) => parseFloat(pole(s, "cena") as string);

  let najlepsze = startowe(pozycje, granice);
  let najlepszyWynik = cel(najlepsze);

  for (let n = 0; n < iteracje; n++) {
    const test = najlepsze.map((s) => ({ ...s }));
    const wybierz = () => {
      if (losuj() < 0.7) {
        const top3 = test
          .map((s, idx) => ({ idx, c: cena(s) }))
          .sort((a, b) => a.c - b.c)
          .slice(0, Math.min(3, test.length));
        return top3[Math.floor(losuj() * top3.length)].idx;
      }
      return Math.floor(losuj() * test.length);
    };
    const i1 = wybierz();
    let i2 = wybierz();
    while (i2 === i1 && test.length > 1) i2 = wybierz();

    let zmiana = losuj() * 15 - 5;
    zmiana = cena(test[i1]) < cena(test[i2]) ? Math.abs(zmiana) : -Math.abs(zmiana);
    test[i1].procent = Math.max(0.5, Math.min(95, test[i1].procent + zmiana));
    test[i2].procent = Math.max(0.5, Math.min(95, test[i2].procent - zmiana));
    wGranicach(test, granice);

    const wynik = cel(test);
    if (wynik < najlepszyWynik) {
      najlepszyWynik = wynik;
      najlepsze = test;
    }
  }
  return najlepsze;
}

/**
 * SUROWCE, po których sugestie poznają, czego w mieszance brakuje.
 *
 * POPRAWKA z 21.10.2026: wcześniej sprawdzane były nazwy „Fosforan wapnia"
 * i „Olej roślinny", a w bazie 124 surowców są „Fosforan dwuwapniowy" (i jedno-,
 * trójwapniowy) oraz „Olej rzepakowy". Mieszanka z fosforanem dostawała więc
 * radę „dodaj fosforan wapnia". Teraz fosforan i olej rozpoznawane są po
 * początku nazwy.
 */
const ZBOZA = ["Pszenica", "Kukurydza", "Jęczmień", "Owies"];
// Śruty rozpoznawane po początku nazwy, bo w bazie są „Śruta poekstrakcyjna
// rzepakowa 00” i podobne (poprawka 24.10.2026, wcześniej łapała tylko sojową).
const STRACZKOWE_BIALKO = ["Groch", "Bobik", "Peluszka", "Soja", "Łubin żółty", "Łubin niebieski wąskolistny"];

/**
 * PASZA Z JEDNEGO SKŁADNIKA (prośba Marka 24.10.2026). Ktoś może mieć tylko pszenicę.
 * Wtedy pokazujemy, czego w niej brakuje, zachęcamy do innych składników i dajemy
 * opcję: osobne karmidło z mieszanką mineralno-witaminową, gotową albo zrobioną
 * samemu (sposób Marka: żwirek, kreda i premiks w wiaderku w kurniku albo na wybiegu).
 * Ta sama treść idzie do kalkulatora (ramka w wyniku) i do MCP (pole sugestie).
 */
export interface JedenSkladnik {
  nazwa: string;
  /** Główne parametry poniżej normy, z procentem normy. */
  braki: { pole: PoleNormy; procentNormy: number }[];
  nioski: boolean;
  /**
   * Gotowe mieszanki do osobnego karmidła z bazy dodatków (kategoria KATEGORIA_OSOBNE_KARMIDLO),
   * dla tego gatunku, najwyżej 2, od najtańszej za kg. Partner nie zmienia kolejności.
   */
  gotowe: { nazwa: string; producent?: string; oferta?: OfertaDodatku & { cenaZaKg: number }; partner?: boolean }[];
}

/** Gatunek z etykiety dodatku (Gatunek w dodatkiPaszowe.ts) dla gatunku i okresu z norm. */
function gatunekEtykiety(drob: string | undefined, okres: string): string | null {
  if (!drob) return null;
  if (drob.startsWith("kury-nioski")) return grupaPtakow(drob, okres) === "nioski" ? "nioski" : "odchow";
  return drob === "gesi" || drob === "kaczki" || drob === "indyki" || drob === "brojlery" ? drob : null;
}

const DOPELNIACZ: Partial<Record<PoleNormy, string>> = {
  em: "energii", bialko: "białka", ca: "wapnia", p: "fosforu", wlokno: "włókna", na: "sodu",
};

/** Jedyny składnik z udziałem w mieszance albo null, gdy jest ich więcej (lub żaden). */
export function jedenSkladnik(
  pozycje: PozycjaMieszanki[], norma: NormaDrobiu, ptaki: Ptaki, baza: SurowiecDoUzupelnien[] = [],
): JedenSkladnik | null {
  const zUdzialem = pozycje.filter((s) => liczba(s.procent) > 0);
  if (zUdzialem.length !== 1) return null;
  const sam = [{ ...zUdzialem[0], procent: 100 }];
  const braki = (Object.keys(DOPELNIACZ) as PoleNormy[]).flatMap((pole) => {
    const n = (norma as unknown as Record<string, number | undefined>)[pole];
    if (!n) return [];
    const w = zawartosc(sam, pole);
    return sprawdzNorme(w, n, TOLERANCJE[pole]) === "za-nisko" ? [{ pole, procentNormy: Math.round((100 * w) / n) }] : [];
  });
  const { drob, okres } = rozloz(ptaki);
  const gatunek = gatunekEtykiety(drob, okres);
  const gotowe = baza
    .filter((s) => s.kategoria === KATEGORIA_OSOBNE_KARMIDLO
      && (!s.gatunki?.length || (gatunek != null && s.gatunki.includes(gatunek))))
    .map((s) => {
      const o = najtanszaOferta(s.oferty);
      return {
        nazwa: s.nazwa,
        ...(s.producent ? { producent: s.producent } : {}),
        ...(o ? { oferta: { ...o, cenaZaKg: cenaZaKg(o) } } : {}),
        ...(s.partner ? { partner: true } : {}),
      };
    })
    // Od najtańszej za kg, bez ceny na końcu; pole partner nie wchodzi do sortowania.
    .sort((a, b) => (a.oferta?.cenaZaKg ?? Infinity) - (b.oferta?.cenaZaKg ?? Infinity) || a.nazwa.localeCompare(b.nazwa, "pl"))
    .slice(0, 2);
  return { nazwa: zUdzialem[0].nazwa, braki, nioski: grupaPtakow(drob, okres) === "nioski", gotowe };
}

/** Akapity podpowiedzi dla paszy z jednego składnika (bez emotek i strzałek, każdy klient je obuduje). */
export function opisJednegoSkladnika(j: JedenSkladnik): {
  sklad: string; inne: string; karmidlo: string; gotowe: string | null; sposob: string; bialko: string | null;
} {
  const braki = j.braki.map((b) => `${DOPELNIACZ[b.pole]} (${b.procentNormy}% normy)`).join(", ");
  const cenaPL = (n: number) => n.toFixed(2).replace(".", ",");
  return {
    gotowe: j.gotowe.length
      ? "Gotowe z naszej bazy: " + j.gotowe.map((g) => g.nazwa
        + (g.oferta ? ` (od ${cenaPL(g.oferta.cenaZaKg)} zł/kg w ${g.oferta.sklep}, cena z ${g.oferta.sprawdzono})` : "")
        + (g.partner ? ", partner serwisu" : "")).join("; ") + "."
      : null,
    sklad: braki
      ? `W mieszance jest tylko „${j.nazwa}”. Za mało w niej ${braki}.`
      : `W mieszance jest tylko „${j.nazwa}”. Główne parametry są w normie, ale witamin i mikroelementów jeden składnik zwykle nie da.`,
    inne: "Najlepiej dodaj inne składniki: źródło białka (śruta, groch, bobik) i dodatki mineralne. Jeden składnik rzadko ma wszystko, czego ptak potrzebuje, a braki widać potem w nieśności, skorupkach i wzroście. Propozycje są przy brakach w wyniku.",
    karmidlo: "Masz tylko ten jeden składnik? Postaw obok w osobnym karmidle mieszankę mineralno-witaminową: gotową z worka dla drobiu albo zrobioną samemu.",
    sposob: "Sposób autora serwisu: drobny żwirek wymieszany z kredą pastewną i premiksem witaminowym albo mineralno-witaminowym, w wiaderku w kurniku albo na wybiegu. "
      + (j.nioski
        ? "Nioski same biorą z niego tyle wapnia, ile potrzebują na skorupki."
        : "Ptakom, które nie niosą, daj w nim mniej kredy: nadmiar wapnia szkodzi ich nerkom."),
    bialko: j.braki.some((b) => b.pole === "bialko")
      ? "Osobne karmidło nie uzupełni białka. Bez niego kury niosą mniej, a młode ptaki wolniej rosną."
      : null,
  };
}

/** `baza`: surowce i produkty, z których ramka jednego składnika weźmie gotowe mieszanki do karmidła. */
export function generujSugestie(
  pozycje: PozycjaMieszanki[], norma: NormaDrobiu, ptaki: Ptaki, baza: SurowiecDoUzupelnien[] = [],
): string[] {
  const sugestie: string[] = [];
  const jeden = jedenSkladnik(pozycje, norma, ptaki, baza);
  if (jeden) {
    const o = opisJednegoSkladnika(jeden);
    sugestie.push(`🌾 PASZA Z JEDNEGO SKŁADNIKA:\n→ ${[o.sklad, o.inne, o.karmidlo, o.gotowe, o.sposob, o.bialko].filter(Boolean).join("\n→ ")}`);
  }
  const em = zawartosc(pozycje, "em");
  const bialko = zawartosc(pozycje, "bialko");
  const ca = zawartosc(pozycje, "ca");
  const p = zawartosc(pozycje, "p");

  // Produkt z bazy dodatków liczy się jak jego surowiec wzorcowy (kreda z worka to kreda).
  const ma = (nazwy: string[]) =>
    pozycje.some((s) => nazwy.includes(s.nazwa) || nazwy.includes(dodatekPoNazwie(s.nazwa)?.odpowiednik ?? ""));
  const maZboza = ma(ZBOZA);
  const maSrute = pozycje.some((s) => s.nazwa.startsWith("Śruta"));
  // Koncentrat białkowy (np. Rolpol 30%) to źródło białka, nie trzeba do niego dokupować śruty.
  const maKoncentrat = pozycje.some((s) => dodatekPoNazwie(s.nazwa)?.kategoria === "Koncentraty");
  const maBialko = maSrute || maKoncentrat || ma(STRACZKOWE_BIALKO);
  const maKrede = ma(["Kreda pastewna"]);
  const maFosforan = pozycje.some((s) => s.nazwa.startsWith("Fosforan"));
  const maOlej = pozycje.some((s) => s.nazwa.startsWith("Olej"));

  const { drob, okres } = rozloz(ptaki);
  const nioski = grupaPtakow(drob, okres) === "nioski";

  // Surowce ponad zalecane maksimum dla tych ptaków, z ryzykiem dla zdrowia
  // (src/data/udzialySurowcow.ts). Przekroczyć wolno, ale trzeba wiedzieć, czym to grozi.
  for (const s of pozycje) {
    const maks = maksUdzialu(s.nazwa, ptaki);
    if (maks != null && liczba(s.procent) > maks + 0.05) {
      const ryzyko = udzialSurowca(s.nazwa)?.ostrzezenie ?? "";
      sugestie.push(`⚠️ ${s.nazwa.toUpperCase()} POWYŻEJ ZALECANEGO UDZIAŁU:\n→ W mieszance ${liczba(s.procent).toFixed(1)}%, zalecane najwyżej ${maks}% dla tych ptaków\n→ ${ryzyko}`);
    }
  }

  const ocenaEm = sprawdzNorme(em, norma.em, 0.05);
  if (ocenaEm === "za-nisko") {
    if (!maZboza) {
      sugestie.push("⚡ ENERGIA ZA NISKA:\n→ Dodaj zboża (kukurydza, pszenica, owies) - są głównym źródłem energii");
    } else if (!maOlej) {
      sugestie.push("⚡ ENERGIA ZA NISKA:\n→ Rozważ dodanie oleju roślinnego (1-2%) - szybko podniesie energię\n→ Lub zwiększ udział kukurydzy (najwyższa energia)\n→ Ziemniaki gotowane też są dobrym źródłem energii");
    } else {
      sugestie.push("⚡ ENERGIA ZA NISKA:\n→ Zwiększ udział kukurydzy, ziemniaków lub oleju roślinnego\n→ Zmniejsz udział otrębów i owsa (mają mniej energii)");
    }
  } else if (ocenaEm === "za-wysoko") {
    sugestie.push("⚡ ENERGIA ZA WYSOKA:\n→ Zmniejsz udział kukurydzy, ziemniaków lub oleju\n→ Zwiększ udział otrębów pszennych, owsa lub jęczmienia");
  }

  const ocenaBialko = sprawdzNorme(bialko, norma.bialko, 0.05);
  if (ocenaBialko === "za-nisko") {
    if (!maBialko) {
      sugestie.push("🥜 BIAŁKO ZA NISKIE:\n→ KONIECZNIE dodaj źródło białka:\n  • Śruta sojowa (~46% białka) - najlepsze źródło\n  • Śruta słonecznikowa (~32% białka)\n  • Bobik (~27% białka) - dobra polska alternatywa\n  • Groch (~23% białka)\n⚠️ Groch i bobik tylko w zalecanej ilości dla tego wieku (młode ptaki najwyżej 5%)");
    } else if (!maSrute) {
      sugestie.push("🥜 BIAŁKO ZA NISKIE:\n→ Zwiększ udział grochu lub bobiku (w zalecanych granicach dla wieku)\n→ Lub dodaj śrutę (sojową, rzepakową, słonecznikową) - mają więcej białka");
    } else {
      sugestie.push("🥜 BIAŁKO ZA NISKIE:\n→ Zwiększ udział śruty lub roślin strączkowych\n→ Zmniejsz udział zbóż");
    }
  } else if (ocenaBialko === "za-wysoko") {
    sugestie.push("🥜 BIAŁKO ZA WYSOKIE:\n→ Zmniejsz udział śruty lub roślin strączkowych\n→ Zwiększ udział zbóż (pszenica, kukurydza, owies)");
  }

  const ocenaCa = sprawdzNorme(ca, norma.ca, 0.1);
  if (ocenaCa === "za-nisko") {
    if (!maKrede) {
      // Bez liczb w tekście: ile dodać, liczą propozycje uzupełnienia. Do 24.10.2026 stało tu
      // „kreda 2–4%”, a propozycja obok podawała 9,9% (audyt przed zgłoszeniem do OpenAI).
      sugestie.push("🦴 WAPŃ ZA NISKI:\n→ KONIECZNIE dodaj kredę pastewną albo mielone muszle\n→ Ile dokładnie, podaję w propozycjach uzupełnienia przy wapniu\n→ Bez wapnia kury nie będą miały mocnych skorupek!");
    } else {
      sugestie.push("🦴 WAPŃ ZA NISKI:\n→ Zwiększ udział kredy pastewnej\n→ Dla kur niosek to bardzo ważne!");
    }
  } else if (ocenaCa === "za-wysoko") {
    // Hy-Line, Technical Update „Gout”: nadmiar wapnia u ptaków, które nie niosą, niszczy nerki.
    sugestie.push(nioski
      ? "🦴 WAPŃ ZA WYSOKI:\n→ Zmniejsz udział kredy pastewnej\n→ Nadmiar wapnia może zaburzać wchłanianie innych składników"
      : "🦴 ZA DUŻO WAPNIA DLA PTAKÓW, KTÓRE NIE NIOSĄ:\n→ Zmniejsz udział kredy pastewnej\n→ Długo podawany nadmiar wapnia niszczy nerki młodych ptaków (dna moczanowa)\n→ Nie karm ich paszą dla niosek");
  }

  // Sól: zdrowotnie groźna dopiero wyraźnie ponad normę, stąd próg 1,5 × norma, a nie zwykła tolerancja.
  const na = zawartosc(pozycje, "na");
  if (norma.na && na > norma.na * 1.5) {
    sugestie.push(`🧂 ZA DUŻO SOLI:\n→ Sód ${na.toFixed(2)}% przy normie ${norma.na}%\n→ Ptaki dużo piją i mają mokre odchody, bez stałego dostępu do wody grozi zatrucie solą\n→ Zmniejsz udział soli kuchennej`);
  }

  const ocenaP = sprawdzNorme(p, norma.p, 0.1);
  if (ocenaP === "za-nisko") {
    if (!maFosforan) {
      sugestie.push("⚗️ FOSFOR ZA NISKI:\n→ Dodaj fosforan wapnia, np. jedno- albo dwuwapniowy\n→ Ile dokładnie, podaję w propozycjach uzupełnienia przy fosforze\n→ Fosfor jest kluczowy dla metabolizmu i kości");
    } else {
      sugestie.push("⚗️ FOSFOR ZA NISKI:\n→ Zwiększ udział fosforanu\n→ Możesz też zwiększyć śrutę - zawiera fosfor");
    }
  } else if (ocenaP === "za-wysoko") {
    sugestie.push("⚗️ FOSFOR ZA WYSOKI:\n→ Zmniejsz udział fosforanu\n→ Nadmiar fosforu obciąża nerki");
  }

  if (sugestie.length > 0) {
    const brakujace: string[] = [];
    if (!maZboza) brakujace.push("zboża (pszenica/kukurydza/owies)");
    if (!maBialko) brakujace.push("źródło białka (śruta/groch/bobik)");
    if (!maKrede && norma.ca > 1.5) brakujace.push("kreda pastewna");
    if (!maFosforan) brakujace.push("fosforan wapnia (np. dwuwapniowy)");
    if (brakujace.length > 0) sugestie.push("📋 BRAKUJĄCE SKŁADNIKI:\n→ " + brakujace.join("\n→ "));
  }

  return sugestie;
}

/**
 * Propozycja uzupełnienia braku (od 24.10.2026): czym i ile dodać, żeby parametr
 * doszedł do normy. Liczone na sucho, bez doboru: surowiec dochodzi w `dodajProc`,
 * a reszta mieszanki maleje proporcjonalnie. To szacunek do decyzji, dokładne
 * proporcje i tak wyrówna dobór.
 */
export interface Uzupelnienie {
  nazwa: string;
  /** Zawartość parametru w surowcu (w jednostkach normy). */
  wartosc: number;
  /** Ile dodać, % mieszanki (dla premiksu w stałej dawce: jego dawka z etykiety). */
  dodajProc: number;
  /** Czy przy tej ilości parametr dochodzi do normy (premiks w swojej dawce może nie domknąć). */
  domyka: boolean;
  /** Surowiec już jest w mieszance, propozycja to zwiększenie jego udziału. */
  juzJest: boolean;
  /** Parametry, które po dodaniu wyjdą ponad normę. */
  przekroczy: { pole: PoleNormy; wynik: number; norma: number }[];
  /** Produkt z bazy dodatków (od 24.10.2026): producent z etykiety. Brak = surowiec wzorcowy bez marki. */
  producent?: string;
  /** Najtańsza za kg oferta produktu. */
  oferta?: OfertaDodatku & { cenaZaKg: number };
  /** Ile dodatek kosztuje w 1 kg mieszanki, zł. null bez ceny. */
  kosztNaKgPaszyZl: number | null;
  /** Ile kosztuje na jednego ptaka przez 30 dni, zł. null bez ceny albo bez dawki paszy. */
  kosztNaPtakaMiesiecznieZl: number | null;
  /** Producent płaci za obecność w bazie. Tylko do jawnego oznaczenia: na kolejność nie wpływa. */
  partner?: boolean;
}

/** Surowiec albo produkt, z którego propozycje „czym uzupełnić” mogą wybierać. */
export type SurowiecDoUzupelnien = PozycjaMieszanki & {
  kategoria?: string;
  producent?: string;
  oferty?: OfertaDodatku[];
  partner?: boolean;
  /** Surowiec wzorcowy tego samego rodzaju (src/data/dodatkiPaszowe.ts). */
  odpowiednik?: string;
  dawkaProcOd?: number | null;
  dawkaProcDo?: number | null;
  /** Dawka z etykiety w g na sztukę dziennie (gdy etykieta nie podaje %). */
  dawkaGDziennie?: number | null;
  /** Dla kogo według etykiety (Gatunek w dodatkiPaszowe.ts); pusta lista = dla drobiu ogólnie. */
  gatunki?: string[];
};

/**
 * Koszt dodatku na ptaka przez 30 dni: udział × dawka paszy na ptaka × 30 dni × cena za kg.
 * Ta sama liczba na stronie i w MCP.
 */
export const kosztNaPtakaMiesiecznie = (procent: number, dawkaG: number, cenaKgZl: number): number =>
  (procent / 100) * (dawkaG / 1000) * 30 * cenaKgZl;

// Przetworzone białko zwierzęce ma ograniczenia prawne w żywieniu zwierząt
// gospodarskich (rozp. 999/2001), więc go nie podpowiadamy, nawet jeśli jest w bazie.
// Koncentraty i gotowe mieszanki to nie dodatki, tylko inna pasza.
const NIE_PODPOWIADAJ = /^(Mączka (mięsn|kostna|z krwi|z piór|KAMBAS)|Superkoncentrat|Koncentrat)/;
// Produktów z kuchni też nie: to nie dodatek, tylko to, co hodowca i tak daje.
// Mieszanki do osobnego karmidła nie wchodzą do paszy: proponuje je ramka „Pasza z jednego składnika”.
const KATEGORIE_POMIJANE = new Set(["Gotowe mieszanki (pełnoporcjowe)", "Koncentraty", KATEGORIA_Z_KUCHNI, KATEGORIA_OSOBNE_KARMIDLO]);
// Więcej niż tyle procent jednego surowca to już przebudowa mieszanki, a nie
// uzupełnienie. Dla minerałów mniej: inaczej na brak sodu wychodziła serwatka w proszku 23%.
const MAKS_UZUPELNIENIA = 25;
const MAKS_UZUPELNIENIA_MINERALU = 12;
const MINERALY = new Set<PoleNormy>(["ca", "p", "na", "k", "mg", "mn", "zn", "se", "fe", "i"]);
// Pasze zwierzęce (mączka rybna) wolno, ale drożej i z ryzykiem zapachu jaj: dalej w kolejce.
const KATEGORIA_ZWIERZECA = "Pasze pochodzenia zwierzęcego";

type Kandydat = Uzupelnienie & { kara: number; rodzaj: string };

/** Tańsze wyżej; bez ceny na końcu (nie wiemy, ile kosztuje, więc nie udajemy, że tanio). */
const poKoszcie = (a: Kandydat, b: Kandydat) =>
  (a.kosztNaKgPaszyZl ?? Infinity) - (b.kosztNaKgPaszyZl ?? Infinity);

/**
 * Do dwóch propozycji, czym uzupełnić brak parametru `parametr`, z bazy surowców
 * i produktów z bazy dodatków. Dwie, nie więcej (decyzja Marka 24.10.2026): przy
 * długiej liście wygląda to jak nasza rekomendacja, a z czasem, gdy w bazie będzie
 * więcej firm, wybór i tak się poszerzy.
 *
 * Kolejność WYŁĄCZNIE po wartościach odżywczych i cenie, nigdy po polu `partner`:
 * 1. najpierw te, które nie wypchną innego parametru ponad normę ani udziału ponad
 *    zalecane maksimum (kara), 2. potem najmniejsza potrzebna ilość (z dokładnością
 *    do 10%), 3. potem koszt w 1 kg mieszanki; bez ceny za tymi z ceną.
 * Z jednego rodzaju (kreda z kilku worków i „Kreda pastewna” z tabel) zostaje jedna
 * pozycja: to, co już jest w mieszance, a inaczej najtańsza w przeliczeniu na kg
 * mieszanki. Dzięki temu dwa miejsca to dwa różne rodzaje, a nie dwie kredy.
 *
 * Premiksy i dodatki w stałej dawce tylko w dawce z etykiety albo znanej z nazwy;
 * pozostałe produkty najwyżej w górnej dawce z etykiety.
 * `dawkaG` (pasza na ptaka dziennie, g) daje koszt na ptaka przez 30 dni.
 */
export function uzupelnienia(
  pozycje: PozycjaMieszanki[],
  norma: NormaDrobiu,
  ptaki: Ptaki,
  baza: SurowiecDoUzupelnien[],
  parametr: PoleNormy,
  ile = 2,
  dawkaG = 0,
): Uzupelnienie[] {
  const cel = (norma as unknown as Record<string, number | undefined>)[parametr];
  const obecnie = zawartosc(pozycje, parametr);
  if (!cel || obecnie >= cel) return [];
  const naliczone = pozycje.filter((s) => liczba(s.procent) > 0);
  const suma = naliczone.reduce((a, s) => a + liczba(s.procent), 0);
  if (suma <= 0) return [];
  const oceny = (m: PozycjaMieszanki[]) =>
    POLA_NORM.map((p) => {
      const n = (norma as unknown as Record<string, number | undefined>)[p];
      return n ? sprawdzNorme(zawartosc(m, p), n, TOLERANCJE[p]) : "ok";
    });
  const przed = oceny(naliczone);
  const limit = MINERALY.has(parametr) ? MAKS_UZUPELNIENIA_MINERALU : MAKS_UZUPELNIENIA;

  const propozycje: Kandydat[] = [];
  for (const s of baza) {
    const v = liczba(pole(s, parametr));
    if (v <= cel || NIE_PODPOWIADAJ.test(s.nazwa) || KATEGORIE_POMIJANE.has(s.kategoria ?? "")) continue;
    const maks = maksUdzialu(s.nazwa, ptaki);
    if (maks === 0) continue;

    // Premiks w stałej dawce: liczymy, co da w dawce z etykiety. Sól też ma stałą
    // dawkę w doborze, ale przy uzupełnianiu to właśnie jej ilość się zmienia.
    const stala = udzialSurowca(s.nazwa)?.stalaDawka === true;
    // Udział surowca, który już jest w mieszance. Strona dosypuje propozycję do jego wiersza,
    // więc dawka z etykiety i zalecane maksimum dotyczą sumy, nie samej dokładki (recenzja
    // Codex do PR #1: przy 3,5% muszli OYTA proponowało jeszcze 4%, razem 7,5% przy etykiecie 4%).
    const obecny = naliczone.find((p) => p.nazwa === s.nazwa);
    const juzJest = !!obecny;
    const obecnyUdzial = obecny ? (100 * liczba(obecny.procent)) / suma : 0;
    let x: number;
    let wDawceEtykiety = stala;
    if (stala) {
      // Premiks już jest w swojej dawce: „więcej o całą dawkę” to podwójny premiks.
      if (juzJest) continue;
      x = dawkaDomyslna(s.nazwa);
      if (!x) continue;
    } else {
      x = (100 * (cel - obecnie)) / (v - obecnie);
      // Produkt z dawką z etykiety: nie więcej niż jej górna granica, nawet gdy wtedy nie
      // domknie braku. Dawka w g na sztukę liczy się na % przy znanej dawce paszy, a bez niej
      // produktu nie proponujemy, bo nie wiemy, czy ilość zmieści się w etykiecie.
      // Dolnej granicy nie wymuszamy: surowiec w mniejszej ilości niż „od” niczemu nie szkodzi.
      let doo = s.dawkaProcDo ?? s.dawkaProcOd ?? null;
      if (doo == null && s.dawkaGDziennie != null) {
        if (!(dawkaG > 0)) continue;
        doo = (100 * s.dawkaGDziennie) / dawkaG;
      }
      if (doo != null) {
        const zostalo = doo - obecnyUdzial;
        if (zostalo <= 0.05) continue;
        if (x > zostalo) { x = zostalo; wDawceEtykiety = true; }
      }
      if (x > limit) continue;
    }

    // Mieszanka po dodaniu: dotychczasowe składniki razem na (100 - x)%, nowy na x%.
    const skala = (100 - x) / suma;
    const po = [...naliczone.map((p) => ({ ...p, procent: liczba(p.procent) * skala })), { ...s, procent: x }];
    const wynikPo = oceny(po);
    const przekroczy = POLA_NORM.flatMap((p, i) =>
      wynikPo[i] === "za-wysoko" && przed[i] !== "za-wysoko"
        ? [{ pole: p, wynik: zawartosc(po, p), norma: (norma as unknown as Record<string, number>)[p] }]
        : []);
    const ponadMaks = maks != null && obecnyUdzial + x > maks + 0.05;
    const domyka = zawartosc(po, parametr) >= cel * 0.999;

    const najtansza = najtanszaOferta(s.oferty);
    const cenaKg = najtansza ? cenaZaKg(najtansza) : null;
    propozycje.push({
      nazwa: s.nazwa, wartosc: v, dodajProc: x, domyka, juzJest, przekroczy,
      ...(s.producent ? { producent: s.producent } : {}),
      ...(najtansza && cenaKg != null ? { oferta: { ...najtansza, cenaZaKg: cenaKg } } : {}),
      kosztNaKgPaszyZl: cenaKg != null ? (x / 100) * cenaKg : null,
      kosztNaPtakaMiesiecznieZl: cenaKg != null && dawkaG > 0 ? kosztNaPtakaMiesiecznie(x, dawkaG, cenaKg) : null,
      ...(s.partner ? { partner: true } : {}),
      rodzaj: s.odpowiednik ?? s.nazwa,
      kara: przekroczy.length + (ponadMaks ? 10 : 0) + (wDawceEtykiety && !domyka ? 1 : 0)
        + (s.kategoria === KATEGORIA_ZWIERZECA ? 0.5 : 0)
        // To, co już jest w mieszance, wygrywa z równie dobrym nowym surowcem: łatwiej dosypać niż kupić.
        - (juzJest ? 0.3 : 0),
    });
  }

  // Jeden przedstawiciel rodzaju: najmniejsza kara, potem najtańszy, potem najmniej potrzeba.
  const lepszyWRodzaju = (a: Kandydat, b: Kandydat) => a.kara - b.kara || poKoszcie(a, b) || a.dodajProc - b.dodajProc;
  const rodzaje = new Map<string, Kandydat>();
  for (const k of propozycje) {
    const obecny = rodzaje.get(k.rodzaj);
    if (!obecny || lepszyWRodzaju(k, obecny) < 0) rodzaje.set(k.rodzaj, k);
  }
  // Potrzebna ilość liczona od najmniejszej przy tej samej karze, w krokach co 10%: kreda
  // z 37,6% wapnia i muszle z 38% to dla hodowcy ta sama ilość (8,6% i 8,5% mieszanki),
  // więc o kolejności decyduje wtedy cena. Krok od najmniejszej, a nie stałe progi: przy
  // stałych progach dwie prawie równe ilości potrafiły wpaść po dwóch stronach granicy.
  const wybrane = [...rodzaje.values()];
  const najmniej = new Map<number, number>();
  for (const k of wybrane) najmniej.set(k.kara, Math.min(najmniej.get(k.kara) ?? Infinity, k.dodajProc));
  const krokIlosci = (k: Kandydat) => Math.floor(Math.log(k.dodajProc / najmniej.get(k.kara)!) / Math.log(1.1) + 1e-9);
  return wybrane
    .sort((a, b) => a.kara - b.kara || krokIlosci(a) - krokIlosci(b) || poKoszcie(a, b) || a.dodajProc - b.dodajProc)
    .slice(0, ile)
    .map(({ kara: _kara, rodzaj: _rodzaj, ...u }) => u);
}

// ── Koncentrat + Twoje zboże (od 24.10.2026) ────────────────────────────────

// Zboża, które etykiety koncentratów nazywają „śrutami zbożowymi”. Gryka to nie zboże.
const ZBOZE = /^(Pszenica|Pszenżyto|Jęczmień|Kukurydza|Owies|Żyto|Mąka (jęczmienna|kukurydziana) pastewna|mąka pszenna pastewna)/;

export const czyZboze = (nazwa: string) => ZBOZE.test(nazwa);

export interface UdzialyKoncentratu {
  /** Udział koncentratu w %. */
  koncentrat: number;
  /** Pozostałe dodatki z przepisu (śruta sojowa, kreda), w %. */
  inne: { nazwa: string; tekst: string; procent: number }[];
  /** Zboża użytkownika w jego proporcjach, razem tyle, ile zostaje do 100%. */
  zboza: { nazwa: string; procent: number }[];
  /** Cała mieszanka w kształcie wierszy, do oceny i do wstawienia do kalkulatora. */
  mieszanka: (PozycjaMieszanki & { procent: number })[];
}

export interface KoncentratZeZbozem {
  przepis: PrzepisKoncentratu;
  /** Proporcje z etykiety, ze zbożami użytkownika. */
  zEtykiety: UdzialyKoncentratu;
  /** Białko mieszanki ze zbożami użytkownika przy udziale z etykiety. */
  bialkoZEtykiety: number;
  /**
   * Udział koncentratu, przy którym białko mieszanki dochodzi do normy z TYMI zbożami
   * (kukurydza ma mniej białka niż pszenica, więc koncentratu trzeba więcej). null bez
   * normy albo gdy koncentrat nie ma więcej białka niż zboża.
   */
  doNormyBialka: UdzialyKoncentratu | null;
  /** Dodatki z przepisu, których nie ma w bazie surowców (nie wnoszą nic do bilansu). */
  nierozpoznane: string[];
}

/**
 * „Koncentrat + Twoje zboże”: dla koncentratu z przepisem w polu `stosowanie` liczy
 * mieszankę ze zbożami, które użytkownik ma w mieszance (w jego proporcjach; bez
 * udziałów po równo), i udział koncentratu potrzebny do normy białka przy tych zbożach.
 * Dodatki z przepisu (śruta sojowa, kreda) w dolnej dawce z etykiety. null, gdy
 * produkt nie ma przepisu albo w mieszance nie ma zbóż.
 */
export function koncentratZeZbozem(
  koncentrat: PozycjaMieszanki & { stosowanie?: string | null },
  pozycje: PozycjaMieszanki[],
  baza: PozycjaMieszanki[],
  norma?: NormaDrobiu | null,
): KoncentratZeZbozem | null {
  const przepis = przepisZeStosowania(koncentrat.stosowanie);
  if (!przepis) return null;
  const zboza = pozycje.filter((s) => s.nazwa && czyZboze(s.nazwa));
  if (!zboza.length) return null;
  const sumaZboz = zboza.reduce((a, s) => a + liczba(s.procent), 0);
  const udzialZboza = (s: PozycjaMieszanki) => (sumaZboz > 0 ? liczba(s.procent) / sumaZboz : 1 / zboza.length);

  const wBazie = (nazwa: string) => baza.find((b) => b.nazwa === nazwa);
  const inne = przepis.inne.map((d) => ({ ...d, wiersz: d.nazwa ? wBazie(d.nazwa) : undefined }));
  const sumaInnych = inne.reduce((a, d) => a + d.od, 0);

  const uloz = (c: number): UdzialyKoncentratu => {
    const naZboza = Math.max(0, 100 - c - sumaInnych);
    const z = zboza.map((s) => ({ ...s, procent: naZboza * udzialZboza(s) }));
    const dosypki = inne.map((d) => ({ nazwa: d.wiersz?.nazwa ?? d.tekst, tekst: d.tekst, procent: d.od }));
    return {
      koncentrat: c,
      inne: dosypki,
      zboza: z.map((s) => ({ nazwa: s.nazwa, procent: s.procent })),
      mieszanka: [
        { ...koncentrat, procent: c },
        ...inne.filter((d) => d.wiersz).map((d) => ({ ...d.wiersz!, procent: d.od })),
        ...z,
      ],
    };
  };

  const zEtykiety = uloz(przepis.koncentrat);
  let doNormyBialka: UdzialyKoncentratu | null = null;
  if (norma?.bialko) {
    // Białko liniowo zależy od udziału koncentratu c (reszta do 100% to zboża):
    // 100 × norma = c × Bk + Σ dosypek + (100 − c − dosypki) × Bz.
    const bk = liczba(pole(koncentrat, "bialko"));
    const bz = zboza.reduce((a, s) => a + udzialZboza(s) * liczba(pole(s, "bialko")), 0);
    const bInne = inne.reduce((a, d) => a + d.od * (d.wiersz ? liczba(pole(d.wiersz, "bialko")) : 0), 0);
    if (bk > bz) {
      const c = (100 * norma.bialko - bInne - (100 - sumaInnych) * bz) / (bk - bz);
      if (c > 0 && c < 100 - sumaInnych) doNormyBialka = uloz(c);
    }
  }
  return {
    przepis,
    zEtykiety,
    bialkoZEtykiety: zawartosc(zEtykiety.mieszanka, "bialko"),
    doNormyBialka,
    nierozpoznane: inne.filter((d) => !d.wiersz).map((d) => d.tekst),
  };
}

/** Stado do policzenia zapotrzebowania: liczba ptaków i dawka paszy w g na sztukę dziennie. */
export interface Stado {
  sztuk: number;
  dawkaG: number;
}

export interface ZapotrzebowanieSkladnika {
  nazwa: string;
  procent: number;
  dziennieKg: number;
  tygodniowoKg: number;
  miesiecznieKg: number;
}

/**
 * Ile paszy zje stado i ile każdego składnika na to trzeba (od 24.10.2026).
 * Miesiąc = 30 dni. Bez zaokrągleń: zaokrągla dopiero strona albo MCP.
 */
export function zapotrzebowanieStada(pozycje: PozycjaMieszanki[], stado: Stado) {
  const dziennieKg = (Math.max(0, stado.sztuk) * Math.max(0, stado.dawkaG)) / 1000;
  const skladniki: ZapotrzebowanieSkladnika[] = pozycje
    .filter((s) => liczba(s.procent) > 0)
    .map((s) => {
      const udzial = liczba(s.procent) / 100;
      return {
        nazwa: s.nazwa,
        procent: liczba(s.procent),
        dziennieKg: dziennieKg * udzial,
        tygodniowoKg: dziennieKg * udzial * 7,
        miesiecznieKg: dziennieKg * udzial * 30,
      };
    });
  return { dziennieKg, tygodniowoKg: dziennieKg * 7, miesiecznieKg: dziennieKg * 30, skladniki };
}
