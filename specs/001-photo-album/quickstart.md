# Developer Quick Start Guide: Photo Album Application

**Version**: 1.0  
**Created**: January 14, 2026  
**Target**: First-time developers setting up the project

## Prerequisites

- **Node.js**: 16+ (for npm/package management)
- **npm**: 7+ (for package manager)
- **Modern browser**: Chrome, Firefox, Safari, or Edge (with ES6+ and IndexedDB support)
- **Code editor**: VS Code or similar

## Project Setup (5 minutes)

### 1. Clone the Repository

```bash
cd /path/to/your/workspace
git clone <repo-url>
cd speckit-photo-album-demo
git checkout 001-photo-album  # Switch to feature branch
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- **Vite**: Development server and build tool
- **Jest**: Unit testing framework
- **Playwright**: E2E testing framework

### 3. Start Development Server

```bash
npm run dev
```

**Output**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

Open `http://localhost:5173` in your browser. You should see a blank app (no albums yet).

### 4. Open DevTools

Press `F12` to open browser DevTools:
- **Console**: Check for any errors
- **Application → Storage → IndexedDB**: Inspect data as you use the app
- **Network**: Monitor any requests (should be none)

## File Structure Overview

```
src/
├── index.html              # Entry point
├── main.js                 # App initialization
├── styles/                 # Styling
├── models/                 # Album, Photo entities
├── services/               # Business logic
├── components/             # UI components
└── utils/                  # Helper functions

tests/
├── unit/                   # Unit tests (one test file per component)
└── e2e/                    # End-to-end tests (user flows)
```

**Key Files to Know**:

1. **`src/main.js`**: Application entry point, initializes storage and renders UI
2. **`src/models/Album.js`**: Album entity definition
3. **`src/models/Photo.js`**: Photo entity definition
4. **`src/services/StorageService.js`**: IndexedDB wrapper (core data layer)
5. **`src/components/AlbumList.js`**: Main UI component
6. **`tests/unit/`**: Test files for business logic

## Understanding the Architecture

### Data Flow: Create Album

```
User Input (form)
       ↓
AlbumList Component (onCreateAlbum)
       ↓
StorageService.createAlbum(name)
       ↓
Album entity created (new Album(name))
       ↓
IndexedDB insert
       ↓
UI updated (addAlbum to display)
```

### Data Flow: Upload Photo

```
User Input (file picker)
       ↓
AlbumDetail Component (onUploadPhoto)
       ↓
FileService.validateFile(file)  ← Error handling
       ↓
FileService.fileToDataUrl(file) ← Convert to base64
       ↓
StorageService.createPhoto(albumId, file, dataUrl)
       ↓
Photo entity created (new Photo(...))
       ↓
IndexedDB insert
       ↓
Album.photoCount incremented
       ↓
PhotoGrid updated (add tile)
```

## Common Development Tasks

### Task 1: Run Tests

**Unit tests** (models and services):
```bash
npm run test:unit
```

**E2E tests** (user flows):
```bash
npm run test:e2e
```

**All tests with coverage**:
```bash
npm run test:coverage
```

**Expected output**: Tests pass with 80%+ coverage

---

### Task 2: Add a New Component

Example: Add a "delete album" confirmation modal

**Steps**:

1. **Create the component file**:
   ```bash
   touch src/components/DeleteConfirmationModal.js
   ```

2. **Implement the component**:
   ```javascript
   // src/components/DeleteConfirmationModal.js
   export class DeleteConfirmationModal {
     constructor(containerId) {
       this.container = document.getElementById(containerId)
     }

     show(message, onConfirm, onCancel) {
       // Create modal DOM, show it
       // Attach event listeners to Confirm/Cancel buttons
     }

     hide() {
       // Hide modal from display
     }
   }
   ```

3. **Use in main component**:
   ```javascript
   // src/main.js
   import { DeleteConfirmationModal } from './components/DeleteConfirmationModal.js'

   const modal = new DeleteConfirmationModal('modal-container')
   // Show modal on delete action
   ```

4. **Test the component**:
   ```javascript
   // tests/unit/DeleteConfirmationModal.test.js
   describe('DeleteConfirmationModal', () => {
     it('should show modal with message', () => {
       // ...
     })
   })
   ```

---

### Task 3: Debug IndexedDB

**In Browser Console**:

```javascript
// Check if database exists
const request = indexedDB.open('PhotoAlbumApp')
request.onsuccess = (e) => {
  const db = e.target.result
  console.log('Stores:', Array.from(db.objectStoreNames))
}

// List all albums
const tx = db.transaction('albums')
const albums = tx.objectStore('albums').getAll()
albums.onsuccess = () => console.log(albums.result)

// List all photos
const photosTx = db.transaction('photos')
const photos = photosTx.objectStore('photos').getAll()
photos.onsuccess = () => console.log(photos.result)

// Clear all data (reset app)
db.deleteObjectStore('albums')
db.deleteObjectStore('photos')
```

---

### Task 4: Check Performance

**Using DevTools Performance Panel**:

1. Open DevTools → **Performance** tab
2. Click **Record** (circle button)
3. Perform action (create album, upload photo, drag-drop)
4. Click **Stop** (red button)
5. Analyze:
   - Look for red bars (long tasks)
   - Check timeline for smooth updates
   - Should see < 50ms for drag-drop, < 100ms for render

**Performance Budget**:
- Initial page load: < 1000ms
- Create album: < 100ms
- Upload photo: < 500ms
- Drag photo: < 50ms

If you see higher times, check for blocking JavaScript or large DOM operations.

---

### Task 5: Build for Production

```bash
npm run build
```

**Output**:
```
dist/
├── index.html
├── index-HASH.js        # Minified, bundled
└── style-HASH.css       # Minified CSS
```

**Result**: All code is minified and optimized. Bundle should be < 50KB gzipped.

**Test production build locally**:
```bash
npm run preview
```

Open `http://localhost:4173` to test the production build.

---

## Testing Checklist Before Committing

### Unit Tests

```bash
npm run test:unit
```

✅ All tests pass
✅ Coverage > 80% for core logic

### E2E Tests (Key Flows)

```bash
npm run test:e2e
```

Test each story manually in browser:
- ✅ Create album (appears in list)
- ✅ Upload photo (appears in grid)
- ✅ Drag to reorder (position changes)
- ✅ Drag between albums (appears in target)
- ✅ Delete photo (count decrements)
- ✅ Delete album (removed from list)
- ✅ Refresh browser (data persists)

### Performance Tests

```bash
npm run test:perf
```

Or manually:
- ✅ Page loads in < 1 second
- ✅ Album grid renders in < 100ms
- ✅ Drag-drop feels responsive (< 50ms)

### Build Tests

```bash
npm run build
npm run preview
```

✅ No build errors
✅ App works in preview
✅ Bundle size < 50KB gzipped

## Debugging Tips

### Issue: "Storage is full" immediately

**Cause**: IndexedDB quota exceeded
**Fix**:
```javascript
// In browser console
const db = await new Promise((res, rej) => {
  const req = indexedDB.open('PhotoAlbumApp')
  req.onsuccess = () => res(req.result)
})
db.deleteObjectStore('albums')
db.deleteObjectStore('photos')
```

### Issue: Drag-drop not working

**Cause**: Event handlers not attached
**Debug**:
```javascript
// In browser console, while dragging
window.addEventListener('dragover', (e) => {
  console.log('dragover', e.target)
})
```

### Issue: Photo not saving

**Cause**: IndexedDB transaction error
**Debug**:
```javascript
// Check browser console for errors
// Open DevTools → Application → IndexedDB → PhotoAlbumApp → photos
// Verify photo record exists
```

### Issue: Component not rendering

**Cause**: DOM container doesn't exist
**Fix**: Check that element with correct ID exists in `index.html`

## Next Steps After Setup

1. **Read the specs**: Review [spec.md](spec.md), [data-model.md](data-model.md), [contracts/](contracts/)
2. **Understand the flow**: Trace code from user action to IndexedDB
3. **Write tests first**: Use TDD (tests → implementation)
4. **Run tests frequently**: After every change
5. **Ask questions**: Check contracts and data model for clarifications

## Getting Help

- **Spec questions**: See [spec.md](spec.md) - User Stories & Acceptance Criteria
- **Data model questions**: See [data-model.md](data-model.md) - Entity definitions
- **API questions**: See [contracts/api.md](contracts/api.md) - Component interfaces
- **Storage questions**: See [contracts/models.md](contracts/models.md) - IndexedDB schema

## Resources

- **Vite Docs**: https://vitejs.dev/guide/
- **IndexedDB Docs**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **Drag & Drop API**: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
- **Jest Testing**: https://jestjs.io/
- **Playwright Testing**: https://playwright.dev/

---

**Ready to code!** 🚀

Start with understanding the data model, then implement one component at a time, writing tests first.
