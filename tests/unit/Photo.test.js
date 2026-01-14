/**
 * Photo Model Tests
 */
import { Photo } from '../../src/models/Photo.js'

describe('Photo', () => {
  const validAlbumId = 'album-123'
  const validDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwwDAwwGBAMDAwwMEAwOEwsRCBEPDwsRDBESDAxSUVES'

  describe('constructor', () => {
    it('should create a photo with valid parameters', () => {
      const photo = new Photo(validAlbumId, 'photo.jpg', validDataUrl, 'JPEG')
      expect(photo.albumId).toBe(validAlbumId)
      expect(photo.name).toBe('photo.jpg')
      expect(photo.format).toBe('JPEG')
      expect(photo.position).toBe(0)
      expect(photo.id).toBeTruthy()
      expect(photo.createdAt).toBeTruthy()
    })

    it('should throw error for invalid albumId', () => {
      expect(() => new Photo('', 'test.jpg', validDataUrl)).toThrow()
      expect(() => new Photo(null, 'test.jpg', validDataUrl)).toThrow()
    })

    it('should throw error for invalid name', () => {
      expect(() => new Photo(validAlbumId, '', validDataUrl)).toThrow()
      expect(() => new Photo(validAlbumId, '   ', validDataUrl)).toThrow()
    })

    it('should throw error for invalid dataUrl', () => {
      expect(() => new Photo(validAlbumId, 'test.jpg', 'invalid')).toThrow()
      expect(() => new Photo(validAlbumId, 'test.jpg', 'data:text/plain;base64,test')).toThrow()
    })

    it('should auto-detect format from dataUrl', () => {
      const jpegUrl = 'data:image/jpeg;base64,test'
      const pngUrl = 'data:image/png;base64,test'
      const webpUrl = 'data:image/webp;base64,test'

      const photo1 = new Photo(validAlbumId, 'test.jpg', jpegUrl)
      const photo2 = new Photo(validAlbumId, 'test.png', pngUrl)
      const photo3 = new Photo(validAlbumId, 'test.webp', webpUrl)

      expect(photo1.format).toBe('JPEG')
      expect(photo2.format).toBe('PNG')
      expect(photo3.format).toBe('WebP')
    })

    it('should trim name and accept optional parameters', () => {
      const photo = new Photo(validAlbumId, '  photo.jpg  ', validDataUrl, 'JPEG', 'id-123', 5, 9999)
      expect(photo.name).toBe('photo.jpg')
      expect(photo.id).toBe('id-123')
      expect(photo.position).toBe(5)
      expect(photo.createdAt).toBe(9999)
    })
  })

  describe('moveTo', () => {
    it('should move photo to different album', () => {
      const photo = new Photo(validAlbumId, 'test.jpg', validDataUrl)
      const newAlbumId = 'album-456'

      photo.moveTo(newAlbumId)
      expect(photo.albumId).toBe(newAlbumId)
    })

    it('should move with new position', () => {
      const photo = new Photo(validAlbumId, 'test.jpg', validDataUrl, 'JPEG', undefined, 0)
      photo.moveTo('album-456', 10)

      expect(photo.albumId).toBe('album-456')
      expect(photo.position).toBe(10)
    })

    it('should throw for invalid albumId', () => {
      const photo = new Photo(validAlbumId, 'test.jpg', validDataUrl)
      expect(() => photo.moveTo('')).toThrow()
    })
  })

  describe('setPosition', () => {
    it('should set valid position', () => {
      const photo = new Photo(validAlbumId, 'test.jpg', validDataUrl)
      photo.setPosition(5)
      expect(photo.position).toBe(5)
    })

    it('should throw for negative position', () => {
      const photo = new Photo(validAlbumId, 'test.jpg', validDataUrl)
      expect(() => photo.setPosition(-1)).toThrow()
    })

    it('should throw for non-integer position', () => {
      const photo = new Photo(validAlbumId, 'test.jpg', validDataUrl)
      expect(() => photo.setPosition(1.5)).toThrow()
      expect(() => photo.setPosition('5')).toThrow()
    })
  })

  describe('getEstimatedSize', () => {
    it('should calculate size from base64 data', () => {
      const photo = new Photo(validAlbumId, 'test.jpg', validDataUrl)
      const size = photo.getEstimatedSize()
      expect(size).toBeGreaterThan(0)
      expect(typeof size).toBe('number')
    })
  })

  describe('getThumbnail', () => {
    it('should return data URL (same as full in simple implementation)', () => {
      const photo = new Photo(validAlbumId, 'test.jpg', validDataUrl)
      expect(photo.getThumbnail()).toBe(validDataUrl)
    })
  })

  describe('toJSON and fromJSON', () => {
    it('should serialize and deserialize correctly', () => {
      const photo1 = new Photo(validAlbumId, 'test.jpg', validDataUrl, 'JPEG', 'id-123', 5, 9999)
      const json = photo1.toJSON()

      expect(json).toEqual({
        id: 'id-123',
        albumId: validAlbumId,
        name: 'test.jpg',
        dataUrl: validDataUrl,
        format: 'JPEG',
        position: 5,
        createdAt: 9999
      })

      const photo2 = Photo.fromJSON(json)
      expect(photo2.id).toBe(photo1.id)
      expect(photo2.albumId).toBe(photo1.albumId)
      expect(photo2.name).toBe(photo1.name)
      expect(photo2.position).toBe(photo1.position)
    })
  })

  describe('isValidFormat', () => {
    it('should validate formats', () => {
      expect(Photo.isValidFormat('JPEG')).toBe(true)
      expect(Photo.isValidFormat('PNG')).toBe(true)
      expect(Photo.isValidFormat('WebP')).toBe(true)
      expect(Photo.isValidFormat('GIF')).toBe(false)
      expect(Photo.isValidFormat('INVALID')).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return string representation', () => {
      const photo = new Photo(validAlbumId, 'test.jpg', validDataUrl, 'JPEG')
      const str = photo.toString()
      expect(str).toContain('test.jpg')
      expect(str).toContain('JPEG')
    })
  })
})
