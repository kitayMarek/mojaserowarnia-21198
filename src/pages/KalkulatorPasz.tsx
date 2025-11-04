import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import ReactionButton from "@/components/ReactionButton";
import kalkulatorPaszHeader from "@/assets/kalkulator-pasz-header.jpg";

interface Skladnik {
  nazwa: string;
  procent: string | number;
  em: string | number;
  bialko: string | number;
  ca: string | number;
  p: string | number;
  cena: string;
  na: string | number;
  k: string | number;
  mg: string | number;
  mn: string | number;
  zn: string | number;
  se: string | number;
  fe: string | number;
  i: string | number;
}

interface PrzykladowySkladnik {
  nazwa: string;
  em: number;
  bialko: number;
  ca: number;
  p: number;
  na?: number;
  k?: number;
  mg?: number;
  mn?: number;
  zn?: number;
  se?: number;
  fe?: number;
  i?: number;
}

const KalkulatorPasz = () => {
  useEffect(() => {
    document.title = "Kalkulator Pasz dla Drobiu | Serowarstwo.pl";
    const metaDescription = document.querySelector('meta[name="description"]');
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Prosty kalkulator do zbilansowania paszy dla drobiu. Obliczenia norm żywieniowych dla kur, brojlerów, kaczek, gęsi i indyków."
      );
    }

    if (ogTitle) ogTitle.setAttribute('content', 'Kalkulator Pasz dla Drobiu - Poultry Feed Calculator');
    if (ogDescription) ogDescription.setAttribute('content', 'Prosty kalkulator do zbilansowania paszy dla drobiu. Obliczenia norm żywieniowych dla kur, brojlerów, kaczek, gęsi i indyków.');
    if (ogImage) ogImage.setAttribute('content', `${window.location.origin}${kalkulatorPaszHeader}`);
    if (ogUrl) ogUrl.setAttribute('content', window.location.href);
  }, []);

  const [drob, setDrob] = useState('kury-nioski-lekkie');
  const [okres, setOkres] = useState('');
  const [skladniki, setSkladniki] = useState<Skladnik[]>([
    { nazwa: '', procent: '', em: '', bialko: '', ca: '', p: '', cena: '', na: '', k: '', mg: '', mn: '', zn: '', se: '', fe: '', i: '' }
  ]);

  const normy: Record<string, any[]> = {
    'kury-nioski-lekkie': [
      { okres: 'Zarodowe', em: 11.7, bialko: 17.5, ca: 3.6, p: 0.55, tluszcz: 3.0, wlokno: 4.5, na: 0.16, k: 0.55, mg: 0.045, mn: 100, zn: 80, se: 0.30, fe: 60, i: 1.0 },
      { okres: '1-6 tygodni', em: 11.5, bialko: 18.0, ca: 1.0, p: 0.65, tluszcz: 3.0, wlokno: 4.0, na: 0.15 },
      { okres: '7-14 tygodni', em: 11.3, bialko: 15.0, ca: 1.0, p: 0.55, tluszcz: 3.0, wlokno: 5.0, na: 0.15 },
      { okres: '15-20 tygodni', em: 11.0, bialko: 14.0, ca: 2.0, p: 0.50, tluszcz: 2.5, wlokno: 6.0, na: 0.15 },
      { okres: 'Niesienie (do 45%)', em: 11.5, bialko: 17.0, ca: 3.5, p: 0.50, tluszcz: 2.5, wlokno: 5.0, na: 0.16 },
      { okres: 'Niesienie (powyżej 45%)', em: 11.5, bialko: 16.0, ca: 3.8, p: 0.48, tluszcz: 2.5, wlokno: 5.0, na: 0.16 }
    ],
    'kury-nioski-ciezkie': [
      { okres: 'Zarodowe', em: 11.7, bialko: 17.5, ca: 3.6, p: 0.55, tluszcz: 3.0, wlokno: 4.5, na: 0.16, k: 0.55, mg: 0.045, mn: 100, zn: 80, se: 0.30, fe: 60, i: 1.0 },
      { okres: '1-6 tygodni', em: 11.5, bialko: 19.0, ca: 1.0, p: 0.70, tluszcz: 3.0, wlokno: 4.0, na: 0.15 },
      { okres: '7-14 tygodni', em: 11.3, bialko: 16.0, ca: 1.0, p: 0.60, tluszcz: 3.0, wlokno: 5.0, na: 0.15 },
      { okres: '15-20 tygodni', em: 11.0, bialko: 14.5, ca: 2.0, p: 0.55, tluszcz: 2.5, wlokno: 6.0, na: 0.15 },
      { okres: 'Niesienie (do 45%)', em: 11.5, bialko: 17.5, ca: 3.5, p: 0.55, tluszcz: 2.5, wlokno: 5.0, na: 0.16 },
      { okres: 'Niesienie (powyżej 45%)', em: 11.5, bialko: 16.5, ca: 3.8, p: 0.50, tluszcz: 2.5, wlokno: 5.0, na: 0.16 }
    ],
    'brojlery': [
      { okres: 'Zarodowe', em: 12.0, bialko: 18.5, ca: 3.2, p: 0.50, tluszcz: 3.5, wlokno: 4.0, na: 0.16, k: 0.50, mg: 0.042, mn: 95, zn: 75, se: 0.28, fe: 55, i: 0.9 },
      { okres: '1-3 tygodnie (starter)', em: 12.5, bialko: 21.0, ca: 1.0, p: 0.70, tluszcz: 3.0, wlokno: 3.5, na: 0.16 },
      { okres: '4-6 tygodni (grower)', em: 13.0, bialko: 19.0, ca: 0.9, p: 0.65, tluszcz: 4.0, wlokno: 4.0, na: 0.15 },
      { okres: 'Powyżej 6 tygodni (finisher)', em: 13.2, bialko: 17.0, ca: 0.9, p: 0.60, tluszcz: 5.0, wlokno: 4.5, na: 0.15 }
    ],
    'kaczki': [
      { okres: 'Zarodowe', em: 11.5, bialko: 18.0, ca: 3.4, p: 0.52, tluszcz: 3.2, wlokno: 4.2, na: 0.15, k: 0.52, mg: 0.044, mn: 98, zn: 78, se: 0.29, fe: 58, i: 0.95 },
      { okres: '1-3 tygodnie', em: 11.7, bialko: 20.0, ca: 0.9, p: 0.65, tluszcz: 3.0, wlokno: 4.0, na: 0.15 },
      { okres: '4-7 tygodni', em: 11.7, bialko: 16.0, ca: 0.9, p: 0.60, tluszcz: 3.0, wlokno: 5.0, na: 0.15 },
      { okres: 'Powyżej 7 tygodni', em: 11.3, bialko: 15.0, ca: 0.9, p: 0.55, tluszcz: 3.0, wlokno: 6.0, na: 0.15 }
    ],
    'gesi': [
      { okres: 'Zarodowe', em: 11.3, bialko: 17.0, ca: 3.3, p: 0.54, tluszcz: 3.0, wlokno: 4.5, na: 0.15, k: 0.50, mg: 0.043, mn: 96, zn: 76, se: 0.28, fe: 57, i: 0.92 },
      { okres: '1-4 tygodnie', em: 11.5, bialko: 20.0, ca: 1.0, p: 0.70, tluszcz: 3.0, wlokno: 4.0, na: 0.15 },
      { okres: '5-8 tygodni', em: 11.3, bialko: 16.0, ca: 0.9, p: 0.60, tluszcz: 3.0, wlokno: 5.0, na: 0.15 },
      { okres: 'Powyżej 8 tygodni', em: 10.5, bialko: 14.0, ca: 0.9, p: 0.55, tluszcz: 2.5, wlokno: 8.0, na: 0.15 }
    ],
    'indyki': [
      { okres: 'Zarodowe', em: 11.8, bialko: 19.0, ca: 3.5, p: 0.58, tluszcz: 3.3, wlokno: 4.0, na: 0.16, k: 0.58, mg: 0.048, mn: 105, zn: 85, se: 0.32, fe: 62, i: 1.1 },
      { okres: '1-4 tygodnie', em: 11.9, bialko: 28.0, ca: 1.2, p: 0.80, tluszcz: 3.5, wlokno: 3.5, na: 0.16 },
      { okres: '5-8 tygodnie', em: 12.1, bialko: 24.0, ca: 1.1, p: 0.70, tluszcz: 4.0, wlokno: 4.0, na: 0.16 },
      { okres: '9-12 tygodni', em: 12.3, bialko: 20.0, ca: 1.0, p: 0.65, tluszcz: 4.5, wlokno: 4.5, na: 0.15 },
      { okres: '13-16 tygodni', em: 12.5, bialko: 17.0, ca: 1.0, p: 0.60, tluszcz: 5.0, wlokno: 5.0, na: 0.15 },
      { okres: 'Powyżej 16 tygodni', em: 12.1, bialko: 14.0, ca: 1.0, p: 0.55, tluszcz: 4.5, wlokno: 6.0, na: 0.15 }
    ]
  };

  const typyDrobiu = [
    { value: 'kury-nioski-lekkie', label: '🐔 Kury nioski - lekkie' },
    { value: 'kury-nioski-ciezkie', label: '🐔 Kury nioski - ciężkie' },
    { value: 'brojlery', label: '🍗 Brojlery (kurczęta mięsne)' },
    { value: 'kaczki', label: '🦆 Kaczki' },
    { value: 'gesi', label: '🦢 Gęsi' },
    { value: 'indyki', label: '🦃 Indyki' }
  ];

  const domyslneSkladniki: PrzykladowySkladnik[] = [
    { nazwa: 'Pszenica', em: 13.5, bialko: 12.0, ca: 0.05, p: 0.35, na: 0.02, k: 0.45, mg: 0.13, mn: 40, zn: 30, se: 0.05, fe: 45, i: 0.08 },
    { nazwa: 'Kukurydza', em: 14.5, bialko: 8.5, ca: 0.02, p: 0.28, na: 0.01, k: 0.35, mg: 0.12, mn: 6, zn: 20, se: 0.03, fe: 25, i: 0.05 },
    { nazwa: 'Jęczmień', em: 12.5, bialko: 11.0, ca: 0.08, p: 0.38, na: 0.02, k: 0.50, mg: 0.12, mn: 15, zn: 25, se: 0.04, fe: 35, i: 0.06 },
    { nazwa: 'Owies', em: 11.0, bialko: 11.0, ca: 0.08, p: 0.35, na: 0.02, k: 0.43, mg: 0.14, mn: 45, zn: 32, se: 0.06, fe: 48, i: 0.07 },
    { nazwa: 'Groch', em: 12.5, bialko: 23.0, ca: 0.10, p: 0.40, na: 0.02, k: 1.00, mg: 0.13, mn: 12, zn: 35, se: 0.08, fe: 50, i: 0.09 },
    { nazwa: 'Bobik', em: 12.0, bialko: 27.0, ca: 0.15, p: 0.45, na: 0.03, k: 1.10, mg: 0.15, mn: 14, zn: 38, se: 0.09, fe: 55, i: 0.10 },
    { nazwa: 'Ziemniaki gotowane', em: 13.5, bialko: 9.0, ca: 0.01, p: 0.20, na: 0.01, k: 0.42, mg: 0.02, mn: 3, zn: 3, se: 0.01, fe: 8, i: 0.02 },
    { nazwa: 'Śruta słonecznikowa', em: 10.5, bialko: 32.0, ca: 0.25, p: 0.70, na: 0.03, k: 0.95, mg: 0.35, mn: 30, zn: 50, se: 0.70, fe: 70, i: 0.12 },
    { nazwa: 'Śruta sojowa', em: 9.5, bialko: 46.0, ca: 0.30, p: 0.65, na: 0.02, k: 2.00, mg: 0.28, mn: 25, zn: 45, se: 0.12, fe: 90, i: 0.15 },
    { nazwa: 'Śruta rzepakowa', em: 8.5, bialko: 34.0, ca: 0.70, p: 1.10, na: 0.03, k: 1.20, mg: 0.40, mn: 50, zn: 60, se: 1.10, fe: 150, i: 0.20 },
    { nazwa: 'Otręby pszenne', em: 8.0, bialko: 16.0, ca: 0.12, p: 1.20, na: 0.02, k: 1.15, mg: 0.50, mn: 120, zn: 70, se: 0.30, fe: 140, i: 0.08 },
    { nazwa: 'Kreda pastewna', em: 0, bialko: 0, ca: 38.0, p: 0.01, na: 0.10, k: 0.01, mg: 0.50, mn: 5, zn: 3, se: 0.01, fe: 10, i: 0.02 },
    { nazwa: 'Fosforan wapnia', em: 0, bialko: 0, ca: 24.0, p: 18.0, na: 0.30, k: 0.02, mg: 0.20, mn: 8, zn: 10, se: 0.02, fe: 15, i: 0.03 },
    { nazwa: 'Sól kamienna', em: 0, bialko: 0, ca: 0, p: 0, na: 39.0, k: 0.01, mg: 0.01, mn: 0, zn: 0, se: 0, fe: 0, i: 0.01 },
    { nazwa: 'Premiks witaminowy', em: 0, bialko: 0, ca: 0, p: 0, na: 0, k: 0, mg: 0.10, mn: 8000, zn: 6000, se: 30, fe: 5000, i: 100 },
    { nazwa: 'Olej roślinny', em: 37.0, bialko: 0, ca: 0, p: 0, na: 0, k: 0, mg: 0, mn: 0, zn: 0, se: 0, fe: 0, i: 0 }
  ];

  const wczytajSkladniki = (): PrzykladowySkladnik[] => {
    try {
      const zapisane = localStorage.getItem('adminSkladniki');
      if (zapisane) {
        return JSON.parse(zapisane);
      }
    } catch (e) {
      console.error('Błąd wczytywania składników:', e);
    }
    return domyslneSkladniki;
  };

  const [przykladoweSkladniki, setPrzykladoweSkladniki] = useState<PrzykladowySkladnik[]>(wczytajSkladniki());
  const [panelAdmin, setPanelAdmin] = useState(false);
  const [zalogowanyAdmin, setZalogowanyAdmin] = useState(false);
  const [edytowanySkladnik, setEdytowanySkladnik] = useState<any>(null);
  const [pokazModalHaslo, setPokazModalHaslo] = useState(false);
  const [inputHaslo, setInputHaslo] = useState('');
  const [pokazModalUsun, setPokazModalUsun] = useState(false);
  const [skladnikDoUsuniecia, setSkladnikDoUsuniecia] = useState<string | null>(null);
  const [pokazModalPrzywroc, setPokazModalPrzywroc] = useState(false);
  const [pokazModalEksport, setPokazModalEksport] = useState(false);
  const [eksportTresc, setEksportTresc] = useState('');
  const [eksportTyp, setEksportTyp] = useState('csv');

  const obliczKoszt = () => {
    return skladniki.reduce((suma, s) => {
      const procent = parseFloat(s.procent as string) || 0;
      const cena = parseFloat(s.cena) || 0;
      return suma + (procent * cena / 100);
    }, 0);
  };

  const exportCSV = () => {
    if (Math.abs(sumaProcentow - 100) > 0.1 || !aktualnaNorma) {
      return;
    }

    const rows = skladniki.filter(s => parseFloat(s.procent as string) > 0).map(s => ({
      'Składnik': s.nazwa,
      'Udział (%)': parseFloat(s.procent as string).toFixed(2),
      'EM (MJ/kg)': s.em,
      'Białko (%)': s.bialko,
      'Ca (%)': s.ca,
      'P (%)': s.p,
      'Cena (zł/kg)': s.cena || '-'
    }));

    rows.push({
      'Składnik': '--- SUMA ---',
      'Udział (%)': sumaProcentow.toFixed(2),
      'EM (MJ/kg)': obliczCalkowita('em').toFixed(2),
      'Białko (%)': obliczCalkowita('bialko').toFixed(2),
      'Ca (%)': obliczCalkowita('ca').toFixed(2),
      'P (%)': obliczCalkowita('p').toFixed(2),
      'Cena (zł/kg)': obliczKoszt().toFixed(2)
    });

    const header = Object.keys(rows[0]).join(';');
    const body = rows.map(r => Object.values(r).join(';')).join('\n');
    const csvContent = '\ufeff' + header + '\n' + body;
    
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receptura_${drob}_${okres.replace(/\s+/g, '_')}.csv`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (e) {
      setEksportTresc(csvContent);
      setEksportTyp('csv');
      setPokazModalEksport(true);
    }
  };

  const exportTXT = () => {
    if (Math.abs(sumaProcentow - 100) > 0.1 || !aktualnaNorma) {
      return;
    }

    let txt = '═══════════════════════════════════════════════\n';
    txt += '          RECEPTURA PASZY DLA DROBIU\n';
    txt += '═══════════════════════════════════════════════\n\n';
    txt += `Rodzaj drobiu: ${drob}\n`;
    txt += `Okres: ${okres}\n`;
    txt += `Data: ${new Date().toLocaleDateString('pl-PL')}\n\n`;
    txt += '───────────────────────────────────────────────\n';
    txt += 'SKŁADNIKI RECEPTURY:\n';
    txt += '───────────────────────────────────────────────\n\n';

    skladniki.filter(s => parseFloat(s.procent as string) > 0).forEach(s => {
      txt += `• ${s.nazwa.padEnd(25)} ${parseFloat(s.procent as string).toFixed(2).padStart(6)}%\n`;
    });

    txt += '\n───────────────────────────────────────────────\n';
    txt += 'PARAMETRY MIESZANKI:\n';
    txt += '───────────────────────────────────────────────\n\n';
    txt += `Energia metaboliczna: ${obliczCalkowita('em').toFixed(2)} MJ/kg (norma: ${aktualnaNorma.em} MJ/kg)\n`;
    txt += `Białko ogólne:        ${obliczCalkowita('bialko').toFixed(2)}% (norma: ${aktualnaNorma.bialko}%)\n`;
    txt += `Wapń (Ca):            ${obliczCalkowita('ca').toFixed(2)}% (norma: ${aktualnaNorma.ca}%)\n`;
    txt += `Fosfor (P):           ${obliczCalkowita('p').toFixed(2)}% (norma: ${aktualnaNorma.p}%)\n`;

    if (obliczKoszt() > 0) {
      txt += `\nKoszt mieszanki:      ${obliczKoszt().toFixed(2)} zł/kg\n`;
    }

    txt += '\n═══════════════════════════════════════════════\n';
    txt += 'Wygenerowano przez: Kalkulator Pasz dla Drobiu\n';
    txt += '═══════════════════════════════════════════════\n';

    try {
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receptura_${drob}_${okres.replace(/\s+/g, '_')}.txt`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (e) {
      setEksportTresc(txt);
      setEksportTyp('txt');
      setPokazModalEksport(true);
    }
  };

  const zapiszSkladniki = (noweSkladniki: PrzykladowySkladnik[]) => {
    setPrzykladoweSkladniki(noweSkladniki);
    try {
      localStorage.setItem('adminSkladniki', JSON.stringify(noweSkladniki));
    } catch (e) {
      console.error('Błąd zapisywania składników:', e);
    }
  };

  const aktualnaNorma = okres ? normy[drob]?.find((n: any) => n.okres === okres) : null;

  const dodajSkladnik = () => {
    setSkladniki([...skladniki, { nazwa: '', procent: '', em: '', bialko: '', ca: '', p: '', cena: '', na: '', k: '', mg: '', mn: '', zn: '', se: '', fe: '', i: '' }]);
  };

  const usunSkladnik = (index: number) => {
    setSkladniki(skladniki.filter((_, i) => i !== index));
  };

  const aktualizujSkladnik = (index: number, pole: string, wartosc: string | number) => {
    const noweSkladniki = [...skladniki];
    (noweSkladniki[index] as any)[pole] = wartosc;
    
    if (pole === 'nazwa') {
      const przyklad = przykladoweSkladniki.find(p => p.nazwa === wartosc);
      if (przyklad) {
        noweSkladniki[index].em = przyklad.em;
        noweSkladniki[index].bialko = przyklad.bialko;
        noweSkladniki[index].ca = przyklad.ca;
        noweSkladniki[index].p = przyklad.p;
        noweSkladniki[index].na = przyklad.na || 0;
        noweSkladniki[index].k = przyklad.k || 0;
        noweSkladniki[index].mg = przyklad.mg || 0;
        noweSkladniki[index].mn = przyklad.mn || 0;
        noweSkladniki[index].zn = przyklad.zn || 0;
        noweSkladniki[index].se = przyklad.se || 0;
        noweSkladniki[index].fe = przyklad.fe || 0;
        noweSkladniki[index].i = przyklad.i || 0;
      }
    }
    
    setSkladniki(noweSkladniki);
  };

  const obliczCalkowita = (pole: string) => {
    return skladniki.reduce((suma, s) => {
      const procent = parseFloat(s.procent as string) || 0;
      const wartosc = parseFloat((s as any)[pole] as string) || 0;
      return suma + (procent * wartosc / 100);
    }, 0);
  };

  const czyCenyWypelnione = () => {
    return skladniki.every(s => {
      const procent = parseFloat(s.procent as string) || 0;
      if (procent === 0) return true;
      const cena = parseFloat(s.cena);
      return cena && cena > 0;
    });
  };

  const obliczBladNormy = (testoweSkladniki: any[]) => {
    const oblicz = (pole: string) => {
      return testoweSkladniki.reduce((suma: number, s: any) => {
        const procent = s.procent;
        const wartosc = parseFloat(s[pole]) || 0;
        return suma + (procent * wartosc / 100);
      }, 0);
    };

    if (!aktualnaNorma) return Infinity;

    const em = oblicz('em');
    const bialko = oblicz('bialko');
    const ca = oblicz('ca');
    const p = oblicz('p');

    const bladEm = Math.pow((em - aktualnaNorma.em) / aktualnaNorma.em, 2);
    const bladBialko = Math.pow((bialko - aktualnaNorma.bialko) / aktualnaNorma.bialko, 2);
    const bladCa = Math.pow((ca - aktualnaNorma.ca) / aktualnaNorma.ca, 2);
    const bladP = Math.pow((p - aktualnaNorma.p) / aktualnaNorma.p, 2);

    return bladEm + bladBialko + bladCa + bladP;
  };

  const okreslKategorieWiekowa = () => {
    if (!okres) return null;
    
    const okresLower = okres.toLowerCase();
    
    if (okresLower.includes('zarodowe')) {
      return 'zarodowe';
    }
    
    if (okresLower.includes('1-3') || okresLower.includes('1-4') || okresLower.includes('1-6') || okresLower.includes('starter')) {
      return 'młode';
    }
    
    if (okresLower.includes('4-6') || okresLower.includes('4-7') || okresLower.includes('5-8') || 
        okresLower.includes('7-14') || okresLower.includes('9-12') || okresLower.includes('13-16') ||
        okresLower.includes('15-20') || okresLower.includes('grower')) {
      return 'rosnące';
    }
    
    if (okresLower.includes('niesienie') || okresLower.includes('powyżej') || okresLower.includes('finisher')) {
      return 'dorosłe';
    }
    
    return null;
  };

  const pobierzMaxStraczkowe = () => {
    const kategoria = okreslKategorieWiekowa();
    switch(kategoria) {
      case 'młode': return 5;
      case 'rosnące': return 10;
      case 'dorosłe': return 20;
      default: return 20;
    }
  };

  const przeliczOptymalneProporcje = () => {
    if (!aktualnaNorma) return;

    const aktywneSkladniki = skladniki.filter(s => 
      s.nazwa && (parseFloat(s.em as string) > 0 || parseFloat(s.bialko as string) > 0 || parseFloat(s.ca as string) > 0 || parseFloat(s.p as string) > 0)
    );

    if (aktywneSkladniki.length < 2) {
      alert('Dodaj co najmniej 2 składniki z wartościami odżywczymi aby móc przeliczyć optymalne proporcje.');
      return;
    }

    const maxStraczkowe = pobierzMaxStraczkowe();

    let najlepszeSkladniki = aktywneSkladniki.map(s => ({
      ...s,
      procent: 100 / aktywneSkladniki.length
    }));
    
    const straczkoweIndeksy: number[] = [];
    najlepszeSkladniki.forEach((s, idx) => {
      if (s.nazwa === 'Groch' || s.nazwa === 'Bobik') {
        straczkoweIndeksy.push(idx);
        if (s.procent > maxStraczkowe) {
          s.procent = maxStraczkowe;
        }
      }
    });
    
    let suma = najlepszeSkladniki.reduce((s, sk) => s + sk.procent, 0);
    najlepszeSkladniki.forEach(sk => sk.procent = (sk.procent / suma) * 100);
    
    let najlepszyBlad = obliczBladNormy(najlepszeSkladniki);

    for (let iteracja = 0; iteracja < 1000; iteracja++) {
      const testoweSkladniki = najlepszeSkladniki.map(s => ({...s}));
      
      const idx1 = Math.floor(Math.random() * testoweSkladniki.length);
      let idx2 = Math.floor(Math.random() * testoweSkladniki.length);
      while (idx2 === idx1 && testoweSkladniki.length > 1) {
        idx2 = Math.floor(Math.random() * testoweSkladniki.length);
      }

      const zmiana = (Math.random() * 20 - 10);
      testoweSkladniki[idx1].procent = Math.max(0.1, Math.min(99, testoweSkladniki[idx1].procent + zmiana));
      testoweSkladniki[idx2].procent = Math.max(0.1, Math.min(99, testoweSkladniki[idx2].procent - zmiana));

      testoweSkladniki.forEach(s => {
        if ((s.nazwa === 'Groch' || s.nazwa === 'Bobik') && s.procent > maxStraczkowe) {
          s.procent = maxStraczkowe;
        }
      });

      suma = testoweSkladniki.reduce((s, sk) => s + sk.procent, 0);
      testoweSkladniki.forEach(sk => sk.procent = (sk.procent / suma) * 100);

      const blad = obliczBladNormy(testoweSkladniki);
      if (blad < najlepszyBlad) {
        najlepszyBlad = blad;
        najlepszeSkladniki = testoweSkladniki;
      }
    }

    const noweSkladniki = skladniki.map(s => {
      const znaleziony = najlepszeSkladniki.find(ns => ns.nazwa === s.nazwa);
      if (znaleziony) {
        return {
          ...s,
          procent: znaleziony.procent.toFixed(1)
        };
      }
      return s;
    });

    setSkladniki(noweSkladniki);

    setTimeout(() => {
      const sugestie = generujSugestie(noweSkladniki);
      if (sugestie.length > 0) {
        const komunikat = 'Proporcje zostały przeliczone, ale niektóre parametry są poza normą.\n\n' +
          '🔧 SUGESTIE POPRAWEK:\n\n' + 
          sugestie.join('\n\n');
        alert(komunikat);
      } else {
        alert('✅ Świetnie! Proporcje zostały przeliczone i wszystkie parametry są w normie!');
      }
    }, 100);
  };

  const przeliczNajtanszaMieszanke = () => {
    if (!aktualnaNorma) return;
    if (!czyCenyWypelnione()) {
      alert('Najpierw uzupełnij ceny wszystkich składników!');
      return;
    }

    const aktywneSkladniki = skladniki.filter(s => 
      s.nazwa && 
      (parseFloat(s.em as string) > 0 || parseFloat(s.bialko as string) > 0 || parseFloat(s.ca as string) > 0 || parseFloat(s.p as string) > 0) &&
      parseFloat(s.cena) > 0
    );

    if (aktywneSkladniki.length < 2) {
      alert('Dodaj co najmniej 2 składniki z wartościami odżywczymi i cenami.');
      return;
    }

    const maxStraczkowe = pobierzMaxStraczkowe();

    const obliczKosztTest = (testoweSkladniki: any[]) => {
      return testoweSkladniki.reduce((suma, s) => {
        return suma + (s.procent * parseFloat(s.cena) / 100);
      }, 0);
    };

    const obliczFunkcjeCelu = (testoweSkladniki: any[]) => {
      const koszt = obliczKosztTest(testoweSkladniki);
      const bladNormy = obliczBladNormy(testoweSkladniki);
      
      return koszt * 0.3 + bladNormy * 100;
    };

    let najlepszeSkladniki = aktywneSkladniki.map(s => ({
      ...s,
      procent: 100 / aktywneSkladniki.length
    }));
    
    najlepszeSkladniki.forEach((s) => {
      if (s.nazwa === 'Groch' || s.nazwa === 'Bobik') {
        if (s.procent > maxStraczkowe) {
          s.procent = maxStraczkowe;
        }
      }
    });
    
    let suma = najlepszeSkladniki.reduce((s, sk) => s + sk.procent, 0);
    najlepszeSkladniki.forEach(sk => sk.procent = (sk.procent / suma) * 100);
    
    let najlepszyWynik = obliczFunkcjeCelu(najlepszeSkladniki);
    let najnizszyKoszt = obliczKosztTest(najlepszeSkladniki);

    for (let iteracja = 0; iteracja < 2000; iteracja++) {
      const testoweSkladniki = najlepszeSkladniki.map(s => ({...s}));
      
      const cenySkladnikow = testoweSkladniki.map(s => parseFloat(s.cena));
      
      const wybierzSkladnik = () => {
        const rand = Math.random();
        if (rand < 0.7) {
          const posortowane = testoweSkladniki
            .map((s, idx) => ({s, idx, cena: parseFloat(s.cena)}))
            .sort((a, b) => a.cena - b.cena);
          const top3 = posortowane.slice(0, Math.min(3, posortowane.length));
          return top3[Math.floor(Math.random() * top3.length)].idx;
        }
        return Math.floor(Math.random() * testoweSkladniki.length);
      };
      
      const idx1 = wybierzSkladnik();
      let idx2 = wybierzSkladnik();
      while (idx2 === idx1 && testoweSkladniki.length > 1) {
        idx2 = wybierzSkladnik();
      }

      const cena1 = parseFloat(testoweSkladniki[idx1].cena);
      const cena2 = parseFloat(testoweSkladniki[idx2].cena);
      
      let zmiana = (Math.random() * 15 - 5);
      if (cena1 < cena2) {
        zmiana = Math.abs(zmiana);
      } else {
        zmiana = -Math.abs(zmiana);
      }
      
      testoweSkladniki[idx1].procent = Math.max(0.5, Math.min(95, testoweSkladniki[idx1].procent + zmiana));
      testoweSkladniki[idx2].procent = Math.max(0.5, Math.min(95, testoweSkladniki[idx2].procent - zmiana));

      testoweSkladniki.forEach(s => {
        if ((s.nazwa === 'Groch' || s.nazwa === 'Bobik') && s.procent > maxStraczkowe) {
          s.procent = maxStraczkowe;
        }
      });

      suma = testoweSkladniki.reduce((s, sk) => s + sk.procent, 0);
      testoweSkladniki.forEach(sk => sk.procent = (sk.procent / suma) * 100);

      const wynik = obliczFunkcjeCelu(testoweSkladniki);
      const koszt = obliczKosztTest(testoweSkladniki);
      
      if (wynik < najlepszyWynik) {
        najlepszyWynik = wynik;
        najlepszeSkladniki = testoweSkladniki;
        najnizszyKoszt = koszt;
      }
    }

    const noweSkladniki = skladniki.map(s => {
      const znaleziony = najlepszeSkladniki.find(ns => ns.nazwa === s.nazwa);
      if (znaleziony) {
        return {
          ...s,
          procent: znaleziony.procent.toFixed(1)
        };
      }
      return s;
    });

    setSkladniki(noweSkladniki);

    setTimeout(() => {
      const sugestie = generujSugestie(noweSkladniki);
      const koszt = obliczKoszt();
      
      let komunikat = `💰 Znaleziono najtańszą mieszankę!\n\nKoszt: ${koszt.toFixed(2)} zł/kg\n\n`;
      
      if (sugestie.length > 0) {
        komunikat += '⚠️ UWAGA - niektóre parametry są poza normą:\n\n' + 
          sugestie.join('\n\n') + 
          '\n\n💡 Aby poprawić normy żywieniowe, użyj przycisku "Przelicz optymalne proporcje".';
      } else {
        komunikat += '✅ Wszystkie parametry żywieniowe są w normie!';
      }
      
      alert(komunikat);
    }, 100);
  };

  const generujSugestie = (skladnikiDoSprawdzenia: Skladnik[]) => {
    const sugestie: string[] = [];
    
    const oblicz = (pole: string) => {
      return skladnikiDoSprawdzenia.reduce((suma, s) => {
        const procent = parseFloat(s.procent as string) || 0;
        const wartosc = parseFloat((s as any)[pole] as string) || 0;
        return suma + (procent * wartosc / 100);
      }, 0);
    };

    const em = oblicz('em');
    const bialko = oblicz('bialko');
    const ca = oblicz('ca');
    const p = oblicz('p');

    const maZboza = skladnikiDoSprawdzenia.some(s => 
      ['Pszenica', 'Kukurydza', 'Jęczmień', 'Owies'].includes(s.nazwa)
    );
    const maSrute = skladnikiDoSprawdzenia.some(s => 
      ['Śruta sojowa', 'Śruta rzepakowa', 'Śruta słonecznikowa'].includes(s.nazwa)
    );
    const maBialko = skladnikiDoSprawdzenia.some(s => 
      ['Śruta sojowa', 'Śruta rzepakowa', 'Śruta słonecznikowa', 'Groch', 'Bobik'].includes(s.nazwa)
    );
    const maKrede = skladnikiDoSprawdzenia.some(s => s.nazwa === 'Kreda pastewna');
    const maFosforan = skladnikiDoSprawdzenia.some(s => s.nazwa === 'Fosforan wapnia');
    const maOlej = skladnikiDoSprawdzenia.some(s => s.nazwa === 'Olej roślinny');

    const maxStraczkowe = pobierzMaxStraczkowe();
    const groch = skladnikiDoSprawdzenia.find(s => s.nazwa === 'Groch');
    const bobik = skladnikiDoSprawdzenia.find(s => s.nazwa === 'Bobik');
    const sumaStraczkowych = (parseFloat(groch?.procent as string) || 0) + (parseFloat(bobik?.procent as string) || 0);
    
    if (sumaStraczkowych > maxStraczkowe) {
      const kategoria = okreslKategorieWiekowa();
      let opis = '';
      if (kategoria === 'młode') opis = ' (młode ptaki - do 6 tygodni)';
      else if (kategoria === 'rosnące') opis = ' (ptaki rosnące - 7-20 tygodni)';
      else opis = ' (ptaki dorosłe)';
      
      sugestie.push(`⚠️ ZA DUŻO ROŚLIN STRĄCZKOWYCH:\n→ Suma grochu i bobiku wynosi ${sumaStraczkowych.toFixed(1)}%\n→ Maksimum dla tego wieku: ${maxStraczkowe}%${opis}\n→ Zmniejsz udział grochu/bobiku - nadmiar może powodować problemy trawienne!`);
    }

    if (sprawdzNorme(em, aktualnaNorma.em, 0.05) === 'za-nisko') {
      if (!maZboza) {
        sugestie.push('⚡ ENERGIA ZA NISKA:\n→ Dodaj zboża (kukurydza, pszenica, owies) - są głównym źródłem energii');
      } else if (!maOlej) {
        sugestie.push('⚡ ENERGIA ZA NISKA:\n→ Rozważ dodanie oleju roślinnego (1-2%) - szybko podniesie energię\n→ Lub zwiększ udział kukurydzy (najwyższa energia)\n→ Ziemniaki gotowane też są dobrym źródłem energii');
      } else {
        sugestie.push('⚡ ENERGIA ZA NISKA:\n→ Zwiększ udział kukurydzy, ziemniaków lub oleju roślinnego\n→ Zmniejsz udział otrębów i owsa (mają mniej energii)');
      }
    } else if (sprawdzNorme(em, aktualnaNorma.em, 0.05) === 'za-wysoko') {
      sugestie.push('⚡ ENERGIA ZA WYSOKA:\n→ Zmniejsz udział kukurydzy, ziemniaków lub oleju\n→ Zwiększ udział otrębów pszennych, owsa lub jęczmienia');
    }

    if (sprawdzNorme(bialko, aktualnaNorma.bialko, 0.05) === 'za-nisko') {
      if (!maBialko) {
        sugestie.push('🥜 BIAŁKO ZA NISKIE:\n→ KONIECZNIE dodaj źródło białka:\n  • Śruta sojowa (~46% białka) - najlepsze źródło\n  • Śruta słonecznikowa (~32% białka)\n  • Bobik (~27% białka) - dobra polska alternatywa\n  • Groch (~23% białka)\n⚠️ UWAGA: Groch i bobik - max ' + maxStraczkowe + '% łącznie dla tego wieku!');
      } else if (!maSrute) {
        sugestie.push('🥜 BIAŁKO ZA NISKIE:\n→ Zwiększ udział grochu lub bobiku (max ' + maxStraczkowe + '% łącznie!)\n→ Lub dodaj śrutę (sojową, rzepakową, słonecznikową) - mają więcej białka');
      } else {
        sugestie.push('🥜 BIAŁKO ZA NISKIE:\n→ Zwiększ udział śruty lub roślin strączkowych\n→ Zmniejsz udział zbóż\n⚠️ Pamiętaj: Groch + Bobik max ' + maxStraczkowe + '% łącznie!');
      }
    } else if (sprawdzNorme(bialko, aktualnaNorma.bialko, 0.05) === 'za-wysoko') {
      sugestie.push('🥜 BIAŁKO ZA WYSOKIE:\n→ Zmniejsz udział śruty lub roślin strączkowych\n→ Zwiększ udział zbóż (pszenica, kukurydza, owies)');
    }

    if (sprawdzNorme(ca, aktualnaNorma.ca, 0.1) === 'za-nisko') {
      if (!maKrede) {
        sugestie.push('🦴 WAPŃ ZA NISKI:\n→ KONIECZNIE dodaj kredę pastewną (2-4%)\n→ Bez wapnia kury nie będą miały mocnych skorupek!\n→ Kreda ma 38% wapnia');
      } else {
        sugestie.push('🦴 WAPŃ ZA NISKI:\n→ Zwiększ udział kredy pastewnej\n→ Dla kur niosek to bardzo ważne!');
      }
    } else if (sprawdzNorme(ca, aktualnaNorma.ca, 0.1) === 'za-wysoko') {
      sugestie.push('🦴 WAPŃ ZA WYSOKI:\n→ Zmniejsz udział kredy pastewnej\n→ Nadmiar wapnia może zaburzać wchłanianie innych składników');
    }

    if (sprawdzNorme(p, aktualnaNorma.p, 0.1) === 'za-nisko') {
      if (!maFosforan) {
        sugestie.push('⚗️ FOSFOR ZA NISKI:\n→ Dodaj fosforan wapnia (1-2%)\n→ Fosfor jest kluczowy dla metabolizmu i kości\n→ Fosforan ma 18% fosforu i 24% wapnia');
      } else {
        sugestie.push('⚗️ FOSFOR ZA NISKI:\n→ Zwiększ udział fosforanu wapnia\n→ Możesz też zwiększyć śrutę - zawiera fosfor');
      }
    } else if (sprawdzNorme(p, aktualnaNorma.p, 0.1) === 'za-wysoko') {
      sugestie.push('⚗️ FOSFOR ZA WYSOKI:\n→ Zmniejsz udział fosforanu wapnia\n→ Nadmiar fosforu obciąża nerki');
    }

    if (sugestie.length > 0) {
      const brakujace = [];
      if (!maZboza) brakujace.push('zboża (pszenica/kukurydza/owies)');
      if (!maBialko) brakujace.push('źródło białka (śruta/groch/bobik)');
      if (!maKrede && aktualnaNorma.ca > 1.5) brakujace.push('kreda pastewna');
      if (!maFosforan) brakujace.push('fosforan wapnia');
      
      if (brakujace.length > 0) {
        sugestie.push('📋 BRAKUJĄCE SKŁADNIKI:\n→ ' + brakujace.join('\n→ '));
      }
    }

    return sugestie;
  };

  const sprawdzNorme = (wartosc: number, norma: number, tolerancja = 0.1) => {
    const min = norma * (1 - tolerancja);
    const max = norma * (1 + tolerancja);
    if (wartosc < min) return 'za-nisko';
    if (wartosc > max) return 'za-wysoko';
    return 'ok';
  };

  const sumaProcentow = skladniki.reduce((suma, s) => suma + (parseFloat(s.procent as string) || 0), 0);

  const zalogujAdmin = () => {
    if (inputHaslo === 'admin2024') {
      setZalogowanyAdmin(true);
      setPanelAdmin(true);
      setPokazModalHaslo(false);
      setInputHaslo('');
    } else {
      setInputHaslo('');
    }
  };

  const wylogujAdmin = () => {
    setZalogowanyAdmin(false);
    setPanelAdmin(false);
    setEdytowanySkladnik(null);
  };

  const dodajNowySkladnik = () => {
    const nowySkladnik: PrzykladowySkladnik = {
      nazwa: 'Nowy składnik',
      em: 0,
      bialko: 0,
      ca: 0,
      p: 0,
      na: 0,
      k: 0,
      mg: 0,
      mn: 0,
      zn: 0,
      se: 0,
      fe: 0,
      i: 0
    };
    zapiszSkladniki([...przykladoweSkladniki, nowySkladnik]);
  };

  const usunSkladnikZBazy = (nazwa: string) => {
    setSkladnikDoUsuniecia(nazwa);
    setPokazModalUsun(true);
  };

  const potwierdzUsuniecie = () => {
    if (skladnikDoUsuniecia) {
      zapiszSkladniki(przykladoweSkladniki.filter(s => s.nazwa !== skladnikDoUsuniecia));
    }
    setPokazModalUsun(false);
    setSkladnikDoUsuniecia(null);
  };

  const zapiszEdycjeSkladnika = () => {
    if (!edytowanySkladnik) return;
    
    const noweSkladniki = przykladoweSkladniki.map(s => 
      s.nazwa === edytowanySkladnik.staraNazwa ? edytowanySkladnik : s
    );
    zapiszSkladniki(noweSkladniki);
    setEdytowanySkladnik(null);
  };

  const przywrocDomyslne = () => {
    setPokazModalPrzywroc(true);
  };

  const potwierdzPrzywrocenie = () => {
    zapiszSkladniki(domyslneSkladniki);
    setPokazModalPrzywroc(false);
  };

  const czyTrybZarodowy = () => {
    return okres === 'Zarodowe';
  };

  return (
    <>
      <Navigation />
      <main className="pt-20">
        {/* Hero Section */}
        <section 
          className="py-12 md:py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url(${kalkulatorPaszHeader})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white drop-shadow-lg mb-4">
                🌾 Kalkulator Pasz dla Drobiu
              </h1>
              <p className="text-white text-lg mb-4 drop-shadow-md">
                Prosty sposób na zbilansowanie paszy dla Twojego stada
              </p>
              <ReactionButton contentType="page" contentId="kalkulator-pasz" />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {!zalogowanyAdmin && (
              <div className="text-right mb-2">
                <button
                  onClick={() => setPokazModalHaslo(true)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  🔧 Admin
                </button>
              </div>
            )}

            {/* Modal dialogs */}
            {pokazModalHaslo && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-80 max-w-full">
                  <h2 className="text-lg font-semibold mb-4">Panel Admina - Logowanie</h2>
                  <input
                    type="password"
                    value={inputHaslo}
                    onChange={e => setInputHaslo(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                    placeholder="Wpisz hasło"
                    onKeyDown={e => { if (e.key === 'Enter') zalogujAdmin(); }}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setPokazModalHaslo(false)}
                      className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={zalogujAdmin}
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Zaloguj
                    </button>
                  </div>
                </div>
              </div>
            )}

            {pokazModalUsun && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96 max-w-full">
                  <h2 className="text-lg font-semibold mb-4">Potwierdź usunięcie składnika</h2>
                  <p>Czy na pewno chcesz usunąć składnik <strong>{skladnikDoUsuniecia}</strong>?</p>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => setPokazModalUsun(false)}
                      className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={potwierdzUsuniecie}
                      className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              </div>
            )}

            {pokazModalPrzywroc && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96 max-w-full">
                  <h2 className="text-lg font-semibold mb-4">Przywróć domyślne składniki</h2>
                  <p>Czy na pewno chcesz przywrócić domyślną listę składników? Wszystkie zmiany zostaną utracone.</p>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => setPokazModalPrzywroc(false)}
                      className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    >
                      Anuluj
                    </button>
                    <button
                      onClick={potwierdzPrzywrocenie}
                      className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Przywróć
                    </button>
                  </div>
                </div>
              </div>
            )}

            {pokazModalEksport && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96 max-w-full overflow-auto max-h-[80vh]">
                  <h2 className="text-lg font-semibold mb-4">Eksport receptury ({eksportTyp.toUpperCase()})</h2>
                  <textarea
                    readOnly
                    value={eksportTresc}
                    className="w-full h-64 border border-gray-300 rounded p-2 font-mono text-xs"
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setPokazModalEksport(false)}
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Zamknij
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Panel */}
            {zalogowanyAdmin && panelAdmin && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Panel Admina - Edycja składników</h2>
                  <button
                    onClick={wylogujAdmin}
                    className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Wyloguj
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border border-gray-200 rounded">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 border border-gray-300">Nazwa</th>
                        <th className="px-3 py-2 border border-gray-300">EM (MJ/kg)</th>
                        <th className="px-3 py-2 border border-gray-300">Białko (%)</th>
                        <th className="px-3 py-2 border border-gray-300">Ca (%)</th>
                        <th className="px-3 py-2 border border-gray-300">P (%)</th>
                        <th className="px-3 py-2 border border-gray-300">Na (%)</th>
                        <th className="px-3 py-2 border border-gray-300">K (%)</th>
                        <th className="px-3 py-2 border border-gray-300">Mg (%)</th>
                        <th className="px-3 py-2 border border-gray-300">Mn (mg/kg)</th>
                        <th className="px-3 py-2 border border-gray-300">Zn (mg/kg)</th>
                        <th className="px-3 py-2 border border-gray-300">Se (mg/kg)</th>
                        <th className="px-3 py-2 border border-gray-300">Fe (mg/kg)</th>
                        <th className="px-3 py-2 border border-gray-300">I (mg/kg)</th>
                        <th className="px-3 py-2 border border-gray-300">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {przykladoweSkladniki.map((s, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          <td className="px-2 py-1 border border-gray-300">
                            <input
                              type="text"
                              value={edytowanySkladnik?.nazwa === s.nazwa ? edytowanySkladnik.nazwa : s.nazwa}
                              onChange={e => setEdytowanySkladnik({ ...s, nazwa: e.target.value, staraNazwa: s.nazwa })}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-300">
                            <input
                              type="number"
                              value={edytowanySkladnik?.nazwa === s.nazwa ? edytowanySkladnik.em : s.em}
                              onChange={e => setEdytowanySkladnik({ ...s, em: parseFloat(e.target.value), staraNazwa: s.nazwa })}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-300">
                            <input
                              type="number"
                              value={edytowanySkladnik?.nazwa === s.nazwa ? edytowanySkladnik.bialko : s.bialko}
                              onChange={e => setEdytowanySkladnik({ ...s, bialko: parseFloat(e.target.value), staraNazwa: s.nazwa })}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-300">
                            <input
                              type="number"
                              value={edytowanySkladnik?.nazwa === s.nazwa ? edytowanySkladnik.ca : s.ca}
                              onChange={e => setEdytowanySkladnik({ ...s, ca: parseFloat(e.target.value), staraNazwa: s.nazwa })}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-300">
                            <input
                              type="number"
                              value={edytowanySkladnik?.nazwa === s.nazwa ? edytowanySkladnik.p : s.p}
                              onChange={e => setEdytowanySkladnik({ ...s, p: parseFloat(e.target.value), staraNazwa: s.nazwa })}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-300">
                            <input
                              type="number"
                              value={edytowanySkladnik?.nazwa === s.nazwa ? edytowanySkladnik.na : s.na}
                              onChange={e => setEdytowanySkladnik({ ...s, na: parseFloat(e.target.value), staraNazwa: s.nazwa })}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-300">
                            <input
                              type="number"
                              value={edytowanySkladnik?.nazwa === s.nazwa ? edytowanySkladnik.k : s.k}
                              onChange={e => setEdytowanySkladnik({ ...s, k: parseFloat(e.target.value), staraNazwa: s.nazwa })}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-300">
                            <input
                              type="number"
                              value={edytowanySkladnik?.nazwa === s.nazwa ? edytowanySkladnik.mg : s.mg}
                              onChange={e => setEdytowanySkladnik({ ...s, mg: parseFloat(e.target.value), staraNazwa: s.nazwa })}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-300">
                            <input
                              type="number"
                              value={edytowanySkladnik?.nazwa === s.nazwa ? edytowanySkladnik.mn : s.mn}
                              onChange={e => setEdytowanySkladnik({ ...s, mn: parseFloat(e.target.value), staraNazwa: s.nazwa })}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-300">
                            <input
                              type="number"
                              value={edytowanySkladnik?.nazwa === s.nazwa ? edytowanySkladnik.zn : s.zn}
                              onChange={e => setEdytowanySkladnik({ ...s, zn: parseFloat(e.target.value), staraNazwa: s.nazwa })}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-300">
                            <input
                              type="number"
                              value={edytowanySkladnik?.nazwa === s.nazwa ? edytowanySkladnik.se : s.se}
                              onChange={e => setEdytowanySkladnik({ ...s, se: parseFloat(e.target.value), staraNazwa: s.nazwa })}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-300">
                            <input
                              type="number"
                              value={edytowanySkladnik?.nazwa === s.nazwa ? edytowanySkladnik.fe : s.fe}
                              onChange={e => setEdytowanySkladnik({ ...s, fe: parseFloat(e.target.value), staraNazwa: s.nazwa })}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-300">
                            <input
                              type="number"
                              value={edytowanySkladnik?.nazwa === s.nazwa ? edytowanySkladnik.i : s.i}
                              onChange={e => setEdytowanySkladnik({ ...s, i: parseFloat(e.target.value), staraNazwa: s.nazwa })}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1 border border-gray-300 text-center">
                            <button
                              onClick={() => usunSkladnikZBazy(s.nazwa)}
                              className="text-red-600 hover:text-red-800"
                              title="Usuń składnik"
                            >
                              &times;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={dodajNowySkladnik}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    Dodaj nowy składnik
                  </button>
                  {edytowanySkladnik && (
                    <button
                      onClick={zapiszEdycjeSkladnika}
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Zapisz zmiany
                    </button>
                  )}
                  <button
                    onClick={przywrocDomyslne}
                    className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700"
                  >
                    Przywróć domyślne
                  </button>
                </div>
              </div>
            )}

            {/* Kalkulator */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Kalkulator Pasz</h2>

              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1" htmlFor="drob-select">Wybierz rodzaj drobiu:</label>
                  <select
                    id="drob-select"
                    value={drob}
                    onChange={e => {
                      setDrob(e.target.value);
                      setOkres('');
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    {typyDrobiu.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1" htmlFor="okres-select">Wybierz okres:</label>
                  <select
                    id="okres-select"
                    value={okres}
                    onChange={e => setOkres(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">-- wybierz okres --</option>
                    {normy[drob]?.map((n, idx) => (
                      <option key={idx} value={n.okres}>{n.okres}</option>
                    ))}
                  </select>
                </div>
              </div>

              {okres && (
                <>
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm text-left border border-gray-200 rounded">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 border border-gray-300">Składnik</th>
                          <th className="px-3 py-2 border border-gray-300 w-20">Udział (%)</th>
                          <th className="px-3 py-2 border border-gray-300 w-20">EM (MJ/kg)</th>
                          <th className="px-3 py-2 border border-gray-300 w-20">Białko (%)</th>
                          <th className="px-3 py-2 border border-gray-300 w-20">Ca (%)</th>
                          <th className="px-3 py-2 border border-gray-300 w-20">P (%)</th>
                          <th className="px-3 py-2 border border-gray-300 w-24">Cena (zł/kg)</th>
                          <th className="px-3 py-2 border border-gray-300 w-12">Usuń</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skladniki.map((s, idx) => (
                          <tr key={idx} className="border-t border-gray-200">
                            <td className="px-2 py-1 border border-gray-300">
                              <select
                                value={s.nazwa}
                                onChange={e => aktualizujSkladnik(idx, 'nazwa', e.target.value)}
                                className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                              >
                                <option value="">-- wybierz składnik --</option>
                                {przykladoweSkladniki.map((ps, i) => (
                                  <option key={i} value={ps.nazwa}>{ps.nazwa}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-1 border border-gray-300">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={0.1}
                                value={s.procent}
                                onChange={e => aktualizujSkladnik(idx, 'procent', e.target.value)}
                                className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                              />
                            </td>
                            <td className="px-2 py-1 border border-gray-300 text-center">{parseFloat(s.em as string).toFixed(2)}</td>
                            <td className="px-2 py-1 border border-gray-300 text-center">{parseFloat(s.bialko as string).toFixed(2)}</td>
                            <td className="px-2 py-1 border border-gray-300 text-center">{parseFloat(s.ca as string).toFixed(2)}</td>
                            <td className="px-2 py-1 border border-gray-300 text-center">{parseFloat(s.p as string).toFixed(2)}</td>
                            <td className="px-2 py-1 border border-gray-300">
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={s.cena}
                                onChange={e => aktualizujSkladnik(idx, 'cena', e.target.value)}
                                className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="px-2 py-1 border border-gray-300 text-center">
                              <button
                                onClick={() => usunSkladnik(idx)}
                                className="text-red-600 hover:text-red-800"
                                title="Usuń składnik"
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={dodajSkladnik}
                      className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Dodaj składnik
                    </button>
                    <button
                      onClick={przeliczOptymalneProporcje}
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Przelicz optymalne proporcje
                    </button>
                    <button
                      onClick={przeliczNajtanszaMieszanke}
                      disabled={czyTrybZarodowy()}
                      className={`px-4 py-2 rounded text-white ${czyTrybZarodowy() ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
                      title={czyTrybZarodowy() ? 'Tryb zarodowy wyłącza optymalizację kosztową' : ''}
                    >
                      Przelicz koszt (najtańsza)
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className={`font-semibold ${Math.abs(sumaProcentow - 100) > 0.1 ? 'text-red-600' : 'text-green-700'}`}>
                      Suma udziałów: {sumaProcentow.toFixed(2)}%
                    </p>
                  </div>

                  {Math.abs(sumaProcentow - 100) < 0.1 && aktualnaNorma && (
                    <div className="flex space-x-2">
                      <button
                        onClick={exportCSV}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        Eksportuj CSV
                      </button>
                      <button
                        onClick={exportTXT}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Eksportuj TXT
                      </button>
                    </div>
                  )}
                </>
              )}

              <div className="mt-6">
                <h3 className="font-bold text-lg mb-3">ℹ️ Informacje dodatkowe</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>EM (Energia Metaboliczna)</strong> - energia dostępna dla ptaków po strawieniu paszy</p>
                  <p><strong>Białko ogólne</strong> - zawartość białka w paszy, niezbędnego do wzrostu i produkcji jaj</p>
                  <p><strong>Wapń (Ca)</strong> - ważny dla tworzenia skorupek jaj i zdrowia kości</p>
                  <p><strong>Fosfor (P)</strong> - niezbędny dla metabolizmu i zdrowia szkieletu</p>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-green-800 font-semibold">
                      📥 EKSPORT RECEPTURY:
                    </p>
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      <p><strong>📊 CSV (Excel):</strong> Eksportuje recepturę do pliku CSV który można otworzyć w Excel, LibreOffice lub Google Sheets. Zawiera wszystkie składniki z pełnymi parametrami żywieniowymi i sumami.</p>
                      <p><strong>📄 TXT:</strong> Eksportuje recepturę jako czytelny plik tekstowy z pełnym zestawieniem składników, parametrów i kosztów. Idealny do wydruku lub prostego udostępniania.</p>
                      <p className="text-green-700 mt-2 font-semibold">💡 Przyciski eksportu pojawiają się automatycznie gdy receptura jest kompletna (suma = 100%).</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-purple-800 font-semibold">
                      🥚 TRYB ZARODOWY:
                    </p>
                    <p className="mt-2 text-purple-700 text-xs">
                      Specjalny tryb dla ptaków reprodukcyjnych. Oprócz podstawowych parametrów sprawdza dodatkowo 8 mikroelementów: 
                      sód, potas, magnez, mangan, cynk, selen, żelazo i jod. Mikroelementy są kluczowe dla prawidłowego rozwoju zarodków.
                      W tym trybie optymalizacja kosztowa jest wyłączona - priorytetem jest jakość paszy dla reprodukcji.
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-blue-800 font-semibold">
                      🎯 DWA TRYBY OPTYMALIZACJI:
                    </p>
                    <div className="mt-2 space-y-2">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="font-semibold text-blue-900">Przelicz optymalne proporcje</p>
                        <p className="text-xs text-blue-700">Priorytet: maksymalne zbliżenie do norm żywieniowych. Używaj gdy zależy Ci na najlepszej jakości paszy dla zdrowia ptaków.</p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <p className="font-semibold text-orange-900">Przelicz koszt (najtańsza)</p>
                        <p className="text-xs text-orange-700">Priorytet: najniższy koszt przy zachowaniu rozsądnych norm. Używaj gdy chcesz zaoszczędzić, ale wciąż zapewnić przyzwoite żywienie. Niedostępne w trybie zarodowym.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-orange-800 font-semibold">
                      ⚠️ WAŻNE OGRANICZENIA DLA GROCHU I BOBIKU:
                    </p>
                    <ul className="mt-2 space-y-1 text-orange-700">
                      <li>• Młode ptaki (1-6 tyg.): maksymalnie <strong>5%</strong> paszy</li>
                      <li>• Ptaki rosnące (7-20 tyg.): maksymalnie <strong>10%</strong> paszy</li>
                      <li>• Ptaki dorosłe: maksymalnie <strong>20%</strong> paszy</li>
                    </ul>
                    <p className="mt-2 text-orange-700 text-xs">
                      Nadmiar roślin strączkowych może powodować problemy trawienne i pogorszenie przyswajalności składników pokarmowych.
                    </p>
                  </div>
                  
                  <p className="mt-4 pt-3 border-t border-gray-200 text-green-800">
                    <strong>💊 PAMIĘTAJ O WITAMINACH!</strong><br/>
                    Zawsze dodawaj do paszy premiks witaminowo-mineralny (0,5-1% mieszanki) zawierający:<br/>
                    • Witaminy A, D3, E, K oraz grupę B<br/>
                    • Mikroelementy (mangan, cynk, miedź, żelazo, selen, jod)<br/>
                    Bez premiksu ptaki mogą cierpieć na niedobory mimo prawidłowo zbilansowanej paszy!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default KalkulatorPasz;
