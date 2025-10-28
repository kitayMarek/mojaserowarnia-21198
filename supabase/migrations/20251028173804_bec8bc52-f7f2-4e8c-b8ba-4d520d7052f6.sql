-- Tabela dla reakcji (łapka/serce)
CREATE TABLE reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL,
  content_id text NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'love')),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, content_type, content_id)
);

-- Indeksy dla wydajności
CREATE INDEX idx_reactions_content ON reactions(content_type, content_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
CREATE INDEX idx_reactions_type ON reactions(reaction_type);

-- RLS policies
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Użytkownicy mogą dodawać własne reakcje
CREATE POLICY "Users can insert own reactions"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Użytkownicy mogą aktualizować własne reakcje
CREATE POLICY "Users can update own reactions"
  ON reactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Użytkownicy mogą usuwać własne reakcje
CREATE POLICY "Users can delete own reactions"
  ON reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Wszyscy mogą czytać reakcje (publiczne)
CREATE POLICY "Anyone can read reactions"
  ON reactions FOR SELECT
  TO public
  USING (true);

-- Widok agregujący statystyki z punktacją
CREATE VIEW reactions_stats AS
SELECT 
  content_type,
  content_id,
  COUNT(CASE WHEN reaction_type = 'like' THEN 1 END) as likes_count,
  COUNT(CASE WHEN reaction_type = 'love' THEN 1 END) as loves_count,
  (COUNT(CASE WHEN reaction_type = 'like' THEN 1 END) * 1 + 
   COUNT(CASE WHEN reaction_type = 'love' THEN 1 END) * 2) as total_points
FROM reactions
GROUP BY content_type, content_id;

-- Publiczny dostęp do statystyk
GRANT SELECT ON reactions_stats TO anon, authenticated;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;