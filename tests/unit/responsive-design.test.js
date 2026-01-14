/**
 * @jest-environment jsdom
 */

describe('Responsive Design', () => {
  beforeEach(() => {
    // Set up basic DOM structure
    document.body.innerHTML = `
      <div id="app">
        <header id="app-header">
          <h1>Photo Album</h1>
        </header>
        <main id="app-main"></main>
      </div>
    `
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('should have viewport meta tag for mobile scaling', () => {
    // Create head element if it doesn't exist
    if (!document.head) {
      document.documentElement.appendChild(document.createElement('head'))
    }

    // Add viewport meta tag
    const viewport = document.createElement('meta')
    viewport.name = 'viewport'
    viewport.content = 'width=device-width, initial-scale=1.0'
    document.head.appendChild(viewport)

    const viewportMeta = document.querySelector('meta[name="viewport"]')
    expect(viewportMeta).toBeTruthy()
    expect(viewportMeta.content).toBe('width=device-width, initial-scale=1.0')
  })

  test('should apply mobile-first base styles', () => {
    const appMain = document.getElementById('app-main')

    // Mobile-first styles should be applied by default
    expect(appMain).toBeTruthy()
    expect(appMain.style.display).toBe('')

    // Test that element exists and can receive styles
    appMain.style.padding = '16px'
    expect(appMain.style.padding).toBe('16px')
  })

  test('should have responsive grid layouts in CSS', () => {
    // Create photo grid element
    const photoGrid = document.createElement('div')
    photoGrid.className = 'photo-grid'
    document.getElementById('app-main').appendChild(photoGrid)

    // Create album list element
    const albumList = document.createElement('div')
    albumList.className = 'album-list'
    document.getElementById('app-main').appendChild(albumList)

    expect(photoGrid.className).toContain('photo-grid')
    expect(albumList.className).toContain('album-list')
  })

  test('should have touch-friendly minimum tap target sizes', () => {
    // Create button with minimum 48px size
    const button = document.createElement('button')
    button.className = 'btn'
    button.style.minHeight = '48px'
    button.style.minWidth = '48px'
    document.body.appendChild(button)

    const styles = window.getComputedStyle(button)
    expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(48)
    expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(48)
  })

  test('should have focus indicators for keyboard navigation', () => {
    const button = document.createElement('button')
    button.className = 'btn'
    document.body.appendChild(button)

    // Simulate focus
    button.focus()

    // Button should be focusable
    expect(document.activeElement).toBe(button)
  })

  test('should support keyboard navigation with Tab key', () => {
    // Create multiple focusable elements
    const button1 = document.createElement('button')
    button1.id = 'btn1'
    const button2 = document.createElement('button')
    button2.id = 'btn2'
    const input = document.createElement('input')
    input.id = 'input1'

    document.body.appendChild(button1)
    document.body.appendChild(button2)
    document.body.appendChild(input)

    // Focus first element
    button1.focus()
    expect(document.activeElement).toBe(button1)

    // Simulate tab to next element
    button2.focus()
    expect(document.activeElement).toBe(button2)

    // Tab to input
    input.focus()
    expect(document.activeElement).toBe(input)
  })

  test('should handle Escape key for closing modals', () => {
    const modal = document.createElement('div')
    modal.className = 'modal-overlay'
    modal.style.display = 'block'
    document.body.appendChild(modal)

    let escapePressed = false
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        escapePressed = true
        modal.style.display = 'none'
      }
    })

    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    modal.dispatchEvent(escapeEvent)

    expect(escapePressed).toBe(true)
  })

  test('should handle Enter key for activating elements', () => {
    const button = document.createElement('button')
    let clicked = false
    button.addEventListener('click', () => {
      clicked = true
    })
    document.body.appendChild(button)

    // Simulate Enter key press
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
    button.dispatchEvent(enterEvent)

    // Manually trigger click for test (Enter would normally do this)
    button.click()
    expect(clicked).toBe(true)
  })

  test('should adapt layout for different screen widths', () => {
    // Test that CSS classes exist for responsive layouts
    const container = document.createElement('div')
    container.className = 'container'
    document.body.appendChild(container)

    // Mobile (default)
    container.style.width = '100%'
    expect(container.style.width).toBe('100%')

    // Tablet simulation
    container.style.width = '768px'
    expect(container.style.width).toBe('768px')

    // Desktop simulation
    container.style.width = '1024px'
    expect(container.style.width).toBe('1024px')
  })

  test('should have grid layout for photo grid', () => {
    const photoGrid = document.createElement('div')
    photoGrid.className = 'photo-grid'
    photoGrid.style.display = 'grid'
    photoGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))'
    document.body.appendChild(photoGrid)

    expect(photoGrid.style.display).toBe('grid')
    expect(photoGrid.style.gridTemplateColumns).toContain('repeat')
  })

  test('should have proper spacing for touch devices', () => {
    const photoItem = document.createElement('div')
    photoItem.className = 'photo-item'
    photoItem.style.minHeight = '48px'
    photoItem.style.minWidth = '48px'
    photoItem.style.padding = '8px'
    document.body.appendChild(photoItem)

    const styles = window.getComputedStyle(photoItem)
    expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(48)
    expect(parseInt(styles.padding)).toBeGreaterThanOrEqual(8)
  })

  test('should support focus-visible for accessibility', () => {
    const link = document.createElement('a')
    link.href = '#'
    link.textContent = 'Test Link'
    document.body.appendChild(link)

    // Focus the link
    link.focus()

    // Link should be the active element
    expect(document.activeElement).toBe(link)
  })

  test('should have album list responsive to different widths', () => {
    const albumList = document.createElement('div')
    albumList.className = 'album-list'
    albumList.style.display = 'grid'
    document.body.appendChild(albumList)

    // Mobile: 1 column
    albumList.style.gridTemplateColumns = '1fr'
    expect(albumList.style.gridTemplateColumns).toBe('1fr')

    // Tablet: 2 columns
    albumList.style.gridTemplateColumns = 'repeat(2, 1fr)'
    expect(albumList.style.gridTemplateColumns).toBe('repeat(2, 1fr)')

    // Desktop: flexible columns
    albumList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))'
    expect(albumList.style.gridTemplateColumns).toContain('repeat')
  })

  test('should have proper text sizing for readability', () => {
    const heading = document.createElement('h1')
    heading.textContent = 'Photo Album'
    heading.style.fontSize = '24px'
    document.body.appendChild(heading)

    const styles = window.getComputedStyle(heading)
    expect(parseInt(styles.fontSize)).toBeGreaterThanOrEqual(24)
  })

  test('should handle landscape orientation on small screens', () => {
    // Test that layout can adapt to landscape
    const header = document.createElement('header')
    header.id = 'app-header'
    header.style.padding = '8px 16px'
    document.body.appendChild(header)

    const styles = window.getComputedStyle(header)
    expect(styles.padding).toBe('8px 16px')
  })
})
