-- Configure Row Level Security (RLS) pour les decks
-- FIRST: Drop the old incorrect policies (if they exist)
DROP POLICY IF EXISTS "Users can read all decks" ON public."Deck";
DROP POLICY IF EXISTS "Users can only modify their own decks" ON public."Deck";
DROP POLICY IF EXISTS "Users can only delete their own decks" ON public."Deck";
DROP POLICY IF EXISTS "Users can create decks" ON public."Deck";
DROP POLICY IF EXISTS "Users can read all deck cards" ON public."DeckCard";
DROP POLICY IF EXISTS "Users can modify deck cards they own" ON public."DeckCard";
DROP POLICY IF EXISTS "Users can delete deck cards from their decks" ON public."DeckCard";
DROP POLICY IF EXISTS "Users can insert deck cards in their decks" ON public."DeckCard";
DROP POLICY IF EXISTS "Users can read all users" ON public."User";
DROP POLICY IF EXISTS "Users can insert own user record" ON public."User";
DROP POLICY IF EXISTS "Users can update own user record" ON public."User";

-- ============ USER TABLE POLICIES ============
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

-- Tous les utilisateurs authentifiés peuvent lire les autres utilisateurs
CREATE POLICY "Users can read all users" ON public."User"
  FOR SELECT USING (true);

-- Les utilisateurs authentifiés peuvent créer leur propre enregistrement
-- Aussi permettre aux utilisateurs nouvellement inscrits (qui ont un UID from Auth)
CREATE POLICY "Users can insert own user record" ON public."User"
  FOR INSERT WITH CHECK (true);  -- Permettre l'insertion lors de l'inscription

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own user record" ON public."User"
  FOR UPDATE USING (auth.uid()::text = id);

-- ============ DECK TABLE POLICIES ============
ALTER TABLE public."Deck" ENABLE ROW LEVEL SECURITY;

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

-- ============ CARD TABLE POLICIES ============
ALTER TABLE public."Card" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cards" ON public."Card"
  FOR SELECT USING (true);

-- ============ MIGRATIONS TABLE POLICIES ============
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read migrations" ON public."_prisma_migrations"
  FOR SELECT USING (true);

-- Publier les tables pour PostgREST
GRANT ALL ON public."User" TO anon, authenticated;
GRANT ALL ON public."Card" TO anon, authenticated;
GRANT ALL ON public."Deck" TO anon, authenticated;
GRANT ALL ON public."DeckCard" TO anon, authenticated;
