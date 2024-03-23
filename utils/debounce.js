export function debounce(fn, delay) {
  let timeout
  return function(...args) {
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

export function throttle(fn, delay) {
  let last = 0
  delay -= 16
  return function(...args) {
    const now = Date.now()
    if (now - last < delay) {
      return Promise.resolve()
    }

    last = now
    return requestAnimationFrame(() => fn.apply(this, args))
  }
}
