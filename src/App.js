/**
 * App Controller
 * Manages application state and coordinates between components and services
 */
import { AlbumList } from './components/AlbumList.js'
import { AlbumDetail } from './components/AlbumDetail.js'
import { storageService } from './services/StorageService.js'
import { FileService } from './services/FileService.js'
import { Toast } from './components/Toast.js'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from './utils/constants.js'

export class App {
  constructor() {
    this.state = {
      currentView: 'albums', // 'albums' or 'detail'
      selectedAlbumId: null,
      albums: [],
      photos: {}
    }

    this.components = {
      albumList: new AlbumList(),
      albumDetail: new AlbumDetail(),
      toast: new Toast()
    }
  }

  /**
   * Initialize and start the app
   */
  async init() {
    try {
      // Initialize storage
      await storageService.init()

      // Load initial data
      await this.loadAlbums()

      // Render initial view
      this.renderAlbumListView()

      // Setup global error handling
      this.setupErrorHandling()
    } catch (error) {
      console.error('Failed to initialize app:', error)
      this.showError('Failed to initialize application')
    }
  }

  /**
   * Load all albums from storage
   * @private
   */
  async loadAlbums() {
    try {
      this.state.albums = await storageService.getAllAlbums()
    } catch (error) {
      console.error('Failed to load albums:', error)
      throw error
    }
  }

  /**
   * Load photos for an album
   * @private
   * @param {string} albumId - Album ID
   */
  async loadPhotos(albumId) {
    try {
      this.state.photos[albumId] = await storageService.getPhotosByAlbum(albumId)
    } catch (error) {
      console.error('Failed to load photos:', error)
      throw error
    }
  }

  /**
   * Render album list view
   * @private
   */
  renderAlbumListView() {
    this.state.currentView = 'albums'

    // Cleanup previous view
    this.components.albumDetail.destroy()

    // Setup and render album list
    this.components.albumList.render(this.state.albums)

    // Setup listeners
    this.components.albumList.onAlbumSelected((albumId) => {
      this.selectAlbum(albumId)
    })

    this.components.albumList.onCreateAlbum((name) => {
      this.createAlbum(name)
    })

    this.components.albumList.onDeleteAlbum((albumId) => {
      this.deleteAlbum(albumId)
    })
  }

  /**
   * Render album detail view
   * @private
   * @param {string} albumId - Album ID
   */
  async renderAlbumDetailView(albumId) {
    try {
      this.state.currentView = 'detail'
      this.state.selectedAlbumId = albumId

      // Load photos if not already loaded
      if (!this.state.photos[albumId]) {
        await this.loadPhotos(albumId)
      }

      const album = this.state.albums.find(a => a.id === albumId)
      const photos = this.state.photos[albumId] || []

      // Cleanup previous view
      this.components.albumList.destroy()

      // Setup and render album detail
      this.components.albumDetail.render(album, photos)

      // Setup listeners
      this.components.albumDetail.onBack(() => {
        this.renderAlbumListView()
      })

      this.components.albumDetail.onUploadPhoto((files) => {
        this.uploadPhotos(albumId, files)
      })
    } catch (error) {
      console.error('Failed to render album detail:', error)
      this.showError('Failed to load album')
      this.renderAlbumListView()
    }
  }

  /**
   * Select an album and show its detail view
   * @private
   * @param {string} albumId - Album ID
   */
  async selectAlbum(albumId) {
    await this.renderAlbumDetailView(albumId)
  }

  /**
   * Create a new album
   * @private
   * @param {string} name - Album name
   */
  async createAlbum(name) {
    try {
      const album = await storageService.createAlbum(name)
      this.state.albums.unshift(album)
      this.state.photos[album.id] = []

      this.components.albumList.addAlbum(album)
      this.showSuccess(SUCCESS_MESSAGES.ALBUM_CREATED)
    } catch (error) {
      console.error('Failed to create album:', error)
      this.showError(error.message || ERROR_MESSAGES.STORAGE_ERROR)
    }
  }

  /**
   * Delete an album
   * @private
   * @param {string} albumId - Album ID
   */
  async deleteAlbum(albumId) {
    try {
      const album = this.state.albums.find(a => a.id === albumId)
      if (!album) {
        throw new Error(ERROR_MESSAGES.ALBUM_NOT_FOUND)
      }

      await storageService.deleteAlbum(albumId)

      this.state.albums = this.state.albums.filter(a => a.id !== albumId)
      delete this.state.photos[albumId]

      this.components.albumList.removeAlbum(albumId)
      this.showSuccess(SUCCESS_MESSAGES.ALBUM_DELETED)
    } catch (error) {
      console.error('Failed to delete album:', error)
      this.showError(error.message || ERROR_MESSAGES.STORAGE_ERROR)
    }
  }

  /**
   * Upload photos to an album
   * @private
   * @param {string} albumId - Album ID
   * @param {File[]} files - Files to upload
   */
  async uploadPhotos(albumId, files) {
    try {
      // Validate storage space
      const hasSpace = await storageService.hasStorage()
      if (!hasSpace) {
        this.showError(ERROR_MESSAGES.STORAGE_FULL)
        return
      }

      const album = this.state.albums.find(a => a.id === albumId)
      if (!album) {
        throw new Error(ERROR_MESSAGES.ALBUM_NOT_FOUND)
      }

      let successCount = 0
      const errors = []

      for (const file of files) {
        try {
          // Validate file
          FileService.validateFile(file)

          // Read file as data URL
          const dataUrl = await FileService.readAsDataUrl(file)

          // Create photo
          const photo = await storageService.createPhoto(
            albumId,
            FileService.sanitizeFilename(file.name),
            dataUrl,
            file.type
          )

          // Update local state
          if (!this.state.photos[albumId]) {
            this.state.photos[albumId] = []
          }
          this.state.photos[albumId].push(photo)

          // Update album photo count
          album.photoCount++
          await storageService.updateAlbum(album)

          // Update UI
          this.components.albumDetail.addPhoto(photo)
          this.components.albumDetail.updateAlbumInfo(album)

          successCount++
        } catch (error) {
          errors.push(`${file.name}: ${error.message}`)
        }
      }

      // Show results
      if (successCount > 0) {
        this.showSuccess(`${successCount} photo${successCount !== 1 ? 's' : ''} uploaded`)
      }

      if (errors.length > 0) {
        const errorMsg = errors.slice(0, 3).join('\n')
        this.showError(errorMsg + (errors.length > 3 ? `\n... and ${errors.length - 3} more` : ''))
      }
    } catch (error) {
      console.error('Failed to upload photos:', error)
      this.showError(error.message || ERROR_MESSAGES.STORAGE_ERROR)
    }
  }

  /**
   * Show success message
   * @private
   * @param {string} message - Message text
   */
  showSuccess(message) {
    this.components.toast.show(message, 'success')
  }

  /**
   * Show error message
   * @private
   * @param {string} message - Error message
   */
  showError(message) {
    this.components.toast.show(message, 'error')
  }

  /**
   * Setup global error handling
   * @private
   */
  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Uncaught error:', event.error)
      this.showError('An unexpected error occurred')
    })

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      this.showError('An unexpected error occurred')
    })
  }

  /**
   * Cleanup and destroy app
   */
  destroy() {
    this.components.albumList.destroy()
    this.components.albumDetail.destroy()
    this.components.toast.destroy()
  }
}
