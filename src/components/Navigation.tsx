import { useState } from "react";
import { Menu, X, Search, User, LogOut, ChevronDown } from "lucide-react";
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
import SearchCommand from "@/components/SearchCommand";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavLeaf = { label: string; href: string };
type NavItem = { label: string; href?: string; children?: NavLeaf[] };

const navItems: NavItem[] = [
  {
    label: "Kultury serowarskie",
    children: [
      { label: "Baza kultur", href: "/baza-kultur" },
      { label: "Porównywarka kultur", href: "/porownywarka-kultur" },
      { label: "Przewodnik o kulturach", href: "/kultury/" },
      { label: "Kultury mezofilne", href: "/kultury/mezofilne.html" },
      { label: "Kultury termofilne", href: "/kultury/termofilne.html" },
      { label: "Kultury jogurtowe", href: "/kultury/jogurtowe.html" },
      { label: "Sery wege", href: "/wege/" },
      { label: "Moje listy", href: "/moje-listy" },
    ],
  },
  {
    label: "Przepisy na sery",
    children: [
      { label: "Przepisy na sery", href: "/przepisy" },
      { label: "Przepisy kulinarne", href: "/przepisy-kulinarne" },
      { label: "Słownik serowarski", href: "/slownik" },
    ],
  },
  {
    label: "Poradniki",
    children: [
      { label: "Poradnik główny", href: "/poradnik" },
      { label: "Bakterie i kultury", href: "/bakterie-kultury" },
      { label: "Siła podpuszczki", href: "/sila-podpuszczki" },
      { label: "Gdzie kupić podpuszczkę", href: "/gdzie-kupic-podpuszczke" },
      { label: "Wszystkie poradniki", href: "/poradniki" },
    ],
  },
  {
    label: "Narzędzia",
    children: [
      { label: "Kalkulator Beaugel", href: "/kalkulator-beaugel" },
      { label: "Kalkulator kosztu sera", href: "/kalkulator-kosztu-sera" },
      { label: "Kalkulator miar", href: "/kalkulator-miar" },
      { label: "Kalkulator pasz", href: "/kalkulator-pasz" },
      { label: "Kalkulator pasz (bydło)", href: "/kalkulator-pasz-bydlo" },
      { label: "Wartości odżywcze serów", href: "/porownanie-wartosci-odzywczych" },
      { label: "Etykieta RHD", href: "/etykieta-rhd" },
      { label: "Wszystkie narzędzia", href: "/narzedzia" },
    ],
  },
  {
    label: "Prawo i RHD",
    children: [
      { label: "RHD – Rolniczy Handel Detaliczny", href: "/prawo/rhd" },
      { label: "Dokumenty RHD", href: "/prawo/rhd/dokumenty" },
      { label: "MOL – działalność MOL", href: "/prawo/mol" },
      { label: "Dokumenty MOL", href: "/prawo/mol/dokumenty" },
      { label: "Akty prawne UE", href: "/prawo/akty-prawne-ue" },
      { label: "Rzeźnia rolnicza", href: "/prawo/rzeznia-rolnicza" },
      { label: "Wszystko o prawie", href: "/prawo" },
    ],
  },
  { label: "Wiadomości", href: "/wiadomosci" },
  { label: "Ewidencja RHD", href: "/system-ewidencji" },
  { label: "Kontakt", href: "/kontakt" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  const linkClass =
    "px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary/50 rounded-lg transition-all whitespace-nowrap";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm" aria-label="Główna nawigacja">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex flex-col gap-1">
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
            <a
              href="https://lovable.dev?referrer=Moja_Serowarnia"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:block text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors ml-[60px]"
            >
              Built with Lovable ❤️
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-0.5">
            {navItems.map((item) =>
              item.children ? (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger className={`${linkClass} inline-flex items-center gap-1 outline-none data-[state=open]:text-primary data-[state=open]:bg-secondary/50`}>
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-60">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild className="cursor-pointer">
                        <a href={child.href}>{child.label}</a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <a key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </a>
              )
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="rounded-full hover:bg-secondary gap-2"
              aria-label="Szukaj"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline">Szukaj</span>
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
              className="xl:hidden rounded-full"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="xl:hidden py-4 border-t border-border animate-in slide-in-from-top-2 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.label)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                      aria-expanded={openGroups.includes(item.label)}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${openGroups.includes(item.label) ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openGroups.includes(item.label) && (
                      <div className="pl-3 border-l border-border ml-4 my-1">
                        {item.children.map((child) => (
                          <a
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    className="px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                )
              )}
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

      {/* Search Command Palette */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </nav>
  );
};

export default Navigation;
