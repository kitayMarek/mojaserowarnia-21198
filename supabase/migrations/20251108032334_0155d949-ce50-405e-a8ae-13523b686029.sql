-- Create table for feed recipes
CREATE TABLE public.feed_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nazwa TEXT NOT NULL,
  norma TEXT NOT NULL,
  skladniki JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feed_recipes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own recipes" 
ON public.feed_recipes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" 
ON public.feed_recipes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" 
ON public.feed_recipes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" 
ON public.feed_recipes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_feed_recipes_updated_at
BEFORE UPDATE ON public.feed_recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();