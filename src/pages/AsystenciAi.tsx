import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink } from "lucide-react";
import { zdarzenieLacznikAi, zdarzeniePromptCzatu } from "@/lib/zdarzeniaGa4";
import {
  ADRES_MCP,
  UMIEJETNOSC_PERPLEXITY,
  WTYCZKI_CHATGPT,
  adresLacznika,
  linkClaude,
  zapiszKlikniecieLacznika,
  zrodloZeSciezki,
  type Asystent,
} from "@/lib/lacznikClaude";
import { adresZPromptu, linkZPromptem, promptPodlaczenia } from "@/lib/promptyCzatow";

/**
 * Jak podłączyć serwer MCP serwisu (worker-magazyn/, dane.mojaserowarnia.pl/mcp)
 * do ChatGPT, Claude albo Perplexity.
 *
 * UKŁAD WEDŁUG MAKIETY D (decyzja Marka 24.10.2026, kanwa „Strona główna: makiety”).
 * Wcześniej strona miała ponad 6 ekranów, tytuł „…w Claude”, a pod ramką z gotowym
 * tekstem trzy osobne instrukcje: każdy widział naraz dwie drogi dla trzech czatów.
 * Teraz krok 1 to wybór czatu, a niżej tylko jego droga: gotowy tekst (czat sam
 * przeprowadza) albo kroki z adresem. Od 28.10.2026 bez pasz: kalkulator ma własny łącznik
 * na mojapasza.com, a porównanie odpowiedzi Perplexity (prawdziwe rozmowy Marka o paszy,
 * 24.10.2026) i przykład z paszą przeniosły się na mojapasza.com/asystenci-ai. Przykład
 * na górze: dane z łącznika (szukaj_kultur, camembert, ceny z 22.08.2026).
 *
 * KOTWICE: #chatgpt, #claude, #perplexity wybierają czat i przewijają do kroku 2.
 * Prowadzą tu menu boczne (Navigation.tsx), strona główna, ramka „Podłącz w swoim
 * czacie” i krótkie linki z postów (/chatgpt?z=, /perplexity?z=, /claude?z= w
 * worker/index.js). Bez kotwicy domyślnie ChatGPT, bo jest najpopularniejszy.
 *
 * KROKI: polskie etykiety ChatGPT (zrzuty Marka 23.10.2026), angielskie Claude.ai
 * (21.10.2026), polskie Perplexity (23.10.2026). Zmiana kroków tu = zmiana promptów
 * w src/lib/promptyCzatow.ts.
 *
 * Treść odpowiada mirrorowi public/asystenci-ai.html, tytuł i opis w metaStron.ts.
 */

const CZATY: { id: Asystent; nazwa: string; podpis: string; kolor: string }[] = [
  { id: "chatgpt", nazwa: "ChatGPT", podpis: "Najpopularniejszy", kolor: "bg-[#10A37F] hover:bg-[#0e8f6f]" },
  { id: "claude", nazwa: "Claude", podpis: "Jedno kliknięcie", kolor: "bg-[#D97757] hover:bg-[#c4664a]" },
  { id: "perplexity", nazwa: "Perplexity", podpis: "Tryb Computer", kolor: "bg-[#20808D] hover:bg-[#1a6b76]" },
];

const czyCzat = (x: string): x is Asystent => x === "chatgpt" || x === "claude" || x === "perplexity";

const PYTANIA = [
  "Jak zrobić twaróg i jaką kulturę do niego kupić?",
  "Jak zrobić mozzarellę w domu i gdzie kupię do niej kulturę?",
  "Jaka kultura do camemberta i czym ją zastąpić?",
  "Która kultura mezofilna wychodzi najtaniej w przeliczeniu na litr mleka?",
];

// Polecenie dla Claude Code ma znacznik "claude-code", żeby serwer MCP odróżnił te podłączenia.
const POLECENIE_CLAUDE_CODE = `claude mcp add --transport http serowarnia ${adresLacznika("claude-code")}`;
// Wpis do pliku z serwerami MCP (w Cursorze mcp.json). Ten sam format podał Gemini w teście Marka 25.10.2026.
const WPIS_KONFIGURACJI = JSON.stringify({ mcpServers: { serowarnia: { url: adresLacznika("programy") } } }, null, 2);

/**
 * Kopiuje tekst do schowka. Schowek bywa zablokowany (stara przeglądarka, okno
 * osadzone, brak zgody): wtedy zaznaczamy tekst na stronie i próbujemy starszej metody.
 */
async function kopiujTekst(tekst: string, zaznacz?: () => void): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(tekst);
    return true;
  } catch {
    zaznacz?.();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    }
  }
}

/** Przycisk „Kopiuj” z chwilowym „Skopiowano”. */
const PrzyciskKopiuj = ({ tekst, etykieta = "Kopiuj", onKopiuj, className = "" }: {
  tekst: string; etykieta?: string; onKopiuj?: () => void; className?: string;
}) => {
  const [ok, setOk] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className={`shrink-0 ${className}`}
      onClick={async () => {
        onKopiuj?.();
        if (await kopiujTekst(tekst)) {
          setOk(true);
          setTimeout(() => setOk(false), 2500);
        }
      }}
    >
      {ok ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {ok ? "Skopiowano" : etykieta}
    </Button>
  );
};

const NaglowekKroku = ({ nr, tytul, id }: { nr: number; tytul: string; id?: string }) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Krok {nr}</p>
    <h2 id={id} className="font-display text-3xl text-foreground md:text-[2.1rem]">{tytul}</h2>
  </div>
);

const AsystenciAi = () => {
  const location = useLocation();
  // Strona, z której ktoś przyszedł (menu boczne przekazuje ją w stanie nawigacji) albo
  // znacznik z krótkiego linku (?z=fb-grupa). Idzie do adresu łącznika jako znacznik,
  // więc serwer MCP pokaże, skąd przyszło podłączenie.
  const stan = location.state as { z?: unknown } | null;
  const zAdresu = new URLSearchParams(location.search).get("z");
  const zrodlo = zrodloZeSciezki(typeof stan?.z === "string" ? stan.z : zAdresu ?? "/asystenci-ai");
  const adres = adresLacznika(zrodlo);

  const zKotwicy = location.hash.slice(1);
  const [czat, setCzat] = useState<Asystent>(czyCzat(zKotwicy) ? zKotwicy : "chatgpt");
  const [skopiowano, setSkopiowano] = useState<"tekst" | "adres" | null>(null);
  const krok2 = useRef<HTMLElement>(null);
  const tekstPromptu = useRef<HTMLPreElement>(null);

  // Kotwica wybiera czat i przewija do kroku 2. Drugi skok po chwili: treść nad
  // nim jeszcze się układa (na produkcji 23.10.2026 strona kończyła 350 px za nisko).
  useEffect(() => {
    if (!czyCzat(zKotwicy)) return;
    setCzat(zKotwicy);
    const skocz = () => krok2.current?.scrollIntoView({ block: "start" });
    const t1 = setTimeout(skocz, 50);
    const t2 = setTimeout(skocz, 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [zKotwicy]);

  const wybierz = (id: Asystent) => {
    setCzat(id);
    setSkopiowano(null);
    // Kotwica w adresie, żeby link skopiowany z paska otwierał ten sam czat. Bez routera: bez przewijania.
    window.history.replaceState(window.history.state, "", `${location.pathname}${location.search}#${id}`);
  };

  const wybrany = CZATY.find((c) => c.id === czat)!;
  const prompt = promptPodlaczenia(czat, "ogolny", zrodlo);
  const otworzKopiujeAdres = czat !== "perplexity";

  const kopiuj = async (co: "tekst" | "adres") => {
    const zaznacz = () => {
      if (co === "tekst" && tekstPromptu.current) window.getSelection()?.selectAllChildren(tekstPromptu.current);
    };
    if (await kopiujTekst(co === "tekst" ? prompt : adresZPromptu(czat, zrodlo), zaznacz)) {
      setSkopiowano(co);
      setTimeout(() => setSkopiowano(null), 6000);
    }
  };

  const linkZew = (href: string, tresc: ReactNode, onClick?: () => void) => (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" onClick={onClick} className="font-semibold text-primary underline">
      {tresc}
    </a>
  );

  const KROKI: Record<Asystent, { kroki: ReactNode[]; uwaga: string }> = {
    chatgpt: {
      kroki: [
        <>
          Otwórz {linkZew(WTYCZKI_CHATGPT, "wtyczki w ChatGPT", () => {
            zdarzenieLacznikAi("polacz_chatgpt");
            zapiszKlikniecieLacznika(zrodlo, "przycisk", "chatgpt");
          })}{" "}
          i kliknij <strong>Dodaj</strong> w prawym górnym rogu, obok koła zębatego.
        </>,
        <>Wybierz <strong>Dodaj niestandardowy serwer MCP</strong>.</>,
        <>Nazwa: <strong>Moja Serowarnia</strong>. Wklej adres poniżej, uwierzytelnianie: <strong>brak</strong>. Potwierdź ostrzeżenie i utwórz wtyczkę.</>,
        <>Na liście <strong>Osobiste</strong> kliknij <strong>+</strong> przy Moja Serowarnia. Potem pytaj w zwykłej rozmowie.</>,
      ],
      uwaga:
        "U nas zadziałało też na darmowym koncie. Jeśli nie widzisz opcji niestandardowego serwera MCP, Twój plan jej nie ma; na kontach firmowych włącza ją administrator. Wtyczka działa też w aplikacji na telefonie.",
    },
    claude: {
      kroki: [
        <>
          Kliknij {linkZew(linkClaude(zrodlo), "Dodaj do Claude", () => {
            zdarzenieLacznikAi("polacz_claude");
            zapiszKlikniecieLacznika(zrodlo, "przycisk");
            void kopiujTekst(adres);
          })}
          : otworzy się formularz z wpisaną nazwą i adresem. Gdyby był pusty, wejdź w <strong>Customize</strong>,
          zakładka <strong>Connectors</strong>, <strong>+ Add</strong>, <strong>Add custom connector</strong> i wklej adres.
        </>,
        <>
          Claude pokaże żółte ostrzeżenie o łączniku z linku: to zwykły komunikat. Sprawdź, że adres zaczyna się od
          dane.mojaserowarnia.pl, kliknij <strong>Continue</strong>, potem <strong>Add</strong>.
        </>,
        <>W rozmowie kliknij <strong>+</strong> pod polem wiadomości, wybierz <strong>Connectors</strong> i włącz Moja Serowarnia.</>,
      ],
      uwaga:
        "Własne łączniki działają na każdym planie Claude, także darmowym (jeden łącznik). W planach Team i Enterprise dodaje je właściciel organizacji. Nazwy przycisków podajemy jak w angielskiej wersji Claude; łącznik działa też w aplikacji na telefonie.",
    },
    perplexity: {
      kroki: [
        <>
          Otwórz {linkZew(UMIEJETNOSC_PERPLEXITY, "umiejętność moja-serowarnia", () => {
            zdarzenieLacznikAi("polacz_perplexity");
            zapiszKlikniecieLacznika(zrodlo, "przycisk", "perplexity");
          })}{" "}
          i zaloguj się, jeśli strona o to poprosi.
        </>,
        <>Kliknij <strong>…</strong> w prawym górnym rogu i wybierz <strong>Importuj kopię</strong>, potem <strong>Zapisz</strong>.</>,
        <>Pytaj w trybie <strong>Computer</strong>, na przykład „jaka kultura do mozzarelli i gdzie ją kupić”.</>,
      ],
      uwaga: "Działa także na darmowym planie. W zwykłym wyszukiwaniu Perplexity odpowiada z sieci, bez naszych danych.",
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Moja Serowarnia w Twoim czacie: ChatGPT, Claude i Perplexity",
    description:
      "Jak podłączyć bazę kultur do sera i przepisy Mojej Serowarni do ChatGPT, Claude albo Perplexity (serwer MCP), bez konta i klucza.",
    inLanguage: "pl",
    url: "https://mojaserowarnia.pl/asystenci-ai",
    image: "https://mojaserowarnia.pl/og-image.jpg",
    datePublished: "2026-10-21",
    dateModified: "2026-10-28",
    publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Narzędzia", href: "/narzedzia" }, { label: "Asystenci AI" }]} />

      <main className="pt-20">
        <div className="container mx-auto flex max-w-5xl flex-col gap-12 px-4 pb-16 pt-2 sm:px-6 md:gap-14 md:pt-4">
          {/* ── Nagłówek ─────────────────────────────────────────────── */}
          <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="flex min-w-0 flex-col gap-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Asystenci AI</p>
              <h1 className="font-display text-[clamp(2.2rem,5.5vw,3.3rem)] leading-[1.08] text-foreground">
                Moja Serowarnia w Twoim czacie
              </h1>
              <p className="text-lg leading-relaxed text-foreground/80">
                Podłącz naszą bazę kultur i przepisy na sery do ChatGPT, Claude albo Perplexity. Pytasz jak zwykle,
                a czat sprawdza na naszych danych, zamiast zgadywać. Bez konta u nas i bez klucza.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {/* Na telefonie krok 1 jest prawie dwa ekrany niżej (przykład i porównanie). */}
                <a
                  href="#krok-1"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("krok-1")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="inline-flex min-h-[46px] items-center rounded-lg bg-primary px-5 font-bold text-primary-foreground no-underline hover:bg-primary/90"
                >
                  Podłącz teraz ↓
                </a>
                <span className="text-sm text-muted-foreground">Robisz to raz, zajmuje kilka minut.</span>
              </div>
            </div>
            <figure className="flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-card p-5" aria-label="Przykład rozmowy z czatem">
              <figcaption className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Tak to wygląda w rozmowie</figcaption>
              <p className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-muted px-4 py-3 text-[15px] leading-relaxed">
                Jaka biała pleśń do camemberta wyjdzie najtaniej na litr mleka?
              </p>
              <p className="max-w-[92%] rounded-2xl rounded-bl-sm border border-border bg-background px-4 py-3 text-[15px] leading-relaxed">
                Według bazy Mojej Serowarni najtaniej wychodzi Penicillium Candidum PC 22 z Wańczykówki: 18,40 zł,
                około 7 gr na litr mleka (cena z 22.08.2026). Do skórki przyda się też Geotrichum, a mleko zakwasisz
                kulturą mezofilną. Cenę sprawdź w sklepie przed zakupem.
              </p>
            </figure>
          </section>

          {/* ── Krok 1: wybór czatu ─────────────────────────────────── */}
          <section id="krok-1" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="wybor-czatu">
            <NaglowekKroku nr={1} tytul="Jakiego czatu używasz?" id="wybor-czatu" />
            <div className="grid gap-3 sm:grid-cols-3">
              {CZATY.map((c) => {
                const aktywny = c.id === czat;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={aktywny}
                    onClick={() => wybierz(c.id)}
                    className={`flex min-h-[84px] flex-col items-start justify-center gap-1 rounded-2xl border-2 px-5 py-4 text-left transition-colors ${
                      aktywny ? "border-primary bg-card" : "border-border bg-transparent hover:border-primary/60"
                    }`}
                  >
                    <span className="font-display text-2xl text-foreground">{c.nazwa}</span>
                    <span className="text-sm text-muted-foreground">{c.podpis}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Krok 2: podłączenie wybranego czatu ─────────────────── */}
          <section ref={krok2} id="podlacz" className="flex scroll-mt-24 flex-col gap-4" aria-labelledby="podlacz-tytul">
            {/* Stare kotwice z postów i menu: puste znaczniki, żeby #chatgpt itd. miały cel w HTML. */}
            <span id="chatgpt" className="sr-only" aria-hidden="true" />
            <span id="claude" className="sr-only" aria-hidden="true" />
            <span id="perplexity" className="sr-only" aria-hidden="true" />
            <NaglowekKroku nr={2} tytul={`Podłącz w ${wybrany.nazwa}`} id="podlacz-tytul" />
            <div className="grid items-stretch gap-5 lg:grid-cols-[1.1fr_1fr]">
              {/* Najprościej: czat sam przeprowadza (ten sam tekst co w ramce „Podłącz w swoim czacie”). */}
              <div className="flex min-w-0 flex-col gap-3.5 rounded-2xl border-2 border-primary bg-card p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Najprościej</p>
                <h3 className="font-display text-[1.75rem] leading-tight text-foreground">Niech {wybrany.nazwa} Cię przeprowadzi</h3>
                <p className="leading-relaxed text-foreground/80">
                  Otworzysz {wybrany.nazwa} z gotowym tekstem. Czat poprowadzi Cię krok po kroku, a na koniec znajdzie
                  próbnie kulturę do sera.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Button asChild className={`h-12 font-semibold text-white ${wybrany.kolor}`}>
                    <a
                      href={linkZPromptem(czat, prompt)}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      onClick={() => {
                        zapiszKlikniecieLacznika(zrodlo, "prompt-otworz", czat);
                        zdarzeniePromptCzatu(czat, "otworz");
                        void kopiuj(otworzKopiujeAdres ? "adres" : "tekst");
                      }}
                    >
                      Otwórz {wybrany.nazwa} z gotowym tekstem
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12"
                    onClick={() => {
                      zapiszKlikniecieLacznika(zrodlo, "prompt-kopiuj", czat);
                      zdarzeniePromptCzatu(czat, "kopiuj");
                      void kopiuj("tekst");
                    }}
                  >
                    {skopiowano === "tekst" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {skopiowano === "tekst" ? "Skopiowano" : "Kopiuj tekst"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {skopiowano === "adres"
                    ? `Adres serwera jest w schowku: wklej go (Ctrl+V), gdy ${wybrany.nazwa} o niego poprosi. Gdyby pole w czacie zostało puste, wróć tu i kliknij Kopiuj tekst.`
                    : skopiowano === "tekst"
                      ? `Tekst jest w schowku. Jeśli pole w ${wybrany.nazwa} jest puste, wklej go (Ctrl+V) i wyślij.`
                      : otworzKopiujeAdres
                        ? "Przycisk skopiuje też adres serwera: wkleisz go, gdy czat o niego poprosi."
                        : "Perplexity bierze adres z umiejętności, nic nie trzeba wklejać."}
                </p>
                {czat === "claude" && (
                  <p className="border-t border-border pt-3 text-[15px]">
                    Albo jeszcze szybciej:{" "}
                    {linkZew(linkClaude(zrodlo), "Dodaj do Claude jednym kliknięciem", () => {
                      zdarzeniePromptCzatu("claude", "formularz");
                      zapiszKlikniecieLacznika(zrodlo, "przycisk", "claude");
                      void kopiujTekst(adres);
                    })}
                  </p>
                )}
                {czat === "perplexity" && (
                  <p className="border-t border-border pt-3 text-[15px]">
                    Albo jeszcze szybciej:{" "}
                    {linkZew(UMIEJETNOSC_PERPLEXITY, "otwórz umiejętność w Perplexity", () => {
                      zdarzeniePromptCzatu("perplexity", "umiejetnosc");
                      zapiszKlikniecieLacznika(zrodlo, "przycisk", "perplexity");
                    })}
                  </p>
                )}
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground underline underline-offset-2">Zobacz tekst, który dostanie czat</summary>
                  <pre
                    ref={tekstPromptu}
                    className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-background px-3 py-2 font-sans text-[13px] leading-snug"
                  >
                    {prompt}
                  </pre>
                </details>
              </div>

              {/* Wolisz sam: kroki i adres. */}
              <div className="flex min-w-0 flex-col gap-3.5 rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Wolisz sam?</p>
                <h3 className="font-display text-[1.75rem] leading-tight text-foreground">
                  {KROKI[czat].kroki.length} kroki
                </h3>
                <ol className="flex flex-col gap-3">
                  {KROKI[czat].kroki.map((k, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed">
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold" aria-hidden="true">
                        {i + 1}
                      </span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ol>
                {czat !== "perplexity" && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="adres-mcp" className="text-sm font-bold">Adres serwera</label>
                    <div className="flex gap-2">
                      <input
                        id="adres-mcp"
                        type="text"
                        readOnly
                        value={adres}
                        onFocus={(e) => e.currentTarget.select()}
                        className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
                      />
                      <PrzyciskKopiuj
                        tekst={adres}
                        onKopiuj={() => {
                          zdarzenieLacznikAi("kopiuj_adres");
                          zapiszKlikniecieLacznika(zrodlo, "kopiuj", czat);
                        }}
                      />
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">{KROKI[czat].uwaga}</p>
              </div>
            </div>
          </section>

          {/* ── Krok 3: sprawdzenie ─────────────────────────────────── */}
          <section className="flex flex-col gap-4" aria-labelledby="sprawdz">
            <NaglowekKroku nr={3} tytul="Sprawdź, czy działa" id="sprawdz" />
            <p className="leading-relaxed text-foreground/80">Zapytaj na przykład tak. Kliknięcie kopiuje pytanie.</p>
            <div className="flex flex-wrap gap-2.5">
              {PYTANIA.map((p) => (
                <PrzyciskKopiuj
                  key={p}
                  tekst={p}
                  etykieta={`„${p}”`}
                  className="h-auto min-h-[46px] whitespace-normal rounded-xl px-4 py-2.5 text-left font-normal"
                />
              ))}
            </div>
          </section>

          {/* ── Gdy czegoś brakuje ──────────────────────────────────── */}
          <section className="flex flex-col border-t border-border pt-6" aria-labelledby="pytania">
            <h2 id="pytania" className="mb-2 font-display text-[1.75rem] text-foreground">Gdy czegoś brakuje</h2>
            {[
              {
                pytanie: "Co potrafi czat z naszymi danymi?",
                odpowiedz: (
                  <ul className="list-disc space-y-1.5 pl-5">
                    <li>
                      <Link to="/baza-kultur" className="underline">Baza kultur</Link>: kultury do sera, jogurtu i twarogu z
                      polskich sklepów, z ceną za litr mleka i zamiennikami o tym samym składzie.
                    </li>
                    <li>
                      <Link to="/przepisy" className="underline">Przepisy na sery</Link>: pełny przepis z temperaturami i czasami
                      oraz kultury do kupienia.
                    </li>
                  </ul>
                ),
              },
              {
                pytanie: "Gdzie jest kalkulator pasz?",
                odpowiedz: (
                  <p>
                    Od 28 października 2026 kalkulator paszy ma własny serwis i własny łącznik:{" "}
                    <a href="https://mojapasza.com/asystenci-ai" className="underline">mojapasza.com/asystenci-ai</a>. Jeśli
                    masz już łącznik Moja Serowarnia, narzędzia paszowe działają w nim do końca lutego 2027.
                  </p>
                ),
              },
              {
                pytanie: "Nie widzę opcji dodania serwera",
                odpowiedz: (
                  <p>
                    W ChatGPT opcja „Dodaj niestandardowy serwer MCP” zależy od planu, a na kontach firmowych włącza ją
                    administrator. W Claude własne łączniki działają na każdym planie, na darmowym jeden. W Perplexity
                    umiejętność dodasz na każdym planie, także darmowym.
                  </p>
                ),
              },
              {
                pytanie: "A Gemini?",
                odpowiedz: (
                  <p>
                    Na razie nie da się go podłączyć z Polski. Google pozwala dodać własny serwer MCP tylko w Gemini Spark,
                    a ten działa w USA, po angielsku i w płatnych planach (stan na 25 października 2026).{" "}
                    <Link to="/kalkulator-pasz" className="underline">Kalkulator pasz</Link> i{" "}
                    <Link to="/baza-kultur" className="underline">bazę kultur</Link> masz za to na naszej stronie, bez logowania.
                  </p>
                ),
              },
              {
                pytanie: "Czat nie sięga do naszych danych",
                odpowiedz: (
                  <p>
                    W Claude kliknij <strong>+</strong> pod polem wiadomości, wybierz <strong>Connectors</strong> i włącz
                    Moja Serowarnia. W ChatGPT zacznij nową rozmowę po dodaniu wtyczki. W Perplexity pytaj w trybie
                    <strong> Computer</strong>.
                  </p>
                ),
              },
              {
                pytanie: "Prywatność i limity",
                odpowiedz: (
                  <ul className="list-disc space-y-1.5 pl-5">
                    <li>Serwer tylko odczytuje nasze dane. Nie widzi Twoich rozmów, dostaje wyłącznie zapytania, które czat do niego wyśle.</li>
                    <li>Bez konta i bez klucza, do 30 zapytań na minutę.</li>
                    <li>Liczymy tylko, ile razy dziennie użyto każdego narzędzia i z jakiego programu. Bez adresu IP i bez treści pytań.</li>
                    <li>Ceny pochodzą ze stron sklepów i mają datę sprawdzenia.</li>
                    <li>Baza kultur i przepisy są na licencji CC BY 4.0: można je cytować z podaniem źródła. Ceny sklepów są poza CC BY: podawaj je z datą i linkiem do oferty.</li>
                    <li>
                      Pełne zasady: <Link to="/nota-prawna#serwer-mcp" className="underline">prywatność</Link> i{" "}
                      <Link to="/warunki-mcp" className="underline">warunki korzystania z serwera MCP</Link>.
                    </li>
                  </ul>
                ),
              },
              {
                pytanie: "Claude Code, Cursor i inne programy",
                odpowiedz: (
                  <div className="flex flex-col gap-2.5">
                    <p>W Claude Code, czyli Claude w terminalu, wystarczy jedno polecenie:</p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <pre className="min-w-0 flex-1 whitespace-pre-wrap break-all rounded-md border border-border bg-background px-3 py-2 font-mono text-sm">
                        <code>{POLECENIE_CLAUDE_CODE}</code>
                      </pre>
                      <PrzyciskKopiuj tekst={POLECENIE_CLAUDE_CODE} />
                    </div>
                    <p>W Cursorze i innych programach z plikiem serwerów MCP (w Cursorze mcp.json) wklej taki wpis:</p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <pre className="min-w-0 flex-1 whitespace-pre-wrap break-all rounded-md border border-border bg-background px-3 py-2 font-mono text-sm">
                        <code>{WPIS_KONFIGURACJI}</code>
                      </pre>
                      <PrzyciskKopiuj tekst={WPIS_KONFIGURACJI} />
                    </div>
                    <p>
                      Program z innym formatem albo z formularzem przyjmie sam adres:{" "}
                      <code className="font-mono">{ADRES_MCP}</code>.
                    </p>
                  </div>
                ),
              },
              {
                pytanie: "Budujesz własną aplikację?",
                odpowiedz: (
                  <p>
                    Możesz oprzeć ją na naszym serwerze, także komercyjnie: doradcę serowara, wyszukiwarkę kultur na
                    stronie sklepu albo listę zakupów. Wystarczy podać źródło z linkiem, zostawić zastrzeżenia i daty
                    cen oraz dopisać do adresu znacznik <code className="font-mono">?z=app-twoja-nazwa</code>. Gdy 30 zapytań na
                    minutę nie wystarczy, dostaniesz od nas darmowy klucz z limitem 300. Zasady i
                    instrukcję techniczną opisujemy w{" "}
                    <Link to="/warunki-mcp#aplikacje" className="underline">warunkach korzystania z serwera</Link>.
                  </p>
                ),
              },
            ].map((p) => (
              <details key={p.pytanie} className="group border-b border-border/70 py-3.5">
                <summary className="flex min-h-[44px] cursor-pointer items-center text-[17px] font-bold text-foreground">{p.pytanie}</summary>
                <div className="pt-2 text-[15px] leading-relaxed text-foreground/80">{p.odpowiedz}</div>
              </details>
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AsystenciAi;
