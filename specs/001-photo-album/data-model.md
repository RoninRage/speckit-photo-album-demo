# Data Model: Photo Album Application

**Created**: January 14, 2026  
**Version**: 1.0  
**Storage**: IndexedDB (client-side browser)

## Entity Definitions

### Album

Represents a collection of photos created by the user.

**Schema**:
```
{
  id: string (UUID),           // Unique identifier, auto-generated
  name: string,                // User-provided album name (1-255 chars)
  createdAt: number (ms),      // Unix timestamp of creation
  photoCount: number           // Denormalized count (synced with photos)
}
```

**Constraints**:
- `id`: Primary key, unique, immutable
- `name`: Required, cannot be empty, max 255 characters
- `createdAt`: Auto-set on creation, immutable
- `photoCount`: Auto-updated when photos are added/removed (denormalized for performance)

**Relationships**:
- One Album → Many Photos (1:N)
- Foreign key: Photos reference Album via `albumId`

**Lifecycle**:
- **Create**: User provides name, system generates UUID and timestamp
- **Read**: List all albums, open specific album with photos
- **Update**: Rename album (name only), update photoCount when photos change
- **Delete**: Only allowed when photoCount === 0 (empty album)

**Validation Rules**:
- Album name cannot contain only whitespace
- Cannot delete non-empty albums
- Cannot create two albums with identical names (no constraint, allowed by design)

---

### Photo

Represents a single image file stored in an album.

**Schema**:
```
{
  id: string (UUID),           // Unique identifier, auto-generated
  albumId: string (UUID),      // References Album.id
  name: string,                // Original filename or auto-generated
  dataUrl: string (base64),    // Image data as data URL (base64-encoded)
  format: string,              // JPEG | PNG | WebP
  position: number,            // Display order within album (0-indexed)
  createdAt: number (ms),      // Unix timestamp of upload
  thumbnailGenerated: boolean  // Whether thumbnail has been cached
}
```

**Constraints**:
- `id`: Primary key, unique, immutable
- `albumId`: Required, foreign key to Album, immutable
- `name`: Auto-generated from filename or timestamp
- `dataUrl`: Required, must be valid base64-encoded image
- `format`: One of: JPEG, PNG, WebP
- `position`: Non-negative integer, unique per album (enforced by app logic)
- `createdAt`: Auto-set on creation, immutable

**Relationships**:
- Many Photos → One Album (N:1)
- Indexed by (albumId, position) for efficient queries and reordering

**Lifecycle**:
- **Create**: User uploads file, system converts to base64 data URL, generates UUID, assigns position
- **Read**: List photos in album (query by albumId, order by position), display thumbnail
- **Update**: Change position within album (reorder), update position of affected siblings
- **Delete**: Remove from database, decrement Album.photoCount, reorder remaining photos

**Validation Rules**:
- File must be valid JPEG, PNG, or WebP (checked by MIME type + magic bytes)
- File size validation: must fit in remaining IndexedDB quota
- dataUrl must be valid and decodable
- position must maintain order (0 to photoCount-1)

**Special Rules**:
- **Identity Preservation**: When a photo is moved to a different album, its `id` is preserved (clarification Q1)
- **Move Operation**: Update albumId, may update position; old album's photoCount decremented, new album's photoCount incremented
- **Reorder Operation**: Update position of moved photo and affected siblings; only within same album

---

## IndexedDB Schema

### Object Stores

#### `albums` Store

```javascript
{
  keyPath: 'id',           // Primary key
  autoIncrement: false     // ID manually provided (UUID)
}
```

**Indexes**: None (small dataset, query by ID only)

#### `photos` Store

```javascript
{
  keyPath: 'id',           // Primary key
  autoIncrement: false     // ID manually provided (UUID)
}
```

**Indexes**:
- `albumId`: Non-unique index, allows query all photos by album
- `(albumId, position)`: Composite index for efficient ordering queries
  ```javascript
  db.createIndex('albumId_position', ['albumId', 'position'], { unique: false })
  ```

---

## Data Flow & Operations

### Create Album
```
User Input: name
↓
Generate: id = UUID(), createdAt = now(), photoCount = 0
↓
Insert into albums store
↓
Update UI: add to album list
```

### Upload Photo
```
User Input: File (JPEG/PNG/WebP)
↓
Validate: format, size (fits in quota)
↓
Convert: FileReader.readAsDataURL → base64 dataUrl
↓
Generate: id = UUID(), createdAt = now(), position = currentPhotoCount
↓
Insert into photos store with albumId reference
↓
Update: albums.photoCount += 1
↓
Update UI: add to photo grid
```

### Move Photo Between Albums
```
User Input: Drag photo from album A to album B
↓
Retrieve: photo record
↓
Update: photo.albumId = albumB.id, photo.position = albumB.photoCount
↓
Save: updated photo record
↓
Update: albums[A].photoCount -= 1, albums[B].photoCount += 1
↓
Update UI: remove from A's grid, add to B's grid
```

### Reorder Photos Within Album
```
User Input: Drag photo within album
↓
Retrieve: photo at old position, photos at new position range
↓
Update: photo.position = newPos, shift siblings as needed
↓
Save: all affected photo records
↓
Persist: IndexedDB transaction (atomic)
↓
Update UI: reorder grid
```

### Delete Photo
```
User Input: Delete photo + confirm
↓
Delete: photo record from store
↓
Update: album.photoCount -= 1
↓
Reorder: photos after deleted position (decrement their positions)
↓
Persist: IndexedDB transaction
↓
Update UI: remove from grid, update count
```

### Delete Album
```
User Input: Delete album (only if empty)
↓
Validate: photoCount === 0
↓
Delete: album record
↓
Update UI: remove from album list
```

### Persist Data Between Sessions
```
On App Load:
↓
Initialize IndexedDB connection
↓
Query: all albums and all photos
↓
Populate: in-memory state
↓
Render: UI

On Every Mutation:
↓
Update: in-memory state
↓
Update: IndexedDB (auto-save)
↓
Update: UI
```

---

## Storage Quota Management

**Browser Quotas** (typical):
- Desktop: 50-200 MB (varies by browser)
- Mobile: 50 MB (varies by browser/device)

**Photo Size Considerations**:
- JPEG: ~50-200 KB (user photo)
- PNG: ~100-300 KB (user photo)
- WebP: ~30-100 KB (user photo, smaller due to compression)

**Quota Handling**:
- Before upload: Estimate file size in base64 (≈1.33x original)
- Check: `remainingQuota >= estimatedSize`
- On Failure: Show "Storage is full" message, suggest deleting photos

**Optimization** (future consideration):
- Compress images on upload (reduce pixel dimensions or JPEG quality)
- Lazy-load photo data URLs (store references, load on-demand)
- Archive old photos (compress or remove from IndexedDB)

---

## Consistency & Transactions

**Auto-Save Strategy**:
- Every mutation (create, update, delete) immediately persists to IndexedDB
- No explicit "save" button (real-time sync)
- IndexedDB transactions ensure atomicity for multi-record updates

**Reordering Transaction** (example: reorder photo from position 2 to 1):
```javascript
db.transaction('photos', 'readwrite').objectStore('photos').putAll([
  { ...photo1, position: 2 },  // position 1 → 2
  { ...photo2, position: 1 }   // position 2 → 1
])
// Atomic: either both succeed or both fail
```

**Multi-Tab Independence** (clarification Q4):
- Each tab maintains independent state
- Changes in one tab do NOT automatically sync to other tabs
- User must refresh other tabs to see changes
- No SharedWorker or BroadcastChannel usage required

---

## Denormalization & Performance

**Denormalized Field**: `Album.photoCount`

**Why Denormalized**:
- Avoid expensive COUNT query on every album list render
- Display photo count instantly without database query
- Must stay in sync with actual photo count (updated on photo add/remove)

**Sync Strategy**:
- On photo create: `album.photoCount += 1`
- On photo delete: `album.photoCount -= 1`
- On photo move: source album `-= 1`, target album `+= 1`
- Validation: periodic scan (optional) to detect/fix mismatches

---

## Summary

| Entity | Count | Record Size | Typical Total |
|--------|-------|-------------|---|
| Album | ~100 | ~100 bytes | ~10 KB |
| Photo | ~1000 | ~100 KB (base64) | ~100 MB |
| **Total** | | | **~100 MB** |

This fits comfortably within typical browser IndexedDB quotas, allowing personal photo collections of reasonable size.
