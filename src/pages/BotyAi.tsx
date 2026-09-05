import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import RaportyBotow from "@/components/RaportyBotow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Bot, ChevronDown, ChevronUp } from "lucide-react";

/**
 * Publiczna strona o ruchu botów.
 *
 * DANE IDĄ Z /bot-stats.json, NIE Z KLIENTA SUPABASE — i to jest decyzja, nie
 * skrót. Ten sam plik zasila statyczny mirror składany przez workera, więc
 * jedno źródło obsługuje obie warstwy. Gdyby trasa czytała widoki osobno,
 * mirror i strona mogłyby pokazać różne liczby w tej samej chwili (inny moment
 * odczytu, inny cache) — a to jest dokładnie ten rodzaj rozjazdu, który strona
 * o rzetelności pomiaru może sobie zafundować tylko raz.
 *
 * Przy okazji znika problem typów: widoki pub_* nie istnieją w wygenerowanym
 * src/integrations/supabase/types.ts, więc supabase.from("pub_bot_...") byłoby
 * błędem kompilacji albo rzutowaniem na `any`.
 */

interface Podsumowanie {
  pomiar_od: string;
  stan_na: string;
  dni_pomiaru: number;
  zadan_ogolem: number;
  oryginalne: number;
  falszowane: number;
  niesprawdzone: number;
  rozstrzygniete: number;
  testy_wlasciciela: number;
  proc_wsrod_rozstrzygnietych: number | null;
  proc_calosci: number | null;
  roznych_tozsamosci: number;
  roznych_sieci: number;
  z_zapisana_metoda: number;
}

interface Statystyki {
  stan_na: string;
  podsumowanie: Podsumowanie;
  wg_bota: Array<{ operator: string; bot: string; kategoria: string; oryginalne: number; falszowane: number; niesprawdzone: number }>;
  kategorie: Array<{ kategoria: string; zadan: number; oryginalne: number; falszowane: number; roznych_tozsamosci: number; obsluzonych_mirrorem: number }>;
  zachowanie: Array<{ grupa: string; okres: string; zadan: number; odbite: number; proc_bledow: number; sredni_rozmiar: number; roznych_sciezek: number }>;
  cele: Array<{ grupa: string; sciezka_typ: string; zadan: number; proc_grupy: number }>;
  metody: Array<{ metoda: string; zadan: number; potwierdzone: number; zaprzeczone: number }>;
}

const MIESIACE = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];

const liczba = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const ulamek = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : String(n).replace(".", ",");

const dataDlugo = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : `${d.getUTCDate()} ${MIESIACE[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

const OKRESY: Record<string, string> = {
  "przed zmiana metody": "przed zmianą metody",
  "po zmianie metody": "po zmianie metody",
};

/** Moduły rozwijane. `id` trafia do adresu jako #id, żeby dało się podlinkować
 *  konkretną sekcję — zlecenie wymaga tego wprost. */
const MODULY = [
  { id: "jak-to-mozliwe", tytul: "Jak w ogóle można podszyć się pod bota?", zajawka: "User-Agent to deklaracja, nie tożsamość. Podszycie się zajmuje jedną linijkę." },
  { id: "kto-tu-chodzi", tytul: "Kto tu w ogóle chodzi?", zajawka: "Kto wysyła którego bota i ile razy ktoś obcy użył jego nazwy." },
  { id: "crawler-czy-czlowiek", tytul: "Crawler czy pytanie konkretnego człowieka?", zajawka: "Za częścią tych żądań stoi żywa osoba, która o coś zapytała w czacie." },
  { id: "jak-rozpoznac", tytul: "Jak rozpoznać podszywacza bez sprawdzania tożsamości?", zajawka: "Obie grupy zachowują się inaczej na tyle wyraźnie, że nie trzeba list adresów." },
  { id: "czego-szukaja", tytul: "Czego szukają jedni, a czego drudzy?", zajawka: "Zbiory celów obu grup prawie się nie przecinają." },
  { id: "ruch-wlasciciela", tytul: "Ile tego ruchu robi sam właściciel strony?", zajawka: "Odliczam własne testy i pokazuję ile ich było. Oto dlaczego to ważne." },
  { id: "kronika", tytul: "Kronika zdarzeń", zajawka: "Sześć tożsamości w dziewiętnaście sekund i inne rzeczy warte zapamiętania." },
  { id: "metodologia", tytul: "Jak to jest liczone?", zajawka: "Listy adresów, odwrotny DNS, podpisy — i co znaczy „nie wiadomo”." },
] as const;

const BotyAi = () => {
  const { data, isPending, isError } = useQuery<Statystyki>({
    queryKey: ["bot-stats"],
    queryFn: async () => {
      const odp = await fetch("/bot-stats.json");
      if (!odp.ok) throw new Error(`HTTP ${odp.status}`);
      return odp.json();
    },
    staleTime: 30 * 60 * 1000,
  });

  const [otwarte, setOtwarte] = useState<string[]>([]);
  const [technicznie, setTechnicznie] = useState(false);

  // Zgadywanka: suwak BEZ ZAPISU. Zlecenie proponowało zbieranie odpowiedzi
  // i publikowanie średniej — odrzucone świadomie. Zapis wymagałby INSERT-a dla
  // roli anon, której klucz siedzi jawnie w buildzie, więc każdy mógłby wpisać
  // dowolne wartości. Publikowanie potem „czytelnicy zgadują średnio 68%" jako
  // faktu byłoby zarzutem, który ta strona stawia sama sobie. Efekt pamięciowy
  // bierze się z porównania WŁASNEJ odpowiedzi z prawdą, nie ze średniej innych.
  const [strzal, setStrzal] = useState(50);
  const [odkryte, setOdkryte] = useState(false);

  // Adres z hashem otwiera właściwą sekcję — wejście z linku ma pokazać treść,
  // a nie zwiniętą kartę, do której trzeba jeszcze kliknąć.
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (id && MODULY.some((m) => m.id === id)) {
      setOtwarte([id]);
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ block: "start" }));
    }
  }, []);

  const przelacz = (id: string) =>
    setOtwarte((p) => {
      const nowe = p.includes(id) ? p.filter((x) => x !== id) : [...p, id];
      if (!p.includes(id)) window.history.replaceState(null, "", `#${id}`);
      return nowe;
    });

  const p = data?.podsumowanie;

  const pochodne = useMemo(() => {
    if (!data || !p) return null;
    const cele = data.cele ?? [];
    const suma = (f: (r: Statystyki["cele"][number]) => boolean) =>
      cele.filter(f).reduce((a, r) => a + (r.zadan || 0), 0);
    const glowny = (grupa: string) =>
      (data.zachowanie ?? []).filter((r) => r.grupa === grupa)
        .sort((a, b) => b.zadan - a.zadan)[0];
    const kat = (n: string) => (data.kategorie ?? []).find((r) => r.kategoria === n);
    const wszystkie = (p.zadan_ogolem || 0) + (p.testy_wlasciciela || 0);
    return {
      oryginalneWrazliwe: suma((r) => r.grupa === "oryginalne" && ["sekret", "kod"].includes(r.sciezka_typ)),
      falszowaneWrazliwe: suma((r) => r.grupa === "falszowane" && ["sekret", "kod"].includes(r.sciezka_typ)),
      falszowaneTresc: suma((r) => r.grupa === "falszowane" && r.sciezka_typ === "tresc"),
      falszowaneCele: suma((r) => r.grupa === "falszowane"),
      oryg: glowny("oryginalne"),
      falsz: glowny("falszowane"),
      wyszukiwarki: kat("wyszukiwarka"),
      uzytkownik: kat("ai_uzytkownik"),
      procTestow: wszystkie ? Math.round((1000 * p.testy_wlasciciela) / wszystkie) / 10 : null,
    };
  }, [data, p]);

  const prawda = p?.proc_wsrod_rozstrzygnietych ?? null;
  const pomylka = odkryte && prawda !== null ? Math.round(strzal - prawda) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Ruch botów AI" }]} />

      <PageHeader
        icon={Bot}
        title="Ile ruchu botów AI jest naprawdę botami AI"
        subtitle="Pomiar z realnej strony: ile żądań podających się za bota AI naprawdę przyszło z sieci operatora, pod którego się podawało"
        color="amber"
      />

      <main className="container mx-auto px-4 pb-16 max-w-4xl">
        <p className="text-lg leading-relaxed mb-8">
          Branża sprzedaje raporty widoczności w AI liczone z nagłówka, którego nikt nie
          sprawdza. Ten nagłówek nazywa się <strong>User-Agent</strong> i jest deklaracją,
          nie tożsamością — wpisać można w niego cokolwiek.
        </p>

        {/* ---------------- MODUŁ 1: zgadywanka i liczba ---------------- */}
        <Card className="mb-8 border-amber-300">
          <CardHeader>
            <CardTitle>Zanim zobaczysz liczbę — zgadnij</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p>
              Jak myślisz, ile procent ruchu „botów AI" na małej stronie jest naprawdę tym,
              za co się podaje?
            </p>

            <div className="flex items-center gap-4">
              <Slider
                value={[strzal]}
                onValueChange={(v) => setStrzal(v[0])}
                min={0}
                max={100}
                step={1}
                disabled={odkryte}
                aria-label="Twoja odpowiedź w procentach"
                className="flex-1"
              />
              <span className="w-16 text-right text-xl font-semibold tabular-nums">{strzal}%</span>
            </div>

            {!odkryte ? (
              <Button onClick={() => setOdkryte(true)} disabled={isPending || isError}>
                Sprawdź
              </Button>
            ) : (
              <div className="space-y-3 border-t pt-4">
                {isError || !p ? (
                  <p className="text-muted-foreground">
                    Nie udało się teraz pobrać aktualnych liczb. Spróbuj odświeżyć za chwilę.
                  </p>
                ) : (
                  <>
                    <p className="text-lg">
                      Spośród żądań, które <strong>dało się rozstrzygnąć</strong>, prawdziwe było{" "}
                      <strong className="text-2xl">{ulamek(prawda)}%</strong>. Licząc wszystkie,
                      także te, których rozstrzygnąć się nie da —{" "}
                      <strong>{ulamek(p.proc_calosci)}%</strong>.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Stan na {dataDlugo(p.stan_na)}. Pomiar trwa od {dataDlugo(p.pomiar_od)},
                      czyli {liczba(p.dni_pomiaru)} dni.
                    </p>
                    {Math.abs(pomylka) >= 5 && (
                      <p>
                        Twoja odpowiedź była o <strong>{Math.abs(pomylka)} punktów</strong>{" "}
                        {pomylka > 0 ? "za wysoka" : "za niska"}.
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Twojej odpowiedzi nigdzie nie zapisujemy — nie ma jej gdzie wysłać.
                      Licznik odpowiedzi otwarty dla każdego byłby dokładnie tym rodzajem
                      liczby, który ta strona krytykuje.
                    </p>
                  </>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Podajemy dwie liczby, bo mianownik zmienia wynik radykalnie. Strona o rzetelności
              pomiaru nie może opublikować liczby, której czytelnik nie odtworzy sam.
            </p>
          </CardContent>
        </Card>

        {p && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              ["oryginalne", p.oryginalne, "bot był tym, za kogo się podawał"],
              ["fałszowane", p.falszowane, "ktoś obcy użył jego nazwy"],
              ["niesprawdzone", p.niesprawdzone, "brak danych, by rozstrzygnąć"],
              ["testy właściciela", p.testy_wlasciciela, "odliczone od wszystkich liczb"],
            ].map(([etykieta, wartosc, opis]) => (
              <Card key={String(etykieta)}>
                <CardContent className="pt-5">
                  <div className="text-2xl font-semibold tabular-nums">{liczba(Number(wartosc))}</div>
                  <div className="text-sm font-medium">{etykieta}</div>
                  <div className="text-xs text-muted-foreground mt-1">{opis}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <p className="text-sm text-muted-foreground">
            Wybierz, co chcesz zobaczyć. Każda sekcja ma własny adres — da się ją podlinkować.
          </p>
          <Button variant="outline" size="sm" onClick={() => setTechnicznie((t) => !t)}>
            {technicznie ? "Pokaż po ludzku" : "Pokaż technicznie"}
          </Button>
        </div>

        <div className="space-y-3">
          {MODULY.map((m) => {
            const otwarty = otwarte.includes(m.id);
            return (
              <Card key={m.id} id={m.id}>
                <button
                  type="button"
                  onClick={() => przelacz(m.id)}
                  aria-expanded={otwarty}
                  className="w-full text-left p-5 flex items-start justify-between gap-4"
                >
                  <span>
                    <span className="block font-semibold">{m.tytul}</span>
                    <span className="block text-sm text-muted-foreground mt-1">{m.zajawka}</span>
                  </span>
                  {otwarty ? <ChevronUp className="shrink-0 mt-1" /> : <ChevronDown className="shrink-0 mt-1" />}
                </button>

                {otwarty && (
                  <CardContent className="pt-0 space-y-4">
                    {m.id === "jak-to-mozliwe" && <JakToMozliwe />}
                    {m.id === "kto-tu-chodzi" && (
                      <KtoTuChodzi wiersze={data?.wg_bota ?? []} wyszukiwarki={pochodne?.wyszukiwarki} />
                    )}
                    {m.id === "crawler-czy-czlowiek" && (
                      <CrawlerCzyCzlowiek wiersze={data?.kategorie ?? []} uzytkownik={pochodne?.uzytkownik} />
                    )}
                    {m.id === "jak-rozpoznac" && (
                      <JakRozpoznac wiersze={data?.zachowanie ?? []} pochodne={pochodne} technicznie={technicznie} />
                    )}
                    {m.id === "czego-szukaja" && (
                      <CzegoSzukaja wiersze={data?.cele ?? []} pochodne={pochodne} technicznie={technicznie} />
                    )}
                    {m.id === "ruch-wlasciciela" && (
                      <RuchWlasciciela liczbaTestow={p?.testy_wlasciciela} proc={pochodne?.procTestow} />
                    )}
                    {m.id === "kronika" && <Kronika />}
                    {m.id === "metodologia" && (
                      <Metodologia wiersze={data?.metody ?? []} zZapisana={p?.z_zapisana_metoda} technicznie={technicznie} />
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Raporty stoja PO modulach opisowych: najpierw czytelnik ma wiedziec,
            co znacza te liczby, dopiero potem dostaje narzedzie do grzebania
            w nich. Odwrotna kolejnosc dawalaby tabele bez kontekstu. */}
        <div className="mt-8">
          <RaportyBotow dniPomiaru={p?.dni_pomiaru} />
        </div>

        <Card className="mt-8">
          <CardHeader><CardTitle>Dane do pobrania</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p>
              Wszystkie liczby z tej strony są dostępne maszynowo pod adresem{" "}
              <a className="underline" href="/bot-stats.json">bot-stats.json</a>, na licencji{" "}
              <a className="underline" href="https://creativecommons.org/licenses/by/4.0/deed.pl" rel="license nofollow">
                CC BY 4.0
              </a>. Warunek jeden: podanie źródła.
            </p>
            <p className="text-sm text-muted-foreground">
              Plik zawiera wyłącznie agregaty. Nie ma w nim adresów IP ani pełnych ścieżek.
            </p>
          </CardContent>
        </Card>

      </main>
      <Footer />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Moduły                                                              */
/* ------------------------------------------------------------------ */

const Tabela = ({ naglowki, children }: { naglowki: string[]; children: React.ReactNode }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b">
          {naglowki.map((n) => <th key={n} className="text-left py-2 pr-4 font-medium">{n}</th>)}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const JakToMozliwe = () => (
  <>
    <p>
      Wyobraź sobie, że wysyłasz list i piszesz na kopercie cudze nazwisko jako nadawcę.
      Poczta go dostarczy — nikt nie sprawdza, czy nadawca jest tym, za kogo się podaje.
      Dokładnie tak działa nagłówek User-Agent: bot <em>deklaruje</em>, czym jest, a serwer
      tę deklarację przyjmuje.
    </p>
    <p>
      Napisanie programu, który przedstawia się jako GPTBot, zajmuje jedną linijkę. Nie
      trzeba do tego żadnych uprawnień ani wiedzy — wystarczy wpisać tekst.
    </p>
    <p>
      <strong>Weryfikacja polega na sprawdzeniu, czy list rzeczywiście wyszedł z podanego
      adresu.</strong> Duzi operatorzy publikują listy adresów sieciowych swoich botów.
      Jeśli żądanie przyszło spoza takiej listy, a przedstawia się nazwą operatora, to nie
      jest ten operator.
    </p>
    <p className="text-sm text-muted-foreground">
      Narzędzia pokazujące „ruch botów AI" w większości zliczają deklaracje. Nie dlatego,
      że ktoś oszukuje — weryfikacja kosztuje zapytania sieciowe, a deklaracja jest za darmo.
    </p>
  </>
);

const KtoTuChodzi = ({ wiersze, wyszukiwarki }: {
  wiersze: Statystyki["wg_bota"];
  wyszukiwarki?: Statystyki["kategorie"][number];
}) => (
  <>
    <p className="font-medium">
      Im bardziej rozpoznawalny bot, tym częściej ktoś się pod niego podszywa — bo strony
      przepuszczają znane nazwy. Liczba podszyć mówi o popularności marki, nie o jej
      uczciwości.
    </p>
    <Tabela naglowki={["Bot", "Operator", "Oryginalne", "Fałszowane", "Niesprawdzone"]}>
      {wiersze.map((r) => (
        <tr key={`${r.operator}-${r.bot}`} className="border-b last:border-0">
          <td className="py-2 pr-4 font-medium">{r.bot}</td>
          <td className="py-2 pr-4 text-muted-foreground">{r.operator}</td>
          <td className="py-2 pr-4 tabular-nums">{liczba(r.oryginalne)}</td>
          <td className="py-2 pr-4 tabular-nums">{liczba(r.falszowane)}</td>
          <td className="py-2 pr-4 tabular-nums">{liczba(r.niesprawdzone)}</td>
        </tr>
      ))}
    </Tabela>
    <p className="text-sm text-muted-foreground">
      W tabeli są boty z co najmniej trzema żądaniami — przy jednym trafieniu nazwa
      w zestawieniu to szum, a nie dana.
    </p>
    {wyszukiwarki && (
      <>
        <p>
          Żądań podających się za <strong>wyszukiwarkę</strong>, które okazały się podrobione,
          jest w tym pomiarze <strong>{liczba(wyszukiwarki.falszowane)}</strong>.
        </p>
        <p>
          <strong>Googlebota strony weryfikują od dwudziestu lat</strong> — mechanizm jest
          opisany w dokumentacji, wbudowany w serwery i powszechnie stosowany, więc podszycie
          się pod niego nic nie daje. Botów AI nie weryfikuje prawie nikt. To nie różnica
          w technologii, tylko w tym, ile lat dana nazwa jest sprawdzana.
        </p>
      </>
    )}
  </>
);

const CrawlerCzyCzlowiek = ({ wiersze, uzytkownik }: {
  wiersze: Statystyki["kategorie"];
  uzytkownik?: Statystyki["kategorie"][number];
}) => (
  <>
    <ul className="space-y-2 list-disc pl-5">
      <li><Badge variant="secondary">ai_crawler</Badge> — zbiera treść do przyszłego indeksu modelu. Chodzi sam, wedle własnego harmonogramu.</li>
      <li><Badge variant="secondary">ai_uzytkownik</Badge> — <strong>konkretny człowiek zadał pytanie w czacie, a model poszedł po tę stronę</strong>. Za każdym takim żądaniem stoi żywa osoba.</li>
      <li><Badge variant="secondary">wyszukiwarka</Badge> — klasyczny indeks. Granica z AI już nie istnieje: Googlebot karmi też AI Overviews.</li>
      <li><Badge variant="secondary">narzedzie_seo</Badge> — komercyjne crawlery analityczne.</li>
    </ul>
    <Tabela naglowki={["Kategoria", "Żądań", "Oryginalne", "Fałszowane", "Tożsamości"]}>
      {wiersze.map((r) => (
        <tr key={r.kategoria} className="border-b last:border-0">
          <td className="py-2 pr-4 font-medium">{r.kategoria}</td>
          <td className="py-2 pr-4 tabular-nums">{liczba(r.zadan)}</td>
          <td className="py-2 pr-4 tabular-nums">{liczba(r.oryginalne)}</td>
          <td className="py-2 pr-4 tabular-nums">{liczba(r.falszowane)}</td>
          <td className="py-2 pr-4 tabular-nums">{liczba(r.roznych_tozsamosci)}</td>
        </tr>
      ))}
    </Tabela>
    {uzytkownik && (
      <p>
        Kategoria <strong>ai_uzytkownik</strong> to {liczba(uzytkownik.zadan)} żądań, z czego
        podrobionych było {liczba(uzytkownik.falszowane)}. To grupa, na której właścicielom
        stron zależy najbardziej — i jednocześnie ta, w której deklaracji ufa się najchętniej,
        bo brzmi jak dowód, że ktoś realnie o nas pytał.
      </p>
    )}
  </>
);

const JakRozpoznac = ({ wiersze, pochodne, technicznie }: {
  wiersze: Statystyki["zachowanie"];
  pochodne: { oryg?: Statystyki["zachowanie"][number]; falsz?: Statystyki["zachowanie"][number] } | null;
  technicznie: boolean;
}) => (
  <>
    <p>
      Weryfikacja po adresie wymaga list, których nie ma dla każdego operatora. Ale obie grupy
      zachowują się inaczej na tyle wyraźnie, że da się je rozdzielić <strong>bez żadnej
      listy</strong> — a to znaczy, że metoda zadziała też dla operatorów, którzy jeszcze
      nie powstali.
    </p>

    {pochodne?.oryg && pochodne?.falsz && (
      <>
        <p>
          <strong>Pierwszy sygnał: rozmiar odpowiedzi.</strong> Prawdziwe boty dostają średnio{" "}
          {liczba(pochodne.oryg.sredni_rozmiar)} bajtów, podszywacze{" "}
          {liczba(pochodne.falsz.sredni_rozmiar)}. Prawdziwy bot prosi o istniejącą stronę
          i dostaje jej treść; podszywacz prosi o pliki, których nie ma, i dostaje krótką
          stronę błędu.
        </p>
        <p>
          <strong>Drugi sygnał: odsetek błędów.</strong> {ulamek(pochodne.oryg.proc_bledow)}%
          wobec {ulamek(pochodne.falsz.proc_bledow)}%. Prawdziwy crawler idzie po mapie
          strony — <strong>wie, co istnieje</strong>. Podszywacz zgaduje adresy z gotowej listy.
        </p>
      </>
    )}

    {technicznie && (
      <Tabela naglowki={["Grupa", "Okres", "Żądań", "Odbitych", "% błędów", "Śr. rozmiar", "Ścieżek"]}>
        {wiersze.map((r) => (
          <tr key={`${r.grupa}-${r.okres}`} className="border-b last:border-0">
            <td className="py-2 pr-4 font-medium">{r.grupa}</td>
            <td className="py-2 pr-4 text-muted-foreground">{OKRESY[r.okres] ?? r.okres}</td>
            <td className="py-2 pr-4 tabular-nums">{liczba(r.zadan)}</td>
            <td className="py-2 pr-4 tabular-nums">{liczba(r.odbite)}</td>
            <td className="py-2 pr-4 tabular-nums">{ulamek(r.proc_bledow)}%</td>
            <td className="py-2 pr-4 tabular-nums">{liczba(r.sredni_rozmiar)} B</td>
            <td className="py-2 pr-4 tabular-nums">{liczba(r.roznych_sciezek)}</td>
          </tr>
        ))}
      </Tabela>
    )}

    <div className="border-l-2 border-amber-400 pl-4 space-y-2 text-sm">
      <p>
        <strong>To obserwacja z jednego przypadku, nie prawo.</strong> Ruch podrobiony w tym
        pomiarze był zdominowany przez jedną serię skanowania z jednej sieci.
      </p>
      <p>
        <strong>I to my przecięliśmy ten szereg na pół.</strong> 5 września 2026 zmieniliśmy
        zachowanie serwera: ścieżki typowe dla skanerów przestały dostawać stronę aplikacji
        z kodem 200, a zaczęły dostawać prawdziwe 404. To zmienia oba powyższe wskaźniki
        bez żadnej zmiany w zachowaniu botów — dlatego tabela ma kolumnę „okres" i pokazuje
        obie części osobno, zamiast udawać ciągłość.
      </p>
    </div>
  </>
);

const CzegoSzukaja = ({ wiersze, pochodne, technicznie }: {
  wiersze: Statystyki["cele"];
  pochodne: { oryginalneWrazliwe: number; falszowaneWrazliwe: number; falszowaneTresc: number; falszowaneCele: number } | null;
  technicznie: boolean;
}) => (
  <>
    <p>
      Nie publikujemy konkretnych adresów, o które pytano — opublikowana lista wrażliwych
      ścieżek byłaby gotową mapą dla następnego skanera. Wystarczą typy.
    </p>
    <Tabela naglowki={technicznie ? ["Grupa", "Typ ścieżki", "Żądań", "% grupy"] : ["Grupa", "Typ ścieżki", "% grupy"]}>
      {wiersze.map((r) => (
        <tr key={`${r.grupa}-${r.sciezka_typ}`} className="border-b last:border-0">
          <td className="py-2 pr-4 font-medium">{r.grupa}</td>
          <td className="py-2 pr-4">{r.sciezka_typ}</td>
          {technicznie && <td className="py-2 pr-4 tabular-nums">{liczba(r.zadan)}</td>}
          <td className="py-2 pr-4 tabular-nums">{ulamek(r.proc_grupy)}%</td>
        </tr>
      ))}
    </Tabela>
    {pochodne && (
      <p>
        Boty potwierdzone zapytały o pliki z kodem lub sekretami{" "}
        <strong>{liczba(pochodne.oryginalneWrazliwe)}</strong> razy. Podszywacze —{" "}
        <strong>{liczba(pochodne.falszowaneWrazliwe)}</strong> razy. Odwrotnie z treścią:
        podszywacze sięgnęli po nią {liczba(pochodne.falszowaneTresc)} razy na{" "}
        {liczba(pochodne.falszowaneCele)} wszystkich swoich żądań.
      </p>
    )}
    <p>
      <strong>Zbiory celów obu grup prawie się nie przecinają.</strong> To nie są dwa rodzaje
      botów robiące to samo z różną intensywnością — to dwa różne zajęcia wykonywane pod tymi
      samymi nazwami.
    </p>
    <p className="text-sm text-muted-foreground">
      Stąd właściwa obrona, która nie polega na blokowaniu: skanerzy nie znaleźli niczego, bo
      pliki, o które pytali, nie istnieją. Blokowanie po nazwie bota jest bez sensu — nazwa
      jest fałszywa z definicji. Blokowanie po sieci uderza też w ruch legalny.
    </p>
  </>
);

const RuchWlasciciela = ({ liczbaTestow, proc }: { liczbaTestow?: number; proc?: number | null }) => (
  <>
    <p>
      Przez kilka dni sprawdzałem, czy roboty widzą treść tego serwisu — podszywając się
      kolejno pod ClaudeBota, GPTBota i PerplexityBota. Zostawiłem{" "}
      <strong>{liczba(liczbaTestow)} wizyt</strong>, które w każdym zwykłym narzędziu
      analitycznym wyglądałyby jak zainteresowanie sztucznej inteligencji moją stroną.
      To <strong>{ulamek(proc ?? null)}%</strong> całego ruchu robotów w tym okresie.
    </p>
    <p><strong>Nie usuwam ich. Odliczam.</strong> Wszystkie liczby na tej stronie są policzone po ich odjęciu.</p>
    <p>
      Reguła jest mechaniczna i podana z góry: wizyta trafia do kategorii „testy właściciela",
      jeśli przyszła z sieci, z której pracuję, <em>albo</em> niesie umówiony znacznik
      w podpisie — niezależnie od tego, jak wypada dla statystyki. Wiarygodność bierze się
      z tego, że reguła jest automatyczna i opisana, a nie z zapewnienia, że jestem uczciwy.
    </p>
    <p className="font-medium">
      Jeśli ktoś testujący własną stronę potrafi w kilka dni wytworzyć {ulamek(proc ?? null)}%
      jej „ruchu AI", to każdy licznik oparty na deklaracji jest podatny na zafałszowanie
      także bez złych intencji.
    </p>
  </>
);

const Kronika = () => (
  <>
    <h3 className="font-semibold">4 września 2026, 11:06 — sześć tożsamości w dziewiętnaście sekund</h3>
    <p>
      Z jednej sieci w Stanach Zjednoczonych (AS1004) przyszła seria żądań, w której ten sam
      ruch przedstawiał się kolejno jako <strong>sześć różnych botów</strong>: CCBot,
      ChatGPT-User, ClaudeBot, GPTBot, OAI-SearchBot i PerplexityBot. Całość trwała
      dziewiętnaście sekund. Żądania dotyczyły plików konfiguracyjnych, kopii zapasowych
      i map kodu źródłowego. <strong>Nie znalazły nic</strong> — żaden z tych plików tu nie istnieje.
    </p>
    <p className="text-sm text-muted-foreground">
      Piszemy, że <em>żądania przyszły z sieci AS1004</em>, a nie że „AS1004 skanuje".
      Operator sieci wynajmuje serwery i sprawca jest jego klientem, nie nim. Pierwsze
      sformułowanie to weryfikowalna obserwacja, drugie byłoby zarzutem wobec podmiotu,
      którego nie znamy.
    </p>
    <h3 className="font-semibold pt-2">5 września 2026 — koniec z odpowiedzią „200 OK" na pytanie o cudzy panel</h3>
    <p>
      Analiza tej serii ujawniła, że część pytań o nieistniejące pliki dostawała od nas kod
      200 i stronę aplikacji zamiast błędu 404. Skaner odczytuje to jako „coś tu jest"
      i wraca. Zostało poprawione — a przy okazji okazało się, że zaniżało to{" "}
      <strong>nasz własny wskaźnik błędów</strong>, czyli jeden z sygnałów, którymi
      rozpoznajemy skanowanie. Serwer psuł pomiar, który sam zasilał.
    </p>
  </>
);

const Metodologia = ({ wiersze, zZapisana, technicznie }: {
  wiersze: Statystyki["metody"];
  zZapisana?: number;
  technicznie: boolean;
}) => (
  <>
    <p><strong>Lista adresów operatora.</strong> Najpewniejsza. OpenAI, Anthropic, Perplexity, Google i Microsoft publikują zakresy adresów swoich botów. Wynik jest jednoznaczny w obie strony.</p>
    <p><strong>Numer sieci operatora.</strong> Dla tych, którzy listy nie publikują, ale mają własną, znaną sieć. Słabsze, bo sieć bywa duża — wciąż rozstrzygające przy nazwach, których nikt inny nie ma prawa używać.</p>
    <p>
      <strong>Odwrotny DNS w trzech krokach (FCrDNS).</strong> Metoda stosowana od lat do
      weryfikacji Googlebota. Pominięcie któregokolwiek kroku czyni ją bezwartościową:
    </p>
    <ol className="list-decimal pl-5 space-y-1 text-sm">
      <li>zapytaj o nazwę domenową przypisaną do adresu, z którego przyszło żądanie,</li>
      <li>sprawdź, czy ta nazwa <strong>kończy się</strong> domeną operatora — nie „zawiera jej”, bo <code>googlebot.com.przyklad.pl</code> zawiera, a nie jest,</li>
      <li>zapytaj o adres tej nazwy i sprawdź, czy wraca ten sam adres, od którego zaczęliśmy.</li>
    </ol>
    <p className="text-sm">
      <strong>Uczciwe zastrzeżenie:</strong> w naszym pomiarze ta metoda nie potwierdziła
      jeszcze nikogo — same odmowy. Może działać poprawnie i trafiać wyłącznie na
      podszywaczy, ale dopóki nie potwierdzi żadnego prawdziwego bota, traktujemy ją jako
      <em> zaimplementowaną, lecz niesprawdzoną</em>, i nie opieramy na niej wniosków.
    </p>
    <p>
      <strong>Podpis kryptograficzny (Web Bot Auth).</strong> Powstający standard, docelowo
      najlepszy z możliwych. Na razie tylko odnotowujemy obecność nagłówków podpisu —{" "}
      <strong>nie sprawdzamy ich poprawności</strong>, więc nie jest to weryfikacja i nie
      liczymy jej jako takiej.
    </p>

    {technicznie && (
      <Tabela naglowki={["Metoda", "Żądań", "Potwierdzone", "Zaprzeczone"]}>
        {wiersze.map((r) => (
          <tr key={r.metoda} className="border-b last:border-0">
            <td className="py-2 pr-4 font-medium">{r.metoda}</td>
            <td className="py-2 pr-4 tabular-nums">{liczba(r.zadan)}</td>
            <td className="py-2 pr-4 tabular-nums">{liczba(r.potwierdzone)}</td>
            <td className="py-2 pr-4 tabular-nums">{liczba(r.zaprzeczone)}</td>
          </tr>
        ))}
      </Tabela>
    )}
    <p className="text-sm text-muted-foreground">
      Tabela obejmuje {liczba(zZapisana)} żądań — te, przy których zapisaliśmy, <em>czym</em>{" "}
      rozstrzygnięto. Wcześniejsze wpisy mają to pole puste nie dlatego, że weryfikacja
      zawiodła, tylko dlatego, że kolumna powstała później niż licznik.
    </p>

    <h3 className="font-semibold pt-2">Co znaczy „niesprawdzone”</h3>
    <p>
      Że <strong>nie umiemy rozstrzygnąć</strong> — nie że bot jest podejrzany. Wrzucenie
      tych żądań do „prawdziwych" zawyżyłoby wynik, a do „podrobionych" byłoby oskarżeniem
      bez dowodu. Zostają osobno.
    </p>
    <p className="font-medium">
      To jest cała różnica między tą stroną a panelem, który sprzedaje wskaźnik. Panele nie
      mają kategorii „nie wiem", bo źle wygląda. My mamy, bo bez niej pozostałe liczby nic
      nie znaczą.
    </p>

    <h3 className="font-semibold pt-2">Sprawdź nas</h3>
    <p>
      To, o co prosimy boty, i to, co im udostępniamy, leży otworem w dwóch plikach
      tekstowych: <a className="underline" href="/robots.txt">robots.txt</a> (zasady,
      o które prosimy) i <a className="underline" href="/llms.txt">llms.txt</a> (mapa
      treści przygotowana dla modeli). Możesz porównać, czy zgadzają się z tym, co
      opisaliśmy wyżej. To surowe pliki konfiguracyjne, nie artykuły — otwieramy je
      tutaj po to, żeby dało się nas skontrolować.
    </p>

    <h3 className="font-semibold pt-2">Czego celowo nie zapisujemy</h3>
    <p>
      Adresów IP ani niczego, co wskazuje osobę. Do rozpoznania podszywacza wystarczy numer
      sieci i kraj — jedno i drugie opisuje serwerownię, nie człowieka. Nie zapisujemy też
      treści zapytań użytkowników: żaden bot jej nie przekazuje i nie przekaże, to cudze dane.
    </p>
  </>
);

export default BotyAi;
