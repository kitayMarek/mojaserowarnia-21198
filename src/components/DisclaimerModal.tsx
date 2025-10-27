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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-3">
            <h3 className="font-semibold text-lg">Witaj w Mojej Serowej Przystani!</h3>
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
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleAccept} size="sm">
              Rozumiem i akceptuję
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleAccept}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
