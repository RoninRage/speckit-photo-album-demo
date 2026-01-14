/**
 * AlbumList Component Tests
 */
import { AlbumList } from '../../src/components/AlbumList.js'
import { Album } from '../../src/models/Album.js'

describe('AlbumList', () => {
  let component
  let container

  beforeEach(() => {
    // Create a container for the component
    container = document.createElement('div')
    container.id = 'app-main'
    document.body.appendChild(container)

    component = new AlbumList()
  })

  afterEach(() => {
    component.destroy()
    document.body.removeChild(container)
  })

  describe('render', () => {
    it('should render empty state when no albums', () => {
      component.render([], container)

      const emptyState = container.querySelector('.empty-state')
      expect(emptyState).toBeTruthy()
      expect(emptyState.textContent).toContain('No albums yet')
    })

    it('should render albums in list', () => {
      const albums = [
        new Album('Album 1', 'id-1', Date.now(), 5),
        new Album('Album 2', 'id-2', Date.now(), 3)
      ]

      component.render(albums, container)

      const items = container.querySelectorAll('.album-item')
      expect(items.length).toBe(2)
    })

    it('should display album information', () => {
      const album = new Album('My Photos', 'id-1', Date.now(), 10)
      component.render([album], container)

      const name = container.querySelector('.album-name')
      const count = container.querySelector('.album-count')

      expect(name.textContent).toContain('My Photos')
      expect(count.textContent).toContain('10 photos')
    })

    it('should have create button', () => {
      component.render([], container)

      const createBtn = container.querySelector('#create-album-btn')
      expect(createBtn).toBeTruthy()
      expect(createBtn.textContent).toContain('New Album')
    })

    it('should have create form (hidden)', () => {
      component.render([], container)

      const form = container.querySelector('#album-form')
      const container_ = container.querySelector('#album-form-container')

      expect(form).toBeTruthy()
      expect(container_.classList.contains('hidden')).toBe(true)
    })
  })

  describe('addAlbum', () => {
    it('should add album to list', () => {
      component.render([], container)

      const album = new Album('New Album')
      component.addAlbum(album)

      const items = container.querySelectorAll('.album-item')
      expect(items.length).toBe(1)
    })

    it('should add album at beginning (newest first)', () => {
      const album1 = new Album('Album 1', 'id-1')
      component.render([album1], container)

      const album2 = new Album('Album 2', 'id-2')
      component.addAlbum(album2)

      const names = container.querySelectorAll('.album-name')
      expect(names[0].textContent).toContain('Album 2')
      expect(names[1].textContent).toContain('Album 1')
    })
  })

  describe('removeAlbum', () => {
    it('should remove album from list', () => {
      const albums = [
        new Album('Album 1', 'id-1'),
        new Album('Album 2', 'id-2')
      ]
      component.render(albums, container)

      component.removeAlbum('id-1')

      const names = container.querySelectorAll('.album-name')
      expect(names.length).toBe(1)
      expect(names[0].textContent).toContain('Album 2')
    })

    it('should show empty state when last album removed', () => {
      const album = new Album('Album 1', 'id-1')
      component.render([album], container)

      component.removeAlbum('id-1')

      const emptyState = container.querySelector('.empty-state')
      expect(emptyState).toBeTruthy()
    })
  })

  describe('updateAlbum', () => {
    it('should update album photo count', () => {
      const album = new Album('Album', 'id-1', Date.now(), 5)
      component.render([album], container)

      album.photoCount = 10
      component.updateAlbum(album)

      const count = container.querySelector('.album-count')
      expect(count.textContent).toContain('10 photos')
    })
  })

  describe('event listeners', () => {
    it('should call onAlbumSelected when album clicked', async () => {
      const album = new Album('Album', 'id-1')
      component.render([album], container)

      const selectedAlbumId = null
      component.onAlbumSelected((id) => {
        selectedAlbumId = id
      })

      const card = container.querySelector('.album-card')
      card.click()

      expect(selectedAlbumId).toBe('id-1')
    })
  })

  describe('form validation', () => {
    it('should reject empty album name', () => {
      component.render([], container)

      const input = container.querySelector('#album-name-input')
      const form = container.querySelector('#album-form')

      input.value = ''
      const event = new Event('submit')
      event.preventDefault()
      form.dispatchEvent(event)

      const error = form.querySelector('.form-error')
      expect(error.classList.contains('hidden')).toBe(false)
    })

    it('should update character counter', () => {
      component.render([], container)

      const input = container.querySelector('#album-name-input')
      input.value = 'Test'

      const event = new Event('input')
      input.dispatchEvent(event)

      const counter = container.querySelector('.form-counter')
      expect(counter.textContent).toContain('4 /') // 4 characters
    })
  })
})
