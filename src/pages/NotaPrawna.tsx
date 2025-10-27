import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const NotaPrawna = () => {
  useEffect(() => {
    document.title = "Nota Prawna - Moja Serowa Przystań";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Warunki korzystania z serwisu Moja Serowa Przystań. Informacje o odpowiedzialności, aktualności danych i weryfikacji informacji o kulturach bakteryjnych.');
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20 pb-12" role="main">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Nota Prawna</h1>
          
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Ważne informacje o korzystaniu z serwisu</AlertTitle>
            <AlertDescription>
              Przed skorzystaniem z informacji zawartych w serwisie, zapoznaj się z poniższymi warunkami.
            </AlertDescription>
          </Alert>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Charakter Informacji</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                „Moja Serowa Przystań" udostępnia informacje o kulturach bakteryjnych, przepisach i narzędziach w celach <strong>informacyjno-edukacyjnych</strong>. Dokładamy starań o rzetelność przedstawianych treści, jednak należy mieć na uwadze następujące ograniczenia:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Zmienność danych:</strong> Opisy produktów, ceny, dostępność i składy mogą ulec zmianie po stronie sprzedawców lub producentów bez zapowiedzi i poza naszą kontrolą.
                </li>
                <li>
                  <strong>Automatyczne agregowanie:</strong> Dane mogą być niekompletne lub zawierać błędy powstałe podczas automatycznego pobierania informacji z kart produktów sprzedawców.
                </li>
                <li>
                  <strong>Brak porad specjalistycznych:</strong> Materiały dostępne w serwisie nie stanowią porady technologicznej, medycznej ani żywieniowej. Decyzje produkcyjne i wybór produktów podejmujesz na własną odpowiedzialność.
                </li>
                <li>
                  <strong>Wymóg weryfikacji:</strong> Zawsze weryfikuj aktualną kartę produktu i dokumentację producenta, zwłaszcza w zakresie dawek, przechowywania, składu i potencjalnych alergenów.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Wyłączenie Odpowiedzialności</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong>Serwis nie ponosi odpowiedzialności za:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Skutki użycia kultur bakteryjnych, podpuszczek lub innych produktów wymienionych w serwisie</li>
                <li>Nieaktualność lub niekompletność prezentowanych danych</li>
                <li>Błędy w opisach produktów pochodzące ze źródeł zewnętrznych</li>
                <li>Straty lub szkody wynikłe z zastosowania informacji zawartych w serwisie</li>
                <li>Zmiany cen, składów lub dostępności produktów u sprzedawców</li>
              </ul>
              <p className="font-semibold text-foreground mt-4">
                Użytkownik ponosi wyłączną odpowiedzialność za dobór kultur, dawek, parametrów procesu produkcyjnego oraz zgodność swoich działań z obowiązującymi przepisami prawa.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Własność Intelektualna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Znaki towarowe, nazwy produktów i logotypy należą do odpowiednich właścicieli. Prezentujemy je wyłącznie w celu identyfikacji i porównania produktów dostępnych na rynku.
              </p>
              <p>
                Dane pochodzą z publicznie dostępnych kart produktów i katalogów sklepów specjalistycznych. Wszelkie treści są agregowane w dobrej wierze i dla wygody użytkowników.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Zgłaszanie Błędów i Nieścisłości</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Jeśli zauważysz błąd, nieaktualność lub nieścisłość w prezentowanych danych, prosimy o kontakt:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Poprzez formularz kontaktowy dostępny w serwisie</li>
                <li>E-mail: kontakt@mojaserowaprzystań.pl</li>
              </ul>
              <p>
                Dokładamy wszelkich starań, aby bezzwłocznie weryfikować i aktualizować zgłoszone informacje.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Zgodność z RODO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Jeśli korzystasz z funkcji wymagających rejestracji lub podajesz dane osobowe (np. email przy kontakcie), Twoje dane są przetwarzane zgodnie z Rozporządzeniem o Ochronie Danych Osobowych (RODO).
              </p>
              <p>
                Więcej informacji znajdziesz w naszej Polityce Prywatności.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Akceptacja Warunków</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                <strong>Korzystając z serwisu „Moja Serowa Przystań", akceptujesz powyższe warunki i zobowiązujesz się do weryfikacji wszystkich informacji przed ich praktycznym zastosowaniem.</strong>
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Ostatnia aktualizacja: 27 października 2025</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotaPrawna;
