/**
 * Normy zywieniowe drobiu: 6 grup, 30 okresow, do 14 skladnikow.
 *
 * Marek przepisal je z ksiazki "Normy zywieniowe" (patrz pamiec projektu
 * dane-paszowe-kalkulatora). Do 21.10.2026 siedzialy wpisane wprost w komponencie
 * src/pages/KalkulatorPasz.tsx. Wyniesione, bo z tych samych liczb korzysta
 * serwer MCP (worker-magazyn/), a dwie kopie norm rozjechalyby sie przy
 * pierwszej poprawce.
 *
 * Jednostki: em w MJ/kg, bialko, ca, p, tluszcz, wlokno, na, k, mg w %,
 * mn, zn, se, fe, i w mg/kg. Mikroelementy maja tylko okresy "Zarodowe".
 */

export interface NormaDrobiu {
  okres: string;
  em: number;
  bialko: number;
  ca: number;
  p: number;
  tluszcz?: number;
  wlokno?: number;
  na?: number;
  k?: number;
  mg?: number;
  mn?: number;
  zn?: number;
  se?: number;
  fe?: number;
  i?: number;
}

export const NORMY_DROBIU: Record<string, NormaDrobiu[]> = {
  'kury-nioski-lekkie': [
    { okres: 'Zarodowe', em: 11.7, bialko: 17.5, ca: 3.6, p: 0.55, tluszcz: 3.0, wlokno: 4.5, na: 0.16, k: 0.55, mg: 0.045, mn: 100, zn: 80, se: 0.30, fe: 60, i: 1.0 },
    { okres: '1-6 tygodni', em: 11.5, bialko: 18.0, ca: 1.0, p: 0.65, tluszcz: 3.0, wlokno: 4.0, na: 0.15 },
    { okres: '7-14 tygodni', em: 11.3, bialko: 15.0, ca: 1.0, p: 0.55, tluszcz: 3.0, wlokno: 5.0, na: 0.15 },
    { okres: '15-20 tygodni', em: 11.0, bialko: 14.0, ca: 2.0, p: 0.50, tluszcz: 2.5, wlokno: 6.0, na: 0.15 },
    { okres: 'Niesienie (do 45%)', em: 11.5, bialko: 17.0, ca: 3.5, p: 0.50, tluszcz: 2.5, wlokno: 5.0, na: 0.16 },
    { okres: 'Niesienie (powyżej 45%)', em: 11.5, bialko: 16.0, ca: 3.8, p: 0.48, tluszcz: 2.5, wlokno: 5.0, na: 0.16 }
  ],
  'kury-nioski-ciezkie': [
    { okres: 'Zarodowe', em: 11.7, bialko: 17.5, ca: 3.6, p: 0.55, tluszcz: 3.0, wlokno: 4.5, na: 0.16, k: 0.55, mg: 0.045, mn: 100, zn: 80, se: 0.30, fe: 60, i: 1.0 },
    { okres: '1-6 tygodni', em: 11.5, bialko: 19.0, ca: 1.0, p: 0.70, tluszcz: 3.0, wlokno: 4.0, na: 0.15 },
    { okres: '7-14 tygodni', em: 11.3, bialko: 16.0, ca: 1.0, p: 0.60, tluszcz: 3.0, wlokno: 5.0, na: 0.15 },
    { okres: '15-20 tygodni', em: 11.0, bialko: 14.5, ca: 2.0, p: 0.55, tluszcz: 2.5, wlokno: 6.0, na: 0.15 },
    { okres: 'Niesienie (do 45%)', em: 11.5, bialko: 17.5, ca: 3.5, p: 0.55, tluszcz: 2.5, wlokno: 5.0, na: 0.16 },
    { okres: 'Niesienie (powyżej 45%)', em: 11.5, bialko: 16.5, ca: 3.8, p: 0.50, tluszcz: 2.5, wlokno: 5.0, na: 0.16 }
  ],
  'brojlery': [
    { okres: 'Zarodowe', em: 12.0, bialko: 18.5, ca: 3.2, p: 0.50, tluszcz: 3.5, wlokno: 4.0, na: 0.16, k: 0.50, mg: 0.042, mn: 95, zn: 75, se: 0.28, fe: 55, i: 0.9 },
    { okres: '1-3 tygodnie (starter)', em: 12.5, bialko: 21.0, ca: 1.0, p: 0.70, tluszcz: 3.0, wlokno: 3.5, na: 0.16 },
    { okres: '4-6 tygodni (grower)', em: 13.0, bialko: 19.0, ca: 0.9, p: 0.65, tluszcz: 4.0, wlokno: 4.0, na: 0.15 },
    { okres: 'Powyżej 6 tygodni (finisher)', em: 13.2, bialko: 17.0, ca: 0.9, p: 0.60, tluszcz: 5.0, wlokno: 4.5, na: 0.15 }
  ],
  'kaczki': [
    { okres: 'Zarodowe', em: 11.5, bialko: 18.0, ca: 3.4, p: 0.52, tluszcz: 3.2, wlokno: 4.2, na: 0.15, k: 0.52, mg: 0.044, mn: 98, zn: 78, se: 0.29, fe: 58, i: 0.95 },
    { okres: '1-3 tygodnie', em: 11.7, bialko: 20.0, ca: 0.9, p: 0.65, tluszcz: 3.0, wlokno: 4.0, na: 0.15 },
    { okres: '4-7 tygodni', em: 11.7, bialko: 16.0, ca: 0.9, p: 0.60, tluszcz: 3.0, wlokno: 5.0, na: 0.15 },
    { okres: 'Powyżej 7 tygodni', em: 11.3, bialko: 15.0, ca: 0.9, p: 0.55, tluszcz: 3.0, wlokno: 6.0, na: 0.15 }
  ],
  'gesi': [
    { okres: 'Zarodowe', em: 11.3, bialko: 17.0, ca: 3.3, p: 0.54, tluszcz: 3.0, wlokno: 4.5, na: 0.15, k: 0.50, mg: 0.043, mn: 96, zn: 76, se: 0.28, fe: 57, i: 0.92 },
    { okres: '1-4 tygodnie', em: 11.5, bialko: 20.0, ca: 1.0, p: 0.70, tluszcz: 3.0, wlokno: 4.0, na: 0.15 },
    { okres: '5-8 tygodni', em: 11.3, bialko: 16.0, ca: 0.9, p: 0.60, tluszcz: 3.0, wlokno: 5.0, na: 0.15 },
    { okres: 'Powyżej 8 tygodni', em: 10.5, bialko: 14.0, ca: 0.9, p: 0.55, tluszcz: 2.5, wlokno: 8.0, na: 0.15 }
  ],
  'indyki': [
    { okres: 'Zarodowe', em: 11.8, bialko: 19.0, ca: 3.5, p: 0.58, tluszcz: 3.3, wlokno: 4.0, na: 0.16, k: 0.58, mg: 0.048, mn: 105, zn: 85, se: 0.32, fe: 62, i: 1.1 },
    { okres: '1-4 tygodnie', em: 11.9, bialko: 28.0, ca: 1.2, p: 0.80, tluszcz: 3.5, wlokno: 3.5, na: 0.16 },
    { okres: '5-8 tygodni', em: 12.1, bialko: 24.0, ca: 1.1, p: 0.70, tluszcz: 4.0, wlokno: 4.0, na: 0.16 },
    { okres: '9-12 tygodni', em: 12.3, bialko: 20.0, ca: 1.0, p: 0.65, tluszcz: 4.5, wlokno: 4.5, na: 0.15 },
    { okres: '13-16 tygodni', em: 12.5, bialko: 17.0, ca: 1.0, p: 0.60, tluszcz: 5.0, wlokno: 5.0, na: 0.15 },
    { okres: 'Powyżej 16 tygodni', em: 12.1, bialko: 14.0, ca: 1.0, p: 0.55, tluszcz: 4.5, wlokno: 6.0, na: 0.15 }
  ]
};

export const TYPY_DROBIU: { value: string; label: string }[] = [
  { value: 'kury-nioski-lekkie', label: '🐔 Kury nioski - lekkie' },
  { value: 'kury-nioski-ciezkie', label: '🐔 Kury nioski - ciężkie' },
  { value: 'brojlery', label: '🍗 Brojlery (kurczęta mięsne)' },
  { value: 'kaczki', label: '🦆 Kaczki' },
  { value: 'gesi', label: '🦢 Gęsi' },
  { value: 'indyki', label: '🦃 Indyki' }
];
