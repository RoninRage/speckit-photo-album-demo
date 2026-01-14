/**
 * DeleteConfirmationModal Component
 * Modal dialog for confirming deletion of photos or albums
 */
import { createElement, querySelector } from '../utils/dom.js'
import { on } from '../utils/events.js'

export class DeleteConfirmationModal {
  constructor() {
    this.container = null
    this.modalElement = null
    this.onConfirm = null
    this.onCancel = null
    this.itemType = null // 'photo' or 'album'
    this.itemName = null
  }

  /**
   * Show delete confirmation modal
   * @param {Object} options - Configuration
   * @param {string} options.itemType - Type of item ('photo' or 'album')
   * @param {string} options.itemName - Name of item to delete
   * @param {Function} options.onConfirm - Callback when confirmed
   * @param {Function} options.onCancel - Callback when cancelled
   */
  show({ itemType = 'photo', itemName = '', onConfirm = null, onCancel = null } = {}) {
    this.itemType = itemType
    this.itemName = itemName
    this.onConfirm = onConfirm
    this.onCancel = onCancel

    // Get or create container
    this.container = querySelector('body')
    if (!this.container) {
      console.error('DeleteConfirmationModal: Body element not found')
      return
    }

    // Create modal overlay
    this.createModal()

    // Show modal with animation
    if (this.modalElement) {
      this.modalElement.classList.add('show')
    }
  }

  /**
   * Create modal DOM structure
   * @private
   */
  createModal() {
    // Remove existing modal if present
    const existing = querySelector('[data-modal-id="delete-confirmation"]')
    if (existing) {
      existing.remove()
    }

    // Create modal wrapper
    const modal = createElement('div', {
      className: 'modal-overlay',
      attributes: {
        'data-modal-id': 'delete-confirmation',
        'data-test-id': 'delete-confirmation-modal'
      }
    })

    // Create modal content
    const content = createElement('div', {
      className: 'modal-content'
    })

    // Create header
    const header = createElement('div', {
      className: 'modal-header'
    })

    const title = createElement('h2', {
      className: 'modal-title',
      text: `Delete ${this.itemType}?`
    })

    header.appendChild(title)
    content.appendChild(header)

    // Create body
    const body = createElement('div', {
      className: 'modal-body'
    })

    const message = createElement('p', {
      className: 'modal-message',
      text: `Are you sure you want to delete "${this.itemName}"? This action cannot be undone.`
    })

    body.appendChild(message)
    content.appendChild(body)

    // Create footer with buttons
    const footer = createElement('div', {
      className: 'modal-footer'
    })

    const cancelBtn = createElement('button', {
      className: 'btn btn-secondary',
      text: 'Cancel',
      attributes: {
        'data-test-id': 'delete-cancel-btn',
        type: 'button'
      }
    })

    const confirmBtn = createElement('button', {
      className: 'btn btn-danger',
      text: 'Delete',
      attributes: {
        'data-test-id': 'delete-confirm-btn',
        type: 'button'
      }
    })

    footer.appendChild(cancelBtn)
    footer.appendChild(confirmBtn)
    content.appendChild(footer)

    modal.appendChild(content)

    // Add event listeners
    this.setupEventListeners(modal, cancelBtn, confirmBtn)

    // Add to DOM
    this.container.appendChild(modal)
    this.modalElement = modal
  }

  /**
   * Setup event listeners for modal
   * @private
   */
  setupEventListeners(modal, cancelBtn, confirmBtn) {
    // Cancel button
    on(cancelBtn, 'click', () => {
      this.close()
      if (this.onCancel) {
        this.onCancel()
      }
    })

    // Confirm button
    on(confirmBtn, 'click', () => {
      this.close()
      if (this.onConfirm) {
        this.onConfirm()
      }
    })

    // Close on overlay click
    on(modal, 'click', (e) => {
      if (e.target === modal) {
        this.close()
        if (this.onCancel) {
          this.onCancel()
        }
      }
    })

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.close()
        if (this.onCancel) {
          this.onCancel()
        }
        document.removeEventListener('keydown', handleEscape)
      }
    }

    document.addEventListener('keydown', handleEscape)
  }

  /**
   * Close and remove modal
   */
  close() {
    if (this.modalElement) {
      this.modalElement.classList.remove('show')
      // Remove after animation completes
      setTimeout(() => {
        if (this.modalElement && this.modalElement.parentElement) {
          this.modalElement.remove()
        }
      }, 300)
    }
  }

  /**
   * Destroy modal
   */
  destroy() {
    if (this.modalElement && this.modalElement.parentElement) {
      this.modalElement.remove()
    }
  }
}
