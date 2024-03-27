import { Component, el } from '../utils/dom.js'

// Paster colors
const PASTEL_COLORS = [
  '#F9F9F9',
  '#EDF9FF',
  '#FBE9ED',
  '#BFE8FE',
  '#FFFFE9',
  '#E8FFE9',
  '#E7FFFF',
  '#FADAAA',
  '#E0D9EE',
  '#C6ECC0',
]

// Share the same datalist for all colorwheels
let _datalist

export function Colorwheel({ onChange, style }) {
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
    style,

    children: [input],

    render: ({ color }) => {
      if (color && color !== input.value) {
        input.value = color
      }
    },
  })
}
