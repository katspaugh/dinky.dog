import { Component } from '../lib/component.js'
import { css } from '../lib/dom.js'
import { draggable } from '../lib/draggable.js'

export type DraggableEvents = {
  drag: { x: number; y: number; dx: number; dy: number }
  dragstart: { x: number; y: number }
  dragend: {}
}

export type DraggableProps = {
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
        zIndex: '2',
      },

      onpointerdown: () => {
        css(this.container, {
          zIndex: '3',
          cursor: 'grabbing',
        })
      },

      onpointerup: () => {
        css(this.container, {
          zIndex: '',
          cursor: '',
        })
      },
    })

    draggable(
      this.container,
      (dx, dy) => {
        const x = Math.round(this.props.x + dx)
        const y = Math.round(this.props.y + dy)
        this.emit('drag', { x, y, dx, dy })
        this.setProps({ x, y })
      },
      (x, y) => {
        this.emit('dragstart', { x, y })
      },
      () => {
        this.emit('dragend', {})

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
