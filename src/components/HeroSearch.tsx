import { useState, useRef, useEffect } from "react";
import { Search, Database, BookOpen, Wrench, Scale, Phone, BookMarked } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchItems, SearchItem } from "@/data/searchIndex";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, React.ElementType> = {
  kultury: Database,
  przepisy: BookOpen,
  poradniki: BookMarked,
  prawo: Scale,
  narzedzia: Wrench,
  kontakt: Phone,
};

const categoryLabels: Record<string, string> = {
  kultury: "Kultura",
  przepisy: "Przepis",
  poradniki: "Poradnik",
  prawo: "Prawo",
  narzedzia: "Narzędzie",
  kontakt: "Kontakt",
};

const popularSearches = [
  { label: "Camembert", query: "camembert" },
  { label: "Feta", query: "feta" },
  { label: "Kalkulator podpuszczki", query: "kalkulator podpuszczki" },
  { label: "RHD", query: "rhd" },
  { label: "Kultury mezofilne", query: "mezofilne" },
];

/**
 * `className` i `poleClassName` (od 24.10.2026): nowa strona główna stawia pole po lewej,
 * z ramką zamiast cienia. Bez nich wygląd jak dawniej (wyśrodkowane, zaokrąglone).
 */
const HeroSearch = ({
  className = "max-w-xl mx-auto",
  poleClassName = "rounded-full bg-white/95 backdrop-blur-sm border-0 shadow-xl",
}: { className?: string; poleClassName?: string } = {}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const searchResults = searchItems(query, 8);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setShowPopular(false);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowPopular(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: SearchItem) => {
    setQuery("");
    setIsOpen(false);
    setShowPopular(false);
    
    if (item.href.startsWith("http")) {
      window.open(item.href, "_blank");
    } else if (item.href.endsWith(".html")) {
      window.location.href = item.href;
    } else {
      navigate(item.href);
    }
  };

  const handlePopularClick = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowPopular(false);
  };

  const handleFocus = () => {
    if (query.length >= 2 && results.length > 0) {
      setIsOpen(true);
    } else if (query.length < 2) {
      setShowPopular(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        // Wybrana podpowiedź otwiera się od razu. Bez wyboru Enter wysyła formularz na /szukaj.
        if (selectedIndex >= 0 && results[selectedIndex]) {
          e.preventDefault();
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // Od 24.11.2026 pole jest zwykłym formularzem GET na /szukaj: tę stronę składa Worker, nie React
  // (te same wyniki co tutaj, a pod nimi inne serwisy Dane Rolne). Wysłanie formularza ładuje ją od nowa.
  const fraza = query.trim();
  const adresSzukaj = `/szukaj?q=${encodeURIComponent(fraza)}`;

  return (
    <div className={cn("w-full", className)}>
    <div className="relative w-full">
      <form
        action="/szukaj"
        method="get"
        role="search"
        className="relative"
        onSubmit={(e) => {
          if (!fraza) e.preventDefault();
        }}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="np. mozzarella, twaróg, RHD"
          aria-label="Szukaj w serwisie"
          aria-describedby="hero-bez-danych"
          maxLength={120}
          enterKeyHint="search"
          className={cn("w-full h-12 pl-12 pr-[6.5rem] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all", poleClassName)}
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-11 min-w-[44px] rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
        >
          Szukaj
        </button>
      </form>

      {/* Popular searches dropdown */}
      {showPopular && !isOpen && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-none shadow-2xl border border-border/50 overflow-hidden z-50 animate-fade-in"
        >
          <div className="px-4 py-3 border-b border-border/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Popularne wyszukiwania
            </p>
          </div>
          <div className="p-3 flex flex-wrap gap-2">
            {popularSearches.map((item) => (
              <button
                key={item.query}
                onClick={() => handlePopularClick(item.query)}
                className="px-3 py-1.5 text-sm bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search results dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-none shadow-2xl border border-border/50 overflow-hidden z-50 animate-fade-in"
        >
          <div className="py-2 max-h-[400px] overflow-y-auto">
            {results.map((item, index) => {
              const Icon = categoryIcons[item.category] || Database;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "w-full px-4 py-3 flex items-start gap-3 text-left transition-colors",
                    selectedIndex === index
                      ? "bg-primary/10"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">
                        {item.title}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                        {categoryLabels[item.category]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <a
            href={adresSzukaj}
            className="flex min-h-[44px] flex-wrap items-center justify-between gap-x-3 gap-y-0.5 border-t border-border/50 px-4 py-2 text-sm no-underline hover:bg-muted/50"
          >
            <span className="min-w-0 truncate font-semibold text-primary">Szukaj wszędzie: „{fraza}”</span>
            <span className="text-xs text-muted-foreground">Moja Serowarnia i inne serwisy Dane Rolne</span>
          </a>
          <div className="px-4 py-2 border-t border-border/50 bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              ↑↓ nawiguj • Enter wybierz • Esc zamknij
            </p>
          </div>
        </div>
      )}
    </div>
      <p id="hero-bez-danych" className="mt-2 text-xs text-muted-foreground">
        Nie wpisuj danych osobowych.
      </p>
    </div>
  );
};

export default HeroSearch;
