import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, ExternalLink, MessagesSquare, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zdarzeniePromptCzatu } from "@/lib/zdarzeniaGa4";
import {
  UMIEJETNOSC_PERPLEXITY,
  linkClaude,
  zapiszKlikniecieLacznika,
  type Asystent,
} from "@/lib/lacznikClaude";
import { adresZPromptu, linkZPromptem, promptPodlaczenia, zrodloRamki, type TematPromptu } from "@/lib/promptyCzatow";

/**
 * Ramka „Podłącz w swoim czacie”: zakładki ChatGPT, Claude, Perplexity, w każdej
 * gotowy tekst, który przeprowadzi użytkownika przez podłączenie serwera MCP
 * w jego własnym czacie. Treść promptów i powody: src/lib/promptyCzatow.ts.
 *
 * Kotwica #w-swoim-czacie: kalkulator ma u góry odnośnik, który tu przewija.
 */

const NAZWA: Record<Asystent, string> = { chatgpt: "ChatGPT", claude: "Claude", perplexity: "Perplexity" };

const KOLOR: Record<Asystent, string> = {
  chatgpt: "bg-[#10A37F] hover:bg-[#0e8f6f]",
  claude: "bg-[#D97757] hover:bg-[#c4664a]",
  perplexity: "bg-[#20808D] hover:bg-[#1a6b76]",
};

const TYTUL: Record<TematPromptu, string> = {
  pasze: "Licz paszę w swoim czacie",
  sery: "Pytaj o sery w swoim czacie",
  ogolny: "Niech Twój czat sam Cię przeprowadzi",
};

const CO_PODLACZYSZ: Record<TematPromptu, string> = {
  pasze: "naszego kalkulatora pasz",
  sery: "naszej bazy kultur i przepisów",
  ogolny: "naszej bazy kultur i przepisów",
};

const KOTWICA_INSTRUKCJI: Record<Asystent, string> = {
  chatgpt: "/asystenci-ai#chatgpt",
  claude: "/asystenci-ai#claude",
  perplexity: "/asystenci-ai#perplexity",
};

/** Schowek bywa zablokowany: wtedy zaznaczamy tekst i próbujemy starszej metody. */
async function kopiujTekst(tekst: string, zaznacz: () => void): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(tekst);
    return true;
  } catch {
    zaznacz();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    }
  }
}

const ZakladkaCzatu = ({ asystent, temat, zrodlo }: { asystent: Asystent; temat: TematPromptu; zrodlo: string }) => {
  // Co jest w schowku: tekst (przycisk „Kopiuj tekst”) albo adres serwera (przycisk „Otwórz”).
  const [skopiowano, setSkopiowano] = useState<"tekst" | "adres" | null>(null);
  const pole = useRef<HTMLPreElement>(null);
  const prompt = promptPodlaczenia(asystent, temat, zrodlo);
  const nazwa = NAZWA[asystent];
  // ChatGPT i Claude proszą o adres w formularzu, a tekst wpisuje link ?q=. W Perplexity
  // adres jest w umiejętności, więc na zapas kopiujemy tekst.
  const otworzKopiujeAdres = asystent !== "perplexity";

  const kopiuj = async (co: "tekst" | "adres") => {
    const zaznacz = () => {
      if (co === "tekst" && pole.current) window.getSelection()?.selectAllChildren(pole.current);
    };
    if (await kopiujTekst(co === "tekst" ? prompt : adresZPromptu(asystent, zrodlo), zaznacz)) {
      setSkopiowano(co);
      setTimeout(() => setSkopiowano(null), 6000);
    }
  };

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {asystent === "claude" && (
        <p>
          <a
            href={linkClaude(zrodlo)}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={() => {
              zapiszKlikniecieLacznika(zrodlo, "przycisk", "claude");
              zdarzeniePromptCzatu("claude", "formularz");
            }}
            className="font-semibold text-primary underline"
          >
            Dodaj do Claude jednym kliknięciem
          </a>{" "}
          (formularz z wpisanym adresem, kliknij tam Continue i Add). Wolisz, żeby Claude Cię przeprowadził? Wklej mu
          ten tekst:
        </p>
      )}
      {asystent === "perplexity" && (
        <p>
          <a
            href={UMIEJETNOSC_PERPLEXITY}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={() => {
              zapiszKlikniecieLacznika(zrodlo, "przycisk", "perplexity");
              zdarzeniePromptCzatu("perplexity", "umiejetnosc");
            }}
            className="font-semibold text-primary underline"
          >
            Otwórz umiejętność w Perplexity
          </a>
          , kliknij tam <strong>…</strong>, <strong>Importuj kopię</strong> i <strong>Zapisz</strong>. Albo wklej
          Perplexity ten tekst:
        </p>
      )}
      {asystent === "chatgpt" && (
        <p>Daj ten tekst ChatGPT. Poprowadzi Cię przez dodanie wtyczki, a na koniec sprawdzi, czy działa.</p>
      )}

      <pre
        ref={pole}
        className="max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-background px-3 py-2 font-sans text-[13px] leading-snug"
      >
        {prompt}
      </pre>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild className={`h-11 text-white font-semibold ${KOLOR[asystent]}`}>
          <a
            href={linkZPromptem(asystent, prompt)}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={() => {
              zapiszKlikniecieLacznika(zrodlo, "prompt-otworz", asystent);
              zdarzeniePromptCzatu(asystent, "otworz");
              // Bez czekania: karta otwiera się zwykłym kliknięciem w link.
              void kopiuj(otworzKopiujeAdres ? "adres" : "tekst");
            }}
          >
            Otwórz {nazwa} z tym tekstem
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => {
            zapiszKlikniecieLacznika(zrodlo, "prompt-kopiuj", asystent);
            zdarzeniePromptCzatu(asystent, "kopiuj");
            void kopiuj("tekst");
          }}
        >
          {skopiowano === "tekst" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {skopiowano === "tekst" ? "Skopiowano" : "Kopiuj tekst"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {skopiowano === "adres"
          ? `Adres serwera jest w schowku: wklej go (Ctrl+V), gdy ${nazwa} o niego poprosi. Gdyby pole w ${nazwa} zostało puste, wróć tu i kliknij Kopiuj tekst.`
          : skopiowano === "tekst"
            ? `Tekst jest w schowku. Jeśli pole w ${nazwa} jest puste, wklej go (Ctrl+V) i wyślij.`
            : otworzKopiujeAdres
              ? `Przycisk otworzy ${nazwa} z wpisanym tekstem i skopiuje adres serwera do wklejenia w formularzu. Potrzebne jest konto w ${nazwa}.`
              : `Przycisk otworzy ${nazwa} z wpisanym tekstem i skopiuje go na zapas. Potrzebne jest konto w ${nazwa}.`}
      </p>
      <p className="text-xs text-muted-foreground">
        Wolisz sam?{" "}
        <Link to={KOTWICA_INSTRUKCJI[asystent]} state={{ z: zrodlo }} className="underline">
          Instrukcja krok po kroku dla {nazwa}
        </Link>
      </p>
    </div>
  );
};

const PodlaczWSwoimCzacie = ({
  sciezka,
  temat = "pasze",
  className = "",
}: {
  /** Ścieżka strony, np. "/baza-kultur": znacznik w adresie serwera i w liczniku kliknięć. */
  sciezka: string;
  temat?: TematPromptu;
  className?: string;
}) => {
  const zrodlo = zrodloRamki(sciezka);
  return (
    <section
      id="w-swoim-czacie"
      aria-labelledby="w-swoim-czacie-tytul"
      className={`scroll-mt-24 rounded-xl border-2 border-primary/30 bg-primary/5 p-4 sm:p-5 ${className}`}
    >
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <MessagesSquare className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h2 id="w-swoim-czacie-tytul" className="text-lg font-bold leading-tight">
            {TYTUL[temat]}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Masz ChatGPT, Claude albo Perplexity? Daj mu ten tekst, a sam przeprowadzi Cię przez podłączenie{" "}
            {CO_PODLACZYSZ[temat]}. Robisz to raz, potem pytasz w zwykłej rozmowie. Bez konta u nas i bez klucza.
          </p>
        </div>
      </div>

      <Tabs defaultValue="chatgpt">
        <TabsList className="grid h-11 w-full grid-cols-3">
          {(Object.keys(NAZWA) as Asystent[]).map((a) => (
            <TabsTrigger key={a} value={a} className="h-9">
              {NAZWA[a]}
            </TabsTrigger>
          ))}
        </TabsList>
        {(Object.keys(NAZWA) as Asystent[]).map((a) => (
          <TabsContent key={a} value={a} className="mt-3">
            <ZakladkaCzatu asystent={a} temat={temat} zrodlo={zrodlo} />
          </TabsContent>
        ))}
      </Tabs>

      <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
        <Plug className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        Serwer tylko odczytuje nasze dane. Nie widzi Twoich rozmów, dostaje wyłącznie pytania, które czat do niego wyśle.
      </p>
    </section>
  );
};

export default PodlaczWSwoimCzacie;
