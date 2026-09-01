/**
 * Wysyłka zdarzeń do GA4 (identyfikator w index.html).
 *
 * DLACZEGO OSOBNY PLIK: dotąd każde zdarzenie było pisane w miejscu użycia jako
 * `(window as any).gtag(...)` z własnym `typeof window` przed nim. Przy trzech
 * zdarzeniach panelu pytań to byłoby sześć powtórzeń tego samego warunku i sześć
 * miejsc, w których łatwo pomylić nazwę parametru — a nazwa parametru w GA4 jest
 * kontraktem: raz wysłana źle, psuje porównywalność danych w czasie.
 *
 * Zdarzenia MOGĄ nie dotrzeć, zanim użytkownik zaakceptuje ciasteczka (serwis ma
 * tryb zgody — patrz App.tsx). To nie jest błąd do obejścia: przed zgodą po prostu
 * nie mierzymy. Przy weryfikacji w DebugView trzeba najpierw kliknąć zgodę.
 */

type Parametry = Record<string, string | number | boolean | undefined>;

function wyslij(nazwa: string, parametry: Parametry): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', nazwa, parametry);
}

/** Rozwinięcie punktu w panelu. Wysyłane TYLKO przy otwarciu, nie przy zamknięciu. */
export function zdarzeniePanelRozwin(strona: string, pytanieId: string, pozycjaNaLiscie: number): void {
  wyslij('panel_pytanie_rozwin', { strona, pytanie_id: pytanieId, pozycja_na_liscie: pozycjaNaLiscie });
}

/** Link typu A — kotwica do źródła na tej samej stronie. */
export function zdarzeniePanelZrodlo(strona: string, pytanieId: string, kotwicaDocelowa: string): void {
  wyslij('panel_link_zrodlo', { strona, pytanie_id: pytanieId, kotwica_docelowa: kotwicaDocelowa });
}

/** Link typu B — przejście do narzędzia. Domena zewnętrzna oznaczana osobno, bo w GA4
 *  serowarni jest wyjściem, a w GA4 Fermly ruchem z poleceń — bez tego nie da się ich zestawić. */
export function zdarzeniePanelNarzedzie(
  strona: string, pytanieId: string, urlDocelowy: string, czyZewnetrznaDomena: boolean,
): void {
  wyslij('panel_link_narzedzie', {
    strona, pytanie_id: pytanieId, url_docelowy: urlDocelowy, czy_zewnetrzna_domena: czyZewnetrznaDomena,
  });
}
