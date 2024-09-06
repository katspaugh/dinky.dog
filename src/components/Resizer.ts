import { Component } from '../lib/component.js'
import { draggable } from '../lib/draggable.js'

export type ResizerEvents = {
  resize: { dx: number; dy: number }
  resizeEnd: {}
  resizeReset: {}
}

type ResizerProps = {}

export class Resizer extends Component<ResizerProps, ResizerEvents> {
  constructor() {
    super('div', {
      style: {
        position: 'absolute',
        zIndex: '1',
        bottom: '0',
        right: '0',
        userSelect: 'none',
        width: '100%',
        height: '4px',
        cursor: 'ns-resize',
        borderRadius: '0 0 2px 0',
      },

      ondblclick: (e: MouseEvent) => {
        e.preventDefault()
        this.emit('resizeReset', {})
      },
    })

    draggable(
      this.container,
      (dx, dy) => {
        this.emit('resize', { dx, dy })
      },
      undefined,
      () => {
        this.emit('resizeEnd', {})
      },
    )
  }
}
