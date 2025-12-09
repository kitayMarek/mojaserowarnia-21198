import { useMemo, useCallback } from 'react';
import { SkladnikPaszy, NormyZywieniowe } from '@/data/cattleFeedData';

interface OptymalizacjaWynik {
  dawka: { skladnik: SkladnikPaszy; iloscKg: number }[];
  koszt: number;
  spelniaNormy: boolean;
  komunikat: string;
}

interface OgraniczeniaSkladnika {
  skladnik: SkladnikPaszy;
  minKg: number;
  maxKg: number;
  wymagany: boolean;
}

// Prosty algorytm optymalizacji dawki metodą gradientową z ograniczeniami
export function useFeedOptimizer(
  dostepneSkladniki: SkladnikPaszy[],
  normy: NormyZywieniowe,
  typBydla: string
) {
  // Funkcja obliczająca bilans dla danej dawki
  const obliczBilans = useCallback((dawka: { skladnik: SkladnikPaszy; iloscKg: number }[]) => {
    let sm = 0, jpml = 0, jpmo = 0, pb = 0, pbjt = 0, ndf = 0, ca = 0, p = 0, koszt = 0;

    dawka.forEach(({ skladnik, iloscKg }) => {
      const smKg = iloscKg * (skladnik.sm / 100);
      sm += smKg;
      jpml += smKg * skladnik.jpml;
      jpmo += smKg * skladnik.jpmo;
      pb += smKg * skladnik.pb * 10;
      pbjt += smKg * skladnik.pbjt;
      ndf += smKg * (skladnik.ndf / 100);
      ca += smKg * skladnik.ca;
      p += smKg * skladnik.p;
      koszt += iloscKg * skladnik.cenaKg;
    });

    const ndfPercent = sm > 0 ? (ndf / sm) * 100 : 0;
    return { sm, jpml, jpmo, pb, pbjt, ndf: ndfPercent, ca, p, koszt };
  }, []);

  // Funkcja oceny jakości rozwiązania (niższa = lepsza)
  const ocenRozwiazanie = useCallback((
    dawka: { skladnik: SkladnikPaszy; iloscKg: number }[],
    wagaKosztu: number = 1.0
  ) => {
    const bilans = obliczBilans(dawka);
    const energia = typBydla === 'mleczne' ? normy.jpmlMj : normy.jpmoMj;
    const energiaBilans = typBydla === 'mleczne' ? bilans.jpml : bilans.jpmo;

    // Kary za niedotrzymanie norm (kwadratowe)
    let kara = 0;
    
    // Sucha masa - cel 100%
    const smOdch = Math.abs(bilans.sm - normy.smKg) / normy.smKg;
    kara += smOdch * smOdch * 100;

    // Energia - minimum 100%
    if (energia > 0) {
      const energiaOdch = (energiaBilans - energia) / energia;
      if (energiaOdch < 0) kara += energiaOdch * energiaOdch * 200;
      else if (energiaOdch > 0.1) kara += (energiaOdch - 0.1) * (energiaOdch - 0.1) * 50;
    }

    // Białko - minimum 100%
    if (normy.pbG > 0) {
      const pbOdch = (bilans.pb - normy.pbG) / normy.pbG;
      if (pbOdch < 0) kara += pbOdch * pbOdch * 150;
      else if (pbOdch > 0.15) kara += (pbOdch - 0.15) * (pbOdch - 0.15) * 30;
    }

    // PBJT - minimum 100%
    if (normy.pbjtG > 0) {
      const pbjtOdch = (bilans.pbjt - normy.pbjtG) / normy.pbjtG;
      if (pbjtOdch < 0) kara += pbjtOdch * pbjtOdch * 150;
    }

    // NDF - w zakresie
    if (bilans.ndf < normy.ndfMin) {
      kara += Math.pow((normy.ndfMin - bilans.ndf) / 10, 2) * 100;
    } else if (bilans.ndf > normy.ndfMax) {
      kara += Math.pow((bilans.ndf - normy.ndfMax) / 10, 2) * 100;
    }

    // Wapń - minimum 100%
    if (normy.caG > 0) {
      const caOdch = (bilans.ca - normy.caG) / normy.caG;
      if (caOdch < 0) kara += caOdch * caOdch * 100;
    }

    // Fosfor - minimum 100%
    if (normy.pG > 0) {
      const pOdch = (bilans.p - normy.pG) / normy.pG;
      if (pOdch < 0) kara += pOdch * pOdch * 100;
    }

    return kara * 1000 + bilans.koszt * wagaKosztu;
  }, [obliczBilans, normy, typBydla]);

  // Sprawdź czy dawka spełnia normy
  const sprawdzNormy = useCallback((dawka: { skladnik: SkladnikPaszy; iloscKg: number }[]) => {
    const bilans = obliczBilans(dawka);
    const energia = typBydla === 'mleczne' ? normy.jpmlMj : normy.jpmoMj;
    const energiaBilans = typBydla === 'mleczne' ? bilans.jpml : bilans.jpmo;

    const tolerancja = 0.05; // 5% tolerancji

    const smOk = bilans.sm >= normy.smKg * (1 - tolerancja) && bilans.sm <= normy.smKg * 1.15;
    const energiaOk = energiaBilans >= energia * (1 - tolerancja);
    const pbOk = bilans.pb >= normy.pbG * (1 - tolerancja);
    const pbjtOk = bilans.pbjt >= normy.pbjtG * (1 - tolerancja);
    const ndfOk = bilans.ndf >= normy.ndfMin && bilans.ndf <= normy.ndfMax;
    const caOk = bilans.ca >= normy.caG * (1 - tolerancja);
    const pOk = bilans.p >= normy.pG * (1 - tolerancja);

    return smOk && energiaOk && pbOk && pbjtOk && ndfOk && caOk && pOk;
  }, [obliczBilans, normy, typBydla]);

  // Główna funkcja optymalizacji
  const optymalizuj = useCallback((
    ograniczenia: OgraniczeniaSkladnika[],
    iteracje: number = 500
  ): OptymalizacjaWynik => {
    if (ograniczenia.length === 0) {
      return {
        dawka: [],
        koszt: 0,
        spelniaNormy: false,
        komunikat: 'Brak składników do optymalizacji. Dodaj składniki i ustaw ograniczenia.'
      };
    }

    // Inicjalizacja dawki startowej
    let najlepszaDawka = ograniczenia.map(o => ({
      skladnik: o.skladnik,
      iloscKg: o.wymagany ? (o.minKg + o.maxKg) / 2 : o.minKg
    }));

    let najlepszyWynik = ocenRozwiazanie(najlepszaDawka);

    // Algorytm optymalizacji - symulowane wyżarzanie + gradient
    const temperaturaStart = 10;
    const temperaturaKoniec = 0.01;

    for (let iter = 0; iter < iteracje; iter++) {
      const temperatura = temperaturaStart * Math.pow(temperaturaKoniec / temperaturaStart, iter / iteracje);
      
      // Generuj sąsiednie rozwiązanie
      const nowaDawka = najlepszaDawka.map((d, idx) => {
        const ogr = ograniczenia[idx];
        const zakres = ogr.maxKg - ogr.minKg;
        const zmiana = (Math.random() - 0.5) * zakres * temperatura * 0.3;
        const nowaIlosc = Math.max(ogr.minKg, Math.min(ogr.maxKg, d.iloscKg + zmiana));
        return { ...d, iloscKg: nowaIlosc };
      });

      const nowyWynik = ocenRozwiazanie(nowaDawka);

      // Akceptuj lepsze rozwiązanie lub gorsze z pewnym prawdopodobieństwem
      const delta = nowyWynik - najlepszyWynik;
      if (delta < 0 || Math.random() < Math.exp(-delta / (temperatura * 100))) {
        najlepszaDawka = nowaDawka;
        najlepszyWynik = nowyWynik;
      }
    }

    // Drobna optymalizacja lokalna - gradient descent
    const krok = 0.1;
    for (let iter = 0; iter < 100; iter++) {
      let zmieniono = false;
      
      for (let i = 0; i < najlepszaDawka.length; i++) {
        const ogr = ograniczenia[i];
        
        // Próba zwiększenia
        if (najlepszaDawka[i].iloscKg + krok <= ogr.maxKg) {
          const testDawka = [...najlepszaDawka];
          testDawka[i] = { ...testDawka[i], iloscKg: testDawka[i].iloscKg + krok };
          const testWynik = ocenRozwiazanie(testDawka);
          if (testWynik < najlepszyWynik) {
            najlepszaDawka = testDawka;
            najlepszyWynik = testWynik;
            zmieniono = true;
          }
        }
        
        // Próba zmniejszenia
        if (najlepszaDawka[i].iloscKg - krok >= ogr.minKg) {
          const testDawka = [...najlepszaDawka];
          testDawka[i] = { ...testDawka[i], iloscKg: testDawka[i].iloscKg - krok };
          const testWynik = ocenRozwiazanie(testDawka);
          if (testWynik < najlepszyWynik) {
            najlepszaDawka = testDawka;
            najlepszyWynik = testWynik;
            zmieniono = true;
          }
        }
      }
      
      if (!zmieniono) break;
    }

    // Zaokrąglij ilości do 0.1 kg
    najlepszaDawka = najlepszaDawka.map(d => ({
      ...d,
      iloscKg: Math.round(d.iloscKg * 10) / 10
    })).filter(d => d.iloscKg > 0);

    const bilans = obliczBilans(najlepszaDawka);
    const spelniaNormy = sprawdzNormy(najlepszaDawka);

    let komunikat = '';
    if (spelniaNormy) {
      komunikat = `✅ Optymalizacja zakończona. Koszt: ${bilans.koszt.toFixed(2)} zł/dzień`;
    } else {
      komunikat = `⚠️ Nie udało się w pełni spełnić norm. Rozważ dodanie innych składników lub rozszerzenie zakresów.`;
    }

    return {
      dawka: najlepszaDawka,
      koszt: bilans.koszt,
      spelniaNormy,
      komunikat
    };
  }, [ocenRozwiazanie, obliczBilans, sprawdzNormy]);

  return {
    optymalizuj,
    obliczBilans,
    sprawdzNormy
  };
}

export type { OptymalizacjaWynik, OgraniczeniaSkladnika };
