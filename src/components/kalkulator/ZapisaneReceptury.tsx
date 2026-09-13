import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookmarkPlus, FolderOpen, LogIn, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useFeedRecipes } from "@/hooks/useFeedRecipes";
import { zdarzenieMieszankaZapisana } from "@/lib/zdarzeniaGa4";
import type { Skladnik, ZapisanaMieszanka } from "@/types/kalkulatorPasz";

/**
 * Zapisywanie i wczytywanie receptur paszowych.
 *
 * ŚWIADOMA DECYZJA: to jedyna część kalkulatora za logowaniem, i nie odbiera
 * niczego niezalogowanym — pełne wyliczenie, normy i skład widzi każdy. Konto daje
 * wartość POWTARZALNĄ (wróć do swojej mieszanki), a nie odblokowuje wyniku.
 * Odwrotnie byłoby podwójnie kosztowne: kalkulator żyje z tego, że działa od razu,
 * a jego statyczny mirror zbiera cytowania modeli, które nigdy się nie zalogują.
 *
 * LOGOWANIE Z KALKULATORA (13.09.2026). Do tej pory "Zaloguj się" prowadziło na stronę
 * "System Ewidencji RHD", rejestracja pytała o firmę i NIP, a po zalogowaniu lądowało
 * się na pulpicie z limitem przychodu RHD. Kto przyszedł tylko zapisać paszę, dostawał
 * ewidencję, której nie chciał, a ułożona mieszanka przepadała. Teraz link niesie
 * cel=kalkulator: strona logowania mówi o mieszankach, rejestracja pyta tylko o e-mail
 * i hasło, po zalogowaniu wraca się tutaj, a mieszanka wczytuje się sama ze szkicu.
 */

export const ADRES_LOGOWANIA_Z_KALKULATORA = "/auth?cel=kalkulator&next=/kalkulator-pasz";

// Szkic musi przeżyć logowanie, także potwierdzenie adresu otwarte z maila w nowej
// karcie, dlatego localStorage, a nie sessionStorage. Starszy niż dwa dni nie jest już
// szkicem tej sesji, więc go nie wczytujemy.
const KLUCZ_SZKICU = "kalkulatorPaszSzkic";
const WAZNOSC_SZKICU_MS = 48 * 60 * 60 * 1000;

function zapiszSzkic(mieszanka: ZapisanaMieszanka) {
  try {
    localStorage.setItem(KLUCZ_SZKICU, JSON.stringify({ zapisano: Date.now(), mieszanka }));
  } catch {
    // Pamięć przeglądarki niedostępna: po zalogowaniu mieszanki po prostu nie będzie.
  }
}

/** Jedno zdanie nad kalkulatorem, tylko dla niezalogowanych: prowadzi do ramki zapisu. */
export function PodpowiedzZapisu() {
  const { user } = useAuth();
  if (user) return null;
  return (
    <a
      href="#zapis-mieszanki"
      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
    >
      <BookmarkPlus className="h-4 w-4 shrink-0" />
      Ułożoną mieszankę zapiszesz na darmowym koncie
    </a>
  );
}

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

  // Mieszanka ułożona przed logowaniem wraca sama, jeden raz.
  useEffect(() => {
    try {
      const surowy = localStorage.getItem(KLUCZ_SZKICU);
      if (!surowy) return;
      localStorage.removeItem(KLUCZ_SZKICU);
      const { zapisano, mieszanka } = JSON.parse(surowy);
      if (Date.now() - zapisano < WAZNOSC_SZKICU_MS && Array.isArray(mieszanka?.pozycje)) {
        onWczytaj(mieszanka);
      }
    } catch {
      // Uszkodzony szkic: nie wczytujemy.
    }
    // Wyłącznie przy wejściu na stronę; onWczytaj rodzica zmienia się przy każdym renderze.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pozycjeZUdzialem = skladniki.filter((s) => s.nazwa && parseFloat(String(s.procent)) > 0);
  const maSklad = pozycjeZUdzialem.length > 0;

  if (!zalogowany) {
    return (
      <div
        id="zapis-mieszanki"
        className="mt-6 scroll-mt-24 rounded-lg border-2 border-primary/40 bg-primary/5 p-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <BookmarkPlus className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">Zapisz tę mieszankę na później</p>
            <p className="text-sm text-muted-foreground">
              Wrócisz do niej przy następnym zamówieniu surowców. Wystarczy e-mail i hasło,
              bez zakładania ewidencji RHD.
            </p>
          </div>
          <Button asChild size="sm">
            <Link
              to={ADRES_LOGOWANIA_Z_KALKULATORA}
              onClick={() => {
                if (maSklad) zapiszSzkic({ wersja: 1, drob, okres, pozycje: skladniki });
              }}
            >
              <LogIn className="mr-1.5 h-3.5 w-3.5" />
              Zaloguj się i zapisz
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div id="zapis-mieszanki" className="mt-6 scroll-mt-24 rounded-lg border border-border bg-card p-4">
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
            if (await zapisz(nazwa, normaEtykieta, mieszanka)) {
              setNazwa("");
              zdarzenieMieszankaZapisana("drob", drob, okres, pozycjeZUdzialem.length);
            }
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
