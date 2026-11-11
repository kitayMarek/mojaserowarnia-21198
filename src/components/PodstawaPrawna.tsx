import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { przepisyHuba } from "@/data/przepisyHuba";

/**
 * Ramka „Na jakim prawie to stoi” na stronach RHD i MOL.
 *
 * Numery Dz.U., teksty jednolite i zmiany pochodzą z modułu Przepisy huba Dane Rolne
 * (danerolne.com/przepisy, dane z API ELI Kancelarii Sejmu). Najpierw pokazujemy kopię
 * wygenerowaną przez scripts/przepisy-z-huba.py, potem dane pobrane z huba na żywo.
 * Daty „ogloszono” przy zmianach nie pokazujemy: 11.11.2026 hub miał tam złe daty
 * (poprawione w hubie, commit ebd8098). Przy zmianie pokazujemy, od kiedy działa w akcie.
 *
 * Mirrory w public/ mają tę samą ramkę wstawianą przez ten sam skrypt.
 */

interface Zmiana {
  dziennik: string;
  /** Od kiedy zmiana działa w tym akcie (pole huba od 11.11.2026); gdy brak, data wejścia w życie. */
  zmienia_ten_akt_od?: string | null;
  wchodzi_w_zycie?: string | null;
  isap?: string | null;
}

interface Akt {
  klucz: string;
  tytul: string;
  dziennik: string;
  obowiazuje: boolean;
  tekstJednolity: { dziennik: string; isap?: string | null } | null;
  zmiany: Zmiana[];
  isap?: string | null;
  sprawdzono?: string | null;
}

export interface InnyAkt {
  tytul: string;
  /** Bez adresu pozycja jest zwykłym tekstem. */
  url?: string;
  /** Krótki dopisek po linku, np. numer Dz.U. i data sprawdzenia. */
  opis?: string;
}

interface Props {
  klucze: string[];
  inne?: InnyAkt[];
  id?: string;
  tytul?: string;
}

const POMOC = "https://www.gov.pl/web/nieodplatna-pomoc";

const dataPl = (iso?: string | null) =>
  iso
    ? new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

/** Ujednolica wpis z huba (na żywo: linki.isap) i z kopii (isap). */
function zHuba(a: any): Akt | null {
  if (!a || typeof a.klucz !== "string" || typeof a.dziennik !== "string") return null;
  const tj = a.tekst_jednolity;
  return {
    klucz: a.klucz,
    tytul: a.tytul || a.krotko || a.dziennik,
    dziennik: a.dziennik,
    obowiazuje: a.obowiazuje !== false,
    tekstJednolity: tj && typeof tj.dziennik === "string" ? { dziennik: tj.dziennik, isap: tj.isap } : null,
    zmiany: Array.isArray(a.zmiany_po_tekscie_jednolitym)
      ? a.zmiany_po_tekscie_jednolitym
          .filter((z: any) => z && typeof z.dziennik === "string")
          .map((z: any) => ({
            dziennik: z.dziennik,
            zmienia_ten_akt_od: z.zmienia_ten_akt_od,
            wchodzi_w_zycie: z.wchodzi_w_zycie,
            isap: z.isap,
          }))
      : [],
    isap: a.linki?.isap ?? a.isap ?? null,
    sprawdzono: a.sprawdzono ?? null,
  };
}

const kopia = new Map<string, Akt>();
for (const a of przepisyHuba.akty) {
  const akt = zHuba(a);
  if (akt) kopia.set(akt.klucz, akt);
}

const Zewn = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary-hover">
    {children}
  </a>
);

const PodstawaPrawna = ({ klucze, inne = [], id, tytul = "Na jakim prawie to stoi" }: Props) => {
  const { data } = useQuery({
    queryKey: ["przepisy-huba"],
    queryFn: async () => {
      const odp = await fetch(przepisyHuba.zrodlo);
      if (!odp.ok) throw new Error(`przepisy.json: ${odp.status}`);
      return (await odp.json()) as { akty?: unknown[] };
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const naZywo = new Map<string, Akt>();
  for (const a of data?.akty ?? []) {
    const akt = zHuba(a);
    if (akt) naZywo.set(akt.klucz, akt);
  }
  const akty = klucze.map((k) => naZywo.get(k) ?? kopia.get(k)).filter((a): a is Akt => Boolean(a));
  const sprawdzono = akty
    .map((a) => a.sprawdzono)
    .filter((d): d is string => Boolean(d))
    .sort()[0];
  const strona = przepisyHuba.strona;

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          {tytul}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <ul className="space-y-3">
          {akty.map((a) => (
            <li key={a.klucz} className="pl-4 border-l-2 border-primary/30">
              <Zewn href={a.isap || `${strona}#${a.klucz}`}>{a.tytul}</Zewn> ({a.dziennik})
              {a.obowiazuje ? (
                ", obowiązuje."
              ) : (
                <>
                  , <strong>nie obowiązuje</strong>.
                </>
              )}
              {a.tekstJednolity && (
                <>
                  {" "}Tekst jednolity:{" "}
                  {a.tekstJednolity.isap ? (
                    <Zewn href={a.tekstJednolity.isap}>{a.tekstJednolity.dziennik}</Zewn>
                  ) : (
                    a.tekstJednolity.dziennik
                  )}
                  .
                </>
              )}
              {a.zmiany.length > 0 && (
                <>
                  {" "}Zmiany, których nie ma jeszcze w tekście jednolitym:{" "}
                  {a.zmiany.map((z, i) => (
                    <span key={z.dziennik}>
                      {i > 0 && ", "}
                      {z.isap ? <Zewn href={z.isap}>{z.dziennik}</Zewn> : z.dziennik}
                      {z.zmienia_ten_akt_od
                        ? ` (zmienia ten akt od ${dataPl(z.zmienia_ten_akt_od)})`
                        : z.wchodzi_w_zycie && ` (wchodzi w życie ${dataPl(z.wchodzi_w_zycie)})`}
                    </span>
                  ))}
                  .
                </>
              )}{" "}
              <Zewn href={`${strona}#${a.klucz}`}>Ten akt w Dane Rolne</Zewn>.
            </li>
          ))}
        </ul>
        {inne.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Inne akty i źródła, do których odsyła ta strona</h3>
            <ul className="space-y-2">
              {inne.map((a) => (
                <li key={a.url ?? a.tytul} className="pl-4 border-l-2 border-muted">
                  {a.url ? <Zewn href={a.url}>{a.tytul}</Zewn> : a.tytul}
                  {a.opis && (
                    <>
                      {/^[:,.;]/.test(a.opis) ? "" : " "}
                      {a.opis}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-muted-foreground">
          Numery i stan aktów: <Zewn href={strona}>Przepisy Dane Rolne</Zewn>, z API Kancelarii Sejmu
          {sprawdzono && <>, sprawdzone {dataPl(sprawdzono)}</>}. To informacja, nie porada prawna. Wiążący jest
          tekst ogłoszony w Dzienniku Ustaw. W sprawie indywidualnej pomogą:{" "}
          <Zewn href={POMOC}>nieodpłatna pomoc prawna</Zewn> w powiecie, ośrodek doradztwa rolniczego albo izba
          rolnicza.
        </p>
      </CardContent>
    </Card>
  );
};

export default PodstawaPrawna;
