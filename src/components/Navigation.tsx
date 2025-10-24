import { useState } from "react";
import { Menu, X, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Bazy Kultur", href: "/baza-kultur" },
    { label: "Przepisy", href: "/przepisy" },
    { label: "Poradniki", href: "/poradniki" },
    { label: "Prawo", href: "/prawo" },
    { label: "Narzędzia", href: "/narzedzia" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm" aria-label="Główna nawigacja">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group" aria-label="Strona główna Moja Serowarnia">
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
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="hidden md:inline-flex gap-2"
                  >
                    <User className="h-4 w-4" />
                    {user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Moje Konto</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    📊 Moja Ewidencja
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard/ustawienia")}>
                    ⚙️ Ustawienia
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Wyloguj
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                className="hidden md:inline-flex bg-primary hover:bg-primary-hover text-primary-foreground shadow-warm"
                onClick={() => navigate("/auth")}
              >
                Zaloguj się
              </Button>
            )}

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
              {user ? (
                <>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      navigate("/dashboard");
                      setIsOpen(false);
                    }}
                  >
                    📊 Moja Ewidencja
                  </Button>
                  <Button
                    variant="ghost"
                    className="mt-1"
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Wyloguj
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  className="mt-2 bg-primary hover:bg-primary-hover text-primary-foreground"
                  onClick={() => {
                    navigate("/auth");
                    setIsOpen(false);
                  }}
                >
                  Zaloguj się
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
