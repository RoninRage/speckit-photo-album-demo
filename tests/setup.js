/**
 * Jest test setup
 * Configures global test environment
 */

// Polyfill IndexedDB for tests
import 'fake-indexeddb/auto'

// Polyfill structuredClone for tests
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (val) => {
    return JSON.parse(JSON.stringify(val))
  }
}

