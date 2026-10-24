/**
 * Kalkulator pasz dla drobiu jako narzedzia MCP: surowce, normy, ocena
 * mieszanki i dobor proporcji.
 *
 * TE SAME LICZBY I TEN SAM ALGORYTM CO NA STRONIE. Surowce: migawka
 * src/data/feedIngredients.ts (124 pozycje z arkusza Marka, z ktorego powstala
 * tez tabela feed_ingredients) i od 0.8.0 produkty z bazy dodatkow
 * (src/data/dodatkiPaszowe.ts: sklad z etykiety, oferty sklepow). Normy:
 * src/data/normyDrobiu.ts. Ocena, dobor i sugestie: src/lib/bilansPaszy.ts,
 * z ktorego korzysta src/pages/KalkulatorPasz.tsx.
 *
 * Jedyna roznica wobec strony: dobor proporcji uzywa generatora z ziarnem
 * zamiast Math.random i robi kilka podejsc. To samo pytanie daje wtedy te sama
 * odpowiedz, a model nie dostaje innego wyniku przy kazdym wywolaniu.
 */

import { feedIngredients as SUROWCE_PASZ, feedCategories } from '../../src/data/feedIngredients.ts';
import { SKLADNIKI_Z_KUCHNI, KATEGORIA_Z_KUCHNI } from '../../src/data/skladnikiZKuchni.ts';
import { DODATKI_PASZOWE, adresOferty, cenaZaKg, najtanszaOferta } from '../../src/data/dodatkiPaszowe.ts';
import { OPIS_GMO, opisEko, znacznikiSurowca } from '../../src/data/gmoEkoSurowcow.ts';

// Surowce paszowe, produkty z bazy dodatków (od 0.8.0: kreda z worka, premiks, koncentrat)
// i produkty z kuchni (od 0.7.0, skład przybliżony z tabel żywności), żeby można było
// policzyć mieszankę z konkretnym produktem albo z resztkami. Kalkulator na stronie ma te same.
const feedIngredients = [...SUROWCE_PASZ, ...DODATKI_PASZOWE, ...SKLADNIKI_Z_KUCHNI];
const PRODUKTY = new Set(DODATKI_PASZOWE.map((d) => d.nazwa));
import { NORMY_DROBIU, TYPY_DROBIU, dawkaTypowa } from '../../src/data/normyDrobiu.ts';
import {
  POLA_NORM, TOLERANCJE, zawartosc, sprawdzNorme, bladNormy, maksUdzialu,
  dobierzProporcje, najtanszaMieszanka, kosztMieszanki, generujSugestie,
  bladLimitow, osiagnieteLimity, zapotrzebowanieStada, uzupelnienia,
} from '../../src/lib/bilansPaszy.ts';
import { UDZIALY_SUROWCOW, GRUPY_PTAKOW, grupaPtakow, zalecenieUdzialu, udzialSurowca } from '../../src/data/udzialySurowcow.ts';

const ADRES_KALKULATORA = 'https://mojaserowarnia.pl/kalkulator-pasz?utm_source=magazyn';
const ADRES_UDZIALOW = 'https://mojaserowarnia.pl/pasze/udzial-surowcow?utm_source=magazyn';

/**
 * Zalecane udziały surowców dla grupy ptaków (od 0.5.0), z powodem i tym, co
 * jeszcze niepewne. Źródło liczb: src/data/udzialySurowcow.ts, to samo co
 * podstrona i kalkulator.
 */
function zaleceniaUdzialow(drob, okres) {
  const grupa = grupaPtakow(drob, okres);
  return {
    grupa: grupa ? GRUPY_PTAKOW[grupa] : null,
    surowce: UDZIALY_SUROWCOW.flatMap((u) => {
      const z = zalecenieUdzialu(u.nazwy[0], grupa);
      if (!z) return [];
      return [{
        surowiec: u.surowiec,
        nazwy_w_bazie: u.nazwy,
        maks_proc: z.maks,
        ...(z.maksZEnzymem != null ? { maks_z_enzymem_proc: z.maksZEnzymem } : {}),
        ...(z.zalecane ? { zalecane_proc: z.zalecane } : {}),
        powod: u.powod,
        ...(u.doPotwierdzenia ? { do_potwierdzenia: u.doPotwierdzenia } : {}),
      }];
    }),
    strona: ADRES_UDZIALOW,
  };
}

/**
 * Czym uzupełnić parametry poniżej normy (od 0.6.0): do dwóch surowców z bazy,
 * ile ich dodać do mieszanki i co przy tym wyjdzie ponad normę. Ta sama funkcja
 * co przyciski „Czym uzupełnić” w kalkulatorze na stronie. Od 0.8.0 także produkty
 * z bazy dodatków: producent, najtańsza oferta z datą ceny i koszt na ptaka przez
 * 30 dni (udział × dawka paszy × 30 dni × cena za kg). Kolejność tylko po składzie
 * i cenie; partner jest jawnie oznaczony, ale na nią nie wpływa.
 */
function uzupelnieniaBrakow(pozycje, norma, ptaki, dawkaG = 0) {
  const wynik = [];
  for (const pole of POLA_NORM) {
    if (norma[pole] == null || sprawdzNorme(zawartosc(pozycje, pole), norma[pole], TOLERANCJE[pole]) !== 'za-nisko') continue;
    const propozycje = uzupelnienia(pozycje, norma, ptaki, feedIngredients.map((s) => ({ ...s, procent: 0 })), pole, 2, dawkaG);
    if (!propozycje.length) continue;
    wynik.push({
      parametr: PARAMETRY[pole][0],
      propozycje: propozycje.map((u) => ({
        nazwa: u.nazwa,
        dodaj_proc: zaokr(u.dodajProc, u.dodajProc < 1 ? 2 : 1),
        ...(u.juzJest ? { juz_w_mieszance: true } : {}),
        ...(u.domyka ? {} : { nie_domyka: 'w dawce z etykiety nie wyrówna braku' }),
        ...(u.przekroczy.length ? { przekroczy_norme: u.przekroczy.map((p) => PARAMETRY[p.pole][0]) } : {}),
        ...(u.producent ? { producent: u.producent, karta: 'narzędzie dodatek z tą nazwą' } : {}),
        ...(u.oferta ? { najtansza_oferta: ofertaDlaModelu(u.oferta) } : {}),
        ...(u.kosztNaPtakaMiesiecznieZl != null ? { koszt_na_ptaka_30_dni_zl: zaokr(u.kosztNaPtakaMiesiecznieZl, 2) } : {}),
        ...(u.kosztNaKgPaszyZl != null ? { koszt_w_kg_paszy_zl: zaokr(u.kosztNaKgPaszyZl, 3) } : {}),
        ...(u.partner ? { partner_serwisu: true } : {}),
      })),
    });
  }
  return wynik;
}

/** Oferta sklepu w odpowiedzi MCP: link ze znacznikiem, cena za kg i data ceny. */
export function ofertaDlaModelu(o) {
  return {
    sklep: o.sklep,
    cena_zl: o.cenaZl,
    opakowanie_kg: o.opakowanieKg,
    cena_za_kg_zl: zaokr(cenaZaKg(o), 2),
    cena_z_dnia: o.sprawdzono,
    url: adresOferty(o.url),
  };
}

/** Składniki ponad zalecane maksimum, z ryzykiem dla zdrowia ptaków. */
function ponadZalecenia(pozycje, ptaki) {
  return pozycje.flatMap((s) => {
    const maks = maksUdzialu(s.nazwa, ptaki);
    if (maks == null || !(parseFloat(s.procent) > maks + 0.05)) return [];
    return [{ nazwa: s.nazwa, procent: zaokr(parseFloat(s.procent), 1), zalecane_maks_proc: maks, ryzyko: udzialSurowca(s.nazwa)?.ostrzezenie }];
  });
}

export const GATUNKI = Object.keys(NORMY_DROBIU);
export const KATEGORIE_SUROWCOW = [...feedCategories, KATEGORIA_Z_KUCHNI];

const stopka = () => ({
  zrodlo: `Moja Serowarnia, kalkulator pasz dla drobiu (${ADRES_KALKULATORA})`,
  licencja: 'CC BY 4.0: cytując, podaj źródło z linkiem',
  zastrzezenie: 'Normy z książki „Normy żywieniowe”, skład surowców wzorcowy. Kolejne partie dodatków i premiksów różnią się składem, więc wynik to obliczenie, nie porada lekarza weterynarii ani doradcy żywieniowego.',
});

// Opisy parametrow dla czlowieka. Klucze sa nazwami pol z feedIngredients.ts.
const PARAMETRY = {
  em: ['Energia metaboliczna', 'MJ/kg'],
  bialko: ['Białko ogólne', '%'],
  ca: ['Wapń', '%'],
  p: ['Fosfor', '%'],
  wlokno: ['Włókno', '%'],
  na: ['Sód', '%'],
  k: ['Potas', '%'],
  mg: ['Magnez', '%'],
  mn: ['Mangan', 'mg/kg'],
  zn: ['Cynk', 'mg/kg'],
  se: ['Selen', 'mg/kg'],
  fe: ['Żelazo', 'mg/kg'],
  i: ['Jod', 'mg/kg'],
};

// Liczone i podawane, ale bez oceny: norm dla nich nie ma (odlozone 1.09.2026,
// patrz pamiec dane-paszowe-kalkulatora). Aminokwasy jako % w paszy, ogolne, nie strawne.
const BEZ_NORMY = {
  tluszcz: ['Tłuszcz', '%'],
  lys: ['Lizyna', '%'],
  met: ['Metionina', '%'],
  metCys: ['Metionina + cystyna', '%'],
  trp: ['Tryptofan', '%'],
  thr: ['Treonina', '%'],
};

export const zaokr = (x, miejsc = 2) => (x == null ? null : Math.round(x * 10 ** miejsc) / 10 ** miejsc);

export function normalizuj(tekst) {
  return (tekst || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/gi, 'l')
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, ' ')
    .trim();
}

const etykietaGatunku = (drob) =>
  (TYPY_DROBIU.find((t) => t.value === drob)?.label ?? drob).replace(/^[^\p{L}]+/u, '');

/**
 * Surowiec po nazwie: najpierw dokladnie, potem jedyny pasujacy poczatek
 * albo fragment ("soja" -> tylko gdy pasuje do jednej pozycji). Przy kilku
 * trafieniach nie zgadujemy, tylko podajemy liste.
 */
function znajdzSurowiec(nazwa) {
  const szukane = normalizuj(nazwa);
  if (!szukane) return { blad: 'pusta nazwa' };
  const dokladny = feedIngredients.find((s) => normalizuj(s.nazwa) === szukane);
  if (dokladny) return { surowiec: dokladny };
  const poczatek = feedIngredients.filter((s) => normalizuj(s.nazwa).startsWith(szukane));
  if (poczatek.length === 1) return { surowiec: poczatek[0] };
  const fragment = feedIngredients.filter((s) => normalizuj(s.nazwa).includes(szukane));
  if (fragment.length === 1) return { surowiec: fragment[0] };
  const kandydaci = (poczatek.length ? poczatek : fragment).slice(0, 8).map((s) => s.nazwa);
  return { blad: kandydaci.length ? 'kilka pasujących surowców' : 'brak takiego surowca', kandydaci };
}

/** Okres po nazwie: dokladnie albo jedyny, ktorego nazwa zawiera podany tekst. */
export function znajdzNorme(drob, okres) {
  const okresy = NORMY_DROBIU[drob] ?? [];
  const szukane = normalizuj(okres);
  const dokladna = okresy.find((n) => normalizuj(n.okres) === szukane);
  if (dokladna) return { norma: dokladna };
  const pasujace = okresy.filter((n) => normalizuj(n.okres).includes(szukane));
  if (pasujace.length === 1) return { norma: pasujace[0] };
  return { blad: 'nie rozpoznałem okresu', dostepne_okresy: okresy.map((n) => n.okres) };
}

function bladWejscia(tresc) {
  return { blad: true, ...tresc, ...stopka() };
}

/** Rozwiazuje liste skladnikow z wejscia; przy pierwszym problemie zwraca blad dla modelu. */
function rozwiazSkladniki(wejscie) {
  const pozycje = [];
  const problemy = [];
  for (const w of wejscie) {
    const { surowiec, blad, kandydaci } = znajdzSurowiec(w.nazwa);
    if (!surowiec) {
      problemy.push({ podano: w.nazwa, problem: blad, kandydaci: kandydaci ?? [] });
      continue;
    }
    pozycje.push({ ...surowiec, procent: w.procent ?? 0, cena: w.cena ?? '', min: w.min_procent ?? '', max: w.max_procent ?? '' });
  }
  return { pozycje, problemy };
}

/** Wynik wobec normy dla kazdego parametru, ktory norma tego okresu ma. */
function ocenaMieszanki(pozycje, norma) {
  const w_normie = [];
  const poza_norma = [];
  for (const pole of POLA_NORM) {
    if (norma[pole] == null) continue;
    const [nazwa, jednostka] = PARAMETRY[pole];
    const wynik = zawartosc(pozycje, pole);
    const ocena = sprawdzNorme(wynik, norma[pole], TOLERANCJE[pole]);
    const wiersz = {
      parametr: nazwa,
      jednostka,
      wynik: zaokr(wynik, pole === 'mg' ? 3 : 2),
      norma: norma[pole],
      procent_normy: Math.round((wynik / norma[pole]) * 100),
      ocena: { ok: 'w normie', 'za-nisko': 'za nisko', 'za-wysoko': 'za wysoko' }[ocena],
      tolerancja_proc: Math.round(TOLERANCJE[pole] * 100),
    };
    (ocena === 'ok' ? w_normie : poza_norma).push(wiersz);
  }
  const bez_normy = Object.entries(BEZ_NORMY).map(([pole, [nazwa, jednostka]]) => ({
    parametr: nazwa, jednostka, wynik: zaokr(zawartosc(pozycje, pole), 3),
  }));
  return { poza_norma, w_normie, bez_normy };
}

/**
 * Ile paszy zje stado i ile każdego składnika kupić (od 0.4.0). Dawka z wejścia,
 * a bez niej typowa z poradnika rasy (src/data/normyDrobiu.ts), jeśli jest dla
 * tego okresu; inaczej prosimy model o dawkę zamiast zgadywać.
 */
function zapotrzebowanie(pozycje, drob, okres, stado) {
  if (!stado) return {};
  const typowa = dawkaTypowa(drob, okres);
  const dawkaG = stado.dawka_g ?? typowa?.g;
  if (!dawkaG) {
    return { zapotrzebowanie: { problem: 'brak dawki: podaj stado.dawka_g (g paszy na sztukę dziennie), dla tego okresu nie mamy typowej wartości z poradnika rasy' } };
  }
  const z = zapotrzebowanieStada(pozycje, { sztuk: stado.sztuk, dawkaG });
  return {
    zapotrzebowanie: {
      sztuk: stado.sztuk,
      dawka_g_na_sztuke: dawkaG,
      dawka_zrodlo: stado.dawka_g != null ? 'podana w pytaniu' : `${typowa.zrodlo} (${typowa.od}–${typowa.do} g), ${typowa.url}`,
      dziennie_kg: zaokr(z.dziennieKg, 2),
      tygodniowo_kg: zaokr(z.tygodniowoKg, 2),
      miesiecznie_30_dni_kg: zaokr(z.miesiecznieKg, 1),
      skladniki: z.skladniki.map((s) => ({
        nazwa: s.nazwa,
        dziennie_kg: zaokr(s.dziennieKg, 3),
        tygodniowo_kg: zaokr(s.tygodniowoKg, 2),
        miesiecznie_30_dni_kg: zaokr(s.miesiecznieKg, 2),
      })),
    },
  };
}

function raport(pozycje, norma, drob, uwagi = [], stado = null) {
  const wszystkieZCena = pozycje.every((s) => parseFloat(s.cena) > 0);
  const { poza_norma, w_normie, bez_normy } = ocenaMieszanki(pozycje, norma);
  const ptaki = { drob, okres: norma.okres };
  const ponad = ponadZalecenia(pozycje, ptaki);
  // Dawka paszy do kosztu na ptaka: ze stada, a bez niej typowa z poradnika rasy (nioski).
  const dawkaG = stado?.dawka_g ?? dawkaTypowa(drob, norma.okres)?.g ?? 0;
  const uzup = uzupelnieniaBrakow(pozycje, norma, ptaki, dawkaG);
  return {
    gatunek: etykietaGatunku(drob),
    okres: norma.okres,
    mieszanka: pozycje
      .filter((s) => parseFloat(s.procent) > 0)
      .map((s) => ({ nazwa: s.nazwa, procent: zaokr(parseFloat(s.procent), 1), cena_zl_kg: parseFloat(s.cena) > 0 ? parseFloat(s.cena) : null })),
    poza_norma,
    w_normie,
    bez_normy,
    koszt_zl_kg: wszystkieZCena ? zaokr(kosztMieszanki(pozycje)) : null,
    // Baza z produktami: ramka jednego składnika proponuje z niej gotowe mieszanki do osobnego karmidła.
    sugestie: generujSugestie(pozycje, norma, ptaki, feedIngredients.map((s) => ({ ...s, procent: 0 }))),
    ...(uzup.length ? { uzupelnienia: uzup } : {}),
    ...(ponad.length ? { ponad_zalecany_udzial: ponad } : {}),
    ...zapotrzebowanie(pozycje, drob, norma.okres, stado),
    uwagi,
    ...stopka(),
  };
}

export function skladnikiPaszy({ zapytanie, kategoria, pelny = false, limit = 15 }) {
  if (!zapytanie && !kategoria) {
    return {
      surowcow: feedIngredients.length,
      kategorie: KATEGORIE_SUROWCOW.map((k) => ({ kategoria: k, surowcow: feedIngredients.filter((s) => s.kategoria === k).length })),
      podpowiedz: 'Podaj zapytanie (np. "pszenica", "śruta", "kreda") albo kategorię.',
      ...stopka(),
    };
  }
  const slowa = normalizuj(zapytanie).split(' ').filter(Boolean);
  const trafione = feedIngredients.filter((s) =>
    (!kategoria || s.kategoria === kategoria) &&
    slowa.every((w) => normalizuj(s.nazwa).split(' ').some((x) => x.startsWith(w)) || normalizuj(s.kategoria).includes(w)));
  const pokaz = trafione.slice(0, limit).map((s) => {
    // GMO i eko (od 0.8.0): produkt z etykiety, surowiec wzorcowy z src/data/gmoEkoSurowcow.ts.
    const znaczniki = PRODUKTY.has(s.nazwa) ? s : znacznikiSurowca(s.nazwa);
    const najtansza = PRODUKTY.has(s.nazwa) ? najtanszaOferta(s.oferty) : null;
    const podstawa = {
      nazwa: s.nazwa, kategoria: s.kategoria,
      em_mj_kg: s.em, bialko_proc: s.bialko, ca_proc: s.ca, p_proc: s.p, wlokno_proc: s.wlokno,
      tluszcz_proc: s.tluszcz, lizyna_proc: s.lys, metionina_proc: s.met,
      gmo: OPIS_GMO[znaczniki.gmo], eko: opisEko(znaczniki.dopuszczalneEko),
      ...(PRODUKTY.has(s.nazwa) ? { producent: s.producent, najtansza_oferta: najtansza ? ofertaDlaModelu(najtansza) : null, karta: 'narzędzie dodatek' } : {}),
    };
    if (PRODUKTY.has(s.nazwa)) {
      // Pełny skład produktu bez pól karty (oferty, uwagi): te zwraca narzędzie dodatek.
      const { oferty: _o, uwagi: _u, zrodlo: _z, ...sklad } = s;
      return pelny || trafione.length === 1 ? { ...podstawa, sklad_pelny: sklad } : podstawa;
    }
    return pelny || trafione.length === 1 ? { ...podstawa, sklad_pelny: s } : podstawa;
  });
  return {
    znaleziono: trafione.length,
    pokazano: pokaz.length,
    surowce: pokaz,
    ...(trafione.length === 0 ? { podpowiedz: 'Brak trafień. Spróbuj jednego słowa, np. "groch" albo "fosforan".' } : {}),
    ...stopka(),
  };
}

export function normyDrobiu({ drob, okres }) {
  if (!drob) {
    return {
      gatunki: TYPY_DROBIU.map((t) => ({ drob: t.value, nazwa: etykietaGatunku(t.value), okresy: NORMY_DROBIU[t.value].map((n) => n.okres) })),
      jednostki: 'em MJ/kg; białko, Ca, P, tłuszcz, włókno, Na, K, Mg w %; Mn, Zn, Se, Fe, I w mg/kg',
      ...stopka(),
    };
  }
  if (!okres) {
    return { gatunek: etykietaGatunku(drob), drob, normy: NORMY_DROBIU[drob], ...stopka() };
  }
  const { norma, blad, dostepne_okresy } = znajdzNorme(drob, okres);
  if (!norma) return bladWejscia({ problem: blad, dostepne_okresy });
  const typowa = dawkaTypowa(drob, norma.okres);
  return {
    gatunek: etykietaGatunku(drob),
    drob,
    norma,
    ...(typowa ? { dawka_typowa_g_na_sztuke: { g: typowa.g, zakres: `${typowa.od}–${typowa.do}`, zrodlo: typowa.zrodlo, url: typowa.url } } : {}),
    zalecane_udzialy: zaleceniaUdzialow(drob, norma.okres),
    ...stopka(),
  };
}

export function policzMieszanke({ drob, okres, skladniki, stado }) {
  const { norma, blad, dostepne_okresy } = znajdzNorme(drob, okres);
  if (!norma) return bladWejscia({ problem: blad, dostepne_okresy });

  const { pozycje, problemy } = rozwiazSkladniki(skladniki);
  if (problemy.length) {
    return bladWejscia({ problem: 'nie rozpoznałem części składników', skladniki_do_poprawy: problemy, podpowiedz: 'Użyj skladniki_paszy, żeby znaleźć dokładną nazwę.' });
  }

  const uwagi = [];
  const suma = pozycje.reduce((s, p) => s + (parseFloat(p.procent) || 0), 0);
  if (suma <= 0) return bladWejscia({ problem: 'udziały sumują się do zera' });
  if (Math.abs(suma - 100) > 0.5) {
    pozycje.forEach((p) => { p.procent = ((parseFloat(p.procent) || 0) / suma) * 100; });
    uwagi.push(`Udziały sumowały się do ${zaokr(suma, 1)}%, przeliczyłem je proporcjonalnie na 100%.`);
  }
  return raport(pozycje, norma, drob, uwagi, stado);
}

/** Generator z ziarnem (mulberry32): powtarzalny wynik dla tego samego pytania. */
function generator(ziarno) {
  let a = ziarno >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ziarnoZ(tekst) {
  let h = 2166136261;
  for (let i = 0; i < tekst.length; i++) h = Math.imul(h ^ tekst.charCodeAt(i), 16777619);
  return h >>> 0;
}

const PODEJSC = 5;

export function dobierzProporcjeMieszanki({ drob, okres, skladniki, cel = 'normy', stado }) {
  const { norma, blad, dostepne_okresy } = znajdzNorme(drob, okres);
  if (!norma) return bladWejscia({ problem: blad, dostepne_okresy });

  const { pozycje, problemy } = rozwiazSkladniki(skladniki);
  if (problemy.length) {
    return bladWejscia({ problem: 'nie rozpoznałem części składników', skladniki_do_poprawy: problemy, podpowiedz: 'Użyj skladniki_paszy, żeby znaleźć dokładną nazwę.' });
  }
  if (pozycje.length === 0) return bladWejscia({ problem: 'potrzeba co najmniej 2 składników' });
  // Jeden składnik (np. sama pszenica, bo tylko ją ktoś ma): nie ma czego dobierać, więc liczymy
  // go jako 100% mieszanki. Sugestie mówią wtedy, czego brakuje, i podpowiadają osobne karmidło
  // z mieszanką mineralno-witaminową (prośba Marka 24.10.2026). Wcześniej był tu błąd.
  if (pozycje.length === 1) {
    pozycje[0].procent = 100;
    return raport(pozycje, norma, drob, ['Z jednego składnika nie ma czego dobierać: policzyłem go jako 100% mieszanki. W sugestiach jest, czego brakuje i jak to uzupełnić.'], stado);
  }
  if (cel === 'najtaniej' && !pozycje.every((p) => parseFloat(p.cena) > 0)) {
    return bladWejscia({ problem: 'cel "najtaniej" wymaga ceny (zł/kg) przy każdym składniku' });
  }
  const ptaki = { drob, okres: norma.okres };
  const sprzeczne = bladLimitow(pozycje, ptaki);
  if (sprzeczne) {
    return bladWejscia({
      problem: 'limity udziałów są sprzeczne',
      szczegoly: sprzeczne,
      podpowiedz: 'Dawkę premiksu, soli albo innego dodatku podaj jako min_procent i max_procent o tej samej wartości (dawka z etykiety). Sól bez dawki dostaje 0,3%.',
      zalecane_maks_proc: Object.fromEntries(pozycje.map((p) => [p.nazwa, maksUdzialu(p.nazwa, ptaki)])),
    });
  }

  const ziarno = ziarnoZ(JSON.stringify([drob, norma.okres, cel, pozycje.map((p) => [p.nazwa, p.cena, p.min, p.max])]));
  const wynikCelu = (m) => (cel === 'najtaniej' ? kosztMieszanki(m) * 0.3 + bladNormy(m, norma) * 100 : bladNormy(m, norma));
  let najlepsza = null;
  for (let n = 0; n < PODEJSC; n++) {
    const losuj = generator(ziarno + n);
    const m = cel === 'najtaniej'
      ? najtanszaMieszanka(pozycje, norma, ptaki, losuj)
      : dobierzProporcje(pozycje, norma, ptaki, losuj);
    if (!najlepsza || wynikCelu(m) < wynikCelu(najlepsza)) najlepsza = m;
  }

  // Jak na stronie: udzialy do jednego miejsca po przecinku.
  najlepsza.forEach((p) => { p.procent = Math.round(p.procent * 10) / 10; });

  const uwagi = [
    'Algorytm dobiera proporcje pod energię, białko, wapń i fosfor. Pozostałe parametry są policzone i ocenione, ale nie są dobierane.',
    `Każdy składnik trzyma się zalecanego maksymalnego udziału dla tego gatunku i wieku (lista z powodami: normy_drobiu, pole zalecane_udzialy; źródła: ${ADRES_UDZIALOW}). Własne limity: min_procent i max_procent przy składniku; ponad zalecane maksimum wynik ma pole ponad_zalecany_udzial z ryzykiem dla zdrowia ptaków.`,
  ];
  const osiagniete = osiagnieteLimity(najlepsza, ptaki);
  if (osiagniete.length) {
    uwagi.push(`Doszły do swojego maksimum: ${osiagniete.map((o) => `${o.nazwa} (${o.max}%)`).join(', ')}. Bez tego limitu algorytm dałby ich więcej.`);
  }
  if (najlepsza.some((p) => p.procent < 0.5)) {
    uwagi.push('Składnik z udziałem poniżej 0,5% algorytm praktycznie odrzucił; można go pominąć.');
  }
  return { cel, ...raport(najlepsza, norma, drob, uwagi, stado) };
}
