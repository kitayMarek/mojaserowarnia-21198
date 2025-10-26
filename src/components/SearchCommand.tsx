import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchItems, getItemsByCategory } from "@/data/searchIndex";
import type { SearchItem } from "@/data/searchIndex";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryConfig = {
  kultury: {
    label: "🧀 Kultury Bakteryjne",
    limit: 8,
  },
  przepisy: {
    label: "📖 Przepisy na Sery",
    limit: 5,
  },
  poradniki: {
    label: "📚 Poradniki",
    limit: 10,
  },
  prawo: {
    label: "⚖️ Prawo",
    limit: 10,
  },
  narzedzia: {
    label: "🔧 Narzędzia",
    limit: 10,
  },
  kontakt: {
    label: "📧 Kontakt",
    limit: 10,
  },
};

const SearchCommand = ({ open, onOpenChange }: SearchCommandProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        const searchResults = searchItems(query, 50);
        setResults(searchResults);
      } else {
        setResults([]);
      }
    }, 150); // 150ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(
    (item: SearchItem) => {
      onOpenChange(false);
      setQuery("");
      setResults([]);

      // Handle external links
      if (item.href.startsWith("http")) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else if (item.href.endsWith(".html")) {
        // Handle static HTML files
        window.location.href = item.href;
      } else {
        navigate(item.href);
      }
    },
    [navigate, onOpenChange]
  );

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "/" && !open) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const categorizedResults = getItemsByCategory(results);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Szukaj kultur, przepisów, poradników..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {!query.trim() && (
          <CommandEmpty>
            <div className="py-6 text-center text-sm text-muted-foreground">
              <p className="mb-2">Wpisz frazę aby rozpocząć wyszukiwanie</p>
              <p className="text-xs">
                Wskazówka: <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+K</kbd> lub{" "}
                <kbd className="px-2 py-1 text-xs bg-muted rounded">/</kbd> aby otworzyć
              </p>
            </div>
          </CommandEmpty>
        )}

        {query.trim() && results.length === 0 && (
          <CommandEmpty>
            <div className="py-6 text-center text-sm">
              <p className="text-muted-foreground mb-2">Nie znaleziono wyników dla "{query}"</p>
              <p className="text-xs text-muted-foreground">Spróbuj innej frazy lub mniej słów</p>
            </div>
          </CommandEmpty>
        )}

        {query.trim() && results.length > 0 && (
          <>
            {/* Kultury Bakteryjne */}
            {categorizedResults.kultury.length > 0 && (
              <>
                <CommandGroup heading={categoryConfig.kultury.label}>
                  {categorizedResults.kultury.slice(0, categoryConfig.kultury.limit).map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.title}</span>
                          {item.price && (
                            <Badge variant="secondary" className="text-xs">
                              {item.price}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {item.description}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {categorizedResults.kultury.length > categoryConfig.kultury.limit && (
                  <div className="px-2 py-1 text-xs text-muted-foreground text-center">
                    +{categorizedResults.kultury.length - categoryConfig.kultury.limit} więcej kultur
                  </div>
                )}
                <Separator className="my-2" />
              </>
            )}

            {/* Przepisy */}
            {categorizedResults.przepisy.length > 0 && (
              <>
                <CommandGroup heading={categoryConfig.przepisy.label}>
                  {categorizedResults.przepisy.slice(0, categoryConfig.przepisy.limit).map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <Separator className="my-2" />
              </>
            )}

            {/* Poradniki */}
            {categorizedResults.poradniki.length > 0 && (
              <>
                <CommandGroup heading={categoryConfig.poradniki.label}>
                  {categorizedResults.poradniki.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <Separator className="my-2" />
              </>
            )}

            {/* Prawo */}
            {categorizedResults.prawo.length > 0 && (
              <>
                <CommandGroup heading={categoryConfig.prawo.label}>
                  {categorizedResults.prawo.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <Separator className="my-2" />
              </>
            )}

            {/* Narzędzia */}
            {categorizedResults.narzedzia.length > 0 && (
              <>
                <CommandGroup heading={categoryConfig.narzedzia.label}>
                  {categorizedResults.narzedzia.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => handleSelect(item)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <Separator className="my-2" />
              </>
            )}

            {/* Kontakt */}
            {categorizedResults.kontakt.length > 0 && (
              <CommandGroup heading={categoryConfig.kontakt.label}>
                {categorizedResults.kontakt.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelect(item)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default SearchCommand;
