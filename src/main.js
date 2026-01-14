/**
 * Photo Album Application
 * Main entry point for the SPA
 */
import { App } from './App.js'

console.log('Photo Album App initializing...')

// Application instance
let app = null

document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('DOM loaded, starting app...')

    // Create and initialize app
    app = new App()
    await app.init()

    console.log('App initialized successfully')
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
})

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  if (app) {
    app.destroy()
  }
})

// Handle unhandled errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})
