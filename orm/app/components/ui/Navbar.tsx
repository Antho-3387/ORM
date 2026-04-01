'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from './Button'

interface NavbarProps {
  user?: { name?: string; email: string; id: string }
  onLogout?: () => void
}

export function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <nav className="bg-purple-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          🃏 Magic Decks
        </Link>

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-sm">Bienvenue, {user.name}</span>
              <Button onClick={onLogout} variant="secondary" className="text-sm">
                Se déconnecter
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-200">
                Connexion
              </Link>
              <Link href="/register" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
