import { Component, el } from '../utils/dom.js'

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

export function Colorwheel({
  onChange,
  style,
}: {
  onChange: (color: string) => void
  style?: Partial<CSSStyleDeclaration>
}) {
  if (!_datalist) {
    _datalist = el(
      'datalist',
      { id: 'colors' },
      PASTEL_COLORS.map((color) => el('option', { value: color })),
    )
    document.body.appendChild(_datalist)
  }

  const input = el('input', {
    type: 'color',
    tabIndex: 2,
    oninput: () => {
      onChange(input.value)
    },
  })

  input.setAttribute('list', 'colors')

  return Component({
    style,

    children: [input],

    render: ({ color }) => {
      if (color && color !== input.value) {
        input.value = color
      }
    },
  })
}
