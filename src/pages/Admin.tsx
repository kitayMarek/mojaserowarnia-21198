import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Download, Mail, Users, CheckCircle2, XCircle, Loader2, Newspaper } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface UserWithRoles {
  user_id: string;
  email: string;
  firma_nazwa: string | null;
  nip: string | null;
  adres: string | null;
  telefon: string | null;
  marketing_consent: boolean;
  marketing_consent_date: string | null;
  created_at: string;
  roles: string[];
}

export default function Admin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_users_with_roles");

      if (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać listy użytkowników",
          variant: "destructive",
        });
        throw error;
      }

      return data as UserWithRoles[];
    },
  });

  const filteredUsers = users?.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firma_nazwa?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.nip?.includes(searchQuery)
  );

  const exportToCSV = () => {
    if (!users) return;

    const headers = ["Email", "Nazwa firmy", "NIP", "Zgoda marketingowa", "Data rejestracji"];
    const rows = users.map((user) => [
      user.email,
      user.firma_nazwa || "",
      user.nip || "",
      user.marketing_consent ? "Tak" : "Nie",
      format(new Date(user.created_at), "dd.MM.yyyy", { locale: pl }),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `uzytkownicy_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();

    toast({
      title: "Eksport zakończony",
      description: "Lista użytkowników została wyeksportowana do pliku CSV",
    });
  };

  const handleSendEmail = async () => {
    if (!emailSubject || !emailMessage) {
      toast({
        title: "Błąd",
        description: "Wypełnij temat i treść wiadomości",
        variant: "destructive",
      });
      return;
    }

    const recipientsWithConsent = users?.filter((u) => u.marketing_consent) || [];
    
    if (recipientsWithConsent.length === 0) {
      toast({
        title: "Brak odbiorców",
        description: "Żaden użytkownik nie wyraził zgody na powiadomienia marketingowe",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);

    try {
      const { error } = await supabase.functions.invoke("send-notification", {
        body: {
          recipients: recipientsWithConsent.map((u) => u.email),
          subject: emailSubject,
          message: emailMessage,
        },
      });

      if (error) throw error;

      toast({
        title: "Powiadomienia wysłane",
        description: `Wiadomość została wysłana do ${recipientsWithConsent.length} użytkowników`,
      });

      setEmailSubject("");
      setEmailMessage("");
    } catch (error: any) {
      console.error("Error sending notifications:", error);
      toast({
        title: "Błąd wysyłania",
        description: error.message || "Nie udało się wysłać powiadomień",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const stats = {
    total: users?.length || 0,
    withConsent: users?.filter((u) => u.marketing_consent).length || 0,
    withoutConsent: users?.filter((u) => !u.marketing_consent).length || 0,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel Administratora</h1>
          <p className="text-muted-foreground">Zarządzanie użytkownikami i powiadomieniami</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszyscy użytkownicy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ze zgodą marketingową</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withConsent}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.withConsent / stats.total) * 100).toFixed(0)}% wszystkich
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bez zgody</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withoutConsent}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.withoutConsent / stats.total) * 100).toFixed(0)}% wszystkich
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Akcje</CardTitle>
          <CardDescription>Zarządzanie danymi i powiadomieniami</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Eksportuj do CSV
          </Button>

          <Button onClick={() => window.location.href = '/admin/news'} variant="outline">
            <Newspaper className="mr-2 h-4 w-4" />
            Zarządzanie Newsami
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Wyślij powiadomienie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Wyślij powiadomienie email</DialogTitle>
                <DialogDescription>
                  Wiadomość zostanie wysłana do {stats.withConsent} użytkowników, którzy wyrazili zgodę na
                  powiadomienia marketingowe.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Temat wiadomości</Label>
                  <Input
                    id="subject"
                    placeholder="np. Ważna aktualizacja systemu"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Treść wiadomości</Label>
                  <Textarea
                    id="message"
                    placeholder="Treść wiadomości..."
                    rows={8}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSendEmail} disabled={sendingEmail}>
                  {sendingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wysyłanie...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Wyślij do {stats.withConsent} użytkowników
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista użytkowników</CardTitle>
          <CardDescription>Wszyscy zarejestrowani użytkownicy systemu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Szukaj po email, nazwie firmy lub NIP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Firma/Imię</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Zgoda</TableHead>
                  <TableHead>Data rejestracji</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Brak użytkowników spełniających kryteria wyszukiwania
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.firma_nazwa || "-"}</TableCell>
                      <TableCell>{user.nip || "-"}</TableCell>
                      <TableCell>
                        {user.marketing_consent ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Tak
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="mr-1 h-3 w-3" />
                            Nie
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), "dd.MM.yyyy", { locale: pl })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.roles?.map((role) => (
                            <Badge key={role} variant={role === "admin" ? "default" : "secondary"}>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
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
