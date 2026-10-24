/**
 * Baza dodatkow paszowych jako narzedzia MCP (od 0.8.0): wyszukiwanie po tym,
 * czego brakuje, karta produktu i zamienniki. Wzor: worker-magazyn/src/kultury.js.
 *
 * SKAD DANE. Migawka src/data/dodatkiPaszowe.ts: ta sama, z ktorej idzie seed
 * tabel feed_ingredients (source='dodatek') i feed_offers. Strona czyta je wprost
 * z Supabase, wiec po zmianie ceny w panelu rozjazd potrwa do aktualizacji migawki,
 * tak samo jak w bazie kultur.
 *
 * NEUTRALNOSC (decyzja Marka): placi sie za obecnosc i sprawdzone dane, nigdy za
 * pozycje. Kolejnosc wylacznie po skladzie i cenie; pole partner jest jawne
 * w odpowiedzi, ale nie wchodzi do sortowania.
 *
 * Koszt na ptaka i „koncentrat + Twoje zboże” licza te same funkcje co kalkulator
 * na stronie (src/lib/bilansPaszy.ts).
 */

import {
  DODATKI_PASZOWE, GATUNKI_DODATKOW, OPIS_ZRODLA_SKLADU, STAN_DODATKOW, ZRODLO_DODATKOW,
  cenaZaKg, dawkaEtykiety, najtanszaOferta, przepisZeStosowania,
} from '../../src/data/dodatkiPaszowe.ts';
import { feedIngredients } from '../../src/data/feedIngredients.ts';
import { NORMY_DROBIU, dawkaTypowa } from '../../src/data/normyDrobiu.ts';
import { OPIS_GMO, opisEko } from '../../src/data/gmoEkoSurowcow.ts';
import { TOLERANCJE, koncentratZeZbozem, kosztNaPtakaMiesiecznie, sprawdzNorme, zawartosc } from '../../src/lib/bilansPaszy.ts';
import { normalizuj, ofertaDlaModelu, zaokr, znajdzNorme } from './pasze.js';

const ADRES_KALKULATORA = 'https://mojaserowarnia.pl/kalkulator-pasz?utm_source=magazyn';

export const GATUNKI = Object.keys(GATUNKI_DODATKOW);
export const KATEGORIE_DODATKOW = [...new Set(DODATKI_PASZOWE.map((d) => d.kategoria))];

/**
 * Czego brakuje -> pole skladu. `prog` = od ilu w produkcie uznajemy, ze go uzupelnia:
 * dla parametrow z normami najwyzsza norma dla drobiu (dodatek musi byc bogatszy niz
 * cala pasza, jak w uzupelnienia()), dla aminokwasow i witamin wyraznie wiecej niz w zbozu.
 */
const najwyzszaNorma = (pole) => Math.max(...Object.values(NORMY_DROBIU).flat().map((n) => n[pole] ?? 0));
export const BRAKI = {
  bialko: { pole: 'bialko', nazwa: 'Białko', jedn: '%', prog: najwyzszaNorma('bialko') },
  energia: { pole: 'em', nazwa: 'Energia metaboliczna', jedn: 'MJ/kg', prog: najwyzszaNorma('em') },
  wapn: { pole: 'ca', nazwa: 'Wapń', jedn: '%', prog: najwyzszaNorma('ca') },
  fosfor: { pole: 'p', nazwa: 'Fosfor', jedn: '%', prog: najwyzszaNorma('p') },
  sod: { pole: 'na', nazwa: 'Sód', jedn: '%', prog: najwyzszaNorma('na') },
  lizyna: { pole: 'lys', nazwa: 'Lizyna', jedn: '%', prog: 1.0 },
  metionina: { pole: 'met', nazwa: 'Metionina', jedn: '%', prog: 0.5 },
  treonina: { pole: 'thr', nazwa: 'Treonina', jedn: '%', prog: 0.8 },
  tryptofan: { pole: 'trp', nazwa: 'Tryptofan', jedn: '%', prog: 0.25 },
  mangan: { pole: 'mn', nazwa: 'Mangan', jedn: 'mg/kg', prog: najwyzszaNorma('mn') },
  cynk: { pole: 'zn', nazwa: 'Cynk', jedn: 'mg/kg', prog: najwyzszaNorma('zn') },
  zelazo: { pole: 'fe', nazwa: 'Żelazo', jedn: 'mg/kg', prog: najwyzszaNorma('fe') },
  selen: { pole: 'se', nazwa: 'Selen', jedn: 'mg/kg', prog: najwyzszaNorma('se') },
  jod: { pole: 'i', nazwa: 'Jod', jedn: 'mg/kg', prog: najwyzszaNorma('i') },
  miedz: { pole: 'cu', nazwa: 'Miedź', jedn: 'mg/kg', prog: 30 },
  witamina_a: { pole: 'witA', nazwa: 'Witamina A', jedn: 'tys. j.m./kg', prog: 20 },
  witamina_d3: { pole: 'witD3', nazwa: 'Witamina D3', jedn: 'tys. j.m./kg', prog: 3 },
  witamina_e: { pole: 'witE', nazwa: 'Witamina E', jedn: 'mg/kg', prog: 30 },
};
export const CZEGO_BRAKUJE = Object.keys(BRAKI);

// Dawka paszy, gdy pytanie jej nie podaje: typowa dla niosek z poradnika rasy (Hy-Line Brown).
const TYPOWA_NIOSKA = dawkaTypowa('kury-nioski-ciezkie', 'Niesienie (powyżej 45%)');

const stopka = () => ({
  zrodlo: `${ZRODLO_DODATKOW}. Kalkulator: ${ADRES_KALKULATORA}`,
  licencja: 'CC BY 4.0: cytując, podaj źródło z linkiem',
  stan_danych: STAN_DODATKOW,
  uwaga_o_cenach: 'Ceny pochodzą ze stron sklepów z dnia w polu cena_z_dnia. To nie są ceny bieżące: przed zakupem trzeba sprawdzić cenę w sklepie.',
  neutralnosc: 'Kolejność wyłącznie po składzie i cenie. Producent oznaczony jako partner płaci za obecność w bazie i sprawdzanie danych, nie za miejsce na liście.',
  zastrzezenie: 'Skład z etykiet i stron producentów; kolejne partie mogą się różnić, obowiązuje etykieta na worku. To obliczenie, nie porada lekarza weterynarii ani doradcy żywieniowego.',
});

/** Dawka paszy na ptaka do kosztu: podana, a dla niosek (albo bez gatunku) typowa z poradnika. */
function dawkaPaszy(dawka_g, gatunek) {
  if (dawka_g) return { g: dawka_g, zrodlo: 'podana w pytaniu' };
  if (!gatunek || gatunek === 'nioski') return { g: TYPOWA_NIOSKA.g, zrodlo: `${TYPOWA_NIOSKA.zrodlo}, ${TYPOWA_NIOSKA.url}` };
  return null;
}

/**
 * Koszt produktu na ptaka przez 30 dni w dawce z etykiety: % mieszanki × dawka paszy
 * × 30 dni × cena za kg, albo g na sztukę × 30 dni × cena. null bez ceny albo bez dawki.
 */
function kosztNaKure(d, dawkaG) {
  const oferta = najtanszaOferta(d.oferty);
  if (!oferta) return null;
  const proc = dawkaEtykiety(d);
  if (proc > 0) return dawkaG ? kosztNaPtakaMiesiecznie(proc, dawkaG, cenaZaKg(oferta)) : null;
  if (d.dawkaGDziennie) return (d.dawkaGDziennie / 1000) * 30 * cenaZaKg(oferta);
  return null;
}

const dlaKogo = (d) => (d.gatunki.length ? d.gatunki.map((g) => GATUNKI_DODATKOW[g]) : ['etykieta nie zawęża']);

/** Dawka z etykiety w % mieszanki; z dawki w g na sztukę liczona przy znanej dawce paszy. */
function dawkaProc(d, dawkaG) {
  const proc = dawkaEtykiety(d);
  if (proc > 0) return proc;
  return d.dawkaGDziennie && dawkaG ? (100 * d.dawkaGDziennie) / dawkaG : null;
}

/**
 * Cena 100 g samego składnika (fosforu, wapnia, metioniny) z najtańszej oferty: porównuje
 * produkty o różnej zawartości. Tylko dla składników podawanych w %.
 */
function cenaSkladnika(d, brak) {
  const o = najtanszaOferta(d.oferty);
  if (!o || !brak || brak.jedn !== '%' || !(d[brak.pole] > 0)) return null;
  return (cenaZaKg(o) * 10) / d[brak.pole];
}

function wiersz(d, brak, dawka) {
  const oferta = najtanszaOferta(d.oferty);
  const koszt = kosztNaKure(d, dawka?.g);
  return {
    nazwa: d.nazwa,
    producent: d.producent,
    kategoria: d.kategoria,
    dla_kogo: dlaKogo(d),
    dawkowanie: d.dawkowanie,
    ...(brak ? { zawartosc: { parametr: brak.nazwa, wartosc: d[brak.pole], jednostka: brak.jedn } } : {}),
    // Ile tego składnika produkt wnosi do paszy w dawce z etykiety: drożdże mają fosfor,
    // ale w dawce kilku gramów na 10 kur to ułamek normy, a fosforan daje go całość.
    ...(brak && dawkaProc(d, dawka?.g) ? { w_paszy_przy_dawce_z_etykiety: { wartosc: zaokr((d[brak.pole] * dawkaProc(d, dawka?.g)) / 100, 3), jednostka: brak.jedn } } : {}),
    ...(cenaSkladnika(d, brak) != null ? { cena_100_g_skladnika_zl: zaokr(cenaSkladnika(d, brak), 2) } : {}),
    najtansza_oferta: oferta ? ofertaDlaModelu(oferta) : null,
    koszt_na_kure_30_dni_zl: koszt == null ? null : zaokr(koszt, 2),
    ...(koszt == null && oferta && !(dawkaEtykiety(d) > 0) && !d.dawkaGDziennie
      ? { koszt_uwaga: 'Etykieta nie podaje dawki: ilość i koszt policz w dobierz_proporcje albo policz_mieszanke (pole uzupelnienia).' }
      : {}),
    gmo: OPIS_GMO[d.gmo],
    eko: opisEko(d.dopuszczalneEko),
    ...(d.partner ? { partner_serwisu: true } : {}),
    zrodlo_skladu: OPIS_ZRODLA_SKLADU[d.zrodloSkladu],
    sklad_sprawdzony: d.zweryfikowano,
  };
}

/** Rosnąco; null i NaN na końcu. */
const rosnaco = (x, y) => (x == null ? Infinity : x) - (y == null ? Infinity : y);

export function szukajDodatkow({ brakuje, zapytanie, gatunek, kategoria, bez_gmo, sortuj, dawka_g, limit = 10 }) {
  const brak = brakuje ? BRAKI[brakuje] : null;
  const slowa = normalizuj(zapytanie).split(' ').filter(Boolean);
  const dawka = dawkaPaszy(dawka_g, gatunek);
  const trafione = DODATKI_PASZOWE.filter((d) =>
    (!brak || d[brak.pole] > brak.prog) &&
    (!gatunek || !d.gatunki.length || d.gatunki.includes(gatunek)) &&
    (!kategoria || d.kategoria === kategoria) &&
    (!bez_gmo || d.gmo === 'nie') &&
    slowa.every((w) => normalizuj(`${d.nazwa} ${d.producent} ${d.kategoria}`).includes(w)));

  const kolejnosc = sortuj ?? (brak ? 'zawartosc' : 'nazwa');
  const cena = (d) => { const o = najtanszaOferta(d.oferty); return o ? cenaZaKg(o) : null; };
  const porownaj = {
    zawartosc: (a, b) => b[brak?.pole ?? 'bialko'] - a[brak?.pole ?? 'bialko'] || rosnaco(cena(a), cena(b)),
    koszt_na_kure: (a, b) => rosnaco(kosztNaKure(a, dawka?.g), kosztNaKure(b, dawka?.g)) || rosnaco(cena(a), cena(b)),
    cena_skladnika: (a, b) => rosnaco(cenaSkladnika(a, brak), cenaSkladnika(b, brak)) || rosnaco(cena(a), cena(b)),
    cena_za_kg: (a, b) => rosnaco(cena(a), cena(b)),
    nazwa: (a, b) => a.nazwa.localeCompare(b.nazwa, 'pl'),
  }[kolejnosc];
  const pokaz = [...trafione].sort((a, b) => porownaj(a, b) || a.nazwa.localeCompare(b.nazwa, 'pl')).slice(0, limit);

  return {
    znaleziono: trafione.length,
    pokazano: pokaz.length,
    sortowanie: kolejnosc,
    ...(brak ? { szukano: `${brak.nazwa}: produkty, które mają więcej niż ${zaokr(brak.prog, 2)} ${brak.jedn}` } : {}),
    dawka_paszy_do_kosztu: dawka ? { g_na_sztuke_dziennie: dawka.g, zrodlo: dawka.zrodlo } : 'brak: podaj dawka_g, żeby policzyć koszt na ptaka produktów dawkowanych w % mieszanki',
    wyniki: pokaz.map((d) => wiersz(d, brak, dawka)),
    ...(trafione.length === 0 ? { podpowiedz: 'Brak trafień. Usuń któryś filtr albo użyj skladniki_paszy, gdzie są też surowce wzorcowe bez marki (np. „Kreda pastewna”).' } : {}),
    ...stopka(),
  };
}

/** Produkt po nazwie: dokładnie, potem jedyny pasujący fragment; przy kilku trafieniach lista. */
function znajdzDodatek(nazwa) {
  const szukane = normalizuj(nazwa);
  if (!szukane) return { blad: 'pusta nazwa', kandydaci: [] };
  const dokladny = DODATKI_PASZOWE.find((d) => normalizuj(d.nazwa) === szukane);
  if (dokladny) return { dodatek: dokladny };
  const slowa = szukane.split(' ');
  const pasujace = DODATKI_PASZOWE.filter((d) => {
    const n = normalizuj(`${d.nazwa} ${d.producent}`);
    return slowa.every((w) => n.includes(w));
  });
  if (pasujace.length === 1) return { dodatek: pasujace[0] };
  return {
    blad: pasujace.length ? 'kilka pasujących produktów' : 'brak takiego produktu w bazie dodatków',
    kandydaci: (pasujace.length ? pasujace : DODATKI_PASZOWE).slice(0, 10).map((d) => d.nazwa),
  };
}

const SKLAD = [
  ['em', 'Energia metaboliczna', 'MJ/kg'], ['bialko', 'Białko', '%'], ['tluszcz', 'Tłuszcz', '%'], ['wlokno', 'Włókno', '%'],
  ['popiol', 'Popiół', '%'], ['ca', 'Wapń', '%'], ['p', 'Fosfor', '%'], ['na', 'Sód', '%'], ['cl', 'Chlor', '%'], ['mg', 'Magnez', '%'],
  ['lys', 'Lizyna', '%'], ['met', 'Metionina', '%'], ['metCys', 'Metionina + cystyna', '%'], ['thr', 'Treonina', '%'], ['trp', 'Tryptofan', '%'],
  ['witA', 'Witamina A', 'tys. j.m./kg'], ['witD3', 'Witamina D3', 'tys. j.m./kg'], ['witE', 'Witamina E', 'mg/kg'],
  ['witB1', 'Witamina B1', 'mg/kg'], ['witB2', 'Witamina B2', 'mg/kg'], ['witB6', 'Witamina B6', 'mg/kg'], ['witB12', 'Witamina B12', 'µg/kg'],
  ['niacyna', 'Niacyna', 'mg/kg'], ['kwasPantotenowy', 'Kwas pantotenowy', 'mg/kg'], ['kwasFoliowy', 'Kwas foliowy', 'mg/kg'],
  ['biotyna', 'Biotyna', 'mg/kg'], ['cholina', 'Cholina', 'g/kg'],
  ['mn', 'Mangan', 'mg/kg'], ['zn', 'Cynk', 'mg/kg'], ['fe', 'Żelazo', 'mg/kg'], ['cu', 'Miedź', 'mg/kg'], ['i', 'Jod', 'mg/kg'], ['se', 'Selen', 'mg/kg'],
];

const skladNaKg = (d) => SKLAD.filter(([p]) => d[p] > 0).map(([p, nazwa, jednostka]) => ({ parametr: nazwa, wartosc: d[p], jednostka }));

const brakDodatku = (nazwa, { blad, kandydaci }) => ({
  znaleziono: false, szukano: nazwa, problem: blad, podobne_nazwy: kandydaci,
  podpowiedz: 'Podaj nazwę z wyników szukaj_dodatkow. Surowce bez marki (np. „Kreda pastewna”) są w skladniki_paszy.',
  ...stopka(),
});

/**
 * „Koncentrat + Twoje zboże” dla modelu: proporcje z etykiety ze zbożami z pytania
 * i udział koncentratu do normy białka przy tych zbożach.
 */
function zTwoimZbozem(d, zboza, drob, okres) {
  if (!przepisZeStosowania(d.stosowanie)) return { problem: 'ten produkt nie ma na etykiecie przepisu „koncentrat + zboże”' };
  const pozycje = [];
  const nieznane = [];
  for (const z of zboza) {
    const s = feedIngredients.find((f) => normalizuj(f.nazwa) === normalizuj(z.nazwa)) ??
      feedIngredients.find((f) => normalizuj(f.nazwa).startsWith(normalizuj(z.nazwa)));
    if (s) pozycje.push({ ...s, procent: z.procent ?? 0 }); else nieznane.push(z.nazwa);
  }
  let norma = null;
  if (drob && okres) norma = znajdzNorme(drob, okres).norma ?? null;
  const w = koncentratZeZbozem({ ...d, procent: 0 }, pozycje, feedIngredients.map((s) => ({ ...s, procent: 0 })), norma);
  if (!w) return { problem: 'wśród podanych zbóż nie rozpoznałem żadnego zboża (pszenica, pszenżyto, jęczmień, kukurydza, owies, żyto)', nierozpoznane: nieznane };
  const opisz = (u) => ({
    koncentrat_proc: zaokr(u.koncentrat, 1),
    dodatki_z_przepisu: u.inne.map((x) => ({ nazwa: x.tekst, procent: zaokr(x.procent, 1) })),
    zboza: u.zboza.map((z) => ({ nazwa: z.nazwa, procent: zaokr(z.procent, 1) })),
    wynik: ['em', 'bialko', 'ca', 'p'].map((pole) => {
      const wynik = zawartosc(u.mieszanka, pole);
      return {
        parametr: { em: 'Energia metaboliczna', bialko: 'Białko', ca: 'Wapń', p: 'Fosfor' }[pole],
        wynik: zaokr(wynik, 2),
        ...(norma ? { norma: norma[pole], ocena: { ok: 'w normie', 'za-nisko': 'za nisko', 'za-wysoko': 'za wysoko' }[sprawdzNorme(wynik, norma[pole], TOLERANCJE[pole])] } : {}),
      };
    }),
  });
  return {
    z_etykiety: opisz(w.zEtykiety),
    ...(w.doNormyBialka ? { do_normy_bialka: opisz(w.doNormyBialka) } : {}),
    ...(norma ? { norma_okres: norma.okres } : { uwaga: 'Bez drob i okres nie porównuję z normą.' }),
    ...(nieznane.length ? { nierozpoznane_zboza: nieznane } : {}),
    zastrzezenie: 'Udział do normy białka to obliczenie ze składu wzorcowego zbóż; producent podaje proporcje z etykiety.',
  };
}

export function kartaDodatku({ nazwa, zboza, drob, okres, dawka_g }) {
  const { dodatek: d, ...brak } = znajdzDodatek(nazwa);
  if (!d) return brakDodatku(nazwa, brak);
  const dawka = dawkaPaszy(dawka_g, d.gatunki.includes('nioski') ? 'nioski' : d.gatunki[0]);
  const koszt = kosztNaKure(d, dawka?.g);
  const przepis = przepisZeStosowania(d.stosowanie);
  return {
    znaleziono: true,
    nazwa: d.nazwa,
    producent: d.producent,
    kategoria: d.kategoria,
    dla_kogo: dlaKogo(d),
    dawkowanie: d.dawkowanie,
    dawka_proc_mieszanki: d.dawkaProcOd == null && d.dawkaProcDo == null ? null : { od: d.dawkaProcOd, do: d.dawkaProcDo },
    ...(d.dawkaGDziennie ? { dawka_g_na_sztuke_dziennie: d.dawkaGDziennie } : {}),
    ...(d.stosowanie ? { stosowanie: d.stosowanie } : {}),
    ...(przepis ? { przepis, koncentrat_z_twoim_zbozem: zboza?.length ? zTwoimZbozem(d, zboza, drob, okres) : 'Podaj zboza (i drob z okresem), a policzę proporcje i wynik z normą.' } : {}),
    sklad_na_kg: skladNaKg(d),
    ...(d.skladSurowcowy ? { sklad_surowcowy: d.skladSurowcowy } : {}),
    gmo: OPIS_GMO[d.gmo],
    eko: opisEko(d.dopuszczalneEko),
    oferty: [...d.oferty].sort((a, b) => cenaZaKg(a) - cenaZaKg(b)).map(ofertaDlaModelu),
    ...(d.oferty.length ? {} : { bez_ofert: d.urlProducenta ? `Nie znaleźliśmy w sklepach internetowych. Sprzedaż u producenta: ${d.urlProducenta}` : 'Nie znaleźliśmy w sklepach internetowych.' }),
    koszt_na_kure_30_dni_zl: koszt == null ? null : zaokr(koszt, 2),
    ...(koszt != null && dawka ? { dawka_paszy_do_kosztu: { g_na_sztuke_dziennie: dawka.g, zrodlo: dawka.zrodlo } } : {}),
    ...(d.odpowiednik ? { surowiec_wzorcowy: d.odpowiednik } : {}),
    zrodlo_skladu: OPIS_ZRODLA_SKLADU[d.zrodloSkladu],
    zrodlo_skladu_url: d.zrodlo,
    ...(d.urlProducenta ? { strona_producenta: d.urlProducenta } : {}),
    sklad_sprawdzony: d.zweryfikowano,
    ...(d.uwagi ? { uwagi: d.uwagi } : {}),
    partner_serwisu: d.partner,
    ...stopka(),
  };
}

const ZASTRZEZENIE_ZAMIENNIKOW =
  'Ten sam rodzaj dodatku nie znaczy ten sam skład ani ta sama dawka: porównaj zawartość i dawkę z etykiety, zanim zamienisz jeden na drugi.';

/**
 * Zamienniki: produkty tego samego rodzaju (ten sam surowiec wzorcowy, np. kreda z różnych
 * worków), a dla premiksów i koncentratów ta sama kategoria i wspólny gatunek. Od najtańszego
 * na ptaka w dawce z etykiety, potem za kg.
 */
export function zamiennikiDodatku({ nazwa, dawka_g }) {
  const { dodatek: d, ...brak } = znajdzDodatek(nazwa);
  if (!d) return brakDodatku(nazwa, brak);
  const wspolnyGatunek = (x) => !d.gatunki.length || !x.gatunki.length || x.gatunki.some((g) => d.gatunki.includes(g));
  const zamienniki = DODATKI_PASZOWE.filter((x) => x !== d && (d.odpowiednik
    ? x.odpowiednik === d.odpowiednik
    : !x.odpowiednik && x.kategoria === d.kategoria && wspolnyGatunek(x)));
  const dawka = dawkaPaszy(dawka_g, d.gatunki.includes('nioski') ? 'nioski' : d.gatunki[0]);
  const cena = (x) => { const o = najtanszaOferta(x.oferty); return o ? cenaZaKg(o) : null; };
  const kluczowe = (x) => Object.fromEntries(
    ['bialko', 'ca', 'p', 'na', 'lys', 'met'].filter((p) => x[p] > 0 || d[p] > 0).map((p) => [`${p}_proc`, x[p]]));
  const wzor = d.odpowiednik ? feedIngredients.find((f) => f.nazwa === d.odpowiednik) : null;
  return {
    znaleziono: true,
    nazwa: d.nazwa,
    sklad_tego_produktu: kluczowe(d),
    zamienniki: zamienniki
      .sort((a, b) => rosnaco(kosztNaKure(a, dawka?.g), kosztNaKure(b, dawka?.g)) || rosnaco(cena(a), cena(b)) || a.nazwa.localeCompare(b.nazwa, 'pl'))
      .map((x) => ({ ...wiersz(x, null, dawka), sklad: kluczowe(x) })),
    ...(wzor ? { surowiec_wzorcowy: { nazwa: wzor.nazwa, sklad: kluczowe(wzor), uwaga: 'Skład typowy z tabel, bez marki i bez ceny (w skladniki_paszy).' } } : {}),
    ...(zamienniki.length ? {} : { podpowiedz: 'W bazie nie ma innego produktu tego rodzaju. Surowce bez marki znajdziesz w skladniki_paszy.' }),
    zastrzezenie: ZASTRZEZENIE_ZAMIENNIKOW,
    ...stopka(),
  };
}
