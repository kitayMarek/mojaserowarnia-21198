/**
 * Mleczne przetwory — jogurty, kefiry, serki homogenizowane i sery kwasowe.
 *
 * DLACZEGO OSOBNO OD `recipesData`: tamta lista opisuje sery PODPUSZCZKOWE i z niej
 * generują się filtry (trudność, czas dojrzewania, wartości odżywcze) oraz dane
 * strukturalne `ItemList`. Jogurt nie ma czasu dojrzewania ani podpuszczki, więc
 * wrzucenie go tam popsułoby filtry, a nie naprawiłoby widoczności.
 *
 * DLACZEGO WŁASNY PLIK, A NIE LISTA W KOMPONENCIE: te same pozycje pokazują się
 * w trzech miejscach — w menu (`navItems.ts`), w kafelkach na `/przepisy` i w hubie
 * warstwy statycznej. Wpisane ręcznie w każdym z nich rozjechałyby się przy pierwszym
 * dodaniu wariantu; ten plik jest jedynym źródłem dla warstwy React.
 *
 * Liczba mnoga w nazwie działu jest celowa — dojdą warianty (jogurt grecki, kefir
 * z mleka koziego, serek smakowy).
 */

export interface MlecznyProdukt {
  /** Ostatni segment trasy: /przepisy/<slug> */
  slug: string;
  label: string;
  /** Krótka nota pod nazwą — to, co odróżnia ten przepis od pozostałych. */
  opis: string;
}

export const mleczneProdukty: MlecznyProdukt[] = [
  {
    slug: "serek-homogenizowany",
    label: "Serek homogenizowany",
    opis: "typu Danio · z własnego twarogu · 2× więcej białka",
  },
  {
    slug: "jogurt-domowy",
    label: "Domowy jogurt",
    opis: "42–45°C, 4–8 h · także bez jogurtownicy · jogurt grecki",
  },
  {
    slug: "kefir-domowy",
    label: "Domowy kefir",
    opis: "grzybki tybetańskie · 20–25°C · także z kefiru sklepowego",
  },
  {
    slug: "ser-z-jogurtu",
    label: "Ser i twaróg z jogurtu",
    opis: "labneh · twaróg z kefiru · masło z fermentowanej śmietany",
  },
];

export const sciezkaMlecznegoProduktu = (slug: string) => `/przepisy/${slug}`;
