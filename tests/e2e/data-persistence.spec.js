import { test, expect } from '@playwright/test'

test.describe('Data Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and clear existing data
    await page.goto('http://localhost:5173')

    // Clear IndexedDB
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const request = indexedDB.deleteDatabase('PhotoAlbumDB')
        request.onsuccess = () => resolve()
        request.onerror = () => resolve()
      })
    })

    // Reload to initialize fresh
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('should persist album across page reloads', async ({ page }) => {
    // Wait for app to be ready
    await page.locator('#app').waitFor({ state: 'visible', timeout: 5000 })

    // Click Create Album button
    await page.locator('#create-album-btn').click()

    // Wait for form to become visible (remove hidden class)
    const formContainer = page.locator('#album-form-container')
    await formContainer.waitFor({ state: 'visible', timeout: 5000 })

    // Wait for input to be visible and enabled
    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.waitFor({ state: 'visible', timeout: 5000 })
    await albumInput.fill('Persistent Album')

    // Submit form
    await page.locator('#album-form-save-btn').click()

    // Wait for album card to appear
    await page.locator('.album-card').first().waitFor({ state: 'visible', timeout: 5000 })

    // Verify album was created
    const albumName = await page.locator('.album-name').first().textContent()
    expect(albumName).toContain('Persistent Album')

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify album still exists after reload
    await page.locator('.album-card').first().waitFor({ state: 'visible', timeout: 5000 })
    const persistedName = await page.locator('.album-name').first().textContent()
    expect(persistedName).toContain('Persistent Album')
  })

  test('should persist photos across page reloads', async ({ page }) => {
    // Create an album first
    await page.locator('#app').waitFor({ state: 'visible', timeout: 5000 })
    await page.locator('#create-album-btn').click()

    const formContainer = page.locator('#album-form-container')
    await formContainer.waitFor({ state: 'visible', timeout: 5000 })

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.waitFor({ state: 'visible', timeout: 5000 })
    await albumInput.fill('Photo Album')

    await page.locator('#album-form-save-btn').click()

    // Click on the album to enter detail view
    const albumCard = page.locator('.album-card').first()
    await albumCard.waitFor({ state: 'visible', timeout: 5000 })
    await albumCard.click()

    // Wait for detail section
    await page.locator('#album-detail-section').waitFor({ state: 'visible', timeout: 5000 })

    // Upload a photo
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('./tests/fixtures/test-image.jpg')

    // Wait for photo to appear
    await page.locator('.photo-item').first().waitFor({ state: 'visible', timeout: 5000 })

    // Verify photo count
    const photoCount = await page.locator('.photo-item').count()
    expect(photoCount).toBe(1)

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Navigate back to the album
    await page.locator('.album-card').first().waitFor({ state: 'visible', timeout: 5000 })
    await page.locator('.album-card').first().click()

    // Verify photo persisted
    await page.locator('.photo-item').first().waitFor({ state: 'visible', timeout: 5000 })
    const persistedPhotoCount = await page.locator('.photo-item').count()
    expect(persistedPhotoCount).toBe(1)
  })

  test('should persist album and photo deletions', async ({ page }) => {
    // Create album with photo
    await page.locator('#app').waitFor({ state: 'visible', timeout: 5000 })
    await page.locator('#create-album-btn').click()

    const formContainer = page.locator('#album-form-container')
    await formContainer.waitFor({ state: 'visible', timeout: 5000 })

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.waitFor({ state: 'visible', timeout: 5000 })
    await albumInput.fill('Temporary Album')

    await page.locator('#album-form-save-btn').click()

    const albumCard = page.locator('.album-card').first()
    await albumCard.waitFor({ state: 'visible', timeout: 5000 })
    await albumCard.click()

    await page.locator('#album-detail-section').waitFor({ state: 'visible', timeout: 5000 })

    // Upload photo
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('./tests/fixtures/test-image.jpg')

    await page.locator('.photo-item').first().waitFor({ state: 'visible', timeout: 5000 })

    // Delete the photo
    await page.locator('.photo-item').first().hover()
    const deleteBtn = page.locator('.photo-item .photo-delete-btn').first()
    await deleteBtn.waitFor({ state: 'visible', timeout: 2000 })
    await deleteBtn.click()

    // Confirm deletion in modal
    await page.locator('#confirm-delete-btn').click()

    // Wait for empty state
    await page.locator('.photo-empty-state').waitFor({ state: 'visible', timeout: 5000 })

    // Go back to albums
    await page.locator('#back-to-albums-btn').click()

    // Delete the album
    await page.locator('.album-card').first().hover()
    const albumDeleteBtn = page.locator('.album-delete-btn').first()
    await albumDeleteBtn.waitFor({ state: 'visible', timeout: 2000 })
    await albumDeleteBtn.click()

    await page.locator('#confirm-delete-btn').click()

    // Wait for album to be gone
    await page.waitForSelector('.album-card', { state: 'detached', timeout: 5000 })

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify album is still gone
    const albumCount = await page.locator('.album-card').count()
    expect(albumCount).toBe(0)
  })

  test('should persist photo reordering', async ({ page }) => {
    // Create album with multiple photos
    await page.locator('#app').waitFor({ state: 'visible', timeout: 5000 })
    await page.locator('#create-album-btn').click()

    const formContainer = page.locator('#album-form-container')
    await formContainer.waitFor({ state: 'visible', timeout: 5000 })

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.waitFor({ state: 'visible', timeout: 5000 })
    await albumInput.fill('Reorder Test')

    await page.locator('#album-form-save-btn').click()

    const albumCard = page.locator('.album-card').first()
    await albumCard.waitFor({ state: 'visible', timeout: 5000 })
    await albumCard.click()

    await page.locator('#album-detail-section').waitFor({ state: 'visible', timeout: 5000 })

    // Upload 3 photos
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('./tests/fixtures/test-image.jpg')
    await page.waitForTimeout(500)
    await fileInput.setInputFiles('./tests/fixtures/test-image.jpg')
    await page.waitForTimeout(500)
    await fileInput.setInputFiles('./tests/fixtures/test-image.jpg')

    // Wait for all photos
    await page.waitForSelector('.photo-item:nth-child(3)', { state: 'visible', timeout: 5000 })

    // Get original order
    const firstPhotoId = await page.locator('.photo-item').first().getAttribute('data-photo')

    // Drag first photo to third position
    const firstPhoto = page.locator('.photo-item').first()
    const thirdPhoto = page.locator('.photo-item').nth(2)

    await firstPhoto.dragTo(thirdPhoto)

    // Wait for reorder to complete
    await page.waitForTimeout(500)

    // Verify new order
    const newFirstPhotoId = await page.locator('.photo-item').first().getAttribute('data-photo')
    expect(newFirstPhotoId).not.toBe(firstPhotoId)

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Navigate back to album
    await page.locator('.album-card').first().waitFor({ state: 'visible', timeout: 5000 })
    await page.locator('.album-card').first().click()

    await page.locator('.photo-item').first().waitFor({ state: 'visible', timeout: 5000 })

    // Verify order persisted
    const persistedFirstPhotoId = await page.locator('.photo-item').first().getAttribute('data-photo')
    expect(persistedFirstPhotoId).toBe(newFirstPhotoId)
  })

  test('should handle storage initialization errors gracefully', async ({ page }) => {
    // Mock IndexedDB to fail
    await page.addInitScript(() => {
      window.indexedDB = null
    })

    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')

    // App should still load with empty state
    const appContainer = await page.locator('#app').isVisible()
    expect(appContainer).toBe(true)

    // Error message should not block UI (graceful degradation)
    const createBtn = await page.locator('#create-album-btn').isVisible()
    expect(createBtn).toBe(true)
  })
})
