import { Component } from '../lib/component.js'

type CardProps = {
  content: HTMLElement
  background?: string
}

type CardEvents = {}

export class Card extends Component<CardProps, CardEvents> {
  private lastBackground: string = ''
  private lastContent: HTMLElement

  constructor() {
    super('div', {
      style: {
        position: 'relative',
        borderRadius: '4px',
        width: 'fit-content',
        boxShadow: '1px 1px #000',
        backgroundColor: 'var(--card-color)',
        transition: 'all 0.2s',
      },
    })
  }

  render() {
    const { content, background } = this.props

    if (content && content !== this.lastContent) {
      this.lastContent = content
      this.container.append(content)
    }

    if (background !== this.lastBackground) {
      this.lastBackground = background
      this.container.style.backgroundColor = background
    }
  }
}
