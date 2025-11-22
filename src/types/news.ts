export type BannerType = 'featured' | 'archive';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  linkUrl: string;
  date: string; // e.g. '2025-11-20'
  type: BannerType;
}
