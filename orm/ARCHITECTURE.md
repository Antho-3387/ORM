# 🗺️ Architecture & Flow Diagram

## Component Hierarchy

```
RootLayout
├── Navbar (sticky)
│   ├── Logo & Brand
│   ├── Navigation Links
│   └── Auth Button
│
├── Pages (Dynamic)
│   ├── HOME (/)
│   │   ├── Hero Section
│   │   ├── StatsGrid
│   │   │   └── StatBar ×4
│   │   ├── TrendingSection
│   │   │   ├── CardGrid
│   │   │   │   └── CardImage ×6
│   │   │   ├── DeckCard ×3
│   │   │   └── Button "See All"
│   │   └── CTA Section
│   │
│   ├── CARDS (/cards)
│   │   ├── FilterSidebar
│   │   │   ├── Search Input
│   │   │   ├── Format Select
│   │   │   ├── Color Filters ×5
│   │   │   ├── Mana Range Buttons
│   │   │   ├── Type Checkboxes ×8
│   │   │   └── Reset Button
│   │   └── Main Content
│   │       ├── Header
│   │       └── CardGrid
│   │           └── CardImage ×N
│   │
│   ├── CARD DETAIL (/cards/[id])
│   │   ├── Breadcrumb
│   │   ├── Left Column (1/3)
│   │   │   ├── Card Image
│   │   │   └── Card Info Box
│   │   └── Right Column (2/3)
│   │       ├── Title & Stats
│   │       ├── Card Text
│   │       ├── StatsGrid ×3
│   │       ├── Synergies Box
│   │       └── Similar Cards CTA
│   │
│   ├── DECKS (/decks)
│   │   ├── Header
│   │   ├── StatsGrid ×4
│   │   ├── Format Filter Buttons
│   │   ├── Deck Grid
│   │   │   └── DeckCard ×6
│   │   │       ├── Color Header
│   │   │       ├── Title
│   │   │       ├── Stats Bar
│   │   │       └── View Button
│   │   └── Load More Button
│   │
│   ├── DECK DETAIL (/decks/[id])
│   │   ├── Breadcrumb
│   │   ├── Header + Tags
│   │   ├── StatsGrid ×4
│   │   ├── Main Content
│   │   │   ├── Deck List Section
│   │   │   │   ├── Featured Cards Grid
│   │   │   │   ├── Mana Curve Chart
│   │   │   │   └── Color Distribution
│   │   │   └── Sidebar
│   │   │       ├── Deck Info Box
│   │   │       ├── Top Synergies
│   │   │       └── Action Buttons
│   │
│   └── STATISTICS (/statistics)
│       ├── Header
│       ├── StatsGrid ×4
│       ├── TrendingSection
│       │   └── Format Analysis Grid ×4
│       ├── TrendingSection
│       │   └── Popular Cards Grid
│       ├── TrendingSection
│       │   └── Color Meta Distribution
│       ├── TrendingSection
│       │   └── Type Distribution Bars
│       └── TrendingSection
│           └── Synergy Leaders Grid
│
└── Footer (if added)
```

---

## Data Flow

```
Component State
    ↓
User Input
    ↓
Filter/Search
    ↓
Update State
    ↓
Re-render Component
    ↓
Display Results
```

### Example: Cards Search Flow

```
FilterSidebar
    ↓ (onFilterChange callback)
CardsPage State Update
    ↓ (filters applied)
useMemo Hook
    ↓ (filter ALL_CARDS)
filteredCards
    ↓ (map over filtered array)
CardImage Components
    ↓ (render)
UI Display
```

---

## File Organization

```
/root/ORM/orm/
├── app/
│   ├── globals.css ..................... Theme & variables
│   ├── layout.tsx ...................... Root layout with Navbar
│   ├── page.tsx ........................ Home page
│   ├── cards/
│   │   ├── page.tsx .................... Search page
│   │   └── [id]/
│   │       └── page.tsx ................ Card details
│   ├── decks/
│   │   ├── page.tsx .................... Decks listing
│   │   └── [id]/
│   │       └── page.tsx ................ Deck details
│   └── statistics/
│       └── page.tsx .................... Stats dashboard
│
├── components/
│   ├── Navbar.tsx ...................... Navigation
│   ├── CardImage.tsx ................... Card component
│   ├── CardGrid.tsx .................... Responsive grid
│   ├── FilterSidebar.tsx ............... Filters
│   ├── StatsBar.tsx .................... Statistics
│   └── TrendingSection.tsx ............. Trending block
│
├── lib/
│   ├── auth-context.tsx ................ Auth provider
│   ├── SCRYFALL_INTEGRATION.ts ......... API examples
│   └── scryfall.ts ..................... API functions
│
├── prisma/
│   └── schema.prisma ................... Database schema
│
├── EDHREC_GUIDE.md ..................... Project guide
├── IMPLEMENTATION_SUMMARY.md ........... What was built
├── CUSTOMIZATION_GUIDE.md .............. How to customize
└── package.json
```

---

## Page Routes

```
Home
└── /

Cards
├── /cards (search & filters)
└── /cards/[id] (details)

Decks
├── /decks (listing)
└── /decks/[id] (details)

Statistics
└── /statistics (analytics)

Auth (already existing)
└── /auth
```

---

## Component Props Flow

### CardImage Props:
```
id, name, imageUrl, manaValue, colors, type
    ↓
CardImage Component
    ↓
Renders with stats & hover effects
```

### FilterSidebar Props:
```
onFilterChange callback
    ↓
FilterSidebar Component
    ↓
User interacts with filters
    ↓
Calls onFilterChange(filters)
    ↓
Parent receives updated state
```

### StatsGrid Props:
```
stats: StatBar[] array
    ↓
StatsGrid Component
    ↓
Maps each stat to StatBar component
    ↓
Renders colored stat boxes
```

---

## State Management

### Local Component State:
```tsx
// In CardsPage
const [filters, setFilters] = useState<FilterState>()
    
// FilterSidebar updates it
onFilterChange={(newFilters) => setFilters(newFilters)}

// Component re-renders with new filters
```

### No Global State Yet:
- Using React Context for auth (existing)
- Future: Redux for complex states
- Future: Database for persistent data

---

## Performance Considerations

### Optimizations Already in Place:
- ✅ `next/image` for lazy loading
- ✅ `next/link` for prefetching
- ✅ `useMemo` for filter calculations
- ✅ Component splitting (DRY)

### Future Optimizations:
- [ ] API pagination
- [ ] Virtual scrolling for large lists
- [ ] Caching strategy
- [ ] CDN for images

---

## CSS Structure

```css
globals.css
├── CSS Variables (:root)
├── Base styles (h1, p, etc)
├── Tailwind imports
└── Custom animations
```

### Tailwind Classes Used:
```
Layout: grid, flex, flex-col, gap-X
Colors: bg-slate-*, text-slate-*, border-*
Spacing: p-X, m-X, px-X, py-X
Typography: font-bold, text-lg, tracking-*
Responsive: md:, lg: breakpoints
Hover/Active: hover:, focus:, group-hover:
Transitions: transition-*, duration-*
```

---

## Theme Application

```
globals.css :root variables
    ↓
Used throughout components via Tailwind
    ↓
bg-purple-600 → --primary color
    ↓
text-slate-100 → --text-primary color
    ↓
Custom animations & shadows
```

---

## Mobile Responsiveness

```
Mobile Layout:
- 1 column grids
- Full-width components
- Navbar condensed
- Sidebar hidden or collapsed
- Touch-friendly buttons (44px+ height)

Tablet Layout:
- 2-3 columns
- Medium spacing
- Sidebar visible

Desktop Layout:
- Full grid (4-6 columns)
- Sidebar sticky left
- Max-width container (7xl = 80rem)
```

---

This architecture allows for:
✅ Scalability (add pages easily)
✅ Reusability (components used multiple times)
✅ Maintainability (clear structure)
✅ Performance (optimized rendering)
✅ Customization (theme variables)
