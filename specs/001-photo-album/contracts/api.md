# Component Contracts: Photo Album Application

**Created**: January 14, 2026  
**Version**: 1.0  
**Defines**: Component interfaces and function signatures

## Overview

Component architecture organized by responsibility:

```
UI Components
├── AlbumList          (display all albums, create album)
├── AlbumDetail        (display single album, upload photo)
└── PhotoGrid          (display photos in grid, enable drag-drop)

Services
├── StorageService     (IndexedDB CRUD)
├── FileService        (file upload, validation, conversion)
└── DragDropService    (drag-drop event handling)

Models
├── Album              (Album entity)
└── Photo              (Photo entity)
```

---

## UI Components

### AlbumList Component

**Responsibility**: Display list of all albums, allow album creation

**Interface**:
```javascript
class AlbumList {
  constructor(containerId)
    // containerId: DOM element to render into

  async render(albums: Album[])
    // Display all albums with name, creation date, photo count
    // Returns: Promise<void>

  onAlbumSelected(callback: (albumId: string) => void)
    // Subscribe to album selection events
    // Callback receives selected album ID

  onCreateAlbum(callback: (name: string) => void)
    // Subscribe to album creation form submission
    // Callback receives entered album name

  onDeleteAlbum(callback: (albumId: string) => void)
    // Subscribe to album deletion (requires confirmation)
    // Callback receives album ID to delete

  updateAlbum(album: Album)
    // Update single album in display (for count changes)

  removeAlbum(albumId: string)
    // Remove album from display
}
```

**Acceptance Criteria**:
- Display albums in reverse chronological order (newest first)
- Show album name, creation date, and photo count
- "Create Album" button opens modal/form
- Album deletion only offered for empty albums (photoCount === 0)
- Click on album navigates to detail view

---

### AlbumDetail Component

**Responsibility**: Display photos in selected album, handle photo upload

**Interface**:
```javascript
class AlbumDetail {
  constructor(containerId)

  async render(album: Album, photos: Photo[])
    // Display album name, photo count, upload button, and photo grid
    // Returns: Promise<void>

  onUploadPhoto(callback: (files: File[]) => void)
    // Subscribe to file selection (file input, drag-drop)
    // Callback receives selected File objects

  onPhotoSelected(callback: (photoId: string) => void)
    // Subscribe to photo click (for viewing/actions)

  onDeletePhoto(callback: (photoId: string) => void)
    // Subscribe to photo deletion request

  updateAlbumInfo(album: Album)
    // Update album name, photo count display

  addPhoto(photo: Photo, dataUrl: string)
    // Add new photo to grid

  removePhoto(photoId: string)
    // Remove photo from grid

  reorderPhotos(photos: Photo[])
    // Re-render photos in new order
}
```

**Acceptance Criteria**:
- Display album header with name and photo count
- Show upload button and drag-drop zone
- Display photo grid using PhotoGrid component
- Count updates when photos are added/removed

---

### PhotoGrid Component

**Responsibility**: Display photos in responsive grid, handle drag-drop interactions

**Interface**:
```javascript
class PhotoGrid {
  constructor(containerId)

  render(photos: Photo[], dataUrls: Map<string, string>)
    // Display photos as tiles in responsive CSS Grid
    // dataUrls: Map of photoId → base64 dataUrl

  onDragStart(callback: (photoId: string, source: string) => void)
    // Subscribe to drag start (source: 'album' or 'external')

  onDropPhoto(callback: (photoId: string, targetAlbumId?: string) => void)
    // Subscribe to photo drop
    // targetAlbumId: undefined if dropped in same album (reorder)

  updatePhotoOrder(photos: Photo[])
    // Reorder tiles based on new position array

  updatePhotoThumbnail(photoId: string, dataUrl: string)
    // Update single photo tile with new/cached thumbnail

  removePhoto(photoId: string)
    // Remove tile from grid

  setDragOverState(isOver: boolean)
    // Visual feedback when dragging over grid (border highlight, etc.)

  showLoadingState(photoId: string)
    // Show spinner/placeholder while photo is loading
}
```

**Acceptance Criteria**:
- Responsive grid: adapts to 320px (1 col), 768px (2-3 cols), 1024px (4+ cols)
- Photos display as square tiles with thumbnails
- Drag photo within grid to reorder (triggers reorder)
- Drag photo to another album (cross-album move)
- Click on photo → selection/details (future: view full size)
- Loading state visible during upload/thumbnail generation

---

## Services

### StorageService

**Responsibility**: IndexedDB CRUD operations with transactional consistency

**Interface**:
```javascript
class StorageService {
  constructor(dbName: string = 'PhotoAlbumApp', version: number = 1)

  async init(): Promise<void>
    // Initialize IndexedDB connection, create stores/indexes if needed

  // Album operations
  async getAlbum(albumId: string): Promise<Album | null>
  async getAllAlbums(): Promise<Album[]>
  async createAlbum(name: string): Promise<Album>
  async updateAlbum(album: Album): Promise<void>
  async deleteAlbum(albumId: string): Promise<void>

  // Photo operations
  async getPhoto(photoId: string): Promise<Photo | null>
  async getPhotosByAlbum(albumId: string): Promise<Photo[]>
  async createPhoto(albumId: string, file: File, dataUrl: string): Promise<Photo>
  async updatePhoto(photo: Photo): Promise<void>
  async deletePhoto(photoId: string): Promise<void>

  // Batch operations (transactional)
  async movePhoto(photoId: string, sourceAlbumId: string, targetAlbumId: string): Promise<void>
    // Update: photo.albumId, photo.position
    // Update: sourceAlbum.photoCount, targetAlbum.photoCount
    // Update: positions of photos in both albums
    // Atomic transaction

  async reorderPhotos(albumId: string, photos: Photo[]): Promise<void>
    // Update all photos' positions in album
    // Atomic transaction

  // Utility
  async getStorageQuotaStatus(): Promise<{used: number, available: number, percentUsed: number}>
    // Estimate storage usage and remaining quota
}
```

**Acceptance Criteria**:
- All CRUD operations are persisted immediately to IndexedDB
- Batch operations (move, reorder) are transactional (all-or-nothing)
- Errors throw meaningful exceptions
- Photo counts stay in sync with actual photos

---

### FileService

**Responsibility**: File validation, conversion, compression

**Interface**:
```javascript
class FileService {
  static readonly ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp']
  static readonly MAX_FILE_SIZE = 10 * 1024 * 1024  // 10 MB

  static validateFile(file: File): {valid: boolean, error?: string}
    // Check: format in ACCEPTED_FORMATS, size < MAX_FILE_SIZE
    // Returns: {valid: true} or {valid: false, error: "reason"}

  static async fileToDataUrl(file: File): Promise<string>
    // Convert File to base64 data URL using FileReader
    // Returns: 'data:image/jpeg;base64,...'

  static validateDataUrl(dataUrl: string): boolean
    // Verify dataUrl is valid base64 image data

  static extractFormat(file: File): 'JPEG' | 'PNG' | 'WebP' | 'UNKNOWN'
    // Extract format from MIME type

  static estimateQuotaUsage(dataUrl: string): number
    // Estimate storage size in bytes (base64 ≈ 1.33x original)
}
```

**Acceptance Criteria**:
- Rejects files that aren't JPEG/PNG/WebP
- Rejects files larger than quota allows
- Converts File to data URL successfully
- Provides clear error messages to user

---

### DragDropService

**Responsibility**: Handle native HTML5 drag-drop events

**Interface**:
```javascript
class DragDropService {
  constructor(gridElement: HTMLElement)

  onDragStart(callback: (photoId: string, source: 'local' | 'external') => void)
  onDragOver(callback: (event: DragEvent) => void)
  onDragLeave(callback: () => void)
  onDrop(callback: (photoId: string | null, targetAlbumId?: string) => void)
    // photoId: null if external file drop (future feature)
    // targetAlbumId: undefined if dropped in same album

  setDragData(photoId: string, albumId: string)
    // Set data being dragged (called on dragstart)

  getDragData(): {photoId: string, albumId: string} | null
    // Retrieve data from drop event

  preventDefaultAndStopPropagation(event: DragEvent)
    // Utility for drag-drop event handling
}
```

**Acceptance Criteria**:
- Drag within grid triggers reorder
- Drag between grids triggers move
- Drop on invalid target is rejected
- Visual feedback (drag-over highlight) is visible

---

## Models

### Album

**Responsibility**: Album data entity with validation

**Interface**:
```javascript
class Album {
  id: string                    // UUID, immutable
  name: string                  // User-provided name (1-255 chars)
  createdAt: number             // Unix timestamp, immutable
  photoCount: number            // Count of photos in album

  constructor(name: string)
    // Generate id (UUID), createdAt (now), photoCount (0)
    // Throw error if name is invalid

  static isValidName(name: string): boolean
    // Check: not empty, not just whitespace, length <= 255

  rename(newName: string): void
    // Update name with validation
    // Throw error if invalid

  toString(): string
    // Return: "Album: {name} ({photoCount} photos)"
}
```

---

### Photo

**Responsibility**: Photo data entity with validation

**Interface**:
```javascript
class Photo {
  id: string                    // UUID, immutable
  albumId: string               // Foreign key to Album, immutable
  name: string                  // Filename or auto-generated
  dataUrl: string               // Base64 image data
  format: 'JPEG' | 'PNG' | 'WebP'
  position: number              // Display order (0-indexed)
  createdAt: number             // Unix timestamp, immutable

  constructor(albumId: string, name: string, dataUrl: string, format: string)
    // Generate id (UUID), createdAt (now)

  static isValidDataUrl(dataUrl: string): boolean
    // Check: valid base64 format and starts with 'data:image/'

  static isValidFormat(format: string): boolean

  canMove(targetAlbumId: string): boolean
    // Validate: albumId !== targetAlbumId

  toString(): string
    // Return: "Photo: {name} (position {position})"
}
```

---

## Error Handling

### Expected Exceptions

```javascript
// File errors
class InvalidFileError extends Error {
  constructor(reason: string)  // "File format not supported", "File too large"
}

// Validation errors
class ValidationError extends Error {
  constructor(reason: string)  // "Album name cannot be empty"
}

// Storage errors
class StorageError extends Error {
  constructor(reason: string)  // "IndexedDB quota exceeded"
}

// Not found errors
class NotFoundError extends Error {
  constructor(type: string, id: string)  // "Album", "photo123"
}
```

### Error Recovery

- **InvalidFileError**: Catch during upload, show toast, keep dialog open
- **ValidationError**: Catch during create/update, show validation message
- **StorageError**: Catch during save, show "Storage is full" message, suggest cleanup
- **NotFoundError**: Catch during load, show "Album not found" (stale reference)

---

## Summary

These contracts define the boundaries between components, ensuring:
- Clear separation of concerns
- Testable interfaces (mocks easily)
- Predictable error handling
- Consistent data flow
