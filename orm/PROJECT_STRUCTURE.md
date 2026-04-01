# Magic Decks - Structure du Projet

## Arborescence Organisée

```
orm/
├── app/
│   ├── (auth)/                    # Layout pour l'authentification
│   │   ├── login/
│   │   │   └── page.tsx           # Page de connexion
│   │   ├── register/
│   │   │   └── page.tsx           # Page d'inscription
│   │   └── layout.tsx             # Layout d'auth
│   │
│   ├── (dashboard)/               # Layout pour le dashboard
│   │   ├── layout.tsx             # Layout du dashboard
│   │   ├── decks/
│   │   │   ├── page.tsx           # Liste des decks
│   │   │   ├── create/
│   │   │   │   └── page.tsx       # Créer un deck
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx       # Détails du deck
│   │   │   │   └── cards/
│   │   │   │       └── route.ts   # API pour gérer les cartes d'un deck
│   │   │   └── route.ts           # API CRUD decks
│   │   └── decks/[id]/route.ts    # API détails deck
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts       # POST: connexion utilisateur
│   │   │   └── register/
│   │   │       └── route.ts       # POST: création compte
│   │   │
│   │   ├── decks/
│   │   │   ├── route.ts           # GET/POST decks
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts       # GET/PUT/DELETE deck
│   │   │   │   └── cards/
│   │   │   │       └── route.ts   # POST/DELETE cartes du deck
│   │   │   └── [id]/cards/route.ts# Gestion des cartes
│   │   │
│   │   └── cards/
│   │       └── route.ts           # GET search / POST create card
│   │
│   ├── components/
│   │   ├── ui/                     # Composants UI réutilisables
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Navbar.tsx
│   │   │
│   │   ├── auth/                   # Composants d'authentification
│   │   │   └── (vides pour extension)
│   │   │
│   │   ├── deck/                   # Composants liés aux decks
│   │   │   └── DeckCard.tsx
│   │   │
│   │   └── card/                   # Composants liés aux cartes
│   │       └── CardComponent.tsx
│   │
│   ├── utils/                      # Fonctions utilitaires
│   │   └── (à remplir selon besoin)
│   │
│   ├── globals.css
│   ├── layout.tsx                  # Layout root
│   └── page.tsx                    # Page d'accueil
│
├── lib/
│   ├── prisma.ts                   # Client Prisma
│   ├── auth.ts                     # Utils authentification
│   └── scryfall.ts                 # Intégration API Scryfall
│
├── prisma/
│   ├── schema.prisma               # Schéma Prisma (User, Deck, Card, DeckCard)
│   └── migrations/                 # Migrations de base de données
│
├── public/                         # Fichiers statiques
├── .env.local                      # Variables d'environnement
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── package.json
└── render.yaml                     # Config Render
```

## Modèles de Données

### User
- `id`: Unique identifier (cuid)
- `email`: Email unique
- `password`: Mot de passe hashé
- `name`: Nom utilisateur
- `createdAt`: Date création

### Deck
- `id`: Unique identifier (cuid)
- `name`: Nom du deck
- `description`: Description
- `userId`: Relation avec User
- `createdAt`: Date création
- `cards`: Relation many-to-many via DeckCard

### Card
- `id`: Unique identifier (cuid)
- `scryfallId`: ID Scryfall (unique)
- `name`: Nom de la carte
- `manaValue`: Coût d'invocation
- `colors`: Array de couleurs (W, U, B, R, G)
- `type`: Type de la carte
- `imageUrl`: URL image

### DeckCard
- `id`: Unique identifier (cuid)
- `deckId`: Foreign key
- `cardId`: Foreign key
- `quantity`: Nombre de copies

## API Routes

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription

### Decks
- `GET /api/decks` - Obtenir tous les decks de l'utilisateur
- `POST /api/decks` - Créer un nouveau deck
- `GET /api/decks/[id]` - Obtenir détails d'un deck
- `PUT /api/decks/[id]` - Mettre à jour un deck
- `DELETE /api/decks/[id]` - Supprimer un deck
- `POST /api/decks/[id]/cards` - Ajouter une carte au deck
- `DELETE /api/decks/[id]/cards` - Supprimer une carte du deck

### Cartes
- `GET /api/cards?q=name&color=W&power=3` - Rechercher des cartes
- `POST /api/cards` - Créer/Enregistrer une carte

## Configuration Render

1. Database: PostgreSQL
2. Environment Variable: DATABASE_URL
3. Build Command: `npm run build`
4. Start Command: `npm run start`

## Technologies

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: Session localStorage + bcryptjs
- **External API**: Scryfall (Magic Cards Database)

## Pour Déployer sur Render

1. Connecter le repo GitHub
2. Configurer les variables d'environnement:
   - `DATABASE_URL`
   - `NODE_ENV=production`
3. Déployer: Render va automatiquement exécuter `npm run build` et `npm run start`

## Notes

- L'authentification est basée sur localStorage (amélioration: utiliser NextAuth.js)
- Les images des cartes viennent de l'API Scryfall
- Le tri par couleur et puissance est fait côté client
- Les migrations Prisma doivent être exécutées avant le déploiement
