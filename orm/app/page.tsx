import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1>Commander Decks</h1>
      <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem', color: '#b0b0c0' }}>
        Créez, gérez et sauvegardez vos decks Commander Magic: The Gathering. 
      </p>

      <Link href="/decks/create">
        <button>
          + Créer un Deck
        </button>
      </Link>

      <div style={{ 
        background: '#2a3a4e', 
        border: '1px solid #404050', 
        padding: '2rem', 
        borderRadius: '8px',
        marginTop: '4rem'
      }}>
        <h2>Commencer</h2>
        <p>
          Cliquez sur le bouton "Créer un Deck" pour démarrer. 
          Vous pouvez ensuite coller votre decklist au format Commander 
          et la sauvegarder localement.
        </p>
      </div>
    </main>
  )
}
