import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, FileDown } from "lucide-react";
import { z } from "zod";

const salesSchema = z.object({
  data_sprzedazy: z.string().min(1, "Data jest wymagana"),
  rodzaj_zywnosci: z.string().min(1, "Rodzaj żywności jest wymagany"),
  ilosc: z.number().positive("Ilość musi być większa od 0"),
  jednostka: z.string().min(1, "Jednostka jest wymagana"),
  kwota_przychodu: z.number().positive("Kwota musi być większa od 0"),
  odbiorca_typ: z.enum(["konsument końcowy", "zakład detaliczny"]),
  odbiorca_nazwa: z.string().optional(),
  uwagi: z.string().optional(),
});

export default function Ewidencja() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Form state
  const [dataSprzedazy, setDataSprzedazy] = useState(new Date().toISOString().split('T')[0]);
  const [rodzajZywnosci, setRodzajZywnosci] = useState("");
  const [ilosc, setIlosc] = useState("");
  const [jednostka, setJednostka] = useState("kg");
  const [kwotaPrzychodu, setKwotaPrzychodu] = useState("");
  const [odbiorcaTyp, setOdbiorcaTyp] = useState<"konsument końcowy" | "zakład detaliczny">("konsument końcowy");
  const [odbiorcaNazwa, setOdbiorcaNazwa] = useState("");
  const [uwagi, setUwagi] = useState("");

  useEffect(() => {
    if (user) {
      fetchRecords();
      fetchProducts();
    }
  }, [user]);

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sales_records")
      .select("*")
      .order("data_sprzedazy", { ascending: false });

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać ewidencji",
        variant: "destructive",
      });
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("updated_at", { ascending: false });
    
    if (data) {
      setProducts(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = salesSchema.parse({
        data_sprzedazy: dataSprzedazy,
        rodzaj_zywnosci: rodzajZywnosci,
        ilosc: parseFloat(ilosc),
        jednostka,
        kwota_przychodu: parseFloat(kwotaPrzychodu),
        odbiorca_typ: odbiorcaTyp,
        odbiorca_nazwa: odbiorcaNazwa || undefined,
        uwagi: uwagi || undefined,
      });

      const { error } = await supabase.from("sales_records").insert([{
        user_id: user!.id,
        data_sprzedazy: validatedData.data_sprzedazy,
        rodzaj_zywnosci: validatedData.rodzaj_zywnosci,
        ilosc: validatedData.ilosc,
        jednostka: validatedData.jednostka,
        kwota_przychodu: validatedData.kwota_przychodu,
        odbiorca_typ: validatedData.odbiorca_typ,
        odbiorca_nazwa: validatedData.odbiorca_nazwa || null,
        uwagi: validatedData.uwagi || null,
      }]);

      if (error) throw error;

      // Save/update product
      await supabase
        .from("products")
        .upsert({
          user_id: user!.id,
          nazwa: validatedData.rodzaj_zywnosci,
          jednostka: validatedData.jednostka,
          ostatnia_cena: validatedData.kwota_przychodu / validatedData.ilosc,
        }, {
          onConflict: 'user_id,nazwa'
        });

      toast({
        title: "Dodano wpis",
        description: "Wpis został dodany do ewidencji",
      });

      // Reset form
      setRodzajZywnosci("");
      setIlosc("");
      setKwotaPrzychodu("");
      setOdbiorcaNazwa("");
      setUwagi("");
      setShowForm(false);

      fetchRecords();
      fetchProducts();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Błąd walidacji",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Błąd",
          description: "Nie udało się dodać wpisu",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten wpis?")) return;

    const { error } = await supabase.from("sales_records").delete().eq("id", id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć wpisu",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Usunięto",
        description: "Wpis został usunięty",
      });
      fetchRecords();
    }
  };

  const calculateCumulative = () => {
    const currentYear = new Date().getFullYear();
    let cumulative = 0;
    return records.map((record) => {
      const recordYear = new Date(record.data_sprzedazy).getFullYear();
      if (recordYear === currentYear) {
        cumulative += Number(record.kwota_przychodu);
      } else {
        cumulative = Number(record.kwota_przychodu);
      }
      return { ...record, cumulative };
    });
  };

  const recordsWithCumulative = calculateCumulative();

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
          <h2 className="text-3xl font-bold">Ewidencja sprzedaży</h2>
          <p className="text-muted-foreground">Rejestr sprzedaży w ramach RHD</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Anuluj" : "Dodaj wpis"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nowy wpis w ewidencji</CardTitle>
            <CardDescription>Wypełnij dane sprzedaży</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data sprzedaży *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={dataSprzedazy}
                    onChange={(e) => setDataSprzedazy(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rodzaj">Rodzaj żywności *</Label>
                  <Input
                    id="rodzaj"
                    value={rodzajZywnosci}
                    onChange={(e) => setRodzajZywnosci(e.target.value)}
                    placeholder="np. Ser dojrzewający"
                    list="products-list"
                    required
                  />
                  <datalist id="products-list">
                    {products.map((product) => (
                      <option key={product.id} value={product.nazwa} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ilosc">Ilość *</Label>
                  <Input
                    id="ilosc"
                    type="number"
                    step="0.01"
                    value={ilosc}
                    onChange={(e) => setIlosc(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jednostka">Jednostka *</Label>
                  <Select value={jednostka} onValueChange={setJednostka}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="l">l</SelectItem>
                      <SelectItem value="szt">szt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kwota">Kwota przychodu (zł) *</Label>
                  <Input
                    id="kwota"
                    type="number"
                    step="0.01"
                    value={kwotaPrzychodu}
                    onChange={(e) => setKwotaPrzychodu(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="odbiorca-typ">Typ odbiorcy *</Label>
                  <Select value={odbiorcaTyp} onValueChange={(value: any) => setOdbiorcaTyp(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="konsument końcowy">Konsument końcowy</SelectItem>
                      <SelectItem value="zakład detaliczny">Zakład detaliczny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="odbiorca-nazwa">Nazwa odbiorcy</Label>
                  <Input
                    id="odbiorca-nazwa"
                    value={odbiorcaNazwa}
                    onChange={(e) => setOdbiorcaNazwa(e.target.value)}
                    placeholder="Opcjonalne"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="uwagi">Uwagi</Label>
                <Textarea
                  id="uwagi"
                  value={uwagi}
                  onChange={(e) => setUwagi(e.target.value)}
                  placeholder="Dodatkowe informacje"
                />
              </div>

              <Button type="submit" className="w-full">Dodaj wpis</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista wpisów</CardTitle>
          <CardDescription>Wszystkie wpisy w ewidencji sprzedaży</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Brak wpisów w ewidencji</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lp.</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Rodzaj żywności</TableHead>
                    <TableHead>Ilość</TableHead>
                    <TableHead>Kwota</TableHead>
                    <TableHead>Narastająco</TableHead>
                    <TableHead>Odbiorca</TableHead>
                    <TableHead>Rachunek</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordsWithCumulative.map((record, index) => (
                    <TableRow key={record.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{new Date(record.data_sprzedazy).toLocaleDateString("pl-PL")}</TableCell>
                      <TableCell>{record.rodzaj_zywnosci}</TableCell>
                      <TableCell>{record.ilosc} {record.jednostka}</TableCell>
                      <TableCell>{Number(record.kwota_przychodu).toFixed(2)} zł</TableCell>
                      <TableCell className="font-medium">{record.cumulative.toFixed(2)} zł</TableCell>
                      <TableCell>{record.odbiorca_typ}</TableCell>
                      <TableCell>
                        {record.numer_rachunku ? (
                          <Badge variant="secondary">{record.numer_rachunku}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
