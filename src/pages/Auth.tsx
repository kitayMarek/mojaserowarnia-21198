import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
});

const registerSchema = loginSchema.extend({
  firma_nazwa: z.string().optional(),
  nip: z.string().optional(),
  adres: z.string().optional(),
  telefon: z.string().optional(),
});

export default function Auth() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [firmaNazwa, setFirmaNazwa] = useState("");
  const [nip, setNip] = useState("");
  const [adres, setAdres] = useState("");
  const [telefon, setTelefon] = useState("");

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      loginSchema.parse({ email: loginEmail, password: loginPassword });
      
      setLoading(true);
      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        toast({
          title: "Błąd logowania",
          description: error.message === "Invalid login credentials" 
            ? "Nieprawidłowy email lub hasło"
            : error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Zalogowano pomyślnie",
          description: "Witamy w systemie ewidencji RHD",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Błąd walidacji",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      registerSchema.parse({
        email: registerEmail,
        password: registerPassword,
        firma_nazwa: firmaNazwa,
        nip,
        adres,
        telefon,
      });
      
      setLoading(true);
      const { error } = await signUp(registerEmail, registerPassword, {
        firma_nazwa: firmaNazwa || undefined,
        nip: nip || undefined,
        adres: adres || undefined,
        telefon: telefon || undefined,
      });
      
      if (error) {
        toast({
          title: "Błąd rejestracji",
          description: error.message === "User already registered"
            ? "Użytkownik o tym adresie email już istnieje"
            : error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Rejestracja zakończona",
          description: "Konto zostało utworzone. Możesz się teraz zalogować.",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Błąd walidacji",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">System Ewidencji RHD</CardTitle>
          <CardDescription className="text-center">
            Zarządzaj sprzedażą i rachunkami w ramach Rolniczego Handlu Detalicznego
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Logowanie</TabsTrigger>
              <TabsTrigger value="register">Rejestracja</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="twoj@email.pl"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Hasło</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logowanie..." : "Zaloguj się"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email *</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="twoj@email.pl"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Hasło *</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Minimum 6 znaków"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firma-nazwa">Nazwa firmy / Imię i nazwisko</Label>
                  <Input
                    id="firma-nazwa"
                    type="text"
                    placeholder="Opcjonalne"
                    value={firmaNazwa}
                    onChange={(e) => setFirmaNazwa(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nip">NIP</Label>
                  <Input
                    id="nip"
                    type="text"
                    placeholder="Opcjonalne"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adres">Adres</Label>
                  <Input
                    id="adres"
                    type="text"
                    placeholder="Opcjonalne"
                    value={adres}
                    onChange={(e) => setAdres(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefon">Telefon</Label>
                  <Input
                    id="telefon"
                    type="tel"
                    placeholder="Opcjonalne"
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Rejestracja..." : "Zarejestruj się"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
