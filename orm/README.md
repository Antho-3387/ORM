# Magic Decks - Application Complète

Une application web moderne pour créer, gérer et partager des decks Magic: The Gathering.

## 🚀 Fonctionnalités

✅ **Authentification utilisateur** - Inscription/Connexion sécurisée
✅ **Gestion de decks** - Créer, modifier, supprimer vos decks
✅ **Recherche de cartes** - Accès à la base de données complète Scryfall
✅ **Filtrage** - Trier par couleur, puissance et autres critères
✅ **Interface moderne** - Design responsive avec Tailwind CSS
✅ **API RESTful** - Routes API complètes pour CRUD

## 🛠️ Stack Technologique

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: bcryptjs + localStorage
- **External API**: Scryfall Magic Cards API

## 📋 Installation Locale

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte PostgreSQL ou serveur local

### Étapes

1. **Cloner et installer les dépendances**
```bash
cd orm
npm install
```

2. **Configurer les variables d'environnement**
```bash
cp .env.example .env.local
```

Remplir `.env.local`:
```
DATABASE_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

3. **Initialiser la base de données**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application est accessible sur `http://localhost:3000`

## 🚀 Déployer sur Render

### 1. Préparer le repo Git
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Sur Render.com

1. **Créer une nouvelle "Web Service"**
   - Sélectionner votre repo GitHub
   - Nom: `magic-decks-app`
   - Runtime: Node
   - Build Command: `npm run build`
   - Start Command: `npm run start`

2. **Ajouter les variables d'environnement**
   - `DATABASE_URL`: Votre connexion PostgreSQL
   - `NODE_ENV`: `production`

3. **Créer la base de données** (PostgreSQL local ou cloud)
   - URL de connexion PostgreSQL
   - Optional: Additional env vars

4. **Déployer**
   - Cliquer sur "Create Web Service"
   - Render va automatiquement déployer

### Variables de base de données à configurer

```
# Database
DATABASE_URL=postgresql://postgres.ahlkrhnrkzxoxnrmnwjw:G9#fL7mZ2!qXeP8@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# API
NEXT_PUBLIC_SUPABASE_URL=https://ahlkrhnrkzxoxnrmnwjw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📚 Structure du Projet

```
orm/
├── app/
│   ├── (auth)/              # Pages d'authentification
│   ├── (dashboard)/         # Pages du dashboard
│   ├── api/                 # Routes API
│   ├── components/          # Composants réutilisables
│   ├── utils/              # Fonctions utilitaires
│   └── page.tsx            # Accueil
├── lib/
│   ├── prisma.ts           # Client Prisma
│   ├── auth.ts             # Logique d'authentification
│   └── scryfall.ts         # Intégration API Scryfall
├── prisma/
│   ├── schema.prisma       # Schéma de données
│   └── migrations/         # Migrations DB
└── render.yaml             # Config Render
```

## 🔐 Authentification

L'application utilise:
- **bcryptjs** pour le hashage des mots de passe
- **localStorage** pour la session (amélioration: NextAuth.js)
- **API routes** pour login/register

### Routes d'auth
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter

## 🃏 Gestion des Decks

### Pages
- `/dashboard/decks` - Liste de vos decks
- `/dashboard/decks/create` - Créer un nouveau deck
- `/dashboard/decks/[id]` - Voir/Éditer un deck

### API Decks
- `GET /api/decks` - Tous vos decks
- `POST /api/decks` - Créer un deck
- `GET /api/decks/[id]` - Détails d'un deck
- `PUT /api/decks/[id]` - Modifier un deck
- `DELETE /api/decks/[id]` - Supprimer un deck
- `POST /api/decks/[id]/cards` - Ajouter une carte
- `DELETE /api/decks/[id]/cards` - Supprimer une carte

## 🔍 Recherche de Cartes

Intégration avec l'API gratuite **Scryfall**:

### Fonctionnalités
- Recherche par nom
- Filtrage par couleur (W, U, B, R, G)
- Filtrage par puissance
- Images des cartes automatiquement téléchargées

### Endpoint
```
GET /api/cards?q=lightning%20bolt&color=R&power=1
```

## 📊 Modèles de Données

### User
```prisma
model User {
  id        String
  email     String @unique
  password  String
  name      String
  decks     Deck[]
}
```

### Deck
```prisma
model Deck {
  id          String
  name        String
  description String
  userId      String
  cards       DeckCard[]
}
```

### Card
```prisma
model Card {
  id          String
  scryfallId  String @unique
  name        String
  manaValue   Int
  colors      String[]
  type        String
  imageUrl    String
}
```

### DeckCard
```prisma
model DeckCard {
  id       String
  deckId   String
  cardId   String
  quantity Int
}
```

## 🎨 Personnalisation

### Ajouter des couleurs
Modifier `tailwind.config.ts` pour ajouter un thème personnalisé

### Améliorer l'authentification
Remplacer localStorage par NextAuth.js pour une sécurité accrue

### Ajouter des filtres
Modifier `/api/cards/route.ts` pour ajouter plus de paramètres de recherche

## 🐛 Dépannage

### Erreur: "DATABASE_URL not found"
- Vérifier que `.env.local` existe avec DATABASE_URL

### Erreur: "Cannot find module '@prisma/client'"
```bash
npm install
npx prisma generate
```

### Migrations en conflit
```bash
npx prisma migrate reset
npx prisma migrate dev
```

## 📞 Support

Pour toute question sur:
- **Magic: The Gathering** → Consulter le [Scryfall API](https://scryfall.com/docs/api)
- **Prisma** → [Documentation Prisma](https://www.prisma.io/docs)
- **Next.js** → [Documentation Next.js](https://nextjs.org/docs)

## 📄 Licence

MIT

---

**URL Render**: https://orm-hfjc.onrender.com
**Database**: PostgreSQL

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
