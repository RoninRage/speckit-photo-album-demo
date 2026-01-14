/**
 * Album Entity
 * Represents a collection of photos
 */
export class Album {
  /**
   * Create a new Album instance
   * @param {string} name - Album name (1-255 characters)
   * @param {string} [id] - Optional UUID (auto-generated if not provided)
   * @param {number} [createdAt] - Optional creation timestamp (defaults to now)
   * @param {number} [photoCount] - Optional photo count (defaults to 0)
   */
  constructor(name, id, createdAt, photoCount) {
    this.validateName(name)
    
    this.id = id || this.generateId()
    this.name = name.trim()
    this.createdAt = createdAt || Date.now()
    this.photoCount = photoCount ?? 0
  }

  /**
   * Validate album name
   * @param {string} name - Name to validate
   * @throws {Error} If name is invalid
   */
  validateName(name) {
    if (typeof name !== 'string') {
      throw new Error('Album name must be a string')
    }
    if (name.trim().length === 0) {
      throw new Error('Album name cannot be empty')
    }
    if (name.length > 255) {
      throw new Error('Album name too long (max 255 characters)')
    }
  }

  /**
   * Check if a name is valid without throwing
   * @param {string} name - Name to validate
   * @returns {boolean} True if valid, false otherwise
   */
  static isValidName(name) {
    try {
      if (typeof name !== 'string') return false
      if (name.trim().length === 0) return false
      if (name.length > 255) return false
      return true
    } catch {
      return false
    }
  }

  /**
   * Rename the album
   * @param {string} newName - New album name
   * @throws {Error} If new name is invalid
   */
  rename(newName) {
    this.validateName(newName)
    this.name = newName.trim()
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
   * Get album as plain object (for storage)
   * @returns {Object} Album data
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      photoCount: this.photoCount
    }
  }

  /**
   * Create Album from stored object
   * @param {Object} data - Album data from storage
   * @returns {Album} Album instance
   */
  static fromJSON(data) {
    return new Album(data.name, data.id, data.createdAt, data.photoCount)
  }

  /**
   * String representation
   * @returns {string} Human readable album info
   */
  toString() {
    return `Album: ${this.name} (${this.photoCount} photos)`
  }
}
