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
    <nav className="sticky top-0 z-50 bg-slate-950 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">⚡</span>
          </div>
          <span className="text-lg font-bold text-slate-100 group-hover:text-purple-400 transition hidden md:inline">
            MTG Deck Hub
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
          <NavLink
            href="/statistics"
            label="Stats"
            isActive={isActive('/statistics')}
          />
        </div>

        {/* Right - Account */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-slate-300 text-sm hidden md:inline">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition">
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
          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
          : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
      }`}
    >
      {label}
    </Link>
  )
}

