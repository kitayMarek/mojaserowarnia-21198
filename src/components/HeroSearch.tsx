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

const HeroSearch = () => {
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
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Szukaj kultur, przepisów, narzędzi..."
          className="w-full h-12 pl-12 pr-4 rounded-full bg-white/95 backdrop-blur-sm border-0 shadow-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {/* Popular searches dropdown */}
      {showPopular && !isOpen && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-border/50 overflow-hidden z-50 animate-fade-in"
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
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-border/50 overflow-hidden z-50 animate-fade-in"
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
          <div className="px-4 py-2 border-t border-border/50 bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              ↑↓ nawiguj • Enter wybierz • Esc zamknij
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSearch;
