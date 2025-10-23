import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();

    if (data) {
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
    </div>
  );
}
