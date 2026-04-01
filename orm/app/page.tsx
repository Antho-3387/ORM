'use client'

import { useEffect } from 'react'

export default function HomePage() {
  useEffect(() => {
    // Redirige vers /public/index.html
    window.location.href = '/'
  }, [])

  return null
}
