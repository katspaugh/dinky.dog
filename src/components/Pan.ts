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

  render(props: PanProps) {
    this.container.style.width = `${props.width}px`
    this.container.style.height = `${props.height}px`
  }
}
