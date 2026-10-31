-- ================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES - SUPABASE
-- ================================================================
-- 
-- Sécurisation complète du modèle de données :
-- - User : Chacun voit/modifie seulement son profil
-- - Deck : Tous les utilisateurs voient les decks; seul leur propriétaire les modifie
-- - Card : Publique (lecture), backend seulement (write)
-- - DeckCard : Lecture publique; écriture réservée au propriétaire du deck parent
--
-- EXÉCUTION:
--   1. Aller sur https://supabase.io → SQL Editor
--   2. Créer une nouvelle requête
--   3. Copier/coller ce script
--   4. Cliquer "RUN"
--
-- ================================================================

-- ================================================================
-- CLEANUP: Supprimer les anciennes policies
-- ================================================================

DROP POLICY IF EXISTS "Users can read all decks" ON public."Deck";
DROP POLICY IF EXISTS "Users can view own or public decks" ON public."Deck";
DROP POLICY IF EXISTS "Users can view own decks" ON public."Deck";
DROP POLICY IF EXISTS "Users can only modify their own decks" ON public."Deck";
DROP POLICY IF EXISTS "Users can only delete their own decks" ON public."Deck";
DROP POLICY IF EXISTS "Users can create decks" ON public."Deck";
DROP POLICY IF EXISTS "Users can read all deck cards" ON public."DeckCard";
DROP POLICY IF EXISTS "Users can view own or public deckcard" ON public."DeckCard";
DROP POLICY IF EXISTS "Users can modify deck cards they own" ON public."DeckCard";
DROP POLICY IF EXISTS "Users can modify deck cards in own decks" ON public."DeckCard";
DROP POLICY IF EXISTS "Users can delete deck cards from their decks" ON public."DeckCard";
DROP POLICY IF EXISTS "Users can delete deck cards from own decks" ON public."DeckCard";
DROP POLICY IF EXISTS "Users can insert deck cards in their decks" ON public."DeckCard";
DROP POLICY IF EXISTS "Users can insert deck cards in own decks" ON public."DeckCard";
DROP POLICY IF EXISTS "Users can read all users" ON public."User";
DROP POLICY IF EXISTS "Users can read own user record" ON public."User";
DROP POLICY IF EXISTS "Users can insert own user record" ON public."User";
DROP POLICY IF EXISTS "Users can update own user record" ON public."User";
DROP POLICY IF EXISTS "Anyone can read cards" ON public."Card";
DROP POLICY IF EXISTS "Card table is publicly readable" ON public."Card";
DROP POLICY IF EXISTS "Authenticated can read migrations" ON public."_prisma_migrations";

-- ================================================================
-- 1. USER TABLE - Sécuriser les profils
-- ================================================================

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

-- Un utilisateur ne peut lire que son propre profil.
CREATE POLICY "Users can read own user record" ON public."User"
  FOR SELECT USING ((select auth.uid()::text) = id);

-- Policy: Les users authentifiés peuvent créer LEURS propres enregistrements
CREATE POLICY "Users can insert own user record" ON public."User"
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Policy: Les users peuvent modifier SEULEMENT leur profil
CREATE POLICY "Users can update own user record" ON public."User"
  FOR UPDATE
  USING ((select auth.uid()::text) = id)
  WITH CHECK ((select auth.uid()::text) = id);

-- ================================================================
-- 2. DECK TABLE - Users managent leurs decks
-- ================================================================

ALTER TABLE public."Deck" ENABLE ROW LEVEL SECURITY;

-- Tous les decks sont visibles; seuls leurs propriétaires peuvent les modifier.
CREATE POLICY "Users can read all decks" ON public."Deck"
  FOR SELECT USING (true);

-- Policy: Les users peuvent modifier SEULEMENT leurs decks
CREATE POLICY "Users can only modify their own decks" ON public."Deck"
  FOR UPDATE
  USING ((select auth.uid()::text) = "userId")
  WITH CHECK ((select auth.uid()::text) = "userId");

-- Policy: Les users peuvent supprimer SEULEMENT leurs decks
CREATE POLICY "Users can only delete their own decks" ON public."Deck"
  FOR DELETE USING ((select auth.uid()::text) = "userId");

-- Policy: Les users peuvent créer des decks
CREATE POLICY "Users can create decks" ON public."Deck"
  FOR INSERT WITH CHECK ((select auth.uid()::text) = "userId");

-- ================================================================
-- 3. CARD TABLE - Publique en lecture, backend en écriture
-- ================================================================

ALTER TABLE public."Card" ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les cartes
CREATE POLICY "Card table is publicly readable" ON public."Card"
  FOR SELECT USING (true);

-- NOTE: Les INSERT/UPDATE/DELETE sont bloqués aux clients normaux
-- Seul le backend (service_role) peut les faire
-- Les users ne peuvent pas modifier les cartes directement

-- ================================================================
-- 4. DECKCARD TABLE - Hérité des permissions du Deck parent
-- ================================================================

ALTER TABLE public."DeckCard" ENABLE ROW LEVEL SECURITY;

-- Les decks étant visibles par tous, leurs cartes le sont aussi.
CREATE POLICY "Users can read all deck cards" ON public."DeckCard"
  FOR SELECT USING (true);

-- Policy: Les users peuvent modifier les cartes de leurs decks SEULEMENT
CREATE POLICY "Users can modify deck cards in own decks" ON public."DeckCard"
  FOR UPDATE 
  USING (
    (select auth.uid()::text) IN (
      SELECT "userId" FROM public."Deck" WHERE id = "deckId"
    )
  )
  WITH CHECK (
    (select auth.uid()::text) IN (
      SELECT "userId" FROM public."Deck" WHERE id = "deckId"
    )
  );

-- Policy: Les users peuvent supprimer les cartes de leurs decks SEULEMENT
CREATE POLICY "Users can delete deck cards from own decks" ON public."DeckCard"
  FOR DELETE 
  USING (
    (select auth.uid()::text) IN (
      SELECT "userId" FROM public."Deck" WHERE id = "deckId"
    )
  );

-- Policy: Les users peuvent ajouter des cartes À LEURS DECKS SEULEMENT
CREATE POLICY "Users can insert deck cards in own decks" ON public."DeckCard"
  FOR INSERT 
  WITH CHECK (
    (select auth.uid()::text) IN (
      SELECT "userId" FROM public."Deck" WHERE id = "deckId"
    )
  );

-- ================================================================
-- 5. PERMISSIONS GLOBALES
-- ================================================================

-- Permissions minimales : RLS contrôle ensuite les lignes accessibles.
REVOKE ALL ON public."User", public."Deck", public."Card",
  public."DeckCard", public."_prisma_migrations" FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public."User" TO authenticated;
GRANT SELECT ON public."Deck", public."Card", public."DeckCard" TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public."Deck", public."DeckCard" TO authenticated;

-- ================================================================
-- VERIFICATION: Vérifier que RLS est activé
-- ================================================================
/*
SELECT 
  tablename, 
  rowsecurity,
  CASE WHEN rowsecurity THEN '✅ RLS ACTIVÉ' ELSE '❌ RLS DÉSACTIVÉ' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('User', 'Deck', 'Card', 'DeckCard')
ORDER BY tablename;

-- Lister les policies créées
SELECT 
  tablename, 
  policyname,
  CASE permissive WHEN true THEN 'ALLOW' ELSE 'DENY' END as type,
  qual as condition
FROM pg_policies
WHERE tablename IN ('User', 'Deck', 'Card', 'DeckCard')
ORDER BY tablename, policyname;
*/

-- ================================================================
-- TESTS A FAIRE APRÈS L'ACTIVATION
-- ================================================================
--
-- ✅ TEST 1: Login comme User A
--   - SELECT * FROM "User" WHERE id = user_a_id (✅ Doit voir)
--   - SELECT * FROM "User" WHERE id = user_b_id (❌ Ne doit pas voir)
--   - UPDATE "User" SET name='Test' WHERE id = user_a_id (✅ Doit marcher)
--   - UPDATE "User" SET name='Test' WHERE id = user_b_id (❌ Doit échouer)
--
-- ✅ TEST 2: Decks
--   - CREATE Deck (userId=user_a_id) (✅ Doit marcher)
--   - SELECT * FROM "Deck" (✅ Doit voir les decks)
--   - Login comme User B, SELECT * FROM "Deck" (✅ Voit les decks)
--
-- ✅ TEST 3: Modification
--   - User B essaie de modifier le deck de A (❌ Doit échouer)
--
-- ✅ TEST 4: Cards
--   - SELECT * FROM "Card" (✅ User A et B voient)
--   - INSERT INTO "Card" ... (❌ User A échoue)
--   - INSERT INTO "Card" ... as backend/service_role (✅ Marche)
--
-- ✅ TEST 5: DeckCards
--   - INSERT INTO "DeckCard" (deckId=user_a_deck, ...) as User A (✅ Marche)
--   - INSERT INTO "DeckCard" (deckId=user_b_deck, ...) as User A (❌ Échoue)
--
