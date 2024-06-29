import { Component } from '../lib/component.js'
import { getRelativeCoords } from '../lib/dom.js'

export type PanEvents = {
  click: { x: number; y: number }
  dblclick: { x: number; y: number }
  pointermove: { x: number; y: number }
  escape: {}
}

type PanProps = {
  width: number
  height: number
}

export class Pan extends Component<PanProps, PanEvents> {
  constructor() {
    super('div', {
      style: {
        position: 'absolute',
        backgroundImage: 'radial-gradient(circle, #555 1px, transparent 1px)',
        backgroundColor: 'var(--overlay-color)',
        backgroundSize: '30px 30px',
        cursor: 'crosshair',
      },

      onclick: (e: MouseEvent) => {
        this.emit('click', getRelativeCoords(e))
      },

      ondblclick: (e: MouseEvent) => {
        this.emit('dblclick', getRelativeCoords(e))
      },

      onpointermove: (e: PointerEvent) => {
        this.emit('pointermove', getRelativeCoords(e))
      },

      onkeydown: (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          this.emit('escape', {})
        }
      },
    })
  }

  render() {
    const { width, height } = this.props
    this.container.style.width = `${width}px`
    this.container.style.height = `${height}px`
  }
}
