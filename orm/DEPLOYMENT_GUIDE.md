# 🚀 Deployment Guide - MTG Deck Hub

> Instructions pour déployer votre application en production

---

## 📋 Quick Navigation
1. [Vercel (Recommandé)](#vercel)
2. [Render](#render)
3. [Docker](#docker)
4. [Environment Variables](#env)

---

## 🚀 Vercel (Recommandé) {#vercel}

### Meilleure option pour Next.js

1. **Préparer le repo**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Aller sur [vercel.com](https://vercel.com)**
   - Click "New Project"
   - Connecter GitHub
   - Sélectionner le repo
   - Configurer le dossier `orm`

3. **Settings:**
   ```
   Framework: Next.js
   Root Directory: ./orm
   Build: npm run build
   Output: .next
   ```

4. **Add Environment Variables:**
   ```
   DATABASE_URL=postgresql://...
   NEXT_PUBLIC_SCRYFALL_API=https://api.scryfall.com
   ```

5. **Deploy!**
   - Click Deploy et c'est fini
   - Vercel créera un domain automatique

---

## 🎨 Render {#render}

Si vous utilisez Render au lieu de Vercel:

1. **Créer Render account** - [render.com](https://render.com)

2. **Créer New Web Service**
   - Connecter GitHub repo
   - Sélectionner le repo

3. **Configure**
   ```
   Name: mtg-deck-hub
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Root Directory: orm
   ```

4. **Environment Variables**
   ```
   DATABASE_URL=postgresql://user:pass@host/db
   NODE_ENV=production
   ```

5. **Deploy**
   - Click Deploy via Render UI

---

## 🐳 Docker {#docker}

### Option pour déploiement custom

**Créer Dockerfile:**
```dockerfile
# orm/Dockerfile

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Build & Run:**
```bash
docker build -t mtg-deck-hub .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  mtg-deck-hub
```

---

## 🔐 Environment Variables {#env}

### .env.local (local development)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/orm
NEXT_PUBLIC_SCRYFALL_API=https://api.scryfall.com
```

### Production (Vercel/Render)

Dans la plateforme:
- Settings → Environment Variables
- Ajouter chaque variable depuis .env.local

---

## 📋 Pre-Deployment Checklist

```bash
# 1. Test build
npm run build

# 2. Test server
npm run start

# 3. Run linter
npm run lint

# 4. Check for errors
npm run lint -- --fix

# 5. All pages work
# Visiter chaque page

# 6. Images load
# Vérifier les images Scryfall
```

---

## ✅ Post-Deployment

### Verify Deployment

```bash
# Test production URL
curl https://your-app.vercel.app/

# Check pages load
https://your-app.vercel.app/
https://your-app.vercel.app/cards
https://your-app.vercel.app/decks
https://your-app.vercel.app/statistics
```

### Monitor Performance

- [Vercel Analytics](https://vercel.com) - Built-in
- [Render Dashboard](https://render.com) - If using Render
- [Google PageSpeed Insights](https://pagespeed.web.dev)

---

**Prêt? Deployez avec confiance! 🚀**
2. Créer un repo: `magic-decks`
3. Copier l'URL

### 3.3 Pousser le code
```bash
git remote add origin https://github.com/YOUR_USERNAME/magic-decks.git
git push -u origin main
```

## Étape 4: Déployer sur Render

### 4.1 Créer un compte Render
1. Aller sur https://render.com
2. Se connecter avec GitHub
3. Autoriser Render à accéder vos repos

### 4.2 Créer un Web Service
1. Dashboard → "+ New" → "Web Service"
2. Sélectionner repo: `magic-decks`
3. Configurer:
   - **Name**: `magic-decks-app`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Region**: USA ou Europe (au choix)

### 4.3 Ajouter les variables d'environnement
1. Aller dans "Environment"
2. Ajouter les variables:

```
DATABASE_URL: postgresql://postgres.ahlkrhnrkzxoxnrmnwjw:G9#fL7mZ2!qXeP8@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

NODE_ENV: production

NEXT_PUBLIC_SUPABASE_URL: https://ahlkrhnrkzxoxnrmnwjw.supabase.co
```

### 4.4 Déployer
1. Cliquer sur "Create Web Service"
2. Attendre le Build (2-5 minutes)
3. Copier l'URL générée

## Étape 5: Vérifier le déploiement

### 5.1 Vérifier les logs
- Dashboard → Web Service → Logs
- Chercher "Server listening on"

### 5.2 Tester l'app
1. Aller sur: https://magic-decks-app.onrender.com (ou votre URL)
2. Tester: 
   - ✅ Inscrivez-vous
   - ✅ Créez un deck
   - ✅ Recherchez des cartes
   - ✅ Ajoutez des cartes

### 5.3 Vérifier la BD
```bash
# En local
npx prisma studio
# Voir les données dans: database URL Supabase
```

## Étape 6: Maintenance et Updates

### 6.1 Pour faire une mise à jour
```bash
# En local
git add .
git commit -m "🔧 Description de la modification"
git push origin main
# Render va automatiquement redéployer
```

### 6.2 Vérifier les migrations BD
Si vous avez modifié `schema.prisma`:
```bash
npx prisma migrate dev --name description
npx prisma generate
git push
```

### 6.3 Voir les logs en production
- Dashboard → Logs → "Logs Stream"
- Tail -f les erreurs

## 🐛 Dépannage

### Erreur 1: "Cannot find module @prisma/client"
**Solution:**
```bash
npx prisma generate
npm run build
```

### Erreur 2: "DATABASE_URL is not defined"
**Solution:**
1. Vérifier variables d'environnement dans Render
2. Relancer le service: "Manual Deploy"

### Erreur 3: "POSTGRES connection failed"
**Solution:**
1. Tester la connection locale
2. Vérifier DATABASE_URL exactement
3. Vérifier firewall Supabase

### Erreur 4: "Port binding failed"
**Solution:**
- Normal pour Render, Service redémarre automatiquement

### Erreur 5: "Cannot POST /api/decks"
**Solution:**
1. Vérifier le header `x-user-id`
2. Vérifier userId dans localStorage

## 📊 Monitoring

### Vérifier les performances
1. Dashboard → Metrics
2. Observer: CPU, Memory, Disk

### Logs recommandés
```bash
# En production
tail -f /var/log/app.log

# Ou via Render Dashboard
Logs → Real-time tail
```

## 🔒 Sécurité Importante

### Points clés
1. ✅ Ne JAMAIS commiter `.env.local` (est dans `.gitignore`)
2. ✅ DATABASE_URL reste secret
3. ✅ Activer HTTPS (Render auto)
4. ✅ Valider tous les inputs

### Amélioration future
- [ ] Utiliser NextAuth.js au lieu de localStorage
- [ ] Implémenter des rate limiters
- [ ] Ajouter logging centralisé
- [ ] Configurer CORS proprement

## 📈 Optimisations

### Améliorer les performances
```bash
# Production mode
NODE_ENV=production
npm run build

# Vérifier build size
npm run build -- --analyze
```

### Caching Prisma
Déjà optimisé avec:
- Connection pooling (pgbouncer)
- Requêtes select optimisées
- Indexes BD

## 🎯 Checklist Final

- [ ] Repo GitHub créé et pushé
- [ ] Variables d'env sur Render configurées
- [ ] BD initialisée (migrations effectuées)
- [ ] Service Render créé
- [ ] Build réussi (logs verts)
- [ ] App accessible via URL
- [ ] Inscription/Login fonctionne
- [ ] Recherche cartes fonctionne
- [ ] Decks créés/sauvegardés en BD

## 📞 Support

**Problèmes?**
1. Vérifier les logs: Render Dashboard → Logs
2. Tester en local: `npm run dev`
3. Vérifier variables d'env
4. Vérifier .env.local ne soit pas versionné

**URLs Utiles:**
- 🔗 Render Docs: https://render.com/docs
- 🔗 Prisma Docs: https://www.prisma.io/docs
- 🔗 Next.js Docs: https://nextjs.org/docs
- 🔗 Supabase Help: https://supabase.io/docs

---

**Vous êtes prêt! 🚀** Votre app Magic Decks est maintenant déployée sur Render!
