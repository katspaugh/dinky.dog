import { Component } from '../lib/component.js'

type CardProps = {
  content: HTMLElement
}

export class Card extends Component<CardProps, {}> {
  constructor() {
    super('div', {
      style: {
        borderRadius: '4px',
        width: 'fit-content',
        boxShadow: '1px 1px #000',
      },
    })
  }

  render() {
    this.container.append(this.props.content)
  }
}
