import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NormaDrobiu } from "@/data/normyDrobiu";
import type { OcenaNormy } from "@/lib/bilansPaszy";

/**
 * Wspólne klocki kalkulatora pasz po przebudowie wyglądu (24.10.2026).
 * Tylko wygląd: oceny norm i dobór liczy src/lib/bilansPaszy.ts.
 */

/** Liczba po polsku, z przecinkiem. Bez `miejsca` tyle cyfr po przecinku, ile ma liczba. */
export const liczbaPL = (x: number, miejsca?: number) =>
  x.toLocaleString("pl-PL", miejsca === undefined
    ? { maximumFractionDigits: 3 }
    : { minimumFractionDigits: miejsca, maximumFractionDigits: miejsca });

/** Jednostka po liczbie: procent bez spacji, reszta ze spacją. */
export const zJednostka = (tekst: string, jedn: string) => (jedn === "%" ? `${tekst}%` : `${tekst} ${jedn}`);

export type PoleParametru = keyof Omit<NormaDrobiu, "okres" | "tluszcz">;

/**
 * Parametry porównywane z normą, w kolejności na stronie. Tolerancje i liczby miejsc
 * są te same co przed przebudową: `tol` barwi wynik, ostrzeżenie (z tolerancją 0,15)
 * pokazuje się tylko przy parametrach z `ostrzezenie`, a podpowiedzi składników
 * tylko tam, gdzie jest `podpowiedz`.
 */
export const PARAMETRY: Array<{
  pole: PoleParametru;
  nazwa: string;
  skrot: string;
  jedn: string;
  miejsca: number;
  tol: number;
  ostrzezenie?: { miejsca: number; podpowiedz?: { miejsca: number; dopisek: string } };
}> = [
  { pole: "em", nazwa: "Energia (EM)", skrot: "EM", jedn: "MJ/kg", miejsca: 2, tol: 0.05 },
  // Białko, wapń i fosfor dobiera algorytm, ale gdy w mieszance nie ma ich źródła
  // (np. kredy), dobór nic nie poradzi: od 24.10.2026 też dostają propozycje uzupełnienia.
  { pole: "bialko", nazwa: "Białko", skrot: "białko", jedn: "%", miejsca: 2, tol: 0.05, ostrzezenie: { miejsca: 2, podpowiedz: { miejsca: 1, dopisek: "% białka" } } },
  { pole: "ca", nazwa: "Wapń (Ca)", skrot: "Ca", jedn: "%", miejsca: 2, tol: 0.1, ostrzezenie: { miejsca: 2, podpowiedz: { miejsca: 1, dopisek: "% Ca" } } },
  { pole: "p", nazwa: "Fosfor (P)", skrot: "P", jedn: "%", miejsca: 2, tol: 0.1, ostrzezenie: { miejsca: 2, podpowiedz: { miejsca: 1, dopisek: "% P" } } },
  { pole: "wlokno", nazwa: "Włókno", skrot: "włókno", jedn: "%", miejsca: 2, tol: 0.15, ostrzezenie: { miejsca: 2 } },
  { pole: "na", nazwa: "Sód (Na)", skrot: "Na", jedn: "%", miejsca: 2, tol: 0.1, ostrzezenie: { miejsca: 3, podpowiedz: { miejsca: 2, dopisek: "% Na" } } },
  { pole: "k", nazwa: "Potas (K)", skrot: "K", jedn: "%", miejsca: 2, tol: 0.1, ostrzezenie: { miejsca: 3, podpowiedz: { miejsca: 2, dopisek: "% K" } } },
  { pole: "mg", nazwa: "Magnez (Mg)", skrot: "Mg", jedn: "%", miejsca: 3, tol: 0.1, ostrzezenie: { miejsca: 3, podpowiedz: { miejsca: 2, dopisek: "% Mg" } } },
  { pole: "mn", nazwa: "Mangan (Mn)", skrot: "Mn", jedn: "mg/kg", miejsca: 1, tol: 0.1, ostrzezenie: { miejsca: 1, podpowiedz: { miejsca: 0, dopisek: " mg/kg Mn" } } },
  { pole: "zn", nazwa: "Cynk (Zn)", skrot: "Zn", jedn: "mg/kg", miejsca: 1, tol: 0.1, ostrzezenie: { miejsca: 1, podpowiedz: { miejsca: 0, dopisek: " mg/kg Zn" } } },
  { pole: "se", nazwa: "Selen (Se)", skrot: "Se", jedn: "mg/kg", miejsca: 2, tol: 0.1, ostrzezenie: { miejsca: 2, podpowiedz: { miejsca: 2, dopisek: " mg/kg Se" } } },
  { pole: "fe", nazwa: "Żelazo (Fe)", skrot: "Fe", jedn: "mg/kg", miejsca: 1, tol: 0.1, ostrzezenie: { miejsca: 1, podpowiedz: { miejsca: 0, dopisek: " mg/kg Fe" } } },
  { pole: "i", nazwa: "Jod (I)", skrot: "I", jedn: "mg/kg", miejsca: 2, tol: 0.1, ostrzezenie: { miejsca: 2, podpowiedz: { miejsca: 2, dopisek: " mg/kg I" } } },
];

export const OPIS_OCENY: Record<OcenaNormy, string> = {
  ok: "w normie",
  "za-nisko": "za mało",
  "za-wysoko": "za dużo",
};

/** Klasy znacznika oceny: zielony w normie, rdzawy poza nią; obie wersje także w trybie ciemnym. */
export const klasyOceny = (ocena: OcenaNormy) =>
  ocena === "ok"
    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
    : "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200";

/** Karta jednego kroku kalkulatora z numerem w kółku. */
export function Sekcja({
  nr, tytul, prawa, id, className, children,
}: {
  nr: number;
  tytul: string;
  prawa?: ReactNode;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("rounded-lg border border-border bg-card p-4 shadow-sm md:p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-xl leading-tight text-foreground">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-body text-sm font-bold text-primary-foreground">
            {nr}
          </span>
          {tytul}
        </h2>
        {prawa}
      </div>
      {children}
    </section>
  );
}

export interface KomunikatKalkulatora {
  rodzaj: "ok" | "uwaga" | "blad";
  tytul: string;
  tresc?: string;
  /** Surowe sugestie z bilansPaszy.ts: pierwsza linia to tytuł, kolejne zaczynają się od „→”. */
  sugestie?: string[];
  dopisek?: string;
}

// Sugestie z bilansPaszy.ts są wspólne z serwerem MCP, więc zostają tekstem z emoji
// i WIELKIMI tytułami. Na stronie tylko je porządkujemy: tytuł zwykłymi literami,
// strzałki jako lista.
const bezZnakowNaPoczatku = (linia: string) => linia.replace(/^[\s→•\p{Extended_Pictographic}️]+/u, "");
const zwyklymiLiterami = (t: string) => {
  const male = t.toLocaleLowerCase("pl-PL");
  return male.charAt(0).toLocaleUpperCase("pl-PL") + male.slice(1);
};

function Sugestia({ tekst }: { tekst: string }) {
  const [pierwsza, ...reszta] = tekst.split("\n");
  const tytul = zwyklymiLiterami(bezZnakowNaPoczatku(pierwsza).replace(/:\s*$/, ""));
  return (
    <div>
      <p className="font-semibold">{tytul}</p>
      <ul className="mt-0.5 list-disc space-y-0.5 pl-5">
        {reszta.map((linia, i) => (
          <li key={i} className={linia.startsWith("  •") ? "ml-4 list-[circle]" : undefined}>
            {bezZnakowNaPoczatku(linia)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Komunikat zamiast okienka alert(): stoi przy przyciskach albo nad wynikiem i da się go zamknąć. */
export function Komunikat({ komunikat, onZamknij }: { komunikat: KomunikatKalkulatora; onZamknij: () => void }) {
  const { rodzaj, tytul, tresc, sugestie, dopisek } = komunikat;
  const Ikona = rodzaj === "ok" ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={rodzaj === "blad" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border py-2.5 pl-3 pr-1 text-sm",
        rodzaj === "ok" && "border-green-300 bg-green-50 text-green-950 dark:border-green-800 dark:bg-green-950/40 dark:text-green-100",
        rodzaj === "uwaga" && "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
        rodzaj === "blad" && "border-destructive/40 bg-destructive/10 text-foreground",
      )}
    >
      <Ikona
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0",
          rodzaj === "ok" && "text-green-700 dark:text-green-400",
          rodzaj === "uwaga" && "text-amber-700 dark:text-amber-400",
          rodzaj === "blad" && "text-destructive",
        )}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-bold">{tytul}</p>
        {tresc && <p>{tresc}</p>}
        {sugestie?.map((s, i) => <Sugestia key={i} tekst={s} />)}
        {dopisek && <p>{dopisek}</p>}
      </div>
      <button
        type="button"
        onClick={onZamknij}
        aria-label="Zamknij komunikat"
        className="-mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md opacity-70 hover:bg-foreground/10 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
