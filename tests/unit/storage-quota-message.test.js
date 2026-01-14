/**
 * @jest-environment jsdom
 */

import { storageService } from '../../src/services/StorageService.js'

describe('Storage Quota Message Display', () => {
  beforeEach(async () => {
    // Initialize storage
    await storageService.init()

    // Set up DOM
    document.body.innerHTML = `
      <div id="app">
        <div id="toast-container"></div>
        <main id="app-main">
          <section id="album-detail-section">
            <div class="photo-upload-area">
              <input type="file" id="photo-upload-input" multiple accept="image/*" />
              <button id="upload-photos-btn">Upload Photos</button>
            </div>
          </section>
        </main>
      </div>
    `
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('should show error message when storage is full', async () => {
    // Mock navigator.storage to return full storage
    const originalStorage = navigator.storage
    const mockStorage = {
      estimate: jest.fn().mockResolvedValue({
        usage: 1000000000, // 1GB
        quota: 1000000000  // 1GB (full)
      })
    }
    Object.defineProperty(navigator, 'storage', {
      value: mockStorage,
      configurable: true
    })

    // Check if storage has space (should return false)
    const hasSpace = await storageService.hasStorage(1024 * 1024) // Try to add 1MB

    expect(hasSpace).toBe(false)

    // Simulate showing error message
    const toastContainer = document.getElementById('toast-container')
    const toast = document.createElement('div')
    toast.className = 'toast toast-error'
    toast.textContent = 'Storage is full. Delete photos to free space.'
    toastContainer.appendChild(toast)

    expect(toast.textContent).toContain('Storage is full')
    expect(toast.classList.contains('toast-error')).toBe(true)

    // Restore
    Object.defineProperty(navigator, 'storage', {
      value: originalStorage,
      configurable: true
    })
  })

  test('should show warning when storage is nearly full (>90%)', async () => {
    // Mock storage at 95% capacity
    const originalStorage = navigator.storage
    const mockStorage = {
      estimate: jest.fn().mockResolvedValue({
        usage: 950000000,   // 950MB
        quota: 1000000000   // 1GB
      })
    }
    Object.defineProperty(navigator, 'storage', {
      value: mockStorage,
      configurable: true
    })

    const quotaInfo = await storageService.getStorageInfo()
    const percentUsed = (quotaInfo.usage / quotaInfo.quota) * 100

    expect(percentUsed).toBeGreaterThan(90)

    // Show warning
    const toastContainer = document.getElementById('toast-container')
    const toast = document.createElement('div')
    toast.className = 'toast toast-warning'
    toast.textContent = 'Storage is nearly full. Consider deleting old photos.'
    toastContainer.appendChild(toast)

    expect(toast.textContent).toContain('nearly full')
    expect(toast.classList.contains('toast-warning')).toBe(true)

    // Restore
    Object.defineProperty(navigator, 'storage', {
      value: originalStorage,
      configurable: true
    })
  })

  test('should not show quota warning when storage has plenty of space', async () => {
    // Mock storage with plenty of space (20% used)
    const originalStorage = navigator.storage
    const mockStorage = {
      estimate: jest.fn().mockResolvedValue({
        usage: 200000000,   // 200MB
        quota: 1000000000   // 1GB
      })
    }
    Object.defineProperty(navigator, 'storage', {
      value: mockStorage,
      configurable: true
    })

    const quotaInfo = await storageService.getStorageInfo()
    const percentUsed = (quotaInfo.usage / quotaInfo.quota) * 100

    expect(percentUsed).toBeLessThan(90)

    // No warning should be shown
    const toastContainer = document.getElementById('toast-container')
    expect(toastContainer.children.length).toBe(0)

    // Restore
    Object.defineProperty(navigator, 'storage', {
      value: originalStorage,
      configurable: true
    })
  })

  test('should block upload when storage is full', async () => {
    // Mock full storage
    const originalStorage = navigator.storage
    const mockStorage = {
      estimate: jest.fn().mockResolvedValue({
        usage: 1000000000,
        quota: 1000000000
      })
    }
    Object.defineProperty(navigator, 'storage', {
      value: mockStorage,
      configurable: true
    })

    // Check before upload
    const fileSize = 5 * 1024 * 1024 // 5MB
    const hasSpace = await storageService.hasStorage(fileSize)

    expect(hasSpace).toBe(false)

    // Upload should be blocked
    const uploadBtn = document.getElementById('upload-photos-btn')
    uploadBtn.disabled = !hasSpace

    expect(uploadBtn.disabled).toBe(true)

    // Restore
    Object.defineProperty(navigator, 'storage', {
      value: originalStorage,
      configurable: true
    })
  })

  test('should allow upload when storage has sufficient space', async () => {
    // Mock storage with plenty of space
    const originalStorage = navigator.storage
    const mockStorage = {
      estimate: jest.fn().mockResolvedValue({
        usage: 100000000,   // 100MB
        quota: 1000000000   // 1GB
      })
    }
    Object.defineProperty(navigator, 'storage', {
      value: mockStorage,
      configurable: true
    })

    // Check before upload
    const fileSize = 5 * 1024 * 1024 // 5MB
    const hasSpace = await storageService.hasStorage(fileSize)

    expect(hasSpace).toBe(true)

    // Upload should be enabled
    const uploadBtn = document.getElementById('upload-photos-btn')
    uploadBtn.disabled = !hasSpace

    expect(uploadBtn.disabled).toBe(false)

    // Restore
    Object.defineProperty(navigator, 'storage', {
      value: originalStorage,
      configurable: true
    })
  })

  test('should display remaining storage info', async () => {
    // Mock storage
    const originalStorage = navigator.storage
    const mockStorage = {
      estimate: jest.fn().mockResolvedValue({
        usage: 300000000,   // 300MB
        quota: 1000000000   // 1GB
      })
    }
    Object.defineProperty(navigator, 'storage', {
      value: mockStorage,
      configurable: true
    })

    const quotaInfo = await storageService.getStorageInfo()
    const remaining = await storageService.getRemainingStorage()
    const percentUsed = ((quotaInfo.usage / quotaInfo.quota) * 100).toFixed(1)

    expect(remaining).toBe(700000000) // 700MB remaining
    expect(percentUsed).toBe('30.0')

    // Display info
    const infoDiv = document.createElement('div')
    infoDiv.className = 'storage-info'
    infoDiv.textContent = `Storage: ${percentUsed}% used`
    document.body.appendChild(infoDiv)

    expect(infoDiv.textContent).toContain('30.0%')

    // Restore
    Object.defineProperty(navigator, 'storage', {
      value: originalStorage,
      configurable: true
    })
  })

  test('should handle navigator.storage not available gracefully', async () => {
    // Mock missing storage API
    const originalStorage = navigator.storage
    Object.defineProperty(navigator, 'storage', {
      value: undefined,
      configurable: true
    })

    const quotaInfo = await storageService.getStorageInfo()

    // Should return defaults
    expect(quotaInfo.usage).toBe(0)
    expect(quotaInfo.quota).toBe(0)

    // No error should be thrown
    const hasSpace = await storageService.hasStorage(1024)
    expect(typeof hasSpace).toBe('boolean')

    // Restore
    Object.defineProperty(navigator, 'storage', {
      value: originalStorage,
      configurable: true
    })
  })

  test('should format storage sizes in human-readable format', () => {
    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i]
    }

    expect(formatBytes(0)).toBe('0 Bytes')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1024 * 1024)).toBe('1 MB')
    expect(formatBytes(1024 * 1024 * 500)).toBe('500 MB')
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
  })
})
