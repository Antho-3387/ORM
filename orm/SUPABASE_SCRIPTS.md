# Scripts SQL Supabase

Les trois scripts sont séparés ci-dessous pour pouvoir les copier dans le SQL Editor de Supabase.

> **Important :** le script 1 crée les tables manquantes et complète certaines colonnes sans supprimer les tables ni leurs données. Si tes tables existent déjà, ne le relance pas nécessairement : applique le script 2 pour les règles RLS, puis le script 3 pour vérifier la configuration.
>
> Exécute chaque partie séparément, dans l'ordre, dans le SQL Editor de Supabase.

## Partie 1 — Créer ou compléter les tables

```sql
-- Créer ou compléter le schéma sans supprimer les tables ni leurs données.

-- Table User
CREATE TABLE IF NOT EXISTS public."User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Table Deck
CREATE TABLE IF NOT EXISTS public."Deck" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  list TEXT,
  "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Deck_userId_idx" ON public."Deck"("userId");

-- Table Card
CREATE TABLE IF NOT EXISTS public."Card" (
  id TEXT PRIMARY KEY,
  "scryfallId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  "manaValue" INTEGER,
  colors TEXT DEFAULT '',
  type TEXT NOT NULL,
  "imageUrl" TEXT,
  "cachedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastSearchedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "searchCount" INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'scryfall'
);

ALTER TABLE public."Card"
  ADD COLUMN IF NOT EXISTS "cachedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS "lastSearchedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS "searchCount" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'scryfall';

CREATE INDEX IF NOT EXISTS "Card_name_idx" ON public."Card"(name);
CREATE INDEX IF NOT EXISTS "Card_scryfallId_idx" ON public."Card"("scryfallId");
CREATE INDEX IF NOT EXISTS "Card_lastSearchedAt_idx" ON public."Card"("lastSearchedAt");
CREATE INDEX IF NOT EXISTS "Card_searchCount_idx" ON public."Card"("searchCount" DESC);

-- Table DeckCard
CREATE TABLE IF NOT EXISTS public."DeckCard" (
  id TEXT PRIMARY KEY,
  "deckId" TEXT NOT NULL REFERENCES public."Deck"(id) ON DELETE CASCADE,
  "cardId" TEXT NOT NULL REFERENCES public."Card"(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  UNIQUE("deckId", "cardId")
);

CREATE INDEX IF NOT EXISTS "DeckCard_deckId_idx" ON public."DeckCard"("deckId");
CREATE INDEX IF NOT EXISTS "DeckCard_cardId_idx" ON public."DeckCard"("cardId");

-- Prisma migrations table
CREATE TABLE IF NOT EXISTS public."_prisma_migrations" (
  id TEXT PRIMARY KEY,
  checksum TEXT NOT NULL,
  "finished_at" TIMESTAMP,
  migration_name TEXT NOT NULL,
  logs TEXT,
  rolled_back_at TIMESTAMP,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  applied_migrations_count INTEGER NOT NULL DEFAULT 0
);

-- Activer RLS sur les tables
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Deck" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Card" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DeckCard" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
```

## Partie 2 — Configurer les règles RLS

```sql
-- ================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES - SUPABASE
-- ================================================================
--
-- User : chacun peut lire/modifier son propre profil
-- Deck : tous les utilisateurs peuvent lire les decks;
--        seul leur propriétaire peut les créer/modifier/supprimer
-- Card : lecture publique, écriture réservée au backend
-- DeckCard : lecture publique, écriture réservée au propriétaire du deck
--
-- ================================================================

-- Supprimer les anciennes policies pour permettre de rejouer le script.
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

-- Activer RLS
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Deck" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DeckCard" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Card" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- User : lecture, création et modification du profil personnel uniquement.
CREATE POLICY "Users can read own user record" ON public."User"
  FOR SELECT USING ((select auth.uid()::text) = id);

CREATE POLICY "Users can insert own user record" ON public."User"
  FOR INSERT WITH CHECK ((select auth.uid()::text) = id);

CREATE POLICY "Users can update own user record" ON public."User"
  FOR UPDATE
  USING ((select auth.uid()::text) = id)
  WITH CHECK ((select auth.uid()::text) = id);

-- Deck : les decks sont lisibles par tous; seul le propriétaire écrit.
CREATE POLICY "Users can read all decks" ON public."Deck"
  FOR SELECT USING (true);

CREATE POLICY "Users can only modify their own decks" ON public."Deck"
  FOR UPDATE
  USING ((select auth.uid()::text) = "userId")
  WITH CHECK ((select auth.uid()::text) = "userId");

CREATE POLICY "Users can only delete their own decks" ON public."Deck"
  FOR DELETE USING ((select auth.uid()::text) = "userId");

CREATE POLICY "Users can create decks" ON public."Deck"
  FOR INSERT WITH CHECK ((select auth.uid()::text) = "userId");

-- Card : lecture publique. Pas de policy d'écriture pour les utilisateurs.
CREATE POLICY "Card table is publicly readable" ON public."Card"
  FOR SELECT USING (true);

-- DeckCard : lecture publique; écriture seulement si le deck appartient
-- à l'utilisateur authentifié.
CREATE POLICY "Users can read all deck cards" ON public."DeckCard"
  FOR SELECT USING (true);

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

CREATE POLICY "Users can delete deck cards from own decks" ON public."DeckCard"
  FOR DELETE
  USING (
    (select auth.uid()::text) IN (
      SELECT "userId" FROM public."Deck" WHERE id = "deckId"
    )
  );

CREATE POLICY "Users can insert deck cards in own decks" ON public."DeckCard"
  FOR INSERT
  WITH CHECK (
    (select auth.uid()::text) IN (
      SELECT "userId" FROM public."Deck" WHERE id = "deckId"
    )
  );

-- Permissions minimales. RLS contrôle ensuite les lignes accessibles.
REVOKE ALL ON public."User", public."Deck", public."Card",
  public."DeckCard", public."_prisma_migrations" FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public."User" TO authenticated;
GRANT SELECT ON public."Deck", public."Card", public."DeckCard" TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public."Deck", public."DeckCard" TO authenticated;
```

## Partie 3 — Vérifier la configuration

```sql
-- Vérification en lecture seule de la configuration Supabase.

-- 1. Vérifier les colonnes de la table Deck.
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'Deck'
ORDER BY ordinal_position;

-- 2. Vérifier les policies RLS.
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('User', 'Deck', 'Card', 'DeckCard', '_prisma_migrations')
ORDER BY tablename, policyname;

-- 3. Vérifier que RLS est activé.
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('User', 'Deck', 'Card', 'DeckCard', '_prisma_migrations')
ORDER BY tablename;

-- 4. Compter les lignes.
SELECT 'User' AS table_name, COUNT(*) AS count FROM public."User"
UNION ALL
SELECT 'Deck', COUNT(*) FROM public."Deck"
UNION ALL
SELECT 'Card', COUNT(*) FROM public."Card"
UNION ALL
SELECT 'DeckCard', COUNT(*) FROM public."DeckCard"
ORDER BY table_name;

-- 5. Afficher les 10 derniers decks.
SELECT id, name, "list", "userId", "createdAt"
FROM public."Deck"
ORDER BY "createdAt" DESC
LIMIT 10;
```
