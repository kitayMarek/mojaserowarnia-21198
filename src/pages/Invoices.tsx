import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Eye, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Invoices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("data_wystawienia", { ascending: false });

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać rachunków",
        variant: "destructive",
      });
    } else {
      setInvoices(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten rachunek?")) return;

    const { error } = await supabase.from("invoices").delete().eq("id", id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć rachunku",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Usunięto",
        description: "Rachunek został usunięty",
      });
      fetchInvoices();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Archiwum rachunków</h2>
          <p className="text-muted-foreground">Wszystkie wystawione rachunki</p>
        </div>
        <Button onClick={() => navigate("/dashboard/rachunki/nowy")}>
          <Plus className="h-4 w-4 mr-2" />
          Nowy rachunek
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista rachunków</CardTitle>
          <CardDescription>Historia wystawionych rachunków RHD</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Brak rachunków. Wystaw pierwszy rachunek.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numer</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Nabywca</TableHead>
                    <TableHead>Kwota brutto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.numer_rachunku}</TableCell>
                      <TableCell>
                        {new Date(invoice.data_wystawienia).toLocaleDateString("pl-PL")}
                      </TableCell>
                      <TableCell>{invoice.nabywca_nazwa}</TableCell>
                      <TableCell>{Number(invoice.kwota_brutto).toFixed(2)} zł</TableCell>
                      <TableCell>
                        <Badge variant={invoice.wydrukowany ? "default" : "secondary"}>
                          {invoice.wydrukowany ? "Wydrukowany" : "Szkic"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement preview modal
                              toast({
                                title: "Podgląd",
                                description: "Funkcja w przygotowaniu",
                              });
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!invoice.wydrukowany && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(invoice.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
