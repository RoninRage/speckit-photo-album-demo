/**
 * FileService
 * Handles file validation, conversion, and processing
 */
import {
  SUPPORTED_FORMATS,
  SUPPORTED_FORMAT_EXTENSIONS,
  MAX_FILE_SIZE,
  MIN_FILE_SIZE,
  ERROR_MESSAGES
} from '../utils/constants.js'

export class FileService {
  /**
   * Validate a File object
   * @param {File} file - File to validate
   * @throws {Error} If file is invalid
   * @returns {Object} Validation result {valid: true, name, size, format}
   */
  static validateFile(file) {
    if (!(file instanceof File)) {
      throw new Error('Invalid file object')
    }

    // Check file size
    if (file.size < MIN_FILE_SIZE) {
      throw new Error(ERROR_MESSAGES.FILE_EMPTY)
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE)
    }

    // Check file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE)
    }

    // Extract and validate extension
    const extension = this.getExtension(file.name)
    const validExtensions = SUPPORTED_FORMAT_EXTENSIONS[file.type] || []
    if (!validExtensions.includes(extension.toLowerCase())) {
      throw new Error(ERROR_MESSAGES.INVALID_FILE_TYPE)
    }

    return {
      valid: true,
      name: file.name,
      size: file.size,
      format: file.type,
      extension
    }
  }

  /**
   * Get file extension from filename
   * @param {string} filename - Filename
   * @returns {string} Extension without dot (e.g., 'jpg')
   */
  static getExtension(filename) {
    if (typeof filename !== 'string') return ''
    const parts = filename.split('.')
    return parts.length > 1 ? parts[parts.length - 1] : ''
  }

  /**
   * Get base filename without extension
   * @param {string} filename - Filename
   * @returns {string} Basename (e.g., 'photo' from 'photo.jpg')
   */
  static getBasename(filename) {
    if (typeof filename !== 'string') return ''
    const lastDot = filename.lastIndexOf('.')
    return lastDot > 0 ? filename.substring(0, lastDot) : filename
  }

  /**
   * Read file as data URL (base64)
   * @param {File} file - File to read
   * @returns {Promise<string>} Data URL string
   * @throws {Error} If file read fails
   */
  static readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onerror = () => {
        reject(new Error(ERROR_MESSAGES.READ_ERROR))
      }

      reader.onload = () => {
        resolve(reader.result)
      }

      try {
        reader.readAsDataURL(file)
      } catch (e) {
        reject(new Error(ERROR_MESSAGES.READ_ERROR))
      }
    })
  }

  /**
   * Read file as text
   * @param {File} file - File to read
   * @returns {Promise<string>} File contents as string
   * @throws {Error} If file read fails
   */
  static readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onerror = () => {
        reject(new Error(ERROR_MESSAGES.READ_ERROR))
      }

      reader.onload = () => {
        resolve(reader.result)
      }

      try {
        reader.readAsText(file)
      } catch (e) {
        reject(new Error(ERROR_MESSAGES.READ_ERROR))
      }
    })
  }

  /**
   * Read file as ArrayBuffer
   * @param {File} file - File to read
   * @returns {Promise<ArrayBuffer>} File contents as ArrayBuffer
   * @throws {Error} If file read fails
   */
  static readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onerror = () => {
        reject(new Error(ERROR_MESSAGES.READ_ERROR))
      }

      reader.onload = () => {
        resolve(reader.result)
      }

      try {
        reader.readAsArrayBuffer(file)
      } catch (e) {
        reject(new Error(ERROR_MESSAGES.READ_ERROR))
      }
    })
  }

  /**
   * Convert data URL to Blob
   * @param {string} dataUrl - Data URL string
   * @returns {Blob} Blob object
   */
  static dataUrlToBlob(dataUrl) {
    try {
      const arr = dataUrl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      const n = bstr.length
      const u8arr = new Uint8Array(n)

      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i)
      }

      return new Blob([u8arr], { type: mime })
    } catch (e) {
      throw new Error('Failed to convert data URL to Blob')
    }
  }

  /**
   * Estimate storage needed for file
   * Base64 encoding increases size by ~1.33x
   * @param {number} fileSize - File size in bytes
   * @returns {number} Estimated storage in bytes
   */
  static estimateStorageSize(fileSize) {
    return Math.ceil((fileSize / 3) * 4) // base64 size + ~10% overhead
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @param {number} [decimals] - Decimal places (default 2)
   * @returns {string} Formatted size (e.g., '2.5 MB')
   */
  static formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, decimals)) / Math.pow(10, decimals) + ' ' + sizes[i]
  }

  /**
   * Check if file type is supported
   * @param {string} mimeType - MIME type (e.g., 'image/jpeg')
   * @returns {boolean} True if supported
   */
  static isSupportedType(mimeType) {
    return SUPPORTED_FORMATS.includes(mimeType)
  }

  /**
   * Check if filename is supported
   * @param {string} filename - Filename
   * @returns {boolean} True if supported
   */
  static isSupportedFilename(filename) {
    const extension = this.getExtension(filename).toLowerCase()
    return Object.values(SUPPORTED_FORMAT_EXTENSIONS).some(exts =>
      exts.includes(extension)
    )
  }

  /**
   * Get MIME type from filename
   * @param {string} filename - Filename
   * @returns {string} MIME type or 'image/jpeg' as default
   */
  static getMimeTypeFromFilename(filename) {
    const extension = this.getExtension(filename).toLowerCase()
    for (const [mime, exts] of Object.entries(SUPPORTED_FORMAT_EXTENSIONS)) {
      if (exts.includes(extension)) {
        return mime
      }
    }
    return 'image/jpeg' // default
  }

  /**
   * Sanitize filename for storage
   * @param {string} filename - Original filename
   * @returns {string} Sanitized filename
   */
  static sanitizeFilename(filename) {
    if (typeof filename !== 'string') return 'photo'

    // Remove path separators
    let sanitized = filename.replace(/[\/\\]/g, '')

    // Remove special characters (keep alphanumeric, dash, underscore, dot)
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '')

    // Limit length
    if (sanitized.length > 255) {
      const ext = this.getExtension(sanitized)
      const basename = this.getBasename(sanitized).substring(0, 250 - ext.length)
      sanitized = ext ? `${basename}.${ext}` : basename
    }

    return sanitized || 'photo'
  }

  /**
   * Create file from blob
   * @param {Blob} blob - Blob object
   * @param {string} filename - Filename
   * @param {Object} [options] - File options
   * @returns {File} File object
   */
  static createFile(blob, filename, options = {}) {
    const opts = {
      type: blob.type || 'application/octet-stream',
      ...options
    }
    return new File([blob], filename, opts)
  }

  /**
   * Download blob as file
   * @param {Blob} blob - Blob to download
   * @param {string} filename - Suggested filename
   */
  static downloadBlob(blob, filename = 'download') {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Create canvas from image data URL
   * @param {string} dataUrl - Data URL
   * @returns {Promise<HTMLCanvasElement>} Canvas element
   */
  static async createCanvasFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        resolve(canvas)
      }

      img.src = dataUrl
    })
  }

  /**
   * Get image dimensions from data URL
   * @param {string} dataUrl - Data URL
   * @returns {Promise<{width: number, height: number}>} Image dimensions
   */
  static async getImageDimensions(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        })
      }

      img.src = dataUrl
    })
  }

  /**
   * Create thumbnail data URL from data URL
   * @param {string} dataUrl - Original data URL
   * @param {number} [maxWidth] - Max width (default 200)
   * @param {number} [maxHeight] - Max height (default 200)
   * @returns {Promise<string>} Thumbnail data URL
   */
  static async createThumbnail(dataUrl, maxWidth = 200, maxHeight = 200) {
    try {
      const canvas = await this.createCanvasFromDataUrl(dataUrl)
      const img = new Image()
      img.src = dataUrl

      // Calculate scaling
      const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height, 1)
      const newWidth = canvas.width * scale
      const newHeight = canvas.height * scale

      // Create thumbnail canvas
      const thumb = document.createElement('canvas')
      thumb.width = newWidth
      thumb.height = newHeight
      const ctx = thumb.getContext('2d')
      ctx.drawImage(canvas, 0, 0, newWidth, newHeight)

      return thumb.toDataURL('image/jpeg', 0.8)
    } catch (e) {
      // If thumbnail creation fails, return original
      return dataUrl
    }
  }
}
