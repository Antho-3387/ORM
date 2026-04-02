'use client'

interface StatBarProps {
  label: string
  value: number | string
  unit?: string
  icon?: string
  color?: 'purple' | 'blue' | 'green' | 'red'
}

export function StatBar({ label, value, unit, icon, color = 'purple' }: StatBarProps) {
  const colorMap = {
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  return (
    <div className={`p-4 rounded-lg border ${colorMap[color]} flex items-center gap-3`}>
      {icon && <span className="text-2xl">{icon}</span>}
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-100">
          {value}
          {unit && <span className="text-lg text-slate-400 ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  )
}

interface StatsGridProps {
  stats: StatBarProps[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <StatBar key={idx} {...stat} />
      ))}
    </div>
  )
}
