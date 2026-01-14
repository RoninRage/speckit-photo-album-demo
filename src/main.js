/**
 * Photo Album Application
 * Main entry point for the SPA
 */

console.log('Photo Album App initializing...')

// Application will be implemented in Phase 1
// For now, just verify the app loads and basic structure is in place

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded')

  const main = document.querySelector('main')
  if (main) {
    console.log('Main element found')
  }

  // TODO: Initialize app components in Phase 1
  // - StorageService initialization
  // - AlbumList component rendering
  // - Event listeners setup
  // - Drag-drop initialization
})

// Handle unhandled errors
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})
