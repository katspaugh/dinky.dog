import { Component } from '../lib/component.js'

export class Editable extends Component {
  constructor() {
    super('div', {
      contentEditable: 'true',

      style: {
        borderRadius: '4px',
        border: '1px solid red',
        padding: '8px',
        paddingRight: '20px',
        minWidth: '200px',
        maxWidth: '300px',
        minHeight: '80px',
        maxHeight: '300px',
        overflowY: 'auto',
        fontFamily: 'sans-serif',
      },

      oninput: () => {
        this.output.next({ content: this.container.innerHTML })
      },
    })
  }

  render(props: { content: string }) {
    if (props.content !== undefined) {
      this.container.innerHTML = props.content
    }
  }
}
