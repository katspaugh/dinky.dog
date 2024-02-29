export function debounce(fn, delay) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => requestAnimationFrame(() => fn.apply(this, args)), delay)
  }
}
