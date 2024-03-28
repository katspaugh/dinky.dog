export function makeDraggable(
  element: HTMLElement | SVGElement,
  onDrag: (dx: number, dy: number, x: number, y: number) => void,
  onStart?: (x: number, y: number) => void,
  onEnd?: () => void,
  threshold = 3,
) {
  if (!element) return () => void 0

  let isPointerDown = false
  let isDragging = false
  let startX = 0
  let startY = 0

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    e.stopPropagation()

    isPointerDown = true
    isDragging = false
    startX = e.clientX
    startY = e.clientY
  }

  const onPointerUp = (e) => {
    isPointerDown = false

    if (isDragging) {
      e.preventDefault()
      e.stopPropagation()

      setTimeout(() => {
        isDragging = false
      }, 300)

      onEnd?.()
    }
  }

  const onPointerMove = (e) => {
    if (!isPointerDown) return

    e.preventDefault()
    e.stopPropagation()

    const x = e.clientX
    const y = e.clientY
    const dx = x - startX
    const dy = y - startY

    if (isDragging || Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      if (!isDragging) {
        onStart?.(startX, startY)
        isDragging = true
      }

      onDrag(dx, dy, x, y)

      startX = x
      startY = y
    }
  }

  const onTouchMove = (e) => {
    if (isDragging) {
      e.preventDefault()
    }
  }

  // Prevent clicks after dragging
  const onClick = (event) => isDragging && event.stopPropagation()

  element.addEventListener('pointerdown', onPointerDown)
  element.addEventListener('click', onClick, true)

  document.addEventListener('click', onClick, true)
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('touchmove', onTouchMove, { passive: false })
  document.addEventListener('pointerup', onPointerUp)
  document.addEventListener('pointerleave', onPointerUp)
  document.addEventListener('pointercancel', onPointerUp)

  return () => {
    element.removeEventListener('pointerdown', onPointerDown)
    element.removeEventListener('click', onClick, true)
    document.removeEventListener('click', onClick, true)
    document.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('touchmove', onTouchMove)
    document.removeEventListener('pointerup', onPointerUp)
    document.removeEventListener('pointerleave', onPointerUp)
    document.removeEventListener('pointercancel', onPointerUp)
  }
}
