const API_BASE = 'http://localhost:3001/api'
let filteredDecks = []
let allDecks = []
let currentDeck = null

// ==================== Storage ====================
function setUser(user, userId) {
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('userId', userId)
}

function getUser() {
  return JSON.parse(localStorage.getItem('user') || 'null')
}

function getUserId() {
  return localStorage.getItem('userId')
}

function clearUser() {
  localStorage.removeItem('user')
  localStorage.removeItem('userId')
}

// ==================== API Calls ====================
async function apiCall(endpoint, options = {}) {
  const userId = getUserId()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (userId) {
    headers['x-user-id'] = userId
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Une erreur est survenue')
  }

  return data
}

// Auth
async function register(email, password, name) {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
}

async function login(email, password) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// Decks
async function getDecks() {
  return apiCall('/decks')
}

async function createDeck(name, description) {
  return apiCall('/decks', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  })
}

async function deleteDeck(deckId) {
  return apiCall(`/decks/${deckId}`, { method: 'DELETE' })
}

// Cards
async function searchCards(query) {
  return apiCall(`/cards?q=${encodeURIComponent(query)}`)
}

async function addCardToDeck(deckId, cardId, quantity = 1) {
  return apiCall(`/decks/${deckId}/cards`, {
    method: 'POST',
    body: JSON.stringify({ cardId, quantity }),
  })
}

async function removeCardFromDeck(deckId, cardId) {
  return apiCall(`/decks/${deckId}/cards/${cardId}`, { method: 'DELETE' })
}

// ==================== UI Helpers ====================
function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div')
  alertDiv.className = `alert alert-${type}`
  alertDiv.textContent = message
  alertDiv.style.position = 'fixed'
  alertDiv.style.top = '20px'
  alertDiv.style.right = '20px'
  alertDiv.style.zIndex = '9999'
  document.body.appendChild(alertDiv)
  setTimeout(() => alertDiv.remove(), 4000)
}

// ==================== Auth Page ====================
function initAuthPage() {
  const user = getUser()
  if (user) {
    showDashboard()
    return
  }

  document.getElementById('auth-page').classList.toggle('hidden', false)
  document.getElementById('dashboard-page').classList.toggle('dashboard', false)
}

function switchToRegister() {
  document.getElementById('auth-title').textContent = 'Créer un compte'
  document.getElementById('auth-name').classList.remove('hidden')
  document.getElementById('auth-form').dataset.mode = 'register'
  document.getElementById('auth-toggle').innerHTML = 'Vous avez déjà un compte? <a onclick="switchToLogin()">Connectez-vous</a>'
}

function switchToLogin() {
  document.getElementById('auth-title').textContent = 'Connexion'
  document.getElementById('auth-name').classList.add('hidden')
  document.getElementById('auth-form').dataset.mode = 'login'
  document.getElementById('auth-toggle').innerHTML = 'Pas encore de compte? <a onclick="switchToRegister()">Inscrivez-vous</a>'
}

async function handleAuth(e) {
  e.preventDefault()

  const mode = document.getElementById('auth-form').dataset.mode
  const email = document.getElementById('auth-email').value
  const password = document.getElementById('auth-password').value
  const name = document.getElementById('auth-name-input')?.value

  try {
    let result
    if (mode === 'register') {
      result = await register(email, password, name)
    } else {
      result = await login(email, password)
    }

    setUser(result.user, result.user.id)
    showAlert(mode === 'register' ? 'Inscription réussie!' : 'Connexion réussie!', 'success')
    setTimeout(() => showDashboard(), 500)
  } catch (error) {
    showAlert(error.message, 'error')
  }
}

// ==================== Dashboard ====================
async function showDashboard() {
  document.getElementById('auth-page').classList.add('hidden')
  document.getElementById('edit-deck-page').classList.add('hidden')
  document.getElementById('edit-deck-page').classList.remove('active')
  document.getElementById('dashboard-page').classList.remove('hidden')
  document.getElementById('dashboard-page').classList.add('active')

  const user = getUser()
  document.getElementById('user-email').textContent = user.email

  await loadDecks()

  document.getElementById('searchInput').addEventListener('input', applyFilters)
}

async function loadDecks() {
  try {
    allDecks = await getDecks()
    filteredDecks = [...allDecks]
    renderDecks()
  } catch (error) {
    showAlert(error.message, 'error')
  }
}

function renderDecks() {
  const powerSections = document.getElementById('powerSections')
  powerSections.innerHTML = ''

  if (filteredDecks.length === 0) {
    powerSections.innerHTML = '<div class="empty-state">Aucun deck trouvé. Créez un nouveau deck!</div>'
    updateStats()
    return
  }

  // Group by date (simplified - just show all decks)
  const section = document.createElement('div')
  section.className = 'power-section'

  const header = document.createElement('div')
  header.className = 'power-header'
  header.innerHTML = `
    <span>🎴 Vos Decks</span>
    <span class="deck-count">${filteredDecks.length} deck${filteredDecks.length > 1 ? 's' : ''}</span>
  `

  const grid = document.createElement('div')
  grid.className = 'decks-grid'

  filteredDecks.forEach(deck => {
    const card = document.createElement('div')
    card.className = 'deck-card'
    card.innerHTML = `
      <div style="margin-bottom: 10px;">
        <span class="player-badge">📅 ${new Date(deck.createdAt).toLocaleDateString('fr-FR')}</span>
      </div>
      <div class="deck-name">${deck.name}</div>
      <div class="deck-commander">${deck.description || 'Sans description'}</div>
      <div class="power-badge">🎴 ${deck.cards?.length || 0} cartes</div>
      <div class="deck-info" style="margin: 10px 0;">
        <div class="info-item">
          <span class="info-label">Commandant:</span>
          <span class="info-value">--</span>
        </div>
      </div>
      <div class="links">
        <button class="link-btn" onclick="event.stopPropagation(); editDeck('${deck.id}')">✏️ Éditer</button>
        <button class="link-btn" onclick="event.stopPropagation(); removeDeck('${deck.id}')">🗑️ Supprimer</button>
      </div>
    `
    grid.appendChild(card)
  })

  section.appendChild(header)
  section.appendChild(grid)
  powerSections.appendChild(section)

  updateStats()
}

function updateStats() {
  document.getElementById('totalDecks').textContent = filteredDecks.length
  
  const totalCards = filteredDecks.reduce((sum, d) => sum + (d.cards?.length || 0), 0)
  document.getElementById('totalCards').textContent = totalCards

  const avgCards = filteredDecks.length > 0 ? (totalCards / filteredDecks.length).toFixed(1) : '0'
  document.getElementById('avgCards').textContent = avgCards

  const now = new Date()
  const lastDeck = allDecks[allDecks.length - 1]
  if (lastDeck) {
    const lastDate = new Date(lastDeck.createdAt)
    const diff = Math.floor((now - lastDate) / (1000 * 60))
    if (diff < 60) {
      document.getElementById('lastUpdate').textContent = `${diff}m`
    } else {
      document.getElementById('lastUpdate').textContent = lastDate.toLocaleDateString('fr-FR')
    }
  }
}

function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase()
  filteredDecks = allDecks.filter(deck => {
    return deck.name.toLowerCase().includes(searchTerm) || 
           (deck.description && deck.description.toLowerCase().includes(searchTerm))
  })
  renderDecks()
}

function resetFilters() {
  document.getElementById('searchInput').value = ''
  filteredDecks = [...allDecks]
  renderDecks()
}

// ==================== Add Deck Modal ====================
function openAddDeckModal() {
  document.getElementById('addDeckModal').classList.add('active')
}

function closeAddDeckModal() {
  document.getElementById('addDeckModal').classList.remove('active')
  document.getElementById('addDeckForm').reset()
}

async function handleAddDeck(e) {
  e.preventDefault()

  const name = document.getElementById('deckName').value
  const description = document.getElementById('deckDescription').value

  try {
    showAlert('Création du deck...', 'info')
    const newDeck = await createDeck(name, description)
    
    // Ajouter le deck localement sans recharger tous les decks
    allDecks.push(newDeck)
    filteredDecks = [...allDecks]
    renderDecks()
    
    showAlert('Deck créé!', 'success')
    closeAddDeckModal()
    document.getElementById('deckName').value = ''
    document.getElementById('deckDescription').value = ''
  } catch (error) {
    showAlert(error.message, 'error')
  }
}

async function removeDeck(deckId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce deck?')) return

  try {
    await deleteDeck(deckId)
    
    // Supprimer le deck localement sans recharger
    allDecks = allDecks.filter(d => d.id !== deckId)
    filteredDecks = filteredDecks.filter(d => d.id !== deckId)
    renderDecks()
    
    showAlert('Deck supprimé!', 'success')
  } catch (error) {
    showAlert(error.message, 'error')
  }
}

function editDeck(deckId) {
  const deck = allDecks.find(d => d.id === deckId)
  if (!deck) {
    showAlert('Deck non trouvé', 'error')
    return
  }

  currentDeck = deck
  document.getElementById('auth-page').classList.add('hidden')
  document.getElementById('dashboard-page').classList.add('hidden')
  document.getElementById('edit-deck-page').classList.remove('hidden')
  document.getElementById('edit-deck-page').classList.add('active')

  document.getElementById('edit-deck-title').textContent = deck.name
  document.getElementById('edit-deck-desc').textContent = deck.description || 'Sans description'
  document.getElementById('edit-cards-count').textContent = deck.cards?.length || 0
  document.getElementById('edit-search-input').value = ''
  document.getElementById('edit-search-results').innerHTML = ''

  // Initialiser les inputs du mode édition
  document.getElementById('edit-deck-name-input').value = deck.name
  document.getElementById('edit-deck-desc-input').value = deck.description || ''
  document.getElementById('deck-view-mode').style.display = 'block'
  document.getElementById('deck-edit-mode').style.display = 'none'

  renderDeckCards(deck)
}

// ==================== Edit Deck Info ====================
function toggleDeckEditMode(isEditing) {
  document.getElementById('deck-view-mode').style.display = isEditing ? 'none' : 'block'
  document.getElementById('deck-edit-mode').style.display = isEditing ? 'block' : 'none'
}

async function saveDeckChanges() {
  if (!currentDeck) return
  
  const newName = document.getElementById('edit-deck-name-input').value.trim()
  const newDesc = document.getElementById('edit-deck-desc-input').value.trim()

  if (!newName) {
    showAlert('Le nom du deck ne peut pas être vide', 'error')
    return
  }

  try {
    showAlert('Sauvegarde en cours...', 'info')
    
    // Appeler l'API pour mettre à jour le deck
    const response = await fetch(`/api/decks/${currentDeck.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': getUserId(),
      },
      body: JSON.stringify({
        name: newName,
        description: newDesc,
      }),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la sauvegarde')
    }

    const updatedDeck = await response.json()
    currentDeck = updatedDeck
    
    // Mettre à jour l'affichage
    document.getElementById('edit-deck-title').textContent = updatedDeck.name
    document.getElementById('edit-deck-desc').textContent = updatedDeck.description || 'Sans description'
    
    toggleDeckEditMode(false)
    showAlert('✅ Deck sauvegardé!', 'success')
    
    // Mettre à jour dans les décks locaux
    const deckIndex = allDecks.findIndex(d => d.id === updatedDeck.id)
    if (deckIndex >= 0) {
      allDecks[deckIndex] = updatedDeck
      filteredDecks = [...allDecks]
    }
  } catch (error) {
    showAlert(error.message, 'error')
  }
}

function renderDeckCards(deck) {
  const container = document.getElementById('edit-deck-cards')

  if (!deck.cards || deck.cards.length === 0) {
    container.innerHTML = '<p class="text-muted">Aucune carte ajoutée</p>'
    return
  }

  container.innerHTML = deck.cards.map(dc => `
    <div style="display: flex; flex-direction: column; align-items: center; position: relative; cursor: pointer; background: rgba(50, 60, 90, 0.5); border-radius: 6px; padding: 8px; border: 2px solid #00d4ff;">
      ${dc.card.imageUrl ? 
        `<img src="${dc.card.imageUrl}" alt="${dc.card.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">` :
        '<div style="width: 100%; height: 150px; background: #333; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.8em; color: #999; margin-bottom: 8px;">Pas d\'image</div>'
      }
      <div style="font-size: 0.75em; color: #00d4ff; text-align: center; word-break: break-word; margin-bottom: 8px; min-height: 30px;">${dc.card.name}</div>
      <div style="display: flex; gap: 5px; width: 100%; justify-content: center;">
        <button onclick="updateDeckCardQuantity('${dc.id}', ${dc.quantity - 1})" style="flex: 1; padding: 5px; background: #666; border: none; border-radius: 3px; cursor: pointer; color: #fff;">−</button>
        <span style="color: #00d4ff; min-width: 35px; text-align: center; display: flex; align-items: center; justify-content: center; font-weight: bold;">${dc.quantity}x</span>
        <button onclick="updateDeckCardQuantity('${dc.id}', ${dc.quantity + 1})" style="flex: 1; padding: 5px; background: #666; border: none; border-radius: 3px; cursor: pointer; color: #fff;">+</button>
        <button onclick="removeDeckCard('${dc.id}')" style="padding: 5px 8px; background: #dc3545; border: none; border-radius: 3px; cursor: pointer; color: #fff;">🗑️</button>
      </div>
    </div>
  `).join('')
  
  // Changer le grid pour afficher les images correctement
  container.style.display = 'grid'
  container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))'
  container.style.gap = '10px'
}

async function searchDeckCards(e) {
  e.preventDefault()

  const query = document.getElementById('edit-search-input').value

  if (!query.trim()) {
    showAlert('Entrez un nom de carte', 'error')
    return
  }

  try {
    document.getElementById('edit-search-results').innerHTML = '<p class="text-center">Recherche en cours...</p>'
    const cards = await searchCards(query)
    renderSearchResultsForDeck(cards)
  } catch (error) {
    showAlert(error.message, 'error')
    document.getElementById('edit-search-results').innerHTML = ''
  }
}

function renderSearchResultsForDeck(cards) {
  const container = document.getElementById('edit-search-results')

  if (cards.length === 0) {
    container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1;">Aucune carte trouvée</p>'
    return
  }

  container.innerHTML = cards.slice(0, 12).map(card => `
    <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;" onclick="quickAddCardToDeck('${card.id}', '${card.name.replace(/'/g, "\\'")}')">
      ${card.image_uris?.normal ? 
        `<img src="${card.image_uris.normal}" alt="${card.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; border: 2px solid #7c3aed; margin-bottom: 5px;">` :
        '<div style="width: 100%; height: 150px; background: #333; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.8em; color: #999;">Pas d\'image</div>'
      }
      <div style="font-size: 0.75em; color: #00d4ff; text-align: center; word-break: break-word;">${card.name}</div>
    </div>
  `).join('')
}

async function quickAddCardToDeck(cardId, cardName) {
  if (!currentDeck) return

  try {
    await addCardToDeck(currentDeck.id, cardId, 1)
    showAlert(`${cardName} ajoutée!`, 'success')
    
    // Recharger le deck
    const decks = await getDecks()
    const updated = decks.find(d => d.id === currentDeck.id)
    if (updated) {
      currentDeck = updated
      renderDeckCards(updated)
      document.getElementById('edit-cards-count').textContent = updated.cards?.length || 0
    }
  } catch (error) {
    showAlert(error.message, 'error')
  }
}

async function updateDeckCardQuantity(deckCardId, newQuantity) {
  if (newQuantity < 1) {
    removeDeckCard(deckCardId)
    return
  }

  if (!currentDeck) return

  try {
    const deckCard = currentDeck.cards.find(dc => dc.id === deckCardId)
    if (deckCard) {
      const cardId = deckCard.cardId
      await addCardToDeck(currentDeck.id, cardId, newQuantity)
      
      // Recharger
      const decks = await getDecks()
      const updated = decks.find(d => d.id === currentDeck.id)
      if (updated) {
        currentDeck = updated
        renderDeckCards(updated)
      }
    }
  } catch (error) {
    showAlert(error.message, 'error')
  }
}

async function removeDeckCard(deckCardId) {
  if (!currentDeck) return

  if (!confirm('Êtes-vous sûr de vouloir retirer cette carte?')) return

  try {
    const deckCard = currentDeck.cards.find(dc => dc.id === deckCardId)
    if (deckCard) {
      await removeCardFromDeck(currentDeck.id, deckCard.cardId)
      
      // Recharger
      const decks = await getDecks()
      const updated = decks.find(d => d.id === currentDeck.id)
      if (updated) {
        currentDeck = updated
        renderDeckCards(updated)
        document.getElementById('edit-cards-count').textContent = updated.cards?.length || 0
      }
    }
  } catch (error) {
    showAlert(error.message, 'error')
  }
}

// ==================== Import Decklist ====================
function openImportDecklistModal() {
  document.getElementById('importDecklistModal').classList.add('active')
  document.getElementById('decklistInput').value = ''
}

function closeImportDecklistModal() {
  document.getElementById('importDecklistModal').classList.remove('active')
}

// ==================== Import Progress ====================
function openImportProgressModal(total) {
  document.getElementById('importProgressModal').classList.add('active')
  document.getElementById('progressTotal').textContent = total
  document.getElementById('progressCount').textContent = '0'
  document.getElementById('progressFound').textContent = '0'
  document.getElementById('progressSearching').textContent = '0'
  document.getElementById('progressBar').style.width = '0%'
  document.getElementById('progressBar').textContent = '0%'
  document.getElementById('currentCard').textContent = '--'
}

function closeImportProgressModal() {
  document.getElementById('importProgressModal').classList.remove('active')
}

function updateImportProgress(current, total, found, currentCardName) {
  const percentage = Math.floor((current / total) * 100)
  const progressBar = document.getElementById('progressBar')
  
  progressBar.style.width = percentage + '%'
  progressBar.textContent = percentage + '%'
  
  document.getElementById('progressCount').textContent = current
  document.getElementById('progressFound').textContent = found
  document.getElementById('currentCard').textContent = currentCardName
}

async function importDecklist() {
  if (!currentDeck) {
    showAlert('Pas de deck sélectionné', 'error')
    return
  }

  const text = document.getElementById('decklistInput').value.trim()
  if (!text) {
    showAlert('Colle une decklist', 'error')
    return
  }

  // Parsing de la decklist
  const lines = text.split('\n').filter(line => line.trim())
  const cardsToAdd = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    let quantity = 1
    let cardName = trimmed

    const match = trimmed.match(/^(\d+)[xX\s]+(.+)$/i)
    if (match) {
      quantity = parseInt(match[1])
      cardName = match[2].trim()
    }

    if (cardName) {
      cardsToAdd.push({ name: cardName, quantity })
    }
  }

  if (cardsToAdd.length === 0) {
    showAlert('Aucune carte trouvée', 'error')
    return
  }

  // Initialiser le modal de progression
  closeImportDecklistModal()
  openImportProgressModal(cardsToAdd.length)

  let added = 0
  let failed = 0
  const cardsToImport = []

  // Phase 1: Chercher toutes les cartes sur Scryfall avec délai respectueux
  for (let i = 0; i < cardsToAdd.length; i++) {
    const cardData = cardsToAdd[i]
    updateImportProgress(i, cardsToAdd.length, added, cardData.name)
    
    // Délai pour respecter le rate limit de Scryfall
    await new Promise(resolve => setTimeout(resolve, 600))
    
    try {
      const response = await fetch(`/api/cards?q=${encodeURIComponent(cardData.name)}`)
      const result = await response.json()
      
      const cards = Array.isArray(result) ? result : result.data || []

      if (cards.length > 0) {
        const card = cards[0]
        cardsToImport.push({ card, quantity: cardData.quantity, name: cardData.name })
        added++
      } else {
        failed++
      }
    } catch (error) {
      failed++
    }
  }

  // Phase 2: Ajouter toutes les cartes trouvées
  updateImportProgress(cardsToAdd.length, cardsToAdd.length, added, 'Ajout des cartes...')

  let addedCount = 0
  const addPromises = cardsToImport.map(item =>
    addCardToDeck(currentDeck.id, item.card.id, item.quantity)
      .then(() => {
        addedCount++
      })
      .catch(err => {
        console.error(`Erreur ajout:`, err)
      })
  )

  await Promise.all(addPromises)

  closeImportProgressModal()
  showAlert(`✅ Importé: ${addedCount}/${cardsToAdd.length} cartes trouvées | ❌ Non trouvées: ${failed}`, 'success')

  // Recharger le deck
  const decks = await getDecks()
  const updated = decks.find(d => d.id === currentDeck.id)
  if (updated) {
    currentDeck = updated
    renderDeckCards(updated)
    document.getElementById('edit-cards-count').textContent = updated.cards?.length || 0
  }
}

// ==================== Logout ====================
function logout() {
  clearUser()
  document.getElementById('auth-page').classList.remove('hidden')
  document.getElementById('dashboard-page').classList.remove('active')
  switchToLogin()
}

// ==================== Modal Close ====================
document.addEventListener('click', (e) => {
  if (e.target.id === 'addDeckModal') {
    closeAddDeckModal()
  }
  if (e.target.id === 'importDecklistModal') {
    closeImportDecklistModal()
  }
  if (e.target.id === 'importProgressModal') {
    // Ne pas fermer le modal de progression pendant l'import
  }
})

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
  initAuthPage()
  switchToLogin()
})
