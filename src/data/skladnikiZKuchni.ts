/**
 * Produkty „z kuchni” do kalkulatora pasz (od 24.10.2026): makaron, chleb, ryż,
 * ziemniaki, kapusta, jabłka. Dla małych hodowców, którzy dają kurom resztki
 * i zwroty ze sklepu i chcą zobaczyć, jak to rozcieńcza paszę (białko, wapń)
 * i ile soli dokłada. Tło: src/data/kuryNieNiosa.ts, podstrona /pasze/resztki-z-kuchni.
 *
 * SKĄD LICZBY: USDA FoodData Central, baza SR Legacy (dane publiczne), numer
 * produktu w polu `fdc`. To tabele żywności dla ludzi, więc skład jest przybliżony:
 * energia to energia dla człowieka przeliczona na MJ/kg (kcal × 0,04184), a nie
 * energia metaboliczna dla drobiu; makaron i pieczywo w USA bywają wzbogacane
 * żelazem i wapniem. Wartości na produkt w takiej postaci, w jakiej trafia do kur
 * (z wodą), jak w bazie pasz: białko i minerały w %, mikroelementy w mg/kg.
 *
 * Kategoria osobna, żeby było widać, że to nie pasza. Propozycje „czym uzupełnić”
 * tej kategorii nie podpowiadają (bilansPaszy.ts, KATEGORIE_POMIJANE).
 */

import type { FeedIngredient } from "./feedIngredients.ts";

export const KATEGORIA_Z_KUCHNI = "Z kuchni (skład przybliżony)";

export const ZRODLO_Z_KUCHNI = {
  opis: "USDA FoodData Central, SR Legacy (tabele żywności dla ludzi, skład przybliżony)",
  url: "https://fdc.nal.usda.gov/",
};

const ZERA = {
  popiol: 0, skrobia: 0, cukier: 0, pPrzyswajalny: 0, cl: 0, s: 0, cu: 0, co: 0,
  lys: 0, met: 0, metCys: 0, trp: 0, thr: 0, ile: 0, leu: 0, val: 0, his: 0, arg: 0, phe: 0, tyr: 0,
  witA: 0, witD3: 0, witE: 0, witB1: 0, witB2: 0, witB6: 0, kwasPantotenowy: 0, kwasFoliowy: 0,
  biotyna: 0, niacyna: 0, witB12: 0, cholina: 0, kwasLinolowy: 0, i: 0,
};

type Wpis = Pick<FeedIngredient, "nazwa" | "em" | "bialko" | "ca" | "p" | "wlokno" | "na" | "k" | "mg" | "mn" | "zn" | "se" | "fe" | "suchaMasa" | "tluszcz"> & { fdc: number };

const WPISY: Wpis[] = [
  { nazwa: "Makaron gotowany (bez soli)", fdc: 169737, em: 6.61, bialko: 5.8, ca: 0.007, p: 0.058, wlokno: 1.8, na: 0.001, k: 0.044, mg: 0.018, mn: 3.2, zn: 5.1, se: 0.264, fe: 12.8, suchaMasa: 37.9, tluszcz: 0.93 },
  { nazwa: "Makaron gotowany w osolonej wodzie", fdc: 169751, em: 6.57, bialko: 5.8, ca: 0.007, p: 0.058, wlokno: 1.8, na: 0.131, k: 0.044, mg: 0.018, mn: 3.2, zn: 5.1, se: 0.264, fe: 12.8, suchaMasa: 37.9, tluszcz: 0.93 },
  { nazwa: "Makaron suchy (np. ze zwrotów)", fdc: 169736, em: 15.52, bialko: 13.04, ca: 0.021, p: 0.189, wlokno: 3.2, na: 0.006, k: 0.223, mg: 0.053, mn: 9.2, zn: 14.1, se: 0.632, fe: 33.0, suchaMasa: 90.1, tluszcz: 1.51 },
  { nazwa: "Chleb pszenny", fdc: 174924, em: 11.13, bialko: 8.85, ca: 0.144, p: 0.098, wlokno: 2.7, na: 0.49, k: 0.126, mg: 0.023, mn: 5.4, zn: 7.4, se: 0.22, fe: 36.1, suchaMasa: 63.6, tluszcz: 3.33 },
  { nazwa: "Chleb żytni", fdc: 172684, em: 10.84, bialko: 8.5, ca: 0.073, p: 0.125, wlokno: 5.8, na: 0.603, k: 0.166, mg: 0.04, mn: 8.2, zn: 11.4, se: 0.309, fe: 28.3, suchaMasa: 62.7, tluszcz: 3.3 },
  { nazwa: "Ryż gotowany (bez soli)", fdc: 169757, em: 5.44, bialko: 2.69, ca: 0.01, p: 0.043, wlokno: 0.4, na: 0.001, k: 0.035, mg: 0.012, mn: 4.7, zn: 4.9, se: 0.075, fe: 2.0, suchaMasa: 31.6, tluszcz: 0.28 },
  { nazwa: "Ziemniaki gotowane (bez soli)", fdc: 170440, em: 3.6, bialko: 1.71, ca: 0.008, p: 0.04, wlokno: 1.8, na: 0.005, k: 0.328, mg: 0.02, mn: 1.4, zn: 2.7, se: 0.003, fe: 3.1, suchaMasa: 22.5, tluszcz: 0.1 },
  { nazwa: "Kapusta surowa", fdc: 169975, em: 1.05, bialko: 1.28, ca: 0.04, p: 0.026, wlokno: 2.5, na: 0.018, k: 0.17, mg: 0.012, mn: 1.6, zn: 1.8, se: 0.003, fe: 4.7, suchaMasa: 7.8, tluszcz: 0.1 },
  { nazwa: "Jabłka", fdc: 171688, em: 2.18, bialko: 0.26, ca: 0.006, p: 0.011, wlokno: 2.4, na: 0.001, k: 0.107, mg: 0.005, mn: 0.4, zn: 0.4, se: 0, fe: 1.2, suchaMasa: 14.4, tluszcz: 0.17 },
];

export const SKLADNIKI_Z_KUCHNI: (FeedIngredient & { fdc: number })[] = WPISY.map((w) => ({
  ...ZERA,
  ...w,
  kategoria: KATEGORIA_Z_KUCHNI,
}));
