/**
 * Baza kultur dla serwera MCP: wyszukiwanie, karta kultury, zamienniki.
 *
 * SKAD DANE. Migawka wkompilowana przy wdrozeniu: ten sam plik
 * src/data/culturesDataComplete.ts, z ktorego gen-baza.py, gen-zamienniki.py
 * i gen-kultury-strony.py robia mirrory /kultury/. Magazyn nie ma wiec ani
 * jednej liczby, ktorej nie ma na stronie. Aplikacja React czyta wprost
 * z Supabase, wiec po zmianie w panelu admina rozjazd potrwa do najblizszego
 * gen-cultures-ts.py, tak samo jak dzis w mirrorach.
 *
 * REGULY IMPORTOWANE, NIE PRZEPISANE: adres strony (adresKultury), wybor
 * pozycji przy kilku sklepach (znajdzKulture), cena za litr (zaLitr)
 * i grupowanie po skladzie (grupujPoSkladzie). Druga kopia tych regul rozjechalaby
 * sie przy pierwszej poprawce, a rozjazd adresu to link do nieistniejacej strony.
 *
 * Rozszerzenie .ts w importach jest celowe: esbuild (wrangler) i Node 24
 * czytaja je wtedy bez zadnej konfiguracji.
 */

import { culturesData } from '../../src/data/culturesDataComplete.ts';
import { adresKultury, znajdzKulture, zaLitr } from '../../src/lib/adresKultury.ts';
import { grupujPoSkladzie, rozbijSklad, czyLacinska, ladnyGatunek } from '../../src/lib/grupyKultur.ts';

const BAZA = 'https://mojaserowarnia.pl';

// Znacznik w linkach, po ktorym licznik wejsc rozpozna przyjscie z magazynu:
// zrodloOdpowiedzi() w worker/wizyty-botow.js zapisuje je jako "Magazyn" (od 21.10.2026).
const ZNACZNIK = 'utm_source=magazyn';

// Ze znacznikiem, bo w pierwszym tescie w Claude.ai (21.10.2026) model podal
// wlasnie ten link, a nie url poszczegolnych kultur. Bez znacznika wejscie
// z cytowania liczyloby sie pod claude.ai, a nie jako "Magazyn".
export const CYTUJ_JAKO = `Moja Serowarnia, baza kultur bakteryjnych do sera (https://mojaserowarnia.pl/baza-kultur?${ZNACZNIK})`;
export const LICENCJA = 'CC BY 4.0: cytując, podaj źródło z linkiem';

export const TYPY = [...new Set(culturesData.map((k) => k.type))].sort((a, b) => a.localeCompare(b, 'pl'));
export const SKLEPY = [...new Set(culturesData.map((k) => k.shop))].sort((a, b) => a.localeCompare(b, 'pl'));

// NAJSTARSZA data sprawdzenia cen w migawce, a nie najnowsza: 187 pozycji
// sprawdzono 22.08, jedna 8.09, wiec najnowsza data sugerowalaby swiezosc,
// ktorej nie ma. Podawana przy kazdej odpowiedzi, bo ceny sprzed dwoch
// miesiecy nie wolno nazywac aktualnymi.
export const CENY_SPRAWDZONE_OD = culturesData
  .map((k) => k.lastChecked)
  .filter(Boolean)
  .sort()
  .at(0) ?? null;

const url = (nazwa) => `${BAZA}/kultury/${adresKultury(nazwa)}?${ZNACZNIK}`;

const zaokraglij = (x) => (x == null ? null : Math.round(x * 100) / 100);

/** Bez ogonkow i wielkich liter, wszystko poza literami i cyframi na spacje. */
function normalizuj(tekst) {
  return (tekst || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/gi, 'l')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Slowa, ktore pojawiaja sie w prawie kazdym pytaniu i niczego nie zawezaja.
const NIC_NIE_ZNACZA = new Set([
  'do', 'na', 'dla', 'z', 'ze', 'i', 'w', 'we', 'o', 'a', 'jaka', 'jaki', 'jakie', 'ktora', 'ktory',
  'ser', 'sera', 'serow', 'sery', 'serze', 'kultura', 'kultury', 'kultur', 'bakterie', 'bakterii',
  'starter', 'startery', 'zakwas', 'domowy', 'domowego', 'domowe',
]);

/**
 * Prosty rdzen slowa: polska odmiana zmienia koncowke, wiec porownujemy
 * poczatek. "twarog" trafia w "twarogowe", "jogurt" w "jogurtowe".
 */
function rdzen(slowo) {
  // Szesc liter tnie tylko o jedna: "twarog" jako "twar" trafialo w "twarde".
  if (slowo.length > 6) return slowo.slice(0, slowo.length - 2);
  if (slowo.length === 6) return slowo.slice(0, 5);
  return slowo;
}

function slowaZapytania(zapytanie) {
  return normalizuj(zapytanie)
    .split(' ')
    .filter((s) => s.length >= 2 && !NIC_NIE_ZNACZA.has(s))
    .map(rdzen);
}

// Wagi pol: trafienie w nazwie handlowej mowi najwiecej, w skladzie najmniej.
const POLA = [
  ['name', 5],
  ['application', 3],
  ['type', 2],
  ['composition', 1],
];

const slowaPol = new Map(
  culturesData.map((k) => [k, POLA.map(([pole, waga]) => [normalizuj(k[pole]).split(' '), waga])]),
);

/** Suma najlepszych wag dla kazdego slowa zapytania; null, gdy ktores nie trafilo nigdzie. */
function trafnosc(kultura, slowa) {
  let suma = 0;
  for (const s of slowa) {
    let najlepsza = 0;
    for (const [wyrazy, waga] of slowaPol.get(kultura)) {
      if (waga > najlepsza && wyrazy.some((w) => w.startsWith(s))) najlepsza = waga;
    }
    if (najlepsza === 0) return null;
    suma += najlepsza;
  }
  return suma;
}

/**
 * Zakres temperatury z opisu sklepu: "25-35°C", "42-45 °C", "30°C".
 * Brak liczby = null, czyli "nie wiadomo", a nie "pasuje do wszystkiego".
 */
function zakresTemperatury(opis) {
  const t = (opis || '').replace(/,/g, '.');
  const zakres = t.match(/(\d+(?:\.\d+)?)\s*(?:-|–|do)\s*(\d+(?:\.\d+)?)/);
  if (zakres) return [Number(zakres[1]), Number(zakres[2])];
  const jedna = t.match(/(\d+(?:\.\d+)?)\s*°?\s*C/i);
  if (jedna) return [Number(jedna[1]) - 2, Number(jedna[1]) + 2];
  return null;
}

function oferta(k) {
  const litr = zaLitr(k.price_numeric, k.packLiters);
  return {
    sklep: k.shop,
    cena: k.price || null,
    cena_poprzednia: k.pricePrevious ?? null,
    opakowanie_na_litrow: k.packLiters ?? null,
    cena_za_litr_zl: zaokraglij(litr),
    cena_z_dnia: k.lastChecked ?? null,
    strona_produktu: k.productUrl || k.shopUrl || null,
  };
}

function wiersz(k) {
  const { sklep, cena, cena_za_litr_zl, cena_z_dnia } = oferta(k);
  return {
    nazwa: k.name,
    typ: k.type,
    zastosowanie: k.application,
    temperatura: k.temperature || null,
    sklep,
    cena,
    cena_za_litr_zl,
    cena_z_dnia,
    url: url(k.name),
  };
}

const stopka = () => ({ cytuj_jako: CYTUJ_JAKO, licencja: LICENCJA, ceny_sprawdzone_od: CENY_SPRAWDZONE_OD });

/** Rosnaco po cenie za litr; pozycje bez przelicznika na koncu. */
function poCenieZaLitr(a, b) {
  const x = zaLitr(a.price_numeric, a.packLiters);
  const y = zaLitr(b.price_numeric, b.packLiters);
  if (x == null && y == null) return a.name.localeCompare(b.name, 'pl');
  if (x == null) return 1;
  if (y == null) return -1;
  return x - y;
}

export function szukajKultur({ zapytanie, typ, temperatura, sklep, sortuj = 'trafnosc', limit = 10 }) {
  const slowa = slowaZapytania(zapytanie);
  if (slowa.length === 0 && !typ && temperatura == null && !sklep) {
    return {
      blad: 'Podaj zapytanie (ser albo zastosowanie) albo co najmniej jeden filtr.',
      dostepne_typy: TYPY.map((t) => ({ typ: t, kultur: culturesData.filter((k) => k.type === t).length })),
      dostepne_sklepy: SKLEPY,
      ...stopka(),
    };
  }

  let pominieteBezTemperatury = 0;
  const trafione = [];
  for (const k of culturesData) {
    if (typ && k.type !== typ) continue;
    if (sklep && k.shop !== sklep) continue;
    if (temperatura != null) {
      const z = zakresTemperatury(k.temperature);
      if (!z) { pominieteBezTemperatury++; continue; }
      if (temperatura < z[0] - 1 || temperatura > z[1] + 1) continue;
    }
    const wynik = slowa.length ? trafnosc(k, slowa) : 0;
    if (wynik === null) continue;
    trafione.push([k, wynik]);
  }

  trafione.sort(([a, x], [b, y]) => (sortuj === 'cena_za_litr' ? poCenieZaLitr(a, b) : y - x || poCenieZaLitr(a, b)));
  const pokaz = trafione.slice(0, limit).map(([k]) => wiersz(k));

  const odpowiedz = {
    znaleziono: trafione.length,
    pokazano: pokaz.length,
    sortowanie: sortuj,
    wyniki: pokaz,
  };
  if (trafione.length === 0) {
    odpowiedz.podpowiedz = 'Brak trafień. Spróbuj krótszego zapytania (np. sama nazwa sera) albo filtra typ. Każde słowo zapytania musi wystąpić w nazwie, zastosowaniu, typie albo składzie.';
  }
  if (pominieteBezTemperatury) {
    odpowiedz.uwaga = `Pominięto ${pominieteBezTemperatury} kultur bez podanej temperatury pracy.`;
  }
  return { ...odpowiedz, ...stopka() };
}

/**
 * Kultura po nazwie handlowej albo adresie; przy braku trafienia null.
 * Druga proba: nazwa skrocona tak, jak ludzie ja pisza ("MA 4001" zamiast
 * "Choozit MA 4001"). Bierzemy ja tylko wtedy, gdy pasuje do JEDNEJ kultury,
 * bo zgadywanie miedzy dwiema to podanie modelowi zlej karty jako pewnej.
 */
function znajdz(nazwa) {
  const adres = adresKultury(nazwa || '');
  if (!adres) return null;
  const dokladna = znajdzKulture(culturesData, adres);
  if (dokladna) return dokladna;

  const szukane = ` ${normalizuj(nazwa)} `;
  const adresy = new Set(
    culturesData.filter((k) => ` ${normalizuj(k.name)} `.includes(szukane)).map((k) => adresKultury(k.name)),
  );
  return adresy.size === 1 ? znajdzKulture(culturesData, [...adresy][0]) : null;
}

/** Najblizsze nazwy, gdy dokladnego trafienia nie ma: "MA 4001" -> "Choozit MA 4001". */
function podobneNazwy(nazwa) {
  const szukane = normalizuj(nazwa);
  if (!szukane) return [];
  const kawalki = szukane.split(' ');
  const nazwy = [...new Set(culturesData.map((k) => k.name))];
  return nazwy
    .map((n) => {
      const w = normalizuj(n);
      const ile = kawalki.filter((c) => w.split(' ').some((s) => s.startsWith(c))).length;
      return [n, ile + (w.includes(szukane) ? kawalki.length : 0)];
    })
    .filter(([, ile]) => ile > 0)
    .sort(([a, x], [b, y]) => y - x || a.localeCompare(b, 'pl'))
    .slice(0, 5)
    .map(([n]) => n);
}

function brakKultury(nazwa) {
  return {
    znaleziono: false,
    szukano: nazwa,
    podobne_nazwy: podobneNazwy(nazwa),
    podpowiedz: 'Podaj nazwę handlową dokładnie jak na opakowaniu albo użyj szukaj_kultur.',
    ...stopka(),
  };
}

/** Grupa tej kultury z grupujPoSkladzie albo null, gdy jej sklad nie ma odpowiednikow. */
function grupaKultury(k) {
  const adres = adresKultury(k.name);
  return grupujPoSkladzie(culturesData).find((g) => g.kultury.some((x) => adresKultury(x.name) === adres)) ?? null;
}

export function kartaKultury({ nazwa }) {
  const k = znajdz(nazwa);
  if (!k) return brakKultury(nazwa);

  const adres = adresKultury(k.name);
  const wszystkieOferty = culturesData.filter((x) => adresKultury(x.name) === adres).sort(poCenieZaLitr);
  const szczepy = rozbijSklad(k.composition);
  const grupa = grupaKultury(k);

  return {
    znaleziono: true,
    nazwa: k.name,
    typ: k.type,
    sklad: k.composition,
    gatunki: szczepy.every(czyLacinska) ? szczepy.map(ladnyGatunek) : null,
    zastosowanie: k.application,
    temperatura: k.temperature || null,
    dawkowanie: k.doseLabel ?? null,
    producent: k.manufacturer ?? null,
    proporcje_szczepow: k.strainRatio ?? null,
    oferty: wszystkieOferty.map(oferta),
    zamiennikow_o_tym_samym_skladzie: grupa
      ? grupa.kultury.filter((x) => adresKultury(x.name) !== adres).length
      : 0,
    url: url(k.name),
    ...stopka(),
  };
}

// Zastrzezenie z komentarza w src/lib/grupyKultur.ts, w tym samym brzmieniu co na stronie:
// "zwykle zadziala jako zamiennik, ale sprawdz przeznaczenie", a nie "to to samo".
const ZASTRZEZENIE =
  'Ten sam skład gatunkowy nie znaczy ten sam produkt: producenci dobierają konkretne szczepy i ich proporcje. Zwykle zadziała jako zamiennik, ale sprawdź przeznaczenie.';

export function zamiennikiKultury({ nazwa }) {
  const k = znajdz(nazwa);
  if (!k) return brakKultury(nazwa);

  const adres = adresKultury(k.name);
  const grupa = grupaKultury(k);
  if (!grupa) {
    return {
      znaleziono: true,
      nazwa: k.name,
      zamienniki: [],
      podpowiedz: `W bazie nie ma innej kultury o identycznym składzie. Podobnych szukaj przez szukaj_kultur z filtrem typ "${k.type}".`,
      url: url(k.name),
      ...stopka(),
    };
  }

  const zamienniki = grupa.kultury
    .filter((x) => adresKultury(x.name) !== adres)
    .sort(poCenieZaLitr)
    .map((x) => ({ ...wiersz(x), proporcje_szczepow: x.strainRatio ?? null, producent: x.manufacturer ?? null }));

  return {
    znaleziono: true,
    nazwa: k.name,
    sklad: grupa.szczepy.map(ladnyGatunek),
    zamienniki,
    rozne_przeznaczenie_w_grupie: grupa.rozneZastosowania,
    rozne_proporcje_szczepow_w_grupie: grupa.rozneProporcje,
    producenci_w_grupie: grupa.producenci,
    zastrzezenie: ZASTRZEZENIE,
    url: url(k.name),
    ...stopka(),
  };
}

export function oBazie() {
  const zLitrami = culturesData.filter((k) => k.packLiters != null && k.price_numeric != null).length;
  return {
    nazwa: 'Baza kultur bakteryjnych do sera, Moja Serowarnia',
    opis: 'Kultury starterowe, pleśniowe, propionowe, jogurtowe i kefirowe dostępne w polskich sklepach dla serowarów domowych: skład, zastosowanie, temperatura pracy, sklep, cena i cena za litr mleka.',
    pozycji: culturesData.length,
    roznych_nazw: new Set(culturesData.map((k) => adresKultury(k.name))).size,
    sklepow: SKLEPY.length,
    sklepy: SKLEPY,
    typy: TYPY,
    z_cena_za_litr: zLitrami,
    uwaga_o_cenach: 'Ceny pochodzą ze stron sklepów z podanego dnia. Przed zakupem sprawdź cenę w sklepie.',
    strona_bazy: `${BAZA}/baza-kultur?${ZNACZNIK}`,
    ...stopka(),
  };
}
