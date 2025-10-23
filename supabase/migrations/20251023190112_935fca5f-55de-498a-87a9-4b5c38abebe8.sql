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