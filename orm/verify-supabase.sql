-- Vérification complète de la configuration Supabase
-- Exécuter dans SQL Editor de Supabase

-- 1. Vérifier les colonnes de la table Deck
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Deck'
ORDER BY ordinal_position;

-- 2. Vérifier les RLS policies
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('User', 'Deck', 'Card', 'DeckCard', '_prisma_migrations')
ORDER BY tablename, policyname;

-- 3. Vérifier l'activation de RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('User', 'Deck', 'Card', 'DeckCard', '_prisma_migrations')
ORDER BY tablename;

-- 4. Compter les lignes (requêtes en lecture seule)
SELECT 
  'User' AS table_name,
  COUNT(*) as count
FROM public."User"
UNION ALL
SELECT 
  'Deck', COUNT(*) FROM public."Deck"
UNION ALL
SELECT 'Card', COUNT(*) FROM public."Card"
UNION ALL
SELECT 'DeckCard', COUNT(*) FROM public."DeckCard"
ORDER BY table_name;

-- 5. Lister les 10 derniers decks créés
SELECT id, name, "list", "userId", "createdAt"
FROM public."Deck"
ORDER BY "createdAt" DESC
LIMIT 10;
