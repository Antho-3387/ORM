# Vérification Supabase - Checklist

## ✅ Configuration

### Environnement
- `NEXT_PUBLIC_SUPABASE_URL` = https://ahlkrhnrkzxoxnrmnwjw.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sb_publishable_n7zK3ovSUrKdn0xgwVzMNA_30O1UkCq

### Supabase Client
- Fichier: [lib/supabase.ts](lib/supabase.ts)
- ✅ Crée un client Supabase avec les clés publiques
- ✅ Exporté et utilisé dans tous les fichiers

## ✅ Génération d'ID

### ID Generator
- Fichier: [lib/id-generator.ts](lib/id-generator.ts)
- ✅ Fonction `generateId()` crée des CUID-like IDs
- ✅ Utilisée lors de la création de Decks

## ✅ Authentification
- Utilise Supabase Auth directement
- [lib/auth-service.ts](lib/auth-service.ts) - Se connecte via Supabase
- Les User IDs viennent de `supabase.auth`

## ✅ Bases de données

### Tables Supabase
- `User` - Gérée par Supabase Auth + table custom
- `Deck` - Créée avec colonne `list` + ID généré côté client
- `Card` - Lecture seule (Scryfall)
- `DeckCard` - Relation N:N

### Pas de base locale
- ✅ Aucune référence à SQLite
- ✅ Aucune DB locale
- ✅ Prisma client utilisé pour Supabase seulement

## ✅ API Routes

### POST /api/decks
- Génère l'ID côté client
- Reçoit et valide tous les champs incluant l'ID
- Insère via Supabase PostgREST

### GET /api/decks et autres
- Utilisent Supabase directement

## 🧹 Nettoyage requis

### À faire dans Supabase SQL Editor:
```sql
-- Supprimer les decks avec ID null
DELETE FROM public."Deck" WHERE id IS NULL;

-- Vérifier
SELECT COUNT(*) FROM public."Deck";
```

## ✅ Files à migrer
- ✓ [app/decks/create/page.tsx](app/decks/create/page.tsx) - Génère ID
- ✓ [app/api/decks/route.ts](app/api/decks/route.ts) - Accepte ID
- ✓ [lib/id-generator.ts](lib/id-generator.ts) - Nouveau fichier

## Test
```bash
1. Lancer l'app
2. Se connecter
3. Créer un deck
4. Vérifier que ça fonctionne dans Supabase
```
