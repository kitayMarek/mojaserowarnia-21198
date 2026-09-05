import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Wybieralne raporty z licznika botów.
 *
 * ⛔ GRANICA, KTÓREJ NIE PRZEKRACZAMY: nigdzie tu nie ma i nie będzie pola do
 * wpisania zapytania. Użytkownik wybiera z ZAMKNIĘTEJ listy, a identyfikator
 * raportu jest kluczem w mapie po stronie workera i parametrem funkcji w bazie.
 * Żaden tekst od użytkownika nie staje się fragmentem zapytania — ani tutaj,
 * ani na brzegu, ani w Postgresie.
 *
 * Dane idą przez /api/raport, czyli przez workera, a nie prosto do Supabase.
 * Powód jest praktyczny: osiem raportów razy cztery okresy to 32 stałe
 * odpowiedzi, które cachują się na brzegu na godzinę. Baza dostaje 32 zapytania
 * na godzinę niezależnie od tego, ile osób klika.
 */

type Okres = "24h" | "7d" | "30d" | "all";

const OKRESY: Array<{ id: Okres; etykieta: string; dni: number }> = [
  { id: "24h", etykieta: "24 godziny", dni: 1 },
  { id: "7d", etykieta: "7 dni", dni: 7 },
  { id: "30d", etykieta: "30 dni", dni: 30 },
  { id: "all", etykieta: "całość", dni: Infinity },
];

type Typ = "tekst" | "liczba" | "procent" | "data" | "lista" | "bool" | "czas";

interface Kolumna {
  k: string;
  n: string;
  typ: Typ;
}

interface Raport {
  id: string;
  nazwa: string;
  opis: string;
  domyslny: Okres;
  kolumny: Kolumna[];
  pusto: string;
}

/** Opis pod każdym raportem to treść dla laika, nie ozdobnik — mówi, co widać
 *  i jak to czytać. Bez niego tabela liczb nie znaczy nic dla kogoś z zewnątrz. */
const RAPORTY: Raport[] = [
  {
    id: "kto_byl",
    nazwa: "Kto tu był",
    opis: "Wszystkie tożsamości botów widziane w wybranym okresie, z podziałem na te, które przeszły weryfikację, te którym zaprzeczyła, i te, których nie da się rozstrzygnąć.",
    domyslny: "7d",
    kolumny: [
      { k: "bot", n: "Bot", typ: "tekst" },
      { k: "operator", n: "Operator", typ: "tekst" },
      { k: "kategoria", n: "Kategoria", typ: "tekst" },
      { k: "zadan", n: "Żądań", typ: "liczba" },
      { k: "oryginalne", n: "Oryginalne", typ: "liczba" },
      { k: "falszowane", n: "Fałszowane", typ: "liczba" },
      { k: "niesprawdzone", n: "Niesprawdzone", typ: "liczba" },
      { k: "ostatnia_wizyta", n: "Ostatnio", typ: "data" },
    ],
    pusto: "W tym okresie nie było ruchu botów.",
  },
  {
    id: "co_odwiedzali",
    nazwa: "Co czytali",
    opis: "Strony, które boty faktycznie otworzyły z wynikiem 200. Tylko treść i pliki techniczne — ścieżek, o które pytają skanery, nie publikujemy, bo byłyby gotową mapą dla następnego.",
    domyslny: "7d",
    kolumny: [
      { k: "sciezka", n: "Adres", typ: "tekst" },
      { k: "zadan", n: "Żądań", typ: "liczba" },
      { k: "roznych_botow", n: "Różnych botów", typ: "liczba" },
      { k: "czy_mirror", n: "Wersja dla botów", typ: "bool" },
      { k: "ostatnio", n: "Ostatnio", typ: "data" },
    ],
    pusto: "W tym okresie żaden bot nie otworzył u nas strony z wynikiem 200.",
  },
  {
    id: "sygnatura",
    nazwa: "Jak rozpoznać podszywacza",
    opis: "Najmocniejszy raport w całym zestawie. Prawdziwe boty idą po mapie strony i prawie nie trafiają na błędy; podszywacze zgadują adresy, więc mylą się często i dostają krótkie strony błędu. Kolumna „okres” rozdziela dane sprzed i po 5 września 2026, kiedy zmieniliśmy odpowiedzi serwera — bez tego podziału obie połówki byłyby nieporównywalne.",
    domyslny: "all",
    kolumny: [
      { k: "grupa", n: "Grupa", typ: "tekst" },
      { k: "okres_pomiaru", n: "Okres", typ: "tekst" },
      { k: "zadan", n: "Żądań", typ: "liczba" },
      { k: "odbite", n: "Odbitych", typ: "liczba" },
      { k: "proc_bledow", n: "% błędów", typ: "procent" },
      { k: "sredni_rozmiar", n: "Śr. rozmiar", typ: "liczba" },
      { k: "mirrorow", n: "Wersji dla botów", typ: "liczba" },
      { k: "roznych_sciezek", n: "Ścieżek", typ: "liczba" },
    ],
    pusto: "W tym okresie nie było żądań, których tożsamość dałoby się rozstrzygnąć.",
  },
  {
    id: "pod_kogo",
    nazwa: "Pod kogo się podszywano",
    opis: "Wyłącznie żądania, przy których weryfikacja zaprzeczyła deklarowanej tożsamości. Liczba przy nazwie bota mówi, ile razy ktoś obcy jej użył — to miara rozpoznawalności marki, nie zarzut wobec operatora.",
    domyslny: "all",
    kolumny: [
      { k: "bot", n: "Bot", typ: "tekst" },
      { k: "operator", n: "Operator", typ: "tekst" },
      { k: "falszowane", n: "Fałszowane", typ: "liczba" },
      { k: "z_ilu_sieci", n: "Z ilu sieci", typ: "liczba" },
      { k: "kraje", n: "Kraje", typ: "lista" },
      { k: "ostatnio", n: "Ostatnio", typ: "data" },
    ],
    pusto: "W tym okresie nikt nie podszył się pod żadnego bota — albo nie było czym tego rozstrzygnąć.",
  },
  {
    id: "incydenty",
    nazwa: "Incydenty",
    opis: "Sieci, których zachowanie odpowiada skanowaniu w poszukiwaniu podatności: pytania o pliki konfiguracyjne, wysoki odsetek błędów, wiele tożsamości naraz. Podajemy numer sieci i zachowanie — nie właściciela i nie oskarżenie, bo operator sieci wynajmuje serwery i sprawca jest jego klientem.",
    domyslny: "30d",
    kolumny: [
      { k: "asn", n: "Sieć (ASN)", typ: "tekst" },
      { k: "kraj", n: "Kraj", typ: "tekst" },
      { k: "zadan", n: "Żądań", typ: "liczba" },
      { k: "tozsamosci", n: "Tożsamości", typ: "liczba" },
      { k: "proc_bledow", n: "% błędów", typ: "procent" },
      { k: "prob_wrazliwych", n: "Pytań o pliki wrażliwe", typ: "liczba" },
      { k: "start", n: "Początek", typ: "data" },
      { k: "trwalo", n: "Trwało", typ: "czas" },
    ],
    pusto: "W tym okresie nic nie zachowywało się jak skaner. To dobra wiadomość.",
  },
  {
    id: "w_czasie",
    nazwa: "Ruch w czasie",
    opis: "Rozkład żądań w czasie. Przy oknie 24-godzinnym liczony po godzinach, przy tygodniu i miesiącu po dniach, przy całości po tygodniach.",
    domyslny: "7d",
    kolumny: [
      { k: "okno", n: "Okno", typ: "data" },
      { k: "oryginalne", n: "Oryginalne", typ: "liczba" },
      { k: "falszowane", n: "Fałszowane", typ: "liczba" },
      { k: "niesprawdzone", n: "Niesprawdzone", typ: "liczba" },
      { k: "razem", n: "Razem", typ: "liczba" },
    ],
    pusto: "W tym okresie nie było ruchu botów.",
  },
  {
    id: "czego_nie_bylo",
    nazwa: "Czego szukali, a nie znaleźli",
    opis: "Adresy, o które pytały ZWERYFIKOWANE boty i dostały 404. Każdy wiersz to kandydat na nową stronę albo na przekierowanie. Zgadywanki skanerów są tu odsiane — to lista braków w treści, a nie lista prób włamania.",
    domyslny: "30d",
    kolumny: [
      { k: "sciezka", n: "Adres", typ: "tekst" },
      { k: "prob", n: "Prób", typ: "liczba" },
      { k: "boty", n: "Boty", typ: "lista" },
      { k: "ostatnio", n: "Ostatnio", typ: "data" },
    ],
    pusto: "Żaden zweryfikowany bot nie szukał u nas czegoś, czego nie ma — czyli znajdują wszystko, po co przychodzą.",
  },
  {
    id: "porownanie",
    nazwa: "Porównanie okresów",
    opis: "Wybrany okres zestawiony z poprzednim o tej samej długości. Przy „całości” poprzedniego okresu nie ma i kolumna zostaje pusta — to nie to samo co zero.",
    domyslny: "7d",
    kolumny: [
      { k: "metryka", n: "Metryka", typ: "tekst" },
      { k: "biezacy", n: "Bieżący", typ: "liczba" },
      { k: "poprzedni", n: "Poprzedni", typ: "liczba" },
      { k: "zmiana_proc", n: "Zmiana", typ: "procent" },
    ],
    pusto: "Brak danych do porównania.",
  },
];

const MIESIACE = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];

const liczba = (n: unknown) =>
  n === null || n === undefined ? "—" : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

function formatuj(wartosc: unknown, typ: Typ): string {
  if (wartosc === null || wartosc === undefined || wartosc === "") return "—";
  switch (typ) {
    case "liczba":
      return liczba(wartosc);
    case "procent":
      return `${String(wartosc).replace(".", ",")}%`;
    case "bool":
      return wartosc ? "tak" : "nie";
    case "lista":
      return Array.isArray(wartosc) && wartosc.length ? wartosc.join(", ") : "—";
    case "czas":
      return String(wartosc);
    case "data": {
      const d = new Date(String(wartosc));
      if (Number.isNaN(d.getTime())) return String(wartosc);
      const gg = String(d.getUTCHours()).padStart(2, "0");
      const mm = String(d.getUTCMinutes()).padStart(2, "0");
      return `${d.getUTCDate()} ${MIESIACE[d.getUTCMonth()]}, ${gg}:${mm}`;
    }
    default:
      return String(wartosc);
  }
}

interface Odpowiedz {
  raport: string;
  okres: string;
  wierszy: number;
  dane: Array<Record<string, unknown>>;
  blad?: string;
}

const RaportyBotow = ({ dniPomiaru }: { dniPomiaru?: number }) => {
  // Stan startowy z adresu, żeby dało się podlinkować konkretny wynik.
  const [wybrany, setWybrany] = useState<string>(() => {
    const z = new URLSearchParams(window.location.search).get("raport");
    return RAPORTY.some((r) => r.id === z) ? (z as string) : "kto_byl";
  });
  const [okres, setOkres] = useState<Okres>(() => {
    const z = new URLSearchParams(window.location.search).get("okres");
    return OKRESY.some((o) => o.id === z) ? (z as Okres) : "7d";
  });

  // Debounce 400 ms: przełączanie opcji w tę i we w tę nie ma młócić brzegu
  // serią żądań. Zlecenie wymaga tego wprost.
  const [opoznione, setOpoznione] = useState({ wybrany, okres });
  useEffect(() => {
    const t = setTimeout(() => setOpoznione({ wybrany, okres }), 400);
    return () => clearTimeout(t);
  }, [wybrany, okres]);

  useEffect(() => {
    const u = new URL(window.location.href);
    u.searchParams.set("raport", wybrany);
    u.searchParams.set("okres", okres);
    window.history.replaceState(null, "", `${u.pathname}${u.search}${u.hash}`);
  }, [wybrany, okres]);

  const definicja = useMemo(
    () => RAPORTY.find((r) => r.id === opoznione.wybrany) ?? RAPORTY[0],
    [opoznione.wybrany],
  );

  const { data, isFetching, isError, refetch } = useQuery<Odpowiedz>({
    queryKey: ["raport", opoznione.wybrany, opoznione.okres],
    queryFn: async () => {
      const odp = await fetch(`/api/raport?raport=${opoznione.wybrany}&okres=${opoznione.okres}`);
      if (!odp.ok) throw new Error(`HTTP ${odp.status}`);
      const j: Odpowiedz = await odp.json();
      if (j.blad) throw new Error(j.blad);
      return j;
    },
    staleTime: 30 * 60 * 1000,
  });

  const wiersze = data?.dane ?? [];
  const maxRazem = Math.max(1, ...wiersze.map((w) => Number(w.razem) || 0));

  return (
    <Card id="raporty">
      <CardHeader>
        <CardTitle>Wybierz raport</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {RAPORTY.map((r) => (
            <Button
              key={r.id}
              size="sm"
              variant={r.id === wybrany ? "default" : "outline"}
              onClick={() => { setWybrany(r.id); setOkres(r.domyslny); }}
            >
              {r.nazwa}
            </Button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          {RAPORTY.find((r) => r.id === wybrany)?.opis}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium mr-1">Okres:</span>
          {OKRESY.map((o) => (
            <Button
              key={o.id}
              size="sm"
              variant={o.id === okres ? "secondary" : "ghost"}
              onClick={() => setOkres(o.id)}
            >
              {o.etykieta}
            </Button>
          ))}
        </div>

        {/* Uczciwość wobec czytelnika: przy krótkim pomiarze dłuższe okna dają
            ten sam wynik, co całość. Cztery przyciski zwracające cztery
            identyczne tabele wyglądają jak awaria, jeśli nikt nie wyjaśni. */}
        {typeof dniPomiaru === "number" && dniPomiaru < 30 && (
          <p className="text-xs text-muted-foreground">
            Pomiar trwa {liczba(dniPomiaru)} dni — okresy dłuższe niż to pokazują całość
            zebranych danych.
          </p>
        )}

        <div className="border-t pt-4">
          {isFetching && <p className="text-sm text-muted-foreground">Pobieram dane…</p>}

          {isError && !isFetching && (
            <div className="space-y-3">
              <p>Nie udało się pobrać danych.</p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>Spróbuj ponownie</Button>
            </div>
          )}

          {!isFetching && !isError && wiersze.length === 0 && (
            <p className="text-sm">{definicja.pusto}</p>
          )}

          {!isFetching && !isError && wiersze.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      {definicja.kolumny.map((c) => (
                        <th key={c.k} className="text-left py-2 pr-4 font-medium whitespace-nowrap">{c.n}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {wiersze.map((w, i) => (
                      <tr key={i} className="border-b last:border-0">
                        {definicja.kolumny.map((c) => (
                          <td
                            key={c.k}
                            className={`py-2 pr-4 ${c.typ === "liczba" || c.typ === "procent" ? "tabular-nums" : ""}`}
                          >
                            {formatuj(w[c.k], c.typ)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Wykres wyłącznie dla raportu czasowego — słupki z divów, bez
                  biblioteki i bez animacji. Zlecenie odrzuca efekciarstwo. */}
              {definicja.id === "w_czasie" && (
                <div className="mt-6 space-y-1">
                  {wiersze.map((w, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-28 shrink-0 text-muted-foreground">
                        {formatuj(w.okno, "data")}
                      </span>
                      <span className="flex-1 flex h-4 rounded overflow-hidden bg-muted">
                        <span
                          className="bg-emerald-500/70"
                          style={{ width: `${(100 * (Number(w.oryginalne) || 0)) / maxRazem}%` }}
                          title={`oryginalne: ${w.oryginalne}`}
                        />
                        <span
                          className="bg-rose-500/70"
                          style={{ width: `${(100 * (Number(w.falszowane) || 0)) / maxRazem}%` }}
                          title={`fałszowane: ${w.falszowane}`}
                        />
                        <span
                          className="bg-slate-400/70"
                          style={{ width: `${(100 * (Number(w.niesprawdzone) || 0)) / maxRazem}%` }}
                          title={`niesprawdzone: ${w.niesprawdzone}`}
                        />
                      </span>
                      <span className="w-10 text-right tabular-nums">{liczba(w.razem)}</span>
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500/70 inline-block" /> oryginalne</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-rose-500/70 inline-block" /> fałszowane</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-slate-400/70 inline-block" /> niesprawdzone</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-4">
                <Badge variant="secondary" className="mr-2">{wiersze.length} wierszy</Badge>
                Wyniki są agregatami. Nie ma w nich adresów IP ani ścieżek, o które pytają skanery.
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RaportyBotow;
