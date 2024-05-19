import { Component } from '../lib/component.js'
import { getRelativeCoords } from '../lib/dom.js'

export type PanEvents = {
  click: { x: number; y: number }
  dblclick: { x: number; y: number }
  pointermove: { x: number; y: number }
  escape: {}
}

export class Pan extends Component<PanEvents> {
  constructor({ width, height }: { width: number; height: number }) {
    super('div', {
      style: {
        position: 'absolute',
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

      onkeydown: (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          this.emit('escape', {})
        }
      },
    })
  }
}
