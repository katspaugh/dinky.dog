import { Component } from '../lib/component.js'
import { draggable } from '../lib/draggable.js'

export type DraggableEvents = {
  drag: { dx: number; dy: number }
  dragstart: { x: number; y: number }
}

export class Draggable extends Component<DraggableEvents> {
  constructor() {
    super('div', {
      style: {
        position: 'absolute',
        cursor: 'grab',
        userSelect: 'none',
      },
    })

    let x = 0
    let y = 0

    this.input.subscribe((props) => {
      if (props.x !== undefined && props.y !== undefined) {
        x = props.x
        y = props.y
      }
    })

    draggable(
      this.container,
      (dx, dy) => {
        this.input.next({ x: x + dx, y: y + dy })
        this.emit('drag', { dx, dy })
      },
      (x, y) => {
        this.emit('dragstart', { x, y })
      },
    )
  }

  render(props: { x: number; y: number }) {
    if (props.x !== undefined && props.y !== undefined) {
      this.container.style.transform = `translate(${props.x}px, ${props.y}px)`
    }
  }
}
