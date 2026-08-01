import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, TrendingUp, ExternalLink, ArrowRight, Plus, Receipt, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    recentSales: [] as any[],
    loading: true,
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const currentYear = new Date().getFullYear();
      const startOfYear = `${currentYear}-01-01`;
      const endOfYear = `${currentYear}-12-31`;

      // Fetch total revenue for current year
      // @ts-ignore - Lovable Cloud type generation issue
      const { data: salesData, error: salesError } = await supabase
        .from("sales_records")
        .select("kwota_przychodu")
        .gte("data_sprzedazy", startOfYear)
        .lte("data_sprzedazy", endOfYear);

      // Fetch recent sales
      // @ts-ignore - Lovable Cloud type generation issue
      const { data: recentData, error: recentError } = await supabase
        .from("sales_records")
        .select("*")
        .order("data_sprzedazy", { ascending: false })
        .limit(5);

      if (!salesError && !recentError) {
        // @ts-ignore
        const total = salesData?.reduce((sum, record) => sum + Number(record.kwota_przychodu), 0) || 0;
        setStats({
          totalRevenue: total,
          recentSales: recentData || [],
          loading: false,
        });
      } else {
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [user]);

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const limitPercentage = (stats.totalRevenue / 100000) * 100;
  const isNearLimit = limitPercentage >= 80;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pulpit główny</h2>
        <p className="text-muted-foreground">
          Przegląd Twojej działalności RHD
        </p>
      </div>

      {isNearLimit && (
        <Alert variant={limitPercentage >= 100 ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {limitPercentage >= 100 ? "Przekroczono limit RHD!" : "Zbliżasz się do limitu RHD"}
          </AlertTitle>
          <AlertDescription>
            Wykorzystano {limitPercentage.toFixed(1)}% rocznego limitu (100 000 zł)
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Przychód narastająco w {new Date().getFullYear()} r.
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRevenue.toFixed(2)} zł
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Limit: 100 000 zł ({(100 - limitPercentage).toFixed(1)}% pozostało)
            </p>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(limitPercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Liczba wpisów
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.recentSales.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ostatnie wpisy w ewidencji
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Szybkie akcje — nasze narzędzia, bez wychodzenia z serwisu */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Szybkie akcje</CardTitle>
          <CardDescription>Narzędzia przydatne przy prowadzeniu ewidencji</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => navigate("/dashboard/ewidencja")} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj wpis do ewidencji
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/rachunki/nowy")}>
            <Receipt className="h-4 w-4 mr-2" />
            Nowy rachunek
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/faktura-vat-rr")}>
            <FileText className="h-4 w-4 mr-2" />
            Faktura VAT RR (+7%)
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/etykieta-rhd")}>
            <Tag className="h-4 w-4 mr-2" />
            Etykieta RHD
          </Button>
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Potrzebujesz więcej?</h3>
            <p className="text-sm text-muted-foreground">
              Fermly.pl to pełne narzędzie dla gospodarstwa — rejestr RHD ze wspólną numeracją, faktury VAT RR (+7% automatycznie), kasa i bank, katalog produktów i odbiorców. Twoje dane z serowarni możesz przenieść.
            </p>
          </div>
          <a
            href="https://www.fermly.pl/mleko/rhd"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0"
          >
            Otwórz Fermly
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ostatnie wpisy w ewidencji</CardTitle>
          <CardDescription>
            5 najnowszych zapisów sprzedaży
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentSales.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Brak wpisów w ewidencji. Dodaj pierwszy wpis lub wystaw rachunek.
            </p>
          ) : (
            <div className="space-y-4">
              {stats.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{sale.rodzaj_zywnosci}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sale.data_sprzedazy).toLocaleDateString("pl-PL")} • {sale.ilosc} {sale.jednostka}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Number(sale.kwota_przychodu).toFixed(2)} zł</p>
                    <p className="text-sm text-muted-foreground">{sale.odbiorca_typ}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
