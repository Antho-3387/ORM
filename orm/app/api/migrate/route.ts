import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST() {
  try {
    // Run Prisma migration
    execSync('npx prisma db push --skip-generate', {
      stdio: 'inherit',
      env: process.env,
    })
    
    return NextResponse.json({ success: true, message: 'Migration completed' })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    )
  }
}
