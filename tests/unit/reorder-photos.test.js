/**
 * Tests for photo reordering functionality
 */
import { Photo } from '../../src/models/Photo.js'
import { StorageService } from '../../src/services/StorageService.js'
import { Album } from '../../src/models/Album.js'

describe('Photo Reordering', () => {
  let storageService

  beforeAll(async () => {
    // Create one instance for all tests
    storageService = new StorageService()
    await storageService.init()
  })

  describe('Position calculations', () => {
    it('should maintain sequential positions when moving forward', async () => {
      // Create album
      const album = new Album('Test Album 1')
      const createdAlbum = await storageService.createAlbum(album)

      // Create 5 photos
      const photos = []
      for (let i = 0; i < 5; i++) {
        const photo = await storageService.createPhoto(createdAlbum.id, `Photo ${i}`, `data:image/jpeg;base64,test${i}`, 'image/jpeg')
        photos.push(photo)
      }

      // Verify initial positions
      expect(photos[0].position).toBe(0)
      expect(photos[1].position).toBe(1)
      expect(photos[2].position).toBe(2)
      expect(photos[3].position).toBe(3)
      expect(photos[4].position).toBe(4)

      // Simulate move: photo[1] to position 3
      // Expected: [0, 2→1, 3→2, 1→3, 4]
      const moves = []
      const currentPosition = photos[1].position
      const newPosition = 3

      // Moving forward: shift items between old and new position backward
      for (let i = currentPosition + 1; i <= newPosition; i++) {
        const photo = photos.find(p => p.position === i)
        if (photo) {
          moves.push({ photoId: photo.id, newPosition: i - 1 })
        }
      }
      moves.push({ photoId: photos[1].id, newPosition })

      // Apply moves
      await storageService.reorderPhotos(createdAlbum.id, moves)

      // Verify new positions
      const updated = await storageService.getPhotosByAlbum(createdAlbum.id)
      expect(updated.find(p => p.id === photos[1].id).position).toBe(3)
      expect(updated.find(p => p.id === photos[2].id).position).toBe(1)
      expect(updated.find(p => p.id === photos[3].id).position).toBe(2)
    })

    it('should maintain sequential positions when moving backward', async () => {
      // Create album
      const album = new Album('Test Album 2')
      const createdAlbum = await storageService.createAlbum(album)

      // Create 5 photos
      const photos = []
      for (let i = 0; i < 5; i++) {
        const photo = await storageService.createPhoto(createdAlbum.id, `Photo ${i}`, `data:image/jpeg;base64,test${i}`, 'image/jpeg')
        photos.push(photo)
      }

      // Simulate move: photo[3] to position 1
      // Expected: [0, 3→1, 1→2, 2→3, 4]
      const moves = []
      const currentPosition = photos[3].position
      const newPosition = 1

      // Moving backward: shift items between new and old position forward
      for (let i = newPosition; i < currentPosition; i++) {
        const photo = photos.find(p => p.position === i)
        if (photo) {
          moves.push({ photoId: photo.id, newPosition: i + 1 })
        }
      }
      moves.push({ photoId: photos[3].id, newPosition })

      // Apply moves
      await storageService.reorderPhotos(createdAlbum.id, moves)

      // Verify new positions
      const updated = await storageService.getPhotosByAlbum(createdAlbum.id)
      expect(updated.find(p => p.id === photos[3].id).position).toBe(1)
      expect(updated.find(p => p.id === photos[1].id).position).toBe(2)
      expect(updated.find(p => p.id === photos[2].id).position).toBe(3)
    })

    it('should have no gaps in positions after reorder', async () => {
      // Create album
      const album = new Album('Test Album 3')
      const createdAlbum = await storageService.createAlbum(album)

      // Create 4 photos
      const photos = []
      for (let i = 0; i < 4; i++) {
        const photo = await storageService.createPhoto(createdAlbum.id, `Photo ${i}`, `data:image/jpeg;base64,test${i}`, 'image/jpeg')
        photos.push(photo)
      }

      // Do a complex reorder: last to first
      const moves = [
        { photoId: photos[0].id, newPosition: 1 },
        { photoId: photos[1].id, newPosition: 2 },
        { photoId: photos[2].id, newPosition: 3 },
        { photoId: photos[3].id, newPosition: 0 }
      ]

      await storageService.reorderPhotos(createdAlbum.id, moves)

      // Get updated positions
      const updated = await storageService.getPhotosByAlbum(createdAlbum.id)
      const positions = updated.map(p => p.position).sort((a, b) => a - b)

      // Check for no gaps
      expect(positions).toEqual([0, 1, 2, 3])
      expect(new Set(positions).size).toBe(4)
    })
  })

  describe('Photo sorting', () => {
    it('should return photos sorted by position', async () => {
      // Create album
      const album = new Album('Test Album 4')
      const createdAlbum = await storageService.createAlbum(album)

      // Create 3 photos
      const photos = []
      for (let i = 0; i < 3; i++) {
        const photo = await storageService.createPhoto(createdAlbum.id, `Photo ${i}`, `data:image/jpeg;base64,test${i}`, 'image/jpeg')
        photos.push(photo)
      }

      // Reorder to reverse
      const moves = [
        { photoId: photos[0].id, newPosition: 2 },
        { photoId: photos[1].id, newPosition: 1 },
        { photoId: photos[2].id, newPosition: 0 }
      ]

      await storageService.reorderPhotos(createdAlbum.id, moves)

      // Get photos - should be sorted by position
      const updated = await storageService.getPhotosByAlbum(createdAlbum.id)

      // Verify order
      expect(updated[0].id).toBe(photos[2].id)
      expect(updated[1].id).toBe(photos[1].id)
      expect(updated[2].id).toBe(photos[0].id)
    })

    it('should persist position changes across retrieval', async () => {
      // Create album
      const album = new Album('Test Album 5')
      const createdAlbum = await storageService.createAlbum(album)

      // Create 2 photos
      const photo1 = await storageService.createPhoto(createdAlbum.id, 'Photo 1', 'data:image/jpeg;base64,test1', 'image/jpeg')
      const photo2 = await storageService.createPhoto(createdAlbum.id, 'Photo 2', 'data:image/jpeg;base64,test2', 'image/jpeg')

      // Swap positions
      await storageService.reorderPhotos(createdAlbum.id, [
        { photoId: photo2.id, newPosition: 0 },
        { photoId: photo1.id, newPosition: 1 }
      ])

      // Retrieve multiple times - should be consistent
      const first = await storageService.getPhotosByAlbum(createdAlbum.id)
      const second = await storageService.getPhotosByAlbum(createdAlbum.id)

      expect(first[0].id).toBe(photo2.id)
      expect(first[1].id).toBe(photo1.id)
      expect(second[0].id).toBe(photo2.id)
      expect(second[1].id).toBe(photo1.id)
    })
  })
})

