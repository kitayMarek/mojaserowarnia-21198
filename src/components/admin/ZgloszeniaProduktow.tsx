/**
 * Zgłoszenia produktów z kalkulatora pasz (od 25.10.2026), część /admin/skladniki.
 *
 * Zgłoszenie niczego samo nie dodaje. Produkt wpisuje się w repozytorium Mojej Paszy
 * (C:/Moje/MojaPasza, src/data/dodatkiPaszowe.ts)
 * (skład sprawdzony u źródła, oferta ze sklepem, ceną i datą), potem seed
 * (node scripts/gen-dodatki-seed-sql.mts, SQL w edytorze Supabase). Tutaj tylko:
 * przejrzeć link albo zdjęcie, zapisać notatkę i ustawić status.
 *
 * Notatkę widzi też zgłaszający („Twoje zgłoszenia” w formularzu), więc pisze się ją jak
 * odpowiedź. Zdjęcie znika przy rozpatrzeniu (nota prywatności), a sieroty po usuniętych
 * kontach panel kasuje przy otwarciu (funkcja zgloszenia_zdjecia_bez_wpisu).
 * Kolejność listy: od najstarszego, bez względu na to, kto zgłasza.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { KUBELEK_ZGLOSZEN, type KtoZglasza, type StatusZgloszenia } from "@/components/admin/paszeAdmin";
import { cn } from "@/lib/utils";
import { Check, Copy, ExternalLink, Loader2, RotateCcw, Trash2, X } from "lucide-react";

interface Zgloszenie {
  id: string;
  created_at: string;
  nazwa: string;
  sklep: string | null;
  url: string | null;
  zdjecie: string | null;
  cena_zl: number | null;
  opakowanie_kg: number | null;
  poprawka_do: string | null;
  kto: KtoZglasza | null;
  uwagi: string | null;
  email: string | null;
  status: StatusZgloszenia;
  notatka: string | null;
  rozpatrzono: string | null;
  stary_wpis_id: string | null;
}

/** Składnik z bazy (feed_ingredients, zatwierdzony): do podpowiedzi „podobne” i starych wpisów. */
export interface SkladnikBazy {
  id: string;
  nazwa: string;
  source: string;
}

const STATUSY: Array<{ s: StatusZgloszenia; etykieta: string }> = [
  { s: "nowe", etykieta: "Nowe" },
  { s: "dodane", etykieta: "Dodane" },
  { s: "duplikat", etykieta: "Duplikat" },
  { s: "odrzucone", etykieta: "Odrzucone" },
];

const KTO: Record<KtoZglasza, string> = { hodowca: "hodowca", sklep: "sklep", producent: "producent", inny: "inna osoba" };

const liczba = (n: number, miejsca = 2) => n.toFixed(miejsca).replace(".", ",");
const data = (iso: string) => new Date(iso).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });

const OGONKI: Record<string, string> = { ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" };
// Słowa, które nic nie mówią o produkcie: bez nich „Dolmix DN RE” nie jest „podobny” do każdej kredy dla kur.
const NIEZNACZACE = new Set(["dla", "kur", "kg", "worek", "bez", "pasza", "paszowy", "paszowa", "mieszanka", "mineralna", "mineralny", "dodatek", "marki"]);
const slowa = (t: string) =>
  t.toLowerCase().replace(/[ąćęłńóśźż]/g, (z) => OGONKI[z] ?? z).split(/[^a-z0-9]+/).filter((w) => w.length >= 2 && !NIEZNACZACE.has(w));

/** Do trzech składników z bazy, które dzielą ze zgłoszeniem znaczące słowo (np. markę „dolmix”). */
function podobneWBazie(nazwa: string, baza: SkladnikBazy[]): SkladnikBazy[] {
  const szukane = new Set(slowa(nazwa));
  return baza
    .map((s) => {
      const wspolne = slowa(s.nazwa).filter((w) => szukane.has(w));
      return { s, wynik: wspolne.length, znaczace: wspolne.some((w) => w.length >= 4) };
    })
    .filter((x) => x.znaczace)
    .sort((a, b) => b.wynik - a.wynik)
    .slice(0, 3)
    .map((x) => x.s);
}

const ZRODLO: Record<string, string> = { baza: "surowiec", dodatek: "baza dodatków", user: "stare zgłoszenie" };

export default function ZgloszeniaProduktow({ baza, onZmianaBazy }: { baza: SkladnikBazy[]; onZmianaBazy: () => void }) {
  const [lista, setLista] = useState<Zgloszenie[]>([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [brakTabeli, setBrakTabeli] = useState(false);
  const [filtr, setFiltr] = useState<StatusZgloszenia>("nowe");
  const [zdjecia, setZdjecia] = useState<Record<string, string>>({});
  const [notatki, setNotatki] = useState<Record<string, string>>({});
  const [zajete, setZajete] = useState<string | null>(null);

  const wczytaj = useCallback(async () => {
    setLadowanie(true);
    const { data: wiersze, error } = await (supabase as any)
      .from("feed_submissions").select("*").order("created_at", { ascending: true });
    if (error) {
      // Przed migracją 20261025140000 tabeli nie ma: mówimy to wprost zamiast pustej listy.
      setBrakTabeli(true);
      setLadowanie(false);
      return;
    }
    const rows = (wiersze as Zgloszenie[]) ?? [];
    setLista(rows);
    setNotatki(Object.fromEntries(rows.map((z) => [z.id, z.notatka ?? ""])));
    // Pliki są tylko przy nowych: przy rozpatrzeniu panel je kasuje.
    const sciezki = rows.filter((z) => z.status === "nowe").map((z) => z.zdjecie).filter((s): s is string => !!s);
    if (sciezki.length) {
      const { data: linki } = await supabase.storage.from(KUBELEK_ZGLOSZEN).createSignedUrls(sciezki, 3600);
      setZdjecia(Object.fromEntries((linki ?? []).filter((l) => l.signedUrl && l.path).map((l) => [l.path!, l.signedUrl])));
    }
    setLadowanie(false);
  }, []);

  useEffect(() => {
    wczytaj();
    // Zdjęcia bez zgłoszenia (usunięte konto, nieudany zapis): kasujemy po cichu przez API.
    (async () => {
      const { data: sieroty, error } = await (supabase as any).rpc("zgloszenia_zdjecia_bez_wpisu");
      if (!error && Array.isArray(sieroty) && sieroty.length) {
        await supabase.storage.from(KUBELEK_ZGLOSZEN).remove(sieroty as string[]);
      }
    })();
  }, [wczytaj]);

  const liczby = useMemo(() => {
    const l: Record<StatusZgloszenia, number> = { nowe: 0, dodane: 0, duplikat: 0, odrzucone: 0 };
    for (const z of lista) l[z.status]++;
    return l;
  }, [lista]);
  const widoczne = useMemo(() => {
    const w = lista.filter((z) => z.status === filtr);
    // Nowe od najstarszego (kolejka), rozpatrzone od ostatnio rozpatrzonych.
    return filtr === "nowe" ? w : [...w].sort((a, b) => ((b.rozpatrzono ?? "") > (a.rozpatrzono ?? "") ? 1 : -1));
  }, [lista, filtr]);
  const idBazy = useMemo(() => new Set(baza.map((s) => s.id)), [baza]);
  const nazwyBazy = useMemo(() => new Set(baza.map((s) => s.nazwa)), [baza]);

  const ustawStatus = async (z: Zgloszenie, status: StatusZgloszenia) => {
    const rozpatrzone = status !== "nowe";
    if (rozpatrzone && z.zdjecie && !window.confirm("Po zmianie statusu zdjęcie etykiety zostanie usunięte (tak mówi nota prywatności). Jeśli skład jeszcze nie jest przepisany, najpierw go przepisz. Kontynuować?")) return;
    setZajete(z.id);
    // Ścieżka zdjęcia zostaje w wierszu (warunek tabeli: zgłoszenie miało link albo zdjęcie),
    // kasujemy sam plik, i to dopiero po udanym zapisie statusu.
    const zmiana = {
      status,
      notatka: (notatki[z.id] ?? "").trim() || null,
      rozpatrzono: rozpatrzone ? new Date().toISOString() : null,
    };
    const { error } = await (supabase as any).from("feed_submissions").update(zmiana).eq("id", z.id);
    if (!error && rozpatrzone && z.zdjecie) {
      // Błąd usuwania nie cofa statusu: plik bez nowego zgłoszenia wyłapie sprzątanie przy kolejnym otwarciu.
      await supabase.storage.from(KUBELEK_ZGLOSZEN).remove([z.zdjecie]);
    }
    setZajete(null);
    if (error) { toast({ title: "Błąd", description: error.message, variant: "destructive" }); return; }
    setLista((l) => l.map((x) => (x.id === z.id ? { ...x, ...zmiana } : x)));
    toast({ title: `Status: ${STATUSY.find((s) => s.s === status)!.etykieta.toLowerCase()}` });
  };

  const zapiszNotatke = async (z: Zgloszenie) => {
    setZajete(z.id);
    const notatka = (notatki[z.id] ?? "").trim() || null;
    const { error } = await (supabase as any).from("feed_submissions").update({ notatka }).eq("id", z.id);
    setZajete(null);
    if (error) { toast({ title: "Błąd", description: error.message, variant: "destructive" }); return; }
    setLista((l) => l.map((x) => (x.id === z.id ? { ...x, notatka } : x)));
    toast({ title: "Notatka zapisana" });
  };

  const usunStaryWpis = async (z: Zgloszenie) => {
    if (!z.stary_wpis_id) return;
    if (!window.confirm(`Usunąć stary składnik „${z.nazwa}” z kalkulatora? Zniknie z listy dla wszystkich. Zapisane mieszanki zachowają jego liczby.`)) return;
    setZajete(z.id);
    const { error } = await (supabase as any).from("feed_ingredients").delete().eq("id", z.stary_wpis_id);
    setZajete(null);
    if (error) { toast({ title: "Błąd", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Stary składnik usunięty z kalkulatora" });
    onZmianaBazy();
  };

  // Tekst do wklejenia w sesji Claude: produkt dopisuje się w pliku danych, nie w panelu.
  const kopiujDlaClaude = async (z: Zgloszenie) => {
    let linkZdjecia: string | null = null;
    if (z.zdjecie && z.status === "nowe") {
      const { data: l } = await supabase.storage.from(KUBELEK_ZGLOSZEN).createSignedUrl(z.zdjecie, 86400);
      linkZdjecia = l?.signedUrl ?? null;
    }
    const tekst = [
      `Zgłoszenie produktu do bazy dodatków paszowych (mojaserowarnia.pl, /admin/skladniki, zgłoszenie ${z.id}).`,
      `Produkt: ${z.nazwa}`,
      z.poprawka_do ? `Poprawka do produktu z bazy: ${z.poprawka_do}` : "Nowy produkt (nie poprawka).",
      `Sklep albo producent: ${z.sklep ?? "nie podano"}`,
      z.url && `Karta produktu: ${z.url}`,
      linkZdjecia && `Zdjęcie etykiety (link ważny 24 godziny): ${linkZdjecia}`,
      z.cena_zl != null && `Cena podana przez zgłaszającego: ${liczba(z.cena_zl)} zł${z.opakowanie_kg != null ? ` za ${liczba(z.opakowanie_kg, 1)} kg` : ""}`,
      z.kto && `Zgłasza: ${KTO[z.kto]}`,
      z.uwagi && `Uwagi: ${z.uwagi}`,
      "",
      "Sprawdź skład u źródła (etykieta, karta producenta) i cenę na stronie sklepu. Jeśli się zgadza, dopisz albo popraw produkt w repozytorium Mojej Paszy, w src/data/dodatkiPaszowe.ts (oferta ze sklepem, ceną i datą sprawdzenia), przegeneruj seed (node scripts/gen-dodatki-seed-sql.mts) i uruchom node scripts/test-dodatki-paszowe.mts. Kolejność ofert tylko po składzie i cenie.",
    ].filter((w): w is string => typeof w === "string").join("\n"); // pusty wiersz zostaje jako odstęp
    try {
      await navigator.clipboard.writeText(tekst);
      toast({ title: "Skopiowano", description: z.zdjecie ? "Link do zdjęcia działa 24 godziny." : undefined });
    } catch {
      toast({ title: "Nie udało się skopiować", description: "Przeglądarka nie dała dostępu do schowka.", variant: "destructive" });
    }
  };

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mt-4 mb-1">Zgłoszenia produktów</h2>
      <p className="text-sm text-muted-foreground mb-3">
        Z formularza „Zgłoś produkt albo poprawkę”. Nic stąd nie trafia do kalkulatora samo: produkt dopisuje się w pliku
        danych i wgrywa seedem („Skopiuj dla Claude” daje gotowe zlecenie). Notatkę widzi też zgłaszający.
      </p>

      {brakTabeli ? (
        <p className="rounded-md border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
          Brak tabeli zgłoszeń. Uruchom w Supabase migrację <code>20261025140000_zgloszenia_produktow.sql</code>.
        </p>
      ) : ladowanie ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Wczytywanie…</div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Status zgłoszeń">
            {STATUSY.map(({ s, etykieta }) => (
              <button key={s} type="button" role="tab" aria-selected={filtr === s} onClick={() => setFiltr(s)}
                className={cn("min-h-10 rounded-full border px-3.5 text-sm",
                  filtr === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary")}>
                {etykieta} ({liczby[s]})
              </button>
            ))}
          </div>

          {widoczne.length === 0 ? (
            <p className="text-muted-foreground">{filtr === "nowe" ? "Brak nowych zgłoszeń." : "Nic w tej grupie."}</p>
          ) : (
            <div className="space-y-4">
              {widoczne.map((z) => {
                // Stare zgłoszenie samo siebie nie podpowiada: jego składnik ma tę samą nazwę.
                const podobne = podobneWBazie(z.nazwa, baza.filter((s) => s.id !== z.stary_wpis_id));
                const krotkiLink = z.url?.replace(/^https?:\/\//, "") ?? "";
                const staryJest = !!z.stary_wpis_id && idBazy.has(z.stary_wpis_id);
                return (
                  <article key={z.id} className="rounded-lg border border-border bg-card p-4 text-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="text-base font-semibold text-foreground">{z.nazwa}</h3>
                      <span className="text-xs text-muted-foreground">
                        {data(z.created_at)}{z.kto && ` · ${KTO[z.kto]}`}{z.rozpatrzono && ` · rozpatrzone ${data(z.rozpatrzono)}`}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {z.poprawka_do && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          poprawka do: {z.poprawka_do}{!nazwyBazy.has(z.poprawka_do) && " (już nie ma w bazie)"}
                        </span>
                      )}
                      {z.stary_wpis_id && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          ze starego formularza{staryJest ? ", wciąż w kalkulatorze" : ""}
                        </span>
                      )}
                    </div>

                    <dl className="mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
                      <dt className="text-muted-foreground">Sklep / producent</dt>
                      <dd>{z.sklep ?? "nie podano"}</dd>
                      {z.url && (
                        <>
                          <dt className="text-muted-foreground">Karta produktu</dt>
                          <dd className="min-w-0 break-all">
                            <a href={z.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-primary hover:underline">
                              {krotkiLink.slice(0, 80)}{krotkiLink.length > 80 && "…"} <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </dd>
                        </>
                      )}
                      {z.cena_zl != null && (
                        <>
                          <dt className="text-muted-foreground">Cena od zgłaszającego</dt>
                          <dd>
                            {liczba(z.cena_zl)} zł{z.opakowanie_kg != null && ` za ${liczba(z.opakowanie_kg, 1)} kg (${liczba(z.cena_zl / z.opakowanie_kg)} zł/kg)`}
                          </dd>
                        </>
                      )}
                      {z.email && (
                        <>
                          <dt className="text-muted-foreground">Odpowiedź na</dt>
                          <dd className="break-all"><a href={`mailto:${z.email}`} className="text-primary hover:underline">{z.email}</a></dd>
                        </>
                      )}
                      {podobne.length > 0 && (
                        <>
                          <dt className="text-muted-foreground">Podobne w bazie</dt>
                          <dd>{podobne.map((p) => `${p.nazwa} (${ZRODLO[p.source] ?? p.source})`).join(" · ")}</dd>
                        </>
                      )}
                    </dl>

                    {z.uwagi && <p className="mt-2 whitespace-pre-line rounded-md bg-muted/50 p-2.5">{z.uwagi}</p>}

                    {z.zdjecie && z.status !== "nowe" && (
                      <p className="mt-3 text-xs text-muted-foreground">Zdjęcie etykiety usunięte po rozpatrzeniu.</p>
                    )}
                    {z.zdjecie && z.status === "nowe" && (
                      zdjecia[z.zdjecie] ? (
                        <a href={zdjecia[z.zdjecie]} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block" title="Otwórz zdjęcie w pełnym rozmiarze">
                          <img src={zdjecia[z.zdjecie]} alt={`Etykieta: ${z.nazwa}`} className="max-h-64 rounded-md border border-border" />
                        </a>
                      ) : (
                        <p className="mt-3 text-xs text-muted-foreground">Nie ma podglądu zdjęcia: odśwież stronę. Jeśli zgłoszenie wróciło do nowych, plik skasowano przy wcześniejszym rozpatrzeniu.</p>
                      )
                    )}

                    <label className="mt-3 block text-xs font-semibold text-muted-foreground">
                      Notatka (widzi ją też zgłaszający)
                      <textarea value={notatki[z.id] ?? ""} onChange={(e) => setNotatki((n) => ({ ...n, [z.id]: e.target.value }))}
                        rows={2} maxLength={4000} placeholder="np. Dodane jako Dolmix DN RE (Dolfos), cena ze sklepu z 25.10."
                        className="mt-1 w-full rounded border border-input bg-background p-2 text-sm font-normal text-foreground" />
                    </label>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {z.status === "nowe" ? (
                        <>
                          <button onClick={() => ustawStatus(z, "dodane")} disabled={zajete === z.id} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700 disabled:opacity-50"><Check className="h-4 w-4" /> Dodane</button>
                          <button onClick={() => ustawStatus(z, "duplikat")} disabled={zajete === z.id} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 hover:bg-muted disabled:opacity-50">Duplikat</button>
                          <button onClick={() => ustawStatus(z, "odrzucone")} disabled={zajete === z.id} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 hover:bg-muted disabled:opacity-50"><X className="h-4 w-4" /> Odrzuć</button>
                        </>
                      ) : (
                        <button onClick={() => ustawStatus(z, "nowe")} disabled={zajete === z.id} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 hover:bg-muted disabled:opacity-50"><RotateCcw className="h-4 w-4" /> Wróć do nowych</button>
                      )}
                      <button onClick={() => zapiszNotatke(z)} disabled={zajete === z.id || (notatki[z.id] ?? "") === (z.notatka ?? "")} className="rounded-lg border border-border px-3 py-2 hover:bg-muted disabled:opacity-50">Zapisz notatkę</button>
                      <button onClick={() => kopiujDlaClaude(z)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 hover:bg-muted"><Copy className="h-4 w-4" /> Skopiuj dla Claude</button>
                      {staryJest && (
                        <button onClick={() => usunStaryWpis(z)} disabled={zajete === z.id} className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-2 text-destructive hover:bg-destructive/10 disabled:opacity-50"><Trash2 className="h-4 w-4" /> Usuń stary składnik z kalkulatora</button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
