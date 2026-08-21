import { useMemo } from "react";
import { Link } from "react-router-dom";
import { culturesData } from "@/data/culturesDataComplete";
import { Store, ExternalLink } from "lucide-react";

/**
 * Zestawienie sklepów serowarskich, WYLICZANE z bazy kultur.
 *
 * Powód istnienia: strona nazywa się „gdzie kupić podpuszczkę”, a zawierała
 * wyłącznie porównanie mocy preparatów — ani jednej informacji o dostawcach.
 * Tymczasem w danych kultur od dawna leżą pola shop i shopUrl dla wszystkich
 * 188 pozycji, więc pełna lista sklepów wraz z zakresem oferty była do
 * wyliczenia, tylko nikt jej nigdzie nie pokazywał.
 *
 * Liczby biorą się z danych, a nie z opinii: „ile pozycji z naszej bazy ma ten
 * sklep” to fakt sprawdzalny, którego żaden sklep sam o sobie nie poda w
 * zestawieniu z konkurencją.
 *
 * UWAGA NA PRZYSZŁOŚĆ: odnośniki są zwykłe, bo z żadnym sklepem nie łączy nas
 * współpraca handlowa. Gdyby kiedykolwiek doszło do płatnej współpracy, te
 * konkretne linki muszą dostać rel="sponsored" i wymagana będzie informacja o
 * charakterze materiału — to obowiązek, nie kwestia uznania.
 */

const NAZWY_TYPOW: Record<string, string> = {
  mezofilne: "mezofilne",
  termofilne: "termofilne",
  "mezofilno-termofilne": "mieszane",
  jogurtowe: "jogurtowe",
  "pleśniowe": "pleśniowe",
  wege: "wegetariańskie",
  aromatyzujące: "aromatyzujące",
  ochronne: "ochronne",
};

interface Sklep {
  nazwa: string;
  url: string;
  liczba: number;
  typy: string[];
}

const SklepySerowarskie = () => {
  const sklepy = useMemo<Sklep[]>(() => {
    const mapa = new Map<string, { url: string; liczba: number; typy: Map<string, number> }>();

    for (const k of culturesData) {
      if (!k.shop) continue;
      const wpis = mapa.get(k.shop) ?? { url: k.shopUrl ?? "", liczba: 0, typy: new Map() };
      wpis.liczba += 1;
      if (k.shopUrl) wpis.url = k.shopUrl;
      if (k.type) wpis.typy.set(k.type, (wpis.typy.get(k.type) ?? 0) + 1);
      mapa.set(k.shop, wpis);
    }

    return [...mapa.entries()]
      .map(([nazwa, w]) => ({
        nazwa,
        url: w.url,
        liczba: w.liczba,
        typy: [...w.typy.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([t]) => NAZWY_TYPOW[t] ?? t),
      }))
      .sort((a, b) => b.liczba - a.liczba);
  }, []);

  if (sklepy.length === 0) return null;

  return (
    <section className="mb-10" aria-label="Gdzie kupić kultury i podpuszczkę">
      <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-bold text-accent">
        <Store className="h-6 w-6" aria-hidden="true" />
        Gdzie to kupić
      </h2>

      <p className="mb-5 max-w-[70ch] text-base leading-relaxed text-muted-foreground">
        Zestawienie powstaje automatycznie z naszej{" "}
        <Link to="/baza-kultur" className="font-medium text-accent underline underline-offset-2 hover:no-underline">
          bazy kultur
        </Link>{" "}
        — kolumna „pozycji” mówi, ile z {culturesData.length} opisanych przez nas kultur znajdziesz
        w danym sklepie. To liczba wyliczona z danych, więc pokazuje realny zakres oferty, a nie
        deklaracje.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-3 pr-4 font-semibold text-foreground">Sklep</th>
              <th className="py-3 pr-4 font-semibold text-foreground">Pozycji</th>
              <th className="py-3 pr-4 font-semibold text-foreground">Najwięcej w ofercie</th>
            </tr>
          </thead>
          <tbody>
            {sklepy.map((s) => (
              <tr key={s.nazwa} className="border-b border-border last:border-0">
                <td className="py-3 pr-4">
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 font-medium text-accent underline underline-offset-2 hover:no-underline"
                    >
                      {s.nazwa}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="font-medium text-foreground">{s.nazwa}</span>
                  )}
                </td>
                <td className="py-3 pr-4 tabular-nums text-muted-foreground">{s.liczba}</td>
                <td className="py-3 pr-4 text-muted-foreground">{s.typy.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
        Zanim zamówisz, sprawdź moc podpuszczki — różnice między preparatami bywają
        kilkukrotne, a dawka liczy się od IMCU, nie od objętości. Porównanie znajdziesz niżej,
        a przeliczenie na krople w{" "}
        <Link to="/kalkulator-beaugel" className="font-medium text-accent underline underline-offset-2 hover:no-underline">
          kalkulatorze podpuszczki
        </Link>
        .
      </p>
    </section>
  );
};

export default SklepySerowarskie;
