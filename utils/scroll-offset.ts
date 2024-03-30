let scrollElement: HTMLElement | null = null

export function getScrollOffset() {
  if (!scrollElement) {
    scrollElement = document.querySelector('#app') as HTMLElement
  }
  if (!scrollElement) {
    return { offsetX: 0, offsetY: 0 }
  }
  const { left, top } = scrollElement.getBoundingClientRect()
  const offsetX = -left + scrollElement.scrollLeft
  const offsetY = -top + scrollElement.scrollTop
  return { offsetX, offsetY }
}
