import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import KartaSkladnika, { SZER_CENA, SZER_PRZYCISKI, SZER_UDZIAL } from '@/components/kalkulator/KartaSkladnika';
import PelnySklad from '@/components/kalkulator/PelnySklad';
import StadoKarta from '@/components/kalkulator/StadoKarta';
import KartaProduktu from '@/components/kalkulator/KartaProduktu';
import BazaDodatkow from '@/components/kalkulator/BazaDodatkow';
import KoncentratZeZbozemSekcja from '@/components/kalkulator/KoncentratZeZbozem';
import WynikMieszanki from '@/components/kalkulator/WynikMieszanki';
import ZapisaneReceptury, { PodpowiedzZapisu } from '@/components/kalkulator/ZapisaneReceptury';
import PodlaczWSwoimCzacie from '@/components/PodlaczWSwoimCzacie';
import {
  Komunikat, PARAMETRY, Sekcja, liczbaPL, zJednostka,
  type KomunikatKalkulatora, type PoleParametru,
} from '@/components/kalkulator/wspolne';
import { zdarzenieMieszankaEksport } from '@/lib/zdarzeniaGa4';
import { otworzWTalkToFarm, dwaMiejsca, OPIS_TALKTOFARM } from '@/lib/talkToFarm';
import type { Skladnik, ZapisanaMieszanka } from '@/types/kalkulatorPasz';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import ReactionButton from "@/components/ReactionButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowDown, Coins, Download, ExternalLink, Info, MessagesSquare, Package, Plus, Target, Wheat } from 'lucide-react';
import PageHeader from "@/components/PageHeader";
// Już nie na stronie (tytuł był w niej wtopiony), ale zostaje jako og:image do podglądów linków.
import kalkulatorPaszHeader from "@/assets/kalkulator-pasz-header.webp";
import { feedIngredients } from "@/data/feedIngredients";
import { useFeedIngredients } from "@/hooks/useFeedIngredients";
import ZglosProduktDialog from "@/components/kalkulator/ZglosProduktDialog";
import { NORMY_DROBIU, TYPY_DROBIU, dawkaTypowa } from "@/data/normyDrobiu";
import { dawkaDomyslna, grupaPtakow, opisZalecenia, zalecenieUdzialu } from "@/data/udzialySurowcow";
import { KATEGORIA_OSOBNE_KARMIDLO, cenaZaKg, najtanszaOferta } from "@/data/dodatkiPaszowe";
import { OPIS_GMO, opisEko, znacznikiSurowca } from "@/data/gmoEkoSurowcow";
import {
  maWartosci, dobierzProporcje, najtanszaMieszanka, generujSugestie as sugestieDoMieszanki, jedenSkladnik,
  sprawdzNorme, bladLimitow, osiagnieteLimity, graniceUdzialu, zapotrzebowanieStada,
  uzupelnienia, type Uzupelnienie,
} from "@/lib/bilansPaszy";
import { SERWIS } from "@/lib/serwis";

/*
 * Wygląd przebudowany 24.10.2026 (Marek: „liczy dobrze, ale wygląda strasznie”).
 * 75% wejść to telefony, a tabela na 9–11 kolumn przewijała się tam w bok.
 * Teraz pięć kroków: ptaki, składniki (karty), wynik, stado, zapis. Od 1280 px wynik
 * stoi w prawej kolumnie i przesuwa się razem z ekranem; niżej jest pasek na dole
 * ekranu z sumą, kosztem i liczbą parametrów poza normą.
 *
 * Logika doboru, oceny norm, limity i stado: src/lib/bilansPaszy.ts (wspólne
 * z serwerem MCP). Ta strona tylko zbiera dane i pokazuje wynik.
 *
 * Usunięty przy przebudowie: panel administratora bazy surowców. Nic go nie otwierało,
 * a hasło stało wpisane w kodzie publicznego repozytorium. Baza żyje w pliku danych.
 *
 * Zgłoszenia (od 25.10.2026): „Zgłoś produkt albo poprawkę” zbiera sklep i link albo
 * zdjęcie etykiety, a produkt wpisujemy sami (ZglosProduktDialog). Kto chce liczyć od razu,
 * dodaje „własny składnik”: nazwa i skład z etykiety tylko w jego mieszance, bez bazy.
 */

interface PrzykladowySkladnik {
  nazwa: string;
  kategoria?: string;
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

type KomunikatNaStronie = KomunikatKalkulatora & { miejsce: 'akcje' | 'wynik' };

const PUSTY_WIERSZ: Skladnik = { nazwa: '', procent: '', em: '', bialko: '', ca: '', p: '', wlokno: '', cena: '', na: '', k: '', mg: '', mn: '', zn: '', se: '', fe: '', i: '' };

const odmiana = (n: number, [jeden, kilka, wiele]: [string, string, string]) => {
  if (n === 1) return jeden;
  const j = n % 10, d = n % 100;
  return j >= 2 && j <= 4 && (d < 12 || d > 14) ? kilka : wiele;
};

const KLASA_WYBORU =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground " +
  "focus:outline-none focus:ring-2 focus:ring-ring";

const KalkulatorPasz = () => {
  useEffect(() => {
    const TITLE = "Kalkulator Pasz dla Drobiu - Bilansowanie Mieszanek | Moja Serowarnia";
    const DESCRIPTION = "Darmowy kalkulator pasz dla drobiu: bilansuj mieszanki dla kur niosek, brojlerów, kaczek, gęsi i indyków. Normy żywieniowe: energia, białko, Ca, P, aminokwasy, mikroelementy.";
    const CANONICAL = "https://mojaserowarnia.pl/kalkulator-pasz";

    document.title = TITLE;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        const [, key, name] = selector.match(/\[(\w+)="([^"]+)"\]/) || [];
        if (key && name) el.setAttribute(key, name);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', DESCRIPTION);
    setMeta('meta[property="og:title"]', 'content', TITLE);
    setMeta('meta[property="og:description"]', 'content', DESCRIPTION);
    setMeta('meta[property="og:url"]', 'content', CANONICAL);
    setMeta('meta[property="og:image"]', 'content', `https://mojaserowarnia.pl${kalkulatorPaszHeader}`);
    setMeta('meta[name="twitter:title"]', 'content', TITLE);
    setMeta('meta[name="twitter:description"]', 'content', DESCRIPTION);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    const prevCanonical = canonical.getAttribute('href');
    canonical.setAttribute('href', CANONICAL);

    return () => {
      if (prevCanonical) canonical?.setAttribute('href', prevCanonical);
    };
  }, []);

  const [drob, setDrob] = useState('kury-nioski-lekkie');
  const [okres, setOkres] = useState('');
  const [skladniki, setSkladniki] = useState<Skladnik[]>([{ ...PUSTY_WIERSZ }]);
  // Zapotrzebowanie stada (od 24.10.2026, logika w bilansPaszy.ts).
  const [sztuk, setSztuk] = useState('');
  const [dawkaG, setDawkaG] = useState('');
  // Komunikaty zamiast alert(): błędy pod przyciskami, wynik doboru nad wynikiem.
  const [komunikat, setKomunikat] = useState<KomunikatNaStronie | null>(null);

  // Normy i lista gatunkow: src/data/normyDrobiu.ts (wspolne ze serwerem MCP).
  const normy = NORMY_DROBIU;

  const typyDrobiu = TYPY_DROBIU;

  // Baza surowców: 124 pozycje z pliku danych (źródło: XLS Marka, scripts/gen-feed-ingredients.py).
  // Poprzednio: 17 zaszytych + edycja przez localStorage (atrapa admina).
  const wczytajSkladniki = (): PrzykladowySkladnik[] => feedIngredients;

  const [przykladoweSkladniki, setPrzykladoweSkladniki] = useState<PrzykladowySkladnik[]>(wczytajSkladniki());
  // baza z pliku (124) + zatwierdzone zgłoszenia userów z Supabase + produkty z bazy dodatków
  const { ingredients: feedMerged, dodatki } = useFeedIngredients();
  const dodatkiPoNazwie = useMemo(() => new Map(dodatki.map(d => [d.nazwa, d])), [dodatki]);
  useEffect(() => { setPrzykladoweSkladniki(feedMerged); }, [feedMerged]);

  // Plaska lista dla wyszukiwarki skladnikow. Liczona raz - wczesniej lista opcji
  // powstawala od nowa dla KAZDEGO wiersza przy KAZDYM nacisnieciu klawisza
  // w dowolnym z szesnastu pol liczbowych, co dawalo najgorszy INP w serwisie.
  const pozycjeDoWyboru = useMemo(
    () => przykladoweSkladniki.map(p => ({ nazwa: p.nazwa, kategoria: p.kategoria ?? '' })),
    [przykladoweSkladniki],
  );
  // Baza surowców w kształcie wiersza mieszanki, dla propozycji „czym uzupełnić”.
  // Produkty z bazy dodatków niosą do tego producenta, oferty, odpowiednik i dawkę z etykiety.
  const bazaUzupelnien = useMemo(
    () => przykladoweSkladniki.map(p => ({ ...p, ...(dodatkiPoNazwie.get(p.nazwa) ?? {}), procent: 0 })),
    [przykladoweSkladniki, dodatkiPoNazwie],
  );
  // Ramka „Pasza z jednego składnika” proponuje też mieszanki do osobnego karmidła, których
  // nie ma na liście składników (useFeedIngredients je odfiltrowuje).
  const bazaKarmidla = useMemo(
    () => [...bazaUzupelnien, ...dodatki.filter(d => d.kategoria === KATEGORIA_OSOBNE_KARMIDLO).map(d => ({ ...d, procent: 0 }))],
    [bazaUzupelnien, dodatki],
  );
  // Karta produktu i lista bazy dodatków (od 24.10.2026).
  const [kartaProduktu, setKartaProduktu] = useState<string | null>(null);
  const [bazaDodatkowOtwarta, setBazaDodatkowOtwarta] = useState(false);
  const pokazKarteProduktu = useCallback((nazwa: string) => {
    setBazaDodatkowOtwarta(false);
    setKartaProduktu(nazwa);
  }, []);
  // Zgłoszenie: null = zamknięte; poprawkaDo z karty produktu, nazwa z własnego składnika.
  const [zgloszenie, setZgloszenie] = useState<{ poprawkaDo?: string; nazwa?: string } | null>(null);
  const zglosPoprawke = useCallback((nazwa: string) => {
    setKartaProduktu(null);
    setZgloszenie({ poprawkaDo: nazwa });
  }, []);
  const zglosWlasny = useCallback((nazwa: string) => setZgloszenie({ nazwa }), []);
  const produktyDoPoprawki = useMemo(
    () => [...dodatki.map(d => d.nazwa), ...przykladoweSkladniki.map(p => p.nazwa)],
    [dodatki, przykladoweSkladniki],
  );
  const [pokazModalEksport, setPokazModalEksport] = useState(false);
  const [eksportTresc, setEksportTresc] = useState('');
  const [eksportTyp, setEksportTyp] = useState('csv');
  const [skopiowano, setSkopiowano] = useState(false);

  const obliczKoszt = (lista: Skladnik[] = skladniki) => {
    return lista.reduce((suma, s) => {
      const procent = parseFloat(s.procent as string) || 0;
      const cena = parseFloat(s.cena) || 0;
      return suma + (procent * cena / 100);
    }, 0);
  };

  const exportCSV = () => {
    if (Math.abs(sumaProcentow - 100) > 0.1 || !aktualnaNorma) {
      return;
    }

    const naMiesiac = (procent: number) =>
      stado ? { 'Na 30 dni (kg)': (stado.miesiecznieKg * procent / 100).toFixed(2) } : {};

    const rows = skladniki.filter(s => parseFloat(s.procent as string) > 0).map(s => ({
      'Składnik': s.nazwa,
      'Udział (%)': parseFloat(s.procent as string).toFixed(2),
      'EM (MJ/kg)': s.em,
      'Białko (%)': s.bialko,
      'Ca (%)': s.ca,
      'P (%)': s.p,
      'Cena (zł/kg)': s.cena || '-',
      ...naMiesiac(parseFloat(s.procent as string)),
    }));

    rows.push({
      'Składnik': '--- SUMA ---',
      'Udział (%)': sumaProcentow.toFixed(2),
      'EM (MJ/kg)': obliczCalkowita('em').toFixed(2),
      'Białko (%)': obliczCalkowita('bialko').toFixed(2),
      'Ca (%)': obliczCalkowita('ca').toFixed(2),
      'P (%)': obliczCalkowita('p').toFixed(2),
      'Cena (zł/kg)': obliczKoszt().toFixed(2),
      ...naMiesiac(100),
    });

    const header = Object.keys(rows[0]).join(';');
    const body = rows.map(r => Object.values(r).join(';')).join('\n');
    const csvContent = '﻿' + header + '\n' + body;

    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receptura_${drob}_${okres.replace(/\s+/g, '_')}.csv`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      zdarzenieMieszankaEksport('drob', 'csv');
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (e) {
      setEksportTresc(csvContent);
      setEksportTyp('csv');
      setSkopiowano(false);
      setPokazModalEksport(true);
    }
  };

  // Mieszanka do TalkToFarm: tylko składniki z udziałem, ceny i parametry.
  // Koszt jako null, gdy którykolwiek użyty składnik nie ma ceny: częściowa suma
  // wyglądałaby jak prawdziwy koszt mieszanki.
  const zapiszWTalkToFarm = () => {
    if (Math.abs(sumaProcentow - 100) > 0.1 || !aktualnaNorma) {
      return;
    }
    const rodzaj = (typyDrobiu.find(t => t.value === drob)?.label ?? drob)
      .replace(/^[^\p{L}]+/u, '');
    const sklad = skladniki
      .filter(s => parseFloat(s.procent as string) > 0)
      .map(s => {
        const cena = parseFloat(s.cena);
        return {
          nazwa: s.nazwa,
          udzial: dwaMiejsca(parseFloat(s.procent as string)),
          cena: cena > 0 ? cena : null,
        };
      });
    otworzWTalkToFarm({
      nazwa: `Mieszanka: ${rodzaj} (${okres})`,
      rodzaj,
      okres,
      sklad,
      parametry: {
        'EM (MJ/kg)': dwaMiejsca(obliczCalkowita('em')),
        'Białko (%)': dwaMiejsca(obliczCalkowita('bialko')),
        'Ca (%)': dwaMiejsca(obliczCalkowita('ca')),
        'P (%)': dwaMiejsca(obliczCalkowita('p')),
        'Włókno (%)': dwaMiejsca(obliczCalkowita('wlokno')),
        'Koszt (zł/kg)': czyCenyWypelnione() ? dwaMiejsca(obliczKoszt()) : null,
      },
    });
    zdarzenieMieszankaEksport('drob', 'talktofarm');
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

    if (stado) {
      txt += '\n───────────────────────────────────────────────\n';
      txt += 'ZAPOTRZEBOWANIE STADA:\n';
      txt += '───────────────────────────────────────────────\n\n';
      txt += `${sztukLiczba} szt. × ${formatKg(dawkaLiczba)} g dziennie\n`;
      txt += `Dziennie: ${formatKg(stado.dziennieKg)} kg, tygodniowo: ${formatKg(stado.tygodniowoKg)} kg, 30 dni: ${formatKg(stado.miesiecznieKg)} kg\n\n`;
      stado.skladniki.forEach(s => {
        txt += `• ${s.nazwa.padEnd(25)} ${formatKg(s.miesiecznieKg).padStart(8)} kg na 30 dni\n`;
      });
    }

    txt += '\n═══════════════════════════════════════════════\n';
    txt += `Wygenerowano przez: Kalkulator Pasz dla Drobiu - ${SERWIS.adres.replace('https://', '')}\n`;
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
      zdarzenieMieszankaEksport('drob', 'txt');
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (e) {
      setEksportTresc(txt);
      setEksportTyp('txt');
      setSkopiowano(false);
      setPokazModalEksport(true);
    }
  };

  const wczytajRecepture = (mieszanka: ZapisanaMieszanka) => {
    // Kolejnosc ma znaczenie: najpierw gatunek, potem okres. Lista okresow zalezy
    // od gatunku, wiec ustawiony wczesniej okres zostalby wyczyszczony.
    setDrob(mieszanka.drob);
    setOkres(mieszanka.okres);
    setSkladniki(mieszanka.pozycje);
    setKomunikat(null);
  };

  const aktualnaNorma = okres ? normy[drob]?.find((n: any) => n.okres === okres) : null;
  // Gatunek i okres razem: od 24.10.2026 limity udziałów zależą od grupy ptaków
  // (kaczki i gęsi mają własne), a nie od samego okresu.
  const ptaki = useMemo(() => ({ drob, okres }), [drob, okres]);
  const grupa = grupaPtakow(drob, okres);

  const dodajSkladnik = () => {
    setKomunikat(null);
    setSkladniki(poprzednie => [...poprzednie, { ...PUSTY_WIERSZ }]);
  };

  const usunSkladnik = useCallback((index: number) => {
    setKomunikat(null);
    setSkladniki(poprzednie => poprzednie.filter((_, i) => i !== index));
  }, []);

  // Wiersz podmieniany na NOWY obiekt (karty są w memo i inaczej by się nie odświeżyły).
  const aktualizujSkladnik = useCallback((index: number, pole: string, wartosc: string | number) => {
    setKomunikat(null);
    setSkladniki(poprzednie => poprzednie.map((s, i) => {
      if (i !== index) return s;
      const nowy = { ...s, [pole]: wartosc } as Skladnik;
      if (pole === 'nazwa') {
        const przyklad = przykladoweSkladniki.find(p => p.nazwa === wartosc);
        if (przyklad) {
          delete nowy.wlasny;
          nowy.em = przyklad.em;
          nowy.bialko = przyklad.bialko;
          nowy.ca = przyklad.ca;
          nowy.p = przyklad.p;
          nowy.wlokno = przyklad.wlokno || 0;
          nowy.na = przyklad.na || 0;
          nowy.k = przyklad.k || 0;
          nowy.mg = przyklad.mg || 0;
          nowy.mn = przyklad.mn || 0;
          nowy.zn = przyklad.zn || 0;
          nowy.se = przyklad.se || 0;
          nowy.fe = przyklad.fe || 0;
          nowy.i = przyklad.i || 0;
        }
      }
      return nowy;
    }));
  }, [przykladoweSkladniki]);

  // Własny składnik: nazwa spoza bazy, skład wpisuje hodowca. Zostają udział i cena,
  // liczby z poprzedniego składnika znikają, żeby nie udawały składu z etykiety.
  const ustawWlasnySkladnik = useCallback((index: number, nazwa: string) => {
    setKomunikat(null);
    setSkladniki(poprzednie => poprzednie.map((s, i) => (
      i === index ? { ...PUSTY_WIERSZ, nazwa, procent: s.procent, cena: s.cena, wlasny: true } : s
    )));
  }, []);

  const obliczCalkowita =(pole: string, lista: Skladnik[] = skladniki) => {
    return lista.reduce((suma, s) => {
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

  // Parametry z normy poza nią (te same tolerancje co w wyniku).
  const parametryPozaNorma = (lista: Skladnik[] = skladniki) => aktualnaNorma
    ? PARAMETRY.filter(({ pole, tol }) => aktualnaNorma[pole]
        && sprawdzNorme(obliczCalkowita(pole, lista), aktualnaNorma[pole] as number, tol) !== 'ok')
    : [];

  const pokazBlad = (tytul: string, tresc: string) =>
    setKomunikat({ rodzaj: 'blad', tytul, tresc, miejsce: 'akcje' });

  // Po doborze strona sama przewija do wyniku (tylko gdy wynik nie stoi obok, czyli poniżej 1280 px).
  const wynikRef = useRef<HTMLDivElement>(null);
  const przewinDoWyniku = useRef(false);
  const pokazWynik = (k: KomunikatKalkulatora) => {
    przewinDoWyniku.current = true;
    setKomunikat({ ...k, miejsce: 'wynik' });
  };
  useEffect(() => {
    if (!przewinDoWyniku.current) return;
    przewinDoWyniku.current = false;
    if (window.matchMedia('(min-width: 1280px)').matches) return;
    wynikRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [komunikat]);

  // Dopisek do komunikatu po doborze: które składniki zatrzymał limit udziału.
  const opisOsiagnietychLimitow = (pozycje: Skladnik[]) => {
    const osiagniete = osiagnieteLimity(pozycje, ptaki);
    return osiagniete.length
      ? `Doszły do limitu udziału: ${osiagniete.map(o => `${o.nazwa} (${o.max}%)`).join(', ')}. Limity zmienisz w „Skład i limity” przy składniku.`
      : '';
  };

  // Udziały po doborze z jednym miejscem po przecinku, tak żeby suma wyszła równo 100.
  // Samo toFixed(1) przy każdym składniku dawało czasem 99,9%: mieszanka nie była wtedy
  // „gotowa”, więc znikało stado i blokował się eksport. Resztę dostaje największy składnik,
  // który po niej zostaje w swoich granicach (inaczej np. kukurydza 60,1% dawała ostrzeżenie).
  const doJednegoMiejsca = (pozycje: Skladnik[]) => {
    const zaokr = pozycje.map(p => Math.round(Number(p.procent) * 10) / 10);
    const reszta = Math.round((100 - zaokr.reduce((a, b) => a + b, 0)) * 10) / 10;
    if (reszta !== 0 && zaokr.length > 0) {
      const wszystkie = zaokr.map((_, i) => i);
      const wGranicach = wszystkie.filter(i => {
        const [min, max] = graniceUdzialu(pozycje[i], ptaki);
        return zaokr[i] + reszta >= min - 1e-9 && zaokr[i] + reszta <= max + 1e-9;
      });
      const i = (wGranicach.length ? wGranicach : wszystkie).reduce((a, b) => (zaokr[b] > zaokr[a] ? b : a));
      zaokr[i] = Math.round((zaokr[i] + reszta) * 10) / 10;
    }
    const wynik = new Map<string, string>();
    pozycje.forEach((p, i) => { if (!wynik.has(p.nazwa)) wynik.set(p.nazwa, zaokr[i].toFixed(1)); });
    return wynik;
  };

  const wPozostalych = (lista: Skladnik[]) =>
    parametryPozaNorma(lista).some(({ pole }) => !['em', 'bialko', 'ca', 'p'].includes(pole))
      ? ' Włókna i minerałów dobór nie ustawia: sprawdź je w wyniku.'
      : '';

  const przeliczOptymalneProporcje = () => {
    if (!aktualnaNorma) return;

    const aktywneSkladniki = skladniki.filter(s => s.nazwa && maWartosci(s));

    if (aktywneSkladniki.length < 2) {
      pokazBlad('Za mało składników', aktywneSkladniki.length === 1
        ? 'Z jednego składnika nie ma czego dobierać. Wpisz mu 100%, a w wyniku pokażę, czego w nim brakuje i jak to uzupełnić, także osobnym karmidłem z minerałami.'
        : 'Dodaj co najmniej 2 składniki z wartościami odżywczymi, żeby przeliczyć proporcje.');
      return;
    }

    const sprzeczne = bladLimitow(aktywneSkladniki, ptaki);
    if (sprzeczne) {
      pokazBlad('Nie da się dobrać proporcji', sprzeczne);
      return;
    }

    const najlepszeSkladniki = dobierzProporcje(aktywneSkladniki, aktualnaNorma, ptaki);
    const dopisek = opisOsiagnietychLimitow(najlepszeSkladniki);

    const udzialy = doJednegoMiejsca(najlepszeSkladniki);
    const noweSkladniki = skladniki.map(s => udzialy.has(s.nazwa) ? { ...s, procent: udzialy.get(s.nazwa)! } : s);

    setSkladniki(noweSkladniki);

    const sugestie = generujSugestie(noweSkladniki);
    pokazWynik(sugestie.length > 0
      ? { rodzaj: 'uwaga', tytul: 'Proporcje przeliczone, ale część parametrów jest poza normą', sugestie, dopisek }
      : { rodzaj: 'ok', tytul: 'Proporcje dobrane', tresc: 'Energia, białko, wapń i fosfor są w normie.' + wPozostalych(noweSkladniki), dopisek });
  };

  const przeliczNajtanszaMieszanke = () => {
    if (!aktualnaNorma) return;
    if (!czyCenyWypelnione()) {
      pokazBlad('Brakuje cen', 'Najpierw uzupełnij ceny wszystkich składników z udziałem.');
      return;
    }

    const aktywneSkladniki = skladniki.filter(s => s.nazwa && maWartosci(s) && parseFloat(s.cena) > 0);

    if (aktywneSkladniki.length < 2) {
      pokazBlad('Za mało składników z ceną', 'Dodaj co najmniej 2 składniki z wartościami odżywczymi i cenami.');
      return;
    }

    const sprzeczne = bladLimitow(aktywneSkladniki, ptaki);
    if (sprzeczne) {
      pokazBlad('Nie da się policzyć najtańszej mieszanki', sprzeczne);
      return;
    }

    const najlepszeSkladniki = najtanszaMieszanka(aktywneSkladniki, aktualnaNorma, ptaki);
    const dopisek = opisOsiagnietychLimitow(najlepszeSkladniki);

    const udzialy = doJednegoMiejsca(najlepszeSkladniki);
    const noweSkladniki = skladniki.map(s => udzialy.has(s.nazwa) ? { ...s, procent: udzialy.get(s.nazwa)! } : s);

    setSkladniki(noweSkladniki);

    // Koszt z NOWYCH proporcji. Do 24.10.2026 komunikat brał go ze stanu sprzed
    // przeliczenia i pokazywał koszt starej mieszanki.
    const sugestie = generujSugestie(noweSkladniki);
    const tytul = `Najtańsza mieszanka: ${liczbaPL(obliczKoszt(noweSkladniki), 2)} zł/kg`;
    pokazWynik(sugestie.length > 0
      ? {
          rodzaj: 'uwaga', tytul, tresc: 'Niektóre parametry są poza normą:', sugestie,
          dopisek: ['Aby poprawić normy, użyj przycisku „Dobierz proporcje do normy”.', dopisek].filter(Boolean).join(' '),
        }
      : { rodzaj: 'ok', tytul, tresc: 'Energia, białko, wapń i fosfor są w normie.' + wPozostalych(noweSkladniki), dopisek });
  };

  const generujSugestie = (skladnikiDoSprawdzenia: Skladnik[]) =>
    sugestieDoMieszanki(skladnikiDoSprawdzenia, aktualnaNorma, ptaki, bazaUzupelnien);

  // Czym uzupełnić brak parametru (od 24.10.2026): ile dodać i czy nie wypchnie
  // innego parametru ponad normę. Do 24.10 były to po prostu trzy surowce
  // najbogatsze w dany składnik, bez ilości. Logika w bilansPaszy.ts, to samo
  // zwraca serwer MCP w polu uzupelnienia.
  // Z dawką paszy na ptaka (krok 4 albo typowa z poradnika rasy) także koszt na ptaka przez 30 dni.
  const propozycjeUzupelnien = (pole: PoleParametru): Uzupelnienie[] =>
    aktualnaNorma ? uzupelnienia(skladniki, aktualnaNorma, ptaki, bazaUzupelnien, pole, 2, dawkaLiczba) : [];

  // Wiersz mieszanki z surowca z bazy. Produkt z bazy dodatków dostaje cenę z najtańszej oferty.
  const wierszZBazy = (przyklad: PrzykladowySkladnik, procent: string): Skladnik => {
    const oferta = najtanszaOferta(dodatkiPoNazwie.get(przyklad.nazwa)?.oferty);
    return {
      nazwa: przyklad.nazwa,
      procent,
      em: przyklad.em,
      bialko: przyklad.bialko,
      ca: przyklad.ca,
      p: przyklad.p,
      wlokno: przyklad.wlokno || 0,
      cena: oferta ? cenaZaKg(oferta).toFixed(2) : '',
      na: przyklad.na || 0,
      k: przyklad.k || 0,
      mg: przyklad.mg || 0,
      mn: przyklad.mn || 0,
      zn: przyklad.zn || 0,
      se: przyklad.se || 0,
      fe: przyklad.fe || 0,
      i: przyklad.i || 0
    };
  };

  // „Koncentrat + Twoje zboże”: mieszanka z karty koncentratu zastępuje obecną. Zboża
  // zostają ze swoimi cenami; resztę koncentrat zastępuje, więc mówimy, co wypadło.
  const wstawMieszankeKoncentratu = (mieszanka: { nazwa: string; procent: number }[], opis: string) => {
    const nowe = mieszanka.flatMap(({ nazwa, procent }) => {
      const przyklad = przykladoweSkladniki.find(p => p.nazwa === nazwa);
      if (!przyklad) return [];
      const byl = skladniki.find(s => s.nazwa === nazwa);
      const w = wierszZBazy(przyklad, '');
      return [{ ...w, cena: byl?.cena || w.cena, procent }];
    });
    const udzialy = doJednegoMiejsca(nowe);
    const usuniete = skladniki.filter(s => s.nazwa && !nowe.some(n => n.nazwa === s.nazwa)).map(s => s.nazwa);
    setSkladniki(nowe.map(n => ({ ...n, procent: udzialy.get(n.nazwa) ?? String(n.procent) })));
    setKartaProduktu(null);
    pokazWynik({
      rodzaj: 'ok',
      tytul: `Wstawiono: ${opis}`,
      tresc: usuniete.length
        ? `Koncentrat zastępuje pozostałe składniki, więc wypadły: ${usuniete.join(', ')}.`
        : 'Sprawdź wynik: energię, białko, wapń i fosfor.',
    });
  };

  const dodajSkladnikZSugestii = (nazwaSkladnika: string, procent?: number) => {
    const przyklad = przykladoweSkladniki.find(p => p.nazwa === nazwaSkladnika);
    if (!przyklad) return;
    setKomunikat(null);
    const ilosc = procent != null ? Math.round(procent * 100) / 100 : null;

    // Surowiec już jest w mieszance: zwiększamy jego udział (nowy obiekt wiersza, bo karta jest w memo).
    const istniejacy = ilosc != null ? skladniki.findIndex(s => s.nazwa === nazwaSkladnika) : -1;
    if (istniejacy !== -1 && ilosc != null) {
      const noweSkladniki = [...skladniki];
      const wiersz = noweSkladniki[istniejacy];
      noweSkladniki[istniejacy] = { ...wiersz, procent: String(Math.round(((parseFloat(wiersz.procent as string) || 0) + ilosc) * 100) / 100) };
      setSkladniki(noweSkladniki);
      pokazWynik({ rodzaj: 'ok', tytul: `Zwiększono: ${nazwaSkladnika} o ${String(ilosc).replace('.', ',')}%`, tresc: 'Suma przekracza teraz 100%. Kliknij „Dobierz proporcje do normy”, a resztę wyrównam.' });
      return;
    }

    // Znajdź pierwszy pusty wiersz lub dodaj nowy
    const pustyIndex = skladniki.findIndex(s => !s.nazwa || s.nazwa === '');

    const nowySkladnik = wierszZBazy(przyklad, ilosc != null ? String(ilosc) : '');

    if (pustyIndex !== -1) {
      // Zastąp pusty wiersz
      const noweSkladniki = [...skladniki];
      noweSkladniki[pustyIndex] = nowySkladnik;
      setSkladniki(noweSkladniki);
    } else {
      // Dodaj nowy wiersz
      setSkladniki([...skladniki, nowySkladnik]);
    }
    if (ilosc != null) {
      pokazWynik({ rodzaj: 'ok', tytul: `Dodano: ${nazwaSkladnika}, ${String(ilosc).replace('.', ',')}%`, tresc: 'Suma przekracza teraz 100%. Kliknij „Dobierz proporcje do normy”, a resztę wyrównam.' });
    }
  };

  const sumaProcentow = skladniki.reduce((suma, s) => suma + (parseFloat(s.procent as string) || 0), 0);

  // Zapotrzebowanie stada: liczy się dopiero dla gotowej mieszanki (suma 100%).
  // Bez własnej dawki bierzemy typową z poradnika rasy, jeśli jest dla tego okresu.
  const typowaDawka = dawkaTypowa(drob, okres);
  const sztukLiczba = parseInt(sztuk, 10) || 0;
  const dawkaLiczba = parseFloat(dawkaG) || typowaDawka?.g || 0;
  const mieszankaGotowa = Math.abs(sumaProcentow - 100) < 0.1;
  const stado = sztukLiczba > 0 && dawkaLiczba > 0 && mieszankaGotowa
    ? zapotrzebowanieStada(skladniki.filter(s => s.nazwa), { sztuk: sztukLiczba, dawkaG: dawkaLiczba })
    : null;
  const formatKg = (kg: number) => kg.toLocaleString('pl-PL', { maximumFractionDigits: kg < 10 ? 2 : 1 });

  // Zalecany udział surowca dla tych ptaków (src/data/udzialySurowcow.ts), do karty składnika.
  // Odmiana „+enzym” ma już maksimum z enzymem, więc bez drugiego „z enzymem do …”.
  const zalecenieDla = (nazwa: string) => {
    const z = nazwa ? zalecenieUdzialu(nazwa, grupa) : null;
    if (!z) return null;
    return {
      opis: opisZalecenia(nazwa.includes('+enzym') ? { maks: z.maks, zalecane: z.zalecane } : z),
      maks: z.maks,
      powod: z.wpis.powod,
      ostrzezenie: z.wpis.ostrzezenie,
      stala: !!z.wpis.stalaDawka,
      domyslna: dawkaDomyslna(nazwa),
    };
  };
  // GMO i chów ekologiczny do „Skład i limity”: produkt z etykiety, surowiec z mapy (src/data/gmoEkoSurowcow.ts).
  const znacznikiDla = (nazwa: string) => {
    if (!nazwa) return '';
    const z = dodatkiPoNazwie.get(nazwa) ?? znacznikiSurowca(nazwa);
    return `${OPIS_GMO[z.gmo]} · ${opisEko(z.dopuszczalneEko)}`;
  };
  const wlasneLimity = skladniki
    .filter(s => s.nazwa && (s.min || s.max))
    .map(s => `${s.nazwa}${s.min ? ` od ${s.min}%` : ''}${s.max ? ` do ${s.max}%` : ''}`);

  const koszt = obliczKoszt();
  const cenyKompletne = czyCenyWypelnione();
  const pozaNorma = sumaProcentow > 0 ? parametryPozaNorma().length : 0;
  const brakDo100 = 100 - sumaProcentow;

  // Pasek na dole ekranu (telefon i tablet): widać go, dopóki wynik jest niżej niż ekran.
  // Chowa się przy wpisywaniu (klawiatura) i gdy na dole stoi baner zgody na analitykę.
  const [wynikPonizej, setWynikPonizej] = useState(false);
  const [piszeWPolu, setPiszeWPolu] = useState(false);
  useEffect(() => {
    const sprawdz = () => {
      const el = wynikRef.current;
      if (!el) return;
      const baner = document.querySelector('.CookieConsent');
      setWynikPonizej(el.getBoundingClientRect().top > window.innerHeight - 40 && !baner);
    };
    sprawdz();
    window.addEventListener('scroll', sprawdz, { passive: true });
    window.addEventListener('resize', sprawdz);
    return () => {
      window.removeEventListener('scroll', sprawdz);
      window.removeEventListener('resize', sprawdz);
    };
  }, []);
  const pasekWidoczny = wynikPonizej && !piszeWPolu && skladniki.some(s => s.nazwa);

  const gotoweDoEksportu = mieszankaGotowa && !!aktualnaNorma;

  return (
    <>
      <Navigation />
      <PageBreadcrumbs items={[
        { label: "Narzędzia", href: "/narzedzia" },
        { label: "Kalkulator Pasz" }
      ]} />
      {/* Wspólny PageHeader zamiast zdjęcia 400 px (benchmark „porządek i telefon”, 22.10.2026).
          Tytuł był trzy razy: napis wtopiony w grafikę (po angielsku „Poultry Feed Calculator”),
          H1 na zdjęciu i nagłówek karty; formularz zaczynał się dopiero ok. 550 px od góry telefonu. */}
      <div className="px-4 md:px-8 pt-2">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            icon={Wheat}
            color="amber"
            title="Kalkulator Pasz dla Drobiu"
            subtitle="Zbilansuj paszę dla kur niosek, brojlerów, kaczek, gęsi i indyków zgodnie z normami: energia, białko, wapń, fosfor i aminokwasy."
          />
        </div>
      </div>

      <div className="min-h-screen bg-background px-4 pb-8 pt-1 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <PodpowiedzZapisu />
          </div>
          {/* Odnośnik do ramki „Podłącz w swoim czacie” na dole (decyzja Marka 24.10.2026:
              jak najszybciej pokazać, że to samo policzy czat użytkownika). Przewijanie
              ręczne, bo zwykły #hash zmieniłby adres i trasę. */}
          <p className="mb-4 flex items-start gap-2 text-sm text-muted-foreground">
            <MessagesSquare size={16} className="mt-0.5 flex-shrink-0 text-primary" aria-hidden="true" />
            <span>
              Wolisz liczyć w rozmowie?{' '}
              <a
                href="#w-swoim-czacie"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('w-swoim-czacie')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="font-semibold text-primary underline"
              >
                Podłącz ten kalkulator do swojego ChatGPT, Claude albo Perplexity
              </a>
            </span>
          </p>

          <div
            className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start xl:gap-6"
            onFocus={(e) => setPiszeWPolu(e.target instanceof HTMLInputElement)}
            onBlur={() => setPiszeWPolu(false)}
          >
            <div className="flex min-w-0 flex-col gap-4 xl:col-start-1 xl:row-start-1">
              <Sekcja nr={1} tytul="Dla jakich ptaków">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold">Gatunek</span>
                    <select
                      value={drob}
                      onChange={(e) => {
                        setDrob(e.target.value);
                        setOkres('');
                        setKomunikat(null);
                      }}
                      className={KLASA_WYBORU}
                    >
                      {typyDrobiu.map(typ => (
                        <option key={typ.value} value={typ.value}>{typ.label.replace(/^[^\p{L}]+/u, '')}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold">Okres</span>
                    <select
                      value={okres}
                      onChange={(e) => {
                        setOkres(e.target.value);
                        setKomunikat(null);
                      }}
                      className={KLASA_WYBORU}
                    >
                      <option value="">Wybierz okres</option>
                      {normy[drob]?.map((norma, idx) => (
                        <option key={idx} value={norma.okres}>{norma.okres}</option>
                      ))}
                    </select>
                  </label>
                </div>
                {aktualnaNorma ? (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-muted-foreground">Norma na 1 kg paszy</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {PARAMETRY.filter(({ pole }) => aktualnaNorma[pole]).map(({ pole, skrot, jedn }) => (
                        <li key={pole} className="rounded-full bg-muted px-2.5 py-1 text-sm text-muted-foreground">
                          {skrot} <strong className="text-foreground">{zJednostka(liczbaPL(aktualnaNorma[pole] as number), jedn)}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Wybierz okres, a pokażę normę i porównam z nią mieszankę.</p>
                )}
              </Sekcja>

              <Sekcja
                nr={2}
                tytul="Składniki"
                prawa={skladniki.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {skladniki.length} {odmiana(skladniki.length, ['pozycja', 'pozycje', 'pozycji'])}
                  </span>
                )}
              >
                {skladniki.length > 0 && (
                  <div className="mb-1.5 hidden items-center gap-2 px-[11px] text-xs font-semibold text-muted-foreground sm:flex">
                    <span className="flex-1">Składnik</span>
                    <span className={cn(SZER_UDZIAL, 'pr-2.5 text-right')}>Udział</span>
                    <span className={cn(SZER_CENA, 'pr-2.5 text-right')}>Cena</span>
                    <span className={SZER_PRZYCISKI} aria-hidden="true" />
                  </div>
                )}
                <div className="space-y-2">
                  {skladniki.map((skladnik, idx) => {
                    const z = zalecenieDla(skladnik.nazwa);
                    return (
                      <KartaSkladnika
                        key={idx}
                        skladnik={skladnik}
                        idx={idx}
                        pozycje={pozycjeDoWyboru}
                        zalecenie={z?.opis ?? null}
                        zalecaneMaks={z?.maks ?? null}
                        powod={z?.powod ?? ''}
                        ostrzezenie={z?.ostrzezenie ?? ''}
                        stalaDawka={z?.stala ?? false}
                        dawkaDomyslna={z?.domyslna ?? 0}
                        znaczniki={skladnik.wlasny ? '' : znacznikiDla(skladnik.nazwa)}
                        produkt={dodatkiPoNazwie.has(skladnik.nazwa)}
                        onKartaProduktu={pokazKarteProduktu}
                        onWlasny={ustawWlasnySkladnik}
                        onZglos={zglosWlasny}
                        onZmiana={aktualizujSkladnik}
                        onUsun={usunSkladnik}
                      />
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={dodajSkladnik}
                  className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 text-base font-semibold text-primary hover:border-primary hover:bg-primary/5"
                >
                  <Plus className="h-5 w-5" aria-hidden="true" />
                  Dodaj składnik
                </button>
                <button
                  type="button"
                  onClick={() => setBazaDodatkowOtwarta(true)}
                  className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground hover:border-primary hover:bg-primary/5"
                >
                  <Package className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  Koncentraty, premiksy i dodatki z etykietą i ceną ({dodatki.length})
                </button>
                <p className="mt-2 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => setZgloszenie({})}
                    className="text-primary underline-offset-4 hover:underline"
                    title="Podaj sklep i link albo zdjęcie etykiety, a my wpiszemy produkt do bazy"
                  >
                    Nie ma go na liście? Zgłoś produkt
                  </button>
                </p>
                {wlasneLimity.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">Obowiązują Twoje limity: {wlasneLimity.join(', ')}.</p>
                )}

                <div className="mt-5 border-t border-border pt-4">
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="font-semibold">Suma udziałów</span>
                    <span className={cn('font-bold tabular-nums',
                      mieszankaGotowa ? 'text-green-700 dark:text-green-400' : sumaProcentow > 100 ? 'text-orange-800 dark:text-orange-300' : 'text-foreground')}>
                      {liczbaPL(sumaProcentow, 1)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <div
                      className={cn('h-full rounded-full',
                        mieszankaGotowa ? 'bg-green-600 dark:bg-green-500' : sumaProcentow > 100 ? 'bg-orange-600' : 'bg-primary')}
                      style={{ width: `${Math.min(100, sumaProcentow)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {mieszankaGotowa
                      ? 'Gotowe do liczenia.'
                      : sumaProcentow === 0
                        ? 'Wpisz udziały albo kliknij „Dobierz proporcje do normy”, a kalkulator ułoży je sam.'
                        : brakDo100 > 0
                          ? `Brakuje ${liczbaPL(brakDo100, 1)}% do 100%.`
                          : `Za dużo o ${liczbaPL(-brakDo100, 1)}%. Suma udziałów powinna wynosić 100%.`}
                  </p>

                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    <Button
                      type="button"
                      onClick={przeliczOptymalneProporcje}
                      disabled={!aktualnaNorma}
                      className="h-12 text-base font-semibold [&_svg]:size-5"
                    >
                      <Target aria-hidden="true" />
                      Dobierz proporcje do normy
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={przeliczNajtanszaMieszanke}
                      disabled={!aktualnaNorma || !cenyKompletne}
                      className="h-12 border-2 border-primary text-base font-semibold text-primary [&_svg]:size-5"
                    >
                      <Coins aria-hidden="true" />
                      Najtańsza mieszanka
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {!aktualnaNorma
                      ? 'Najpierw wybierz okres w kroku 1.'
                      : !cenyKompletne
                        ? 'Najtańszą mieszankę policzę, gdy wpiszesz ceny wszystkich składników z udziałem.'
                        : 'Dobór ustawia energię, białko, wapń i fosfor. Trzyma się zalecanych limitów udziału.'}
                  </p>
                  {komunikat?.miejsce === 'akcje' && (
                    <div className="mt-3">
                      <Komunikat komunikat={komunikat} onZamknij={() => setKomunikat(null)} />
                    </div>
                  )}
                </div>
              </Sekcja>
            </div>

            <div
              ref={wynikRef}
              id="wynik"
              className="min-w-0 scroll-mt-20 xl:sticky xl:top-4 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto"
            >
              <WynikMieszanki
                norma={aktualnaNorma}
                zawartosc={(pole) => obliczCalkowita(pole)}
                sumaProcentow={sumaProcentow}
                koszt={koszt}
                cenyKompletne={cenyKompletne}
                mieszankaGotowa={mieszankaGotowa}
                komunikat={komunikat?.miejsce === 'wynik' ? komunikat : null}
                onZamknijKomunikat={() => setKomunikat(null)}
                propozycjeW={propozycjeUzupelnien}
                dawkaG={dawkaLiczba}
                onDodajSkladnik={dodajSkladnikZSugestii}
                onPokazKarte={pokazKarteProduktu}
                jedenSkladnik={aktualnaNorma ? jedenSkladnik(skladniki, aktualnaNorma, ptaki, bazaKarmidla) : null}
                pelnySklad={
                  // Aminokwasy, witaminy i skład rozszerzony. Liczone z bazy surowców,
                  // nie z kart składników.
                  <PelnySklad
                    wiersze={skladniki}
                    baza={feedMerged}
                    normaTluszczu={aktualnaNorma?.tluszcz}
                  />
                }
              />
            </div>

            <div className="flex min-w-0 flex-col gap-4 xl:col-start-1 xl:row-start-2">
              <StadoKarta
                sztuk={sztuk}
                setSztuk={setSztuk}
                dawkaG={dawkaG}
                setDawkaG={setDawkaG}
                typowaDawka={typowaDawka}
                stado={stado}
                mieszankaGotowa={mieszankaGotowa}
                sztukLiczba={sztukLiczba}
                kosztNaKg={koszt > 0 && cenyKompletne ? koszt : 0}
                formatKg={formatKg}
              />

              <Sekcja nr={5} tytul="Zapisz i wyślij">
                <ZapisaneReceptury
                  drob={drob}
                  okres={okres}
                  normaEtykieta={okres ? `${typyDrobiu.find(t => t.value === drob)?.label ?? drob} — ${okres}` : 'bez wybranej normy'}
                  skladniki={skladniki}
                  onWczytaj={wczytajRecepture}
                />

                <p className="mb-2 mt-4 text-sm font-semibold">Pobierz recepturę</p>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Button type="button" variant="outline" onClick={exportCSV} disabled={!gotoweDoEksportu}
                    className="h-11 border-primary/60 text-primary">
                    <Download aria-hidden="true" />
                    Arkusz CSV
                  </Button>
                  <Button type="button" variant="outline" onClick={exportTXT} disabled={!gotoweDoEksportu}
                    className="h-11 border-primary/60 text-primary">
                    <Download aria-hidden="true" />
                    Tekst TXT
                  </Button>
                  <Button type="button" variant="outline" onClick={zapiszWTalkToFarm} disabled={!gotoweDoEksportu}
                    className="col-span-2 h-11 border-primary/60 text-primary">
                    <ExternalLink aria-hidden="true" />
                    Zapisz w TalkToFarm
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {gotoweDoEksportu
                    ? OPIS_TALKTOFARM
                    : 'Pobierzesz i wyślesz recepturę, gdy wybierzesz okres, a udziały złożą się na 100%.'}
                </p>
              </Sekcja>

              <PodlaczWSwoimCzacie sciezka="/kalkulator-pasz" />

              <section className="px-1 text-sm text-muted-foreground">
                <h2 className="mb-2.5 text-lg text-foreground">Dobrze wiedzieć</h2>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Info size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>Po wybraniu składnika z listy wartości odżywcze uzupełnią się same.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>
                      Dobór trzyma się zalecanych udziałów surowców dla gatunku i wieku ptaków (np. jęczmień u młodych do 10%, groch i bobik mniej u piskląt). Własne granice ustawisz w „Skład i limity” przy składniku; po przekroczeniu zalecenia pokażę ostrzeżenie.{' '}
                      <Link to="/pasze/udzial-surowcow" className="underline">Skąd te granice</Link>
                    </span>
                  </li>
                </ul>
              </section>
            </div>
          </div>

          <div className="mt-8 text-center">
            <ReactionButton contentId="kalkulator-pasz" contentType="tool" />
          </div>
        </div>
      </div>

      {/* Pasek z wynikiem na dole ekranu, poniżej 1280 px (wyżej wynik stoi obok). */}
      {pasekWidoczny && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-foreground text-background shadow-[0_-4px_16px_rgba(0,0,0,0.15)] xl:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
            <div className="min-w-0 flex-1 leading-tight">
              <div className="font-bold tabular-nums">
                {liczbaPL(sumaProcentow, 1)}%{koszt > 0 && ` · ${liczbaPL(koszt, 2)} zł/kg`}
              </div>
              <div className="truncate text-sm opacity-80">
                {!aktualnaNorma
                  ? 'wybierz okres w kroku 1'
                  : !mieszankaGotowa
                    ? brakDo100 > 0 ? `brakuje ${liczbaPL(brakDo100, 1)}% do 100%` : `za dużo o ${liczbaPL(-brakDo100, 1)}%`
                    : pozaNorma > 0
                      ? `${pozaNorma} ${odmiana(pozaNorma, ['parametr', 'parametry', 'parametrów'])} poza normą`
                      : 'wszystko w normie'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => wynikRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-md border border-background/60 px-3.5 font-semibold hover:bg-background/10"
            >
              Wynik
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Zapasowe okno eksportu: gdy przeglądarka nie pozwoli pobrać pliku. */}
      {pokazModalEksport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-6 text-card-foreground">
            <h3 className="mb-4 text-xl font-bold">Eksport {eksportTyp.toUpperCase()}</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Skopiuj poniższą treść i zapisz w pliku .{eksportTyp}
            </p>
            <textarea
              value={eksportTresc}
              readOnly
              className="h-96 w-full rounded-lg border border-input bg-background p-3 font-mono text-sm"
              onClick={(e) => e.currentTarget.select()}
            />
            <div className="mt-4 flex gap-3">
              <Button
                type="button"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(eksportTresc)
                    .then(() => {
                      setSkopiowano(true);
                      zdarzenieMieszankaEksport('drob', eksportTyp);
                    });
                }}
              >
                {skopiowano ? 'Skopiowano' : 'Kopiuj do schowka'}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setPokazModalEksport(false)}>
                Zamknij
              </Button>
            </div>
          </div>
        </div>
      )}

      <ZglosProduktDialog
        otwarty={zgloszenie !== null}
        onZamknij={() => setZgloszenie(null)}
        produkty={produktyDoPoprawki}
        poprawkaDo={zgloszenie?.poprawkaDo ?? null}
        nazwaStartowa={zgloszenie?.nazwa ?? ''}
      />

      <BazaDodatkow
        otwarta={bazaDodatkowOtwarta}
        onZamknij={() => setBazaDodatkowOtwarta(false)}
        dodatki={dodatki}
        onWybierz={pokazKarteProduktu}
      />
      <KartaProduktu
        dodatek={kartaProduktu ? dodatkiPoNazwie.get(kartaProduktu) ?? null : null}
        onZamknij={() => setKartaProduktu(null)}
        onDodaj={dodajSkladnikZSugestii}
        onZglosPoprawke={zglosPoprawke}
        koncentrat={kartaProduktu && dodatkiPoNazwie.get(kartaProduktu) && (
          <KoncentratZeZbozemSekcja
            koncentrat={dodatkiPoNazwie.get(kartaProduktu)!}
            pozycje={skladniki}
            baza={bazaUzupelnien}
            norma={aktualnaNorma}
            onWstaw={wstawMieszankeKoncentratu}
          />
        )}
      />

      <Footer />
    </>
  );
};

export default KalkulatorPasz;
