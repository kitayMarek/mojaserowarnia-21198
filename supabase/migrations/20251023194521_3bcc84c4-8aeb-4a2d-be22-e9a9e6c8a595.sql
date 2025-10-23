-- Add veterinary number to profiles
ALTER TABLE public.profiles
ADD COLUMN nr_weterynaryjny TEXT;

-- Create products table for product suggestions
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nazwa TEXT NOT NULL,
  jednostka TEXT NOT NULL DEFAULT 'kg',
  ostatnia_cena NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, nazwa)
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Users can view own products"
ON public.products
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
ON public.products
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
ON public.products
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
ON public.products
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for products updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();