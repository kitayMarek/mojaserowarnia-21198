import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InvoiceItem {
  nazwa: string;
  ilosc: number;
  jednostka: string;
  cena_jedn: number;
  wartosc: number;
}

export default function NewInvoice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  
  // Seller form state
  const [sprzedawcaNazwa, setSprzedawcaNazwa] = useState("");
  const [sprzedawcaAdres, setSprzedawcaAdres] = useState("");
  const [sprzedawcaNip, setSprzedawcaNip] = useState("");
  const [sprzedawcaNrWet, setSprzedawcaNrWet] = useState("");
  
  // Form state
  const [dataWystawienia, setDataWystawienia] = useState(new Date().toISOString().split('T')[0]);
  const [nabywcaNazwa, setNabywcaNazwa] = useState("");
  const [nabywcaAdres, setNabywcaAdres] = useState("");
  const [nabywcaNip, setNabywcaNip] = useState("");
  const [uwagi, setUwagi] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { nazwa: "", ilosc: 0, jednostka: "kg", cena_jedn: 0, wartosc: 0 }
  ]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      generateInvoiceNumber();
      fetchProducts();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();
    
    if (data) {
      setProfile(data);
      setSprzedawcaNazwa(data.firma_nazwa || "");
      setSprzedawcaAdres(data.adres || "");
      setSprzedawcaNip(data.nip || "");
      setSprzedawcaNrWet(data.nr_weterynaryjny || "");
    }
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

  const generateInvoiceNumber = async () => {
    const { data } = await supabase.rpc("generate_invoice_number", {
      user_uuid: user!.id
    });
    
    if (data) {
      setInvoiceNumber(data);
    }
  };

  const addItem = () => {
    setItems([...items, { nazwa: "", ilosc: 0, jednostka: "kg", cena_jedn: 0, wartosc: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate wartosc
    if (field === "ilosc" || field === "cena_jedn") {
      newItems[index].wartosc = newItems[index].ilosc * newItems[index].cena_jedn;
    }
    
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.wartosc, 0);
  };

  const handleSaveInvoice = async (finalize: boolean) => {
    // Validation
    if (!nabywcaNazwa || !nabywcaAdres) {
      toast({
        title: "Błąd",
        description: "Wypełnij dane nabywcy",
        variant: "destructive",
      });
      return;
    }

    if (items.some(item => !item.nazwa || item.ilosc <= 0 || item.cena_jedn <= 0)) {
      toast({
        title: "Błąd",
        description: "Wypełnij wszystkie pozycje rachunku",
        variant: "destructive",
      });
      return;
    }

    const total = calculateTotal();

    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .insert([{
        user_id: user!.id,
        numer_rachunku: invoiceNumber,
        data_wystawienia: dataWystawienia,
        nabywca_nazwa: nabywcaNazwa,
        nabywca_adres: nabywcaAdres,
        nabywca_nip: nabywcaNip || null,
        pozycje: items as any,
        kwota_netto: total,
        kwota_brutto: total,
        uwagi: uwagi || null,
        wydrukowany: finalize,
      }])
      .select()
      .single();

    if (invoiceError) {
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać rachunku",
        variant: "destructive",
      });
      return;
    }

    // If finalizing, add to sales records
    if (finalize && invoiceData) {
      for (const item of items) {
        await supabase.from("sales_records").insert([{
          user_id: user!.id,
          data_sprzedazy: dataWystawienia,
          rodzaj_zywnosci: item.nazwa,
          ilosc: item.ilosc,
          jednostka: item.jednostka,
          kwota_przychodu: item.wartosc,
          odbiorca_typ: "konsument końcowy",
          odbiorca_nazwa: nabywcaNazwa,
          numer_rachunku: invoiceNumber,
        }]);
      }

      toast({
        title: "Rachunek wystawiony",
        description: "Rachunek został zapisany i dodany do ewidencji",
      });
      
      // Generate PDF (placeholder - would need jspdf or similar)
      window.print();
      
      navigate("/dashboard/rachunki");
    } else {
      toast({
        title: "Zapisano szkic",
        description: "Rachunek został zapisany jako szkic",
      });
      navigate("/dashboard/rachunki");
    }
  };

  return (
    <div className="space-y-6 invoice-print">
      <div>
        <h2 className="text-3xl font-bold">Wystaw rachunek</h2>
        <p className="text-muted-foreground">Nowy rachunek RHD</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dane rachunku</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Numer rachunku</Label>
                  <Input value={invoiceNumber} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data wystawienia</Label>
                  <Input
                    id="data"
                    type="date"
                    value={dataWystawienia}
                    onChange={(e) => setDataWystawienia(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="invoice-parties">
            <Card>
              <CardHeader>
                <CardTitle>Sprzedawca</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sprzedawca-nazwa">Nazwa firmy *</Label>
                  <Input
                    id="sprzedawca-nazwa"
                    value={sprzedawcaNazwa}
                    onChange={(e) => setSprzedawcaNazwa(e.target.value)}
                    placeholder="Nazwa firmy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sprzedawca-adres">Adres *</Label>
                  <Input
                    id="sprzedawca-adres"
                    value={sprzedawcaAdres}
                    onChange={(e) => setSprzedawcaAdres(e.target.value)}
                    placeholder="Adres"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sprzedawca-nip">NIP</Label>
                  <Input
                    id="sprzedawca-nip"
                    value={sprzedawcaNip}
                    onChange={(e) => setSprzedawcaNip(e.target.value)}
                    placeholder="NIP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sprzedawca-nrwet">Nr weterynaryjny</Label>
                  <Input
                    id="sprzedawca-nrwet"
                    value={sprzedawcaNrWet}
                    onChange={(e) => setSprzedawcaNrWet(e.target.value)}
                    placeholder="Nr weterynaryjny"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nabywca</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nabywca-nazwa">Nazwa / Imię i nazwisko *</Label>
                  <Input
                    id="nabywca-nazwa"
                    value={nabywcaNazwa}
                    onChange={(e) => setNabywcaNazwa(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nabywca-adres">Adres *</Label>
                  <Input
                    id="nabywca-adres"
                    value={nabywcaAdres}
                    onChange={(e) => setNabywcaAdres(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nabywca-nip">NIP</Label>
                  <Input
                    id="nabywca-nip"
                    value={nabywcaNip}
                    onChange={(e) => setNabywcaNip(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pozycje</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj pozycję
                </Button>
              </div>
            </CardHeader>
            <CardContent className="no-print">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lp.</TableHead>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Ilość</TableHead>
                    <TableHead>Jedn.</TableHead>
                    <TableHead>Cena jedn.</TableHead>
                    <TableHead>Wartość</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={item.nazwa}
                          onChange={(e) => updateItem(index, "nazwa", e.target.value)}
                          placeholder="Nazwa produktu"
                          list={`products-list-${index}`}
                        />
                        <datalist id={`products-list-${index}`}>
                          {products.map((product) => (
                            <option key={product.id} value={product.nazwa} />
                          ))}
                        </datalist>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.ilosc || ""}
                          onChange={(e) => updateItem(index, "ilosc", parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.jednostka}
                          onValueChange={(value) => updateItem(index, "jednostka", value)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="l">l</SelectItem>
                            <SelectItem value="szt">szt</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.cena_jedn || ""}
                          onChange={(e) => updateItem(index, "cena_jedn", parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.wartosc.toFixed(2)} zł
                      </TableCell>
                      <TableCell>
                        {items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Suma całkowita</p>
                  <p className="text-2xl font-bold">{calculateTotal().toFixed(2)} zł</p>
                  <p className="text-xs text-muted-foreground mt-1">Zwolnione z VAT</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Print-friendly positions table */}
          <div className="print-only">
            <h3 className="text-lg font-semibold mb-2">Pozycje</h3>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Lp.</th>
                  <th className="text-left">Nazwa</th>
                  <th className="text-left">Ilość</th>
                  <th className="text-left">Jedn.</th>
                  <th className="text-left">Cena jedn.</th>
                  <th className="text-left">Wartość</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.nazwa}</td>
                    <td>{item.ilosc}</td>
                    <td>{item.jednostka}</td>
                    <td>{item.cena_jedn.toFixed(2)} zł</td>
                    <td className="font-medium">{item.wartosc.toFixed(2)} zł</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="text-right font-medium">Suma</td>
                  <td className="font-bold">{calculateTotal().toFixed(2)} zł</td>
                </tr>
              </tfoot>
            </table>
            <p className="text-xs text-muted-foreground mt-1">Zwolnione z VAT</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dodatkowe informacje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="uwagi">Uwagi</Label>
                <Textarea
                  id="uwagi"
                  value={uwagi}
                  onChange={(e) => setUwagi(e.target.value)}
                  placeholder="Dodatkowe informacje"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6 no-print">
            <CardHeader>
              <CardTitle>Akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => handleSaveInvoice(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Drukuj i dodaj do ewidencji
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSaveInvoice(false)}
              >
                Zapisz jako szkic
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/dashboard")}
              >
                Anuluj
              </Button>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Informacja o RHD</p>
                <p className="text-xs text-muted-foreground">
                  Rachunek wystawiany w ramach Rolniczego Handlu Detalicznego
                  zgodnie z art. 15 rozporządzenia 852/2004.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
