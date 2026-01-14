/**
 * Event Utility Functions
 * Helper functions for event handling and management
 */

/**
 * Add event listener with optional options
 * @param {Element} el - Target element (or window/document)
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object|boolean} [options] - Event options or useCapture
 * @returns {Function} Cleanup function
 */
export function on(el, event, handler, options = false) {
  if (!el) return () => {}
  el.addEventListener(event, handler, options)
  // Return cleanup function
  return () => off(el, event, handler, options)
}

/**
 * Remove event listener
 * @param {Element} el - Target element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object|boolean} [options] - Event options or useCapture
 */
export function off(el, event, handler, options = false) {
  if (!el) return
  el.removeEventListener(event, handler, options)
}

/**
 * Add one-time event listener
 * @param {Element} el - Target element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @returns {Function} Cleanup function
 */
export function once(el, event, handler) {
  if (!el) return () => {}
  const wrappedHandler = (...args) => {
    handler(...args)
    off(el, event, wrappedHandler)
  }
  on(el, event, wrappedHandler)
  return () => off(el, event, wrappedHandler)
}

/**
 * Emit a custom event on an element
 * @param {Element} el - Target element
 * @param {string} eventName - Event name
 * @param {*} [detail] - Event detail data
 * @param {Object} [options] - Event options {bubbles, cancelable, composed}
 * @returns {boolean} Event result (not cancelled)
 */
export function emit(el, eventName, detail = null, options = {}) {
  if (!el) return true
  const event = new CustomEvent(eventName, {
    bubbles: options.bubbles ?? true,
    cancelable: options.cancelable ?? true,
    composed: options.composed ?? false,
    detail
  })
  return el.dispatchEvent(event)
}

/**
 * Create a debounced function
 * @param {Function} fn - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, wait = 300) {
  let timeout = null
  return function debounced(...args) {
    const call = () => fn.apply(this, args)
    clearTimeout(timeout)
    timeout = setTimeout(call, wait)
  }
}

/**
 * Create a throttled function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit = 300) {
  let inThrottle = false
  return function throttled(...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Wait for a specific event
 * @param {Element} el - Target element
 * @param {string} event - Event name
 * @param {number} [timeout] - Optional timeout in ms
 * @returns {Promise} Promise resolving to event
 */
export function waitFor(el, event, timeout = 0) {
  return new Promise((resolve, reject) => {
    const handler = (e) => {
      if (timer) clearTimeout(timer)
      resolve(e)
    }
    
    let timer = null
    if (timeout > 0) {
      timer = setTimeout(() => {
        off(el, event, handler)
        reject(new Error(`Event '${event}' timeout after ${timeout}ms`))
      }, timeout)
    }
    
    on(el, event, handler, { once: true })
  })
}

/**
 * Delegate event to child elements matching selector
 * @param {Element} parent - Parent element
 * @param {string} selector - Child selector
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @returns {Function} Cleanup function
 */
export function delegate(parent, selector, event, handler) {
  if (!parent) return () => {}
  
  const wrappedHandler = (e) => {
    const target = e.target.closest(selector)
    if (target && parent.contains(target)) {
      handler.call(target, e)
    }
  }
  
  return on(parent, event, wrappedHandler)
}

/**
 * Prevent default event behavior
 * @param {Event} e - Event object
 */
export function preventDefault(e) {
  if (!e) return
  e.preventDefault()
}

/**
 * Stop event propagation
 * @param {Event} e - Event object
 */
export function stopPropagation(e) {
  if (!e) return
  e.stopPropagation()
}

/**
 * Stop event propagation and prevent default
 * @param {Event} e - Event object
 */
export function stopEvent(e) {
  if (!e) return
  e.preventDefault()
  e.stopPropagation()
}

/**
 * Get keyboard event key name
 * @param {KeyboardEvent} e - Keyboard event
 * @returns {string} Key name (Space, Enter, Escape, etc.)
 */
export function getKey(e) {
  if (!e) return ''
  return e.key
}

/**
 * Check if specific key was pressed
 * @param {KeyboardEvent} e - Keyboard event
 * @param {string|string[]} key - Key(s) to check
 * @returns {boolean} True if key matches
 */
export function isKey(e, key) {
  if (!e) return false
  const keys = Array.isArray(key) ? key : [key]
  return keys.includes(e.key)
}

/**
 * Check if modifier keys pressed
 * @param {KeyboardEvent|MouseEvent} e - Event
 * @param {Object} [modifiers] - Modifiers to check {ctrl, shift, alt, meta}
 * @returns {boolean} True if all specified modifiers match
 */
export function checkModifiers(e, modifiers = {}) {
  if (!e) return false
  return (
    (modifiers.ctrl === undefined || modifiers.ctrl === e.ctrlKey) &&
    (modifiers.shift === undefined || modifiers.shift === e.shiftKey) &&
    (modifiers.alt === undefined || modifiers.alt === e.altKey) &&
    (modifiers.meta === undefined || modifiers.meta === e.metaKey)
  )
}

/**
 * Create keyboard shortcut matcher
 * @param {string} combination - Key combination (e.g., "ctrl+s", "meta+k", "shift+enter")
 * @returns {Function} Matcher function that checks KeyboardEvent
 */
export function createKeyboardMatcher(combination) {
  const parts = combination.toLowerCase().split('+')
  const modifiers = {}
  let key = ''

  parts.forEach(part => {
    if (part === 'ctrl') modifiers.ctrl = true
    else if (part === 'shift') modifiers.shift = true
    else if (part === 'alt') modifiers.alt = true
    else if (part === 'meta') modifiers.meta = true
    else key = part
  })

  return (e) => {
    return checkModifiers(e, modifiers) && getKey(e).toLowerCase() === key
  }
}

/**
 * Create animation frame helper
 * @param {Function} callback - Animation frame callback
 * @returns {Function} Cleanup function
 */
export function onAnimationFrame(callback) {
  const id = requestAnimationFrame(callback)
  return () => cancelAnimationFrame(id)
}

/**
 * Create multiple animation frames
 * @param {Function} callback - Callback after N frames
 * @param {number} [count] - Number of frames to wait (default 1)
 * @returns {Promise} Promise resolving after N frames
 */
export function waitFrames(count = 1) {
  return new Promise(resolve => {
    let remaining = count
    const tick = () => {
      remaining--
      if (remaining > 0) {
        requestAnimationFrame(tick)
      } else {
        resolve()
      }
    }
    requestAnimationFrame(tick)
  })
}

/**
 * Create intersection observer for lazy loading, infinite scroll, etc
 * @param {Element} el - Element to observe
 * @param {Function} callback - Intersection callback ({isIntersecting, entry})
 * @param {Object} [options] - Observer options {root, rootMargin, threshold}
 * @returns {Function} Cleanup function
 */
export function onIntersection(el, callback, options = {}) {
  if (!el) return () => {}
  
  const observer = new IntersectionObserver(([entry]) => {
    callback({
      isIntersecting: entry.isIntersecting,
      entry
    })
  }, options)
  
  observer.observe(el)
  
  return () => observer.disconnect()
}

/**
 * Create resize observer
 * @param {Element} el - Element to observe
 * @param {Function} callback - Resize callback ({width, height, entry})
 * @returns {Function} Cleanup function
 */
export function onResize(el, callback) {
  if (!el) return () => {}
  
  const observer = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect
    callback({ width, height, entry })
  })
  
  observer.observe(el)
  
  return () => observer.disconnect()
}

/**
 * Create mutation observer
 * @param {Element} el - Element to observe
 * @param {Function} callback - Mutation callback (mutations, observer)
 * @param {Object} [options] - Observer options (default: {childList: true, subtree: true})
 * @returns {Function} Cleanup function
 */
export function onMutation(el, callback, options = { childList: true, subtree: true }) {
  if (!el) return () => {}
  
  const observer = new MutationObserver((mutations) => {
    callback(mutations, observer)
  })
  
  observer.observe(el, options)
  
  return () => observer.disconnect()
}
