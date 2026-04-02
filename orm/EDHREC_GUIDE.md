# 🎴 MTG Deck Hub - Guide Complet

> Une plateforme moderne de Magic: The Gathering inspirée par **EDHREC** avec design sombre, statistiques avancées et système de filtres intuitif.

## 🎯 Vue d'ensemble du projet

Ce projet a été transformé pour offrir une expérience **EDHREC-like** complète avec:

✅ **Design sombre moderne** - Thème inspiré par EDHREC
✅ **Composants réutilisables** - Architecture clean et maintenable
✅ **Pages complètes** - Accueil, Cartes, Decks, Statistiques
✅ **Système de filtres** - Filtrage par couleur, type, mana, etc.
✅ **Statistiques détaillées** - Courbe de mana, distribution de couleurs, synergies
✅ **Responsive design** - Fonctionne sur mobile et desktop

---

## 📁 Structure du Projet

```
app/
├── page.tsx                    # 🏠 Page d'accueil avec tendances
├── layout.tsx                  # Layout global
├── cards/
│   ├── page.tsx               # 🎴 Page de recherche de cartes avec filtres
│   └── [id]/
│       └── page.tsx           # 📋 Détails d'une carte
├── decks/
│   ├── page.tsx               # 📦 Liste des decks populaires
│   └── [id]/
│       └── page.tsx           # 🔍 Détails d'un deck
├── statistics/
│   └── page.tsx               # 📊 Statistiques et méta-analyse
├── globals.css                # 🎨 Thème EDHREC (dark mode)

components/
├── Navbar.tsx                 # Navigation améliorée
├── CardImage.tsx              # Composant de carte (réutilisable)
├── CardGrid.tsx               # Grille responsive de cartes
├── FilterSidebar.tsx          # Système de filtres avec état
├── StatsBar.tsx               # Affichage des statistiques
├── TrendingSection.tsx        # Bloc "Trending" réutilisable
```

---

## 🎨 Design & Thème

### Palette de couleurs EDHREC-inspired:

```css
:root {
  --primary: #7c3aed;           /* Purple */
  --bg-primary: #0f172a;        /* Dark slate */
  --bg-secondary: #1e293b;      /* Medium slate */
  --text-primary: #f1f5f9;      /* Light text */
  --text-secondary: #cbd5e1;    /* Secondary text */
}
```

### Features de design:
- **Dark mode** complet pour réduire la fatigue oculaire
- **Gradients** subtils pour la profondeur
- **Shadows animées** au survol
- **Transitions fluides** pour l'UX
- **Focus states** accessibles

---

## 🚀 Démarrage Rapide

### 1. Installation des dépendances
```bash
cd orm
npm install
```

### 2. Lancer le serveur de développement
```bash
npm run dev
```

Accédez à `http://localhost:3000`

### 3. Voir les pages:
- **Accueil**: http://localhost:3000
- **Cartes**: http://localhost:3000/cards
- **Decks**: http://localhost:3000/decks
- **Statistiques**: http://localhost:3000/statistics

---

## 📦 Composants Principaux

### **CardImage.tsx**
Affiche une carte avec image, infos et statistiques.

```tsx
<CardImage
  id="1"
  name="Sol Ring"
  imageUrl={url}
  manaValue={1}
  colors="C"
  type="Artifact"
  stats={{ popularity: 89, synergies: 234, decks: 5421 }}
  href="/cards/1"
/>
```

### **CardGrid.tsx**
Grille responsive pour les cartes.

```tsx
<CardGrid columns={5}>
  {cards.map(card => <CardImage {...card} />)}
</CardGrid>
```

### **FilterSidebar.tsx**
Système de filtres avec gestion d'état.

```tsx
<FilterSidebar
  onFilterChange={(filters) => {
    // Handle filter changes
  }}
/>
```

### **StatsGrid.tsx**
Affichage de statistiques.

```tsx
<StatsGrid
  stats={[
    { label: 'Total Cards', value: '28,000+', icon: '🎴' },
    { label: 'Active Decks', value: '45,000+', icon: '📦' },
  ]}
/>
```

### **TrendingSection.tsx**
Section réutilisable pour tendances.

```tsx
<TrendingSection
  title="🔥 Trending Cards"
  href="/cards?sort=trending"
>
  {children}
</TrendingSection>
```

---

## 🔌 Intégration API (Prochaines étapes)

### Connexion à Scryfall API:
```typescript
// lib/scryfall.ts
const response = await fetch('https://api.scryfall.com/cards/search');
```

### Données à récupérer:
```typescript
interface ScryfallCard {
  id: string
  name: string
  image_uris?: { large: string }
  mana_cost: string
  type_line: string
  color_identity: string[]
  cmc: number
}
```

---

## 🎯 Prochaines Étapes (TODO)

### Phase 1: Backend completé
- [ ] Intégrer API Scryfall complètement
- [ ] Implémenter recherche par API (au lieu de mock data)
- [ ] Ajouter pagination
- [ ] Cache des données

### Phase 2: Fonctionnalités utilisateur
- [ ] Système d'authentification complet
- [ ] Créer/éditer/supprimer des decks
- [ ] Sauvegarder les decks en favoris
- [ ] Partager des decks

### Phase 3: Social & Community
- [ ] Commentaires sur les decks
- [ ] Système de notation
- [ ] Notifications
- [ ] Suivre d'autres utilisateurs

### Phase 4: Analytics avancés
- [ ] Graphiques interactifs (Chart.js)
- [ ] Winrate tracking
- [ ] Meta trends en temps réel
- [ ] Dashboard utilisateur

---

## 🔧 Configuration Tailwind

Le projet utilise **Tailwind CSS 4** avec les couleurs personnalisées définies dans `globals.css`.

### Classes personnalisées disponibles:
```css
/* Couleurs EDHREC */
bg-purple-600, text-purple-300, border-purple-400

/* Gradients */
bg-gradient-to-r from-purple-600 to-blue-600

/* Shadows personnalisées */
hover:shadow-lg hover:shadow-purple-500/20
```

---

## 📱 Responsive Design

Le projet est **100% responsive** avec Tailwind:
- Mobile: 1 colonne
- Tablet: 2-3 colonnes
- Desktop: 5-6 colonnes

```tsx
className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
```

---

## 🎓 Architecture & Best Practices

### Composants réutilisables:
Tous les composants acceptent des `props` typées en TypeScript.

### Gestion d'état:
Utilisation de `useState` pour l'état local (filtres, etc).

### Optimisation:
- Images avec `next/image` (lazy loading automatique)
- Utilisation de `Link` pour la navigation (prefetching)

### Accessibilité:
- Sémantique HTML correcte
- Focus states visibles
- Contraste de couleurs respecté

---

## 📚 Ressources

- [EDHREC](https://edhrec.com) - Référence de design
- [Scryfall API](https://scryfall.com/docs/api) - API des cartes
- [Tailwind CSS](https://tailwindcss.com) - Documentation CSS
- [Next.js](https://nextjs.org) - Documentation framework

---

## 💡 Conseils de développement

### Pour ajouter une nouvelle page:
1. Créer `app/page-name/page.tsx`
2. Importer les composants nécessaires
3. Utiliser les couleurs de `globals.css`

### Pour ajouter un filter:
1. Modifier `FilterState` dans `FilterSidebar.tsx`
2. Ajouter UI pour le filtre
3. Implémenter la logique de filtrage

### Pour intégrer Scryfall:
1. Créer fonction dans `lib/scryfall.ts`
2. Appeler depuis les pages
3. Remplacer les mock data

---

## 🙌 Comment Contribuer

1. Créer une branche: `git checkout -b feature/nom-feature`
2. Implémenter les changements
3. Tester sur mobile et desktop
4. Commit et push

---

**Bon développement! 🚀**
