import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GATUNKI_DODATKOW, cenaZaKg, najtanszaOferta, type DodatekPaszowy } from "@/data/dodatkiPaszowe";
import { liczbaPL } from "@/components/kalkulator/wspolne";

/**
 * Lista bazy dodatków (od 24.10.2026): produkty z etykietą, pogrupowane jak w bazie
 * surowców, w grupie od najtańszego za kg (bez ceny na końcu). Kliknięcie otwiera
 * kartę produktu. Kolejność nie zależy od tego, czy producent jest partnerem.
 */

const KOLEJNOSC_KATEGORII = ["Koncentraty", "Premiksy", "Dodatki mineralne", "Aminokwasy i dodatki paszowe", "Produkty uboczne, śruty i oleje"];

export default function BazaDodatkow({
  otwarta, onZamknij, dodatki, onWybierz,
}: {
  otwarta: boolean;
  onZamknij: () => void;
  dodatki: DodatekPaszowy[];
  onWybierz: (nazwa: string) => void;
}) {
  const grupy = useMemo(() => {
    const cena = (d: DodatekPaszowy) => {
      const o = najtanszaOferta(d.oferty);
      return o ? cenaZaKg(o) : Infinity;
    };
    const kategorie = [...new Set([...KOLEJNOSC_KATEGORII, ...dodatki.map((d) => d.kategoria)])];
    return kategorie
      .map((k) => [k, dodatki.filter((d) => d.kategoria === k).sort((a, b) => cena(a) - cena(b) || a.nazwa.localeCompare(b.nazwa, "pl"))] as const)
      .filter(([, lista]) => lista.length > 0);
  }, [dodatki]);

  return (
    <Dialog open={otwarta} onOpenChange={(o) => { if (!o) onZamknij(); }}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto p-5">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Baza dodatków paszowych</DialogTitle>
          <DialogDescription>
            {dodatki.length} produktów ze składem z etykiety i cenami ze sklepów z datą. W grupie od najtańszego za kg.
          </DialogDescription>
        </DialogHeader>
        {grupy.map(([kategoria, lista]) => (
          <section key={kategoria} className="mt-3">
            <h3 className="mb-1 font-body text-sm font-bold uppercase tracking-wide text-muted-foreground">{kategoria}</h3>
            <ul className="space-y-1">
              {lista.map((d) => {
                const o = najtanszaOferta(d.oferty);
                return (
                  <li key={d.nazwa}>
                    <button
                      type="button"
                      onClick={() => onWybierz(d.nazwa)}
                      className="flex w-full items-center gap-2 rounded-md border border-border px-2.5 py-2 text-left hover:border-primary hover:bg-primary/5"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{d.nazwa}</span>
                        <span className="block text-xs text-muted-foreground">
                          {d.gatunki.length ? d.gatunki.map((g) => GATUNKI_DODATKOW[g]).join(", ") : "dla drobiu"}
                          {d.partner && " · partner serwisu"}
                        </span>
                      </span>
                      <span className="shrink-0 text-right text-sm tabular-nums">
                        {o ? <>od <strong>{liczbaPL(cenaZaKg(o), 2)} zł/kg</strong></> : <span className="text-muted-foreground">bez ceny</span>}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <p className="mt-3 text-xs text-muted-foreground">
          Producent może płacić za obecność w bazie i sprawdzanie danych, nigdy za miejsce na liście. Takie produkty są oznaczone jako partner serwisu.
        </p>
      </DialogContent>
    </Dialog>
  );
}
