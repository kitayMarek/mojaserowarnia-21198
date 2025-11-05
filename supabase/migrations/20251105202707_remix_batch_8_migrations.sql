
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
