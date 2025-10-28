import { useState, useMemo } from "react";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, AlertCircle } from "lucide-react";
import { culturesData, Culture } from "@/data/culturesDataComplete";
import ReactionButton from "@/components/ReactionButton";

const PorownywarkaKultur = () => {
  useEffect(() => {
    document.title = "Porównywarka Kultur Bakteryjnych - Moja Serowarnia";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Porównaj kultury bakteryjne z różnych sklepów: nazwa, skład, typ bakterii, przeznaczenie, cena i link do produktu. Wybierz 2-5 kultur i zobacz szczegółowe porównanie.');
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShopFilters, setSelectedShopFilters] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Culture[]>([]);

  // Get unique shops
  const shops = useMemo(() => {
    const uniqueShops = [...new Set(culturesData.map(c => c.shop).filter(Boolean))];
    return uniqueShops.sort();
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    let items = culturesData;

    // Filter by shop
    if (selectedShopFilters.size > 0) {
      items = items.filter(item => selectedShopFilters.has(item.shop));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.composition.toLowerCase().includes(q) ||
        item.application.toLowerCase().includes(q)
      );
    }

    return items;
  }, [searchQuery, selectedShopFilters]);

  const toggleShopFilter = (shop: string) => {
    const newFilters = new Set(selectedShopFilters);
    if (newFilters.has(shop)) {
      newFilters.delete(shop);
    } else {
      newFilters.add(shop);
    }
    setSelectedShopFilters(newFilters);
  };

  const clearShopFilters = () => {
    setSelectedShopFilters(new Set());
  };

  const addToComparison = (item: Culture) => {
    if (selectedItems.find(x => x.name === item.name && x.shop === item.shop)) {
      return;
    }
    if (selectedItems.length >= 5) {
      alert("Możesz porównać maksymalnie 5 pozycji.");
      return;
    }
    setSelectedItems([...selectedItems, item]);
  };

  const removeFromComparison = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const clearComparison = () => {
    setSelectedItems([]);
  };

  const valueOrDash = (value: string | undefined) => {
    return value && value.trim() ? value : "—";
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20 pb-12" role="main">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <ReactionButton contentType="guide" contentId="porownywarka-kultur" variant="default" />
            </div>
            <div className="mb-4">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">🧀 Porównywarka kultur bakteryjnych</h1>
              <p className="text-muted-foreground">Wybierz 2–5 pozycji i porównaj parametry</p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Mobile: Selected items at top */}
          <div className="md:hidden mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Wybrane do porównania</CardTitle>
                  {selectedItems.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearComparison}>
                      Wyczyść
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Wybierz od 2 do 5 kultur z listy poniżej.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedItems.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center gap-2 py-1 px-3">
                        <span className="text-sm">{item.name}</span>
                        <button
                          onClick={() => removeFromComparison(idx)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {selectedItems.length === 1 && (
                  <p className="text-xs text-muted-foreground">Wybierz jeszcze przynajmniej jedną kulturę.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Comparison Table - shown automatically when 2+ selected */}
          {selectedItems.length >= 2 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Tabela porównawcza</CardTitle>
                <CardDescription className="text-xs">
                  Dane mają charakter informacyjny. Przed użyciem zweryfikuj parametry w aktualnej karcie produktu u sprzedawcy.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-3 border font-semibold">Parametr</th>
                      {selectedItems.map((item, idx) => (
                        <th key={idx} className="text-left p-3 border font-semibold">
                          {item.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border bg-muted font-medium">Sklep</td>
                      {selectedItems.map((item, idx) => (
                        <td key={idx} className="p-3 border align-top">
                          {valueOrDash(item.shop)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 border bg-muted font-medium">Cena</td>
                      {selectedItems.map((item, idx) => (
                        <td key={idx} className="p-3 border align-top">
                          {valueOrDash(item.price)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 border bg-muted font-medium">Skład</td>
                      {selectedItems.map((item, idx) => (
                        <td key={idx} className="p-3 border align-top">
                          {valueOrDash(item.composition)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 border bg-muted font-medium">Typ bakterii</td>
                      {selectedItems.map((item, idx) => (
                        <td key={idx} className="p-3 border align-top">
                          {valueOrDash(item.type)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 border bg-muted font-medium">Temperatura</td>
                      {selectedItems.map((item, idx) => (
                        <td key={idx} className="p-3 border align-top">
                          {valueOrDash(item.temperature)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 border bg-muted font-medium">Przeznaczenie</td>
                      {selectedItems.map((item, idx) => (
                        <td key={idx} className="p-3 border align-top">
                          {valueOrDash(item.application)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 border bg-muted font-medium">Link do produktu</td>
                      {selectedItems.map((item, idx) => (
                        <td key={idx} className="p-3 border align-top">
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
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Left panel - Filters and Results */}
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filtruj po sklepie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {shops.map(shop => (
                      <Button
                        key={shop}
                        variant={selectedShopFilters.has(shop) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleShopFilter(shop)}
                      >
                        {shop}
                      </Button>
                    ))}
                    {shops.length > 0 && (
                      <Button variant="outline" size="sm" onClick={clearShopFilters}>
                        Wyczyść filtry
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Szukaj kultury</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="text"
                    placeholder="np. Choozit, Geo 17, termofilne, Lactococcus..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </CardContent>
              </Card>


              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Wyniki ({filteredData.length} kultur)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredData.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Brak wyników. Zmień filtry lub zapytanie.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredData.map((item, idx) => (
                        <Card key={idx} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{item.name}</CardTitle>
                            <CardDescription className="text-xs">
                              Sklep: {item.shop}
                            </CardDescription>
                            {item.lastChanged && (
                              <CardDescription className="text-xs italic mt-1">
                                📝 {item.lastChanged}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="pb-2 space-y-1">
                            <p className="text-sm font-medium">{item.type}</p>
                            <p className="text-xs text-muted-foreground line-clamp-3">
                              {item.application}
                            </p>
                          </CardContent>
                          <CardFooter className="flex items-center justify-between">
                            <p className="text-sm font-semibold">{item.price}</p>
                            <Button size="sm" variant="outline" onClick={() => addToComparison(item)}>
                              Dodaj
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right panel - Selected items (desktop only) */}
            <div className="hidden md:block md:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Wybrane do porównania</CardTitle>
                    {selectedItems.length > 0 && (
                      <Button variant="outline" size="sm" onClick={clearComparison}>
                        Wyczyść
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Wybierz od 2 do 5 kultur.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedItems.map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-2 py-1 px-3">
                          <span className="text-sm">{item.name}</span>
                          <button
                            onClick={() => removeFromComparison(idx)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  {selectedItems.length === 1 && (
                    <p className="text-xs text-muted-foreground">Wybierz jeszcze przynajmniej jedną kulturę.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PorownywarkaKultur;
