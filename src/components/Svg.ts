import { Component } from '../lib/component.js'
import { svgEl } from '../lib/dom.js'

export class Svg extends Component {
  constructor({ width, height }: { width: number; height: number }) {
    const svg = svgEl('svg')

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)

    super(svg as unknown as HTMLElement, {
      style: {
        position: 'absolute',
        pointerEvents: 'none',
        width: `${width}px`,
        height: `${height}px`,
      },
    })
  }
}
