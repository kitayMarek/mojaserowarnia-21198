import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import ReactionButton from "@/components/ReactionButton";
import { AlertCircle, CheckCircle, Info, Plus, Trash2, Calculator, Download, ChevronDown, ChevronUp, Beef, Wand2, Settings2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  SKLADNIKI_PASZY, 
  TYPY_BYDLA, 
  KATEGORIE_SKLADNIKOW,
  obliczNormyKrowaMleczna, 
  obliczNormyBydloMiesne,
  type SkladnikPaszy,
  type NormyZywieniowe 
} from "@/data/cattleFeedData";
import { useFeedOptimizer, type OgraniczeniaSkladnika } from "@/hooks/useFeedOptimizer";

interface DawkaSkladnik {
  skladnik: SkladnikPaszy;
  iloscKg: number;
}

const KalkulatorPaszBydlo = () => {
  // SEO
  useEffect(() => {
    document.title = "Kalkulator Pasz dla Bydła | Serowarstwo.pl";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Profesjonalny kalkulator do bilansowania pasz dla bydła mlecznego i mięsnego. Obliczenia wg norm INRAz/INRA 2018."
      );
    }
  }, []);

  // Stan formularza
  const [typBydla, setTypBydla] = useState("mleczne");
  const [waga, setWaga] = useState(650);
  const [mleko, setMleko] = useState(30);
  const [tluszcz, setTluszcz] = useState(4.0);
  const [przyrost, setPrzyrost] = useState(1.2);
  
  // Stan dawki
  const [dawka, setDawka] = useState<DawkaSkladnik[]>([]);
  const [pokazSkladniki, setPokazSkladniki] = useState(true);
  
  // Stan optymalizatora
  const [pokazOptymalizator, setPokazOptymalizator] = useState(false);
  const [ograniczenia, setOgraniczenia] = useState<OgraniczeniaSkladnika[]>([]);
  const [optymalizujeProcess, setOptymalizujeProcess] = useState(false);

  // Oblicz normy na podstawie parametrów
  const normy: NormyZywieniowe = useMemo(() => {
    if (typBydla === "mleczne") {
      return obliczNormyKrowaMleczna(waga, mleko, tluszcz);
    } else {
      const plec = typBydla === "miesne-buhaj" ? "Buhaj" : "Jałówka";
      return obliczNormyBydloMiesne(waga, przyrost, plec);
    }
  }, [typBydla, waga, mleko, tluszcz, przyrost]);

  // Hook optymalizatora
  const { optymalizuj } = useFeedOptimizer(SKLADNIKI_PASZY, normy, typBydla);

  // Oblicz bilans dawki
  const bilans = useMemo(() => {
    let sm = 0, jpml = 0, jpmo = 0, pb = 0, pbjt = 0, ndf = 0, ca = 0, p = 0, koszt = 0;

    dawka.forEach(({ skladnik, iloscKg }) => {
      const smKg = iloscKg * (skladnik.sm / 100);
      sm += smKg;
      jpml += smKg * skladnik.jpml;
      jpmo += smKg * skladnik.jpmo;
      pb += smKg * skladnik.pb * 10; // % SM -> g
      pbjt += smKg * skladnik.pbjt;
      ndf += smKg * (skladnik.ndf / 100);
      ca += smKg * skladnik.ca;
      p += smKg * skladnik.p;
      koszt += iloscKg * skladnik.cenaKg;
    });

    const ndfPercent = sm > 0 ? (ndf / sm) * 100 : 0;

    return { sm, jpml, jpmo, pb, pbjt, ndf: ndfPercent, ca, p, koszt };
  }, [dawka]);

  // Sprawdź pokrycie norm
  const pokrycie = useMemo(() => {
    const energia = typBydla === "mleczne" ? normy.jpmlMj : normy.jpmoMj;
    const energiaBilans = typBydla === "mleczne" ? bilans.jpml : bilans.jpmo;

    return {
      sm: normy.smKg > 0 ? (bilans.sm / normy.smKg) * 100 : 0,
      energia: energia > 0 ? (energiaBilans / energia) * 100 : 0,
      pb: normy.pbG > 0 ? (bilans.pb / normy.pbG) * 100 : 0,
      pbjt: normy.pbjtG > 0 ? (bilans.pbjt / normy.pbjtG) * 100 : 0,
      ndf: bilans.ndf >= normy.ndfMin && bilans.ndf <= normy.ndfMax,
      ca: normy.caG > 0 ? (bilans.ca / normy.caG) * 100 : 0,
      p: normy.pG > 0 ? (bilans.p / normy.pG) * 100 : 0
    };
  }, [bilans, normy, typBydla]);

  const dodajSkladnik = (skladnik: SkladnikPaszy) => {
    const istnieje = dawka.find(d => d.skladnik.nazwa === skladnik.nazwa);
    if (!istnieje) {
      setDawka([...dawka, { skladnik, iloscKg: 1 }]);
    }
  };

  const usunSkladnik = (nazwa: string) => {
    setDawka(dawka.filter(d => d.skladnik.nazwa !== nazwa));
  };

  const zmienIlosc = (nazwa: string, ilosc: number) => {
    setDawka(dawka.map(d => 
      d.skladnik.nazwa === nazwa ? { ...d, iloscKg: Math.max(0, ilosc) } : d
    ));
  };

  const wyczysc = () => {
    setDawka([]);
    setOgraniczenia([]);
  };

  // Dodaj składnik do optymalizatora
  const dodajDoOptymalizatora = (skladnik: SkladnikPaszy) => {
    const istnieje = ograniczenia.find(o => o.skladnik.nazwa === skladnik.nazwa);
    if (!istnieje) {
      setOgraniczenia([...ograniczenia, {
        skladnik,
        minKg: 0,
        maxKg: skladnik.kategoria === 'Kiszonki' ? 30 : 
               skladnik.kategoria === 'Siano' ? 10 :
               skladnik.kategoria === 'Minerały' ? 0.5 : 5,
        wymagany: false
      }]);
    }
  };

  const usunZOptymalizatora = (nazwa: string) => {
    setOgraniczenia(ograniczenia.filter(o => o.skladnik.nazwa !== nazwa));
  };

  const aktualizujOgraniczenie = (nazwa: string, pole: keyof OgraniczeniaSkladnika, wartosc: number | boolean) => {
    setOgraniczenia(ograniczenia.map(o => 
      o.skladnik.nazwa === nazwa ? { ...o, [pole]: wartosc } : o
    ));
  };

  const uruchomOptymalizacje = useCallback(() => {
    if (ograniczenia.length === 0) {
      toast.error("Dodaj składniki do optymalizatora");
      return;
    }
    
    setOptymalizujeProcess(true);
    
    // Daj czas na rendering
    setTimeout(() => {
      const wynik = optymalizuj(ograniczenia, 800);
      
      if (wynik.dawka.length > 0) {
        setDawka(wynik.dawka);
        toast.success(wynik.komunikat);
      } else {
        toast.error(wynik.komunikat);
      }
      
      setOptymalizujeProcess(false);
      setPokazOptymalizator(false);
    }, 50);
  }, [ograniczenia, optymalizuj]);

  const wczytajDomyslneOgraniczenia = () => {
    const domyslne: OgraniczeniaSkladnika[] = [];
    
    if (typBydla === "mleczne") {
      // Składniki dla krowy mlecznej
      const kzk = SKLADNIKI_PASZY.find(s => s.nazwa.includes("Kiszonka z kukurydzy (30-35%"));
      const sianok = SKLADNIKI_PASZY.find(s => s.nazwa === "Sianokiszonka łąkowa");
      const jeczmien = SKLADNIKI_PASZY.find(s => s.nazwa === "Jęczmień");
      const soja = SKLADNIKI_PASZY.find(s => s.nazwa === "Śruta sojowa 46% PB");
      const rzepak = SKLADNIKI_PASZY.find(s => s.nazwa === "Śruta rzepakowa");
      const kreda = SKLADNIKI_PASZY.find(s => s.nazwa.includes("kreda"));
      
      if (kzk) domyslne.push({ skladnik: kzk, minKg: 15, maxKg: 35, wymagany: true });
      if (sianok) domyslne.push({ skladnik: sianok, minKg: 5, maxKg: 20, wymagany: true });
      if (jeczmien) domyslne.push({ skladnik: jeczmien, minKg: 0, maxKg: 6, wymagany: false });
      if (soja) domyslne.push({ skladnik: soja, minKg: 0, maxKg: 4, wymagany: false });
      if (rzepak) domyslne.push({ skladnik: rzepak, minKg: 0, maxKg: 4, wymagany: false });
      if (kreda) domyslne.push({ skladnik: kreda, minKg: 0, maxKg: 0.3, wymagany: false });
    } else {
      // Składniki dla opasa
      const kzk = SKLADNIKI_PASZY.find(s => s.nazwa.includes("Kiszonka z kukurydzy (25-30%"));
      const sianok = SKLADNIKI_PASZY.find(s => s.nazwa === "Sianokiszonka łąkowa");
      const kukurydza = SKLADNIKI_PASZY.find(s => s.nazwa === "Kukurydza (ziarno)");
      const rzepak = SKLADNIKI_PASZY.find(s => s.nazwa === "Śruta rzepakowa");
      
      if (kzk) domyslne.push({ skladnik: kzk, minKg: 10, maxKg: 30, wymagany: true });
      if (sianok) domyslne.push({ skladnik: sianok, minKg: 3, maxKg: 15, wymagany: true });
      if (kukurydza) domyslne.push({ skladnik: kukurydza, minKg: 0, maxKg: 5, wymagany: false });
      if (rzepak) domyslne.push({ skladnik: rzepak, minKg: 0, maxKg: 3, wymagany: false });
    }
    
    setOgraniczenia(domyslne);
    toast.success("Wczytano domyślne ograniczenia");
  };

  const wczytajPrzykladowaDawke = () => {
    const przykladowa: DawkaSkladnik[] = [];
    
    if (typBydla === "mleczne") {
      // Przykładowa dawka dla krowy mlecznej 30L
      const kzk = SKLADNIKI_PASZY.find(s => s.nazwa.includes("Kiszonka z kukurydzy (30-35%"));
      const sianok = SKLADNIKI_PASZY.find(s => s.nazwa === "Sianokiszonka łąkowa");
      const siano = SKLADNIKI_PASZY.find(s => s.nazwa === "Siano łąkowe I klasy");
      const jeczmien = SKLADNIKI_PASZY.find(s => s.nazwa === "Jęczmień");
      const soja = SKLADNIKI_PASZY.find(s => s.nazwa === "Śruta sojowa 46% PB");
      const rzepak = SKLADNIKI_PASZY.find(s => s.nazwa === "Śruta rzepakowa");
      const kreda = SKLADNIKI_PASZY.find(s => s.nazwa.includes("kreda"));

      if (kzk) przykladowa.push({ skladnik: kzk, iloscKg: 25 });
      if (sianok) przykladowa.push({ skladnik: sianok, iloscKg: 15 });
      if (siano) przykladowa.push({ skladnik: siano, iloscKg: 2 });
      if (jeczmien) przykladowa.push({ skladnik: jeczmien, iloscKg: 4 });
      if (soja) przykladowa.push({ skladnik: soja, iloscKg: 2 });
      if (rzepak) przykladowa.push({ skladnik: rzepak, iloscKg: 2 });
      if (kreda) przykladowa.push({ skladnik: kreda, iloscKg: 0.1 });
    } else {
      // Przykładowa dawka dla opasa
      const kzk = SKLADNIKI_PASZY.find(s => s.nazwa.includes("Kiszonka z kukurydzy (25-30%"));
      const sianok = SKLADNIKI_PASZY.find(s => s.nazwa === "Sianokiszonka łąkowa");
      const kukurydza = SKLADNIKI_PASZY.find(s => s.nazwa === "Kukurydza (ziarno)");
      const rzepak = SKLADNIKI_PASZY.find(s => s.nazwa === "Śruta rzepakowa");

      if (kzk) przykladowa.push({ skladnik: kzk, iloscKg: 20 });
      if (sianok) przykladowa.push({ skladnik: sianok, iloscKg: 10 });
      if (kukurydza) przykladowa.push({ skladnik: kukurydza, iloscKg: 3 });
      if (rzepak) przykladowa.push({ skladnik: rzepak, iloscKg: 1.5 });
    }

    setDawka(przykladowa);
  };

  const eksportujCSV = () => {
    let csv = "Skladnik;Ilosc (kg);Sucha masa (kg);Cena (PLN)\n";
    dawka.forEach(({ skladnik, iloscKg }) => {
      const smKg = iloscKg * (skladnik.sm / 100);
      csv += `${skladnik.nazwa};${iloscKg.toFixed(2)};${smKg.toFixed(2)};${(iloscKg * skladnik.cenaKg).toFixed(2)}\n`;
    });
    csv += `\nSUMA;${dawka.reduce((s, d) => s + d.iloscKg, 0).toFixed(2)};${bilans.sm.toFixed(2)};${bilans.koszt.toFixed(2)}\n`;
    
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dawka_bydlo_${typBydla}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const eksportujPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 20;

    // Tytuł
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Bilans dawki pokarmowej dla bydla', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Data
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${new Date().toLocaleDateString('pl-PL')}`, pageWidth / 2, y, { align: 'center' });
    y += 12;

    // Parametry zwierzęcia
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Parametry zwierzecia', margin, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const typLabel = TYPY_BYDLA.find(t => t.value === typBydla)?.label || typBydla;
    doc.text(`Typ bydla: ${typLabel}`, margin, y); y += 5;
    doc.text(`Masa ciala: ${waga} kg`, margin, y); y += 5;
    
    if (typBydla === "mleczne") {
      doc.text(`Produkcja mleka: ${mleko} L/dzien`, margin, y); y += 5;
      doc.text(`Zawartosc tluszczu: ${tluszcz}%`, margin, y); y += 5;
    } else {
      doc.text(`Przyrost dzienny: ${przyrost} kg/dzien`, margin, y); y += 5;
    }
    y += 5;

    // Tabela składników
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Sklad dawki', margin, y);
    y += 4;

    const skladnikiData = dawka.map(({ skladnik, iloscKg }) => {
      const smKg = iloscKg * (skladnik.sm / 100);
      return [
        skladnik.nazwa,
        iloscKg.toFixed(2),
        smKg.toFixed(2),
        skladnik.cenaKg.toFixed(2),
        (iloscKg * skladnik.cenaKg).toFixed(2)
      ];
    });

    skladnikiData.push([
      'SUMA',
      dawka.reduce((s, d) => s + d.iloscKg, 0).toFixed(2),
      bilans.sm.toFixed(2),
      '-',
      bilans.koszt.toFixed(2)
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Skladnik', 'Ilosc (kg)', 'SM (kg)', 'Cena/kg', 'Wartosc (PLN)']],
      body: skladnikiData,
      theme: 'striped',
      headStyles: { fillColor: [34, 139, 34], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 25, halign: 'right' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Bilans żywieniowy
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bilans zywieniowy', margin, y);
    y += 4;

    const energiaLabel = typBydla === "mleczne" ? "JPM-L" : "JPM-O";
    const energiaNorma = typBydla === "mleczne" ? normy.jpmlMj : normy.jpmoMj;
    const energiaBilans = typBydla === "mleczne" ? bilans.jpml : bilans.jpmo;

    const bilansData = [
      ['Sucha masa', `${bilans.sm.toFixed(2)} kg`, `${normy.smKg.toFixed(2)} kg`, `${pokrycie.sm.toFixed(0)}%`],
      [`Energia (${energiaLabel})`, `${energiaBilans.toFixed(2)} MJ`, `${energiaNorma.toFixed(2)} MJ`, `${pokrycie.energia.toFixed(0)}%`],
      ['Bialko ogolne (PB)', `${bilans.pb.toFixed(0)} g`, `${normy.pbG.toFixed(0)} g`, `${pokrycie.pb.toFixed(0)}%`],
      ['PBJT', `${bilans.pbjt.toFixed(0)} g`, `${normy.pbjtG.toFixed(0)} g`, `${pokrycie.pbjt.toFixed(0)}%`],
      ['NDF', `${bilans.ndf.toFixed(1)}%`, `${normy.ndfMin}-${normy.ndfMax}%`, pokrycie.ndf ? 'OK' : 'Poza norma'],
      ['Wapn (Ca)', `${bilans.ca.toFixed(1)} g`, `${normy.caG.toFixed(0)} g`, `${pokrycie.ca.toFixed(0)}%`],
      ['Fosfor (P)', `${bilans.p.toFixed(1)} g`, `${normy.pG.toFixed(0)} g`, `${pokrycie.p.toFixed(0)}%`]
    ];

    autoTable(doc, {
      startY: y,
      head: [['Skladnik odzywczy', 'Dawka', 'Norma', 'Pokrycie']],
      body: bilansData,
      theme: 'striped',
      headStyles: { fillColor: [34, 139, 34], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 40, halign: 'right' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          const text = data.cell.raw as string;
          const value = parseFloat(text);
          if (!isNaN(value)) {
            if (value >= 95 && value <= 105) {
              data.cell.styles.textColor = [34, 139, 34];
            } else if (value >= 85 && value <= 115) {
              data.cell.styles.textColor = [255, 165, 0];
            } else {
              data.cell.styles.textColor = [220, 53, 69];
            }
          } else if (text === 'OK') {
            data.cell.styles.textColor = [34, 139, 34];
          } else if (text === 'Poza norma') {
            data.cell.styles.textColor = [220, 53, 69];
          }
        }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Koszt
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Calkowity koszt dawki: ${bilans.koszt.toFixed(2)} PLN/dzien`, margin, y);

    // Stopka
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128);
    doc.text('Wygenerowano przez Serowarstwo.pl - Kalkulator Pasz dla Bydla', pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('Obliczenia wg norm INRAz/INRA 2018', pageWidth / 2, pageHeight - 6, { align: 'center' });

    // Zapisz
    const typNazwa = typBydla === "mleczne" ? "mleczne" : "miesne";
    doc.save(`bilans_dawki_bydlo_${typNazwa}_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF został wygenerowany");
  };

  const getStatusColor = (value: number, min = 95, max = 105) => {
    if (value >= min && value <= max) return "text-green-600 dark:text-green-400";
    if (value >= min - 10 && value <= max + 10) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getStatusIcon = (value: number, min = 95, max = 105) => {
    if (value >= min && value <= max) return <CheckCircle className="w-4 h-4 text-green-600" />;
    return <AlertCircle className="w-4 h-4 text-yellow-600" />;
  };

  const skladnikiPoKategoriach = useMemo(() => {
    const grouped: Record<string, SkladnikPaszy[]> = {};
    KATEGORIE_SKLADNIKOW.forEach(kat => {
      grouped[kat] = SKLADNIKI_PASZY.filter(s => s.kategoria === kat);
    });
    return grouped;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageBreadcrumbs items={[
        { label: "Narzędzia", href: "/narzedzia" },
        { label: "Kalkulator Pasz dla Bydła" }
      ]} />

      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Beef className="w-12 h-12" />
            <h1 className="text-3xl md:text-4xl font-bold">Kalkulator Pasz dla Bydła</h1>
          </div>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Profesjonalne narzędzie do bilansowania dawek pokarmowych dla bydła mlecznego i mięsnego. 
            Obliczenia zgodne z normami INRAz/INRA 2018.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Kolumna 1: Parametry zwierzęcia */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Parametry zwierzęcia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Typ bydła</Label>
                  <Select value={typBydla} onValueChange={setTypBydla}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPY_BYDLA.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Masa ciała (kg)</Label>
                  <Input 
                    type="number" 
                    value={waga} 
                    onChange={e => setWaga(Number(e.target.value))}
                    min={300}
                    max={900}
                  />
                </div>

                {typBydla === "mleczne" ? (
                  <>
                    <div>
                      <Label>Produkcja mleka (L/dzień)</Label>
                      <Input 
                        type="number" 
                        value={mleko} 
                        onChange={e => setMleko(Number(e.target.value))}
                        min={0}
                        max={60}
                        step={0.5}
                      />
                    </div>
                    <div>
                      <Label>Zawartość tłuszczu (%)</Label>
                      <Input 
                        type="number" 
                        value={tluszcz} 
                        onChange={e => setTluszcz(Number(e.target.value))}
                        min={2}
                        max={6}
                        step={0.1}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <Label>Przyrost dzienny (kg/dzień)</Label>
                    <Input 
                      type="number" 
                      value={przyrost} 
                      onChange={e => setPrzyrost(Number(e.target.value))}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wyliczone normy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Zapotrzebowanie dzienne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sucha masa:</span>
                    <span className="font-medium">{normy.smKg.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {typBydla === "mleczne" ? "Energia JPM-L:" : "Energia JPM-O:"}
                    </span>
                    <span className="font-medium">
                      {(typBydla === "mleczne" ? normy.jpmlMj : normy.jpmoMj).toFixed(1)} MJ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Białko ogólne:</span>
                    <span className="font-medium">{normy.pbG.toFixed(0)} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PBJT:</span>
                    <span className="font-medium">{normy.pbjtG.toFixed(0)} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NDF:</span>
                    <span className="font-medium">{normy.ndfMin}-{normy.ndfMax}% SM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wapń (Ca):</span>
                    <span className="font-medium">{normy.caG.toFixed(0)} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fosfor (P):</span>
                    <span className="font-medium">{normy.pG.toFixed(0)} g</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kolumna 2: Składniki dawki */}
          <div className="lg:col-span-2 space-y-6">
            {/* Przyciski akcji */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={wczytajPrzykladowaDawke} variant="outline">
                Wczytaj przykład
              </Button>
              <Button onClick={wyczysc} variant="outline">
                Wyczyść
              </Button>
              <Button onClick={() => setPokazSkladniki(!pokazSkladniki)} variant="outline">
                {pokazSkladniki ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                Baza składników
              </Button>
              
              {/* Przycisk optymalizatora */}
              <Dialog open={pokazOptymalizator} onOpenChange={setPokazOptymalizator}>
                <DialogTrigger asChild>
                  <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                    <Wand2 className="w-4 h-4 mr-1" /> Optymalizator
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-emerald-600" />
                      Automatyczny optymalizator dawki
                    </DialogTitle>
                    <DialogDescription>
                      Wybierz składniki i ustaw ograniczenia. Algorytm znajdzie najtańszą dawkę spełniającą normy.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    {/* Przyciski pomocnicze */}
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={wczytajDomyslneOgraniczenia}>
                        <Settings2 className="w-4 h-4 mr-1" /> Wczytaj domyślne
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setOgraniczenia([])}>
                        Wyczyść
                      </Button>
                    </div>
                    
                    {/* Dodawanie składników */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Dodaj składniki do optymalizacji:</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 max-h-48 overflow-y-auto border rounded p-2">
                        {SKLADNIKI_PASZY.filter(s => !ograniczenia.find(o => o.skladnik.nazwa === s.nazwa)).map(skladnik => (
                          <Button 
                            key={skladnik.nazwa} 
                            size="sm" 
                            variant="ghost" 
                            className="justify-start text-xs h-auto py-1 px-2"
                            onClick={() => dodajDoOptymalizatora(skladnik)}
                          >
                            <Plus className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{skladnik.nazwa}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Lista ograniczeń */}
                    {ograniczenia.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Ograniczenia składników:</Label>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {ograniczenia.map(ogr => (
                            <div key={ogr.skladnik.nazwa} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                              <div className="flex items-center gap-1">
                                <Checkbox 
                                  checked={ogr.wymagany}
                                  onCheckedChange={(checked) => aktualizujOgraniczenie(ogr.skladnik.nazwa, 'wymagany', !!checked)}
                                />
                                <span className="text-xs text-muted-foreground">Wym.</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-xs">{ogr.skladnik.nazwa}</p>
                                <p className="text-xs text-muted-foreground">{ogr.skladnik.cenaKg.toFixed(2)} zł/kg</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={ogr.minKg}
                                  onChange={e => aktualizujOgraniczenie(ogr.skladnik.nazwa, 'minKg', Number(e.target.value))}
                                  className="w-16 h-7 text-xs"
                                  min={0}
                                  step={0.5}
                                />
                                <span className="text-xs">-</span>
                                <Input
                                  type="number"
                                  value={ogr.maxKg}
                                  onChange={e => aktualizujOgraniczenie(ogr.skladnik.nazwa, 'maxKg', Number(e.target.value))}
                                  className="w-16 h-7 text-xs"
                                  min={0}
                                  step={0.5}
                                />
                                <span className="text-xs">kg</span>
                              </div>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => usunZOptymalizatora(ogr.skladnik.nazwa)}>
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {ograniczenia.length === 0 && (
                      <Alert>
                        <Info className="w-4 h-4" />
                        <AlertDescription>
                          Dodaj składniki powyżej lub wczytaj domyślne ograniczenia.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPokazOptymalizator(false)}>
                      Anuluj
                    </Button>
                    <Button 
                      onClick={uruchomOptymalizacje} 
                      disabled={ograniczenia.length === 0 || optymalizujeProcess}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {optymalizujeProcess ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Optymalizuję...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-1" /> Optymalizuj dawkę
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {dawka.length > 0 && (
                <>
                  <Button onClick={eksportujCSV} variant="secondary">
                    <Download className="w-4 h-4 mr-1" /> CSV
                  </Button>
                  <Button onClick={eksportujPDF} variant="secondary">
                    <FileText className="w-4 h-4 mr-1" /> PDF
                  </Button>
                </>
              )}
            </div>

            {/* Baza składników */}
            {pokazSkladniki && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dodaj składniki do dawki</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {KATEGORIE_SKLADNIKOW.map(kategoria => (
                      <AccordionItem key={kategoria} value={kategoria}>
                        <AccordionTrigger className="text-sm font-medium">
                          {kategoria} ({skladnikiPoKategoriach[kategoria]?.length || 0})
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid gap-2">
                            {skladnikiPoKategoriach[kategoria]?.map(skladnik => {
                              const wDawce = dawka.some(d => d.skladnik.nazwa === skladnik.nazwa);
                              return (
                                <div 
                                  key={skladnik.nazwa} 
                                  className={`flex items-center justify-between p-2 rounded border ${wDawce ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{skladnik.nazwa}</p>
                                    <p className="text-xs text-muted-foreground">
                                      SM: {skladnik.sm}% | PB: {skladnik.pb}% | {skladnik.cenaKg.toFixed(2)} zł/kg
                                    </p>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant={wDawce ? "secondary" : "default"}
                                    onClick={() => wDawce ? usunSkladnik(skladnik.nazwa) : dodajSkladnik(skladnik)}
                                  >
                                    {wDawce ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Aktualna dawka */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Składniki dawki</span>
                  {dawka.length > 0 && (
                    <Badge variant="secondary">{dawka.length} składników</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dawka.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Dodaj składniki z bazy powyżej lub wczytaj przykładową dawkę
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dawka.map(({ skladnik, iloscKg }) => (
                      <div key={skladnik.nazwa} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{skladnik.nazwa}</p>
                          <p className="text-xs text-muted-foreground">
                            SM: {(iloscKg * skladnik.sm / 100).toFixed(2)} kg | 
                            Koszt: {(iloscKg * skladnik.cenaKg).toFixed(2)} zł
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={iloscKg}
                            onChange={e => zmienIlosc(skladnik.nazwa, Number(e.target.value))}
                            className="w-20 text-center"
                            min={0}
                            step={0.5}
                          />
                          <span className="text-sm text-muted-foreground">kg</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => usunSkladnik(skladnik.nazwa)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bilans */}
            {dawka.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Bilans dawki</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="pokrycie">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="pokrycie">Pokrycie norm</TabsTrigger>
                      <TabsTrigger value="szczegoly">Szczegóły</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pokrycie" className="space-y-4 pt-4">
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          {getStatusIcon(pokrycie.sm)}
                          <span className="flex-1 ml-2">Sucha masa</span>
                          <span className={`font-bold ${getStatusColor(pokrycie.sm)}`}>
                            {pokrycie.sm.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          {getStatusIcon(pokrycie.energia)}
                          <span className="flex-1 ml-2">Energia ({typBydla === "mleczne" ? "JPM-L" : "JPM-O"})</span>
                          <span className={`font-bold ${getStatusColor(pokrycie.energia)}`}>
                            {pokrycie.energia.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          {getStatusIcon(pokrycie.pb)}
                          <span className="flex-1 ml-2">Białko ogólne</span>
                          <span className={`font-bold ${getStatusColor(pokrycie.pb)}`}>
                            {pokrycie.pb.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          {getStatusIcon(pokrycie.pbjt)}
                          <span className="flex-1 ml-2">PBJT</span>
                          <span className={`font-bold ${getStatusColor(pokrycie.pbjt)}`}>
                            {pokrycie.pbjt.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          {pokrycie.ndf ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-yellow-600" />}
                          <span className="flex-1 ml-2">NDF w SM</span>
                          <span className={`font-bold ${pokrycie.ndf ? 'text-green-600' : 'text-yellow-600'}`}>
                            {bilans.ndf.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          {getStatusIcon(pokrycie.ca)}
                          <span className="flex-1 ml-2">Wapń (Ca)</span>
                          <span className={`font-bold ${getStatusColor(pokrycie.ca)}`}>
                            {pokrycie.ca.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          {getStatusIcon(pokrycie.p)}
                          <span className="flex-1 ml-2">Fosfor (P)</span>
                          <span className={`font-bold ${getStatusColor(pokrycie.p)}`}>
                            {pokrycie.p.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <Alert className="mt-4">
                        <Info className="w-4 h-4" />
                        <AlertTitle>Koszt dawki</AlertTitle>
                        <AlertDescription>
                          <span className="text-2xl font-bold">{bilans.koszt.toFixed(2)} zł</span> / dzień
                        </AlertDescription>
                      </Alert>
                    </TabsContent>

                    <TabsContent value="szczegoly" className="pt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Parametr</th>
                              <th className="text-right py-2">Dawka</th>
                              <th className="text-right py-2">Norma</th>
                              <th className="text-right py-2">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2">Sucha masa</td>
                              <td className="text-right">{bilans.sm.toFixed(2)} kg</td>
                              <td className="text-right">{normy.smKg.toFixed(2)} kg</td>
                              <td className={`text-right font-bold ${getStatusColor(pokrycie.sm)}`}>{pokrycie.sm.toFixed(0)}%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">Energia {typBydla === "mleczne" ? "JPM-L" : "JPM-O"}</td>
                              <td className="text-right">{(typBydla === "mleczne" ? bilans.jpml : bilans.jpmo).toFixed(1)} MJ</td>
                              <td className="text-right">{(typBydla === "mleczne" ? normy.jpmlMj : normy.jpmoMj).toFixed(1)} MJ</td>
                              <td className={`text-right font-bold ${getStatusColor(pokrycie.energia)}`}>{pokrycie.energia.toFixed(0)}%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">Białko ogólne</td>
                              <td className="text-right">{bilans.pb.toFixed(0)} g</td>
                              <td className="text-right">{normy.pbG.toFixed(0)} g</td>
                              <td className={`text-right font-bold ${getStatusColor(pokrycie.pb)}`}>{pokrycie.pb.toFixed(0)}%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">PBJT</td>
                              <td className="text-right">{bilans.pbjt.toFixed(0)} g</td>
                              <td className="text-right">{normy.pbjtG.toFixed(0)} g</td>
                              <td className={`text-right font-bold ${getStatusColor(pokrycie.pbjt)}`}>{pokrycie.pbjt.toFixed(0)}%</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">NDF w SM</td>
                              <td className="text-right">{bilans.ndf.toFixed(1)}%</td>
                              <td className="text-right">{normy.ndfMin}-{normy.ndfMax}%</td>
                              <td className={`text-right font-bold ${pokrycie.ndf ? 'text-green-600' : 'text-yellow-600'}`}>
                                {pokrycie.ndf ? "OK" : "!"}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">Wapń (Ca)</td>
                              <td className="text-right">{bilans.ca.toFixed(0)} g</td>
                              <td className="text-right">{normy.caG.toFixed(0)} g</td>
                              <td className={`text-right font-bold ${getStatusColor(pokrycie.ca)}`}>{pokrycie.ca.toFixed(0)}%</td>
                            </tr>
                            <tr>
                              <td className="py-2">Fosfor (P)</td>
                              <td className="text-right">{bilans.p.toFixed(0)} g</td>
                              <td className="text-right">{normy.pG.toFixed(0)} g</td>
                              <td className={`text-right font-bold ${getStatusColor(pokrycie.p)}`}>{pokrycie.p.toFixed(0)}%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Wskazówki */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Wskazówki
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Normy obliczane są wg systemu INRAz/INRA 2018</p>
                <p>• Optymalne pokrycie norm: 95-105%</p>
                <p>• NDF (włókno) powinien mieścić się w zakresie dla zdrowia żwacza</p>
                <p>• Pamiętaj o dodatkach mineralnych i witaminowych</p>
                <p>• Stosunek Ca:P powinien wynosić około 1.5-2:1</p>
              </CardContent>
            </Card>

            <div className="flex justify-center py-4">
              <ReactionButton contentId="kalkulator-pasz-bydlo" contentType="tool" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default KalkulatorPaszBydlo;
