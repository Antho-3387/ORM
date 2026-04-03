# 📋 CHEAT SHEET - SYSTÈME DE CACHE

## 🚀 DÉMARRAGE RAPIDE

### Installation & Setup

```bash
# 1. Cloner le repo
cd /root/ORM/orm

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env.local

# 4. Générer Prisma client
npx prisma generate

# 5. Exécuter la migration
npx prisma migrate dev --name add_cache_metadata

# 6. Démarrer l'app
npm run dev
```

---

## 🧪 TESTER LE CACHE

### Via cURL

```bash
# 🔍 Recherche simple
curl "http://localhost:3000/api/cards/search-cached?q=Black+Lotus"

# 🔍 Recherche avec refresh forcé
curl "http://localhost:3000/api/cards/search-cached?q=Black+Lotus&refresh=true"

# 📊 Voir les stats du cache
curl "http://localhost:3000/api/cards/search-cached?stats=true"

# 🔄 Actualiser une carte depuis Scryfall
curl -X PUT http://localhost:3000/api/cards/refresh \
  -H "Content-Type: application/json" \
  -d '{"scryfallId": "69692d2b-45ba-11eb-b4ef-0242ac130003"}'

# 🧹 Nettoyer les cartes inutilisées (> 30 jours)
curl -X DELETE "http://localhost:3000/api/cards/search-cached/cleanup?days=30" \
  -H "Authorization: Bearer $CACHE_ADMIN_KEY"
```

### Réponses d'exemple

```bash
# ✅ Cache HIT (en-mémoire, 1-2ms)
{
  "success": true,
  "query": "Black Lotus",
  "count": 1,
  "duration": "2ms",
  "cached": true,
  "results": [
    {
      "id": "uuid",
      "name": "Black Lotus",
      "imageUrl": "https://...",
      "searchCount": 5,
      "cachedAt": "2026-04-03T10:00:00Z"
    }
  ]
}

# ⏳ Cache MISS (API call, 350ms)
{
  "success": true,
  "query": "Unknown Card",
  "count": 1,
  "duration": "350ms",
  "cached": false,
  "results": [...]
}
```

---

## 🎯 UTILISATION EN REACT

### Hook simple

```typescript
import { useCardSearch } from '@/lib/useCardCache'

function MyComponent() {
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    cacheSource,
    duration,
  } = useCardSearch()

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <p>Source: {cacheSource} ({duration}ms)</p>
      {results.map(card => <div key={card.id}>{card.name}</div>)}
    </div>
  )
}
```

### Avec contrôles avancés

```typescript
const {
  query,
  setQuery,
  results,
  loading,
  search,
  clearMemoryCache,
  cacheSource,
  duration,
} = useCardSearch()

// Forcer actualisation
await search('Black Lotus', true)

// Vider only le cache en-mémoire
clearMemoryCache()
```

---

## 🛠️ COMMANDS UTILES

### Base de Données

```bash
# 📊 Ouvrir Prisma Studio
npx prisma studio

# 📋 Voir le schéma
npx prisma introspect

# 🔄 Reset la DB (développement seulement!)
npx prisma migrate reset

# 📝 Créer une migration
npx prisma migrate dev --name <migration_name>

# 🚀 Appliquer les migrations
npx prisma migrate deploy
```

### Logs & Debugging

```bash
# 📊 Voir les logs Prisma
export DEBUG=prisma:client
npm run dev

# 🔎 Requête manuelle avec Prisma
npx ts-node -e "
  import prisma from '@/lib/prisma'
  const card = await prisma.card.findFirst({
    where: { name: 'Black Lotus' }
  })
  console.log(card)
"

# 📈 Voir les stats du cache
curl "http://localhost:3000/api/cache/metrics?type=health" | jq
```

### Monitoring

```bash
# 📊 Métriques du cache
curl "http://localhost:3000/api/cache/metrics" | jq '.data'

# 🏥 Health check
curl "http://localhost:3000/api/cache/metrics?type=health" | jq '.data'

# 📈 Trends (dernière semaine)
curl "http://localhost:3000/api/cache/metrics?type=analytics&period=week" | jq

# 🔌 Prometheus metrics
curl "http://localhost:3000/api/cache/prometheus" 
```

---

## 📱 CONSOLE BROWSER

### Inspecter le cache

```javascript
// Voir le localStorage cache
JSON.parse(localStorage.getItem('card_cache_black lotus'))

// Lister tout le cache
Object.keys(localStorage)
  .filter(k => k.startsWith('card_cache_'))
  .forEach(k => console.log(k, localStorage.getItem(k)))

// Vider le cache frontend
import { clearFrontendCache } from '@/lib/useCardCache'
clearFrontendCache()

// Voir les stats du cache
import { getFrontendCacheStats } from '@/lib/useCardCache'
console.log(getFrontendCacheStats())
```

---

## 🔒 SÉCURITÉ

### Générer une clé admin sécurisée

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Créer .env.local

```bash
cat > .env.local << EOF
DATABASE_URL=postgresql://user:password@host:5432/dbname
CACHE_ADMIN_KEY=$(openssl rand -hex 32)
CACHE_CLEANUP_ENABLED=true
CACHE_MONITORING_ENABLED=true
NODE_ENV=development
EOF
```

---

## 🐛 TROUBLESHOOTING

### Les recherches sont lentes

```bash
# 1. Vérifier si la DB est accessible
curl "http://localhost:3000/api/cache/metrics?type=health" | jq

# 2. Vérifier le cache hit rate
curl "http://localhost:3000/api/cards/search-cached?stats=true" | jq '.cache.mostPopular'

# 3. Pré-charger les cartes populaires
curl "http://localhost:3000/api/cards/search-cached?q=Black+Lotus"
curl "http://localhost:3000/api/cards/search-cached?q=Blightsteel"
```

### Le cache ne fonctionne pas

```bash
# 1. Vérifier que Prisma est bien migré
npx prisma migrate status

# 2. Vérifier les colonnes dans la DB
SELECT * FROM "Card" LIMIT 1;

# 3. Vérifier les logs
npm run dev 2>&1 | grep -i cache

# 4. Tester directement
curl "http://localhost:3000/api/cards/search-cached?q=test&refresh=true"
```

### Erreur de connexion DB

```bash
# 1. Vérifier DATABASE_URL
echo $DATABASE_URL

# 2. Tester la connexion
npx prisma db push --skip-generate

# 3. Vérifier les migrations
npx prisma migrate status

# 4. Reset (DEV ONLY!)
npx prisma migrate reset
```

---

## 📊 PERFORMANCE TUNING

### Optimiser les requêtes

```sql
-- Voir les cartes les plus cherchées
SELECT name, searchCount, lastSearchedAt 
FROM "Card"
ORDER BY searchCount DESC
LIMIT 10;

-- Voir les cartes inactives
SELECT name, searchCount, lastSearchedAt
FROM "Card"
WHERE lastSearchedAt < NOW() - INTERVAL '30 days'
ORDER BY searchCount ASC;

-- Voir la taille occupée
SELECT 
  pg_size_pretty(pg_total_relation_size('"Card"')) as size,
  COUNT(*) as count
FROM "Card";
```

### Ajouter des indices manquants

```sql
-- Si pas d'index sur 'name'
CREATE INDEX idx_card_name_lower 
ON "Card"(LOWER("name"));

-- Index composite
CREATE INDEX idx_card_search 
ON "Card"("name", "lastSearchedAt", "searchCount");
```

---

## 🚀 DEPLOYMENT

### Render.com

```bash
# 1. Pousser sur GitHub
git push origin main

# 2. Connecter avec Render
# - Ajouter le projet GitHub
# - Configurer les env vars:
#   - DATABASE_URL
#   - CACHE_ADMIN_KEY

# 3. Déployer
# - Render va auto build et migrer
```

### Vercel

```bash
# 1. Déployer
vercel deploy

# 2. Configurer env vars
vercel env add DATABASE_URL "postgresql://..."
vercel env add CACHE_ADMIN_KEY "your-key"

# 3. Re-déployer
vercel deploy --prod
```

---

## 📈 MONITORING EN PRODUCTION

### Créer un dashboard Grafana

```json
{
  "dashboard": {
    "title": "Magic Card Cache",
    "panels": [
      {
        "title": "Cache Hit Rate",
        "targets": [
          {
            "expr": "magic_cache_hit_rate"
          }
        ]
      },
      {
        "title": "Total Cached Cards",
        "targets": [
          {
            "expr": "magic_cache_total_cards"
          }
        ]
      }
    ]
  }
}
```

### Alertes recommandées

```yaml
alerts:
  - name: LowCacheHitRate
    condition: hit_rate < 30%
    action: page_oncall
    
  - name: HighResponseTime
    condition: avg_response_time > 500ms
    action: log_warning
    
  - name: DbConnectivity
    condition: db_errors > 5
    action: alert_ops_team
```

---

## 📚 QUICK REFERENCE

| Concept | Temps | Storage |
|---------|-------|---------|
| En-mémoire | 1-2ms | Session |
| LocalStorage | 5-10ms | 24h |
| Database | 40-100ms | ∞ |
| Scryfall | 300-500ms | 1x par carte |

| Commande | Effet |
|----------|-------|
| `?refresh=true` | Bypass cache, force Scryfall |
| `?stats=true` | Voir les stats du cache |
| `DELETE /cleanup` | Nettoyer les vieilles données |
| `PUT /refresh` | Actualiser une carte |

---

## 🎓 RESSOURCES

- 📚 Documentation complète: `CACHE_SYSTEM_GUIDE.md`
- ⚡ Démarrage rapide: `CACHE_QUICK_START.md`
- 🔧 Exemples: `CACHE_INTEGRATION_EXAMPLES.ts`
- ✅ Tests: `lib/__tests__/card-cache-service.test.ts`
- 📦 Code: `lib/card-cache-service.ts`

---

**Besoin d'aide? Consultez la documentation complète!** 📖
