/**
 * Tests for photo moving between albums
 */
import { StorageService } from '../../src/services/StorageService.js'

describe('Photo Moving Between Albums', () => {
  let storageService

  beforeAll(async () => {
    // Create one instance for all tests
    storageService = new StorageService()
    await storageService.init()
  })

  describe('movePhoto()', () => {
    it('should move photo between albums with correct albumId', async () => {
      // Create albums
      const createdAlbum1 = await storageService.createAlbum('Album 1 Move Test')
      const createdAlbum2 = await storageService.createAlbum('Album 2 Move Test')

      // Create photo in album 1
      const photo = await storageService.createPhoto(createdAlbum1.id, 'Photo to Move', 'data:image/jpeg;base64,test', 'image/jpeg')

      // Initial state
      expect(photo.albumId).toBe(createdAlbum1.id)
      expect(photo.position).toBe(0)

      // Move to album 2
      await storageService.movePhoto(photo.id, createdAlbum2.id)

      // Verify photo was moved
      const movedPhoto = (await storageService.getPhotosByAlbum(createdAlbum2.id))[0]
      expect(movedPhoto.albumId).toBe(createdAlbum2.id)
    })

    it('should update album photo counts after move', async () => {
      // Create albums
      const createdAlbum1 = await storageService.createAlbum('Album 1 Count Test')
      const createdAlbum2 = await storageService.createAlbum('Album 2 Count Test')

      // Create 2 photos in album 1
      const photo1 = await storageService.createPhoto(createdAlbum1.id, 'Photo 1', 'data:image/jpeg;base64,test1', 'image/jpeg')
      const photo2 = await storageService.createPhoto(createdAlbum1.id, 'Photo 2', 'data:image/jpeg;base64,test2', 'image/jpeg')

      // Verify initial counts by checking storage
      let album1Photos = await storageService.getPhotosByAlbum(createdAlbum1.id)
      let album2Photos = await storageService.getPhotosByAlbum(createdAlbum2.id)
      expect(album1Photos.length).toBe(2)
      expect(album2Photos.length).toBe(0)

      // Move photo1 to album2
      await storageService.movePhoto(photo1.id, createdAlbum2.id)

      // Verify counts after move
      album1Photos = await storageService.getPhotosByAlbum(createdAlbum1.id)
      album2Photos = await storageService.getPhotosByAlbum(createdAlbum2.id)

      expect(album1Photos.length).toBe(1)
      expect(album2Photos.length).toBe(1)
    })

    it('should reorder source album positions after move', async () => {
      // Create albums
      const createdAlbum1 = await storageService.createAlbum('Album 1 Reorder Test')
      const createdAlbum2 = await storageService.createAlbum('Album 2 Reorder Test')

      // Create 3 photos in album 1
      const photos = []
      for (let i = 0; i < 3; i++) {
        const photo = await storageService.createPhoto(createdAlbum1.id, `Photo ${i}`, `data:image/jpeg;base64,test${i}`, 'image/jpeg')
        photos.push(photo)
      }

      // Verify initial positions
      let album1Photos = await storageService.getPhotosByAlbum(createdAlbum1.id)
      expect(album1Photos[0].position).toBe(0)
      expect(album1Photos[1].position).toBe(1)
      expect(album1Photos[2].position).toBe(2)

      // Move middle photo (position 1) to album 2
      await storageService.movePhoto(photos[1].id, createdAlbum2.id)

      // Check reordering in source album
      album1Photos = await storageService.getPhotosByAlbum(createdAlbum1.id)
      expect(album1Photos.length).toBe(2)
      expect(album1Photos[0].position).toBe(0)
      expect(album1Photos[1].position).toBe(1)

      // Verify no gaps
      const positions = album1Photos.map(p => p.position).sort((a, b) => a - b)
      expect(positions).toEqual([0, 1])
    })

    it('should assign correct position to moved photo in target album', async () => {
      // Create albums
      const createdAlbum1 = await storageService.createAlbum('Album 1 Position Test')
      const createdAlbum2 = await storageService.createAlbum('Album 2 Position Test')

      // Create photos in album 2 first
      const existing = await storageService.createPhoto(createdAlbum2.id, 'Existing', 'data:image/jpeg;base64,existing', 'image/jpeg')

      // Create photo in album 1
      const toMove = await storageService.createPhoto(createdAlbum1.id, 'To Move', 'data:image/jpeg;base64,tomove', 'image/jpeg')

      // Move to album 2
      await storageService.movePhoto(toMove.id, createdAlbum2.id)

      // Check position in target album
      const album2Photos = await storageService.getPhotosByAlbum(createdAlbum2.id)
      const movedPhoto = album2Photos.find(p => p.id === toMove.id)

      // Should be added at end (position 1)
      expect(movedPhoto.position).toBe(1)
      expect(album2Photos.length).toBe(2)
    })

    it('should persist move across storage retrieval', async () => {
      // Create albums
      const createdAlbum1 = await storageService.createAlbum('Album 1 Persist Test')
      const createdAlbum2 = await storageService.createAlbum('Album 2 Persist Test')

      // Create and move photo
      const photo = await storageService.createPhoto(createdAlbum1.id, 'Persist Photo', 'data:image/jpeg;base64,persist', 'image/jpeg')
      await storageService.movePhoto(photo.id, createdAlbum2.id)

      // Retrieve multiple times - should be consistent
      const first = await storageService.getPhotosByAlbum(createdAlbum2.id)
      const second = await storageService.getPhotosByAlbum(createdAlbum2.id)

      expect(first[0].id).toBe(photo.id)
      expect(first[0].albumId).toBe(createdAlbum2.id)
      expect(second[0].id).toBe(photo.id)
      expect(second[0].albumId).toBe(createdAlbum2.id)
    })
  })
})
