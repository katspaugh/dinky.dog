import { Component } from '../lib/component.js'
import { sanitizeHtml } from '../lib/sanitize-html.js'

type EditableEvents = {
  input: { content: string }
}

type EditableProps = {
  content: string
  width?: number
  height?: number
}

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
      this.container.innerHTML = sanitizeHtml(content)
    }
    if (width != null) {
      this.container.style.width = `${width}px`
      this.container.style.maxWidth = ''
    }
    if (height != null) {
      this.container.style.height = `${height}px`
      this.container.style.maxHeight = ''
    }
  }

  focus() {
    this.container.focus()
  }

  blur() {
    this.container.blur()
  }
}
