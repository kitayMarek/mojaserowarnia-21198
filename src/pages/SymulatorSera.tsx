/**
 * Symulator warzenia sera. Ustawiasz proces, dostajesz ser albo błąd produkcji.
 *
 * Kultury pochodzą z prawdziwej bazy, nie z listy wymyślonej na potrzeby gry:
 * kategorię wyliczamy ze składu i typu (src/lib/kategorieKultur.ts), więc
 * wybierając „pleśń biała" wybierasz spośród kultur, które da się kupić.
 *
 * Cała logika siedzi w src/lib/symulatorSera.ts i nie zna Reacta. Ta strona
 * tylko zbiera parametry i pokazuje wynik.
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Button } from "@/components/ui/button";
import { useCultures } from "@/hooks/useCultures";
import { useMetaStrony } from "@/hooks/useMetaStrony";
import { adresKultury } from "@/lib/adresKultury";
import { kategoriaKultury, czyWiodaca, NAZWY_KATEGORII, type KategoriaKultury } from "@/lib/kategorieKultur";
import {
  zasymuluj, OPIS_SERWATKI, RICOTTA,
  type Parametry, type Mleko, type Podpuszczka, type Krojenie,
  type Dogrzewanie, type Prasowanie, type Solenie, type Srodowisko,
} from "@/lib/symulatorSera";

const START: Parametry = {
  mleko: "krowie", kultura: "mezofilna", temperatura: 32, podpuszczka: "standard",
  krojenie: "drobne", dogrzewanie: "niskie", prasowanie: "mocne",
  solenie: "sucho", dojrzewanieDni: 60, srodowisko: "wosk",
};

const KROKI_DOJRZEWANIA = [0, 3, 14, 30, 60, 120, 240, 400, 700];

function Wybor<T extends string | number>({ etykieta, wartosc, opcje, zmien, podpis }: {
  etykieta: string; wartosc: T; opcje: { v: T; t: string }[];
  zmien: (v: T) => void; podpis?: string;
}) {
  return (
    <div className="mb-4">
      <div className="text-sm font-semibold mb-1">{etykieta}</div>
      <div className="flex flex-wrap gap-1.5">
        {opcje.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            onClick={() => zmien(o.v)}
            className={`text-sm px-2.5 py-1 rounded border transition-colors ${
              o.v === wartosc
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-foreground"
            }`}
          >
            {o.t}
          </button>
        ))}
      </div>
      {podpis && <div className="text-xs text-muted-foreground mt-1">{podpis}</div>}
    </div>
  );
}

const Pasek = ({ etykieta, wartosc }: { etykieta: string; wartosc: number }) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs mb-0.5">
      <span>{etykieta}</span>
      <span className="tabular-nums text-muted-foreground">{Math.round(wartosc)}</span>
    </div>
    <div className="h-2 bg-secondary rounded">
      <div className="h-2 bg-primary rounded" style={{ width: `${Math.max(2, wartosc)}%` }} />
    </div>
  </div>
);

const SymulatorSera = () => {
  const [p, setP] = useState<Parametry>(START);
  const { cultures } = useCultures();

  useMetaStrony(
    "Symulator warzenia sera: co wyjdzie z twoich parametrów",
    "Ustaw kulturę, podpuszczkę, dogrzewanie, prasowanie i dojrzewanie, a symulator powie, jaki ser z tego wychodzi albo dlaczego się nie uda. Kultury z prawdziwej bazy 188 pozycji.",
  );

  const ustaw = <K extends keyof Parametry>(k: K) => (v: Parametry[K]) =>
    setP((s) => ({ ...s, [k]: v }));

  const wynik = useMemo(() => zasymuluj(p), [p]);

  /** Prawdziwe kultury z bazy pasujące do wybranej kategorii. */
  const kulturyKategorii = useMemo(
    () => cultures.filter((k) => kategoriaKultury(k) === p.kultura).slice(0, 6),
    [cultures, p.kultura],
  );

  const kategorie = (Object.keys(NAZWY_KATEGORII) as KategoriaKultury[]).filter(czyWiodaca);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageBreadcrumbs items={[{ label: "Narzędzia", href: "/narzedzia" }, { label: "Symulator sera" }]} />

        <h1 className="text-3xl md:text-4xl font-display font-bold mt-4 mb-2">
          Symulator warzenia sera
        </h1>
        <p className="text-muted-foreground mb-8">
          Ustaw proces i zobacz, co z niego wychodzi. Kultury pochodzą z naszej bazy 188 pozycji,
          więc wybierając kategorię wybierasz spośród rzeczy, które da się kupić.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Wybor etykieta="Mleko" wartosc={p.mleko} zmien={ustaw("mleko")}
              opcje={[{ v: "krowie" as Mleko, t: "krowie" }, { v: "kozie", t: "kozie" }, { v: "owcze", t: "owcze" }]}
              podpis="Kozie i owcze dają mocniejszy smak." />

            <Wybor etykieta="Kultura" wartosc={p.kultura} zmien={ustaw("kultura")}
              opcje={kategorie.map((k) => ({ v: k, t: NAZWY_KATEGORII[k] }))} />

            {kulturyKategorii.length > 0 && (
              <div className="text-xs text-muted-foreground -mt-2 mb-4">
                Z bazy:{" "}
                {kulturyKategorii.map((k, i) => (
                  <span key={k.id}>
                    {i > 0 && ", "}
                    <Link to={`/kultury/${adresKultury(k.name)}`} className="underline">{k.name}</Link>
                  </span>
                ))}
              </div>
            )}

            <div className="mb-4">
              <div className="text-sm font-semibold mb-1">
                Temperatura koagulacji: <span className="tabular-nums">{p.temperatura}°C</span>
              </div>
              <input type="range" min={20} max={45} value={p.temperatura}
                onChange={(e) => ustaw("temperatura")(Number(e.target.value))}
                className="w-full" aria-label="Temperatura koagulacji" />
            </div>

            <Wybor etykieta="Podpuszczka" wartosc={p.podpuszczka} zmien={ustaw("podpuszczka")}
              opcje={[{ v: "brak" as Podpuszczka, t: "brak" }, { v: "malo", t: "mało" },
                      { v: "standard", t: "standard" }, { v: "duzo", t: "dużo" }]}
              podpis="Bez podpuszczki powstaje wyłącznie skrzep kwasowy." />

            <Wybor etykieta="Krojenie skrzepu" wartosc={p.krojenie} zmien={ustaw("krojenie")}
              opcje={[{ v: "grube" as Krojenie, t: "grube kawałki" }, { v: "drobne", t: "drobna kostka" }]} />

            <Wybor etykieta="Dogrzewanie skrzepu" wartosc={p.dogrzewanie} zmien={ustaw("dogrzewanie")}
              opcje={[{ v: "brak" as Dogrzewanie, t: "brak" }, { v: "niskie", t: "32–38°C" }, { v: "wysokie", t: "38–55°C" }]} />

            <Wybor etykieta="Prasowanie" wartosc={p.prasowanie} zmien={ustaw("prasowanie")}
              opcje={[{ v: "brak" as Prasowanie, t: "brak" }, { v: "lekkie", t: "lekkie" }, { v: "mocne", t: "mocne" }]} />

            <Wybor etykieta="Solenie" wartosc={p.solenie} zmien={ustaw("solenie")}
              opcje={[{ v: "brak" as Solenie, t: "brak" }, { v: "sucho", t: "na sucho" }, { v: "solanka", t: "solanka" }]} />

            <Wybor etykieta="Dojrzewanie" wartosc={p.dojrzewanieDni} zmien={ustaw("dojrzewanieDni")}
              opcje={KROKI_DOJRZEWANIA.map((d) => ({
                v: d,
                t: d === 0 ? "brak"
                  : d < 30 ? `${d} dni`
                  : d < 365 ? `${Math.round(d / 30)} mies.`
                  : d < 550 ? `${Math.round(d / 30)} mies.`
                  : "2 lata",
              }))} />

            <Wybor etykieta="Środowisko dojrzewania" wartosc={p.srodowisko} zmien={ustaw("srodowisko")}
              opcje={[{ v: "proznia" as Srodowisko, t: "folia / próżnia" }, { v: "piwnica", t: "piwnica, przewracanie" },
                      { v: "wosk", t: "wosk" }, { v: "mycie", t: "mycie skórki solanką" }]} />
          </div>

          <div>
            <div className="sticky top-4">
              {wynik.blad ? (
                <div className="rounded-lg border-2 border-destructive/40 p-5 mb-4">
                  <div className="text-xs uppercase tracking-wide text-destructive mb-1">Błąd produkcji</div>
                  <h2 className="text-2xl font-display font-bold mb-2">{wynik.blad.tytul}</h2>
                  <p>{wynik.blad.dlaczego}</p>
                </div>
              ) : wynik.archetyp ? (
                <div className="rounded-lg border-2 border-primary/40 p-5 mb-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Wychodzi</div>
                  <h2 className="text-2xl font-display font-bold mb-2">
                    {wynik.archetyp.nazwa}
                    {p.mleko !== "krowie" && <span className="text-muted-foreground font-normal"> ({p.mleko})</span>}
                  </h2>
                  <p className="mb-3">{wynik.archetyp.opis}</p>
                  {wynik.bliskie.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Blisko stąd do: {wynik.bliskie.map((a) => a.nazwa).join(", ")}.
                    </p>
                  )}
                </div>
              ) : null}

              <div className="rounded-lg border border-border p-5 mb-4">
                <Pasek etykieta="Wilgotność" wartosc={wynik.osie.wilgotnosc} />
                <Pasek etykieta="Twardość" wartosc={wynik.osie.twardosc} />
                <Pasek etykieta="Intensywność smaku" wartosc={wynik.osie.intensywnosc} />
              </div>

              <div className="rounded-lg border border-border p-5">
                <h3 className="font-semibold mb-2">Co zostaje w garnku</h3>
                <p className="text-sm mb-3">{OPIS_SERWATKI[wynik.serwatka]}</p>
                {wynik.serwatka === "slodka" ? (
                  <p className="text-sm">
                    <strong>{RICOTTA.nazwa}</strong> do wzięcia: podgrzej serwatkę do 85–90°C
                    i lekko zakwaś. Ścinają się albuminy, których podpuszczka nie ruszyła.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Ricotty nie będzie, i to nie jest kwestia techniki.
                  </p>
                )}
              </div>

              <Button variant="outline" size="sm" className="mt-4" onClick={() => setP(START)}>
                Zacznij od nowa
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>Czego ten model nie obejmuje.</strong> W prawdziwym serowarstwie o wyniku
            decyduje przede wszystkim kwasowość na każdym etapie, a jej tu nie ma. Nie ma też
            przekłuwania serów niebieskich, wilgotności powietrza ani rasy zwierzęcia. To jest
            narzędzie do nauki zależności, nie przepis.
          </p>
          <p>
            Kultury i ceny: <Link to="/baza-kultur" className="underline">baza kultur</Link>.
            Prawdziwe przepisy: <Link to="/przepisy" className="underline">przepisy na sery</Link>.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SymulatorSera;
