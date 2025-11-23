-- Enable required extensions for CRON jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Add source column to news_banners to track where news came from
ALTER TABLE news_banners 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual' 
CHECK (source IN ('manual', 'rss_farmer', 'rss_agropolska', 'rss_portalspozywczy'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_source ON news_banners(source);
CREATE INDEX IF NOT EXISTS idx_news_link_url ON news_banners(link_url);