export function debounce(fn: (...args: any[]) => void, ms: number) {
  let timer: number
  return function(...args: any[]) {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
