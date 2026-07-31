import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Download, AlertTriangle } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // RODO: eksport i usunięcie konta
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Profile state
  const [firmaNazwa, setFirmaNazwa] = useState("");
  const [nip, setNip] = useState("");
  const [adres, setAdres] = useState("");
  const [telefon, setTelefon] = useState("");

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // RODO art. 20 — pobranie kompletu własnych danych
  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data, error } = await (supabase as any).rpc("export_own_data");
      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `moje-dane_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast({ title: "Gotowe", description: "Plik z Twoimi danymi został pobrany." });
    } catch (e: any) {
      console.error("Eksport danych nieudany:", e);
      toast({
        title: "Nie udało się pobrać danych",
        description: e?.message ?? "Spróbuj ponownie za chwilę.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // RODO art. 17 — trwałe usunięcie konta wraz z danymi
  const handleDeleteAccount = async () => {
    if (deleteConfirm.trim() !== "USUŃ KONTO") return;
    setDeleting(true);
    try {
      const { error } = await (supabase as any).rpc("delete_own_account");
      if (error) throw error;

      await supabase.auth.signOut();
      toast({
        title: "Konto usunięte",
        description: "Twoje dane zostały trwale usunięte. Dziękujemy i do zobaczenia.",
      });
      navigate("/", { replace: true });
    } catch (e: any) {
      console.error("Usuwanie konta nieudane:", e);
      toast({
        title: "Nie udało się usunąć konta",
        description: e?.message ?? "Skontaktuj się z nami, usuniemy konto ręcznie.",
        variant: "destructive",
      });
      setDeleting(false);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    // @ts-ignore - Lovable Cloud type generation issue
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();

    if (data) {
      // @ts-ignore
      setFirmaNazwa(data.firma_nazwa || "");
      setNip(data.nip || "");
      setAdres(data.adres || "");
      setTelefon(data.telefon || "");
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // @ts-ignore - Lovable Cloud type generation issue
    const { error } = await supabase
      .from("profiles")
      .update({
        firma_nazwa: firmaNazwa,
        nip: nip,
        adres: adres,
        telefon: telefon,
      })
      .eq("id", user!.id);

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować profilu",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Zapisano",
        description: "Profil został zaktualizowany",
      });
    }

    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Błąd",
        description: "Hasła nie są identyczne",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Błąd",
        description: "Hasło musi mieć co najmniej 6 znaków",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zmienić hasła",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Zapisano",
        description: "Hasło zostało zmienione",
      });
      setNewPassword("");
      setConfirmPassword("");
    }

    setSaving(false);
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
      <div>
        <h2 className="text-3xl font-bold">Ustawienia</h2>
        <p className="text-muted-foreground">Zarządzaj swoim kontem i danymi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dane profilu</CardTitle>
          <CardDescription>
            Dane używane na rachunkach i dokumentach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firma">Nazwa firmy / Imię i nazwisko</Label>
              <Input
                id="firma"
                value={firmaNazwa}
                onChange={(e) => setFirmaNazwa(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nip">NIP</Label>
              <Input
                id="nip"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adres">Adres</Label>
              <Input
                id="adres"
                value={adres}
                onChange={(e) => setAdres(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                type="tel"
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Zapisz zmiany
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zmiana hasła</CardTitle>
          <CardDescription>Zaktualizuj swoje hasło dostępu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nowe hasło</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 znaków"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Potwierdź nowe hasło</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Powtórz nowe hasło"
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Zmień hasło
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* RODO: prawo do przenoszenia danych (art. 20) i do usunięcia (art. 17) */}
      <Card>
        <CardHeader>
          <CardTitle>Twoje dane</CardTitle>
          <CardDescription>
            Masz prawo pobrać wszystkie swoje dane oraz trwale usunąć konto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-1 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Pobierz swoje dane
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Otrzymasz plik JSON z profilem, ewidencją sprzedaży, fakturami, produktami,
              listami kultur i reakcjami.
            </p>
            <Button variant="outline" onClick={handleExportData} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Pobierz dane (JSON)
            </Button>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-medium mb-1 flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Usuń konto
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Trwale usuwa konto i <strong>wszystkie</strong> powiązane dane: profil, ewidencję
              sprzedaży, faktury, produkty i listy kultur.{" "}
              <strong className="text-destructive">Tej operacji nie da się cofnąć.</strong>{" "}
              Jeśli chcesz zachować kopię — najpierw pobierz dane powyżej.
            </p>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">Usuń konto</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-destructive">
                    Czy na pewno chcesz usunąć konto?
                  </DialogTitle>
                  <DialogDescription>
                    Usuniemy trwale Twój profil, całą ewidencję sprzedaży RHD, wystawione
                    faktury, produkty i listy kultur. Danych nie da się odzyskać — także nam.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                  <Label htmlFor="delete-confirm">
                    Aby potwierdzić, wpisz <strong>USUŃ KONTO</strong>
                  </Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="USUŃ KONTO"
                    autoComplete="off"
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                    Anuluj
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirm.trim() !== "USUŃ KONTO"}
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Usuń konto na zawsze
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
