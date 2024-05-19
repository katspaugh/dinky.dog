import { Component } from '../lib/component.js'
import { Card } from './Card.js'
import { Connector } from './Connector.js'
import { Draggable } from './Draggable.js'

export class DragCard extends Component {
  private connector: Connector

  constructor() {
    const draggable = new Draggable()
    const card = new Card()
    const connector = new Connector()

    super(draggable.container, {
      onclick: (e: MouseEvent) => {
        e.preventDefault()
        this.output.next({ event: 'click' })
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
  }

  getConnectionPoint() {
    const rect = this.connector.container.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }
}
