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
    <nav className="bg-gray-900 border-b border-cyan-400/30 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🂡</span>
            <span className="text-2xl font-bold text-cyan-400">MTG Deck Collection</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-300 text-sm">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" className="text-cyan-400 hover:text-cyan-300 text-sm font-bold">
                  Login
                </Link>
                <Link
                  href="/auth"
                  className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 px-4 py-2 rounded text-sm font-bold"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

