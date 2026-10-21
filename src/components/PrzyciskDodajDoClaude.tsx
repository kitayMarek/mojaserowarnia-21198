import { Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { zdarzenieLacznikAi } from "@/lib/zdarzeniaGa4";
import { adresLacznika, kopiujDoSchowka, linkClaude, zapiszKlikniecieLacznika } from "@/lib/lacznikClaude";

/**
 * „Dodaj do Claude”: otwiera w nowej karcie formularz łącznika w Claude.ai
 * z wpisanym adresem serwera MCP i kopiuje ten adres do schowka na zapas.
 * Link, a nie window.open: blokady wyskakujących okien przepuszczają zwykłe
 * kliknięcie w link. Adres niesie znacznik strony (zrodlo), patrz lacznikClaude.ts.
 */
const PrzyciskDodajDoClaude = ({ zrodlo, className = "" }: { zrodlo: string; className?: string }) => (
  <Button asChild className={`bg-[#D97757] hover:bg-[#c4664a] text-white font-semibold shadow-lg ${className}`}>
    <a
      href={linkClaude(zrodlo)}
      target="_blank"
      rel="noopener noreferrer nofollow"
      title="Łącznik daje Claude dostęp do bazy: składy, ceny za litr mleka i zamienniki"
      onClick={() => {
        zapiszKlikniecieLacznika(zrodlo, "przycisk");
        zdarzenieLacznikAi("polacz_claude");
        void kopiujDoSchowka(adresLacznika(zrodlo));
        toast({
          title: "Otwieramy Claude w nowej karcie",
          description: "Kliknij tam Add. Potem pytaj o kultury w zwykłej rozmowie, Claude sam sięgnie do bazy.",
        });
      }}
    >
      <Plug className="h-4 w-4" aria-hidden="true" />
      Dodaj do Claude
    </a>
  </Button>
);

export default PrzyciskDodajDoClaude;
