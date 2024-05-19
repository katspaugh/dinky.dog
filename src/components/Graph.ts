import { Component } from '../lib/component.js'
import { Svg } from './Svg.js'
import { Pan, type PanEvents } from './Pan.js'

const WIDTH = 5000
const HEIGHT = 5000

export class Graph extends Component<PanEvents> {
  private svg: Svg
  private pan: Pan

  constructor() {
    super('div', {
      style: {
        position: 'absolute',
        left: '0',
        top: '0',
        width: '100vw',
        height: '100vh',
        overflow: 'auto',
        backgroundImage: 'radial-gradient(circle, #555 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        cursor: 'crosshair',
      },
    })

    this.svg = new Svg({ width: WIDTH, height: HEIGHT })
    this.pan = new Pan({ width: WIDTH, height: HEIGHT })

    this.container.append(this.svg.container)
    this.container.append(this.pan.container)

    this.pan.output.connect(this.output)
  }

  render(props: { card: HTMLElement; edge: HTMLElement }) {
    if (props.card !== undefined) {
      this.pan.container.append(props.card)
    }

    if (props.edge !== undefined) {
      this.svg.container.append(props.edge)
    }
  }

  public getOffset() {
    return this.pan.container.getBoundingClientRect()
  }
}
