import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DawkaTypowa } from "@/data/normyDrobiu";
import type { zapotrzebowanieStada } from "@/lib/bilansPaszy";
import { Sekcja, liczbaPL } from "@/components/kalkulator/wspolne";
import { KLASA_POLA_LICZBY } from "@/components/kalkulator/KartaSkladnika";

/**
 * Krok 4: ile paszy na stado (liczy zapotrzebowanieStada w bilansPaszy.ts).
 * Na telefonie lista składników z przełącznikiem dzień / tydzień / 30 dni,
 * od 640 px tabela ze wszystkimi trzema kolumnami.
 */

type Zapotrzebowanie = ReturnType<typeof zapotrzebowanieStada>;
type Okres = "dziennieKg" | "tygodniowoKg" | "miesiecznieKg";

const OKRESY: Array<{ klucz: Okres; etykieta: string }> = [
  { klucz: "dziennieKg", etykieta: "Dziennie" },
  { klucz: "tygodniowoKg", etykieta: "Tydzień" },
  { klucz: "miesiecznieKg", etykieta: "30 dni" },
];


export default function StadoKarta({
  sztuk, setSztuk, dawkaG, setDawkaG, typowaDawka, stado, mieszankaGotowa, sztukLiczba,
  kosztNaKg, formatKg,
}: {
  sztuk: string;
  setSztuk: (v: string) => void;
  dawkaG: string;
  setDawkaG: (v: string) => void;
  typowaDawka: DawkaTypowa | null;
  stado: Zapotrzebowanie | null;
  mieszankaGotowa: boolean;
  sztukLiczba: number;
  /** Koszt 1 kg mieszanki, gdy wszystkie użyte składniki mają cenę; inaczej 0. */
  kosztNaKg: number;
  formatKg: (kg: number) => string;
}) {
  const [okres, setOkres] = useState<Okres>("miesiecznieKg");

  return (
    <Sekcja nr={4} tytul="Ile paszy na stado">
      <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end sm:gap-4">
        <label className="block sm:w-40">
          <span className="mb-1.5 block text-sm font-semibold">Liczba ptaków</span>
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={sztuk}
            onChange={(e) => setSztuk(e.target.value)}
            placeholder="np. 10"
            className={KLASA_POLA_LICZBY}
          />
        </label>
        <label className="block sm:w-44">
          <span className="mb-1.5 block text-sm font-semibold">Dawka, g na dzień</span>
          <input
            type="number"
            min="1"
            step="1"
            inputMode="decimal"
            value={dawkaG}
            onChange={(e) => setDawkaG(e.target.value)}
            placeholder={typowaDawka ? String(typowaDawka.g) : "g"}
            aria-label="Dawka paszy w gramach na ptaka dziennie"
            className={KLASA_POLA_LICZBY}
          />
        </label>
      </div>
      <p className="mb-3 mt-2 text-xs text-muted-foreground">
        {typowaDawka ? (
          <>
            {dawkaG ? "Liczę z Twojej dawki. " : `Przyjęto typową dawkę ${typowaDawka.g} g. `}
            Poradnik {typowaDawka.zrodlo}: {formatKg(typowaDawka.od)}–{formatKg(typowaDawka.do)} g.{" "}
            <a href={typowaDawka.url} target="_blank" rel="noopener noreferrer" className="underline">Źródło (PDF)</a>
          </>
        ) : (
          "Wpisz, ile paszy zjada jeden ptak dziennie. Dla tego gatunku i okresu nie podajemy typowej dawki, bo zależy mocno od wieku i masy ptaków."
        )}
      </p>

      {stado ? (
        <>
          <div className={cn("grid gap-2 text-center", kosztNaKg > 0 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>
            {OKRESY.map(({ klucz, etykieta }) => (
              <div key={klucz} className="rounded-md bg-muted/70 px-2 py-2">
                <div className="text-xs text-muted-foreground">{etykieta}</div>
                <div className="text-lg font-bold tabular-nums">{formatKg(stado[klucz])} kg</div>
              </div>
            ))}
            {kosztNaKg > 0 && (
              <div className="rounded-md bg-muted/70 px-2 py-2">
                <div className="text-xs text-muted-foreground">Koszt na 30 dni</div>
                <div className="text-lg font-bold tabular-nums">{liczbaPL(kosztNaKg * stado.miesiecznieKg, 2)} zł</div>
              </div>
            )}
          </div>

          <p className="mb-2 mt-4 text-sm font-semibold">Ile każdego składnika</p>
          {/* Telefon: jedna kolumna naraz. */}
          <div className="sm:hidden">
            <div className="flex gap-1 rounded-md bg-muted p-1" role="group" aria-label="Okres">
              {OKRESY.map(({ klucz, etykieta }) => (
                <button
                  key={klucz}
                  type="button"
                  aria-pressed={okres === klucz}
                  onClick={() => setOkres(klucz)}
                  className={cn(
                    "h-9 flex-1 rounded text-sm font-semibold",
                    okres === klucz ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                >
                  {etykieta}
                </button>
              ))}
            </div>
            <ul className="mt-1">
              {stado.skladniki.map((s) => (
                <li key={s.nazwa} className="flex justify-between gap-3 border-b border-border py-2 text-sm last:border-0">
                  <span className="min-w-0">{s.nazwa}</span>
                  <span className="whitespace-nowrap font-semibold tabular-nums">{formatKg(s[okres])} kg</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Szerszy ekran: tabela z trzema kolumnami. */}
          <table className="hidden w-full text-sm sm:table">
            <thead>
              <tr className="text-muted-foreground">
                <th className="py-1.5 text-left font-semibold">Składnik</th>
                {OKRESY.map(({ klucz, etykieta }) => (
                  <th key={klucz} className="py-1.5 text-right font-semibold">{etykieta} (kg)</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stado.skladniki.map((s) => (
                <tr key={s.nazwa} className="border-t border-border">
                  <td className="py-1.5">{s.nazwa}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatKg(s.dziennieKg)}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatKg(s.tygodniowoKg)}</td>
                  <td className="py-1.5 text-right font-semibold tabular-nums">{formatKg(s.miesiecznieKg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
          {!mieszankaGotowa
            ? "Wynik pokaże się, gdy udziały składników sumują się do 100%."
            : sztukLiczba > 0 ? "Podaj dawkę paszy na ptaka." : "Podaj liczbę ptaków."}
        </p>
      )}
    </Sekcja>
  );
}
