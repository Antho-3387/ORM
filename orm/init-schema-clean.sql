-- Supprimer les anciennes tables (cascade)
DROP TABLE IF EXISTS public."DeckCard" CASCADE;
DROP TABLE IF EXISTS public."Deck" CASCADE;
DROP TABLE IF EXISTS public."Card" CASCADE;
DROP TABLE IF EXISTS public."User" CASCADE;
DROP TABLE IF EXISTS public."_prisma_migrations" CASCADE;

-- Créer les tables avec le bon schéma

-- Table User
CREATE TABLE public."User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Table Deck
CREATE TABLE public."Deck" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  "userId" TEXT NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "Deck_userId_idx" ON public."Deck"("userId");

-- Table Card
CREATE TABLE public."Card" (
  id TEXT PRIMARY KEY,
  "scryfallId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  "manaValue" INTEGER,
  colors TEXT DEFAULT '',
  type TEXT NOT NULL,
  "imageUrl" TEXT
);

-- Table DeckCard
CREATE TABLE public."DeckCard" (
  id TEXT PRIMARY KEY,
  "deckId" TEXT NOT NULL REFERENCES public."Deck"(id) ON DELETE CASCADE,
  "cardId" TEXT NOT NULL REFERENCES public."Card"(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  UNIQUE("deckId", "cardId")
);

CREATE INDEX "DeckCard_deckId_idx" ON public."DeckCard"("deckId");
CREATE INDEX "DeckCard_cardId_idx" ON public."DeckCard"("cardId");

-- Prisma migrations table
CREATE TABLE public."_prisma_migrations" (
  id TEXT PRIMARY KEY,
  checksum TEXT NOT NULL,
  "finished_at" TIMESTAMP,
  migration_name TEXT NOT NULL,
  logs TEXT,
  rolled_back_at TIMESTAMP,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  applied_migrations_count INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Deck" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Card" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DeckCard" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
