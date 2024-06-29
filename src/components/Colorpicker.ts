import { Component } from '../lib/component.js'
import { el } from '../lib/dom.js'

// Paster colors
const PASTEL_COLORS = [
  '#F9F9F9',
  '#ffe8ed',
  '#d6e2e7',
  '#bbeebb',
  '#fefeca',
  '#e1d8f0',
  '#ffd9a3',
  '#d9f3e6',
  '#BFE8FE',
  '#fff2d9',
]

// Share the same datalist for all colorwheels
let _datalist: HTMLDataListElement | null = null

type ColorpickerProps = {
  color: string
}

type ColorpickerEvents = {
  change: { color: string }
}

export class Colorpicker extends Component<ColorpickerProps, ColorpickerEvents> {
  constructor() {
    if (!_datalist) {
      _datalist = el(
        'datalist',
        { id: 'colors' },
        PASTEL_COLORS.map((color) => el('option', { value: color })),
      )
      document.body.appendChild(_datalist)
    }

    super('input', {
      // @ts-ignore
      type: 'color',
      value: PASTEL_COLORS[0],
      tabIndex: 2,
      oninput: () => {
        this.emit('change', { color: (this.container as HTMLInputElement).value })
      },
    })

    this.container.setAttribute('list', _datalist.id)
  }

  render() {
    ; (this.container as HTMLInputElement).value = this.props.color
  }
}
