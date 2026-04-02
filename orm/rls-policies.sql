-- Configure Row Level Security (RLS) pour les decks
-- FIRST: Drop the old incorrect policies (if they exist)
DROP POLICY IF EXISTS "Users can only modify their own decks" ON public."Deck";
DROP POLICY IF EXISTS "Users can only delete their own decks" ON public."Deck";
DROP POLICY IF EXISTS "Users can create decks" ON public."Deck";
DROP POLICY IF EXISTS "Users can modify deck cards they own" ON public."DeckCard";
DROP POLICY IF EXISTS "Users can delete deck cards from their decks" ON public."DeckCard";
DROP POLICY IF EXISTS "Users can insert deck cards in their decks" ON public."DeckCard";

-- Activer RLS on the tables
ALTER TABLE public."Deck" ENABLE ROW LEVEL SECURITY;

-- Politique pour que les users ne voient que leurs propres decks en modification
-- (mais tous les decks en lecture)
CREATE POLICY "Users can read all decks" ON public."Deck"
  FOR SELECT USING (true);

CREATE POLICY "Users can only modify their own decks" ON public."Deck"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can only delete their own decks" ON public."Deck"
  FOR DELETE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create decks" ON public."Deck"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- Activer RLS sur DeckCard (optionnel mais recommandé)
ALTER TABLE public."DeckCard" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all deck cards" ON public."DeckCard"
  FOR SELECT USING (true);

CREATE POLICY "Users can modify deck cards they own" ON public."DeckCard"
  FOR UPDATE 
  USING (
    auth.uid()::text IN (
      SELECT "userId" FROM public."Deck" WHERE id = "deckId"
    )
  );

CREATE POLICY "Users can delete deck cards from their decks" ON public."DeckCard"
  FOR DELETE 
  USING (
    auth.uid()::text IN (
      SELECT "userId" FROM public."Deck" WHERE id = "deckId"
    )
  );

CREATE POLICY "Users can insert deck cards in their decks" ON public."DeckCard"
  FOR INSERT 
  WITH CHECK (
    auth.uid()::text IN (
      SELECT "userId" FROM public."Deck" WHERE id = "deckId"
    )
  );

-- Publier la table Card pour PostgREST
GRANT ALL ON public."Card" TO anon, authenticated;
GRANT ALL ON public."Deck" TO anon, authenticated;
GRANT ALL ON public."DeckCard" TO anon, authenticated;
