import { Component } from '../lib/component.js'
import { svgEl } from '../lib/dom.js'

export class Edge extends Component {
  private x1: number | undefined
  private y1: number | undefined
  private x2: number | undefined
  private y2: number | undefined

  constructor() {
    const path = svgEl('path')

    super(path as unknown as HTMLElement, {
      style: {
        stroke: 'blue',
        strokeWidth: '4px',
        fill: 'none',
      },
    })
  }

  render(props: { x1: number; y1: number; x2: number; y2: number }) {
    this.x1 = props.x1 ?? this.x1
    this.y1 = props.y1 ?? this.y1
    this.x2 = props.x2 ?? this.x2
    this.y2 = props.y2 ?? this.y2
    this.container.setAttribute(
      'd',
      `M ${this.x1} ${this.y1} C ${this.x1 + 100} ${this.y1} ${this.x2 - 100} ${this.y2} ${this.x2} ${this.y2}`,
    )

    this.output.next({ x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2 })
  }
}
