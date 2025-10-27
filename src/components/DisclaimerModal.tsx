import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";

const DisclaimerModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem("hasSeenDisclaimer");
    if (!hasSeenDisclaimer) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("hasSeenDisclaimer", "true");
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">Witaj w Mojej Serowej Przystani!</AlertDialogTitle>
          <AlertDialogDescription className="text-base space-y-4 pt-4">
            <p>
              Serwis prezentuje zestawienia kultur bakteryjnych, przepisów i narzędzi na podstawie publicznie dostępnych opisów i danych ze sklepów specjalistycznych.
            </p>
            
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-semibold text-foreground">⚠️ Ważne informacje:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Nie gwarantujemy kompletności ani aktualności informacji</li>
                <li>Dane mogą się zmieniać po stronie sprzedawców bez zapowiedzi</li>
                <li>Serwis nie stanowi porady technologicznej ani żywieniowej</li>
                <li>Użytkownik ponosi wyłączną odpowiedzialność za dobór kultur, dawek i parametrów procesu</li>
              </ul>
            </div>

            <p className="font-semibold text-foreground">
              Zawsze weryfikuj dane w aktualnej dokumentacji producenta/sprzedawcy przed użyciem produktu.
            </p>

            <p className="text-sm">
              Szczegółowe informacje znajdziesz w{" "}
              <Link to="/nota-prawna" className="text-primary hover:underline font-semibold">
                Nocie Prawnej
              </Link>
              .
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAccept} className="w-full sm:w-auto">
            Rozumiem i akceptuję
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DisclaimerModal;
