-- Drop insecure RLS policies on culture_audit_log
DROP POLICY IF EXISTS "Anyone can view audit logs" ON public.culture_audit_log;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.culture_audit_log;

-- Audit log should only be managed by service role (backend/edge functions)
-- No policies = only service role can access
-- This prevents public exposure and unauthorized insertions