import { useMemo } from "react";
import { Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NormaDrobiu } from "@/data/normyDrobiu";
import type { DodatekPaszowy } from "@/data/dodatkiPaszowe";
import { koncentratZeZbozem, sprawdzNorme, TOLERANCJE, zawartosc, type PozycjaMieszanki, type UdzialyKoncentratu } from "@/lib/bilansPaszy";
import { OPIS_OCENY, klasyOceny, liczbaPL } from "@/components/kalkulator/wspolne";

/**
 * „Koncentrat + Twoje zboże” (od 24.10.2026), na karcie koncentratu z przepisem
 * na etykiecie. Liczy dwie mieszanki ze zbożami, które użytkownik ma w kalkulatorze:
 * proporcje z etykiety i udział koncentratu do normy białka przy TYCH zbożach.
 * Logika: koncentratZeZbozem() w src/lib/bilansPaszy.ts.
 */

const OCENIANE = [
  ["em", "Energia", " MJ/kg", 2],
  ["bialko", "Białko", "%", 1],
  ["ca", "Wapń", "%", 2],
  ["p", "Fosfor", "%", 2],
] as const;

function Kolumna({
  tytul, udzialy, norma, onWstaw,
}: {
  tytul: string;
  udzialy: UdzialyKoncentratu;
  norma?: NormaDrobiu | null;
  onWstaw: () => void;
}) {
  const zboza = udzialy.zboza.reduce((a, z) => a + z.procent, 0);
  return (
    <div className="flex flex-col rounded-md border border-border p-2.5">
      <p className="text-sm font-bold">{tytul}</p>
      <ul className="mt-1 space-y-0.5 text-sm">
        <li className="flex justify-between gap-2"><span>koncentrat</span><strong className="tabular-nums">{liczbaPL(udzialy.koncentrat, 1)}%</strong></li>
        {udzialy.inne.map((d) => (
          <li key={d.tekst} className="flex justify-between gap-2"><span>{d.tekst}</span><strong className="tabular-nums">{liczbaPL(d.procent, 1)}%</strong></li>
        ))}
        <li className="flex justify-between gap-2"><span>Twoje zboża</span><strong className="tabular-nums">{liczbaPL(zboza, 1)}%</strong></li>
        {udzialy.zboza.length > 1 && udzialy.zboza.map((z) => (
          <li key={z.nazwa} className="flex justify-between gap-2 pl-3 text-xs text-muted-foreground"><span>{z.nazwa}</span><span className="tabular-nums">{liczbaPL(z.procent, 1)}%</span></li>
        ))}
      </ul>
      <ul className="mt-2 space-y-1 border-t border-border pt-2 text-xs">
        {OCENIANE.map(([pole, nazwa, jedn, miejsca]) => {
          const wynik = zawartosc(udzialy.mieszanka, pole);
          const n = norma?.[pole];
          const ocena = n ? sprawdzNorme(wynik, n, TOLERANCJE[pole]) : null;
          return (
            <li key={pole} className="flex items-center justify-between gap-2">
              <span>{nazwa} {liczbaPL(wynik, miejsca)}{jedn}</span>
              {ocena && <span className={cn("rounded-full px-1.5 py-0.5 font-bold", klasyOceny(ocena))}>{OPIS_OCENY[ocena]}</span>}
            </li>
          );
        })}
      </ul>
      <Button type="button" variant="outline" className="mt-2.5 h-10 border-primary/60 text-primary" onClick={onWstaw}>
        Wstaw do kalkulatora
      </Button>
    </div>
  );
}

export default function KoncentratZeZbozemSekcja({
  koncentrat, pozycje, baza, norma, onWstaw,
}: {
  koncentrat: DodatekPaszowy;
  pozycje: PozycjaMieszanki[];
  baza: PozycjaMieszanki[];
  norma?: NormaDrobiu | null;
  /** Podmienia mieszankę w kalkulatorze na podane wiersze (nazwy z bazy surowców, udziały w %). */
  onWstaw: (mieszanka: { nazwa: string; procent: number }[], opis: string) => void;
}) {
  const wynik = useMemo(
    () => koncentratZeZbozem({ ...koncentrat, procent: 0 }, pozycje, baza, norma),
    [koncentrat, pozycje, baza, norma],
  );
  const wstaw = (u: UdzialyKoncentratu, opis: string) =>
    onWstaw(u.mieszanka.map((s) => ({ nazwa: s.nazwa, procent: s.procent })), opis);

  return (
    <section className="mt-4 rounded-lg border-2 border-primary/30 bg-primary/5 p-3">
      <h3 className="flex items-center gap-2 font-body text-base font-bold">
        <Wheat className="h-5 w-5 text-primary" aria-hidden="true" />
        Koncentrat + Twoje zboże
      </h3>
      {!wynik ? (
        <p className="mt-1 text-sm">
          Dodaj do mieszanki zboża, które masz (np. pszenicę, kukurydzę, jęczmień), a policzę, ile koncentratu do nich dosypać
          i jak wyjdą białko, energia, wapń i fosfor.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm">
            Twoje zboża: {wynik.zEtykiety.zboza.map((z) => z.nazwa).join(", ")}
            {wynik.zEtykiety.zboza.length > 1 && " (w proporcjach z Twojej mieszanki)"}.
            {norma
              ? ` Z proporcjami z etykiety białko wychodzi ${liczbaPL(wynik.bialkoZEtykiety, 1)}% przy normie ${liczbaPL(norma.bialko)}%.`
              : " Wybierz gatunek i okres w kroku 1, a porównam wynik z normą."}
          </p>
          <div className={cn("mt-2.5 grid gap-2", wynik.doNormyBialka && "sm:grid-cols-2")}>
            <Kolumna
              tytul={`Z etykiety (${liczbaPL(wynik.przepis.koncentrat)}%)`}
              udzialy={wynik.zEtykiety}
              norma={norma}
              onWstaw={() => wstaw(wynik.zEtykiety, `${koncentrat.nazwa}: proporcje z etykiety`)}
            />
            {wynik.doNormyBialka && (
              <Kolumna
                tytul={`Do normy białka (${liczbaPL(wynik.doNormyBialka.koncentrat, 1)}%)`}
                udzialy={wynik.doNormyBialka}
                norma={norma}
                onWstaw={() => wstaw(wynik.doNormyBialka!, `${koncentrat.nazwa}: udział do normy białka`)}
              />
            )}
          </div>
          {wynik.nierozpoznane.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Nie mam w bazie: {wynik.nierozpoznane.join(", ")}. Ich udział liczę, ale bez składu.
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Udział do normy białka to obliczenie ze składu wzorcowego zbóż. Producent podaje proporcje z etykiety;
            jeśli odchodzisz od nich, sprawdź wapń i fosfor w wyniku. Dodatki z przepisu biorę w dolnej dawce z etykiety.
          </p>
        </>
      )}
    </section>
  );
}
