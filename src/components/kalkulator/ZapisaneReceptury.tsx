import { useState } from "react";
import { Link } from "react-router-dom";
import { BookmarkPlus, FolderOpen, LogIn, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFeedRecipes } from "@/hooks/useFeedRecipes";
import type { Skladnik, ZapisanaMieszanka } from "@/types/kalkulatorPasz";

/**
 * Zapisywanie i wczytywanie receptur paszowych.
 *
 * ŚWIADOMA DECYZJA: to jedyna część kalkulatora za logowaniem, i nie odbiera
 * niczego niezalogowanym — pełne wyliczenie, normy i skład widzi każdy. Konto daje
 * wartość POWTARZALNĄ (wróć do swojej mieszanki), a nie odblokowuje wyniku.
 * Odwrotnie byłoby podwójnie kosztowne: kalkulator żyje z tego, że działa od razu,
 * a jego statyczny mirror zbiera cytowania modeli, które nigdy się nie zalogują.
 */
export default function ZapisaneReceptury({
  drob,
  okres,
  normaEtykieta,
  skladniki,
  onWczytaj,
}: {
  drob: string;
  okres: string;
  normaEtykieta: string;
  skladniki: Skladnik[];
  onWczytaj: (mieszanka: ZapisanaMieszanka) => void;
}) {
  const { receptury, zalogowany, zapisz, usun } = useFeedRecipes();
  const [nazwa, setNazwa] = useState("");

  if (!zalogowany) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/30 p-4">
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <BookmarkPlus className="h-4 w-4 shrink-0 text-primary" />
          <span>
            Masz gotową mieszankę? <strong className="text-foreground">Zaloguj się</strong>, żeby ją
            zapisać i wrócić do niej przy następnym zamówieniu surowców.
          </span>
          <Button asChild size="sm" variant="outline" className="ml-auto">
            <Link to="/auth">
              <LogIn className="mr-1.5 h-3.5 w-3.5" />
              Zaloguj się
            </Link>
          </Button>
        </p>
      </div>
    );
  }

  const maSklad = skladniki.some((s) => s.nazwa && parseFloat(String(s.procent)) > 0);

  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 font-semibold">
        <FolderOpen className="h-4 w-4 text-primary" />
        Twoje receptury
      </h3>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={nazwa}
          onChange={(e) => setNazwa(e.target.value)}
          placeholder="Nazwa, np. Nioski — zima 2026"
          className="max-w-xs"
        />
        <Button
          type="button"
          size="sm"
          disabled={!maSklad}
          onClick={async () => {
            const mieszanka: ZapisanaMieszanka = { wersja: 1, drob, okres, pozycje: skladniki };
            if (await zapisz(nazwa, normaEtykieta, mieszanka)) setNazwa("");
          }}
        >
          <BookmarkPlus className="mr-1.5 h-4 w-4" />
          Zapisz mieszankę
        </Button>
        {!maSklad && (
          <span className="text-xs text-muted-foreground">
            Najpierw dodaj składniki z udziałem większym od zera.
          </span>
        )}
      </div>

      {receptury.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {receptury.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{r.nazwa}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.norma} · {r.skladniki?.pozycje?.length ?? 0} składników
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => onWczytaj(r.skladniki)}>
                Wczytaj
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Usuń recepturę ${r.nazwa}`}
                onClick={() => usun(r.id, r.nazwa)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
