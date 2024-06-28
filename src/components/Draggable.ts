import { Component } from '../lib/component.js'
import { draggable } from '../lib/draggable.js'

export type DraggableEvents = {
  drag: { dx: number; dy: number }
  dragstart: { x: number; y: number }
}

type DraggableProps = {
  x: number
  y: number
}

export class Draggable extends Component<DraggableProps, DraggableEvents> {
  constructor() {
    super('div', {
      style: {
        position: 'absolute',
        cursor: 'grab',
        userSelect: 'none',
      },
    })

    draggable(
      this.container,
      (dx, dy) => {
        this.emit('drag', { dx, dy })
      },
      (x, y) => {
        this.emit('dragstart', { x, y })
      },
    )
  }

  render(props: DraggableProps) {
    this.container.style.transform = `translate(${props.x}px, ${props.y}px)`
  }
}
