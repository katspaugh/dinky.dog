import { Component } from '../lib/component.js'
import { Card } from './Card.js'
import { Connector } from './Connector.js'
import { Draggable } from './Draggable.js'

type DragCardEvents = {
  click: {}
  connectorClick: {}
  drag: { dx: number; dy: number }
  dragstart: { x: number; y: number }
}

type DragCardProps = {
  x: number
  y: number
  content?: HTMLElement
}

export class DragCard extends Component<DragCardProps, DragCardEvents> {
  private connector: Connector
  private draggable: Draggable
  private card: Card

  constructor() {
    const draggable = new Draggable()
    const card = new Card()
    const connector = new Connector()

    super(draggable.container, {
      onclick: (e: MouseEvent) => {
        e.preventDefault()
        this.emit('click')
      },

      ondblclick: (e: MouseEvent) => {
        e.stopPropagation()
      },
    })

    draggable.container.appendChild(card.container)
    card.container.appendChild(connector.container)

    this.connector = connector
    this.draggable = draggable
    this.card = card

    this.connector.on('click', () => {
      this.emit('connectorClick', {})
    })

    draggable.on('drag', ({ dx, dy }) => {
      this.emit('drag', { dx, dy })
    })

    draggable.on('dragstart', ({ x, y }) => {
      this.emit('dragstart', { x, y })
    })
  }

  getInPoint() {
    const rect = this.container.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  getOutPoint() {
    const rect = this.connector.container.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }

  render(props: DragCardProps) {
    this.card.render({ content: props.content })
    this.draggable.render({ x: props.x, y: props.y })
  }
}
