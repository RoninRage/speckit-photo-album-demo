/**
 * @jest-environment jsdom
 */

import { storageService } from '../../src/services/StorageService.js'

describe('Data Persistence', () => {
  beforeEach(async () => {
    // Clear any existing data
    await storageService.init()
    const albums = await storageService.getAllAlbums()
    for (const album of albums) {
      await storageService.deleteAlbum(album.id)
    }
  })

  test('should persist album creation to IndexedDB', async () => {
    // Create an album
    const album = await storageService.createAlbum('Test Album')

    expect(album).toHaveProperty('id')
    expect(album.name).toBe('Test Album')

    // Verify it's persisted
    const albums = await storageService.getAllAlbums()
    expect(albums).toHaveLength(1)
    expect(albums[0].id).toBe(album.id)
    expect(albums[0].name).toBe('Test Album')
  })

  test('should load albums from IndexedDB', async () => {
    // Create multiple albums
    const album1 = await storageService.createAlbum('Album 1')
    const album2 = await storageService.createAlbum('Album 2')

    // Retrieve all albums
    const albums = await storageService.getAllAlbums()

    expect(albums).toHaveLength(2)
    expect(albums.find(a => a.id === album1.id)).toBeDefined()
    expect(albums.find(a => a.id === album2.id)).toBeDefined()
  })

  test('should persist album deletion', async () => {
    // Create an album
    const album = await storageService.createAlbum('To Delete')

    // Verify it exists
    let albums = await storageService.getAllAlbums()
    expect(albums).toHaveLength(1)

    // Delete it
    await storageService.deleteAlbum(album.id)

    // Verify it's gone
    albums = await storageService.getAllAlbums()
    expect(albums).toHaveLength(0)
  })

  test('should persist album updates', async () => {
    // Create an album
    const album = await storageService.createAlbum('Original Name')

    // Update it
    const updatedAlbum = {
      ...album,
      name: 'Updated Name',
      coverPhoto: 'data:image/png;base64,test'
    }
    await storageService.updateAlbum(updatedAlbum)

    // Verify update persisted
    const albums = await storageService.getAllAlbums()
    expect(albums[0].name).toBe('Updated Name')
    expect(albums[0].coverPhoto).toBe('data:image/png;base64,test')
  })

  test('should persist photo creation', async () => {
    // Create an album first
    const album = await storageService.createAlbum('Photo Album')

    // Create a photo
    const photo = await storageService.createPhoto({
      albumId: album.id,
      name: 'test.png',
      dataUrl: 'data:image/png;base64,iVBORw0KGgo',
      size: 1024,
      type: 'image/png'
    })

    expect(photo).toHaveProperty('id')
    expect(photo.name).toBe('test.png')
    expect(photo.albumId).toBe(album.id)

    // Verify it's persisted
    const photos = await storageService.getAllPhotos()
    expect(photos).toHaveLength(1)
    expect(photos[0].id).toBe(photo.id)
  })

  test('should handle empty storage on first load', async () => {
    // Clear all albums (already done in beforeEach)
    const albums = await storageService.getAllAlbums()
    expect(albums).toHaveLength(0)

    const photos = await storageService.getAllPhotos()
    expect(photos).toHaveLength(0)
  })

  test('should maintain data across re-initialization', async () => {
    // Create album
    const album = await storageService.createAlbum('Persistent Album')

    // Re-initialize storage
    await storageService.init()

    // Verify data still exists
    const albums = await storageService.getAllAlbums()
    expect(albums).toHaveLength(1)
    expect(albums[0].name).toBe('Persistent Album')
  })

  test('should get album by ID', async () => {
    // Create an album
    const album = await storageService.createAlbum('Find Me')

    // Get it by ID
    const found = await storageService.getAlbumById(album.id)

    expect(found).toBeDefined()
    expect(found.id).toBe(album.id)
    expect(found.name).toBe('Find Me')
  })

  test('should return null for non-existent album', async () => {
    const found = await storageService.getAlbumById('non-existent-id')
    expect(found).toBeNull()
  })

  test('should delete all photos when album is deleted', async () => {
    // Create album with photo
    const album = await storageService.createAlbum('Album to Delete')
    await storageService.createPhoto({
      albumId: album.id,
      name: 'photo.jpg',
      dataUrl: 'data:image/jpeg;base64,test',
      size: 500,
      type: 'image/jpeg'
    })

    // Verify photo exists
    let photos = await storageService.getAllPhotos()
    expect(photos).toHaveLength(1)

    // Delete album
    await storageService.deleteAlbum(album.id)

    // Verify photos are also deleted
    photos = await storageService.getAllPhotos()
    expect(photos).toHaveLength(0)
  })
})
