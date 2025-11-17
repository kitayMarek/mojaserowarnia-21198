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