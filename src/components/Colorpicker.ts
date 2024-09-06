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
let datalist: HTMLDataListElement | null = null

type ColorpickerProps = {
  color: string
}

type ColorpickerEvents = {
  change: { color: string }
}

export class Colorpicker extends Component<ColorpickerProps, ColorpickerEvents> {
  constructor(styles?: Partial<CSSStyleDeclaration>) {
    if (!datalist) {
      datalist = el(
        'datalist',
        { id: 'colors' },
        PASTEL_COLORS.map((color) => el('option', { value: color })),
      )
      document.body.appendChild(datalist)
    }

    super('input', {
      // @ts-ignore
      type: 'color',
      value: PASTEL_COLORS[0],
      tabIndex: -1,
      oninput: () => {
        this.emit('change', { color: (this.container as HTMLInputElement).value })
      },
      onclick: (e: PointerEvent) => {
        e.stopPropagation()
      },
      style: {
        cursor: 'pointer',
        ...styles,
      },
    })

    this.container.setAttribute('list', datalist.id)
  }

  private getInput() {
    return this.container as HTMLInputElement
  }

  render({ color }: Partial<ColorpickerProps>) {
    this.getInput().value = color
  }
}
