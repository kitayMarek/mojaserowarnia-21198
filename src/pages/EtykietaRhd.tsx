import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import SeeAlso from "@/components/SeeAlso";
import { Button } from "@/components/ui/button";
import { Tag, Printer, Info, ExternalLink, Scale } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import {
  NA_ETYKIECIE, NIE_WYMAGANE, PRZY_STOISKU, LUZEM, LUZEM_NIE_WYMAGANE, PODPOWIEDZI, ZRODLA,
  STAN_PRAWNY_NA, podstawaTekst, type TypDaty, type Wymog,
} from "@/data/etykietaRhd";

/**
 * Narzędzie: etykieta RHD na ser. Wymagania prawne i darmowy edytor (tylko w przeglądarce).
 * Wymagania i podpowiedzi pochodzą z src/data/etykietaRhd.ts (to samo źródło co mirror
 * /etykieta-do-sprzedazy-rhd i plik /dane/etykieta-rhd.json).
 * Dane producenta zapisywane w localStorage ("wpisz raz"). Druk przez @media print.
 * To pomoc edukacyjna, NIE porada prawna. Patrz zastrzeżenie.
 */

interface LabelData {
  nazwa: string;
  kategoria: string;
  masa: string;
  producent_imie: string;
  producent_adres: string;
  nr_wet: string;
  data_produkcji: string;
  typ_daty: TypDaty;
  data_waznosci: string;
  przechowywanie: string;
  skladniki: string;
  alergeny: string; // lista po przecinku, np. "mleko"
  mleko_surowe: boolean;
  numer_partii: string;
  uwagi: string;
}

const TEMPLATES: Record<string, Partial<LabelData>> = Object.fromEntries(
  PODPOWIEDZI.map(({ id, przechowywanie, alergeny, typ_daty, skladniki }) => [
    id,
    { przechowywanie, alergeny, typ_daty, skladniki },
  ]),
);

const KATEGORIE: { value: string; label: string }[] = PODPOWIEDZI.map((p) => ({ value: p.id, label: p.nazwa }));

/** Lista wymogów z podstawą prawną (jedno źródło: src/data/etykietaRhd.ts). */
function ListaWymogow({ wymogi, numerowana = false }: { wymogi: Wymog[]; numerowana?: boolean }) {
  const Tag = numerowana ? "ol" : "ul";
  return (
    <Tag className={`space-y-3 text-muted-foreground ml-5 ${numerowana ? "list-decimal" : "list-disc"}`}>
      {wymogi.map((w) => (
        <li key={w.id}>
          <strong className="text-foreground">{w.pole}</strong>: {w.opis}
          {w.uwaga && <span className="block text-sm mt-1">{w.uwaga}</span>}
          {w.pewnosc === "do_potwierdzenia" && (
            <span className="block text-sm mt-1 text-amber-700 dark:text-amber-400">Do potwierdzenia u powiatowego lekarza weterynarii.</span>
          )}
          <span className="block text-xs mt-1 text-muted-foreground/80">Podstawa: {podstawaTekst(w)}</span>
        </li>
      ))}
    </Tag>
  );
}

const FRESH = new Set(["ser-swiezy", "twarog"]);

const today = () => new Date().toISOString().slice(0, 10);

const PRODUCER_KEY = "rhd-label-producer";

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const p = iso.split("-");
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : iso;
};

/** Tekst składników z POGRUBIONYMI alergenami (art. 21 rozp. 1169/2011). */
function renderSkladniki(skladniki: string, alergeny: string) {
  const words = alergeny.split(",").map((s) => s.trim()).filter(Boolean);
  if (!words.length) return <>{skladniki}</>;
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = skladniki.split(re);
  return (
    <>
      {parts.map((part, i) =>
        words.some((w) => w.toLowerCase() === part.toLowerCase())
          ? <strong key={i} style={{ textTransform: "uppercase" }}>{part}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

/** Wizualna etykieta 10×7 cm — używana i jako wzór (przykład), i jako live podgląd/druk. */
function LabelCard({ d }: { d: LabelData }) {
  const dataLabel = d.typ_daty === "przydatnosc" ? "Należy spożyć do" : "Najlepiej spożyć przed";
  const showWet = ["ser-swiezy", "ser-dojrzewajacy", "ser-plesniowy", "twarog", "maslo"].includes(d.kategoria);
  return (
    <div
      style={{
        width: "100mm", minHeight: "70mm", padding: "5mm",
        border: "1.5px solid #333", background: "#fff", color: "#111",
        fontFamily: "Arial, Helvetica, sans-serif", fontSize: "10.5px", lineHeight: 1.4,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, lineHeight: 1.15 }}>{d.nazwa || "Nazwa produktu"}</div>
          <div style={{ fontSize: "9px", color: "#444", marginTop: "2px", letterSpacing: "0.04em" }}>
            ROLNICZY HANDEL DETALICZNY
          </div>
        </div>
        <div style={{ fontSize: "13px", fontWeight: 700 }}>{d.masa || ""}</div>
      </div>

      <div style={{ borderTop: "1px solid #ccc", margin: "5px 0" }} />

      <table style={{ width: "100%", fontSize: "10px", borderCollapse: "collapse" }}>
        <tbody>
          <tr><td style={{ color: "#555", width: "40%", paddingBottom: "2px", verticalAlign: "top" }}>Producent</td>
            <td style={{ paddingBottom: "2px" }}><strong>{d.producent_imie || "—"}</strong></td></tr>
          <tr><td style={{ color: "#555", paddingBottom: "2px", verticalAlign: "top" }}>Adres</td>
            <td style={{ paddingBottom: "2px" }}>{d.producent_adres || "—"}</td></tr>
          <tr><td style={{ color: "#555", paddingBottom: "2px" }}>Data produkcji</td>
            <td style={{ paddingBottom: "2px" }}>{fmtDate(d.data_produkcji)}</td></tr>
          <tr><td style={{ color: "#555", paddingBottom: "2px" }}>{dataLabel}</td>
            <td style={{ paddingBottom: "2px" }}><strong>{fmtDate(d.data_waznosci)}</strong></td></tr>
          {d.przechowywanie && (
            <tr><td style={{ color: "#555", paddingBottom: "2px" }}>Przechowywanie</td>
              <td style={{ paddingBottom: "2px" }}>{d.przechowywanie}</td></tr>
          )}
          {d.numer_partii && (
            <tr><td style={{ color: "#555", paddingBottom: "2px" }}>Nr partii</td>
              <td style={{ paddingBottom: "2px" }}>{d.numer_partii}</td></tr>
          )}
          {showWet && d.nr_wet && (
            <tr><td style={{ color: "#555", paddingBottom: "2px" }}>Nr wet.</td>
              <td style={{ paddingBottom: "2px" }}>{d.nr_wet}</td></tr>
          )}
        </tbody>
      </table>

      {d.skladniki && (
        <div style={{ marginTop: "4px", fontSize: "9px", borderTop: "1px solid #eee", paddingTop: "3px" }}>
          <span style={{ color: "#555" }}>Skład: </span>{renderSkladniki(d.skladniki, d.alergeny)}.
        </div>
      )}
      {d.alergeny && (
        <div style={{ fontSize: "9px", marginTop: "2px" }}>
          <span style={{ color: "#555" }}>Alergeny: </span>
          <strong style={{ textTransform: "uppercase" }}>{d.alergeny}</strong>
        </div>
      )}
      {d.mleko_surowe && (
        <div style={{ fontSize: "9px", fontWeight: 700, marginTop: "2px" }}>Wyprodukowano z surowego mleka.</div>
      )}
      {d.uwagi && (
        <div style={{ marginTop: "3px", fontSize: "8.5px", color: "#666" }}>{d.uwagi}</div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelCls = "block text-sm font-medium text-foreground mb-1";

const EtykietaRhd = () => {
  const [d, setD] = useState<LabelData>({
    nazwa: "", kategoria: "ser-dojrzewajacy", masa: "", producent_imie: "", producent_adres: "",
    nr_wet: "", data_produkcji: today(), typ_daty: "trwalosc", data_waznosci: "",
    przechowywanie: "Przechowywać w temp. 4–10°C", skladniki: "MLEKO, sól, kultury bakteryjne, podpuszczka",
    alergeny: "mleko", mleko_surowe: false, numer_partii: "", uwagi: "",
  });
  const [saved, setSaved] = useState(false);
  const [kopie, setKopie] = useState(8);

  useEffect(() => {
    document.title = "Etykieta RHD na ser: wymagania i darmowy generator | Moja Serowarnia";
    const m = document.querySelector('meta[name="description"]');
    if (m) m.setAttribute("content", "Co musi być na etykiecie sera w rolniczym handlu detalicznym (RHD), a co przy stoisku: pola z podstawą prawną, wzór i darmowy edytor etykiety do druku.");
    try {
      const raw = localStorage.getItem(PRODUCER_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setD((s) => ({ ...s, producent_imie: p.producent_imie ?? "", producent_adres: p.producent_adres ?? "", nr_wet: p.nr_wet ?? "" }));
      }
    } catch { /* ignore */ }
  }, []);

  const set = <K extends keyof LabelData>(k: K, v: LabelData[K]) => setD((s) => ({ ...s, [k]: v }));

  const onKategoria = (value: string) => {
    const t = TEMPLATES[value] ?? {};
    setD((s) => ({ ...s, kategoria: value, ...t }));
  };

  const saveProducer = () => {
    try {
      localStorage.setItem(PRODUCER_KEY, JSON.stringify({ producent_imie: d.producent_imie, producent_adres: d.producent_adres, nr_wet: d.nr_wet }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* ignore */ }
  };

  const dateMismatch = FRESH.has(d.kategoria) && d.typ_daty === "trwalosc";

  return (
    <div className="min-h-screen bg-background">
      {/* CSS druku: na wydruku pokazujemy TYLKO arkusz etykiet (siatka na A4 do wycięcia) */}
      <style>{`
        @media screen { #label-print-sheet { display: none; } }
        @media print {
          body * { visibility: hidden !important; }
          #label-print-sheet, #label-print-sheet * { visibility: visible !important; }
          #label-print-sheet {
            position: fixed !important; top: 0; left: 0; right: 0;
            display: grid !important; grid-template-columns: repeat(auto-fill, 100mm);
            justify-content: center; align-content: start; gap: 1.5mm; padding: 4mm;
          }
          #label-print-sheet > div { border: 1px solid #333 !important; break-inside: avoid; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      <Navigation />
      <PageBreadcrumbs items={[{ label: "Narzędzia", href: "/narzedzia" }, { label: "Etykieta RHD" }]} />

      <main className="pt-20">
        {/* Nagłówek strony — spójny PageHeader */}
        <div className="container mx-auto px-4 pt-6">
          <div className="max-w-4xl mx-auto">
            <PageHeader
              icon={Tag}
              color="amber"
              title="Etykieta RHD na ser: wymagania i darmowy generator"
              subtitle="Sprzedajesz ser w ramach rolniczego handlu detalicznego? Poniżej co musi być na etykiecie, co przy stoisku i co przy sprzedaży luzem (z podstawą prawną), wzór oraz edytor do druku."
            />
          </div>
        </div>

        {/* Po co etykieta */}
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">Po co etykieta?</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Każdy produkt spożywczy wprowadzany do obrotu, także ser sprzedawany w RHD bezpośrednio konsumentowi,
              musi być oznakowany tak, by kupujący wiedział, <strong>co kupuje, od kogo, do kiedy zjeść i jak przechowywać</strong>,
              oraz czy zawiera <strong>alergeny</strong>. W RHD obowiązki są w dwóch miejscach: część danych jest na
              <strong> etykiecie</strong>, a napis „rolniczy handel detaliczny” i numer weterynaryjny są na
              <strong> oznakowaniu stoiska</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Prawidłowa etykieta chroni konsumenta (alergeny, termin) i Ciebie: to dowód rzetelnego wprowadzenia produktu
              do obrotu w razie kontroli.
            </p>
          </div>
        </section>

        {/* Wymagania: etykieta */}
        <section className="py-10 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-5">Co musi być na etykiecie sera w opakowaniu</h2>
            <ListaWymogow wymogi={NA_ETYKIECIE} numerowana />
            <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 flex gap-2">
              <Info className="h-5 w-5 shrink-0" />
              <div>
                <strong>Czego na etykiecie nie musisz dawać:</strong>
                <ul className="mt-2 ml-4 list-disc space-y-2">
                  {NIE_WYMAGANE.map((w) => (
                    <li key={w.id}>
                      <strong>{w.pole}</strong>: {w.opis} {w.uwaga}
                      <span className="block text-xs mt-1 opacity-80">Podstawa: {podstawaTekst(w)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Wymagania: stoisko */}
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">Co musi być przy stoisku (miejsce sprzedaży)</h2>
            <p className="text-muted-foreground mb-4">
              W miejscu sprzedaży w RHD umieszczasz, czytelnie i widocznie dla kupującego:
            </p>
            <ListaWymogow wymogi={PRZY_STOISKU} />
          </div>
        </section>

        {/* Wymagania: luzem */}
        <section className="py-10 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">Sprzedaż luzem, bez opakowania</h2>
            <p className="text-muted-foreground mb-4">
              Ser krojony z lady i niepakowany wcześniej nie potrzebuje etykiety. Przy produkcie podajesz na wywieszce
              albo w inny sposób:
            </p>
            <ListaWymogow wymogi={LUZEM} />
            <p className="text-muted-foreground mt-4 text-sm">
              Przy sprzedaży luzem nie są wymagane: {LUZEM_NIE_WYMAGANE.join(", ")}.
            </p>
          </div>
        </section>

        {/* Podstawa prawna */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" /> Podstawa prawna
            </h2>
            <ul className="space-y-2 text-muted-foreground list-disc ml-5">
              {Object.entries(ZRODLA).map(([id, z]) => (
                <li key={id}>
                  <a href={z.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{z.akt}</a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground/80 italic">
              ⚖️ Materiał edukacyjny, nie porada prawna. Przepisy sprawdzone w tekstach aktów {STAN_PRAWNY_NA.split("-").reverse().join(".")}.
              Zakres znakowania potwierdź u <strong>powiatowego lekarza weterynarii</strong> właściwego dla Twojego gospodarstwa.
            </p>
          </div>
        </section>

        {/* Wzór / przykład */}
        <section className="py-10 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Wzór etykiety (przykład)</h2>
            <p className="text-muted-foreground mb-5">Tak może wyglądać etykieta dojrzewającego sera w RHD (10 × 7 cm). Napis „rolniczy handel detaliczny” i numer weterynaryjny są na niej dobrowolne, obowiązkowo muszą być przy stoisku.</p>
            <div className="flex justify-center">
              <img
                src="/wzor-etykiety-rhd-na-ser.svg"
                alt="Wzór etykiety RHD na ser dojrzewający (gouda): nazwa, masa netto, producent i adres, data produkcji i termin, skład z wyróżnionym alergenem MLEKO, numer partii oraz dobrowolny numer weterynaryjny"
                width={500}
                height={350}
                loading="lazy"
                className="rounded-md border border-border max-w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Edytor + live podgląd */}
        <section className="py-12 bg-gradient-to-b from-amber-50/60 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 border-y border-amber-100 dark:border-amber-900/30">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Generator etykiety</h2>
            <p className="text-muted-foreground mb-6">
              Wypełnij pola, a podgląd po prawej aktualizuje się na żywo. Dane producenta możesz zapisać w przeglądarce
              (wpisujesz raz). Nic nie wysyłamy na serwer.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formularz */}
              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Nazwa produktu *</label>
                  <input className={inputCls} value={d.nazwa} onChange={(e) => set("nazwa", e.target.value)} placeholder="Ser dojrzewający typu gouda" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Kategoria</label>
                    <select className={inputCls} value={d.kategoria} onChange={(e) => onKategoria(e.target.value)}>
                      {KATEGORIE.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Masa netto *</label>
                    <input className={inputCls} value={d.masa} onChange={(e) => set("masa", e.target.value)} placeholder="0,4 kg" />
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-foreground">Dane producenta</span>
                    <button onClick={saveProducer} className="text-xs text-primary hover:underline">
                      {saved ? "✓ zapisano" : "zapisz w przeglądarce"}
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input className={inputCls} value={d.producent_imie} onChange={(e) => set("producent_imie", e.target.value)} placeholder="Imię i nazwisko / nazwa *" />
                    <textarea className={inputCls} rows={2} value={d.producent_adres} onChange={(e) => set("producent_adres", e.target.value)} placeholder="Adres gospodarstwa *" />
                    <input className={inputCls} value={d.nr_wet} onChange={(e) => set("nr_wet", e.target.value)} placeholder="Weterynaryjny nr identyfikacyjny (na etykiecie dobrowolny)" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Data produkcji *</label>
                    <input type="date" className={inputCls} value={d.data_produkcji} onChange={(e) => set("data_produkcji", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Typ terminu</label>
                    <select className={inputCls} value={d.typ_daty} onChange={(e) => set("typ_daty", e.target.value as TypDaty)}>
                      <option value="przydatnosc">Należy spożyć do (świeże)</option>
                      <option value="trwalosc">Najlepiej spożyć przed (dojrzewające)</option>
                    </select>
                  </div>
                </div>
                {dateMismatch && (
                  <p className="text-xs text-red-600 -mt-2">
                    ⚠️ Sery świeże/twaróg zwykle wymagają „należy spożyć do" (termin przydatności), nie „najlepiej spożyć przed".
                  </p>
                )}
                <div>
                  <label className={labelCls}>Data ważności *</label>
                  <input type="date" className={inputCls} value={d.data_waznosci} onChange={(e) => set("data_waznosci", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Warunki przechowywania</label>
                  <input className={inputCls} value={d.przechowywanie} onChange={(e) => set("przechowywanie", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Skład (alergeny pogrubią się automatycznie)</label>
                  <textarea className={inputCls} rows={2} value={d.skladniki} onChange={(e) => set("skladniki", e.target.value)} placeholder="MLEKO, sól, kultury bakteryjne, podpuszczka" />
                </div>
                <div>
                  <label className={labelCls}>Alergeny (po przecinku, wyróżniane w składzie)</label>
                  <input className={inputCls} value={d.alergeny} onChange={(e) => set("alergeny", e.target.value)} placeholder="mleko" />
                </div>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={d.mleko_surowe} onChange={(e) => set("mleko_surowe", e.target.checked)} />
                  Ser z surowego mleka, bez obróbki cieplnej (dodaje napis „Wyprodukowano z surowego mleka”)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Numer partii</label>
                    <input className={inputCls} value={d.numer_partii} onChange={(e) => set("numer_partii", e.target.value)} placeholder="np. GOUDA-20260622-A" />
                  </div>
                  <div>
                    <label className={labelCls}>Uwagi</label>
                    <input className={inputCls} value={d.uwagi} onChange={(e) => set("uwagi", e.target.value)} placeholder="np. ser z mleka własnego" />
                  </div>
                </div>
              </div>

              {/* Podgląd + druk */}
              <div className="lg:sticky lg:top-24 self-start">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">Podgląd na żywo</span>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground whitespace-nowrap" htmlFor="kopie">Sztuk na A4:</label>
                    <select
                      id="kopie"
                      className="rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={kopie}
                      onChange={(e) => setKopie(Number(e.target.value))}
                    >
                      {[1, 2, 4, 6, 8].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <Button onClick={() => window.print()} className="gap-2">
                      <Printer className="h-4 w-4" /> Drukuj / PDF
                    </Button>
                  </div>
                </div>
                <div className="flex justify-center bg-muted/30 rounded-lg p-4">
                  <LabelCard d={d} />
                </div>
                {/* Arkusz do druku (tylko na wydruku): siatka kopii na A4 do wycięcia */}
                <div id="label-print-sheet">
                  {Array.from({ length: kopie }).map((_, i) => <LabelCard key={i} d={d} />)}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Druk układa <strong>{kopie}</strong> {kopie === 1 ? "etykietę" : "etykiet"} na arkuszu <strong>A4</strong> do wycięcia
                  (np. papier samoprzylepny). W oknie drukowania ustaw rozmiar A4 i marginesy „brak/minimalne", albo „Zapisz jako PDF".
                </p>
              </div>
            </div>

            <p className="mt-8 text-xs text-muted-foreground/80 italic border-t border-border pt-4">
              ⚖️ Generator jest pomocą techniczną/edukacyjną. Odpowiedzialność za zgodność znakowania z przepisami spoczywa
              na producencie. Zweryfikuj wymagania u powiatowego lekarza weterynarii.
            </p>
          </div>
        </section>

        {/* CTA Fermly + SeeAlso */}
        <section className="py-10 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-2">Prowadzisz produkcję i sprzedaż?</h2>
              <p className="text-muted-foreground mb-4">
                W aplikacji <strong>Fermly</strong> etykieta wypełni się <strong>automatycznie z partii produkcyjnej</strong>
                (nazwa, skład, daty, numer partii), zapisze się w bazie i dostanie kod QR do metryczki sera. Tu masz wzór i
                wiedzę, a tam pełną integrację z gospodarstwem i rejestrem RHD.
              </p>
              <Button asChild className="gap-2">
                <a href="https://fermly.pl/mleko" target="_blank" rel="noopener noreferrer">
                  Etykieta z partii w Fermly <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <SeeAlso links={[
              { href: "/prawo", title: "Sprzedaż sera w RHD: przewodnik prawny", description: "Rejestracja, limity, oznakowanie miejsca sprzedaży" },
              { href: "/kalkulator-kosztu-sera", title: "Kalkulator kosztu sera", description: "Koszt produkcji, marża i cena sprzedaży" },
              { href: "/przepisy", title: "Przepisy na sery", description: "Krok po kroku jak zrobić ser" },
              { href: "/narzedzia", title: "Wszystkie narzędzia", description: "Kalkulatory i konwertery dla serowara" },
            ]} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default EtykietaRhd;
