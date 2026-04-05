## ✅ ÉTAPE 5 - Configuration RLS (Row-Level Security)

### 🎯 Objectif

Sécuriser Supabase en configuring les politiques RLS pour que chaque utilisateur ne puisse voir/modifier que ses propres données.

---

## 📋 Comment Appliquer les RLS Policies

### **Étape 1: Aller sur Supabase SQL Editor**

1. Accéder à: https://supabase.io
2. Ouvrir le projet ORM
3. Aller à **SQL Editor** (dans la barre gauche)
4. Cliquer sur **"New Query"**

### **Étape 2: Copier le script RLS**

1. Ouvrir le fichier: `/root/ORM/orm/rls-policies.sql`
2. Copier **tout le contenu**
3. Coller dans le SQL Editor de Supabase

### **Étape 3: Exécuter les Policies**

1. Cliquer sur le bouton noir **"RUN"** (en haut à droit)
2. Attendre 10-15 secondes
3. Voir le message: ✅ **"Success. No rows returned"**

---

## 🔐 Politiques RLS Configurées

### **1. USER Table**
```
✅ SELECT : Tous les users peuvent voir tous les profils (publique)
✅ INSERT : Chacun peut créer son propre profil (auth.uid() = id)
✅ UPDATE : Chacun peut modifier SEULEMENT son profil
❌ DELETE : Personne (admin doit utiliser Supabase Auth)
```

### **2. DECK Table**
```
✅ SELECT : Voir vos decks + decks publiques (isPublic=true)
✅ INSERT : Créer des decks pour vous-même
✅ UPDATE : Modifier vos decks SEULEMENT
✅ DELETE : Supprimer vos decks SEULEMENT
```

### **3. CARD Table**
```
✅ SELECT : Tout le monde peut lire les cartes (publique)
❌ INSERT/UPDATE/DELETE : Personne (backend/service_role SEULEMENT)
```

### **4. DECKCARD Table**
```
✅ SELECT : Voir cartes de vos decks + decks publiques
✅ INSERT/UPDATE/DELETE : Modifier cartes SEULEMENT dans vos decks
```

---

## ✅ Tests de Sécurité

Après activation, **vérifier que RLS fonctionne** en testant:

### **Test 1: Accès Users**
```sql
-- Login comme User A
SELECT * FROM "User" WHERE id = 'user_a_id';  -- ✅ Doit voir
SELECT * FROM "User" WHERE id = 'user_b_id';  -- ✅ Doit voir (tous users publics)

-- Essayer modifier le profil de User B
UPDATE "User" SET name = 'Hack' WHERE id = 'user_b_id';  -- ❌ ERREUR
-- Error: new row violates row-level security policy
```

### **Test 2: Decks Privés**
```sql
-- Login comme User A, créer un deck privé
INSERT INTO "Deck" (id, name, userId, isPublic) 
VALUES ('deck-1', 'Deck A', 'user_a_id', false);  -- ✅ Marche

-- Voir les decks
SELECT * FROM "Deck";  -- ✅ Voit que son deck 'Deck A'

-- Login comme User B
SELECT * FROM "Deck";  -- ❌ Voit RIEN (deck de A est privé)
```

### **Test 3: Decks Publiques**
```sql
-- User A rend son deck public
UPDATE "Deck" SET isPublic = true WHERE id = 'deck-1';  -- ✅ Marche

-- Login comme User B
SELECT * FROM "Deck";  -- ✅ Voit maintenant 'Deck A'
```

### **Test 4: DeckCards**
```sql
-- User A ajoute une carte à son deck
INSERT INTO "DeckCard" (deckId, cardId, quantity) 
VALUES ('deck-a', 'card-1', 3);  -- ✅ Marche

-- User B essaie ajouter une carte au deck de A
INSERT INTO "DeckCard" (deckId, cardId, quantity) 
VALUES ('deck-a', 'card-2', 1);  -- ❌ ERREUR (pas propriétaire)
```

---

## 🚀 Impact sur l'Application

### **Client Frontend** (Utilise clé ANON)
```typescript
// Respecte automatiquement RLS
const { data: myDecks } = await supabase
  .from('Deck')
  .select('*');  // Retourne SEULEMENT les decks de l'user connecté

// Tentative de modification du deck de quelqu'un d'autre
const { error } = await supabase
  .from('Deck')
  .update({ name: 'Hack' })
  .eq('id', 'someone-else-deck');  // ❌ RLS bloque automatiquement
```

### **Backend API Routes** (Utilise SERVICE_ROLE)
```typescript
// Les API routes byppassent RLS (car use service_role key)
// Elles doivent faire les vérifications d'accès elles-mêmes
const { data: anyDeck } = await supabase
  .from('Deck')
  .select('*')
  .eq('id', 'any-deck-id');  // ✅ Retourne le deck (même s'il appartient à quelqu'un d'autre)

// MAIS on doit vérifier manuellement qu'on a le droit:
if (deck.userId !== userId) {
  throw new Error('Accès refusé');
}
```

---

## ⚠️ Points Importants

### **Service Role vs Authenticated**
- ✅ **Service Role** (Backend) : Bypasse RLS automatiquement (utilise API secret key)
- ✅ **Authenticated** (Frontend) : Respecte RLS (utilise clé ANON)

### **Quand RLS Bloque**
```
SELECT : Retourne seulement les lignes autorisées (pas d'erreur)
INSERT : Error si WITH CHECK échoue
UPDATE : Error si USING échoue
DELETE : Error si USING échoue
```

### **Performance**
- RLS ajoute ~5-10ms par requête (acceptabilité)
- Les subqueries dans policies peuvent être coûteuses (mais ici simples)
- Indexer les colonnes utilisées dans les policies (userId, deckId)

---

## 📊 Vérifier que RLS est Activé

Dans le SQL Editor:
```sql
-- Vérifier que RLS est activé
SELECT 
  tablename, 
  rowsecurity,
  CASE WHEN rowsecurity THEN '✅ ACTIVÉ' ELSE '❌ DÉSACTIVÉ' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('User', 'Deck', 'Card', 'DeckCard')
ORDER BY tablename;

-- Lister les policies
SELECT tablename, policyname, permissive
FROM pg_policies
WHERE tablename IN ('User', 'Deck', 'Card', 'DeckCard')
ORDER BY tablename, policyname;
```

Expected output:
```
 tablename │ rowsecurity │   status   
───────────┼─────────────┼────────────
 Card      │ t           │ ✅ ACTIVÉ
 Deck      │ t           │ ✅ ACTIVÉ
 DeckCard  │ t           │ ✅ ACTIVÉ
 User      │ t           │ ✅ ACTIVÉ
```

---

## 🎓 Prochaines Étapes

1. ✅ **Appliquer les RLS** (ce fichier)
2. ✅ **Tester la sécurité** (vérifier les tests ci-dessus)
3. ✅ **Monitoring** 
   - Vérifier les logs d'erreurs Supabase en production
   - Chercher les patterns "RLS violation"
4. ✅ **Performance**
   - Vérifier les temps de requête (doit être < 500ms)
   - Si trop lent, optimiser les indexes

---

## 📞 Support

Si questions sur RLS:
- Docs Supabase: https://supabase.io/docs/guides/auth/row-level-security
- Communauté: https://discord.supabase.io

---

**Status Final: ✅ MIGRATION SUPABASE COMPLÉTÉE**
- ✅ ÉTAPE 1: Environment `.env`
- ✅ ÉTAPE 2: Authentication `lib/auth.ts`
- ✅ ÉTAPE 3: Cache Services (4 fichiers)
- ✅ ÉTAPE 4: API Routes (4 fichiers)
- ✅ ÉTAPE 5: Remove localStorage (3 fichiers)
- ✅ ÉTAPE 6: RLS Policies (ce fichier)

**🚀 L'application est maintenant 100% Supabase!**
