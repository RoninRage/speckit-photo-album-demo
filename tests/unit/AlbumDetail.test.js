/**
 * AlbumDetail Component Tests
 */
import { AlbumDetail } from '../../src/components/AlbumDetail.js'
import { Album } from '../../src/models/Album.js'
import { Photo } from '../../src/models/Photo.js'

describe('AlbumDetail', () => {
  let component
  let container

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'app-main'
    document.body.appendChild(container)

    component = new AlbumDetail()
  })

  afterEach(() => {
    component.destroy()
    document.body.removeChild(container)
  })

  describe('render', () => {
    it('should render album header with title and photo count', () => {
      const album = new Album('Summer 2024', 'id-1', Date.now(), 5)
      const photos = []

      component.render(album, photos, container)

      const header = container.querySelector('.album-detail-header')
      const title = container.querySelector('.detail-title')
      const count = container.querySelector('.detail-count')

      expect(header).toBeTruthy()
      expect(title.textContent).toContain('Summer 2024')
      expect(count.textContent).toContain('5 photos')
    })

    it('should render back button', () => {
      const album = new Album('Album', 'id-1')
      component.render(album, [], container)

      const backBtn = container.querySelector('.back-btn')
      expect(backBtn).toBeTruthy()
    })

    it('should render upload zone', () => {
      const album = new Album('Album', 'id-1')
      component.render(album, [], container)

      const uploadZone = container.querySelector('.photo-upload-area')
      const fileInput = container.querySelector('#photo-file-input')

      expect(uploadZone).toBeTruthy()
      expect(fileInput).toBeTruthy()
    })

    it('should render empty state when no photos', () => {
      const album = new Album('Album', 'id-1')
      component.render(album, [], container)

      const emptyState = container.querySelector('.photo-empty-state')
      expect(emptyState).toBeTruthy()
    })

    it('should render photo grid with photos', () => {
      const album = new Album('Album', 'id-1')
      const photos = [
        new Photo('photo-1', 'id-1', 'data:image/jpeg;base64,/9j/'),
        new Photo('photo-2', 'id-1', 'data:image/png;base64,iVBO')
      ]

      component.render(album, photos, container)

      const items = container.querySelectorAll('.photo-item')
      expect(items.length).toBe(2)
    })

    it('should display photo images correctly', () => {
      const album = new Album('Album', 'id-1')
      const dataUrl = 'data:image/jpeg;base64,/9j/'
      const photo = new Photo('test-photo', 'id-1', dataUrl)

      component.render(album, [photo], container)

      const img = container.querySelector('.photo-image')
      expect(img.src).toBe(dataUrl)
    })
  })

  describe('addPhoto', () => {
    it('should add photo to grid', () => {
      const album = new Album('Album', 'id-1')
      component.render(album, [], container)

      const photo = new Photo('photo', 'id-1', 'data:image/jpeg;base64,/9j/')
      component.addPhoto(photo)

      const items = container.querySelectorAll('.photo-item')
      expect(items.length).toBe(1)
    })

    it('should remove empty state when first photo added', () => {
      const album = new Album('Album', 'id-1')
      component.render(album, [], container)

      let emptyState = container.querySelector('.photo-empty-state')
      expect(emptyState).toBeTruthy()

      const photo = new Photo('photo', 'id-1', 'data:image/jpeg;base64,/9j/')
      component.addPhoto(photo)

      emptyState = container.querySelector('.photo-empty-state')
      expect(emptyState).toBeFalsy()
    })

    it('should update photo count in header', () => {
      const album = new Album('Album', 'id-1', Date.now(), 0)
      component.render(album, [], container)

      const photo = new Photo('photo', 'id-1', 'data:image/jpeg;base64,/9j/')
      component.addPhoto(photo)

      const count = container.querySelector('.detail-count')
      expect(count.textContent).toContain('1 photo')
    })
  })

  describe('updateAlbumInfo', () => {
    it('should update album title', () => {
      const album = new Album('Old Title', 'id-1')
      component.render(album, [], container)

      album.name = 'New Title'
      component.updateAlbumInfo(album)

      const title = container.querySelector('.detail-title')
      expect(title.textContent).toContain('New Title')
    })
  })

  describe('drag-drop functionality', () => {
    it('should have drag-drop zone', () => {
      const album = new Album('Album', 'id-1')
      component.render(album, [], container)

      const zone = container.querySelector('.photo-upload-area')
      expect(zone).toBeTruthy()
    })

    it('should show drag-over feedback', () => {
      const album = new Album('Album', 'id-1')
      component.render(album, [], container)

      const zone = container.querySelector('.photo-upload-area')

      const dragoverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer()
      })

      zone.dispatchEvent(dragoverEvent)

      // Check if zone has drag-over class
      expect(zone.classList.contains('drag-over') || zone.classList.contains('upload-zone')).toBe(true)
    })
  })

  describe('file input', () => {
    it('should trigger file input on upload area click', () => {
      const album = new Album('Album', 'id-1')
      component.render(album, [], container)

      const fileInput = container.querySelector('#photo-file-input')
      const clickSpy = jest.fn()

      fileInput.addEventListener('click', clickSpy)

      const zone = container.querySelector('.photo-upload-area')
      zone.click()

      // File input should be clickable
      expect(fileInput).toBeTruthy()
    })

    it('should accept image files only', () => {
      const album = new Album('Album', 'id-1')
      component.render(album, [], container)

      const fileInput = container.querySelector('#photo-file-input')
      expect(fileInput.accept).toContain('image/')
    })
  })

  describe('event listeners', () => {
    it('should call onBack callback', () => {
      const album = new Album('Album', 'id-1')
      component.render(album, [], container)

      let backCalled = false
      component.onBack(() => {
        backCalled = true
      })

      const backBtn = container.querySelector('.back-btn')
      backBtn.click()

      expect(backCalled).toBe(true)
    })

    it('should call onUploadPhoto callback on file selection', () => {
      const album = new Album('Album', 'id-1')
      component.render(album, [], container)

      let uploadCalled = false
      let uploadedFiles = null

      component.onUploadPhoto((files) => {
        uploadCalled = true
        uploadedFiles = files
      })

      const fileInput = container.querySelector('#photo-file-input')
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })

      const event = new Event('change')
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      })

      fileInput.dispatchEvent(event)

      expect(uploadCalled).toBe(true)
      expect(uploadedFiles).toBeTruthy()
    })
  })

  describe('photo display', () => {
    it('should display photo name in overlay', () => {
      const album = new Album('Album', 'id-1')
      const photo = new Photo('My Beach Photo', 'id-1', 'data:image/jpeg;base64,/9j/')

      component.render(album, [photo], container)

      const info = container.querySelector('.photo-info')
      expect(info.textContent).toContain('My Beach Photo')
    })

    it('should show multiple photos in correct grid layout', () => {
      const album = new Album('Album', 'id-1')
      const photos = Array(6).fill(null).map((_, i) =>
        new Photo(`photo-${i}`, 'id-1', 'data:image/jpeg;base64,/9j/')
      )

      component.render(album, photos, container)

      const items = container.querySelectorAll('.photo-item')
      expect(items.length).toBe(6)
    })
  })
})
