'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function PremiumNavbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/decks', label: 'Decks', icon: '📚' },
    { href: '/builder', label: 'Builder', icon: '⚡' },
    { href: '/cards', label: 'Cards', icon: '🃏' },
  ]

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/50 border-b border-slate-700/20">
      <div className="container-clean py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all">
            <span className="text-white font-bold text-lg">⚡</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hidden md:inline">
            MTG Vault
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1 md:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                isActive(item.href)
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <span>{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg font-medium text-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40">
            Sign In
          </button>
        </div>
      </div>
    </nav>
  )
}
