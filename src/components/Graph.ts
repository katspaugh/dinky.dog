import { Component } from '../lib/component.js'
import { Svg } from './Svg.js'
import { Pan, type PanEvents } from './Pan.js'

const WIDTH = 5000
const HEIGHT = 5000

export class Graph extends Component<{}, PanEvents> {
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
      },
    })

    this.svg = new Svg()
    this.svg.setProps({ width: WIDTH, height: HEIGHT })
    this.pan = new Pan()
    this.pan.setProps({ width: WIDTH, height: HEIGHT })

    this.pan.container.append(this.svg.container)
    this.container.append(this.pan.container)

    this.on = this.pan.on.bind(this.pan)
  }

  renderCard(card: HTMLElement) {
    this.pan.container.append(card)
  }

  renderEdge(edge: HTMLElement) {
    this.svg.container.append(edge)
  }

  public getOffset() {
    return this.pan.container.getBoundingClientRect()
  }
}
