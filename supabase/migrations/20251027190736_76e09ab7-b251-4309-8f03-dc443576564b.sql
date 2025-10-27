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