import { Component } from '../lib/component.js'
import { svgEl } from '../lib/dom.js'

type SvgProps = {
  width: number
  height: number
}

export class Svg extends Component<SvgProps, {}> {
  constructor({ width, height }: { width: number; height: number }) {
    const svg = svgEl('svg')

    super(svg as unknown as HTMLElement, {
      style: {
        position: 'absolute',
        pointerEvents: 'none',
        width: `${width}px`,
        height: `${height}px`,
      },
    })

    this.container.setAttribute('viewBox', `0 0 ${width} ${height}`)
  }
}
