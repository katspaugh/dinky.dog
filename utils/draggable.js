export function makeDraggable(element, onDrag, onStart, onEnd, threshold = 3, longTouchThreshold = 300) {
  if (!element) return () => void 0

  let unsubscribeDocument = () => void 0
  let isDragging = false
  let touchStartTime = 0
  const isTouchDevice = matchMedia('(pointer: coarse)').matches

  const onPointerDown = (event) => {
    if (event.button !== 0) return

    touchStartTime = Date.now()

    event.stopPropagation()

    let startX = event.clientX
    let startY = event.clientY
    isDragging = false

    const onPointerMove = (event) => {
      console.log('onPointerMove', touchStartTime)
      // Check long press on touch devices
      if (isTouchDevice && Date.now() - touchStartTime < longTouchThreshold) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      const x = event.clientX
      const y = event.clientY
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

    const onPointerUp = () => {
      if (isDragging) {
        setTimeout(() => {
          isDragging = false
        }, 300)
        onEnd?.()
      }
      unsubscribeDocument()
    }

    const onTouchMove = (event) => {
      if (isDragging) {
        event.preventDefault()
      }
    }

    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointerleave', onPointerUp)
    document.addEventListener('touchmove', onTouchMove, { passive: false })

    unsubscribeDocument = () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('pointerleave', onPointerUp)
      document.removeEventListener('touchmove', onTouchMove)
    }
  }

  // Prevent clicks after dragging
  const onClick = (event) => isDragging && event.stopPropagation()

  element.addEventListener('pointerdown', onPointerDown)
  element.addEventListener('click', onClick, true)
  document.addEventListener('click', onClick, true)

  return () => {
    unsubscribeDocument()
    element.removeEventListener('pointerdown', onPointerDown)
    element.removeEventListener('click', onClick, true)
    document.removeEventListener('click', onClick, true)
    element.removeEventListener('touchstart', onTouchStart)
    element.removeEventListener('touchend', touchEnd)
  }
}
