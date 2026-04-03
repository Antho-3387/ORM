/**
 * Configuration du Système de Cache
 * 
 * Centralise tous les paramètres et configurations
 */

import prisma from '@/lib/prisma'

// ================================================================
// CONFIGURATION
// ================================================================

export const CACHE_CONFIG = {
  // 🎯 TTL (Time To Live)
  TTL: {
    // Frontend
    MEMORY: {
      duration: 30 * 60 * 1000, // 30 minutes
      description: 'Cache en-mémoire React pendant la session'
    },
    LOCALSTORAGE: {
      duration: 24 * 60 * 60 * 1000, // 24 heures
      description: 'Cache persistant frontend'
    },
    // Backend
    DATABASE: {
      duration: null, // Infini (pas d'expiration, sauf cleanup manuel)
      description: 'Cache persistant Supabase'
    },
  },

  // 🔍 Limites de requêtes
  LIMITS: {
    SEARCH_RESULTS: 50, // Max résultats de recherche
    BATCH_SIZE: 100, // Traiter par lots pour performance
    CLEANUP_BATCH: 500, // Supprimer par lots
    MAX_MEMORY_ENTRIES: 500, // Max entrées en-mémoire
  },

  // 🧹 Cleanup automatique
  CLEANUP: {
    ENABLED: true,
    SCHEDULE: '0 3 * * *', // Tous les jours à 3h
    DAYS_THRESHOLD: 30, // Supprimer si > 30 jours
    MIN_SEARCH_COUNT: 2, // Garder si cherchée >= 2 fois
  },

  // 📊 Monitoring
  MONITORING: {
    ENABLED: true,
    METRICS_INTERVAL: 60000, // Collecter metrics toutes les minutes
    ALERT_THRESHOLD: {
      HIT_RATE_LOW: 30, // Alerte si hit rate < 30%
      INACTIVE_CARDS: 80, // Alerte si > 80% cartes inactives
      DB_SIZE_MB: 100, // Alerte si DB > 100MB
    },
  },

  // 🔒 Sécurité
  SECURITY: {
    ADMIN_KEY_REQUIRED: true,
    RATE_LIMIT: {
      ENABLED: true,
      REQUESTS_PER_MINUTE: 60,
      REQUESTS_PER_HOUR: 1000,
    },
  },

  // 🚀 Performance
  PERFORMANCE: {
    // Pré-charger ces cartes au démarrage
    PRELOAD_CARDS: [
      'Black Lotus',
      'Blightsteel Colossus',
      'Omniscience',
      'Lightning Bolt',
      'Counterspell',
    ],
    // Cacher les requêtes de recherche pour la recherche progressive
    DEBOUNCE_SEARCH: 300, // ms
    // Pagination
    PAGINATION: {
      DEFAULT_SIZE: 20,
      MAX_SIZE: 100,
    },
  },

  // 📱 Comportement
  BEHAVIOR: {
    // Cas insensitive pour recherche
    SEARCH_CASE_INSENSITIVE: true,
    // Supporter recherche partielle
    PARTIAL_MATCH: true,
    // Prioriser cartes populaires
    SORT_BY_POPULARITY: true,
    // Mettre à jour lastSearchedAt
    TRACK_SEARCHES: true,
  },
}

// ================================================================
// VARIABLES D'ENVIRONNEMENT
// ================================================================

export const ENV = {
  // Required
  DATABASE_URL: process.env.DATABASE_URL,
  CACHE_ADMIN_KEY: process.env.CACHE_ADMIN_KEY,

  // Optional (avec defaults)
  CACHE_TTL_MEMORY: parseInt(process.env.CACHE_TTL_MEMORY || '1800000'),
  CACHE_TTL_LOCALSTORAGE: parseInt(process.env.CACHE_TTL_LOCALSTORAGE || '86400000'),
  CACHE_CLEANUP_ENABLED: process.env.CACHE_CLEANUP_ENABLED !== 'false',
  CACHE_MONITORING_ENABLED: process.env.CACHE_MONITORING_ENABLED !== 'false',
  SCRYFALL_API_BASE: process.env.SCRYFALL_API_BASE || 'https://api.scryfall.com',
  NODE_ENV: process.env.NODE_ENV || 'development',
}

// ================================================================
// VALIDATION
// ================================================================

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!ENV.DATABASE_URL) {
    errors.push('DATABASE_URL est requis')
  }

  if (!ENV.CACHE_ADMIN_KEY) {
    errors.push('CACHE_ADMIN_KEY est requis')
  } else if (ENV.CACHE_ADMIN_KEY.length < 32) {
    errors.push('CACHE_ADMIN_KEY doit faire au moins 32 caractères')
  }

  if (CACHE_CONFIG.LIMITS.SEARCH_RESULTS > 1000) {
    errors.push('SEARCH_RESULTS ne doit pas dépasser 1000')
  }

  if (CACHE_CONFIG.TTL.MEMORY.duration > CACHE_CONFIG.TTL.LOCALSTORAGE.duration) {
    errors.push('TTL MEMORY ne doit pas dépasser TTL LOCALSTORAGE')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ================================================================
// DEPLOYMENT
// ================================================================

/**
 * Instructions de déploiement
 */
export const DEPLOYMENT_GUIDE = `
# 🚀 DEPLOYMENT GUIDE

## 1. PRÉ-REQUIS
- PostgreSQL compatible (Supabase, AWS RDS, DigitalOcean)
- Next.js 15+
- Node.js 18+

## 2. VARIABLES D'ENVIRONNEMENT (Production)

DATABASE_URL=postgresql://user:pass@host:5432/dbname
CACHE_ADMIN_KEY=generate_a_long_random_key_at_least_32_chars
SCRYFALL_API_BASE=https://api.scryfall.com
CACHE_CLEANUP_ENABLED=true
CACHE_MONITORING_ENABLED=true
NODE_ENV=production

## 3. MIGRATIONS

\`\`\`bash
npm run prisma:migrate:deploy
# Exécute les migrations en production
\`\`\`

## 4. DÉMARRAGE

\`\`\`bash
# Build
npm run build

# Start
npm start

# With PM2 (recommandé)
pm2 start "npm start" --name "magic-cache-app"
pm2 startup
pm2 save
\`\`\`

## 5. MONITORING

Mettre en place des alertes pour:
- Érreurs de connexion DB
- Taux d'erreur API > 5%
- Temps de réponse > 500ms
- Espace disque < 10% libre

## 6. BACKUP

\`\`\`bash
# Daily backup
0 2 * * * /backup-db.sh
\`\`\`

## 7. CLEANUP

\`\`\`bash
# Cleanup cron job
0 3 * * * curl -s http://localhost:3000/api/cards/search-cached/cleanup\\
  -H "Authorization: Bearer \\$CACHE_ADMIN_KEY"
\`\`\`

## 8. LOGS

Les logs du cache vont dans:
- STDOUT/Docker logs
- Application error tracking (Sentry, etc.)

Utiliser des tags pour filtrer:
- [CACHE HIT]
- [CACHE MISS]
- [API ERROR]
- [CLEANUP]
`

// ================================================================
// HEALTH CHECK
// ================================================================

export async function performHealthCheck(): Promise<{
  status: 'ok' | 'degraded' | 'error'
  checks: {
    [key: string]: {
      status: 'ok' | 'error'
      message: string
      duration: number
    }
  }
}> {
  const checks: any = {}

  // 1. Database check
  const dbStart = Date.now()
  try {
    // Vérifier connexion Prisma
    await prisma.$queryRaw`SELECT 1`
    checks.database = {
      status: 'ok',
      message: 'PostgreSQL connected',
      duration: Date.now() - dbStart,
    }
  } catch (error: any) {
    checks.database = {
      status: 'error',
      message: error.message,
      duration: Date.now() - dbStart,
    }
  }

  // 2. Scryfall API check
  const apiStart = Date.now()
  try {
    const response = await fetch('https://api.scryfall.com/cards/random')
    checks.scryfall = {
      status: response.ok ? 'ok' : 'error',
      message: response.ok ? 'Scryfall API responsive' : `HTTP ${response.status}`,
      duration: Date.now() - apiStart,
    }
  } catch (error: any) {
    checks.scryfall = {
      status: 'error',
      message: error.message,
      duration: Date.now() - apiStart,
    }
  }

  // 3. Config check
  const configValidation = validateConfig()
  checks.config = {
    status: configValidation.valid ? 'ok' : 'error',
    message: configValidation.valid 
      ? 'Configuration valid'
      : configValidation.errors.join('; '),
    duration: 0,
  }

  // Overall status
  const hasErrors = Object.values(checks).some((c: any) => c.status === 'error')
  const status = hasErrors ? 'error' : 'ok'

  return {
    status,
    checks,
  }
}

// ================================================================
// EXPORTS
// ================================================================
// Already exported inline above
