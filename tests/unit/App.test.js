/**
 * App Controller Tests
 */
import { App } from '../../src/App.js'
import { Album } from '../../src/models/Album.js'
import { StorageService } from '../../src/services/StorageService.js'

// Mock the DOM structure
function createMockDOM() {
  const app = document.createElement('div')
  app.id = 'app'

  const header = document.createElement('header')
  header.id = 'app-header'
  header.innerHTML = '<h1>Photo Album</h1>'

  const main = document.createElement('main')
  main.id = 'app-main'

  app.appendChild(header)
  app.appendChild(main)
  document.body.appendChild(app)

  return app
}

describe('App Controller', () => {
  let appInstance
  let mockDOM

  beforeEach(async () => {
    mockDOM = createMockDOM()
    appInstance = new App()
    await appInstance.init()
  })

  afterEach(async () => {
    if (appInstance) {
      appInstance.destroy?.()
    }
    if (mockDOM) {
      document.body.removeChild(mockDOM)
    }
    await StorageService.clear()
  })

  describe('initialization', () => {
    it('should initialize without errors', async () => {
      expect(appInstance).toBeTruthy()
    })

    it('should load albums on init', async () => {
      const album = new Album('Test Album')
      await StorageService.createAlbum(album)

      const newApp = new App()
      await newApp.init()

      // App should have loaded the album
      expect(newApp.albums.length).toBeGreaterThan(0)
      newApp.destroy?.()
    })

    it('should render albums view on init', async () => {
      const main = document.querySelector('#app-main')
      expect(main.innerHTML).not.toBe('')
    })
  })

  describe('album operations', () => {
    it('should create album', async () => {
      const beforeCount = appInstance.albums.length
      await appInstance.createAlbum('New Album')

      expect(appInstance.albums.length).toBe(beforeCount + 1)
    })

    it('should validate album name', async () => {
      const result = await appInstance.createAlbum('')
      // Should return false or throw for empty name
      expect(result === false || !result).toBeTruthy()
    })

    it('should reject album name exceeding max length', async () => {
      const longName = 'a'.repeat(300)
      const result = await appInstance.createAlbum(longName)

      expect(result === false || !result).toBeTruthy()
    })

    it('should load albums from storage', async () => {
      const album = new Album('Stored Album')
      await StorageService.createAlbum(album)

      await appInstance.loadAlbums()

      expect(appInstance.albums.length).toBeGreaterThan(0)
      expect(appInstance.albums[0].name).toContain('Album')
    })
  })

  describe('album selection', () => {
    it('should switch to detail view on album select', async () => {
      const album = new Album('Test Album')
      appInstance.albums.push(album)

      await appInstance.selectAlbum(album.id)

      expect(appInstance.currentView).toBe('detail')
      expect(appInstance.selectedAlbumId).toBe(album.id)
    })

    it('should load photos when album selected', async () => {
      const album = new Album('Test Album')
      await StorageService.createAlbum(album)
      appInstance.albums.push(album)

      await appInstance.selectAlbum(album.id)

      expect(appInstance.photos[album.id]).toBeDefined()
      expect(Array.isArray(appInstance.photos[album.id])).toBe(true)
    })

    it('should update currentView to album detail', async () => {
      expect(appInstance.currentView).toBe('albums')

      const album = new Album('Test')
      appInstance.albums.push(album)

      await appInstance.selectAlbum(album.id)

      expect(appInstance.currentView).toBe('detail')
    })
  })

  describe('delete album', () => {
    it('should delete album from storage and state', async () => {
      const album = new Album('To Delete')
      await StorageService.createAlbum(album)
      appInstance.albums.push(album)

      const beforeCount = appInstance.albums.length

      await appInstance.deleteAlbum(album.id)

      expect(appInstance.albums.length).toBe(beforeCount - 1)
    })

    it('should remove album from albums array', async () => {
      const album = new Album('Album1', 'id-1')
      appInstance.albums.push(album)

      await appInstance.deleteAlbum('id-1')

      const found = appInstance.albums.find(a => a.id === 'id-1')
      expect(found).toBeFalsy()
    })
  })

  describe('photo operations', () => {
    it('should upload photos', async () => {
      const album = new Album('Test')
      await StorageService.createAlbum(album)
      appInstance.albums.push(album)

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      await appInstance.uploadPhotos(album.id, [file])

      const photos = appInstance.photos[album.id]
      expect(photos.length).toBeGreaterThan(0)
    })

    it('should load photos from storage', async () => {
      const album = new Album('Test')
      await StorageService.createAlbum(album)

      // Create a photo
      const { Photo } = await import('../../src/models/Photo.js')
      const photo = new Photo('Test Photo', album.id, 'data:image/jpeg;base64,/9j/')
      await StorageService.createPhoto(photo)

      appInstance.albums.push(album)
      await appInstance.loadPhotos(album.id)

      expect(appInstance.photos[album.id].length).toBeGreaterThan(0)
    })
  })

  describe('state management', () => {
    it('should track current view', async () => {
      expect(appInstance.currentView).toBe('albums')

      const album = new Album('Test')
      appInstance.albums.push(album)
      await appInstance.selectAlbum(album.id)

      expect(appInstance.currentView).toBe('detail')
    })

    it('should track selected album', async () => {
      const album = new Album('Test', 'id-123')
      appInstance.albums.push(album)

      await appInstance.selectAlbum('id-123')

      expect(appInstance.selectedAlbumId).toBe('id-123')
    })

    it('should track photos per album', async () => {
      const album = new Album('Album1', 'id-1')
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      appInstance.albums.push(album)
      await appInstance.uploadPhotos(album.id, [file])

      expect(appInstance.photos[album.id]).toBeDefined()
      expect(appInstance.photos[album.id].length).toBeGreaterThan(0)
    })
  })

  describe('error handling', () => {
    it('should handle invalid album names gracefully', async () => {
      const result = await appInstance.createAlbum(null)
      expect(result === false || !result).toBeTruthy()
    })

    it('should handle storage errors gracefully', async () => {
      // Attempt invalid operation
      const result = await appInstance.deleteAlbum('non-existent-id')
      // Should not throw, should handle gracefully
      expect(true).toBe(true)
    })
  })

  describe('view switching', () => {
    it('should render albums view', async () => {
      await appInstance.renderAlbumListView()

      const main = document.querySelector('#app-main')
      expect(main.innerHTML).not.toBe('')
    })

    it('should render detail view when album selected', async () => {
      const album = new Album('Test')
      appInstance.albums.push(album)

      await appInstance.renderAlbumDetailView(album.id)

      const main = document.querySelector('#app-main')
      expect(main.textContent).toContain('Test')
    })

    it('should return to album list on back', async () => {
      const album = new Album('Test')
      appInstance.albums.push(album)

      // Select album (go to detail)
      await appInstance.selectAlbum(album.id)
      expect(appInstance.currentView).toBe('detail')

      // Go back to album list
      await appInstance.renderAlbumListView()
      expect(appInstance.currentView).toBe('albums')
    })
  })
})
