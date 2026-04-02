'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="py-8 px-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3 border-2 border-blue-600 rounded-full px-4 py-2 w-96 bg-white">
              <input
                type="text"
                placeholder="Recherche un deck..."
                className="flex-1 outline-none text-gray-700"
              />
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Title and Menu */}
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-blue-700">Commander Decks :</h1>
            
            {/* Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 border-2 border-blue-600 text-blue-700 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition"
              >
                <span>⭐</span>
                Créer un deck
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-blue-600 rounded-xl shadow-lg z-50">
                  <Link
                    href="/decks/create"
                    className="flex items-center gap-2 px-4 py-3 text-blue-700 font-bold hover:bg-blue-50 border-b border-blue-200 rounded-t-lg"
                  >
                    <span>⭐</span>
                    Créer un deck
                  </Link>
                  <Link
                    href="/decks/import"
                    className="flex items-center gap-2 px-4 py-3 text-blue-700 font-bold hover:bg-blue-50"
                  >
                    <span>📋</span>
                    Coller un decklist
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Options */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            href="/decks/create"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg border-2 border-transparent hover:border-blue-600 transition"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">⭐</div>
              <h2 className="text-2xl font-bold text-blue-700 mb-3">Créer un deck</h2>
              <p className="text-gray-600">Construisez votre deck Commander en cherchant et en sélectionnant des cartes.</p>
            </div>
          </Link>

          <Link
            href="/decks/import"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg border-2 border-transparent hover:border-blue-600 transition"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-blue-700 mb-3">Coller un decklist</h2>
              <p className="text-gray-600">Importez rapidement une decklist depuis Scryfall ou un autre site.</p>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-700 mb-2">Format Commander</h3>
          <p className="text-gray-700 text-sm">
            <strong>Format :</strong> 100 cartes, 1 seule copie de chaque, 1 commander légende<br/>
            <strong>Règles :</strong> Seulement les cartes légales en Commander EDH
          </p>
        </div>
      </div>
    </main>
  )
}
