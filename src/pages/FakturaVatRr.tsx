import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import SeeAlso from "@/components/SeeAlso";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Info, ExternalLink, Scale, Plus, Trash2, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import {
  STAWKA_ZRYCZALTOWANA_PROC,
  OSWIADCZENIE_ROLNIKA,
  formatGr,
  kwotaSlownie,
  walidujNip,
  policz,
  type PozycjaVatRr,
} from "@/lib/vatRr";

/**
 * Narzędzie: projekt faktury VAT RR (art. 116 ustawy o VAT) — klient-only.
 * Dane rolnika zapisywane w localStorage („wpisz raz"). Druk przez @media print.
 *
 * ŚWIADOMIE OKROJONE względem modułu w Fermly: jeden dokument, bez trwałej
 * numeracji, bez kasy i rejestru. To pomoc edukacyjna — NIE porada prawna.
 */

interface DaneVatRr {
  // Nabywca — to ON wystawia fakturę (czynny podatnik VAT)
  nabywca_nazwa: string;
  nabywca_adres: string;
  nabywca_nip: string;
  // Dostawca — rolnik ryczałtowy (użytkownik tej strony)
  rolnik_imie: string;
  rolnik_adres: string;
  rolnik_nip: string;
  rolnik_pesel: string;
  rolnik_dowod: string;
  rolnik_rachunek: string;
  // Dokument
  numer: string;
  data_wystawienia: string;
  data_nabycia: string;
  sposob_zaplaty: "przelew" | "gotowka";
}

const ROLNIK_KEY = "vat-rr-rolnik";

const today = () => new Date().toISOString().slice(0, 10);

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const p = iso.split("-");
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : iso;
};

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelCls = "block text-sm font-medium text-foreground mb-1";

/** Dokument A4 — używany i jako podgląd, i jako wydruk (Oryginał / Kopia). */
function InvoiceDoc({
  d,
  pozycje,
  egzemplarz,
}: {
  d: DaneVatRr;
  pozycje: PozycjaVatRr[];
  egzemplarz: "Oryginał" | "Kopia";
}) {
  const sum = policz(pozycje);
  const wypelnione = pozycje.filter((p) => p.nazwa.trim() !== "");

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "14mm 12mm",
        background: "#fff",
        color: "#111",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "10px",
        lineHeight: 1.4,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "17px", fontWeight: 700 }}>FAKTURA VAT RR</div>
          <div style={{ fontSize: "9px", color: "#555", marginTop: "2px" }}>
            Nabycie produktów rolnych od rolnika ryczałtowego — art. 116 ustawy o VAT
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, border: "1.5px solid #333", padding: "3px 10px" }}>
            {egzemplarz}
          </div>
          <div style={{ fontSize: "9px", marginTop: "4px" }}>
            Nr: <strong>{d.numer || "……………………"}</strong>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "2px solid #333", margin: "8px 0" }} />

      <table style={{ width: "100%", fontSize: "9.5px", marginBottom: "8px" }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", verticalAlign: "top", paddingRight: "6mm" }}>
              <div style={{ color: "#555", fontSize: "8.5px", letterSpacing: "0.04em" }}>NABYWCA (wystawca faktury)</div>
              <div style={{ fontWeight: 700, marginTop: "2px" }}>{d.nabywca_nazwa || "…………………………………………"}</div>
              <div style={{ whiteSpace: "pre-line" }}>{d.nabywca_adres || "…………………………………………"}</div>
              <div>NIP: {d.nabywca_nip || "……………………"}</div>
            </td>
            <td style={{ width: "50%", verticalAlign: "top" }}>
              <div style={{ color: "#555", fontSize: "8.5px", letterSpacing: "0.04em" }}>DOSTAWCA (rolnik ryczałtowy)</div>
              <div style={{ fontWeight: 700, marginTop: "2px" }}>{d.rolnik_imie || "…………………………………………"}</div>
              <div style={{ whiteSpace: "pre-line" }}>{d.rolnik_adres || "…………………………………………"}</div>
              <div>
                {d.rolnik_nip ? `NIP: ${d.rolnik_nip}` : d.rolnik_pesel ? `PESEL: ${d.rolnik_pesel}` : "NIP / PESEL: ……………………"}
              </div>
              {d.rolnik_dowod && <div style={{ fontSize: "9px" }}>Dok. tożsamości: {d.rolnik_dowod}</div>}
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", fontSize: "9.5px", marginBottom: "8px" }}>
        <tbody>
          <tr>
            <td>Data nabycia: <strong>{fmtDate(d.data_nabycia)}</strong></td>
            <td>Data wystawienia: <strong>{fmtDate(d.data_wystawienia)}</strong></td>
            <td>Zapłata: <strong>{d.sposob_zaplaty === "przelew" ? "przelew" : "gotówka"}</strong></td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ border: "1px solid #999", padding: "3px", width: "5%" }}>Lp.</th>
            <th style={{ border: "1px solid #999", padding: "3px", textAlign: "left" }}>Nazwa produktu rolnego</th>
            <th style={{ border: "1px solid #999", padding: "3px", width: "12%" }}>Klasa / jakość</th>
            <th style={{ border: "1px solid #999", padding: "3px", width: "8%" }}>J.m.</th>
            <th style={{ border: "1px solid #999", padding: "3px", width: "10%" }}>Ilość</th>
            <th style={{ border: "1px solid #999", padding: "3px", width: "14%" }}>Cena jedn. (bez zwrotu)</th>
            <th style={{ border: "1px solid #999", padding: "3px", width: "14%" }}>Wartość (bez zwrotu)</th>
          </tr>
        </thead>
        <tbody>
          {(wypelnione.length ? wypelnione : [{ nazwa: "", jednostka: "", ilosc: "", cenaNetto: "", klasa: "" }]).map((p, i) => {
            const wartosc = policz([p]).sumaNetto;
            return (
              <tr key={i}>
                <td style={{ border: "1px solid #999", padding: "3px", textAlign: "center" }}>{i + 1}</td>
                <td style={{ border: "1px solid #999", padding: "3px" }}>{p.nazwa || " "}</td>
                <td style={{ border: "1px solid #999", padding: "3px", textAlign: "center" }}>{p.klasa || "—"}</td>
                <td style={{ border: "1px solid #999", padding: "3px", textAlign: "center" }}>{p.jednostka || "—"}</td>
                <td style={{ border: "1px solid #999", padding: "3px", textAlign: "right" }}>{p.ilosc || "—"}</td>
                <td style={{ border: "1px solid #999", padding: "3px", textAlign: "right" }}>{p.cenaNetto ? formatGr(Math.round(Number(String(p.cenaNetto).replace(",", ".")) * 100)) : "—"}</td>
                <td style={{ border: "1px solid #999", padding: "3px", textAlign: "right" }}>{p.nazwa ? formatGr(wartosc) : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <table style={{ width: "62%", marginLeft: "auto", marginTop: "8px", borderCollapse: "collapse", fontSize: "9.5px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #999", padding: "4px" }}>Wartość nabytych produktów rolnych (bez zwrotu)</td>
            <td style={{ border: "1px solid #999", padding: "4px", textAlign: "right", width: "32%" }}>{formatGr(sum.sumaNetto)} zł</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #999", padding: "4px" }}>Stawka zryczałtowanego zwrotu podatku</td>
            <td style={{ border: "1px solid #999", padding: "4px", textAlign: "right" }}>{STAWKA_ZRYCZALTOWANA_PROC}%</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #999", padding: "4px" }}>Kwota zryczałtowanego zwrotu podatku</td>
            <td style={{ border: "1px solid #999", padding: "4px", textAlign: "right" }}>{formatGr(sum.zwrot)} zł</td>
          </tr>
          <tr style={{ background: "#f0f0f0", fontWeight: 700 }}>
            <td style={{ border: "1px solid #999", padding: "4px" }}>Należność ogółem</td>
            <td style={{ border: "1px solid #999", padding: "4px", textAlign: "right" }}>{formatGr(sum.ogolem)} zł</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: "6px", fontSize: "9.5px" }}>
        Słownie: <strong>{kwotaSlownie(sum.ogolem)}</strong>
      </div>

      {d.rolnik_rachunek && (
        <div style={{ marginTop: "4px", fontSize: "9.5px" }}>
          Rachunek bankowy dostawcy: <strong>{d.rolnik_rachunek}</strong>
        </div>
      )}
      <div style={{ marginTop: "3px", fontSize: "8.5px", color: "#555" }}>
        W tytule przelewu należy podać numer i datę niniejszej faktury (art. 116 ust. 6 pkt 2 ustawy o VAT).
      </div>

      <div style={{ marginTop: "10px", border: "1px solid #999", padding: "6px", fontSize: "9px", background: "#fafafa" }}>
        <div style={{ fontWeight: 700, marginBottom: "3px" }}>Oświadczenie dostawcy (art. 116 ust. 3 ustawy o VAT)</div>
        <div style={{ fontStyle: "italic" }}>{OSWIADCZENIE_ROLNIKA}</div>
      </div>

      <table style={{ width: "100%", marginTop: "16mm", fontSize: "9px" }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", textAlign: "center", paddingRight: "8mm" }}>
              <div style={{ borderTop: "1px solid #333", paddingTop: "3px" }}>
                Czytelny podpis dostawcy (rolnika ryczałtowego)
              </div>
            </td>
            <td style={{ width: "50%", textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #333", paddingTop: "3px" }}>
                Czytelny podpis nabywcy (wystawcy faktury)
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: "8mm", fontSize: "8px", color: "#777", borderTop: "1px solid #ddd", paddingTop: "4px" }}>
        Dokument przygotowany w generatorze mojaserowarnia.pl/faktura-vat-rr. Fakturę VAT RR wystawia nabywca —
        niniejszy wydruk jest projektem do uzupełnienia numeru i podpisów.
      </div>
    </div>
  );
}

const PUSTA_POZYCJA: PozycjaVatRr = { nazwa: "", jednostka: "kg", ilosc: "", cenaNetto: "", klasa: "" };

const FakturaVatRr = () => {
  const [d, setD] = useState<DaneVatRr>({
    nabywca_nazwa: "", nabywca_adres: "", nabywca_nip: "",
    rolnik_imie: "", rolnik_adres: "", rolnik_nip: "", rolnik_pesel: "", rolnik_dowod: "", rolnik_rachunek: "",
    numer: "", data_wystawienia: today(), data_nabycia: today(), sposob_zaplaty: "przelew",
  });
  const [pozycje, setPozycje] = useState<PozycjaVatRr[]>([
    { nazwa: "Ser dojrzewający typu gouda", jednostka: "kg", ilosc: "20", cenaNetto: "50", klasa: "" },
  ]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ROLNIK_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setD((s) => ({
          ...s,
          rolnik_imie: p.rolnik_imie ?? "",
          rolnik_adres: p.rolnik_adres ?? "",
          rolnik_nip: p.rolnik_nip ?? "",
          rolnik_pesel: p.rolnik_pesel ?? "",
          rolnik_dowod: p.rolnik_dowod ?? "",
          rolnik_rachunek: p.rolnik_rachunek ?? "",
        }));
      }
    } catch { /* ignore */ }
  }, []);

  const set = <K extends keyof DaneVatRr>(k: K, v: DaneVatRr[K]) => setD((s) => ({ ...s, [k]: v }));

  const setPoz = (i: number, k: keyof PozycjaVatRr, v: string) =>
    setPozycje((s) => s.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)));

  const saveRolnik = () => {
    try {
      localStorage.setItem(ROLNIK_KEY, JSON.stringify({
        rolnik_imie: d.rolnik_imie, rolnik_adres: d.rolnik_adres, rolnik_nip: d.rolnik_nip,
        rolnik_pesel: d.rolnik_pesel, rolnik_dowod: d.rolnik_dowod, rolnik_rachunek: d.rolnik_rachunek,
      }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* ignore */ }
  };

  const sum = useMemo(() => policz(pozycje), [pozycje]);
  const nipNabywcaZly = d.nabywca_nip.trim() !== "" && !walidujNip(d.nabywca_nip);
  const nipRolnikaZly = d.rolnik_nip.trim() !== "" && !walidujNip(d.rolnik_nip);

  return (
    <div className="min-h-screen bg-background">

      {/* CSS druku: na wydruku tylko dokument (Oryginał + Kopia na osobnych stronach) */}
      <style>{`
        @media screen { #vatrr-print { display: none; } }
        @media print {
          body * { visibility: hidden !important; }
          #vatrr-print, #vatrr-print * { visibility: visible !important; }
          #vatrr-print {
            position: absolute !important; top: 0; left: 0; width: 100%;
            display: block !important;
          }
          #vatrr-print > div { break-after: page; page-break-after: always; }
          #vatrr-print > div:last-child { break-after: auto; page-break-after: auto; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      <Navigation />
      <PageBreadcrumbs items={[{ label: "Narzędzia", href: "/narzedzia" }, { label: "Faktura VAT RR" }]} />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-6">
          <div className="max-w-4xl mx-auto">
            <PageHeader
              icon={FileText}
              color="violet"
              title="Faktura VAT RR — zasady i generator projektu"
              subtitle="Sprzedajesz ser do sklepu, restauracji lub hurtowni? Jako rolnik ryczałtowy masz prawo do dodatkowych 7% zryczałtowanego zwrotu podatku. Poniżej kto wystawia dokument, jakie pola są obowiązkowe i darmowy generator projektu faktury do druku."
            />
          </div>
        </div>

        {/* Kto wystawia — najczęstsze nieporozumienie */}
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">Kto wystawia fakturę VAT RR?</h2>
            <div className="rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/40 p-4 mb-4 flex gap-3">
              <Info className="h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" />
              <div className="text-sm text-violet-900 dark:text-violet-200">
                Fakturę VAT RR wystawia <strong>NABYWCA</strong> (sklep, restauracja, hurtownia — czynny podatnik VAT),
                a nie sprzedawca. To odwrotnie niż przy zwykłej fakturze.
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-3">
              W praktyce kupujący często <strong>nie wie o tym obowiązku</strong> — zwłaszcza mniejszy sklep czy lokalna
              restauracja, które pierwszy raz kupują od rolnika ryczałtowego. Dopuszczalne jest, że rolnik sam sporządzi
              druk, o ile nabywca udostępni formularz i zachowa kopię. Dlatego najskuteczniej jest
              <strong> przygotować gotowy projekt i wręczyć go kupującemu</strong> — do tego służy generator niżej.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Dokument sporządza się w <strong>dwóch egzemplarzach</strong> — oryginał trafia do rolnika, kopia zostaje
              u nabywcy.
            </p>
          </div>
        </section>

        {/* Kiedy przysługuje */}
        <section className="py-8 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">Kiedy przysługuje i ile wynosi</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li><strong>+{STAWKA_ZRYCZALTOWANA_PROC}% zryczałtowanego zwrotu</strong> doliczane do ceny netto. Nabywca płaci Ci więcej, a sobie tę kwotę odlicza. Przykład: 1000 zł netto → +70 zł → <strong>1070 zł</strong> do wypłaty.</li>
              <li><strong>Tylko B2B</strong> — sklep, restauracja, hurtownia będąca <strong>czynnym podatnikiem VAT</strong>. Przy sprzedaży konsumentowi lub firmie zwolnionej z VAT faktura VAT RR nie powstaje.</li>
              <li><strong>Przetworzony ser się liczy</strong> — art. 2 pkt 20 ustawy o VAT odsyła do art. 20 ust. 1c ustawy o PIT (czyli do RHD, produkty przetworzone nieprzemysłowo). W sieci krąży błędna informacja, że produkty przetworzone nie kwalifikują się — jest sprzeczna z ustawą.</li>
              <li><strong>Zapłata przelewem</strong> — gotówka wyklucza odliczenie po stronie nabywcy. W tytule przelewu musi być numer i data faktury.</li>
              <li><strong>Archiwizacja</strong> — dokument przechowuje się co najmniej 5 lat.</li>
            </ul>
          </div>
        </section>

        {/* Podstawa prawna */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" /> Podstawa prawna
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>art. 116 ust. 1</strong> ustawy o VAT — nabywca dokumentuje nabycie fakturą VAT RR (2 egzemplarze, oryginał dla dostawcy).</li>
              <li><strong>art. 116 ust. 2</strong> — katalog obowiązkowych pól faktury (odwzorowany w generatorze).</li>
              <li><strong>art. 116 ust. 3</strong> — oświadczenie rolnika ryczałtowego; bez niego nabywca nie może wystawić faktury.</li>
              <li><strong>art. 116 ust. 6</strong> — warunki odliczenia u nabywcy: zapłata na rachunek bankowy, numer i data faktury w tytule przelewu.</li>
              <li><strong>art. 43 ust. 1 pkt 3</strong> — zwolnienie rolnika ryczałtowego (przywoływane w oświadczeniu).</li>
              <li><strong>art. 2 pkt 20</strong> — definicja produktów rolnych (obejmuje przetworzone w ramach RHD).</li>
              <li><strong>KSeF</strong> — dla faktur VAT RR fakultatywny; wersja papierowa z podpisami obu stron pozostaje skuteczna.</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground/80 italic">
              ⚖️ Materiał edukacyjny — nie stanowi porady prawnej ani podatkowej. Stan prawny może się zmieniać;
              w razie wątpliwości skonsultuj się z biurem rachunkowym lub urzędem skarbowym.
            </p>
          </div>
        </section>

        {/* GENERATOR */}
        <section className="py-12 bg-gradient-to-b from-violet-50/60 to-purple-50/40 dark:from-violet-950/20 dark:to-purple-950/10 border-y border-violet-100 dark:border-violet-900/30">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Generator projektu faktury VAT RR</h2>
            <p className="text-muted-foreground mb-6">
              Wypełnij pola — podgląd po prawej aktualizuje się na żywo, a 7% dolicza się automatycznie.
              Dane swojego gospodarstwa możesz zapisać w przeglądarce (wpisujesz raz). <strong>Nic nie wysyłamy na serwer.</strong>
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formularz */}
              <div className="space-y-5">
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">Twoje dane (dostawca — rolnik ryczałtowy)</span>
                    <button onClick={saveRolnik} className="text-xs text-primary hover:underline">
                      {saved ? "✓ zapisano" : "zapisz w przeglądarce"}
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input className={inputCls} value={d.rolnik_imie} onChange={(e) => set("rolnik_imie", e.target.value)} placeholder="Imię i nazwisko *" />
                    <textarea className={inputCls} rows={2} value={d.rolnik_adres} onChange={(e) => set("rolnik_adres", e.target.value)} placeholder="Adres gospodarstwa *" />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input className={inputCls} value={d.rolnik_nip} onChange={(e) => set("rolnik_nip", e.target.value)} placeholder="NIP" />
                        {nipRolnikaZly && <p className="text-xs text-red-600 mt-1">⚠️ Niepoprawna suma kontrolna NIP</p>}
                      </div>
                      <input className={inputCls} value={d.rolnik_pesel} onChange={(e) => set("rolnik_pesel", e.target.value)} placeholder="albo PESEL" />
                    </div>
                    <input className={inputCls} value={d.rolnik_dowod} onChange={(e) => set("rolnik_dowod", e.target.value)} placeholder="Dowód osobisty: seria/nr, data i organ wydający" />
                    <input className={inputCls} value={d.rolnik_rachunek} onChange={(e) => set("rolnik_rachunek", e.target.value)} placeholder="Numer rachunku bankowego" />
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <span className="text-sm font-semibold text-foreground block mb-2">Nabywca (wystawca faktury — czynny VAT)</span>
                  <div className="space-y-3">
                    <input className={inputCls} value={d.nabywca_nazwa} onChange={(e) => set("nabywca_nazwa", e.target.value)} placeholder="Nazwa firmy *" />
                    <textarea className={inputCls} rows={2} value={d.nabywca_adres} onChange={(e) => set("nabywca_adres", e.target.value)} placeholder="Adres *" />
                    <input className={inputCls} value={d.nabywca_nip} onChange={(e) => set("nabywca_nip", e.target.value)} placeholder="NIP *" />
                    {nipNabywcaZly && <p className="text-xs text-red-600">⚠️ Niepoprawna suma kontrolna NIP</p>}
                  </div>
                </div>

                <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Numer faktury</label>
                    <input className={inputCls} value={d.numer} onChange={(e) => set("numer", e.target.value)} placeholder="nadaje nabywca" />
                  </div>
                  <div>
                    <label className={labelCls}>Sposób zapłaty</label>
                    <select className={inputCls} value={d.sposob_zaplaty} onChange={(e) => set("sposob_zaplaty", e.target.value as DaneVatRr["sposob_zaplaty"])}>
                      <option value="przelew">Przelew</option>
                      <option value="gotowka">Gotówka</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Data nabycia</label>
                    <input type="date" className={inputCls} value={d.data_nabycia} onChange={(e) => set("data_nabycia", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Data wystawienia</label>
                    <input type="date" className={inputCls} value={d.data_wystawienia} onChange={(e) => set("data_wystawienia", e.target.value)} />
                  </div>
                </div>

                {d.sposob_zaplaty === "gotowka" && (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3 text-sm text-amber-900 dark:text-amber-200 flex gap-2">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                      Przy zapłacie <strong>gotówką</strong> nabywca traci prawo do odliczenia zryczałtowanego zwrotu
                      (art. 116 ust. 6). W praktyce kupujący prawie zawsze będzie chciał przelewu.
                    </div>
                  </div>
                )}

                {/* Pozycje */}
                <div className="border-t border-border pt-4">
                  <span className="text-sm font-semibold text-foreground block mb-2">Produkty rolne</span>
                  <div className="space-y-3">
                    {pozycje.map((p, i) => (
                      <div key={i} className="rounded-lg border border-border p-3 space-y-2 bg-background/60">
                        <div className="flex gap-2">
                          <input className={inputCls} value={p.nazwa} onChange={(e) => setPoz(i, "nazwa", e.target.value)} placeholder="Nazwa produktu *" />
                          {pozycje.length > 1 && (
                            <button
                              onClick={() => setPozycje((s) => s.filter((_, idx) => idx !== i))}
                              className="shrink-0 rounded-md border border-border px-2 text-muted-foreground hover:text-red-600 hover:border-red-300"
                              aria-label={`Usuń pozycję ${i + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <input className={inputCls} value={p.jednostka} onChange={(e) => setPoz(i, "jednostka", e.target.value)} placeholder="j.m." />
                          <input className={inputCls} value={p.ilosc} onChange={(e) => setPoz(i, "ilosc", e.target.value)} placeholder="ilość" inputMode="decimal" />
                          <input className={inputCls} value={p.cenaNetto} onChange={(e) => setPoz(i, "cenaNetto", e.target.value)} placeholder="cena" inputMode="decimal" />
                          <input className={inputCls} value={p.klasa} onChange={(e) => setPoz(i, "klasa", e.target.value)} placeholder="klasa" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setPozycje((s) => [...s, { ...PUSTA_POZYCJA }])}
                    className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Plus className="h-4 w-4" /> Dodaj pozycję
                  </button>
                </div>

                {/* Podsumowanie na ekranie */}
                <div className="rounded-lg border border-violet-200 dark:border-violet-900/40 bg-violet-50/60 dark:bg-violet-950/20 p-4 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Wartość netto</span><strong>{formatGr(sum.sumaNetto)} zł</strong></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Zryczałtowany zwrot {STAWKA_ZRYCZALTOWANA_PROC}%</span><strong className="text-violet-700 dark:text-violet-300">+{formatGr(sum.zwrot)} zł</strong></div>
                  <div className="flex justify-between border-t border-violet-200 dark:border-violet-900/40 pt-1 text-base"><span className="font-semibold">Do wypłaty</span><strong>{formatGr(sum.ogolem)} zł</strong></div>
                  <div className="text-xs text-muted-foreground pt-1">Słownie: {kwotaSlownie(sum.ogolem)}</div>
                </div>
              </div>

              {/* Podgląd + druk */}
              <div className="lg:sticky lg:top-24 self-start">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">Podgląd dokumentu</span>
                  <Button onClick={() => window.print()} className="gap-2">
                    <Printer className="h-4 w-4" /> Drukuj / PDF
                  </Button>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto">
                  <div style={{ transform: "scale(0.62)", transformOrigin: "top left", width: "210mm", height: "184mm" }}>
                    <InvoiceDoc d={d} pozycje={pozycje} egzemplarz="Oryginał" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Wydruk daje <strong>2 strony A4</strong>: „Oryginał" (dla Ciebie) i „Kopia" (dla nabywcy).
                  W oknie drukowania ustaw A4 i marginesy „brak/minimalne", albo „Zapisz jako PDF".
                </p>
              </div>
            </div>

            <p className="mt-8 text-xs text-muted-foreground/80 italic border-t border-border pt-4">
              ⚖️ Generator jest pomocą techniczną/edukacyjną. Numer faktury nadaje nabywca; odpowiedzialność za
              poprawność dokumentu i rozliczenie spoczywa na stronach transakcji.
            </p>
          </div>
        </section>

        {/* Arkusz do druku: Oryginał + Kopia */}
        <div id="vatrr-print">
          <InvoiceDoc d={d} pozycje={pozycje} egzemplarz="Oryginał" />
          <InvoiceDoc d={d} pozycje={pozycje} egzemplarz="Kopia" />
        </div>

        {/* CTA Fermly — pełna wersja */}
        <section className="py-10 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-2">
                Wystawiasz takie faktury regularnie? Potrzebujesz pełnej wersji
              </h2>
              <p className="text-muted-foreground mb-3">
                Generator powyżej celowo obsługuje <strong>jeden dokument naraz</strong> — nie prowadzi numeracji ani
                historii. Jeśli sprzedajesz do firm regularnie, w aplikacji <strong>Fermly</strong> faktura VAT RR jest
                pełnym modułem:
              </p>
              <ul className="text-sm text-muted-foreground mb-4 space-y-1 ml-5 list-disc">
                <li><strong>wspólna roczna numeracja</strong> z pozostałymi dokumentami RHD (bez ręcznego pilnowania),</li>
                <li><strong>historia wystawionych faktur</strong> i anulowanie dokumentu zamiast usuwania,</li>
                <li><strong>powiązanie z kasą</strong> — przychód księguje się po opłaceniu,</li>
                <li><strong>lista stałych odbiorców</strong> i podpowiadanie pozycji z katalogu produktów,</li>
                <li>dane dostawcy pobierane z ustawień gospodarstwa.</li>
              </ul>
              <Button asChild className="gap-2">
                <a href="https://www.fermly.pl/vat-rr/nowa" target="_blank" rel="noopener noreferrer">
                  Zobacz pełny moduł VAT RR w Fermly <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <SeeAlso links={[
              { href: "/prawo/rhd", title: "Rolniczy handel detaliczny (RHD)", description: "Limity, rejestracja i zasady sprzedaży sera" },
              { href: "/etykieta-rhd", title: "Etykieta RHD na ser", description: "Wymagania znakowania + darmowy generator" },
              { href: "/kalkulator-kosztu-sera", title: "Kalkulator kosztu sera", description: "Koszt produkcji, marża i cena sprzedaży" },
              { href: "/narzedzia", title: "Wszystkie narzędzia", description: "Kalkulatory i generatory dla serowara" },
            ]} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FakturaVatRr;
