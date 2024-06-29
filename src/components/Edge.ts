import { Component } from '../lib/component.js'
import { svgEl } from '../lib/dom.js'

type EdgeProps = {
  x1: number
  y1: number
  x2: number
  y2: number
}

type EdgeEvents = {
  position: EdgeProps
  click: {}
}

export class Edge extends Component<EdgeProps, EdgeEvents> {
  constructor() {
    const path = svgEl('path')

    super(path as unknown as HTMLElement, {
      style: {
        stroke: 'blue',
        strokeWidth: '4px',
        fill: 'none',
        transition: 'stroke-width 0.2s',
        pointerEvents: 'all',
        cursor: 'pointer',
      },

      onclick: () => {
        this.emit('click', {})
      },
    })
  }

  render() {
    const { x1, y1, x2, y2 } = this.props
    this.container.setAttribute('d', `M ${x1} ${y1} C ${x1 + 100} ${y1} ${x2 - 100} ${y2} ${x2} ${y2}`)
    this.emit('position', this.props)
  }
}
