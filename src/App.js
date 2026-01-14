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

      this.components.albumDetail.onPhotoReorder((photoId, newPosition) => {
        this.reorderPhotos(albumId, photoId, newPosition)
      })

      this.components.albumDetail.onPhotoMove((photoId, targetAlbumId) => {
        this.movePhotoToAlbum(albumId, photoId, targetAlbumId)
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
   * Reorder photos within an album
   * @private
   * @param {string} albumId - Album ID
   * @param {string} photoId - Photo ID being moved
   * @param {number} newPosition - New position (0-based index)
   */
  async reorderPhotos(albumId, photoId, newPosition) {
    try {
      const photos = this.state.photos[albumId]
      if (!photos) {
        throw new Error('No photos found for album')
      }

      // Find current photo and position
      const photoIndex = photos.findIndex(p => p.id === photoId)
      if (photoIndex === -1) {
        throw new Error('Photo not found')
      }

      const currentPosition = photos[photoIndex].position

      // Don't reorder if dropping in same position
      if (currentPosition === newPosition) {
        return
      }

      // Calculate position updates for affected photos
      const moves = []

      if (currentPosition < newPosition) {
        // Moving forward: shift photos between old and new position backward
        for (let i = currentPosition + 1; i <= newPosition; i++) {
          const photo = photos.find(p => p.position === i)
          if (photo) {
            moves.push({ photoId: photo.id, newPosition: i - 1 })
          }
        }
      } else {
        // Moving backward: shift photos between new and old position forward
        for (let i = newPosition; i < currentPosition; i++) {
          const photo = photos.find(p => p.position === i)
          if (photo) {
            moves.push({ photoId: photo.id, newPosition: i + 1 })
          }
        }
      }

      // Add the dragged photo's new position
      moves.push({ photoId, newPosition })

      // Update storage with atomic transaction
      await storageService.reorderPhotos(albumId, moves)

      // Update local state
      moves.forEach(move => {
        const photo = photos.find(p => p.id === move.photoId)
        if (photo) {
          photo.position = move.newPosition
        }
      })

      // Sort photos by position
      photos.sort((a, b) => a.position - b.position)

      // Update UI
      this.components.albumDetail.updatePhotoOrder(photos)
    } catch (error) {
      console.error('Failed to reorder photos:', error)
      this.showError('Failed to reorder photos')
    }
  }

  /**
   * Move photo to another album
   * @private
   * @param {string} sourceAlbumId - Source album ID
   * @param {string} photoId - Photo ID to move
   * @param {string} targetAlbumId - Target album ID
   */
  async movePhotoToAlbum(sourceAlbumId, photoId, targetAlbumId) {
    try {
      // Validate
      if (sourceAlbumId === targetAlbumId) {
        this.showError('Cannot move photo to same album')
        return
      }

      const sourcePhotos = this.state.photos[sourceAlbumId]
      if (!sourcePhotos) {
        throw new Error('Source album photos not found')
      }

      const photoIndex = sourcePhotos.findIndex(p => p.id === photoId)
      if (photoIndex === -1) {
        throw new Error('Photo not found in source album')
      }

      const photo = sourcePhotos[photoIndex]

      // Move in storage
      await storageService.movePhoto(photoId, targetAlbumId)

      // Update local state
      sourcePhotos.splice(photoIndex, 1)
      sourcePhotos.sort((a, b) => a.position - b.position)

      // Update source album state
      const sourceAlbum = this.state.albums.find(a => a.id === sourceAlbumId)
      if (sourceAlbum) {
        sourceAlbum.photoCount = Math.max(0, sourceAlbum.photoCount - 1)
      }

      // Update target album state
      const targetAlbum = this.state.albums.find(a => a.id === targetAlbumId)
      if (targetAlbum) {
        targetAlbum.photoCount = (targetAlbum.photoCount || 0) + 1
      }

      // Initialize target album photos if needed
      if (!this.state.photos[targetAlbumId]) {
        this.state.photos[targetAlbumId] = []
      }

      // Add photo to target album
      this.state.photos[targetAlbumId].push(photo)
      this.state.photos[targetAlbumId].sort((a, b) => a.position - b.position)

      // Update UI
      this.components.albumDetail.updatePhotoOrder(sourcePhotos)
      this.components.albumDetail.updateAlbumInfo(sourceAlbum)

      this.showSuccess(`Photo moved to ${targetAlbum ? targetAlbum.name : 'album'}`)
    } catch (error) {
      console.error('Failed to move photo:', error)
      this.showError('Failed to move photo')
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
