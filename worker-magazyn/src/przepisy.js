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

// ── Karta przepisu (od 0.10.0) ────────────────────────────────────────────
// Liczby z tekstu przepisu w kształcie karty: składnik z ilością i jednostką,
// krok z temperaturami i czasami. Nic nie jest dopisywane ani zgadywane: ilość,
// która nie jest prostą liczbą z jednostką („2% masy sera”, „do smaku”), ma
// ilosc: null i zostaje tylko w ilosc_tekst. Pełne brzmienie zostaje obok.

const LICZBA = String.raw`\d+(?:[.,]\d+)?|\d+\/\d+|[½¼¾]`;
const ULAMKI = { '½': 0.5, '¼': 0.25, '¾': 0.75 };
const naLiczbe = (s) => {
  if (ULAMKI[s]) return ULAMKI[s];
  if (s.includes('/')) { const [a, b] = s.split('/').map(Number); return a / b; }
  return Number(s.replace(',', '.'));
};
const JEDNOSTKI = [
  [/^ml$/i, 'ml'], [/^g$/i, 'g'], [/^kg$/i, 'kg'], [/^l$/i, 'L'],
  [/^(tsp|łyżecz\p{L}*)$/iu, 'łyżeczka'], [/^(łyżk\p{L}*|łyżek)$/iu, 'łyżka'], [/^kropl\p{L}*$/iu, 'kropla'],
];
const WZOR_ILOSCI = new RegExp(String.raw`^([~≈])?\s*(${LICZBA})(?:\s*[-–]\s*(${LICZBA}))?\s*(\p{L}+)$`, 'u');

/** „1,5 tsp (~7 g)” → 1,5 łyżeczki; „2–3 krople” → od 2 do 3; „2% masy sera” → null. */
function ilosc(tekst) {
  const glowna = (tekst || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
  const m = glowna.match(WZOR_ILOSCI);
  const jednostka = m && JEDNOSTKI.find(([w]) => w.test(m[4]))?.[1];
  if (!jednostka) return { ilosc: null, jednostka: null };
  return {
    ilosc: naLiczbe(m[2]),
    ...(m[3] ? { ilosc_do: naLiczbe(m[3]) } : {}),
    jednostka,
    ...(m[1] ? { w_przyblizeniu: true } : {}),
  };
}

// Mleko (albo serwatka, śmietanka, ser) jest w tabeli dawkowania tylko w części
// przepisów; w pozostałych bierzemy je z pola mleko („≈ 4 L mleka pełnego …”).
const WZOR_BAZY = /mlek|ser bazowy|serwatk|śmietank/i;
const BAZY = { mleka: 'Mleko', serwatki: 'Serwatka', 'śmietanki': 'Śmietanka', sera: 'Ser' };
const WZOR_MLEKA = new RegExp(String.raw`^([~≈])?\s*(${LICZBA})\s*(L|kg|g)\s+(\p{L}+)`, 'u');

function bazaZMleka(tekst) {
  const m = (tekst || '').match(WZOR_MLEKA);
  const nazwa = m && BAZY[m[4].toLowerCase()];
  if (!nazwa) return null;
  return {
    nazwa,
    ilosc: naLiczbe(m[2]),
    jednostka: m[3],
    ...(m[1] ? { w_przyblizeniu: true } : {}),
    ilosc_tekst: tekst.split(/\s*[(;]/)[0].trim(),
  };
}

function skladniki(p) {
  const zTabeli = p.dawkowanie.map((d) => ({
    nazwa: d.ingredient,
    ...ilosc(d.amount),
    ilosc_tekst: d.amount,
    ...(d.notes ? { uwagi: d.notes } : {}),
  }));
  const baza = p.dawkowanie.some((d) => WZOR_BAZY.test(d.ingredient)) ? null : bazaZMleka(p.mleko);
  return baza ? [baza, ...zTabeli] : zTabeli;
}

const L = String.raw`\d+(?:[.,]\d+)?`;
const WZOR_TEMP = new RegExp(String.raw`(${L})(?:\s*[-–]\s*(${L}))?\s*°\s*C`, 'g');
const WZOR_CZASU = new RegExp(String.raw`(${L})(?:\s*[-–]\s*(${L}))?\s*(min(?:ut\p{L}*)?|h|godz\p{L}*)(?!\p{L})`, 'gu');
const zakres = (m, mnoznik = 1) => {
  const od = naLiczbe(m[1]) * mnoznik;
  return { od, do: m[2] ? naLiczbe(m[2]) * mnoznik : od };
};
const dodajRaz = (lista, z) => { if (!lista.some((x) => x.od === z.od && x.do === z.do)) lista.push(z); };

/**
 * Temperatury i czasy kroku w kolejności z tekstu. Pomijamy zmiany i tempo
 * („o 1 °C”, „1 °C co 5 min”, „0,5°C na minutę”), odstępy („obracaj co 15 min”)
 * i czasy na kilogram sera: to nie są temperatura do ustawienia ani czas na minutnik.
 */
function liczbyKroku(tekst) {
  const temperatury = [];
  const tempo = [];
  for (const m of tekst.matchAll(WZOR_TEMP)) {
    const przed = tekst.slice(Math.max(0, m.index - 8), m.index);
    const po = tekst.slice(m.index + m[0].length);
    const rata = po.match(/^\s*(?:(?:na|co)\s+|\/\s*)[^.,;)]*/i);
    if (rata) tempo.push([m.index, m.index + m[0].length + rata[0].length]);
    if (rata || /(^|\s)o\s*$/i.test(przed)) continue;
    dodajRaz(temperatury, zakres(m));
  }
  const czasy = [];
  for (const m of tekst.matchAll(WZOR_CZASU)) {
    if (tempo.some(([a, b]) => m.index >= a && m.index < b)) continue;
    if (/(^|\s)co\s*$/i.test(tekst.slice(Math.max(0, m.index - 4), m.index))) continue;
    // „2–3 h na każdy kilogram sera”: czas zależy od wagi sera, minutnik go nie ustawi.
    if (/^\s*(?:na\s+(?:każdy\s+)?(?:kg|kilogram)|\/\s*kg)/i.test(tekst.slice(m.index + m[0].length))) continue;
    dodajRaz(czasy, zakres(m, /^(h|godz)/i.test(m[3]) ? 60 : 1));
  }
  return {
    ...(temperatury.length ? { temperatury_c: temperatury } : {}),
    ...(czasy.length ? { czasy_min: czasy } : {}),
  };
}

const kroki = (p) => p.kroki.map((k) => ({ ...k, ...liczbyKroku(`${k.tytul}. ${k.tresc}`) }));

const UWAGA_O_KARCIE =
  'Pola skladniki, temperatury_c i czasy_min są wyjęte z tekstu przepisu, bez uzupełnień. ilosc: null znaczy, że ilość nie jest prostą liczbą z jednostką (np. % masy sera albo „do smaku”): wtedy obowiązuje ilosc_tekst. Pełne brzmienie kroku jest w polu tresc.';

const UWAGA_O_DZIENNIKU =
  'Wpisy dziennik_warzen to prawdziwe pomiary autora przy polskim mleku, zapisane dosłownie i bez uzupełnień: tak je podawaj.';

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

/**
 * karta: false = kształt wyniku sprzed 0.10.0 (pole dawkowanie, kroki bez liczb) dla kanałów ChatGPT,
 * bo łącznik huba dla ChatGPT jest w przeglądzie OpenAI i recenzent woła narzędzia (hub, 24.11.2026).
 */
export function przepis({ nazwa }, { karta = true } = {}) {
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

  // dawkowanie (tabela z eksportu) zastępują skladniki: te same wiersze, z liczbą i jednostką.
  const { kultury: _k, dawkowanie: _d, kroki: _kr, ...tresc } = p;
  const kartaPrzepisu = karta
    ? { skladniki: skladniki(p), kroki: kroki(p), uwaga_o_karcie: UWAGA_O_KARCIE }
    : { dawkowanie: p.dawkowanie, kroki: p.kroki };
  return {
    znaleziono: true,
    ...tresc,
    ...kartaPrzepisu,
    url: url(p.id),
    // Zasada z instrukcji serwera, powtórzona przy samych danych: hub od 14.11.2026 nie przekazuje
    // czatom instrukcji modułów (Claude i tak ucinał je po ok. 4000 znaków), a odpowiedź dociera zawsze.
    ...(p.dziennik_warzen?.length ? { uwaga_o_dzienniku: UWAGA_O_DZIENNIKU } : {}),
    kultury_z_przepisu: kultury,
    inne_kultury_z_bazy_do_tego_sera: inne,
    ceny_sprawdzone_od: CENY_SPRAWDZONE_OD,
    uwaga_o_cenach: 'Ceny pochodzą ze stron sklepów z dnia w polu cena_z_dnia. Przed zakupem sprawdź cenę w sklepie.',
    cytuj_jako: cytujJako(p),
    licencja: LICENCJA,
  };
}
