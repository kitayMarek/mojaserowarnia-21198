import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import SeeAlso from "@/components/SeeAlso";
import { Button } from "@/components/ui/button";
import { Tag, Printer, Info, ExternalLink, Scale } from "lucide-react";
import PageHeader from "@/components/PageHeader";

/**
 * Narzędzie: Etykieta RHD na ser — wymagania prawne + darmowy edytor (klient-only).
 * Dane producenta zapisywane w localStorage ("wpisz raz"). Druk przez @media print.
 * To pomoc edukacyjna — NIE porada prawna. Patrz disclaimer.
 */

type TypDaty = "przydatnosc" | "trwalosc"; // "Należy spożyć do" | "Najlepiej spożyć przed"

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

const TEMPLATES: Record<string, Partial<LabelData>> = {
  "ser-swiezy": { przechowywanie: "Przechowywać w temp. 2–8°C", alergeny: "mleko", typ_daty: "przydatnosc", skladniki: "MLEKO, sól, kultury bakteryjne, podpuszczka" },
  "ser-dojrzewajacy": { przechowywanie: "Przechowywać w temp. 4–10°C", alergeny: "mleko", typ_daty: "trwalosc", skladniki: "MLEKO, sól, kultury bakteryjne, podpuszczka" },
  "ser-plesniowy": { przechowywanie: "Przechowywać w temp. 4–8°C", alergeny: "mleko", typ_daty: "trwalosc", skladniki: "MLEKO, sól, kultury bakteryjne, podpuszczka, pleśń szlachetna" },
  "twarog": { przechowywanie: "Przechowywać w temp. 2–8°C", alergeny: "mleko", typ_daty: "przydatnosc", skladniki: "MLEKO, kultury bakteryjne" },
  "maslo": { przechowywanie: "Przechowywać w temp. do 8°C", alergeny: "mleko", typ_daty: "trwalosc", skladniki: "śmietanka (MLEKO)" },
  "inne": { przechowywanie: "", alergeny: "", typ_daty: "trwalosc", skladniki: "" },
};

const KATEGORIE: { value: string; label: string }[] = [
  { value: "ser-swiezy", label: "Ser świeży" },
  { value: "ser-dojrzewajacy", label: "Ser dojrzewający" },
  { value: "ser-plesniowy", label: "Ser pleśniowy" },
  { value: "twarog", label: "Twaróg" },
  { value: "maslo", label: "Masło" },
  { value: "inne", label: "Inne" },
];

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
        <div style={{ fontSize: "9px", fontWeight: 700, marginTop: "2px" }}>Wyprodukowano z mleka surowego.</div>
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
    document.title = "Etykieta RHD na ser — wymagania + darmowy generator | Moja Serowarnia";
    const m = document.querySelector('meta[name="description"]');
    if (m) m.setAttribute("content", "Co musi być na etykiecie sera w rolniczym handlu detalicznym (RHD): obowiązkowe pola wg rozp. 1169/2011, wzór i darmowy edytor etykiety do druku.");
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
              title="Etykieta RHD na ser — wymagania i darmowy generator"
              subtitle="Sprzedajesz ser w ramach rolniczego handlu detalicznego? Etykieta musi być zgodna z prawem znakowania żywności — poniżej co musi zawierać (z podstawą prawną), wzór oraz edytor do druku."
            />
          </div>
        </div>

        {/* Po co etykieta */}
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">Po co etykieta?</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Każdy produkt spożywczy wprowadzany do obrotu — także ser sprzedawany w RHD bezpośrednio konsumentowi —
              musi być oznakowany tak, by kupujący wiedział, <strong>co kupuje, od kogo, do kiedy zjeść i jak przechowywać</strong>,
              oraz czy zawiera <strong>alergeny</strong>. Ser to produkt <strong>pochodzenia zwierzęcego</strong>, więc nad jego
              produkcją i znakowaniem czuwa <strong>Inspekcja Weterynaryjna</strong> (numer weterynaryjny na etykiecie).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Prawidłowa etykieta chroni konsumenta (alergeny, termin) i Ciebie — to dowód rzetelnego wprowadzenia produktu
              do obrotu w razie kontroli.
            </p>
          </div>
        </section>

        {/* Podstawa prawna */}
        <section className="py-8 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" /> Podstawa prawna
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <strong>Rozporządzenie (UE) nr 1169/2011</strong> w sprawie przekazywania konsumentom informacji o żywności:
                <ul className="mt-1 ml-4 list-disc space-y-1 text-sm">
                  <li><strong>art. 9</strong> — wykaz danych obowiązkowych na etykiecie,</li>
                  <li><strong>art. 13</strong> + zał. IV — czytelność; minimalna wysokość liter (x) <strong>1,2 mm</strong> (0,9 mm dla małych opakowań),</li>
                  <li><strong>art. 21</strong> + zał. II — substancje alergenne i ich <strong>wyróżnienie</strong> w wykazie składników,</li>
                  <li><strong>art. 24</strong> + zał. X — oznaczanie daty: „należy spożyć do" / „najlepiej spożyć przed",</li>
                  <li><strong>zał. V pkt 19</strong> — <strong>zwolnienie</strong> z obowiązkowej informacji o wartości odżywczej (małe ilości, dostawa lokalna/bezpośrednia — obejmuje RHD).</li>
                </ul>
              </li>
              <li><strong>Ustawa z dnia 16 listopada 2016 r.</strong> o zmianie niektórych ustaw w celu ułatwienia sprzedaży żywności przez rolników (wprowadzenie RHD).</li>
              <li><strong>Ustawa z dnia 25 sierpnia 2006 r.</strong> o bezpieczeństwie żywności i żywienia.</li>
              <li>Dla produktów zwierzęcych (ser, masło): <strong>ustawa o produktach pochodzenia zwierzęcego</strong> + rozporządzenia MRiRW dot. RHD i wymagań weterynaryjnych — nadzór <strong>Inspekcji Weterynaryjnej</strong> (numer weterynaryjny).</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground/80 italic">
              ⚖️ Materiał edukacyjny — nie stanowi porady prawnej. Stan prawny może się zmieniać. Zakres znakowania i format
              numerów potwierdź u <strong>powiatowego lekarza weterynarii</strong> (PLW/PIW) właściwego dla Twojego gospodarstwa.
            </p>
          </div>
        </section>

        {/* Wymagania */}
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-5">Co MUSI być na etykiecie sera (RHD)</h2>
            <ol className="space-y-3 text-muted-foreground list-decimal ml-5">
              <li><strong>Nazwa produktu</strong> — opisowa, nie wprowadzająca w błąd (np. „ser dojrzewający typu gouda").</li>
              <li><strong>Wykaz składników</strong> w kolejności malejącej wg masy (mleko, sól, kultury bakteryjne, podpuszczka, ew. CaCl₂).</li>
              <li><strong>Alergeny wyróżnione</strong> w wykazie składników — dla sera zawsze <strong>MLEKO</strong> (pogrubienie/wersaliki, art. 21).</li>
              <li><strong>Ilość netto</strong> (w g lub kg).</li>
              <li><strong>Termin</strong>: <strong>„Należy spożyć do"</strong> — sery świeże/miękkie (łatwo psujące się); <strong>„Najlepiej spożyć przed"</strong> — sery twarde/dojrzewające. Wybór zależy od rodzaju, nie jest dowolny.</li>
              <li><strong>Warunki przechowywania</strong> (np. „Przechowywać w temp. 4–8°C").</li>
              <li><strong>Producent</strong>: imię i nazwisko / nazwa + adres.</li>
              <li><strong>Numer partii</strong> — wymagany, chyba że data trwałości podana jest z dniem i miesiącem (wtedy może go zastępować).</li>
              <li><strong>Weterynaryjny numer identyfikacyjny</strong> + oznaczenie „rolniczy handel detaliczny".</li>
            </ol>
            <div className="mt-5 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 flex gap-2">
              <Info className="h-5 w-5 shrink-0" />
              <div>
                <strong>Czego NIE musisz dawać:</strong> tabela wartości odżywczej jest przy RHD <strong>zwolniona</strong> (zał. V pkt 19),
                chyba że na etykiecie pojawi się oświadczenie żywieniowe lub zdrowotne. Ser z <strong>mleka surowego</strong> wymaga
                osobnej adnotacji „wyprodukowano z mleka surowego".
              </div>
            </div>
          </div>
        </section>

        {/* Wzór / przykład */}
        <section className="py-10 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Wzór etykiety (przykład)</h2>
            <p className="text-muted-foreground mb-5">Tak może wyglądać poprawna etykieta dojrzewającego sera w RHD (10 × 7 cm):</p>
            <div className="flex justify-center">
              <img
                src="/wzor-etykiety-rhd-na-ser.svg"
                alt="Wzór etykiety RHD na ser dojrzewający (gouda) — przykład z polami obowiązkowymi: nazwa, masa netto, producent i adres, data produkcji i przydatności, skład z wyróżnionym alergenem MLEKO, numer partii i weterynaryjny"
                width={500}
                height={350}
                loading="lazy"
                className="rounded-md border border-border shadow-card max-w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Edytor + live podgląd */}
        <section className="py-12 bg-gradient-to-b from-amber-50/60 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 border-y border-amber-100 dark:border-amber-900/30">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Generator etykiety</h2>
            <p className="text-muted-foreground mb-6">
              Wypełnij pola — podgląd po prawej aktualizuje się na żywo. Dane producenta możesz zapisać w przeglądarce
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
                    <input className={inputCls} value={d.nr_wet} onChange={(e) => set("nr_wet", e.target.value)} placeholder="Weterynaryjny nr identyfikacyjny" />
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
                  <label className={labelCls}>Alergeny (po przecinku — wyróżniane w składzie)</label>
                  <input className={inputCls} value={d.alergeny} onChange={(e) => set("alergeny", e.target.value)} placeholder="mleko" />
                </div>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={d.mleko_surowe} onChange={(e) => set("mleko_surowe", e.target.checked)} />
                  Ser z mleka surowego / niepasteryzowanego (dodaje wymaganą adnotację)
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
                wiedzę — tam pełną integrację z gospodarstwem i rejestrem RHD.
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
              { href: "/prawo/przewodnik.html", title: "Sprzedaż sera w RHD — przewodnik prawny", description: "Rejestracja, limity, oznakowanie miejsca sprzedaży" },
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
