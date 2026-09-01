/**
 * Typy panelu pytań. Plik pisany ręcznie — dane obok niego (panelPytan*.ts) są
 * GENEROWANE ze wspólnego źródła `data/pytania/<slug>.json` przez
 * `scripts/gen-panel-pytan.py`. Ten sam skrypt wstrzykuje panel do mirrora,
 * więc obie warstwy powstają z jednego pliku i nie mogą się rozjechać.
 */

export interface LinkNarzedzia {
  /** Etykieta zaczyna się od czasownika („wystaw fakturę"), nie od nazwy narzędzia. */
  etykieta: string;
  url: string;
  /** Domena zewnętrzna (Fermly) — oznaczana osobno w pomiarze. */
  zewnetrzna: boolean;
}

export interface PunktPanelu {
  /** Stabilny między wdrożeniami — służy za wymiar w GA4. NIGDY nie indeks listy. */
  id: string;
  pytanie: string;
  odpowiedz: string;
  /** Identyfikator sekcji na TEJ SAMEJ stronie. Domyślnie ten sam w obu warstwach —
   *  `kotwicaReact` nadpisuje go tam, gdzie warstwy dzielą treść inaczej (np. mirror
   *  ma osobną sekcję o ewidencji, a React trzyma ją wewnątrz sekcji o fakturze). */
  kotwica: string;
  kotwicaEtykieta: string;
  narzedzia: LinkNarzedzia[];
}

export interface DanePanelu {
  slug: string;
  trasaReact: string;
  /** Zdanie pod nagłówkiem panelu — inne na każdej stronie, więc pochodzi z danych. */
  wstep: string;
  punkty: PunktPanelu[];
}
