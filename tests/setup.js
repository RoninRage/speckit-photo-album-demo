/**
 * Jest test setup
 * Configures global test environment
 */

// Polyfill IndexedDB for tests
import 'fake-indexeddb/auto'

// Suppress console errors during tests (optional)
global.console = {
  ...console,
  // Uncomment to suppress error logs in tests
  // error: jest.fn(),
}
