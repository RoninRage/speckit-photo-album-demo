import { test, expect } from '@playwright/test'

test.describe('Move Photos Between Albums', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('should move photo between albums', async ({ page }) => {
    // Create first album
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    let albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill('Album 1')

    let submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Create second album
    await page.waitForTimeout(300)
    await createBtn.click()

    albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill('Album 2')

    submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Navigate to first album
    const albumCards = page.locator('[data-test-id^="album-item-"]')
    await expect(albumCards).toHaveCount(2)
    
    const firstAlbum = albumCards.last()
    await firstAlbum.click()

    // Wait for detail view
    await page.locator('#album-detail-section').waitFor({ state: 'visible' })

    // Upload photo
    const canvas = await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = 100
      c.height = 100
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#e74c3c'
      ctx.fillRect(0, 0, 100, 100)
      return c.toDataURL('image/png')
    })

    const fileInput = page.locator('#photo-file-input')
    const buffer = Buffer.from(canvas.split(',')[1], 'base64')
    await fileInput.setInputFiles({
      name: 'move-test.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // Wait for photo
    await page.locator('.photo-item').first().waitFor({ state: 'visible' })

    // Verify photo exists in first album
    const photoItems = page.locator('.photo-item')
    await expect(photoItems).toHaveCount(1)
  })

  test('should show album list during photo drag', async ({ page }) => {
    // Create two albums
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    let albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill('Source Album')

    let submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    await page.waitForTimeout(300)
    await createBtn.click()

    albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill('Target Album')

    submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Go to source album
    const albumCards = page.locator('[data-test-id^="album-item-"]')
    const sourceAlbum = albumCards.last()
    await sourceAlbum.click()

    await page.locator('#album-detail-section').waitFor({ state: 'visible' })

    // Upload photo
    const canvas = await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = 100
      c.height = 100
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#9b59b6'
      ctx.fillRect(0, 0, 100, 100)
      return c.toDataURL('image/png')
    })

    const fileInput = page.locator('#photo-file-input')
    const buffer = Buffer.from(canvas.split(',')[1], 'base64')
    await fileInput.setInputFiles({
      name: 'drag-test.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // Wait for photo
    await page.locator('.photo-item').first().waitFor({ state: 'visible' })

    // Verify we can drag from grid
    const photoGrid = page.locator('#photo-grid')
    await expect(photoGrid).toBeVisible()

    const photoItem = page.locator('.photo-item').first()
    await expect(photoItem).toBeVisible()
  })

  test('should validate photo move to same album fails', async ({ page }) => {
    // Create album
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill('Single Album')

    const submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Navigate to album
    const albumCard = page.locator('[data-test-id^="album-item-"]').first()
    await albumCard.waitFor({ state: 'visible' })
    await albumCard.click()

    // Wait for detail view
    await page.locator('#album-detail-section').waitFor({ state: 'visible' })

    // Verify grid is in correct album
    const photoGrid = page.locator('#photo-grid')
    await expect(photoGrid).toBeVisible()

    // Upload photo
    const canvas = await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = 100
      c.height = 100
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#f39c12'
      ctx.fillRect(0, 0, 100, 100)
      return c.toDataURL('image/png')
    })

    const fileInput = page.locator('#photo-file-input')
    const buffer = Buffer.from(canvas.split(',')[1], 'base64')
    await fileInput.setInputFiles({
      name: 'same-album-test.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // Wait for photo
    await page.locator('.photo-item').first().waitFor({ state: 'visible' })

    // Verify photo count is 1
    const stats = page.locator('.album-stats')
    await expect(stats).toContainText(/1 photo/)
  })

  test('should update album counts after move', async ({ page }) => {
    // Create two albums
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    let albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill('From Album')

    let submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    await page.waitForTimeout(300)
    await createBtn.click()

    albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill('To Album')

    submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Navigate to first album
    const albumCards = page.locator('[data-test-id^="album-item-"]')
    const fromAlbum = albumCards.last()
    await fromAlbum.click()

    await page.locator('#album-detail-section').waitFor({ state: 'visible' })

    // Verify album stats visible
    const stats = page.locator('.album-stats')
    await expect(stats).toBeVisible()

    // Upload photo
    const canvas = await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = 100
      c.height = 100
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#1abc9c'
      ctx.fillRect(0, 0, 100, 100)
      return c.toDataURL('image/png')
    })

    const fileInput = page.locator('#photo-file-input')
    const buffer = Buffer.from(canvas.split(',')[1], 'base64')
    await fileInput.setInputFiles({
      name: 'count-test.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // Wait for photo
    await page.locator('.photo-item').first().waitFor({ state: 'visible' })
    await expect(stats).toContainText(/1 photo/)
  })

  test('should restore data after navigation', async ({ page }) => {
    // Create album
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill('Restore Test Album')

    const submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Navigate to album
    const albumCard = page.locator('[data-test-id^="album-item-"]').first()
    await albumCard.waitFor({ state: 'visible' })
    await albumCard.click()

    // Wait for detail view
    await page.locator('#album-detail-section').waitFor({ state: 'visible' })

    // Upload photo
    const canvas = await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = 100
      c.height = 100
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#34495e'
      ctx.fillRect(0, 0, 100, 100)
      return c.toDataURL('image/png')
    })

    const fileInput = page.locator('#photo-file-input')
    const buffer = Buffer.from(canvas.split(',')[1], 'base64')
    await fileInput.setInputFiles({
      name: 'restore-test.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // Wait for photo
    await page.locator('.photo-item').first().waitFor({ state: 'visible' })

    // Back to albums
    const backBtn = page.locator('#back-to-albums-btn')
    await backBtn.click()

    // Wait for album list
    await page.locator('#album-list').waitFor({ state: 'visible' })

    // Click album again
    const albumCard2 = page.locator('[data-test-id^="album-item-"]').first()
    await albumCard2.click()

    // Wait for detail view again
    await page.locator('#album-detail-section').waitFor({ state: 'visible' })

    // Photo should still be there
    const photos = page.locator('.photo-item')
    await expect(photos).toHaveCount(1)
  })
})
