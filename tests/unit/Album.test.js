/**
 * Album Model Tests
 */
import { Album } from '../../src/models/Album.js'

describe('Album', () => {
  describe('constructor', () => {
    it('should create an album with valid name', () => {
      const album = new Album('My Album')
      expect(album.name).toBe('My Album')
      expect(album.id).toBeTruthy()
      expect(album.createdAt).toBeTruthy()
      expect(album.photoCount).toBe(0)
    })

    it('should trim whitespace from name', () => {
      const album = new Album('  My Album  ')
      expect(album.name).toBe('My Album')
    })

    it('should throw error for empty name', () => {
      expect(() => new Album('')).toThrow()
      expect(() => new Album('   ')).toThrow()
    })

    it('should throw error for non-string name', () => {
      expect(() => new Album(123)).toThrow()
      expect(() => new Album(null)).toThrow()
    })

    it('should throw error for name exceeding max length', () => {
      const longName = 'a'.repeat(256)
      expect(() => new Album(longName)).toThrow()
    })

    it('should accept optional id and createdAt', () => {
      const id = '12345'
      const now = Date.now()
      const album = new Album('Test', id, now)
      expect(album.id).toBe(id)
      expect(album.createdAt).toBe(now)
    })
  })

  describe('validateName', () => {
    it('should validate correct names', () => {
      const album = new Album('Test')
      expect(() => album.validateName('Valid Name')).not.toThrow()
    })

    it('should reject invalid names', () => {
      const album = new Album('Test')
      expect(() => album.validateName('')).toThrow()
      expect(() => album.validateName(123)).toThrow()
      expect(() => album.validateName('a'.repeat(256))).toThrow()
    })
  })

  describe('rename', () => {
    it('should rename album', () => {
      const album = new Album('Old Name')
      album.rename('New Name')
      expect(album.name).toBe('New Name')
    })

    it('should trim name on rename', () => {
      const album = new Album('Test')
      album.rename('  New Name  ')
      expect(album.name).toBe('New Name')
    })

    it('should throw on invalid new name', () => {
      const album = new Album('Test')
      expect(() => album.rename('')).toThrow()
      expect(() => album.rename('a'.repeat(256))).toThrow()
    })
  })

  describe('toJSON and fromJSON', () => {
    it('should serialize and deserialize correctly', () => {
      const album1 = new Album('Test Album', '123', 9999, 5)
      const json = album1.toJSON()

      expect(json).toEqual({
        id: '123',
        name: 'Test Album',
        createdAt: 9999,
        photoCount: 5
      })

      const album2 = Album.fromJSON(json)
      expect(album2.id).toBe(album1.id)
      expect(album2.name).toBe(album1.name)
      expect(album2.createdAt).toBe(album1.createdAt)
      expect(album2.photoCount).toBe(album1.photoCount)
    })
  })

  describe('isValidName static method', () => {
    it('should validate names correctly', () => {
      expect(Album.isValidName('Valid Name')).toBe(true)
      expect(Album.isValidName('a'.repeat(255))).toBe(true)
      expect(Album.isValidName('')).toBe(false)
      expect(Album.isValidName('   ')).toBe(false)
      expect(Album.isValidName('a'.repeat(256))).toBe(false)
      expect(Album.isValidName(123)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return string representation', () => {
      const album = new Album('My Album')
      album.photoCount = 3
      const str = album.toString()
      expect(str).toContain('My Album')
      expect(str).toContain('3 photos')
    })
  })
})
