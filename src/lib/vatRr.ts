/**
 * Logika faktury VAT RR (art. 116 ustawy o VAT).
 *
 * Kwoty liczymy WYŁĄCZNIE w groszach jako liczby całkowite — nigdy we `float`
 * (0.1 + 0.2 !== 0.3). Zaokrąglenie „w górę od połowy" (`Math.floor(x + 0.5)`),
 * nie bankierskie — tak jak dla dokumentów finansowo-prawnych.
 */

/** Stawka zryczałtowanego zwrotu podatku dla rolnika ryczałtowego. */
export const STAWKA_ZRYCZALTOWANA_PROC = 7;

/** Zaokrąglenie „w górę od połowy" do pełnych groszy. */
export const roundHalfUp = (x: number): number => Math.floor(x + 0.5);

/** Złote (liczba dziesiętna) → grosze (liczba całkowita). */
export const zlToGr = (zl: number): number => roundHalfUp(zl * 100);

/**
 * Grosze → sformatowana kwota PL, np. 107000 → "1 070,00".
 * Separator tysięcy to spacja NIEROZDZIELAJĄCA (U+00A0) — na wydruku kwota
 * nigdy nie złamie się w połowie na granicy wiersza.
 */
export const formatGr = (gr: number): string => {
  const znak = gr < 0 ? "-" : "";
  const abs = Math.abs(gr);
  const zl = Math.floor(abs / 100);
  const reszta = abs % 100;
  const zlStr = zl.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${znak}${zlStr},${reszta.toString().padStart(2, "0")}`;
};

/* ---------- kwota słownie (PL) ---------- */

const JEDNOSTKI = ["", "jeden", "dwa", "trzy", "cztery", "pięć", "sześć", "siedem", "osiem", "dziewięć"];
const NASCIE = ["dziesięć", "jedenaście", "dwanaście", "trzynaście", "czternaście", "piętnaście", "szesnaście", "siedemnaście", "osiemnaście", "dziewiętnaście"];
const DZIESIATKI = ["", "", "dwadzieścia", "trzydzieści", "czterdzieści", "pięćdziesiąt", "sześćdziesiąt", "siedemdziesiąt", "osiemdziesiąt", "dziewięćdziesiąt"];
const SETKI = ["", "sto", "dwieście", "trzysta", "czterysta", "pięćset", "sześćset", "siedemset", "osiemset", "dziewięćset"];

/** Odmiana rzeczownika po liczebniku: 1 → one, 2–4 → few, reszta → many. */
export function odmiana(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const ost = n % 10;
  const ost2 = n % 100;
  if (ost >= 2 && ost <= 4 && !(ost2 >= 12 && ost2 <= 14)) return few;
  return many;
}

/** Grupa 0–999 słownie. */
function grupaSlownie(n: number): string {
  const out: string[] = [];
  const s = Math.floor(n / 100);
  const reszta = n % 100;
  if (s > 0) out.push(SETKI[s]);
  if (reszta >= 10 && reszta <= 19) {
    out.push(NASCIE[reszta - 10]);
  } else {
    const d = Math.floor(reszta / 10);
    const j = reszta % 10;
    if (d > 0) out.push(DZIESIATKI[d]);
    if (j > 0) out.push(JEDNOSTKI[j]);
  }
  return out.join(" ");
}

const GRUPY: [string, string, string][] = [
  ["", "", ""],
  ["tysiąc", "tysiące", "tysięcy"],
  ["milion", "miliony", "milionów"],
  ["miliard", "miliardy", "miliardów"],
];

/** Liczba całkowita słownie po polsku (0 → "zero"). */
export function liczbaSlownie(n: number): string {
  if (n === 0) return "zero";
  const czesci: string[] = [];
  let reszta = n;
  let poziom = 0;
  while (reszta > 0 && poziom < GRUPY.length) {
    const grupa = reszta % 1000;
    if (grupa > 0) {
      const slowa = grupaSlownie(grupa);
      if (poziom === 0) {
        czesci.unshift(slowa);
      } else {
        const [one, few, many] = GRUPY[poziom];
        // Na dokumencie finansowym zostawiamy pełny zapis „jeden tysiąc"
        // (nie „tysiąc") — trudniej go uzupełnić o dopisaną cyfrę.
        czesci.unshift(`${slowa} ${odmiana(grupa, one, few, many)}`);
      }
    }
    reszta = Math.floor(reszta / 1000);
    poziom++;
  }
  return czesci.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Kwota słownie w formacie wymaganym na fakturze (art. 116 ust. 2 pkt 12).
 * np. 107000 gr → "jeden tysiąc siedemdziesiąt złotych 00/100"
 */
export function kwotaSlownie(gr: number): string {
  const zl = Math.floor(Math.abs(gr) / 100);
  const grosze = Math.abs(gr) % 100;
  const slowa = liczbaSlownie(zl);
  const jednostka = odmiana(zl, "złoty", "złote", "złotych");
  return `${slowa} ${jednostka} ${grosze.toString().padStart(2, "0")}/100`;
}

/* ---------- walidacja NIP ---------- */

const NIP_WAGI = [6, 5, 7, 2, 3, 4, 5, 6, 7];

/** Walidacja NIP (10 cyfr, suma kontrolna mod 11). */
export function walidujNip(nip: string): boolean {
  const cyfry = nip.replace(/[\s-]/g, "");
  if (!/^\d{10}$/.test(cyfry)) return false;
  const suma = NIP_WAGI.reduce((acc, waga, i) => acc + waga * Number(cyfry[i]), 0);
  const kontrolna = suma % 11;
  if (kontrolna === 10) return false;
  return kontrolna === Number(cyfry[9]);
}

/* ---------- pozycje i podsumowanie ---------- */

export interface PozycjaVatRr {
  nazwa: string;
  jednostka: string;
  ilosc: string;
  cenaNetto: string;
  klasa: string;
}

export interface PodsumowanieVatRr {
  /** Wartość netto pozycji w groszach (bez zryczałtowanego zwrotu). */
  netto: number[];
  /** Suma netto w groszach. */
  sumaNetto: number;
  /** Kwota zryczałtowanego zwrotu (7% od sumy netto) w groszach. */
  zwrot: number;
  /** Należność ogółem w groszach. */
  ogolem: number;
}

const num = (s: string): number => {
  const parsed = Number(String(s).replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Podsumowanie faktury. Zwrot 7% liczony od SUMY netto (nie od pojedynczych
 * pozycji) — dokładnie tak jak w module Fermly, żeby oba dokumenty się zgadzały.
 */
export function policz(pozycje: PozycjaVatRr[]): PodsumowanieVatRr {
  const netto = pozycje.map((p) => roundHalfUp(num(p.ilosc) * num(p.cenaNetto) * 100));
  const sumaNetto = netto.reduce((a, b) => a + b, 0);
  const zwrot = roundHalfUp((sumaNetto * STAWKA_ZRYCZALTOWANA_PROC) / 100);
  return { netto, sumaNetto, zwrot, ogolem: sumaNetto + zwrot };
}

/** Oświadczenie rolnika ryczałtowego — treść wprost z art. 116 ust. 3 ustawy o VAT. */
export const OSWIADCZENIE_ROLNIKA =
  "Oświadczam, że jestem rolnikiem ryczałtowym zwolnionym od podatku od towarów i usług na podstawie art. 43 ust. 1 pkt 3 ustawy o podatku od towarów i usług.";
