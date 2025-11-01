import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactionButton from "@/components/ReactionButton";

interface Skladnik {
  nazwa: string;
  procent: string;
  em: string | number;
  bialko: string | number;
  ca: string | number;
  p: string | number;
  cena: string;
}

interface Norma {
  okres: string;
  em: number;
  bialko: number;
  ca: number;
  p: number;
  tluszcz: number;
  wlokno: number;
  na: number;
}

interface PrzykladowySkladnik {
  nazwa: string;
  em: number;
  bialko: number;
  ca: number;
  p: number;
}

const KalkulatorPasz = () => {
  useEffect(() => {
    document.title = "Kalkulator Pasz dla Drobiu | Serowarstwo.pl";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Prosty kalkulator do zbilansowania paszy dla drobiu. Obliczenia norm żywieniowych dla kur, brojlerów, kaczek, gęsi i indyków."
      );
    }
  }, []);

  const [drob, setDrob] = useState("kury-nioski-lekkie");
  const [okres, setOkres] = useState("");
  const [skladniki, setSkladniki] = useState<Skladnik[]>([
    { nazwa: "", procent: "", em: "", bialko: "", ca: "", p: "", cena: "" },
  ]);

  const normy: Record<string, Norma[]> = {
    "kury-nioski-lekkie": [
      {
        okres: "1-6 tygodni",
        em: 11.5,
        bialko: 18.0,
        ca: 1.0,
        p: 0.65,
        tluszcz: 3.0,
        wlokno: 4.0,
        na: 0.15,
      },
      {
        okres: "7-14 tygodni",
        em: 11.3,
        bialko: 15.0,
        ca: 1.0,
        p: 0.55,
        tluszcz: 3.0,
        wlokno: 5.0,
        na: 0.15,
      },
      {
        okres: "15-20 tygodni",
        em: 11.0,
        bialko: 14.0,
        ca: 2.0,
        p: 0.5,
        tluszcz: 2.5,
        wlokno: 6.0,
        na: 0.15,
      },
      {
        okres: "Niesienie (do 45%)",
        em: 11.5,
        bialko: 17.0,
        ca: 3.5,
        p: 0.5,
        tluszcz: 2.5,
        wlokno: 5.0,
        na: 0.16,
      },
      {
        okres: "Niesienie (powyżej 45%)",
        em: 11.5,
        bialko: 16.0,
        ca: 3.8,
        p: 0.48,
        tluszcz: 2.5,
        wlokno: 5.0,
        na: 0.16,
      },
    ],
    "kury-nioski-ciezkie": [
      {
        okres: "1-6 tygodni",
        em: 11.5,
        bialko: 19.0,
        ca: 1.0,
        p: 0.7,
        tluszcz: 3.0,
        wlokno: 4.0,
        na: 0.15,
      },
      {
        okres: "7-14 tygodni",
        em: 11.3,
        bialko: 16.0,
        ca: 1.0,
        p: 0.6,
        tluszcz: 3.0,
        wlokno: 5.0,
        na: 0.15,
      },
      {
        okres: "15-20 tygodni",
        em: 11.0,
        bialko: 14.5,
        ca: 2.0,
        p: 0.55,
        tluszcz: 2.5,
        wlokno: 6.0,
        na: 0.15,
      },
      {
        okres: "Niesienie (do 45%)",
        em: 11.5,
        bialko: 17.5,
        ca: 3.5,
        p: 0.55,
        tluszcz: 2.5,
        wlokno: 5.0,
        na: 0.16,
      },
      {
        okres: "Niesienie (powyżej 45%)",
        em: 11.5,
        bialko: 16.5,
        ca: 3.8,
        p: 0.5,
        tluszcz: 2.5,
        wlokno: 5.0,
        na: 0.16,
      },
    ],
    brojlery: [
      {
        okres: "1-3 tygodnie (starter)",
        em: 12.5,
        bialko: 21.0,
        ca: 1.0,
        p: 0.7,
        tluszcz: 3.0,
        wlokno: 3.5,
        na: 0.16,
      },
      {
        okres: "4-6 tygodni (grower)",
        em: 13.0,
        bialko: 19.0,
        ca: 0.9,
        p: 0.65,
        tluszcz: 4.0,
        wlokno: 4.0,
        na: 0.15,
      },
      {
        okres: "Powyżej 6 tygodni (finisher)",
        em: 13.2,
        bialko: 17.0,
        ca: 0.9,
        p: 0.6,
        tluszcz: 5.0,
        wlokno: 4.5,
        na: 0.15,
      },
    ],
    kaczki: [
      {
        okres: "1-3 tygodnie",
        em: 11.7,
        bialko: 20.0,
        ca: 0.9,
        p: 0.65,
        tluszcz: 3.0,
        wlokno: 4.0,
        na: 0.15,
      },
      {
        okres: "4-7 tygodni",
        em: 11.7,
        bialko: 16.0,
        ca: 0.9,
        p: 0.6,
        tluszcz: 3.0,
        wlokno: 5.0,
        na: 0.15,
      },
      {
        okres: "Powyżej 7 tygodni",
        em: 11.3,
        bialko: 15.0,
        ca: 0.9,
        p: 0.55,
        tluszcz: 3.0,
        wlokno: 6.0,
        na: 0.15,
      },
    ],
    gesi: [
      {
        okres: "1-4 tygodnie",
        em: 11.5,
        bialko: 20.0,
        ca: 1.0,
        p: 0.7,
        tluszcz: 3.0,
        wlokno: 4.0,
        na: 0.15,
      },
      {
        okres: "5-8 tygodni",
        em: 11.3,
        bialko: 16.0,
        ca: 0.9,
        p: 0.6,
        tluszcz: 3.0,
        wlokno: 5.0,
        na: 0.15,
      },
      {
        okres: "Powyżej 8 tygodni",
        em: 10.5,
        bialko: 14.0,
        ca: 0.9,
        p: 0.55,
        tluszcz: 2.5,
        wlokno: 8.0,
        na: 0.15,
      },
    ],
    indyki: [
      {
        okres: "1-4 tygodnie",
        em: 11.9,
        bialko: 28.0,
        ca: 1.2,
        p: 0.8,
        tluszcz: 3.5,
        wlokno: 3.5,
        na: 0.16,
      },
      {
        okres: "5-8 tygodni",
        em: 12.1,
        bialko: 24.0,
        ca: 1.1,
        p: 0.7,
        tluszcz: 4.0,
        wlokno: 4.0,
        na: 0.16,
      },
      {
        okres: "9-12 tygodni",
        em: 12.3,
        bialko: 20.0,
        ca: 1.0,
        p: 0.65,
        tluszcz: 4.5,
        wlokno: 4.5,
        na: 0.15,
      },
      {
        okres: "13-16 tygodni",
        em: 12.5,
        bialko: 17.0,
        ca: 1.0,
        p: 0.6,
        tluszcz: 5.0,
        wlokno: 5.0,
        na: 0.15,
      },
      {
        okres: "Powyżej 16 tygodni",
        em: 12.1,
        bialko: 14.0,
        ca: 1.0,
        p: 0.55,
        tluszcz: 4.5,
        wlokno: 6.0,
        na: 0.15,
      },
    ],
  };

  const typyDrobiu = [
    { value: "kury-nioski-lekkie", label: "🐔 Kury nioski - lekkie" },
    { value: "kury-nioski-ciezkie", label: "🐔 Kury nioski - ciężkie" },
    { value: "brojlery", label: "🍗 Brojlery (kurczęta mięsne)" },
    { value: "kaczki", label: "🦆 Kaczki" },
    { value: "gesi", label: "🦢 Gęsi" },
    { value: "indyki", label: "🦃 Indyki" },
  ];

  const przykladoweSkladniki: PrzykladowySkladnik[] = [
    { nazwa: "Pszenica", em: 13.5, bialko: 12.0, ca: 0.05, p: 0.35 },
    { nazwa: "Kukurydza", em: 14.5, bialko: 8.5, ca: 0.02, p: 0.28 },
    { nazwa: "Jęczmień", em: 12.5, bialko: 11.0, ca: 0.08, p: 0.38 },
    { nazwa: "Śruta sojowa", em: 9.5, bialko: 46.0, ca: 0.3, p: 0.65 },
    { nazwa: "Śruta rzepakowa", em: 8.5, bialko: 34.0, ca: 0.7, p: 1.1 },
    { nazwa: "Otręby pszenne", em: 8.0, bialko: 16.0, ca: 0.12, p: 1.2 },
    { nazwa: "Kreda pastewna", em: 0, bialko: 0, ca: 38.0, p: 0.01 },
    { nazwa: "Fosforan wapnia", em: 0, bialko: 0, ca: 24.0, p: 18.0 },
    { nazwa: "Sól kamienna", em: 0, bialko: 0, ca: 0, p: 0 },
    { nazwa: "Premiks witaminowy", em: 0, bialko: 0, ca: 0, p: 0 },
    { nazwa: "Olej roślinny", em: 37.0, bialko: 0, ca: 0, p: 0 },
  ];

  const aktualnaNorma = okres ? normy[drob].find((n) => n.okres === okres) : null;

  const dodajSkladnik = () => {
    setSkladniki([
      ...skladniki,
      { nazwa: "", procent: "", em: "", bialko: "", ca: "", p: "", cena: "" },
    ]);
  };

  const usunSkladnik = (index: number) => {
    setSkladniki(skladniki.filter((_, i) => i !== index));
  };

  const aktualizujSkladnik = (index: number, pole: keyof Skladnik, wartosc: string) => {
    const noweSkladniki = [...skladniki];
    noweSkladniki[index][pole] = wartosc as never;

    // Automatyczne uzupełnianie wartości dla znanych składników
    if (pole === "nazwa") {
      const przyklad = przykladoweSkladniki.find((p) => p.nazwa === wartosc);
      if (przyklad) {
        noweSkladniki[index].em = przyklad.em;
        noweSkladniki[index].bialko = przyklad.bialko;
        noweSkladniki[index].ca = przyklad.ca;
        noweSkladniki[index].p = przyklad.p;
      }
    }

    setSkladniki(noweSkladniki);
  };

  const obliczCalkowita = (pole: keyof Omit<Skladnik, "nazwa" | "procent" | "cena">) => {
    return skladniki.reduce((suma, s) => {
      const procent = parseFloat(s.procent) || 0;
      const wartosc = parseFloat(String(s[pole])) || 0;
      return suma + (procent * wartosc) / 100;
    }, 0);
  };

  const obliczCeneKg = () => {
    return skladniki.reduce((suma, s) => {
      const procent = parseFloat(s.procent) || 0;
      const cena = parseFloat(s.cena) || 0;
      return suma + (procent * cena) / 100;
    }, 0);
  };

  const czyCenyWypelnione = () => {
    return skladniki.every((s) => {
      const procent = parseFloat(s.procent) || 0;
      if (procent === 0) return true;
      const cena = parseFloat(s.cena);
      return cena && cena > 0;
    });
  };

  const sprawdzNorme = (wartosc: number, norma: number, tolerancja = 0.1) => {
    const min = norma * (1 - tolerancja);
    const max = norma * (1 + tolerancja);
    if (wartosc < min) return "za-nisko";
    if (wartosc > max) return "za-wysoko";
    return "ok";
  };

  const sumaProcentow = skladniki.reduce(
    (suma, s) => suma + (parseFloat(s.procent) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                🌾 Kalkulator Pasz dla Drobiu
              </h1>
              <p className="text-muted-foreground text-lg mb-4">
                Prosty sposób na zbilansowanie paszy dla Twojego stada
              </p>
              <ReactionButton
                contentType="tool"
                contentId="kalkulator-pasz"
                variant="default"
              />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Wybór drobiu i okresu */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        1️⃣ Wybierz rodzaj drobiu:
                      </Label>
                      <Select
                        value={drob}
                        onValueChange={(value) => {
                          setDrob(value);
                          setOkres("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {typyDrobiu.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        2️⃣ Wybierz wiek/okres:
                      </Label>
                      <Select value={okres} onValueChange={setOkres}>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Wybierz okres --" />
                        </SelectTrigger>
                        <SelectContent>
                          {normy[drob].map((n, i) => (
                            <SelectItem key={i} value={n.okres}>
                              {n.okres}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Normy żywieniowe */}
                  {aktualnaNorma && (
                    <Card className="bg-accent/20 border-accent">
                      <CardContent className="p-4">
                        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                          <Info size={20} className="text-accent-foreground" />
                          Normy żywieniowe dla wybranego okresu:
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <Card className="bg-card">
                            <CardContent className="p-3 text-center">
                              <div className="text-muted-foreground text-xs mb-1">
                                Energia (MJ/kg)
                              </div>
                              <div className="font-bold text-foreground text-lg">
                                {aktualnaNorma.em.toFixed(1)}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="bg-card">
                            <CardContent className="p-3 text-center">
                              <div className="text-muted-foreground text-xs mb-1">
                                Białko (%)
                              </div>
                              <div className="font-bold text-foreground text-lg">
                                {aktualnaNorma.bialko.toFixed(1)}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="bg-card">
                            <CardContent className="p-3 text-center">
                              <div className="text-muted-foreground text-xs mb-1">
                                Wapń (%)
                              </div>
                              <div className="font-bold text-foreground text-lg">
                                {aktualnaNorma.ca.toFixed(2)}
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="bg-card">
                            <CardContent className="p-3 text-center">
                              <div className="text-muted-foreground text-xs mb-1">
                                Fosfor (%)
                              </div>
                              <div className="font-bold text-foreground text-lg">
                                {aktualnaNorma.p.toFixed(2)}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              {/* Składniki */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-foreground text-lg">
                    3️⃣ Wprowadź składniki paszy:
                  </h3>

                  <Card className="bg-warning/10 border-warning">
                    <CardContent className="p-3">
                      <p className="text-sm text-foreground">
                        💡 <strong>Wskazówka:</strong> Wybierz składnik z listy -
                        wartości uzupełnią się automatycznie. Wpisz ceny zakupu
                        składników, aby obliczyć koszt mieszanki. Suma % powinna
                        wynosić 100%.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-primary text-primary-foreground">
                          <th className="p-3 text-left text-sm font-semibold">
                            Składnik
                          </th>
                          <th className="p-3 text-center text-sm font-semibold">
                            Udział
                            <br />
                            (%)
                          </th>
                          <th className="p-3 text-center text-sm font-semibold">
                            Cena
                            <br />
                            (zł/kg)
                          </th>
                          <th className="p-3 text-center text-sm font-semibold">
                            EM
                            <br />
                            (MJ/kg)
                          </th>
                          <th className="p-3 text-center text-sm font-semibold">
                            Białko
                            <br />
                            (%)
                          </th>
                          <th className="p-3 text-center text-sm font-semibold">
                            Ca
                            <br />
                            (%)
                          </th>
                          <th className="p-3 text-center text-sm font-semibold">
                            P<br />
                            (%)
                          </th>
                          <th className="p-3 text-center text-sm font-semibold w-20"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {skladniki.map((skladnik, index) => (
                          <tr
                            key={index}
                            className="border-b border-border hover:bg-muted/50"
                          >
                            <td className="p-2">
                              <Select
                                value={skladnik.nazwa}
                                onValueChange={(value) =>
                                  aktualizujSkladnik(index, "nazwa", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="-- Wybierz --" />
                                </SelectTrigger>
                                <SelectContent>
                                  {przykladoweSkladniki.map((p, i) => (
                                    <SelectItem key={i} value={p.nazwa}>
                                      {p.nazwa}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={skladnik.procent}
                                onChange={(e) =>
                                  aktualizujSkladnik(index, "procent", e.target.value)
                                }
                                className="text-center"
                                placeholder="0"
                                step="0.1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={skladnik.cena}
                                onChange={(e) =>
                                  aktualizujSkladnik(index, "cena", e.target.value)
                                }
                                className="text-center"
                                placeholder="0"
                                step="0.01"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={skladnik.em}
                                onChange={(e) =>
                                  aktualizujSkladnik(index, "em", e.target.value)
                                }
                                className="text-center"
                                placeholder="0"
                                step="0.1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={skladnik.bialko}
                                onChange={(e) =>
                                  aktualizujSkladnik(index, "bialko", e.target.value)
                                }
                                className="text-center"
                                placeholder="0"
                                step="0.1"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={skladnik.ca}
                                onChange={(e) =>
                                  aktualizujSkladnik(index, "ca", e.target.value)
                                }
                                className="text-center"
                                placeholder="0"
                                step="0.01"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={skladnik.p}
                                onChange={(e) =>
                                  aktualizujSkladnik(index, "p", e.target.value)
                                }
                                className="text-center"
                                placeholder="0"
                                step="0.01"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <Button
                                onClick={() => usunSkladnik(index)}
                                variant="destructive"
                                size="sm"
                              >
                                ✕
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button onClick={dodajSkladnik} className="w-full md:w-auto">
                    ➕ Dodaj kolejny składnik
                  </Button>
                </CardContent>
              </Card>

              {/* Suma procentów i koszt */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card
                  className={
                    Math.abs(sumaProcentow - 100) < 0.1
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        Suma udziałów składników:
                      </span>
                      <span className="text-2xl font-bold text-foreground">
                        {sumaProcentow.toFixed(1)}%
                      </span>
                    </div>
                    {Math.abs(sumaProcentow - 100) > 0.1 && (
                      <div className="text-sm text-orange-700 dark:text-orange-400 mt-2">
                        ⚠️ Suma powinna wynosić 100%
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card
                  className={
                    czyCenyWypelnione()
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "border-red-500 bg-red-50 dark:bg-red-950/20"
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        Koszt 1 kg mieszanki:
                      </span>
                      <span className="text-2xl font-bold text-foreground">
                        {obliczCeneKg().toFixed(2)} zł
                      </span>
                    </div>
                    {!czyCenyWypelnione() && (
                      <div className="text-sm text-red-700 dark:text-red-400 mt-2">
                        ⚠️ Uzupełnij ceny wszystkich składników
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Wyniki */}
              {aktualnaNorma && (
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-bold text-xl text-foreground">
                      📊 Analiza Twojej mieszanki:
                      {Math.abs(sumaProcentow - 100) > 0.1 && (
                        <span className="text-destructive text-base ml-2">
                          (Uzupełnij składniki do 100%)
                        </span>
                      )}
                      {Math.abs(sumaProcentow - 100) < 0.1 &&
                        !czyCenyWypelnione() && (
                          <span className="text-destructive text-base ml-2">
                            (Uzupełnij ceny składników)
                          </span>
                        )}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Energia */}
                      <Card
                        className={
                          sprawdzNorme(
                            obliczCalkowita("em"),
                            aktualnaNorma.em,
                            0.05
                          ) === "ok"
                            ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                            : "border-red-500 bg-red-50 dark:bg-red-950/20"
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-foreground">
                              Energia metaboliczna
                            </span>
                            {sprawdzNorme(
                              obliczCalkowita("em"),
                              aktualnaNorma.em,
                              0.05
                            ) === "ok" ? (
                              <CheckCircle className="text-green-600" size={24} />
                            ) : (
                              <AlertCircle className="text-red-600" size={24} />
                            )}
                          </div>
                          <div className="text-2xl font-bold text-foreground">
                            {obliczCalkowita("em").toFixed(2)} MJ/kg
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Norma: {aktualnaNorma.em.toFixed(1)} MJ/kg
                          </div>
                        </CardContent>
                      </Card>

                      {/* Białko */}
                      <Card
                        className={
                          sprawdzNorme(
                            obliczCalkowita("bialko"),
                            aktualnaNorma.bialko,
                            0.05
                          ) === "ok"
                            ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                            : "border-red-500 bg-red-50 dark:bg-red-950/20"
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-foreground">
                              Białko ogólne
                            </span>
                            {sprawdzNorme(
                              obliczCalkowita("bialko"),
                              aktualnaNorma.bialko,
                              0.05
                            ) === "ok" ? (
                              <CheckCircle className="text-green-600" size={24} />
                            ) : (
                              <AlertCircle className="text-red-600" size={24} />
                            )}
                          </div>
                          <div className="text-2xl font-bold text-foreground">
                            {obliczCalkowita("bialko").toFixed(2)}%
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Norma: {aktualnaNorma.bialko.toFixed(1)}%
                          </div>
                        </CardContent>
                      </Card>

                      {/* Wapń */}
                      <Card
                        className={
                          sprawdzNorme(
                            obliczCalkowita("ca"),
                            aktualnaNorma.ca,
                            0.1
                          ) === "ok"
                            ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                            : "border-red-500 bg-red-50 dark:bg-red-950/20"
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-foreground">
                              Wapń (Ca)
                            </span>
                            {sprawdzNorme(
                              obliczCalkowita("ca"),
                              aktualnaNorma.ca,
                              0.1
                            ) === "ok" ? (
                              <CheckCircle className="text-green-600" size={24} />
                            ) : (
                              <AlertCircle className="text-red-600" size={24} />
                            )}
                          </div>
                          <div className="text-2xl font-bold text-foreground">
                            {obliczCalkowita("ca").toFixed(2)}%
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Norma: {aktualnaNorma.ca.toFixed(2)}%
                          </div>
                        </CardContent>
                      </Card>

                      {/* Fosfor */}
                      <Card
                        className={
                          sprawdzNorme(
                            obliczCalkowita("p"),
                            aktualnaNorma.p,
                            0.1
                          ) === "ok"
                            ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                            : "border-red-500 bg-red-50 dark:bg-red-950/20"
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-foreground">
                              Fosfor (P)
                            </span>
                            {sprawdzNorme(
                              obliczCalkowita("p"),
                              aktualnaNorma.p,
                              0.1
                            ) === "ok" ? (
                              <CheckCircle className="text-green-600" size={24} />
                            ) : (
                              <AlertCircle className="text-red-600" size={24} />
                            )}
                          </div>
                          <div className="text-2xl font-bold text-foreground">
                            {obliczCalkowita("p").toFixed(2)}%
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Norma: {aktualnaNorma.p.toFixed(2)}%
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardContent className="p-4 space-y-2">
                        <h4 className="font-semibold text-foreground">
                          📝 Podsumowanie:
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {sprawdzNorme(
                            obliczCalkowita("em"),
                            aktualnaNorma.em,
                            0.05
                          ) === "ok" && (
                            <li className="text-green-700 dark:text-green-400">
                              ✓ Energia jest w normie
                            </li>
                          )}
                          {sprawdzNorme(
                            obliczCalkowita("em"),
                            aktualnaNorma.em,
                            0.05
                          ) === "za-nisko" && (
                            <li className="text-red-700 dark:text-red-400">
                              ✗ Za mało energii - dodaj więcej kukurydzy lub
                              tłuszczu
                            </li>
                          )}
                          {sprawdzNorme(
                            obliczCalkowita("em"),
                            aktualnaNorma.em,
                            0.05
                          ) === "za-wysoko" && (
                            <li className="text-red-700 dark:text-red-400">
                              ✗ Za dużo energii - zmniejsz udział kukurydzy
                            </li>
                          )}

                          {sprawdzNorme(
                            obliczCalkowita("bialko"),
                            aktualnaNorma.bialko,
                            0.05
                          ) === "ok" && (
                            <li className="text-green-700 dark:text-green-400">
                              ✓ Białko jest w normie
                            </li>
                          )}
                          {sprawdzNorme(
                            obliczCalkowita("bialko"),
                            aktualnaNorma.bialko,
                            0.05
                          ) === "za-nisko" && (
                            <li className="text-red-700 dark:text-red-400">
                              ✗ Za mało białka - dodaj więcej śruty sojowej
                            </li>
                          )}
                          {sprawdzNorme(
                            obliczCalkowita("bialko"),
                            aktualnaNorma.bialko,
                            0.05
                          ) === "za-wysoko" && (
                            <li className="text-red-700 dark:text-red-400">
                              ✗ Za dużo białka - zmniejsz udział śruty sojowej
                            </li>
                          )}

                          {sprawdzNorme(
                            obliczCalkowita("ca"),
                            aktualnaNorma.ca,
                            0.1
                          ) === "ok" && (
                            <li className="text-green-700 dark:text-green-400">
                              ✓ Wapń jest w normie
                            </li>
                          )}
                          {sprawdzNorme(
                            obliczCalkowita("ca"),
                            aktualnaNorma.ca,
                            0.1
                          ) === "za-nisko" && (
                            <li className="text-red-700 dark:text-red-400">
                              ✗ Za mało wapnia - dodaj kredę pastewną
                            </li>
                          )}
                          {sprawdzNorme(
                            obliczCalkowita("ca"),
                            aktualnaNorma.ca,
                            0.1
                          ) === "za-wysoko" && (
                            <li className="text-red-700 dark:text-red-400">
                              ✗ Za dużo wapnia - zmniejsz udział kredy
                            </li>
                          )}

                          {sprawdzNorme(
                            obliczCalkowita("p"),
                            aktualnaNorma.p,
                            0.1
                          ) === "ok" && (
                            <li className="text-green-700 dark:text-green-400">
                              ✓ Fosfor jest w normie
                            </li>
                          )}
                          {sprawdzNorme(
                            obliczCalkowita("p"),
                            aktualnaNorma.p,
                            0.1
                          ) === "za-nisko" && (
                            <li className="text-red-700 dark:text-red-400">
                              ✗ Za mało fosforu - dodaj fosforan wapnia
                            </li>
                          )}
                          {sprawdzNorme(
                            obliczCalkowita("p"),
                            aktualnaNorma.p,
                            0.1
                          ) === "za-wysoko" && (
                            <li className="text-red-700 dark:text-red-400">
                              ✗ Za dużo fosforu - zmniejsz udział fosforanów
                            </li>
                          )}
                        </ul>

                        {czyCenyWypelnione() &&
                          Math.abs(sumaProcentow - 100) < 0.1 && (
                            <div className="pt-3 border-t border-border">
                              <p className="text-accent-foreground font-semibold">
                                💰 Koszt 1 kg paszy: {obliczCeneKg().toFixed(2)} zł
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Koszt 10 kg: {(obliczCeneKg() * 10).toFixed(2)} zł |
                                Koszt 25 kg: {(obliczCeneKg() * 25).toFixed(2)} zł
                              </p>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              )}

              {!aktualnaNorma && skladniki.some((s) => s.nazwa || s.procent) && (
                <Card className="border-warning bg-warning/10">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl text-foreground mb-2">
                      📊 Analiza Twojej mieszanki:
                      <span className="text-destructive text-base ml-2">
                        (Wybierz rodzaj drobiu i okres)
                      </span>
                    </h3>
                    <p className="text-muted-foreground">
                      Wybierz rodzaj drobiu i wiek/okres w punktach 1 i 2 powyżej,
                      aby zobaczyć analizę składu Twojej mieszanki.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Informacje dodatkowe */}
              <Card>
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-bold text-lg text-foreground">
                    ℹ️ Informacje dodatkowe
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong className="text-foreground">
                        EM (Energia Metaboliczna)
                      </strong>{" "}
                      - energia dostępna dla ptaków po strawieniu paszy
                    </p>
                    <p>
                      <strong className="text-foreground">Białko ogólne</strong> -
                      zawartość białka w paszy, niezbędnego do wzrostu i produkcji
                      jaj
                    </p>
                    <p>
                      <strong className="text-foreground">Wapń (Ca)</strong> -
                      ważny dla tworzenia skorupek jaj i zdrowia kości
                    </p>
                    <p>
                      <strong className="text-foreground">Fosfor (P)</strong> -
                      niezbędny dla metabolizmu i zdrowia szkieletu
                    </p>
                    <div className="pt-3 border-t border-border">
                      <p className="text-accent-foreground font-semibold">
                        💊 PAMIĘTAJ O WITAMINACH!
                      </p>
                      <p className="mt-2">
                        Zawsze dodawaj do paszy premiks witaminowo-mineralny
                        (0,5-1% mieszanki) zawierający:
                        <br />• Witaminy A, D3, E, K oraz grupę B
                        <br />• Mikroelementy (mangan, cynk, miedź, żelazo, selen,
                        jod)
                        <br />
                        Bez premiksu ptaki mogą cierpieć na niedobory mimo
                        prawidłowo zbilansowanej paszy!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default KalkulatorPasz;
