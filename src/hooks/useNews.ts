import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Banner } from '@/types/news';

interface UseNewsResult {
  banners: Banner[];
  loading: boolean;
  error: string | null;
}

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

        const { data, error } = await supabase
          .from('news_banners')
          .select(
            'id, title, subtitle, image_url, link_url, date, type, is_published'
          )
          .eq('is_published', true)
          .order('date', { ascending: false })
          .limit(12);

        if (error) throw error;
        if (cancelled || !data) return;

        const mapped: Banner[] = data.map((row: any) => ({
          id: row.id,
          title: row.title,
          subtitle: row.subtitle,
          imageUrl: row.image_url,
          linkUrl: row.link_url,
          date: row.date,
          type: row.type,
        }));

        setBanners(mapped);
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
