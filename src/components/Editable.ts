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

  render(props: EditableProps) {
    if (props.content !== this.lastContent) {
      this.lastContent = props.content
      this.container.innerHTML = sanitizeHtml(props.content)
    }
    if (props.width != null) {
      this.container.style.width = `${props.width}px`
    }
    if (props.height != null) {
      this.container.style.height = `${props.height}px`
    }
  }

  focus() {
    this.container.focus()
  }
}
