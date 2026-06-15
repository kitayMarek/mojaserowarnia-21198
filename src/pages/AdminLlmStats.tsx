import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface LlmRow {
  query: string;
  model: string;
  source: string;
  is_custom: boolean;
  created_at: string;
}

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

  const stats = useMemo(() => {
    const list = rows ?? [];
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
