-- Vérification complète de la configuration Supabase
-- Exécuter dans SQL Editor de Supabase

-- 1. Vérifier les colonnes de la table Deck
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Deck'
ORDER BY ordinal_position;

-- 2. Vérifier les RLS policies
SELECT policyname, policycmd
FROM pg_policies
WHERE tablename = 'Deck'
ORDER BY policyname;

-- 3. Compter les decks par statut
SELECT 
  'Total decks' as metric,
  COUNT(*) as count
FROM public."Deck"
UNION ALL
SELECT 
  'Decks avec ID null',
  COUNT(*) 
FROM public."Deck" 
WHERE id IS NULL
UNION ALL
SELECT 
  'Decks avec userId null',
  COUNT(*) 
FROM public."Deck" 
WHERE "userId" IS NULL
UNION ALL
SELECT 
  'Decks sans list',
  COUNT(*) 
FROM public."Deck" 
WHERE list IS NULL;

-- 4. Nettoyer les decks invalides
DELETE FROM public."Deck" WHERE id IS NULL;
DELETE FROM public."Deck" WHERE "userId" IS NULL;

-- 5. Vérifier les User IDs
SELECT COUNT(*) as total_users, COUNT(DISTINCT id) as unique_ids
FROM public."User";

-- 6. Lister les 10 derniers decks créés
SELECT id, name, "list", "userId", "createdAt"
FROM public."Deck"
ORDER BY "createdAt" DESC
LIMIT 10;
