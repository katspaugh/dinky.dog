import { Component } from '../lib/component.js'
import { css } from '../lib/dom.js'
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

      onpointerdown: (e: PointerEvent) => {
        css(this.container, {
          zIndex: '2',
          cursor: 'grabbing',
        })
      },

      onpointerup: (e: PointerEvent) => {
        css(this.container, {
          zIndex: '',
          cursor: 'grab',
        })
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
      () => {
        css(this.container, {
          zIndex: '',
          cursor: 'grab',
        })
      },
    )
  }

  render() {
    const { x, y } = this.props
    this.container.style.transform = `translate(${x}px, ${y}px)`
  }
}
