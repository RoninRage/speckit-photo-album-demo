# Tasks: Photo Album Application Development

**Feature**: Photo Album Application  
**Branch**: `001-photo-album`  
**Created**: January 14, 2026  
**Status**: Ready for implementation

## Overview

This document breaks down the Photo Album feature into granular, executable tasks organized by user story priority. Each task is:
- **Specific**: Clear, actionable, with file paths
- **Testable**: Includes acceptance criteria and test approach
- **Independent**: Can be worked on in parallel where marked [P]
- **Prioritized**: P1 stories (essential MVP) before P2 stories (enhancements)

## Phase Structure

- **Phase 0**: Project Setup & Infrastructure (setup build, testing, storage)
- **Phase 1**: User Story 1 & 2 (P1 - Core MVP: Albums, Upload, View)
- **Phase 2**: User Story 3 & 4 (P2 - Organization: Reorder, Move)
- **Phase 3**: User Story 5 (P2 - Maintenance: Delete)
- **Phase 4**: User Story 6 (P1 - Cross-cutting: Responsive Design, Persistence)
- **Phase 5**: Testing, Optimization, Documentation

---

## Phase 0: Project Setup & Infrastructure

### Initialize Project Structure

- [x] T001 Create project structure per technical plan (`src/`, `tests/`, configuration files)
- [x] T002 [P] Initialize `package.json` with Vite, Jest, Playwright dependencies
- [x] T003 [P] Create `vite.config.js` with development and build settings
- [x] T004 [P] Create `jest.config.js` for unit testing configuration
- [x] T005 [P] Create `playwright.config.js` for E2E testing configuration
- [x] T006 Create `index.html` entry point with semantic HTML structure in `src/index.html`
- [x] T007 [P] Create CSS foundation: `src/styles/variables.css` (color, spacing, typography)
- [x] T008 [P] Create CSS foundation: `src/styles/index.css` (global styles, layout)
- [x] T009 [P] Create CSS foundation: `src/styles/responsive.css` (breakpoints: 480px, 768px, 1024px)

### Initialize Data Model & Storage

- [x] T010 [P] Create `src/models/Album.js` with Album class (constructor, validation, getters)
- [x] T011 [P] Create `src/models/Photo.js` with Photo class (constructor, validation, getters)
- [x] T012 [P] Create `src/services/StorageService.js` - IndexedDB wrapper (init, CRUD templates)
- [x] T013 Create `src/utils/constants.js` with app constants (accepted formats, UI strings, breakpoints)
- [x] T014 [P] Create `src/utils/dom.js` with DOM helper functions (create element, select, append, remove)
- [x] T015 [P] Create `src/utils/events.js` with event utilities (debounce, stopPropagation, preventDefault)

### Setup Testing Framework

- [x] T016 Create base test files structure (`tests/unit/`, `tests/e2e/`)
- [x] T017 [P] Create `tests/unit/Album.test.js` test template
- [x] T018 [P] Create `tests/unit/Photo.test.js` test template
- [x] T019 [P] Create `tests/unit/StorageService.test.js` test template
- [x] T020 Create `tests/e2e/create-album.spec.js` E2E template
- [x] T021 Create `tests/e2e/upload-photo.spec.js` E2E template

### Setup Development Environment

- [x] T022 Run `npm install` to install all dependencies
- [x] T023 Verify `npm run dev` starts development server on http://localhost:5173
- [x] T024 Verify `npm run test:unit` runs Jest with watch mode
- [x] T025 Verify `npm run test:e2e` runs Playwright tests
- [x] T026 Document development workflow in comment at top of `src/main.js`

---

## Phase 1: User Story 1 & 2 - MVP Core (P1 Priority)

### US1: Create and View Albums

#### Data Model & Storage

- [x] T027 [P] [US1] Implement Album.js: constructor, validation, properties (id, name, createdAt, photoCount)
- [x] T028 [P] [US1] Write unit tests for Album class in `tests/unit/Album.test.js`
- [x] T029 [US1] Implement StorageService.createAlbum(name) → creates album, returns Album instance
- [x] T030 [US1] Implement StorageService.getAllAlbums() → returns all albums sorted by createdAt (newest first)
- [x] T031 [US1] Implement StorageService.updateAlbum(album) → updates album record in IndexedDB
- [x] T032 [US1] Implement StorageService.deleteAlbum(albumId) → deletes album (only if empty)
- [x] T033 [US1] Write unit tests for StorageService album operations in `tests/unit/StorageService.test.js`
- [x] T034 [US1] Implement StorageService.init() → initializes IndexedDB connection, creates object stores

#### UI Components

- [x] T035 [P] [US1] Create `src/components/AlbumList.js` class with constructor, render method
- [x] T036 [P] [US1] Implement AlbumList.render(albums) → displays all albums in list view
- [x] T037 [US1] Implement AlbumList.onAlbumSelected(callback) → subscribe to album click events
- [x] T038 [US1] Implement AlbumList.onCreateAlbum(callback) → subscribe to create album form submission
- [x] T039 [US1] Implement AlbumList.onDeleteAlbum(callback) → subscribe to delete album button clicks
- [x] T040 [US1] Implement AlbumList.updateAlbum(album) → update single album display (for count changes)
- [x] T041 [US1] Implement AlbumList.removeAlbum(albumId) → remove album from display
- [x] T042 [P] [US1] Create "Create Album" form in AlbumList (input field, submit button, modal or inline)
- [x] T043 [US1] Implement form validation: album name cannot be empty, max 255 chars
- [x] T044 [US1] Create `src/components/AlbumDetail.js` class with constructor, render method
- [x] T045 [US1] Implement AlbumDetail.render(album, photos) → displays album header with name, photo count
- [x] T046 [US1] Implement AlbumDetail.updateAlbumInfo(album) → update header when album changes

#### Application Logic & Main

- [x] T047 [P] [US1] Create `src/main.js` app initialization (init storage, render album list)
- [x] T048 [US1] Implement app state management: albums array, current album
- [x] T049 [US1] Implement create album flow: form submission → StorageService → render update
- [x] T050 [US1] Implement album selection flow: click → load album → switch to detail view
- [x] T051 [US1] Implement back button: detail view → return to album list

#### Testing - US1

- [x] T052 [US1] Write test: Album can be created with valid name
- [x] T053 [US1] Write test: Album name validation rejects empty names
- [x] T054 [US1] Write test: Albums displayed in reverse chronological order
- [x] T055 [US1] Write test: Clicking album opens detail view
- [x] T056 [US1] Write E2E test: Create album and verify it appears in list with date (`tests/e2e/create-album.spec.js`)

---

### US2: Upload and Preview Photos

#### Data Model & Storage

- [x] T057 [P] [US2] Implement Photo.js: constructor, validation, properties (id, albumId, name, dataUrl, format, position, createdAt)
- [x] T058 [P] [US2] Write unit tests for Photo class in `tests/unit/Photo.test.js`
- [x] T059 [US2] Implement StorageService.createPhoto(albumId, file, dataUrl) → creates photo, updates album count
- [x] T060 [US2] Implement StorageService.getPhotosByAlbum(albumId) → returns photos ordered by position
- [x] T061 [US2] Implement StorageService.deletePhoto(photoId) → deletes photo, reorders siblings
- [x] T062 [US2] Create IndexedDB indexes: (albumId), (albumId, position) for efficient queries
- [x] T063 [US2] Write unit tests for StorageService photo operations in `tests/unit/StorageService.test.js`

#### File Upload & Validation Service

- [x] T064 [P] [US2] Create `src/services/FileService.js` with validation constants (ACCEPTED_FORMATS, MAX_FILE_SIZE)
- [x] T065 [US2] Implement FileService.validateFile(file) → checks format and size
- [x] T066 [US2] Implement FileService.fileToDataUrl(file) → converts File to base64 data URL
- [x] T067 [US2] Implement FileService.validateDataUrl(dataUrl) → verifies valid base64 image
- [x] T068 [US2] Implement FileService.extractFormat(file) → extracts format from MIME type
- [x] T069 [P] [US2] Write unit tests for FileService in dedicated test file

#### UI Components for Upload

- [x] T070 [P] [US2] Update AlbumDetail with upload button and file input element in `src/components/AlbumDetail.js`
- [x] T071 [US2] Implement AlbumDetail.onUploadPhoto(callback) → subscribe to file selection events
- [x] T072 [US2] Create drag-and-drop zone in AlbumDetail for alternative upload method
- [x] T073 [US2] Add file input with accept=".jpg,.jpeg,.png,.webp" attribute
- [x] T074 [P] [US2] Create `src/components/PhotoGrid.js` class to display photos in responsive grid
- [x] T075 [US2] Implement PhotoGrid.render(photos, dataUrls) → display photos as square tiles
- [x] T076 [US2] Implement PhotoGrid.addPhoto(photo, dataUrl) → add new photo tile to grid
- [x] T077 [US2] Implement PhotoGrid.removePhoto(photoId) → remove photo tile
- [x] T078 [US2] Create responsive CSS grid: 1 col (320px), 2-3 cols (768px), 4+ cols (1024px)
- [x] T079 [US2] Implement photo thumbnail lazy-loading via Intersection Observer API
- [x] T080 [US2] Add loading state visual indicator while photo is processing

#### Application Logic for Upload

- [x] T081 [US2] Implement upload flow: file selected → validate → convert to data URL → save to storage
- [x] T082 [US2] Implement error handling for invalid files (show toast/alert, keep dialog open)
- [x] T083 [US2] Implement album photo count update after successful upload
- [x] T084 [US2] Implement photo grid refresh after each upload
- [x] T085 [US2] Implement storage quota check before upload (show message if full)

#### Testing - US2

- [x] T086 [US2] Write test: Photo created with valid JPEG file
- [x] T087 [US2] Write test: Photo creation rejects invalid file format
- [x] T088 [US2] Write test: FileService validates base64 data URLs
- [x] T089 [US2] Write test: Photo count increments after upload
- [x] T090 [US2] Write E2E test: Upload photo and verify it appears in grid (`tests/e2e/upload-photo.spec.js`)

---

## Phase 2: User Story 3 & 4 - Organization (P2 Priority)

### US3: Organize Photos Within Albums

#### Drag-Drop Service

- [x] T091 [P] [US3] Create `src/services/DragDropService.js` with drag-drop event handlers
- [x] T092 [P] [US3] Implement DragDropService.onDragStart(callback) → capture photo being dragged
- [x] T093 [US3] Implement DragDropService.onDragOver(callback) → visual feedback (highlight drop area)
- [x] T094 [US3] Implement DragDropService.onDrop(callback) → handle drop event with position data

#### Data Model for Reordering

- [x] T095 [US3] Implement StorageService.reorderPhotos(albumId, photos) → atomic transaction updating positions
- [x] T096 [US3] Implement position update logic: preserve gaps-free sequence (0, 1, 2, ...)

#### UI Components for Drag-Drop

- [x] T097 [P] [US3] Update PhotoGrid.js with drag-drop event listeners
- [x] T098 [US3] Implement PhotoGrid.onDragStart(callback) → subscribe to drag start on photo tiles
- [x] T099 [US3] Implement PhotoGrid.onDropPhoto(callback) → subscribe to drop within grid
- [x] T100 [US3] Implement PhotoGrid.updatePhotoOrder(photos) → reorder tiles in grid
- [x] T101 [US3] Implement PhotoGrid.setDragOverState(isOver) → visual feedback during drag
- [x] T102 [US3] Add CSS for drag-over state (border highlight, background color)
- [x] T103 [US3] Implement debounce on drag-drop events (max frequency 50ms)

#### Application Logic for Reordering

- [x] T104 [US3] Implement reorder flow: drag within album → calculate new position → save → refresh grid
- [x] T105 [US3] Implement position calculation: map drop target to position in grid
- [x] T106 [US3] Implement IndexedDB transaction for atomic position updates

#### Testing - US3

- [x] T107 [US3] Write test: Photo position updates on drag-drop
- [x] T108 [US3] Write test: Positions remain sequential (0, 1, 2) after reorder
- [x] T109 [US3] Write test: Reorder persists across page reload
- [x] T110 [US3] Write E2E test: Drag photo, verify new order persists (`tests/e2e/reorder-photos.spec.js`)

---

### US4: Move Photos Between Albums

#### Data Model for Moving

- [x] T111 [P] [US4] Implement StorageService.movePhoto(photoId, sourceAlbumId, targetAlbumId) → atomic transaction
- [x] T112 [US4] Implement move logic: update photo.albumId, update both albums' photo counts
- [x] T113 [US4] Implement position assignment: moved photo gets position = targetAlbumPhotoCount
- [x] T114 [US4] Implement source album photo reordering after move (positions 0, 1, 2...)

#### UI for Multi-Album Drag-Drop

- [ ] T115 [P] [US4] Update AlbumDetail.js to show all albums as potential drop targets (sidebar or modal)
- [ ] T116 [US4] Implement album list picker on drag-drop (if dragging outside grid, show album selector)
- [ ] T117 [US4] Add visual indicator: "Drop on album X to move" when dragging outside current album

#### Application Logic for Moving

- [x] T118 [US4] Implement move flow: drag from album A → drop on album B → update → refresh both
- [x] T119 [US4] Implement validation: cannot move to same album
- [x] T120 [US4] Implement error handling for invalid moves

#### Testing - US4

- [x] T121 [US4] Write test: Photo moves between albums with correct albumId update
- [x] T122 [US4] Write test: Photo counts update for both source and target albums
- [x] T123 [US4] Write test: Source album positions reorder after move
- [x] T124 [US4] Write E2E test: Drag photo between albums (`tests/e2e/move-photos.spec.js`)

---

## Phase 3: User Story 5 - Maintenance (P2 Priority)

### US5: Delete Photos and Albums

#### Delete Photo Logic

- [x] T125 [P] [US5] Create delete confirmation modal component in `src/components/DeleteConfirmationModal.js`
- [x] T126 [US5] Implement confirmation dialog for photo deletion
- [x] T127 [US5] Implement PhotoGrid with delete button on each photo tile
- [x] T128 [US5] Implement delete flow: click delete → show confirmation → confirm → delete → reorder
- [x] T129 [US5] Implement album photo count decrement after delete

#### Delete Album Logic

- [x] T130 [P] [US5] Implement album deletion UI: only show delete for empty albums (disabled state for non-empty)
- [x] T131 [US5] Implement delete album flow: click delete → show confirmation → confirm → delete
- [x] T132 [US5] Implement validation: prevent deletion of non-empty albums
- [x] T133 [US5] Implement album list refresh after deletion

#### Testing - US5

- [x] T134 [US5] Write test: Photo deleted after confirmation, count decrements
- [x] T135 [US5] Write test: Confirmation modal prevents deletion on cancel
- [x] T136 [US5] Write test: Album deletion prevented for non-empty albums
- [x] T137 [US5] Write test: Positions reorder after photo deletion
- [x] T138 [US5] Write E2E test: Delete photo with confirmation (`tests/e2e/delete-photo.spec.js`)

---

## Phase 4: User Story 6 - Cross-Cutting (P1 Priority)

### US6: Responsive Design and Data Persistence

#### Data Persistence

- [ ] T139 [P] [US6] Implement StorageService.init() → opens IndexedDB, creates object stores if needed
- [ ] T140 [US6] Implement auto-save: every mutation persists to IndexedDB immediately
- [ ] T141 [US6] Implement app initialization: load all albums/photos from storage on app start
- [ ] T142 [US6] Implement error handling: display message if local storage disabled
- [ ] T143 [US6] Write E2E test: Close browser, reopen, verify data persists (`tests/e2e/data-persistence.spec.js`)

#### Responsive Design

- [ ] T144 [P] [US6] Implement mobile breakpoint (320px): 1-column album list, 1-column photo grid
- [ ] T145 [P] [US6] Implement tablet breakpoint (768px): 2-column album list, 2-3 column photo grid
- [ ] T146 [P] [US6] Implement desktop breakpoint (1024px): 4+ column photo grid, sidebar for albums
- [ ] T147 [US6] Implement viewport meta tag in `index.html` for proper mobile scaling
- [ ] T148 [US6] Test layout on various screen sizes (use DevTools device emulation)
- [ ] T149 [P] [US6] Implement touch-friendly tap targets (min 48px on mobile)
- [ ] T150 [US6] Implement keyboard navigation (Tab, Enter, Escape)
- [ ] T151 [US6] Implement focus indicators for accessibility (outline on tab)

#### Storage Quota Management

- [ ] T152 [P] [US6] Implement StorageService.getStorageQuotaStatus() → estimate used/available
- [ ] T153 [US6] Implement quota check before upload: prevent if quota exceeded
- [ ] T154 [US6] Implement user message: "Storage is full. Delete photos to free space."
- [ ] T155 [US6] Test storage quota behavior manually (estimate sizes)

#### Testing - US6

- [ ] T156 [US6] Write test: App loads data from IndexedDB on startup
- [ ] T157 [US6] Write test: Responsive layout adapts to 320px, 768px, 1024px widths
- [ ] T158 [US6] Write test: Album and photo counts display correctly
- [ ] T159 [US6] Write E2E test: Responsive layout on mobile emulation
- [ ] T160 [US6] Write test: Storage quota message displays when full

---

## Phase 5: Testing, Optimization & Polish

### Test Coverage & Quality

- [ ] T161 [P] Run all unit tests: `npm run test:unit`
- [ ] T162 [P] Run all E2E tests: `npm run test:e2e`
- [ ] T163 [P] Check test coverage: `npm run test:coverage` → target 80%+ for core logic
- [ ] T164 Run accessibility audit: DevTools Lighthouse
- [ ] T165 Run performance audit: DevTools Lighthouse

### Build & Optimization

- [ ] T166 [P] Build for production: `npm run build`
- [ ] T167 [P] Verify bundle size: target < 50KB gzipped
- [ ] T168 [P] Minify and optimize: CSS and JavaScript
- [ ] T169 Test production build: `npm run preview`
- [ ] T170 [P] Verify performance metrics (using DevTools):
  - Load time < 1000ms
  - Photo grid render < 100ms
  - Drag-drop response < 50ms

### Documentation & Polish

- [ ] T171 Add JSDoc comments to all public methods
- [ ] T172 Create user guide for album/photo operations
- [ ] T173 Add error messages for all failure scenarios
- [ ] T174 Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] T175 Verify data persistence on different devices (if applicable)

### Final Validation

- [ ] T176 Validate all acceptance criteria from spec.md are met
- [ ] T177 Verify all success criteria from spec.md are met
- [ ] T178 Manual testing: complete workflow (create album → upload → reorder → move → delete)
- [ ] T179 Code review: check for quality, testing, documentation
- [ ] T180 Create deployment checklist and deployment guide

---

## Dependency Graph & Execution Order

### Critical Path (Must Complete In Order)

1. **Phase 0** (Infrastructure): T001 → T010 → T012 → T022-T026
2. **Phase 1a** (Album Model): T027 → T029-T032 → T047-T051
3. **Phase 1b** (Upload Model): T057 → T059-T062 (parallel with 1a)
4. **Phase 1c** (Upload UI): T070-T080 (depends on 1a + 1b)
5. **Phase 2** (Organize): T091 → T095 → T097-T104 (depends on Phase 1)
6. **Phase 3** (Delete): T125 → T128-T133 (depends on Phase 1)
7. **Phase 4** (Responsive): T139-T160 (can work in parallel with Phases 2-3)
8. **Phase 5** (Testing & Optimization): T161-T180 (final validation)

### Parallelizable Tasks

These can be worked on simultaneously:
- **T002-T005**: All package.json/config files (parallel)
- **T010-T012**: Model creation (parallel)
- **T017-T020**: Test templates (parallel)
- **T027 + T057**: Album and Photo models (parallel)
- **T074 + T091**: PhotoGrid and DragDropService (parallel)
- **T139-T143 + T144-T151**: Persistence and responsive design (parallel)

---

## Task Sizing & Effort Estimate

| Phase | Task Count | Estimated Effort | Notes |
|-------|-----------|------------------|-------|
| **Phase 0** | 26 | 8-12 hours | Foundation setup, includes testing setup |
| **Phase 1** | 64 | 20-30 hours | Core MVP (albums + upload), most critical |
| **Phase 2** | 34 | 12-18 hours | Organization features (drag-drop) |
| **Phase 3** | 14 | 6-10 hours | Delete operations with confirmation |
| **Phase 4** | 22 | 10-15 hours | Persistence, responsive design, quota |
| **Phase 5** | 20 | 8-12 hours | Testing, optimization, validation |
| **TOTAL** | 180 | 64-97 hours | ~2-2.5 weeks (2 developers) |

---

## MVP Scope (First Release)

**Minimum Viable Product includes**:
- Phase 0: All infrastructure tasks
- Phase 1: All MVP tasks (US1 + US2)
- Phase 4: Persistence & mobile responsiveness (minimal)
- Phase 5: Basic testing (unit + core E2E)

**MVP Excludes**:
- Phase 2: Advanced organization (reorder, move)
- Phase 3: Delete functionality (can use browser refresh to reset)
- Phase 5: Full optimization and multi-browser testing

**MVP Effort**: ~40-50 hours (~1 week with 1 developer)

---

## Quality Gates

### Before Merging to Main

- ✅ All Phase 0 tasks complete (no partial)
- ✅ All Phase 1 tasks complete (US1 + US2)
- ✅ Unit test coverage ≥ 80% for models and services
- ✅ E2E tests pass for critical flows (create, upload, persist)
- ✅ Performance metrics met (load < 1s, render < 100ms)
- ✅ No console errors or warnings
- ✅ Responsive layout verified on 3 screen sizes
- ✅ Code review approved

---

## Notes for Development Team

1. **Test-Driven Development**: Write tests first (T052 before T049, etc.)
2. **Incremental Commits**: Commit after each completed task, not at end of phase
3. **Auto-Save Strategy**: Design StorageService to persist every mutation atomically
4. **Tab Independence**: By design, changes in one tab don't auto-sync (per spec clarification)
5. **Drag-Drop Debouncing**: Required for performance (< 50ms response time)
6. **Bundle Size Target**: Watch for large dependencies; prefer native APIs
7. **Accessibility**: Ensure keyboard navigation works throughout (Tab, Enter, Escape)

---

## Success Metrics

✅ **Functionality**: All acceptance criteria from spec.md met  
✅ **Performance**: Page loads < 1000ms, grid renders < 100ms, drag < 50ms  
✅ **Quality**: 80%+ test coverage, zero console errors  
✅ **UX**: Works on mobile/tablet/desktop, intuitive flow, clear error messages  
✅ **Persistence**: Data persists between sessions reliably  
✅ **Code**: Well-organized modules, clear naming, documented, reviewable  

---

**Ready to begin development!** 🚀

Start with Phase 0 infrastructure, then tackle Phase 1 (MVP) tasks in order.
