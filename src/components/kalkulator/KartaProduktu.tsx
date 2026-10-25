import type { ReactNode } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  GATUNKI_DODATKOW, OPIS_ODBIORU, OPIS_ZRODLA_SKLADU, adresOferty, cenaZaKg, dawkaEtykiety, opisLokalizacji, przepisZeStosowania,
  type DodatekPaszowy,
} from "@/data/dodatkiPaszowe";
import { OPIS_GMO, opisEko } from "@/data/gmoEkoSurowcow";
import { liczbaPL } from "@/components/kalkulator/wspolne";

/**
 * Karta produktu z bazy dodatków (od 24.10.2026): producent, skład z etykiety,
 * dawkowanie, oferty sklepów z ceną i datą, źródło składu. Na wzór karty kultury
 * w bazie kultur. Koncentrat z przepisem na etykiecie dostaje pod spodem
 * „koncentrat + Twoje zboże” (przekazane jako `koncentrat`).
 *
 * Oferty od najtańszej za kg. Oznaczenie „partner” jest jawne, ale na kolejność
 * niczego w kalkulatorze nie wpływa: to stoi też na karcie.
 */

const dataPL = (d: string) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString("pl-PL") : "");

/** Skład na kg: pole, etykieta, jednostka, miejsca po przecinku. Pokazujemy tylko to, co etykieta podaje. */
const SKLAD: Array<[keyof DodatekPaszowy, string, string, number]> = [
  ["em", "Energia (EM)", "MJ/kg", 2],
  ["bialko", "Białko", "%", 1],
  ["tluszcz", "Tłuszcz", "%", 1],
  ["wlokno", "Włókno", "%", 1],
  ["popiol", "Popiół", "%", 1],
  ["ca", "Wapń (Ca)", "%", 2],
  ["p", "Fosfor (P)", "%", 2],
  ["na", "Sód (Na)", "%", 2],
  ["cl", "Chlor (Cl)", "%", 2],
  ["mg", "Magnez (Mg)", "%", 2],
  ["lys", "Lizyna", "%", 2],
  ["met", "Metionina", "%", 2],
  ["metCys", "Metionina + cystyna", "%", 2],
  ["thr", "Treonina", "%", 2],
  ["trp", "Tryptofan", "%", 2],
];

const DODATKI_NA_KG: Array<[keyof DodatekPaszowy, string, string]> = [
  ["witA", "Witamina A", "tys. j.m."], ["witD3", "Witamina D3", "tys. j.m."], ["witE", "Witamina E", "mg"],
  ["witB1", "Witamina B1", "mg"], ["witB2", "Witamina B2", "mg"], ["witB6", "Witamina B6", "mg"],
  ["witB12", "Witamina B12", "µg"], ["niacyna", "Niacyna", "mg"], ["kwasPantotenowy", "Kwas pantotenowy", "mg"],
  ["kwasFoliowy", "Kwas foliowy", "mg"], ["biotyna", "Biotyna", "mg"], ["cholina", "Cholina", "g"],
  ["mn", "Mangan (Mn)", "mg"], ["zn", "Cynk (Zn)", "mg"], ["fe", "Żelazo (Fe)", "mg"], ["cu", "Miedź (Cu)", "mg"],
  ["i", "Jod (I)", "mg"], ["se", "Selen (Se)", "mg"],
];

function Wiersz({ etykieta, children }: { etykieta: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-border py-1 text-sm first:border-t-0">
      <span className="text-muted-foreground">{etykieta}</span>
      <span className="text-right font-semibold tabular-nums">{children}</span>
    </div>
  );
}

function Blok({ tytul, children }: { tytul: string; children: ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="mb-1.5 font-body text-sm font-bold uppercase tracking-wide text-muted-foreground">{tytul}</h3>
      {children}
    </section>
  );
}

export default function KartaProduktu({
  dodatek, onZamknij, onDodaj, onZglosPoprawke, koncentrat,
}: {
  dodatek: DodatekPaszowy | null;
  onZamknij: () => void;
  /** „Zgłoś poprawkę”: formularz zgłoszenia z tym produktem w polu „poprawka do”. */
  onZglosPoprawke?: (nazwa: string) => void;
  /** Dodaje produkt do mieszanki w dawce z etykiety (bez dawki: bez udziału, wpisze go użytkownik albo dobór). */
  onDodaj: (nazwa: string, procent?: number) => void;
  /** Sekcja „koncentrat + Twoje zboże”, gdy produkt ma przepis w `stosowanie`. */
  koncentrat?: ReactNode;
}) {
  const d = dodatek;
  const oferty = d ? [...d.oferty].sort((a, b) => cenaZaKg(a) - cenaZaKg(b)) : [];
  const dawka = d ? dawkaEtykiety(d) : 0;
  const jestPrzepis = !!(d && przepisZeStosowania(d.stosowanie));
  const sklad = d ? SKLAD.filter(([pole]) => Number(d[pole]) > 0) : [];
  const dodatki = d ? DODATKI_NA_KG.filter(([pole]) => Number(d[pole]) > 0) : [];

  return (
    <Dialog open={!!d} onOpenChange={(o) => { if (!o) onZamknij(); }}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto p-5">
        {d && (
          <>
            <DialogHeader className="text-left">
              <DialogTitle className="pr-6 text-xl leading-tight">{d.nazwa}</DialogTitle>
              <DialogDescription>
                {d.producent} · {d.kategoria}
              </DialogDescription>
            </DialogHeader>

            {d.partner && (
              <p className="mt-2 rounded-md border border-border bg-muted/60 px-2.5 py-1.5 text-xs">
                <strong>Partner serwisu.</strong> Producent płaci za obecność w bazie i sprawdzanie danych, nie za miejsce na liście:
                kolejność propozycji w kalkulatorze zależy tylko od składu i ceny.
              </p>
            )}

            <Blok tytul="Dla kogo i ile">
              <Wiersz etykieta="Dla kogo">
                {d.gatunki.length ? d.gatunki.map((g) => GATUNKI_DODATKOW[g]).join(", ") : "etykieta nie zawęża"}
              </Wiersz>
              <Wiersz etykieta="Dawkowanie">{d.dawkowanie || "etykieta nie podaje"}</Wiersz>
              {d.stosowanie && <Wiersz etykieta="Stosowanie">{d.stosowanie}</Wiersz>}
            </Blok>

            {jestPrzepis && koncentrat}

            {sklad.length > 0 && (
              <Blok tytul="Skład na 1 kg">
                {sklad.map(([pole, etykieta, jedn, miejsca]) => (
                  <Wiersz key={pole} etykieta={etykieta}>
                    {liczbaPL(Number(d[pole]), miejsca)}{jedn === "%" ? "%" : ` ${jedn}`}
                  </Wiersz>
                ))}
              </Blok>
            )}
            {dodatki.length > 0 && (
              <Blok tytul="Witaminy i mikroelementy na 1 kg">
                {dodatki.map(([pole, etykieta, jedn]) => (
                  <Wiersz key={pole} etykieta={etykieta}>{liczbaPL(Number(d[pole]))} {jedn}</Wiersz>
                ))}
              </Blok>
            )}
            {d.skladSurowcowy && (
              <Blok tytul="Skład surowcowy">
                <p className="text-sm">{d.skladSurowcowy}</p>
              </Blok>
            )}

            <Blok tytul="GMO i chów ekologiczny">
              <p className="text-sm">{OPIS_GMO[d.gmo]} · {opisEko(d.dopuszczalneEko)}</p>
            </Blok>

            <Blok tytul="Gdzie kupić">
              {oferty.length > 0 ? (
                <ul className="space-y-1.5">
                  {oferty.map((o) => (
                    <li key={`${o.url}-${o.opakowanieKg}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-md border border-border px-2.5 py-1.5 text-sm">
                      <span className="min-w-0 flex-1 font-semibold">{o.sklep}</span>
                      <span className="tabular-nums">{liczbaPL(o.cenaZl, 2)} zł za {liczbaPL(o.opakowanieKg)} kg</span>
                      <span className="font-semibold tabular-nums">{liczbaPL(cenaZaKg(o), 2)} zł/kg</span>
                      {/* Gdzie jest sklep (od 25.10.2026); adres tylko tam, gdzie można przyjechać. */}
                      {o.lokalizacja?.miejscowosc && (
                        <span className="w-full text-xs">
                          {opisLokalizacji(o.lokalizacja)}
                          {o.lokalizacja.punkty.map((p) => (
                            <span key={p.adres} className="block text-muted-foreground">
                              {o.lokalizacja!.punkty.length > 1 && `${OPIS_ODBIORU[p.rodzaj]}: `}{p.adres}{p.godziny && `, ${p.godziny}`}
                            </span>
                          ))}
                        </span>
                      )}
                      <span className="w-full text-xs text-muted-foreground">
                        cena z {dataPL(o.sprawdzono)} ·{" "}
                        <a href={adresOferty(o.url)} target="_blank" rel="nofollow noopener" className="inline-flex items-center gap-0.5 font-semibold text-primary underline-offset-4 hover:underline">
                          strona sklepu <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm">
                  Nie znaleźliśmy tego produktu w sklepach internetowych.
                  {d.urlProducenta && (
                    <>
                      {" "}Sprzedaż u producenta:{" "}
                      <a href={d.urlProducenta} target="_blank" rel="nofollow noopener" className="font-semibold text-primary underline-offset-4 hover:underline">strona producenta</a>.
                    </>
                  )}
                </p>
              )}
              {oferty.length > 0 && (
                <p className="mt-1.5 text-xs text-muted-foreground">Ceny ze stron sklepów z podanego dnia, to nie są ceny bieżące. Przed zakupem sprawdź cenę w sklepie.</p>
              )}
            </Blok>

            <Blok tytul="Skąd te dane">
              <p className="text-sm">
                Skład {OPIS_ZRODLA_SKLADU[d.zrodloSkladu]}
                {d.zweryfikowano && `, sprawdzony ${dataPL(d.zweryfikowano)}`}.{" "}
                {d.zrodlo && (
                  <a href={d.zrodlo} target="_blank" rel="nofollow noopener" className="font-semibold text-primary underline-offset-4 hover:underline">Źródło</a>
                )}
                {d.urlProducenta && d.urlProducenta !== d.zrodlo && (
                  <>
                    {" · "}
                    <a href={d.urlProducenta} target="_blank" rel="nofollow noopener" className="font-semibold text-primary underline-offset-4 hover:underline">Strona producenta</a>
                  </>
                )}
              </p>
              {d.uwagi && <p className="mt-1 text-xs text-muted-foreground">{d.uwagi}</p>}
              <p className="mt-1 text-xs text-muted-foreground">Kolejne partie mogą mieć inny skład: obowiązuje etykieta na worku.</p>
              {onZglosPoprawke && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Inny skład na Twoim worku, inna cena albo inny sklep?{" "}
                  <button type="button" onClick={() => onZglosPoprawke(d.nazwa)} className="font-semibold text-primary underline-offset-4 hover:underline">
                    Zgłoś poprawkę
                  </button>
                </p>
              )}
            </Blok>

            {!jestPrzepis && (
              <Button
                type="button"
                className="mt-5 h-11 w-full text-base font-semibold"
                onClick={() => { onDodaj(d.nazwa, dawka > 0 ? dawka : undefined); onZamknij(); }}
              >
                <Plus aria-hidden="true" />
                {dawka > 0 ? `Dodaj do mieszanki (${liczbaPL(dawka)}% z etykiety)` : "Dodaj do mieszanki"}
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
