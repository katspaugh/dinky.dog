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

  render(props: SvgProps) {
    this.container.setAttribute('viewBox', `0 0 ${props.width} ${props.height}`)
    this.container.style.width = `${props.width}px`
    this.container.style.height = `${props.height}px`
  }
}
