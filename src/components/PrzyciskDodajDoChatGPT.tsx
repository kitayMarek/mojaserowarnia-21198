import { Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { zdarzenieLacznikAi } from "@/lib/zdarzeniaGa4";
import { WTYCZKI_CHATGPT, adresLacznika, kopiujDoSchowka, zapiszKlikniecieLacznika } from "@/lib/lacznikClaude";

/**
 * „Dodaj do ChatGPT”: kopiuje adres serwera MCP (ze znacznikiem strony) i otwiera
 * w nowej karcie stronę wtyczek ChatGPT. Formularza z wpisanym adresem ChatGPT
 * nie ma (stan 23.10.2026), dlatego kroki pokazuje komunikat, a pełne na
 * /asystenci-ai#chatgpt. Link, a nie window.open, z tego samego powodu co
 * w PrzyciskDodajDoClaude.
 */
const PrzyciskDodajDoChatGPT = ({ zrodlo, className = "" }: { zrodlo: string; className?: string }) => (
  <Button asChild className={`bg-[#10A37F] hover:bg-[#0e8f6f] text-white font-semibold shadow-lg ${className}`}>
    <a
      href={WTYCZKI_CHATGPT}
      target="_blank"
      rel="noopener noreferrer nofollow"
      title="Łącznik daje ChatGPT dostęp do kalkulatora pasz, przepisów i bazy kultur"
      onClick={() => {
        zapiszKlikniecieLacznika(zrodlo, "przycisk", "chatgpt");
        zdarzenieLacznikAi("polacz_chatgpt");
        void kopiujDoSchowka(adresLacznika(zrodlo));
        toast({
          title: "Adres skopiowany, otwieramy ChatGPT",
          description:
            "Kliknij tam Dodaj w prawym górnym rogu, potem Dodaj niestandardowy serwer MCP. Wklej adres, wybierz brak uwierzytelniania i zainstaluj wtyczkę.",
        });
      }}
    >
      <Plug className="h-4 w-4" aria-hidden="true" />
      Dodaj do ChatGPT
    </a>
  </Button>
);

export default PrzyciskDodajDoChatGPT;
