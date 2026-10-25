import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PodlaczWSwoimCzacie from "@/components/PodlaczWSwoimCzacie";
import { Button } from "@/components/ui/button";
import { zdarzenieLacznikAi } from "@/lib/zdarzeniaGa4";
import {
  UMIEJETNOSC_PERPLEXITY,
  WTYCZKI_CHATGPT,
  adresLacznika,
  linkClaude,
  zapiszKlikniecieLacznika,
  type Asystent,
} from "@/lib/lacznikClaude";

/**
 * mojapasza.com/asystenci-ai: jak podłączyć łącznik mojapasza.com/mcp do ChatGPT,
 * Claude albo Perplexity (od 26.10.2026). Krótsza wersja strony Serowarni
 * (src/pages/AsystenciAi.tsx), tylko o paszach: najpierw ramka z gotowym tekstem
 * (czat sam przeprowadza), niżej kroki z adresem dla tych, którzy wolą sami.
 * Kroki jak na stronie Serowarni (etykiety ChatGPT i Perplexity po polsku, Claude
 * po angielsku); zmiana tam = zmiana tu i w src/lib/promptyCzatow.ts.
 * Mirror dla botów: pasze/public/mirror/asystenci-ai.html.
 */

const ZRODLO = "/asystenci-ai";

const PYTANIA = [
  "Ułóż paszę dla 10 kur niosek z pszenicy, kukurydzy i śruty sojowej.",
  "Moje kury nie niosą. Co robię źle?",
  "Ile grochu mogę dać kurczętom brojlerom?",
  "Czym uzupełnić wapń w paszy i ile to kosztuje?",
  "Ile paszy kupić na miesiąc dla 20 kaczek?",
];

async function kopiuj(tekst: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(tekst);
    return true;
  } catch {
    return false;
  }
}

const PrzyciskKopiuj = ({ tekst }: { tekst: string }) => {
  const [ok, setOk] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="shrink-0"
      onClick={async () => {
        if (await kopiuj(tekst)) {
          setOk(true);
          setTimeout(() => setOk(false), 2500);
        }
      }}
    >
      {ok ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {ok ? "Skopiowano" : "Kopiuj"}
    </Button>
  );
};

const AsystenciAi = () => {
  const adres = adresLacznika(ZRODLO);

  const link = (href: string, tresc: ReactNode, asystent: Asystent) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="font-semibold text-primary underline"
      onClick={() => {
        zdarzenieLacznikAi(`polacz_${asystent}` as const);
        zapiszKlikniecieLacznika(ZRODLO, "przycisk", asystent);
        if (asystent !== "perplexity") void kopiuj(adres);
      }}
    >
      {tresc}
    </a>
  );

  const CZATY: { id: Asystent; nazwa: string; kroki: ReactNode[]; uwaga: string }[] = [
    {
      id: "chatgpt",
      nazwa: "ChatGPT",
      kroki: [
        <>Otwórz {link(WTYCZKI_CHATGPT, "wtyczki w ChatGPT", "chatgpt")} i kliknij <strong>Dodaj</strong> w prawym górnym rogu, obok koła zębatego.</>,
        <>Wybierz <strong>Dodaj niestandardowy serwer MCP</strong>.</>,
        <>Nazwa: <strong>Moja Pasza</strong>. Wklej adres łącznika, uwierzytelnianie: <strong>brak</strong>. Potwierdź ostrzeżenie i utwórz wtyczkę.</>,
        <>Na liście <strong>Osobiste</strong> kliknij <strong>+</strong> przy Moja Pasza. Potem pytaj w zwykłej rozmowie.</>,
      ],
      uwaga: "Jeśli nie widzisz opcji niestandardowego serwera MCP, Twój plan jej nie ma; na kontach firmowych włącza ją administrator.",
    },
    {
      id: "claude",
      nazwa: "Claude",
      kroki: [
        <>Kliknij {link(linkClaude(ZRODLO), "Dodaj do Claude", "claude")}: otworzy się formularz z wpisaną nazwą i adresem. Gdyby był pusty, wejdź w <strong>Customize</strong>, zakładka <strong>Connectors</strong>, <strong>+ Add</strong>, <strong>Add custom connector</strong> i wklej adres.</>,
        <>Sprawdź, że adres zaczyna się od mojapasza.com, kliknij <strong>Continue</strong>, potem <strong>Add</strong>.</>,
        <>W rozmowie kliknij <strong>+</strong> pod polem wiadomości, wybierz <strong>Connectors</strong> i włącz Moja Pasza.</>,
      ],
      uwaga: "Własne łączniki działają na każdym planie Claude, także darmowym. Łącznik działa też w aplikacji na telefonie.",
    },
    {
      id: "perplexity",
      nazwa: "Perplexity",
      kroki: [
        <>Otwórz {link(UMIEJETNOSC_PERPLEXITY, "umiejętność w Perplexity", "perplexity")} i zaloguj się, jeśli strona o to poprosi.</>,
        <>Kliknij <strong>…</strong> w prawym górnym rogu i wybierz <strong>Importuj kopię</strong>, potem <strong>Zapisz</strong>.</>,
        <>Pytaj w trybie <strong>Computer</strong>, na przykład „ułóż paszę dla niosek z pszenicy i kukurydzy”.</>,
      ],
      uwaga: "Działa także na darmowym planie. W zwykłym wyszukiwaniu Perplexity odpowiada z sieci, bez naszych obliczeń.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Asystenci AI" }]} />
      <main className="container mx-auto max-w-3xl px-4 pb-12">
        <h1 className="font-display text-3xl leading-tight md:text-4xl">Kalkulator paszy w Twoim czacie</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Podłącz nasz kalkulator do ChatGPT, Claude albo Perplexity i układaj paszę w zwykłej rozmowie. Czat liczy
          mieszankę tym samym algorytmem i według tych samych norm co kalkulator na tej stronie, mówi, czego brakuje,
          i podaje dodatki z cenami ze sklepów. Bez konta u nas i bez klucza.
        </p>

        <PodlaczWSwoimCzacie sciezka={ZRODLO} className="mt-8" />

        <section aria-labelledby="adres" className="mt-10">
          <h2 id="adres" className="font-display text-2xl">Wolisz sam? Adres łącznika</h2>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="block flex-1 break-all rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">{adres}</code>
            <PrzyciskKopiuj tekst={adres} />
          </div>
        </section>

        {CZATY.map((c) => (
          <section key={c.id} id={c.id} aria-labelledby={`${c.id}-tytul`} className="mt-8 scroll-mt-24">
            <h3 id={`${c.id}-tytul`} className="text-xl font-bold">{c.nazwa}</h3>
            <ol className="mt-2 list-decimal space-y-2 pl-6">
              {c.kroki.map((k, i) => <li key={i}>{k}</li>)}
            </ol>
            <p className="mt-2 text-sm text-muted-foreground">{c.uwaga}</p>
          </section>
        ))}

        <section aria-labelledby="pytania" className="mt-10">
          <h2 id="pytania" className="font-display text-2xl">O co pytać</h2>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            {PYTANIA.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </section>

        <section aria-labelledby="warto" className="mt-10">
          <h2 id="warto" className="font-display text-2xl">Co warto wiedzieć</h2>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>Łącznik tylko odczytuje nasze dane. Nie widzi Twoich rozmów, dostaje wyłącznie zapytania, które czat do niego wyśle.</li>
            <li>Bez konta i bez klucza, do 30 zapytań na minutę.</li>
            <li>Liczymy tylko, ile razy dziennie użyto każdego narzędzia i z jakiego programu. Bez adresu IP i bez treści pytań.</li>
            <li>Ceny pochodzą ze stron sklepów i mają datę sprawdzenia. Wynik to obliczenie, nie porada lekarza weterynarii.</li>
            <li>
              Dane są na licencji CC BY 4.0. Zasady: <a href="/warunki" className="text-primary underline">warunki</a>,{" "}
              <a href="/prywatnosc#serwer-mcp" className="text-primary underline">prywatność</a>.
            </li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AsystenciAi;
