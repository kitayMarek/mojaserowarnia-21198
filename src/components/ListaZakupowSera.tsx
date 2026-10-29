import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ShoppingCart, Store, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { trackShopClick } from "@/utils/trackShopClick";
import { kulturyPrzepisow, type PowodWyboru } from "@/data/kulturyPrzepisow";
import {
  datyCen, listaZakupow, litryZPrzepisu, podsumuj, wydajnoscZPrzepisu,
  type Oferta, type Wiersz, type Zakres,
} from "@/lib/listaZakupow";
import type { Recipe } from "@/data/recipesData";

/**
 * Lista zakupów do sera na stronie przepisu: co kupić, ile zużyjesz, gdzie
 * i za ile, koszt partii i kg sera. Liczy src/lib/listaZakupow.ts.
 *
 * WYGLĄD jak lista zakupów w Policz i Kup (planer.mojapasza.com, prośba Marka
 * z 29.10.2026: „jak konie z jednej stajni”): ponumerowane kroki, karta oferty
 * z ceną, datą ceny i linkiem, zdanie, że to nie są ceny bieżące, i że kolejność
 * ustala tylko cena. Dostawa opisem z katalogu Dane Rolne, bez sumy z dostawą,
 * bo sklepy nie podają cennika, z którego dałoby się ją policzyć.
 */

const DODAJ_SKLEP_HREF = "https://danerolne.com/zglos?sprawa=dodaj";
const DANE_ROLNE_KATALOG = "https://danerolne.com/katalog";

const ZASTRZEZENIE_SKLADU =
  "Ten sam skład gatunkowy nie znaczy ten sam produkt: producenci dobierają konkretne szczepy i ich proporcje. Zwykle zadziała jako zamiennik, ale sprawdź przeznaczenie.";

const POWODY: Record<PowodWyboru, string> = {
  przepis: "w przepisie",
  sklep: "sklep poleca do tego sera",
  sklad: "zamiennik po składzie",
};

const liczba = (x: number, miejsc = 2) =>
  x.toLocaleString("pl-PL", { minimumFractionDigits: 0, maximumFractionDigits: miejsc });
const zl = (x: number) => `${x.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
const zlZakres = ([a, b]: Zakres) => (a === b ? zl(a) : `${zl(a).replace(" zł", "")}-${zl(b)}`);
const data = (d: string | null) => (d ? d.split("-").reverse().join(".") : "?");

function ilosc(o: Oferta): string | null {
  if (!o.ilosc) return null;
  const [a, b] = o.ilosc.zakres;
  if (o.ilosc.jednostka === "opakowania") {
    if (a >= 1) return `${liczba(a, 1)} opakowania`;
    return `ok. 1/${Math.round(1 / a)} opakowania`;
  }
  // Odmiana jak przy górnej liczbie: 2-4 krople, 5 kropli (12-14 też „kropli”).
  const odmiana = (n: number) => (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "krople" : n === 1 ? "kropla" : "kropli");
  const j = o.ilosc.jednostka === "krople" ? odmiana(Math.round(b)) : o.ilosc.jednostka;
  const r = (x: number) => liczba(x, o.ilosc!.jednostka === "krople" ? 0 : 1);
  return a === b ? `${r(a)} ${j}` : `${r(a)}-${r(b)} ${j}`;
}

/** Adres oferty z oznaczeniem, po którym sklep i nasz licznik rozpoznają wejście z listy zakupów. */
function adresOferty(o: Oferta): string | null {
  if (!o.url) return null;
  try {
    const u = new URL(o.url);
    const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    u.searchParams.set("utm_source", "mojaserowarnia");
    u.searchParams.set("utm_medium", "lista_zakupow");
    u.searchParams.set("utm_campaign", slug(o.sklep));
    u.searchParams.set("utm_content", slug(o.produkt).slice(0, 50));
    return u.toString();
  } catch {
    return o.url;
  }
}

// ─── Dostawa z katalogu Dane Rolne (kopia sklepy_z_huba, odświeżana co godzinę) ───

interface Dostawa { opis?: string; sprawdzono?: string }
let dostawy: Promise<Map<string, Dostawa>> | null = null;

function pobierzDostawy(): Promise<Map<string, Dostawa>> {
  dostawy ??= Promise.resolve(supabase.from("sklepy_z_huba").select("sklep_id, dostawa"))
    .then(({ data: wiersze, error }) => {
      if (error) throw error;
      return new Map((wiersze ?? []).map((w) => [w.sklep_id, (w.dostawa ?? {}) as Dostawa]));
    })
    .catch((err: unknown) => {
      console.error("[sklepy_z_huba dostawa]", err);
      dostawy = null;
      return new Map<string, Dostawa>();
    });
  return dostawy;
}

// ─── Karta oferty ─────────────────────────────────────────────────────────────

function KartaOferty({ o, naglowek, akcja, liczymyKoszt = true }: { o: Oferta; naglowek?: string; akcja?: React.ReactNode; liczymyKoszt?: boolean }) {
  const href = adresOferty(o);
  return (
    <div className="min-w-0 rounded-xl border border-border bg-background/60 p-3 text-sm">
      {naglowek && <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{naglowek}</div>}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium text-foreground">{o.produkt}</div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Store className="size-3.5 shrink-0" aria-hidden />
            {o.sklep}
            {o.odmiana && <span>· {o.odmiana}</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {o.powod && (
            <span
              className={`rounded-full border px-2 py-0.5 text-xs ${o.powod === "sklad" ? "border-amber-500/50 text-amber-700 dark:text-amber-400" : "border-border text-muted-foreground"}`}
              title={o.powod === "sklad" ? ZASTRZEZENIE_SKLADU : undefined}
            >
              {POWODY[o.powod]}
            </span>
          )}
          {akcja}
        </div>
      </div>

      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Cena</dt>
          <dd className="tabular-nums text-foreground">
            {zl(o.cenaZl)}
            {o.opakowanie && <span className="text-muted-foreground"> / {o.opakowanie}</span>}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Na tę partię</dt>
          <dd className="tabular-nums text-foreground">{o.naPartieZl ? zlZakres(o.naPartieZl) : "?"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Cena z dnia</dt>
          <dd className="tabular-nums text-foreground">{data(o.sprawdzono)}</dd>
        </div>
        {ilosc(o) && (
          <div>
            <dt className="text-muted-foreground">Zużyjesz</dt>
            <dd className="tabular-nums text-foreground">{ilosc(o)}</dd>
          </div>
        )}
        {o.opakowan != null && o.opakowan > 1 && (
          <div>
            <dt className="text-muted-foreground">Opakowań</dt>
            <dd className="tabular-nums text-foreground">{o.opakowan} · {zl(o.doKasyZl)}</dd>
          </div>
        )}
        {o.starczyNaPartii != null && o.starczyNaPartii >= 1 && (
          <div>
            <dt className="text-muted-foreground">Starczy na</dt>
            <dd className="tabular-nums text-foreground">{o.starczyNaPartii} takich partii</dd>
          </div>
        )}
      </dl>

      {o.dawkaTekst && <p className="mt-2 text-xs text-muted-foreground">Dawkowanie wg sklepu: {o.dawkaTekst}</p>}
      {o.uwaga && <p className="mt-1 text-xs text-muted-foreground">{o.uwaga}</p>}
      {liczymyKoszt && !o.naPartieZl && (
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
          Kosztu partii nie liczymy: sklep nie podaje pojemności albo dawki, albo podaje je w różnych jednostkach.
        </p>
      )}
      {href && (
        <div className="mt-2 text-xs">
          <a
            href={href}
            target="_blank"
            rel="noopener nofollow"
            onClick={() => trackShopClick(o.produkt, o.sklep, o.sklepId)}
            className="inline-flex items-center gap-1 text-primary underline underline-offset-2 hover:text-accent"
          >
            Strona oferty <ExternalLink className="size-3" aria-hidden />
          </a>
        </div>
      )}
    </div>
  );
}

function WierszZakupow({ w, wybrana, wybierz }: { w: Wiersz; wybrana: string | null; wybierz: (id: string) => void }) {
  const [inne, setInne] = useState(false);
  const o = w.oferty.find((x) => x.id === wybrana);
  const reszta = w.oferty.filter((x) => x.id !== wybrana);
  // Sól do solanki albo do smaku: koszt świadomie nie jest liczony, więc bez ostrzeżenia.
  const liczymyKoszt = w.rodzaj !== "sol" || w.wymagana;
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground">
          {w.nazwa}
          {!w.wymagana && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {w.rodzaj === "sol" ? "(nie liczymy w koszcie partii)" : "(opcjonalnie, nie liczymy w koszcie)"}
            </span>
          )}
        </h4>
      </div>
      {w.wOryginale && (
        <p className="mb-2 text-xs text-muted-foreground">
          W oryginale przepisu: <strong>{w.wOryginale}</strong> (nazwa z przepisu amerykańskiego). Niżej odpowiedniki z polskich sklepów z naszej bazy.
        </p>
      )}
      {w.uwaga && <p className="mb-2 text-xs text-muted-foreground">{w.uwaga}</p>}
      {o ? (
        <KartaOferty
          o={o}
          naglowek={o.id === w.domyslna ? "Propozycja: najmniej przy kasie" : "Twój wybór"}
          liczymyKoszt={liczymyKoszt}
          akcja={
            o.id !== w.domyslna && w.domyslna ? (
              <button type="button" onClick={() => wybierz(w.domyslna!)} className="rounded-md border border-border px-2 py-0.5 text-xs hover:border-foreground">
                Wróć do propozycji
              </button>
            ) : undefined
          }
        />
      ) : (
        <p className="text-xs text-muted-foreground">Brak ofert w naszej bazie.</p>
      )}
      {reszta.length > 0 && (
        <div className="mt-2">
          <button type="button" onClick={() => setInne((x) => !x)} className="text-xs text-primary underline underline-offset-2">
            {inne ? "Ukryj inne oferty" : `Inne oferty (${reszta.length}), od najtańszej na partię`}
          </button>
          {inne && (
            <div className="mt-2 space-y-2">
              {reszta.map((x) => (
                <KartaOferty
                  key={x.id}
                  o={x}
                  liczymyKoszt={liczymyKoszt}
                  akcja={
                    <button type="button" onClick={() => wybierz(x.id)} className="rounded-md border border-border px-2 py-0.5 text-xs hover:border-foreground">
                      Wybierz
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sekcja ───────────────────────────────────────────────────────────────────

const krok = "mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground";

export default function ListaZakupowSera({ recipe }: { recipe: Recipe }) {
  const mapa = kulturyPrzepisow[recipe.id];
  const litryPrzepisu = litryZPrzepisu(recipe.milkBase);
  const wydajnosc = useMemo(() => wydajnoscZPrzepisu(recipe.yield), [recipe.yield]);

  const [litryTekst, setLitryTekst] = useState(litryPrzepisu ? String(litryPrzepisu).replace(".", ",") : "10");
  const [pasteryzowane, setPasteryzowane] = useState(true);
  const [cenaMleka, setCenaMleka] = useState("");
  const [cenaSoli, setCenaSoli] = useState("");
  const [wybrane, setWybrane] = useState<Record<string, string>>({});
  const [mapaDostaw, setMapaDostaw] = useState<Map<string, Dostawa>>(new Map());

  useEffect(() => {
    let zywy = true;
    pobierzDostawy().then((m) => zywy && setMapaDostaw(m));
    return () => { zywy = false; };
  }, []);

  const liczbaZPola = (t: string) => {
    const x = Number(t.replace(",", ".").trim());
    return t.trim() && Number.isFinite(x) && x > 0 ? x : null;
  };
  const litry = liczbaZPola(litryTekst) ?? litryPrzepisu ?? 10;

  const lista = useMemo(
    () => (mapa ? listaZakupow(recipe.id, { litry, pasteryzowane, wydajnosc }) : null),
    [mapa, recipe.id, litry, pasteryzowane, wydajnosc],
  );
  if (!mapa || !lista) return null;

  const suma = podsumuj(lista, wybrane, { litry, cenaMlekaZl: liczbaZPola(cenaMleka), wydajnosc, cenaSoliZaKg: liczbaZPola(cenaSoli) });
  const daty = datyCen(lista);
  const jestZamiennikPoSkladzie = lista.wiersze.some((w) => w.oferty.some((o) => o.powod === "sklad"));
  const wierszPodpuszczki = recipe.dosageTable.find((r) => /podpuszcz/i.test(r.ingredient));
  const wierszSoli = recipe.dosageTable.find((r) => /sól|solank/i.test(r.ingredient));

  return (
    <section id="lista-zakupow" className="bg-card rounded-xl border border-border p-6 md:p-8 mb-8 scroll-mt-24">
      <h2 className="text-2xl font-display font-bold text-primary mb-2 flex items-center gap-2">
        <ShoppingCart className="size-6" aria-hidden /> Lista zakupów
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Co kupić do tego sera, w jakim sklepie i za ile. Ceny pochodzą ze stron sklepów z dnia {daty.map(data).join(" i ")}.
        To nie są ceny bieżące: przed zakupem sprawdź cenę w sklepie. Kolejność ofert ustala tylko cena, żaden sklep za nią nie płaci.
      </p>

      {/* 1. Ile mleka */}
      <div className="rounded-2xl border border-border p-4 mb-6">
        <div className={krok}>1. Ile mleka</div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="lz-litry">Litry mleka</Label>
            <Input id="lz-litry" inputMode="decimal" value={litryTekst} onChange={(e) => setLitryTekst(e.target.value)} />
            {litryPrzepisu && <p className="mt-1 text-xs text-muted-foreground">Przepis jest na {liczba(litryPrzepisu, 1)} l.</p>}
          </div>
          <div>
            <Label htmlFor="lz-mleko">Cena mleka, zł za litr</Label>
            <Input id="lz-mleko" inputMode="decimal" placeholder="wpisz swoją" value={cenaMleka} onChange={(e) => setCenaMleka(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">Bez niej liczymy tylko dodatki.</p>
          </div>
          {mapa.chlorekWapnia && (
            <div className="flex items-start gap-2 pt-6">
              <Checkbox id="lz-past" checked={pasteryzowane} onCheckedChange={(v) => setPasteryzowane(v === true)} />
              <Label htmlFor="lz-past" className="font-normal leading-snug">Mleko pasteryzowane (ze sklepu): dodaj chlorek wapnia</Label>
            </div>
          )}
        </div>
      </div>

      {/* 2. Co kupić */}
      <div className="mb-6">
        <div className={krok}>2. Co kupić</div>
        <div className="space-y-3">
          {lista.wiersze.map((w) => (
            <div key={w.klucz}>
              <WierszZakupow
                w={w}
                wybrana={wybrane[w.klucz] ?? w.domyslna}
                wybierz={(id) => setWybrane((s) => ({ ...s, [w.klucz]: id }))}
              />
              {w.rodzaj === "podpuszczka" && wierszPodpuszczki && (
                <p className="mt-1 px-4 text-xs text-muted-foreground">
                  Przepis podaje: {wierszPodpuszczki.amount} na {liczba(litryPrzepisu ?? litry, 1)} l
                  {wierszPodpuszczki.notes && ` (${wierszPodpuszczki.notes})`}. Dlaczego ilość zależy od produktu:{" "}
                  <Link to="/gdzie-kupic-podpuszczke" className="text-primary underline underline-offset-2">porównanie mocy podpuszczek</Link>.
                </p>
              )}
              {w.rodzaj === "sol" && (
                <div className="mt-2 grid gap-2 px-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <p className="text-xs text-muted-foreground">
                    {wierszSoli && <>Przepis: {wierszSoli.amount}{wierszSoli.notes && ` (${wierszSoli.notes})`}. </>}
                    Masz sól w domu? Wpisz swoją cenę, a lista nie doliczy jej do zakupów.{" "}
                    <Link to="/kalkulator-solanki" className="text-primary underline underline-offset-2">Kalkulator solanki</Link>
                  </p>
                  <div className="w-40">
                    <Label htmlFor="lz-sol" className="text-xs">Twoja cena soli, zł/kg</Label>
                    <Input id="lz-sol" inputMode="decimal" value={cenaSoli} onChange={(e) => setCenaSoli(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {lista.inneZakupy.length > 0 && (
          <ul className="mt-3 list-disc pl-5 text-xs text-muted-foreground">
            {lista.inneZakupy.map((t) => <li key={t}>{t}</li>)}
          </ul>
        )}
      </div>

      {/* 3. Koszt */}
      <div className="rounded-2xl border border-border p-4">
        <div className={krok}>3. Koszt</div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Dodatki na partię</dt>
            <dd className="tabular-nums font-medium">{zlZakres(suma.dodatkiZl)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Mleko</dt>
            <dd className="tabular-nums font-medium">{suma.mlekoZl != null ? zl(suma.mlekoZl) : "wpisz cenę"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              Koszt 1 kg sera{suma.kgSera && ` (z ${liczba(suma.kgSera[0], 1)}${suma.kgSera[1] !== suma.kgSera[0] ? `-${liczba(suma.kgSera[1], 1)}` : ""} kg)`}
            </dt>
            <dd className="tabular-nums font-medium">{suma.zaKgZl ? zlZakres(suma.zaKgZl) : "?"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Przy kasie (całe opakowania)</dt>
            <dd className="tabular-nums font-medium">{zl(suma.doKasyZl)}</dd>
          </div>
        </dl>
        {suma.mlekoZl == null && <p className="mt-2 text-xs text-muted-foreground">Koszt kg sera bez mleka: wpisz cenę mleka w kroku 1.</p>}
        {suma.bezKosztu.length > 0 && (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">Bez kosztu partii (brak danych sklepu): {suma.bezKosztu.join(", ")}.</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Opakowanie zwykle starcza na wiele partii, dlatego koszt partii jest mniejszy niż wydatek przy kasie. Wydajność sera z przepisu.
        </p>

        {suma.sklepy.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-foreground">
              Zakupy w {suma.sklepy.length === 1 ? "jednym sklepie" : `${suma.sklepy.length} sklepach`}
              {suma.sklepy.length > 1 && <span className="font-normal text-muted-foreground"> · każdy sklep to osobna przesyłka; „Inne oferty” pozwalają zebrać zakupy w mniej sklepów</span>}
            </div>
            {suma.sklepy.map((s) => {
              const d = s.sklepId ? mapaDostaw.get(s.sklepId) : undefined;
              return (
                <div key={s.sklep} className="rounded-xl border border-border bg-background/60 p-3 text-xs">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-medium text-foreground"><Store className="size-3.5" aria-hidden />{s.sklep}</span>
                    <span className="tabular-nums">{zl(s.doKasyZl)} bez dostawy</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{s.pozycje.join(", ")}</p>
                  {d?.opis && (
                    <p className="mt-1 flex items-start gap-1.5 text-muted-foreground">
                      <Truck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                      <span>Dostawa wg katalogu Dane Rolne{d.sprawdzono && ` z dnia ${data(d.sprawdzono)}`}: {d.opis}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-4 text-xs">
          <Link to="/kalkulator-kosztu-sera" className="text-primary underline underline-offset-2">Kalkulator kosztu sera</Link>
          <span className="text-muted-foreground">: marża, VAT i koszty stałe.</span>
        </p>
      </div>

      <footer className="mt-4 space-y-1.5 rounded-xl border border-border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">
        <p>
          <span className="text-foreground">Źródło danych: </span>
          kultury z <Link to="/baza-kultur" className="underline underline-offset-2">bazy kultur Mojej Serowarni</Link>; podpuszczki,
          chlorek wapnia i sól ze stron sklepów; sklepy i dostawa z{" "}
          <a href={DANE_ROLNE_KATALOG} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">katalogu Dane Rolne</a>.
          Ilość podpuszczki i chlorku liczymy z dawkowania sklepu, krople na ml: 20 kropli ≈ 1 ml.
        </p>
        {jestZamiennikPoSkladzie && <p><span className="text-foreground">Zamiennik po składzie: </span>{ZASTRZEZENIE_SKLADU}</p>}
        <p>
          Nie widzisz swojego sklepu?{" "}
          <a href={DODAJ_SKLEP_HREF} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Dodaj go</a>
        </p>
      </footer>
    </section>
  );
}
