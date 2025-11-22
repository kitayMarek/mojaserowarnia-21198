-- Create news_banners table for dynamic news management
CREATE TABLE public.news_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('featured', 'archive')),
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.news_banners ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published banners
CREATE POLICY "Anyone can view published banners"
ON public.news_banners
FOR SELECT
USING (is_published = true);

-- Policy: Admins can manage all banners
CREATE POLICY "Admins can manage all banners"
ON public.news_banners
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_news_banners_updated_at
BEFORE UPDATE ON public.news_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_news_banners_published_date ON public.news_banners(is_published, date DESC);
CREATE INDEX idx_news_banners_type ON public.news_banners(type);