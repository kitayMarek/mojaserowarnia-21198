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