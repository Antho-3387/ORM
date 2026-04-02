'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
      router.push('/decks')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ background: '#16213e', borderRadius: '12px', padding: '2rem', border: '1px solid #404050' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#ffffff', marginBottom: '2rem', textAlign: 'center' }}>
            {isLogin ? 'Se connecter' : 'S\'inscrire'}
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isLogin && (
              <div>
                <label style={{ color: '#e0e0e0', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  Nom
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  required={!isLogin}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0f3460',
                    color: '#e0e0e0',
                    border: '1px solid #404050',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ color: '#e0e0e0', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  color: '#e0e0e0',
                  border: '1px solid #404050',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ color: '#e0e0e0', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0f3460',
                  color: '#e0e0e0',
                  border: '1px solid #404050',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: '#ff6b6b',
                color: '#fff',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem',
                background: '#00d4ff',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                marginTop: '0.5rem',
              }}
            >
              {loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'S\'inscrire'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', color: '#a0a0a0', textAlign: 'center', fontSize: '0.9rem' }}>
            {isLogin ? "Pas de compte ? " : "Déjà inscrit ? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#00d4ff',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isLogin ? 'S\'inscrire' : 'Se connecter'}
            </button>
          </div>

          <Link href="/" style={{ display: 'block', marginTop: '1rem', textAlign: 'center', color: '#a0a0a0', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  )
}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={!isLogin}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 mt-6"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Back */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
