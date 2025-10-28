import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DisclaimerModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem("hasSeenDisclaimer");
    if (!hasSeenDisclaimer) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("hasSeenDisclaimer", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border rounded-lg shadow-lg">
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-semibold text-base sm:text-lg">Witaj w Mojej Serowej Przystani!</h3>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleAccept}
              className="h-8 w-8 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Serwis prezentuje zestawienia kultur bakteryjnych, przepisów i narzędzi na podstawie publicznie dostępnych opisów i danych ze sklepów specjalistycznych.
          </p>
          
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <p className="font-medium text-sm">⚠️ Ważne informacje:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
              <li>Nie gwarantujemy kompletności ani aktualności informacji</li>
              <li>Dane mogą się zmieniać po stronie sprzedawców bez zapowiedzi</li>
              <li>Serwis nie stanowi porady technologicznej ani żywieniowej</li>
              <li>Użytkownik ponosi wyłączną odpowiedzialność za dobór kultur, dawek i parametrów procesu</li>
            </ul>
          </div>

          <p className="text-sm">
            Zawsze weryfikuj dane w aktualnej dokumentacji producenta/sprzedawcy przed użyciem produktu.{" "}
            <Link to="/nota-prawna" className="text-primary hover:underline font-semibold">
              Nota Prawna
            </Link>
          </p>

          <Button onClick={handleAccept} size="sm" className="w-full sm:w-auto">
            Rozumiem i akceptuję
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
