/**
 * Toast Component
 * Shows temporary notification messages
 */
import { createElement, querySelector } from '../utils/dom.js'
import { TOAST_DURATION_MS } from '../utils/constants.js'

export class Toast {
  constructor() {
    this.container = null
    this.currentToast = null
    this.timeoutId = null
  }

  /**
   * Show a toast message
   * @param {string} message - Message text
   * @param {string} [type] - Toast type: 'success', 'error', 'info' (default: 'info')
   * @param {number} [duration] - Duration in ms (default: TOAST_DURATION_MS)
   */
  show(message, type = 'info', duration = TOAST_DURATION_MS) {
    // Get or find container
    if (!this.container) {
      this.container = querySelector('#toast-container')
    }

    if (!this.container) {
      console.error('Toast: Container not found')
      return
    }

    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    // Remove previous toast
    if (this.currentToast) {
      this.currentToast.remove()
    }

    // Create new toast
    const toast = createElement('div', {
      className: `toast toast-${type}`,
      attributes: {
        role: 'alert',
        'aria-live': 'polite',
        'aria-atomic': 'true'
      }
    })

    // Icon
    const icon = this.createIcon(type)
    if (icon) {
      toast.appendChild(icon)
    }

    // Message
    const messageEl = createElement('p', {
      className: 'toast-message',
      text: message
    })
    toast.appendChild(messageEl)

    // Close button
    const closeBtn = createElement('button', {
      className: 'toast-close',
      text: '×',
      attributes: {
        'aria-label': 'Close notification'
      }
    })
    toast.appendChild(closeBtn)

    // Add animation class
    toast.style.animation = `slideIn 0.3s ease-out`

    // Append to container
    this.container.appendChild(toast)
    this.currentToast = toast

    // Handle close button
    closeBtn.addEventListener('click', () => {
      this.hide()
    })

    // Auto-hide after duration
    this.timeoutId = setTimeout(() => {
      this.hide()
    }, duration)
  }

  /**
   * Create icon element based on type
   * @private
   * @param {string} type - Toast type
   * @returns {Element|null} Icon element or null
   */
  createIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ'
    }

    if (icons[type]) {
      return createElement('span', {
        className: `toast-icon toast-icon-${type}`,
        text: icons[type],
        attributes: {
          'aria-hidden': 'true'
        }
      })
    }

    return null
  }

  /**
   * Hide current toast
   */
  hide() {
    if (!this.currentToast) return

    this.currentToast.style.animation = `slideOut 0.3s ease-out`

    setTimeout(() => {
      if (this.currentToast && this.currentToast.parentNode) {
        this.currentToast.remove()
      }
      this.currentToast = null
    }, 300)

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    if (this.currentToast) {
      this.currentToast.remove()
    }
  }
}
