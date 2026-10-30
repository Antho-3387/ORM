'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface ScryfallCard {
  id: string
  name: string
  type_line?: string
  mana_cost?: string
  cmc?: number
  colors?: string[]
  image_uris?: {
    normal?: string
    large?: string
  }
  card_faces?: Array<{
    image_uris?: {
      normal?: string
      large?: string
    }
  }>
  scryfall_uri?: string
}

interface ScryfallSearchResponse {
  data?: ScryfallCard[]
  total_cards?: number
  has_more?: boolean
  error?: string
}

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

type SearchMode = 'catalog' | 'edhrec'

const INITIAL_QUERY = 'Island'

export default function CardsGalleryPage() {
  const [mode, setMode] = useState<SearchMode>('catalog')
  const [query, setQuery] = useState(INITIAL_QUERY)
  const [searchedQuery, setSearchedQuery] = useState(INITIAL_QUERY)
  const [cards, setCards] = useState<ScryfallCard[]>([])
  const [totalCards, setTotalCards] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [isSearching, setIsSearching] = useState(true)
  const [searchError, setSearchError] = useState<string | null>(null)
  const activeSearch = useRef<AbortController | null>(null)

  const [commander, setCommander] = useState('')
  const [searchedCommander, setSearchedCommander] = useState('')
  const [commanderUrl, setCommanderUrl] = useState('')
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [recommendationError, setRecommendationError] = useState<string | null>(null)
  const activeRecommendationRequest = useRef<AbortController | null>(null)

  const searchCatalog = useCallback(async (searchQuery: string, searchPage: number) => {
    activeSearch.current?.abort()
    const controller = new AbortController()
    activeSearch.current = controller
    setIsSearching(true)
    setSearchError(null)

    try {
      const response = await fetch(
        `/api/scryfall/search?q=${encodeURIComponent(searchQuery)}&page=${searchPage}`,
        { signal: controller.signal }
      )
      const data: ScryfallSearchResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Impossible de rechercher les cartes.')
      }

      setCards(data.data || [])
      setTotalCards(data.total_cards || 0)
      setHasMore(data.has_more || false)
      setPage(searchPage)
      setSearchedQuery(searchQuery)
    } catch (error) {
      if (controller.signal.aborted) return

      console.error('Erreur de recherche Scryfall:', error)
      setSearchError(
        error instanceof Error ? error.message : 'La recherche de cartes a échoué.'
      )
      setCards([])
      setTotalCards(0)
      setHasMore(false)
    } finally {
      if (!controller.signal.aborted) {
        setIsSearching(false)
        activeSearch.current = null
      }
    }
  }, [])

  useEffect(() => {
    void searchCatalog(INITIAL_QUERY, 1)

    return () => {
      activeSearch.current?.abort()
      activeRecommendationRequest.current?.abort()
    }
  }, [searchCatalog])

  const loadRecommendations = useCallback(async (name: string) => {
    activeRecommendationRequest.current?.abort()
    const controller = new AbortController()
    activeRecommendationRequest.current = controller
    setIsLoadingRecommendations(true)
    setRecommendationError(null)

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
    } catch (error) {
      if (controller.signal.aborted) return

      console.error('Erreur de chargement des recommandations EDHREC:', error)
      setRecommendationError(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue pendant le chargement des recommandations.'
      )
      setRecommendations([])
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingRecommendations(false)
        activeRecommendationRequest.current = null
      }
    }
  }, [])

  function handleCatalogSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (query.trim()) {
      void searchCatalog(query.trim(), 1)
    }
  }

  function handleRecommendationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (commander.trim()) {
      void loadRecommendations(commander.trim())
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold sm:text-4xl">Recherche de cartes Magic</h1>
          <p className="text-slate-300">
            Recherchez les cartes Magic: The Gathering avec leurs images.
          </p>
        </header>

        <div className="mb-6 flex justify-center gap-3" aria-label="Mode de recherche">
          <button
            type="button"
            onClick={() => setMode('catalog')}
            aria-pressed={mode === 'catalog'}
            className={`rounded-lg px-4 py-2 font-semibold transition ${
              mode === 'catalog' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Toutes les cartes
          </button>
          <button
            type="button"
            onClick={() => setMode('edhrec')}
            aria-pressed={mode === 'edhrec'}
            className={`rounded-lg px-4 py-2 font-semibold transition ${
              mode === 'edhrec' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Recommandations EDHREC
          </button>
        </div>

        {mode === 'catalog' ? (
          <>
            <form
              onSubmit={handleCatalogSubmit}
              className="mx-auto mb-6 flex max-w-3xl flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4 sm:flex-row"
            >
              <label htmlFor="card-query" className="sr-only">
                Rechercher dans les cartes Magic
              </label>
              <input
                id="card-query"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='Ex. "Sol Ring", Island, type:creature color:U'
                className="min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="rounded-lg bg-purple-600 px-5 py-3 font-semibold transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Rechercher
              </button>
            </form>

            <p className="mb-5 text-center text-sm text-slate-400">
              Recherche dans le catalogue complet Scryfall. Syntaxe avancée acceptée, par exemple{' '}
              <code className="text-purple-300">type:creature color:U</code>.
            </p>

            {searchedQuery && !searchError && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-slate-300">
                  {totalCards.toLocaleString('fr-FR')} résultats pour{' '}
                  <span className="font-semibold text-white">{searchedQuery}</span>
                  {' '}· page {page}
                </p>
                <a
                  href="https://scryfall.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-purple-300 underline underline-offset-4 hover:text-purple-200"
                >
                  Source : Scryfall
                </a>
              </div>
            )}

            {searchError && <ErrorMessage>{searchError}</ErrorMessage>}

            {isSearching ? (
              <p className="py-16 text-center text-slate-300" role="status">
                Recherche des cartes…
              </p>
            ) : !searchError && cards.length === 0 ? (
              <p className="py-16 text-center text-slate-300">
                Aucune carte trouvée pour cette recherche.
              </p>
            ) : (
              <>
                <section
                  aria-label={`Résultats de recherche pour ${searchedQuery}`}
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                >
                  {cards.map((card) => (
                    <ScryfallCardTile key={card.id} card={card} />
                  ))}
                </section>

                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => void searchCatalog(searchedQuery, page - 1)}
                    disabled={page <= 1 || isSearching}
                    className="rounded-lg border border-slate-600 px-4 py-2 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-slate-400">Page {page}</span>
                  <button
                    type="button"
                    onClick={() => void searchCatalog(searchedQuery, page + 1)}
                    disabled={!hasMore || page >= 100 || isSearching}
                    className="rounded-lg border border-slate-600 px-4 py-2 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Suivant
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <p className="mb-5 text-center text-slate-300">
              Trouvez les cartes les plus jouées avec un commandant.
            </p>
            <form
              onSubmit={handleRecommendationSubmit}
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
                disabled={isLoadingRecommendations || !commander.trim()}
                className="rounded-lg bg-purple-600 px-5 py-3 font-semibold transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Rechercher
              </button>
            </form>

            {searchedCommander && !recommendationError && (
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

            {recommendationError && <ErrorMessage>{recommendationError}</ErrorMessage>}

            {isLoadingRecommendations ? (
              <p className="py-16 text-center text-slate-300" role="status">
                Chargement des recommandations EDHREC…
              </p>
            ) : !recommendationError && recommendations.length === 0 ? (
              <p className="py-16 text-center text-slate-300">
                Entrez le nom d’un commandant pour afficher ses recommandations.
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
          </>
        )}

        <p className="mt-8 text-center text-xs text-slate-500">
          Les images et données des cartes sont fournies par Scryfall et EDHREC.
        </p>
      </div>
    </main>
  )
}

function ErrorMessage({ children }: { children: string }) {
  return (
    <div role="alert" className="mb-6 rounded-lg border border-red-500/40 bg-red-950/60 p-4 text-red-200">
      {children}
    </div>
  )
}

function ScryfallCardTile({ card }: { card: ScryfallCard }) {
  const [imageError, setImageError] = useState(false)
  const image = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal

  return (
    <article className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      <div className="aspect-[5/7] bg-slate-800">
        {image && !imageError ? (
          <Image
            src={image}
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
        <h2 className="line-clamp-2 min-h-10 text-sm font-semibold text-white">{card.name}</h2>
        <p className="mt-1 line-clamp-2 min-h-8 text-xs text-slate-400">{card.type_line}</p>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-400">
          <span>{card.mana_cost || 'Sans coût de mana'}</span>
          {card.scryfall_uri && (
            <a
              href={card.scryfall_uri}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-purple-300 hover:text-purple-200"
            >
              Détails
            </a>
          )}
        </div>
      </div>
    </article>
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
        <h2 className="line-clamp-2 min-h-10 text-sm font-semibold text-white">{card.name}</h2>
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
