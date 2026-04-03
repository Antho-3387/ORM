-- Migration: Add Cache Metadata to Cards Table
-- Date: 2026-04-03
-- Purpose: Support intelligent caching system for Magic cards

-- 1. Add cache metadata columns
ALTER TABLE "Card" ADD COLUMN IF NOT EXISTS "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Card" ADD COLUMN IF NOT EXISTS "lastSearchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Card" ADD COLUMN IF NOT EXISTS "searchCount" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Card" ADD COLUMN IF NOT EXISTS "source" VARCHAR(50) NOT NULL DEFAULT 'scryfall';

-- 2. Create indices for performance optimization
-- ✅ Index on name for fast searches
CREATE INDEX IF NOT EXISTS "idx_Card_name" ON "Card"("name");

-- ✅ Index on scryfallId (already exists via unique constraint, but ensuring)
CREATE INDEX IF NOT EXISTS "idx_Card_scryfallId" ON "Card"("scryfallId");

-- ✅ Index on lastSearchedAt for cleanup queries
CREATE INDEX IF NOT EXISTS "idx_Card_lastSearchedAt" ON "Card"("lastSearchedAt");

-- ✅ Index on searchCount for popularity sorting
CREATE INDEX IF NOT EXISTS "idx_Card_searchCount" ON "Card"("searchCount" DESC);

-- 3. Update function: Auto-update lastSearchedAt on select
-- (optional, for triggers if needed in future)
-- This allows efficient cleanup of unused cards

-- 4. Sample queries for cache operations:

-- Find card by name (cache hit scenario)
-- SELECT * FROM "Card"
-- WHERE "name" ILIKE $1
-- ORDER BY "searchCount" DESC
-- LIMIT 1;

-- Update search stats
-- UPDATE "Card"
-- SET "lastSearchedAt" = NOW(),
--     "searchCount" = "searchCount" + 1
-- WHERE "id" = $1;

-- Cleanup unused cards (older than 30 days, searched less than 2 times)
-- DELETE FROM "Card"
-- WHERE "lastSearchedAt" < NOW() - INTERVAL '30 days'
-- AND "searchCount" < 2
-- AND "source" != 'manual';  -- Don't delete manually added cards

-- Get cache statistics
-- SELECT
--   COUNT(*) as total_cards,
--   SUM("searchCount") as total_searches,
--   AVG("searchCount") as avg_searches,
--   MAX("searchCount") as max_searches,
--   COUNT(CASE WHEN "lastSearchedAt" > NOW() - INTERVAL '7 days' THEN 1 END) as active_7days
-- FROM "Card";

-- Most popular cards
-- SELECT "name", "searchCount", "lastSearchedAt"
-- FROM "Card"
-- ORDER BY "searchCount" DESC
-- LIMIT 10;
