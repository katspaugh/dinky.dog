import { Component } from '../lib/component.js'

type CardProps = {
  color?: string
}

type CardEvents = {}

export class Card extends Component<CardProps, CardEvents> {
  private lastBackground: string = ''

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

  render() {
    const { color } = this.props
    if (color !== this.lastBackground) {
      this.lastBackground = color
      this.container.style.backgroundColor = color
    }
  }
}
