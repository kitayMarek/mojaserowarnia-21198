import React from 'react';
import { useNews } from '@/hooks/useNews';
import { BannerRotator } from './BannerRotator';

export const BannerSection: React.FC = () => {
  const { banners, loading, error } = useNews();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error('[BannerSection] error', error);
    return null;
  }

  if (!banners.length) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Brak aktualności do wyświetlenia</p>
      </div>
    );
  }

  return (
    <section aria-label="Aktualności dla serowarów">
      <BannerRotator banners={banners} />
    </section>
  );
};
