# Guide d'Authentification et Gestion des Decks

## Architecture

### 1. **Authentification avec Supabase**
- `lib/auth-service.ts` - Service d'authentification (login, signup, signout)
- `lib/auth-context.tsx` - Context React pour gérer l'authentification globale
- `app/auth/page.tsx` - Page de login/register

### 2. **Gestion des Decks**
- `app/decks/page.tsx` - Page des décks communautaires (à mettre à jour avec Supabase)
- `app/decks/create/page.tsx` - Création de décks
- `app/decks/[id]/page.tsx` - Vue d'un deck

### 3. **Supabase Database**
- Table `User` - Utilisateurs (email, password, name)
- Table `Deck` - Décks (name, description, userId - clé étrangère)
- Table `Card` - Cartes Magic (scryfallId, name, type_line, etc.)
- Table `DeckCard` - Liaison entre Decks et Cards (quantity)

## Configuration S UPA BASE - RLS (Row Level Security)

Pour configurer les permissions dans Supabase SQL Editor, exécutez le script `rls-policies.sql` :

### Permissions
1. **Lecture** : Tous les utilisateurs peuvent voir TOUS les décks (communautaire)
2. **Écriture/Modification** : Seul le créateur du deck peut modifier/supprimer son deck
3. **Création** : Les utilisateurs authentifiés peuvent créer des décks

## Étapes de Setup

### 1. Appliquer les Politiques RLS
```sql
-- Dans Supabase SQL Editor, exécutez rls-policies.sql
```

### 2. Mettre à jour le Layout Principal
Enveloppez l'app avec `AuthProvider` dans `app/layout.tsx` :
```tsx
import { AuthProvider } from '@/lib/auth-context'

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* ... */}
    </AuthProvider>
  )
}
```

### 3. Mettre à Jour `app/decks/page.tsx`
Remplacez le contenu par la version Supabase-friendly (voir dépôt)

## Flux d'Authentification

```
1. Utilisateur arrive → Pas d'authentification
2. Clique "Se connecter/S'inscrire" → Va à /auth
3. Remplit le formulaire → Crée compte Supabase Auth + User DB
4. Reçoit une session → Stockée dans Supabase
5. Accès à /decks → Voit les decks communautaires
6. Crée un deck → Associé à son userId via RLS
7. Peut modifier/supprimer que SES decks
8. Peut voir les autres decks mais pas les modifier

```

## Services à Créer/Mettre à Jour

### ✅ Créés
- `lib/auth-service.ts` - Service Auth Supabase
- `lib/auth-context.tsx` - Context d'authentification
- `app/auth/page.tsx` - Page de login/register

### ⏳ À Mettre à Jour
- `app/layout.tsx` - Ajouter `<AuthProvider>`
- `app/decks/page.tsx` - Intégrer Supabase
- `app/decks/create/page.tsx` - Intégrer Supabase
- `app/decks/[id]/page.tsx` - Intégrer Supabase

## Variables d'Environnement (déjà configurées)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`

## Déploiement sur Render

1. Les variables d'environnement sont déjà configurées ✅
2. Tables Supabase sont créées ✅
3. RLS Policies à appliquer → Exécuter `rls-policies.sql` dans Supabase
4. Mettre à jour les pages React pour Supabase
5. Redéployer → `Manual Deploy`

## Tests

### Tester l'authentification
1. Aller à `/auth`  
2. S'inscrire avec un email/password
3. Redirection vers `/decks`
4. Créer un deck
5. Vérifier que seul l'auteur peut le modifier

### Tester les permissions RLS
1. Connecté en tant que User A → Créer Deck A
2. Connecté en tant que User B → Voir Deck A (lecture seule)
3. User B essaie de modifier Deck A → RLS refusera ✅

## Next Steps
1. ✅ Appliquer les politiques RLS dans Supabase
2. ⏳ Mettre à jour `app/layout.tsx` avec `AuthProvider`
3. ⏳ Remplacer les pages `/decks` pour utiliser Supabase
4. ⏳ Redéployer et tester
