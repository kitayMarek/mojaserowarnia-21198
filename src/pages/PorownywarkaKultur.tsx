import { useState, useMemo, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, AlertCircle, GitCompare, Check, Plus, Trash2, Lightbulb } from "lucide-react";
import { useCultures, type Culture } from "@/hooks/useCultures";
import ReactionButton from "@/components/ReactionButton";
import BuyButton from "@/components/BuyButton";

const MAX = 5;

// Miniatura ze sklepu (hotlink); jeśli się nie załaduje — chowamy obrazek, zostaje pusty kadr.
const Thumb = ({ src, alt, className }: { src?: string; alt: string; className?: string }) =>
  src ? (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  ) : null;

const keyOf = (c: Culture) => `${c.name}||${c.shop}`;
const dash = (v?: string) => (v && v.trim() ? v : "—");

// Wiersze tabeli porównania (poza zdjęciem i linkiem, które renderujemy osobno)
const ROWS: { label: string; get: (c: Culture) => string }[] = [
  { label: "Sklep", get: (c) => dash(c.shop) },
  { label: "Cena", get: (c) => dash(c.price) },
  { label: "Typ bakterii", get: (c) => dash(c.type) },
  { label: "Temperatura", get: (c) => dash(c.temperature) },
  { label: "Skład", get: (c) => dash(c.composition) },
  { label: "Przeznaczenie", get: (c) => dash(c.application) },
];

const PorownywarkaKultur = () => {
  useEffect(() => {
    document.title = "Porównywarka Kultur Bakteryjnych - Moja Serowarnia";
    const m = document.querySelector('meta[name="description"]');
    if (m)
      m.setAttribute(
        "content",
        "Porównaj kultury bakteryjne z różnych sklepów: nazwa, skład, typ bakterii, przeznaczenie, cena, zdjęcie i link do produktu. Wybierz 2–5 kultur i zobacz porównanie na żywo."
      );
  }, []);

  const { cultures: culturesData, loading, uniqueTypes } = useCultures();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilters, setSelectedTypeFilters] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Culture[]>([]);

  const filteredData = useMemo(() => {
    let items: Culture[] = culturesData;
    if (selectedTypeFilters.size > 0) {
      items = items.filter((item) => selectedTypeFilters.has(item.type));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          item.composition.toLowerCase().includes(q) ||
          item.application.toLowerCase().includes(q)
      );
    }
    return items;
  }, [culturesData, searchQuery, selectedTypeFilters]);

  const selectedKeys = useMemo(() => new Set(selectedItems.map(keyOf)), [selectedItems]);
  const isSelected = (c: Culture) => selectedKeys.has(keyOf(c));
  const isFull = selectedItems.length >= MAX;

  const toggleTypeFilter = (type: string) => {
    setSelectedTypeFilters((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const toggleItem = (item: Culture) => {
    if (isSelected(item)) {
      setSelectedItems((prev) => prev.filter((x) => keyOf(x) !== keyOf(item)));
    } else if (!isFull) {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const removeItem = (item: Culture) =>
    setSelectedItems((prev) => prev.filter((x) => keyOf(x) !== keyOf(item)));

  const clearAll = () => setSelectedItems([]);

  const scrollToCompare = () =>
    document.getElementById("porownanie")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const canCompare = selectedItems.length >= 2;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageBreadcrumbs
        items={[{ label: "Kultury", href: "/baza-kultur" }, { label: "Porównywarka kultur" }]}
      />
      <main className="pt-20">
        <div className={`container mx-auto px-4 py-8 space-y-6 ${selectedItems.length > 0 ? "pb-36" : ""}`}>
          <PageHeader
            icon={GitCompare}
            color="amber"
            title="Porównywarka kultur bakteryjnych"
            subtitle="Wybierz 2–5 kultur i porównaj skład, typ, temperaturę, cenę i link — na żywo."
          />

          <div>
            <ReactionButton contentType="guide" contentId="porownywarka-kultur" variant="default" />
          </div>

          {/* Wyjaśnienie: jeden ser = kilka różnych kultur (pomoc dla usera + treść pod LLM) */}
          <section className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 p-5">
            <h2 className="flex items-center gap-2 text-lg font-display font-bold text-foreground">
              <Lightbulb className="h-5 w-5 shrink-0 text-amber-600" />
              Dlaczego do jednego sera jest kilka różnych kultur?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Bo różne kultury o innym składzie mogą dać ten sam <strong>typ sera</strong>. Gouda to np. ser{" "}
              <strong>mezofilny</strong> — do zakwaszenia wystarczą bakterie <em>Lactococcus lactis</em>, a część
              zestawów dokłada szczepy aromatyczne (<em>diacetylactis</em>, <em>Leuconostoc</em>) dla maślanej nuty
              i drobnych oczek. Producenci nazywają szczepy różnie i sprzedają je w różnym dawkowaniu — stąd kilka
              „kultur do goudy" o niejednakowym składzie.
            </p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Różnice w składzie wpływają na <strong>niuans</strong> (tempo zakwaszania, oczkowanie, smak), a nie na
              to, że powstaje inny ser. W praktyce wybieraj po dostępności, cenie i profilu — bardziej lub mniej
              maślany, z oczkami lub bez.
            </p>
          </section>

          {/* Filtry — po typie kultury + wyszukiwarka po nazwie/przeznaczeniu (nie po sklepie:
              sens porównywarki to zestawić kultury o tym samym przeznaczeniu z RÓŻNYCH sklepów) */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Filtruj po typie kultury</p>
                <div className="flex flex-wrap gap-2">
                  {uniqueTypes.map((type) => (
                    <Button
                      key={type}
                      variant={selectedTypeFilters.has(type) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTypeFilter(type)}
                    >
                      {type}
                    </Button>
                  ))}
                  {selectedTypeFilters.size > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTypeFilters(new Set())}>
                      Wyczyść
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Szukaj po nazwie lub przeznaczeniu (typ sera)</p>
                <Input
                  type="text"
                  placeholder="np. gouda, camembert, feta, mozzarella, Choozit…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabela porównania — NA ŻYWO (bez bramki „Akceptuję") */}
          <div id="porownanie" className="scroll-mt-24">
            {selectedItems.length === 1 && (
              <Card className="border-dashed">
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  Wybrano 1 kulturę — dodaj jeszcze co najmniej jedną, aby zobaczyć porównanie.
                </CardContent>
              </Card>
            )}

            {canCompare && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitCompare className="h-5 w-5 text-amber-600" />
                    Porównanie ({selectedItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-left p-3 border font-semibold align-bottom">Parametr</th>
                        {selectedItems.map((item) => (
                          <th key={keyOf(item)} className="p-3 border font-semibold min-w-[140px]">
                            <div className="flex flex-col items-center gap-2 text-center">
                              <div className="w-16 h-16 rounded bg-white border border-border flex items-center justify-center overflow-hidden">
                                <Thumb
                                  src={item.image_url}
                                  alt={item.name}
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <span className="leading-tight">{item.name}</span>
                              <button
                                onClick={() => removeItem(item)}
                                className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                              >
                                <X className="h-3 w-3" /> usuń
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ROWS.map((row) => (
                        <tr key={row.label}>
                          <td className="p-3 border bg-muted font-medium align-top whitespace-nowrap">
                            {row.label}
                          </td>
                          {selectedItems.map((item) => (
                            <td key={keyOf(item)} className="p-3 border align-top">
                              {row.get(item)}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td className="p-3 border bg-muted font-medium align-top whitespace-nowrap">
                          Link do produktu
                        </td>
                        {selectedItems.map((item) => (
                          <td key={keyOf(item)} className="p-3 border align-top">
                            {item.productUrl ? (
                              <a
                                href={item.productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline hover:text-primary/80"
                              >
                                Zobacz
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>

                  <Alert className="mt-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Informacje mają charakter poglądowy</strong> i pochodzą z kart produktów
                      sprzedawców. Parametry, składy i dostępność mogą się zmieniać. Przed użyciem
                      sprawdź aktualną kartę produktu u sprzedawcy. Serwis nie ponosi odpowiedzialności
                      za skutki użycia.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Wyniki */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wyniki ({loading ? "…" : filteredData.length} kultur)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Ładowanie kultur…</p>
              ) : filteredData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak wyników. Zmień filtry lub zapytanie.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredData.map((item) => {
                    const selected = isSelected(item);
                    return (
                      <Card
                        key={keyOf(item)}
                        className={`flex flex-col transition-shadow hover:shadow-md ${
                          selected ? "ring-2 ring-amber-500" : ""
                        }`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 shrink-0 rounded bg-white border border-border flex items-center justify-center overflow-hidden">
                              <Thumb
                                src={item.image_url}
                                alt={item.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="text-base leading-tight">{item.name}</CardTitle>
                              <p className="text-xs text-muted-foreground mt-0.5">{item.shop}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2 space-y-1 flex-1">
                          <p className="text-sm font-medium">{item.type}</p>
                          <p className="text-xs text-muted-foreground line-clamp-3">{item.application}</p>
                        </CardContent>
                        <CardContent className="pt-0 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold">{item.price}</p>
                            <Button
                              size="sm"
                              variant={selected ? "secondary" : "outline"}
                              onClick={() => toggleItem(item)}
                              disabled={!selected && isFull}
                              title={!selected && isFull ? `Maksymalnie ${MAX} pozycji` : undefined}
                            >
                              {selected ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" /> Wybrane
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-1" /> Dodaj
                                </>
                              )}
                            </Button>
                          </div>
                          <BuyButton
                            productUrl={item.productUrl}
                            shopUrl={item.shopUrl}
                            shopName={item.shop}
                            cultureName={item.name}
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Stała taca na dole — podgląd wybranych NA ŻYWO (widoczna przy scrollowaniu listy) */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 border-t-4 border-amber-400 bg-amber-50/95 dark:bg-amber-950/85 backdrop-blur shadow-[0_-8px_30px_rgba(0,0,0,0.18)] animate-in slide-in-from-bottom-4 duration-300">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="shrink-0 inline-flex items-center gap-2 text-sm font-bold whitespace-nowrap text-amber-800 dark:text-amber-200">
                <GitCompare className="h-4 w-4" />
                Do porównania {selectedItems.length}/{MAX}
              </div>
              <div className="flex-1 flex gap-2 overflow-x-auto py-1">
                {selectedItems.map((item) => (
                  <div
                    key={keyOf(item)}
                    className="shrink-0 flex items-center gap-2 rounded-full border bg-card pl-1 pr-2 py-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-border overflow-hidden flex items-center justify-center shrink-0">
                      <Thumb
                        src={item.image_url}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <span className="text-xs whitespace-nowrap max-w-[140px] truncate">{item.name}</span>
                    <button
                      onClick={() => removeItem(item)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      aria-label={`Usuń ${item.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {canCompare ? (
                  <Button size="sm" onClick={scrollToCompare}>
                    <GitCompare className="h-4 w-4 mr-1" /> Porównaj
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground hidden sm:inline">Dodaj min. 2</span>
                )}
                <Button size="sm" variant="ghost" onClick={clearAll} title="Wyczyść wszystko">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PorownywarkaKultur;
