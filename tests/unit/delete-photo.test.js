/**
 * Delete Photo Tests
 * Tests for photo deletion functionality with position reordering
 */
import { storageService } from '../../src/services/StorageService.js'
import { Album } from '../../src/models/Album.js'
import { Photo } from '../../src/models/Photo.js'

describe('Delete Photo', () => {
  beforeEach(async () => {
    // Clear storage before each test
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase('PhotoAlbumDB')
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })

    // Reinitialize storage
    await storageService.init()
  })

  afterEach(async () => {
    // Clear storage after each test
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase('PhotoAlbumDB')
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  })

  test('Photo deleted successfully', async () => {
    // Create album
    const album = await storageService.createAlbum('Test Album')
    expect(album).toBeDefined()
    expect(album.photoCount).toBe(0)

    // Create multiple photos
    const photo1 = await storageService.createPhoto(album.id, 'photo1.jpg', 'data:image/jpeg;base64,test1')
    const photo2 = await storageService.createPhoto(album.id, 'photo2.jpg', 'data:image/jpeg;base64,test2')
    const photo3 = await storageService.createPhoto(album.id, 'photo3.jpg', 'data:image/jpeg;base64,test3')

    // Verify album count
    let albums = await storageService.getAllAlbums()
    const updatedAlbum = albums.find(a => a.id === album.id)
    expect(updatedAlbum.photoCount).toBe(3)

    // Get photos
    let photos = await storageService.getPhotosByAlbum(album.id)
    expect(photos).toHaveLength(3)
    expect(photos[0].id).toBe(photo1.id)
    expect(photos[1].id).toBe(photo2.id)
    expect(photos[2].id).toBe(photo3.id)

    // Delete middle photo
    await storageService.deletePhoto(photo2.id)

    // Verify photo count decreased
    albums = await storageService.getAllAlbums()
    const albumAfterDelete = albums.find(a => a.id === album.id)
    expect(albumAfterDelete.photoCount).toBe(2)

    // Verify remaining photos
    photos = await storageService.getPhotosByAlbum(album.id)
    expect(photos).toHaveLength(2)
    expect(photos.map(p => p.id)).not.toContain(photo2.id)
  })

  test('Positions reorder after photo deletion', async () => {
    // Create album with 3 photos
    const album = await storageService.createAlbum('Test Album')
    const photo1 = await storageService.createPhoto(album.id, 'photo1.jpg', 'data:image/jpeg;base64,test1')
    const photo2 = await storageService.createPhoto(album.id, 'photo2.jpg', 'data:image/jpeg;base64,test2')
    const photo3 = await storageService.createPhoto(album.id, 'photo3.jpg', 'data:image/jpeg;base64,test3')

    // Initial positions should be 0, 1, 2
    let photos = await storageService.getPhotosByAlbum(album.id)
    expect(photos[0].position).toBe(0)
    expect(photos[1].position).toBe(1)
    expect(photos[2].position).toBe(2)

    // Delete photo at position 1
    await storageService.deletePhoto(photo2.id)

    // Remaining photos should have positions 0, 1 (not 0, 2)
    photos = await storageService.getPhotosByAlbum(album.id)
    expect(photos).toHaveLength(2)
    expect(photos[0].position).toBe(0)
    expect(photos[1].position).toBe(1)
  })

  test('Deletion persists across storage retrieval', async () => {
    // Create album with photos
    const album = await storageService.createAlbum('Test Album')
    const photo1 = await storageService.createPhoto(album.id, 'photo1.jpg', 'data:image/jpeg;base64,test1')
    const photo2 = await storageService.createPhoto(album.id, 'photo2.jpg', 'data:image/jpeg;base64,test2')

    // Delete one photo
    await storageService.deletePhoto(photo1.id)

    // Retrieve again and verify deletion persisted
    const photos = await storageService.getPhotosByAlbum(album.id)
    expect(photos).toHaveLength(1)
    expect(photos[0].id).toBe(photo2.id)
    expect(photos[0].position).toBe(0)
  })

  test('Deleting only photo shows empty album', async () => {
    // Create album with single photo
    const album = await storageService.createAlbum('Test Album')
    const photo = await storageService.createPhoto(album.id, 'photo.jpg', 'data:image/jpeg;base64,test')

    // Verify album count
    let albums = await storageService.getAllAlbums()
    let updatedAlbum = albums.find(a => a.id === album.id)
    expect(updatedAlbum.photoCount).toBe(1)

    // Delete photo
    await storageService.deletePhoto(photo.id)

    // Verify album is empty
    albums = await storageService.getAllAlbums()
    updatedAlbum = albums.find(a => a.id === album.id)
    expect(updatedAlbum.photoCount).toBe(0)

    const photos = await storageService.getPhotosByAlbum(album.id)
    expect(photos).toHaveLength(0)
  })

  test('Delete non-existent photo throws error', async () => {
    // Attempt to delete non-existent photo
    try {
      await storageService.deletePhoto('non-existent-id')
      // If we get here without error, test fails
      expect(true).toBe(false)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
