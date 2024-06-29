import { Component } from '../lib/component.js'

type CardProps = {
  content: HTMLElement
  background?: string
}

export class Card extends Component<CardProps, {}> {
  private lastBackground: string = ''

  constructor() {
    super('div', {
      style: {
        borderRadius: '4px',
        width: 'fit-content',
        boxShadow: '1px 1px #000',
        backgroundColor: 'var(--card-color)',
        transition: 'all 0.2s',
      },
    })
  }

  render() {
    this.container.append(this.props.content)

    if (this.props.background !== this.lastBackground) {
      this.lastBackground = this.props.background
      this.container.style.backgroundColor = this.lastBackground
    }
  }
}
