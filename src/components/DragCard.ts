import { Component } from '../lib/component.js'
import { css } from '../lib/dom.js'
import { type NodeProps } from './App.js'
import { Card } from './Card.js'
import { CardColorpicker } from './CardColorpicker.js'
import { Connector } from './Connector.js'
import { Draggable, type DraggableEvents } from './Draggable.js'
import { Editable } from './Editable.js'
import { Resizer, ResizerEvents } from './Resizer.js'

const BG_THRESHOLD = 110e3

export type DragCardProps = NodeProps & {
  selected?: boolean
}

type DragCardEvents = DraggableEvents &
  ResizerEvents & {
    render: {}
    click: {}
    connectorClick: {}
    colorChange: { color: string }
    contentChange: { content: string }
  }

class CardWrapper extends Component<{}, {}> {
  constructor(children: Component<{}, {}>[]) {
    super(
      'div',
      {
        style: {
          transition: 'transform 0.2s, box-shadow 0.2s',
          borderRadius: 'inherit',
        },
      },
      children,
    )
  }
}

export class DragCard extends Component<DragCardProps, DragCardEvents> {
  private connector: Connector
  private draggable: Draggable
  private card: Card
  private colorpicker: CardColorpicker
  private editor: Editable
  private lastBackgroundCheck: boolean

  constructor() {
    const draggable = new Draggable()
    const card = new Card()
    const connector = new Connector()
    const resizer = new Resizer()
    const colorpicker = new CardColorpicker()
    const editor = new Editable()

    const wrapper = new CardWrapper([card, connector, resizer, colorpicker])

    super(
      draggable.container,
      {
        style: {
          borderRadius: '4px',
        },
        onclick: (e: MouseEvent) => {
          e.preventDefault()
          this.emit('click', {})
        },

        ondblclick: (e: MouseEvent) => {
          e.stopPropagation()
        },
      },
      [wrapper],
    )

    card.container.append(editor.container)

    this.connector = connector
    this.draggable = draggable
    this.card = card
    this.colorpicker = colorpicker
    this.editor = editor

    connector.on('click', () => {
      this.emit('connectorClick', {})
    })

    colorpicker.on('change', (params) => {
      this.emit('colorChange', params)
    })

    draggable.on('drag', (params) => {
      this.emit('drag', params)
    })

    draggable.on('dragstart', (params) => {
      this.emit('dragstart', params)
      window.getSelection()?.removeAllRanges()
    })

    draggable.on('dragend', (params) => {
      this.emit('dragend', params)
    })

    resizer.on('resize', ({ dx, dy }) => {
      this.emit('resize', { dx, dy })
    })

    resizer.on('resizeEnd', () => {
      this.emit('resizeEnd', {})
    })

    resizer.on('resizeReset', () => {
      this.emit('resizeReset', {})
    })

    editor.on('input', (params) => {
      this.emit('contentChange', params)
    })

    this.on('destroy', () => {
      draggable.destroy()
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
    const { content, x, y, color, width, height } = props

    if (x !== undefined || y !== undefined) {
      this.draggable.setProps({ x, y })
    }
    if (color !== undefined) {
      this.colorpicker.setProps({ color })
      this.card.setProps({ color })
    }
    if (content !== undefined) {
      this.editor.setProps({ content })
    }
    if (width !== undefined || height !== undefined) {
      this.editor.setProps({ width, height })
    }
  }

  render(newProps: Partial<DragCardProps>) {
    const isBackgroundCard = this.props.color && this.props.width * this.props.height >= BG_THRESHOLD
    if (isBackgroundCard !== this.lastBackgroundCheck) {
      this.lastBackgroundCheck = isBackgroundCard
      css(this.container, {
        opacity: isBackgroundCard ? '0.6' : '',
        zIndex: isBackgroundCard ? '1' : '',
      })
    }

    if (newProps.selected !== undefined) {
      css(this.container, {
        outline: newProps.selected ? '2px solid rgba(100, 0, 100, 0.7)' : '',
      })
    }
  }

  getSize = () => this.editor.getSize()
  focus = () => this.editor.focus()
  blur = () => this.editor.blur()
}
