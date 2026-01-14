/**
 * DragDropService
 * Handles drag-and-drop functionality for photos and albums
 */
import { DRAG_DROP_MIME_TYPE } from '../utils/constants.js'

export class DragDropService {
  constructor() {
    this.draggedElement = null
    this.draggedData = null
    this.dropZones = new Set()
    this.isDragging = false
  }

  /**
   * Make an element draggable
   * @param {Element} el - Element to make draggable
   * @param {Object} data - Data to transfer {type, id, ...}
   * @param {Function} [onDragStart] - Drag start callback
   * @param {Function} [onDragEnd] - Drag end callback
   * @returns {Function} Cleanup function
   */
  makeDraggable(el, data, onDragStart, onDragEnd) {
    const handlers = {}

    handlers.dragstart = (e) => {
      this.draggedElement = el
      this.draggedData = data
      this.isDragging = true

      // Set drag image (optional custom image)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData(DRAG_DROP_MIME_TYPE, JSON.stringify(data))

      // Add visual feedback
      el.classList.add('dragging')

      onDragStart?.(e, data)
    }

    handlers.dragend = (e) => {
      this.draggedElement = null
      this.draggedData = null
      this.isDragging = false

      // Remove visual feedback
      el.classList.remove('dragging')

      onDragEnd?.(e)
    }

    el.addEventListener('dragstart', handlers.dragstart)
    el.addEventListener('dragend', handlers.dragend)

    return () => {
      el.removeEventListener('dragstart', handlers.dragstart)
      el.removeEventListener('dragend', handlers.dragend)
    }
  }

  /**
   * Make an element a drop zone
   * @param {Element} el - Element to make droppable
   * @param {Object} options - Configuration
   * @param {Function} [options.onDragOver] - Drag over callback
   * @param {Function} [options.onDragLeave] - Drag leave callback
   * @param {Function} [options.onDrop] - Drop callback (receives data, event)
   * @param {string} [options.dropClass] - CSS class for drop state (default 'drop-active')
   * @returns {Function} Cleanup function
   */
  makeDropZone(el, options = {}) {
    if (!el) return () => {}

    const dropClass = options.dropClass || 'drop-active'
    const handlers = {}

    handlers.dragover = (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'

      if (!el.classList.contains(dropClass)) {
        el.classList.add(dropClass)
      }

      options.onDragOver?.(e)
    }

    handlers.dragleave = (e) => {
      // Only remove class if we're leaving the element entirely
      if (e.target === el) {
        el.classList.remove(dropClass)
        options.onDragLeave?.(e)
      }
    }

    handlers.drop = (e) => {
      e.preventDefault()
      e.stopPropagation()

      el.classList.remove(dropClass)

      try {
        const jsonData = e.dataTransfer.getData(DRAG_DROP_MIME_TYPE)
        const data = JSON.parse(jsonData)
        options.onDrop?.(data, e)
      } catch (error) {
        console.error('Drop error:', error)
      }
    }

    el.addEventListener('dragover', handlers.dragover)
    el.addEventListener('dragleave', handlers.dragleave)
    el.addEventListener('drop', handlers.drop)

    this.dropZones.add(el)

    return () => {
      el.removeEventListener('dragover', handlers.dragover)
      el.removeEventListener('dragleave', handlers.dragleave)
      el.removeEventListener('drop', handlers.drop)
      this.dropZones.delete(el)
    }
  }

  /**
   * Create a custom drag image
   * @param {Element} el - Element to create image from
   * @param {number} [offsetX] - X offset (default -10)
   * @param {number} [offsetY] - Y offset (default -10)
   * @returns {HTMLCanvasElement} Canvas element for drag image
   */
  createDragImage(el, offsetX = -10, offsetY = -10) {
    const rect = el.getBoundingClientRect()
    const canvas = document.createElement('canvas')
    canvas.width = rect.width
    canvas.height = rect.height

    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Optional: render element content
    ctx.fillStyle = '#fff'
    ctx.font = '12px sans-serif'
    ctx.fillText('Moving...', 10, 20)

    return canvas
  }

  /**
   * Get currently dragged data
   * @returns {Object|null} Dragged data or null if not dragging
   */
  getDraggedData() {
    return this.draggedData
  }

  /**
   * Get currently dragged element
   * @returns {Element|null} Dragged element or null if not dragging
   */
  getDraggedElement() {
    return this.draggedElement
  }

  /**
   * Check if currently dragging
   * @returns {boolean} True if dragging
   */
  isDraggingActive() {
    return this.isDragging
  }

  /**
   * Cancel current drag operation
   */
  cancelDrag() {
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging')
    }
    this.draggedElement = null
    this.draggedData = null
    this.isDragging = false

    // Clear drop zone visual feedback
    this.dropZones.forEach(zone => {
      zone.classList.remove('drop-active')
    })
  }

  /**
   * Setup drag reordering for a list
   * @param {Element} container - Container with sortable items
   * @param {Object} options - Configuration
   * @param {string} [options.itemSelector] - Selector for draggable items
   * @param {Function} [options.onReorder] - Reorder callback (from, to indices)
   * @param {Function} [options.getItemId] - Get item ID function
   * @returns {Function} Cleanup function
   */
  setupReordering(container, options = {}) {
    const itemSelector = options.itemSelector || '[draggable="true"]'
    const getItemId = options.getItemId || ((el) => el.dataset.id)

    const cleanups = []

    const updateItems = () => {
      const items = container.querySelectorAll(itemSelector)
      items.forEach((item, index) => {
        const cleanup = this.makeDraggable(
          item,
          { type: 'reorder', index, id: getItemId(item) },
          (e, data) => {
            item.classList.add('reorder-dragging')
          },
          () => {
            item.classList.remove('reorder-dragging')
          }
        )
        cleanups.push(cleanup)
      })
    }

    const cleanup = this.makeDropZone(container, {
      dropClass: 'reorder-drop-active',
      onDrop: (data, e) => {
        if (data.type === 'reorder' && options.onReorder) {
          const toIndex = Array.from(container.querySelectorAll(itemSelector)).findIndex(
            item => item.contains(e.target)
          )
          if (toIndex !== -1 && toIndex !== data.index) {
            options.onReorder(data.index, toIndex, data.id)
          }
        }
      }
    })

    cleanups.push(cleanup)

    // Setup mutation observer to handle dynamic items
    const observer = new MutationObserver(() => {
      cleanups.forEach(fn => fn())
      cleanups.length = 0
      updateItems()
    })

    observer.observe(container, { childList: true, subtree: true })
    cleanups.push(() => observer.disconnect())

    updateItems()

    return () => {
      cleanups.forEach(fn => fn())
    }
  }

  /**
   * Handle file drop uploads
   * @param {Element} el - Drop zone element
   * @param {Object} options - Configuration
   * @param {Function} [options.onFilesDropped] - Files dropped callback (files array)
   * @param {Function} [options.onDragOver] - Drag over callback
   * @param {Function} [options.onDragLeave] - Drag leave callback
   * @param {Array<string>} [options.acceptTypes] - Accepted MIME types
   * @returns {Function} Cleanup function
   */
  setupFileDropZone(el, options = {}) {
    if (!el) return () => {}

    const handlers = {}

    handlers.dragover = (e) => {
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = 'copy'
      el.classList.add('file-drop-active')
      options.onDragOver?.(e)
    }

    handlers.dragleave = (e) => {
      if (e.target === el) {
        el.classList.remove('file-drop-active')
        options.onDragLeave?.(e)
      }
    }

    handlers.drop = (e) => {
      e.preventDefault()
      e.stopPropagation()
      el.classList.remove('file-drop-active')

      const files = Array.from(e.dataTransfer.files)
      const acceptTypes = options.acceptTypes

      const filtered = acceptTypes
        ? files.filter(file => acceptTypes.includes(file.type))
        : files

      if (filtered.length > 0) {
        options.onFilesDropped?.(filtered, e)
      }
    }

    el.addEventListener('dragover', handlers.dragover)
    el.addEventListener('dragleave', handlers.dragleave)
    el.addEventListener('drop', handlers.drop)

    return () => {
      el.removeEventListener('dragover', handlers.dragover)
      el.removeEventListener('dragleave', handlers.dragleave)
      el.removeEventListener('drop', handlers.drop)
      el.classList.remove('file-drop-active')
    }
  }

  /**
   * Get files from drop event
   * @param {DragEvent} e - Drop event
   * @returns {File[]} Array of files
   */
  getFilesFromDropEvent(e) {
    if (!e || !e.dataTransfer) return []
    return Array.from(e.dataTransfer.files)
  }

  /**
   * Check if dragging files
   * @param {DragEvent} e - Drag event
   * @returns {boolean} True if files are being dragged
   */
  isDraggingFiles(e) {
    if (!e || !e.dataTransfer) return false
    return e.dataTransfer.types.includes('Files')
  }

  /**
   * Clear all registered drop zones
   */
  clearDropZones() {
    this.dropZones.forEach(zone => {
      zone.classList.remove('drop-active', 'reorder-drop-active', 'file-drop-active')
    })
    this.dropZones.clear()
  }

  /**
   * Disable native browser drag handling (for custom implementations)
   * @returns {Function} Cleanup function
   */
  disableNativeDragDrop() {
    const handler = (e) => {
      e.preventDefault()
      e.stopPropagation()
    }

    document.addEventListener('dragover', handler)
    document.addEventListener('drop', handler)

    return () => {
      document.removeEventListener('dragover', handler)
      document.removeEventListener('drop', handler)
    }
  }
}

// Singleton instance
export const dragDropService = new DragDropService()
