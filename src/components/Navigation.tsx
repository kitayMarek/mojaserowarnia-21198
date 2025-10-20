import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Baza Kultur", href: "/baza-kultur" },
    { label: "Przepisy", href: "/przepisy" },
    { label: "Poradniki", href: "/poradnik" },
    { label: "Prawo", href: "#prawo" },
    { label: "Społeczność", href: "#spolecznosc" },
    { label: "Narzędzia", href: "#narzedzia" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center shadow-warm transition-transform group-hover:scale-105">
              <span className="text-2xl">🧀</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-display font-bold text-foreground leading-tight">
                Moja Serowarnia
              </h1>
              <p className="text-xs text-muted-foreground">Twoje centrum wiedzy o serze</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary/50 rounded-lg transition-all"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-secondary"
              aria-label="Szukaj"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Button
              variant="default"
              className="hidden md:inline-flex bg-primary hover:bg-primary-hover text-primary-foreground shadow-warm"
            >
              Zaloguj się
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button
                variant="default"
                className="mt-2 bg-primary hover:bg-primary-hover text-primary-foreground"
              >
                Zaloguj się
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
