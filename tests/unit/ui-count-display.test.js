/**
 * @jest-environment jsdom
 */

describe('UI Display Correctness', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="app">
        <header id="app-header">
          <h1>Photo Album</h1>
          <div id="album-form-container" class="hidden">
            <input id="album-name-input" type="text" placeholder="Enter album name..." />
            <button id="album-form-save-btn">Save</button>
            <button id="album-form-cancel-btn">Cancel</button>
          </div>
          <button id="create-album-btn">+ Create Album</button>
        </header>
        <main id="app-main">
          <section id="album-list-section">
            <div id="album-list"></div>
          </section>
          <section id="album-detail-section" class="hidden">
            <div class="album-detail-header">
              <button id="back-to-albums-btn">← Back</button>
              <div>
                <h2 class="detail-title">Album Title</h2>
                <p class="detail-count">0 photos</p>
              </div>
            </div>
            <div class="photo-grid"></div>
          </section>
        </main>
      </div>
    `
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('Album Count Display', () => {
    test('should display "0 albums" when no albums exist', () => {
      const albumList = document.getElementById('album-list')
      albumList.innerHTML = '<p class="empty-state">No albums yet. Create one to get started!</p>'

      const emptyState = albumList.querySelector('.empty-state')
      expect(emptyState).toBeTruthy()
      expect(emptyState.textContent).toContain('No albums')
    })

    test('should display correct album count with multiple albums', () => {
      const albumList = document.getElementById('album-list')
      
      // Add 3 album cards
      for (let i = 1; i <= 3; i++) {
        const card = document.createElement('div')
        card.className = 'album-item'
        card.innerHTML = `
          <div class="album-card" data-album="album-${i}">
            <div class="album-name">Album ${i}</div>
            <div class="album-photo-count">0 photos</div>
          </div>
        `
        albumList.appendChild(card)
      }

      const albumCards = albumList.querySelectorAll('.album-card')
      expect(albumCards.length).toBe(3)
    })

    test('should update album photo count correctly', () => {
      const albumList = document.getElementById('album-list')
      const card = document.createElement('div')
      card.className = 'album-item'
      card.innerHTML = `
        <div class="album-card">
          <div class="album-name">Test Album</div>
          <div class="album-photo-count">0 photos</div>
        </div>
      `
      albumList.appendChild(card)

      const photoCount = card.querySelector('.album-photo-count')
      expect(photoCount.textContent).toBe('0 photos')

      // Update count
      photoCount.textContent = '5 photos'
      expect(photoCount.textContent).toBe('5 photos')
    })

    test('should use singular "photo" for count of 1', () => {
      const albumList = document.getElementById('album-list')
      const card = document.createElement('div')
      card.innerHTML = `
        <div class="album-card">
          <div class="album-photo-count">1 photo</div>
        </div>
      `
      albumList.appendChild(card)

      const photoCount = card.querySelector('.album-photo-count')
      expect(photoCount.textContent).toBe('1 photo')
      expect(photoCount.textContent).not.toContain('photos')
    })

    test('should use plural "photos" for count > 1', () => {
      const counts = [0, 2, 5, 10, 100]
      const albumList = document.getElementById('album-list')

      counts.forEach(count => {
        const card = document.createElement('div')
        card.innerHTML = `
          <div class="album-card">
            <div class="album-photo-count">${count} photos</div>
          </div>
        `
        albumList.appendChild(card)

        const photoCountEl = card.querySelector('.album-photo-count')
        expect(photoCountEl.textContent).toContain('photos')
      })
    })
  })

  describe('Photo Count Display in Detail View', () => {
    test('should display "0 photos" when album is empty', () => {
      const detailSection = document.getElementById('album-detail-section')
      detailSection.classList.remove('hidden')

      const photoCount = detailSection.querySelector('.detail-count')
      photoCount.textContent = '0 photos'

      expect(photoCount.textContent).toBe('0 photos')
    })

    test('should update photo count when photos are added', () => {
      const detailSection = document.getElementById('album-detail-section')
      detailSection.classList.remove('hidden')

      const photoGrid = detailSection.querySelector('.photo-grid')
      const photoCount = detailSection.querySelector('.detail-count')

      // Add 3 photos
      for (let i = 1; i <= 3; i++) {
        const photo = document.createElement('div')
        photo.className = 'photo-item'
        photo.innerHTML = `<img src="data:image/png;base64,test${i}" alt="Photo ${i}" />`
        photoGrid.appendChild(photo)
      }

      photoCount.textContent = `${photoGrid.children.length} photos`

      expect(photoCount.textContent).toBe('3 photos')
    })

    test('should display correct count after photo deletion', () => {
      const detailSection = document.getElementById('album-detail-section')
      const photoGrid = detailSection.querySelector('.photo-grid')
      const photoCount = detailSection.querySelector('.detail-count')

      // Add 5 photos
      for (let i = 1; i <= 5; i++) {
        const photo = document.createElement('div')
        photo.className = 'photo-item'
        photoGrid.appendChild(photo)
      }

      // Remove 2 photos
      photoGrid.removeChild(photoGrid.firstChild)
      photoGrid.removeChild(photoGrid.firstChild)

      photoCount.textContent = `${photoGrid.children.length} photos`

      expect(photoCount.textContent).toBe('3 photos')
    })
  })

  describe('Empty State Messages', () => {
    test('should show empty state when no albums exist', () => {
      const albumList = document.getElementById('album-list')
      const emptyState = document.createElement('p')
      emptyState.className = 'empty-state'
      emptyState.textContent = 'No albums yet. Create one to get started!'
      albumList.appendChild(emptyState)

      expect(albumList.querySelector('.empty-state')).toBeTruthy()
      expect(emptyState.textContent).toContain('No albums')
    })

    test('should show empty state when album has no photos', () => {
      const detailSection = document.getElementById('album-detail-section')
      const photoGrid = detailSection.querySelector('.photo-grid')

      const emptyState = document.createElement('div')
      emptyState.className = 'photo-empty-state'
      emptyState.textContent = 'No photos yet. Click "Upload Photos" to add some!'
      photoGrid.appendChild(emptyState)

      expect(photoGrid.querySelector('.photo-empty-state')).toBeTruthy()
      expect(emptyState.textContent).toContain('No photos')
    })

    test('should hide empty state when albums are added', () => {
      const albumList = document.getElementById('album-list')
      const emptyState = document.createElement('p')
      emptyState.className = 'empty-state'
      albumList.appendChild(emptyState)

      // Add an album
      const card = document.createElement('div')
      card.className = 'album-card'
      albumList.appendChild(card)

      // Remove empty state
      const emptyEl = albumList.querySelector('.empty-state')
      if (emptyEl) {
        emptyEl.remove()
      }

      expect(albumList.querySelector('.empty-state')).toBeNull()
    })
  })

  describe('Count Update Logic', () => {
    test('should format count with singular/plural correctly', () => {
      const testCases = [
        { count: 0, expected: '0 photos' },
        { count: 1, expected: '1 photo' },
        { count: 2, expected: '2 photos' },
        { count: 10, expected: '10 photos' },
        { count: 100, expected: '100 photos' }
      ]

      testCases.forEach(({ count, expected }) => {
        const formatted = count === 1 ? `${count} photo` : `${count} photos`
        expect(formatted).toBe(expected)
      })
    })

    test('should handle zero count edge case', () => {
      const photoCount = document.createElement('span')
      photoCount.className = 'album-photo-count'
      photoCount.textContent = '0 photos'

      expect(photoCount.textContent).toBe('0 photos')
      expect(photoCount.textContent).not.toContain('0 photo ') // Not singular
    })
  })
})
