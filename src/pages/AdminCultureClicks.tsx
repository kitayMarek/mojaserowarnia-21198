import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Loader2, MousePointerClick, Store, FlaskConical } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface ClickRow {
  culture_name: string;
  shop_name: string;
  clicked_at: string;
  user_agent: string | null;
}

export default function AdminCultureClicks() {
  const { data: rows, isLoading } = useQuery({
    queryKey: ["cultureClicks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("culture_clicks")
        .select("culture_name, shop_name, clicked_at, user_agent")
        .order("clicked_at", { ascending: false })
        .limit(20000);

      if (error) {
        console.error("Error fetching culture_clicks:", error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać kliknięć. Sprawdź, czy w Supabase jest polityka SELECT dla admina.",
          variant: "destructive",
        });
        throw error;
      }
      return (data ?? []) as ClickRow[];
    },
  });

  const stats = useMemo(() => {
    const list = rows ?? [];
    const byCulture = new Map<string, number>();
    const byShop = new Map<string, number>();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    let last7 = 0;

    for (const r of list) {
      byCulture.set(r.culture_name, (byCulture.get(r.culture_name) ?? 0) + 1);
      byShop.set(r.shop_name, (byShop.get(r.shop_name) ?? 0) + 1);
      if (new Date(r.clicked_at) >= weekAgo) last7 += 1;
    }

    const topCultures = Array.from(byCulture.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const topShops = Array.from(byShop.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: list.length,
      last7,
      cultures: byCulture.size,
      shops: byShop.size,
      topCultures,
      topShops,
      recent: list.slice(0, 50),
    };
  }, [rows]);

  const pct = (n: number) => (stats.total ? ((n / stats.total) * 100).toFixed(0) : "0");

  const exportToCSV = () => {
    if (!stats.topCultures.length && !stats.topShops.length) return;
    const lines: string[][] = [["Typ", "Nazwa", "Kliknięcia"]];
    stats.topShops.forEach((s) => lines.push(["Sklep", s.name, String(s.count)]));
    stats.topCultures.forEach((c) => lines.push(["Kultura", c.name, String(c.count)]));
    const csv = lines.map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `klikniecia-sklepy_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast({ title: "Eksport zakończony", description: "Ranking kliknięć zapisany do CSV" });
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
          <h1 className="text-3xl font-bold">Kliknięcia „Kup w sklepie"</h1>
          <p className="text-muted-foreground">Które kultury i które sklepy mają największe wzięcie (afiliacja)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => (window.location.href = "/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Panel
          </Button>
          <Button variant="outline" onClick={exportToCSV} disabled={!stats.total}>
            <Download className="mr-2 h-4 w-4" />
            Eksportuj CSV
          </Button>
        </div>
      </div>

      {/* Karty zbiorcze */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie kliknięcia</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.last7} w ostatnich 7 dniach</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ostatnie 7 dni</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.last7}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Klikanych kultur</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cultures}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sklepów</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shops}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top sklepy */}
        <Card>
          <CardHeader>
            <CardTitle>Sklepy wg kliknięć</CardTitle>
            <CardDescription>Który sklep generuje najwięcej przejść</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sklep</TableHead>
                    <TableHead className="text-right">Kliknięcia</TableHead>
                    <TableHead className="text-right">Udział</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topShops.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        Brak danych — nikt jeszcze nie kliknął „Kup w sklepie".
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.topShops.map((s) => (
                      <TableRow key={s.name}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-right font-bold">{s.count}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{pct(s.count)}%</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Top kultury */}
        <Card>
          <CardHeader>
            <CardTitle>Kultury wg kliknięć</CardTitle>
            <CardDescription>Najczęściej klikane produkty</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-[420px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kultura</TableHead>
                    <TableHead className="text-right">Kliknięcia</TableHead>
                    <TableHead className="text-right">Udział</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topCultures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        Brak danych.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.topCultures.map((c) => (
                      <TableRow key={c.name}>
                        <TableCell className="font-medium max-w-xs">{c.name}</TableCell>
                        <TableCell className="text-right font-bold">{c.count}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{pct(c.count)}%</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ostatnie kliknięcia */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnie kliknięcia</CardTitle>
          <CardDescription>50 najnowszych przejść do sklepu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Kultura</TableHead>
                  <TableHead>Sklep</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Brak danych.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recent.map((r, i) => (
                    <TableRow key={`${r.clicked_at}-${i}`}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {format(new Date(r.clicked_at), "dd.MM.yyyy HH:mm", { locale: pl })}
                      </TableCell>
                      <TableCell className="max-w-xs">{r.culture_name}</TableCell>
                      <TableCell className="text-sm">{r.shop_name}</TableCell>
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
