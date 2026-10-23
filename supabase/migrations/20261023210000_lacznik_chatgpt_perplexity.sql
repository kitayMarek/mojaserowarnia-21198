-- llm_queries przyjmuje tez klikniecia przyciskow „Dodaj do ChatGPT” i „Dodaj do
-- Perplexity” (modele 'lacznik-chatgpt' i 'lacznik-perplexity', 23.10.2026).
-- Bez tego CHECK z 20261021210000 po cichu odrzucal te wpisy: strona nie czeka
-- na zapis, a worker tylko loguje blad. Ten sam sposob co tam: zdejmujemy kazdy
-- CHECK na kolumnie model i zakladamy nowy.
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.llm_queries'::regclass AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%model%'
  LOOP
    EXECUTE format('ALTER TABLE public.llm_queries DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.llm_queries
  ADD CONSTRAINT llm_queries_model_check
  CHECK (model IN ('claude', 'perplexity', 'chatgpt', 'lacznik-claude', 'lacznik-chatgpt', 'lacznik-perplexity'));
