'use client'

import Link from 'next/link'

export function Navbar() {
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
          <NavLink href="/decks/create" label="Decks" />
          <NavLink href="/cards" label="Cards" />
          <NavLink href="/cards-virtual" label="Explorer" />
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


