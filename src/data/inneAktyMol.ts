import type { InnyAkt } from "@/components/PodstawaPrawna";

// Akty, na których stoją strony MOL, a których nie ma w module Przepisy huba Dane Rolne.
// Numery i adresy ISAP sprawdzone w API ELI Sejmu 11.11.2026. Ustawa o produktach
// pochodzenia zwierzęcego jest od 11.11.2026 w hubie (klucz produkty-zwierzece).
export const ISAP_MOL = "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20160000451";

export const unijneHigiena: InnyAkt[] = [
  {
    tytul: "Rozporządzenie (WE) nr 852/2004 w sprawie higieny środków spożywczych",
    url: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0852",
  },
  {
    tytul: "Rozporządzenie (WE) nr 853/2004 ustanawiające szczególne przepisy dotyczące higieny w odniesieniu do żywności pochodzenia zwierzęcego",
    url: "https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX:32004R0853",
  },
];

export const inneAktyMol: InnyAkt[] = [
  {
    tytul:
      "Rozporządzenie MRiRW z dnia 18 marca 2013 r. w sprawie wymagań, jakie powinien spełniać projekt technologiczny zakładu, w którym ma być prowadzona działalność w zakresie produkcji produktów pochodzenia zwierzęcego",
    url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20130000434",
    opis: "(Dz.U. 2013 poz. 434), tekst jednolity Dz.U. 2022 poz. 1871: odnosi się do zakładów produkcyjnych, w tym przy MOL.",
  },
  ...unijneHigiena,
];
