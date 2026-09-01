/**
 * Typy kalkulatora pasz, wyniesione z komponentu strony, bo używa ich też hook
 * zapisywania receptur (useFeedRecipes). Trzymanie ich w pliku strony wymuszałoby
 * import z komponentu do hooka — czyli zależność w złą stronę.
 */

/** Jeden wiersz tabeli składników. Pola liczbowe bywają stringiem, bo pochodzą
 *  wprost z pól formularza i użytkownik może je zostawić puste. */
export interface Skladnik {
  nazwa: string;
  procent: string | number;
  em: string | number;
  bialko: string | number;
  ca: string | number;
  p: string | number;
  wlokno: string | number;
  cena: string;
  na: string | number;
  k: string | number;
  mg: string | number;
  mn: string | number;
  zn: string | number;
  se: string | number;
  fe: string | number;
  i: string | number;
}

/**
 * Co ląduje w kolumnie `skladniki` (jsonb) tabeli `feed_recipes`.
 *
 * Sama lista składników nie wystarcza do odtworzenia mieszanki — bez gatunku
 * i okresu nie wiadomo, wobec jakiej normy była liczona, a to ta norma decyduje,
 * czy wynik był dobry. Dlatego zapisujemy komplet, a `wersja` pozwoli kiedyś
 * odczytać stare zapisy po zmianie kształtu danych.
 */
export interface ZapisanaMieszanka {
  wersja: 1;
  drob: string;
  okres: string;
  pozycje: Skladnik[];
}
