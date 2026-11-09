import { Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { zdarzenieLacznikAi } from "@/lib/zdarzeniaGa4";
import { KATALOG_CLAUDE, zapiszKlikniecieLacznika } from "@/lib/lacznikClaude";

/**
 * „Dodaj z katalogu Claude”: otwiera w nowej karcie wpis Dane Rolne w katalogu
 * łączników Claude (od 9.11.2026; wcześniej formularz z wpisanym adresem, który
 * zostaje jako druga droga w ramce „Podłącz w swoim czacie” i na /asystenci-ai).
 * Link, a nie window.open: blokady wyskakujących okien przepuszczają zwykłe
 * kliknięcie w link. Podłączenie z katalogu ma znacznik "katalog", nie znacznik
 * strony, więc stronę widać tylko w zapisie kliknięcia (rodzaj "katalog").
 */
const PrzyciskDodajDoClaude = ({ zrodlo, className = "" }: { zrodlo: string; className?: string }) => (
  <Button asChild className={`bg-[#D97757] hover:bg-[#c4664a] text-white font-semibold shadow-lg ${className}`}>
    <a
      href={KATALOG_CLAUDE}
      target="_blank"
      rel="noopener noreferrer nofollow"
      title="Łącznik daje Claude dostęp do bazy: składy, ceny za litr mleka i zamienniki"
      onClick={() => {
        zapiszKlikniecieLacznika(zrodlo, "katalog");
        zdarzenieLacznikAi("katalog_claude");
        toast({
          title: "Otwieramy katalog Claude w nowej karcie",
          description: "Dodaj tam Dane Rolne jednym kliknięciem. Potem pytaj o kultury w zwykłej rozmowie, Claude sam sięgnie do bazy.",
        });
      }}
    >
      <Plug className="h-4 w-4" aria-hidden="true" />
      Dodaj z katalogu Claude
    </a>
  </Button>
);

export default PrzyciskDodajDoClaude;
