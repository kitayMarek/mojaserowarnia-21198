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