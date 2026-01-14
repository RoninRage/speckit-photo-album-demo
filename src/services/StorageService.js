/**
 * StorageService
 * Manages IndexedDB database operations for albums and photos
 */
import { Album } from '../models/Album.js'
import { Photo } from '../models/Photo.js'
import { STORAGE_NAME, STORAGE_VERSION, STORE_ALBUMS, STORE_PHOTOS } from '../utils/constants.js'

export class StorageService {
  constructor() {
    this.db = null
    this.initialized = false
  }

  /**
   * Initialize database (open/create)
   * @returns {Promise<IDBDatabase>} Database instance
   */
  async init() {
    if (this.initialized && this.db) {
      return this.db
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(STORAGE_NAME, STORAGE_VERSION)

      request.onerror = () => {
        reject(new Error(`Database open failed: ${request.error}`))
      }

      request.onsuccess = () => {
        this.db = request.result
        this.initialized = true
        resolve(this.db)
      }

      request.onupgradeneeded = (e) => {
        const db = e.target.result

        // Create albums store
        if (!db.objectStoreNames.contains(STORE_ALBUMS)) {
          db.createObjectStore(STORE_ALBUMS, { keyPath: 'id' })
        }

        // Create photos store with indexes
        if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
          const photoStore = db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' })
          photoStore.createIndex('albumId', 'albumId', { unique: false })
          photoStore.createIndex('albumId_position', ['albumId', 'position'], { unique: false })
        }
      }
    })
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.db) {
      this.db.close()
      this.db = null
      this.initialized = false
    }
  }

  /**
   * Clear all data
   * @returns {Promise<void>}
   */
  async clear() {
    const db = await this.init()
    return this._transaction([STORE_ALBUMS, STORE_PHOTOS], 'readwrite', (stores) => {
      stores.albums.clear()
      stores.photos.clear()
    })
  }

  // ==================== Album Operations ====================

  /**
   * Create a new album
   * @param {string} name - Album name
   * @returns {Promise<Album>} Created album
   */
  async createAlbum(name) {
    const album = new Album(name)
    const db = await this.init()

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ALBUMS, 'readwrite')
      const store = tx.objectStore(STORE_ALBUMS)
      const request = store.add(album.toJSON())

      request.onerror = () => reject(new Error(`Failed to create album: ${request.error}`))
      request.onsuccess = () => resolve(album)
    })
  }

  /**
   * Get album by ID
   * @param {string} id - Album ID
   * @returns {Promise<Album|null>} Album or null if not found
   */
  async getAlbum(id) {
    const db = await this.init()

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ALBUMS, 'readonly')
      const store = tx.objectStore(STORE_ALBUMS)
      const request = store.get(id)

      request.onerror = () => reject(new Error(`Failed to get album: ${request.error}`))
      request.onsuccess = () => {
        const data = request.result
        resolve(data ? Album.fromJSON(data) : null)
      }
    })
  }

  /**
   * Get all albums
   * @returns {Promise<Album[]>} Array of albums
   */
  async getAllAlbums() {
    const db = await this.init()

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ALBUMS, 'readonly')
      const store = tx.objectStore(STORE_ALBUMS)
      const request = store.getAll()

      request.onerror = () => reject(new Error(`Failed to get albums: ${request.error}`))
      request.onsuccess = () => {
        const albums = request.result.map(data => Album.fromJSON(data))
        resolve(albums)
      }
    })
  }

  /**
   * Update album
   * @param {Album} album - Album to update
   * @returns {Promise<void>}
   */
  async updateAlbum(album) {
    const db = await this.init()

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ALBUMS, 'readwrite')
      const store = tx.objectStore(STORE_ALBUMS)
      const request = store.put(album.toJSON())

      request.onerror = () => reject(new Error(`Failed to update album: ${request.error}`))
      request.onsuccess = () => resolve()
    })
  }

  /**
   * Delete album and all its photos
   * @param {string} albumId - Album ID
   * @returns {Promise<void>}
   */
  async deleteAlbum(albumId) {
    const db = await this.init()

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_ALBUMS, STORE_PHOTOS], 'readwrite')

      // Delete album
      const albumStore = tx.objectStore(STORE_ALBUMS)
      albumStore.delete(albumId)

      // Delete all photos in album
      const photoStore = tx.objectStore(STORE_PHOTOS)
      const index = photoStore.index('albumId')
      const range = IDBKeyRange.only(albumId)
      const request = index.openCursor(range)

      request.onsuccess = (e) => {
        const cursor = e.target.result
        if (cursor) {
          photoStore.delete(cursor.primaryKey)
          cursor.continue()
        }
      }

      tx.onerror = () => reject(new Error(`Failed to delete album: ${tx.error}`))
      tx.oncomplete = () => resolve()
    })
  }

  // ==================== Photo Operations ====================

  /**
   * Create a new photo
   * @param {string} albumId - Parent album ID
   * @param {string} name - Photo name
   * @param {string} dataUrl - Base64 data URL
   * @param {string} [format] - Image format
   * @returns {Promise<Photo>} Created photo
   */
  async createPhoto(albumId, name, dataUrl, format) {
    const db = await this.init()

    // Get current photo count in album for position
    const photos = await this.getPhotosByAlbum(albumId)
    const position = photos.length

    const photo = new Photo(albumId, name, dataUrl, format, undefined, position)

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PHOTOS, STORE_ALBUMS], 'readwrite')

      // Add photo
      const photoStore = tx.objectStore(STORE_PHOTOS)
      const photoRequest = photoStore.add(photo.toJSON())

      // Update album photo count
      const albumStore = tx.objectStore(STORE_ALBUMS)
      const albumRequest = albumStore.get(albumId)

      albumRequest.onsuccess = () => {
        const album = albumRequest.result
        if (album) {
          album.photoCount = (album.photoCount || 0) + 1
          albumStore.put(album)
        }
      }

      photoRequest.onerror = () => reject(new Error(`Failed to create photo: ${photoRequest.error}`))
      tx.oncomplete = () => resolve(photo)
      tx.onerror = () => reject(new Error(`Transaction failed: ${tx.error}`))
    })
  }

  /**
   * Get photo by ID
   * @param {string} id - Photo ID
   * @returns {Promise<Photo|null>} Photo or null if not found
   */
  async getPhoto(id) {
    const db = await this.init()

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PHOTOS, 'readonly')
      const store = tx.objectStore(STORE_PHOTOS)
      const request = store.get(id)

      request.onerror = () => reject(new Error(`Failed to get photo: ${request.error}`))
      request.onsuccess = () => {
        const data = request.result
        resolve(data ? Photo.fromJSON(data) : null)
      }
    })
  }

  /**
   * Get all photos in an album
   * @param {string} albumId - Album ID
   * @returns {Promise<Photo[]>} Array of photos, ordered by position
   */
  async getPhotosByAlbum(albumId) {
    const db = await this.init()

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PHOTOS, 'readonly')
      const store = tx.objectStore(STORE_PHOTOS)
      const index = store.index('albumId_position')
      const range = IDBKeyRange.bound([albumId, 0], [albumId, Number.MAX_SAFE_INTEGER])
      const request = index.getAll(range)

      request.onerror = () => reject(new Error(`Failed to get photos: ${request.error}`))
      request.onsuccess = () => {
        const photos = request.result.map(data => Photo.fromJSON(data))
        resolve(photos)
      }
    })
  }

  /**
   * Update photo
   * @param {Photo} photo - Photo to update
   * @returns {Promise<void>}
   */
  async updatePhoto(photo) {
    const db = await this.init()

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PHOTOS, 'readwrite')
      const store = tx.objectStore(STORE_PHOTOS)
      const request = store.put(photo.toJSON())

      request.onerror = () => reject(new Error(`Failed to update photo: ${request.error}`))
      tx.oncomplete = () => resolve()
    })
  }

  /**
   * Delete photo
   * @param {string} photoId - Photo ID
   * @returns {Promise<void>}
   */
  async deletePhoto(photoId) {
    const db = await this.init()

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PHOTOS, STORE_ALBUMS], 'readwrite')

      // Get photo to find album
      const photoStore = tx.objectStore(STORE_PHOTOS)
      const getRequest = photoStore.get(photoId)

      getRequest.onsuccess = () => {
        const photo = getRequest.result
        if (!photo) {
          reject(new Error('Photo not found'))
          return
        }

        const albumId = photo.albumId
        const deletedPosition = photo.position

        // Delete photo
        photoStore.delete(photoId)

        // Get all photos from the album to reorder them
        const albumIndex = photoStore.index('albumId')
        const albumPhotosRequest = albumIndex.getAll(albumId)

        albumPhotosRequest.onsuccess = () => {
          const albumPhotos = albumPhotosRequest.result

          // Filter out deleted photo and reorder remaining ones
          const remainingPhotos = albumPhotos
            .filter(p => p.id !== photoId)
            .sort((a, b) => a.position - b.position)

          // Update positions for all remaining photos
          remainingPhotos.forEach((p, index) => {
            if (p.position !== index) {
              p.position = index
              photoStore.put(p)
            }
          })

          // Update album photo count
          const albumStore = tx.objectStore(STORE_ALBUMS)
          const albumRequest = albumStore.get(albumId)

          albumRequest.onsuccess = () => {
            const album = albumRequest.result
            if (album) {
              album.photoCount = Math.max(0, (album.photoCount || 1) - 1)
              albumStore.put(album)
            }
          }
        }
      }

      tx.onerror = () => reject(new Error(`Failed to delete photo: ${tx.error}`))
      tx.oncomplete = () => resolve()
    })
  }

  /**
   * Move photo to different album
   * @param {string} photoId - Photo ID
   * @param {string} targetAlbumId - Target album ID
   * @returns {Promise<void>}
   */
  async movePhoto(photoId, targetAlbumId) {
    const db = await this.init()

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PHOTOS, STORE_ALBUMS], 'readwrite')

      // Get photo
      const photoStore = tx.objectStore(STORE_PHOTOS)
      const photoRequest = photoStore.get(photoId)

      photoRequest.onsuccess = () => {
        const photo = photoRequest.result
        if (!photo) {
          reject(new Error('Photo not found'))
          return
        }

        const oldAlbumId = photo.albumId

        // Get new position in target album
        const index = photoStore.index('albumId_position')
        const range = IDBKeyRange.bound([targetAlbumId, 0], [targetAlbumId, Number.MAX_SAFE_INTEGER])
        const countRequest = index.count(range)

        countRequest.onsuccess = () => {
          photo.albumId = targetAlbumId
          photo.position = countRequest.result
          photoStore.put(photo)

          // Reorder source album photos after removal
          if (oldAlbumId !== targetAlbumId) {
            const oldAlbumRange = IDBKeyRange.bound([oldAlbumId, 0], [oldAlbumId, Number.MAX_SAFE_INTEGER])
            const oldAlbumPhotosRequest = index.getAll(oldAlbumRange)

            oldAlbumPhotosRequest.onsuccess = () => {
              const oldAlbumPhotos = oldAlbumPhotosRequest.result
              // Filter out the moved photo and reorder positions (0, 1, 2, ...)
              oldAlbumPhotos
                .filter(p => p.id !== photoId)
                .sort((a, b) => a.position - b.position)
                .forEach((p, idx) => {
                  p.position = idx
                  photoStore.put(p)
                })
            }
          }

          // Update album counts
          const albumStore = tx.objectStore(STORE_ALBUMS)

          // Decrement old album
          const oldAlbumRequest = albumStore.get(oldAlbumId)
          oldAlbumRequest.onsuccess = () => {
            const oldAlbum = oldAlbumRequest.result
            if (oldAlbum) {
              oldAlbum.photoCount = Math.max(0, (oldAlbum.photoCount || 1) - 1)
              albumStore.put(oldAlbum)
            }
          }

          // Increment new album
          const newAlbumRequest = albumStore.get(targetAlbumId)
          newAlbumRequest.onsuccess = () => {
            const newAlbum = newAlbumRequest.result
            if (newAlbum) {
              newAlbum.photoCount = (newAlbum.photoCount || 0) + 1
              albumStore.put(newAlbum)
            }
          }
        }
      }

      tx.onerror = () => reject(new Error(`Failed to move photo: ${tx.error}`))
      tx.oncomplete = () => resolve()
    })
  }

  /**
   * Reorder photos in an album
   * @param {string} albumId - Album ID
   * @param {Array<{id: string, position: number}>} moves - Position updates
   * @returns {Promise<void>}
   */
  async reorderPhotos(albumId, moves) {
    const db = await this.init()

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PHOTOS, 'readwrite')
      const store = tx.objectStore(STORE_PHOTOS)

      moves.forEach(move => {
        const getRequest = store.get(move.id)
        getRequest.onsuccess = () => {
          const photo = getRequest.result
          if (photo && photo.albumId === albumId) {
            photo.position = move.position
            store.put(photo)
          }
        }
      })

      tx.onerror = () => reject(new Error(`Failed to reorder photos: ${tx.error}`))
      tx.oncomplete = () => resolve()
    })
  }

  // ==================== Utility Methods ====================

  /**
   * Get database size estimate (bytes)
   * @returns {Promise<Object>} {usage, quota} in bytes
   */
  async getStorageInfo() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { usage: 0, quota: 0 }
    }

    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0
    }
  }

  /**
   * Get remaining storage space
   * @returns {Promise<number>} Bytes available
   */
  async getRemainingStorage() {
    const info = await this.getStorageInfo()
    return info.quota - info.usage
  }

  /**
   * Check if storage is available and has space
   * @param {number} [requiredBytes] - Bytes needed (default 1MB)
   * @returns {Promise<boolean>} True if storage available
   */
  async hasStorage(requiredBytes = 1024 * 1024) {
    const remaining = await this.getRemainingStorage()
    return remaining > requiredBytes
  }

  /**
   * Internal transaction helper
   * @private
   */
  _transaction(stores, mode, callback) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const tx = this.db.transaction(stores, mode)
      const storeObjects = {}

      stores.forEach(store => {
        storeObjects[store] = tx.objectStore(store)
      })

      try {
        const result = callback(storeObjects)
        tx.onerror = () => reject(new Error(`Transaction failed: ${tx.error}`))
        tx.oncomplete = () => resolve(result)
      } catch (e) {
        reject(e)
      }
    })
  }
}

// Singleton instance
export const storageService = new StorageService()
