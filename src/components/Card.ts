import { Component } from '../lib/component.js'

type CardProps = {
  color?: string
}

type CardEvents = {}

export class Card extends Component<CardProps, CardEvents> {
  constructor() {
    super('div', {
      style: {
        position: 'relative',
        borderRadius: '4px',
        width: 'fit-content',
        boxShadow: '1px 1px #777',
        backgroundColor: 'var(--card-color)',
        transition: 'all 0.2s',
      },
    })
  }

  render({ color }: Partial<CardProps>) {
    this.container.style.backgroundColor = color
  }
}
