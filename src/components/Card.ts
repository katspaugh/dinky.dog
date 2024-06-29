import { Component } from '../lib/component.js'
import { Colorpicker } from './Colorpicker.js'

type CardProps = {
  content: HTMLElement
  background?: string
}

export type CardEvents = {
  backgroundChange: { background: string }
}

class ColorpickerWrapper extends Component<{}, {}> {
  public colorpicker: Colorpicker

  constructor() {
    const colorpicker = new Colorpicker()

    super(colorpicker.container, {
      style: {
        opacity: '0',
        position: 'absolute',
        zIndex: '3',
        top: '-3px',
        right: '0',
        transform: 'translate(0, -100%)',
        transition: 'opacity 0.2s 0.1s',
        pointerEvents: 'all',
        width: '50px',
        height: '20px',
        padding: '0',
        border: 'none',
        borderRadius: '2px',
        backgroundColor: 'var(--card-color)',
      },
    })

    this.colorpicker = colorpicker
  }
}

export class Card extends Component<CardProps, CardEvents> {
  private lastBackground: string = ''
  private colorpicker: Colorpicker

  constructor() {
    const colorpickerWrapper = new ColorpickerWrapper()

    super(
      'div',
      {
        style: {
          position: 'relative',
          borderRadius: '4px',
          width: 'fit-content',
          boxShadow: '1px 1px #000',
          backgroundColor: 'var(--card-color)',
          transition: 'all 0.2s',
        },
      },
      [colorpickerWrapper.container],
    )

    this.colorpicker = colorpickerWrapper.colorpicker

    this.colorpicker.on('change', ({ color }) => {
      this.emit('backgroundChange', { background: color })
    })
  }

  setProps(props: Partial<CardProps>) {
    super.setProps(props)

    if (props.background) {
      this.colorpicker.setProps({ color: props.background })
    }
  }

  render() {
    this.container.append(this.props.content)

    if (this.props.background !== this.lastBackground) {
      this.lastBackground = this.props.background
      this.container.style.backgroundColor = this.lastBackground
    }
  }
}
