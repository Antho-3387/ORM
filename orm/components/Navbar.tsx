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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            🂡 MTG Decks
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link href="/decks" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
                  My Decks
                </Link>
                <Link href="/decks/create" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
                  Create Deck
                </Link>
              </>
            ) : null}
          </div>

          {/* Right side - Account */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="text-sm text-gray-600">{user?.email}</div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  href="/auth"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

