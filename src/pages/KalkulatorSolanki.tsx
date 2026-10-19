import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Droplets } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ReactionButton from "@/components/ReactionButton";
import SeeAlso from "@/components/SeeAlso";

const KalkulatorSolanki = () => {
  // Solanka
  const [waterAmount, setWaterAmount] = useState(10);
  const [saltConcentration, setSaltConcentration] = useState(20);
  const [brineResult, setBrineResult] = useState("");
  // Chlorek wapnia
  const [milkLiters, setMilkLiters] = useState(50);
  const [caclResult, setCaclResult] = useState("");

  const calculateBrine = () => {
    if (!waterAmount || !saltConcentration) {
      setBrineResult("Uzupełnij dane.");
      return;
    }
    const salt = waterAmount * (saltConcentration / 100);
    setBrineResult(
      `Sól: ${salt.toFixed(2)} kg (≈ ${(salt * 1000).toFixed(0)} g) na ${waterAmount} kg wody`
    );
  };

  const calculateCaCl = () => {
    if (!milkLiters) {
      setCaclResult("Uzupełnij litry.");
      return;
    }
    // Dawki jak na /chlorek-wapnia-do-mleka: 0,1–0,2 g bezwodnego, 0,15–0,25 g
    // dwuwodnego albo 0,3–0,6 ml roztworu 33% na litr mleka.
    const fmt = (x: number) => String(x < 10 ? Math.round(x * 10) / 10 : Math.round(x)).replace(".", ",");
    const zakres = (od: number, doo: number) => `${fmt(milkLiters * od)}–${fmt(milkLiters * doo)}`;
    setCaclResult(
      `Na ${fmt(milkLiters)} L mleka: ${zakres(0.1, 0.2)} g CaCl₂ bezwodnego, ${zakres(0.15, 0.25)} g proszku dwuwodnego albo ${zakres(0.3, 0.6)} ml roztworu 33%.`
    );
  };

  const faqData = [
    {
      question: "Ile soli na solankę do sera?",
      answer:
        "Praktyczna solanka serowarska ma stężenie 18–22% soli. Orientacyjnie na 10 litrów (kg) wody przypada 1,8–2,2 kg soli niejodowanej. Kalkulator przelicza dowolne ilości wody i stężenie.",
    },
    {
      question: "Jak zrobić 20% solankę?",
      answer:
        "Na 10 kg wody rozpuść 2 kg soli kamiennej (niejodowanej). Solankę schłodź do temperatury zbliżonej do sera (ok. 10–15 °C). Jeśli ma być wielokrotnego użytku, dodaj odrobinę chlorku wapnia i skoryguj pH, żeby chronić skórkę serów.",
    },
    {
      question: "Ile chlorku wapnia dodać do solanki?",
      answer:
        "1–2 g CaCl₂ na litr solanki. Świeża solanka jest uboga w wapń i wyciąga go ze skórki sera, która wtedy mięknie i robi się śliska. Chlorek wyrównuje to stężenie. Do mleka daje się go dziesięć razy mniej: 0,1–0,2 g na litr.",
    },
    {
      question: "Jaka temperatura i stężenie solanki są najlepsze?",
      answer:
        "Typowo 18–22% NaCl i temperatura zbliżona do sera (10–15 °C). Zbyt ciepła solanka rozmiękcza skórkę, zbyt zimna spowalnia solenie. Solankę wielokrotnego użytku filtruj, uzupełniaj sól i kontroluj pH — dodatek chlorku wapnia pomaga chronić skórkę.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Kalkulator solanki do sera",
        url: "https://mojaserowarnia.pl/kalkulator-solanki",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "PLN" },
        description:
          "Darmowy kalkulator serowarski: ilość soli do solanki (18–22%) i przelicznik chlorku wapnia do mleka.",
      },
      {
        "@type": "FAQPage",
        mainEntity: faqData.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  const seeAlsoLinks = [
    { title: "Chlorek wapnia do mleka", href: "/chlorek-wapnia-do-mleka", description: "Dawki w trzech postaciach, moment dodania, kiedy pominąć." },
    { title: "Poradnik dla serowarów", href: "/poradnik", description: "Proces, temperatury, higiena, dojrzewanie." },
    { title: "Organizacja małej serowarni", href: "/organizacja-serowarni", description: "Układ, sprzęt i obieg pracy (w tym solarnia)." },
    { title: "Przepisy na sery", href: "/przepisy", description: "Solenie krok po kroku przy konkretnych serach." },
    { title: "Baza kultur bakteryjnych", href: "/baza-kultur", description: "Dobór kultur z cenami i dawkowaniem." },
    { title: "Kalkulator kosztu sera", href: "/kalkulator-kosztu-sera", description: "Policz koszt produkcji sera." },
    { title: "Narzędzia serowarskie", href: "/narzedzia", description: "Wszystkie kalkulatory w jednym miejscu." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Navigation />
      <PageBreadcrumbs
        items={[
          { label: "Narzędzia", href: "/narzedzia" },
          { label: "Kalkulator solanki" },
        ]}
      />

      <main className="pt-20">
        <div className="container mx-auto px-4 pt-2 md:pt-4">
          <div className="max-w-5xl mx-auto">
            <PageHeader
              icon={Droplets}
              color="cyan"
              title="Kalkulator solanki do sera"
              subtitle="Policz, ile soli potrzeba na solankę o danym stężeniu. Obok przelicznik chlorku wapnia do mleka na wybraną liczbę litrów."
            />

            <div className="mt-4 mb-8">
              <ReactionButton contentType="tool" contentId="kalkulator-solanki" variant="default" />
            </div>

            {/* Kalkulatory */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Solanka */}
              <Card>
                <CardHeader>
                  <CardTitle>Solanka 18–22%</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="water">Masa wody (kg lub L)</Label>
                    <Input
                      id="water"
                      type="number"
                      min="0"
                      step="0.1"
                      value={waterAmount}
                      onChange={(e) => setWaterAmount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conc">Stężenie soli (%)</Label>
                    <Input
                      id="conc"
                      type="number"
                      min="0"
                      max="30"
                      step="0.5"
                      value={saltConcentration}
                      onChange={(e) => setSaltConcentration(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Button onClick={calculateBrine} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                    Oblicz
                  </Button>
                  {brineResult && (
                    <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-muted/30">
                      <p className="font-semibold text-foreground">{brineResult}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Sól niejodowana. Solankę schłodź do temperatury sera (ok. 10–15 °C).
                  </p>
                </CardContent>
              </Card>

              {/* Chlorek wapnia */}
              <Card>
                <CardHeader>
                  <CardTitle>Przelicznik chlorku wapnia do mleka</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="milk">Mleko (L)</Label>
                    <Input
                      id="milk"
                      type="number"
                      min="0"
                      step="1"
                      value={milkLiters}
                      onChange={(e) => setMilkLiters(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Zalecenie: 0,1–0,2 g czystego CaCl₂ na 1 L mleka pasteryzowanego. Powyżej 0,2 g ser zaczyna gorzknieć.
                  </p>
                  <Button onClick={calculateCaCl} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                    Oblicz
                  </Button>
                  {caclResult && (
                    <div className="p-4 rounded-lg border-2 border-dashed border-primary/30 bg-muted/30">
                      <p className="font-semibold text-foreground">{caclResult}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Rozcieńcz w ok. dziesięciokrotnej ilości przegotowanej wody i wmieszaj co najmniej 20 minut przed
                    podpuszczką. Postacie chlorku, moment dodania i kiedy go pominąć:{" "}
                    <Link to="/chlorek-wapnia-do-mleka" className="text-primary hover:underline">chlorek wapnia do mleka</Link>.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Treść wyjaśniająca */}
            <section className="mt-10 space-y-8">
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-primary mb-3">Solanka do sera — jak liczyć i przygotować</h2>
                <p className="text-muted-foreground mb-4">
                  Solenie w solance to najczęstszy sposób solenia serów podpuszczkowych. Standardowe stężenie to
                  <strong> 18–22% soli</strong> (kamiennej, niejodowanej). W praktyce serowarskiej stężenie liczy się
                  wygodnie względem masy wody: na 10 kg wody dajesz 1,8–2,2 kg soli. Powyżej ok. 26% sól przestaje się
                  rozpuszczać (nasycenie).
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Temperatura solanki: zbliżona do sera, ok. <strong>10–15 °C</strong>.</li>
                  <li>Czas solenia zależy od wielkości i typu sera (od godzin do kilku dni).</li>
                  <li>Solankę wielokrotnego użytku filtruj, uzupełniaj sól i kontroluj pH; dodatek CaCl₂ chroni skórkę.</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-bold text-primary mb-3">Chlorek wapnia w solance i w mleku</h2>
                <p className="text-muted-foreground mb-4">
                  W solance chlorek wapnia chroni skórkę: świeża solanka wyciąga wapń z powierzchni sera, która wtedy
                  mięknie i robi się śliska. Wystarczy <strong>1–2 g CaCl₂ na litr solanki</strong>.
                </p>
                <p className="text-muted-foreground">
                  Do mleka pasteryzowanego dawka jest dziesięć razy mniejsza: <strong>0,1–0,2 g czystego CaCl₂ na
                  litr</strong>. Ile to w proszku dwuwodnym i w roztworze, kiedy dodać i kiedy pominąć, opisujemy
                  w poradniku{" "}
                  <Link to="/chlorek-wapnia-do-mleka" className="text-primary hover:underline">chlorek wapnia do mleka</Link>.
                </p>
              </Card>
            </section>

            {/* FAQ */}
            <section className="mt-10">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">Najczęściej zadawane pytania</h2>
              <div className="space-y-5">
                {faqData.map((f, i) => (
                  <div key={i}>
                    <h3 className="text-lg font-semibold mb-2">{f.question}</h3>
                    <p className="text-muted-foreground">{f.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <SeeAlso links={seeAlsoLinks} title="Zobacz również" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default KalkulatorSolanki;
