/**
 * Application Constants
 */

// Storage constants
export const STORAGE_NAME = 'photo-album-db'
export const STORAGE_VERSION = 1
export const STORE_ALBUMS = 'albums'
export const STORE_PHOTOS = 'photos'

// Limits and constraints
export const MAX_ALBUM_NAME_LENGTH = 255
export const MAX_PHOTO_NAME_LENGTH = 255
export const MAX_PHOTOS_PER_ALBUM = 10000
export const MAX_STORAGE_SIZE_BYTES = 50 * 1024 * 1024 // 50MB estimate for typical IndexedDB

// Supported formats
export const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp']
export const SUPPORTED_FORMAT_EXTENSIONS = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp']
}

// File size limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per photo
export const MIN_FILE_SIZE = 100 // 100 bytes

// UI Constants
export const TOAST_DURATION_MS = 4000
export const MODAL_ANIMATION_MS = 300
export const DRAG_OVERLAY_OPACITY = 0.7

// Drag-drop constants
export const DRAG_DROP_MIME_TYPE = 'application/json'
export const REORDER_DEBOUNCE_MS = 100
export const DRAG_PREVIEW_SCALE = 0.8

// Performance targets
export const PERF_TARGET_LOAD_MS = 1000
export const PERF_TARGET_RENDER_MS = 100
export const PERF_TARGET_DRAG_MS = 50
export const PERF_TARGET_BUNDLE_KB = 50

// Error messages
export const ERROR_MESSAGES = {
  INVALID_ALBUM_NAME: 'Album name must be 1-255 characters',
  INVALID_PHOTO_NAME: 'Photo name must be 1-255 characters',
  ALBUM_NOT_FOUND: 'Album not found',
  PHOTO_NOT_FOUND: 'Photo not found',
  STORAGE_FULL: 'Storage is full. Cannot upload more photos.',
  INVALID_FILE_TYPE: 'Invalid file type. Only JPEG, PNG, and WebP are supported.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  FILE_EMPTY: 'File is empty.',
  READ_ERROR: 'Failed to read file',
  STORAGE_ERROR: 'Storage error',
  DUPLICATE_ALBUM_NAME: 'Album with this name already exists',
  PHOTO_MOVE_FAILED: 'Failed to move photo'
}

// Success messages
export const SUCCESS_MESSAGES = {
  ALBUM_CREATED: 'Album created successfully',
  ALBUM_RENAMED: 'Album renamed successfully',
  ALBUM_DELETED: 'Album deleted successfully',
  PHOTO_UPLOADED: 'Photo uploaded successfully',
  PHOTO_MOVED: 'Photo moved successfully',
  PHOTOS_REORDERED: 'Photos reordered successfully',
  PHOTO_DELETED: 'Photo deleted successfully'
}

// Responsive breakpoints (must match CSS)
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440
}

// Grid layout
export const GRID_COLUMNS = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  wide: 4
}

// Z-index scale
export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal_backdrop: 400,
  modal: 500,
  toast: 600,
  tooltip: 700
}

// Animation timings
export const TRANSITION_TIMING = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms'
}

// Debounce and throttle times (ms)
export const DEBOUNCE_TIMES = {
  input: 300,
  resize: 150,
  scroll: 100
}
