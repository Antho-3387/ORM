'use client'

import { StatsGrid } from '@/components/StatsBar'
import { CardGrid } from '@/components/CardGrid'
import { CardImage } from '@/components/CardImage'
import { TrendingSection } from '@/components/TrendingSection'

const MOCK_STATS = {
  cards: [
    {
      id: '1',
      name: 'Sol Ring',
      imageUrl: 'https://images.scryfall.io/cards/large/front/e/6/e6211e3e-8494-40ba-b149-eb89e618e1d2.jpg?1699395241',
      manaValue: 1,
      colors: '',
      type: 'Artifact',
      stats: { popularity: 89, synergies: 234, decks: 5421 },
    },
    {
      id: '2',
      name: 'Lightning Bolt',
      imageUrl: 'https://images.scryfall.io/cards/large/front/c/e/ce711943-c1a1-43a0-8b97-8a547503537f.jpg?1601077628',
      manaValue: 1,
      colors: 'R',
      type: 'Instant',
      stats: { popularity: 94, synergies: 187, decks: 3201 },
    },
    {
      id: '3',
      name: 'Counterspell',
      imageUrl: 'https://images.scryfall.io/cards/large/front/1/9/1920dae4-fb92-412f-b8f9-4eca114b06ec.jpg?1599769051',
      manaValue: 2,
      colors: 'U',
      type: 'Instant',
      stats: { popularity: 88, synergies: 156, decks: 2890 },
    },
    {
      id: '4',
      name: 'Demonic Tutor',
      imageUrl: 'https://images.scryfall.io/cards/large/front/3/b/3bdbc3c9-8a89-4f0a-961b-6ad563ce98c2.jpg?1599765488',
      manaValue: 2,
      colors: 'B',
      type: 'Instant',
      stats: { popularity: 92, synergies: 201, decks: 4156 },
    },
    {
      id: '5',
      name: 'Green Sun\'s Zenith',
      imageUrl: 'https://images.scryfall.io/cards/large/front/0/1/01794178-cf41-454c-ac37-1d8b3e638378.jpg?1580014961',
      manaValue: 2,
      colors: 'G',
      type: 'Instant',
      stats: { popularity: 85, synergies: 198, decks: 3845 },
    },
    {
      id: '6',
      name: 'Swords to Plowshares',
      imageUrl: 'https://images.scryfall.io/cards/large/front/b/e/be2b4177-e47c-4dde-9322-b9876749c6e6.jpg?1611967006',
      manaValue: 1,
      colors: 'W',
      type: 'Instant',
      stats: { popularity: 91, synergies: 167, decks: 2945 },
    },
  ],
}

export default function StatisticsPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
            Magic Statistics
          </h1>
          <p className="text-lg text-slate-400">
            Explore meta trends, card popularity, and deck statistics across all formats
          </p>
        </div>

        {/* Overview Stats */}
        <StatsGrid
          stats={[
            { label: 'Top Card This Week', value: 'Sol Ring', icon: '🎴', color: 'purple' },
            { label: 'Most Played Format', value: 'Commander', icon: '⚔️', color: 'blue' },
            { label: 'Avg Deck Size', value: '99.2', unit: 'cards', icon: '📦', color: 'green' },
            { label: 'Global Meta', value: '2,345', unit: 'decks', icon: '🌍', color: 'red' },
          ]}
        />

        {/* Meta Analysis */}
        <TrendingSection
          title="📊 Format Meta Analysis"
          description="Win rates and popularity by format"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Commander', winRate: 45, popularity: 89, decks: 15234 },
              { name: 'Modern', winRate: 38, popularity: 72, decks: 8945 },
              { name: 'Pioneer', winRate: 41, popularity: 65, decks: 5234 },
              { name: 'Vintage', winRate: 52, popularity: 34, decks: 1234 },
            ].map((format) => (
              <div key={format.name} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold text-slate-100 mb-3">{format.name}</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Popularity</p>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{ width: `${format.popularity}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{format.popularity}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TrendingSection>

        {/* Most Popular Cards */}
        <TrendingSection
          title="🏆 Most Popular Cards"
          description="Cards with the highest inclusion rate and synergy count"
        >
          <CardGrid columns={5}>
            {MOCK_STATS.cards.map((card) => (
              <CardImage key={card.id} {...card} />
            ))}
          </CardGrid>
        </TrendingSection>

        {/* Color Distribution */}
        <TrendingSection
          title="🎨 Color Meta Distribution"
          description="How often each color appears in competitive decks"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { color: 'White', code: 'W', percentage: 45, bg: 'bg-yellow-500' },
              { color: 'Blue', code: 'U', percentage: 52, bg: 'bg-blue-500' },
              { color: 'Black', code: 'B', percentage: 48, bg: 'bg-gray-800' },
              { color: 'Red', code: 'R', percentage: 41, bg: 'bg-red-500' },
              { color: 'Green', code: 'G', percentage: 58, bg: 'bg-green-600' },
            ].map((color) => (
              <div key={color.code} className="text-center">
                <div className={`w-full h-32 ${color.bg} rounded-lg mb-3 flex items-end justify-center pb-4 relative`}>
                  <div className="text-white font-bold text-2xl">{color.percentage}%</div>
                </div>
                <p className="font-semibold text-slate-100">{color.color}</p>
              </div>
            ))}
          </div>
        </TrendingSection>

        {/* Type Distribution */}
        <TrendingSection
          title="📈 Card Type Meta"
          description="Most played card types across all decks"
        >
          <div className="space-y-4">
            {[
              { type: 'Creature', count: 12456, percentage: 42 },
              { type: 'Instant', count: 9876, percentage: 33 },
              { type: 'Sorcery', count: 7234, percentage: 24 },
              { type: 'Enchantment', count: 6543, percentage: 22 },
              { type: 'Artifact', count: 5432, percentage: 18 },
              { type: 'Land', count: 4321, percentage: 15 },
            ].map((type) => (
              <div key={type.type} className="flex items-center gap-4">
                <p className="w-24 font-semibold text-slate-200">{type.type}</p>
                <div className="flex-1 bg-slate-800 rounded-lg h-8 relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${type.percentage * 2}%` }}
                  >
                    <div className="h-full flex items-center px-3 text-white text-sm font-medium">
                      {type.count.toLocaleString()} decks
                    </div>
                  </div>
                </div>
                <p className="w-16 text-right text-slate-400 text-sm">{type.percentage}%</p>
              </div>
            ))}
          </div>
        </TrendingSection>

        {/* Synergy Leaders */}
        <TrendingSection
          title="🔗 Synergy Leaders"
          description="Cards that create the most powerful synergies"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Doubling Season', synergies: 342, growth: '+12%' },
              { name: 'Parallel Lives', synergies: 298, growth: '+8%' },
              { name: 'Rings of Brighthearth', synergies: 276, growth: '+5%' },
              { name: 'Proliferate Effects', synergies: 245, growth: '+15%' },
            ].map((item) => (
              <div key={item.name} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between hover:border-purple-400 transition">
                <div>
                  <h3 className="font-semibold text-slate-100">{item.name}</h3>
                  <p className="text-sm text-slate-400">{item.synergies} synergies</p>
                </div>
                <div className="text-green-400 font-semibold">{item.growth}</div>
              </div>
            ))}
          </div>
        </TrendingSection>
      </div>
    </main>
  )
}