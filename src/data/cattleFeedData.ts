// Dane składników paszowych dla bydła
export interface SkladnikPaszy {
  nazwa: string;
  kategoria: string;
  sm: number; // Sucha masa %
  jpml: number; // JPM-L (energia netto laktacja) MJ/kg SM
  jpmo: number; // JPM-O (energia netto opas) MJ/kg SM
  pb: number; // Białko ogólne % SM
  pbjt: number; // Białko jelitowo trawne g/kg SM
  ndf: number; // Błonnik NDF % SM
  adf: number; // Błonnik ADF % SM
  tluszcz: number; // Tłuszcz surowy % SM
  skrobia: number; // Skrobia % SM
  ca: number; // Wapń g/kg SM
  p: number; // Fosfor g/kg SM
  cenaKg: number; // Cena za kg świeżej masy (PLN)
}

export const SKLADNIKI_PASZY: SkladnikPaszy[] = [
  // PASZE OBJĘTOŚCIOWE - KISZONKI
  {
    nazwa: "Kiszonka z kukurydzy (25-30% SM)",
    kategoria: "Kiszonki",
    sm: 28.0, jpml: 6.4, jpmo: 7.8, pb: 8.0, pbjt: 45, ndf: 42.0, adf: 24.0,
    tluszcz: 3.2, skrobia: 28.0, ca: 2.5, p: 2.0, cenaKg: 0.35
  },
  {
    nazwa: "Kiszonka z kukurydzy (30-35% SM)",
    kategoria: "Kiszonki",
    sm: 32.0, jpml: 6.6, jpmo: 8.0, pb: 8.2, pbjt: 48, ndf: 40.0, adf: 23.0,
    tluszcz: 3.4, skrobia: 30.0, ca: 2.6, p: 2.1, cenaKg: 0.38
  },
  {
    nazwa: "Sianokiszonka łąkowa",
    kategoria: "Kiszonki",
    sm: 40.0, jpml: 5.2, jpmo: 5.8, pb: 14.0, pbjt: 65, ndf: 55.0, adf: 35.0,
    tluszcz: 3.0, skrobia: 2.0, ca: 6.0, p: 3.0, cenaKg: 0.40
  },
  {
    nazwa: "Kiszonka z lucerny",
    kategoria: "Kiszonki",
    sm: 35.0, jpml: 5.0, jpmo: 5.5, pb: 18.0, pbjt: 95, ndf: 48.0, adf: 38.0,
    tluszcz: 2.8, skrobia: 1.5, ca: 14.0, p: 2.8, cenaKg: 0.45
  },

  // PASZE OBJĘTOŚCIOWE - SIANO
  {
    nazwa: "Siano łąkowe I klasy",
    kategoria: "Siano",
    sm: 86.0, jpml: 5.4, jpmo: 6.0, pb: 12.5, pbjt: 60, ndf: 58.0, adf: 36.0,
    tluszcz: 2.5, skrobia: 2.0, ca: 7.0, p: 2.5, cenaKg: 0.60
  },
  {
    nazwa: "Siano lucernowe",
    kategoria: "Siano",
    sm: 87.0, jpml: 5.2, jpmo: 5.7, pb: 17.0, pbjt: 100, ndf: 52.0, adf: 40.0,
    tluszcz: 2.2, skrobia: 1.5, ca: 15.0, p: 2.5, cenaKg: 0.75
  },
  {
    nazwa: "Słoma owsiana",
    kategoria: "Siano",
    sm: 86.0, jpml: 3.8, jpmo: 4.2, pb: 4.0, pbjt: 15, ndf: 68.0, adf: 48.0,
    tluszcz: 1.5, skrobia: 1.0, ca: 3.0, p: 1.0, cenaKg: 0.25
  },

  // PASZE TREŚCIWE - ZBOŻA
  {
    nazwa: "Kukurydza (ziarno)",
    kategoria: "Zboża",
    sm: 87.0, jpml: 8.1, jpmo: 9.8, pb: 9.0, pbjt: 60, ndf: 11.0, adf: 3.0,
    tluszcz: 4.2, skrobia: 68.0, ca: 0.3, p: 2.8, cenaKg: 0.85
  },
  {
    nazwa: "Jęczmień",
    kategoria: "Zboża",
    sm: 87.0, jpml: 7.7, jpmo: 9.3, pb: 11.5, pbjt: 75, ndf: 20.0, adf: 6.0,
    tluszcz: 2.2, skrobia: 55.0, ca: 0.5, p: 3.5, cenaKg: 0.80
  },
  {
    nazwa: "Pszenica",
    kategoria: "Zboża",
    sm: 87.0, jpml: 8.0, jpmo: 9.6, pb: 13.0, pbjt: 85, ndf: 13.0, adf: 4.0,
    tluszcz: 1.8, skrobia: 65.0, ca: 0.4, p: 3.8, cenaKg: 0.90
  },
  {
    nazwa: "Owies",
    kategoria: "Zboża",
    sm: 87.0, jpml: 7.2, jpmo: 8.7, pb: 11.0, pbjt: 70, ndf: 28.0, adf: 12.0,
    tluszcz: 4.5, skrobia: 45.0, ca: 1.0, p: 3.5, cenaKg: 0.75
  },
  {
    nazwa: "Pszenżyto",
    kategoria: "Zboża",
    sm: 87.0, jpml: 7.8, jpmo: 9.4, pb: 12.0, pbjt: 78, ndf: 15.0, adf: 4.5,
    tluszcz: 1.9, skrobia: 60.0, ca: 0.5, p: 3.6, cenaKg: 0.78
  },

  // PASZE TREŚCIWE - WYSOKOBIAŁKOWE
  {
    nazwa: "Śruta sojowa 46% PB",
    kategoria: "Wysokobiałkowe",
    sm: 88.0, jpml: 7.5, jpmo: 8.8, pb: 46.0, pbjt: 310, ndf: 12.0, adf: 8.0,
    tluszcz: 2.5, skrobia: 8.0, ca: 3.0, p: 6.5, cenaKg: 2.20
  },
  {
    nazwa: "Śruta rzepakowa",
    kategoria: "Wysokobiałkowe",
    sm: 88.0, jpml: 6.8, jpmo: 8.0, pb: 34.0, pbjt: 200, ndf: 28.0, adf: 18.0,
    tluszcz: 3.5, skrobia: 4.0, ca: 7.0, p: 11.0, cenaKg: 1.40
  },
  {
    nazwa: "Poekstrakcyjna śruta słonecznikowa",
    kategoria: "Wysokobiałkowe",
    sm: 89.0, jpml: 6.5, jpmo: 7.6, pb: 38.0, pbjt: 220, ndf: 32.0, adf: 22.0,
    tluszcz: 2.0, skrobia: 3.0, ca: 3.5, p: 10.5, cenaKg: 1.35
  },
  {
    nazwa: "Śruta lniana",
    kategoria: "Wysokobiałkowe",
    sm: 90.0, jpml: 7.8, jpmo: 9.2, pb: 35.0, pbjt: 210, ndf: 25.0, adf: 15.0,
    tluszcz: 8.5, skrobia: 3.5, ca: 3.8, p: 8.5, cenaKg: 2.50
  },
  {
    nazwa: "Groch",
    kategoria: "Wysokobiałkowe",
    sm: 87.0, jpml: 7.8, jpmo: 9.4, pb: 23.0, pbjt: 155, ndf: 15.0, adf: 8.0,
    tluszcz: 1.5, skrobia: 48.0, ca: 1.2, p: 4.5, cenaKg: 1.10
  },
  {
    nazwa: "Bobik",
    kategoria: "Wysokobiałkowe",
    sm: 87.0, jpml: 7.6, jpmo: 9.2, pb: 27.0, pbjt: 180, ndf: 17.0, adf: 10.0,
    tluszcz: 1.3, skrobia: 43.0, ca: 1.5, p: 5.0, cenaKg: 1.05
  },

  // PASZE PRZEMYSŁOWE
  {
    nazwa: "Wysłodki buraczane suche",
    kategoria: "Przemysłowe",
    sm: 89.0, jpml: 7.2, jpmo: 8.6, pb: 10.0, pbjt: 55, ndf: 45.0, adf: 23.0,
    tluszcz: 0.8, skrobia: 2.0, ca: 8.0, p: 1.0, cenaKg: 0.95
  },
  {
    nazwa: "Otręby pszenne",
    kategoria: "Przemysłowe",
    sm: 88.0, jpml: 6.8, jpmo: 8.0, pb: 16.0, pbjt: 95, ndf: 42.0, adf: 12.0,
    tluszcz: 4.0, skrobia: 20.0, ca: 1.5, p: 12.0, cenaKg: 0.70
  },
  {
    nazwa: "Makuchy rzepakowe",
    kategoria: "Przemysłowe",
    sm: 90.0, jpml: 7.5, jpmo: 8.8, pb: 36.0, pbjt: 215, ndf: 25.0, adf: 16.0,
    tluszcz: 10.0, skrobia: 4.0, ca: 7.5, p: 11.5, cenaKg: 1.60
  },
  {
    nazwa: "Wywary browarniane (mokre)",
    kategoria: "Przemysłowe",
    sm: 25.0, jpml: 6.5, jpmo: 7.6, pb: 24.0, pbjt: 135, ndf: 50.0, adf: 22.0,
    tluszcz: 6.5, skrobia: 4.0, ca: 2.8, p: 5.5, cenaKg: 0.30
  },
  {
    nazwa: "Gluten kukurydziany",
    kategoria: "Przemysłowe",
    sm: 89.0, jpml: 8.5, jpmo: 10.2, pb: 22.0, pbjt: 140, ndf: 35.0, adf: 10.0,
    tluszcz: 3.5, skrobia: 25.0, ca: 0.8, p: 9.0, cenaKg: 1.15
  },

  // DODATKI
  {
    nazwa: "Melasa buraczana",
    kategoria: "Dodatki",
    sm: 75.0, jpml: 7.8, jpmo: 9.4, pb: 8.0, pbjt: 40, ndf: 0.0, adf: 0.0,
    tluszcz: 0.1, skrobia: 0.0, ca: 1.2, p: 0.5, cenaKg: 0.85
  },
  {
    nazwa: "Fosforan dwuwapniowy",
    kategoria: "Minerały",
    sm: 96.0, jpml: 0.0, jpmo: 0.0, pb: 0.0, pbjt: 0, ndf: 0.0, adf: 0.0,
    tluszcz: 0.0, skrobia: 0.0, ca: 230.0, p: 180.0, cenaKg: 3.50
  },
  {
    nazwa: "Węglan wapnia (kreda pastewna)",
    kategoria: "Minerały",
    sm: 99.0, jpml: 0.0, jpmo: 0.0, pb: 0.0, pbjt: 0, ndf: 0.0, adf: 0.0,
    tluszcz: 0.0, skrobia: 0.0, ca: 380.0, p: 0.0, cenaKg: 0.80
  },
  {
    nazwa: "Sól kuchenna",
    kategoria: "Minerały",
    sm: 99.0, jpml: 0.0, jpmo: 0.0, pb: 0.0, pbjt: 0, ndf: 0.0, adf: 0.0,
    tluszcz: 0.0, skrobia: 0.0, ca: 0.0, p: 0.0, cenaKg: 0.60
  }
];

export interface NormyZywieniowe {
  kategoria: string;
  waga: number;
  przyrostMleko: number;
  jpmlMj: number;
  jpmoMj: number;
  pbG: number;
  pbjtG: number;
  ndfMin: number;
  ndfMax: number;
  caG: number;
  pG: number;
  smKg: number;
}

// Oblicza normy dla krowy mlecznej wg INRAz/INRA 2018
export function obliczNormyKrowaMleczna(waga: number, mleko: number, tluszcz: number): NormyZywieniowe {
  const smUtrzymanie = 0.015 * waga;
  const smProdukcja = 0.28 * mleko;
  const smKg = smUtrzymanie + smProdukcja;

  const jpmlUtrzymanie = 0.046 * Math.pow(waga, 0.75);
  const jpmlProdukcja = mleko * (1.47 + 0.40 * tluszcz);
  const jpmlMj = jpmlUtrzymanie + jpmlProdukcja;

  const pbUtrzymanie = 3.25 * Math.pow(waga, 0.75);
  const pbProdukcja = mleko * (52 + 1.5 * tluszcz);
  const pbG = pbUtrzymanie + pbProdukcja;

  const pbjtProdukcja = mleko * (48 + 1.2 * tluszcz);
  const pbjtG = pbjtProdukcja;

  const caUtrzymanie = 0.020 * waga;
  const caProdukcja = mleko * 1.3;
  const caG = caUtrzymanie + caProdukcja;

  const pUtrzymanie = 0.015 * waga;
  const pProdukcja = mleko * 0.9;
  const pG = pUtrzymanie + pProdukcja;

  return {
    kategoria: "Krowa mleczna",
    waga,
    przyrostMleko: mleko,
    jpmlMj,
    jpmoMj: 0,
    pbG,
    pbjtG,
    ndfMin: 28.0,
    ndfMax: 35.0,
    caG,
    pG,
    smKg
  };
}

// Oblicza normy dla bydła mięsnego wg INRAz
export function obliczNormyBydloMiesne(waga: number, przyrost: number, plec: string): NormyZywieniowe {
  const smKg = 0.022 * waga + 0.6 * przyrost;

  const jpmoUtrzymanie = 0.047 * Math.pow(waga, 0.75);
  const efekt = waga < 300 
    ? (plec === "Buhaj" ? 5.5 : 6.0)
    : (plec === "Buhaj" ? 6.5 : 7.2);
  const jpmoMj = jpmoUtrzymanie + przyrost * efekt;

  const pbUtrzymanie = 3.25 * Math.pow(waga, 0.75);
  const pbPrzyrost = przyrost * (waga < 300 ? 180 : 160);
  const pbG = pbUtrzymanie + pbPrzyrost;

  const pbjtG = przyrost * (waga < 300 ? 100 : 90);

  const caG = 0.020 * waga + przyrost * 7.0;
  const pG = 0.015 * waga + przyrost * 4.0;

  return {
    kategoria: `Bydło mięsne - ${plec}`,
    waga,
    przyrostMleko: przyrost,
    jpmlMj: 0,
    jpmoMj: jpmoMj,
    pbG,
    pbjtG,
    ndfMin: 25.0,
    ndfMax: 40.0,
    caG,
    pG,
    smKg
  };
}

// Kategorie składników do grupowania w UI
export const KATEGORIE_SKLADNIKOW = [
  "Kiszonki",
  "Siano", 
  "Zboża",
  "Wysokobiałkowe",
  "Przemysłowe",
  "Dodatki",
  "Minerały"
];

// Typy bydła
export const TYPY_BYDLA = [
  { value: "mleczne", label: "🐄 Krowy mleczne" },
  { value: "miesne-buhaj", label: "🐂 Bydło mięsne - Buhaj" },
  { value: "miesne-jalowka", label: "🐄 Bydło mięsne - Jałówka" }
];
