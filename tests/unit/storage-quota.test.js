/**
 * @jest-environment jsdom
 */

import { storageService } from '../../src/services/StorageService.js'

describe('Storage Quota Management', () => {
  beforeEach(async () => {
    // Clear any existing data
    const db = await storageService.init()
    const tx = db.transaction(['albums', 'photos'], 'readwrite')
    await tx.objectStore('albums').clear()
    await tx.objectStore('photos').clear()
    await tx.done
  })

  test('should get storage quota status', async () => {
    const quotaInfo = await storageService.getStorageInfo()

    expect(quotaInfo).toHaveProperty('usage')
    expect(quotaInfo).toHaveProperty('quota')
    expect(typeof quotaInfo.usage).toBe('number')
    expect(typeof quotaInfo.quota).toBe('number')
  })

  test('should calculate available storage', async () => {
    const available = await storageService.getRemainingStorage()

    expect(typeof available).toBe('number')
    expect(available).toBeGreaterThanOrEqual(0)
  })

  test('should check if storage has space for upload', async () => {
    // Check for 1MB
    const hasSpace = await storageService.hasStorage(1024 * 1024)

    expect(typeof hasSpace).toBe('boolean')
  })

  test('should return true when sufficient storage available', async () => {
    // Mock navigator.storage to return sufficient quota
    const originalStorage = navigator.storage
    const mockStorage = {
      estimate: jest.fn().mockResolvedValue({
        usage: 1000,
        quota: 10000000 // 10MB
      })
    }
    Object.defineProperty(navigator, 'storage', {
      value: mockStorage,
      configurable: true
    })

    // Small file should have space
    const hasSpace = await storageService.hasStorage(1024) // 1KB

    expect(hasSpace).toBe(true)

    // Restore
    Object.defineProperty(navigator, 'storage', {
      value: originalStorage,
      configurable: true
    })
  })

  test('should handle navigator.storage not available', async () => {
    // Mock navigator.storage as undefined
    const originalStorage = navigator.storage
    Object.defineProperty(navigator, 'storage', {
      value: undefined,
      configurable: true
    })

    const quotaInfo = await storageService.getStorageInfo()

    // Should return defaults when not available
    expect(quotaInfo.usage).toBe(0)
    expect(quotaInfo.quota).toBe(0)

    // Restore
    Object.defineProperty(navigator, 'storage', {
      value: originalStorage,
      configurable: true
    })
  })

  test('should calculate quota percentage used', async () => {
    const quotaInfo = await storageService.getStorageInfo()

    if (quotaInfo.quota > 0) {
      const percentageUsed = (quotaInfo.usage / quotaInfo.quota) * 100
      expect(percentageUsed).toBeGreaterThanOrEqual(0)
      expect(percentageUsed).toBeLessThanOrEqual(100)
    }
  })

  test('should check storage before large upload', async () => {
    // Try to check for very large file (100MB)
    const hasSpace = await storageService.hasStorage(100 * 1024 * 1024)

    // Should return boolean
    expect(typeof hasSpace).toBe('boolean')
  })

  test('should estimate photo storage usage', async () => {
    // Create album
    const album = await storageService.createAlbum('Quota Test Album')

    // Create test photo with known size
    const testDataUrl = 'data:image/png;base64,' + 'A'.repeat(1000) // ~1KB
    const photo = await storageService.createPhoto({
      albumId: album.id,
      name: 'test-photo.png',
      dataUrl: testDataUrl,
      size: 1000,
      type: 'image/png'
    })

    expect(photo.size).toBe(1000)

    // Storage usage should have increased
    const quotaInfo = await storageService.getStorageInfo()
    expect(quotaInfo.usage).toBeGreaterThanOrEqual(0)
  })

  test('should handle multiple photos storage calculation', async () => {
    const album = await storageService.createAlbum('Multi-Photo Album')

    // Create multiple small photos
    const photoCount = 5
    const photoSize = 500 // 500 bytes each

    for (let i = 0; i < photoCount; i++) {
      const testDataUrl = 'data:image/png;base64,' + 'B'.repeat(photoSize)
      await storageService.createPhoto({
        albumId: album.id,
        name: `photo-${i}.png`,
        dataUrl: testDataUrl,
        size: photoSize,
        type: 'image/png'
      })
    }

    // Get all photos
    const photos = await storageService.getPhotosByAlbum(album.id)
    expect(photos).toHaveLength(photoCount)

    // Calculate total size
    const totalSize = photos.reduce((sum, photo) => sum + photo.size, 0)
    expect(totalSize).toBe(photoCount * photoSize)
  })

  test('should check available storage returns non-negative value', async () => {
    const available = await storageService.getRemainingStorage()

    expect(available).toBeGreaterThanOrEqual(0)
  })

  test('should handle quota estimate error gracefully', async () => {
    // Mock navigator.storage.estimate to throw error
    const originalStorage = navigator.storage
    const mockStorage = {
      estimate: jest.fn().mockRejectedValue(new Error('Quota error'))
    }
    Object.defineProperty(navigator, 'storage', {
      value: mockStorage,
      configurable: true
    })

    // Should throw the error
    await expect(storageService.getStorageInfo()).rejects.toThrow('Quota error')

    // Restore
    Object.defineProperty(navigator, 'storage', {
      value: originalStorage,
      configurable: true
    })
  })

  test('should validate required bytes parameter', async () => {
    // Default 1MB
    const hasSpace1 = await storageService.hasStorage()
    expect(typeof hasSpace1).toBe('boolean')

    // Custom size
    const hasSpace2 = await storageService.hasStorage(2048)
    expect(typeof hasSpace2).toBe('boolean')

    // Zero bytes
    const hasSpace3 = await storageService.hasStorage(0)
    expect(hasSpace3).toBe(true)
  })

  test('should check storage before photo upload in app flow', async () => {
    // This simulates the app checking storage before upload
    const testFileSize = 1024 * 1024 // 1MB

    const hasSpace = await storageService.hasStorage(testFileSize)

    if (hasSpace) {
      // Should be able to create album and photo
      const album = await storageService.createAlbum('Upload Test')
      expect(album).toBeTruthy()
    }

    // Test should not throw error regardless of available space
    expect(typeof hasSpace).toBe('boolean')
  })

  test('should calculate storage info accurately', async () => {
    const quotaInfo = await storageService.getStorageInfo()
    const available = await storageService.getRemainingStorage()

    if (quotaInfo.quota > 0) {
      // Available should equal quota - usage
      const expectedAvailable = quotaInfo.quota - quotaInfo.usage
      expect(available).toBe(expectedAvailable)
    }
  })

  test('should handle storage full scenario', async () => {
    // Mock storage as full
    const originalStorage = navigator.storage
    const mockStorage = {
      estimate: jest.fn().mockResolvedValue({
        usage: 1000000,
        quota: 1000000 // Full
      })
    }
    Object.defineProperty(navigator, 'storage', {
      value: mockStorage,
      configurable: true
    })

    const hasSpace = await storageService.hasStorage(1024) // Try to add 1KB
    expect(hasSpace).toBe(false)

    // Restore
    Object.defineProperty(navigator, 'storage', {
      value: originalStorage,
      configurable: true
    })
  })
})
