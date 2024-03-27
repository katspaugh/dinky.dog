import { Component, el } from '../utils/dom.js'
import { makeDraggable } from '../utils/draggable.js'
import { throttle } from '../utils/debounce.js'

export function SelectionBox({ onSelect, container }) {
  const box = el('div', {
    style: {
      position: 'absolute',
      zIndex: 3,
      backgroundColor: 'rgba(100, 0, 100, 0.1)',
      userSelect: 'none',
      borderRadius: '4px',
    },
  })

  const component = Component({
    container,
    children: [box],
  })

  let width = 0
  let height = 0
  let startX = 0
  let startY = 0
  let rect

  const update = throttle(() => {
    let x1 = startX - rect.left
    let y1 = startY - rect.top
    let x2 = x1 + width
    let y2 = y1 + height
    if (width < 0) {
      ;[x1, x2] = [x2, x1]
    }
    if (height < 0) {
      ;[y1, y2] = [y2, y1]
    }

    if (width < 0) {
      box.style.left = x2 + width + 'px'
    } else {
      box.style.left = x1 + 'px'
    }

    if (height < 0) {
      box.style.top = y2 + height + 'px'
    } else {
      box.style.top = y1 + 'px'
    }
    box.style.width = Math.abs(width) + 'px'
    box.style.height = Math.abs(height) + 'px'

    onSelect(x1, y1, x2, y2)
  }, 16)

  const isTouchDevice = matchMedia('(pointer: coarse)').matches
  if (!isTouchDevice) {
    makeDraggable(
      component.container,
      (dx, dy) => {
        width += dx
        height += dy
        update()
      },
      (x, y) => {
        startX = x
        startY = y
        width = 0
        height = 0
        rect = component.container.getBoundingClientRect()
        box.style.display = ''
      },
      () => {
        box.style.display = 'none'
      },
    )
  }

  return component
}
