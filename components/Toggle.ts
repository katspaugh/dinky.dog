import { Component, el } from '../utils/dom.js'

export function Toggle(label = '') {
  const checkbox = el('input', { type: 'checkbox', style: { margin: '0' } })

  return Component({
    tag: 'label',

    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px',
      userSelect: 'none',
    },

    children: [checkbox, label],

    render: ({ checked, onChange }) => {
      if (checked != null) {
        checkbox.checked = checked
      }
      checkbox.onchange = () => {
        onChange(checkbox.checked)
      }
      if (!onChange) {
        checkbox.disabled = true
      }
    },
  })
}
