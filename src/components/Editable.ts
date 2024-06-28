import { Component } from '../lib/component.js'

type EditableEvents = {
  input: { content: string }
}

type EditableProps = {
  content: string
}

export class Editable extends Component<EditableProps, EditableEvents> {
  private lastContent: string

  constructor() {
    super('div', {
      contentEditable: 'true',

      style: {
        borderRadius: '4px',
        border: '1px solid red',
        boxSizing: 'border-box',
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
        const content = this.container.innerHTML
        this.lastContent = content
        this.emit('input', { content })
      },

      onkeydown: (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          this.container.blur()
        }
      },
    })

    this.lastContent = ''
  }

  render(props: EditableProps) {
    if (props.content !== this.lastContent) {
      this.lastContent = props.content
      this.container.innerHTML = props.content
    }
  }

  focus() {
    this.container.focus()
  }
}
