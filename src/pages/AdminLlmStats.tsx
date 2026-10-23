import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Loader2, MessageSquare } from "lucide-react";
import { format, subDays } from "date-fns";
import { pl } from "date-fns/locale";

interface LlmRow {
  query: string;
  model: string;
  source: string;
  is_custom: boolean;
  created_at: string;
}

// Sumy dzienne z serwera MCP (worker-magazyn/src/pomiar.js), dzien w UTC.
interface WywolanieRow {
  dzien: string;
  narzedzie: string;
  klient: string;
  status: number;
  wlasne: boolean;
  zrodlo: string;
  wywolan: number;
}

// Wiersze techniczne: polaczenie, lista narzedzi, katalog, zla tresc i sondy
// weryfikatorow. Prawie zawsze to skanery katalogow MCP, nie ludzie.
const techniczne = (narzedzie: string) => narzedzie.startsWith("(") || narzedzie.startsWith("__verifymcp");

const MODEL_LABELS: Record<string, string> = {
  claude: "Claude",
  perplexity: "Perplexity",
  chatgpt: "ChatGPT",
};
const MODEL_COLORS: Record<string, string> = {
  claude: "#D97757",
  perplexity: "#20808D",
  chatgpt: "#10a37f",
};

export default function AdminLlmStats() {
  const { data: rows, isLoading } = useQuery({
    queryKey: ["llmQueries"],
    queryFn: async () => {
      // @ts-ignore - llm_queries may not be in generated types yet
      const { data, error } = await supabase
        .from("llm_queries")
        .select("query, model, source, is_custom, created_at")
        .order("created_at", { ascending: false })
        .limit(5000);

      if (error) {
        console.error("Error fetching llm_queries:", error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać statystyk zapytań LLM",
          variant: "destructive",
        });
        throw error;
      }
      return (data ?? []) as LlmRow[];
    },
  });

  const [pokazTechniczne, setPokazTechniczne] = useState(false);

  const { data: wywolania } = useQuery({
    queryKey: ["magazynWywolania"],
    queryFn: async () => {
      // magazyn_wywolania nie ma w wygenerowanych typach (jak feed_ingredients w AdminFeedIngredients)
      const { data, error } = await (supabase as any)
        .from("magazyn_wywolania")
        .select("dzien, narzedzie, klient, status, wlasne, zrodlo, wywolan")
        .order("dzien", { ascending: false })
        .limit(5000);

      if (error) {
        console.error("Error fetching magazyn_wywolania:", error);
        throw error;
      }
      return (data ?? []) as WywolanieRow[];
    },
  });

  const mcp = useMemo(() => {
    const wiersze = wywolania ?? [];
    const granica = format(subDays(new Date(), 6), "yyyy-MM-dd");
    const suma = { narzedziaCudze: 0, narzedziaWlasne: 0, polaczeniaCudze: 0 };
    const klienci = new Map<string, number>();
    for (const w of wiersze) {
      if (w.dzien < granica) continue;
      if (techniczne(w.narzedzie)) {
        if (!w.wlasne && w.narzedzie === "(polaczenie)") suma.polaczeniaCudze += w.wywolan;
        continue;
      }
      if (w.wlasne) {
        suma.narzedziaWlasne += w.wywolan;
      } else {
        suma.narzedziaCudze += w.wywolan;
        klienci.set(w.klient, (klienci.get(w.klient) ?? 0) + w.wywolan);
      }
    }

    // Kody odpowiedzi sumujemy w jednym wierszu, bledy (4xx, 5xx) liczymy osobno.
    const grupy = new Map<string, Omit<WywolanieRow, "status"> & { bledy: number }>();
    for (const w of wiersze) {
      if (!pokazTechniczne && techniczne(w.narzedzie)) continue;
      const narzedzie = w.narzedzie.startsWith("__verifymcp") ? "(sonda weryfikatora)" : w.narzedzie;
      const klucz = [w.dzien, w.klient, narzedzie, w.zrodlo, w.wlasne].join("|");
      const g = grupy.get(klucz) ?? {
        dzien: w.dzien, klient: w.klient, narzedzie, zrodlo: w.zrodlo, wlasne: w.wlasne, wywolan: 0, bledy: 0,
      };
      g.wywolan += w.wywolan;
      if (w.status >= 400) g.bledy += w.wywolan;
      grupy.set(klucz, g);
    }

    return {
      suma,
      klienci: Array.from(klienci.entries()).sort((a, b) => b[1] - a[1]),
      tabela: Array.from(grupy.values())
        .sort((a, b) => b.dzien.localeCompare(a.dzien) || b.wywolan - a.wywolan)
        .slice(0, 200),
    };
  }, [wywolania, pokazTechniczne]);

  // Od 21.10.2026 w tej samej tabeli sa klikniecia przyciskow „Dodaj do Claude”
  // (model "lacznik-claude", query = menu / przycisk / kopiuj, source = strona).
  // query "link" zapisuje worker: klikniecie krotkiego linku /claude/dodaj?z=...
  // prosto do formularza Claude (worker/lacznik-claude.js), source = znacznik posta.
  // Licza sie osobno, zeby nie udawaly pytan z dawnego widgetu „Zapytaj AI”.
  // Od 23.10.2026 takze "lacznik-chatgpt": przyciski „Dodaj do ChatGPT” i krotki
  // link /chatgpt?z=... (query "link"), osobny wiersz na asystenta i strone.
  const lacznik = useMemo(() => {
    const wiersze = (rows ?? []).filter((r) => r.model.startsWith("lacznik-"));
    type Wiersz = { asystent: string; strona: string; razem: number; menu: number; przycisk: number; kopiuj: number; link: number };
    const wgStrony = new Map<string, Wiersz>();
    for (const r of wiersze) {
      const asystent = r.model === "lacznik-chatgpt" ? "ChatGPT" : "Claude";
      const klucz = `${asystent}|${r.source}`;
      const w = wgStrony.get(klucz) ?? { asystent, strona: r.source, razem: 0, menu: 0, przycisk: 0, kopiuj: 0, link: 0 };
      w.razem += 1;
      if (r.query === "menu" || r.query === "przycisk" || r.query === "kopiuj" || r.query === "link") w[r.query] += 1;
      wgStrony.set(klucz, w);
    }
    return {
      razem: wiersze.length,
      strony: Array.from(wgStrony.values()).sort((a, b) => b.razem - a.razem),
    };
  }, [rows]);

  const stats = useMemo(() => {
    const list = (rows ?? []).filter((r) => !r.model.startsWith("lacznik-"));
    const byModel: Record<string, number> = { claude: 0, perplexity: 0, chatgpt: 0 };
    const byQuery = new Map<string, { total: number; claude: number; perplexity: number; chatgpt: number }>();
    let custom = 0;

    for (const r of list) {
      if (byModel[r.model] !== undefined) byModel[r.model] += 1;
      if (r.is_custom) custom += 1;
      const q = byQuery.get(r.query) ?? { total: 0, claude: 0, perplexity: 0, chatgpt: 0 };
      q.total += 1;
      if (q[r.model as "claude" | "perplexity" | "chatgpt"] !== undefined) {
        q[r.model as "claude" | "perplexity" | "chatgpt"] += 1;
      }
      byQuery.set(r.query, q);
    }

    const topQueries = Array.from(byQuery.entries())
      .map(([query, v]) => ({ query, ...v }))
      .sort((a, b) => b.total - a.total);

    return { total: list.length, byModel, custom, topQueries, recent: list.slice(0, 50) };
  }, [rows]);

  const exportToCSV = () => {
    if (!rows || rows.length === 0) return;
    const headers = ["Data", "Pytanie", "Model", "Źródło", "Własne"];
    const lines = rows.map((r) => [
      format(new Date(r.created_at), "yyyy-MM-dd HH:mm", { locale: pl }),
      `"${r.query.replace(/"/g, '""')}"`,
      MODEL_LABELS[r.model] ?? r.model,
      r.source,
      r.is_custom ? "Tak" : "Nie",
    ]);
    const csv = [headers, ...lines].map((row) => row.join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `statystyki-llm_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast({ title: "Eksport zakończony", description: "Statystyki zapisane do pliku CSV" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statystyki „Zapytaj AI"</h1>
          <p className="text-muted-foreground">Pytania kierowane do modeli LLM z widgetu na stronie</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => (window.location.href = "/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Panel
          </Button>
          <Button variant="outline" onClick={exportToCSV} disabled={!rows || rows.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Eksportuj CSV
          </Button>
        </div>
      </div>

      {/* Serwer MCP: wywolania (dane.mojaserowarnia.pl) */}
      <Card>
        <CardHeader>
          <CardTitle>Serwer MCP: wywołania</CardTitle>
          <CardDescription>
            Sumy dzienne z dane.mojaserowarnia.pl, dzień liczony w UTC. „Własne” to Twoje testy: łącznik ze
            znacznikiem własnym albo test-marek. Połączenia i listy narzędzi to w większości skanery katalogów
            MCP, dlatego są domyślnie ukryte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-md border p-3">
              <div className="text-sm text-muted-foreground">Narzędzia, cudze (7 dni)</div>
              <div className="text-2xl font-bold">{mcp.suma.narzedziaCudze}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm text-muted-foreground">Narzędzia, własne (7 dni)</div>
              <div className="text-2xl font-bold">{mcp.suma.narzedziaWlasne}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm text-muted-foreground">Połączenia, cudze (7 dni)</div>
              <div className="text-2xl font-bold">{mcp.suma.polaczeniaCudze}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-sm text-muted-foreground">Kto używał narzędzi (7 dni)</div>
              <div className="text-sm font-medium">
                {mcp.klienci.length === 0
                  ? "nikt spoza nas"
                  : mcp.klienci.map(([klient, n]) => `${klient} ${n}`).join(" · ")}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={pokazTechniczne}
              onChange={(e) => setPokazTechniczne(e.target.checked)}
            />
            Pokaż połączenia, listy narzędzi i sondy
          </label>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dzień</TableHead>
                  <TableHead>Klient</TableHead>
                  <TableHead>Narzędzie</TableHead>
                  <TableHead>Źródło</TableHead>
                  <TableHead>Kto</TableHead>
                  <TableHead className="text-right">Wywołania</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mcp.tabela.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Brak wywołań narzędzi.
                    </TableCell>
                  </TableRow>
                ) : (
                  mcp.tabela.map((w) => (
                    <TableRow key={`${w.dzien}|${w.klient}|${w.narzedzie}|${w.zrodlo}|${w.wlasne}`}>
                      <TableCell className="whitespace-nowrap text-sm">{w.dzien}</TableCell>
                      <TableCell>{w.klient}</TableCell>
                      <TableCell className="font-mono text-sm">{w.narzedzie}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{w.zrodlo || "brak"}</TableCell>
                      <TableCell>
                        <Badge variant={w.wlasne ? "outline" : "secondary"}>{w.wlasne ? "własne" : "cudze"}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {w.wywolan}
                        {w.bledy > 0 && (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">(błędy: {w.bledy})</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Karty zbiorcze */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie zapytania</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.custom} własnych pytań</p>
          </CardContent>
        </Card>
        {(["claude", "perplexity", "chatgpt"] as const).map((m) => (
          <Card key={m}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{MODEL_LABELS[m]}</CardTitle>
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: MODEL_COLORS[m] }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byModel[m]}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total ? ((stats.byModel[m] / stats.total) * 100).toFixed(0) : 0}% wszystkich
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Łączniki Claude i ChatGPT: klikniecia przyciskow wedlug strony */}
      <Card>
        <CardHeader>
          <CardTitle>Łączniki Claude i ChatGPT: kliknięcia według strony</CardTitle>
          <CardDescription>
            Przyciski „Dodaj do Claude” i „Dodaj do ChatGPT”: menu boczne, przycisk na stronie, kopiowanie adresu,
            link z posta (/claude/dodaj?z=... albo /chatgpt?z=..., wiersz = znacznik posta). To zamiar, nie
            podłączenie; podłączenia ze znacznikiem strony liczy serwer MCP (magazyn_wywolania.zrodlo). Razem:{" "}
            {lacznik.razem}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asystent</TableHead>
                  <TableHead>Strona</TableHead>
                  <TableHead className="text-right">Razem</TableHead>
                  <TableHead className="text-right">Menu</TableHead>
                  <TableHead className="text-right">Przycisk</TableHead>
                  <TableHead className="text-right">Kopiuj adres</TableHead>
                  <TableHead className="text-right">Link z posta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lacznik.strony.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Jeszcze nikt nie kliknął.
                    </TableCell>
                  </TableRow>
                ) : (
                  lacznik.strony.map((w) => (
                    <TableRow key={`${w.asystent}|${w.strona}`}>
                      <TableCell>{w.asystent}</TableCell>
                      <TableCell className="font-mono text-sm">{w.strona}</TableCell>
                      <TableCell className="text-right font-semibold">{w.razem}</TableCell>
                      <TableCell className="text-right">{w.menu}</TableCell>
                      <TableCell className="text-right">{w.przycisk}</TableCell>
                      <TableCell className="text-right">{w.kopiuj}</TableCell>
                      <TableCell className="text-right">{w.link}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Najczęstsze pytania */}
      <Card>
        <CardHeader>
          <CardTitle>Najczęstsze pytania</CardTitle>
          <CardDescription>Pogrupowane wg treści pytania, z podziałem na model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pytanie</TableHead>
                  <TableHead className="text-right">Razem</TableHead>
                  <TableHead className="text-right">Claude</TableHead>
                  <TableHead className="text-right">Perplexity</TableHead>
                  <TableHead className="text-right">ChatGPT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topQueries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Brak danych — nikt jeszcze nie użył widgetu „Zapytaj AI".
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.topQueries.map((q) => (
                    <TableRow key={q.query}>
                      <TableCell className="font-medium max-w-md">{q.query}</TableCell>
                      <TableCell className="text-right font-bold">{q.total}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{q.claude}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{q.perplexity}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{q.chatgpt}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Ostatnie zapytania */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnie zapytania</CardTitle>
          <CardDescription>50 najnowszych kliknięć</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Pytanie</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Źródło</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Brak danych.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recent.map((r, i) => (
                    <TableRow key={`${r.created_at}-${i}`}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {format(new Date(r.created_at), "dd.MM.yyyy HH:mm", { locale: pl })}
                      </TableCell>
                      <TableCell className="max-w-md">{r.query}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" style={{ backgroundColor: MODEL_COLORS[r.model], color: "#fff" }}>
                          {MODEL_LABELS[r.model] ?? r.model}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.source}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
