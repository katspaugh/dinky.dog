// Paster colors
const PASTEL_COLORS = [
  '#F9F9F9', // the default color
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

let _datalist

export function Colorwheel() {
  const container = document.createElement('label')
  const input = document.createElement('input')
  input.type = 'color'
  input.tabIndex = 2
  input.setAttribute('list', 'colors')
  container.appendChild(input)

  if (!_datalist) {
    _datalist = document.createElement('datalist')
    _datalist.id = 'colors'
    for (const color of PASTEL_COLORS) {
      const option = document.createElement('option')
      option.value = color
      _datalist.appendChild(option)
    }
    document.body.appendChild(_datalist)
  }

  return {
    container,

    render: ({ color, onChange }) => {
      input.value = color

      if (onChange) {
        input.oninput = () => {
          onChange(input.value)
        }
      }

      return container
    },

    destroy: () => container.remove(),
  }
}
