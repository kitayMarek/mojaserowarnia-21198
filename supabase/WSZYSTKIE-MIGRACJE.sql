-- ============================================================
-- WSZYSTKIE MIGRACJE mojaserowarnia.pl, sklejone w kolejnosci dat.
-- Wygenerowane automatycznie - nie edytuj tego pliku recznie,
-- zrodlem sa pliki w supabase/migrations/.
-- Plikow: 16
-- ============================================================


-- ---------- [1/16] 20251105202707_remix_batch_8_migrations.sql ----------

-- Migration: 20251023190109
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  firma_nazwa TEXT,
  nip TEXT,
  adres TEXT,
  telefon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create sales_records table
CREATE TABLE public.sales_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_sprzedazy DATE NOT NULL,
  kwota_przychodu DECIMAL(10,2) NOT NULL CHECK (kwota_przychodu > 0),
  rodzaj_zywnosci TEXT NOT NULL,
  ilosc DECIMAL(10,2) NOT NULL CHECK (ilosc > 0),
  jednostka TEXT NOT NULL,
  odbiorca_typ TEXT NOT NULL CHECK (odbiorca_typ IN ('konsument końcowy', 'zakład detaliczny')),
  odbiorca_nazwa TEXT,
  numer_rachunku TEXT,
  uwagi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on sales_records
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sales_records
CREATE POLICY "Users can view own sales records"
  ON public.sales_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales records"
  ON public.sales_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales records"
  ON public.sales_records
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales records"
  ON public.sales_records
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numer_rachunku TEXT NOT NULL,
  data_wystawienia DATE NOT NULL,
  nabywca_nazwa TEXT NOT NULL,
  nabywca_adres TEXT NOT NULL,
  nabywca_nip TEXT,
  pozycje JSONB NOT NULL,
  kwota_netto DECIMAL(10,2) NOT NULL CHECK (kwota_netto >= 0),
  kwota_brutto DECIMAL(10,2) NOT NULL CHECK (kwota_brutto >= 0),
  uwagi TEXT,
  wydrukowany BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view own invoices"
  ON public.invoices
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices"
  ON public.invoices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON public.invoices
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices"
  ON public.invoices
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to generate invoice number (RHD/YYYY/MM/XXXX)
CREATE OR REPLACE FUNCTION public.generate_invoice_number(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  month_part TEXT;
  sequence_number INTEGER;
  invoice_number TEXT;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  month_part := TO_CHAR(CURRENT_DATE, 'MM');
  
  -- Get the next sequence number for this user, year, and month
  SELECT COALESCE(MAX(CAST(SUBSTRING(numer_rachunku FROM 'RHD/\d{4}/\d{2}/(\d{4})') AS INTEGER)), 0) + 1
  INTO sequence_number
  FROM public.invoices
  WHERE user_id = user_uuid
    AND numer_rachunku LIKE 'RHD/' || year_part || '/' || month_part || '/%';
  
  invoice_number := 'RHD/' || year_part || '/' || month_part || '/' || LPAD(sequence_number::TEXT, 4, '0');
  
  RETURN invoice_number;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_sales_records_user_id ON public.sales_records(user_id);
CREATE INDEX idx_sales_records_data_sprzedazy ON public.sales_records(data_sprzedazy);
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_numer_rachunku ON public.invoices(numer_rachunku);

-- Migration: 20251023190256
-- Fix security warning: set search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Migration: 20251023194518
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

-- Migration: 20251027180851
-- Create audit log table for cultures
CREATE TABLE IF NOT EXISTS public.culture_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  culture_name TEXT NOT NULL,
  culture_shop TEXT NOT NULL,
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by TEXT,
  change_source TEXT DEFAULT 'manual',
  notes TEXT
);

-- Add index for faster queries
CREATE INDEX idx_culture_audit_log_culture ON public.culture_audit_log(culture_name, culture_shop);
CREATE INDEX idx_culture_audit_log_changed_at ON public.culture_audit_log(changed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.culture_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view audit logs (read-only for transparency)
CREATE POLICY "Anyone can view audit logs"
ON public.culture_audit_log
FOR SELECT
USING (true);

-- Only authenticated admins can insert audit logs (for future admin panel)
CREATE POLICY "Admins can insert audit logs"
ON public.culture_audit_log
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

COMMENT ON TABLE public.culture_audit_log IS 'Audit trail for culture database changes - tracks what was changed, when, and by whom';
COMMENT ON COLUMN public.culture_audit_log.culture_name IS 'Name of the culture that was modified';
COMMENT ON COLUMN public.culture_audit_log.culture_shop IS 'Shop/source of the culture';
COMMENT ON COLUMN public.culture_audit_log.field_changed IS 'Which field was modified (e.g., price, composition, temperature)';
COMMENT ON COLUMN public.culture_audit_log.old_value IS 'Previous value before the change';
COMMENT ON COLUMN public.culture_audit_log.new_value IS 'New value after the change';
COMMENT ON COLUMN public.culture_audit_log.change_source IS 'How the change was made (manual, automated_scraper, user_report, etc.)';
COMMENT ON COLUMN public.culture_audit_log.notes IS 'Additional context about the change';

-- Migration: 20251027182537
-- Drop insecure RLS policies on culture_audit_log
DROP POLICY IF EXISTS "Anyone can view audit logs" ON public.culture_audit_log;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.culture_audit_log;

-- Audit log should only be managed by service role (backend/edge functions)
-- No policies = only service role can access
-- This prevents public exposure and unauthorized insertions;

-- Migration: 20251027190449
-- Add RLS policies for culture_audit_log table
-- Audit logs should be readable by all authenticated users but not modifiable

-- Allow all authenticated users to read audit logs
CREATE POLICY "Authenticated users can view audit logs"
ON public.culture_audit_log
FOR SELECT
TO authenticated
USING (true);

-- Prevent direct modifications by users
-- Only system/admin functions should be able to insert audit records
CREATE POLICY "Only service role can insert audit logs"
ON public.culture_audit_log
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Only service role can update audit logs"
ON public.culture_audit_log
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Only service role can delete audit logs"
ON public.culture_audit_log
FOR DELETE
TO authenticated
USING (false);

-- Migration: 20251027190735
-- Add user_id column to culture_audit_log table
ALTER TABLE public.culture_audit_log
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_culture_audit_log_user_id ON public.culture_audit_log(user_id);

-- Drop the old permissive policy
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON public.culture_audit_log;

-- Create new restrictive policy - users can only see their own audit logs
CREATE POLICY "Users can view own audit logs"
ON public.culture_audit_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Migration: 20251028173802
-- Tabela dla reakcji (łapka/serce)
CREATE TABLE reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL,
  content_id text NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'love')),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, content_type, content_id)
);

-- Indeksy dla wydajności
CREATE INDEX idx_reactions_content ON reactions(content_type, content_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
CREATE INDEX idx_reactions_type ON reactions(reaction_type);

-- RLS policies
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Użytkownicy mogą dodawać własne reakcje
CREATE POLICY "Users can insert own reactions"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Użytkownicy mogą aktualizować własne reakcje
CREATE POLICY "Users can update own reactions"
  ON reactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Użytkownicy mogą usuwać własne reakcje
CREATE POLICY "Users can delete own reactions"
  ON reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Wszyscy mogą czytać reakcje (publiczne)
CREATE POLICY "Anyone can read reactions"
  ON reactions FOR SELECT
  TO public
  USING (true);

-- Widok agregujący statystyki z punktacją
CREATE VIEW reactions_stats AS
SELECT 
  content_type,
  content_id,
  COUNT(CASE WHEN reaction_type = 'like' THEN 1 END) as likes_count,
  COUNT(CASE WHEN reaction_type = 'love' THEN 1 END) as loves_count,
  (COUNT(CASE WHEN reaction_type = 'like' THEN 1 END) * 1 + 
   COUNT(CASE WHEN reaction_type = 'love' THEN 1 END) * 2) as total_points
FROM reactions
GROUP BY content_type, content_id;

-- Publiczny dostęp do statystyk
GRANT SELECT ON reactions_stats TO anon, authenticated;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;


-- ---------- [2/16] 20251116010112_597c6583-c368-40f1-b5ec-f7d2148c2151.sql ----------
-- Create table to track contact form submissions for rate limiting
CREATE TABLE IF NOT EXISTS public.contact_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_contact_attempts_email_created 
ON public.contact_attempts(email, created_at DESC);

-- Enable RLS
ALTER TABLE public.contact_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow edge functions to insert and select
CREATE POLICY "Allow service role to manage contact attempts"
ON public.contact_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create function to automatically clean up old attempts (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_contact_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.contact_attempts
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Create trigger to clean up on insert (lightweight approach)
CREATE OR REPLACE FUNCTION public.trigger_cleanup_contact_attempts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only clean up occasionally (10% of the time) to avoid overhead
  IF random() < 0.1 THEN
    PERFORM public.cleanup_old_contact_attempts();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_contact_attempts_trigger
AFTER INSERT ON public.contact_attempts
FOR EACH STATEMENT
EXECUTE FUNCTION public.trigger_cleanup_contact_attempts();


-- ---------- [3/16] 20251117055852_819c2512-c3d4-49d9-a9cb-ff1a3b19e8df.sql ----------
-- Fix security warnings by setting search_path on functions
-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS cleanup_contact_attempts_trigger ON public.contact_attempts;

-- Then drop the functions
DROP FUNCTION IF EXISTS public.trigger_cleanup_contact_attempts();
DROP FUNCTION IF EXISTS public.cleanup_old_contact_attempts();

-- Recreate with proper search_path set
CREATE OR REPLACE FUNCTION public.cleanup_old_contact_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.contact_attempts
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_cleanup_contact_attempts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only clean up occasionally (10% of the time) to avoid overhead
  IF random() < 0.1 THEN
    PERFORM public.cleanup_old_contact_attempts();
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER cleanup_contact_attempts_trigger
AFTER INSERT ON public.contact_attempts
FOR EACH STATEMENT
EXECUTE FUNCTION public.trigger_cleanup_contact_attempts();


-- ---------- [4/16] 20251121074144_9cdf5419-31da-48f9-a207-ccb82a1b45d9.sql ----------
-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add marketing_consent to profiles
ALTER TABLE public.profiles
ADD COLUMN marketing_consent BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN marketing_consent_date TIMESTAMP WITH TIME ZONE;

-- Create trigger to automatically assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Function for admins to get all users with their roles
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  firma_nazwa TEXT,
  nip TEXT,
  adres TEXT,
  telefon TEXT,
  marketing_consent BOOLEAN,
  marketing_consent_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  roles TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.firma_nazwa,
    p.nip,
    p.adres,
    p.telefon,
    p.marketing_consent,
    p.marketing_consent_date,
    p.created_at,
    ARRAY_AGG(ur.role::TEXT) as roles
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  GROUP BY p.id, p.email, p.firma_nazwa, p.nip, p.adres, p.telefon, 
           p.marketing_consent, p.marketing_consent_date, p.created_at
  ORDER BY p.created_at DESC;
END;
$$;


-- ---------- [5/16] 20251122165711_7e2c3e8c-cd0a-45d3-aa4f-76224b401521.sql ----------
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


-- ---------- [6/16] 20251123043351_c25905fa-f4c6-423f-ab7f-107c86161f93.sql ----------
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


-- ---------- [7/16] 20260519100128_a9aaec1d-b323-437c-81ef-9c98375f2a1a.sql ----------
-- ============================================================
-- MIGRACJA: Kultury bakteryjne → Supabase
-- ============================================================

CREATE TABLE public.cultures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  composition     TEXT,
  application     TEXT,
  temperature     TEXT,
  type            TEXT,
  shop            TEXT,
  shop_url        TEXT,
  product_url     TEXT,
  price_label     TEXT,
  price_numeric   DECIMAL(10,2),
  last_changed    TEXT,
  last_checked    DATE,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cultures_type  ON public.cultures(type);
CREATE INDEX idx_cultures_shop  ON public.cultures(shop);
CREATE INDEX idx_cultures_name  ON public.cultures(name);
CREATE INDEX idx_cultures_price ON public.cultures(price_numeric);

CREATE INDEX idx_cultures_fts ON public.cultures
  USING gin(
    to_tsvector('simple',
      coalesce(name,'') || ' ' ||
      coalesce(composition,'') || ' ' ||
      coalesce(application,'')
    )
  );

ALTER TABLE public.cultures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kultury widoczne dla wszystkich"
  ON public.cultures FOR SELECT
  USING (is_active = true);

CREATE POLICY "Tylko admin moze dodawac kultury"
  ON public.cultures FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Tylko admin moze edytowac kultury"
  ON public.cultures FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


CREATE TABLE public.price_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  culture_id    UUID NOT NULL REFERENCES public.cultures(id) ON DELETE CASCADE,
  price_label   TEXT NOT NULL,
  price_numeric DECIMAL(10,2),
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  source        TEXT DEFAULT 'manual'
);

CREATE INDEX idx_price_history_culture ON public.price_history(culture_id, recorded_at DESC);

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Historia cen widoczna dla wszystkich"
  ON public.price_history FOR SELECT USING (true);

CREATE POLICY "Tylko admin moze dodawac historie cen"
  ON public.price_history FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


CREATE TABLE public.user_culture_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_culture_list_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id    UUID NOT NULL REFERENCES public.user_culture_lists(id) ON DELETE CASCADE,
  culture_id UUID NOT NULL REFERENCES public.cultures(id) ON DELETE CASCADE,
  notes      TEXT,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(list_id, culture_id)
);

ALTER TABLE public.user_culture_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_culture_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Uzytkownik widzi tylko swoje listy"
  ON public.user_culture_lists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Uzytkownik widzi tylko swoje pozycje"
  ON public.user_culture_list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_culture_lists
      WHERE id = list_id AND user_id = auth.uid()
    )
  );


CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_cultures_updated_at
  BEFORE UPDATE ON public.cultures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- SEED: 147 kultur
INSERT INTO public.cultures
  (name, composition, application, temperature, type, shop, shop_url, product_url, price_label, price_numeric, last_changed, last_checked)
VALUES
  ('Choozit GEO 17', 'Geotrichum candidum', 'Brie, Camembert, Fromage, sery kwasowo-podpuszczkowe', '25-35°C', 'pleśniowe', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/25-34--choozit-geo-17.html', '36,00 zł', 36.00, NULL, NULL),
  ('Choozit GEO 13', 'Geotrichum candidum (szczep 13)', 'Camembert, Brie, Fromage de chèvre, kwasowo-podpuszczkowe', '34-38°C', 'pleśniowe', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/24-33-choozit-geo-13.html', '39,00 zł', 39.00, NULL, NULL),
  ('Camembert Mix', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar. diacetylactis, Leuconostoc mesenteroides subsp. cremoris, Streptococcus thermophilus', 'Sery miękkie i pleśniowe (Camembert, Brie, Roquefort, Gorgonzola, Stilton)', '34-38°C', 'mezofilno-termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/4-1-camembert-mix.html', '24,00 zł', 24.00, NULL, NULL),
  ('Choozit Alp', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Streptococcus thermophilus, Lactobacillus helveticus, Lactobacillus lactis', 'Sery górskie, aromat i smak sera', 'do 48°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/6-4-choozit-alp.html', '59,00 zł, 50DCU', 59.00, NULL, NULL),
  ('Choozit FT 001', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Streptococcus thermophilus, Lactobacillus delbrueckii subsp. lactis, Lactobacillus delbrueckii subsp. bulgaricus', 'Sery typu Feta, sery miękkie', '34-38°C', 'mezofilno-termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/7-6-choozit-ft-001.html', '36,00 zł', 36.00, NULL, NULL),
  ('Choozit MA 4001', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris', 'Sery twarde i półtwarde (Cheddar, Gouda, Edam)', '20-32°C', 'mezofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/8-7-choozit-ma-4001.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit MA 4002', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar. diacetylactis', 'Sery twarde i półtwarde, Gouda, Edam', '20-32°C', 'mezofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/9-8-choozit-ma-4002.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit MM 100', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar. diacetylactis, Leuconostoc mesenteroides subsp. cremoris', 'Sery miękkie, twaróg, fromage frais', '20-28°C', 'mezofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/10-9-choozit-mm-100.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit RA 22', 'Lactococcus lactis subsp. lactis, Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Camembert, Brie i inne sery miękkie', '30-40°C', 'mezofilno-termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/11-10-choozit-ra-22.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit THERMO B', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Mozzarella, jogurt, sery włoskie', '37-45°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/12-11-choozit-thermo-b.html', '36,00 zł', 36.00, NULL, NULL),
  ('Choozit FLORE 12', 'Brevibacterium linens', 'Sery myte, sery czerwone (Limburger, Munster)', '15-22°C', 'aromatyzujące', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/13-12-choozit-flore-12.html', '45,00 zł', 45.00, NULL, NULL),
  ('Choozit PC', 'Penicillium camemberti', 'Sery pleśniowe białe (Camembert, Brie)', '10-18°C', 'pleśniowe', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/15-14-choozit-pc.html', '29,00 zł', 29.00, NULL, NULL),
  ('Choozit PR', 'Penicillium roqueforti', 'Sery pleśniowe niebieskie (Gorgonzola, Roquefort, Stilton)', '10-18°C', 'pleśniowe', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/16-15-choozit-pr.html', '29,00 zł', 29.00, NULL, NULL),
  ('Choozit TA 050', 'Streptococcus thermophilus', 'Mozzarella, Ricotta, sery włoskie', '40-45°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/17-16-choozit-ta-050.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit TA 61', 'Streptococcus thermophilus, Lactobacillus helveticus', 'Sery twarde typu szwajcarskiego, Parmezan', '38-48°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/18-17-choozit-ta-61.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit LH 100', 'Lactobacillus helveticus', 'Sery twarde, aromat, Parmezan', '38-48°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/19-18-choozit-lh-100.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit LD', 'Lactobacillus delbrueckii subsp. lactis', 'Sery twarde, Cheddar, aromtat', '38-45°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/20-19-choozit-ld.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit PLA', 'Lactobacillus plantarum', 'Sery twarde, ochrona przed dzikimi drożdżami', '15-35°C', 'ochronne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/21-20-choozit-pla.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit PAL 4', 'Propionibacterium freudenreichii subsp. shermanii', 'Sery dziurkaste (Emmental, Gouda z dziurkami)', '18-25°C', 'propionowe', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-aromatyczne-i-dodatkowe/22-21-choozit-pal-4.html', '59,00 zł', 59.00, NULL, NULL),
  ('Choozit TM 81', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. lactis, Lactobacillus helveticus', 'Sery twarde typu włoskiego i szwajcarskiego', '38-48°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/23-22-choozit-tm-81.html', '39,00 zł', 39.00, NULL, NULL),
  ('Choozit FLORA DANICA', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar. diacetylactis, Leuconostoc mesenteroides subsp. cremoris', 'Sery skandynawskie, Havarti, Danbo', '20-30°C', 'mezofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', 'https://sklep.wanczykowka.com/kultury-bakterii-podstawowe/flora-danica.html', '55,00 zł', 55.00, NULL, NULL),
  ('Choozit HCA', 'Hafnia alvei', 'Sery półtwarde, Tilsit, aromat', '15-22°C', 'aromatyzujące', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Choozit BL 1', 'Brevibacterium linens', 'Sery myte, powierzchniowe smary serów', '15-20°C', 'aromatyzujące', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Choozit TR 1', 'Torula (Debaryomyces hansenii)', 'Sery półtwarde, Tilsit, Limburger', '15-20°C', 'aromatyzujące', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '39,00 zł', 39.00, NULL, NULL),
  ('Choozit CB 2', 'Candida boidinii', 'Sery myte, Munster, Reblochon', '15-20°C', 'aromatyzujące', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '39,00 zł', 39.00, NULL, NULL),
  ('Kefir Mix', 'Lactococcus lactis, Lactobacillus kefiri, drożdże kefirowe', 'Kefir tradycyjny', '20-25°C', 'kefir', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '24,00 zł', 24.00, NULL, NULL),
  ('Jogurt 1', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Jogurt klasyczny', '40-45°C', 'jogurtowe', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '19,00 zł', 19.00, NULL, NULL),
  ('Acidophilus', 'Lactobacillus acidophilus', 'Mleko acidofilne, sery probiotyczne', '37-40°C', 'probiotyczne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '24,00 zł', 24.00, NULL, NULL),
  ('Alpha', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris', 'Sery miękkie, twaróg, quark', '20-30°C', 'mezofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/alpha', '18,00 zł', 18.00, NULL, NULL),
  ('Beta', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Leuconostoc mesenteroides', 'Sery miękkie z aromatem', '20-30°C', 'mezofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/beta', '18,00 zł', 18.00, NULL, NULL),
  ('Gamma', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Mozzarella, jogurt, sery włoskie', '38-45°C', 'termofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/gamma', '18,00 zł', 18.00, NULL, NULL),
  ('Delta', 'Streptococcus thermophilus, Lactobacillus helveticus, Lactobacillus delbrueckii subsp. lactis', 'Sery twarde, Parmezan, Grana', '40-50°C', 'termofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/delta', '18,00 zł', 18.00, NULL, NULL),
  ('Epsilon', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar. diacetylactis, Leuconostoc mesenteroides subsp. cremoris', 'Sery skandynawskie, Havarti, Butterkäse', '20-28°C', 'mezofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/epsilon', '22,00 zł', 22.00, NULL, NULL),
  ('Flora Danica - Lactic', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar. diacetylactis, Leuconostoc mesenteroides subsp. cremoris', 'Sery skandynawskie, Havarti, Esrom', '20-28°C', 'mezofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/flora-danica', '32,00 zł', 32.00, NULL, NULL),
  ('Penicillium candidum - Lactic', 'Penicillium camemberti', 'Camembert, Brie, sery pleśniowe białe', '12-18°C', 'pleśniowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/penicillium-candidum', '22,00 zł', 22.00, NULL, NULL),
  ('Penicillium roqueforti - Lactic', 'Penicillium roqueforti', 'Gorgonzola, Roquefort, Stilton, Danablu', '10-15°C', 'pleśniowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/penicillium-roqueforti', '22,00 zł', 22.00, NULL, NULL),
  ('Geotrichum candidum - Lactic', 'Geotrichum candidum', 'Camembert, Brie, sery świeże', '18-25°C', 'pleśniowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/geotrichum-candidum', '22,00 zł', 22.00, NULL, NULL),
  ('Brevibacterium linens - Lactic', 'Brevibacterium linens', 'Sery myte, sery smażone, Limburger', '15-20°C', 'aromatyzujące', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/brevibacterium-linens', '28,00 zł', 28.00, NULL, NULL),
  ('Propionibacterium - Lactic', 'Propionibacterium freudenreichii', 'Sery dziurkaste, Emmental', '18-24°C', 'propionowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/propionibacterium', '35,00 zł', 35.00, NULL, NULL),
  ('Kefir - Lactic', 'Lactococcus lactis, Leuconostoc, Lactobacillus kefiri, Kluyveromyces marxianus', 'Kefir mleczny', '20-25°C', 'kefir', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/kefir', '18,00 zł', 18.00, NULL, NULL),
  ('Jogurt - Lactic', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Jogurt naturalny', '40-45°C', 'jogurtowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/jogurt', '15,00 zł', 15.00, NULL, NULL),
  ('Probiotyk L. acidophilus', 'Lactobacillus acidophilus', 'Mleko acidofilne, produkty probiotyczne', '37°C', 'probiotyczne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/lactobacillus-acidophilus', '22,00 zł', 22.00, NULL, NULL),
  ('Danisco CHOOZIT MA11', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris', 'Cheddar, Colby, Gouda, sery twarde', '22-32°C', 'mezofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Danisco CHOOZIT TA 60', 'Streptococcus thermophilus', 'Mozzarella, sery włoskie, Provolone', '38-45°C', 'termofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Danisco CHOOZIT TA 45', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. lactis', 'Mozzarella wysoko-wilgotna, Pizza cheese', '38-45°C', 'termofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '48,00 zł', 48.00, NULL, NULL),
  ('Danisco CHOOZIT SWING', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Streptococcus thermophilus', 'Elastyczne zastosowanie mezo-termofilne', '28-38°C', 'mezofilno-termofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '52,00 zł', 52.00, NULL, NULL),
  ('Chr. Hansen Flora Danica', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Leuconostoc, Lactococcus diacetylactis', 'Sery skandynawskie, masło, śmietana', '18-25°C', 'mezofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '65,00 zł', 65.00, NULL, NULL),
  ('Chr. Hansen R-704', 'Streptococcus thermophilus', 'Ricotta, Mozzarella, sery świeże', '38-45°C', 'termofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '55,00 zł', 55.00, NULL, NULL),
  ('Chr. Hansen FD-DVS Kefir', 'Lactococcus lactis, Leuconostoc, Lactobacillus, Kluyveromyces', 'Kefir mleczny DVS', '22-25°C', 'kefir', 'GAP Poland', 'https://gappoland.pl/', NULL, '75,00 zł', 75.00, NULL, NULL),
  ('Danisco YC-X11', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Jogurt kremowy, jogurt grecki', '42-45°C', 'jogurtowe', 'GAP Poland', 'https://gappoland.pl/', NULL, '65,00 zł', 65.00, NULL, NULL),
  ('Mezofilna typ B', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris', 'Gouda, Edam, sery holenderskie', '22-30°C', 'mezofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '12,00 zł', 12.00, NULL, NULL),
  ('Mezofilna typ O', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactococcus lactis subsp. lactis biovar. diacetylactis', 'Gouda, Edamer, twaróg', '22-30°C', 'mezofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '12,00 zł', 12.00, NULL, NULL),
  ('Mezofilna typ BD', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Leuconostoc mesenteroides', 'Sery holenderskie, Havarti, Tilsit', '22-30°C', 'mezofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '12,00 zł', 12.00, NULL, NULL),
  ('Termofilna ST', 'Streptococcus thermophilus', 'Mozzarella, Ricotta, jogurt', '38-45°C', 'termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '12,00 zł', 12.00, NULL, NULL),
  ('Termofilna LB', 'Lactobacillus delbrueckii subsp. bulgaricus', 'Jogurt, Sery bułgarskie', '42-45°C', 'termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '12,00 zł', 12.00, NULL, NULL),
  ('Mix Termofilna', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Jogurt, Mozzarella, sery włoskie', '38-45°C', 'termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '14,00 zł', 14.00, NULL, NULL),
  ('Kultura Camembert', 'Penicillium camemberti, Geotrichum candidum, mezofilne bakterie mlekowe', 'Camembert domowy', '25-35°C', 'pleśniowe', 'Serowar.pl', 'https://serowar.pl/', NULL, '16,00 zł', 16.00, NULL, NULL),
  ('Kultura Roquefort', 'Penicillium roqueforti, termofilne bakterie mlekowe', 'Roquefort, Gorgonzola, Stilton', '10-15°C', 'pleśniowe', 'Serowar.pl', 'https://serowar.pl/', NULL, '16,00 zł', 16.00, NULL, NULL),
  ('Kefir Serowar', 'Lactococcus lactis, Leuconostoc, Lactobacillus, drożdże', 'Kefir tradycyjny', '20-25°C', 'kefir', 'Serowar.pl', 'https://serowar.pl/', NULL, '10,00 zł', 10.00, NULL, NULL),
  ('Jogurt Serowar', 'Streptococcus thermophilus, Lactobacillus acidophilus, Bifidobacterium', 'Jogurt probiotyczny', '37-42°C', 'probiotyczne', 'Serowar.pl', 'https://serowar.pl/', NULL, '10,00 zł', 10.00, NULL, NULL),
  ('Kultura do Fety', 'Lactococcus lactis, Streptococcus thermophilus, Lactobacillus', 'Feta, sery solankowe', '28-35°C', 'mezofilno-termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '14,00 zł', 14.00, NULL, NULL),
  ('DCC-260 Kefir', 'Lactobacillus acidophilus, Bifidobacterium lactis, Streptococcus thermophilus', 'Kefir mleczny, mleko fermentowane', '20-25°C', 'kefir', 'Artiser.pl', 'https://artiser.pl/', NULL, '28,00 zł', 28.00, NULL, NULL),
  ('DCC-270 Jogurt', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Jogurt naturalny, jogurt grecki', '40-45°C', 'jogurtowe', 'Artiser.pl', 'https://artiser.pl/', NULL, '25,00 zł', 25.00, NULL, NULL),
  ('DCC-280 Acidophilus', 'Lactobacillus acidophilus La-5, Bifidobacterium BB-12', 'Mleko acidofilne, produkty probiotyczne', '37-40°C', 'probiotyczne', 'Artiser.pl', 'https://artiser.pl/', NULL, '32,00 zł', 32.00, NULL, NULL),
  ('MM 100 Artiser', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Leuconostoc mesenteroides', 'Sery miękkie, fromage frais, twaróg', '20-28°C', 'mezofilne', 'Artiser.pl', 'https://artiser.pl/', NULL, '35,00 zł', 35.00, NULL, NULL),
  ('MA 011 Artiser', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris', 'Cheddar, Gouda, sery twarde mezofilne', '22-32°C', 'mezofilne', 'Artiser.pl', 'https://artiser.pl/', NULL, '35,00 zł', 35.00, NULL, NULL),
  ('TA 60 Artiser', 'Streptococcus thermophilus', 'Mozzarella, Provolone, sery włoskie', '38-45°C', 'termofilne', 'Artiser.pl', 'https://artiser.pl/', NULL, '38,00 zł', 38.00, NULL, NULL),
  ('TM 81 Artiser', 'Streptococcus thermophilus, Lactobacillus helveticus, Lactobacillus delbrueckii', 'Sery szwajcarskie, Emmental, Gruyère', '40-50°C', 'termofilne', 'Artiser.pl', 'https://artiser.pl/', NULL, '42,00 zł', 42.00, NULL, NULL),
  ('PC Artiser', 'Penicillium camemberti', 'Camembert, Brie', '12-18°C', 'pleśniowe', 'Artiser.pl', 'https://artiser.pl/', NULL, '28,00 zł', 28.00, NULL, NULL),
  ('PR Artiser', 'Penicillium roqueforti', 'Gorgonzola, Roquefort', '10-15°C', 'pleśniowe', 'Artiser.pl', 'https://artiser.pl/', NULL, '28,00 zł', 28.00, NULL, NULL),
  ('BL Artiser', 'Brevibacterium linens', 'Sery myte, Munster, Limburger', '15-20°C', 'aromatyzujące', 'Artiser.pl', 'https://artiser.pl/', NULL, '32,00 zł', 32.00, NULL, NULL),
  ('Vege Starter', 'Lactococcus lactis, kultury roślinne', 'Sery wegańskie, fermentaty roślinne', '20-30°C', 'wege', 'Artiser.pl', 'https://artiser.pl/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Choozit SWING Wańczykówka', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Streptococcus thermophilus', 'Sery półtwarde, elastyczne zastosowanie', '28-40°C', 'mezofilno-termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '49,00 zł', 49.00, NULL, NULL),
  ('Zestaw Startowy Serowar', 'Mezofilne + termofilne + Penicillium candidum', 'Zestaw do rozpoczęcia serowarstwa', '20-45°C', 'zestaw', 'Serowar.pl', 'https://serowar.pl/', NULL, '35,00 zł', 35.00, NULL, NULL),
  ('Zestaw Lactic Podstawowy', 'Alpha + Beta + Gamma', 'Zestaw startowy do 3 typów sera', '20-45°C', 'zestaw', 'Lactic.pl', 'https://lactic.pl/', NULL, '48,00 zł', 48.00, NULL, NULL),
  ('Choozit ME', 'Lactococcus lactis subsp. lactis, Leuconostoc', 'Sery miękkie, twaróg, maślanka', '20-30°C', 'mezofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '36,00 zł', 36.00, NULL, NULL),
  ('Choozit SB 6', 'Staphylococcus xylosus, Staphylococcus carnosus', 'Sery dojrzewające, ochrona powierzchni', '15-22°C', 'ochronne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '55,00 zł', 55.00, NULL, NULL),
  ('Choozit CHOOZIT E', 'Enterococcus faecium', 'Sery regionalne, tradycyjne', '20-35°C', 'aromatyzujące', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Choozit PROTEK CR', 'Lactobacillus plantarum, Lactobacillus rhamnosus', 'Ochrona biologiczna, hamowanie niepożądanej mikroflory', '15-35°C', 'ochronne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '65,00 zł', 65.00, NULL, NULL),
  ('Choozit MCA 34', 'Lactococcus lactis subsp. cremoris', 'Sery typu kremowego, Brie, Camembert', '30-35°C', 'mezofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '39,00 zł', 39.00, NULL, NULL),
  ('Zeta - Lactic', 'Lactobacillus acidophilus, Bifidobacterium, Streptococcus thermophilus', 'Jogurt probiotyczny, kefir', '37-40°C', 'probiotyczne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/zeta', '22,00 zł', 22.00, NULL, NULL),
  ('Theta - Lactic', 'Leuconostoc mesenteroides, Lactococcus lactis', 'Kiszonki, fermentacja warzyw, ogórki', '15-25°C', 'mezofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/theta', '18,00 zł', 18.00, NULL, NULL),
  ('Danisco VEGE', 'Lactococcus lactis, Leuconostoc (izolatów roślinnych)', 'Sery wegańskie z mleka roślinnego', '20-30°C', 'wege', 'GAP Poland', 'https://gappoland.pl/', NULL, '85,00 zł', 85.00, NULL, NULL),
  ('Chr. Hansen CHY-MAX', 'Chymosin B (podpuszczka mikrobiologiczna)', 'Technologiczny koagulant do wszelkich serów', '30-35°C', 'zestaw', 'GAP Poland', 'https://gappoland.pl/', NULL, '95,00 zł', 95.00, NULL, NULL),
  ('Danisco HOLDBAC YM-C', 'Lactobacillus rhamnosus, Lactobacillus casei', 'Ochrona sera przed drożdżami i pleśnią', '10-30°C', 'ochronne', 'GAP Poland', 'https://gappoland.pl/', NULL, '78,00 zł', 78.00, NULL, NULL),
  ('Danisco HOLDBAC YM-B', 'Lactobacillus rhamnosus', 'Ochrona jogurtu przed drożdżami', '10-42°C', 'ochronne', 'GAP Poland', 'https://gappoland.pl/', NULL, '72,00 zł', 72.00, NULL, NULL),
  ('Kultura Do Oscypka', 'Lactobacillus casei, Lactococcus lactis, kultury termofilne', 'Oscypek, bryndza, sery podhalańskie', '32-40°C', 'termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '18,00 zł', 18.00, NULL, NULL),
  ('Kultura Do Bundzu', 'Lactococcus lactis, Leuconostoc, Lactobacillus', 'Bundz, bryndza owcza', '28-35°C', 'mezofilno-termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '16,00 zł', 16.00, NULL, NULL),
  ('Kultura Do Twarogu', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris', 'Twaróg, ser biały, sernik', '18-25°C', 'mezofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '8,00 zł', 8.00, NULL, NULL),
  ('Lacidofil RO - Artiser', 'Lactobacillus acidophilus, Lactobacillus rhamnosus', 'Jogurt probiotyczny, kefir wzmocniony', '37-40°C', 'probiotyczne', 'Artiser.pl', 'https://artiser.pl/', NULL, '38,00 zł', 38.00, NULL, NULL),
  ('ABY-3 Artiser', 'Lactobacillus acidophilus La-5, Bifidobacterium BB-12, Streptococcus thermophilus', 'Jogurt ABT, produkty bio', '37-43°C', 'probiotyczne', 'Artiser.pl', 'https://artiser.pl/', NULL, '42,00 zł', 42.00, NULL, NULL),
  ('GEO 17 Artiser', 'Geotrichum candidum (szczep 17)', 'Camembert, Brie, sery świeże', '20-30°C', 'pleśniowe', 'Artiser.pl', 'https://artiser.pl/', NULL, '30,00 zł', 30.00, NULL, NULL),
  ('PAL 6 Artiser', 'Propionibacterium freudenreichii', 'Emmental, sery z oczkami', '18-24°C', 'propionowe', 'Artiser.pl', 'https://artiser.pl/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Choozit MESO II', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Leuconostoc', 'Gouda, Edam, sery holenderskie', '22-30°C', 'mezofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '42,00 zł', 42.00, NULL, NULL),
  ('Choozit TS 2', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. lactis', 'Sery włoskie, Provolone, Caciocavallo', '38-50°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '42,00 zł', 42.00, NULL, NULL),
  ('Choozit CAMA', 'Streptococcus thermophilus, Lactobacillus casei', 'Camembert, sery pleśniowe', '30-38°C', 'mezofilno-termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '45,00 zł', 45.00, NULL, NULL),
  ('Kombucha Starter', 'SCOBY (drożdże + Acetobacter + Gluconobacter)', 'Kombucha, fermentowana herbata', '22-28°C', 'zestaw', 'Artiser.pl', 'https://artiser.pl/', NULL, '35,00 zł', 35.00, NULL, NULL),
  ('Maślanka - Lactic', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Leuconostoc', 'Maślanka, serwatka fermentowana', '18-22°C', 'mezofilne', 'Lactic.pl', 'https://lactic.pl/', NULL, '15,00 zł', 15.00, NULL, NULL),
  ('Kultura Skyr', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus, Lactococcus lactis', 'Skyr islandzki, jogurt islandzki', '38-42°C', 'jogurtowe', 'Lactic.pl', 'https://lactic.pl/', NULL, '22,00 zł', 22.00, NULL, NULL),
  ('Kultura Crème Fraîche', 'Lactococcus lactis subsp. lactis, Leuconostoc, Lactococcus diacetylactis', 'Crème fraîche, śmietana fermentowana', '18-22°C', 'mezofilne', 'Lactic.pl', 'https://lactic.pl/', NULL, '20,00 zł', 20.00, NULL, NULL),
  ('Termofilna do Mozzarelli', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Mozzarella, Pizza cheese', '38-45°C', 'termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '14,00 zł', 14.00, NULL, NULL),
  ('Mezofilna do Goudy', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris', 'Gouda, ser holenderski', '22-28°C', 'mezofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '10,00 zł', 10.00, NULL, NULL),
  ('Choozit FLORA BLANC', 'Geotrichum candidum, Penicillium camemberti', 'Camembert, Brie, sery białe', '15-20°C', 'pleśniowe', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '55,00 zł', 55.00, NULL, NULL),
  ('Choozit FLORE 63', 'Brevibacterium linens, Arthrobacter', 'Sery myte typu Reblochon', '14-18°C', 'aromatyzujące', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '55,00 zł', 55.00, NULL, NULL),
  ('Danisco CHOOZIT PROPIONIC', 'Propionibacterium freudenreichii subsp. shermanii', 'Emmental, Jarlsberg, sery propionowe', '18-24°C', 'propionowe', 'GAP Poland', 'https://gappoland.pl/', NULL, '68,00 zł', 68.00, NULL, NULL),
  ('Danisco CHOOZIT LINENS', 'Brevibacterium linens', 'Sery myte powierzchniowo', '15-22°C', 'aromatyzujące', 'GAP Poland', 'https://gappoland.pl/', NULL, '62,00 zł', 62.00, NULL, NULL),
  ('Danisco CHOOZIT PC', 'Penicillium camemberti', 'Camembert, Brie, sery białe pleśniowe', '12-18°C', 'pleśniowe', 'GAP Poland', 'https://gappoland.pl/', NULL, '58,00 zł', 58.00, NULL, NULL),
  ('Danisco CHOOZIT PR', 'Penicillium roqueforti', 'Roquefort, Gorgonzola, Stilton', '10-15°C', 'pleśniowe', 'GAP Poland', 'https://gappoland.pl/', NULL, '58,00 zł', 58.00, NULL, NULL),
  ('Danisco CHOOZIT GEO', 'Geotrichum candidum', 'Camembert, Brie, sery świeże', '18-25°C', 'pleśniowe', 'GAP Poland', 'https://gappoland.pl/', NULL, '55,00 zł', 55.00, NULL, NULL),
  ('Danisco CHOOZIT MM 101', 'Lactococcus lactis subsp. lactis, Leuconostoc mesenteroides', 'Sery miękkie, fromage frais', '20-28°C', 'mezofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '48,00 zł', 48.00, NULL, NULL),
  ('Eta - Lactic', 'Lactobacillus helveticus, Streptococcus thermophilus', 'Parmezan, Grana Padano, sery twarde włoskie', '40-50°C', 'termofilne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/eta', '25,00 zł', 25.00, NULL, NULL),
  ('Iota - Lactic', 'Propionibacterium freudenreichii', 'Emmental, sery z oczkami', '18-22°C', 'propionowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/iota', '32,00 zł', 32.00, NULL, NULL),
  ('Kappa - Lactic', 'Brevibacterium linens, Debaryomyces hansenii', 'Limburger, Munster, Taleggio', '14-20°C', 'aromatyzujące', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/kappa', '28,00 zł', 28.00, NULL, NULL),
  ('Lambda - Lactic', 'Lactobacillus plantarum', 'Ochrona biologiczna, kiszonki', '15-30°C', 'ochronne', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/lambda', '22,00 zł', 22.00, NULL, NULL),
  ('Mu - Lactic', 'Penicillium camemberti var. candidum', 'Camembert, sery białe', '12-18°C', 'pleśniowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/mu', '24,00 zł', 24.00, NULL, NULL),
  ('Nu - Lactic', 'Penicillium roqueforti (szczep ciemny)', 'Gorgonzola, Stilton, sery niebieskie', '10-14°C', 'pleśniowe', 'Lactic.pl', 'https://lactic.pl/', 'https://lactic.pl/kultury-bakterii/nu', '24,00 zł', 24.00, NULL, NULL),
  ('Cheddar Mix - Serowar', 'Lactococcus lactis subsp. lactis, Lactococcus lactis subsp. cremoris, Lactobacillus casei', 'Cheddar, Cheshire, sery angielskie', '24-32°C', 'mezofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '16,00 zł', 16.00, NULL, NULL),
  ('Parmezan Mix - Serowar', 'Streptococcus thermophilus, Lactobacillus helveticus, Lactobacillus delbrueckii', 'Parmezan, Grana, sery granularne', '40-50°C', 'termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '16,00 zł', 16.00, NULL, NULL),
  ('Swiss Mix - Serowar', 'Streptococcus thermophilus, Propionibacterium freudenreichii, Lactobacillus helveticus', 'Emmental, Gruyère, sery szwajcarskie', '38-48°C', 'termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '18,00 zł', 18.00, NULL, NULL),
  ('Tilsit Mix - Serowar', 'Lactococcus lactis, Leuconostoc, Brevibacterium linens', 'Tilsit, Havarti z myciem', '20-25°C', 'mezofilno-termofilne', 'Serowar.pl', 'https://serowar.pl/', NULL, '18,00 zł', 18.00, NULL, NULL),
  ('Vege Soy - Artiser', 'Lactobacillus acidophilus, Bifidobacterium, kultury roślinne', 'Twarożek sojowy, sery roślinne', '35-40°C', 'wege', 'Artiser.pl', 'https://artiser.pl/', NULL, '42,00 zł', 42.00, NULL, NULL),
  ('Vege Nut - Artiser', 'Lactobacillus, Leuconostoc, kultury orzechowe', 'Sery orzechowe wegańskie', '20-28°C', 'wege', 'Artiser.pl', 'https://artiser.pl/', NULL, '48,00 zł', 48.00, NULL, NULL),
  ('Ferma Kefir 1', 'Lactococcus lactis, Lactobacillus kefiri, Saccharomyces cerevisiae', 'Kefir mleczny 1% tłuszczu', '20-25°C', 'kefir', 'Artiser.pl', 'https://artiser.pl/', NULL, '30,00 zł', 30.00, NULL, NULL),
  ('Ferma Kefir 2', 'Lactococcus lactis, Leuconostoc, Lactobacillus, Kluyveromyces', 'Kefir pełny, kefir 2%', '20-25°C', 'kefir', 'Artiser.pl', 'https://artiser.pl/', NULL, '30,00 zł', 30.00, NULL, NULL),
  ('Danisco YO-MIX 600', 'Lactobacillus acidophilus, Bifidobacterium animalis, Streptococcus thermophilus', 'Jogurt ABT, produkty probiotyczne', '40-43°C', 'probiotyczne', 'GAP Poland', 'https://gappoland.pl/', NULL, '75,00 zł', 75.00, NULL, NULL),
  ('Danisco YO-MIX 200', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. bulgaricus', 'Jogurt bałkański, jogurt stały', '40-45°C', 'jogurtowe', 'GAP Poland', 'https://gappoland.pl/', NULL, '68,00 zł', 68.00, NULL, NULL),
  ('Danisco YO-MIX 495', 'Streptococcus thermophilus, Lactobacillus acidophilus', 'Jogurt mały, deser mleczny', '40-43°C', 'jogurtowe', 'GAP Poland', 'https://gappoland.pl/', NULL, '68,00 zł', 68.00, NULL, NULL),
  ('Probiofilna P1', 'Lactobacillus rhamnosus GG, Bifidobacterium longum', 'Produkty probiotyczne specjalistyczne', '37°C', 'probiotyczne', 'GAP Poland', 'https://gappoland.pl/', NULL, '88,00 zł', 88.00, NULL, NULL),
  ('Xi - Lactic Kefir Wege', 'Lactobacillus, Leuconostoc, drożdże z izolatów roślinnych', 'Kefir wegański z mleka roślinnego', '20-25°C', 'wege', 'Lactic.pl', 'https://lactic.pl/', NULL, '28,00 zł', 28.00, NULL, NULL),
  ('Zestaw Artisan Serowar', 'Mezofilna + Termofilna + Kefir + Jogurt', 'Kompletny zestaw startowy 4-kultury', '20-45°C', 'zestaw', 'Serowar.pl', 'https://serowar.pl/', NULL, '42,00 zł', 42.00, NULL, NULL),
  ('Choozit PROTEK VB', 'Lactobacillus rhamnosus, Lactobacillus casei', 'Ochrona biologiczna, hamowanie niepożądanych drobnoustrojów', '10-35°C', 'ochronne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '69,00 zł', 69.00, NULL, NULL),
  ('Choozit SWISS', 'Streptococcus thermophilus, Propionibacterium freudenreichii, Lactobacillus helveticus', 'Emmental, Gruyère, Jarlsberg', '38-48°C', 'termofilne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '59,00 zł', 59.00, NULL, NULL),
  ('Ferma Bifidum', 'Bifidobacterium bifidum, Lactococcus lactis', 'Mleko bifidusowe, produkty probiotyczne', '36-38°C', 'probiotyczne', 'Artiser.pl', 'https://artiser.pl/', NULL, '36,00 zł', 36.00, NULL, NULL),
  ('Danisco CHOOZIT YF-L 811', 'Streptococcus thermophilus, Lactobacillus delbrueckii subsp. lactis', 'Sery półtwarde włoskie, Scamorza', '38-45°C', 'termofilne', 'GAP Poland', 'https://gappoland.pl/', NULL, '52,00 zł', 52.00, NULL, NULL),
  ('Choozit NEMO', 'Lactobacillus casei, Lactobacillus paracasei', 'Sery dojrzewające, przedłużenie trwałości', '15-30°C', 'ochronne', 'Wańczykówka', 'https://sklep.wanczykowka.com/', NULL, '62,00 zł', 62.00, NULL, NULL),
  ('Sigma - Lactic', 'Leuconostoc mesenteroides, Leuconostoc cremoris', 'Aromat, sery z masłem, sery skandynawskie', '20-25°C', 'aromatyzujące', 'Lactic.pl', 'https://lactic.pl/', NULL, '20,00 zł', 20.00, NULL, NULL),
  ('Tau - Lactic', 'Lactobacillus casei, Lactobacillus paracasei', 'Sery długodojrzewające, Comté', '15-25°C', 'aromatyzujące', 'Lactic.pl', 'https://lactic.pl/', NULL, '25,00 zł', 25.00, NULL, NULL)
;

INSERT INTO public.price_history (culture_id, price_label, price_numeric, source, recorded_at)
SELECT id, price_label, price_numeric, 'migration', created_at
FROM public.cultures
WHERE price_label IS NOT NULL;


-- ---------- [8/16] 20260529090653_1753d953-41ba-4b99-81f0-23d68078d36f.sql ----------
CREATE TABLE public.culture_clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  culture_name text NOT NULL,
  shop_name text NOT NULL,
  clicked_at timestamptz NOT NULL DEFAULT now(),
  user_agent text
);

GRANT INSERT ON public.culture_clicks TO anon;
GRANT INSERT, SELECT ON public.culture_clicks TO authenticated;
GRANT ALL ON public.culture_clicks TO service_role;

ALTER TABLE public.culture_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert clicks"
ON public.culture_clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can view clicks"
ON public.culture_clicks
FOR SELECT
TO authenticated
USING (true);


-- ---------- [9/16] 20260615181354_07fe629d-1d4a-4c1f-948a-3c1b1185a392.sql ----------
CREATE TABLE public.llm_queries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  query text NOT NULL,
  model text NOT NULL CHECK (model IN ('claude', 'perplexity', 'chatgpt')),
  source text NOT NULL DEFAULT 'baza-kultur',
  is_custom boolean NOT NULL DEFAULT false
);

CREATE INDEX llm_queries_query_idx ON public.llm_queries (query);
CREATE INDEX llm_queries_created_at_idx ON public.llm_queries (created_at);

GRANT INSERT ON public.llm_queries TO anon;
GRANT INSERT, SELECT ON public.llm_queries TO authenticated;
GRANT ALL ON public.llm_queries TO service_role;

ALTER TABLE public.llm_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert llm queries"
ON public.llm_queries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can view llm queries"
ON public.llm_queries
FOR SELECT
TO authenticated
USING (true);


-- ---------- [10/16] 20260801090000_rodo_retencja_i_zawezenie_odczytu.sql ----------
-- =====================================================================
-- RODO + retencja + zawężenie odczytu  (audyt bezpieczeństwa 2026-08-01)
--
-- 1. Prawo do usunięcia danych (RODO art. 17) — delete_own_account()
-- 2. Prawo do przenoszenia danych (RODO art. 20) — export_own_data()
-- 3. Retencja: llm_queries (24 mies.), culture_clicks (12 mies.)
-- 4. Zawężenie odczytu llm_queries i culture_clicks do admina
-- 5. Jawne TO authenticated w politykach profiles
--
-- URUCHOMIĆ w Supabase SQL editor. Idempotentne (DROP IF EXISTS / OR REPLACE).
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. USUNIĘCIE WŁASNEGO KONTA (RODO art. 17)
-- ---------------------------------------------------------------------
-- UWAGA: tabela public.products ma user_id BEZ klucza obcego do auth.users,
-- więc kaskada jej NIE obejmie — kasujemy ją jawnie. Pozostałe tabele
-- (profiles, sales_records, invoices, user_roles, reactions,
-- user_culture_lists, culture_audit_log) mają ON DELETE CASCADE.

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Brak zalogowanego użytkownika.';
  END IF;

  -- Tabele bez kaskady — usuwamy ręcznie, żeby nie zostawić sierot
  DELETE FROM public.products WHERE user_id = uid;

  -- Usunięcie konta; reszta danych schodzi kaskadą przez FK do auth.users
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

COMMENT ON FUNCTION public.delete_own_account() IS
  'RODO art. 17 — użytkownik trwale usuwa własne konto i wszystkie powiązane dane. Nieodwracalne.';


-- ---------------------------------------------------------------------
-- 2. EKSPORT WŁASNYCH DANYCH (RODO art. 20)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.export_own_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  wynik jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Brak zalogowanego użytkownika.';
  END IF;

  SELECT jsonb_build_object(
    'wygenerowano',       now(),
    'profil',             (SELECT to_jsonb(p) FROM public.profiles p WHERE p.id = uid),
    'ewidencja_sprzedazy',(SELECT COALESCE(jsonb_agg(to_jsonb(s)), '[]'::jsonb)
                             FROM public.sales_records s WHERE s.user_id = uid),
    'faktury',            (SELECT COALESCE(jsonb_agg(to_jsonb(i)), '[]'::jsonb)
                             FROM public.invoices i WHERE i.user_id = uid),
    'produkty',           (SELECT COALESCE(jsonb_agg(to_jsonb(pr)), '[]'::jsonb)
                             FROM public.products pr WHERE pr.user_id = uid),
    'listy_kultur',       (SELECT COALESCE(jsonb_agg(to_jsonb(l)), '[]'::jsonb)
                             FROM public.user_culture_lists l WHERE l.user_id = uid),
    'reakcje',            (SELECT COALESCE(jsonb_agg(to_jsonb(r)), '[]'::jsonb)
                             FROM public.reactions r WHERE r.user_id = uid),
    'role',               (SELECT COALESCE(jsonb_agg(ur.role), '[]'::jsonb)
                             FROM public.user_roles ur WHERE ur.user_id = uid)
  ) INTO wynik;

  RETURN wynik;
END;
$$;

REVOKE ALL ON FUNCTION public.export_own_data() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.export_own_data() TO authenticated;

COMMENT ON FUNCTION public.export_own_data() IS
  'RODO art. 20 — zwraca komplet danych zalogowanego użytkownika w formacie JSON.';


-- ---------------------------------------------------------------------
-- 3. RETENCJA — dane analityczne nie mogą rosnąć w nieskończoność
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cleanup_analytics_retention()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Zapytania do LLM: brak danych osobowych, trzymamy 24 miesiące
  DELETE FROM public.llm_queries
  WHERE created_at < now() - INTERVAL '24 months';

  -- Kliknięcia w sklepy: zawierają user_agent (dane quasi-osobowe)
  -- user_agent czyścimy po 3 miesiącach, całe wiersze po 12
  UPDATE public.culture_clicks
  SET user_agent = NULL
  WHERE clicked_at < now() - INTERVAL '3 months'
    AND user_agent IS NOT NULL;

  DELETE FROM public.culture_clicks
  WHERE clicked_at < now() - INTERVAL '12 months';
END;
$$;

COMMENT ON FUNCTION public.cleanup_analytics_retention() IS
  'Retencja danych analitycznych. Uruchamiać cyklicznie (pg_cron) lub ręcznie.';

-- Lekkie sprzątanie okazjonalne przy zapisie (wzorzec jak w contact_attempts):
-- ~1 na 200 insertów, żeby nie obciążać zapytań.
CREATE OR REPLACE FUNCTION public.trigger_cleanup_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF random() < 0.005 THEN
    PERFORM public.cleanup_analytics_retention();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cleanup_analytics_on_llm_insert ON public.llm_queries;
CREATE TRIGGER cleanup_analytics_on_llm_insert
  AFTER INSERT ON public.llm_queries
  FOR EACH ROW EXECUTE FUNCTION public.trigger_cleanup_analytics();


-- ---------------------------------------------------------------------
-- 4. ZAWĘŻENIE ODCZYTU ANALITYKI DO ADMINA
-- ---------------------------------------------------------------------
-- Dotąd każdy ZALOGOWANY użytkownik mógł czytać całość: czego ludzie szukają
-- i które sklepy dostają kliknięcia. To wiedza biznesowa, nie dane publiczne.

-- UWAGA: polityki RLS sumują się (OR). Gdyby została choć jedna stara
-- polityka SELECT z USING(true), nowa restrykcyjna niczego by nie zablokowała.
-- Dlatego kasujemy WSZYSTKIE polityki SELECT programowo, zamiast zgadywać nazwy
-- (część mogła powstać ad-hoc w SQL editorze i nie ma jej w migracjach).
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('llm_queries', 'culture_clicks')
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, pol.tablename);
    RAISE NOTICE 'Usunieto polityke SELECT: %.% ', pol.tablename, pol.policyname;
  END LOOP;
END;
$$;

CREATE POLICY "Only admins can view llm queries"
ON public.llm_queries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can view clicks"
ON public.culture_clicks
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Kontrola po wykonaniu — powinny zostać dokładnie dwie polityki SELECT,
-- obie z warunkiem has_role(...,'admin'):
--   SELECT tablename, policyname, qual FROM pg_policies
--   WHERE schemaname='public' AND tablename IN ('llm_queries','culture_clicks') AND cmd='SELECT';


-- ---------------------------------------------------------------------
-- 5. JAWNE `TO authenticated` W POLITYKACH profiles
-- ---------------------------------------------------------------------
-- Dotąd polityki stosowały się do roli `public` (czyli także anon).
-- W praktyce bezpieczne, bo auth.uid() jest wtedy NULL i warunek nie
-- przechodzi — ale to zabezpieczenie przez przypadek, nie przez intencję.

DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);


-- ---------- [11/16] 20260802090000_katalog_serowarni.sql ----------
-- =====================================================================
-- KATALOG SEROWARNI ZAGRODOWYCH
--
-- Darmowa wizytówka dla producenta + unikalna treść dla serwisu.
--
-- ⚠️ RODO: publikacja danych producenta (nazwa, miejscowość, telefon,
-- e-mail) to przetwarzanie danych osobowych. Wymaga OSOBNEJ, wyraźnej
-- zgody — innej niż marketingowa w profiles. Zgoda jest odznaczalna,
-- zapisywana z datą i odwracalna: jej wycofanie zdejmuje wizytówkę.
--
-- ⚠️ MODERACJA: wpis publikuje się dopiero po akceptacji admina.
-- Domyślny status to 'szkic'; użytkownik zgłasza do 'oczekuje'.
--
-- URUCHOMIĆ w Supabase SQL editor.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.serowarnie (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Adres wizytówki. KONTRAKT: raz opublikowany slug jest zamrożony
  -- (zmiana zaindeksowanego URL = utrata pozycji w wyszukiwarkach).
  slug            TEXT NOT NULL UNIQUE,

  nazwa           TEXT NOT NULL,
  opis            TEXT,

  -- Lokalizacja — bez dokładnego adresu; miejscowość wystarcza,
  -- a mniej danych osobowych to mniejsze ryzyko.
  wojewodztwo     TEXT CHECK (wojewodztwo IN (
                    'dolnośląskie','kujawsko-pomorskie','lubelskie','lubuskie',
                    'łódzkie','małopolskie','mazowieckie','opolskie',
                    'podkarpackie','podlaskie','pomorskie','śląskie',
                    'świętokrzyskie','warmińsko-mazurskie','wielkopolskie',
                    'zachodniopomorskie')),
  miejscowosc     TEXT,

  -- Kontakt — wyłącznie to, co producent sam poda
  telefon         TEXT,
  email_kontakt   TEXT,
  www             TEXT,
  facebook        TEXT,

  -- Oferta
  produkty        TEXT[] NOT NULL DEFAULT '{}',
  rodzaj_mleka    TEXT[] NOT NULL DEFAULT '{}',
  forma_sprzedazy TEXT[] NOT NULL DEFAULT '{}',

  -- Moderacja
  status          TEXT NOT NULL DEFAULT 'szkic'
                    CHECK (status IN ('szkic','oczekuje','opublikowany','odrzucony')),
  powod_odrzucenia TEXT,

  -- Zgoda RODO na publikację (odrębna od marketingowej!)
  zgoda_publikacja BOOLEAN NOT NULL DEFAULT false,
  zgoda_data       TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_serowarnie_status ON public.serowarnie(status);
CREATE INDEX IF NOT EXISTS idx_serowarnie_woj    ON public.serowarnie(wojewodztwo);

-- Znacznik czasu aktualizacji
DROP TRIGGER IF EXISTS set_serowarnie_updated_at ON public.serowarnie;
CREATE TRIGGER set_serowarnie_updated_at
  BEFORE UPDATE ON public.serowarnie
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Zgoda zawsze z datą; jej wycofanie zdejmuje wizytówkę z publikacji.
CREATE OR REPLACE FUNCTION public.serowarnie_pilnuj_zgody()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.zgoda_publikacja AND (OLD IS NULL OR NOT OLD.zgoda_publikacja) THEN
    NEW.zgoda_data := now();
  END IF;

  IF NOT NEW.zgoda_publikacja THEN
    NEW.zgoda_data := NULL;
    IF NEW.status = 'opublikowany' THEN
      NEW.status := 'szkic';   -- brak zgody = natychmiast znika z katalogu
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS serowarnie_zgoda ON public.serowarnie;
CREATE TRIGGER serowarnie_zgoda
  BEFORE INSERT OR UPDATE ON public.serowarnie
  FOR EACH ROW EXECUTE FUNCTION public.serowarnie_pilnuj_zgody();


-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
ALTER TABLE public.serowarnie ENABLE ROW LEVEL SECURITY;

-- Publicznie widoczne WYŁĄCZNIE wpisy zatwierdzone i za zgodą
CREATE POLICY "Katalog publiczny — tylko opublikowane za zgoda"
ON public.serowarnie FOR SELECT
TO anon, authenticated
USING (status = 'opublikowany' AND zgoda_publikacja = true);

-- Właściciel widzi i edytuje swój wpis niezależnie od statusu
CREATE POLICY "Wlasciciel widzi swoj wpis"
ON public.serowarnie FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Wlasciciel tworzy swoj wpis"
ON public.serowarnie FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Wlasciciel edytuje swoj wpis"
ON public.serowarnie FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Wlasciciel usuwa swoj wpis"
ON public.serowarnie FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admin — pełny dostęp (moderacja)
CREATE POLICY "Admin zarzadza katalogiem"
ON public.serowarnie FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ---------------------------------------------------------------------
-- ⚠️ ESKALACJA UPRAWNIEŃ — blokada samodzielnej publikacji
-- ---------------------------------------------------------------------
-- Bez tego użytkownik ustawiłby sobie status='opublikowany' zwykłym
-- UPDATE i ominął moderację. Polityka RLS tego nie złapie, bo dotyczy
-- wiersza jako całości, nie pojedynczej kolumny.
CREATE OR REPLACE FUNCTION public.serowarnie_blokuj_samopublikacje()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;   -- admin moderuje bez ograniczeń
  END IF;

  -- Użytkownik może co najwyżej zgłosić wpis do sprawdzenia
  IF NEW.status NOT IN ('szkic','oczekuje') THEN
    RAISE EXCEPTION 'Publikacja wymaga akceptacji moderatora.';
  END IF;

  -- Nie wolno cofnąć decyzji moderatora ani podmienić powodu odrzucenia
  IF TG_OP = 'UPDATE' AND OLD.status = 'odrzucony' AND NEW.status = 'oczekuje' THEN
    NEW.powod_odrzucenia := OLD.powod_odrzucenia;  -- zostaje historia
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS serowarnie_bez_samopublikacji ON public.serowarnie;
CREATE TRIGGER serowarnie_bez_samopublikacji
  BEFORE INSERT OR UPDATE ON public.serowarnie
  FOR EACH ROW EXECUTE FUNCTION public.serowarnie_blokuj_samopublikacje();


-- ---------------------------------------------------------------------
-- Generowanie unikalnego sluga (kontrakt URL)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.serowarnie_slug(nazwa_in TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bazowy TEXT;
  kandydat TEXT;
  n INT := 1;
BEGIN
  bazowy := lower(nazwa_in);
  bazowy := translate(bazowy,
              'ąćęłńóśźżĄĆĘŁŃÓŚŹŻ',
              'acelnoszzacelnoszz');
  bazowy := regexp_replace(bazowy, '[^a-z0-9]+', '-', 'g');
  bazowy := trim(both '-' from bazowy);
  bazowy := left(nullif(bazowy, ''), 60);

  IF bazowy IS NULL THEN
    bazowy := 'serowarnia';
  END IF;

  kandydat := bazowy;
  WHILE EXISTS (SELECT 1 FROM public.serowarnie WHERE slug = kandydat) LOOP
    n := n + 1;
    kandydat := bazowy || '-' || n;
  END LOOP;

  RETURN kandydat;
END;
$$;

GRANT EXECUTE ON FUNCTION public.serowarnie_slug(TEXT) TO authenticated;

COMMENT ON TABLE public.serowarnie IS
  'Katalog serowarni zagrodowych. Publikacja tylko po akceptacji moderatora i za wyrazna zgoda RODO producenta.';


-- ---------- [12/16] 20260802140000_katalog_tylko_producenci.sql ----------
-- =====================================================================
-- KATALOG SEROWARNI — sito na producentów
--
-- Powód: logują się także osoby korzystające wyłącznie z kalkulatora pasz
-- (drobiarze, hodowcy bydła). Katalog ma być wyłącznie dla producentów sera.
--
-- Sito jest dwustopniowe:
--   1. Wymagania treściowe po stronie bazy (CHECK) — niekompletny wpis
--      w ogóle nie może trafić do kolejki moderacji.
--   2. Moderacja przez admina — ostateczna decyzja.
--
-- URUCHOMIĆ w Supabase SQL editor PO migracji 20260802090000.
-- =====================================================================

-- Numer weterynaryjny (WNI) — najmocniejszy sygnał, że ktoś realnie
-- produkuje i sprzedaje ser. Opcjonalny, bo nie każdy zdążył się
-- zarejestrować, ale dla moderatora to kluczowa informacja.
ALTER TABLE public.serowarnie
  ADD COLUMN IF NOT EXISTS nr_weterynaryjny TEXT;

-- Deklaracja producenta — świadome oświadczenie, nie domysł systemu
ALTER TABLE public.serowarnie
  ADD COLUMN IF NOT EXISTS oswiadczenie_producent BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.serowarnie.nr_weterynaryjny IS
  'WNI nadany przez powiatowego lekarza weterynarii. Sygnal wiarygodnosci dla moderatora.';
COMMENT ON COLUMN public.serowarnie.oswiadczenie_producent IS
  'Uzytkownik oswiadczyl, ze produkuje ser. Warunek zgloszenia do katalogu.';


-- ---------------------------------------------------------------------
-- Wymagania treściowe przy zgłaszaniu do moderacji
-- ---------------------------------------------------------------------
-- Egzekwowane w bazie, nie tylko w formularzu — front da się obejść.
CREATE OR REPLACE FUNCTION public.serowarnie_waliduj_zgloszenie()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Sprawdzamy tylko przy zgłoszeniu lub publikacji; szkic może być pusty
  IF NEW.status IN ('oczekuje', 'opublikowany') THEN

    IF NOT NEW.oswiadczenie_producent THEN
      RAISE EXCEPTION 'Katalog jest dla producentow sera — wymagane oswiadczenie.';
    END IF;

    IF NEW.opis IS NULL OR length(trim(NEW.opis)) < 120 THEN
      RAISE EXCEPTION 'Opis musi miec co najmniej 120 znakow (jest %).',
        COALESCE(length(trim(NEW.opis)), 0);
    END IF;

    IF NEW.wojewodztwo IS NULL OR NEW.miejscowosc IS NULL
       OR length(trim(NEW.miejscowosc)) = 0 THEN
      RAISE EXCEPTION 'Podaj wojewodztwo i miejscowosc — bez tego wizytowka nie ma sensu.';
    END IF;

    IF array_length(NEW.produkty, 1) IS NULL THEN
      RAISE EXCEPTION 'Podaj co najmniej jeden wytwarzany ser.';
    END IF;

    IF array_length(NEW.rodzaj_mleka, 1) IS NULL THEN
      RAISE EXCEPTION 'Zaznacz rodzaj mleka.';
    END IF;

    IF array_length(NEW.forma_sprzedazy, 1) IS NULL THEN
      RAISE EXCEPTION 'Zaznacz, jak mozna kupic Twoj ser.';
    END IF;

    -- Musi być jakikolwiek sposób kontaktu, inaczej wizytówka jest bezużyteczna
    IF COALESCE(NEW.telefon, '') = '' AND COALESCE(NEW.email_kontakt, '') = ''
       AND COALESCE(NEW.www, '') = '' AND COALESCE(NEW.facebook, '') = '' THEN
      RAISE EXCEPTION 'Podaj przynajmniej jeden kontakt (telefon, e-mail, WWW lub Facebook).';
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS serowarnie_walidacja ON public.serowarnie;
CREATE TRIGGER serowarnie_walidacja
  BEFORE INSERT OR UPDATE ON public.serowarnie
  FOR EACH ROW EXECUTE FUNCTION public.serowarnie_waliduj_zgloszenie();


-- ---------------------------------------------------------------------
-- Widok dla moderatora — kolejka z sygnałami wiarygodności
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.serowarnie_do_moderacji()
RETURNS TABLE (
  id UUID, slug TEXT, nazwa TEXT, opis TEXT,
  wojewodztwo TEXT, miejscowosc TEXT,
  produkty TEXT[], rodzaj_mleka TEXT[], forma_sprzedazy TEXT[],
  telefon TEXT, email_kontakt TEXT, www TEXT, facebook TEXT,
  nr_weterynaryjny TEXT, status TEXT,
  email_konta TEXT,
  ma_ewidencje BOOLEAN,
  zarejestrowany TIMESTAMPTZ,
  zgloszony TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT
    s.id, s.slug, s.nazwa, s.opis,
    s.wojewodztwo, s.miejscowosc,
    s.produkty, s.rodzaj_mleka, s.forma_sprzedazy,
    s.telefon, s.email_kontakt, s.www, s.facebook,
    s.nr_weterynaryjny, s.status,
    p.email,
    -- Czy user faktycznie prowadzi u nas ewidencje sprzedazy?
    -- Mocny sygnal, ze to producent, a nie ktos od kalkulatora pasz.
    EXISTS (SELECT 1 FROM public.sales_records sr WHERE sr.user_id = s.user_id),
    p.created_at,
    s.updated_at
  FROM public.serowarnie s
  LEFT JOIN public.profiles p ON p.id = s.user_id
  ORDER BY
    CASE s.status WHEN 'oczekuje' THEN 0 WHEN 'opublikowany' THEN 1 ELSE 2 END,
    s.updated_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.serowarnie_do_moderacji() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.serowarnie_do_moderacji() TO authenticated;


-- ---------- [13/16] 20260803090000_katalog_typ_dzialalnosci.sql ----------
-- =====================================================================
-- KATALOG SEROWARNI — typ działalności zamiast sita regulacyjnego
--
-- Powód (uwagi Marka):
--   1. Ewidencję sprzedaży prowadzi u nas niewiele osób — to zbyt rzadki
--      sygnał, żeby na nim opierać weryfikację.
--   2. Nie każdy, kto robi ser, ma zgłoszone RHD. Gospodarstwa
--      agroturystyczne robią ser wyłącznie dla swoich gości i nadal są
--      prawdziwymi serowarniami.
--
-- BŁĄD DO NAPRAWY: dotychczasowa walidacja wymagała wskazania formy
-- SPRZEDAŻY. Gospodarstwo nieprowadzące sprzedaży nie miało czego
-- zaznaczyć i zostałoby zablokowane — czyli sito odcinało dokładnie tych,
-- których chcemy mieć w katalogu.
--
-- URUCHOMIĆ w Supabase SQL editor PO migracji 20260802140000.
-- =====================================================================

ALTER TABLE public.serowarnie
  ADD COLUMN IF NOT EXISTS typ_dzialalnosci TEXT
    CHECK (typ_dzialalnosci IN (
      'serowarnia',        -- produkuje i sprzedaje ser (RHD/MOL)
      'agroturystyka',     -- ser dla gości gospodarstwa, bez sprzedaży
      'sezonowa',          -- produkcja i sprzedaż okazjonalna/sezonowa
      'w-organizacji'      -- dopiero uruchamia produkcję
    ));

COMMENT ON COLUMN public.serowarnie.typ_dzialalnosci IS
  'Charakter dzialalnosci. Nie kazdy producent sera sprzedaje - agroturystyka robi ser dla gosci.';

-- Domyślny typ dla wpisów sprzed tej zmiany
UPDATE public.serowarnie
SET typ_dzialalnosci = 'serowarnia'
WHERE typ_dzialalnosci IS NULL;


-- ---------------------------------------------------------------------
-- Walidacja zgłoszenia — poprawiona
-- ---------------------------------------------------------------------
-- Kluczowa zmiana: nie wymagamy "formy sprzedaży", tylko wskazania
-- CO NAJMNIEJ JEDNEGO sposobu, w jaki można zetknąć się z serem —
-- kupić GO, spróbować na miejscu, zjeść w ramach pobytu, albo przyjechać
-- na warsztaty. Kolumna forma_sprzedazy przechowuje jedno i drugie.
CREATE OR REPLACE FUNCTION public.serowarnie_waliduj_zgloszenie()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('oczekuje', 'opublikowany') THEN

    IF NOT NEW.oswiadczenie_producent THEN
      RAISE EXCEPTION 'Katalog jest dla wytwarzajacych ser — wymagane oswiadczenie.';
    END IF;

    IF NEW.typ_dzialalnosci IS NULL THEN
      RAISE EXCEPTION 'Wskaz charakter dzialalnosci.';
    END IF;

    IF NEW.opis IS NULL OR length(trim(NEW.opis)) < 120 THEN
      RAISE EXCEPTION 'Opis musi miec co najmniej 120 znakow (jest %).',
        COALESCE(length(trim(NEW.opis)), 0);
    END IF;

    IF NEW.wojewodztwo IS NULL OR NEW.miejscowosc IS NULL
       OR length(trim(NEW.miejscowosc)) = 0 THEN
      RAISE EXCEPTION 'Podaj wojewodztwo i miejscowosc.';
    END IF;

    IF array_length(NEW.produkty, 1) IS NULL THEN
      RAISE EXCEPTION 'Podaj co najmniej jeden wytwarzany ser.';
    END IF;

    IF array_length(NEW.rodzaj_mleka, 1) IS NULL THEN
      RAISE EXCEPTION 'Zaznacz rodzaj mleka.';
    END IF;

    -- Nie "jak KUPIC", tylko "jak sie z tym serem zetknac".
    -- Agroturystyka zaznaczy degustacje albo posilki dla gosci.
    IF array_length(NEW.forma_sprzedazy, 1) IS NULL THEN
      RAISE EXCEPTION 'Zaznacz, w jaki sposob mozna spróbowac lub kupic Twoj ser.';
    END IF;

    IF COALESCE(NEW.telefon, '') = '' AND COALESCE(NEW.email_kontakt, '') = ''
       AND COALESCE(NEW.www, '') = '' AND COALESCE(NEW.facebook, '') = '' THEN
      RAISE EXCEPTION 'Podaj przynajmniej jeden kontakt.';
    END IF;

  END IF;

  RETURN NEW;
END;
$$;


-- ---------------------------------------------------------------------
-- Kolejka moderacji — sygnały jako KONTEKST, nie wyrok
-- ---------------------------------------------------------------------
-- WNI i ewidencja zostają, ale jako informacja pomocnicza. Ich brak nie
-- oznacza, że zgłaszający nie robi sera — agroturystyka nie ma obowiazku
-- rejestracji RHD, a ewidencje prowadzi u nas mala czesc uzytkownikow.
--
-- ⚠️ DROP przed CREATE jest KONIECZNY: dokładamy kolumnę typ_dzialalnosci
-- do RETURNS TABLE, a CREATE OR REPLACE nie potrafi zmienić typu zwracanego
-- ("cannot change return type of existing function"). DROP kasuje też
-- uprawnienia, dlatego GRANT niżej nadajemy ponownie.
DROP FUNCTION IF EXISTS public.serowarnie_do_moderacji();

CREATE FUNCTION public.serowarnie_do_moderacji()
RETURNS TABLE (
  id UUID, slug TEXT, nazwa TEXT, opis TEXT,
  wojewodztwo TEXT, miejscowosc TEXT,
  produkty TEXT[], rodzaj_mleka TEXT[], forma_sprzedazy TEXT[],
  telefon TEXT, email_kontakt TEXT, www TEXT, facebook TEXT,
  nr_weterynaryjny TEXT, status TEXT,
  typ_dzialalnosci TEXT,
  email_konta TEXT,
  ma_ewidencje BOOLEAN,
  zarejestrowany TIMESTAMPTZ,
  zgloszony TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT
    s.id, s.slug, s.nazwa, s.opis,
    s.wojewodztwo, s.miejscowosc,
    s.produkty, s.rodzaj_mleka, s.forma_sprzedazy,
    s.telefon, s.email_kontakt, s.www, s.facebook,
    s.nr_weterynaryjny, s.status,
    s.typ_dzialalnosci,
    p.email,
    EXISTS (SELECT 1 FROM public.sales_records sr WHERE sr.user_id = s.user_id),
    p.created_at,
    s.updated_at
  FROM public.serowarnie s
  LEFT JOIN public.profiles p ON p.id = s.user_id
  ORDER BY
    CASE s.status WHEN 'oczekuje' THEN 0 WHEN 'opublikowany' THEN 1 ELSE 2 END,
    s.updated_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.serowarnie_do_moderacji() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.serowarnie_do_moderacji() TO authenticated;


-- ---------- [14/16] 20260804090000_wizytowki_zdjecia_i_wpisy.sql ----------
-- =====================================================================
-- WIZYTÓWKI: zdjęcia + aktualności
--
-- ⚠️ NAZEWNICTWO: zlecenie mówi o tabeli "wizytowki", ale w kodzie tabela
-- nazywa się "serowarnie" (trasa /serowarnie/:slug). Trzymamy nazwy z kodu.
-- Tabela wpisów: serowarnia_wpisy (nie wizytowka_wpisy).
--
-- ⚠️ EXIF/GPS: zdjęcia z telefonu niosą współrzędne GPS gospodarstwa, które
-- często jest też miejscem zamieszkania. Czyszczenie odbywa się PO STRONIE
-- KLIENTA (src/lib/image.ts, przerysowanie na canvas). Baza tego nie zrobi —
-- dlatego upload MUSI iść przez tę funkcję.
--
-- URUCHOMIĆ w Supabase SQL editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Storage
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('wizytowki', 'wizytowki', true, 3145728,
        ARRAY['image/jpeg','image/webp','image/png'])
ON CONFLICT (id) DO NOTHING;

-- Ścieżka pliku: {user_id}/{typ}-{timestamp}.jpg
DROP POLICY IF EXISTS "Publiczny odczyt zdjec wizytowek" ON storage.objects;
CREATE POLICY "Publiczny odczyt zdjec wizytowek"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wizytowki');

DROP POLICY IF EXISTS "Upload tylko do wlasnego katalogu" ON storage.objects;
CREATE POLICY "Upload tylko do wlasnego katalogu"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'wizytowki'
              AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Usuwanie tylko wlasnych plikow" ON storage.objects;
CREATE POLICY "Usuwanie tylko wlasnych plikow"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'wizytowki'
         AND (storage.foldername(name))[1] = auth.uid()::text);

-- Podmiana istniejącego pliku o tej samej nazwie (upsert)
DROP POLICY IF EXISTS "Nadpisywanie tylko wlasnych plikow" ON storage.objects;
CREATE POLICY "Nadpisywanie tylko wlasnych plikow"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'wizytowki'
         AND (storage.foldername(name))[1] = auth.uid()::text);


-- ---------------------------------------------------------------------
-- 2. Zdjęcia wizytówki
-- ---------------------------------------------------------------------
ALTER TABLE public.serowarnie
  ADD COLUMN IF NOT EXISTS zdjecie_glowne TEXT,
  ADD COLUMN IF NOT EXISTS galeria JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Galeria: [{url, opis}] — max 6. Kolejność w tablicy = kolejność wyświetlania.
ALTER TABLE public.serowarnie
  DROP CONSTRAINT IF EXISTS serowarnie_galeria_max6;
ALTER TABLE public.serowarnie
  ADD CONSTRAINT serowarnie_galeria_max6
  CHECK (jsonb_array_length(galeria) <= 6);

COMMENT ON COLUMN public.serowarnie.galeria IS
  'Tablica [{url, opis}], max 6. Opis trafia do atrybutu alt.';


-- ---------------------------------------------------------------------
-- 3. Aktualności
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.serowarnia_wpisy (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serowarnia_id UUID NOT NULL REFERENCES public.serowarnie(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tresc         TEXT NOT NULL CHECK (char_length(tresc) BETWEEN 1 AND 600),
  zdjecie_url   TEXT,
  utworzono     TIMESTAMPTZ NOT NULL DEFAULT now(),
  wygasa        DATE,
  opublikowany  BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS serowarnia_wpisy_feed_idx
  ON public.serowarnia_wpisy (serowarnia_id, utworzono DESC);

ALTER TABLE public.serowarnia_wpisy ENABLE ROW LEVEL SECURITY;

-- ⚠️ Wpis jest widoczny publicznie TYLKO wtedy, gdy sama wizytówka jest
-- opublikowana i za zgodą. Bez tego warunku wpisy z wizytówki w moderacji
-- albo po wycofaniu zgody byłyby dostępne — obejście całej ochrony katalogu.
DROP POLICY IF EXISTS "Wpisy widoczne przy opublikowanej wizytowce" ON public.serowarnia_wpisy;
CREATE POLICY "Wpisy widoczne przy opublikowanej wizytowce"
  ON public.serowarnia_wpisy FOR SELECT
  TO anon, authenticated
  USING (
    opublikowany = true
    AND EXISTS (
      SELECT 1 FROM public.serowarnie s
      WHERE s.id = serowarnia_id
        AND s.status = 'opublikowany'
        AND s.zgoda_publikacja = true
    )
  );

DROP POLICY IF EXISTS "Wlasciciel zarzadza swoimi wpisami" ON public.serowarnia_wpisy;
CREATE POLICY "Wlasciciel zarzadza swoimi wpisami"
  ON public.serowarnia_wpisy FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin zarzadza wpisami" ON public.serowarnia_wpisy;
CREATE POLICY "Admin zarzadza wpisami"
  ON public.serowarnia_wpisy FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ---------------------------------------------------------------------
-- 4. Limit wpisów: 10 dziennie na wizytówkę
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.serowarnia_wpisy_limit_dzienny()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  ile INT;
BEGIN
  SELECT count(*) INTO ile
  FROM public.serowarnia_wpisy
  WHERE serowarnia_id = NEW.serowarnia_id
    AND utworzono >= date_trunc('day', now());

  IF ile >= 10 THEN
    RAISE EXCEPTION 'Limit 10 wpisow dziennie zostal wyczerpany. Sprobuj jutro.';
  END IF;

  -- Wpis zawsze przypisany do wlasciciela wizytowki
  IF NOT EXISTS (
    SELECT 1 FROM public.serowarnie s
    WHERE s.id = NEW.serowarnia_id AND s.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Mozna dodawac wpisy tylko do wlasnej wizytowki.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS serowarnia_wpisy_limit ON public.serowarnia_wpisy;
CREATE TRIGGER serowarnia_wpisy_limit
  BEFORE INSERT ON public.serowarnia_wpisy
  FOR EACH ROW EXECUTE FUNCTION public.serowarnia_wpisy_limit_dzienny();


-- ---------- [15/16] 20260811090000_moderacja_raz_plus_zawieszanie.sql ----------
-- =====================================================================
-- MODERACJA RAZ, POTEM ZAWIESZANIE
--
-- Uwagi Marka:
--   1. Kazda zmiana w wizytowce wracala do moderacji - nie do utrzymania.
--      Producent poprawiajacy literowke czekal na akceptacje.
--   2. Panel moderacji nie pokazywal zdjec, wiec nie bylo wiadomo,
--      co sie wlasciwie akceptuje.
--
-- Nowy model:
--   - PIERWSZA publikacja przechodzi przez moderacje (jak dotad)
--   - po akceptacji wlasciciel edytuje swobodnie, zmiany ida od razu
--   - admin moze ZAWIESIC wizytowke z podaniem powodu; wlasciciel widzi
--     powod i po poprawieniu zglasza ponownie
--
-- URUCHOMIC w Supabase SQL editor.
-- =====================================================================

-- Nowy status
ALTER TABLE public.serowarnie DROP CONSTRAINT IF EXISTS serowarnie_status_check;
ALTER TABLE public.serowarnie
  ADD CONSTRAINT serowarnie_status_check
  CHECK (status IN ('szkic','oczekuje','opublikowany','odrzucony','zawieszony'));

COMMENT ON COLUMN public.serowarnie.powod_odrzucenia IS
  'Powod odrzucenia LUB zawieszenia. Widoczny dla wlasciciela w jego panelu.';


-- ---------------------------------------------------------------------
-- Blokada samopublikacji — wersja z pamiecia o wczesniejszej akceptacji
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.serowarnie_blokuj_samopublikacje()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;   -- admin moderuje bez ograniczen
  END IF;

  -- INSERT: nowa wizytowka zawsze zaczyna od szkicu albo kolejki
  IF TG_OP = 'INSERT' THEN
    IF NEW.status NOT IN ('szkic','oczekuje') THEN
      RAISE EXCEPTION 'Publikacja wymaga akceptacji moderatora.';
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE: wizytowka RAZ zaakceptowana pozostaje opublikowana,
  -- a wlasciciel edytuje ja swobodnie. To jest sedno zmiany.
  IF OLD.status = 'opublikowany' AND NEW.status = 'opublikowany' THEN
    RETURN NEW;
  END IF;

  -- Zawieszona: wlasciciel moze poprawic i zglosic ponownie, ale nie
  -- moze sam sie odwiesic.
  IF OLD.status IN ('zawieszony','odrzucony') AND NEW.status = 'opublikowany' THEN
    RAISE EXCEPTION 'Wizytowka wymaga ponownej akceptacji moderatora.';
  END IF;

  IF NEW.status NOT IN ('szkic','oczekuje') THEN
    RAISE EXCEPTION 'Publikacja wymaga akceptacji moderatora.';
  END IF;

  -- Powod zawieszenia/odrzucenia zostaje - wlasciciel go nie kasuje
  IF OLD.powod_odrzucenia IS NOT NULL AND NEW.status = 'oczekuje' THEN
    NEW.powod_odrzucenia := OLD.powod_odrzucenia;
  END IF;

  RETURN NEW;
END;
$$;


-- ---------------------------------------------------------------------
-- Kolejka moderacji — teraz ze zdjeciami
-- ---------------------------------------------------------------------
-- ⚠️ DROP przed CREATE: dokladamy kolumny do RETURNS TABLE, a CREATE OR
-- REPLACE nie potrafi zmienic typu zwracanego. DROP kasuje uprawnienia,
-- wiec GRANT nizej nadaje je ponownie.
DROP FUNCTION IF EXISTS public.serowarnie_do_moderacji();

CREATE FUNCTION public.serowarnie_do_moderacji()
RETURNS TABLE (
  id UUID, slug TEXT, nazwa TEXT, opis TEXT,
  wojewodztwo TEXT, miejscowosc TEXT,
  produkty TEXT[], rodzaj_mleka TEXT[], forma_sprzedazy TEXT[],
  telefon TEXT, email_kontakt TEXT, www TEXT, facebook TEXT,
  nr_weterynaryjny TEXT, status TEXT,
  typ_dzialalnosci TEXT,
  zdjecie_glowne TEXT,
  galeria JSONB,
  powod_odrzucenia TEXT,
  email_konta TEXT,
  ma_ewidencje BOOLEAN,
  zarejestrowany TIMESTAMPTZ,
  zgloszony TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT
    s.id, s.slug, s.nazwa, s.opis,
    s.wojewodztwo, s.miejscowosc,
    s.produkty, s.rodzaj_mleka, s.forma_sprzedazy,
    s.telefon, s.email_kontakt, s.www, s.facebook,
    s.nr_weterynaryjny, s.status,
    s.typ_dzialalnosci,
    s.zdjecie_glowne,
    s.galeria,
    s.powod_odrzucenia,
    p.email,
    EXISTS (SELECT 1 FROM public.sales_records sr WHERE sr.user_id = s.user_id),
    p.created_at,
    s.updated_at
  FROM public.serowarnie s
  LEFT JOIN public.profiles p ON p.id = s.user_id
  ORDER BY
    CASE s.status
      WHEN 'oczekuje' THEN 0
      WHEN 'zawieszony' THEN 1
      WHEN 'opublikowany' THEN 2
      ELSE 3
    END,
    s.updated_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.serowarnie_do_moderacji() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.serowarnie_do_moderacji() TO authenticated;


-- ---------- [16/16] 20260831120000_feed_ingredients_i_feed_recipes.sql ----------
-- ============================================================================
-- feed_ingredients i feed_recipes — tabele kalkulatora pasz
--
-- DLACZEGO TA MIGRACJA POWSTAJE DOPIERO TERAZ: obie tabele zostały kiedyś
-- utworzone bezpośrednio w panelu i nigdy nie trafiły do migracji. Wyszło to
-- przy przenosinach z Lovable Cloud: porównanie tabel tworzonych przez migracje
-- z tabelami używanymi przez aplikację pokazało dwie dziury. Na czystym projekcie
-- migracje nie utworzyłyby ich wcale, import 127 składników poszedłby na błąd,
-- a kalkulator pasz — najczęściej otwierana strona serwisu — przestałby działać.
--
-- Definicje odtworzone 1:1 ze starego projektu (information_schema.columns,
-- pg_policies, pg_constraint), nie z pamięci.
--
-- Wymaga wcześniejszej migracji z funkcją public.has_role() i typem app_role
-- (20251121074144_*), dlatego data w nazwie jest późniejsza.
-- ============================================================================

-- --- Składniki paszowe: baza wspólna, moderowana --------------------------
CREATE TABLE IF NOT EXISTS public.feed_ingredients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nazwa         text NOT NULL,
  kategoria     text,
  em            numeric,
  bialko        numeric,
  ca            numeric,
  p             numeric,
  wlokno        numeric,
  na            numeric,
  k             numeric,
  mg            numeric,
  mn            numeric,
  zn            numeric,
  se            numeric,
  fe            numeric,
  i             numeric,
  zrodlo        text,
  status        text NOT NULL DEFAULT 'pending',
  submitted_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  source        text NOT NULL DEFAULT 'user',
  CONSTRAINT feed_ingredients_status_check
    CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))
);

ALTER TABLE public.feed_ingredients ENABLE ROW LEVEL SECURITY;

-- Zatwierdzone składniki widzi każdy — to publiczna baza kalkulatora.
DROP POLICY IF EXISTS feed_approved_readable_by_everyone ON public.feed_ingredients;
CREATE POLICY feed_approved_readable_by_everyone
  ON public.feed_ingredients FOR SELECT TO public
  USING (status = 'approved'::text);

-- Autor widzi też własne zgłoszenia, zanim ktoś je zatwierdzi.
DROP POLICY IF EXISTS feed_own_visible_to_author ON public.feed_ingredients;
CREATE POLICY feed_own_visible_to_author
  ON public.feed_ingredients FOR SELECT TO authenticated
  USING (submitted_by = auth.uid());

-- Zgłaszać może zalogowany, ale tylko w swoim imieniu i tylko jako "pending" —
-- inaczej dałoby się wstawić własny składnik od razu jako zatwierdzony.
DROP POLICY IF EXISTS feed_insert_by_authenticated ON public.feed_ingredients;
CREATE POLICY feed_insert_by_authenticated
  ON public.feed_ingredients FOR INSERT TO authenticated
  WITH CHECK ((submitted_by = auth.uid()) AND (status = 'pending'::text));

DROP POLICY IF EXISTS feed_admin_full_access ON public.feed_ingredients;
CREATE POLICY feed_admin_full_access
  ON public.feed_ingredients FOR ALL TO authenticated
  USING (public.has_role(_user_id => auth.uid(), _role => 'admin'::public.app_role))
  WITH CHECK (public.has_role(_user_id => auth.uid(), _role => 'admin'::public.app_role));

-- --- Zapisane receptury: prywatne, per użytkownik -------------------------
CREATE TABLE IF NOT EXISTS public.feed_recipes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  nazwa       text NOT NULL,
  norma       text NOT NULL,
  skladniki   jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feed_recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recipes" ON public.feed_recipes;
CREATE POLICY "Users can view own recipes"
  ON public.feed_recipes FOR SELECT TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recipes" ON public.feed_recipes;
CREATE POLICY "Users can insert own recipes"
  ON public.feed_recipes FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recipes" ON public.feed_recipes;
CREATE POLICY "Users can update own recipes"
  ON public.feed_recipes FOR UPDATE TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recipes" ON public.feed_recipes;
CREATE POLICY "Users can delete own recipes"
  ON public.feed_recipes FOR DELETE TO public
  USING (auth.uid() = user_id);
