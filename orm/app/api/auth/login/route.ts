import { NextRequest, NextResponse } from 'next/server'
import { verifyUserCredentials } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et password sont requis' },
        { status: 400 }
      )
    }

    const user = await verifyUserCredentials(email, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error('Error logging in user:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}
