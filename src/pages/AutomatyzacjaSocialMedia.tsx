import { useState } from "react";
import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Rss, Facebook, Zap, Send, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AutomatyzacjaSocialMedia = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const rssUrl = "https://isypstatsbyacnnfpukx.supabase.co/functions/v1/generate-rss";

  const handleCopyRss = () => {
    navigator.clipboard.writeText(rssUrl);
    setIsCopied(true);
    toast({
      title: "Skopiowano",
      description: "URL RSS został skopiowany do schowka",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTestWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl) {
      toast({
        title: "Błąd",
        description: "Wprowadź URL webhooka Zapier",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Testowanie webhooka Zapier:", webhookUrl);

    try {
      const testData = {
        title: "Test: Nowy przepis na ser Asiago",
        description: "Asiago to tradycyjny ser alpejski z regionu Veneto we Włoszech...",
        link: "https://mojaserowarnia.pl/przepisy/asiago",
        pubDate: new Date().toISOString(),
        category: "Przepisy",
        image: "https://mojaserowarnia.pl/asiago.jpg",
        source: "Moja Serowarnia RSS Feed",
        timestamp: new Date().toISOString(),
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(testData),
      });

      toast({
        title: "Żądanie wysłane",
        description: "Webhook został wywołany. Sprawdź historię Zapa w Zapier aby potwierdzić wykonanie.",
      });
    } catch (error) {
      console.error("Błąd podczas testowania webhooka:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się wywołać webhooka. Sprawdź URL i spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Automatyzacja Social Media - RSS Feed do Facebook | Moja Serowarnia</title>
        <meta 
          name="description" 
          content="Automatycznie publikuj nowe przepisy na Facebooku używając RSS Feed i Zapier/IFTTT. Instrukcje krok po kroku i panel testowy." 
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-gradient-warm rounded-full">
                <Rss className="h-5 w-5 text-primary" />
                <Facebook className="h-5 w-5 text-primary" />
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-gradient-warm bg-clip-text text-transparent">
                Automatyzacja Social Media
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Automatycznie publikuj nowe przepisy na Facebooku używając RSS Feed i narzędzi automatyzacji
              </p>
            </div>

            {/* RSS Feed Info */}
            <Alert className="mb-8 border-primary/20 bg-primary/5">
              <Rss className="h-5 w-5 text-primary" />
              <AlertDescription>
                <div className="flex flex-col gap-2">
                  <p className="font-semibold">Twój RSS Feed:</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="flex-1 bg-background px-3 py-2 rounded text-sm break-all">
                      {rssUrl}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyRss}
                      className="gap-2"
                    >
                      {isCopied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {isCopied ? "Skopiowano" : "Kopiuj"}
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Main Content Tabs */}
            <Tabs defaultValue="zapier" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="zapier">
                  <Zap className="h-4 w-4 mr-2" />
                  Zapier
                </TabsTrigger>
                <TabsTrigger value="ifttt">
                  <Send className="h-4 w-4 mr-2" />
                  IFTTT
                </TabsTrigger>
                <TabsTrigger value="webhook">
                  <Send className="h-4 w-4 mr-2" />
                  Webhook Panel
                </TabsTrigger>
              </TabsList>

              {/* Zapier Instructions */}
              <TabsContent value="zapier" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Automatyzacja przez Zapier
                    </CardTitle>
                    <CardDescription>
                      Połącz RSS Feed z Facebookiem używając Zapier (w pełni automatyczne)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Utwórz konto w Zapier</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Przejdź na <a href="https://zapier.com" target="_blank" rel="noopener" className="text-primary hover:underline">zapier.com</a> i załóż darmowe konto.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Utwórz nowy Zap</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Kliknij "Create Zap" i wybierz trigger:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          <li>Trigger: <strong>RSS by Zapier</strong> → "New Item in Feed"</li>
                          <li>Wklej URL RSS Feed (skopiuj powyżej)</li>
                          <li>Test: Zapier pobierze najnowsze elementy z feedu</li>
                        </ul>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Połącz z Facebookiem</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Dodaj Action:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          <li>Action: <strong>Facebook Pages</strong> → "Create Page Post"</li>
                          <li>Połącz swoje konto Facebook i wybierz stronę</li>
                          <li>Skonfiguruj treść posta:
                            <ul className="ml-6 mt-1 space-y-1">
                              <li><strong>Message</strong>: [Title] - [Description]</li>
                              <li><strong>Link</strong>: [Link]</li>
                              <li><strong>Photo URL</strong>: [Image] (opcjonalnie)</li>
                            </ul>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Filtruj duplikaty (opcjonalnie)</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Dodaj step "Filter by Zapier" między RSS a Facebookiem, aby unikać duplikatów lub publikować tylko wybrane kategorie.
                        </p>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        5
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Aktywuj Zap</h3>
                        <p className="text-sm text-muted-foreground">
                          Zapisz i włącz Zap. Od teraz każdy nowy przepis lub news pojawi się automatycznie na Facebooku!
                        </p>
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Częstotliwość sprawdzania:</strong> Darmowy plan Zapier sprawdza RSS co 15 minut. Plan płatny sprawdza co 1-5 minut.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* IFTTT Instructions */}
              <TabsContent value="ifttt" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-primary" />
                      Automatyzacja przez IFTTT
                    </CardTitle>
                    <CardDescription>
                      Alternatywna metoda automatyzacji używając IFTTT
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Utwórz konto IFTTT</h3>
                        <p className="text-sm text-muted-foreground">
                          Przejdź na <a href="https://ifttt.com" target="_blank" rel="noopener" className="text-primary hover:underline">ifttt.com</a> i załóż darmowe konto.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Utwórz nowy Applet</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Kliknij "Create" i wybierz trigger:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          <li>Trigger (IF): <strong>RSS Feed</strong> → "New feed item"</li>
                          <li>Wklej URL RSS Feed</li>
                        </ul>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Dodaj akcję Facebook</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Wybierz action:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          <li>Action (THEN): <strong>Facebook Pages</strong> → "Create a link post"</li>
                          <li>Połącz konto Facebook i wybierz stronę</li>
                          <li>Skonfiguruj post:
                            <ul className="ml-6 mt-1 space-y-1">
                              <li><strong>Message</strong>: {"{{EntryTitle}}"} - {"{{EntryContent}}"}</li>
                              <li><strong>Link URL</strong>: {"{{EntryUrl}}"}</li>
                            </ul>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">Aktywuj Applet</h3>
                        <p className="text-sm text-muted-foreground">
                          Zapisz i włącz Applet. Nowe pozycje z RSS będą automatycznie publikowane na Facebooku.
                        </p>
                      </div>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Częstotliwość:</strong> IFTTT sprawdza RSS co ~15 minut na darmowym planie. Plan Pro+ oferuje sprawdzanie co 5 minut.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Webhook Panel */}
              <TabsContent value="webhook" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-primary" />
                      Panel Webhooków Zapier
                    </CardTitle>
                    <CardDescription>
                      Dla zaawansowanych - testuj ręcznie webhooks Zapier
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Ta funkcja jest dla zaawansowanych użytkowników, którzy chcą mieć większą kontrolę nad publikacjami. 
                        Wymaga utworzenia Zapa z triggerem "Webhooks by Zapier".
                      </AlertDescription>
                    </Alert>

                    {/* Instructions for webhook */}
                    <div className="space-y-4 mb-6">
                      <h3 className="font-semibold">Jak skonfigurować webhook w Zapier:</h3>
                      <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-2">
                        <li>W Zapier utwórz nowy Zap</li>
                        <li>Trigger: <strong>Webhooks by Zapier</strong> → "Catch Hook"</li>
                        <li>Skopiuj wygenerowany URL webhooka</li>
                        <li>Action: <strong>Facebook Pages</strong> → "Create Page Post"</li>
                        <li>Skonfiguruj mapowanie danych: title, description, link, image</li>
                        <li>Wklej URL webhooka poniżej i przetestuj</li>
                      </ol>
                    </div>

                    {/* Webhook form */}
                    <form onSubmit={handleTestWebhook} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="webhook-url">URL Webhooka Zapier</Label>
                        <Input
                          id="webhook-url"
                          type="url"
                          placeholder="https://hooks.zapier.com/hooks/catch/..."
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Wklej URL webhooka wygenerowany przez Zapier
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading || !webhookUrl}
                        className="w-full gap-2"
                      >
                        {isLoading ? (
                          <>Wysyłanie...</>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Testuj Webhook
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Example payload */}
                    <div className="space-y-2">
                      <Label>Przykładowe dane wysyłane do webhooka:</Label>
                      <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "title": "Test: Nowy przepis na ser Asiago",
  "description": "Asiago to tradycyjny ser alpejski...",
  "link": "https://mojaserowarnia.pl/przepisy/asiago",
  "pubDate": "2025-11-29T12:00:00.000Z",
  "category": "Przepisy",
  "image": "https://mojaserowarnia.pl/asiago.jpg",
  "source": "Moja Serowarnia RSS Feed",
  "timestamp": "2025-11-29T12:00:00.000Z"
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Benefits Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Korzyści z automatyzacji</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Oszczędność czasu</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatyczne publikowanie nowych przepisów bez ręcznej pracy
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Regularność</h4>
                      <p className="text-sm text-muted-foreground">
                        Systematyczne publikacje zwiększają zaangażowanie obserwujących
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Większy zasięg</h4>
                      <p className="text-sm text-muted-foreground">
                        Publikuj na wielu platformach jednocześnie
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Łatwa konfiguracja</h4>
                      <p className="text-sm text-muted-foreground">
                        Bez znajomości programowania, intuicyjne narzędzia
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AutomatyzacjaSocialMedia;
