/**
 * DOM Utility Functions
 * Helper functions for DOM manipulation and querying
 */

/**
 * Safely query a single element
 * @param {string} selector - CSS selector
 * @param {Element} [root] - Optional root element (defaults to document)
 * @returns {Element|null} Element or null
 */
export function querySelector(selector, root = document) {
  try {
    return root.querySelector(selector)
  } catch (e) {
    console.error('querySelector error:', selector, e)
    return null
  }
}

/**
 * Safely query multiple elements
 * @param {string} selector - CSS selector
 * @param {Element} [root] - Optional root element (defaults to document)
 * @returns {Element[]} Array of elements
 */
export function querySelectorAll(selector, root = document) {
  try {
    return Array.from(root.querySelectorAll(selector))
  } catch (e) {
    console.error('querySelectorAll error:', selector, e)
    return []
  }
}

/**
 * Create an element with optional content and attributes
 * @param {string} tag - HTML tag name
 * @param {Object} [options] - Configuration object
 * @param {string} [options.id] - Element ID
 * @param {string} [options.className] - CSS classes
 * @param {string} [options.text] - Text content
 * @param {string} [options.html] - HTML content
 * @param {Object} [options.attributes] - Additional attributes {key: value}
 * @param {Object} [options.dataset] - Data attributes {key: value}
 * @param {Element[]} [options.children] - Child elements
 * @returns {Element} Created element
 */
export function createElement(tag, options = {}) {
  const el = document.createElement(tag)

  if (options.id) el.id = options.id
  if (options.className) el.className = options.className
  if (options.text) el.textContent = options.text
  if (options.html) el.innerHTML = options.html

  if (options.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      el.setAttribute(key, value)
    }
  }

  if (options.dataset) {
    for (const [key, value] of Object.entries(options.dataset)) {
      el.dataset[key] = value
    }
  }

  if (options.children) {
    options.children.forEach(child => el.appendChild(child))
  }

  return el
}

/**
 * Add multiple classes to an element
 * @param {Element} el - Target element
 * @param {...string} classNames - Classes to add
 */
export function addClass(el, ...classNames) {
  if (!el) return
  el.classList.add(...classNames)
}

/**
 * Remove multiple classes from an element
 * @param {Element} el - Target element
 * @param {...string} classNames - Classes to remove
 */
export function removeClass(el, ...classNames) {
  if (!el) return
  el.classList.remove(...classNames)
}

/**
 * Toggle a class on an element
 * @param {Element} el - Target element
 * @param {string} className - Class to toggle
 * @param {boolean} [force] - Force add/remove
 */
export function toggleClass(el, className, force) {
  if (!el) return
  el.classList.toggle(className, force)
}

/**
 * Check if element has a class
 * @param {Element} el - Target element
 * @param {string} className - Class to check
 * @returns {boolean} True if has class
 */
export function hasClass(el, className) {
  if (!el) return false
  return el.classList.contains(className)
}

/**
 * Set multiple attributes on an element
 * @param {Element} el - Target element
 * @param {Object} attributes - Attributes {key: value}
 */
export function setAttributes(el, attributes) {
  if (!el) return
  for (const [key, value] of Object.entries(attributes)) {
    if (value === null || value === undefined) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, value)
    }
  }
}

/**
 * Set data attributes on an element
 * @param {Element} el - Target element
 * @param {Object} data - Data {key: value}
 */
export function setData(el, data) {
  if (!el) return
  for (const [key, value] of Object.entries(data)) {
    el.dataset[key] = value
  }
}

/**
 * Get data attribute value
 * @param {Element} el - Target element
 * @param {string} key - Data key
 * @returns {string|undefined} Data value
 */
export function getData(el, key) {
  if (!el) return undefined
  return el.dataset[key]
}

/**
 * Remove an element from the DOM
 * @param {Element} el - Element to remove
 */
export function remove(el) {
  if (!el) return
  if (el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

/**
 * Clear all children from an element
 * @param {Element} el - Target element
 */
export function clearChildren(el) {
  if (!el) return
  while (el.firstChild) {
    el.removeChild(el.firstChild)
  }
}

/**
 * Append multiple children to an element
 * @param {Element} parent - Parent element
 * @param {...Element} children - Children to append
 */
export function append(parent, ...children) {
  if (!parent) return
  children.forEach(child => {
    if (child instanceof Element) {
      parent.appendChild(child)
    } else if (typeof child === 'string') {
      parent.appendChild(document.createTextNode(child))
    }
  })
}

/**
 * Insert element before another
 * @param {Element} newEl - Element to insert
 * @param {Element} refEl - Reference element
 */
export function insertBefore(newEl, refEl) {
  if (!newEl || !refEl || !refEl.parentNode) return
  refEl.parentNode.insertBefore(newEl, refEl)
}

/**
 * Insert element after another
 * @param {Element} newEl - Element to insert
 * @param {Element} refEl - Reference element
 */
export function insertAfter(newEl, refEl) {
  if (!newEl || !refEl || !refEl.parentNode) return
  refEl.parentNode.insertBefore(newEl, refEl.nextSibling)
}

/**
 * Get computed style value
 * @param {Element} el - Target element
 * @param {string} prop - CSS property name
 * @returns {string} Computed value
 */
export function getStyle(el, prop) {
  if (!el) return ''
  return window.getComputedStyle(el).getPropertyValue(prop)
}

/**
 * Set inline styles
 * @param {Element} el - Target element
 * @param {Object} styles - Styles {property: value}
 */
export function setStyles(el, styles) {
  if (!el) return
  for (const [key, value] of Object.entries(styles)) {
    el.style[key] = value
  }
}

/**
 * Check if element is visible in viewport
 * @param {Element} el - Target element
 * @returns {boolean} True if visible
 */
export function isInViewport(el) {
  if (!el) return false
  const rect = el.getBoundingClientRect()
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  )
}

/**
 * Get element's position relative to viewport
 * @param {Element} el - Target element
 * @returns {Object} {top, bottom, left, right, width, height}
 */
export function getPosition(el) {
  if (!el) return null
  return el.getBoundingClientRect()
}

/**
 * Scroll element into view
 * @param {Element} el - Target element
 * @param {Object} [options] - Scroll options
 */
export function scrollIntoView(el, options = { behavior: 'smooth', block: 'nearest' }) {
  if (!el) return
  el.scrollIntoView(options)
}

/**
 * Disable an element (for buttons, inputs, etc)
 * @param {Element} el - Target element
 */
export function disable(el) {
  if (!el) return
  el.disabled = true
  addClass(el, 'disabled')
}

/**
 * Enable an element
 * @param {Element} el - Target element
 */
export function enable(el) {
  if (!el) return
  el.disabled = false
  removeClass(el, 'disabled')
}

/**
 * Focus an element
 * @param {Element} el - Target element
 */
export function focus(el) {
  if (!el) return
  el.focus()
}

/**
 * Check if element matches selector
 * @param {Element} el - Target element
 * @param {string} selector - CSS selector
 * @returns {boolean} True if matches
 */
export function matches(el, selector) {
  if (!el) return false
  return el.matches(selector)
}

/**
 * Find closest parent matching selector
 * @param {Element} el - Target element
 * @param {string} selector - CSS selector
 * @returns {Element|null} Closest matching parent or null
 */
export function closest(el, selector) {
  if (!el) return null
  return el.closest(selector)
}

/**
 * Get all siblings of an element
 * @param {Element} el - Target element
 * @returns {Element[]} Array of siblings (not including el)
 */
export function getSiblings(el) {
  if (!el || !el.parentNode) return []
  return Array.from(el.parentNode.children).filter(child => child !== el)
}

/**
 * Check if element is a descendant of another
 * @param {Element} parent - Potential parent
 * @param {Element} child - Potential child
 * @returns {boolean} True if child is descendant
 */
export function isDescendant(parent, child) {
  if (!parent || !child) return false
  return parent.contains(child)
}
