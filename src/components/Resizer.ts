import { Component } from '../lib/component.js'
import { draggable } from '../lib/draggable.js'

export type ResizerEvents = {
  resize: { dx: number; dy: number }
  resizeEnd: {}
}

type ResizerProps = {}

export class Resizer extends Component<ResizerProps, ResizerEvents> {
  constructor() {
    super('div', {
      style: {
        position: 'absolute',
        zIndex: '1',
        bottom: '2px',
        right: '2px',
        userSelect: 'none',
        width: '10px',
        height: '10px',
        background: 'linear-gradient(135deg, transparent 0%, transparent 50%, #999 50%, #999 100%)',
        cursor: 'nwse-resize',
        borderRadius: '0 0 2px 0',
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

  render() { }
}
