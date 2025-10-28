import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import ReactionButton from "@/components/ReactionButton";

const GdzieKupicPodpuszczke = () => {
  useEffect(() => {
    document.title = "Gdzie kupić podpuszczkę - podsumowanie i porównanie | Start";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Zestawienie mocy (IMCU, 1:X) i praktycznego dawkowania podpuszczek cielęcych: Beaugel, GAP Natural Rennet, Carlina 1000, Serowar.pl oraz Artiser - kompleksowe porównanie dla serowarów.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <header className="bg-gradient-to-br from-primary/90 to-accent/90 text-primary-foreground border-b border-border">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="mb-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Gdzie kupić podpuszczkę</h1>
              <p className="text-lg text-primary-foreground/90 max-w-3xl">
                Podsumowanie i porównanie mocy (IMCU / 1:X) oraz praktycznego dawkowania dostępnych podpuszczek
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                Analiza porównawcza
              </Badge>
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                Moc vs dawkowanie
              </Badge>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <ReactionButton contentType="guide" contentId="gdzie-kupic-podpuszczke" variant="default" />
        </div>

        {/* Content */}
        <section className="container mx-auto px-4 py-12 max-w-6xl">
          <p className="text-muted-foreground mb-8 text-lg">
            Zestawienie obejmuje: Beaugel 5/50/500 (Coquard), GAP Natural Rennet, Carlina 1000 (Danisco/Chr. Hansen), 
            Podpuszczkę naturalną w płynie (Serowar.pl) oraz Artiser – Podpuszczkę naturalną cielęcą.
          </p>

          {/* Beaugel */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">🧀 1️⃣ Beaugel 5 / 50 / 500 (Coquard)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                <p className="font-semibold mb-2">Wnioski:</p>
                <ul className="space-y-1 text-sm">
                  <li>– Coquard podaje uczciwie zarówno zawartość chymozyny, jak i stosunek 1:X.</li>
                  <li>– Rzeczywiste dawkowanie dobrze koreluje z deklarowaną mocą.</li>
                  <li>– Dokumentacja jasna i zgodna z praktyką – dobry punkt odniesienia.</li>
                </ul>
              </div>

              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <div className="inline-block min-w-full align-middle">
                  <Table className="text-xs md:text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Wariant</TableHead>
                        <TableHead className="whitespace-nowrap">Moc katalogowa</TableHead>
                        <TableHead className="whitespace-nowrap">Zawartość chymozyny</TableHead>
                        <TableHead className="whitespace-nowrap">IMCU/ml (deklar.)</TableHead>
                        <TableHead className="whitespace-nowrap">Dawka zalecana</TableHead>
                        <TableHead className="whitespace-nowrap">Wydajność (1 ml → L mleka)</TableHead>
                        <TableHead className="whitespace-nowrap">Uwagi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium whitespace-nowrap">Beaugel 5</TableCell>
                        <TableCell className="whitespace-nowrap">1 : 3000</TableCell>
                        <TableCell className="whitespace-nowrap">≥ 180 mg/L</TableCell>
                        <TableCell>–</TableCell>
                        <TableCell className="whitespace-nowrap">30 – 35 ml / 100 L</TableCell>
                        <TableCell className="whitespace-nowrap">ok. 3 L</TableCell>
                        <TableCell>Dla miękkich i półtwardych serów</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium whitespace-nowrap">Beaugel 50</TableCell>
                        <TableCell className="whitespace-nowrap">1 : 1000</TableCell>
                        <TableCell className="whitespace-nowrap">≥ 50 mg/L</TableCell>
                        <TableCell className="whitespace-nowrap">ok. 14 IMCU/ml</TableCell>
                        <TableCell className="whitespace-nowrap">15 – 25 ml / 100 L</TableCell>
                        <TableCell className="whitespace-nowrap">4 – 7 L</TableCell>
                        <TableCell>Typowa podpuszczka średniej mocy</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium whitespace-nowrap">Beaugel 500</TableCell>
                        <TableCell className="whitespace-nowrap">1 : 10 000</TableCell>
                        <TableCell className="whitespace-nowrap">≥ 520 mg/L</TableCell>
                        <TableCell className="whitespace-nowrap">≥ 140 IMCU/ml</TableCell>
                        <TableCell className="whitespace-nowrap">8 – 10 ml / 100 L</TableCell>
                        <TableCell className="whitespace-nowrap">10 – 12 L</TableCell>
                        <TableCell>Najmocniejsza z serii</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground mt-2 md:hidden">↔ Przesuń w prawo, aby zobaczyć więcej</p>
              </div>
            </CardContent>
          </Card>

          {/* GAP Natural Rennet */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">🧀 2️⃣ GAP – Natural Rennet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <Table className="text-xs md:text-sm">
                  <TableBody>
                    <TableRow>
                      <TableHead className="w-1/3">Parametr</TableHead>
                      <TableCell>Wartość</TableCell>
                    </TableRow>
                  <TableRow>
                    <TableHead>Deklaracja:</TableHead>
                    <TableCell>≥ 150 IMCU/ml, 1:10 000 MCU</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Skład:</TableHead>
                    <TableCell>80 % chymozyny / 20 % pepsyny</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Dawka:</TableHead>
                    <TableCell>15 – 25 ml / 100 L</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Rzeczywista wydajność:</TableHead>
                    <TableCell>1 ml → 4 – 7 L mleka</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Szacowana moc praktyczna:</TableHead>
                    <TableCell>ok. 100 – 150 IMCU/ml</TableCell>
                  </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-2">Wnioski:</p>
                    <ul className="space-y-1 text-sm">
                      <li>– Dane katalogowe i dawkowanie są niespójne: przy 150 IMCU/ml teoretyczna wydajność to 1 ml → 1.5 L, a nie 4–7 L.</li>
                      <li>– Możliwe, że 150 IMCU/ml to wartość minimalna, a faktyczna moc jest znacznie wyższa (300 – 500 IMCU/ml).</li>
                      <li>– Brakuje arkusza technicznego (QC sheet), więc użytkownik nie ma pewności.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carlina 1000 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">🧀 3️⃣ Carlina 1000 (Danisco / Chr. Hansen)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead className="w-1/3">Parametr</TableHead>
                    <TableCell>Wartość</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Moc:</TableHead>
                    <TableCell>1 : 17 500</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Chymozyna:</TableHead>
                    <TableCell>95 %</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Aktywność z arkusza:</TableHead>
                    <TableCell>ok. 245 – 259 IMCU/ml</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Dawka:</TableHead>
                    <TableCell>16 – 18 ml / 100 L</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Rzeczywista wydajność:</TableHead>
                    <TableCell>1 ml → 5 – 6 L mleka</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-2">Wnioski:</p>
                    <ul className="space-y-1 text-sm">
                      <li>– Deklaracja 1 : 17 500 oznacza raczej maksymalną teoretyczną moc w warunkach laboratoryjnych.</li>
                      <li>– W praktyce (wg dawkowania) aktywność odpowiada ok. 100 – 120 IMCU/ml.</li>
                      <li>– Prawdopodobnie wystąpiło uproszczenie lub mylne oznaczenie jednostki w „1 : 17 500".</li>
                      <li>– Zawartość chymozyny bardzo wysoka → dobra jakość, ale opis w sklepie wprowadza w błąd.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Serowar.pl */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">🧀 4️⃣ Podpuszczka naturalna w płynie (Serowar.pl)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead className="w-1/3">Parametr</TableHead>
                    <TableCell>Wartość</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Moc:</TableHead>
                    <TableCell>1 : 18 000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Chymozyna / Pepsyna:</TableHead>
                    <TableCell>80 % / 20 %</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Dawka:</TableHead>
                    <TableCell>1 – 2 ml / 10 L</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Rzeczywista wydajność:</TableHead>
                    <TableCell>1 ml → 5 – 10 L mleka</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Szacowana moc:</TableHead>
                    <TableCell>500 – 1000 IMCU/ml (realna), teoretycznie ~1800 IMCU/ml</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                <p className="font-semibold mb-2">Wnioski:</p>
                <ul className="space-y-1 text-sm">
                  <li>– Deklarowana moc (1 : 18 000) pokrywa się dość dobrze z praktyką – to rzadkość.</li>
                  <li>– Jasny opis: użytkownik od razu wie, że dawka 1–2 ml/10 L to praktyczne użycie.</li>
                  <li>– Parametry logiczne, spójne, dobrze sformułowane dla użytkownika.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Artiser */}
          <Card className="mb-8 border-green-500/50">
            <CardHeader>
              <CardTitle className="text-2xl">🧀 5️⃣ Artiser – Podpuszczka naturalna cielęca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead className="w-1/3">Parametr</TableHead>
                    <TableCell>Wartość</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Deklarowana aktywność:</TableHead>
                    <TableCell>1 : 20 000 (260 IMCU)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Skład:</TableHead>
                    <TableCell>80 % chymozyny / 20 % pepsyny</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Dawka:</TableHead>
                    <TableCell>1,5 – 2 ml / 10 L</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Rzeczywista wydajność:</TableHead>
                    <TableCell>1 ml → ~5 – 7 L mleka</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Uwagi:</TableHead>
                    <TableCell>Opis przejrzysty: podana zarówno moc, jak i praktyczna dawka w ml/10 L.</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="bg-green-50 dark:bg-green-950/30 border-l-4 border-green-600 p-4 rounded-r-lg">
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-2">Wnioski:</p>
                    <ul className="space-y-1 text-sm">
                      <li>– Bardzo dobra przejrzystość opisu: są i liczby 1:X, i IMCU, i dawkowanie praktyczne.</li>
                      <li>– Różnice między 1:20 000 a praktyką są normalne (warunki procesu), ale wskazówka dawki jest klarowna.</li>
                      <li>– Jedna z najmniej wprowadzających w błąd ofert – dobry wybór dla kupującego.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">⚖️ Porównanie deklaracji a rzeczywistego dawkowania</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producent / Sklep</TableHead>
                      <TableHead>Deklarowana moc (1:X / IMCU/ml)</TableHead>
                      <TableHead>Wynik z dawkowania (1 ml → L)</TableHead>
                      <TableHead>Wniosek</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Coquard (Beaugel)</TableCell>
                      <TableCell>1:1000 – 1:10 000 (14 – 140 IMCU/ml)</TableCell>
                      <TableCell>3 – 12 L</TableCell>
                      <TableCell className="text-green-600 dark:text-green-500">zgodność dobra</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">GAP Natural Rennet</TableCell>
                      <TableCell>≥150 IMCU/ml (1:10 000 MCU)</TableCell>
                      <TableCell>4 – 7 L</TableCell>
                      <TableCell className="text-amber-600 dark:text-amber-500">rozbieżność – niedoszacowana moc lub inne warunki testu</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Carlina 1000</TableCell>
                      <TableCell>1:17 500 (~245 IMCU/ml)</TableCell>
                      <TableCell>5 – 6 L</TableCell>
                      <TableCell className="text-amber-600 dark:text-amber-500">opis mylący – teoretyczna moc znacznie zawyżona</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Serowar.pl (Natural Rennet)</TableCell>
                      <TableCell>1:18 000 (~1000 IMCU/ml)</TableCell>
                      <TableCell>5 – 10 L</TableCell>
                      <TableCell className="text-green-600 dark:text-green-500">logiczna spójność i realna moc</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Artiser</TableCell>
                      <TableCell>1:20 000 (260 IMCU/ml)</TableCell>
                      <TableCell>5 – 7 L</TableCell>
                      <TableCell className="text-green-600 dark:text-green-500 font-medium">przejrzystość opisu; praktyka dobrze wskazana</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Final Conclusions */}
          <Card className="mb-8 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl">📘 Końcowe wnioski</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Moc w specyfikacji</strong> (IMCU lub 1:X) to wartość laboratoryjna; <strong>dawkowanie</strong> to wartość praktyczna uwzględniająca pH, CaCl<sub>2</sub>, temperaturę, świeżość preparatu i styl sera.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span>Typowa różnica między „mocą w IMCU" a „mocą z dawkowania" to ok. <strong>×2 – ×4</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Największe rozbieżności</strong>: Carlina 1000 i GAP – możliwe uproszczenia w oznaczeniu „1:X" lub minimalne IMCU.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Najbardziej przejrzyste i najmniej wprowadzające w błąd</strong>: <strong className="text-green-600 dark:text-green-500">Artiser</strong>, a tuż za nim <strong className="text-green-600 dark:text-green-500">Serowar.pl</strong>. Obie oferty podają jasne dawki i sensowne opisy.</span>
                </li>
              </ul>

              <div className="mt-6 p-4 bg-background rounded-lg border">
                <p className="text-sm text-muted-foreground">
                  <strong>Rekomendacja praktyczna:</strong> przy wprowadzaniu nowej podpuszczki zacznij od dolnej granicy dawki, 
                  mierz czas flokulacji i dostrój dawkę w kolejnych warzeniach.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GdzieKupicPodpuszczke;
