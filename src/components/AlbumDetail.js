/**
 * AlbumDetail Component
 * Displays album details and manages photos within an album
 */
import { createElement, querySelector, clearChildren, addClass, removeClass } from '../utils/dom.js'
import { on, debounce } from '../utils/events.js'
import { DragDropService } from '../services/DragDropService.js'

export class AlbumDetail {
  constructor() {
    this.container = null
    this.currentAlbum = null
    this.photos = []
    this.listeners = {
      onBack: null,
      onUploadPhoto: null,
      onPhotoSelected: null,
      onPhotoReorder: null,
      onPhotoMove: null,
      onDeletePhoto: null
    }
    this.cleanupFunctions = []
    this.dragDropService = new DragDropService()
    this.draggedPhotoId = null
  }

  /**
   * Render album detail view
   * @param {Album} album - Album to display
   * @param {Photo[]} photos - Photos in album
   * @param {Element} [parentEl] - Optional parent element (uses #app-main if not provided)
   */
  render(album, photos = [], parentEl = null) {
    if (!parentEl) {
      parentEl = querySelector('#app-main')
    }

    if (!parentEl) {
      console.error('AlbumDetail: Parent element not found')
      return
    }

    this.container = parentEl
    this.currentAlbum = album
    this.photos = photos || []

    // Clear existing content
    clearChildren(this.container)

    // Create album detail section
    const section = createElement('section', {
      id: 'album-detail-section',
      className: 'album-section'
    })

    // Create header with back button and album info
    const header = this.createDetailHeader()
    section.appendChild(header)

    // Create photo upload area
    const uploadArea = this.createUploadArea()
    section.appendChild(uploadArea)

    // Create photo grid
    const photoGrid = this.createPhotoGrid()
    section.appendChild(photoGrid)

    this.container.appendChild(section)

    // Setup event listeners
    this.setupEventListeners()
  }

  /**
   * Create detail header
   * @private
   * @returns {Element} Header element
   */
  createDetailHeader() {
    const header = createElement('div', {
      className: 'album-detail-header'
    })

    // Back button
    const backBtn = createElement('button', {
      id: 'back-to-albums-btn',
      className: 'btn btn-secondary btn-sm',
      text: '← Back to Albums',
      attributes: {
        'data-test-id': 'back-button',
        'aria-label': 'Back to albums list'
      }
    })

    header.appendChild(backBtn)

    // Album info
    const info = createElement('div', {
      className: 'album-detail-info'
    })

    const title = createElement('h2', {
      id: 'album-detail-title',
      className: 'album-detail-title',
      text: this.currentAlbum.name
    })

    const stats = createElement('p', {
      className: 'album-stats',
      text: `${this.currentAlbum.photoCount} photo${this.currentAlbum.photoCount !== 1 ? 's' : ''}`
    })

    info.appendChild(title)
    info.appendChild(stats)
    header.appendChild(info)

    return header
  }

  /**
   * Create upload area
   * @private
   * @returns {Element} Upload area element
   */
  createUploadArea() {
    const area = createElement('div', {
      id: 'photo-upload-area',
      className: 'photo-upload-area'
    })

    const uploadZone = createElement('div', {
      className: 'upload-zone',
      attributes: {
        'data-test-id': 'upload-zone'
      }
    })

    const uploadText = createElement('p', {
      className: 'upload-text',
      text: 'Drag photos here or click to browse'
    })

    const uploadInput = createElement('input', {
      id: 'photo-file-input',
      className: 'upload-input hidden',
      attributes: {
        type: 'file',
        multiple: 'true',
        accept: 'image/jpeg,image/png,image/webp',
        'data-test-id': 'photo-file-input',
        'aria-label': 'Upload photos'
      }
    })

    uploadZone.appendChild(uploadText)
    uploadZone.appendChild(uploadInput)
    area.appendChild(uploadZone)

    return area
  }

  /**
   * Create photo grid
   * @private
   * @returns {Element} Photo grid element
   */
  createPhotoGrid() {
    const grid = createElement('div', {
      id: 'photo-grid',
      className: 'photo-grid',
      attributes: {
        role: 'region',
        'aria-label': 'Photos in album'
      }
    })

    if (this.photos.length === 0) {
      const emptyState = createElement('div', {
        className: 'empty-state',
        attributes: {
          role: 'status'
        }
      })

      const emptyMessage = createElement('p', {
        className: 'empty-state-text',
        text: 'No photos yet. Upload your first photo to get started!'
      })

      emptyState.appendChild(emptyMessage)
      grid.appendChild(emptyState)
    } else {
      this.photos.forEach((photo) => {
        const photoEl = this.createPhotoElement(photo)
        grid.appendChild(photoEl)
      })
    }

    return grid
  }

  /**
   * Create photo element
   * @private
   * @param {Photo} photo - Photo to display
   * @returns {Element} Photo element
   */
  createPhotoElement(photo) {
    const item = createElement('div', {
      className: 'photo-item',
      attributes: {
        'data-photo': photo.id,
        'data-position': photo.position,
        'data-test-id': `photo-${photo.id}`,
        draggable: 'true',
        role: 'button',
        tabindex: '0',
        'aria-label': photo.name
      }
    })

    const img = createElement('img', {
      className: 'photo-image',
      attributes: {
        src: photo.dataUrl,
        alt: photo.name
      }
    })

    const info = createElement('div', {
      className: 'photo-info'
    })

    const name = createElement('p', {
      className: 'photo-name',
      text: photo.name
    })

    const deleteBtn = createElement('button', {
      className: 'photo-delete-btn',
      text: '✕',
      attributes: {
        'data-test-id': `delete-photo-${photo.id}`,
        'aria-label': `Delete photo ${photo.name}`,
        type: 'button'
      }
    })

    info.appendChild(name)
    info.appendChild(deleteBtn)
    item.appendChild(img)
    item.appendChild(info)

    return item
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    // Back button
    const backBtn = querySelector('#back-to-albums-btn', this.container)
    if (backBtn) {
      const cleanup = on(backBtn, 'click', () => {
        if (this.listeners.onBack) {
          this.listeners.onBack()
        }
      })
      this.cleanupFunctions.push(cleanup)
    }

    // Upload zone click
    const uploadZone = querySelector('.upload-zone', this.container)
    const uploadInput = querySelector('#photo-file-input', this.container)

    if (uploadZone && uploadInput) {
      const cleanup = on(uploadZone, 'click', () => {
        uploadInput.click()
      })
      this.cleanupFunctions.push(cleanup)

      // File input change
      const cleanup2 = on(uploadInput, 'change', (e) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0 && this.listeners.onUploadPhoto) {
          this.listeners.onUploadPhoto(files)
        }
        // Reset input so same file can be selected again
        uploadInput.value = ''
      })
      this.cleanupFunctions.push(cleanup2)

      // Drag and drop
      const cleanup3 = on(uploadZone, 'dragover', (e) => {
        e.preventDefault()
        e.stopPropagation()
        addClass(uploadZone, 'drag-over')
      })
      this.cleanupFunctions.push(cleanup3)

      const cleanup4 = on(uploadZone, 'dragleave', (e) => {
        if (e.target === uploadZone) {
          removeClass(uploadZone, 'drag-over')
        }
      })
      this.cleanupFunctions.push(cleanup4)

      const cleanup5 = on(uploadZone, 'drop', (e) => {
        e.preventDefault()
        e.stopPropagation()
        removeClass(uploadZone, 'drag-over')

        const files = Array.from(e.dataTransfer.files || [])
        if (files.length > 0 && this.listeners.onUploadPhoto) {
          this.listeners.onUploadPhoto(files)
        }
      })
      this.cleanupFunctions.push(cleanup5)
    }

    // Setup photo drag-drop for reordering
    this.setupPhotoDragDrop()
  }

  /**
   * Setup photo drag-drop functionality
   * @private
   */
  setupPhotoDragDrop() {
    const grid = querySelector('#photo-grid', this.container)
    if (!grid) return

    // Create debounced reorder handler (max 50ms between calls)
    const debouncedReorder = debounce((photoId, targetPosition) => {
      if (this.listeners.onPhotoReorder) {
        this.listeners.onPhotoReorder(photoId, targetPosition)
      }
    }, 50)

    // Make grid a drop zone
    const gridCleanup = this.dragDropService.makeDropZone(grid, {
      dropClass: 'grid-drag-over',
      onDrop: (e) => {
        if (!this.draggedPhotoId || !this.listeners.onPhotoReorder) return

        // Find drop target photo
        const targetEl = e.target.closest('.photo-item')
        if (!targetEl) return

        const targetPhotoId = targetEl.dataset.photo
        const targetPosition = parseInt(targetEl.dataset.position, 10)

        if (targetPhotoId && targetPhotoId !== this.draggedPhotoId) {
          // Call debounced reorder handler
          debouncedReorder(this.draggedPhotoId, targetPosition)
        }

        this.draggedPhotoId = null
      }
    })
    this.cleanupFunctions.push(gridCleanup)

    // Make each photo draggable
    this.photos.forEach((photo) => {
      const photoEl = querySelector(`[data-photo="${photo.id}"]`, grid)
      if (!photoEl) return

      const cleanup = this.dragDropService.makeDraggable(
        photoEl,
        { type: 'photo', id: photo.id, albumId: this.currentAlbum.id, position: photo.position },
        (e, data) => {
          this.draggedPhotoId = data.id
          addClass(photoEl, 'dragging')
        },
        () => {
          removeClass(photoEl, 'dragging')
        }
      )
      this.cleanupFunctions.push(cleanup)

      // Setup delete button for this photo
      const deleteBtn = querySelector(`[data-test-id="delete-photo-${photo.id}"]`, photoEl)
      if (deleteBtn) {
        const deleteCleanup = on(deleteBtn, 'click', (e) => {
          e.stopPropagation()
          if (this.listeners.onDeletePhoto) {
            this.listeners.onDeletePhoto(photo.id, photo.name)
          }
        })
        this.cleanupFunctions.push(deleteCleanup)
      }
    })
  }

  /**
   * Register back listener
   * @param {Function} callback - Callback function
   */
  onBack(callback) {
    this.listeners.onBack = callback
  }

  /**
   * Register upload photo listener
   * @param {Function} callback - Callback function (files array)
   */
  onUploadPhoto(callback) {
    this.listeners.onUploadPhoto = callback
  }

  /**
   * Register photo selected listener
   * @param {Function} callback - Callback function (photoId)
   */
  onPhotoSelected(callback) {
    this.listeners.onPhotoSelected = callback
  }

  /**
   * Register photo reorder listener
   * @param {Function} callback - Callback function (photoId, newPosition)
   */
  onPhotoReorder(callback) {
    this.listeners.onPhotoReorder = callback
  }

  /**
   * Register photo move listener
   * @param {Function} callback - Callback function (photoId, targetAlbumId)
   */
  onPhotoMove(callback) {
    this.listeners.onPhotoMove = callback
  }

  /**
   * Register photo delete listener
   * @param {Function} callback - Callback function (photoId)
   */
  onDeletePhoto(callback) {
    this.listeners.onDeletePhoto = callback
  }

  /**
   * Add photo to grid
   * @param {Photo} photo - Photo to add
   */
  addPhoto(photo) {
    const grid = querySelector('#photo-grid', this.container)
    if (grid) {
      // Remove empty state if present
      const emptyState = querySelector('.empty-state', grid)
      if (emptyState) {
        clearChildren(grid)
      }

      // Add photo
      const photoEl = this.createPhotoElement(photo)
      grid.appendChild(photoEl)

      // Setup drag-drop for new photo
      const cleanup = this.dragDropService.makeDraggable(
        photoEl,
        { type: 'photo', id: photo.id, albumId: this.currentAlbum.id, position: photo.position },
        () => {
          this.draggedPhotoId = photo.id
          addClass(photoEl, 'dragging')
        },
        () => {
          removeClass(photoEl, 'dragging')
        }
      )
      this.cleanupFunctions.push(cleanup)
    }
  }

  /**
   * Update photo grid order
   * @param {Photo[]} photos - Reordered photos
   */
  updatePhotoOrder(photos) {
    this.photos = photos

    const grid = querySelector('#photo-grid', this.container)
    if (!grid) return

    // Clear grid
    clearChildren(grid)

    // Re-render photos in new order
    photos.forEach((photo) => {
      const photoEl = this.createPhotoElement(photo)
      grid.appendChild(photoEl)
    })

    // Re-setup drag-drop
    this.setupPhotoDragDrop()
  }

  /**
   * Update album header info
   * @param {Album} album - Updated album
   */
  updateAlbumInfo(album) {
    this.currentAlbum = album

    const title = querySelector('#album-detail-title', this.container)
    const stats = querySelector('.album-stats', this.container)

    if (title) {
      title.textContent = album.name
    }

    if (stats) {
      stats.textContent = `${album.photoCount} photo${album.photoCount !== 1 ? 's' : ''}`
    }
  }

  /**
   * Cleanup and remove event listeners
   */
  destroy() {
    this.cleanupFunctions.forEach(fn => fn())
    this.cleanupFunctions = []
    this.draggedPhotoId = null
    this.listeners = {
      onBack: null,
      onUploadPhoto: null,
      onPhotoSelected: null,
      onPhotoReorder: null
    }
  }
}
