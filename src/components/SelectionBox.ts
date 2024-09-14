import { useCallback, useEffect, useRef, useState } from 'https://esm.sh/preact/hooks'
import { html } from '../lib/html.js'
import { draggable } from '../lib/draggable.js'

type SelectionBoxProps = {
  onChange: ({ x1, y1, x2, y2 }: { x1: number, y1: number, x2: number, y2: number }) => void
}

export function SelectionBox({ onChange }: SelectionBoxProps) {
  const [box, setBox] = useState<{ x1: number, y1: number, x2: number, y2: number }>({ x1: 0, y1: 0, x2: 0, y2: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const onDragStart = useCallback((x: number, y: number) => {
    setBox({ x1: x, y1: y, x2: x, y2: y })
  }, [])

  const onDrag = useCallback((dx: number, dy: number) => {
    setBox(prevBox => {
      const newBox = { ...prevBox, x2: prevBox.x2 + dx, y2: prevBox.y2 + dy }
      const flippedBox = { ...newBox }
      if (flippedBox.x2 < flippedBox.x1) {
        [flippedBox.x1, flippedBox.x2] = [flippedBox.x2, flippedBox.x1]
      }
      if (flippedBox.y2 < flippedBox.y1) {
        [flippedBox.y1, flippedBox.y2] = [flippedBox.y2, flippedBox.y1]
      }
      onChange(flippedBox)
      return newBox
    })
  }, [setBox, onChange])

  const onDragEnd = useCallback(() => {
    setBox( { x1: -10000, y1: -10000, x2: -10000, y2: - 10000 })
  }, [setBox])

  const isTouchDevice = matchMedia('(pointer: coarse)').matches
  if (isTouchDevice) return

  useEffect(() => {
    if (!ref.current) return
    return draggable(
      ref.current,
      onDrag,
      onDragStart,
      onDragEnd,
    )
  }, [ref, onDrag, onDragStart, onDragEnd])

  let width = box.x2 - box.x1
  let height = box.y2 - box.y1
  let left = box.x1
  let top = box.y1

  if (width < 0) {
    left = box.x2
    width = -width
  }

  if (height < 0) {
    top = box.y2
    height = -height
  }

  return html`<div class="SelectionBox" ref=${ref}>
    <div style="left: ${left}px; top: ${top}px; width: ${width}px; height: ${height}px;" />
  </div>`
}
