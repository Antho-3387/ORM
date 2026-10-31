# Guide d'intégration Supabase

## Configuration complète

Votre site est maintenant configuré pour utiliser Supabase comme base de données PostgreSQL.

### Étapes suivantes:

1. **Vérifier la connectivité Supabase**
   - Allez sur https://ahlkrhnrkzxoxnrmnwjw.supabase.co
   - Authentifiez-vous avec votre compte
   - Vérifiez que le projet est "Running"

2. **Appliquer les migrations** (une fois la connectivité confirmée)
   ```bash
   cd orm
   export DATABASE_URL='postgresql://postgres:G9%23fL7mZ2!qXeP8@db.ahlkrhnrkzxoxnrmnwjw.supabase.co:5432/postgres'
   npx prisma migrate deploy
   ```

3. **Variables d'environnement configurées**
   - ✅ `.env.local` avec les identifiants Supabase
   - ✅ `Prisma` configuré pour PostgreSQL
   - ✅ `supabase-js` client ajouté

4. **Fichiers créés**
   - `/lib/supabase.ts` - Client Supabase pour l'app
   - `prisma/schema.prisma` - Schéma mis à jour pour PostgreSQL
   - `.env.local` - Variables d'environnement
   - `migrate.sh` - Script de migration

### Utilisation du client Supabase dans votre app:

```typescript
import { supabase } from '@/lib/supabase'

// Exemple d'authentification
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Exemple de requête
const { data: decks } = await supabase
  .from('Deck')
  .select('*')
  .eq('userId', userId)
```

### Déploiement

Assurez-vous que les variables d'environnement sont définies dans votre plateforme de déploiement (Render, Vercel, etc.):
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Confirmation des emails d'inscription

Pour que les nouveaux comptes reçoivent un email de confirmation:

1. Dans Supabase, ouvrez **Authentication → Providers → Email** et activez la confirmation d'adresse email.
2. Dans **Authentication → URL Configuration**, définissez la Site URL sur `https://orm-5yhz.onrender.com` et ajoutez `https://orm-5yhz.onrender.com/auth` aux Redirect URLs.
3. Configurez un fournisseur SMTP personnalisé dans les paramètres SMTP d'Authentication pour l'envoi en production. Le SMTP par défaut de Supabase est limité et n'est pas destiné à l'envoi public en production.
4. Après une inscription, l'application affiche un bouton pour renvoyer l'email. Vérifiez aussi les journaux Auth du projet et le dossier spam si aucun message n'arrive.
