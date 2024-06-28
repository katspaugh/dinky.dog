import { Component } from '../lib/component.js'

type CardProps = {
  content: HTMLElement
}

export class Card extends Component<CardProps, {}> {
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

  render(props: CardProps) {
    if (props.content !== undefined) {
      this.container.append(props.content)
    }
  }
}
