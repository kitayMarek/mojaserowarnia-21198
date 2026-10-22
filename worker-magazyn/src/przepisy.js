/**
 * Przepisy na sery dla serwera MCP (od 0.3.0, 22.10.2026): wyszukiwanie i pełny
 * przepis z kulturami dopasowanymi do bazy (sklep, cena, cena za litr, link).
 *
 * PO CO. Zapytany o przepis na mozzarellę Claude szukał w sieci i nie wziął
 * stąd nic, bo magazyn miał tylko kultury i pasze. Sam przepis model zna; czego
 * nie zna, to które kultury do niego pasują, gdzie je kupić w Polsce i za ile,
 * i co wyszło autorowi przy polskim mleku (dziennik warzeń). To łączy tylko ten serwis.
 *
 * SKAD DANE. worker-magazyn/src/przepisy-dane.json, eksport z src/data/recipesData.ts
 * (scripts/eksport-przepisow-magazyn.mjs, uruchamiany przy każdym npm run deploy:magazyn).
 * Ten sam plik czyta strona i generator mirrorów, więc magazyn nie ma ani jednego
 * zdania, którego nie ma na stronie przepisu.
 */

import PRZEPISY from './przepisy-dane.json' with { type: 'json' };
import { szukajKultur, kulturaZPrzepisu, LICENCJA, CENY_SPRAWDZONE_OD } from './kultury.js';

const BAZA = 'https://mojaserowarnia.pl';
// Ten sam znacznik co w kultury.js: licznik wejść zapisuje go jako "Magazyn".
const ZNACZNIK = 'utm_source=magazyn';

export const TRUDNOSCI = ['Łatwy', 'Średni', 'Zaawansowany'];

const url = (id) => `${BAZA}/przepisy/${id}?${ZNACZNIK}`;

function normalizuj(tekst) {
  return (tekst || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/gi, 'l')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Słowa z każdego pytania o przepis, które niczego nie zawężają.
const NIC_NIE_ZNACZA = new Set([
  'przepis', 'przepisy', 'przepisu', 'jak', 'zrobic', 'zrobienia', 'zrob', 'domowy', 'domowa', 'domowe', 'domowego',
  'w', 'z', 'ze', 'na', 'do', 'dla', 'i', 'a', 'o', 'domu', 'ser', 'sera', 'serow', 'sery', 'serek',
]);

// Polska odmiana zmienia końcówkę: porównujemy początek, jak w kultury.js.
const rdzen = (s) => (s.length > 6 ? s.slice(0, s.length - 2) : s.length === 6 ? s.slice(0, 5) : s);

const slowaZapytania = (zapytanie) =>
  normalizuj(zapytanie).split(' ').filter((s) => s.length >= 2 && !NIC_NIE_ZNACZA.has(s)).map(rdzen);

// Wagi pól: trafienie w nazwie mówi najwięcej.
const POLA = [
  [(p) => p.nazwa + ' ' + p.id, 5],
  [(p) => p.opis + ' ' + (p.zastosowanie || ''), 2],
  [(p) => [p.mleko, p.kultura_startowa, p.koagulant, ...p.kultury.map((k) => k.nazwa + ' ' + k.typ)].join(' '), 1],
];
const slowaPol = new Map(PRZEPISY.map((p) => [p, POLA.map(([pole, waga]) => [normalizuj(pole(p)).split(' '), waga])]));

function trafnosc(p, slowa) {
  let suma = 0;
  for (const s of slowa) {
    let najlepsza = 0;
    for (const [wyrazy, waga] of slowaPol.get(p)) {
      if (waga > najlepsza && wyrazy.some((w) => w.startsWith(s))) najlepsza = waga;
    }
    if (najlepsza === 0) return null;
    suma += najlepsza;
  }
  return suma;
}

const krotko = (tekst, ile = 220) => (tekst.length > ile ? tekst.slice(0, ile).replace(/\s+\S*$/, '') + '…' : tekst);

function wiersz(p) {
  return {
    id: p.id,
    nazwa: p.nazwa,
    trudnosc: p.trudnosc,
    wydajnosc: p.wydajnosc,
    dojrzewanie: p.dojrzewanie,
    opis: krotko(p.opis),
    url: url(p.id),
  };
}

const cytujJako = (p) =>
  p
    ? `Moja Serowarnia, przepis: ${p.nazwa} (${url(p.id)})`
    : `Moja Serowarnia, przepisy na sery (${BAZA}/przepisy?${ZNACZNIK})`;

export function szukajPrzepisow({ zapytanie, trudnosc, limit = 10 }) {
  const slowa = slowaZapytania(zapytanie);
  const trafione = [];
  for (const p of PRZEPISY) {
    if (trudnosc && p.trudnosc !== trudnosc) continue;
    const wynik = slowa.length ? trafnosc(p, slowa) : 0;
    if (wynik === null) continue;
    trafione.push([p, wynik]);
  }
  trafione.sort(([a, x], [b, y]) => y - x || a.nazwa.localeCompare(b.nazwa, 'pl'));
  const odpowiedz = {
    znaleziono: trafione.length,
    wszystkich_przepisow: PRZEPISY.length,
    wyniki: trafione.slice(0, limit).map(([p]) => wiersz(p)),
  };
  if (trafione.length === 0) {
    odpowiedz.podpowiedz = 'Brak przepisu pasującego do zapytania. Dostępne przepisy są niżej; pełny przepis zwraca narzędzie przepis.';
    odpowiedz.dostepne = PRZEPISY.map((p) => p.nazwa).sort((a, b) => a.localeCompare(b, 'pl'));
  }
  return { ...odpowiedz, cytuj_jako: cytujJako(null), licencja: LICENCJA };
}

/** Przepis po id albo nazwie ("mozzarella", "Mozzarella", "ser topiony"); przy kilku trafieniach null. */
function znajdz(nazwa) {
  const szukane = normalizuj(nazwa);
  if (!szukane) return null;
  const dokladny = PRZEPISY.find((p) => normalizuj(p.id) === szukane || normalizuj(p.nazwa) === szukane);
  if (dokladny) return dokladny;
  const slowa = slowaZapytania(nazwa);
  if (!slowa.length) return null;
  const poNazwie = PRZEPISY.filter((p) => slowa.every((s) => normalizuj(p.nazwa + ' ' + p.id).split(' ').some((w) => w.startsWith(s))));
  return poNazwie.length === 1 ? poNazwie[0] : null;
}

export function przepis({ nazwa }) {
  const p = znajdz(nazwa);
  if (!p) {
    const podobne = szukajPrzepisow({ zapytanie: nazwa, limit: 5 }).wyniki.map((w) => w.nazwa);
    return {
      znaleziono: false,
      szukano: nazwa,
      podobne: podobne.length ? podobne : PRZEPISY.map((x) => x.nazwa).sort((a, b) => a.localeCompare(b, 'pl')),
      podpowiedz: 'Podaj nazwę sera z listy albo id z wyników szukaj_przepisow.',
      cytuj_jako: cytujJako(null),
      licencja: LICENCJA,
    };
  }

  // Kultury z przepisu z ofertami z bazy. Pozycje spoza bazy (kwas cytrynowy,
  // podpuszczka) zostają z opisem z przepisu i w_bazie: null.
  const kultury = p.kultury.map((k) => ({ ...k, w_bazie: kulturaZPrzepisu(k.nazwa) }));
  const juzSa = new Set(kultury.map((k) => k.w_bazie?.nazwa_w_bazie).filter(Boolean));
  const inne = szukajKultur({ zapytanie: p.nazwa, limit: 8 }).wyniki
    .filter((w) => !juzSa.has(w.nazwa))
    .slice(0, 5);

  const { kultury: _pomijamy, ...tresc } = p;
  return {
    znaleziono: true,
    ...tresc,
    url: url(p.id),
    kultury_z_przepisu: kultury,
    inne_kultury_z_bazy_do_tego_sera: inne,
    ceny_sprawdzone_od: CENY_SPRAWDZONE_OD,
    uwaga_o_cenach: 'Ceny pochodzą ze stron sklepów z dnia w polu cena_z_dnia. Przed zakupem sprawdź cenę w sklepie.',
    cytuj_jako: cytujJako(p),
    licencja: LICENCJA,
  };
}
