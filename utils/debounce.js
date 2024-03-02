export function debounce(fn, delay) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)

    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        requestAnimationFrame(() => {
          resolve(fn.apply(this, args))
        })
      }, delay)
    })
  }
}
