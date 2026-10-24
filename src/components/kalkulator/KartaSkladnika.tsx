import { memo, useState, type InputHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronDown, Trash2 } from "lucide-react";
import WyborSkladnika, { type PozycjaDoWyboru } from "@/components/kalkulator/WyborSkladnika";
import { liczbaPL } from "@/components/kalkulator/wspolne";
import { cn } from "@/lib/utils";
import type { Skladnik } from "@/types/kalkulatorPasz";

/**
 * Jeden składnik mieszanki jako karta (24.10.2026, zamiast wiersza tabeli na 9–11 kolumn).
 *
 * Na wierzchu tylko to, co zmienia się przy każdej mieszance: nazwa, udział, cena.
 * Wartości odżywcze i limity udziału chowają się pod „Skład i limity”, bo wpisują się
 * same po wybraniu składnika z listy. Na telefonie dwa rzędy, od 640 px jeden.
 *
 * Zalecany udział dla tych ptaków (src/data/udzialySurowcow.ts) widać od razu pod
 * składnikiem. Przekroczyć go wolno, własnym „do” w „Skład i limity” albo ręcznie,
 * ale wtedy karta pokazuje ostrzeżenie o zdrowiu ptaków (decyzja Marka 24.10.2026).
 *
 * memo: karta przerysowuje się tylko wtedy, gdy zmienił się jej własny wiersz.
 * Dlatego strona musi podmieniać wiersz na nowy obiekt, a nie zmieniać go w miejscu,
 * a zalecenie dostaje jako proste wartości, nie jako nowy obiekt przy każdym rysowaniu.
 */

/** Szerokości kolumn wspólne dla kart i nagłówka nad nimi (widać go od 640 px). */
export const SZER_UDZIAL = "w-[5.5rem]";
export const SZER_CENA = "w-28";
export const SZER_PRZYCISKI = "sm:w-[5.5rem]";

// Bez strzałek przy polach liczbowych: na komputerze zjadały miejsce i ucinały udział („21,1”).
export const KLASA_POLA_LICZBY =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-right text-base text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-ring [-moz-appearance:textfield] " +
  "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

/** Pole liczbowe z jednostką w środku, przy prawej krawędzi. */
function PoleZJednostka({
  jednostka, className, ...props
}: { jednostka: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative shrink-0", className)}>
      <input
        type="number"
        inputMode="decimal"
        className={cn(KLASA_POLA_LICZBY, jednostka.length > 2 ? "pr-12" : "pr-8")}
        {...props}
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        {jednostka}
      </span>
    </div>
  );
}

const WARTOSCI: Array<{ pole: keyof Skladnik; etykieta: string; krok: string }> = [
  { pole: "em", etykieta: "EM MJ/kg", krok: "0.1" },
  { pole: "bialko", etykieta: "Białko %", krok: "0.1" },
  { pole: "ca", etykieta: "Ca %", krok: "0.01" },
  { pole: "p", etykieta: "P %", krok: "0.01" },
  { pole: "wlokno", etykieta: "Włókno %", krok: "0.1" },
];

function KartaSkladnika({
  skladnik, idx, pozycje, zalecenie, zalecaneMaks, powod, ostrzezenie, stalaDawka, dawkaDomyslna,
  znaczniki, produkt, onKartaProduktu, onZmiana, onUsun,
}: {
  skladnik: Skladnik;
  idx: number;
  pozycje: PozycjaDoWyboru[];
  /** Zalecany udział słowami, np. „do 20%, z enzymem do 30%”; null, gdy surowiec nie ma ograniczeń. */
  zalecenie: string | null;
  /** Zalecane maksimum w % (0 = nie stosować); null, gdy brak. */
  zalecaneMaks: number | null;
  /** Dlaczego się ogranicza i czym grozi przekroczenie (z udzialySurowcow.ts). */
  powod: string;
  ostrzezenie: string;
  /** Dodatek w stałej dawce (sól, premiks, aminokwas, enzym): dobór nie zmienia jego udziału. */
  stalaDawka: boolean;
  /** Dawka przyjmowana bez wpisu (sól 0,3%, premiks z nazwy); 0 = trzeba wpisać z etykiety. */
  dawkaDomyslna: number;
  /** GMO i chów ekologiczny słowami (od 24.10.2026), np. „bez GMO · eko: nie oceniano”. */
  znaczniki: string;
  /** Składnik to produkt z bazy dodatków: ma kartę z producentem i ofertami. */
  produkt: boolean;
  onKartaProduktu: (nazwa: string) => void;
  onZmiana: (idx: number, pole: string, wartosc: string) => void;
  onUsun: (idx: number) => void;
}) {
  const [otwarty, setOtwarty] = useState(false);
  const nazwa = skladnik.nazwa || "składnik";
  const idPanelu = `sklad-skladnika-${idx}`;
  // Ta sama granica co ostrzeżenie w sugestiach bilansPaszy.ts (maksimum + 0,05).
  const przekroczone = zalecaneMaks != null && (parseFloat(String(skladnik.procent)) || 0) > zalecaneMaks + 0.05;

  return (
    <div className="rounded-lg border border-border bg-background/60 p-2.5">
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <div className="min-w-0 flex-1 basis-[calc(100%-6rem)] sm:basis-auto">
          <WyborSkladnika
            wartosc={skladnik.nazwa}
            pozycje={pozycje}
            onZmiana={(n) => onZmiana(idx, "nazwa", n)}
            className="h-11 min-w-0 text-base"
          />
        </div>
        <PoleZJednostka
          jednostka="%"
          className={SZER_UDZIAL}
          step="0.1"
          value={skladnik.procent}
          onChange={(e) => onZmiana(idx, "procent", e.target.value)}
          aria-label={`Udział w procentach: ${nazwa}`}
        />
        <div className="flex w-full items-center gap-1 sm:w-auto sm:gap-2">
          <PoleZJednostka
            jednostka="zł/kg"
            className={SZER_CENA}
            step="0.01"
            value={skladnik.cena}
            onChange={(e) => onZmiana(idx, "cena", e.target.value)}
            placeholder="cena"
            aria-label={`Cena w złotych za kilogram: ${nazwa}`}
          />
          <div className={cn("ml-auto flex items-center", SZER_PRZYCISKI)}>
            <button
              type="button"
              onClick={() => setOtwarty((o) => !o)}
              aria-expanded={otwarty}
              aria-controls={idPanelu}
              title="Skład i limity"
              className="flex h-10 items-center gap-1 rounded-md px-1.5 text-sm font-semibold text-primary hover:bg-primary/10 sm:w-10 sm:justify-center"
            >
              <span className="sm:sr-only">Skład i limity</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", otwarty && "rotate-180")} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onUsun(idx)}
              aria-label={`Usuń: ${nazwa}`}
              title="Usuń składnik"
              className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {zalecenie && (
        <p className="mt-1.5 px-0.5 text-xs text-muted-foreground">
          Zalecane dla tych ptaków: <strong className="font-semibold text-foreground">{zalecenie}</strong>
          {stalaDawka && (
            <>
              . Dawka stała z etykiety, dobór jej nie zmienia
              {!(parseFloat(String(skladnik.procent)) > 0) && (dawkaDomyslna > 0
                ? `; bez wpisu przyjmę ${liczbaPL(dawkaDomyslna)}%`
                : "; wpisz ją w polu udziału")}
              .
            </>
          )}
        </p>
      )}
      {przekroczone && (
        <div className="mt-2 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-2 text-sm text-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-semibold">
              {zalecaneMaks === 0
                ? "Tego surowca nie zaleca się dla tych ptaków"
                : `Powyżej zalecanego udziału (najwyżej ${liczbaPL(zalecaneMaks)}%)`}
            </p>
            <p>{ostrzezenie}</p>
          </div>
        </div>
      )}

      {otwarty && (
        <div id={idPanelu} className="mt-2.5 border-t border-border pt-3">
          {zalecenie && (
            <div className="mb-3 rounded-md bg-muted/60 p-2.5 text-xs">
              <p className="font-semibold">Zalecane {zalecenie}</p>
              <p className="mt-0.5">{powod}</p>
              <Link to="/pasze/udzial-surowcow" className="mt-1 inline-block font-semibold text-primary underline-offset-4 hover:underline">
                Skąd te granice?
              </Link>
            </div>
          )}
          {(produkt || znaczniki) && (
            <p className="mb-2 text-xs text-muted-foreground">
              {znaczniki}
              {produkt && (
                <>
                  {znaczniki && " · "}
                  <button type="button" onClick={() => onKartaProduktu(skladnik.nazwa)} className="font-semibold text-primary underline-offset-4 hover:underline">
                    Karta produktu: skład z etykiety i ceny
                  </button>
                </>
              )}
            </p>
          )}
          <p className="mb-2 text-xs text-muted-foreground">
            Wartości z bazy surowców. Zmiana działa tylko w tej mieszance.
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {WARTOSCI.map(({ pole, etykieta, krok }) => (
              <label key={pole} className="block">
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">{etykieta}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step={krok}
                  value={skladnik[pole] as string | number}
                  onChange={(e) => onZmiana(idx, pole, e.target.value)}
                  className={cn(KLASA_POLA_LICZBY, "h-10")}
                />
              </label>
            ))}
          </div>

          <p className="mb-1.5 mt-3 text-sm font-semibold">Udział przy doborze</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">od</span>
            <PoleZJednostka
              jednostka="%"
              className="w-24"
              step="1"
              min="0"
              max="100"
              value={skladnik.min ?? ""}
              onChange={(e) => onZmiana(idx, "min", e.target.value)}
              placeholder="0"
              aria-label={`Najmniejszy udział: ${nazwa}`}
            />
            <span className="text-sm text-muted-foreground">do</span>
            <PoleZJednostka
              jednostka="%"
              className="w-24"
              step="1"
              min="0"
              max="100"
              value={skladnik.max ?? ""}
              onChange={(e) => onZmiana(idx, "max", e.target.value)}
              placeholder={zalecaneMaks != null ? String(zalecaneMaks) : ""}
              aria-label={`Największy udział: ${nazwa}`}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {zalecaneMaks == null
              ? "Puste pole „do” oznacza brak górnej granicy. "
              : zalecaneMaks === 0
                ? "Dobór da temu surowcowi 0%, chyba że wpiszesz własne „do”. "
                : `Puste pole „do” oznacza zalecane najwyżej ${liczbaPL(zalecaneMaks)}%. `}
            {zalecaneMaks != null && "Wyższe „do” pozwoli doborowi przekroczyć zalecenie, wtedy pokażę ostrzeżenie. "}
            „Od” przydaje się, gdy składnik ma być główny, np. własna pszenica od 40%.
          </p>
        </div>
      )}
    </div>
  );
}

export default memo(KartaSkladnika);
