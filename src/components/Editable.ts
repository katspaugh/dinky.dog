import { Component } from '../lib/component.js'
import { css } from '../lib/dom.js'
import { sanitizeHtml } from '../lib/sanitize-html.js'

type EditableEvents = {
  input: { content: string }
}

type EditableProps = {
  content: string
  width?: number | null
  height?: number | null
}

const ABS_MIN_WIDTH = 70
const ABS_MIN_HEIGHT = 37

export class Editable extends Component<EditableProps, EditableEvents> {
  private lastContent = ''

  constructor() {
    super('div', {
      contentEditable: 'true',

      style: {
        whiteSpace: 'pre-wrap',
        overflowWrap: 'break-word',
        borderRadius: '4px',
        border: '1px solid #333',
        padding: '8px',
        paddingRight: '20px',
        minWidth: '160px',
        minHeight: '70px',
        maxWidth: '300px',
        maxHeight: '300px',
        overflowY: 'auto',
        fontFamily: 'sans-serif',
      },

      oninput: () => {
        this.updateContent(this.container.innerHTML)
      },

      onblur: () => {
        this.updateContent(sanitizeHtml(this.container.innerHTML))
      },

      onkeydown: (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          this.container.blur()
        }
      },
    })
  }

  private updateContent(content: string) {
    this.lastContent = content
    this.emit('input', { content })
  }

  render() {
    const { content, width, height } = this.props

    if (content !== this.lastContent) {
      this.lastContent = content
      this.container.innerHTML = sanitizeHtml(content ?? '')
    }

    if (width !== undefined) {
      const reset = width === null
      css(this.container, {
        width: reset ? '' : `${width}px`,
        maxWidth: 'none',
        minWidth: `${ABS_MIN_WIDTH}px`,
      })
    }

    if (height !== undefined) {
      const reset = height === null
      css(this.container, {
        height: reset ? '' : `${height}px`,
        maxHeight: 'none',
        minHeight: `${ABS_MIN_HEIGHT}px`,
      })
    }
  }

  getSize() {
    return {
      width: this.container.offsetWidth,
      height: this.container.offsetHeight,
    }
  }

  focus() {
    this.container.focus()
  }

  blur() {
    this.container.blur()
  }
}
