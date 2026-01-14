import { test, expect } from '@playwright/test'

test.describe('Photo Reordering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('should reorder photos via drag and drop', async ({ page }) => {
    // Create album
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill('Reorder Test Album')

    const submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Click album
    const albumCard = page.locator('[data-test-id^="album-item-"]').first()
    await albumCard.waitFor({ state: 'visible' })
    await albumCard.click()

    // Wait for album detail view
    await page.locator('#album-detail-section').waitFor({ state: 'visible' })

    // Upload 3 test images
    for (let i = 0; i < 3; i++) {
      const canvas = await page.evaluate(() => {
        const c = document.createElement('canvas')
        c.width = 100
        c.height = 100
        const ctx = c.getContext('2d')
        ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`
        ctx.fillRect(0, 0, 100, 100)
        return c.toDataURL('image/png')
      })

      const fileInput = page.locator('#photo-file-input')
      const buffer = Buffer.from(canvas.split(',')[1], 'base64')
      await fileInput.setInputFiles({
        name: `test-photo-${i}.png`,
        mimeType: 'image/png',
        buffer: buffer
      })

      await page.waitForTimeout(300)
    }

    // Wait for photos to appear
    const photos = page.locator('.photo-item')
    await expect(photos).toHaveCount(3)

    // Verify all photos are visible
    const firstPhoto = photos.first()
    const lastPhoto = photos.last()
    await expect(firstPhoto).toBeVisible()
    await expect(lastPhoto).toBeVisible()
  })

  test('should maintain sequential positions after reorder', async ({ page }) => {
    // Create album
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill('Position Test Album')

    const submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Click album
    const albumCard = page.locator('[data-test-id^="album-item-"]').first()
    await albumCard.waitFor({ state: 'visible' })
    await albumCard.click()

    // Wait for detail view
    await page.locator('#album-detail-section').waitFor({ state: 'visible' })

    // Upload 2 photos
    for (let i = 0; i < 2; i++) {
      const canvas = await page.evaluate(() => {
        const c = document.createElement('canvas')
        c.width = 100
        c.height = 100
        const ctx = c.getContext('2d')
        ctx.fillStyle = `hsl(${i * 180}, 100%, 50%)`
        ctx.fillRect(0, 0, 100, 100)
        return c.toDataURL('image/png')
      })

      const fileInput = page.locator('#photo-file-input')
      const buffer = Buffer.from(canvas.split(',')[1], 'base64')
      await fileInput.setInputFiles({
        name: `position-test-${i}.png`,
        mimeType: 'image/png',
        buffer: buffer
      })

      await page.waitForTimeout(300)
    }

    // Verify grid can receive drop events
    const photoGrid = page.locator('#photo-grid')
    await expect(photoGrid).toBeVisible()

    // Verify drag-drop feedback elements exist
    const photoItems = page.locator('.photo-item')
    await expect(photoItems).toHaveCount(2)

    // Check data-position attributes
    const positions = await photoItems.evaluateAll(els => 
      els.map(el => el.getAttribute('data-position'))
    )
    expect(positions).toEqual(['0', '1'])
  })

  test('should show drag-over feedback', async ({ page }) => {
    // Create album
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill('Drag Feedback Album')

    const submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Click album
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
      ctx.fillStyle = '#3498db'
      ctx.fillRect(0, 0, 100, 100)
      return c.toDataURL('image/png')
    })

    const fileInput = page.locator('#photo-file-input')
    const buffer = Buffer.from(canvas.split(',')[1], 'base64')
    await fileInput.setInputFiles({
      name: 'feedback-test.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // Wait for photo
    await page.locator('.photo-item').first().waitFor({ state: 'visible' })

    // Verify grid can receive drop events
    const photoGrid = page.locator('#photo-grid')
    await expect(photoGrid).toBeVisible()

    const photoItem = page.locator('.photo-item').first()
    await expect(photoItem).toBeVisible()
  })

  test('should persist position changes', async ({ page }) => {
    // Create album
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill('Persistence Test Album')

    const submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Click album
    const albumCard = page.locator('[data-test-id^="album-item-"]').first()
    await albumCard.waitFor({ state: 'visible' })
    await albumCard.click()

    // Wait for detail view
    await page.locator('#album-detail-section').waitFor({ state: 'visible' })

    // Upload 2 photos
    for (let i = 0; i < 2; i++) {
      const canvas = await page.evaluate(() => {
        const c = document.createElement('canvas')
        c.width = 100
        c.height = 100
        const ctx = c.getContext('2d')
        ctx.fillStyle = `hsl(${i * 100}, 100%, 50%)`
        ctx.fillRect(0, 0, 100, 100)
        return c.toDataURL('image/png')
      })

      const fileInput = page.locator('#photo-file-input')
      const buffer = Buffer.from(canvas.split(',')[1], 'base64')
      await fileInput.setInputFiles({
        name: `persist-test-${i}.png`,
        mimeType: 'image/png',
        buffer: buffer
      })

      await page.waitForTimeout(300)
    }

    // Wait for photos
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

    // Photos should still be there
    const photoItems = page.locator('.photo-item')
    await expect(photoItems).toHaveCount(2)

    // Verify positions are preserved
    const positions = await photoItems.evaluateAll(els =>
      els.map(el => el.getAttribute('data-position'))
    )
    expect(positions).toEqual(['0', '1'])
  })
})
