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