import { useMemo, useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import type { FeedIngredient } from "@/data/feedIngredients";

/**
 * Pełny skład mieszanki — aminokwasy, witaminy i skład rozszerzony.
 *
 * SKĄD LICZBY: z tabeli surowców, nie z wierszy formularza. Użytkownik edytuje
 * w tabeli trzynaście wartości; pozostałych trzydzieści pięć nie ma tam prawa się
 * pojawić, bo tabela ma już szesnaście kolumn. Dlatego dla każdego wiersza
 * odnajdujemy surowiec po nazwie i sumujemy jego profil proporcjonalnie do udziału.
 *
 * KONSEKWENCJA, KTÓRA MUSI BYĆ WIDOCZNA: wiersz z nazwą spoza bazy (własny
 * składnik użytkownika) nie wnosi tu nic. Nie wolno tego przemilczeć, bo suma
 * wyglądałaby na kompletną, a byłaby zaniżona — stąd ostrzeżenie nad tabelą.
 *
 * Puste komórki w arkuszu źródłowym są zerami — tak wprowadzał je Marek: gdy
 * w normach nie było danych, uznawał, że składnika nie ma albo jest śladowo.
 */

interface WierszMieszanki {
  nazwa: string;
  procent: string | number;
}

type Pole = keyof FeedIngredient;

const AMINOKWASY_KLUCZOWE: Array<[Pole, string]> = [
  ["lys", "Lizyna"],
  ["metCys", "Metionina + cystyna"],
  ["thr", "Treonina"],
  ["trp", "Tryptofan"],
];

const AMINOKWASY_POZOSTALE: Array<[Pole, string]> = [
  ["met", "Metionina"], ["ile", "Izoleucyna"], ["leu", "Leucyna"], ["val", "Walina"],
  ["his", "Histydyna"], ["arg", "Arginina"], ["phe", "Fenyloalanina"], ["tyr", "Tyrozyna"],
];

const WITAMINY: Array<[Pole, string, string]> = [
  ["witA", "Witamina A", "tys. j.m."], ["witD3", "Witamina D3", "tys. j.m."],
  ["witE", "Witamina E", "mg"], ["witB1", "Witamina B1", "mg"],
  ["witB2", "Witamina B2", "mg"], ["witB6", "Witamina B6", "mg"],
  ["witB12", "Witamina B12", "µg"], ["kwasPantotenowy", "Kwas pantotenowy", "mg"],
  ["kwasFoliowy", "Kwas foliowy", "mg"], ["biotyna", "Biotyna", "mg"],
  ["niacyna", "Niacyna (PP)", "mg"], ["cholina", "Cholina", "g"],
  ["kwasLinolowy", "Kwas linolowy", "g"],
];

const SKLAD: Array<[Pole, string, string]> = [
  ["suchaMasa", "Sucha masa", "%"], ["skrobia", "Skrobia", "%"],
  ["cukier", "Cukier", "%"], ["popiol", "Popiół", "%"],
];

const MINERALNE: Array<[Pole, string, string]> = [
  ["pPrzyswajalny", "Fosfor przyswajalny", "%"], ["cl", "Chlor", "%"],
  ["s", "Siarka", "%"], ["cu", "Miedź", "mg"], ["co", "Kobalt", "µg"],
];

export default function PelnySklad({
  wiersze,
  baza,
  normaTluszczu,
}: {
  wiersze: WierszMieszanki[];
  baza: FeedIngredient[];
  normaTluszczu?: number;
}) {
  const [rozwiniete, setRozwiniete] = useState(false);

  const { sumy, poza, udzialObjety } = useMemo(() => {
    const wgNazwy = new Map(baza.map((s) => [s.nazwa, s]));
    const suma: Record<string, number> = {};
    const brakujace: string[] = [];
    let objety = 0;

    for (const w of wiersze) {
      const udzial = parseFloat(String(w.procent));
      if (!w.nazwa || !udzial || udzial <= 0) continue;
      const surowiec = wgNazwy.get(w.nazwa);
      if (!surowiec) {
        brakujace.push(w.nazwa);
        continue;
      }
      objety += udzial;
      for (const [pole, wartosc] of Object.entries(surowiec)) {
        if (typeof wartosc === "number") {
          suma[pole] = (suma[pole] ?? 0) + (wartosc * udzial) / 100;
        }
      }
    }
    return { sumy: suma, poza: brakujace, udzialObjety: objety };
  }, [wiersze, baza]);

  if (udzialObjety === 0) return null;

  const wartosc = (pole: Pole) => sumy[pole as string] ?? 0;
  const jest = (lista: Array<[Pole, string, string?]>) => lista.some(([p]) => wartosc(p) > 0);

  const Pozycja = ({ etykieta, pole, jednostka, miejsca = 2 }:
    { etykieta: string; pole: Pole; jednostka: string; miejsca?: number }) => (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-1 last:border-0">
      <span className="text-sm text-muted-foreground">{etykieta}</span>
      <span className="whitespace-nowrap font-medium tabular-nums">
        {wartosc(pole).toFixed(miejsca)} <span className="text-xs text-muted-foreground">{jednostka}</span>
      </span>
    </div>
  );

  const tluszcz = wartosc("tluszcz");
  const tluszczOk = normaTluszczu ? tluszcz >= normaTluszczu * 0.85 : true;

  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4">
      <h4 className="mb-3 font-semibold">Pełny skład mieszanki</h4>

      {poza.length > 0 && (
        <p className="mb-3 flex items-start gap-2 rounded-md bg-amber-50 p-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Poniższe liczby pomijają {poza.length === 1 ? "składnik" : "składniki"}{" "}
            <strong>{poza.join(", ")}</strong> — nie ma {poza.length === 1 ? "go" : "ich"} w bazie,
            więc nie znamy {poza.length === 1 ? "jego" : "ich"} profilu. Wyliczenie obejmuje{" "}
            {udzialObjety.toFixed(1)}% mieszanki.
          </span>
        </p>
      )}

      <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Aminokwasy krytyczne
          </p>
          {AMINOKWASY_KLUCZOWE.map(([pole, etykieta]) => (
            <Pozycja key={pole} etykieta={etykieta} pole={pole} jednostka="%" miejsca={3} />
          ))}
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Skład podstawowy
          </p>
          <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-1">
            <span className="text-sm text-muted-foreground">Tłuszcz surowy</span>
            <span className="whitespace-nowrap font-medium tabular-nums">
              <span className={normaTluszczu ? (tluszczOk ? "text-green-600" : "text-red-600") : ""}>
                {tluszcz.toFixed(2)}
              </span>{" "}
              <span className="text-xs text-muted-foreground">
                %{normaTluszczu ? ` · norma ${normaTluszczu}%` : ""}
              </span>
            </span>
          </div>
          {SKLAD.map(([pole, etykieta, jednostka]) => (
            <Pozycja key={pole} etykieta={etykieta} pole={pole} jednostka={jednostka} />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setRozwiniete((x) => !x)}
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        aria-expanded={rozwiniete}
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${rozwiniete ? "rotate-180" : ""}`} />
        {rozwiniete ? "Zwiń pełny profil" : "Pokaż witaminy i pozostałe aminokwasy"}
      </button>

      {rozwiniete && (
        <div className="mt-3 grid gap-x-8 gap-y-1 border-t border-border pt-3 sm:grid-cols-2">
          {jest(WITAMINY) && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Witaminy (w 1 kg mieszanki)
              </p>
              {WITAMINY.map(([pole, etykieta, jednostka]) => (
                <Pozycja key={pole} etykieta={etykieta} pole={pole} jednostka={jednostka} />
              ))}
            </div>
          )}
          <div>
            {jest(AMINOKWASY_POZOSTALE) && (
              <>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Pozostałe aminokwasy
                </p>
                {AMINOKWASY_POZOSTALE.map(([pole, etykieta]) => (
                  <Pozycja key={pole} etykieta={etykieta} pole={pole} jednostka="%" miejsca={3} />
                ))}
              </>
            )}
            {jest(MINERALNE) && (
              <>
                <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mineralne rozszerzone
                </p>
                {MINERALNE.map(([pole, etykieta, jednostka]) => (
                  <Pozycja key={pole} etykieta={etykieta} pole={pole} jednostka={jednostka} miejsca={3} />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Skład dodatków paszowych i premiksów bywa różny w zależności od partii i producenta —
        sprawdź etykietę swojego opakowania. Jeśli zauważysz rozbieżność, zgłoś ją przyciskiem
        „Zaproponuj składnik".
      </p>
    </div>
  );
}
