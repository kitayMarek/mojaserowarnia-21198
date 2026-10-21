/**
 * Kalkulator pasz dla drobiu jako narzedzia MCP: surowce, normy, ocena
 * mieszanki i dobor proporcji.
 *
 * TE SAME LICZBY I TEN SAM ALGORYTM CO NA STRONIE. Surowce: migawka
 * src/data/feedIngredients.ts (124 pozycje z arkusza Marka, z ktorego powstala
 * tez tabela feed_ingredients). Normy: src/data/normyDrobiu.ts. Ocena, dobor
 * i sugestie: src/lib/bilansPaszy.ts, z ktorego korzysta src/pages/KalkulatorPasz.tsx.
 *
 * Jedyna roznica wobec strony: dobor proporcji uzywa generatora z ziarnem
 * zamiast Math.random i robi kilka podejsc. To samo pytanie daje wtedy te sama
 * odpowiedz, a model nie dostaje innego wyniku przy kazdym wywolaniu.
 */

import { feedIngredients, feedCategories } from '../../src/data/feedIngredients.ts';
import { NORMY_DROBIU, TYPY_DROBIU } from '../../src/data/normyDrobiu.ts';
import {
  POLA_NORM, TOLERANCJE, zawartosc, sprawdzNorme, bladNormy, maxStraczkowe,
  dobierzProporcje, najtanszaMieszanka, kosztMieszanki, generujSugestie,
} from '../../src/lib/bilansPaszy.ts';

const ADRES_KALKULATORA = 'https://mojaserowarnia.pl/kalkulator-pasz?utm_source=magazyn';

export const GATUNKI = Object.keys(NORMY_DROBIU);
export const KATEGORIE_SUROWCOW = feedCategories;

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

const zaokr = (x, miejsc = 2) => (x == null ? null : Math.round(x * 10 ** miejsc) / 10 ** miejsc);

function normalizuj(tekst) {
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
function znajdzNorme(drob, okres) {
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
    pozycje.push({ ...surowiec, procent: w.procent ?? 0, cena: w.cena ?? '' });
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

function raport(pozycje, norma, drob, uwagi = []) {
  const wszystkieZCena = pozycje.every((s) => parseFloat(s.cena) > 0);
  const { poza_norma, w_normie, bez_normy } = ocenaMieszanki(pozycje, norma);
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
    sugestie: generujSugestie(pozycje, norma, norma.okres),
    limit_straczkowych_proc: maxStraczkowe(norma.okres),
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
    const podstawa = {
      nazwa: s.nazwa, kategoria: s.kategoria,
      em_mj_kg: s.em, bialko_proc: s.bialko, ca_proc: s.ca, p_proc: s.p, wlokno_proc: s.wlokno,
      tluszcz_proc: s.tluszcz, lizyna_proc: s.lys, metionina_proc: s.met,
    };
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
  return { gatunek: etykietaGatunku(drob), drob, norma, ...stopka() };
}

export function policzMieszanke({ drob, okres, skladniki }) {
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
  return raport(pozycje, norma, drob, uwagi);
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

export function dobierzProporcjeMieszanki({ drob, okres, skladniki, cel = 'normy' }) {
  const { norma, blad, dostepne_okresy } = znajdzNorme(drob, okres);
  if (!norma) return bladWejscia({ problem: blad, dostepne_okresy });

  const { pozycje, problemy } = rozwiazSkladniki(skladniki);
  if (problemy.length) {
    return bladWejscia({ problem: 'nie rozpoznałem części składników', skladniki_do_poprawy: problemy, podpowiedz: 'Użyj skladniki_paszy, żeby znaleźć dokładną nazwę.' });
  }
  if (pozycje.length < 2) return bladWejscia({ problem: 'potrzeba co najmniej 2 składników' });
  if (cel === 'najtaniej' && !pozycje.every((p) => parseFloat(p.cena) > 0)) {
    return bladWejscia({ problem: 'cel "najtaniej" wymaga ceny (zł/kg) przy każdym składniku' });
  }

  const ziarno = ziarnoZ(JSON.stringify([drob, norma.okres, cel, pozycje.map((p) => [p.nazwa, p.cena])]));
  const wynikCelu = (m) => (cel === 'najtaniej' ? kosztMieszanki(m) * 0.3 + bladNormy(m, norma) * 100 : bladNormy(m, norma));
  let najlepsza = null;
  for (let n = 0; n < PODEJSC; n++) {
    const losuj = generator(ziarno + n);
    const m = cel === 'najtaniej'
      ? najtanszaMieszanka(pozycje, norma, norma.okres, losuj)
      : dobierzProporcje(pozycje, norma, norma.okres, losuj);
    if (!najlepsza || wynikCelu(m) < wynikCelu(najlepsza)) najlepsza = m;
  }

  // Jak na stronie: udzialy do jednego miejsca po przecinku.
  najlepsza.forEach((p) => { p.procent = Math.round(p.procent * 10) / 10; });

  const uwagi = [
    'Algorytm dobiera proporcje pod energię, białko, wapń i fosfor. Pozostałe parametry są policzone i ocenione, ale nie są dobierane.',
    `Groch i bobik przycinane do ${maxStraczkowe(norma.okres)}% łącznie dla tego wieku.`,
  ];
  if (najlepsza.some((p) => p.procent < 0.5)) {
    uwagi.push('Składnik z udziałem poniżej 0,5% algorytm praktycznie odrzucił; można go pominąć.');
  }
  return { cel, ...raport(najlepsza, norma, drob, uwagi) };
}
