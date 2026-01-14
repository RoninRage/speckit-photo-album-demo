# Data Model Contracts: Photo Album Application

**Created**: January 14, 2026  
**Version**: 1.0  
**Defines**: IndexedDB schema and data validation contracts

## IndexedDB Database Schema

### Database Configuration

```javascript
{
  name: 'PhotoAlbumApp',
  version: 1,
  objectStores: [
    {
      name: 'albums',
      keyPath: 'id',
      indexes: []
    },
    {
      name: 'photos',
      keyPath: 'id',
      indexes: [
        { name: 'albumId', keyPath: 'albumId' },
        { name: 'albumId_position', keyPath: ['albumId', 'position'] }
      ]
    }
  ]
}
```

---

## Object Store: `albums`

### Schema Definition

```typescript
interface Album {
  id: string;                  // UUID (primary key)
  name: string;               // Album name (1-255 chars)
  createdAt: number;          // Unix timestamp (milliseconds)
  photoCount: number;         // Denormalized count of photos
}
```

### Record Example

```javascript
{
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Vacation 2024',
  createdAt: 1705276800000,   // Jan 15, 2024
  photoCount: 42
}
```

### Indexes

**None** - Small dataset, lookups are by primary key only

### Constraints

| Field | Type | Required | Unique | Constraints |
|-------|------|----------|--------|-------------|
| `id` | string | Yes | Yes | UUID format, immutable |
| `name` | string | Yes | No | 1-255 chars, cannot be blank |
| `createdAt` | number | Yes | No | Unix timestamp, immutable |
| `photoCount` | number | Yes | No | ≥ 0, auto-updated |

### Validation Rules

```javascript
function validateAlbum(album) {
  // id: must be valid UUID
  if (!isValidUUID(album.id)) throw new Error('Invalid album ID')

  // name: not empty, not just whitespace, max 255 chars
  if (!album.name || album.name.trim().length === 0) {
    throw new Error('Album name cannot be empty')
  }
  if (album.name.length > 255) {
    throw new Error('Album name too long (max 255 chars)')
  }

  // createdAt: must be valid timestamp
  if (!Number.isInteger(album.createdAt) || album.createdAt <= 0) {
    throw new Error('Invalid creation timestamp')
  }

  // photoCount: must be non-negative integer
  if (!Number.isInteger(album.photoCount) || album.photoCount < 0) {
    throw new Error('Invalid photo count')
  }
}
```

### CRUD Contracts

```javascript
// CREATE
const album = await storageService.createAlbum('My Album')
// Precondition: name is valid string
// Postcondition: album.id exists, album.photoCount === 0

// READ
const album = await storageService.getAlbum(albumId)
// Precondition: albumId is valid UUID string
// Postcondition: album object returned or null if not found

const albums = await storageService.getAllAlbums()
// Precondition: none
// Postcondition: array of albums in creation order (oldest first)

// UPDATE
await storageService.updateAlbum({...album, photoCount: 5})
// Precondition: album exists, photoCount is valid
// Postcondition: album updated in store

// DELETE
await storageService.deleteAlbum(albumId)
// Precondition: album exists, photoCount === 0
// Postcondition: album removed from store
```

---

## Object Store: `photos`

### Schema Definition

```typescript
interface Photo {
  id: string;                 // UUID (primary key)
  albumId: string;            // Foreign key → Album.id
  name: string;               // Filename or auto-generated name
  dataUrl: string;            // Base64-encoded image data
  format: string;             // 'JPEG' | 'PNG' | 'WebP'
  position: number;           // Display order (0-indexed, unique per album)
  createdAt: number;          // Unix timestamp (milliseconds)
  thumbnailGenerated: boolean;// Optimization flag
}
```

### Record Example

```javascript
{
  id: '660e8400-e29b-41d4-a716-446655440001',
  albumId: '550e8400-e29b-41d4-a716-446655440000',
  name: 'beach-sunset.jpg',
  dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABA...',
  format: 'JPEG',
  position: 0,
  createdAt: 1705276801000,
  thumbnailGenerated: true
}
```

### Indexes

**Index 1: `albumId`**
```javascript
objectStore.createIndex('albumId', 'albumId', { unique: false })
// Query: Get all photos in an album
// Usage: store.index('albumId').getAll(albumId)
```

**Index 2: `albumId_position`**
```javascript
objectStore.createIndex('albumId_position', ['albumId', 'position'], { unique: false })
// Query: Get all photos in album in display order
// Usage: store.index('albumId_position').getAll(IDBKeyRange.bound([albumId, 0], [albumId, Infinity]))
```

### Constraints

| Field | Type | Required | Unique | Constraints |
|-------|------|----------|--------|-------------|
| `id` | string | Yes | Yes | UUID format, immutable |
| `albumId` | string | Yes | No | Foreign key, immutable, must reference existing Album |
| `name` | string | Yes | No | 1-255 chars |
| `dataUrl` | string | Yes | No | Valid base64 data URL, immutable |
| `format` | string | Yes | No | One of: JPEG, PNG, WebP |
| `position` | number | Yes | No | ≥ 0, unique per album, immutable (except reorder) |
| `createdAt` | number | Yes | No | Unix timestamp, immutable |
| `thumbnailGenerated` | boolean | Yes | No | true/false |

### Validation Rules

```javascript
function validatePhoto(photo) {
  // id: must be valid UUID
  if (!isValidUUID(photo.id)) throw new Error('Invalid photo ID')

  // albumId: must be valid UUID
  if (!isValidUUID(photo.albumId)) throw new Error('Invalid album ID')

  // name: not empty, max 255 chars
  if (!photo.name || photo.name.length === 0) {
    throw new Error('Photo name cannot be empty')
  }
  if (photo.name.length > 255) {
    throw new Error('Photo name too long (max 255 chars)')
  }

  // dataUrl: must be valid base64 data URL
  if (!photo.dataUrl.startsWith('data:image/')) {
    throw new Error('Invalid data URL format')
  }
  if (!isValidBase64(photo.dataUrl)) {
    throw new Error('Invalid base64 data')
  }

  // format: must be one of accepted formats
  const validFormats = ['JPEG', 'PNG', 'WebP']
  if (!validFormats.includes(photo.format)) {
    throw new Error(`Invalid format: ${photo.format}`)
  }

  // position: must be non-negative integer
  if (!Number.isInteger(photo.position) || photo.position < 0) {
    throw new Error('Invalid position')
  }

  // createdAt: must be valid timestamp
  if (!Number.isInteger(photo.createdAt) || photo.createdAt <= 0) {
    throw new Error('Invalid creation timestamp')
  }

  // thumbnailGenerated: must be boolean
  if (typeof photo.thumbnailGenerated !== 'boolean') {
    throw new Error('Invalid thumbnailGenerated flag')
  }
}
```

### CRUD Contracts

```javascript
// CREATE
const photo = await storageService.createPhoto(albumId, file, dataUrl)
// Precondition: albumId exists, file is File, dataUrl is valid
// Postcondition: photo.id exists, photo.position === albumPhotoCount

// READ
const photo = await storageService.getPhoto(photoId)
// Precondition: photoId is valid UUID
// Postcondition: photo object or null if not found

const photos = await storageService.getPhotosByAlbum(albumId)
// Precondition: albumId exists
// Postcondition: array of photos ordered by position (0, 1, 2, ...)

// UPDATE
await storageService.updatePhoto({...photo, position: 5})
// Precondition: photo exists, position is valid
// Postcondition: photo updated in store

// DELETE
await storageService.deletePhoto(photoId)
// Precondition: photo exists
// Postcondition: photo removed, position gaps filled
```

### Batch Operations (Transactional)

#### Move Photo Between Albums

```javascript
await storageService.movePhoto(photoId, sourceAlbumId, targetAlbumId)

// Preconditions:
//   - photoId exists in sourceAlbumId
//   - targetAlbumId exists
//   - sourceAlbumId !== targetAlbumId

// Transaction:
//   1. UPDATE photo: albumId = targetAlbumId, position = targetAlbumPhotoCount
//   2. UPDATE sourceAlbum: photoCount -= 1
//   3. UPDATE targetAlbum: photoCount += 1
//   4. REORDER sourceAlbum photos (positions 0 to photoCount-1)

// Postcondition: photo moved, counts updated, all positions valid
```

#### Reorder Photos Within Album

```javascript
await storageService.reorderPhotos(albumId, photosWithNewPositions)

// Preconditions:
//   - photosWithNewPositions is array of Photo objects
//   - All photos belong to albumId
//   - New positions are 0 to (photoCount - 1) with no gaps

// Transaction:
//   1. UPDATE all photos with new position values
//   2. Verify positions are sequential 0, 1, 2, ...

// Postcondition: all photos updated, positions valid
```

---

## Data Type Specifications

### UUID Format

```javascript
// Format: RFC 4122 (Version 4)
// Example: '550e8400-e29b-41d4-a716-446655440000'
// Pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isValidUUID(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

function generateUUID() {
  return crypto.randomUUID()  // Native Web Crypto API
}
```

### Base64 Data URL

```javascript
// Format: 'data:<media-type>;base64,<base64-data>'
// Examples:
//   'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
//   'data:image/png;base64,iVBORw0KGgo...'
//   'data:image/webp;base64,UklGRi4A...'

function isValidDataUrl(dataUrl) {
  return /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(dataUrl)
}

function isValidBase64(dataUrl) {
  try {
    const base64Data = dataUrl.split(',')[1]
    atob(base64Data)  // Throws if invalid
    return true
  } catch {
    return false
  }
}
```

### Unix Timestamp

```javascript
// Format: Milliseconds since January 1, 1970 UTC
// Example: 1705276800000 represents Jan 15, 2024

function isValidTimestamp(ms) {
  return Number.isInteger(ms) && ms > 0 && ms <= Date.now()
}

function getCurrentTimestamp() {
  return Date.now()
}
```

---

## Storage Quota & Capacity

### Estimated Usage

```javascript
// Album record: ~100 bytes
// Photo record: dataUrl size + ~200 bytes metadata
// Base64 encoding: 1.33x original file size

// Example:
// - 100 albums: ~10 KB
// - 1000 photos (100 KB each in JPEG):
//   - Original: 100 MB
//   - Base64: 133 MB (1.33x)
//   - Total with IndexedDB overhead: ~135 MB
```

### Quota Check Contract

```javascript
const quota = await storageService.getStorageQuotaStatus()
// Returns: {
//   used: number,           // bytes used by this database
//   available: number,      // bytes remaining
//   percentUsed: number     // 0-100
// }

// Business logic:
// - If percentUsed >= 100: prevent upload, show "Storage full"
// - If percentUsed >= 80: warn user, suggest cleanup
// - If percentUsed < 80: proceed normally
```

---

## Summary

This contract defines:

1. **Exact schema** for albums and photos
2. **Validation rules** for all fields
3. **Index design** for query performance
4. **CRUD contracts** with pre/post-conditions
5. **Batch operation** atomicity guarantees
6. **Data types** and formats (UUID, base64, timestamp)
7. **Quota management** approach

Implementation must adhere to these contracts exactly. Any deviation requires re-evaluation of the specification and design.
