import { useState } from "react";
import {
  Menu, X, Search, User, LogOut, ChevronDown,
  FlaskConical, ChefHat, GraduationCap, Calculator, Scale, Newspaper, ClipboardList, Mail,
  type LucideIcon,
} from "lucide-react";
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

// Kolory pozycji — pełne klasy (Tailwind nie może budować ich dynamicznie).
const COLORS = {
  amber: { sq: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400", hover: "hover:bg-amber-50 dark:hover:bg-amber-500/10" },
  rose: { sq: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400", hover: "hover:bg-rose-50 dark:hover:bg-rose-500/10" },
  sky: { sq: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400", hover: "hover:bg-sky-50 dark:hover:bg-sky-500/10" },
  violet: { sq: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400", hover: "hover:bg-violet-50 dark:hover:bg-violet-500/10" },
  emerald: { sq: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400", hover: "hover:bg-emerald-50 dark:hover:bg-emerald-500/10" },
  cyan: { sq: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400", hover: "hover:bg-cyan-50 dark:hover:bg-cyan-500/10" },
  teal: { sq: "bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400", hover: "hover:bg-teal-50 dark:hover:bg-teal-500/10" },
  slate: { sq: "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300", hover: "hover:bg-slate-100 dark:hover:bg-slate-500/10" },
} as const;

type NavLeaf = { label: string; href: string };
type NavItem = { label: string; href?: string; icon: LucideIcon; color: keyof typeof COLORS; children?: NavLeaf[] };

const navItems: NavItem[] = [
  {
    label: "Kultury serowarskie", icon: FlaskConical, color: "amber",
    children: [
      { label: "Baza kultur", href: "/baza-kultur" },
      { label: "Porównywarka kultur", href: "/porownywarka-kultur" },
      { label: "Przewodnik o kulturach", href: "/kultury/przewodnik" },
      { label: "Kultury mezofilne", href: "/kultury/mezofilne" },
      { label: "Kultury termofilne", href: "/kultury/termofilne" },
      { label: "Kultury jogurtowe", href: "/kultury/jogurtowe" },
      { label: "Sery wege", href: "/sery-wege" },
      { label: "Moje listy", href: "/moje-listy" },
    ],
  },
  {
    label: "Przepisy na sery", icon: ChefHat, color: "rose",
    children: [
      { label: "Przepisy na sery", href: "/przepisy" },
      { label: "Przepisy kulinarne", href: "/przepisy-kulinarne" },
      { label: "Słownik serowarski", href: "/slownik" },
    ],
  },
  {
    label: "Poradniki", icon: GraduationCap, color: "sky",
    children: [
      { label: "Poradnik główny", href: "/poradnik" },
      { label: "Organizacja serowarni", href: "/organizacja-serowarni" },
      { label: "Bakterie i kultury", href: "/bakterie-kultury" },
      { label: "Siła podpuszczki", href: "/sila-podpuszczki" },
      { label: "Gdzie kupić podpuszczkę", href: "/gdzie-kupic-podpuszczke" },
      { label: "Wszystkie poradniki", href: "/poradniki" },
    ],
  },
  {
    label: "Narzędzia", icon: Calculator, color: "violet",
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
    label: "Prawo i RHD", icon: Scale, color: "emerald",
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
  { label: "Wiadomości", href: "/wiadomosci", icon: Newspaper, color: "cyan" },
  { label: "Ewidencja RHD", href: "/system-ewidencji", icon: ClipboardList, color: "teal" },
  { label: "Kontakt", href: "/kontakt", icon: Mail, color: "slate" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
          <span className="w-10 h-10 rounded-full bg-gradient-warm flex items-center justify-center shadow-warm">
            <span className="text-xl">🧀</span>
          </span>
          <span className="font-display font-bold text-foreground">Moja Serowarnia</span>
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
            <span className="w-10 h-10 rounded-full bg-gradient-warm flex items-center justify-center shadow-warm transition-transform group-hover:scale-105">
              <span className="text-xl">🧀</span>
            </span>
            <span className="leading-tight">
              <span className="block font-display font-bold text-foreground">Moja Serowarnia</span>
              <span className="block text-[11px] text-muted-foreground">centrum wiedzy o serze</span>
            </span>
          </a>
          <Button variant="ghost" size="icon" className="lg:hidden rounded-full" onClick={closeMobile} aria-label="Zamknij menu">
            <X className="h-5 w-5" />
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
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground shadow-warm"
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
    </>
  );
};

export default Navigation;
