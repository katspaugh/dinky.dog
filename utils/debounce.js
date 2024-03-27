const RAF_TIMEOUT = 16

export function debounce(fn, delay) {
  let timeout
  return function(...args) {
    clearTimeout(timeout)

    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        requestAnimationFrame(async () => {
          const resut = await fn.apply(this, args)
          resolve(resut)
        })
      }, delay - RAF_TIMEOUT)
    })
  }
}

export function throttle(fn, delay) {
  let last = 0
  let rafId
  delay -= RAF_TIMEOUT
  return function(...args) {
    const now = Date.now()
    if (now - last < delay) {
      return Promise.resolve()
    }
    last = now
    if (rafId) cancelAnimationFrame(rafId)
    return (rafId = requestAnimationFrame(() => fn.apply(this, args)))
  }
}
