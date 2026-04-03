-- Nettoyer les decks avec ID null ou invalides
DELETE FROM public."Deck" WHERE id IS NULL;

-- Afficher les decks restants
SELECT COUNT(*) as total_decks, COUNT(DISTINCT "userId") as users_with_decks
FROM public."Deck";

-- Optionnel: Afficher les 5 derniers decks créés
SELECT id, name, "userId", "createdAt" 
FROM public."Deck" 
ORDER BY "createdAt" DESC 
LIMIT 5;
