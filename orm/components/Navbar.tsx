'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/')
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-purple-500/20 sticky top-0 z-50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-2xl">🂡</span>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Magic Decks
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <Link
                  href="/decks"
                  className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-slate-700/50"
                >
                  My Decks
                </Link>
                <Link
                  href="/decks/create"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg hover:shadow-purple-500/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  + New Deck
                </Link>
                <div className="px-4 py-2 text-sm text-slate-300 border-l border-slate-700 ml-4">
                  {user?.name || user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-slate-700/50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-slate-700/50"
                >
                  Login
                </Link>
                <Link
                  href="/auth"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg hover:shadow-purple-500/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white focus:outline-none p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 py-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/decks"
                  className="block text-slate-300 hover:text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Decks
                </Link>
                <Link
                  href="/decks/create"
                  className="block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded text-sm font-medium my-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  + New Deck
                </Link>
                <div className="px-4 py-2 text-sm text-slate-400 border-t border-slate-700 mt-2">
                  {user?.name || user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-slate-300 hover:text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700/50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="block text-slate-300 hover:text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth"
                  className="block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded text-sm font-medium my-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
