-- Statystyki zapytań kierowanych do modeli LLM z widgetu AskLLM (np. na /baza-kultur)
CREATE TABLE public.llm_queries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  query text NOT NULL,
  model text NOT NULL CHECK (model IN ('claude', 'perplexity', 'chatgpt')),
  source text NOT NULL DEFAULT 'baza-kultur',
  is_custom boolean NOT NULL DEFAULT false
);

-- Indeksy do szybkich statystyk
CREATE INDEX llm_queries_query_idx ON public.llm_queries (query);
CREATE INDEX llm_queries_created_at_idx ON public.llm_queries (created_at);

GRANT INSERT ON public.llm_queries TO anon;
GRANT INSERT, SELECT ON public.llm_queries TO authenticated;
GRANT ALL ON public.llm_queries TO service_role;

ALTER TABLE public.llm_queries ENABLE ROW LEVEL SECURITY;

-- Publiczny zapis (fire-and-forget z frontendu), bez możliwości odczytu dla anon
CREATE POLICY "Anyone can insert llm queries"
ON public.llm_queries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Odczyt statystyk tylko dla zalogowanych (panel/admin)
CREATE POLICY "Authenticated can view llm queries"
ON public.llm_queries
FOR SELECT
TO authenticated
USING (true);
