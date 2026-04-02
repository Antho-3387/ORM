'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface TrendingSectionProps {
  title: string
  description?: string
  children: ReactNode
  href?: string
  seeAllLabel?: string
}

export function TrendingSection({
  title,
  description,
  children,
  href,
  seeAllLabel = 'View All',
}: TrendingSectionProps) {
  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-1">
            {title}
          </h2>
          {description && (
            <p className="text-slate-400 text-sm">{description}</p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm font-medium"
          >
            {seeAllLabel}
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-6">
        {children}
      </div>
    </section>
  )
}
