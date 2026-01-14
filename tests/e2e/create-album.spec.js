/**
 * E2E Test: Create Album Flow
 * Tests the complete user journey of creating a new album
 */
import { test, expect } from '@playwright/test'

test.describe('Create Album Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173')
    // Wait for app to initialize
    await page.waitForSelector('#app-main', { timeout: 5000 })
  })

  test('should display album list on load', async ({ page }) => {
    // Verify we see the albums view
    const albumList = page.locator('.album-list')
    await expect(albumList).toBeVisible()

    // Verify create button exists
    const createBtn = page.locator('#create-album-btn')
    await expect(createBtn).toBeVisible()
    await expect(createBtn).toContainText('New Album')
  })

  test('should show create form when new album button clicked', async ({ page }) => {
    const createBtn = page.locator('#create-album-btn')
    await createBtn.click()

    // Form container should appear
    const formContainer = page.locator('#album-form-container')
    await expect(formContainer).toBeVisible()

    // Input field should be focused
    const input = page.locator('#album-name-input')
    await expect(input).toBeVisible()
  })

  test('should create album with valid name', async ({ page }) => {
    // Open create form
    const createBtn = page.locator('#create-album-btn')
    await createBtn.click()

    // Fill in album name
    const input = page.locator('#album-name-input')
    await input.fill('Summer Vacation 2024')

    // Submit form
    const form = page.locator('#album-form')
    await form.evaluate(el => el.dispatchEvent(new Event('submit')))

    // Wait for album to be created
    await page.waitForTimeout(500)

    // Should see the new album in the list
    const albumName = page.locator('.album-name')
    await expect(albumName).toContainText('Summer Vacation 2024')

    // Form should be hidden
    const formContainer = page.locator('#album-form-container')
    await expect(formContainer).toHaveClass(/hidden/)
  })

  test('should validate album name is required', async ({ page }) => {
    // Open create form
    const createBtn = page.locator('#create-album-btn')
    await createBtn.click()

    // Leave input empty and try to submit
    const form = page.locator('#album-form')
    const input = page.locator('#album-name-input')

    await input.fill('')

    // Try to submit
    await form.evaluate(el => el.dispatchEvent(new Event('submit')))

    // Error message should appear
    const errorMsg = page.locator('.form-error')
    await expect(errorMsg).toBeVisible()
  })

  test('should limit album name length', async ({ page }) => {
    // Open create form
    const createBtn = page.locator('#create-album-btn')
    await createBtn.click()

    // Try to type very long name
    const input = page.locator('#album-name-input')
    const longName = 'a'.repeat(300)

    await input.fill(longName)

    // Input should be truncated to max length (255)
    const value = await input.inputValue()
    expect(value.length).toBeLessThanOrEqual(255)
  })

  test('should show character counter', async ({ page }) => {
    // Open create form
    const createBtn = page.locator('#create-album-btn')
    await createBtn.click()

    const input = page.locator('#album-name-input')
    const counter = page.locator('.form-counter')

    // Type some text
    await input.fill('Test Album')

    // Counter should show current length
    await expect(counter).toContainText(/10\s*\//)
  })

  test('should show success toast on album creation', async ({ page }) => {
    // Create an album
    const createBtn = page.locator('#create-album-btn')
    await createBtn.click()

    const input = page.locator('#album-name-input')
    await input.fill('My Album')

    const form = page.locator('#album-form')
    await form.evaluate(el => el.dispatchEvent(new Event('submit')))

    // Success toast should appear
    const toast = page.locator('.toast-success')
    await expect(toast).toBeVisible()
    await expect(toast).toContainText(/created|success/i)
  })

  test('should allow creating multiple albums', async ({ page }) => {
    // Create first album
    const createBtn = page.locator('#create-album-btn')
    await createBtn.click()

    let input = page.locator('#album-name-input')
    await input.fill('Album 1')

    let form = page.locator('#album-form')
    await form.evaluate(el => el.dispatchEvent(new Event('submit')))

    await page.waitForTimeout(300)

    // Create second album
    await createBtn.click()

    input = page.locator('#album-name-input')
    await input.fill('Album 2')

    form = page.locator('#album-form')
    await form.evaluate(el => el.dispatchEvent(new Event('submit')))

    await page.waitForTimeout(300)

    // Both albums should be visible
    const albumNames = page.locator('.album-name')
    const count = await albumNames.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('should display album with correct info', async ({ page }) => {
    // Create album
    const createBtn = page.locator('#create-album-btn')
    await createBtn.click()

    const input = page.locator('#album-name-input')
    await input.fill('Test Album')

    const form = page.locator('#album-form')
    await form.evaluate(el => el.dispatchEvent(new Event('submit')))

    await page.waitForTimeout(500)

    // Find the created album
    const albumCard = page.locator('.album-card').first()

    // Should show album name
    const name = albumCard.locator('.album-name')
    await expect(name).toContainText('Test Album')

    // Should show photo count (0 initially)
    const count = albumCard.locator('.album-count')
    await expect(count).toContainText('0 photo')
  })

  test('should allow clicking album to view details', async ({ page }) => {
    // Create an album first
    const createBtn = page.locator('#create-album-btn')
    await createBtn.click()

    const input = page.locator('#album-name-input')
    await input.fill('My Photos')

    const form = page.locator('#album-form')
    await form.evaluate(el => el.dispatchEvent(new Event('submit')))

    await page.waitForTimeout(500)

    // Click on the album
    const albumCard = page.locator('.album-card').first()
    await albumCard.click()

    // Should navigate to detail view
    const detailHeader = page.locator('.album-detail-header')
    await expect(detailHeader).toBeVisible()

    // Should show album name in detail view
    const title = page.locator('.detail-title')
    await expect(title).toContainText('My Photos')

    // Should show back button
    const backBtn = page.locator('.back-btn')
    await expect(backBtn).toBeVisible()
  })

  test('should allow going back to album list', async ({ page }) => {
    // Navigate to album detail
    const createBtn = page.locator('#create-album-btn')
    await createBtn.click()

    const input = page.locator('#album-name-input')
    await input.fill('Test Album')

    const form = page.locator('#album-form')
    await form.evaluate(el => el.dispatchEvent(new Event('submit')))

    await page.waitForTimeout(500)

    const albumCard = page.locator('.album-card').first()
    await albumCard.click()

    await page.waitForTimeout(300)

    // Click back button
    const backBtn = page.locator('.back-btn')
    await backBtn.click()

    await page.waitForTimeout(300)

    // Should be back to album list
    const albumList = page.locator('.album-list')
    await expect(albumList).toBeVisible()

    // Create button should be visible again
    const newCreateBtn = page.locator('#create-album-btn')
    await expect(newCreateBtn).toBeVisible()
  })

  test('should delete album with confirmation', async ({ page }) => {
    // Create album
    const createBtn = page.locator('#create-album-btn')
    await createBtn.click()

    const input = page.locator('#album-name-input')
    await input.fill('Album to Delete')

    const form = page.locator('#album-form')
    await form.evaluate(el => el.dispatchEvent(new Event('submit')))

    await page.waitForTimeout(500)

    // Find delete button (within album item)
    const deleteBtn = page.locator('.delete-btn').first()
    await expect(deleteBtn).toBeVisible()

    // Click delete
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Are you sure')
      dialog.accept()
    })

    await deleteBtn.click()

    await page.waitForTimeout(500)

    // Album should be removed from list
    const albumName = page.locator('.album-name')
    const hasDeletedAlbum = await albumName.locator('text=Album to Delete').count()
    expect(hasDeletedAlbum).toBe(0)
  })

  test('should persist albums across page reload', async ({ page }) => {
    // Create album
    const createBtn = page.locator('#create-album-btn')
    await createBtn.click()

    const input = page.locator('#album-name-input')
    await input.fill('Persistent Album')

    const form = page.locator('#album-form')
    await form.evaluate(el => el.dispatchEvent(new Event('submit')))

    await page.waitForTimeout(500)

    // Reload page
    await page.reload()

    await page.waitForSelector('#app-main', { timeout: 5000 })

    // Album should still be there
    const albumName = page.locator('.album-name')
    await expect(albumName).toContainText('Persistent Album')
  })
})
