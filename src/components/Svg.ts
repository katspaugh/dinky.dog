import { Component } from '../lib/component.js'
import { svgEl } from '../lib/dom.js'

type SvgProps = {
  width: number
  height: number
}

export class Svg extends Component<SvgProps, {}> {
  constructor() {
    const svg = svgEl('svg')

    super(svg as unknown as HTMLElement, {
      style: {
        position: 'absolute',
        pointerEvents: 'none',
      },
    })
  }

  render() {
    const { width, height } = this.props
    this.container.setAttribute('viewBox', `0 0 ${width} ${height}`)
    this.container.style.width = `${width}px`
    this.container.style.height = `${height}px`
  }
}
