import { Component } from '../lib/component.js'
import { css } from '../lib/dom.js'
import { draggable } from '../lib/draggable.js'

export type DraggableEvents = {
  drag: { x: number; y: number }
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
      },

      onpointerdown: () => {
        css(this.container, {
          zIndex: '2',
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
        const newProps = { x: this.props.x + dx, y: this.props.y + dy }
        this.emit('drag', newProps)
        this.setProps(newProps)
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
