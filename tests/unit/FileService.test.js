/**
 * FileService Tests
 */
import { FileService } from '../../src/services/FileService.js'

describe('FileService', () => {
  describe('validateFile', () => {
    it('should validate correct file', () => {
      const file = new File(['a'.repeat(1000)], 'photo.jpg', { type: 'image/jpeg' })
      const result = FileService.validateFile(file)
      expect(result.valid).toBe(true)
      expect(result.name).toBe('photo.jpg')
    })

    it('should reject non-File objects', () => {
      expect(() => FileService.validateFile({})).toThrow()
      expect(() => FileService.validateFile(null)).toThrow()
    })

    it('should reject empty files', () => {
      const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })
      expect(() => FileService.validateFile(file)).toThrow()
    })

    it('should reject unsupported file types', () => {
      const file = new File(['a'.repeat(1000)], 'video.mp4', { type: 'video/mp4' })
      expect(() => FileService.validateFile(file)).toThrow()
    })

    it('should accept JPEG, PNG, WebP', () => {
      const jpegFile = new File(['a'.repeat(1000)], 'photo.jpg', { type: 'image/jpeg' })
      const pngFile = new File(['a'.repeat(1000)], 'photo.png', { type: 'image/png' })
      const webpFile = new File(['a'.repeat(1000)], 'photo.webp', { type: 'image/webp' })

      expect(() => FileService.validateFile(jpegFile)).not.toThrow()
      expect(() => FileService.validateFile(pngFile)).not.toThrow()
      expect(() => FileService.validateFile(webpFile)).not.toThrow()
    })
  })

  describe('getExtension', () => {
    it('should extract extension', () => {
      expect(FileService.getExtension('photo.jpg')).toBe('jpg')
      expect(FileService.getExtension('document.pdf')).toBe('pdf')
      expect(FileService.getExtension('file.tar.gz')).toBe('gz')
    })

    it('should handle files without extension', () => {
      expect(FileService.getExtension('README')).toBe('')
    })

    it('should handle invalid input', () => {
      expect(FileService.getExtension(null)).toBe('')
      expect(FileService.getExtension(undefined)).toBe('')
    })
  })

  describe('getBasename', () => {
    it('should extract basename', () => {
      expect(FileService.getBasename('photo.jpg')).toBe('photo')
      expect(FileService.getBasename('my-photo.jpg')).toBe('my-photo')
    })

    it('should handle multiple dots', () => {
      expect(FileService.getBasename('file.tar.gz')).toBe('file.tar')
    })

    it('should handle no extension', () => {
      expect(FileService.getBasename('README')).toBe('README')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(FileService.formatFileSize(0)).toBe('0 Bytes')
      expect(FileService.formatFileSize(1024)).toContain('KB')
      expect(FileService.formatFileSize(1024 * 1024)).toContain('MB')
      expect(FileService.formatFileSize(1024 * 1024 * 1024)).toContain('GB')
    })

    it('should respect decimal places', () => {
      const result = FileService.formatFileSize(1536, 1) // 1.5 KB
      expect(result).toContain('1.5')
    })
  })

  describe('isSupportedType', () => {
    it('should identify supported types', () => {
      expect(FileService.isSupportedType('image/jpeg')).toBe(true)
      expect(FileService.isSupportedType('image/png')).toBe(true)
      expect(FileService.isSupportedType('image/webp')).toBe(true)
    })

    it('should reject unsupported types', () => {
      expect(FileService.isSupportedType('video/mp4')).toBe(false)
      expect(FileService.isSupportedType('text/plain')).toBe(false)
    })
  })

  describe('isSupportedFilename', () => {
    it('should check filename extensions', () => {
      expect(FileService.isSupportedFilename('photo.jpg')).toBe(true)
      expect(FileService.isSupportedFilename('photo.jpeg')).toBe(true)
      expect(FileService.isSupportedFilename('photo.png')).toBe(true)
      expect(FileService.isSupportedFilename('photo.webp')).toBe(true)
    })

    it('should reject unsupported extensions', () => {
      expect(FileService.isSupportedFilename('document.pdf')).toBe(false)
      expect(FileService.isSupportedFilename('video.mp4')).toBe(false)
    })

    it('should be case-insensitive', () => {
      expect(FileService.isSupportedFilename('PHOTO.JPG')).toBe(true)
      expect(FileService.isSupportedFilename('Photo.Jpg')).toBe(true)
    })
  })

  describe('getMimeTypeFromFilename', () => {
    it('should return MIME type from extension', () => {
      expect(FileService.getMimeTypeFromFilename('photo.jpg')).toBe('image/jpeg')
      expect(FileService.getMimeTypeFromFilename('photo.jpeg')).toBe('image/jpeg')
      expect(FileService.getMimeTypeFromFilename('photo.png')).toBe('image/png')
      expect(FileService.getMimeTypeFromFilename('photo.webp')).toBe('image/webp')
    })

    it('should default to JPEG for unknown', () => {
      expect(FileService.getMimeTypeFromFilename('unknown.xyz')).toBe('image/jpeg')
    })
  })

  describe('sanitizeFilename', () => {
    it('should remove special characters', () => {
      expect(FileService.sanitizeFilename('photo#$%@!.jpg')).not.toContain('#')
      expect(FileService.sanitizeFilename('photo#$%@!.jpg')).not.toContain('$')
    })

    it('should remove path separators', () => {
      expect(FileService.sanitizeFilename('folder/photo.jpg')).not.toContain('/')
      expect(FileService.sanitizeFilename('folder\\photo.jpg')).not.toContain('\\')
    })

    it('should keep alphanumeric, dash, underscore, dot', () => {
      const result = FileService.sanitizeFilename('my-photo_1.jpg')
      expect(result).toBe('my-photo_1.jpg')
    })

    it('should limit length to 255', () => {
      const longName = 'a'.repeat(300) + '.jpg'
      const result = FileService.sanitizeFilename(longName)
      expect(result.length).toBeLessThanOrEqual(255)
    })

    it('should default to "photo" if result empty', () => {
      expect(FileService.sanitizeFilename('!!!###')).toBe('photo')
      expect(FileService.sanitizeFilename('')).toBe('photo')
    })
  })

  describe('estimateStorageSize', () => {
    it('should estimate base64 overhead', () => {
      const estimated = FileService.estimateStorageSize(1000)
      expect(estimated).toBeGreaterThan(1000) // Should be ~1.33x
      expect(estimated).toBeLessThan(2000)
    })
  })

  describe('dataUrlToBlob', () => {
    it('should convert data URL to Blob', () => {
      const dataUrl = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      const blob = FileService.dataUrlToBlob(dataUrl)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/jpeg')
    })

    it('should throw on invalid data URL', () => {
      expect(() => FileService.dataUrlToBlob('invalid')).toThrow()
      expect(() => FileService.dataUrlToBlob('data:image/jpeg,invalid')).toThrow()
    })
  })
})
