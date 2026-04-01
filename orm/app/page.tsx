'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Button'
import { Navbar } from '@/app/components/ui/Navbar'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = React.useState<{ id: string; email: string; name?: string } | undefined>()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('userId')
    router.push('/login')
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <div className="bg-gradient-to-b from-purple-900 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">🃏 Magic Decks</h1>
          <p className="text-xl mb-8">
            Créez, partagez et gérez vos decks Magic: The Gathering
          </p>

          {user ? (
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard/decks">
                <Button className="px-6 py-3">Voir mes Decks</Button>
              </Link>
              <Link href="/dashboard/decks/create">
                <Button className="px-6 py-3 bg-green-600 hover:bg-green-700">
                  Créer un Deck
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button className="px-6 py-3">Se Connecter</Button>
              </Link>
              <Link href="/register">
                <Button className="px-6 py-3 bg-green-600 hover:bg-green-700">
                  S'inscrire
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Fonctionnalités</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">📋 Créer des Decks</h3>
            <p className="text-gray-600">
              Créez vos propres decks et gérez vos cartes facilement
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">🔍 Rechercher des Cartes</h3>
            <p className="text-gray-600">
              Accédez à la base de données complète de Magic: The Gathering
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">📊 Trier et Filtrer</h3>
            <p className="text-gray-600">
              Triez vos cartes par couleur, puissance et bien d'autres critères
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
