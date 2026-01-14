import { test, expect } from '@playwright/test'

test.describe('Delete Photo Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('should show delete button on photo hover', async ({ page }) => {
    // Create album
    const albumName = 'Delete Test Album'
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await expect(createBtn).toBeVisible()
    await createBtn.click()

    // Fill album name
    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill(albumName)

    // Submit form
    const submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Wait for album to appear and click it
    const albumCard = page.locator('[data-test-id^="album-item-"]').first()
    await albumCard.waitFor({ state: 'visible', timeout: 5000 })
    await albumCard.click()

    // Wait for album detail section to appear
    await page.locator('#album-detail-section').waitFor({ state: 'visible', timeout: 5000 })

    // Create a test image
    const canvas = await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = 100
      c.height = 100
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#ff0000'
      ctx.fillRect(0, 0, 100, 100)
      return c.toDataURL('image/png')
    })

    // Upload photo
    const fileInput = page.locator('#photo-file-input')
    const buffer = Buffer.from(canvas.split(',')[1], 'base64')
    await fileInput.setInputFiles({
      name: 'test-photo.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // Wait for photo to appear in grid
    await page.locator('.photo-item').first().waitFor({ state: 'visible', timeout: 5000 })

    // Hover over photo
    const photoItem = page.locator('.photo-item').first()
    await photoItem.hover()

    // Delete button should be visible
    const deleteBtn = photoItem.locator('.photo-delete-btn')
    await expect(deleteBtn).toBeVisible()
  })

  test('should show confirmation modal on delete button click', async ({ page }) => {
    // Create album
    const albumName = 'Delete Modal Test Album'
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    // Fill album name
    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill(albumName)

    // Submit form
    const submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Wait and click album
    const albumCard = page.locator('[data-test-id^="album-item-"]').first()
    await albumCard.waitFor({ state: 'visible', timeout: 5000 })
    await albumCard.click()

    // Wait for detail view
    await page.locator('#album-detail-section').waitFor({ state: 'visible', timeout: 5000 })

    // Create and upload test image
    const canvas = await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = 100
      c.height = 100
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#00ff00'
      ctx.fillRect(0, 0, 100, 100)
      return c.toDataURL('image/png')
    })

    const fileInput = page.locator('#photo-file-input')
    const buffer = Buffer.from(canvas.split(',')[1], 'base64')
    await fileInput.setInputFiles({
      name: 'test-photo.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // Wait for photo to appear
    await page.locator('.photo-item').first().waitFor({ state: 'visible', timeout: 5000 })

    // Click delete button
    const deleteBtn = page.locator('.photo-delete-btn').first()
    await deleteBtn.click()

    // Confirmation modal should appear
    const modal = page.locator('.modal-overlay')
    await expect(modal).toBeVisible()
  })

  test('should cancel deletion when modal cancel button clicked', async ({ page }) => {
    // Create album
    const albumName = 'Cancel Delete Test'
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill(albumName)

    const submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Navigate to album
    const albumCard = page.locator('[data-test-id^="album-item-"]').first()
    await albumCard.waitFor({ state: 'visible' })
    await albumCard.click()

    await page.locator('#album-detail-section').waitFor({ state: 'visible', timeout: 5000 })

    // Upload photo
    const canvas = await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = 100
      c.height = 100
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#0000ff'
      ctx.fillRect(0, 0, 100, 100)
      return c.toDataURL('image/png')
    })

    const fileInput = page.locator('#photo-file-input')
    const buffer = Buffer.from(canvas.split(',')[1], 'base64')
    await fileInput.setInputFiles({
      name: 'test-photo.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    await page.locator('.photo-item').first().waitFor({ state: 'visible' })

    // Click delete and cancel
    const deleteBtn = page.locator('.photo-delete-btn').first()
    await deleteBtn.click()

    const cancelBtn = page.locator('button:has-text("Cancel")')
    await expect(cancelBtn).toBeVisible()
    await cancelBtn.click()

    // Modal should be gone, photo should remain
    const modal = page.locator('.modal-overlay')
    await expect(modal).not.toBeVisible()

    const photoItem = page.locator('.photo-item')
    await expect(photoItem).toBeVisible()
  })

  test('should show empty state when all photos deleted', async ({ page }) => {
    // Create album
    const albumName = 'Empty State Test'
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill(albumName)

    const submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Navigate to album
    const albumCard = page.locator('[data-test-id^="album-item-"]').first()
    await albumCard.waitFor({ state: 'visible' })
    await albumCard.click()

    await page.locator('#album-detail-section').waitFor({ state: 'visible' })

    // Upload photo
    const canvas = await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = 100
      c.height = 100
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#ffff00'
      ctx.fillRect(0, 0, 100, 100)
      return c.toDataURL('image/png')
    })

    const fileInput = page.locator('#photo-file-input')
    const buffer = Buffer.from(canvas.split(',')[1], 'base64')
    await fileInput.setInputFiles({
      name: 'test-photo.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // Wait for photo
    await page.locator('.photo-item').first().waitFor({ state: 'visible' })

    // Delete the photo
    const deleteBtn = page.locator('.photo-delete-btn').first()
    await deleteBtn.click()

    // Confirm deletion
    const confirmBtn = page.locator('button').filter({ hasText: /^Delete$/ }).first()
    await confirmBtn.click()

    // Empty state should show again
    const emptyState = page.locator('.empty-state')
    await expect(emptyState).toBeVisible()
  })

  test('should update album count after deletion', async ({ page }) => {
    // Create album
    const albumName = 'Count Test Album'
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill(albumName)

    const submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Navigate to album
    const albumCard = page.locator('[data-test-id^="album-item-"]').first()
    await albumCard.waitFor({ state: 'visible' })
    await albumCard.click()

    await page.locator('#album-detail-section').waitFor({ state: 'visible' })

    const stats = page.locator('.album-stats')
    await expect(stats).toBeVisible()

    // Upload photo
    const canvas = await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = 100
      c.height = 100
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#ff00ff'
      ctx.fillRect(0, 0, 100, 100)
      return c.toDataURL('image/png')
    })

    const fileInput = page.locator('#photo-file-input')
    const buffer = Buffer.from(canvas.split(',')[1], 'base64')
    await fileInput.setInputFiles({
      name: 'test-photo.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    // Wait for photo and check count
    await page.locator('.photo-item').first().waitFor({ state: 'visible' })
    await expect(stats).toContainText(/1 photo/)

    // Delete the photo
    const deleteBtn = page.locator('.photo-delete-btn').first()
    await deleteBtn.click()

    // Confirm deletion
    const confirmBtn = page.locator('button').filter({ hasText: /^Delete$/ }).first()
    await confirmBtn.click()

    // Count should be 0
    await expect(stats).toContainText(/0 photos/)
  })

  test('should close modal on escape key', async ({ page }) => {
    // Create album
    const albumName = 'Escape Key Test'
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill(albumName)

    const submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Navigate to album
    const albumCard = page.locator('[data-test-id^="album-item-"]').first()
    await albumCard.waitFor({ state: 'visible' })
    await albumCard.click()

    await page.locator('#album-detail-section').waitFor({ state: 'visible' })

    // Upload photo
    const canvas = await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = 100
      c.height = 100
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#00ffff'
      ctx.fillRect(0, 0, 100, 100)
      return c.toDataURL('image/png')
    })

    const fileInput = page.locator('#photo-file-input')
    const buffer = Buffer.from(canvas.split(',')[1], 'base64')
    await fileInput.setInputFiles({
      name: 'test-photo.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    await page.locator('.photo-item').first().waitFor({ state: 'visible' })

    // Click delete button
    const deleteBtn = page.locator('.photo-delete-btn').first()
    await deleteBtn.click()

    // Modal should appear
    const modal = page.locator('.modal-overlay')
    await expect(modal).toBeVisible()

    // Press escape key
    await page.keyboard.press('Escape')

    // Modal should close
    await expect(modal).not.toBeVisible()
  })

  test('should preserve album list after delete', async ({ page }) => {
    // Create album
    const albumName = 'Preserve Test Album'
    const createBtn = page.locator('[data-test-id="create-album-button"]')
    await createBtn.click()

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.fill(albumName)

    const submitBtn = page.locator('button:has-text("Create")').first()
    await submitBtn.click()

    // Navigate to album
    const albumCard = page.locator('[data-test-id^="album-item-"]').first()
    await albumCard.waitFor({ state: 'visible' })
    await albumCard.click()

    await page.locator('#album-detail-section').waitFor({ state: 'visible' })

    // Upload photo
    const canvas = await page.evaluate(() => {
      const c = document.createElement('canvas')
      c.width = 100
      c.height = 100
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#ff0080'
      ctx.fillRect(0, 0, 100, 100)
      return c.toDataURL('image/png')
    })

    const fileInput = page.locator('#photo-file-input')
    const buffer = Buffer.from(canvas.split(',')[1], 'base64')
    await fileInput.setInputFiles({
      name: 'test-photo.png',
      mimeType: 'image/png',
      buffer: buffer
    })

    await page.locator('.photo-item').first().waitFor({ state: 'visible' })

    // Delete the photo
    const deleteBtn = page.locator('.photo-delete-btn').first()
    await deleteBtn.click()

    // Confirm deletion
    const confirmBtn = page.locator('button').filter({ hasText: /^Delete$/ }).first()
    await confirmBtn.click()

    // Go back to album list
    const backBtn = page.locator('#back-to-albums-btn')
    await backBtn.click()

    // Album list should be visible
    const albumList = page.locator('#album-list')
    await expect(albumList).toBeVisible()

    // Album should still be in list
    const albumItem = page.locator('[data-test-id^="album-item-"]')
    await expect(albumItem).toHaveCount(1)
  })
})
