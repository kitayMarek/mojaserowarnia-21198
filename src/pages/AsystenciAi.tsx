import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, Plug } from "lucide-react";
import { zdarzenieLacznikAi } from "@/lib/zdarzeniaGa4";
import { ADRES_MCP, adresLacznika, linkClaude, zapiszKlikniecieLacznika, zrodloZeSciezki } from "@/lib/lacznikClaude";

/**
 * Jak podłączyć serwer MCP serwisu (worker-magazyn/, dane.mojaserowarnia.pl/mcp)
 * do Claude: baza kultur i kalkulator pasz dla drobiu jako łącznik.
 *
 * PRZYCISK „POŁĄCZ Z CLAUDE” KOPIUJE ADRES I OTWIERA ŁĄCZNIKI, a instrukcja
 * zakłada, że pola trzeba wypełnić ręcznie. Link ma nieoficjalne parametry
 * (modal, connectorName, connectorUrl), ale nie wolno na nich polegać:
 * 21.10.2026 otwarty w zwykłej karcie Chrome Marka dawał okno „Add custom
 * connector” z wpisaną nazwą i adresem (plus ostrzeżenie o linku z zewnątrz),
 * a kliknięty przez Marka z aplikacji Claude przechodził na
 * /customize/connectors/yours?open_in_browser=1 i gubił parametry, więc
 * pokazywał same łączniki. Gorszy przypadek to i tak strona łączników, dlatego
 * parametry zostają, a obietnicy „jednego kliknięcia” na stronie nie ma.
 *
 * Nazwy przycisków w krokach są z angielskiej wersji Claude.ai (21.10.2026),
 * plany i ograniczenia z support.claude.com („About custom integrations using
 * remote MCP”).
 *
 * Linki do serwisu z ?utm_source=magazyn są tylko w odpowiedziach serwera MCP,
 * nie tutaj: ta strona to zwykłe wejście, a znacznik liczy ruch z czatów.
 *
 * Treść 1:1 z mirrorem public/asystenci-ai.html, tytuł i opis w metaStron.ts.
 */

// Adresy i pomiar w src/lib/lacznikClaude.ts. Polecenie dla Claude Code ma
// znacznik "claude-code", zeby serwer MCP odroznil te podlaczenia.
const POLECENIE_CLAUDE_CODE = `claude mcp add --transport http serowarnia ${adresLacznika("claude-code")}`;

const PYTANIA = [
  "Jak zrobić mozzarellę w domu i gdzie kupię do niej kulturę?",
  "Zrób paszę dla kur niosek z pszenicy, kukurydzy, śruty sojowej i kredy.",
  "Jaka kultura do camemberta i czym ją zastąpić?",
  "Która kultura mezofilna wychodzi najtaniej w przeliczeniu na litr mleka?",
  "Mam przepis z Choozit MA 4001. Co ma ten sam skład i gdzie to kupię?",
  "Policz mieszankę dla brojlerów: 60% kukurydzy, 30% śruty sojowej, 10% pszenicy. Czego brakuje?",
];

/**
 * Kopiuje tekst do schowka. Schowek bywa zablokowany (stara przeglądarka, okno
 * osadzone, brak zgody): wtedy zaznaczamy tekst na stronie i próbujemy starszej
 * metody; jeśli i ta zawiedzie, tekst zostaje zaznaczony do skopiowania ręcznie.
 */
async function kopiujTekst(tekst: string, zaznacz: () => void): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(tekst);
    return true;
  } catch {
    zaznacz();
    return document.execCommand("copy");
  }
}

const AsystenciAi = () => {
  const [skopiowano, setSkopiowano] = useState(false);
  const [skopiowanoPolecenie, setSkopiowanoPolecenie] = useState(false);
  const pole = useRef<HTMLInputElement>(null);
  const polecenie = useRef<HTMLElement>(null);
  // Strona, z ktorej ktos przyszedl przyciskiem „Dodaj do Claude” w menu bocznym
  // (Navigation.tsx przekazuje ja w stanie nawigacji). Idzie do adresu lacznika
  // jako znacznik, wiec serwer MCP pokaze, skad przyszlo podlaczenie.
  const location = useLocation();
  const stan = location.state as { z?: unknown } | null;
  // Albo z adresu: krotki link mojaserowarnia.pl/claude?z=fb-grupa przekierowuje
  // tu z ?z= (worker/index.js, regula 1a1b), np. z posta w grupie na Facebooku.
  const zAdresu = new URLSearchParams(location.search).get("z");
  const zrodlo = zrodloZeSciezki(typeof stan?.z === "string" ? stan.z : zAdresu ?? "/asystenci-ai");
  const adres = adresLacznika(zrodlo);

  const kopiuj = async () => {
    if (await kopiujTekst(adres, () => pole.current?.select())) {
      setSkopiowano(true);
      setTimeout(() => setSkopiowano(false), 2500);
    }
  };

  const kopiujPolecenie = async () => {
    const zaznacz = () => {
      if (polecenie.current) window.getSelection()?.selectAllChildren(polecenie.current);
    };
    if (await kopiujTekst(POLECENIE_CLAUDE_CODE, zaznacz)) {
      setSkopiowanoPolecenie(true);
      setTimeout(() => setSkopiowanoPolecenie(false), 2500);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Baza kultur i kalkulator pasz w Claude: jak podłączyć",
    description:
      "Jak dodać serwer MCP Mojej Serowarni do Claude jako łącznik: baza kultur bakteryjnych do sera i kalkulator pasz dla drobiu w rozmowie z asystentem AI.",
    inLanguage: "pl",
    url: "https://mojaserowarnia.pl/asystenci-ai",
    image: "https://mojaserowarnia.pl/og-image.jpg",
    datePublished: "2026-10-21",
    dateModified: "2026-10-21",
    publisher: { "@type": "Organization", name: "Moja Serowarnia", url: "https://mojaserowarnia.pl/" },
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Navigation />
      <PageBreadcrumbs items={[{ label: "Narzędzia", href: "/narzedzia" }, { label: "Asystenci AI" }]} />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-3xl mx-auto">
            <PageHeader
              icon={Plug}
              color="violet"
              title="Baza kultur i kalkulator pasz w Claude"
              subtitle="Podłącz nasze dane do Claude jako łącznik. Pytasz w rozmowie, a Claude sprawdza w bazie i liczy naszym kalkulatorem, zamiast odpowiadać z pamięci."
            />

            <p className="mt-6 mb-8 leading-relaxed">
              Bez łącznika model pisze o kulturach z tego, co zapamiętał, często o takich, których w Polsce nie
              kupisz. Z łącznikiem sprawdza, co jest w polskich sklepach i ile kosztuje w przeliczeniu na litr
              mleka, a paszę dla drobiu układa z Twoich surowców pod normę. Nie trzeba zakładać konta ani
              podawać klucza.
            </p>

            <div className="space-y-6">
              {/* ── JAK PODŁĄCZYĆ ─────────────────────────────────────────── */}
              <Card className="border-primary/40 bg-primary/5">
                <CardHeader>
                  <CardTitle>Jak podłączyć w Claude</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <a
                        href={linkClaude(zrodlo)}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        onClick={() => {
                          zdarzenieLacznikAi("polacz_claude");
                          zapiszKlikniecieLacznika(zrodlo, "przycisk");
                          // Bez czekania: karta otwiera się zwykłym kliknięciem w link.
                          void kopiuj();
                        }}
                      >
                        Połącz z Claude
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </Button>
                    <p className="text-muted-foreground mt-2" aria-live="polite">
                      {skopiowano
                        ? "Adres jest w schowku. W karcie Claude wklej go w pole MCP server URL."
                        : "Przycisk otworzy w nowej karcie Claude z wpisaną nazwą i adresem. Claude pokaże przy tym żółte ostrzeżenie, że łącznik przyszedł z linku z zewnątrz: to zwykły komunikat przy każdym takim łączniku. Sprawdź, że adres zaczyna się od https://dane.mojaserowarnia.pl/mcp, i kliknij Continue."}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="adres-mcp" className="block font-medium mb-1">
                      Adres serwera
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id="adres-mcp"
                        ref={pole}
                        type="text"
                        readOnly
                        value={adres}
                        onFocus={(e) => e.currentTarget.select()}
                        className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          zdarzenieLacznikAi("kopiuj_adres");
                          zapiszKlikniecieLacznika(zrodlo, "kopiuj");
                          void kopiuj();
                        }}
                        className="shrink-0"
                      >
                        {skopiowano ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Copy className="h-4 w-4" aria-hidden="true" />
                        )}
                        {skopiowano ? "Skopiowano" : "Kopiuj"}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-1">W Claude.ai</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>
                        Na stronie łączników kliknij <strong>+ Add</strong>, potem <strong>Add custom connector</strong>.
                        Gdyby się nie otworzyła, znajdziesz ją w menu po lewej: <strong>Customize</strong>, zakładka{" "}
                        <strong>Connectors</strong>.
                      </li>
                      <li>
                        W polu <strong>Name</strong> wpisz „Moja Serowarnia”, w polu <strong>MCP server URL</strong>{" "}
                        wklej adres (Ctrl+V).
                      </li>
                      <li>
                        Kliknij <strong>Continue</strong>, a potem <strong>Add</strong>. Logowanie ani klucz nie są
                        potrzebne.
                      </li>
                    </ol>
                    <p className="text-muted-foreground mt-2">
                      Zwykle Claude od razu pokazuje okno z wpisaną nazwą i adresem oraz żółtym ostrzeżeniem, że
                      łącznik przyszedł z linku z zewnątrz. Claude pokazuje je przy każdym łączniku dodawanym z
                      linku, więc nie oznacza problemu. Sprawdź, czy adres zaczyna się od
                      https://dane.mojaserowarnia.pl/mcp, i kliknij Continue. Nazwy przycisków podajemy tak, jak
                      wyglądają w angielskiej wersji Claude.
                    </p>
                  </div>

                  <p>
                    <strong>W rozmowie:</strong> jeśli Claude nie sięga do łącznika, kliknij <strong>+</strong>{" "}
                    pod polem wiadomości, wybierz <strong>Connectors</strong> i włącz Moja Serowarnia.
                  </p>
                  <p className="text-muted-foreground">
                    Własne łączniki działają na każdym planie Claude, także darmowym, na którym można dodać jeden.
                    W planach Team i Enterprise dodaje je właściciel organizacji, a pozostali tylko je włączają.
                    Łącznik dodany w przeglądarce działa też w aplikacji Claude na telefonie.
                  </p>
                </CardContent>
              </Card>

              {/* ── CO POTRAFI ────────────────────────────────────────────── */}
              <Card>
                <CardHeader>
                  <CardTitle>Co potrafi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <h3 className="font-semibold mb-1">
                      <Link to="/baza-kultur" className="underline">Baza kultur do sera</Link>
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Szuka kultur do sera, jogurtu, kefiru i twarogu po nazwie sera albo zastosowaniu, z filtrem
                        typu, temperatury pracy i sklepu.
                      </li>
                      <li>
                        Podaje kartę kultury: skład, zastosowanie, temperaturę, dawkowanie, ceny w sklepach i cenę
                        za litr mleka.
                      </li>
                      <li>
                        Znajduje kultury o tym samym składzie gatunkowym, od najtańszej w przeliczeniu na litr
                        mleka, z zastrzeżeniem, że ten sam skład nie znaczy ten sam produkt.
                      </li>
                      <li>Przy każdej kulturze daje link do jej karty w serwisie.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      <Link to="/przepisy" className="underline">Przepisy na sery</Link>
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Podaje pełny przepis z serwisu: mleko, kultura, podpuszczka, dawki, kroki z temperaturami
                        i czasami, solenie i dojrzewanie.
                      </li>
                      <li>
                        Do kultur z przepisu dobiera oferty z bazy: sklep, cenę i cenę za litr mleka, a do tego inne
                        kultury, które sklepy opisują jako pasujące do tego sera.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      <Link to="/kalkulator-pasz" className="underline">Kalkulator pasz dla drobiu</Link>
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Zna ponad 120 surowców paszowych (zboża, śruty, strączkowe, dodatki mineralne, premiksy)
                        i normy dla kur niosek, brojlerów, kaczek, gęsi i indyków.
                      </li>
                      <li>
                        Dobiera proporcje z Twoich surowców tym samym algorytmem co kalkulator na stronie, a gdy
                        podasz ceny, szuka najtańszej mieszanki bliskiej normie.
                      </li>
                      <li>Liczy gotową mieszankę i pokazuje, co wychodzi poza normę i czego dodać.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* ── PRZYKŁADOWE PYTANIA ───────────────────────────────────── */}
              <Card>
                <CardHeader>
                  <CardTitle>O co można zapytać</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed">
                  <ul className="space-y-2">
                    {PYTANIA.map((p) => (
                      <li key={p} className="rounded-md border border-border bg-background px-3 py-2">
                        „{p}”
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* ── CO WARTO WIEDZIEĆ ─────────────────────────────────────── */}
              <Card>
                <CardHeader>
                  <CardTitle>Co warto wiedzieć</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Serwer tylko odczytuje dane. Nie widzi Twoich rozmów, dostaje wyłącznie zapytania, które Claude
                      do niego wyśle.
                    </li>
                    <li>Bez konta i bez klucza, do 30 zapytań na minutę.</li>
                    <li>
                      Liczymy tylko, ile razy dziennie użyto każdego narzędzia i z jakiego programu (Claude,
                      ChatGPT i inne). Bez adresu IP i bez treści pytań.
                    </li>
                    <li>
                      Ceny kultur pochodzą ze stron sklepów i każda ma datę sprawdzenia. Przed zakupem sprawdź cenę
                      w sklepie.
                    </li>
                    <li>Wynik paszowy to obliczenie na danych wzorcowych, nie porada lekarza weterynarii.</li>
                    <li>Dane są na licencji CC BY 4.0: można je cytować z podaniem źródła.</li>
                  </ul>
                </CardContent>
              </Card>

              {/* ── CHATGPT I INNE ────────────────────────────────────────── */}
              <Card>
                <CardHeader>
                  <CardTitle>Claude Code, ChatGPT i inne programy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-relaxed">
                  <p>W Claude Code, czyli Claude w terminalu, wystarczy jedno polecenie:</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <pre className="min-w-0 flex-1 whitespace-pre-wrap break-all rounded-md border border-border bg-background px-3 py-2 font-mono text-sm">
                      <code ref={polecenie}>{POLECENIE_CLAUDE_CODE}</code>
                    </pre>
                    <Button type="button" variant="outline" onClick={() => void kopiujPolecenie()} className="shrink-0">
                      {skopiowanoPolecenie ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                      {skopiowanoPolecenie ? "Skopiowano" : "Kopiuj"}
                    </Button>
                  </div>
                  <p>
                    W ChatGPT własny serwer MCP dodasz tylko w trybie dewelopera (Developer mode), który jest
                    dostępny na płatnych planach. Adres jest ten sam.
                  </p>
                  <p>
                    Inne programy, które obsługują zdalne serwery MCP, przyjmą ten sam adres:{" "}
                    <code className="font-mono">{ADRES_MCP}</code>.
                  </p>
                </CardContent>
              </Card>
            </div>

            <nav className="flex flex-wrap gap-4 text-sm border-t border-border pt-6 mt-10 mb-12">
              <Link to="/baza-kultur" className="underline">Baza kultur</Link>
              <Link to="/zamienniki-kultur" className="underline">Zamienniki kultur</Link>
              <Link to="/kalkulator-pasz" className="underline">Kalkulator pasz dla drobiu</Link>
              <Link to="/narzedzia" className="underline">Wszystkie narzędzia</Link>
            </nav>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AsystenciAi;
