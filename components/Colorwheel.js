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
  '#f2f2fc',
  '#fff2d9',
]

// Share the same datalist for all colorwheels
let _datalist

export function Colorwheel({ onChange }) {
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
    oninput: (e) => {
      onChange(e.target.value)
    },
  })

  input.setAttribute('list', 'colors')

  return Component({
    children: [input],

    render: ({ color }) => {
      if (color && color !== input.value) {
        input.value = color
      }
    },
  })
}
