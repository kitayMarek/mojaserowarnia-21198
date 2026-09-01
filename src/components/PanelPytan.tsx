import { Link } from "react-router-dom";
import { ArrowRight, CornerDownRight, HelpCircle } from "lucide-react";
import type { DanePanelu } from "@/data/panelPytanTypy";
import { PANEL_PYTAN_WLACZONY } from "@/config/panelPytan";
import {
  zdarzeniePanelNarzedzie,
  zdarzeniePanelRozwin,
  zdarzeniePanelZrodlo,
} from "@/lib/zdarzeniaGa4";

/**
 * Panel pytań — lista pytań użytkownika u góry strony treści.
 *
 * DLACZEGO `<details>`, A NIE STAN REACTA: odpowiedzi muszą być w HTML od razu,
 * bez interakcji. To warunek z zlecenia i sedno całości — format pytanie-odpowiedź
 * jest tym, co modele językowe cytują najchętniej, a bot nigdy nic nie kliknie.
 * Zwijanie jest więc wyłącznie wizualne: treść leży w DOM, przeglądarka tylko ją
 * chowa. Stan Reacta („pokaż po kliknięciu") dałby pusty panel dla każdego bota.
 *
 * Ten sam powód stoi za tym, że mirror dostaje identyczną strukturę z tego samego
 * źródła danych (patrz scripts/gen-panel-pytan.py) — mirrory zbierają cytowania,
 * więc panel nieobecny w mirrorze traciłby połowę sensu.
 */
export default function PanelPytan({ dane }: { dane: DanePanelu }) {
  if (!PANEL_PYTAN_WLACZONY || dane.punkty.length === 0) return null;

  return (
    <section
      aria-labelledby="panel-pytan-tytul"
      className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-5 md:p-6"
    >
      <h2 id="panel-pytan-tytul" className="mb-1 flex items-center gap-2 text-xl font-semibold">
        <HelpCircle className="h-5 w-5 text-primary" />
        Szybkie odpowiedzi
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {dane.wstep}
      </p>

      <ul className="space-y-2">
        {dane.punkty.map((punkt, indeks) => (
          <li key={punkt.id}>
            <details
              className="group rounded-md border border-border bg-card"
              onToggle={(zdarzenie) => {
                // Tylko otwarcie. Zamknięcie nie niesie informacji, a podwoiłoby liczby.
                if ((zdarzenie.currentTarget as HTMLDetailsElement).open) {
                  zdarzeniePanelRozwin(dane.trasaReact, punkt.id, indeks + 1);
                }
              }}
            >
              <summary className="cursor-pointer list-none px-4 py-3 font-medium marker:content-none">
                <span className="flex items-start justify-between gap-3">
                  <span>{punkt.pytanie}</span>
                  <span aria-hidden className="mt-1 shrink-0 text-primary transition-transform group-open:rotate-90">
                    ▸
                  </span>
                </span>
              </summary>

              <div className="border-t border-border px-4 py-3">
                <p className="text-sm leading-relaxed text-foreground/90">{punkt.odpowiedz}</p>

                {/* Typ A — kotwica na tej samej stronie. Zwykły <a href="#...">, nie <Link>:
                    router nie ma tu nic do roboty, a przeglądarka przewija natywnie i bez
                    przeładowania. Podświetlenie celu robi CSS przez :target. */}
                <p className="mt-3">
                  <a
                    href={`#${punkt.kotwica}`}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    onClick={() => zdarzeniePanelZrodlo(dane.trasaReact, punkt.id, punkt.kotwica)}
                  >
                    <CornerDownRight className="h-3.5 w-3.5" />
                    {punkt.kotwicaEtykieta}
                  </a>
                </p>

                {/* Typ B — wyjście do narzędzia. Wizualnie wyraźnie inne niż typ A,
                    żeby było widać, co przenosi gdzie indziej. */}
                {punkt.narzedzia.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {punkt.narzedzia.map((narzedzie) => {
                      const klasa =
                        "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-hover transition-colors";
                      const zmierz = () =>
                        zdarzeniePanelNarzedzie(dane.trasaReact, punkt.id, narzedzie.url, narzedzie.zewnetrzna);

                      return (
                        <li key={narzedzie.url + narzedzie.etykieta}>
                          {narzedzie.zewnetrzna ? (
                            <a href={narzedzie.url} target="_blank" rel="noopener noreferrer" className={klasa} onClick={zmierz}>
                              {narzedzie.etykieta}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <Link to={narzedzie.url} className={klasa} onClick={zmierz}>
                              {narzedzie.etykieta}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
