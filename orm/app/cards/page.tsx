'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface Recommendation {
  id: string
  name: string
  imageUrl: string
  edhrecUrl: string
  synergy?: number
  deckCount?: number
}

interface RecommendationsResponse {
  commander?: string
  commanderUrl?: string
  recommendations?: Recommendation[]
  error?: string
}

const INITIAL_COMMANDER = 'Atraxa, Grand Unifier'

export default function CardsGalleryPage() {
  const [commander, setCommander] = useState(INITIAL_COMMANDER)
  const [searchedCommander, setSearchedCommander] = useState('')
  const [commanderUrl, setCommanderUrl] = useState('')
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)

  const loadRecommendations = useCallback(async (name: string) => {
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/edhrec?commander=${encodeURIComponent(name)}`,
        { signal: controller.signal }
      )
      const data: RecommendationsResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de charger les recommandations EDHREC.')
      }

      setSearchedCommander(data.commander || name)
      setCommanderUrl(data.commanderUrl || '')
      setRecommendations(data.recommendations || [])
    } catch (requestError) {
      if (controller.signal.aborted) return

      console.error('Erreur lors du chargement des recommandations EDHREC:', requestError)
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Une erreur est survenue pendant le chargement des recommandations.'
      )
      setRecommendations([])
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
        activeRequest.current = null
      }
    }
  }, [])

  useEffect(() => {
    void loadRecommendations(INITIAL_COMMANDER)

    return () => {
      activeRequest.current?.abort()
    }
  }, [loadRecommendations])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (commander.trim()) {
      void loadRecommendations(commander.trim())
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold sm:text-4xl">Cartes recommandées par EDHREC</h1>
          <p className="text-slate-300">
            Découvrez les cartes les plus jouées avec votre commandant.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mb-8 flex max-w-2xl flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4 sm:flex-row"
        >
          <label htmlFor="commander" className="sr-only">
            Nom du commandant
          </label>
          <input
            id="commander"
            type="search"
            value={commander}
            onChange={(event) => setCommander(event.target.value)}
            placeholder="Ex. Atraxa, Grand Unifier"
            className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            disabled={isLoading || !commander.trim()}
            className="rounded-lg bg-purple-600 px-5 py-3 font-semibold transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Rechercher
          </button>
        </form>

        {searchedCommander && !error && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">
              Recommandations pour{' '}
              <span className="text-purple-300">{searchedCommander}</span>
            </h2>
            <a
              href={commanderUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-purple-300 underline underline-offset-4 hover:text-purple-200"
            >
              Voir sur EDHREC
            </a>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-500/40 bg-red-950/60 p-4 text-red-200"
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="py-16 text-center text-slate-300" role="status">
            Chargement des recommandations EDHREC…
          </p>
        ) : !error && recommendations.length === 0 ? (
          <p className="py-16 text-center text-slate-300">
            Aucune recommandation trouvée pour ce commandant.
          </p>
        ) : (
          <section
            aria-label={`Cartes recommandées pour ${searchedCommander}`}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            {recommendations.map((card) => (
              <RecommendationCard key={card.id} card={card} />
            ))}
          </section>
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          Données et images fournies par EDHREC.
        </p>
      </div>
    </main>
  )
}

function RecommendationCard({ card }: { card: Recommendation }) {
  const [imageError, setImageError] = useState(false)

  return (
    <a
      href={card.edhrecUrl}
      target="_blank"
      rel="noreferrer"
      className="group overflow-hidden rounded-lg border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-purple-500/70"
    >
      <div className="aspect-[5/7] bg-slate-800">
        {!imageError ? (
          <Image
            src={card.imageUrl}
            alt={card.name}
            width={400}
            height={560}
            unoptimized
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-sm text-slate-300">
            {card.name}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-white">{card.name}</h3>
        <div className="mt-2 flex justify-between gap-2 text-xs text-slate-400">
          {card.deckCount !== undefined && (
            <span>{card.deckCount.toLocaleString('fr-FR')} decks</span>
          )}
          {card.synergy !== undefined && (
            <span>Synergie {Math.round(card.synergy * 100)} %</span>
          )}
        </div>
      </div>
    </a>
  )
}
