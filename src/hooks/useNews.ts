import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Banner } from '@/types/news';

interface UseNewsResult {
  banners: Banner[];
  loading: boolean;
  error: string | null;
}

/** Ksztalt public/wiadomosci.json — generuje go scripts/wiadomosci-rss.py */
interface PlikWiadomosci {
  wygenerowano: string;
  pozycje: Array<{
    id: string;
    title: string;
    subtitle: string | null;
    imageUrl: string | null;
    linkUrl: string;
    date: string;
    type: 'featured' | 'archive';
    zrodlo: string;
  }>;
}

/**
 * Banery pochodza z DWOCH miejsc i to jest celowe:
 *
 *  1. Supabase — banery redakcyjne, dodawane recznie w panelu admina.
 *     Pomijamy wiersze o source zaczynajacym sie od "rss_": to pozostalosc po
 *     funkcji brzegowej fetch-rss-news, ktora czytala martwe juz adresy i
 *     filtrowala tak luzno, ze wpuszczala traktory i rzepak. Wierszy nie
 *     kasujemy — po prostu przestajemy je pokazywac.
 *
 *  2. /wiadomosci.json — kanaly RSS zebrane lokalnie przez skrypt i wgrane
 *     przez FTP. Plik lezy na wlasnej domenie, wiec nie ma problemu z CORS,
 *     a calosc dziala bez funkcji brzegowej (do ktorej nie mamy dostepu).
 *
 * Gdy pliku nie ma albo jest uszkodzony, zostaja same banery redakcyjne —
 * strona nie moze sie z tego powodu wywalic.
 */
export function useNews(): UseNewsResult {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [wynikSupabase, wynikPliku] = await Promise.allSettled([
          supabase
            .from('news_banners')
            .select('id, title, subtitle, image_url, link_url, date, type, is_published, source')
            .eq('is_published', true)
            // Odsiew MUSI byc po stronie bazy. Przy filtrowaniu dopiero w
            // przegladarce limit zjadaly stare wiersze "rss_*" (jest ich 31,
            // wszystkie swieze), a banery redakcyjne wypadaly poza limit i
            // znikaly ze strony.
            .or('source.is.null,source.not.like.rss%')
            .order('date', { ascending: false })
            .limit(30),
          fetch('/wiadomosci.json', { cache: 'no-cache' }).then((r) => {
            if (!r.ok) throw new Error(`wiadomosci.json: HTTP ${r.status}`);
            return r.json() as Promise<PlikWiadomosci>;
          }),
        ]);

        if (cancelled) return;

        const redakcyjne: Banner[] =
          wynikSupabase.status === 'fulfilled' && !wynikSupabase.value.error
            ? (wynikSupabase.value.data ?? [])
                .filter((row: any) => !String(row.source ?? '').startsWith('rss_'))
                .map((row: any) => ({
                  id: row.id,
                  title: row.title,
                  subtitle: row.subtitle,
                  imageUrl: row.image_url,
                  linkUrl: row.link_url,
                  date: row.date,
                  type: row.type,
                }))
            : [];

        // Blad zapytania przychodzi jako OBIEKT, nie wyjatek — bez tego loga
        // zle zapytanie po cichu dawalo pusta liste i banery redakcyjne
        // znikaly bez sladu w konsoli.
        if (wynikSupabase.status === 'rejected') {
          console.error('[useNews] Supabase odrzucony:', wynikSupabase.reason);
        } else if (wynikSupabase.value.error) {
          console.error('[useNews] Supabase blad zapytania:', wynikSupabase.value.error);
        }

        const zRss: Banner[] =
          wynikPliku.status === 'fulfilled'
            ? (wynikPliku.value.pozycje ?? []).map((p) => ({
                id: p.id,
                title: p.title,
                subtitle: p.subtitle,
                imageUrl: p.imageUrl,
                linkUrl: p.linkUrl,
                date: p.date,
                type: p.type,
              }))
            : [];

        if (wynikPliku.status === 'rejected') {
          console.error('[useNews] wiadomosci.json', wynikPliku.reason);
        }

        // Banery redakcyjne przekazujemy W CALOSCI, a przycinamy tylko strone
        // RSS. Wczesniej bylo odwrotnie: calosc szla przez sort po dacie i
        // slice(0, 24), wiec 31 swiezych wpisow RSS spychalo starsze banery
        // redakcyjne poza limit i rotator w ogole ich nie widzial.
        // O kolejnosci decyduje BannerRotator (3 wyroznione + 3 archiwalne).
        const widziane = new Set<string>();
        const polaczone: Banner[] = [];
        for (const b of [...redakcyjne, ...zRss.slice(0, 20)]) {
          if (!b.linkUrl || widziane.has(b.linkUrl)) continue;
          widziane.add(b.linkUrl);
          polaczone.push(b);
        }

        if (!polaczone.length && wynikSupabase.status === 'rejected') {
          throw new Error('Nie udalo sie pobrac zadnego zrodla wiadomosci');
        }

        setBanners(polaczone);
      } catch (e: any) {
        if (!cancelled) {
          console.error('[useNews] error', e);
          setError(e.message || 'Błąd pobierania newsów');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { banners, loading, error };
}
