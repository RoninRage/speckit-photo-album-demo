/**
 * Photo Entity
 * Represents a single photo within an album
 */
export class Photo {
  /**
   * Create a new Photo instance
   * @param {string} albumId - UUID of parent album
   * @param {string} name - Photo name/filename
   * @param {string} dataUrl - Base64 data URL (data:image/...;base64,...)
   * @param {string} [format] - Image format: JPEG|PNG|WebP (auto-detected if not provided)
   * @param {string} [id] - Optional UUID (auto-generated if not provided)
   * @param {number} [position] - Optional position in album (defaults to 0)
   * @param {number} [createdAt] - Optional creation timestamp (defaults to now)
   */
  constructor(albumId, name, dataUrl, format, id, position, createdAt) {
    this.validateAlbumId(albumId)
    this.validateName(name)
    this.validateDataUrl(dataUrl)
    
    this.id = id || this.generateId()
    this.albumId = albumId
    this.name = name.trim()
    this.dataUrl = dataUrl
    this.format = format || this.detectFormat(dataUrl)
    this.position = position ?? 0
    this.createdAt = createdAt || Date.now()
  }

  /**
   * Validate album ID
   * @param {string} albumId - Album ID to validate
   * @throws {Error} If invalid
   */
  validateAlbumId(albumId) {
    if (typeof albumId !== 'string' || !albumId) {
      throw new Error('Invalid albumId')
    }
  }

  /**
   * Validate photo name
   * @param {string} name - Name to validate
   * @throws {Error} If invalid
   */
  validateName(name) {
    if (typeof name !== 'string') {
      throw new Error('Photo name must be a string')
    }
    if (name.trim().length === 0) {
      throw new Error('Photo name cannot be empty')
    }
  }

  /**
   * Validate data URL format
   * @param {string} dataUrl - Data URL to validate
   * @throws {Error} If invalid
   */
  validateDataUrl(dataUrl) {
    if (typeof dataUrl !== 'string') {
      throw new Error('Photo dataUrl must be a string')
    }
    if (!dataUrl.startsWith('data:image/')) {
      throw new Error('Invalid data URL (must be data:image/...;base64,...)')
    }
    if (!dataUrl.includes(';base64,')) {
      throw new Error('Data URL must be base64 encoded')
    }
  }

  /**
   * Detect image format from data URL
   * @param {string} dataUrl - Data URL
   * @returns {string} Format: JPEG, PNG, or WebP
   */
  detectFormat(dataUrl) {
    if (dataUrl.includes('data:image/jpeg')) return 'JPEG'
    if (dataUrl.includes('data:image/png')) return 'PNG'
    if (dataUrl.includes('data:image/webp')) return 'WebP'
    if (dataUrl.includes('data:image/jpg')) return 'JPEG'
    return 'JPEG' // default
  }

  /**
   * Check if format is valid
   * @param {string} format - Format to check
   * @returns {boolean} True if valid
   */
  static isValidFormat(format) {
    return ['JPEG', 'PNG', 'WebP'].includes(format)
  }

  /**
   * Generate a UUID v4
   * @returns {string} Random UUID
   */
  generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  /**
   * Move photo to different album
   * @param {string} newAlbumId - Target album UUID
   * @param {number} [newPosition] - Optional position in new album
   */
  moveTo(newAlbumId, newPosition) {
    this.validateAlbumId(newAlbumId)
    this.albumId = newAlbumId
    if (newPosition !== undefined) {
      this.position = newPosition
    }
  }

  /**
   * Change position in album
   * @param {number} newPosition - New position (0-indexed)
   */
  setPosition(newPosition) {
    if (!Number.isInteger(newPosition) || newPosition < 0) {
      throw new Error('Position must be a non-negative integer')
    }
    this.position = newPosition
  }

  /**
   * Get file size estimate (base64 is ~1.33x original)
   * @returns {number} Approximate size in bytes
   */
  getEstimatedSize() {
    // base64 is ~1.33x original; remove header
    const base64Part = this.dataUrl.split(',')[1] || ''
    return Math.ceil((base64Part.length / 4) * 3)
  }

  /**
   * Get thumbnail data (same as full for simplicity)
   * @returns {string} Data URL for thumbnail
   */
  getThumbnail() {
    return this.dataUrl // In production, could generate smaller version
  }

  /**
   * Get photo as plain object (for storage)
   * @returns {Object} Photo data
   */
  toJSON() {
    return {
      id: this.id,
      albumId: this.albumId,
      name: this.name,
      dataUrl: this.dataUrl,
      format: this.format,
      position: this.position,
      createdAt: this.createdAt
    }
  }

  /**
   * Create Photo from stored object
   * @param {Object} data - Photo data from storage
   * @returns {Photo} Photo instance
   */
  static fromJSON(data) {
    return new Photo(
      data.albumId,
      data.name,
      data.dataUrl,
      data.format,
      data.id,
      data.position,
      data.createdAt
    )
  }

  /**
   * String representation
   * @returns {string} Human readable photo info
   */
  toString() {
    return `Photo: ${this.name} (${this.format}, ${this.getEstimatedSize()} bytes)`
  }
}
