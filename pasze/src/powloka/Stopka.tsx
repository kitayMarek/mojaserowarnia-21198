import { Link } from "react-router-dom";
import { SEROWARNIA } from "./DoSerowarni";

/**
 * Stopka mojapasza.com (zastępuje Footer Serowarni przez alias w pasze/vite.config.ts).
 * Prywatność i warunki to strony statyczne (pasze/public/*.html, podaje je worker),
 * więc zwykłe linki z przeładowaniem, nie <Link>: router aplikacji ich nie zna.
 */
const Stopka = () => (
  <footer className="mt-16 border-t border-border bg-muted/30">
    <div className="container mx-auto grid gap-6 px-4 py-10 text-sm text-muted-foreground md:grid-cols-3">
      <div className="space-y-2">
        <p className="font-display text-lg text-foreground">Moja Pasza</p>
        <p>
          Kalkulator paszy dla drobiu i bydła. Wyniki to obliczenie na wzorcowych wartościach surowców, nie porada
          lekarza weterynarii.
        </p>
      </div>
      <nav className="space-y-2" aria-label="Serwis">
        <p className="font-medium text-foreground">Serwis</p>
        <ul className="space-y-1">
          <li><Link to="/" className="hover:text-foreground">Kalkulator dla drobiu</Link></li>
          <li><Link to="/bydlo" className="hover:text-foreground">Kalkulator dla bydła</Link></li>
          <li><Link to="/poradnik" className="hover:text-foreground">Poradnik żywienia</Link></li>
        </ul>
      </nav>
      <nav className="space-y-2" aria-label="Informacje">
        <p className="font-medium text-foreground">Informacje</p>
        <ul className="space-y-1">
          <li><Link to="/asystenci-ai" className="hover:text-foreground">Kalkulator w Twoim czacie</Link></li>
          <li><a href="/prywatnosc" className="hover:text-foreground">Prywatność i pliki cookie</a></li>
          <li><a href="/warunki" className="hover:text-foreground">Warunki korzystania</a></li>
          <li><a href={`${SEROWARNIA}/kontakt`} className="hover:text-foreground">Kontakt</a></li>
          <li><a href={SEROWARNIA} className="hover:text-foreground">Moja Serowarnia</a></li>
        </ul>
      </nav>
    </div>
    <p className="pb-8 text-center text-xs text-muted-foreground">
      Dane: Moja Serowarnia, licencja CC BY 4.0.
    </p>
  </footer>
);

export default Stopka;
