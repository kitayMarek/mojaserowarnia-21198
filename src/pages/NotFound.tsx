import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// Strona dla adresu, którego nie ma (od 20.11.2026 worker oddaje ją z kodem 404).
// Zamiast ślepego zaułka: najczęściej szukane działy serwisu.
const DZIALY = [
  { adres: "/przepisy", nazwa: "Przepisy na sery", opis: "mozzarella, gouda, camembert, twaróg i inne" },
  { adres: "/baza-kultur", nazwa: "Baza kultur bakteryjnych", opis: "skład, zastosowanie, ceny w polskich sklepach" },
  { adres: "/poradniki", nazwa: "Poradniki", opis: "mleko, podpuszczka, solenie, dojrzewanie" },
  { adres: "/narzedzia", nazwa: "Kalkulatory", opis: "solanka, miary, koszt sera" },
  { adres: "/prawo", nazwa: "Prawo dla serowarów", opis: "RHD, MOL, etykieta, faktura VAT RR" },
];

const NotFound = () => {
  useEffect(() => {
    document.title = "Nie ma takiej strony | Moja Serowarnia";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-2xl">
        <p className="text-sm text-muted-foreground mb-2">Błąd 404</p>
        <h1 className="text-3xl font-bold mb-4">Nie ma takiej strony</h1>
        <p className="text-muted-foreground mb-8">
          Adres może zawierać literówkę albo strona została przeniesiona. Zajrzyj do jednego z działów
          albo wróć na <Link to="/" className="text-primary underline">stronę główną</Link>.
        </p>
        <ul className="space-y-3">
          {DZIALY.map((d) => (
            <li key={d.adres}>
              <Link to={d.adres} className="block rounded-lg border p-4 hover:bg-muted transition-colors">
                <span className="font-semibold text-primary">{d.nazwa}</span>
                <span className="block text-sm text-muted-foreground">{d.opis}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
