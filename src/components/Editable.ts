import { Component } from '../lib/component.js'

type EditableEvents = { input: { content: string } }

export class Editable extends Component<EditableEvents> {
  constructor({ content }: { content: string }) {
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
        this.emit('input', { content: this.container.innerHTML })
      },

      onkeydown: (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          this.container.blur()
        }
      },
    })

    this.input.next({ content })
  }

  render(props: { content: string }) {
    if (props.content !== undefined) {
      this.container.innerHTML = props.content
    }
  }
}
