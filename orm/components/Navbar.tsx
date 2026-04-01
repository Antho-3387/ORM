'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-blue-600 font-bold text-lg">
          🂡 MTG Decks
        </Link>

        {/* Center nav */}
        <div className="flex items-center gap-6">
          {isAuthenticated && (
            <>
              <Link href="/decks" className="text-gray-700 hover:text-blue-600 text-sm">
                My Decks
              </Link>
              <Link href="/decks/create" className="text-gray-700 hover:text-blue-600 text-sm">
                Create Deck
              </Link>
            </>
          )}
        </div>

        {/* Right - Account */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-700 text-sm">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="text-gray-700 hover:text-blue-600 text-sm">
                Login
              </Link>
              <Link href="/auth" className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

