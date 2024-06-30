import { Component } from '../lib/component.js'
import { css } from '../lib/dom.js'
import { Card } from './Card.js'
import { CardColorpicker } from './CardColorpicker.js'
import { Connector } from './Connector.js'
import { Draggable, type DraggableEvents } from './Draggable.js'
import { Editable } from './Editable.js'
import { Resizer, ResizerEvents } from './Resizer.js'

const MIN_BG_WIDTH = 400
const MIN_BG_HEIGHT = 400

export type DragCardProps = {
  x: number
  y: number
  width?: number
  height?: number
  background?: string
  content?: string
}

type DragCardEvents = DraggableEvents &
  ResizerEvents & {
    render: {}
    click: {}
    connectorClick: {}
    backgroundChange: { background: string }
    contentChange: { content: string }
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

    super(
      draggable.container,
      {
        onclick: (e: MouseEvent) => {
          e.preventDefault()
          this.emit('click', {})
        },

        ondblclick: (e: MouseEvent) => {
          e.stopPropagation()
        },
      },
      [resizer.container, connector.container, card.container, colorpicker.container],
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

    colorpicker.on('change', ({ color }) => {
      this.emit('backgroundChange', { background: color })
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
      connector.destroy()
      resizer.destroy()
      colorpicker.destroy()
      editor.destroy()
      card.destroy()
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
    const { content, x, y, background, width, height } = props

    if (x !== undefined || y !== undefined) {
      this.draggable.setProps({ x, y })
    }
    if (background !== undefined) {
      this.colorpicker.setProps({ color: background })
      this.card.setProps({ background })
    }
    if (content !== undefined) {
      this.editor.setProps({ content })
    }
    if (width !== undefined || height !== undefined) {
      this.editor.setProps({ width, height })
    }
  }

  render() {
    const isBackgroundCard =
      this.props.background && this.props.width >= MIN_BG_WIDTH && this.props.height >= MIN_BG_HEIGHT
    if (isBackgroundCard !== this.lastBackgroundCheck) {
      this.lastBackgroundCheck = isBackgroundCard
      css(this.container, {
        opacity: isBackgroundCard ? '0.5' : '',
        zIndex: isBackgroundCard ? '-1' : '',
      })
    }
  }

  getSize = () => this.editor.getSize()
  focus = () => this.editor.focus()
  blur = () => this.editor.blur()
}
