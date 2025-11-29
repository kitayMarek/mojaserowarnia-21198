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
import { Rss, Facebook, Zap, Send, Copy, CheckCircle2, AlertCircle, Check, Info, BookOpen } from "lucide-react";
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
            <Tabs defaultValue="dlvr" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dlvr">
                  <Rss className="h-4 w-4 mr-2" />
                  dlvr.it (Darmowe)
                </TabsTrigger>
                <TabsTrigger value="ifttt">
                  <Send className="h-4 w-4 mr-2" />
                  IFTTT
                </TabsTrigger>
                <TabsTrigger value="webhook">
                  <Zap className="h-4 w-4 mr-2" />
                  Webhook Panel
                </TabsTrigger>
              </TabsList>

              {/* dlvr.it Instructions */}
              <TabsContent value="dlvr" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rss className="h-5 w-5 text-primary" />
                      dlvr.it - Darmowa automatyzacja RSS → Facebook
                    </CardTitle>
                    <CardDescription>
                      Profesjonalne narzędzie specjalizujące się w automatycznym publikowaniu z RSS na social media
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Why dlvr.it */}
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                        <Check className="h-5 w-5" />
                        Dlaczego dlvr.it?
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong>100% darmowe</strong> dla 3 profili społecznościowych i 5 RSS feedów</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Specjalizacja w RSS → Social Media (prostsze niż Zapier)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Automatyczne skracanie linków i dodawanie obrazków</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>Wsparcie dla Facebook Pages (nie wymaga płatnego planu)</span>
                        </li>
                      </ul>
                    </div>

                    {/* Step by step */}
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Instrukcja krok po kroku
                      </h4>
                      
                      {/* Step 1 */}
                      <div className="flex gap-4 mb-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          1
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">Zarejestruj się na dlvr.it</h3>
                          <p className="text-sm text-muted-foreground">
                            Przejdź na stronę{" "}
                            <a
                              href="https://dlvrit.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              dlvr.it
                            </a>{" "}
                            i załóż darmowe konto. Plan Free pozwala na 3 połączenia społecznościowe i 5 RSS feedów.
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-4 mb-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          2
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">Dodaj swój RSS Feed</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            W panelu dlvr.it kliknij <strong>"Add Source"</strong> lub <strong>"Add RSS Feed"</strong> i wklej URL:
                          </p>
                          <div className="p-3 bg-muted rounded-lg font-mono text-xs break-all">
                            {rssUrl}
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex gap-4 mb-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          3
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">Połącz stronę Facebook</h3>
                          <p className="text-sm text-muted-foreground">
                            Kliknij <strong>"Add Route"</strong> → wybierz <strong>"Facebook"</strong> → zaloguj się do swojego konta Facebook i wybierz stronę, na której chcesz publikować.
                          </p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex gap-4 mb-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          4
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">Skonfiguruj szablon posta</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            dlvr.it automatycznie pobierze tytuł, opis i obrazek z RSS. Możesz dostosować szablon posta:
                          </p>
                          <div className="p-3 bg-muted rounded-lg text-sm">
                            <p className="font-semibold mb-2 text-foreground">Przykładowy szablon:</p>
                            <code className="text-xs text-muted-foreground whitespace-pre-wrap">
{`🧀 Nowy przepis: [title]

[description]

👉 Sprawdź pełny przepis: [link]

#ser #serowarstwo #przepis #mojaserowarnia`}
                            </code>
                          </div>
                        </div>
                      </div>

                      {/* Step 5 */}
                      <div className="flex gap-4 mb-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          5
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">Ustaw harmonogram publikacji</h3>
                          <p className="text-sm text-muted-foreground">
                            Wybierz, jak często dlvr.it ma sprawdzać RSS feed (np. co 30 minut, co godzinę). Możesz też ustawić interwały między postami, aby nie spamować.
                          </p>
                        </div>
                      </div>

                      {/* Step 6 */}
                      <div className="flex gap-4 mb-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          6
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">Zapisz i aktywuj!</h3>
                          <p className="text-sm text-muted-foreground">
                            Kliknij <strong>"Save"</strong>. Od teraz każdy nowy wpis w RSS będzie automatycznie publikowany na Facebooku! 🎉
                          </p>
                        </div>
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-semibold mb-2">Wskazówki:</p>
                        <ul className="space-y-1 text-sm">
                          <li>• dlvr.it automatycznie skraca długie linki</li>
                          <li>• Możesz dodać własne hashtagi w szablonie</li>
                          <li>• Obrazki z RSS są automatycznie dołączane do postów</li>
                          <li>• Funkcja "Power Scheduler" (płatna) pozwala na wybór najlepszych godzin publikacji</li>
                        </ul>
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
                      IFTTT - Alternatywne rozwiązanie
                    </CardTitle>
                    <CardDescription>
                      Darmowy plan IFTTT pozwala na 2 aktywne aplety - wystarczające dla prostej automatyzacji
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

                    <Alert variant="default" className="border-amber-500/20 bg-amber-500/5">
                      <Info className="h-4 w-4 text-amber-600" />
                      <AlertDescription>
                        <p className="font-semibold mb-2 text-foreground">Ograniczenia darmowego planu IFTTT:</p>
                        <ul className="space-y-1 text-sm">
                          <li>• Tylko 2 aktywne aplety jednocześnie</li>
                          <li>• Sprawdzanie RSS co 1 godzinę (wolniejsze niż dlvr.it)</li>
                          <li>• Brak zaawansowanych opcji formatowania</li>
                        </ul>
                        <p className="mt-2 text-foreground">
                          💡 <strong>Rekomendacja:</strong> Użyj dlvr.it jako głównego narzędzia, a IFTTT jako backup lub dla innych platform.
                        </p>
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

            {/* Comparison Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  Porównanie narzędzi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* dlvr.it */}
                  <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                    <h3 className="font-semibold text-lg mb-3 text-primary flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      dlvr.it (Rekomendowane)
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">✓</span>
                        <span><strong>Darmowe:</strong> 3 profile, 5 RSS feedów</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">✓</span>
                        <span><strong>Szybkie:</strong> Sprawdzanie co 30 min</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">✓</span>
                        <span><strong>Proste:</strong> Specjalizacja w RSS → Social</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">✓</span>
                        <span>Automatyczne obrazki i skracanie linków</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* IFTTT */}
                  <div className="bg-secondary/5 rounded-lg p-6 border border-secondary/20">
                    <h3 className="font-semibold text-lg mb-3 text-secondary flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      IFTTT (Alternatywa)
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-secondary font-bold">✓</span>
                        <span><strong>Darmowe:</strong> 2 aplety</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">○</span>
                        <span><strong>Wolniejsze:</strong> Sprawdzanie co 1h</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">○</span>
                        <span>Mniej opcji formatowania</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-secondary font-bold">✓</span>
                        <span>Dobre jako backup lub dla innych platform</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  Korzyści z automatyzacji
                </CardTitle>
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
