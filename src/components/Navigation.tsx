import { useState } from "react";
import { Menu, X, Search, User, LogOut, ChevronDown, List } from "lucide-react";
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
import SpisTresci from "@/components/SpisTresci";
import { COLORS, navItems, type NavItem } from "@/components/navItems";
import { ThemeToggle } from "@/components/ThemeToggle";

const Znak = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 46 26" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
    <path d="M4 20 L23 6 L42 20 Z" strokeLinejoin="round" />
    <circle cx="17" cy="16" r="2" />
    <circle cx="27" cy="14" r="2.6" />
    <circle cx="33" cy="18" r="1.6" />
    <path d="M4 20 h38" />
  </svg>
);


const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [spisOpen, setSpisOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  const closeMobile = () => setIsOpen(false);

  const Row = ({ item, expanded }: { item: NavItem; expanded: boolean }) => (
    <span className={`group flex items-center gap-3 w-full px-2.5 py-2 rounded-xl font-medium text-foreground/90 transition-colors ${COLORS[item.color].hover}`}>
      <span className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${COLORS[item.color].sq}`}>
        <item.icon className="h-5 w-5" />
      </span>
      <span className="flex-1 text-left text-sm leading-tight">{item.label}</span>
      {item.children && (
        <ChevronDown className={`h-4 w-4 opacity-60 transition-transform ${expanded ? "rotate-180" : ""}`} />
      )}
    </span>
  );

  return (
    <>
      {/* Górny pasek — tylko mobile */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 h-16 bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2" aria-label="Strona główna Moja Serowarnia">
          <Znak className="w-8 h-5 shrink-0 text-primary" />
          <span className="font-display text-[17px] text-foreground">Moja Serowarnia</span>
        </a>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSearchOpen(true)} aria-label="Szukaj">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Nakładka pod szufladę (mobile) */}
      {isOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={closeMobile} aria-hidden="true" />}

      {/* Sidebar — stały na desktopie, szuflada na mobile */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-background border-r border-border flex flex-col transition-transform duration-200 ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        aria-label="Główna nawigacja"
      >
        {/* Logo */}
        <div className="h-16 shrink-0 flex items-center justify-between gap-2 px-4 border-b border-border">
          <a href="/" className="flex items-center gap-2.5 group" aria-label="Strona główna Moja Serowarnia">
            <Znak className="w-9 h-6 shrink-0 text-primary" />
            <span className="leading-tight">
              <span className="block font-display text-[17px] text-foreground">Moja Serowarnia</span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--kicker))]">portal wiedzy</span>
            </span>
          </a>
          <Button variant="ghost" size="icon" className="lg:hidden rounded-full" onClick={closeMobile} aria-label="Zamknij menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Wejście w pełny spis treści. Skrótów do działów tu NIE MA celowo:
            sidebar ma je niżej w całości, więc rządek nad nim tylko dublował
            nawigację (uwaga Marka po zobaczeniu pierwszej wersji). */}
        <div className="shrink-0 border-b border-border px-2.5 py-3 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-[hsl(var(--rule-strong))] font-normal"
            onClick={() => {
              setSpisOpen(true);
              closeMobile();
            }}
          >
            <List className="h-4 w-4" />
            <span className="text-[11px] uppercase tracking-[0.18em]">Spis treści</span>
          </Button>
        </div>

        {/* Pozycje menu */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(item.label)}
                  className="w-full"
                  aria-expanded={openGroups.includes(item.label)}
                >
                  <Row item={item} expanded={openGroups.includes(item.label)} />
                </button>
                {openGroups.includes(item.label) && (
                  <div className="ml-[3.1rem] mt-0.5 mb-1 space-y-0.5 border-l border-border pl-3">
                    {item.children.map((child) => (
                      <a
                        key={child.href}
                        href={child.href}
                        onClick={closeMobile}
                        className="block px-3 py-1.5 text-sm text-foreground/70 hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a key={item.href} href={item.href} onClick={closeMobile} className="block">
                <Row item={item} expanded={false} />
              </a>
            )
          )}
        </nav>

        {/* Dół: szukaj + motyw + konto */}
        <div className="shrink-0 border-t border-border p-2.5 space-y-2">
          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant="outline"
              className="flex-1 justify-start gap-2 text-muted-foreground font-normal"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              Szukaj…
            </Button>
            <ThemeToggle />
          </div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <User className="h-4 w-4 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-56">
                <DropdownMenuLabel>Moje Konto</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>📊 Moja Ewidencja</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/ustawienia")}>⚙️ Ustawienia</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Wyloguj
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
              onClick={() => {
                navigate("/auth");
                closeMobile();
              }}
            >
              Zaloguj się
            </Button>
          )}
        </div>
      </aside>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
      <SpisTresci open={spisOpen} onOpenChange={setSpisOpen} onSearch={() => setSearchOpen(true)} />
    </>
  );
};

export default Navigation;
