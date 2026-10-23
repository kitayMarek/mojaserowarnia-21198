import { Link, NavLink } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { SEROWARNIA } from "./DoSerowarni";

/**
 * Nagłówek mojapasza.com. Zastępuje Navigation (boczne menu Serowarni) w stronach
 * pasz przez alias w pasze/vite.config.ts. Stały pasek u góry na każdym ekranie,
 * dlatego okruszki (Okruszki.tsx) mają własny odstęp od góry.
 */
const LINKI = [
  { to: "/", etykieta: "Drób" },
  { to: "/bydlo", etykieta: "Bydło" },
  { to: "/poradnik", etykieta: "Poradnik" },
];

const Naglowek = () => (
  <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
    <div className="container mx-auto flex h-16 items-center gap-4 px-4">
      <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Moja Pasza, strona główna">
        <img src="/logo.svg" alt="" width={40} height={40} className="h-10 w-10" />
        <span className="font-display text-xl leading-none">Moja Pasza</span>
      </Link>
      <nav className="ml-auto flex items-center overflow-x-auto text-sm [scrollbar-width:none] sm:gap-1" aria-label="Główne">
        {LINKI.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) =>
              `whitespace-nowrap rounded-md px-2.5 py-2 font-medium transition-colors sm:px-3 ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {l.etykieta}
          </NavLink>
        ))}
        <a
          href={SEROWARNIA}
          className="hidden items-center gap-1 whitespace-nowrap px-3 py-2 text-muted-foreground hover:text-foreground sm:flex"
        >
          Moja Serowarnia
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </nav>
    </div>
  </header>
);

export default Naglowek;
