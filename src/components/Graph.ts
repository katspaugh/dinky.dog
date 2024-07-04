import { Component } from '../lib/component.js'
import { Svg } from './Svg.js'
import { Pan, type PanEvents } from './Pan.js'
import { SelectionBox, type SelectionBoxEvents } from './SelectionBox.js'
import { onEvent } from '../lib/dom.js'

const WIDTH = 5000
const HEIGHT = 5000

export type GraphEvents = PanEvents &
  SelectionBoxEvents & {
    escape: {}
    delete: {}
  }

export class Graph extends Component<{}, GraphEvents> {
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

    selectionBox.on('select', (params) => {
      this.emit('select', params)
    })

    const unsubscribeKeydown = onEvent(document, 'keydown', (event) => {
      if (event.key === 'Escape') {
        this.emit('escape', {})
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        this.emit('delete', {})
      }
    })

    this.on('destroy', () => {
      unsubscribeKeydown()
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
