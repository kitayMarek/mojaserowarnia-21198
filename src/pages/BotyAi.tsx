import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import RaportyBotow from "@/components/RaportyBotow";
import SprawdzUSiebie from "@/components/SprawdzUSiebie";
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
  /** Ruch bez zadnej deklaracji. POZA zadan_ogolem i poza oboma procentami —
   *  nigdy nie zlozyl deklaracji, ktorej moglibysmy nie uwierzyc. */
  bez_podpisu: number;
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
  { id: "polowanie-na-env", tytul: "Trzy czwarte ruchu skanerów to polowanie na jeden plik", zajawka: "44 adresy z .env, 197 żądań. I sprawdzone w danych: czy inna nazwa cokolwiek daje." },
  { id: "ruch-wlasciciela", tytul: "Ile tego ruchu robi sam właściciel strony?", zajawka: "Odliczam własne testy i pokazuję ile ich było. Oto dlaczego to ważne." },
  { id: "bez-podpisu", tytul: "Ruch, który nie przedstawia się wcale", zajawka: "Puste pole User-Agent. Kim są — nie wiemy. Czego szukają — wiemy dokładnie." },
  { id: "kronika", tytul: "Kronika zdarzeń", zajawka: "Sześć tożsamości w dziewiętnaście sekund i inne rzeczy warte zapamiętania." },
  { id: "metodologia", tytul: "Jak to jest liczone?", zajawka: "Listy adresów, odwrotny DNS, podpisy — i co znaczy „nie wiadomo”." },
  { id: "llms-txt", tytul: "Co wiemy o llms.txt", zajawka: "Cztery pobrania, z czego trzy wywołaliśmy sami. I mocniejsze badanie, które mówi to samo." },
  { id: "kod-otwarty", tytul: "Kod jest otwarty", zajawka: "Cały licznik na licencji MIT — razem ze spisem błędów, które popełniliśmy po drodze." },
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

  // Odsylacz WEWNATRZ strony nie moze byc zwyklym <a href="#...">: efekt wyzej
  // czyta hash tylko przy wejsciu, wiec klikniecie przewijaloby do ZWINIETEJ
  // karty. Ta funkcja otwiera modul i przewija — i celowo NIE rusza adresu:
  // history.replaceState liczy sie w Google Analytics jako osobna odslona,
  // przez co ta strona pokazywala 2,01 odslony na uzytkownika. Adres zmienia
  // wiec tylko `przelacz` (klikniecie w sam modul), gdzie jest to potrzebne
  // do podlinkowania sekcji.
  const otworzModul = (id: string) => {
    setOtwarte((p) => (p.includes(id) ? p : [...p, id]));
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "smooth" }));
  };

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
        {/* Odsylacz do wersji angielskiej. Zwykly <a>, nie <Link>: wersja EN nie
            jest trasa React, tylko statyczna strona skladana przez workera z tych
            samych widokow pub_*. Temat jest globalny, serowarstwo nie — dlatego
            po angielsku jest ta jedna strona, a nie caly serwis. */}
        <p className="text-sm text-muted-foreground mb-6">
          <a
            href="/en/ai-bots"
            hrefLang="en"
            lang="en"
            className="underline underline-offset-2"
          >
            Read this page in English
          </a>
        </p>

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

        {/* Ruch bez deklaracji CELOWO nie jest piatym kafelkiem. Czwórka wyżej to
            rozklad jednej calosci; postawienie obok niej liczby, ktora do tej
            calosci nie nalezy, sugerowaloby udzial w sumie — czyli dokladnie to,
            czemu zapobiega osobna kolumna w widoku. Stoi wiec pod gridem, w jednym
            zdaniu, z odsylaczem do modulu z pelnym wyjasnieniem. */}
        {p && p.bez_podpisu > 0 && (
          <p className="text-sm text-muted-foreground mb-8">
            Osobno, poza powyższym rozkładem i poza oboma procentami:{" "}
            <strong className="text-foreground tabular-nums">{liczba(p.bez_podpisu)}</strong>{" "}
            żądań nie przedstawiło się <em>żadną</em> nazwą — nie złożyły deklaracji, której
            można by nie uwierzyć.{" "}
            <button
              type="button"
              onClick={() => otworzModul("bez-podpisu")}
              className="underline underline-offset-2 text-foreground"
            >
              Co o nich wiemy
            </button>
            .
          </p>
        )}

        {/* NAJCZESTSZA REAKCJA CZYTELNIKOW, nie hipoteza: pod postem
            zapowiadajacym te strone trzy osoby niezaleznie napisaly wariant
            "przeciez to juz jest w Cloudflare / istnieja narzedzia / kiedys
            wystarczal webalizer". Wszyscy slysza "statystyki botow" i mysla
            "panel z liczbami" — a panel maja. Dlatego odpowiedz stoi WYSOKO
            i jest zawsze widoczna, a nie schowana w module do rozwiniecia. */}
        <Card className="mb-8 border-amber-300">
          <CardHeader>
            <CardTitle>„Przecież mam to w Cloudflare"</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              To najczęstsza reakcja na tę stronę i trzeba ją potraktować poważnie, bo jest
              rozsądna: panele hostingowe pokazują ruch botów AI od dawna, więc po co liczyć
              to samo drugi raz.
            </p>
            <p>
              <strong>Po to, że one liczą deklaracje.</strong> 3 września 2026 sprawdziliśmy,
              ile taki licznik jest wart. Dwa żądania wysłane zwykłym poleceniem{" "}
              <code>curl</code> z polskiego łącza, z nagłówkiem podającym się za
              PerplexityBota, podbiły w panelu Cloudflare licznik „AI Answer retrievals"
              z 16 na 18, a samego Perplexity z 5 na 7.{" "}
              <strong>Żadne z tych dwóch żądań nie przyszło od Perplexity.</strong>
            </p>
            <p className="font-medium">
              Nie trzeba nam wierzyć — to zajmuje dwie minuty i można powtórzyć na własnej
              domenie. Wystarczy jedno polecenie z podmienionym nagłówkiem i spojrzenie
              w panel przed i po.
            </p>
            <p>
              To nie jest zarzut o nieuczciwość. Sprawdzenie tożsamości kosztuje zapytania
              sieciowe przy każdym żądaniu, a przyjęcie deklaracji jest darmowe — przy skali
              takiego dostawcy to realna różnica. Skutek jest jednak taki, że{" "}
              <strong>licznik mierzy, co bot o sobie napisał, a nie kto naprawdę przyszedł</strong>.
              {prawda !== null && (
                <> W naszym pomiarze rozjazd wynosi{" "}
                  <strong>{ulamek(Math.round(10 * (100 - prawda)) / 10)}%</strong> wśród
                  żądań, które dało się rozstrzygnąć.</>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              Pada też regularnie, że to kwestia konfiguracji — że trzeba „oddać domenę
              w całości". Nie w tym rzecz: ten serwis stoi za Cloudflare w stu procentach
              i panel dalej przypisuje żądanie operatorowi na podstawie samego podpisu.
            </p>

            <h3 className="font-semibold pt-2">„Kiedyś do tego wystarczał zwykły analizator logów"</h3>
            <p>
              Wystarczał i nadal wystarcza — do liczenia. Narzędzia rozbijające ruch po
              nagłówku User-Agent istnieją od lat dziewięćdziesiątych i robią to dobrze.{" "}
              <strong>Różnica nie polega na tym, że liczymy, tylko na tym, że sprawdzamy.</strong>{" "}
              Analizator sprzed dwudziestu lat pokaże wizyty GPTBota; kafelki wyżej pokazują,
              ile z nich przeszło weryfikację tożsamości. To są dwie różne liczby i tylko
              jedna z nich nadaje się pod decyzje.
            </p>
          </CardContent>
        </Card>

        <SprawdzUSiebie />

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
                    {m.id === "polowanie-na-env" && <PolowanieNaEnv />}
                    {m.id === "ruch-wlasciciela" && (
                      <RuchWlasciciela liczbaTestow={p?.testy_wlasciciela} proc={pochodne?.procTestow} />
                    )}
                    {m.id === "bez-podpisu" && <BezPodpisu liczba_={p?.bez_podpisu} />}
                    {m.id === "kronika" && <Kronika />}
                    {m.id === "llms-txt" && <LlmsTxt />}
                    {m.id === "kod-otwarty" && <KodOtwarty />}
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
          Podszywanie zdarza się <strong>każdej</strong> rozpoznawalnej nazwie, także
          wyszukiwarkom — zdemaskowanych żądań podających się za wyszukiwarkę jest w tym
          pomiarze <strong>{liczba(wyszukiwarki.falszowane)}</strong>. Nieporównywalne są
          proporcje: przy wyszukiwarkach podrobiona jest mniejszość, przy części botów AI
          nie ma ani jednego potwierdzonego żądania.
        </p>
        <p>
          <strong>Googlebota strony weryfikują od dwudziestu lat</strong> — mechanizm jest
          opisany w dokumentacji, wbudowany w serwery i powszechnie stosowany, więc podszycie
          się pod niego <em>zostaje wykryte</em>. Botów AI nie weryfikuje prawie nikt, więc
          podszycie się pod nie po prostu działa i nikt go nie liczy. To nie różnica
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
      Nie publikujemy konkretnych adresów, o które pytano u NAS — lista naszych wrażliwych
      ścieżek byłaby gotową mapą dla następnego skanera. Tutaj wystarczą typy. Osobno,
      w sekcji o polowaniu na jeden plik, pokazujemy nazwy, które w słownikach skanerów
      są od lat: tam ukrywanie nikomu nie pomaga, a sprawdzenie własnej strony owszem.
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

// Liczby poniżej to zamknięty odczyt z okna pomiaru, nie dane na żywo — ten sam,
// który stoi w mirrorze public/boty-ai.html. Jeśli będą aktualizowane, to w obu
// miejscach naraz, inaczej wersja dla ludzi i wersja dla botów się rozjadą.
const PolowanieNaEnv = () => (
  <>
    <p>
      Przez cały pomiar skanery poprosiły nas o <strong>44 różne adresy zawierające{" "}
      <code>.env</code></strong> — łącznie 197 razy. To około trzech czwartych wszystkiego,
      czego u nas szukały. Reszta, czyli <code>.git</code>, panele administracyjne i pliki
      konfiguracyjne, jest przy tym marginesem.
    </p>
    <p>
      <strong>Ale nie szukają <code>.env</code>. Szukają jego kopii.</strong> Tylko w naszych
      logach pojawiło się dziewiętnaście końcówek:
    </p>
    <p className="text-sm">
      <code>.bak</code> · <code>.old</code> · <code>.save</code> · <code>.swp</code> ·{" "}
      <code>.backup</code> · <code>.prod</code> · <code>.production</code> · <code>.dev</code> ·{" "}
      <code>.development</code> · <code>.stage</code> · <code>.staging</code> ·{" "}
      <code>.test</code> · <code>.uat</code> · <code>.ci</code> · <code>.docker</code> ·{" "}
      <code>.live</code> · <code>.local</code> · <code>.example</code> · <code>.sample</code>
    </p>
    <p>
      Do tego ten sam plik w dwudziestu czterech katalogach: <code>/api/</code>,{" "}
      <code>/admin/</code>, <code>/app/</code>, <code>/administrator/</code>,{" "}
      <code>/backend/</code>, <code>/public/</code>, <code>/config/</code>, <code>/wp/</code>{" "}
      i tak dalej.
    </p>
    <p>
      Nikt nie liczy, że wgrałeś hasła na serwer. Liczą, że{" "}
      <strong>zrobiłeś kopię przed zmianą i o niej zapomniałeś</strong>.
    </p>
    <p className="text-sm text-muted-foreground">
      Warto zauważyć dwie ostatnie końcówki: <code>.example</code> i <code>.sample</code> to
      pliki wgrywane <em>celowo</em>, jako wzór do wypełnienia. Haseł nie zawierają — ale
      zdradzają <strong>nazwy zmiennych</strong>, czyli mówią czytającemu, czego szukać dalej.
    </p>

    <h3 className="font-semibold pt-2">Czy pomaga nazwanie pliku inaczej?</h3>
    <p>
      Sprawdziliśmy w danych, bo pytanie jest naturalne. Forma bez kropki —{" "}
      <code>.envStary</code>, <code>.envKopia</code> —{" "}
      <strong>nie pojawiła się w naszych logach ani razu</strong>. Jedyny wariant bez kropki,
      o który ktokolwiek pytał, to <code>.env~</code>, czyli plik zapasowy zostawiany
      automatycznie przez edytory tekstu.
    </p>
    <p>
      Czyli tak: nietypowa nazwa faktycznie omija dzisiejsze słowniki.{" "}
      <strong>Tylko że to jest ukrywanie, nie zabezpieczanie</strong> — i przestaje działać
      w trzech sytuacjach, z których żadna nie zależy od nazwy:
    </p>
    <ul className="list-disc pl-5 space-y-1">
      <li>
        <strong>Słowniki rosną.</strong> <code>.env~</code> już w nich jest. Dopisanie
        kolejnych wariantów to kwestia czasu i niczyjej decyzji.
      </li>
      <li>
        <strong>Katalog daje się wylistować.</strong> Wtedy widać wszystkie nazwy naraz
        i pomysłowość nie ma znaczenia.
      </li>
      <li>
        <strong>Wyszedł katalog <code>.git</code>.</strong> To u nas <em>najczęściej</em>{" "}
        odpytywany adres w ogóle. Z niego odtwarza się każdą nazwę pliku, jaka kiedykolwiek
        trafiła do zapisu — a często i jej zawartość, także skasowaną.
      </li>
    </ul>

    <h3 className="font-semibold pt-2">Co naprawdę chroni, od najmocniejszego</h3>
    <ol className="list-decimal pl-5 space-y-1">
      <li>
        <strong>Sekret w ogóle nie leży w pliku.</strong> Klucze serwera trzymamy w sekretach
        hostingu, nie w repozytorium. Czego nie ma, tego nie znajdzie żaden skaner.
      </li>
      <li>
        <strong>Plik nigdy nie trafia do katalogu publicznego.</strong> Nasz <code>.env</code>{" "}
        leży w katalogu głównym projektu, a na serwer idzie wyłącznie zawartość{" "}
        <code>public/</code>. To zabezpieczenie wynika ze struktury, nie z czyjejś czujności.
      </li>
      <li>
        <strong>Serwer odmawia wszystkim adresom zaczynającym się od kropki.</strong> Druga,
        niezależna warstwa: nawet gdyby taki plik przypadkiem znalazł się wśród publicznych,
        serwer i tak odpowie „nie znaleziono".
      </li>
      <li>
        <strong>I dopiero na końcu — nietypowa nazwa.</strong> Ma sens tam, gdzie pierwszych
        trzech rzeczy zrobić się nie da: na współdzielonym hostingu bez dostępu do
        konfiguracji. Jako jedyne zabezpieczenie jest słaba; jako czwarta w kolejności —
        nie szkodzi.
      </li>
    </ol>

    <h3 className="font-semibold pt-2">Jak sprawdzić u siebie w pół minuty</h3>
    <p>
      Wpisz w przeglądarce swój adres z dopiskiem <code>/.env</code>, a potem{" "}
      <code>/.git/config</code>. <strong>Powinieneś zobaczyć stronę „nie znaleziono".</strong>{" "}
      Jeśli zobaczysz cokolwiek innego — zwłaszcza tekst z wielkimi literami i znakami
      równości — masz problem do naprawienia dzisiaj, a nie w wolnej chwili.
    </p>
    <p>
      Potem to samo z końcówkami z listy wyżej, zaczynając od <code>.env.bak</code> i{" "}
      <code>.env.old</code>. Na koniec sprawdź, czy serwer nie wyświetla zawartości katalogów
      — wpisz adres samego katalogu, na przykład <code>/config/</code>.
    </p>
    <p className="text-sm text-muted-foreground">
      Te nazwy publikujemy świadomie. Wszystkie są w słownikach skanerów od lat — pokazanie
      ich nie uczy nikogo niczego nowego, za to pozwala sprawdzić własną stronę. Milczenie
      zostawiałoby tę wiedzę wyłącznie tym, którzy z niej korzystają. Nadal jednak nie
      pokazujemy <em>naszych</em> ścieżek: w tabelach wyżej są wyłącznie typy, a tutaj —
      wyłącznie adresy, które dostały u nas błąd.
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

const BezPodpisu = ({ liczba_ }: { liczba_?: number }) => (
  <>
    <p>
      Wszystkie liczby wyżej dotyczą żądań, które <em>podały jakąś nazwę</em> — bo tylko
      takiej deklaracji można nie uwierzyć. Ale część ruchu nie podaje żadnej. Pole
      User-Agent bywa puste albo zawiera nazwę, której nie ma na żadnej liście: skrypt,
      monitoring, czyjeś narzędzie napisane wczoraj.
    </p>
    <p>
      Od 7 września 2026 liczymy także ten ruch. Do tej pory{" "}
      <strong>{liczba(liczba_)} żądań</strong>.
    </p>
    <p>
      <strong>Ta pozycja mierzy się krócej niż reszta strony</strong> — od 7 września 2026,
      a nie od początku pomiaru. Dopóki liczba jest mała, nie wyciągaj z niej wniosków: zero
      na starcie licznika znaczy tyle, że licznik właśnie ruszył. Ta strona zaliczyła już ten
      błąd raz — patrz akapit niżej.
    </p>
    <p className="font-medium">
      Ta liczba stoi osobno i nie wchodzi do żadnego procentu wyżej.
    </p>
    <p>
      Liczba nagłówkowa tej strony mówi, ile ruchu <em>podającego się</em> za bota AI jest
      prawdziwe. Wrzucenie do mianownika czegoś, co nigdy takiej deklaracji nie złożyło,
      zmieniłoby to, co ta liczba mierzy — z dnia na dzień i bez ostrzeżenia dla czytelnika.
      Dlatego procenty znaczą dokładnie to samo, co znaczyły wczoraj.
    </p>
    <p>
      <strong>Kim są, nie dowiemy się.</strong> Nie zostawili nazwy, a adresów IP świadomie
      nie zapisujemy. Ale <em>czego szukają</em>, wiemy dokładnie — i to jest ciekawsza
      informacja, bo intencję widać w celach, nie w narzędziu. Monitoring pyta o stronę
      główną i nic więcej. Skaner pyta o pliki konfiguracyjne i kopie zapasowe. Czytnik pyta
      o treść. Rozbicie na cele jest w raporcie „Ruch bez podpisu" niżej; ścieżki wrażliwe
      pokazujemy tam wyłącznie jako liczbę, bo opublikowana lista adresów, o które pytał
      skaner, jest gotową mapą dla następnego.
    </p>
    <p>
      <strong>Nie porównuj tej liczby z panelem swojego hostingu.</strong> Nasz licznik widzi
      wyłącznie żądania, które trafiają do naszego kodu. Pliki leżące gotowe na dysku —
      obrazki, arkusze stylów, skrypty, favikona — oddaje warstwa serwera stojąca przed nim,
      i tego ruchu tu nie ma. Panel hostingu policzy wszystko, my policzymy mniej. Różnica
      nie znaczy, że któryś licznik się myli: liczą co innego. Sprawdziliśmy to
      doświadczalnie — żądanie o mapę serwisu dociera do naszego kodu, żądanie o favikonę
      nie.
    </p>
    <p>
      <strong>To nadal nie jest licznik ludzi.</strong> Przeglądarka wysyła nagłówki, których
      prosty klient HTTP nie wysyła — metadane żądania albo przynajmniej preferowany język.
      Żądanie, które je ma, nie trafia do tej tabeli w ogóle. Granica jest arbitralna i może
      się mylić w obie strony, ale jest jedna, mechaniczna i podana z góry.
    </p>
    <p>
      Powód, dla którego to dopisaliśmy, jest pouczający sam w sobie. Przez pierwsze dni
      pomiaru w kodzie stała jedna linijka: „jeśli nie rozpoznajesz nazwy, nic nie zapisuj".
      W ciągu jednej doby to samo pytanie wróciło z trzech różnych stron — panel Cloudflare
      pokazywał ruch, którego licznik nie znał; w statystykach odwiedzin pojawili się
      „użytkownicy" bez pokrycia; i padło pytanie, czy mapy serwisu nie czytał ktoś
      nierozpoznany. Wszystkie trzy miały tę samą przyczynę.{" "}
      <strong>
        Licznik nie pokazywał zera dlatego, że nic nie przychodziło — tylko dlatego, że nie
        miał jak zobaczyć.
      </strong>
    </p>
  </>
);

const LlmsTxt = () => (
  <>
    <p>
      <code>llms.txt</code> to proponowany standard: mapa treści serwisu przygotowana dla
      modeli. Mamy go i zostawiamy. Ale dane trzeba podać wprost, także tam, gdzie przeczą
      temu, po co się ten plik tworzy.
    </p>
    <p className="font-medium">
      U nas plik pobrano cztery razy. Trzy z tych pobrań wywołaliśmy sami.
    </p>
    <p>
      Testując, czy modele go czytają, poprosiliśmy trzy z nich o jego zawartość. Każdy
      poszedł po niego naprawdę — i każde żądanie wylądowało w liczniku jako ruch bota. Nasz
      odsiew własnego ruchu tego <strong>nie łapie</strong>: rozpoznaje ruch po naszym numerze
      sieci i znaczniku w podpisie, a model przychodzi ze swojej infrastruktury, pod prawdziwą
      nazwą i z adresu przechodzącego weryfikację. Dla licznika to wzorowy bot — bo nim jest.
      Tyle że jego przyczyną byliśmy my. Zostaje <strong>jedno niezależne pobranie</strong>.
    </p>
    <p className="text-sm text-muted-foreground">
      Ta pułapka działa w jedną stronę: im więcej testujesz, tym bardziej Twoje dane
      potwierdzają to, co testujesz.
    </p>
    <h4 className="font-semibold mt-4">Mocniejsze badanie mówi to samo</h4>
    <p>
      Nasza próba to jedna strona i kilka dni.{" "}
      <a
        href="https://seekio.pl/roboty-ai-ignoruja-llms-txt/"
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline underline-offset-2"
      >
        Badanie Przemysława Charchana
      </a>{" "}
      obejmuje <strong>około 900 domen przez 191 dni</strong>: 1227 zapytań o pliki llms.txt
      wobec blisko <strong>45 milionów żądań od botów AI</strong> w tym samym czasie — trzy
      tysięczne procenta. Wśród pytających nie było ani jednego zweryfikowanego bota AI.
      Jego próba jest od naszej jakieś czterdzieści tysięcy razy większa, więc to nie nasza
      liczba jest tu dowodem.
    </p>
    <h4 className="font-semibold mt-4">Dlaczego tak jest</h4>
    <p>
      Mechanizm wyszedł z innego naszego testu: wystawiliśmy cztery nowe pliki i poprosiliśmy
      modele o ich zawartość. Jeden nie wysłał ani jednego żądania i podał powód wprost —{" "}
      <em>„cache miss, wyszukiwarka nie ma jego kopii"</em>. Taki model{" "}
      <strong>nie ignoruje llms.txt — on w ogóle nie chodzi po plikach</strong>, tylko czyta
      z indeksu. Plik przygotowany specjalnie dla niego leży poza jego ścieżką.
    </p>
    <p>
      Zostawiamy go, bo kosztuje zero, a gdyby konwencja się przyjęła, będziemy mieli dane od
      dziś. <strong>Ale nie liczymy na niego.</strong> Jeśli masz jedną godzinę:{" "}
      <code>robots.txt</code> czyta u nas kilkanaście różnych botów, a strona główna jest
      drugim najczęściej pobieranym adresem w serwisie. To są drzwi, którymi się wchodzi.
    </p>
  </>
);

const KodOtwarty = () => (
  <>
    <p>
      Licznik, którego liczby czytasz wyżej, jest dostępny w całości:{" "}
      <a
        href="https://github.com/kitayMarek/ai-bot-verify"
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline underline-offset-2"
      >
        github.com/kitayMarek/ai-bot-verify
      </a>{" "}
      na licencji MIT. Kod weryfikacji, schemat bazy, widoki publiczne i testy — wszystko,
      czego potrzeba, żeby zmierzyć to samo u siebie.
    </p>
    <p>
      Jest tam jeden plik, na który zwracamy uwagę bardziej niż na kod:{" "}
      <strong>spis siedmiu błędów, które popełniliśmy w pierwszym tygodniu</strong>, każdy
      z ceną. Literówka w nazwie domeny, przez trzy dni publicznie oskarżająca cudzą firmę
      o podszywanie się pod samą siebie. Pliki serwowane z pominięciem licznika, dające
      twarde zero odczytane jako „nikt tego nie pobiera". Raport odsiewający dokładnie to,
      czego w nim szukaliśmy.{" "}
      <strong>Cztery z siedmiu dawały wynik wyglądający wiarygodnie i żaden nie zgłosił się sam.</strong>
    </p>
    <p className="font-medium">
      Publikujemy to, bo zbudowanie takiego licznika jest łatwe, a zbudowanie go tak, żeby
      nie kłamał — nie jest. Kod bez tej listy byłby narzędziem do produkowania kolejnych
      pewnych siebie liczb, a takich już jest dosyć.
    </p>
  </>
);

const Kronika = () => (
  <>
    <h3 className="font-semibold">7 września 2026 — model opisał plik, którego nie pobrał</h3>
    <p>
      Poprosiliśmy trzy modele o <strong>sprawdzalne fakty</strong> z trzech naszych plików: ile
      adresów ma mapa serwisu i jaki jest ostatni, jaka jest ostatnia sekcja llms.txt, jaka liczba
      stoi w nagłówku tej strony. Pytania tak sformułowane, żeby odpowiedź dało się zweryfikować co
      do znaku — i żeby licznik pokazał, czy model naprawdę po te pliki przyszedł.
    </p>
    <p>
      Jeden odpowiedział na wszystkie trzy, z pełną pewnością siebie i z opisem procedury:{" "}
      <em>„licząc wszystkie linie z adresami (…) wychodzi 204 pozycje"</em>. W liczniku nie ma śladu
      żądania o mapę serwisu w oknie testu — jedyne tego dnia przyszło z innej strony i o innej godzinie.
    </p>
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b bg-secondary/50">
            <th className="text-left p-2">Pytanie</th>
            <th className="text-left p-2">Odpowiedź modelu</th>
            <th className="text-left p-2">Stan faktyczny</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b"><td className="p-2">Ile ruchu AI jest prawdziwe</td><td className="p-2">10–15%</td><td className="p-2">liczba nagłówkowa tej strony, wyżej</td></tr>
          <tr className="border-b"><td className="p-2">Ile adresów ma mapa serwisu</td><td className="p-2">204</td><td className="p-2">106 — a 204 nie było <strong>nigdy</strong>; maksimum w historii to 135</td></tr>
          <tr className="border-b"><td className="p-2">Ostatni adres w mapie</td><td className="p-2">/bakterie-kultury.html</td><td className="p-2">/en/ai-bots — podany był ostatni do 1 września</td></tr>
          <tr className="border-b"><td className="p-2">Ostatnia sekcja llms.txt</td><td className="p-2">„AKTUALIZACJE"</td><td className="p-2">zgadza się — jedyne trafienie</td></tr>
          <tr><td className="p-2">Data w tej sekcji</td><td className="p-2">2026-06-16</td><td className="p-2">2026-09-05</td></tr>
        </tbody>
      </table>
    </div>
    <p>
      <strong>Dwie rzeczy warto rozróżnić, bo mają różne przyczyny.</strong> Ostatni adres i data
      w llms.txt są <em>prawdziwe, ale nieaktualne</em> — opisują stan sprzed kilku dni. To zapamiętana
      kopia i nic w tym zdrożnego, poza podaniem jej jako świeżego odczytu. Liczba 204 to co innego:{" "}
      <strong>nie była prawdziwa nigdy</strong>. Nie ma wersji tego pliku, w której by wystąpiła.
    </p>
    <p className="text-sm text-muted-foreground">
      Uczciwe zastrzeżenie: nie możemy wykluczyć, że model pobrał te pliki wcześniej, poza naszym
      oknem pomiaru — na to wskazują dane sprzed 5 września i to tłumaczyłoby nieaktualność. Nie
      tłumaczy liczby, której nigdy nie było, ani zdania opisującego liczenie jako czynność wykonaną
      przed chwilą.
    </p>
    <p className="font-medium">
      Strona, która mierzy, ile „ruchu AI" jest prawdziwe, została opisana liczbą, która z niej nie
      pochodzi — i to z dokładnością gorszą niż czterokrotna.
    </p>

    <h3 className="font-semibold">7 września 2026 — drugi model przyznał się do niewiedzy i wykrył nasz błąd</h3>
    <p>
      W tym samym teście inny model odpowiedział: <em>nie udało mi się pobrać tego pliku</em>,
      i zgadywał, że to zapora po naszej stronie. Licznik pokazał co innego:{" "}
      <strong>jego żądania dotarły</strong>, oba, co do sekundy. Serwer oddał pliki poprawnie — to
      narzędzie modelu nie poradziło sobie z formatem innym niż HTML i zgłosiło własne ograniczenie
      jako awarię cudzego serwera.
    </p>
    <p>
      Ale ten sam model, zapytany o treść tej strony, odpowiedział, że dostał{" "}
      <em>„spis treści portalu przypominający sitemapę, a nie właściwy artykuł"</em>.{" "}
      <strong>I to była prawda — a błąd był nasz.</strong> Nie przedstawia się nazwą, którą znaliśmy,
      więc nie trafiał do grupy dostającej pełną treść. Poprawione tego samego dnia: o tym, czy
      żądanie pochodzi od człowieka, decyduje teraz brak nagłówków wysyłanych przez przeglądarkę,
      a nie obecność nazwy na naszej liście. Lista nazw zawsze będzie spóźniona wobec rzeczywistości.
    </p>
    <p className="font-medium">
      Model, który przyznał się do niewiedzy, dał nam informację wartą poprawki. Model, który
      odpowiedział na wszystko, nie dał żadnej.
    </p>

    <h3 className="font-semibold">7 września 2026 — gdy model czegoś nie przeczyta, diagnozuje Twój serwer</h3>
    <p>
      Wystawiliśmy cztery malutkie pliki testowe o tej samej treści i różnych rozszerzeniach, żeby
      sprawdzić, którego formatu modele nie potrafią odczytać.{" "}
      <strong>Odpowiedź okazała się inna od pytania: format nie miał z tym nic wspólnego.</strong>
    </p>
    <ul className="list-disc pl-5 space-y-1">
      <li>Model pobierający na żywo — przyszedł, pobrał, odczytał. Jego żądania są w liczniku.</li>
      <li>
        Model czytający z indeksu — <strong>nie wysłał ani jednego żądania</strong>, sam podał powód
        („cache miss"), a przyczynę opisał jako „blokowany przez sposób serwowania pliku XML".
      </li>
      <li>
        Model uruchamiający kod — <strong>też ani jednego żądania</strong>: napisał skrypt i uruchomił
        go w piaskownicy bez dostępu do DNS. Przyczynę opisał jako „zabezpieczenia serwera przed
        botami, błąd wczytywania lub brak pliku".
      </li>
    </ul>
    <p className="font-medium">
      Przez cały ten czas plik odpowiadał każdemu, kto o niego poprosił: kod 200, 246 bajtów. Żaden
      z tych domysłów — zapora, blokada botów, brak pliku — nie miał pokrycia w rzeczywistości.
    </p>
    <p>
      Trzy różne architektury, trzy różne przyczyny niepowodzenia, wszystkie po stronie modelu. I trzy
      razy ta sama reakcja: <strong>opis cudzej infrastruktury jako uszkodzonej, bez zastrzeżenia, że
      problem może leżeć po własnej stronie.</strong> To kosztuje wtedy, gdy właściciel strony zacznie
      rozluźniać reguły zapory, żeby naprawić coś, co nie było zepsute.
    </p>
    <p className="text-sm text-muted-foreground">
      Pytanie, które rozstrzyga w minutę: <strong>„czy w moich logach jest ślad Twojego żądania?"</strong>{" "}
      Jeśli go nie ma, żadna hipoteza o serwerze nie ma podstaw — serwer nie dostał okazji, żeby
      cokolwiek zrobić.
    </p>
    <p>
      <strong>Rozstrzygnięcie przyszło od modelu, który pobiera.</strong> Ten sam zestaw czterech
      plików odczytał w całości — XML, zwykły tekst, JSON i kopię mapy serwisu pod inną nazwą. Cztery
      klucze, cztery trafienia, a w liczniku cztery jego żądania, wszystkie zweryfikowane.{" "}
      <strong>Format nie ma znaczenia dla nikogo, kto faktycznie wychodzi po plik.</strong>
    </p>
    <p>
      Pierwsze wrażenie bywa tu odwrotne od wniosku. Model, który przychodzi po plik,{" "}
      <em>zostawia ślad</em>: przedstawia się nazwą, przychodzi z adresów publikowanych przez swojego
      operatora, można go sprawdzić, policzyć albo nie wpuścić przez <code>robots.txt</code>. Model,
      który czyta cudzy indeks, <strong>jest dla właściciela strony niewidzialny</strong> — nie ma go
      w logach, nie sposób go zablokować i nie wiadomo nawet, że cytuje.
    </p>
    <p className="font-medium">
      Im mniej model fatyguje się do źródła, tym mniej właściciel źródła wie, że jest czytany. Ta
      strona liczy tych, którzy przychodzą. O tych, którzy nie przychodzą, a jednak cytują, nie wie
      nic i wiedzieć nie może.
    </p>

    <h3 className="font-semibold">7 września 2026 — trzeci model powiedział „nie wiem" i to była najlepsza odpowiedź</h3>
    <p>
      Ten sam test przeszedł jeszcze jeden model, też w wersji darmowej. Przyszedł po wszystkie trzy
      pliki — mamy jego żądania co do sekundy. Przy mapie serwisu napotkał to samo ograniczenie co
      poprzedni: nie potrafił odczytać XML-a. I zrobił jedyną rzecz, której żaden z pozostałych nie
      zrobił: <strong>napisał, że nie poda liczby, bo nie chce zgadywać</strong>, i poprosił o wklejenie
      zawartości pliku. Plik llms.txt odczytał <strong>poprawnie i aktualnie</strong>, z datą, którą
      poprzedni model podał o trzy miesiące starszą.
    </p>
    <p className="text-sm text-muted-foreground">
      Przy liczbach z tej strony podał wartości spójne arytmetycznie, ale nieodpowiadające stanowi
      licznika z chwili odczytu. <strong>Nie umiemy tego rozstrzygnąć</strong> i tak to zapisujemy:
      strona jest buforowana na godzinę, a liczby rosną szybko, więc mógł dostać starszą wersję albo
      sięgnąć do pamięci. Bez zapisu historii tych liczb nie mamy jak sprawdzić, a zgadywanie byłoby
      dokładnie tym, co tej stronie zarzucamy u innych.
    </p>
    <p className="font-medium">
      Trzy modele, to samo pytanie, ta sama przeszkoda. Pierwszy nie przyszedł i podał liczbę, której
      nigdy nie było. Drugi przyszedł i uznał własne ograniczenie za awarię naszego serwera. Trzeci
      przyszedł i powiedział „nie chcę zgadywać". <strong>Ten jedyny, który odmówił odpowiedzi, jest
      jednocześnie jedynym, którego pozostałe odpowiedzi okazały się prawdziwe.</strong>
    </p>
    <p className="text-sm text-muted-foreground">
      Test powtórzyliśmy potem na pięciu modelach i wersjach, w tym trzech płatnych.
    </p>
    <p>
      <strong>Tylko jedna z sześciu wersji odczytała mapę serwisu w formacie XML</strong> — podała
      liczbę adresów, ostatni z nich i jego datę, wszystko zgodnie ze stanem. Cztery uczciwie
      przyznały, że nie potrafią, jedna zmyśliła liczbę. Wniosek dla każdego, kto liczy, że sitemapa
      „karmi modele": czasem karmi, częściej nie — i nie da się z góry przewidzieć, którego modelu
      to dotyczy. (Pierwsza wersja tego akapitu mówiła „żadna z pięciu". Była prawdziwa przez
      godzinę, do szóstego testu.)
    </p>
    <p>
      <strong>Wyższy tryb rozumowania nie dał lepszej odpowiedzi na pytanie faktograficzne.</strong>{" "}
      Wersja płatna z trybem rozumowania podała liczby z tej strony dokładniej niż ktokolwiek — a przy
      prostszym pytaniu o ostatnią sekcję pliku tekstowego wskazała sekcję, której w nim nie ma,
      uzasadniając to „aktualnie zindeksowaną wersją". Wersja prostsza odpowiedziała poprawnie.
    </p>
    <p>
      I ostrzeżenie praktyczne: <strong>ta sama wersja, nie mogąc odczytać publicznego pliku,
      poprosiła o dostęp do prywatnego repozytorium kodu.</strong> Plik leży pod publicznym adresem
      i nie wymaga żadnych uprawnień. Prośbę odrzucono i słusznie — to wzorzec, na który łatwo się
      nabrać: skoro nie mogę odczytać A, daj mi dostęp do B. Odległość między jednym a drugim bywa ogromna.
    </p>

    <h3 className="font-semibold">Jedno pobranie, wiele odpowiedzi — czyli licznik zaniża</h3>
    <p>
      Ta strona pokazuje, że liczniki ruchu AI <em>zawyżają</em>, bo wliczają podszywki. Uczciwość
      wymaga drugiej strony: <strong>w innym wymiarze zaniżają, i to prawdopodobnie bardziej.</strong>
    </p>
    <p>
      7 września 2026 bot jednego z operatorów pobrał tę stronę o 09:49:29 — jedno żądanie, jeden
      wiersz w liczniku. Potem <strong>trzy różne rozmowy</strong> u tego samego operatora zacytowały
      jej treść, dwie ponad godzinę później, bez żadnego nowego żądania do naszego serwera. Wiemy to,
      bo licznik nie odnotował już nic, a odpowiedzi podawały liczby zamrożone dokładnie na 09:49.
    </p>
    <p className="font-medium">
      Liczba żądań w logu nie jest liczbą cytowań, tylko jej dolnym ograniczeniem — i to ograniczeniem
      nieznanej ostrości. Kto liczy „wizyty AI", żeby wiedzieć, ile razy jego treść trafiła do czyjejś
      odpowiedzi, mierzy nie to, co myśli, nawet po odsianiu wszystkich podszywek.
    </p>
    <p className="text-sm text-muted-foreground">
      Przy okazji potwierdziło się coś, co robimy tu celowo: przy każdej liczbie stoi data i godzina
      stanu, z prośbą, żeby cytować je razem. Modele to zrobiły — podały liczbę wraz z „stan na
      7 września, godz. 09:49 UTC". Czytelnik takiej odpowiedzi wie, że ogląda migawkę sprzed godziny.
    </p>

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
    <h3 className="font-semibold pt-2">6 września 2026 — przez trzy dni oskarżaliśmy Amazona o to, co robiliśmy sami</h3>
    <p>
      Weryfikacja przez odwrotny DNS sprawdza, czy nazwa hosta kończy się domeną
      operatora. Dla Amazonbota mieliśmy wpisane <code>crawl.amazon.com</code> — domenę,
      która <strong>nie istnieje</strong>. Amazon dokumentuje{" "}
      <code>crawl.amazonbot.amazon</code>. Każde żądanie prawdziwego Amazonbota odpadało
      więc na drugim kroku i trafiało do tabeli jako podszycie.
    </p>
    <p>
      Sygnał był w danych od początku: ta metoda miała bilans <strong>zero potwierdzeń
      na dwadzieścia pięć sprawdzeń</strong>. Odnotowaliśmy to dzień wcześniej i opisaliśmy
      ją jako niesprawdzoną — zabrakło wniosku, że skoro jest niesprawdzona, to jej „nie"
      też nie nadaje się do publikacji.
    </p>
    <p className="text-sm text-muted-foreground">
      Werdyktów nie dało się przeliczyć, bo celowo nie zapisujemy adresów IP — bez adresu
      nie ma jak ponowić zapytania DNS. Zostały cofnięte do „niesprawdzone". Ta sama
      zasada, którą stosujemy do cudzych liczb: pomiar, o którym wiadomo, że był błędny,
      przestaje być dowodem.
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
      <strong>Na tej metodzie zaliczyliśmy własny błąd pomiarowy.</strong> Przez pierwsze
      dni sprawdzaliśmy dla Amazonbota domenę, która nie istnieje, więc każde prawdziwe
      żądanie tego bota odpadało na kroku 2 i było zapisywane jako podszycie — przez trzy
      doby ta strona pokazywała Amazonbota jako najczęściej podszywanego bota w zbiorze.
      Poprawione 6 września 2026, wcześniejsze werdykty tej metody wycofane do
      „niesprawdzone". Szczegóły w kronice zdarzeń.
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
    <p>
      Z odsyłaczy bierzemy wyłącznie <strong>nazwę serwisu</strong> — <code>facebook.com</code>,
      <code>chatgpt.com</code> — nigdy ścieżki. Ścieżka odsyłająca potrafi zawierać treść
      wpisanego pytania albo adres zamkniętej grupy, więc odcinamy ją, zanim cokolwiek trafi
      do zapisu. Wejść bez odsyłacza nie zapisujemy wcale.
    </p>
  </>
);

export default BotyAi;
