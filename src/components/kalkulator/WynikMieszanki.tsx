import type { ReactNode } from "react";
import { Check, Plus, Wheat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NormaDrobiu } from "@/data/normyDrobiu";
import { opisJednegoSkladnika, sprawdzNorme, type JedenSkladnik, type Uzupelnienie } from "@/lib/bilansPaszy";
import {
  Komunikat, OPIS_OCENY, PARAMETRY, Sekcja, klasyOceny, liczbaPL, zJednostka,
  type KomunikatKalkulatora, type PoleParametru,
} from "@/components/kalkulator/wspolne";

/**
 * Krok 3: wynik mieszanki (24.10.2026). Zastępuje szary blok „Podsumowanie”,
 * osobne czerwone i żółte ramki ostrzeżeń oraz okienka alert() po doborze.
 *
 * Każdy parametr normy to jeden wiersz: wartość, ocena słowem i pasek, na którym
 * widać, jak daleko mieszanka jest od normy (norma w środku paska, ciemniejsze
 * pole to tolerancja). Ostrzeżenie z brakującą ilością i przyciski „dodaj składnik”
 * stoją pod swoim parametrem, a nie w osobnej liście niżej.
 *
 * Od 24.10.2026 propozycje biorą też produkty z bazy dodatków: pod przyciskami stoi
 * najtańsza oferta z datą ceny, koszt na ptaka przez 30 dni i link do karty produktu.
 */

const SKALA = 2; // pasek sięga do dwukrotności normy, więc norma wypada w połowie

/** Koszt i gdzie kupić pod propozycją produktu z bazy dodatków (od 24.10.2026). */
function KosztPropozycji({ u, dawkaG, onPokazKarte }: { u: Uzupelnienie; dawkaG: number; onPokazKarte: (nazwa: string) => void }) {
  if (!u.producent) return null;
  const sprawdzono = u.oferta ? new Date(`${u.oferta.sprawdzono}T12:00:00`).toLocaleDateString("pl-PL") : "";
  return (
    <li>
      <strong className="font-semibold text-foreground">{u.nazwa}</strong>
      {u.partner && <span className="ml-1 rounded bg-muted px-1 py-0.5 text-[11px]" title="Producent płaci za obecność w bazie, nie za miejsce na liście">partner</span>}
      {": "}
      {u.oferta ? (
        <>
          od {liczbaPL(u.oferta.cenaZaKg, 2)} zł/kg w sklepie {u.oferta.sklep} (cena z {sprawdzono})
          {u.kosztNaPtakaMiesiecznieZl != null
            ? `, ok. ${liczbaPL(u.kosztNaPtakaMiesiecznieZl, 2)} zł na ptaka przez 30 dni`
            : u.kosztNaKgPaszyZl != null && `, ${liczbaPL(u.kosztNaKgPaszyZl, 3)} zł na kg paszy${dawkaG > 0 ? "" : " (wpisz dawkę paszy w kroku 4, a policzę na ptaka)"}`}
        </>
      ) : "ceny w sklepach nie znaleźliśmy"}
      {". "}
      <button type="button" onClick={() => onPokazKarte(u.nazwa)} className="font-semibold text-primary underline-offset-4 hover:underline">
        Karta produktu
      </button>
    </li>
  );
}

function WierszNormy({
  nazwa, jedn, miejsca, tol, wartosc, norma, ostrzezenie, mieszankaGotowa, propozycjeUzupelnien, dawkaG, onDodaj, onPokazKarte,
}: {
  nazwa: string;
  jedn: string;
  miejsca: number;
  tol: number;
  wartosc: number;
  norma: number;
  ostrzezenie?: (typeof PARAMETRY)[number]["ostrzezenie"];
  mieszankaGotowa: boolean;
  propozycjeUzupelnien: () => Uzupelnienie[];
  /** Dawka paszy na ptaka dziennie (g); z nią przycisk pokazuje też gramy na sztukę. */
  dawkaG: number;
  onDodaj: (nazwa: string, procent?: number) => void;
  onPokazKarte: (nazwa: string) => void;
}) {
  const ocena = sprawdzNorme(wartosc, norma, tol);
  // Ostrzeżenie słowami: jak przed przebudową, z tolerancją 0,15 i tylko przy sumie 100%.
  const ocenaOstrzezenia = ostrzezenie && mieszankaGotowa ? sprawdzNorme(wartosc, norma, 0.15) : "ok";
  const roznica = Math.abs(norma - wartosc);
  const podpowiedz = ostrzezenie?.podpowiedz;
  const propozycje = ocenaOstrzezenia === "za-nisko" && podpowiedz ? propozycjeUzupelnien() : [];
  const nazwaParametru = (pole: string) => PARAMETRY.find((p) => p.pole === pole)?.nazwa.replace(/ \(.*\)$/, "").toLowerCase() ?? pole;
  const pozycja = Math.min(100, Math.max(0, (wartosc / (norma * SKALA)) * 100));

  return (
    <div className="border-t border-border py-2.5">
      <div className="flex items-baseline gap-2">
        <span className="min-w-0 flex-1 text-sm font-semibold">{nazwa}</span>
        <span className="whitespace-nowrap text-sm font-bold tabular-nums">
          {zJednostka(liczbaPL(wartosc, miejsca), jedn)}
        </span>
        <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold", klasyOceny(ocena))}>
          {ocena === "ok" && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
          {OPIS_OCENY[ocena]}
        </span>
      </div>
      <div className="relative my-1.5 h-1.5 rounded-full bg-muted" aria-hidden="true">
        <div
          className="absolute inset-y-0 rounded-full bg-foreground/25"
          style={{ left: `${(1 - tol) * (100 / SKALA)}%`, width: `${tol * 2 * (100 / SKALA)}%` }}
        />
        <div
          className={cn(
            "absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card",
            ocena === "ok" ? "bg-green-600 dark:bg-green-500" : "bg-orange-600 dark:bg-orange-500",
          )}
          style={{ left: `${pozycja}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground">norma {zJednostka(liczbaPL(norma), jedn)}</div>

      {ocenaOstrzezenia !== "ok" && ostrzezenie && (
        <p className="mt-1.5 text-sm text-orange-900 dark:text-orange-200">
          {ocenaOstrzezenia === "za-nisko"
            ? `Brakuje ${zJednostka(liczbaPL(roznica, ostrzezenie.miejsca), jedn)} do normy.`
            : `Za dużo o ${zJednostka(liczbaPL(roznica, ostrzezenie.miejsca), jedn)}.`}
          {propozycje.length > 0 && " Czym uzupełnić (ile dodać do mieszanki):"}
        </p>
      )}
      {propozycje.length > 0 && podpowiedz && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {propozycje.map((s) => (
            <button
              key={s.nazwa}
              type="button"
              onClick={() => onDodaj(s.nazwa, s.dodajProc)}
              title={`${s.nazwa}: ${liczbaPL(s.wartosc, podpowiedz.miejsca)}${podpowiedz.dopisek}`}
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-left text-xs font-semibold text-primary hover:border-primary hover:bg-primary/10"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {s.nazwa}
              <span className="font-normal text-muted-foreground">
                {s.juzJest ? "więcej o " : ""}{liczbaPL(s.dodajProc, s.dodajProc < 1 ? 2 : 1)}%
                {dawkaG > 0 && ` · ${liczbaPL((s.dodajProc * dawkaG) / 100, 1)} g/ptaka dziennie`}
              </span>
            </button>
          ))}
        </div>
      )}
      {propozycje.some((s) => s.producent) && (
        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
          {propozycje.map((s) => <KosztPropozycji key={s.nazwa} u={s} dawkaG={dawkaG} onPokazKarte={onPokazKarte} />)}
        </ul>
      )}
      {propozycje.some((s) => s.przekroczy.length > 0 || !s.domyka) && (
        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
          {propozycje.filter((s) => s.przekroczy.length > 0 || !s.domyka).map((s) => (
            <li key={s.nazwa}>
              {s.nazwa}:{" "}
              {[
                !s.domyka ? "w dawce z etykiety nie domknie braku" : "",
                s.przekroczy.length > 0 ? `podniesie ${s.przekroczy.map((p) => nazwaParametru(p.pole)).join(" i ")} ponad normę` : "",
              ].filter(Boolean).join(", ")}.
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Pasza z jednego składnika (prośba Marka 24.10.2026): czego brakuje, zachęta do innych
 * składników i osobne karmidło z mieszanką mineralno-witaminową. Treść z bilansPaszy.ts,
 * ta sama co w polu sugestie serwera MCP.
 */
function RamkaJednegoSkladnika({ j, onPokazKarte }: { j: JedenSkladnik; onPokazKarte: (nazwa: string) => void }) {
  const o = opisJednegoSkladnika(j);
  return (
    <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm leading-relaxed dark:border-amber-700 dark:bg-amber-950/40">
      <p className="mb-1.5 flex items-center gap-2 font-semibold">
        <Wheat className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
        Pasza z jednego składnika
      </p>
      <p>{o.sklad}</p>
      <p className="mt-1.5">{o.inne}</p>
      <p className="mt-1.5 font-medium">{o.karmidlo}</p>
      {j.gotowe.length > 0 && (
        <ul className="mt-1 space-y-1">
          {j.gotowe.map((g) => (
            <li key={g.nazwa}>
              <button type="button" onClick={() => onPokazKarte(g.nazwa)} className="text-left font-medium text-primary underline">
                {g.nazwa}
              </button>
              {g.oferta && (
                <span className="text-muted-foreground"> · {liczbaPL(g.oferta.cenaZl, 2)} zł za {liczbaPL(g.oferta.opakowanieKg, 1)} kg w {g.oferta.sklep}, cena z {g.oferta.sprawdzono}</span>
              )}
              {g.partner && <span className="text-muted-foreground"> · partner serwisu</span>}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1">{o.sposob}</p>
      {o.bialko && <p className="mt-1.5 text-muted-foreground">{o.bialko}</p>}
    </div>
  );
}

export default function WynikMieszanki({
  norma, zawartosc, sumaProcentow, koszt, cenyKompletne, mieszankaGotowa,
  komunikat, onZamknijKomunikat, propozycjeW, dawkaG, onDodajSkladnik, onPokazKarte, pelnySklad, jedenSkladnik,
}: {
  norma: NormaDrobiu | null | undefined;
  zawartosc: (pole: string) => number;
  sumaProcentow: number;
  koszt: number;
  cenyKompletne: boolean;
  mieszankaGotowa: boolean;
  komunikat: KomunikatKalkulatora | null;
  onZamknijKomunikat: () => void;
  /** Czym uzupełnić brak parametru: surowiec, ile dodać, co przy tym przekroczy (bilansPaszy.ts). */
  propozycjeW: (pole: PoleParametru) => Uzupelnienie[];
  /** Dawka paszy na ptaka dziennie w g (0 = nieznana). */
  dawkaG: number;
  onDodajSkladnik: (nazwa: string, procent?: number) => void;
  /** Otwiera kartę produktu z bazy dodatków (propozycje z producentem). */
  onPokazKarte: (nazwa: string) => void;
  pelnySklad: ReactNode;
  /** W mieszance jest tylko jeden składnik z udziałem (bilansPaszy.ts, jedenSkladnik). */
  jedenSkladnik?: JedenSkladnik | null;
}) {
  const brakuje = 100 - sumaProcentow;

  return (
    <Sekcja nr={3} tytul="Wynik">
      {komunikat && (
        <div className="mb-3">
          <Komunikat komunikat={komunikat} onZamknij={onZamknijKomunikat} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md bg-muted/70 px-3 py-2">
          <div className="text-xs text-muted-foreground">Suma udziałów</div>
          <div className={cn("text-xl font-bold tabular-nums",
            mieszankaGotowa ? "text-green-700 dark:text-green-400" : "text-orange-800 dark:text-orange-300")}>
            {liczbaPL(sumaProcentow, 1)}%
          </div>
          {!mieszankaGotowa && sumaProcentow > 0 && (
            <div className="text-xs text-muted-foreground">
              {brakuje > 0 ? `brakuje ${liczbaPL(brakuje, 1)}%` : `za dużo o ${liczbaPL(-brakuje, 1)}%`}
            </div>
          )}
        </div>
        <div className="rounded-md bg-muted/70 px-3 py-2">
          <div className="text-xs text-muted-foreground">Koszt</div>
          {koszt > 0 ? (
            <>
              <div className="text-xl font-bold tabular-nums">
                {liczbaPL(koszt, 2)} <span className="text-sm">zł/kg</span>
              </div>
              {!cenyKompletne && <div className="text-xs text-muted-foreground">bez części cen</div>}
            </>
          ) : (
            <div className="pt-1 text-sm text-muted-foreground">wpisz ceny składników</div>
          )}
        </div>
      </div>

      {norma && sumaProcentow > 0 ? (
        <>
          {jedenSkladnik && <RamkaJednegoSkladnika j={jedenSkladnik} onPokazKarte={onPokazKarte} />}
          <p className="mb-0.5 mt-4 text-sm font-semibold text-muted-foreground">Mieszanka a norma (na 1 kg)</p>
          {PARAMETRY.filter(({ pole }) => norma[pole]).map((p) => (
            <WierszNormy
              key={p.pole}
              nazwa={p.nazwa}
              jedn={p.jedn}
              miejsca={p.miejsca}
              tol={p.tol}
              wartosc={zawartosc(p.pole)}
              norma={norma[p.pole] as number}
              ostrzezenie={p.ostrzezenie}
              mieszankaGotowa={mieszankaGotowa}
              propozycjeUzupelnien={() => propozycjeW(p.pole)}
              dawkaG={dawkaG}
              onDodaj={onDodajSkladnik}
              onPokazKarte={onPokazKarte}
            />
          ))}
        </>
      ) : (
        <p className="mt-4 rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
          {norma
            ? "Dodaj składniki i wpisz udziały (albo kliknij „Dobierz proporcje do normy”), a pokażę, jak mieszanka wypada na tle normy."
            : "Wybierz gatunek i okres w kroku 1, a pokażę, jak mieszanka wypada na tle normy."}
        </p>
      )}

      <div className="mt-2">{pelnySklad}</div>
    </Sekcja>
  );
}
