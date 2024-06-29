import { Component } from '../lib/component.js'
import { Card, type CardEvents } from './Card.js'
import { Connector } from './Connector.js'
import { Draggable, type DraggableEvents } from './Draggable.js'

type DragCardProps = {
  x: number
  y: number
  background?: string
  content?: HTMLElement
}

type DragCardEvents = DraggableEvents &
  CardEvents & {
    render: {}
    click: {}
    connectorClick: {}
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
        this.emit('click', {})
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

    this.card.on('backgroundChange', ({ background }) => {
      this.emit('backgroundChange', { background })
    })

    draggable.on('drag', (params) => {
      this.emit('drag', params)
    })

    draggable.on('dragstart', (params) => {
      this.emit('dragstart', params)

      // Remove selection
      window.getSelection()?.removeAllRanges()
    })

    this.on('destroy', () => {
      draggable.destroy()
      card.destroy()
      connector.destroy()
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

  setProps(props: Partial<DragCardProps>) {
    super.setProps(props)
    const { content, x, y, background } = props

    if (content) {
      this.card.setProps({ content })
    }
    if (x !== undefined || y !== undefined) {
      this.draggable.setProps({ x, y })
    }
    if (background) {
      this.card.setProps({ background })
    }
  }
}
