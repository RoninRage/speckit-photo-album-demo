# Project Constitution - Photo Album App

## Core Principles

### 1. Simplicity First
- Use vanilla JavaScript (ES6 modules, no frameworks)
- HTML5 semantic elements, CSS3 (Grid, Flexbox)
- Minimize external dependencies (only what we need)
- Clear, self-documenting code

### 2. Code Quality Standards
- Descriptive variable and function names
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- No magic numbers or strings

### 3. Testing Requirements
- Unit tests for Album and Photo models
- E2E tests for critical user flows (create album, add photo, drag-drop)
- Tests before implementation (TDD approach)
- Minimum 80% code coverage for core logic

### 4. User Experience
- Mobile-first: 320px minimum width
- Responsive breakpoints: 480px, 768px, 1024px
- Keyboard navigation support
- Focus indicators visible for accessibility
- Loading states for async operations

### 5. Performance Targets
- Initial page load < 1000ms (includes IndexedDB init)
- Image tile render < 100ms (even with 100+ photos)
- Drag-drop response < 50ms (no lag)
- Bundle size < 50KB (gzipped)

### 6. Storage & Data
- Client-side only (no backend)
- IndexedDB browser API (native, no library)
- Auto-save on every action
- Persist between sessions
- Handle quota exceeded gracefully

## Decision Rationale

These principles ensure:
- Fast development without framework overhead
- Quality code maintainable by small teams
- Reliable user experience
- Privacy (data stays on user's device)