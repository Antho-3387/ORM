'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container-clean py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">🃏</span>
          </div>
          <span className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition hidden md:inline">
            MTG Decks
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 md:gap-2">
          <NavLink
            href="/"
            label="Home"
            isActive={isActive('/')}
          />
          <NavLink
            href="/decks"
            label="Decks"
            isActive={isActive('/decks')}
          />
          <NavLink
            href="/cards"
            label="Cards"
            isActive={isActive('/cards')}
          />
        </div>

        {/* Right - Account */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-600 text-sm hidden md:inline">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

interface NavLinkProps {
  href: string
  label: string
  isActive?: boolean
}

function NavLink({ href, label, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg transition text-sm font-medium ${
        isActive
          ? 'bg-indigo-100 text-indigo-600 border border-indigo-300'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  )
}


