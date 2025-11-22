import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Banner } from '@/types/news';
import styles from './BannerRotator.module.css';

interface BannerRotatorProps {
  banners: Banner[];
  intervalMs?: number;
}

export const BannerRotator: React.FC<BannerRotatorProps> = ({
  banners,
  intervalMs = 6000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  const displayed = useMemo(() => {
    if (!banners || banners.length === 0) return [];

    const sortedByDate = [...banners].sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    const featured = sortedByDate.filter((b) => b.type === 'featured');
    const archive = sortedByDate.filter((b) => b.type === 'archive');

    const topFeatured = featured.slice(0, 3);
    const topArchive = archive.slice(0, 3);

    const combined = [...topFeatured, ...topArchive];
    if (combined.length > 0) return combined;

    return sortedByDate.slice(0, 6);
  }, [banners]);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    if (!displayed.length) return;
    timerRef.current = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayed.length);
    }, intervalMs);
  };

  useEffect(() => {
    startTimer();
    return () => {
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayed.length, intervalMs]);

  if (!displayed.length) return null;

  const handlePrev = () => {
    clearTimer();
    setActiveIndex((prev) =>
      prev === 0 ? displayed.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    clearTimer();
    setActiveIndex((prev) => (prev + 1) % displayed.length);
  };

  return (
    <div
      className={styles.rotator}
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
    >
      {displayed.map((banner, idx) => (
        <a
          key={banner.id}
          href={banner.linkUrl}
          className={`${styles.slide} ${
            idx === activeIndex ? styles.active : ''
          }`}
          style={{
            backgroundImage: banner.imageUrl
              ? `url(${banner.imageUrl})`
              : 'none',
          }}
        >
          <div className={styles.overlay}>
            <div className={styles.content}>
              <h2 className={styles.title}>{banner.title}</h2>
              {banner.subtitle && (
                <p className={styles.subtitle}>{banner.subtitle}</p>
              )}
            </div>
          </div>
        </a>
      ))}

      {displayed.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.navButton} ${styles.prev}`}
            onClick={handlePrev}
            aria-label="Poprzedni news"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.next}`}
            onClick={handleNext}
            aria-label="Następny news"
          >
            ›
          </button>
        </>
      )}

      <div className={styles.dots}>
        {displayed.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={`${styles.dot} ${
              idx === activeIndex ? styles.dotActive : ''
            }`}
            onClick={() => {
              clearTimer();
              setActiveIndex(idx);
            }}
            aria-label={`Przejdź do slajdu ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
