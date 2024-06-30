import { Component } from '../lib/component.js'
import { Svg } from './Svg.js'
import { Pan, type PanEvents } from './Pan.js'
import { SelectionBox, type SelectionBoxEvents } from './SelectionBox.js'

const WIDTH = 5000
const HEIGHT = 5000

export class Graph extends Component<{}, PanEvents & SelectionBoxEvents> {
  private svg: Svg
  private pan: Pan

  constructor() {
    const size = { width: WIDTH, height: HEIGHT }

    const svg = new Svg()
    svg.setProps(size)

    const pan = new Pan()
    pan.setProps(size)

    const selectionBox = new SelectionBox(pan.container)

    super(
      'div',
      {
        style: {
          position: 'absolute',
          left: '0',
          top: '0',
          width: '100vw',
          height: '100vh',
          overflow: 'auto',
        },
      },
      [pan.container, selectionBox.container],
    )

    pan.container.append(svg.container)

    this.svg = svg
    this.pan = pan

    pan.on('click', (params) => {
      this.emit('click', params)
    })

    pan.on('dblclick', (params) => {
      this.emit('dblclick', params)
    })

    pan.on('pointermove', (params) => {
      this.emit('pointermove', params)
    })

    pan.on('escape', () => {
      this.emit('escape', {})
    })

    selectionBox.on('select', (params) => {
      this.emit('select', params)
    })
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
