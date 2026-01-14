/**
 * AlbumList Component
 * Displays and manages the list of albums
 */
import { createElement, querySelector, clearChildren, addClass, removeClass } from '../utils/dom.js'
import { on, delegate, emit } from '../utils/events.js'
import { MAX_ALBUM_NAME_LENGTH, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js'

export class AlbumList {
  constructor() {
    this.container = null
    this.albums = []
    this.listeners = {
      onAlbumSelected: null,
      onCreateAlbum: null,
      onDeleteAlbum: null
    }
    this.cleanupFunctions = []
  }

  /**
   * Render album list view
   * @param {Album[]} albums - Array of albums to display
   * @param {Element} [parentEl] - Optional parent element (uses #app-main if not provided)
   */
  render(albums, parentEl = null) {
    if (!parentEl) {
      parentEl = querySelector('#app-main')
    }

    if (!parentEl) {
      console.error('AlbumList: Parent element not found')
      return
    }

    this.container = parentEl
    this.albums = albums || []

    // Clear existing content
    clearChildren(this.container)

    // Create album list section
    const section = createElement('section', {
      id: 'album-list-section',
      className: 'album-section'
    })

    // Create header with title and create button
    const header = createElement('div', {
      className: 'album-list-header'
    })

    const title = createElement('h2', {
      className: 'album-list-title',
      text: 'Albums'
    })

    const createBtn = createElement('button', {
      id: 'create-album-btn',
      className: 'btn btn-primary',
      text: 'New Album',
      attributes: {
        'data-test-id': 'create-album-button',
        'aria-label': 'Create new album'
      }
    })

    header.appendChild(title)
    header.appendChild(createBtn)
    section.appendChild(header)

    // Create album list container
    const listContainer = createElement('div', {
      id: 'album-list',
      className: 'album-list',
      attributes: {
        role: 'region',
        'aria-label': 'Albums'
      }
    })

    if (this.albums.length === 0) {
      // Show empty state
      const emptyState = createElement('div', {
        className: 'empty-state',
        attributes: {
          role: 'status'
        }
      })

      const emptyMessage = createElement('p', {
        className: 'empty-state-text',
        text: 'No albums yet. Create one to get started!'
      })

      emptyState.appendChild(emptyMessage)
      listContainer.appendChild(emptyState)
    } else {
      // Render each album
      this.albums.forEach((album, index) => {
        const albumEl = this.createAlbumElement(album, index)
        listContainer.appendChild(albumEl)
      })
    }

    section.appendChild(listContainer)

    // Create album form (hidden initially, shown on create button click)
    const formContainer = createElement('div', {
      id: 'album-form-container',
      className: 'album-form-container hidden'
    })

    const form = this.createAlbumForm()
    formContainer.appendChild(form)
    section.appendChild(formContainer)

    this.container.appendChild(section)

    // Setup event listeners
    this.setupEventListeners()
  }

  /**
   * Create album item element
   * @private
   * @param {Album} album - Album to display
   * @param {number} index - Album index
   * @returns {Element} Album element
   */
  createAlbumElement(album, index) {
    const albumEl = createElement('div', {
      className: 'album-item',
      attributes: {
        'data-album': album.id,
        'data-test-id': `album-item-${album.id}`
      }
    })

    // Album card container
    const card = createElement('div', {
      className: 'album-card',
      attributes: {
        role: 'button',
        tabindex: '0',
        'aria-label': `${album.name}, ${album.photoCount} photos`
      }
    })

    // Album thumbnail (placeholder)
    const thumbnail = createElement('div', {
      className: 'album-thumbnail'
    })

    const thumbnailPlaceholder = createElement('div', {
      className: 'album-thumbnail-placeholder',
      attributes: {
        'aria-hidden': 'true'
      }
    })

    const placeholderText = createElement('span', {
      text: album.photoCount === 0 ? 'No photos' : `${album.photoCount} photo${album.photoCount !== 1 ? 's' : ''}`
    })

    thumbnailPlaceholder.appendChild(placeholderText)
    thumbnail.appendChild(thumbnailPlaceholder)
    card.appendChild(thumbnail)

    // Album info
    const info = createElement('div', {
      className: 'album-info'
    })

    const nameEl = createElement('h3', {
      className: 'album-name',
      text: album.name
    })

    const countEl = createElement('p', {
      className: 'album-count',
      text: `${album.photoCount} photo${album.photoCount !== 1 ? 's' : ''}`
    })

    const dateEl = createElement('p', {
      className: 'album-date',
      text: new Date(album.createdAt).toLocaleDateString()
    })

    info.appendChild(nameEl)
    info.appendChild(countEl)
    info.appendChild(dateEl)
    card.appendChild(info)

    albumEl.appendChild(card)

    // Delete button
    const deleteBtn = createElement('button', {
      className: 'album-delete-btn btn btn-sm btn-danger',
      text: 'Delete',
      attributes: {
        'data-test-id': `delete-album-${album.id}`,
        'aria-label': `Delete album ${album.name}`
      }
    })

    albumEl.appendChild(deleteBtn)

    return albumEl
  }

  /**
   * Create album form
   * @private
   * @returns {Element} Form element
   */
  createAlbumForm() {
    const form = createElement('form', {
      id: 'album-form',
      className: 'album-form'
    })

    const inputGroup = createElement('div', {
      className: 'form-group'
    })

    const label = createElement('label', {
      attributes: {
        for: 'album-name-input'
      },
      text: 'Album Name'
    })

    const input = createElement('input', {
      id: 'album-name-input',
      className: 'form-control',
      attributes: {
        type: 'text',
        placeholder: 'My vacation...',
        'data-test-id': 'album-name-input',
        maxlength: MAX_ALBUM_NAME_LENGTH.toString(),
        required: 'true',
        autocomplete: 'off'
      }
    })

    inputGroup.appendChild(label)
    inputGroup.appendChild(input)
    form.appendChild(inputGroup)

    // Buttons
    const buttonGroup = createElement('div', {
      className: 'form-buttons'
    })

    const submitBtn = createElement('button', {
      type: 'submit',
      className: 'btn btn-primary',
      text: 'Create',
      attributes: {
        'data-test-id': 'create-album-submit'
      }
    })

    const cancelBtn = createElement('button', {
      type: 'button',
      className: 'btn btn-secondary',
      text: 'Cancel',
      attributes: {
        'data-test-id': 'create-album-cancel'
      }
    })

    buttonGroup.appendChild(submitBtn)
    buttonGroup.appendChild(cancelBtn)
    form.appendChild(buttonGroup)

    // Error message
    const errorMsg = createElement('div', {
      className: 'form-error hidden',
      attributes: {
        role: 'alert'
      }
    })

    form.appendChild(errorMsg)

    // Character counter
    const counter = createElement('p', {
      className: 'form-counter',
      text: `0 / ${MAX_ALBUM_NAME_LENGTH}`
    })

    form.appendChild(counter)

    return form
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    // Create album button
    const createBtn = querySelector('#create-album-btn', this.container)
    if (createBtn) {
      const cleanup = on(createBtn, 'click', () => {
        this.showCreateForm()
      })
      this.cleanupFunctions.push(cleanup)
    }

    // Form submission
    const form = querySelector('#album-form', this.container)
    if (form) {
      const cleanup = on(form, 'submit', (e) => {
        e.preventDefault()
        this.handleFormSubmit()
      })
      this.cleanupFunctions.push(cleanup)

      // Cancel button
      const cancelBtn = querySelector('[data-test-id="create-album-cancel"]', this.container)
      if (cancelBtn) {
        const cleanup = on(cancelBtn, 'click', () => {
          this.hideCreateForm()
        })
        this.cleanupFunctions.push(cleanup)
      }

      // Name input character counter
      const input = querySelector('#album-name-input', this.container)
      if (input) {
        const cleanup = on(input, 'input', () => {
          const counter = querySelector('.form-counter', form)
          if (counter) {
            counter.textContent = `${input.value.length} / ${MAX_ALBUM_NAME_LENGTH}`
          }
        })
        this.cleanupFunctions.push(cleanup)
      }
    }

    // Album card clicks (delegate)
    const albumList = querySelector('#album-list', this.container)
    if (albumList) {
      const cleanup = delegate(albumList, '.album-card', 'click', (e) => {
        const albumEl = e.closest('.album-item')
        if (albumEl) {
          const albumId = albumEl.dataset.album
          if (this.listeners.onAlbumSelected) {
            this.listeners.onAlbumSelected(albumId)
          }
        }
      })
      this.cleanupFunctions.push(cleanup)
    }

    // Delete album buttons (delegate)
    if (albumList) {
      const cleanup = delegate(albumList, '.album-delete-btn', 'click', (e) => {
        e.stopPropagation()
        const albumEl = e.closest('.album-item')
        if (albumEl) {
          const albumId = albumEl.dataset.album
          this.handleDeleteAlbum(albumId)
        }
      })
      this.cleanupFunctions.push(cleanup)
    }
  }

  /**
   * Show create album form
   * @private
   */
  showCreateForm() {
    const formContainer = querySelector('#album-form-container', this.container)
    if (formContainer) {
      removeClass(formContainer, 'hidden')
      const input = querySelector('#album-name-input', formContainer)
      if (input) {
        setTimeout(() => input.focus(), 0)
      }
    }
  }

  /**
   * Hide create album form
   * @private
   */
  hideCreateForm() {
    const formContainer = querySelector('#album-form-container', this.container)
    if (formContainer) {
      addClass(formContainer, 'hidden')
      const form = querySelector('#album-form', formContainer)
      if (form) {
        form.reset()
        const errorMsg = querySelector('.form-error', form)
        if (errorMsg) {
          addClass(errorMsg, 'hidden')
          errorMsg.textContent = ''
        }
      }
    }
  }

  /**
   * Handle form submission
   * @private
   */
  handleFormSubmit() {
    const input = querySelector('#album-name-input', this.container)
    if (!input) return

    const name = input.value.trim()

    // Validation
    if (!name) {
      this.showFormError(ERROR_MESSAGES.INVALID_ALBUM_NAME)
      return
    }

    if (name.length > MAX_ALBUM_NAME_LENGTH) {
      this.showFormError(ERROR_MESSAGES.INVALID_ALBUM_NAME)
      return
    }

    // Call listener
    if (this.listeners.onCreateAlbum) {
      this.listeners.onCreateAlbum(name)
    }

    // Reset form
    input.value = ''
    this.hideCreateForm()
  }

  /**
   * Show form error message
   * @private
   * @param {string} message - Error message
   */
  showFormError(message) {
    const form = querySelector('#album-form', this.container)
    if (form) {
      const errorMsg = querySelector('.form-error', form)
      if (errorMsg) {
        errorMsg.textContent = message
        removeClass(errorMsg, 'hidden')
      }
    }
  }

  /**
   * Handle album deletion
   * @private
   * @param {string} albumId - Album ID
   */
  handleDeleteAlbum(albumId) {
    const album = this.albums.find(a => a.id === albumId)
    if (!album) return

    const message = album.photoCount > 0
      ? `Delete album "${album.name}" and its ${album.photoCount} photo(s)?`
      : `Delete album "${album.name}"?`

    if (confirm(message)) {
      if (this.listeners.onDeleteAlbum) {
        this.listeners.onDeleteAlbum(albumId)
      }
    }
  }

  /**
   * Register album selected listener
   * @param {Function} callback - Callback function (albumId)
   */
  onAlbumSelected(callback) {
    this.listeners.onAlbumSelected = callback
  }

  /**
   * Register create album listener
   * @param {Function} callback - Callback function (name)
   */
  onCreateAlbum(callback) {
    this.listeners.onCreateAlbum = callback
  }

  /**
   * Register delete album listener
   * @param {Function} callback - Callback function (albumId)
   */
  onDeleteAlbum(callback) {
    this.listeners.onDeleteAlbum = callback
  }

  /**
   * Add new album to list
   * @param {Album} album - Album to add
   */
  addAlbum(album) {
    this.albums.unshift(album)
    this.render(this.albums, this.container)
  }

  /**
   * Remove album from list
   * @param {string} albumId - Album ID
   */
  removeAlbum(albumId) {
    this.albums = this.albums.filter(a => a.id !== albumId)
    this.render(this.albums, this.container)
  }

  /**
   * Update album in list (for photo count changes)
   * @param {Album} album - Updated album
   */
  updateAlbum(album) {
    const index = this.albums.findIndex(a => a.id === album.id)
    if (index !== -1) {
      this.albums[index] = album
      // Re-render just this album
      const albumEl = querySelector(`[data-album="${album.id}"]`, this.container)
      if (albumEl) {
        const parentList = querySelector('#album-list', this.container)
        if (parentList) {
          const newAlbumEl = this.createAlbumElement(album, index)
          parentList.replaceChild(newAlbumEl, albumEl)
        }
      }
    }
  }

  /**
   * Cleanup and remove event listeners
   */
  destroy() {
    this.cleanupFunctions.forEach(fn => fn())
    this.cleanupFunctions = []
    this.listeners = {
      onAlbumSelected: null,
      onCreateAlbum: null,
      onDeleteAlbum: null
    }
  }
}
