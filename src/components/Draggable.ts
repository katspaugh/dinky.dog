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
  private setCursor(cursor: string) {
    this.container.style.cursor = cursor
  }

  constructor() {
    super('div', {
      style: {
        position: 'absolute',
        zIndex: '2',
        cursor: 'grab',
        userSelect: 'none',
      },

      onpointerdown: () => {
        this.setCursor('grabbing')
      },

      onpointerup: () => {
        this.setCursor('')
        css(this.container, {
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
        this.setCursor('')
        this.emit('dragend', {})
      },
    )
  }

  render() {
    const { x, y } = this.props
    this.container.style.transform = `translate(${x}px, ${y}px)`
  }
}
