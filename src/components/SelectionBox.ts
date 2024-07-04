import { Component } from '../lib/component.js'
import { draggable } from '../lib/draggable.js'

export type SelectionBoxEvents = {
  select: { x1: number; y1: number; x2: number; y2: number }
}

class Box extends Component<{}, {}> {
  constructor() {
    super('div', {
      style: {
        position: 'absolute',
        zIndex: '3',
        backgroundColor: 'rgba(100, 0, 100, 0.1)',
        userSelect: 'none',
        borderRadius: '4px',
      },
    })
  }
}

export class SelectionBox extends Component<{}, SelectionBoxEvents> {
  constructor(container: HTMLElement) {
    const boxComponent = new Box()
    const box = boxComponent.container

    super(container, undefined, [boxComponent])

    let width = 0
    let height = 0
    let startX = 0
    let startY = 0

    const update = () => {
      let x1 = startX
      let y1 = startY
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

      this.emit('select', { x1, y1, x2, y2 })
    }

    const isTouchDevice = matchMedia('(pointer: coarse)').matches
    if (isTouchDevice) return

    draggable(
      this.container,
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
        box.style.display = ''
      },
      () => {
        box.style.display = 'none'
      },
    )
  }
}
