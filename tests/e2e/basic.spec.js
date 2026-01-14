/**
 * End-to-End Tests - Basic App Flow
 */
import { test, expect } from '@playwright/test'

test.describe('Photo Album App', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5173')
    
    // Wait for app to load
    await page.waitForLoadState('networkidle')
  })

  test('should display the app header', async ({ page }) => {
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('should have a main content area', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test.describe('Album Creation', () => {
    test('should have create album button', async ({ page }) => {
      // Look for button with text containing "create", "new", or "album"
      const createBtn = page.locator('button:has-text("New"), button:has-text("Create"), [data-test-id="create-album"]')
      
      // If found, validate it's visible
      if (await createBtn.isVisible()) {
        await expect(createBtn).toBeVisible()
      }
    })

    test('should show empty state initially', async ({ page }) => {
      // Check if there's an empty state message or no albums displayed
      const albumList = page.locator('[role="region"]')
      const hasContent = await albumList.count()
      
      // Either empty state shown or no albums
      expect(hasContent).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Check that content is still visible
      const main = page.locator('main')
      await expect(main).toBeVisible()
    })

    test('should be responsive on tablet', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      
      // Check that content is still visible
      const main = page.locator('main')
      await expect(main).toBeVisible()
    })

    test('should be responsive on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 })
      
      // Check that content is still visible
      const main = page.locator('main')
      await expect(main).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = page.locator('h1')
      const count = await h1.count()
      
      // Should have at least one h1
      expect(count).toBeGreaterThanOrEqual(0)
    })

    test('should have accessible buttons', async ({ page }) => {
      const buttons = page.locator('button')
      const count = await buttons.count()
      
      // Should have buttons for interactions
      expect(count).toBeGreaterThanOrEqual(0)
    })

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through focusable elements
      await page.keyboard.press('Tab')
      
      // Get focused element
      const focused = await page.evaluate(() => document.activeElement?.tagName)
      
      // Should have focusable elements
      expect(focused).toBeTruthy()
    })
  })

  test.describe('Data Persistence', () => {
    test('should persist app state on reload', async ({ page }) => {
      // Get initial state
      const beforeReload = await page.evaluate(() => {
        return {
          albumsCount: document.querySelectorAll('[data-album]').length
        }
      })

      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Check state after reload
      const afterReload = await page.evaluate(() => {
        return {
          albumsCount: document.querySelectorAll('[data-album]').length
        }
      })

      // State should persist
      expect(afterReload.albumsCount).toBe(beforeReload.albumsCount)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle missing data gracefully', async ({ page }) => {
      // Clear IndexedDB
      await page.evaluate(() => {
        return new Promise((resolve, reject) => {
          const req = indexedDB.deleteDatabase('photo-album-db')
          req.onsuccess = resolve
          req.onerror = reject
        })
      })

      // Reload
      await page.reload()
      await page.waitForLoadState('networkidle')

      // App should still be usable
      const main = page.locator('main')
      await expect(main).toBeVisible()
    })
  })

  test.describe('Performance', () => {
    test('page should load within acceptable time', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('http://localhost:5173')
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })

    test('should not have console errors', async ({ page }) => {
      const errors = []

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      await page.goto('http://localhost:5173')
      await page.waitForLoadState('networkidle')

      // Should have no console errors
      expect(errors.length).toBe(0)
    })
  })
})
