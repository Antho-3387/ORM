'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <nav style={{
      background: '#1a1a2e',
      borderBottom: '1px solid #404050',
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link href="/">
          <span style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#ffffff',
            cursor: 'pointer'
          }}>
            MTG Decks
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <NavLink href="/" label="Home" />
          <NavLink href="/decks" label="Mes Decks" />
          <NavLink href="/cards" label="Cards" />
        </div>

        {/* Auth Section (Top Right) */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {user ? (
            <>
              <span style={{
                color: '#e0e0e0',
                fontSize: '0.9rem'
              }}>
                {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link href="/auth?tab=login">
                <button
                  style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Connexion
                </button>
              </Link>
              <Link href="/auth?tab=register">
                <button
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Inscription
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <span style={{
        color: '#e0e0e0',
        cursor: 'pointer',
        transition: 'color 0.2s'
      }} onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'} onMouseLeave={(e) => e.currentTarget.style.color = '#e0e0e0'}>
        {label}
      </span>
    </Link>
  )
}


