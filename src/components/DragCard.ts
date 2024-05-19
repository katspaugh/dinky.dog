import { Component } from '../lib/component.js'
import { Card } from './Card.js'
import { Connector, type ConnectorEvents } from './Connector.js'
import { Draggable, type DraggableEvents } from './Draggable.js'

type DragCardEvents = {
  click: {}
} & DraggableEvents &
  ConnectorEvents

export class DragCard extends Component<DragCardEvents> {
  private connector: Connector

  constructor({ x, y }: { x: number; y: number }) {
    const draggable = new Draggable()
    const card = new Card()
    const connector = new Connector()

    super(draggable.container, {
      onclick: (e: MouseEvent) => {
        e.preventDefault()
        this.emit('click', {})
      },

      ondblclick: (e: MouseEvent) => {
        e.stopPropagation()
      },
    })

    this.input.connect(draggable.input)
    this.input.connect(card.input)

    this.output = card.output
    this.connector = connector

    connector.output.connect(this.output)
    draggable.output.connect(this.output)

    draggable.container.appendChild(card.container)
    card.container.appendChild(connector.container)

    this.input.next({ x, y })
  }

  getConnectionPoint() {
    const rect = this.connector.container.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }
}
