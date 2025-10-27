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