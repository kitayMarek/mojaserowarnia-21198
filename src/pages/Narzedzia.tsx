import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import TLDRSection from "@/components/TLDRSection";
import SeeAlso from "@/components/SeeAlso";
import { Calculator, ClipboardList, ExternalLink, Tag, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import narzedziaHeaderImage from "@/assets/narzedzia-header.webp";
import ReactionButton from "@/components/ReactionButton";
const Narzedzia = () => {
  useEffect(() => {
    document.title = "Narzędzia dla Serowara - Kalkulatory i Konwertery | Moja Serowarnia";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Praktyczne narzędzia dla serowarów: kalkulator miar, podpuszczki Beaugel i kosztu sera. Kalkulatory IMCU, konwertery jednostek i obliczenia produkcji.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageBreadcrumbs items={[{ label: "Narzędzia" }]} />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <img
            src={narzedziaHeaderImage}
            alt="Narzędzia dla serowara"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            loading="eager"
            fetchPriority="high"
          />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                Narzędzia dla Serowara
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Praktyczne kalkulatory i konwertery ułatwiające codzienną pracę w serowarni
              </p>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              
              {/* Kalkulator Miar */}
              <Card className="group border-border hover:border-primary transition-all duration-300 hover:shadow-card bg-card">
                <CardContent className="p-8">
                  <div className="flex justify-end mb-2">
                    <ReactionButton
                      contentType="tool"
                      contentId="kalkulator-miar"
                      variant="compact"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-warm group-hover:shadow-lg transition-shadow">
                      <Calculator className="h-10 w-10 text-white" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                        Kalkulator Miar
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Dwukierunkowy przelicznik jednostek miar: długość, masa, objętość, temperatura, prędkość, ciśnienie i powierzchnia. Obsługuje format imperial i metryczny.
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="text-sm text-muted-foreground space-y-2 w-full text-left">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Konwersja stóp i cali (np. 5'7")</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Miary kuchenne (tsp, tbsp, cup)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Regulowana precyzja wyników</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Szybkie pary konwersji</span>
                      </li>
                    </ul>

                    {/* Button */}
                    <Button 
                      asChild
                      className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-warm"
                    >
                      <a 
                        href="/kalkulator-miar"
                        className="flex items-center justify-center gap-2"
                      >
                        Otwórz Kalkulator
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Kalkulator Solanki */}
              <Card className="group border-border hover:border-primary transition-all duration-300 hover:shadow-card bg-card">
                <CardContent className="p-8">
                  <div className="flex justify-end mb-2">
                    <ReactionButton
                      contentType="tool"
                      contentId="kalkulator-solanki"
                      variant="compact"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center shadow-warm group-hover:shadow-lg transition-shadow">
                      <Droplets className="h-10 w-10 text-white" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                        Kalkulator Solanki
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Ile soli na solankę o danym stężeniu (18–22%) oraz ile chlorku wapnia (CaCl₂) dodać do mleka. Dwa najczęstsze rachunki w serowarni.
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="text-sm text-muted-foreground space-y-2 w-full text-left">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Solanka 18–22% — ilość soli na wodę</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Dawka CaCl₂ na litr mleka</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Wskazówki: temperatura, pH, higiena</span>
                      </li>
                    </ul>

                    {/* Button */}
                    <Button
                      asChild
                      className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-white shadow-warm"
                    >
                      <a
                        href="/kalkulator-solanki"
                        className="flex items-center justify-center gap-2"
                      >
                        Otwórz Kalkulator
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Kalkulator Beaugel */}
              <Card className="group border-border hover:border-primary transition-all duration-300 hover:shadow-card bg-card">
                <CardContent className="p-8">
                  <div className="flex justify-end mb-2">
                    <ReactionButton
                      contentType="tool"
                      contentId="kalkulator-beaugel"
                      variant="compact"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-warm group-hover:shadow-lg transition-shadow">
                      <Calculator className="h-10 w-10 text-white" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                        Kalkulator Podpuszczki
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Precyzyjne obliczenia dawki dla podpuszczek Beaugel (5/50/500) oraz uniwersalny kalkulator IMCU dla wszystkich rodzajów podpuszczek.
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="text-sm text-muted-foreground space-y-2 w-full text-left">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Beaugel 5, 50, 500 (Coquard)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Uniwersalny kalkulator IMCU</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Obliczenia rozcieńczeń roboczych</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Przeliczniki na krople i łyżeczki</span>
                      </li>
                    </ul>

                    {/* Button */}
                    <Button 
                      asChild
                      className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-warm"
                    >
                      <a 
                        href="/kalkulator-beaugel"
                        className="flex items-center justify-center gap-2"
                      >
                        Otwórz Kalkulator
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Kalkulator Kosztu Sera */}
              <Card className="group border-border hover:border-primary transition-all duration-300 hover:shadow-card bg-card">
                <CardContent className="p-8">
                  <div className="flex justify-end mb-2">
                    <ReactionButton
                      contentType="tool"
                      contentId="kalkulator-kosztu-sera"
                      variant="compact"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-warm group-hover:shadow-lg transition-shadow">
                      <Calculator className="h-10 w-10 text-white" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                        Kalkulator Kosztu Sera
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Kompleksowy kalkulator obliczający koszty produkcji sera: wydajność z mleka, składniki, koszty stałe, marża i cena sprzedaży.
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="text-sm text-muted-foreground space-y-2 w-full text-left">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Automatyczne wyliczenie wagi z mleka</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Lista składników z cenami i VAT</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Uwzględnienie strat procesu</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Obliczenia marży i ceny sprzedaży</span>
                      </li>
                    </ul>

                    {/* Button */}
                    <Button 
                      asChild
                      className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-warm"
                    >
                      <a 
                        href="/kalkulator-kosztu-sera"
                        className="flex items-center justify-center gap-2"
                      >
                        Otwórz Kalkulator
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Kalkulator Pasz */}
              <Card className="group border-border hover:border-primary transition-all duration-300 hover:shadow-card bg-card">
                <CardContent className="p-8">
                  <div className="flex justify-end mb-2">
                    <ReactionButton
                      contentType="tool"
                      contentId="kalkulator-pasz"
                      variant="compact"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-warm group-hover:shadow-lg transition-shadow">
                      <Calculator className="h-10 w-10 text-white" />
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                        Kalkulator Pasz
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Zbilansuj paszę dla drobiu zgodnie z normami żywieniowymi. Kalkulator dla kur, brojlerów, kaczek, gęsi i indyków z automatycznym przeliczaniem składników.
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="text-sm text-muted-foreground space-y-2 w-full text-left">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Normy dla 6 typów drobiu</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Automatyczne wyliczenia EM, Ca, P</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Baza 11 popularnych składników</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Analiza kosztów mieszanki</span>
                      </li>
                    </ul>

                    {/* Button */}
                    <Button 
                      asChild
                      className="w-full mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-warm"
                    >
                      <a 
                        href="/kalkulator-pasz"
                        className="flex items-center justify-center gap-2"
                      >
                        Otwórz Kalkulator
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Kalkulator Pasz Bydło */}
              <Card className="group border-border hover:border-primary transition-all duration-300 hover:shadow-card bg-card">
                <CardContent className="p-8">
                  <div className="flex justify-end mb-2">
                    <ReactionButton
                      contentType="tool"
                      contentId="kalkulator-pasz-bydlo"
                      variant="compact"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-warm group-hover:shadow-lg transition-shadow">
                      <Calculator className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                        Kalkulator Pasz dla Bydła
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Profesjonalne bilansowanie dawek pokarmowych dla bydła mlecznego i mięsnego wg norm INRAz/INRA 2018.
                      </p>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 w-full text-left">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Krowy mleczne i bydło opasowe</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>27 składników paszowych</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Bilans energii, białka, NDF, Ca, P</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Kalkulacja kosztów dawki</span>
                      </li>
                    </ul>
                    <Button 
                      asChild
                      className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-warm"
                    >
                      <a href="/kalkulator-pasz-bydlo" className="flex items-center justify-center gap-2">
                        Otwórz Kalkulator
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Menadżer Fermy Drobiu */}
              <Card className="group border-border hover:border-primary transition-all duration-300 hover:shadow-card bg-card">
                <CardContent className="p-8">
                  <div className="flex justify-end mb-2">
                    <ReactionButton
                      contentType="tool"
                      contentId="menedzer-fermy-drobiu"
                      variant="compact"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-warm group-hover:shadow-lg transition-shadow">
                      <ClipboardList className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                        Fermly – gospodarstwo i ewidencja RHD
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Aplikacja do zarządzania całym gospodarstwem rolnym — z gotowym <strong>rejestrem sprzedaży RHD</strong> dla
                        serów, mleka, jaj i drobiu: automatyczne pilnowanie limitu 100 000 zł, ewidencja nabywców, wydruk i raporty.
                      </p>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 w-full text-left">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Rejestr sprzedaży RHD</strong> – wpisy, limit 100 000 zł, wydruk</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Sprzedaż i nabywcy – szybkie dodawanie transakcji</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Przyjęcia mleka i partie produkcyjne (mleczarnia)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Kasa/bank, finanse i raporty całego gospodarstwa</span>
                      </li>
                    </ul>
                    <div className="w-full space-y-2 mt-4">
                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-warm"
                      >
                        <a href="https://fermly.pl" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          Otwórz Fermly <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <div className="flex items-center justify-center gap-4 text-xs">
                        <a href="https://fermly.pl/mleko/rhd" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Rejestr RHD
                        </a>
                        <span className="text-muted-foreground/40">·</span>
                        <a href="https://fermly.pl/przewodnik-rhd.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Przewodnik RHD
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Etykieta RHD */}
              <Card className="group border-border hover:border-primary transition-all duration-300 hover:shadow-card bg-card">
                <CardContent className="p-8">
                  <div className="flex justify-end mb-2">
                    <ReactionButton contentType="tool" contentId="etykieta-rhd" variant="compact" />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-warm group-hover:shadow-lg transition-shadow">
                      <Tag className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                        Etykieta RHD
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Wymagania prawne etykiety sera w rolniczym handlu detalicznym + darmowy edytor do druku. Wzór, podstawa prawna i pola do uzupełnienia.
                      </p>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 w-full text-left">
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Obowiązkowe pola wg rozp. (UE) 1169/2011</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Live podgląd + druk / PDF (10×7 cm)</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Auto-pogrubienie alergenów w składzie</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>Dane producenta zapisywane lokalnie</span></li>
                    </ul>
                    <Button
                      asChild
                      className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-warm"
                    >
                      <a href="/etykieta-rhd" className="flex items-center justify-center gap-2">
                        Otwórz Edytor
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border border-dashed bg-card/50">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center">
                    <span className="text-4xl text-muted-foreground/50">?</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-muted-foreground mb-2">
                      Wkrótce
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Kolejne narzędzia są w przygotowaniu
                    </p>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* TL;DR Section */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <TLDRSection>
              <ul className="space-y-1">
                <li>• <strong>Kalkulator Miar</strong> – przelicznik jednostek (imperial ↔ metryczny)</li>
                <li>• <strong>Kalkulator Podpuszczki</strong> – dawkowanie Beaugel i IMCU (rennet dosage calculator)</li>
                <li>• <strong>Kalkulator Kosztu Sera</strong> – koszt produkcji, marża i cena sprzedaży (cheese cost calculator)</li>
                <li>• <strong>Kalkulatory Pasz</strong> – bilansowanie dawek dla drobiu i bydła</li>
                <li>• <strong>Menadżer Fermy Drobiu</strong> – zarządzanie stadami, dziennik, pasze, finanse (PWA)</li>
                <li>• <strong>Etykieta RHD</strong> – wymagania prawne + darmowy edytor etykiety sera do druku (RHD label generator)</li>
              </ul>
            </TLDRSection>
          </div>
        </section>

        {/* See Also Section */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <SeeAlso links={[
              { href: "/przepisy", title: "Przepisy na domowe sery", description: "Krok po kroku jak zrobić ser" },
              { href: "/baza-kultur", title: "Baza kultur bakteryjnych", description: "Porównanie kultur mezofilnych i termofilnych" },
              { href: "/gdzie-kupic-podpuszczke", title: "Gdzie kupić podpuszczkę?", description: "Sklepy z podpuszczką i kulturami" },
              { href: "/poradnik", title: "Poradnik serowarstwa", description: "Teoria i praktyka produkcji sera" }
            ]} />
          </div>
        </section>

        {/* Info Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                Potrzebujesz innego narzędzia?
              </h2>
              <p className="text-muted-foreground">
                Pracujemy nad kolejnymi kalkulatorami i konwerterami. Jeśli masz pomysł na przydatne narzędzie, daj nam znać!
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Narzedzia;
