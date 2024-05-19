import { Component } from '../lib/component.js'

export class Card extends Component {
  constructor() {
    super('div', {
      style: {
        borderRadius: '4px',
        backgroundColor: '#f5f5f5',
        opacity: '0.9',
        width: 'fit-content',
        boxSizing: 'border-box',
      },
    })
  }

  render(props: { content: HTMLElement }) {
    if (props.content !== undefined) {
      this.container.append(props.content)
    }
  }
}
