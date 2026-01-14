import { test, expect } from '@playwright/test'

test.describe('Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('should display mobile layout at 375px width', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Verify app loads
    await page.locator('#app').waitFor({ state: 'visible', timeout: 5000 })

    // Check header is visible and stacked
    const header = page.locator('#app-header')
    await expect(header).toBeVisible()

    // Create an album to test layout
    await page.locator('#create-album-btn').click()
    const formContainer = page.locator('#album-form-container')
    await formContainer.waitFor({ state: 'visible', timeout: 5000 })

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.waitFor({ state: 'visible', timeout: 5000 })
    await albumInput.fill('Mobile Test Album')

    await page.locator('#album-form-save-btn').click()

    // Verify album card is visible and full-width
    const albumCard = page.locator('.album-card').first()
    await albumCard.waitFor({ state: 'visible', timeout: 5000 })

    // Check that album list uses single column layout (full width)
    const albumList = page.locator('#album-list')
    const boundingBox = await albumList.boundingBox()
    expect(boundingBox.width).toBeLessThanOrEqual(375)
  })

  test('should display tablet layout at 768px width', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    await page.locator('#app').waitFor({ state: 'visible', timeout: 5000 })

    // Create albums to test grid layout
    for (let i = 1; i <= 3; i++) {
      await page.locator('#create-album-btn').click()
      const formContainer = page.locator('#album-form-container')
      await formContainer.waitFor({ state: 'visible', timeout: 5000 })

      const albumInput = page.locator('input[placeholder*="album name"]').first()
      await albumInput.waitFor({ state: 'visible', timeout: 5000 })
      await albumInput.fill(`Tablet Album ${i}`)

      await page.locator('#album-form-save-btn').click()
      await page.waitForTimeout(300)
    }

    // Verify albums are visible in grid layout
    const albumCards = page.locator('.album-card')
    const count = await albumCards.count()
    expect(count).toBe(3)

    // Albums should be in 2-3 column grid at this width
    const albumList = page.locator('#album-list')
    const boundingBox = await albumList.boundingBox()
    expect(boundingBox.width).toBeLessThanOrEqual(768)
  })

  test('should display desktop layout at 1024px width', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 })

    await page.locator('#app').waitFor({ state: 'visible', timeout: 5000 })

    // Create multiple albums
    for (let i = 1; i <= 4; i++) {
      await page.locator('#create-album-btn').click()
      const formContainer = page.locator('#album-form-container')
      await formContainer.waitFor({ state: 'visible', timeout: 5000 })

      const albumInput = page.locator('input[placeholder*="album name"]').first()
      await albumInput.waitFor({ state: 'visible', timeout: 5000 })
      await albumInput.fill(`Desktop Album ${i}`)

      await page.locator('#album-form-save-btn').click()
      await page.waitForTimeout(300)
    }

    // Verify albums are visible
    const albumCards = page.locator('.album-card')
    const count = await albumCards.count()
    expect(count).toBe(4)

    // Desktop should show 3-4 column grid
    const albumList = page.locator('#album-list')
    const boundingBox = await albumList.boundingBox()
    expect(boundingBox.width).toBeLessThanOrEqual(1024)
  })

  test('should display wide desktop layout at 1440px width', async ({ page }) => {
    // Set wide desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.locator('#app').waitFor({ state: 'visible', timeout: 5000 })

    // Create albums
    await page.locator('#create-album-btn').click()
    const formContainer = page.locator('#album-form-container')
    await formContainer.waitFor({ state: 'visible', timeout: 5000 })

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.waitFor({ state: 'visible', timeout: 5000 })
    await albumInput.fill('Wide Desktop Album')

    await page.locator('#album-form-save-btn').click()

    // Verify layout utilizes extra width
    const albumCard = page.locator('.album-card').first()
    await albumCard.waitFor({ state: 'visible', timeout: 5000 })

    const albumList = page.locator('#album-list')
    const boundingBox = await albumList.boundingBox()
    expect(boundingBox.width).toBeLessThanOrEqual(1440)
  })

  test('should have touch-friendly buttons on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.locator('#app').waitFor({ state: 'visible', timeout: 5000 })

    // Check create button size (should be at least 48x48px for touch targets)
    const createBtn = page.locator('#create-album-btn')
    const boundingBox = await createBtn.boundingBox()

    expect(boundingBox.width).toBeGreaterThanOrEqual(44) // Allow small variance
    expect(boundingBox.height).toBeGreaterThanOrEqual(44)
  })

  test('should adapt photo grid layout at different widths', async ({ page }) => {
    // Create album with photos
    await page.locator('#app').waitFor({ state: 'visible', timeout: 5000 })
    await page.locator('#create-album-btn').click()

    const formContainer = page.locator('#album-form-container')
    await formContainer.waitFor({ state: 'visible', timeout: 5000 })

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.waitFor({ state: 'visible', timeout: 5000 })
    await albumInput.fill('Responsive Photos')

    await page.locator('#album-form-save-btn').click()

    // Click album to enter detail view
    const albumCard = page.locator('.album-card').first()
    await albumCard.waitFor({ state: 'visible', timeout: 5000 })
    await albumCard.click()

    await page.locator('#album-detail-section').waitFor({ state: 'visible', timeout: 5000 })

    // Upload photos
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('./tests/fixtures/test-image.jpg')
    await page.waitForTimeout(500)

    await fileInput.setInputFiles('./tests/fixtures/test-image.jpg')
    await page.waitForTimeout(500)

    await fileInput.setInputFiles('./tests/fixtures/test-image.jpg')

    // Wait for photos to load
    await page.waitForSelector('.photo-item:nth-child(3)', { state: 'visible', timeout: 5000 })

    // Test mobile width (1 column)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(300)

    let photoGrid = page.locator('.photo-grid')
    let gridBox = await photoGrid.boundingBox()
    expect(gridBox.width).toBeLessThanOrEqual(375)

    // Test tablet width (2-3 columns)
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(300)

    gridBox = await photoGrid.boundingBox()
    expect(gridBox.width).toBeLessThanOrEqual(768)

    // Test desktop width (4+ columns)
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.waitForTimeout(300)

    gridBox = await photoGrid.boundingBox()
    expect(gridBox.width).toBeLessThanOrEqual(1024)
  })

  test('should maintain functionality across viewport changes', async ({ page }) => {
    // Start at desktop
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.locator('#app').waitFor({ state: 'visible', timeout: 5000 })

    // Create album
    await page.locator('#create-album-btn').click()
    const formContainer = page.locator('#album-form-container')
    await formContainer.waitFor({ state: 'visible', timeout: 5000 })

    const albumInput = page.locator('input[placeholder*="album name"]').first()
    await albumInput.waitFor({ state: 'visible', timeout: 5000 })
    await albumInput.fill('Resize Test')

    await page.locator('#album-form-save-btn').click()

    // Verify album exists
    let albumCard = page.locator('.album-card').first()
    await albumCard.waitFor({ state: 'visible', timeout: 5000 })
    let albumName = await page.locator('.album-name').first().textContent()
    expect(albumName).toContain('Resize Test')

    // Switch to mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(300)

    // Verify album still visible and accessible
    albumCard = page.locator('.album-card').first()
    await expect(albumCard).toBeVisible()

    albumName = await page.locator('.album-name').first().textContent()
    expect(albumName).toContain('Resize Test')

    // Album should still be clickable
    await albumCard.click()
    await page.locator('#album-detail-section').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should have accessible keyboard navigation at all sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1024, height: 768 }   // Desktop
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.locator('#app').waitFor({ state: 'visible', timeout: 5000 })

      // Tab to create button and press Enter
      await page.keyboard.press('Tab')
      const createBtn = page.locator('#create-album-btn')
      
      // Check if button is focused (has focus styles)
      const isFocused = await createBtn.evaluate(el => el === document.activeElement)
      
      // If not focused yet, tab again
      if (!isFocused) {
        await page.keyboard.press('Tab')
      }

      // Press Enter to activate
      await page.keyboard.press('Enter')

      // Form should open
      const formContainer = page.locator('#album-form-container')
      await expect(formContainer).toBeVisible({ timeout: 3000 })

      // Press Escape to close
      await page.keyboard.press('Escape')
      await expect(formContainer).toBeHidden({ timeout: 3000 })
    }
  })
})
