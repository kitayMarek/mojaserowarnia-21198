import React, { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import ReactionButton from "@/components/ReactionButton";
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import kalkulatorPaszHeader from "@/assets/kalkulator-pasz-header.jpg";

interface Skladnik {
  nazwa: string;
  procent: string | number;
  em: string | number;
  bialko: string | number;
  ca: string | number;
  p: string | number;
  wlokno: string | number;
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
  wlokno?: number;
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
    { nazwa: '', procent: '', em: '', bialko: '', ca: '', p: '', wlokno: '', cena: '', na: '', k: '', mg: '', mn: '', zn: '', se: '', fe: '', i: '' }
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
      { okres: '5-8 tygodni', em: 12.1, bialko: 24.0, ca: 1.1, p: 0.70, tluszcz: 4.0, wlokno: 4.0, na: 0.16 },
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
    { nazwa: 'Pszenica', em: 13.5, bialko: 12.0, ca: 0.05, p: 0.35, wlokno: 2.5, na: 0.02, k: 0.45, mg: 0.13, mn: 40, zn: 30, se: 0.05, fe: 45, i: 0.08 },
    { nazwa: 'Kukurydza', em: 14.5, bialko: 8.5, ca: 0.02, p: 0.28, wlokno: 2.0, na: 0.01, k: 0.35, mg: 0.12, mn: 6, zn: 20, se: 0.03, fe: 25, i: 0.05 },
    { nazwa: 'Jęczmień', em: 12.5, bialko: 11.0, ca: 0.08, p: 0.38, wlokno: 5.0, na: 0.02, k: 0.50, mg: 0.12, mn: 15, zn: 25, se: 0.04, fe: 35, i: 0.06 },
    { nazwa: 'Owies', em: 11.0, bialko: 11.0, ca: 0.08, p: 0.35, wlokno: 10.0, na: 0.02, k: 0.43, mg: 0.14, mn: 45, zn: 32, se: 0.06, fe: 48, i: 0.07 },
    { nazwa: 'Groch', em: 12.5, bialko: 23.0, ca: 0.10, p: 0.40, wlokno: 5.5, na: 0.02, k: 1.00, mg: 0.13, mn: 12, zn: 35, se: 0.08, fe: 50, i: 0.09 },
    { nazwa: 'Bobik', em: 12.0, bialko: 27.0, ca: 0.15, p: 0.45, wlokno: 8.0, na: 0.03, k: 1.10, mg: 0.15, mn: 14, zn: 38, se: 0.09, fe: 55, i: 0.10 },
    { nazwa: 'Ziemniaki gotowane', em: 13.5, bialko: 9.0, ca: 0.01, p: 0.20, wlokno: 1.8, na: 0.01, k: 0.42, mg: 0.02, mn: 3, zn: 3, se: 0.01, fe: 8, i: 0.02 },
    { nazwa: 'Śruta słonecznikowa', em: 10.5, bialko: 32.0, ca: 0.25, p: 0.70, wlokno: 25.0, na: 0.03, k: 0.95, mg: 0.35, mn: 30, zn: 50, se: 0.70, fe: 70, i: 0.12 },
    { nazwa: 'Śruta sojowa', em: 9.5, bialko: 46.0, ca: 0.30, p: 0.65, wlokno: 6.0, na: 0.02, k: 2.00, mg: 0.28, mn: 25, zn: 45, se: 0.12, fe: 90, i: 0.15 },
    { nazwa: 'Śruta rzepakowa', em: 8.5, bialko: 34.0, ca: 0.70, p: 1.10, wlokno: 12.0, na: 0.03, k: 1.20, mg: 0.40, mn: 50, zn: 60, se: 1.10, fe: 150, i: 0.20 },
    { nazwa: 'Otręby pszenne', em: 8.0, bialko: 16.0, ca: 0.12, p: 1.20, wlokno: 42.0, na: 0.02, k: 1.15, mg: 0.50, mn: 120, zn: 70, se: 0.30, fe: 140, i: 0.08 },
    { nazwa: 'Kreda pastewna', em: 0, bialko: 0, ca: 38.0, p: 0.01, wlokno: 0, na: 0.10, k: 0.01, mg: 0.50, mn: 5, zn: 3, se: 0.01, fe: 10, i: 0.02 },
    { nazwa: 'Fosforan wapnia', em: 0, bialko: 0, ca: 24.0, p: 18.0, wlokno: 0, na: 0.30, k: 0.02, mg: 0.20, mn: 8, zn: 10, se: 0.02, fe: 15, i: 0.03 },
    { nazwa: 'Sól kamienna', em: 0, bialko: 0, ca: 0, p: 0, wlokno: 0, na: 39.0, k: 0.01, mg: 0.01, mn: 0, zn: 0, se: 0, fe: 0, i: 0.01 },
    { nazwa: 'Dolmix Capri', em: 2.5, bialko: 7.0, ca: 12.0, p: 5.0, wlokno: 1.5, na: 0.25, k: 0.30, mg: 0.45, mn: 1200, zn: 800, se: 8.0, fe: 600, i: 15 },
    { nazwa: 'Premiks witaminowy', em: 0, bialko: 0, ca: 0, p: 0, wlokno: 0, na: 0, k: 0, mg: 0.10, mn: 8000, zn: 6000, se: 30, fe: 5000, i: 100 },
    { nazwa: 'Olej roślinny', em: 37.0, bialko: 0, ca: 0, p: 0, wlokno: 0, na: 0, k: 0, mg: 0, mn: 0, zn: 0, se: 0, fe: 0, i: 0 }
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
    if (aktualnaNorma.wlokno) {
      txt += `Włókno:               ${obliczCalkowita('wlokno').toFixed(2)}% (norma: ${aktualnaNorma.wlokno}%)\n`;
    }

    if (obliczKoszt() > 0) {
      txt += `\nKoszt mieszanki:      ${obliczKoszt().toFixed(2)} zł/kg\n`;
    }

    txt += '\n═══════════════════════════════════════════════\n';
    txt += 'Wygenerowano przez: Kalkulator Pasz dla Drobiu - AGROJELONKI\n';
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
    setSkladniki([...skladniki, { nazwa: '', procent: '', em: '', bialko: '', ca: '', p: '', wlokno: '', cena: '', na: '', k: '', mg: '', mn: '', zn: '', se: '', fe: '', i: '' }]);
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
        noweSkladniki[index].wlokno = przyklad.wlokno || 0;
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
      s.nazwa && (
        parseFloat(s.em as string) > 0 || 
        parseFloat(s.bialko as string) > 0 || 
        parseFloat(s.ca as string) > 0 || 
        parseFloat(s.p as string) > 0 ||
        parseFloat(s.na as string) > 0 ||
        parseFloat(s.k as string) > 0 ||
        parseFloat(s.mg as string) > 0 ||
        parseFloat(s.mn as string) > 0 ||
        parseFloat(s.zn as string) > 0 ||
        parseFloat(s.se as string) > 0 ||
        parseFloat(s.fe as string) > 0 ||
        parseFloat(s.i as string) > 0
      )
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
    
    najlepszeSkladniki.forEach((s) => {
      if (s.nazwa === 'Groch' || s.nazwa === 'Bobik') {
        if ((s.procent as number) > maxStraczkowe) {
          s.procent = maxStraczkowe;
        }
      }
    });
    
    let suma = najlepszeSkladniki.reduce((s, sk) => s + (sk.procent as number), 0);
    najlepszeSkladniki.forEach(sk => sk.procent = ((sk.procent as number) / suma) * 100);
    
    let najlepszyBlad = obliczBladNormy(najlepszeSkladniki);

    for (let iteracja = 0; iteracja < 1000; iteracja++) {
      const testoweSkladniki = najlepszeSkladniki.map(s => ({...s}));
      
      const idx1 = Math.floor(Math.random() * testoweSkladniki.length);
      let idx2 = Math.floor(Math.random() * testoweSkladniki.length);
      while (idx2 === idx1 && testoweSkladniki.length > 1) {
        idx2 = Math.floor(Math.random() * testoweSkladniki.length);
      }

      const zmiana = (Math.random() * 20 - 10);
      testoweSkladniki[idx1].procent = Math.max(0.1, Math.min(99, (testoweSkladniki[idx1].procent as number) + zmiana));
      testoweSkladniki[idx2].procent = Math.max(0.1, Math.min(99, (testoweSkladniki[idx2].procent as number) - zmiana));

      testoweSkladniki.forEach(s => {
        if ((s.nazwa === 'Groch' || s.nazwa === 'Bobik') && (s.procent as number) > maxStraczkowe) {
          s.procent = maxStraczkowe;
        }
      });

      suma = testoweSkladniki.reduce((s, sk) => s + (sk.procent as number), 0);
      testoweSkladniki.forEach(sk => sk.procent = ((sk.procent as number) / suma) * 100);

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
          procent: (znaleziony.procent as number).toFixed(1)
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
      (
        parseFloat(s.em as string) > 0 || 
        parseFloat(s.bialko as string) > 0 || 
        parseFloat(s.ca as string) > 0 || 
        parseFloat(s.p as string) > 0 ||
        parseFloat(s.na as string) > 0 ||
        parseFloat(s.k as string) > 0 ||
        parseFloat(s.mg as string) > 0 ||
        parseFloat(s.mn as string) > 0 ||
        parseFloat(s.zn as string) > 0 ||
        parseFloat(s.se as string) > 0 ||
        parseFloat(s.fe as string) > 0 ||
        parseFloat(s.i as string) > 0
      ) &&
      parseFloat(s.cena) > 0
    );

    if (aktywneSkladniki.length < 2) {
      alert('Dodaj co najmniej 2 składniki z wartościami odżywczymi i cenami.');
      return;
    }

    const maxStraczkowe = pobierzMaxStraczkowe();

    const obliczKosztMieszanki = (testoweSkladniki: any[]) => {
      return testoweSkladniki.reduce((suma, s) => {
        return suma + ((s.procent as number) * parseFloat(s.cena) / 100);
      }, 0);
    };

    const obliczFunkcjeCelu = (testoweSkladniki: any[]) => {
      const koszt = obliczKosztMieszanki(testoweSkladniki);
      const bladNormy = obliczBladNormy(testoweSkladniki);
      
      return koszt * 0.3 + bladNormy * 100;
    };

    let najlepszeSkladniki = aktywneSkladniki.map(s => ({
      ...s,
      procent: 100 / aktywneSkladniki.length
    }));
    
    najlepszeSkladniki.forEach((s) => {
      if (s.nazwa === 'Groch' || s.nazwa === 'Bobik') {
        if ((s.procent as number) > maxStraczkowe) {
          s.procent = maxStraczkowe;
        }
      }
    });
    
    let suma = najlepszeSkladniki.reduce((s, sk) => s + (sk.procent as number), 0);
    najlepszeSkladniki.forEach(sk => sk.procent = ((sk.procent as number) / suma) * 100);
    
    let najlepszyWynik = obliczFunkcjeCelu(najlepszeSkladniki);

    for (let iteracja = 0; iteracja < 2000; iteracja++) {
      const testoweSkladniki = najlepszeSkladniki.map(s => ({...s}));
      
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
      
      testoweSkladniki[idx1].procent = Math.max(0.5, Math.min(95, (testoweSkladniki[idx1].procent as number) + zmiana));
      testoweSkladniki[idx2].procent = Math.max(0.5, Math.min(95, (testoweSkladniki[idx2].procent as number) - zmiana));

      testoweSkladniki.forEach(s => {
        if ((s.nazwa === 'Groch' || s.nazwa === 'Bobik') && (s.procent as number) > maxStraczkowe) {
          s.procent = maxStraczkowe;
        }
      });

      suma = testoweSkladniki.reduce((s, sk) => s + (sk.procent as number), 0);
      testoweSkladniki.forEach(sk => sk.procent = ((sk.procent as number) / suma) * 100);

      const wynik = obliczFunkcjeCelu(testoweSkladniki);
      
      if (wynik < najlepszyWynik) {
        najlepszyWynik = wynik;
        najlepszeSkladniki = testoweSkladniki;
      }
    }

    const noweSkladniki = skladniki.map(s => {
      const znaleziony = najlepszeSkladniki.find(ns => ns.nazwa === s.nazwa);
      if (znaleziony) {
        return {
          ...s,
          procent: (znaleziony.procent as number).toFixed(1)
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
      const brakujace: string[] = [];
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

  const znajdzBogateSkladniki = (mikroskładnik: 'na' | 'k' | 'mg' | 'mn' | 'zn' | 'se' | 'fe' | 'i') => {
    // Sortuj składniki według zawartości danego mikroskładnika (malejąco)
    const posortowane = [...przykladoweSkladniki]
      .filter(s => {
        const wartosc = s[mikroskładnik] || 0;
        return typeof wartosc === 'number' && wartosc > 0;
      })
      .sort((a, b) => {
        const wartoscA = (a[mikroskładnik] as number) || 0;
        const wartoscB = (b[mikroskładnik] as number) || 0;
        return wartoscB - wartoscA;
      });

    // Weź top 3 najbogatsze źródła
    return posortowane.slice(0, 3);
  };

  const dodajSkladnikZSugestii = (nazwaSkladnika: string) => {
    const przyklad = przykladoweSkladniki.find(p => p.nazwa === nazwaSkladnika);
    if (!przyklad) return;

    // Znajdź pierwszy pusty wiersz lub dodaj nowy
    const pustyIndex = skladniki.findIndex(s => !s.nazwa || s.nazwa === '');
    
    const nowySkladnik: Skladnik = {
      nazwa: przyklad.nazwa,
      procent: '',
      em: przyklad.em,
      bialko: przyklad.bialko,
      ca: przyklad.ca,
      p: przyklad.p,
      wlokno: przyklad.wlokno || 0,
      cena: '',
      na: przyklad.na || 0,
      k: przyklad.k || 0,
      mg: przyklad.mg || 0,
      mn: przyklad.mn || 0,
      zn: przyklad.zn || 0,
      se: przyklad.se || 0,
      fe: przyklad.fe || 0,
      i: przyklad.i || 0
    };

    if (pustyIndex !== -1) {
      // Zastąp pusty wiersz
      const noweSkladniki = [...skladniki];
      noweSkladniki[pustyIndex] = nowySkladnik;
      setSkladniki(noweSkladniki);
    } else {
      // Dodaj nowy wiersz
      setSkladniki([...skladniki, nowySkladnik]);
    }
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
    const nowySkladnik = {
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

  return (
    <>
      <Navigation />
      <PageBreadcrumbs items={[
        { label: "Narzędzia", href: "/narzedzia" },
        { label: "Kalkulator Pasz" }
      ]} />
      <div
        className="relative min-h-[400px] flex items-center justify-center text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${kalkulatorPaszHeader})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 py-16 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Kalkulator Pasz dla Drobiu
          </h1>
          <p className="text-xl md:text-2xl" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
            Zbilansuj paszę dla swoich ptaków zgodnie z normami żywieniowymi
          </p>
        </div>
      </div>

      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-foreground">🦅 Kalkulator Pasz dla Drobiu</h2>
              
              <div className="flex gap-2">
                {zalogowanyAdmin ? (
                  <>
                    <button
                      onClick={() => setPanelAdmin(!panelAdmin)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {panelAdmin ? '👁️ Ukryj Panel' : '⚙️ Panel Admina'}
                    </button>
                    <button
                      onClick={wylogujAdmin}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      🔓 Wyloguj
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setPokazModalHaslo(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    🔐 Panel Admina
                  </button>
                )}
              </div>
            </div>

            {/* Panel Admina */}
            {panelAdmin && zalogowanyAdmin && (
              <div className="mb-8 p-6 bg-secondary/20 border-2 border-secondary rounded-lg">
                <h3 className="text-xl font-bold text-foreground mb-4">⚙️ Panel Administratora - Zarządzanie Składnikami</h3>
                
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={dodajNowySkladnik}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ➕ Dodaj Nowy Składnik
                  </button>
                  <button
                    onClick={przywrocDomyslne}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    🔄 Przywróć Domyślne
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="p-2 text-left text-secondary-foreground">Nazwa</th>
                        <th className="p-2 text-secondary-foreground">EM</th>
                        <th className="p-2 text-secondary-foreground">Białko</th>
                        <th className="p-2 text-secondary-foreground">Ca</th>
                        <th className="p-2 text-secondary-foreground">P</th>
                        <th className="p-2 text-secondary-foreground">Włókno</th>
                        <th className="p-2 text-secondary-foreground">Na</th>
                        <th className="p-2 text-secondary-foreground">K</th>
                        <th className="p-2 text-secondary-foreground">Mg</th>
                        <th className="p-2 text-secondary-foreground">Mn</th>
                        <th className="p-2 text-secondary-foreground">Zn</th>
                        <th className="p-2 text-secondary-foreground">Se</th>
                        <th className="p-2 text-secondary-foreground">Fe</th>
                        <th className="p-2 text-secondary-foreground">I</th>
                        <th className="p-2 text-secondary-foreground">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {przykladoweSkladniki.map((skladnik, idx) => (
                        <tr key={idx} className="border-b hover:bg-purple-100">
                          <td className="p-2 font-medium">{skladnik.nazwa}</td>
                          <td className="p-2 text-center">{skladnik.em}</td>
                          <td className="p-2 text-center">{skladnik.bialko}</td>
                          <td className="p-2 text-center">{skladnik.ca}</td>
                          <td className="p-2 text-center">{skladnik.p}</td>
                          <td className="p-2 text-center">{skladnik.wlokno || 0}</td>
                          <td className="p-2 text-center">{skladnik.na || 0}</td>
                          <td className="p-2 text-center">{skladnik.k || 0}</td>
                          <td className="p-2 text-center">{skladnik.mg || 0}</td>
                          <td className="p-2 text-center">{skladnik.mn || 0}</td>
                          <td className="p-2 text-center">{skladnik.zn || 0}</td>
                          <td className="p-2 text-center">{skladnik.se || 0}</td>
                          <td className="p-2 text-center">{skladnik.fe || 0}</td>
                          <td className="p-2 text-center">{skladnik.i || 0}</td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEdytowanySkladnik({...skladnik, staraNazwa: skladnik.nazwa})}
                                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => usunSkladnikZBazy(skladnik.nazwa)}
                                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rodzaj drobiu:
                </label>
                <select
                  value={drob}
                  onChange={(e) => {
                    setDrob(e.target.value);
                    setOkres('');
                  }}
                  className="w-full p-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  {typyDrobiu.map(typ => (
                    <option key={typ.value} value={typ.value}>{typ.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Okres życia / Wiek:
                </label>
                <select
                  value={okres}
                  onChange={(e) => setOkres(e.target.value)}
                  className="w-full p-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="">-- Wybierz okres --</option>
                  {normy[drob]?.map((norma, idx) => (
                    <option key={idx} value={norma.okres}>{norma.okres}</option>
                  ))}
                </select>
              </div>
            </div>

            {aktualnaNorma && (
              <div className="mb-6 p-4 bg-accent/20 border border-accent rounded-lg">
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <Info size={20} />
                  Normy żywieniowe dla wybranego okresu:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="font-semibold">EM:</span> {aktualnaNorma.em} MJ/kg
                  </div>
                  <div>
                    <span className="font-semibold">Białko:</span> {aktualnaNorma.bialko}%
                  </div>
                  <div>
                    <span className="font-semibold">Ca:</span> {aktualnaNorma.ca}%
                  </div>
                  <div>
                    <span className="font-semibold">P:</span> {aktualnaNorma.p}%
                  </div>
                  {aktualnaNorma.na && (
                    <div>
                      <span className="font-semibold">Na:</span> {aktualnaNorma.na}%
                    </div>
                  )}
                  {aktualnaNorma.k && (
                    <div>
                      <span className="font-semibold">K:</span> {aktualnaNorma.k}%
                    </div>
                  )}
                  {aktualnaNorma.mg && (
                    <div>
                      <span className="font-semibold">Mg:</span> {aktualnaNorma.mg}%
                    </div>
                  )}
                  {aktualnaNorma.mn && (
                    <div>
                      <span className="font-semibold">Mn:</span> {aktualnaNorma.mn} mg/kg
                    </div>
                  )}
                  {aktualnaNorma.zn && (
                    <div>
                      <span className="font-semibold">Zn:</span> {aktualnaNorma.zn} mg/kg
                    </div>
                  )}
                  {aktualnaNorma.se && (
                    <div>
                      <span className="font-semibold">Se:</span> {aktualnaNorma.se} mg/kg
                    </div>
                  )}
                  {aktualnaNorma.fe && (
                    <div>
                      <span className="font-semibold">Fe:</span> {aktualnaNorma.fe} mg/kg
                    </div>
                  )}
                  {aktualnaNorma.i && (
                    <div>
                      <span className="font-semibold">I:</span> {aktualnaNorma.i} mg/kg
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-foreground">Składniki paszy:</h3>
                <button
                  onClick={dodajSkladnik}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Dodaj składnik
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left text-muted-foreground">Składnik</th>
                      <th className="p-2 text-muted-foreground">Udział (%)</th>
                      <th className="p-2 text-muted-foreground">EM (MJ/kg)</th>
                      <th className="p-2 text-muted-foreground">Białko (%)</th>
                      <th className="p-2 text-muted-foreground">Ca (%)</th>
                      <th className="p-2 text-muted-foreground">P (%)</th>
                      <th className="p-2 text-muted-foreground">Włókno (%)</th>
                      <th className="p-2 text-muted-foreground">Cena (zł/kg)</th>
                      <th className="p-2 text-muted-foreground">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skladniki.map((skladnik, idx) => (
                      <tr key={idx} className="border-b border-border">
                        <td className="p-2">
                          <input
                            type="text"
                            list={`skladniki-${idx}`}
                            value={skladnik.nazwa}
                            onChange={(e) => aktualizujSkladnik(idx, 'nazwa', e.target.value)}
                            className="w-full p-2 border border-input bg-background text-foreground rounded"
                            placeholder="Wpisz nazwę..."
                          />
                          <datalist id={`skladniki-${idx}`}>
                            {przykladoweSkladniki.map(przyklad => (
                              <option key={przyklad.nazwa} value={przyklad.nazwa} />
                            ))}
                          </datalist>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            value={skladnik.procent}
                            onChange={(e) => aktualizujSkladnik(idx, 'procent', e.target.value)}
                            className="w-20 p-2 border border-input bg-background text-foreground rounded text-center"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            value={skladnik.em}
                            onChange={(e) => aktualizujSkladnik(idx, 'em', e.target.value)}
                            className="w-20 p-2 border border-input bg-background text-foreground rounded text-center"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            value={skladnik.bialko}
                            onChange={(e) => aktualizujSkladnik(idx, 'bialko', e.target.value)}
                            className="w-20 p-2 border border-input bg-background text-foreground rounded text-center"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={skladnik.ca}
                            onChange={(e) => aktualizujSkladnik(idx, 'ca', e.target.value)}
                            className="w-20 p-2 border border-input bg-background text-foreground rounded text-center"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={skladnik.p}
                            onChange={(e) => aktualizujSkladnik(idx, 'p', e.target.value)}
                            className="w-20 p-2 border border-input bg-background text-foreground rounded text-center"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            value={skladnik.wlokno}
                            onChange={(e) => aktualizujSkladnik(idx, 'wlokno', e.target.value)}
                            className="w-20 p-2 border border-input bg-background text-foreground rounded text-center"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={skladnik.cena}
                            onChange={(e) => aktualizujSkladnik(idx, 'cena', e.target.value)}
                            className="w-20 p-2 border border-input bg-background text-foreground rounded text-center"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => usunSkladnik(idx)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6 p-4 bg-muted border border-border rounded-lg">
              <h3 className="font-bold text-foreground mb-3">📊 Podsumowanie mieszanki:</h3>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">Suma udziałów:</span>
                  <span className={`font-bold ${Math.abs(sumaProcentow - 100) < 0.1 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                    {sumaProcentow.toFixed(1)}%
                  </span>
                </div>
                {Math.abs(sumaProcentow - 100) > 0.1 && (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                    <AlertCircle size={16} />
                    <span>Suma udziałów powinna wynosić 100%</span>
                  </div>
                )}
              </div>

              {aktualnaNorma && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <div className="text-sm font-semibold">Energia (EM):</div>
                    <div className={`font-bold ${sprawdzNorme(obliczCalkowita('em'), aktualnaNorma.em, 0.05) === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                      {obliczCalkowita('em').toFixed(2)} MJ/kg
                    </div>
                    <div className="text-xs text-gray-500">norma: {aktualnaNorma.em}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-semibold">Białko:</div>
                    <div className={`font-bold ${sprawdzNorme(obliczCalkowita('bialko'), aktualnaNorma.bialko, 0.05) === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                      {obliczCalkowita('bialko').toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500">norma: {aktualnaNorma.bialko}%</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-semibold">Wapń (Ca):</div>
                    <div className={`font-bold ${sprawdzNorme(obliczCalkowita('ca'), aktualnaNorma.ca, 0.1) === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                      {obliczCalkowita('ca').toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500">norma: {aktualnaNorma.ca}%</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-semibold">Fosfor (P):</div>
                    <div className={`font-bold ${sprawdzNorme(obliczCalkowita('p'), aktualnaNorma.p, 0.1) === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                      {obliczCalkowita('p').toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500">norma: {aktualnaNorma.p}%</div>
                  </div>

                  {aktualnaNorma.wlokno && (
                    <div>
                      <div className="text-sm font-semibold">Włókno:</div>
                      <div className={`font-bold ${sprawdzNorme(obliczCalkowita('wlokno'), aktualnaNorma.wlokno, 0.15) === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                        {obliczCalkowita('wlokno').toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500">norma: {aktualnaNorma.wlokno}%</div>
                    </div>
                  )}

                  {aktualnaNorma.na && (
                    <div>
                      <div className="text-sm font-semibold">Sód (Na):</div>
                      <div className={`font-bold ${sprawdzNorme(obliczCalkowita('na'), aktualnaNorma.na, 0.1) === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                        {obliczCalkowita('na').toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500">norma: {aktualnaNorma.na}%</div>
                    </div>
                  )}

                  {aktualnaNorma.k && (
                    <div>
                      <div className="text-sm font-semibold">Potas (K):</div>
                      <div className={`font-bold ${sprawdzNorme(obliczCalkowita('k'), aktualnaNorma.k, 0.1) === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                        {obliczCalkowita('k').toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500">norma: {aktualnaNorma.k}%</div>
                    </div>
                  )}

                  {aktualnaNorma.mg && (
                    <div>
                      <div className="text-sm font-semibold">Magnez (Mg):</div>
                      <div className={`font-bold ${sprawdzNorme(obliczCalkowita('mg'), aktualnaNorma.mg, 0.1) === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                        {obliczCalkowita('mg').toFixed(3)}%
                      </div>
                      <div className="text-xs text-gray-500">norma: {aktualnaNorma.mg}%</div>
                    </div>
                  )}

                  {aktualnaNorma.mn && (
                    <div>
                      <div className="text-sm font-semibold">Mangan (Mn):</div>
                      <div className={`font-bold ${sprawdzNorme(obliczCalkowita('mn'), aktualnaNorma.mn, 0.1) === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                        {obliczCalkowita('mn').toFixed(1)} mg/kg
                      </div>
                      <div className="text-xs text-gray-500">norma: {aktualnaNorma.mn} mg/kg</div>
                    </div>
                  )}

                  {aktualnaNorma.zn && (
                    <div>
                      <div className="text-sm font-semibold">Cynk (Zn):</div>
                      <div className={`font-bold ${sprawdzNorme(obliczCalkowita('zn'), aktualnaNorma.zn, 0.1) === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                        {obliczCalkowita('zn').toFixed(1)} mg/kg
                      </div>
                      <div className="text-xs text-gray-500">norma: {aktualnaNorma.zn} mg/kg</div>
                    </div>
                  )}

                  {aktualnaNorma.se && (
                    <div>
                      <div className="text-sm font-semibold">Selen (Se):</div>
                      <div className={`font-bold ${sprawdzNorme(obliczCalkowita('se'), aktualnaNorma.se, 0.1) === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                        {obliczCalkowita('se').toFixed(2)} mg/kg
                      </div>
                      <div className="text-xs text-gray-500">norma: {aktualnaNorma.se} mg/kg</div>
                    </div>
                  )}

                  {aktualnaNorma.fe && (
                    <div>
                      <div className="text-sm font-semibold">Żelazo (Fe):</div>
                      <div className={`font-bold ${sprawdzNorme(obliczCalkowita('fe'), aktualnaNorma.fe, 0.1) === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                        {obliczCalkowita('fe').toFixed(1)} mg/kg
                      </div>
                      <div className="text-xs text-muted-foreground">norma: {aktualnaNorma.fe} mg/kg</div>
                    </div>
                  )}

                  {aktualnaNorma.i && (
                    <div>
                      <div className="text-sm font-semibold">Jod (I):</div>
                      <div className={`font-bold ${sprawdzNorme(obliczCalkowita('i'), aktualnaNorma.i, 0.1) === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                        {obliczCalkowita('i').toFixed(2)} mg/kg
                      </div>
                      <div className="text-xs text-muted-foreground">norma: {aktualnaNorma.i} mg/kg</div>
                    </div>
                  )}
                </div>
              )}

              {obliczKoszt() > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">💰 Koszt mieszanki:</span>
                    <span className="font-bold text-xl text-green-600 dark:text-green-400">{obliczKoszt().toFixed(2)} zł/kg</span>
                  </div>
                </div>
              )}

              {/* Ostrzeżenia dla mikroskładników poza normą */}
              {aktualnaNorma && Math.abs(sumaProcentow - 100) < 0.1 && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  {aktualnaNorma.wlokno && sprawdzNorme(obliczCalkowita('wlokno'), aktualnaNorma.wlokno, 0.15) !== 'ok' && (
                    <div className={`p-3 rounded-lg border ${
                      sprawdzNorme(obliczCalkowita('wlokno'), aktualnaNorma.wlokno, 0.15) === 'za-nisko' 
                        ? 'bg-destructive/10 border-destructive/30' 
                        : 'bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    }`}>
                      <div className="flex items-start gap-2">
                        <AlertCircle size={18} className={`mt-0.5 flex-shrink-0 ${
                          sprawdzNorme(obliczCalkowita('wlokno'), aktualnaNorma.wlokno, 0.15) === 'za-nisko' ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'
                        }`} />
                        <div className={`text-sm ${
                          sprawdzNorme(obliczCalkowita('wlokno'), aktualnaNorma.wlokno, 0.15) === 'za-nisko' ? 'text-destructive' : 'text-amber-900 dark:text-amber-200'
                        }`}>
                          <strong>Włókno:</strong> {obliczCalkowita('wlokno').toFixed(2)}% 
                          {sprawdzNorme(obliczCalkowita('wlokno'), aktualnaNorma.wlokno, 0.15) === 'za-nisko' 
                            ? ` - za mało! (norma: ${aktualnaNorma.wlokno}%, brakuje ${(aktualnaNorma.wlokno - obliczCalkowita('wlokno')).toFixed(2)}%)`
                            : ` - za dużo! (norma: ${aktualnaNorma.wlokno}%, nadmiar ${(obliczCalkowita('wlokno') - aktualnaNorma.wlokno).toFixed(2)}%)`
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  {aktualnaNorma.na && sprawdzNorme(obliczCalkowita('na'), aktualnaNorma.na, 0.15) !== 'ok' && (
                    <div className={`p-3 rounded-lg border ${
                      sprawdzNorme(obliczCalkowita('na'), aktualnaNorma.na, 0.15) === 'za-nisko' 
                        ? 'bg-destructive/10 border-destructive/30' 
                        : 'bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    }`}>
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle size={18} className={`mt-0.5 flex-shrink-0 ${
                          sprawdzNorme(obliczCalkowita('na'), aktualnaNorma.na, 0.15) === 'za-nisko' ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'
                        }`} />
                        <div className={`text-sm ${
                          sprawdzNorme(obliczCalkowita('na'), aktualnaNorma.na, 0.15) === 'za-nisko' ? 'text-destructive' : 'text-amber-900 dark:text-amber-200'
                        }`}>
                          <strong>Sód (Na):</strong> {obliczCalkowita('na').toFixed(3)}% 
                          {sprawdzNorme(obliczCalkowita('na'), aktualnaNorma.na, 0.15) === 'za-nisko' 
                            ? ` - za mało! (norma: ${aktualnaNorma.na}%, brakuje ${(aktualnaNorma.na - obliczCalkowita('na')).toFixed(3)}%)`
                            : ` - za dużo! (norma: ${aktualnaNorma.na}%, nadmiar ${(obliczCalkowita('na') - aktualnaNorma.na).toFixed(3)}%)`
                          }
                        </div>
                      </div>
                      {sprawdzNorme(obliczCalkowita('na'), aktualnaNorma.na, 0.15) === 'za-nisko' && (
                        <div className="ml-6 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                          💡 <strong>Sugestie:</strong> Dodaj więcej{' '}
                          {znajdzBogateSkladniki('na').map((s, idx) => (
                            <span key={idx}>
                              <button
                                onClick={() => dodajSkladnikZSugestii(s.nazwa)}
                                className="font-bold text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors"
                              >
                                {s.nazwa}
                              </button>
                              {' '}({(s.na || 0).toFixed(2)}% Na)
                              {idx < znajdzBogateSkladniki('na').length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {aktualnaNorma.k && sprawdzNorme(obliczCalkowita('k'), aktualnaNorma.k, 0.15) !== 'ok' && (
                    <div className={`p-3 rounded-lg ${
                      sprawdzNorme(obliczCalkowita('k'), aktualnaNorma.k, 0.15) === 'za-nisko' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-amber-50 border border-amber-200'
                    }`}>
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle size={18} className={`mt-0.5 flex-shrink-0 ${
                          sprawdzNorme(obliczCalkowita('k'), aktualnaNorma.k, 0.15) === 'za-nisko' ? 'text-red-600' : 'text-amber-600'
                        }`} />
                        <div className={`text-sm ${
                          sprawdzNorme(obliczCalkowita('k'), aktualnaNorma.k, 0.15) === 'za-nisko' ? 'text-red-800' : 'text-amber-800'
                        }`}>
                          <strong>Potas (K):</strong> {obliczCalkowita('k').toFixed(3)}% 
                          {sprawdzNorme(obliczCalkowita('k'), aktualnaNorma.k, 0.15) === 'za-nisko' 
                            ? ` - za mało! (norma: ${aktualnaNorma.k}%, brakuje ${(aktualnaNorma.k - obliczCalkowita('k')).toFixed(3)}%)`
                            : ` - za dużo! (norma: ${aktualnaNorma.k}%, nadmiar ${(obliczCalkowita('k') - aktualnaNorma.k).toFixed(3)}%)`
                          }
                        </div>
                      </div>
                      {sprawdzNorme(obliczCalkowita('k'), aktualnaNorma.k, 0.15) === 'za-nisko' && (
                        <div className="ml-6 text-xs text-gray-700 bg-white/50 p-2 rounded">
                          💡 <strong>Sugestie:</strong> Dodaj więcej{' '}
                          {znajdzBogateSkladniki('k').map((s, idx) => (
                            <span key={idx}>
                              <button
                                onClick={() => dodajSkladnikZSugestii(s.nazwa)}
                                className="font-bold text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors"
                              >
                                {s.nazwa}
                              </button>
                              {' '}({(s.k || 0).toFixed(2)}% K)
                              {idx < znajdzBogateSkladniki('k').length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {aktualnaNorma.mg && sprawdzNorme(obliczCalkowita('mg'), aktualnaNorma.mg, 0.15) !== 'ok' && (
                    <div className={`p-3 rounded-lg ${
                      sprawdzNorme(obliczCalkowita('mg'), aktualnaNorma.mg, 0.15) === 'za-nisko' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-amber-50 border border-amber-200'
                    }`}>
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle size={18} className={`mt-0.5 flex-shrink-0 ${
                          sprawdzNorme(obliczCalkowita('mg'), aktualnaNorma.mg, 0.15) === 'za-nisko' ? 'text-red-600' : 'text-amber-600'
                        }`} />
                        <div className={`text-sm ${
                          sprawdzNorme(obliczCalkowita('mg'), aktualnaNorma.mg, 0.15) === 'za-nisko' ? 'text-red-800' : 'text-amber-800'
                        }`}>
                          <strong>Magnez (Mg):</strong> {obliczCalkowita('mg').toFixed(3)}% 
                          {sprawdzNorme(obliczCalkowita('mg'), aktualnaNorma.mg, 0.15) === 'za-nisko' 
                            ? ` - za mało! (norma: ${aktualnaNorma.mg}%, brakuje ${(aktualnaNorma.mg - obliczCalkowita('mg')).toFixed(3)}%)`
                            : ` - za dużo! (norma: ${aktualnaNorma.mg}%, nadmiar ${(obliczCalkowita('mg') - aktualnaNorma.mg).toFixed(3)}%)`
                          }
                        </div>
                      </div>
                      {sprawdzNorme(obliczCalkowita('mg'), aktualnaNorma.mg, 0.15) === 'za-nisko' && (
                        <div className="ml-6 text-xs text-gray-700 bg-white/50 p-2 rounded">
                          💡 <strong>Sugestie:</strong> Dodaj więcej{' '}
                          {znajdzBogateSkladniki('mg').map((s, idx) => (
                            <span key={idx}>
                              <button
                                onClick={() => dodajSkladnikZSugestii(s.nazwa)}
                                className="font-bold text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors"
                              >
                                {s.nazwa}
                              </button>
                              {' '}({(s.mg || 0).toFixed(2)}% Mg)
                              {idx < znajdzBogateSkladniki('mg').length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {aktualnaNorma.mn && sprawdzNorme(obliczCalkowita('mn'), aktualnaNorma.mn, 0.15) !== 'ok' && (
                    <div className={`p-3 rounded-lg ${
                      sprawdzNorme(obliczCalkowita('mn'), aktualnaNorma.mn, 0.15) === 'za-nisko' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-amber-50 border border-amber-200'
                    }`}>
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle size={18} className={`mt-0.5 flex-shrink-0 ${
                          sprawdzNorme(obliczCalkowita('mn'), aktualnaNorma.mn, 0.15) === 'za-nisko' ? 'text-red-600' : 'text-amber-600'
                        }`} />
                        <div className={`text-sm ${
                          sprawdzNorme(obliczCalkowita('mn'), aktualnaNorma.mn, 0.15) === 'za-nisko' ? 'text-red-800' : 'text-amber-800'
                        }`}>
                          <strong>Mangan (Mn):</strong> {obliczCalkowita('mn').toFixed(1)} mg/kg 
                          {sprawdzNorme(obliczCalkowita('mn'), aktualnaNorma.mn, 0.15) === 'za-nisko' 
                            ? ` - za mało! (norma: ${aktualnaNorma.mn} mg/kg, brakuje ${(aktualnaNorma.mn - obliczCalkowita('mn')).toFixed(1)} mg/kg)`
                            : ` - za dużo! (norma: ${aktualnaNorma.mn} mg/kg, nadmiar ${(obliczCalkowita('mn') - aktualnaNorma.mn).toFixed(1)} mg/kg)`
                          }
                        </div>
                      </div>
                      {sprawdzNorme(obliczCalkowita('mn'), aktualnaNorma.mn, 0.15) === 'za-nisko' && (
                        <div className="ml-6 text-xs text-gray-700 bg-white/50 p-2 rounded">
                          💡 <strong>Sugestie:</strong> Dodaj więcej{' '}
                          {znajdzBogateSkladniki('mn').map((s, idx) => (
                            <span key={idx}>
                              <button
                                onClick={() => dodajSkladnikZSugestii(s.nazwa)}
                                className="font-bold text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors"
                              >
                                {s.nazwa}
                              </button>
                              {' '}({(s.mn || 0).toFixed(0)} mg/kg Mn)
                              {idx < znajdzBogateSkladniki('mn').length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {aktualnaNorma.zn && sprawdzNorme(obliczCalkowita('zn'), aktualnaNorma.zn, 0.15) !== 'ok' && (
                    <div className={`p-3 rounded-lg ${
                      sprawdzNorme(obliczCalkowita('zn'), aktualnaNorma.zn, 0.15) === 'za-nisko' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-amber-50 border border-amber-200'
                    }`}>
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle size={18} className={`mt-0.5 flex-shrink-0 ${
                          sprawdzNorme(obliczCalkowita('zn'), aktualnaNorma.zn, 0.15) === 'za-nisko' ? 'text-red-600' : 'text-amber-600'
                        }`} />
                        <div className={`text-sm ${
                          sprawdzNorme(obliczCalkowita('zn'), aktualnaNorma.zn, 0.15) === 'za-nisko' ? 'text-red-800' : 'text-amber-800'
                        }`}>
                          <strong>Cynk (Zn):</strong> {obliczCalkowita('zn').toFixed(1)} mg/kg 
                          {sprawdzNorme(obliczCalkowita('zn'), aktualnaNorma.zn, 0.15) === 'za-nisko' 
                            ? ` - za mało! (norma: ${aktualnaNorma.zn} mg/kg, brakuje ${(aktualnaNorma.zn - obliczCalkowita('zn')).toFixed(1)} mg/kg)`
                            : ` - za dużo! (norma: ${aktualnaNorma.zn} mg/kg, nadmiar ${(obliczCalkowita('zn') - aktualnaNorma.zn).toFixed(1)} mg/kg)`
                          }
                        </div>
                      </div>
                      {sprawdzNorme(obliczCalkowita('zn'), aktualnaNorma.zn, 0.15) === 'za-nisko' && (
                        <div className="ml-6 text-xs text-gray-700 bg-white/50 p-2 rounded">
                          💡 <strong>Sugestie:</strong> Dodaj więcej{' '}
                          {znajdzBogateSkladniki('zn').map((s, idx) => (
                            <span key={idx}>
                              <button
                                onClick={() => dodajSkladnikZSugestii(s.nazwa)}
                                className="font-bold text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors"
                              >
                                {s.nazwa}
                              </button>
                              {' '}({(s.zn || 0).toFixed(0)} mg/kg Zn)
                              {idx < znajdzBogateSkladniki('zn').length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {aktualnaNorma.se && sprawdzNorme(obliczCalkowita('se'), aktualnaNorma.se, 0.15) !== 'ok' && (
                    <div className={`p-3 rounded-lg ${
                      sprawdzNorme(obliczCalkowita('se'), aktualnaNorma.se, 0.15) === 'za-nisko' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-amber-50 border border-amber-200'
                    }`}>
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle size={18} className={`mt-0.5 flex-shrink-0 ${
                          sprawdzNorme(obliczCalkowita('se'), aktualnaNorma.se, 0.15) === 'za-nisko' ? 'text-red-600' : 'text-amber-600'
                        }`} />
                        <div className={`text-sm ${
                          sprawdzNorme(obliczCalkowita('se'), aktualnaNorma.se, 0.15) === 'za-nisko' ? 'text-red-800' : 'text-amber-800'
                        }`}>
                          <strong>Selen (Se):</strong> {obliczCalkowita('se').toFixed(2)} mg/kg 
                          {sprawdzNorme(obliczCalkowita('se'), aktualnaNorma.se, 0.15) === 'za-nisko' 
                            ? ` - za mało! (norma: ${aktualnaNorma.se} mg/kg, brakuje ${(aktualnaNorma.se - obliczCalkowita('se')).toFixed(2)} mg/kg)`
                            : ` - za dużo! (norma: ${aktualnaNorma.se} mg/kg, nadmiar ${(obliczCalkowita('se') - aktualnaNorma.se).toFixed(2)} mg/kg)`
                          }
                        </div>
                      </div>
                      {sprawdzNorme(obliczCalkowita('se'), aktualnaNorma.se, 0.15) === 'za-nisko' && (
                        <div className="ml-6 text-xs text-gray-700 bg-white/50 p-2 rounded">
                          💡 <strong>Sugestie:</strong> Dodaj więcej{' '}
                          {znajdzBogateSkladniki('se').map((s, idx) => (
                            <span key={idx}>
                              <button
                                onClick={() => dodajSkladnikZSugestii(s.nazwa)}
                                className="font-bold text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors"
                              >
                                {s.nazwa}
                              </button>
                              {' '}({(s.se || 0).toFixed(2)} mg/kg Se)
                              {idx < znajdzBogateSkladniki('se').length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {aktualnaNorma.fe && sprawdzNorme(obliczCalkowita('fe'), aktualnaNorma.fe, 0.15) !== 'ok' && (
                    <div className={`p-3 rounded-lg ${
                      sprawdzNorme(obliczCalkowita('fe'), aktualnaNorma.fe, 0.15) === 'za-nisko' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-amber-50 border border-amber-200'
                    }`}>
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle size={18} className={`mt-0.5 flex-shrink-0 ${
                          sprawdzNorme(obliczCalkowita('fe'), aktualnaNorma.fe, 0.15) === 'za-nisko' ? 'text-red-600' : 'text-amber-600'
                        }`} />
                        <div className={`text-sm ${
                          sprawdzNorme(obliczCalkowita('fe'), aktualnaNorma.fe, 0.15) === 'za-nisko' ? 'text-red-800' : 'text-amber-800'
                        }`}>
                          <strong>Żelazo (Fe):</strong> {obliczCalkowita('fe').toFixed(1)} mg/kg 
                          {sprawdzNorme(obliczCalkowita('fe'), aktualnaNorma.fe, 0.15) === 'za-nisko' 
                            ? ` - za mało! (norma: ${aktualnaNorma.fe} mg/kg, brakuje ${(aktualnaNorma.fe - obliczCalkowita('fe')).toFixed(1)} mg/kg)`
                            : ` - za dużo! (norma: ${aktualnaNorma.fe} mg/kg, nadmiar ${(obliczCalkowita('fe') - aktualnaNorma.fe).toFixed(1)} mg/kg)`
                          }
                        </div>
                      </div>
                      {sprawdzNorme(obliczCalkowita('fe'), aktualnaNorma.fe, 0.15) === 'za-nisko' && (
                        <div className="ml-6 text-xs text-gray-700 bg-white/50 p-2 rounded">
                          💡 <strong>Sugestie:</strong> Dodaj więcej{' '}
                          {znajdzBogateSkladniki('fe').map((s, idx) => (
                            <span key={idx}>
                              <button
                                onClick={() => dodajSkladnikZSugestii(s.nazwa)}
                                className="font-bold text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors"
                              >
                                {s.nazwa}
                              </button>
                              {' '}({(s.fe || 0).toFixed(0)} mg/kg Fe)
                              {idx < znajdzBogateSkladniki('fe').length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {aktualnaNorma.i && sprawdzNorme(obliczCalkowita('i'), aktualnaNorma.i, 0.15) !== 'ok' && (
                    <div className={`p-3 rounded-lg ${
                      sprawdzNorme(obliczCalkowita('i'), aktualnaNorma.i, 0.15) === 'za-nisko' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-amber-50 border border-amber-200'
                    }`}>
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle size={18} className={`mt-0.5 flex-shrink-0 ${
                          sprawdzNorme(obliczCalkowita('i'), aktualnaNorma.i, 0.15) === 'za-nisko' ? 'text-red-600' : 'text-amber-600'
                        }`} />
                        <div className={`text-sm ${
                          sprawdzNorme(obliczCalkowita('i'), aktualnaNorma.i, 0.15) === 'za-nisko' ? 'text-red-800' : 'text-amber-800'
                        }`}>
                          <strong>Jod (I):</strong> {obliczCalkowita('i').toFixed(2)} mg/kg 
                          {sprawdzNorme(obliczCalkowita('i'), aktualnaNorma.i, 0.15) === 'za-nisko' 
                            ? ` - za mało! (norma: ${aktualnaNorma.i} mg/kg, brakuje ${(aktualnaNorma.i - obliczCalkowita('i')).toFixed(2)} mg/kg)`
                            : ` - za dużo! (norma: ${aktualnaNorma.i} mg/kg, nadmiar ${(obliczCalkowita('i') - aktualnaNorma.i).toFixed(2)} mg/kg)`
                          }
                        </div>
                      </div>
                      {sprawdzNorme(obliczCalkowita('i'), aktualnaNorma.i, 0.15) === 'za-nisko' && (
                        <div className="ml-6 text-xs text-gray-700 bg-white/50 p-2 rounded">
                          💡 <strong>Sugestie:</strong> Dodaj więcej{' '}
                          {znajdzBogateSkladniki('i').map((s, idx) => (
                            <span key={idx}>
                              <button
                                onClick={() => dodajSkladnikZSugestii(s.nazwa)}
                                className="font-bold text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors"
                              >
                                {s.nazwa}
                              </button>
                              {' '}({(s.i || 0).toFixed(2)} mg/kg I)
                              {idx < znajdzBogateSkladniki('i').length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={przeliczOptymalneProporcje}
                disabled={!aktualnaNorma}
                className="flex-1 min-w-[200px] px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                🎯 Przelicz optymalne proporcje
              </button>
              
              <button
                onClick={przeliczNajtanszaMieszanke}
                disabled={!aktualnaNorma || !czyCenyWypelnione()}
                className="flex-1 min-w-[200px] px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                💰 Najtańsza mieszanka
              </button>
              
              <button
                onClick={exportCSV}
                disabled={Math.abs(sumaProcentow - 100) > 0.1 || !aktualnaNorma}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                📊 Eksport CSV
              </button>
              
              <button
                onClick={exportTXT}
                disabled={Math.abs(sumaProcentow - 100) > 0.1 || !aktualnaNorma}
                className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                📄 Eksport TXT
              </button>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p className="flex items-start gap-2">
                <Info size={16} className="mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Wskazówka:</strong> Po wybraniu składnika z listy, wartości odżywcze uzupełnią się automatycznie.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Ważne:</strong> Optymalizacja uwzględnia ograniczenia dla roślin strączkowych (groch, bobik) w zależności od wieku ptaków.
                </span>
              </p>
            </div>
          </div>

          <div className="text-center mb-6">
            <ReactionButton contentId="kalkulator-pasz" contentType="tool" />
          </div>
        </div>
      </div>

      {/* Modal hasło admina */}
      {pokazModalHaslo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">🔐 Panel Administratora</h3>
            <p className="text-sm text-gray-600 mb-4">Wprowadź hasło dostępu:</p>
            <input
              type="password"
              value={inputHaslo}
              onChange={(e) => setInputHaslo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && zalogujAdmin()}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              placeholder="Hasło"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={zalogujAdmin}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Zaloguj
              </button>
              <button
                onClick={() => {
                  setPokazModalHaslo(false);
                  setInputHaslo('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal edycji składnika */}
      {edytowanySkladnik && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <h3 className="text-xl font-bold mb-4">✏️ Edytuj składnik</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nazwa:</label>
                <input
                  type="text"
                  value={edytowanySkladnik.nazwa}
                  onChange={(e) => setEdytowanySkladnik({...edytowanySkladnik, nazwa: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">EM (MJ/kg):</label>
                <input
                  type="number"
                  step="0.1"
                  value={edytowanySkladnik.em}
                  onChange={(e) => setEdytowanySkladnik({...edytowanySkladnik, em: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Białko (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={edytowanySkladnik.bialko}
                  onChange={(e) => setEdytowanySkladnik({...edytowanySkladnik, bialko: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ca (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={edytowanySkladnik.ca}
                  onChange={(e) => setEdytowanySkladnik({...edytowanySkladnik, ca: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">P (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={edytowanySkladnik.p}
                  onChange={(e) => setEdytowanySkladnik({...edytowanySkladnik, p: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Włókno (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={edytowanySkladnik.wlokno || 0}
                  onChange={(e) => setEdytowanySkladnik({...edytowanySkladnik, wlokno: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Na (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={edytowanySkladnik.na || 0}
                  onChange={(e) => setEdytowanySkladnik({...edytowanySkladnik, na: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">K (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={edytowanySkladnik.k || 0}
                  onChange={(e) => setEdytowanySkladnik({...edytowanySkladnik, k: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mg (%):</label>
                <input
                  type="number"
                  step="0.001"
                  value={edytowanySkladnik.mg || 0}
                  onChange={(e) => setEdytowanySkladnik({...edytowanySkladnik, mg: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mn (mg/kg):</label>
                <input
                  type="number"
                  step="1"
                  value={edytowanySkladnik.mn || 0}
                  onChange={(e) => setEdytowanySkladnik({...edytowanySkladnik, mn: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Zn (mg/kg):</label>
                <input
                  type="number"
                  step="1"
                  value={edytowanySkladnik.zn || 0}
                  onChange={(e) => setEdytowanySkladnik({...edytowanySkladnik, zn: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Se (mg/kg):</label>
                <input
                  type="number"
                  step="0.01"
                  value={edytowanySkladnik.se || 0}
                  onChange={(e) => setEdytowanySkladnik({...edytowanySkladnik, se: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fe (mg/kg):</label>
                <input
                  type="number"
                  step="1"
                  value={edytowanySkladnik.fe || 0}
                  onChange={(e) => setEdytowanySkladnik({...edytowanySkladnik, fe: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">I (mg/kg):</label>
                <input
                  type="number"
                  step="0.01"
                  value={edytowanySkladnik.i || 0}
                  onChange={(e) => setEdytowanySkladnik({...edytowanySkladnik, i: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={zapiszEdycjeSkladnika}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                💾 Zapisz
              </button>
              <button
                onClick={() => setEdytowanySkladnik(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal potwierdzenia usunięcia */}
      {pokazModalUsun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">⚠️ Potwierdzenie usunięcia</h3>
            <p className="mb-4">Czy na pewno chcesz usunąć składnik <strong>{skladnikDoUsuniecia}</strong>?</p>
            <div className="flex gap-3">
              <button
                onClick={potwierdzUsuniecie}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Usuń
              </button>
              <button
                onClick={() => {
                  setPokazModalUsun(false);
                  setSkladnikDoUsuniecia(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal potwierdzenia przywrócenia */}
      {pokazModalPrzywroc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">🔄 Przywrócenie domyślnych</h3>
            <p className="mb-4">Czy na pewno chcesz przywrócić domyślną listę składników? Wszystkie Twoje zmiany zostaną utracone.</p>
            <div className="flex gap-3">
              <button
                onClick={potwierdzPrzywrocenie}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Przywróć
              </button>
              <button
                onClick={() => setPokazModalPrzywroc(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eksportu */}
      {pokazModalEksport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">📋 Eksport {eksportTyp.toUpperCase()}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Skopiuj poniższą treść i zapisz w pliku .{eksportTyp}
            </p>
            <textarea
              value={eksportTresc}
              readOnly
              className="w-full h-96 p-3 border border-gray-300 rounded-lg font-mono text-sm"
              onClick={(e) => e.currentTarget.select()}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(eksportTresc);
                  alert('Skopiowano do schowka!');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📋 Kopiuj do schowka
              </button>
              <button
                onClick={() => setPokazModalEksport(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default KalkulatorPasz;