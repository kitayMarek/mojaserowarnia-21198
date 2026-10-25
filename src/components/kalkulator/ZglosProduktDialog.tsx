/**
 * „Zgłoś produkt albo poprawkę” (od 25.10.2026, zamiast „Zaproponuj składnik”).
 *
 * Zasada Marka: zgłaszający podaje sklep i kartę produktu (link) albo zdjęcie etykiety,
 * a produkt do bazy wpisujemy my, po sprawdzeniu, w src/data/dodatkiPaszowe.ts i seedem.
 * Dlatego tu nie ma pól na liczby składu, a zgłoszenie idzie do osobnej tabeli
 * feed_submissions (migracja 20261025140000), z której nic nie trafia do kalkulatora samo.
 * Wcześniej zatwierdzone zgłoszenie stawało się osobnym składnikiem bez sklepu i ceny,
 * którego czaty nie widziały, i dublowało produkty z bazy.
 *
 * Zdjęcie przechodzi przez przygotujZdjecieZInfo (src/lib/image.ts): zmniejszenie
 * i usunięcie EXIF z GPS. Kubełek zgloszenia-paszowe jest prywatny: widzi autor i admin.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { przygotujZdjecieZInfo, rozmiarPliku } from "@/lib/image";
import { cn } from "@/lib/utils";
import { ADRES_LOGOWANIA_Z_KALKULATORA } from "@/components/kalkulator/ZapisaneReceptury";

export const KUBELEK_ZGLOSZEN = "zgloszenia-paszowe";

export type KtoZglasza = "hodowca" | "sklep" | "producent" | "inny";
export type StatusZgloszenia = "nowe" | "dodane" | "duplikat" | "odrzucone";

const KTO: Array<{ k: KtoZglasza; etykieta: string }> = [
  { k: "hodowca", etykieta: "Hodowca" },
  { k: "sklep", etykieta: "Sklep" },
  { k: "producent", etykieta: "Producent" },
  { k: "inny", etykieta: "Inna osoba" },
];

/** Status słowami dla autora (panel admina ma własne, krótsze). */
const STATUS_DLA_AUTORA: Record<StatusZgloszenia, string> = {
  nowe: "czeka na sprawdzenie",
  dodane: "dodane do bazy",
  duplikat: "już było w bazie",
  odrzucone: "nie dodaliśmy",
};

interface MojeZgloszenie {
  id: string;
  nazwa: string;
  status: StatusZgloszenia;
  created_at: string;
  poprawka_do: string | null;
  notatka: string | null;
}

interface Zdjecie {
  blob: Blob;
  podglad: string;
  opis: string;
}

/** „12,5” i „12.5” jako liczba; puste albo błędne = null. */
const liczba = (t: string): number | null => {
  const n = parseFloat(t.replace(",", ".").replace(/\s/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Link bez „https://” (np. „www.sklep.pl/…”) dostaje go z przodu; inne napisy zostają jak są. */
const poprawLink = (t: string) => {
  const s = t.trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : /^[\w-]+(\.[\w-]+)+/.test(s) ? `https://${s}` : s;
};

const POPRAWNY_LINK = /^https?:\/\/\S+$/i;
const POPRAWNY_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const dataPL = (iso: string) => new Date(iso).toLocaleDateString("pl-PL", { day: "numeric", month: "long" });

const klasaPola =
  "mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export default function ZglosProduktDialog({
  otwarty, onZamknij, produkty, poprawkaDo = null, nazwaStartowa = "",
}: {
  otwarty: boolean;
  onZamknij: () => void;
  /** Nazwy produktów i surowców z bazy, do pola „poprawka do”. */
  produkty: string[];
  /** Otwarte z karty produktu: od razu „poprawka do” tego produktu. */
  poprawkaDo?: string | null;
  /** Otwarte z własnego składnika: jego nazwa jako nazwa produktu. */
  nazwaStartowa?: string;
}) {
  const { user } = useAuth();
  const [nazwa, setNazwa] = useState("");
  const [sklep, setSklep] = useState("");
  const [link, setLink] = useState("");
  const [zdjecie, setZdjecie] = useState<Zdjecie | null>(null);
  const [przygotowuje, setPrzygotowuje] = useState(false);
  const [cena, setCena] = useState("");
  const [opakowanie, setOpakowanie] = useState("");
  const [poprawka, setPoprawka] = useState("");
  const [kto, setKto] = useState<KtoZglasza | null>(null);
  const [uwagi, setUwagi] = useState("");
  const [email, setEmail] = useState("");
  const [wysylanie, setWysylanie] = useState(false);
  const [blad, setBlad] = useState<string | null>(null);
  const [wyslane, setWyslane] = useState(false);
  const [moje, setMoje] = useState<MojeZgloszenie[]>([]);

  const wczytajMoje = useCallback(async () => {
    if (!user) return;
    const { data, error } = await (supabase as any)
      .from("feed_submissions")
      .select("id, nazwa, status, created_at, poprawka_do, notatka")
      .eq("submitted_by", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    // Przed migracją tabeli nie ma: wtedy po prostu bez listy.
    if (!error) setMoje((data as MojeZgloszenie[]) ?? []);
  }, [user]);

  // Każde otwarcie zaczyna od czystego formularza (z ewentualnym produktem z karty).
  useEffect(() => {
    if (!otwarty) return;
    setNazwa(poprawkaDo ?? nazwaStartowa);
    setPoprawka(poprawkaDo ?? "");
    setSklep(""); setLink(""); setCena(""); setOpakowanie(""); setKto(null); setUwagi(""); setEmail("");
    setZdjecie(null); setBlad(null); setWyslane(false);
    wczytajMoje();
  }, [otwarty, poprawkaDo, nazwaStartowa, wczytajMoje]);

  // Podgląd zdjęcia to adres w pamięci przeglądarki: zwalniamy go przy zmianie i zamknięciu.
  useEffect(() => () => { if (zdjecie) URL.revokeObjectURL(zdjecie.podglad); }, [zdjecie]);

  const listaPoprawek = useMemo(() => [...new Set(produkty)].sort((a, b) => a.localeCompare(b, "pl")), [produkty]);

  const wybierzZdjecie = async (plik: File | undefined) => {
    if (!plik) return;
    setBlad(null);
    setPrzygotowuje(true);
    try {
      // Większe niż przy wizytówkach (1600 px), bo tabelka składu na worku ma drobny druk.
      const info = await przygotujZdjecieZInfo(plik, 2400, 0.85);
      setZdjecie({
        blob: info.blob,
        podglad: URL.createObjectURL(info.blob),
        opis: `${rozmiarPliku(info.bajtyWejscia)} → ${rozmiarPliku(info.bajtyWyjscia)}, dane o miejscu zrobienia (GPS) usunięte`,
      });
    } catch (e) {
      setZdjecie(null);
      setBlad(e instanceof Error ? e.message : "Nie udało się przygotować zdjęcia.");
    } finally {
      setPrzygotowuje(false);
    }
  };

  const wyslij = async () => {
    if (!user) return;
    const url = poprawLink(link);
    const cenaZl = liczba(cena);
    const kg = liczba(opakowanie);
    const adres = email.trim();
    if (nazwa.trim().length < 2) return setBlad("Podaj nazwę produktu.");
    if (sklep.trim().length < 2) return setBlad("Podaj sklep albo producenta.");
    if (!url && !zdjecie) return setBlad("Dodaj link do karty produktu albo zdjęcie etykiety.");
    if (url && !POPRAWNY_LINK.test(url)) return setBlad("Link powinien zaczynać się od https:// i nie mieć spacji.");
    if (cena.trim() && cenaZl == null) return setBlad("Cena powinna być liczbą, np. 89,90.");
    if (opakowanie.trim() && kg == null) return setBlad("Opakowanie podaj w kilogramach, np. 25 albo 2,5.");
    if (adres && !POPRAWNY_EMAIL.test(adres)) return setBlad("Sprawdź adres e-mail albo zostaw pole puste.");

    setBlad(null);
    setWysylanie(true);
    let sciezka: string | null = null;
    try {
      if (zdjecie) {
        sciezka = `${user.id}/etykieta-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error } = await supabase.storage
          .from(KUBELEK_ZGLOSZEN)
          .upload(sciezka, zdjecie.blob, { contentType: "image/jpeg", upsert: false });
        if (error) {
          sciezka = null;
          throw new Error(error.message.includes("exceeded")
            ? "Zdjęcie jest za duże nawet po zmniejszeniu. Wybierz inne."
            : `Nie udało się wysłać zdjęcia: ${error.message}`);
        }
      }
      const { error } = await (supabase as any).from("feed_submissions").insert({
        submitted_by: user.id,
        nazwa: nazwa.trim(),
        sklep: sklep.trim(),
        url: url || null,
        zdjecie: sciezka,
        cena_zl: cenaZl,
        opakowanie_kg: kg,
        poprawka_do: poprawka || null,
        kto,
        uwagi: uwagi.trim() || null,
        email: adres || null,
      });
      if (error) {
        // Bez zgłoszenia zdjęcie nie ma po co leżeć w kubełku.
        if (sciezka) await supabase.storage.from(KUBELEK_ZGLOSZEN).remove([sciezka]);
        throw new Error(error.message.startsWith("Limit zgłoszeń") ? error.message : `Nie udało się zapisać zgłoszenia: ${error.message}`);
      }
      setWyslane(true);
      wczytajMoje();
    } catch (e) {
      setBlad(e instanceof Error ? e.message : "Nie udało się wysłać zgłoszenia.");
    } finally {
      setWysylanie(false);
    }
  };

  return (
    <Dialog open={otwarty} onOpenChange={(o) => { if (!o) onZamknij(); }}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto p-5">
        <DialogHeader className="text-left">
          <DialogTitle className="pr-6 text-xl leading-tight">Zgłoś produkt albo poprawkę</DialogTitle>
          <DialogDescription>
            Podaj sklep i kartę produktu albo zrób zdjęcie etykiety. Skład przepiszemy sami ze źródła i dopiero
            po sprawdzeniu produkt pojawi się w kalkulatorze i w czatach.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="mt-2 space-y-4">
            <p className="text-sm text-muted-foreground">
              Zgłoszenie wymaga zalogowania: dzięki temu widzisz potem, co się z nim stało, a my wiemy, komu odpisać.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 flex-1 text-base font-semibold">
                <Link to={ADRES_LOGOWANIA_Z_KALKULATORA}>Zaloguj się / Załóż konto</Link>
              </Button>
              <Button type="button" variant="outline" className="h-11 flex-1" onClick={onZamknij}>Anuluj</Button>
            </div>
          </div>
        ) : wyslane ? (
          <div className="mt-2 space-y-4">
            <p className="rounded-md border border-green-600/30 bg-green-600/10 p-3 text-sm text-foreground">
              <strong>Dziękujemy, zgłoszenie dotarło.</strong> Sprawdzimy skład u źródła i sami wpiszemy produkt do bazy.
              Co się z nim stało, zobaczysz tutaj, na liście swoich zgłoszeń.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" className="h-11 flex-1" onClick={() => {
                setNazwa(""); setPoprawka(""); setSklep(""); setLink(""); setCena(""); setOpakowanie("");
                setUwagi(""); setZdjecie(null); setWyslane(false);
              }}>Zgłoś kolejny</Button>
              <Button type="button" className="h-11 flex-1" onClick={onZamknij}>Zamknij</Button>
            </div>
          </div>
        ) : (
          <div className="mt-1 space-y-4">
            <label className="block text-sm font-semibold">
              Nazwa produktu *
              <input value={nazwa} onChange={(e) => setNazwa(e.target.value)} className={klasaPola} maxLength={200}
                placeholder="np. Dolmix DN RE, worek 2,5 kg" autoComplete="off" />
            </label>
            <label className="block text-sm font-semibold">
              Sklep albo producent *
              <input value={sklep} onChange={(e) => setSklep(e.target.value)} className={klasaPola} maxLength={200}
                placeholder="np. sklep rolniczy w Twojej miejscowości" autoComplete="organization" />
            </label>

            <fieldset className="rounded-lg border border-border p-3">
              <legend className="px-1 text-sm font-semibold">Skąd sprawdzimy skład *</legend>
              <p className="mb-2 text-xs text-muted-foreground">
                Wystarczy jedno. Najlepiej zdjęcie tabelki ze składem: „składniki analityczne” i „dodatki na 1 kg”.
              </p>
              <label className="block text-sm font-medium">
                Link do karty produktu
                <input type="url" inputMode="url" value={link} onChange={(e) => setLink(e.target.value)} className={klasaPola}
                  maxLength={2000} placeholder="https://…" autoComplete="url" />
              </label>
              <p className="my-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">albo</p>
              {zdjecie ? (
                <div className="flex items-start gap-3">
                  <img src={zdjecie.podglad} alt="Zdjęcie etykiety do wysłania" className="h-24 w-24 shrink-0 rounded-md border border-border object-cover" />
                  <div className="min-w-0 text-xs text-muted-foreground">
                    <p>{zdjecie.opis}.</p>
                    <button type="button" onClick={() => setZdjecie(null)}
                      className="mt-1 inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline">
                      <X className="h-3.5 w-3.5" aria-hidden="true" /> Usuń zdjęcie
                    </button>
                  </div>
                </div>
              ) : (
                <label className={cn(
                  "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-primary/40 px-3 py-2 text-sm font-semibold text-primary hover:border-primary hover:bg-primary/5",
                  przygotowuje && "pointer-events-none opacity-60",
                )}>
                  {przygotowuje ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Camera className="h-5 w-5" aria-hidden="true" />}
                  {przygotowuje ? "Przygotowuję zdjęcie…" : "Zrób albo wybierz zdjęcie etykiety"}
                  <input type="file" accept="image/*" className="sr-only"
                    onChange={(e) => { wybierzZdjecie(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
              )}
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">
                Cena (zł)
                <input inputMode="decimal" value={cena} onChange={(e) => setCena(e.target.value)} className={klasaPola} placeholder="np. 89,90" />
              </label>
              <label className="block text-sm font-medium">
                Opakowanie (kg)
                <input inputMode="decimal" value={opakowanie} onChange={(e) => setOpakowanie(e.target.value)} className={klasaPola} placeholder="np. 25" />
              </label>
            </div>

            <label className="block text-sm font-medium">
              To poprawka do produktu z bazy?
              <select value={poprawka} onChange={(e) => setPoprawka(e.target.value)} className={klasaPola}>
                <option value="">Nie, to nowy produkt</option>
                {listaPoprawek.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>

            <div>
              <p className="text-sm font-medium">Kim jesteś?</p>
              <div className="mt-1 flex flex-wrap gap-2" role="radiogroup" aria-label="Kim jesteś">
                {KTO.map(({ k, etykieta }) => (
                  <button key={k} type="button" role="radio" aria-checked={kto === k}
                    onClick={() => setKto(kto === k ? null : k)}
                    className={cn("min-h-10 rounded-full border px-3.5 text-sm",
                      kto === k ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary")}>
                    {etykieta}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-sm font-medium">
              Uwagi
              <textarea value={uwagi} onChange={(e) => setUwagi(e.target.value)} maxLength={2000} rows={3}
                className="mt-1 w-full rounded-md border border-input bg-background p-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="np. co jest nie tak w obecnym wpisie, gdzie jeszcze go kupić" />
            </label>

            <label className="block text-sm font-medium">
              E-mail do odpowiedzi (jeśli chcesz, żebyśmy napisali)
              <input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className={klasaPola}
                maxLength={254} autoComplete="email" />
            </label>
            {user.email && !email && (
              <button type="button" onClick={() => setEmail(user.email ?? "")}
                className="-mt-2 text-xs font-semibold text-primary underline-offset-4 hover:underline">
                Wstaw adres z konta
              </button>
            )}

            <p className="text-xs text-muted-foreground">
              Zgłoszenie od sklepu albo producenta traktujemy tak samo jak od hodowcy: kolejność ofert w kalkulatorze
              zależy tylko od składu i ceny. Zgłoszenie widzisz Ty i administrator. Zdjęcie usuwamy po sprawdzeniu,
              resztę rok później (<a href="/nota-prawna#prywatnosc" target="_blank" rel="noopener" className="underline">nota prywatności</a>).
            </p>

            {blad && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-sm text-foreground">{blad}</p>}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" className="h-11 flex-1 text-base font-semibold" onClick={wyslij} disabled={wysylanie || przygotowuje}>
                {wysylanie && <Loader2 className="animate-spin" aria-hidden="true" />}
                {wysylanie ? "Wysyłam…" : "Wyślij zgłoszenie"}
              </Button>
              <Button type="button" variant="outline" className="h-11 flex-1" onClick={onZamknij}>Anuluj</Button>
            </div>
          </div>
        )}

        {user && moje.length > 0 && (
          <section className="mt-5 border-t border-border pt-4">
            <h3 className="mb-1.5 font-body text-sm font-bold uppercase tracking-wide text-muted-foreground">Twoje zgłoszenia</h3>
            <ul className="space-y-1.5">
              {moje.map((z) => (
                <li key={z.id} className="rounded-md border border-border px-2.5 py-1.5 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="min-w-0 font-semibold">{z.nazwa}</span>
                    <span className={cn("text-xs font-semibold",
                      z.status === "dodane" ? "text-green-700 dark:text-green-400" : "text-muted-foreground")}>
                      {STATUS_DLA_AUTORA[z.status]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dataPL(z.created_at)}{z.poprawka_do && ` · poprawka do: ${z.poprawka_do}`}
                  </p>
                  {z.notatka && <p className="mt-0.5 text-xs">Od nas: {z.notatka}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}
