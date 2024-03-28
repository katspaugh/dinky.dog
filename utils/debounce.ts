const RAF_TIMEOUT = 16

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timeout)

    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        requestAnimationFrame(async () => {
          const resut = await fn(...args)
          resolve(resut)
        })
      }, delay - RAF_TIMEOUT)
    })
  }
}

export function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let last = 0
  let rafId: ReturnType<typeof requestAnimationFrame>
  delay -= RAF_TIMEOUT

  return (...args) => {
    const now = Date.now()
    if (now - last < delay) {
      return Promise.resolve()
    }
    last = now
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => fn(...args))
  }
}
