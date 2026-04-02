'use client'

import { ReactNode } from 'react'

interface CardGridProps {
  children: ReactNode
  columns?: number
}

export function CardGrid({ children, columns = 5 }: CardGridProps) {
  const gridClass = {
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
  }[columns] || 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {children}
    </div>
  )
}
