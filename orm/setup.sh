#!/bin/bash

# Script pour initialiser le projet Magic Decks

echo "🃏 Initialisation du projet Magic Decks..."
echo ""

# Vérifier les dépendances
echo "📦 Installation des dépendances..."
npm install

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Créer les migrations
echo "🗄️ Création des migrations de base de données..."
npx prisma migrate dev --name init

# Vérifier la base de données
echo "✅ Vérification de la base de données..."
npx prisma db push

echo ""
echo "✨ Installation complète!"
echo ""
echo "Pour démarrer le serveur de développement:"
echo "  npm run dev"
echo ""
echo "L'application sera disponible sur http://localhost:3000"
