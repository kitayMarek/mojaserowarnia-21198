import { Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { zdarzenieLacznikAi } from "@/lib/zdarzeniaGa4";
import { UMIEJETNOSC_PERPLEXITY, zapiszKlikniecieLacznika } from "@/lib/lacznikClaude";

/**
 * „Dodaj do Perplexity”: otwiera w nowej karcie udostępnioną umiejętność
 * „moja-serowarnia” w Perplexity Computer. Zalogowany użytkownik dodaje ją
 * u siebie przez „…”, Importuj kopię, Zapisz (kroki też na /asystenci-ai#perplexity).
 * Adresu serwera nie kopiujemy: jest w treści umiejętności.
 */
const PrzyciskDodajDoPerplexity = ({ zrodlo, className = "" }: { zrodlo: string; className?: string }) => (
  <Button asChild className={`bg-[#20808D] hover:bg-[#1a6b76] text-white font-semibold shadow-lg ${className}`}>
    <a
      href={UMIEJETNOSC_PERPLEXITY}
      target="_blank"
      rel="noopener noreferrer nofollow"
      title="Umiejętność daje Perplexity dostęp do kalkulatora pasz, przepisów i bazy kultur"
      onClick={() => {
        zapiszKlikniecieLacznika(zrodlo, "przycisk", "perplexity");
        zdarzenieLacznikAi("polacz_perplexity");
        toast({
          title: "Otwieramy Perplexity w nowej karcie",
          description:
            "Zaloguj się, kliknij … w prawym górnym rogu, wybierz Importuj kopię i Zapisz. Pytaj w trybie Computer.",
        });
      }}
    >
      <Plug className="h-4 w-4" aria-hidden="true" />
      Dodaj do Perplexity
    </a>
  </Button>
);

export default PrzyciskDodajDoPerplexity;
