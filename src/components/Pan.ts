import { Component } from '../lib/component.js'
import { getRelativeCoords } from '../lib/dom.js'

export type PanEvents = {
  click: { x: number; y: number }
  dblclick: { x: number; y: number }
  pointermove: { x: number; y: number }
}

type PanProps = {
  width: number
  height: number
}

export class Pan extends Component<PanProps, PanEvents> {
  constructor({ width, height }: { width: number; height: number }) {
    super('div', {
      style: {
        position: 'absolute',
        backgroundImage: 'radial-gradient(circle, #555 1px, transparent 1px)',
        backgroundColor: 'var(--overlay-color)',
        backgroundSize: '30px 30px',
        cursor: 'crosshair',
        width: `${width}px`,
        height: `${height}px`,
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
    })
  }
}
